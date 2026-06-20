"use client";

/**
 * Escena 3D del laboratorio «Álgebra con mosaicos» — R3F.
 * Se carga de forma diferida (ssr:false) desde LabAlgebraTiles.tsx.
 *
 * Tres modos (algebra tiles clásicos vueltos 3D):
 *  • "lenguaje": dibuja la expresión como una fila de mosaicos (x², x, unidad);
 *    los negativos van en rojo. Es la frase verbal hecha geometría.
 *  • "clasificacion": agrupa los términos separados con su etiqueta (monomio…
 *    polinomio) y muestra el grado.
 *  • "operaciones": modelo de ÁREA de (x + a)(x + b) — un rectángulo repartido en
 *    1 mosaico x², (a+b) tiras x y (a·b) unidades.
 *
 * Patrón R3F: useFrame solo dentro de <Canvas>; las piezas animadas mutan REFS.
 * La geometría/colores son deterministas (sin Math.random).
 */

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer, Html, RoundedBox } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import {
  X_LEN,
  U_LEN,
  TILE_H,
  COLOR_TILE,
  COLOR_NEG,
  ETIQUETA_TILE,
  type Termino,
  type TipoTile,
  type Variante,
} from "./algebra-tiles-data";

export interface AlgebraTilesSceneProps {
  modo: Variante;
  /** Términos a dibujar (modos lenguaje y clasificación). */
  terminos: Termino[];
  /** Etiqueta de la expresión (Html flotante). */
  exprLabel: string;
  /** Solo clasificación: clase + grado para mostrar. */
  claseLabel?: string;
  /** Solo operaciones: coeficientes del producto (x+a)(x+b). */
  a: number;
  b: number;
  /** Solo operaciones: resultado expandido para etiqueta. */
  expandLabel: string;
  accent: string;
  pausado: boolean;
  autoRotate: boolean;
  resetNonce: number;
}

const GAP = 0.22; // separación entre mosaicos de un mismo término
const GAP_TERM = 0.9; // separación entre términos
const BLANCO = "#eaf2ff";

const colorDe = (tipo: TipoTile, coef: number) => (coef < 0 ? COLOR_NEG : COLOR_TILE[tipo]);

/** Footprint sobre el eje X (ancho de cada copia) y profundidad sobre Z. */
function footprint(tipo: TipoTile): { w: number; d: number } {
  if (tipo === "x2") return { w: X_LEN, d: X_LEN };
  if (tipo === "x") return { w: U_LEN, d: X_LEN }; // tira parada en profundidad
  return { w: U_LEN, d: U_LEN };
}

