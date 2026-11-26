"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/motion";
import { BOOT_EVENT, BOOT_KEY, isBooting } from "@/lib/boot";

// Registro de inicialização: cada linha acende quando o progresso passa do ponto dela.
const LOG: { at: number; tag: string; text: string }[] = [
  { at: 2, tag: "init", text: "runtime" },
  { at: 18, tag: "load", text: "fontes e estilos" },
  { at: 38, tag: "mount", text: "interface" },
  { at: 58, tag: "gpu", text: "shaders de partículas" },
  { at: 78, tag: "sync", text: "projetos" },
  { at: 100, tag: "ready", text: "barrossoftware.com.br" },
];
const WORD = ["barros", "software"] as const;

/** Espera fontes e página carregadas, com teto: ninguém fica preso na tela de carregamento. */
const pageReady = (cap: number) =>
  Promise.race([
    Promise.all([
      document.fonts?.ready ?? Promise.resolve(),
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise<void>((r) => window.addEventListener("load", () => r(), { once: true })),
    ]),
    new Promise<void>((r) => setTimeout(r, cap)),
  ]);

/**
 * Tela de carregamento: a marca é digitada com o cursor, o registro de inicialização sobe linha a linha
 * e o contador vai de 000 a 100 seguindo o carregamento real (fontes + página). No fim, a tela sobe
 * e a barra vermelha do progresso vira a linha de varredura que revela o site.
 */
