/**
 * Modelo del SIMULADOR «A week in Maple Falls» (lab habitos-contexto-ingles).
 *
 * Todo es FICTICIO: Lucía (16 años, de Puebla), la familia anfitriona Carter,
 * la maestra Ortega, el pueblo de Maple Falls y su escuela. Las cifras de los
 * medidores son una SIMULACIÓN para practicar la idea central de IN-IV-P03:
 * un hábito se explica con su frecuencia, su razón y su CONTEXTO, y el mismo
 * hábito tiene otra consecuencia en otro lugar.
 *
 * Dos piezas:
 *  1. La semana: seis hábitos marcados día por día en una agenda. Cada día
 *     marcado mueve cuatro medidores (energía, tiempo libre, calificaciones,
 *     adaptación) según las reglas del contexto (Puebla o Maple Falls).
 *  2. La explicación: el alumno arma «On school days, I usually take the
 *     school bus because the school is 5 km away.» y el modelo la contrasta con
 *     la agenda (¿la frecuencia es la que se ve?), con la gramática (posición
 *     del adverbio, conector según la forma de la razón) y con el contexto
 *     (¿esa razón es verdad aquí?).
 *
 * Determinista: la misma agenda y la misma oración dan siempre el mismo veredicto.
 */

export type ContextoId = "puebla" | "maple";
export type MedidorId = "energia" | "libre" | "notas" | "adaptacion";
export type Dominio = "escuela" | "diario" | "finde";
export type HabitoId = "cama" | "bus" | "cena" | "chat" | "biblio" | "futbol";
export type Adverbio = "always" | "usually" | "often" | "sometimes" | "rarely" | "never";
export type Conector = "because" | "so that" | "in order to" | "due to";
export type FormaRazon = "clausula" | "verbo" | "proposito" | "sustantivo";
export type FraseId = "escuela" | "semana" | "finde" | "manana" | "tarde" | "noche" | "ninguna";
export type Posicion = "antes" | "despues";

export const DIAS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export const DIAS_DOMINIO: Record<Dominio, number[]> = {
  escuela: [0, 1, 2, 3, 4],
  diario: [0, 1, 2, 3, 4, 5, 6],
  finde: [5, 6],
};

export const DOMINIO_TXT: Record<Dominio, string> = {
  escuela: "días de escuela",
  diario: "días de la semana",
  finde: "días del fin de semana",
};

/** Zona verde de los medidores (simulación). */
export const META = 60;

export const MEDIDORES: { id: MedidorId; etiqueta: string; ingles: string; icono: string; color: string }[] = [
  { id: "energia", etiqueta: "Energía", ingles: "Energy", icono: "fa-bolt", color: "#FBBF24" },
  { id: "libre", etiqueta: "Tiempo libre", ingles: "Free time", icono: "fa-hourglass-half", color: "#60A5FA" },
  { id: "notas", etiqueta: "Calificaciones", ingles: "Grades", icono: "fa-graduation-cap", color: "#A78BFA" },
  { id: "adaptacion", etiqueta: "Adaptación", ingles: "Settling in", icono: "fa-people-roof", color: "#34D399" },
];

export interface Contexto {
  id: ContextoId;
  nombre: string;
  sub: string;
  icono: string;
  foto: string;
  oyente: string;
  oyenteRol: string;
  base: Record<MedidorId, number>;
  hechos: string[];
}

