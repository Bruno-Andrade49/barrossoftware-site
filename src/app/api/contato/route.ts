import { NextResponse } from "next/server";

/**
 * Recebe o formulário de contato e envia por e-mail pela API do Resend (https://resend.com).
 * Variáveis de ambiente (na Vercel ou no .env.local):
 *   RESEND_API_KEY  chave da API
 *   CONTACT_TO      e-mail que recebe os pedidos
 *   CONTACT_FROM    remetente verificado no Resend, ex.: "Site <site@barrossoftware.com.br>"
 * Sem elas, responde 503 e o formulário oferece o WhatsApp.
 */

const TYPES = ["Sistema web", "App mobile", "Site ou landing page", "Automação ou IA", "Outro"];
const BUDGETS = ["Até R$ 10 mil", "R$ 10 a 30 mil", "R$ 30 a 80 mil", "Acima de R$ 80 mil", "Ainda não sei"];

// limite simples por IP (memória da instância): 5 envios a cada 10 minutos
const hits = new Map<string, number[]>();
const limited = (ip: string) => {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60 * 1000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
};

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const escape = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  // campo-isca: robôs preenchem, pessoas não veem
  if (clean(body.site, 200)) return NextResponse.json({ ok: true });

  const data = {
    nome: clean(body.nome, 120),
    email: clean(body.email, 160),
    empresa: clean(body.empresa, 160),
    telefone: clean(body.telefone, 40),
    tipo: TYPES.includes(clean(body.tipo, 60)) ? clean(body.tipo, 60) : "Outro",
    orcamento: BUDGETS.includes(clean(body.orcamento, 60)) ? clean(body.orcamento, 60) : "Ainda não sei",
    mensagem: clean(body.mensagem, 4000),
  };
  if (!data.nome || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || data.mensagem.length < 10) {
    return NextResponse.json({ error: "Preencha nome, um e-mail válido e a mensagem." }, { status: 422 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(ip)) return NextResponse.json({ error: "Muitos envios. Tente de novo em alguns minutos." }, { status: 429 });

  const { RESEND_API_KEY, CONTACT_TO, CONTACT_FROM } = process.env;
  if (!RESEND_API_KEY || !CONTACT_TO || !CONTACT_FROM) {
    return NextResponse.json({ error: "Envio por formulário indisponível no momento." }, { status: 503 });
  }

  const rows = [
    ["Nome", data.nome],
    ["E-mail", data.email],
    ["Empresa", data.empresa || "—"],
    ["Telefone", data.telefone || "—"],
    ["Tipo de projeto", data.tipo],
    ["Orçamento", data.orcamento],
  ];
  const html = `<h2>Novo pedido pelo site</h2><table>${rows
    .map(([k, v]) => `<tr><td><b>${k}</b></td><td>${escape(v)}</td></tr>`)
    .join("")}</table><p>${escape(data.mensagem).replace(/\n/g, "<br>")}</p>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: CONTACT_FROM,
      to: [CONTACT_TO],
      reply_to: data.email,
      subject: `Novo projeto: ${data.tipo} — ${data.nome}`,
      html,
      text: `${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\n${data.mensagem}`,
    }),
  });
  if (!res.ok) return NextResponse.json({ error: "Não conseguimos enviar agora." }, { status: 502 });
  return NextResponse.json({ ok: true });
}
