import Link from "next/link";

/** Marca provisória: um "B" fragmentado em dois triângulos, ecoando as partículas do hero. */
export function LogoMark({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M4 2 L18 9 L4 12 Z" fill="#C8102E" />
      <path d="M4 12 L20 15.5 L4 22 Z" fill="#C8102E" opacity="0.65" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="BarrosSoftware, página inicial">
      <LogoMark />
      <span className="text-[17px] font-semibold tracking-[-0.02em]">
        Barros<span className="font-extralight">Software</span>
      </span>
    </Link>
  );
}
