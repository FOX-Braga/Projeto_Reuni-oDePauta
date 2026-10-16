"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
  Plus,
  ShieldCheck,
  LockKeyhole,
  Check,
  Bell,
  Link2,
  Users,
  Database,
  Unplug,
} from "lucide-react";
import { useUser } from "@/components/shell";
import { useResource } from "@/hooks/use-resource";
import { api } from "@/services/api";
import {
  PageTitle,
  Button,
  State,
  EmptyState,
  ErrorState,
  Dialog,
  Field,
  Input,
  Avatar,
  formatDate,
  PriorityBadge,
} from "@/components/ui";
import {
  desks,
  roles,
  roleLabels,
  priorityLabels,
  type User,
  type Source,
  type Task,
  type Notification,
  type AuditEvent,
  type Assignment,
  type Story,
} from "@/types/domain";
export function SourcesView() {
  const resource = useResource<Source[]>("sources"),
    [modal, setModal] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [query, setQuery] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    try {
      await api("sources", "POST", Object.fromEntries(new FormData(e.currentTarget)));
      setModal(false);
      resource.reload();
      setError("");
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const rows =
    resource.data?.filter((s) =>
      `${s.name} ${s.organization}`
        .toLocaleLowerCase("pt-BR")
        .includes(query.toLocaleLowerCase("pt-BR")),
    ) ?? [];
  return (
    <>
      <PageTitle
        eyebrow="APURAÇÃO E RELACIONAMENTO"
        title="Fontes e contatos"
        description="Contexto e confiança para cada cobertura."
        action={
          <Button onClick={() => setModal(true)}>
            <Plus size={17} />
            Nova fonte
          </Button>
        }
      />
      <div className="alert info">
        <ShieldCheck size={20} />
        <div>
          Contatos são criptografados no banco. Fontes confidenciais são visíveis apenas para quem
          as cadastrou; o acesso é auditado.
        </div>
      </div>
      <div className="panel">
        <div className="list-toolbar">
          <strong>Base de fontes</strong>
          <Input
            aria-label="Buscar fonte"
            placeholder="Nome ou organização…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="compact-input"
          />
        </div>
        <State loading={resource.loading} error={resource.error} retry={resource.reload}>
          {rows.length ? (
            <div className="source-grid">
              {rows.map((s) => (
                <article className="source-card" key={s.id}>
                  <div className="person-inline">
                    <Avatar name={s.name} />
                    <div>
                      <h3>{s.name}</h3>
                      <small>
                        {s.position} {s.organization && `· ${s.organization}`}
                      </small>
                    </div>
                  </div>
                  <p>
                    {s.email || "Sem e-mail"}
                    <br />
                    {s.phone || "Sem telefone"}
                  </p>
                  {s.confidentiality === "confidential" && (
                    <span className="confidential">
                      <LockKeyhole size={13} />
                      Confidencial
                    </span>
                  )}
                  <details>
                    <summary>Notas e consentimento</summary>
                    <p className="preserve-lines">{s.notes || "Sem observações"}</p>
                    <small>{s.consent || "Consentimento não registrado"}</small>
                  </details>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Uma boa apuração começa por boas fontes"
              description="Cadastre contatos e defina os cuidados de confidencialidade."
            />
          )}
        </State>
      </div>
      {modal && (
        <Dialog title="Cadastrar fonte" onClose={() => setModal(false)} wide>
          <form onSubmit={submit}>
            <Field label="Nome / identificador">
              <Input name="name" required maxLength={200} />
            </Field>
            <div className="form-row">
              <Field label="Organização">
                <Input name="organization" maxLength={200} />
              </Field>
              <Field label="Cargo">
                <Input name="position" maxLength={200} />
              </Field>
            </div>
            <div className="form-row">
              <Field label="E-mail">
                <Input name="email" type="email" />
              </Field>
              <Field label="Telefone">
                <Input name="phone" type="tel" maxLength={60} />
              </Field>
            </div>
            <Field label="Confidencialidade">
              <select name="confidentiality">
                <option value="internal">Interna · equipe editorial autorizada</option>
                <option value="confidential">Confidencial · somente você</option>
              </select>
            </Field>
            <Field label="Observações">
              <textarea name="notes" rows={3} maxLength={5000} />
            </Field>
            <Field label="Consentimento / restrições de contato">
              <textarea name="consent" rows={2} maxLength={1000} />
            </Field>
            {error && <ErrorState message={error} />}
            <div className="dialog-actions">
              <Button type="button" variant="secondary" onClick={() => setModal(false)}>
                Cancelar
              </Button>
              <Button busy={busy} type="submit">
                Salvar fonte
              </Button>
            </div>
          </form>
        </Dialog>
      )}
    </>
  );
}
export function TasksView() {
  const user = useUser(),
    resource = useResource<Task[]>("tasks"),
    people = useResource<User[]>("people");
  const [modal, setModal] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    try {
      const input = Object.fromEntries(new FormData(e.currentTarget));
      await api("tasks", "POST", {
        ...input,
        deadline: new Date(String(input.deadline)).toISOString(),
      });
      setModal(false);
      resource.reload();
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function toggle(task: Task) {
    setBusy(true);
    try {
      await api(`tasks/${task.id}`, "PATCH", { completed: !task.completed });
      resource.reload();
      setError("");
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageTitle
        eyebrow="ORGANIZAÇÃO DO TRABALHO"
        title="Minhas tarefas"
        description="Pequenos passos que fazem a cobertura avançar."
        action={
          <Button onClick={() => setModal(true)}>
            <Plus size={17} />
            Nova tarefa
          </Button>
        }
      />
      {error && <ErrorState message={error} />}
      <div className="panel">
        <State loading={resource.loading} error={resource.error} retry={resource.reload}>
          {resource.data?.length ? (
            resource.data.map((t) => (
              <div className={`task-row ${t.completed ? "completed" : ""}`} key={t.id}>
                <button
                  disabled={busy}
                  onClick={() => void toggle(t)}
                  aria-label={t.completed ? `Reabrir ${t.title}` : `Concluir ${t.title}`}
                  className="task-check"
                  aria-pressed={!!t.completed}
                >
                  {!!t.completed && <Check size={16} />}
                </button>
                <div>
                  <strong>{t.title}</strong>
                  <small>{formatDate(t.deadline)}</small>
                </div>
                <PriorityBadge priority={t.priority} />
              </div>
            ))
          ) : (
            <EmptyState
              title="Seu dia, organizado"
              description="Crie tarefas para acompanhar os próximos passos da apuração."
            />
          )}
        </State>
      </div>
      {modal && (
        <Dialog title="Nova tarefa" onClose={() => setModal(false)}>
          <form onSubmit={create}>
            <Field label="O que precisa ser feito?">
              <Input name="title" required maxLength={200} />
            </Field>
            <Field label="Responsável">
              <select name="assignee_id" defaultValue={user.id}>
                {people.data?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Prazo">
              <Input name="deadline" type="datetime-local" required />
            </Field>
            <Field label="Prioridade">
              <select name="priority" defaultValue="normal">
                {Object.entries(priorityLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <div className="dialog-actions">
              <Button type="submit" busy={busy}>
                Criar tarefa
              </Button>
            </div>
          </form>
        </Dialog>
      )}
    </>
  );
}
export function NotificationsView() {
  const resource = useResource<Notification[]>("notifications"),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function read(id: string) {
    setBusy(true);
    try {
      await api(`notifications/${id}`, "PATCH", {});
      resource.reload();
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageTitle
        eyebrow="ACOMPANHE SUA REDAÇÃO"
        title="Notificações"
        description="O que mudou e o que precisa da sua atenção."
        action={
          <Button variant="secondary" busy={busy} onClick={() => void read("all")}>
            Marcar todas como lidas
          </Button>
        }
      />
      {error && <ErrorState message={error} />}
      <div className="panel">
        <State loading={resource.loading} error={resource.error} retry={resource.reload}>
          {resource.data?.length ? (
            resource.data.map((n) => (
              <div className={`notification-row ${n.read_at ? "read" : ""}`} key={n.id}>
                <Bell size={19} />
                <div>
                  <Link href={n.href}>{n.title}</Link>
                  <small>{formatDate(n.created_at)}</small>
                </div>
                {!n.read_at && (
                  <Button variant="ghost" disabled={busy} onClick={() => void read(n.id)}>
                    Marcar como lida
                  </Button>
                )}
              </div>
            ))
          ) : (
            <EmptyState
              title="Tudo em dia"
              description="Você receberá aqui atribuições, revisões e avisos de publicação."
            />
          )}
        </State>
      </div>
    </>
  );
}
export function AdminView() {
  const user = useUser(),
    resource = useResource<User[]>("people"),
    [modal, setModal] = useState(false),
    [editing, setEditing] = useState<User | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    try {
      const data = Object.fromEntries(new FormData(e.currentTarget));
      if (editing) {
        if (
          !window.confirm(
            "Confirmar mudança de permissões? As sessões desta pessoa serão encerradas.",
          )
        )
          return;
        await api(`users/${editing.id}`, "PATCH", { ...data, active: data.active === "on" });
      } else await api("users", "POST", data);
      setModal(false);
      setEditing(null);
      resource.reload();
      setError("");
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (user.role !== "admin")
    return (
      <ErrorState message="403 · Apenas administradores podem acessar a gestão de usuários." />
    );
  return (
    <>
      <PageTitle
        eyebrow="GOVERNANÇA DO WORKSPACE"
        title="Administração"
        description="Pessoas, papéis e acesso à redação."
        action={
          <Button
            onClick={() => {
              setEditing(null);
              setModal(true);
            }}
          >
            <Plus size={17} />
            Adicionar pessoa
          </Button>
        }
      />
      <div className="alert info">
        <ShieldCheck size={20} />
        <div>
          Administração técnica e autoridade editorial são independentes. Crie contas com papel de
          editor-chefe, editor ou repórter para produzir conteúdo.
        </div>
      </div>
      <section className="panel">
        <div className="panel-heading">
          <h2>
            <Users size={18} />
            Equipe da redação
          </h2>
        </div>
        <State loading={resource.loading} error={resource.error} retry={resource.reload}>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Pessoa</th>
                  <th>Papel</th>
                  <th>Editoria</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {resource.data?.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="person-inline">
                        <Avatar name={p.name} small />
                        <div>
                          <strong>{p.name}</strong>
                          <small className="desk-label">{p.email}</small>
                        </div>
                      </div>
                    </td>
                    <td>{roleLabels[p.role]}</td>
                    <td>{p.desk}</td>
                    <td>{p.active ? "Ativa" : "Desativada"}</td>
                    <td>
                      <Button
                        variant="ghost"
                        disabled={p.id === user.id}
                        onClick={() => {
                          setEditing(p);
                          setModal(true);
                        }}
                      >
                        Editar acesso
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </State>
      </section>
      {modal && (
        <Dialog
          title={editing ? "Alterar acesso" : "Adicionar pessoa à equipe"}
          onClose={() => setModal(false)}
        >
          <form onSubmit={save}>
            {!editing && (
              <>
                <Field label="Nome">
                  <Input name="name" required maxLength={200} />
                </Field>
                <Field label="E-mail">
                  <Input name="email" type="email" required />
                </Field>
                <Field
                  label="Senha inicial"
                  hint="Pelo menos 12 caracteres. Entregue por um canal seguro."
                >
                  <Input
                    name="password"
                    type="password"
                    minLength={12}
                    maxLength={128}
                    required
                    autoComplete="new-password"
                  />
                </Field>
              </>
            )}
            <Field label="Papel">
              <select name="role" defaultValue={editing?.role ?? "reporter"}>
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {roleLabels[r]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Editoria">
              <select name="desk" defaultValue={editing?.desk ?? "Política"}>
                {desks.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </Field>
            {editing && (
              <label className="checkbox-field">
                <input type="checkbox" name="active" defaultChecked={!!editing.active} />
                Conta ativa
              </label>
            )}
            {error && <ErrorState message={error} />}
            <div className="dialog-actions">
              <Button type="button" variant="secondary" onClick={() => setModal(false)}>
                Cancelar
              </Button>
              <Button busy={busy} type="submit">
                {editing ? "Salvar permissões" : "Criar conta"}
              </Button>
            </div>
          </form>
        </Dialog>
      )}
    </>
  );
}
export function AuditView() {
  const resource = useResource<AuditEvent[]>("audit");
  return (
    <>
      <PageTitle
        eyebrow="RASTREABILIDADE"
        title="Auditoria editorial"
        description="Ações relevantes, responsáveis e motivos preservados."
      />
      <div className="panel">
        <State loading={resource.loading} error={resource.error} retry={resource.reload}>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ação</th>
                  <th>Responsável</th>
                  <th>Motivo</th>
                  <th>Data e hora</th>
                </tr>
              </thead>
              <tbody>
                {resource.data?.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <code>{a.action}</code>
                    </td>
                    <td>{a.actor_name}</td>
                    <td>{a.reason || "—"}</td>
                    <td>{formatDate(a.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </State>
      </div>
    </>
  );
}
export function SearchView({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery),
    [search, setSearch] = useState(initialQuery);
  const resource = useResource<{ assignments: Assignment[]; stories: Story[] }>(
    `search?q=${encodeURIComponent(search)}`,
  );
  return (
    <>
      <PageTitle
        eyebrow="RECUPERE CONTEXTO"
        title="Busca na redação"
        description="Pautas e matérias que você tem permissão para acessar."
      />
      <form
        className="search-page-form"
        onSubmit={(e) => {
          e.preventDefault();
          setSearch(query);
        }}
      >
        <Input
          aria-label="Termo de busca"
          placeholder="O que você procura?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button type="submit">Buscar</Button>
      </form>
      <div className="panel">
        <State loading={resource.loading} error={resource.error} retry={resource.reload}>
          {!resource.data?.assignments.length && !resource.data?.stories.length ? (
            <EmptyState title="Nenhum resultado" description="Experimente outro termo de busca." />
          ) : (
            <div className="search-results">
              {resource.data?.assignments.map((a) => (
                <Link key={a.id} href={`/pautas/${a.id}`}>
                  <span>Pauta · {a.desk}</span>
                  <h3>{a.title}</h3>
                  <Link2 size={16} />
                </Link>
              ))}
              {resource.data?.stories.map((s) => (
                <Link key={s.id} href={`/materias/${s.id}/editar`}>
                  <span>Matéria · {s.desk}</span>
                  <h3>{s.title}</h3>
                  <Link2 size={16} />
                </Link>
              ))}
            </div>
          )}
        </State>
      </div>
    </>
  );
}
export function UnavailableView({ kind }: { kind: "media" | "analytics" }) {
  return (
    <>
      <PageTitle
        eyebrow={kind === "media" ? "ACERVO EDITORIAL" : "DESEMPENHO EDITORIAL"}
        title={kind === "media" ? "Biblioteca de mídia" : "Analytics"}
        description={
          kind === "media"
            ? "Imagens, áudios e vídeos da redação."
            : "Dados para entender o impacto de cada história."
        }
      />
      <div className="panel">
        <EmptyState
          title={
            kind === "media"
              ? "Armazenamento de mídia ainda não configurado"
              : "Integração de analytics indisponível"
          }
          description={
            kind === "media"
              ? "O upload requer armazenamento seguro, validação de arquivos e processamento. Este módulo ainda não foi implementado."
              : "Conecte um provedor de métricas para consultar dados reais. Nenhum dado de audiência é simulado."
          }
          action={
            <div className="unavailable-chip">
              {kind === "media" ? <Database size={16} /> : <Unplug size={16} />}Integração pendente
            </div>
          }
        />
      </div>
    </>
  );
}
