"use client";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback, startTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  FileText,
  ArrowUpRight,
  Check,
  CloudUpload,
  History,
  Eye,
  Save,
  TriangleAlert,
} from "lucide-react";
import { useUser } from "@/components/shell";
import { useResource } from "@/hooks/use-resource";
import { api, ApiError } from "@/services/api";
import {
  Button,
  Dialog,
  Field,
  Input,
  PageTitle,
  Badge,
  EmptyState,
  ErrorState,
  State,
  formatDate,
} from "@/components/ui";
import { desks, statusLabels, type Status, type Story, type StoryVersion } from "@/types/domain";
import { localDate } from "@/features/assignments/views";
interface EditableStory extends Story {
  transitions: Status[];
  editable: boolean;
}
type Draft = Pick<Story, "title" | "subtitle" | "body" | "tags" | "seo_description" | "embargo"> & {
  sensitive: boolean;
};
const toDraft = (s: Story): Draft => ({
  title: s.title,
  subtitle: s.subtitle,
  body: s.body,
  tags: s.tags,
  seo_description: s.seo_description,
  embargo: s.embargo,
  sensitive: Boolean(s.sensitive),
});
export function StoryList({
  approvals = false,
  publications = false,
}: {
  approvals?: boolean;
  publications?: boolean;
}) {
  const user = useUser(),
    resource = useResource<Story[]>("stories"),
    router = useRouter();
  const [newStory, setNewStory] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [filter, setFilter] = useState("all"),
    [query, setQuery] = useState("");
  const rows = (resource.data ?? []).filter(
    (s) =>
      (approvals
        ? ["review", "legal"].includes(s.status)
        : publications
          ? ["scheduled", "published", "updated", "unpublished"].includes(s.status)
          : true) &&
      (filter === "all" || s.status === filter) &&
      s.title.toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR")),
  );
  async function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    try {
      const data = Object.fromEntries(new FormData(e.currentTarget));
      const story = await api<Story>("stories", "POST", data);
      router.push(`/materias/${story.id}/editar`);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageTitle
        eyebrow="PRODUÇÃO EDITORIAL"
        title={approvals ? "Fila de aprovações" : publications ? "Publicações" : "Matérias"}
        description={
          approvals
            ? "Um olhar atento antes de cada publicação."
            : publications
              ? "Acompanhe o que está no ar e o que vem a seguir."
              : "Histórias em construção, com contexto e controle."
        }
        action={
          !approvals &&
          !publications &&
          ["reporter", "editor", "chief", "freelancer"].includes(user.role) && (
            <Button onClick={() => setNewStory(true)}>
              <Plus size={17} />
              Nova matéria
            </Button>
          )
        }
      />
      <div className="panel">
        <div className="list-toolbar">
          <div className="tabs">
            <button className={filter === "all" ? "selected" : ""} onClick={() => setFilter("all")}>
              Todas <span>{rows.length}</span>
            </button>
            <select
              aria-label="Filtrar matérias por status"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Todos os status</option>
              {Object.entries(statusLabels).map(([key, label]) => (
                <option value={key} key={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <Input
            aria-label="Buscar matéria"
            placeholder="Buscar matéria…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="compact-input"
          />
        </div>
        <State loading={resource.loading} error={resource.error} retry={resource.reload}>
          {!rows.length ? (
            <EmptyState
              title={approvals ? "Tudo em dia por aqui" : "Nenhuma matéria encontrada"}
              description={
                approvals
                  ? "As matérias enviadas para revisão aparecerão nesta fila."
                  : "Crie uma matéria a partir de uma pauta ou comece uma nova história."
              }
            />
          ) : (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Matéria</th>
                    <th>Status</th>
                    <th>Autor</th>
                    <th>Última atualização</th>
                    <th>
                      <span className="sr-only">Abrir</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <Link href={`/materias/${s.id}/editar`} className="table-title">
                          {s.title}
                        </Link>
                        <small className="desk-label">
                          {s.desk} · versão {s.version}
                        </small>
                      </td>
                      <td>
                        <Badge status={s.status} />
                      </td>
                      <td>{s.author_name}</td>
                      <td>{formatDate(s.updated_at, true)}</td>
                      <td>
                        <Link
                          className="icon-button"
                          href={`/materias/${s.id}/editar`}
                          aria-label={`Abrir ${s.title}`}
                        >
                          <ArrowUpRight size={17} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </State>
      </div>
      {newStory && (
        <Dialog title="Nova matéria" onClose={() => setNewStory(false)}>
          <form onSubmit={create}>
            <Field label="Título inicial">
              <Input name="title" minLength={5} maxLength={200} required />
            </Field>
            <Field label="Editoria">
              <select name="desk">
                {(user.role === "chief" ? desks : [user.desk]).map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </Field>
            {error && <ErrorState message={error} />}
            <div className="dialog-actions">
              <Button variant="secondary" type="button" onClick={() => setNewStory(false)}>
                Cancelar
              </Button>
              <Button type="submit" busy={busy}>
                Abrir editor
              </Button>
            </div>
          </form>
        </Dialog>
      )}
    </>
  );
}
export function StoryEditor({ id }: { id: string }) {
  const resource = useResource<EditableStory>(`stories/${id}`);
  return (
    <State loading={resource.loading} error={resource.error} retry={resource.reload}>
      {resource.data && <EditorSession key={id} initial={resource.data} />}
    </State>
  );
}
function EditorSession({ initial }: { initial: EditableStory }) {
  const user = useUser(),
    [story, setStory] = useState(initial),
    [draft, setDraft] = useState<Draft>(toDraft(initial));
  const [saved, setSaved] = useState(JSON.stringify(toDraft(initial))),
    [saving, setSaving] = useState(false),
    [error, setError] = useState(""),
    [conflict, setConflict] = useState(false),
    [recovery, setRecovery] = useState<Draft | null>(null);
  const [target, setTarget] = useState<Status | null>(null),
    [history, setHistory] = useState(false),
    [preview, setPreview] = useState(false),
    [busy, setBusy] = useState(false);
  const version = useRef(initial.version),
    lock = useRef(false),
    draftRef = useRef(draft);
  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);
  const key = `newsroom:draft:${user.id}:${story.id}`,
    dirty = JSON.stringify(draft) !== saved;
  const historyData = useResource<StoryVersion[]>(`stories/${story.id}/versions`);
  const reloadHistory = historyData.reload;
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem(key);
      if (cached) {
        const entry = JSON.parse(cached);
        if (entry.draft && JSON.stringify(entry.draft) !== JSON.stringify(toDraft(initial)))
          startTransition(() => setRecovery(entry.draft));
      }
    } catch {
      /* Unavailable storage leaves server and in-memory editing usable. */
    }
  }, [key, initial]);
  useEffect(() => {
    if (dirty) {
      try {
        sessionStorage.setItem(key, JSON.stringify({ draft, base: version.current }));
      } catch {
        /* The beforeunload guard still protects unsaved in-memory data. */
      }
    }
  }, [draft, dirty, key]);
  useEffect(() => {
    const guard = (e: BeforeUnloadEvent) => {
      if (dirty || lock.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [dirty]);
  const save = useCallback(async () => {
    if (lock.current || conflict || !story.editable) return;
    const content = draftRef.current;
    if (JSON.stringify(content) === saved) return;
    lock.current = true;
    setSaving(true);
    setError("");
    try {
      const result = await api<EditableStory>(`stories/${story.id}`, "PATCH", {
        ...content,
        version: version.current,
      });
      version.current = result.version;
      setStory(result);
      setSaved(JSON.stringify(content));
      reloadHistory();
      if (JSON.stringify(draftRef.current) === JSON.stringify(content))
        sessionStorage.removeItem(key);
    } catch (error) {
      setError((error as Error).message);
      if (error instanceof ApiError && error.status === 409) setConflict(true);
    } finally {
      lock.current = false;
      setSaving(false);
    }
  }, [conflict, story.editable, story.id, saved, key, reloadHistory]);
  useEffect(() => {
    if (!dirty || recovery || conflict || !story.editable) return;
    const timer = setTimeout(() => void save(), 1500);
    return () => clearTimeout(timer);
  }, [draft, dirty, recovery, conflict, story.editable, save]);
  function patch<K extends keyof Draft>(field: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [field]: value }));
  }
  async function transition(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!target) return;
    setBusy(true);
    setError("");
    try {
      const data = Object.fromEntries(new FormData(e.currentTarget));
      const result = await api<EditableStory>(`stories/${story.id}/transition`, "POST", {
        target,
        version: version.current,
        reason: data.reason ?? "",
        scheduled_at: data.scheduled_at ? new Date(String(data.scheduled_at)).toISOString() : null,
      });
      version.current = result.version;
      setStory(result);
      setTarget(null);
      historyData.reload();
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function restore(v: number) {
    if (
      !window.confirm(
        `Restaurar a versão ${v}? Uma nova versão será criada e o histórico será preservado.`,
      )
    )
      return;
    setBusy(true);
    try {
      const result = await api<EditableStory>(`stories/${story.id}/restore`, "POST", {
        version: v,
        base: version.current,
      });
      version.current = result.version;
      setStory(result);
      const content = toDraft(result);
      setDraft(content);
      setSaved(JSON.stringify(content));
      setHistory(false);
      historyData.reload();
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function compare() {
    setBusy(true);
    try {
      const latest = await api<EditableStory>(`stories/${story.id}`);
      setStory(latest);
      version.current = latest.version;
      setSaved(JSON.stringify(toDraft(latest)));
      setConflict(false);
      setRecovery(draftRef.current);
      setPreview(false);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const words = draft.body.trim() ? draft.body.trim().split(/\s+/).length : 0;
  return (
    <>
      <Link
        href="/materias"
        className="back-link"
        onClick={(e) => {
          if (dirty && !window.confirm("Há alterações não salvas. Deseja sair?"))
            e.preventDefault();
        }}
      >
        ← Todas as matérias
      </Link>
      <div className="editor-top">
        <div>
          <div className="eyebrow">
            {story.desk.toUpperCase()} · VERSÃO {story.version}
          </div>
          <h1>Workspace da matéria</h1>
          <div className="button-group">
            <Badge status={story.status} />
            <span className={`save-state ${error ? "overdue" : ""}`} role="status">
              {saving ? (
                <>
                  <CloudUpload size={15} />
                  Salvando…
                </>
              ) : dirty ? (
                <>
                  <Save size={15} />
                  Alterações pendentes
                </>
              ) : (
                <>
                  <Check size={15} />
                  Salvo no servidor
                </>
              )}
            </span>
          </div>
        </div>
        <div className="button-group">
          <Button variant="secondary" onClick={() => setHistory(true)}>
            <History size={16} />
            Versões
          </Button>
          <Button variant="secondary" onClick={() => setPreview(!preview)}>
            <Eye size={16} />
            {preview ? "Editar" : "Preview"}
          </Button>
          {story.editable && (
            <Button onClick={() => void save()} busy={saving} disabled={!dirty || conflict}>
              Salvar
            </Button>
          )}
        </div>
      </div>
      {error && <ErrorState message={error} />}
      {conflict && (
        <div className="alert warning">
          <TriangleAlert size={20} />
          <div>
            <strong>Conflito de versões</strong>
            <p>
              Seu texto permanece nesta tela. Carregue a versão do servidor para comparar antes de
              salvar.
            </p>
            <Button variant="secondary" busy={busy} onClick={compare}>
              Carregar versão atual
            </Button>
          </div>
        </div>
      )}
      {recovery && (
        <div className="alert warning">
          <div>
            <strong>Existe um rascunho não sincronizado nesta sessão.</strong>
            <p>Confira seu texto antes de aplicá-lo à versão atual.</p>
            <details>
              <summary>Comparar conteúdo</summary>
              <div className="compare-grid">
                <pre>{story.body || "Versão do servidor vazia"}</pre>
                <pre>{recovery.body}</pre>
              </div>
            </details>
            <div className="button-group">
              <Button
                variant="secondary"
                onClick={() => {
                  setDraft(recovery);
                  setRecovery(null);
                }}
              >
                Aplicar meu rascunho
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setRecovery(null);
                  sessionStorage.removeItem(key);
                  setDraft(toDraft(story));
                  setSaved(JSON.stringify(toDraft(story)));
                }}
              >
                Usar versão do servidor
              </Button>
            </div>
          </div>
        </div>
      )}
      <div className="editor-grid">
        <section className="editor-canvas panel">
          {preview ? (
            <article className="story-preview">
              <div className="eyebrow">{story.desk}</div>
              <h1>{draft.title}</h1>
              <p className="story-subtitle">{draft.subtitle}</p>
              <small>Por {story.author_name} · Preview interno</small>
              <div className="article-body preserve-lines">{draft.body}</div>
            </article>
          ) : (
            <>
              <div className="editor-toolbar">
                <FileText size={16} />
                <span>Texto editorial</span>
                <span className="muted">Salvamento automático</span>
              </div>
              <div className="editor-writing">
                <label className="sr-only" htmlFor="story-title">
                  Título
                </label>
                <input
                  id="story-title"
                  className="story-title-input"
                  value={draft.title}
                  onChange={(e) => patch("title", e.target.value)}
                  disabled={!story.editable}
                  maxLength={200}
                  placeholder="O título da sua história"
                />
                <label className="sr-only" htmlFor="story-subtitle">
                  Linha fina
                </label>
                <textarea
                  id="story-subtitle"
                  className="story-subtitle-input"
                  value={draft.subtitle}
                  onChange={(e) => patch("subtitle", e.target.value)}
                  disabled={!story.editable}
                  rows={2}
                  maxLength={500}
                  placeholder="Uma linha fina para contextualizar a história…"
                />
                <div className="editor-byline">
                  Por {story.author_name} <span>·</span> {story.desk}
                </div>
                <label className="sr-only" htmlFor="story-body">
                  Corpo da matéria
                </label>
                <textarea
                  id="story-body"
                  className="story-body-input"
                  value={draft.body}
                  onChange={(e) => patch("body", e.target.value)}
                  disabled={!story.editable}
                  maxLength={500000}
                  placeholder="Comece a contar esta história…"
                  spellCheck
                  lang="pt-BR"
                />
              </div>
              <div className="editor-bottom">
                <span>
                  {words} palavras · {Math.max(1, Math.ceil(words / 200))} min de leitura
                </span>
                <span>Texto simples · pt-BR</span>
              </div>
            </>
          )}
        </section>
        <aside>
          <section className="panel inspector">
            <div className="panel-heading">
              <h2>Detalhes editoriais</h2>
              <SettingsIcon />
            </div>
            <Field
              label="Resumo SEO"
              hint={`${draft.seo_description.length} caracteres · mínimo 20 para revisão`}
            >
              <textarea
                value={draft.seo_description}
                onChange={(e) => patch("seo_description", e.target.value)}
                disabled={!story.editable}
                maxLength={500}
                rows={4}
              />
            </Field>
            <Field label="Tags">
              <Input
                value={draft.tags}
                onChange={(e) => patch("tags", e.target.value)}
                disabled={!story.editable}
                maxLength={500}
              />
            </Field>
            <Field label="Embargo até">
              <Input
                type="datetime-local"
                value={draft.embargo ? localDate(draft.embargo) : ""}
                onChange={(e) =>
                  patch("embargo", e.target.value ? new Date(e.target.value).toISOString() : null)
                }
                disabled={!story.editable}
              />
            </Field>
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={draft.sensitive}
                disabled={!story.editable || !["editor", "chief"].includes(user.role)}
                onChange={(e) => patch("sensitive", e.target.checked)}
              />
              Conteúdo sensível
            </label>
            <div className="slug-preview">
              <small>URL DA PUBLICAÇÃO</small>
              <code>/noticias/{story.slug}</code>
            </div>
          </section>
          <section className="panel inspector">
            <h2>Checklist editorial</h2>
            {[
              [draft.title.length >= 5, "Título definido"],
              [draft.body.trim().length >= 30, "Texto da matéria"],
              [draft.seo_description.trim().length >= 20, "Resumo SEO"],
              [story.approved_version === story.version, "Versão aprovada"],
            ].map(([ok, label]) => (
              <div className={`checklist-item ${ok ? "done" : ""}`} key={String(label)}>
                <span>{ok ? <Check size={13} /> : "○"}</span>
                {label}
              </div>
            ))}
            <small className="muted">
              Este checklist inicial não substitui a checagem factual e de direitos.
            </small>
          </section>
          <section className="panel inspector">
            <h2>Próximas etapas</h2>
            {story.transitions.length ? (
              story.transitions.map((t) => (
                <Button
                  key={t}
                  variant={t === "published" ? "primary" : "secondary"}
                  disabled={dirty || saving || busy || conflict}
                  onClick={() => setTarget(t)}
                >
                  {t === "published" ? "Publicar no site local" : statusLabels[t]}
                </Button>
              ))
            ) : (
              <p className="muted">Nenhuma transição disponível para seu perfil.</p>
            )}
            {dirty && <small className="muted">Salve as alterações para avançar.</small>}
            {story.published_at && (
              <Link className="text-link" href={`/noticias/${story.slug}`} target="_blank">
                Abrir página publicada ↗
              </Link>
            )}
          </section>
        </aside>
      </div>
      {target && (
        <Dialog title={`Confirmar: ${statusLabels[target]}`} onClose={() => setTarget(null)}>
          <form onSubmit={transition}>
            <p>A transição será validada no servidor e registrada no histórico.</p>
            {target === "scheduled" && (
              <Field label="Data e hora de publicação (horário do dispositivo)">
                <Input name="scheduled_at" type="datetime-local" required />
              </Field>
            )}
            <Field label="Motivo / observação">
              <textarea
                name="reason"
                rows={3}
                maxLength={2000}
                required={["changes", "unpublished", "archived"].includes(target)}
                minLength={["changes", "unpublished", "archived"].includes(target) ? 5 : undefined}
              />
            </Field>
            <div className="dialog-actions">
              <Button variant="secondary" type="button" onClick={() => setTarget(null)}>
                Cancelar
              </Button>
              <Button type="submit" busy={busy}>
                Confirmar transição
              </Button>
            </div>
          </form>
        </Dialog>
      )}
      {history && (
        <Dialog title="Histórico de versões" onClose={() => setHistory(false)} wide>
          <State loading={historyData.loading} error={historyData.error} retry={historyData.reload}>
            {historyData.data?.map((v) => (
              <div className="version-row" key={v.id}>
                <div>
                  <strong>Versão {v.version}</strong>
                  <p>{v.reason}</p>
                  <small>
                    {v.actor_name} · {formatDate(v.created_at)}
                  </small>
                  <details>
                    <summary>Visualizar conteúdo</summary>
                    <pre className="version-snapshot">
                      {JSON.parse(v.snapshot).title}
                      {"\n\n"}
                      {JSON.parse(v.snapshot).body}
                    </pre>
                  </details>
                </div>
                <Button
                  variant="secondary"
                  disabled={!story.editable || busy || dirty}
                  onClick={() => void restore(v.version)}
                >
                  Restaurar
                </Button>
              </div>
            ))}
          </State>
        </Dialog>
      )}
    </>
  );
}
function SettingsIcon() {
  return <span className="muted">•••</span>;
}
