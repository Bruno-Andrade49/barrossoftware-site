"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { cases as staticCases, type Case } from "@/content/cases";
import { SESSION_COOKIE, SESSION_DAYS, checkCredentials, createSessionToken } from "@/lib/auth";
import { requireAdmin } from "@/lib/session";
import { checkLogin, recordFailure, recordSuccess } from "@/lib/login-guard";
import { BUCKET, cmsEnabled, storagePublicPrefix, supabaseAdmin } from "@/lib/supabase-admin";
import { PROJECTS_TAG, caseToRow, type ProjectRow } from "@/lib/projects";

/* ───────────────────────── Login ───────────────────────── */

export type LoginState = { error?: string };

export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  // na Vercel, x-real-ip é preenchido pela própria plataforma (o cliente não consegue forjar)
  const h = await headers();
  const ip = h.get("x-real-ip") || h.get("x-forwarded-for")?.split(",").at(-1)?.trim() || "local";
  const guard = await checkLogin(ip);
  if (guard.blocked) {
    await new Promise((r) => setTimeout(r, 600));
    return { error: "Muitas tentativas. Espere 15 minutos e tente de novo." };
  }

  const user = String(form.get("usuario") ?? "").slice(0, 200);
  const password = String(form.get("senha") ?? "").slice(0, 200);

  if (!(await checkCredentials(user, password))) {
    await recordFailure(guard.ipHash);
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 400)); // chutes em série ficam lentos
    return { error: "Usuário ou senha incorretos." };
  }

  await recordSuccess(guard.ipHash);
  (await cookies()).set(SESSION_COOKIE, await createSessionToken(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
  redirect("/painel");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/painel/login");
}

/* ───────────────────────── Validação ───────────────────────── */

export type ProjectInput = Omit<Case, "id"> & { published: boolean };
export type SaveResult = { ok: true; id: string } | { ok: false; error: string };

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const ASPECT = /^\d{2,5} \/ \d{2,5}$/;

/** Mídia aceita: vazia, arquivo do próprio site (/videos, /images) ou arquivo enviado para o nosso bucket. */
const isMedia = (src: string) =>
  src === "" ||
  /^\/(videos|images)\/[\w./-]+$/.test(src) ||
  (storagePublicPrefix !== "" && src.startsWith(storagePublicPrefix) && !src.includes(".."));

const text = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);

function clean(input: ProjectInput): { data?: ProjectInput; error?: string } {
  const d: ProjectInput = {
    slug: text(input.slug, 60).toLowerCase(),
    name: text(input.name, 80),
    client: text(input.client, 80),
    type: text(input.type, 60),
    year: text(input.year, 9),
    summary: text(input.summary, 200),
    description: text(input.description, 600),
    challenge: text(input.challenge, 1200),
    solution: text(input.solution, 1200),
    stack: (input.stack ?? []).map((s) => text(s, 40)).filter(Boolean).slice(0, 15),
    results: (input.results ?? []).map((s) => text(s, 200)).filter(Boolean).slice(0, 10),
    url: text(input.url, 300) || undefined,
    video: { desktop: text(input.video?.desktop, 500), mobile: text(input.video?.mobile, 500) },
    poster: { desktop: text(input.poster?.desktop, 500), mobile: text(input.poster?.mobile, 500) },
    aspect: { desktop: text(input.aspect?.desktop, 13), mobile: text(input.aspect?.mobile, 13) },
    cover: text(input.cover, 500),
    gallery: (input.gallery ?? []).slice(0, 12).map((g) => ({
      src: text(g.src, 500),
      caption: text(g.caption, 140),
      ...(Number.isInteger(g.width) && Number.isInteger(g.height) && { width: g.width, height: g.height }),
    })),
    published: Boolean(input.published),
  };

  if (!d.name) return { error: "Dê um nome ao projeto." };
  if (!SLUG.test(d.slug)) return { error: "O endereço (slug) aceita só letras minúsculas, números e hífens." };
  if (d.url && !/^https:\/\/[^\s]+$/.test(d.url)) return { error: "O link do site precisa começar com https://." };
  if (!ASPECT.test(d.aspect.desktop) || !ASPECT.test(d.aspect.mobile)) return { error: "Proporção de vídeo inválida." };
  const media = [d.video.desktop, d.video.mobile, d.poster.desktop, d.poster.mobile, d.cover, ...d.gallery.map((g) => g.src)];
  if (!media.every(isMedia)) return { error: "Algum arquivo não veio do envio do painel. Envie de novo." };
  if (d.gallery.some((g) => !g.src)) return { error: "Há uma tela da galeria sem imagem." };

  if (d.published) {
    const missing = [
      !d.description && "descrição curta",
      !d.type && "tipo",
      !d.year && "ano",
      !d.video.desktop && "vídeo do computador",
      !d.video.mobile && "vídeo do celular",
      d.video.desktop && !d.cover && "capa (envie o vídeo do computador de novo)",
    ].filter(Boolean);
    if (missing.length) return { error: `Para publicar, falta: ${missing.join(", ")}. Salve como rascunho ou complete.` };
  }
  return { data: d };
}

