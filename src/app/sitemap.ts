import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/projects";
import { absolute } from "@/lib/seo";

// Atualizado quando o painel publica algo (os projetos vêm do CMS).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const cases = await getProjects();
  return [
    {
      url: absolute("/"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
      images: [absolute("/opengraph-image.jpg")],
    },
    { url: absolute("/privacidade"), lastModified: now, changeFrequency: "yearly" as const, priority: 0.2 },
    ...cases.map((c) => ({
      url: absolute(`/trabalhos/${c.slug}`),
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.7,
      images: c.gallery.map((g) => absolute(g.src)),
    })),
  ];
}
