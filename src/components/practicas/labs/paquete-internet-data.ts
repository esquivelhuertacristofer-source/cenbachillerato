/**
 * Datos y modelo del laboratorio "El viaje de un paquete por Internet"
 * (CD-I, progresión 6 de Cultura Digital I; códigos de actividad CD-I-P10).
 *
 * Propósito: «Utiliza los recursos digitales a su alcance con fines personales,
 * académicos y sociales para interactuar con seguridad y con consideración al
 * medio ambiente.»
 *
 * Anclas:
 *   - A1 lectura «Uso responsable de la IA y huella ambiental de lo digital»:
 *     marco teórico verbatim (3 párrafos + 2 preguntas).
 *   - A2 quiz «IA, copyleft y ambiente — Opción múltiple»: reto evaluable.
 *   - A4 verdadero/falso: hechos. A5 glosario (4 términos). A6 completa el
 *     texto. A3 reflexión y A7 autoevaluación: paneles verbatim.
 *
 * Tres modos:
 *   (1) viaje — el mensaje se parte en paquetes, el DNS traduce el nombre, los
 *       routers eligen la ruta más corta y, si se corta un enlace, otra; el
 *       cable submarino MAREA cruza el Atlántico. Latencia calculada con la
 *       velocidad de la luz en la fibra y huella de red con intensidades
 *       promedio (ilustrativas, con fuente).
 *   (2) consulta — mandar una consulta a una IA con seguridad (sitio legítimo,
 *       sin datos personales, HTTPS frente a un espía en una wifi pública) y
 *       usarla con responsabilidad (verificar, descartar lo inventado, dar
 *       crédito), como pide la lectura A1.
 *   (3) dispositivo — la huella de fabricación repartida en los años de uso y
 *       el destino final del teléfono (cajón, basura común o reciclaje formal).
 *
 * Datos puros (sin three ni React).
 */

import type { QuizEvaluable } from "./_reto-quiz";
import type { TextoHuecosData } from "./_mecanica-huecos";

/* ── Modos ────────────────────────────────────────────────────────────── */

export type Modo = "viaje" | "consulta" | "dispositivo";
export const MODOS: Modo[] = ["viaje", "consulta", "dispositivo"];

export const MODOS_DEF: Record<Modo, { etq: string; subtitulo: string; icono: string; color: string }> = {
  viaje: { etq: "El viaje del paquete", subtitulo: "DNS, paquetes, rutas y cable submarino", icono: "fa-route", color: "#38bdf8" },
  consulta: { etq: "Consulta segura a la IA", subtitulo: "Sitio legítimo, cifrado y verificación", icono: "fa-user-shield", color: "#a78bfa" },
  dispositivo: { etq: "Vida del dispositivo", subtitulo: "Huella de fabricación y basura electrónica", icono: "fa-mobile-screen-button", color: "#34d399" },
};

