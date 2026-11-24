"use client";

import { useEffect, useRef } from "react";
import { process as etapas } from "@/content/site";
import { gsap, prefersReducedMotion } from "@/lib/motion";

/**
 * Processo: quatro etapas lado a lado. Um cabo de linhas (partículas, forma "path") atravessa a seção
 * e se aperta em cada nó; no celular o cabo desce pela lateral. Os nós acendem conforme o scroll.
 */
export function Process() {
  const list = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const el = list.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-step]").forEach((step, i) => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: `top ${78 - i * 6}%`, toggleActions: "play none none none" } });
        tl.from(step.querySelector("[data-node]"), { scale: 0, duration: 0.8, ease: "back.out(2)" }, i * 0.12).from(
          step.querySelectorAll("[data-text]"),
          { y: 24, opacity: 0, duration: 1, stagger: 0.06, ease: "expo.out" },
          i * 0.12 + 0.1,
        );
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section id="processo" data-form="path" className="relative px-4 py-28 md:px-12 md:py-40" aria-labelledby="processo-titulo">
      <div className="mono-label flex items-center gap-4 text-ash">
        <span className="text-carmim-light">(04)</span>
        <span>Processo</span>
        <span className="h-px flex-1 bg-white/10" aria-hidden="true" />
      </div>

      <div className="mt-10 grid gap-8 md:grid-cols-12 md:items-end">
        <h2
          id="processo-titulo"
          className="text-[clamp(40px,5.4vw,92px)] leading-[0.95] font-medium tracking-[-0.045em] md:col-span-7"
        >
          Sem surpresa
          <br />
          no caminho<span className="text-carmim">.</span>
        </h2>
        <p className="max-w-[420px] text-[17px] leading-[1.6] font-light text-mist md:col-span-4 md:col-start-9 md:pb-3">
          Você sabe o que está sendo feito, quando fica pronto e quanto custa. Toda semana.
        </p>
      </div>

      <ol ref={list} className="relative mt-16 grid auto-rows-fr md:mt-24 md:grid-cols-4 md:auto-rows-auto">
        {/* Área do cabo de partículas: faixa no topo (desktop) ou coluna à esquerda (celular) */}
        <div
          data-anchor
          aria-hidden="true"
          className="pointer-events-none absolute top-0 bottom-0 left-0 w-12 md:inset-x-0 md:top-0 md:bottom-auto md:h-40 md:w-auto"
        />

        {etapas.map((step) => (
          <li
            key={step.number}
            data-step
            className="relative flex min-h-[200px] items-center pl-16 md:block md:min-h-0 md:pt-40 md:pr-8 md:pl-0"
          >
            {/* Nó no caminho */}
            <span
              data-node
              aria-hidden="true"
              className="absolute top-1/2 left-6 grid size-4 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-carmim-light bg-void md:top-20 md:left-1/2"
            >
              <span className="size-1.5 rounded-full bg-carmim-light shadow-[0_0_10px_var(--color-carmim)]" />
            </span>

            <div className="md:mx-auto md:max-w-[300px] md:text-center">
              <p data-text className="mono-label text-ash">
                Etapa {step.number}
              </p>
              <h3 data-text className="mt-3 text-[clamp(26px,2.2vw,36px)] leading-none font-medium tracking-[-0.04em]">
                {step.title}
              </h3>
              <p data-text className="mt-4 text-[16px] leading-[1.55] font-light text-mist">
                {step.text}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
