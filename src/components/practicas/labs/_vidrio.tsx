/**
 * MATERIAL DE LABORATORIO: VIDRIO QUE PARECE VIDRIO
 *
 * De las 138 escenas 3D de la plataforma, 130 no tenían material de vidrio y
 * 137 estaban hechas solo con cilindros y esferas. Eso es exactamente lo que
 * hace que un laboratorio de química «se vea de maqueta» aunque funcione
 * perfectamente: un matraz acaba siendo un cilindro de plástico opaco.
 *
 * Aquí están las dos piezas que faltaban, para que cualquier escena las use
 * sin volver a resolverlas.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 1. POR QUÉ EL VIDRIO ANTERIOR NO SE VEÍA COMO VIDRIO
 * ═══════════════════════════════════════════════════════════════════════════
 * La escena de destilación ya usaba `meshPhysicalMaterial` con
 * `transmission`, y aun así el matraz parecía humo. El motivo es que lo
 * combinaba con `transparent` y `opacity: 0.16`:
 *
 *   `transmission` es transparencia FÍSICA — la luz atraviesa el material, se
 *   refracta según el índice `ior` y el `thickness`, y el objeto conserva sus
 *   reflejos y su brillo. Es lo que hace que un vaso se vea de vidrio.
 *
 *   `opacity` es transparencia de MEZCLA — el objeto se funde con el fondo y
 *   pierde justamente los reflejos que lo hacían parecer sólido.
 *
 * Usar las dos a la vez deja lo peor de cada una: un fantasma sin reflejos.
 * Con `transmission: 1` y sin `opacity`, el vidrio se comporta como vidrio.
 *
 * `depthWrite: false` estaba por la misma razón y también sobra: escribir
 * profundidad es lo que permite que las piezas se ordenen bien entre sí.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 2. POR QUÉ EL PERFIL IMPORTA MÁS QUE EL MATERIAL
 * ═══════════════════════════════════════════════════════════════════════════
 * Un matraz de destilación no es una esfera con un tubo encima: es una curva
 * continua que sale del cuello, se ensancha en el balón y cierra por abajo.
 * Pegando una esfera y un cilindro siempre se ve la juntura.
 *
 * `latheGeometry` hace exactamente eso: se le da el perfil —media silueta— y
 * lo gira 360°. Sale la pieza entera, con su curva, en una sola malla y con
 * menos triángulos que las dos primitivas que sustituye.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 3. EL COSTE, QUE NO ES GRATIS
 * ═══════════════════════════════════════════════════════════════════════════
 * `transmission` obliga a la tarjeta a re-renderizar la escena detrás de cada
 * pieza transparente. En una portátil de escuela eso se nota. Por eso:
 *
 *   · `VIDRIO_FINO` —sin transmission, con reflejo— para las piezas pequeñas
 *     y las que se ven de lejos;
 *   · `VIDRIO` solo para las dos o tres piezas protagonistas;
 *   · y `calidadVidrio()`, que degrada a `VIDRIO_FINO` cuando el dispositivo
 *     no da para más, sin que la escena tenga que enterarse.
 */

import * as THREE from "three";

/** Borosilicato de laboratorio: un punto de azul, no gris. */
export const COLOR_VIDRIO = "#dff2fb";

/**
 * El vidrio bueno, para las piezas protagonistas.
 *
 * `ior` 1.5 es el del borosilicato real. `thickness` es el grosor que la luz
 * cree atravesar: subirlo tiñe y distorsiona más, bajarlo lo vuelve un
 * plástico fino. `roughness` bajo pero no cero — el vidrio perfecto no existe
 * y un cero absoluto se ve artificial.
 */
export const VIDRIO = {
  color: COLOR_VIDRIO,
  transmission: 1,
  thickness: 0.6,
  ior: 1.5,
  roughness: 0.05,
  metalness: 0,
  /* La capa de barniz que da el reflejo nítido del borde. Es lo que hace que
   * se lea la silueta contra un fondo oscuro. */
  clearcoat: 1,
  clearcoatRoughness: 0.08,
  /* Sin esto, el vidrio de una escena con Environment se ve apagado. */
  envMapIntensity: 1.4,
  side: THREE.DoubleSide,
} as const;

/**
 * El vidrio barato: sin transmission, pero con reflejo. Para tubos finos,
 * piezas de fondo y dispositivos lentos. De lejos no se distingue.
 */
export const VIDRIO_FINO = {
  color: COLOR_VIDRIO,
  transparent: true,
  opacity: 0.28,
  roughness: 0.08,
  metalness: 0,
  clearcoat: 1,
  clearcoatRoughness: 0.1,
  envMapIntensity: 1.2,
  side: THREE.DoubleSide,
} as const;