export function Boot() {
  const [done, setDone] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const a = useRef<HTMLSpanElement>(null);
  const b = useRef<HTMLSpanElement>(null);
  const caret = useRef<HTMLSpanElement>(null);
  const caretEnd = useRef<HTMLSpanElement>(null);
  const pct = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const clock = useRef<HTMLSpanElement>(null);
  const lines = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    if (!isBooting()) return; // sem a marca no <html>, o CSS já esconde a tela
    const el = root.current!;
    const box = inner.current!;
    const t0 = performance.now();
    const p = { v: 0 };
    let lit = 0;
    let killed = false;

    const render = () => {
      const v = Math.round(p.v);
      pct.current!.textContent = String(v).padStart(3, "0");
      bar.current!.style.transform = `scaleX(${p.v / 100})`;
      clock.current!.textContent = `T+${((performance.now() - t0) / 1000).toFixed(3)}s`;
      while (lit < LOG.length && v >= LOG[lit].at) lines.current[lit++]?.setAttribute("data-on", "");
    };

    // a marca é digitada letra a letra; o cursor fica aceso enquanto digita e pisca quando para.
    // Ao digitar "software" o cursor vai para o fim; pronto, volta para o meio, como na logo.
    const mid = caret.current!;
    const end = caretEnd.current!;
    const type = gsap.timeline({ delay: 0.15 });
    type.call(() => mid.classList.add("is-typing"));
    for (const [i, word] of WORD.entries()) {
      const target = i === 0 ? a.current! : b.current!;
      if (i === 1)
        type.call(() => {
          mid.style.visibility = "hidden";
          end.style.display = "inline-block";
        });
      for (let n = 1; n <= word.length; n++) type.call(() => void (target.textContent = word.slice(0, n)), [], "+=0.055");
    }
    type.call(
      () => {
        end.style.display = "none";
        mid.style.visibility = "";
        mid.classList.remove("is-typing");
      },
      [],
      "+=0.12",
    );

    const progress = gsap.to(p, { v: 84, duration: 1.5, ease: "power2.inOut", onUpdate: render });

    const finish = async () => {
      await pageReady(2600);
      await new Promise((r) => progress.then(() => r(null)));
      if (killed) return;
      gsap
        .timeline({
          onComplete: () => {
            delete document.documentElement.dataset.boot;
            try {
              sessionStorage.setItem(BOOT_KEY, "1");
            } catch {}
            setDone(true);
          },
        })
        .to(p, { v: 100, duration: 0.45, ease: "power3.out", onUpdate: render })
        .to(box, { opacity: 0, y: -24, duration: 0.45, ease: "power2.in" }, "+=0.3")
        .call(() => void window.dispatchEvent(new Event(BOOT_EVENT)), [], "<0.15") // o hero começa enquanto a tela sobe
        .to(el, { yPercent: -100, duration: 1, ease: "expo.inOut" }, "<");
    };
    finish();

    return () => {
      killed = true;
      type.kill();
      progress.kill();
      gsap.killTweensOf([p, box, el]);
    };
  }, []);

  if (done) return null;

  return (
    <div
      ref={root}
      className="boot fixed inset-0 z-[200] flex-col bg-void text-bone will-change-transform"
      aria-hidden="true"
      data-lenis-prevent
    >
      {/* mesma grade de quatro colunas do hero */}
      <div className="pointer-events-none absolute inset-0 grid grid-cols-4 px-4 md:px-8">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`border-l border-white/[0.05] ${i === 3 ? "border-r" : ""}`} />
        ))}
      </div>

      <div ref={inner} className="relative flex flex-1 flex-col px-4 pt-[calc(20px+env(safe-area-inset-top))] md:px-8 md:pt-7">
        <div className="mono-label flex items-center justify-between text-ash">
          <span>
            <span className="text-carmim-light">(BR)</span> Sys.boot
          </span>
          <span ref={clock} className="tabular-nums">
            T+0.000s
          </span>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="flex max-w-full flex-col">
            {/* a marca completa, invisível, reserva a largura: o bloco não se desloca enquanto ela é digitada */}
            <p className="grid text-[clamp(44px,11vw,104px)] leading-none tracking-[-0.035em] [font-family:var(--font-display)]">
              <span className="invisible col-start-1 row-start-1 flex h-[1em] items-center" aria-hidden="true">
                <span className="font-bold">{WORD[0]}</span>
                <span className="mx-[0.07em] inline-block h-[0.8em] w-[0.075em] shrink-0" />
                <span className="font-light">{WORD[1]}</span>
                <span className="ml-[0.07em] inline-block h-[0.8em] w-[0.075em] shrink-0" />
              </span>
              <span className="col-start-1 row-start-1 flex h-[1em] items-center">
                <span ref={a} className="font-bold" />
                <span
                  ref={caret}
                  className="logo-caret mx-[0.07em] inline-block shrink-0 h-[0.8em] w-[0.075em] translate-y-[0.04em] bg-carmim"
                />
                <span ref={b} className="font-light" />
                <span
                  ref={caretEnd}
                  className="logo-caret is-typing ml-[0.07em] hidden shrink-0 h-[0.8em] w-[0.075em] translate-y-[0.04em] bg-carmim"
                />
              </span>
            </p>

            <ol className="boot-log mt-8 flex flex-col gap-1.5 font-[family-name:var(--font-mono)] text-[11px] tracking-[0.06em] uppercase md:mt-10 md:text-[12px]">
              {LOG.map((l, i) => (
                <li
                  key={l.tag}
                  ref={(n) => {
                    lines.current[i] = n;
                  }}
                  className="flex items-center gap-3"
                >
                  <span className="w-12 shrink-0 text-carmim-light">{l.tag}</span>
                  <span className="shrink-0 text-ash">{l.text}</span>
                  <span className="h-px flex-1 border-b border-dotted border-white/15" />
                  <span className="text-bone">{l.tag === "ready" ? "●" : "ok"}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="flex items-end justify-between pb-5 md:pb-7">
          <span className="mono-label text-ash">Carregando a experiência</span>
          <span className="flex items-baseline gap-1 leading-none [font-family:var(--font-display)]">
            <span ref={pct} className="text-[clamp(40px,8vw,72px)] font-light tracking-[-0.04em] tabular-nums">
              000
            </span>
            <span className="mono-label text-carmim-light">%</span>
          </span>
        </div>
      </div>

      {/* barra de progresso; no fim vira a linha de varredura que revela o site */}
      <div className="relative h-[2px] w-full bg-white/10">
        <div
          ref={bar}
          className="absolute inset-0 origin-left bg-carmim shadow-[0_0_18px_2px_rgb(200_16_46/0.7)]"
          style={{ transform: "scaleX(0)" }}
        />
      </div>
    </div>
  );
}