/* ════════════════════ Mosaico individual ═════════════════════════════════ */
function Tile({
  pos,
  w,
  d,
  color,
  label,
  flotar,
  fase,
  pausado,
}: {
  pos: [number, number];
  w: number;
  d: number;
  color: string;
  label?: string;
  flotar?: boolean;
  fase?: number;
  pausado?: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    const g = ref.current;
    if (!g || !flotar || pausado) return;
    const t = state.clock.elapsedTime;
    g.position.y = Math.sin(t * 1.6 + (fase ?? 0)) * 0.05 + 0.001;
  });
  return (
    <group ref={ref} position={[pos[0], 0, pos[1]]}>
      <RoundedBox args={[w - 0.08, TILE_H, d - 0.08]} radius={0.06} smoothness={3} position={[0, TILE_H / 2, 0]}>
        <meshStandardMaterial color={color} metalness={0.18} roughness={0.42} emissive={color} emissiveIntensity={0.14} toneMapped={false} />
      </RoundedBox>
      {label && (
        <Html position={[0, TILE_H + 0.02, 0]} center distanceFactor={13} pointerEvents="none">
          <div style={{ color: "#06121f", fontSize: 11, fontWeight: 900, textShadow: "0 1px 2px rgba(255,255,255,.5)", whiteSpace: "nowrap" }}>
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}

/* ════════════════════ Layout de una fila de términos ═════════════════════ */
interface Plano {
  pos: [number, number];
  w: number;
  d: number;
  color: string;
  label?: string;
  fase: number;
}

function disponerTerminos(terminos: Termino[], etiquetar: boolean): { tiles: Plano[]; ancho: number; grupos: { cx: number; texto: string }[] } {
  const tiles: Plano[] = [];
  const grupos: { cx: number; texto: string }[] = [];
  let cursor = 0;
  let fase = 0;
  terminos.forEach((term, ti) => {
    const n = Math.abs(term.coef);
    const { w, d } = footprint(term.tipo);
    const inicioTerm = cursor;
    for (let k = 0; k < n; k++) {
      const cx = cursor + w / 2;
      tiles.push({
        pos: [cx, 0],
        w,
        d,
        color: colorDe(term.tipo, term.coef),
        label: etiquetar && k === 0 ? (term.coef < 0 ? "−" : "") + ETIQUETA_TILE[term.tipo] : undefined,
        fase: (fase += 0.6),
      });
      cursor += w + GAP;
    }
    const finTerm = cursor - GAP;
    grupos.push({ cx: (inicioTerm + finTerm) / 2, texto: `${term.coef < 0 ? "−" : ti > 0 ? "+" : ""}${Math.abs(term.coef) === 1 && term.tipo !== "unit" ? "" : Math.abs(term.coef)}${ETIQUETA_TILE[term.tipo]}` });
    if (ti < terminos.length - 1) cursor += GAP_TERM;
  });
  const ancho = cursor - GAP;
  // centrar
  const off = ancho / 2;
  tiles.forEach((t) => (t.pos[0] -= off));
  grupos.forEach((g) => (g.cx -= off));
  return { tiles, ancho, grupos };
}

function FilaTerminos({ terminos, etiquetar, mostrarGrupos, pausado }: { terminos: Termino[]; etiquetar: boolean; mostrarGrupos?: boolean; pausado?: boolean }) {
  const { tiles, grupos } = useMemo(() => disponerTerminos(terminos, etiquetar), [terminos, etiquetar]);
  return (
    <group>
      {tiles.map((t, i) => (
        <Tile key={i} pos={t.pos} w={t.w} d={t.d} color={t.color} label={t.label} flotar fase={t.fase} pausado={pausado} />
      ))}
      {mostrarGrupos &&
        grupos.map((g, i) => (
          <Html key={`g${i}`} position={[g.cx, 0.02, X_LEN / 2 + 0.7]} center distanceFactor={14} pointerEvents="none">
            <div style={{ color: BLANCO, fontSize: 12, fontWeight: 900, textShadow: "0 2px 6px #000", whiteSpace: "nowrap" }}>{g.texto}</div>
          </Html>
        ))}
    </group>
  );
}

/* ════════════════════ Modelo de área (x+a)(x+b) ══════════════════════════ */
function ModeloArea({ a, b, expandLabel, accent }: { a: number; b: number; expandLabel: string; accent: string }) {
  // Cuadrante: x² (arriba-izq), a tiras-x (arriba-der), b tiras-x (abajo-izq), a·b unidades (abajo-der).
  const tiles: Plano[] = [];
  const sa = Math.sign(a) || 1;
  const sb = Math.sign(b) || 1;
  const na = Math.abs(a);
  const nb = Math.abs(b);

  // x² en [0..X_LEN] × [0..X_LEN]
  tiles.push({ pos: [X_LEN / 2, X_LEN / 2], w: X_LEN, d: X_LEN, color: COLOR_TILE.x2, label: "x²", fase: 0 });

  // a tiras horizontales (largo X_LEN sobre X, ancho 1 sobre Z) a la DERECHA del x²: representan a·x
  for (let i = 0; i < na; i++) {
    const cx = X_LEN + 0.18 + U_LEN / 2 + i * (U_LEN + 0.12);
    tiles.push({ pos: [cx, X_LEN / 2], w: U_LEN, d: X_LEN, color: a < 0 ? COLOR_NEG : COLOR_TILE.x, label: i === 0 ? "x" : undefined, fase: 0.5 + i });
  }
  // b tiras debajo del x²: representan b·x
  for (let i = 0; i < nb; i++) {
    const cz = X_LEN + 0.18 + U_LEN / 2 + i * (U_LEN + 0.12);
    tiles.push({ pos: [X_LEN / 2, cz], w: X_LEN, d: U_LEN, color: b < 0 ? COLOR_NEG : COLOR_TILE.x, label: i === 0 ? "x" : undefined, fase: 1 + i });
  }
  // a·b unidades en la esquina inferior-derecha
  const unidNeg = sa * sb < 0;
  for (let i = 0; i < na; i++) {
    for (let j = 0; j < nb; j++) {
      const cx = X_LEN + 0.18 + U_LEN / 2 + i * (U_LEN + 0.12);
      const cz = X_LEN + 0.18 + U_LEN / 2 + j * (U_LEN + 0.12);
      tiles.push({ pos: [cx, cz], w: U_LEN, d: U_LEN, color: unidNeg ? COLOR_NEG : COLOR_TILE.unit, label: undefined, fase: 1.5 + i + j });
    }
  }

  // centrar el conjunto
  const maxX = X_LEN + 0.18 + na * (U_LEN + 0.12);
  const maxZ = X_LEN + 0.18 + nb * (U_LEN + 0.12);
  const offX = maxX / 2;
  const offZ = maxZ / 2;
  tiles.forEach((t) => {
    t.pos[0] -= offX;
    t.pos[1] -= offZ;
  });

  const sg = (n: number) => (n >= 0 ? `+${n}` : `−${Math.abs(n)}`);

  return (
    <group>
      {tiles.map((t, i) => (
        <Tile key={i} pos={t.pos} w={t.w} d={t.d} color={t.color} label={t.label} />
      ))}

      {/* etiquetas de los lados del rectángulo */}
      <Html position={[0, 0.02, -offZ - 0.6]} center distanceFactor={15} pointerEvents="none">
        <div style={{ color: accent, fontSize: 12.5, fontWeight: 900, textShadow: "0 2px 6px #000", whiteSpace: "nowrap" }}>{`x ${sg(a)}  (largo)`}</div>
      </Html>
      <Html position={[-offX - 0.7, 0.02, 0]} center distanceFactor={15} pointerEvents="none">
        <div style={{ color: accent, fontSize: 12.5, fontWeight: 900, textShadow: "0 2px 6px #000", whiteSpace: "nowrap" }}>{`x ${sg(b)} (ancho)`}</div>
      </Html>
      <Html position={[0, 0.02, offZ + 0.7]} center distanceFactor={13} pointerEvents="none">
        <div style={{ color: BLANCO, fontSize: 13, fontWeight: 900, textShadow: "0 2px 6px #000", whiteSpace: "nowrap" }}>{`= ${expandLabel}`}</div>
      </Html>

      <ContactShadows position={[0, 0, 0]} opacity={0.22} scale={14} blur={2.4} far={6} />
    </group>
  );
}

/* ════════════════════ Plano base + ejes suaves ═══════════════════════════ */
function Tablero({ accent }: { accent: string }) {
  return (
    <group position={[0, -0.02, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[26, 18]} />
        <meshStandardMaterial color="#0a1b2e" metalness={0.1} roughness={0.9} transparent opacity={0.55} />
      </mesh>
      <gridHelper args={[24, 24, accent, "#16304a"]} position={[0, 0, 0]} />
    </group>
  );
}

/* ════════════════════ CANVAS ═════════════════════════════════════════════ */
export default function AlgebraTilesScene(props: AlgebraTilesSceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      camera={{ position: [0, 9, 11], fov: 42 }}
    >
      <Contenido {...props} />
    </Canvas>
  );
}

function Contenido(props: AlgebraTilesSceneProps) {
  const { accent, autoRotate, resetNonce, modo, terminos, exprLabel, claseLabel, a, b, expandLabel, pausado } = props;
  return (
    <>
      <color attach="background" args={["#04111f"]} />
      <fog attach="fog" args={["#04111f", 24, 54]} />

      <ambientLight intensity={0.66} />
      <directionalLight
        position={[6, 12, 6]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={44}
        shadow-bias={-0.0004}
      />
      <pointLight position={[0, 6, 8]} intensity={1.4} color="#ffffff" />

      <Tablero accent={accent} />

      <group key={`${resetNonce}-${modo}`}>
        {modo === "lenguaje" && <FilaTerminos terminos={terminos} etiquetar pausado={pausado} />}
        {modo === "clasificacion" && <FilaTerminos terminos={terminos} etiquetar mostrarGrupos pausado={pausado} />}
        {modo === "operaciones" && <ModeloArea a={a} b={b} expandLabel={expandLabel} accent={accent} />}
      </group>

      {/* etiqueta principal de la expresión */}
      <Html position={[0, 2.6, 0]} center distanceFactor={17} pointerEvents="none">
        <div
          style={{
            color: "#fff",
            fontSize: 15,
            fontWeight: 900,
            letterSpacing: 0.3,
            textShadow: "0 2px 10px #000",
            whiteSpace: "nowrap",
            background: "rgba(4,17,31,.55)",
            border: `1px solid ${accent}55`,
            borderRadius: 10,
            padding: "5px 12px",
          }}
        >
          {modo === "operaciones" ? exprLabel : exprLabel}
          {modo === "clasificacion" && claseLabel ? <span style={{ color: accent, marginLeft: 10 }}>· {claseLabel}</span> : null}
        </div>
      </Html>

      <Environment resolution={256}>
        <Lightformer intensity={1.3} position={[0, 8, 6]} scale={[16, 5, 1]} color="#ffffff" />
        <Lightformer intensity={1.0} position={[-9, 4, 2]} scale={[5, 6, 1]} color={accent} />
        <Lightformer intensity={1.0} position={[9, 3, 4]} scale={[4, 5, 1]} color="#bfe8ff" />
      </Environment>

      <OrbitControls
        enablePan={false}
        minDistance={7}
        maxDistance={22}
        minPolarAngle={Math.PI / 9}
        maxPolarAngle={Math.PI / 2.15}
        target={[0, 0, 0]}
        autoRotate={autoRotate}
        autoRotateSpeed={0.4}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.42} luminanceThreshold={0.55} luminanceSmoothing={0.3} mipmapBlur radius={0.6} />
        <Vignette eskil={false} offset={0.3} darkness={0.4} />
      </EffectComposer>
    </>
  );
}