/** Acero y aluminio del soporte, las pinzas y el mechero. */
export const METAL = {
  color: "#9fb0c4",
  roughness: 0.28,
  metalness: 0.95,
  envMapIntensity: 1.2,
} as const;

/**
 * Un átomo de modelo molecular: esfera pulida, no bola de plastilina.
 *
 * Veinticuatro escenas dibujan átomos con `meshStandardMaterial` mate. Eso
 * estaba bien cuando no había nada que reflejar; con el `Environment` del
 * escenario puesto, lo que le falta es el BARNIZ — la película brillante que
 * tienen los modelos moleculares de verdad y que es lo que hace que una
 * esfera se lea como un objeto y no como un círculo de color.
 *
 * `clearcoat` va aparte de `roughness`: el cuerpo del átomo sigue siendo mate
 * y encima lleva una capa lisa. Si en vez de eso se bajara la rugosidad, la
 * esfera entera se volvería un espejo y perdería su color.
 *
 * Se usa extendiéndolo, para conservar el color y el brillo propio que cada
 * escena ya calcula:
 *
 *   <meshPhysicalMaterial {...ATOMO} color={e.color} emissive={e.color} />
 */
export const ATOMO = {
  roughness: 0.34,
  metalness: 0.12,
  clearcoat: 1,
  clearcoatRoughness: 0.18,
  envMapIntensity: 1.35,
} as const;

/**
 * Un líquido dentro de vidrio. OPACO, y no es un descuido.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * LA REGLA QUE HAY QUE SABER ANTES DE PONER `transmission` EN NADA
 * ═══════════════════════════════════════════════════════════════════════════
 * A través de un material con `transmission` SÓLO SE VE LO OPACO.
 *
 * No es una opinión: three.js dibuja un búfer aparte con lo que hay detrás del
 * cristal, y en ese búfer mete únicamente los objetos opacos —
 * `renderTransmissionPass()` llama a `renderObjects(opaqueObjects, …)` y ahí se
 * acaba la lista (medido en `three@0.180`)—. Todo lo que lleve `transparent` o
 * `transmission` queda FUERA.
 *
 * La consecuencia es la que muerde: un líquido bonito con `transmission: 0.35`
 * dentro de un matraz con `transmission: 1` NO SE VE. El matraz sale vacío y
 * nadie entiende por qué, porque el código del líquido está perfecto.
 *
 * Por eso este material es opaco y lo compensa con `emissive`, que es lo que
 * le devuelve el aspecto de líquido iluminado sin sacarlo del búfer.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * Y CUÁNDO NO USAR `VIDRIO`
 * ═══════════════════════════════════════════════════════════════════════════
 * Si dentro del recipiente hay algo que TIENE que verse translúcido —partículas
 * suspendidas en una disolución teñida, una fase que se mezcla con otra— ese
 * contenido no puede ser opaco, y entonces la pared no puede ser `VIDRIO`:
 * usa `VIDRIO_FINO`, que es transparente de mezcla y deja pasar todo. Se pierde
 * la refracción y se conserva lo que el alumno vino a mirar, que importa más.
 */
export function liquido(color: string) {
  return {
    color,
    roughness: 0.12,
    metalness: 0.05,
    envMapIntensity: 1,
    /* El brillo propio de un líquido coloreado bajo la luz del laboratorio.
     * Sin él, un líquido oscuro se ve como un agujero negro. */
    emissive: color,
    emissiveIntensity: 0.3,
  } as const;
}

/**
 * Elige la calidad según lo que aguante el equipo.
 *
 * No hay forma fiable de preguntarle a un navegador «¿cuánto puedes?», así
 * que se usa lo que sí se sabe: si el dispositivo dice tener pocos hilos o es
 * táctil —donde casi siempre hay una GPU integrada—, se baja.
 */
export function calidadVidrio(): typeof VIDRIO | typeof VIDRIO_FINO {
  if (typeof navigator === "undefined") return VIDRIO;
  const hilos = navigator.hardwareConcurrency ?? 8;
  const tactil = typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches;
  return hilos <= 4 || tactil ? VIDRIO_FINO : VIDRIO;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * PERFILES
 *
 * Cada función devuelve media silueta en el plano XY, de abajo arriba, para
 * `latheGeometry`. X es el radio y Y la altura. Girándola sale la pieza.
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Redondea una esquina entre dos puntos para que no queden aristas vivas. */
function arco(cx: number, cy: number, r: number, desde: number, hasta: number, pasos = 10) {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= pasos; i++) {
    const a = desde + ((hasta - desde) * i) / pasos;
    pts.push(new THREE.Vector2(cx + Math.cos(a) * r, cy + Math.sin(a) * r));
  }
  return pts;
}

/**
 * Matraz de destilación: balón esférico y cuello recto, en una sola curva.
 * `r` es el radio del balón; el cuello sale proporcionado a él.
 */
