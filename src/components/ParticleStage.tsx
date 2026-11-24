"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GPUComputationRenderer, type Variable } from "three/examples/jsm/misc/GPUComputationRenderer.js";
import { forms, river, snoise, transit } from "@/lib/glsl";

/*
 * Palco de partículas da página inteira (um canvas fixo atrás de tudo).
 * Cada seção declara uma forma com data-form; a área da forma vem do elemento [data-anchor]
 * dentro dela (ou da própria seção):
 *   flow (hero) → sphere (estúdio) → drift (serviços) → off (trabalhos, invisível)
 *   → path (processo) → halo (contato) → word (BARROS no rodapé)
 * A forma fica inteira enquanto a seção ocupa o meio da tela e acompanha o scroll dela.
 * Ao trocar de seção, as partículas atravessam pela lateral: saem pela direita (ao descer)
 * e entram pela esquerda até a forma nova; ao subir, o contrário.
 * Cada partícula é desenhada como uma linha fina (cabeça forte, cauda que some) pela velocidade.
 */

export type FlowStats = { x: number; y: number; agitation: number; fps: number };

/** Canal para o hero ler as estatísticas sem acoplar ao canvas. */
export const flowBus = new EventTarget();
/** Última contagem anunciada (para quem se inscreve depois do anúncio). */
export let readyCount = 0;

const FORM_ID: Record<string, number> = { flow: 0, sphere: 1, stream: 3, path: 4, frame: 5, halo: 6, word: 7, drift: 8, off: 9 };
// formas guiadas por campo de velocidade (não por alvo): fluxo, corrente, deriva e invisível
const isFree = (f: number) => f === 0 || f === 3 || f === 8 || f === 9;

