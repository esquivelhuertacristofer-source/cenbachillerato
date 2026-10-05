/**
 * Lógica pura del simulador «Mesa del editor» (LC-III-P04, subgéneros narrativos).
 *
 * La semilla es un cuento FICTICIO escrito para este laboratorio (no cita a
 * ningún autor): «La llave llegó en un sobre sin remitente». El alumno elige
 * una convención en cuatro ranuras (escenario, personaje, conflicto, tono). Cada
 * convención empuja el cuento hacia uno o dos de los seis subgéneros de la
 * fuente. El «lector simulado» suma los empujes y dice qué subgénero
 * reconocería; las convenciones que no suman al subgénero del encargo se
 * señalan como contradicciones. Todos los porcentajes son de simulación.
 */
import type { Subgenero } from "./subgeneros-narrativos-data";

export type Ranura = "escenario" | "personaje" | "conflicto" | "tono";

export const RANURAS: { id: Ranura; etiqueta: string; icono: string }[] = [
  { id: "escenario", etiqueta: "Escenario", icono: "fa-location-dot" },
  { id: "personaje", etiqueta: "Personaje", icono: "fa-user" },
  { id: "conflicto", etiqueta: "Conflicto", icono: "fa-bolt" },
  { id: "tono", etiqueta: "Tono y recursos", icono: "fa-feather-pointed" },
];

export const SUBGENEROS: Subgenero[] = ["suspenso", "terror", "cienciaficcion", "autoficcion", "neorrealismo", "antropoceno"];

export interface Opcion {
  id: string;
  ranura: Ranura;
  /** Lo que ve el alumno en la tarjeta (nunca nombra el subgénero). */
  texto: string;
  icono: string;
  /** Frase que se suma al párrafo de apertura del cuento. */
  frase: string;
  /** Cuánto empuja a cada subgénero (3 = principal, 1 = matiz). */
  pesos: Partial<Record<Subgenero, number>>;
}

/** Frase fija con la que arranca el cuento (semilla ficticia). */
export const SEMILLA = "La llave llegó en un sobre sin remitente.";

