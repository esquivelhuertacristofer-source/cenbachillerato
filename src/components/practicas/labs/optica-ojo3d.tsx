"use client";

/**
 * EL OJO HUMANO EN CORTE — modelo anatómico sobre pedestal (CNEYT-V-P06).
 *
 * Ojo reducido de 60 D: la luz de un objeto lejano llega en rayos paralelos,
 * la córnea y el cristalino la juntan en el foco f = 1/(V + 60 D). El largo
 * del globo ocular es el de cada condición (miopía = ojo largo, hipermetropía
 * = ojo corto), dibujado a escala: 1 mm = 0.25 unidades de escena. El anteojo
 * va a 12 mm y cambia la vergencia: V = Pc/(1 − d·Pc). Donde los rayos tocan
 * la retina es donde caen de verdad.
 */

import * as THREE from "three";
import { useEffect, useMemo } from "react";
import { Haces, Chispa, Pulso, Etiqueta, Lente3D, discontinuo, ANODIZADO_NEGRO, ALUMINIO, SUELO, type Pt, type Seg } from "./optica-banco3d";
import { ojoPorId, focoOjoMm, OJO_D_ANTEOJO, OJO_TOL_MM, type CondicionOjo } from "./optica-data";

/** mm → unidades de escena. */
export const K_OJO = 0.25;
export const XE = 0.6;                 // plano principal del ojo (donde se doblan los rayos)
const RY = 2.1;                        // radio vertical del globo
const X_LUZ = -7.6;                    // de dónde llega la luz del objeto lejano
const ALTURAS = [-0.66, -0.33, 0, 0.33, 0.66];

export function geometriaOjo(cond: CondicionOjo) {
  const L = ojoPorId(cond).largoMm;
  const Ls = L * K_OJO;
  const rx = (Ls + 0.45) / 1.97;
  const xc = XE - 0.45 + rx;
  return { L, Ls, rx, xc, xRetina: XE + Ls, xCornea: XE - 0.55, xAnteojo: XE - OJO_D_ANTEOJO * 1000 * K_OJO };
}

/** Choque del rayo con la retina (elipsoide interior), hacia adelante. */
function tocaRetina(p: [number, number], d: [number, number], xc: number, ax: number, ay: number): [number, number] {
  const px = p[0] - xc, py = p[1];
  const A = (d[0] / ax) ** 2 + (d[1] / ay) ** 2;
  const B = 2 * ((px * d[0]) / (ax * ax) + (py * d[1]) / (ay * ay));
  const C = (px / ax) ** 2 + (py / ay) ** 2 - 1;
  const disc = Math.max(0, B * B - 4 * A * C);
  const t = (-B + Math.sqrt(disc)) / (2 * A);
  return [p[0] + d[0] * t, p[1] + d[1] * t];
}

/** Globo: esfera unitaria partida a la mitad (z ≤ 0) para verla por dentro. */
function useGlobo() {
  return useMemo(() => {
    const exterior = new THREE.SphereGeometry(1, 80, 56, Math.PI, Math.PI);
    const interior = new THREE.SphereGeometry(0.97, 80, 56, Math.PI, Math.PI);
    // Colores del interior: coroides oscura al frente, retina rojiza atrás,
    // mácula/fóvea en el polo posterior y la papila (disco óptico) pálida.
    const pos = interior.attributes.position!;
    const col = new Float32Array(pos.count * 3);
    const cor = new THREE.Color("#3a1712"), ret = new THREE.Color("#c4432f"), fov = new THREE.Color("#7a2412"), pap = new THREE.Color("#f0cf8e");
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) / 0.97, y = pos.getY(i) / 0.97, z = pos.getZ(i) / 0.97;
      const t = THREE.MathUtils.smoothstep(x, -0.45, 0.15);
      c.copy(cor).lerp(ret, t);
      const dF = Math.hypot(y, z) + Math.max(0, 0.9 - x);
      if (x > 0.8) c.lerp(fov, Math.max(0, 1 - dF / 0.28) * 0.85);
      const dP = Math.hypot(y + 0.24, z + 0.05);
      if (x > 0.75) c.lerp(pap, Math.max(0, 1 - dP / 0.13));
      // vasos sanguíneos sugeridos: bandas finas
      const vaso = Math.abs(Math.sin(Math.atan2(y + 0.24, z + 0.05) * 7 + Math.hypot(y, z) * 6));
      if (x > 0.1 && vaso < 0.06) c.multiplyScalar(0.72);
      col.set([c.r, c.g, c.b], i * 3);
    }
    interior.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const borde = new THREE.RingGeometry(0.965, 1, 120);
    return { exterior, interior, borde };
  }, []);
}

