import type { NextConfig } from "next";
import { business } from "./src/content/site";

const isDev = process.env.NODE_ENV !== "production";

// Arquivos dos projetos enviados pelo painel (CMS) ficam no Supabase Storage.
const supabase = process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL) : null;
const storage = supabase ? ` ${supabase.origin}` : "";

// Política de segurança: o site só carrega recursos dele mesmo (e os arquivos do Supabase, quando configurado).
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob:${storage}`,
  `media-src 'self' blob:${storage}`,
  "font-src 'self'",
  `connect-src 'self'${storage}${isDev ? " ws:" : ""}`,
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
];

// Domínio oficial (sem www). O www e os endereços antigos redirecionam para cá com 301.
const domain = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? business.domain);

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    // As fontes já estão em WebP; o next/image ainda entrega AVIF/WebP no tamanho certo de cada tela.
    formats: ["image/avif", "image/webp"],
    // telas enviadas pelo painel
    remotePatterns: supabase
      ? [{ protocol: "https", hostname: supabase.hostname, pathname: "/storage/v1/object/public/projetos/**" }]
      : [],
  },
  async redirects() {
    const permanent = { statusCode: 301 as const };
    return [
      // www → domínio sem www (uma única versão canônica do site)
      {
        source: "/:path*",
        has: [{ type: "host", value: `www.${domain.hostname}` }],
        destination: `${domain.origin}/:path*`,
        ...permanent,
      },
      // endereços que não existem mais ou nunca existiram como página
      { source: "/trabalhos", destination: "/#trabalhos", ...permanent },
      { source: "/trabalhos/financas", destination: "/#trabalhos", ...permanent },
      { source: "/index.html", destination: "/", ...permanent },
      { source: "/home", destination: "/", ...permanent },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
