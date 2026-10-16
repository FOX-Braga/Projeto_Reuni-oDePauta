import { randomUUID } from "node:crypto";
import { getDb, transaction } from "@/lib/db";
import { assert } from "@/lib/errors";
import { audit, notify } from "@/lib/audit";
import { storyCreateSchema, storyUpdateSchema, transitionSchema } from "@/schemas";
import {
  canReadStory,
  canEditStory,
  isEditor,
  inScope,
  validateTransition,
  allowedTransitions,
} from "@/features/workflow/rules";
import { getAssignment } from "@/features/assignments/service";
import type { User, Story, StoryVersion } from "@/types/domain";
function rawStory(id: string) {
  const story = getDb()
    .prepare(
      "SELECT s.*,u.name AS author_name FROM stories s JOIN users u ON u.id=s.author_id WHERE s.id=?",
    )
    .get(id) as unknown as Story;
  assert(story, 404, "STORY_NOT_FOUND", "Matéria não encontrada.");
  return story;
}
export function getStory(user: User, id: string) {
  const story = rawStory(id);
  assert(canReadStory(user, story), 403, "FORBIDDEN", "Você não possui acesso a esta matéria.");
  return {
    ...story,
    transitions: allowedTransitions(user, story),
    editable:
      canEditStory(user, story) &&
      ["draft", "reporting", "writing", "changes"].includes(story.status),
  };
}
export function listStories(user: User, query = "", offset = 0) {
  return getDb()
    .prepare(
      "SELECT s.*,u.name AS author_name FROM stories s JOIN users u ON u.id=s.author_id WHERE (s.author_id=? OR ?=1 OR (?=1 AND s.desk=?) OR (?=1 AND s.status='legal' AND s.desk=?)) AND s.title LIKE ? ESCAPE '\\' ORDER BY s.updated_at DESC LIMIT 100 OFFSET ?",
    )
    .all(
      user.id,
      user.role === "chief" ? 1 : 0,
      isEditor(user) ? 1 : 0,
      user.desk,
      user.role === "legal" ? 1 : 0,
      user.desk,
      `%${query.replace(/[\\%_]/g, "\\$&")}%`,
      offset,
    ) as unknown as Story[];
}
function snapshot(user: User, story: Story, reason: string) {
  getDb()
    .prepare("INSERT INTO story_versions VALUES (?,?,?,?,?,?,?)")
    .run(
      randomUUID(),
      story.id,
      story.version,
      JSON.stringify(story),
      user.id,
      reason,
      new Date().toISOString(),
    );
}
export function createStory(user: User, raw: unknown) {
  const input = storyCreateSchema.parse(raw);
  assert(
    ["reporter", "editor", "chief", "freelancer"].includes(user.role) && inScope(user, input.desk),
    403,
    "FORBIDDEN",
    "Você não pode criar matérias nesta editoria.",
  );
  if (input.assignment_id) getAssignment(user, input.assignment_id);
  if (user.role === "freelancer")
    assert(
      input.assignment_id,
      403,
      "ASSIGNMENT_REQUIRED",
      "Freelancers precisam de uma pauta atribuída.",
    );
  return transaction(() => {
    const id = randomUUID(),
      now = new Date().toISOString();
    const slug = `${input.title
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 120)}-${id.slice(0, 8)}`;
    getDb()
      .prepare(
        "INSERT INTO stories (id,assignment_id,title,slug,desk,author_id,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)",
      )
      .run(id, input.assignment_id, input.title, slug, input.desk, user.id, now, now);
    const story = rawStory(id);
    snapshot(user, story, "Matéria criada");
    audit(user.id, id, "story.created");
    return getStory(user, id);
  });
}
export function updateStory(user: User, id: string, raw: unknown) {
  const input = storyUpdateSchema.parse(raw);
  return transaction(() => {
    const story = getStory(user, id);
    assert(story.editable, 403, "EDIT_FORBIDDEN", "Volte a matéria para redação antes de editar.");
    assert(
      story.version === input.version,
      409,
      "VERSION_CONFLICT",
      "Existe uma versão mais recente. Seu texto foi preservado; compare antes de continuar.",
    );
    if (input.sensitive !== Boolean(story.sensitive))
      assert(
        isEditor(user),
        403,
        "SENSITIVE_FLAG_FORBIDDEN",
        "Somente editores podem mudar a classificação de risco.",
      );
    getDb()
      .prepare(
        "UPDATE stories SET title=?,subtitle=?,body=?,tags=?,seo_description=?,embargo=?,sensitive=?,version=version+1,approved_version=NULL,updated_at=? WHERE id=? AND version=?",
      )
      .run(
        input.title,
        input.subtitle,
        input.body,
        input.tags,
        input.seo_description,
        input.embargo,
        input.sensitive ? 1 : 0,
        new Date().toISOString(),
        id,
        input.version,
      );
    snapshot(user, rawStory(id), "Texto e metadados salvos");
    audit(user.id, id, "story.updated");
    return getStory(user, id);
  });
}
export function transitionStory(user: User, id: string, raw: unknown) {
  const input = transitionSchema.parse(raw);
  return transaction(() => {
    const story = getStory(user, id);
    assert(
      story.version === input.version,
      409,
      "VERSION_CONFLICT",
      "A matéria foi alterada. Recarregue antes de mudar o status.",
    );
    validateTransition(user, story, input.target, input.reason);
    if (input.target === "scheduled") {
      assert(
        input.scheduled_at && Date.parse(input.scheduled_at) > Date.now(),
        422,
        "INVALID_SCHEDULE",
        "Escolha um horário futuro.",
      );
      assert(
        !story.embargo || Date.parse(input.scheduled_at) >= Date.parse(story.embargo),
        422,
        "EMBARGO_ACTIVE",
        "O agendamento precisa respeitar o embargo.",
      );
    }
    const now = new Date().toISOString(),
      version = story.version + 1;
    const approved = ["approved", "scheduled", "published"].includes(input.target) ? version : null;
    getDb()
      .prepare(
        "UPDATE stories SET status=?,version=?,approved_version=?,scheduled_at=?,published_at=?,updated_at=? WHERE id=?",
      )
      .run(
        input.target,
        version,
        approved,
        input.target === "scheduled" ? input.scheduled_at : null,
        input.target === "published" ? now : story.published_at,
        now,
        id,
      );
    const next = rawStory(id);
    if (input.target === "published") {
      getDb().prepare("UPDATE publications SET active=0 WHERE story_id=?").run(id);
      getDb()
        .prepare("INSERT INTO publications VALUES (?,?,?,?,?,1,?)")
        .run(randomUUID(), id, version, JSON.stringify(next), user.id, now);
    }
    if (input.target === "unpublished")
      getDb().prepare("UPDATE publications SET active=0 WHERE story_id=?").run(id);
    snapshot(user, next, input.reason || `Status: ${input.target}`);
    audit(user.id, id, `story.${input.target}`, input.reason);
    if (input.target === "review") {
      const editors = getDb()
        .prepare(
          "SELECT id FROM users WHERE active=1 AND (role='chief' OR (role='editor' AND desk=?))",
        )
        .all(story.desk);
      editors.forEach((e) =>
        notify(String(e.id), `Revisão solicitada: ${story.title}`, `/materias/${id}/editar`),
      );
    } else notify(story.author_id, `Matéria atualizada: ${story.title}`, `/materias/${id}/editar`);
    return getStory(user, id);
  });
}
export function versions(user: User, id: string) {
  getStory(user, id);
  return getDb()
    .prepare(
      "SELECT v.*,u.name AS actor_name FROM story_versions v JOIN users u ON u.id=v.actor_id WHERE v.story_id=? ORDER BY v.version DESC LIMIT 100",
    )
    .all(id) as unknown as StoryVersion[];
}
export function restoreVersion(user: User, id: string, version: number, base: number) {
  return transaction(() => {
    const current = getStory(user, id);
    assert(current.editable, 403, "EDIT_FORBIDDEN", "Volte para redação antes de restaurar.");
    assert(current.version === base, 409, "VERSION_CONFLICT", "Versão atual alterada.");
    const previous = getDb()
      .prepare("SELECT snapshot FROM story_versions WHERE story_id=? AND version=?")
      .get(id, version);
    assert(previous, 404, "VERSION_NOT_FOUND", "Versão não encontrada.");
    const data = JSON.parse(String(previous.snapshot)) as Story;
    getDb()
      .prepare(
        "UPDATE stories SET title=?,subtitle=?,body=?,tags=?,seo_description=?,version=version+1,approved_version=NULL,status='writing',updated_at=? WHERE id=?",
      )
      .run(
        data.title,
        data.subtitle,
        data.body,
        data.tags,
        data.seo_description,
        new Date().toISOString(),
        id,
      );
    snapshot(user, rawStory(id), `Restauração da versão ${version}`);
    audit(user.id, id, "story.restored", `Versão ${version}`);
    return getStory(user, id);
  });
}
export function publicStory(slug: string): Story | null {
  const row = getDb()
    .prepare(
      "SELECT p.snapshot FROM publications p JOIN stories s ON p.story_id=s.id WHERE s.slug=? AND p.active=1 ORDER BY p.created_at DESC LIMIT 1",
    )
    .get(slug);
  return row ? (JSON.parse(String(row.snapshot)) as Story) : null;
}
export function publishScheduled() {
  const rows = getDb()
    .prepare("SELECT id FROM stories WHERE status='scheduled' AND scheduled_at<=?")
    .all(new Date().toISOString());
  for (const row of rows)
    transaction(() => {
      const s = rawStory(String(row.id));
      if (s.status !== "scheduled" || s.approved_version !== s.version) return;
      const approver = getDb()
        .prepare(
          "SELECT u.id,u.name,u.email,u.role,u.desk,u.active FROM story_versions v JOIN users u ON u.id=v.actor_id WHERE v.story_id=? AND v.version=?",
        )
        .get(s.id, s.version) as unknown as User;
      if (
        !approver?.active ||
        !isEditor(approver) ||
        !inScope(approver, s.desk) ||
        (s.sensitive && approver.role !== "chief") ||
        (s.embargo && Date.parse(s.embargo) > Date.now())
      )
        return;
      const now = new Date().toISOString();
      getDb()
        .prepare(
          "UPDATE stories SET status='published',published_at=?,updated_at=?,version=version+1,approved_version=version+1,scheduled_at=NULL WHERE id=?",
        )
        .run(now, now, s.id);
      const next = rawStory(s.id);
      getDb().prepare("UPDATE publications SET active=0 WHERE story_id=?").run(s.id);
      getDb()
        .prepare("INSERT INTO publications VALUES (?,?,?,?,?,1,?)")
        .run(randomUUID(), s.id, next.version, JSON.stringify(next), approver.id, now);
      snapshot(approver, next, "Publicação agendada");
      audit(approver.id, s.id, "story.published", "Publicação agendada");
      notify(s.author_id, `Publicada: ${s.title}`, `/materias/${s.id}/editar`);
    });
  return rows.length;
}
