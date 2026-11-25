"use client";

import { useIdleEffect } from "@/lib/useIdleEffect";
import { useRef, type CSSProperties } from "react";
import { services } from "@/content/site";
import { gsap, prefersReducedMotion } from "@/lib/motion";
import { SplitHeading } from "./SplitHeading";

/**
 * Desktop: quatro colunas separadas por linhas finas; no hover a coluna acende em carmim.
 * Celular: pilha de cartões — cada cartão fica preso no topo e o próximo desliza por cima,
 * enquanto o de baixo encolhe e escurece.
 */
export function Services() {
  const list = useRef<HTMLOListElement>(null);

  useIdleEffect(() => {
    const el = list.current;
    if (!el || prefersReducedMotion()) return;
    const mm = gsap.matchMedia();
    const cards = gsap.utils.toArray<HTMLElement>("[data-card]", el);

    mm.add("(max-width: 767px)", () => {
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next) return;
        const top = 84 + (i + 1) * 14;
        const along = { trigger: next, start: "top bottom", end: `top ${top}px`, scrub: true };
        gsap.to(card, { scale: 0.9, transformOrigin: "50% 0%", ease: "none", scrollTrigger: along });
        gsap.to(card.querySelector("[data-dim]"), { opacity: 0.65, ease: "none", scrollTrigger: along });
      });
    });

    mm.add("(min-width: 768px)", () => {
      gsap.from(cards, {
        y: 48,
        opacity: 0,
        duration: 1.1,
        stagger: 0.08,
        ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 80%", toggleActions: "play none none none" },
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <section id="servicos" data-form="drift" className="px-4 py-28 md:px-8 md:py-40" aria-labelledby="servicos-titulo">
      <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <SplitHeading id="servicos-titulo" className="text-[clamp(44px,6.2vw,112px)]">
          O que a <em>gente</em> faz
        </SplitHeading>
        <div className="mono-label flex flex-col gap-2 text-ash md:items-end md:pb-4 md:text-right">
          <span className="text-carmim-light">(02) Serviços</span>
          <span className="max-w-[260px]">Quatro frentes, um jeito de trabalhar: entender antes de programar.</span>
        </div>
      </div>

      <ol
        ref={list}
        className="mt-12 flex flex-col gap-4 md:mt-24 md:grid md:grid-cols-2 md:gap-0 md:border-y md:border-white/10 xl:grid-cols-4"
      >
        {services.map((s, i) => (
          <li
            key={s.number}
            data-card
            style={{ "--i": i } as CSSProperties}
            className="group relative flex flex-col overflow-hidden max-md:sticky max-md:top-[calc(84px+var(--i)*14px)] max-md:min-h-[min(64svh,540px)] max-md:rounded-[28px] max-md:border max-md:border-white/10 max-md:bg-surface max-md:p-6 max-md:shadow-[0_-24px_60px_-24px_rgb(0_0_0/0.8)] md:min-h-[420px] md:border-b md:border-white/10 md:px-6 md:py-10 md:last:border-b-0 xl:border-r xl:border-b-0 xl:last:border-r-0"
          >
            {/* Brilho que sobe no hover (desktop) */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-0 bg-gradient-to-t from-carmim/25 to-transparent transition-[height] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:h-full"
            />
            {/* Brilho carmim fixo no pé do cartão (celular) */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(80%_100%_at_50%_100%,rgb(200_16_46/0.22),transparent)] md:hidden"
            />

            <div className="relative flex items-start justify-between">
              <span className="mono-label text-ash transition-colors duration-500 group-hover:text-carmim-light">
                ({s.number}) Serviço
              </span>
              <span
                aria-hidden="true"
                className="text-[76px] leading-[0.8] font-medium tracking-[-0.06em] text-white/[0.07] [font-family:var(--font-display)] md:hidden"
              >
                {s.number}
              </span>
            </div>

            <h3 className="display relative mt-auto pt-16 text-[clamp(30px,8.4vw,38px)] text-bone md:pt-24 md:text-[clamp(26px,2.1vw,34px)]">
              {s.title}
            </h3>
            <p className="relative mt-4 max-w-[340px] text-[16px] leading-[1.55] font-light text-mist md:mt-5">{s.text}</p>
            <ul className="relative mt-6 flex flex-wrap gap-2" aria-label="Tecnologias">
              {s.tags.map((t) => (
                <li key={t} className="mono-label rounded-full border border-white/15 px-3 py-1.5 text-ash">
                  {t}
                </li>
              ))}
            </ul>

            {/* Escurece o cartão quando o próximo passa por cima (celular) */}
            <span data-dim aria-hidden="true" className="pointer-events-none absolute inset-0 bg-black opacity-0 md:hidden" />
          </li>
        ))}
      </ol>
    </section>
  );
}
