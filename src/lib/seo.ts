import { business } from "@/content/site";

/**
 * Endereço público do site. Ordem: variável NEXT_PUBLIC_SITE_URL → domínio de produção da Vercel
 * → domínio oficial cadastrado em content/site.ts. Sempre sem barra no fim.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : business.domain)
).replace(/\/$/, "");

/** URL absoluta a partir de um caminho ("/trabalhos/x" → "https://dominio/trabalhos/x"). */
export const absolute = (path = "/") => `${siteUrl}${path === "/" ? "" : path}`;

/** Corta um texto no limite de caracteres sem quebrar palavra (para meta description). */
export function clip(text: string, max = 158) {
  if (text.length <= max) return text;
  return `${text.slice(0, text.lastIndexOf(" ", max - 1))}…`;
}
