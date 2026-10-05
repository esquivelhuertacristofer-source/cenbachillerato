/**
 * Lógica pura del simulador «El lunes con Dan» (Past Simple).
 *
 * Es lunes. Dan (personaje FICTICIO, compañero de clase) pregunta qué hiciste el
 * fin de semana. En cuatro escenas el alumno ELIGE qué hizo, elige el marcador
 * de tiempo y el verbo en pasado; Dan reacciona (se confunde y se le explica por
 * qué, o sigue la plática con otra pregunta) y el fin de semana se va armando
 * en una línea de tiempo. Dos escenas más usan lo aprendido en el negativo
 * («I didn't go») y en la pregunta («Did you play…?»).
 */

export type TipoVerbo = "regular" | "irregular";

export interface ErrorVerbo {
  forma: string;
  porque: string;
}

export interface Actividad {
  id: string;
  /** Imagen: /media/labs-sim/pasado-simple-ingles/<clave>.webp */
  clave: string;
  icono: string;
  /** Qué hiciste, en español, para la tarjeta. */
  es: string;
  base: string;
  pasado: string;
  /** El resto de la frase: «to the cinema». */
  compl: string;
  tipo: TipoVerbo;
  errores: ErrorVerbo[];
  /** Lo que contesta Dan, en inglés. */
  eco: string;
}

export interface Marcador {
  texto: string;
  /** Falso = es futuro: no sirve para contar algo que ya pasó. */
  pasado: boolean;
}

export interface Escena {
  id: string;
  titulo: string;
  momento: string;
  icono: string;
  pregunta: string;
  marcadores: Marcador[];
  opciones: [Actividad, Actividad];
}

const m = (texto: string, pasado: boolean): Marcador => ({ texto, pasado });

