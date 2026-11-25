import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { cmsEnabled, supabaseAdmin } from "@/lib/supabase-admin";
import type { ProjectRow } from "@/lib/projects";
import { PainelHeader } from "./_components/ui";
import { ProjectList } from "./_components/ProjectList";

export const metadata: Metadata = { title: { absolute: "Projetos | Painel BarrosSoftware" } };
export const dynamic = "force-dynamic";

export default async function PainelPage() {
  await requireAdmin();

  if (!cmsEnabled) {
    return (
      <>
        <PainelHeader />
        <main className="mx-auto max-w-[720px] px-4 py-16 md:px-8">
          <h1 className="text-[40px] leading-[1] font-medium tracking-[-0.04em]">
            Falta conectar o Supabase<span className="text-carmim">.</span>
          </h1>
          <ol className="mt-8 flex list-decimal flex-col gap-3 pl-5 text-[16px] leading-[1.6] text-mist">
            <li>Crie um projeto em supabase.com (o plano grátis serve).</li>
            <li>
              No <strong className="text-bone">SQL Editor</strong>, rode o arquivo <code className="text-bone">supabase/schema.sql</code>.
            </li>
            <li>
              Em <strong className="text-bone">Project Settings → API</strong>, copie a URL e a chave{" "}
              <code className="text-bone">service_role</code> para <code className="text-bone">SUPABASE_URL</code> e{" "}
              <code className="text-bone">SUPABASE_SERVICE_ROLE_KEY</code>.
            </li>
            <li>Reinicie o servidor (ou faça um novo deploy na Vercel).</li>
          </ol>
        </main>
      </>
    );
  }

  const { data, error } = await supabaseAdmin()
    .from("projects")
    .select("id, slug, name, type, year, published, position, poster_desktop, updated_at")
    .order("position")
    .order("created_at");

  const rows = (data ?? []) as Pick<
    ProjectRow,
    "id" | "slug" | "name" | "type" | "year" | "published" | "position" | "poster_desktop" | "updated_at"
  >[];

  return (
    <>
      <PainelHeader>
        <Link href="/painel/projetos/novo" className="btn-glow !py-2.5">
          Novo projeto <span aria-hidden="true">+</span>
        </Link>
      </PainelHeader>
      <main className="mx-auto max-w-[1180px] px-4 py-12 md:px-8 md:py-16">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mono-label text-carmim-light">(03) Trabalhos</p>
            <h1 className="mt-3 text-[clamp(36px,4vw,56px)] leading-[1] font-medium tracking-[-0.04em]">
              Projetos<span className="text-carmim">.</span>
            </h1>
          </div>
          <p className="max-w-[420px] text-[15px] leading-[1.6] text-ash">
            A ordem daqui é a ordem do site. Só os projetos publicados aparecem; rascunhos ficam visíveis apenas aqui.
          </p>
        </div>

        {error ? (
          <p role="alert" className="glass mt-10 rounded-2xl p-5 text-mist">
            Não foi possível ler o banco. Confira se o <code className="text-bone">supabase/schema.sql</code> foi executado.
          </p>
        ) : (
          <ProjectList rows={rows} />
        )}
      </main>
    </>
  );
}
