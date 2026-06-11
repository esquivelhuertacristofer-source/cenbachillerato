/**
 * Datos para el laboratorio "Metabolismo celular en 3D: respiración y fotosíntesis"
 * (CNEYT-VI-P03-A2, ejercicio matemático "ATP total en respiración aerobia";
 * UAC CNEYT-VI; progresión 3 "Explica los procesos de metabolismo celular:
 * respiración celular y fotosíntesis a nivel molecular").
 *
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabMetabolismo.tsx) y la escena 3D (MetabolismoScene.tsx).
 *
 * Tres procesos:
 *  (a) "respiracion"  — respiración aerobia en la mitocondria: glucólisis (citosol),
 *      ciclo de Krebs (matriz) y cadena de electrones (membrana interna). 36 ATP.
 *  (b) "fotosintesis" — en el cloroplasto: fase lumínica (tilacoides) y ciclo de
 *      Calvin (estroma). 6CO₂ + 6H₂O + luz → C₆H₁₂O₆ + 6O₂.
 *  (c) "fermentacion" — anaerobia en el citosol: glucólisis + fermentación
 *      (láctica/alcohólica). Solo 2 ATP.
 *
 * El problema, los pasos guía y la respuesta (36 ATP) son VERBATIM del ejercicio
 * A2. Las definiciones y ejemplos de las etapas provienen VERBATIM del glosario
 * A5; las ideas clave y el contexto del SINAP son de la lectura A1.
 */

export type Proceso = "respiracion" | "fotosintesis" | "fermentacion";

export interface EtapaDef {
  id: string;
  nombre: string;
  proceso: Proceso;
  lugar: string;             // compartimento donde ocurre
  color: string;
  icono: string;             // FontAwesome
  reactivos: string;         // materias primas que entran
  productos: string;         // productos que salen
  atp: number;               // ATP NETO producido en la etapa
  descripcion: string;       // verbatim (A2 paso / A5 definición)
  detalle?: string;          // dato extra (NADH/FADH₂, etc.)
  /** "A2" = paso del ejercicio; "A5" = glosario; "A1" = lectura */
  fuente: "A2" | "A5" | "A1";
}

