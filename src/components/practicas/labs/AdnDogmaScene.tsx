"use client";

/**
 * Escena 3D del laboratorio "El dogma central de la biología molecular"
 * (CNEYT-VI-P04). Tres procesos sobre la MISMA secuencia del alumno, dentro de
 * un tramo de cromosoma (el gen + ADN vecino atenuado):
 *
 *  - replicacion:   doble hélice B a escala (dextrógira, 10.5 pb por vuelta,
 *                   surco mayor y menor). La helicasa abre la horquilla; la ADN
 *                   polimerasa con su abrazadera copia la hebra adelantada de
 *                   forma continua y la rezagada en fragmentos de Okazaki (con
 *                   cebador de ARN y ligasa que sella el hueco). Los
 *                   nucleótidos libres llegan volando a emparejarse.
 *  - transcripcion: la ARN polimerasa (cortada para ver dentro) abre una
 *                   burbuja, lee la hebra molde y suelta un ARNm con U.
 *  - traduccion:    ribosoma (subunidad menor + mayor, cortado) que lee codón a
 *                   codón; los ARNt llegan al sitio A con su aminoácido, la
 *                   cadena pasa del sitio P, el ribosoma avanza y el ARNt sale
 *                   por E. La cadena sale por el túnel y se pliega; en el codón
 *                   de paro entra el factor de liberación y la proteína se suelta.
 *
 * El paso del laboratorio (entero) se persigue con un avance continuo, así que
 * la animación ES el paso: pausa, paso a paso y arrastre la controlan.
 * Toda animación ocurre en useFrame mutando refs y búferes (sin memoria nueva).
 */

import * as THREE from "three";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, PerformanceMonitor } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Escenario, calidadEscena } from "./_escenario";
import { type Modo, type Base, type CodonInfo, BASE_COLOR, complementoADN, CODON_INICIO } from "./adn-dogma-data";
import {
  B_RADIO,
  B_SUBIDA,
  B_GIRO,
  B_SURCO,
  FLANCO_IZQ,
  FLANCO_DER,
  OKAZAKI_PB,
  HEBRA_COLOR,
  anticodon,
  esPurina,
} from "./adn-dogma-modelo";
import {
  Pincel,
  Moleculas,
  TuboDinamico,
  Tubo,
  Letras,
  LetrasSprites,
  Etiqueta,
  Fondo,
  geometriaProteina,
  useCorteHaciaCamara,
  texturaHalo,
  SuperficieGranulada,
  Citoplasma,
  suave,
  clamp01,
  mezclar,
  easeInOut,
  hash,
  R_CUENTA,
  R_TUBO,
} from "./adn-dogma-kit3d";

export interface AdnDogmaSceneProps {
  modo: Modo;
  codificante: string; // hebra codificante (sentido) 5'→3'
  molde: string; // hebra molde (antiparalela)
  arnm: string; // ARN mensajero
  codones: CodonInfo[]; // resultado de la traducción
  progreso: number; // paso actual (índice)
  total: number; // pasos totales del modo
  playing: boolean;
  accent: string;
  modoColor: string;
  resetNonce: number;
  /** Habilita arrastrar la maquinaria (helicasa/ARN polimerasa/ribosoma). */
  arrastrable?: boolean;
  /** Arrastrar la maquinaria fija el paso del proceso. */
  onScrub?: (paso: number) => void;
  /** Se llama al tomar la maquinaria (para el sonido). */
  onGrab?: () => void;
  /** Multiplicador del ritmo de la animación (el del laboratorio). */
  velocidad?: number;
  /** La cámara sigue a la maquinaria. */
  guiada?: boolean;
  /** Ya arrastró una vez: se quita la pista «arrástrala». */
  yaArrastro?: boolean;
}

/* ── Constantes y scratch del módulo ───────────────────────────────────── */
const SUB = 4; // muestras del esqueleto por par de bases
const DSEP = 1.6; // separación de las dos moléculas hijas
const OFF_PLACA = R_CUENTA * 0.55;
const GAP_PAR = 0.12; // hueco entre las dos placas de un par (ahí van los puentes H)

type V = { x: number; y: number; z: number };
const v3 = (): V => ({ x: 0, y: 0, z: 0 });
const _P = [v3(), v3(), v3(), v3()];
const _Q = v3();
const _A = v3();
const _B = v3();
const _cam = new THREE.Vector3();
const _w = new THREE.Vector3();

const _colBase = new Map<string, THREE.Color>();
const _gris = new THREE.Color("#5b6b80");
function colBase(b: string, tenue: boolean): THREE.Color {
  const k = b + (tenue ? "~" : "");
  let c = _colBase.get(k);
  if (!c) {
    c = new THREE.Color(BASE_COLOR[b as Base] ?? "#ffffff");
    if (tenue) c.lerp(_gris, 0.5).multiplyScalar(0.72);
    _colBase.set(k, c);
  }
  return c;
}
const _colHebra = new Map<string, THREE.Color>();
function colHex(hex: string, k = 1): THREE.Color {
  const key = `${hex}|${k}`;
  let c = _colHebra.get(key);
  if (!c) {
    c = new THREE.Color(hex).multiplyScalar(k);
    _colHebra.set(key, c);
  }
  return c;
}

/** Persigue el paso entero con velocidad constante (la animación ES el paso). */
function perseguir(v: number, obj: number, dt: number, vel: number): number {
  const d = obj - v;
  const paso = Math.min(dt, 0.1) * vel * 1.3 * Math.max(1, Math.abs(d) * 1.6);
  if (Math.abs(d) <= paso) return obj;
  return v + Math.sign(d) * paso;
}

/** Punta de una placa: P + û·(offset + largo). */
function punta(P: V, ux: number, uy: number, uz: number, largo: number, o: V) {
  const L = Math.hypot(ux, uy, uz) || 1;
  const k = (OFF_PLACA + largo) / L;
  o.x = P.x + ux * k;
  o.y = P.y + uy * k;
  o.z = P.z + uz * k;
}
function largoPlaca(cuerda: number, b: string): number {
  const disp = Math.max(0.25, cuerda - 2 * OFF_PLACA - GAP_PAR);
  return disp * (esPurina(b as Base) ? 0.56 : 0.44);
}
const nPuentes = (b: string) => (b === "G" || b === "C" ? 3 : 2);

/** Letra junto a la cara de la placa que mira a la cámara. */
function letraEnPlaca(letras: Letras, cam: THREE.Vector3, P: V, ux: number, uy: number, uz: number, largo: number, b: string, op = 1) {
  const L = Math.hypot(ux, uy, uz) || 1;
  const k = (OFF_PLACA + largo * 0.5) / L;
  _w.set(P.x + ux * k, P.y + uy * k, P.z + uz * k);
  _cam.copy(cam).sub(_w).normalize().multiplyScalar(0.17);
  letras.poner(_w.x + _cam.x, _w.y + _cam.y, _w.z + _cam.z, b, 0.34, op);
}