export const CONTEXTOS: Record<ContextoId, Contexto> = {
  puebla: {
    id: "puebla",
    nombre: "Puebla",
    sub: "En casa, con su familia",
    icono: "fa-house",
    foto: "puebla-calle",
    oyente: "Ms. Ortega",
    oyenteRol: "su maestra de inglés",
    base: { energia: 60, libre: 80, notas: 55, adaptacion: 75 },
    hechos: [
      "Las clases empiezan a las 8:00 y la escuela está a 10 minutos a pie.",
      "Sus papás llegan tarde del trabajo: la familia cena junta a las 9 p.m. cuando se puede.",
      "Sus amigos viven en la misma ciudad y la ven todos los días.",
      "Todas sus clases son en español; ya conoce a todos en su colonia.",
    ],
  },
  maple: {
    id: "maple",
    nombre: "Maple Falls",
    sub: "De intercambio, con los Carter",
    icono: "fa-snowflake",
    foto: "maple-falls-invierno",
    oyente: "Mrs. Carter",
    oyenteRol: "su mamá anfitriona",
    base: { energia: 40, libre: 65, notas: 30, adaptacion: 20 },
    hechos: [
      "Las clases empiezan a las 7:30 y el autobús escolar pasa a las 7:00.",
      "La escuela está a 5 km y en invierno nieva.",
      "Los Carter cenan juntos todos los días a las 6 p.m.",
      "En invierno, Maple Falls va una hora adelante de Puebla.",
      "Todas las clases son en inglés.",
      "El centro comunitario tiene fútbol los fines de semana.",
    ],
  },
};

export interface Razon {
  id: string;
  /** Lo que va después del conector, en inglés. */
  texto: string;
  forma: FormaRazon;
  /** + explica hacerlo seguido; − explica hacerlo poco. */
  polaridad: 1 | -1;
  /** Contextos en los que esa razón es verdad. */
  contextos: ContextoId[];
  /** Por qué NO es verdad en el otro contexto (en español). */
  nota?: string;
}

export interface Habito {
  id: HabitoId;
  etiqueta: string;
  icono: string;
  color: string;
  foto: string;
  dominio: Dominio;
  verbo: string;
  resto: Record<ContextoId, string>;
  frases: FraseId[];
  /** Efecto de cada día marcado sobre cada medidor, por contexto. */
  efecto: Record<ContextoId, Partial<Record<MedidorId, number>>>;
  /** Por qué ese efecto, por contexto (en español). */
  motivo: Record<ContextoId, string>;
  /** Hábitos de Lucía en Puebla: días marcados al empezar. */
  inicial: number;
  razones: Razon[];
}

const AMBOS: ContextoId[] = ["puebla", "maple"];