/* ───────────────────────── Projetos ───────────────────────── */

/** Atualiza o site na hora: limpa o cache dos projetos e das páginas. */
function refreshSite() {
  revalidateTag(PROJECTS_TAG, { expire: 0 });
  revalidatePath("/", "layout");
}

/** Caminhos no bucket dos arquivos que pertencem ao projeto (os de /public ficam de fora). */
const storagePaths = (r: Partial<ProjectRow>) =>
  [r.video_desktop, r.video_mobile, r.poster_desktop, r.poster_mobile, r.cover, ...(r.gallery ?? []).map((g) => g.src)]
    .filter((s): s is string => Boolean(s && storagePublicPrefix && s.startsWith(storagePublicPrefix)))
    .map((s) => s.slice(storagePublicPrefix.length));

async function removeFiles(paths: string[]) {
  if (paths.length) await supabaseAdmin().storage.from(BUCKET).remove(paths);
}

function ensureCms() {
  if (!cmsEnabled) throw new Error("Configure o Supabase (SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY) para usar o painel.");
}

export async function saveProject(id: string | null, input: ProjectInput): Promise<SaveResult> {
  await requireAdmin();
  ensureCms();
  const { data, error } = clean(input);
  if (!data) return { ok: false, error: error! };
  const db = supabaseAdmin();

  const fields = caseToRow(data, 0, data.published);
  const { position: _position, ...rest } = fields; // a ordem só muda pelas setas da lista
  void _position;

  let saved: ProjectRow | null = null;
  let previous: ProjectRow | null = null;

  if (id) {
    const { data: old } = await db.from("projects").select("*").eq("id", id).single();
    previous = old as ProjectRow | null;
    if (!previous) return { ok: false, error: "Projeto não encontrado. Ele pode ter sido apagado." };
    const res = await db
      .from("projects")
      .update({ ...rest, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (res.error) return { ok: false, error: friendly(res.error) };
    saved = res.data as ProjectRow;
  } else {
    const { data: last } = await db.from("projects").select("position").order("position", { ascending: false }).limit(1);
    const position = (last?.[0]?.position ?? -1) + 1;
    const res = await db.from("projects").insert({ ...rest, position }).select().single();
    if (res.error) return { ok: false, error: friendly(res.error) };
    saved = res.data as ProjectRow;
  }

  // arquivos trocados ou removidos no formulário saem do bucket
  if (previous) {
    const keep = new Set(storagePaths(saved));
    await removeFiles(storagePaths(previous).filter((p) => !keep.has(p)));
  }

  refreshSite();
  return { ok: true, id: saved.id };
}

function friendly(e: { code?: string; message: string }) {
  if (e.code === "23505") return "Já existe um projeto com esse endereço (slug). Escolha outro.";
  console.error("[painel] erro no Supabase:", e.message);
  return "Não foi possível salvar agora. Tente de novo em instantes.";
}

export async function deleteProject(id: string) {
  await requireAdmin();
  ensureCms();
  const db = supabaseAdmin();
  const { data } = await db.from("projects").select("*").eq("id", id).single();
  if (!data) return;
  await db.from("projects").delete().eq("id", id);
  await removeFiles(storagePaths(data as ProjectRow));
  refreshSite();
}

export async function setPublished(id: string, published: boolean): Promise<{ error?: string }> {
  await requireAdmin();
  ensureCms();
  const db = supabaseAdmin();
  if (published) {
    const { data } = await db.from("projects").select("*").eq("id", id).single();
    const r = data as ProjectRow | null;
    if (!r) return { error: "Projeto não encontrado." };
    if (!r.description || !r.video_desktop || !r.video_mobile || !r.cover) {
      return { error: "Complete descrição, vídeos e capa antes de publicar." };
    }
  }
  await db.from("projects").update({ published, updated_at: new Date().toISOString() }).eq("id", id);
  refreshSite();
  return {};
}

/** Sobe ou desce o projeto uma posição na lista (e no site). */
export async function moveProject(id: string, direction: -1 | 1) {
  await requireAdmin();
  ensureCms();
  const db = supabaseAdmin();
  const { data } = await db.from("projects").select("id, position").order("position").order("created_at");
  const list = (data ?? []) as { id: string; position: number }[];
  const i = list.findIndex((p) => p.id === id);
  const j = i + direction;
  if (i < 0 || j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
  // renumera tudo (0, 1, 2…): corrige posições repetidas de uma vez
  await Promise.all(list.map((p, k) => db.from("projects").update({ position: k }).eq("id", p.id)));
  refreshSite();
}

/** Copia os projetos de content/cases.ts para o banco (só com a tabela vazia). */
export async function importStaticCases(): Promise<{ error?: string }> {
  await requireAdmin();
  ensureCms();
  const db = supabaseAdmin();
  const { count } = await db.from("projects").select("id", { count: "exact", head: true });
  if (count) return { error: "O banco já tem projetos." };
  const { error } = await db.from("projects").insert(staticCases.map((c, i) => caseToRow(c, i, true)));
  if (error) return { error: friendly(error) };
  refreshSite();
  return {};
}

/* ───────────────────────── Envio de arquivos ───────────────────────── */

const MIME_EXT: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/avif": "avif",
};

export type UploadTicket = { ok: true; signedUrl: string; publicUrl: string } | { ok: false; error: string };

/**
 * Libera o envio de um arquivo direto do navegador para o Supabase (vídeos passam do limite de
 * 4,5 MB das funções da Vercel). O servidor escolhe o nome do arquivo; a URL assinada vale para
 * esse único arquivo e expira em 2 horas. Tamanho e tipo também são barrados pelo próprio bucket.
 */
export async function createUploadUrl(mime: string, size: number): Promise<UploadTicket> {
  await requireAdmin();
  ensureCms();
  const ext = MIME_EXT[mime];
  if (!ext) return { ok: false, error: "Formato não aceito. Use MP4 ou WebM para vídeo e WebP, JPG, PNG ou AVIF para imagem." };
  if (!(size > 0) || size > 50 * 1024 * 1024) return { ok: false, error: "Arquivo acima de 50 MB. Comprima antes de enviar." };
  const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.${ext}`;
  const { data, error } = await supabaseAdmin().storage.from(BUCKET).createSignedUploadUrl(path);
  if (error || !data) return { ok: false, error: "Não foi possível liberar o envio. Tente de novo." };
  return { ok: true, signedUrl: data.signedUrl, publicUrl: `${storagePublicPrefix}${path}` };
}
