"use client";

/**
 * Escena 3D del laboratorio "Estudio de edición de contenido digital"
 * (CD-III, progresión 3). Cuatro vistas:
 *
 *  - imagen: la imagen como cuadrícula de prismas (uno por píxel, color real y
 *    altura según su luminancia), la rejilla de bloques de 8×8 cuando se
 *    comprime con pérdida y, a un lado, los bits del píxel elegido apilados
 *    como cubos encendidos (1) o apagados (0).
 *  - capas: las capas del cartel separadas en el espacio, en su orden real, y
 *    la vista previa compuesta exactamente con ese orden y esas opacidades.
 *  - video: la tira de cuadros pasando por la ventanilla (cámara lenta 10×),
 *    la torre de megabytes contra el límite del destino y la pantalla final.
 *  - audio: la onda con sus muestras y su reconstrucción en escalones, el
 *    espectro con la pared de Nyquist y la torre de megabytes.
 *
 * Toda animación ocurre en useFrame mutando refs y avanza por tiempo. NO se
 * usa <Text> de drei (cuelga el chunk con Turbopack): el texto va en <Html>.
 */

import * as THREE from "three";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Escenario } from "./_escenario";
import {
  type Bits,
  type CapaId,
  type ColorTextoId,
  type CalidadVideo,
  type FormatoAudio,
  PROFUNDIDADES,
  luma,
  CAPA_DEF,
  COLORES_TEXTO,
  TEXTO_CARTEL,
  ZONA_TEXTO,
  CARTEL_W,
  CARTEL_H,
  fotoCartel,
  colorFoto,
  RES_VIDEO,
  CALIDAD_DEF,
  COMPONENTES,
  senal,
  cuantizarMuestra,
  VENTANA_S,
  bytesTxt,
  num,
} from "./estudio-edicion-data";

export type VistaEdicion = "imagen" | "capas" | "video" | "audio";

export interface EstudioEdicionSceneProps {
  vista: VistaEdicion;
  modoColor: string;
  resetNonce: number;
  // Imagen
  imgW: number;
  imgH: number;
  imgPx: number[];
  bloques: boolean;
  selX: number;
  selY: number;
  bits: Bits;
  codigos: number[];
  onPixel: (x: number, y: number) => void;
  // Capas
  orden: CapaId[];
  visibleFoto: boolean;
  visibleAjuste: boolean;
  visibleBanda: boolean;
  visibleTexto: boolean;
  valorFoto: number;
  valorAjuste: number;
  valorBanda: number;
  valorTexto: number;
  colorTexto: ColorTextoId;
  contraste: number;
  // Video
  destinoVideo: "celular" | "proyector";
  resVideoIdx: number;
  fps: number;
  calidad: CalidadVideo;
  bytesVideo: number;
  maxBytesVideo: number;
  // Audio
  formato: FormatoAudio;
  frecuencia: number;
  bitsAudio: number;
  bytesAudio: number;
  maxBytesAudio: number | null;
}

type Pt = [number, number, number];

const suave = (dt: number, porCuadro: number) => 1 - Math.pow(1 - porCuadro, Math.min(dt, 0.25) * 60);
const OK = "#34d399";
const NO = "#f87171";

function Etiqueta({ pos, children, df = 10, col, fs = 12 }: { pos: Pt; children: ReactNode; df?: number; col?: string; fs?: number }) {
  return (
    <Html position={pos} center distanceFactor={df} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 11px",
          borderRadius: 999,
          background: "rgba(4,10,22,0.86)",
          border: `1px solid ${col ?? "rgba(255,255,255,0.22)"}`,
          color: "#fff",
          fontSize: fs,
          fontWeight: 800,
          whiteSpace: "nowrap",
          boxShadow: "0 6px 18px -8px #000",
        }}
      >
        {children}
      </div>
    </Html>
  );
}

const CAJA = new THREE.BoxGeometry(1, 1, 1);
const ESFERA = new THREE.SphereGeometry(1, 12, 10);

