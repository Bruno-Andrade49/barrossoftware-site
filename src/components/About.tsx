"use client";

import { useIdleEffect } from "@/lib/useIdleEffect";
import { useRef } from "react";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { gsap, prefersReducedMotion } from "@/lib/motion";
import Image from "next/image";
import { founder } from "@/content/site";
import { SectionLabel } from "./SectionLabel";
import { Reveal } from "./Reveal";

// fotos de bastidores (~1100 px): em P&B com só o vermelho da camiseta (carmim); ao passar o mouse, a versão colorida (`-cor`) aparece
const SHOTS = [
  {
    src: "/images/sobre/bastidores-perfil.webp", w: 1120, h: 1400, alt: "Bruno trabalhando no notebook",
    caption: "Do rascunho ao ar", fig: "md:col-span-5 md:col-start-2", box: "w-3/4 md:w-auto", sizes: "(min-width: 768px) 40vw, 75vw",
  },
  {
    src: "/images/sobre/bastidores-codigo.webp", w: 1100, h: 1649, alt: "Bruno programando, com o código aberto na tela",
    caption: "Mão no código", fig: "md:col-span-4 md:col-start-8", box: "ml-auto mt-12 w-2/3 md:mt-40 md:w-auto", sizes: "(min-width: 768px) 32vw, 66vw",
  },
];

gsap.registerPlugin(ScrambleTextPlugin);

// caracteres da "decodificação": katakana de meia largura (o visual Matrix), binário e símbolos de código
const GLYPHS = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉ01<>/{}[]=+*#";
const COMMAND = "barros --principios";

const PRINCIPLES = [
  { title: "Código sob medida", text: "Feito para o seu negócio. O sistema é seu." },
  { title: "Resposta em 1 dia útil", text: "Seu contato não fica esperando na fila." },
  { title: "Entregas semanais", text: "Toda semana você testa o que foi construído." },
  { title: "Contato direto", text: "Você fala com quem desenha e com quem programa." },
];

/**
 * Seção 05 — A empresa. Sem partículas (forma "off"): o terminal é o destaque.
 * Ao entrar na tela, o título se decodifica, o comando é digitado letra a letra e os princípios
 * carregam como linhas de um sistema, cada uma confirmada com [ OK ].
 */
