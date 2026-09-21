/**
 * Datos y modelo del laboratorio "Ágora: ciudadanía y democracia"
 * (CS-I-P02, progresión 2 de Ciencias Sociales I: «Analiza el devenir del
 * concepto de ciudadanía, para la conformación de un Estado democrático e
 * incluyente»).
 *
 * Anclas:
 *   - A1 lectura «¿Qué significa ser ciudadano/a hoy?»: marco teórico verbatim
 *     (4 párrafos + recuadro) y texto con huecos (la progresión no tiene
 *     actividad fill_blanks: los huecos se abren sobre frases verbatim de A1).
 *   - A2 debate «Ciudadanía formal vs. ciudadanía real»: tema, posturas,
 *     reglas, argumentos guía y criterios verbatim (modo 3).
 *   - A3 reflexión, A7 autoevaluación y A8 video: preguntas verbatim.
 *   - A4 quiz: reto evaluable. A5 verdadero/falso: hechos. A6 glosario.
 *   - Inspiración: CS-I-P03 (normas como construcciones históricas) y CS-I-P04
 *     (democracia procedimental y sustantiva).
 *
 * Hechos históricos verificados (ver nota al pie del laboratorio): ley de
 * ciudadanía de Pericles (451 a. C.); Constitución de Cádiz de 1812 (arts. 18,
 * 22 y 25, parafraseados); Constitución de 1857 (art. 34: 18 años casados o 21
 * solteros y modo honesto de vivir; elección indirecta en primer grado);
 * Constitución de 1917 (mismo art. 34 original; elección directa); reforma al
 * art. 115 del 12 de febrero de 1947 (voto municipal de las mujeres); reforma
 * al art. 34 publicada el 17 de octubre de 1953 y primer voto federal de las
 * mujeres el 3 de julio de 1955; reforma al art. 34 publicada el 22 de
 * diciembre de 1969 (ciudadanía a los 18 años sin distinción de estado civil),
 * aplicada en la elección federal de 1970; reforma al COFIPE publicada el 30 de
 * junio de 2005 (voto desde el extranjero), aplicada en la elección
 * presidencial de 2006; reforma político-electoral del 10 de febrero de 2014
 * (paridad en candidaturas legislativas) y reforma «paridad en todo» del 6 de
 * junio de 2019; Cámara de Diputados 2021–2024 con 250 mujeres y 250 hombres.
 *
 * ILUSTRATIVO (dicho en la interfaz): la composición de la multitud de 40
 * personas de cada época, los lugares de la tribuna, la colonia y sus vecinos,
 * los casos de asamblea y las réplicas del debate que no vienen de A2.
 *
 * Regla pedagógica: en la asamblea y en el debate NO hay una respuesta
 * correcta. Se evalúa lo evaluable: quién participa y quién queda fuera, el
 * respeto a las minorías afectadas, la estructura de la intervención, y
 * distinguir hechos, valores y falacias.
 *
 * Datos puros (sin three ni React).
 */

import type { QuizEvaluable } from "./_reto-quiz";
import type { TextoHuecosData } from "./_mecanica-huecos";

/* ── Modos ────────────────────────────────────────────────────────────── */

export type Modo = "agora" | "asamblea" | "debate";
export const MODOS: Modo[] = ["agora", "asamblea", "debate"];

export const MODOS_DEF: Record<Modo, { etq: string; subtitulo: string; icono: string; color: string }> = {
  agora: { etq: "¿Quién entra al ágora?", subtitulo: "2 500 años de inclusión y exclusión", icono: "fa-landmark-dome", color: "#fbbf24" },
  asamblea: { etq: "Asamblea vecinal", subtitulo: "Cómo decide una comunidad", icono: "fa-people-roof", color: "#22d3ee" },
  debate: { etq: "Debate estructurado", subtitulo: "Ciudadanía formal vs. real (A2)", icono: "fa-microphone-lines", color: "#c084fc" },
};

