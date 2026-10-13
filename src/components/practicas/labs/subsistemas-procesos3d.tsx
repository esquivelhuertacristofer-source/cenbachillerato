"use client";

/**
 * LOS PROCESOS QUE CONECTAN LAS ESFERAS — laboratorio de Subsistemas terrestres.
 *
 * Cada pieza es una interacción entre subsistemas que el alumno ve moverse y
 * que responde a los deslizadores del laboratorio:
 *  · LimitesPlacas  — litosfera: los principales límites de placas, brillando.
 *  · Volcan         — litosfera → atmósfera: el Popocatépetl y su pluma de
 *                     ceniza y SO₂ (cuántas partículas = actividad volcánica).
 *  · CicloAgua      — hidrosfera ↔ atmósfera ↔ litosfera: evaporación del
 *                     Golfo, nube, lluvia en la sierra y escurrimiento; sin
 *                     bosque el agua baja café (erosión) y deja sedimento.
 *  · FlujoCarbono   — biosfera ↔ atmósfera: CO₂ que la selva fija; humo de los claros.
 *  · Metano         — el permafrost que se derrite burbujea metano.
 *  · Invernadero    — atmósfera: luz solar que entra, infrarrojo que sale y,
 *                     con más CO₂, rebota en la troposfera. La UV muere en el ozono.
 *  · Termometro     — el medidor del experimento central.
 *
 * Todas las partículas son UNA malla instanciada por proceso; las fases viven en
 * refs y los vectores temporales se crean una sola vez (nada de `new` por cuadro).
 */

