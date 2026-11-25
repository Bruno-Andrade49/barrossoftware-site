"use client";

import { useRef, type MouseEvent } from "react";
import { faq } from "@/content/site";
import { gsap, prefersReducedMotion } from "@/lib/motion";
import { Reveal } from "./Reveal";
import { SectionLabel } from "./SectionLabel";

const D = { duration: 0.55, ease: "power3.inOut" };

/** Fecha um item animando a altura da resposta até zero. */
function closeItem(d: HTMLDetailsElement) {
  const body = d.querySelector<HTMLElement>("[data-answer]");
  if (!body || prefersReducedMotion()) {
    d.open = false;
    return;
  }
  gsap.to(body, {
    height: 0,
    opacity: 0,
    ...D,
    onComplete: () => {
      d.open = false;
      gsap.set(body, { clearProps: "height,opacity" });
    },
  });
}

/**
 * Perguntas frequentes. Cada item é um <details>: o texto vai no HTML do servidor
 * (legível por buscadores e robôs de IA) e funciona mesmo sem JavaScript. Com JavaScript, a resposta
 * abre e fecha deslizando, e abrir uma pergunta fecha a que estava aberta.
 * O mesmo conteúdo alimenta o JSON-LD FAQPage da home.
 */
export function Faq() {
  const list = useRef<HTMLDivElement>(null);

  const toggle = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
    const d = e.currentTarget.parentElement as HTMLDetailsElement;
    if (d.open) return closeItem(d);
    list.current
      ?.querySelectorAll<HTMLDetailsElement>("details[open]")
      .forEach(closeItem);
    d.open = true;
    const body = d.querySelector<HTMLElement>("[data-answer]");
    if (body && !prefersReducedMotion())
      gsap.fromTo(
        body,
        { height: 0, opacity: 0 },
        { height: "auto", opacity: 1, ...D },
      );
  };

  return (
    <section
      id="perguntas"
      data-form="drift"
      className="relative px-4 py-28 md:px-12 md:py-40"
      aria-labelledby="perguntas-titulo"
    >
      <div className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <SectionLabel n="05" label="Perguntas" desc="O que mais perguntam antes de começar." rule={false} />
          <h2
            id="perguntas-titulo"
            className="mt-8 text-[clamp(40px,4.6vw,80px)] leading-[0.98] font-medium tracking-[-0.042em]"
          >
            Antes de
            <br />
            começar<span className="text-carmim">.</span>
          </h2>
          <p className="mt-8 max-w-[380px] text-[17px] leading-[1.6] font-light text-mist">
            O que mais perguntam antes do primeiro projeto. Ficou alguma dúvida?
            Chame no WhatsApp.
          </p>
        </div>

        <div ref={list} className="md:col-span-7">
          <Reveal as="div" className="border-t border-white/10">
            {faq.map((f, i) => (
              <details key={f.q} className="group border-b border-white/10">
                <summary
                  onClick={toggle}
                  className="flex cursor-pointer list-none items-start gap-5 py-6 [&::-webkit-details-marker]:hidden"
                >
                  <span className="mono-label mt-2 w-6 shrink-0 text-carmim-light">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="flex-1 text-[clamp(20px,1.8vw,28px)] leading-[1.2] font-medium tracking-[-0.03em]">
                    {f.q}
                  </h3>
                  <span
                    aria-hidden="true"
                    className="relative mt-2 size-4 shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] group-open:rotate-45"
                  >
                    <span className="absolute top-1/2 left-0 h-px w-4 bg-bone" />
                    <span className="absolute top-0 left-1/2 h-4 w-px bg-bone" />
                  </span>
                </summary>
                <div data-answer className="overflow-hidden">
                  <p className="max-w-[560px] pb-7 pl-11 text-[16px] leading-[1.6] font-light text-mist">
                    {f.a}
                  </p>
                </div>
              </details>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
