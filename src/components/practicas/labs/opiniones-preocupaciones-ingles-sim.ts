/**
 * Modelo del SIMULADOR del lab «opiniones-preocupaciones-ingles» (IN-V-P04).
 *
 * TODO es ficticio: el «Foro Ciudadano de Bahía Serena», sus seis integrantes,
 * los tres planes, los oradores y las cifras de los expedientes (simulación).
 *
 * 1. «Town hall». El foro revisa tres planes de la región. El alumno lee el
 *    expediente del caso y arma una intervención en inglés con cinco piezas:
 *      respuesta al orador anterior · preocupación (I'm worried/concerned
 *      about…) · FUERZA de la afirmación (might / could / will) · evidencia ·
 *      propuesta (In conclusion, we should…).
 *    La idea que se descubre: la fuerza de lo que afirmas debe corresponder al
 *    peso de lo que pruebas (A3: will > should > could > might). La balanza de
 *    la escena compara las dos cosas.
 *      peso de la evidencia: estudio/medición 3 · registro o encuesta 2 ·
 *        ejemplo personal 1 · rumor o nada 0 (si habla de OTRA preocupación,
 *        cuenta 0 y además resta).
 *      nivel ideal = max(1, peso)       (might = 1, could = 2, will = 3)
 *      exceso = nivel − ideal (si > 0) · timidez = ideal − nivel (si > 0)
 *    Tres medidores 0–100:
 *      credibilidad = 40 + 15·peso − 25·exceso − 20·(otra preocupación) − 10·(propuesta extrema)
 *      respeto      = 60 + respuesta (cortés +30 · nada 0 · grosera −45)
 *                        + propuesta (concreta +10 · vaga 0 · extrema −25)
 *      claridad     = 20 + preocupación (bien 25 · gramática rota 0)
 *                        + propuesta (concreta y de tu preocupación 30 · concreta de otra 10 · extrema 20 · vaga 5)
 *                        + 15 si hay evidencia + 10 si respondes con cortesía − 12·timidez
 *    Seis integrantes votan, dos por medidor (umbral estricto 80, flexible 65).
 *    El plan CAMBIA con 5 votos o más y una propuesta concreta que resuelva tu
 *    preocupación. Determinista: misma intervención, mismo resultado.
 * 2. «Both sides». La columna de Ximena (ficticia) sobre una granja solar. El
 *    alumno elige el conector de cada oración; la oración cae en el mapa del
 *    argumento («a favor» / «preocupaciones»). Un conector del lado equivocado
 *    la deja en la columna contraria (contradicción) y le cuesta 2 lectores;
 *    uno de contraste mal construido (despite + oración) le cuesta 1.
 */

export type CasoId = "bahia" | "valle" | "clinica";
export type Nivel = 1 | 2 | 3;
export type Medidor = "cred" | "resp" | "clar";
export type TipoEvidencia = "estudio" | "registro" | "encuesta" | "ejemplo" | "rumor";
export type AperturaId = "point" | "good" | "nonsense" | "none";
export type TipoPropuesta = "concreta" | "extrema" | "vaga";

/* ── Fuerza de la afirmación (A1 y A3) ──────────────────────────────────── */

export const NIVELES: Record<Nivel, { modal: string; marco: string; es: string }> = {
  1: { modal: "might", marco: "I'm not sure, but this plan might", es: "posibilidad baja o incierta" },
  2: { modal: "could", marco: "I believe this plan could", es: "posibilidad" },
  3: { modal: "will", marco: "I strongly believe this plan will", es: "certeza alta" },
};

export const TIPOS_EVIDENCIA: Record<TipoEvidencia, { peso: number; en: string; es: string; icono: string }> = {
  estudio: { peso: 3, en: "Study / measurement", es: "Estudio o medición", icono: "fa-flask-vial" },
  registro: { peso: 2, en: "Official records", es: "Registro o documento", icono: "fa-folder-open" },
  encuesta: { peso: 2, en: "Survey", es: "Encuesta", icono: "fa-square-poll-vertical" },
  ejemplo: { peso: 1, en: "Personal example", es: "Ejemplo personal", icono: "fa-user" },
  rumor: { peso: 0, en: "Rumor", es: "Rumor", icono: "fa-comment-dots" },
};

