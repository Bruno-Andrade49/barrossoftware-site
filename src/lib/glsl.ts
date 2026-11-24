// Trechos GLSL compartilhados pelos shaders de partículas.

/** Ruído simplex 3D (Ashima Arts / Stefan Gustavson, licença MIT). */
export const snoise = /* glsl */ `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }
`;

/** Corrente luminosa do hero. */
export const river = /* glsl */ `
  float riverY(float x, float t) {
    return 0.06 + sin(x * 1.1 + t * 0.18) * 0.12 + sin(x * 2.3 - t * 0.11) * 0.05;
  }
`;

/**
 * Formas por seção. Todas devolvem vec4(x, y, profundidade -1..1, brilho 0..1) em coordenadas
 * do mundo (y de -1 a 1, x de -aspecto a +aspecto).
 * uGeo[f] = centro (x, y) e tamanho (largura, altura) da área da forma f na tela.
 */
export const forms = /* glsl */ `
  uniform vec4 uGeo[10];
  uniform sampler2D uWord;

  float hsh(float s, float k) { return fract(sin(s * k) * 43758.5453); }

  // esfera de órbitas: latitudes de três planos inclinados que se cruzam
  vec3 orbitSphere(float seed, float t, vec2 c, float R) {
    float h1 = hsh(seed, 91.7);
    float h2 = hsh(seed, 47.3);
    float h3 = hsh(seed, 13.1);
    float lat = asin(h1 * 2.0 - 1.0) * 0.94;
    float lon = h2 * 6.2831 + t * (0.16 + h3 * 0.14);
    vec3 q = vec3(cos(lat) * cos(lon), sin(lat), cos(lat) * sin(lon));
    float a = floor(h3 * 3.0) * 1.047 + 0.4;
    q = vec3(q.x, q.y * cos(a) - q.z * sin(a), q.y * sin(a) + q.z * cos(a));
    float g = t * 0.1;
    q = vec3(q.x * cos(g) + q.z * sin(g), q.y, -q.x * sin(g) + q.z * cos(g));
    float tx = 0.32;
    q = vec3(q.x, q.y * cos(tx) - q.z * sin(tx), q.y * sin(tx) + q.z * cos(tx));
    return vec3(c + q.xy * R, q.z);
  }

  vec4 formAt(int f, float seed, vec2 uv, float t) {
    vec4 g = uGeo[f];
    if (f == 1) {
      // esfera da seção A empresa
      vec3 s = orbitSphere(seed, t, g.xy, min(g.z, g.w) * 0.36);
      return vec4(s, mix(0.1, 1.0, smoothstep(-0.9, 0.9, s.z)));
    }
    if (f == 4) {
      // cabo trançado que atravessa as etapas do processo (horizontal; vertical se a área for alta)
      bool vert = g.w > g.z;
      float len = vert ? g.w : g.z;
      float wid = vert ? g.z : g.w;
      float sp = 0.035 + hsh(seed, 5.3) * 0.03;
      float s = fract(hsh(seed, 12.9) + t * sp);
      float lane = hsh(seed, 7.7);
      // os fios se apertam em cada etapa (s = 1/8, 3/8, 5/8, 7/8) e abrem entre elas
      float env = abs(cos(s * 12.5664));
      float off = env * sin(t * 0.5 + lane * 6.2831) * wid * 0.45 * (0.35 + lane * 0.65);
      off += (hsh(seed, 3.1) - 0.5) * 0.012;
      float along = -len * 0.5 + s * len;
      vec2 pos = vert ? vec2(g.x + off, g.y + len * 0.5 - s * len) : vec2(g.x + along, g.y + off);
      float fade = smoothstep(0.0, 0.06, s) * smoothstep(1.0, 0.94, s);
      float z = sin(t * 0.5 + lane * 6.2831);
      return vec4(pos, z, fade * mix(0.05, 0.22, smoothstep(-1.0, 1.0, z)));
    }
    if (f == 5) {
      // moldura: linhas correndo pelo contorno da foto
      float per = 2.0 * (g.z + g.w);
      float dir = hsh(seed, 8.8) > 0.5 ? 1.0 : -1.0;
      float d = fract(hsh(seed, 4.4) + t * (0.02 + hsh(seed, 6.6) * 0.025) * dir) * per;
      float ofs = 0.012 + hsh(seed, 2.2) * 0.05;
      float hw = g.z * 0.5 + ofs;
      float hh = g.w * 0.5 + ofs;
      vec2 q;
      if (d < g.z) q = vec2(-hw + d / g.z * 2.0 * hw, hh);
      else if (d < g.z + g.w) q = vec2(hw, hh - (d - g.z) / g.w * 2.0 * hh);
      else if (d < 2.0 * g.z + g.w) q = vec2(hw - (d - g.z - g.w) / g.z * 2.0 * hw, -hh);
      else q = vec2(-hw, -hh + (d - 2.0 * g.z - g.w) / g.w * 2.0 * hh);
      return vec4(g.xy + q, 0.0, mix(0.35, 0.8, 1.0 - ofs / 0.062));
    }
    if (f == 6) {
      // contato: horizonte de linhas — fileiras que ondulam como um relevo, mais altas no centro
      // e mais juntas ao fundo (perspectiva); cada partícula corre ao longo da sua fileira
      float rows = 22.0;
      float row = floor(hsh(seed, 4.1) * rows);
      float depth = row / (rows - 1.0); // 0 = frente (embaixo), 1 = fundo (em cima)
      float u = fract(hsh(seed, 2.7) + t * (0.012 + hsh(seed, 6.2) * 0.012));
      float cx = u * 2.0 - 1.0;
      float env = exp(-cx * cx * 2.2);
      // fases que mudam pouco de uma fileira para a outra: as linhas formam uma superfície contínua
      float wave = sin(u * 5.5 + row * 0.42 + t * 0.28) * 0.6 + sin(u * 11.0 - row * 0.3 + t * 0.4) * 0.25
                 + sin(u * 2.2 + row * 0.18 - t * 0.2) * 0.15;
      float yRow = g.y - g.w * 0.5 + pow(depth, 0.75) * g.w * 0.92;
      float amp = g.w * 0.34 * (1.0 - depth * 0.5) * env;
      vec2 pos = vec2(g.x - g.z * 0.5 + u * g.z, yRow + (wave * 0.5 + 0.5) * amp);
      float fade = smoothstep(0.0, 0.16, u) * smoothstep(1.0, 0.84, u);
      return vec4(pos, depth, fade * mix(0.3, 0.05, depth) * (0.2 + env * 0.8));
    }
    if (f == 7) {
      // BARROS: pontos amostrados do texto, com um leve tremor para as linhas aparecerem
      vec4 w = texture2D(uWord, uv);
      float j = seed * 40.0;
      // tremor proporcional ao tamanho das letras (no celular a palavra é menor e o tremor borrava)
      vec2 jit = vec2(cos(t * 5.0 + j), sin(t * 4.3 + j)) * 0.004 * clamp(g.w / 0.6, 0.25, 1.0);
      vec2 pos = vec2(g.x - g.z * 0.5 + w.x * g.z, g.y + g.w * 0.5 - w.y * g.w) + jit;
      return vec4(pos, 0.0, 1.7);
    }
    return vec4(g.xy, 0.0, 0.0);
  }
`;

