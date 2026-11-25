import "server-only";
import { cmsEnabled, supabaseAdmin } from "./supabase-admin";

/**
 * Limite de tentativas do login do painel.
 *
 * - Por IP: 5 erros em 15 minutos bloqueiam aquele IP até a janela passar.
 * - Geral: 30 erros em 15 minutos, somando todos os IPs, travam o login para todos
 *   (contra ataque distribuído, vindo de muitos IPs). O dono espera a janela passar.
 *
 * O contador fica no Supabase (tabela login_failures), então vale para todas as instâncias da Vercel.
 * Se o banco não responder, cai para um contador na memória do servidor: nunca fica sem limite.
 * O IP é guardado só como hash com segredo (HMAC), nunca em texto.
 */

export const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_IP = 5;
const MAX_GLOBAL = 30;

const memory = new Map<string, number[]>();

async function hashIp(ip: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(`login:${process.env.ADMIN_SESSION_SECRET ?? ""}`),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(ip)));
  return Array.from(sig.slice(0, 16), (b) => b.toString(16).padStart(2, "0")).join("");
}

const recent = (list: number[] | undefined, now: number) => (list ?? []).filter((t) => now - t < WINDOW_MS);

function memoryBlocked(ipHash: string, now: number) {
  const mine = recent(memory.get(ipHash), now).length;
  let all = 0;
  for (const list of memory.values()) all += recent(list, now).length;
  return mine >= MAX_PER_IP || all >= MAX_GLOBAL;
}

export type Guard = { ipHash: string; blocked: boolean };

export async function checkLogin(ip: string): Promise<Guard> {
  const ipHash = await hashIp(ip);
  const now = Date.now();
  if (memoryBlocked(ipHash, now)) return { ipHash, blocked: true };
  if (!cmsEnabled) return { ipHash, blocked: false };

  try {
    const since = new Date(now - WINDOW_MS).toISOString();
    const db = supabaseAdmin().from("login_failures");
    const [mine, all] = await Promise.all([
      db.select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("created_at", since),
      supabaseAdmin().from("login_failures").select("id", { count: "exact", head: true }).gte("created_at", since),
    ]);
    if (mine.error || all.error) throw mine.error ?? all.error;
    return { ipHash, blocked: (mine.count ?? 0) >= MAX_PER_IP || (all.count ?? 0) >= MAX_GLOBAL };
  } catch (e) {
    console.error("[login] contador no banco indisponível, usando o da memória:", (e as Error)?.message);
    return { ipHash, blocked: false };
  }
}

export async function recordFailure(ipHash: string) {
  const now = Date.now();
  memory.set(ipHash, [...recent(memory.get(ipHash), now), now]);
  console.warn(`[login] tentativa errada (ip ${ipHash.slice(0, 8)}…)`);
  if (!cmsEnabled) return;
  const db = supabaseAdmin().from("login_failures");
  await db.insert({ ip_hash: ipHash }).then(({ error }) => error && console.error("[login] não registrou a falha:", error.message));
}

export async function recordSuccess(ipHash: string) {
  memory.delete(ipHash);
  if (!cmsEnabled) return;
  const db = supabaseAdmin();
  // limpa as falhas deste IP e, de quebra, o que tiver mais de 1 dia
  await Promise.all([
    db.from("login_failures").delete().eq("ip_hash", ipHash),
    db.from("login_failures").delete().lt("created_at", new Date(Date.now() - 864e5).toISOString()),
  ]);
}
