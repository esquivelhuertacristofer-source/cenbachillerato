/**
 * Simulador «Student council» (IN-IV-P02): lógica pura, sin React.
 *
 * El comité estudiantil de una prepa FICTICIA decide el viaje de fin de
 * semestre. El alumno elige su opción y la defiende en inglés en cuatro turnos:
 * arma cada intervención con tres piezas (apertura · preferencia · razón). Cada
 * pieza mueve tres medidores —claridad, respeto y convencimiento— y la cara y
 * la intención de voto de cada personaje. Si el respeto cae bajo el umbral, el
 * grupo SE CIERRA: lo que digas ya no convence. Al final se vota.
 *
 * Las razones se comprueban contra la ficha del viaje: «because it's cheaper»
 * es verdad para el museo y mentira para el parque acuático. Personas, escuela
 * y lugares son ficticios; precios, tiempos y puntajes son una simulación.
 *
 * También vive aquí el analizador del modo «Write your reply»: lee la frase
 * que escribe el alumno y detecta las estructuras del glosario (IN-IV-P02-A5),
 * los errores que la progresión señala (I'd rather to, prefer … than, doble
 * comparativo/superlativo) y las expresiones groseras.
 */

import type { EstructuraId } from "./preferencias-elecciones-ingles-data";

/* ── Opciones del viaje (ficticias · simulación) ─────────────────────────── */

export type OpcionId = "museo" | "parque";

export interface OpcionViaje {
  id: OpcionId;
  nombre: string;
  /** Cómo se dice en las frases: «the museum». */
  en: string;
  foto: string;
  icono: string;
  datos: { icono: string; texto: string }[];
}

export const OPCIONES: Record<OpcionId, OpcionViaje> = {
  museo: {
    id: "museo",
    nombre: "Museo de Ciencias Chispa",
    en: "the museum",
    foto: "museo",
    icono: "fa-flask",
    datos: [
      { icono: "fa-ticket", texto: "Entrada: $60" },
      { icono: "fa-bus", texto: "Autobús: 50 min" },
      { icono: "fa-house", texto: "Bajo techo" },
      { icono: "fa-lightbulb", texto: "Salas de ciencia" },
    ],
  },
  parque: {
    id: "parque",
    nombre: "Parque acuático Olas Azules",
    en: "the water park",
    foto: "parque",
    icono: "fa-person-swimming",
    datos: [
      { icono: "fa-ticket", texto: "Entrada: $220" },
      { icono: "fa-bus", texto: "Autobús: 25 min" },
      { icono: "fa-sun", texto: "Al aire libre" },
      { icono: "fa-water", texto: "Toboganes y albercas" },
    ],
  },
};

export const PRONOSTICO = "Pronóstico para el día del viaje: lluvia por la tarde.";

export const otraOpcion = (o: OpcionId): OpcionId => (o === "museo" ? "parque" : "museo");

/* ── Personajes (ficticios) ──────────────────────────────────────────────── */

export type PersonajeId = "sofia" | "marco" | "lupita" | "rios";

export const PERSONAJES: Record<PersonajeId, { nombre: string; rol: string; foto: string }> = {
  sofia: { nombre: "Sofía", rol: "presidenta del comité", foto: "sofia" },
  marco: { nombre: "Marco", rol: "defiende la otra opción", foto: "marco" },
  lupita: { nombre: "Lupita", rol: "indecisa: cuida precio y tiempo", foto: "lupita" },
  rios: { nombre: "Mr. Ríos", rol: "asesor del grupo", foto: "rios" },
};

export const ORDEN_PERSONAJES: PersonajeId[] = ["sofia", "marco", "lupita", "rios"];

export type Animo = "atento" | "convencido" | "dudoso" | "confundido" | "cerrado";

export const ANIMO_INFO: Record<Animo, { etiqueta: string; icono: string; color: string }> = {
  atento: { etiqueta: "Atento", icono: "fa-face-meh", color: "#8FA3BF" },
  convencido: { etiqueta: "Convencido", icono: "fa-face-grin-beam", color: "#34D399" },
  dudoso: { etiqueta: "Con dudas", icono: "fa-face-rolling-eyes", color: "#FFC75A" },
  confundido: { etiqueta: "Confundido", icono: "fa-circle-question", color: "#FF9F5A" },
  cerrado: { etiqueta: "Cerrado", icono: "fa-face-angry", color: "#FF5E5E" },
};

/* ── Piezas y turnos ─────────────────────────────────────────────────────── */

export type TipoPieza = "ok" | "neutra" | "debil" | "vacia" | "gramatica" | "grosera";

export interface Pieza {
  id: string;
  /** Inglés. {X} = tu opción, {Y} = la otra. Cadena vacía = no decir nada en esa parte. */
  texto: string;
  tipo: TipoPieza;
  clar: number;
  resp: number;
  conv: number;
  /** Razón que depende de un dato: sólo es verdad con estas opciones. [] = nunca. */
  cierta?: OpcionId[];
  /** Por qué funciona (o no), en español. */
  porque: string;
  /** Qué se explica cuando el dato es falso para tu opción. */
  falso?: string;
}

