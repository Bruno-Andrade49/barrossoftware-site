import type { Metadata } from "next";
import { authConfigured } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Entrar" };
// lê as variáveis de ambiente a cada acesso (não congela no build)
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <section className="relative isolate flex min-h-dvh items-center justify-center overflow-hidden px-4">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(50%_45%_at_50%_100%,rgb(200_16_46/0.22),transparent_70%)]"
      />
      <div className="w-full max-w-[400px]">
        <p className="flex items-center text-[22px] leading-none tracking-[-0.03em] [font-family:var(--font-display)]">
          <span className="font-bold">barros</span>
          <span aria-hidden="true" className="logo-caret mx-[0.08em] inline-block h-[0.82em] w-[0.08em] bg-carmim" />
          <span className="font-light">software</span>
        </p>
        <h1 className="mt-10 text-[40px] leading-[1] font-medium tracking-[-0.04em]">
          Painel<span className="text-carmim">.</span>
        </h1>
        <p className="mono-label mt-3 text-ash">Projetos do site · acesso restrito</p>

        {authConfigured() ? (
          <LoginForm />
        ) : (
          <p className="glass mt-10 rounded-2xl p-5 text-[15px] leading-[1.6] text-mist">
            O login ainda não foi configurado. Defina <code className="text-bone">ADMIN_USER</code>,{" "}
            <code className="text-bone">ADMIN_PASSWORD</code> e <code className="text-bone">ADMIN_SESSION_SECRET</code>{" "}
            nas variáveis de ambiente (senha com 12+ caracteres e segredo com 32+) e reinicie o servidor.
          </p>
        )}
      </div>
    </section>
  );
}
