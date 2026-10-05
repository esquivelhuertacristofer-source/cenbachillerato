/**
 * Lógica pura del «Estudio de carteles» (figuras-retoricas).
 *
 * El alumno recibe un eslogan sencillo de una campaña FICTICIA y lo reescribe
 * con una figura retórica. El cartel cambia y un medidor de impacto dice cuánto
 * le llega al público al que va dirigido. Todas las marcas, campañas y cifras
 * son inventadas: las cifras de impacto son una «simulación», no una medición.
 */

export type FiguraId = "metafora" | "hiperbole" | "prosopopeya" | "ironia" | "hiperbaton";

export interface Perfil {
  emocion: number;
  claridad: number;
  recuerdo: number;
}

export const FIGURAS_SIM: Record<FiguraId, { nombre: string; icono: string; efecto: string; riesgo: string; perfil: Perfil }> = {
  metafora: {
    nombre: "Metáfora",
    icono: "fa-wand-magic-sparkles",
    efecto: "identifica dos cosas por su semejanza y deja una imagen que se recuerda",
    riesgo: "si la semejanza es rebuscada, el mensaje se vuelve confuso",
    perfil: { emocion: 70, claridad: 75, recuerdo: 85 },
  },
  hiperbole: {
    nombre: "Hipérbole",
    icono: "fa-up-right-and-down-left-from-center",
    efecto: "exagera para provocar una emoción intensa",
    riesgo: "si exageras de más, pierdes claridad y credibilidad",
    perfil: { emocion: 88, claridad: 55, recuerdo: 78 },
  },
  prosopopeya: {
    nombre: "Prosopopeya",
    icono: "fa-face-smile",
    efecto: "le da vida humana a un objeto y lo vuelve cercano y simpático",
    riesgo: "si abusas de ella, el cartel suena infantil",
    perfil: { emocion: 80, claridad: 78, recuerdo: 80 },
  },
  ironia: {
    nombre: "Ironía",
    icono: "fa-masks-theater",
    efecto: "dice lo contrario de lo que piensa y busca complicidad con el lector",
    riesgo: "si el público no capta el doble sentido, entiende justo lo contrario",
    perfil: { emocion: 55, claridad: 35, recuerdo: 72 },
  },
  hiperbaton: {
    nombre: "Hipérbaton",
    icono: "fa-shuffle",
    efecto: "altera el orden de las palabras para dar énfasis o musicalidad",
    riesgo: "en un cartel de lectura rápida, el orden raro estorba más de lo que ayuda",
    perfil: { emocion: 40, claridad: 40, recuerdo: 50 },
  },
};

export const ORDEN_FIGURAS: FiguraId[] = ["metafora", "hiperbole", "prosopopeya", "ironia", "hiperbaton"];

export interface Cartel {
  id: string;
  marca: string;
  audiencia: string;
  objetivo: string;
  /** El eslogan sin figura: el punto de partida. */
  base: string;
  /** Qué le importa más a ese público (pesos que suman 1). */
  peso: Perfil;
  prioridad: keyof Perfil;
  /** Impacto mínimo para considerar que el cartel «llega». */
  meta: number;
  foto: string;
  icono: string;
  colores: [string, string];
  versiones: Record<FiguraId, string>;
}