export function About() {
  const root = useRef<HTMLElement>(null);
  const typed = useRef<HTMLSpanElement>(null);

  useIdleEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-decode]").forEach((line, i) => {
        const text = line.textContent ?? "";
        gsap.to(line, {
          duration: 1.4,
          delay: i * 0.15,
          scrambleText: { text, chars: GLYPHS, revealDelay: 0.25, speed: 0.45 },
          scrollTrigger: { trigger: el, start: "top 70%", toggleActions: "play none none none" },
        });
      });

      const term = el.querySelector("[data-terminal]");
      const tl = gsap.timeline({ scrollTrigger: { trigger: term, start: "top 78%", toggleActions: "play none none none" } });
      tl.from(term, { opacity: 0, y: 40, duration: 0.9, ease: "expo.out" });
      // comando digitado
      const cmd = { n: 0 };
      tl.to(
        cmd,
        {
          n: COMMAND.length,
          duration: COMMAND.length * 0.045,
          ease: "none",
          onUpdate: () => {
            if (typed.current) typed.current.textContent = COMMAND.slice(0, Math.round(cmd.n));
          },
        },
        "-=0.3",
      );
      // linhas carregando: o status passa de [ .. ] para [ OK ]
      gsap.utils.toArray<HTMLElement>("[data-line]", term).forEach((line) => {
        const status = line.querySelector("[data-status]");
        tl.from(line, { opacity: 0, x: -12, duration: 0.35, ease: "power2.out" }, ">0.15");
        if (status)
          tl.fromTo(
            status,
            { textContent: "[ .. ]" },
            { duration: 0.45, scrambleText: { text: "[ OK ]", chars: "./-\\|", speed: 1 } },
            "<0.1",
          );
      });
      tl.from("[data-done]", { opacity: 0, duration: 0.3 }, ">0.1");
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="sobre"
      data-form="off"
      className="relative px-4 py-28 md:px-12 md:py-40"
      aria-labelledby="sobre-titulo"
    >
      {/* brilho carmim discreto atrás do terminal */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-[1] bg-[radial-gradient(45%_50%_at_72%_55%,rgb(200_16_46/0.14),transparent_70%)]"
      />

      <SectionLabel n="05" label="A empresa" desc="Quem desenha e quem programa, do rascunho ao sistema no ar." extra="sys://barros" />

      <div className="mt-12 grid gap-12 md:grid-cols-12 md:items-center md:gap-10">
        <div className="md:col-span-5">
          <h2 id="sobre-titulo" className="text-[clamp(40px,4.8vw,80px)] leading-[0.98] font-medium tracking-[-0.042em]">
            <span data-decode className="block">
              Código escrito
            </span>
            <span className="block">
              <span data-decode>para o seu</span>
            </span>
            <span className="block">
              <span data-decode>negócio</span>
              <span className="text-carmim">.</span>
            </span>
          </h2>
          <p className="mt-8 max-w-[440px] text-[17px] leading-[1.6] font-light text-mist">
            Sem intermediário e sem surpresa. Do primeiro rascunho ao sistema rodando, quem desenha e quem programa
            estão do seu lado.
          </p>

          {/* quem está por trás (só com a foto preenchida em content/site.ts) */}
          {founder.photo && (
            <figure className="mt-10 flex max-w-[460px] items-start gap-5 border-t border-white/10 pt-8">
              <Image
                src={founder.photo}
                alt={founder.name}
                width={72}
                height={72}
                unoptimized
                className="size-[72px] shrink-0 rounded-full object-cover ring-1 ring-white/15"
              />
              <div>
                <blockquote className="text-[15px] leading-[1.6] font-light text-mist">{founder.quote}</blockquote>
                <figcaption className="mono-label mt-4 text-ash">
                  <span className="text-bone">{founder.name}</span>
                  <span className="block pt-1 text-carmim-light">{founder.role}</span>
                </figcaption>
              </div>
            </figure>
          )}
        </div>

        {/* Terminal com os princípios */}
        <div data-terminal className="glass overflow-hidden rounded-2xl md:col-span-7">
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 md:px-5">
            <span className="size-2.5 rounded-full bg-carmim/80" aria-hidden="true" />
            <span className="size-2.5 rounded-full bg-white/20" aria-hidden="true" />
            <span className="size-2.5 rounded-full bg-white/20" aria-hidden="true" />
            <span className="mono-label ml-3 truncate text-ash">barros@dev: ~/principios</span>
            <span className="mono-label ml-auto hidden text-ash sm:inline">zsh</span>
          </div>
          <ol className="flex flex-col gap-5 px-4 py-6 font-mono text-[13px] leading-[1.55] md:px-7 md:py-8 md:text-[14.5px]">
            <li aria-hidden="true" className="text-ash">
              <span className="text-carmim-light">$</span>{" "}
              <span ref={typed} className="text-bone">
                {COMMAND}
              </span>
            </li>
            {PRINCIPLES.map((p) => (
              <li key={p.title} data-line className="grid grid-cols-[64px_1fr] gap-x-3 md:grid-cols-[74px_1fr]">
                <span data-status className="text-carmim-light">
                  [ OK ]
                </span>
                <span>
                  <span className="text-bone">{p.title}</span>
                  <span className="block text-ash">
                    <span aria-hidden="true">{"// "}</span>
                    {p.text}
                  </span>
                </span>
              </li>
            ))}
            <li data-done aria-hidden="true" className="text-ash">
              <span className="text-carmim-light">✓</span> 4 princípios carregados
              <span className="mt-4 block">
                <span className="text-carmim-light">$</span> <span className="terminal-cursor">_</span>
              </span>
            </li>
          </ol>
        </div>
      </div>

      {/* bastidores: duas fotos desencontradas, como numa revista */}
      <Reveal className="mt-16 grid md:mt-28 md:grid-cols-12 md:gap-10">
        {SHOTS.map((s, i) => (
          <figure key={s.src} className={`group ${s.box} ${s.fig}`}>
            {/* embaixo a foto colorida; por cima a tratada, que some no hover (ou ao tocar, no celular) */}
            <div className="relative overflow-hidden rounded-2xl ring-1 ring-white/10">
              <Image
                src={s.src.replace(".webp", "-cor.webp")}
                alt=""
                aria-hidden
                width={s.w}
                height={s.h}
                sizes={s.sizes}
                unoptimized
                className="h-auto w-full"
              />
              <Image
                src={s.src}
                alt={s.alt}
                width={s.w}
                height={s.h}
                sizes={s.sizes}
                unoptimized // já tratada e exportada no tamanho certo: recomprimir só tira nitidez e mata o grão
                className="absolute inset-0 h-full w-full transition-opacity duration-700 ease-out group-hover:opacity-0 motion-reduce:transition-none"
              />
            </div>
            <figcaption className="mono-label mt-3 flex flex-col gap-1 text-ash md:flex-row md:gap-2">
              <span className="whitespace-nowrap text-carmim-light">(fig. 0{i + 1})</span>
              {s.caption}
            </figcaption>
          </figure>
        ))}
      </Reveal>
    </section>
  );
}