/** Cilindro delgado entre dos puntos (cables, marcos). */
function Barra({ a, b, r = 0.02, color, opacity = 1 }: { a: Pt; b: Pt; r?: number; color: string; opacity?: number }) {
  const va = new THREE.Vector3(...a);
  const vb = new THREE.Vector3(...b);
  const largo = va.distanceTo(vb);
  const medio = va.clone().add(vb).multiplyScalar(0.5);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize());
  return (
    <mesh position={medio} quaternion={q}>
      <cylinderGeometry args={[r, r, largo, 8]} />
      <meshBasicMaterial color={color} transparent={opacity < 1} opacity={opacity} toneMapped={false} />
    </mesh>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 1. LA IMAGEN POR DENTRO
 * ════════════════════════════════════════════════════════════════════════ */

const TABLERO_W = 7.2;
const X_TABLERO = -1.1;
const ALTO_MIN = 0.06;
const ALTO_LUZ = 0.6;
const CANAL_COL = ["#ef4444", "#22c55e", "#3b82f6"];
const CANAL_ETQ = ["R", "G", "B"];

function Pixeles({ w, h, px, onPixel }: { w: number; h: number; px: number[]; onPixel: (x: number, y: number) => void }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const alturas = useRef<Float32Array | null>(null);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const tmp = useMemo(() => new THREE.Color(), []);
  const cel = TABLERO_W / w;

  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    for (let i = 0; i < w * h; i++) {
      tmp.setRGB(px[i * 3]! / 255, px[i * 3 + 1]! / 255, px[i * 3 + 2]! / 255, THREE.SRGBColorSpace);
      mesh.setColorAt(i, tmp);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [px, w, h, tmp]);

  useFrame((_, dt) => {
    const mesh = ref.current;
    if (!mesh) return;
    if (!alturas.current || alturas.current.length !== w * h) alturas.current = new Float32Array(w * h).fill(ALTO_MIN);
    const al = alturas.current;
    const k = suave(dt, 0.12);
    for (let i = 0; i < w * h; i++) {
      const destino = ALTO_MIN + (luma(px[i * 3]!, px[i * 3 + 1]!, px[i * 3 + 2]!) / 255) * ALTO_LUZ;
      al[i] = al[i]! + (destino - al[i]!) * k;
      const x = i % w;
      const y = Math.floor(i / w);
      obj.position.set((x - w / 2 + 0.5) * cel, al[i]! / 2, (y - h / 2 + 0.5) * cel);
      obj.scale.set(cel * 0.9, al[i]!, cel * 0.9);
      obj.updateMatrix();
      mesh.setMatrixAt(i, obj.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  const clic = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.instanceId === undefined) return;
    onPixel(e.instanceId % w, Math.floor(e.instanceId / w));
  };

  return (
    <instancedMesh key={`${w}x${h}`} ref={ref} args={[CAJA, undefined, w * h]} frustumCulled={false} onClick={clic}>
      <meshStandardMaterial roughness={0.62} metalness={0.05} />
    </instancedMesh>
  );
}

function PilaBits({ bits, codigos, pos }: { bits: Bits; codigos: number[]; pos: Pt }) {
  const reparto = PROFUNDIDADES.find((p) => p.bits === bits)!.reparto;
  const PASO = 0.27;
  const LADO = 0.22;
  const SEP = 0.62;
  const x0 = -((reparto.length - 1) * SEP) / 2;
  const alto = Math.max(...reparto);
  return (
    <group position={pos}>
      <Html position={[0, 0.16 + alto * PASO + 0.55, 0]} center distanceFactor={8} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        <div style={{ padding: "6px 11px", borderRadius: 10, background: "rgba(4,10,22,0.88)", border: "1px solid rgba(253,224,71,0.5)", display: "grid", gap: 2, whiteSpace: "nowrap", fontFamily: "ui-monospace, monospace" }}>
          {reparto.map((n, c) => {
            const cod = codigos[c] ?? 0;
            return (
              <div key={c} style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>
                <span style={{ color: bits === 1 ? "#f8fafc" : CANAL_COL[c] }}>{bits === 1 ? "bit" : CANAL_ETQ[c]}</span> {cod.toString(2).padStart(n, "0")} <span style={{ color: "#94a3b8" }}>= {bits === 1 ? (cod ? "blanco" : "negro") : cod}</span>
              </div>
            );
          })}
        </div>
      </Html>
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[1.25, 1.35, 0.1, 40]} />
        <meshStandardMaterial color="#13223a" roughness={0.7} metalness={0.3} />
      </mesh>
      {reparto.map((n, c) => {
        const cod = codigos[c] ?? 0;
        const bin = cod.toString(2).padStart(n, "0");
        const col = bits === 1 ? "#f8fafc" : CANAL_COL[c]!;
        return (
          <group key={c} position={[x0 + c * SEP, 0, 0]}>
            {Array.from({ length: n }, (_, k) => {
              const on = bin[k] === "1";
              return (
                <mesh key={k} geometry={CAJA} position={[0, 0.16 + (n - 1 - k) * PASO, 0]} scale={[LADO, LADO, LADO]}>
                  <meshStandardMaterial color={on ? col : "#1e293b"} emissive={on ? col : "#000000"} emissiveIntensity={on ? 0.75 : 0} roughness={0.4} />
                </mesh>
              );
            })}
            <Html position={[0, -0.02, 0.36]} center distanceFactor={8} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: col, textShadow: "0 1px 4px #000" }}>{bits === 1 ? "1 bit" : CANAL_ETQ[c]}</div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

function VistaImagen({ p }: { p: EstudioEdicionSceneProps }) {
  const { imgW: w, imgH: h, imgPx: px, selX, selY, modoColor } = p;
  const cel = TABLERO_W / w;
  const alto = cel * h;
  const i = selY * w + selX;
  const hSel = ALTO_MIN + (luma(px[i * 3] ?? 0, px[i * 3 + 1] ?? 0, px[i * 3 + 2] ?? 0) / 255) * ALTO_LUZ;
  const sx = (selX - w / 2 + 0.5) * cel;
  const sz = (selY - h / 2 + 0.5) * cel;
  const marco = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (marco.current) marco.current.scale.setScalar(1 + 0.08 * Math.sin(clock.elapsedTime * 4));
  });
  const xPila = X_TABLERO + TABLERO_W / 2 + 1.75;
  const lineasX = Array.from({ length: Math.floor(w / 8) + 1 }, (_, k) => Math.min(k * 8, w));
  const lineasZ = Array.from({ length: Math.ceil(h / 8) + 1 }, (_, k) => Math.min(k * 8, h));
  return (
    <group position={[0, -0.6, 0]}>
      <group position={[X_TABLERO, 0, 0]}>
        <mesh position={[0, -0.07, 0]} receiveShadow>
          <boxGeometry args={[TABLERO_W + 0.36, 0.14, alto + 0.36]} />
          <meshStandardMaterial color="#0d1a2c" roughness={0.8} metalness={0.2} />
        </mesh>
        <Pixeles w={w} h={h} px={px} onPixel={p.onPixel} />
        {p.bloques && (
          <group position={[0, ALTO_MIN + ALTO_LUZ + 0.06, 0]}>
            {lineasX.map((k) => (
              <mesh key={`x${k}`} geometry={CAJA} position={[(k - w / 2) * cel, 0, 0]} scale={[0.018, 0.01, alto]}>
                <meshBasicMaterial color={modoColor} transparent opacity={0.5} toneMapped={false} />
              </mesh>
            ))}
            {lineasZ.map((k) => (
              <mesh key={`z${k}`} geometry={CAJA} position={[0, 0, (k - h / 2) * cel]} scale={[TABLERO_W, 0.01, 0.018]}>
                <meshBasicMaterial color={modoColor} transparent opacity={0.5} toneMapped={false} />
              </mesh>
            ))}
          </group>
        )}
        <group ref={marco} position={[sx, hSel + 0.03, sz]}>
          {[
            [0, -0.5],
            [0, 0.5],
          ].map(([a, b], k) => (
            <mesh key={`a${k}`} geometry={CAJA} position={[a! * cel, 0, b! * cel]} scale={[cel * 1.1, 0.03, 0.03]}>
              <meshBasicMaterial color="#fde047" toneMapped={false} />
            </mesh>
          ))}
          {[
            [-0.5, 0],
            [0.5, 0],
          ].map(([a, b], k) => (
            <mesh key={`b${k}`} geometry={CAJA} position={[a! * cel, 0, b! * cel]} scale={[0.03, 0.03, cel * 1.1]}>
              <meshBasicMaterial color="#fde047" toneMapped={false} />
            </mesh>
          ))}
        </group>
        <Etiqueta pos={[0, -0.05, alto / 2 + 0.55]} df={10} col={`${modoColor}aa`} fs={12}>
          <i className="fa-solid fa-border-all" style={{ color: modoColor }} />
          {w} × {h} píxeles · 1 prisma = 1 píxel · altura = brillo
        </Etiqueta>
      </group>
      <Barra a={[X_TABLERO + sx, hSel + 0.05, sz]} b={[xPila - 1.1, 0.35, 0]} r={0.018} color="#fde047" opacity={0.7} />
      <PilaBits bits={p.bits} codigos={p.codigos} pos={[xPila, 0, 0]} />
      <Etiqueta pos={[xPila, -0.1, 1.55]} df={10} fs={11} col="#fde04799">
        <i className="fa-solid fa-crosshairs" style={{ color: "#fde047" }} />
        Píxel ({selX}, {selY}) · {p.bits} {p.bits === 1 ? "bit" : "bits"}
      </Etiqueta>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. CAPAS DE EDICIÓN
 * ════════════════════════════════════════════════════════════════════════ */

const PLANO_W = 2.2;
const PLANO_H = 2.75;
const TEX_W = 384;
const TEX_H = 480;
const FUENTE_CARTEL = `system-ui, "Segoe UI", Roboto, Arial, sans-serif`;

function nuevoLienzo(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

function lienzoFoto(): HTMLCanvasElement {
  const px = fotoCartel();
  const c = nuevoLienzo(CARTEL_W, CARTEL_H);
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(CARTEL_W, CARTEL_H);
  for (let i = 0; i < CARTEL_W * CARTEL_H; i++) {
    img.data[i * 4] = px[i * 3]!;
    img.data[i * 4 + 1] = px[i * 3 + 1]!;
    img.data[i * 4 + 2] = px[i * 3 + 2]!;
    img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

const rgbCss = (id: ColorTextoId) => {
  const c = COLORES_TEXTO.find((t) => t.id === id)!.rgb;
  return `rgb(${c[0]},${c[1]},${c[2]})`;
};

function dibujarTexto(ctx: CanvasRenderingContext2D, W: number, H: number, color: string) {
  const x0 = ZONA_TEXTO.u0 * W;
  const x1 = ZONA_TEXTO.u1 * W;
  const y0 = ZONA_TEXTO.v0 * H;
  const y1 = ZONA_TEXTO.v1 * H;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  let fs = Math.round(H * 0.08);
  ctx.font = `900 ${fs}px ${FUENTE_CARTEL}`;
  while (ctx.measureText(TEXTO_CARTEL.titulo).width > (x1 - x0) * 0.92 && fs > 8) {
    fs -= 1;
    ctx.font = `900 ${fs}px ${FUENTE_CARTEL}`;
  }
  ctx.fillText(TEXTO_CARTEL.titulo, W / 2, y0 + (y1 - y0) * 0.37);
  let fs2 = Math.round(H * 0.05);
  ctx.font = `700 ${fs2}px ${FUENTE_CARTEL}`;
  while (ctx.measureText(TEXTO_CARTEL.linea).width > (x1 - x0) * 0.9 && fs2 > 8) {
    fs2 -= 1;
    ctx.font = `700 ${fs2}px ${FUENTE_CARTEL}`;
  }
  ctx.fillText(TEXTO_CARTEL.linea, W / 2, y0 + (y1 - y0) * 0.74);
}

function texturaDe(c: HTMLCanvasElement): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

interface EstadoCapaPlano {
  visible: boolean;
  valor: number;
}

function CapaPlano({ id, idx, est, textura, modoColor }: { id: CapaId; idx: number; est: EstadoCapaPlano; textura: THREE.Texture | null; modoColor: string }) {
  const ref = useRef<THREE.Group>(null);
  const destino = idx * 0.85;
  useFrame((_, dt) => {
    if (ref.current) ref.current.position.z += (destino - ref.current.position.z) * suave(dt, 0.1);
  });
  const def = CAPA_DEF[id];
  const opacidad = est.visible ? (id === "foto" ? Math.max(0.02, est.valor) : est.valor) : 0;
  const borde = est.visible ? def.color : "#475569";
  const g = 0.03;
  return (
    <group ref={ref} position={[0, 0, destino]}>
      {textura ? (
        <mesh renderOrder={idx}>
          <planeGeometry args={[PLANO_W, PLANO_H]} />
          <meshBasicMaterial map={textura} transparent opacity={opacidad} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
      ) : (
        <mesh renderOrder={idx}>
          <planeGeometry args={[PLANO_W, PLANO_H]} />
          <meshBasicMaterial color="#000000" transparent opacity={opacidad} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      )}
      <mesh geometry={CAJA} position={[0, PLANO_H / 2, 0]} scale={[PLANO_W + g, g, g]}>
        <meshBasicMaterial color={borde} toneMapped={false} />
      </mesh>
      <mesh geometry={CAJA} position={[0, -PLANO_H / 2, 0]} scale={[PLANO_W + g, g, g]}>
        <meshBasicMaterial color={borde} toneMapped={false} />
      </mesh>
      <mesh geometry={CAJA} position={[-PLANO_W / 2, 0, 0]} scale={[g, PLANO_H + g, g]}>
        <meshBasicMaterial color={borde} toneMapped={false} />
      </mesh>
      <mesh geometry={CAJA} position={[PLANO_W / 2, 0, 0]} scale={[g, PLANO_H + g, g]}>
        <meshBasicMaterial color={borde} toneMapped={false} />
      </mesh>
      <Html position={[0, PLANO_H / 2 + 0.2 + idx * 0.24, 0]} center distanceFactor={7} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 9px",
            borderRadius: 8,
            background: "rgba(4,10,22,0.88)",
            border: `1px solid ${borde}`,
            color: est.visible ? "#fff" : "#94a3b8",
            fontSize: 10.5,
            fontWeight: 800,
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ fontSize: 10, color: modoColor }}>{idx + 1}</span>
          <i className={`fa-solid ${def.icono}`} style={{ color: borde }} />
          {def.etq}
          <span style={{ color: "#94a3b8" }}>{est.visible ? `${Math.round(est.valor * 100)} %` : "oculta"}</span>
        </div>
      </Html>
    </group>
  );
}

function VistaCapas({ p }: { p: EstudioEdicionSceneProps }) {
  const foto = useMemo(() => lienzoFoto(), []);
  const est: Record<CapaId, EstadoCapaPlano> = {
    foto: { visible: p.visibleFoto, valor: p.valorFoto },
    ajuste: { visible: p.visibleAjuste, valor: p.valorAjuste },
    banda: { visible: p.visibleBanda, valor: p.valorBanda },
    texto: { visible: p.visibleTexto, valor: p.valorTexto },
  };

  const texFoto = useMemo(() => {
    const c = nuevoLienzo(TEX_W, TEX_H);
    const ctx = c.getContext("2d")!;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(foto, 0, 0, TEX_W, TEX_H);
    return texturaDe(c);
  }, [foto]);
  const texBanda = useMemo(() => {
    const c = nuevoLienzo(TEX_W, TEX_H);
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#000";
    ctx.fillRect(ZONA_TEXTO.u0 * TEX_W, ZONA_TEXTO.v0 * TEX_H, (ZONA_TEXTO.u1 - ZONA_TEXTO.u0) * TEX_W, (ZONA_TEXTO.v1 - ZONA_TEXTO.v0) * TEX_H);
    return texturaDe(c);
  }, []);
  const texTexto = useMemo(() => {
    const c = nuevoLienzo(TEX_W, TEX_H);
    dibujarTexto(c.getContext("2d")!, TEX_W, TEX_H, rgbCss(p.colorTexto));
    return texturaDe(c);
  }, [p.colorTexto]);

  const claveResultado = `${p.orden.join(",")}|${p.visibleFoto}${p.visibleAjuste}${p.visibleBanda}${p.visibleTexto}|${p.valorFoto},${p.valorAjuste},${p.valorBanda},${p.valorTexto}|${p.colorTexto}`;
  const texResultado = useMemo(() => {
    const [ordenTxt, vis, vals, colorTxt] = claveResultado.split("|");
    const orden = ordenTxt!.split(",") as CapaId[];
    const visibles = vis!.match(/true|false/g)!.map((x) => x === "true");
    const valores = vals!.split(",").map(Number);
    const idxDe: Record<CapaId, number> = { foto: 0, ajuste: 1, banda: 2, texto: 3 };
    const W = TEX_W * 1.5;
    const H = TEX_H * 1.5;
    const c = nuevoLienzo(W, H);
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);
    for (const id of orden) {
      const k = idxDe[id];
      if (!visibles[k]) continue;
      ctx.globalAlpha = valores[k]!;
      if (id === "foto") {
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(foto, 0, 0, W, H);
      } else if (id === "ajuste") {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, W, H);
      } else if (id === "banda") {
        ctx.fillStyle = "#000";
        ctx.fillRect(ZONA_TEXTO.u0 * W, ZONA_TEXTO.v0 * H, (ZONA_TEXTO.u1 - ZONA_TEXTO.u0) * W, (ZONA_TEXTO.v1 - ZONA_TEXTO.v0) * H);
      } else {
        dibujarTexto(ctx, W, H, rgbCss(colorTxt as ColorTextoId));
      }
    }
    ctx.globalAlpha = 1;
    return texturaDe(c);
  }, [claveResultado, foto]);

  useEffect(() => () => texFoto.dispose(), [texFoto]);
  useEffect(() => () => texBanda.dispose(), [texBanda]);
  useEffect(() => () => texTexto.dispose(), [texTexto]);
  useEffect(() => () => texResultado.dispose(), [texResultado]);

  const texturaCapa = (id: CapaId): THREE.Texture | null => (id === "foto" ? texFoto : id === "banda" ? texBanda : id === "texto" ? texTexto : null);
  const okAA = p.contraste >= 4.5;
  const colAA = okAA ? OK : NO;

  return (
    <group position={[0, -0.1, 0]}>
      <group position={[-1.95, -0.15, -0.6]} rotation={[0, 0.78, 0]}>
        {p.orden.map((id, idx) => (
          <CapaPlano key={id} id={id} idx={idx} est={est[id]} textura={texturaCapa(id)} modoColor={p.modoColor} />
        ))}
        <Barra a={[PLANO_W / 2 + 0.25, -PLANO_H / 2, -0.2]} b={[PLANO_W / 2 + 0.25, -PLANO_H / 2, 3 * 0.85 + 0.2]} r={0.015} color={p.modoColor} opacity={0.6} />
        <Etiqueta pos={[PLANO_W / 2 + 0.25, -PLANO_H / 2 - 0.3, 3 * 0.85 + 0.35]} df={9} fs={10.5} col={`${p.modoColor}aa`}>
          arriba ↑
        </Etiqueta>
        <Etiqueta pos={[PLANO_W / 2 + 0.25, -PLANO_H / 2 - 0.3, -0.35]} df={9} fs={10.5}>
          abajo
        </Etiqueta>
      </group>

      {/* Vista previa: el cartel compuesto */}
      <group position={[2.55, 0.0, 0.4]} rotation={[0, -0.22, 0]}>
        <mesh position={[0, 0, -0.07]}>
          <boxGeometry args={[PLANO_W + 0.34, PLANO_H + 0.34, 0.12]} />
          <meshStandardMaterial color="#0b1526" roughness={0.5} metalness={0.4} />
        </mesh>
        <mesh>
          <planeGeometry args={[PLANO_W, PLANO_H]} />
          <meshBasicMaterial map={texResultado} toneMapped={false} />
        </mesh>
        <mesh position={[0, -PLANO_H / 2 - 0.75, -0.15]}>
          <cylinderGeometry args={[0.05, 0.05, 1.2, 10]} />
          <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, -PLANO_H / 2 - 1.36, -0.15]}>
          <cylinderGeometry args={[0.5, 0.6, 0.06, 28]} />
          <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.4} />
        </mesh>
        {/* Contorno de la zona que se revisa */}
        <group position={[0, PLANO_H * (0.5 - (ZONA_TEXTO.v0 + ZONA_TEXTO.v1) / 2), 0.02]}>
          {(() => {
            const zw = (ZONA_TEXTO.u1 - ZONA_TEXTO.u0) * PLANO_W;
            const zh = (ZONA_TEXTO.v1 - ZONA_TEXTO.v0) * PLANO_H;
            const g = 0.018;
            return (
              <>
                <mesh geometry={CAJA} position={[0, zh / 2, 0]} scale={[zw, g, g]}>
                  <meshBasicMaterial color={colAA} toneMapped={false} transparent opacity={0.9} />
                </mesh>
                <mesh geometry={CAJA} position={[0, -zh / 2, 0]} scale={[zw, g, g]}>
                  <meshBasicMaterial color={colAA} toneMapped={false} transparent opacity={0.9} />
                </mesh>
                <mesh geometry={CAJA} position={[-zw / 2, 0, 0]} scale={[g, zh, g]}>
                  <meshBasicMaterial color={colAA} toneMapped={false} transparent opacity={0.9} />
                </mesh>
                <mesh geometry={CAJA} position={[zw / 2, 0, 0]} scale={[g, zh, g]}>
                  <meshBasicMaterial color={colAA} toneMapped={false} transparent opacity={0.9} />
                </mesh>
              </>
            );
          })()}
        </group>
        <Etiqueta pos={[0, PLANO_H / 2 + 0.38, 0]} df={9} fs={12} col={`${colAA}aa`}>
          <i className={`fa-solid ${okAA ? "fa-circle-check" : "fa-triangle-exclamation"}`} style={{ color: colAA }} />
          Vista previa · contraste {num(Math.min(p.contraste, 21), 2)}:1
        </Etiqueta>
      </group>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. VIDEO
 * ════════════════════════════════════════════════════════════════════════ */

const RES_TEX = [32, 43, 64, 96, 192];

/** Un cuadro del video: la foto a la resolución elegida, con bloques si faltan bits. */
function lienzoCuadro(resIdx: number, calidad: CalidadVideo): HTMLCanvasElement {
  const w = RES_TEX[resIdx] ?? 64;
  const h = Math.round((w * 9) / 16);
  const bloque = calidad === "nitido" ? 1 : calidad === "aceptable" ? 2 : 4;
  const c = nuevoLienzo(w, h);
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(w, h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const bx = Math.floor(x / bloque) * bloque;
      const by = Math.floor(y / bloque) * bloque;
      const col = colorFoto((bx + bloque / 2) / w, (by + bloque / 2) / h, 16 / 9);
      const k = (y * w + x) * 4;
      img.data[k] = col[0];
      img.data[k + 1] = col[1];
      img.data[k + 2] = col[2];
      img.data[k + 3] = 255;
    }
  ctx.putImageData(img, 0, 0);
  return c;
}

const N_CUADROS = 8;
const SEP_CUADRO = 1.35;
const CUADRO_W = 1.12;
const CUADRO_H = 0.63;

function TiraCuadros({ tex, fps, modoColor }: { tex: THREE.Texture; fps: number; modoColor: string }) {
  const grupo = useRef<THREE.Group>(null);
  const avance = useRef(0);
  useFrame((_, dt) => {
    // Cámara lenta 10×: pasan fps/10 cuadros por segundo real.
    avance.current = (avance.current + Math.min(dt, 0.1) * (fps / 10) * SEP_CUADRO) % SEP_CUADRO;
    if (grupo.current) grupo.current.position.x = -avance.current;
  });
  const ancho = N_CUADROS * SEP_CUADRO;
  return (
    <group position={[0, 2.35, -1.3]}>
      <group ref={grupo}>
        <mesh position={[SEP_CUADRO / 2, 0, -0.03]}>
          <boxGeometry args={[ancho + SEP_CUADRO, CUADRO_H + 0.42, 0.04]} />
          <meshStandardMaterial color="#111827" roughness={0.6} />
        </mesh>
        {Array.from({ length: N_CUADROS + 1 }, (_, k) => {
          const x = (k - N_CUADROS / 2) * SEP_CUADRO;
          return (
            <group key={k} position={[x, 0, 0]}>
              <mesh>
                <planeGeometry args={[CUADRO_W, CUADRO_H]} />
                <meshBasicMaterial map={tex} toneMapped={false} />
              </mesh>
              {[-0.45, -0.15, 0.15, 0.45].map((dx) => (
                <group key={dx}>
                  <mesh geometry={CAJA} position={[dx, CUADRO_H / 2 + 0.12, 0.01]} scale={[0.12, 0.08, 0.01]}>
                    <meshBasicMaterial color="#e5e7eb" />
                  </mesh>
                  <mesh geometry={CAJA} position={[dx, -CUADRO_H / 2 - 0.12, 0.01]} scale={[0.12, 0.08, 0.01]}>
                    <meshBasicMaterial color="#e5e7eb" />
                  </mesh>
                </group>
              ))}
            </group>
          );
        })}
      </group>
      {/* Ventanilla */}
      <group position={[0, 0, 0.08]}>
        {[
          [0, CUADRO_H / 2 + 0.26, SEP_CUADRO * 0.95, 0.04],
          [0, -CUADRO_H / 2 - 0.26, SEP_CUADRO * 0.95, 0.04],
          [-SEP_CUADRO * 0.47, 0, 0.04, CUADRO_H + 0.56],
          [SEP_CUADRO * 0.47, 0, 0.04, CUADRO_H + 0.56],
        ].map(([x, y, sw, sh], k) => (
          <mesh key={k} geometry={CAJA} position={[x!, y!, 0]} scale={[sw!, sh!, 0.04]}>
            <meshBasicMaterial color={modoColor} toneMapped={false} />
          </mesh>
        ))}
      </group>
      <mesh position={[-ancho / 2 - 0.1, 0, 0.06]}>
        <planeGeometry args={[1.6, CUADRO_H + 0.6]} />
        <meshBasicMaterial color="#040a16" transparent opacity={0.85} />
      </mesh>
      <mesh position={[ancho / 2 + 0.1, 0, 0.06]}>
        <planeGeometry args={[1.6, CUADRO_H + 0.6]} />
        <meshBasicMaterial color="#040a16" transparent opacity={0.85} />
      </mesh>
      <Etiqueta pos={[0, CUADRO_H / 2 + 0.62, 0.1]} df={10} fs={11.5} col={`${modoColor}aa`}>
        <i className="fa-solid fa-film" style={{ color: modoColor }} />
        {fps} cuadros cada segundo · aquí, en cámara lenta 10×
      </Etiqueta>
    </group>
  );
}

const CUBO = 0.3;
const PASO_CUBO = 0.35;
const POR_CAPA = 9;
const MAX_CUBOS = 90;

/** Torre de megabytes: cada cubo vale `unidad` bytes; la placa marca el límite del destino. */
function TorreDatos({ bytes, maxBytes, unidadMin, pos, modoColor }: { bytes: number; maxBytes: number | null; unidadMin: number; pos: Pt; modoColor: string }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const mostrados = useRef(0);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const tmp = useMemo(() => new THREE.Color(), []);
  const colOk = useMemo(() => new THREE.Color(modoColor), [modoColor]);
  const colMal = useMemo(() => new THREE.Color(NO), []);
  const unidad = [unidadMin, unidadMin * 10, unidadMin * 100, unidadMin * 1000].find((u) => bytes / u <= 45) ?? unidadMin * 1000;
  const cubos = bytes / unidad;
  const limiteCubos = maxBytes === null ? Infinity : maxBytes / unidad;
  useFrame((_, dt) => {
    const mesh = ref.current;
    if (!mesh) return;
    const destino = Math.min(cubos, MAX_CUBOS);
    mostrados.current += (destino - mostrados.current) * suave(dt, 0.08);
    const m = mostrados.current;
    for (let i = 0; i < MAX_CUBOS; i++) {
      const capa = Math.floor(i / POR_CAPA);
      const fila = Math.floor((i % POR_CAPA) / 3);
      const col = (i % POR_CAPA) % 3;
      const f = Math.max(0, Math.min(1, m - i));
      obj.position.set((col - 1) * PASO_CUBO, capa * PASO_CUBO + (CUBO * Math.max(0.05, f)) / 2, (fila - 1) * PASO_CUBO);
      obj.scale.set(f > 0 ? CUBO : 0.0001, f > 0 ? CUBO * Math.max(0.05, f) : 0.0001, f > 0 ? CUBO : 0.0001);
      obj.updateMatrix();
      mesh.setMatrixAt(i, obj.matrix);
      tmp.copy(i + 1 > limiteCubos ? colMal : colOk);
      mesh.setColorAt(i, tmp);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });
  const hLimite = (limiteCubos / POR_CAPA) * PASO_CUBO;
  const limiteVisible = maxBytes !== null && limiteCubos <= MAX_CUBOS + POR_CAPA;
  const hTorre = (Math.ceil(Math.min(cubos, MAX_CUBOS) / POR_CAPA) || 1) * PASO_CUBO;
  const fuera = cubos > MAX_CUBOS;
  return (
    <group position={pos}>
      <mesh position={[0, -0.04, 0]}>
        <boxGeometry args={[1.4, 0.08, 1.4]} />
        <meshStandardMaterial color="#13223a" roughness={0.7} metalness={0.3} />
      </mesh>
      <instancedMesh ref={ref} args={[CAJA, undefined, MAX_CUBOS]} frustumCulled={false}>
        <meshStandardMaterial roughness={0.35} metalness={0.2} emissive="#0b1220" />
      </instancedMesh>
      {limiteVisible && (
        <group position={[0, hLimite, 0]}>
          <mesh>
            <boxGeometry args={[1.45, 0.02, 1.45]} />
            <meshBasicMaterial color="#fca5a5" transparent opacity={0.45} toneMapped={false} depthWrite={false} />
          </mesh>
          <Etiqueta pos={[-1.35, 0, 0]} df={9} fs={10.5} col="#fca5a5aa">
            límite {bytesTxt(maxBytes!)}
          </Etiqueta>
        </group>
      )}
      <Etiqueta pos={[0, hTorre + 0.5, 0]} df={9} fs={12} col={`${bytes <= (maxBytes ?? Infinity) ? OK : NO}aa`}>
        <i className="fa-solid fa-database" style={{ color: bytes <= (maxBytes ?? Infinity) ? OK : NO }} />
        {bytesTxt(bytes)}
        <span style={{ color: "#94a3b8", fontWeight: 700 }}>· 1 cubo = {bytesTxt(unidad)}</span>
        {fuera ? ` · ${num(MAX_CUBOS)} cubos a la vista` : ""}
      </Etiqueta>
    </group>
  );
}

function VistaVideo({ p }: { p: EstudioEdicionSceneProps }) {
  const tex = useMemo(() => {
    const t = texturaDe(lienzoCuadro(p.resVideoIdx, p.calidad));
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
    t.generateMipmaps = false;
    return t;
  }, [p.resVideoIdx, p.calidad]);
  useEffect(() => () => tex.dispose(), [tex]);
  const r = RES_VIDEO[p.resVideoIdx] ?? RES_VIDEO[0];
  const unidad = p.destinoVideo === "celular" ? 1e6 : 1e8;
  const cal = CALIDAD_DEF[p.calidad];
  return (
    <group position={[0, -0.7, 0]}>
      <mesh position={[0, -0.06, 0]} receiveShadow>
        <cylinderGeometry args={[6.2, 6.2, 0.1, 64]} />
        <meshStandardMaterial color="#0d1a2c" roughness={0.9} />
      </mesh>
      <TiraCuadros tex={tex} fps={p.fps} modoColor={p.modoColor} />
      <TorreDatos bytes={p.bytesVideo} maxBytes={p.maxBytesVideo} unidadMin={unidad} pos={[-3.3, 0, 0.2]} modoColor={p.modoColor} />
      {p.destinoVideo === "celular" ? (
        <group position={[2.9, 1.05, 1.1]} rotation={[-0.12, -0.35, 0]}>
          <mesh>
            <boxGeometry args={[2.2, 1.14, 0.1]} />
            <meshStandardMaterial color="#0f172a" roughness={0.35} metalness={0.6} />
          </mesh>
          <mesh position={[0, 0, 0.052]}>
            <planeGeometry args={[1.96, 1.1]} />
            <meshBasicMaterial map={tex} toneMapped={false} />
          </mesh>
          <mesh position={[0, -0.95, -0.25]} rotation={[0.3, 0, 0]}>
            <boxGeometry args={[0.7, 0.9, 0.06]} />
            <meshStandardMaterial color="#334155" roughness={0.6} />
          </mesh>
        </group>
      ) : (
        <group position={[2.7, 0, 0.6]} rotation={[0, -0.35, 0]}>
          <mesh position={[0, 1.55, -0.5]}>
            <boxGeometry args={[2.9, 1.7, 0.04]} />
            <meshStandardMaterial color="#e5e7eb" roughness={0.9} />
          </mesh>
          <mesh position={[0, 1.55, -0.47]}>
            <planeGeometry args={[2.72, 1.53]} />
            <meshBasicMaterial map={tex} toneMapped={false} />
          </mesh>
          {[-1.35, 1.35].map((x) => (
            <mesh key={x} position={[x, 0.35, -0.5]}>
              <cylinderGeometry args={[0.03, 0.03, 0.7, 8]} />
              <meshStandardMaterial color="#64748b" metalness={0.6} />
            </mesh>
          ))}
          <mesh position={[0, 0.16, 1.1]}>
            <boxGeometry args={[0.7, 0.3, 0.55]} />
            <meshStandardMaterial color="#1f2937" roughness={0.4} metalness={0.5} />
          </mesh>
          <mesh position={[0, 0.18, 0.82]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.06, 20]} />
            <meshStandardMaterial color="#93c5fd" emissive="#93c5fd" emissiveIntensity={0.8} />
          </mesh>
        </group>
      )}
      <Etiqueta pos={[2.8, 0.12, 2.3]} df={9} fs={11.5} col={`${cal.color}aa`}>
        <i className="fa-solid fa-display" style={{ color: cal.color }} />
        {r.id} · {num(r.w)} × {num(r.h)} · {cal.etq.toLowerCase()}
      </Etiqueta>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 4. AUDIO
 * ════════════════════════════════════════════════════════════════════════ */

const ONDA_X0 = -4.6;
const ONDA_X1 = 1.4;
const ONDA_Y = 1.75;
const ONDA_A = 1.0;
const MAX_MUESTRAS = 100;
const KHZ_MAX = 24;
const tX = (t: number) => ONDA_X0 + (t / VENTANA_S) * (ONDA_X1 - ONDA_X0);
const fX = (hz: number) => ONDA_X0 + (hz / (KHZ_MAX * 1000)) * (ONDA_X1 - ONDA_X0);

function VistaAudio({ p }: { p: EstudioEdicionSceneProps }) {
  const pcm = p.formato === "pcm";
  const fs = pcm ? p.frecuencia : 44100;
  const nyq = fs / 2;
  const curva = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let k = 0; k <= 480; k++) {
      const t = (k / 480) * VENTANA_S;
      pts.push(new THREE.Vector3(tX(t), ONDA_Y + senal(t) * ONDA_A * 0.98, 0));
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 480, 0.014, 6, false);
  }, []);
  useEffect(() => () => curva.dispose(), [curva]);

  const n = Math.min(MAX_MUESTRAS, Math.floor(fs * VENTANA_S));
  const bitsQ = pcm ? p.bitsAudio : 16;
  const muestras = Array.from({ length: n }, (_, k) => cuantizarMuestra(senal(k / fs, nyq), bitsQ));
  const dx = ((1 / fs) / VENTANA_S) * (ONDA_X1 - ONDA_X0);
  const stems = useRef<THREE.InstancedMesh>(null);
  const puntas = useRef<THREE.InstancedMesh>(null);
  const escalones = useRef<THREE.InstancedMesh>(null);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const clave = `${fs}-${bitsQ}`;
  const aparecer = useRef(0);
  useEffect(() => {
    aparecer.current = 0;
  }, [clave]);
  useFrame((_, dt) => {
    aparecer.current = Math.min(1, aparecer.current + dt * 1.4);
    const vis = aparecer.current * n;
    for (let k = 0; k < MAX_MUESTRAS; k++) {
      const v = k < n ? muestras[k]! * ONDA_A : 0;
      const f = k < vis ? 1 : 0;
      const x = ONDA_X0 + k * dx;
      if (stems.current) {
        obj.position.set(x, ONDA_Y + v / 2, 0.02);
        obj.scale.set(f ? 0.02 : 0.0001, Math.max(0.0001, Math.abs(v)) * (f || 0.0001), f ? 0.02 : 0.0001);
        obj.updateMatrix();
        stems.current.setMatrixAt(k, obj.matrix);
      }
      if (puntas.current) {
        obj.position.set(x, ONDA_Y + v, 0.02);
        obj.scale.setScalar(f ? 0.045 : 0.0001);
        obj.updateMatrix();
        puntas.current.setMatrixAt(k, obj.matrix);
      }
      if (escalones.current) {
        obj.position.set(x + dx / 2, ONDA_Y + v, -0.02);
        obj.scale.set(f ? dx : 0.0001, f ? 0.03 : 0.0001, f ? 0.03 : 0.0001);
        obj.updateMatrix();
        escalones.current.setMatrixAt(k, obj.matrix);
      }
    }
    if (stems.current) stems.current.instanceMatrix.needsUpdate = true;
    if (puntas.current) puntas.current.instanceMatrix.needsUpdate = true;
    if (escalones.current) escalones.current.instanceMatrix.needsUpdate = true;
  });

  const colM = p.modoColor;
  const maxA = Math.max(...COMPONENTES.map((c) => c.amp));
  const unidad = p.maxBytesAudio !== null ? 1e6 : 1e7;
  return (
    <group position={[0, -0.9, 0]}>
      <mesh position={[0, -0.06, 0]} receiveShadow>
        <cylinderGeometry args={[6.4, 6.4, 0.1, 64]} />
        <meshStandardMaterial color="#0d1a2c" roughness={0.9} />
      </mesh>
      {/* Panel del osciloscopio */}
      <mesh position={[(ONDA_X0 + ONDA_X1) / 2, ONDA_Y, -0.12]}>
        <boxGeometry args={[ONDA_X1 - ONDA_X0 + 0.5, 2.6, 0.1]} />
        <meshStandardMaterial color="#0a1628" roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh geometry={CAJA} position={[(ONDA_X0 + ONDA_X1) / 2, ONDA_Y, -0.05]} scale={[ONDA_X1 - ONDA_X0, 0.012, 0.01]}>
        <meshBasicMaterial color="#334155" />
      </mesh>
      <mesh geometry={curva}>
        <meshBasicMaterial color="#94a3b8" transparent opacity={0.75} />
      </mesh>
      <instancedMesh ref={escalones} args={[CAJA, undefined, MAX_MUESTRAS]} frustumCulled={false}>
        <meshBasicMaterial color={colM} transparent opacity={0.55} toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={stems} args={[CAJA, undefined, MAX_MUESTRAS]} frustumCulled={false}>
        <meshBasicMaterial color={colM} toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={puntas} args={[ESFERA, undefined, MAX_MUESTRAS]} frustumCulled={false}>
        <meshStandardMaterial color="#fef3c7" emissive={colM} emissiveIntensity={0.9} />
      </instancedMesh>
      <Etiqueta pos={[(ONDA_X0 + ONDA_X1) / 2, ONDA_Y + 1.55, 0]} df={10} fs={11.5} col={`${colM}aa`}>
        <i className="fa-solid fa-wave-square" style={{ color: colM }} />
        2 ms de sonido · {n} muestras{pcm ? ` · ${p.bitsAudio} bits = ${num(2 ** p.bitsAudio)} niveles` : " (fuente a 44.1 kHz)"}
      </Etiqueta>

      {/* Espectro con la pared de Nyquist */}
      <group position={[0, 0, 1.6]}>
        <mesh geometry={CAJA} position={[(ONDA_X0 + ONDA_X1) / 2, 0.01, 0]} scale={[ONDA_X1 - ONDA_X0, 0.02, 0.5]}>
          <meshStandardMaterial color="#13223a" roughness={0.8} />
        </mesh>
        {COMPONENTES.map((c) => {
          const dentro = c.hz < nyq;
          const h = (c.amp / maxA) * 1.1;
          const col = dentro ? colM : NO;
          return (
            <group key={c.hz} position={[fX(c.hz), 0, 0]}>
              <mesh geometry={CAJA} position={[0, h / 2 + 0.02, 0]} scale={[0.14, h, 0.14]}>
                <meshStandardMaterial color={col} emissive={col} emissiveIntensity={dentro ? 0.5 : 0.15} transparent opacity={dentro ? 1 : 0.45} />
              </mesh>
              <Etiqueta pos={[0, h + 0.26, 0]} df={9} fs={9.5} col={`${col}99`}>
                {c.etq}
              </Etiqueta>
            </group>
          );
        })}
        <mesh position={[fX(nyq), 0.7, 0]}>
          <boxGeometry args={[0.03, 1.4, 0.7]} />
          <meshBasicMaterial color="#fde047" transparent opacity={0.55} toneMapped={false} depthWrite={false} />
        </mesh>
        <Etiqueta pos={[fX(nyq), 1.62, 0]} df={9} fs={10.5} col="#fde047aa">
          Nyquist: {String(nyq / 1000)} kHz
        </Etiqueta>
        <Etiqueta pos={[(ONDA_X0 + ONDA_X1) / 2, -0.05, 0.5]} df={9} fs={10}>
          Espectro de la señal · 0 Hz → 24 kHz
        </Etiqueta>
      </group>

      <TorreDatos bytes={p.bytesAudio} maxBytes={p.maxBytesAudio} unidadMin={unidad} pos={[3.3, 0, 0.45]} modoColor={colM} />
      {/* Bocina */}
      <group position={[3.5, 0.95, -1.9]}>
        <mesh>
          <boxGeometry args={[1.1, 1.9, 0.8]} />
          <meshStandardMaterial color="#1f2937" roughness={0.5} />
        </mesh>
        {[0.42, -0.25].map((y, k) => (
          <mesh key={y} position={[0, y, 0.41]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[k === 0 ? 0.2 : 0.36, k === 0 ? 0.2 : 0.36, 0.04, 28]} />
            <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.35} emissive={colM} emissiveIntensity={0.12} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ── Escena ───────────────────────────────────────────────────────────── */

export default function EstudioEdicionScene(p: EstudioEdicionSceneProps) {
  const { vista, modoColor, resetNonce } = p;
  const cam = useMemo((): { pos: Pt; target: Pt } => {
    if (vista === "imagen") return { pos: [1.0, 7.4, 7.6], target: [0.6, -0.4, 0.25] };
    if (vista === "capas") return { pos: [0.4, 1.2, 8.4], target: [0.3, 0.1, 0] };
    if (vista === "video") return { pos: [0, 3.0, 9.4], target: [0, 0.75, 0] };
    return { pos: [-0.3, 2.9, 9.2], target: [-0.3, 0.7, 0] };
  }, [vista]);

  return (
    <Canvas key={`${vista}-${resetNonce}`} dpr={[1, 1.75]} camera={{ position: cam.pos, fov: 42 }} gl={{ antialias: true }}>
      {/* Suelo, luz de tres puntos y entorno que reflejar. */}
      {/* Sin altura: esta escena no tenía sombra de la que leerla, así
          que el escenario la MIDE de la propia escena al montarse, en
          vez de que alguien la adivine. */}
      <Escenario acento="#38bdf8" />
      <pointLight position={[-6, 3, 5]} intensity={0.4} color={modoColor} />

      {vista === "imagen" && <VistaImagen p={p} />}
      {vista === "capas" && <VistaCapas p={p} />}
      {vista === "video" && <VistaVideo p={p} />}
      {vista === "audio" && <VistaAudio p={p} />}

      <OrbitControls makeDefault enablePan={false} enableZoom minDistance={4} maxDistance={18} maxPolarAngle={Math.PI * 0.48} minPolarAngle={Math.PI * 0.05} target={cam.target} />
      <EffectComposer>
        <Bloom intensity={0.22} luminanceThreshold={0.8} luminanceSmoothing={0.85} mipmapBlur />
        <Vignette eskil={false} offset={0.18} darkness={0.6} />
      </EffectComposer>
    </Canvas>
  );
}
