"use client";
import {
  useEffect,
  useId,
  useRef,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
} from "react";
import { X, Inbox, AlertCircle, LoaderCircle } from "lucide-react";
import { priorityLabels, statusLabels, type Priority, type Status } from "@/types/domain";
export function Button({
  variant = "primary",
  className = "",
  busy,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  busy?: boolean;
}) {
  return (
    <button
      className={`btn btn-${variant} ${className}`}
      {...props}
      disabled={props.disabled || busy}
      aria-busy={busy}
    >
      {busy && <LoaderCircle size={16} className="spin" />}
      {children}
    </button>
  );
}
export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  const id = useId(),
    hintId = `${id}-hint`;
  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<{ id?: string; "aria-describedby"?: string }>, {
        id,
        "aria-describedby": hint ? hintId : undefined,
      })
    : children;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {control}
      {hint && <small id={hintId}>{hint}</small>}
    </div>
  );
}
export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`input ${props.className ?? ""}`} />;
}
export function Badge({ status }: { status: Status }) {
  return (
    <span className={`badge status-${status}`}>
      <span className="status-dot" />
      {statusLabels[status]}
    </span>
  );
}
export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`priority priority-${priority}`}>
      <span>●</span> {priorityLabels[priority]}
    </span>
  );
}
export function EmptyState({
  title = "Nenhum registro por aqui",
  description = "Os registros aparecerão aqui assim que forem criados.",
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <Inbox size={28} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <div className="alert error" role="alert">
      <AlertCircle size={20} />
      <div>
        <strong>Não foi possível concluir</strong>
        <p>{message}</p>
        {retry && (
          <Button variant="secondary" onClick={retry}>
            Tentar novamente
          </Button>
        )}
      </div>
    </div>
  );
}
export function LoadingState() {
  return (
    <div className="loading" role="status">
      <LoaderCircle size={23} className="spin" />
      <span>Carregando informações…</span>
    </div>
  );
}
export function Dialog({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null),
    id = useId();
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement as HTMLElement;
    dialog?.showModal();
    return () => {
      dialog?.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`dialog ${wide ? "dialog-wide" : ""}`}
      aria-labelledby={id}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
    >
      <div className="dialog-head">
        <h2 id={id}>{title}</h2>
        <Button variant="ghost" onClick={onClose} aria-label="Fechar">
          <X size={20} />
        </Button>
      </div>
      {children}
    </dialog>
  );
}
export function Avatar({ name, small = false }: { name: string; small?: boolean }) {
  return (
    <span className={`avatar ${small ? "avatar-small" : ""}`} aria-label={name}>
      {name
        .split(" ")
        .slice(0, 2)
        .map((p) => p[0])
        .join("")
        .toUpperCase()}
    </span>
  );
}
export const formatDate = (value: string, short = false) =>
  new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: short ? "short" : "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
export function PageTitle({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-title">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}
export function State({
  loading,
  error,
  retry,
  children,
}: {
  loading: boolean;
  error: string;
  retry?: () => void;
  children: ReactNode;
}) {
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} retry={retry} />;
  return children;
}
