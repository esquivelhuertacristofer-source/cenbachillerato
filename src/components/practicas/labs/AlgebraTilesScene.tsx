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
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
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
  /** Solo lenguaje: valor de x. Las tiras y los cuadrados x² crecen con x (la unidad no cambia). */
  xValor?: number;
}

const GAP = 0.22; // separación entre mosaicos de un mismo término
const GAP_TERM = 0.9; // separación entre términos

const colorDe = (tipo: TipoTile, coef: number) => (coef < 0 ? COLOR_NEG : COLOR_TILE[tipo]);

/** Medidas de los mosaicos: la unidad es fija y "x" puede escalar con el valor de x. */
interface Medidas { xl: number; u: number }
const MEDIDAS_BASE: Medidas = { xl: X_LEN, u: U_LEN };
/** En el modo lenguaje la longitud de x es el valor de x (en unidades de 0,55). */
const medidasDeX = (x: number): Medidas => ({ u: 0.55, xl: 0.55 * Math.max(1, x) });

/** Footprint sobre el eje X (ancho de cada copia) y profundidad sobre Z. */
function footprint(tipo: TipoTile, m: Medidas = MEDIDAS_BASE): { w: number; d: number } {
  if (tipo === "x2") return { w: m.xl, d: m.xl };
  if (tipo === "x") return { w: m.u, d: m.xl }; // tira parada en profundidad
  return { w: m.u, d: m.u };
}

/* Etiqueta fija en píxeles (≥ 14 px) con fondo propio: se lee sobre cualquier cosa. */
function Etiqueta({ pos, color = "#fff", children, dy = 0 }: { pos: [number, number, number]; color?: string; children: React.ReactNode; dy?: number }) {
  return (
    <Html position={pos} center pointerEvents="none" zIndexRange={[20, 0]}>
      <div style={{ transform: `translateY(${dy}px)` }}>
        <div style={{ whiteSpace: "nowrap", padding: "3px 9px", borderRadius: 8, background: "rgba(4,10,22,0.88)", border: `1.5px solid ${color}`, color, fontWeight: 900, fontSize: 15, fontFamily: "system-ui, sans-serif", boxShadow: "0 4px 16px rgba(0,0,0,0.5)" }}>
          {children}
        </div>
      </div>
    </Html>
  );
}

