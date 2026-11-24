/** Dados estruturados (schema.org) renderizados no servidor, dentro do HTML da página. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  // "<" escapado: o JSON nunca fecha a tag <script> antes da hora
  const json = JSON.stringify(data).replace(/</g, "\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
