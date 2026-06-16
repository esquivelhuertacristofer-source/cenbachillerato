/**
 * bienvenida.ts — Configuración del video de bienvenida por semestre.
 *
 * Mientras `url` sea null, el hero muestra un póster/placeholder honesto
 * ("Próximamente"). Al registrar un URL real (YouTube/Vimeo embed o un .mp4
 * en /public/videos/...), el reproductor aparece solo, sin tocar el componente.
 */

export type VideoBienvenidaTipo = "embed" | "file";

export interface VideoBienvenida {
  /** URL del video. null = aún no hay video → se muestra el placeholder. */
  url: string | null;
  /** "embed" para iframe (YouTube/Vimeo), "file" para <video> nativo. */
  tipo: VideoBienvenidaTipo;
  /** Imagen de póster opcional (ruta en /public). null = gradiente diseñado. */
  poster: string | null;
  /** Texto que acompaña al reproductor/placeholder. */
  titulo: string;
  /** Resumen explicativo del semestre */
  descripcion?: string;
  /** Lista de objetivos pedagógicos principales */
  objetivos?: string[];
  /** Laboratorios 3D destacados en este semestre */
  laboratorios?: {
    slug: string;
    titulo: string;
    uac: string;
  }[];
}

/** Registro por semestre con videos educativos y mapa del semestre */
const VIDEOS_BIENVENIDA: Record<number, VideoBienvenida> = {
  1: {
    url: "https://www.youtube.com/embed/fNZa81zU1Vw",
    tipo: "embed",
    poster: null,
    titulo: "Bienvenida e Introducción a las Ciencias y el Pensamiento Lógico",
    descripcion: "En este primer semestre explorarás las bases de la materia, los modelos atómicos y los fundamentos del razonamiento lógico matemático y de la ciudadanía digital.",
    objetivos: [
      "Comprender la estructura íntima de la materia, los modelos atómicos y las fases de la materia (CNEYT-I).",
      "Desarrollar el razonamiento lógico, la teoría de conjuntos y el lenguaje aritmético/algebraico (PM-I).",
      "Fomentar el uso seguro, crítico y creativo de las herramientas digitales (CD-I).",
      "Consolidar la comunicación escrita y la comprensión lectora en español e inglés."
    ],
    laboratorios: [
      { slug: "estados-materia", titulo: "Estados de la materia", uac: "CNEYT-I" },
      { slug: "modelos-atomicos", titulo: "Modelos atómicos", uac: "CNEYT-I" },
      { slug: "densidad", titulo: "Densidad y Flotación", uac: "CNEYT-I" }
    ]
  },
  2: {
    url: "https://www.youtube.com/embed/8F6v31GvRrs",
    tipo: "embed",
    poster: null,
    titulo: "Bienvenida y Panorama de Energía, Termodinámica y Álgebra",
    descripcion: "En este segundo ciclo daremos el salto hacia el comportamiento dinámico de la naturaleza: la energía, la termodinámica, los gases y el modelado algebraico.",
    objetivos: [
      "Analizar las leyes termodinámicas, la entropía y las formas de propagación del calor (CNEYT-II).",
      "Dominar las ecuaciones lineales, inecuaciones y el concepto matemático de función (PM-II).",
      "Avanzar en la ciudadanía digital, creación de algoritmos y programación básica (CD-II).",
      "Desarrollar la redacción argumentativa y la expresión analítica."
    ],
    laboratorios: [
      { slug: "gas-ideal-piston", titulo: "Gas Ideal (Pistón 3D)", uac: "CNEYT-II" },
      { slug: "propagacion-calor", titulo: "Propagación del Calor", uac: "CNEYT-II" },
      { slug: "sistemas-ecuaciones-2x2", titulo: "Sistemas de Ecuaciones", uac: "PM-II" }
    ]
  },
  3: {
    url: "https://www.youtube.com/embed/E8Z_wskdCiw",
    tipo: "embed",
    poster: null,
    titulo: "Bienvenida y Panorama de Ecosistemas y Geometría Plana",
    descripcion: "Estudiaremos los ecosistemas, el ciclo del carbono y las redes de flujo de energía. En matemáticas abordaremos la geometría y la estructura de reacciones químicas.",
    objetivos: [
      "Comprender el funcionamiento de los ecosistemas, biomas, flujo trófico y el ciclo del carbono (CNEYT-III).",
      "Explorar las propiedades del espacio, congruencia, semejanza y el Teorema de Pitágoras (PM-III).",
      "Analizar la historia social y el desarrollo de la conciencia histórica mexicana (CH-I).",
      "Expandir el vocabulario técnico y la fluidez comunicativa en inglés."
    ],
    laboratorios: [
      { slug: "teorema-pitagoras", titulo: "Teorema de Pitágoras", uac: "PM-III" },
      { slug: "ciclo-carbono", titulo: "Ciclo del Carbono", uac: "CNEYT-III" },
      { slug: "ecuacion-recta", titulo: "Ecuación de la Recta", uac: "PM-III" }
    ]
  },
  4: {
    url: "https://www.youtube.com/embed/P35c_M5t-Y8",
    tipo: "embed",
    poster: null,
    titulo: "Bienvenida y Panorama de Química y Trigonometría",
    descripcion: "Abordaremos la química orgánica y de reacciones redox junto con las secciones cónicas y funciones trigonométricas en el círculo unitario.",
    objetivos: [
      "Estudiar el balance redox, el equilibrio químico, y la bioquímica del metabolismo celular (CNEYT-IV).",
      "Analizar las secciones cónicas (parábola, elipse, hipérbola) y las razones trigonométricas (PM-IV).",
      "Examinar los procesos sociohistóricos y la conciencia colectiva contemporánea (CH-II).",
      "Expresar hipótesis complejas y consolidar habilidades formales en inglés."
    ],
    laboratorios: [
      { slug: "redox-combustion", titulo: "Reacciones Redox", uac: "CNEYT-IV" },
      { slug: "equilibrio-quimico", titulo: "Equilibrio Químico", uac: "CNEYT-IV" },
      { slug: "circulo-unitario", titulo: "Círculo Unitario", uac: "PM-IV" }
    ]
  },
  5: {
    url: "https://www.youtube.com/embed/w3F6wG4a2S4",
    tipo: "embed",
    poster: null,
    titulo: "Bienvenida y Panorama de Cálculo Diferencial y Leyes Físicas",
    descripcion: "Entramos a la física clásica de Newton y la cinemática, junto con los límites, derivadas y la optimización del cálculo diferencial.",
    objetivos: [
      "Estudiar el movimiento (cinemática), las leyes de Newton, fluidos y el electromagnetismo (CNEYT-V).",
      "Comprender el concepto de límite, continuidad, y la derivada como tasa de cambio (PM-V).",
      "Analizar los procesos globales económicos y las estructuras del estado mexicano (CH-III).",
      "Desarrollar la escritura científica y técnica en español e inglés."
    ],
    laboratorios: [
      { slug: "teorema-fundamental-calculo", titulo: "Teorema Fundamental", uac: "PM-V" },
      { slug: "mrua-acelerar-frenar", titulo: "Cinemática 1D", uac: "CNEYT-V" },
      { slug: "fluidos", titulo: "Comportamiento de Fluidos", uac: "CNEYT-V" }
    ]
  },
  6: {
    url: "https://www.youtube.com/embed/8o0e17mB-y0",
    tipo: "embed",
    poster: null,
    titulo: "Bienvenida y Panorama de Biología Molecular y Estadística",
    descripcion: "Consolidaremos tu bachillerato analizando el código genético (ADN) y la herencia, junto con la inferencia estadística y la campana de Gauss.",
    objetivos: [
      "Comprender la estructura del ADN, la síntesis de proteínas y la división celular (CNEYT-VI).",
      "Dominar la estadística descriptiva, la distribución normal y la teoría de conjuntos (PM-VI).",
      "Diseñar soluciones algorítmicas y proyectos digitales avanzados de software (CD-III).",
      "Completar el perfil de egreso y la transición académica a la educación superior."
    ],
    laboratorios: [
      { slug: "distribucion-normal", titulo: "Distribución Normal", uac: "PM-VI" },
      { slug: "division-celular", titulo: "Mitosis y Meiosis", uac: "CNEYT-VI" },
      { slug: "adn-dogma-central-3d", titulo: "ADN y Dogma Central", uac: "CNEYT-VI" }
    ]
  }
};

export function getVideoBienvenida(semestre: number): VideoBienvenida {
  return (
    VIDEOS_BIENVENIDA[semestre] ?? {
      url: null,
      tipo: "embed",
      poster: null,
      titulo: "Mensaje de bienvenida",
    }
  );
}