const velocityShader = /* glsl */ `
  uniform float uTime;
  uniform float uDelta;
  uniform vec2 uMouse;
  uniform vec2 uMouseVel;
  uniform float uMouseOn;
  uniform float uMouseR;
  uniform float uFormA;
  uniform float uFormB;
  uniform float uScrollVel;
  uniform vec2 uShiftA;
  uniform vec2 uShiftB;
  ${snoise}
  ${river}
  ${forms}
  ${transit}

  vec2 flowDesired(vec2 p, float layer) {
    float n = snoise(vec3(p * 0.6, uTime * 0.035));
    float n2 = snoise(vec3(p * 1.5 + 11.0, uTime * 0.06));
    float inRiver = exp(-pow((p.y - riverY(p.x, uTime)) / 0.26, 2.0));
    float ang = mix(n * 1.05 + n2 * 0.3, n * 0.35, inRiver);
    float slope = riverY(p.x + 0.01, uTime) - riverY(p.x - 0.01, uTime);
    ang += atan(slope / 0.02) * inRiver * 0.8;
    float spd = mix(0.05, 0.15, layer) * (1.0 + inRiver * 0.9);
    return vec2(cos(ang), sin(ang)) * spd;
  }

  // serviços: campo calmo e uniforme (sem a corrente do hero, para as linhas não se juntarem numa faixa)
  vec2 driftDesired(vec2 p, float layer) {
    float ang = snoise(vec3(p * 0.45, uTime * 0.03)) * 3.1416;
    return vec2(cos(ang), sin(ang)) * mix(0.03, 0.08, layer);
  }

  vec2 streamDesired(vec2 p, float layer, float seed) {
    vec4 g = uGeo[3];
    float lane = (hsh(seed, 2.7) - 0.5) * g.w;
    float yT = g.y + lane + sin(p.x * 1.6 + uTime * 0.4 + lane * 6.0) * 0.035;
    float spd = mix(0.16, 0.45, layer) * (1.0 + uScrollVel * 3.5);
    return vec2(-spd, (yT - p.y) * 3.0);
  }

  vec2 desiredFor(float f, vec2 p, float layer, float seed, vec2 uv) {
    if (f < 0.5) return flowDesired(p, layer);
    if (f > 7.5) return driftDesired(p, layer);
    if (abs(f - 3.0) < 0.5) return streamDesired(p, layer, seed);
    int fi = int(f + 0.5);
    vec4 T = formAt(fi, seed, uv, uTime);
    vec4 T2 = formAt(fi, seed, uv, uTime + 0.04);
    vec2 orbit = (T2.xy - T.xy) / 0.04;
    if (length(orbit) > 6.0) orbit = vec2(0.0); // salto do vórtice ao renascer
    float pull = fi == 4 ? 9.0 : 5.5;
    return orbit + (T.xy - p) * pull;
  }

  float bound(float f) { return (f < 0.5 || f > 7.5 || abs(f - 3.0) < 0.5) ? 0.0 : 1.0; }

  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 P = texture2D(texturePosition, uv);
    vec2 p = P.xy;
    float layer = P.z;
    float seed = P.w;
    vec4 V = texture2D(textureVelocity, uv);
    vec2 v = V.xy;
    float z = V.z;

    float moving = step(0.5, abs(uFormA - uFormB));
    float tt = uTime - uTransStart;
    float dep = departAt(p.x, seed);
    float phase = phaseOf(moving, tt, dep, z);

    // posição já com o deslocamento do scroll deste quadro (o shader de posição aplica o mesmo),
    // para o alvo que andou não virar um puxão na velocidade
    vec2 ps = p;
    if (phase > 1.5) ps += uShiftB * bound(uFormB);
    else if (phase < 0.5) ps += uShiftA * bound(uFormA);

    vec2 desired;
    float b;
    if (phase > 1.5) {
      desired = desiredFor(uFormB, ps, layer, seed, uv);
      b = bound(uFormB);
      if (moving > 0.5 && b > 0.5) {
        // chegada suave numa forma presa: a velocidade máxima começa baixa e sobe aos poucos,
        // então as linhas deslizam até o lugar em vez de cruzar a tela num risco (ex.: forma ainda
        // abaixo da tela quando a seção começa)
        float ia = wrappedNow(z) ? wrapAge(z, tt) : tt - dep - 2.4;
        if (wrappedNow(z)) desired.x += uDir * 0.6 * (1.0 - smoothstep(0.0, 0.8, ia));
        float vmax = mix(0.6, 6.0, smoothstep(0.2, 2.6, ia));
        float dl = length(desired);
        if (dl > vmax) desired *= vmax / dl;
        b *= smoothstep(0.0, 1.6, ia);
      }
    } else if (phase > 0.5) {
      // atravessando: um vento lateral; cada linha mantém a altura em que estava
      // (quem já tinha saído da tela com o scroll sai pela lateral sem ser puxado de volta)
      float age = tt - dep;
      float spd = mix(2.2, 3.8, layer) * smoothstep(0.0, 0.3, age) + 0.4;
      float wav = snoise(vec3(p.x * 0.7, p.y * 0.7 + seed * 3.0, uTime * 0.25));
      desired = vec2(uDir * spd, wav * 0.12);
      b = 0.4;
    } else {
      desired = desiredFor(uFormA, ps, layer, seed, uv);
      b = bound(uFormA);
    }

    // cursor: o fluxo contorna como água em volta de uma pedra
    vec2 d = p - uMouse;
    float r = length(d) + 1e-4;
    float f = smoothstep(uMouseR, uMouseR * 0.2, r) * uMouseOn;
    vec2 nrm = d / r;
    vec2 tang = vec2(-nrm.y, nrm.x);
    tang *= sign(dot(tang, desired) + 1e-5);
    vec2 around = tang * max(length(desired), 0.12) * 1.5 + nrm * 0.22;
    desired = mix(desired, around, f);
    desired += uMouseVel * f * 0.5;

    v = mix(v, desired, 1.0 - pow(mix(0.9, 0.78, b), uDelta * 60.0));
    // vai passar da borda neste quadro: marca a volta. O shader de posição deste quadro anda com a
    // velocidade do quadro anterior (V.xy, não a nova), então a previsão usa a mesma.
    float nx = p.x + V.x * uDelta;
    if (phase > 0.5 && phase < 1.5 && (uDir > 0.0 ? nx > uHalf.x : nx < -uHalf.x)) {
      z = uTransId + min(tt, 7.9) / 8.0;
    }
    gl_FragColor = vec4(v, z, p.x);
  }
`;