export const CARTELES: Cartel[] = [
  {
    id: "jugo",
    marca: "Jugos Naranjazo (marca inventada)",
    audiencia: "Estudiantes de secundaria en el recreo",
    objetivo: "Que se emocionen y pidan el jugo",
    base: "Nuestro jugo de naranja es muy dulce y muy fresco.",
    peso: { emocion: 0.55, claridad: 0.15, recuerdo: 0.3 },
    prioridad: "emocion",
    meta: 76,
    foto: "cartel-jugo",
    icono: "fa-glass-water",
    colores: ["#FF9A3C", "#FF5E5E"],
    versiones: {
      metafora: "Cada vaso de Naranjazo es un sol embotellado.",
      hiperbole: "Un trago de Naranjazo y te enfrías hasta el Polo Norte.",
      prosopopeya: "El jugo Naranjazo sonríe cuando lo destapas.",
      ironia: "Pésimo plan para el calor: tomar un Naranjazo bien fresquito.",
      hiperbaton: "De naranja fresca el sabor, dulce y brillante, en Naranjazo lo hallarás.",
    },
  },
  {
    id: "biblioteca",
    marca: "Biblioteca Libro Abierto (lugar inventado)",
    audiencia: "Adolescentes que casi no leen",
    objetivo: "Que recuerden la campaña y visiten la biblioteca",
    base: "Leer en la biblioteca te ayuda a aprender y a divertirte.",
    peso: { emocion: 0.25, claridad: 0.25, recuerdo: 0.5 },
    prioridad: "recuerdo",
    meta: 77,
    foto: "cartel-biblioteca",
    icono: "fa-book-open",
    colores: ["#7C5CFF", "#00B4D8"],
    versiones: {
      metafora: "Cada libro es una puerta que se abre hacia otro mundo.",
      hiperbole: "Hay tantas historias aquí que no te alcanzarían mil vidas para leerlas.",
      prosopopeya: "Los libros te esperan en los estantes y susurran que los abras.",
      ironia: "Qué aburrido: en la biblioteca solo hay aventuras, misterios y risas.",
      hiperbaton: "Llena de historias la biblioteca está; entra, que te espera.",
    },
  },
  {
    id: "feria",
    marca: "Feria de Ciencias del Colegio Horizonte (escuela inventada)",
    audiencia: "Familias de todas las edades",
    objetivo: "Que se entienda rápido a qué se invita",
    base: "Ven a la feria de ciencias: hay muchos proyectos de los alumnos.",
    peso: { emocion: 0.25, claridad: 0.55, recuerdo: 0.2 },
    prioridad: "claridad",
    meta: 75,
    foto: "cartel-feria",
    icono: "fa-flask",
    colores: ["#34D399", "#3B82F6"],
    versiones: {
      metafora: "La feria de ciencias es un laboratorio de ideas con las puertas abiertas.",
      hiperbole: "En la feria te esperan un millón de experimentos.",
      prosopopeya: "Los experimentos de la feria te invitan a descubrir sus secretos.",
      ironia: "Qué plan tan inútil: aprender y asombrarte en la feria.",
      hiperbaton: "De ciencia llena, la feria te espera; ven con tu familia.",
    },
  },
];

export const INTENSIDADES = ["Sutil", "Media", "Fuerte"] as const;

const topa = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export interface Medicion extends Perfil {
  impacto: number;
}

/** Impacto simulado de una figura con cierta intensidad (1 sutil … 3 fuerte). */
export function medir(cartel: Cartel, fig: FiguraId, intensidad: number): Medicion {
  const p = FIGURAS_SIM[fig].perfil;
  const d = intensidad - 2;
  const emocion = topa(p.emocion + d * 12);
  const recuerdo = topa(p.recuerdo + d * 6);
  // Cuanto más fuerte, menos claro: la ironía y la hipérbole lo pagan más caro.
  const castigo = fig === "ironia" || fig === "hiperbole" ? 18 : 14;
  const claridad = topa(p.claridad - d * castigo);
  const impacto = topa(emocion * cartel.peso.emocion + claridad * cartel.peso.claridad + recuerdo * cartel.peso.recuerdo);
  return { emocion, claridad, recuerdo, impacto };
}

export interface ResultadoCartel {
  fig: FiguraId;
  nombrada: FiguraId;
  intensidad: number;
  nombreOk: boolean;
  impacto: number;
  impactoOk: boolean;
  puntos: number;
}

const NOMBRE_PRIORIDAD: Record<keyof Perfil, string> = {
  emocion: "la emoción",
  claridad: "la claridad",
  recuerdo: "que se recuerde",
};

/** Explicación de lo que pasó: qué figura usó realmente y por qué funcionó o no. */
export function retroCartel(cartel: Cartel, r: ResultadoCartel, m: Medicion): string[] {
  const f = FIGURAS_SIM[r.fig];
  const lineas: string[] = [];
  if (r.nombreOk) {
    lineas.push(`Acertaste: usaste ${f.nombre.toLowerCase()}. Esta figura ${f.efecto}.`);
  } else {
    lineas.push(`Lo que escribiste es ${f.nombre.toLowerCase()}, no ${FIGURAS_SIM[r.nombrada].nombre.toLowerCase()}. La ${f.nombre.toLowerCase()} ${f.efecto}.`);
  }
  lineas.push(
    `Para este público lo que más pesa es ${NOMBRE_PRIORIDAD[cartel.prioridad]}. Tu cartel sacó emoción ${m.emocion}, claridad ${m.claridad} y recuerdo ${m.recuerdo} (simulación): impacto ${m.impacto} de ${cartel.meta} necesarios.`
  );
  if (!r.impactoOk) {
    const pesa = cartel.prioridad;
    lineas.push(
      m[pesa] < 70
        ? `No llegó: con esta figura ${NOMBRE_PRIORIDAD[pesa]} queda corta; ${f.riesgo}. Prueba otra versión o cambia la intensidad.`
        : `Quedó cerca, pero no alcanza la meta: ${f.riesgo}. Ajusta la intensidad o compara con otra figura.`
    );
  } else {
    lineas.push(`Llegó al público: ${f.efecto}, y eso es justo lo que este cartel necesitaba.`);
  }
  return lineas;
}

export function puntuar(nombreOk: boolean, impactoOk: boolean): number {
  return (nombreOk ? 1 : 0) + (impactoOk ? 1 : 0);
}
