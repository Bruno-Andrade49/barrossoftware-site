import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectClip } from "@/components/ProjectClip";
import { SplitHeading } from "@/components/SplitHeading";
import { Reveal } from "@/components/Reveal";
import { isFilled } from "@/content/cases";
import { getProject, getProjects } from "@/lib/projects";
import { whatsappUrl } from "@/content/site";
import { JsonLd } from "@/components/JsonLd";
import { ParticleStage } from "@/components/ParticleStageLazy";
import { caseSchema } from "@/lib/schema";
import { clip } from "@/lib/seo";

// Projetos publicados depois do build (pelo painel) também abrem: a página é gerada na primeira visita.
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await getProjects()).map((c) => ({ slug: c.slug }));
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getProject(slug);
  if (!item) return {};
  const path = `/trabalhos/${item.slug}`;
  // "Geoparque Cariri — Portal institucional | BarrosSoftware"
  const title = `${item.name} — ${item.type}`;
  const [aw, ah] = item.aspect.desktop.split("/").map(Number);
  const description = clip(item.description);
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      url: path,
      title,
      description,
      images: [{ url: item.cover, width: 1600, height: Math.round((1600 * ah) / aw), alt: `${item.name} no computador` }],
    },
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Case enxuto, de ponta a ponta: o que é e link para o site no ar → o site rodando
 * (computador e celular) → desafio, o que foi construído e resultado → as telas principais → contato.
 * Blocos ainda marcados com PREENCHER ficam de fora.
 */
