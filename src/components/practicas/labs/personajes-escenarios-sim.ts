/**
 * Simulador del laboratorio «Personajes y escenarios» (LC-II-P04).
 *
 * El alumno es el autor de una escena: elige cómo es el personaje (rasgo),
 * qué lo mueve (motivación), dónde está (escenario) y qué hace (acción). La
 * escena que se escribe sola cambia con cada decisión. Todo es determinista:
 * tablas pequeñas y comentadas, sin azar.
 *
 * El personaje (Marisol) y sus situaciones son FICTICIOS. Las ideas que se
 * enseñan salen de las definiciones de la progresión: la caracterización
 * (rasgos y conducta) y el escenario como lo que moldea el comportamiento.
 */

export type Rasgo = "valiente" | "cauteloso" | "ambicioso";
export type Motivo = "proteger" | "verdad" | "prestigio";
export type Accion = "enfrentar" | "observar" | "aprovechar";
export type Ambiente = "mercado" | "bosque" | "hacienda";

export const NOMBRE = "Marisol";

export const RASGOS: { id: Rasgo; label: string; icono: string; clave: string; frase: string }[] = [
  { id: "valiente", label: "Valiente", icono: "fa-shield-halved", clave: "retrato-valiente", frase: "no se echa para atrás ante el peligro" },
  { id: "cauteloso", label: "Cauteloso", icono: "fa-eye", clave: "retrato-cauteloso", frase: "mide cada paso antes de actuar" },
  { id: "ambicioso", label: "Ambicioso", icono: "fa-arrow-up-right-dots", clave: "retrato-ambicioso", frase: "siempre busca subir un escalón más" },
];

export const MOTIVOS: { id: Motivo; label: string; icono: string; frase: string }[] = [
  { id: "proteger", label: "Proteger a los suyos", icono: "fa-people-roof", frase: "Lo que la mueve es proteger a los suyos." },
  { id: "verdad", label: "Descubrir la verdad", icono: "fa-magnifying-glass", frase: "Lo que la mueve es descubrir la verdad." },
  { id: "prestigio", label: "Ganar prestigio", icono: "fa-trophy", frase: "Lo que la mueve es ganar prestigio." },
];

export const ACCIONES: { id: Accion; label: string; icono: string }[] = [
  { id: "enfrentar", label: "Enfrentar", icono: "fa-hand-fist" },
  { id: "observar", label: "Observar y esperar", icono: "fa-hourglass-half" },
  { id: "aprovechar", label: "Aprovechar la situación", icono: "fa-handshake" },
];

export const AMBIENTES: { id: Ambiente; label: string; tipo: string; icono: string; clave: string; aporta: string }[] = [
  { id: "mercado", label: "Mercado de hoy", tipo: "Realista", icono: "fa-store", clave: "mercado-actual", aporta: "Gente, ruido y testigos: todo es verosímil y cualquiera puede ver lo que haces." },
  { id: "bosque", label: "Bosque encantado", tipo: "Fantástico", icono: "fa-tree", clave: "bosque-encantado", aporta: "Las reglas del mundo son otras: lo sobrenatural abre salidas y también cobra precios." },
  { id: "hacienda", label: "Hacienda del siglo XIX", tipo: "Histórico", icono: "fa-landmark", clave: "hacienda-siglo-xix", aporta: "La época impone jerarquías reales: limita lo que un personaje puede hacer sin consecuencias." },
];

/** 0 = fuera de carácter · 1 = posible, pide un cambio visible · 2 = natural. */
const RASGO_ACCION: Record<Rasgo, Record<Accion, number>> = {
  valiente: { enfrentar: 2, observar: 1, aprovechar: 1 },
  cauteloso: { enfrentar: 0, observar: 2, aprovechar: 1 },
  ambicioso: { enfrentar: 1, observar: 1, aprovechar: 2 },
};
const RASGO_MOTIVO: Record<Rasgo, Record<Motivo, number>> = {
  valiente: { proteger: 2, verdad: 1, prestigio: 1 },
  cauteloso: { proteger: 1, verdad: 2, prestigio: 0 },
  ambicioso: { proteger: 0, verdad: 1, prestigio: 2 },
};
const MOTIVO_ACCION: Record<Motivo, Record<Accion, number>> = {
  proteger: { enfrentar: 2, observar: 1, aprovechar: 0 },
  verdad: { enfrentar: 1, observar: 2, aprovechar: 1 },
  prestigio: { enfrentar: 1, observar: 0, aprovechar: 2 },
};

