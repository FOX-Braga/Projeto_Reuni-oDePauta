import { randomUUID } from "node:crypto";
import { z } from "zod";
import { getDb, transaction } from "@/lib/db";
import { assert } from "@/lib/errors";
import { audit, notify } from "@/lib/audit";
import { assignmentSchema, assignmentUpdateSchema } from "@/schemas";
import { canCreateAssignment, isEditor, inScope } from "@/features/workflow/rules";
import type { User, Assignment } from "@/types/domain";
export function canReadAssignment(user: User, a: Assignment) {
  return (
    a.assignee_id === user.id ||
    a.editor_id === user.id ||
    a.created_by === user.id ||
    (isEditor(user) && inScope(user, a.desk))
  );
}
export function getAssignment(user: User, id: string) {
  const row = getDb()
    .prepare(
      "SELECT a.*,u.name AS assignee_name FROM assignments a JOIN users u ON a.assignee_id=u.id WHERE a.id=?",
    )
    .get(id) as unknown as Assignment;
  assert(row, 404, "ASSIGNMENT_NOT_FOUND", "Pauta não encontrada.");
  assert(canReadAssignment(user, row), 403, "FORBIDDEN", "Você não possui acesso a esta pauta.");
  return row;
}
export function listAssignments(user: User, query = "", offset = 0) {
  const global = user.role === "chief" ? 1 : 0;
  return getDb()
    .prepare(
      "SELECT a.*,u.name AS assignee_name FROM assignments a JOIN users u ON a.assignee_id=u.id WHERE (?=1 OR a.assignee_id=? OR a.editor_id=? OR a.created_by=? OR (?=1 AND a.desk=?)) AND (a.title LIKE ? ESCAPE '\\' OR a.briefing LIKE ? ESCAPE '\\') ORDER BY a.deadline ASC LIMIT 100 OFFSET ?",
    )
    .all(
      global,
      user.id,
      user.id,
      user.id,
      isEditor(user) ? 1 : 0,
      user.desk,
      `%${query.replace(/[\\%_]/g, "\\$&")}%`,
      `%${query.replace(/[\\%_]/g, "\\$&")}%`,
      offset,
    ) as unknown as Assignment[];
}
function validatePeople(user: User, input: z.infer<typeof assignmentSchema>) {
  const db = getDb();
  const reporter = db
    .prepare("SELECT id,role,desk FROM users WHERE id=? AND active=1")
    .get(input.assignee_id);
  const editor = db
    .prepare("SELECT id,role,desk FROM users WHERE id=? AND active=1")
    .get(input.editor_id);
  assert(
    reporter &&
      ["reporter", "producer", "editor", "chief", "freelancer"].includes(String(reporter.role)) &&
      (reporter.desk === input.desk || reporter.role === "chief"),
    422,
    "INVALID_ASSIGNEE",
    "Selecione um responsável da editoria.",
  );
  assert(
    editor &&
      ["editor", "chief"].includes(String(editor.role)) &&
      (editor.desk === input.desk || editor.role === "chief"),
    422,
    "INVALID_EDITOR",
    "Selecione um editor responsável por esta editoria.",
  );
  assert(
    inScope(user, input.desk),
    403,
    "DESK_FORBIDDEN",
    "Você não possui acesso a esta editoria.",
  );
  if (!isEditor(user))
    assert(
      input.assignee_id === user.id,
      403,
      "ASSIGN_FORBIDDEN",
      "Somente editores podem atribuir pautas a outras pessoas.",
    );
}
export function createAssignment(user: User, raw: unknown) {
  const input = assignmentSchema.parse(raw);
  assert(canCreateAssignment(user), 403, "FORBIDDEN", "Seu perfil não pode criar pautas.");
  validatePeople(user, input);
  return transaction(() => {
    const id = randomUUID(),
      now = new Date().toISOString();
    getDb()
      .prepare(
        "INSERT INTO assignments (id,title,briefing,desk,priority,assignee_id,editor_id,deadline,location,tags,created_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
      )
      .run(
        id,
        input.title,
        input.briefing,
        input.desk,
        input.priority,
        input.assignee_id,
        input.editor_id,
        input.deadline,
        input.location,
        input.tags,
        user.id,
        now,
        now,
      );
    audit(user.id, id, "assignment.created");
    notify(input.assignee_id, `Pauta atribuída: ${input.title}`, `/pautas/${id}`);
    return getAssignment(user, id);
  });
}
export function updateAssignment(user: User, id: string, raw: unknown) {
  const input = assignmentUpdateSchema.parse(raw);
  return transaction(() => {
    const a = getAssignment(user, id);
    assert(
      a.assignee_id === user.id || (isEditor(user) && inScope(user, a.desk)),
      403,
      "FORBIDDEN",
      "Você não pode editar esta pauta.",
    );
    assert(a.status !== "archived", 409, "ARCHIVED", "Esta pauta está arquivada.");
    assert(
      a.version === input.version,
      409,
      "VERSION_CONFLICT",
      "A pauta foi alterada por outra pessoa. Recarregue antes de salvar.",
    );
    assert(
      ["draft", "reporting", "writing", "archived"].includes(input.status),
      422,
      "INVALID_STATUS",
      "Este status pertence ao workflow da matéria.",
    );
    if (input.status === "archived")
      assert(input.reason.length >= 5, 422, "REASON_REQUIRED", "Informe o motivo do arquivamento.");
    validatePeople(user, input);
    getDb()
      .prepare(
        "UPDATE assignments SET title=?,briefing=?,desk=?,priority=?,assignee_id=?,editor_id=?,deadline=?,location=?,tags=?,status=?,version=version+1,updated_at=? WHERE id=? AND version=?",
      )
      .run(
        input.title,
        input.briefing,
        input.desk,
        input.priority,
        input.assignee_id,
        input.editor_id,
        input.deadline,
        input.location,
        input.tags,
        input.status,
        new Date().toISOString(),
        id,
        input.version,
      );
    audit(user.id, id, "assignment.updated", input.reason);
    if (a.assignee_id !== input.assignee_id || a.deadline !== input.deadline)
      notify(input.assignee_id, `Pauta atualizada: ${input.title}`, `/pautas/${id}`);
    return getAssignment(user, id);
  });
}
