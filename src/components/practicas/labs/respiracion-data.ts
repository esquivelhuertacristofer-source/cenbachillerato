/**
 * Datos y química PURA del laboratorio "Respiración aerobia y anaerobia"
 * (CNEYT-IV·O8 — UAC "El poder de la química").
 *
 * Propósito formativo O8 (verbatim): "Comprende los procesos químicos
 * involucrados en la respiración aerobia y anaerobia, para identificar su
 * importancia para los seres vivos y el bienestar humano y desarrollos
 * tecnológicos vinculados."
 * Contenidos formativos C8 (verbatim): "Aspectos químicos de la glucólisis,
 * ciclo de Krebs y cadena transportadora de electrones · Aspectos químicos de
 * la fermentación · Desarrollos tecnológicos vinculados con la respiración
 * aerobia y anaerobia."
 *
 * Este módulo es DATOS PUROS: el balance de ATP, el consumo de O₂ y la
 * producción de CO₂/H₂O por mol de glucosa, y la eficiencia energética. NO
 * importa three / R3F (regla del Worker de Cloudflare ≤ 3 MiB gzip). La
 * estequiometría y los conteos de ATP son los valores estándar; la escena 3D
 * es esquemática (no a escala).
 */

export type Modo = "glucolisis" | "aerobia" | "fermentacion" | "comparar";
export const MODOS: Modo[] = ["glucolisis", "aerobia", "fermentacion", "comparar"];

interface ModoDef {
  etq: string;
  subtitulo: string;
  icono: string;
  color: string;
}

export const MODOS_DEF: Record<Modo, ModoDef> = {
  glucolisis: {
    etq: "Glucólisis",
    subtitulo: "la glucosa se parte en dos",
    icono: "fa-cubes-stacked",
    color: "#fbbf24",
  },
  aerobia: {
    etq: "Respiración aerobia",
    subtitulo: "con O₂ en la mitocondria",
    icono: "fa-lungs",
    color: "#34d399",
  },
  fermentacion: {
    etq: "Fermentación",
    subtitulo: "sin O₂: solo 2 ATP",
    icono: "fa-wine-bottle",
    color: "#a78bfa",
  },
  comparar: {
    etq: "Comparar",
    subtitulo: "aerobia vs anaerobia",
    icono: "fa-table-list",
    color: "#38bdf8",
  },
};

/* ── Fases de animación por modo ─────────────────────────────────────────── */
export const FASES: Record<Exclude<Modo, "comparar">, string[]> = {
  glucolisis: [
    "Glucosa (6 C) en el citoplasma",
    "Inversión: se gastan 2 ATP",
    "La glucosa se parte en dos (3 C)",
    "Cosecha: 4 ATP y 2 NADH",
    "2 piruvato + 2 ATP netos",
  ],
  aerobia: [
    "El piruvato entra a la mitocondria",
    "Oxidación → acetil-CoA (+ CO₂)",
    "Ciclo de Krebs (+ NADH, FADH₂, CO₂)",
    "Cadena transportadora bombea H⁺",
    "El O₂ recibe los e⁻ → H₂O",
    "ATP sintasa: ~34 ATP más",
  ],
  fermentacion: [
    "Glucólisis → 2 piruvato + 2 ATP",
    "Sin O₂: la cadena se detiene",
    "El piruvato acepta los e⁻ del NADH",
    "Lactato o etanol + CO₂ (NAD⁺ regenerado)",
  ],
};

export function numFases(modo: Modo): number {
  if (modo === "comparar") return 1;
  return FASES[modo].length;
}

export interface Escena {
  modo: Modo;
  nombre: string;
  desc: string;
  medio: string;
  frac: number; // 0 → 1 a lo largo de las fases
}

