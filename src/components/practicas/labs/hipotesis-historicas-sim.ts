/**
 * Lógica pura del «Tablero de investigación» (hipotesis-historicas).
 *
 * El alumno parte de una pregunta histórica, elige la hipótesis que quiere
 * poner a prueba y consulta evidencia (fuentes primarias y secundarias de los
 * datos del laboratorio) con un presupuesto limitado de consultas. Cada pieza
 * mueve un medidor a favor o en contra de LA hipótesis elegida; al final decide
 * si la MANTIENE, la REFINA o la DESCARTA, y la retroalimentación explica por
 * qué esa era (o no) la decisión que pedía la evidencia reunida.
 *
 * Los hechos históricos son los de los datos del laboratorio (Plan de Ayala,
 * Códice Mendoza, crónicas de Bernal Díaz, etc.). Las hipótesis alternativas
 * son planteamientos de estudiante, no citas de nadie. Los valores del medidor
 * son una «simulación» didáctica, no una medición.
 */

export type Decision = "mantener" | "refinar" | "descartar";
export type TipoFuenteSim = "primaria" | "secundaria";

export interface Hipotesis {
  id: string;
  texto: string;
  /** Versión matizada, para cuando la decisión correcta es «refinar». */
  refinada: string;
}

export interface Evidencia {
  id: string;
  imagen: string;
  titulo: string;
  tipo: TipoFuenteSim;
  icono: string;
  /** Qué es esta fuente (se revela al consultarla). */
  lectura: string;
  /** Efecto sobre cada hipótesis: valor en el medidor y el porqué. */
  efectos: Record<string, { v: number; porque: string }>;
  /** Fuera de periodo o de tema: consultarla gasta una visita. */
  fuera?: boolean;
}

export interface Caso {
  id: string;
  titulo: string;
  pregunta: string;
  contexto: string;
  imagen: string;
  icono: string;
  /** Consultas disponibles en el archivo. */
  presupuesto: number;
  hipotesis: Hipotesis[];
  evidencias: Evidencia[];
}

export const FUERA_TEXTO =
  "Esta fuente pertenece a otro período o a otro hecho: no te dice nada sobre tu pregunta. Contextualizar antes de consultar te habría ahorrado la visita.";

