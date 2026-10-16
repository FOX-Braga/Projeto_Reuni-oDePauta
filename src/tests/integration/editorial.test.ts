import { beforeAll, afterAll, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { NextRequest } from "next/server";
import { createUser, login, sessionUser, logout } from "@/features/auth/service";
import { getDb, migrate } from "@/lib/db";
import {
  createAssignment,
  updateAssignment,
  listAssignments,
} from "@/features/assignments/service";
import {
  createStory,
  updateStory,
  transitionStory,
  restoreVersion,
  versions,
  publicStory,
  publishScheduled,
  listStories,
} from "@/features/stories/service";
import { createSource, listSources } from "@/features/sources/service";
import { POST, GET } from "@/app/api/v1/[...path]/route";
import type { User, Assignment } from "@/types/domain";
let directory: string,
  reporter: User,
  other: User,
  editor: User,
  admin: User,
  assignment: Assignment;
const password = randomUUID() + randomUUID();
function readyStory() {
  let s = createStory(reporter, {
    title: "Cobertura da cidade em transformação",
    desk: "Política",
    assignment_id: assignment.id,
  });
  s = updateStory(reporter, s.id, {
    title: s.title,
    subtitle: "Um olhar sobre as mudanças",
    body: "Informações confirmadas e contextualizadas para uma cobertura jornalística completa.",
    tags: "cidade",
    seo_description: "Entenda os fatos e o contexto desta cobertura jornalística.",
    version: s.version,
    embargo: null,
    sensitive: false,
  });
  s = transitionStory(reporter, s.id, { target: "writing", version: s.version });
  s = transitionStory(reporter, s.id, { target: "review", version: s.version });
  return transitionStory(editor, s.id, { target: "approved", version: s.version });
}
beforeAll(() => {
  directory = mkdtempSync(join(tmpdir(), "newsroom-test-"));
  process.env.DATABASE_PATH = join(directory, "test.sqlite");
  process.env.APP_ORIGIN = "http://localhost:3000";
  reporter = createUser({
    name: "Repórter Teste",
    email: "reporter@example.test",
    password,
    role: "reporter",
    desk: "Política",
  });
  other = createUser({
    name: "Outro Repórter",
    email: "other@example.test",
    password,
    role: "reporter",
    desk: "Economia",
  });
  editor = createUser({
    name: "Editor Teste",
    email: "editor@example.test",
    password,
    role: "editor",
    desk: "Política",
  });
  admin = createUser({
    name: "Admin Teste",
    email: "admin@example.test",
    password,
    role: "admin",
    desk: "Política",
  });
  assignment = createAssignment(editor, {
    title: "Cobertura de políticas públicas",
    briefing: "Apurar dados, entrevistar responsáveis e verificar evidências.",
    desk: "Política",
    priority: "high",
    assignee_id: reporter.id,
    editor_id: editor.id,
    deadline: new Date(Date.now() + 86400000).toISOString(),
  });
});
afterAll(() => {
  getDb().close();
  rmSync(directory, { recursive: true, force: true });
});
describe("Banco e autenticação reais", () => {
  it("migrations são reaplicáveis sem perda e foreign keys estão ativas", () => {
    migrate(getDb());
    expect(Number(getDb().prepare("PRAGMA foreign_keys").get()?.foreign_keys)).toBe(1);
    expect(() =>
      getDb().prepare("INSERT INTO sessions VALUES ('x','inexistente',1,'now')").run(),
    ).toThrow();
  });
  it("sessão pode ser revogada imediatamente", () => {
    const s = login(reporter.email, password);
    expect(sessionUser(s.token)?.id).toBe(reporter.id);
    logout(s.token);
    expect(sessionUser(s.token)).toBeNull();
  });
  it("auditoria não pode ser alterada", () => {
    expect(() => getDb().prepare("UPDATE audit_events SET reason='alterado'").run()).toThrow(
      /immutable/,
    );
    expect(() => getDb().prepare("DELETE FROM audit_events").run()).toThrow(/immutable/);
  });
});
describe("Fluxo editorial persistente", () => {
  it("pauta persiste, gera notificação somente para o atribuído e detecta concorrência", () => {
    expect(listAssignments(reporter).some((a) => a.id === assignment.id)).toBe(true);
    expect(listAssignments(other)).toEqual([]);
    expect(
      getDb()
        .prepare("SELECT user_id FROM notifications WHERE href=?")
        .get(`/pautas/${assignment.id}`)?.user_id,
    ).toBe(reporter.id);
    const updated = updateAssignment(editor, assignment.id, { ...assignment, status: "reporting" });
    expect(updated.version).toBe(2);
    expect(() =>
      updateAssignment(editor, assignment.id, { ...assignment, status: "writing" }),
    ).toThrow(/alterada/);
  });
  it("aprova, publica snapshot e preserva público durante nova redação", () => {
    const s = readyStory();
    const published = transitionStory(editor, s.id, { target: "published", version: s.version });
    expect(publicStory(s.slug)?.body).toBe(s.body);
    const writing = transitionStory(editor, s.id, {
      target: "writing",
      version: published.version,
    });
    const edited = updateStory(reporter, s.id, {
      ...writing,
      body: "Rascunho privado com novos fatos ainda não aprovados para publicação.",
      sensitive: false,
    });
    expect(publicStory(s.slug)?.body).toBe(s.body);
    expect(edited.approved_version).toBeNull();
    expect(listStories(admin)).toEqual([]);
    expect(listStories(other)).toEqual([]);
  });
  it("restauração cria nova versão, mantendo todas as anteriores", () => {
    const s = readyStory(),
      writing = transitionStory(editor, s.id, { target: "writing", version: s.version });
    const restored = restoreVersion(reporter, s.id, 1, writing.version);
    expect(restored.version).toBe(writing.version + 1);
    expect(versions(reporter, s.id)).toHaveLength(restored.version);
    expect(restored.body).toBe("");
  });
  it("publicação agendada não ocorre antes do prazo e não duplica", () => {
    const s = readyStory();
    const scheduled = transitionStory(editor, s.id, {
      target: "scheduled",
      version: s.version,
      scheduled_at: new Date(Date.now() + 60000).toISOString(),
    });
    publishScheduled();
    expect(publicStory(s.slug)).toBeNull();
    getDb()
      .prepare("UPDATE stories SET scheduled_at=? WHERE id=?")
      .run(new Date(Date.now() - 1000).toISOString(), s.id);
    publishScheduled();
    publishScheduled();
    expect(publicStory(s.slug)?.status).toBe("published");
    expect(
      Number(
        getDb().prepare("SELECT count(*) AS n FROM publications WHERE story_id=?").get(scheduled.id)
          ?.n,
      ),
    ).toBe(1);
  });
  it("despublicação exige motivo e remove página pública", () => {
    const s = readyStory(),
      p = transitionStory(editor, s.id, { target: "published", version: s.version });
    expect(() =>
      transitionStory(editor, s.id, { target: "unpublished", version: p.version, reason: "" }),
    ).toThrow();
    transitionStory(editor, s.id, {
      target: "unpublished",
      version: p.version,
      reason: "Informação precisa de nova verificação",
    });
    expect(publicStory(s.slug)).toBeNull();
  });
  it("autosave com versão antiga não sobrescreve texto", () => {
    const s = createStory(reporter, {
      title: "Título para teste de concorrência",
      desk: "Política",
    });
    const input = { ...s, body: "Primeira alteração com informações relevantes", sensitive: false };
    updateStory(reporter, s.id, input);
    expect(() =>
      updateStory(reporter, s.id, { ...input, body: "Tentativa de sobrescrita" }),
    ).toThrow(/recente/);
  });
  it("fonte confidencial é criptografada e não aparece para outro usuário", () => {
    const source = createSource(reporter, {
      name: "Fonte protegida",
      organization: "",
      position: "",
      phone: "",
      email: "",
      notes: "Informação sensível",
      confidentiality: "confidential",
      consent: "Contato autorizado",
    });
    expect(listSources(other)).toEqual([]);
    expect(listSources(editor)).toEqual([]);
    expect(listSources(reporter).find((s) => s.id === source.id)?.name).toBe("Fonte protegida");
    const encrypted = getDb()
      .prepare("SELECT encrypted_data FROM sources WHERE id=?")
      .get(source.id)?.encrypted_data;
    expect(String(encrypted)).not.toContain("Fonte protegida");
  });
});
describe("Contratos e segurança da API", () => {
  it("subrota de notas retorna coleção e não o objeto da pauta", async () => {
    const session = login(reporter.email, password),
      path = `assignments/${assignment.id}/notes`;
    const response = await GET(
      new NextRequest(`http://localhost:3000/api/v1/${path}`, {
        headers: { Cookie: `newsroom_session=${session.token}` },
      }),
      { params: Promise.resolve({ path: path.split("/") }) },
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([]);
  });
  function req(
    path: string,
    body: unknown,
    token?: string,
    key = randomUUID(),
    origin = "http://localhost:3000",
  ) {
    return POST(
      new NextRequest(`http://localhost:3000/api/v1/${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: origin,
          "Idempotency-Key": key,
          ...(token ? { Cookie: `newsroom_session=${token}` } : {}),
        },
        body: JSON.stringify(body),
      }),
      { params: Promise.resolve({ path: path.split("/") }) },
    );
  }
  it("rejeita origens externas e acesso anônimo", async () => {
    expect((await req("stories", {}, undefined, randomUUID(), "https://evil.example")).status).toBe(
      403,
    );
    expect((await req("stories", {})).status).toBe(401);
  });
  it("repórter não pode criar usuário diretamente", async () => {
    const s = login(reporter.email, password);
    const r = await req("users", {}, s.token);
    expect(r.status).toBe(403);
  });
  it("requisição duplicada cria uma única pauta", async () => {
    const session = login(editor.email, password),
      key = randomUUID(),
      input = { ...assignment, title: "Teste de idempotência" };
    const first = await req("assignments", input, session.token, key),
      second = await req("assignments", input, session.token, key);
    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    const a = await first.json(),
      b = await second.json();
    expect(a.id).toBe(b.id);
    expect(
      Number(
        getDb().prepare("SELECT count(*) AS n FROM assignments WHERE title=?").get(input.title)?.n,
      ),
    ).toBe(1);
    const conflict = await req(
      "assignments",
      { ...input, title: "Outro título" },
      session.token,
      key,
    );
    expect(conflict.status).toBe(409);
  });
  it("validação retorna 422 com request id sem stack trace", async () => {
    const session = login(reporter.email, password),
      r = await req("stories", {}, session.token);
    expect(r.status).toBe(422);
    expect(r.headers.get("X-Request-Id")).toBeTruthy();
    expect(await r.text()).not.toContain("stack");
  });
});
