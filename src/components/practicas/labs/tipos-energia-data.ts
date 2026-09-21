/**
 * Datos y modelo del laboratorio "Tipos de energía: de los fenómenos naturales
 * a la tecnología" (CNEYT-II-P08, progresión 8 de Ciencias Naturales,
 * Experimentales y Tecnología II — Energía y sociedad).
 *
 * Anclas (todas verbatim de la BD):
 *   - A2 simulación «Diseña tu investigación sobre energía»: el modo 3 la
 *     convierte en un banco de pruebas (sus tres fenómenos, sus instrucciones,
 *     su reporte esperado y sus preguntas de reflexión).
 *   - A4 verdadero/falso «Fenómenos y aplicaciones»: quiz evaluable.
 *   - A6 completa el texto «fenómenos y aplicaciones».
 *   - A5 glosario (fenómeno energético, aplicación tecnológica, máquina
 *     térmica, generador eléctrico) y A1 glosario (diseño de investigaciones).
 *   - A8 video: sus preguntas cerradas son hechos y la abierta, reflexión.
 *   La progresión no tiene lectura: el marco teórico de la ficha reúne los
 *   enunciados verdaderos del A4, las definiciones del A5 y la descripción
 *   del video A8.
 *
 * Ángulo propio (no duplica formas-energia-transformacion, conservación con
 * péndulo ni energía y electricidad): fenómenos NATURALES explicados por su
 * cadena de transformaciones (rayo, brisa marina, volcán, fotosíntesis) y la
 * tecnología que aprovecha esa misma energía, con sus pérdidas medidas en un
 * diagrama de flujo (Sankey) 3D.
 *
 * Cifras reales verificables; los modelos simplificados se declaran como tales
 * en la nota al pie. Datos puros (sin three ni React).
 */

import type { QuizEvaluable } from "./_reto-quiz";
import type { TextoHuecosData } from "./_mecanica-huecos";

/* ── Modos ────────────────────────────────────────────────────────────── */

export type Modo = "fenomenos" | "tecnologia" | "investigacion";
export const MODOS: Modo[] = ["fenomenos", "tecnologia", "investigacion"];

export const MODOS_DEF: Record<Modo, { etq: string; subtitulo: string; icono: string; color: string }> = {
  fenomenos: { etq: "Explica el fenómeno", subtitulo: "La cadena de energía de la naturaleza", icono: "fa-cloud-bolt", color: "#fbbf24" },
  tecnologia: { etq: "Aprovéchala", subtitulo: "Tecnología, eficiencia y pérdidas", icono: "fa-fan", color: "#22d3ee" },
  investigacion: { etq: "Diseña tu investigación", subtitulo: "Simulación A2: variables y datos", icono: "fa-flask-vial", color: "#a78bfa" },
};