/** Tensión de la trama (1-5) según DÓNDE ocurre lo que el personaje hace. */
const TENSION: Record<Ambiente, Record<Accion, number>> = {
  mercado: { enfrentar: 4, observar: 2, aprovechar: 3 },
  bosque: { enfrentar: 5, observar: 3, aprovechar: 4 },
  hacienda: { enfrentar: 5, observar: 2, aprovechar: 3 },
};

/** Lo que pasa en la escena: la acción cambia de sentido según el escenario. */
const CONSECUENCIA: Record<Ambiente, Record<Accion, string>> = {
  mercado: {
    enfrentar: "Planta cara a la vendedora que engaña a la gente; los puestos se callan, la discusión sube y todos la miran.",
    observar: "Se queda junto a un puesto de frutas y escucha los regateos; entre el ruido nadie nota que lo anota todo.",
    aprovechar: "Nota que el mercado está lleno y los vendedores distraídos; usa la multitud para pasar sin ser vista.",
  },
  bosque: {
    enfrentar: "Se planta ante el árbol que habla y le exige respuestas; las raíces se mueven y el bosque se cierra tras ella.",
    observar: "Se detiene entre los árboles que susurran y descubre que sus voces repiten lo que ella piensa.",
    aprovechar: "Pacta con la criatura del bosque a cambio de un favor; el trato abre el camino, pero tiene un precio.",
  },
  hacienda: {
    enfrentar: "Reclama al capataz frente a los peones; en una hacienda de la época, desafiar al patrón tiene consecuencias graves.",
    observar: "Escucha desde la cocina las órdenes del patrón y aprende cómo se reparte el poder en la hacienda.",
    aprovechar: "Se gana la confianza del administrador; en la jerarquía de la hacienda, quien tiene su favor tiene acceso.",
  },
};

export interface Seleccion {
  rasgo: Rasgo;
  motivo: Motivo;
  accion: Accion;
  ambiente: Ambiente;
}

/** Arranca con un personaje fuera de carácter: el alumno lo descubre y lo corrige. */
export const INICIAL: Seleccion = { rasgo: "cauteloso", motivo: "prestigio", accion: "enfrentar", ambiente: "mercado" };

function nom<T extends { id: string; label: string }>(l: T[], id: string): string {
  return (l.find((x) => x.id === id)?.label ?? id).toLowerCase();
}

export interface Linea {
  nivel: 0 | 1 | 2;
  txt: string;
}

function linea(nivel: number, a: string, b: string): Linea {
  if (nivel >= 2) return { nivel: 2, txt: `${a} + ${b}: encaja, el lector lo cree.` };
  if (nivel === 1) return { nivel: 1, txt: `${a} + ${b}: es posible, pero hay que mostrar un cambio en ella.` };
  return { nivel: 0, txt: `${a} + ${b}: choca con su carácter; sin una razón, el lector no lo cree.` };
}

export interface Escena {
  /** 0-100: qué tanto actúa como el personaje que construiste. */
  coherencia: number;
  /** 1-5: qué tanta presión pone el escenario a esa acción. */
  tension: number;
  texto: string;
  lineas: Linea[];
  aporta: string;
}

const MAX_PUNTOS = 8;

export function coherenciaDe(s: Seleccion): number {
  const pts = RASGO_ACCION[s.rasgo][s.accion] * 2 + RASGO_MOTIVO[s.rasgo][s.motivo] + MOTIVO_ACCION[s.motivo][s.accion];
  return Math.round((pts / MAX_PUNTOS) * 100);
}

export function tensionDe(ambiente: Ambiente, accion: Accion): number {
  return TENSION[ambiente][accion];
}

export function escenaDe(s: Seleccion): Escena {
  const r = RASGOS.find((x) => x.id === s.rasgo)!;
  const m = MOTIVOS.find((x) => x.id === s.motivo)!;
  const amb = AMBIENTES.find((x) => x.id === s.ambiente)!;
  const rl = nom(RASGOS, s.rasgo);
  const ml = nom(MOTIVOS, s.motivo);
  const al = nom(ACCIONES, s.accion);
  return {
    coherencia: coherenciaDe(s),
    tension: tensionDe(s.ambiente, s.accion),
    texto: `${NOMBRE} ${r.frase}. ${m.frase} ${CONSECUENCIA[s.ambiente][s.accion]}`,
    lineas: [
      linea(RASGO_ACCION[s.rasgo][s.accion], rl, al),
      linea(RASGO_MOTIVO[s.rasgo][s.motivo], rl, ml),
      linea(MOTIVO_ACCION[s.motivo][s.accion], ml, al),
    ],
    aporta: amb.aporta,
  };
}

export const UMBRAL_COHERENTE = 75;
