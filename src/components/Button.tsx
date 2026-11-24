import Link from "next/link";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  external?: boolean;
  className?: string;
};

/**
 * primary: pill carmim com brilho — no máximo um por tela.
 * ghost: rótulo mono com seta, sem contêiner.
 */
export function Button({ href, children, variant = "primary", external, className = "" }: Props) {
  const base =
    variant === "primary"
      ? "btn-glow"
      : "group mono-label inline-flex items-center gap-2 text-ash transition-colors duration-300 hover:text-bone";

  const content = (
    <>
      {children}
      <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
        →
      </span>
    </>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={`${base} ${className}`}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={`${base} ${className}`}>
      {content}
    </Link>
  );
}