export function num(x: number, dec = 0): string {
  const s = Math.abs(x).toFixed(dec);
  const [ent, frac] = s.split(".");
  const conMiles = ent!.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${x < 0 && Number(s) !== 0 ? "−" : ""}${conMiles}${frac ? `.${frac}` : ""}`;
}

/** Potencia legible: W, kW o MW. */
export function potencia(w: number): string {
  if (w >= 1e6) return `${num(w / 1e6, 2)} MW`;
  if (w >= 1e3) return `${num(w / 1e3, w >= 1e5 ? 0 : 1)} kW`;
  return `${num(w, w < 10 ? 1 : 0)} W`;
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

/* ── Formas de energía ────────────────────────────────────────────────── */

export type FormaId = "luminosa" | "termica" | "cinetica" | "potencial" | "electrica" | "quimica" | "sonora" | "nuclear";
export const FORMAS: FormaId[] = ["luminosa", "termica", "cinetica", "potencial", "electrica", "quimica", "sonora", "nuclear"];

export const FORMA_DEF: Record<FormaId, { etq: string; color: string; icono: string }> = {
  luminosa: { etq: "Luminosa", color: "#fde047", icono: "fa-sun" },
  termica: { etq: "Térmica", color: "#fb923c", icono: "fa-temperature-high" },
  cinetica: { etq: "Cinética", color: "#60a5fa", icono: "fa-wind" },
  potencial: { etq: "Potencial gravitacional", color: "#a78bfa", icono: "fa-arrow-down-long" },
  electrica: { etq: "Eléctrica", color: "#22d3ee", icono: "fa-bolt" },
  quimica: { etq: "Química", color: "#4ade80", icono: "fa-flask" },
  sonora: { etq: "Sonora", color: "#f472b6", icono: "fa-volume-high" },
  nuclear: { etq: "Nuclear", color: "#f87171", icono: "fa-atom" },
};

/* ════════════════════════════════════════════════════════════════════════
 * 1. EXPLICA EL FENÓMENO — cadenas de transformación en la naturaleza
 * ════════════════════════════════════════════════════════════════════════ */

export type FenomenoId = "tormenta" | "brisa" | "volcan" | "fotosintesis";

export interface PasoCadena {
  forma: FormaId;
  /** Qué ocurre en esta etapa del fenómeno. */
  explica: string;
}

export interface Fenomeno {
  id: FenomenoId;
  etq: string;
  icono: string;
  /** Pregunta que abre el fenómeno. */
  pregunta: string;
  pasos: PasoCadena[];
  /** Pregunta del último paso (selección múltiple). */
  preguntaFinal: string;
  /** Formas que DEBEN marcarse al final. */
  finales: FormaId[];
  /** Formas que pueden marcarse o no sin error (se explica por qué). */
  opcionales: FormaId[];
  explicaFinal: string;
  explicaOpcional: string;
  /** Pistas específicas cuando se elige una forma equivocada en la cadena. */
  pistas: Partial<Record<FormaId, string>>;
  datos: string[];
  tecnologia: string;
}

export const FENOMENOS: Fenomeno[] = [
  {
    id: "tormenta",
    etq: "Tormenta eléctrica",
    icono: "fa-cloud-bolt",
    pregunta: "¿De dónde sale la energía de un rayo?",
    pasos: [
      { forma: "luminosa", explica: "La luz del Sol llega al suelo y lo calienta." },
      { forma: "termica", explica: "El suelo caliente calienta el aire húmedo que tiene encima." },
      { forma: "cinetica", explica: "El aire caliente, menos denso, sube en corrientes que pueden superar los 100 km/h y forma un cumulonimbo. Dentro, el granizo y los cristales de hielo chocan." },
      { forma: "electrica", explica: "Los choques separan cargas: la parte alta de la nube queda positiva y la base negativa. Entre la base y el suelo se acumulan cientos de millones de volts." },
    ],
    preguntaFinal: "Salta el rayo. ¿En qué formas se transforma la energía eléctrica? (marca todas)",
    finales: ["luminosa", "termica", "sonora"],
    opcionales: ["cinetica"],
    explicaFinal: "El rayo emite luz (el relámpago), calienta el aire del canal a cerca de 30 000 °C y ese aire se expande de golpe: la onda de presión es el trueno.",
    explicaOpcional: "La expansión del aire también es movimiento (cinética): marcarla o no, está bien.",
    pistas: {
      nuclear: "La energía del Sol viene de la fusión nuclear, pero aquí la cadena empieza cuando su luz llega a la Tierra.",
      quimica: "En la tormenta no se rompen ni se forman enlaces químicos que la alimenten.",
      potencial: "El agua sí gana altura al subir, pero lo que carga la nube es el movimiento y los choques.",
    },
    datos: [
      "Un rayo típico lleva una corriente de unos 30 000 A.",
      "Libera del orden de mil millones de joules (1 GJ ≈ 280 kWh) en menos de un segundo.",
      "El canal alcanza cerca de 30 000 °C, unas cinco veces la temperatura de la superficie del Sol (≈ 5 500 °C).",
      "El sonido viaja a unos 343 m/s: cada 3 segundos entre relámpago y trueno equivalen a 1 km.",
    ],
    tecnologia: "Ninguna tecnología aprovecha los rayos: su energía llega en menos de un segundo y en lugares impredecibles. Lo que sí existe es el pararrayos, que conduce la descarga a tierra para proteger edificios.",
  },
  {
    id: "brisa",
    etq: "Brisa marina",
    icono: "fa-wind",
    pregunta: "¿Por qué en la playa el viento sopla del mar hacia la tierra por la tarde?",
    pasos: [
      { forma: "luminosa", explica: "El Sol ilumina por igual la arena y el mar." },
      { forma: "termica", explica: "La arena se calienta mucho más rápido: el agua necesita unas cinco veces más energía para subir un grado (4 186 J/kg·°C contra unos 830 J/kg·°C de la arena)." },
      { forma: "cinetica", explica: "El aire caliente sobre la arena sube y el aire más fresco del mar corre a ocupar su lugar: es la brisa marina." },
    ],
    preguntaFinal: "El viento empuja las olas y agita las palmeras. ¿En qué se transforma su energía? (marca todas)",
    finales: ["cinetica", "termica"],
    opcionales: ["sonora"],
    explicaFinal: "El viento pasa su movimiento a las olas y a las hojas (cinética) y, por la fricción, termina convertido en calor (térmica).",
    explicaOpcional: "El silbido del viento es energía sonora, aunque muy poca: marcarla o no, está bien.",
    pistas: {
      electrica: "El viento no genera electricidad por sí solo; para eso hace falta un generador.",
      potencial: "El aire no baja desde una altura: se mueve porque cambia la presión entre la tierra y el mar.",
      quimica: "Calentar arena y agua no rompe ni forma enlaces químicos.",
      nuclear: "La energía del Sol viene de la fusión nuclear, pero aquí la cadena empieza cuando su luz llega a la Tierra.",
    },
    datos: [
      "Calor específico del agua: 4 186 J/(kg·°C); de la arena seca: unos 830 J/(kg·°C).",
      "De noche ocurre al revés: la tierra se enfría antes y la brisa sopla de la tierra al mar.",
      "El Istmo de Tehuantepec, en Oaxaca, tiene uno de los vientos más constantes del mundo.",
    ],
    tecnologia: "El aerogenerador aprovecha la energía cinética del viento: sus aspas giran un generador eléctrico.",
  },
  {
    id: "volcan",
    etq: "Volcán",
    icono: "fa-volcano",
    pregunta: "¿De dónde sale la energía de una erupción?",
    pasos: [
      { forma: "nuclear", explica: "Dentro de la Tierra se desintegran átomos radiactivos de uranio, torio y potasio; eso aporta cerca de la mitad del calor interno del planeta." },
      { forma: "termica", explica: "Ese calor, sumado al que la Tierra conserva desde su formación, funde la roca: el magma está entre 700 y 1 200 °C." },
      { forma: "cinetica", explica: "Los gases disueltos en el magma se expanden al subir y lo empujan hacia fuera: la erupción." },
    ],
    preguntaFinal: "La lava y la ceniza salen del cráter. ¿Qué formas de energía aparecen? (marca todas)",
    finales: ["luminosa", "termica", "potencial"],
    opcionales: ["sonora", "electrica"],
    explicaFinal: "La lava brilla porque está incandescente (luminosa), calienta todo a su paso (térmica) y la ceniza lanzada a kilómetros de altura gana energía potencial gravitacional.",
    explicaOpcional: "Las erupciones explosivas truenan (sonora) y en sus columnas de ceniza a veces se forman rayos volcánicos (eléctrica); no pasa en todas, así que marcarlas o no, está bien.",
    pistas: {
      luminosa: "La lava sí brilla, pero eso es un efecto de la erupción; primero hay que explicar de dónde sale el calor.",
      quimica: "El calor interno de la Tierra no viene de una combustión: no hay reacciones químicas que lo produzcan.",
      electrica: "Los rayos volcánicos son un efecto, no la causa de la erupción.",
    },
    datos: [
      "Del interior de la Tierra sale continuamente un flujo de calor de unos 47 TW (47 billones de watts).",
      "El magma está entre 700 °C (viscoso) y 1 200 °C (fluido).",
      "El Paricutín nació en un campo de maíz de Michoacán el 20 de febrero de 1943; el Popocatépetl está activo desde 1994.",
    ],
    tecnologia: "La planta geotérmica perfora hasta el agua que calienta el magma y usa su vapor para mover una turbina, como en Los Azufres (Michoacán) y Cerro Prieto (Baja California).",
  },
  {
    id: "fotosintesis",
    etq: "Fotosíntesis",
    icono: "fa-leaf",
    pregunta: "¿Cómo guarda una planta la energía del Sol?",
    pasos: [
      { forma: "luminosa", explica: "La clorofila de la hoja absorbe sobre todo la luz roja y azul; la verde la refleja, por eso la vemos verde." },
      { forma: "quimica", explica: "Con esa energía la planta une dióxido de carbono y agua para formar glucosa: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂. Cada mol de glucosa guarda unos 2 870 kJ." },
    ],
    preguntaFinal: "Un venado cola blanca come la planta y usa la glucosa al respirar. ¿En qué la transforma? (marca todas)",
    finales: ["cinetica", "termica"],
    opcionales: ["quimica"],
    explicaFinal: "La respiración celular libera la energía química: una parte mueve los músculos (cinética) y la mayor parte se vuelve calor corporal (térmica).",
    explicaOpcional: "Lo que no usa lo guarda como grasa, que sigue siendo energía química: marcarla o no, está bien.",
    pistas: {
      termica: "La hoja se calienta un poco, pero eso no es lo que la planta guarda.",
      electrica: "En la hoja se mueven electrones, pero lo que queda almacenado son moléculas de glucosa.",
      nuclear: "La energía del Sol viene de la fusión nuclear, pero aquí la cadena empieza cuando su luz llega a la hoja.",
    },
    datos: [
      "Un cultivo en el campo guarda como energía química cerca del 1 % de la luz solar que recibe.",
      "El máximo teórico es de 4.6 % en plantas como el frijol (C3) y de 6 % en plantas como el maíz (C4).",
      "Casi toda la energía química de los alimentos y de los combustibles fósiles viene de la fotosíntesis.",
    ],
    tecnologia: "El panel solar también convierte luz, pero en electricidad y con mucha más eficiencia (cerca de 20 %).",
  },
];

/** Resultado de revisar la selección final de un fenómeno. */
export function revisarFinales(f: Fenomeno, marcadas: FormaId[]): { ok: boolean; faltan: FormaId[]; sobran: FormaId[] } {
  const faltan = f.finales.filter((x) => !marcadas.includes(x));
  const sobran = marcadas.filter((x) => !f.finales.includes(x) && !f.opcionales.includes(x));
  return { ok: faltan.length === 0 && sobran.length === 0, faltan, sobran };
}

/** Por qué no va esa forma en el paso `k` de la cadena. */
export function pistaCadena(f: Fenomeno, k: number, elegida: FormaId): string {
  const esp = f.pasos[k]!;
  if (f.pistas[elegida]) return f.pistas[elegida]!;
  const despues = f.pasos.findIndex((p, i) => i > k && p.forma === elegida);
  if (despues >= 0) return `${FORMA_DEF[elegida].etq} sí aparece, pero más adelante: antes la energía pasa por otra forma.`;
  const antes = f.pasos.findIndex((p, i) => i < k && p.forma === elegida);
  if (antes >= 0) return `${FORMA_DEF[elegida].etq} ya quedó atrás: la energía cambió de forma.`;
  return `En este paso no interviene la energía ${FORMA_DEF[elegida].etq.toLowerCase()}. Pista: ${esp.explica.split(":")[0]!.split(".")[0]!.toLowerCase()}…`;
}

/* ── Extras de cada fenómeno ───────────────────────────────────────────── */

export const V_SONIDO = 343;
/** Segundos entre el relámpago y el trueno a `km` kilómetros. */
export function retrasoTrueno(km: number): number {
  return (km * 1000) / V_SONIDO;
}

export type Magma = "fluido" | "viscoso";
export const MAGMAS: { id: Magma; etq: string; explica: string }[] = [
  { id: "fluido", etq: "Magma fluido (basáltico)", explica: "Con poca sílice el magma es fluido: los gases escapan con facilidad y la lava corre en ríos, como en el Paricutín." },
  { id: "viscoso", etq: "Magma viscoso (andesítico)", explica: "Con más sílice el magma es viscoso y atrapa los gases hasta que revientan: columnas de ceniza, como en el Popocatépetl." },
];

/** Tasa relativa de fotosíntesis con la luz (0–100 % de pleno sol). Curva de saturación ilustrativa. */
export function tasaFotosintesis(luzPct: number): number {
  const K = 25;
  const max = (100 * (100 + K)) / 100;
  return Math.max(0, (max * luzPct) / (luzPct + K));
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. APROVÉCHALA — tecnología, eficiencia y pérdidas (Sankey)
 * ════════════════════════════════════════════════════════════════════════ */

export type TecId = "aerogenerador" | "geotermica" | "solar";

export const TECNOLOGIAS: { id: TecId; etq: string; icono: string; fenomeno: FenomenoId; descripcion: string }[] = [
  { id: "aerogenerador", etq: "Aerogenerador", icono: "fa-fan", fenomeno: "brisa", descripcion: "Rotor de 90 m de diámetro y 2 MW de potencia nominal, como los del Istmo de Tehuantepec." },
  { id: "geotermica", etq: "Planta geotérmica", icono: "fa-industry", fenomeno: "volcan", descripcion: "El vapor de un yacimiento calentado por el magma mueve una turbina acoplada a un generador." },
  { id: "solar", etq: "Panel solar y hoja", icono: "fa-solar-panel", fenomeno: "fotosintesis", descripcion: "Un metro cuadrado de panel y un metro cuadrado de hojas bajo la misma luz." },
];

export interface PerdidaSankey {
  etq: string;
  w: number;
}
export interface TramoSankey {
  forma: FormaId;
  etq: string;
  w: number;
}
export interface FlujoSankey {
  tramos: TramoSankey[];
  /** perdidas[i]: lo que se pierde entre tramos[i] y tramos[i+1]. */
  perdidas: PerdidaSankey[][];
}

export function eficiencia(f: FlujoSankey): number {
  const e = f.tramos[0]!.w;
  return e > 0 ? f.tramos[f.tramos.length - 1]!.w / e : 0;
}

/* ── Aerogenerador ────────────────────────────────────────────────────── */

export const ROTOR_D = 90;
export const ROTOR_A = Math.PI * (ROTOR_D / 2) ** 2;
export const P_NOMINAL = 2e6;
export const V_ARRANQUE = 4;
export const V_CORTE = 25;
/** Coeficiente de potencia del rotor por debajo de la nominal (límite de Betz: 16/27 ≈ 0.593). */
export const CP = 0.4;
export const BETZ = 16 / 27;
export const ETA_ENGRANES = 0.95;
export const ETA_GENERADOR = 0.95;

/** Densidad del aire (kg/m³) según la altitud, atmósfera estándar. */
export function densidadAire(altitud: number): number {
  return 1.225 * Math.pow(1 - 2.25577e-5 * altitud, 4.2559);
}

export const SITIOS_VIENTO = [
  { id: "istmo", etq: "Istmo de Tehuantepec (nivel del mar)", altitud: 0 },
  { id: "altiplano", etq: "Altiplano (2 240 m)", altitud: 2240 },
] as const;
export type SitioId = (typeof SITIOS_VIENTO)[number]["id"];

export type EstadoRotor = "calma" | "operando" | "nominal" | "corte";

export function aerogenerador(v: number, rho: number): { flujo: FlujoSankey; estado: EstadoRotor; pViento: number; pElec: number } {
  const pViento = 0.5 * rho * ROTOR_A * v ** 3;
  let estado: EstadoRotor = "operando";
  let pRotor = CP * pViento;
  if (v < V_ARRANQUE) {
    estado = "calma";
    pRotor = 0;
  } else if (v > V_CORTE) {
    estado = "corte";
    pRotor = 0;
  } else if (pRotor * ETA_ENGRANES * ETA_GENERADOR >= P_NOMINAL) {
    estado = "nominal";
    pRotor = P_NOMINAL / (ETA_ENGRANES * ETA_GENERADOR);
  }
  const pEje = pRotor * ETA_ENGRANES;
  const pElec = pEje * ETA_GENERADOR;
  const flujo: FlujoSankey = {
    tramos: [
      { forma: "cinetica", etq: "Viento que cruza el rotor", w: pViento },
      { forma: "cinetica", etq: "Giro del rotor", w: pRotor },
      { forma: "electrica", etq: "Electricidad", w: pElec },
    ],
    perdidas: [
      [{ etq: estado === "calma" || estado === "corte" ? "Rotor detenido: el viento sigue de largo" : estado === "nominal" ? "Sigue en el viento (Betz + aspas giradas para no pasar de 2 MW)" : "Sigue en el viento (límite de Betz y aspas)", w: pViento - pRotor }],
      [
        { etq: "Fricción en los engranes", w: pRotor - pEje },
        { etq: "Calor en el generador", w: pEje - pElec },
      ],
    ],
  };
  return { flujo, estado, pViento, pElec };
}

/* ── Planta geotérmica ────────────────────────────────────────────────── */

export const T_CONDENSADOR = 40;
/** Fracción del máximo teórico (Carnot) que alcanza la planta: modelo simplificado. */
export const FRACCION_CARNOT = 0.4;
export const ETA_GEN_GEO = 0.97;
/** Energía que entrega cada kg de vapor al condensarse a 40 °C (kJ/kg, aprox.). */
export const DH_VAPOR = 2610;

export function carnot(tC: number): number {
  return 1 - (T_CONDENSADOR + 273.15) / (tC + 273.15);
}

export function geotermica(tC: number, flujoKgS: number): { flujo: FlujoSankey; pTermica: number; pElec: number; etaTurbina: number } {
  const pTermica = flujoKgS * DH_VAPOR * 1000;
  const etaTurbina = FRACCION_CARNOT * carnot(tC);
  const pMec = pTermica * etaTurbina;
  const pElec = pMec * ETA_GEN_GEO;
  return {
    pTermica,
    pElec,
    etaTurbina,
    flujo: {
      tramos: [
        { forma: "termica", etq: "Vapor del yacimiento", w: pTermica },
        { forma: "cinetica", etq: "Giro de la turbina", w: pMec },
        { forma: "electrica", etq: "Electricidad", w: pElec },
      ],
      perdidas: [[{ etq: "Calor que se va en el condensador y la torre", w: pTermica - pMec }], [{ etq: "Calor en el generador", w: pMec - pElec }]],
    },
  };
}

export const META_GEO_MW = 50;

/* ── Panel solar y hoja ───────────────────────────────────────────────── */

export const ETA_PANEL = 0.2;
export const ETA_HOJA = 0.01;

export function luzIncidente(g: number, anguloGrados: number): number {
  return g * Math.cos((anguloGrados * Math.PI) / 180);
}

export function panelSolar(g: number, angulo: number): FlujoSankey {
  const luz = luzIncidente(g, angulo);
  return {
    tramos: [
      { forma: "luminosa", etq: "Luz sobre el panel", w: luz },
      { forma: "electrica", etq: "Electricidad", w: luz * ETA_PANEL },
    ],
    perdidas: [
      [
        { etq: "Reflejada", w: luz * 0.04 },
        { etq: "Fotones con poca energía", w: luz * 0.19 },
        { etq: "Exceso de energía → calor", w: luz * 0.33 },
        { etq: "Recombinación y resistencia", w: luz * 0.24 },
      ],
    ],
  };
}

export function hoja(g: number, angulo: number): FlujoSankey {
  const luz = luzIncidente(g, angulo);
  return {
    tramos: [
      { forma: "luminosa", etq: "Luz sobre la hoja", w: luz },
      { forma: "luminosa", etq: "Luz útil (400–700 nm)", w: luz * 0.48 },
      { forma: "quimica", etq: "Glucosa", w: luz * ETA_HOJA },
    ],
    perdidas: [[{ etq: "Fuera de 400–700 nm", w: luz * 0.52 }], [
      { etq: "Reflejada o atravesada (verde)", w: luz * 0.048 },
      { etq: "Calor y pérdidas del proceso", w: luz * (0.48 - 0.048 - ETA_HOJA) },
    ]],
  };
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. DISEÑA TU INVESTIGACIÓN — simulación A2
 * ════════════════════════════════════════════════════════════════════════ */

export type InvId = "conduccion" | "panel" | "consumo";
export type Rol = "vi" | "vd" | "vc";
export type Tendencia = "aumenta" | "disminuye" | "igual";

export const ROL_DEF: Record<Rol, { etq: string; corta: string; color: string }> = {
  vi: { etq: "Independiente (la modificas)", corta: "Independiente", color: "#f472b6" },
  vd: { etq: "Dependiente (la mides)", corta: "Dependiente", color: "#22d3ee" },
  vc: { etq: "Controlada (constante)", corta: "Controlada", color: "#a3e635" },
};

export const TENDENCIAS: { id: Tendencia; etq: string; icono: string }[] = [
  { id: "aumenta", etq: "aumenta", icono: "fa-arrow-trend-up" },
  { id: "disminuye", etq: "disminuye", icono: "fa-arrow-trend-down" },
  { id: "igual", etq: "no cambia", icono: "fa-equals" },
];

export interface NivelInv {
  v: number;
  etq: string;
  /** Dato auxiliar del nivel (difusividad del material, etc.). */
  aux?: number;
}

export interface VariableDependiente {
  corta: string;
  frase: string;
  unidad: string;
  dec: number;
}

export interface OpcionVI {
  id: string;
  corta: string;
  /** Frase para la pregunta «¿Cómo afecta [VI] a [VD]?». */
  frase: string;
  unidad: string;
  niveles: NivelInv[];
  vd: VariableDependiente;
  /** Lo que se deja fijo cuando esta es la independiente. */
  montaje: string;
  modelo: (n: NivelInv) => number;
  /** Variación relativa entre repeticiones (desviación estándar). */
  ruido: number;
  porque: string;
}

export interface Investigacion {
  id: InvId;
  etq: string;
  icono: string;
  vis: [OpcionVI, OpcionVI];
  /** Factores que siempre deben quedar constantes. */
  controladas: string[];
  /** Un dato cualitativo que no sirve como variable dependiente. */
  cualitativo: string;
}

/* Conducción: barra con un extremo en agua hirviendo; conducción en una dimensión, sin pérdidas laterales. */
export const T_AGUA = 100;
export const T_INICIAL = 20;
export const T_SENSOR = 40;

/** Función error complementaria (Abramowitz y Stegun 7.1.26, error < 1.5×10⁻⁷). */
export function erfc(x: number): number {
  const s = x < 0 ? -1 : 1;
  const z = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * z);
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-z * z);
  return 1 - s * y;
}

/** Temperatura a `xm` metros del extremo caliente tras `t` segundos. */
export function tempBarra(alfa: number, xm: number, t: number): number {
  if (t <= 0) return xm <= 0 ? T_AGUA : T_INICIAL;
  return T_INICIAL + (T_AGUA - T_INICIAL) * erfc(xm / (2 * Math.sqrt(alfa * t)));
}

/** erfc(u) = (40−20)/(100−20) = 0.25 → u ≈ 0.8134 (resuelto por bisección). */
export const U_SENSOR = (() => {
  const meta = (T_SENSOR - T_INICIAL) / (T_AGUA - T_INICIAL);
  let a = 0;
  let b = 3;
  for (let i = 0; i < 60; i++) {
    const m = (a + b) / 2;
    if (erfc(m) > meta) a = m;
    else b = m;
  }
  return (a + b) / 2;
})();

/** Segundos para que el sensor a `xm` metros llegue a 40 °C. */
export function tiempoSensor(alfa: number, xm: number): number {
  return (xm * xm) / (4 * alfa * U_SENSOR * U_SENSOR);
}

export const MATERIALES = [
  { id: "inox", etq: "Acero inoxidable", k: 16, alfa: 4.2e-6, color: "#9ca3af" },
  { id: "laton", etq: "Latón", k: 110, alfa: 3.4e-5, color: "#d4a017" },
  { id: "aluminio", etq: "Aluminio", k: 237, alfa: 9.7e-5, color: "#d1d5db" },
  { id: "cobre", etq: "Cobre", k: 401, alfa: 1.11e-4, color: "#c2703d" },
] as const;

const ALFA_COBRE = 1.11e-4;
export const X_FIJA_CM = 10;

/* Panel: simulador solar de 1 000 W/m² sobre un panel de 0.5 m² con 20 % de eficiencia a 25 °C. */
export const AREA_PANEL = 0.5;
export const COEF_T_PANEL = 0.004;

/* Consumo: medidor de energía conectado a un contacto de 127 V. */
export const APARATOS = [
  { id: "led", etq: "Foco LED", w: 9 },
  { id: "laptop", etq: "Laptop", w: 65 },
  { id: "tv", etq: "Televisor", w: 100 },
  { id: "licuadora", etq: "Licuadora", w: 400 },
  { id: "plancha", etq: "Plancha", w: 1000 },
] as const;

export const INVESTIGACIONES: Investigacion[] = [
  {
    id: "conduccion",
    etq: "Conducción térmica",
    icono: "fa-temperature-arrow-up",
    controladas: ["Temperatura del agua caliente (100 °C)", "Grosor de la barra"],
    cualitativo: "Qué tan caliente se siente la barra al tocarla",
    vis: [
      {
        id: "distancia",
        corta: "Distancia al sensor",
        frase: "la distancia entre el agua caliente y el sensor",
        unidad: "cm",
        niveles: [5, 10, 15, 20, 25].map((v) => ({ v, etq: `${v} cm` })),
        vd: { corta: "Tiempo para llegar a 40 °C", frase: "el tiempo que tarda el sensor en marcar 40 °C", unidad: "s", dec: 1 },
        montaje: "Barra de cobre con un extremo en agua hirviendo.",
        modelo: (n) => tiempoSensor(ALFA_COBRE, n.v / 100),
        ruido: 0.03,
        porque: "El calor avanza por la barra de un átomo a otro. Al doble de distancia no tarda el doble, sino unas cuatro veces más: el tiempo crece con el cuadrado de la distancia.",
      },
      {
        id: "material",
        corta: "Material de la barra",
        frase: "la conductividad térmica del material",
        unidad: "W/m·°C",
        niveles: MATERIALES.map((m) => ({ v: m.k, etq: `${m.etq} (${m.k})`, aux: m.alfa })),
        vd: { corta: "Tiempo para llegar a 40 °C", frase: "el tiempo que tarda el sensor en marcar 40 °C", unidad: "s", dec: 1 },
        montaje: `Barras del mismo grosor con el sensor a ${X_FIJA_CM} cm del agua hirviendo.`,
        modelo: (n) => tiempoSensor(n.aux ?? ALFA_COBRE, X_FIJA_CM / 100),
        ruido: 0.03,
        porque: "Los metales con más conductividad pasan el calor más rápido: el cobre llega a 40 °C en medio minuto y el acero inoxidable tarda cerca de un cuarto de hora.",
      },
    ],
  },
  {
    id: "panel",
    etq: "Eficiencia de un panel solar",
    icono: "fa-solar-panel",
    controladas: ["Intensidad de la luz (1 000 W/m²)", "Área del panel (0.5 m²)"],
    cualitativo: "Qué tan brillante se ve el panel",
    vis: [
      {
        id: "angulo",
        corta: "Ángulo con los rayos",
        frase: "el ángulo entre el panel y los rayos de luz",
        unidad: "°",
        niveles: [0, 20, 40, 60, 80].map((v) => ({ v, etq: `${v}°` })),
        vd: { corta: "Potencia eléctrica", frase: "la potencia eléctrica que entrega", unidad: "W", dec: 1 },
        montaje: "Panel a 25 °C bajo un simulador solar.",
        modelo: (n) => 1000 * AREA_PANEL * Math.cos((n.v * Math.PI) / 180) * ETA_PANEL,
        ruido: 0.015,
        porque: "Inclinado respecto a los rayos, el panel intercepta menos luz: la potencia cae con el coseno del ángulo. A 60° recibe la mitad.",
      },
      {
        id: "temperatura",
        corta: "Temperatura del panel",
        frase: "la temperatura del panel",
        unidad: "°C",
        niveles: [25, 40, 55, 70].map((v) => ({ v, etq: `${v} °C` })),
        vd: { corta: "Eficiencia", frase: "su eficiencia", unidad: "%", dec: 2 },
        montaje: "Panel de frente a los rayos (0°) bajo un simulador solar.",
        modelo: (n) => 100 * ETA_PANEL * (1 - COEF_T_PANEL * (n.v - 25)),
        ruido: 0.008,
        porque: "Al calentarse, el silicio pierde voltaje: un panel típico baja cerca de 0.4 % de su eficiencia por cada grado arriba de 25 °C.",
      },
    ],
  },
  {
    id: "consumo",
    etq: "Consumo de electrodomésticos",
    icono: "fa-plug-circle-bolt",
    controladas: ["Voltaje del contacto (127 V)", "El mismo medidor de energía"],
    cualitativo: "Qué tan caliente se siente el aparato",
    vis: [
      {
        id: "tiempo",
        corta: "Tiempo de uso",
        frase: "el tiempo de uso",
        unidad: "h",
        niveles: [0.5, 1, 2, 3, 4].map((v) => ({ v, etq: `${num(v, v % 1 ? 1 : 0)} h` })),
        vd: { corta: "Energía consumida", frase: "la energía que consume", unidad: "kWh", dec: 3 },
        montaje: "Un televisor de 100 W conectado al medidor.",
        modelo: (n) => (100 * n.v) / 1000,
        ruido: 0.015,
        porque: "La energía es potencia por tiempo (E = P·t): el doble de horas, el doble de kilowatts-hora.",
      },
      {
        id: "potencia",
        corta: "Potencia del aparato",
        frase: "la potencia del aparato",
        unidad: "W",
        niveles: APARATOS.map((a) => ({ v: a.w, etq: `${a.etq} (${num(a.w)} W)` })),
        vd: { corta: "Energía consumida", frase: "la energía que consume en una hora", unidad: "kWh", dec: 3 },
        montaje: "Cada aparato encendido 1 hora.",
        modelo: (n) => n.v / 1000,
        ruido: 0.015,
        porque: "En el mismo tiempo, un aparato de más potencia consume más energía: la plancha gasta en una hora lo que el foco LED en casi cinco días.",
      },
    ],
  },
];

/** Factores a clasificar para la VI elegida, en orden fijo revuelto. */
export function factores(inv: Investigacion, viIdx: number): { etq: string; rol: Rol }[] {
  const vi = inv.vis[viIdx]!;
  const otra = inv.vis[1 - viIdx]!;
  const lista: { etq: string; rol: Rol }[] = [
    { etq: vi.corta, rol: "vi" },
    { etq: inv.controladas[0]!, rol: "vc" },
    { etq: vi.vd.corta, rol: "vd" },
    { etq: otra.corta, rol: "vc" },
    { etq: inv.controladas[1]!, rol: "vc" },
  ];
  return lista;
}

/** Opciones para la variable dependiente (la buena, una controlada y un dato cualitativo). */
export function opcionesVD(inv: Investigacion, viIdx: number): { etq: string; ok: boolean; porque: string }[] {
  const vi = inv.vis[viIdx]!;
  return [
    { etq: inv.cualitativo, ok: false, porque: "Es un dato cualitativo: sirve para describir, pero no se puede medir con números y unidades." },
    { etq: vi.vd.corta, ok: true, porque: `Se mide con un instrumento y se expresa en ${vi.vd.unidad}.` },
    { etq: inv.controladas[0]!, ok: false, porque: "Esa se mantiene constante para que no interfiera: no es lo que mides." },
  ];
}

export function tendenciaReal(op: OpcionVI, niveles: NivelInv[]): Tendencia {
  if (niveles.length < 2) return "igual";
  const orden = [...niveles].sort((a, b) => a.v - b.v);
  const a = op.modelo(orden[0]!);
  const b = op.modelo(orden[orden.length - 1]!);
  if (Math.abs(b - a) < 1e-9 * Math.max(1, Math.abs(a))) return "igual";
  return b > a ? "aumenta" : "disminuye";
}

function normal(rnd: () => number): number {
  const u = Math.max(1e-9, rnd());
  const v = rnd();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export interface FilaDatos {
  nivel: NivelInv;
  medidas: number[];
  promedio: number;
}

/** Datos simulados: modelo + variación de medición en cada repetición. */
export function simular(op: OpcionVI, niveles: NivelInv[], reps: number, rnd: () => number = Math.random): FilaDatos[] {
  const orden = [...niveles].sort((a, b) => a.v - b.v);
  return orden.map((nivel) => {
    const real = op.modelo(nivel);
    const medidas = Array.from({ length: reps }, () => {
      const f = Math.max(-2.5, Math.min(2.5, normal(rnd)));
      const x = real * (1 + op.ruido * f);
      const p = Math.pow(10, op.vd.dec);
      return Math.round(x * p) / p;
    });
    return { nivel, medidas, promedio: medidas.reduce((s, m) => s + m, 0) / medidas.length };
  });
}

export const MIN_NIVELES = 3;

/* ── Estrellas: ¿fenómeno o tecnología? (categorías del glosario A5) ──── */

export type Categoria = "fenomeno" | "maquina" | "generador" | "aplicacion";
export const CATEGORIAS: { id: Categoria; etq: string; icono: string; color: string }[] = [
  { id: "fenomeno", etq: "Fenómeno natural", icono: "fa-cloud-bolt", color: "#fbbf24" },
  { id: "maquina", etq: "Máquina térmica", icono: "fa-fire-flame-curved", color: "#fb923c" },
  { id: "generador", etq: "Generador eléctrico", icono: "fa-bolt", color: "#22d3ee" },
  { id: "aplicacion", etq: "Otra aplicación tecnológica", icono: "fa-lightbulb", color: "#a78bfa" },
];

export const CASOS: { texto: string; cat: Categoria; porque: string }[] = [
  { texto: "Un rayo durante una tormenta", cat: "fenomeno", porque: "Ocurre sin intervención humana: es un fenómeno energético natural." },
  { texto: "El motor de un automóvil", cat: "maquina", porque: "Quema gasolina y transforma ese calor en trabajo mecánico." },
  { texto: "El generador de una central hidroeléctrica", cat: "generador", porque: "Transforma el giro de la turbina (mecánica) en electricidad." },
  { texto: "Un panel solar que produce electricidad", cat: "aplicacion", porque: "Transforma luz en electricidad sin calor ni piezas que giren." },
  { texto: "Un géiser que lanza agua hirviendo", cat: "fenomeno", porque: "El magma calienta el agua subterránea y la expulsa: es natural." },
  { texto: "La brisa que sopla del mar a la playa", cat: "fenomeno", porque: "La produce el calentamiento desigual de la arena y el mar." },
  { texto: "Una locomotora de vapor", cat: "maquina", porque: "El calor del carbón produce vapor que empuja los pistones: calor en trabajo." },
  { texto: "La turbina de vapor de una planta geotérmica", cat: "maquina", porque: "El vapor caliente se expande y hace girar la turbina: calor en trabajo." },
  { texto: "El dínamo que enciende la luz de una bicicleta", cat: "generador", porque: "El giro de la rueda (mecánica) produce electricidad." },
  { texto: "El alternador de un automóvil", cat: "generador", porque: "El motor lo hace girar y produce la electricidad que carga la batería." },
  { texto: "Un foco LED", cat: "aplicacion", porque: "Transforma electricidad en luz; no produce trabajo ni electricidad." },
  { texto: "Una estufa solar que cuece frijoles con espejos", cat: "aplicacion", porque: "Concentra la luz y la vuelve calor para cocinar; no produce trabajo." },
  { texto: "La fotosíntesis en una milpa", cat: "fenomeno", porque: "Las plantas guardan la energía de la luz como energía química." },
  { texto: "El motor diésel de un tractor", cat: "maquina", porque: "Quema diésel y transforma ese calor en trabajo mecánico." },
];

export function rondaCasos(rnd: () => number, n = 6): number[] {
  const baraja = (xs: number[]) => {
    const a = [...xs];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [a[i], a[j]] = [a[j]!, a[i]!];
    }
    return a;
  };
  const porCat = CATEGORIAS.map((c) => baraja(CASOS.map((x, i) => ({ x, i })).filter((y) => y.x.cat === c.id).map((y) => y.i)));
  const primeros = porCat.map((l) => l[0]!);
  const resto = baraja(porCat.flatMap((l) => l.slice(1)));
  return baraja([...primeros, ...resto.slice(0, n - primeros.length)]);
}

export function estrellasPorErrores(errores: number): number {
  return errores === 0 ? 3 : errores <= 2 ? 2 : 1;
}

/* ════════════════════════════════════════════════════════════════════════
 * Contenido VERBATIM
 * ════════════════════════════════════════════════════════════════════════ */

/** Simulación A2 «Diseña tu investigación sobre energía» — verbatim. */
export const A2 = {
  titulo: "Simulación: diseña tu investigación sobre energía",
  descripcion:
    "Simulación interactiva de diseño de investigación científica sobre un fenómeno energético. El estudiante elige un fenómeno (conducción térmica, eficiencia de un panel solar o consumo energético de electrodomésticos), formula su pregunta e hipótesis, diseña el experimento definiendo variables, y analiza datos simulados para llegar a conclusiones.",
  instrucciones: [
    "Elige uno de los tres fenómenos energéticos: conducción térmica, eficiencia de un panel solar o consumo energético de electrodomésticos.",
    "Formula tu pregunta de investigación siguiendo el patrón: «¿Cómo afecta [variable independiente] a [variable dependiente]?»",
    "Escribe tu hipótesis antes de iniciar: enuncia lo que esperas encontrar y por qué.",
    "Configura el experimento: define variable independiente, variable dependiente y variables controladas.",
    "Diseña las pruebas (mínimo 3 niveles de la variable independiente) y organiza los datos en una tabla.",
    "Analiza los resultados: ¿confirman o refutan tu hipótesis? ¿Por qué?",
  ],
  reporteEsperado: "Informe breve con: pregunta de investigación, hipótesis, diseño experimental (tabla de variables), datos obtenidos y conclusión basada en los datos.",
  preguntasReflexion: [
    "¿Tu hipótesis fue confirmada por los datos? Si no, ¿qué te dice eso sobre el método científico?",
    "¿Qué haría más confiables tus resultados? (Piensa en repeticiones, precisión de los instrumentos, variables controladas).",
    "¿Cómo conecta tu investigación con alguno de los propósitos formativos de CNEYT-II que ya estudiaste?",
  ],
};

/** Quiz A4 «Fenómenos y aplicaciones — Verdadero o falso» — verbatim, como reactivos de dos opciones. */
export const QUIZ_A4: QuizEvaluable = {
  titulo: "Fenómenos y aplicaciones — Verdadero o falso",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "Los conceptos de energía permiten explicar fenómenos naturales como las tormentas o el ciclo del agua.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion: "Correcto: la energía está detrás de muchos fenómenos naturales.",
    },
    {
      enunciado: "Una planta de generación eléctrica es una aplicación tecnológica de la energía.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion: "Correcto: transforma una forma de energía en electricidad.",
    },
    {
      enunciado: "El conocimiento de la energía no sirve para crear tecnología útil.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 1,
      retroalimentacion: "Falso: gracias a él se diseñan motores, paneles, electrodomésticos, etc.",
    },
    {
      enunciado: "Explicar un fenómeno energético implica identificar las transformaciones de energía que ocurren.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion: "Correcto: se analiza cómo cambia la energía de forma.",
    },
  ],
};

/** Glosario A5 «fenómenos y tecnología de la energía» — verbatim. */
export const GLOSARIO_A5: { termino: string; definicion: string; ejemplo: string }[] = [
  { termino: "Fenómeno energético", definicion: "Suceso natural o artificial en el que intervienen transformaciones de energía.", ejemplo: "Un rayo durante una tormenta." },
  { termino: "Aplicación tecnológica", definicion: "Uso del conocimiento científico para crear dispositivos o procesos útiles.", ejemplo: "Un panel solar que produce electricidad." },
  { termino: "Máquina térmica", definicion: "Dispositivo que transforma calor en trabajo mecánico.", ejemplo: "El motor de un automóvil." },
  { termino: "Generador eléctrico", definicion: "Dispositivo que transforma energía mecánica en energía eléctrica.", ejemplo: "El generador de una central hidroeléctrica." },
];
export const ACTIVIDAD_A5 = "Elige un aparato tecnológico y explica qué transformación de energía realiza.";

/** Glosario A1 «diseño de investigaciones» — verbatim. */
export const GLOSARIO_A1: { termino: string; definicion: string; ejemplo: string }[] = [
  { termino: "Pregunta de investigación", definicion: "Interrogante específica, medible y delimitada que orienta todo el proceso científico.", ejemplo: "¿Cómo afecta la temperatura del agua a la velocidad de disolución del azúcar?" },
  { termino: "Hipótesis", definicion: "Explicación provisional y comprobable que responde a la pregunta de investigación antes de obtener datos.", ejemplo: "Si se aumenta la temperatura del agua, el azúcar se disuelve más rápido porque las moléculas tienen más energía cinética." },
  { termino: "Variable independiente", definicion: "Factor que el investigador manipula o controla deliberadamente para observar su efecto.", ejemplo: "En el experimento del azúcar, la temperatura del agua es la variable independiente." },
  { termino: "Variable dependiente", definicion: "Factor que se mide u observa para detectar el efecto de la variable independiente.", ejemplo: "El tiempo que tarda el azúcar en disolverse es la variable dependiente." },
  { termino: "Variables controladas", definicion: "Factores que se mantienen constantes durante el experimento para que no interfieran con los resultados.", ejemplo: "La cantidad de azúcar, el tipo de azúcar y el volumen de agua se mantienen iguales en cada prueba." },
  { termino: "Metodología", definicion: "Descripción detallada y reproducible del procedimiento, materiales y técnicas usadas en la investigación.", ejemplo: "Calentar 100 mL de agua a 25°C, 50°C y 75°C; agregar 5 g de azúcar y medir el tiempo de disolución con cronómetro." },
  { termino: "Datos cuantitativos", definicion: "Datos expresados en números y unidades que permiten comparaciones precisas y análisis estadístico.", ejemplo: "Temperatura: 25°C, 50°C, 75°C; Tiempo de disolución: 120 s, 85 s, 40 s." },
  { termino: "Datos cualitativos", definicion: "Datos descriptivos no numéricos que aportan contexto o características observadas.", ejemplo: "El agua a mayor temperatura producía más vapor visible; la disolución a baja temperatura era más lenta y gradual." },
  { termino: "Conclusión científica", definicion: "Interpretación basada en datos que responde la pregunta de investigación y confirma, rechaza o modifica la hipótesis.", ejemplo: "Los datos confirman que a mayor temperatura del agua, menor es el tiempo de disolución del azúcar, lo que apoya la hipótesis." },
  { termino: "Reproducibilidad", definicion: "Capacidad de obtener resultados similares al repetir el experimento en condiciones iguales; criterio básico de validez científica.", ejemplo: "Si otro laboratorio repite el experimento con los mismos parámetros y obtiene resultados similares, los resultados son reproducibles." },
];
export const ACTIVIDAD_A1 =
  "Diseña en tres oraciones una investigación simple sobre un fenómeno energético que puedas observar en tu entorno: define la pregunta, enuncia una hipótesis e identifica las variables (independiente, dependiente y controladas).";

/** Video A8: preguntas cerradas (verbatim) con su respuesta. */
export const HECHOS_A8: string[] = [
  "«¿Cuál de los siguientes es un ejemplo de aplicación tecnológica basada en un tipo de energía?» — Un panel solar que aprovecha la energía luminosa.",
  "Verdadero: «Distintos tipos de energía pueden explicar fenómenos naturales y también dar lugar a aplicaciones tecnológicas.»",
];
export const TITULO_A8 = "Tipos de energía en fenómenos naturales y tecnología";
export const DESCRIPCION_A8 = "Video que explica cómo distintos tipos de energía intervienen en fenómenos naturales y cómo esas ideas se aplican en tecnologías cotidianas.";

/** Preguntas abiertas para reflexionar (verbatim de A8 y A7). */
export const REFLEXION: string[] = [
  "¿Qué tipo de energía identificas en un fenómeno natural que hayas observado, por ejemplo un rayo o el viento?",
  "¿Qué aplicación tecnológica de la energía te parece más importante para tu comunidad y por qué?",
];

/** Actividad A6 «Completa: fenómenos y aplicaciones» — verbatim. */
export const HUECOS_A6: TextoHuecosData = {
  ancla: "CNEYT-II-P08-A6 · Completa: fenómenos y aplicaciones",
  instrucciones: "Completa con la palabra correcta.",
  partes: [
    "Los conceptos de energía permiten ",
    " fenómenos naturales y tecnológicos. Una ",
    " térmica transforma calor en trabajo, y un generador transforma energía ",
    " en eléctrica. Explicar un fenómeno energético implica identificar las ",
    " de energía que ocurren.",
  ],
  huecos: [
    { respuesta: "explicar", alternativas: ["entender", "comprender"], pista: "Dar razón de algo." },
    { respuesta: "máquina", alternativas: ["maquina"], pista: "Máquina ___ (térmica)." },
    { respuesta: "mecánica", alternativas: ["mecanica"], pista: "Energía del movimiento." },
    { respuesta: "transformaciones", alternativas: ["transformacion", "transformación"], pista: "Cambios de forma de la energía." },
  ],
};

export const FUENTE =
  "CEN Bachillerato — CNEYT-II, progresión 8: glosario A1, simulación A2, quiz A4, glosario A5, actividad A6, autoevaluación A7 y video A8.";

export const PROBLEMA =
  "Un rayo, la brisa del mar, un volcán y una hoja al sol parecen no tener nada en común, pero los cuatro son transformaciones de energía. Explica cada fenómeno con su cadena de energía, pon a trabajar la tecnología que aprovecha esa misma energía (y mide cuánta se pierde) y diseña tu propia investigación con datos.";

export const INSTRUCCIONES: string[] = [
  "En Explica el fenómeno, elige un fenómeno y arma su cadena de energía paso a paso; cada acierto hace avanzar la escena.",
  "En Aprovéchala, mueve el viento, la temperatura del vapor o la luz y mira en el diagrama de flujo cuánta energía llega útil y cuánta se pierde.",
  "En Diseña tu investigación, sigue la simulación A2: pregunta, hipótesis, variables, al menos tres niveles, datos y conclusión.",
  "Clasifica casos en «¿Fenómeno o tecnología?» para ganar estrellas y resuelve el quiz A4 y el texto A6.",
];

export const IDEAS: string[] = [
  "Explicar un fenómeno es seguir la energía: de dónde viene, en qué formas se transforma y en qué termina.",
  "Casi todos los fenómenos del clima empiezan con la luz del Sol; los volcanes, con el calor interno de la Tierra.",
  "La tecnología aprovecha la misma energía que mueve la naturaleza: el viento, el vapor del subsuelo, la luz.",
  "Ninguna transformación entrega el 100 %: la energía no se pierde, pero una parte acaba como calor que ya no se aprovecha.",
  "La potencia del viento crece con el cubo de su velocidad: el doble de viento da ocho veces más potencia.",
  "Una buena investigación cambia una sola variable, mide otra con números y unidades, y mantiene constantes las demás.",
];
