/**
 * Datos para el laboratorio "La célula en 3D: organelos y funciones"
 * (CNEYT-VI-P02-A1, infografía "Células procariota y eucariota: organelos y
 * funciones"; UAC CNEYT-VI; progresión 2 "Explica la estructura y función de la
 * célula: procariota y eucariota, animal y vegetal").
 *
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabCelula.tsx) y la escena 3D (CelulaScene.tsx).
 *
 * Tres modos (tipos de célula):
 *  (a) "animal"     — eucariota animal: núcleo, mitocondria, RE, Golgi,
 *      lisosomas, ribosomas. Sin pared celular.
 *  (b) "vegetal"    — eucariota vegetal: lo de la animal + pared de celulosa,
 *      cloroplastos y vacuola central.
 *  (c) "procariota" — sin núcleo: ADN circular en el citoplasma (nucleoide),
 *      ribosomas, membrana y pared. Sin organelos membranosos.
 *
 * Las definiciones y ejemplos de los organelos del glosario A5 (núcleo,
 * mitocondria, cloroplasto, RE, Golgi) son VERBATIM. Los demás organelos
 * (membrana, pared, ribosomas, lisosomas, vacuola, nucleoide) se describen con
 * base en la infografía A1. La comparación procariota/eucariota y los tamaños
 * son verbatim de A5 y A1 respectivamente.
 */

import type { QuizEvaluable } from "./_reto-quiz";

export type Modo = "animal" | "vegetal" | "procariota";

/** Forma esquemática con la que la escena 3D dibuja cada organelo. */
export type Forma =
  | "membrana"
  | "pared"
  | "nucleo"
  | "mitocondria"
  | "cloroplasto"
  | "re"
  | "golgi"
  | "ribosomas"
  | "lisosoma"
  | "vacuola"
  | "nucleoide";

export interface OrganeloDef {
  id: string;
  nombre: string;
  forma: Forma;
  color: string;
  icono: string;             // FontAwesome
  /** ¿en qué tipos de célula está presente? */
  modos: Modo[];
  /** función — verbatim del glosario A5 cuando aplica; si no, basada en A1 */
  funcion: string;
  ejemplo?: string;          // verbatim del glosario A5 cuando aplica
  /** "A5" = definición verbatim del glosario; "A1" = basada en la infografía */
  fuente: "A5" | "A1";
}

