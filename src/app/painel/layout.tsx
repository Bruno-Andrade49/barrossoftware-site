import type { Metadata } from "next";

// O painel nunca aparece em busca (o proxy também manda X-Robots-Tag e o robots.txt o bloqueia).
export const metadata: Metadata = {
  title: { default: "Painel", template: "%s | Painel BarrosSoftware" },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-void text-bone">{children}</div>;
}
