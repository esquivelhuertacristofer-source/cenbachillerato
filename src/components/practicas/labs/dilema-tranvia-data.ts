/**
 * Datos y modelo del laboratorio "Dilemas éticos: el tranvía, la vida
 * cotidiana y la balanza de argumentos" (PFH-II-P02, progresión 2 de
 * Pensamiento Filosófico y Humanidades II).
 *
 * Anclas:
 *   - A1 lectura «Fundamentos éticos de la acción humana»: marco teórico
 *     verbatim (5 párrafos + recuadro sobre el dilema del tranvía).
 *   - A2 quiz «Corrientes éticas: ¿quién tiene razón?»: reto evaluable.
 *   - A3 debate «¿Los fines justifican los medios?»: tema, posturas, reglas,
 *     criterios y argumentos guía verbatim (modo 3).
 *   - A4 verdadero/falso: hechos. A5 glosario. A6 completa el texto.
 *   - A7 autoevaluación y A8 video: preguntas de reflexión verbatim.
 *
 * Regla pedagógica del laboratorio: NO hay una respuesta moral correcta. Nunca
 * se califica la decisión del alumno; se evalúa lo evaluable: la coherencia
 * entre decisión y razón, identificar la teoría que sostiene cada razón, la
 * estructura de un argumento (premisa, razón, conclusión), distinguir hechos
 * de valores, reconocer a los afectados y detectar falacias.
 *
 * Las variantes del tranvía son las de la literatura (Foot, 1967; Thomson,
 * 1976 y 1985). Los casos de la vida cotidiana, los personajes y las
 * intervenciones que no vienen de A3 son ilustrativos (escritos para el
 * laboratorio).
 *
 * Datos puros (sin three ni React).
 */

import type { QuizEvaluable } from "./_reto-quiz";
import type { TextoHuecosData } from "./_mecanica-huecos";

/* ── Modos ────────────────────────────────────────────────────────────── */

export type Modo = "tranvia" | "cotidiano" | "dialogo";
export const MODOS: Modo[] = ["tranvia", "cotidiano", "dialogo"];

