"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./Logo";
import { LocalClock } from "./LocalClock";
import { ScrambleLink } from "./ScrambleLink";
import { nav, site, whatsappUrl } from "@/content/site";
import { gsap, prefersReducedMotion } from "@/lib/motion";

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  // Depois do hero, a barra ganha fundo desfocado para não brigar com o conteúdo.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Menu do celular: abre num círculo a partir do botão; os itens sobem um a um
  useEffect(() => {
    const el = panel.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.set(el, { autoAlpha: 0 });
      const t = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
      // o círculo nasce no botão (a barra é fixa, então a posição dele não muda com o scroll)
      const b = button.current?.getBoundingClientRect();
      const x = b ? b.left + b.width / 2 : window.innerWidth - 40;
      const y = b ? b.top + b.height / 2 : 32;
      const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)) + 40;
      if (prefersReducedMotion()) {
        t.to(el, { autoAlpha: 1, duration: 0.2 });
      } else {
        t.set(el, { autoAlpha: 1 })
          .fromTo(
            el,
            { clipPath: `circle(0px at ${x}px ${y}px)` },
            { clipPath: `circle(${r}px at ${x}px ${y}px)`, duration: 0.9, ease: "expo.inOut" },
          )
          .from("[data-menu-item]", { yPercent: 110, duration: 0.9, stagger: 0.06 }, 0.35)
          .from("[data-menu-foot] > *", { y: 24, opacity: 0, duration: 0.8, stagger: 0.06 }, 0.55);
      }
      tl.current = t;
    }, el);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (open) {
      tl.current?.timeScale(1).play();
      root.dataset.menu = "open";
    } else {
      tl.current?.timeScale(1.8).reverse();
      delete root.dataset.menu;
    }
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-500 ${
        scrolled && !open ? "border-b border-white/10 bg-black/60 backdrop-blur-xl" : "border-b border-transparent"
      }`}
    >
      <div className="relative z-50 flex h-16 items-center justify-between px-4 md:h-[72px] md:px-8">
        <Logo />

        <nav aria-label="Principal" className="hidden items-center gap-10 md:flex">
          {nav.map((item) => (
            <ScrambleLink
              key={item.href}
              href={item.href}
              label={`+ ${item.label}`}
              className="mono-label text-ash transition-colors duration-300 hover:text-bone"
            />
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <ThemeToggle />
          <Link
            href="/#contato"
            className="mono-label hidden items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2.5 text-bone backdrop-blur-md transition-colors duration-300 hover:border-carmim-light/60 md:inline-flex"
          >
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-carmim-light opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-carmim-light" />
            </span>
            Iniciar projeto
          </Link>

          {/* Botão do menu (celular): pílula com rótulo, as duas linhas viram um X */}
          <button
            ref={button}
            type="button"
            className="mono-label flex h-10 items-center gap-3 rounded-full border border-white/15 bg-white/[0.04] pr-3.5 pl-4 text-bone backdrop-blur-md md:hidden"
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

      {/* Menu do celular: tela inteira, vidro escuro sobre as partículas */}
      <div
        ref={panel}
        id="menu-mobile"
        aria-hidden={!open}
        className="invisible fixed inset-0 z-40 flex flex-col justify-between bg-void/85 px-4 pt-24 pb-[calc(28px+env(safe-area-inset-bottom))] backdrop-blur-2xl md:hidden"
      >
        <nav aria-label="Menu" className="flex flex-col">
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
                <span className="flex-1 text-[clamp(36px,11vw,52px)] leading-none font-medium tracking-[-0.045em] [font-family:var(--font-display)]">
                  {item.label}
                </span>
                <span aria-hidden="true" className="text-ash transition-transform duration-300 group-active:translate-x-1">
                  →
                </span>
              </span>
            </Link>
          ))}
        </nav>

        <div data-menu-foot className="flex flex-col gap-5">
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
          <div className="mono-label flex items-center justify-between border-t border-white/10 pt-5 text-ash">
            <a href={`mailto:${site.contact.email}`} tabIndex={open ? 0 : -1} className="text-bone">
              {site.contact.email}
            </a>
            <span>
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
    </header>
  );
}
