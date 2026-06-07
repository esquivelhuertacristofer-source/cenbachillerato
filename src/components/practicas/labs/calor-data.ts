/**
 * Módulo de DATOS puro del laboratorio "Propagación del calor".
 * PROHIBIDO importar three / @react-three aquí (límite 3 MiB gzipped del
 * Worker de Cloudflare). Solo matemática y texto verbatim.
 *
 * Anclado a CNEYT-II-P11-A2 (ejercicio; propósito formativo O4, UAC CNEYT-II
 * "El poder de la energía"). Contenido formativo oficial 2025:
 *   "Propagación de calor: conducción y convección. Transferencia de calor por
 *    radiación. Conductividad calorífica y capacidad térmica específica."
 *
 * Tres formas de propagación + comparación:
 *  (1) conducción — el calor viaja por contacto, átomo a átomo (Fourier).
 *  (2) convección — el calor viaja con el fluido que se mueve (corrientes).
 *  (3) radiación  — el calor viaja como onda electromagnética, sin medio.
 *  (4) comparar   — vista lado a lado de los tres mecanismos.
 */

export type Modo = "conduccion" | "conveccion" | "radiacion" | "comparar";

export const MODOS: Modo[] = ["conduccion", "conveccion", "radiacion", "comparar"];

export interface ModoDef {
  etq: string;
  subtitulo: string;
  icono: string; // font-awesome
  color: string; // hex sin #
}

export const MODOS_DEF: Record<Modo, ModoDef> = {
  conduccion: {
    etq: "Conducción",
    subtitulo: "calor por contacto, átomo a átomo",
    icono: "fa-fire-burner",
    color: "#fb923c",
  },
  conveccion: {
    etq: "Convección",
    subtitulo: "calor que viaja con el fluido",
    icono: "fa-water",
    color: "#38bdf8",
  },
  radiacion: {
    etq: "Radiación",
    subtitulo: "calor como onda, sin medio",
    icono: "fa-sun",
    color: "#f472b6",
  },
  comparar: {
    etq: "Comparar",
    subtitulo: "los tres mecanismos lado a lado",
    icono: "fa-layer-group",
    color: "#a78bfa",
  },
};

// ── Fases (pasos) de cada proceso ──────────────────────────────────────────
export const FASES: Record<Exclude<Modo, "comparar">, string[]> = {
  conduccion: ["Equilibrio", "Foco de calor", "Gradiente", "Flujo estable", "Q/t = k·A·ΔT/L"],
  conveccion: ["Reposo", "Base caliente", "El fluido sube", "Corriente", "Ciclo convectivo"],
  radiacion: ["Cuerpo frío", "Se calienta", "Emisión IR", "Viaja en el vacío", "Q/t = ε·σ·A·T⁴"],
};

export function numFases(modo: Modo): number {
  if (modo === "comparar") return 1;
  return FASES[modo].length;
}

export interface Escena {
  modo: Modo;
  nombre: string;
  desc: string;
  /** etiqueta corta del mecanismo (medio por el que viaja el calor) */
  medio: string;
  /** avance del proceso 0..1 (lo usa la escena 3D para animar) */
  frac: number;
}

