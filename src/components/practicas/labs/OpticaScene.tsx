"use client";

/**
 * Escena 3D — "Óptica geométrica: lentes, espejos y formación de imágenes"
 * (CNEYT-V-P06-A2). Un banco óptico de laboratorio de física de verdad.
 *
 * MODOS (prop `modo`):
 *  · "lentes"     — riel de aluminio con escala grabada; una vela en su jinete,
 *    la lente de vidrio óptico (convergente o divergente) y una pantalla
 *    translúcida. Los tres rayos principales son haces láser (paralelo → F′,
 *    central sin desviarse, focal → sale paralelo). La imagen real se ve
 *    NÍTIDA en la pantalla solo cuando la pantalla está en dᵢ; fuera de ahí,
 *    borrosa con el círculo de desenfoque exacto A·|1 − dₚ/dᵢ|. La imagen
 *    virtual aparece como un «fantasma» detrás de la lente.
 *    Gauss: 1/f = 1/dₒ + 1/dᵢ, M = −dᵢ/dₒ.
 *  · "espejos"    — espejo plano, cóncavo o convexo (casquete de radio R = 2f
 *    exacto, metal pulido). Imagen real en el aire o virtual tras el espejo.
 *  · "refraccion" — disco óptico de Hartl con bloques de agua/vidrio/diamante
 *    (Snell + Fresnel + reflexión total), fibra óptica y prisma (dispersión).
 *  · "ojo"        — ojo humano en corte: miopía e hipermetropía y su anteojo.
 *
 * Toda la geometría de rayos sale de cálculo cerrado (resolverGauss,
 * resolverSnell, trazarPrisma, focoOjoMm). React Compiler: las animaciones
 * mutan refs dentro de useFrame; nunca setState por cuadro.
 */

import * as THREE from "three";
import { useMemo, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, ContactShadows, PerformanceMonitor, Environment, Lightformer, CubeCamera } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { MesaLaboratorio, calidadEscena } from "./_escenario";
import {
  type ModoLab, type TipoLente, type TipoEspejo, type VistaRefraccion, type CondicionOjo,
  resolverGauss, enfoquePantalla, H_OBJ, LENTE_RADIO_U, NITIDEZ_OK, fmtDist,
} from "./optica-data";
import {
  S, SUELO, RIEL_Y, X_RIEL, X_FIN, Y_LIM, PANT_H, FOV,
  Haces, Pulso, Riel, Jinete, Lente3D, Espejo3D, Vela, Pantalla, MarcaFoco, Etiqueta, Guia,
  superficieEspejo, discontinuo, polilinea, encuadrar, LATON,
  type Pt, type Seg,
} from "./optica-banco3d";
import { EscenaFrontera, EscenaFibra, EscenaPrisma, FIBRA_X0, FIBRA_X1 } from "./optica-refraccion3d";
import { EscenaOjo, geometriaOjo } from "./optica-ojo3d";

export interface OpticaSceneProps {
  modo: ModoLab;
  // lentes
  tipoLente: TipoLente;
  fLente: number;   // |f|
  doLente: number;
  dp: number;       // posición de la pantalla tras la lente (u)
  // espejos
  tipoEspejo: TipoEspejo;
  fEspejo: number;  // |f|
  doEspejo: number;
  // refracción
  medio1: string;
  medio2: string;
  thetaInc: number;
  vistaRefr: VistaRefraccion;
  thetaPrisma: number;
  // ojo
  condOjo: CondicionOjo;
  pc: number;
  // común
  playing: boolean;
  accent: string;
  resetNonce: number;
}

const FONDO = "#04080f";
const ROJO = "#ff4646";
const VERDE = "#3dff86";
const AZUL = "#48b4ff";

/* ═══════════════════════════════════════════════════════════════════════════
 * BANCO: lente o espejo
 * ═══════════════════════════════════════════════════════════════════════════ */
interface Banco {
  tip: Pt;
  I: Pt | null;
  virtual: boolean;
  rayos: { col: string; path: Pt[] }[];
  virtuales: Seg[];
  M: number;
  di: number;
  enInfinito: boolean;
}

