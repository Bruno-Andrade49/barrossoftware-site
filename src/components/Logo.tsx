import Link from "next/link";

/**
 * Marca: "barros|software" — o cursor do editor piscando entre as duas palavras,
 * como um nome de função esperando a próxima letra.
 */
export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center text-[19px] leading-none tracking-[-0.03em] [font-family:var(--font-display)]"
      aria-label="BarrosSoftware, página inicial"
    >
      <span className="font-bold">barros</span>
      <span
        aria-hidden="true"
        className="logo-caret mx-[0.08em] inline-block h-[0.82em] w-[0.08em] translate-y-[0.04em] bg-carmim"
      />
      <span className="font-light">software</span>
    </Link>
  );
}
