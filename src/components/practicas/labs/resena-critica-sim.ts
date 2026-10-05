/**
 * Lógica pura del «Editor de reseñas» (LC-III-P06). Sin React.
 *
 * La obra y su autora son FICTICIAS. El alumno arma una reseña eligiendo una
 * frase para cada parte; de lo que elige salen tres medidores de un lector
 * simulado (todas las cifras son valores de juego: «simulación»).
 *
 * Reglas del modelo (explicadas al alumno en cada frase con `porque`):
 *  - credibilidad: cuánto confía el lector en el juicio. Sube con ficha completa
 *    y argumentos que miran la obra; baja con opinión sin argumento, gusto
 *    personal o ataque a la persona. Una valoración sin argumentos TOPA la
 *    credibilidad en 45: lo bueno que la rodea no la rescata.
 *  - utilidad: cuánto le sirve al lector para decidir si la lee.
 *  - ganas: interés por leer la obra. Un spoiler la hunde.
 *  - coherencia: valorar algo que el resumen no explicó resta utilidad.
 */

export type Parte = "ficha" | "resumen" | "valoracion" | "recomendacion";

export type Falla = "sin-ficha" | "spoiler" | "vago" | "sin-argumento" | "gusto" | "ataque" | "imposicion" | "vacia";

export interface Obra {
  titulo: string;
  autora: string;
  tipo: string;
}

/** Obra inventada: no existe fuera de este laboratorio. */
export const OBRA: Obra = {
  titulo: "El invierno de las jacarandas",
  autora: "Irene Calzada Brun",
  tipo: "novela (ficticia)",
};

export interface OpcionResena {
  id: string;
  parte: Parte;
  texto: string;
  cred: number;
  util: number;
  ganas: number;
  falla: Falla | null;
  /** Por qué pesa así: la retroalimentación explicativa. */
  porque: string;
}

export const PARTES: { id: Parte; titulo: string; icono: string; pista: string }[] = [
  { id: "ficha", titulo: "Ficha y contexto", icono: "fa-id-card", pista: "Presenta la obra y su autora." },
  { id: "resumen", titulo: "Resumen sin spoilers", icono: "fa-align-left", pista: "Cuenta de qué trata, sin arruinar nada." },
  { id: "valoracion", titulo: "Valoración argumentada", icono: "fa-scale-balanced", pista: "Opina, pero con razones." },
  { id: "recomendacion", titulo: "Recomendación", icono: "fa-bullhorn", pista: "¿A quién le conviene leerla?" },
];