export const ESCENAS: Escena[] = [
  {
    id: "viernes",
    titulo: "Friday",
    momento: "Viernes por la noche",
    icono: "fa-moon",
    pregunta: "Hi! It's Monday. What did you do on Friday night?",
    marcadores: [m("Last Friday", true), m("Three days ago", true), m("Next Friday", false)],
    opciones: [
      {
        id: "pizza",
        clave: "viernes-pizza",
        icono: "fa-pizza-slice",
        es: "Comer pizza con tus primos",
        base: "eat",
        pasado: "ate",
        compl: "pizza with my cousins",
        tipo: "irregular",
        errores: [
          { forma: "eated", porque: "«eated» no existe: «eat» es irregular y su pasado es «ate». No se le agrega -ed." },
          { forma: "eat", porque: "«eat» es el presente. Para contar algo que ya pasó hace falta «ate»." },
        ],
        eco: "Pizza! I love pizza.",
      },
      {
        id: "cine",
        clave: "viernes-cine",
        icono: "fa-film",
        es: "Ir al cine",
        base: "go",
        pasado: "went",
        compl: "to the cinema",
        tipo: "irregular",
        errores: [
          { forma: "goed", porque: "«goed» no existe: «go» es irregular y cambia por completo a «went»." },
          { forma: "go", porque: "«go» es el presente. El pasado de «go» es «went»." },
        ],
        eco: "Cool! Was the movie good?",
      },
    ],
  },
  {
    id: "sabado-manana",
    titulo: "Saturday morning",
    momento: "Sábado por la mañana",
    icono: "fa-sun",
    pregunta: "And what did you do on Saturday morning?",
    marcadores: [m("Last Saturday", true), m("Two days ago", true), m("Tomorrow morning", false)],
    opciones: [
      {
        id: "estudio",
        clave: "sabado-estudio",
        icono: "fa-book-open",
        es: "Estudiar para el examen de matemáticas",
        base: "study",
        pasado: "studied",
        compl: "for my math exam",
        tipo: "regular",
        errores: [
          { forma: "studyed", porque: "En «study» la y cambia a i antes de -ed: «studied»." },
          { forma: "study", porque: "«study» es el presente. El pasado regular lleva -ed: «studied»." },
        ],
        eco: "Good luck on that exam!",
      },
      {
        id: "futbol",
        clave: "sabado-futbol",
        icono: "fa-futbol",
        es: "Jugar futbol con tus amigos",
        base: "play",
        pasado: "played",
        compl: "football with my friends",
        tipo: "regular",
        errores: [
          { forma: "playd", porque: "Los verbos regulares agregan -ed completo: «played», no «playd»." },
          { forma: "playing", porque: "«playing» es -ing (algo en curso). El pasado simple regular lleva -ed: «played»." },
        ],
        eco: "Nice! Who won?",
      },
    ],
  },
  {
    id: "sabado-tarde",
    titulo: "Saturday afternoon",
    momento: "Sábado por la tarde",
    icono: "fa-cloud-sun",
    pregunta: "What about Saturday afternoon?",
    marcadores: [m("Last Saturday afternoon", true), m("Two days ago", true), m("Tomorrow afternoon", false)],
    opciones: [
      {
        id: "mercado",
        clave: "sabado-mercado",
        icono: "fa-shop",
        es: "Comprar zapatos en el mercado",
        base: "buy",
        pasado: "bought",
        compl: "new shoes at the market",
        tipo: "irregular",
        errores: [
          { forma: "buyed", porque: "«buyed» no existe: «buy» es irregular y su pasado es «bought»." },
          { forma: "buy", porque: "«buy» es el presente. El pasado de «buy» es «bought»." },
        ],
        eco: "New shoes! Show me later.",
      },
      {
        id: "limpieza",
        clave: "sabado-limpieza",
        icono: "fa-broom",
        es: "Limpiar tu cuarto y la cocina",
        base: "clean",
        pasado: "cleaned",
        compl: "my room and the kitchen",
        tipo: "regular",
        errores: [
          { forma: "cleanned", porque: "«clean» termina en dos vocales + n: no se duplica la consonante. Solo -ed: «cleaned»." },
          { forma: "clean", porque: "«clean» es el presente. El pasado regular lleva -ed: «cleaned»." },
        ],
        eco: "Wow, so responsible!",
      },
    ],
  },
  {
    id: "domingo",
    titulo: "Sunday",
    momento: "Domingo",
    icono: "fa-house",
    pregunta: "And on Sunday? Did you do anything special?",
    marcadores: [m("Yesterday", true), m("Last Sunday", true), m("Next Sunday", false)],
    opciones: [
      {
        id: "abuela",
        clave: "domingo-abuela",
        icono: "fa-heart",
        es: "Ver a tu abuela",
        base: "see",
        pasado: "saw",
        compl: "my grandmother",
        tipo: "irregular",
        errores: [
          { forma: "seed", porque: "«seed» no existe como pasado: «see» es irregular y su pasado es «saw»." },
          { forma: "seen", porque: "«seen» es el participio (otro tiempo). En pasado simple se usa «saw»." },
        ],
        eco: "How nice! How is she?",
      },
      {
        id: "descanso",
        clave: "domingo-descanso",
        icono: "fa-couch",
        es: "Descansar en casa todo el día",
        base: "rest",
        pasado: "rested",
        compl: "at home all day",
        tipo: "regular",
        errores: [
          { forma: "rest", porque: "«rest» es el presente. El pasado regular lleva -ed: «rested»." },
          { forma: "resting", porque: "«resting» es -ing (algo en curso). El pasado simple regular lleva -ed: «rested»." },
        ],
        eco: "Sounds relaxing!",
      },
    ],
  },
];

/** Fichas de verbo de una actividad: la correcta y sus errores, en orden alfabético. */
export function fichasVerbo(a: Actividad): string[] {
  return [a.pasado, ...a.errores.map((e) => e.forma)].sort((x, y) => x.localeCompare(y, "en"));
}

export type VeredictoRelato = "bien" | "verbo" | "marcador";

