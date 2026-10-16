import { describe, expect, it } from "vitest";
import {
  canEditStory,
  canReadStory,
  allowedTransitions,
  validateTransition,
} from "@/features/workflow/rules";
import { hashPassword, verifyPassword } from "@/lib/crypto";
import { assignmentSchema, userSchema } from "@/schemas";
import type { User, Story, Role } from "@/types/domain";
const user = (role: Role, desk = "Política"): User => ({
  id: role,
  name: role,
  email: `${role}@example.test`,
  role,
  desk,
  active: 1,
});
const story = {
  id: "s1",
  author_id: "reporter",
  desk: "Política",
  status: "writing",
  title: "Título válido",
  body: "Texto jornalístico com mais de trinta caracteres para validação.",
  seo_description: "Resumo editorial com contexto suficiente.",
  version: 3,
  approved_version: null,
  sensitive: 0,
  embargo: null,
} as Story;
describe("Autorização editorial", () => {
  it("repórter edita apenas sua matéria", () => {
    expect(canEditStory(user("reporter"), story)).toBe(true);
    expect(canEditStory({ ...user("reporter"), id: "outro" }, story)).toBe(false);
  });
  it("admin técnico não recebe publicação nem acesso editorial", () => {
    expect(canReadStory(user("admin"), story)).toBe(false);
    expect(allowedTransitions(user("admin"), story)).toEqual([]);
  });
  it("editor fica restrito à sua editoria", () => {
    expect(canReadStory(user("editor", "Economia"), story)).toBe(false);
    expect(canReadStory(user("chief", "Economia"), story)).toBe(true);
  });
  it("repórter não pula revisão", () => {
    expect(() => validateTransition(user("reporter"), story, "published", "")).toThrow();
    expect(() => validateTransition(user("reporter"), story, "review", "")).not.toThrow();
  });
  it("aprovação é vinculada à versão", () => {
    expect(() =>
      validateTransition(
        user("editor"),
        { ...story, status: "approved", approved_version: 2 },
        "published",
        "",
      ),
    ).toThrow(/aprovação/i);
  });
  it("embargo bloqueia publicação", () => {
    expect(() =>
      validateTransition(
        user("editor"),
        {
          ...story,
          status: "approved",
          approved_version: 3,
          embargo: new Date(Date.now() + 60000).toISOString(),
        },
        "published",
        "",
      ),
    ).toThrow(/embargo/i);
  });
  it("conteúdo sensível exige editor-chefe", () => {
    const sensitive = { ...story, status: "review" as const, sensitive: 1 };
    expect(allowedTransitions(user("editor"), sensitive)).not.toContain("approved");
    expect(allowedTransitions(user("chief"), sensitive)).toContain("approved");
  });
  it("devolução exige motivo", () => {
    expect(() =>
      validateTransition(user("editor"), { ...story, status: "review" }, "changes", ""),
    ).toThrow(/motivo/i);
  });
  it("campos incompletos bloqueiam revisão", () => {
    expect(() =>
      validateTransition(user("reporter"), { ...story, seo_description: "" }, "review", ""),
    ).toThrow();
  });
});
describe("Validação e senhas", () => {
  it("hash utiliza salt e rejeita senha incorreta", () => {
    const a = hashPassword("uma senha de teste suficientemente longa"),
      b = hashPassword("uma senha de teste suficientemente longa");
    expect(a).not.toEqual(b);
    expect(verifyPassword("uma senha de teste suficientemente longa", a)).toBe(true);
    expect(verifyPassword("errada", a)).toBe(false);
  });
  it("rejeita senhas curtas e papéis não conhecidos", () => {
    expect(
      userSchema.safeParse({
        name: "Teste",
        email: "teste@example.test",
        password: "123",
        role: "superuser",
        desk: "Política",
      }).success,
    ).toBe(false);
  });
  it("pautas não aceitam prazos sem timezone", () => {
    expect(
      assignmentSchema.safeParse({
        title: "Título",
        briefing: "Um briefing detalhado",
        deadline: "2026-10-16T12:00",
      }).success,
    ).toBe(false);
  });
});