export const OPCIONES: OpcionResena[] = [
  // ── Ficha ──
  {
    id: "f1", parte: "ficha", cred: 25, util: 20, ganas: 8, falla: null,
    texto: "«El invierno de las jacarandas» (2021) es la tercera novela de Irene Calzada Brun, una historia íntima de 248 páginas.",
    porque: "Identifica la obra, la autora y el contexto: el lector sabe exactamente de qué se habla.",
  },
  {
    id: "f2", parte: "ficha", cred: 6, util: 2, ganas: 0, falla: "sin-ficha",
    texto: "Acabo de terminar un libro y me tiene el corazón hecho pedazos.",
    porque: "No dice qué obra es ni de quién. Sin ficha, el lector no puede ni buscarla.",
  },
  {
    id: "f3", parte: "ficha", cred: 4, util: 3, ganas: 4, falla: "vacia",
    texto: "Esta novela ya es la mejor de la década y lo sabe todo el mundo.",
    porque: "Empieza juzgando antes de presentar la obra, y «lo sabe todo el mundo» no es evidencia.",
  },
  // ── Resumen ──
  {
    id: "r1", parte: "resumen", cred: 20, util: 28, ganas: 30, falla: null,
    texto: "Elvira, una traductora jubilada, vuelve a su pueblo en la sierra para vender la casa de su madre y encuentra unas cartas que cambian lo que creía de su familia.",
    porque: "Describe el planteamiento y deja el misterio intacto: informa y da ganas de leer.",
  },
  {
    id: "r2", parte: "resumen", cred: 8, util: 12, ganas: -25, falla: "spoiler",
    texto: "Al final Elvira descubre que su madre no murió, sino que se fue con otro hombre, y la perdona en el último capítulo.",
    porque: "Cuenta el desenlace: es un spoiler. El lector ya no tiene nada que descubrir.",
  },
  {
    id: "r3", parte: "resumen", cred: 6, util: 5, ganas: 4, falla: "vago",
    texto: "Es una historia sobre una mujer y su familia, con muchas cosas que pasan.",
    porque: "Es tan vago que podría servir para cualquier libro. No informa nada concreto.",
  },
  // ── Valoración ──
  {
    id: "v1", parte: "valoracion", cred: 40, util: 30, ganas: 14, falla: null,
    texto: "Las cartas alternadas con el presente aciertan: el lector reconstruye el pasado al ritmo de Elvira. El tercer tramo se alarga, pero la voz de la narradora sostiene el interés.",
    porque: "Es un juicio argumentado: señala un recurso de la obra, explica su efecto y reconoce un defecto.",
  },
  {
    id: "v2", parte: "valoracion", cred: 8, util: 4, ganas: 6, falla: "sin-argumento",
    texto: "Es una obra maestra y punto: nadie con buen gusto puede negarlo.",
    porque: "Es una opinión sin argumento. Afirmar sin razones no convence, y el «y punto» cierra la conversación.",
  },
  {
    id: "v3", parte: "valoracion", cred: 12, util: 8, ganas: 0, falla: "gusto",
    texto: "A mí me aburrió porque no me gustan los libros lentos.",
    porque: "Habla del gusto de quien reseña, no de la obra. No dice qué falla en el libro.",
  },
  {
    id: "v4", parte: "valoracion", cred: 2, util: 2, ganas: -6, falla: "ataque",
    texto: "Calzada Brun escribe así porque nunca ha salido de su colonia.",
    porque: "Ataca a la persona, no a la obra. Es una descalificación sin evidencia.",
  },
  // ── Recomendación ──
  {
    id: "c1", parte: "recomendacion", cred: 15, util: 22, ganas: 18, falla: null,
    texto: "La recomiendo a quien disfrute de narrativas íntimas y pausadas; quien busque acción quizá la sienta lenta.",
    porque: "Dice para quién sirve y para quién no: el lector puede decidir con información.",
  },
  {
    id: "c2", parte: "recomendacion", cred: 2, util: 4, ganas: -4, falla: "imposicion",
    texto: "Léanla todos, sin excepción, o no entenderán nada de literatura.",
    porque: "Impone en lugar de orientar. Una buena reseña da elementos para que el lector decida.",
  },
  {
    id: "c3", parte: "recomendacion", cred: 4, util: 2, ganas: 0, falla: "vacia",
    texto: "Cada quien que decida.",
    porque: "No ayuda a decidir: elude la recomendación que el lector esperaba.",
  },
];

/** Fallas que el alumno debe descubrir (para la misión de explorar). */
export const FALLAS_GRAVES: Falla[] = ["spoiler", "sin-argumento", "gusto", "ataque", "imposicion"];

export type Seleccion = Partial<Record<Parte, string>>;

export function opcionesDe(parte: Parte): OpcionResena[] {
  return OPCIONES.filter((o) => o.parte === parte);
}

export function opcionPorId(id: string | undefined): OpcionResena | undefined {
  return OPCIONES.find((o) => o.id === id);
}

export interface Medidores {
  cred: number;
  util: number;
  ganas: number;
}

export interface Reaccion {
  id: "dani" | "ibarra" | "memo";
  nombre: string;
  rol: string;
  estado: "espera" | "bien" | "meh" | "mal";
  texto: string;
}

