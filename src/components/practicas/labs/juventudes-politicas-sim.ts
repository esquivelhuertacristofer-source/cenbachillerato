/**
 * Lógica pura del simulador «Colectivo en acción» (CS-III-P03).
 *
 * El «Colectivo Raíces Jóvenes» de un municipio FICTICIO (Santa Marta del Llano)
 * quiere evitar que el único centro juvenil sea demolido para hacer un
 * estacionamiento. En 4 semanas elige formas de participación (las mismas que
 * describen A1, A2 y A5) y mueve tres indicadores: alcance, incidencia y
 * legitimidad. Todas las cifras son valores de JUEGO (simulación), no datos
 * reales. La sesión de cabildo del final depende de lo que se haya construido.
 *
 * Sin React. El modelo es determinista: mismas decisiones, mismo resultado.
 */

import type { Categoria } from "./juventudes-politicas-data";

export interface Ind {
  alcance: number;
  incidencia: number;
  legitimidad: number;
}

export const INICIO: Ind = { alcance: 10, incidencia: 5, legitimidad: 15 };
export const SEMANAS = 4;
export const ENERGIA = 3;

export interface Accion {
  id: string;
  nombre: string;
  forma: Categoria;
  icono: string;
  costo: number;
  /** Se hace en persona (en la calle, la plaza o la asamblea). */
  presencial: boolean;
  descripcion: string;
  delta: Ind;
}

export const ACCIONES: Accion[] = [
  { id: "asamblea", nombre: "Asamblea barrial", forma: "comunitaria", icono: "fa-people-group", costo: 1, presencial: true, descripcion: "Reunir al barrio, discutir y decidir en común qué se pide.", delta: { alcance: 6, incidencia: 2, legitimidad: 16 } },
  { id: "brigada", nombre: "Brigada de limpieza del centro", forma: "comunitaria", icono: "fa-broom", costo: 2, presencial: true, descripcion: "Rehabilitar el edificio con trabajo voluntario y mostrar que se cuida.", delta: { alcance: 10, incidencia: 3, legitimidad: 9 } },
  { id: "mural", nombre: "Mural en la barda del centro", forma: "cultural", icono: "fa-paint-roller", costo: 1, presencial: true, descripcion: "Pintar una demanda en la pared para que la vea todo el municipio.", delta: { alcance: 14, incidencia: 1, legitimidad: 3 } },
  { id: "festival", nombre: "Festival de rap y danza", forma: "cultural", icono: "fa-music", costo: 2, presencial: true, descripcion: "Una tarde de música y arte juvenil frente a la presidencia.", delta: { alcance: 16, incidencia: 3, legitimidad: 6 } },
  { id: "hashtag", nombre: "Campaña de hashtag en redes", forma: "digital", icono: "fa-hashtag", costo: 1, presencial: false, descripcion: "Difundir la causa y amplificar la demanda en redes sociales.", delta: { alcance: 18, incidencia: 1, legitimidad: -2 } },
  { id: "consulta", nombre: "Consulta popular juvenil", forma: "electoral", icono: "fa-square-poll-vertical", costo: 2, presencial: true, descripcion: "Preguntar con urna y boleta a la gente del municipio si el centro debe quedarse.", delta: { alcance: 8, incidencia: 16, legitimidad: 8 } },
  { id: "candidatura", nombre: "Postular a una joven de 18 años al cabildo juvenil", forma: "electoral", icono: "fa-user-check", costo: 3, presencial: true, descripcion: "Ser votado: una integrante mayor de 18 años compite por un cargo (Art. 35).", delta: { alcance: 6, incidencia: 15, legitimidad: 5 } },
];

export function accionDe(id: string): Accion {
  return ACCIONES.find((a) => a.id === id) ?? ACCIONES[0]!;
}

/** Requisito de legitimidad para que una acción formal funcione. */
const REQ_LEG: Record<string, number> = { consulta: 30, candidatura: 25 };

