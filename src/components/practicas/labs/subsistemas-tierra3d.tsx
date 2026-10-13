"use client";

/**
 * LA TIERRA ABIERTA EN CUÑA — laboratorio de Subsistemas terrestres (CNEYT-III-P05).
 *
 * Técnica tomada del laboratorio de gravitación (TierraFoto) y COPIADA aquí a
 * propósito: este lab no debe depender de un archivo de otro lab que puede
 * cambiar. Lo que se agrega:
 *  · El CORTE: un octante de la esfera se descarta en el sombreador (como en
 *    las infografías de National Geographic) y tres caras planas muestran el
 *    interior con radios proporcionales: corteza, litosfera, astenósfera,
 *    manto (con celdas de convección que circulan), núcleo externo líquido
 *    (remolinos) y núcleo interno incandescente (emisivo → bloom).
 *  · La atmósfera EXAGERADA sobre esas mismas caras (casquete de capas).
 *  · La biosfera y la hidrosfera leídas de la foto: la vegetación se detecta
 *    por color y la deforestación abre claros cafés con un ruido coherente; el
 *    océano se tiñe con la acidez; el hielo marino retrocede con el calor.
 *  · Realce por esfera: al elegir un subsistema, se ilumina el suyo.
 *
 * Todo se anima con uniformes que se amortiguan en useFrame (sin setState ni
 * `new` dentro del cuadro).
 */

