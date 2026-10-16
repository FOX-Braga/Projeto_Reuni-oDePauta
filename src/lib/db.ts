import { DatabaseSync } from "node:sqlite";
import { mkdirSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
let instance: DatabaseSync | undefined;
export function migrate(db: DatabaseSync) {
  db.exec("PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL)");
  for (const name of readdirSync(join(process.cwd(), "migrations")).filter(n => n.endsWith(".sql")).sort()) {
    db.exec("BEGIN IMMEDIATE");
    try {
      if (!db.prepare("SELECT name FROM schema_migrations WHERE name=?").get(name)) {
        db.exec(readFileSync(join(process.cwd(), "migrations", name), "utf8"));
        db.prepare("INSERT INTO schema_migrations VALUES (?,?)").run(name, new Date().toISOString());
      }
      db.exec("COMMIT");
    } catch (error) {db.exec("ROLLBACK"); throw error;}
  }
}
export function getDb() {
  if (!instance) {
    const path = resolve(process.env.DATABASE_PATH ?? "data/newsroom.sqlite");
    mkdirSync(dirname(path), {recursive: true});
    instance = new DatabaseSync(path, {timeout: 5000});
    migrate(instance);
  }
  return instance;
}
export function transaction<T>(run: () => T): T {
  const db = getDb(); db.exec("BEGIN IMMEDIATE");
  try {const value = run(); db.exec("COMMIT"); return value;}
  catch (error) {db.exec("ROLLBACK"); throw error;}
}
