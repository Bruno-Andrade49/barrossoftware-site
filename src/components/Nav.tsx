"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./Logo";
import { LocalClock } from "./LocalClock";
import { ScrambleLink } from "./ScrambleLink";
import { nav, site, whatsappUrl } from "@/content/site";
import { gsap, prefersReducedMotion } from "@/lib/motion";

/**
 * Cabeçalho flutuante: uma pílula de vidro líquido solta das bordas, sempre presente na tela. No celular, o botão "Menu" abre o menu em tela cheia; com ele aberto, a
 * pílula perde o vidro e se funde ao menu (só ficam a marca e o "Fechar").
 *
 * O menu fica FORA do <header> de propósito: o header usa backdrop-filter (vidro), e um elemento
 * fixo dentro de um ancestral com backdrop-filter passa a se posicionar em relação a ele. Era isso
 * que fazia o menu antigo encolher para a altura da barra ao fechar, deixando as letras soltas sobre o site.
 */
export function Nav() {
  const [open, setOpen] = useState(false);
  const drawer = useRef<HTMLDivElement>(null);
  const fading = useRef<gsap.core.Tween | null>(null);
  const toggleBtn = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  const tl = useRef<gsap.core.Timeline | null>(null);

  // Menu do celular em tela cheia: o fundo sólido aparece de uma vez e os itens sobem em seguida.
  // Ao fechar, a camada inteira (fundo + texto) esmaece junta.
  useEffect(() => {
    const el = drawer.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.set(el, { autoAlpha: 0 });
      const quick = prefersReducedMotion();
      const t = gsap.timeline({ paused: true });
      t.to(el, { autoAlpha: 1, duration: quick ? 0.01 : 0.35, ease: "power2.out" });
      if (!quick) {
        t.from("[data-menu-item]", { yPercent: 110, duration: 0.8, stagger: 0.06, ease: "expo.out" }, 0.1).from(
          "[data-menu-foot] > *",
          { y: 18, opacity: 0, duration: 0.6, stagger: 0.05, ease: "expo.out" },
          0.3,
        );
      }
      tl.current = t;
    });
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (open) {
      fading.current?.kill(); // reabriu no meio do fechamento
      tl.current?.restart();
      root.dataset.menu = "open";
    } else {
      // fecha esmaecendo a camada inteira de uma vez (fundo e texto juntos, nada some antes)
      if (tl.current && tl.current.progress() > 0 && drawer.current) {
        fading.current = gsap.to(drawer.current, {
          autoAlpha: 0,
          duration: 0.3,
          ease: "power2.out",
          onComplete: () => {
            tl.current?.pause(0);
            // garante a camada escondida de fato (invisível + sem capturar toques)
            if (drawer.current) gsap.set(drawer.current, { autoAlpha: 0 });
          },
        });
      }
      delete root.dataset.menu;
    }
    document.body.style.overflow = open ? "hidden" : "";
    // acessibilidade: com o menu aberto, conteúdo e rodapé ficam inertes (o foco não escapa para trás);
    // o foco entra no primeiro item e, ao fechar, volta para o botão
    for (const id of ["conteudo", "rodape"]) {
      const el = document.getElementById(id);
      if (el) el.inert = open;
    }
    if (open) {
      window.setTimeout(() => drawer.current?.querySelector<HTMLElement>("a")?.focus(), 60);
    } else if (wasOpen.current) {
      toggleBtn.current?.focus();
    }
    wasOpen.current = open;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <header
        className="fixed inset-x-3 top-3 z-50 md:inset-x-6 md:top-4"
      >
        <div
          className={`mx-auto flex h-14 max-w-[1280px] items-center justify-between rounded-full pr-2 pl-5 transition-[background-color,box-shadow] duration-300 md:h-[60px] md:pl-6 ${
            open ? "bg-transparent" : "glass glass-refract"
          }`}
        >
          <Logo />

          <nav aria-label="Principal" className="hidden items-center gap-9 md:flex">
            {nav.map((item) => (
              <ScrambleLink
                key={item.href}
                href={item.href}
                label={`+ ${item.label}`}
                className="mono-label text-ash transition-colors duration-300 hover:text-bone"
              />
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/#contato"
              className="glass-chip mono-label hidden items-center gap-2 rounded-full px-4 py-2.5 text-bone transition-colors duration-300 hover:text-carmim-light md:inline-flex"
            >
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-carmim-light opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-carmim-light" />
              </span>
              Iniciar projeto
            </Link>

            {/* Botão do menu (celular): as duas linhas viram um X */}
            <button
              ref={toggleBtn}
              type="button"
              className="glass-chip mono-label flex h-10 items-center gap-3 rounded-full pr-3.5 pl-4 text-bone md:hidden"
              aria-expanded={open}
              aria-controls="menu-mobile"
              aria-label={open ? "Fechar menu" : "Abrir menu"}
              onClick={() => setOpen((v) => !v)}
            >
              <span aria-hidden="true">{open ? "Fechar" : "Menu"}</span>
              <span aria-hidden="true" className="relative block h-2.5 w-4">
                <span
                  className={`absolute left-0 h-px w-4 bg-bone transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] ${open ? "top-[5px] rotate-45" : "top-0"}`}
                />
                <span
                  className={`absolute left-0 h-px w-4 bg-bone transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] ${open ? "top-[5px] -rotate-45" : "top-2.5"}`}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Menu do celular: tela inteira, fundo sólido (fora do header: o backdrop-filter do header
          reposicionaria este elemento fixo e quebraria o fechamento) */}
      <div
        ref={drawer}
        id="menu-mobile"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        aria-hidden={!open}
        className="invisible fixed inset-0 z-40 flex flex-col justify-between bg-void px-6 pt-28 pb-[calc(28px+env(safe-area-inset-bottom))] md:hidden"
      >
        {/* brilho carmim discreto no canto, para a gaveta não ser só um bloco chapado */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_45%_at_100%_100%,rgb(200_16_46/0.2),transparent_70%),radial-gradient(60%_35%_at_0%_0%,rgb(200_16_46/0.08),transparent_70%)]"
        />
        <nav aria-label="Menu" className="relative flex flex-col">
          {nav.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              tabIndex={open ? 0 : -1}
              className="group block overflow-hidden border-b border-white/10"
            >
              <span data-menu-item className="flex items-center gap-4 py-5">
                <span className="mono-label w-6 text-carmim-light">0{i + 1}</span>
                <span className="flex-1 text-[clamp(38px,11vw,52px)] leading-none font-medium tracking-[-0.045em] [font-family:var(--font-display)]">
                  {item.label}
                </span>
                <span aria-hidden="true" className="text-ash transition-transform duration-300 group-active:translate-x-1">
                  →
                </span>
              </span>
            </Link>
          ))}
        </nav>

        <div data-menu-foot className="relative flex flex-col gap-5">
          <p className="mono-label text-ash">Tem um projeto em mente?</p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={open ? 0 : -1}
            className="btn-glow justify-center py-[18px]"
          >
            Chamar no WhatsApp <span aria-hidden="true">→</span>
          </a>
          <div className="mono-label flex items-center justify-between gap-3 border-t border-white/10 pt-5 text-ash">
            <a href={`mailto:${site.contact.email}`} tabIndex={open ? 0 : -1} className="truncate text-bone">
              {site.contact.email}
            </a>
            <span className="shrink-0">
              PB <LocalClock />
            </span>
          </div>
          <div className="mono-label flex gap-5 text-ash">
            {site.social.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" tabIndex={open ? 0 : -1}>
                {s.label} ↗
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