export function escenaPara(modo: Modo, idx: number): Escena {
  if (modo === "comparar") {
    return {
      modo,
      nombre: "Aerobia vs anaerobia",
      desc: "La misma glucosa rinde ~38 ATP con O₂ (aerobia) pero solo 2 ATP sin O₂ (fermentación).",
      medio: "Dos vías lado a lado",
      frac: 1,
    };
  }
  const fases = FASES[modo];
  const n = fases.length;
  const i = Math.min(Math.max(0, idx), n - 1);
  const frac = n > 1 ? i / (n - 1) : 1;
  const nombre = fases[i] ?? "";

  const descs: Record<Exclude<Modo, "comparar">, string[]> = {
    glucolisis: [
      "Una molécula de glucosa (C₆H₁₂O₆) flota en el citoplasma: aún no hay energía liberada.",
      "Las primeras reacciones GASTAN 2 ATP para activar la glucosa (fase de inversión).",
      "La glucosa de 6 carbonos se rompe en dos moléculas de 3 carbonos.",
      "La oxidación produce 4 ATP y 2 NADH (fase de cosecha): el balance neto es +2 ATP.",
      "Quedan 2 piruvato. Con O₂ seguirán a la mitocondria; sin O₂, irán a fermentación.",
    ],
    aerobia: [
      "Con oxígeno disponible, el piruvato cruza a la matriz de la mitocondria.",
      "Cada piruvato se oxida a acetil-CoA y libera CO₂, generando NADH.",
      "El acetil-CoA gira en el ciclo de Krebs: salen NADH, FADH₂, ATP y más CO₂.",
      "El NADH y el FADH₂ ceden electrones a la cadena, que bombea H⁺ (protones).",
      "El oxígeno es el aceptor final de electrones: se combina con H⁺ y forma agua.",
      "El flujo de H⁺ mueve la ATP sintasa: se fabrican ~34 ATP (≈38 ATP en total).",
    ],
    fermentacion: [
      "La glucólisis ya dio 2 piruvato, 2 ATP y 2 NADH en el citoplasma.",
      "Sin oxígeno, la cadena transportadora no funciona: el NADH no se puede oxidar ahí.",
      "Para seguir, el piruvato (o su derivado) acepta los electrones del NADH.",
      "Resultado: lactato (en tu músculo) o etanol + CO₂ (en la levadura). Se regenera NAD⁺ y el saldo es solo 2 ATP.",
    ],
  };
  const medios: Record<Exclude<Modo, "comparar">, string> = {
    glucolisis: "C₆H₁₂O₆ → 2 piruvato (citoplasma)",
    aerobia: "C₆H₁₂O₆ + 6 O₂ → 6 CO₂ + 6 H₂O (mitocondria)",
    fermentacion: "C₆H₁₂O₆ → 2 lactato / 2 etanol + 2 CO₂",
  };

  return {
    modo,
    nombre,
    desc: descs[modo][i] ?? "",
    medio: medios[modo],
    frac,
  };
}

/* ── Etapas químicas de la respiración aerobia ────────────────────────────── */
export interface Etapa {
  nombre: string;
  lugar: string;
  resumen: string;
  atp: number; // ATP por sustrato (directo)
  nadh: number;
  fadh2: number;
  co2: number;
}

export const ETAPAS: Etapa[] = [
  { nombre: "Glucólisis", lugar: "Citoplasma", resumen: "La glucosa (6 C) se parte en 2 piruvato (3 C).", atp: 2, nadh: 2, fadh2: 0, co2: 0 },
  { nombre: "Oxidación del piruvato", lugar: "Matriz mitocondrial", resumen: "Cada piruvato → acetil-CoA, liberando CO₂.", atp: 0, nadh: 2, fadh2: 0, co2: 2 },
  { nombre: "Ciclo de Krebs", lugar: "Matriz mitocondrial", resumen: "El acetil-CoA se oxida por completo (2 vueltas).", atp: 2, nadh: 6, fadh2: 2, co2: 4 },
  { nombre: "Cadena transportadora", lugar: "Membrana interna", resumen: "NADH y FADH₂ ceden e⁻; el O₂ es el aceptor final y se forma H₂O.", atp: 0, nadh: 0, fadh2: 0, co2: 0 },
];