export const MODOS_DEF: Record<Modo, { etq: string; subtitulo: string; icono: string; color: string }> = {
  tranvia: { etq: "El tranvía y sus variantes", subtitulo: "Decide, justifica y revisa tu consistencia", icono: "fa-train-tram", color: "#fb923c" },
  cotidiano: { etq: "Dilemas de la vida cotidiana", subtitulo: "Afectados, hechos, valores y argumentos", icono: "fa-people-arrows", color: "#22d3ee" },
  dialogo: { etq: "Balanza de argumentos", subtitulo: "¿Los fines justifican los medios? (A3)", icono: "fa-scale-balanced", color: "#c084fc" },
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

/* ════════════════════════════════════════════════════════════════════════
 * Teorías éticas y falacias
 * ════════════════════════════════════════════════════════════════════════ */

export type Teoria = "utilitarismo" | "deontologia" | "virtudes" | "cuidado";
export const TEORIAS: Teoria[] = ["utilitarismo", "deontologia", "virtudes", "cuidado"];

/** Las cuatro corrientes de la lectura A1 (más la doctrina del doble efecto en el modo 1). */
export const TEORIA_DEF: Record<Teoria | "dobleEfecto", { etq: string; corto: string; autor: string; pregunta: string; color: string; icono: string }> = {
  utilitarismo: { etq: "Utilitarismo", corto: "Utilitarismo", autor: "John Stuart Mill", pregunta: "¿Qué acción produce la mayor felicidad para el mayor número?", color: "#fbbf24", icono: "fa-calculator" },
  deontologia: { etq: "Deontología kantiana", corto: "Deontología", autor: "Immanuel Kant", pregunta: "¿Puedo querer que mi máxima sea ley universal? ¿Trato a alguien solo como medio?", color: "#60a5fa", icono: "fa-scroll" },
  virtudes: { etq: "Ética de la virtud", corto: "Virtudes", autor: "Aristóteles", pregunta: "¿Qué haría una persona prudente, justa y valiente?", color: "#a3e635", icono: "fa-seedling" },
  cuidado: { etq: "Ética del cuidado", corto: "Cuidado", autor: "Carol Gilligan y Nel Noddings", pregunta: "¿Qué responsabilidad concreta tengo con quienes dependen de mí o son vulnerables?", color: "#f472b6", icono: "fa-hand-holding-heart" },
  dobleEfecto: { etq: "Doctrina del doble efecto", corto: "Doble efecto", autor: "Tradición de Tomás de Aquino", pregunta: "¿El daño es un efecto previsto o el medio para lograr el bien? ¿Es proporcionado?", color: "#2dd4bf", icono: "fa-code-branch" },
};

export type Falacia = "adHominem" | "pendiente" | "falsoDilema" | "adPopulum";

export const FALACIA_DEF: Record<Falacia, { etq: string; define: string }> = {
  adHominem: { etq: "Ad hominem", define: "Ataca a la persona o sus motivos en lugar de responder a su argumento." },
  pendiente: { etq: "Pendiente resbaladiza", define: "Afirma, sin pruebas, que un primer paso llevará sin remedio a una cadena de consecuencias extremas." },
  falsoDilema: { etq: "Falso dilema", define: "Presenta solo dos opciones como si fueran las únicas, cuando hay más." },
  adPopulum: { etq: "Ad populum", define: "Da algo por correcto solo porque mucha gente lo cree, lo prefiere o lo hace." },
};

export const NO = "#f87171";

/* ════════════════════════════════════════════════════════════════════════
 * 1. EL TRANVÍA Y SUS VARIANTES
 * ════════════════════════════════════════════════════════════════════════ */

export type Variante = "palanca" | "puente" | "lazo" | "trasplante";
export const VARIANTES: Variante[] = ["palanca", "puente", "lazo", "trasplante"];
export type Decision = "actuar" | "no";

export interface VarianteDef {
  id: Variante;
  etq: string;
  icono: string;
  texto: string;
  origen: string;
  /** Qué papel juega la persona sacrificada: su muerte se prevé o su cuerpo es el medio. */
  estructura: "prever" | "usar";
  estructuraTxt: string;
  actuar: string;
  noActuar: string;
  /** Si el número de personas en riesgo se puede cambiar. */
  numeroLibre: boolean;
}

export const VARIANTE_DEF: Record<Variante, VarianteDef> = {
  palanca: {
    id: "palanca",
    etq: "La palanca",
    icono: "fa-code-fork",
    texto: "Un tranvía sin frenos avanza hacia un grupo de trabajadores que no alcanzan a salir de la vía. Estás junto a una palanca: si la jalas, el tranvía se desvía a una vía lateral donde hay un solo trabajador.",
    origen: "Philippa Foot (1967) planteó el caso con el conductor del tranvía; Judith Jarvis Thomson (1976, 1985) puso a un transeúnte junto a la palanca.",
    estructura: "prever",
    estructuraTxt: "Se PREVÉ la muerte del trabajador de la vía lateral, pero no se le usa: si no estuviera ahí, los demás se salvarían igual.",
    actuar: "Jalar la palanca",
    noActuar: "No tocar la palanca",
    numeroLibre: true,
  },
  puente: {
    id: "puente",
    etq: "El puente",
    icono: "fa-bridge",
    texto: "El tranvía va hacia los trabajadores. Estás en un puente sobre la vía, junto a una persona que carga una mochila muy pesada. Si la empujas, su cuerpo y su mochila detendrán el tranvía antes de que llegue al grupo. Tú no pesas lo suficiente para detenerlo.",
    origen: "Judith Jarvis Thomson (1976, 1985). En la versión original es un hombre corpulento; aquí la mochila hace el mismo papel.",
    estructura: "usar",
    estructuraTxt: "Se USA a la persona: su cuerpo es el medio que detiene el tranvía. Sin ella, el grupo no se salvaría.",
    actuar: "Empujar a la persona",
    noActuar: "No empujar",
    numeroLibre: true,
  },
  lazo: {
    id: "lazo",
    etq: "El lazo",
    icono: "fa-rotate",
    texto: "Puedes desviar el tranvía con una palanca, pero la vía lateral da la vuelta y regresa a la principal. En ella hay una persona con una mochila pesada: su cuerpo frenará el tranvía. Si no estuviera ahí, el tranvía daría la vuelta y llegaría igual al grupo.",
    origen: "Judith Jarvis Thomson (1985) lo diseñó para poner a prueba la doctrina del doble efecto: se jala una palanca, como en el primer caso, pero la persona es el medio, como en el puente.",
    estructura: "usar",
    estructuraTxt: "No hay que empujar a nadie, pero se USA a la persona: solo su cuerpo impide que el tranvía complete el lazo.",
    actuar: "Desviar al lazo",
    noActuar: "No desviar",
    numeroLibre: true,
  },
  trasplante: {
    id: "trasplante",
    etq: "El trasplante",
    icono: "fa-user-doctor",
    texto: "Eres cirujano. Cinco pacientes morirán pronto si no reciben un órgano: corazón, pulmones, hígado y dos riñones. Llega a revisión una persona sana que es compatible con los cinco. Podrías sacrificarla para trasplantar sus órganos.",
    origen: "Judith Jarvis Thomson (1976) lo contrastó con el tranvía: la cuenta es la misma, uno contra cinco, pero a la mayoría de las personas le parece inaceptable.",
    estructura: "usar",
    estructuraTxt: "Se USA a la persona sana: sus órganos son el medio para salvar a los cinco, y ella confió en su médico.",
    actuar: "Trasplantar sus órganos",
    noActuar: "No hacerlo",
    numeroLibre: false,
  },
};

export const N_MIN = 1;
export const N_MAX = 10;
export const N_INICIAL = 5;
export const ORGANOS = ["Corazón", "Pulmones", "Hígado", "Riñón", "Riñón"];

/** Personas en riesgo en cada variante (en el hospital siempre son cinco). */
export function enRiesgo(v: Variante, n: number): number {
  return VARIANTE_DEF[v].numeroLibre ? n : 5;
}

export type Veredicto = "permite" | "prohibe" | "debatido" | "juicio" | "indiferente";

export const VEREDICTO_DEF: Record<Veredicto, { etq: string; color: string }> = {
  permite: { etq: "Permite actuar", color: "#34d399" },
  prohibe: { etq: "Prohíbe actuar", color: "#f87171" },
  debatido: { etq: "Debatido", color: "#fbbf24" },
  juicio: { etq: "Sin fórmula", color: "#94a3b8" },
  indiferente: { etq: "Da igual", color: "#94a3b8" },
};

/** Cómo razonaría típicamente cada teoría (dentro de cada una hay autores que discrepan). */
export function veredictoTeoria(t: Teoria | "dobleEfecto", v: Variante, nRaw: number): { v: Veredicto; txt: string } {
  const n = enRiesgo(v, nRaw);
  const personas = n === 1 ? "una persona" : `${n} personas`;
  if (t === "utilitarismo") {
    if (n === 1) return { v: "indiferente", txt: "Una vida contra una vida: el balance de consecuencias es el mismo, así que el cálculo no favorece ninguna opción." };
    if (v === "trasplante")
      return {
        v: "debatido",
        txt: "El utilitarismo de actos cuenta cinco vidas contra una y actuaría. El utilitarismo de reglas lo rechaza: si los médicos hicieran esto, nadie se atrevería a ir al hospital y el daño total sería mayor.",
      };
    return { v: "permite", txt: `Cuenta las consecuencias: salvar a ${personas} a costa de una produce más bienestar. Para esta teoría no importa si se desvía, se empuja o se usa el lazo: el resultado es el mismo.` };
  }
  if (t === "deontologia") {
    if (v === "palanca")
      return {
        v: "debatido",
        txt: "Nadie es usado como medio: la persona de la vía lateral no es necesaria para salvar a las demás. Por eso muchos kantianos lo permiten; otros sostienen que igual es matar a alguien que no estaba en peligro. El número de personas no cambia el razonamiento.",
      };
    if (v === "trasplante") return { v: "prohibe", txt: "Usar a la persona sana como simple medio viola su dignidad, que no se intercambia por ningún resultado, sin importar cuántos se salven." };
    return { v: "prohibe", txt: `El cuerpo de la persona es el medio para detener el tranvía: se la trata solo como medio. Da igual que se salven ${personas}; la dignidad no se suma ni se resta.` };
  }
  if (t === "dobleEfecto") {
    if (v === "palanca") {
      if (n === 1) return { v: "prohibe", txt: "La muerte es un efecto previsto, no el medio, pero falta la cuarta condición: un bien proporcionado. Una vida contra una no lo es." };
      return { v: "permite", txt: `Se busca salvar a ${personas}; la muerte del otro es un efecto secundario previsto, no el medio, y el bien es proporcionado. La doctrina lo permite.` };
    }
    if (v === "lazo")
      return {
        v: "prohibe",
        txt: "En sentido estricto, lo prohíbe: el choque contra la persona es el medio para detener el tranvía. Thomson (1985) sostuvo que el lazo parece tan aceptable como la palanca, y lo usó como objeción a esta doctrina.",
      };
    return { v: "prohibe", txt: "El daño a la persona no es un efecto secundario: es el medio para lograr el bien. La doctrina del doble efecto no lo permite, aunque el resultado sea bueno." };
  }
  if (t === "virtudes") {
    if (v === "palanca") return { v: "juicio", txt: "No da una regla: pregunta qué haría una persona prudente y compasiva. Muchos creen que actuaría, con pesar y asumiendo la responsabilidad; otros, que no le corresponde elegir quién muere." };
    if (v === "puente") return { v: "juicio", txt: "Empujar exige tratar a alguien como un objeto y vencer la compasión. Una persona justa difícilmente se reconocería en ese acto, aunque la prudencia pese las consecuencias." };
    if (v === "lazo") return { v: "juicio", txt: "La prudencia (phrónesis) atiende a los detalles del caso: ¿qué carácter forma quien desvía sabiendo que el cuerpo de otro será el freno?" };
    return { v: "juicio", txt: "Un médico virtuoso es honesto y justo con quien confía en él. Sacrificar a su paciente contradice las virtudes propias de su oficio." };
  }
  // cuidado
  if (v === "trasplante") return { v: "prohibe", txt: "El médico tiene una relación concreta de cuidado con la persona que llegó a revisión. Traicionar esa confianza no puede justificarse con una cuenta abstracta." };
  if (v === "palanca") return { v: "juicio", txt: "Desconfía de reducir el caso a números: pregunta quiénes son esas personas, quién depende de ellas y si hay otra salida, como gritar o avisar." };
  return { v: "juicio", txt: "Atiende a la vulnerabilidad de quien está junto a ti: empujarlo o usarlo rompe el vínculo de cuidado con la persona más cercana y expuesta." };
}

/* ── Razones que el alumno puede elegir ───────────────────────────────── */

export interface Razon {
  id: string;
  texto: string;
  teoria: Teoria | "dobleEfecto" | "falacia";
  /** Qué decisiones sostiene esta razón en cada variante (con n personas en riesgo). */
  apoya: (v: Variante, n: number) => Decision[];
  /** Por qué no sostiene la decisión contraria (se muestra si hay incoherencia). */
  porque: (v: Variante, n: number) => string;
}

export const RAZONES: Razon[] = [
  {
    id: "mas-vidas",
    texto: "Hay que elegir lo que salve más vidas: el mejor resultado para el mayor número.",
    teoria: "utilitarismo",
    apoya: (v, n) => (enRiesgo(v, n) > 1 ? ["actuar"] : ["actuar", "no"]),
    porque: (v, n) => (enRiesgo(v, n) > 1 ? `Si lo que cuenta es salvar más vidas, esta razón pide actuar: ${enRiesgo(v, n)} contra 1.` : "Con una persona de cada lado, contar vidas no favorece ninguna opción."),
  },
  {
    id: "no-medio",
    texto: "No debo usar a ninguna persona como simple medio, aunque así se salven otras.",
    teoria: "deontologia",
    apoya: (v) => (v === "palanca" ? [] : ["no"]),
    porque: (v) =>
      v === "palanca"
        ? "En la palanca nadie es usado como medio: el trabajador de la vía lateral no es necesario para salvar a los demás. Esta razón no decide este caso; busca la que de verdad te guía (¿no matar?, ¿salvar más vidas?)."
        : "Actuar aquí es exactamente usar a la persona como medio: su cuerpo u órganos salvan a los demás. Esta razón pide no actuar.",
  },
  {
    id: "no-matar",
    texto: "Matar a alguien es peor que dejar que muera: no debo convertirme en la causa de su muerte.",
    teoria: "deontologia",
    apoya: () => ["no"],
    porque: () => "Si matar es peor que dejar morir, esta razón pide no intervenir en ninguna de las variantes.",
  },
  {
    id: "doble-efecto",
    texto: "Es aceptable causar un daño si es un efecto secundario previsto, no el medio, y si el bien que se logra es proporcionado.",
    teoria: "dobleEfecto",
    apoya: (v, n) => (v === "palanca" && enRiesgo(v, n) > 1 ? ["actuar"] : ["no"]),
    porque: (v, n) =>
      v === "palanca"
        ? enRiesgo(v, n) > 1
          ? "En la palanca la muerte es un efecto previsto, no el medio, y el bien es proporcionado: esta razón permite actuar."
          : "Con una persona de cada lado no hay un bien proporcionado: esta razón no permite actuar."
        : "Aquí el daño es el medio para lograr el bien, no un efecto secundario: esta razón no permite actuar.",
  },
  {
    id: "virtud",
    texto: "Me pregunto qué haría una persona prudente, justa y compasiva en mi lugar.",
    teoria: "virtudes",
    apoya: () => ["actuar", "no"],
    porque: () => "La ética de la virtud no da un veredicto automático: tu decisión es coherente si explicas qué virtud la guía.",
  },
  {
    id: "cuidado",
    texto: "Tengo una responsabilidad concreta con quien confía en mí o está más cerca y vulnerable.",
    teoria: "cuidado",
    apoya: (v) => (v === "trasplante" || v === "puente" ? ["no"] : ["actuar", "no"]),
    porque: (v) =>
      v === "trasplante"
        ? "La persona sana confió en su médico: la responsabilidad concreta con ella pide no traicionarla."
        : v === "puente"
          ? "La persona que está junto a ti es la más cercana y expuesta: esta razón pide no empujarla."
          : "Aquí la responsabilidad concreta no señala una sola opción: explica con quién sientes ese vínculo.",
  },
  {
    id: "mayoria",
    texto: "Haría lo que haría la mayoría de la gente.",
    teoria: "falacia",
    apoya: () => [],
    porque: () => "Que mucha gente lo haga no lo vuelve correcto: es una falacia ad populum. No justifica ninguna de las dos decisiones.",
  },
];

export function razonCoherente(r: Razon, v: Variante, d: Decision, n: number): boolean {
  return r.apoya(v, n).includes(d);
}

export interface Eleccion {
  decision: Decision;
  razon: string;
  n: number;
  texto: string;
}

/** Observaciones sobre la consistencia del alumno entre variantes. No califica la postura. */
export function analizarConsistencia(e: Partial<Record<Variante, Eleccion>>): string[] {
  const obs: string[] = [];
  const pal = e.palanca;
  const pue = e.puente;
  const laz = e.lazo;
  const tra = e.trasplante;
  const teoriaDe = (x?: Eleccion) => RAZONES.find((r) => r.id === x?.razon)?.teoria;
  if (pal && pue) {
    if (pal.decision === "actuar" && pue.decision === "no") {
      obs.push("Cambiaste de decisión cuando el daño pasó de PREVER (palanca) a USAR a alguien como medio (puente). Esa es justo la distinción de la doctrina del doble efecto y del principio kantiano de no usar a nadie solo como medio.");
      if (teoriaDe(pal) === "utilitarismo") obs.push("Ojo: en la palanca tu razón fue utilitarista. Un utilitarista consistente también empujaría, porque las consecuencias son iguales. ¿Qué te hizo cambiar en el puente? Esa razón es la que de verdad guía tu decisión.");
    } else if (pal.decision === "actuar" && pue.decision === "actuar") {
      obs.push("Mantuviste la decisión de actuar en la palanca y en el puente: tu patrón coincide con el utilitarismo, para el que solo cuentan las consecuencias. La prueba de fuego es el trasplante: ¿también ahí actuarías? Si no, busca qué lo hace distinto.");
    } else if (pal.decision === "no" && pue.decision === "no") {
      obs.push("No actuaste ni en la palanca ni en el puente: tu patrón coincide con la idea de que matar es peor que dejar morir, sin importar el número.");
    } else {
      obs.push("No jalaste la palanca pero sí empujaste en el puente. Es un patrón poco común: si usar a alguien como medio te parece aceptable, ¿qué hace peor desviar el tranvía, donde nadie es usado? Busca la razón que distingue los dos casos.");
    }
    if (pal.n !== pue.n) obs.push(`Decidiste con ${pal.n} personas en riesgo en la palanca y ${pue.n} en el puente: para comparar con justicia, conviene usar el mismo número.`);
  }
  if (pue && laz && pue.decision !== laz.decision) {
    obs.push(
      laz.decision === "actuar"
        ? "Distingues el puente del lazo aunque en los dos la persona es el medio. Tal vez lo que pesa para ti es el contacto físico de empujar, no el hecho de usar a alguien. Thomson (1985) usó el lazo para cuestionar la doctrina del doble efecto."
        : "Empujarías en el puente pero no desviarías al lazo, aunque en ambos la persona es el medio y en el lazo no hay contacto físico. ¿Qué diferencia moral encuentras?",
    );
  }
  if (pal && tra && pal.decision === "actuar" && tra.decision === "no") {
    obs.push("Actuaste en la palanca y no en el trasplante, aunque la cuenta es la misma. En el hospital la persona es el medio y además confió en su médico: ahí coinciden la deontología, el doble efecto, la ética del cuidado y el utilitarismo de reglas.");
  }
  if (pal && tra && pal.decision === "actuar" && tra.decision === "actuar" && teoriaDe(tra) === "utilitarismo") {
    obs.push("Actuaste también en el trasplante con una razón utilitarista: eres consistente con el utilitarismo de actos. Considera la objeción del utilitarismo de reglas: ¿qué pasaría con la confianza en los hospitales?");
  }
  return obs;
}

/** Tendencia (no cifras) que reportan las encuestas sobre estos casos. */
export const TENDENCIA_ENCUESTAS =
  "En encuestas con miles de personas (por ejemplo, Hauser y colaboradores, 2007), la mayoría considera aceptable jalar la palanca y solo una minoría acepta empujar a la persona del puente, aunque la cuenta de vidas sea la misma. Muchos no saben explicar por qué cambian de opinión: la filosofía ayuda a hacer explícita esa razón.";

export const MORAL_MACHINE =
  "El experimento Moral Machine (Awad y colaboradores, Nature, 2018) reunió cerca de 40 millones de decisiones de personas de 233 países y territorios sobre dilemas de autos autónomos. Encontró preferencias muy extendidas —salvar a humanos antes que a animales, a más personas antes que a menos y a jóvenes antes que a mayores— y también variaciones entre grupos culturales de países. Describe lo que la gente prefiere; no demuestra qué es lo correcto.";

/* ════════════════════════════════════════════════════════════════════════
 * 2. DILEMAS DE LA VIDA COTIDIANA
 * ════════════════════════════════════════════════════════════════════════ */

export type CasoId = "examen" | "proyector" | "auto" | "agua";

export interface Afectado {
  id: string;
  etq: string;
  afectado: boolean;
  porque: string;
  /** Si aparece en la escena 3D. */
  enEscena: boolean;
}

export interface Enunciado {
  texto: string;
  tipo: "hecho" | "valor";
  porque: string;
}

export type TipoFicha = "hecho" | "principio" | "falacia" | "conclusion";

export interface Ficha {
  id: string;
  texto: string;
  tipo: TipoFicha;
  /** Principio: conclusión que sostiene y premisas con las que conecta. */
  lleva?: "A" | "B";
  premisas?: string[];
  teoria?: Teoria;
  falacia?: Falacia;
  /** Conclusión: postura A o B. */
  postura?: "A" | "B";
  explica?: string;
}

export interface CasoCotidiano {
  id: CasoId;
  etq: string;
  icono: string;
  situacion: string;
  afectados: Afectado[];
  enunciados: Enunciado[];
  fichas: Ficha[];
  /** Qué muestra la escena con cada conclusión. */
  escenaA: string;
  escenaB: string;
  nota?: string;
}

export const CASOS: CasoCotidiano[] = [
  {
    id: "examen",
    etq: "Copiar en el examen",
    icono: "fa-file-pen",
    situacion: "Durante el examen final de Matemáticas, tu mejor amigo te pide en voz baja que le pases tus respuestas. Si reprueba, pierde la beca que le ayuda a seguir estudiando.",
    afectados: [
      { id: "amigo", etq: "Tu amigo", afectado: true, porque: "Se juega la beca y también lo que aprende.", enEscena: true },
      { id: "tu", etq: "Tú", afectado: true, porque: "Te arriesgas a una sanción y pones a prueba tu honestidad.", enEscena: true },
      { id: "grupo", etq: "Tus compañeros que estudiaron", afectado: true, porque: "Si alguien copia, la evaluación deja de ser justa para ellos.", enEscena: true },
      { id: "profe", etq: "La profesora", afectado: true, porque: "Su evaluación deja de medir lo que cada quien aprendió.", enEscena: true },
      { id: "cafeteria", etq: "El personal de la cafetería", afectado: false, porque: "Lo que decidas en el examen no cambia en nada su situación.", enEscena: false },
    ],
    enunciados: [
      { texto: "Tu amigo perderá la beca si reprueba.", tipo: "hecho", porque: "Se puede comprobar en el reglamento de la beca." },
      { texto: "Copiar en un examen va contra el reglamento escolar.", tipo: "hecho", porque: "Describe lo que dice una norma escrita; se verifica leyéndola." },
      { texto: "La lealtad a un amigo es más importante que las reglas.", tipo: "valor", porque: "Jerarquiza valores: expresa lo que alguien considera más importante." },
      { texto: "Es injusto que alguien obtenga la calificación sin estudiar.", tipo: "valor", porque: "«Injusto» es un juicio moral, no algo que se mida." },
    ],
    fichas: [
      { id: "p1", texto: "Mi amigo perderá la beca si reprueba.", tipo: "hecho" },
      { id: "p2", texto: "El examen sirve para mostrar lo que cada quien aprendió.", tipo: "hecho" },
      { id: "r1", texto: "Debemos ayudar a quienes queremos cuando están en riesgo.", tipo: "principio", lleva: "A", premisas: ["p1"], teoria: "cuidado" },
      { id: "r2", texto: "Una evaluación es justa solo si cada quien muestra lo que sabe.", tipo: "principio", lleva: "B", premisas: ["p2"], teoria: "deontologia" },
      { id: "f1", texto: "Todos copian alguna vez, así que no pasa nada.", tipo: "falacia", falacia: "adPopulum", explica: "Que muchos lo hagan no lo vuelve correcto." },
      { id: "f2", texto: "Si le pasas una respuesta, copiará toda su vida y nunca aprenderá nada.", tipo: "falacia", falacia: "pendiente", explica: "Salta de un acto a consecuencias extremas sin mostrar por qué ocurrirían." },
      { id: "cA", texto: "Por lo tanto, le paso mis respuestas.", tipo: "conclusion", postura: "A" },
      { id: "cB", texto: "Por lo tanto, no se las paso y le ofrezco estudiar juntos para el extraordinario.", tipo: "conclusion", postura: "B" },
    ],
    escenaA: "La hoja con tus respuestas pasa al pupitre de tu amigo.",
    escenaB: "Tu hoja se queda contigo; después del examen le ofreces estudiar juntos.",
  },
  {
    id: "proyector",
    etq: "Denunciar a un compañero",
    icono: "fa-person-chalkboard",
    situacion: "Viste a un compañero romper por accidente el proyector del salón y no lo dijo. La dirección anuncia que, si nadie dice quién fue, todo el grupo pagará la reparación.",
    afectados: [
      { id: "companero", etq: "Tu compañero", afectado: true, porque: "Puede recibir una sanción o la oportunidad de responder por lo que pasó.", enEscena: true },
      { id: "grupo", etq: "El grupo", afectado: true, porque: "Pagaría por algo que no hizo.", enEscena: true },
      { id: "tu", etq: "Tú", afectado: true, porque: "Sabes lo que pasó: callar o hablar tiene consecuencias para ti.", enEscena: true },
      { id: "direccion", etq: "La directora", afectado: true, porque: "Debe decidir con justicia quién paga el daño.", enEscena: true },
      { id: "fabricante", etq: "La marca del proyector", afectado: false, porque: "Lo que decidas no cambia su situación.", enEscena: false },
    ],
    enunciados: [
      { texto: "Si nadie habla, todo el grupo pagará la reparación.", tipo: "hecho", porque: "Es lo que anunció la dirección: se puede verificar." },
      { texto: "El proyector se rompió por accidente.", tipo: "hecho", porque: "Describe lo que ocurrió; hay un testigo." },
      { texto: "Delatar a un compañero es traicionar al grupo.", tipo: "valor", porque: "Califica moralmente una acción; no describe algo observable." },
      { texto: "Cada quien debe responder por lo que hace.", tipo: "valor", porque: "Es un principio de lo que debería ser, no una descripción." },
    ],
    fichas: [
      { id: "p1", texto: "Todo el grupo pagará por algo que hizo una sola persona.", tipo: "hecho" },
      { id: "p2", texto: "El daño fue un accidente, no una travesura.", tipo: "hecho" },
      { id: "r1", texto: "Es injusto que muchos paguen por lo que hizo uno.", tipo: "principio", lleva: "A", premisas: ["p1"], teoria: "deontologia" },
      { id: "r2", texto: "Antes de acusar a alguien, hay que darle la oportunidad de responder por sí mismo.", tipo: "principio", lleva: "B", premisas: ["p1", "p2"], teoria: "virtudes" },
      { id: "f1", texto: "Ese compañero siempre ha sido un desastre; seguro lo hizo a propósito.", tipo: "falacia", falacia: "adHominem", explica: "Juzga a la persona por su fama en lugar de atender a los hechos." },
      { id: "f2", texto: "O lo delatas ahora mismo o eres su cómplice: no hay otra opción.", tipo: "falacia", falacia: "falsoDilema", explica: "Hay más opciones, por ejemplo hablar primero con él." },
      { id: "cA", texto: "Por lo tanto, le digo a la directora quién fue.", tipo: "conclusion", postura: "A" },
      { id: "cB", texto: "Por lo tanto, hablo primero con mi compañero para que él mismo lo diga.", tipo: "conclusion", postura: "B" },
    ],
    escenaA: "Caminas hacia la directora para contarle lo que viste.",
    escenaB: "Hablas con tu compañero y él mismo va con la directora.",
  },
  {
    id: "auto",
    etq: "El auto autónomo",
    icono: "fa-car-side",
    situacion: "Trabajas en el equipo que programa un auto autónomo. Si le fallan los frenos frente a un cruce, puede seguir de frente hacia tres peatones o desviarse contra un muro y poner en riesgo a su único pasajero.",
    afectados: [
      { id: "peatones", etq: "Los tres peatones", afectado: true, porque: "Están en la trayectoria si el auto sigue de frente.", enEscena: true },
      { id: "pasajero", etq: "El pasajero", afectado: true, porque: "Corre el riesgo si el auto se desvía.", enEscena: true },
      { id: "empresa", etq: "La empresa que fabrica el auto", afectado: true, porque: "Responde por las reglas que programó.", enEscena: false },
      { id: "compradores", etq: "Quienes comprarían el auto", afectado: true, porque: "Decidirán si confían en un auto que podría no protegerlos.", enEscena: false },
      { id: "ciclista", etq: "Un ciclista de otra ciudad", afectado: false, porque: "No está en el cruce ni depende de esta decisión.", enEscena: false },
    ],
    enunciados: [
      { texto: "Un auto autónomo sigue las reglas que alguien programó.", tipo: "hecho", porque: "Describe cómo funciona el sistema." },
      { texto: "El estudio Moral Machine encontró diferencias entre culturas en lo que la gente prefiere.", tipo: "hecho", porque: "Es un resultado publicado (Awad y colaboradores, Nature, 2018)." },
      { texto: "La vida del pasajero vale lo mismo que la de un peatón.", tipo: "valor", porque: "Afirma cuánto vale algo: es un juicio moral." },
      { texto: "Una máquina nunca debería decidir quién corre peligro.", tipo: "valor", porque: "Dice lo que debería ser, no lo que es." },
    ],
    fichas: [
      { id: "p1", texto: "Seguir de frente pone en riesgo a tres personas; desviarse, a una.", tipo: "hecho" },
      { id: "p2", texto: "El pasajero compró el auto confiando en que lo protegería.", tipo: "hecho" },
      { id: "r1", texto: "Hay que minimizar el número de personas dañadas.", tipo: "principio", lleva: "A", premisas: ["p1"], teoria: "utilitarismo" },
      { id: "r2", texto: "Quien ofrece un servicio debe cumplir lo que prometió a quien confía en él.", tipo: "principio", lleva: "B", premisas: ["p2"], teoria: "deontologia" },
      { id: "f1", texto: "Si la mayoría lo prefiere en una encuesta, entonces es lo correcto.", tipo: "falacia", falacia: "adPopulum", explica: "Una encuesta dice qué prefiere la gente, no qué es correcto." },
      { id: "f2", texto: "Si dejamos que los autos decidan esto, pronto las máquinas decidirán todo sobre nuestras vidas.", tipo: "falacia", falacia: "pendiente", explica: "Supone una cadena de consecuencias extremas sin pruebas." },
      { id: "cA", texto: "Por lo tanto, lo programo para desviarse contra el muro.", tipo: "conclusion", postura: "A" },
      { id: "cB", texto: "Por lo tanto, lo programo para proteger siempre a su pasajero.", tipo: "conclusion", postura: "B" },
    ],
    escenaA: "El auto se desvía y se detiene contra el muro: el riesgo pasa al pasajero.",
    escenaB: "El auto sigue de frente hacia el cruce: el riesgo es para los peatones.",
    nota: MORAL_MACHINE,
  },
  {
    id: "agua",
    etq: "Repartir el agua",
    icono: "fa-droplet",
    situacion: "A tu comunidad llega una sola pipa de agua a la semana y no alcanza para todos. La asamblea debe decidir cómo repartirla entre el centro de salud, la escuela y las familias.",
    afectados: [
      { id: "familias", etq: "Las familias", afectado: true, porque: "Necesitan agua para beber, cocinar y asearse.", enEscena: true },
      { id: "salud", etq: "El centro de salud y sus pacientes", afectado: true, porque: "Sin agua no puede atender con higiene.", enEscena: true },
      { id: "escuela", etq: "La escuela", afectado: true, porque: "Sin agua no hay sanitarios limpios ni clases seguras.", enEscena: true },
      { id: "asamblea", etq: "La asamblea comunitaria", afectado: true, porque: "Toma la decisión y responde ante todos.", enEscena: true },
      { id: "futbol", etq: "Un equipo de futbol de otro estado", afectado: false, porque: "No recibe agua de esta pipa.", enEscena: false },
    ],
    enunciados: [
      { texto: "La pipa trae menos agua de la que la comunidad usa en una semana.", tipo: "hecho", porque: "Se puede medir en litros." },
      { texto: "El centro de salud atiende a enfermos, bebés y personas mayores.", tipo: "hecho", porque: "Describe a quién atiende; se comprueba." },
      { texto: "Todos merecen exactamente la misma cantidad de agua.", tipo: "valor", porque: "Es un criterio de justicia: igualdad." },
      { texto: "Quienes más la necesitan deben recibirla primero.", tipo: "valor", porque: "Es otro criterio de justicia: necesidad." },
    ],
    fichas: [
      { id: "p1", texto: "Cada familia aporta la misma cooperación para pagar la pipa.", tipo: "hecho" },
      { id: "p2", texto: "El centro de salud atiende a enfermos, bebés y personas mayores.", tipo: "hecho" },
      { id: "r1", texto: "Si todos aportan por igual, todos deben recibir por igual.", tipo: "principio", lleva: "A", premisas: ["p1"], teoria: "deontologia" },
      { id: "r2", texto: "Primero hay que proteger a quienes son más vulnerables.", tipo: "principio", lleva: "B", premisas: ["p2"], teoria: "cuidado" },
      { id: "f1", texto: "Quien propone repartir por igual solo quiere más agua para su casa.", tipo: "falacia", falacia: "adHominem", explica: "Ataca los motivos de quien opina en lugar de su argumento." },
      { id: "f2", texto: "O le damos toda el agua al centro de salud o toda la comunidad se enfermará.", tipo: "falacia", falacia: "falsoDilema", explica: "Hay repartos intermedios; no son solo esas dos opciones." },
      { id: "cA", texto: "Por lo tanto, repartimos el agua en partes iguales.", tipo: "conclusion", postura: "A" },
      { id: "cB", texto: "Por lo tanto, damos prioridad al centro de salud y repartimos el resto.", tipo: "conclusion", postura: "B" },
    ],
    escenaA: "Los tres tinacos reciben la misma cantidad de agua.",
    escenaB: "El tinaco del centro de salud se llena primero; el resto se reparte entre escuela y familias.",
  },
];

export type Slot = "premisa" | "razon" | "conclusion";
export const SLOTS: { id: Slot; etq: string; ayuda: string }[] = [
  { id: "premisa", etq: "Premisa (un hecho)", ayuda: "Describe la situación: algo que se puede comprobar." },
  { id: "razon", etq: "Razón (un principio)", ayuda: "El valor o principio que justifica pasar del hecho a la conclusión." },
  { id: "conclusion", etq: "Conclusión", ayuda: "Lo que se debe hacer, según la premisa y la razón." },
];

export interface RevisionArgumento {
  ok: boolean;
  postura: "A" | "B" | null;
  mensajes: { slot: Slot; ok: boolean; txt: string }[];
}

const NOMBRE_TIPO: Record<TipoFicha, string> = { hecho: "un hecho", principio: "un principio", falacia: "una falacia", conclusion: "una conclusión" };

/** Revisa la estructura del argumento. Nunca juzga la postura: A y B pueden ser igual de válidas. */
export function revisarArgumento(caso: CasoCotidiano, sel: Record<Slot, string | null>): RevisionArgumento {
  const f = (id: string | null) => caso.fichas.find((x) => x.id === id) ?? null;
  const p = f(sel.premisa);
  const r = f(sel.razon);
  const c = f(sel.conclusion);
  const mensajes: RevisionArgumento["mensajes"] = [];
  let okP = false;
  if (!p) mensajes.push({ slot: "premisa", ok: false, txt: "Falta la premisa." });
  else if (p.tipo === "hecho") {
    okP = true;
    mensajes.push({ slot: "premisa", ok: true, txt: "Es un hecho: describe la situación y se puede comprobar." });
  } else if (p.tipo === "falacia") mensajes.push({ slot: "premisa", ok: false, txt: `Es una falacia (${FALACIA_DEF[p.falacia!].etq.toLowerCase()}): ${p.explica}` });
  else mensajes.push({ slot: "premisa", ok: false, txt: `Pusiste ${NOMBRE_TIPO[p.tipo]}, no un hecho. La premisa describe lo que pasa; no dice qué se debe hacer.` });

  let okR = false;
  if (!r) mensajes.push({ slot: "razon", ok: false, txt: "Falta la razón." });
  else if (r.tipo === "principio") {
    okR = !!p && p.tipo === "hecho" && !!r.premisas?.includes(p.id);
    mensajes.push(
      okR
        ? { slot: "razon", ok: true, txt: `Es un principio (${TEORIA_DEF[r.teoria!].etq.toLowerCase()}) y conecta con tu premisa.` }
        : { slot: "razon", ok: false, txt: p && p.tipo === "hecho" ? "Es un principio, pero no conecta con tu premisa: el hecho que elegiste no es el que esta razón necesita." : "Es un principio, pero necesita una premisa que sea un hecho." },
    );
  } else if (r.tipo === "falacia") mensajes.push({ slot: "razon", ok: false, txt: `Es una falacia (${FALACIA_DEF[r.falacia!].etq.toLowerCase()}): ${r.explica} No justifica nada.` });
  else if (r.tipo === "hecho") mensajes.push({ slot: "razon", ok: false, txt: "Es un hecho, no un principio: describe, pero no explica por qué se debería actuar de cierta forma." });
  else mensajes.push({ slot: "razon", ok: false, txt: "Es una conclusión, no una razón: falta el principio que la sostiene." });

  let okC = false;
  if (!c) mensajes.push({ slot: "conclusion", ok: false, txt: "Falta la conclusión." });
  else if (c.tipo !== "conclusion") mensajes.push({ slot: "conclusion", ok: false, txt: `Pusiste ${NOMBRE_TIPO[c.tipo]}: la conclusión dice qué hacer.` });
  else if (r && r.tipo === "principio") {
    okC = r.lleva === c.postura;
    mensajes.push(okC ? { slot: "conclusion", ok: true, txt: "Se sigue de tu razón." } : { slot: "conclusion", ok: false, txt: "No se sigue de tu razón: ese principio lleva a la otra conclusión. Cambia la razón o la conclusión." });
  } else mensajes.push({ slot: "conclusion", ok: false, txt: "Es una conclusión, pero sin un principio válido no se sostiene." });

  const ok = okP && okR && okC;
  return { ok, postura: ok ? (c!.postura ?? null) : null, mensajes };
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. BALANZA DE ARGUMENTOS (debate A3)
 * ════════════════════════════════════════════════════════════════════════ */

export type Clase = Teoria | "adHominem" | "pendiente" | "falsoDilema";
export const CLASES: Clase[] = ["utilitarismo", "deontologia", "virtudes", "cuidado", "adHominem", "pendiente", "falsoDilema"];

export function etiquetaClase(c: Clase): string {
  return c === "utilitarismo" || c === "deontologia" || c === "virtudes" || c === "cuidado" ? TEORIA_DEF[c].corto : FALACIA_DEF[c].etq;
}
export function esFalacia(c: Clase): boolean {
  return c === "adHominem" || c === "pendiente" || c === "falsoDilema";
}

export type Lado = "fines" | "limites";

export interface Intervencion {
  id: string;
  texto: string;
  clase: Clase;
  /** Lado de la balanza que apoya (las falacias no pesan). */
  lado: Lado;
  /** true si es verbatim de los argumentos guía de A3. */
  verbatim: boolean;
  hablante: number;
  explica: string;
}

export const HABLANTES = ["Ana", "Diego", "Lucía", "Mateo", "Ximena", "Emiliano"];

export const INTERVENCIONES: Intervencion[] = [
  { id: "c1", hablante: 0, lado: "fines", clase: "utilitarismo", verbatim: true, texto: "Si mentir salva muchas vidas inocentes, la mentira está moralmente justificada.", explica: "Juzga la mentira por su resultado: salvar vidas. Es consecuencialista." },
  { id: "d2", hablante: 1, lado: "limites", clase: "deontologia", verbatim: true, texto: "Kant: usar a una persona solo como medio para un fin viola su dignidad, que es inviolable.", explica: "Es la fórmula de la humanidad del imperativo categórico." },
  { id: "f1", hablante: 2, lado: "limites", clase: "adHominem", verbatim: false, texto: "Quienes dicen que el fin justifica los medios solo buscan excusas para hacer trampa; no vale la pena escucharlos.", explica: "Ataca los motivos de quienes defienden la postura, no su argumento." },
  { id: "c2", hablante: 3, lado: "fines", clase: "utilitarismo", verbatim: true, texto: "Juzgar las acciones sin considerar sus consecuencias puede llevar a resultados absurdamente dañinos.", explica: "Pide mirar las consecuencias: es consecuencialista." },
  { id: "d3", hablante: 4, lado: "limites", clase: "deontologia", verbatim: true, texto: "Los derechos humanos son deontológicos: existen independientemente de si respetarlos produce buenos resultados.", explica: "Los derechos valen por sí mismos, no por sus efectos: es deontológico." },
  { id: "k1", hablante: 5, lado: "fines", clase: "cuidado", verbatim: false, texto: "Si alguien que depende de ti corre peligro, cuidarlo puede exigir romper una regla, como mentir para protegerlo.", explica: "Pone por delante la relación concreta de cuidado con alguien vulnerable." },
  { id: "f2", hablante: 0, lado: "limites", clase: "pendiente", verbatim: false, texto: "Si hoy aceptas una mentira piadosa, mañana todos mentirán en todo y la sociedad se derrumbará.", explica: "Salta de un caso a una catástrofe sin mostrar cómo pasaría." },
  { id: "d4", hablante: 1, lado: "limites", clase: "deontologia", verbatim: true, texto: "La tortura de un inocente no puede justificarse aunque produzca información que salve vidas.", explica: "Pone un límite absoluto que ningún resultado puede cruzar." },
  { id: "c3", hablante: 2, lado: "fines", clase: "utilitarismo", verbatim: true, texto: "La historia muestra que muchas luchas por la justicia requirieron acciones que violaban reglas establecidas.", explica: "Justifica romper reglas por los buenos resultados. Para convencer, necesita ejemplos concretos." },
  { id: "v1", hablante: 3, lado: "limites", clase: "virtudes", verbatim: false, texto: "Una persona prudente sabe que un buen fin no vuelve bueno cualquier medio: el carácter se forja en cómo actúas, no solo en lo que logras.", explica: "Habla de prudencia y carácter: es ética de la virtud." },
  { id: "f3", hablante: 4, lado: "fines", clase: "falsoDilema", verbatim: false, texto: "O aceptas que el fin justifica los medios, o te quedas de brazos cruzados mientras otros sufren.", explica: "Hay más opciones: actuar dentro de ciertos límites, por ejemplo." },
  { id: "d1", hablante: 5, lado: "limites", clase: "deontologia", verbatim: true, texto: "Si cualquier medio puede justificarse con un fin suficientemente 'bueno', se abre la puerta a cualquier abuso.", explica: "Defiende límites morales. Cuidado: si no explica por qué se abriría la puerta a cualquier abuso, se acerca a una pendiente resbaladiza." },
  { id: "c4", hablante: 0, lado: "fines", clase: "utilitarismo", verbatim: true, texto: "La moral debe adaptarse al mundo real, no a principios abstractos desconectados de las consecuencias.", explica: "Pide juzgar por las consecuencias reales: es consecuencialista." },
  { id: "d5", hablante: 1, lado: "limites", clase: "deontologia", verbatim: true, texto: "Si aceptamos que los fines justifican los medios, destruimos la base misma de la moral.", explica: "Defiende que hay límites. Tal como está, afirma más de lo que demuestra: para ser sólido debe explicar por qué la moral se destruiría." },
];

export const LADO_DEF: Record<Lado, { etq: string; corto: string }> = {
  fines: { etq: "Los fines sí justifican los medios si el resultado es suficientemente bueno (postura consecuencialista)", corto: "Los fines sí justifican" },
  limites: { etq: "Los fines nunca justifican los medios: hay límites morales absolutos (postura deontológica)", corto: "Hay límites absolutos" },
};

/** Peso de cada lado: una unidad por argumento bien fundado ya clasificado. */
export function pesos(clasificados: string[]): Record<Lado, number> {
  const out: Record<Lado, number> = { fines: 0, limites: 0 };
  clasificados.forEach((id) => {
    const it = INTERVENCIONES.find((x) => x.id === id);
    if (it && !esFalacia(it.clase)) out[it.lado] += 1;
  });
  return out;
}

export function inclinacion(p: Record<Lado, number>): number {
  const total = p.fines + p.limites;
  if (total === 0) return 0;
  return ((p.limites - p.fines) / total) * 0.32;
}

export interface RevisionIntervencion {
  ok: boolean;
  txt: string;
}

/** Revisa la intervención del alumno para el debate (criterios de A3). */
export function revisarIntervencion(lado: Lado | null, propias: string[], refutada: string | null, refutacion: string): RevisionIntervencion {
  if (!lado) return { ok: false, txt: "Elige la postura que vas a defender." };
  const sel = propias.map((id) => INTERVENCIONES.find((x) => x.id === id)!).filter(Boolean);
  if (sel.length < 3) return { ok: false, txt: `Elige tres argumentos sólidos de tu postura (llevas ${sel.length}).` };
  const fal = sel.find((x) => esFalacia(x.clase));
  if (fal) return { ok: false, txt: `«${fal.texto}» es una falacia (${etiquetaClase(fal.clase).toLowerCase()}): no es un argumento sólido.` };
  const otro = sel.find((x) => x.lado !== lado);
  if (otro) return { ok: false, txt: `«${otro.texto}» apoya la postura contraria, no la tuya.` };
  const ref = INTERVENCIONES.find((x) => x.id === refutada);
  if (!ref) return { ok: false, txt: "Elige un argumento de la postura contraria para refutarlo." };
  if (ref.lado === lado || esFalacia(ref.clase)) return { ok: false, txt: "Para refutar, elige un argumento bien fundado de la postura contraria (refutar una falacia es fácil; el reto es responder al mejor argumento del otro lado)." };
  if (refutacion.trim().length < 40) return { ok: false, txt: "Escribe tu refutación con tus palabras (al menos una o dos oraciones)." };
  return { ok: true, txt: "Tu intervención cumple los criterios de A3: postura clara, tres argumentos sólidos y una refutación a la postura contraria." };
}

/* ════════════════════════════════════════════════════════════════════════
 * Estrellas: ¿qué teoría habla?
 * ════════════════════════════════════════════════════════════════════════ */

export const RAZONES_ESTRELLAS: { texto: string; teoria: Teoria; porque: string }[] = [
  { texto: "Conviene cerrar la calle para la feria si beneficia a más vecinos de los que perjudica.", teoria: "utilitarismo", porque: "Suma beneficios y perjuicios: decide por las consecuencias." },
  { texto: "Una mentira está bien si evita un sufrimiento mucho mayor.", teoria: "utilitarismo", porque: "Juzga la mentira por su resultado." },
  { texto: "Hay que donar a la organización que salve más vidas con cada peso.", teoria: "utilitarismo", porque: "Busca el mayor bien para el mayor número." },
  { texto: "Prometí guardar el secreto y debo cumplir, aunque romperlo me convenga.", teoria: "deontologia", porque: "Cumple un deber sin importar la conveniencia." },
  { texto: "No mentiría ni para quedar bien: no podría querer que todos mintieran.", teoria: "deontologia", porque: "Aplica la prueba de la ley universal de Kant." },
  { texto: "Cada persona merece respeto por ser persona, no por lo útil que sea.", teoria: "deontologia", porque: "Defiende la dignidad: nadie es solo un medio." },
  { texto: "Quiero ser alguien valiente y honesto, así que no me quedaré callado.", teoria: "virtudes", porque: "Parte del carácter que quiere formar." },
  { texto: "Entre la cobardía y la temeridad está la valentía: busco el término medio.", teoria: "virtudes", porque: "Es la virtud como término medio de Aristóteles." },
  { texto: "Ayudar en casa todos los días me va haciendo mejor persona.", teoria: "virtudes", porque: "La virtud es un hábito que se forma con la práctica." },
  { texto: "Mi abuela depende de mí; atenderla es mi responsabilidad antes que cualquier regla general.", teoria: "cuidado", porque: "Prioriza una relación concreta de cuidado." },
  { texto: "Antes de decidir, escucho qué necesita concretamente mi amiga.", teoria: "cuidado", porque: "Atiende a la persona concreta y a su necesidad." },
  { texto: "Los más vulnerables del grupo merecen atención especial porque dependen de nosotros.", teoria: "cuidado", porque: "Responde a la vulnerabilidad y la dependencia." },
];

/** Ronda equilibrada: dos razones de cada teoría, revueltas. */
export function rondaEstrellas(rnd: () => number): number[] {
  const idx: number[] = [];
  TEORIAS.forEach((t) => {
    const de = RAZONES_ESTRELLAS.map((r, i) => ({ r, i })).filter((x) => x.r.teoria === t).map((x) => x.i);
    idx.push(...baraja(de, rnd).slice(0, 2));
  });
  return baraja(idx, rnd);
}

export function estrellasPorErrores(errores: number): number {
  return errores === 0 ? 3 : errores <= 2 ? 2 : 1;
}

/* ════════════════════════════════════════════════════════════════════════
 * Contenido VERBATIM
 * ════════════════════════════════════════════════════════════════════════ */

export const TITULO_A1 = "Fundamentos éticos de la acción humana";

/** Lectura A1 — cinco párrafos, verbatim. */
export const LECTURA_A1: string[] = [
  "La ética es la rama de la filosofía que reflexiona sobre la moralidad: qué es bueno, qué debemos hacer y cómo debemos vivir. A lo largo de la historia, los filósofos han desarrollado distintas corrientes para responder estas preguntas fundamentales.",
  "La ética deontológica, representada por Immanuel Kant, sostiene que la moralidad se basa en deberes y principios racionales universales. Para Kant, una acción es moral si puede convertirse en ley universal para todos: \"Actúa solo según aquella máxima que puedas querer que se convierta en ley universal.\" El resultado de la acción no importa; lo que importa es si se actuó por deber y respeto a la ley moral.",
  "El consecuencialismo, en contraste, evalúa las acciones por sus consecuencias. El utilitarismo de John Stuart Mill propone que la acción moralmente correcta es la que produce la mayor felicidad para el mayor número de personas. Los fines y los resultados son lo que cuenta.",
  "La ética de la virtud, con raíces en Aristóteles, se centra no en las reglas ni en las consecuencias, sino en el carácter de la persona. Una acción es buena si la realiza una persona virtuosa, aquella que ha desarrollado hábitos como la valentía, la justicia y la prudencia. La meta es la eudaimonía: la vida buena y floreciente.",
  "Finalmente, la ética del cuidado, desarrollada por Carol Gilligan y Nel Noddings, surge como crítica a las éticas centradas en principios abstractos y universales. Propone que la moralidad se funda en relaciones concretas de cuidado y responsabilidad hacia los demás, especialmente los vulnerables.",
];

/** Recuadro «importante» de la lectura A1 — verbatim. */
export const RECUADRO_A1 =
  "El 'dilema del tranvía', planteado por la filósofa Philippa Foot en 1967, es un experimento mental clásico de la ética: ¿es lícito desviar un tranvía para que mate a una persona en lugar de cinco? Confronta de manera directa la ética deontológica (no usar a nadie como simple medio) con el consecuencialismo (minimizar el daño total), y por eso se usa para introducir las grandes corrientes éticas.";

/** Precisión del laboratorio (no verbatim) sobre el recuadro. */
export const NOTA_RECUADRO =
  "Precisión del laboratorio: en el caso de desviar, la persona de la vía lateral no es usada como medio, y por eso muchos kantianos lo permiten. El choque con el principio de «no usar a nadie como simple medio» aparece con más claridad en las variantes de Thomson (el puente, el lazo y el trasplante).";

/** Preguntas de comprensión de la lectura A1 — verbatim. */
export const PREGUNTAS: string[] = [
  "¿Qué criterio usa la ética kantiana para determinar si una acción es moral?",
  "¿En qué se diferencia el consecuencialismo del deontologismo?",
  "¿Qué crítica le hace la ética del cuidado a las éticas de principios universales?",
];

/** Preguntas de reflexión de A5, A7 y A8 — verbatim. */
export const REFLEXION: { ancla: string; texto: string }[] = [
  { ancla: "A5", texto: "Describe un dilema moral de la vida cotidiana y qué valores entran en conflicto en él." },
  { ancla: "A7", texto: "¿Qué valor (justicia, libertad o igualdad) te parece más urgente en tu entorno y por qué?" },
  { ancla: "A8", texto: "¿Qué dilema moral has enfrentado o conoces en tu vida cotidiana?" },
];

/** Hechos: quiz A4 (verdadero/falso), cada enunciado con su retroalimentación. */
export const HECHOS: string[] = [
  "Verdadero: «La Ética reflexiona de forma crítica sobre los fundamentos de la moral y la conducta». Correcto: la Ética piensa el porqué de lo que consideramos bueno.",
  "Falso: «Moral y Ética son exactamente lo mismo y no se pueden distinguir». La moral son las normas vividas; la Ética las reflexiona y fundamenta.",
  "Verdadero: «La Justicia, la Libertad y la Igualdad son valores centrales de la reflexión ética y política». Correcto: orientan la convivencia y las decisiones públicas.",
  "Falso: «Un dilema moral es una situación con una única respuesta evidente y sin conflicto de valores». Un dilema moral enfrenta valores o deberes que entran en conflicto.",
];

/** Glosario A5 — verbatim. */
export const GLOSARIO: { termino: string; definicion: string; ejemplo: string }[] = [
  { termino: "Ética", definicion: "Reflexión filosófica y crítica sobre los fundamentos de la moral y la buena conducta.", ejemplo: "Preguntar por qué algo es justo o injusto." },
  { termino: "Moral", definicion: "Conjunto de normas, valores y costumbres que orientan la conducta en una comunidad.", ejemplo: "Las normas de honestidad aprendidas en casa." },
  { termino: "Justicia", definicion: "Valor que busca dar a cada quien lo que le corresponde y un trato equitativo.", ejemplo: "Repartir cargas y beneficios de forma equitativa." },
  { termino: "Libertad", definicion: "Capacidad de decidir y actuar de forma responsable, asumiendo sus consecuencias.", ejemplo: "Elegir con base en razones propias." },
  { termino: "Dilema moral", definicion: "Situación en la que valores o deberes entran en conflicto y obligan a decidir.", ejemplo: "Decir la verdad aunque dañe a alguien." },
];

/** Debate A3 — verbatim. */
export const DEBATE_A3 = {
  tema: "¿Los fines justifican los medios? Un debate entre ética consecuencialista y deontológica",
  reglas: [
    "Argumenta desde la corriente ética asignada, usando sus conceptos clave",
    "Apoya con ejemplos concretos, históricos o filosóficos",
    "Responde al menos un argumento de la postura contraria",
  ],
  criterios: [
    "Argumenta coherentemente desde la corriente ética asignada",
    "Usa conceptos filosóficos precisos (consecuencias/utilidad o deber/imperativo categórico)",
    "Presenta al menos 3 argumentos sólidos",
    "Refuta al menos un argumento de la postura contraria",
  ],
};

export const FUENTE =
  "CEN Bachillerato — PFH-II, progresión 2: lectura A1 (Material elaborado para CEN Bachillerato), quiz A2, debate A3, quiz A4, glosario A5, actividad A6, autoevaluación A7 y video A8.";

export const PROBLEMA =
  "¿Cómo decidir cuando dos valores chocan y cualquier opción tiene un costo? En este laboratorio no hay una respuesta moral correcta que adivinar: decides en el dilema del tranvía y sus variantes, construyes argumentos en dilemas de tu vida cotidiana y pesas razones en un debate. Lo que se evalúa es la calidad de tu razonamiento: coherencia, teorías, hechos y valores, y falacias.";

export const INSTRUCCIONES: string[] = [
  "En El tranvía, elige una variante, decide, escoge la razón que de verdad te guía y confirma: la escena muestra el resultado y el panel, cómo razonaría cada teoría. Decide las cuatro y revisa tu consistencia.",
  "Mueve el número de personas en la vía y observa qué teorías cambian su veredicto y cuáles no.",
  "En Dilemas cotidianos, marca a los afectados, separa hechos de valores y arma un argumento con fichas: premisa, razón y conclusión.",
  "En la Balanza, clasifica cada intervención por teoría o falacia y arma tu propia intervención para el debate A3.",
  "Clasifica razones en «¿Qué teoría habla?» para ganar estrellas y resuelve el quiz A2 y el texto A6.",
];

export const IDEAS: string[] = [
  "Un dilema moral no se resuelve adivinando la respuesta: se razona y se justifica.",
  "El utilitarismo mira las consecuencias; la deontología, los deberes y la dignidad; la virtud, el carácter; el cuidado, las relaciones concretas.",
  "Prever un daño no es lo mismo que usar a alguien como medio: esa diferencia explica por qué muchas personas cambian de decisión entre la palanca y el puente.",
  "Un buen argumento une un hecho y un principio para llegar a una conclusión que se sigue de ellos.",
  "Los hechos se comprueban; los valores se argumentan. Confundirlos empobrece el debate.",
  "Una falacia puede sonar convincente, pero no aporta razones: detectarla mejora cualquier discusión.",
];

/** Quiz A2 «Corrientes éticas: ¿quién tiene razón?» — verbatim. */
export const QUIZ_A2: QuizEvaluable = {
  titulo: "Corrientes éticas: ¿quién tiene razón?",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "¿Qué caracteriza a la ética deontológica de Kant?",
      opciones: [
        "Las acciones son buenas si producen la mayor felicidad",
        "Las acciones son buenas si el agente tiene buen carácter",
        "Las acciones son buenas si cumplen con un deber moral universal, independientemente del resultado",
        "Las acciones son buenas si responden al cuidado concreto de otros",
      ],
      respuestaCorrecta: 2,
      retroalimentacion: "La ética kantiana se basa en el deber y la ley moral universal, no en las consecuencias.",
    },
    {
      enunciado: "El principio de utilidad en el utilitarismo de Mill establece que:",
      opciones: [
        "Hay que respetar los derechos individuales por encima de todo",
        "Se debe actuar para producir la mayor felicidad para el mayor número de personas",
        "La virtud es el hábito adquirido mediante la práctica reiterada",
        "La moral se funda en relaciones concretas de cuidado interpersonal",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "El utilitarismo evalúa las acciones por su resultado: producir la máxima utilidad o bienestar colectivo.",
    },
    {
      enunciado: "La ética de la virtud pregunta principalmente:",
      opciones: ["¿Qué debo hacer en esta situación específica?", "¿Qué resultados produce mi acción?", "¿Qué tipo de persona debo ser?", "¿Qué reglas debo seguir siempre?"],
      respuestaCorrecta: 2,
      retroalimentacion: "La ética de la virtud (Aristóteles) se centra en el carácter del agente y en cultivar virtudes para vivir bien.",
    },
    {
      enunciado: "¿Cuál es la crítica principal de la ética del cuidado a las éticas universalistas?",
      opciones: ["Que no tienen reglas claras", "Que ignoran las relaciones concretas y las responsabilidades hacia personas específicas", "Que promueven el individualismo extremo", "Que no sirven para resolver dilemas prácticos"],
      respuestaCorrecta: 1,
      retroalimentacion: "La ética del cuidado (Gilligan) critica que los principios abstractos y universales invisibilizan las relaciones y el cuidado concreto.",
    },
    {
      enunciado: "En un dilema donde mentir salvaría muchas vidas, ¿qué diría Kant?",
      opciones: ["Miente porque el resultado es bueno", "Miente si cuidas a las personas afectadas", "No mientes, porque mentir viola el imperativo categórico universal", "Depende de la virtud del agente"],
      respuestaCorrecta: 2,
      retroalimentacion: "Para Kant, el deber de no mentir es una ley moral universal; violarla no puede justificarse por las consecuencias.",
    },
  ],
};

/** Actividad A6 «Completa: fundamentos éticos» — verbatim. */
export const HUECOS_A6: TextoHuecosData = {
  ancla: "PFH-II-P02-A6 · Completa: fundamentos éticos",
  instrucciones: "Completa con la palabra correcta.",
  partes: [
    "La ",
    " reflexiona críticamente sobre los fundamentos de la conducta, mientras que la ",
    " son las normas y costumbres vividas en comunidad. La ",
    " busca dar a cada quien lo que le corresponde. Cuando valores o deberes entran en conflicto se presenta un ",
    " moral.",
  ],
  huecos: [
    { respuesta: "ética", alternativas: ["etica"], pista: "Reflexión crítica sobre la conducta." },
    { respuesta: "moral", alternativas: [], pista: "Normas y costumbres vividas." },
    { respuesta: "justicia", alternativas: [], pista: "Dar a cada quien lo suyo." },
    { respuesta: "dilema", alternativas: [], pista: "Conflicto de valores o deberes." },
  ],
};