/* ── Respuesta al orador anterior (A4 y A5) ─────────────────────────────── */

export const APERTURAS: { id: AperturaId; texto: string; tono: "cortes" | "grosera" | "nada"; porque: string }[] = [
  { id: "point", texto: "I see your point, but", tono: "cortes", porque: "«I see your point, but…» reconoce la idea del otro antes de dar la tuya (A4, A5)." },
  { id: "good", texto: "That's a good point. However,", tono: "cortes", porque: "«That's a good point. However,…» acepta lo bueno de la otra postura y luego marca el contraste (A5)." },
  { id: "nonsense", texto: "That makes no sense.", tono: "grosera", porque: "«That makes no sense» descalifica la idea del otro sin escucharla: quien la dijo y quienes la apoyan dejan de oírte." },
  { id: "none", texto: "", tono: "nada", porque: "Sin responder al orador anterior parece que no lo escuchaste: tu intervención no dialoga con la suya." },
];

/* ── Casos ──────────────────────────────────────────────────────────────── */

export interface Preocupacion {
  id: string;
  /** La oración de preocupación, en inglés. */
  texto: string;
  /** Qué te preocupa, en español. */
  es: string;
  /** Lo que el plan provocaría (verbo base), para la frase con modal. */
  consecuencia: string;
}

export interface Evidencia {
  id: string;
  texto: string;
  tipo: TipoEvidencia;
  /** Preocupación que apoya; null = no apoya ninguna (rumor). */
  sobre: string | null;
}

export interface Propuesta {
  id: string;
  texto: string;
  tipo: TipoPropuesta;
  /** Preocupación que resuelve (solo las concretas). */
  para?: string;
}

export interface Caso {
  id: CasoId;
  lugar: string;
  icono: string;
  /** El plan que revisa el foro, en inglés y en español. */
  plan: string;
  planEs: string;
  orador: { nombre: string; rol: string; dice: string; diceEs: string };
  preocupaciones: Preocupacion[];
  /** Preocupación con la regla rota (worried/concerned about + verbo base). */
  trampa: { texto: string; de: string; porque: string };
  evidencias: Evidencia[];
  propuestas: Propuesta[];
}