export const CASOS: Caso[] = [
  {
    id: "revolucion",
    titulo: "La Revolución Mexicana",
    pregunta: "¿Por qué estalló la Revolución Mexicana en 1910?",
    contexto: "Quieres explicar una causa del estallido de 1910. Elige una hipótesis, reúne evidencia en el archivo y decide qué hacer con ella.",
    imagen: "caso-revolucion",
    icono: "fa-wheat-awn",
    presupuesto: 4,
    hipotesis: [
      {
        id: "agraria",
        texto: "Estalló principalmente por la acumulación de tierras en manos de unos pocos terratenientes durante el porfiriato.",
        refinada: "La acumulación de tierras fue una causa central, pero conviene contrastarla con otras fuentes y con otras causas antes de darla por cerrada.",
      },
      {
        id: "ambicion",
        texto: "Fue producto solo de la ambición personal de unos cuantos jefes.",
        refinada: "La ambición de algunos jefes pudo influir, pero no basta para explicar un movimiento con tantas demandas.",
      },
      {
        id: "gobierno",
        texto: "Fue solo un cambio de gobierno, sin demandas sociales de fondo.",
        refinada: "Hubo disputas por el gobierno, pero también demandas sociales que hay que explicar.",
      },
    ],
    evidencias: [
      {
        id: "ayala",
        imagen: "ev-manifiesto",
        titulo: "El Plan de Ayala (1911), proclamado por Emiliano Zapata",
        tipo: "primaria",
        icono: "fa-scroll",
        lectura: "Documento de 1911 del zapatismo. Sirve para estudiar las demandas agrarias de los pueblos.",
        efectos: {
          agraria: { v: 2, porque: "Es un documento de la época que expresa demandas por la tierra: respalda con fuerza la causa agraria." },
          ambicion: { v: -1, porque: "Un plan que reclama tierras para los pueblos no se explica solo por la ambición de un jefe." },
          gobierno: { v: -2, porque: "Contiene demandas sociales concretas, así que no fue solo un cambio de gobierno." },
        },
      },
      {
        id: "foto",
        imagen: "ev-fotografia",
        titulo: "Una fotografía del Archivo Casasola de la Revolución Mexicana (1910-1920)",
        tipo: "primaria",
        icono: "fa-camera",
        lectura: "Imagen tomada durante la Revolución. Muestra a gente participando, pero una foto sola no dice por qué luchaban.",
        efectos: {
          agraria: { v: 1, porque: "Muestra a personas comunes en el movimiento, coherente con una causa social; por sí sola no prueba la causa y hay que contextualizarla." },
          ambicion: { v: 0, porque: "Una imagen no demuestra ni descarta motivos personales." },
          gobierno: { v: 0, porque: "Una imagen no demuestra ni descarta demandas sociales." },
        },
      },
      {
        id: "katz",
        imagen: "ev-libro",
        titulo: "La obra «La Revolución Mexicana» del historiador Friedrich Katz",
        tipo: "secundaria",
        icono: "fa-book",
        lectura: "Interpretación posterior que analiza el movimiento a partir de múltiples fuentes primarias.",
        efectos: {
          agraria: { v: 1, porque: "Es una fuente secundaria: ofrece una visión de conjunto para contrastar tu hipótesis, pero pesa menos que una fuente de la época." },
          ambicion: { v: 0, porque: "Sin la tesis exacta del autor no puedes usarla en contra: tendrías que leerla." },
          gobierno: { v: 0, porque: "Sin la tesis exacta del autor no puedes usarla en contra: tendrías que leerla." },
        },
      },
      {
        id: "libro2020",
        imagen: "ev-libro",
        titulo: "Un libro de 2020 sobre la Revolución Mexicana basado en investigación de archivos",
        tipo: "secundaria",
        icono: "fa-book-open",
        lectura: "Interpretación reciente, apoyada en documentos de archivo.",
        efectos: {
          agraria: { v: 1, porque: "Una investigación reciente basada en archivos sirve para corroborar con otra fuente independiente." },
          ambicion: { v: 0, porque: "Por sí solo no cambia el balance sobre motivos personales." },
          gobierno: { v: 0, porque: "Por sí solo no cambia el balance sobre demandas sociales." },
        },
      },
      {
        id: "codice",
        imagen: "ev-codice",
        titulo: "El Códice Mendoza (c. 1541), fuente iconográfica con los registros tributarios del Imperio Azteca",
        tipo: "primaria",
        icono: "fa-dove",
        lectura: "Registro del siglo XVI sobre el tributo del Imperio Azteca.",
        fuera: true,
        efectos: {},
      },
      {
        id: "testimonio68",
        imagen: "ev-testimonio",
        titulo: "El testimonio oral de un anciano que vivió el Movimiento Estudiantil de 1968",
        tipo: "primaria",
        icono: "fa-microphone",
        lectura: "Testimonio valioso, pero sobre otro hecho: el Movimiento Estudiantil de 1968.",
        fuera: true,
        efectos: {},
      },
    ],
  },
  {
    id: "imperio",
    titulo: "El Imperio Mexica",
    pregunta: "¿Cómo se organizaba y se sostenía el Imperio Mexica?",
    contexto: "Quieres entender la organización política y económica del Imperio Mexica. Aquí importa la crítica de fuentes: no todas sirven ni pesan igual.",
    imagen: "caso-imperio",
    icono: "fa-landmark",
    presupuesto: 3,
    hipotesis: [
      {
        id: "tributo",
        texto: "Se sostenía en buena parte con el tributo de pueblos sometidos, y lo registraba en documentos pictóricos.",
        refinada: "El tributo fue un pilar del Imperio, pero hace falta contrastar más fuentes para no depender de una sola perspectiva.",
      },
      {
        id: "sinorg",
        texto: "No tenía ninguna organización política ni económica.",
        refinada: "Se necesita un planteamiento más fino: hay indicios de organización y hay que precisarlos.",
      },
      {
        id: "soloespanoles",
        texto: "Lo que sabemos del Imperio viene únicamente de relatos de los conquistadores.",
        refinada: "Buena parte de lo que sabemos viene de relatos de conquistadores, pero se contrasta con fuentes indígenas como los códices.",
      },
    ],
    evidencias: [
      {
        id: "codice",
        imagen: "ev-codice",
        titulo: "El Códice Mendoza (c. 1541), fuente iconográfica con los registros tributarios del Imperio Azteca",
        tipo: "primaria",
        icono: "fa-dove",
        lectura: "Códice pictórico con registros tributarios; revela la organización política y económica del Imperio Mexica.",
        efectos: {
          tributo: { v: 2, porque: "Contiene registros tributarios: es evidencia directa de que existía un sistema de tributo registrado." },
          sinorg: { v: -2, porque: "Un registro tributario ya es una forma de organización económica: contradice la hipótesis." },
          soloespanoles: { v: -1, porque: "Es una fuente pictórica, no un relato de conquistadores: muestra que no todo viene de crónicas españolas." },
        },
      },
      {
        id: "bernal",
        imagen: "ev-cronica",
        titulo: "Las crónicas de Bernal Díaz del Castillo sobre la Conquista",
        tipo: "primaria",
        icono: "fa-feather",
        lectura: "Relato de un conquistador español. Útil, pero con el punto de vista y las motivaciones de quien conquistó.",
        efectos: {
          tributo: { v: 1, porque: "Describe lo que vio un conquistador: sirve, pero con la reserva de su sesgo (crítica de fuentes)." },
          sinorg: { v: -1, porque: "Un testigo que narra ante un imperio con sus ciudades y autoridades no describe un caos sin organización." },
          soloespanoles: { v: 1, porque: "Es justo el tipo de relato de conquistador de la hipótesis; apoya que existe, no que sea el único." },
        },
      },
      {
        id: "ayala",
        imagen: "ev-manifiesto",
        titulo: "El Plan de Ayala (1911), proclamado por Emiliano Zapata",
        tipo: "primaria",
        icono: "fa-scroll",
        lectura: "Documento de 1911: pertenece a la época de la Revolución, no al Imperio Mexica.",
        fuera: true,
        efectos: {},
      },
      {
        id: "libro2010",
        imagen: "ev-libro",
        titulo: "Un libro de texto de historia publicado en 2010 que analiza la Revolución Mexicana",
        tipo: "secundaria",
        icono: "fa-book",
        lectura: "Fuente secundaria sobre la Revolución, no sobre el Imperio Mexica.",
        fuera: true,
        efectos: {},
      },
      {
        id: "testimonio68",
        imagen: "ev-testimonio",
        titulo: "El testimonio oral de un anciano que vivió el Movimiento Estudiantil de 1968",
        tipo: "primaria",
        icono: "fa-microphone",
        lectura: "Testimonio sobre un hecho del siglo XX, ajeno al Imperio Mexica.",
        fuera: true,
        efectos: {},
      },
    ],
  },
];

