/**
 * Datos para el laboratorio del Ciclo del carbono (CNEYT-III-P04-A1,
 * "Ciclos biogeoquímicos: agua, carbono, nitrógeno y fósforo"; progresión 4).
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabCicloCarbono.tsx) y la escena 3D (CicloCarbonoScene.tsx).
 *
 * Idea pedagógica (MCCEMS 2025 — CNEYT-III P4: "Examina los ciclos
 * biogeoquímicos del agua, carbono, nitrógeno y fósforo"):
 * el carbono no se crea ni se destruye, circula entre cuatro reservorios
 * —atmósfera, biosfera, suelo/litosfera y océano— impulsado por procesos:
 * la fotosíntesis lo saca del aire, la respiración y la descomposición lo
 * devuelven, el océano lo disuelve (sumidero) y, muy lentamente, queda
 * atrapado como combustibles fósiles. En equilibrio, lo que entra a la
 * atmósfera iguala a lo que sale. La COMBUSTIÓN humana de fósiles añade
 * carbono que estuvo guardado millones de años a un ritmo que los sumideros
 * no alcanzan a reabsorber: ~45 % se queda en el aire y el CO₂ sube.
 *
 * Datos verbatim de la actividad (INECC 2022 / SEMARNAT / CONAFOR):
 * la actividad humana añade ~37 Gt de CO₂ al año; México emite ~750 millones
 * de toneladas de CO₂ equivalente (1.4 % global), 25 % por deforestación; los
 * humedales almacenan 3–5× más carbono por hectárea que la selva tropical.
 */

/* ── Control: emisiones humanas ───────────────────────────────────────── */
// Emisiones globales de CO₂ por quema de fósiles y cambio de uso de suelo
// (Gt de CO₂ por año). El valor actual ronda las 37 Gt (verbatim, INECC 2022).
export const EMIS_MIN = 0;
export const EMIS_MAX = 60;
export const EMIS_STEP = 1;
export const EMIS_DEFAULT = 37;

/** Fracción de las emisiones que NO alcanzan a absorber océano y bosques y
 *  queda acumulada en la atmósfera (fracción aérea, ~0.45; aproximado, IPCC). */
export const FRAC_AEREA = 0.45;

/** Gt de CO₂ que equivalen a 1 ppm de CO₂ atmosférico (aproximado). */
export const GT_CO2_POR_PPM = 7.8;

/** CO₂ que se acumula en la atmósfera cada año (Gt CO₂/año). */
export const acumAtm = (emis: number): number => emis * FRAC_AEREA;

/** CO₂ que reabsorben océano y bosques cada año (Gt CO₂/año). */
export const absorbido = (emis: number): number => emis * (1 - FRAC_AEREA);

/** Cuánto sube la concentración de CO₂ por año (ppm/año). */
export const ppmAnual = (emis: number): number => acumAtm(emis) / GT_CO2_POR_PPM;

/* ── Reservorios de carbono (tamaños globales aproximados, en Gt de C) ─── */
export interface Reservorio {
  key: string;
  nombre: string;
  /** Carbono almacenado, en gigatoneladas de carbono (aproximado). */
  gtC: number;
  color: string;
  icono: string; // Font Awesome 6 Free solid
  resumen: string;
}

export const RESERVORIOS: Reservorio[] = [
  { key: "oceano", nombre: "Océano", gtC: 38000, color: "#38bdf8", icono: "fa-water",
    resumen: "el mayor reservorio activo; disuelve CO₂ pero al hacerlo se acidifica" },
  { key: "fosiles", nombre: "Combustibles fósiles", gtC: 6000, color: "#9ca3af", icono: "fa-oil-well",
    resumen: "carbón, petróleo y gas: carbono que tardó millones de años en formarse" },
  { key: "suelo", nombre: "Suelo y litosfera", gtC: 1600, color: "#a16207", icono: "fa-mountain",
    resumen: "humus, raíces y descomponedores; los humedales guardan muchísimo más por hectárea" },
  { key: "atmosfera", nombre: "Atmósfera", gtC: 875, color: "#f59e0b", icono: "fa-cloud",
    resumen: "el reservorio que crece: como CO₂, atrapa calor y calienta el planeta" },
  { key: "vegetacion", nombre: "Vegetación", gtC: 550, color: "#34D399", icono: "fa-tree",
    resumen: "bosques y selvas: sumideros vivos que fijan carbono por fotosíntesis" },
  { key: "animales", nombre: "Animales", gtC: 2, color: "#fb7185", icono: "fa-paw",
    resumen: "comen carbono de las plantas y lo liberan al respirar" },
];

/* ── Flujos del ciclo (de un reservorio a otro vía un proceso) ────────── */
export type TipoFlujo = "natural" | "humano" | "lento";