export const HABITOS: Habito[] = [
  {
    id: "cama",
    etiqueta: "Go to bed early",
    icono: "fa-bed",
    color: "#818CF8",
    foto: "dormir-temprano",
    dominio: "escuela",
    verbo: "go",
    resto: { puebla: "to bed before 10 p.m.", maple: "to bed before 10 p.m." },
    frases: ["escuela", "semana"],
    efecto: { puebla: { energia: 5, notas: 2 }, maple: { energia: 9, notas: 3 } },
    motivo: {
      puebla: "Las clases empiezan a las 8:00: dormirse temprano ayuda, pero no es decisivo.",
      maple: "El autobús pasa a las 7:00: si no se duerme temprano, llega agotada a clase.",
    },
    inicial: 2,
    razones: [
      { id: "cama-bus", texto: "the school bus comes at 7:00 a.m.", forma: "clausula", polaridad: 1, contextos: ["maple"], nota: "En Puebla no toma autobús: la escuela está a 10 minutos a pie." },
      { id: "cama-energia", texto: "have enough energy for class", forma: "verbo", polaridad: 1, contextos: AMBOS },
      { id: "cama-615", texto: "I can wake up at 6:15 without problems", forma: "proposito", polaridad: 1, contextos: ["maple"], nota: "En Puebla las clases empiezan a las 8:00: no necesita despertarse a las 6:15." },
      { id: "cama-chats", texto: "the late-night chats with my friends", forma: "sustantivo", polaridad: -1, contextos: AMBOS },
    ],
  },
  {
    id: "bus",
    etiqueta: "Take the school bus",
    icono: "fa-bus",
    color: "#FBBF24",
    foto: "autobus-nieve",
    dominio: "escuela",
    verbo: "take",
    resto: { puebla: "the school bus", maple: "the school bus" },
    frases: ["escuela", "semana", "manana"],
    efecto: { puebla: { libre: -2 }, maple: { energia: 4, libre: 3, notas: 2 } },
    motivo: {
      puebla: "La escuela está a 10 minutos a pie: esperar el autobús le quita tiempo.",
      maple: "La escuela está a 5 km y nieva: sin autobús camina una hora en la nieve y llega tarde.",
    },
    inicial: 0,
    razones: [
      { id: "bus-5km", texto: "the school is 5 km away", forma: "clausula", polaridad: 1, contextos: ["maple"], nota: "En Puebla la escuela está a 10 minutos a pie." },
      { id: "bus-nieve", texto: "the heavy snow in winter", forma: "sustantivo", polaridad: 1, contextos: ["maple"], nota: "En Puebla no nieva." },
      { id: "bus-tiempo", texto: "arrive on time for my first class", forma: "verbo", polaridad: 1, contextos: ["maple"], nota: "En Puebla llega a tiempo caminando 10 minutos." },
      { id: "bus-cerca", texto: "my school is only ten minutes away", forma: "clausula", polaridad: -1, contextos: ["puebla"], nota: "En Maple Falls la escuela está a 5 km." },
    ],
  },
  {
    id: "cena",
    etiqueta: "Have dinner with the family",
    icono: "fa-utensils",
    color: "#F472B6",
    foto: "cena-familia",
    dominio: "diario",
    verbo: "have",
    resto: { puebla: "dinner with my family", maple: "dinner with my host family" },
    frases: ["tarde"],
    efecto: { puebla: { adaptacion: 1, libre: -1 }, maple: { adaptacion: 6, libre: -1 } },
    motivo: {
      puebla: "Cenar en familia la mantiene unida, aunque ya está en su ambiente.",
      maple: "Los Carter cenan a las 6 p.m.: es su mejor momento para conversar en inglés.",
    },
    inicial: 3,
    razones: [
      { id: "cena-ingles", texto: "it's a good time to practice English", forma: "clausula", polaridad: 1, contextos: ["maple"], nota: "En Puebla cena en español con su familia." },
      { id: "cena-carter", texto: "the Carters always eat together at 6 p.m.", forma: "clausula", polaridad: 1, contextos: ["maple"], nota: "Los Carter son su familia anfitriona en Maple Falls, no en Puebla." },
      { id: "cena-dia", texto: "I can talk about my day with them", forma: "proposito", polaridad: 1, contextos: AMBOS },
      { id: "cena-tarde", texto: "my parents get home late from work", forma: "clausula", polaridad: -1, contextos: ["puebla"], nota: "En Maple Falls los Carter cenan juntos a las 6 p.m." },
    ],
  },
  {
    id: "chat",
    etiqueta: "Chat online with friends",
    icono: "fa-mobile-screen",
    color: "#22D3EE",
    foto: "chat-noche",
    dominio: "diario",
    verbo: "chat",
    resto: { puebla: "online with my friends", maple: "online with my friends in Puebla" },
    frases: ["noche", "tarde"],
    efecto: { puebla: { energia: -2, libre: -1 }, maple: { energia: -4, libre: -2, adaptacion: -3 } },
    motivo: {
      puebla: "Chatear de noche le quita un poco de sueño.",
      maple: "Maple Falls va una hora adelante: chatear con Puebla la desvela y la deja hablando solo español.",
    },
    inicial: 6,
    razones: [
      { id: "chat-extrana", texto: "I miss my friends a lot", forma: "clausula", polaridad: 1, contextos: ["maple"], nota: "En Puebla ve a sus amigos todos los días." },
      { id: "chat-divertido", texto: "it's fun to talk about our day", forma: "clausula", polaridad: 1, contextos: AMBOS },
      { id: "chat-dormir", texto: "sleep enough before school", forma: "verbo", polaridad: -1, contextos: AMBOS },
      { id: "chat-horario", texto: "the time difference with Puebla", forma: "sustantivo", polaridad: -1, contextos: ["maple"], nota: "En Puebla no hay diferencia de horario con sus amigos." },
    ],
  },
  {
    id: "biblio",
    etiqueta: "Study at the library",
    icono: "fa-book-open-reader",
    color: "#A78BFA",
    foto: "biblioteca",
    dominio: "escuela",
    verbo: "study",
    resto: { puebla: "at the library after school", maple: "at the library after school" },
    frases: ["escuela", "semana"],
    efecto: { puebla: { notas: 4, libre: -3 }, maple: { notas: 6, libre: -3, adaptacion: 1 } },
    motivo: {
      puebla: "Estudiar sube sus calificaciones, pero cada tarde le quita tiempo libre.",
      maple: "Todas las clases son en inglés: estudiar en la biblioteca le ayuda a entenderlas.",
    },
    inicial: 2,
    razones: [
      { id: "biblio-ingles", texto: "all my classes are in English", forma: "clausula", polaridad: 1, contextos: ["maple"], nota: "En Puebla sus clases son en español." },
      { id: "biblio-entender", texto: "understand my classes better", forma: "verbo", polaridad: 1, contextos: AMBOS },
      { id: "biblio-notas", texto: "I can get better grades", forma: "proposito", polaridad: 1, contextos: AMBOS },
      { id: "biblio-descanso", texto: "I need free time to rest", forma: "clausula", polaridad: -1, contextos: AMBOS },
    ],
  },
  {
    id: "futbol",
    etiqueta: "Play soccer at the center",
    icono: "fa-futbol",
    color: "#34D399",
    foto: "futbol-centro",
    dominio: "finde",
    verbo: "play",
    resto: { puebla: "soccer at the community center", maple: "soccer at the community center" },
    frases: ["finde"],
    efecto: { puebla: { energia: 3, libre: -2, adaptacion: 1 }, maple: { energia: 3, libre: -2, adaptacion: 8 } },
    motivo: {
      puebla: "El deporte le da energía; en su colonia ya conoce a todos.",
      maple: "En el centro comunitario conoce a chicos de su edad: es su puerta de entrada al pueblo.",
    },
    inicial: 2,
    razones: [
      { id: "futbol-gente", texto: "I can meet people my age", forma: "proposito", polaridad: 1, contextos: ["maple"], nota: "En Puebla ya tiene a sus amigos de siempre." },
      { id: "futbol-amigos", texto: "make new friends", forma: "verbo", polaridad: 1, contextos: ["maple"], nota: "En Puebla ya tiene a sus amigos de siempre." },
      { id: "futbol-energia", texto: "it gives me energy for the week", forma: "clausula", polaridad: 1, contextos: AMBOS },
      { id: "futbol-tarea", texto: "I have a lot of homework on weekends", forma: "clausula", polaridad: -1, contextos: AMBOS },
    ],
  },
];

