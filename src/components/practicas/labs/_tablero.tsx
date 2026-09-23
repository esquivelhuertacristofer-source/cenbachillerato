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
import { useMemo } from "react";

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
