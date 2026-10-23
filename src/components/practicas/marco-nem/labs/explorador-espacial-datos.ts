// =============================================================================
// Explorador espacial — astronomía y datos de la ficha
// =============================================================================
// DÓNDE ESTÁ EL SOL AHORA. El punto subsolar (el lugar de la Tierra que tiene el
// Sol justo encima) sale de las fórmulas de baja precisión del Astronomical
// Almanac (U.S. Naval Observatory): error menor de 0.01° entre 1950 y 2050.
// Con él, la línea del día y la noche que se ve sobre México es la de ese
// instante, no una ilustración.
//
// DÓNDE ESTÁ LA LUNA. Longitud eclíptica con el término principal de la
// ecuación del centro (error de ~1°), suficiente para que la fase que se ve
// sea la del día. La inclinación de 5° de su órbita no se dibuja.
//
// LAS TEXTURAS. Solar System Scope (CC BY 4.0), hechas con datos de la NASA:
// Blue Marble para el día, Black Marble (luces nocturnas), nubes y máscara de
// océanos; mapa de la Luna del Lunar Reconnaissance Orbiter. El crédito va en
// pantalla.
//
// LOS NÚMEROS DE LA FICHA. NASA, Planetary Fact Sheet y Moon Fact Sheet.
// =============================================================================

const GRAD = Math.PI / 180

/** Días desde J2000.0 (1 de enero de 2000, 12:00 UT). */
function diasJ2000(fecha: Date): number {
  return fecha.getTime() / 86_400_000 + 2_440_587.5 - 2_451_545.0
}

function normal360(x: number): number {
  return ((x % 360) + 360) % 360
}

/** Longitud eclíptica aparente del Sol, en grados. */
function longitudSol(n: number): number {
  const L = normal360(280.46 + 0.9856474 * n)
  const g = normal360(357.528 + 0.9856003 * n) * GRAD
  return normal360(L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g))
}

/** Punto de la Tierra que tiene el Sol en el cenit: latitud = declinación. */
export function puntoSubsolar(fecha: Date): { lat: number; lon: number } {
  const n = diasJ2000(fecha)
  const lambda = longitudSol(n) * GRAD
  const eps = (23.439 - 0.0000004 * n) * GRAD
  const decl = Math.asin(Math.sin(eps) * Math.sin(lambda))
  const ascension = Math.atan2(Math.cos(eps) * Math.sin(lambda), Math.cos(lambda)) / GRAD
  const tsg = normal360(280.46061837 + 360.98564736629 * n) // tiempo sidéreo de Greenwich, en grados
  let lon = normal360(ascension - tsg)
  if (lon > 180) lon -= 360
  return { lat: decl / GRAD, lon }
}

/**
 * Ángulo de la Luna respecto al Sol visto desde la Tierra (elongación), en
 * grados de 0 a 360: 0 = luna nueva, 90 = cuarto creciente, 180 = llena,
 * 270 = cuarto menguante.
 */
export function elongacionLuna(fecha: Date): number {
  const n = diasJ2000(fecha)
  const Lp = 218.316 + 13.176396 * n
  const Mp = normal360(134.963 + 13.064993 * n) * GRAD
  const lonLuna = normal360(Lp + 6.289 * Math.sin(Mp))
  return normal360(lonLuna - longitudSol(n))
}

export function nombreFase(elong: number): string {
  if (elong < 12 || elong >= 348) return "Luna nueva"
  if (elong < 80) return "Luna creciente"
  if (elong < 100) return "Cuarto creciente"
  if (elong < 168) return "Gibosa creciente"
  if (elong < 192) return "Luna llena"
  if (elong < 260) return "Gibosa menguante"
  if (elong < 280) return "Cuarto menguante"
  return "Luna menguante"
}

/**
 * Vector unitario de un punto (lon, lat) en el sistema local de la esfera de
 * three.js (SphereGeometry con la textura equirectangular estándar): la
 * longitud 0 cae en +X, la −90 en +Z y el norte en +Y.
 */
export function vectorLonLat(lon: number, lat: number): [number, number, number] {
  const phi = ((lon + 180) / 360) * 2 * Math.PI
  const theta = ((90 - lat) / 180) * Math.PI
  return [-Math.cos(phi) * Math.sin(theta), Math.cos(theta), Math.sin(phi) * Math.sin(theta)]
}

