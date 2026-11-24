"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

gsap.registerPlugin(ScrambleTextPlugin);

type Props = {
  href: string;
  label: string;
  className?: string;
  onClick?: () => void;
};

/** Link mono que embaralha as letras no hover (estilo terminal). */
export function ScrambleLink({ href, label, className = "", onClick }: Props) {
  const textRef = useRef<HTMLSpanElement>(null);

  const scramble = () => {
    if (!textRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.to(textRef.current, {
      duration: 0.6,
      scrambleText: { text: label, chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>{}", speed: 0.6 },
      overwrite: true,
    });
  };

  return (
    <Link href={href} onMouseEnter={scramble} onFocus={scramble} onClick={onClick} className={className}>
      <span ref={textRef}>{label}</span>
    </Link>
  );
}