export function escenaPara(modo: Modo, idx: number): Escena {
  if (modo === "comparar") {
    return {
      modo,
      nombre: "Conducción · Convección · Radiación",
      desc: "Los tres caminos del calor: por contacto en sólidos, por corrientes en fluidos y por ondas en el vacío.",
      medio: "sólido · fluido · vacío",
      frac: 1,
    };
  }
  const fases = FASES[modo];
  const i = Math.max(0, Math.min(fases.length - 1, idx));
  const frac = fases.length > 1 ? i / (fases.length - 1) : 1;
  const medio = modo === "conduccion" ? "sólido" : modo === "conveccion" ? "fluido" : "vacío / cualquier medio";

  const DESCS: Record<Exclude<Modo, "comparar">, string[]> = {
    conduccion: [
      "La barra está a temperatura ambiente: sus átomos vibran poco y por igual.",
      "Acercamos una flama a un extremo: esos átomos vibran con fuerza.",
      "La vibración se transmite de átomo a átomo; el calor avanza sin que la materia se desplace.",
      "Se establece un gradiente de temperatura casi lineal de un extremo al otro.",
      "El flujo de calor es constante: Q/t = k·A·ΔT/L. A mayor k (cobre), más rápido conduce.",
    ],
    conveccion: [
      "El fluido (agua o aire) está frío y quieto, con densidad uniforme.",
      "Calentamos la base: el fluido del fondo recibe energía y se dilata.",
      "Al dilatarse pierde densidad y flota: el fluido caliente sube.",
      "Arriba se enfría, se vuelve denso y baja: nace una corriente de convección.",
      "El ciclo transporta calor con la materia. Newton: Q/t = h·A·ΔT.",
    ],
    radiacion: [
      "El cuerpo está frío: emite muy poca energía radiante.",
      "Al subir su temperatura emite cada vez más, sobre todo en infrarrojo.",
      "Irradia ondas electromagnéticas en todas direcciones: no necesita tocar nada.",
      "La radiación viaja incluso en el vacío; así nos llega el calor del Sol.",
      "La potencia crece con la 4.ª potencia de T: Q/t = ε·σ·A·T⁴ (Stefan-Boltzmann).",
    ],
  };
  return { modo, nombre: fases[i] ?? "", desc: DESCS[modo][i] ?? "", medio, frac };
}

// ── Constantes físicas ─────────────────────────────────────────────────────
export const SIGMA = 5.67e-8; // W/m²·K⁴  (Stefan-Boltzmann)
export const CERO_C_EN_K = 273.15;

// ── Materiales: conductividad térmica k (W/m·K) y calor específico c (J/kg·K)
export interface Material {
  nombre: string;
  k: number; // conductividad térmica
  c: number; // capacidad térmica específica
  tipo: "metal" | "no-metal" | "fluido" | "aislante";
}

export const MATERIALES: Material[] = [
  { nombre: "Cobre", k: 401, c: 385, tipo: "metal" },
  { nombre: "Aluminio", k: 237, c: 900, tipo: "metal" },
  { nombre: "Acero", k: 50, c: 460, tipo: "metal" },
  { nombre: "Vidrio", k: 0.8, c: 840, tipo: "no-metal" },
  { nombre: "Agua", k: 0.6, c: 4186, tipo: "fluido" },
  { nombre: "Concreto", k: 1.4, c: 880, tipo: "no-metal" },
  { nombre: "Madera", k: 0.15, c: 1700, tipo: "aislante" },
  { nombre: "Aire", k: 0.026, c: 1005, tipo: "fluido" },
];

export function materialPorNombre(nombre: string): Material {
  return MATERIALES.find((m) => m.nombre === nombre) ?? MATERIALES[0]!;
}

// ── Cálculos (exactos) ─────────────────────────────────────────────────────

/** Conducción de Fourier: Q/t = k·A·ΔT/L  → potencia en watts. */
export function conduccion(k: number, areaM2: number, deltaT: number, largoM: number): number {
  if (largoM <= 0) return 0;
  return (k * areaM2 * deltaT) / largoM;
}

/** Convección (enfriamiento de Newton): Q/t = h·A·ΔT → watts. */
export function conveccion(h: number, areaM2: number, deltaT: number): number {
  return h * areaM2 * deltaT;
}

/**
 * Radiación de Stefan-Boltzmann: Q/t = ε·σ·A·(T⁴ − T_amb⁴) → watts.
 * Temperaturas en kelvin.
 */
export function radiacion(emisividad: number, areaM2: number, tHotK: number, tAmbK: number): number {
  return emisividad * SIGMA * areaM2 * (Math.pow(tHotK, 4) - Math.pow(tAmbK, 4));
}