export const HABITO = Object.fromEntries(HABITOS.map((h) => [h.id, h])) as Record<HabitoId, Habito>;

export const FRASES: { id: FraseId; texto: string }[] = [
  { id: "escuela", texto: "On school days," },
  { id: "semana", texto: "During the week," },
  { id: "finde", texto: "On weekends," },
  { id: "manana", texto: "In the morning," },
  { id: "tarde", texto: "In the evening," },
  { id: "noche", texto: "At night," },
  { id: "ninguna", texto: "(no context)" },
];

export const ADVERBIOS: { id: Adverbio; pct: string }[] = [
  { id: "always", pct: "100 %" },
  { id: "usually", pct: "~80 %" },
  { id: "often", pct: "~60 %" },
  { id: "sometimes", pct: "~40 %" },
  { id: "rarely", pct: "~10-20 %" },
  { id: "never", pct: "0 %" },
];

export const CONECTORES: { id: Conector; uso: string; forma: FormaRazon }[] = [
  { id: "because", uso: "causa + oración completa", forma: "clausula" },
  { id: "due to", uso: "causa + sustantivo", forma: "sustantivo" },
  { id: "in order to", uso: "propósito + verbo base", forma: "verbo" },
  { id: "so that", uso: "propósito + oración (I can…)", forma: "proposito" },
];