export default async function CasePage({ params }: PageProps) {
  const { slug } = await params;
  const cases = await getProjects();
  const item = cases.find((c) => c.slug === slug);
  if (!item) notFound();

  const index = cases.findIndex((c) => c.slug === item.slug);
  const next = cases[(index + 1) % cases.length];
  const [aw, ah] = item.aspect.desktop.split("/").map(Number);
  const results = item.results.filter(isFilled);

  const blocks = [
    isFilled(item.challenge) && { label: "O desafio", body: <p>{item.challenge}</p> },
    isFilled(item.solution) && { label: "O que construímos", body: <p>{item.solution}</p> },
    results.length > 0 && {
      label: "O resultado",
      body: (
        <ul className="flex flex-col gap-3">
          {results.map((r) => (
            <li key={r} className="flex gap-3">
              <span aria-hidden="true" className="text-carmim-light">
                —
              </span>
              {r}
            </li>
          ))}
        </ul>
      ),
    },
  ].filter((b): b is { label: string; body: React.JSX.Element } => Boolean(b));

  return (
    <article className="relative">
      <JsonLd data={caseSchema(item)} />
      {/* Fundo vivo: o mesmo palco de partículas da home (corrente na abertura, campo calmo no resto
          e o BARROS no rodapé), mais um brilho carmim no topo */}
      <ParticleStage />
      <div
        aria-hidden="true"
        className="case-glow pointer-events-none absolute inset-x-0 top-0 -z-[1] h-[110svh] bg-[radial-gradient(60%_55%_at_70%_0%,rgb(200_16_46/0.22),transparent_70%),radial-gradient(45%_40%_at_10%_20%,rgb(200_16_46/0.08),transparent_70%)]"
      />
      {/* Abertura */}
      <header data-form="flow" className="relative px-4 pt-32 md:px-12 md:pt-40">
        {/* Trilha de navegação (a mesma do JSON-LD BreadcrumbList) */}
        <nav aria-label="Trilha de navegação" className="mono-label text-ash">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="transition-colors hover:text-bone">
                Início
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/#trabalhos" className="transition-colors hover:text-bone">
                Trabalhos
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-bone">
              {item.name}
            </li>
          </ol>
        </nav>

        <div className="mt-14 grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <p className="mono-label text-carmim-light">
              ({pad(index + 1)}/{pad(cases.length)}) {item.type} · {item.year}
            </p>
            <SplitHeading as="h1" className="mt-6 text-[clamp(44px,7vw,124px)]">
              {item.name}
            </SplitHeading>
          </div>
          <div className="md:col-span-4 md:pb-3">
            <p className="text-[17px] leading-[1.6] font-light text-mist">{item.description}</p>
            {item.url && (
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn-glow mt-8">
                Ver o site no ar <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>
        </div>

        <dl className="mono-label mt-16 grid grid-cols-2 border-t border-white/10 md:grid-cols-4">
          {[
            ["Cliente", item.client],
            ["Tipo", item.type],
            ["Ano", item.year],
            ["Stack", item.stack.join(" · ")],
          ].map(([dt, dd]) => (
            <div key={dt} className="border-b border-white/10 py-6 pr-4">
              <dt className="text-ash">{dt}</dt>
              <dd className="mt-2 tracking-normal text-bone normal-case">{dd}</dd>
            </div>
          ))}
        </dl>
      </header>

      {/* O site rodando: computador com o celular sobreposto */}
      <section data-form="drift" aria-label="O site em funcionamento" className="px-4 pt-12 md:px-12 md:pt-16">
        <div className="relative">
          <ProjectClip item={item} variant="desktop" className="w-full rounded-2xl ring-1 ring-white/10 md:rounded-3xl" />
          <div className="absolute right-6 -bottom-14 hidden h-[72%] drop-shadow-[0_30px_50px_rgb(0_0_0/0.7)] md:block lg:right-12">
            <ProjectClip item={item} variant="mobile" className="h-full" />
          </div>
        </div>
        <div className="mt-8 flex justify-center md:hidden">
          <div className="h-[62svh]">
            <ProjectClip item={item} variant="mobile" className="h-full" />
          </div>
        </div>
      </section>

      {/* Desafio, solução, resultado */}
      {blocks.length > 0 && (
        <section data-form="drift" aria-label="Sobre o projeto" className="px-4 pt-24 md:px-12 md:pt-40">
          <Reveal className="grid gap-12 border-t border-white/10 pt-12 md:grid-cols-3 md:gap-10">
            {blocks.map((b, i) => (
              <div key={b.label}>
                <p className="mono-label text-carmim-light">{pad(i + 1)}</p>
                <h2 className="mt-4 text-[clamp(26px,2.2vw,36px)] leading-[1.05] font-medium tracking-[-0.04em]">{b.label}</h2>
                <div className="mt-5 max-w-[420px] text-[17px] leading-[1.6] font-light text-mist">{b.body}</div>
              </div>
            ))}
          </Reveal>
        </section>
      )}

      {/* Telas principais */}
      {item.gallery.length > 0 && (
        <section data-form="drift" aria-labelledby="telas-titulo" className="px-4 pt-24 md:px-12 md:pt-40">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <h2
              id="telas-titulo"
              className="text-[clamp(36px,4.4vw,72px)] leading-[0.98] font-medium tracking-[-0.042em]"
            >
              Por dentro
              <br />
              do projeto<span className="text-carmim">.</span>
            </h2>
            <p className="mono-label text-ash">As telas principais</p>
          </div>
          <Reveal as="ul" className="mt-12 grid gap-x-8 gap-y-12 md:mt-16 md:grid-cols-2">
            {item.gallery.map((g, i) => (
              <li key={g.src}>
                <figure>
                  <div className="overflow-hidden rounded-2xl ring-1 ring-white/10">
                    <Image
                      src={g.src}
                      alt={`${item.name}: ${g.caption}`}
                      width={g.width ?? 1600}
                      height={g.height ?? Math.round((1600 * ah) / aw)}
                      sizes="(min-width: 768px) 46vw, 92vw"
                      className="h-auto w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.02]"
                    />
                  </div>
                  <figcaption className="mono-label mt-4 flex gap-3 text-ash">
                    <span className="text-carmim-light">{pad(i + 1)}</span>
                    {g.caption}
                  </figcaption>
                </figure>
              </li>
            ))}
          </Reveal>
        </section>
      )}

      {/* Contato */}
      <section data-form="drift" className="px-4 py-28 text-center md:px-12 md:py-40">
        <h2 className="text-[clamp(36px,4.8vw,80px)] leading-[0.98] font-medium tracking-[-0.045em]">
          Quer um projeto
          <br />
          assim<span className="text-carmim">?</span>
        </h2>
        <p className="mx-auto mt-8 max-w-[440px] text-[17px] leading-[1.6] font-light text-mist">
          Conte o que você precisa. Respondemos em até um dia útil com os próximos passos.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-glow">
            Chamar no WhatsApp <span aria-hidden="true">→</span>
          </a>
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mono-label text-ash underline decoration-white/20 underline-offset-[6px] transition-colors hover:text-bone hover:decoration-carmim-light"
            >
              Ver {item.name} no ar ↗
            </a>
          )}
        </div>
      </section>

      {/* Próximo */}
      <Link
        href={`/trabalhos/${next.slug}`}
        data-cursor="Próximo"
        className="group block border-t border-white/10 px-4 py-20 md:px-12 md:py-28"
      >
        <span className="mono-label text-carmim-light">Próximo case</span>
        <span className="display mt-4 flex items-center justify-between gap-6 text-[clamp(40px,6.4vw,112px)] text-white/25 transition-colors duration-500 group-hover:text-bone">
          {next.name}
          <span aria-hidden="true" className="text-carmim transition-transform duration-500 group-hover:translate-x-4">
            →
          </span>
        </span>
      </Link>
    </article>
  );
}