/* ── Etapas de cada proceso ───────────────────────────────────────────────── */
export const ETAPAS: EtapaDef[] = [
  /* Respiración aerobia (verbatim de los pasos guía A2 + glosario A5) */
  {
    id: "glucolisis",
    nombre: "Glucólisis",
    proceso: "respiracion",
    lugar: "Citosol (citoplasma)",
    color: "#38bdf8",
    icono: "fa-arrows-split-up-and-left",
    reactivos: "1 glucosa (6C)",
    productos: "2 piruvato + 2 NADH",
    atp: 2,
    descripcion:
      "Paso 1 — Glucólisis (citoplasma): 1 glucosa -> 2 piruvatos + 2 ATP netos + 2 NADH.",
    detalle:
      "Primera etapa de la respiración celular. Ocurre en el citosol. Convierte 1 glucosa (6C) en 2 piruvatos (3C) con ganancia neta de 2 ATP y 2 NADH. No requiere oxígeno; es la única vía energética en anaerobios estrictos.",
    fuente: "A2",
  },
  {
    id: "krebs",
    nombre: "Ciclo de Krebs",
    proceso: "respiracion",
    lugar: "Matriz mitocondrial",
    color: "#f97316",
    icono: "fa-rotate",
    reactivos: "2 piruvato",
    productos: "6 CO₂ + 8 NADH + 2 FADH₂",
    atp: 2,
    descripcion:
      "Paso 2 — Ciclo de Krebs (mitocondria, matriz): 2 piruvatos -> CO2 + 2 ATP + 8 NADH + 2 FADH2.",
    detalle:
      "Segunda etapa de la respiración aerobia. Ocurre en la matriz mitocondrial. El piruvato se convierte en acetil-CoA (2C) que ingresa al ciclo. Por glucosa: 2 vueltas = 6 NADH, 2 FADH₂, 2 ATP y 4 CO₂.",
    fuente: "A2",
  },
  {
    id: "cadena",
    nombre: "Cadena de electrones",
    proceso: "respiracion",
    lugar: "Membrana interna mitocondrial",
    color: "#fbbf24",
    icono: "fa-bolt",
    reactivos: "10 NADH + 2 FADH₂ + 6 O₂",
    productos: "6 H₂O + 32 ATP",
    atp: 32,
    descripcion:
      "Paso 3 — Cadena transportadora de electrones (membrana interna mitocondrial): NADH y FADH2 ceden electrones; el gradiente de H+ impulsa la ATP sintasa produciendo 32 ATP.",
    detalle:
      "Tercera etapa. Los electrones de NADH y FADH₂ pasan por proteínas (complejos I-IV) que bombean H⁺ al espacio intermembranoso; su flujo de regreso por la ATP sintasa genera ~32-34 ATP. El O₂ es el aceptor final de electrones, formando H₂O. Cada NADH produce ~2.5 ATP y cada FADH₂ ~1.5 ATP.",
    fuente: "A2",
  },

  /* Fotosíntesis (verbatim del glosario A5) */
  {
    id: "luminica",
    nombre: "Fase lumínica",
    proceso: "fotosintesis",
    lugar: "Tilacoides del cloroplasto",
    color: "#fde047",
    icono: "fa-sun",
    reactivos: "Luz + H₂O",
    productos: "O₂ + ATP + NADPH",
    atp: 0,
    descripcion:
      "Ocurre en las membranas de los tilacoides del cloroplasto. La luz solar excita la clorofila; los fotosistemas II y I captan fotones. El agua se fotoliza (H₂O → O₂ + H⁺ + e⁻) y los electrones energizados generan ATP (fotofosforilación) y NADPH. El O₂ se libera.",
    detalle:
      "El oxígeno que respiramos es subproducto de la fotólisis del agua durante la fase lumínica de la fotosíntesis en plantas y algas.",
    fuente: "A5",
  },
  {
    id: "calvin",
    nombre: "Ciclo de Calvin",
    proceso: "fotosintesis",
    lugar: "Estroma del cloroplasto",
    color: "#22c55e",
    icono: "fa-recycle",
    reactivos: "6 CO₂ + ATP + NADPH",
    productos: "1 glucosa (C₆H₁₂O₆)",
    atp: 0,
    descripcion:
      "Ocurre en el estroma del cloroplasto. Usa el ATP y NADPH de la fase lumínica. La enzima RuBisCO fija CO₂ en la ribulosa 1,5-bisfosfato (RuBP) (5C). Por cada 3 CO₂ fijados se produce 1 gliceraldehído-3-fosfato (G3P), precursor de glucosa y otros azúcares.",
    detalle:
      "Para sintetizar 1 molécula de glucosa se necesitan 6 vueltas del ciclo de Calvin, consumiendo 18 ATP y 12 NADPH.",
    fuente: "A5",
  },

  /* Fermentación (verbatim del glosario A5) */
  {
    id: "glucolisis-ferm",
    nombre: "Glucólisis",
    proceso: "fermentacion",
    lugar: "Citosol (citoplasma)",
    color: "#38bdf8",
    icono: "fa-arrows-split-up-and-left",
    reactivos: "1 glucosa (6C)",
    productos: "2 piruvato + 2 NADH",
    atp: 2,
    descripcion:
      "Primera etapa de la respiración celular. Ocurre en el citosol. Convierte 1 glucosa (6C) en 2 piruvatos (3C) con ganancia neta de 2 ATP y 2 NADH. No requiere oxígeno; es la única vía energética en anaerobios estrictos.",
    detalle:
      "Los eritrocitos (glóbulos rojos) carecen de mitocondrias y obtienen toda su energía solo de la glucólisis.",
    fuente: "A5",
  },
  {
    id: "fermentacion",
    nombre: "Fermentación",
    proceso: "fermentacion",
    lugar: "Citosol (sin oxígeno)",
    color: "#a855f7",
    icono: "fa-wine-bottle",
    reactivos: "2 piruvato + 2 NADH",
    productos: "2 lactato (o 2 etanol + 2 CO₂) + 2 NAD⁺",
    atp: 0,
    descripcion:
      "Proceso anaeróbico que regenera el NAD⁺ a partir del NADH para que la glucólisis continúe. Fermentación láctica: piruvato → lactato (músculo, bacterias lácticas). Fermentación alcohólica: piruvato → etanol + CO₂ (levaduras). Solo produce 2 ATP por glucosa.",
    detalle:
      "El pan y la cerveza utilizan la fermentación alcohólica de levaduras (Saccharomyces cerevisiae); el yogur aprovecha la fermentación láctica de bacterias.",
    fuente: "A5",
  },
];