/* ── Catálogo de vías metabólicas (estequiometría real) ───────────────────── */
export type RutaId = "aerobia" | "lactica" | "alcoholica";

export interface Ruta {
  id: RutaId;
  nombre: string;
  ecuacion: string;
  atpPorGlucosa: number; // rendimiento teórico máximo
  o2PorGlucosa: number;
  co2PorGlucosa: number;
  h2oPorGlucosa: number;
  productos: string;
  lugar: string;
  organismos: string;
  aerobica: boolean;
  contexto: string;
}

export const RUTAS: Ruta[] = [
  {
    id: "aerobia",
    nombre: "Respiración aerobia (con O₂)",
    ecuacion: "C₆H₁₂O₆ + 6 O₂ → 6 CO₂ + 6 H₂O",
    atpPorGlucosa: 38,
    o2PorGlucosa: 6,
    co2PorGlucosa: 6,
    h2oPorGlucosa: 6,
    productos: "6 CO₂ + 6 H₂O",
    lugar: "Mitocondria",
    organismos: "Animales, plantas, hongos y la mayoría de células con O₂",
    aerobica: true,
    contexto: "Es la vía que usas al respirar: por eso exhalas CO₂ y necesitas oxígeno.",
  },
  {
    id: "lactica",
    nombre: "Fermentación láctica (sin O₂)",
    ecuacion: "C₆H₁₂O₆ → 2 C₃H₆O₃ (ácido láctico)",
    atpPorGlucosa: 2,
    o2PorGlucosa: 0,
    co2PorGlucosa: 0,
    h2oPorGlucosa: 0,
    productos: "2 ácido láctico",
    lugar: "Citoplasma",
    organismos: "Músculo en esfuerzo intenso, bacterias del yogur (Lactobacillus)",
    aerobica: false,
    contexto: "El ardor muscular del ejercicio intenso y el cuajado del yogur y el queso.",
  },
  {
    id: "alcoholica",
    nombre: "Fermentación alcohólica (sin O₂)",
    ecuacion: "C₆H₁₂O₆ → 2 C₂H₅OH + 2 CO₂",
    atpPorGlucosa: 2,
    o2PorGlucosa: 0,
    co2PorGlucosa: 2,
    h2oPorGlucosa: 0,
    productos: "2 etanol + 2 CO₂",
    lugar: "Citoplasma",
    organismos: "Levaduras (Saccharomyces cerevisiae)",
    aerobica: false,
    contexto: "El gas que esponja el pan, el pulque, el tequila, la cerveza y el vino.",
  },
];

export function rutaPorId(id: string): Ruta {
  return RUTAS.find((r) => r.id === id) ?? (RUTAS[0] as Ruta);
}

/* ── Química PURA: balance energético ─────────────────────────────────────── */

// Energía libre liberada por la oxidación total de 1 mol de glucosa (kJ/mol).
export const DELTA_G_GLUCOSA = 2870;
// Energía aprovechada al sintetizar 1 mol de ATP (kJ/mol).
export const ENERGIA_ATP = 30.5;

export interface BalanceVia {
  atp: number;
  o2: number;
  co2: number;
  h2o: number;
  energiaKJ: number; // energía capturada como ATP
  eficiencia: number; // 0 → 1 respecto a la energía total de la glucosa
}

/**
 * Balance de una vía para `mol` de glucosa.
 * La eficiencia compara la energía capturada como ATP (atp × 30.5 kJ) con la
 * energía total liberable por la glucosa (2870 kJ/mol).
 */
export function balanceVia(r: Ruta, mol: number): BalanceVia {
  const m = Math.max(0, mol);
  const energiaKJ = r.atpPorGlucosa * m * ENERGIA_ATP;
  return {
    atp: r.atpPorGlucosa * m,
    o2: r.o2PorGlucosa * m,
    co2: r.co2PorGlucosa * m,
    h2o: r.h2oPorGlucosa * m,
    energiaKJ,
    eficiencia: (r.atpPorGlucosa * ENERGIA_ATP) / DELTA_G_GLUCOSA,
  };
}

