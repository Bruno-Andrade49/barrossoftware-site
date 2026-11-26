import { testimonials } from "@/content/site";
import { Reveal } from "./Reveal";

/** Depoimentos dos clientes, logo depois dos trabalhos. Só aparece quando houver pelo menos um. */
export function Testimonials() {
  if (testimonials.length === 0) return null;

  return (
    <section aria-labelledby="depoimentos-titulo" className="px-4 py-24 md:px-12 md:py-32">
      <h2 id="depoimentos-titulo" className="mono-label text-carmim-light">
        O que dizem os clientes
      </h2>
      <Reveal
        as="ul"
        className={`mt-10 grid gap-6 md:mt-14 md:gap-10 ${testimonials.length > 1 ? "md:grid-cols-2" : ""}`}
      >
        {testimonials.map((t) => (
          <li key={t.name} className="glass flex flex-col rounded-2xl p-6 md:p-10">
            <blockquote className="text-[clamp(20px,2vw,28px)] leading-[1.35] font-light tracking-[-0.02em] text-bone">
              <span className="text-carmim" aria-hidden="true">
                “
              </span>
              {t.quote}
              <span className="text-carmim" aria-hidden="true">
                ”
              </span>
            </blockquote>
            <p className="mono-label mt-auto pt-8 text-ash">
              <span className="text-bone">{t.name}</span> · {t.role}, {t.company}
            </p>
          </li>
        ))}
      </Reveal>
    </section>
  );
}
