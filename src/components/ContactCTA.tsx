"use client";

import { useState } from "react";
import { site, whatsappUrl } from "@/content/site";
import { ContactForm } from "./ContactForm";
import { LocalClock } from "./LocalClock";
import { Reveal } from "./Reveal";

/**
 * Contato: composição centrada. As partículas (forma "halo") viram um horizonte de linhas que
 * ondulam no pé da seção, como um relevo, sem passar por cima do texto.
 */
export function ContactCTA() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.contact.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${site.contact.email}`;
    }
  };

  return (
    <section
      data-form="halo"
      id="contato"
      className="relative flex min-h-[100svh] flex-col justify-center px-5 py-28 md:px-12 md:py-32"
      aria-labelledby="contato-titulo"
    >
      {/* Área do horizonte de partículas: faixa no pé da seção */}
      <div
        data-anchor
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[30%] md:inset-x-[-4%] md:h-[34%]"
      />
      <Reveal className="relative mx-auto flex w-full max-w-[1100px] flex-col items-center text-center">
        <p className="mono-label flex items-center gap-4 text-ash">
          <span className="text-carmim-light">(06)</span>
          <span>Contato</span>
        </p>

        <h2
          id="contato-titulo"
          className="mt-10 text-[clamp(52px,8.4vw,148px)] leading-[0.92] font-medium tracking-[-0.05em]"
        >
          Vamos construir
          <br />o seu<span className="text-carmim">?</span>
        </h2>

        <p className="mt-10 max-w-[480px] text-[17px] leading-[1.6] font-light text-mist">
          Conte o que você precisa. Respondemos em até um dia útil com os próximos passos e uma primeira ideia de prazo.
        </p>

        <div className="mt-10 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-glow justify-center py-[18px] sm:py-[14px]">
            Chamar no WhatsApp <span aria-hidden="true">→</span>
          </a>
          <button
            type="button"
            onClick={copy}
            className="glass-chip mono-label inline-flex items-center justify-center gap-2 rounded-full px-5 py-[17px] text-ash hover:text-bone sm:py-[15px]"
          >
            {copied ? "E-mail copiado ✓" : site.contact.email}
          </button>
        </div>
        <p className="sr-only" aria-live="polite">
          {copied ? "E-mail copiado" : ""}
        </p>

        <div className="mt-14 w-full max-w-[860px]">
          <ContactForm />
        </div>

        <dl className="mono-label mt-14 grid w-full max-w-[760px] grid-cols-3 gap-3 border-t border-white/10 pt-6 text-ash sm:mt-20 sm:gap-6 sm:pt-8">
          <div>
            <dt>Resposta</dt>
            <dd className="mt-2 text-bone">Até 1 dia útil</dd>
          </div>
          <div>
            <dt>Atendimento</dt>
            <dd className="mt-2 text-bone">Todo o Brasil, remoto</dd>
          </div>
          <div>
            <dt>Agora na PB</dt>
            <dd className="mt-2 text-bone">
              <LocalClock /> BRT
            </dd>
          </div>
        </dl>
      </Reveal>
    </section>
  );
}
