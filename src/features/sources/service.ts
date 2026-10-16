import { randomUUID } from "node:crypto";
import { getDb, transaction } from "@/lib/db";
import { encrypt, decrypt } from "@/lib/crypto";
import { audit } from "@/lib/audit";
import { assert } from "@/lib/errors";
import { sourceSchema } from "@/schemas";
import type { Source, User } from "@/types/domain";
export function listSources(user: User) {
  assert(
    ["reporter", "producer", "editor", "chief"].includes(user.role),
    403,
    "FORBIDDEN",
    "Seu perfil não possui acesso à base de fontes.",
  );
  return transaction(() => {
    const rows = getDb()
      .prepare(
        "SELECT * FROM sources WHERE owner_id=? OR (?=1 AND confidentiality='internal') ORDER BY created_at DESC LIMIT 100",
      )
      .all(user.id, ["editor", "chief"].includes(user.role) ? 1 : 0);
    return rows.map((row) => {
      if (row.confidentiality === "confidential") audit(user.id, String(row.id), "source.viewed");
      return {
        ...decrypt<Omit<Source, "id" | "owner_id" | "created_at">>(String(row.encrypted_data)),
        id: String(row.id),
        owner_id: String(row.owner_id),
        created_at: String(row.created_at),
      };
    });
  });
}
export function createSource(user: User, raw: unknown) {
  assert(
    ["reporter", "producer", "editor", "chief"].includes(user.role),
    403,
    "FORBIDDEN",
    "Você não pode cadastrar fontes.",
  );
  const input = sourceSchema.parse(raw);
  return transaction(() => {
    const id = randomUUID();
    getDb()
      .prepare("INSERT INTO sources VALUES (?,?,?,?,?)")
      .run(id, encrypt(input), user.id, input.confidentiality, new Date().toISOString());
    audit(user.id, id, "source.created");
    return { id };
  });
}
