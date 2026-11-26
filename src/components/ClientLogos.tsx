import { clients } from "@/content/site";

/** Faixa "Quem já confiou": logos dos clientes em tom único, acendem ao passar o mouse. Some com menos de dois. */
export function ClientLogos() {
  if (clients.length < 2) return null;

  return (
    <section aria-label="Clientes" className="border-y border-white/10 px-4 py-12 md:px-8 md:py-16">
      <p className="mono-label text-center text-ash">Quem já confiou na BarrosSoftware</p>
      <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-8 md:gap-x-20">
        {clients.map((c) => (
          <li key={c.name}>
            {/* eslint-disable-next-line @next/next/no-img-element -- logo leve (SVG), tamanho definido pela altura */}
            <img
              src={c.logo}
              alt={c.name}
              loading="lazy"
              decoding="async"
              className="h-8 w-auto opacity-60 brightness-0 invert transition [:root[data-theme=light]_&]:invert-0 duration-500 hover:opacity-100 md:h-10"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
