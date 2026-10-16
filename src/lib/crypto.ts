import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");
export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}
export function verifyPassword(password: string, hash: string) {
  const [salt, value] = hash.split(":");
  if (!salt || !value) return false;
  const expected = Buffer.from(value, "hex"),
    actual = scryptSync(password, salt, 64);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
function encryptionKey() {
  const file = resolve(dirname(process.env.DATABASE_PATH ?? "data/newsroom.sqlite"), "sources.key");
  mkdirSync(dirname(file), { recursive: true });
  try {
    return readFileSync(file);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    const key = randomBytes(32);
    try {
      writeFileSync(file, key, { flag: "wx", mode: 0o600 });
      return key;
    } catch (writeError) {
      if ((writeError as NodeJS.ErrnoException).code === "EEXIST") return readFileSync(file);
      throw writeError;
    }
  }
}
export function encrypt(value: unknown) {
  const iv = randomBytes(12),
    cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const data = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map((b) => b.toString("base64")).join(".");
}
export function decrypt<T>(value: string): T {
  const [iv, tag, data] = value.split(".").map((v) => Buffer.from(v, "base64"));
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), iv);
  decipher.setAuthTag(tag);
  return JSON.parse(Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8")) as T;
}
