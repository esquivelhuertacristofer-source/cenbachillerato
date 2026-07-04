/**
 * Datos del laboratorio "Taller de hardware y software" (CD-I-P01-A2).
 *
 * Módulo de datos PURO (sin three, sin React): contenido alineado VERBATIM a la
 * lectura A1 «¿Qué hay dentro de mis dispositivos?» de Cultura Digital I,
 * propósito 1 (Ciudadanía digital). Las funciones de cada componente, la
 * distinción hardware/software y los diagnósticos se toman literalmente del
 * texto de la actividad; el quiz comprueba esos mismos conceptos.
 */

export type Cat = "hw" | "sw";

/** Componente interno que el alumno arrastra a su ranura en la tarjeta madre. */
export interface PiezaArmado {
  id: string;
  nombre: string;
  icono: string;
  /** Función del componente, verbatim de la lectura A1. */
  funcion: string;
  /** Etiqueta corta de la ranura destino. */
  ranura: string;
}

/** Pieza que el alumno clasifica como hardware o software. */
export interface ItemClasifica {
  id: string;
  nombre: string;
  icono: string;
  cat: Cat;
  pista: string;
}

/** Síntoma a emparejar con su causa (sección «¿Por qué se traba?»). */
export interface Diagnostico {
  id: string;
  sintoma: string;
  /** id de la causa correcta. */
  causaId: string;
}

export interface Causa {
  id: string;
  texto: string;
}

export interface QuizItem {
  pregunta: string;
  opciones: string[];
  correcta: number;
  retro: string;
}

/* ── Modo «Arma el equipo» ─────────────────────────────────────────────── */
// Los cuatro componentes que la lectura nombra explícitamente, con su función
// literal. El alumno los lleva a su ranura en la tarjeta madre.
export const PIEZAS: PiezaArmado[] = [
  {
    id: "cpu",
    nombre: "Procesador (CPU)",
    icono: "fa-microchip",
    funcion: 'El "cerebro" del dispositivo: ejecuta las instrucciones.',
    ranura: "Socket del procesador",
  },
  {
    id: "ram",
    nombre: "Memoria RAM",
    icono: "fa-memory",
    funcion: "La memoria de trabajo temporal: guarda lo que el procesador necesita en este momento.",
    ranura: "Ranuras de memoria",
  },
  {
    id: "ssd",
    nombre: "Almacenamiento (SSD)",
    icono: "fa-hard-drive",
    funcion: "Guarda los archivos de forma permanente (disco duro, SSD, memoria interna).",
    ranura: "Bahía de almacenamiento",
  },
  {
    id: "gpu",
    nombre: "Tarjeta gráfica (GPU)",
    icono: "fa-display",
    funcion: "Procesa imágenes y videos.",
    ranura: "Ranura de expansión",
  },
];

/* ── Modo «Hardware o software» ────────────────────────────────────────── */
// Hardware = "todo lo que puedes tocar físicamente".
// Software = "el conjunto de programas e instrucciones que le dicen al hardware
// qué hacer": sistema operativo, aplicaciones y controladores.
export const ITEMS: ItemClasifica[] = [
  { id: "pantalla", nombre: "Pantalla", icono: "fa-display", cat: "hw", pista: "Puedes tocarla: es una pieza física." },
  { id: "procesador", nombre: "Procesador (CPU)", icono: "fa-microchip", cat: "hw", pista: "Es un chip físico dentro del equipo." },
  { id: "ram", nombre: "Memoria RAM", icono: "fa-memory", cat: "hw", pista: "Es un módulo físico de memoria." },
  { id: "camara", nombre: "Cámara", icono: "fa-camera", cat: "hw", pista: "Es un componente físico que puedes tocar." },
  { id: "microfono", nombre: "Micrófono", icono: "fa-microphone", cat: "hw", pista: "Es una pieza física del dispositivo." },
  { id: "disco", nombre: "Disco / SSD", icono: "fa-hard-drive", cat: "hw", pista: "Es el almacenamiento físico." },
  { id: "so", nombre: "Sistema operativo (Android, iOS, Windows, Linux)", icono: "fa-gears", cat: "sw", pista: "Es un programa que coordina el hardware: no se toca." },
  { id: "whatsapp", nombre: "WhatsApp (aplicación)", icono: "fa-comment-dots", cat: "sw", pista: "Es una aplicación: un programa, no una pieza." },
  { id: "youtube", nombre: "YouTube (aplicación)", icono: "fa-circle-play", cat: "sw", pista: "Es una aplicación instalada, no algo físico." },
  { id: "calculadora", nombre: "Calculadora (aplicación)", icono: "fa-calculator", cat: "sw", pista: "Es un programa que corre sobre el hardware." },
  { id: "drivers", nombre: "Controladores (drivers)", icono: "fa-plug", cat: "sw", pista: "Son instrucciones que conectan el hardware con los programas." },
  { id: "navegador", nombre: "Navegador web (aplicación)", icono: "fa-compass", cat: "sw", pista: "Es una aplicación: software, no hardware." },
];