const positionShader = /* glsl */ `
  uniform float uDelta;
  uniform float uWrap;
  uniform float uTime;
  uniform float uFormA;
  uniform float uFormB;
  uniform vec2 uShiftA;
  uniform vec2 uShiftB;
  ${forms}
  ${transit}

  float boundF(float f) { return (f < 0.5 || f > 7.5 || abs(f - 3.0) < 0.5) ? 0.0 : 1.0; }

  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 P = texture2D(texturePosition, uv);
    vec4 V = texture2D(textureVelocity, uv);
    vec2 p = P.xy + V.xy * uDelta;
    // formas presas à seção andam junto com ela no scroll, como se fossem parte da página:
    // o deslocamento entra direto na posição (sem passar pela velocidade), então não deforma nem risca
    float moving = step(0.5, abs(uFormA - uFormB));
    float phase = phaseOf(moving, uTime - uTransStart, departAt(P.x, P.w), V.z);
    if (phase > 1.5) p += uShiftB * boundF(uFormB);
    else if (phase < 0.5) p += uShiftA * boundF(uFormA);
    // forma de chegada solta (fluxo, serviços): quem sai por uma borda reaparece num ponto qualquer
    // da tela, e o campo acende como uma varredura lateral (ver o alfa no shader das linhas)
    bool crossing = uDir > 0.0 ? p.x > uHalf.x : p.x < -uHalf.x;
    // (V.z ainda é o do quadro anterior: quem está atravessando e cruza a borda agora é marcado
    // pelo shader de velocidade neste mesmo quadro)
    if (moving > 0.5 && crossing && boundF(uFormB) < 0.5 && phase > 0.5 && phase < 1.5) {
      p = vec2(hsh(P.w, 17.3 + uTransId * 1.7) * 2.0 - 1.0, hsh(P.w, 29.1 + uTransId * 2.3) * 2.0 - 1.0) * uHalf;
    }
    // na horizontal sempre dá a volta (é por onde as partículas atravessam entre seções)
    p.x = mod(p.x + uHalf.x, 2.0 * uHalf.x) - uHalf.x;
    if (uWrap > 0.5) p.y = mod(p.y + uHalf.y, 2.0 * uHalf.y) - uHalf.y;
    gl_FragColor = vec4(p, P.z, P.w);
  }
`;

