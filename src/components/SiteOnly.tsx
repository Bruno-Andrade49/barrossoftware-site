"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Mostra o conteúdo só no site público: o painel (/painel) tem a própria moldura, sem menu, rodapé e cursor do site. */
export function SiteOnly({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/painel" || pathname.startsWith("/painel/")) return null;
  return <>{children}</>;
}
