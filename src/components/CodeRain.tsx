"use client";

import { useIdleEffect } from "@/lib/useIdleEffect";
import { useRef, useState } from "react";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { gsap, prefersReducedMotion } from "@/lib/motion";

gsap.registerPlugin(ScrambleTextPlugin);

const ITEMS = [
  "Sistemas web",
  "Apps mobile",
  "Sites",
  "Automação",
  "Inteligência artificial",
  "Integrações",
];
const GLYPHS =
  "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789<>/{}[]=+*#";
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Faixa entre a seção A empresa e Serviços: uma chuva de código (colunas de caracteres caindo, com a
 * cabeça clara e o rastro em carmim) e, no meio, o que a empresa faz sendo "decifrado".
 * Guiada pelo scroll: a faixa trava na tela, cada trecho de scroll decifra o próximo serviço, a palavra
 * cresce aos poucos e a chuva acelera com a velocidade da rolagem.
 * Canvas 2D leve (~24 quadros/s), pausa fora da tela; com movimento reduzido fica um quadro parado.
 */
export function CodeRain() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const word = useRef<HTMLSpanElement>(null);
  const center = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const boost = useRef(1); // velocidade da chuva: sobe com a velocidade do scroll e volta a 1
  const [index, setIndex] = useState(0);

  // chuva de código
  useIdleEffect(() => {
    const el = stage.current;
    const cv = canvas.current;
    const ctx = cv?.getContext("2d");
    if (!el || !cv || !ctx) return;
    const reduced = prefersReducedMotion();
    let cols: number[] = [];
    let size = 16;
    let w = 0;
    let h = 0;
    let colors = { bg: "#000", head: "#fff", trail: "#f0465e" };
    // o canvas não entende var(): lê o nome real da fonte mono carregada pelo next/font
    const mono =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--font-plex-mono")
        .trim() || "monospace";
    const readColors = () => {
      const cs = getComputedStyle(document.documentElement);
      colors = {
        bg: cs.getPropertyValue("--c-void").trim() || "#000",
        head: cs.getPropertyValue("--c-bone").trim() || "#fff",
        trail: cs.getPropertyValue("--c-carmim-light").trim() || "#f0465e",
      };
    };
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      w = el.clientWidth;
      h = el.clientHeight;
      cv.width = w * dpr;
      cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      size = w < 768 ? 13 : 16;
      cols = Array.from(
        { length: Math.ceil(w / size) },
        () => (Math.random() * -h) / size,
      );
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);
    };
    const draw = () => {
      // rastro: cobre o quadro anterior com o fundo quase transparente
      ctx.globalAlpha = 0.14;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
      ctx.font = `${size}px ${mono}, ui-monospace, monospace`;
      ctx.textBaseline = "top";
      for (let i = 0; i < cols.length; i++) {
        const y = cols[i] * size;
        const ch = GLYPHS[(Math.random() * GLYPHS.length) | 0];
        // o caractere de cima do rastro em carmim, a cabeça clara
        ctx.fillStyle = colors.trail;
        ctx.globalAlpha = 0.55;
        ctx.fillText(
          GLYPHS[(Math.random() * GLYPHS.length) | 0],
          i * size,
          y - size,
        );
        ctx.globalAlpha = 0.95;
        ctx.fillStyle = colors.head;
        ctx.fillText(ch, i * size, y);
        cols[i] += (Math.random() < 0.9 ? 1 : 0) * boost.current;
        if (y > h && Math.random() > 0.975) cols[i] = Math.random() * -20;
      }
      ctx.globalAlpha = 1;
      boost.current += (1 - boost.current) * 0.06;
    };

    readColors();
    resize();
    const themeObs = new MutationObserver(() => {
      readColors();
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);
    });
    themeObs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    if (reduced) {
      for (let i = 0; i < 60; i++) draw();
      return () => {
        ro.disconnect();
        themeObs.disconnect();
      };
    }

    let visible = false;
    let raf = 0;
    let last = 0;
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || t - last < 42) return; // ~24 quadros/s: o ritmo "de terminal" e menos gasto de bateria
      last = t;
      draw();
    };
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      themeObs.disconnect();
    };
  }, []);

  // Scroll: trava a faixa, decifra um serviço por trecho, cresce a palavra e acelera a chuva
  useIdleEffect(() => {
    const st = stage.current;
    const target = word.current;
    if (!st || !target || prefersReducedMotion()) return;
    let current = 0;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          // fixa o palco interno (não a <section>, que o React precisa conseguir remover ao trocar de página)
          trigger: st,
          start: "top top",
          end: () => `+=${window.innerHeight * (ITEMS.length * 0.55)}`,
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const next = Math.min(
              ITEMS.length - 1,
              Math.floor(self.progress * ITEMS.length),
            );
            if (next !== current) {
              current = next;
              setIndex(next);
              gsap.to(target, {
                duration: 0.9,
                overwrite: true,
                scrambleText: {
                  text: ITEMS[next],
                  chars: GLYPHS,
                  revealDelay: 0.2,
                  speed: 0.6,
                },
              });
            }
            if (bar.current)
              bar.current.style.transform = `scaleX(${self.progress})`;
            // quanto mais rápido o scroll, mais rápido o código cai
            boost.current = Math.max(
              boost.current,
              1 + Math.min(Math.abs(self.getVelocity()) / 500, 3.5),
            );
          },
        },
      });
      tl.fromTo(
        center.current,
        { scale: 0.9 },
        { scale: 1.08, ease: "none" },
        0,
      ).fromTo(
        canvas.current,
        { yPercent: 0 },
        { yPercent: -6, ease: "none" },
        0,
      );
    }, st);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={section} aria-label="O que fazemos" className="relative">
      {/* Divisas esfumadas: o palco da chuva é opaco; sem isto as partículas da seção vizinha
          (Serviços, embaixo) começariam num corte reto na borda dele */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-[24svh] -z-[1] h-[24svh] bg-gradient-to-b from-transparent to-void"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -bottom-[36svh] -z-[1] h-[36svh] bg-gradient-to-t from-transparent via-void/70 to-void"
      />
      <p className="sr-only">{ITEMS.join(", ")}</p>
      <div
        ref={stage}
        className="relative isolate h-[100svh] min-h-[480px] overflow-hidden bg-void"
      >
        <canvas
          ref={canvas}
          aria-hidden="true"
          className="absolute inset-0 size-full [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)]"
        />
        {/* sombra no meio para a palavra ler bem sobre a chuva */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(55%_40%_at_50%_50%,var(--color-void)_30%,transparent_100%)] opacity-90"
        />
        <div
          ref={center}
          aria-hidden="true"
          className="relative flex h-full flex-col items-center justify-center px-4 text-center"
        >
          <p className="mono-label text-ash">
            <span className="text-carmim-light">&gt;</span> barros --stack
          </p>
          <p className="mt-6 text-[clamp(40px,8vw,132px)] leading-[0.95] font-medium tracking-[-0.05em] [font-family:var(--font-display)]">
            <span ref={word}>{ITEMS[0]}</span>
            <span className="text-carmim">.</span>
          </p>
          <p className="mono-label mt-6 text-ash tabular-nums">
            [ {pad(index + 1)} / {pad(ITEMS.length)} ]
          </p>
          <span className="relative mt-5 block h-px w-40 overflow-hidden bg-white/15">
            <span
              ref={bar}
              className="absolute inset-0 origin-left scale-x-0 bg-carmim-light"
            />
          </span>
        </div>
      </div>
    </section>
  );
}