export const CAT_INFO: Record<Cat, { label: string; descripcion: string; icono: string; color: string }> = {
  hw: {
    label: "Hardware",
    descripcion: "Todo lo que puedes tocar físicamente.",
    icono: "fa-microchip",
    color: "#5BA8FF",
  },
  sw: {
    label: "Software",
    descripcion: "Programas e instrucciones que le dicen al hardware qué hacer.",
    icono: "fa-code",
    color: "#F2A33C",
  },
};

/* ── Modo «¿Por qué se traba?» ─────────────────────────────────────────── */
// Tomado de: "saber por qué tu celular se traba (poca RAM o procesador lento),
// por qué se llena el almacenamiento, o por qué algunas apps consumen más
// batería."
export const CAUSAS: Causa[] = [
  { id: "c-ram", texto: "Tiene poca RAM o un procesador lento." },
  { id: "c-disco", texto: "El almacenamiento permanente está saturado de archivos." },
  { id: "c-bateria", texto: "Esa app usa más el procesador y otros recursos." },
];

export const DIAGNOSTICOS: Diagnostico[] = [
  { id: "d-traba", sintoma: 'El celular "se traba" al abrir muchas apps a la vez.', causaId: "c-ram" },
  { id: "d-lleno", sintoma: 'Ya no puedes guardar fotos: aparece "almacenamiento lleno".', causaId: "c-disco" },
  { id: "d-bateria", sintoma: "Una app concreta agota la batería mucho más rápido.", causaId: "c-bateria" },
];

/* ── Cuestionario de comprensión (verbatim del concepto de A1) ─────────── */
export const QUIZ: QuizItem[] = [
  {
    pregunta: "¿Qué es el hardware?",
    opciones: [
      "Todo lo que puedes tocar físicamente",
      "Los programas e instrucciones del equipo",
      "Solo el sistema operativo",
      "Las páginas de internet que visitas",
    ],
    correcta: 0,
    retro: "El hardware es todo lo que puedes tocar físicamente: pantalla, procesador, memoria, almacenamiento, cámara, micrófono.",
  },
  {
    pregunta: "¿Cuál es la función del procesador (CPU)?",
    opciones: [
      'Es el "cerebro": ejecuta las instrucciones',
      "Guarda los archivos de forma permanente",
      "Procesa imágenes y videos",
      "Conecta el hardware con los programas",
    ],
    correcta: 0,
    retro: 'El procesador (CPU) es el "cerebro" del dispositivo: ejecuta las instrucciones.',
  },
  {
    pregunta: "¿Qué hace la memoria RAM?",
    opciones: [
      "Es la memoria de trabajo temporal",
      "Guarda los archivos de forma permanente",
      "Es el sistema operativo",
      "Es una aplicación de mensajería",
    ],
    correcta: 0,
    retro: "La RAM es la memoria de trabajo temporal: guarda lo que el procesador necesita en este momento.",
  },
  {
    pregunta: "¿Cuál de estos es software?",
    opciones: [
      "El sistema operativo (Android, iOS, Windows)",
      "La pantalla",
      "La memoria RAM",
      "El micrófono",
    ],
    correcta: 0,
    retro: "El software son los programas e instrucciones: el sistema operativo, las aplicaciones y los controladores.",
  },
  {
    pregunta: '¿Por qué un celular "se traba"?',
    opciones: [
      "Porque tiene poca RAM o un procesador lento",
      "Porque tiene demasiada batería",
      "Porque la pantalla es muy grande",
      "Porque usa un navegador web",
    ],
    correcta: 0,
    retro: 'Entender los componentes ayuda a saber por qué un celular "se traba": poca RAM o procesador lento.',
  },
];

/** Dato verbatim del callout de A1 (ENDUTIH, INEGI 2023). */
export const DATO_ENDUTIH =
  "Según la ENDUTIH (INEGI, 2023), el 78.6% de los mexicanos de 6 años y más usa internet, con una brecha entre zonas urbanas (86.7%) y rurales.";