function trazarBanco(esLente: boolean, fU: number, doU: number, dpU: number, tipoEspejo: TipoEspejo): Banco {
  const ho = H_OBJ;
  const H = ho * S;
  const r = resolverGauss(fU, doU, ho);
  const A = LENTE_RADIO_U * S;
  const tip: Pt = [-doU * S, H, 0];
  const finito = !r.enInfinito && isFinite(r.di);
  const I: Pt | null = finito ? [(esLente ? r.di : -r.di) * S, r.hi * S, 0] : null;
  const virtual = r.tipoImagen === "virtual";
  const Rs = esLente || !isFinite(fU) ? Infinity : 2 * Math.abs(fU) * S;
  const xs = (y: number) => (esLente ? 0 : superficieEspejo(tipoEspejo, Rs, y));
  const xPant = dpU * S;

  // dirección del rayo central (de la punta al centro/vértice)
  const L0 = Math.hypot(tip[0], tip[1]);
  const dC: [number, number] = [-tip[0] / L0, -tip[1] / L0];
  const dirSal = (P: Pt): [number, number] => {
    if (!I) return esLente ? dC : [-dC[0], dC[1]];
    const v: [number, number] = virtual ? [P[0] - I[0], P[1] - I[1]] : [I[0] - P[0], I[1] - P[1]];
    const L = Math.hypot(v[0], v[1]);
    if (L < 1e-6) return esLente ? dC : [-dC[0], dC[1]];
    return [v[0] / L, v[1] / L];
  };
  const extender = (P: Pt, d: [number, number]): Pt => {
    if (Math.abs(d[0]) < 1e-6) return [P[0], d[1] > 0 ? Y_LIM : RIEL_Y + 0.1, 0];
    let t = ((d[0] > 0 ? X_FIN : -X_FIN) - P[0]) / d[0];
    if (esLente && d[0] > 0 && xPant > P[0] + 1e-3) {
      const ts = (xPant - P[0]) / d[0];
      const ys = P[1] + d[1] * ts;
      if (Math.abs(ys) <= PANT_H / 2) t = Math.min(t, ts);
    }
    if (d[1] > 1e-6) t = Math.min(t, (Y_LIM - P[1]) / d[1]);
    if (d[1] < -1e-6) t = Math.min(t, (RIEL_Y + 0.08 - P[1]) / d[1]);
    return [P[0] + d[0] * t, P[1] + d[1] * t, 0];
  };

  const rayos: { col: string; path: Pt[] }[] = [];
  const golpes: { col: string; P: Pt }[] = [];
  // 1. Paralelo al eje → sale por el foco
  const P1: Pt = [xs(H), H, 0];
  rayos.push({ col: ROJO, path: [tip, P1, extender(P1, dirSal(P1))] });
  golpes.push({ col: ROJO, P: P1 });
  // 2. Por el centro óptico / vértice
  const P2: Pt = [0, 0, 0];
  rayos.push({ col: VERDE, path: [tip, P2, extender(P2, dirSal(P2))] });
  golpes.push({ col: VERDE, P: P2 });
  // 3. Por el foco → sale paralelo (solo si cabe en la abertura)
  if (isFinite(fU)) {
    const y3 = ((ho * fU) / (fU - doU)) * S;
    if (isFinite(y3) && Math.abs(y3) <= A * 0.97) {
      const P3: Pt = [xs(y3), y3, 0];
      rayos.push({ col: AZUL, path: [tip, P3, extender(P3, dirSal(P3))] });
      golpes.push({ col: AZUL, P: P3 });
    }
  }
  // prolongaciones punteadas hacia la imagen virtual
  const virtuales: Seg[] = [];
  if (virtual && I && Math.abs(I[0]) <= X_FIN + 2 && Math.abs(I[1]) < 6) {
    for (const g of golpes) virtuales.push(...discontinuo(g.P, I, g.col, 0.42));
  }
  return { tip, I, virtual, rayos, virtuales, M: r.M, di: r.di, enInfinito: r.enInfinito };
}

