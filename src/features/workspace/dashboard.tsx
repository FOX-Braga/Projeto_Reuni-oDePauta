"use client";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowUpRight,
  Plus,
  NotebookPen,
  FileText,
  CircleCheck,
  Clock3,
  ArrowRight,
  CalendarDays,
  CheckCheck,
} from "lucide-react";
import { useUser } from "@/components/shell";
import { useNow } from "@/hooks/use-now";
import { useResource } from "@/hooks/use-resource";
import { PageTitle, Button, State, EmptyState, Badge, formatDate } from "@/components/ui";
import { AssignmentForm, AssignmentTable } from "@/features/assignments/views";
import { canCreateAssignment } from "@/features/workflow/rules";
import type { Assignment, Story, Notification } from "@/types/domain";
export function Dashboard() {
  const now = useNow();
  const user = useUser(),
    assignments = useResource<Assignment[]>("assignments"),
    stories = useResource<Story[]>("stories"),
    notifications = useResource<Notification[]>("notifications");
  const [modal, setModal] = useState(false);
  const active = assignments.data?.filter((a) => a.status !== "archived") ?? [],
    review = stories.data?.filter((s) => ["review", "legal"].includes(s.status)) ?? [],
    late = active.filter((a) => Date.parse(a.deadline) < now);
  const date = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(now || 1792152000000));
  const metrics = [
    {
      label: "Pautas em andamento",
      value: active.length,
      icon: NotebookPen,
      note: "Coberturas do seu workspace",
      color: "orange",
      href: "/pautas",
    },
    {
      label: "Matérias em produção",
      value:
        stories.data?.filter((s) => ["draft", "reporting", "writing", "changes"].includes(s.status))
          .length ?? 0,
      icon: FileText,
      note: "Histórias ganhando forma",
      color: "blue",
      href: "/materias",
    },
    {
      label: "Aguardando revisão",
      value: review.length,
      icon: CircleCheck,
      note: "Prontas para um novo olhar",
      color: "purple",
      href: "/aprovacoes",
    },
    {
      label: "Prazos em atenção",
      value: late.length,
      icon: Clock3,
      note: late.length ? "Pautas com prazo vencido" : "Nenhum prazo vencido",
      color: "red",
      href: "/agenda",
    },
  ];
  return (
    <>
      <PageTitle
        eyebrow={date.toUpperCase()}
        title={`Olá, ${user.name.split(" ")[0]}. Bom trabalho!`}
        description="Sua redação em um só lugar. Vamos às histórias de hoje?"
        action={
          canCreateAssignment(user) && (
            <Button onClick={() => setModal(true)}>
              <Plus size={17} />
              Nova pauta
            </Button>
          )
        }
      />
      {user.role === "admin" ? (
        <div className="welcome-banner">
          <div className="welcome-icon">
            <CheckCheck size={30} />
          </div>
          <div>
            <strong>Seu workspace está pronto para receber a equipe.</strong>
            <p>Cadastre um editor-chefe e os repórteres para começar o fluxo editorial.</p>
            <Link href="/admin" className="text-link">
              Gerenciar equipe <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      ) : (
        <div className="welcome-banner">
          <div className="welcome-icon">
            <NotebookPen size={27} />
          </div>
          <div>
            <strong>Uma redação conectada faz a diferença.</strong>
            <p>Planeje coberturas, acompanhe prazos e transforme boas pautas em histórias.</p>
          </div>
          <span className="banner-label">
            DO INSIGHT À PUBLICAÇÃO <ArrowUpRight size={16} />
          </span>
        </div>
      )}
      <div className="metric-grid">
        {metrics.map((m) => (
          <Link href={m.href} key={m.label} className="metric-card">
            <div className="metric-top">
              <span>{m.label}</span>
              <span className={`metric-icon ${m.color}`}>
                <m.icon size={18} />
              </span>
            </div>
            <div className="metric-value">
              {assignments.loading || stories.loading ? "—" : m.value}
              <ArrowUpRight size={17} />
            </div>
            <small>{m.note}</small>
          </Link>
        ))}
      </div>
      <div className="dashboard-grid">
        <div className="dashboard-main">
          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2>
                  Pautas em foco <span className="count-pill">{active.length}</span>
                </h2>
                <p>Prioridades e próximos prazos da sua redação.</p>
              </div>
              <Link href="/pautas" className="text-link">
                Ver todas <ArrowRight size={14} />
              </Link>
            </div>
            <State
              loading={assignments.loading}
              error={assignments.error}
              retry={assignments.reload}
            >
              {active.length ? (
                <AssignmentTable rows={active.slice(0, 5)} compact />
              ) : (
                <EmptyState
                  title="A próxima história começa com uma pauta"
                  description="Organize o briefing, defina os responsáveis e acompanhe a cobertura."
                  action={
                    canCreateAssignment(user) && (
                      <Button variant="secondary" onClick={() => setModal(true)}>
                        <Plus size={16} />
                        Criar primeira pauta
                      </Button>
                    )
                  }
                />
              )}
            </State>
          </section>
          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2>Matérias em movimento</h2>
                <p>Acompanhe as últimas atualizações editoriais.</p>
              </div>
              <Link href="/materias" className="text-link">
                Ver matérias <ArrowRight size={14} />
              </Link>
            </div>
            <State loading={stories.loading} error={stories.error} retry={stories.reload}>
              {stories.data?.length ? (
                <div className="story-feed">
                  {stories.data.slice(0, 3).map((s) => (
                    <Link href={`/materias/${s.id}/editar`} key={s.id} className="story-feed-item">
                      <span className="story-feed-icon">
                        <FileText size={20} />
                      </span>
                      <div>
                        <small>
                          {s.desk} · {s.author_name}
                        </small>
                        <h3>{s.title}</h3>
                        <span className="muted">{formatDate(s.updated_at, true)}</span>
                      </div>
                      <Badge status={s.status} />
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Histórias a caminho"
                  description="As matérias da equipe aparecerão aqui com status e última atualização."
                />
              )}
            </State>
          </section>
        </div>
        <aside className="dashboard-aside">
          <section className="panel agenda-panel">
            <div className="panel-heading">
              <h2>
                <CalendarDays size={18} />
                Próximas entregas
              </h2>
              <Link href="/agenda" aria-label="Abrir agenda" className="icon-button">
                <ArrowUpRight size={17} />
              </Link>
            </div>
            <State loading={assignments.loading} error={assignments.error}>
              {active.length ? (
                active.slice(0, 4).map((a) => (
                  <Link href={`/pautas/${a.id}`} className="agenda-item" key={a.id}>
                    <div className="agenda-date">
                      <strong>
                        {new Intl.DateTimeFormat("pt-BR", {
                          day: "2-digit",
                          timeZone: "America/Sao_Paulo",
                        }).format(new Date(a.deadline))}
                      </strong>
                      <small>
                        {new Intl.DateTimeFormat("pt-BR", {
                          month: "short",
                          timeZone: "America/Sao_Paulo",
                        }).format(new Date(a.deadline))}
                      </small>
                    </div>
                    <div>
                      <small>{a.desk}</small>
                      <strong>{a.title}</strong>
                      <span>
                        <Clock3 size={12} />
                        {formatDate(a.deadline, true)}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="small-empty">
                  <CalendarDays size={26} />
                  <p>Nenhuma entrega programada.</p>
                  <small>Um espaço para planejar o que vem a seguir.</small>
                </div>
              )}
            </State>
            <Link href="/agenda" className="panel-footer-link">
              Abrir agenda editorial <ArrowRight size={15} />
            </Link>
          </section>
          <section className="panel">
            <div className="panel-heading">
              <h2>Últimas atividades</h2>
              <span className="live-dot" />
            </div>
            <State loading={notifications.loading} error={notifications.error}>
              {notifications.data?.length ? (
                <div className="activity-list">
                  {notifications.data.slice(0, 4).map((n) => (
                    <Link href={n.href} className="activity-item" key={n.id}>
                      <span className="activity-bullet" />
                      <div>
                        <strong>{n.title}</strong>
                        <small>{formatDate(n.created_at, true)}</small>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="small-empty">
                  <CheckCheck size={25} />
                  <p>Tudo tranquilo por enquanto.</p>
                  <small>Novas atribuições e revisões chegam aqui.</small>
                </div>
              )}
            </State>
          </section>
          <div className="editorial-quote">
            <span>“</span>
            <p>
              Uma boa história merece
              <br />
              um processo à altura.
            </p>
            <small>MAIS CONTEXTO. MELHOR JORNALISMO.</small>
          </div>
        </aside>
      </div>
      {modal && <AssignmentForm onClose={() => setModal(false)} onSaved={assignments.reload} />}
    </>
  );
}
