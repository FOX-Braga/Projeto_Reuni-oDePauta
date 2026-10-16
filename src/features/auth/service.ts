import { randomBytes, randomUUID } from "node:crypto";
import { getDb, transaction } from "@/lib/db";
import { hashPassword, verifyPassword, hashToken } from "@/lib/crypto";
import { assert } from "@/lib/errors";
import type { User, Role } from "@/types/domain";
export const cookieName = "newsroom_session";
const dummyHash = hashPassword(randomBytes(32).toString("hex"));
export function needsSetup() {
  return Number(getDb().prepare("SELECT count(*) AS n FROM users").get()?.n) === 0;
}
export function createUser(input: {
  name: string;
  email: string;
  password: string;
  role: Role;
  desk: string;
}) {
  const id = randomUUID();
  assert(
    !getDb().prepare("SELECT id FROM users WHERE email=? COLLATE NOCASE").get(input.email),
    409,
    "EMAIL_EXISTS",
    "Já existe uma conta com esse e-mail.",
  );
  getDb()
    .prepare(
      "INSERT INTO users (id,name,email,password_hash,role,desk,created_at) VALUES (?,?,?,?,?,?,?)",
    )
    .run(
      id,
      input.name,
      input.email.toLowerCase(),
      hashPassword(input.password),
      input.role,
      input.desk,
      new Date().toISOString(),
    );
  return getDb()
    .prepare("SELECT id,name,email,role,desk,active FROM users WHERE id=?")
    .get(id) as unknown as User;
}
export function setup(input: { name: string; email: string; password: string; desk: string }) {
  return transaction(() => {
    assert(needsSetup(), 409, "SETUP_COMPLETE", "O ambiente já foi configurado.");
    return createUser({ ...input, role: "admin" });
  });
}
export function login(email: string, password: string) {
  const db = getDb(),
    key = hashToken(email.toLowerCase()),
    now = Date.now();
  const attempts = db
    .prepare("SELECT attempts,expires_at FROM login_attempts WHERE key=?")
    .get(key);
  assert(
    !attempts || Number(attempts.expires_at) <= now || Number(attempts.attempts) < 8,
    429,
    "TOO_MANY_ATTEMPTS",
    "Muitas tentativas. Aguarde 15 minutos.",
  );
  const row = db.prepare("SELECT * FROM users WHERE email=? COLLATE NOCASE").get(email);
  const valid = verifyPassword(password, String(row?.password_hash ?? dummyHash));
  if (!row || !row.active || !valid) {
    db.prepare(
      "INSERT INTO login_attempts VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN expires_at < ? THEN 1 ELSE attempts+1 END, expires_at=CASE WHEN expires_at < ? THEN excluded.expires_at ELSE expires_at END",
    ).run(key, now + 900000, now, now);
    assert(false, 401, "INVALID_CREDENTIALS", "E-mail ou senha inválidos.");
  }
  db.prepare("DELETE FROM login_attempts WHERE key=?").run(key);
  const token = randomBytes(32).toString("base64url");
  const hours = Math.max(1, Math.min(24, Number(process.env.SESSION_HOURS) || 8));
  db.prepare("DELETE FROM sessions WHERE expires_at <= ?").run(now);
  db.prepare("INSERT INTO sessions VALUES (?,?,?,?)").run(
    hashToken(token),
    String(row.id),
    now + hours * 3600000,
    new Date().toISOString(),
  );
  db.prepare("INSERT INTO audit_events VALUES (?,?,?,?,?,?)").run(
    randomUUID(),
    String(row.id),
    String(row.id),
    "session.login",
    "",
    new Date().toISOString(),
  );
  return { token, maxAge: hours * 3600 };
}
export function sessionUser(token?: string): User | null {
  if (!token) return null;
  return (
    (getDb()
      .prepare(
        "SELECT u.id,u.name,u.email,u.role,u.desk,u.active FROM users u JOIN sessions s ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>? AND u.active=1",
      )
      .get(hashToken(token), Date.now()) as unknown as User) ?? null
  );
}
export function logout(token?: string) {
  if (token) getDb().prepare("DELETE FROM sessions WHERE token_hash=?").run(hashToken(token));
}
