/**
 * Datos puros y modelo físico del laboratorio 3D de Destilación (CNEYT-I-P04).
 *
 * SIN three ni @react-three: seguro de importar desde el shell sin arrastrar
 * three.js a su bundle. El render 3D vive en DestilacionScene.tsx; la lógica de
 * operación (bucle de calentamiento/ebullición/accidentes) vive en el shell
 * LabSeparacionMezclas.tsx. Aquí solo viven las constantes y el contenido.
 *
 * El contenido (puntos de ebullición, residuos, explicaciones) es verbatim de la
 * lectura ancla A1 — ver separacion-ficha.ts.
 */

/* ── Piezas del equipo ────────────────────────────────────────────────── */
export type PiezaKey = "soporte" | "matraz" | "mechero" | "termometro" | "refrigerante" | "colector";

export interface PiezaDef {
  key: PiezaKey;
  nombre: string;
  icono: string;
  ayuda: string;
}

export const PIEZAS: PiezaDef[] = [
  { key: "soporte", nombre: "Soporte universal", icono: "fa-grip-lines-vertical", ayuda: "Sostiene todo el equipo. Colócalo primero." },
  { key: "matraz", nombre: "Matraz de destilación", icono: "fa-flask", ayuda: "Aquí va la mezcla. Tiene una salida lateral para el vapor." },
  { key: "mechero", nombre: "Mechero Bunsen", icono: "fa-fire", ayuda: "Fuente de calor, debajo del matraz." },
  { key: "termometro", nombre: "Termómetro", icono: "fa-temperature-half", ayuda: "Mide la temperatura del vapor en el cuello." },
  { key: "refrigerante", nombre: "Refrigerante", icono: "fa-wind", ayuda: "Enfría el vapor y lo condensa de nuevo a líquido." },
  { key: "colector", nombre: "Matraz colector", icono: "fa-flask-vial", ayuda: "Recoge el destilado que sale del refrigerante." },
];

export const ORDEN: PiezaKey[] = ["soporte", "matraz", "mechero", "termometro", "refrigerante", "colector"];

/* ── Mezclas ──────────────────────────────────────────────────────────── */
export type MezKey = "agua-sal" | "agua-alcohol" | "agua-mar" | "agua-tinta" | "acetona-agua";

export interface MezDef {
  nombre: string;
  tipo: string;
  volatil: string;
  volatilPE: number; // °C
  residuo: string;
  residuoSolido: boolean;
  colorLiq: string;
  colorDest: string;
  explica: string;
  /** Si se define, por encima de esta T el destilado arrastra el otro componente y se contamina (solo destilación fraccionada). */
  contaminaTemp?: number;
}

export const MEZCLAS: Record<MezKey, MezDef> = {
  "agua-sal": {
    nombre: "Agua con sal",
    tipo: "Mezcla homogénea (solución)",
    volatil: "Agua",
    volatilPE: 100,
    residuo: "Sal",
    residuoSolido: true,
    colorLiq: "#6FBED6",
    colorDest: "#C6ECFB",
    explica:
      "El agua hierve a 100 °C y se evapora; su vapor se condensa en el refrigerante y cae como agua pura. La sal no se evapora: queda en el matraz como residuo sólido.",
  },
  "agua-alcohol": {
    nombre: "Agua y alcohol (etanol)",
    tipo: "Mezcla homogénea (solución)",
    volatil: "Etanol",
    volatilPE: 78,
    residuo: "Agua",
    residuoSolido: false,
    colorLiq: "#B69BE6",
    colorDest: "#E6D8FF",
    contaminaTemp: 95,
    explica:
      "El etanol hierve a 78 °C, antes que el agua (100 °C). Si mantienes la temperatura cerca de 78 °C destilas etanol casi puro; si subes por encima de 95 °C también arrastras agua y el destilado se contamina.",
  },
  "agua-mar": {
    nombre: "Agua de mar",
    tipo: "Mezcla homogénea (solución salina)",
    volatil: "Agua",
    volatilPE: 100,
    residuo: "Sales minerales",
    residuoSolido: true,
    colorLiq: "#2E8C9E",
    colorDest: "#CFEFFB",
    explica:
      "El agua de mar es agua con sales minerales disueltas. Al destilarla, el agua hierve a 100 °C, su vapor se condensa y cae como agua dulce; las sales no se evaporan y quedan en el matraz. Es el principio de las plantas desalinizadoras que producen agua potable.",
  },
  "agua-tinta": {
    nombre: "Agua con tinta",
    tipo: "Mezcla homogénea (solución)",
    volatil: "Agua",
    volatilPE: 100,
    residuo: "Colorante",
    residuoSolido: false,
    colorLiq: "#D64545",
    colorDest: "#EAF6FB",
    explica:
      "La tinta es un colorante disuelto en agua. Al destilar, solo el agua se evapora y se condensa incolora; el colorante no es volátil y queda concentrado en el matraz. Así se comprueba que el agua era el disolvente.",
  },
  "acetona-agua": {
    nombre: "Acetona y agua",
    tipo: "Mezcla homogénea (solución)",
    volatil: "Acetona",
    volatilPE: 56,
    residuo: "Agua",
    residuoSolido: false,
    colorLiq: "#CFE6DD",
    colorDest: "#EAFBF4",
    contaminaTemp: 75,
    explica:
      "La acetona (presente en el quitaesmalte) hierve a 56 °C, mucho antes que el agua (100 °C). Manteniendo la temperatura cerca de 56 °C destilas acetona casi pura; si subes por encima de ~75 °C también arrastras agua y el destilado se contamina.",
  },
};

/* ── Parámetros físicos del modelo ────────────────────────────────────── */
export const CAP = 250; // capacidad del matraz (mL)
export const SEGURO = 150; // llenado recomendado (≤ 2/3)
export const PELIGRO = 200; // por encima: riesgo de derrame
export const MIN_OP = 50; // mínimo para operar
export const TICK = 110; // ms del bucle de operación
export const ROTURA_TEMP = 130; // °C: por encima, el matraz se rompe
export const CONTAMINA_TEMP = 95; // °C: por encima, el destilado de etanol arrastra agua

export type Fase = "armar" | "cargar" | "operar" | "listo" | "accidente";
export type Accidente = "derrame" | "rotura" | null;
export type Llama = "off" | "baja" | "media" | "alta";

export const LLAMA_TARGET: Record<Exclude<Llama, "off">, number> = { baja: 86, media: 106, alta: 152 };
export const LLAMA_RATE: Record<Exclude<Llama, "off">, number> = { baja: 0.05, media: 0.075, alta: 0.12 };

export const fmt = (n: number, d = 0) => n.toLocaleString("es-MX", { minimumFractionDigits: d, maximumFractionDigits: d });