const FORMA_TXT: Record<FormaRazon, string> = {
  clausula: "una oración completa (sujeto + verbo)",
  verbo: "un verbo en forma base, sin sujeto",
  proposito: "una oración de propósito con sujeto y «can»",
  sustantivo: "un sustantivo o frase nominal, sin verbo",
};

const CONECTOR_DE_FORMA: Record<FormaRazon, Conector> = {
  clausula: "because",
  verbo: "in order to",
  proposito: "so that",
  sustantivo: "due to",
};

/* ── La semana ─────────────────────────────────────────────────────── */

/** Días marcados por hábito: índice 0 = lunes. */
export type Plan = Record<HabitoId, boolean[]>;

/** `n` días repartidos parejo dentro del dominio del hábito. */
export function repartir(dominio: Dominio, n: number): boolean[] {
  const dias = DIAS_DOMINIO[dominio];
  const out = DIAS.map(() => false);
  const k = Math.max(0, Math.min(dias.length, Math.round(n)));
  for (let i = 0; i < k; i++) {
    const pos = Math.min(dias.length - 1, Math.floor(((i + 0.5) * dias.length) / k));
    out[dias[pos]!] = true;
  }
  return out;
}

export function planInicial(): Plan {
  return Object.fromEntries(HABITOS.map((h) => [h.id, repartir(h.dominio, h.inicial)])) as Plan;
}

export function cuenta(plan: Plan, h: Habito): number {
  return DIAS_DOMINIO[h.dominio].filter((d) => plan[h.id][d]).length;
}

export function totalDias(h: Habito): number {
  return DIAS_DOMINIO[h.dominio].length;
}

export function medidores(plan: Plan, ctx: ContextoId): Record<MedidorId, number> {
  const base = CONTEXTOS[ctx].base;
  const out = { ...base };
  for (const h of HABITOS) {
    const n = cuenta(plan, h);
    for (const [m, v] of Object.entries(h.efecto[ctx]) as [MedidorId, number][]) out[m] += n * v;
  }
  for (const m of Object.keys(out) as MedidorId[]) out[m] = Math.max(0, Math.min(100, out[m]));
  return out;
}

export function enVerde(valores: Record<MedidorId, number>): number {
  return MEDIDORES.filter((m) => valores[m.id] >= META).length;
}

export interface Diagnostico {
  medidor: MedidorId;
  habito: HabitoId;
  sentido: "menos" | "mas";
  texto: string;
}

/**
 * Para cada medidor en rojo, el hábito que más pesa: el que más lo baja
 * (hazlo menos) o el que más lo subiría si se hiciera más (hazlo más).
 */
export function diagnosticar(plan: Plan, ctx: ContextoId): Diagnostico[] {
  const valores = medidores(plan, ctx);
  const out: Diagnostico[] = [];
  for (const m of MEDIDORES) {
    if (valores[m.id] >= META) continue;
    let mejor: { h: Habito; peso: number; sentido: "menos" | "mas" } | null = null;
    for (const h of HABITOS) {
      const e = h.efecto[ctx][m.id] ?? 0;
      if (e === 0) continue;
      const n = cuenta(plan, h);
      const peso = e < 0 ? -e * n : e * (totalDias(h) - n);
      if (peso > 0 && (!mejor || peso > mejor.peso)) mejor = { h, peso, sentido: e < 0 ? "menos" : "mas" };
    }
    if (mejor) {
      out.push({
        medidor: m.id,
        habito: mejor.h.id,
        sentido: mejor.sentido,
        texto: `${m.etiqueta} en rojo → ${mejor.sentido === "menos" ? "menos" : "más"} «${mejor.h.etiqueta.toLowerCase()}». ${mejor.h.motivo[ctx]}`,
      });
    }
  }
  return out;
}

/* ── La explicación ────────────────────────────────────────────────── */

