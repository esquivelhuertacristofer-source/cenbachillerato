/**
 * Modelo del SIMULADOR del debate (lab «falacias-logica»).
 *
 * TODO es ficticio: la «Prepa Cerro Alto», sus estudiantes y los números de
 * los medidores son valores de simulación para aprender a detectar falacias;
 * no miden nada real.
 *
 * Determinista y transparente: las mismas decisiones dan siempre los mismos
 * resultados. Cada mensaje del debate llega con una fuerza «aparente»; si el
 * alumno nombra bien la falacia, esa fuerza se desinfla; si no, el público se
 * deja llevar. Después elige cómo responder y el público reacciona.
 */

import type { Falacia } from "./falacias-logica-data";

export type Etiqueta = Falacia | "ninguna";
export type Lado = "a" | "b";
export type TipoResp = "razon" | "contraataque" | "callar";

export const LADOS: Record<Lado, { nombre: string; corto: string; icono: string; color: string }> = {
  a: { nombre: "Equipo Sin Pantallas", corto: "Sin Pantallas", icono: "fa-mobile-screen-button", color: "#FFC75A" },
  b: { nombre: "Equipo Conectados", corto: "Conectados", icono: "fa-wifi", color: "#5BC8FF" },
};

export const TEMA = {
  titulo: "Debate del Consejo Estudiantil · Prepa Cerro Alto",
  propuesta: "Propuesta de Valeria: guardar el celular durante la clase y usarlo en el recreo.",
  nota: "Escuela, estudiantes y cifras ficticios (simulación).",
};

export interface Respuesta {
  id: string;
  tipo: TipoResp;
  texto: string;
}

export interface Mensaje {
  id: string;
  lado: Lado;
  autor: string;
  /** Clave de la imagen en /media/labs-sim/falacias-logica/. */
  foto: string;
  texto: string;
  falacia: Etiqueta;
  /** Por qué ese mensaje no prueba lo que pretende (o por qué sí es sólido). */
  porque: string;
  respuestas: Respuesta[];
}

