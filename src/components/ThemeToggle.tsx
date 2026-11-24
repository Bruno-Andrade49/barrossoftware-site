"use client";

import { useSyncExternalStore, type MouseEvent } from "react";

const subscribe = (cb: () => void) => {
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => obs.disconnect();
};
const isLight = () => document.documentElement.dataset.theme === "light";

/**
 * Alterna claro/escuro. A troca abre um círculo a partir do botão (View Transitions);
 * sem suporte ou com movimento reduzido, as cores mudam suavemente.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const light = useSyncExternalStore(subscribe, isLight, () => false);

  const toggle = (e: MouseEvent<HTMLButtonElement>) => {
    const root = document.documentElement;
    const next = !isLight();
    const apply = () => {
      if (next) root.dataset.theme = "light";
      else delete root.dataset.theme;
      try {
        localStorage.setItem("theme", next ? "light" : "dark");
      } catch {}
    };

    const r = e.currentTarget.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    root.style.setProperty("--tx", `${x}px`);
    root.style.setProperty("--ty", `${y}px`);
    root.style.setProperty("--tr", `${Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))}px`);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (document.startViewTransition && !reduced) {
      document.startViewTransition(apply);
    } else {
      root.classList.add("theme-fade");
      apply();
      window.setTimeout(() => root.classList.remove("theme-fade"), 700);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={light ? "Mudar para o modo escuro" : "Mudar para o modo claro"}
      aria-pressed={light}
      className={`grid size-10 place-items-center rounded-full border border-white/15 text-bone transition-colors duration-300 hover:border-carmim-light/60 ${className}`}
    >
      <svg
        viewBox="0 0 20 20"
        className={`size-[18px] transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] ${light ? "rotate-180" : ""}`}
        aria-hidden="true"
      >
        <circle cx="10" cy="10" r="7.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 2.75a7.25 7.25 0 0 1 0 14.5Z" fill="currentColor" />
      </svg>
    </button>
  );
}