export interface Efecto {
  accion: string;
  delta: Ind;
  /** Qué pasó y por qué, en una frase. */
  nota: string;
  bueno: boolean;
}

export type Postura = "Indiferente" | "Atenta" | "Dispuesta a negociar" | "Cede";
export const POSTURAS: Postura[] = ["Indiferente", "Atenta", "Dispuesta a negociar", "Cede"];

export interface Reaccion {
  semana: number;
  postura: Postura;
  texto: string;
  /** Castigo que aplica la autoridad (si desacredita al colectivo). */
  castigo: Pick<Ind, "incidencia" | "legitimidad">;
}

export interface Resultado {
  ind: Ind;
  efectos: Efecto[][];
  reacciones: Reaccion[];
  formas: Categoria[];
  postura: Postura;
}

const tope = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export function posturaDe(ind: Ind): Postura {
  if (ind.incidencia < 10) return "Indiferente";
  if (ind.incidencia < 25) return "Atenta";
  if (ind.incidencia < 45) return "Dispuesta a negociar";
  return "Cede";
}

function reaccionDe(semana: number, ind: Ind): Reaccion {
  const postura = posturaDe(ind);
  if (ind.alcance >= 45 && ind.legitimidad < 20) {
    return {
      semana,
      postura: "Indiferente",
      texto: "La alcaldía descalifica a los jóvenes: «solo hacen ruido». Se ve mucho, pero nadie respalda en forma al colectivo.",
      castigo: { incidencia: -4, legitimidad: -5 },
    };
  }
  const textos: Record<Postura, string> = {
    Indiferente: "La alcaldía ni responde el oficio del colectivo: todavía no tiene motivos para escuchar.",
    Atenta: "Un funcionario pide copia de la propuesta: ya los están mirando.",
    "Dispuesta a negociar": "La alcaldía abre una mesa de diálogo con el colectivo.",
    Cede: "La alcaldía anuncia que revisará el proyecto del estacionamiento.",
  };
  return { semana, postura, texto: textos[postura], castigo: { incidencia: 0, legitimidad: 0 } };
}

/**
 * Repite las decisiones desde cero y devuelve los indicadores.
 * `semanas[i]` son las acciones de la semana i; las primeras `cerradas`
 * semanas ya terminaron (la autoridad reaccionó); la siguiente está en curso.
 */
