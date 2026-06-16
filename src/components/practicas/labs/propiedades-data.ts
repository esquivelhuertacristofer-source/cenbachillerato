/**
 * Datos para el laboratorio de Propiedades y cambios de la materia (CNEYT-I-P02).
 *
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabPropiedadesMateria.tsx) y la escena 3D (PropiedadesMateriaScene.tsx) sin
 * arrastrar three.js al bundle del shell.
 *
 * Idea pedagógica: distinguir un CAMBIO FÍSICO (la sustancia sigue siendo la
 * misma: solo cambia su forma, tamaño o estado; suele ser reversible) de un
 * CAMBIO QUÍMICO (se forman SUSTANCIAS NUEVAS: hay evidencia como gas, cambio de
 * color, calor o ceniza, y no se revierte). El estudiante aplica la
 * transformación, observa la evidencia y la clasifica.
 */

export type TipoCambio = "fisico" | "quimico";

/** Cómo se comporta visualmente la muestra al transformarse. */
export type Modo = "estado" | "fragmenta" | "gas" | "reaccion";

/** Qué emite la muestra durante la transformación. */
export type Emision = "ninguno" | "humo" | "burbujas";

export interface Transformacion {
  key: string;
  nombre: string;
  icono: string; // Font Awesome 6
  sustancia: string;
  tipo: TipoCambio; // respuesta correcta
  /* — parámetros visuales para la escena 3D — */
  modo: Modo;
  colorInicial: string;
  colorFinal: string;
  emite: Emision;
  flama: boolean; // se aplica calor (mechero encendido)
  /* — pedagogía — */
  reversible: boolean;
  evidencia: string;
  explica: string;
}

export const TRANSFORMACIONES: Transformacion[] = [
  {
    key: "fundir-hielo",
    nombre: "Fundir hielo",
    icono: "fa-icicles",
    sustancia: "Hielo (agua sólida)",
    tipo: "fisico",
    modo: "estado",
    colorInicial: "#CDE7FF",
    colorFinal: "#4FB0E8",
    emite: "ninguno",
    flama: true,
    reversible: true,
    evidencia: "Pasa de sólido a líquido, pero sigue siendo agua.",
    explica:
      "Al fundirse solo cambia de estado: las mismas moléculas de agua se separan un poco. Si vuelves a enfriar, se recongela. Es un cambio físico.",
  },
  {
    key: "romper-vidrio",
    nombre: "Romper un vidrio",
    icono: "fa-hammer",
    sustancia: "Vidrio",
    tipo: "fisico",
    modo: "fragmenta",
    colorInicial: "#BFE3FF",
    colorFinal: "#BFE3FF",
    emite: "ninguno",
    flama: false,
    reversible: false,
    evidencia: "Cambia la forma y el tamaño, no la sustancia.",
    explica:
      "Romper solo cambia la forma: cada trozo sigue siendo vidrio. No aparece una sustancia nueva, así que es un cambio físico (aunque no puedas rearmarlo).",
  },
  {
    key: "evaporar-agua",
    nombre: "Evaporar agua",
    icono: "fa-wind",
    sustancia: "Agua líquida",
    tipo: "fisico",
    modo: "gas",
    colorInicial: "#4FB0E8",
    colorFinal: "#CFE6F5",
    emite: "ninguno",
    flama: true,
    reversible: true,
    evidencia: "El agua se convierte en vapor; al enfriarse vuelve a ser agua.",
    explica:
      "El agua pasa a estado gaseoso. Sigue siendo agua (H₂O); si el vapor se condensa, regresa a líquido. Es un cambio físico.",
  },
  {
    key: "quemar-papel",
    nombre: "Quemar papel",
    icono: "fa-fire",
    sustancia: "Papel",
    tipo: "quimico",
    modo: "reaccion",
    colorInicial: "#EFE6D2",
    colorFinal: "#2C2A28",
    emite: "humo",
    flama: true,
    reversible: false,
    evidencia: "Aparecen ceniza, humo y calor; no se revierte.",
    explica:
      "El papel reacciona con el oxígeno y se transforma en ceniza, gases y calor: sustancias nuevas que no puedes volver a convertir en papel. Es un cambio químico.",
  },
  {
    key: "oxidar-hierro",
    nombre: "Oxidar hierro",
    icono: "fa-wrench",
    sustancia: "Clavo de hierro",
    tipo: "quimico",
    modo: "reaccion",
    colorInicial: "#8A929C",
    colorFinal: "#B5612E",
    emite: "ninguno",
    flama: false,
    reversible: false,
    evidencia: "Se forma herrumbre (óxido), una sustancia nueva.",
    explica:
      "El hierro reacciona lentamente con el oxígeno y la humedad y forma óxido de hierro (herrumbre). Es una sustancia distinta: cambio químico.",
  },
  {
    key: "vinagre-bicarbonato",
    nombre: "Vinagre + bicarbonato",
    icono: "fa-flask",
    sustancia: "Vinagre y bicarbonato",
    tipo: "quimico",
    modo: "reaccion",
    colorInicial: "#EDEFF2",
    colorFinal: "#E2EAF1",
    emite: "burbujas",
    flama: false,
    reversible: false,
    evidencia: "Burbujea y libera gas (CO₂).",
    explica:
      "Al mezclarlos reaccionan y producen dióxido de carbono (las burbujas), agua y otra sal. Se formaron sustancias nuevas: cambio químico.",
  },
];