export const CASOS: Caso[] = [
  {
    id: "bahia",
    lugar: "Puerto Calma",
    icono: "fa-ship",
    plan: "Plan: allow three cruise ships a week at a new pier in Puerto Calma.",
    planEs: "Permitir tres cruceros por semana en un muelle nuevo de Puerto Calma, un pueblo de pescadores.",
    orador: {
      nombre: "Ernesto Valdivia",
      rol: "hotel owner",
      dice: "Cruise ships will bring money and jobs to Puerto Calma. We need them!",
      diceEs: "Los cruceros traerán dinero y empleos a Puerto Calma. ¡Los necesitamos!",
    },
    preocupaciones: [
      { id: "agua", texto: "I'm worried about the water quality in the bay.", es: "la calidad del agua de la bahía", consecuencia: "pollute the water where our families fish" },
      { id: "renta", texto: "I'm concerned about rising rents for local families.", es: "las rentas que suben para las familias del pueblo", consecuencia: "push rents up for local families" },
    ],
    trampa: {
      texto: "I'm worried about lose the clean water in our bay.",
      de: "agua",
      porque: "Después de «worried about» va un sustantivo o un gerundio (-ing): «I'm worried about losing…», nunca el verbo base «lose» (A4, A5).",
    },
    evidencias: [
      { id: "b1", texto: "According to the Puerto Calma Coastal Lab, oil in the bay doubled during last year's three test visits.", tipo: "estudio", sobre: "agua" },
      { id: "b2", texto: "For example, last summer I saw oil on the sand near the old dock.", tipo: "ejemplo", sobre: "agua" },
      { id: "b3", texto: "According to a town survey of 300 families, 6 out of 10 said their rent went up after the pier was announced.", tipo: "encuesta", sobre: "renta" },
      { id: "b4", texto: "For example, my neighbor had to move to another town because of her rent.", tipo: "ejemplo", sobre: "renta" },
      { id: "b5", texto: "My cousin says the ships are going to destroy everything.", tipo: "rumor", sobre: null },
    ],
    propuestas: [
      { id: "pa", texto: "In conclusion, we should allow only one ship a week and test the water every month.", tipo: "concreta", para: "agua" },
      { id: "pr", texto: "In conclusion, we should limit vacation rentals so local families can stay.", tipo: "concreta", para: "renta" },
      { id: "px", texto: "In conclusion, we must ban all tourists from Puerto Calma forever.", tipo: "extrema" },
      { id: "pv", texto: "In conclusion, somebody should do something about it.", tipo: "vaga" },
    ],
  },
  {
    id: "valle",
    lugar: "Valle Ocotal",
    icono: "fa-wheat-awn",
    plan: "Plan: spray a strong pesticide from drones over every field in Valle Ocotal, even the milpas next to the river.",
    planEs: "Fumigar con drones un plaguicida fuerte sobre todos los campos de Valle Ocotal, incluso las milpas junto al río.",
    orador: {
      nombre: "Ing. Rodolfo Paz",
      rol: "pesticide supplier",
      dice: "This pesticide will save the harvest. There is no risk at all.",
      diceEs: "Este plaguicida salvará la cosecha. No hay ningún riesgo.",
    },
    preocupaciones: [
      { id: "rio", texto: "I'm worried about the river water that many families drink.", es: "el agua del río que beben muchas familias", consecuencia: "contaminate the river water that families drink" },
      { id: "abejas", texto: "I'm concerned about the bees that pollinate our squash.", es: "las abejas que polinizan la calabaza de la milpa", consecuencia: "kill the bees that pollinate the squash in our milpas" },
    ],
    trampa: {
      texto: "I'm concerned about lose our bees.",
      de: "abejas",
      porque: "«Concerned about» pide un sustantivo o un gerundio: «I'm concerned about losing our bees», no «about lose» (A4, A5).",
    },
    evidencias: [
      { id: "v1", texto: "According to the health center's records, stomach infections went up 30% during the last spraying season.", tipo: "registro", sobre: "rio" },
      { id: "v2", texto: "For example, last spring I saw dead fish under the bridge.", tipo: "ejemplo", sobre: "rio" },
      { id: "v3", texto: "Studies by the Valle Ocotal Farming Institute show that this pesticide kills 8 out of 10 bees that touch it.", tipo: "estudio", sobre: "abejas" },
      { id: "v4", texto: "For example, this year my uncle's squash plants had very few bees.", tipo: "ejemplo", sobre: "abejas" },
      { id: "v5", texto: "Everybody knows that drones are dangerous.", tipo: "rumor", sobre: null },
    ],
    propuestas: [
      { id: "pa", texto: "In conclusion, we should keep a 100-meter safe zone around the river and test the water.", tipo: "concreta", para: "rio" },
      { id: "pr", texto: "In conclusion, we should spray only at night, when bees don't fly, and try natural pest control.", tipo: "concreta", para: "abejas" },
      { id: "px", texto: "In conclusion, we must stop all farming in Valle Ocotal.", tipo: "extrema" },
      { id: "pv", texto: "In conclusion, someone should think about it.", tipo: "vaga" },
    ],
  },
  {
    id: "clinica",
    lugar: "Clínica Las Lomas",
    icono: "fa-house-medical",
    plan: "Plan: use an AI app to decide which patients see a doctor first, with no nurse checking its decisions.",
    planEs: "Usar una aplicación de inteligencia artificial que decida qué pacientes pasan primero con el médico, sin que una enfermera revise sus decisiones.",
    orador: {
      nombre: "Lic. Mariana Robles",
      rol: "clinic administrator",
      dice: "The AI app will make the waiting room faster for everybody.",
      diceEs: "La aplicación de IA hará más rápida la sala de espera para todos.",
    },
    preocupaciones: [
      { id: "errores", texto: "I'm worried about the app's mistakes with older patients.", es: "los errores de la aplicación con pacientes mayores", consecuencia: "send very sick older patients to the end of the line" },
      { id: "datos", texto: "I'm concerned about the privacy of our medical records.", es: "la privacidad de los expedientes médicos", consecuencia: "share our medical records without our permission" },
    ],
    trampa: {
      texto: "I'm worried about the app make mistakes with older patients.",
      de: "errores",
      porque: "Después de «worried about» va un sustantivo o un gerundio: «I'm worried about the app making mistakes…», no «the app make» (A4, A5).",
    },
    evidencias: [
      { id: "c1", texto: "According to the clinic's two-week pilot test, the app ranked 1 in 5 patients over 70 lower than a nurse did.", tipo: "estudio", sobre: "errores" },
      { id: "c2", texto: "For example, on the test day the app told my aunt to wait, and she had a high fever.", tipo: "ejemplo", sobre: "errores" },
      { id: "c3", texto: "According to the app's contract, the company can store our records on servers in other countries.", tipo: "registro", sobre: "datos" },
      { id: "c4", texto: "For example, my brother got ads for diabetes medicine right after his visit.", tipo: "ejemplo", sobre: "datos" },
      { id: "c5", texto: "People on social media say AI apps steal everything.", tipo: "rumor", sobre: null },
    ],
    propuestas: [
      { id: "pa", texto: "In conclusion, we should have a nurse check every patient the app sends to the end of the line.", tipo: "concreta", para: "errores" },
      { id: "pr", texto: "In conclusion, we should ask every patient for permission before the app saves their data.", tipo: "concreta", para: "datos" },
      { id: "px", texto: "In conclusion, we must never use technology in the clinic.", tipo: "extrema" },
      { id: "pv", texto: "In conclusion, the clinic should be more careful.", tipo: "vaga" },
    ],
  },
];