/** Etapas de un proceso, en orden. */
export function etapasDe(proceso: Proceso): EtapaDef[] {
  return ETAPAS.filter((e) => e.proceso === proceso);
}

export function etapaPorId(id: string): EtapaDef | undefined {
  return ETAPAS.find((e) => e.id === id);
}

/* ── Definición de cada proceso ───────────────────────────────────────────── */
export interface ProcesoDef {
  id: Proceso;
  etq: string;
  subtitulo: string;
  organelo: string;
  icono: string;
  color: string;
  ecuacion: string;
  aerobio: boolean;
  /** ATP neto por glucosa (n/a en fotosíntesis → -1) */
  atpTotal: number;
  resumen: string;
}

export const PROCESOS_DEF: Record<Proceso, ProcesoDef> = {
  respiracion: {
    id: "respiracion",
    etq: "Respiración aerobia",
    subtitulo: "En la mitocondria · con O₂",
    organelo: "Mitocondria",
    icono: "fa-bolt",
    color: "#f97316",
    ecuacion: "C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ~36 ATP",
    aerobio: true,
    atpTotal: 36,
    resumen:
      "Oxida por completo la glucosa usando oxígeno. Tres etapas: glucólisis (citosol), ciclo de Krebs (matriz) y cadena de electrones (membrana interna). Rinde ~36 ATP por glucosa.",
  },
  fotosintesis: {
    id: "fotosintesis",
    etq: "Fotosíntesis",
    subtitulo: "En el cloroplasto · con luz",
    organelo: "Cloroplasto",
    icono: "fa-leaf",
    color: "#22c55e",
    ecuacion: "6CO₂ + 6H₂O + luz → C₆H₁₂O₆ + 6O₂",
    aerobio: false,
    atpTotal: -1,
    resumen:
      "Convierte luz solar, agua y CO₂ en glucosa y O₂. Dos fases: la lumínica (tilacoides) produce ATP, NADPH y O₂; el ciclo de Calvin (estroma) fija el CO₂ para hacer glucosa.",
  },
  fermentacion: {
    id: "fermentacion",
    etq: "Fermentación",
    subtitulo: "En el citosol · sin O₂",
    organelo: "Citosol (sin mitocondria)",
    icono: "fa-wine-bottle",
    color: "#a855f7",
    ecuacion: "C₆H₁₂O₆ → 2 lactato (o 2 etanol + 2 CO₂) + 2 ATP",
    aerobio: false,
    atpTotal: 2,
    resumen:
      "Vía anaerobia (sin oxígeno). Solo glucólisis seguida de fermentación láctica o alcohólica para regenerar NAD⁺. Mucho menos eficiente: solo 2 ATP por glucosa.",
  },
};

export const PROCESOS: Proceso[] = ["respiracion", "fotosintesis", "fermentacion"];

/* ── Reto A2: ATP total en respiración aerobia (VERBATIM) ──────────────────── */
export const PROBLEMA_ATP =
  "Una célula lleva a cabo la respiración aerobia completa de 1 molécula de glucosa. La glucólisis produce 2 ATP netos. El ciclo de Krebs produce 2 ATP. La cadena transportadora de electrones produce 32 ATP. ¿Cuántos ATP se producen en total?";

export const PASOS_ATP: string[] = [
  "Paso 1 — Glucólisis (citoplasma): 1 glucosa -> 2 piruvatos + 2 ATP netos + 2 NADH.",
  "Paso 2 — Ciclo de Krebs (mitocondria, matriz): 2 piruvatos -> CO2 + 2 ATP + 8 NADH + 2 FADH2.",
  "Paso 3 — Cadena transportadora de electrones (membrana interna mitocondrial): NADH y FADH2 ceden electrones; el gradiente de H+ impulsa la ATP sintasa produciendo 32 ATP.",
  "Paso 4 — Total: 2 + 2 + 32 = 36 ATP por molécula de glucosa.",
];

export const RESPUESTA_ATP = "36";

