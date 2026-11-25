import Link from "next/link";
import { business, nav, site } from "@/content/site";

export function Footer() {
  const year = new Date().getFullYear();
  const a = business.address;
  // NAP igual ao do Perfil da Empresa no Google (mesmos dados do JSON-LD)
  const street = [a.street, a.district].filter(Boolean).join(", ");
  const city = a.city ? `${a.city} — ${a.region}${a.postalCode ? `, ${a.postalCode}` : ""}` : "Paraíba, Brasil";

  return (
    <footer id="rodape" className="relative overflow-hidden border-t border-white/10 px-4 pt-16 pb-10 md:px-8">
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

      <div className="mono-label mt-16 flex flex-col justify-between gap-3 text-ash md:flex-row md:items-center">
        <span>
          © {year} {business.name}. Todos os direitos reservados.
          {business.cnpj && <> · CNPJ {business.cnpj}</>}
        </span>
        <span className="flex gap-6">
          <Link href="/privacidade" className="transition-colors hover:text-bone">
            Política de privacidade
          </Link>
          <span>Feito à mão, do zero.</span>
        </span>
      </div>

      {/* Marca gigante em texto sólido (metálico, como os outros títulos grandes), com o cursor da marca */}
      <p
        aria-hidden="true"
        className="display pointer-events-none mt-10 text-center font-sans tracking-[-0.055em] text-[19vw] leading-[0.9] select-none"
      >
        {/* inline-block: o preenchimento vertical não invade os links de cima, e o pr cobre a curva do S */}
        <span className="fill-chrome inline-block pr-[0.05em]">BARROS</span>
        <span className="hero-caret logo-caret" />
      </p>
    </footer>
  );
}