/** Córnea: menisco transparente, la mitad trasera (z ≤ 0). */
function useCornea() {
  return useMemo(() => {
    const rc = 1.3, r0 = 0.98, gros = 0.07;
    const pts: THREE.Vector2[] = [];
    const N = 18;
    for (let i = 0; i <= N; i++) {
      const r = (r0 * i) / N;
      pts.push(new THREE.Vector2(r, rc - Math.sqrt(rc * rc - r * r)));
    }
    for (let i = N; i >= 0; i--) {
      const r = (r0 * i) / N;
      pts.push(new THREE.Vector2(r, rc - Math.sqrt(rc * rc - r * r) + gros));
    }
    const g = new THREE.LatheGeometry(pts, 48, Math.PI / 2, Math.PI);
    g.rotateZ(-Math.PI / 2);
    return g;
  }, []);
}

function useCristalino() {
  return useMemo(() => {
    const pts: THREE.Vector2[] = [];
    const N = 24;
    for (let i = 0; i <= N; i++) {
      const t = (Math.PI * i) / N;
      pts.push(new THREE.Vector2(Math.max(0.0005, Math.sin(t) * 0.82), -Math.cos(t) * 0.38));
    }
    const g = new THREE.LatheGeometry(pts, 48, Math.PI / 2, Math.PI);
    g.rotateZ(-Math.PI / 2);
    return g;
  }, []);
}

function useIris() {
  return useMemo(() => {
    const pts = [new THREE.Vector2(0.78, -0.03), new THREE.Vector2(1.22, -0.035), new THREE.Vector2(1.22, 0.035), new THREE.Vector2(0.78, 0.03), new THREE.Vector2(0.78, -0.03)];
    const g = new THREE.LatheGeometry(pts, 48, Math.PI / 2, Math.PI);
    g.rotateZ(-Math.PI / 2);
    return g;
  }, []);
}