export const CASO: Record<CasoId, Caso> = Object.fromEntries(CASOS.map((c) => [c.id, c])) as Record<CasoId, Caso>;

/** Clave de la preocupación con la regla rota en el selector. */
export const TRAMPA = "trampa";
/** Clave de «sin evidencia» en el selector. */
export const SIN_EVIDENCIA = "ninguna";

/**
 * Las opciones de preocupación de un caso, en orden fijo por caso (la trampa
 * no siempre al final).
 */
export function opcionesPreocupacion(c: Caso): { id: string; texto: string }[] {
  const lista = [...c.preocupaciones.map((p) => ({ id: p.id, texto: p.texto })), { id: TRAMPA, texto: c.trampa.texto }];
  const giro = CASOS.findIndex((x) => x.id === c.id) % lista.length;
  return [...lista.slice(giro), ...lista.slice(0, giro)];
}

/* ── Foro ───────────────────────────────────────────────────────────────── */

export interface Miembro {
  id: string;
  nombre: string;
  rol: string;
  icono: string;
  medidor: Medidor;
  umbral: number;
  /** Lo que dice cuando vota a favor. */
  si: string;
}

export const FORO: Miembro[] = [
  { id: "carrillo", nombre: "Dra. Inés Carrillo", rol: "university researcher", icono: "fa-microscope", medidor: "cred", umbral: 80, si: "Your data is solid and you didn't exaggerate. I vote to change the plan." },
  { id: "ochoa", nombre: "Prof. Manuel Ochoa", rol: "high school teacher", icono: "fa-chalkboard-user", medidor: "cred", umbral: 65, si: "You backed up your concern. You have my vote." },
  { id: "torres", nombre: "Doña Guadalupe Torres", rol: "neighbor for 40 years", icono: "fa-person-cane", medidor: "resp", umbral: 80, si: "You listened before you disagreed. I'm with you." },
  { id: "ruiz", nombre: "Daniela Ruiz", rol: "youth representative", icono: "fa-user-graduate", medidor: "resp", umbral: 65, si: "Respectful and fair. I vote yes." },
  { id: "cuevas", nombre: "Armando Cuevas", rol: "council member", icono: "fa-landmark", medidor: "clar", umbral: 80, si: "Clear concern, clear proposal. I vote yes." },
  { id: "luna", nombre: "Teresa Luna", rol: "community radio reporter", icono: "fa-microphone", medidor: "clar", umbral: 65, si: "I understood every part. I vote yes." },
];

export const MEDIDORES: Record<Medidor, { en: string; es: string; icono: string }> = {
  cred: { en: "Credibility", es: "Credibilidad", icono: "fa-scale-balanced" },
  resp: { en: "Respect", es: "Respeto", icono: "fa-handshake" },
  clar: { en: "Clarity", es: "Claridad", icono: "fa-lightbulb" },
};

