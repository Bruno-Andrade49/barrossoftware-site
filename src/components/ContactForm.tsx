"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { whatsappUrl } from "@/content/site";

const TYPES = ["Sistema web", "App mobile", "Site ou landing page", "Automação ou IA", "Outro"];
const BUDGETS = ["Até R$ 10 mil", "R$ 10 a 30 mil", "R$ 30 a 80 mil", "Acima de R$ 80 mil", "Ainda não sei"];

const field =
  "w-full rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3.5 text-[16px] font-light text-bone outline-none transition-colors placeholder:text-ash/70 focus:border-carmim-light/70 focus:bg-white/[0.05]";

/** Formulário curto de pedido de projeto: envia para /api/contato, que manda por e-mail. */
export function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setState("sending");
    try {
      const res = await fetch("/api/contato", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Não conseguimos enviar agora.");
      form.reset();
      setState("ok");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Não conseguimos enviar agora.");
      setState("error");
    }
  };

  if (state === "ok") {
    return (
      <div role="status" className="glass rounded-3xl px-6 py-10 text-center">
        <p className="mono-label text-carmim-light">Pedido enviado</p>
        <p className="mt-4 text-[clamp(24px,3vw,34px)] leading-tight font-medium tracking-[-0.03em] [font-family:var(--font-display)]">
          Recebemos. Respondemos em até um dia útil<span className="text-carmim">.</span>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="glass rounded-3xl p-5 text-left md:p-8" aria-labelledby="form-titulo">
      <p id="form-titulo" className="mono-label text-ash">
        Ou conte por aqui
      </p>
      <div className="mt-5 grid gap-3 md:grid-cols-2 md:gap-4">
        <label className="flex flex-col gap-2">
          <span className="mono-label text-ash">Nome *</span>
          <input name="nome" required autoComplete="name" maxLength={120} className={field} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="mono-label text-ash">E-mail *</span>
          <input name="email" type="email" required autoComplete="email" maxLength={160} className={field} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="mono-label text-ash">Empresa</span>
          <input name="empresa" autoComplete="organization" maxLength={160} className={field} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="mono-label text-ash">WhatsApp ou telefone</span>
          <input name="telefone" type="tel" autoComplete="tel" maxLength={40} className={field} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="mono-label text-ash">Tipo de projeto</span>
          <span className="relative">
            <select name="tipo" defaultValue={TYPES[0]} className={`${field} appearance-none pr-10`}>
              {TYPES.map((t) => (
                <option key={t} className="bg-void">
                  {t}
                </option>
              ))}
            </select>
            <span aria-hidden="true" className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-ash">
              ▾
            </span>
          </span>
        </label>
        <label className="flex flex-col gap-2">
          <span className="mono-label text-ash">Orçamento estimado</span>
          <span className="relative">
            <select name="orcamento" defaultValue={BUDGETS[4]} className={`${field} appearance-none pr-10`}>
              {BUDGETS.map((b) => (
                <option key={b} className="bg-void">
                  {b}
                </option>
              ))}
            </select>
            <span aria-hidden="true" className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-ash">
              ▾
            </span>
          </span>
        </label>
        <label className="flex flex-col gap-2 md:col-span-2">
          <span className="mono-label text-ash">O que você precisa? *</span>
          <textarea name="mensagem" required minLength={10} maxLength={4000} rows={4} className={`${field} resize-y`} />
        </label>
        {/* campo-isca contra robôs: escondido de pessoas e leitores de tela */}
        <input name="site" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      </div>

      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="max-w-[360px] text-[13px] leading-[1.5] font-light text-ash">
          Usamos seus dados só para responder ao seu pedido. Veja a{" "}
          <Link href="/privacidade" className="underline underline-offset-4 hover:text-bone">
            política de privacidade
          </Link>
          .
        </p>
        <button type="submit" disabled={state === "sending"} className="btn-glow justify-center disabled:opacity-60">
          {state === "sending" ? "Enviando…" : "Enviar pedido"} <span aria-hidden="true">→</span>
        </button>
      </div>

      <p role="alert" aria-live="assertive" className="mt-4 text-[14px] text-carmim-light empty:hidden">
        {state === "error" && (
          <>
            {message}{" "}
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
              Fale com a gente no WhatsApp
            </a>
            .
          </>
        )}
      </p>
    </form>
  );
}