/* ── Organelos ────────────────────────────────────────────────────────────── */
export const ORGANELOS: OrganeloDef[] = [
  {
    id: "membrana",
    nombre: "Membrana plasmática",
    forma: "membrana",
    color: "#94a3b8",
    icono: "fa-circle-notch",
    modos: ["animal", "vegetal", "procariota"],
    funcion:
      "Capa que delimita la célula y controla qué entra y qué sale. La poseen TODAS las células, tanto procariotas como eucariotas. En la infografía A1 aparece etiquetada en ambos tipos de célula.",
    fuente: "A1",
  },
  {
    id: "pared",
    nombre: "Pared celular",
    forma: "pared",
    color: "#a3e635",
    icono: "fa-border-all",
    modos: ["vegetal", "procariota"],
    funcion:
      "Cubierta rígida por fuera de la membrana que da forma y protección. En las células vegetales es de celulosa; las procariotas también la tienen. Las células animales NO tienen pared celular.",
    fuente: "A1",
  },
  {
    id: "nucleo",
    nombre: "Núcleo celular",
    forma: "nucleo",
    color: "#a855f7",
    icono: "fa-circle-dot",
    modos: ["animal", "vegetal"],
    funcion:
      "Organelo rodeado por la envoltura nuclear (doble membrana con poros). Contiene el ADN genómico organizado en cromosomas y es el sitio de la replicación del ADN y la transcripción del ARN.",
    ejemplo:
      "En una célula humana, el núcleo contiene 46 cromosomas (23 pares homólogos) con toda la información genética del individuo.",
    fuente: "A5",
  },
  {
    id: "mitocondria",
    nombre: "Mitocondria",
    forma: "mitocondria",
    color: "#f97316",
    icono: "fa-bolt",
    modos: ["animal", "vegetal"],
    funcion:
      "Organelo con doble membrana (externa lisa e interna plegada en crestas) donde se lleva a cabo la respiración celular aerobia. Produce la mayor parte del ATP celular mediante la cadena de transporte de electrones.",
    ejemplo:
      "Una célula muscular activa puede tener miles de mitocondrias para satisfacer su alta demanda energética durante el ejercicio.",
    fuente: "A5",
  },
  {
    id: "cloroplasto",
    nombre: "Cloroplasto",
    forma: "cloroplasto",
    color: "#22c55e",
    icono: "fa-leaf",
    modos: ["vegetal"],
    funcion:
      "Organelo exclusivo de células vegetales y algas con doble membrana y un sistema interno de tilacoides apilados (grana) en el estroma. Es el sitio de la fotosíntesis: convierte luz solar, CO₂ y H₂O en glucosa y O₂.",
    ejemplo:
      "Las hojas verdes contienen cloroplastos con clorofila que absorbe luz roja y azul; la luz verde es reflejada, por eso las plantas se ven verdes.",
    fuente: "A5",
  },
  {
    id: "re",
    nombre: "Retículo endoplasmático (RE)",
    forma: "re",
    color: "#38bdf8",
    icono: "fa-diagram-project",
    modos: ["animal", "vegetal"],
    funcion:
      "Red de membranas continua con el núcleo. El RE rugoso (con ribosomas) sintetiza y procesa proteínas de secreción o de membrana. El RE liso (sin ribosomas) sintetiza lípidos y desintoxica compuestos.",
    ejemplo:
      "Las células del páncreas que secretan enzimas digestivas tienen un RE rugoso muy desarrollado.",
    fuente: "A5",
  },
  {
    id: "golgi",
    nombre: "Aparato de Golgi",
    forma: "golgi",
    color: "#fbbf24",
    icono: "fa-layer-group",
    modos: ["animal", "vegetal"],
    funcion:
      "Sistema de sacos membranosos apilados (cisternas) que recibe proteínas del RE, las modifica (glucosilación, corte), clasifica y empaqueta en vesículas para enviarlas a su destino: membrana plasmática, lisosomas o secreción.",
    ejemplo:
      "El aparato de Golgi procesa las proteínas de anticuerpos en los linfocitos B y las empaqueta para su secreción.",
    fuente: "A5",
  },
  {
    id: "ribosomas",
    nombre: "Ribosomas",
    forma: "ribosomas",
    color: "#e2e8f0",
    icono: "fa-circle",
    modos: ["animal", "vegetal", "procariota"],
    funcion:
      "Estructuras encargadas de la síntesis de proteínas. En las células procariotas son de tipo 70S y en las eucariotas de tipo 80S; pueden estar libres en el citoplasma o adheridos al retículo endoplasmático rugoso.",
    fuente: "A1",
  },
  {
    id: "lisosoma",
    nombre: "Lisosomas",
    forma: "lisosoma",
    color: "#f472b6",
    icono: "fa-droplet",
    modos: ["animal"],
    funcion:
      "Vesículas con enzimas digestivas que degradan desechos y material gastado de la célula. Forman parte de las células eucariotas animales (no aparecen en la infografía de la célula vegetal).",
    fuente: "A1",
  },
  {
    id: "vacuola",
    nombre: "Vacuola central",
    forma: "vacuola",
    color: "#60a5fa",
    icono: "fa-water",
    modos: ["vegetal"],
    funcion:
      "Gran saco lleno de agua y sustancias propio de la célula vegetal; puede ocupar hasta el 90 % del volumen celular y mantiene la turgencia de la planta.",
    fuente: "A1",
  },
  {
    id: "nucleoide",
    nombre: "ADN circular (nucleoide)",
    forma: "nucleoide",
    color: "#c084fc",
    icono: "fa-dna",
    modos: ["procariota"],
    funcion:
      "Las células procariotas NO tienen núcleo: su ADN es una sola molécula circular que flota en el citoplasma (nucleoide). Las eucariotas, en cambio, tienen ADN lineal empaquetado en cromosomas dentro del núcleo.",
    fuente: "A1",
  },
];

/** Organelos presentes en un tipo de célula, en orden de aparición. */
export function organelosDe(modo: Modo): OrganeloDef[] {
  return ORGANELOS.filter((o) => o.modos.includes(modo));
}

export function organeloPorId(id: string): OrganeloDef | undefined {
  return ORGANELOS.find((o) => o.id === id);
}

/* ── Definición de cada tipo de célula ────────────────────────────────────── */
export interface CelulaDef {
  id: Modo;
  etq: string;
  subtitulo: string;
  icono: string;
  color: string;
  /** ¿tiene núcleo verdadero? */
  conNucleo: boolean;
  /** ¿tiene pared celular? */
  conPared: boolean;
  tamano: string;          // verbatim de la barra de tamaño de A1
  descripcion: string;     // basada en los puntos clave de A1
}