export const VOTOS_PARA_CAMBIAR = 5;

/* ── Evaluación ─────────────────────────────────────────────────────────── */

export interface Intervencion {
  apertura?: AperturaId;
  preocupacion?: string;
  nivel: Nivel;
  evidencia?: string;
  propuesta?: string;
}

export interface Problema {
  id: string;
  medidor: Medidor;
  /** Lo que dice un integrante del foro, en inglés. */
  dice: string;
  /** Por qué, en español. */
  porque: string;
}

export interface Voto {
  miembro: Miembro;
  valor: number;
  aFavor: boolean;
  dice: string;
  porque: string;
}

export type Zona = "aprobado" | "pendiente" | "cambiado";

export interface Resultado {
  cred: number;
  resp: number;
  clar: number;
  /** Peso de la evidencia que sí apoya tu preocupación (0–3). */
  peso: number;
  ideal: Nivel;
  exceso: number;
  timidez: number;
  problemas: Problema[];
  votos: Voto[];
  aFavor: number;
  zona: Zona;
}

const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));

/** ¿Están las cinco piezas? */
export function intervencionCompleta(i: Intervencion): boolean {
  return i.apertura !== undefined && i.preocupacion !== undefined && i.evidencia !== undefined && i.propuesta !== undefined;
}

export function evaluar(c: Caso, i: Intervencion): Resultado {
  const apertura = APERTURAS.find((a) => a.id === i.apertura) ?? APERTURAS[3]!;
  const esTrampa = i.preocupacion === TRAMPA;
  const preoId = esTrampa ? c.trampa.de : i.preocupacion;
  const preo = c.preocupaciones.find((p) => p.id === preoId);
  const ev = c.evidencias.find((e) => e.id === i.evidencia) ?? null;
  const prop = c.propuestas.find((p) => p.id === i.propuesta) ?? null;

  const otraPreocupacion = ev !== null && ev.sobre !== null && ev.sobre !== preoId;
  const peso = ev && !otraPreocupacion ? TIPOS_EVIDENCIA[ev.tipo].peso : 0;
  const ideal = Math.max(1, peso) as Nivel;
  const exceso = Math.max(0, i.nivel - ideal);
  const timidez = Math.max(0, ideal - i.nivel);
  const extrema = prop?.tipo === "extrema";
  const concretaPropia = prop?.tipo === "concreta" && prop.para === preoId;

  const cred = clamp(40 + 15 * peso - 25 * exceso - (otraPreocupacion ? 20 : 0) - (extrema ? 10 : 0));
  const resp = clamp(
    60 +
      (apertura.tono === "cortes" ? 30 : apertura.tono === "grosera" ? -45 : 0) +
      (prop?.tipo === "concreta" ? 10 : extrema ? -25 : 0)
  );
  const clar = clamp(
    20 +
      (esTrampa ? 0 : 25) +
      (concretaPropia ? 30 : prop?.tipo === "concreta" ? 10 : extrema ? 20 : prop?.tipo === "vaga" ? 5 : 0) +
      (ev ? 15 : 0) +
      (apertura.tono === "cortes" ? 10 : 0) -
      12 * timidez
  );

  /* Diagnóstico: cada problema dice qué medidor bajó y por qué. */
  const problemas: Problema[] = [];
  const modal = NIVELES[i.nivel].modal;
  if (exceso > 0) {
    const tipoEs = ev ? TIPOS_EVIDENCIA[ev.tipo].es.toLowerCase() : "ninguna";
    problemas.push({
      id: "exceso",
      medidor: "cred",
      dice: `You say it ${modal} happen, but your evidence doesn't prove that much.`,
      porque: `Afirmaste con «${modal}» (${NIVELES[i.nivel].es}), pero tu evidencia es ${otraPreocupacion ? "de otro tema" : tipoEs}. Lo que afirmas pesa más que lo que pruebas: con esa evidencia lo honesto es «${NIVELES[ideal].modal}». Escala de A3: will > should > could > might.`,
    });
  }
  if (!ev) {
    problemas.push({
      id: "sin",
      medidor: "cred",
      dice: "Where is your evidence? That's just your opinion.",
      porque: "No diste evidencia. Según A1, una opinión convincente lleva opinión + EVIDENCIA + conclusión: «According to…», «Studies show that…», «For example,…».",
    });
  } else if (ev.tipo === "rumor") {
    problemas.push({
      id: "rumor",
      medidor: "cred",
      dice: "That's a rumor, not evidence.",
      porque: "Un rumor («My cousin says…», «Everybody knows…») no se puede verificar: no tiene fuente ni datos. «According to [source]» señala que lo que sigue viene de datos, no de lo que se dice (A3).",
    });
  } else if (otraPreocupacion) {
    const de = c.preocupaciones.find((p) => p.id === ev.sobre);
    problemas.push({
      id: "otra",
      medidor: "cred",
      dice: "Your evidence is about something else.",
      porque: `Tu evidencia habla de ${de?.es ?? "otro tema"}, y lo que te preocupa es ${preo?.es ?? "otra cosa"}. Una evidencia, por buena que sea, sólo apoya la idea de la que trata.`,
    });
  } else if (peso === 1) {
    problemas.push({
      id: "debil",
      medidor: "cred",
      dice: "One personal example isn't enough for me.",
      porque: "Un ejemplo personal («For example,…») sirve para ilustrar, pero es un solo caso. Un registro, una encuesta o un estudio con mediciones pesan más.",
    });
  } else if (peso === 2) {
    problemas.push({
      id: "medio",
      medidor: "cred",
      dice: "Good evidence. A study with measurements would convince me completely.",
      porque: "Un registro o una encuesta son buena evidencia (peso 2). Un estudio con mediciones pesa 3 y permite afirmar con «will».",
    });
  }
  if (extrema) {
    problemas.push({
      id: "extrema-c",
      medidor: "cred",
      dice: "That proposal goes much further than your evidence.",
      porque: "Tu evidencia habla de un problema concreto; prohibirlo todo es desproporcionado y hace dudar de tu juicio.",
    });
    problemas.push({
      id: "extrema-r",
      medidor: "resp",
      dice: "Banning everything isn't fair to anyone.",
      porque: "Una propuesta extrema («we must ban… forever», «never») ignora a quienes piensan distinto. Proponer con «should» y un cambio medible es más respetuoso.",
    });
  }
  if (apertura.tono === "grosera") {
    problemas.push({ id: "grosera", medidor: "resp", dice: "That was rude. I won't support you.", porque: apertura.porque });
  } else if (apertura.tono === "nada") {
    problemas.push({ id: "nada", medidor: "resp", dice: `You didn't answer ${c.orador.nombre}.`, porque: apertura.porque });
  }
  if (esTrampa) {
    problemas.push({ id: "gram", medidor: "clar", dice: "Sorry, I didn't quite understand your concern.", porque: c.trampa.porque });
  }
  if (timidez > 0) {
    problemas.push({
      id: "timidez",
      medidor: "clar",
      dice: "You have strong evidence, so why do you sound so unsure?",
      porque: `Tu evidencia permite «${NIVELES[ideal].modal}» y dijiste «${modal}». Quedarte corto también confunde: el foro no sabe qué tan grave es el problema.`,
    });
  }
  if (prop?.tipo === "vaga") {
    problemas.push({
      id: "vaga",
      medidor: "clar",
      dice: "But what exactly do you propose?",
      porque: "Tu conclusión no propone nada concreto. Un llamado a la acción claro dice quién hace qué: «we should allow only one ship a week…».",
    });
  } else if (prop?.tipo === "concreta" && !concretaPropia) {
    problemas.push({
      id: "desfase",
      medidor: "clar",
      dice: "Your proposal doesn't solve the problem you described.",
      porque: "Tu propuesta es concreta, pero resuelve otra preocupación. La conclusión debe responder a la opinión con la que abriste.",
    });
  }

  const valores: Record<Medidor, number> = { cred, resp, clar };
  const votos: Voto[] = FORO.map((m) => {
    const valor = valores[m.medidor];
    const aFavor = valor >= m.umbral;
    const propio = problemas.find((p) => p.medidor === m.medidor);
    if (aFavor) {
      return {
        miembro: m,
        valor,
        aFavor,
        dice: m.si,
        porque: propio ? `Vota a favor (su medidor llega a ${m.umbral}), aunque nota algo: ${propio.porque}` : `Su medidor (${MEDIDORES[m.medidor].es.toLowerCase()}) llega a ${valor}, por encima de ${m.umbral}.`,
      };
    }
    return {
      miembro: m,
      valor,
      aFavor,
      dice: propio?.dice ?? "I'm not convinced yet.",
      porque: propio?.porque ?? `Su medidor (${MEDIDORES[m.medidor].es.toLowerCase()}) se queda en ${valor}; necesita ${m.umbral}.`,
    };
  });
  const aFavor = votos.filter((v) => v.aFavor).length;
  const zona: Zona = aFavor >= VOTOS_PARA_CAMBIAR && concretaPropia ? "cambiado" : aFavor >= 3 ? "pendiente" : "aprobado";

  return { cred, resp, clar, peso, ideal, exceso, timidez, problemas, votos, aFavor, zona };
}