/** Desglose del ATP de la respiración aerobia (verbatim del ejercicio A2). */
export interface DesgloseATP { etapa: string; atp: number; lugar: string }
export const DESGLOSE_ATP: DesgloseATP[] = [
  { etapa: "Glucólisis", atp: 2, lugar: "Citosol" },
  { etapa: "Ciclo de Krebs", atp: 2, lugar: "Matriz mitocondrial" },
  { etapa: "Cadena de electrones", atp: 32, lugar: "Membrana interna" },
];

/* ── Texto: descripción del laboratorio ───────────────────────────────────── */
export const PROBLEMA =
  "Recorre paso a paso cómo la célula obtiene y usa energía. En la respiración aerobia, sigue 1 molécula de glucosa desde la glucólisis (citosol) hasta el ciclo de Krebs (matriz mitocondrial) y la cadena de electrones (membrana interna), y observa cómo el ATP se acumula hasta llegar a 36. Cambia a la fotosíntesis para ver cómo el cloroplasto convierte luz, CO₂ y agua en glucosa y O₂, y a la fermentación para comprobar por qué sin oxígeno solo se obtienen 2 ATP. Es el ejercicio A2 (¿cuántos ATP en total?) hecho visible en 3D.";

export const INSTRUCCIONES: string[] = [
  "Elige un proceso arriba: respiración aerobia, fotosíntesis o fermentación.",
  "Usa los botones ‹ y › (o haz clic en cada etapa de la ruta) para avanzar paso a paso por el proceso.",
  "En la respiración y la fermentación, observa el contador de ATP acumulado: verás cómo 2 + 2 + 32 suman 36 ATP.",
  "Gira la escena con el ratón: la mitocondria (respiración) y el cloroplasto (fotosíntesis) se muestran con sus compartimentos internos.",
  "Compara los rendimientos: la respiración aerobia produce 36 ATP; la fermentación solo 2 ATP por glucosa.",
  "Relaciona fotosíntesis y respiración: el O₂ y la glucosa de una son las materias primas de la otra.",
];

/* ── Preguntas (verbatim de A1 + actividad final A5) ──────────────────────── */
export const PREGUNTAS: string[] = [
  "¿Cuáles son las dos etapas de la fotosíntesis y dónde ocurre cada una?",
  "¿Por qué la respiración aerobia produce mucho más ATP que la fermentación?",
  "Compara la respiración celular aerobia y la fotosíntesis: indica en qué organelo ocurre cada proceso, qué materias primas consume, qué productos genera y en qué sentido se relacionan ambos ciclos en un ecosistema.",
];

/* ── Ideas clave (de la lectura A1) ───────────────────────────────────────── */
export const IDEAS: string[] = [
  "El metabolismo celular comprende todas las reacciones químicas que ocurren en la célula para obtener y usar energía.",
  "La fotosíntesis ocurre en los cloroplastos y tiene dos etapas: las reacciones luminosas (tilacoides) capturan luz y producen ATP y NADPH liberando O₂ del agua; las reacciones oscuras o ciclo de Calvin (estroma) usan ese ATP y NADPH para fijar CO₂ y sintetizar glucosa.",
  "Ecuación general de la fotosíntesis: 6CO₂ + 6H₂O + luz → C₆H₁₂O₆ + 6O₂.",
  "La respiración celular aerobia ocurre en tres etapas: glucólisis (citoplasma), ciclo de Krebs (matriz mitocondrial) y cadena transportadora de electrones (membrana interna mitocondrial).",
  "La glucólisis divide 1 glucosa en 2 piruvatos (2 ATP netos y 2 NADH); el ciclo de Krebs produce 2 ATP, 8 NADH y 2 FADH₂; la cadena de electrones produce ~32 ATP. Total: ~36 ATP por glucosa.",
  "En la cadena transportadora de electrones el O₂ es el aceptor final de electrones y forma H₂O; el gradiente de protones (H⁺) impulsa la ATP sintasa.",
  "La fermentación es anaerobia (sin oxígeno): la láctica convierte piruvato en lactato (músculos en ejercicio intenso) y la alcohólica en etanol y CO₂ (levaduras); ambas regeneran NAD⁺ para que la glucólisis continúe, pero solo producen 2 ATP.",
  "La respiración aerobia es mucho más eficiente que la fermentación: 36 ATP frente a 2 ATP por glucosa (18 veces más energía).",
];