/** Cuántas veces más ATP rinde la vía aerobia frente a la fermentación. */
export function ventajaAerobia(): number {
  const aer = RUTAS.find((r) => r.id === "aerobia");
  const fer = RUTAS.find((r) => !r.aerobica);
  if (!aer || !fer || fer.atpPorGlucosa === 0) return 0;
  return aer.atpPorGlucosa / fer.atpPorGlucosa;
}

/* ── Desglose del rendimiento aerobio (rendimiento teórico = 38 ATP) ───────── */
export interface FilaDesglose {
  etapa: string;
  fuente: string;
  atp: number;
}

export const DESGLOSE_AEROBIA: FilaDesglose[] = [
  { etapa: "Glucólisis", fuente: "2 ATP directos (sustrato)", atp: 2 },
  { etapa: "Glucólisis", fuente: "2 NADH × 3 (cadena)", atp: 6 },
  { etapa: "Oxidación piruvato", fuente: "2 NADH × 3 (cadena)", atp: 6 },
  { etapa: "Ciclo de Krebs", fuente: "2 ATP directos (GTP)", atp: 2 },
  { etapa: "Ciclo de Krebs", fuente: "6 NADH × 3 (cadena)", atp: 18 },
  { etapa: "Ciclo de Krebs", fuente: "2 FADH₂ × 2 (cadena)", atp: 4 },
];

export function totalDesglose(): number {
  return DESGLOSE_AEROBIA.reduce((s, f) => s + f.atp, 0); // 38
}

/* ── Formato numérico (es-MX) ─────────────────────────────────────────────── */
export function fmtNum(n: number, dec = 2): string {
  if (!isFinite(n)) return "∞";
  const abs = Math.abs(n);
  if (abs !== 0 && (abs >= 1e5 || abs < 1e-2)) {
    return n.toExponential(2).replace("e", " × 10^").replace("+", "");
  }
  return n.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: dec });
}

export function fmtPorcentaje(x: number): string {
  return (x * 100).toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 1 }) + " %";
}

/* ── Tabla comparativa aerobia vs anaerobia ───────────────────────────────── */
export interface FilaComparacion {
  rasgo: string;
  aerobia: string;
  anaerobia: string;
}

export const COMPARACION: FilaComparacion[] = [
  { rasgo: "Oxígeno", aerobia: "Necesita O₂", anaerobia: "No necesita O₂" },
  { rasgo: "Lugar", aerobia: "Citoplasma + mitocondria", anaerobia: "Solo citoplasma" },
  { rasgo: "Etapas", aerobia: "Glucólisis, Krebs y cadena transportadora", anaerobia: "Solo glucólisis + fermentación" },
  { rasgo: "ATP por glucosa", aerobia: "≈ 38 (teórico)", anaerobia: "Solo 2" },
  { rasgo: "Productos", aerobia: "CO₂ + H₂O", anaerobia: "Lactato, o etanol + CO₂" },
  { rasgo: "Eficiencia", aerobia: "≈ 40 % de la energía de la glucosa", anaerobia: "≈ 2 %" },
  { rasgo: "Ejemplo", aerobia: "Tu respiración en reposo", anaerobia: "Músculo en esfuerzo; levadura en el pan" },
];

/* ── Contenido didáctico ──────────────────────────────────────────────────── */
export const PROBLEMA =
  "La respiración celular es la combustión controlada del alimento: la célula oxida la glucosa para guardar su energía en moléculas de ATP. Empieza igual para todos con la GLUCÓLISIS (en el citoplasma), que parte la glucosa en 2 piruvato y rinde 2 ATP netos. A partir de ahí hay dos caminos. Si HAY oxígeno, la respiración AEROBIA continúa en la mitocondria con el ciclo de Krebs y la cadena transportadora de electrones, donde el O₂ es el aceptor final: se libera CO₂ y H₂O y se cosechan ~38 ATP por glucosa. Si NO hay oxígeno, la FERMENTACIÓN (anaerobia) regenera el NAD⁺ produciendo lactato (en tu músculo) o etanol y CO₂ (en la levadura), pero solo con los 2 ATP de la glucólisis. Manipula los modos para recorrer cada etapa y calcular el rendimiento de ATP, el CO₂ y el O₂.";