export const ZONAS: Record<Zona, { en: string; es: string }> = {
  aprobado: { en: "Plan approved as it is", es: "El plan se aprueba tal cual: tu preocupación no pesó." },
  pendiente: { en: "They'll study it later", es: "El foro te escuchó, pero no le alcanza para cambiar el plan." },
  cambiado: { en: "Plan changed with your proposal", es: "El foro cambia el plan con tu propuesta." },
};

/** La intervención armada como texto, por partes (para la vista previa). */
export function partesIntervencion(c: Caso, i: Intervencion): { parte: string; texto: string | null }[] {
  const apertura = APERTURAS.find((a) => a.id === i.apertura);
  const preoTexto = i.preocupacion === TRAMPA ? c.trampa.texto : c.preocupaciones.find((p) => p.id === i.preocupacion)?.texto;
  const preoId = i.preocupacion === TRAMPA ? c.trampa.de : i.preocupacion;
  const cons = c.preocupaciones.find((p) => p.id === preoId)?.consecuencia;
  const ev = i.evidencia === SIN_EVIDENCIA ? "" : c.evidencias.find((e) => e.id === i.evidencia)?.texto;
  const prop = c.propuestas.find((p) => p.id === i.propuesta)?.texto;
  return [
    { parte: "apertura", texto: apertura ? apertura.texto : null },
    { parte: "preocupacion", texto: preoTexto ?? null },
    { parte: "fuerza", texto: cons ? `${NIVELES[i.nivel].marco} ${cons}.` : `${NIVELES[i.nivel].marco} …` },
    { parte: "evidencia", texto: ev === undefined ? null : ev },
    { parte: "propuesta", texto: prop ?? null },
  ];
}

