"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Dashboard } from "./dashboard";
import { AssignmentList, AssignmentDetail } from "@/features/assignments/views";
import { StoryList, StoryEditor } from "@/features/stories/views";
import {
  SourcesView,
  TasksView,
  NotificationsView,
  AdminView,
  AuditView,
  SearchView,
  UnavailableView,
} from "./secondary";
import { EmptyState, LoadingState } from "@/components/ui";
export function WorkspaceView({ section }: { section: string[] }) {
  const [page, id, action] = section;
  if (!page || page === "redacao") return <Dashboard />;
  if (page === "pautas") return id ? <AssignmentDetail id={id} /> : <AssignmentList />;
  if (page === "agenda") return <AssignmentList calendar />;
  if (page === "materias")
    return id && action === "editar" ? <StoryEditor id={id} /> : <StoryList />;
  if (page === "aprovacoes") return <StoryList approvals />;
  if (page === "publicacoes") return <StoryList publications />;
  if (page === "fontes") return <SourcesView />;
  if (page === "tarefas") return <TasksView />;
  if (page === "notificacoes") return <NotificationsView />;
  if (page === "admin") return <AdminView />;
  if (page === "auditoria") return <AuditView />;
  if (page === "midia") return <UnavailableView kind="media" />;
  if (page === "analytics") return <UnavailableView kind="analytics" />;
  if (page === "busca")
    return (
      <Suspense fallback={<LoadingState />}>
        <SearchWithQuery />
      </Suspense>
    );
  return (
    <EmptyState
      title="Página não encontrada"
      description="Use a navegação para voltar ao seu workspace."
    />
  );
}
function SearchWithQuery() {
  const params = useSearchParams();
  return <SearchView key={params.get("q") ?? ""} initialQuery={params.get("q") ?? ""} />;
}