export function num(x: number, dec = 0): string {
  const s = Math.abs(x).toFixed(dec);
  const [ent, frac] = s.split(".");
  const conMiles = ent!.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${x < 0 ? "−" : ""}${conMiles}${frac ? `.${frac}` : ""}`;
}

/** Tamaño legible en unidades decimales (1 kB = 1000 bytes). */
export function tamano(bytes: number): string {
  if (bytes >= 1e9) return `${num(bytes / 1e9, bytes % 1e9 === 0 ? 0 : 1)} GB`;
  if (bytes >= 1e6) return `${num(bytes / 1e6, bytes % 1e6 === 0 ? 0 : 1)} MB`;
  if (bytes >= 1e3) return `${num(bytes / 1e3, bytes % 1e3 === 0 ? 0 : 1)} kB`;
  return `${num(bytes)} B`;
}

export function mulberry32(semilla: number) {
  let t = semilla >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/* ── Tiempos de animación (s), compartidos por la escena y el panel ────── */
export const T_DNS = 1.6;
export const T_DATOS = 3.4;
export const T_ENVIO_IA = 2.6;
export const T_RESP_IA = 2.2;
export const T_VUELO = 1.6;

/* ════════════════════════════════════════════════════════════════════════
 * 1. EL VIAJE DEL PAQUETE
 * ════════════════════════════════════════════════════════════════════════ */

/** MTU de Ethernet: 1500 bytes por paquete, de los que 20 son del encabezado IP y 20 del TCP. */
export const MTU = 1500;
export const ENCABEZADOS = 40;
export const CARGA_UTIL = MTU - ENCABEZADOS; // 1460 bytes de datos por paquete

export function paquetesDe(bytes: number): number {
  return Math.max(1, Math.ceil(bytes / CARGA_UTIL));
}

/** Velocidad de la luz en fibra óptica: ≈ 2/3 de c (índice de refracción ≈ 1.5). */
export const V_FIBRA_KM_S = 200_000;

export type ContenidoId = "texto" | "pdf" | "foto" | "video";
export const CONTENIDOS: { id: ContenidoId; etq: string; bytes: number; icono: string; nota: string }[] = [
  { id: "texto", etq: "Mensaje de texto", bytes: 1_000, icono: "fa-comment-dots", nota: "≈ 1 kB con los datos que agrega la aplicación (tamaño típico, ilustrativo)." },
  { id: "pdf", etq: "Tarea en PDF", bytes: 500_000, icono: "fa-file-pdf", nota: "≈ 500 kB, un PDF de pocas páginas con alguna imagen (tamaño típico, ilustrativo)." },
  { id: "foto", etq: "Foto del celular", bytes: 3_000_000, icono: "fa-image", nota: "≈ 3 MB, una foto JPEG de 12 megapíxeles (tamaño típico, ilustrativo)." },
  { id: "video", etq: "1 h de video en HD", bytes: 3_000_000_000, icono: "fa-film", nota: "≈ 3 GB por hora en calidad HD (Centro de ayuda de Netflix)." },
];

export type NodoId = "casa" | "isp" | "qro" | "gdl" | "mty" | "ash" | "vab" | "bil" | "mad";
export type TipoNodo = "casa" | "isp" | "router" | "datos" | "estacion";
export type Pt3 = [number, number, number];

export interface Nodo {
  id: NodoId;
  etq: string;
  detalle: string;
  tipo: TipoNodo;
  lat: number;
  lon: number;
  /** Posición esquemática en la escena (no a escala). */
  pos: Pt3;
}

export const NODOS: Nodo[] = [
  { id: "casa", etq: "Tu casa (CDMX)", detalle: "Celular y router wifi", tipo: "casa", lat: 19.3467, lon: -99.1617, pos: [-6.6, 0, 2.4] },
  { id: "isp", etq: "Proveedor de Internet", detalle: "Central en la Ciudad de México", tipo: "isp", lat: 19.4326, lon: -99.1332, pos: [-4.9, 0, 1.3] },
  { id: "qro", etq: "Querétaro", detalle: "Centro de datos", tipo: "datos", lat: 20.5888, lon: -100.3899, pos: [-3.3, 0, 2.2] },
  { id: "gdl", etq: "Guadalajara", detalle: "Router de la red troncal", tipo: "router", lat: 20.6597, lon: -103.3496, pos: [-5.0, 0, -1.2] },
  { id: "mty", etq: "Monterrey", detalle: "Router de la red troncal", tipo: "router", lat: 25.6866, lon: -100.3161, pos: [-2.4, 0, -1.6] },
  { id: "ash", etq: "Ashburn, Virginia", detalle: "Centro de datos", tipo: "datos", lat: 39.0438, lon: -77.4874, pos: [0.2, 0, -1.0] },
  { id: "vab", etq: "Virginia Beach", detalle: "Estación del cable submarino", tipo: "estacion", lat: 36.8529, lon: -75.978, pos: [1.6, 0, 0.9] },
  { id: "bil", etq: "Bilbao (Sopelana)", detalle: "Estación del cable submarino", tipo: "estacion", lat: 43.3875, lon: -2.9869, pos: [5.6, 0, 0.0] },
  { id: "mad", etq: "Madrid", detalle: "Centro de datos", tipo: "datos", lat: 40.4168, lon: -3.7038, pos: [6.7, 0, 1.6] },
];

export const nodo = (id: NodoId): Nodo => NODOS.find((n) => n.id === id)!;

export type EnlaceId = "acceso" | "isp-qro" | "isp-gdl" | "gdl-qro" | "qro-mty" | "gdl-mty" | "mty-ash" | "ash-vab" | "marea" | "bil-mad";
export interface Enlace {
  id: EnlaceId;
  a: NodoId;
  b: NodoId;
  tipo: "acceso" | "fibra" | "submarino";
  cortable: boolean;
  etq: string;
  /** Longitud real conocida del cable (km); si falta, se usa la línea recta entre los extremos. */
  km?: number;
}

export const ENLACES: Enlace[] = [
  { id: "acceso", a: "casa", b: "isp", tipo: "acceso", cortable: false, etq: "Casa – proveedor" },
  { id: "isp-qro", a: "isp", b: "qro", tipo: "fibra", cortable: true, etq: "CDMX – Querétaro" },
  { id: "isp-gdl", a: "isp", b: "gdl", tipo: "fibra", cortable: true, etq: "CDMX – Guadalajara" },
  { id: "gdl-qro", a: "gdl", b: "qro", tipo: "fibra", cortable: false, etq: "Guadalajara – Querétaro" },
  { id: "qro-mty", a: "qro", b: "mty", tipo: "fibra", cortable: true, etq: "Querétaro – Monterrey" },
  { id: "gdl-mty", a: "gdl", b: "mty", tipo: "fibra", cortable: true, etq: "Guadalajara – Monterrey" },
  { id: "mty-ash", a: "mty", b: "ash", tipo: "fibra", cortable: false, etq: "Monterrey – Ashburn" },
  { id: "ash-vab", a: "ash", b: "vab", tipo: "fibra", cortable: false, etq: "Ashburn – Virginia Beach" },
  { id: "marea", a: "vab", b: "bil", tipo: "submarino", cortable: false, etq: "Cable submarino MAREA", km: 6600 },
  { id: "bil-mad", a: "bil", b: "mad", tipo: "fibra", cortable: false, etq: "Bilbao – Madrid" },
];

export const ENLACES_CORTABLES = ENLACES.filter((e) => e.cortable);

/** Distancia ortodrómica (línea recta sobre la Tierra) en km, radio medio 6371 km. */
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function largoEnlaceKm(e: Enlace): number {
  if (e.km) return e.km;
  const a = nodo(e.a);
  const b = nodo(e.b);
  return haversineKm(a.lat, a.lon, b.lat, b.lon);
}

export interface Ruta {
  nodos: NodoId[];
  enlaces: EnlaceId[];
  km: number;
}

/** Ruta más corta (Dijkstra) evitando los enlaces cortados; null si no hay camino. */
export function rutaMasCorta(origen: NodoId, destino: NodoId, cortados: EnlaceId[]): Ruta | null {
  const dist = new Map<NodoId, number>();
  const prev = new Map<NodoId, { n: NodoId; e: EnlaceId }>();
  const pendientes = new Set<NodoId>(NODOS.map((n) => n.id));
  NODOS.forEach((n) => dist.set(n.id, Infinity));
  dist.set(origen, 0);
  while (pendientes.size > 0) {
    let u: NodoId | null = null;
    pendientes.forEach((n) => {
      if (u === null || dist.get(n)! < dist.get(u)!) u = n;
    });
    if (u === null || dist.get(u)! === Infinity) break;
    const actual: NodoId = u;
    pendientes.delete(actual);
    if (actual === destino) break;
    ENLACES.forEach((e) => {
      if (cortados.includes(e.id)) return;
      const vecino = e.a === actual ? e.b : e.b === actual ? e.a : null;
      if (!vecino || !pendientes.has(vecino)) return;
      const alt = dist.get(actual)! + largoEnlaceKm(e);
      if (alt < dist.get(vecino)!) {
        dist.set(vecino, alt);
        prev.set(vecino, { n: actual, e: e.id });
      }
    });
  }
  if (dist.get(destino)! === Infinity) return null;
  const nodos: NodoId[] = [destino];
  const enlaces: EnlaceId[] = [];
  let c: NodoId = destino;
  while (c !== origen) {
    const p = prev.get(c)!;
    enlaces.unshift(p.e);
    nodos.unshift(p.n);
    c = p.n;
  }
  return { nodos, enlaces, km: dist.get(destino)! };
}

/** Latencia mínima de ida, en milisegundos, solo por propagación en la fibra. */
export function latenciaMs(km: number): number {
  return (km / V_FIBRA_KM_S) * 1000;
}

export type DestinoId = "qro" | "ash" | "mad";
export const DESTINOS: { id: DestinoId; dominio: string; ip: string; servicio: string; icono: string }[] = [
  { id: "qro", dominio: "tareas.ejemplo.mx", ip: "198.51.100.24", servicio: "Plataforma de tareas en un centro de datos de Querétaro", icono: "fa-school" },
  { id: "ash", dominio: "videos.ejemplo.com", ip: "203.0.113.80", servicio: "Servicio de video en Ashburn, Virginia, la mayor concentración de centros de datos del mundo", icono: "fa-circle-play" },
  { id: "mad", dominio: "biblioteca.ejemplo.es", ip: "192.0.2.15", servicio: "Biblioteca digital en Madrid, al otro lado del Atlántico", icono: "fa-book" },
];

export type RedId = "wifi" | "movil";
/**
 * Intensidad energética promedio de la red (kWh por GB transmitido). ORDEN DE
 * MAGNITUD ilustrativo: IEA (Kamiya, 2020) estima 0.1–0.2 kWh/GB para 4G en
 * 2019; para redes fijas, Aslan et al. (2018) midieron 0.06 kWh/GB en 2015 con
 * una tendencia a reducirse a la mitad cada dos años (≈ 0.015 kWh/GB en 2019).
 */
export const REDES: { id: RedId; etq: string; kwhPorGb: number; icono: string }[] = [
  { id: "wifi", etq: "Wifi de casa (red fija)", kwhPorGb: 0.015, icono: "fa-wifi" },
  { id: "movil", etq: "Datos móviles 4G", kwhPorGb: 0.15, icono: "fa-tower-cell" },
];

/** Factor de emisión del Sistema Eléctrico Nacional 2024 (CRE/SEMARNAT): 0.444 tCO₂e/MWh. */
export const FACTOR_CO2_KG_KWH = 0.444;

export function huellaRed(bytes: number, red: RedId): { wh: number; gCO2: number } {
  const r = REDES.find((x) => x.id === red)!;
  const kwh = (bytes / 1e9) * r.kwhPorGb;
  return { wh: kwh * 1000, gCO2: kwh * FACTOR_CO2_KG_KWH * 1000 };
}

/** Error relativo de una predicción de paquetes. */
export function errorRelativo(prediccion: number, real: number): number {
  return Math.abs(prediccion - real) / real;
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. CONSULTA SEGURA A LA IA
 * ════════════════════════════════════════════════════════════════════════ */

export type SitioId = "legitimo" | "subdominio" | "tipografico";
export const SITIOS: { id: SitioId; url: string; https: boolean; legitimo: boolean; ip: string; explica: string }[] = [
  {
    id: "subdominio",
    url: "http://tutor-ia.ejemplo.mx.premios-gratis.net",
    https: false,
    legitimo: false,
    ip: "203.0.113.66",
    explica: "El dominio se lee de derecha a izquierda: el real es «premios-gratis.net»; «tutor-ia.ejemplo.mx» es solo un disfraz al principio. Además es HTTP: viaja sin cifrar.",
  },
  {
    id: "tipografico",
    url: "https://tutor-la.ejemplo.mx",
    https: true,
    legitimo: false,
    ip: "203.0.113.67",
    explica: "Dice «tutor-la», con ele, no «tutor-ia». Tiene candado, pero el candado solo significa que la conexión va cifrada, no que el sitio sea quien dice ser: los sitios de phishing también lo tienen.",
  },
  {
    id: "legitimo",
    url: "https://tutor-ia.ejemplo.mx",
    https: true,
    legitimo: true,
    ip: "198.51.100.7",
    explica: "Es la dirección exacta que dio tu escuela y usa HTTPS: la conexión va cifrada hasta ese servidor.",
  },
];

export type FragmentoId = "pregunta" | "fuentes" | "domicilio" | "contrasena";
export const FRAGMENTOS: { id: FragmentoId; texto: string; necesario: boolean; porque: string }[] = [
  { id: "pregunta", texto: "Explícame qué es el copyleft con un ejemplo.", necesario: true, porque: "Es tu pregunta: sin ella la IA no sabe qué necesitas." },
  { id: "domicilio", texto: "Me llamo Ana López, vivo en Calle Robles 12, Puebla.", necesario: false, porque: "Tu nombre completo y domicilio no hacen falta para responder y quedan guardados en un servidor ajeno." },
  { id: "fuentes", texto: "Dame fuentes que yo pueda consultar para comprobarlo.", necesario: true, porque: "Pedir fuentes te ayuda a verificar lo que conteste." },
  { id: "contrasena", texto: "Mi contraseña del correo escolar es Tigre2009.", necesario: false, porque: "Una contraseña nunca se comparte, ni con una IA ni con nadie." },
];

/** Bytes cifrados de apariencia aleatoria, deterministas a partir del texto. */
export function cifradoDe(texto: string, n = 48): string {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) h = Math.imul(h ^ texto.charCodeAt(i), 16777619) >>> 0;
  const rnd = mulberry32(h);
  const hex = "0123456789abcdef";
  let s = "";
  for (let i = 0; i < n; i++) {
    s += hex[Math.floor(rnd() * 16)]! + hex[Math.floor(rnd() * 16)]!;
    s += i % 8 === 7 ? "\n" : " ";
  }
  return s.trim();
}

export type AfirmacionId = "copyleft" | "gpl" | "lfda" | "citaFalsa" | "ccProhibe";
export interface AfirmacionIA {
  id: AfirmacionId;
  texto: string;
  correcta: boolean;
  /** Lo que se encuentra al verificarla. */
  verificacion: string;
  fuente: string;
}

export const AFIRMACIONES_IA: AfirmacionIA[] = [
  {
    id: "copyleft",
    texto: "El copyleft permite copiar, modificar y redistribuir una obra siempre que las versiones derivadas conserven las mismas libertades.",
    correcta: true,
    verificacion: "Coincide con la lectura del curso.",
    fuente: "Lectura A1 de esta progresión",
  },
  {
    id: "gpl",
    texto: "La primera versión de la Licencia Pública General de GNU (GPL) se publicó en 1989.",
    correcta: true,
    verificacion: "Correcto: la Free Software Foundation publicó la GPL versión 1 en febrero de 1989.",
    fuente: "Free Software Foundation, historial de la GPL",
  },
  {
    id: "citaFalsa",
    texto: "Según Ramírez y Soto (2021), el 95 % del software del mundo usa licencias copyleft.",
    correcta: false,
    verificacion: "No aparece ningún estudio con esos autores ni ese dato en bases académicas: la IA inventó la cita. Las IA pueden «alucinar» referencias que suenan reales.",
    fuente: "Búsqueda en bases académicas: sin resultados",
  },
  {
    id: "lfda",
    texto: "En México, una obra está protegida por el derecho de autor desde que se crea y se fija en un soporte, aunque no se registre.",
    correcta: true,
    verificacion: "Correcto: el artículo 5 de la Ley Federal del Derecho de Autor dice que la protección no requiere registro.",
    fuente: "Ley Federal del Derecho de Autor, art. 5",
  },
  {
    id: "ccProhibe",
    texto: "Las licencias Creative Commons prohíben cualquier copia de la obra.",
    correcta: false,
    verificacion: "Falso: las licencias Creative Commons existen justamente para permitir copiar y compartir bajo ciertas condiciones, como dar crédito.",
    fuente: "Lectura A1 y glosario A5",
  },
];

export type DecisionIA = "usar" | "descartar";

export type DeclaracionId = "nada" | "copiar" | "declarar";
export const DECLARACIONES: { id: DeclaracionId; texto: string; correcta: boolean; explica: string }[] = [
  { id: "nada", texto: "No menciono que usé IA: al fin y al cabo, el trabajo lo entrego yo.", correcta: false, explica: "La lectura A1 pide reconocer cuándo usaste IA en tus trabajos." },
  { id: "copiar", texto: "Pego la respuesta tal cual y pongo «Fuente: inteligencia artificial».", correcta: false, explica: "Mencionarla no basta si no verificaste ni redactaste: incluirías lo que inventó." },
  {
    id: "declarar",
    texto: "«Usé un asistente de IA para buscar ideas sobre el copyleft; verifiqué cada dato en las fuentes citadas y redacté el texto con mis palabras.»",
    correcta: true,
    explica: "Reconoces el uso, dices para qué la usaste y dejas claro que verificaste y respetaste la autoría.",
  },
];

/* ════════════════════════════════════════════════════════════════════════
 * 3. VIDA DEL DISPOSITIVO
 * ════════════════════════════════════════════════════════════════════════ */

/**
 * Huella de un teléfono inteligente (MODELO ILUSTRATIVO de orden de magnitud):
 * los informes ambientales de fabricantes (2023) reportan entre 40 y 60 kg de
 * CO₂e por teléfono en todo su ciclo de vida, con 75–85 % en la fabricación.
 * Aquí: 50 kg de fabricación. Uso: cargarlo cada día ≈ 5 kWh al año con las
 * pérdidas del cargador, por el factor de la red mexicana 2024.
 */
export const CO2_FABRICACION_KG = 50;
export const KWH_CARGA_ANIO = 5;
export const CO2_USO_ANIO_KG = KWH_CARGA_ANIO * FACTOR_CO2_KG_KWH;
export const ANIOS_BASE = 2;
export const ANIOS_MAX = 8;

/** kg de CO₂e por cada año de uso: la fabricación se reparte entre los años. */
export function huellaAnual(anios: number): { fabricacion: number; uso: number; total: number } {
  const fabricacion = CO2_FABRICACION_KG / anios;
  return { fabricacion, uso: CO2_USO_ANIO_KG, total: fabricacion + CO2_USO_ANIO_KG };
}

export function reduccionVsBase(anios: number): number {
  return 1 - huellaAnual(anios).total / huellaAnual(ANIOS_BASE).total;
}

export type DestinoFinalId = "cajon" | "basura" | "reciclaje";
export const DESTINOS_FINALES: { id: DestinoFinalId; etq: string; icono: string; color: string; explica: string }[] = [
  { id: "cajon", etq: "Guardarlo en un cajón", icono: "fa-box-archive", color: "#fbbf24", explica: "No contamina mientras está guardado, pero sus metales no vuelven a usarse y la batería se degrada. Si todavía funciona, es mejor darle otra vida: donarlo o venderlo." },
  { id: "basura", etq: "Tirarlo a la basura común", icono: "fa-trash-can", color: "#f87171", explica: "Termina en un tiradero: la batería de litio puede incendiarse al aplastarse y sus sustancias pueden llegar al suelo y al agua. Y los metales se pierden." },
  { id: "reciclaje", etq: "Llevarlo a reciclaje formal", icono: "fa-recycle", color: "#34d399", explica: "En un centro de acopio autorizado se separan la batería y los plásticos y se recuperan metales que ya no hay que extraer de una mina." },
];

/** Metales recuperables por teléfono (EPA: por cada millón de celulares, 35 274 lb de cobre, 772 lb de plata, 75 lb de oro y 33 lb de paladio). */
const LB_KG = 0.45359237;
export const METALES_POR_MILLON_LB = { cobre: 35_274, plata: 772, oro: 75, paladio: 33 } as const;
export type MetalId = keyof typeof METALES_POR_MILLON_LB;
export const METALES: { id: MetalId; etq: string; color: string }[] = [
  { id: "cobre", etq: "Cobre", color: "#d97706" },
  { id: "plata", etq: "Plata", color: "#e5e7eb" },
  { id: "oro", etq: "Oro", color: "#facc15" },
  { id: "paladio", etq: "Paladio", color: "#a8a29e" },
];

/** Gramos de cada metal recuperables de `n` teléfonos. */
export function metalesRecuperadosG(n: number): Record<MetalId, number> {
  const f = (lb: number) => ((lb * LB_KG * 1000) / 1_000_000) * n;
  return { cobre: f(METALES_POR_MILLON_LB.cobre), plata: f(METALES_POR_MILLON_LB.plata), oro: f(METALES_POR_MILLON_LB.oro), paladio: f(METALES_POR_MILLON_LB.paladio) };
}

export function masa(g: number): string {
  if (g >= 1_000_000) return `${num(g / 1_000_000, 1)} t`;
  if (g >= 1000) return `${num(g / 1000, 1)} kg`;
  if (g >= 1) return `${num(g, 1)} g`;
  return `${num(g * 1000, 0)} mg`;
}

export const LOTES = [
  { n: 1, etq: "1 teléfono" },
  { n: 1_000, etq: "1 000 (una escuela)" },
  { n: 1_000_000, etq: "1 millón" },
] as const;

/** Global E-waste Monitor 2024 (UNITAR/UIT). */
export const DATOS_EWASTE = {
  mundoMt2022: 62,
  recicladoFormalPct: 22.3,
  mundoMt2030: 82,
};

/* ── Estrellas: ¿reparar, reutilizar o reciclar? (actividad A5) ───────── */

export type Accion = "reparar" | "reutilizar" | "reciclar";
export const ACCIONES: { id: Accion; etq: string; icono: string; color: string }[] = [
  { id: "reparar", etq: "Reparar", icono: "fa-screwdriver-wrench", color: "#38bdf8" },
  { id: "reutilizar", etq: "Reutilizar", icono: "fa-hand-holding-heart", color: "#a78bfa" },
  { id: "reciclar", etq: "Reciclar", icono: "fa-recycle", color: "#34d399" },
];

export const APARATOS: { texto: string; accion: Accion; porque: string }[] = [
  { texto: "Un celular con la pantalla estrellada que por lo demás funciona bien.", accion: "reparar", porque: "Solo falla una pieza que se puede cambiar: repararlo alarga su vida." },
  { texto: "Una laptop que funciona, pero ya no usas porque te regalaron otra.", accion: "reutilizar", porque: "Funciona: donarla o venderla le da otra vida con otra persona." },
  { texto: "La batería de un celular viejo que se hinchó.", accion: "reciclar", porque: "Es peligrosa y no tiene arreglo: va a un centro de acopio, nunca a la basura común." },
  { texto: "Un cable cargador pelado y partido por la mitad.", accion: "reciclar", porque: "Ya no es seguro usarlo; su cobre se recupera en el reciclaje." },
  { texto: "Una consola de videojuegos que funciona y está guardada en un cajón.", accion: "reutilizar", porque: "Funciona: alguien más puede usarla." },
  { texto: "Unos audífonos inalámbricos cuya batería reemplazable ya dura muy poco.", accion: "reparar", porque: "Cambiar la batería los deja como nuevos." },
  { texto: "Un televisor antiguo de tubo que ya no enciende y no tiene refacciones.", accion: "reciclar", porque: "No tiene arreglo y su vidrio contiene plomo: debe tratarse en reciclaje formal." },
  { texto: "Una tableta que funciona, pero tu hermano menor necesita una para la escuela.", accion: "reutilizar", porque: "Pasarla a otra persona evita comprar un aparato nuevo." },
  { texto: "Un celular que ya no carga porque se dañó el puerto de carga.", accion: "reparar", porque: "El puerto es una pieza reemplazable: se repara en un taller." },
];

export function rondaAparatos(rnd: () => number, n = 6): number[] {
  const idx = APARATOS.map((_, i) => i);
  const porAccion = (a: Accion) => idx.filter((i) => APARATOS[i]!.accion === a);
  const baraja = (xs: number[]) => {
    const a = [...xs];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [a[i], a[j]] = [a[j]!, a[i]!];
    }
    return a;
  };
  const cada = Math.floor(n / ACCIONES.length);
  return baraja(ACCIONES.flatMap((a) => baraja(porAccion(a.id)).slice(0, cada)));
}

export function estrellasPorErrores(errores: number): number {
  return errores === 0 ? 3 : errores <= 2 ? 2 : 1;
}

/* ════════════════════════════════════════════════════════════════════════
 * Contenido VERBATIM
 * ════════════════════════════════════════════════════════════════════════ */

export const TITULO_A1 = "Uso responsable de la IA y huella ambiental de lo digital";

/** Lectura A1 — tres párrafos, verbatim. */
export const LECTURA_A1: string[] = [
  "Las tecnologías digitales sirven para fines personales, académicos y sociales, pero su uso exige responsabilidad y ética. La inteligencia artificial (IA) puede ayudarte a estudiar, redactar o crear, pero conviene usarla de forma crítica: verifica la información que produce (puede equivocarse o inventar datos), reconoce cuándo usaste IA en tus trabajos y respeta los derechos de autoría de las fuentes.",
  "Para compartir obras y programas existen los licenciamientos copyleft, que invierten la lógica del copyright tradicional: en lugar de 'todos los derechos reservados', permiten copiar, modificar y redistribuir una obra siempre que las versiones derivadas conserven las mismas libertades. Las licencias Creative Commons y la GPL son ejemplos de este enfoque que favorece el conocimiento abierto.",
  "Finalmente, lo digital no es inmaterial: cada búsqueda, video y dispositivo consume energía y recursos. La contaminación digital y tecnológica incluye el alto consumo eléctrico de los centros de datos, la huella de carbono de internet y la basura electrónica (e-waste) que generan los aparatos que desechamos. Usar la tecnología de forma sostenible —alargar la vida de los dispositivos, reciclar y consumir con conciencia— también es parte de la ciudadanía digital.",
];

/** Preguntas de comprensión de la lectura A1 — verbatim. */
export const PREGUNTAS: { pregunta: string; guia: string }[] = [
  { pregunta: "Menciona dos prácticas para un uso responsable de la IA.", guia: "Verificar la información, reconocer su uso y respetar la autoría." },
  { pregunta: "¿Qué es la contaminación digital?", guia: "El consumo de energía, la huella de carbono y la basura electrónica que genera lo digital." },
];

/** Reflexión A3 — verbatim. */
export const REFLEXION_A3 =
  "¿Cómo puedes usar la inteligencia artificial de forma responsable en tus estudios y, al mismo tiempo, reducir tu huella digital y tecnológica? Propón al menos dos acciones concretas.";

/** Hechos: quiz A4 (verdadero/falso), cada enunciado con su retroalimentación — verbatim. */
export const HECHOS: string[] = [
  "Falso: «La inteligencia artificial nunca se equivoca, así que no hace falta verificar lo que dice». La IA puede inventar o equivocarse; siempre verifica.",
  "Verdadero: «El copyleft permite reutilizar una obra si las versiones derivadas mantienen las mismas libertades». Correcto: es la lógica del copyleft.",
  "Falso: «Lo digital no consume energía ni genera residuos». Los centros de datos y dispositivos consumen energía y generan e-waste.",
  "Verdadero: «Alargar la vida de los dispositivos reduce la contaminación tecnológica». Correcto: menos basura electrónica.",
];

/** Glosario A5 — verbatim. */
export const GLOSARIO: { termino: string; definicion: string; ejemplo: string }[] = [
  { termino: "Uso responsable de la IA", definicion: "Empleo crítico y ético de la inteligencia artificial: verificar, dar crédito y respetar la autoría.", ejemplo: "Revisar y citar cuando usas una IA para un trabajo." },
  { termino: "Copyleft", definicion: "Licenciamiento que permite copiar, modificar y redistribuir una obra conservando las mismas libertades.", ejemplo: "La GPL y varias licencias Creative Commons." },
  { termino: "Contaminación digital", definicion: "Impacto ambiental de lo digital: consumo eléctrico, huella de carbono y basura electrónica.", ejemplo: "El gasto energético de los centros de datos." },
  { termino: "Basura electrónica (e-waste)", definicion: "Aparatos electrónicos desechados que contaminan si no se reciclan.", ejemplo: "Celulares y baterías viejas." },
];

export const ACTIVIDAD_A5 = "Anota tres aparatos electrónicos que podrías reparar, reutilizar o reciclar en lugar de tirar.";

/** Autoevaluación A7 — criterios y reflexión final, verbatim. */
export const AUTOEVAL_A7 = {
  instrucciones: "Marca tu nivel honesto en cada criterio.",
  criterios: ["Uso la inteligencia artificial de forma crítica y responsable.", "Comprendo el copyleft y los licenciamientos abiertos.", "Reconozco la contaminación digital y actúo para reducirla."],
  escala: ["En inicio", "En proceso", "Logrado", "Destacado"],
  reflexionFinal: "¿Qué hábito tecnológico cambiarías para cuidar el ambiente?",
};

export const FUENTE = "CEN Bachillerato — Cultura Digital I, progresión 6 (CD-I-P10): lectura A1, quiz A2, reflexión A3, quiz A4, glosario A5, actividad A6 y autoevaluación A7.";

export const PROBLEMA =
  "Cuando mandas una tarea, ves un video o le preguntas algo a una IA, tus datos viajan en paquetes por routers, cables y centros de datos que consumen energía, y llegan a manos de alguien. En este laboratorio sigues ese viaje, lo haces seguro, revisas lo que la IA te devuelve y decides qué pasa con el aparato desde el que lo mandaste.";

export const INSTRUCCIONES: string[] = [
  "En El viaje del paquete, elige qué mandas y a dónde, predice cuántos paquetes hacen falta y envíalo. Corta enlaces para ver cómo la red busca otra ruta.",
  "En Consulta segura a la IA, elige la dirección correcta, quita los datos que no debes compartir y mira qué ve el espía de la wifi con y sin cifrado. Después verifica cada afirmación de la respuesta y declara su uso.",
  "En Vida del dispositivo, alarga los años de uso del teléfono para bajar su huella anual y decide su destino final.",
  "Clasifica aparatos en «¿Reparar, reutilizar o reciclar?» para ganar estrellas y resuelve el quiz A2 y el texto A6.",
];

export const IDEAS: string[] = [
  "Todo lo que mandas por Internet se parte en paquetes de hasta 1 500 bytes que pueden viajar por rutas distintas y se reordenan al llegar.",
  "El DNS traduce un nombre como tareas.ejemplo.mx a la dirección IP del servidor.",
  "Si un enlace se corta, los routers buscan otra ruta: por eso Internet resiste fallas, aunque la ruta nueva tarde más.",
  "El candado de HTTPS cifra la conexión, pero no garantiza que el sitio sea legítimo: revisa el dominio completo.",
  "La IA puede inventar datos y citas: verifica, descarta lo falso y reconoce que la usaste.",
  "La mayor parte de la huella de un teléfono está en su fabricación: usarlo más años es lo que más la reduce.",
];

/** Quiz A2 «IA, copyleft y ambiente — Opción múltiple» — verbatim. */
export const QUIZ_A2: QuizEvaluable = {
  titulo: "IA, copyleft y ambiente — Opción múltiple",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "Un uso responsable de la IA implica…",
      opciones: ["copiar todo sin revisar", "verificar la información y reconocer su uso", "ocultar siempre que la usaste", "creer todo lo que genera"],
      respuestaCorrecta: 1,
      retroalimentacion: "La IA puede equivocarse; hay que verificar y dar crédito.",
    },
    {
      enunciado: "El copyleft permite…",
      opciones: ["prohibir toda copia", "copiar y modificar si se conservan las libertades", "vender sin permiso ajeno", "eliminar la autoría"],
      respuestaCorrecta: 1,
      retroalimentacion: "El copyleft mantiene las libertades en las obras derivadas.",
    },
    {
      enunciado: "La basura electrónica también se conoce como…",
      opciones: ["e-waste", "spam", "malware", "cookies"],
      respuestaCorrecta: 0,
      retroalimentacion: "E-waste son los aparatos electrónicos desechados.",
    },
    {
      enunciado: "Una práctica sostenible con la tecnología es…",
      opciones: ["cambiar de celular cada mes", "alargar la vida de los dispositivos y reciclar", "dejar todo encendido", "tirar la electrónica a la basura común"],
      respuestaCorrecta: 1,
      retroalimentacion: "Reduce la contaminación digital y tecnológica.",
    },
  ],
};

/** Actividad A6 «Completa: ética digital y ambiente» — verbatim. */
export const HUECOS_A6: TextoHuecosData = {
  ancla: "CD-I-P10-A6 · Completa: ética digital y ambiente",
  instrucciones: "Completa con la palabra correcta.",
  partes: [
    "Al usar la inteligencia artificial conviene ",
    " la información que produce y reconocer su uso. El ",
    " permite reutilizar obras conservando las mismas libertades. El impacto ambiental de lo digital se llama contaminación ",
    ", e incluye la basura ",
    ".",
  ],
  huecos: [
    { respuesta: "verificar", alternativas: ["revisar"], pista: "Comprobar que es correcta." },
    { respuesta: "copyleft", alternativas: [], pista: "Lo contrario al copyright cerrado." },
    { respuesta: "digital", alternativas: [], pista: "Contaminación ___." },
    { respuesta: "electrónica", alternativas: ["e-waste"], pista: "Aparatos desechados." },
  ],
};
