"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { saveProject, type ProjectInput } from "../actions";
import { readImage, readVideo, slugify, uploadFile } from "./media";
import { Field, Section, chipClass, iconChipClass, inputClass, textareaClass } from "./ui";

const TYPES = ["Site institucional", "Portal institucional", "Landing page", "Loja online", "Sistema web", "App mobile", "Automação", "Integração"];
const STACK_HINTS = ["Next.js", "React", "Vue", "Astro", "Vite", "TypeScript", "Tailwind", "Node.js", "Supabase", "PostgreSQL", "Prisma", "React Native", "Expo", "Python", "Playwright", "Vitest", "Stripe", "OpenAI"];


type Status = { kind: "idle" | "saving" | "saved" | "error"; text?: string };

export function ProjectForm({ id, initial }: { id: string | null; initial: ProjectInput }) {
  const router = useRouter();
  const [p, setP] = useState<ProjectInput>(initial);
  const [slugTouched, setSlugTouched] = useState(Boolean(id));
  const [uploads, setUploads] = useState(0); // envios em andamento: salvar espera terminar
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const dirty = useRef(false);

  const set = (patch: Partial<ProjectInput>) => update(() => patch);
  // a partir do estado atual (envios terminam depois de outras edições; não podem sobrescrevê-las)
  const update = (fn: (cur: ProjectInput) => Partial<ProjectInput>) => {
    dirty.current = true;
    setP((cur) => ({ ...cur, ...fn(cur) }));
  };

  // avisa antes de sair com alterações não salvas
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty.current) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  const track = async <T,>(job: () => Promise<T>) => {
    setUploads((n) => n + 1);
    try {
      return await job();
    } catch (e) {
      setStatus({ kind: "error", text: e instanceof Error ? e.message : "O envio falhou." });
      return null;
    } finally {
      setUploads((n) => n - 1);
    }
  };

  const submit = async (publish?: boolean) => {
    if (uploads > 0) return;
    setStatus({ kind: "saving" });
    const input = { ...p, published: publish ?? p.published };
    const res = await saveProject(id, input);
    if (!res.ok) {
      setStatus({ kind: "error", text: res.error });
      return;
    }
    dirty.current = false;
    setP(input);
    setStatus({ kind: "saved", text: input.published ? "Salvo e publicado no site." : "Rascunho salvo." });
    if (!id) router.replace(`/painel/projetos/${res.id}`);
    else router.refresh();
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="pb-40 md:pb-32"
    >
      <Section n="01" title="Identificação" desc="Como o projeto aparece na lista de trabalhos e no endereço da página.">
        <div className="grid gap-6 md:grid-cols-2">
          <Field label="Nome do projeto *">
            <input
              required
              maxLength={80}
              value={p.name}
              onChange={(e) => set({ name: e.target.value, ...(!slugTouched && { slug: slugify(e.target.value) }) })}
              className={inputClass}
              placeholder="Ex.: Malu Cookies"
            />
          </Field>
          <Field label="Endereço da página *" hint={`barrossoftware.com.br/trabalhos/${p.slug || "…"}`}>
            <input
              required
              maxLength={60}
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              value={p.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set({ slug: slugify(e.target.value) });
              }}
              className={inputClass}
              placeholder="malu-cookies"
            />
          </Field>
          <Field label="Cliente" hint="Nome oficial, como o cliente assina.">
            <input maxLength={80} value={p.client} onChange={(e) => set({ client: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Tipo">
            <input list="tipos" maxLength={60} value={p.type} onChange={(e) => set({ type: e.target.value })} className={inputClass} placeholder="Ex.: Loja online" />
            <datalist id="tipos">
              {TYPES.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </Field>
          <Field label="Ano">
            <input inputMode="numeric" maxLength={9} value={p.year} onChange={(e) => set({ year: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Site no ar" hint="Aparece como “Ver o site no ar”. Deixe vazio se não for público.">
            <input type="url" maxLength={300} value={p.url ?? ""} onChange={(e) => set({ url: e.target.value })} className={inputClass} placeholder="https://" />
          </Field>
        </div>
      </Section>

      <Section n="02" title="Textos" desc="O que o projeto é e o que resolveu. Frases curtas, na linguagem do cliente.">
        <Field label="Descrição curta *" hint={<Count value={p.description} max={600} note="Aparece ao lado do vídeo na home e no topo da página do case." />}>
          <textarea rows={4} maxLength={600} value={p.description} onChange={(e) => set({ description: e.target.value })} className={textareaClass} />
        </Field>
        <Field label="Resumo de uma linha" hint={<Count value={p.summary} max={200} note="Usado em listas e para buscadores e IAs." />}>
          <input maxLength={200} value={p.summary} onChange={(e) => set({ summary: e.target.value })} className={inputClass} />
        </Field>
        <div className="grid gap-6 md:grid-cols-2">
          <Field label="O desafio" hint="O problema que o cliente trouxe. Vazio = o bloco não aparece.">
            <textarea rows={6} maxLength={1200} value={p.challenge} onChange={(e) => set({ challenge: e.target.value })} className={textareaClass} />
          </Field>
          <Field label="O que construímos" hint="A solução, em poucas frases.">
            <textarea rows={6} maxLength={1200} value={p.solution} onChange={(e) => set({ solution: e.target.value })} className={textareaClass} />
          </Field>
        </div>
        <ListEditor
          label="Resultados"
          hint="Um por linha. De preferência com número real (ex.: “Pedidos 40% mais rápidos”)."
          items={p.results}
          max={10}
          onChange={(results) => set({ results })}
        />
      </Section>

      <Section n="03" title="Tecnologias" desc="Linguagens, frameworks e serviços usados. Hospedagem (Vercel, Netlify) não entra.">
        <TagInput items={p.stack} onChange={(stack) => set({ stack })} />
      </Section>

      <Section n="04" title="Vídeos" desc="Gravação do site rodando. A capa e a proporção saem do próprio vídeo, sem trabalho extra.">
        <div className="grid gap-6 md:grid-cols-[1fr_200px]">
          <VideoSlot
            label="Computador *"
            hint="MP4 (H.264) ou WebM, sem som, até 50 MB. Recomendado: 1600 px de largura, 10 a 20 s."
            src={p.video.desktop}
            poster={p.poster.desktop}
            aspect={p.aspect.desktop}
            onFile={(file) =>
              track(async () => {
                const meta = await readVideo(file);
                const [video, poster, cover] = await Promise.all([uploadFile(file), uploadFile(meta.poster), uploadFile(meta.jpg)]);
                update((cur) => ({
                  video: { ...cur.video, desktop: video },
                  poster: { ...cur.poster, desktop: poster },
                  aspect: { ...cur.aspect, desktop: meta.aspect },
                  cover,
                }));
              })
            }
            onClear={() => update((cur) => ({ video: { ...cur.video, desktop: "" }, poster: { ...cur.poster, desktop: "" }, cover: "" }))}
          />
          <VideoSlot
            label="Celular *"
            hint="Só a tela, sem moldura (a moldura é desenhada pelo site)."
            src={p.video.mobile}
            poster={p.poster.mobile}
            aspect={p.aspect.mobile}
            onFile={(file) =>
              track(async () => {
                const meta = await readVideo(file);
                const [video, poster] = await Promise.all([uploadFile(file), uploadFile(meta.poster)]);
                update((cur) => ({
                  video: { ...cur.video, mobile: video },
                  poster: { ...cur.poster, mobile: poster },
                  aspect: { ...cur.aspect, mobile: meta.aspect },
                }));
              })
            }
            onClear={() => update((cur) => ({ video: { ...cur.video, mobile: "" }, poster: { ...cur.poster, mobile: "" } }))}
          />
        </div>
      </Section>

      <Section n="05" title="Telas" desc="As telas principais do projeto, com uma legenda curta. Até 12 imagens.">
        <Gallery
          items={p.gallery}
          onChange={(gallery) => set({ gallery })}
          onAdd={(files) =>
            track(async () => {
              const added: ProjectInput["gallery"] = [];
              for (const file of files) {
                const size = await readImage(file);
                added.push({ src: await uploadFile(file), caption: "", ...size });
              }
              update((cur) => ({ gallery: [...cur.gallery, ...added].slice(0, 12) }));
            })
          }
        />
      </Section>

      {/* Barra de ações fixa (no celular: status em cima, botões numa linha só) */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-void/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between md:px-8 md:py-4">
          <p role="status" className={`mono-label truncate ${status.kind === "error" ? "text-carmim-light" : "text-ash"}`}>
            {uploads > 0
              ? "Enviando arquivos…"
              : status.kind === "saving"
                ? "Salvando…"
                : (status.text ?? (p.published ? "● Publicado no site" : "○ Rascunho: só aparece aqui"))}
          </p>
          <div className="flex items-center gap-2">
            <Link href="/painel" className={iconChipClass} aria-label="Voltar para a lista" title="Voltar">
              ←
            </Link>
            {id && p.published && (
              <Link href={`/trabalhos/${p.slug}`} target="_blank" className={iconChipClass} aria-label="Ver no site" title="Ver no site">
                ↗
              </Link>
            )}
            {p.published ? (
              <button type="button" disabled={uploads > 0 || status.kind === "saving"} onClick={() => submit(false)} className={`${chipClass} flex-1 md:flex-none`}>
                Despublicar
              </button>
            ) : (
              <button type="submit" disabled={uploads > 0 || status.kind === "saving"} className={`${chipClass} flex-1 md:flex-none`}>
                <span className="md:hidden">Rascunho</span>
                <span className="hidden md:inline">Salvar rascunho</span>
              </button>
            )}
            <button
              type="button"
              disabled={uploads > 0 || status.kind === "saving"}
              onClick={() => submit(true)}
              className="btn-glow h-9 flex-1 justify-center !py-0 disabled:opacity-60 md:flex-none"
            >
              {p.published ? "Salvar" : "Publicar"} <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

function Count({ value, max, note }: { value: string; max: number; note: string }) {
  return (
    <>
      {note} <span className="tabular-nums">{value.length}/{max}</span>
    </>
  );
}

function ListEditor({ label, hint, items, max, onChange }: { label: string; hint: string; items: string[]; max: number; onChange: (v: string[]) => void }) {
  return (
    <Field label={label} hint={hint}>
      <textarea
        rows={4}
        value={items.join("\n")}
        onChange={(e) => onChange(e.target.value.split("\n").slice(0, max))}
        className={textareaClass}
      />
    </Field>
  );
}

function TagInput({ items, onChange }: { items: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState("");
  // aceita uma ou várias de uma vez ("Next.js, Supabase"), sem repetir
  const add = (raw: string) => {
    const next = [...items];
    for (const v of raw.split(",").map((x) => x.trim())) {
      if (v && !next.some((i) => i.toLowerCase() === v.toLowerCase()) && next.length < 15) next.push(v);
    }
    if (next.length !== items.length) onChange(next);
    setDraft("");
  };
  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-wrap gap-2" aria-label="Tecnologias escolhidas">
        {items.map((t, i) => (
          <li key={t} className="mono-label flex items-center gap-2 rounded-full border border-white/15 py-1.5 pr-2 pl-3 text-bone">
            {t}
            <button type="button" aria-label={`Remover ${t}`} className="text-ash hover:text-carmim-light" onClick={() => onChange(items.filter((_, k) => k !== i))}>
              ×
            </button>
          </li>
        ))}
        {items.length === 0 && <li className="text-[14px] text-ash">Nenhuma ainda.</li>}
      </ul>
      <Field label="Adicionar" hint="Enter ou vírgula para incluir.">
        <input
          list="stack-dicas"
          value={draft}
          maxLength={40}
          onChange={(e) => {
            const v = e.target.value;
            if (!v.includes(",")) return setDraft(v);
            const cut = v.lastIndexOf(",");
            add(v.slice(0, cut));
            setDraft(v.slice(cut + 1));
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(draft);
            }
          }}
          onBlur={() => draft && add(draft)}
          className={inputClass}
          placeholder="Ex.: Next.js"
        />
        <datalist id="stack-dicas">
          {STACK_HINTS.filter((s) => !items.includes(s)).map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </Field>
    </div>
  );
}

function Dropzone({ accept, multiple, onFiles, children }: { accept: string; multiple?: boolean; onFiles: (f: File[]) => void; children: ReactNode }) {
  const [over, setOver] = useState(false);
  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        onFiles(Array.from(e.dataTransfer.files));
      }}
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-4 py-8 text-center transition-colors ${
        over ? "border-carmim-light bg-carmim/10" : "border-white/20 hover:border-white/40"
      }`}
    >
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(e) => {
          onFiles(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />
      {children}
    </label>
  );
}

function VideoSlot({
  label,
  hint,
  src,
  poster,
  aspect,
  onFile,
  onClear,
}: {
  label: string;
  hint: string;
  src: string;
  poster: string;
  aspect: string;
  onFile: (f: File) => Promise<unknown>;
  onClear: () => void;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <span className="mono-label text-ash">{label}</span>
      {src ? (
        <div className="flex flex-col gap-2">
          <video
            src={src}
            poster={poster || undefined}
            muted
            loop
            playsInline
            autoPlay
            className="w-full rounded-xl bg-black object-cover ring-1 ring-white/10"
            style={{ aspectRatio: aspect }}
          />
          <div className="flex items-center justify-between gap-2">
            <span className="mono-label text-ash tabular-nums">{aspect.replace(" / ", " × ")}</span>
            <button type="button" className={chipClass} onClick={onClear}>
              Trocar
            </button>
          </div>
        </div>
      ) : (
        <Dropzone
          accept="video/mp4,video/webm"
          onFiles={async ([file]) => {
            if (!file) return;
            setBusy(true);
            await onFile(file);
            setBusy(false);
          }}
        >
          <span className="text-[15px] text-bone">{busy ? "Enviando…" : "Arraste o vídeo ou clique"}</span>
          <span className="text-[13px] leading-[1.5] text-ash">{hint}</span>
        </Dropzone>
      )}
    </div>
  );
}

function Gallery({
  items,
  onChange,
  onAdd,
}: {
  items: ProjectInput["gallery"];
  onChange: (v: ProjectInput["gallery"]) => void;
  onAdd: (files: File[]) => Promise<unknown>;
}) {
  const [busy, setBusy] = useState(false);
  const move = (i: number, d: -1 | 1) => {
    const next = [...items];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  return (
    <div className="flex flex-col gap-6">
      {items.length > 0 && (
        <ol className="grid gap-6 md:grid-cols-2">
          {items.map((g, i) => (
            <li key={g.src} className="flex flex-col gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- prévia do painel */}
              <img src={g.src} alt="" className="w-full rounded-xl object-cover ring-1 ring-white/10" style={{ aspectRatio: g.width && g.height ? `${g.width} / ${g.height}` : "16 / 9" }} />
              <input
                aria-label={`Legenda da tela ${i + 1}`}
                maxLength={140}
                value={g.caption}
                onChange={(e) => onChange(items.map((x, k) => (k === i ? { ...x, caption: e.target.value } : x)))}
                className={inputClass}
                placeholder="Legenda curta: o que a tela mostra"
              />
              <div className="flex gap-2">
                <button type="button" className={chipClass} disabled={i === 0} onClick={() => move(i, -1)} aria-label="Mover para antes">
                  ←
                </button>
                <button type="button" className={chipClass} disabled={i === items.length - 1} onClick={() => move(i, 1)} aria-label="Mover para depois">
                  →
                </button>
                <button type="button" className={chipClass} onClick={() => onChange(items.filter((_, k) => k !== i))}>
                  Remover
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}
      {items.length < 12 && (
        <Dropzone
          accept="image/webp,image/jpeg,image/png,image/avif"
          multiple
          onFiles={async (files) => {
            if (!files.length) return;
            setBusy(true);
            await onAdd(files.slice(0, 12 - items.length));
            setBusy(false);
          }}
        >
          <span className="text-[15px] text-bone">{busy ? "Enviando…" : "Arraste as imagens ou clique"}</span>
          <span className="text-[13px] leading-[1.5] text-ash">WebP, JPG, PNG ou AVIF. Recomendado: capturas de 1600 px de largura.</span>
        </Dropzone>
      )}
    </div>
  );
}