function EscenaBanco({ esLente, fU, doU, dpU, tipoEspejo, playing, fino, vivo = false }: {
  esLente: boolean; fU: number; doU: number; dpU: number; tipoEspejo: TipoEspejo; playing: boolean; fino: boolean; vivo?: boolean;
}) {
  const H = H_OBJ * S;
  const A = LENTE_RADIO_U * S;
  const b = trazarBanco(esLente, fU, doU, dpU, tipoEspejo);
  const enf = enfoquePantalla(fU, doU, dpU);
  const xPant = dpU * S;
  const nitida = esLente && enf.hayImagenReal && enf.nitidez >= NITIDEZ_OK;

  const segs: Seg[] = [];
  for (const r of b.rayos) segs.push(...polilinea(r.path, r.col, 1, 0.07));
  segs.push(...b.virtuales);

  const conv = fU > 0;
  const fS = Math.abs(fU) * S;
  const Rs = isFinite(fU) ? 2 * fS : Infinity;

  // ¿Dónde y cómo se dibuja la imagen?
  const I = b.I;
  const dentro = I != null && Math.abs(I[0]) <= X_FIN && Math.abs(I[1]) <= 2.9;
  const escalaImg = Math.abs(b.M);
  const verFantasma = dentro && b.virtual && escalaImg * H <= 2.6;
  const verAerea = dentro && !esLente && !b.virtual && I![1] > RIEL_Y + 0.2;

  let etqImg: React.ReactNode = null;
  if (b.enInfinito) etqImg = <Etiqueta pos={[esLente ? 5.2 : -5.2, 2.3, 0]} color="#fde047">imagen en el infinito</Etiqueta>;
  else if (I && dentro) {
    const arriba = I[1] >= 0;
    const txt = b.virtual ? `imagen virtual · ${fmtDist(b.di)}` : nitida ? `imagen nítida · ${fmtDist(b.di)}` : `imagen real · ${fmtDist(b.di)}`;
    etqImg = <Etiqueta pos={[I[0], I[1] + (arriba ? 0.5 : -0.5), 0.2]} color={b.virtual ? "#9fe8ff" : nitida ? "#86efac" : "#fde047"}>{txt}</Etiqueta>;
  } else if (I) {
    etqImg = <Etiqueta pos={[Math.sign(I[0]) * 6.4, 2.3, 0]} color="#fde047" ancha>imagen a {fmtDist(b.di)}: fuera del banco</Etiqueta>;
  }

  return (
    <group>
      <Riel />

      {/* Objeto: vela sobre su platillo de latón */}
      <Jinete x={b.tip[0]} tope={-0.06}>
        <mesh position={[0, -0.035, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.21, 0.17, 0.05, 32]} />
          <meshStandardMaterial {...LATON} />
        </mesh>
        <Vela H={H} playing={playing} />
      </Jinete>

      {/* Lente o espejo en su jinete */}
      <Jinete x={0} tope={-A - 0.2}>
        {esLente
          ? <Lente3D fU={fU} convergente={conv} A={A} fino={fino} />
          : (
            /* El espejo refleja la escena de verdad (vela, rayos, riel): una
               cámara cúbica justo delante de su cara. En equipos modestos se
               actualiza solo cuando algo cambia; en los buenos, cada cuadro. */
            <CubeCamera position={[-0.4, 0, 0]} resolution={fino ? 128 : 256} frames={vivo ? Infinity : 2} near={0.05} far={60}>
              {(tex) => (
                <group position={[0.4, 0, 0]}>
                  <Espejo3D tipo={tipoEspejo} Rs={Rs} A={A} envMap={tex} />
                </group>
              )}
            </CubeCamera>
          )}
      </Jinete>

      {/* Pantalla translúcida (solo con lentes) */}
      {esLente && (
        <Jinete x={xPant} tope={-PANT_H / 2 - 0.07}>
          <Pantalla escala={enf.escala} blur={enf.desenfoque * S} H={H} playing={playing} />
        </Jinete>
      )}

      {/* Focos (cuentas sobre el eje y marcas en el riel) */}
      {esLente && (
        <>
          <MarcaFoco x={fU * S} />
          <MarcaFoco x={-fU * S} />
          <MarcaFoco x={2 * fU * S} tenue />
          <MarcaFoco x={-2 * fU * S} tenue />
        </>
      )}
      {!esLente && tipoEspejo !== "plano" && (
        <>
          <MarcaFoco x={(tipoEspejo === "concavo" ? -1 : 1) * fS} />
          <MarcaFoco x={(tipoEspejo === "concavo" ? -1 : 1) * Rs} tenue />
        </>
      )}

      {/* Haces láser y pulsos de luz */}
      <Haces segs={segs} depthTest={false} orden={25} />
      {b.rayos.map((r, i) => <Pulso key={i} path={r.path} color={r.col} playing={playing} speed={3.2} depthTest={false} tam={0.38} />)}

      {/* Imagen virtual: fantasma derecho; imagen real de un espejo: en el aire */}
      {verFantasma && I && (
        <group position={[I[0], 0, 0]} scale={[escalaImg, escalaImg, escalaImg]}>
          <Vela H={H} estilo="fantasma" playing={playing} luz={false} />
        </group>
      )}
      {verAerea && I && (
        <group position={[I[0], 0, 0]} rotation={[b.M < 0 ? Math.PI : 0, 0, 0]} scale={[Math.min(escalaImg, 2.4), Math.min(escalaImg, 2.4), Math.min(escalaImg, 2.4)]}>
          <Vela H={H} estilo="aerea" playing={playing} luz={false} />
        </group>
      )}

      {/* Etiquetas (máx. 4) */}
      <Etiqueta pos={[b.tip[0], -0.5, 0.35]} color="#86efac" ancha>objeto · {fmtDist(doU)}</Etiqueta>
      {etqImg}
      {esLente ? (
        <>
          <Etiqueta pos={[fU * S, -0.42, 0.2]} color="#fbbf24" borde={false} ancha>F′</Etiqueta>
          <Etiqueta pos={[-fU * S, -0.42, 0.2]} color="#fbbf24" borde={false} ancha>F</Etiqueta>
        </>
      ) : tipoEspejo !== "plano" ? (
        <>
          <Etiqueta pos={[(tipoEspejo === "concavo" ? -1 : 1) * fS, -0.42, 0.2]} color="#fbbf24" borde={false} ancha>F</Etiqueta>
          <Etiqueta pos={[(tipoEspejo === "concavo" ? -1 : 1) * Rs, -0.42, 0.2]} color="#fbbf24" borde={false} ancha>C</Etiqueta>
        </>
      ) : null}
    </group>
  );
}