export interface Turno {
  id: string;
  habla: PersonajeId;
  linea: Record<OpcionId, string>;
  traduccion: Record<OpcionId, string>;
  /** Lo que contesta quien habló cuando el turno sale bien. */
  bien: { en: string; es: string };
  etiquetas: [string, string, string];
  piezas: [Pieza[], Pieza[], Pieza[]];
}

const SIN = (id: string, porque: string, tipo: TipoPieza = "neutra", conv = 0, resp = 0): Pieza => ({
  id, texto: "", tipo, clar: 0, resp, conv, porque,
});

export const TURNOS: Turno[] = [
  {
    id: "t1",
    habla: "sofia",
    linea: {
      museo: "OK, everyone. What do you prefer, the museum or the water park?",
      parque: "OK, everyone. What do you prefer, the museum or the water park?",
    },
    traduccion: {
      museo: "Bueno, todos. ¿Qué prefieren, el museo o el parque acuático?",
      parque: "Bueno, todos. ¿Qué prefieren, el museo o el parque acuático?",
    },
    bien: { en: "Fair enough! That's a clear answer.", es: "¡Me parece justo! Es una respuesta clara." },
    etiquetas: ["Apertura", "Tu preferencia", "Tu razón"],
    piezas: [
      [
        { id: "personally", texto: "Personally,", tipo: "ok", clar: 4, resp: 6, conv: 3, porque: "«Personally» presenta tu idea como TUYA, no como la única verdad: suena seguro y respetuoso." },
        { id: "opinion", texto: "In my opinion,", tipo: "ok", clar: 4, resp: 5, conv: 3, porque: "«In my opinion» introduce una opinión personal; deja espacio a que otros piensen distinto." },
        { id: "obviously", texto: "Obviously,", tipo: "debil", clar: 0, resp: -12, conv: 0, porque: "«Obviously» da a entender que quien piensa distinto no ve lo evidente. Con preferencias no hay respuesta obvia." },
        SIN("nada1", "Sin apertura la frase sigue siendo correcta; sólo pierdes el tono personal."),
      ],
      [
        { id: "prefer-to", texto: "I prefer {X} to {Y}", tipo: "ok", clar: 14, resp: 2, conv: 5, porque: "«prefer X to Y» compara dos opciones y dice cuál eliges: es exactamente lo que preguntó Sofía." },
        { id: "rather", texto: "I'd rather go to {X}", tipo: "ok", clar: 14, resp: 2, conv: 5, porque: "«I'd rather» + verbo base (go, sin «to») expresa tu preferencia de forma natural." },
        { id: "rather-to", texto: "I'd rather to go to {X}", tipo: "gramatica", clar: -18, resp: 0, conv: 0, porque: "Después de «I'd rather» va el verbo base SIN «to»: «I'd rather go», no «I'd rather to go»." },
        { id: "prefer-than", texto: "I prefer {X} than {Y}", tipo: "gramatica", clar: -14, resp: 0, conv: 0, porque: "Con «prefer» se usa «to»: «I prefer X to Y». «Than» va con «I'd rather X than Y»." },
      ],
      [
        { id: "barato", texto: "because it's cheaper.", tipo: "ok", clar: 6, resp: 4, conv: 14, cierta: ["museo"], porque: "«because» + un dato verdadero (el museo cuesta $60 y el parque $220) convierte un gusto en una razón.", falso: "No es verdad: el parque acuático cuesta $220 y el museo $60. Una razón falsa hace que el grupo deje de confiar en ti." },
        { id: "cerca", texto: "since it's closer to school.", tipo: "ok", clar: 6, resp: 4, conv: 14, cierta: ["parque"], porque: "«since» justifica igual que «because»: el parque está a 25 min y el museo a 50.", falso: "No es verdad: el museo está a 50 min y el parque a 25. Una razón falsa hace que el grupo deje de confiar en ti." },
        { id: "bebes", texto: "because {Y} is for babies.", tipo: "grosera", clar: 0, resp: -40, conv: -5, porque: "Eso no es una razón: es burlarse de lo que eligen otros. Quien prefiere la otra opción se siente atacado y deja de escucharte." },
        SIN("sinrazon", "Sin «because» ni «since» tu preferencia suena a capricho: el grupo no sabe POR QUÉ debería cambiar de idea.", "vacia", -3, -2),
      ],
    ],
  },
  {
    id: "t2",
    habla: "marco",
    linea: {
      museo: "No way! The water park is more fun than a boring museum.",
      parque: "No way! The museum is more interesting than a water park.",
    },
    traduccion: {
      museo: "¡Ni loco! El parque acuático es más divertido que un museo aburrido.",
      parque: "¡Ni loco! El museo es más interesante que un parque acuático.",
    },
    bien: { en: "Hmm... I hadn't thought about that.", es: "Mmm... no lo había pensado." },
    etiquetas: ["Desacuerdo cortés", "Tu preferencia", "Tu razón"],
    piezas: [
      [
        { id: "sounds", texto: "That sounds fun, but personally", tipo: "ok", clar: 3, resp: 14, conv: 5, porque: "«That sounds fun, but…» reconoce la idea de Marco ANTES de dar la tuya: así se discrepa con respeto." },
        { id: "point", texto: "I see your point, but", tipo: "ok", clar: 3, resp: 12, conv: 4, porque: "«I see your point, but…» le muestra a Marco que lo escuchaste; después puedes disentir sin ofender." },
        { id: "wrong", texto: "You're wrong,", tipo: "grosera", clar: 0, resp: -30, conv: -4, porque: "«You're wrong» ataca a la persona, no a la idea. En preferencias nadie está «equivocado»: cada quien prefiere algo." },
        { id: "whatever", texto: "Whatever,", tipo: "grosera", clar: 0, resp: -25, conv: -4, porque: "«Whatever» significa «me da igual lo que digas»: cierra la conversación en lugar de responder." },
      ],
      [
        { id: "rather-visit", texto: "I'd rather visit {X}", tipo: "ok", clar: 10, resp: 0, conv: 4, porque: "«I'd rather visit» (verbo base) deja clara tu postura sin repetir la de Marco." },
        { id: "still", texto: "I still prefer {X} to {Y}", tipo: "ok", clar: 10, resp: 0, conv: 4, porque: "«still prefer X to Y» dice que mantienes tu preferencia aun después de oír a Marco." },
        { id: "more-better", texto: "{X} is more better", tipo: "gramatica", clar: -16, resp: 0, conv: 0, porque: "Doble comparativo: «better» ya es el comparativo de «good». Se dice «is better», nunca «more better»." },
      ],
      [
        { id: "lluvia", texto: "since it's going to rain and {X} is indoors.", tipo: "ok", clar: 6, resp: 3, conv: 16, cierta: ["museo"], porque: "Responde a lo que importa ese día (va a llover) con un dato verdadero: el museo está bajo techo.", falso: "No es verdad: el parque acuático está al aire libre. Si llueve, la razón juega en tu contra." },
        { id: "tiempo", texto: "because the bus ride is shorter, so we have more time there.", tipo: "ok", clar: 6, resp: 3, conv: 16, cierta: ["parque"], porque: "Dato verdadero (25 min contra 50) y una consecuencia con «so»: menos camión, más tiempo allá.", falso: "No es verdad: el viaje al museo dura 50 min y al parque 25. Tu razón contradice la ficha del viaje." },
        { id: "fun", texto: "because it's more fun.", tipo: "debil", clar: 3, resp: 0, conv: 5, porque: "Es una razón, pero es sólo un gusto: Marco acaba de decir lo mismo de su opción. Un dato concreto convence más." },
        { id: "dije", texto: "because I said so.", tipo: "grosera", clar: 0, resp: -22, conv: -6, porque: "«Because I said so» no justifica nada: impone. Justificar es dar una razón que el otro pueda revisar." },
      ],
    ],
  },
  {
    id: "t3",
    habla: "lupita",
    linea: {
      museo: "I don't know... I care about two things: the price and the time on the bus.",
      parque: "I don't know... I care about two things: the price and the time on the bus.",
    },
    traduccion: {
      museo: "No sé... Me importan dos cosas: el precio y el tiempo en el camión.",
      parque: "No sé... Me importan dos cosas: el precio y el tiempo en el camión.",
    },
    bien: { en: "OK, that helps me decide. Thanks!", es: "Bueno, eso me ayuda a decidir. ¡Gracias!" },
    etiquetas: ["Apertura", "Tu comparación", "Lo que eso significa"],
    piezas: [
      [
        { id: "good-q", texto: "Good question, Lupita.", tipo: "ok", clar: 2, resp: 8, conv: 3, porque: "Valorar la duda de Lupita la hace sentirse escuchada; así está más dispuesta a oír tu dato." },
        { id: "everybody", texto: "Everybody knows that.", tipo: "debil", clar: 0, resp: -10, conv: 0, porque: "«Everybody knows that» la hace sentir ignorante por preguntar. Una duda sincera merece una respuesta, no un regaño." },
        SIN("nada3", "Sin apertura la respuesta sigue funcionando; sólo pierdes la oportunidad de mostrar que la escuchaste."),
      ],
      [
        { id: "cheaper", texto: "{X} is cheaper than {Y},", tipo: "ok", clar: 8, resp: 0, conv: 10, cierta: ["museo"], porque: "Comparativo correcto (cheap → cheaper than) y verdadero: $60 contra $220. Responde justo a su duda del precio.", falso: "No es verdad: el parque acuático cuesta $220 y el museo $60. Lupita mira la ficha y deja de creerte." },
        { id: "closer", texto: "{X} is closer to school than {Y},", tipo: "ok", clar: 8, resp: 0, conv: 10, cierta: ["parque"], porque: "Comparativo correcto (close → closer than) y verdadero: 25 min contra 50. Responde a su duda del tiempo.", falso: "No es verdad: el museo queda a 50 min y el parque a 25. Lupita mira la ficha y deja de creerte." },
        { id: "more-cheap", texto: "{X} is more cheap than {Y},", tipo: "gramatica", clar: -16, resp: 0, conv: 0, porque: "«Cheap» es un adjetivo corto (1 sílaba): su comparativo es «cheaper than», no «more cheap than»." },
        { id: "exagera", texto: "{X} is the cheapest and the closest,", tipo: "debil", clar: 0, resp: 0, conv: 0, cierta: [], porque: "", falso: "Exageraste: ninguna opción es la más barata Y la más cercana. Un superlativo que la ficha desmiente te quita credibilidad." },
      ],
      [
        { id: "ahorro", texto: "so we can save money for lunch.", tipo: "ok", clar: 4, resp: 2, conv: 12, cierta: ["museo"], porque: "«so» saca una consecuencia del dato: lo que se ahorra en la entrada alcanza para la comida.", falso: "No es verdad para tu opción: el parque cuesta más, así que no se ahorra dinero." },
        { id: "mas-tiempo", texto: "so we can spend more time there.", tipo: "ok", clar: 4, resp: 2, conv: 12, cierta: ["parque"], porque: "«so» saca una consecuencia del dato: menos tiempo en el camión es más tiempo en el parque.", falso: "No es verdad para tu opción: el museo queda más lejos, así que se pasa MÁS tiempo en el camión." },
        { id: "punto", texto: "and that's all I'm going to say.", tipo: "debil", clar: 0, resp: -8, conv: 0, porque: "Cortar la conversación suena a que no aceptas preguntas. Lupita todavía no ha decidido." },
        SIN("nada3b", "Diste el dato, pero no dijiste qué significa para Lupita: le dejas a ella el trabajo de sacar la conclusión.", "vacia", 0, 0),
      ],
    ],
  },
  {
    id: "t4",
    habla: "rios",
    linea: {
      museo: "Before we vote, give us your final argument in one sentence.",
      parque: "Before we vote, give us your final argument in one sentence.",
    },
    traduccion: {
      museo: "Antes de votar, dennos su argumento final en una oración.",
      parque: "Antes de votar, dennos su argumento final en una oración.",
    },
    bien: { en: "Well said. Clear, polite and with a reason.", es: "Bien dicho. Claro, respetuoso y con una razón." },
    etiquetas: ["Apertura", "Tu conclusión", "Tu razón final"],
    piezas: [
      [
        { id: "opinion4", texto: "In my opinion,", tipo: "ok", clar: 4, resp: 5, conv: 3, porque: "Cerrar con «In my opinion» recuerda que es tu postura y que el grupo decide." },
        { id: "personally4", texto: "Personally,", tipo: "ok", clar: 4, resp: 5, conv: 3, porque: "«Personally» marca tu conclusión como personal: firme, pero sin imponerla." },
        { id: "silly", texto: "Honestly, your ideas are silly, so", tipo: "grosera", clar: 0, resp: -35, conv: -5, porque: "Llamar «silly» a las ideas de los demás justo antes de votar los ofende: nadie vota por quien lo acaba de despreciar." },
      ],
      [
        { id: "best", texto: "{X} is the best option for our class", tipo: "ok", clar: 8, resp: 0, conv: 6, porque: "Superlativo irregular correcto: good → better → the best." },
        { id: "better", texto: "{X} is better than {Y} for our class", tipo: "ok", clar: 8, resp: 0, conv: 6, porque: "Comparativo irregular correcto: good → better than. Compara las dos opciones que se votan." },
        { id: "most-best", texto: "{X} is the most best option", tipo: "gramatica", clar: -16, resp: 0, conv: 0, porque: "Doble superlativo: «best» ya es el superlativo de «good». Se dice «the best», nunca «the most best»." },
      ],
      [
        { id: "respeto", texto: "because everyone can enjoy it, and I respect the other idea.", tipo: "ok", clar: 4, resp: 10, conv: 8, porque: "Das una razón y además reconoces la otra opción: el grupo siente que gane quien gane, se le tomó en cuenta." },
        { id: "datos-museo", texto: "since it's cheaper and it's indoors.", tipo: "ok", clar: 4, resp: 0, conv: 10, cierta: ["museo"], porque: "Resume tus dos datos verdaderos con «since»: precio y lluvia.", falso: "No es verdad para tu opción: el parque cuesta más y está al aire libre." },
        { id: "datos-parque", texto: "since it's closer and the trip is shorter.", tipo: "ok", clar: 4, resp: 0, conv: 10, cierta: ["parque"], porque: "Resume tu dato verdadero con «since»: menos tiempo de camino.", falso: "No es verdad para tu opción: el museo queda más lejos y el viaje es más largo." },
        { id: "aburrida", texto: "because the other idea is boring.", tipo: "grosera", clar: 0, resp: -30, conv: -5, porque: "Despreciar la otra opción no prueba que la tuya sea mejor, y ofende a quien la propuso." },
      ],
    ],
  },
];