const lineVertex = /* glsl */ `
  uniform sampler2D uPos;
  uniform sampler2D uVel;
  uniform float uTrail;
  uniform float uTime;
  uniform float uReveal;
  uniform float uGain;
  uniform float uInk;
  uniform float uFormA;
  uniform float uFormB;
  uniform vec3 uWhite;
  uniform vec3 uCarmim;
  attribute vec2 aRef;
  attribute float aEnd;
  varying vec3 vColor;
  varying float vAlpha;
  ${river}
  ${forms}
  ${transit}

  float alphaFor(float f, vec4 P, float layer, float seed) {
    if (f > 8.5) return 0.0;
    if (f > 7.5) return mix(0.015, 0.09, layer * layer);
    if (f < 0.5) {
      float inRiver = exp(-pow((P.y - riverY(P.x, uTime)) / 0.3, 2.0));
      return mix(0.035, 0.34, layer * layer) * mix(0.32, 2.0, inRiver);
    }
    if (abs(f - 3.0) < 0.5) return mix(0.03, 0.26, layer * layer);
    vec4 T = formAt(int(f + 0.5), seed, aRef, uTime);
    // a palavra do rodapé já é densa: sem o reforço de brilho do celular, para não borrar as letras
    float gain = f > 6.5 ? min(uGain, 1.7) : uGain;
    return 0.15 * T.w * mix(0.6, 1.0, layer) * gain;
  }

  void main() {
    vec4 P = texture2D(uPos, aRef);
    vec4 V = texture2D(uVel, aRef);
    vec2 v = V.xy;
    float layer = P.z;
    float seed = P.w;
    vec2 tail = v * uTrail * mix(0.6, 1.2, layer);
    float tl = length(tail);
    if (tl > 0.2) tail *= 0.2 / tl;
    vec2 p = P.xy - tail * aEnd;
    gl_Position = projectionMatrix * viewMatrix * vec4(p, 0.0, 1.0);

    // mesma travessia do shader de velocidade: forma de saída → corrente → forma nova
    float moving = step(0.5, abs(uFormA - uFormB));
    float tt = uTime - uTransStart;
    float dep = departAt(P.x, seed);
    float phase = phaseOf(moving, tt, dep, V.z);
    float aT = mix(0.01, 0.075, layer * layer) * mix(1.0, uGain, 0.5);
    float a;
    if (phase > 1.5) {
      float aB = alphaFor(uFormB, P, layer, seed);
      if (moving > 0.5 && wrappedNow(V.z)) {
        float age = wrapAge(V.z, tt);
        float fB = uFormB;
        bool freeB = fB < 0.5 || fB > 7.5 || abs(fB - 3.0) < 0.5;
        // forma solta: acende em varredura no sentido da travessia; forma presa: a linha chega e assenta
        float delay = clamp(uDir * P.x / uHalf.x * 0.5 + 0.5, 0.0, 1.0) * 0.7;
        a = freeB ? aB * smoothstep(delay, delay + 0.6, age) : mix(aT, aB, smoothstep(0.1, 1.1, age));
      } else {
        a = aB;
      }
    } else if (phase > 0.5) {
      // saindo de uma seção sem partículas (trabalhos): a travessia fica invisível; elas só aparecem ao chegar
      a = uFormA > 8.5 ? 0.0 : mix(alphaFor(uFormA, P, layer, seed), aT, smoothstep(0.0, 0.35, tt - dep));
    } else {
      a = alphaFor(uFormA, P, layer, seed);
    }
    a *= 1.0 - aEnd;
    a *= 1.0 - smoothstep(uReveal - 0.5, uReveal, P.x);
    bool red = seed > 0.955;
    vColor = red ? uCarmim : uWhite;
    vAlpha = (red ? a * 1.5 : a) * uInk;
  }
`;

const lineFragment = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    gl_FragColor = vec4(vColor, vAlpha);
  }
`;

/** Amostra o texto do elemento (mesma fonte, tamanho e espaçamento do CSS) em pontos 0..1 da caixa. */
function sampleWord(el: HTMLElement, count: number, data: Float32Array) {
  const r = el.getBoundingClientRect();
  const w = Math.max(1, Math.round(r.width));
  const h = Math.max(1, Math.round(r.height));
  const cs = getComputedStyle(el);
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const ctx = cv.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;
  const size = parseFloat(cs.fontSize);
  ctx.font = `${cs.fontWeight} ${size}px ${cs.fontFamily}`;
  const ls = parseFloat(cs.letterSpacing);
  if (!Number.isNaN(ls)) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${ls}px`;
  const text = (el.dataset.word || el.textContent || "").trim();
  const m = ctx.measureText(text);
  const glyphH = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(text, w / 2, h / 2 + glyphH / 2 - m.actualBoundingBoxDescent);
  const img = ctx.getImageData(0, 0, w, h).data;
  const pts: number[] = [];
  const step = Math.max(1, Math.round(Math.sqrt((w * h * 0.35) / count)));
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const jx = Math.min(w - 1, x + Math.random() * step);
      const jy = Math.min(h - 1, y + Math.random() * step);
      if (img[((jy | 0) * w + (jx | 0)) * 4 + 3] > 128) pts.push(jx / w, jy / h);
    }
  }
  if (!pts.length) return;
  const n = pts.length / 2;
  for (let i = 0; i < count; i++) {
    const k = Math.floor(Math.random() * n);
    data[i * 4] = pts[k * 2];
    data[i * 4 + 1] = pts[k * 2 + 1];
    data[i * 4 + 2] = 1;
    data[i * 4 + 3] = 1;
  }
}

