"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import type { ProjectRow } from "@/lib/projects";
import {
  deleteProject,
  importStaticCases,
  moveProject,
  setPublished,
} from "../actions";
import { chipClass, iconChipClass } from "./ui";

type Row = Pick<
  ProjectRow,
  | "id"
  | "slug"
  | "name"
  | "type"
  | "year"
  | "published"
  | "poster_desktop"
  | "updated_at"
>;

const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));

export function ProjectList({ rows }: { rows: Row[] }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (fn: () => Promise<{ error?: string } | void>) =>
    start(async () => {
      setError(null);
      const res = await fn();
      if (res && res.error) setError(res.error);
    });

  if (rows.length === 0) {
    return (
      <div className="glass mt-12 rounded-2xl p-8 text-center">
        <p className="text-[18px] text-bone">Nenhum projeto no banco ainda.</p>
        <p className="mx-auto mt-2 max-w-[460px] text-[15px] leading-[1.6] text-ash">
          Enquanto isso, o site mostra os três projetos que estão no código.
          Importe-os para editar tudo por aqui, ou comece um novo.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            disabled={pending}
            onClick={() => run(importStaticCases)}
            className="btn-glow disabled:opacity-60"
          >
            {pending ? "Importando…" : "Importar os projetos atuais"}
          </button>
          <Link href="/painel/projetos/novo" className={chipClass}>
            Começar do zero
          </Link>
        </div>
        {error && (
          <p role="alert" className="mono-label mt-4 text-carmim-light">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      {error && (
        <p role="alert" className="mono-label mt-8 text-carmim-light">
          {error}
        </p>
      )}
      <ol
        className={`mt-8 flex flex-col border-t border-white/10 md:mt-10 ${pending ? "opacity-70" : ""}`}
        aria-busy={pending}
      >
        {rows.map((r, i) => {
          const order = (className: string) => (
            <div className={`items-center gap-2 ${className}`}>
              <button
                type="button"
                className={iconChipClass}
                disabled={pending || i === 0}
                onClick={() => run(() => moveProject(r.id, -1))}
                aria-label={`Subir ${r.name}`}
                title="Subir"
              >
                ↑
              </button>
              <button
                type="button"
                className={iconChipClass}
                disabled={pending || i === rows.length - 1}
                onClick={() => run(() => moveProject(r.id, 1))}
                aria-label={`Descer ${r.name}`}
                title="Descer"
              >
                ↓
              </button>
            </div>
          );
          return (
            <li
              key={r.id}
              className="grid grid-cols-[88px_1fr_auto] items-center gap-x-3 gap-y-4 border-b border-white/10 py-5 md:grid-cols-[28px_128px_1fr_auto] md:gap-6 md:py-4"
            >
              <span className="mono-label hidden text-carmim-light tabular-nums md:block">
                {String(i + 1).padStart(2, "0")}
              </span>

              <Link
                href={`/painel/projetos/${r.id}`}
                tabIndex={-1}
                aria-hidden="true"
                className="relative block aspect-[16/10] overflow-hidden rounded-lg bg-white/5 ring-1 ring-white/10"
              >
                {r.poster_desktop && (
                  // eslint-disable-next-line @next/next/no-img-element -- miniatura do painel
                  <img
                    src={r.poster_desktop}
                    alt=""
                    className="size-full object-cover"
                    loading="lazy"
                  />
                )}
                <span className="mono-label absolute top-1.5 left-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-carmim-light md:hidden">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </Link>

              <div className="min-w-0">
                <Link
                  href={`/painel/projetos/${r.id}`}
                  className="block truncate text-[18px] font-medium tracking-[-0.02em] hover:text-carmim-light md:text-[20px]"
                >
                  {r.name}
                </Link>
                <p className="mono-label mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-ash">
                  <span
                    className={r.published ? "text-bone" : "text-carmim-light"}
                  >
                    {r.published ? "● Publicado" : "○ Rascunho"}
                  </span>
                  <span className="truncate">
                    {[r.type, r.year].filter(Boolean).join(" · ") || "Sem tipo"}
                  </span>
                  <span className="hidden md:inline">/trabalhos/{r.slug}</span>
                  <span className="hidden md:inline">
                    Editado {fmtDate(r.updated_at)}
                  </span>
                </p>
              </div>

              {/* celular: a ordem fica ao lado do nome, em coluna */}
              {order("flex flex-col md:hidden")}

              {/* ações: no celular, uma linha inteira embaixo; texto nas principais, ícone no resto */}
              <div className="col-span-3 flex items-center gap-2 md:col-span-1 md:justify-end">
                <Link
                  href={`/painel/projetos/${r.id}`}
                  className={`${chipClass} flex-1 md:flex-none`}
                >
                  Editar
                </Link>
                <button
                  type="button"
                  className={`${chipClass} flex-1 md:flex-none`}
                  disabled={pending}
                  onClick={() => run(() => setPublished(r.id, !r.published))}
                >
                  {r.published ? "Despublicar" : "Publicar"}
                </button>
                {order("hidden md:flex")}
                {r.published && (
                  <Link
                    href={`/trabalhos/${r.slug}`}
                    target="_blank"
                    className={iconChipClass}
                    aria-label={`Ver ${r.name} no site`}
                    title="Ver no site"
                  >
                    ↗
                  </Link>
                )}
                <button
                  type="button"
                  className={`${iconChipClass} hover:border-carmim-light/60 hover:text-carmim-light`}
                  disabled={pending}
                  aria-label={`Apagar ${r.name}`}
                  title="Apagar"
                  onClick={() => {
                    if (
                      confirm(
                        `Apagar "${r.name}"? Os vídeos e imagens enviados também serão apagados. Não dá para desfazer.`,
                      )
                    )
                      run(() => deleteProject(r.id));
                  }}
                >
                  ×
                </button>
              </div>
            </li>
          );
        })}
      </ol>
    </>
  );
}