export interface ResultadoRelato {
  veredicto: VeredictoRelato;
  ingles: string;
  es: string;
  /** La frase completa que se agrega a la línea de tiempo (solo con «bien»). */
  frase?: string;
}

export function fraseRelato(marcador: string, forma: string, a: Actividad): string {
  return `${marcador}, I ${forma} ${a.compl}.`;
}

export function evaluarRelato(escena: Escena, a: Actividad, marcador: string, forma: string): ResultadoRelato {
  const mk = escena.marcadores.find((x) => x.texto === marcador);
  if (!mk || !mk.pasado) {
    return {
      veredicto: "marcador",
      ingles: `«${marcador}»? But that hasn't happened yet!`,
      es: `«${marcador}» habla del futuro. El pasado simple va con marcadores de pasado: yesterday, last…, …ago, in + año.`,
    };
  }
  const err = a.errores.find((e) => e.forma === forma);
  if (err || forma !== a.pasado) {
    return {
      veredicto: "verbo",
      ingles: `Sorry? «${fraseRelato(marcador, forma, a)}» I don't get it.`,
      es: `${err?.porque ?? "Esa forma no corresponde."} Dan se confunde. Prueba con «${a.pasado}».`,
    };
  }
  return {
    veredicto: "bien",
    ingles: a.eco,
    es: a.tipo === "regular" ? `Verbo regular: ${a.base} + -ed → ${a.pasado}.` : `Verbo irregular: ${a.base} → ${a.pasado} (se memoriza).`,
    frase: fraseRelato(marcador, forma, a),
  };
}

/* ── Escena 5: el negativo ──────────────────────────────────────────────── */

export interface OpcionFrase {
  texto: string;
  ok: boolean;
  porque: string;
}

/** Dan pregunta por lo que NO hiciste: la actividad que descartaste en la escena 1. */
export function preguntaNegativo(rechazada: Actividad): string {
  const tuyo = rechazada.compl.replace(/\bmy\b/g, "your");
  return `Did you ${rechazada.base} ${tuyo} last Friday?`;
}

export function opcionesNegativo(rechazada: Actividad): OpcionFrase[] {
  const { base, pasado, compl } = rechazada;
  const lista: OpcionFrase[] = [
    { texto: `No, I didn't ${base} ${compl}.`, ok: true, porque: `Negativo del pasado: didn't + verbo en forma base («${base}»).` },
    { texto: `No, I didn't ${pasado} ${compl}.`, ok: false, porque: `Después de «didn't» el verbo vuelve a su forma base: «${base}», no «${pasado}». El pasado ya lo marca «didn't».` },
    { texto: `No, I don't ${base} ${compl}.`, ok: false, porque: "«don't» es presente. Para el pasado se usa «didn't»." },
    { texto: `No, I not ${base} ${compl}.`, ok: false, porque: "En inglés no se niega con «not» suelto: se necesita el auxiliar «didn't»." },
  ];
  return lista.sort((a, b) => a.texto.localeCompare(b.texto, "en"));
}

/* ── Escena 6: la pregunta ──────────────────────────────────────────────── */

export const CONSIGNA_PREGUNTA = "Now you ask Dan: did he play tennis on Saturday?";

export const OPCIONES_PREGUNTA: OpcionFrase[] = [
  { texto: "Did you play tennis on Saturday?", ok: true, porque: "Pregunta en pasado: Did + sujeto + verbo en forma base." },
  { texto: "Did you played tennis on Saturday?", ok: false, porque: "Después de «Did» el verbo va en forma base («play»), no en pasado. «Did» ya lleva el pasado." },
  { texto: "You did play tennis on Saturday?", ok: false, porque: "En la pregunta, «Did» va al principio, antes del sujeto: Did you…?" },
  { texto: "Do you play tennis on Saturday?", ok: false, porque: "«Do» es presente. Para hablar del sábado pasado se usa «Did»." },
].sort((a, b) => a.texto.localeCompare(b.texto, "en"));

export const RESPUESTA_DAN = "Yes, I did! I played tennis with my brother.";
