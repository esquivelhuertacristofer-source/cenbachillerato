"use client";

/**
 * EL TABLERO: QUE UNA GRÁFICA DEJE DE SER UN DIAGRAMA
 *
 * Las escenas de matemáticas son las que peor envejecen, y no es culpa del
 * tema. Es que están dibujadas con los medios de un gráfico de pizarra: un
 * plano oscuro, una rejilla y unas líneas encima. Sale exactamente lo que
 * parece — una lámina de libro de texto metida en una ventana 3D.
 *
 * Dos cosas lo cambian, y ninguna toca las matemáticas:
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 1. `<Line>` NO ES UN OBJETO
 * ═══════════════════════════════════════════════════════════════════════════
 * `lineWidth` de drei es grosor EN PÍXELES: la línea mide lo mismo de cerca
 * que de lejos, no recibe luz, no proyecta sombra y no tiene canto. Por eso
 * una parábola se ve pegada al fondo como una calcomanía, por bien calculada
 * que esté.
 *
 * `CurvaTubo` extruye la misma lista de puntos a lo largo de un tubo. Ocupa
 * espacio de verdad: se le ve el brillo por un lado, la sombra por el otro, y
 * se acerca cuando la cámara se acerca. El cálculo no cambia ni un decimal.
 *
 * El coste es real —un tubo son cientos de triángulos frente a ninguno— así
 * que los segmentos se cuentan: 220 para la curva protagonista, menos para lo
 * accesorio.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 2. UN PLANO NO ES UN TABLERO
 * ═══════════════════════════════════════════════════════════════════════════
 * Un `planeGeometry` no tiene canto: al girar la cámara desaparece, y mientras
 * tanto no hay nada que diga dónde acaba. Un tablero con grosor y marco tiene
 * borde iluminado, proyecta sombra sobre la mesa y se apoya — y de paso encaja
 * el dibujo, que es lo que hace que se lea como un instrumento y no como un
 * fondo.
 */

import * as THREE from "three";
import { useEffect, useMemo } from "react";

/** Aclara un color hacia el blanco (marco y superficie del tablero de pie). */
function aclarar(hex: string, t: number): string {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v + (255 - v) * t));
  return "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
}

/** Punto en el plano del tablero. */
export type Pt2 = [number, number];

/**
 * Una curva con cuerpo.
 *
 * Sustituye a `<Line points={...} lineWidth={n} />`: los mismos puntos, pero
 * extruidos. `grosor` va en unidades de la escena, no en píxeles — 0,04 es una
 * línea fina de instrumento y 0,09 un trazo protagonista.
 */
export function CurvaTubo({
  puntos,
  color,
  grosor = 0.05,
  brillo = 0.5,
  z = 0,
  segmentos,
  radiales = 8,
}: {
  puntos: Pt2[] | [number, number, number][];
  color: string;
  grosor?: number;
  /** Luz propia. Sube el trazo sobre el fondo sin tener que aclarar el color. */
  brillo?: number;
  z?: number;
  segmentos?: number;
  radiales?: number;
}) {
  const geo = useMemo(() => {
    const v = puntos.map((p) =>
      p.length === 3
        ? new THREE.Vector3(p[0], p[1], (p as [number, number, number])[2])
        : new THREE.Vector3(p[0], p[1], z),
    );
    /* Menos de dos puntos no es una curva; devolver una geometría vacía evita
     * que three lance al intentar construir la trayectoria. */
    if (v.length < 2) return null;
    const curva = new THREE.CatmullRomCurve3(v, false, "catmullrom", 0.02);
    /* Un tubo cuesta `segmentos × radiales × 2` triángulos. Se acota al número
     * de puntos: interpolar cien veces entre dos puntos no añade nada. */
    const n = segmentos ?? Math.min(220, Math.max(24, v.length * 3));
    return new THREE.TubeGeometry(curva, n, grosor, radiales, false);
  }, [puntos, grosor, z, segmentos, radiales]);
  /* Si los puntos cambian (un deslizador, un barrido animado) se crea otra
   * geometría: la anterior se libera, o cada cambio dejaría un búfer huérfano
   * en la GPU. */
  useEffect(() => () => geo?.dispose(), [geo]);

  if (!geo) return null;
  return (
    <mesh geometry={geo} castShadow>
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={brillo}
        roughness={0.3}
        metalness={0.1}
      />
    </mesh>
  );
}

