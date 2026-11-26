"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// three.js + simulação (~130 KB) ficam fora do carregamento inicial: o texto aparece primeiro
const Stage = dynamic(() => import("./ParticleStage").then((m) => m.ParticleStage), { ssr: false });

/**
 * O aparelho desenha WebGL com placa de vídeo? Sem ela (o navegador cai no desenho por software:
 * SwiftShader, llvmpipe), a simulação roda na CPU e trava a página; aí o palco nem é baixado.
 */
function hasRealGpu() {
  try {
    const gl = document.createElement("canvas").getContext("webgl2", { failIfMajorPerformanceCaveat: true });
    if (!gl) return false;
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const name = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return !/swiftshader|llvmpipe|softpipe|software|basic render/i.test(name);
  } catch {
    return false;
  }
}

/** Faz o teste num worker (fora da thread principal); onde não dá, faz aqui mesmo. */
function checkGpu(done: (ok: boolean) => void) {
  let worker: Worker;
  try {
    worker = new Worker("/gpu-check.js");
  } catch {
    done(hasRealGpu());
    return () => {};
  }
  worker.onmessage = (e: MessageEvent<boolean | null>) => {
    worker.terminate();
    done(e.data ?? hasRealGpu());
  };
  worker.onerror = () => {
    worker.terminate();
    done(hasRealGpu());
  };
  return () => worker.terminate();
}

/** Monta o palco de partículas depois que a página carregou e o navegador ficou livre. */
export function ParticleStage() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    let idle = 0;
    let timer = 0;
    let stop = () => {};
    const show = () => {
      stop = checkGpu((ok) => ok && setOn(true));
    };
    const start = () => {
      const ric = window.requestIdleCallback;
      if (ric) idle = ric(show, { timeout: 1500 });
      else timer = window.setTimeout(show, 200);
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      window.removeEventListener("load", start);
      if (idle) window.cancelIdleCallback(idle);
      clearTimeout(timer);
      stop();
    };
  }, []);

  return on ? <Stage /> : null;
}
