import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z, ZodError } from "zod";
import { getDb, transaction } from "@/lib/db";
import { AppError, assert } from "@/lib/errors";
import { hashToken } from "@/lib/crypto";
import { audit } from "@/lib/audit";
import {
  needsSetup,
  setup,
  login,
  logout,
  sessionUser,
  cookieName,
  createUser,
} from "@/features/auth/service";
import {
  listAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
} from "@/features/assignments/service";
import {
  listStories,
  getStory,
  createStory,
  updateStory,
  transitionStory,
  versions,
  restoreVersion,
} from "@/features/stories/service";
import { listSources, createSource } from "@/features/sources/service";
import { isEditor } from "@/features/workflow/rules";
import { credentialsSchema, setupSchema, userSchema, taskSchema } from "@/schemas";
import type { User } from "@/types/domain";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
function dispatch(user: User, method: string, parts: string[], body: unknown, url: URL): unknown {
  const [resource, id, action] = parts,
    db = getDb();
  const q = (url.searchParams.get("q") ?? "").slice(0, 200);
  const offset = z.coerce
    .number()
    .int()
    .min(0)
    .max(1000000)
    .parse(url.searchParams.get("offset") ?? "0");
  if (resource === "me" && method === "GET") return user;
  if (resource === "people" && method === "GET") {
    if (user.role === "admin")
      return db
        .prepare("SELECT id,name,email,role,desk,active FROM users ORDER BY name LIMIT 100")
        .all();
    assert(
      ["reporter", "producer", "editor", "chief", "freelancer"].includes(user.role),
      403,
      "FORBIDDEN",
      "Seu perfil não possui acesso ao diretório.",
    );
    return db
      .prepare(
        "SELECT id,name,role,desk,active FROM users WHERE active=1 AND (desk=? OR role='chief' OR ?=1) AND role IN ('reporter','producer','editor','chief','freelancer') ORDER BY name LIMIT 100",
      )
      .all(user.desk, user.role === "chief" ? 1 : 0);
  }
  if (resource === "users") {
    assert(
      user.role === "admin",
      403,
      "FORBIDDEN",
      "Somente administradores podem gerenciar usuários.",
    );
    if (method === "POST" && !id) {
      const created = createUser(userSchema.parse(body));
      audit(user.id, created.id, "user.created");
      return created;
    }
    if (method === "PATCH" && id) {
      const input = z
        .object({
          role: z.enum([
            "reporter",
            "producer",
            "editor",
            "chief",
            "media",
            "social",
            "legal",
            "freelancer",
            "admin",
            "executive",
          ]),
          desk: z.string().trim().min(1).max(200),
          active: z.boolean(),
        })
        .parse(body);
      assert(
        id !== user.id,
        422,
        "SELF_CHANGE_FORBIDDEN",
        "Não altere seu próprio perfil nesta tela.",
      );
      const result = db
        .prepare("UPDATE users SET role=?,desk=?,active=? WHERE id=?")
        .run(input.role, input.desk, input.active ? 1 : 0, id);
      assert(result.changes, 404, "USER_NOT_FOUND", "Usuário não encontrado.");
      db.prepare("DELETE FROM sessions WHERE user_id=?").run(id);
      audit(user.id, id, "user.permissions_changed");
      return { ok: true };
    }
  }
  if (resource === "assignments") {
    if (method === "GET" && !id) return listAssignments(user, q, offset);
    if (method === "GET" && id && !action) return getAssignment(user, id);
    if (method === "POST" && !id) return createAssignment(user, body);
    if (method === "PATCH" && id && !action) return updateAssignment(user, id, body);
    if (id && action === "notes") {
      getAssignment(user, id);
      if (method === "GET")
        return db
          .prepare(
            "SELECT n.*,u.name AS author_name FROM assignment_notes n JOIN users u ON u.id=n.actor_id WHERE assignment_id=? ORDER BY created_at DESC LIMIT 100",
          )
          .all(id);
      if (method === "POST") {
        const input = z.object({ body: z.string().trim().min(1).max(20000) }).parse(body);
        const noteId = randomUUID();
        db.prepare("INSERT INTO assignment_notes VALUES (?,?,?,?,?)").run(
          noteId,
          id,
          input.body,
          user.id,
          new Date().toISOString(),
        );
        audit(user.id, id, "assignment.note_added");
        return { id: noteId };
      }
    }
  }
  if (resource === "stories") {
    if (method === "GET" && !id) return listStories(user, q, offset);
    if (method === "GET" && id && !action) return getStory(user, id);
    if (method === "POST" && !id) return createStory(user, body);
    if (method === "PATCH" && id && !action) return updateStory(user, id, body);
    if (method === "POST" && id && action === "transition") return transitionStory(user, id, body);
    if (method === "GET" && id && action === "versions") return versions(user, id);
    if (method === "POST" && id && action === "restore") {
      const input = z
        .object({ version: z.number().int().positive(), base: z.number().int().positive() })
        .parse(body);
      return restoreVersion(user, id, input.version, input.base);
    }
  }
  if (resource === "sources") {
    if (method === "GET") return listSources(user);
    if (method === "POST") return createSource(user, body);
  }
  if (resource === "tasks") {
    if (method === "GET")
      return db
        .prepare(
          "SELECT * FROM tasks WHERE assignee_id=? OR created_by=? OR ?=1 ORDER BY completed,deadline LIMIT 100",
        )
        .all(user.id, user.id, user.role === "chief" ? 1 : 0);
    if (method === "POST" && !id) {
      assert(
        ["reporter", "producer", "editor", "chief"].includes(user.role),
        403,
        "FORBIDDEN",
        "Seu perfil não pode criar tarefas.",
      );
      const input = taskSchema.parse(body);
      const assignee = db
        .prepare("SELECT id,desk,role FROM users WHERE id=? AND active=1")
        .get(input.assignee_id);
      assert(
        assignee &&
          (user.id === input.assignee_id ||
            user.role === "chief" ||
            (isEditor(user) && assignee.desk === user.desk)),
        403,
        "FORBIDDEN",
        "Não é possível atribuir a tarefa a esta pessoa.",
      );
      if (input.assignment_id) getAssignment(user, input.assignment_id);
      const taskId = randomUUID();
      db.prepare("INSERT INTO tasks VALUES (?,?,?,?,?,?,0,?)").run(
        taskId,
        input.title,
        input.assignee_id,
        input.assignment_id,
        input.deadline,
        input.priority,
        user.id,
      );
      audit(user.id, taskId, "task.created");
      return { id: taskId };
    }
    if (method === "PATCH" && id) {
      const input = z.object({ completed: z.boolean() }).parse(body);
      const task = db.prepare("SELECT * FROM tasks WHERE id=?").get(id);
      assert(task, 404, "TASK_NOT_FOUND", "Tarefa não encontrada.");
      assert(
        task.assignee_id === user.id || task.created_by === user.id || user.role === "chief",
        403,
        "FORBIDDEN",
        "Você não pode alterar esta tarefa.",
      );
      db.prepare("UPDATE tasks SET completed=? WHERE id=?").run(input.completed ? 1 : 0, id);
      audit(user.id, id, "task.updated");
      return { ok: true };
    }
  }
  if (resource === "notifications") {
    if (method === "GET")
      return db
        .prepare("SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 100")
        .all(user.id);
    if (method === "PATCH") {
      if (id === "all")
        db.prepare("UPDATE notifications SET read_at=? WHERE user_id=? AND read_at IS NULL").run(
          new Date().toISOString(),
          user.id,
        );
      else
        db.prepare("UPDATE notifications SET read_at=? WHERE id=? AND user_id=?").run(
          new Date().toISOString(),
          id ?? "",
          user.id,
        );
      return { ok: true };
    }
  }
  if (resource === "audit" && method === "GET") {
    if (id) {
      const assignment = db.prepare("SELECT id FROM assignments WHERE id=?").get(id);
      if (assignment) getAssignment(user, id);
      else getStory(user, id);
      return db
        .prepare(
          "SELECT a.*,u.name AS actor_name FROM audit_events a JOIN users u ON u.id=a.actor_id WHERE entity_id=? ORDER BY created_at DESC LIMIT 100",
        )
        .all(id);
    }
    assert(
      ["admin", "chief"].includes(user.role),
      403,
      "FORBIDDEN",
      "Você não possui acesso à auditoria global.",
    );
    return db
      .prepare(
        "SELECT a.*,u.name AS actor_name FROM audit_events a JOIN users u ON u.id=a.actor_id ORDER BY created_at DESC LIMIT 100 OFFSET ?",
      )
      .all(offset);
  }
  if (resource === "search" && method === "GET")
    return { assignments: listAssignments(user, q), stories: listStories(user, q) };
  throw new AppError(404, "ENDPOINT_NOT_FOUND", "Recurso não encontrado.");
}
async function handle(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const requestId = randomUUID(),
    method = request.method;
  const response = (data: unknown, status = 200) =>
    NextResponse.json(data, {
      status,
      headers: { "X-Request-Id": requestId, "Cache-Control": "no-store" },
    });
  try {
    const { path } = await context.params;
    assert(path.length <= 3, 404, "ENDPOINT_NOT_FOUND", "Recurso não encontrado.");
    const mutation = method !== "GET";
    if (mutation) {
      const expected = process.env.APP_ORIGIN ?? request.nextUrl.origin;
      assert(
        request.headers.get("origin") === expected,
        403,
        "INVALID_ORIGIN",
        "Origem da requisição não autorizada.",
      );
      assert(
        request.headers.get("content-type")?.includes("application/json"),
        415,
        "INVALID_CONTENT_TYPE",
        "Envie dados JSON.",
      );
      assert(
        Number(request.headers.get("content-length") ?? 0) <= 1_000_000,
        413,
        "BODY_TOO_LARGE",
        "Requisição muito grande.",
      );
    }
    const raw = mutation ? await request.text() : "";
    assert(raw.length <= 1_000_000, 413, "BODY_TOO_LARGE", "Requisição muito grande.");
    let body: unknown = {};
    if (raw) {
      try {
        body = JSON.parse(raw);
      } catch {
        throw new AppError(400, "INVALID_JSON", "JSON inválido.");
      }
    }
    if (path.join("/") === "auth/setup" && method === "GET")
      return response({ required: needsSetup() });
    if (path.join("/") === "auth/setup" && method === "POST") {
      setup(setupSchema.parse(body));
      return response({ ok: true }, 201);
    }
    if (path.join("/") === "auth/login" && method === "POST") {
      const input = credentialsSchema.parse(body),
        session = login(input.email, input.password);
      const result = response({ ok: true });
      result.cookies.set(cookieName, session.token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: session.maxAge,
        path: "/",
      });
      return result;
    }
    const token = request.cookies.get(cookieName)?.value,
      user = sessionUser(token);
    assert(user, 401, "UNAUTHENTICATED", "Sua sessão expirou. Entre novamente.");
    if (path.join("/") === "auth/logout" && method === "POST") {
      logout(token);
      const result = response({ ok: true });
      result.cookies.delete(cookieName);
      return result;
    }
    if (!mutation) return response(dispatch(user, method, path, body, request.nextUrl));
    const key = request.headers.get("idempotency-key");
    assert(
      key && /^[a-zA-Z0-9-]{16,100}$/.test(key),
      400,
      "IDEMPOTENCY_KEY_REQUIRED",
      "A operação precisa de uma chave de idempotência.",
    );
    const fingerprint = hashToken(`${method}:${path.join("/")}:${raw}`);
    const value = transaction(() => {
      const db = getDb(),
        cached = db
          .prepare("SELECT * FROM idempotency WHERE key=? AND actor_id=?")
          .get(key, user.id);
      if (cached) {
        assert(
          cached.fingerprint === fingerprint,
          409,
          "IDEMPOTENCY_CONFLICT",
          "Esta operação já foi usada com outros dados.",
        );
        return JSON.parse(String(cached.response)) as unknown;
      }
      const data = dispatch(user, method, path, body, request.nextUrl);
      db.prepare("INSERT INTO idempotency VALUES (?,?,?,?,?)").run(
        key,
        user.id,
        fingerprint,
        JSON.stringify(data),
        Date.now(),
      );
      return data;
    });
    return response(value, method === "POST" ? 201 : 200);
  } catch (error) {
    if (error instanceof ZodError)
      return response(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
            requestId,
          },
        },
        422,
      );
    if (error instanceof AppError)
      return response(
        { error: { code: error.code, message: error.message, requestId } },
        error.status,
      );
    console.error(
      JSON.stringify({ event: "api.error", requestId, method, path: request.nextUrl.pathname }),
    );
    return response(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Não foi possível concluir. Tente novamente.",
          requestId,
        },
      },
      500,
    );
  }
}
export { handle as GET, handle as POST, handle as PATCH, handle as DELETE };
