import Link from "next/link";
import type { ReactNode } from "react";
import { logout } from "../actions";

/** Campos do painel: mesma linguagem do formulário de contato do site. */
export const inputClass =
  "w-full rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3 text-[15px] text-bone outline-none transition-colors placeholder:text-ash/70 focus:border-carmim-light/70 focus:bg-white/[0.05]";

export const chipClass =
  "mono-label inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-ash transition-colors hover:border-white/30 hover:text-bone disabled:opacity-40";

export function PainelHeader({ children }: { children?: ReactNode }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-void/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-8">
        <Link href="/painel" className="flex items-center gap-3">
          <span className="flex items-center text-[18px] leading-none tracking-[-0.03em] [font-family:var(--font-display)]">
            <span className="font-bold">barros</span>
            <span aria-hidden="true" className="mx-[0.08em] inline-block h-[0.82em] w-[0.08em] bg-carmim" />
            <span className="font-light">software</span>
          </span>
          <span className="mono-label rounded-full border border-white/15 px-2.5 py-1 text-ash">Painel</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-2">
          {children}
          <Link href="/" target="_blank" className={chipClass}>
            Ver site ↗
          </Link>
          <form action={logout}>
            <button type="submit" className={chipClass}>
              Sair
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}

export function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-2 ${className}`}>
      <span className="mono-label text-ash">{label}</span>
      {children}
      {hint && <span className="text-[13px] leading-[1.5] text-ash">{hint}</span>}
    </label>
  );
}

export function Section({ n, title, desc, children }: { n: string; title: string; desc: string; children: ReactNode }) {
  return (
    <section className="grid gap-6 border-t border-white/10 py-10 md:grid-cols-12 md:gap-10">
      <div className="md:col-span-4">
        <p className="mono-label text-carmim-light">
          ({n}) {title}
        </p>
        <p className="mt-2 max-w-[300px] text-[14px] leading-[1.55] text-ash">{desc}</p>
      </div>
      <div className="flex flex-col gap-6 md:col-span-8">{children}</div>
    </section>
  );
}