/**
 * Travessia entre seções: ao trocar de forma, cada partícula sai pela lateral (direita ao descer,
 * esquerda ao subir), dá a volta pela borda e entra pelo outro lado até a forma nova.
 * O estado vive na textura de velocidade: z = id da travessia em que a partícula já deu a volta
 * (parte inteira) + instante da volta (fração × 8 s); w = x do quadro anterior (para detectar a volta).
 * Precisa de `forms` antes (usa hsh).
 */
export const transit = /* glsl */ `
  uniform float uTransStart;
  uniform float uTransId;
  uniform float uDir;
  uniform vec2 uHalf;

  // quem está do lado da saída parte primeiro; um pouco de acaso para não sair em bloco
  float departAt(float x, float seed) {
    float edge = clamp(uDir * x / uHalf.x * 0.5 + 0.5, 0.0, 1.0);
    return (1.0 - edge) * 0.35 + hsh(seed, 9.1) * 0.3;
  }
  bool wrappedNow(float z) { return abs(floor(z + 0.001) - uTransId) < 0.5; }
  float wrapAge(float z, float tt) { return tt - (fract(z + 0.001) - 0.001) * 8.0; }

  // 0 = ainda na forma de saída; 1 = atravessando; 2 = chegou (ou não há travessia)
  float phaseOf(float moving, float tt, float dep, float z) {
    if (moving < 0.5 || wrappedNow(z) || tt > dep + 3.6) return 2.0;
    return tt > dep ? 1.0 : 0.0;
  }
`;