/* ── Encuadre de cada modo ────────────────────────────────────────────────── */
function marcoDe(p: OpticaSceneProps, aspect: number): { objetivo: Pt; distancia: number; dir: Pt; clave: string } {
  if (p.modo === "lentes" || p.modo === "espejos") {
    const esLente = p.modo === "lentes";
    const fU = esLente
      ? (p.tipoLente === "convergente" ? Math.abs(p.fLente) : -Math.abs(p.fLente))
      : p.tipoEspejo === "plano" ? Infinity : p.tipoEspejo === "concavo" ? Math.abs(p.fEspejo) : -Math.abs(p.fEspejo);
    const doU = esLente ? p.doLente : p.doEspejo;
    const r = resolverGauss(fU, doU, H_OBJ);
    const xs = [-doU * S, 0];
    if (esLente) xs.push(p.dp * S + 0.4);
    if (!r.enInfinito && isFinite(r.di)) {
      const xi = (esLente ? r.di : -r.di) * S;
      if (Math.abs(xi) <= X_FIN) xs.push(xi);
    }
    if (!esLente && p.tipoEspejo !== "plano") xs.push(1.2);
    let ymin = RIEL_Y - 0.55, ymax = 2.1;
    if (!r.enInfinito && isFinite(r.hi)) {
      const yi = r.hi * S;
      const xi = (esLente ? r.di : -r.di) * S;
      if (Math.abs(xi) <= X_FIN && Math.abs(yi) < 3.2) { ymax = Math.max(ymax, yi + 0.8); ymin = Math.min(ymin, yi - 0.6); }
    }
    // Margen extra a la izquierda: ahí flota la leyenda del laboratorio.
    const estrecho = aspect < 1;
    let xmin = Math.min(...xs) - (estrecho ? 0.7 : 2.3), xmax = Math.max(...xs) + (estrecho ? 0.7 : 1.1);
    const anchoMin = estrecho ? 7 : 9;
    if (xmax - xmin < anchoMin) { const c = (xmin + xmax) / 2; xmin = c - anchoMin / 2; xmax = c + anchoMin / 2; }
    xmin = Math.max(xmin, -X_RIEL - 0.4); xmax = Math.min(xmax, X_RIEL + 0.4);
    const e = encuadrar(xmin, xmax, ymin, ymax, aspect);
    return { ...e, dir: esLente ? [-0.44, 0.27, 1] : [-0.66, 0.25, 1], clave: p.modo };
  }
  if (p.modo === "refraccion") {
    if (p.vistaRefr === "fibra") return { ...encuadrar(FIBRA_X0 - 1.4, FIBRA_X1 + 1.3, -1.9, 1.5, aspect), dir: [0.3, 0.24, 1], clave: "fibra" };
    if (p.vistaRefr === "prisma") return { ...encuadrar(-5.9, 6.3, -2.4, 2.6, aspect), dir: [0.2, 0.3, 1], clave: "prisma" };
    return { ...encuadrar(-3.6, 3.6, -3.25, 3.35, aspect), dir: [0.12, 0.12, 1], clave: "frontera" };
  }
  const G = geometriaOjo(p.condOjo);
  return { ...encuadrar(-6.4, G.xRetina + 1.5, -2.5, 2.3, aspect), dir: [0.14, 0.2, 1], clave: "ojo" };
}