/* ── Glosario (verbatim del glosario A5) ──────────────────────────────────── */
export const GLOSARIO: { termino: string; definicion: string }[] = [
  { termino: "Glucólisis", definicion: "Primera etapa de la respiración celular. Ocurre en el citosol. Convierte 1 glucosa (6C) en 2 piruvatos (3C) con ganancia neta de 2 ATP y 2 NADH. No requiere oxígeno; es la única vía energética en anaerobios estrictos." },
  { termino: "Ciclo de Krebs (ciclo del ácido cítrico)", definicion: "Segunda etapa de la respiración aerobia. Ocurre en la matriz mitocondrial. El piruvato se convierte en acetil-CoA (2C) que ingresa al ciclo, produciendo por cada vuelta: 3 NADH, 1 FADH₂, 1 GTP (≈1 ATP) y 2 CO₂. Por glucosa: 2 vueltas = 6 NADH, 2 FADH₂, 2 ATP y 4 CO₂." },
  { termino: "Cadena de transporte de electrones y fosforilación oxidativa", definicion: "Tercera etapa. Ocurre en la membrana interna mitocondrial. Los electrones de NADH y FADH₂ pasan por proteínas (complejos I-IV) que bombean H⁺ al espacio intermembranoso. El flujo de H⁺ de regreso a través de la ATP sintasa genera ~32-34 ATP. El O₂ es el aceptor final de electrones, formando H₂O." },
  { termino: "Fase lumínica de la fotosíntesis", definicion: "Ocurre en las membranas de los tilacoides del cloroplasto. La luz solar excita la clorofila; los fotosistemas II y I captan fotones. El agua se fotoliza (H₂O → O₂ + H⁺ + e⁻) y los electrones energizados generan ATP (fotofosforilación) y NADPH. El O₂ se libera." },
  { termino: "Ciclo de Calvin (fase oscura / fase de fijación de CO₂)", definicion: "Ocurre en el estroma del cloroplasto. Usa el ATP y NADPH de la fase lumínica. La enzima RuBisCO fija CO₂ en la ribulosa 1,5-bisfosfato (RuBP) (5C). Por cada 3 CO₂ fijados se produce 1 gliceraldehído-3-fosfato (G3P), precursor de glucosa y otros azúcares." },
  { termino: "Fermentación", definicion: "Proceso anaeróbico que regenera el NAD⁺ a partir del NADH para que la glucólisis continúe. Fermentación láctica: piruvato → lactato (músculo, bacterias lácticas). Fermentación alcohólica: piruvato → etanol + CO₂ (levaduras). Solo produce 2 ATP por glucosa." },
];

/* ── Contexto mexicano y fuente (verbatim de A1) ──────────────────────────── */
export const CONTEXTO =
  "El Sistema Nacional de Áreas Naturales Protegidas (SINAP) de México protege más de 90 millones de hectáreas terrestres y marinas — el 19% del territorio nacional. Incluye 182 áreas naturales protegidas, entre ellas la Reserva de la Biosfera Monarca y la Isla Guadalupe. Estos ecosistemas dependen del equilibrio entre la fotosíntesis (que fija CO₂ y libera O₂) y la respiración de todos sus seres vivos.";

export const FUENTE =
  "Material elaborado para CEN Bachillerato — CNEYT-VI. Ref: Campbell, Biología (12a ed.); Lehninger, Bioquímica.";

/* ── Datos rápidos (tarjetas) ─────────────────────────────────────────────── */
export const DATOS: { valor: string; texto: string; icono: string }[] = [
  { valor: "36 ATP", texto: "rendimiento de la respiración aerobia por glucosa (2 + 2 + 32)", icono: "fa-bolt" },
  { valor: "2 ATP", texto: "rendimiento de la fermentación: 18 veces menos energía", icono: "fa-wine-bottle" },
  { valor: "6CO₂ + 6H₂O", texto: "reactivos de la fotosíntesis → C₆H₁₂O₆ + 6O₂", icono: "fa-leaf" },
  { valor: "~2.5 / ~1.5", texto: "ATP por cada NADH / FADH₂ en la cadena de electrones", icono: "fa-battery-full" },
];
