/**
 * Lógica pura del simulador «La entrevista» (PFH-I-P02, Tipos de preguntas).
 *
 * El alumno prepara un reporte escolar sobre «el tiempo» entrevistando a
 * Doña Elena Duarte, relojera retirada de Valle Claro (personaje y lugar
 * FICTICIOS). Solo alcanzan las preguntas de un presupuesto: las elige entre
 * cotidianas, científicas y filosóficas, y la respuesta que recibe CAMBIA según
 * el tipo: un dato corto, una explicación con evidencia o una reflexión que
 * abre más preguntas. El reporte se llena con lo que consiguió.
 */
import type { TipoPregunta } from "./tipos-de-preguntas-data";

export const PRESUPUESTO = 5;

export interface PreguntaEntrevista {
  id: string;
  tipo: TipoPregunta;
  texto: string;
  /** Lo que contesta Doña Elena. */
  respuesta: string;
  /** Lo que queda anotado en el reporte. */
  cita: string;
  /** Por qué este tipo de pregunta produce este tipo de respuesta. */
  porque: string;
}

export const PREGUNTAS_ENTREVISTA: PreguntaEntrevista[] = [
  {
    id: "en-hora",
    tipo: "cotidiana",
    texto: "¿Qué hora es?",
    respuesta: "Las cuatro y diez.",
    cita: "Eran las cuatro y diez en su reloj de pared.",
    porque: "Es cotidiana: pide un dato inmediato y práctico. Se contesta con una línea y no abre nada más.",
  },
  {
    id: "en-precio",
    tipo: "cotidiana",
    texto: "¿Cuánto cuesta arreglar un reloj de pulsera?",
    respuesta: "Unos doscientos pesos, según la pieza que falle.",
    cita: "Arreglar un reloj de pulsera cuesta unos doscientos pesos (cifra de simulación).",
    porque: "Es cotidiana: basta una cifra o un dato concreto. La respuesta es correcta y breve, pero no explica nada.",
  },
  {
    id: "en-engranes",
    tipo: "cotidiana",
    texto: "¿Dónde compra sus engranes?",
    respuesta: "En la refaccionaria de la calle principal.",
    cita: "Compra sus engranes en la refaccionaria de la calle principal.",
    porque: "Es cotidiana: se resuelve con un dato o una observación directa, sin necesidad de evidencia ni de reflexión.",
  },
  {
    id: "en-pendulo",
    tipo: "cientifica",
    texto: "¿Cómo funciona un reloj de péndulo?",
    respuesta:
      "Cada vaivén del péndulo dura casi lo mismo mientras el hilo no cambie de largo. Un engrane cuenta los vaivenes y mueve las manecillas. Lo comprobé acortando el hilo: el reloj corrió más rápido.",
    cita: "El péndulo marca tiempos iguales si su largo no cambia; al acortar el hilo, el reloj corre más rápido (se comprobó).",
    porque: "Es científica: busca explicar un fenómeno y la respuesta se apoya en observación y experimentación que cualquiera puede repetir.",
  },
  {
    id: "en-dia",
    tipo: "cientifica",
    texto: "¿Por qué un día dura 24 horas?",
    respuesta:
      "Porque la Tierra tarda aproximadamente ese tiempo en dar una vuelta sobre sí misma. Se comprueba observando que el Sol vuelve al mismo punto del cielo cada 24 horas.",
    cita: "El día dura 24 horas porque la Tierra gira sobre sí misma; se verifica observando al Sol regresar al mismo punto.",
    porque: "Es científica: pregunta el porqué de un fenómeno natural y su respuesta es verificable con evidencia empírica.",
  },
  {
    id: "en-calor",
    tipo: "cientifica",
    texto: "¿Por qué algunos relojes se atrasan en el calor?",
    respuesta:
      "El metal se dilata con la temperatura: el péndulo se alarga y oscila más lento. Se verifica midiendo la temperatura y cronometrando cuánto se atrasa.",
    cita: "Con el calor el metal se dilata y el péndulo oscila más lento; se verifica con termómetro y cronómetro.",
    porque: "Es científica: relaciona causa y efecto y se puede medir. Su respuesta puede revisarse y, si hace falta, corregirse.",
  },
  {
    id: "en-tiempo",
    tipo: "filosofica",
    texto: "¿Qué es el tiempo?",
    respuesta:
      "Buena pregunta, y no tengo una respuesta final. ¿Es algo que existe fuera de nosotros o solo la manera en que ordenamos lo que nos pasa? Mis relojes lo miden, pero medirlo no es lo mismo que saber qué es.",
    cita: "Para ella, medir el tiempo no es lo mismo que saber qué es: queda abierta la pregunta de si existe fuera de nosotros.",
    porque: "Es filosófica: ningún dato ni experimento la cierra. Obliga a analizar conceptos (qué significa «ser»), por eso la respuesta es una reflexión.",
  },
  {
    id: "en-pasado",
    tipo: "filosofica",
    texto: "¿El pasado todavía existe?",
    respuesta:
      "Hay quien dice que solo existe el presente y que el pasado es memoria. Otros piensan que sigue ahí, aunque no podamos tocarlo. Depende de qué entendamos por existir, y eso no lo decide ningún reloj.",
    cita: "Hay quien piensa que el pasado es solo memoria y quien piensa que sigue existiendo; depende de qué se entienda por existir.",
    porque: "Es filosófica: hay varias respuestas razonables y todo depende de aclarar un concepto. No se resuelve midiendo.",
  },
  {
    id: "en-valor",
    tipo: "filosofica",
    texto: "¿Qué da valor al tiempo de una persona?",
    respuesta:
      "Pasé cuarenta años arreglando el tiempo de otros. ¿Vale más una hora de trabajo o una hora con mis nietos? Depende de lo que cada quien llame una buena vida.",
    cita: "Se pregunta si vale más una hora de trabajo o una con la familia: depende de lo que cada quien llame una buena vida.",
    porque: "Es filosófica: pregunta por el valor y por lo que debemos preferir, no por un dato. La respuesta es una postura que se argumenta.",
  },
];

