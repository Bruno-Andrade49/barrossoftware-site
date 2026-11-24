const ITEMS = ["Sistemas web", "Apps mobile", "Sites", "Automação", "Inteligência artificial", "Integrações"];

function Row({ reverse = false, outline = false }: { reverse?: boolean; outline?: boolean }) {
  // Lista duplicada para o loop não ter emenda.
  const list = [...ITEMS, ...ITEMS];
  return (
    <div className={`marquee-track ${reverse ? "reverse" : ""}`}>
      {list.map((item, i) => (
        <span key={i} className="flex items-center">
          <span className={`display px-6 text-[clamp(48px,7vw,120px)] md:px-10 ${outline ? "outline-text" : "fill-chrome"}`}>
            {item}
          </span>
          <svg viewBox="0 0 24 24" className="size-6 shrink-0 md:size-10" aria-hidden="true">
            <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" fill="#C8102E" />
          </svg>
        </span>
      ))}
    </div>
  );
}

/** Duas faixas infinitas em sentidos opostos, uma cheia e uma vazada. */
export function Marquee() {
  return (
    <section aria-label="O que fazemos" className="relative overflow-hidden border-y border-white/10 py-8 md:py-12">
      <p className="sr-only">{ITEMS.join(", ")}</p>
      <div aria-hidden="true" className="flex flex-col gap-2 md:gap-4">
        <Row />
        <Row reverse outline />
      </div>
    </section>
  );
}
