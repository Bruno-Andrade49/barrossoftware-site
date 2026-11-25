import type { Metadata } from "next";
import Link from "next/link";
import { business, site } from "@/content/site";

// Texto-base escrito para o que o site faz hoje. REVISAR com um advogado antes de publicar
// e sempre que o site passar a coletar outros dados.

export const metadata: Metadata = {
  title: "Política de privacidade",
  description: "Como a BarrosSoftware trata os dados enviados pelo site, em conformidade com a LGPD.",
  alternates: { canonical: "/privacidade" },
};

const updated = "25 de novembro de 2026";

const sections: { title: string; body: React.ReactNode }[] = [
  {
    title: "Quem somos",
    body: (
      <p>
        Este site pertence à {business.name}
        {business.cnpj && <>, inscrita no CNPJ {business.cnpj}</>}, empresa de software com sede na Paraíba. Somos a
        controladora dos dados enviados por aqui. Contato: <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>.
      </p>
    ),
  },
  {
    title: "Que dados coletamos",
    body: (
      <ul>
        <li>
          <b>Formulário de contato:</b> nome, e-mail, empresa, telefone, tipo de projeto, faixa de orçamento e a mensagem
          que você escrever. Só recebemos o que você preencher.
        </li>
        <li>
          <b>WhatsApp e e-mail:</b> se você nos chamar por esses canais, recebemos o que você enviar por eles.
        </li>
        <li>
          <b>Medição de visitas:</b> contamos visitas e o desempenho das páginas de forma agregada e anônima, sem cookies e
          sem identificar você.
        </li>
        <li>
          <b>Preferência de tema:</b> o modo claro ou escuro fica guardado só no seu navegador.
        </li>
      </ul>
    ),
  },
  {
    title: "Para que usamos",
    body: (
      <p>
        Para responder ao seu pedido, preparar uma proposta e conversar sobre o projeto. A base legal é a realização de
        procedimentos preliminares a um contrato, a seu pedido (art. 7º, V, da LGPD). A medição de visitas serve para
        melhorar o site, com base no nosso legítimo interesse (art. 7º, IX). Não vendemos dados e não enviamos marketing
        sem a sua autorização.
      </p>
    ),
  },
  {
    title: "Com quem compartilhamos",
    body: (
      <p>
        Só com os serviços que fazem o site funcionar: a Vercel (hospedagem e medição de visitas) e o Resend (envio dos
        e-mails do formulário). Eles tratam os dados conforme nossas instruções. Esses serviços podem guardar dados fora
        do Brasil, com as garantias previstas na LGPD.
      </p>
    ),
  },
  {
    title: "Por quanto tempo guardamos",
    body: (
      <p>
        Pelo tempo necessário para responder ao seu pedido. Se o contato virar um projeto, durante a relação comercial e
        pelo prazo exigido por lei. Depois disso, os dados são apagados.
      </p>
    ),
  },
  {
    title: "Seus direitos",
    body: (
      <p>
        Você pode pedir a qualquer momento para confirmar, acessar, corrigir ou apagar seus dados, além dos outros direitos
        do art. 18 da LGPD. É só escrever para <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>.
        Respondemos em até 15 dias.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <article className="px-4 pt-32 pb-28 md:px-12 md:pt-40">
      <nav aria-label="Trilha de navegação" className="mono-label text-ash">
        <Link href="/" className="hover:text-bone">
          Início
        </Link>{" "}
        / <span className="text-bone">Política de privacidade</span>
      </nav>
      <h1 className="mt-10 text-[clamp(40px,6vw,96px)] leading-[0.95] font-medium tracking-[-0.045em]">
        Política de
        <br />
        privacidade<span className="text-carmim">.</span>
      </h1>
      <p className="mono-label mt-8 text-ash">Atualizada em {updated}</p>

      <div className="mt-16 grid gap-12 md:max-w-[880px]">
        {sections.map((s, i) => (
          <section key={s.title} className="grid gap-4 border-t border-white/10 pt-8 md:grid-cols-[200px_1fr] md:gap-10">
            <h2 className="text-[22px] leading-tight font-medium tracking-[-0.02em]">
              <span className="mono-label mr-3 text-carmim-light">{String(i + 1).padStart(2, "0")}</span>
              {s.title}
            </h2>
            <div className="text-[16px] leading-[1.7] font-light text-mist [&_a]:text-bone [&_a]:underline [&_a]:underline-offset-4 [&_b]:font-medium [&_b]:text-bone [&_li]:mt-3 [&_ul]:list-none">
              {s.body}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
