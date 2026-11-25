// Dados do site num lugar só. Troque os PREENCHER antes de publicar.

/**
 * NAP (nome, endereço, telefone) da empresa. Precisa ser IDÊNTICO ao do Perfil da Empresa no Google
 * (Google Meu Negócio): mesma grafia, mesmo formato de telefone. Aparece no rodapé e no JSON-LD.
 * Campos vazios ficam de fora dos dois.
 */
type Business = {
  name: string;
  cnpj: string;
  domain: string;
  phone: string;
  address: { street: string; district: string; city: string; region: string; postalCode: string; country: string };
  mapsUrl: string;
};

export const business: Business = {
  name: "BarrosSoftware", // PREENCHER: nome exatamente como no Google
  cnpj: "", // PREENCHER: ex.: "00.000.000/0001-00" (aparece no rodapé e na política de privacidade)
  /** Domínio oficial, sem barra no fim. Também é o destino do redirecionamento 301 do www. */
  domain: "https://barrossoftware.com.br", // PREENCHER
  phone: "+55 83 98212-1351", // igual ao perfil do Google, quando existir
  address: {
    street: "", // PREENCHER (deixe vazio se o perfil esconde o endereço)
    district: "",
    city: "", // PREENCHER: ex.: "João Pessoa"
    region: "PB",
    postalCode: "",
    country: "BR",
  },
  /** Link do perfil no Google Maps (fica no sameAs do JSON-LD). */
  mapsUrl: "", // PREENCHER
};

export const site = {
  name: business.name,
  tagline: "Empresa de software · Brasil",
  contact: {
    email: "contato@barrossoftware.com.br", // PREENCHER
    whatsapp: "5583982121351", // DDI + DDD + número, só dígitos
  },
  social: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/bruno-andrade-386b331b6/" },
    { label: "GitHub", href: "https://github.com/Bruno-Andrade49" },
    { label: "Instagram", href: "https://www.instagram.com/brunoandradee__/" },
  ],
} as const;

/** Perfis oficiais para o sameAs (ignora os links genéricos que ainda não foram preenchidos). */
export const sameAs = [...site.social.map((s): string => s.href), business.mapsUrl].filter(
  (href) => href && new URL(href).pathname.replace(/\/$/, "") !== "",
);

export const whatsappUrl = `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(
  "Olá! Vim pelo site e quero conversar sobre um projeto.",
)}`;

export const nav = [
  { label: "Serviços", href: "/#servicos" },
  { label: "Trabalhos", href: "/#trabalhos" },
  { label: "Processo", href: "/#processo" },
  { label: "Sobre", href: "/#sobre-estudio" },
] as const;

export const services = [
  {
    number: "01",
    title: "Sistemas web sob medida",
    text: "Painéis, plataformas e sistemas internos desenhados em cima do jeito que a sua empresa trabalha. Nada de adaptar o negócio a uma planilha ou a um software de prateleira.",
    tags: ["Next.js", "APIs", "Banco de dados", "Painel admin"],
  },
  {
    number: "02",
    title: "Apps mobile",
    text: "Aplicativos para Android e iOS com uma base de código, publicados nas lojas e conectados ao seu sistema.",
    tags: ["React Native", "Android", "iOS"],
  },
  {
    number: "03",
    title: "Sites e landing pages",
    text: "Sites rápidos, bem posicionados no Google e feitos para transformar visita em contato.",
    tags: ["SEO", "Performance", "Design"],
  },
  {
    number: "04",
    title: "Automação e IA",
    text: "Integrações entre sistemas, robôs que tiram tarefas repetitivas da sua equipe e assistentes com IA treinados no seu negócio.",
    tags: ["Integrações", "WhatsApp", "IA"],
  },
] as const;

export const process = [
  { number: "01", title: "Descoberta", text: "Entendemos o problema, quem usa e o que precisa dar certo. Sai daqui um escopo claro, com prazo e preço." },
  { number: "02", title: "Design", text: "Protótipo navegável antes de qualquer linha de código. Você aprova as telas, nós ajustamos." },
  { number: "03", title: "Desenvolvimento", text: "Entregas semanais que você testa de verdade, num link próprio, enquanto o projeto avança." },
  { number: "04", title: "Entrega e suporte", text: "Publicação, treinamento da equipe e acompanhamento depois do lançamento." },
] as const;

/** Perguntas frequentes: aparecem na home e no JSON-LD FAQPage (o texto precisa ser o mesmo nos dois). */
export const faq = [
  {
    q: "Quanto custa um projeto?",
    a: "Depende do tamanho e do que o software precisa fazer. Depois da primeira conversa, você recebe um escopo com prazo e preço fechados, antes de qualquer linha de código.",
  },
  {
    q: "Quanto tempo leva para ficar pronto?",
    a: "O prazo de cada projeto é definido no escopo. Toda semana você recebe uma entrega para testar num link próprio, então acompanha o andamento do começo ao fim.",
  },
  {
    q: "O código e o sistema ficam comigo?",
    a: "Sim. O software é feito sob medida para o seu negócio e é seu.",
  },
  {
    q: "Vocês atendem fora da Paraíba?",
    a: "Sim. A empresa fica na Paraíba e atende empresas de todo o Brasil, de forma remota.",
  },
  {
    q: "Tem suporte depois do lançamento?",
    a: "Sim. A última etapa inclui a publicação, o treinamento da equipe e o acompanhamento depois do lançamento.",
  },
  {
    q: "Que tipo de software vocês fazem?",
    a: "Sistemas web sob medida, aplicativos para Android e iOS, sites e landing pages, e automações com integrações e inteligência artificial.",
  },
  {
    q: "Como eu começo?",
    a: "Chame no WhatsApp ou mande um e-mail contando o que você precisa. A resposta chega em até um dia útil, com os próximos passos.",
  },
] as const;