export const MENSAJES: Mensaje[] = [
  {
    id: "m1",
    lado: "b",
    autor: "Emiliano",
    foto: "emiliano",
    texto: "No le hagan caso a Valeria: saca puros dieces porque su mamá es maestra. ¿Qué sabe ella de lo que cuesta concentrarse?",
    falacia: "ad-hominem",
    porque: "Ataca a Valeria (quién es y de dónde viene) y no dice nada sobre si el celular distrae. Aunque lo que dice de su mamá fuera cierto, la propuesta se evalúa por sus razones.",
    respuestas: [
      { id: "r1", tipo: "razon", texto: "Eso habla de Valeria, no de su propuesta. ¿Qué razón tienes contra guardar el celular en clase?" },
      { id: "r2", tipo: "contraataque", texto: "Y tú te la pasas jugando en clase, así que nadie te va a creer a ti tampoco." },
      { id: "r3", tipo: "callar", texto: "Mejor no digo nada, no quiero que se arme pleito." },
    ],
  },
  {
    id: "m2",
    lado: "a",
    autor: "Joaquín",
    foto: "joaquin",
    texto: "Si dejan el celular en clase, mañana nadie pondrá atención, luego todos reprobarán y la prepa se quedará vacía.",
    falacia: "pendiente",
    porque: "Encadena consecuencias cada vez más extremas sin explicar por qué cada paso ocurriría. Que haya distracción no implica que toda la escuela vaya a fracasar.",
    respuestas: [
      { id: "r1", tipo: "callar", texto: "Ya, ya… sigamos con el siguiente punto." },
      { id: "r2", tipo: "razon", texto: "Explícame cada paso: ¿por qué distraerse un poco llevaría a que la prepa se vacíe? ¿Qué dato lo muestra?" },
      { id: "r3", tipo: "contraataque", texto: "Qué dramático eres, Joaquín, siempre exagerando todo." },
    ],
  },
  {
    id: "m3",
    lado: "b",
    autor: "Renata",
    foto: "renata",
    texto: "Max Ráfaga, un influencer de gimnasio con millones de seguidores, dice que el celular mejora la concentración. Así que es verdad.",
    falacia: "autoridad",
    porque: "Usa la fama de alguien que no es experto en aprendizaje en lugar de dar evidencia. Tener seguidores no vuelve cierta una afirmación sobre la concentración (Max Ráfaga es un personaje ficticio).",
    respuestas: [
      { id: "r1", tipo: "contraataque", texto: "Ese tipo solo vende suplementos, tú le crees todo porque eres su fan." },
      { id: "r2", tipo: "razon", texto: "Ser famoso no lo hace experto en estudio. ¿Hay algún estudio o ejemplo de nuestro grupo que lo muestre?" },
      { id: "r3", tipo: "callar", texto: "Pues… si lo dice tanta gente, algo de razón tendrá." },
    ],
  },
  {
    id: "m4",
    lado: "a",
    autor: "Marisol",
    foto: "marisol",
    texto: "O se prohíben los celulares por completo en toda la escuela o aceptamos que en esta prepa nadie va a aprender nada.",
    falacia: "dicotomia",
    porque: "Presenta solo dos extremos y esconde las opciones intermedias: guardarlo en clase, usarlo con permiso para actividades, zonas sin celular… Dos opciones no son todas las opciones.",
    respuestas: [
      { id: "r1", tipo: "razon", texto: "No son las únicas opciones: podríamos permitirlo solo con permiso del docente. ¿Por qué descartas eso?" },
      { id: "r2", tipo: "callar", texto: "Pues sí, no queda de otra." },
      { id: "r3", tipo: "contraataque", texto: "Típico de ti, Marisol, siempre en blanco o negro." },
    ],
  },
  {
    id: "m5",
    lado: "b",
    autor: "Dani",
    foto: "dani",
    texto: "Valeria quiere que volvamos a la época de las piedras, sin ninguna tecnología en la escuela.",
    falacia: "hombre-paja",
    porque: "Valeria solo propuso guardar el celular durante la clase. Dani deforma esa postura en una versión extrema (sin tecnología) para derrotarla con facilidad.",
    respuestas: [
      { id: "r1", tipo: "contraataque", texto: "Dani no sabe ni leer una propuesta, por eso inventa cosas." },
      { id: "r2", tipo: "razon", texto: "Valeria propuso guardar el celular solo en clase. Discute esa propuesta, no una que ella no hizo." },
      { id: "r3", tipo: "callar", texto: "Bueno, quién sabe qué quiso decir exactamente." },
    ],
  },
  {
    id: "m6",
    lado: "a",
    autor: "Valeria",
    foto: "valeria",
    texto: "Propongo guardar el celular solo durante la clase. En un grupo de práctica con el celular en la mesa, 9 de 30 contestaron mal por distraerse (simulación). Si el docente lo pide para un ejercicio, lo usamos con permiso.",
    falacia: "ninguna",
    porque: "Aquí no hay falacia: la propuesta es concreta, trae un dato (ficticio) y reconoce una excepción razonable. Se puede discutir, pero no es una trampa retórica.",
    respuestas: [
      { id: "r1", tipo: "callar", texto: "Suena bien, pero no tengo nada que agregar." },
      { id: "r2", tipo: "contraataque", texto: "Seguro inventaste ese dato para ganar el debate." },
      { id: "r3", tipo: "razon", texto: "Es un argumento claro. Propongo probarlo dos semanas y comparar resultados antes de decidir." },
    ],
  },
];

export interface Estado {
  a: number;
  b: number;
  publico: number;
}
export const INICIAL: Estado = { a: 50, b: 50, publico: 50 };

export interface Delta {
  a: number;
  b: number;
  publico: number;
}

const tope = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
const suma = (e: Estado, d: Delta): Estado => ({ a: tope(e.a + d.a), b: tope(e.b + d.b), publico: tope(e.publico + d.publico) });

export interface ResultadoEtiqueta {
  acierto: boolean;
  delta: Delta;
  texto: string;
}

/** Efecto de nombrar (o no) la falacia de un mensaje. */
export function aplicarEtiqueta(m: Mensaje, etq: Etiqueta): ResultadoEtiqueta {
  const mio = (n: number): Delta => ({ a: m.lado === "a" ? n : 0, b: m.lado === "b" ? n : 0, publico: 0 });
  const con = (d: Delta, p: number): Delta => ({ ...d, publico: p });
  const acierto = etq === m.falacia;
  if (m.falacia === "ninguna") {
    if (acierto) return { acierto, delta: con(mio(14), 8), texto: "Reconoces un argumento sólido: sube la fuerza de ese equipo y el público valora el debate limpio." };
    return { acierto, delta: con(mio(-6), -10), texto: "Acusaste de falacia un argumento que sí tenía razones: señalar falacias donde no las hay también engaña al público." };
  }
  if (acierto) return { acierto, delta: con(mio(-6), 8), texto: "Nombraste la falacia: su fuerza aparente se desinfla y el público ve que no prueba nada." };
  if (etq === "ninguna") return { acierto, delta: con(mio(10), -8), texto: "Lo dejaste pasar como si fuera un buen argumento: sube la fuerza del equipo y el público se deja convencer sin razones." };
  return { acierto, delta: con(mio(10), -6), texto: "Esa no es la falacia: el mensaje conserva su fuerza aparente y el público se confunde." };
}