/* ── Medidores ───────────────────────────────────────────────────────────── */

export interface Medidores {
  clar: number;
  resp: number;
  conv: number;
}

export const INICIO: Medidores = { clar: 50, resp: 70, conv: 20 };
/** Por debajo de este respeto el grupo se cierra: lo que digas ya no convence. */
export const UMBRAL_CIERRE = 40;

const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));

/** Rellena {X}/{Y} con las opciones del alumno. */
export function textoPieza(p: Pieza, op: OpcionId): string {
  return p.texto.replace(/\{X\}/g, OPCIONES[op].en).replace(/\{Y\}/g, OPCIONES[otraOpcion(op)].en);
}

/** La intervención completa, con mayúscula inicial y punto final. */
export function frase(piezas: (Pieza | undefined)[], op: OpcionId): string {
  const partes = piezas.filter((p): p is Pieza => !!p).map((p) => textoPieza(p, op)).filter(Boolean);
  if (partes.length === 0) return "";
  let s = partes.join(" ").replace(/,$/, "").replace(/\s+([.,])/g, "$1");
  s = s.charAt(0).toUpperCase() + s.slice(1);
  // «Everybody knows that.» / «Good question, Lupita.» ya traen punto: la frase sigue con mayúscula.
  s = s.replace(/([.!?]) ([a-z])/g, (_m, p: string, c: string) => `${p} ${c.toUpperCase()}`);
  if (!/[.!?]$/.test(s)) s += ".";
  return s;
}