/** ¿El estudiante clasificó correctamente la transformación? */
export const clasificaBien = (t: Transformacion, eleccion: TipoCambio) => t.tipo === eleccion;

/* ─────────────────────────────────────────────────────────────────────────
 * Cuestionario de comprensión — VERBATIM del quiz A2 de CNEYT-I-P02.
 * Es la actividad ancla evaluada de la progresión. Se reproduce íntegro para
 * la "interactividad ampliada": el estudiante comprueba lo aprendido aquí
 * mismo, con retroalimentación por reactivo.
 * ──────────────────────────────────────────────────────────────────────── */

export interface PreguntaQuiz {
  pregunta: string;
  opciones: string[];
  correcta: number; // índice de la opción correcta
  retro: string; // retroalimentación verbatim
}

export const QUIZ_COMPRENSION: PreguntaQuiz[] = [
  {
    pregunta: "¿Cuál de estas es una propiedad FÍSICA de la materia?",
    opciones: ["La inflamabilidad", "La oxidación", "El punto de fusión", "La reactividad con ácidos"],
    correcta: 2,
    retro: "El punto de fusión es una propiedad física: se mide sin cambiar la composición química de la sustancia.",
  },
  {
    pregunta: "¿Cuál de estas es una propiedad QUÍMICA de la materia?",
    opciones: ["La densidad", "El color", "La conductividad eléctrica", "La oxidación (reacción con el oxígeno)"],
    correcta: 3,
    retro: "La oxidación es una propiedad química: se observa solo cuando la sustancia reacciona y se transforma.",
  },
  {
    pregunta: "La densidad se define como:",
    opciones: [
      "El peso de un objeto en la báscula",
      "La masa por unidad de volumen",
      "El espacio que ocupa un objeto",
      "La resistencia de un material a ser rayado",
    ],
    correcta: 1,
    retro: "Densidad = masa / volumen. Es lo que determina si un objeto flota o se hunde en un líquido.",
  },
  {
    pregunta: "¿Para qué sirven las propiedades físicas y químicas en la práctica?",
    opciones: [
      "Solo para aprobar exámenes de química",
      "Para identificar sustancias y predecir cómo se comportarán en distintas condiciones",
      "Para saber cuánto pesa algo",
      "Para determinar el precio de los materiales",
    ],
    correcta: 1,
    retro: "Conocer las propiedades permite identificar materiales y diseñar aplicaciones industriales, médicas y tecnológicas.",
  },
  {
    pregunta: "El oro se puede identificar por su color amarillo y su alta densidad (19.3 g/cm³). Estas son propiedades:",
    opciones: ["Químicas", "Físicas", "Biológicas", "Atómicas"],
    correcta: 1,
    retro: "El color y la densidad son propiedades físicas: se observan sin cambiar la composición química del oro.",
  },
];