export const INSTRUCCIONES: Record<Modo, string[]> = {
  glucolisis: [
    "Observa la glucosa de 6 carbonos flotando en el citoplasma.",
    "Avanza las fases con ▶ o la barra: primero se invierten 2 ATP, luego la glucosa se parte en dos.",
    "Fíjate en la cosecha: salen 4 ATP y 2 NADH, así que el balance NETO es +2 ATP.",
    "Al final quedan 2 piruvato: con O₂ irán a la mitocondria; sin O₂, a fermentación.",
  ],
  aerobia: [
    "Parte del piruvato entrando a la mitocondria (ya tienes O₂ disponible).",
    "Avanza y observa la oxidación a acetil-CoA, el ciclo de Krebs y la cadena transportadora.",
    "Mira cómo el O₂ recibe los electrones y forma agua, mientras la ATP sintasa fabrica ATP.",
    "Usa la calculadora A2 para ver el rendimiento total (~38 ATP) y el CO₂/O₂ por glucosa.",
  ],
  fermentacion: [
    "Recuerda que la glucólisis ya dio 2 piruvato y 2 ATP.",
    "Avanza para ver que, sin O₂, la cadena transportadora no funciona.",
    "El piruvato acepta los electrones del NADH para regenerar NAD⁺.",
    "Compara en la calculadora: la fermentación deja solo 2 ATP frente a los 38 de la aerobia.",
  ],
  comparar: [
    "Revisa la tabla: la aerobia necesita O₂, usa la mitocondria y rinde ~38 ATP; la anaerobia, solo 2.",
    "Relaciona cada rasgo (oxígeno, lugar, productos, eficiencia) con lo que viste en los otros modos.",
    "Identifica un ejemplo de cada vía en tu cuerpo y en la cocina.",
  ],
};

export const PREGUNTAS: Record<Modo, string[]> = {
  glucolisis: [
    "Si la glucólisis produce 4 ATP, ¿por qué decimos que su rendimiento NETO es solo 2?",
    "¿Por qué la glucólisis ocurre igual con o sin oxígeno?",
    "¿Para qué le sirve a la célula el NADH que sale de la glucólisis?",
  ],
  aerobia: [
    "¿Por qué se dice que el oxígeno es el «aceptor final de electrones»?",
    "Si no llegara O₂ al final de la cadena, ¿qué pasaría con la producción de ATP?",
    "¿En qué parte de la mitocondria se fabrica la mayor parte del ATP, y gracias a qué?",
  ],
  fermentacion: [
    "¿Por qué la fermentación rinde tan poco ATP comparada con la respiración aerobia?",
    "¿Para qué sirve regenerar NAD⁺ si no produce ATP adicional?",
    "¿Qué diferencia hay entre la fermentación de tu músculo y la de la levadura?",
  ],
  comparar: [
    "¿Cómo decide una célula muscular usar la vía aerobia o la fermentación?",
    "¿Por qué los organismos que dependen solo de fermentación crecen más despacio?",
    "Da un ejemplo tecnológico que aproveche cada vía (aerobia y anaerobia).",
  ],
};

export const IDEAS: string[] = [
  "La respiración celular es una oxidación controlada de la glucosa que guarda energía en ATP.",
  "La glucólisis es común a ambas vías: parte la glucosa en 2 piruvato y rinde 2 ATP netos en el citoplasma.",
  "Con O₂ (aerobia), el piruvato sigue en la mitocondria: oxidación, ciclo de Krebs y cadena transportadora.",
  "En la cadena transportadora el O₂ es el ACEPTOR FINAL de electrones y se forma agua.",
  "La respiración aerobia rinde ~38 ATP por glucosa; la fermentación, solo 2 (≈19 veces menos).",
  "Sin O₂ (anaerobia), la fermentación regenera NAD⁺ produciendo lactato, o etanol + CO₂.",
  "La fermentación no produce más ATP: solo permite que la glucólisis siga funcionando sin oxígeno.",
  "La ecuación global de la aerobia es C₆H₁₂O₆ + 6 O₂ → 6 CO₂ + 6 H₂O: por eso respiras O₂ y exhalas CO₂.",
];

