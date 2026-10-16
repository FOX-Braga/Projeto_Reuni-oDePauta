"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
  Plus,
  Search,
  LayoutList,
  Columns3,
  ArrowUpRight,
  Clock3,
  MapPin,
  FileText,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@/components/shell";
import { useNow } from "@/hooks/use-now";
import { useResource } from "@/hooks/use-resource";
import { api } from "@/services/api";
import {
  Button,
  Field,
  Input,
  Dialog,
  Badge,
  PriorityBadge,
  EmptyState,
  ErrorState,
  State,
  PageTitle,
  Avatar,
  formatDate,
} from "@/components/ui";
import { desks, priorityLabels, type Assignment, type User, type AuditEvent } from "@/types/domain";
import { canCreateAssignment, isEditor } from "@/features/workflow/rules";
export function AssignmentForm({
  assignment,
  onClose,
  onSaved,
}: {
  assignment?: Assignment;
  onClose: () => void;
  onSaved: () => void;
}) {
  const user = useUser(),
    people = useResource<User[]>("people");
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [desk, setDesk] = useState(assignment?.desk ?? user.desk),
    [status, setStatus] = useState(assignment?.status ?? "draft");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const input = Object.fromEntries(new FormData(e.currentTarget));
      await api(
        assignment ? `assignments/${assignment.id}` : "assignments",
        assignment ? "PATCH" : "POST",
        {
          ...input,
          deadline: new Date(String(input.deadline)).toISOString(),
          ...(assignment ? { version: assignment.version, status } : {}),
        },
      );
      onSaved();
      onClose();
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog
      title={assignment ? "Editar pauta" : "Uma nova história começa aqui"}
      onClose={onClose}
      wide
    >
      <form onSubmit={submit} className="form-grid">
        <Field label="Título da pauta">
          <Input
            name="title"
            required
            minLength={5}
            maxLength={200}
            defaultValue={assignment?.title}
            placeholder="O que a redação precisa acompanhar?"
          />
        </Field>
        <Field label="Briefing">
          <textarea
            name="briefing"
            required
            minLength={10}
            maxLength={10000}
            defaultValue={assignment?.briefing}
            placeholder="Contexto, abordagem e perguntas que a apuração deve responder…"
            rows={4}
          />
        </Field>
        <div className="form-row">
          <Field label="Editoria">
            <select name="desk" value={desk} onChange={(e) => setDesk(e.target.value)}>
              {(user.role === "chief" ? desks : [user.desk]).map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </Field>
          <Field label="Prioridade">
            <select name="priority" defaultValue={assignment?.priority ?? "normal"}>
              {Object.entries(priorityLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="form-row">
          <Field label="Responsável">
            <select name="assignee_id" defaultValue={assignment?.assignee_id ?? user.id} required>
              {people.data
                ?.filter(
                  (p) =>
                    (p.desk === desk || p.role === "chief") && (isEditor(user) || p.id === user.id),
                )
                .map((p) => (
                  <option value={p.id} key={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>
          </Field>
          <Field label="Editor responsável">
            <select name="editor_id" defaultValue={assignment?.editor_id ?? ""} required>
              <option value="" disabled>
                Selecione um editor
              </option>
              {people.data
                ?.filter(
                  (p) =>
                    ["editor", "chief"].includes(p.role) && (p.desk === desk || p.role === "chief"),
                )
                .map((p) => (
                  <option value={p.id} key={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>
          </Field>
        </div>
        <div className="form-row">
          <Field label="Prazo editorial">
            <Input
              name="deadline"
              type="datetime-local"
              required
              defaultValue={assignment ? localDate(assignment.deadline) : ""}
            />
          </Field>
          <Field label="Localização">
            <Input
              name="location"
              defaultValue={assignment?.location}
              maxLength={300}
              placeholder="Local ou link da cobertura"
            />
          </Field>
        </div>
        <Field label="Tags">
          <Input
            name="tags"
            defaultValue={assignment?.tags}
            maxLength={500}
            placeholder="Separe por vírgulas"
          />
        </Field>
        {assignment && (
          <>
            <Field label="Status">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Assignment["status"])}
              >
                <option value="draft">Rascunho</option>
                <option value="reporting">Em apuração</option>
                <option value="writing">Em redação</option>
                <option value="archived">Arquivar</option>
              </select>
            </Field>
            {status === "archived" && (
              <Field label="Motivo do arquivamento">
                <textarea name="reason" required minLength={5} rows={2} />
              </Field>
            )}
          </>
        )}
        {people.error && <ErrorState message={people.error} retry={people.reload} />}{" "}
        {error && <ErrorState message={error} />}
        <div className="dialog-actions">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button busy={busy} disabled={people.loading || !!people.error} type="submit">
            {assignment ? "Salvar alterações" : "Criar pauta"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
export function localDate(value: string) {
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
export function AssignmentList({ calendar = false }: { calendar?: boolean }) {
  const user = useUser(),
    resource = useResource<Assignment[]>("assignments");
  const [modal, setModal] = useState(false),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("all"),
    [view, setView] = useState("list");
  const rows =
    resource.data?.filter(
      (a) =>
        (filter === "all" || a.priority === filter) &&
        `${a.title} ${a.briefing} ${a.tags}`
          .toLocaleLowerCase("pt-BR")
          .includes(query.toLocaleLowerCase("pt-BR")),
    ) ?? [];
  const groups = calendar
    ? [...new Set(rows.map((a) => formatDate(a.deadline).split(",")[0]))]
    : ["draft", "reporting", "writing", "archived"];
  return (
    <>
      <PageTitle
        eyebrow="PLANEJAMENTO EDITORIAL"
        title={calendar ? "Agenda editorial" : "Pautas"}
        description={
          calendar
            ? "Os próximos compromissos e entregas da redação."
            : "Da primeira ideia à próxima grande história."
        }
        action={
          canCreateAssignment(user) && (
            <Button onClick={() => setModal(true)}>
              <Plus size={17} />
              Nova pauta
            </Button>
          )
        }
      />
      <div className="panel">
        <div className="list-toolbar">
          <div className="tabs">
            <button className={filter === "all" ? "selected" : ""} onClick={() => setFilter("all")}>
              Todas as pautas <span>{resource.data?.length ?? 0}</span>
            </button>
            <button
              className={filter === "urgent" ? "selected" : ""}
              onClick={() => setFilter("urgent")}
            >
              Urgentes
            </button>
            <button
              className={filter === "high" ? "selected" : ""}
              onClick={() => setFilter("high")}
            >
              Alta prioridade
            </button>
          </div>
          <div className="list-tools">
            <div className="search-field">
              <Search size={16} />
              <input
                aria-label="Filtrar pautas"
                placeholder="Buscar pauta…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            {!calendar && (
              <div className="view-switch">
                <button
                  aria-label="Visualizar lista"
                  aria-pressed={view === "list"}
                  onClick={() => setView("list")}
                >
                  <LayoutList size={17} />
                </button>
                <button
                  aria-label="Visualizar por status"
                  aria-pressed={view === "kanban"}
                  onClick={() => setView("kanban")}
                >
                  <Columns3 size={17} />
                </button>
              </div>
            )}
          </div>
        </div>
        <State loading={resource.loading} error={resource.error} retry={resource.reload}>
          {rows.length === 0 ? (
            <EmptyState
              title="Nenhuma pauta encontrada"
              description="Crie uma pauta ou ajuste os filtros para começar."
            />
          ) : calendar || view === "kanban" ? (
            <div className={calendar ? "agenda-groups" : "kanban"}>
              {groups.map((group) => {
                const items = rows.filter((a) =>
                  calendar ? formatDate(a.deadline).split(",")[0] === group : a.status === group,
                );
                return (
                  <section key={group} className="kanban-column">
                    <h3>
                      {calendar
                        ? group
                        : {
                            draft: "Rascunho",
                            reporting: "Em apuração",
                            writing: "Em redação",
                            archived: "Arquivadas",
                          }[group]}{" "}
                      <span>{items.length}</span>
                    </h3>
                    {items.map((a) => (
                      <Link className="kanban-card" href={`/pautas/${a.id}`} key={a.id}>
                        <PriorityBadge priority={a.priority} />
                        <h4>{a.title}</h4>
                        <p>{a.desk}</p>
                        <div>
                          <Avatar name={a.assignee_name ?? "Equipe"} small />
                          <small>{formatDate(a.deadline, true)}</small>
                        </div>
                      </Link>
                    ))}
                  </section>
                );
              })}
            </div>
          ) : (
            <AssignmentTable rows={rows} />
          )}
        </State>
      </div>
      {modal && <AssignmentForm onClose={() => setModal(false)} onSaved={resource.reload} />}
    </>
  );
}
export function AssignmentTable({
  rows,
  compact = false,
}: {
  rows: Assignment[];
  compact?: boolean;
}) {
  const now = useNow();
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>Pauta / Editoria</th>
            <th>Status</th>
            <th>Prioridade</th>
            {!compact && <th>Responsável</th>}
            <th>Prazo</th>
            <th>
              <span className="sr-only">Abrir</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((a) => (
            <tr key={a.id}>
              <td>
                <Link className="table-title" href={`/pautas/${a.id}`}>
                  {a.title}
                </Link>
                <small className="desk-label">{a.desk}</small>
              </td>
              <td>
                <Badge status={a.status} />
              </td>
              <td>
                <PriorityBadge priority={a.priority} />
              </td>
              {!compact && (
                <td>
                  <div className="person-inline">
                    <Avatar name={a.assignee_name ?? "Equipe"} small />
                    <span>{a.assignee_name}</span>
                  </div>
                </td>
              )}
              <td>
                <span
                  className={
                    Date.parse(a.deadline) < now && a.status !== "archived" ? "overdue" : "deadline"
                  }
                >
                  <Clock3 size={13} />
                  {formatDate(a.deadline, true)}
                </span>
              </td>
              <td>
                <Link
                  className="icon-button"
                  href={`/pautas/${a.id}`}
                  aria-label={`Abrir ${a.title}`}
                >
                  <ArrowUpRight size={17} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function AssignmentDetail({ id }: { id: string }) {
  const resource = useResource<Assignment>(`assignments/${id}`),
    notes = useResource<{ id: string; body: string; author_name: string; created_at: string }[]>(
      `assignments/${id}/notes`,
    ),
    history = useResource<AuditEvent[]>(`audit/${id}`);
  const [edit, setEdit] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const router = useRouter();
  async function addNote(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true);
    try {
      await api(`assignments/${id}/notes`, "POST", { body: new FormData(form).get("body") });
      form.reset();
      notes.reload();
      history.reload();
      setError("");
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function story() {
    if (!resource.data) return;
    setBusy(true);
    try {
      const result = await api<{ id: string }>("stories", "POST", {
        title: resource.data.title,
        desk: resource.data.desk,
        assignment_id: id,
      });
      router.push(`/materias/${result.id}/editar`);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <State loading={resource.loading} error={resource.error} retry={resource.reload}>
      {resource.data && (
        <>
          <Link href="/pautas" className="back-link">
            ← Voltar às pautas
          </Link>
          <PageTitle
            eyebrow={resource.data.desk.toUpperCase()}
            title={resource.data.title}
            action={
              <div className="button-group">
                <Button variant="secondary" onClick={() => setEdit(true)}>
                  Editar pauta
                </Button>
                <Button busy={busy} onClick={story}>
                  <FileText size={17} />
                  Escrever matéria
                </Button>
              </div>
            }
          />
          <div className="detail-grid">
            <div>
              <section className="panel detail-panel">
                <div className="button-group">
                  <Badge status={resource.data.status} />
                  <PriorityBadge priority={resource.data.priority} />
                </div>
                <h2>Briefing da cobertura</h2>
                <p className="preserve-lines">{resource.data.briefing}</p>
                <div className="metadata-grid">
                  <div>
                    <small>RESPONSÁVEL</small>
                    <strong>{resource.data.assignee_name}</strong>
                  </div>
                  <div>
                    <small>PRAZO EDITORIAL</small>
                    <strong>{formatDate(resource.data.deadline)}</strong>
                  </div>
                  <div>
                    <small>LOCALIZAÇÃO</small>
                    <strong>
                      <MapPin size={14} />
                      {resource.data.location || "Não definida"}
                    </strong>
                  </div>
                  <div>
                    <small>TAGS</small>
                    <strong>{resource.data.tags || "Sem tags"}</strong>
                  </div>
                </div>
              </section>
              <section className="panel detail-panel">
                <h2>Caderno de apuração</h2>
                <p className="muted">Registre fatos, perguntas e informações de contexto.</p>
                <form onSubmit={addNote}>
                  <Field label="Adicionar nota">
                    <textarea
                      name="body"
                      required
                      maxLength={20000}
                      rows={4}
                      placeholder="O que você apurou?"
                    />
                  </Field>
                  <Button busy={busy} type="submit">
                    Salvar nota
                  </Button>
                </form>
                {error && <ErrorState message={error} />}
                <State loading={notes.loading} error={notes.error} retry={notes.reload}>
                  {notes.data?.map((n) => (
                    <article className="note" key={n.id}>
                      <div>
                        <strong>{n.author_name}</strong>
                        <small>{formatDate(n.created_at)}</small>
                      </div>
                      <p className="preserve-lines">{n.body}</p>
                    </article>
                  ))}
                </State>
              </section>
            </div>
            <aside className="panel detail-panel">
              <h2>Atividade da pauta</h2>
              <State loading={history.loading} error={history.error}>
                {history.data?.map((event) => (
                  <div className="timeline-event" key={event.id}>
                    <span className="timeline-dot" />
                    <strong>{event.actor_name}</strong>
                    <p>{event.action.replace("assignment.", "")}</p>
                    <small>{formatDate(event.created_at)}</small>
                    {event.reason && <p>{event.reason}</p>}
                  </div>
                ))}
              </State>
            </aside>
          </div>
          {edit && (
            <AssignmentForm
              assignment={resource.data}
              onClose={() => setEdit(false)}
              onSaved={() => {
                resource.reload();
                history.reload();
              }}
            />
          )}
        </>
      )}
    </State>
  );
}
