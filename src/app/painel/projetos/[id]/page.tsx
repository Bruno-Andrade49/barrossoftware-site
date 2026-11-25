import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/session";
import { cmsEnabled, supabaseAdmin } from "@/lib/supabase-admin";
import { rowToCase, type ProjectRow } from "@/lib/projects";
import { PainelHeader } from "../../_components/ui";
import { ProjectForm } from "../../_components/ProjectForm";

export const metadata: Metadata = { title: "Editar projeto" };
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditarProjetoPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  if (!cmsEnabled) redirect("/painel");
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const { data } = await supabaseAdmin().from("projects").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const row = data as ProjectRow;
  const { id: _id, ...item } = rowToCase(row);
  void _id;

  return (
    <>
      <PainelHeader />
      <main className="mx-auto max-w-[1180px] px-4 pt-12 md:px-8 md:pt-16">
        <p className="mono-label text-carmim-light">Editar projeto</p>
        <h1 className="mt-3 mb-10 text-[clamp(36px,4vw,56px)] leading-[1] font-medium tracking-[-0.04em]">
          {row.name}
          <span className="text-carmim">.</span>
        </h1>
        <ProjectForm id={row.id} initial={{ ...item, url: item.url ?? "", published: row.published }} />
      </main>
    </>
  );
}
