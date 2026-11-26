"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

type Props = { src: string; poster: string; label: string; className?: string; style?: CSSProperties };

/**
 * Vídeo mudo em loop que só baixa quando chega perto da tela e só toca quando está visível
 * (pausa fora dela). Escondido (display: none, como a versão de computador no celular), não baixa nunca.
 * A capa é uma imagem por cima (e não o atributo poster): o Safari ignora o object-fit
 * no poster e estica a imagem. Vídeo e capa preenchem a caixa sem distorcer (object-cover);
 * quem usa define a proporção da caixa igual à da gravação.
 */
export function VideoClip({ src, poster, label, className = "", style }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [near, setNear] = useState(false);

  // o arquivo só é pedido quando o vídeo está a menos de uma tela de distância
  useEffect(() => {
    const v = ref.current;
    if (!v || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setNear(true);
        io.disconnect();
      },
      { rootMargin: "100% 100%" },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; // fica a capa
    let visible = false;
    const tryPlay = () => {
      if (visible && v.paused) v.play().catch(() => {});
    };
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible) tryPlay();
        else v.pause();
      },
      { threshold: 0.2 },
    );
    io.observe(v);
    // se o play foi recusado antes de o vídeo carregar, tenta de novo quando ele estiver pronto
    v.addEventListener("canplay", tryPlay);
    return () => {
      io.disconnect();
      v.removeEventListener("canplay", tryPlay);
    };
  }, []);

  return (
    // o conjunto é anunciado uma vez só (role="img"); a capa leva o mesmo texto no alt para buscadores
    <div role="img" aria-label={label} className={`relative overflow-hidden bg-[#000] ${className}`} style={style}>
      <video
        ref={ref}
        src={near ? src : undefined}
        aria-hidden="true"
        muted
        loop
        playsInline
        preload={near ? "auto" : "none"}
        onPlaying={() => setPlaying(true)}
        className="absolute inset-0 size-full object-cover"
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- capa leve, some quando o vídeo começa */}
      <img
        src={poster}
        alt={label}
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className={`pointer-events-none absolute inset-0 size-full object-cover transition-opacity duration-500 ${playing ? "opacity-0" : "opacity-100"}`}
      />
    </div>
  );
}