export const CELULAS: Record<Modo, CelulaDef> = {
  animal: {
    id: "animal",
    etq: "Eucariota animal",
    subtitulo: "Con núcleo · sin pared celular",
    icono: "fa-paw",
    color: "#f472b6",
    conNucleo: true,
    conPared: false,
    tamano: "10–100 μm",
    descripcion:
      "Núcleo con envoltura nuclear doble, mitocondrias, retículo endoplasmático rugoso y liso, aparato de Golgi, lisosomas y centrosoma. Sin pared celular.",
  },
  vegetal: {
    id: "vegetal",
    etq: "Eucariota vegetal",
    subtitulo: "Con núcleo · pared de celulosa · cloroplastos",
    icono: "fa-seedling",
    color: "#22c55e",
    conNucleo: true,
    conPared: true,
    tamano: "10–100 μm",
    descripcion:
      "Además de los organelos de la animal, tiene pared celular de celulosa, cloroplastos (fotosíntesis) y una vacuola central que puede ocupar el 90 % del volumen. Los cloroplastos tienen su propio ADN circular.",
  },
  procariota: {
    id: "procariota",
    etq: "Procariota",
    subtitulo: "Sin núcleo · ADN circular flotante",
    icono: "fa-bacterium",
    color: "#38bdf8",
    conNucleo: false,
    conPared: true,
    tamano: "0.5–5 μm",
    descripcion:
      "Sin núcleo, sin organelos membranosos, ADN circular flotante en el citoplasma, reproducción por fisión binaria. Incluye Bacteria y Archaea. Es el tipo de célula más antiguo (~3,500 millones de años).",
  },
};

export const MODOS: Modo[] = ["animal", "vegetal", "procariota"];

/* ── Comparación procariota vs eucariota (verbatim del glosario A5) ────────── */
export interface FilaComparacion { caracteristica: string; procariota: string; eucariota: string }
export const COMPARACION: FilaComparacion[] = [
  { caracteristica: "Núcleo", procariota: "Sin núcleo membranoso", eucariota: "Núcleo con envoltura nuclear" },
  { caracteristica: "ADN", procariota: "ADN circular en nucleoide", eucariota: "ADN lineal en cromosomas" },
  { caracteristica: "Ribosomas", procariota: "70S", eucariota: "80S" },
  { caracteristica: "Organelos", procariota: "Sin organelos membranosos", eucariota: "Organelos especializados" },
  { caracteristica: "Tamaño", procariota: "~0.5–5 µm", eucariota: "~10–100 µm" },
];

/* ── Barra de tamaño (verbatim de A1, descripción accesible) ───────────────── */
export interface TamanoDef { etq: string; rango: string; micras: number; color: string }
export const TAMANOS: TamanoDef[] = [
  { etq: "Procariota", rango: "0.5–5 μm", micras: 5, color: "#38bdf8" },
  { etq: "Eucariota animal", rango: "10–100 μm", micras: 100, color: "#f472b6" },
  { etq: "Eucariota vegetal", rango: "10–100 μm", micras: 100, color: "#22c55e" },
];

/* ── Texto: descripción del laboratorio ───────────────────────────────────── */
export const PROBLEMA =
  "Visor 3D de la célula: gira la cámara y haz clic en cada organelo para descubrir su función. Cambia entre la célula eucariota animal, la eucariota vegetal y la procariota para comparar qué estructuras comparten y cuáles son exclusivas. La procariota no tiene núcleo (su ADN circular flota en el citoplasma); la vegetal añade pared de celulosa, cloroplastos y una vacuola central. Es la infografía A1 hecha manipulable en 3D.";

/* ── Instrucciones (basadas en la infografía A1 y el glosario A5) ──────────── */
export const INSTRUCCIONES: string[] = [
  "Elige un tipo de célula (animal, vegetal o procariota) en las pestañas de arriba.",
  "Gira la escena con el ratón y haz clic en cualquier organelo: su nombre y su función aparecen en el panel.",
  "Compara la célula animal con la vegetal: localiza la pared celular, los cloroplastos y la vacuola central que solo tiene la vegetal.",
  "Cambia a la procariota y observa que NO tiene núcleo: su ADN es circular y flota en el citoplasma (nucleoide).",
  "Fíjate en las mitocondrias y los cloroplastos: ambos tienen ADN circular propio, evidencia de la teoría endosimbiótica.",
  "Usa la barra de tamaño para dimensionar: la procariota mide 0.5–5 μm y la eucariota 10–100 μm.",
];