/* ── Asa de arrastre (área de captura + halo que late) ─────────────────── */
const _planoArr = new THREE.Plane();
const _dirArr = new THREE.Vector3();
const _hitArr = new THREE.Vector3();
const _posArr = new THREE.Vector3();
function Asa({ radio, accent, aPaso, onScrub, onGrab, setArrastrando, pista = true }: { pista?: boolean; radio: number; accent: string; aPaso: (x: number) => number; onScrub?: (p: number) => void; onGrab?: () => void; setArrastrando: (v: boolean) => void }) {
  const drag = useRef(false);
  const halo = useRef<THREE.Sprite>(null);
  const texHalo = useMemo(() => texturaHalo(), []);
  const [hover, setHover] = useState(false);
  const camera = useThree((s) => s.camera);
  useFrame((s) => {
    if (!halo.current) return;
    const k = radio * 2.6 * (hover || drag.current ? 1.08 : 1) * (1 + Math.sin(s.clock.elapsedTime * 2.4) * 0.05);
    halo.current.scale.set(k, k, 1);
  });
  const mover = (e: ThreeEvent<PointerEvent>) => {
    e.eventObject.getWorldPosition(_posArr);
    camera.getWorldDirection(_dirArr);
    _planoArr.setFromNormalAndCoplanarPoint(_dirArr, _posArr);
    if (!e.ray.intersectPlane(_planoArr, _hitArr)) return;
    onScrub?.(aPaso(_hitArr.x));
  };
  return (
    <group>
      {/* halo radial suave (sin borde): dice «esto se toma» sin dibujar una línea */}
      <sprite ref={halo} renderOrder={-1}>
        <spriteMaterial map={texHalo} color={accent} transparent opacity={hover ? 0.5 : pista ? 0.26 : 0.1} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <mesh
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
        onPointerDown={(e) => {
          e.stopPropagation();
          (e.target as Element).setPointerCapture?.(e.pointerId);
          drag.current = true;
          setArrastrando(true);
          onGrab?.();
          mover(e);
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          e.stopPropagation();
          mover(e);
        }}
        onPointerUp={(e) => {
          drag.current = false;
          setArrastrando(false);
          (e.target as Element).releasePointerCapture?.(e.pointerId);
        }}
      >
        <sphereGeometry args={[radio * 1.05, 16, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

interface MundoProps {
  codificante: string;
  arnm: string;
  codones: CodonInfo[];
  progreso: number;
  total: number;
  velocidad: number;
  ligero: boolean;
  accent: string;
  foco: RefObject<THREE.Vector3>;
  arrastrable: boolean;
  yaArrastro: boolean;
  onScrub?: (p: number) => void;
  onGrab?: () => void;
  setArrastrando: (v: boolean) => void;
}

/* Materiales de proteína (PBR: superficie molecular satinada). */
function MatProteina({ color, corte, rugosidad = 0.5 }: { color: string; corte?: THREE.Plane; rugosidad?: number }) {
  return (
    <meshPhysicalMaterial
      color={color}
      roughness={rugosidad}
      metalness={0.02}
      clearcoat={0.35}
      clearcoatRoughness={0.4}
      sheen={0.8}
      sheenRoughness={0.45}
      sheenColor="#ffffff"
      side={corte ? THREE.DoubleSide : THREE.FrontSide}
      clippingPlanes={corte ? [corte] : undefined}
    />
  );
}

/* ══ REPLICACIÓN ═══════════════════════════════════════════════════════ */
function MundoReplicacion(p: MundoProps) {
  const { codificante, progreso, total, velocidad, ligero, accent, foco, arrastrable, yaArrastro, onScrub, onGrab, setArrastrando } = p;
  const n = codificante.length;
  const FL = FLANCO_IZQ.length;
  const s1 = FLANCO_IZQ + codificante + FLANCO_DER;
  const N = s1.length;
  const s2 = s1.split("").map((b) => complementoADN(b as Base)).join("");
  const L = OKAZAKI_PB;
  const NL = ligero ? 10 : 34;

  const pincel = useMemo(() => new Pincel(N * 4 + NL * 3 + 8), [N, NL]);
  const tubos = useMemo(() => [0, 1, 2, 3].map(() => new TuboDinamico(N * SUB + 1, ligero ? 7 : 10)), [N, ligero]);
  const letras = useMemo(() => new Letras(26), []);
  const geoLobulo = useMemo(() => geometriaProteina(3.7, 4, 0.06, 2), []);
  const geoPol = useMemo(() => geometriaProteina(8.1, 4, 0.08, 4), []);
  const geoLig = useMemo(() => geometriaProteina(5.3, 3, 0.12, 3), []);

  const av = useRef(progreso);
  const helicasa = useRef<THREE.Group>(null);
  const rotor = useRef<THREE.Group>(null);
  const polB = useRef<THREE.Group>(null);
  const polA = useRef<THREE.Group>(null);
  const ligasa = useRef<THREE.Group>(null);
  const etqHelice = useRef<THREE.Group>(null);
  const polAx = useRef(Number.NaN);
  const ligX = useRef(Number.NaN);
  const camera = useThree((s) => s.camera);

  const X = (j: number) => (j - FL - n / 2) * B_SUBIDA;
  const pos = (h: number, j: number, f: number, o: V) => {
    const op = suave(-0.4, 2.8, f - j);
    const arriba = h === 0 || h === 2;
    const cy = (arriba ? DSEP : -DSEP) * op;
    const cz = (arriba ? -0.3 : 0.3) * op;
    const ang = j * B_GIRO + (h === 0 || h === 3 ? 0 : B_SURCO);
    o.x = X(j);
    o.y = cy + B_RADIO * Math.cos(ang);
    o.z = cz + B_RADIO * Math.sin(ang);
  };
  const fs = (k: number) => (k + 1) * L + 1.3;
  const alfaLead = (j: number, f: number) => clamp01(f - 2.0 - j);
  const alfaLag = (j: number, f: number) => {
    const k = Math.floor(j / L);
    return clamp01(f - fs(k) - ((k + 1) * L - 1 - j));
  };
  const sellado = (k: number, f: number) => f >= fs(k + 1) + L + 0.8;
  const aPaso = (x: number) => Math.max(0, Math.min(total, Math.round(x / B_SUBIDA + n / 2)));

  useFrame((st, dt) => {
    const t = st.clock.elapsedTime;
    av.current = perseguir(av.current, progreso, dt, velocidad);
    const f = FL + av.current;

    /* esqueletos */
    for (let h = 0; h < 4; h++) {
      const tb = tubos[h]!;
      const base = h === 0 ? HEBRA_COLOR.codificante : h === 1 ? HEBRA_COLOR.molde : HEBRA_COLOR.nueva;
      for (let s = 0; s < tb.S; s++) {
        const j = -0.4 + (s / (tb.S - 1)) * (N - 0.2);
        pos(h, j, f, _A);
        let r = s === 0 || s === tb.S - 1 ? 0 : R_TUBO;
        const enGen = j >= FL - 0.5 && j < FL + n - 0.5;
        let col = colHex(base, enGen ? 1 : 0.62);
        if (h >= 2) {
          const j0 = Math.max(0, Math.floor(j)), j1 = Math.min(N - 1, Math.ceil(j));
          const al = h === 2 ? Math.min(alfaLag(j0, f), alfaLag(j1, f)) : Math.min(alfaLead(j0, f), alfaLead(j1, f));
          r *= suave(0.55, 1, al);
          if (h === 2) {
            const kb = Math.round((j + 0.5) / L);
            if (kb >= 1 && Math.abs(j - (kb * L - 0.5)) < 0.16 && !sellado(kb - 1, f)) r = 0;
            const jr = Math.min(N - 1, Math.max(0, Math.round(j)));
            const k = Math.floor(jr / L);
            if ((k + 1) * L - 1 - jr <= 1 && !sellado(k, f)) col = colHex(HEBRA_COLOR.cebador);
          }
        }
        tb.poner(s, _A.x, _A.y, _A.z, r, col);
      }
      tb.actualizar();
    }

    /* nucleótidos y puentes */
    pincel.inicio();
    letras.inicio();
    for (let j = 0; j < N; j++) {
      const enGen = j >= FL && j < FL + n;
      for (let h = 0; h < 4; h++) pos(h, j, f, _P[h]!);
      const aLag = alfaLag(j, f);
      const aLead = alfaLead(j, f);
      const cerca = Math.abs(j - f) < 3.6;
      for (let h = 0; h < 4; h++) {
        const al = h < 2 ? 1 : h === 2 ? aLag : aLead;
        if (al <= 0) continue;
        const socio = h === 0 ? 2 : h === 1 ? 3 : h === 2 ? 0 : 1;
        const P = _P[h]!, Q = _P[socio]!;
        const ux = Q.x - P.x;
        let uy = Q.y - P.y, uz = Q.z - P.z;
        const cuerda = Math.hypot(ux, uy, uz);
        const b = h === 0 || h === 3 ? s1[j]! : s2[j]!;
        const largo = largoPlaca(cuerda, b);
        let px = P.x, py = P.y, pz = P.z;
        if (al < 1) {
          // llega volando desde el nucleoplasma, girando
          const e = easeInOut(al);
          const lejos = (1 - e) * 3.2;
          const arriba = h === 2 ? 1 : -1;
          px += (hash(j * 7 + h) - 0.5) * 2 * lejos;
          py += arriba * (0.6 + hash(j * 3 + h)) * lejos;
          pz += (0.4 + hash(j * 5 + h)) * lejos;
          const g = (1 - e) * 5;
          const cy = Math.cos(g), sy = Math.sin(g);
          const ny = uy * cy - uz * sy, nz = uy * sy + uz * cy;
          uy = ny;
          uz = nz;
        }
        let cuenta = colHex(h === 0 ? HEBRA_COLOR.codificante : h === 1 ? HEBRA_COLOR.molde : HEBRA_COLOR.nueva, enGen ? 1.15 : 0.7);
        if (h === 2) {
          const k = Math.floor(j / L);
          if ((k + 1) * L - 1 - j <= 1 && !sellado(k, f)) cuenta = colHex(HEBRA_COLOR.cebador, 1.1);
        }
        _Q.x = px; _Q.y = py; _Q.z = pz;
        pincel.nucleotido(px, py, pz, ux, uy, uz, 1, 0, 0, largo, colBase(b, !enGen), al < 1 ? 0.75 + 0.25 * al : 1, cuenta);
        if (letras.n < letras.cap && ((h < 2 && cerca) || (h >= 2 && al > 0.2 && Math.abs(j - f) < 4.5)))
          letraEnPlaca(letras, camera.position, _Q, ux, uy, uz, largo, b, enGen ? 1 : 0.6);
      }
      // puentes de hidrógeno
      const bp = s1[j]!;
      const nH = nPuentes(bp);
      const brillo = enGen ? 1 : 0.5;
      const parental = suave(0.35, -0.15, f - j);
      if (parental > 0) {
        const P0 = _P[0]!, P1 = _P[1]!;
        const ux = P1.x - P0.x, uy = P1.y - P0.y, uz = P1.z - P0.z;
        const c = Math.hypot(ux, uy, uz);
        punta(P0, ux, uy, uz, largoPlaca(c, s1[j]!), _A);
        punta(P1, -ux, -uy, -uz, largoPlaca(c, s2[j]!), _B);
        pincel.puentesH(_A.x, _A.y, _A.z, _B.x, _B.y, _B.z, 1, 0, 0, nH, brillo * parental);
      }
      for (let h = 0; h < 2; h++) {
        if ((h === 0 ? aLag : aLead) < 0.999) continue;
        const P0 = _P[h]!, P1 = _P[h + 2]!;
        const ux = P1.x - P0.x, uy = P1.y - P0.y, uz = P1.z - P0.z;
        const c = Math.hypot(ux, uy, uz);
        punta(P0, ux, uy, uz, largoPlaca(c, h === 0 ? s1[j]! : s2[j]!), _A);
        punta(P1, -ux, -uy, -uz, largoPlaca(c, h === 0 ? s2[j]! : s1[j]!), _B);
        pincel.puentesH(_A.x, _A.y, _A.z, _B.x, _B.y, _B.z, 1, 0, 0, nH, brillo);
      }
    }

    /* desoxinucleótidos libres (con su trifosfato) */
    const xf = X(f);
    for (let i = 0; i < NL; i++) {
      const rr = 4.2 + hash(i * 1.3) * 3.6;
      const ang = hash(i * 3.1) * Math.PI * 2 + t * 0.07 * (hash(i * 7.7) - 0.5) * 2;
      const px = xf + (hash(i * 2.9) - 0.5) * 20 + Math.sin(t * 0.3 + i) * 0.5;
      const py = rr * Math.cos(ang);
      const pz = rr * Math.sin(ang) * 0.5 - 3.6 - hash(i * 9.1) * 3;
      const ux = Math.cos(t * 0.6 + i), uy = Math.sin(t * 0.8 + i * 2), uz = 0.35;
      const b = "ATGC"[i % 4]!;
      pincel.nucleotido(px, py, pz, ux, uy, uz, 0, 0, 1, esPurina(b as Base) ? 0.6 : 0.46, colBase(b, true), 0.42, FOSFATO_LIBRE);
      const Lu = Math.hypot(ux, uy, uz);
      for (let k = 1; k <= 2; k++) pincel.esfera(px - (ux / Lu) * 0.14 * k, py - (uy / Lu) * 0.14 * k, pz - (uz / Lu) * 0.14 * k, R_CUENTA * 0.4, FOSFATO_LIBRE);
    }
    pincel.fin();
    letras.fin();

    /* maquinaria */
    if (helicasa.current) helicasa.current.position.set(X(f + 0.4), 0, 0);
    if (rotor.current) rotor.current.rotation.x = t * 1.4;
    const hL = f - 2.0;
    const opB = suave(-0.4, 2.8, f - hL);
    if (polB.current) polB.current.position.set(X(hL), -DSEP * opB, 0.3 * opB);
    // rezagada: fragmento activo
    const kA = Math.max(0, Math.floor((f - 1.3) / L) - 1);
    const rb = Math.min(L - 0.5, Math.max(0, f - fs(kA)));
    const headA = (kA + 1) * L - 1 - rb + 0.5;
    const xA = X(headA);
    polAx.current = Number.isNaN(polAx.current) ? xA : mezclar(polAx.current, xA, 1 - Math.exp(-dt * 6));
    const opA = suave(-0.4, 2.8, f - headA);
    if (polA.current) polA.current.position.set(polAx.current, DSEP * Math.max(opA, 0.85), -0.3 * Math.max(opA, 0.85));
    // ligasa: en el hueco más reciente entre un fragmento terminado y el anterior
    let kn = -1;
    for (let k = Math.floor(f / L); k >= 1; k--) {
      if (f >= fs(k) + L && !sellado(k - 1, f)) {
        kn = k;
        break;
      }
    }
    if (ligasa.current) {
      ligasa.current.visible = kn >= 1;
      if (kn >= 1) {
        const xl = X(kn * L - 0.5);
        ligX.current = Number.isNaN(ligX.current) ? xl : mezclar(ligX.current, xl, 1 - Math.exp(-dt * 5));
        ligasa.current.position.set(ligX.current, DSEP + 1.25, -0.5);
        ligasa.current.rotation.y = t * 0.6;
      }
    }
    if (etqHelice.current) etqHelice.current.position.set(X(f + 7), 0, 0);
    foco.current.set(X(f) - 0.8, 0, 0);
  });

  const pista = arrastrable && !yaArrastro;
  return (
    <group>
      <Moleculas pincel={pincel} />
      {tubos.map((tb, i) => <Tubo key={i} tubo={tb} />)}
      <LetrasSprites letras={letras} />

      {/* Helicasa: anillo hexamérico que abre la doble hélice */}
      <group ref={helicasa}>
        <group ref={rotor}>
          {[0, 1, 2, 3, 4, 5].map((k) => {
            const a = (k / 6) * Math.PI * 2;
            return (
              <group key={k} position={[0, Math.cos(a) * 1.62, Math.sin(a) * 1.62]}>
                <SuperficieGranulada geo={geoLobulo} escala={ESC_LOBULO} color={k % 2 ? "#d9b77e" : "#cfa86c"} n={ligero ? 70 : 220} radio={0.05} semilla={10 + k} />
              </group>
            );
          })}
        </group>
        <group position={[0, 2.75, 0]}>
          <Etiqueta col="#f2b441cc">
            <i className="fa-solid fa-scissors" style={{ color: "#f2b441" }} /> {pista ? "Helicasa · arrástrala ↔" : "Helicasa: abre la horquilla"}
          </Etiqueta>
        </group>
        {arrastrable && <Asa radio={2.35} accent={accent} aPaso={aPaso} onScrub={onScrub} onGrab={onGrab} setArrastrando={setArrastrando} pista={pista} />}
      </group>

      {/* ADN polimerasa + abrazadera en la hebra ADELANTADA (hija de abajo) */}
      <group ref={polB}>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[1.45, 0.17, 14, 48]} />
          <MatProteina color="#cbd5e1" rugosidad={0.35} />
        </mesh>
        <group position={[0.45, -1.55, -0.55]}>
          <SuperficieGranulada geo={geoPol} escala={ESC_POL_B} color="#9aa6d6" n={ligero ? 280 : 850} radio={0.07} semilla={20} />
        </group>
        <group position={[0.4, -2.55, 0]}>
          <Etiqueta col="#7c9cffcc">
            <i className="fa-solid fa-pen-fancy" style={{ color: "#9db3ff" }} /> ADN polimerasa · hebra adelantada
          </Etiqueta>
        </group>
      </group>

      {/* ADN polimerasa en la hebra REZAGADA (hija de arriba) */}
      <group ref={polA}>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[1.45, 0.17, 14, 48]} />
          <MatProteina color="#cbd5e1" rugosidad={0.35} />
        </mesh>
        <group position={[-0.45, 1.55, -0.55]}>
          <SuperficieGranulada geo={geoPol} escala={ESC_POL_A} color="#9aa6d6" n={ligero ? 280 : 850} radio={0.07} semilla={21} />
        </group>
        <group position={[-2.2, 2.35, 0]}>
          <Etiqueta col={`${HEBRA_COLOR.cebador}cc`}>
            <i className="fa-solid fa-puzzle-piece" style={{ color: HEBRA_COLOR.cebador }} /> Hebra rezagada: fragmentos de Okazaki
          </Etiqueta>
        </group>
      </group>

      {/* Ligasa: sella el hueco entre fragmentos */}
      <group ref={ligasa} visible={false}>
        <SuperficieGranulada geo={geoLig} escala={ESC_LIG} color="#d6a3b8" n={ligero ? 90 : 260} radio={0.06} semilla={30} />
      </group>

      {/* La doble hélice que aún no se abre */}
      <group ref={etqHelice}>
        <group position={[0, 2.0, 0]}>
          <Etiqueta col="rgba(143,187,227,0.8)">
            <i className="fa-solid fa-dna" style={{ color: HEBRA_COLOR.codificante }} /> 10.5 pares por vuelta · surcos mayor y menor
          </Etiqueta>
        </group>
      </group>
    </group>
  );
}

/* ══ TRANSCRIPCIÓN ═════════════════════════════════════════════════════ */
const RC_ARN = 2.7; // radio del rizo del ARNm que sale
const PHI0 = (210 * Math.PI) / 180;
const PASO_ARN = 0.5;

function MundoTranscripcion(p: MundoProps) {
  const { codificante, arnm, progreso, total, velocidad, ligero, accent, foco, arrastrable, yaArrastro, onScrub, onGrab, setArrastrando } = p;
  const n = codificante.length;
  const FL = FLANCO_IZQ.length;
  const s1 = FLANCO_IZQ + codificante + FLANCO_DER;
  const N = s1.length;
  const s2 = s1.split("").map((b) => complementoADN(b as Base)).join("");
  const NL = ligero ? 10 : 30;

  const pincel = useMemo(() => new Pincel(N * 2 + n + NL + 8), [N, n, NL]);
  const tubos = useMemo(() => [new TuboDinamico(N * SUB + 1, ligero ? 7 : 10), new TuboDinamico(N * SUB + 1, ligero ? 7 : 10), new TuboDinamico(Math.max(2, n * SUB + 1), ligero ? 7 : 10)], [N, n, ligero]);
  const letras = useMemo(() => new Letras(26), []);
  const geoPol = useMemo(() => geometriaProteina(2.2, 5, 0.05, 5), []);

  const av = useRef(progreso);
  const libera = useRef(0);
  const pol = useRef<THREE.Group>(null);
  const etqBurbuja = useRef<THREE.Group>(null);
  const etqArn = useRef<THREE.Group>(null);
  const etqMolde = useRef<THREE.Group>(null);
  const corte = useCorteHaciaCamara(pol, 0.15);
  const camera = useThree((s) => s.camera);

  const X = (j: number) => (j - FL - n / 2) * B_SUBIDA;
  const abierto = (j: number, b: number, rel: number) => suave(b + 3.6, b + 1.3, j) * suave(b - 10.6, b - 8.3, j) * (1 - rel);
  const pos = (h: number, j: number, b: number, rel: number, o: V) => {
    const ob = abierto(j, b, rel);
    const ang = j * B_GIRO + (h === 1 ? B_SURCO : 0);
    o.x = X(j);
    if (h === 0) {
      o.y = B_RADIO * Math.cos(ang) + 1.45 * ob;
      o.z = B_RADIO * Math.sin(ang) - 0.85 * ob;
    } else {
      o.y = B_RADIO * Math.cos(ang) - 0.3 * ob;
      o.z = B_RADIO * Math.sin(ang) + 0.25 * ob;
    }
  };
  /* ARN: híbrido con la molde dentro de la burbuja; fuera, rizo que sale. */
  const posArn = (j: number, b: number, rel: number, t: number, o: V, dir: V) => {
    const ob = abierto(j, b, rel);
    const ang = j * B_GIRO;
    const hx = X(j), hy = B_RADIO * Math.cos(ang) - 0.3 * ob, hz = B_RADIO * Math.sin(ang) + 0.25 * ob;
    // dirección hacia la molde (para la placa)
    const am = ang + B_SURCO;
    const mx = hx, my = B_RADIO * Math.cos(am) - 0.3 * ob, mz = B_RADIO * Math.sin(am) + 0.25 * ob;
    const jx = b - 8.4;
    const e = jx + 9.5 * rel - j;
    const w = suave(0, 1.5, e);
    if (w <= 0) {
      o.x = hx; o.y = hy; o.z = hz;
      dir.x = mx - hx; dir.y = my - hy; dir.z = mz - hz;
      return;
    }
    // punto de salida (híbrido en jx)
    const a0 = jx * B_GIRO;
    const q0x = X(jx), q0y = B_RADIO * Math.cos(a0) - 0.3, q0z = B_RADIO * Math.sin(a0) + 0.25;
    const ee = Math.max(0, e);
    const u = (ee * PASO_ARN) / RC_ARN;
    const ex = q0x + RC_ARN * (Math.cos(PHI0 - u) - Math.cos(PHI0)) + rel * 0.5;
    const ey = q0y + RC_ARN * (Math.sin(PHI0 - u) - Math.sin(PHI0)) + 0.14 * Math.sin(ee * 1.3 + t * 1.6) * w + rel * 1.6;
    const ez = q0z + 0.15 * ee + 0.12 * Math.cos(ee * 1.1 + t * 1.3) * w;
    o.x = mezclar(hx, ex, w);
    o.y = mezclar(hy, ey, w);
    o.z = mezclar(hz, ez, w);
    // en el rizo, las bases miran al centro del rizo
    const cx = q0x - RC_ARN * Math.cos(PHI0), cy = q0y - RC_ARN * Math.sin(PHI0);
    dir.x = mezclar(mx - hx, cx - ex, w);
    dir.y = mezclar(my - hy, cy - ey, w);
    dir.z = mezclar(mz - hz, 0, w);
  };
  const aPaso = (x: number) => Math.max(0, Math.min(total, Math.round(x / B_SUBIDA + n / 2 + 3)));

  useFrame((st, dt) => {
    const t = st.clock.elapsedTime;
    av.current = perseguir(av.current, progreso, dt, velocidad);
    const a = av.current;
    const b = FL + a;
    libera.current = n > 0 && a >= n - 0.001 ? Math.min(1, libera.current + dt * 0.45) : Math.max(0, libera.current - dt * 2);
    const rel = easeInOut(libera.current);

    /* esqueletos del ADN */
    for (let h = 0; h < 2; h++) {
      const tb = tubos[h]!;
      for (let s = 0; s < tb.S; s++) {
        const j = -0.4 + (s / (tb.S - 1)) * (N - 0.2);
        pos(h, j, b, rel, _A);
        const enGen = j >= FL - 0.5 && j < FL + n - 0.5;
        tb.poner(s, _A.x, _A.y, _A.z, s === 0 || s === tb.S - 1 ? 0 : R_TUBO, colHex(h === 0 ? HEBRA_COLOR.codificante : HEBRA_COLOR.molde, enGen ? 1 : 0.62));
      }
      tb.actualizar();
    }
    /* esqueleto del ARN */
    const ta = tubos[2]!;
    for (let s = 0; s < ta.S; s++) {
      const j = FL - 0.35 + (s / Math.max(1, ta.S - 1)) * Math.max(0, n - 0.3);
      posArn(j, b, rel, t, _A, _B);
      const j1 = Math.min(FL + n - 1, Math.ceil(j));
      const al = clamp01(b - j1);
      const r = s === 0 || s === ta.S - 1 ? 0 : R_TUBO * 1.05 * suave(0.55, 1, al);
      ta.poner(s, _A.x, _A.y, _A.z, r, colHex(HEBRA_COLOR.arn));
    }
    ta.actualizar();

    pincel.inicio();
    letras.inicio();
    for (let j = 0; j < N; j++) {
      const enGen = j >= FL && j < FL + n;
      pos(0, j, b, rel, _P[0]!);
      pos(1, j, b, rel, _P[1]!);
      const ob = abierto(j, b, rel);
      const P0 = _P[0]!, P1 = _P[1]!;
      // dirección de cada base: hacia su pareja del ADN (cerrado) o hacia el ARN (burbuja)
      const dx = P1.x - P0.x, dy = P1.y - P0.y, dz = P1.z - P0.z;
      const c = Math.hypot(dx, dy, dz);
      const c0 = 2 * B_RADIO * Math.sin(B_SURCO / 2);
      const lc = largoPlaca(c0, s1[j]!), lm = largoPlaca(c0, s2[j]!);
      // hebra codificante: en la burbuja apunta hacia abajo, lejos del híbrido
      pincel.nucleotido(P0.x, P0.y, P0.z, mezclar(dx, 0, ob), mezclar(dy, -1, ob), mezclar(dz, 0.4, ob), 1, 0, 0, lc, colBase(s1[j]!, !enGen), 1, colHex(HEBRA_COLOR.codificante, enGen ? 1.15 : 0.7));
      // hebra molde
      let mx = -dx, my = -dy, mz = -dz;
      const enHibrido = enGen && j < b && ob > 0.3;
      if (enHibrido) {
        posArn(j, b, rel, t, _Q, _B);
        mx = _Q.x - P1.x; my = _Q.y - P1.y; mz = _Q.z - P1.z;
      }
      pincel.nucleotido(P1.x, P1.y, P1.z, mx, my, mz, 1, 0, 0, lm, colBase(s2[j]!, !enGen), 1, colHex(HEBRA_COLOR.molde, enGen ? 1.15 : 0.7));
      // puentes del ADN cerrado
      if (ob < 0.25 && c < c0 * 1.25) {
        punta(P0, dx, dy, dz, lc, _A);
        punta(P1, -dx, -dy, -dz, lm, _B);
        pincel.puentesH(_A.x, _A.y, _A.z, _B.x, _B.y, _B.z, 1, 0, 0, nPuentes(s1[j]!), (enGen ? 1 : 0.5) * (1 - ob * 4));
      }
      if (letras.n < letras.cap && enGen && Math.abs(j - b + 4) < 5.5) letraEnPlaca(letras, camera.position, P1, mx, my, mz, lm, s2[j]!, 1);
    }
    /* el ARNm */
    for (let i = 0; i < n; i++) {
      const j = FL + i;
      const al = clamp01(b - j);
      if (al <= 0) continue;
      posArn(j, b, rel, t, _A, _B);
      const ru = arnm[i] ?? "U";
      let px = _A.x, py = _A.y, pz = _A.z;
      if (al < 1) {
        const e = easeInOut(al), lejos = (1 - e) * 3;
        px += (hash(j * 3) - 0.3) * lejos;
        py += -(0.5 + hash(j * 5)) * lejos;
        pz += (0.6 + hash(j * 7)) * lejos;
      }
      const lr = largoPlaca(2 * B_RADIO * Math.sin(B_SURCO / 2), ru);
      _Q.x = px; _Q.y = py; _Q.z = pz;
      pincel.nucleotido(px, py, pz, _B.x, _B.y, _B.z, 1, 0, 0, lr, colBase(ru, false), al < 1 ? 0.75 + 0.25 * al : 1, colHex(HEBRA_COLOR.arn, 1.1));
      // puentes ARN–ADN en el híbrido
      const ob = abierto(j, b, rel);
      if (al >= 0.999 && ob > 0.6 && b - j < 9) {
        pos(1, j, b, rel, _P[1]!);
        const P1 = _P[1]!;
        const ux = P1.x - px, uy = P1.y - py, uz = P1.z - pz;
        punta(_Q, ux, uy, uz, lr, _A);
        punta(P1, -ux, -uy, -uz, largoPlaca(2 * B_RADIO * Math.sin(B_SURCO / 2), s2[j]!), _P[2]!);
        pincel.puentesH(_A.x, _A.y, _A.z, _P[2]!.x, _P[2]!.y, _P[2]!.z, 1, 0, 0, nPuentes(s2[j]!), 1);
      }
      if (letras.n < letras.cap && (b - j < 13 || ru === "U")) letraEnPlaca(letras, camera.position, _Q, _B.x, _B.y, _B.z, lr, ru, 1);
    }
    /* ribonucleótidos libres (con U, no T) */
    const xb = X(b);
    for (let i = 0; i < NL; i++) {
      const rr = 4.3 + hash(i * 1.9) * 3.4;
      const ang = hash(i * 4.1) * Math.PI * 2 + t * 0.08 * (hash(i * 6.3) - 0.5) * 2;
      const px = xb + (hash(i * 2.3) - 0.5) * 20;
      const py = rr * Math.cos(ang) - 0.5;
      const pz = rr * Math.sin(ang) * 0.5 - 3.8 - hash(i * 9.7) * 3;
      const ux = Math.cos(t * 0.5 + i), uy = Math.sin(t * 0.7 + i * 2), uz = 0.3;
      const bb = "AUGC"[i % 4]!;
      pincel.nucleotido(px, py, pz, ux, uy, uz, 0, 0, 1, esPurina(bb as Base) ? 0.6 : 0.46, colBase(bb, true), 0.42, FOSFATO_LIBRE);
    }
    pincel.fin();
    letras.fin();

    if (pol.current) {
      pol.current.position.set(X(b - 3.2), 0.3 + rel * 3.2, 0.1);
      pol.current.scale.setScalar(1 - 0.25 * rel);
    }
    if (etqBurbuja.current) etqBurbuja.current.position.set(X(b + 4.2), -1.9, 0);
    if (etqMolde.current) etqMolde.current.position.set(X(b + 11), 1.75, 0);
    if (etqArn.current) {
      posArn(FL, b, rel, t, _A, _B);
      etqArn.current.position.set(_A.x, _A.y + 0.75, _A.z);
    }
    foco.current.set(X(b - 3.5), 0.9 + rel * 1.2, 0);
  });

  const pista = arrastrable && !yaArrastro;
  return (
    <group>
      <Moleculas pincel={pincel} />
      {tubos.map((tb, i) => <Tubo key={i} tubo={tb} />)}
      <LetrasSprites letras={letras} />
      <group ref={pol}>
        <SuperficieGranulada geo={geoPol} escala={ESC_ARNP} color="#a99cc9" corte={corte} n={ligero ? 1100 : 3200} radio={0.135} semilla={2} />
        <group position={[0, 2.75, 0]}>
          <Etiqueta col="#a78bfacc">
            <i className="fa-solid fa-pen-nib" style={{ color: "#c4b5fd" }} /> {pista ? "ARN polimerasa · arrástrala ↔" : "ARN polimerasa"}
          </Etiqueta>
        </group>
        {arrastrable && <Asa radio={2.6} accent={accent} aPaso={(x) => aPaso(x)} onScrub={onScrub} onGrab={onGrab} setArrastrando={setArrastrando} pista={pista} />}
      </group>
      <group ref={etqBurbuja}>
        <Etiqueta col="rgba(185,168,230,0.8)">Burbuja de transcripción</Etiqueta>
      </group>
      <group ref={etqMolde}>
        <Etiqueta col="rgba(185,168,230,0.8)">{"Hebra molde 3'→5'"}</Etiqueta>
      </group>
      <group ref={etqArn}>
        {progreso >= 3 && <Etiqueta col={`${HEBRA_COLOR.arn}cc`}>
          <span style={{ color: HEBRA_COLOR.arn }}>{"ARNm 5'"}</span> · U en lugar de T
        </Etiqueta>}
      </group>
    </group>
  );
}

/* ══ TRADUCCIÓN ════════════════════════════════════════════════════════ */
const S_ARN = 0.46; // separación entre nucleótidos del ARNm
const Y_ARN = -0.45;
const L_PLACA_ARN = 0.4;
const Y_AC = Y_ARN + 2 * (OFF_PLACA + L_PLACA_ARN) + GAP_PAR; // esqueleto del anticodón
const N_TRNA = 5;
// escalas de las envolventes de las proteínas (superficie granulada)
const ESC_MENOR: [number, number, number] = [2.55, 0.95, 1.65];
const ESC_MAYOR: [number, number, number] = [2.8, 1.7, 1.95];
const ESC_ARNP: [number, number, number] = [3.15, 2.2, 2.1];
const ESC_LOBULO: [number, number, number] = [0.5, 0.4, 0.4];
const ESC_POL_B: [number, number, number] = [1.05, 0.8, 0.95];
const ESC_POL_A: [number, number, number] = [0.95, 0.75, 0.9];
const ESC_LIG: [number, number, number] = [0.62, 0.62, 0.62];
const UTR5 = "GAACUCAG";
const UTR3 = "GCAAAAAAAA";
const RF_COLOR = new THREE.Color("#94a3b8");
const PAL_AA = ["#f59e0b", "#38bdf8", "#a855f7", "#fb7185", "#a3e635", "#60a5fa"] as const;
const PAL_NT = ["#34d399", "#f87171", "#fbbf24", "#38bdf8", "#fb923c"] as const;
const FOSFATO_LIBRE = new THREE.Color("#8a96a8");
const TRNA_COLOR = new THREE.Color("#fda4af");
const ACC_LOCAL: V = { x: -1.62, y: 2.2, z: 0.1 }; // extremo aceptor (CCA-3')

function geometriaTRNA(): THREE.TubeGeometry {
  const S = S_ARN;
  const pts = [
    [-1.45, 2.02, 0.12], [-0.95, 1.95, 0.14], [-0.4, 1.86, 0.14], [0.06, 1.68, 0.1], [0.2, 1.18, 0.08], [0.22, 0.62, 0.06],
    [S * 1.15, 0.18, 0.02], [S, 0, 0], [0, -0.03, 0], [-S, 0, 0], [-S * 1.15, 0.18, -0.02],
    [-0.22, 0.62, -0.06], [-0.2, 1.18, -0.08], [-0.12, 1.55, -0.12], [-0.42, 1.72, -0.14], [-0.95, 1.8, -0.12], [-1.4, 1.9, -0.08],
  ].map(([x, y, z]) => new THREE.Vector3(x, y, z));
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.4), 96, 0.11, 10, false);
}