/** Centro aproximado de la República Mexicana. */
export const MEXICO = { lon: -102.5, lat: 23.6 }

/** Distancia media Tierra-Luna en radios terrestres (384,400 km / 6,371 km). */
export const LUNA_DISTANCIA_REAL = 60.3
/** Radio de la Luna en radios terrestres (1,737.4 km / 6,371 km). */
export const LUNA_RADIO = 0.273

export interface Ficha {
  id: string
  nombre: string
  tipo: string
  resumen: string
  datos: { etiqueta: string; valor: string }[]
}

const FICHAS_TIERRA_LUNA: Record<string, Ficha> = {
  tierra: {
    id: "tierra",
    nombre: "La Tierra",
    tipo: "Planeta rocoso · tercero desde el Sol",
    resumen:
      "El único lugar conocido con vida. Casi tres cuartas partes de su superficie están cubiertas de agua; por eso se ve azul desde el espacio.",
    datos: [
      { etiqueta: "Diámetro", valor: "12,756 km" },
      { etiqueta: "Un giro sobre su eje", valor: "23 h 56 min" },
      { etiqueta: "Una vuelta al Sol", valor: "365.25 días" },
      { etiqueta: "Distancia al Sol", valor: "149.6 millones de km" },
      { etiqueta: "Inclinación del eje", valor: "23.4°" },
      { etiqueta: "Lunas", valor: "1" },
    ],
  },
  luna: {
    id: "luna",
    nombre: "La Luna",
    tipo: "Satélite natural de la Tierra",
    resumen:
      "No tiene luz propia: refleja la del Sol. Siempre nos muestra la misma cara, porque tarda lo mismo en girar sobre sí misma que en dar la vuelta a la Tierra.",
    datos: [
      { etiqueta: "Diámetro", valor: "3,475 km" },
      { etiqueta: "Distancia a la Tierra", valor: "384,400 km" },
      { etiqueta: "Una vuelta a la Tierra", valor: "27.3 días" },
      { etiqueta: "De luna llena a luna llena", valor: "29.5 días" },
      { etiqueta: "Gravedad", valor: "1/6 de la terrestre" },
    ],
  },
  sol: {
    id: "sol",
    nombre: "El Sol",
    tipo: "Estrella",
    resumen:
      "Una esfera de gas tan caliente que brilla con luz propia. Ilumina la mitad de la Tierra que lo mira: ahí es de día.",
    datos: [
      { etiqueta: "Diámetro", valor: "1.39 millones de km (109 Tierras)" },
      { etiqueta: "Temperatura en la superficie", valor: "5,500 °C" },
      { etiqueta: "Su luz tarda en llegar a la Tierra", valor: "8 min 20 s" },
    ],
  },
}

// =============================================================================
// Planetas
// =============================================================================
// DÓNDE ESTÁ CADA PLANETA HOY. Elementos orbitales medios de J2000 y su ritmo
// por siglo (JPL, «Approximate Positions of the Planets», E. M. Standish). La
// longitud verdadera suma la ecuación del centro hasta e²: error de ~1° entre
// 1800 y 2050. Las órbitas se dibujan como círculos en un mismo plano.
// =============================================================================

export type IdPlaneta = "mercurio" | "venus" | "tierra" | "marte" | "jupiter" | "saturno" | "urano" | "neptuno"

export interface Planeta {
  id: IdPlaneta
  nombre: string
  textura: string
  /** Hay versión 4K para la computadora. */
  cuatroK: boolean
  radioKm: number
  /** Semieje mayor en unidades astronómicas. */
  ua: number
  e: number
  /** Longitud media en J2000 y su avance por siglo juliano, en grados. */
  L0: number
  Lsiglo: number
  /** Longitud del perihelio, en grados. */
  perihelio: number
  /** Inclinación del eje respecto a su órbita, en grados (más de 90 = gira al revés). */
  ejeGrados: number
  /** Duración de un giro sobre su eje, en horas. */
  giroHoras: number
  /** Duración de una vuelta al Sol, en días. */
  anioDias: number
  color: string
  anillo?: { interior: number; exterior: number }
  tipo: string
  resumen: string
  datos: { etiqueta: string; valor: string }[]
}