/* ── «Both sides»: la columna de Ximena y el mapa del argumento ───────── */

export type Lado = "pro" | "contra" | "cierre";

export interface OpcionConector {
  texto: string;
  tipo: "ok" | "lado" | "gramatica";
  /** Dónde cae la oración con este conector. */
  cae: Lado;
  porque: string;
}

export interface OracionColumna {
  id: string;
  /** La oración sin su conector (empieza con espacio). */
  resto: string;
  lado: Lado;
  opciones: OpcionConector[];
}

export const LECTORES = 10;
export const COSTO_LADO = 2;
export const COSTO_GRAMATICA = 1;
export const META_LECTORES = 8;

export const COLUMNA_TITULO = "A solar farm for Bahía Serena?";
export const COLUMNA_AUTORA = "Ximena Ortiz, 5th semester";
export const COLUMNA_APERTURA = "In my opinion, Bahía Serena should build a solar farm on the old salt flats.";

export const COLUMNA: OracionColumna[] = [
  {
    id: "o1",
    resto: " the evidence suggests that solar energy could cut the town's electricity bills by 30%.",
    lado: "pro",
    opciones: [
      { texto: "Moreover,", tipo: "ok", cae: "pro", porque: "«Moreover» suma una idea que COINCIDE con la anterior (A3): otra razón a favor de la granja." },
      { texto: "However,", tipo: "lado", cae: "contra", porque: "«However» anuncia un contraste, pero esta idea también está a favor: el lector cree que ahora vas a hablar en contra." },
      { texto: "Although", tipo: "gramatica", cae: "pro", porque: "«Although» une dos ideas en la misma oración («Although X, Y»). Aquí sólo hay una: la oración queda incompleta." },
    ],
  },
  {
    id: "o2",
    resto: " the panels are expensive at first, and the town has a small budget.",
    lado: "contra",
    opciones: [
      { texto: "In addition,", tipo: "lado", cae: "pro", porque: "«In addition» suma del mismo lado, pero el costo alto es una desventaja, no otra ventaja: la idea cae en la columna equivocada." },
      { texto: "However,", tipo: "ok", cae: "contra", porque: "«However» introduce una idea que contrasta con lo anterior: después de la ventaja, el costo (A1, A3)." },
      { texto: "Despite", tipo: "gramatica", cae: "contra", porque: "«Despite» va seguido de un sustantivo o un gerundio («Despite the cost…»), nunca de una oración con sujeto y verbo." },
    ],
  },
  {
    id: "o3",
    resto: " the high cost, the panels pay for themselves in about eight years.",
    lado: "pro",
    opciones: [
      { texto: "Although", tipo: "gramatica", cae: "pro", porque: "«Although» pide una oración completa: «Although the cost is high,…». Con sólo «the high cost» la frase queda rota." },
      { texto: "Moreover,", tipo: "lado", cae: "contra", porque: "«Moreover» suma a la idea anterior (el costo): el lector espera otra desventaja, pero esta idea es a favor." },
      { texto: "Despite", tipo: "ok", cae: "pro", porque: "«Despite» + sustantivo («the high cost»): reconoce la desventaja y regresa al lado a favor en la misma oración (A1)." },
    ],
  },
  {
    id: "o4",
    resto: " some fishermen are worried about losing access to the salt flats.",
    lado: "contra",
    opciones: [
      { texto: "On the other hand,", tipo: "ok", cae: "contra", porque: "«On the other hand» presenta la otra cara del argumento (A3): ahora, la preocupación de los pescadores." },
      { texto: "Despite", tipo: "gramatica", cae: "contra", porque: "«Despite» no puede ir antes de una oración con sujeto y verbo («some fishermen are worried…»)." },
      { texto: "Also,", tipo: "lado", cae: "pro", porque: "«Also» agrega algo del mismo lado: el lector espera otra ventaja y se encuentra una preocupación." },
    ],
  },
  {
    id: "o5",
    resto: " the farm is large, the plan leaves a free path to the sea for the fishing boats.",
    lado: "pro",
    opciones: [
      { texto: "Furthermore,", tipo: "lado", cae: "contra", porque: "«Furthermore» sumaría otra preocupación a la anterior; pero aquí RESPONDES a la preocupación, no la agrandas." },
      { texto: "Although", tipo: "ok", cae: "pro", porque: "«Although» + oración completa: admite que la granja es grande y, en la misma oración, responde a los pescadores." },
      { texto: "Despite", tipo: "gramatica", cae: "pro", porque: "«Despite the farm is large» rompe la regla: «despite» va con sustantivo («Despite its size,…»), no con una oración." },
    ],
  },
  {
    id: "o6",
    resto: " I believe that a solar farm with a free path for the fishing boats would be the best option for Bahía Serena.",
    lado: "cierre",
    opciones: [
      { texto: "In conclusion,", tipo: "ok", cae: "cierre", porque: "«In conclusion» anuncia tu postura final: opinión + evidencia + conclusión (A1)." },
      { texto: "Although", tipo: "gramatica", cae: "cierre", porque: "«Although I believe…» deja la oración sin idea principal: no es un conector de conclusión." },
      { texto: "However,", tipo: "lado", cae: "contra", porque: "«However» haría que tu conclusión pareciera contradecir todo lo que defendiste." },
    ],
  },
];

/** Lectores que siguen la columna después de estos intentos. */
export function lectoresTras(intentos: Record<string, string[]>): number {
  let perdidos = 0;
  for (const o of COLUMNA) {
    for (const t of intentos[o.id] ?? []) {
      const op = o.opciones.find((x) => x.texto === t);
      if (op?.tipo === "lado") perdidos += COSTO_LADO;
      else if (op?.tipo === "gramatica") perdidos += COSTO_GRAMATICA;
    }
  }
  return Math.max(0, LECTORES - perdidos);
}