export type Tono = "bien" | "debil" | "vacia" | "gramatica" | "falsa" | "grosera";

export interface NotaPieza {
  texto: string;
  tono: "bien" | "regular" | "mal";
  porque: string;
}

export interface ResultadoTurno {
  despues: Medidores;
  delta: Medidores;
  tono: Tono;
  notas: NotaPieza[];
  respuesta: { en: string; es: string };
  /** El grupo quedó cerrado tras este turno. */
  cerrado: boolean;
}

const PRIORIDAD: Tono[] = ["grosera", "falsa", "gramatica", "vacia", "debil", "bien"];

const RESPUESTAS: Record<Exclude<Tono, "bien">, { en: string; es: string }> = {
  grosera: { en: "Wow... OK. I don't want to discuss this with you anymore.", es: "Vaya... Bueno. Ya no quiero discutir esto contigo." },
  falsa: { en: "Wait, that's not true. Look at the trip facts.", es: "Espera, eso no es cierto. Mira la ficha del viaje." },
  gramatica: { en: "Sorry, what do you mean?", es: "Perdón, ¿qué quieres decir?" },
  vacia: { en: "OK... but why?", es: "Ajá... pero ¿por qué?" },
  debil: { en: "Hmm, maybe. Can you give us a better reason?", es: "Mmm, tal vez. ¿Nos das una mejor razón?" },
};

