import Link from "next/link";
import { business, nav, site } from "@/content/site";

export function Footer() {
  const year = new Date().getFullYear();
  const a = business.address;
  // NAP igual ao do Perfil da Empresa no Google (mesmos dados do JSON-LD)
  const street = [a.street, a.district].filter(Boolean).join(", ");
  const city = a.city ? `${a.city} — ${a.region}${a.postalCode ? `, ${a.postalCode}` : ""}` : "Paraíba, Brasil";

  return (
    <footer id="rodape" data-form="word" className="relative overflow-hidden border-t border-white/10 px-4 pt-16 pb-10 md:px-8">
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 md:gap-12">
        <address className="mono-label col-span-2 flex flex-col gap-2 text-ash not-italic md:col-span-1">
          <span className="text-bone">{business.name}</span>
          <span>Empresa de software</span>
          {street && <span>{street}</span>}
          <span>{city}</span>
          {business.phone && (
            <a href={`tel:${business.phone.replace(/[^\d+]/g, "")}`} className="transition-colors hover:text-bone">
              {business.phone}
            </a>
          )}
        </address>

        <nav aria-label="Rodapé" className="mono-label flex flex-col gap-3">
          <span className="text-carmim-light">Navegar</span>
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="text-ash transition-colors hover:text-bone">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mono-label flex flex-col gap-3">
          <span className="text-carmim-light">Redes</span>
          {site.social.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ash transition-colors hover:text-bone"
            >
              {s.label} ↗
            </a>
          ))}
        </div>

        <div className="mono-label col-span-2 flex flex-col gap-3 md:col-span-1 md:items-end">
          <span className="text-carmim-light">Contato</span>
          <a href={`mailto:${site.contact.email}`} className="text-ash transition-colors hover:text-bone">
            {site.contact.email}
          </a>
          <a href="#conteudo" className="mt-4 text-bone transition-colors hover:text-carmim-light">
            Voltar ao topo ↑
          </a>
        </div>
      </div>

      <div className="mono-label mt-16 flex flex-col justify-between gap-2 text-ash md:flex-row">
        <span>© {year} BarrosSoftware. Todos os direitos reservados.</span>
        <span>Feito à mão, do zero.</span>
      </div>

      {/* Marca gigante: o texto fica invisível e reserva o espaço; as partículas desenham o BARROS por cima */}
      <p
        data-anchor
        data-word="BARROS"
        aria-hidden="true"
        className="display mt-10 text-center font-sans tracking-[-0.055em] text-[25vw] leading-[0.9] md:text-[19vw] text-transparent select-none"
      >
        BARROS
      </p>
    </footer>
  );
}
