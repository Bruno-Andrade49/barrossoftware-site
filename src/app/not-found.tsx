import type { Metadata } from "next";
import { Button } from "@/components/Button";

// A 404 é a única página fora do índice (o Next também já manda noindex nela).
export const metadata: Metadata = {
  title: "Página não encontrada",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <section className="relative isolate flex min-h-dvh flex-col justify-center overflow-hidden px-4 pt-24 md:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[45%] left-1/2 -z-10 h-[80vh] w-[110vw] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(200_16_46/0.5),transparent)] blur-2xl"
      />
      <p className="mono-label text-carmim-light">Erro 404</p>
      <h1 className="display mt-4 text-[clamp(96px,22vw,360px)]">
        <span className="fill-chrome">40</span>
        <em className="fill-carmim not-italic">4</em>
      </h1>
      <p className="mt-6 max-w-[520px] text-[18px] leading-[1.55] font-light text-mist">
        Essa página não existe. O endereço pode estar errado ou a página mudou de lugar.
      </p>
      <div className="mt-10">
        <Button href="/">Voltar ao início</Button>
      </div>
    </section>
  );
}
