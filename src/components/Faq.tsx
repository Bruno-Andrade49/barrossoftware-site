import { faq } from "@/content/site";
import { Reveal } from "./Reveal";

/**
 * Perguntas frequentes. Cada item é um <details>: o texto vai no HTML do servidor
 * (legível por buscadores e robôs de IA) e abre e fecha sem JavaScript.
 * O mesmo conteúdo alimenta o JSON-LD FAQPage da home.
 */
export function Faq() {
  return (
    <section
      id="perguntas"
      data-form="drift"
      className="relative px-4 py-28 md:px-12 md:py-40"
      aria-labelledby="perguntas-titulo"
    >
      <div className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="mono-label flex items-center gap-4 text-ash">
            <span className="text-carmim-light">(05)</span>
            <span>Perguntas</span>
          </div>
          <h2
            id="perguntas-titulo"
            className="mt-8 text-[clamp(40px,4.6vw,80px)] leading-[0.98] font-medium tracking-[-0.042em]"
          >
            Antes de
            <br />
            começar<span className="text-carmim">.</span>
          </h2>
          <p className="mt-8 max-w-[380px] text-[17px] leading-[1.6] font-light text-mist">
            O que mais perguntam antes do primeiro projeto. Ficou alguma dúvida? Chame no WhatsApp.
          </p>
        </div>

        <Reveal as="div" className="border-t border-white/10 md:col-span-7">
          {faq.map((f, i) => (
            <details key={f.q} className="group border-b border-white/10" name="perguntas">
              <summary className="flex cursor-pointer list-none items-start gap-5 py-6 [&::-webkit-details-marker]:hidden">
                <span className="mono-label mt-2 w-6 shrink-0 text-carmim-light">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="flex-1 text-[clamp(20px,1.8vw,28px)] leading-[1.2] font-medium tracking-[-0.03em]">{f.q}</h3>
                <span
                  aria-hidden="true"
                  className="relative mt-2 size-4 shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] group-open:rotate-45"
                >
                  <span className="absolute top-1/2 left-0 h-px w-4 bg-bone" />
                  <span className="absolute top-0 left-1/2 h-4 w-px bg-bone" />
                </span>
              </summary>
              <p className="max-w-[560px] pb-7 pl-11 text-[16px] leading-[1.6] font-light text-mist">{f.a}</p>
            </details>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
