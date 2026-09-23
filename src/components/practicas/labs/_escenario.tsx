"use client";

/**
 * EL ESCENARIO: LO QUE HACE QUE UNA ESCENA NO PAREZCA UN DIAGRAMA FLOTANDO
 *
 * Un vaso de precipitados perfectamente modelado, solo, sobre un fondo negro,
 * sigue pareciendo un dibujo de los noventa. No es el objeto: es que no está
 * EN ningún sitio. Tres cosas lo arreglan, y ninguna tiene que ver con añadir
 * triángulos:
 *
 *   1. SUELO. Algo donde apoyarse. Sin una superficie debajo, el ojo no sabe
 *      a qué distancia está nada y todo se lee como un icono recortado. Una
 *      mesa que refleja un poco además devuelve el objeto por abajo, que es
 *      la pista de realidad más barata que existe.
 *
 *   2. LUZ CON DIRECCIÓN. Una `ambientLight` sola aplana: todo queda del
 *      mismo tono y desaparecen los bordes. Hace falta una luz principal que
 *      marque de dónde viene, un relleno que abra las sombras para que no sean
 *      agujeros negros, y un contraluz que recorte la silueta contra el fondo.
 *
 *   3. ALGO QUE REFLEJAR. `clearcoat`, `metalness` y `transmission` no
 *      inventan reflejos: reflejan el `Environment`. Sin uno, el vidrio bueno
 *      y el metal bueno se ven exactamente igual de mates que los malos, y
 *      todo el trabajo de materiales no se nota.
 *
 * Esto no sustituye la composición de cada laboratorio —cada uno sabe qué
 * quiere enseñar y desde dónde— sino el suelo y la luz que casi todos se
 * saltaron.
 */

import * as THREE from "three";
import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, MeshReflectorMaterial } from "@react-three/drei";

/** Azul muy oscuro, no negro: el negro puro mata el contraste de las sombras. */
export const FONDO_OSCURO = "#050e1c";

/**
 * Mesa de laboratorio con reflejo.
 *
 * `MeshReflectorMaterial` hace una segunda pasada de render, así que NO es
 * gratis: `resolution` 512 es el punto donde todavía se lee el reflejo y no se
 * nota en una portátil de escuela. Por debajo de eso el reflejo sale a
 * cuadros y es peor que no tenerlo.
 */
export function MesaLaboratorio({
  y = -2,
  tam = 26,
  color = "#0b1f33",
  brillo = 0.55,
  calidad = "media",
}: {
  y?: number;
  tam?: number;
  color?: string;
  /** 0 = mate, 1 = espejo. Por encima de 0,7 distrae del objeto. */
  brillo?: number;
  calidad?: "alta" | "media" | "baja";
}) {
  /* En equipos flojos el reflejo se cambia por una superficie mate: se pierde
   * el espejo y se conserva lo importante, que es que haya SUELO. */
  if (calidad === "baja") {
    return (
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} receiveShadow>
        <planeGeometry args={[tam, tam]} />
        <meshStandardMaterial color={color} roughness={0.85} metalness={0.1} />
      </mesh>
    );
  }
  const res = calidad === "alta" ? 1024 : 512;
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} receiveShadow>
      <planeGeometry args={[tam, tam]} />
      <MeshReflectorMaterial
        resolution={res}
        mixBlur={1.1}
        mixStrength={brillo * 8}
        /* Un reflejo nítido se lee como hielo. El desenfoque en profundidad es
         * lo que lo convierte en una mesa pulida. */
        blur={[420, 110]}
        depthScale={1.1}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.35}
        roughness={0.72}
        metalness={0.28}
        color={color}
        mirror={0}
      />
    </mesh>
  );
}

/** Marca para que la medición no se mida a sí misma. */
const NOMBRE_ESCENARIO = "escenario-suelo";