export function ParticleStage() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.innerWidth < 768;
    // no celular, 1.5× já deixa as linhas finas nítidas e poupa a GPU (e a bateria)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, small ? 1.5 : 2));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.display = "block";
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
    const half = new THREE.Vector2(1.6, 1);

    // --- Simulação ---
    const SIZE = small ? 84 : 168;
    const COUNT = SIZE * SIZE;
    const gpgpu = new GPUComputationRenderer(SIZE, SIZE, renderer);
    if (!renderer.extensions.has("EXT_color_buffer_float")) gpgpu.setDataType(THREE.HalfFloatType);
    const pos0 = gpgpu.createTexture();
    const pa = pos0.image.data as unknown as Float32Array;
    const aspect0 = window.innerWidth / window.innerHeight;
    for (let i = 0; i < COUNT; i++) {
      pa[i * 4] = (Math.random() * 2 - 1) * aspect0 * 1.05;
      pa[i * 4 + 1] = (Math.random() * 2 - 1) * 1.05;
      pa[i * 4 + 2] = Math.random(); // camada
      pa[i * 4 + 3] = Math.random(); // semente
    }
    const vel0 = gpgpu.createTexture();
    const velVar: Variable = gpgpu.addVariable("textureVelocity", velocityShader, vel0);
    const posVar: Variable = gpgpu.addVariable("texturePosition", positionShader, pos0);
    gpgpu.setVariableDependencies(velVar, [posVar, velVar]);
    gpgpu.setVariableDependencies(posVar, [posVar, velVar]);

    const wordData = new Float32Array(COUNT * 4);
    const wordTex = new THREE.DataTexture(wordData, SIZE, SIZE, THREE.RGBAFormat, THREE.FloatType);
    wordTex.needsUpdate = true;

    const shared = {
      uTime: { value: 0 },
      uFormA: { value: 0 },
      uFormB: { value: 0 },
      uTransStart: { value: -100 },
      uTransId: { value: 0 },
      uDir: { value: 1 },
      uHalf: { value: half },
      uShiftA: { value: new THREE.Vector2() },
      uShiftB: { value: new THREE.Vector2() },
      uGeo: { value: Array.from({ length: 10 }, () => new THREE.Vector4(0, 0, 1, 1)) },
      uWord: { value: wordTex },
    };
    const vu = velVar.material.uniforms;
    Object.assign(vu, shared, {
      uDelta: { value: 1 / 60 },
      uMouse: { value: new THREE.Vector2(99, 99) },
      uMouseVel: { value: new THREE.Vector2() },
      uMouseOn: { value: 0 },
      uMouseR: { value: small ? 0.3 : 0.42 },
      uScrollVel: { value: 0 },
    });
    const pu = posVar.material.uniforms;
    Object.assign(pu, shared, { uDelta: { value: 1 / 60 }, uWrap: { value: 1 } });
    if (gpgpu.init()) {
      renderer.dispose();
      renderer.domElement.remove();
      return;
    }

    // --- Linhas ---
    const ref = new Float32Array(COUNT * 4);
    const end = new Float32Array(COUNT * 2);
    for (let i = 0; i < COUNT; i++) {
      const u = ((i % SIZE) + 0.5) / SIZE;
      const v = (Math.floor(i / SIZE) + 0.5) / SIZE;
      ref.set([u, v, u, v], i * 4);
      end[i * 2 + 1] = 1;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(COUNT * 6), 3));
    geo.setAttribute("aRef", new THREE.BufferAttribute(ref, 2));
    geo.setAttribute("aEnd", new THREE.BufferAttribute(end, 1));
    const mat = new THREE.ShaderMaterial({
      vertexShader: lineVertex,
      fragmentShader: lineFragment,
      uniforms: {
        ...shared,
        uPos: { value: null },
        uVel: { value: null },
        uTrail: { value: 1.35 },
        uReveal: { value: reduced ? 99 : -3 },
        uGain: { value: small ? 2.4 : 1 },
        uInk: { value: 1 },
        uWhite: { value: new THREE.Color("#e9ecf2") },
        uCarmim: { value: new THREE.Color("#ff2a4a") },
      },
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
    const lines = new THREE.LineSegments(geo, mat);
    lines.frustumCulled = false;
    scene.add(lines);

    // Tema: no escuro, linhas claras somadas (aditivo); no claro, linhas escuras com mistura normal
    const applyTheme = () => {
      const light = document.documentElement.dataset.theme === "light";
      mat.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
      mat.uniforms.uWhite.value.set(light ? "#1b1c20" : "#e9ecf2");
      mat.uniforms.uCarmim.value.set(light ? "#c8102e" : "#ff2a4a");
      mat.uniforms.uInk.value = light ? 0.55 : 1;
      mat.needsUpdate = true;
    };
    applyTheme();
    const themeObs = new MutationObserver(applyTheme);
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    // --- Seções e áreas das formas ---
    type Sec = { el: HTMLElement; form: number; anchor: HTMLElement };
    let secs: Sec[] = [];
    let wordEl: HTMLElement | null = null;
    const collect = () => {
      secs = Array.from(document.querySelectorAll<HTMLElement>("[data-form]")).map((s) => ({
        el: s,
        form: FORM_ID[s.dataset.form || "flow"] ?? 0,
        anchor: s.querySelector<HTMLElement>("[data-anchor]") ?? s,
      }));
      const w = secs.find((s) => s.form === 7)?.anchor ?? null;
      if (w && w !== wordEl) {
        wordEl = w;
        sampleWord(w, COUNT, wordData);
        wordTex.needsUpdate = true;
      }
    };

    let W = window.innerWidth;
    let H = window.innerHeight;
    const toWorld = (r: DOMRect) => {
      const aspect = W / H;
      return new THREE.Vector4(
        ((r.left + r.width / 2) / W) * 2 * aspect - aspect,
        1 - ((r.top + r.height / 2) / H) * 2,
        (r.width / W) * 2 * aspect,
        (r.height / H) * 2,
      );
    };

    const layout = () => {
      W = el.clientWidth || window.innerWidth;
      H = el.clientHeight || window.innerHeight;
      renderer.setSize(W, H, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      const aspect = W / H;
      camera.left = -aspect;
      camera.right = aspect;
      camera.updateProjectionMatrix();
      half.set(aspect * 1.05, 1.05);
      if (wordEl) {
        sampleWord(wordEl, COUNT, wordData);
        wordTex.needsUpdate = true;
      }
    };
    const ro = new ResizeObserver(layout);
    ro.observe(el);
    layout();
    collect();

    // Seção ativa: a que contém o meio da tela, com folga para não ficar trocando na divisa.
    // A forma fica inteira enquanto a seção está ativa; só a troca de seção dispara a travessia.
    let activeIdx = -1;
    const pickActive = () => {
      // linha de referência um pouco abaixo do meio: a troca começa enquanto a forma que sai ainda está à vista
      const c = H * 0.6;
      const margin = H * 0.05;
      let candidate = -1;
      for (let k = 0; k < secs.length; k++) {
        const s = secs[k];
        shared.uGeo.value[s.form].copy(toWorld(s.anchor.getBoundingClientRect()));
        const r = s.el.getBoundingClientRect();
        // a primeira seção que ainda não terminou acima da linha; um vão entre seções (faixa de serviços)
        // já conta como a seção de baixo
        if (candidate < 0 && r.bottom > c) {
          const clear = r.top < c - margin && r.bottom > c + margin;
          const gap = r.top > c;
          candidate = k === activeIdx || clear || gap || activeIdx < 0 ? k : activeIdx;
        }
      }
      // forma presa (esfera, cabo, relevo): só assume quando o centro da área dela já está na tela.
      // Senão as partículas mergulhariam atrás de um alvo fora da tela, num risco vertical.
      if (candidate >= 0 && candidate !== activeIdx && activeIdx >= 0) {
        const s = secs[candidate];
        if (!isFree(s.form) && s.anchor !== s.el) {
          const r = s.anchor.getBoundingClientRect();
          const cy = r.top + r.height / 2;
          if (cy > H * 0.82 || cy < H * 0.12) candidate = activeIdx;
        }
      }
      // o rodapé nunca chega ao meio da tela: vale ao chegar perto do fim da página
      const remaining = document.documentElement.scrollHeight - (window.scrollY + H);
      const last = secs.length - 1;
      if (last >= 0 && (remaining < H * 0.3 || (activeIdx === last && remaining < H * 0.5))) candidate = last;
      return candidate < 0 ? activeIdx : candidate;
    };

    // --- Cursor ---
    const mouse = new THREE.Vector2(99, 99);
    const last = new THREE.Vector2(99, 99);
    const mouseVel = new THREE.Vector2();
    let pointerIn = false;
    let mouseOn = 0;
    const onMove = (e: PointerEvent) => {
      const aspect = W / H;
      mouse.set((e.clientX / W) * 2 * aspect - aspect, 1 - (e.clientY / H) * 2);
      pointerIn = true;
    };
    const onLeave = () => (pointerIn = false);
    // toque: o vão abre na hora no ponto tocado e acompanha o arraste; quando o navegador assume
    // o scroll (pointercancel) ou o dedo sai, o vão fecha sozinho
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      onMove(e);
      last.copy(mouse);
      mouseOn = Math.max(mouseOn, 0.85);
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") pointerIn = false;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    const clock = new THREE.Clock();
    let simTime = 0;
    let raf = 0;
    let frames = 0;
    let statT = 0;
    let agitation = 0;
    let started = -1;
    let lastScroll = window.scrollY;
    let scrollVel = 0;
    let recollect = 0;
    let mouseGate = 1;
    // posição da área das formas A e B no quadro anterior (para o deslocamento do scroll)
    const prevA = new THREE.Vector2(NaN, NaN);
    const prevB = new THREE.Vector2(NaN, NaN);

    const step = (dt: number, t: number) => {
      if (started < 0) started = t;
      recollect += dt;
      if (recollect > 1) {
        recollect = 0;
        collect();
      }

      mouseVel.subVectors(mouse, last).divideScalar(Math.max(dt, 1 / 120));
      if (mouseVel.length() > 6) mouseVel.setLength(6);
      last.copy(mouse);
      mouseOn += ((pointerIn ? 1 : 0) - mouseOn) * 0.08;
      agitation += (Math.min(mouseVel.length() / 4, 1) * mouseOn - agitation) * 0.06;

      const sv = Math.abs(window.scrollY - lastScroll) / Math.max(dt, 1 / 120) / H;
      lastScroll = window.scrollY;
      scrollVel += (Math.min(sv, 2) - scrollVel) * 0.1;

      const idx = pickActive();
      if (idx >= 0 && idx !== activeIdx) {
        const form = secs[idx].form;
        if (activeIdx < 0 || reduced) {
          // primeira leitura (ou movimento reduzido): já começa na forma certa, sem travessia
          shared.uFormA.value = form;
        } else {
          shared.uFormA.value = shared.uFormB.value;
          shared.uTransStart.value = t;
          shared.uTransId.value = (shared.uTransId.value % 60) + 1;
          shared.uDir.value = idx > activeIdx ? 1 : -1;
        }
        shared.uFormB.value = form;
        activeIdx = idx;
        prevA.set(NaN, NaN);
        prevB.set(NaN, NaN);
      }
      const A = shared.uFormA.value;
      const B = shared.uFormB.value;
      // travessia terminada: todas as partículas já estão na forma nova
      if (A !== B && t - shared.uTransStart.value > 5.5) shared.uFormA.value = B;
      const moving = shared.uFormA.value !== B;
      pu.uWrap.value = isFree(B) || (moving && isFree(A)) ? 1 : 0;

      // quanto a área de cada forma andou na tela desde o quadro anterior (scroll)
      const shift = (geo: THREE.Vector4, prev: THREE.Vector2, out: THREE.Vector2) => {
        if (Number.isFinite(prev.x)) out.set(geo.x - prev.x, geo.y - prev.y);
        else out.set(0, 0);
        prev.set(geo.x, geo.y);
      };
      shift(shared.uGeo.value[shared.uFormA.value], prevA, shared.uShiftA.value);
      shift(shared.uGeo.value[B], prevB, shared.uShiftB.value);

      // o cursor só mexe nas partículas no hero (nas formas das outras seções ele as tirava do lugar)
      const inHero = !moving && B === FORM_ID.flow && activeIdx === 0;
      mouseGate += ((inHero ? 1 : 0) - mouseGate) * 0.08;

      shared.uTime.value = t;
      vu.uDelta.value = dt;
      vu.uMouse.value.copy(mouse);
      vu.uMouseVel.value.copy(mouseVel).multiplyScalar(0.06);
      vu.uMouseOn.value = mouseOn * mouseGate;
      vu.uScrollVel.value = scrollVel;
      pu.uDelta.value = dt;
      gpgpu.compute();

      mat.uniforms.uPos.value = gpgpu.getCurrentRenderTarget(posVar).texture;
      mat.uniforms.uVel.value = gpgpu.getCurrentRenderTarget(velVar).texture;
      if (!reduced) {
        const k = Math.min((t - started) / 2.4, 1);
        const eased = 1 - Math.pow(1 - k, 3);
        mat.uniforms.uReveal.value = -half.x - 0.5 + eased * (2 * half.x + 1.5);
      }
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(clock.getDelta(), 1 / 30);
      // tempo da simulação (não do relógio): com a aba lenta, a travessia anda no mesmo ritmo das partículas
      simTime += dt;
      step(dt, simTime);
      renderer.render(scene, camera);
      frames++;
      statT += dt;
      if (statT > 0.25) {
        const stats: FlowStats = {
          x: pointerIn ? mouse.x : 0,
          y: pointerIn ? mouse.y : 0,
          agitation,
          fps: Math.round(frames / statT),
        };
        flowBus.dispatchEvent(new CustomEvent("stats", { detail: stats }));
        frames = 0;
        statT = 0;
      }
    };

    readyCount = COUNT;
    flowBus.dispatchEvent(new CustomEvent("ready", { detail: COUNT }));
    // A fonte precisa estar pronta para amostrar o BARROS
    document.fonts.ready.then(() => {
      wordEl = null;
      collect();
    });
    if (reduced) {
      for (let i = 0; i < 90; i++) step(1 / 60, i / 60);
      renderer.render(scene, camera);
    } else {
      tick();
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      themeObs.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      gpgpu.dispose();
      wordTex.dispose();
      geo.dispose();
      mat.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div ref={host} aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
      {/* Vinheta fixa na tela (não presa a nenhuma seção, então não marca divisa entre elas) */}
      <div className="absolute inset-0 z-[1] bg-[radial-gradient(130%_100%_at_50%_45%,transparent_55%,var(--color-void)_100%)] opacity-70" />
    </div>
  );
}
