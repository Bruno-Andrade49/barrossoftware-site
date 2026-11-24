import { Reveal } from "./Reveal";

const PRINCIPLES = [
  { title: "Código sob medida", text: "Feito para o seu negócio. O sistema é seu." },
  { title: "Resposta em 1 dia útil", text: "Seu contato não fica esperando na fila." },
  { title: "Entregas semanais", text: "Toda semana você testa o que foi construído." },
  { title: "Contato direto", text: "Você fala com quem desenha e com quem programa." },
];

/** Segunda seção: a empresa à esquerda; a esfera de linhas (canvas do palco) ocupa a direita. */
export function About() {
  return (
    <section
      id="sobre-estudio"
      data-form="sphere"
      className="relative flex min-h-[100svh] flex-col justify-center px-4 pt-[52svh] pb-24 md:px-12 md:py-32"
      aria-labelledby="estudio-titulo"
    >
      {/* Área da esfera de linhas: metade direita no desktop, topo no celular */}
      <div
        data-anchor
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[50svh] md:inset-y-0 md:right-0 md:left-auto md:h-auto md:w-1/2"
      />
      <Reveal className="relative md:w-[46%]">
        <div className="mono-label flex items-center gap-4 text-ash">
          <span className="text-carmim-light">(01)</span>
          <span>A empresa</span>
          <span className="h-px flex-1 bg-white/10" aria-hidden="true" />
        </div>

        <h2
          id="estudio-titulo"
          className="mt-10 text-[clamp(40px,4.6vw,76px)] leading-[0.98] font-medium tracking-[-0.042em]"
        >
          Sob medida,
          <br />
          com quem faz
          <br />
          do seu lado<span className="text-carmim">.</span>
        </h2>

        <p className="mt-8 max-w-[480px] text-[17px] leading-[1.6] font-light text-mist">
          Sem intermediário e sem surpresa. Do primeiro rascunho ao sistema rodando, a gente cuida de tudo.
        </p>

        <ol className="mt-14 border-t border-white/10">
          {PRINCIPLES.map((p, i) => (
            <li
              key={p.title}
              className="grid grid-cols-[44px_1fr] gap-x-4 border-b border-white/10 py-5 md:grid-cols-[56px_220px_1fr] md:items-baseline"
            >
              <span className="mono-label text-ash">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-[17px] font-medium tracking-[-0.01em] text-bone">{p.title}</span>
              <span className="col-start-2 mt-1 text-[15px] leading-[1.5] font-light text-ash md:col-start-auto md:mt-0">
                {p.text}
              </span>
            </li>
          ))}
        </ol>
      </Reveal>
    </section>
  );
}
