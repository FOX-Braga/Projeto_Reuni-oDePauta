"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  NotebookPen,
  FileText,
  CalendarDays,
  CircleCheck,
  Images,
  Contact,
  ChartNoAxesCombined,
  Settings2,
  Search,
  Bell,
  ChevronDown,
  ArrowUpRight,
  PanelLeftClose,
  PanelLeftOpen,
  WifiOff,
  LogOut,
  ListTodo,
  History,
} from "lucide-react";
import { Avatar, Button } from "@/components/ui";
import { roleLabels, type User } from "@/types/domain";
import { api } from "@/services/api";
const UserContext = createContext<User | null>(null);
export function useUser() {
  const user = useContext(UserContext);
  if (!user) throw new Error("Sessão não disponível");
  return user;
}
const nav = [
  {
    href: "/",
    label: "Visão geral",
    icon: LayoutDashboard,
    roles: [
      "reporter",
      "producer",
      "editor",
      "chief",
      "freelancer",
      "admin",
      "media",
      "social",
      "legal",
      "executive",
    ],
  },
  {
    href: "/pautas",
    label: "Pautas",
    icon: NotebookPen,
    roles: ["reporter", "producer", "editor", "chief", "freelancer"],
  },
  {
    href: "/materias",
    label: "Matérias",
    icon: FileText,
    roles: ["reporter", "editor", "chief", "freelancer", "legal"],
  },
  {
    href: "/agenda",
    label: "Agenda editorial",
    icon: CalendarDays,
    roles: ["reporter", "producer", "editor", "chief", "freelancer"],
  },
  {
    href: "/aprovacoes",
    label: "Aprovações",
    icon: CircleCheck,
    roles: ["editor", "chief", "legal"],
  },
  {
    href: "/tarefas",
    label: "Minhas tarefas",
    icon: ListTodo,
    roles: ["reporter", "producer", "editor", "chief"],
  },
  {
    href: "/fontes",
    label: "Fontes e contatos",
    icon: Contact,
    roles: ["reporter", "producer", "editor", "chief"],
  },
  {
    href: "/midia",
    label: "Biblioteca de mídia",
    icon: Images,
    roles: ["reporter", "producer", "editor", "chief", "media"],
  },
  { href: "/publicacoes", label: "Publicações", icon: ArrowUpRight, roles: ["editor", "chief"] },
  {
    href: "/analytics",
    label: "Analytics",
    icon: ChartNoAxesCombined,
    roles: ["editor", "chief", "executive"],
  },
];
export function Shell({ user, children }: { user: User; children: ReactNode }) {
  const path = usePathname(),
    router = useRouter();
  const [open, setOpen] = useState(false),
    [online, setOnline] = useState(true),
    [query, setQuery] = useState("");
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    const shortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("global-search")?.focus();
      }
      if (e.key === "Escape") {
        setOpen(false);
        setMenu(false);
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
      window.removeEventListener("keydown", shortcut);
    };
  }, []);
  async function signOut() {
    try {
      await api("auth/logout", "POST", {});
      sessionStorage.clear();
      router.push("/login");
      router.refresh();
    } catch {
      setMenu(false);
    }
  }
  const current =
    nav.find((n) => n.href !== "/" && path.startsWith(n.href))?.label ??
    (path.startsWith("/admin") ? "Administração" : "Visão geral");
  return (
    <UserContext.Provider value={user}>
      <a href="#main-content" className="skip-link">
        Pular para o conteúdo
      </a>
      <div className={`app-shell ${open ? "nav-open" : ""}`}>
        {open && (
          <button
            className="nav-backdrop"
            aria-label="Fechar navegação"
            onClick={() => setOpen(false)}
          />
        )}
        <aside className="sidebar" aria-label="Navegação principal">
          <Link href="/" className="brand" onClick={() => setOpen(false)}>
            <span className="brand-mark">
              n<span>●</span>
            </span>
            <span>
              newsroom<span className="brand-360">360</span>
            </span>
          </Link>
          <div className="organization">
            <span className="organization-mark">R</span>
            <div>
              <strong>Redação principal</strong>
              <small>Workspace editorial</small>
            </div>
            <ChevronDown size={14} />
          </div>
          <div className="nav-caption">REDAÇÃO</div>
          <nav>
            {nav
              .filter((n) => n.roles.includes(user.role))
              .map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className={`nav-item ${(n.href === "/" ? path === "/" : path.startsWith(n.href)) ? "active" : ""}`}
                  aria-current={
                    (n.href === "/" ? path === "/" : path.startsWith(n.href)) ? "page" : undefined
                  }
                >
                  <n.icon size={19} />
                  <span>{n.label}</span>
                </Link>
              ))}
          </nav>
          <div className="sidebar-bottom">
            {["admin", "chief"].includes(user.role) && (
              <Link className="nav-item" href="/auditoria" onClick={() => setOpen(false)}>
                <History size={19} />
                Auditoria
              </Link>
            )}
            {user.role === "admin" && (
              <Link className="nav-item" href="/admin" onClick={() => setOpen(false)}>
                <Settings2 size={19} />
                Administração
              </Link>
            )}
            <div className="edition-note">
              <span className="live-dot" />
              <div>
                <strong>Jornalismo em movimento.</strong>
                <small>Contexto. Colaboração. Controle.</small>
              </div>
            </div>
            <button className="profile" onClick={() => setMenu(!menu)} aria-expanded={menu}>
              <Avatar name={user.name} />
              <span>
                <strong>{user.name}</strong>
                <small>{roleLabels[user.role]}</small>
              </span>
              <ChevronDown size={16} />
            </button>
            {menu && (
              <div className="profile-menu">
                <span>{user.email}</span>
                <Button variant="ghost" onClick={signOut}>
                  <LogOut size={16} />
                  Sair da conta
                </Button>
              </div>
            )}
          </div>
        </aside>
        <div className="main-column">
          <header className="topbar">
            <div className="breadcrumb">
              <Button
                variant="ghost"
                className="menu-toggle"
                aria-label={open ? "Fechar menu" : "Abrir menu"}
                onClick={() => setOpen(!open)}
              >
                {open ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
              </Button>
              <span>Workspace</span>
              <span className="breadcrumb-separator">/</span>
              <strong>{current}</strong>
            </div>
            <form
              className="global-search"
              onSubmit={(e) => {
                e.preventDefault();
                router.push(`/busca?q=${encodeURIComponent(query)}`);
              }}
            >
              <Search size={17} />
              <input
                id="global-search"
                aria-label="Buscar pautas e matérias"
                placeholder="Buscar na redação…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <kbd>⌘ K</kbd>
            </form>
            <div className="topbar-actions">
              <span className="environment">LOCAL</span>
              <Link href="/notificacoes" className="icon-button" aria-label="Notificações">
                <Bell size={20} />
              </Link>
              <span className="topbar-divider" />
              <Avatar name={user.name} small />
            </div>
          </header>
          {!online && (
            <div className="offline-banner" role="status">
              <WifiOff size={17} />
              Você está offline. Não feche os formulários com alterações pendentes.
            </div>
          )}
          <main id="main-content" className="content" tabIndex={-1}>
            {children}
          </main>
          <footer className="footer">
            <span>
              <span className="live-dot" /> Newsroom 360 · Ambiente local
            </span>
            <span>Feito para quem conta as histórias.</span>
          </footer>
        </div>
      </div>
    </UserContext.Provider>
  );
}
