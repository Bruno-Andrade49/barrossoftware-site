import type { ReactNode } from "react";

type Props = {
  n: string;
  label: string;
  desc: string;
  /** linha fina até o fim da largura (some quando centralizado) */
  rule?: boolean;
  center?: boolean;
  /** algo à direita da linha, ex.: "sys://barros" */
  extra?: ReactNode;
  className?: string;
};

/**
 * Rótulo de seção no padrão da seção 02: número e nome em carmim e, logo abaixo, uma descrição curta.
 */
export function SectionLabel({ n, label, desc, rule = true, center = false, extra, className = "" }: Props) {
  return (
    <div className={`mono-label flex flex-col gap-2 ${center ? "items-center text-center" : ""} ${className}`}>
      <span className="flex w-full items-center gap-4 text-carmim-light">
        <span className={center ? "mx-auto" : ""}>
          ({n}) {label}
        </span>
        {rule && !center && <span className="h-px flex-1 bg-white/10" aria-hidden="true" />}
        {extra && <span className="hidden text-ash sm:inline">{extra}</span>}
      </span>
      <span className="max-w-[320px] text-ash">{desc}</span>
    </div>
  );
}
