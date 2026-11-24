"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { cases } from "@/content/cases";
import { gsap, prefersReducedMotion } from "@/lib/motion";
import { ProjectClip } from "./ProjectClip";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Trabalhos: a seção fica fixa e o scroll vertical passa os projetos para o lado.
 * Cada projeto ocupa uma tela: vídeo do site no computador com o celular sobreposto e,
 * ao lado, nome, descrição e stack. Tudo anda junto no trilho; o texto entra com um leve atraso.
 */
export function Work() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const s = section.current;
    const st = stage.current;
    const t = track.current;
    if (!s || !st || !t || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray<HTMLElement>("[data-panel]");
      // projeto atual = o painel mais perto do centro da tela
      const current = () => {
        let best = 0;
        let bestD = Infinity;
        panels.forEach((p, k) => {
          const r = p.getBoundingClientRect();
          const d = Math.abs(r.left + r.width / 2 - window.innerWidth / 2);
          if (d < bestD) [best, bestD] = [k, d];
        });
        return best + 1;
      };
      const distance = () => Math.max(0, t.scrollWidth - window.innerWidth);
      // celular: a trilha para centralizada em cada bloco (abertura, projetos, fecho) ao soltar o dedo
      const phone = window.matchMedia("(max-width: 767px)").matches;
      const stops = Array.from(t.children) as HTMLElement[];
      const snapTo = (v: number) => {
        const d = distance() || 1;
        const points = stops.map((c) =>
          gsap.utils.clamp(0, 1, (c.offsetLeft + c.offsetWidth / 2 - window.innerWidth / 2) / d),
        );
        return points.reduce((a, b) => (Math.abs(b - v) < Math.abs(a - v) ? b : a));
      };
      const slide = gsap.to(t, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          // fixa o palco interno, não a <section>: o GSAP embrulha o elemento fixado num
          // pin-spacer, e se fosse a raiz do componente o React não conseguiria removê-la ao trocar de página
          trigger: st,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: phone ? 0.6 : 1,
          snap: phone ? { snapTo, duration: { min: 0.25, max: 0.6 }, delay: 0.04, ease: "power2.inOut" } : undefined,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
        // lê a posição real do trilho (com o atraso do scrub), não a do scroll
        onUpdate() {
          if (bar.current)
            bar.current.style.transform = `scaleX(${this.progress()})`;
          if (counter.current) counter.current.textContent = pad(current());
        },
      });

      panels.forEach((panel) => {
        const along = {
          trigger: panel,
          containerAnimation: slide,
          scrub: true,
        };
        gsap.fromTo(
          panel.querySelectorAll("[data-text] > *"),
          { x: phone ? 56 : 140, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            ease: "none",
            stagger: 0.08,
            scrollTrigger: { ...along, start: "left 90%", end: "left 30%" },
          },
        );
        gsap.fromTo(
          panel.querySelector("[data-screen]"),
          { scale: 0.88, opacity: 0.4 },
          {
            scale: 1,
            opacity: 1,
            ease: "none",
            scrollTrigger: { ...along, start: "left 100%", end: "left 40%" },
          },
        );
        if (phone) return; // no celular o aparelho fica parado sobre o texto
        gsap.fromTo(
          panel.querySelector("[data-phone]"),
          { yPercent: 18 },
          {
            yPercent: -10,
            ease: "none",
            scrollTrigger: { ...along, start: "left right", end: "right left" },
          },
        );
      });
    }, s);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={section}
      id="trabalhos"
      data-form="off"
      className="relative"
      aria-labelledby="trabalhos-titulo"
    >
      {/* Sem partículas aqui: o palco é opaco, e as bordas esfumam para a divisa não marcar uma linha */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-[30svh] -z-[1] h-[30svh] bg-gradient-to-b from-transparent to-void"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -bottom-[30svh] -z-[1] h-[30svh] bg-gradient-to-t from-transparent to-void"
      />
      <div
        ref={stage}
        className="relative h-[100svh] min-h-[620px] overflow-hidden bg-void"
      >
        <div
          ref={track}
          className="flex h-full items-center overflow-x-auto [scrollbar-width:none] motion-safe:overflow-visible"
        >
          {/* Abertura do trilho */}
          <div className="flex w-[88vw] shrink-0 flex-col justify-center px-4 md:w-[42vw] md:pr-0 md:pl-12">
            <div className="mono-label flex items-center gap-4 text-ash">
              <span className="text-carmim-light">(03)</span>
              <span>Trabalhos</span>
            </div>
            <h2
              id="trabalhos-titulo"
              className="mt-8 text-[clamp(40px,4.6vw,80px)] leading-[0.98] font-normal tracking-[-0.042em]"
            >
              Trabalhos
              <br />
              recentes<span className="text-carmim">.</span>
            </h2>
            <p className="mt-8 max-w-[360px] text-[17px] leading-[1.6] font-light text-mist">
              Projetos que saíram do papel e estão no ar. Role para ver cada um.
            </p>
            <span
              className="mono-label mt-10 flex items-center gap-3 text-ash"
              aria-hidden="true"
            >
              <span className="relative h-px w-16 overflow-hidden bg-white/15">
                <span className="scroll-cue absolute inset-y-0 left-0 w-1/3 bg-carmim-light" />
              </span>
              Role
            </span>
          </div>

          {cases.map((c, i) => (
            <article
              key={c.slug}
              data-panel
              aria-label={c.name}
              className="flex h-full w-screen shrink-0 items-center px-5 pt-24 pb-24 md:w-[94vw] md:px-12 md:pt-24 md:pb-20"
            >
              <div className="grid w-full items-center gap-6 md:grid-cols-12 md:gap-12">
                {/* Vídeos: computador com o celular sobreposto (no celular, só a versão mobile) */}
                <div className="relative md:col-span-8">
                  <div data-screen className="hidden origin-left md:block">
                    <ProjectClip
                      item={c}
                      variant="desktop"
                      className="w-full rounded-2xl ring-1 ring-white/10"
                    />
                  </div>
                  <div
                    data-phone
                    className="mx-auto h-[46svh] w-fit drop-shadow-[0_30px_50px_rgb(0_0_0/0.7)] md:absolute md:-right-6 md:-bottom-12 md:mx-0 md:h-[80%]"
                  >
                    <ProjectClip item={c} variant="mobile" className="h-full" />
                  </div>
                </div>

                {/* Sobre o projeto */}
                <div data-text className="md:col-span-4 md:pl-6">
                  <p className="mono-label text-carmim-light">
                    ({pad(i + 1)}/{pad(cases.length)})
                  </p>
                  <h3 className="mt-3 text-[clamp(30px,3.4vw,58px)] leading-[0.95] font-normal tracking-[-0.04em] md:mt-4">
                    {c.name}
                  </h3>
                  <p className="mono-label mt-4 text-ash">
                    {c.type} · {c.year}
                  </p>
                  <p className="mt-3 line-clamp-3 max-w-[400px] text-[15px] leading-[1.55] font-light text-mist md:mt-6 md:line-clamp-none md:text-[16px] md:leading-[1.6]">
                    {c.description}
                  </p>
                  <ul
                    className="mt-6 hidden flex-wrap gap-2 md:flex"
                    aria-label="Tecnologias"
                  >
                    {c.stack.map((tech) => (
                      <li
                        key={tech}
                        className="mono-label rounded-full border border-white/15 px-3 py-1.5 text-ash"
                      >
                        {tech}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/trabalhos/${c.slug}`}
                    data-cursor="Ver case"
                    className="mono-label mt-5 inline-flex items-center gap-2 text-bone max-md:rounded-full max-md:border max-md:border-white/15 max-md:px-4 max-md:py-3 md:mt-8 md:underline md:decoration-white/20 md:underline-offset-[6px] md:transition-colors md:hover:decoration-carmim-light"
                  >
                    Ver case completo <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </article>
          ))}

          {/* Fecho do trilho */}
          <div className="flex w-[88vw] shrink-0 flex-col justify-center px-4 md:w-[40vw] md:px-12">
            <p className="mono-label text-carmim-light">Próximo projeto</p>
            <p className="mt-4 text-[clamp(36px,4vw,68px)] leading-[1] font-normal tracking-[-0.05em]">
              O seu<span className="text-carmim">.</span>
            </p>
            <div className="mt-8">
              <Link href="/#contato" className="btn-glow">
                Iniciar projeto <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Progresso: linha fina no pé da seção */}
        <div
          className="mono-label pointer-events-none absolute inset-x-5 top-[76px] flex items-center gap-4 text-ash md:inset-x-12 md:top-auto md:bottom-6"
          aria-hidden="true"
        >
          <span className="relative block h-px flex-1 overflow-hidden bg-white/10">
            <span
              ref={bar}
              className="absolute inset-0 origin-left scale-x-0 bg-carmim-light"
            />
          </span>
          <span className="text-bone tabular-nums">
            <span ref={counter}>01</span> / {pad(cases.length)}
          </span>
        </div>
      </div>
    </section>
  );
}