export interface EvaluacionResena {
  m: Medidores;
  completa: boolean;
  fallas: Falla[];
  /** Notas del modelo que explican por qué se movieron los medidores. */
  notas: string[];
  nivel: "vacia" | "floja" | "aceptable" | "excelente";
  reacciones: Reaccion[];
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export function evaluarResena(sel: Seleccion): EvaluacionResena {
  const elegidas = PARTES.map((p) => opcionPorId(sel[p.id])).filter((o): o is OpcionResena => !!o);
  let cred = elegidas.reduce((s, o) => s + o.cred, 0);
  let util = elegidas.reduce((s, o) => s + o.util, 0);
  let ganas = elegidas.reduce((s, o) => s + o.ganas, 0);
  const fallas = elegidas.map((o) => o.falla).filter((f): f is Falla => !!f);
  const notas: string[] = [];

  const val = opcionPorId(sel.valoracion);
  if (val && val.falla && cred > 45) {
    cred = 45;
    notas.push("Una valoración sin argumentos topa la credibilidad en 45: lo bueno que la rodea no la rescata.");
  }
  const res = opcionPorId(sel.resumen);
  if (val && !val.falla && res && res.falla === "vago") {
    util -= 12;
    notas.push("Valoras un recurso que el resumen nunca explicó: el lector no sabe de qué hablas (-12 de utilidad).");
  }
  if (res?.falla === "spoiler") {
    ganas -= 15;
    notas.push("El spoiler hunde las ganas de leer, aunque lo demás esté bien escrito.");
  }
  const m: Medidores = { cred: clamp(cred), util: clamp(util), ganas: clamp(ganas) };
  const completa = PARTES.every((p) => !!sel[p.id]);

  const nivel: EvaluacionResena["nivel"] =
    elegidas.length === 0 ? "vacia" : m.cred >= 70 && m.util >= 70 && completa && fallas.length === 0 ?"excelente" : m.cred >= 45 && m.util >= 40 ? "aceptable" : "floja";

  return { m, completa, fallas, notas, nivel, reacciones: reaccionesDe(sel, m, fallas) };
}

function reaccionesDe(sel: Seleccion, m: Medidores, fallas: Falla[]): Reaccion[] {
  const val = opcionPorId(sel.valoracion);
  const dani: Reaccion = { id: "dani", nombre: "Dani", rol: "Busca qué leer", estado: "espera", texto: "Todavía no sé nada de la novela." };
  if (sel.ficha || sel.resumen || sel.recomendacion) {
    if (m.util >= 70) Object.assign(dani, { estado: "bien", texto: "Ya sé de qué va y para quién es. La pido en la biblioteca." });
    else if (m.util >= 40) Object.assign(dani, { estado: "meh", texto: "Algo me queda claro, pero me falta saber si me conviene." });
    else Object.assign(dani, { estado: "mal", texto: "Leí la reseña y sigo sin saber si vale la pena." });
  }
  const ibarra: Reaccion = { id: "ibarra", nombre: "Prof. Ibarra", rol: "Lectora exigente", estado: "espera", texto: "Espero ver razones, no solo opiniones." };
  if (val) {
    if (val.falla === "sin-argumento") Object.assign(ibarra, { estado: "mal", texto: "«Y punto» no es un argumento. ¿Por qué es una obra maestra?" });
    else if (val.falla === "gusto") Object.assign(ibarra, { estado: "mal", texto: "Esto habla de tus gustos, no de la novela." });
    else if (val.falla === "ataque") Object.assign(ibarra, { estado: "mal", texto: "Se critica la obra, no a la autora." });
    else if (m.cred >= 70) Object.assign(ibarra, { estado: "bien", texto: "Hay argumentos y matices. Esto sí es una reseña crítica." });
    else Object.assign(ibarra, { estado: "meh", texto: "Argumentas bien, pero te falta ficha o contexto para creerte del todo." });
  }
  const memo: Reaccion = { id: "memo", nombre: "Memo", rol: "Odia los spoilers", estado: "espera", texto: "Cuidado con contarme el final." };
  if (sel.resumen) {
    if (fallas.includes("spoiler")) Object.assign(memo, { estado: "mal", texto: "¡Me contaste el final! Ya no la voy a leer." });
    else if (m.ganas >= 55) Object.assign(memo, { estado: "bien", texto: "Me quedé con ganas de descubrir qué dicen las cartas." });
    else Object.assign(memo, { estado: "meh", texto: "No me arruinaste nada, pero tampoco me convenciste." });
  }
  return [dani, ibarra, memo];
}

/** Resumen de una publicación, para la retroalimentación final. */
export function veredictoPublicacion(ev: EvaluacionResena): { titulo: string; texto: string; bien: boolean } {
  if (ev.nivel === "excelente") {
    return { titulo: "Reseña publicada: convence", texto: "Presentaste la obra, resumiste sin spoilers, argumentaste y orientaste. Así el lector forma su propia opinión de manera informada.", bien: true };
  }
  const peor = ev.fallas[0];
  const causa: Record<Falla, string> = {
    "sin-ficha": "faltó presentar la obra y su autora",
    spoiler: "contaste el desenlace",
    vago: "el resumen no dijo nada concreto",
    "sin-argumento": "la opinión no tenía argumentos",
    gusto: "hablaste de tu gusto y no de la obra",
    ataque: "atacaste a la persona y no a la obra",
    imposicion: "impusiste tu opinión en lugar de orientar",
    vacia: "una parte quedó vacía de contenido",
  };
  return {
    titulo: "Reseña publicada: no convence",
    texto: peor ? `Lo que más pesó: ${causa[peor]}. Cambia esa frase y mira cómo se mueven los medidores.` : "Es aceptable, pero aún le falta precisión para ser excelente.",
    bien: false,
  };
}