/* ════════════════════ Mosaico individual ═════════════════════════════════ */
function Tile({
  pos,
  w,
  d,
  color,
  label,
  flotar,
  alto = TILE_H,
  fase,
  pausado,
}: {
  pos: [number, number];
  w: number;
  d: number;
  color: string;
  label?: string;
  alto?: number;
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
      <RoundedBox args={[w - 0.08, alto, d - 0.08]} radius={0.06} smoothness={3} position={[0, alto / 2, 0]}>
        {/* `toneMapped={false}` sacaba el mosaico del tono de la escena: salía
            como color plano, sin responder a la luz, y el conjunto se leía como
            un diagrama en vez de como piezas sobre una mesa. */}
        <meshPhysicalMaterial
          color={color}
          metalness={0.18}
          roughness={0.38}
          emissive={color}
          emissiveIntensity={0.1}
          clearcoat={0.8}
          clearcoatRoughness={0.25}
          envMapIntensity={1.15}
        />
      </RoundedBox>
      {label && (
        <Etiqueta pos={[0, alto + 0.02, 0]} color="#ffffff" dy={-20}>{label}</Etiqueta>
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

function disponerTerminos(terminos: Termino[], etiquetar: boolean, m: Medidas): { tiles: Plano[]; ancho: number; grupos: { cx: number; texto: string }[] } {
  const tiles: Plano[] = [];
  const grupos: { cx: number; texto: string }[] = [];
  let cursor = 0;
  let fase = 0;
  terminos.forEach((term, ti) => {
    const n = Math.abs(term.coef);
    const { w, d } = footprint(term.tipo, m);
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

function FilaTerminos({ terminos, etiquetar, mostrarGrupos, pausado, m = MEDIDAS_BASE }: { terminos: Termino[]; etiquetar: boolean; mostrarGrupos?: boolean; pausado?: boolean; m?: Medidas }) {
  const { tiles, grupos } = useMemo(() => disponerTerminos(terminos, etiquetar, m), [terminos, etiquetar, m]);
  const alto = Math.min(TILE_H, m.u * 0.5);
  return (
    <group>
      {tiles.map((t, i) => (
        <Tile key={i} pos={t.pos} w={t.w} d={t.d} alto={alto} color={t.color} label={t.label} flotar fase={t.fase} pausado={pausado} />
      ))}
      {mostrarGrupos &&
        grupos.map((g, i) => (
          <Etiqueta key={`g${i}`} pos={[g.cx, 0.02, m.xl / 2 + 0.7]} color="#eaf2ff">{g.texto}</Etiqueta>
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
  tiles.push({ pos: [X_LEN / 2, X_LEN / 2], w: X_LEN, d: X_LEN, color: COLOR_TILE.x2, fase: 0 });

  // a tiras horizontales (largo X_LEN sobre X, ancho 1 sobre Z) a la DERECHA del x²: representan a·x
  for (let i = 0; i < na; i++) {
    const cx = X_LEN + 0.18 + U_LEN / 2 + i * (U_LEN + 0.12);
    tiles.push({ pos: [cx, X_LEN / 2], w: U_LEN, d: X_LEN, color: a < 0 ? COLOR_NEG : COLOR_TILE.x, fase: 0.5 + i });
  }
  // b tiras debajo del x²: representan b·x
  for (let i = 0; i < nb; i++) {
    const cz = X_LEN + 0.18 + U_LEN / 2 + i * (U_LEN + 0.12);
    tiles.push({ pos: [X_LEN / 2, cz], w: X_LEN, d: U_LEN, color: b < 0 ? COLOR_NEG : COLOR_TILE.x, fase: 1 + i });
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
      <Etiqueta pos={[0, 0.02, -offZ - 0.6]} color={accent}>{`x ${sg(a)}`}</Etiqueta>
      <Etiqueta pos={[-offX - 0.5, 0.02, 0]} color={accent}>{`x ${sg(b)}`}</Etiqueta>
      <Etiqueta pos={[0, 0.02, offZ + 0.7]} color="#eaf2ff">{`= ${expandLabel}`}</Etiqueta>

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
      /* Desde [0,9,11] la vista era casi cenital y los mosaicos perdían su
         canto. Bajando la cámara se ve que son piezas con grosor. */
      camera={{ position: [0, 6.4, 12.2], fov: 42 }}
    >
      <Contenido {...props} />
    </Canvas>
  );
}

/** Aleja o acerca la cámara según lo ancho que sea el contenido (una vez por cambio). */
function AjusteCamara({ dist }: { dist: number }) {
  const camera = useThree((st) => st.camera);
  useEffect(() => {
    camera.position.setLength(dist);
  }, [camera, dist]);
  return null;
}

function Contenido(props: AlgebraTilesSceneProps) {
  const { accent, autoRotate, resetNonce, modo, terminos, exprLabel, claseLabel, a, b, expandLabel, pausado, xValor } = props;
  const angosto = useThree((st) => st.size.width) < 640;
  const anchoContenido = useMemo(() => {
    if (modo === "operaciones") return X_LEN + 0.18 + (Math.abs(a) + 1) * (U_LEN + 0.12) + 1.5;
    const m = modo === "lenguaje" ? medidasDeX(xValor ?? 3) : MEDIDAS_BASE;
    return disponerTerminos(terminos, false, m).ancho + 1.5;
  }, [modo, terminos, a, xValor]);
  const dist = Math.min(24, Math.max(10, anchoContenido * (angosto ? 1.25 : 0.95) + 4));
  return (
    <>
      <AjusteCamara dist={Math.round(dist * 2) / 2} />
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
        {modo === "lenguaje" && <FilaTerminos terminos={terminos} etiquetar pausado={pausado} m={medidasDeX(xValor ?? 3)} />}
        {modo === "clasificacion" && <FilaTerminos terminos={terminos} etiquetar={false} mostrarGrupos pausado={pausado} />}
        {modo === "operaciones" && <ModeloArea a={a} b={b} expandLabel={expandLabel} accent={accent} />}
      </group>

      {/* etiqueta principal de la expresión */}
      <Etiqueta pos={[0, modo === "operaciones" ? 1.6 : 1.9, 0]} color={accent} dy={-34}>
        {exprLabel}
        {modo === "clasificacion" && claseLabel ? <span style={{ color: "#fff", marginLeft: 10 }}>· {claseLabel}</span> : null}
      </Etiqueta>

      <Environment resolution={256}>
        <Lightformer intensity={1.3} position={[0, 8, 6]} scale={[16, 5, 1]} color="#ffffff" />
        <Lightformer intensity={1.0} position={[-9, 4, 2]} scale={[5, 6, 1]} color={accent} />
        <Lightformer intensity={1.0} position={[9, 3, 4]} scale={[4, 5, 1]} color="#bfe8ff" />
      </Environment>

      <OrbitControls
        enablePan={false}
        minDistance={6}
        maxDistance={28}
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
