import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/session";
import { cmsEnabled } from "@/lib/supabase-admin";
import { PainelHeader } from "../../_components/ui";
import { ProjectForm } from "../../_components/ProjectForm";
import { emptyProject } from "../../_components/empty";

export const metadata: Metadata = { title: "Novo projeto" };

export default async function NovoProjetoPage() {
  await requireAdmin();
  if (!cmsEnabled) redirect("/painel");
  return (
    <>
      <PainelHeader />
      <main className="mx-auto max-w-[1180px] px-4 pt-12 md:px-8 md:pt-16">
        <p className="mono-label text-carmim-light">Novo projeto</p>
        <h1 className="mt-3 mb-10 text-[clamp(36px,4vw,56px)] leading-[1] font-medium tracking-[-0.04em]">
          Adicionar trabalho<span className="text-carmim">.</span>
        </h1>
        <ProjectForm id={null} initial={emptyProject()} />
      </main>
    </>
  );
}
