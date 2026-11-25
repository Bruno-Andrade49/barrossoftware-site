import type { Metadata } from "next";
import { ParticleStage } from "@/components/ParticleStage";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { CodeRain } from "@/components/CodeRain";
import { Services } from "@/components/Services";
import { Work } from "@/components/Work";
import { Process } from "@/components/Process";
import { Faq } from "@/components/Faq";
import { ContactCTA } from "@/components/ContactCTA";
import { MobileDock } from "@/components/MobileDock";
import { JsonLd } from "@/components/JsonLd";
import { homeSchema } from "@/lib/schema";

const description =
  "Empresa de software da Paraíba que cria sistemas web, apps, sites e automações com IA sob medida para empresas de todo o Brasil. Resposta em até 1 dia útil.";

export const metadata: Metadata = {
  title: { absolute: "BarrosSoftware | Empresa de software sob medida na Paraíba" },
  description,
  alternates: { canonical: "/" },
  openGraph: { url: "/", title: "BarrosSoftware | Software sob medida", description },
};

export default function Home() {
  return (
    <>
      <JsonLd data={homeSchema()} />
      <ParticleStage />
      <Hero />
      <About />
      <CodeRain />
      <Services />
      <Work />
      <Process />
      <Faq />
      <ContactCTA />
      <MobileDock />
    </>
  );
}