export const PLANETAS: Planeta[] = [
  {
    id: "mercurio", nombre: "Mercurio", textura: "mercurio", cuatroK: false, radioKm: 2440.5,
    ua: 0.38709927, e: 0.20563593, L0: 252.2503235, Lsiglo: 149472.67411175, perihelio: 77.45779628,
    ejeGrados: 0.03, giroHoras: 1407.6, anioDias: 87.969, color: "#c4bdb5",
    tipo: "Planeta rocoso · el más cercano al Sol",
    resumen: "El más pequeño de los ocho. Casi no tiene aire que guarde el calor: de día se calienta muchísimo y de noche se congela.",
    datos: [
      { etiqueta: "Diámetro", valor: "4,879 km" },
      { etiqueta: "Distancia media al Sol", valor: "57.9 millones de km" },
      { etiqueta: "Un giro sobre su eje", valor: "58.6 días" },
      { etiqueta: "Una vuelta al Sol", valor: "88 días" },
      { etiqueta: "Lunas", valor: "0" },
      { etiqueta: "Temperatura media", valor: "167 °C" },
      { etiqueta: "Si en la Tierra pesas 30 kg, aquí", valor: "11 kg" },
    ],
  },
  {
    id: "venus", nombre: "Venus", textura: "venus", cuatroK: false, radioKm: 6051.8,
    ua: 0.72333566, e: 0.00677672, L0: 181.9790995, Lsiglo: 58517.81538729, perihelio: 131.60246718,
    ejeGrados: 177.4, giroHoras: 5832.5, anioDias: 224.701, color: "#e9d8a6",
    tipo: "Planeta rocoso · segundo desde el Sol",
    resumen: "Sus nubes gruesas atrapan el calor: es el planeta más caliente, más que Mercurio. Gira al revés que casi todos, y muy despacio.",
    datos: [
      { etiqueta: "Diámetro", valor: "12,104 km" },
      { etiqueta: "Distancia media al Sol", valor: "108.2 millones de km" },
      { etiqueta: "Un giro sobre su eje", valor: "243 días, al revés" },
      { etiqueta: "Una vuelta al Sol", valor: "225 días" },
      { etiqueta: "Lunas", valor: "0" },
      { etiqueta: "Temperatura media", valor: "464 °C" },
      { etiqueta: "Si en la Tierra pesas 30 kg, aquí", valor: "27 kg" },
    ],
  },
  {
    id: "tierra", nombre: "Tierra", textura: "tierra-dia", cuatroK: true, radioKm: 6371,
    ua: 1.00000261, e: 0.01671123, L0: 100.46457166, Lsiglo: 35999.37244981, perihelio: 102.93768193,
    ejeGrados: 23.44, giroHoras: 23.93, anioDias: 365.256, color: "#60a5fa",
    tipo: "Planeta rocoso · tercero desde el Sol",
    resumen: "El único lugar conocido con vida. Casi tres cuartas partes de su superficie están cubiertas de agua; por eso se ve azul desde el espacio.",
    datos: [
      { etiqueta: "Diámetro", valor: "12,756 km" },
      { etiqueta: "Distancia media al Sol", valor: "149.6 millones de km" },
      { etiqueta: "Un giro sobre su eje", valor: "23 h 56 min" },
      { etiqueta: "Una vuelta al Sol", valor: "365.25 días" },
      { etiqueta: "Lunas", valor: "1" },
      { etiqueta: "Temperatura media", valor: "15 °C" },
    ],
  },
  {
    id: "marte", nombre: "Marte", textura: "marte", cuatroK: true, radioKm: 3396.2,
    ua: 1.52371034, e: 0.0933941, L0: -4.55343205, Lsiglo: 19140.30268499, perihelio: -23.94362959,
    ejeGrados: 25.19, giroHoras: 24.62, anioDias: 686.98, color: "#e0714a",
    tipo: "Planeta rocoso · cuarto desde el Sol",
    resumen: "Se ve rojo por el óxido de hierro de su suelo. Tiene el volcán más alto que se conoce, el monte Olimpo, y varios robots lo recorren.",
    datos: [
      { etiqueta: "Diámetro", valor: "6,792 km" },
      { etiqueta: "Distancia media al Sol", valor: "228 millones de km" },
      { etiqueta: "Un giro sobre su eje", valor: "24 h 37 min" },
      { etiqueta: "Una vuelta al Sol", valor: "687 días" },
      { etiqueta: "Lunas", valor: "2" },
      { etiqueta: "Temperatura media", valor: "−65 °C" },
      { etiqueta: "Si en la Tierra pesas 30 kg, aquí", valor: "11 kg" },
    ],
  },
  {
    id: "jupiter", nombre: "Júpiter", textura: "jupiter", cuatroK: true, radioKm: 71492,
    ua: 5.202887, e: 0.04838624, L0: 34.39644051, Lsiglo: 3034.74612775, perihelio: 14.72847983,
    ejeGrados: 3.13, giroHoras: 9.93, anioDias: 4332.59, color: "#e3bf94",
    tipo: "Planeta gaseoso · el más grande",
    resumen: "Cabrían más de mil Tierras dentro. La Gran Mancha Roja es una tormenta más grande que nuestro planeta que dura siglos.",
    datos: [
      { etiqueta: "Diámetro", valor: "142,984 km" },
      { etiqueta: "Distancia media al Sol", valor: "778.5 millones de km" },
      { etiqueta: "Un giro sobre su eje", valor: "9 h 56 min" },
      { etiqueta: "Una vuelta al Sol", valor: "11.9 años" },
      { etiqueta: "Lunas", valor: "Más de 90" },
      { etiqueta: "Temperatura media", valor: "−110 °C" },
      { etiqueta: "Si en la Tierra pesas 30 kg, aquí", valor: "76 kg" },
    ],
  },
  {
    id: "saturno", nombre: "Saturno", textura: "saturno", cuatroK: true, radioKm: 60268,
    ua: 9.53667594, e: 0.05386179, L0: 49.95424423, Lsiglo: 1222.49362201, perihelio: 92.59887831,
    ejeGrados: 26.73, giroHoras: 10.66, anioDias: 10759.22, color: "#ecd9a6",
    anillo: { interior: 1.239, exterior: 2.27 },
    tipo: "Planeta gaseoso · el de los anillos",
    resumen: "Sus anillos están hechos de trozos de hielo y roca, desde granos de polvo hasta bloques como casas. Es tan ligero que flotaría en el agua.",
    datos: [
      { etiqueta: "Diámetro", valor: "120,536 km" },
      { etiqueta: "Distancia media al Sol", valor: "1,432 millones de km" },
      { etiqueta: "Un giro sobre su eje", valor: "10 h 40 min" },
      { etiqueta: "Una vuelta al Sol", valor: "29.4 años" },
      { etiqueta: "Lunas", valor: "Más de 140" },
      { etiqueta: "Temperatura media", valor: "−140 °C" },
      { etiqueta: "Si en la Tierra pesas 30 kg, aquí", valor: "32 kg" },
    ],
  },
  {
    id: "urano", nombre: "Urano", textura: "urano", cuatroK: false, radioKm: 25559,
    ua: 19.18916464, e: 0.04725744, L0: 313.23810451, Lsiglo: 428.48202785, perihelio: 170.9542763,
    ejeGrados: 97.77, giroHoras: 17.24, anioDias: 30688.5, color: "#a5e3ec",
    tipo: "Gigante de hielo · séptimo desde el Sol",
    resumen: "Gira acostado: su eje está casi tumbado sobre su órbita, como una pelota que rueda. Por eso cada polo pasa 42 años de día y 42 de noche.",
    datos: [
      { etiqueta: "Diámetro", valor: "51,118 km" },
      { etiqueta: "Distancia media al Sol", valor: "2,867 millones de km" },
      { etiqueta: "Un giro sobre su eje", valor: "17 h 14 min, al revés" },
      { etiqueta: "Una vuelta al Sol", valor: "84 años" },
      { etiqueta: "Lunas", valor: "Más de 25" },
      { etiqueta: "Temperatura media", valor: "−195 °C" },
      { etiqueta: "Si en la Tierra pesas 30 kg, aquí", valor: "27 kg" },
    ],
  },
  {
    id: "neptuno", nombre: "Neptuno", textura: "neptuno", cuatroK: false, radioKm: 24764,
    ua: 30.06992276, e: 0.00859048, L0: -55.12002969, Lsiglo: 218.45945325, perihelio: 44.96476227,
    ejeGrados: 28.32, giroHoras: 16.11, anioDias: 60182, color: "#6f8ff0",
    tipo: "Gigante de hielo · el más lejano",
    resumen: "El planeta con los vientos más rápidos. Se descubrió con matemáticas: los cálculos dijeron dónde buscarlo antes de verlo con un telescopio.",
    datos: [
      { etiqueta: "Diámetro", valor: "49,528 km" },
      { etiqueta: "Distancia media al Sol", valor: "4,515 millones de km" },
      { etiqueta: "Un giro sobre su eje", valor: "16 h 6 min" },
      { etiqueta: "Una vuelta al Sol", valor: "165 años" },
      { etiqueta: "Lunas", valor: "Más de 10" },
      { etiqueta: "Temperatura media", valor: "−200 °C" },
      { etiqueta: "Si en la Tierra pesas 30 kg, aquí", valor: "34 kg" },
    ],
  },
]

