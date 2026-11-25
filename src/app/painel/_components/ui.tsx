import Link from "next/link";
import type { ReactNode } from "react";
import { logout } from "../actions";

/** Campos do painel: mesma linguagem do formulário de contato do site. 16 px no celular (o iPhone não dá zoom). */
export const inputClass =
  "w-full rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3 text-[16px] text-bone outline-none transition-colors placeholder:text-ash/70 focus:border-carmim-light/70 focus:bg-white/[0.05] md:text-[15px]";

/** Área de texto com altura fixa: não estica pela alça; o texto longo rola por dentro. */
export const textareaClass = `${inputClass} resize-none leading-[1.55]`;

export const chipClass =
  "mono-label inline-flex h-9 shrink-0 items-center whitespace-nowrap justify-center gap-2 rounded-full border border-white/15 px-3.5 text-ash transition-colors hover:border-white/30 hover:text-bone disabled:pointer-events-none disabled:opacity-35";

/** Botão só com ícone (setas, ver, apagar): quadrado de 36 px, fácil de tocar. */
export const iconChipClass = `${chipClass} w-9 !px-0`;

export function PainelHeader({ children }: { children?: ReactNode }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-void/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1180px] items-center justify-between gap-3 px-4 md:h-16 md:px-8">
        <Link href="/painel" className="flex min-w-0 items-center gap-3" aria-label="Painel, lista de projetos">
          <span className="flex items-center text-[17px] leading-none tracking-[-0.03em] [font-family:var(--font-display)] md:text-[18px]">
            <span className="font-bold">barros</span>
            <span aria-hidden="true" className="mx-[0.08em] inline-block h-[0.82em] w-[0.08em] bg-carmim" />
            <span className="font-light">software</span>
          </span>
          <span className="mono-label hidden rounded-full border border-white/15 px-2.5 py-1 text-ash sm:inline">Painel</span>
        </Link>
        <nav className="flex items-center gap-2" aria-label="Ações do painel">
          {children && <div className="hidden items-center gap-2 md:flex">{children}</div>}
          <Link href="/" target="_blank" className={chipClass} aria-label="Ver o site (abre em nova aba)">
            <span className="hidden md:inline">Ver site</span> <span aria-hidden="true">↗</span>
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
    <section className="grid gap-5 border-t border-white/10 py-8 md:grid-cols-12 md:gap-10 md:py-10">
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