/**
 * ¿A qué altura está el suelo de ESTA escena? Medido, no adivinado.
 *
 * Veinte escenas no llevaban sombra de contacto, así que no había ningún
 * número del que deducir dónde estaba el piso. Ponerlo a ojo veinte veces es
 * una rifa: basta con equivocarse una vez para que un objeto quede enterrado
 * hasta la mitad.
 *
 * Pero el dato existe en cuanto la escena se monta: es la base de lo más bajo
 * que hay dibujado. Se recorre el grafo una sola vez —después del primer
 * pintado, cuando ya está todo colocado— y se saca la caja envolvente. El
 * propio suelo se excluye por nombre, o se mediría a sí mismo y bajaría un
 * poco en cada pasada.
 *
 * Se ignoran las luces y las cámaras: su posición no es geometría, y una luz
 * puesta a −40 arrastraría la mesa al sótano.
 */
function medirSuelo(escena: THREE.Object3D): number | null {
  const caja = new THREE.Box3();
  const uno = new THREE.Box3();
  let hay = false;
  escena.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh || !m.geometry) return;
    /* El propio suelo y su sombra no cuentan: si se midiera a sí mismo,
     * bajaría un poco en cada pasada hasta perderse. */
    let p: THREE.Object3D | null = o;
    while (p) {
      if (p.name === NOMBRE_ESCENARIO) return;
      p = p.parent;
    }
    uno.setFromObject(m);
    if (!isFinite(uno.min.y)) return;
    caja.union(uno);
    hay = true;
  });
  return hay ? caja.min.y : null;
}

/**
 * Coloca el suelo a la altura medida, MOVIENDO EL GRUPO, sin estado de React.
 *
 * La versión con `useState` dentro de un efecto la rechaza el linter del
 * compilador de React, y con razón: provoca un segundo render de toda la
 * escena sólo para mover un plano. Aquí el grupo existe desde el principio,
 * invisible, y en el primer cuadro —cuando el grafo ya está poblado— se le
 * asigna la posición y se enciende. Es un único fotograma sin mesa, que no se
 * ve porque la escena todavía está apareciendo.
 */
function SueloMedido({ hijos }: { hijos: (y: number) => React.ReactNode }) {
  const grupo = useRef<THREE.Group>(null);
  const escena = useThree((s) => s.scene);
  const listo = useRef(false);

  useFrame(() => {
    if (listo.current || !grupo.current) return;
    const y = medirSuelo(escena);
    if (y === null) return;
    listo.current = true;
    grupo.current.position.y = y;
    grupo.current.visible = true;
  });

  return (
    <group ref={grupo} name={NOMBRE_ESCENARIO} visible={false}>
      {hijos(0)}
    </group>
  );
}

/**
 * Luz de estudio de tres puntos, más el entorno que da los reflejos.
 *
 * `acento` tiñe el relleno con el color del laboratorio, que es lo que hace
 * que cada práctica tenga su propia atmósfera sin cambiarle la luz principal.
 */
export function LuzDeEstudio({
  acento = "#38bdf8",
  intensidad = 1,
  sombras = true,
}: {
  acento?: string;
  intensidad?: number;
  sombras?: boolean;
}) {
  return (
    <>
      {/* Base: no ilumina, solo evita que las sombras sean agujeros. */}
      <ambientLight intensity={0.42 * intensidad} />
      {/* Principal: la que marca de dónde viene la luz y proyecta la sombra. */}
      <directionalLight
        position={[5, 9, 5]}
        intensity={2.1 * intensidad}
        castShadow={sombras}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={34}
        /* Sin este sesgo la sombra se raya a sí misma sobre superficies
         * grandes y planas, que es justo lo que es la mesa. */
        shadow-bias={-0.0004}
      />
      {/* Relleno teñido: abre el lado oscuro y da el color de la práctica. */}
      <pointLight position={[-6, 3, 4]} intensity={12 * intensidad} color={acento} />
      {/* Contraluz: recorta la silueta contra el fondo. Sin él, un objeto
          oscuro sobre fondo oscuro no tiene borde. */}
      <pointLight position={[2, 4, -7]} intensity={9 * intensidad} color="#bfe8ff" />
    </>
  );
}