function MundoTraduccion(p: MundoProps) {
  const { arnm, codones, progreso, total, velocidad, ligero, accent, foco, arrastrable, yaArrastro, onScrub, onGrab, setArrastrando } = p;
  // el ARNm maduro lleva extremos sin traducir: 5' UTR y cola poli-A (atenuados)
  const arnV = UTR5 + arnm + UTR3;
  const m = arnV.length;
  const start = UTR5.length + Math.max(0, arnm.indexOf(CODON_INICIO));
  const nC = codones.length;
  const NAA = codones.filter((c) => !c.paro).length;

  const pincel = useMemo(() => new Pincel(m + N_TRNA * 3 + NAA + 8), [m, NAA]);
  const tuboArn = useMemo(() => new TuboDinamico(Math.max(2, m * SUB + 1), ligero ? 7 : 10), [m, ligero]);
  const tuboPep = useMemo(() => new TuboDinamico(Math.max(2, (Math.max(NAA, 1) - 1) * 6 + 2), 8), [NAA]);
  const letras = useMemo(() => new Letras(30), []);
  const geoTRNA = useMemo(() => geometriaTRNA(), []);
  const geoCodo = useMemo(() => geometriaProteina(1.9, 3, 0.1, 3), []);
  const geoMenor = useMemo(() => geometriaProteina(4.4, 5, 0.05, 5), []);
  const geoMayor = useMemo(() => geometriaProteina(6.6, 5, 0.06, 6), []);

  const av = useRef(progreso);
  const libera = useRef(0);
  const ribo = useRef<THREE.Group>(null);
  const menor = useRef<THREE.Group>(null);
  const mayor = useRef<THREE.Group>(null);
  const trnas = useRef<(THREE.Group | null)[]>([]);
  const etqTrna = useRef<THREE.Group>(null);
  const etqPep = useRef<THREE.Group>(null);
  const corte = useCorteHaciaCamara(ribo, 0.35);
  const camera = useThree((s) => s.camera);
  const aaPos = useRef<Float32Array>(new Float32Array(Math.max(1, NAA) * 3));

  const X = (i: number) => (i - start - 1) * S_ARN;
  const aPaso = (x: number) => Math.max(0, Math.min(total, Math.round(x / (3 * S_ARN))));

  // índice de codón (no-paro) → índice de aminoácido en la cadena
  const aaDe = useMemo(() => {
    const r: number[] = [];
    let k = 0;
    for (const c of codones) r.push(c.paro ? -1 : k++);
    return r;
  }, [codones]);

  useFrame((st, dt) => {
    const t = st.clock.elapsedTime;
    av.current = perseguir(av.current, progreso, dt, velocidad);
    const pc = av.current;
    const k0 = Math.floor(pc), fr = pc - k0;
    let rA: number;
    if (nC === 0) rA = 0;
    else if (k0 >= nC) rA = codones[nC - 1]!.paro ? nC - 1 : nC;
    else rA = codones[k0]!.paro ? k0 : k0 + suave(0.6, 1, fr);
    const xA = X(start + 3 * rA + 1);
    const ultimoParo = nC > 0 && codones[nC - 1]!.paro;
    const lamParo = ultimoParo ? pc - (nC - 1) : -1;
    libera.current = lamParo >= 0.6 ? Math.min(1, libera.current + dt * 0.5) : Math.max(0, libera.current - dt * 2);
    const rel = easeInOut(libera.current);
    const rc = xA - 3 * S_ARN; // centro del ribosoma (sitio P)

    if (ribo.current) ribo.current.position.set(rc, 0, 0);
    if (menor.current) menor.current.position.set(-0.1 - rel * 0.5, -1.35 - rel * 1.0, -rel * 0.8);
    if (mayor.current) mayor.current.position.set(0.15 + rel * 0.5, 2.2 + rel * 1.0, -rel * 0.8);

    /* ARNm */
    const foot = (x: number) => suave(2.9, 4.6, Math.abs(x - rc));
    for (let s = 0; s < tuboArn.S; s++) {
      const i = -0.4 + (s / (tuboArn.S - 1)) * (m - 0.2);
      const x = (i - start - 1) * S_ARN;
      const fo = foot(x);
      const y = Y_ARN + 0.22 * Math.sin(0.8 * x + 1.2 * t) * fo;
      const z = 0.3 * Math.cos(0.55 * x + t * 0.9) * fo;
      const cod = Math.floor((i + 0.5 - start) / 3);
      const tono = i >= start - 0.5 && cod % 2 === 0 ? 1.1 : 0.85;
      tuboArn.poner(s, x, y, z, s === 0 || s === tuboArn.S - 1 ? 0 : R_TUBO, colHex(HEBRA_COLOR.arn, tono));
    }
    tuboArn.actualizar();

    pincel.inicio();
    letras.inicio();
    for (let i = 0; i < m; i++) {
      const x = X(i);
      const fo = foot(x);
      const y = Y_ARN + 0.22 * Math.sin(0.8 * x + 1.2 * t) * fo;
      const z = 0.3 * Math.cos(0.55 * x + t * 0.9) * fo;
      const b = arnV[i] ?? "A";
      const marco = i >= start && i < start + 3 * nC;
      const cod = Math.floor((i - start) / 3);
      const enSitio = marco && Math.abs(cod - rA) < 1.6 && rel < 0.5;
      pincel.nucleotido(x, y, z, 0, 1, 0, 1, 0, 0, L_PLACA_ARN, colBase(b, !marco), 1, colHex(HEBRA_COLOR.arn, 1.1));
      _Q.x = x; _Q.y = y; _Q.z = z;
      if (letras.n < letras.cap && Math.abs(x - xA) < 4.2) letraEnPlaca(letras, camera.position, _Q, 0, 1, 0, L_PLACA_ARN, b, enSitio || !marco ? 1 : 0.8);
    }

    /* ARNt (y factor de liberación) */
    let slot = 0;
    for (let k = 0; k < nC && slot < N_TRNA; k++) {
      const lam = pc - k;
      const paro = codones[k]!.paro;
      const fin = paro ? 9 : 2.7;
      if (lam < 0 || lam > fin) continue;
      const g = trnas.current[slot++];
      if (!g) continue;
      const sx = X(start + 3 * k + 1);
      let ox = sx, oy = Y_AC, oz = 0, esc = 1;
      if (lam < 0.45) {
        const e = easeInOut(lam / 0.45);
        ox += (1 - e) * 2.6;
        oy += (1 - e) * 3.4;
        oz -= (1 - e) * 1.6;
      } else if (!paro && lam > 2.0) {
        const e = easeInOut(clamp01((lam - 2.0) / 0.7));
        ox -= e * 2.6;
        oy += e * 3.2;
        oz -= e * 2.2;
        esc = 1 - e * 0.95;
      }
      oy += rel * 2.6;
      esc *= 1 - rel;
      g.visible = esc > 0.03;
      g.position.set(ox, oy, oz);
      g.scale.setScalar(Math.max(0.001, esc));
      const cuerpo = g.children[0] as THREE.Mesh | undefined;
      if (cuerpo) (cuerpo.material as THREE.MeshPhysicalMaterial).color.copy(paro ? RF_COLOR : TRNA_COLOR);
      // anticodón (no en el factor de liberación)
      if (!paro && esc > 0.05) {
        const ac = anticodon(codones[k]!.codon);
        for (let q = 0; q < 3; q++) {
          const ax = ox + (q - 1) * S_ARN * esc;
          const bb = ac[q] ?? "A";
          pincel.nucleotido(ax, oy, oz, 0, -1, 0, 1, 0, 0, L_PLACA_ARN * esc, colBase(bb, false), esc, TRNA_COLOR);
          _Q.x = ax; _Q.y = oy; _Q.z = oz;
          if (letras.n < letras.cap && lam > 0.3 && lam < 2.0) letraEnPlaca(letras, camera.position, _Q, 0, -1, 0, L_PLACA_ARN, bb, 1);
        }
        // puentes codón–anticodón cuando está acoplado
        if (lam >= 0.42 && lam <= 2.05 && rel < 0.2) {
          const codon = codones[k]!.codon;
          for (let q = 0; q < 3; q++) {
            const ax = ox + (q - 1) * S_ARN;
            pincel.puentesH(ax, Y_ARN + OFF_PLACA + L_PLACA_ARN, 0, ax, oy - OFF_PLACA - L_PLACA_ARN, 0, 0, 0, 1, nPuentes(codon[q] ?? "A"), 1);
          }
        }
      }
      if (k === Math.min(progreso, nC - 1) && etqTrna.current) {
        // la etiqueta espera en el sitio A (no viaja con el ARNt que llega)
        etqTrna.current.position.set(sx + 0.4, Y_AC + 2.75 + rel * 2.6, 0);
      }
    }
    for (let s = slot; s < N_TRNA; s++) {
      const g = trnas.current[s];
      if (g) g.visible = false;
    }

    /* aminoácidos y cadena polipeptídica */
    const T0x = rc - 1.15, T0y = 3.05, T0z = 0.25;
    const dTx = -0.28, dTy = 0.95, dTz = 0.14; // túnel de salida
    const pasoAA = 0.44;
    const nTun = 4;
    const Ex = T0x + dTx * pasoAA * nTun, Ey = T0y + dTy * pasoAA * nTun, Ez = T0z + dTz * pasoAA * nTun;
    const beta = (k: number) => (codones[k] && !codones[k]!.paro ? suave(0.45, 0.6, pc - k) : 0);
    let iN = -1;
    for (let k = 0; k < nC; k++) if (!codones[k]!.paro && pc - k >= 0) iN = k;
    const ap = aaPos.current;
    let nVis = 0;
    const gm = Math.max(1, iN + 1);
    const radG = 0.3 * Math.cbrt(gm) + 0.25;
    for (let k = 0; k <= iN; k++) {
      const ai = aaDe[k]!;
      if (ai < 0) continue;
      const lam = pc - k;
      // posición del extremo aceptor de SU ARNt
      const sx = X(start + 3 * k + 1);
      let ox = sx, oy = Y_AC, oz = 0;
      if (lam < 0.45) {
        const e = easeInOut(lam / 0.45);
        ox += (1 - e) * 2.6;
        oy += (1 - e) * 3.4;
        oz -= (1 - e) * 1.6;
      }
      const accx = ox + ACC_LOCAL.x, accy = oy + ACC_LOCAL.y, accz = oz + ACC_LOCAL.z;
      let sAfter = 0;
      for (let j = k + 1; j <= iN; j++) sAfter += beta(j);
      let x: number, y: number, z: number;
      if (sAfter <= 0) {
        x = accx; y = accy; z = accz;
      } else if (sAfter < 1) {
        x = mezclar(accx, T0x, sAfter); y = mezclar(accy, T0y, sAfter); z = mezclar(accz, T0z, sAfter);
      } else {
        const u = sAfter - 1;
        if (u <= nTun) {
          x = T0x + dTx * pasoAA * u; y = T0y + dTy * pasoAA * u; z = T0z + dTz * pasoAA * u;
        } else {
          // fuera del túnel: hélice alfa (3.6 residuos por vuelta) cuyo eje se curva
          const v = u - nTun;
          const th = (0.18 * v) / 1.1;
          const axx = Ex - 1.1 * Math.sin(th);
          const axy = Ey + 0.065 * v;
          const axz = Ez + 1.1 * (1 - Math.cos(th));
          const ang = v * ((100 * Math.PI) / 180);
          x = axx + 0.32 * Math.sin(ang) * Math.sin(th);
          y = axy + 0.32 * Math.cos(ang);
          z = axz + 0.32 * Math.sin(ang) * Math.cos(th);
        }
      }
      // la proteína liberada se pliega en un glóbulo
      if (rel > 0) {
        const gi = ai + 0.5;
        const phi = Math.acos(1 - (2 * gi) / gm);
        const th = Math.PI * (1 + Math.sqrt(5)) * gi + t * 0.25;
        // la proteína plegada flota al frente del ribosoma que se separa
        const gx = rc + 0.2 + radG * Math.sin(phi) * Math.cos(th);
        const gy = 2.0 + radG * Math.cos(phi);
        const gz = 2.4 + radG * Math.sin(phi) * Math.sin(th);
        x = mezclar(x, gx, rel); y = mezclar(y, gy, rel); z = mezclar(z, gz, rel);
      }
      // vibración térmica
      x += 0.04 * Math.sin(t * 2.1 + ai * 1.7);
      y += 0.04 * Math.sin(t * 1.7 + ai * 2.3);
      ap[ai * 3] = x; ap[ai * 3 + 1] = y; ap[ai * 3 + 2] = z;
      nVis = Math.max(nVis, ai + 1);
      const amino = codones[k]!.amino;
      pincel.esfera(x, y, z, 0.27, colHex(amino.color));
    }
    // enlace peptídico: tubo entre aminoácidos ya unidos
    const SEG = 6;
    for (let s = 0; s < tuboPep.S; s++) {
      const u = s / SEG;
      const i0 = Math.min(Math.floor(u), Math.max(0, NAA - 2));
      const f = u - i0;
      const i1 = Math.min(i0 + 1, NAA - 1);
      let r = 0;
      if (i1 < nVis && i0 !== i1) {
        // ¿está unido i1? (su codón ya formó el enlace)
        let kk = -1;
        for (let k = 0; k < nC; k++) if (aaDe[k] === i1) kk = k;
        r = kk >= 0 ? 0.075 * suave(0.3, 0.8, beta(kk)) : 0;
      }
      const ax = ap[i0 * 3] ?? 0, ay = ap[i0 * 3 + 1] ?? 0, az = ap[i0 * 3 + 2] ?? 0;
      const bx = ap[i1 * 3] ?? ax, by = ap[i1 * 3 + 1] ?? ay, bz = ap[i1 * 3 + 2] ?? az;
      tuboPep.poner(s, mezclar(ax, bx, Math.min(1, f)), mezclar(ay, by, Math.min(1, f)), mezclar(az, bz, Math.min(1, f)), s === 0 || s === tuboPep.S - 1 ? 0 : r, colHex(HEBRA_COLOR.peptido));
    }
    tuboPep.actualizar();

    pincel.fin();
    letras.fin();

    if (etqPep.current) {
      etqPep.current.position.set(ap[0] ?? 0, (ap[1] ?? 0) + 0.95, ap[2] ?? 0);
    }
    foco.current.set(rc - 0.3 + rel * 0.4, 1.3 + rel * 0.5, rel * 1.2);
  });

  const cod = codones[Math.min(progreso, Math.max(0, nC - 1))];
  const cadena = codones.slice(0, progreso).filter((c) => !c.paro).map((c) => c.amino.abr);
  const pista = arrastrable && !yaArrastro;
  return (
    <group>
      <Moleculas pincel={pincel} brilloCuentas={0.9} />
      <Tubo tubo={tuboArn} />
      <Tubo tubo={tuboPep} rugosidad={0.4} />
      <LetrasSprites letras={letras} />

      {Array.from({ length: N_TRNA }, (_, i) => (
        <group key={i} ref={(g) => { trnas.current[i] = g; }} visible={false}>
          <mesh geometry={geoTRNA}>
            <meshPhysicalMaterial color="#fda4af" roughness={0.38} clearcoat={0.6} clearcoatRoughness={0.25} sheen={0.5} />
          </mesh>
          <mesh geometry={geoCodo} position={[0.02, 1.74, 0]} scale={0.34}>
            <MatProteina color="#fb7185" />
          </mesh>
        </group>
      ))}

      <group ref={ribo}>
        <group ref={menor}>
          <SuperficieGranulada geo={geoMenor} escala={ESC_MENOR} color="#e8d8b4" corte={corte} n={ligero ? 520 : 1650} radio={0.125} semilla={4} />
          <group position={[1.2, -1.4, 0]}>
            <Etiqueta col="#f2d48fcc">Subunidad menor: lee el ARNm</Etiqueta>
          </group>
        </group>
        <group ref={mayor}>
          <SuperficieGranulada geo={geoMayor} escala={ESC_MAYOR} color="#9db4cf" corte={corte} n={ligero ? 800 : 2500} radio={0.135} semilla={6} />
          <group position={[1.6, 1.95, 0]}>
            <Etiqueta col="#8fb8e6cc">{pista ? "Ribosoma · arrástralo ↔" : "Subunidad mayor: une aminoácidos"}</Etiqueta>
          </group>
        </group>
        {arrastrable && (
          <group position={[3 * S_ARN, 0.6, 0]}>
            <Asa radio={2.9} accent={accent} aPaso={aPaso} onScrub={onScrub} onGrab={onGrab} setArrastrando={setArrastrando} pista={pista} />
          </group>
        )}
      </group>

      <group ref={etqTrna}>
        {cod && progreso < total && (
          <Etiqueta col={`${cod.amino.color}cc`}>
            {cod.paro ? <>Factor de liberación · {cod.codon} = paro</> : <>ARNt · anticodón {anticodon(cod.codon)} → <span style={{ color: cod.amino.color }}>{cod.amino.abr}</span></>}
          </Etiqueta>
        )}
      </group>
      <group ref={etqPep}>
        {progreso >= 1 && cadena.length > 0 && <Etiqueta col="rgba(226,232,240,0.7)">{progreso >= total && total > 0 ? "Proteína liberada: " : "Cadena: "}{cadena.join("-")}</Etiqueta>}
      </group>
    </group>
  );
}

