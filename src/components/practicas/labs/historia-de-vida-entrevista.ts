/**
 * Datos del modo «Entrevista a doña Remedios» (LC-II-P01).
 *
 * Todo es FICCIÓN escrita para el laboratorio: doña Remedios Aguirre, el
 * rancho y las cifras no existen. Los años son de simulación. Sirve para
 * practicar el oficio de entrevistar sobre material ajeno, sin pedir
 * confidencias al alumno.
 */

export type CapaEntrevista = "dato" | "suceso" | "detalle" | "huella" | "desvio";

export interface PreguntaEntrevista {
  id: string;
  pregunta: string;
  capa: CapaEntrevista;
  respuesta: string;
  /** Orden cronológico dentro del relato que se va armando. */
  orden: number;
  /** Aporte a los tres medidores (0–100). */
  suceso: number;
  detalle: number;
  huella: number;
  /** Clave de imagen en /media/labs-sim/historia-de-vida-relato/ (si tiene). */
  foto?: string;
  icono: string;
  /** Por qué esa pregunta rinde o no rinde. */
  porque: string;
}

export const PRESUPUESTO_PREGUNTAS = 4;
export const UMBRAL_RELATO = 50;

export const ENTREVISTADA = {
  nombre: "Doña Remedios Aguirre",
  ficha: "82 años, antes vivía en un rancho de la sierra (personaje ficticio, simulación).",
};

export const PREGUNTAS_ENTREVISTA: PreguntaEntrevista[] = [
  {
    id: "q-edad",
    pregunta: "¿Cuántos años tiene y cuántos nietos?",
    capa: "dato",
    respuesta: "Tengo ochenta y dos años y once nietos.",
    orden: 0,
    suceso: 5, detalle: 5, huella: 0,
    icono: "fa-hashtag",
    porque: "Un dato suelto no cuenta nada: no hay hecho, ni imagen, ni sentido. Se responde en una línea y se acaba.",
  },
  {
    id: "q-pozo",
    pregunta: "¿Qué pasó el día que dejó el rancho?",
    capa: "suceso",
    respuesta: "Se secó el pozo en 1963. Cargamos el comal en un burro y bajamos al pueblo con lo puesto.",
    orden: 1,
    suceso: 45, detalle: 25, huella: 0,
    foto: "pozo-seco",
    icono: "fa-bolt",
    porque: "Pregunta por un hecho concreto con un antes y un después: ahí nace el hilo del relato.",
  },
  {
    id: "q-camino",
    pregunta: "¿Qué recuerda del camino hacia el pueblo?",
    capa: "detalle",
    respuesta: "El polvo en la boca y el comal golpeando el costado del burro: tolón, tolón, todo el camino.",
    orden: 2,
    suceso: 10, detalle: 40, huella: 0,
    foto: "camino-burro",
    icono: "fa-eye",
    porque: "Pide una imagen y un sonido. Esos detalles sensoriales son los que el lector no olvida.",
  },
  {
    id: "q-vaca",
    pregunta: "¿Qué fue lo más difícil de ese año?",
    capa: "suceso",
    respuesta: "Vender la vaca. Mi hija lloró tres días y yo no supe cómo consolarla.",
    orden: 3,
    suceso: 30, detalle: 10, huella: 25,
    foto: "vaca-corral",
    icono: "fa-shuffle",
    porque: "Toca el momento de quiebre y deja asomar una emoción: suma hecho y un poco de sentido.",
  },
  {
    id: "q-cocina",
    pregunta: "¿Cómo era su cocina de entonces?",
    capa: "detalle",
    respuesta: "Paredes ahumadas, un metate que me regaló mi suegra y olor a leña de encino desde la madrugada.",
    orden: 4,
    suceso: 0, detalle: 45, huella: 5,
    foto: "cocina-lena",
    icono: "fa-fire-burner",
    porque: "Describe un lugar con materiales y olores: es descripción pura, ideal para detener el tiempo un momento.",
  },
  {
    id: "q-huella",
    pregunta: "¿Qué le enseñó haber dejado el rancho?",
    capa: "huella",
    respuesta: "Que uno se lleva lo que sabe hacer, no lo que tiene. Con ese comal empecé a vender tortillas y de eso vivimos.",
    orden: 5,
    suceso: 15, detalle: 5, huella: 55,
    foto: "comal-tortillas",
    icono: "fa-heart-pulse",
    porque: "Pide el significado: qué cambió en quien lo vivió. Sin esta capa el relato es una crónica sin sentido.",
  },
  {
    id: "q-jovenes",
    pregunta: "¿Qué opina de los jóvenes de hoy?",
    capa: "desvio",
    respuesta: "Pues andan muy distraídos con el celular, ya nadie platica.",
    orden: 6,
    suceso: 0, detalle: 0, huella: 0,
    icono: "fa-comments",
    porque: "Es una opinión general que se sale de la historia: gasta una pregunta y no aporta al relato.",
  },
];

export interface LecturaRelato {
  etiqueta: string;
  color: string;
}

/** Qué tan «relato» es lo que se ha reunido, a partir de los tres medidores. */
export function lecturaRelato(suceso: number, detalle: number, huella: number, hechas: number): LecturaRelato {
  if (hechas === 0) return { etiqueta: "Todavía no hay relato", color: "#8AA0B8" };
  const min = Math.min(suceso, detalle, huella);
  if (min >= UMBRAL_RELATO) return { etiqueta: "Relato completo: se ve, pasa algo y significa", color: "#34D399" };
  if (huella < 20) return { etiqueta: "Crónica sin sentido: falta la huella", color: "#FF8A3C" };
  if (detalle < 20) return { etiqueta: "Resumen sin imagen: faltan detalles", color: "#FF8A3C" };
  if (suceso < 20) return { etiqueta: "Retrato sin historia: falta un suceso", color: "#FF8A3C" };
  return { etiqueta: "Va tomando forma: aún cojea de un lado", color: "#FFC75A" };
}

export const clampMedidor = (n: number) => Math.max(0, Math.min(100, n));