/**
 * El entorno que reflejan el vidrio y el metal.
 *
 * Son paneles de luz, no una foto: pesan nada y se ven en el reflejo como
 * ventanas de estudio, que es exactamente lo que se quiere en un laboratorio.
 * `resolution` 256 basta porque lo que se ve es su reflejo desenfocado.
 */
export function EntornoLaboratorio({ acento = "#38bdf8" }: { acento?: string }) {
  return (
    <Environment resolution={256}>
      {/* Cenital ancho: el reflejo largo que recorre un matraz de arriba abajo. */}
      <Lightformer intensity={2.2} position={[0, 6, 2]} scale={[12, 4, 1]} color="#ffffff" />
      {/* Lateral teñido: el color de la práctica en el canto del vidrio. */}
      <Lightformer intensity={1.5} position={[-7, 2, -2]} scale={[7, 7, 1]} color={acento} />
      {/* Frontal frío: la chispa que hace que el borde del cristal se lea. */}
      <Lightformer intensity={1.2} position={[6, 1, 4]} scale={[5, 5, 1]} color="#bfe8ff" />
    </Environment>
  );
}

/**
 * Todo el escenario de una vez: fondo, niebla, suelo, luz y entorno.
 *
 * Se mete como primer hijo del `<Canvas>` y la escena sigue igual por dentro.
 * `<ContactShadows>` va aparte de la sombra proyectada: es la mancha oscura
 * pegada al objeto, la que dice «esto TOCA la mesa» — y es lo primero que se
 * echa en falta aunque nadie sepa nombrarlo.
 */
export function Escenario({
  acento = "#38bdf8",
  suelo,
  fondo = FONDO_OSCURO,
  niebla = true,
  mesa = true,
  calidad = "media",
}: {
  acento?: string;
  /** Altura del piso. Sin ella se MIDE de la propia escena (ver `useSueloMedido`). */
  suelo?: number;
  fondo?: string;
  niebla?: boolean;
  mesa?: boolean;
  calidad?: "alta" | "media" | "baja";
}) {
  /* El piso, a la altura que toque: la que le pasaron o la que se mide. */
  const piso = (y: number) => (
    <>
      {mesa && <MesaLaboratorio y={y} calidad={calidad} />}
      <ContactShadows
        position={[0, y + 0.01, 0]}
        opacity={0.5}
        scale={20}
        blur={2.6}
        far={7}
        color="#020814"
      />
    </>
  );

  return (
    <>
      <color attach="background" args={[fondo]} />
      {/* La niebla hunde el fondo y evita el corte duro donde acaba la mesa. */}
      {niebla && <fog attach="fog" args={[fondo, 16, 44]} />}
      <LuzDeEstudio acento={acento} sombras={calidad !== "baja"} />
      {suelo === undefined ? (
        <SueloMedido hijos={piso} />
      ) : (
        <group name={NOMBRE_ESCENARIO}>{piso(suelo)}</group>
      )}
      <EntornoLaboratorio acento={acento} />
    </>
  );
}

/**
 * ¿Qué calidad aguanta este equipo?
 *
 * Misma regla que `calidadVidrio()` en `_vidrio.tsx`: no hay forma fiable de
 * preguntarle a un navegador cuánto puede, así que se usa lo que sí se sabe
 * —hilos declarados y si es táctil, donde casi siempre hay GPU integrada—.
 */
export function calidadEscena(): "alta" | "media" | "baja" {
  if (typeof navigator === "undefined") return "media";
  const hilos = navigator.hardwareConcurrency ?? 8;
  const tactil = typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches;
  if (hilos <= 4 || tactil) return "baja";
  return hilos >= 12 ? "alta" : "media";
}

/** Para escenas que quieran el tono de fondo sin montar el escenario entero. */
export const NIEBLA = (fondo = FONDO_OSCURO): [THREE.ColorRepresentation, number, number] => [fondo, 16, 44];