export function evaluaTurno(turno: Turno, piezas: Pieza[], op: OpcionId, antes: Medidores): ResultadoTurno {
  const d: Medidores = { clar: 0, resp: 0, conv: 0 };
  const notas: NotaPieza[] = [];
  const tonos = new Set<Tono>();

  for (const p of piezas) {
    const txt = textoPieza(p, op) || "(nada)";
    const falsa = p.cierta !== undefined && !p.cierta.includes(op);
    if (falsa) {
      d.clar -= 12;
      d.conv -= 10;
      tonos.add("falsa");
      notas.push({ texto: txt, tono: "mal", porque: p.falso ?? "Esa razón no es verdad para tu opción." });
      continue;
    }
    d.clar += p.clar;
    d.resp += p.resp;
    d.conv += p.conv;
    if (p.tipo === "ok") tonos.add("bien");
    else if (p.tipo === "debil") tonos.add("debil");
    else if (p.tipo === "vacia") tonos.add("vacia");
    else if (p.tipo === "gramatica") tonos.add("gramatica");
    else if (p.tipo === "grosera") tonos.add("grosera");
    const tono: NotaPieza["tono"] = p.tipo === "ok" ? "bien" : p.tipo === "neutra" ? "regular" : p.tipo === "debil" || p.tipo === "vacia" ? "regular" : "mal";
    notas.push({ texto: txt, tono, porque: p.porque });
  }

  const resp = clamp(antes.resp + d.resp);
  const cerrado = resp < UMBRAL_CIERRE;
  // Grupo cerrado: lo que digas ya no convence (las subidas valen 0; las bajadas sí cuentan).
  if (cerrado && d.conv > 0) d.conv = 0;

  const despues: Medidores = { clar: clamp(antes.clar + d.clar), resp, conv: clamp(antes.conv + d.conv) };
  const tono = PRIORIDAD.find((t) => tonos.has(t)) ?? "bien";
  const respuesta = tono === "bien" ? turno.bien : RESPUESTAS[tono];
  return { despues, delta: d, tono, notas, respuesta, cerrado };
}

/* ── Votación ────────────────────────────────────────────────────────────── */