export interface ResultadoRespuesta {
  delta: Delta;
  texto: string;
}

/** Efecto de la respuesta del alumno. */
export function aplicarRespuesta(m: Mensaje, tipo: TipoResp): ResultadoRespuesta {
  const otro: Lado = m.lado === "a" ? "b" : "a";
  const lado = (l: Lado, n: number): Delta => ({ a: l === "a" ? n : 0, b: l === "b" ? n : 0, publico: 0 });
  if (tipo === "razon") {
    const d = lado(otro, m.falacia === "ninguna" ? 0 : 4);
    return { delta: { ...d, publico: 6 }, texto: "Respondiste a la idea con razones: el público lo nota y el debate mejora." };
  }
  if (tipo === "contraataque") {
    const d = lado(m.lado, 3);
    return { delta: { ...d, publico: -10 }, texto: "Contraatacar a la persona es otro ad hominem: el público se enfría y hasta le da simpatía a quien recibió el ataque." };
  }
  return { delta: { a: 0, b: 0, publico: -4 }, texto: "Callar deja el argumento sin examinar: el público se queda sin saber si era bueno." };
}

export interface Turno {
  id: string;
  etiqueta: Etiqueta;
  resp?: TipoResp;
}

export interface Resumen {
  estado: Estado;
  aciertos: number;
  contestados: number;
  cerrado: boolean;
  /** Cuántas respuestas con razones dio. */
  conRazones: number;
}

/** Reconstruye el estado de los medidores a partir de las decisiones. */
export function calcular(turnos: Turno[]): Resumen {
  let estado = INICIAL;
  let aciertos = 0;
  let conRazones = 0;
  let cerrados = 0;
  for (const t of turnos) {
    const m = MENSAJES.find((x) => x.id === t.id);
    if (!m) continue;
    const e = aplicarEtiqueta(m, t.etiqueta);
    estado = suma(estado, e.delta);
    if (e.acierto) aciertos++;
    if (t.resp) {
      estado = suma(estado, aplicarRespuesta(m, t.resp).delta);
      cerrados++;
      if (t.resp === "razon") conRazones++;
    }
  }
  return { estado, aciertos, contestados: turnos.length, cerrado: cerrados >= MENSAJES.length, conRazones };
}

export function humor(publico: number): { texto: string; icono: string; color: string } {
  if (publico >= 75) return { texto: "Aplaude", icono: "fa-face-grin-stars", color: "#34D399" };
  if (publico >= 55) return { texto: "Atento", icono: "fa-face-smile", color: "#9BE564" };
  if (publico >= 40) return { texto: "Dudoso", icono: "fa-face-meh", color: "#FFC75A" };
  if (publico >= 20) return { texto: "Molesto", icono: "fa-face-frown", color: "#FF9F5A" };
  return { texto: "Abuchea", icono: "fa-face-angry", color: "#FF5E5E" };
}

export const ETIQUETAS: { id: Etiqueta; texto: string; icono: string }[] = [
  { id: "ad-hominem", texto: "Ad hominem", icono: "fa-user-xmark" },
  { id: "hombre-paja", texto: "Hombre de paja", icono: "fa-person-rays" },
  { id: "pendiente", texto: "Pendiente resbaladiza", icono: "fa-arrow-trend-down" },
  { id: "autoridad", texto: "Apelación a la autoridad", icono: "fa-crown" },
  { id: "dicotomia", texto: "Falsa dicotomía", icono: "fa-code-branch" },
  { id: "ninguna", texto: "Argumento sólido (sin falacia)", icono: "fa-circle-check" },
];

export const nombreEtiqueta = (e: Etiqueta) => ETIQUETAS.find((x) => x.id === e)!.texto;
