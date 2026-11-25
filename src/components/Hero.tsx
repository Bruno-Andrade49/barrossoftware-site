"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { gsap } from "@/lib/motion";
import { isBooting, whenBooted } from "@/lib/boot";
import { LocalClock } from "./LocalClock";
import { flowBus, flowState, type FlowStats } from "@/lib/flow";

gsap.registerPlugin(ScrambleTextPlugin);

const GLYPHS = "01<>/{}[]#_+*";

// O título alterna entre o que a empresa faz (verbo + objeto). O h1 mantém "Move negócios." para
// buscadores e leitores de tela; a troca é só visual. Palavras com até 8 letras, para caber no celular.
const HEADLINES: [string, string][] = [
  ["Move", "negócios"],
  ["Cria", "sistemas"],
  ["Lança", "apps"],
  ["Constrói", "sites"],
  ["Integra", "IA"],
];
const fmtCount = (n: number) => {
  const s = String(Math.round(n)).padStart(6, "0");
  return `${s.slice(0, 3)}.${s.slice(3)}`;
};
const fmtAxis = (v: number) => `${v >= 0 ? "+" : "−"}${Math.abs(v).toFixed(3)}`;


export function Hero() {
  const root = useRef<HTMLElement>(null);
  const meta = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const readout = useRef<HTMLDListElement>(null);
  const word1 = useRef<HTMLSpanElement>(null);
  const word2 = useRef<HTMLSpanElement>(null);
  const caret1 = useRef<HTMLSpanElement>(null);
  const caret2 = useRef<HTMLSpanElement>(null);
  const side = useRef<HTMLDivElement>(null);
  const footer = useRef<HTMLDivElement>(null);

  const countEl = useRef<HTMLElement>(null);
  const countMobile = useRef<HTMLElement>(null);
  const stateMobile = useRef<HTMLElement>(null);
  const xyEl = useRef<HTMLElement>(null);
  const stateEl = useRef<HTMLElement>(null);
  const fpsEl = useRef<HTMLElement>(null);
  const total = useRef(0);

  // Leituras ao vivo do núcleo (escreve direto no DOM, sem re-render)
  const onStats = (s: FlowStats) => {
    if (xyEl.current) xyEl.current.textContent = `X ${fmtAxis(s.x)}  Y ${fmtAxis(s.y)}`;
    if (fpsEl.current) fpsEl.current.textContent = `${s.fps} fps`;
    const hot = s.agitation > 0.3;
    for (const el of [stateEl.current, stateMobile.current]) {
      if (!el) continue;
      el.textContent = hot ? "Agitado" : "Estável";
      el.style.color = hot ? "var(--color-carmim-light)" : "";
    }
  };
  // o palco de partículas carrega depois da página: quando ele anuncia a contagem, o contador sobe até ela
  const onReady = (count: number) => {
    if (total.current === count) return;
    total.current = count;
    const show = (v: number) => {
      for (const el of [countEl.current, countMobile.current]) if (el) el.textContent = fmtCount(v);
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return show(count);
    const c = { v: 0 };
    whenBooted(() => gsap.to(c, { v: count, duration: 2.4, ease: "power3.out", onUpdate: () => show(c.v) }));
  };

  // O canvas vive fora do hero (palco compartilhado com a seção seguinte); as leituras chegam pelo canal
  useEffect(() => {
    if (flowState.count) onReady(flowState.count);
    const ready = (e: Event) => onReady((e as CustomEvent<number>).detail);
    const stats = (e: Event) => onStats((e as CustomEvent<FlowStats>).detail);
    flowBus.addEventListener("ready", ready);
    flowBus.addEventListener("stats", stats);
    return () => {
      flowBus.removeEventListener("ready", ready);
      flowBus.removeEventListener("stats", stats);
    };
  });

  // Troca do título como num editor: o cursor apaga a frase de trás para a frente e digita a próxima.
  // O cursor fica parado (aceso) enquanto digita e pisca quando para, como o da marca.
  // Pausa quando o hero sai da tela ou a aba fica em segundo plano.
  useEffect(() => {
    const el = root.current;
    const w1 = word1.current;
    const w2 = word2.current;
    const c1 = caret1.current;
    const c2 = caret2.current;
    if (!el || !w1 || !w2 || !c1 || !c2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let visible = true;
    let index = 0;
    let call: gsap.core.Tween | null = null;
    let tl: gsap.core.Timeline | null = null;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.25 });
    io.observe(el);

    // cursor na linha 1 ou 2; "typing" segura o cursor aceso
    const caretAt = (line: 1 | 2, typing: boolean) => {
      c1.style.display = line === 1 ? "" : "none";
      c2.style.display = line === 2 ? "" : "none";
      for (const c of [c1, c2]) c.classList.toggle("is-typing", typing);
    };
    // apaga ou digita trocando o texto letra a letra
    const edit = (t: gsap.core.Timeline, target: HTMLElement, from: string, to: string) => {
      const erase = to.length < from.length;
      const text = erase ? from : to;
      const p = { n: erase ? from.length : 0 };
      t.to(p, {
        n: erase ? 0 : to.length,
        duration: text.length * (erase ? 0.045 : 0.085),
        ease: "none",
        onUpdate: () => {
          target.textContent = text.slice(0, Math.round(p.n));
        },
      });
    };

    const next = () => {
      if (!visible || document.hidden) {
        call = gsap.delayedCall(1, next);
        return;
      }
      const [verb, noun] = HEADLINES[index];
      index = (index + 1) % HEADLINES.length;
      const [nVerb, nNoun] = HEADLINES[index];
      tl = gsap.timeline({
        onComplete: () => {
          call = gsap.delayedCall(2.8, next);
        },
      });
      tl.call(() => caretAt(2, true));
      edit(tl, w2, noun, "");
      tl.call(() => caretAt(1, true));
      edit(tl, w1, verb, "");
      tl.to({}, { duration: 0.18 });
      edit(tl, w1, "", nVerb);
      tl.call(() => caretAt(2, true));
      edit(tl, w2, "", nNoun);
      tl.call(() => caretAt(2, false));
    };
    // começa depois da entrada do hero (que espera a tela de carregamento, na primeira visita)
    const unboot = whenBooted(() => (call = gsap.delayedCall(4.6, next)));
    return () => {
      unboot();
      io.disconnect();
      call?.kill();
      tl?.kill();
      gsap.killTweensOf([w1, w2]);
    };
  }, []);

  useEffect(() => {
    if (!root.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let unboot = () => {};
    const ctx = gsap.context(() => {
      // na primeira visita, monta pausada (os elementos já ficam no estado inicial, sob a tela de carregamento)
      const tl = gsap.timeline({ defaults: { ease: "expo.out" }, paused: isBooting() });
      unboot = whenBooted(() => tl.play());
      tl.from(frame.current!.children, { scale: 0, opacity: 0, duration: 1.2, stagger: 0.06 }, 0)
        .from(meta.current!.children, { opacity: 0, y: -10, duration: 1, stagger: 0.07 }, 0.2)
        // o título não sai de cena (é o maior elemento da tela, o LCP): só as letras embaralham
        .to(word1.current, { duration: 1.4, scrambleText: { text: "Move", chars: GLYPHS, revealDelay: 0.35, speed: 0.5 } }, 0.35)
        .to(word2.current, { duration: 1.7, scrambleText: { text: "negócios", chars: GLYPHS, revealDelay: 0.45, speed: 0.5 } }, 0.47)
        .from(readout.current!.children, { opacity: 0, x: -8, duration: 0.8, stagger: 0.04 }, 0.6)
        .from(side.current!.children, { opacity: 0, y: 24, duration: 1.1, stagger: 0.1 }, 0.9)
        .from(footer.current!.children, { opacity: 0, duration: 1, stagger: 0.08 }, 1.2);
    }, root);
    return () => {
      unboot();
      ctx.revert();
    };
  }, []);

  return (
    <section ref={root} id="inicio" data-form="flow" className="relative isolate h-[100svh] min-h-[660px] overflow-hidden" aria-labelledby="hero-titulo">
      {/* Grade de fundo: some aos poucos antes do fim da seção, para não marcar a divisa */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black_55%,transparent)]"
        aria-hidden="true"
      >
        <div className="absolute inset-0 grid grid-cols-4 px-4 md:px-8">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`border-l border-white/[0.05] ${i === 3 ? "border-r" : ""}`} />
          ))}
        </div>
      </div>

      {/* Sombra só atrás do título (não toca as bordas da seção) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[4%] left-[-10%] h-[60%] w-[75%] bg-[radial-gradient(closest-side,var(--color-void),transparent)] opacity-80"
      />

      {/* Moldura de instrumento */}
      <div ref={frame} aria-hidden="true" className="pointer-events-none absolute inset-x-8 top-[76px] bottom-6 hidden md:block">
        <span className="absolute top-0 left-0 h-4 w-4 origin-top-left border-t border-l border-white/40" />
        <span className="absolute top-0 right-0 h-4 w-4 origin-top-right border-t border-r border-white/40" />
        <span className="absolute bottom-0 left-0 h-4 w-4 origin-bottom-left border-b border-l border-white/40" />
        <span className="absolute right-0 bottom-0 h-4 w-4 origin-bottom-right border-r border-b border-white/40" />
      </div>

      <div className="pointer-events-none relative z-10 flex h-full flex-col px-4 pt-[80px] pb-[calc(20px+env(safe-area-inset-bottom))] md:px-12 md:pt-[88px] md:pb-10">
        {/* Linha de metadados */}
        <div ref={meta} className="mono-label grid grid-cols-2 gap-4 text-ash md:grid-cols-4">
          <span>(BR) Empresa de software</span>
          <span className="hidden md:block">Sistemas / Apps</span>
          <span className="hidden md:block">Sites / IA</span>
          <span className="text-right">
            PB — <LocalClock /> BRT
          </span>
        </div>

        {/* Leitura ao vivo do núcleo */}
        <dl
          ref={readout}
          aria-hidden="true"
          className="glass mono-label mt-12 hidden w-[300px] grid-cols-[96px_1fr] gap-y-2.5 rounded-2xl px-5 py-4 text-ash md:grid"
        >
          <dt>Sistema</dt>
          <dd className="text-bone">Estação BS-01</dd>
          <dt>Partículas</dt>
          <dd ref={countEl} className="text-bone tabular-nums">
            000.000
          </dd>
          <dt>Cursor</dt>
          <dd ref={xyEl} className="whitespace-pre text-bone tabular-nums">
            X +0.000  Y +0.000
          </dd>
          <dt>Estado</dt>
          <dd ref={stateEl} className="text-bone">
            Estável
          </dd>
          <dt>Render</dt>
          <dd ref={fpsEl} className="tabular-nums">
            60 fps
          </dd>
        </dl>

        {/* Leitura compacta do núcleo (celular) */}
        <div className="glass mono-label mt-8 grid grid-cols-3 rounded-2xl px-4 py-3 text-ash md:hidden" aria-hidden="true">
          <span className="flex flex-col gap-1">
            Partículas
            <span ref={countMobile} className="text-bone tabular-nums">
              000.000
            </span>
          </span>
          <span className="flex flex-col gap-1 border-l border-white/10 pl-3">
            Estado
            <span ref={stateMobile} className="text-bone">
              Estável
            </span>
          </span>
          <span className="flex flex-col gap-1 border-l border-white/10 pl-3">
            Toque
            <span className="text-bone">Arraste ←→</span>
          </span>
        </div>

        {/* Título + texto */}
        <div className="mt-auto grid gap-6 md:grid-cols-12 md:items-end md:gap-10">
          <h1
            id="hero-titulo"
            aria-label="Move negócios."
            className="min-w-0 text-[min(20vw,14svh)] leading-[0.86] font-medium tracking-[-0.05em] md:col-span-8 md:text-[clamp(64px,min(11vw,19vh),188px)] md:leading-[0.84]"
          >
            <span className="line-mask block">
              <span className="block" aria-hidden="true">
                <span ref={word1}>Move</span>
                <span ref={caret1} className="hero-caret logo-caret" style={{ display: "none" }} />
              </span>
            </span>
            <span className="line-mask block">
              <span className="block" aria-hidden="true">
                <span ref={word2}>negócios</span>
                {/* o cursor da marca no lugar do ponto final */}
                <span ref={caret2} className="hero-caret logo-caret" />
              </span>
            </span>
          </h1>

          <div ref={side} className="pointer-events-auto min-w-0 max-w-[390px] md:col-span-4 md:col-start-9 md:justify-self-end md:pb-3">
            <p className="mono-label text-carmim-light">[ Você traz o problema. A gente resolve. ]</p>
            <p className="mt-4 text-[16px] leading-[1.55] font-light text-bone/85 md:text-[17px]">
              A gente pensa a solução junto com você e constrói o software do seu negócio, do primeiro rascunho ao
              suporte depois do lançamento.
            </p>
            <div className="mt-7 flex items-center gap-5 md:mt-8">
              <Link href="/#contato" className="btn-glow flex-1 justify-center py-[17px] md:flex-none md:py-[14px]">
                Iniciar projeto <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/#trabalhos"
                className="mono-label shrink-0 text-ash underline decoration-white/20 underline-offset-[6px] md:hidden"
              >
                Ver trabalhos
              </Link>
            </div>
          </div>
        </div>

        {/* Rodapé do hero */}
        <div ref={footer} className="mono-label mt-10 hidden items-center justify-between border-t border-white/10 pt-5 text-ash md:flex">
          <span>(01) Início</span>
          <span className="flex items-center gap-3">
            Role para explorar
            <span className="relative h-px w-16 overflow-hidden bg-white/15" aria-hidden="true">
              <span className="scroll-cue absolute inset-y-0 left-0 w-1/3 bg-carmim-light" />
            </span>
          </span>
          <span>Passe o cursor pelas partículas</span>
        </div>
      </div>
    </section>
  );
}