/* ── Preguntas de reflexión (verbatim de A1) ──────────────────────────────── */
export const PREGUNTAS: string[] = [
  "El ajolote puede regenerar una extremidad completa sin cicatriz. Los humanos también tenemos todas las células necesarias para ello, pero no lo hacemos. ¿Qué diferencia a nivel celular y molecular podría explicar por qué el ajolote regenera y nosotros no?",
  "La teoría endosimbiótica propone que las mitocondrias fueron bacterias engullidas hace 2,000 millones de años. ¿Qué evidencias observables en las mitocondrias hoy apoyan esta teoría? ¿Cómo cambiaría nuestra comprensión de la vida si la teoría fuera incorrecta?",
  "El ajolote está en peligro crítico en Xochimilco por urbanización y contaminación, pero hay colonias estables en laboratorios del mundo. ¿Es suficiente con preservar la especie en cautiverio? ¿Qué se pierde con la extinción silvestre desde el punto de vista ecológico y evolutivo?",
];

/* ── Ideas clave (verbatim de los puntos clave de A1) ─────────────────────── */
export const IDEAS: string[] = [
  "Todos los seres vivos están formados por células. Las procariotas (sin núcleo definido) son las más antiguas (~3,500 millones de años); las eucariotas (con núcleo rodeado por membrana) surgieron hace ~2,000 millones de años.",
  "Procariotas: sin núcleo, sin organelos membranosos, ADN circular flotante en el citoplasma, reproducción por fisión binaria, diámetro de 0.5–5 μm. Incluyen Bacteria y Archaea; las del microbioma intestinal (~38 billones) superan en número a las propias células humanas.",
  "Eucariotas animales: núcleo con envoltura nuclear doble, mitocondrias, retículo endoplasmático rugoso y liso, aparato de Golgi, lisosomas y centrosoma. Sin pared celular.",
  "Eucariotas vegetales: además de los organelos animales, tienen pared celular de celulosa, cloroplastos (fotosíntesis) y una vacuola central que puede ocupar el 90 % del volumen. Los cloroplastos tienen su propio ADN circular.",
  "El ajolote (Ambystoma mexicanum), endémico de Xochimilco (CDMX), es un modelo científico global de regeneración celular: puede regenerar extremidades, ojos, médula espinal e incluso partes del corazón sin cicatriz.",
  "La UNAM secuenció el genoma del ajolote —el más grande conocido, con 32,000 millones de pares de bases, 10 veces más que el humano—; sus genes de regeneración son candidatos para terapias en lesiones de médula e infartos.",
  "La mitocondria produce ATP por respiración aeróbica y tiene su propio ADN, heredado solo por vía materna. El CINVESTAV estudia disfunciones mitocondriales en diabetes tipo 2 y enfermedades cardiovasculares.",
  "Teoría endosimbiótica de Lynn Margulis (1967): mitocondrias y cloroplastos fueron bacterias engullidas pero no digeridas. Evidencias: ADN circular propio, se reproducen independientemente y tienen el tamaño de bacterias actuales.",
];

/* ── Glosario (verbatim del glosario de A1) ───────────────────────────────── */
export const GLOSARIO: { termino: string; definicion: string }[] = [
  { termino: "Organelo", definicion: "Estructura interna especializada de una célula eucariota, análoga a un órgano en el cuerpo. Realiza una función específica: mitocondria (energía), núcleo (genoma), ribosoma (síntesis de proteínas), aparato de Golgi (empaque y envío de proteínas)." },
  { termino: "Núcleo celular", definicion: "Organelo rodeado por una doble membrana (envoltura nuclear) que contiene el ADN lineal empaquetado en cromosomas. Es el centro de control de la célula eucariota. Las células procariotas no tienen núcleo: su ADN circular flota en el citoplasma." },
  { termino: "Mitocondria", definicion: "Organelo de la célula eucariota que produce ATP mediante respiración celular aeróbica. Posee ADN circular propio, evidencia de su origen bacteriano. Las células con mayor demanda energética (músculo cardiaco, neuronas) contienen cientos o miles de mitocondrias." },
  { termino: "Endosimbiosis", definicion: "Relación en la que una célula vive dentro de otra de forma mutuamente beneficiosa. La teoría endosimbiótica propone que mitocondrias y cloroplastos fueron bacterias que establecieron endosimbiosis con células eucariotas ancestrales hace más de 2,000 millones de años." },
  { termino: "Fisión binaria", definicion: "Forma de reproducción asexual de las células procariotas: la célula duplica su ADN y se divide en dos células hijas genéticamente idénticas. Bajo condiciones ideales, algunas bacterias se dividen cada 20 minutos." },
];

