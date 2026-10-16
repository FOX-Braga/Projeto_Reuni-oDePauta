import type { Role, Status, User, Story } from "@/types/domain";
import { assert } from "@/lib/errors";
export const editorialRoles: Role[] = ["editor", "chief"];
export function isEditor(user: User) {return editorialRoles.includes(user.role);}
export function inScope(user: User, desk: string) {return user.role === "chief" || user.desk === desk;}
export function canCreateAssignment(user: User) {return ["reporter", "producer", "editor", "chief"].includes(user.role);}
export function canReadStory(user: User, story: Pick<Story, "author_id" | "desk" | "status">) {
  return story.author_id === user.id || (isEditor(user) && inScope(user, story.desk)) || (user.role === "legal" && story.status === "legal" && inScope(user, story.desk));
}
export function canEditStory(user: User, story: Pick<Story, "author_id" | "desk">) {
  return ["reporter", "editor", "chief", "freelancer"].includes(user.role) && (story.author_id === user.id || (isEditor(user) && inScope(user, story.desk)));
}
const transitions: Partial<Record<Status, Status[]>> = {
  draft: ["reporting", "writing", "archived"], reporting: ["writing", "archived"], writing: ["review", "archived"],
  changes: ["writing", "review"], review: ["changes", "legal", "approved"], legal: ["changes", "approved"],
  approved: ["scheduled", "published", "writing"], scheduled: ["approved"],
  published: ["unpublished", "writing"], updated: ["unpublished", "writing"], unpublished: ["writing", "archived"]
};
export function allowedTransitions(user: User, story: Story): Status[] {
  if (!canReadStory(user, story)) return [];
  return (transitions[story.status] ?? []).filter(target => {
    if (["approved", "published", "scheduled", "unpublished", "changes", "legal"].includes(target)) return isEditor(user) && inScope(user, story.desk) && (!story.sensitive || user.role === "chief" || ["changes", "legal"].includes(target));
    return canEditStory(user, story);
  });
}
export function validateTransition(user: User, story: Story, target: Status, reason: string, now = Date.now()) {
  assert(allowedTransitions(user, story).includes(target), 403, "TRANSITION_FORBIDDEN", "Você não pode executar esta transição editorial.");
  if (["changes", "unpublished", "archived"].includes(target)) assert(reason.trim().length >= 5, 422, "REASON_REQUIRED", "Informe um motivo com pelo menos 5 caracteres.");
  if (["review", "approved", "scheduled", "published"].includes(target)) {
    assert(story.title.trim().length >= 5 && story.body.trim().length >= 30 && story.seo_description.trim().length >= 20, 422, "CHECKLIST_INCOMPLETE", "Revise título, texto (mínimo 30 caracteres) e resumo SEO (mínimo 20 caracteres).");
  }
  if (["published", "scheduled"].includes(target)) assert(story.approved_version === story.version, 409, "APPROVAL_STALE", "A aprovação não corresponde à versão atual. Envie novamente para revisão.");
  if (target === "published" && story.embargo) assert(Date.parse(story.embargo) <= now, 422, "EMBARGO_ACTIVE", "Esta matéria ainda está sob embargo.");
}