/** Longitud heliocéntrica eclíptica del planeta, en grados, para una fecha. */
export function longitudPlaneta(p: Planeta, fecha: Date): number {
  const T = diasJ2000(fecha) / 36525
  const L = p.L0 + p.Lsiglo * T
  const M = (L - p.perihelio) * GRAD
  const centro = (2 * p.e * Math.sin(M) + 1.25 * p.e * p.e * Math.sin(2 * M)) / GRAD
  return normal360(L + centro)
}

export const FICHA_ASTEROIDES: Ficha = {
  id: "asteroides",
  nombre: "Cinturón de asteroides",
  tipo: "Rocas entre Marte y Júpiter",
  resumen:
    "Millones de rocas de todos los tamaños que dan vueltas al Sol entre Marte y Júpiter. Aunque son muchísimas, están tan separadas que las naves lo cruzan sin chocar.",
  datos: [
    { etiqueta: "El más grande", valor: "Ceres, un planeta enano de 940 km" },
    { etiqueta: "Distancia al Sol", valor: "de 2.2 a 3.2 veces la de la Tierra" },
  ],
}

export const FICHA_KUIPER: Ficha = {
  id: "kuiper",
  nombre: "Cinturón de Kuiper",
  tipo: "Cuerpos helados más allá de Neptuno",
  resumen:
    "Una región enorme de cuerpos de hielo y roca más allá de Neptuno. Ahí está Plutón, que desde 2006 se clasifica como planeta enano.",
  datos: [
    { etiqueta: "Su habitante más famoso", valor: "Plutón (2,377 km)" },
    { etiqueta: "Distancia al Sol", valor: "de 30 a 50 veces la de la Tierra" },
  ],
}

export const FICHA_COMETA: Ficha = {
  id: "cometa",
  nombre: "Un cometa",
  tipo: "Bola de hielo y polvo",
  resumen:
    "Pasa casi todo su viaje lejos y congelado. Al acercarse al Sol, el hielo se evapora y forma una cola que siempre apunta al lado contrario del Sol. Su órbita aquí es un ejemplo, no la de un cometa en particular.",
  datos: [
    { etiqueta: "Ejemplo famoso", valor: "Halley: vuelve cada 76 años" },
    { etiqueta: "Próxima visita del Halley", valor: "2061" },
  ],
}

export const FICHAS: Record<string, Ficha> = {
  ...FICHAS_TIERRA_LUNA,
  ...Object.fromEntries(PLANETAS.map((p) => [p.id, { id: p.id, nombre: p.nombre, tipo: p.tipo, resumen: p.resumen, datos: p.datos }])),
  // La ficha de la Tierra de la vista Tierra y Luna lleva la inclinación del eje.
  tierra: FICHAS_TIERRA_LUNA.tierra!,
  asteroides: FICHA_ASTEROIDES,
  kuiper: FICHA_KUIPER,
  cometa: FICHA_COMETA,
}