export function perfilMatrazBola(r = 1, alturaCuello = 1.6, rCuello = 0.17): THREE.Vector2[] {
  /* El balón va del polo sur hasta donde arranca el cuello, y ahí se estrecha
   * con una curva corta en vez de un escalón: esa transición es la que hace
   * que se lea como una pieza soplada y no como dos pegadas. */
  const aCuello = Math.asin(Math.min(1, rCuello / r));
  const pts = arco(0, 0, r, -Math.PI / 2, Math.PI / 2 - aCuello * 2.2, 26);
  const yHombro = pts[pts.length - 1]!.y;
  pts.push(new THREE.Vector2(rCuello * 1.25, yHombro + r * 0.16));
  pts.push(new THREE.Vector2(rCuello, yHombro + r * 0.3));
  pts.push(new THREE.Vector2(rCuello, yHombro + alturaCuello));
  /* El labio de la boca: un reborde grueso, como el de verdad. */
  pts.push(new THREE.Vector2(rCuello * 1.18, yHombro + alturaCuello));
  pts.push(new THREE.Vector2(rCuello * 1.18, yHombro + alturaCuello + 0.06));
  return pts;
}

/** Erlenmeyer: el cono con el que se recoge el destilado. */
export function perfilErlenmeyer(r = 0.9, altura = 1.5, rCuello = 0.22): THREE.Vector2[] {
  return [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(r * 0.96, 0),
    ...arco(r * 0.96 - 0.08, 0.08, 0.08, -Math.PI / 2, 0, 5),
    new THREE.Vector2(rCuello * 1.12, altura * 0.78),
    new THREE.Vector2(rCuello, altura * 0.86),
    new THREE.Vector2(rCuello, altura),
    new THREE.Vector2(rCuello * 1.2, altura),
    new THREE.Vector2(rCuello * 1.2, altura + 0.05),
  ];
}

/** Vaso de precipitados, con su pico. */
export function perfilVaso(r = 0.7, altura = 1.2): THREE.Vector2[] {
  return [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(r * 0.94, 0),
    ...arco(r * 0.94 - 0.06, 0.06, 0.06, -Math.PI / 2, 0, 4),
    new THREE.Vector2(r, altura * 0.95),
    new THREE.Vector2(r * 1.06, altura),
    new THREE.Vector2(r * 1.06, altura + 0.04),
  ];
}

/** Probeta graduada: alta, estrecha y con base ancha para no volcarse. */
export function perfilProbeta(r = 0.3, altura = 2.2): THREE.Vector2[] {
  return [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(r * 2.1, 0),
    new THREE.Vector2(r * 2.1, 0.07),
    new THREE.Vector2(r * 1.1, 0.16),
    new THREE.Vector2(r, 0.3),
    new THREE.Vector2(r, altura),
    new THREE.Vector2(r * 1.14, altura + 0.03),
  ];
}

/** Tubo de ensayo: fondo redondo, boca con labio. */
export function perfilTuboEnsayo(r = 0.22, altura = 1.4): THREE.Vector2[] {
  return [
    ...arco(0, r, r, -Math.PI / 2, 0, 10),
    new THREE.Vector2(r, altura),
    new THREE.Vector2(r * 1.16, altura),
    new THREE.Vector2(r * 1.16, altura + 0.04),
  ];
}

/**
 * El nivel de líquido dentro de una pieza torneada.
 *
 * Se corta el mismo perfil a la altura que toque y se vuelve a girar, así el
 * líquido tiene exactamente la forma del recipiente —que es lo que delata a
 * un cilindro de agua metido dentro de un matraz redondo—. Se estrecha un
 * pelo para que no atraviese la pared.
 */
export function perfilLiquido(perfil: THREE.Vector2[], nivel: number, holgura = 0.02): THREE.Vector2[] {
  /* Desde el FONDO real, no desde el cero del sistema: el perfil de un balón
   * arranca en −r porque su origen es el centro de la esfera. Midiendo desde
   * cero, «medio lleno» dejaría el líquido flotando por encima del fondo. */
  const fondo = Math.min(...perfil.map((p) => p.y));
  const alto = Math.max(...perfil.map((p) => p.y));
  const y = fondo + (alto - fondo) * Math.max(0, Math.min(1, nivel));
  const dentro = perfil.filter((p) => p.y <= y).map((p) => new THREE.Vector2(Math.max(0, p.x - holgura), p.y));
  if (dentro.length < 2) return [new THREE.Vector2(0, 0), new THREE.Vector2(0.001, 0)];
  /* Tapa plana arriba: la superficie del líquido. */
  const ultimo = dentro[dentro.length - 1]!;
  dentro.push(new THREE.Vector2(ultimo.x, y));
  dentro.push(new THREE.Vector2(0, y));
  return dentro;
}