import * as THREE from "three";
import { useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { rutaTextura, useTexturaEspacio } from "./_espacio";
import {
  ALT_ATMOS, R_ASTENOSFERA, R_CORTEZA, R_LITOSFERA, R_NUCLEO_EXTERNO, R_NUCLEO_INTERNO, type LonLat,
} from "./subsistemas-capas";

const DEG = Math.PI / 180;

/** Punto de longitud/latitud (grados) sobre una esfera de radio r, igual que la textura equirectangular. */
export function lonLat(ll: LonLat, r = 1, out = new THREE.Vector3()): THREE.Vector3 {
  const la = ll[1] * DEG;
  const lo = ll[0] * DEG;
  return out.set(Math.cos(la) * Math.cos(lo), Math.sin(la), -Math.cos(la) * Math.sin(lo)).multiplyScalar(r);
}

/* ── Ruido común (GLSL) ─────────────────────────────────────────────────── */
const RUIDO = /* glsl */ `
  float hash2(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash2(i), hash2(i + vec2(1.0, 0.0)), u.x), mix(hash2(i + vec2(0.0, 1.0)), hash2(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float s = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { s += a * vnoise(p); p = p * 2.03 + 17.1; a *= 0.5; }
    return s;
  }
  // ¿Está el punto (mundo; la Tierra en el origen) dentro del octante que se corta?
  bool enCorte(vec3 p, float k) { return p.x > k && p.y > k && p.z > k; }
`;

const VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vP;
  void main() {
    vUv = uv;
    vN = normalize(mat3(modelMatrix) * normal);
    vec4 p = modelMatrix * vec4(position, 1.0);
    vP = p.xyz;
    gl_Position = projectionMatrix * viewMatrix * p;
  }
`;

/* ── Superficie fotográfica ────────────────────────────────────────────── */
const FRAG_TIERRA = /* glsl */ `
  uniform sampler2D uDia;
  uniform sampler2D uNoche;
  uniform sampler2D uNubes;
  uniform sampler2D uOceano;
  uniform vec3 uSol;
  uniform float uDesfase;
  uniform float uCorte;     // esquina del octante cortado (mundo); ≥ 0.6·R = cerrado
  uniform float uVeg;       // cobertura vegetal 0.3–1
  uniform float uEstres;    // estrés de la vegetación 0–1 (calor + sequía)
  uniform float uAcido;     // acidificación del océano 0–1
  uniform float uHieloN;    // latitud del borde del hielo marino (grados)
  uniform float uHieloS;
  uniform float uHidro;     // realces por esfera 0–1
  uniform float uBio;
  uniform float uLito;
  uniform float uT;
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vP;
  ${RUIDO}
  void main() {
    if (enCorte(vP, uCorte)) discard;
    vec3 n = normalize(vN);
    vec3 v = normalize(cameraPosition - vP);
    float ndl = dot(n, uSol);
    vec3 dia = texture2D(uDia, vUv).rgb;
    vec3 noche = texture2D(uNoche, vUv).rgb;
    float nube = texture2D(uNubes, vec2(vUv.x - uDesfase, vUv.y)).r;
    float oceano = smoothstep(0.35, 0.65, texture2D(uOceano, vUv).r);
    float tierra = 1.0 - oceano;

    // ── Biosfera: la vegetación es lo verde de la foto, en tierra firme.
    float verde = clamp((dia.g - max(dia.r, dia.b * 1.05)) * 9.0 + 0.05, 0.0, 1.0) * tierra;
    // Claros de deforestación: ruido coherente; la fracción talada sigue a (1 − cobertura).
    float nr = clamp((fbm(vUv * vec2(180.0, 90.0)) - 0.47) * 3.2 + 0.5, 0.0, 1.0);
    float talado = smoothstep(uVeg - 0.035, uVeg + 0.035, nr) * verde;
    vec3 claro = vec3(0.56, 0.42, 0.28) * (0.75 + 0.5 * vnoise(vUv * 900.0));
    dia = mix(dia, dia * vec3(1.3, 1.02, 0.55), verde * uEstres * 0.7);
    dia = mix(dia, claro, talado);
    float vivo = verde * (1.0 - talado);

    // ── Hidrosfera: el CO₂ disuelto acidifica (verdoso); el hielo marino retrocede con el calor.
    dia = mix(dia, dia * vec3(0.7, 1.12, 0.95) + vec3(0.0, 0.025, 0.012), oceano * uAcido * 0.75);
    float lat = (vUv.y - 0.5) * 180.0;
    float borde = (fbm(vUv * vec2(40.0, 20.0)) - 0.5) * 9.0;
    float hielo = oceano * (smoothstep(uHieloN - 1.5, uHieloN + 1.5, lat + borde) + smoothstep(uHieloS - 1.5, uHieloS + 1.5, -lat + borde));
    dia = mix(dia, vec3(0.86, 0.92, 0.98), clamp(hielo, 0.0, 1.0) * 0.92);

    // ── Luz del día, crepúsculo y brillo del Sol en el agua.
    float luz = smoothstep(-0.06, 0.22, ndl);
    float difusa = max(ndl, 0.0);
    float crep = smoothstep(0.0, 0.18, ndl) * (1.0 - smoothstep(0.18, 0.45, ndl));
    vec3 colDia = dia * (difusa * 1.3 + 0.03);
    colDia *= mix(vec3(1.0), vec3(1.15, 0.78, 0.55), crep * 0.6);
    colDia *= 1.0 - nube * 0.3 * luz;
    vec3 h = normalize(uSol + v);
    float nh = max(dot(n, h), 0.0);
    float brillo = pow(nh, 140.0) * 0.7 + pow(nh, 20.0) * 0.07;
    colDia += vec3(1.0, 0.9, 0.72) * brillo * oceano * (1.0 - hielo) * (1.0 - nube) * luz;

    // ── Noche: luces de las ciudades.
    float noct = 1.0 - smoothstep(-0.18, 0.04, ndl);
    vec3 colNoche = noche * noche * vec3(2.8, 2.0, 1.2) * noct * (1.0 - nube * 0.85);
    vec3 col = colDia + colNoche;

    // ── Realces por esfera.
    float fres = pow(1.0 - max(dot(n, v), 0.0), 2.0);
    float onda = 0.8 + 0.4 * vnoise(vUv * vec2(700.0, 350.0) + vec2(uT * 0.4, -uT * 0.25));
    col += oceano * (1.0 - hielo) * uHidro * vec3(0.02, 0.15, 0.42) * (0.55 + fres) * onda * (0.35 + luz);
    col *= 1.0 - 0.35 * uHidro * tierra;
    col += vivo * uBio * vec3(0.04, 0.24, 0.07) * (0.35 + luz);
    col *= 1.0 - 0.3 * uBio * (1.0 - vivo);
    float gris = dot(col, vec3(0.3, 0.59, 0.11));
    col = mix(col, vec3(gris) * vec3(1.05, 0.98, 0.92), 0.55 * uLito) * (1.0 - 0.2 * uLito);

    // ── Atmósfera vista de canto.
    float fres2 = pow(1.0 - max(dot(n, v), 0.0), 2.5);
    float lado = smoothstep(-0.2, 0.5, ndl);
    col = mix(col, vec3(0.32, 0.58, 1.0) * (0.35 + difusa), fres2 * lado * 0.7);

    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const FRAG_NUBES = /* glsl */ `
  uniform sampler2D uNubes;
  uniform vec3 uSol;
  uniform float uCorte;
  uniform float uOpac;
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vP;
  ${RUIDO}
  void main() {
    if (enCorte(vP, uCorte)) discard;
    vec3 n = normalize(vN);
    float ndl = dot(n, uSol);
    float a = texture2D(uNubes, vUv).r;
    float luz = smoothstep(-0.1, 0.3, ndl);
    vec3 c = vec3(1.0, 0.99, 0.97) * (max(ndl, 0.0) * 1.15 + 0.03);
    c *= mix(vec3(1.0), vec3(1.2, 0.8, 0.6), (1.0 - smoothstep(0.0, 0.3, ndl)) * luz);
    gl_FragColor = vec4(c, a * (0.2 + 0.8 * luz) * 0.9 * uOpac);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const VERT_HALO = /* glsl */ `
  varying vec3 vNv;
  varying vec3 vN;
  void main() {
    vNv = normalize(normalMatrix * normal);
    vN = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/** Halo atmosférico: se tiñe de azul a naranja con el calentamiento (y de ocre con aerosoles volcánicos). */
const FRAG_HALO = /* glsl */ `
  uniform vec3 uSol;
  uniform vec3 uTinte;
  uniform float uFuerza;
  varying vec3 vNv;
  varying vec3 vN;
  void main() {
    float i = pow(max(0.0, 0.62 + dot(vNv, vec3(0.0, 0.0, 1.0))), 4.0);
    float lado = smoothstep(-0.35, 0.45, dot(normalize(vN), uSol));
    gl_FragColor = vec4(uTinte * i * (0.25 + lado) * uFuerza, 1.0);
  }
`;

/* ── Las caras del corte ───────────────────────────────────────────────────
 * Cada cara es un plano. El color sale del RADIO del punto (mundo), así que la
 * misma pieza sirve para las tres caras y sigue siendo correcta mientras el
 * corte se abre o se cierra. */
const VERT_CARA = /* glsl */ `
  varying vec3 vP;
  void main() {
    vec4 p = modelMatrix * vec4(position, 1.0);
    vP = p.xyz;
    gl_Position = projectionMatrix * viewMatrix * p;
  }
`;

const FRAG_CARA = /* glsl */ `
  uniform float uR;
  uniform float uT;
  uniform int uEje;        // 0: plano x · 1: plano y · 2: plano z
  uniform float uCeldas;   // multiplicador angular de las celdas de convección
  uniform float uAtmos;    // 0–1: casquete atmosférico exagerado
  uniform float uAbre;     // 0–1: cuánto está abierto el corte
  uniform float uLito;     // realce del interior
  uniform float uCalor;    // 0–1: la troposfera se calienta
  uniform float uLuz;      // sombreado de la cara según el Sol (da volumen al corte)
  varying vec3 vP;
  ${RUIDO}
  float banda(float r, float b) { return 1.0 - smoothstep(0.0, fwidth(r) * 1.6, abs(r - b)); }
  void main() {
    float r = length(vP) / uR;
    vec2 q = uEje == 0 ? vP.zy : (uEje == 1 ? vP.xz : vP.xy);
    float a = atan(max(q.y, 0.0), max(q.x, 0.0));      // 0 … π/2 en la cara
    float grano = fbm(q * 14.0 / uR + float(uEje) * 7.0);

    // ── Fuera de la Tierra: la atmósfera, exagerada.
    if (r > 1.0) {
      float alt = r - 1.0;
      if (uAtmos < 0.01 || alt > ${ALT_ATMOS.termo.toFixed(3)}) discard;
      vec3 c; float al;
      vec3 tropo = mix(vec3(0.38, 0.70, 1.0), vec3(1.0, 0.52, 0.30), uCalor);
      if (alt < ${ALT_ATMOS.tropo.toFixed(3)}) { c = tropo; al = 0.62; }
      else if (alt < ${ALT_ATMOS.estrato.toFixed(3)}) {
        float oz = step(${ALT_ATMOS.ozonoBase.toFixed(3)}, alt) * (1.0 - step(${ALT_ATMOS.ozonoTope.toFixed(3)}, alt));
        c = mix(vec3(0.32, 0.42, 0.95), vec3(0.62, 0.48, 1.0), oz); al = mix(0.46, 0.62, oz);
      }
      else if (alt < ${ALT_ATMOS.meso.toFixed(3)}) { c = vec3(0.20, 0.30, 0.80); al = 0.38; }
      else { c = vec3(0.50, 0.28, 0.78); al = 0.30 * (1.0 - smoothstep(0.25, ${ALT_ATMOS.termo.toFixed(3)}, alt)); }
      float lin = max(max(banda(alt, ${ALT_ATMOS.tropo.toFixed(3)}), banda(alt, ${ALT_ATMOS.estrato.toFixed(3)})), banda(alt, ${ALT_ATMOS.meso.toFixed(3)}));
      c = mix(c, vec3(0.92, 0.96, 1.0), lin * 0.7);
      al = max(al, lin * 0.8);
      // los bordes laterales del casquete se desvanecen
      float lados = smoothstep(0.0, 0.08, a) * smoothstep(0.0, 0.08, 1.5708 - a);
      gl_FragColor = vec4(c * (0.85 + 0.3 * grano), al * uAtmos * uAbre * lados);
      #include <colorspace_fragment>
      return;
    }

    vec3 col;
    float s = clamp((r - ${R_NUCLEO_EXTERNO.toFixed(4)}) / (${R_LITOSFERA.toFixed(3)} - ${R_NUCLEO_EXTERNO.toFixed(4)}), 0.0, 1.0);
    if (r < ${R_NUCLEO_INTERNO.toFixed(4)}) {
      // Núcleo interno: sólido e incandescente (lo único que pasa del umbral del bloom).
      float k = r / ${R_NUCLEO_INTERNO.toFixed(4)};
      col = mix(vec3(1.9, 1.65, 1.15), vec3(1.35, 0.85, 0.32), k * k) * (0.94 + 0.12 * grano);
    } else if (r < ${R_NUCLEO_EXTERNO.toFixed(4)}) {
      // Núcleo externo: hierro líquido que se arremolina.
      vec2 p = vec2(a * 5.0, r * 9.0);
      float w = fbm(p + vec2(uT * 0.05, -uT * 0.07) + 1.6 * fbm(p * 1.7 - uT * 0.04));
      float k = (r - ${R_NUCLEO_INTERNO.toFixed(4)}) / (${R_NUCLEO_EXTERNO.toFixed(4)} - ${R_NUCLEO_INTERNO.toFixed(4)});
      col = mix(vec3(1.0, 0.62, 0.16), vec3(0.78, 0.32, 0.06), k) * (0.62 + 0.55 * w);
    } else if (r < ${R_LITOSFERA.toFixed(3)}) {
      // Manto: celdas de convección. Cada celda es un remolino (las vecinas giran al revés):
      // la roca caliente sube por un lado, se enfría bajo la litosfera y baja por el otro.
      float ph = a * uCeldas / 3.14159;               // 0 … nº de celdas
      float celda = floor(ph);
      float xc = fract(ph);
      float sentido = mod(celda, 2.0) < 0.5 ? 1.0 : -1.0;
      float psi = sin(3.14159 * xc) * sin(3.14159 * s);           // función de corriente: lazos cerrados
      float caliente = -cos(3.14159 * xc) * sentido * sqrt(max(sin(3.14159 * s), 0.0)); // + donde sube
      vec3 hondo = vec3(0.70, 0.22, 0.06), alto = vec3(0.34, 0.075, 0.03);
      vec3 base = mix(hondo, alto, s);
      if (r > ${R_ASTENOSFERA.toFixed(4)}) base = mix(base, vec3(0.62, 0.30, 0.09), 0.6);   // astenósfera: plástica
      col = base * (1.0 + 0.45 * caliente) * (0.86 + 0.26 * grano);
      // líneas de corriente con un pulso que da la vuelta (el flujo, animado)
      float q5 = psi * 4.0;
      float dl = abs(fract(q5 + 0.5) - 0.5) / max(fwidth(q5), 1e-4);
      float linea = 1.0 - smoothstep(0.6, 1.6, dl);
      float ang = atan(s - 0.5, xc - 0.5);
      float g = fract(ang / 6.28318 * 2.0 - uT * 0.11 * sentido + floor(q5) * 0.31);
      float cometa = pow(g, 3.0);
      float dentro = smoothstep(0.04, 0.12, psi);
      col += mix(vec3(0.9, 0.42, 0.12), vec3(1.0, 0.78, 0.42), cometa) * linea * dentro * (0.12 + (0.55 + 0.25 * uLito) * cometa);
    } else if (r < ${R_CORTEZA.toFixed(3)}) {
      col = vec3(0.30, 0.19, 0.13) * (0.8 + 0.4 * grano);                 // manto litosférico (rígido)
    } else {
      col = vec3(0.56, 0.47, 0.38) * (0.7 + 0.5 * grano);                 // corteza
    }
    // límites entre capas: un filo oscuro, como en las láminas
    float filo = max(max(banda(r, ${R_NUCLEO_INTERNO.toFixed(4)}), banda(r, ${R_NUCLEO_EXTERNO.toFixed(4)})),
                     max(banda(r, ${R_LITOSFERA.toFixed(3)}), banda(r, ${R_CORTEZA.toFixed(3)})));
    col *= 1.0 - filo * 0.6;
    col *= uLuz * (0.9 + 0.15 * uLito);
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

function repetirEnX(t: THREE.Texture | THREE.Texture[]) {
  const lista = Array.isArray(t) ? t : [t];
  for (const x of lista) {
    x.wrapS = THREE.RepeatWrapping;
    x.anisotropy = 8;
    x.needsUpdate = true;
  }
}

/** Valores a los que tiende la Tierra (se amortiguan cuadro a cuadro). */
export interface MetaTierra {
  abre: number;     // 0 cerrado · 1 corte abierto
  atmos: number;    // 0–1 casquete atmosférico
  hidro: number; bio: number; lito: number;
  veg: number;      // 0.3–1
  estres: number;   // 0–1
  acido: number;    // 0–1
  hieloN: number; hieloS: number;
  calor: number;    // 0–1 (tinte de la atmósfera)
  aerosol: number;  // 0–1 (velo de SO₂ volcánico)
}

const amort = (x: number, meta: number, dt: number, l = 3) => THREE.MathUtils.damp(x, meta, l, dt);

/**
 * La Tierra fotográfica con su corte. Está en el origen y NO gira (el corte y
 * los procesos se anclan a lugares reales); las nubes sí se desplazan.
 */
export function TierraCorte({ radio, dirSol, meta, pausado, corteRef, segmentos = 128 }: {
  radio: number; dirSol: THREE.Vector3; meta: MetaTierra; pausado: boolean;
  /** Aquí se publica, cuadro a cuadro, la esquina del corte (para que otras piezas lo respeten). */
  corteRef?: RefObject<number>;
  segmentos?: number;
}) {
  const dia = useTexturaEspacio("tierraDia");
  const noche = useTexturaEspacio("tierraNoche");
  const nubes = useTexture(rutaTextura("tierraNubes"), repetirEnX);
  const oceano = useTexture(rutaTextura("tierraOceanos"));

  const uTierra = useMemo(() => ({
    uDia: { value: dia }, uNoche: { value: noche }, uNubes: { value: nubes }, uOceano: { value: oceano },
    uSol: { value: dirSol }, uDesfase: { value: 0 }, uCorte: { value: radio }, uVeg: { value: 1 }, uEstres: { value: 0 },
    uAcido: { value: 0 }, uHieloN: { value: 70 }, uHieloS: { value: 60 }, uHidro: { value: 0 }, uBio: { value: 0 },
    uLito: { value: 0 }, uT: { value: 0 },
  }), [dia, noche, nubes, oceano, dirSol, radio]);
  const uNubes = useMemo(() => ({ uNubes: { value: nubes }, uSol: { value: dirSol }, uCorte: { value: radio }, uOpac: { value: 1 } }), [nubes, dirSol, radio]);
  const uHalo = useMemo(() => ({ uSol: { value: dirSol }, uTinte: { value: new THREE.Color(0.3, 0.56, 1.0) }, uFuerza: { value: 2.2 } }), [dirSol]);
  const uCaras = useMemo(() => [0, 1, 2].map((eje) => ({
    uR: { value: radio }, uT: { value: 0 }, uEje: { value: eje }, uCeldas: { value: eje === 1 ? 8 : 6 },
    uAtmos: { value: 0 }, uAbre: { value: 0 }, uLito: { value: 0 }, uCalor: { value: 0 },
    uLuz: { value: 0.62 + 0.38 * Math.max(0, eje === 0 ? dirSol.x : eje === 1 ? dirSol.y : dirSol.z) },
  })), [radio, dirSol]);

  const caras = useRef<(THREE.Mesh | null)[]>([null, null, null]);
  const capaNubes = useRef<THREE.Mesh>(null);
  const nucleo = useRef<THREE.Mesh>(null);
  const matT = useRef<THREE.ShaderMaterial>(null);
  const matN = useRef<THREE.ShaderMaterial>(null);
  const matH = useRef<THREE.ShaderMaterial>(null);
  const est = useRef({ abre: 0, atmos: 0, hidro: 0, bio: 0, lito: 0, veg: 1, estres: 0, acido: 0, hieloN: 70, hieloS: 60, calor: 0, aerosol: 0, t: 0 });
  const azul = useMemo(() => new THREE.Color(0.3, 0.56, 1.0), []);
  const naranja = useMemo(() => new THREE.Color(1.0, 0.45, 0.22), []);
  const ocre = useMemo(() => new THREE.Color(0.95, 0.78, 0.45), []);

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const e = est.current;
    e.abre = amort(e.abre, meta.abre, dt, 2.2);
    e.atmos = amort(e.atmos, meta.atmos, dt, 2.5);
    e.hidro = amort(e.hidro, meta.hidro, dt);
    e.bio = amort(e.bio, meta.bio, dt);
    e.lito = amort(e.lito, meta.lito, dt);
    e.veg = amort(e.veg, meta.veg, dt, 4);
    e.estres = amort(e.estres, meta.estres, dt);
    e.acido = amort(e.acido, meta.acido, dt);
    e.hieloN = amort(e.hieloN, meta.hieloN, dt, 2);
    e.hieloS = amort(e.hieloS, meta.hieloS, dt, 2);
    e.calor = amort(e.calor, meta.calor, dt);
    e.aerosol = amort(e.aerosol, meta.aerosol, dt);
    if (!pausado) e.t += dt;

    // Corte: la esquina del octante va de 0 (abierto) a 0.6·R (nada cortado).
    const k = radio * 0.6 * (1 - e.abre);
    if (corteRef) corteRef.current = k;
    const rm = radio * (1 + ALT_ATMOS.termo + 0.01);
    // Los uniformes se escriben en el MATERIAL (R3F no conserva el objeto que se le pasa).
    const u = matT.current?.uniforms;
    if (u) {
      u.uCorte!.value = k; u.uVeg!.value = e.veg; u.uEstres!.value = e.estres; u.uAcido!.value = e.acido;
      u.uHieloN!.value = e.hieloN; u.uHieloS!.value = e.hieloS; u.uHidro!.value = e.hidro; u.uBio!.value = e.bio;
      u.uLito!.value = e.lito; u.uT!.value = e.t;
    }
    const un = matN.current?.uniforms;
    if (un) {
      un.uCorte!.value = k;
      un.uOpac!.value = 1 - 0.55 * Math.max(e.lito, e.bio * 0.6);
    }
    const uh = matH.current?.uniforms;
    if (uh) {
      (uh.uTinte!.value as THREE.Color).copy(azul).lerp(naranja, e.calor * 0.45).lerp(ocre, e.aerosol * 0.3);
      uh.uFuerza!.value = 2.2 + e.atmos * 0.8;
    }

    const c = (k + rm) / 2;
    const lado = Math.max(1e-3, rm - k);
    for (let i = 0; i < 3; i++) {
      const m = caras.current[i];
      if (!m) continue;
      const uc = (m.material as THREE.ShaderMaterial).uniforms;
      uc.uT!.value = e.t; uc.uAtmos!.value = i === 2 ? e.atmos : 0; uc.uAbre!.value = e.abre; uc.uLito!.value = e.lito; uc.uCalor!.value = e.calor;
      m.visible = e.abre > 0.005;
      m.scale.set(lado, lado, 1);
      if (i === 0) m.position.set(k, c, c);
      else if (i === 1) m.position.set(c, k, c);
      else m.position.set(c, c, k);
    }
    if (nucleo.current) nucleo.current.visible = e.abre > 0.02;

    const n = capaNubes.current;
    if (n && !pausado) {
      n.rotation.y += dt * 0.01;
      if (u) u.uDesfase!.value = n.rotation.y / (2 * Math.PI);
    }
  });

  return (
    <group>
      <mesh>
        <sphereGeometry args={[radio, segmentos, segmentos / 2]} />
        <shaderMaterial ref={matT} vertexShader={VERT} fragmentShader={FRAG_TIERRA} uniforms={uTierra} />
      </mesh>
      <mesh ref={capaNubes} scale={1.008} raycast={() => null}>
        <sphereGeometry args={[radio, segmentos, segmentos / 2]} />
        <shaderMaterial ref={matN} vertexShader={VERT} fragmentShader={FRAG_NUBES} uniforms={uNubes} transparent depthWrite={false} />
      </mesh>
      <mesh scale={1.06} raycast={() => null}>
        <sphereGeometry args={[radio, 64, 32]} />
        <shaderMaterial ref={matH} vertexShader={VERT_HALO} fragmentShader={FRAG_HALO} uniforms={uHalo}
          side={THREE.BackSide} blending={THREE.AdditiveBlending} transparent depthWrite={false} />
      </mesh>

      {/* Las tres caras del corte (plano x, plano y, plano z). */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} ref={(m) => { caras.current[i] = m; }} rotation={i === 0 ? [0, Math.PI / 2, 0] : i === 1 ? [-Math.PI / 2, 0, 0] : [0, 0, 0]}
          raycast={() => null} renderOrder={1} visible={false}>
          <planeGeometry args={[1, 1, 1, 1]} />
          <shaderMaterial vertexShader={VERT_CARA} fragmentShader={FRAG_CARA} uniforms={uCaras[i]} side={THREE.DoubleSide} transparent />
        </mesh>
      ))}

      {/* Núcleo interno: la esquina de la bola asoma en el corte (emisivo → bloom). */}
      <mesh ref={nucleo} raycast={() => null} visible={false}>
        <sphereGeometry args={[radio * R_NUCLEO_INTERNO * 0.995, 48, 24]} />
        <meshStandardMaterial color="#ffe2a0" emissive="#ffb84a" emissiveIntensity={1.7} roughness={0.5} />
      </mesh>
    </group>
  );
}
