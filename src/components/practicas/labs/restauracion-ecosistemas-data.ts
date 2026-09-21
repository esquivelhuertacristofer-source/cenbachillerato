/**
 * Datos y modelo del laboratorio "Políticas de conservación y restauración de
 * ecosistemas en México" (CNEYT-III, progresión 11; códigos de actividad
 * CNEYT-III-P07-A1 … A10).
 *
 * Anclas:
 *   - A1 lectura «Políticas de conservación en México: ANP, LGEEPA y
 *     convenios»: marco teórico verbatim (5 párrafos + preguntas).
 *   - A2 verdadero/falso «¿Verdadero o falso? Conservación en México»: reto
 *     evaluable (cada afirmación con sus opciones Verdadero/Falso).
 *   - A4 verdadero/falso: hechos. A5 glosario: 6 términos. A6 completa el texto.
 *   - A7 reflexión final de la autoevaluación: recuadro «Para pensar».
 *   - A10 reto cronometrado (15 s por pregunta): inspira la tarjeta de estrellas
 *     contrarreloj «¿Qué instrumento usarías?».
 *
 * Tres modos:
 *   1. politicas — una cuenca ILUSTRATIVA con ocho zonas y presupuesto limitado:
 *      el alumno asigna instrumentos reales (ANP, PSA, ADVC, UMA, corredor,
 *      restauración pasiva/activa, veda) y simula 30 años. Los instrumentos y
 *      los principios (adicionalidad, participación, distancia a la fuente de
 *      semillas, conectividad) son reales; las cifras de cada zona son un
 *      MODELO DIDÁCTICO.
 *   2. sucesion — una parcela que se restaura: tiempos de recuperación de
 *      selvas neotropicales que se regeneran solas (Poorter et al. 2016, Nature;
 *      Rozendaal et al. 2019, Science Advances; Poorter et al. 2021, Science).
 *      Los factores de distancia, uso previo, fuego y técnica son ilustrativos.
 *   3. casos — tres casos mexicanos con datos publicados: vaquita marina,
 *      Cabo Pulmo y mariposa monarca.
 *
 * Datos puros (sin three ni React).
 */

import type { QuizEvaluable } from "./_reto-quiz";
import type { TextoHuecosData } from "./_mecanica-huecos";

/* ── Utilidades ───────────────────────────────────────────────────────── */