/** Calor sensible: Q = m·c·ΔT → joules. */
export function calorSensible(masaKg: number, c: number, deltaT: number): number {
  return masaKg * c * deltaT;
}

/** Tiempo para calentar una masa con una potencia dada: t = Q / P  → segundos. */
export function tiempoCalentar(masaKg: number, c: number, deltaT: number, potenciaW: number): number {
  if (potenciaW <= 0) return Infinity;
  return calorSensible(masaKg, c, deltaT) / potenciaW;
}

export function cToK(celsius: number): number {
  return celsius + CERO_C_EN_K;
}

// ── Formato ────────────────────────────────────────────────────────────────
export function fmtNum(n: number, dec = 1): string {
  if (!isFinite(n)) return "∞";
  const abs = Math.abs(n);
  if (abs !== 0 && (abs >= 1e5 || abs < 1e-2)) {
    return n.toExponential(2).replace("e+", "×10^").replace("e-", "×10^-");
  }
  return n.toLocaleString("es-MX", { maximumFractionDigits: dec, minimumFractionDigits: 0 });
}

export function fmtEntero(n: number): string {
  return Math.round(n).toLocaleString("es-MX");
}

// ── Tabla comparativa de los tres mecanismos ───────────────────────────────
export interface FilaComparacion {
  rasgo: string;
  conduccion: string;
  conveccion: string;
  radiacion: string;
}

export const COMPARACION: FilaComparacion[] = [
  { rasgo: "Cómo viaja", conduccion: "Contacto átomo a átomo", conveccion: "Con el fluido en movimiento", radiacion: "Ondas electromagnéticas" },
  { rasgo: "¿Mueve materia?", conduccion: "No", conveccion: "Sí (corrientes)", radiacion: "No" },
  { rasgo: "Medio que necesita", conduccion: "Sólido (mejor en metales)", conveccion: "Líquido o gas", radiacion: "Ninguno (también el vacío)" },
  { rasgo: "Ley / ecuación", conduccion: "Q/t = k·A·ΔT/L", conveccion: "Q/t = h·A·ΔT", radiacion: "Q/t = ε·σ·A·T⁴" },
  { rasgo: "Ejemplo cotidiano", conduccion: "Cuchara en el café", conveccion: "Agua hirviendo, brisa marina", radiacion: "Calor del Sol, fogata" },
];

// ── Contenido didáctico (verbatim-fiel a CNEYT-II·O4) ───────────────────────

export const PROBLEMA =
  "El calor siempre fluye de lo caliente a lo frío, pero no siempre por el mismo camino. " +
  "En este laboratorio observas en 3D las tres formas de propagación del calor: la conducción " +
  "(en sólidos, átomo a átomo), la convección (en fluidos, con corrientes que suben y bajan) y " +
  "la radiación (como onda electromagnética, capaz de cruzar el vacío). Después calcula el flujo " +
  "de calor y la energía con la conductividad térmica k y la capacidad térmica específica c.";

export const INSTRUCCIONES: Record<Modo, string[]> = {
  conduccion: [
    "Elige el modo Conducción y observa la barra a temperatura ambiente.",
    "Reproduce las fases: el extremo caliente transmite la vibración átomo a átomo.",
    "Nota el gradiente de color (rojo = caliente, azul = frío) y cómo el calor avanza sin mover la barra.",
    "En la calculadora cambia el material: el cobre (k alta) conduce mucho más que la madera.",
  ],
  conveccion: [
    "Elige el modo Convección y mira el fluido frío en reposo.",
    "Reproduce las fases: la base caliente hace que el fluido suba y forme una corriente.",
    "Observa las celdas de convección: el fluido caliente sube y el frío baja en un ciclo.",
    "Relaciónalo con el agua hirviendo o con la brisa marina en las costas de México.",
  ],
  radiacion: [
    "Elige el modo Radiación y observa el cuerpo frío que casi no emite.",
    "Reproduce las fases: al calentarse irradia ondas que se expanden en todas direcciones.",
    "Comprueba que la radiación no necesita medio: cruza el vacío, como el calor del Sol.",
    "Recuerda Stefan-Boltzmann: si la temperatura se duplica, la potencia se multiplica por 16 (2⁴).",
  ],
  comparar: [
    "Usa el modo Comparar para ver los tres mecanismos al mismo tiempo.",
    "Revisa la tabla: cómo viaja el calor, qué medio necesita y su ecuación.",
    "Identifica los tres en un mismo objeto: una olla en la estufa los usa todos a la vez.",
    "Concluye cuál domina según el medio: sólido, fluido o vacío.",
  ],
};