/** Cuánta información útil aporta cada tipo de pregunta (puntos de simulación). */
export const PESO: Record<TipoPregunta, number> = { cotidiana: 1, cientifica: 3, filosofica: 3 };

export const SECCIONES: { tipo: TipoPregunta; titulo: string; vacia: string; icono: string }[] = [
  { tipo: "cotidiana", titulo: "Datos", vacia: "Todavía no hay datos concretos.", icono: "fa-mug-hot" },
  { tipo: "cientifica", titulo: "Explicaciones", vacia: "Todavía no hay explicaciones con evidencia.", icono: "fa-flask" },
  { tipo: "filosofica", titulo: "Reflexiones", vacia: "Todavía no hay reflexiones.", icono: "fa-brain" },
];

export const palabras = (txt: string) => txt.trim().split(/\s+/).filter(Boolean).length;

export interface ResumenEntrevista {
  usadas: number;
  restantes: number;
  info: number;
  infoMax: number;
  porTipo: Record<TipoPregunta, number>;
  completo: boolean;
  faltan: string[];
  terminada: boolean;
  dictamen: string;
}

const NOMBRE_FALTA: Record<TipoPregunta, string> = {
  cotidiana: "datos",
  cientifica: "explicaciones",
  filosofica: "reflexiones",
};

/** Estado de la entrevista a partir de las preguntas hechas (en orden). */
export function resumenEntrevista(hechas: string[]): ResumenEntrevista {
  const porTipo: Record<TipoPregunta, number> = { cotidiana: 0, cientifica: 0, filosofica: 0 };
  let info = 0;
  for (const id of hechas) {
    const p = PREGUNTAS_ENTREVISTA.find((x) => x.id === id);
    if (!p) continue;
    porTipo[p.tipo]++;
    info += PESO[p.tipo];
  }
  const faltan = (Object.keys(porTipo) as TipoPregunta[]).filter((t) => porTipo[t] === 0).map((t) => NOMBRE_FALTA[t]);
  const completo = faltan.length === 0;
  const terminada = hechas.length >= PRESUPUESTO;
  let dictamen: string;
  if (hechas.length === 0) dictamen = "Elige tu primera pregunta: cada tipo traerá un tipo distinto de respuesta.";
  else if (completo) {
    dictamen =
      info >= 11
        ? "Reporte completo y con fondo: tiene datos, explicaciones y reflexiones."
        : "Reporte completo: tiene datos, explicaciones y reflexiones, aunque podrías sacarle más fondo.";
  } else if (terminada) {
    dictamen = `Se acabaron las preguntas y al reporte le faltan ${faltan.join(" y ")}. Reinicia e inténtalo con otra mezcla.`;
  } else {
    dictamen = `Aún faltan ${faltan.join(" y ")}. Te quedan ${PRESUPUESTO - hechas.length} preguntas.`;
  }
  return {
    usadas: hechas.length,
    restantes: Math.max(0, PRESUPUESTO - hechas.length),
    info,
    infoMax: PRESUPUESTO * 3,
    porTipo,
    completo,
    faltan,
    terminada,
    dictamen,
  };
}