export const OPCIONES: Opcion[] = [
  // ── Escenario ───────────────────────────────────────────────────────
  { id: "esc-su", ranura: "escenario", texto: "El último andén, antes de que cierren la estación", icono: "fa-train",
    frase: "Todo ocurre en el último andén de una estación que cerrará a medianoche.", pesos: { suspenso: 3, terror: 1 } },
  { id: "esc-te", ranura: "escenario", texto: "Una casa vieja donde los cuartos cambian de lugar", icono: "fa-house-chimney-crack",
    frase: "Todo ocurre en una casa vieja donde los cuartos cambian de lugar cuando nadie mira.", pesos: { terror: 3, suspenso: 1 } },
  { id: "esc-cf", ranura: "escenario", texto: "Una ciudad flotante en el año 2160", icono: "fa-city",
    frase: "Todo ocurre en una ciudad flotante, en el año 2160.", pesos: { cienciaficcion: 3, antropoceno: 1 } },
  { id: "esc-au", ranura: "escenario", texto: "El cuarto donde la propia autora escribe", icono: "fa-pen-fancy",
    frase: "Todo ocurre en el mismo cuarto donde ahora escribo esto.", pesos: { autoficcion: 3, neorrealismo: 1 } },
  { id: "esc-ne", ranura: "escenario", texto: "Una vecindad de la periferia, entre combis y tianguis", icono: "fa-people-roof",
    frase: "Todo ocurre en una vecindad de la periferia, entre combis y puestos del tianguis.", pesos: { neorrealismo: 3, autoficcion: 1 } },
  { id: "esc-an", ranura: "escenario", texto: "Un pueblo costero al que el mar se le mete cada año", icono: "fa-water",
    frase: "Todo ocurre en un pueblo costero al que el mar se le mete un poco más cada año.", pesos: { antropoceno: 3, cienciaficcion: 1 } },

  // ── Personaje ───────────────────────────────────────────────────────
  { id: "per-su", ranura: "personaje", texto: "Una testigo que solo cuenta la mitad de lo que vio", icono: "fa-user-secret",
    frase: "La llave le tocó a una testigo que solo cuenta la mitad de lo que vio.", pesos: { suspenso: 3, terror: 1 } },
  { id: "per-te", ranura: "personaje", texto: "Un niño que oye lo que los adultos no oyen", icono: "fa-child",
    frase: "La llave le tocó a un niño que escucha lo que los adultos no oyen.", pesos: { terror: 3, suspenso: 1 } },
  { id: "per-cf", ranura: "personaje", texto: "Una ingeniera de mantenimiento de colonias orbitales", icono: "fa-user-astronaut",
    frase: "La llave le tocó a una ingeniera de mantenimiento de colonias orbitales.", pesos: { cienciaficcion: 3, antropoceno: 1 } },
  { id: "per-au", ranura: "personaje", texto: "La propia narradora, con su nombre y su oficio de escritora", icono: "fa-id-card",
    frase: "La llave me tocó a mí, con mi nombre y mi oficio de escritora.", pesos: { autoficcion: 3, neorrealismo: 1 } },
  { id: "per-ne", ranura: "personaje", texto: "Un repartidor de diecinueve años, sin contrato", icono: "fa-motorcycle",
    frase: "La llave le tocó a un repartidor de diecinueve años, sin contrato.", pesos: { neorrealismo: 3, autoficcion: 1 } },
  { id: "per-an", ranura: "personaje", texto: "Una bióloga que mide el nivel del agua cada mañana", icono: "fa-microscope",
    frase: "La llave le tocó a una bióloga que mide el nivel del agua cada mañana.", pesos: { antropoceno: 3, cienciaficcion: 1 } },

  // ── Conflicto ───────────────────────────────────────────────────────
  { id: "con-su", ranura: "conflicto", texto: "Decidir en quién confiar antes de que acabe la hora", icono: "fa-hourglass-half",
    frase: "Tiene hasta que suene la campana para decidir en quién confiar, y le falta información.", pesos: { suspenso: 3, terror: 1 } },
  { id: "con-te", ranura: "conflicto", texto: "Algo en la casa no debería estar ahí", icono: "fa-ghost",
    frase: "Algo en la casa no debería estar ahí, y empieza a mirarla de vuelta.", pesos: { terror: 3, suspenso: 1 } },
  { id: "con-cf", ranura: "conflicto", texto: "Un sistema empieza a recordar lo que nadie programó", icono: "fa-microchip",
    frase: "La puerta que abre la llave pertenece a un sistema que empezó a recordar lo que nadie le programó.", pesos: { cienciaficcion: 3, terror: 1 } },
  { id: "con-au", ranura: "conflicto", texto: "Dudar de qué parte del recuerdo ocurrió y cuál se inventó", icono: "fa-circle-question",
    frase: "No está segura de qué parte de este recuerdo ocurrió y cuál inventó.", pesos: { autoficcion: 3, suspenso: 1 } },
  { id: "con-ne", ranura: "conflicto", texto: "Pagar la renta cuando el trabajo se acaba", icono: "fa-coins",
    frase: "Si no paga la renta de la semana, el cuarto que abre la llave ya no será suyo.", pesos: { neorrealismo: 3, suspenso: 1 } },
  { id: "con-an", ranura: "conflicto", texto: "No llueve hace meses: la comunidad decide si se queda", icono: "fa-cloud-sun",
    frase: "Hace meses que no llueve y la comunidad debe decidir si se queda o se va.", pesos: { antropoceno: 3, neorrealismo: 1 } },

  // ── Tono y recursos ─────────────────────────────────────────────────
  { id: "ton-su", ranura: "tono", texto: "Escenas que cortan en el momento más tenso", icono: "fa-scissors",
    frase: "El relato corta cada escena en el momento más tenso.", pesos: { suspenso: 3, terror: 1 } },
  { id: "ton-te", ranura: "tono", texto: "Silencios y detalles incómodos que hacen crecer el miedo", icono: "fa-eye",
    frase: "El relato avanza con silencios y detalles incómodos hasta que el miedo ya no se puede ignorar.", pesos: { terror: 3, suspenso: 1 } },
  { id: "ton-cf", ranura: "tono", texto: "Explicar la tecnología y preguntarse qué cambió en la sociedad", icono: "fa-atom",
    frase: "El relato explica la tecnología y se pregunta qué cambió en la sociedad.", pesos: { cienciaficcion: 3, antropoceno: 1 } },
  { id: "ton-au", ranura: "tono", texto: "Mezclar recuerdos comprobables con detalles inventados", icono: "fa-shuffle",
    frase: "El relato mezcla recuerdos comprobables con detalles inventados, sin avisar cuál es cuál.", pesos: { autoficcion: 3, neorrealismo: 1 } },
  { id: "ton-ne", ranura: "tono", texto: "Lenguaje directo, sin adornos, con voces de la calle", icono: "fa-comment-dots",
    frase: "El relato habla directo, sin adornos, con las voces de la calle.", pesos: { neorrealismo: 3, autoficcion: 1 } },
  { id: "ton-an", ranura: "tono", texto: "Una naturaleza que actúa, no solo decora", icono: "fa-leaf",
    frase: "El relato trata a la naturaleza como quien actúa, no como decorado.", pesos: { antropoceno: 3, cienciaficcion: 1 } },
];

export type Eleccion = Partial<Record<Ranura, string>>;

export const opcionesDe = (r: Ranura): Opcion[] => OPCIONES.filter((o) => o.ranura === r);

/** Colores de la portada por subgénero (tono HSL). */
export const TONO_PORTADA: Record<Subgenero, number> = {
  suspenso: 215,
  terror: 350,
  cienciaficcion: 188,
  autoficcion: 275,
  neorrealismo: 32,
  antropoceno: 140,
};