export interface Balance {
  /** Suma de efectos (puede ser negativa). */
  score: number;
  apoyo: number;
  contra: number;
  /** Cuántas fuentes distintas apoyan (efecto > 0). */
  fuentesApoyo: number;
  hayPrimaria: boolean;
  consultadas: number;
  /** Consultadas que no tenían nada que ver con el tema. */
  fuera: number;
  esperada: Decision;
}

export const UMBRAL_MANTENER = 3;

export function efectoDe(ev: Evidencia, hipId: string): { v: number; porque: string } {
  return ev.efectos[hipId] ?? { v: 0, porque: FUERA_TEXTO };
}

/** Balance de la evidencia consultada frente a una hipótesis, y qué decisión pide. */
export function evaluar(caso: Caso, hipId: string, consultadas: string[]): Balance {
  let apoyo = 0;
  let contra = 0;
  let fuentesApoyo = 0;
  let hayPrimaria = false;
  let fuera = 0;
  for (const id of consultadas) {
    const ev = caso.evidencias.find((e) => e.id === id);
    if (!ev) continue;
    if (ev.fuera) fuera++;
    const { v } = efectoDe(ev, hipId);
    if (v > 0) {
      apoyo += v;
      fuentesApoyo++;
      if (ev.tipo === "primaria") hayPrimaria = true;
    } else if (v < 0) {
      contra += -v;
    }
  }
  const score = apoyo - contra;
  let esperada: Decision;
  if (contra > apoyo) esperada = "descartar";
  else if (score >= UMBRAL_MANTENER && fuentesApoyo >= 2 && hayPrimaria) esperada = "mantener";
  else esperada = "refinar";
  return { score, apoyo, contra, fuentesApoyo, hayPrimaria, consultadas: consultadas.length, fuera, esperada };
}