/**
 * Un eje: varilla con punta.
 *
 * La punta importa más de lo que parece — es lo que dice hacia dónde crece la
 * variable, y con una línea plana hay que ponerla como texto aparte.
 */
export function EjeVarilla({
  desde,
  hasta,
  color = "#7f9bb5",
  grosor = 0.035,
  punta = true,
}: {
  desde: [number, number, number];
  hasta: [number, number, number];
  color?: string;
  grosor?: number;
  punta?: boolean;
}) {
  const { pos, quat, largo } = useMemo(() => {
    const a = new THREE.Vector3(...desde);
    const b = new THREE.Vector3(...hasta);
    const d = new THREE.Vector3().subVectors(b, a);
    const l = d.length() || 0.0001;
    const m = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
    const q = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      d.clone().normalize(),
    );
    return { pos: m, quat: q, largo: l };
  }, [desde, hasta]);

  return (
    <group>
      <mesh position={pos} quaternion={quat} castShadow>
        <cylinderGeometry args={[grosor, grosor, largo, 10]} />
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.7} envMapIntensity={1.1} />
      </mesh>
      {punta && (
        <mesh position={new THREE.Vector3(...hasta)} quaternion={quat} castShadow>
          <coneGeometry args={[grosor * 2.6, grosor * 8, 12]} />
          <meshStandardMaterial color={color} roughness={0.35} metalness={0.7} envMapIntensity={1.1} />
        </mesh>
      )}
    </group>
  );
}

/**
 * El tablero donde se dibuja: panel con grosor y marco.
 *
 * SE POSICIONA POR LA CARA FRONTAL, no por el centro. Un plano no tiene
 * grosor y daba igual, pero una caja de 0,1 ocupa de `z−0.05` a `z+0.05`: al
 * sustituir el plano tal cual, la cuadrícula que estaba un pelo por delante se
 * quedó DENTRO del tablero y desapareció. `frente` es la profundidad a la que
 * queda la superficie donde se dibuja, que es lo que de verdad importa.
 *
 * Tampoco se usa `polygonOffset`: separar de verdad en profundidad es más
 * fiable que pelearse con el sesgo del z-buffer, y aquí sobra espacio.
 */
const GROSOR_PANEL = 0.1;

