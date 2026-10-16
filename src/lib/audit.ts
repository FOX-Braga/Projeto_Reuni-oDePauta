import { randomUUID } from "node:crypto";
import { getDb } from "@/lib/db";
export function audit(actor: string, entity: string, action: string, reason = "") {
  getDb()
    .prepare("INSERT INTO audit_events VALUES (?,?,?,?,?,?)")
    .run(randomUUID(), actor, entity, action, reason, new Date().toISOString());
}
export function notify(user: string, title: string, href: string) {
  getDb()
    .prepare("INSERT INTO notifications VALUES (?,?,?,?,NULL,?)")
    .run(randomUUID(), user, title, href, new Date().toISOString());
}
