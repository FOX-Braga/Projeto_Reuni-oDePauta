export const roles = ["reporter", "producer", "editor", "chief", "media", "social", "legal", "freelancer", "admin", "executive"] as const;
export type Role = typeof roles[number];
export const roleLabels: Record<Role, string> = {reporter: "Repórter", producer: "Produtor", editor: "Editor", chief: "Editor-chefe", media: "Foto e vídeo", social: "Social", legal: "Jurídico", freelancer: "Freelancer", admin: "Administrador", executive: "Leitor executivo"};
export interface User {id: string; name: string; email: string; role: Role; desk: string; active: number}
export const statuses = ["draft", "reporting", "writing", "review", "changes", "legal", "approved", "scheduled", "published", "updated", "unpublished", "archived"] as const;
export type Status = typeof statuses[number];
export const statusLabels: Record<Status, string> = {draft: "Rascunho", reporting: "Em apuração", writing: "Em redação", review: "Aguardando revisão", changes: "Ajustes solicitados", legal: "Revisão jurídica", approved: "Aprovada", scheduled: "Agendada", published: "Publicada", updated: "Atualizada", unpublished: "Despublicada", archived: "Arquivada"};
export const priorities = ["low", "normal", "high", "urgent"] as const;
export type Priority = typeof priorities[number];
export const priorityLabels: Record<Priority, string> = {low: "Baixa", normal: "Normal", high: "Alta", urgent: "Urgente"};
export const desks = ["Política", "Economia", "Cidades", "Mundo", "Cultura", "Esportes", "Tecnologia", "Ciência"];
export interface Assignment {id: string; title: string; briefing: string; desk: string; priority: Priority; assignee_id: string; editor_id: string; deadline: string; location: string; tags: string; status: Status; version: number; created_by: string; created_at: string; updated_at: string; assignee_name?: string}
export interface Story {id: string; assignment_id: string | null; title: string; subtitle: string; body: string; slug: string; desk: string; tags: string; seo_description: string; author_id: string; status: Status; version: number; approved_version: number | null; scheduled_at: string | null; published_at: string | null; embargo: string | null; sensitive: number; updated_at: string; created_at: string; author_name?: string}
export interface Source {id: string; name: string; organization: string; position: string; phone: string; email: string; notes: string; confidentiality: "internal" | "confidential"; consent: string; owner_id: string; created_at: string}
export interface Task {id: string; title: string; assignee_id: string; assignment_id: string | null; deadline: string; priority: Priority; completed: number; created_by: string}
export interface Notification {id: string; user_id: string; title: string; href: string; read_at: string | null; created_at: string}
export interface AuditEvent {id: string; actor_id: string; actor_name?: string; entity_id: string; action: string; reason: string; created_at: string}
export interface StoryVersion {id: string; story_id: string; version: number; snapshot: string; actor_id: string; actor_name?: string; reason: string; created_at: string}
