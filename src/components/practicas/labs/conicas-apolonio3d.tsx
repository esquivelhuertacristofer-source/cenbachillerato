"use client";

/**
 * EL CONO DE APOLONIO — la pieza central de la sala.
 *
 * Dos conos de resina opuestos por el vértice, sobre un pedestal, atravesados
 * por una placa de vidrio que el alumno inclina (θ) y sube o baja (d). El cono
 * se recorta EXACTAMENTE por el plano (planos de recorte de three): lo que queda
 * por debajo se ve sólido y lo de arriba como un fantasma, así que la cónica
 * aparece como el borde real del corte. La curva es un tubo emisivo calculado
 * en las coordenadas del plano (conicas-museo-data.ts) y su forma canónica se
 * proyecta en la pizarra de la derecha con su ecuación.
 */

import * as THREE from "three";
import { useEffect, useLayoutEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { CurvaTubo } from "./_tablero";
import { Pizarra, Etiqueta, LATON, ACERO, type Pt } from "./conicas-museo3d";
import {
  type Corte, type P2, H_NAPA, R_BORDE, ANG_GENERATRIZ, NOMBRE_CORTE, COLOR_CORTE,
  corteCanonico, ecuacionCorte, f2,
} from "./conicas-museo-data";

/** Altura del piso de la sala (compartida con la escena). */
export const SUELO_SALA = -4.6;
const TOPE_PEDESTAL = -H_NAPA - 0.32;

/** Pizarra del corte: dónde está y a qué escala. */
export const PIZ_X = 5.5, PIZ_Y = -0.3, PIZ_LADO = 3, PIZ_U = 0.62;

/* ── Textura de generatrices grabadas en la resina ───────────────────────── */
function crearGrabado(): THREE.CanvasTexture {
  const W = 1024, H = 256;
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const g = cv.getContext("2d")!;
  g.clearRect(0, 0, W, H);
  g.strokeStyle = "rgba(255,255,255,0.85)";
  g.lineWidth = 3;
  for (let i = 0; i < 16; i++) {
    const x = (i / 16) * W;
    g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke();
  }
  g.lineWidth = 2;
  g.strokeStyle = "rgba(255,255,255,0.45)";
  for (let j = 1; j < 6; j++) {
    const y = (j / 6) * H;
    g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke();
  }
  const t = new THREE.CanvasTexture(cv);
  t.anisotropy = 8;
  return t;
}

/** Recorta una polilínea 2D a la caja |x|,|y| ≤ L (para la pizarra). */
function recortarCaja(pts: P2[], L: number): P2[][] {
  const out: P2[][] = [];
  let cur: P2[] = [];
  for (const p of pts) {
    if (Math.abs(p[0]) <= L && Math.abs(p[1]) <= L) cur.push(p);
    else { if (cur.length > 1) out.push(cur); cur = []; }
  }
  if (cur.length > 1) out.push(cur);
  return out;
}

export function EscenaApolonio({ corte, fino }: { corte: Corte; fino: boolean }) {
  const ancho = useThree((s) => s.size.width);
  const angosto = ancho < 640;
  const col = COLOR_CORTE[corte.tipo];
  const th = THREE.MathUtils.degToRad(corte.theta);

  // Planos de recorte: el de arriba (fantasma) y el de abajo (sólido).
  const planoArriba = useMemo(() => new THREE.Plane(), []);
  const planoAbajo = useMemo(() => new THREE.Plane(), []);
  useLayoutEffect(() => {
    const s = Math.sin(th), c = Math.cos(th);
    planoArriba.setComponents(-s, c, 0, -corte.d * c);
    planoAbajo.setComponents(s, -c, 0, corte.d * c);
  }, [th, corte.d, planoArriba, planoAbajo]);
  const clipArriba = useMemo(() => [planoArriba], [planoArriba]);
  const clipAbajo = useMemo(() => [planoAbajo], [planoAbajo]);

  const grabado = useMemo(() => crearGrabado(), []);
  useEffect(() => () => grabado.dispose(), [grabado]);
  const geoNapa = useMemo(() => new THREE.ConeGeometry(R_BORDE, H_NAPA, 96, 1, true), []);

  // La curva del corte en coordenadas locales del plano: (u, 0, w).
  const tubos = useMemo(
    () => corte.tramos.filter((t) => t.length > 1).map((t) => t.map(([u, w]) => [u, 0, w] as [number, number, number])),
    [corte.tramos],
  );
  // Relleno de la sección (solo curvas cerradas que caben enteras).
  const relleno = useMemo(() => {
    if ((corte.tipo !== "elipse" && corte.tipo !== "circunferencia") || corte.tramos.length !== 1) return null;
    const t = corte.tramos[0]!;
    const cerrada = Math.hypot(t[0]![0] - t[t.length - 1]![0], t[0]![1] - t[t.length - 1]![1]) < 1e-3;
    if (!cerrada) return null;
    const sh = new THREE.Shape(t.map(([u, w]) => new THREE.Vector2(u, w)));
    return new THREE.ShapeGeometry(sh, 2);
  }, [corte.tipo, corte.tramos]);

  // Forma canónica en la pizarra.
  const canon = useMemo(
    () => corteCanonico(corte).flatMap((t) => recortarCaja(t, PIZ_LADO - 0.25))
      .map((t) => t.map(([x, y]) => [x * PIZ_U, y * PIZ_U, 0.04] as [number, number, number])),
    [corte],
  );

  const placaL = corte.uMax - corte.uMin;
  const placaC = (corte.uMin + corte.uMax) / 2;
  const generatriz = useMemo<Pt[]>(() => [[-R_BORDE, -H_NAPA, 0], [R_BORDE, H_NAPA, 0]], []);

  const napa = (arriba: boolean) => (
    <group position={[0, arriba ? H_NAPA / 2 : -H_NAPA / 2, 0]} rotation={[arriba ? Math.PI : 0, 0, 0]}>
      {/* parte que queda (debajo del plano): resina esmerilada */}
      <mesh geometry={geoNapa} renderOrder={2}>
        <meshPhysicalMaterial
          color="#d6ecff" emissive="#1d4a6e" emissiveIntensity={0.35} transparent opacity={fino ? 0.42 : 0.5} roughness={0.28} metalness={0}
          clearcoat={1} clearcoatRoughness={0.12} sheen={0.6} sheenColor="#9fd6ff" sheenRoughness={0.4}
          side={THREE.DoubleSide} depthWrite={false} clippingPlanes={clipAbajo} envMapIntensity={1.3}
        />
      </mesh>
      <mesh geometry={geoNapa} renderOrder={3}>
        <meshBasicMaterial map={grabado} transparent opacity={0.16} side={THREE.DoubleSide} depthWrite={false} clippingPlanes={clipAbajo} color="#e8f6ff" />
      </mesh>
      {/* parte cortada (encima del plano): apenas un fantasma */}
      <mesh geometry={geoNapa} renderOrder={1}>
        <meshPhysicalMaterial color="#bcdcff" transparent opacity={0.07} roughness={0.2} side={THREE.DoubleSide} depthWrite={false} clippingPlanes={clipArriba} />
      </mesh>
      <mesh geometry={geoNapa} renderOrder={1}>
        <meshBasicMaterial map={grabado} transparent opacity={0.05} side={THREE.DoubleSide} depthWrite={false} clippingPlanes={clipArriba} color="#e8f6ff" />
      </mesh>
    </group>
  );

  return (
    <group>
      {/* ── Pedestal de museo ── */}
      <mesh position={[0, (SUELO_SALA + TOPE_PEDESTAL) / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.25, 2.45, TOPE_PEDESTAL - SUELO_SALA, 64]} />
        <meshStandardMaterial color="#172231" roughness={0.42} metalness={0.35} />
      </mesh>
      <mesh position={[0, TOPE_PEDESTAL - 0.02, 0]} receiveShadow>
        <cylinderGeometry args={[2.3, 2.3, 0.06, 64]} />
        <meshStandardMaterial color={LATON} roughness={0.28} metalness={0.95} />
      </mesh>
      {/* postes que sostienen el borde de la napa de abajo */}
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2 + 0.5;
        return (
          <mesh key={i} position={[Math.cos(a) * R_BORDE, (TOPE_PEDESTAL - H_NAPA) / 2, Math.sin(a) * R_BORDE]} castShadow>
            <cylinderGeometry args={[0.045, 0.045, Math.abs(TOPE_PEDESTAL + H_NAPA), 12]} />
            <meshStandardMaterial color={LATON} roughness={0.28} metalness={0.95} />
          </mesh>
        );
      })}

      {/* ── Eje del cono: varilla de acero ── */}
      <mesh position={[0, (TOPE_PEDESTAL + H_NAPA + 0.45) / 2, 0]} castShadow>
        <cylinderGeometry args={[0.028, 0.028, H_NAPA + 0.45 - TOPE_PEDESTAL, 12]} />
        <meshStandardMaterial color={ACERO} roughness={0.22} metalness={0.95} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.07, 20, 20]} />
        <meshStandardMaterial color={LATON} roughness={0.25} metalness={0.95} />
      </mesh>

      {/* ── Las dos napas ── */}
      {napa(false)}
      {napa(true)}
      {/* bordes de latón */}
      {[-1, 1].map((sg) => (
        <mesh key={sg} position={[0, sg * H_NAPA, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[R_BORDE, 0.035, 12, 120]} />
          <meshStandardMaterial color={LATON} roughness={0.28} metalness={0.95} />
        </mesh>
      ))}

      {/* ── La generatriz de referencia (la que es paralela al plano a 60°) ── */}
      <CurvaTubo puntos={generatriz} color="#f8d48a" grosor={0.018} brillo={0.7} segmentos={8} radiales={6} />

      {/* ── El plano de corte ── */}
      <group position={[0, corte.d, 0]} rotation={[0, 0, th]}>
        <mesh position={[placaC, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={4}>
          <planeGeometry args={[placaL, corte.wMax * 2]} />
          <meshPhysicalMaterial color="#a8dcff" transparent opacity={0.17} roughness={0.06} clearcoat={1} side={THREE.DoubleSide} depthWrite={false} envMapIntensity={1.4} />
        </mesh>
        {/* canto de la placa */}
        {(
          [
            [placaC, corte.wMax, placaL, false],
            [placaC, -corte.wMax, placaL, false],
            [corte.uMin, 0, corte.wMax * 2, true],
            [corte.uMax, 0, corte.wMax * 2, true],
          ] as [number, number, number, boolean][]
        ).map(([u, w, L, transversal], i) => (
          <mesh key={i} position={[u, 0, w]} rotation={transversal ? [Math.PI / 2, 0, 0] : [0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.022, 0.022, L, 8]} />
            <meshStandardMaterial color="#bfe6ff" emissive="#5fb8ff" emissiveIntensity={0.5} roughness={0.2} metalness={0.3} />
          </mesh>
        ))}
        {/* pernos del eje de giro del plano */}
        {[-1, 1].map((sg) => (
          <mesh key={sg} position={[0, 0, sg * (corte.wMax + 0.08)]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.16, 20]} />
            <meshStandardMaterial color={LATON} roughness={0.25} metalness={0.95} />
          </mesh>
        ))}
        {/* sección rellena */}
        {relleno && (
          <mesh geometry={relleno} rotation={[Math.PI / 2, 0, 0]} renderOrder={5}>
            <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.45} transparent opacity={0.3} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
        )}
        {/* LA CÓNICA */}
        {tubos.map((t, i) => (
          <CurvaTubo key={`${corte.tipo}-${i}`} puntos={t} color={col} grosor={0.055} brillo={1.5} radiales={10} />
        ))}
        {corte.tipo === "punto" && (
          <mesh>
            <sphereGeometry args={[0.13, 24, 24]} />
            <meshStandardMaterial color={col} emissive={col} emissiveIntensity={1.6} />
          </mesh>
        )}
      </group>

      {/* ── Etiquetas (máx. 4) ── */}
      <Etiqueta pos={[0.9, H_NAPA + 0.85, 0]} color={col} grande ancha>
        {NOMBRE_CORTE[corte.tipo]}{corte.d !== 0 ? ` · e = ${f2(corte.e)}` : " (degenerada)"}
      </Etiqueta>
      <Etiqueta pos={[R_BORDE + 0.25, H_NAPA - 0.35, 0]} color="#f8d48a" ancha>
        generatriz {ANG_GENERATRIZ}°
      </Etiqueta>
      <Etiqueta pos={[-R_BORDE - 0.9, corte.d - 0.1, 0]} color="#a8dcff" ancha>
        plano θ = {Math.round(corte.theta)}°
      </Etiqueta>

      {/* ── La pizarra: el corte visto de frente, con su ecuación ── */}
      {!angosto && (
        <group position={[PIZ_X, PIZ_Y, -0.4]} rotation={[0, -0.32, 0]}>
          <Pizarra lado={PIZ_LADO} U={PIZ_U} suelo={SUELO_SALA - PIZ_Y} />
          {canon.map((t, i) => (
            <CurvaTubo key={`c-${corte.tipo}-${i}`} puntos={t} color={col} grosor={0.04} brillo={1.3} />
          ))}
          {corte.tipo === "punto" && (
            <mesh position={[0, 0, 0.05]}>
              <sphereGeometry args={[0.09, 20, 20]} />
              <meshStandardMaterial color={col} emissive={col} emissiveIntensity={1.6} />
            </mesh>
          )}
          <Etiqueta pos={[0, PIZ_LADO * PIZ_U + 0.55, 0.1]} color={col}>
            {ecuacionCorte(corte)}
          </Etiqueta>
        </group>
      )}
    </group>
  );
}
