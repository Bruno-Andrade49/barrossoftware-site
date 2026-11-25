"use client";

import { useEffect } from "react";

/**
 * Vidro líquido: o filtro SVG que distorce (refrata) o que está atrás das superfícies de vidro,
 * e o brilho especular que acompanha o ponteiro.
 *
 * - A refração usa `backdrop-filter: url(#liquid-glass)`, que só o Chromium (Chrome, Edge, Opera,
 *   Samsung Internet) desenha. Por isso a classe `has-liquid` só entra no <html> nesses navegadores;
 *   nos outros o vidro continua com desfoque e reflexos, só sem a distorção.
 * - O brilho: as variáveis --gx/--gy (posição do ponteiro em %) movem o reflexo de cada `.glass`.
 */
export function LiquidGlass() {
  useEffect(() => {
    const root = document.documentElement;
    const brands = (navigator as Navigator & { userAgentData?: { brands: { brand: string }[] } }).userAgentData?.brands;
    const chromium = brands?.some((b) => /Chromium/i.test(b.brand)) ?? false;
    if (chromium) root.classList.add("has-liquid");

    if (!window.matchMedia("(hover: hover)").matches) return;
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        root.style.setProperty("--gx", `${((e.clientX / window.innerWidth) * 100).toFixed(1)}%`);
        root.style.setProperty("--gy", `${((e.clientY / window.innerHeight) * 100).toFixed(1)}%`);
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <svg aria-hidden="true" width="0" height="0" className="pointer-events-none absolute">
      <filter id="liquid-glass" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
        {/* ruído suave e lento: a "água" que entorta o fundo */}
        <feTurbulence type="fractalNoise" baseFrequency="0.008 0.012" numOctaves="2" seed="7" result="noise" />
        <feGaussianBlur in="noise" stdDeviation="2" result="soft" />
        <feDisplacementMap in="SourceGraphic" in2="soft" scale="38" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}
