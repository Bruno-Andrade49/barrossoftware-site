import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Bucket dos arquivos dos projetos (vídeos, capas e telas). */
export const BUCKET = "projetos";

const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** O CMS só liga com o Supabase configurado; sem ele, o site usa os projetos de content/cases.ts. */
export const cmsEnabled = Boolean(url && key);

/** Prefixo público dos arquivos enviados (para validar que uma URL veio do nosso bucket). */
export const storagePublicPrefix = url ? `${url}/storage/v1/object/public/${BUCKET}/` : "";

let client: SupabaseClient | null = null;

/**
 * Cliente com a chave de serviço: ignora o RLS, então só roda no servidor
 * ("server-only" quebra o build se algum componente do navegador importar este arquivo).
 */
export function supabaseAdmin() {
  if (!url || !key) throw new Error("Supabase não configurado (SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY).");
  client ??= createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}