export const GLOSARIO: { termino: string; definicion: string; ejemplo: string }[] = [
  { termino: "Respiración celular", definicion: "Proceso químico que oxida la glucosa para liberar energía y guardarla como ATP.", ejemplo: "Cada célula de tu cuerpo lo hace para tener energía." },
  { termino: "ATP", definicion: "Molécula que almacena y entrega la energía utilizable de la célula (adenosín trifosfato).", ejemplo: "La aerobia rinde ~38 ATP por glucosa; la fermentación, solo 2." },
  { termino: "Glucólisis", definicion: "Primera etapa, en el citoplasma: parte la glucosa de 6 C en 2 piruvato y da 2 ATP netos + 2 NADH.", ejemplo: "Ocurre igual con o sin oxígeno." },
  { termino: "Piruvato", definicion: "Molécula de 3 carbonos resultante de la glucólisis; punto de bifurcación entre aerobia y fermentación.", ejemplo: "Con O₂ entra a la mitocondria; sin O₂ va a fermentación." },
  { termino: "Ciclo de Krebs", definicion: "Conjunto de reacciones en la matriz mitocondrial que oxidan el acetil-CoA y producen NADH, FADH₂, ATP y CO₂.", ejemplo: "Dos vueltas por glucosa liberan 4 CO₂." },
  { termino: "Cadena transportadora de electrones", definicion: "Serie de complejos en la membrana interna que reciben los e⁻ del NADH/FADH₂ y bombean H⁺ para fabricar ATP.", ejemplo: "El O₂ es el aceptor final y se forma agua." },
  { termino: "Aceptor final de electrones", definicion: "Molécula que recibe los electrones al final de la cadena; en la aerobia es el oxígeno (O₂).", ejemplo: "Sin O₂, la cadena se detiene y baja el ATP." },
  { termino: "Fermentación", definicion: "Vía anaerobia que regenera NAD⁺ a partir del piruvato cuando no hay O₂, sin producir ATP extra.", ejemplo: "Láctica en el músculo; alcohólica en la levadura." },
  { termino: "Fermentación láctica", definicion: "El piruvato se reduce a ácido láctico (lactato).", ejemplo: "El ardor del músculo en ejercicio intenso y el yogur." },
  { termino: "Fermentación alcohólica", definicion: "El piruvato se convierte en etanol y CO₂.", ejemplo: "El pan que esponja, el pulque, el tequila y la cerveza." },
  { termino: "NADH / FADH₂", definicion: "Transportadores que llevan electrones a la cadena; cada NADH rinde ~3 ATP y cada FADH₂ ~2.", ejemplo: "La aerobia genera 10 NADH y 2 FADH₂ por glucosa." },
];

export const CONTEXTO =
  "La respiración celular sostiene la vida y buena parte de la economía mexicana. La FERMENTACIÓN ALCOHÓLICA de las levaduras es la base de bebidas y alimentos emblemáticos: el pulque, el tequila (con agave de Jalisco con denominación de origen), el mezcal, la cerveza y el pan; en todos, la levadura convierte azúcares en etanol y CO₂. La FERMENTACIÓN LÁCTICA cuaja el yogur, el queso y permite que tu músculo siga trabajando unos segundos cuando el oxígeno no alcanza (de ahí el ardor en una carrera). La RESPIRACIÓN AEROBIA es la que ocurre en tus mitocondrias cada instante: por eso inhalas O₂ y exhalas CO₂. Y a escala industrial, los biodigestores anaerobios de granjas y rellenos sanitarios aprovechan la fermentación para producir biogás (metano) como energía renovable.";

