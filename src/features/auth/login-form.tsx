"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck, NotebookPen, Users, Check } from "lucide-react";
import { api } from "@/services/api";
import { Button, Field, Input, ErrorState } from "@/components/ui";
export function LoginForm({ setup }: { setup: boolean }) {
  const router = useRouter(),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      if (setup) await api("auth/setup", "POST", { ...data, desk: "Política" });
      await api("auth/login", "POST", { email: data.email, password: data.password });
      router.push("/");
      router.refresh();
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="login-page">
      <section className="login-story">
        <div className="brand">
          <span className="brand-mark">
            n<span>●</span>
          </span>
          <span>
            newsroom<span className="brand-360">360</span>
          </span>
        </div>
        <div className="login-story-content">
          <div className="eyebrow">A REDAÇÃO, EM SINTONIA</div>
          <h1>
            Boas histórias
            <br />
            começam com
            <br />
            <em>uma boa pauta.</em>
          </h1>
          <p>
            Do primeiro insight à última revisão.
            <br />
            Seu trabalho editorial, conectado.
          </p>
          <div className="login-benefits">
            <span>
              <NotebookPen size={18} />
              Planeje com clareza
            </span>
            <span>
              <Users size={18} />
              Produza em equipe
            </span>
            <span>
              <ShieldCheck size={18} />
              Publique com confiança
            </span>
          </div>
        </div>
        <small>Newsroom 360 · Plataforma editorial</small>
      </section>
      <section className="login-panel">
        <div className="login-form-wrap">
          <span className="login-chip">
            <span className="live-dot" />
            WORKSPACE EDITORIAL
          </span>
          <h2>{setup ? "Vamos preparar sua redação" : "Bem-vindo de volta."}</h2>
          <p>
            {setup
              ? "Crie a primeira conta de administração. Depois, cadastre os perfis da equipe."
              : "Entre para acompanhar as pautas e as histórias do dia."}
          </p>
          <form onSubmit={submit}>
            {setup && (
              <Field label="Seu nome">
                <Input name="name" required autoComplete="name" maxLength={200} />
              </Field>
            )}
            <Field label="E-mail profissional">
              <Input
                name="email"
                type="email"
                required
                autoComplete="username"
                placeholder="voce@redacao.com.br"
              />
            </Field>
            <Field label="Senha" hint={setup ? "Use pelo menos 12 caracteres." : undefined}>
              <Input
                name="password"
                type="password"
                required
                minLength={setup ? 12 : 1}
                maxLength={128}
                autoComplete={setup ? "new-password" : "current-password"}
              />
            </Field>
            {error && <ErrorState message={error} />}
            <Button busy={busy} type="submit">
              {setup ? "Criar ambiente" : "Entrar na redação"}
              <ArrowRight size={18} />
            </Button>
          </form>
          <div className="login-security">
            <Check size={15} />
            Sessão protegida · Acesso restrito à equipe
          </div>
          {!setup && (
            <p className="login-help">
              Precisa de acesso ou esqueceu sua senha? Fale com a administração da sua redação.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
