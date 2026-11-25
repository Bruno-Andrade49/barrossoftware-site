"use client";

import { useIdleEffect } from "@/lib/useIdleEffect";
import { useRef, type RefObject } from "react";
import { gsap, prefersReducedMotion } from "@/lib/motion";

type Props = {
  as?: "div" | "ul" | "ol" | "section";
  className?: string;
  stagger?: number;
  children: React.ReactNode;
};

/** Os filhos diretos sobem e aparecem em sequência quando o bloco entra na tela. */
export function Reveal({ as: Tag = "div", className = "", stagger = 0.08, children }: Props) {
  const ref = useRef<HTMLElement>(null);

  useIdleEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from(el.children, {
        y: 48,
        opacity: 0,
        duration: 1.1,
        ease: "expo.out",
        stagger,
        scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" },
      });
    }, el);
    return () => ctx.revert();
  }, [stagger]);

  if (Tag === "ul") return <ul ref={ref as RefObject<HTMLUListElement>} className={className}>{children}</ul>;
  if (Tag === "ol") return <ol ref={ref as RefObject<HTMLOListElement>} className={className}>{children}</ol>;
  if (Tag === "section") return <section ref={ref} className={className}>{children}</section>;
  return <div ref={ref as RefObject<HTMLDivElement>} className={className}>{children}</div>;
}
