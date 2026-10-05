/**
 * Simulador «Dialoga con la autora» (LC-I-P01).
 *
 * La idea de la progresión: la lectura alimenta a la escritura y lo que se
 * escribe cambia cómo se vuelve a leer. Aquí el alumno es el LECTOR: comenta
 * una frase del borrador de una autora FICTICIA y ella reacciona. Si el
 * comentario nombra lo que de verdad le falta a esa frase, la autora la
 * reescribe y el texto mejora ante los ojos del lector; si no, no cambia nada
 * y explica por qué.
 *
 * Personas, lugares e instituciones: inventados. Cifras: simulación.
 */

export type Comentario = "pregunta" | "evidencia" | "vivencia" | "propuesta" | "forma" | "elogio" | "ataque";
export type Dimension = "claridad" | "evidencia" | "voz" | "proposito" | "forma";

export const DIMENSIONES: { id: Dimension; label: string; color: string; icono: string }[] = [
  { id: "claridad", label: "Claridad", color: "#4FC3F7", icono: "fa-eye" },
  { id: "evidencia", label: "Pruebas", color: "#FFB74D", icono: "fa-magnifying-glass" },
  { id: "voz", label: "Voz humana", color: "#F48FB1", icono: "fa-heart" },
  { id: "proposito", label: "Propósito", color: "#81C784", icono: "fa-bullseye" },
  { id: "forma", label: "Forma", color: "#BA9BFF", icono: "fa-spell-check" },
];

export const COMENTARIOS: { id: Comentario; etiqueta: string; ejemplo: string; icono: string }[] = [
  { id: "pregunta", etiqueta: "No entiendo esto", ejemplo: "¿A qué te refieres exactamente?", icono: "fa-circle-question" },
  { id: "evidencia", etiqueta: "¿Cómo lo sabes?", ejemplo: "¿Quién lo dice? ¿Qué lo prueba?", icono: "fa-magnifying-glass" },
  { id: "vivencia", etiqueta: "Cuéntame una escena", ejemplo: "¿Cómo lo vives tú?", icono: "fa-heart" },
  { id: "propuesta", etiqueta: "¿Qué quieres lograr?", ejemplo: "¿Qué debería pasar y quién lo hace?", icono: "fa-bullseye" },
  { id: "forma", etiqueta: "Revisa la ortografía", ejemplo: "Hay una falta o falta una coma.", icono: "fa-spell-check" },
  { id: "elogio", etiqueta: "«Está muy bien»", ejemplo: "Me gustó mucho.", icono: "fa-thumbs-up" },
  { id: "ataque", etiqueta: "«Escribes horrible»", ejemplo: "No sabes escribir.", icono: "fa-face-angry" },
];

export interface FraseBorrador {
  id: string;
  original: string;
  revisada: string;
  /** Qué le falta a la frase original. */
  falla: Dimension;
  /** El comentario que sí le sirve. */
  pide: Comentario;
  /** Lo que la autora duda de su propia frase (explica por qué se falla). */
  duda: string;
  /** Cómo reacciona cuando el comentario acierta. */
  gracias: string;
}

export const AUTORA = {
  nombre: "Renata Olmos",
  rol: "Cronista de la gaceta escolar (personaje ficticio)",
  titulo: "La calle sin alumbrado",
};