export const FUENTE =
  "MCCEMS 2025 · Ciencias Naturales, Experimentales y Tecnología IV — 'El poder de la química'. Propósito formativo O8 y contenidos C8 (aspectos químicos de la glucólisis, ciclo de Krebs y cadena transportadora; fermentación; desarrollos tecnológicos vinculados). Conteos de ATP del rendimiento teórico máximo y estequiometría de tablas estándar de bioquímica.";

export interface EjemploResuelto {
  enunciado: string;
  datos: string[];
  solucion: string;
  resultado: string;
}

export const EJEMPLO: EjemploResuelto = {
  enunciado:
    "Una célula muscular metaboliza glucosa. a) En un esfuerzo intenso, sin O₂ suficiente, hace fermentación láctica: ¿cuánto ATP obtiene por glucosa? b) En reposo, con O₂, respira de forma aerobia: ¿cuánto ATP (teórico) por glucosa? c) ¿Cuántas veces más energía aprovecha la vía aerobia? d) Si oxida 5 mol de glucosa por vía aerobia, ¿cuántos mol de CO₂ produce y cuánto O₂ consume?",
  datos: ["Fermentación láctica: 2 ATP/glucosa", "Aerobia: 38 ATP/glucosa", "C₆H₁₂O₆ + 6 O₂ → 6 CO₂ + 6 H₂O", "5 mol de glucosa"],
  solucion:
    "a) La fermentación deja solo los 2 ATP netos de la glucólisis. b) La respiración aerobia rinde 38 ATP teóricos por glucosa. c) 38 ÷ 2 = 19 veces más ATP. d) Según C₆H₁₂O₆ + 6 O₂ → 6 CO₂ + 6 H₂O, cada glucosa usa 6 O₂ y da 6 CO₂; para 5 mol: 5 × 6 = 30 mol de CO₂ y 5 × 6 = 30 mol de O₂.",
  resultado:
    "a) 2 ATP. b) 38 ATP. c) 19 veces más (38/2). d) 30 mol de CO₂ y 30 mol de O₂ (y 30 mol de H₂O).",
};

export interface DatoClave {
  valor: string;
  texto: string;
  icono: string;
}

export const DATOS: DatoClave[] = [
  { valor: "≈ 38 ATP", texto: "Rendimiento teórico de la respiración aerobia por glucosa.", icono: "fa-bolt" },
  { valor: "2 ATP", texto: "Lo único que rinde la fermentación (anaerobia) por glucosa.", icono: "fa-battery-quarter" },
  { valor: "6 O₂ → 6 CO₂", texto: "Por cada glucosa la aerobia usa 6 O₂ y libera 6 CO₂ y 6 H₂O.", icono: "fa-wind" },
  { valor: "O₂ = aceptor final", texto: "El oxígeno cierra la cadena transportadora formando agua.", icono: "fa-droplet" },
  { valor: "≈ 40 %", texto: "Eficiencia energética de la aerobia (vs ~2 % de la fermentación).", icono: "fa-gauge-high" },
  { valor: "19×", texto: "La aerobia rinde 19 veces más ATP que la fermentación.", icono: "fa-arrow-up-9-1" },
];

export const HECHOS: string[] = [
  "El conteo clásico de ~38 ATP es el rendimiento TEÓRICO máximo; las estimaciones modernas, contando el costo de transportar protones, lo sitúan en ~30–32 ATP reales.",
  "La fermentación alcohólica del agave hace el tequila y el mezcal, productos mexicanos con denominación de origen reconocidos en el mundo.",
  "El ardor muscular del ejercicio intenso se asocia a la acumulación de lactato producido por fermentación láctica cuando el O₂ no alcanza.",
  "Tus mitocondrias provienen de bacterias que hace ~1500 millones de años empezaron a vivir dentro de otras células (teoría endosimbiótica).",
  "Los biodigestores anaerobios de granjas y basureros aprovechan la fermentación microbiana para generar biogás (metano) como energía renovable.",
];