export type VotanteId = "tu" | "sofia" | "marco" | "lupita";

/** ¿Votaría por tu opción con los medidores así? (Mr. Ríos no vota: modera.) */
export function inclinacion(id: Exclude<VotanteId, "tu">, m: Medidores, cerradoAlgunaVez: boolean): boolean {
  if (m.resp < UMBRAL_CIERRE) return false;
  if (id === "lupita") return m.conv >= 55 && m.resp >= 55;
  if (id === "sofia") return m.conv >= 70 && m.clar >= 70;
  return m.conv >= 90 && m.resp >= 85 && !cerradoAlgunaVez;
}

export const CONDICION_VOTO: Record<Exclude<VotanteId, "tu">, string> = {
  lupita: "convencimiento ≥ 55 y respeto ≥ 55",
  sofia: "convencimiento ≥ 70 y claridad ≥ 70",
  marco: "convencimiento ≥ 90, respeto ≥ 85 y que el grupo nunca se haya cerrado",
};

export function votos(m: Medidores, cerradoAlgunaVez: boolean): Record<VotanteId, boolean> {
  return {
    tu: true,
    sofia: inclinacion("sofia", m, cerradoAlgunaVez),
    marco: inclinacion("marco", m, cerradoAlgunaVez),
    lupita: inclinacion("lupita", m, cerradoAlgunaVez),
  };
}

export function finalDe(aFavor: number, cerradoAlgunaVez: boolean): { titulo: string; texto: string; color: string; icono: string } {
  if (aFavor === 4)
    return { titulo: "Unanimous!", color: "#34D399", icono: "fa-trophy", texto: "Hasta Marco votó contigo. Diste razones verdaderas, discrepaste con respeto y hablaste con claridad: así se cambia una opinión." };
  if (aFavor === 3)
    return {
      titulo: "You won the vote",
      color: "#34D399",
      icono: "fa-check-to-slot",
      texto: cerradoAlgunaVez
        ? "Ganaste, pero en algún momento el grupo se cerró y Marco ya no te escuchó. Repite la reunión sin frases groseras para ver si lo convences."
        : "Ganaste por mayoría. Para convencer también a Marco necesitas más convencimiento y respeto: busca la razón que responde a SU argumento.",
    };
  if (aFavor === 2)
    return { titulo: "It's a tie", color: "#FFC75A", icono: "fa-scale-balanced", texto: "Empate: no convenciste a la mayoría. Revisa en el cuaderno qué piezas restaron claridad o respeto, y qué razones no eran verdad." };
  return { titulo: "You lost the vote", color: "#FF5E5E", icono: "fa-xmark", texto: "Casi nadie votó contigo. Sin razones verdaderas o sin respeto, una preferencia no convence a nadie. Vuelve a intentarlo." };
}

