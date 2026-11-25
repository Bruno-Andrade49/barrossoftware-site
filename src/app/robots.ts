import type { MetadataRoute } from "next";
import { absolute, siteUrl } from "@/lib/seo";

// Buscadores e robôs de IA (busca, citação e treino) liberados de propósito: o site quer ser encontrado.
const AI_AND_SEARCH_BOTS = [
  "Googlebot",
  "Google-Extended",
  "Bingbot",
  "Applebot",
  "Applebot-Extended",
  "DuckDuckBot",
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "CCBot",
  "Meta-ExternalAgent",
  "Amazonbot",
  "DuckAssistBot",
  "MistralAI-User",
  "cohere-ai",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // o painel (CMS) fica fora de qualquer índice
      { userAgent: AI_AND_SEARCH_BOTS, allow: "/", disallow: "/painel" },
      { userAgent: "*", allow: "/", disallow: "/painel" },
    ],
    sitemap: absolute("/sitemap.xml"),
    host: siteUrl,
  };
}
