// Trabalhos exibidos no site. Confirme a autorização de cada cliente antes de publicar.

export type Case = {
  slug: string;
  name: string;
  client: string;
  type: string;
  year: string;
  summary: string;
  /** Descrição curta exibida ao lado do vídeo na home. */
  description: string;
  challenge: string;
  solution: string;
  stack: string[];
  results: string[];
  /** Gravações do site (computador e celular) em /public/videos; a capa .jpg tem o mesmo nome. */
  video: { desktop: string; mobile: string };
  /** Proporção de cada gravação (largura / altura), para a moldura não cortar nem esticar. */
  aspect: { desktop: string; mobile: string };
  /** Capa do vídeo do computador em JPG, só para compartilhamento (Open Graph): nem todo app lê WebP. */
  cover: string;
  /** Endereço do site no ar (botão "Ver o site no ar"). */
  url?: string;
  /** Telas principais (capturas das gravações em /public/images/projetos), com legenda curta. */
  gallery: { src: string; caption: string }[];
};

/** Texto ainda não preenchido: fica de fora da página até alguém escrever. */
export const isFilled = (text: string) => !text.trim().startsWith("PREENCHER");

const shots = (slug: string, captions: string[]) =>
  captions.map((caption, i) => ({ src: `/images/projetos/${slug}-${i + 1}.webp`, caption }));

// Gravações: computador 1600×912; celular 540×1150, só a tela (a moldura do aparelho é desenhada no CSS)
const media = (name: string, aspect = { desktop: "1600 / 912", mobile: "540 / 1150" }) => ({
  video: { desktop: `/videos/${name}-desktop.mp4`, mobile: `/videos/${name}-mobile.mp4` },
  cover: `/videos/${name}-desktop.jpg`,
  aspect,
});

export const cases: Case[] = [
  {
    slug: "geoparque-cariri",
    name: "Geoparque Cariri",
    client: "Geoparque Mundial UNESCO Cariri",
    type: "Portal institucional",
    year: "2026",
    summary: "Portal do primeiro geoparque das Américas reconhecido pela UNESCO.",
    description:
      "Portal do primeiro geoparque das Américas reconhecido pela UNESCO. Reunimos geossítios, roteiros e conteúdo educativo num site rápido, acessível e que a própria equipe atualiza.",
    challenge:
      "Reunir geossítios, roteiros e conteúdo educativo num portal rápido, acessível e fácil de atualizar pela equipe.",
    solution:
      "Site estático com conteúdo organizado por geossítio, páginas otimizadas para busca e foco em acessibilidade.",
    stack: ["Astro", "TypeScript", "Playwright", "Vercel"],
    results: ["Lighthouse acima de 90", "Conteúdo editável pela equipe"], // PREENCHER com números reais
    ...media("geoparque"),
    url: "https://geoparque-cariri.vercel.app",
    gallery: shots("geoparque-cariri", [
      "Geossítios em cards, com foto e município",
      "Página de geossítio com a paisagem em destaque",
      "Os quatro municípios do território",
      "Acervo de imagens do território",
    ]),
  },
  {
    slug: "conecta",
    name: "Conecta",
    client: "Conecta", // PREENCHER nome oficial do cliente
    type: "Site institucional",
    year: "2026",
    summary: "Site da produtora Conecta: vídeo, design, fotografia e cobertura de eventos.",
    description:
      "Site da Conecta, produtora de vídeo, design, fotografia e cobertura de eventos.", // PREENCHER: o que o site resolveu para a Conecta
    challenge: "PREENCHER: o problema que o cliente trouxe.",
    // REVISAR: descrito a partir da gravação do site
    solution:
      "Site institucional com a equipe, os serviços, um espaço para o trabalho em vídeo, as comunidades que a produtora acompanha e um formulário de contato.",
    stack: ["Vercel"], // PREENCHER
    results: ["PREENCHER"],
    ...media("conecta"),
    url: "https://conecta-one-zeta.vercel.app",
    gallery: shots("conecta", [
      "Quem somos, com a equipe",
      "Seção sobre vídeo, com o feed da produtora",
      "Os serviços da Conecta",
      "Comunidades que a produtora acompanha",
    ]),
  },
  {
    slug: "malu-cookies",
    name: "Malu Cookies",
    client: "Malu Cookies",
    type: "Loja online",
    year: "2026",
    summary: "Loja de cookies artesanais com pedido direto pelo WhatsApp.",
    description:
      "Loja de cookies artesanais com pedido direto pelo WhatsApp. O carrinho monta o pedido, e a dona atualiza produtos e preços num painel próprio.",
    challenge: "Vender online sem taxa de marketplace e sem complicar a rotina de quem produz.",
    solution:
      "Catálogo com carrinho que monta o pedido e envia pelo WhatsApp, mais um painel para a dona atualizar produtos e preços.",
    stack: ["Next.js", "Supabase", "Tailwind"],
    results: ["Pedidos organizados no WhatsApp", "Painel próprio de produtos"], // PREENCHER
    ...media("malu"),
    url: "https://malu-cookies-psi.vercel.app",
    gallery: shots("malu-cookies", [
      "Página inicial com o cardápio logo abaixo",
      "Página do produto, com quantidade e preço",
      "Carrinho lateral que monta o pedido",
      "Como funciona: escolher, receber e finalizar no WhatsApp",
    ]),
  },
];

export const getCase = (slug: string) => cases.find((c) => c.slug === slug);