export function simular(semanas: string[][], cerradas: number): Resultado {
  let ind: Ind = { ...INICIO };
  const efectos: Efecto[][] = [];
  const reacciones: Reaccion[] = [];
  const usos: Record<string, number> = {};
  const formas = new Set<Categoria>();
  let hizoPresencial = false;

  semanas.forEach((acciones, s) => {
    const lista: Efecto[] = [];
    const formasSemana = new Set<Categoria>();
    for (const id of acciones) {
      const a = accionDe(id);
      const previos = usos[id] ?? 0;
      let d: Ind = { ...a.delta };
      let nota = a.descripcion;
      let bueno = true;

      if (id === "hashtag") {
        if (hizoPresencial) {
          d = { alcance: 18, incidencia: 9, legitimidad: 2 };
          nota = "Las redes se articulan con lo que ya hicieron en persona: la campaña convence y presiona.";
        } else {
          nota = "Sin acciones en persona detrás, el hashtag se ve mucho pero no mueve decisiones y resta credibilidad.";
          bueno = false;
        }
      } else if (REQ_LEG[id] !== undefined) {
        if (ind.legitimidad < REQ_LEG[id]!) {
          d = { alcance: 2, incidencia: 3, legitimidad: -6 };
          nota = "Se lanzó sin el respaldo de la comunidad: participa muy poca gente y la acción pierde credibilidad.";
          bueno = false;
        } else {
          nota = id === "consulta" ? "Con el barrio ya organizado, la consulta reúne votos y la autoridad no puede ignorarla." : "Con respaldo del barrio, la candidatura llega al cabildo con legitimidad.";
        }
      } else if (id === "asamblea") {
        nota = "Decidir en común da legitimidad: la propuesta ya es del barrio, no de unos cuantos.";
      } else if (id === "mural" || id === "festival") {
        nota = "Mucha gente ve la causa, pero el arte solo no obliga a la autoridad a decidir.";
      } else if (id === "brigada") {
        nota = "El trabajo voluntario muestra compromiso y suma apoyo vecinal.";
      }

      if (previos > 0) {
        const f = Math.pow(0.55, previos);
        d = { alcance: d.alcance > 0 ? d.alcance * f : d.alcance, incidencia: d.incidencia > 0 ? d.incidencia * f : d.incidencia, legitimidad: d.legitimidad > 0 ? d.legitimidad * f : d.legitimidad };
        nota = "Repetir la misma forma rinde cada vez menos: la gente ya la vio. " + nota;
        bueno = false;
      }
      usos[id] = previos + 1;
      if (a.presencial) hizoPresencial = true;
      formas.add(a.forma);
      formasSemana.add(a.forma);

      ind = { alcance: tope(ind.alcance + d.alcance), incidencia: tope(ind.incidencia + d.incidencia), legitimidad: tope(ind.legitimidad + d.legitimidad) };
      lista.push({ accion: id, delta: { alcance: Math.round(d.alcance), incidencia: Math.round(d.incidencia), legitimidad: Math.round(d.legitimidad) }, nota, bueno });
    }

    if (s < cerradas) {
      // Articular formas distintas en la misma semana vuelve más fuerte la presión.
      if (formasSemana.size >= 2) {
        ind = { ...ind, incidencia: tope(ind.incidencia + 4) };
        lista.push({ accion: "articulacion", delta: { alcance: 0, incidencia: 4, legitimidad: 0 }, nota: "Combinar formas distintas en la misma semana (comunitaria, cultural, digital, electoral) vuelve más fuerte la presión.", bueno: true });
      }
      const r = reaccionDe(s + 1, ind);
      ind = { ...ind, incidencia: tope(ind.incidencia + r.castigo.incidencia), legitimidad: tope(ind.legitimidad + r.castigo.legitimidad) };
      reacciones.push(r);
    }
    efectos.push(lista);
  });

  return { ind, efectos, reacciones, formas: [...formas], postura: posturaDe(ind) };
}

export type VotoCabildo = "aprueba" | "negocia" | "rechaza";

export interface Sesion {
  voto: VotoCabildo;
  puntaje: number;
  texto: string;
}

export const UMBRAL_APRUEBA = 58;
export const UMBRAL_NEGOCIA = 40;

/** Sesión de cabildo: pesa más lo que obliga (incidencia) y lo que respalda (legitimidad). */
export function cabildo(ind: Ind): Sesion {
  const puntaje = Math.round(ind.incidencia * 0.55 + ind.legitimidad * 0.3 + ind.alcance * 0.15);
  if (puntaje >= UMBRAL_APRUEBA) {
    return { voto: "aprueba", puntaje, texto: "El cabildo vota conservar el centro juvenil y abrir un consejo de jóvenes: la causa se volvió decisión pública." };
  }
  if (puntaje >= UMBRAL_NEGOCIA) {
    return { voto: "negocia", puntaje, texto: "El cabildo pospone la demolición y ofrece un acuerdo parcial: hubo presión, pero faltó fuerza para ganar." };
  }
  return { voto: "rechaza", puntaje, texto: "El cabildo aprueba el estacionamiento: la causa se vio, pero no tuvo la fuerza para cambiar la decisión." };
}

/** Cuántas formas distintas de participación se han usado. */
export function formasUsadas(semanas: string[][]): number {
  const s = new Set<Categoria>();
  for (const sem of semanas) for (const id of sem) s.add(accionDe(id).forma);
  return s.size;
}

export function energiaGastada(acciones: string[]): number {
  return acciones.reduce((t, id) => t + accionDe(id).costo, 0);
}