export const PREGUNTAS: Record<Modo, string[]> = {
  conduccion: [
    "¿Por qué el mango metálico de una sartén quema más rápido que uno de madera?",
    "Si duplicas el grosor (L) de una pared, ¿el flujo de calor sube o baja?",
    "¿Por qué los disipadores de las computadoras son de aluminio o cobre?",
  ],
  conveccion: [
    "¿Por qué el radiador (calefactor) se coloca abajo y el aire acondicionado arriba?",
    "¿Cómo explican las corrientes de convección la brisa del mar de día y de noche?",
    "¿Por qué el agua hierve formando burbujas que suben?",
  ],
  radiacion: [
    "Si el Sol está a 150 millones de km en el vacío, ¿cómo nos llega su calor?",
    "¿Por qué la ropa negra se calienta más al sol que la blanca?",
    "¿Por qué una fogata calienta tu cara aunque el aire entre tú y ella siga frío?",
  ],
  comparar: [
    "En una taza de café caliente, ¿dónde actúa cada mecanismo?",
    "¿Cuál de los tres puede funcionar en el espacio exterior?",
    "¿Cómo aprovecha un termo (botella de vacío) el conocer los tres mecanismos?",
  ],
};

export const IDEAS: string[] = [
  "El calor es energía que fluye espontáneamente de lo caliente a lo frío hasta el equilibrio térmico.",
  "Conducción: la energía se transmite por choques entre partículas sin que la materia se traslade; es eficaz en sólidos, sobre todo metales.",
  "Convección: el propio fluido caliente se mueve formando corrientes; transporta calor con la materia.",
  "Radiación: toda la materia emite ondas electromagnéticas; es la única forma que viaja en el vacío.",
  "La conductividad térmica k mide qué tan bien un material conduce el calor; un aislante tiene k muy baja.",
  "La capacidad térmica específica c es la energía para subir 1 °C a 1 kg; el agua tiene c muy alta, por eso modera el clima.",
];

export const GLOSARIO: { termino: string; definicion: string; ejemplo: string }[] = [
  { termino: "Calor", definicion: "Energía en tránsito entre cuerpos a distinta temperatura; se mide en joules (J).", ejemplo: "El café cede calor al aire hasta enfriarse." },
  { termino: "Temperatura", definicion: "Medida de la energía cinética promedio de las partículas; se mide en °C o K.", ejemplo: "El agua hierve a 100 °C (373 K) al nivel del mar." },
  { termino: "Conducción", definicion: "Propagación del calor por contacto, sin desplazamiento de materia.", ejemplo: "Una cuchara metálica en una olla caliente." },
  { termino: "Convección", definicion: "Propagación del calor mediante corrientes de un fluido que se mueve.", ejemplo: "El agua que hierve y circula en una olla." },
  { termino: "Radiación", definicion: "Propagación del calor por ondas electromagnéticas; no requiere medio.", ejemplo: "El calor del Sol que cruza el vacío del espacio." },
  { termino: "Conductividad térmica (k)", definicion: "Propiedad que indica qué tan bien un material conduce el calor (W/m·K).", ejemplo: "Cobre k≈401; madera k≈0.15." },
  { termino: "Capacidad térmica específica (c)", definicion: "Energía para elevar 1 °C la temperatura de 1 kg de sustancia (J/kg·K).", ejemplo: "Agua c≈4186; mucho mayor que la del metal." },
  { termino: "Equilibrio térmico", definicion: "Estado en que dos cuerpos en contacto alcanzan la misma temperatura.", ejemplo: "El hielo en un refresco hasta que todo queda frío." },
];

