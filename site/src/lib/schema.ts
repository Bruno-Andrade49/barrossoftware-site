import { cases, type Case } from "@/content/cases";
import { business, faq, sameAs, services, site } from "@/content/site";
import { absolute } from "@/lib/seo";

// Identificadores fixos: as entidades se referenciam entre si (@id) em vez de se repetir.
const ORG = absolute("/#empresa");
const WEBSITE = absolute("/#site");

const address = () => {
  const a = business.address;
  if (!a.city) return undefined; // sem cidade cadastrada, o endereço fica de fora (igual ao rodapé)
  return {
    "@type": "PostalAddress",
    ...(a.street && { streetAddress: a.street }),
    ...(a.district && { addressNeighborhood: a.district }),
    addressLocality: a.city,
    addressRegion: a.region,
    ...(a.postalCode && { postalCode: a.postalCode }),
    addressCountry: a.country,
  };
};

/** A empresa: ProfessionalService é um tipo de LocalBusiness (e de Organization). */
export const organization = () => ({
  "@type": "ProfessionalService",
  "@id": ORG,
  name: business.name,
  url: absolute("/"),
  logo: absolute("/icon.svg"),
  image: absolute("/opengraph-image.jpg"),
  description:
    "Estúdio de software que cria sistemas web, aplicativos, sites e automações com inteligência artificial sob medida para empresas.",
  email: site.contact.email,
  ...(business.phone && { telephone: business.phone }),
  ...(address() && { address: address() }),
  areaServed: { "@type": "Country", name: "Brasil" },
  knowsAbout: services.map((s) => s.title),
  ...(sameAs.length > 0 && { sameAs }),
  makesOffer: services.map((s) => ({ "@type": "Offer", itemOffered: { "@id": absolute(`/#servico-${s.number}`) } })),
});

const serviceList = () =>
  services.map((s) => ({
    "@type": "Service",
    "@id": absolute(`/#servico-${s.number}`),
    name: s.title,
    description: s.text,
    serviceType: s.title,
    provider: { "@id": ORG },
    areaServed: { "@type": "Country", name: "Brasil" },
  }));

const breadcrumb = (items: { name: string; path: string }[]) => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: it.name,
    item: absolute(it.path),
  })),
});

/** Home: empresa, site, serviços, perguntas frequentes, trabalhos e trilha de navegação. */
export const homeSchema = () => ({
  "@context": "https://schema.org",
  "@graph": [
    organization(),
    { "@type": "WebSite", "@id": WEBSITE, url: absolute("/"), name: business.name, inLanguage: "pt-BR", publisher: { "@id": ORG } },
    ...serviceList(),
    {
      "@type": "FAQPage",
      "@id": absolute("/#perguntas"),
      mainEntity: faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@type": "ItemList",
      name: "Trabalhos recentes",
      itemListElement: cases.map((c, i) => ({ "@type": "ListItem", position: i + 1, url: absolute(`/trabalhos/${c.slug}`), name: c.name })),
    },
    breadcrumb([{ name: "Início", path: "/" }]),
  ],
});

/** Página de case: o projeto (CreativeWork) e a trilha Início › Trabalhos › Projeto. */
export const caseSchema = (c: Case) => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CreativeWork",
      "@id": absolute(`/trabalhos/${c.slug}#projeto`),
      name: c.name,
      description: c.description,
      url: absolute(`/trabalhos/${c.slug}`),
      genre: c.type,
      dateCreated: c.year,
      inLanguage: "pt-BR",
      creator: { "@id": ORG },
      image: c.gallery.map((g) => absolute(g.src)),
      ...(c.url && { sameAs: c.url }),
    },
    organization(),
    breadcrumb([
      { name: "Início", path: "/" },
      { name: "Trabalhos", path: "/#trabalhos" },
      { name: c.name, path: `/trabalhos/${c.slug}` },
    ]),
  ],
});
