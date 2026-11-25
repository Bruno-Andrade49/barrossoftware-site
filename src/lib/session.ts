import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySessionToken } from "./auth";

/** Usuário logado no painel, ou null. */
export async function currentAdmin() {
  const jar = await cookies();
  return verifySessionToken(jar.get(SESSION_COOKIE)?.value);
}

/**
 * Exige login. Usado em toda página e Server Action do painel: o proxy já redireciona,
 * mas cada ação confere de novo (uma Server Action pode ser chamada direto, sem passar pela página).
 */
export async function requireAdmin() {
  const user = await currentAdmin();
  if (!user) redirect("/painel/login");
  return user;
}