export interface Flujo {
  id: string;
  de: string;
  a: string;
  proceso: string;
  color: string;
  tipo: TipoFlujo;
  /** Rapidez relativa del flujo (0–1), para la animación de partículas. */
  rapidez: number;
  desc: string;
}

export const FLUJOS: Flujo[] = [
  { id: "fotosintesis", de: "atmosfera", a: "vegetacion", proceso: "Fotosíntesis", color: "#34D399", tipo: "natural", rapidez: 0.9,
    desc: "las plantas fijan CO₂ del aire y lo convierten en glucosa (entrada de carbono a la biosfera)" },
  { id: "respiracion_veg", de: "vegetacion", a: "atmosfera", proceso: "Respiración vegetal", color: "#facc15", tipo: "natural", rapidez: 0.55,
    desc: "las plantas también respiran y devuelven parte del CO₂ al aire" },
  { id: "alimentacion", de: "vegetacion", a: "animales", proceso: "Alimentación", color: "#fb7185", tipo: "natural", rapidez: 0.5,
    desc: "los animales obtienen carbono al comer plantas (u otros animales)" },
  { id: "respiracion_ani", de: "animales", a: "atmosfera", proceso: "Respiración animal", color: "#facc15", tipo: "natural", rapidez: 0.5,
    desc: "al respirar, los animales liberan CO₂ a la atmósfera" },
  { id: "descomposicion", de: "animales", a: "suelo", proceso: "Descomposición", color: "#a16207", tipo: "natural", rapidez: 0.45,
    desc: "hongos y bacterias degradan la materia muerta y devuelven el carbono al suelo" },
  { id: "suelo_atm", de: "suelo", a: "atmosfera", proceso: "Respiración del suelo", color: "#facc15", tipo: "natural", rapidez: 0.5,
    desc: "los descomponedores del suelo liberan CO₂ de vuelta al aire" },
  { id: "oceano_sumidero", de: "atmosfera", a: "oceano", proceso: "Disolución oceánica", color: "#38bdf8", tipo: "natural", rapidez: 0.6,
    desc: "el océano disuelve CO₂ y actúa como sumidero, aunque se va acidificando" },
  { id: "sedimentacion", de: "oceano", a: "fosiles", proceso: "Sedimentación y fosilización", color: "#9ca3af", tipo: "lento", rapidez: 0.12,
    desc: "muy lentamente (300–1 000 años o más) el carbono queda atrapado como roca y fósiles" },
  { id: "combustion", de: "fosiles", a: "atmosfera", proceso: "Combustión de fósiles", color: "#ef4444", tipo: "humano", rapidez: 0.0,
    desc: "quemar carbón, petróleo y gas libera de golpe el carbono guardado durante millones de años (controlado por las emisiones)" },
];

/* ── Datos de México (verbatim, para el panel) ────────────────────────── */
export interface DatoMX {
  icono: string;
  titulo: string;
  texto: string;
}

export const DATOS_MX: DatoMX[] = [
  { icono: "fa-industry", titulo: "~750 Mt CO₂eq/año",
    texto: "México emite cerca de 750 millones de toneladas de CO₂ equivalente al año (1.4 % global, INECC 2022)." },
  { icono: "fa-tree", titulo: "25 % por deforestación",
    texto: "Una cuarta parte de las emisiones de México viene de la deforestación y el cambio de uso de suelo: de las proporciones más altas entre economías emergentes." },
  { icono: "fa-water", titulo: "Humedales: 3–5×",
    texto: "Manglares, petenes y lagunas costeras almacenan de 3 a 5 veces más carbono por hectárea que la selva tropical; destruirlos libera siglos de carbono en décadas." },
  { icono: "fa-handshake", titulo: "Acuerdo de París · REDD+",
    texto: "México se comprometió a reducir 35 % sus emisiones al 2030; la Estrategia REDD+ (CONAFOR) financia conservar bosques, es decir, conservar el ciclo del carbono." },
];

/* ── Tiempos de cada ciclo (franja inferior de la infografía, verbatim) ── */
export const TIEMPOS: { ciclo: string; tiempo: string; color: string }[] = [
  { ciclo: "Carbono", tiempo: "300–1 000 años en depósitos fósiles", color: "#9ca3af" },
  { ciclo: "Agua", tiempo: "9 días en la atmósfera · 3 000 años en glaciares", color: "#38bdf8" },
  { ciclo: "Nitrógeno", tiempo: "de días a años", color: "#facc15" },
  { ciclo: "Fósforo", tiempo: "de siglos a milenios (el más lento)", color: "#fb923c" },
];

/* ── Formato ──────────────────────────────────────────────────────────── */
export const fmtGt = (n: number, dec = 1): string =>
  n.toLocaleString("es-MX", { maximumFractionDigits: dec, minimumFractionDigits: 0 }).replace("-", "−");

export const fmtPpm = (n: number): string =>
  n.toLocaleString("es-MX", { maximumFractionDigits: 2, minimumFractionDigits: 0 }).replace("-", "−");