export interface LecturaLector {
  /** Puntos crudos por subgénero. */
  puntos: Record<Subgenero, number>;
  /** Porcentaje (0–100) de cada subgénero; suma ~100 si hay algo elegido. */
  porcentajes: Record<Subgenero, number>;
  /** Subgénero que el lector reconocería, o null si no hay nada elegido. */
  lider: Subgenero | null;
  /** Diferencia en puntos porcentuales entre el primero y el segundo. */
  margen: number;
  /** Segundo subgénero cuando la mezcla es notoria (margen < 15). */
  mezclaCon: Subgenero | null;
  elegidas: number;
}

/** El lector simulado: suma los empujes de lo elegido. */
export function leerCuento(eleccion: Eleccion): LecturaLector {
  const puntos = Object.fromEntries(SUBGENEROS.map((s) => [s, 0])) as Record<Subgenero, number>;
  let elegidas = 0;
  for (const r of RANURAS) {
    const op = OPCIONES.find((o) => o.id === eleccion[r.id]);
    if (!op) continue;
    elegidas++;
    for (const s of SUBGENEROS) puntos[s] += op.pesos[s] ?? 0;
  }
  const total = SUBGENEROS.reduce((a, s) => a + puntos[s], 0);
  const porcentajes = Object.fromEntries(SUBGENEROS.map((s) => [s, total ? Math.round((100 * puntos[s]) / total) : 0])) as Record<Subgenero, number>;
  const orden = SUBGENEROS.slice().sort((a, b) => puntos[b] - puntos[a]);
  const lider = total ? orden[0]! : null;
  const margen = total ? porcentajes[orden[0]!] - porcentajes[orden[1]!] : 0;
  const mezclaCon = total && margen < 15 && puntos[orden[1]!] > 0 ? orden[1]! : null;
  return { puntos, porcentajes, lider, margen, mezclaCon, elegidas };
}

/** Párrafo de apertura armado con lo elegido (lo que falta queda como hueco). */
export function parrafoApertura(eleccion: Eleccion): { fragmentos: { ranura: Ranura | "semilla"; texto: string }[]; completo: boolean } {
  const fragmentos: { ranura: Ranura | "semilla"; texto: string }[] = [{ ranura: "semilla", texto: SEMILLA }];
  let completo = true;
  for (const r of RANURAS) {
    const op = OPCIONES.find((o) => o.id === eleccion[r.id]);
    if (op) fragmentos.push({ ranura: r.id, texto: op.frase });
    else completo = false;
  }
  return { fragmentos, completo };
}

export interface Veredicto {
  /** El cuento ya se lee como el subgénero del encargo y ninguna convención lo contradice. */
  cumplido: boolean;
  faltan: Ranura[];
  /** Ranuras cuya convención no suma nada al subgénero del encargo. */
  contradicciones: Ranura[];
  /** Explicación breve de lo que pasa. */
  mensaje: string;
}

/** Evalúa una elección contra el encargo del editor. */
export function evaluarEncargo(
  objetivo: Subgenero,
  eleccion: Eleccion,
  nombres: Record<Subgenero, string>
): Veredicto {
  const lec = leerCuento(eleccion);
  const faltan = RANURAS.filter((r) => !eleccion[r.id]).map((r) => r.id);
  const contradicciones: Ranura[] = [];
  for (const r of RANURAS) {
    const op = OPCIONES.find((o) => o.id === eleccion[r.id]);
    if (op && (op.pesos[objetivo] ?? 0) < 1) contradicciones.push(r.id);
  }
  const cumplido = faltan.length === 0 && contradicciones.length === 0 && lec.lider === objetivo;
  let mensaje: string;
  if (lec.elegidas === 0) {
    mensaje = "Aún no eliges ninguna convención: el lector no sabe qué cuento le ofreces.";
  } else if (contradicciones.length > 0) {
    const r = contradicciones[0]!;
    const op = OPCIONES.find((o) => o.id === eleccion[r])!;
    const principal = SUBGENEROS.slice().sort((a, b) => (op.pesos[b] ?? 0) - (op.pesos[a] ?? 0))[0]!;
    const etiqueta = RANURAS.find((x) => x.id === r)!.etiqueta.toLowerCase();
    mensaje = `El ${etiqueta} que elegiste empuja a ${nombres[principal]}, no a ${nombres[objetivo]}: el lector se confunde.`;
  } else if (faltan.length > 0) {
    mensaje = `Va bien hacia ${nombres[objetivo]}. Falta elegir: ${faltan.map((f) => RANURAS.find((x) => x.id === f)!.etiqueta.toLowerCase()).join(", ")}.`;
  } else if (lec.lider !== objetivo && lec.lider) {
    mensaje = `Cada convención toca algo de ${nombres[objetivo]}, pero pesan más las de ${nombres[lec.lider]}: el lector reconoce ${nombres[lec.lider]}.`;
  } else {
    mensaje = `Todas las convenciones suman: el lector reconoce ${nombres[objetivo]}.`;
  }
  return { cumplido, faltan, contradicciones, mensaje };
}
