"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Seções da home e o rótulo que aparece no dock (null = dock escondido)
const SECTIONS: [string, string | null][] = [
  ["inicio", null],
  ["servicos", "02 — Serviços"],
  ["trabalhos", "03 — Trabalhos"],
  ["processo", "04 — Processo"],
  ["sobre", "05 — A empresa"],
  ["perguntas", "06 — Perguntas"],
  ["contato", null],
  ["rodape", null],
];

/**
 * Dock do celular: pílula de vidro presa ao pé da tela, com a seção atual e o atalho para iniciar
 * um projeto. Aparece depois do hero e some no contato, no rodapé e com o menu aberto.
 */
export function MobileDock() {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const els = SECTIONS.map(([id]) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    // a seção "atual" é a que cruza a linha do meio da tela
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const found = SECTIONS.find(([id]) => id === e.target.id);
          if (found) setLabel(found[1]);
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const shown = label !== null;

  return (
    <div
      className={`fixed inset-x-3 bottom-[calc(12px+env(safe-area-inset-bottom))] z-40 transition-[translate,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] in-data-[menu=open]:pointer-events-none in-data-[menu=open]:translate-y-[160%] md:hidden ${
        shown ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-[160%] opacity-0"
      }`}
    >
      <div className="glass glass-refract flex items-center justify-between gap-3 rounded-full py-1.5 pr-1.5 pl-5">
        <span className="mono-label flex min-w-0 items-center gap-2.5 text-bone">
          <span className="relative flex size-1.5 shrink-0">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-carmim-light opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-carmim-light" />
          </span>
          <span key={label ?? ""} className="dock-label truncate">
            {label}
          </span>
        </span>
        <Link href="/#contato" className="btn-glow shrink-0 px-4 py-3">
          Iniciar projeto <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}
