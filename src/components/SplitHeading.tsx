"use client";

import { useIdleEffect } from "@/lib/useIdleEffect";
import { useRef } from "react";
import { gsap, prefersReducedMotion, splitHeading, type SplitText } from "@/lib/motion";

type Props = {
  as?: "h1" | "h2" | "h3";
  id?: string;
  className?: string;
  children: React.ReactNode;
};

/** Título display que sobe letra a letra quando entra na tela. Use <em> para a palavra carmim. */
export function SplitHeading({ as: Tag = "h2", id, className = "", children }: Props) {
  const ref = useRef<HTMLHeadingElement>(null);

  useIdleEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    let split: SplitText | null = null;
    let ctx: gsap.Context | null = null;
    let cancelled = false;

    document.fonts.ready.then(() => {
      if (cancelled) return;
      ctx = gsap.context(() => {
        split = splitHeading(el);
        gsap.from(split.chars, {
          yPercent: 115,
          duration: 1.2,
          ease: "expo.out",
          stagger: 0.022,
          scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" },
        });
      }, el);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
      split?.revert();
    };
  }, []);

  return (
    <Tag ref={ref} id={id} className={`display split-heading ${className}`}>
      {children}
    </Tag>
  );
}
