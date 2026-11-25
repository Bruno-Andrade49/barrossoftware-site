"use client";

import { useActionState } from "react";
import { login, type LoginState } from "../actions";
import { inputClass } from "../_components/ui";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={action} className="glass mt-10 flex flex-col gap-5 rounded-2xl p-6">
      <label className="flex flex-col gap-2">
        <span className="mono-label text-ash">Usuário</span>
        <input name="usuario" autoComplete="username" required autoFocus className={inputClass} />
      </label>
      <label className="flex flex-col gap-2">
        <span className="mono-label text-ash">Senha</span>
        <input name="senha" type="password" autoComplete="current-password" required className={inputClass} />
      </label>
      {state.error && (
        <p role="alert" className="mono-label text-carmim-light">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn-glow mt-2 justify-center disabled:opacity-60">
        {pending ? "Entrando…" : "Entrar"} <span aria-hidden="true">→</span>
      </button>
    </form>
  );
}