export function PanelGrafica({
  ancho,
  alto,
  frente = -0.1,
  color = "#0e1f36",
  marco = "#2b4a6b",
  grosorMarco = 0.14,
}: {
  ancho: number;
  alto: number;
  /** Profundidad de la superficie de dibujo (todo lo pintado va por delante). */
  frente?: number;
  color?: string;
  marco?: string;
  grosorMarco?: number;
}) {
  const z = frente - GROSOR_PANEL / 2;
  return (
    <group position={[0, 0, z]}>
      {/* Fondo con grosor: es lo que da canto iluminado y sombra sobre la mesa. */}
      <mesh receiveShadow castShadow>
        <boxGeometry args={[ancho, alto, GROSOR_PANEL]} />
        <meshStandardMaterial color={color} roughness={0.72} metalness={0.25} envMapIntensity={0.9} />
      </mesh>
      {/* Marco: cuatro listones. Encuadra el dibujo y lo convierte en un
          instrumento en vez de un fondo que se acaba sin avisar. */}
      {(
        [
          [0, alto / 2 + grosorMarco / 2, ancho + grosorMarco * 2, grosorMarco],
          [0, -alto / 2 - grosorMarco / 2, ancho + grosorMarco * 2, grosorMarco],
          [-ancho / 2 - grosorMarco / 2, 0, grosorMarco, alto],
          [ancho / 2 + grosorMarco / 2, 0, grosorMarco, alto],
        ] as [number, number, number, number][]
      ).map(([x, y, w, h], i) => (
        <mesh key={i} position={[x, y, 0.02]} castShadow>
          <boxGeometry args={[w, h, 0.16]} />
          <meshStandardMaterial color={marco} roughness={0.4} metalness={0.75} envMapIntensity={1.2} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * El tablero DE PIE: la gráfica deja de flotar.
 *
 * Una cuadrícula suelta a media altura sobre una mesa vacía es lo que más
 * delataba a estas escenas: nada la sostiene, nada le da tamaño y la curva no
 * tiene dónde proyectar su sombra. Aquí la cuadrícula queda pintada sobre un
 * tablero con grosor y marco, montado en dos patas que llegan al suelo de la
 * escena: se lee como un instrumento colocado en el laboratorio, y la sombra
 * del tubo sobre la superficie dice a qué distancia está la curva del fondo.
 *
 * Coste acotado: diez mallas de caja y cilindro, sin texturas.
 *
 * Se posiciona como `PanelGrafica` (por la cara frontal). `suelo` es la misma
 * altura que la escena ya le pasa a `<Escenario suelo>`.
 */
export function TableroDePie({
  ancho,
  alto,
  suelo,
  centro = [0, 0],
  frente = -0.06,
  color: colorPedido,
}: {
  /** Medidas de la zona de dibujo (el marco va por fuera). */
  ancho: number;
  alto: number;
  /** Altura del piso donde se apoyan las patas. */
  suelo: number;
  centro?: [number, number];
  frente?: number;
  color?: string;
}) {
  const base = "#050e1c";
  const color = colorPedido ?? aclarar(base, 0.09);
  const marco = aclarar(base, 0.3);
  const metal = "#8fa3b8";
  const gm = 0.16;
  const [cx, cy] = centro;
  const abajo = cy - alto / 2 - gm;
  /* Las patas salen del canto inferior y bajan al piso por detrás de la cara
   * de dibujo, para no tapar nada de lo que se pinta delante. */
  const zPata = frente - GROSOR_PANEL - 0.06;
  const largoPata = Math.max(abajo - suelo, 0.05);
  const xPata = ancho * 0.36;
  return (
    <group>
      <group position={[cx, cy, 0]}>
        <PanelGrafica ancho={ancho} alto={alto} frente={frente} color={color} marco={marco} grosorMarco={gm} />
        {/* Repisa inferior, como la de un pizarrón: cierra el marco por abajo
            y le da al tablero un borde que recoge la luz. */}
        <mesh position={[0, -alto / 2 - gm - 0.04, frente + 0.06]} castShadow receiveShadow>
          <boxGeometry args={[ancho * 0.9, 0.07, 0.34]} />
          <meshStandardMaterial color={metal} roughness={0.35} metalness={0.8} envMapIntensity={1.2} />
        </mesh>
      </group>
      {[-xPata, xPata].map((x) => (
        <group key={x} position={[cx + x, 0, zPata]}>
          <mesh position={[0, suelo + largoPata / 2, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.07, largoPata, 14]} />
            <meshStandardMaterial color={metal} roughness={0.3} metalness={0.85} envMapIntensity={1.2} />
          </mesh>
          {/* Pie: lo que hace que el tablero se apoye y no cuelgue. */}
          <mesh position={[0, suelo + 0.05, 0.1]} castShadow receiveShadow>
            <boxGeometry args={[0.22, 0.1, 1.5]} />
            <meshStandardMaterial color={marco} roughness={0.45} metalness={0.6} envMapIntensity={1.1} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Marcas de unidad como geometría, no como rayitas pintadas. */
export function MarcasEje({
  desde,
  hasta,
  paso = 1,
  eje = "x",
  largo = 0.13,
  color = "#7f9bb5",
}: {
  desde: number;
  hasta: number;
  paso?: number;
  eje?: "x" | "y";
  largo?: number;
  color?: string;
}) {
  const marcas = useMemo(() => {
    const a: number[] = [];
    for (let v = Math.ceil(desde); v <= hasta; v += paso) if (v !== 0) a.push(v);
    return a;
  }, [desde, hasta, paso]);

  return (
    <group>
      {marcas.map((v) => (
        <mesh
          key={v}
          position={eje === "x" ? [v, 0, 0] : [0, v, 0]}
          castShadow
        >
          <boxGeometry
            args={eje === "x" ? [0.035, largo, 0.035] : [largo, 0.035, 0.035]}
          />
          <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
        </mesh>
      ))}
    </group>
  );
}
