import { z } from "zod";
import { roles, priorities, statuses } from "@/types/domain";
const short = z.string().trim().min(1).max(200);
const date = z.string().datetime({ offset: true });
export const credentialsSchema = z.object({
  email: z
    .email()
    .max(254)
    .transform((v) => v.toLowerCase()),
  password: z.string().min(1).max(128),
});
export const userSchema = credentialsSchema.extend({
  name: short,
  password: z.string().min(12, "Use pelo menos 12 caracteres.").max(128),
  role: z.enum(roles),
  desk: short,
});
export const setupSchema = userSchema.omit({ role: true });
export const assignmentSchema = z.object({
  title: z.string().trim().min(5).max(200),
  briefing: z.string().trim().min(10).max(10000),
  desk: short,
  priority: z.enum(priorities),
  assignee_id: z.uuid(),
  editor_id: z.uuid(),
  deadline: date,
  location: z.string().trim().max(300).default(""),
  tags: z.string().trim().max(500).default(""),
});
export const assignmentUpdateSchema = assignmentSchema.extend({
  version: z.number().int().positive(),
  status: z.enum(statuses),
  reason: z.string().trim().max(2000).default(""),
});
export const storyCreateSchema = z.object({
  title: z.string().trim().min(5).max(200),
  assignment_id: z.uuid().nullable().default(null),
  desk: short,
});
export const storyUpdateSchema = z.object({
  title: z.string().trim().min(5).max(200),
  subtitle: z.string().max(500),
  body: z.string().max(500000),
  tags: z.string().max(500),
  seo_description: z.string().max(500),
  version: z.number().int().positive(),
  embargo: date.nullable(),
  sensitive: z.boolean(),
});
export const transitionSchema = z.object({
  target: z.enum(statuses),
  version: z.number().int().positive(),
  reason: z.string().trim().max(2000).default(""),
  scheduled_at: date.nullable().default(null),
});
export const sourceSchema = z.object({
  name: short,
  organization: z.string().max(200),
  position: z.string().max(200),
  phone: z.string().max(60),
  email: z.union([z.email(), z.literal("")]),
  notes: z.string().max(5000),
  confidentiality: z.enum(["internal", "confidential"]),
  consent: z.string().max(1000),
});
export const taskSchema = z.object({
  title: short,
  assignee_id: z.uuid(),
  assignment_id: z.uuid().nullable().default(null),
  deadline: date,
  priority: z.enum(priorities),
});
