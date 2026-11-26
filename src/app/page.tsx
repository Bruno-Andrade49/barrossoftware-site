import type { Metadata } from "next";
import { ParticleStage } from "@/components/ParticleStageLazy";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { CodeRain } from "@/components/CodeRain";
import { Services } from "@/components/Services";
import { Work } from "@/components/Work";
import { ClientLogos } from "@/components/ClientLogos";
import { Testimonials } from "@/components/Testimonials";
import { Process } from "@/components/Process";
import { Faq } from "@/components/Faq";
import { ContactCTA } from "@/components/ContactCTA";
import { MobileDock } from "@/components/MobileDock";
import { JsonLd } from "@/components/JsonLd";
import { homeSchema } from "@/lib/schema";
import { getProjects } from "@/lib/projects";

const description =
  "Empresa de software da Paraíba que cria sistemas web, apps, sites e automações com IA sob medida para empresas de todo o Brasil. Resposta em até 1 dia útil.";

export const metadata: Metadata = {
  title: { absolute: "BarrosSoftware | Empresa de software sob medida" },
  description,
  alternates: { canonical: "/" },
  openGraph: { url: "/", title: "BarrosSoftware | Software sob medida", description },
};

export default async function Home() {
  const cases = await getProjects();
  return (
    <>
      <JsonLd data={homeSchema(cases)} />
      <ParticleStage />
      <Hero />
      <CodeRain />
      <Services />
      {cases.length > 0 && <Work cases={cases} />}
      <ClientLogos />
      <Testimonials />
      <Process />
      <About />
      <Faq />
      <ContactCTA />
      <MobileDock />
    </>
  );
}
