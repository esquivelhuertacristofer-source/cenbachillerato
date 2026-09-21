/**
 * Datos y modelo del laboratorio "Contaminantes químicos y plásticos"
 * (CNEYT-IV, progresión 10 — códigos de actividad CNEYT-IV-P07-A*).
 * Propósito: «Evalúa el impacto de los contaminantes químicos y los plásticos
 * en el ambiente.»
 *
 * Anclas (VERBATIM):
 *   - A1 lectura «Contaminantes químicos y plásticos: la crisis silenciosa»:
 *     marco teórico (7 párrafos), recuadro y preguntas de comprensión.
 *   - A2 verdadero/falso «¿Verdadero o falso? Plásticos y contaminantes en el
 *     ambiente»: reto evaluable (cada enunciado con opciones Verdadero/Falso).
 *     Su cadena del DDT (0.000003 → 0.5 → 25 ppm) es la del modo 2.
 *   - A4 verdadero/falso: hechos. A5 glosario (6 términos). A6 completa el texto.
 *
 * Tres modos:
 *   (1) Plástico en el mar — densidad frente al agua de mar, fragmentación por
 *       sol/oleaje y la red de superficie que no alcanza a los microplásticos.
 *   (2) Biomagnificación — el DDT y el metilmercurio suben por la cadena; la
 *       edad del atún (bioacumulación) y la ingesta semanal de una persona.
 *   (3) ¿A dónde va tu residuo? — reciclaje, composta, relleno o río.
 *
 * REAL: densidades de las resinas, abertura de la red de manta (0.333 mm),
 * clases de tamaño (macro > 25 mm, meso 5–25, micro < 5 mm, nano < 1 µm),
 * mercurio promedio en pescado comercial (FDA, 1990–2012), ingesta semanal
 * tolerable provisional de metilmercurio 1.6 µg/kg (JECFA 2003), condiciones de
 * compostaje industrial (~58 °C, norma EN 13432).
 * ILUSTRATIVO: la velocidad de fragmentación (sólo el orden de magnitud y el
 * orden «playa > superficie > fondo» son reales), las concentraciones de
 * mercurio en agua y plancton, la curva de mercurio con la edad del atún y la
 * desintegración del PLA entre 45 y 58 °C.
 *
 * Datos puros (sin three ni React).
 */

import type { QuizEvaluable } from "./_reto-quiz";
import type { TextoHuecosData } from "./_mecanica-huecos";

/* ── Modos ────────────────────────────────────────────────────────────── */

export type Modo = "oceano" | "cadena" | "destino";
export const MODOS: Modo[] = ["oceano", "cadena", "destino"];

export const MODOS_DEF: Record<Modo, { etq: string; subtitulo: string; icono: string; color: string }> = {
  oceano: { etq: "Plástico en el mar", subtitulo: "Flota o se hunde, y se hace pedazos", icono: "fa-water", color: "#38bdf8" },
  cadena: { etq: "Biomagnificación", subtitulo: "El contaminante sube por la cadena", icono: "fa-fish", color: "#f472b6" },
  destino: { etq: "¿A dónde va tu residuo?", subtitulo: "Reciclar, compostar o tirar", icono: "fa-recycle", color: "#34d399" },
};

