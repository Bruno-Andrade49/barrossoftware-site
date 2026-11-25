import "server-only";
import { unstable_cache } from "next/cache";
import { cases as staticCases, type Case } from "@/content/cases";
import { cmsEnabled, supabaseAdmin } from "./supabase-admin";

/** Tag do cache dos projetos: o painel a invalida a cada alteração. */
export const PROJECTS_TAG = "projetos";

/** Linha da tabela public.projects. */
export type ProjectRow = {
  id: string;
  slug: string;
  name: string;
  client: string;
  type: string;
  year: string;
  summary: string;
  description: string;
  challenge: string;
  solution: string;
  stack: string[];
  results: string[];
  url: string | null;
  video_desktop: string;
  video_mobile: string;
  poster_desktop: string;
  poster_mobile: string;
  aspect_desktop: string;
  aspect_mobile: string;
  cover: string;
  gallery: Case["gallery"];
  position: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export const rowToCase = (r: ProjectRow): Case => ({
  id: r.id,
  slug: r.slug,
  name: r.name,
  client: r.client,
  type: r.type,
  year: r.year,
  summary: r.summary,
  description: r.description,
  challenge: r.challenge,
  solution: r.solution,
  stack: r.stack ?? [],
  results: r.results ?? [],
  url: r.url ?? undefined,
  video: { desktop: r.video_desktop, mobile: r.video_mobile },
  poster: { desktop: r.poster_desktop, mobile: r.poster_mobile },
  aspect: { desktop: r.aspect_desktop, mobile: r.aspect_mobile },
  cover: r.cover,
  gallery: Array.isArray(r.gallery) ? r.gallery : [],
});

export const caseToRow = (c: Case, position: number, published: boolean) => ({
  slug: c.slug,
  name: c.name,
  client: c.client,
  type: c.type,
  year: c.year,
  summary: c.summary,
  description: c.description,
  challenge: c.challenge,
  solution: c.solution,
  stack: c.stack,
  results: c.results,
  url: c.url ?? null,
  video_desktop: c.video.desktop,
  video_mobile: c.video.mobile,
  poster_desktop: c.poster.desktop,
  poster_mobile: c.poster.mobile,
  aspect_desktop: c.aspect.desktop,
  aspect_mobile: c.aspect.mobile,
  cover: c.cover,
  gallery: c.gallery,
  position,
  published,
});

/**
 * Projetos publicados, na ordem do painel. Fica em cache até o painel salvar algo.
 * Sem Supabase configurado, ou com a tabela ainda vazia, vale a lista de content/cases.ts;
 * se o banco falhar, o site também cai nessa lista em vez de quebrar.
 */
export const getProjects = unstable_cache(
  async (): Promise<Case[]> => {
    if (!cmsEnabled) return staticCases;
    const db = supabaseAdmin();
    const { data, error } = await db
      .from("projects")
      .select("*")
      .eq("published", true)
      .order("position", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) {
      console.error("[projetos] falha ao ler o Supabase:", error.message);
      return staticCases;
    }
    if (data.length === 0) {
      const { count } = await db.from("projects").select("id", { count: "exact", head: true });
      if (!count) return staticCases;
    }
    return (data as ProjectRow[]).map(rowToCase);
  },
  ["projetos-publicados"],
  { tags: [PROJECTS_TAG] },
);

export async function getProject(slug: string) {
  return (await getProjects()).find((c) => c.slug === slug);
}