/* ── Contenido ────────────────────────────────────────────────────────────── */
function Contenido(props: OpticaSceneProps & { ligero: boolean }) {
  const { modo, accent, resetNonce, playing, ligero } = props;
  const size = useThree((st) => st.size);
  const aspect = size.width / Math.max(1, size.height);
  const [debil, setDebil] = useState(false);
  const calidad = useMemo(() => calidadEscena(), []);
  const fino = ligero || debil || calidad === "baja";
  // Lo caro solo en equipos que lo aguantan: espejo del piso y sombra proyectada.
  const alta = calidad === "alta" && !ligero && !debil;
  const marco = marcoDe(props, aspect);

  const fLentSign = props.tipoLente === "convergente" ? Math.abs(props.fLente) : -Math.abs(props.fLente);
  const fEspSign = props.tipoEspejo === "plano" ? Infinity : props.tipoEspejo === "concavo" ? Math.abs(props.fEspejo) : -Math.abs(props.fEspejo);

  return (
    <>
      <PerformanceMonitor onDecline={() => setDebil(true)} />
      <color attach="background" args={[FONDO]} />
      <fog attach="fog" args={[FONDO, 28, 75]} />

      {/* Cuarto oscuro de óptica: un cono de luz sobre la mesa, relleno tenue
          con el color del laboratorio y un contraluz frío que recorta. */}
      <ambientLight intensity={0.22} />
      <spotLight
        position={[-3, 11, 7]} angle={0.62} penumbra={0.95} intensity={190} decay={2} color="#fff4e6"
        castShadow={alta} shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-bias={-0.0004}
      />
      <pointLight position={[-8, 3, 6]} intensity={9} color={accent} />
      <pointLight position={[4, 5, -8]} intensity={14} color="#bfe8ff" />
      {/* Entorno de estudio fotográfico (paneles de luz, sin HDR de internet):
          es lo que reflejan el vidrio de la lente y el metal de los espejos. */}
      <Environment resolution={256}>
        <Lightformer intensity={2.2} position={[0, 8, 0]} scale={[14, 6, 1]} color="#ffffff" />
        <Lightformer intensity={2.4} position={[-7, 3, 7]} scale={[6, 4, 1]} color="#fff3e2" />
        <Lightformer intensity={1.6} position={[8, 2, 4]} scale={[5, 6, 1]} color="#bfe8ff" />
        <Lightformer intensity={1.1} position={[0, 2, -9]} scale={[12, 3, 1]} color={accent} />
        <Lightformer intensity={0.9} position={[-9, 1, -2]} scale={[5, 5, 1]} color={accent} />
        <Lightformer intensity={0.35} position={[0, -6, 0]} scale={[16, 16, 1]} color="#2a3a55" />
        <Lightformer form="ring" intensity={3} position={[3, 4, 9]} scale={2} color="#ffffff" />
        {/* del lado del objeto: lo que devuelven los espejos (miran hacia −x) */}
        <Lightformer intensity={1.1} position={[-12, 2, 1]} scale={[10, 8, 1]} color="#a9bed6" />
        <Lightformer intensity={1.6} position={[-8, 7, 5]} scale={[5, 3, 1]} color="#ffffff" />
      </Environment>
      <MesaLaboratorio y={SUELO} tam={46} brillo={0.5} calidad={alta ? "media" : "baja"} />
      <ContactShadows position={[0, SUELO + 0.01, 0]} opacity={0.6} scale={28} blur={2.4} far={6} resolution={256} color="#01040a" />

      <group key={`${modo}-${resetNonce}`}>
        {modo === "lentes" && (
          <EscenaBanco esLente fU={fLentSign} doU={props.doLente} dpU={props.dp} tipoEspejo="plano" playing={playing} fino={fino} />
        )}
        {modo === "espejos" && (
          <EscenaBanco esLente={false} fU={fEspSign} doU={props.doEspejo} dpU={props.dp} tipoEspejo={props.tipoEspejo} playing={playing} fino={fino} vivo={alta} />
        )}
        {modo === "refraccion" && props.vistaRefr === "frontera" && <EscenaFrontera medio1={props.medio1} medio2={props.medio2} thetaInc={props.thetaInc} playing={playing} />}
        {modo === "refraccion" && props.vistaRefr === "fibra" && <EscenaFibra medio1={props.medio1} medio2={props.medio2} thetaInc={props.thetaInc} playing={playing} />}
        {modo === "refraccion" && props.vistaRefr === "prisma" && <EscenaPrisma thetaP={props.thetaPrisma} playing={playing} />}
        {modo === "ojo" && <EscenaOjo cond={props.condOjo} pc={props.pc} playing={playing} />}
      </group>

      <Guia objetivo={marco.objetivo} distancia={marco.distancia} dir={marco.dir} claveVista={`${marco.clave}-${resetNonce}`} />
      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={5}
        maxDistance={42}
        minPolarAngle={Math.PI / 7}
        maxPolarAngle={Math.PI / 2.06}
        minAzimuthAngle={-1.35}
        maxAzimuthAngle={1.35}
      />

      {!ligero && !debil && (
        <EffectComposer enableNormalPass={false} multisampling={4}>
          <Bloom intensity={0.75} luminanceThreshold={0.86} luminanceSmoothing={0.22} mipmapBlur />
          <Vignette eskil={false} offset={0.25} darkness={0.55} />
        </EffectComposer>
      )}
    </>
  );
}

export default function OpticaScene(props: OpticaSceneProps) {
  // Celular / táctil: sin postproceso y con vidrio ligero.
  const ligero = useMemo(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia?.("(pointer: coarse)").matches || window.innerWidth < 640;
  }, []);
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: false, toneMapping: THREE.ACESFilmicToneMapping }}
      camera={{ position: [-6, 3, 18], fov: FOV, near: 0.1, far: 200 }}
    >
      <Contenido {...props} ligero={ligero} />
    </Canvas>
  );
}