/** Adverbios que describen bien «n de total». */
export function adverbiosValidos(n: number, total: number): Adverbio[] {
  if (n <= 0) return ["never"];
  if (n >= total) return ["always"];
  const r = n / total;
  if (r >= 0.7) return ["usually"];
  if (r >= 0.5) return ["often", "sometimes"];
  if (r >= 0.25) return ["sometimes"];
  return ["rarely"];
}

export interface Eleccion {
  habito: HabitoId;
  frase: FraseId;
  adverbio: Adverbio;
  posicion: Posicion;
  conector: Conector;
  razon: string;
}

export interface Chequeo {
  id: "frase" | "posicion" | "conector" | "adverbio" | "polaridad" | "contexto";
  titulo: string;
  ok: boolean;
  texto: string;
}

export interface Evaluacion {
  ok: boolean;
  oracion: string;
  chequeos: Chequeo[];
  animo: "bien" | "duda" | "confuso";
  reaccion: string;
}

const conMayuscula = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function armarOracion(e: Eleccion, ctx: ContextoId): string {
  const h = HABITO[e.habito];
  const razon = h.razones.find((r) => r.id === e.razon);
  const frase = e.frase === "ninguna" ? "" : `${FRASES.find((f) => f.id === e.frase)!.texto} `;
  const nucleo = e.posicion === "antes" ? `I ${e.adverbio} ${h.verbo} ${h.resto[ctx]}` : `I ${h.verbo} ${e.adverbio} ${h.resto[ctx]}`;
  return conMayuscula(`${frase}${nucleo} ${e.conector} ${razon?.texto ?? "…"}.`);
}