export function mulberry32(semilla: number) {
  let t = semilla >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function baraja<T>(xs: T[], rnd: () => number): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function pct(x: number): string {
  return `${Math.round(x * 100)} %`;
}

/* ════════════════════════════════════════════════════════════════════════
 * 1. ¿QUIÉN ENTRA AL ÁGORA?
 * ════════════════════════════════════════════════════════════════════════ */

/** Tamaño de la multitud ilustrativa de cada época. */
export const N_MULTITUD = 40;
export const N_TRIBUNA = 10;

/** Figura con que se dibuja a un grupo. */
export type Figura = "adulto" | "adulta" | "menor" | "joven";

export interface Grupo {
  id: string;
  etq: string;
  /** Personas de este grupo en la multitud de 40 (ilustrativo). */
  n: number;
  /** ¿Podía votar o participar en las decisiones políticas? */
  entra: boolean;
  porque: string;
  color: string;
  figura: Figura;
  /** Vive fuera del territorio: se dibuja en la otra orilla. */
  lejos?: boolean;
}

export type Escenario = "atenas" | "cabildo" | "casilla";

export interface Epoca {
  id: string;
  /** Etiqueta corta de la línea del tiempo. */
  etq: string;
  titulo: string;
  norma: string;
  /** Cómo se participaba. */
  como: string;
  /** Qué cambió respecto de la época anterior. */
  cambio: string;
  escenario: Escenario;
  grupos: Grupo[];
  /** Lugares de la tribuna (10) ocupados por mujeres (aproximado/ilustrativo). */
  tribunaMujeres: number;
  notaTribuna: string;
  /** Pregunta extra cuando la multitud que entra no cambia. */
  pregunta?: { texto: string; opciones: string[]; correcta: number; explica: string };
}

const C = {
  varon: "#60a5fa",
  mujer: "#f472b6",
  menor: "#fcd34d",
  joven: "#34d399",
  lejos: "#a78bfa",
  meteco: "#fb923c",
  esclava: "#94a3b8",
  afro: "#f59e0b",
  indigena: "#2dd4bf",
  sirviente: "#a3a3a3",
};

const MENORES_MX = (n: number): Grupo => ({
  id: "menores",
  etq: "Niñas, niños y adolescentes",
  n,
  entra: false,
  porque: "Nunca han tenido derechos políticos formales, aunque hoy pueden participar de otras formas: organizarse, opinar, peticionar (A5).",
  color: C.menor,
  figura: "menor",
});

export const EPOCAS: Epoca[] = [
  {
    id: "atenas",
    etq: "Atenas",
    titulo: "Atenas, siglo V a. C.",
    norma: "Desde la ley de Pericles (451 a. C.), solo era ciudadano el varón libre, hijo de padre y madre atenienses.",
    como: "Democracia directa: los ciudadanos votaban en persona, a mano alzada, en la Asamblea (ekklesía).",
    cambio: "Punto de partida: la palabra «democracia» nace aquí, pero el «pueblo» que decidía era una minoría.",
    escenario: "atenas",
    tribunaMujeres: 0,
    notaTribuna: "El Consejo y los cargos se sorteaban solo entre ciudadanos varones.",
    grupos: [
      { id: "ciudadanos", etq: "Varones atenienses adultos", n: 6, entra: true, porque: "Libres y con padre y madre atenienses: eran los únicos ciudadanos con voz y voto en la Asamblea.", color: C.varon, figura: "adulto" },
      { id: "mujeres", etq: "Mujeres atenienses", n: 7, entra: false, porque: "Eran atenienses, pero no ciudadanas con derechos políticos: no votaban ni ocupaban cargos.", color: C.mujer, figura: "adulta" },
      { id: "menores", etq: "Niñas y niños", n: 11, entra: false, porque: "Los menores no participaban en la Asamblea.", color: C.menor, figura: "menor" },
      { id: "metecos", etq: "Metecos (extranjeros residentes)", n: 5, entra: false, porque: "Vivían, trabajaban y pagaban impuestos en Atenas, pero no eran ciudadanos.", color: C.meteco, figura: "adulto" },
      { id: "esclavos", etq: "Personas esclavizadas", n: 11, entra: false, porque: "No eran libres: carecían de todo derecho político.", color: C.esclava, figura: "adulto" },
    ],
  },
  {
    id: "cadiz",
    etq: "Cádiz 1812",
    titulo: "Constitución de Cádiz, 1812",
    norma: "Ciudadanos: los españoles de ambos hemisferios con origen en esos dominios por las dos líneas (art. 18). Quedaban fuera los de origen africano (art. 22) y se suspendían los derechos de los sirvientes domésticos (art. 25). Paráfrasis.",
    como: "Elección indirecta: juntas electorales de parroquia, de partido y de provincia elegían a los diputados a Cortes.",
    cambio: "Constitución jurada también en la Nueva España: los pueblos indígenas y los mestizos cuentan como ciudadanos; las castas de origen africano, no.",
    escenario: "cabildo",
    tribunaMujeres: 0,
    notaTribuna: "Los diputados a Cortes eran solo varones.",
    grupos: [
      { id: "criollos", etq: "Varones españoles y criollos", n: 5, entra: true, porque: "Origen en los dominios españoles por ambas líneas y avecindados: ciudadanos (art. 18).", color: C.varon, figura: "adulto" },
      { id: "indigenas", etq: "Varones indígenas y mestizos", n: 4, entra: true, porque: "Sorpresa frecuente: Cádiz los reconoció como ciudadanos, porque su origen estaba en los dominios de ambos hemisferios (art. 18).", color: C.indigena, figura: "adulto" },
      { id: "afro", etq: "Varones afrodescendientes", n: 2, entra: false, porque: "Excluidos por su origen africano (art. 22); solo podían recibir «carta de ciudadanía» por méritos.", color: C.afro, figura: "adulto" },
      { id: "sirvientes", etq: "Sirvientes domésticos", n: 1, entra: false, porque: "El estado de sirviente doméstico suspendía el ejercicio de los derechos de ciudadano (art. 25).", color: C.sirviente, figura: "adulto" },
      { id: "mujeres", etq: "Mujeres", n: 10, entra: false, porque: "La ciudadanía política se pensaba solo para varones.", color: C.mujer, figura: "adulta" },
      { id: "menores", etq: "Niñas, niños y adolescentes", n: 18, entra: false, porque: "Los menores no votaban en las juntas.", color: C.menor, figura: "menor" },
    ],
  },
  {
    id: "c1857",
    etq: "1857",
    titulo: "Constitución de 1857",
    norma: "Art. 34: ciudadanos los mexicanos que hayan cumplido 18 años siendo casados, o 21 si no lo son, y tengan un modo honesto de vivir. Art. 2: «En la República todos nacen libres».",
    como: "Elección indirecta en primer grado: los ciudadanos elegían electores, y estos a diputados y presidente.",
    cambio: "Desaparece la exclusión por origen: los varones afrodescendientes e indígenas son ciudadanos. No se exige propiedad ni saber leer.",
    escenario: "cabildo",
    tribunaMujeres: 0,
    notaTribuna: "El Congreso seguía siendo exclusivamente masculino.",
    grupos: [
      { id: "varones", etq: "Varones de 21 años o más", n: 8, entra: true, porque: "Mexicanos, mayores de edad y con modo honesto de vivir: ciudadanos (art. 34). También los de 18 a 20 si estaban casados.", color: C.varon, figura: "adulto" },
      { id: "afro", etq: "Varones afrodescendientes", n: 1, entra: true, porque: "La Constitución ya no distingue por origen: todos nacen libres (art. 2) y el art. 34 no los excluye.", color: C.afro, figura: "adulto" },
      { id: "jovenes", etq: "Varones solteros de 18 a 20 años", n: 1, entra: false, porque: "La edad dependía del estado civil: solteros, hasta los 21.", color: C.joven, figura: "joven" },
      { id: "mujeres", etq: "Mujeres", n: 11, entra: false, porque: "El texto no las nombraba, pero en la práctica no se les reconoció el voto.", color: C.mujer, figura: "adulta" },
      MENORES_MX(19),
    ],
  },
  {
    id: "c1917",
    etq: "1917",
    titulo: "Constitución de 1917",
    norma: "El art. 34 original repite los requisitos de 1857: 18 años casados o 21 solteros y modo honesto de vivir. Diputados y presidente se eligen de forma directa.",
    como: "Elección directa: cada ciudadano vota por sus representantes.",
    cambio: "Cambia CÓMO se vota (voto directo) y nacen los derechos sociales (arts. 3, 27 y 123: educación, tierra y trabajo), pero no QUIÉN vota.",
    escenario: "casilla",
    tribunaMujeres: 0,
    notaTribuna: "Las mujeres todavía no podían votar ni ser votadas en elecciones federales.",
    grupos: [
      { id: "varones", etq: "Varones de 21 años o más", n: 9, entra: true, porque: "Los mismos requisitos del art. 34: mayoría de edad y modo honesto de vivir.", color: C.varon, figura: "adulto" },
      { id: "jovenes", etq: "Varones solteros de 18 a 20 años", n: 1, entra: false, porque: "Seguía la regla de 1857: solteros, hasta los 21.", color: C.joven, figura: "joven" },
      { id: "mujeres", etq: "Mujeres", n: 11, entra: false, porque: "El Constituyente de 1917 no reconoció el voto de las mujeres, pese a las peticiones de feministas de la época.", color: C.mujer, figura: "adulta" },
      MENORES_MX(19),
    ],
    pregunta: {
      texto: "En 1917 entra la misma gente que en 1857. Entonces, ¿qué cambió?",
      opciones: ["Las mujeres obtuvieron el voto", "La elección pasó a ser directa y se reconocieron derechos sociales", "La edad para votar bajó a 18 años para todos"],
      correcta: 1,
      explica: "La Constitución de 1917 estableció la elección directa y los derechos sociales (educación, tierra, trabajo): más ciudadanía sustantiva, misma ciudadanía formal.",
    },
  },
  {
    id: "r1953",
    etq: "1953",
    titulo: "Reforma de 1953 al art. 34",
    norma: "Publicada el 17 de octubre de 1953: «Son ciudadanos de la República los varones y las mujeres…». Antes, en 1947, las mujeres ya podían votar y ser votadas en elecciones municipales.",
    como: "Voto directo. Las mujeres votaron por primera vez en una elección federal el 3 de julio de 1955.",
    cambio: "Las mujeres adultas entran al ágora: el grupo con derechos políticos casi se duplica.",
    escenario: "casilla",
    tribunaMujeres: 0,
    notaTribuna: "En 1955 fueron electas las primeras 4 diputadas federales: aún no alcanzan un lugar en esta tribuna de 10.",
    grupos: [
      { id: "varones", etq: "Varones de 21 años o más", n: 9, entra: true, porque: "Siguen cumpliendo el art. 34.", color: C.varon, figura: "adulto" },
      { id: "mujeres", etq: "Mujeres de 21 años o más", n: 9, entra: true, porque: "La reforma de 1953 reconoce a «los varones y las mujeres» como ciudadanos (también a las casadas de 18 a 20).", color: C.mujer, figura: "adulta" },
      { id: "jovenes", etq: "Jóvenes solteros de 18 a 20 años", n: 2, entra: false, porque: "La reforma de 1953 mantuvo la distinción: 18 años si casados, 21 si solteros.", color: C.joven, figura: "joven" },
      { id: "extranjero", etq: "Mexicanos que viven en el extranjero", n: 1, entra: false, porque: "Tenían la ciudadanía, pero solo podían votar si estaban en México el día de la elección.", color: C.lejos, figura: "adulto", lejos: true },
      MENORES_MX(19),
    ],
  },
  {
    id: "r1970",
    etq: "1970",
    titulo: "Reforma de 1969: ciudadanía a los 18 años",
    norma: "Reforma al art. 34 publicada el 22 de diciembre de 1969: basta haber cumplido 18 años, sin importar el estado civil.",
    como: "Voto directo. Las y los jóvenes de 18 a 20 años votaron en la elección federal de 1970.",
    cambio: "Entran las y los jóvenes solteros de 18 a 20 años: la edad deja de depender del matrimonio.",
    escenario: "casilla",
    tribunaMujeres: 1,
    notaTribuna: "Pocas mujeres en el Congreso: alrededor de 1 de cada 10 lugares (aproximado).",
    grupos: [
      { id: "varones", etq: "Varones de 21 años o más", n: 8, entra: true, porque: "Siguen cumpliendo el art. 34.", color: C.varon, figura: "adulto" },
      { id: "mujeres", etq: "Mujeres de 21 años o más", n: 8, entra: true, porque: "Ciudadanas desde 1953.", color: C.mujer, figura: "adulta" },
      { id: "jovenes", etq: "Jóvenes de 18 a 20 años", n: 3, entra: true, porque: "Desde la reforma de 1969, la ciudadanía se adquiere a los 18 años para todas y todos.", color: C.joven, figura: "joven" },
      { id: "extranjero", etq: "Mexicanos que viven en el extranjero", n: 1, entra: false, porque: "Seguían sin poder votar desde fuera del país.", color: C.lejos, figura: "adulto", lejos: true },
      MENORES_MX(20),
    ],
  },
  {
    id: "r2006",
    etq: "2006",
    titulo: "Voto desde el extranjero",
    norma: "Reforma al Código Federal de Instituciones y Procedimientos Electorales (COFIPE) publicada el 30 de junio de 2005: los mexicanos residentes en el extranjero pueden votar por la Presidencia.",
    como: "Voto directo; desde el extranjero, por correo postal. Se aplicó por primera vez en la elección presidencial de 2006.",
    cambio: "Ya tenían la ciudadanía formal; lo nuevo es poder ejercerla sin volver al país: un paso hacia la ciudadanía sustantiva.",
    escenario: "casilla",
    tribunaMujeres: 2,
    notaTribuna: "Las mujeres ocupan alrededor de 2 de cada 10 lugares del Congreso (aproximado).",
    grupos: [
      { id: "varones", etq: "Varones de 21 años o más", n: 10, entra: true, porque: "Ciudadanos (art. 34).", color: C.varon, figura: "adulto" },
      { id: "mujeres", etq: "Mujeres de 21 años o más", n: 11, entra: true, porque: "Ciudadanas (art. 34).", color: C.mujer, figura: "adulta" },
      { id: "jovenes", etq: "Jóvenes de 18 a 20 años", n: 2, entra: true, porque: "Ciudadanos desde los 18 años.", color: C.joven, figura: "joven" },
      { id: "extranjero", etq: "Mexicanos que viven en el extranjero", n: 3, entra: true, porque: "Desde 2006 pueden votar por la Presidencia desde el país donde viven, por correo.", color: C.lejos, figura: "adulto", lejos: true },
      MENORES_MX(14),
    ],
  },
  {
    id: "paridad",
    etq: "2014–2019",
    titulo: "Paridad de género",
    norma: "Reforma constitucional del 10 de febrero de 2014: paridad en las candidaturas a legisladores. Reforma del 6 de junio de 2019, «paridad en todo»: en los tres poderes y los tres órdenes de gobierno.",
    como: "Voto directo. Los partidos deben postular mitad mujeres y mitad hombres.",
    cambio: "No cambia quién vota, sino quién puede ser votada en igualdad: en 2021 la Cámara de Diputados se integró con 250 mujeres y 250 hombres.",
    escenario: "casilla",
    tribunaMujeres: 5,
    notaTribuna: "Tribuna paritaria: 5 de 10, como la Cámara de Diputados de 2021 (250 de 500).",
    grupos: [
      { id: "varones", etq: "Varones de 21 años o más", n: 11, entra: true, porque: "Ciudadanos (art. 34).", color: C.varon, figura: "adulto" },
      { id: "mujeres", etq: "Mujeres de 21 años o más", n: 12, entra: true, porque: "Ciudadanas; y ahora, con paridad, también la mitad de las candidaturas.", color: C.mujer, figura: "adulta" },
      { id: "jovenes", etq: "Jóvenes de 18 a 20 años", n: 2, entra: true, porque: "Ciudadanos desde los 18 años.", color: C.joven, figura: "joven" },
      { id: "extranjero", etq: "Mexicanos que viven en el extranjero", n: 3, entra: true, porque: "Votan desde el extranjero desde 2006.", color: C.lejos, figura: "adulto", lejos: true },
      MENORES_MX(12),
    ],
    pregunta: {
      texto: "La multitud que vota es la misma que en 2006. ¿Qué cambió?",
      opciones: ["Se permitió votar a los 16 años", "Paridad: la mitad de las candidaturas y cargos para mujeres", "Se eliminó el voto desde el extranjero"],
      correcta: 1,
      explica: "El sufragio es «votar y ser votado» (A6): la paridad amplía la segunda mitad del derecho. Mira la tribuna.",
    },
  },
];

export function porcentajeEntra(e: Epoca): number {
  return e.grupos.filter((g) => g.entra).reduce((a, g) => a + g.n, 0) / N_MULTITUD;
}

/** Texto vigente del art. 34 constitucional (cita textual). */
export const ART_34_VIGENTE =
  "«Son ciudadanos de la República los varones y mujeres que, teniendo la calidad de mexicanos, reúnan, además, los siguientes requisitos: I. Haber cumplido 18 años, y II. Tener un modo honesto de vivir.» (Art. 34 de la Constitución Política de los Estados Unidos Mexicanos, texto vigente)";

/* ── Estrellas: ¿tenía ciudadanía? ───────────────────────────────────── */

export interface PreguntaCiudadania {
  epoca: number;
  grupo: number;
}

/** Ronda de 6 casos (época, grupo), sin niñas y niños (siempre fuera), mitad dentro y mitad fuera. */
export function rondaCiudadania(rnd: () => number, n = 6): PreguntaCiudadania[] {
  const dentro: PreguntaCiudadania[] = [];
  const fuera: PreguntaCiudadania[] = [];
  EPOCAS.forEach((e, ei) =>
    e.grupos.forEach((g, gi) => {
      if (g.id === "menores") return;
      (g.entra ? dentro : fuera).push({ epoca: ei, grupo: gi });
    }),
  );
  const mitad = Math.floor(n / 2);
  return baraja([...baraja(dentro, rnd).slice(0, mitad), ...baraja(fuera, rnd).slice(0, n - mitad)], rnd);
}

export function estrellasPorErrores(errores: number): number {
  return errores === 0 ? 3 : errores <= 2 ? 2 : 1;
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. ASAMBLEA VECINAL
 * ════════════════════════════════════════════════════════════════════════ */

export type Condicion = "horario" | "sede" | "lsm" | "cuidados" | "jovenes";
export const CONDICIONES: { id: Condicion; etq: string; sin: string; icono: string }[] = [
  { id: "horario", etq: "Asamblea el domingo a las 17:00", sin: "La convocatoria era para un martes a las 11:00", icono: "fa-clock" },
  { id: "sede", etq: "Sede en planta baja con rampa", sin: "El salón está en un primer piso sin elevador", icono: "fa-wheelchair" },
  { id: "lsm", etq: "Intérprete de Lengua de Señas Mexicana", sin: "Nadie interpreta en Lengua de Señas Mexicana", icono: "fa-hands" },
  { id: "cuidados", etq: "Espacio de cuidado para niñas y niños", sin: "No hay quién cuide a las niñas y los niños", icono: "fa-children" },
  { id: "jovenes", etq: "Invitar a jóvenes (con voz, sin voto)", sin: "Solo se convocó a mayores de edad", icono: "fa-user-graduate" },
];

export type Procedimiento = "mayoria" | "calificada" | "consenso" | "consulta";
export const PROCEDIMIENTOS: { id: Procedimiento; etq: string; icono: string; regla: string; sesiones: string }[] = [
  { id: "mayoria", etq: "Mayoría simple", icono: "fa-hand", regla: "Cada adulto presente vota por su opción favorita; gana la que tenga más votos.", sesiones: "1 sesión" },
  { id: "calificada", etq: "Mayoría calificada (2/3)", icono: "fa-hands-holding", regla: "Una opción necesita al menos dos tercios de los votos de los presentes; si nadie los reúne, no hay acuerdo.", sesiones: "1 sesión" },
  { id: "consenso", etq: "Consenso", icono: "fa-handshake", regla: "Se busca una opción que ningún grupo presente (incluidas las voces sin voto) tenga como la peor; si no existe, se negocia una propuesta mixta.", sesiones: "2 a 3 sesiones" },
  { id: "consulta", etq: "Consulta a grupos afectados", icono: "fa-house-user", regla: "Antes de votar, se visita a los grupos más afectados (asistan o no) y se descarta la opción que cada uno rechaza; los presentes votan entre las que quedan.", sesiones: "2 sesiones y visitas" },
];

export type OpcionId = "A" | "B" | "C";
export type Afectacion = "alta" | "media";

export interface Vecinos {
  id: string;
  etq: string;
  n: number;
  /** Preferencias de mejor a peor. */
  prefs: [OpcionId, OpcionId, OpcionId];
  /** Condición que necesita para poder participar (null: siempre asiste). */
  barrera: Condicion | null;
  afectacion: Afectacion;
  /** Menores de edad: tienen voz si se les invita, pero no voto. */
  soloVoz?: boolean;
  color: string;
  necesidad: string;
}

export interface CasoAsamblea {
  id: string;
  etq: string;
  icono: string;
  problema: string;
  opciones: Record<OpcionId, string>;
  mixta: string;
  statusQuo: string;
  grupos: Vecinos[];
}

export const CASOS: CasoAsamblea[] = [
  {
    id: "terreno",
    etq: "El terreno baldío",
    icono: "fa-tree",
    problema: "La alcaldía cede a la colonia un terreno baldío de la calle Fresno. La asamblea debe decidir su uso.",
    opciones: { A: "Cancha de futbol", B: "Estacionamiento", C: "Huerto con bancas y sombra" },
    mixta: "Huerto con sombra, una cancha pequeña y cuatro cajones de carga y descarga",
    statusQuo: "El terreno sigue baldío",
    grupos: [
      { id: "comercio", etq: "Comerciantes de la avenida", n: 8, prefs: ["B", "A", "C"], barrera: null, afectacion: "media", color: "#f97316", necesidad: "Sus clientes no encuentran dónde estacionarse." },
      { id: "familias", etq: "Familias con niñas y niños pequeños", n: 6, prefs: ["A", "C", "B"], barrera: "cuidados", afectacion: "media", color: "#f472b6", necesidad: "No hay un lugar seguro para jugar cerca." },
      { id: "cerrada", etq: "Vecinos de la cerrada, junto al terreno", n: 5, prefs: ["C", "A", "B"], barrera: "horario", afectacion: "alta", color: "#a3e635", necesidad: "Viven pegados al terreno; un estacionamiento traería tráfico y ruido a su calle. Trabajan por turnos." },
      { id: "mayores", etq: "Personas adultas mayores", n: 4, prefs: ["C", "B", "A"], barrera: "sede", afectacion: "alta", color: "#60a5fa", necesidad: "No tienen dónde sentarse a la sombra; una cancha junto a sus casas les preocupa por los balonazos." },
      { id: "sordas", etq: "Familia de personas sordas", n: 2, prefs: ["C", "A", "B"], barrera: "lsm", afectacion: "media", color: "#c084fc", necesidad: "Quieren un espacio tranquilo de convivencia." },
      { id: "jovenes", etq: "Jóvenes de la secundaria", n: 6, prefs: ["A", "C", "B"], barrera: "jovenes", afectacion: "media", soloVoz: true, color: "#fcd34d", necesidad: "No tienen dónde hacer deporte después de clases." },
    ],
  },
  {
    id: "tianguis",
    etq: "El horario del tianguis",
    icono: "fa-store",
    problema: "El tianguis de los domingos ocupa la calle Olivo de 7:00 a 17:00. Hay quejas por basura y por la calle cerrada.",
    opciones: { A: "Mantener domingo de 7:00 a 17:00", B: "Domingo de 7:00 a 14:00 con limpieza al cerrar", C: "Mover el tianguis al sábado" },
    mixta: "Domingo de 7:00 a 15:00, limpieza al cerrar y un carril abierto para emergencias",
    statusQuo: "Se mantiene el horario actual (domingo de 7:00 a 17:00)",
    grupos: [
      { id: "tianguistas", etq: "Tianguistas que viven en la colonia", n: 7, prefs: ["A", "B", "C"], barrera: null, afectacion: "alta", color: "#f97316", necesidad: "El domingo por la tarde es cuando más venden; el sábado ya trabajan en otro tianguis." },
      { id: "calle", etq: "Vecinos de la calle Olivo", n: 8, prefs: ["C", "B", "A"], barrera: null, afectacion: "alta", color: "#a3e635", necesidad: "No pueden sacar el auto y la basura se queda toda la noche frente a sus casas." },
      { id: "compradores", etq: "Familias que compran el fin de semana", n: 6, prefs: ["A", "B", "C"], barrera: "horario", afectacion: "media", color: "#f472b6", necesidad: "Trabajan entre semana y solo pueden hacer el mandado el domingo." },
      { id: "mayores", etq: "Personas adultas mayores", n: 4, prefs: ["B", "A", "C"], barrera: "sede", afectacion: "media", color: "#60a5fa", necesidad: "Compran temprano; les preocupa que la calle cerrada impida el paso de una ambulancia." },
      { id: "artesana", etq: "Artesanas sordas del tianguis", n: 2, prefs: ["A", "B", "C"], barrera: "lsm", afectacion: "alta", color: "#c084fc", necesidad: "Venden artesanías; perder el domingo sería perder su principal ingreso." },
      { id: "jovenes", etq: "Jóvenes que ayudan en los puestos", n: 4, prefs: ["A", "B", "C"], barrera: "jovenes", afectacion: "media", soloVoz: true, color: "#fcd34d", necesidad: "Ayudan a su familia los domingos y el sábado tienen escuela abierta." },
    ],
  },
  {
    id: "alumbrado",
    etq: "¿Qué calle se ilumina primero?",
    icono: "fa-lightbulb",
    problema: "El presupuesto participativo alcanza para iluminar solo una zona este año.",
    opciones: { A: "La avenida comercial", B: "El callejón hacia la secundaria", C: "El andador del canal, camino a la parada" },
    mixta: "Reparar las luminarias del callejón y del andador con focos LED, y aplazar la avenida",
    statusQuo: "No se ilumina ninguna zona este año",
    grupos: [
      { id: "comercio", etq: "Comerciantes de la avenida", n: 7, prefs: ["A", "B", "C"], barrera: null, afectacion: "media", color: "#f97316", necesidad: "Con más luz, sus negocios podrían cerrar más tarde." },
      { id: "madres", etq: "Madres y padres de estudiantes", n: 6, prefs: ["B", "C", "A"], barrera: "cuidados", afectacion: "alta", color: "#f472b6", necesidad: "Sus hijas e hijos regresan de noche por el callejón oscuro." },
      { id: "turnos", etq: "Trabajadoras de turno nocturno", n: 5, prefs: ["C", "B", "A"], barrera: "horario", afectacion: "alta", color: "#a3e635", necesidad: "Caminan por el andador a las 5:00 para tomar el transporte." },
      { id: "mayores", etq: "Personas adultas mayores", n: 3, prefs: ["A", "C", "B"], barrera: "sede", afectacion: "media", color: "#60a5fa", necesidad: "Hacen sus compras en la avenida al atardecer." },
      { id: "sorda", etq: "Vecinas sordas del andador", n: 2, prefs: ["C", "A", "B"], barrera: "lsm", afectacion: "media", color: "#c084fc", necesidad: "En la oscuridad no pueden comunicarse en señas ni ver quién se acerca." },
      { id: "jovenes", etq: "Estudiantes de la secundaria", n: 6, prefs: ["B", "C", "A"], barrera: "jovenes", afectacion: "alta", soloVoz: true, color: "#fcd34d", necesidad: "Son quienes cruzan el callejón a oscuras." },
    ],
  },
];

export const OPCIONES: OpcionId[] = ["A", "B", "C"];
export const COLOR_OPCION: Record<OpcionId | "mixta" | "nada", string> = { A: "#38bdf8", B: "#f97316", C: "#4ade80", mixta: "#e879f9", nada: "#64748b" };

export type Ganador = OpcionId | "mixta" | "nada";

export interface ResultadoAsamblea {
  presentes: string[];
  /** Grupos con voz en la asamblea (incluye jóvenes invitados). */
  voces: string[];
  votos: Record<OpcionId, number>;
  /** Opción que votó cada grupo presente con voto. */
  votoDe: Record<string, OpcionId>;
  descartadas: OpcionId[];
  ganador: Ganador;
  adultos: number;
  adultosPresentes: number;
  participacion: number;
  /** Grupos muy afectados que quedaron con su peor opción. */
  minoriasIgnoradas: string[];
  /** Grupos con derecho a voz que no pudieron asistir. */
  excluidos: string[];
  apoyo: number;
  explica: string;
}

function peor(g: Vecinos): OpcionId {
  return g.prefs[2];
}

export function resolverAsamblea(caso: CasoAsamblea, condiciones: Condicion[], proc: Procedimiento): ResultadoAsamblea {
  const puede = (g: Vecinos) => g.barrera === null || condiciones.includes(g.barrera);
  const voces = caso.grupos.filter(puede);
  const votantes = voces.filter((g) => !g.soloVoz);
  const adultos = caso.grupos.filter((g) => !g.soloVoz).reduce((a, g) => a + g.n, 0);
  const adultosPresentes = votantes.reduce((a, g) => a + g.n, 0);
  const votos: Record<OpcionId, number> = { A: 0, B: 0, C: 0 };
  const votoDe: Record<string, OpcionId> = {};
  let descartadas: OpcionId[] = [];
  let ganador: Ganador = "nada";
  let explica = "";

  const votar = (validas: OpcionId[]) => {
    votantes.forEach((g) => {
      const o = g.prefs.find((p) => validas.includes(p));
      if (!o) return;
      votoDe[g.id] = o;
      votos[o] += g.n;
    });
  };
  const masVotada = (validas: OpcionId[]): OpcionId | null => {
    const orden = [...validas].sort((a, b) => votos[b] - votos[a]);
    const a = orden[0];
    if (!a || votos[a] === 0) return null;
    if (orden[1] && votos[orden[1]] === votos[a]) return null;
    return a;
  };

  if (proc === "mayoria") {
    votar(OPCIONES);
    const g = masVotada(OPCIONES);
    ganador = g ?? "nada";
    explica = g
      ? `Gana «${caso.opciones[g]}» con ${votos[g]} de ${adultosPresentes} votos (${pct(votos[g] / Math.max(1, adultosPresentes))} de los presentes). Es rápido y claro, pero solo cuenta a quien llegó y no mide cuánto le afecta a cada quien.`
      : "Empate: habría que repetir la votación.";
  } else if (proc === "calificada") {
    votar(OPCIONES);
    const g = masVotada(OPCIONES);
    if (g && votos[g] * 3 >= adultosPresentes * 2) {
      ganador = g;
      explica = `«${caso.opciones[g]}» reúne ${votos[g]} de ${adultosPresentes} votos: supera los dos tercios. Un umbral alto obliga a sumar a más grupos… salvo que en la sala solo esté un grupo.`;
    } else {
      ganador = "nada";
      explica = `Ninguna opción llega a dos tercios (la más votada tiene ${g ? votos[g] : 0} de ${adultosPresentes}). Sin acuerdo: ${caso.statusQuo.toLowerCase()}. El umbral protege de mayorías estrechas, pero puede paralizar.`;
    }
  } else if (proc === "consenso") {
    votar(OPCIONES);
    const vetadas = new Set(voces.map(peor));
    const libres = OPCIONES.filter((o) => !vetadas.has(o));
    if (voces.length === 0) {
      ganador = "nada";
      explica = "Nadie asistió.";
    } else if (libres.length > 0) {
      // Entre las no vetadas, la que más personas con voz ponen primera o segunda.
      const puntos = (o: OpcionId) => voces.reduce((a, g) => a + (g.prefs[0] === o ? 2 * g.n : g.prefs[1] === o ? g.n : 0), 0);
      const g = [...libres].sort((a, b) => puntos(b) - puntos(a))[0]!;
      ganador = g;
      descartadas = OPCIONES.filter((o) => vetadas.has(o));
      explica = `Ningún grupo presente tiene «${caso.opciones[g]}» como su peor opción: es aceptable para todas las voces en la sala. El consenso cuida a las minorías presentes, pero tarda más y no escucha a quien no llegó.`;
    } else {
      ganador = "mixta";
      descartadas = [...OPCIONES];
      explica = `Cada opción es la peor para algún grupo presente, así que la asamblea negocia una propuesta mixta: «${caso.mixta}». Nadie obtiene su primera opción, pero nadie queda con la peor. Costó tres sesiones.`;
    }
  } else {
    const afectados = caso.grupos.filter((g) => g.afectacion === "alta");
    descartadas = [...new Set(afectados.map(peor))];
    const validas = OPCIONES.filter((o) => !descartadas.includes(o));
    if (validas.length === 0) {
      ganador = "mixta";
      explica = `La consulta descarta las tres opciones: cada una daña gravemente a un grupo afectado. Se construye una propuesta mixta: «${caso.mixta}».`;
    } else {
      votar(validas);
      const g = validas.length === 1 ? validas[0]! : masVotada(validas);
      ganador = g ?? "nada";
      explica = g
        ? `La consulta a ${afectados.map((a) => a.etq.toLowerCase()).join(", ")} descarta ${descartadas.map((d) => `«${caso.opciones[d]}»`).join(" y ")}. Entre lo que queda gana «${caso.opciones[g]}». Protege a los más afectados aunque no asistan, pero quien no fue consultado puede sentir que se decidió por él.`
        : "Empate entre las opciones que quedaron.";
    }
  }

  const minoriasIgnoradas = ganador === "nada" || ganador === "mixta" ? [] : caso.grupos.filter((g) => g.afectacion === "alta" && peor(g) === ganador).map((g) => g.id);
  const excluidos = caso.grupos.filter((g) => !puede(g)).map((g) => g.id);
  let apoyo = 0;
  if (ganador === "mixta") apoyo = voces.filter((g) => !g.soloVoz).reduce((a, g) => a + g.n, 0) / adultos;
  else if (ganador !== "nada") apoyo = caso.grupos.filter((g) => !g.soloVoz && (g.prefs[0] === ganador || g.prefs[1] === ganador)).reduce((a, g) => a + g.n, 0) / adultos;

  return {
    presentes: voces.map((g) => g.id),
    voces: voces.map((g) => g.id),
    votos,
    votoDe,
    descartadas,
    ganador,
    adultos,
    adultosPresentes,
    participacion: adultosPresentes / adultos,
    minoriasIgnoradas,
    excluidos,
    apoyo,
    explica,
  };
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. DEBATE ESTRUCTURADO (A2)
 * ════════════════════════════════════════════════════════════════════════ */

/** Debate A2 «Ciudadanía formal vs. ciudadanía real» — verbatim. */
export const DEBATE_A2 = {
  tema: "¿Es posible ser ciudadano/a pleno/a en México con las desigualdades actuales?",
  reglas: [
    "Argumentar con base en situaciones concretas y reales.",
    "No usar argumentos de autoridad sin evidencia.",
    "Reconocer los puntos válidos de la postura contraria.",
    "Concluir con una propuesta que reconozca la complejidad del problema.",
  ],
  posturas: [
    "Sí es posible: la ciudadanía formal garantiza derechos que cualquier persona puede ejercer independientemente de su situación.",
    "No es posible: sin condiciones materiales mínimas (educación, ingreso, acceso a servicios), la ciudadanía formal es insuficiente para ejercer derechos reales.",
  ],
  criterios: [
    "Distingue claramente entre ciudadanía formal y sustantiva",
    "Usa ejemplos concretos de la realidad mexicana",
    "Reconoce la validez de algunos argumentos de la postura contraria",
    "Propone alguna forma de avanzar hacia una ciudadanía más plena",
  ],
  tiempoMinutos: 3,
};

export type Postura = "si" | "no";

export interface ArgumentoGuia {
  id: string;
  postura: Postura;
  /** Verbatim de los argumentos guía de A2. */
  texto: string;
  /** Réplica ilustrativa desde la postura contraria (escrita para el laboratorio). */
  replica: string;
}

export const ARGUMENTOS: ArgumentoGuia[] = [
  { id: "no1", postura: "no", texto: "Una persona que trabaja 12 horas diarias no tiene tiempo ni energía para participar en política.", replica: "Es cierto que el tiempo limita, pero hay formas de participar que piden poco tiempo, como votar, firmar una petición o ir a una asamblea en fin de semana; el reto es multiplicarlas." },
  { id: "no2", postura: "no", texto: "El acceso a la justicia requiere abogados y recursos que la mayoría no tiene.", replica: "Las defensorías públicas y las comisiones de derechos humanos atienden de forma gratuita; no alcanzan para todos, pero muestran que el acceso se puede ampliar." },
  { id: "no3", postura: "no", texto: "La desnutrición, el analfabetismo y la pobreza extrema limitan la capacidad de ejercer derechos formales.", replica: "Esas carencias limitan, pero los derechos formales son justo la base legal para exigirle al Estado educación, salud y alimentación." },
  { id: "si1", postura: "si", texto: "La Constitución garantiza derechos para todos sin importar su origen o condición económica.", replica: "Que un derecho esté escrito no asegura que se cumpla: una comunidad sin escuela ni clínica cercana tiene el derecho, pero no el acceso." },
  { id: "si2", postura: "si", texto: "Hay mecanismos jurídicos como el amparo que cualquier ciudadano puede usar para defender sus derechos.", replica: "Promover un amparo exige conocer la ley, tiempo y casi siempre asesoría; quien no tiene esos recursos rara vez lo usa." },
  { id: "si3", postura: "si", texto: "Las organizaciones civiles y comunidades han logrado cambios significativos desde sus propios recursos.", replica: "Esos logros existen, pero suelen costar años de esfuerzo; que haga falta tanto muestra que la ciudadanía plena no está garantizada." },
];

export const REPLICA_FALAZ = "Quien piensa distinto solo defiende sus privilegios, así que su argumento no cuenta.";

export type TipoAfirmacion = "hecho" | "valor" | "falacia";
export const TIPOS: { id: TipoAfirmacion; etq: string; color: string; icono: string; explica: string }[] = [
  { id: "hecho", etq: "Hecho", color: "#38bdf8", icono: "fa-magnifying-glass-chart", explica: "Se puede comprobar con datos, documentos o leyes." },
  { id: "valor", etq: "Valor", color: "#c084fc", icono: "fa-scale-balanced", explica: "Juzga lo que es justo o lo que debería ser; se argumenta, no se mide." },
  { id: "falacia", etq: "Falacia", color: "#f87171", icono: "fa-triangle-exclamation", explica: "Parece un argumento, pero su razonamiento falla." },
];

export type Falacia = "autoridad" | "generalizacion" | "hominem" | "dilema";
export const FALACIAS: { id: Falacia; etq: string; explica: string }[] = [
  { id: "autoridad", etq: "Argumento de autoridad sin evidencia", explica: "Da algo por cierto solo porque lo dice alguien con prestigio (lo prohíbe la regla 2 de A2)." },
  { id: "generalizacion", etq: "Generalización apresurada", explica: "Saca una conclusión general de uno o pocos casos." },
  { id: "hominem", etq: "Ataque a la persona (ad hominem)", explica: "Descalifica a quien habla en lugar de responder su argumento." },
  { id: "dilema", etq: "Falso dilema", explica: "Presenta solo dos opciones extremas cuando hay más." },
];

export interface Afirmacion {
  id: string;
  texto: string;
  tipo: TipoAfirmacion;
  falacia?: Falacia;
  /** A qué postura sirve como dato o ejemplo (solo hechos). */
  apoya?: Postura;
  porque: string;
  fuente?: string;
}

export const AFIRMACIONES: Afirmacion[] = [
  { id: "h1", texto: "En 2022, el 36.3 % de la población mexicana vivía en pobreza, según el CONEVAL.", tipo: "hecho", apoya: "no", porque: "Es una cifra medida y publicada: se puede verificar.", fuente: "Recuadro de la lectura A1" },
  { id: "v1", texto: "Una democracia es injusta si quien no tiene tiempo ni dinero no puede hacerse escuchar.", tipo: "valor", porque: "Juzga qué es justo: se defiende con razones, no con una medición." },
  { id: "f1", texto: "Mi tío es abogado y dice que en México nadie puede defender sus derechos; entonces es verdad.", tipo: "falacia", falacia: "autoridad", porque: "El prestigio de quien lo dice no sustituye a la evidencia." },
  { id: "h2", texto: "La Constitución establece el juicio de amparo (artículos 103 y 107) para defender derechos frente a actos de autoridad.", tipo: "hecho", apoya: "si", porque: "Se comprueba leyendo la Constitución." },
  { id: "f2", texto: "Conozco a alguien que salió de la pobreza y llegó a diputado; por lo tanto, la pobreza no limita a nadie.", tipo: "falacia", falacia: "generalizacion", porque: "Un caso excepcional no demuestra una regla general." },
  { id: "v2", texto: "El Estado debería garantizar condiciones mínimas para que todas las personas ejerzan sus derechos.", tipo: "valor", porque: "Dice lo que debería ser: es una postura sobre la justicia." },
  { id: "h3", texto: "Las mujeres mexicanas votaron por primera vez en una elección federal el 3 de julio de 1955.", tipo: "hecho", apoya: "si", porque: "Es un dato histórico documentado." },
  { id: "f3", texto: "Quien dice que la ciudadanía formal basta nunca ha sido pobre, así que no hay que escucharlo.", tipo: "falacia", falacia: "hominem", porque: "Ataca a la persona y no responde lo que dice." },
  { id: "v3", texto: "Tener los derechos escritos en la ley es un logro que vale la pena defender.", tipo: "valor", porque: "Valora un logro; no describe un dato." },
  { id: "f4", texto: "O la Constitución resuelve todos los problemas o no sirve para nada.", tipo: "falacia", falacia: "dilema", porque: "Hay muchas posiciones intermedias entre «lo resuelve todo» y «no sirve»." },
  { id: "h4", texto: "La ENADIS, encuesta del INEGI y el CONAPRED, documenta las formas de discriminación más frecuentes en México.", tipo: "hecho", apoya: "no", porque: "La encuesta existe y sus resultados son públicos.", fuente: "Recuadro de la lectura A1 de la progresión 4" },
];

export interface Propuesta {
  id: string;
  texto: string;
  valida: boolean;
  porque: string;
}

export const PROPUESTAS: Propuesta[] = [
  { id: "p1", texto: "Acercar mecanismos gratuitos —defensorías, asambleas en horarios accesibles, información en lenguas indígenas y en señas— para que los derechos formales se vuelvan reales.", valida: true, porque: "Reconoce el derecho formal y ataca las barreras que impiden ejercerlo." },
  { id: "p2", texto: "Combinar políticas contra la pobreza con educación ciudadana, para que más personas conozcan y usen el amparo, la petición y la participación comunitaria.", valida: true, porque: "Une condiciones materiales y conocimiento de los derechos: reconoce la complejidad." },
  { id: "p3", texto: "Si la ley ya garantiza los derechos, no hace falta hacer nada más.", valida: false, porque: "Ignora la dimensión sustantiva: no reconoce la complejidad del problema (regla 4)." },
  { id: "p4", texto: "Como la desigualdad siempre ha existido, no tiene caso proponer nada.", valida: false, porque: "Apelación a la tradición: que algo siempre haya sido así no significa que no pueda cambiar." },
];

export type Hueco = "argumento" | "dato" | "reconoce" | "replica" | "propuesta";
export const HUECOS_DEBATE: { id: Hueco; etq: string; ayuda: string }[] = [
  { id: "argumento", etq: "Mi argumento", ayuda: "Un argumento guía de tu postura (A2)." },
  { id: "dato", etq: "Dato o ejemplo concreto", ayuda: "Un hecho de la realidad mexicana que apoye tu postura (regla 1)." },
  { id: "reconoce", etq: "Reconozco un punto válido contrario", ayuda: "Un argumento de la otra postura (regla 3)." },
  { id: "replica", etq: "Mi réplica", ayuda: "Responde al punto que reconociste, sin atacar a la persona (regla 2)." },
  { id: "propuesta", etq: "Propuesta final", ayuda: "Una salida que reconozca la complejidad (regla 4)." },
];

export interface Intervencion {
  postura: Postura | null;
  argumento: string | null;
  dato: string | null;
  reconoce: string | null;
  replica: string | null;
  propuesta: string | null;
}

export const INTERVENCION_VACIA: Intervencion = { postura: null, argumento: null, dato: null, reconoce: null, replica: null, propuesta: null };

export interface Revision {
  hueco: Hueco;
  ok: boolean;
  nota: string;
}

/** Revisa la ESTRUCTURA de la intervención; nunca califica la postura elegida. */
export function revisarIntervencion(iv: Intervencion): { revisiones: Revision[]; reglas: boolean[]; criterios: boolean[] } {
  const p = iv.postura;
  const arg = ARGUMENTOS.find((a) => a.id === iv.argumento);
  const dato = AFIRMACIONES.find((a) => a.id === iv.dato);
  const rec = ARGUMENTOS.find((a) => a.id === iv.reconoce);
  const prop = PROPUESTAS.find((x) => x.id === iv.propuesta);
  const replicaOk = !!rec && iv.replica === rec.id;
  const replicaFalaz = iv.replica === "falaz";

  const revisiones: Revision[] = [
    { hueco: "argumento", ok: !!arg && arg.postura === p, nota: !arg ? "Falta tu argumento." : arg.postura === p ? "Tu argumento sostiene tu postura." : "Ese argumento sostiene la postura contraria: no es coherente con tu tesis." },
    {
      hueco: "dato",
      ok: !!dato && dato.tipo === "hecho" && dato.apoya === p,
      nota: !dato ? "Falta un dato." : dato.tipo !== "hecho" ? `Eso es ${dato.tipo === "valor" ? "un juicio de valor" : "una falacia"}, no un dato comprobable.` : dato.apoya !== p ? "Es un hecho, pero apoya más a la otra postura." : "Dato concreto y comprobable que apoya tu postura.",
    },
    { hueco: "reconoce", ok: !!rec && rec.postura !== p, nota: !rec ? "Falta reconocer un punto contrario." : rec.postura !== p ? "Reconoces un argumento de la otra postura." : "Ese argumento es de tu propia postura: la regla pide reconocer uno contrario." },
    { hueco: "replica", ok: replicaOk, nota: replicaFalaz ? "Esa réplica ataca a la persona (ad hominem), no responde el argumento." : !iv.replica ? "Falta tu réplica." : replicaOk ? "Tu réplica responde justo el punto que reconociste." : "Tu réplica responde a otro argumento, no al que reconociste." },
    { hueco: "propuesta", ok: !!prop && prop.valida, nota: !prop ? "Falta la propuesta." : prop.porque },
  ];
  const ok = (h: Hueco) => revisiones.find((r) => r.hueco === h)!.ok;
  const sinFalacias = !!dato && dato.tipo !== "falacia" && !!iv.replica && !replicaFalaz && !!prop && prop.id !== "p4";
  const reglas = [ok("dato"), sinFalacias, ok("reconoce"), ok("propuesta")];
  const criterios = [ok("argumento") && ok("reconoce"), ok("dato"), ok("reconoce") && ok("replica"), ok("propuesta")];
  return { revisiones, reglas, criterios };
}

/* ════════════════════════════════════════════════════════════════════════
 * Contenido VERBATIM
 * ════════════════════════════════════════════════════════════════════════ */

export const TITULO_A1 = "¿Qué significa ser ciudadano/a hoy?";

/** Lectura A1 — cuatro párrafos, verbatim. */
export const LECTURA_A1: string[] = [
  "La ciudadanía es una de las ideas más importantes y más disputadas de la modernidad. En su dimensión formal, ser ciudadano significa tener un estatus jurídico reconocido por el Estado: documentos de identidad, derecho a votar, a ser votado, a acceder a servicios públicos. En México, la ciudadanía formal se adquiere a los 18 años con la credencial del INE.",
  "Pero la ciudadanía tiene también una dimensión sustantiva o real, que no siempre coincide con la formal. Una persona puede tener todos los papeles en regla y sin embargo no poder ejercer sus derechos plenos: por falta de acceso a información, por discriminación, por vivir en una zona marginada donde el Estado no llega, por barreras económicas o culturales.",
  "Históricamente, la ciudadanía ha sido un derecho que se ha ido ampliando: en muchos países, las mujeres no podían votar hasta el siglo XX (en México obtuvieron el sufragio en 1953), las personas de ciertos grupos étnicos eran excluidas, y los trabajadores sin propiedad no tenían derechos políticos. Esta historia muestra que la ciudadanía no es un dato natural: es una conquista que resulta de luchas y movimientos sociales.",
  "Hoy, el concepto de ciudadanía se expande para incluir dimensiones como la ciudadanía digital (derechos y responsabilidades en el entorno virtual), la ciudadanía ambiental (responsabilidades hacia el planeta) y la ciudadanía global (conciencia de los problemas que trascienden las fronteras nacionales).",
];

/** Recuadro «info» de la lectura A1 — verbatim. */
export const RECUADRO_A1 =
  "El CONEVAL mide la pobreza en México con un enfoque multidimensional que incluye ingreso, rezago educativo, acceso a servicios de salud, vivienda y alimentación. En 2022, el 36.3% de la población mexicana vivía en pobreza — datos que ilustran la complejidad de los fenómenos sociales.";

/** Precisiones del laboratorio (no verbatim). */
export const NOTA_RECUADRO =
  "Actualización: tras la reforma constitucional publicada el 20 de diciembre de 2024, el CONEVAL se extinguió y la medición de la pobreza pasó al INEGI. Precisión: según el art. 34, la ciudadanía se adquiere al cumplir 18 años (y tener un modo honesto de vivir); la credencial del INE es el documento para votar, no lo que la otorga. Y en 1953 el sufragio femenino se reconoció a nivel federal: desde 1947 las mujeres ya votaban en elecciones municipales.";

/** Preguntas de comprensión de A1 — verbatim. */
export const PREGUNTAS: string[] = [
  "¿Cuál es la diferencia entre ciudadanía formal y ciudadanía sustantiva?",
  "¿En qué año obtuvieron las mujeres mexicanas el derecho al voto?",
  "¿Por qué el texto dice que la ciudadanía es una 'conquista'?",
];

/** Preguntas de reflexión de A3, A7 y A8 — verbatim. */
export const REFLEXION: { ancla: string; texto: string }[] = [
  { ancla: "A3", texto: "¿Qué acciones ciudadanas podrías tomar en tu escuela, comunidad o ciudad, aunque todavía no tengas derecho al voto?" },
  { ancla: "A7", texto: "¿Qué acción ciudadana concreta te comprometes a realizar este semestre?" },
  { ancla: "A8", texto: "¿Cómo ha cambiado el concepto de ciudadanía a lo largo de la historia?" },
];

/** Hechos: quiz A5 (verdadero/falso), verbatim con su retroalimentación. */
export const HECHOS: string[] = [
  "Falso: «Tener todos los papeles en regla garantiza poder ejercer todos los derechos». La ciudadanía formal no asegura la sustantiva: hay barreras económicas, culturales y de acceso.",
  "Verdadero: «La ciudadanía ha sido históricamente un derecho que se ha ido ampliando». Correcto: antes se excluía a mujeres, grupos étnicos y trabajadores sin propiedad.",
  "Verdadero: «La ciudadanía ambiental implica responsabilidades hacia el planeta». Sí, es una de las dimensiones contemporáneas de la ciudadanía.",
  "Falso: «Antes de poder votar, una persona joven no puede ejercer ninguna acción ciudadana». Puede organizarse, participar en su comunidad, peticionar y exigir derechos.",
];

/** Glosario A6 — verbatim. */
export const GLOSARIO: { termino: string; definicion: string; ejemplo: string }[] = [
  { termino: "Ciudadanía formal", definicion: "Estatus jurídico reconocido por el Estado (votar, identidad, servicios).", ejemplo: "Obtener la credencial del INE a los 18 años." },
  { termino: "Ciudadanía sustantiva", definicion: "Capacidad real de ejercer los derechos que se tienen formalmente.", ejemplo: "Poder acceder de verdad a la justicia o a la salud." },
  { termino: "Sufragio", definicion: "Derecho a votar y ser votado.", ejemplo: "El sufragio femenino en México data de 1953." },
  { termino: "Derecho de petición", definicion: "Derecho a dirigir solicitudes a la autoridad y recibir respuesta.", ejemplo: "Pedir por escrito información a un ayuntamiento." },
  { termino: "Ciudadanía digital", definicion: "Derechos y responsabilidades en el entorno virtual.", ejemplo: "Usar redes con respeto y proteger datos personales." },
  { termino: "Participación", definicion: "Acción de involucrarse en los asuntos públicos.", ejemplo: "Sumarse a una asamblea o colectivo comunitario." },
];

export const ACTIVIDAD_A6 = "Da un ejemplo concreto de cómo podrías ejercer la ciudadanía aunque aún no votes.";

export const FUENTE =
  "CEN Bachillerato — CS-I, progresión 2: lectura A1 (Material elaborado para CEN Bachillerato), debate A2, reflexión A3, quiz A4, verdadero/falso A5, glosario A6, autoevaluación A7 y video A8; inspiración en las progresiones 3 y 4.";

export const PROBLEMA =
  "¿Quién cuenta cuando «el pueblo» decide? En la Atenas que inventó la democracia votaba una minoría, y en México la ciudadanía se ha ampliado reforma tras reforma. Pero tener el derecho no basta: también hay que poder ejercerlo. Aquí predices quién podía participar en cada época, conduces una asamblea donde el procedimiento decide quién gana y quién queda fuera, y armas tu intervención en un debate.";

export const INSTRUCCIONES: string[] = [
  "En «¿Quién entra al ágora?», elige una época, predice qué grupos podían participar y abre el ágora: las personas con derechos entran y las excluidas se quedan fuera.",
  "Recorre las ocho épocas; en 1917 y en 2014–2019 descubre qué cambió aunque la multitud no cambie.",
  "En «Asamblea vecinal», elige un problema de la colonia, decide las condiciones de la convocatoria y el procedimiento, y celebra la asamblea. Compara procedimientos: no hay uno correcto.",
  "En «Debate estructurado», clasifica afirmaciones en hecho, valor o falacia y arma tu intervención con fichas desde la postura que tú elijas.",
  "Gana estrellas prediciendo quién tenía ciudadanía y resuelve el quiz A4 y el texto de la lectura A1.",
];

export const IDEAS: string[] = [
  "La ciudadanía no es un dato natural: quién cuenta como ciudadano ha cambiado con cada época y cada lucha.",
  "Ciudadanía formal es tener el derecho; ciudadanía sustantiva es poder ejercerlo de verdad.",
  "Una reforma puede cambiar QUIÉN vota (1953, 1969), CÓMO se vota (1917, 2005) o QUIÉN puede ser votada (paridad).",
  "Un procedimiento democrático no es neutro: horario, sede, lengua y reglas de votación deciden quién participa.",
  "La mayoría decide, pero la democracia también protege a las minorías afectadas.",
  "En un debate, los hechos se comprueban, los valores se argumentan y las falacias se detectan.",
];

/** Quiz A4 «Ciudadanía — Quiz» — verbatim. */
export const QUIZ_A4: QuizEvaluable = {
  titulo: "Ciudadanía — Quiz",
  puntajeMinimo: 70,
  reactivos: [
    { enunciado: "¿A qué edad se adquiere la ciudadanía formal en México?", opciones: ["A los 15 años", "A los 16 años", "A los 18 años", "A los 21 años"], respuestaCorrecta: 2, retroalimentacion: "A los 18 años, con la credencial del INE." },
    { enunciado: "La ciudadanía 'sustantiva' o real se refiere a:", opciones: ["tener la credencial de elector", "la capacidad real de ejercer los derechos", "haber nacido en el país", "pagar impuestos"], respuestaCorrecta: 1, retroalimentacion: "Es la capacidad efectiva de ejercer derechos, más allá del estatus jurídico." },
    { enunciado: "¿En qué año obtuvieron las mujeres mexicanas el derecho al voto?", opciones: ["1917", "1929", "1953", "1968"], respuestaCorrecta: 2, retroalimentacion: "En 1953 se reconoció el sufragio femenino a nivel federal." },
    { enunciado: "Que la ciudadanía sea una 'conquista' significa que:", opciones: ["es un dato natural", "se ha ampliado gracias a luchas y movimientos sociales", "se compra con dinero", "la otorga un solo gobernante"], respuestaCorrecta: 1, retroalimentacion: "Históricamente fue negada a muchos grupos y se amplió por la lucha social." },
    { enunciado: "¿Cuál es un ejemplo de ciudadanía ampliada hoy?", opciones: ["ciudadanía digital", "ciudadanía hereditaria", "ciudadanía militar", "ciudadanía vitalicia"], respuestaCorrecta: 0, retroalimentacion: "Ciudadanía digital, ambiental y global son expansiones contemporáneas del concepto." },
  ],
};

/**
 * Texto con huecos sobre frases VERBATIM de la lectura A1 (la progresión no
 * tiene actividad fill_blanks). Las pistas son las definiciones del glosario A6.
 */
export const HUECOS_A1: TextoHuecosData = {
  ancla: "CS-I-P02-A1 · Lectura «¿Qué significa ser ciudadano/a hoy?» con huecos",
  instrucciones: "Completa las frases de la lectura A1 con la palabra que falta.",
  partes: [
    "En su dimensión ",
    ", ser ciudadano significa tener un estatus jurídico reconocido por el Estado. Pero la ciudadanía tiene también una dimensión ",
    " o real, que no siempre coincide con la formal. Históricamente, la ciudadanía ha sido un derecho que se ha ido ",
    ": en muchos países, las mujeres no podían votar hasta el siglo XX (en México obtuvieron el sufragio en ",
    "). Esta historia muestra que la ciudadanía no es un dato natural: es una ",
    " que resulta de luchas y movimientos sociales. Hoy se expande para incluir la ciudadanía ",
    " (derechos y responsabilidades en el entorno virtual).",
  ],
  huecos: [
    { respuesta: "formal", alternativas: [], pista: "Estatus jurídico reconocido por el Estado (votar, identidad, servicios). — Glosario A6" },
    { respuesta: "sustantiva", alternativas: ["sustancial"], pista: "Capacidad real de ejercer los derechos que se tienen formalmente. — Glosario A6" },
    { respuesta: "ampliando", alternativas: ["expandiendo", "extendiendo"], pista: "Cada vez incluye a más personas." },
    { respuesta: "1953", alternativas: [], pista: "Reforma al artículo 34, publicada en octubre de ese año." },
    { respuesta: "conquista", alternativas: [], pista: "No se regaló: se ganó con luchas sociales." },
    { respuesta: "digital", alternativas: [], pista: "Derechos y responsabilidades en el entorno virtual. — Glosario A6" },
  ],
};
