import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Inter_Tight, Space_Grotesk } from "next/font/google";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Cursor } from "@/components/Cursor";
import { siteUrl } from "@/lib/seo";
import "./globals.css";

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

// Títulos: grotesca de desenho técnico (combina com os rótulos mono); texto corrido em Inter Tight
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "BarrosSoftware | Estúdio de software sob medida", template: "%s | BarrosSoftware" },
  description:
    "Estúdio de software da Paraíba que cria sistemas web, apps, sites e automações com IA sob medida para empresas de todo o Brasil.",
  applicationName: "BarrosSoftware",
  creator: "BarrosSoftware",
  publisher: "BarrosSoftware",
  // indexável de propósito; só a página 404 sai do índice (o Next já marca noindex nela)
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  openGraph: { siteName: "BarrosSoftware", locale: "pt_BR", type: "website" },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
    { media: "(prefers-color-scheme: light)", color: "#f3f2ee" },
  ],
  colorScheme: "dark light",
  // ocupa a tela inteira no iPhone (o dock usa env(safe-area-inset-bottom))
  viewportFit: "cover",
};

// Aplica o tema salvo antes da primeira pintura (evita piscar no tema errado). Padrão: escuro.
const themeScript = `try{var t=localStorage.getItem("theme");if(t==="light")document.documentElement.dataset.theme="light"}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${plexMono.variable} ${interTight.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-carmim focus:px-4 focus:py-2"
        >
          Pular para o conteúdo
        </a>
        <SmoothScroll />
        <Cursor />
        <Nav />
        <main id="conteudo">{children}</main>
        <Footer />
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
