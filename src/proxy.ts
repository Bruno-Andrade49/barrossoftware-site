import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

/**
 * Porteiro do painel: sem sessão válida, qualquer página de /painel vai para o login.
 * É a primeira barreira; as páginas e as Server Actions conferem a sessão de novo.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const user = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  const isLogin = pathname === "/painel/login";

  if (!user && !isLogin) return NextResponse.redirect(new URL("/painel/login", request.url));
  if (user && isLogin) return NextResponse.redirect(new URL("/painel", request.url));

  const res = NextResponse.next();
  // o painel nunca entra em busca nem em cache compartilhado
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  res.headers.set("Cache-Control", "private, no-store");
  return res;
}

export const config = {
  matcher: ["/painel", "/painel/:path*"],
};