export function EscenaOjo({ cond, pc, playing }: { cond: CondicionOjo; pc: number; playing: boolean }) {
  const G = geometriaOjo(cond);
  const globo = useGlobo();
  const cornea = useCornea();
  const cristalino = useCristalino();
  const iris = useIris();
  useEffect(() => () => {
    globo.exterior.dispose(); globo.interior.dispose(); globo.borde.dispose(); cornea.dispose(); cristalino.dispose(); iris.dispose();
  }, [globo, cornea, cristalino, iris]);

  const fT = focoOjoMm(pc);
  const xF = XE + fT * K_OJO;
  const conAnteojo = Math.abs(pc) > 1e-6;
  const xFc = conAnteojo ? G.xAnteojo + (1000 / pc) * K_OJO : 0;
  const errMm = fT - G.L;
  const nitido = Math.abs(errMm) <= OJO_TOL_MM;
  const ax = G.rx * 0.97, ay = RY * 0.97;
  const LUZ = "#ffe9a8";

  const segs: Seg[] = [];
  const golpes: [number, number][] = [];
  const caminos: Pt[][] = [];
  for (const y0 of ALTURAS) {
    // entrada con desvanecido (viene de lejos)
    segs.push({ a: [X_LUZ, y0, 0], b: [X_LUZ + 0.7, y0, 0], col: LUZ, k: 0.25, r: 0.045 });
    segs.push({ a: [X_LUZ + 0.7, y0, 0], b: [X_LUZ + 1.4, y0, 0], col: LUZ, k: 0.55, r: 0.045 });
    let p: [number, number] = [X_LUZ + 1.4, y0];
    let y1 = y0;
    if (conAnteojo) {
      segs.push({ a: [p[0], y0, 0], b: [G.xAnteojo, y0, 0], col: LUZ, k: 0.9, r: 0.045 });
      const pendiente = (0 - y0) / (xFc - G.xAnteojo);
      y1 = y0 + (XE - G.xAnteojo) * pendiente;
      segs.push({ a: [G.xAnteojo, y0, 0], b: [XE, y1, 0], col: LUZ, k: 0.9, r: 0.045 });
      p = [XE, y1];
    } else {
      segs.push({ a: [p[0], y0, 0], b: [XE, y0, 0], col: LUZ, k: 0.9, r: 0.045 });
      p = [XE, y0];
    }
    const dx = xF - XE, dy = 0 - y1;
    const L = Math.hypot(dx, dy);
    const d: [number, number] = [dx / L, dy / L];
    const h = tocaRetina(p, d, G.xc, ax, ay);
    golpes.push(h);
    segs.push({ a: [XE, y1, 0], b: [h[0], h[1], 0], col: "#ffd27a", k: 1, r: 0.045 });
    if (xF > h[0] + 0.05) segs.push(...discontinuo([h[0], h[1], 0], [xF, 0, 0], "#ffd27a", 0.4).map((s) => ({ ...s, r: 0.03 })));
    caminos.push(conAnteojo ? [[X_LUZ, y0, 0], [G.xAnteojo, y0, 0], [XE, y1, 0], [h[0], h[1], 0]] : [[X_LUZ, y0, 0], [XE, y0, 0], [h[0], h[1], 0]]);
  }
  const ys = golpes.map((g) => g[1]);
  const mancha = Math.max(...ys) - Math.min(...ys);
  const centro = golpes[2]!;

  const fU = conAnteojo ? Math.max(1.2, Math.min(4, 1.2 + (6 - Math.abs(pc)) * 0.48)) : 2;

  return (
    <group>
      {/* Pedestal anatómico */}
      <mesh position={[G.xc, SUELO + 0.08, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.3, 1.45, 0.16, 48]} />
        <meshStandardMaterial {...ANODIZADO_NEGRO} />
      </mesh>
      <mesh position={[G.xc, (SUELO + 0.16 - RY + 0.25) / 2, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.16, -RY + 0.25 - SUELO - 0.16, 18]} />
        <meshStandardMaterial {...ALUMINIO} />
      </mesh>
      <mesh position={[G.xc, -RY + 0.2, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.75, 0.06, 12, 40, Math.PI]} />
        <meshStandardMaterial {...ALUMINIO} />
      </mesh>

      {/* Globo ocular en corte */}
      <group position={[G.xc, 0, 0]} scale={[G.rx, RY, RY]}>
        <mesh geometry={globo.exterior} castShadow>
          <meshPhysicalMaterial color="#f2ece4" roughness={0.42} clearcoat={0.6} clearcoatRoughness={0.25} sheen={0.4} sheenColor="#ffd9d0" side={THREE.FrontSide} />
        </mesh>
        <mesh geometry={globo.interior}>
          <meshStandardMaterial vertexColors roughness={0.55} side={THREE.BackSide} emissive="#3a0d08" emissiveIntensity={0.25} />
        </mesh>
        <mesh geometry={globo.borde} position={[0, 0, 0.002]}>
          <meshStandardMaterial color="#e7cfc4" roughness={0.6} side={THREE.DoubleSide} />
        </mesh>
      </group>
      {/* Córnea, iris y cristalino */}
      <mesh geometry={cornea} position={[G.xCornea, 0, 0]} renderOrder={3}>
        <meshPhysicalMaterial color="#e3f6ff" transparent opacity={0.3} depthWrite={false} roughness={0.03} clearcoat={1} envMapIntensity={2} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={iris} position={[XE - 0.22, 0, 0]}>
        <meshStandardMaterial color="#5b3a22" roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={cristalino} position={[XE + 0.2, 0, 0]} renderOrder={3}>
        <meshPhysicalMaterial color="#fff4d6" transparent opacity={0.38} depthWrite={false} roughness={0.08} clearcoat={1} envMapIntensity={1.6} side={THREE.DoubleSide} />
      </mesh>
      {/* Nervio óptico */}
      <mesh position={[G.xRetina + 0.75, -0.5, 0]} rotation={[0, 0, Math.PI / 2 - 0.25]}>
        <cylinderGeometry args={[0.3, 0.36, 1.2, 28, 1, false, Math.PI / 2, Math.PI]} />
        <meshStandardMaterial color="#e3c08a" roughness={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* Anteojo */}
      {conAnteojo && (
        <group position={[G.xAnteojo, 0, 0]}>
          <Lente3D fU={fU} convergente={pc > 0} A={0.95} fino />
          <mesh position={[0, (SUELO - 0.95 - 0.2) / 2, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, -0.95 - 0.2 - SUELO, 14]} />
            <meshStandardMaterial {...ALUMINIO} />
          </mesh>
          <mesh position={[0, SUELO + 0.06, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.4, 0.45, 0.12, 28]} />
            <meshStandardMaterial {...ANODIZADO_NEGRO} />
          </mesh>
        </group>
      )}

      <Haces segs={segs} orden={20} />
      <Chispa pos={[centro[0] - 0.05, centro[1], 0.05]} color={nitido ? "#fff2c0" : "#ffb070"} tam={0.35 + mancha * 1.6} k={nitido ? 1.2 : 0.7} />
      {xF < G.xRetina - 0.05 && <Chispa pos={[xF, 0, 0.05]} color="#fff2c0" tam={0.5} k={1} />}
      {playing && caminos.slice(1, 4).map((c, i) => <Pulso key={i} path={c} color="#fff3c4" playing={playing} speed={4} tam={0.3} />)}

      <Etiqueta pos={[G.xCornea - 0.35, 1.45, 0.3]} color="#bae6fd" ancha>córnea</Etiqueta>
      <Etiqueta pos={[XE + 0.25, -1.2, 0.3]} color="#fde68a" ancha>cristalino</Etiqueta>
      <Etiqueta pos={[G.xRetina - 0.2, 1.75, 0.3]} color="#fca5a5">retina</Etiqueta>
      <Etiqueta pos={[Math.min(xF, G.xRetina + 2.2), -0.62, 0.3]} color={nitido ? "#86efac" : "#fde047"} ancha>
        {nitido ? "foco en la retina" : errMm < 0 ? "foco antes de la retina" : "foco detrás de la retina"}
      </Etiqueta>
    </group>
  );
}