/* ── Contexto y fuente (verbatim de A1) ───────────────────────────────────── */
export const CONTEXTO =
  "El ajolote (Ambystoma mexicanum) es quizás el animal de mayor importancia científica endémico de México. Habita exclusivamente los canales de Xochimilco, un ecosistema lacustre que ha perdido el 90% de su extensión original por urbanización, contaminación y especies invasoras (carpa y tilapia). Un censo del Instituto de Biología de la UNAM en 2023 registró menos de 1,000 individuos silvestres —colapso desde más de 6,000 ajolotes por km² en los años 1980. La paradoja es aguda: el ajolote es uno de los animales más estudiados del mundo en biología celular, pero en su hábitat natural está al borde de la extinción.";

export const FUENTE =
  "Instituto de Biología UNAM — Genoma del Ajolote y Biología de la Regeneración 2023; CINVESTAV — Líneas de Investigación en Biología Celular y Molecular 2023.";

/* ── Datos rápidos (tarjetas, verbatim de A1) ─────────────────────────────── */
export const DATOS: { valor: string; texto: string; icono: string }[] = [
  { valor: "32,000 M", texto: "pares de bases en el genoma del ajolote (10× el humano)", icono: "fa-dna" },
  { valor: "~38 billones", texto: "bacterias del microbioma intestinal humano", icono: "fa-bacterium" },
  { valor: "0.5–100 μm", texto: "rango de tamaño: procariota a eucariota", icono: "fa-ruler-horizontal" },
  { valor: "2,000 M años", texto: "antigüedad de la endosimbiosis (Margulis, 1967)", icono: "fa-clock-rotate-left" },
];

/* ── Reto evaluable: quiz A2 «Quiz: Tipos de células y organelos» (VERBATIM) ── */
export const QUIZ_A2: QuizEvaluable = {
  titulo: "Quiz: Tipos de células y organelos",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "¿Cuál es la principal diferencia entre una célula procariota y una eucariota?",
      opciones: [
        "La procariota tiene mitocondrias y la eucariota no",
        "La eucariota tiene núcleo definido con membrana nuclear; la procariota no",
        "La procariota tiene cloroplastos y la eucariota no",
        "La eucariota carece de membrana celular",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "La presencia de núcleo rodeado por membrana nuclear es la característica definitoria de las células eucariotas. Las procariotas tienen ADN circular en el nucleoide sin membrana que lo rodee.",
    },
    {
      enunciado: "¿Qué organelo produce la mayor parte del ATP en la célula eucariota?",
      opciones: ["Ribosoma", "Retículo endoplásmico", "Mitocondria", "Aparato de Golgi"],
      respuestaCorrecta: 2,
      retroalimentacion:
        "La mitocondria es el sitio de la respiración aerobia y produce ~32-34 ATP por glucosa mediante la cadena transportadora de electrones y la ATP sintasa.",
    },
    {
      enunciado: "¿Qué evidencia apoya la teoría endosimbiótica de Lynn Margulis?",
      opciones: [
        "Las mitocondrias no tienen membrana propia",
        "Las mitocondrias tienen ADN propio y ribosomas 70S similares a los de bacterias",
        "El cloroplasto no puede reproducirse de forma independiente",
        "Las células procariotas no tienen pared celular",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "Las mitocondrias (y cloroplastos) tienen doble membrana, ADN circular propio y ribosomas 70S como las bacterias, lo que sugiere que fueron bacterias ancestrales incorporadas por endosimbiosis.",
    },
    {
      enunciado: "¿Cuál es la función principal del aparato de Golgi?",
      opciones: [
        "Síntesis de ATP",
        "Procesamiento, empaque y distribución de proteínas y lípidos",
        "Digestión intracelular de desechos",
        "Síntesis de ARN mensajero",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "El aparato de Golgi recibe vesículas del retículo endoplásmico, modifica y empaca las proteínas y lípidos, y los dirige a su destino final: membrana plasmática, lisosomas o secreción.",
    },
    {
      enunciado: "¿Qué organelo realizan exclusivamente las células vegetales y algunas algas?",
      opciones: ["Lisosoma", "Mitocondria", "Cloroplasto", "Vacuola pequeña"],
      respuestaCorrecta: 2,
      retroalimentacion:
        "El cloroplasto es exclusivo de células vegetales y algas fotosintéticas; contiene clorofila y es el sitio de la fotosíntesis. Las mitocondrias están presentes en casi todas las células eucariotas.",
    },
  ],
};