/* ══ Cámara guiada ═════════════════════════════════════════════════════ */
const FOV = 42;
const DIR_CAM: Record<Modo, [number, number, number]> = {
  replicacion: [0.3, 0.26, 1],
  transcripcion: [-0.28, 0.24, 1],
  traduccion: [0.22, 0.16, 1],
};
const NECESITA: Record<Modo, { alto: number; ancho: number }> = {
  replicacion: { alto: 7.4, ancho: 12.5 },
  transcripcion: { alto: 7.8, ancho: 12 },
  traduccion: { alto: 7.8, ancho: 10.5 },
};

function CamaraGuiada({ modo, foco, guiada, controles }: { modo: Modo; foco: RefObject<THREE.Vector3>; guiada: boolean; controles: RefObject<OrbitControlsImpl | null> }) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const intro = useRef(0);
  const tocado = useRef(false);
  const objetivo = useRef(new THREE.Vector3());
  const tmp = useRef(new THREE.Vector3());
  const dir = useRef(new THREE.Vector3());

  useEffect(() => {
    const c = controles.current;
    if (!c) return;
    const alTocar = () => {
      tocado.current = true;
    };
    c.addEventListener("start", alTocar);
    return () => c.removeEventListener("start", alTocar);
  }, [controles]);

  const tanF = Math.tan(((FOV / 2) * Math.PI) / 180);
  const aspecto = Math.max(0.3, size.width / Math.max(1, size.height));
  const nec = NECESITA[modo];
  // en vertical (celular) se recortan los lados: la cámara sigue a la maquinaria
  const ancho = aspecto < 1 ? nec.ancho * 0.72 : nec.ancho;
  // escenario bajo (celular): la barra y la misión se comen ~45 % del alto
  const corto = size.height < 520;
  const alto = nec.alto * (corto ? 1.3 : 1);
  const dist = Math.min(34, Math.max(8, alto / (0.62 * 2 * tanF), ancho / (0.94 * 2 * tanF * aspecto)));
  const bajar = (corto ? -0.01 : 0.035) * 2 * dist * tanF; // deja aire para la misión de abajo

  useFrame((_, dt) => {
    const c = controles.current;
    if (!c) return;
    const f = foco.current;
    const [dx, dy, dz] = DIR_CAM[modo];
    dir.current.set(dx, dy, dz).normalize();
    if (intro.current < 1 && !tocado.current) {
      // toma de establecimiento: de lejos y de lado, hasta la maquinaria
      intro.current = Math.min(1, intro.current + dt / 3.2);
      const e = easeInOut(intro.current);
      objetivo.current.set(mezclar(0, f.x, e), mezclar(0, f.y - bajar, e), 0);
      const d = mezclar(dist * 1.9, dist, e);
      const giro = (1 - e) * -0.75;
      const cx = dir.current.x * Math.cos(giro) + dir.current.z * Math.sin(giro);
      const cz = -dir.current.x * Math.sin(giro) + dir.current.z * Math.cos(giro);
      camera.position.set(objetivo.current.x + cx * d, objetivo.current.y + (dir.current.y + (1 - e) * 0.3) * d, objetivo.current.z + cz * d);
      c.target.copy(objetivo.current);
      return;
    }
    if (!guiada) return;
    tmp.current.set(f.x, f.y - bajar, f.z);
    const k = 1 - Math.exp(-dt * 2.4);
    const ox = c.target.x, oy = c.target.y, oz = c.target.z;
    c.target.lerp(tmp.current, k);
    camera.position.set(camera.position.x + c.target.x - ox, camera.position.y + c.target.y - oy, camera.position.z + c.target.z - oz);
  });
  return null;
}