/** El ánimo de cada personaje después de un turno. */
export function animosTras(turno: Turno, r: ResultadoTurno, cerradoAlgunaVez: boolean): Record<PersonajeId, Animo> {
  const m = r.despues;
  if (r.cerrado) return { sofia: "cerrado", marco: "cerrado", lupita: "cerrado", rios: "cerrado" };
  const base: Record<PersonajeId, Animo> = {
    sofia: inclinacion("sofia", m, cerradoAlgunaVez) ? "convencido" : "atento",
    marco: inclinacion("marco", m, cerradoAlgunaVez) ? "convencido" : "atento",
    lupita: inclinacion("lupita", m, cerradoAlgunaVez) ? "convencido" : "atento",
    rios: m.resp >= 70 ? "convencido" : "atento",
  };
  const delHablante: Record<Tono, Animo> = {
    bien: "convencido",
    debil: "dudoso",
    vacia: "dudoso",
    gramatica: "confundido",
    falsa: "confundido",
    grosera: "cerrado",
  };
  base[turno.habla] = delHablante[r.tono];
  return base;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Analizador del modo «Write your reply»
 * ═══════════════════════════════════════════════════════════════════════════ */

export interface ErrorFrase {
  id: string;
  porque: string;
}

export interface AnalisisFrase {
  estructuras: EstructuraId[];
  errores: ErrorFrase[];
  groserias: string[];
  /** 0–100 */
  clar: number;
  resp: number;
  razon: number;
  /** Lo que la frase consigue con Dani. */
  efecto: "convence" | "pregunta" | "sinrazon" | "gramatica" | "grosera" | "otro" | "vacio";
}

const ADJ_ER = "better|worse|faster|bigger|cheaper|easier|smaller|closer|nicer|healthier|calmer|older|hotter|colder|funnier|happier|longer|shorter|cooler|warmer";
const ADJ_EST = "best|worst|biggest|fastest|cheapest|easiest|closest|nicest|happiest|longest|shortest";
const ADJ_CORTO = "fast|big|cheap|small|close|nice|hot|cold|old|long|short|good|bad|cool|warm";

const GROSERIAS: { re: RegExp; txt: string }[] = [
  { re: /\bstupid\b/, txt: "stupid" },
  { re: /\bdumb\b/, txt: "dumb" },
  { re: /\bsilly\b/, txt: "silly" },
  { re: /\bidiots?\b/, txt: "idiot" },
  { re: /\bridiculous\b/, txt: "ridiculous" },
  { re: /\bshut up\b/, txt: "shut up" },
  { re: /\byou(?:'re| are) wrong\b/, txt: "you're wrong" },
  { re: /\bwhatever\b/, txt: "whatever" },
  { re: /\bwho cares\b/, txt: "who cares" },
  { re: /\bfor babies\b/, txt: "for babies" },
  { re: /\bi said so\b/, txt: "because I said so" },
  { re: /\b(?:is|are|sounds) (?:so )?boring\b/, txt: "boring" },
  { re: /\blosers?\b/, txt: "loser" },
];

/**
 * «I prefer X than Y» (error) frente a «I prefer the metro because it is faster
 * than the pesero» (correcta, A1): el «than» sólo es del error cuando entre
 * «prefer» y «than» no hay «to», ni conector, ni verbo, ni comparativo.
 */
function preferThan(t: string): boolean {
  for (const m of t.matchAll(/\bprefers?\b([^.!?]*?)\bthan\b/g)) {
    const tramo = m[1] ?? "";
    if (/\bwhat do you\s*$/.test(t.slice(0, m.index ?? 0))) continue;
    if (/\b(?:to|because|since|as|is|are|it's|they're|was|were|be|more|rather)\b/.test(tramo)) continue;
    if (new RegExp(`\\b(?:${ADJ_ER})\\s*$`).test(tramo.trim())) continue;
    return true;
  }
  return false;
}

/** Minúsculas, apóstrofos rectos y espacios simples. */
export function normalizaFrase(s: string): string {
  return s.toLowerCase().replace(/[‘’´`]/g, "'").replace(/\s+/g, " ").trim();
}

export function analizaFrase(entrada: string): AnalisisFrase {
  const t = normalizaFrase(entrada);
  const palabras = t.split(" ").filter(Boolean).length;
  if (palabras < 3)
    return { estructuras: [], errores: [], groserias: [], clar: 0, resp: 0, razon: 0, efecto: "vacio" };

  const errores: ErrorFrase[] = [];
  if (/\b(?:i'd|i would|we'd|we would|you'd|they'd|he'd|she'd)\s+rather\s+to\b/.test(t))
    errores.push({ id: "rather-to", porque: "Después de «I'd rather» va el verbo base SIN «to»: «I'd rather stay home», no «I'd rather to stay home»." });
  if (preferThan(t))
    errores.push({ id: "prefer-than", porque: "Con «prefer» se compara con «to»: «I prefer the beach to the city». «Than» va con «I'd rather … than …»." });
  const dobleComp = t.match(new RegExp(`\\bmore\\s+(${ADJ_ER})\\b`));
  if (dobleComp) errores.push({ id: "doble-comparativo", porque: `Doble comparativo: «${dobleComp[1]}» ya es comparativo. Quita «more».` });
  const dobleSup = t.match(new RegExp(`\\bmost\\s+(${ADJ_EST})\\b`));
  if (dobleSup) errores.push({ id: "doble-superlativo", porque: `Doble superlativo: «${dobleSup[1]}» ya es superlativo. Se dice «the ${dobleSup[1]}», sin «most».` });
  const corto = t.match(new RegExp(`\\b(more|most)\\s+(${ADJ_CORTO})\\b`));
  if (corto) errores.push({ id: "adjetivo-corto", porque: `«${corto[2]}» es un adjetivo corto: su comparativo y superlativo llevan -er / -est (o son irregulares: good → better → the best), no «${corto[1]}».` });
  if (/\b(gooder|goodest|badder|baddest|beautifulest|expensiver|interestinger)\b/.test(t))
    errores.push({ id: "irregular", porque: "Forma inventada: good → better → the best; bad → worse → the worst; los adjetivos largos van con more / the most." });

  const groserias = GROSERIAS.filter((g) => g.re.test(t)).map((g) => g.txt);

  const est = new Set<EstructuraId>();
  if (/\bwhat do you prefer\b.*\bor\b/.test(t)) est.add("what-prefer");
  if (/\b(?:i|we|you|they|he|she)\s+(?:still\s+|really\s+|definitely\s+|also\s+)?prefers?\s+(?!to\b)[a-z' -]+?\s+to\s+[a-z]/.test(t)) est.add("prefer-to");
  if (/\b(?:i'd|i would|we'd|we would|you'd|they'd|he'd|she'd)\s+rather\s+(?!to\b)[a-z]+/.test(t)) est.add("rather");
  if (/\b(?:because|since)\s+\S+\s+\S+/.test(t) || /,\s*as\s+\S+\s+\S+/.test(t)) est.add("porque");
  if (/\bsounds\s+[a-z ]{0,20}?,?\s*but\b/.test(t)) est.add("sounds-but");
  if (/\bin my (?:opinion|view)\b|\bpersonally\b/.test(t)) est.add("opinion");

  const pregunta = est.has("what-prefer");
  // «What do you prefer…?» pregunta; no dice qué prefieres tú.
  const sinPregunta = t.replace(/\bwhat do you prefer\b/g, " ");
  const preferencia = est.has("prefer-to") || est.has("rather") || /\bprefers?\b/.test(sinPregunta) || /\blike\b.+\bbetter than\b/.test(t) || est.has("opinion");
  const comparativo = new RegExp(`\\b[a-z]+er than\\b|\\bmore [a-z]+ than\\b|\\bthe (?:most [a-z]+|[a-z]+est)\\b|\\b(?:${ADJ_ER})\\b`).test(t);
  const sinRazonReal = /\bi said so\b/.test(t);

  let clar = 35;
  if (preferencia || pregunta) clar += 35;
  if (est.has("opinion")) clar += 10;
  if (est.has("porque")) clar += 10;
  clar -= errores.length * 25;

  let resp = 60;
  if (est.has("sounds-but")) resp += 20;
  if (est.has("opinion")) resp += 10;
  if (pregunta) resp += 10;
  resp -= groserias.length * 45;

  let razon = 0;
  if (est.has("porque") && !sinRazonReal) razon = comparativo ? 100 : 75;
  else if (/\bso we\b|\band it's\b/.test(t)) razon = 40;

  const c = clamp(clar);
  const r = clamp(resp);
  const efecto: AnalisisFrase["efecto"] =
    groserias.length > 0 || r < UMBRAL_CIERRE
      ? "grosera"
      : errores.length > 0
        ? "gramatica"
        : pregunta && !preferencia
          ? "pregunta"
          : preferencia && razon >= 75
            ? "convence"
            : preferencia
              ? "sinrazon"
              : pregunta
                ? "pregunta"
                : "otro";

  // Una estructura sólo cuenta si la frase salió limpia (sin errores ni groserías).
  const estructuras = efecto === "grosera" || efecto === "gramatica" ? [] : [...est];
  return { estructuras, errores, groserias, clar: c, resp: r, razon, efecto };
}

/* ── Dani, el amigo del chat (ficticio) ──────────────────────────────────── */

export const DANI_PROMPTS: { en: string; es: string; meta: string }[] = [
  { en: "Hi! I'm planning our Saturday. Ask me what I prefer — give me two options!", es: "¡Hola! Estoy planeando nuestro sábado. Pregúntame qué prefiero: dame dos opciones.", meta: "Pregunta con «What do you prefer, X or Y?»" },
  { en: "I love the beach. What about you: the mountains or the beach? And why?", es: "Me encanta la playa. ¿Y tú: la montaña o la playa? ¿Y por qué?", meta: "Usa «I prefer X to Y» + «because»" },
  { en: "Let's go to a party tonight! It's going to be great!", es: "¡Vamos a una fiesta hoy en la noche! ¡Va a estar genial!", meta: "Discrepa: «That sounds fun, but I'd rather…»" },
  { en: "Tacos or pizza for dinner? Give me your opinion.", es: "¿Tacos o pizza para cenar? Dame tu opinión.", meta: "Empieza con «In my opinion» o «Personally»" },
  { en: "I think studying at home is better than studying at the library.", es: "Creo que estudiar en casa es mejor que estudiar en la biblioteca.", meta: "Discrepa con respeto y da una razón con «since»" },
  { en: "Last one: walking or taking the bus to school?", es: "La última: ¿caminar o tomar el camión a la escuela?", meta: "Elige y justifica con un comparativo" },
];

export const DANI_RESPUESTAS: Record<AnalisisFrase["efecto"], { en: string; es: string; animo: Animo }> = {
  convence: { en: "Fair enough! That's a good reason.", es: "¡Me parece justo! Es una buena razón.", animo: "convencido" },
  pregunta: { en: "Good question! I prefer the beach to the city because I love the sun.", es: "¡Buena pregunta! Prefiero la playa a la ciudad porque me encanta el sol.", animo: "convencido" },
  sinrazon: { en: "OK... but why?", es: "Ajá... pero ¿por qué?", animo: "dudoso" },
  gramatica: { en: "Sorry, I don't get it. What do you mean?", es: "Perdón, no te entiendo. ¿Qué quieres decir?", animo: "confundido" },
  grosera: { en: "Hey... that wasn't very nice. Let's talk later.", es: "Oye... eso no fue muy amable. Hablamos luego.", animo: "cerrado" },
  otro: { en: "Hmm, so what do you prefer?", es: "Mmm, entonces ¿qué prefieres?", animo: "dudoso" },
  vacio: { en: "...", es: "Escribe una frase completa (al menos tres palabras).", animo: "atento" },
};

/** Frases para empezar (se insertan en el cuadro; no son la respuesta completa). */
export const ARRANQUES = ["What do you prefer, ", "I prefer ", "I'd rather ", "That sounds fun, but ", "In my opinion, ", "Personally, ", "because ", "since "];
