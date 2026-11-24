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
      poster={item.video[variant].replace(".mp4", ".webp")}
      label={`${item.name} ${variant === "desktop" ? "no computador" : "no celular"}`}
      className={cls}
      style={{ aspectRatio: item.aspect[variant] }}
    />
  );

  if (variant === "desktop") return clip(className);

  return (
    <div className={`w-fit rounded-[2.1rem] bg-[#0b0b0d] p-[5px] ring-1 ring-white/15 ${className}`}>
      {clip("h-full rounded-[1.8rem]")}
    </div>
  );
}
