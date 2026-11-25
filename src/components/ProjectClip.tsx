import type { Case } from "@/content/cases";
import { VideoClip } from "./VideoClip";

type Props = { item: Case; variant: "desktop" | "mobile"; className?: string };

/**
 * Demonstração do projeto: gravação do site no computador ou no celular, na proporção original.
 * No celular a gravação é só a tela; a moldura do aparelho é desenhada aqui, com os cantos
 * da tela arredondados por dentro dela (nada da imagem escapa pelas pontas).
 */
export function ProjectClip({ item, variant, className = "" }: Props) {
  const clip = (cls: string) => (
    <VideoClip
      src={item.video[variant]}
      poster={item.poster[variant]}
      label={`${item.name} ${variant === "desktop" ? "no computador" : "no celular"}`}
      className={cls}
      style={{ aspectRatio: item.aspect[variant] }}
    />
  );

  if (variant === "desktop") return clip(className);

  return (
    // Proporções medidas na gravação original (820 px de largura): canto de fora ≈ 8,3% da largura,
    // aro ≈ 2%, canto da tela ≈ 6,4%. Em porcentagem (horizontal / vertical), o desenho acompanha
    // o vídeo em qualquer tamanho; o vertical é menor porque o aparelho é ~2,1× mais alto que largo.
    <div className={`w-fit rounded-[8.3%/4%] bg-[#0b0b0d] p-[2%] ring-1 ring-white/15 ${className}`}>
      {clip("h-full rounded-[6.4%/3%]")}
    </div>
  );
}