export function evaluar(e: Eleccion, plan: Plan, ctx: ContextoId): Evaluacion {
  const h = HABITO[e.habito];
  const razon = h.razones.find((r) => r.id === e.razon)!;
  const n = cuenta(plan, h);
  const total = totalDias(h);
  const pct = Math.round((n / total) * 100);
  const validos = adverbiosValidos(n, total);
  const c = CONTEXTOS[ctx];
  const chequeos: Chequeo[] = [];

  // 1. Contexto de la oración (cuándo).
  const frasesBien = h.frases.map((f) => FRASES.find((x) => x.id === f)!.texto.replace(",", "")).join(" / ");
  if (e.frase === "ninguna") {
    chequeos.push({ id: "frase", titulo: "Contexto", ok: false, texto: `Falta decir cuándo lo haces. Para este hábito: ${frasesBien}.` });
  } else if (!h.frases.includes(e.frase)) {
    chequeos.push({
      id: "frase",
      titulo: "Contexto",
      ok: false,
      texto: `«${FRASES.find((x) => x.id === e.frase)!.texto.replace(",", "")}» no encaja: este hábito ocurre en ${DOMINIO_TXT[h.dominio]}. Usa ${frasesBien}.`,
    });
  } else {
    chequeos.push({ id: "frase", titulo: "Contexto", ok: true, texto: `«${FRASES.find((x) => x.id === e.frase)!.texto.replace(",", "")}» sitúa el hábito en ${DOMINIO_TXT[h.dominio]}.` });
  }

  // 2. Posición del adverbio.
  chequeos.push(
    e.posicion === "antes"
      ? { id: "posicion", titulo: "Posición del adverbio", ok: true, texto: `El adverbio va antes del verbo principal: I ${e.adverbio} ${h.verbo}.` }
      : { id: "posicion", titulo: "Posición del adverbio", ok: false, texto: `El adverbio de frecuencia va ANTES del verbo principal: «I ${e.adverbio} ${h.verbo}», no «I ${h.verbo} ${e.adverbio}». (Solo con «be» va después: I am always…)` }
  );

  // 3. Conector según la forma de la razón.
  const conectorBien = CONECTOR_DE_FORMA[razon.forma];
  chequeos.push(
    e.conector === conectorBien
      ? { id: "conector", titulo: "Conector", ok: true, texto: `«${e.conector}» va con ${FORMA_TXT[razon.forma]}.` }
      : {
          id: "conector",
          titulo: "Conector",
          ok: false,
          texto: `«${razon.texto}» es ${FORMA_TXT[razon.forma]}: le toca «${conectorBien}». «${e.conector}» va con ${FORMA_TXT[CONECTORES.find((x) => x.id === e.conector)!.forma]}.`,
        }
  );

  // 4. Frecuencia contra la agenda.
  chequeos.push(
    validos.includes(e.adverbio)
      ? { id: "adverbio", titulo: "Frecuencia", ok: true, texto: `La agenda marca ${n} de ${total} ${DOMINIO_TXT[h.dominio]} (${pct} %): «${e.adverbio}» lo describe bien.` }
      : {
          id: "adverbio",
          titulo: "Frecuencia",
          ok: false,
          texto: `La agenda marca ${n} de ${total} ${DOMINIO_TXT[h.dominio]} (${pct} %): eso es «${validos.join(" / ")}», no «${e.adverbio}».`,
        }
  );

  // 5. ¿La razón explica ESA frecuencia? (un motivo a favor explica hacerlo seguido).
  const r = n / total;
  const encaja = razon.polaridad === 1 ? r >= 0.4 : r <= 0.5;
  chequeos.push(
    encaja
      ? { id: "polaridad", titulo: "La razón explica la frecuencia", ok: true, texto: razon.polaridad === 1 ? "Es un motivo para hacerlo seguido, y la agenda lo muestra seguido." : "Es un motivo para hacerlo poco, y la agenda lo muestra poco." }
      : {
          id: "polaridad",
          titulo: "La razón explica la frecuencia",
          ok: false,
          texto:
            razon.polaridad === 1
              ? `Esa razón explica por qué lo harías SEGUIDO, pero la agenda lo marca ${n} de ${total}. O cambias la agenda o eliges un motivo para hacerlo poco.`
              : `Esa razón explica por qué lo harías POCO, pero la agenda lo marca ${n} de ${total}. O cambias la agenda o eliges un motivo para hacerlo seguido.`,
        }
  );

  // 6. ¿La razón es verdad en este contexto?
  const verdad = razon.contextos.includes(ctx);
  chequeos.push(
    verdad
      ? { id: "contexto", titulo: `Verdad en ${c.nombre}`, ok: true, texto: `En ${c.nombre} esa razón es cierta.` }
      : { id: "contexto", titulo: `Verdad en ${c.nombre}`, ok: false, texto: razon.nota ?? `Esa razón no es cierta en ${c.nombre}.` }
  );

  const ok = chequeos.every((x) => x.ok);
  // La reacción responde al problema más grave: si la oración no se entiende, lo demás no llega.
  const prioridad: Chequeo["id"][] = ["posicion", "conector", "frase", "adverbio", "polaridad", "contexto"];
  const falla = prioridad.map((id) => chequeos.find((x) => x.id === id && !x.ok)).find(Boolean);
  let animo: Evaluacion["animo"] = "bien";
  let reaccion = "That makes sense! Thanks for explaining.";
  if (falla) {
    if (falla.id === "posicion" || falla.id === "conector") {
      animo = "confuso";
      reaccion = "Sorry, I didn't quite understand that sentence.";
    } else if (falla.id === "frase") {
      animo = "duda";
      reaccion = "Wait, when do you do that?";
    } else if (falla.id === "adverbio") {
      animo = "duda";
      reaccion = "Hmm, that's not what your calendar shows.";
    } else if (falla.id === "polaridad") {
      animo = "duda";
      reaccion = "That reason doesn't explain how often you do it.";
    } else {
      animo = "duda";
      reaccion = ctx === "maple" ? "Really? That isn't true here in Maple Falls." : "Really? That isn't true in Puebla.";
    }
  }
  return { ok, oracion: armarOracion(e, ctx), chequeos, animo, reaccion };
}

export function esProposito(c: Conector): boolean {
  return c === "so that" || c === "in order to";
}
