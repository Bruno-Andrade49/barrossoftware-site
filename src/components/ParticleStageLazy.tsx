"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// three.js + simulação (~130 KB) ficam fora do carregamento inicial: o texto aparece primeiro
const Stage = dynamic(() => import("./ParticleStage").then((m) => m.ParticleStage), { ssr: false });

/** Monta o palco de partículas depois que a página carregou e o navegador ficou livre. */
export function ParticleStage() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    let idle = 0;
    let timer = 0;
    const start = () => {
      const ric = window.requestIdleCallback;
      if (ric) idle = ric(() => setOn(true), { timeout: 1500 });
      else timer = window.setTimeout(() => setOn(true), 200);
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      window.removeEventListener("load", start);
      if (idle) window.cancelIdleCallback(idle);
      clearTimeout(timer);
    };
  }, []);

  return on ? <Stage /> : null;
}
