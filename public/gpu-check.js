// Testa, fora da thread principal, se o WebGL tem placa de vídeo de verdade.
// Sem ela o navegador desenha por software (SwiftShader, llvmpipe) e só criar o contexto já trava a página.
// Responde true (GPU), false (software ou sem WebGL) ou null (não deu para testar aqui).
try {
  if (typeof OffscreenCanvas === "undefined") {
    postMessage(null);
  } else {
    var gl = new OffscreenCanvas(1, 1).getContext("webgl2", { failIfMajorPerformanceCaveat: true });
    if (!gl) {
      postMessage(false);
    } else {
      var info = gl.getExtension("WEBGL_debug_renderer_info");
      var name = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
      var lose = gl.getExtension("WEBGL_lose_context");
      if (lose) lose.loseContext();
      postMessage(!/swiftshader|llvmpipe|softpipe|software|basic render/i.test(name));
    }
  }
} catch (e) {
  postMessage(null);
}