export const CONTEXTO =
  "En México la propagación del calor explica muchísimos fenómenos: la brisa marina de Acapulco y " +
  "Veracruz (convección entre tierra y mar), el adobe de las casas tradicionales que aísla (baja k) " +
  "frente al calor de Sonora, los calentadores solares de Cuautla y el Bajío que aprovechan la " +
  "radiación, y el alto calor específico del agua de las presas y lagos, que modera el clima de las " +
  "regiones que los rodean. Entender k y c permite diseñar viviendas térmicamente eficientes.";

export const FUENTE =
  "MCCEMS 2025, Ciencias Naturales, Experimentales y Tecnología II «El poder de la energía», " +
  "propósito formativo O4 (propagación del calor) y su contenido formativo: conducción y convección, " +
  "transferencia por radiación, conductividad calorífica y capacidad térmica específica.";

export interface EjemploResuelto {
  enunciado: string;
  datos: string[];
  solucion: string;
  resultado: string;
}

export const EJEMPLO: EjemploResuelto = {
  enunciado:
    "Una ventana de vidrio de 1.5 m² y 6 mm de espesor separa un interior a 22 °C de un exterior a 4 °C. " +
    "¿Cuánto calor por segundo se pierde por conducción? (k del vidrio ≈ 0.8 W/m·K).",
  datos: ["k = 0.8 W/m·K", "A = 1.5 m²", "ΔT = 22 − 4 = 18 °C", "L = 0.006 m"],
  solucion:
    "Aplicamos Fourier Q/t = k·A·ΔT/L = (0.8 × 1.5 × 18) / 0.006 = 21.6 / 0.006 = 3600 W. " +
    "Por eso el doble vidrio (aire atrapado, k≈0.026) reduce muchísimo la pérdida.",
  resultado: "Q/t = 3 600 W (3.6 kW) se fugan por la ventana.",
};

export interface DatoClave {
  valor: string;
  texto: string;
  icono: string;
}

export const DATOS: DatoClave[] = [
  { valor: "401 W/m·K", texto: "Conductividad del cobre: de los mejores conductores.", icono: "fa-bolt" },
  { valor: "0.026 W/m·K", texto: "Conductividad del aire: por eso aísla cuando está quieto.", icono: "fa-wind" },
  { valor: "4 186 J/kg·K", texto: "Calor específico del agua: muy alto, modera el clima.", icono: "fa-droplet" },
  { valor: "5.67×10⁻⁸", texto: "Constante de Stefan-Boltzmann σ (W/m²·K⁴).", icono: "fa-sun" },
  { valor: "T⁴", texto: "La radiación crece con la 4.ª potencia de la temperatura.", icono: "fa-arrow-trend-up" },
  { valor: "0 medio", texto: "La radiación es la única que viaja en el vacío.", icono: "fa-meteor" },
];

export const HECHOS: string[] = [
  "El calor del Sol llega a la Tierra solo por radiación: cruza 150 millones de km de vacío.",
  "Un termo mantiene la temperatura porque su vacío frena la conducción y la convección, y su espejo refleja la radiación.",
  "El alto calor específico del agua es la razón de que el mar tarde en calentarse y enfriarse, suavizando el clima costero.",
  "Los metales se sienten más fríos que la madera a la misma temperatura porque conducen el calor de tu mano más rápido.",
  "Si una estrella duplica su temperatura, irradia 16 veces más energía (2⁴), por la ley de Stefan-Boltzmann.",
];