export function num(x: number, dec = 0): string {
  const s = Math.abs(x).toFixed(dec);
  const [ent, frac] = s.split(".");
  const conMiles = ent!.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${x < 0 ? "−" : ""}${conMiles}${frac ? `.${frac}` : ""}`;
}

export function mulberry32(semilla: number) {
  let t = semilla >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));

/* ── Modos ────────────────────────────────────────────────────────────── */

export type Modo = "politicas" | "sucesion" | "casos";
export const MODOS: Modo[] = ["politicas", "sucesion", "casos"];

export const MODOS_DEF: Record<Modo, { etq: string; subtitulo: string; icono: string; color: string }> = {
  politicas: { etq: "Plan de conservación", subtitulo: "Asigna instrumentos con presupuesto limitado", icono: "fa-map-location-dot", color: "#34d399" },
  sucesion: { etq: "Restaurar una parcela", subtitulo: "Sucesión ecológica: del potrero al bosque", icono: "fa-seedling", color: "#a3e635" },
  casos: { etq: "Casos de México", subtitulo: "Vaquita, Cabo Pulmo y mariposa monarca", icono: "fa-magnifying-glass-chart", color: "#38bdf8" },
};

/* ════════════════════════════════════════════════════════════════════════
 * 1. PLAN DE CONSERVACIÓN DE UNA CUENCA (modelo didáctico)
 * ════════════════════════════════════════════════════════════════════════ */

export type InstrumentoId = "ninguno" | "anp" | "psa" | "advc" | "uma" | "corredor" | "pasiva" | "activa" | "veda";

export interface Instrumento {
  id: InstrumentoId;
  etq: string;
  corto: string;
  icono: string;
  color: string;
  /** Costo en unidades de presupuesto (ilustrativo, a cinco años). */
  costo: number;
  quien: string;
  def: string;
}

export const INSTRUMENTOS: Record<InstrumentoId, Instrumento> = {
  ninguno: { id: "ninguno", etq: "Sin instrumento", corto: "Nada", icono: "fa-ban", color: "#94a3b8", costo: 0, quien: "—", def: "No se aplica ninguna política: la zona sigue su tendencia actual." },
  anp: {
    id: "anp",
    etq: "Área Natural Protegida",
    corto: "ANP",
    icono: "fa-shield-halved",
    color: "#22c55e",
    costo: 30,
    quien: "Decreto federal · CONANP · LGEEPA",
    def: "Decreto que zonifica el territorio: zona núcleo sin actividades extractivas y zona de amortiguamiento con usos sustentables. Requiere personal, vigilancia y acuerdos con quienes viven ahí.",
  },
  psa: {
    id: "psa",
    etq: "Pago por Servicios Ambientales",
    corto: "PSA",
    icono: "fa-hand-holding-dollar",
    color: "#facc15",
    costo: 20,
    quien: "CONAFOR",
    def: "Pago a ejidos, comunidades y propietarios que se comprometen a conservar su bosque (servicios hidrológicos o de biodiversidad). Se paga en cinco anualidades si se mantiene la cobertura forestal.",
  },
  advc: {
    id: "advc",
    etq: "Área Destinada Voluntariamente a la Conservación",
    corto: "ADVC",
    icono: "fa-handshake",
    color: "#2dd4bf",
    costo: 5,
    quien: "Certificado de la CONANP",
    def: "El dueño —ejido, comunidad o particular— decide conservar su predio y la CONANP lo certifica. No expropia ni impone: reconoce y ordena lo que el dueño ya quiere hacer.",
  },
  uma: {
    id: "uma",
    etq: "Unidad de Manejo para la Conservación de la Vida Silvestre",
    corto: "UMA",
    icono: "fa-paw",
    color: "#fb923c",
    costo: 8,
    quien: "Registro ante la SEMARNAT",
    def: "Predio con un plan de manejo que permite aprovechar fauna o flora silvestre (caza regulada, ecoturismo, viveros) con tasas autorizadas. El hábitat se conserva porque produce ingresos.",
  },
  corredor: {
    id: "corredor",
    etq: "Corredor biológico",
    corto: "Corredor",
    icono: "fa-route",
    color: "#a78bfa",
    costo: 15,
    quien: "CONABIO · acuerdos entre propietarios",
    def: "Franja de vegetación que une áreas aisladas para que las especies se muevan e intercambien genes, como el Corredor Biológico Mesoamericano. Combina acuerdos con los dueños y restauración.",
  },
  pasiva: {
    id: "pasiva",
    etq: "Restauración pasiva",
    corto: "Pasiva",
    icono: "fa-leaf",
    color: "#86efac",
    costo: 6,
    quien: "Exclusión de ganado y fuego",
    def: "Se quita la causa del daño (ganado, fuego, tala) y se deja que el ecosistema se regenere solo con las semillas que llegan del bosque cercano.",
  },
  activa: {
    id: "activa",
    etq: "Restauración activa",
    corto: "Activa",
    icono: "fa-trowel",
    color: "#4ade80",
    costo: 25,
    quien: "Viveros y plantación de nativas",
    def: "Se interviene directamente: descompactar el suelo, controlar pastos invasores y plantar especies nativas. Cara, pero necesaria cuando el ecosistema no puede recuperarse solo.",
  },
  veda: {
    id: "veda",
    etq: "Veda temporal de pesca",
    corto: "Veda",
    icono: "fa-calendar-xmark",
    color: "#38bdf8",
    costo: 8,
    quien: "CONAPESCA",
    def: "Prohibición de capturar una especie durante su época de reproducción o en una zona. La pesca se detiene unas semanas o meses y se reanuda.",
  },
};

export const INSTRUMENTOS_LISTA: InstrumentoId[] = ["anp", "psa", "advc", "uma", "corredor", "pasiva", "activa", "veda"];

export type Calidad = "optima" | "util" | "cara" | "mala";

export const CALIDAD_DEF: Record<Calidad, { etq: string; color: string; icono: string }> = {
  optima: { etq: "Buena elección", color: "#34d399", icono: "fa-circle-check" },
  util: { etq: "Ayuda, pero no es lo mejor", color: "#fbbf24", icono: "fa-circle-half-stroke" },
  cara: { etq: "Funciona, pero cuesta de más", color: "#fb923c", icono: "fa-sack-dollar" },
  mala: { etq: "Mal ubicado", color: "#f87171", icono: "fa-circle-xmark" },
};

export interface Opcion {
  /** Cobertura forestal a los 30 años (% de la zona). En la bahía: estado de la pesquería. */
  cob: number;
  /** Salud de la biodiversidad de la zona a los 30 años (0–100). */
  bio: number;
  /** Efecto en el bienestar de las comunidades (puntos, + o −). */
  com: number;
  calidad: Calidad;
  porque: string;
}

export interface Zona {
  id: string;
  etq: string;
  /** Qué hay y quién es dueño. */
  ficha: string;
  tenencia: string;
  /** Superficie ilustrativa en hectáreas (0 en la bahía: no cuenta para la cobertura forestal). */
  ha: number;
  /** Peso de la zona en el índice de biodiversidad. */
  pesoBio: number;
  /** Estado inicial. */
  cob0: number;
  bio0: number;
  tipo: "selva" | "potrero" | "franja" | "sierra" | "bahia" | "rancho";
  /** Rectángulo en el tablero 3D: centro x, z y tamaño w, d. */
  x: number;
  z: number;
  w: number;
  d: number;
  opciones: Partial<Record<InstrumentoId, Opcion>> & { ninguno: Opcion };
}

/** La cuenca ilustrativa: ocho zonas. Los instrumentos son reales; las cifras de cada zona son un modelo didáctico. */
export const ZONAS: Zona[] = [
  {
    id: "sierra",
    etq: "Sierra del manantial",
    ficha: "Bosque mesófilo en tierras comunales. De su ladera nace el manantial que abastece al pueblo; hay ofertas para convertirla en huertas.",
    tenencia: "Comunidad agraria",
    ha: 700,
    pesoBio: 700,
    cob0: 90,
    bio0: 85,
    tipo: "sierra",
    x: -4.75,
    z: -2.6,
    w: 4.3,
    d: 3.8,
    opciones: {
      ninguno: { cob: 58, bio: 50, com: -8, calidad: "mala", porque: "Sin apoyo, parte de la ladera se desmonta para huertas: baja la recarga del manantial y el pueblo pierde agua." },
      psa: { cob: 88, bio: 82, com: 10, calidad: "optima", porque: "El pago por servicios hidrológicos compensa a la comunidad por no desmontar: conserva el bosque que le da agua al pueblo y le deja un ingreso." },
      advc: { cob: 74, bio: 68, com: 4, calidad: "util", porque: "La comunidad se compromete y certifica su bosque, pero sin un ingreso la presión de las huertas sigue ganando terreno." },
      anp: { cob: 88, bio: 84, com: 0, calidad: "cara", porque: "Protege el bosque y el agua, pero es el instrumento más caro para algo que un pago a la comunidad logra casi igual." },
    },
  },
  {
    id: "franja",
    etq: "Franja del río",
    ficha: "Orilla del río talada para cultivos. Es el único paso posible entre la sierra y la selva del ejido.",
    tenencia: "Varios propietarios",
    ha: 150,
    pesoBio: 350,
    cob0: 10,
    bio0: 15,
    tipo: "franja",
    x: -0.5,
    z: -3.6,
    w: 4.2,
    d: 1.8,
    opciones: {
      ninguno: { cob: 10, bio: 12, com: 0, calidad: "mala", porque: "La sierra y la selva siguen aisladas: las poblaciones de jaguar y tapir de cada lado quedan pequeñas y sin intercambio genético." },
      corredor: { cob: 68, bio: 72, com: 2, calidad: "optima", porque: "Los propietarios acuerdan dejar y restaurar la vegetación de la orilla: la franja une la sierra con la selva y los animales pueden cruzar." },
      pasiva: { cob: 38, bio: 32, com: 0, calidad: "util", porque: "La vegetación regresa en partes, pero sin acuerdo entre todos los dueños hay tramos cultivados que cortan el paso." },
      activa: { cob: 55, bio: 45, com: 2, calidad: "cara", porque: "Plantar ayuda, pero sin acuerdos de conectividad los tramos siguen interrumpidos y cuesta mucho más." },
    },
  },
  {
    id: "selva",
    etq: "Selva del ejido",
    ficha: "Selva alta bien conservada. El ejido la cuida desde hace décadas con reglas de su asamblea; la tala es poca.",
    tenencia: "Ejido",
    ha: 1200,
    pesoBio: 1200,
    cob0: 95,
    bio0: 90,
    tipo: "selva",
    x: 4.55,
    z: -2.6,
    w: 4.7,
    d: 3.8,
    opciones: {
      ninguno: { cob: 86, bio: 78, com: 0, calidad: "util", porque: "El ejido ya conserva: sin instrumento la selva resiste, aunque la tala hormiga le quita un poco cada año." },
      advc: { cob: 94, bio: 90, com: 6, calidad: "optima", porque: "El ejido certifica voluntariamente su selva: se reconoce lo que ya hace, se ordena su manejo y gana prioridad en otros apoyos. Barato y respetuoso." },
      psa: { cob: 94, bio: 89, com: 8, calidad: "cara", porque: "Funciona, pero paga por conservar algo que casi no estaba amenazado: poca adicionalidad. Ese dinero evitaría más pérdida en la frontera agropecuaria." },
      anp: { cob: 93, bio: 90, com: -8, calidad: "cara", porque: "Decretar un área protegida sobre tierras que el ejido ya conserva, sin su acuerdo, genera conflicto y cuesta mucho: protege, pero con costo social." },
      activa: { cob: 88, bio: 72, com: 0, calidad: "mala", porque: "No hay nada que restaurar: abrir claros para plantar en una selva madura daña el sotobosque y gasta presupuesto." },
    },
  },
  {
    id: "frontera",
    etq: "Frontera agropecuaria",
    ficha: "Selva que se está convirtiendo en potreros. Cada año se desmonta más porque la ganadería deja más dinero que el bosque en pie.",
    tenencia: "Ejido",
    ha: 900,
    pesoBio: 900,
    cob0: 80,
    bio0: 70,
    tipo: "selva",
    x: -0.5,
    z: -1.55,
    w: 4.2,
    d: 2.3,
    opciones: {
      ninguno: { cob: 28, bio: 25, com: 4, calidad: "mala", porque: "El desmonte avanza: en 30 años queda una cuarta parte de la selva. El ingreso ganadero sube un poco al principio." },
      psa: { cob: 72, bio: 62, com: 8, calidad: "optima", porque: "Aquí la amenaza es alta, así que el pago evita mucha deforestación que sí habría ocurrido: es donde el PSA es más adicional." },
      anp: { cob: 74, bio: 68, com: -12, calidad: "util", porque: "El decreto frena el cambio de uso de suelo, pero sin alternativas económicas para el ejido genera conflicto y tala clandestina que hay que vigilar." },
      advc: { cob: 42, bio: 38, com: 2, calidad: "util", porque: "Un compromiso voluntario no compensa lo que deja la ganadería: parte del ejido sigue abriendo potreros." },
      uma: { cob: 52, bio: 48, com: 6, calidad: "util", porque: "El aprovechamiento de fauna deja algo de ingreso, pero no alcanza a competir con la ganadería en toda la zona." },
    },
  },
  {
    id: "rancho",
    etq: "Rancho del venado",
    ficha: "Selva baja y matorral con venado cola blanca. Hay caza furtiva y el dueño piensa desmontar para sembrar.",
    tenencia: "Propiedad privada",
    ha: 600,
    pesoBio: 600,
    cob0: 70,
    bio0: 60,
    tipo: "rancho",
    x: -4.75,
    z: 0.9,
    w: 4.3,
    d: 2.6,
    opciones: {
      ninguno: { cob: 45, bio: 35, com: 0, calidad: "mala", porque: "Sin ingreso por conservar, el dueño desmonta la mitad y la caza furtiva vacía el monte." },
      uma: { cob: 68, bio: 64, com: 8, calidad: "optima", porque: "Con un plan de manejo registrado, el rancho aprovecha el venado con tasas autorizadas: el monte en pie deja dinero y el dueño vigila contra la caza furtiva." },
      anp: { cob: 70, bio: 68, com: -6, calidad: "cara", porque: "Decretar un área protegida sobre un predio productivo es caro y el dueño se opone: se conserva, pero a un costo que no hacía falta." },
      psa: { cob: 64, bio: 55, com: 5, calidad: "util", porque: "El pago ayuda a no desmontar, pero no resuelve la caza furtiva: nadie gana por cuidar al venado." },
    },
  },
  {
    id: "lejano",
    etq: "Potrero lejano",
    ficha: "Potrero usado 30 años, con el suelo compactado y pasto invasor. El bosque más cercano está a unos 2 km.",
    tenencia: "Ejido",
    ha: 400,
    pesoBio: 400,
    cob0: 2,
    bio0: 5,
    tipo: "potrero",
    x: -0.5,
    z: 0.9,
    w: 4.2,
    d: 2.6,
    opciones: {
      ninguno: { cob: 2, bio: 5, com: 2, calidad: "mala", porque: "Sigue siendo potrero degradado: poco pasto, suelo duro y casi sin vida silvestre." },
      pasiva: { cob: 14, bio: 14, com: 0, calidad: "util", porque: "Se quitó el ganado, pero a 2 km del bosque casi no llegan semillas y el pasto invasor ahoga a las plántulas: en 30 años apenas hay matorral." },
      activa: { cob: 55, bio: 42, com: 4, calidad: "optima", porque: "Descompactar, controlar el pasto y plantar nativas rompe la barrera: los árboles plantados atraen aves que traen más semillas. Aquí sí vale lo que cuesta." },
    },
  },
  {
    id: "potrero",
    etq: "Potrero junto a la selva",
    ficha: "Potrero abandonado hace poco, a unos 100 m de la selva del ejido. Todavía entra ganado de vez en cuando.",
    tenencia: "Ejido",
    ha: 400,
    pesoBio: 400,
    cob0: 5,
    bio0: 10,
    tipo: "potrero",
    x: 4.55,
    z: 0.9,
    w: 4.7,
    d: 2.6,
    opciones: {
      ninguno: { cob: 8, bio: 12, com: 1, calidad: "mala", porque: "El ganado y las quemas impiden que crezcan los árboles aunque las semillas llegan de la selva." },
      pasiva: { cob: 70, bio: 62, com: 0, calidad: "optima", porque: "Con la selva a 100 m, aves y murciélagos traen semillas: basta con cercar contra el ganado y evitar el fuego. En selvas, la regeneración natural suele recuperar más biodiversidad que plantar, y cuesta mucho menos." },
      activa: { cob: 72, bio: 56, com: 3, calidad: "cara", porque: "Funciona, pero cuesta cuatro veces más para un resultado parecido: aquí la naturaleza ya hacía el trabajo." },
    },
  },
  {
    id: "bahia",
    etq: "Bahía de pesca",
    ficha: "Laguna costera donde el pueblo pesca camarón. Se captura incluso en la época de reproducción y las capturas caen cada año.",
    tenencia: "Aguas nacionales",
    ha: 0,
    pesoBio: 800,
    cob0: 60,
    bio0: 55,
    tipo: "bahia",
    x: 0,
    z: 3.55,
    w: 13.6,
    d: 1.9,
    opciones: {
      ninguno: { cob: 20, bio: 28, com: -12, calidad: "mala", porque: "Si se pesca a los adultos antes de reproducirse, cada temporada hay menos camarón: la pesquería colapsa y el pueblo pierde su ingreso." },
      veda: { cob: 78, bio: 70, com: 8, calidad: "optima", porque: "Suspender la pesca en la época de reproducción deja que el camarón se reproduzca: se pierden unas semanas de trabajo, pero se conserva la pesca. La CONAPESCA establece vedas así cada año." },
      anp: { cob: 85, bio: 84, com: -6, calidad: "util", porque: "Una zona núcleo sin pesca recupera mucho la vida marina, pero si la comunidad no la pidió, pierde su ingreso: en Cabo Pulmo funcionó porque el pueblo la impulsó y cambió la pesca por el turismo." },
    },
  },
];

export const N_ZONAS = ZONAS.length;
export const PRESUPUESTO = 100;
export const ANIOS_PLAN = 30;
export const META_COB = 72;
export const META_BIO = 75;
export const META_COM = 80;
export const COM_BASE = 50;
/** Bonificación de conectividad al índice de biodiversidad cuando el corredor une la sierra y la selva. */
export const BONO_CORREDOR = 8;

export const PLAN_INICIAL: InstrumentoId[] = ZONAS.map(() => "ninguno");

export function opcionesDe(z: Zona): InstrumentoId[] {
  return (["ninguno", ...INSTRUMENTOS_LISTA] as InstrumentoId[]).filter((i) => z.opciones[i] !== undefined);
}

export function opcionDe(z: Zona, i: InstrumentoId): Opcion {
  return z.opciones[i] ?? z.opciones.ninguno;
}

export function costoPlan(plan: InstrumentoId[]): number {
  return plan.reduce((s, i) => s + INSTRUMENTOS[i].costo, 0);
}

/** Avance de una tendencia a los `t` años: las pérdidas son casi lineales; la recuperación arranca lenta (sucesión). */
export function avance(t: number, gana: boolean): number {
  const f = clamp(t / ANIOS_PLAN, 0, 1);
  return gana ? f * f * (3 - 2 * f) : f;
}

export function valorZona(z: Zona, i: InstrumentoId, t: number): { cob: number; bio: number; com: number } {
  const o = opcionDe(z, i);
  return {
    cob: z.cob0 + (o.cob - z.cob0) * avance(t, o.cob > z.cob0),
    bio: z.bio0 + (o.bio - z.bio0) * avance(t, o.bio > z.bio0),
    com: o.com * avance(t, false),
  };
}

export interface Indicadores {
  cobertura: number;
  biodiversidad: number;
  comunidades: number;
  conectado: boolean;
  zonas: { cob: number; bio: number; com: number }[];
}

export function indicadores(plan: InstrumentoId[], t: number): Indicadores {
  const zonas = ZONAS.map((z, k) => valorZona(z, plan[k] ?? "ninguno", t));
  let haTot = 0;
  let cobHa = 0;
  let pesoTot = 0;
  let bioPeso = 0;
  let com = COM_BASE;
  ZONAS.forEach((z, k) => {
    const v = zonas[k]!;
    if (z.ha > 0) {
      haTot += z.ha;
      cobHa += z.ha * v.cob;
    }
    pesoTot += z.pesoBio;
    bioPeso += z.pesoBio * v.bio;
    com += v.com;
  });
  const iSierra = ZONAS.findIndex((z) => z.id === "sierra");
  const iSelva = ZONAS.findIndex((z) => z.id === "selva");
  const iFranja = ZONAS.findIndex((z) => z.id === "franja");
  const conectado = zonas[iFranja]!.cob >= 50 && zonas[iSierra]!.cob >= 70 && zonas[iSelva]!.cob >= 70;
  const bio = bioPeso / pesoTot + (conectado ? BONO_CORREDOR : 0);
  return { cobertura: cobHa / haTot, biodiversidad: Math.min(100, bio), comunidades: clamp(com, 0, 100), conectado, zonas };
}

export function cumpleMetas(ind: Indicadores): { cob: boolean; bio: boolean; com: boolean } {
  return { cob: ind.cobertura >= META_COB, bio: ind.biodiversidad >= META_BIO, com: ind.comunidades >= META_COM };
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. RESTAURAR UNA PARCELA — sucesión secundaria en selva húmeda
 * ════════════════════════════════════════════════════════════════════════ */

export type Estrategia = "ganado" | "pasiva" | "nucleacion" | "activa";

export const ESTRATEGIAS: { id: Estrategia; etq: string; icono: string; costo: string; explica: string }[] = [
  { id: "ganado", etq: "Seguir con ganado", icono: "fa-cow", costo: "—", explica: "No se restaura: el pastoreo y las quemas mantienen el potrero." },
  { id: "pasiva", etq: "Regeneración natural", icono: "fa-leaf", costo: "$", explica: "Cercar contra el ganado y evitar el fuego; las semillas llegan solas." },
  { id: "nucleacion", etq: "Nucleación (islas)", icono: "fa-circle-nodes", costo: "$$", explica: "Plantar pequeñas islas de árboles que atraen aves y murciélagos con semillas; el resto se regenera solo." },
  { id: "activa", etq: "Plantación completa", icono: "fa-trowel", costo: "$$$", explica: "Descompactar el suelo, controlar el pasto y plantar nativas en toda la parcela." },
];

export const DIST_MIN = 50;
export const DIST_MAX = 3000;
export const DIST_PASO = 50;
export const USO_MAX = 40;
export const ANIOS_SUC = 60;

export type Atributo = "suelo" | "riqueza" | "biomasa" | "composicion";
export const ATRIBUTOS: Atributo[] = ["suelo", "riqueza", "biomasa", "composicion"];

/**
 * Tiempos de referencia para una selva neotropical que se regenera sola junto
 * a bosque maduro:
 *   - suelo: más del 90 % en menos de 10 años (Poorter et al. 2021, Science);
 *   - riqueza de especies: 80 % en 20 años (Rozendaal et al. 2019, Sci. Adv.);
 *   - biomasa aérea: 90 % en 66 años, mediana (Poorter et al. 2016, Nature);
 *   - composición de especies: solo 34 % en 20 años (Rozendaal et al. 2019).
 * τ se despeja de 1 − e^(−t/τ) = fracción.
 */
export const ATRIBUTO_DEF: Record<Atributo, { etq: string; color: string; tau: number; ref: string; icono: string }> = {
  suelo: { etq: "Fertilidad del suelo", color: "#d4a373", tau: 10 / Math.log(10), ref: "90 % en menos de 10 años (Poorter et al., 2021)", icono: "fa-mound" },
  riqueza: { etq: "Riqueza de especies", color: "#a3e635", tau: 20 / Math.log(5), ref: "80 % en 20 años (Rozendaal et al., 2019)", icono: "fa-dove" },
  biomasa: { etq: "Biomasa de árboles", color: "#22c55e", tau: 66 / Math.log(10), ref: "90 % en 66 años (Poorter et al., 2016)", icono: "fa-tree" },
  composicion: { etq: "Composición (las mismas especies que el bosque maduro)", color: "#38bdf8", tau: -20 / Math.log(1 - 0.34), ref: "34 % en 20 años (Rozendaal et al., 2019)", icono: "fa-puzzle-piece" },
};

export interface CondicionesParcela {
  estrategia: Estrategia;
  distancia: number;
  uso: number;
  fuego: boolean;
}

/** Fracción de semillas que llega según la distancia al bosque (ilustrativo: decae con la distancia). */
export function llegadaSemillas(distancia: number): number {
  return Math.exp(-Math.max(0, distancia - 100) / 600);
}

export interface EstadoParcela {
  suelo: number;
  riqueza: number;
  biomasa: number;
  composicion: number;
  /** Años de retraso antes de que despegue la sucesión. */
  retraso: number;
  semillas: number;
}

/** Estado de la parcela a los `t` años (fracciones 0–1 del bosque maduro de referencia). */
export function estadoParcela(c: CondicionesParcela, t: number): EstadoParcela {
  const u = clamp(c.uso / USO_MAX, 0, 1);
  const s0 = llegadaSemillas(c.distancia);
  const inicio = { suelo: 0.55 - 0.25 * u, riqueza: 0.03, biomasa: 0.01, composicion: 0.02 };
  if (c.estrategia === "ganado") return { ...inicio, retraso: 0, semillas: s0 };
  const semillas = c.estrategia === "activa" ? Math.max(s0, 0.85) : c.estrategia === "nucleacion" ? Math.max(s0, 0.55) : s0;
  // El pasto invasor y el suelo compactado retrasan el arranque; plantar lo acorta.
  const retraso = c.estrategia === "activa" ? 1 : c.estrategia === "nucleacion" ? 2 + 5 * u : 2 + 10 * u;
  const fuego = c.fuego ? 0.35 : 1;
  const velBio = (0.12 + 0.88 * semillas) * (1 - 0.35 * u) * fuego;
  const velSuelo = (c.estrategia === "activa" ? 1 : 1 - 0.3 * u) * fuego;
  // Una plantación de pocas especies no llega a la riqueza ni a la composición del bosque maduro.
  const topeRiq = c.estrategia === "activa" ? 0.85 : 1;
  const topeComp = c.estrategia === "activa" ? 0.8 : 1;
  const topeFuego = c.fuego ? 0.45 : 1;
  const curva = (a: Atributo, vel: number, desde: number, tope: number) => {
    const te = Math.max(0, t - retraso);
    return desde + (tope * topeFuego - desde) * (1 - Math.exp((-te * vel) / ATRIBUTO_DEF[a].tau));
  };
  return {
    suelo: curva("suelo", velSuelo, inicio.suelo, 1),
    riqueza: curva("riqueza", velBio, inicio.riqueza, topeRiq),
    biomasa: curva("biomasa", velBio, inicio.biomasa, 1),
    composicion: curva("composicion", velBio, inicio.composicion, topeComp),
    retraso,
    semillas,
  };
}

export type Etapa = "pastizal" | "matorral" | "acahual" | "bosque";

export const ETAPA_DEF: Record<Etapa, { etq: string; color: string; explica: string }> = {
  pastizal: { etq: "Pastizal", color: "#ca8a04", explica: "Dominan los pastos; casi no hay árboles." },
  matorral: { etq: "Matorral de pioneras", color: "#84cc16", explica: "Arbustos y árboles pioneros de crecimiento rápido que toleran el sol, como el guarumbo." },
  acahual: { etq: "Acahual (bosque joven)", color: "#22c55e", explica: "Vegetación secundaria con dosel cerrado: bajo su sombra germinan las especies del bosque maduro." },
  bosque: { etq: "Bosque secundario avanzado", color: "#15803d", explica: "Árboles grandes y especies de bosque maduro, aunque la composición todavía no es la original." },
};

/** Umbrales ilustrativos de biomasa para nombrar la etapa. */
export function etapaDe(biomasa: number): Etapa {
  return biomasa < 0.05 ? "pastizal" : biomasa < 0.25 ? "matorral" : biomasa < 0.7 ? "acahual" : "bosque";
}

/** Primer año (resolución 0.1) en que un atributo alcanza la fracción `f`; null si no la alcanza en 200 años. */
export function aniosHasta(c: CondicionesParcela, a: Atributo, f: number): number | null {
  for (let t = 0; t <= 200; t += 0.1) if (estadoParcela(c, t)[a] >= f) return Math.round(t * 10) / 10;
  return null;
}

export const PREDICCION_OPCIONES: { id: Atributo; etq: string }[] = [
  { id: "suelo", etq: "La fertilidad del suelo" },
  { id: "riqueza", etq: "La riqueza de especies" },
  { id: "biomasa", etq: "La biomasa de árboles" },
  { id: "composicion", etq: "La composición de especies" },
];

/* ════════════════════════════════════════════════════════════════════════
 * 3. CASOS DE MÉXICO (datos publicados)
 * ════════════════════════════════════════════════════════════════════════ */

export type CasoId = "vaquita" | "pulmo" | "monarca";

export interface HitoCaso {
  anio: string;
  texto: string;
  /** Instrumento de política o dato medido. */
  tipo: "politica" | "dato" | "amenaza";
  /** Valor medido en este hito, si lo hay. */
  valor: number | null;
  /** Cómo se escribe el valor (rangos, «no más de»…). */
  valorTxt?: string;
}

export interface Diagnostico {
  id: string;
  texto: string;
  correcto: boolean;
  porque: string;
}

export interface Caso {
  id: CasoId;
  etq: string;
  lugar: string;
  instrumentos: string;
  variable: string;
  unidad: string;
  hitos: HitoCaso[];
  pregunta: string;
  diagnosticos: Diagnostico[];
  leccion: string;
  fuente: string;
}

export const CASOS: Caso[] = [
  {
    id: "vaquita",
    etq: "Vaquita marina",
    lugar: "Alto Golfo de California (Baja California y Sonora)",
    instrumentos: "Veda, reserva de la biosfera, área de refugio, prohibición de redes",
    variable: "Vaquitas estimadas",
    unidad: "vaquitas",
    hitos: [
      { anio: "1975", tipo: "politica", valor: null, texto: "Se prohíbe la pesca de totoaba, un pez grande del Alto Golfo. Su vejiga natatoria se sigue vendiendo de contrabando en Asia a precios altísimos." },
      { anio: "1993", tipo: "politica", valor: null, texto: "Se decreta la Reserva de la Biosfera Alto Golfo de California y Delta del Río Colorado, hogar de la vaquita, la marsopa más pequeña del mundo y endémica de México." },
      { anio: "1997", tipo: "dato", valor: 567, texto: "Primer censo científico: unas 567 vaquitas (intervalo de 177 a 1,073). Muchas mueren enredadas en redes agalleras." },
      { anio: "2005", tipo: "politica", valor: null, texto: "Se establece el Área de Refugio para la Protección de la Vaquita, donde se prohíbe la pesca comercial en su hábitat central." },
      { anio: "2008", tipo: "dato", valor: 245, texto: "Segundo censo: unas 245 vaquitas, 57 % menos que en 1997." },
      { anio: "2015", tipo: "politica", valor: 59, texto: "Se suspenden por dos años las redes agalleras en toda su área, con compensación a pescadores y vigilancia de la Marina. El censo de ese año estima 59 vaquitas: la pesca ilegal de totoaba había vuelto." },
      { anio: "2016", tipo: "dato", valor: 30, texto: "El monitoreo acústico estima unas 30 vaquitas: entre 2011 y 2016 la población cayó cerca de 39 % por año." },
      { anio: "2017", tipo: "politica", valor: null, texto: "Se prohíben de forma permanente las redes de enmalle en el Alto Golfo. Las redes ilegales para totoaba siguen apareciendo." },
      { anio: "2018", tipo: "dato", valor: 19, valorTxt: "no más de 19", texto: "El análisis acústico concluye que quedaban no más de 19 vaquitas." },
      { anio: "2020", tipo: "politica", valor: null, texto: "Se delimita una Zona de Tolerancia Cero dentro del refugio, donde no se permite ninguna embarcación de pesca." },
      { anio: "2024", tipo: "dato", valor: 7, valorTxt: "6 a 8", texto: "El crucero de observación ve entre 6 y 8 vaquitas distintas (mínimo, en un área de búsqueda pequeña), una de ellas de un año." },
      { anio: "2025", tipo: "dato", valor: 10, valorTxt: "alrededor de 10", texto: "El crucero de 2025 reporta alrededor de 10 vaquitas y documenta crías: la especie podría estabilizarse si se mantiene el área libre de redes." },
    ],
    pregunta: "Hubo veda, reserva, refugio y prohibición de redes. ¿Por qué la vaquita siguió desplomándose?",
    diagnosticos: [
      { id: "a", texto: "Las redes ilegales para la totoaba siguieron dentro del refugio: los instrumentos existían, pero la vigilancia y las alternativas para los pescadores no alcanzaron.", correcto: true, porque: "Correcto. La causa directa es el enmallamiento en redes agalleras; un decreto sin cumplimiento real no protege. Por eso las leyes, por sí solas, no bastan." },
      { id: "b", texto: "Se quedó sin alimento porque el Golfo se calentó.", correcto: false, porque: "Los expertos del comité de recuperación señalan la muerte en redes agalleras como la causa del declive; su hábitat sigue siendo productivo y las vaquitas vistas lucen sanas." },
      { id: "c", texto: "Las áreas marinas protegidas nunca funcionan.", correcto: false, porque: "Sí funcionan cuando se cumplen: en Cabo Pulmo, dentro del mismo Golfo, la biomasa de peces se multiplicó. El problema aquí fue el incumplimiento." },
      { id: "d", texto: "Se decretaron demasiado tarde: en 1993 ya quedaban menos de 20 vaquitas.", correcto: false, porque: "En 1997 todavía había unas 567; la caída más fuerte ocurrió después, entre 2011 y 2016." },
    ],
    leccion: "Un área protegida que no se cumple es un «parque de papel». Conservar exige vigilancia, combatir el mercado ilegal y alternativas económicas para quienes viven del mar.",
    fuente: "NOAA Fisheries; Comité Internacional para la Recuperación de la Vaquita (CIRVA); cruceros de observación 2024 y 2025 (Sea Shepherd, IUCN-CSG).",
  },
  {
    id: "pulmo",
    etq: "Cabo Pulmo",
    lugar: "Baja California Sur, Golfo de California",
    instrumentos: "Parque nacional con zona de no pesca",
    variable: "Biomasa de peces en el arrecife",
    unidad: "t/ha",
    hitos: [
      { anio: "Antes de 1995", tipo: "amenaza", valor: null, texto: "La pesca intensa agota el arrecife. Los pescadores de la comunidad notan que cada año capturan menos." },
      { anio: "1995", tipo: "politica", valor: null, texto: "Se decreta el Parque Nacional Cabo Pulmo (7,111 ha, casi todo marino), impulsado por la propia comunidad y académicos. Los pescadores dejan de pescar en el arrecife." },
      { anio: "1999", tipo: "dato", valor: 0.75, texto: "Biomasa de peces en el parque: 0.75 toneladas por hectárea, parecida a la de las zonas abiertas a la pesca." },
      { anio: "2009", tipo: "dato", valor: 4.24, texto: "Biomasa: 4.24 t/ha, un aumento de 463 %. Los grandes depredadores (meros, pargos, tiburones) se multiplicaron 11 veces. En otras áreas del Golfo no hubo cambio significativo." },
      { anio: "Hoy", tipo: "politica", valor: null, texto: "Cabo Pulmo se considera una de las reservas marinas más exitosas del mundo. La comunidad vive del buceo y el ecoturismo, y defiende el parque ante desarrollos turísticos." },
    ],
    pregunta: "¿Qué explica que Cabo Pulmo se recuperara cuando otras áreas protegidas del Golfo no lo hicieron?",
    diagnosticos: [
      { id: "a", texto: "La comunidad pidió el parque y respetó la zona de no pesca: cambió la pesca por el turismo y ella misma vigila.", correcto: true, porque: "Correcto. Los autores atribuyen el éxito al tamaño de la zona sin pesca y al compromiso de la comunidad para hacerla cumplir." },
      { id: "b", texto: "Se liberaron peces criados en granjas.", correcto: false, porque: "No hubo repoblación artificial: los peces se recuperaron solos al quitar la presión de pesca." },
      { id: "c", texto: "El agua del sur del Golfo es más fría y hay más alimento.", correcto: false, porque: "Las zonas cercanas con aguas parecidas y abiertas a la pesca no cambiaron: la diferencia fue la protección cumplida." },
      { id: "d", texto: "El decreto por sí solo bastó, sin importar lo que hiciera la gente.", correcto: false, porque: "Otras áreas protegidas del Golfo con decreto no mostraron recuperación. Sin cumplimiento, el decreto no alcanza." },
    ],
    leccion: "Una zona de no pesca bien cumplida puede multiplicar la vida marina en una década. La participación de la comunidad hace la diferencia entre un decreto y una recuperación.",
    fuente: "Aburto-Oropeza et al. (2011), PLoS ONE 6(8): e23601; CONANP.",
  },
  {
    id: "monarca",
    etq: "Mariposa monarca",
    lugar: "Michoacán y Estado de México",
    instrumentos: "Reserva de la biosfera, Fondo Monarca, vigilancia comunitaria",
    variable: "Bosque ocupado por las colonias en invierno",
    unidad: "ha",
    hitos: [
      { anio: "1986", tipo: "politica", valor: null, texto: "Primer decreto de protección de los bosques de oyamel donde hibernan millones de mariposas monarca que llegan de Canadá y Estados Unidos." },
      { anio: "1996-97", tipo: "dato", valor: 18.19, texto: "Máximo histórico: las colonias ocupan 18.19 hectáreas de bosque." },
      { anio: "2000", tipo: "politica", valor: null, texto: "Se decreta la Reserva de la Biosfera Mariposa Monarca (56,259 ha, con 13,552 ha de zona núcleo) y se crea un fondo que paga a los ejidos y comunidades de la zona núcleo por no aprovechar su madera." },
      { anio: "2001-2012", tipo: "amenaza", valor: null, texto: "La tala ilegal afecta 2,057 hectáreas de la zona núcleo. Vigilancia comunitaria, operativos y apoyos la van reduciendo." },
      { anio: "2013-14", tipo: "dato", valor: 0.67, texto: "Mínimo histórico: 0.67 ha. Se asocia sobre todo a la pérdida de algodoncillo (la planta de la que se alimentan sus orugas) por herbicidas en Estados Unidos y al clima." },
      { anio: "2018-19", tipo: "dato", valor: 6.05, texto: "6.05 ha, la mayor superficie en más de una década, tras un buen año de reproducción en Norteamérica." },
      { anio: "2023-24", tipo: "dato", valor: 0.9, texto: "0.90 ha, la segunda más baja registrada, por sequía y calor en la ruta migratoria. Ese año la tala ilegal en la zona núcleo fue de solo 2.51 ha (13.94 ha en 2020-21)." },
      { anio: "2024-25", tipo: "dato", valor: 1.79, texto: "1.79 ha (+99 %), con condiciones de clima más favorables durante la migración." },
      { anio: "2025-26", tipo: "dato", valor: 2.93, texto: "2.93 ha (+64 %), todavía muy por debajo de los máximos de los años noventa." },
    ],
    pregunta: "La tala ilegal en la zona núcleo casi desapareció. ¿Por qué las colonias siguen muy por debajo de 1996-97?",
    diagnosticos: [
      { id: "a", texto: "Las amenazas principales están fuera de México: pérdida de algodoncillo, cambio de uso de suelo y clima en la ruta migratoria. Proteger el bosque es necesario, pero no suficiente.", correcto: true, porque: "Correcto. Una especie migratoria depende de tres países: la reserva protege su invierno, pero su reproducción ocurre en Estados Unidos y Canadá." },
      { id: "b", texto: "La reserva fracasó: siguen talando la zona núcleo como antes.", correcto: false, porque: "Los datos muestran lo contrario: la tala ilegal bajó a unas cuantas hectáreas por temporada." },
      { id: "c", texto: "Las mariposas dejaron de migrar a México.", correcto: false, porque: "Siguen llegando cada invierno; lo que cambia es cuántas, y la superficie que ocupan sube y baja de un año a otro." },
      { id: "d", texto: "Los turistas espantan a las mariposas y por eso no se juntan.", correcto: false, porque: "El turismo se regula en los santuarios; las grandes caídas coinciden con problemas en su reproducción y su migración." },
    ],
    leccion: "Conservar una especie migratoria requiere acuerdos entre países. Además, el éxito contra la tala se logró combinando decreto, pagos a los dueños del bosque y vigilancia comunitaria.",
    fuente: "WWF México y CONANP, monitoreo de colonias 2024-2025 y 2025-2026; WWF, monitoreo de tala en la zona núcleo.",
  },
];

/** Último valor medido hasta el hito `k` (incluido), o el primero que exista si aún no hay. */
export function valorHasta(c: Caso, k: number): { valor: number; txt: string; medido: boolean; anio: string; actual: boolean } {
  const kk = Math.min(k, c.hitos.length - 1);
  for (let j = kk; j >= 0; j--) {
    const h = c.hitos[j]!;
    if (h.valor !== null) return { valor: h.valor, txt: h.valorTxt ?? num(h.valor, c.id === "vaquita" ? 0 : 2), medido: true, anio: h.anio, actual: j === kk };
  }
  const primero = c.hitos.find((h) => h.valor !== null)!;
  return { valor: primero.valor!, txt: "sin medición todavía", medido: false, anio: primero.anio, actual: false };
}

/** Texto del valor para el hito `k`: el medido en ese hito o la última medición con su fecha. */
export function textoValor(c: Caso, k: number): string {
  const v = valorHasta(c, k);
  if (!v.medido) return "sin medición todavía";
  return v.actual ? `${v.txt} ${c.unidad}` : `última medición ${v.anio}: ${v.txt} ${c.unidad}`;
}

/* ════════════════════════════════════════════════════════════════════════
 * Estrellas: contrarreloj «¿Qué instrumento usarías?» (inspirado en A10)
 * ════════════════════════════════════════════════════════════════════════ */

export const SEGUNDOS_POR_SITUACION = 15;

export const SITUACIONES: { texto: string; correcto: InstrumentoId; porque: string }[] = [
  { texto: "Un ejido de Oaxaca ya cuida su bosque y quiere que se reconozca oficialmente, sin que nadie le imponga un decreto.", correcto: "advc", porque: "La certificación voluntaria reconoce la decisión del dueño sin expropiar ni imponer." },
  { texto: "El bosque que da agua a una ciudad está por convertirse en huertas; los dueños necesitan un ingreso para no desmontar.", correcto: "psa", porque: "El pago por servicios hidrológicos compensa a los dueños por mantener el bosque que recarga el agua." },
  { texto: "Un potrero abandonado está a 100 m de una selva llena de aves y murciélagos que dispersan semillas.", correcto: "pasiva", porque: "Con la fuente de semillas tan cerca, basta con quitar el ganado y el fuego." },
  { texto: "Un terreno sin suelo fértil, cubierto de pasto invasor y a varios kilómetros del bosque más cercano.", correcto: "activa", porque: "Lejos de la fuente de semillas y con el suelo degradado, el ecosistema no se recupera solo: hay que plantar." },
  { texto: "Dos reservas de selva quedaron separadas por cultivos y los jaguares ya no pueden pasar de una a otra.", correcto: "corredor", porque: "Un corredor une las áreas aisladas para el movimiento de especies y el flujo genético." },
  { texto: "Un rancho del norte quiere aprovechar el venado cola blanca de forma legal y sin acabar con él.", correcto: "uma", porque: "Una UMA permite el aprovechamiento con un plan de manejo y tasas autorizadas." },
  { texto: "El camarón se captura en plena temporada de reproducción y las capturas caen cada año.", correcto: "veda", porque: "Una veda suspende la captura durante la reproducción para que la población se renueve." },
  { texto: "Un arrecife con especies en peligro necesita una zona núcleo sin pesca con respaldo de un decreto federal.", correcto: "anp", porque: "Solo un decreto de Área Natural Protegida crea una zona núcleo con protección legal federal." },
  { texto: "Una isla deshabitada con aves marinas que no existen en ningún otro lugar necesita protección estricta y permanente.", correcto: "anp", porque: "Para proteger de forma estricta y permanente un sitio único se decreta un Área Natural Protegida." },
  { texto: "Una comunidad cafetalera tiene bosque de niebla sobre sus manantiales y recibe ofertas para talarlo.", correcto: "psa", porque: "El pago por servicios ambientales le da a la comunidad un ingreso por conservar el bosque que protege sus manantiales." },
];

export function rondaSituaciones(rnd: () => number, n = 6): { idx: number; opciones: InstrumentoId[] }[] {
  const idx = SITUACIONES.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [idx[i], idx[j]] = [idx[j]!, idx[i]!];
  }
  return idx.slice(0, n).map((k) => {
    const s = SITUACIONES[k]!;
    const otros = INSTRUMENTOS_LISTA.filter((x) => x !== s.correcto);
    for (let i = otros.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [otros[i], otros[j]] = [otros[j]!, otros[i]!];
    }
    const opciones = [s.correcto, ...otros.slice(0, 3)];
    for (let i = opciones.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [opciones[i], opciones[j]] = [opciones[j]!, opciones[i]!];
    }
    return { idx: k, opciones };
  });
}

export function estrellasPorErrores(errores: number): number {
  return errores === 0 ? 3 : errores <= 2 ? 2 : 1;
}

/* ════════════════════════════════════════════════════════════════════════
 * Contenido VERBATIM
 * ════════════════════════════════════════════════════════════════════════ */

export const TITULO_A1 = "Políticas de conservación en México: ANP, LGEEPA y convenios";

/** Lectura A1 — cinco párrafos, verbatim. */
export const LECTURA_A1: string[] = [
  "México no solo es uno de los países más biodiversos del mundo; también cuenta con un marco legal e institucional de conservación que combina instrumentos nacionales, acuerdos internacionales y el papel fundamental de las comunidades locales e indígenas.",
  "Las Áreas Naturales Protegidas (ANP) son el instrumento más importante. México cuenta con más de 182 ANP que cubren cerca de 90 millones de hectáreas sumando la superficie terrestre y las grandes áreas marinas (en conjunto, ~17% del territorio nacional y aguas jurisdiccionales); la porción estrictamente terrestre protegida es de alrededor de 23 millones de hectáreas (~11.6% del territorio nacional). Se dividen en categorías: Reservas de Biosfera (las de mayor restricción), Parques Nacionales, Monumentos Naturales, Áreas de Protección de Flora y Fauna, Santuarios y Zonas de Restauración Ecológica.",
  "El marco legal principal es la Ley General del Equilibrio Ecológico y la Protección al Ambiente (LGEEPA, 1988), que regula la protección del ambiente, el uso racional de recursos naturales, la preservación de ecosistemas y la participación ciudadana. Instituciones como la SEMARNAT, la CONANP y la PROFEPA administran y vigilan su aplicación.",
  "En el plano internacional, México es parte del Convenio sobre la Diversidad Biológica (CDB, 1992), que establece compromisos para conservar la biodiversidad, usar sosteniblemente sus componentes y distribuir equitativamente sus beneficios. También suscribió las Metas de Kunming-Montreal (2022): proteger el 30% de la superficie terrestre y marina para 2030.",
  "Un pilar muchas veces ignorado es el papel de las comunidades indígenas y rurales. En México, más del 80% de la biodiversidad silvestre se encuentra en tierras de uso común (ejidos y comunidades). Los sistemas de conocimiento ecológico tradicional han conservado ecosistemas durante siglos; la conservación comunitaria (como la certificación de predios como UMAFOR o ADVC) ha demostrado ser tan efectiva o más que las ANP formales en algunos contextos.",
];

/** Nota de actualización (no verbatim). */
export const NOTA_A1 =
  "Actualización (CONANP, 2025): hoy son 232 ANP federales con más de 99 millones de hectáreas: 23.1 millones terrestres (11.76 % de la superficie terrestre) y 74.9 millones marinas (23.78 % de la superficie marina).";

/** Preguntas de comprensión de la lectura A1 — verbatim. */
export const PREGUNTAS: string[] = [
  "¿Qué son las Áreas Naturales Protegidas y cuánto territorio cubre México con ellas?",
  "¿Qué establece el Convenio sobre la Diversidad Biológica (CDB)?",
  "¿Por qué el papel de las comunidades indígenas es clave para la conservación en México?",
];

/** Reflexión final de la autoevaluación A7 — verbatim. */
export const REFLEXION_A7 = "¿Por qué las leyes ambientales por sí solas no son suficientes para conservar la biodiversidad? ¿Qué otros factores son necesarios?";

/** Hechos: quiz A4 (verdadero/falso), cada enunciado con su retroalimentación verbatim. */
export const HECHOS: string[] = [
  "Verdadero: «Las Áreas Naturales Protegidas (ANP) en México son gestionadas principalmente por la CONANP.» Correcto: la Comisión Nacional de Áreas Naturales Protegidas (CONANP) administra las ANP federales de México.",
  "Verdadero: «La Ley General del Equilibrio Ecológico y la Protección al Ambiente (LGEEPA) es el principal instrumento jurídico ambiental federal de México.» Sí: la LGEEPA (1988) establece las bases para la preservación del medio ambiente y el aprovechamiento sustentable de los recursos naturales en México.",
  "Falso: «Una reserva de la biosfera es una categoría de ANP donde se prohíbe absolutamente cualquier actividad humana en toda su extensión.» Las reservas de la biosfera tienen zonas núcleo de protección estricta, pero también zonas de amortiguamiento y de transición donde se permiten actividades sustentables y habitación humana.",
  "Verdadero: «La restauración ecológica busca recuperar la estructura, composición y función de un ecosistema degradado.» Correcto: la restauración va más allá de la conservación pasiva; implica intervenciones activas para restablecer procesos ecológicos.",
  "Falso: «México no cuenta con corredores biológicos porque toda la conservación se realiza en ANP aisladas.» México ha establecido estrategias de conectividad biológica (corredores) para unir áreas protegidas y permitir el flujo de especies entre ellas.",
];

/** Glosario A5 — verbatim. */
export const GLOSARIO: { termino: string; definicion: string; ejemplo: string }[] = [
  { termino: "Área Natural Protegida (ANP)", definicion: "Zona del territorio nacional con características relevantes que el Estado protege y maneja para conservar la biodiversidad y los servicios ecosistémicos.", ejemplo: "La Reserva de la Biosfera Calakmul, en Campeche, es una de las ANP más grandes de México." },
  { termino: "CONANP", definicion: "Comisión Nacional de Áreas Naturales Protegidas; organismo federal encargado de administrar y conservar las ANP de México.", ejemplo: "La CONANP gestiona más de 180 ANP que cubren cerca del 11 % del territorio nacional." },
  { termino: "LGEEPA", definicion: "Ley General del Equilibrio Ecológico y la Protección al Ambiente; principal marco jurídico ambiental federal de México (1988).", ejemplo: "La LGEEPA define las categorías de ANP y regula las actividades que pueden realizarse en ellas." },
  { termino: "Reserva de la biosfera", definicion: "Categoría de ANP con zonas núcleo (protección estricta), amortiguamiento y transición; designadas por la UNESCO dentro del programa MAB.", ejemplo: "La Reserva de la Biosfera El Vizcaíno, en Baja California Sur, protege ballenas grises y lobos marinos." },
  { termino: "Corredor biológico", definicion: "Zona de conectividad que une áreas protegidas aisladas para permitir el movimiento de especies y el flujo genético.", ejemplo: "El Corredor Biológico Mesoamericano conecta áreas protegidas desde México hasta Panamá." },
  { termino: "Restauración ecológica", definicion: "Proceso de asistir la recuperación de un ecosistema degradado, dañado o destruido para restablecer su estructura, composición y función.", ejemplo: "La reforestación con especies nativas en cuencas hidrográficas es una forma de restauración ecológica." },
];

export const ACTIVIDAD_A5 = "Investiga una ANP de tu estado o región de México: identifica su categoría, los ecosistemas que protege y las principales amenazas que enfrenta.";

export const FUENTE =
  "CEN Bachillerato — CNEYT-III, progresión 11: lectura A1 (Material elaborado para CEN Bachillerato), quiz A2, quiz A4, glosario A5, texto A6, autoevaluación A7 y reto A10 (códigos CNEYT-III-P07).";

export const PROBLEMA =
  "México tiene leyes, áreas protegidas y programas de pago para conservar. Pero el presupuesto no alcanza para todo y un mismo instrumento puede funcionar en un lugar y fracasar en otro. En este laboratorio diseñas un plan para una cuenca, restauras una parcela año por año y diagnosticas qué funcionó —y qué no— en tres casos reales de México.";

export const INSTRUCCIONES: string[] = [
  "En Plan de conservación, toca una zona del mapa, lee su situación y asígnale un instrumento sin pasarte del presupuesto. Después simula 30 años y revisa las tres metas.",
  "En Restaurar una parcela, predice qué se recupera primero, elige la técnica, la distancia al bosque, los años de uso previo y el fuego, y deja correr hasta 60 años.",
  "En Casos de México, recorre la línea de tiempo de cada caso y elige el diagnóstico que explica los datos.",
  "Juega el contrarreloj «¿Qué instrumento usarías?» para ganar estrellas y resuelve el quiz A2 y el texto A6.",
];

export const IDEAS: string[] = [
  "Conservar es mantener lo que aún está en buen estado; restaurar es asistir la recuperación de lo que ya se degradó.",
  "Ningún instrumento sirve para todo: el PSA rinde más donde la amenaza es alta (adicionalidad) y la ADVC donde el dueño ya quiere conservar.",
  "Un decreto sin participación ni vigilancia puede quedarse en «parque de papel», como mostró la vaquita marina.",
  "Cerca de bosque maduro, la regeneración natural es barata y eficaz; lejos de la fuente de semillas o con el suelo degradado, hace falta restauración activa.",
  "En la sucesión, el suelo y la riqueza de especies se recuperan en años o décadas; la biomasa y, sobre todo, la composición del bosque maduro tardan mucho más.",
  "Los corredores biológicos unen fragmentos: sin conectividad, las poblaciones aisladas se vuelven pequeñas y vulnerables.",
  "Las especies migratorias, como la monarca, necesitan acuerdos entre países además de áreas protegidas.",
];

/** Quiz A2 «¿Verdadero o falso? Conservación en México» — verbatim. */
export const QUIZ_A2: QuizEvaluable = {
  titulo: "¿Verdadero o falso? Conservación en México",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "La LGEEPA es la ley federal que regula el equilibrio ecológico y la protección ambiental en México desde 1988.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion: "Correcto. La Ley General del Equilibrio Ecológico y la Protección al Ambiente (LGEEPA) es el principal instrumento jurídico ambiental de México, que norma la protección de ecosistemas, el uso racional de recursos y la participación ciudadana.",
    },
    {
      enunciado: "Las Reservas de Biosfera en México permiten cualquier tipo de actividad económica dentro de su perímetro total.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 1,
      retroalimentacion: "Las Reservas de Biosfera tienen zonas diferenciadas: una zona núcleo (máxima protección, sin actividades extractivas) y zonas de amortiguamiento donde se permiten actividades sostenibles controladas. No todo es libre.",
    },
    {
      enunciado: "Más del 80% de la biodiversidad silvestre de México se encuentra en tierras de ejidos y comunidades agrarias, no solo en ANP.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion: "Correcto. Esto significa que la conservación de la biodiversidad en México depende en gran medida del manejo que hacen las comunidades locales e indígenas de sus tierras, no solo de las áreas protegidas formales.",
    },
    {
      enunciado: "México no ha firmado ningún tratado internacional relacionado con la biodiversidad.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 1,
      retroalimentacion: "México es parte del Convenio sobre la Diversidad Biológica (CDB, 1992), del Protocolo de Nagoya sobre acceso y distribución de beneficios, del Acuerdo de París sobre cambio climático y de las Metas de Kunming-Montreal (2022), entre otros.",
    },
    {
      enunciado: "Las Metas de Kunming-Montreal (2022) proponen proteger el 30% de la superficie terrestre y marina del planeta para el año 2030.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion: "Correcto. El acuerdo conocido como '30x30' fue adoptado en la COP15 de biodiversidad en Montreal. México firmó este acuerdo como parte de sus compromisos con el Convenio de Diversidad Biológica.",
    },
    {
      enunciado: "La CONANP (Comisión Nacional de Áreas Naturales Protegidas) es la institución encargada de administrar las ANP en México.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion: "Correcto. La CONANP es el órgano desconcentrado de la SEMARNAT responsable de administrar y vigilar las Áreas Naturales Protegidas federales de México.",
    },
  ],
};

/** Actividad A6 «Rellena los huecos — Conservación y legislación en México» — verbatim. */
export const HUECOS_A6: TextoHuecosData = {
  ancla: "CNEYT-III-P07-A6 · Rellena los huecos — Conservación y legislación en México",
  instrucciones: "Completa los cuatro huecos con el nombre o término correcto.",
  partes: [
    "La ",
    " es el principal marco jurídico ambiental federal de México que regula las áreas protegidas y el aprovechamiento de recursos. La ",
    " administra las Áreas Naturales Protegidas federales del país. Una reserva de la biosfera tiene zonas ",
    " de protección estricta donde se limitan las actividades humanas. Los corredores biológicos permiten la ",
    " entre poblaciones de distintas áreas protegidas.",
  ],
  huecos: [
    { respuesta: "LGEEPA", alternativas: ["lgeepa"], pista: "Siglas de la Ley General del Equilibrio Ecológico y la Protección al Ambiente." },
    { respuesta: "CONANP", alternativas: ["conanp"], pista: "Comisión Nacional de Áreas Naturales Protegidas." },
    { respuesta: "núcleo", alternativas: ["nucleo", "de núcleo"], pista: "Tipo de zona de una reserva de la biosfera con el mayor nivel de protección." },
    { respuesta: "conectividad", alternativas: ["conexión", "flujo genético"], pista: "Función de los corredores biológicos: permitir el movimiento y el intercambio genético entre poblaciones." },
  ],
};