import * as THREE from "three";
import { useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { lonLat } from "./subsistemas-tierra3d";
import { ALT_ATMOS, LIMITES_PLACAS, LUGAR, type LonLat } from "./subsistemas-capas";

/* ── Utilidades ────────────────────────────────────────────────────────── */
function prng(semilla: number) {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Hash determinista 0–1 de dos enteros. */
function hash(i: number, j: number): number {
  const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

/** Marco local en un punto de la superficie: normal, este y norte. */
function marco(ll: LonLat) {
  const n = lonLat(ll, 1);
  const este = new THREE.Vector3(0, 1, 0).cross(n).normalize();
  const norte = new THREE.Vector3().crossVectors(n, este).normalize();
  return { n, este, norte };
}

/** Punto sobre la esfera a partir de un lugar más un corrimiento en km «de mapa» (fracción del radio). */
function cerca(ll: LonLat, de: number, dn: number, alt: number, radio: number, out: THREE.Vector3): THREE.Vector3 {
  const { n, este, norte } = marco(ll);
  return out.copy(n).addScaledVector(este, de).addScaledVector(norte, dn).normalize().multiplyScalar(radio * (1 + alt));
}

/* ── Material emisivo que respeta el corte (para trazos sobre la superficie) ─ */
const VERT_P = /* glsl */ `
  varying vec3 vP;
  void main() { vec4 p = modelMatrix * vec4(position, 1.0); vP = p.xyz; gl_Position = projectionMatrix * viewMatrix * p; }
`;
const FRAG_P = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpac;
  uniform float uCorte;
  varying vec3 vP;
  void main() {
    if (vP.x > uCorte && vP.y > uCorte && vP.z > uCorte) discard;
    gl_FragColor = vec4(uColor, uOpac);
  }
`;

/* ════════════════════════════════════════════════════════════════════════════
   LÍMITES DE PLACAS
   ════════════════════════════════════════════════════════════════════════════ */
export function LimitesPlacas({ radio, fuerza, corteRef }: { radio: number; fuerza: number; corteRef: RefObject<number> }) {
  const geos = useMemo(() => LIMITES_PLACAS.map((l) => {
    // Interpola por arcos de círculo máximo: el trazo se pega a la esfera.
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < l.pts.length - 1; i++) {
      const a = lonLat(l.pts[i]!, 1);
      const b = lonLat(l.pts[i + 1]!, 1);
      const pasos = Math.max(2, Math.ceil(a.angleTo(b) / 0.03));
      for (let s = 0; s < pasos; s++) {
        const t = s / pasos;
        pts.push(a.clone().lerp(b, t).normalize().multiplyScalar(radio * 1.004));
      }
    }
    pts.push(lonLat(l.pts[l.pts.length - 1]!, radio * 1.004));
    const curva = new THREE.CatmullRomCurve3(pts, false, "centripetal");
    return { geo: new THREE.TubeGeometry(curva, Math.max(8, pts.length * 2), radio * (l.tipo === "divergente" ? 0.006 : 0.0075), 5, false), tipo: l.tipo };
  }), [radio]);

  const uDiv = useMemo(() => ({ uColor: { value: new THREE.Color(1.0, 0.62, 0.22) }, uOpac: { value: 0 }, uCorte: { value: radio } }), [radio]);
  const uConv = useMemo(() => ({ uColor: { value: new THREE.Color(1.0, 0.32, 0.16) }, uOpac: { value: 0 }, uCorte: { value: radio } }), [radio]);
  const actual = useRef(0);
  const mats = useRef<(THREE.ShaderMaterial | null)[]>([]);
  useFrame((_, dt) => {
    actual.current = THREE.MathUtils.damp(actual.current, fuerza, 3, Math.min(dt, 0.05));
    for (const m of mats.current) {
      if (!m) continue;
      m.uniforms.uOpac!.value = actual.current;
      m.uniforms.uCorte!.value = corteRef.current;
      m.visible = actual.current > 0.01;
    }
  });

  return (
    <group>
      {geos.map((g, i) => (
        <mesh key={i} geometry={g.geo} raycast={() => null} renderOrder={2}>
          <shaderMaterial ref={(m) => { mats.current[i] = m; }} vertexShader={VERT_P} fragmentShader={FRAG_P}
            uniforms={g.tipo === "divergente" ? uDiv : uConv} transparent depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   PARTÍCULAS SUAVES: un «copo» con borde difuso que siempre mira a la cámara.
   Una bola opaca se ve de plástico; humo, vapor, ceniza y nubes son difusos.
   ════════════════════════════════════════════════════════════════════════════ */
let _copo: THREE.CanvasTexture | null = null;
function texturaCopo(): THREE.CanvasTexture {
  if (_copo) return _copo;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, "rgba(255,255,255,1)");
  r.addColorStop(0.3, "rgba(255,255,255,0.8)");
  r.addColorStop(0.65, "rgba(255,255,255,0.25)");
  r.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = r;
  g.fillRect(0, 0, 128, 128);
  _copo = new THREE.CanvasTexture(c);
  _copo.colorSpace = THREE.SRGBColorSpace;
  return _copo;
}

let _nube: THREE.CanvasTexture | null = null;
/** Bocanada de nube: varios lóbulos difusos, con la base más densa. */
function texturaNube(): THREE.CanvasTexture {
  if (_nube) return _nube;
  const S = 256;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d")!;
  const rnd = prng(21);
  for (let i = 0; i < 26; i++) {
    const ang = rnd() * Math.PI * 2;
    const d = Math.sqrt(rnd()) * 62;
    const x = 128 + Math.cos(ang) * d * 1.15, y = 132 + Math.sin(ang) * d * 0.75;
    const rr = 34 + rnd() * 34;
    const gr = g.createRadialGradient(x, y, 0, x, y, rr);
    gr.addColorStop(0, "rgba(255,255,255,0.55)");
    gr.addColorStop(0.6, "rgba(255,255,255,0.22)");
    gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, S, S);
  }
  _nube = new THREE.CanvasTexture(c);
  _nube.colorSpace = THREE.SRGBColorSpace;
  return _nube;
}

/** Copia la orientación de la cámara (para que el copo la mire). */
function mirarCamara(o: THREE.Object3D, cam: THREE.Camera) {
  o.quaternion.copy(cam.quaternion);
}

/* ════════════════════════════════════════════════════════════════════════════
   VOLCÁN (Popocatépetl) y su pluma
   ════════════════════════════════════════════════════════════════════════════ */
export function Volcan({ radio, volc, pausado, cap, cono }: { radio: number; volc: number; pausado: boolean; cap: number; cono: boolean }) {
  const { n, este, norte } = useMemo(() => marco(LUGAR.popocatepetl), []);
  const quat = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), n), [n]);
  const alto = radio * 0.011;
  const base = useMemo(() => n.clone().multiplyScalar(radio * 0.999), [n, radio]);
  const cima = useMemo(() => n.clone().multiplyScalar(radio * 0.999 + alto), [n, radio, alto]);

  const ref = useRef<THREE.InstancedMesh>(null);
  const brasa = useRef<THREE.Mesh>(null);
  const fases = useRef<number[]>(Array.from({ length: cap }, (_, i) => i / cap));
  const rnd = useMemo(() => { const r = prng(31); return Array.from({ length: cap }, () => [r() - 0.5, r() - 0.5, r()] as const); }, [cap]);
  const tmp = useMemo(() => ({ o: new THREE.Object3D(), c: new THREE.Color(), ceniza: new THREE.Color("#5e5852"), so2: new THREE.Color("#e8c66a") }), []);
  const copo = useMemo(() => texturaCopo(), []);

  useFrame((st, dtRaw) => {
    const dt = pausado ? 0 : Math.min(dtRaw, 0.05);
    const b = brasa.current;
    if (b) {
      b.visible = volc > 0;
      b.scale.setScalar(1 + 0.25 * Math.sin(st.clock.elapsedTime * 7));
    }
    const m = ref.current;
    if (!m) return;
    const activos = Math.round((volc / 10) * cap);
    m.visible = activos > 0;
    const { o, c } = tmp;
    for (let i = 0; i < cap; i++) {
      if (i >= activos) {
        o.position.set(0, 0, 0); o.scale.setScalar(0.0001);
      } else {
        const f = (fases.current[i] = ((fases.current[i] ?? 0) + dt * (0.13 + volc * 0.01)) % 1);
        const [jx, jy, js] = rnd[i]!;
        const h = radio * (0.004 + f * (0.06 + volc * 0.008));            // sube (exagerado)
        const deriva = radio * f * f * 0.12;                               // el viento la lleva al este
        const ab = radio * (0.003 + f * 0.035);                            // se abre
        o.position.copy(cima).addScaledVector(n, h).addScaledVector(este, deriva + jx * ab).addScaledVector(norte, jy * ab);
        mirarCamara(o, st.camera);
        o.scale.setScalar(radio * (0.02 + f * 0.065) * (0.7 + js * 0.6) * (f > 0.8 ? (1 - f) / 0.2 : Math.min(1, f / 0.08)));
        c.copy(js > 0.72 ? tmp.so2 : tmp.ceniza);
        m.setColorAt(i, c);
      }
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });

  return (
    <group>
      <mesh position={base} quaternion={quat} visible={cono || volc > 0}>
        <coneGeometry args={[radio * 0.016, alto, 24, 1, true]} />
        <meshStandardMaterial color="#5a4a3e" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={brasa} position={cima} visible={false}>
        <sphereGeometry args={[radio * 0.006, 12, 8]} />
        <meshStandardMaterial color="#401806" emissive="#ff6a1a" emissiveIntensity={4} />
      </mesh>
      <instancedMesh ref={ref} args={[undefined, undefined, cap]} raycast={() => null} visible={false}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={copo} transparent opacity={0.95} depthWrite={false} />
      </instancedMesh>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   CICLO DEL AGUA en el Golfo de México
   ════════════════════════════════════════════════════════════════════════════ */
const ALT_NUBE = 0.06;
export function CicloAgua({ radio, evaporacion, lluvia, erosion, pausado, cap, visible }: {
  radio: number; evaporacion: number; lluvia: number; erosion: number; pausado: boolean; cap: number; visible: boolean;
}) {
  const vapor = useRef<THREE.InstancedMesh>(null);
  const gotas = useRef<THREE.InstancedMesh>(null);
  const nubes = useRef<THREE.InstancedMesh>(null);
  const sedimento = useRef<THREE.Mesh>(null);
  const fases = useRef<number[]>(Array.from({ length: cap }, (_, i) => i / cap));
  const N_PUFF = 26;

  const puntos = useMemo(() => {
    const r = prng(7);
    const v = () => new THREE.Vector3();
    return Array.from({ length: cap }, () => {
      const o = cerca(LUGAR.golfo, (r() - 0.5) * 0.1, (r() - 0.5) * 0.07, 0.002, radio, v());
      const c = cerca(LUGAR.nube, (r() - 0.5) * 0.05, (r() - 0.5) * 0.03, ALT_NUBE, radio, v());
      const cb = cerca(LUGAR.sierra, (r() - 0.5) * 0.045, (r() - 0.5) * 0.03, ALT_NUBE * 0.78, radio, v());
      const l = cerca(LUGAR.sierra, (r() - 0.5) * 0.045, (r() - 0.5) * 0.03, 0.003, radio, v());
      const d = cerca(LUGAR.desembocadura, (r() - 0.5) * 0.008, (r() - 0.5) * 0.008, 0.003, radio, v());
      return { o, c, cb, l, d, w: r() };
    });
  }, [cap, radio]);
  const puff = useMemo(() => {
    const r = prng(99);
    return Array.from({ length: N_PUFF }, () => ({
      p: cerca(LUGAR.nube, (r() - 0.5) * 0.11 - 0.012, (r() - 0.5) * 0.06, ALT_NUBE + (r() - 0.25) * 0.02, radio, new THREE.Vector3()),
      s: radio * (0.03 + r() * 0.035),
      g: 0.82 + r() * 0.18,
    }));
  }, [radio]);
  const { n: nMar } = useMemo(() => marco(LUGAR.desembocadura), []);
  const qSed = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), nMar), [nMar]);
  const posSed = useMemo(() => cerca(LUGAR.desembocadura, 0.014, -0.004, 0.0015, radio, new THREE.Vector3()), [radio]);
  const copo = useMemo(() => texturaCopo(), []);
  const nubeTex = useMemo(() => texturaNube(), []);

  const tmp = useMemo(() => ({
    o: new THREE.Object3D(), a: new THREE.Vector3(), up: new THREE.Vector3(0, 1, 0), nrm: new THREE.Vector3(),
    c: new THREE.Color(), cVapor: new THREE.Color("#cdeeff"), cRio: new THREE.Color("#5ab4ff"), cLodo: new THREE.Color("#b07a40"),
  }), []);
  const vis = useRef(0);

  useFrame((st, dtRaw) => {
    const dt0 = Math.min(dtRaw, 0.05);
    vis.current = THREE.MathUtils.damp(vis.current, visible ? 1 : 0, 3, dt0);
    const dt = pausado ? 0 : dt0;
    const k = vis.current;
    const on = k > 0.01;
    const { o, a, c } = tmp;

    const nb = nubes.current;
    if (nb) {
      nb.visible = on;
      if (on) {
        for (let i = 0; i < N_PUFF; i++) {
          const p = puff[i]!;
          o.position.copy(p.p);
          mirarCamara(o, st.camera);
          o.scale.setScalar(p.s * k * (0.6 + 0.55 * evaporacion));
          o.updateMatrix();
          nb.setMatrixAt(i, o.matrix);
          c.setScalar(p.g * (0.75 + 0.25 * lluvia));
          nb.setColorAt(i, c);
        }
        nb.instanceMatrix.needsUpdate = true;
        if (nb.instanceColor) nb.instanceColor.needsUpdate = true;
      }
    }
    const sd = sedimento.current;
    if (sd) {
      const s = radio * (0.02 + 0.05 * erosion) * k;
      sd.scale.set(s * 1.5, s, 1);
      (sd.material as THREE.MeshBasicMaterial).opacity = 0.85 * erosion * k;
      sd.visible = erosion > 0.02 && on;
    }
    const mv = vapor.current, mg = gotas.current;
    if (!mv || !mg) return;
    mv.visible = on; mg.visible = on;
    if (!on) return;
    const activos = Math.round(cap * Math.min(1, 0.3 + 0.7 * evaporacion));
    const vel = 0.07 + 0.05 * evaporacion;
    for (let i = 0; i < cap; i++) {
      const P = puntos[i]!;
      let sv = 0.0001, sg = 0.0001;   // escala del copo (vapor/escurrimiento) y de la gota
      o.quaternion.identity();
      if (i < activos) {
        const f = (fases.current[i] = ((fases.current[i] ?? 0) + dt * vel) % 1);
        if (f < 0.36) {
          // Evaporación: sube ondulando del mar a la nube.
          const u = f / 0.36;
          a.copy(P.o).lerp(P.c, u * u);
          tmp.nrm.copy(a).normalize();
          a.addScaledVector(tmp.nrm, Math.sin(u * 9 + P.w * 6) * radio * 0.003);
          o.position.copy(a);
          sv = radio * 0.016 * (1 - u * 0.3);
          c.copy(tmp.cVapor);
        } else if (f >= 0.5 && f < 0.68 && P.w <= lluvia) {
          // Lluvia: gotas alargadas que caen de la nube a la sierra.
          const u = (f - 0.5) / 0.18;
          a.copy(P.cb).lerp(P.l, u);
          o.position.copy(a);
          tmp.nrm.copy(a).normalize();
          o.quaternion.setFromUnitVectors(tmp.up, tmp.nrm);
          sg = 1;
        } else if (f >= 0.68 && P.w <= lluvia) {
          // Escurrimiento: baja por el río hasta el mar; café si arrastra suelo (erosión).
          const u = (f - 0.68) / 0.32;
          a.copy(P.l).lerp(P.d, u).normalize().multiplyScalar(radio * 1.003);
          o.position.copy(a);
          sv = radio * 0.011;
          c.copy(tmp.cRio).lerp(tmp.cLodo, Math.min(1, erosion * (0.6 + P.w * 0.8)));
        }
      }
      // gota
      if (sg > 0.001) o.scale.set(radio * 0.0018 * k, radio * 0.016 * k, radio * 0.0018 * k);
      else o.scale.setScalar(0.0001);
      o.updateMatrix();
      mg.setMatrixAt(i, o.matrix);
      // copo
      mirarCamara(o, st.camera);
      o.scale.setScalar(sv * k);
      o.updateMatrix();
      mv.setMatrixAt(i, o.matrix);
      if (sv > 0.001) mv.setColorAt(i, c);
    }
    mv.instanceMatrix.needsUpdate = true;
    mg.instanceMatrix.needsUpdate = true;
    if (mv.instanceColor) mv.instanceColor.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={nubes} args={[undefined, undefined, N_PUFF]} raycast={() => null} visible={false} renderOrder={4}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={nubeTex} transparent depthWrite={false} />
      </instancedMesh>
      <instancedMesh ref={vapor} args={[undefined, undefined, cap]} raycast={() => null} visible={false} renderOrder={3}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={copo} transparent opacity={0.9} depthWrite={false} />
      </instancedMesh>
      <instancedMesh ref={gotas} args={[undefined, undefined, cap]} raycast={() => null} visible={false}>
        <sphereGeometry args={[1, 6, 6]} />
        <meshStandardMaterial color="#7cc6ff" emissive="#1d6fb8" emissiveIntensity={0.5} roughness={0.2} transparent opacity={0.8} />
      </instancedMesh>
      <mesh ref={sedimento} position={posSed} quaternion={qSed} visible={false} raycast={() => null}>
        <planeGeometry args={[2, 2]} />
        <meshBasicMaterial map={copo} color="#a06a32" transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   FLUJO DE CARBONO sobre la Amazonia
   ════════════════════════════════════════════════════════════════════════════ */
export function FlujoCarbono({ radio, veg, pausado, cap, visible }: { radio: number; veg: number; pausado: boolean; cap: number; visible: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const fases = useRef<number[]>(Array.from({ length: cap }, (_, i) => (i * 0.618) % 1));
  const pts = useMemo(() => {
    const r = prng(5);
    return Array.from({ length: cap }, () => ({ de: (r() - 0.5) * 0.24, dn: (r() - 0.5) * 0.15, w: r() }));
  }, [cap]);
  const tmp = useMemo(() => ({ o: new THREE.Object3D(), c: new THREE.Color(), co2: new THREE.Color("#c8f1ff"), humo: new THREE.Color("#9c8a78") }), []);
  const copo = useMemo(() => texturaCopo(), []);
  const vis = useRef(0);

  useFrame((st, dtRaw) => {
    const dt0 = Math.min(dtRaw, 0.05);
    vis.current = THREE.MathUtils.damp(vis.current, visible ? 1 : 0, 3, dt0);
    const dt = pausado ? 0 : dt0;
    const m = ref.current;
    if (!m) return;
    m.visible = vis.current > 0.01;
    if (!m.visible) return;
    const fijan = (veg - 0.3) / 0.7;        // 0 (30 %) … 1 (100 %)
    const humo = 1 - fijan;
    const { o, c } = tmp;
    for (let i = 0; i < cap; i++) {
      const P = pts[i]!;
      const esHumo = P.w < 0.45;            // hasta 45 % de las partículas pueden ser humo
      const activo = esHumo ? P.w / 0.45 < humo * 0.9 : (P.w - 0.45) / 0.55 < fijan;
      const f = (fases.current[i] = ((fases.current[i] ?? 0) + dt * (esHumo ? 0.14 : 0.11)) % 1);
      if (!activo) {
        o.position.set(0, 0, 0); o.scale.setScalar(0.0001);
      } else {
        const alt = esHumo ? 0.003 + f * 0.11 : 0.12 * (1 - f) + 0.003;
        cerca(LUGAR.amazonia, P.de + (esHumo ? f * 0.05 : 0), P.dn, alt, radio, o.position);
        mirarCamara(o, st.camera);
        const s = radio * (esHumo ? 0.02 + f * 0.04 : 0.016) * vis.current;
        o.scale.setScalar(s * (f > 0.85 ? (1 - f) / 0.15 : Math.min(1, f / 0.1)));
        c.copy(esHumo ? tmp.humo : tmp.co2);
        m.setColorAt(i, c);
      }
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, cap]} raycast={() => null} visible={false} renderOrder={3}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={copo} transparent opacity={0.85} depthWrite={false} />
    </instancedMesh>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   METANO del permafrost (Alaska y norte de Canadá)
   ════════════════════════════════════════════════════════════════════════════ */
export function Metano({ radio, activo, pausado, cap }: { radio: number; activo: boolean; pausado: boolean; cap: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const fases = useRef<number[]>(Array.from({ length: cap }, (_, i) => (i * 0.381) % 1));
  const pts = useMemo(() => {
    const r = prng(13);
    return Array.from({ length: cap }, (_, i) => ({ lugar: i % 2 ? LUGAR.permafrostAlaska : LUGAR.permafrostCanada, de: (r() - 0.5) * 0.18, dn: (r() - 0.5) * 0.07 }));
  }, [cap]);
  const o = useMemo(() => new THREE.Object3D(), []);
  const copo = useMemo(() => texturaCopo(), []);
  const k = useRef(0);
  useFrame((st, dtRaw) => {
    const dt0 = Math.min(dtRaw, 0.05);
    k.current = THREE.MathUtils.damp(k.current, activo ? 1 : 0, 2.5, dt0);
    const dt = pausado ? 0 : dt0;
    const m = ref.current;
    if (!m) return;
    m.visible = k.current > 0.01;
    if (!m.visible) return;
    for (let i = 0; i < cap; i++) {
      const P = pts[i]!;
      const f = (fases.current[i] = ((fases.current[i] ?? 0) + dt * 0.14) % 1);
      cerca(P.lugar, P.de, P.dn, 0.004 + f * 0.18, radio, o.position);
      mirarCamara(o, st.camera);
      o.scale.setScalar(radio * (0.03 + f * 0.04) * k.current * (f > 0.8 ? (1 - f) / 0.2 : Math.min(1, f / 0.1)));
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, cap]} raycast={() => null} visible={false} renderOrder={3}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={copo} color="#c48cff" transparent opacity={0.8} depthWrite={false} />
    </instancedMesh>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   EFECTO INVERNADERO en el casquete atmosférico (plano z = 0, cuadrante x,y > 0)
   ════════════════════════════════════════════════════════════════════════════ */
export function Invernadero({ radio, retencion, pausado, cap, visible }: { radio: number; retencion: number; pausado: boolean; cap: number; visible: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const N_UV = 8;
  const total = cap + N_UV;
  const fases = useRef<number[]>(Array.from({ length: total }, (_, i) => (i * 0.618) % 1));
  const vueltas = useRef<number[]>(Array.from({ length: total }, () => 0));
  const angulos = useMemo(() => Array.from({ length: total }, (_, i) => 0.2 + ((i * 0.618) % 1) * 1.15), [total]);
  const tmp = useMemo(() => ({
    o: new THREE.Object3D(), c: new THREE.Color(), sol: new THREE.Color("#ffd84a"), ir: new THREE.Color("#ff4a2a"), uv: new THREE.Color("#b98bff"),
  }), []);
  const copo = useMemo(() => texturaCopo(), []);
  const vis = useRef(0);
  const rTope = 1 + ALT_ATMOS.termo * 0.97;
  const rTropo = 1 + ALT_ATMOS.tropo;
  const rOzono = 1 + (ALT_ATMOS.ozonoBase + ALT_ATMOS.ozonoTope) / 2;

  useFrame((_, dtRaw) => {
    const dt0 = Math.min(dtRaw, 0.05);
    vis.current = THREE.MathUtils.damp(vis.current, visible ? 1 : 0, 3, dt0);
    const dt = pausado ? 0 : dt0;
    const m = ref.current;
    if (!m) return;
    m.visible = vis.current > 0.01;
    if (!m.visible) return;
    const { o, c } = tmp;
    for (let i = 0; i < total; i++) {
      let f = (fases.current[i] ?? 0) + dt * 0.2;
      if (f >= 1) { f -= 1; vueltas.current[i] = (vueltas.current[i] ?? 0) + 1; }
      fases.current[i] = f;
      const a0 = angulos[i]!;
      let r = 1, a = a0, s = 0.045;
      if (i >= cap) {
        // UV: baja y la absorbe el ozono.
        const u = Math.min(1, f / 0.5);
        r = rTope - (rTope - rOzono) * u;
        s = f < 0.5 ? 0.042 : 0.075 * Math.max(0, 1 - (f - 0.5) / 0.15);
        c.copy(tmp.uv);
      } else if (f < 0.34) {
        r = rTope - (rTope - 1) * (f / 0.34);
        c.copy(tmp.sol);
      } else if (f < 0.4) {
        r = 1.004; s = 0.0001; c.copy(tmp.sol);
      } else {
        const retenido = hash(i, vueltas.current[i] ?? 0) < retencion;
        c.copy(tmp.ir);
        if (f < 0.62) r = 1 + (rTropo - 1) * ((f - 0.4) / 0.22);
        else if (retenido) {
          r = f < 0.82 ? rTropo - (rTropo - 1) * ((f - 0.62) / 0.2) : 1.004;
          if (f >= 0.82) s = 0.0001;
        } else {
          const u = (f - 0.62) / 0.3;
          r = rTropo + (rTope - rTropo) * Math.min(1, u);
          s = 0.045 * Math.max(0, 1 - Math.max(0, u - 0.7) / 0.3);
        }
        a = a0 + Math.sin(r * 140) * 0.006;          // el infrarrojo «ondula»
      }
      o.position.set(Math.cos(a) * r * radio, Math.sin(a) * r * radio, radio * 0.012);
      o.scale.setScalar(radio * s * vis.current);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, c);
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, total]} raycast={() => null} visible={false} renderOrder={5}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={copo} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </instancedMesh>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   TERMÓMETRO — el medidor del experimento central (ΔT respecto a 1850)
   ════════════════════════════════════════════════════════════════════════════ */
export const T_MIN = -0.5, T_MAX = 4.5;
const T_ALTO = 3.0, T_BASE_Y = -1.5;
const yDe = (t: number) => T_BASE_Y + ((t - T_MIN) / (T_MAX - T_MIN)) * T_ALTO;

export function Termometro({ deltaT }: { deltaT: number }) {
  const columna = useRef<THREE.Mesh>(null);
  const matLiq = useRef<THREE.MeshStandardMaterial>(null);
  const matBulbo = useRef<THREE.MeshStandardMaterial>(null);
  const frio = useMemo(() => new THREE.Color("#3f9dff"), []);
  const tibio = useMemo(() => new THREE.Color("#ffb020"), []);
  const caliente = useMemo(() => new THREE.Color("#ff3a1a"), []);
  const actual = useRef(deltaT);
  const marcas = [0, 1, 2, 3, 4];

  useFrame((_, dt) => {
    actual.current = THREE.MathUtils.damp(actual.current, deltaT, 3, Math.min(dt, 0.05));
    const f = Math.min(1, Math.max(0.02, (actual.current - T_MIN) / (T_MAX - T_MIN)));
    const col = columna.current;
    if (col) { col.scale.y = f; col.position.y = T_BASE_Y + (T_ALTO * f) / 2; }
    const k = Math.min(1, Math.max(0, actual.current / 3));
    for (const m of [matLiq.current, matBulbo.current]) {
      if (!m) continue;
      // azul → ámbar → rojo (interpolar directo azul–rojo da rosa)
      if (k < 0.5) m.color.copy(frio).lerp(tibio, k * 2);
      else m.color.copy(tibio).lerp(caliente, (k - 0.5) * 2);
      m.emissive.copy(m.color);
    }
  });

  return (
    <group>
      {/* tubo de vidrio */}
      <mesh position={[0, T_BASE_Y + T_ALTO / 2, 0]}>
        <capsuleGeometry args={[0.15, T_ALTO, 8, 24]} />
        <meshPhysicalMaterial color="#dceeff" roughness={0.05} metalness={0} clearcoat={1} clearcoatRoughness={0.05}
          transparent opacity={0.2} envMapIntensity={1.4} depthWrite={false} />
      </mesh>
      {/* bulbo */}
      <mesh position={[0, T_BASE_Y - 0.12, 0]}>
        <sphereGeometry args={[0.27, 32, 24]} />
        <meshStandardMaterial ref={matBulbo} color="#3f9dff" emissive="#3f9dff" emissiveIntensity={0.55} roughness={0.25} />
      </mesh>
      {/* columna */}
      <mesh ref={columna} position={[0, T_BASE_Y, 0]}>
        <cylinderGeometry args={[0.075, 0.075, T_ALTO, 20]} />
        <meshStandardMaterial ref={matLiq} color="#3f9dff" emissive="#3f9dff" emissiveIntensity={0.55} roughness={0.25} />
      </mesh>
      {/* marcas de cada grado */}
      {marcas.map((t) => (
        <mesh key={t} position={[0.2, yDe(t), 0]}>
          <boxGeometry args={[t === 0 ? 0.2 : 0.13, 0.025, 0.025]} />
          <meshStandardMaterial color={t === 0 ? "#9fe3b5" : "#b9c6d6"} roughness={0.4} metalness={0.4} />
        </mesh>
      ))}
      {/* límite de +1.5 °C */}
      <mesh position={[0, yDe(1.5), 0]}>
        <boxGeometry args={[0.52, 0.045, 0.045]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}
export const yTermometro = yDe;
