import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

export { gsap, ScrollTrigger, SplitText };

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Quebra um título .display em letras mascaradas e passa o degradê para cada letra.
 * Letras dentro de <em> ficam carmim; o resto, metálico.
 * O elemento deve ter a classe .split-heading.
 */
export function splitHeading(el: HTMLElement) {
  const split = new SplitText(el, {
    type: "lines,words,chars",
    linesClass: "split-line",
    charsClass: "split-char",
    mask: "lines",
  });
  el.querySelectorAll<HTMLElement>(".fill-chrome, .fill-carmim").forEach((node) => {
    if (!node.classList.contains("split-char")) node.classList.remove("fill-chrome", "fill-carmim");
  });
  split.chars.forEach((c) => {
    const char = c as HTMLElement;
    char.classList.add(char.closest("em") ? "fill-carmim" : "fill-chrome");
  });
  return split;
}