export const DECISIONES: { id: Decision; etiqueta: string; icono: string; ayuda: string }[] = [
  { id: "mantener", etiqueta: "Mantenerla", icono: "fa-circle-check", ayuda: "La evidencia la sostiene con varias fuentes" },
  { id: "refinar", etiqueta: "Refinarla", icono: "fa-pen-ruler", ayuda: "Falta evidencia o hay que matizarla" },
  { id: "descartar", etiqueta: "Descartarla", icono: "fa-trash-can", ayuda: "La evidencia la contradice" },
];

/** Por qué la decisión correcta era esa, con los números a la vista. */
export function retroDecision(caso: Caso, hip: Hipotesis, b: Balance, elegida: Decision): string[] {
  const lineas: string[] = [];
  const num = `Medidor: ${b.score >= 0 ? "+" : ""}${b.score} (a favor ${b.apoyo}, en contra ${b.contra}) con ${b.consultadas} fuente${b.consultadas === 1 ? "" : "s"} consultada${b.consultadas === 1 ? "" : "s"} (simulación).`;
  if (elegida === b.esperada) {
    lineas.push("Decisión acertada.");
  } else {
    lineas.push(`Con esta evidencia la decisión que correspondía era «${DECISIONES.find((d) => d.id === b.esperada)!.etiqueta.toLowerCase()}».`);
  }
  lineas.push(num);
  if (b.esperada === "descartar") {
    lineas.push("La evidencia en contra pesa más que la de a favor: una hipótesis es provisional y se abandona cuando las fuentes la contradicen. Elige otra y vuelve a ponerla a prueba con la evidencia que ya reuniste.");
  } else if (b.esperada === "mantener") {
    lineas.push("Dos o más fuentes apoyan la hipótesis y entre ellas hay una fuente de la época: eso es corroborar o triangular, y por eso puede mantenerse (siempre como provisional).");
  } else if (b.consultadas === 0) {
    lineas.push(`Sin evidencia no puedes sostenerla ni descartarla. Refinada quedaría así: «${hip.refinada}»`);
  } else if (b.apoyo === 0 && b.contra === 0) {
    lineas.push(`Lo consultado no dice nada sobre esta hipótesis, así que aún no se sostiene ni se rompe. Busca otras fuentes. Refinada: «${hip.refinada}»`);
  } else {
    lineas.push(`Hay indicios, pero todavía no bastan: ${b.fuentesApoyo < 2 ? "te falta una segunda fuente que la corrobore" : b.hayPrimaria ? "el respaldo no llega al umbral" : "falta una fuente de la época"}. Refinada: «${hip.refinada}»`);
  }
  if (b.fuera > 0) {
    lineas.push(`Gastaste ${b.fuera} consulta${b.fuera === 1 ? "" : "s"} en fuentes de otro período o tema: contextualizar primero (paso 2 del método) las evita.`);
  }
  return lineas;
}