export const FRASES: FraseBorrador[] = [
  {
    id: "f1",
    original: "Mi calle está muy mal desde hace tiempo.",
    revisada: "Desde marzo, la calle Naranjos, entre Hidalgo y Juárez, lleva ocho semanas sin una sola lámpara encendida.",
    falla: "claridad",
    pide: "pregunta",
    duda: "«Muy mal» y «hace tiempo» solo lo entiendo yo. Alguien que no vive aquí no sabría cuál calle ni desde cuándo.",
    gracias: "Tienes razón: yo sabía de qué hablaba y no lo escribí. Ya pongo dónde y desde cuándo.",
  },
  {
    id: "f2",
    original: "Todos dicen que por eso hay más robos.",
    revisada: "En la tienda de la esquina, don Efraín contó cuatro robos en dos meses; antes del apagón había uno o ninguno (cifra de la simulación).",
    falla: "evidencia",
    pide: "evidencia",
    duda: "«Todos dicen» no es una fuente. Si alguien me pregunta cómo lo sé, no tengo qué mostrarle.",
    gracias: "Buena pregunta: tengo un testimonio y una cuenta, pero no los había puesto. Los agrego.",
  },
  {
    id: "f3",
    original: "Es un problema para la gente.",
    revisada: "Mi hermana menor ya no se atreve a volver sola de la tarea a las siete: da la vuelta por la avenida y llega tarde a cenar.",
    falla: "voz",
    pide: "vivencia",
    duda: "«La gente» es nadie en particular. Ni yo me emociono con esa frase, y la escribí yo.",
    gracias: "Me hiciste pensar en mi hermana. Mejor cuento esa escena que decir «un problema».",
  },
  {
    id: "f4",
    original: "Alguien debería hacer algo.",
    revisada: "Pedimos al ayuntamiento (ficticio) que repare tres lámparas y que dé una fecha por escrito.",
    falla: "proposito",
    pide: "propuesta",
    duda: "Escribí una queja, no una petición: no digo qué quiero ni a quién se lo pido.",
    gracias: "Cierto, escribo para lograr algo. Ahora digo qué pido y a quién.",
  },
  {
    id: "f5",
    original: "ay que repararla ya.",
    revisada: "Hay que repararla ya.",
    falla: "forma",
    pide: "forma",
    duda: "La frase empieza con minúscula y le falta una «h»: se ve descuidada y le quita fuerza a lo que pido.",
    gracias: "Ay, sí: «hay» lleva h y la oración empieza con mayúscula. Corregido.",
  },
];

/** Valores de partida del borrador y tope de cada dimensión (simulación). */
const BASE: Record<Dimension, number> = { claridad: 25, evidencia: 15, voz: 20, proposito: 15, forma: 45 };
const TOPE = 90;

/** Cuánto entiende y se convence un lector nuevo con las frases ya revisadas. */
export function calidad(revisadas: Record<string, boolean>): Record<Dimension, number> {
  const v: Record<Dimension, number> = { ...BASE };
  for (const f of FRASES) {
    if (!revisadas[f.id]) continue;
    for (const d of DIMENSIONES) {
      v[d.id] = d.id === f.falla ? TOPE : Math.min(TOPE, v[d.id] + 4);
    }
  }
  return v;
}

export function promedio(v: Record<Dimension, number>): number {
  return Math.round(DIMENSIONES.reduce((n, d) => n + v[d.id], 0) / DIMENSIONES.length);
}

export function veredictoLector(total: number): { icono: string; texto: string } {
  if (total >= 70) return { icono: "fa-face-smile-beam", texto: "El lector nuevo entiende y se convence" };
  if (total >= 45) return { icono: "fa-face-meh", texto: "El lector nuevo entiende a medias" };
  return { icono: "fa-face-confused", texto: "El lector nuevo se pierde" };
}

/** Respuesta de la autora a un comentario sobre una frase. */
export function respuestaAutora(f: FraseBorrador, c: Comentario, yaRevisada: boolean): { ok: boolean; texto: string } {
  if (yaRevisada) return { ok: false, texto: "Esa frase ya la reescribí con tu comentario anterior. Revisa otra del borrador." };
  if (c === f.pide) return { ok: true, texto: f.gracias };
  if (c === "elogio") return { ok: false, texto: "Gracias, pero con «está muy bien» no sé qué cambiar. Dime qué parte te costó trabajo entender o creer." };
  if (c === "ataque") return { ok: false, texto: "Eso no me ayuda a mejorar: critica lo que dice el texto, no a quien lo escribe. Señálame qué le falta a esta frase." };
  return { ok: false, texto: `Gracias, pero ese comentario no cambia esta frase. ${f.duda}` };
}