/* ══ Contenido + lienzo ════════════════════════════════════════════════ */
const TINTE: Record<Modo, string> = {
  replicacion: "#ffffff",
  transcripcion: "#f1e8ff",
  traduccion: "#dff7ee",
};

function Contenido(props: AdnDogmaSceneProps & { bajo: boolean }) {
  const { modo, codificante, arnm, codones, progreso, total, accent, resetNonce, arrastrable, onScrub, onGrab, velocidad = 1, guiada = true, yaArrastro = false, bajo } = props;
  const [arrastrando, setArrastrando] = useState(false);
  const foco = useRef(new THREE.Vector3());
  const controles = useRef<OrbitControlsImpl | null>(null);
  const ancho = useThree((s) => s.size.width);
  const ligero = bajo || ancho < 640;

  const mp: MundoProps = {
    codificante,
    arnm,
    codones,
    progreso,
    total,
    velocidad,
    ligero,
    accent,
    foco,
    arrastrable: !!arrastrable,
    yaArrastro,
    onScrub,
    onGrab,
    setArrastrando,
  };
  const clave = `${modo}-${resetNonce}-${codificante}`;
  const suelo = modo === "replicacion" ? -3.6 : modo === "transcripcion" ? -3.1 : -3.4;

  return (
    <>
      <Escenario acento={accent} mesa={false} niebla={false} suelo={suelo} calidad={ligero ? "baja" : "media"} />
      <fog attach="fog" args={["#0a1830", 16, 46]} />
      <Fondo tinte={TINTE[modo]} />
      {/* nucleoplasma / citoplasma lleno: partículas chicas y apagadas que la niebla hunde */}
      <Citoplasma key={`cito-${modo}`} n={ligero ? 50 : 170} paleta={modo === "traduccion" ? PAL_AA : PAL_NT} centro={foco} />
      {modo === "replicacion" ? (
        <MundoReplicacion key={clave} {...mp} />
      ) : modo === "transcripcion" ? (
        <MundoTranscripcion key={clave} {...mp} />
      ) : (
        <MundoTraduccion key={clave} {...mp} />
      )}
      <OrbitControls
        ref={controles}
        makeDefault
        enablePan={false}
        enabled={!arrastrando}
        enableDamping
        dampingFactor={0.08}
        minDistance={4.5}
        maxDistance={40}
        maxPolarAngle={Math.PI * 0.8}
      />
      <CamaraGuiada key={modo} modo={modo} foco={foco} guiada={guiada} controles={controles} />
      {!ligero && (
        <EffectComposer multisampling={4}>
          <Bloom intensity={0.6} luminanceThreshold={0.82} luminanceSmoothing={0.15} mipmapBlur radius={0.55} />
          <Vignette eskil={false} offset={0.22} darkness={0.55} />
        </EffectComposer>
      )}
    </>
  );
}

/** Los cortes de las proteínas usan planos de recorte locales. */
function activarCortes(gl: THREE.WebGLRenderer) {
  gl.localClippingEnabled = true;
}

export default function AdnDogmaScene(props: AdnDogmaSceneProps) {
  const [bajo, setBajo] = useState(() => calidadEscena() === "baja");
  return (
    <Canvas
      dpr={bajo ? [1, 1.25] : [1, 1.75]}
      camera={{ fov: FOV, position: [0, 4, 24], near: 0.1, far: 300 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => activarCortes(gl)}
      style={{ width: "100%", height: "100%" }}
    >
      <PerformanceMonitor onDecline={() => setBajo(true)} />
      <Contenido {...props} bajo={bajo} />
    </Canvas>
  );
}