export function num(x: number, dec = 0): string {
  const s = Math.abs(x).toFixed(dec);
  const [ent, frac] = s.split(".");
  const conMiles = ent!.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${x < 0 ? "−" : ""}${conMiles}${frac ? `.${frac}` : ""}`;
}

/** Número pequeño o grande con decimales razonables (0.000003, 0.04, 25). */
export function ppmTxt(x: number): string {
  if (x >= 10) return num(x, 0);
  if (x >= 1) return num(x, 1);
  if (x >= 0.1) return num(x, 2);
  const dec = Math.min(8, Math.ceil(-Math.log10(x)) + 1);
  return x.toFixed(dec).replace(/0+$/, "");
}

/* ════════════════════════════════════════════════════════════════════════
 * 1. PLÁSTICO EN EL MAR
 * ════════════════════════════════════════════════════════════════════════ */

/** Densidad típica del agua de mar superficial (g/cm³). */
export const DENS_MAR = 1.025;
/** Abertura de malla de la red de manta usada para muestrear microplásticos (mm). */
export const MALLA_MM = 0.333;

export type ResinaId = "pet" | "pead" | "pvc" | "pebd" | "pp" | "ps" | "otros";

export interface Resina {
  id: ResinaId;
  codigo: number;
  sigla: string;
  nombre: string;
  objeto: string;
  /** Densidad del material (g/cm³). */
  densidad: number;
  densTxt: string;
  /** Tamaño inicial del objeto (mm). */
  L0: number;
  /** Tiempo característico (años) de fragmentación al sol de la playa. ILUSTRATIVO. */
  tau: number;
  color: string;
  reciclaje: string;
  /** Aclaración que se muestra al soltarlo. */
  nota: string;
}

export const RESINAS: Resina[] = [
  {
    id: "pet",
    codigo: 1,
    sigla: "PET",
    nombre: "Tereftalato de polietileno",
    objeto: "Botella de agua",
    densidad: 1.38,
    densTxt: "1.38–1.41",
    L0: 220,
    tau: 8,
    color: "#7dd3fc",
    reciclaje: "Muy reciclable: se acopia y se convierte en rPET para botellas y fibras.",
    nota: "Una botella tapada flota un tiempo por el aire que lleva dentro, pero el PET es más denso que el agua de mar: en cuanto se llena o se rompe, sus pedazos se hunden.",
  },
  {
    id: "pead",
    codigo: 2,
    sigla: "PEAD",
    nombre: "Polietileno de alta densidad",
    objeto: "Envase de leche o de cloro",
    densidad: 0.95,
    densTxt: "0.94–0.97",
    L0: 250,
    tau: 9,
    color: "#f1f5f9",
    reciclaje: "Reciclable y con mercado: se vuelve tubería, cubetas y nuevos envases.",
    nota: "El polietileno es menos denso que el agua: flota y viaja con las corrientes hasta costas lejanas.",
  },
  {
    id: "pvc",
    codigo: 3,
    sigla: "PVC",
    nombre: "Policloruro de vinilo",
    objeto: "Tramo de tubo",
    densidad: 1.38,
    densTxt: "1.30–1.45 (rígido)",
    L0: 150,
    tau: 18,
    color: "#94a3b8",
    reciclaje: "Poco reciclado: su cloro y sus aditivos complican fundirlo junto con otros plásticos.",
    nota: "El PVC rígido es mucho más denso que el agua de mar: va directo al fondo, donde ninguna red de superficie lo alcanza.",
  },
  {
    id: "pebd",
    codigo: 4,
    sigla: "PEBD",
    nombre: "Polietileno de baja densidad",
    objeto: "Bolsa de supermercado",
    densidad: 0.92,
    densTxt: "0.91–0.93",
    L0: 300,
    tau: 1.5,
    color: "#e2e8f0",
    reciclaje: "Reciclable si llega limpia y seca; sucia o mezclada, casi siempre termina en el relleno.",
    nota: "Una película tan delgada se hace pedazos pronto al sol: es de las primeras en volverse microplástico.",
  },
  {
    id: "pp",
    codigo: 5,
    sigla: "PP",
    nombre: "Polipropileno",
    objeto: "Tupper con tapa",
    densidad: 0.905,
    densTxt: "0.90–0.91",
    L0: 160,
    tau: 4,
    color: "#a5b4fc",
    reciclaje: "Reciclable; se usa en cubetas, cajas y piezas de autos, aunque se acopia menos que el PET.",
    nota: "El polipropileno es el plástico común menos denso: flota con facilidad.",
  },
  {
    id: "ps",
    codigo: 6,
    sigla: "PS",
    nombre: "Poliestireno",
    objeto: "Cubiertos desechables",
    densidad: 1.05,
    densTxt: "1.04–1.06 (sólido)",
    L0: 170,
    tau: 2.5,
    color: "#f8fafc",
    reciclaje: "Casi no se recicla. Su versión espumada, el unicel, es alrededor de 95 % aire.",
    nota: "El poliestireno sólido apenas supera la densidad del agua de mar y se hunde despacio. El unicel, en cambio, está lleno de aire y flota.",
  },
  {
    id: "otros",
    codigo: 7,
    sigla: "Otros",
    nombre: "Nailon (poliamida) y otras resinas",
    objeto: "Red de pesca abandonada",
    densidad: 1.14,
    densTxt: "1.13–1.15",
    L0: 500,
    tau: 12,
    color: "#4ade80",
    reciclaje: "El código 7 agrupa resinas distintas (nailon, policarbonato, PLA): casi ninguna planta las recibe.",
    nota: "Las «redes fantasma» de nailon se hunden y siguen atrapando peces y tortugas durante años.",
  },
];

export type Lugar = "playa" | "mar";
export type Zona = "playa" | "superficie" | "fondo";

export const ZONA_DEF: Record<Zona, { etq: string; factor: number; explica: string }> = {
  playa: { etq: "Playa", factor: 1, explica: "Al sol de la playa: radiación UV, calor y abrasión de la arena. Es donde el plástico se fragmenta más rápido." },
  superficie: { etq: "Superficie del mar", factor: 4, explica: "Flotando: recibe UV, pero el agua lo enfría y las algas que lo cubren le dan sombra, así que se fragmenta más lento que en la playa." },
  fondo: { etq: "Fondo marino", factor: 50, explica: "En el fondo no llega luz, hace frío y hay poco oxígeno: casi no se fragmenta y puede durar muchísimo." },
};

/** Tiempo en que la bioincrustación hunde un plástico que flotaba (años). Semanas a meses: ILUSTRATIVO. */
export const T_BIO = 0.25;
export const T_MAX_ANIOS = 1000;

/** Posición del deslizador (0–100) → años. Escala logarítmica de 0.1 a 1000 años. */
export function aniosDeSlider(s: number): number {
  return s <= 0 ? 0 : Math.pow(10, -1 + (4 * s) / 100);
}

export function tiempoTxt(t: number): string {
  if (t === 0) return "recién tirado";
  if (t < 1) return `${Math.max(1, Math.round(t * 12))} ${Math.round(t * 12) === 1 ? "mes" : "meses"}`;
  if (t < 10) return `${num(t, 1)} años`;
  return `${num(t, 0)} años`;
}

export type ClaseTam = "macro" | "meso" | "micro" | "nano";

export const CLASE_DEF: Record<ClaseTam, { etq: string; rango: string; color: string }> = {
  macro: { etq: "Macroplástico", rango: "más de 25 mm", color: "#94a3b8" },
  meso: { etq: "Mesoplástico", rango: "5 a 25 mm", color: "#fbbf24" },
  micro: { etq: "Microplástico", rango: "menos de 5 mm", color: "#fb923c" },
  nano: { etq: "Nanoplástico", rango: "menos de 1 µm", color: "#f43f5e" },
};

export function claseTam(Lmm: number): ClaseTam {
  if (Lmm > 25) return "macro";
  if (Lmm >= 5) return "meso";
  if (Lmm >= 0.001) return "micro";
  return "nano";
}

export function tamTxt(Lmm: number): string {
  if (Lmm >= 10) return `${num(Lmm, 0)} mm`;
  if (Lmm >= 1) return `${num(Lmm, 1)} mm`;
  if (Lmm >= 0.01) return `${num(Lmm, 2)} mm`;
  if (Lmm >= 0.001) return `${num(Lmm * 1000, 0)} µm`;
  if (Lmm >= 0.000001) return `${num(Lmm * 1e6, 0)} nm`;
  return "< 1 nm";
}

export function flota(r: Resina): boolean {
  return r.densidad < DENS_MAR;
}

/** Función de distribución normal estándar (aproximación de Abramowitz–Stegun). */
function phi(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}

/** Dispersión (en logaritmo natural) del tamaño de los pedazos alrededor del típico. */
export const SIGMA_TAM = 1;

export interface EstadoPlastico {
  zona: Zona;
  /** Tamaño típico de los pedazos (mm). */
  L: number;
  clase: ClaseTam;
  /** Número aproximado de pedazos (orden de magnitud). */
  pedazos: number;
  /** Fracción del plástico que atraparía una red de superficie (0–1). */
  captura: number;
  hundidoPorBio: boolean;
}

/** Constante de la curva de fragmentación: cada vez cuesta más partir pedazos más pequeños. ILUSTRATIVA. */
export const K_FRAG = 3;

export function estadoPlastico(r: Resina, lugar: Lugar, t: number, bio: boolean): EstadoPlastico {
  let zona: Zona;
  // Tiempo equivalente «al sol de la playa»: cada zona avanza más despacio según su factor.
  let te: number;
  let hundidoPorBio = false;
  if (lugar === "playa") {
    zona = "playa";
    te = t / ZONA_DEF.playa.factor;
  } else if (!flota(r)) {
    zona = "fondo";
    te = t / ZONA_DEF.fondo.factor;
  } else if (bio && t > T_BIO) {
    zona = "fondo";
    hundidoPorBio = true;
    te = T_BIO / ZONA_DEF.superficie.factor + (t - T_BIO) / ZONA_DEF.fondo.factor;
  } else {
    zona = "superficie";
    te = t / ZONA_DEF.superficie.factor;
  }
  // Número de «mitades» de tamaño: crece con el logaritmo del tiempo.
  const medias = K_FRAG * Math.log(1 + te / r.tau);
  const L = r.L0 * Math.pow(2, -medias);
  // Objetos de pared delgada: el número de pedazos crece con el cuadrado.
  const pedazos = Math.max(1, Math.pow(r.L0 / L, 2));
  const captura = zona === "superficie" ? 1 - phi((Math.log(MALLA_MM) - Math.log(L)) / SIGMA_TAM) : 0;
  return { zona, L, clase: claseTam(L), pedazos, captura, hundidoPorBio };
}

export function pedazosTxt(n: number): string {
  if (n < 2) return "1 pieza";
  if (n < 1000) return `≈ ${num(n, 0)} pedazos`;
  return `≈ 10^${Math.floor(Math.log10(n))} pedazos`;
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. BIOMAGNIFICACIÓN
 * ════════════════════════════════════════════════════════════════════════ */

export type ContamId = "ddt" | "hg";
export type TipoOrg = "agua" | "fito" | "zoo" | "pezChico" | "pezGrande" | "atun" | "aguila" | "persona";

export interface Nivel {
  etq: string;
  tipo: TipoOrg;
  /** Concentración (ppm = mg/kg). null en la persona: se mide su ingesta. */
  ppm: number | null;
  origen: "A2" | "texto" | "FDA" | "ilustrativo" | "ingesta";
}

export interface Cadena {
  id: ContamId;
  etq: string;
  nombre: string;
  niveles: Nivel[];
  porque: string;
  efecto: string;
}

export const EDAD_ATUN_REF = 5;

export const CADENAS: Record<ContamId, Cadena> = {
  ddt: {
    id: "ddt",
    etq: "DDT",
    nombre: "DDT (dicloro difenil tricloroetano)",
    niveles: [
      { etq: "Agua del estuario", tipo: "agua", ppm: 0.000003, origen: "A2" },
      { etq: "Zooplancton", tipo: "zoo", ppm: 0.04, origen: "texto" },
      { etq: "Peces pequeños", tipo: "pezChico", ppm: 0.5, origen: "A2" },
      { etq: "Peces grandes", tipo: "pezGrande", ppm: 2, origen: "texto" },
      { etq: "Águila pescadora", tipo: "aguila", ppm: 25, origen: "A2" },
    ],
    porque: "El DDT es lipofílico: se guarda en la grasa y casi no se elimina. Cada depredador come muchas presas y retiene el DDT de todas.",
    efecto: "El DDE, producto de degradación del DDT, adelgaza el cascarón de los huevos de las aves rapaces: en los años 60 las poblaciones de águila pescadora se desplomaron (Rachel Carson lo denunció en «Primavera silenciosa», 1962).",
  },
  hg: {
    id: "hg",
    etq: "Metilmercurio",
    nombre: "Metilmercurio (la forma orgánica del mercurio)",
    niveles: [
      { etq: "Agua de mar", tipo: "agua", ppm: 0.0000001, origen: "ilustrativo" },
      { etq: "Fitoplancton", tipo: "fito", ppm: 0.002, origen: "ilustrativo" },
      { etq: "Zooplancton", tipo: "zoo", ppm: 0.006, origen: "ilustrativo" },
      { etq: "Sardina", tipo: "pezChico", ppm: 0.013, origen: "FDA" },
      { etq: "Atún", tipo: "atun", ppm: 0.35, origen: "FDA" },
      { etq: "Persona", tipo: "persona", ppm: null, origen: "ingesta" },
    ],
    porque: "Las bacterias del agua convierten el mercurio en metilmercurio, que se une a las proteínas del músculo y se elimina muy despacio. El salto más grande es del agua al fitoplancton.",
    efecto: "En Minamata, Japón, una fábrica vertió mercurio a la bahía durante décadas; desde 1956 miles de personas que comían pescado sufrieron daño neurológico. El Convenio de Minamata (2013), ratificado por México, controla hoy el uso del mercurio.",
  },
};

/** Mercurio del atún según su edad: bioacumulación dentro de un solo organismo. La forma de la curva es ILUSTRATIVA. */
export function ppmAtun(edad: number): number {
  const f = (e: number) => 1 - Math.exp(-e / 6);
  return 0.35 * (f(edad) / f(EDAD_ATUN_REF));
}

export function ppmNivel(c: Cadena, i: number, edadAtun: number): number | null {
  const n = c.niveles[i]!;
  if (n.tipo === "atun") return ppmAtun(edadAtun);
  return n.ppm;
}

/** Concentración de cada nivel comparada con la del agua. */
export function factorDesdeAgua(c: Cadena, i: number, edadAtun: number): number | null {
  const p = ppmNivel(c, i, edadAtun);
  const agua = c.niveles[0]!.ppm!;
  return p === null ? null : p / agua;
}

export function factorTxt(f: number): string {
  if (f >= 1e6) return `${num(f / 1e6, 1)} millones`;
  if (f >= 1000) return num(f, 0);
  if (f >= 10) return num(f, 0);
  return num(f, 1);
}

/* ── Ingesta semanal de metilmercurio ──────────────────────────────────── */

/** Promedio de mercurio en pescado comercial (ppm), FDA «Mercury Levels in Commercial Fish and Shellfish (1990–2012)». */
export const PESCADOS = [
  { id: "sardina", etq: "Sardina", ppm: 0.013 },
  { id: "atunClaro", etq: "Atún claro enlatado", ppm: 0.126 },
  { id: "albacora", etq: "Atún albacora enlatado", ppm: 0.35 },
  { id: "espada", etq: "Pez espada", ppm: 0.995 },
] as const;
export type PescadoId = (typeof PESCADOS)[number]["id"];

export const PORCION_G = 120;
/** Ingesta semanal tolerable provisional de metilmercurio (µg por kg de peso corporal), JECFA 2003. */
export const LIMITE_HG = 1.6;

export function ingestaSemanal(ppm: number, porciones: number, pesoKg: number): number {
  return (ppm * 1000 * (PORCION_G / 1000) * porciones) / pesoKg;
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. ¿A DÓNDE VA TU RESIDUO?
 * ════════════════════════════════════════════════════════════════════════ */

export type ObjetoId = "pet" | "bolsa" | "unicel" | "multicapa" | "pla" | "cascaras";
export type DestinoId = "reciclaje" | "composta" | "relleno" | "rio";
export type Resultado = "ciclo" | "degrada" | "persiste" | "rechazo" | "contamina";

export const OBJETOS: { id: ObjetoId; etq: string; material: string; icono: string; color: string }[] = [
  { id: "pet", etq: "Botella de PET", material: "Resina 1 · PET", icono: "fa-bottle-water", color: "#7dd3fc" },
  { id: "bolsa", etq: "Bolsa de plástico", material: "Resina 4 · PEBD", icono: "fa-bag-shopping", color: "#e2e8f0" },
  { id: "unicel", etq: "Vaso de unicel", material: "Resina 6 · PS expandido", icono: "fa-mug-hot", color: "#f8fafc" },
  { id: "multicapa", etq: "Envase de jugo", material: "Multicapa: cartón, polietileno y aluminio", icono: "fa-box", color: "#fbbf24" },
  { id: "pla", etq: "Vaso «compostable» de PLA", material: "Resina 7 · ácido poliláctico", icono: "fa-leaf", color: "#bef264" },
  { id: "cascaras", etq: "Cáscaras de fruta", material: "Residuo orgánico", icono: "fa-apple-whole", color: "#fb923c" },
];

export const DESTINOS: { id: DestinoId; etq: string; icono: string; color: string }[] = [
  { id: "reciclaje", etq: "Contenedor de reciclables", icono: "fa-recycle", color: "#38bdf8" },
  { id: "composta", etq: "Composta", icono: "fa-seedling", color: "#a3e635" },
  { id: "relleno", etq: "Relleno sanitario", icono: "fa-trash-can", color: "#94a3b8" },
  { id: "rio", etq: "Barranca o río", icono: "fa-person-swimming", color: "#f87171" },
];

export const RESULTADO_DEF: Record<Resultado, { etq: string; color: string; icono: string }> = {
  ciclo: { etq: "Cierra el ciclo", color: "#34d399", icono: "fa-arrows-rotate" },
  degrada: { etq: "Se degrada", color: "#a3e635", icono: "fa-seedling" },
  persiste: { etq: "Persiste", color: "#fbbf24", icono: "fa-hourglass-half" },
  rechazo: { etq: "Rechazado", color: "#fb923c", icono: "fa-ban" },
  contamina: { etq: "Contamina", color: "#f87171", icono: "fa-triangle-exclamation" },
};

export const T_COMPOSTA_MIN = 20;
export const T_COMPOSTA_MAX = 65;
export const T_COMPOSTA_INDUSTRIAL = 58;

/**
 * Fracción del vaso de PLA desintegrada tras 12 semanas en composta. A 58 °C la
 * norma EN 13432 exige al menos 90 %; por debajo de ~50 °C el PLA casi no se
 * hidroliza. La transición entre 50 y 58 °C es ILUSTRATIVA.
 */
export function desintegracionPla(tempC: number): number {
  if (tempC >= T_COMPOSTA_INDUSTRIAL) return 0.9;
  if (tempC <= 50) return 0.02;
  return 0.02 + ((tempC - 50) / (T_COMPOSTA_INDUSTRIAL - 50)) * 0.88;
}

export interface Desenlace {
  tipo: Resultado;
  titulo: string;
  texto: string;
  /** Tiempo que se representa en la escena. */
  plazo: string;
}

export function desenlace(o: ObjetoId, d: DestinoId, tempC: number): Desenlace {
  if (d === "reciclaje") {
    if (o === "pet") return { tipo: "ciclo", plazo: "un ciclo de reciclaje", titulo: "La botella vuelve a ser botella", texto: "Se separa, se tritura en hojuelas, se lava y se funde en pellets de rPET para fabricar nuevas botellas o fibra textil. El material sigue en uso: eso es economía circular." };
    if (o === "bolsa") return { tipo: "rechazo", plazo: "después de la separación", titulo: "Sólo si llega limpia y seca", texto: "La película de PEBD es reciclable si llega limpia y seca, y se convierte en bolsas de basura o madera plástica. Sucia o enredada en la maquinaria, la planta la manda al relleno." };
    if (o === "unicel") return { tipo: "rechazo", plazo: "después de la separación", titulo: "Casi nadie lo recibe", texto: "El unicel es técnicamente reciclable, pero es alrededor de 95 % aire: transportar un camión lleno pesa tan poco que no se paga. Pocos centros de acopio lo aceptan y casi siempre acaba en el relleno." };
    if (o === "multicapa") return { tipo: "rechazo", plazo: "después de la separación", titulo: "Sólo con una planta especializada", texto: "Cartón, polietileno y aluminio están pegados en capas. Hay plantas que los separan con agua y agitación, pero si no hay una cerca el envase termina en el relleno. Diseñar envases de un solo material facilita cerrar el ciclo." };
    if (o === "pla") return { tipo: "rechazo", plazo: "después de la separación", titulo: "Contamina el lote de PET", texto: "El vaso de PLA se parece al PET, pero se funde a otra temperatura: mezclado con PET arruina el rPET. Las plantas lo separan como rechazo. Su destino previsto es la composta industrial." };
    return { tipo: "rechazo", plazo: "después de la separación", titulo: "Ensucia los reciclables", texto: "Los restos de comida manchan el papel y el plástico del contenedor y pueden echar a perder todo el lote. Las cáscaras van a la composta." };
  }
  if (d === "composta") {
    if (o === "cascaras") return { tipo: "degrada", plazo: "12 semanas", titulo: "Se convierte en abono", texto: tempC >= 45 ? "Con el calor de la composta los microorganismos las descomponen en pocas semanas y el material regresa al suelo como abono." : "En una composta tibia también se descomponen, sólo que más despacio: en unos meses son abono." };
    if (o === "pla") {
      const f = desintegracionPla(tempC);
      return f >= 0.5
        ? { tipo: "degrada", plazo: "12 semanas", titulo: `Se desintegra ≈ ${num(f * 100, 0)} %`, texto: `A ${num(tempC, 0)} °C, con humedad y microorganismos, el PLA se hidroliza y se desintegra: son las condiciones de una planta de compostaje industrial (unos 58 °C).` }
        : { tipo: "persiste", plazo: "12 semanas", titulo: `Casi intacto (≈ ${num(f * 100, 0)} %)`, texto: `A ${num(tempC, 0)} °C, como en una composta casera, el PLA prácticamente no se degrada. «Biodegradable» no significa que se degrade en cualquier lugar: necesita más de 50 °C sostenidos.` };
    }
    return { tipo: "persiste", plazo: "12 semanas", titulo: "No se composta", texto: o === "multicapa" ? "El cartón se ablanda, pero el polietileno y el aluminio quedan: ensucian la composta con pedazos de plástico." : "Los microorganismos no pueden descomponer este plástico: sale entero en la criba o, peor, en pedazos que contaminan el abono con microplásticos." };
  }
  if (d === "relleno") {
    if (o === "cascaras") return { tipo: "persiste", plazo: "10 años", titulo: "Se pudren sin oxígeno", texto: "Enterradas y sin aire, las bacterias las descomponen lentamente y producen metano, un gas de efecto invernadero que los rellenos deben captar. En la composta habrían sido abono." };
    if (o === "pla") return { tipo: "persiste", plazo: "10 años", titulo: "Tampoco se degrada aquí", texto: "En el relleno no hay oxígeno ni los 58 °C que necesita: el vaso de PLA se queda casi igual durante años, como un plástico común." };
    return { tipo: "persiste", plazo: "10 años", titulo: "Queda enterrado", texto: "Sin luz ni oxígeno, el plástico apenas cambia. No contamina el mar, pero ocupa espacio y el material se pierde para siempre: es el final del modelo lineal «producir, usar, desechar»." };
  }
  // Río o barranca
  if (o === "cascaras") return { tipo: "contamina", plazo: "unos días", titulo: "Parece inofensivo, pero no lo es", texto: "Se descomponen, pero en el agua eso consume oxígeno y aporta nutrientes que alimentan algas. Muchas cáscaras juntas dañan el río." };
  if (o === "pla") return { tipo: "contamina", plazo: "10 años", titulo: "Se comporta como plástico común", texto: "En el agua fría de un río o del mar el PLA se degrada igual de lento que otros plásticos o se rompe en microplásticos: la etiqueta «biodegradable» no aplica aquí." };
  return { tipo: "contamina", plazo: "10 años", titulo: "Viaja al mar", texto: "La corriente lo arrastra hasta la costa. Allí el sol y el oleaje lo rompen en microplásticos que ingieren peces y aves. Es el camino que termina en el modo «Plástico en el mar»." };
}

/* ════════════════════════════════════════════════════════════════════════
 * Estrellas: ¿qué tipo de contaminante es?
 * ════════════════════════════════════════════════════════════════════════ */

export type TipoContam = "metal" | "cop" | "micro";
export const TIPO_CONTAM_DEF: Record<TipoContam, { etq: string; icono: string; color: string }> = {
  metal: { etq: "Metal pesado", icono: "fa-atom", color: "#94a3b8" },
  cop: { etq: "Contaminante orgánico persistente", icono: "fa-flask", color: "#f472b6" },
  micro: { etq: "Microplástico", icono: "fa-braille", color: "#38bdf8" },
};

export const CONTAMINANTES: { texto: string; tipo: TipoContam; porque: string }[] = [
  { texto: "Plomo de pinturas antiguas", tipo: "metal", porque: "El plomo (Pb) es un elemento metálico denso y tóxico que no se degrada." },
  { texto: "Mercurio de un termómetro roto", tipo: "metal", porque: "El mercurio (Hg) es un metal pesado; en el agua se vuelve metilmercurio y se biomagnifica." },
  { texto: "Cadmio de pilas recargables viejas", tipo: "metal", porque: "El cadmio (Cd) de las pilas de níquel-cadmio es un metal pesado." },
  { texto: "Arsénico en agua de pozo", tipo: "metal", porque: "La lectura A1 agrupa el arsénico (As) con los metales pesados: es un elemento tóxico que no se degrada." },
  { texto: "DDT de fumigaciones antiguas", tipo: "cop", porque: "El DDT es un compuesto orgánico sintético que resiste la degradación y se guarda en la grasa." },
  { texto: "PCB de transformadores eléctricos viejos", tipo: "cop", porque: "Los PCB (bifenilos policlorados) son COP regulados por el Convenio de Estocolmo." },
  { texto: "Dioxinas de la quema de basura a cielo abierto", tipo: "cop", porque: "Las dioxinas se forman al quemar residuos con cloro; son COP muy tóxicos." },
  { texto: "Microfibras que suelta la ropa sintética al lavarse", tipo: "micro", porque: "Son hilos de poliéster o nailon de menos de 5 mm: microplásticos." },
  { texto: "Microesferas de un exfoliante", tipo: "micro", porque: "Se fabrican directamente de menos de 5 mm: microplásticos primarios." },
  { texto: "Pellets de resina derramados en una playa", tipo: "micro", porque: "La materia prima de la industria del plástico viene en bolitas de pocos milímetros." },
  { texto: "Fragmentos de 2 mm de una botella al sol", tipo: "micro", porque: "Pedazos menores a 5 mm que salen de un plástico mayor: microplásticos secundarios." },
];

export function mulberry32(semilla: number) {
  let t = semilla >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** Ronda de 6: dos de cada tipo, revueltas. */
export function rondaContaminantes(rnd: () => number): number[] {
  const baraja = (xs: number[]) => {
    const a = [...xs];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [a[i], a[j]] = [a[j]!, a[i]!];
    }
    return a;
  };
  const de = (tipo: TipoContam) => baraja(CONTAMINANTES.map((c, i) => ({ c, i })).filter((x) => x.c.tipo === tipo).map((x) => x.i)).slice(0, 2);
  return baraja([...de("metal"), ...de("cop"), ...de("micro")]);
}

export function estrellasPorErrores(errores: number): number {
  return errores === 0 ? 3 : errores <= 2 ? 2 : 1;
}

/* ════════════════════════════════════════════════════════════════════════
 * Contenido VERBATIM
 * ════════════════════════════════════════════════════════════════════════ */

export const TITULO_A1 = "Contaminantes químicos y plásticos: la crisis silenciosa";

/** Lectura A1 — siete párrafos, verbatim. */
export const LECTURA_A1: string[] = [
  "La contaminación química es uno de los problemas ambientales más complejos porque muchos de sus efectos son invisibles a simple vista, se acumulan lentamente en los ecosistemas y tienen consecuencias que no se manifiestan hasta décadas después de la exposición.",
  "Los contaminantes pueden clasificarse en tres grandes grupos. Los metales pesados —plomo, mercurio, cadmio, arsénico— son elementos naturales que en altas concentraciones son altamente tóxicos. El plomo afecta el desarrollo neurológico en niños, y aunque México eliminó la gasolina con plomo en 1998, los suelos de ciudades antiguas todavía presentan concentraciones elevadas. El mercurio se concentra en peces de aguas profundas y puede causar daños al sistema nervioso central.",
  "Los contaminantes orgánicos persistentes (COPs) son compuestos sintéticos que no se degradan fácilmente en la naturaleza: DDT, PCBs, dioxinas. Fueron ampliamente usados en agricultura e industria y ahora se encuentran en todos los rincones del planeta, incluyendo la grasa de osos polares en el Ártico, aunque nunca se usaron ahí.",
  "Los microplásticos son fragmentos de plástico menores a 5 mm que provienen de la degradación de plásticos mayores o que se fabrican directamente como microesferas en cosméticos. Se han encontrado en el agua potable, en la sal de mesa, en el aire y en la sangre humana. Sus efectos a largo plazo en la salud son todavía objeto de investigación activa.",
  "La bioacumulación y la biomagnificación explican por qué los contaminantes son especialmente peligrosos en los seres vivos. La bioacumulación ocurre cuando un organismo absorbe un contaminante más rápido de lo que puede eliminarlo, concentrándolo en sus tejidos. La biomagnificación ocurre cuando ese organismo es comido por otro, que a su vez es comido por otro: cada nivel de la cadena alimenticia concentra más el contaminante. Los depredadores tope —orcas, atunes, águilas— son los más afectados.",
  "México genera aproximadamente 12.4 millones de toneladas de residuos sólidos urbanos al año, según datos de SEMARNAT 2022. Solo alrededor del 9.6% se recicla formalmente. La Ley General para la Prevención y Gestión Integral de los Residuos (LGPGIR) establece el marco jurídico, pero su aplicación es heterogénea entre estados.",
  "El PET (tereftalato de polietileno) tarda aproximadamente 450 años en degradarse. Alternativas en desarrollo incluyen los bioplásticos derivados de almidón de maíz o caña de azúcar, y los polímeros biodegradables como el PLA. La economía circular propone rediseñar los productos para que sus materiales puedan recuperarse y reutilizarse indefinidamente, evitando que se conviertan en residuos.",
];

/** Recuadro «importante» de la lectura A1 — verbatim. */
export const RECUADRO_A1 =
  "En 2023 se detectaron microplásticos en muestras de sangre humana por primera vez en estudios clínicos. Aunque todavía se investiga su impacto en la salud, el hallazgo muestra que la contaminación plástica ya no es solo un problema ambiental externo: es parte de nuestra biología.";

/** Precisiones (no verbatim) sobre cifras de la lectura. */
export const NOTA_RECUADRO =
  "Precisión: el primer estudio que midió partículas de plástico en sangre humana se publicó en 2022 (Leslie y colaboradores, Environment International). Además, el Diagnóstico Básico para la Gestión Integral de los Residuos 2020 de la SEMARNAT estima unas 120 mil toneladas diarias, es decir, cerca de 44 millones de toneladas al año.";

/** Preguntas de comprensión de la lectura A1 — verbatim. */
export const PREGUNTAS: string[] = [
  "¿Qué diferencia hay entre bioacumulación y biomagnificación? ¿Por qué los depredadores tope son los más vulnerables?",
  "¿Qué hace persistentes a los COPs y por qué eso es un problema aunque se hayan dejado de usar?",
  "¿Qué propone la economía circular como alternativa al modelo actual de residuos?",
];

/** Hechos: quiz A4 (verdadero/falso), cada enunciado con su retroalimentación. */
export const HECHOS: string[] = [
  "Verdadero: «Los microplásticos son fragmentos de plástico menores a 5 mm que pueden acumularse en organismos acuáticos y terrestres». Correcto: los microplásticos provienen de la fragmentación de plásticos mayores por acción de la luz UV, el calor y el oleaje; afectan la cadena trófica.",
  "Falso: «Los plásticos biodegradables se descomponen completamente en días en cualquier ambiente». Los plásticos biodegradables requieren condiciones específicas de temperatura y humedad (compostaje industrial) para degradarse. En el ambiente natural su descomposición puede llevar meses o años.",
  "Verdadero: «Los pesticidas organoclorados como el DDT pueden acumularse en los tejidos grasos de los organismos (bioacumulación)». Correcto: el DDT es lipofílico (se disuelve en grasas) y se bioacumula en la cadena trófica, alcanzando niveles tóxicos en depredadores apicales como águilas y ballenas.",
  "Falso: «Los metales pesados como el plomo y el mercurio son fácilmente eliminados por el organismo humano sin causar daño». Los metales pesados no son biodegradables en el organismo; se acumulan en órganos como el hígado, riñones y cerebro, causando daños neurológicos y sistémicos graves.",
  "Verdadero: «La economía circular propone reducir residuos manteniendo los materiales en uso el mayor tiempo posible mediante reutilización y reciclaje». Correcto: la economía circular se opone al modelo lineal (producir, usar, desechar) y busca cerrar ciclos de materiales para reducir la contaminación.",
];

/** Glosario A5 — verbatim. */
export const GLOSARIO: { termino: string; definicion: string; ejemplo: string }[] = [
  { termino: "Microplástico", definicion: "Fragmento de plástico con diámetro menor a 5 mm que persiste en el ambiente acuático y terrestre.", ejemplo: "Las microfibras que se liberan al lavar ropa sintética son microplásticos que llegan al océano y son ingeridos por peces." },
  { termino: "Contaminante orgánico persistente (COP)", definicion: "Compuesto orgánico sintético resistente a la degradación, altamente tóxico, que se bioacumula en la cadena trófica.", ejemplo: "El DDT, los PCB y las dioxinas son COPs regulados por el Convenio de Estocolmo." },
  { termino: "Bioacumulación", definicion: "Acumulación de un contaminante en los tejidos de un organismo a mayor concentración que en su entorno.", ejemplo: "El mercurio se bioacumula en los tejidos de los peces de aguas contaminadas." },
  { termino: "Metal pesado", definicion: "Elemento metálico de alta densidad (Pb, Hg, Cd, As) que es tóxico incluso en pequeñas concentraciones y no es biodegradable.", ejemplo: "El plomo de las pinturas antiguas y el mercurio de termómetros rotos son fuentes de intoxicación por metales pesados." },
  { termino: "Economía circular", definicion: "Modelo económico que busca eliminar residuos manteniendo materiales y productos en uso el mayor tiempo posible mediante reutilización, reparación y reciclaje.", ejemplo: "Fabricar nuevas botellas de PET a partir de botellas recicladas es un ejemplo de economía circular." },
  { termino: "Fotodegradación de plásticos", definicion: "Fragmentación de polímeros plásticos en partículas más pequeñas por la acción de la radiación ultravioleta del sol.", ejemplo: "Las botellas de plástico expuestas al sol durante años se vuelven frágiles y se fragmentan en microplásticos." },
];

export const ACTIVIDAD_A5 = "Realiza un análisis de los residuos plásticos de tu hogar en una semana: registra tipo de plástico, cantidad y propone una alternativa para reducir cada uno.";

export const FUENTE =
  "CEN Bachillerato — UAC Ciencias Naturales, Experimentales y Tecnología IV, progresión 10: lectura A1, quiz A2, quiz A4, glosario A5 y actividad A6 (CNEYT-IV-P07).";

export const PROBLEMA =
  "Un plástico no desaparece: flota o se hunde, se rompe en pedazos cada vez más pequeños y termina dentro de los seres vivos. Algunos contaminantes químicos, además, se concentran en cada eslabón de la cadena alimenticia hasta llegar a nuestro plato. En este laboratorio sigues el viaje de un plástico en el mar, ves cómo el DDT y el mercurio se multiplican de presa en depredador y decides a dónde mandar tus residuos.";

export const INSTRUCCIONES: string[] = [
  "En Plástico en el mar elige un plástico por su código de resina, tíralo en la playa o al mar y mueve el tiempo. Después pasa la red de superficie.",
  "En Biomagnificación elige DDT o metilmercurio y avanza eslabón por eslabón. Con el mercurio, cambia la edad del atún y calcula cuánto recibe una persona.",
  "En ¿A dónde va tu residuo? escoge un objeto y un destino, y mira qué le pasa. Prueba el vaso de PLA a distintas temperaturas de composta.",
  "Clasifica contaminantes para ganar estrellas y resuelve el quiz A2 y el texto A6.",
];

export const IDEAS: string[] = [
  "El plástico se fragmenta, pero no desaparece: los pedazos siguen siendo plástico.",
  "Flotar o hundirse depende de la densidad: PE y PP flotan; PET, PVC y nailon se hunden.",
  "Una red de superficie no alcanza lo que está en el fondo ni lo más pequeño que su malla.",
  "Bioacumulación: un organismo concentra el contaminante con los años. Biomagnificación: la concentración sube de presa a depredador.",
  "Los depredadores tope, incluidas las personas que comen mucho pez grande, reciben la dosis más alta.",
  "«Biodegradable» no significa que se degrade en cualquier lugar: el PLA necesita composta industrial.",
  "La economía circular mantiene los materiales en uso; el relleno y el río son el final del modelo lineal.",
];

/** Quiz A2 «¿Verdadero o falso? Plásticos y contaminantes en el ambiente» — verbatim, con opciones Verdadero/Falso. */
const VF = ["Verdadero", "Falso"];
export const QUIZ_A2: QuizEvaluable = {
  titulo: "¿Verdadero o falso? Plásticos y contaminantes en el ambiente",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "Los microplásticos son fragmentos de plástico menores a 5 mm y pueden provenir tanto de la fragmentación de plásticos grandes como de su fabricación directa (microperlas).",
      opciones: VF,
      respuestaCorrecta: 0,
      retroalimentacion: "Correcto. Los microplásticos de tipo secundario se generan por la degradación UV, mecánica y química de plásticos grandes (botellas, bolsas). Los primarios se fabrican directamente: microperlas en cosméticos exfoliantes y ropa sintética que libera microfibras al lavarse.",
    },
    {
      enunciado: "El plástico biodegradable se descompone completamente y sin residuos en cualquier ambiente natural en menos de un año.",
      opciones: VF,
      respuestaCorrecta: 1,
      retroalimentacion: "Falso. La mayoría de los plásticos etiquetados como 'biodegradables' requieren condiciones específicas (temperatura >58°C, humedad controlada, microorganismos adecuados) que solo se dan en plantas de compostaje industrial. En ríos, playas o tiraderos a cielo abierto, se degradan igual de lento o generan microplásticos.",
    },
    {
      enunciado: "El PET (polietileno tereftalato) puede reciclarse mecánicamente para fabricar nuevas botellas, fibras textiles o materiales de construcción.",
      opciones: VF,
      respuestaCorrecta: 0,
      retroalimentacion: "Correcto. El PET es uno de los plásticos más reciclables. El programa ECOCE en México recupera botellas PET para producir rPET (PET reciclado) que se usa en nuevas botellas, ropa polar (fleece), alfombras y tuberías. Sin embargo, Mexico recicla menos del 30% del PET que consume.",
    },
    {
      enunciado: "El DDT es un contaminante orgánico persistente (COP) que se acumula en los tejidos grasos de los organismos a medida que sube en la cadena alimentaria, en un proceso llamado biomagnificación.",
      opciones: VF,
      respuestaCorrecta: 0,
      retroalimentacion: "Correcto. El DDT (dicloro difenil tricloroetano) es lipofílico: se disuelve en grasas y se acumula en los tejidos grasos. En cada nivel trófico la concentración aumenta (biomagnificación): el DDT puede estar a 0.000003 ppm en el agua, 0.5 ppm en peces pequeños y 25 ppm en águilas pescadoras. México lo prohibió en 2000.",
    },
    {
      enunciado: "Todos los plásticos flotan en el océano, por eso es posible recolectarlos completamente con redes en la superficie del agua.",
      opciones: VF,
      respuestaCorrecta: 1,
      retroalimentacion: "Falso. Algunos plásticos son más densos que el agua de mar (PVC, PS expandido al absorber agua, PET con sedimento) y se hunden. Además, los microplásticos y nanoplásticos se distribuyen en toda la columna de agua, incluyendo los sedimentos del fondo marino, donde las redes superficiales no los capturan.",
    },
    {
      enunciado: "En México, el uso de bolsas de plástico de un solo uso ha sido completamente prohibido en todos los estados del país desde 2020.",
      opciones: VF,
      respuestaCorrecta: 1,
      retroalimentacion: "Falso. Aunque varios estados y municipios han aprobado restricciones (Ciudad de México, Oaxaca, Baja California, Quintana Roo, entre otros), no hay una ley federal única que prohíba las bolsas de plástico en todo el país. La regulación es fragmentada y la aplicación varía mucho por región.",
    },
  ],
};

/** Actividad A6 «Rellena los huecos — Contaminantes y plásticos» — verbatim. */
export const HUECOS_A6: TextoHuecosData = {
  ancla: "CNEYT-IV-P07-A6 · Rellena los huecos — Contaminantes y plásticos",
  instrucciones: "Completa los cuatro huecos con la palabra o expresión correcta.",
  partes: [
    "Los ",
    " son fragmentos de plástico menores a 5 mm que se acumulan en los organismos acuáticos y pueden llegar al ser humano a través de la cadena alimentaria. El DDT es un ejemplo de ",
    " orgánico persistente porque resiste la degradación y se bioacumula en las grasas de los organismos. Los metales pesados como el plomo y el mercurio no son ",
    " en el cuerpo humano y se acumulan causando daños graves. La ",
    " circular propone reutilizar y reciclar materiales para reducir los residuos y la contaminación.",
  ],
  huecos: [
    { respuesta: "microplásticos", alternativas: ["microplasticos"], pista: "Fragmentos de plástico menores a 5 mm presentes en océanos y suelos." },
    { respuesta: "contaminante", alternativas: ["contaminantes", "compuesto"], pista: "Tipo de sustancia química que persiste en el ambiente sin degradarse y se bioacumula." },
    { respuesta: "biodegradables", alternativas: ["degradables"], pista: "Característica de ser descompuestos por microorganismos; los metales pesados NO la tienen." },
    { respuesta: "economía", alternativas: ["modelo"], pista: "Término que completa 'economía circular': modelo que elimina residuos manteniendo materiales en uso." },
  ],
};
