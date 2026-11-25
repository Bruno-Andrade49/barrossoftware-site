/**
 * Login fixo do painel: usuário e senha nas variáveis de ambiente, sessão num cookie assinado.
 * Usa só Web Crypto, para rodar igual no proxy e nas Server Actions.
 *
 * Cookie: base64url({ u, exp }) + "." + HMAC-SHA256(ADMIN_SESSION_SECRET). HttpOnly, SameSite=Strict
 * e Secure em produção: o navegador não deixa scripts lerem nem outros sites enviarem.
 */

export const SESSION_COOKIE = "bs_painel";
export const SESSION_DAYS = 7;

const enc = new TextEncoder();

const b64url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromB64url = (s: string) =>
  Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

/**
 * O painel só liga com as três variáveis definidas, senha de 12+ caracteres e segredo de 32+.
 * Configuração fraca = login desligado (melhor que um painel fácil de adivinhar).
 */
export const authConfigured = () =>
  Boolean(
    process.env.ADMIN_USER &&
      (process.env.ADMIN_PASSWORD ?? "").length >= 12 &&
      (process.env.ADMIN_SESSION_SECRET ?? "").length >= 32,
  );

async function hmacKey() {
  return crypto.subtle.importKey(
    "raw",
    enc.encode(process.env.ADMIN_SESSION_SECRET ?? ""),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

/** Compara dois textos sem vazar, pelo tempo de resposta, quantos caracteres batem (compara os hashes). */
async function sameText(a: string, b: string) {
  const [ha, hb] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(a)),
    crypto.subtle.digest("SHA-256", enc.encode(b)),
  ]);
  const x = new Uint8Array(ha);
  const y = new Uint8Array(hb);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

export async function checkCredentials(user: string, password: string) {
  if (!authConfigured()) return false;
  // as duas comparações sempre rodam, para o tempo não revelar se o usuário existe
  const [u, p] = await Promise.all([
    sameText(user, process.env.ADMIN_USER!),
    sameText(password, process.env.ADMIN_PASSWORD!),
  ]);
  return u && p;
}

export async function createSessionToken(user: string) {
  const payload = b64url(enc.encode(JSON.stringify({ u: user, exp: Date.now() + SESSION_DAYS * 864e5 })));
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", await hmacKey(), enc.encode(payload)));
  return `${payload}.${b64url(sig)}`;
}

/** Sessão válida → nome do usuário; qualquer outra coisa → null. */
export async function verifySessionToken(token: string | undefined | null) {
  if (!token || !authConfigured()) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  try {
    const ok = await crypto.subtle.verify("HMAC", await hmacKey(), fromB64url(sig), enc.encode(payload));
    if (!ok) return null;
    const data = JSON.parse(new TextDecoder().decode(fromB64url(payload))) as { u?: string; exp?: number };
    if (!data.u || !data.exp || data.exp < Date.now()) return null;
    if (data.u !== process.env.ADMIN_USER) return null; // trocar o usuário derruba as sessões antigas
    return data.u;
  } catch {
    return null;
  }
}
