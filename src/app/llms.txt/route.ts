import { cases } from "@/content/cases";
import { business, faq, services, site } from "@/content/site";
import { absolute } from "@/lib/seo";

// llms.txt (llmstxt.org): resumo do site em Markdown para assistentes de IA. Gerado no build.
export const dynamic = "force-static";

export function GET() {
  const body = [
    `# ${business.name}`,
    "",
    "> Empresa de software da Paraíba que cria sistemas web, apps, sites e automações com IA sob medida para empresas de todo o Brasil.",
    "",
    "## Serviços",
    ...services.map((s) => `- **${s.title}**: ${s.text}`),
    "",
    "## Trabalhos",
    ...cases.map((c) => `- [${c.name}](${absolute(`/trabalhos/${c.slug}`)}): ${c.type}. ${c.description}`),
    "",
    "## Perguntas frequentes",
    ...faq.map((f) => `- **${f.q}** ${f.a}`),
    "",
    "## Contato",
    `- Site: ${absolute("/")}`,
    `- E-mail: ${site.contact.email}`,
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
}
