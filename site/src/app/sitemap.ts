import type { MetadataRoute } from "next";
import { cases } from "@/content/cases";
import { absolute } from "@/lib/seo";

// Gerado no build: a data é a da última publicação.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: absolute("/"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
      images: [absolute("/opengraph-image.jpg")],
    },
    ...cases.map((c) => ({
      url: absolute(`/trabalhos/${c.slug}`),
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.7,
      images: c.gallery.map((g) => absolute(g.src)),
    })),
  ];
}
