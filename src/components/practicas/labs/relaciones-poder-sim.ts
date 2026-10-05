/**
 * Modelo del SIMULADOR de relaciones de poder (lab «relaciones-poder»).
 *
 * TODO es ficticio: el municipio «Valle Sereno», la empresa, la radio, la
 * comunidad y las cifras son valores de simulación para aprender a leer el poder;
 * no describen a ninguna persona ni lugar real.
 *
 * El modelo es DETERMINISTA y se puede seguir con lápiz:
 *   poder de un actor   = Σ (recurso de cada fuente × peso de la fuente)
 *   poder de un bloque  = Σ poder de sus actores + modificadores de acciones
 *                         + sinergia de las alianzas con AMBOS extremos en el bloque
 *   hegemonía           = el bloque con más «relato» (≥ 2 puntos de ventaja) suma 10 %
 *   balance             = poder de la coalición / (coalición + contrapartes)
 *                         = «probabilidad de imponer la voluntad» (Weber)
 *
 * Las 5 fuentes de poder salen de las definiciones del propio laboratorio:
 * poder (Weber), capital económico/clase, capital social y cultural (Bourdieu)
 * y hegemonía.
 */

import type { Categoria } from "./relaciones-poder-data";

export type Fuente = "autoridad" | "dinero" | "redes" | "saber" | "relato";
export type Bando = "coal" | "contra" | "neutral";

export const FUENTES: { id: Fuente; nombre: string; icono: string; peso: number; def: string }[] = [
  { id: "autoridad", nombre: "Autoridad", icono: "fa-gavel", peso: 1.5, def: "Poder (Weber): la probabilidad de imponer la propia voluntad dentro de una relación social, incluso contra la resistencia de otros." },
  { id: "dinero", nombre: "Dinero", icono: "fa-coins", peso: 1.2, def: "Recursos económicos: el nivel socioeconómico o clase social permite financiar, contratar y esperar más tiempo." },
  { id: "redes", nombre: "Redes", icono: "fa-people-arrows", peso: 1, def: "Capital social (Bourdieu): las redes de relaciones y contactos que permiten acceder a recursos e información." },
  { id: "saber", nombre: "Saber", icono: "fa-graduation-cap", peso: 1, def: "Capital cultural (Bourdieu): conocimientos, habilidades, títulos educativos y disposiciones que facilitan el acceso a posiciones privilegiadas." },
  { id: "relato", nombre: "Relato", icono: "fa-bullhorn", peso: 1, def: "Hegemonía: dominio o liderazgo que se sostiene mediante consensos, no solo por la fuerza; ideas que se vuelven «de sentido común»." },
];

export const PESO: Record<Fuente, number> = Object.fromEntries(FUENTES.map((f) => [f.id, f.peso])) as Record<Fuente, number>;

export interface Actor {
  id: string;
  nombre: string;
  corto: string;
  icono: string;
  foto: string;
  /** Posición en el mapa, en % del ancho y del alto. */
  x: number;
  y: number;
  recursos: Record<Fuente, number>;
  dominante: Fuente;
  bando: Bando;
  cruces: Categoria[];
  rol: string;
  porque: string;
}

export const ACTORES: Actor[] = [
  {
    id: "ayuntamiento", nombre: "Ayuntamiento de Valle Sereno", corto: "Ayuntamiento", icono: "fa-landmark", foto: "ayuntamiento",
    x: 58, y: 13, recursos: { autoridad: 5, dinero: 3, redes: 3, saber: 2, relato: 3 }, dominante: "autoridad", bando: "contra", cruces: [],
    rol: "Propone entregar el servicio de agua a una empresa para «ahorrar» y votará en cabildo.",
    porque: "Puede decidir y hacerse obedecer con leyes, reglamentos y policía municipal: es poder en el sentido de Weber.",
  },
  {
    id: "empresa", nombre: "Aguas Cristal del Centro (empresa)", corto: "Empresa", icono: "fa-industry", foto: "empresa",
    x: 84, y: 40, recursos: { autoridad: 1, dinero: 5, redes: 4, saber: 3, relato: 3 }, dominante: "dinero", bando: "contra", cruces: [],
    rol: "Quiere la concesión: ofrece inversión, contratos y publicidad.",
    porque: "Su ventaja es económica: puede pagar obras, abogados y campañas y esperar más tiempo que cualquier vecino.",
  },
  {
    id: "medios", nombre: "Radio Valle", corto: "Radio Valle", icono: "fa-radio", foto: "radio",
    x: 72, y: 74, recursos: { autoridad: 0, dinero: 2, redes: 3, saber: 2, relato: 5 }, dominante: "relato", bando: "contra", cruces: [],
    rol: "La estación más escuchada; hoy repite que «concesionar es lo modernizador» porque la empresa compra su publicidad.",
    porque: "Decide qué se vuelve «sentido común» en el valle: poder por consenso (hegemonía), sin necesidad de fuerza.",
  },
  {
    id: "instituto", nombre: "Instituto Técnico del Valle", corto: "Instituto", icono: "fa-flask", foto: "instituto",
    x: 45, y: 41, recursos: { autoridad: 1, dinero: 2, redes: 2, saber: 5, relato: 2 }, dominante: "saber", bando: "neutral", cruces: [],
    rol: "Tiene hidrólogos y laboratorio; nadie le ha pedido medir el acuífero.",
    porque: "Su peso viene de títulos, métodos y datos: capital cultural. Sin datos propios, nadie le cree a nadie.",
  },
  {
    id: "comite", nombre: "Comité de la colonia Los Pinos", corto: "Comité", icono: "fa-house-chimney", foto: "colonia",
    x: 16, y: 13, recursos: { autoridad: 0, dinero: 1, redes: 3, saber: 1, relato: 1 }, dominante: "redes", bando: "coal", cruces: ["clase", "edad"],
    rol: "Vecinos de una colonia popular, muchos adultos mayores, que reciben el agua en pipa; temen que suban las tarifas.",
    porque: "Tienen poco dinero y casi ningún cargo; lo que sí tienen son vecinos que se conocen y se organizan: capital social.",
  },
  {
    id: "comunidad", nombre: "Comunidad de Tlalmayo", corto: "Tlalmayo", icono: "fa-mountain", foto: "manantial",
    x: 15, y: 47, recursos: { autoridad: 1, dinero: 0, redes: 3, saber: 4, relato: 1 }, dominante: "saber", bando: "neutral", cruces: ["etnia", "clase"],
    rol: "Pueblo indígena río arriba, cuidador del manantial desde hace generaciones; nadie la invitó a la asamblea.",
    porque: "Conoce el caudal, las estaciones y el manantial por generaciones: conocimientos que son capital cultural aunque no tengan título.",
  },
  {
    id: "colectivo", nombre: "Colectivo Aguadoras", corto: "Colectivo", icono: "fa-hands-holding-circle", foto: "mujeres",
    x: 32, y: 80, recursos: { autoridad: 0, dinero: 1, redes: 4, saber: 2, relato: 2 }, dominante: "redes", bando: "neutral", cruces: ["genero", "clase"],
    rol: "Mujeres que acarrean y cuidan el agua del hogar; sostienen el cuidado que la economía no cuenta.",
    porque: "Su fuerza está en la confianza y los contactos entre familias de varias colonias: capital social.",
  },
];

export const ACTOR = (id: string): Actor => ACTORES.find((a) => a.id === id)!;

/** Alianzas posibles. Suman sinergia solo si AMBOS extremos están en el mismo bloque. */
export const ALIANZAS: { a: string; b: string; peso: number; nota: string }[] = [
  { a: "ayuntamiento", b: "empresa", peso: 2, nota: "contrato en puerta" },
  { a: "empresa", b: "medios", peso: 1.5, nota: "publicidad" },
  { a: "comite", b: "colectivo", peso: 1.5, nota: "vecinas conocidas" },
  { a: "comite", b: "comunidad", peso: 1.5, nota: "agua compartida" },
  { a: "colectivo", b: "instituto", peso: 1, nota: "talleres" },
  { a: "instituto", b: "medios", peso: 1.5, nota: "datos a la radio" },
];

export const FICHAS = 6;

export interface Accion {
  id: string;
  titulo: string;
  costo: number;
  icono: string;
  efecto: string;
  /** Acción que debe estar elegida para que esta funcione. */
  requiere?: string;
  pasa?: { actor: string; bando: Bando }[];
  mods?: { bloque: "coal" | "contra"; fuente: Fuente; delta: number }[];
  reaccion: string;
  sinRequisito?: string;
  porque: string;
}

export const ACCIONES: Accion[] = [
  {
    id: "comunidad", titulo: "Invitar a la Comunidad de Tlalmayo a la asamblea", costo: 1, icono: "fa-mountain",
    efecto: "Tlalmayo se une a la coalición",
    pasa: [{ actor: "comunidad", bando: "coal" }],
    reaccion: "Tlalmayo llega con su conocimiento del manantial y su red de asambleas; el comité deja de hablar «por» ellos.",
    porque: "Incluir a quien sufre un cruce de desigualdades (etnia + clase) suma saber y redes, y evita que la decisión se tome sin ellos.",
  },
  {
    id: "colectivo", titulo: "Sumar al Colectivo Aguadoras", costo: 1, icono: "fa-hands-holding-circle",
    efecto: "El Colectivo se une a la coalición",
    pasa: [{ actor: "colectivo", bando: "coal" }],
    reaccion: "El Colectivo conecta a familias de varias colonias y pone sobre la mesa el trabajo de cuidado del agua.",
    porque: "Sus contactos son capital social, y su voz trae la dimensión de género que la discusión ignoraba.",
  },
  {
    id: "peritaje", titulo: "Pedir un peritaje independiente del acuífero al Instituto", costo: 2, icono: "fa-flask",
    efecto: "El Instituto se une; ahora hay datos propios",
    pasa: [{ actor: "instituto", bando: "coal" }],
    reaccion: "El Instituto mide el acuífero y entrega un informe que no depende de la empresa.",
    porque: "El capital cultural (saber técnico) convierte una queja en un argumento que se puede defender ante el cabildo.",
  },
  {
    id: "radio", titulo: "Llevar el peritaje a Radio Valle", costo: 2, icono: "fa-radio", requiere: "peritaje",
    efecto: "Radio Valle cambia de lado… si hay datos",
    pasa: [{ actor: "medios", bando: "coal" }],
    reaccion: "Con el informe en mano, Radio Valle abre un espacio de debate: el «sentido común» ya no es solo el de la empresa.",
    sinRequisito: "Sin datos propios, Radio Valle solo repite la versión de la empresa: gastaste fichas y nada cambió.",
    porque: "La hegemonía se disputa con consensos: quien tiene el micrófono y los datos cambia lo que parece «normal».",
  },
  {
    id: "amparo", titulo: "Presentar un amparo y exigir una consulta pública", costo: 2, icono: "fa-gavel",
    efecto: "+3 de Autoridad para la coalición",
    mods: [{ bloque: "coal", fuente: "autoridad", delta: 3 }],
    reaccion: "El juzgado admite el trámite: el ayuntamiento ya no puede decidir sin escuchar.",
    porque: "Usar la ley es una forma de autoridad: obliga a la contraparte aun contra su voluntad.",
  },
  {
    id: "bloqueo", titulo: "Bloquear la carretera principal", costo: 1, icono: "fa-road-barrier",
    efecto: "+1 Redes para la coalición, pero +3 Relato a la contraparte",
    mods: [{ bloque: "coal", fuente: "redes", delta: 1 }, { bloque: "contra", fuente: "relato", delta: 3 }],
    reaccion: "Radio Valle y el ayuntamiento lo llaman «vandalismo»; la protesta se ve, pero el relato se inclina hacia la empresa.",
    porque: "Sin una narrativa propia, la visibilidad se vuelve en contra: la hegemonía decide cómo se cuenta la protesta.",
  },
  {
    id: "oferta", titulo: "Aceptar las despensas y el pozo que ofrece la empresa", costo: 0, icono: "fa-gift",
    efecto: "Gratis, pero divide a la coalición y refuerza el relato de la empresa",
    mods: [{ bloque: "coal", fuente: "redes", delta: -2 }, { bloque: "contra", fuente: "relato", delta: 3 }],
    reaccion: "Algunos vecinos ven el regalo y dejan de ir a la asamblea; la empresa presume que «el pueblo está de acuerdo».",
    porque: "Lo gratuito también se paga: el dinero compra consenso, rompe las redes y fabrica «sentido común».",
  },
];

export interface Estado {
  bandos: Record<string, Bando>;
  poderActor: Record<string, number>;
  coal: number;
  contra: number;
  balance: number;
  hegemonia: Bando | null;
  voces: Categoria[];
  fichasUsadas: number;
  fallidas: string[];
  /** Pares de alianza activos: «a|b» → bando. */
  activas: Record<string, "coal" | "contra">;
}

export function poderDe(a: Actor): number {
  return Math.round(FUENTES.reduce((s, f) => s + a.recursos[f.id] * f.peso, 0) * 10) / 10;
}

export function gastoDe(ids: string[]): number {
  return ids.reduce((s, id) => s + (ACCIONES.find((a) => a.id === id)?.costo ?? 0), 0);
}

export function evaluar(ids: string[]): Estado {
  const bandos: Record<string, Bando> = Object.fromEntries(ACTORES.map((a) => [a.id, a.bando]));
  const mods: { bloque: "coal" | "contra"; fuente: Fuente; delta: number }[] = [];
  const fallidas: string[] = [];
  for (const acc of ACCIONES) {
    if (!ids.includes(acc.id)) continue;
    if (acc.requiere && !ids.includes(acc.requiere)) {
      fallidas.push(acc.id);
      continue;
    }
    for (const p of acc.pasa ?? []) bandos[p.actor] = p.bando;
    for (const m of acc.mods ?? []) mods.push(m);
  }
  const poderActor = Object.fromEntries(ACTORES.map((a) => [a.id, poderDe(a)]));
  const suma = (b: Bando) => ACTORES.filter((a) => bandos[a.id] === b).reduce((s, a) => s + (poderActor[a.id] ?? 0), 0);
  const activas: Record<string, "coal" | "contra"> = {};
  let sinCoal = 0;
  let sinContra = 0;
  for (const al of ALIANZAS) {
    const ba = bandos[al.a];
    if (ba && ba === bandos[al.b] && ba !== "neutral") {
      activas[`${al.a}|${al.b}`] = ba;
      if (ba === "coal") sinCoal += al.peso;
      else sinContra += al.peso;
    }
  }
  const modDe = (bl: "coal" | "contra") => mods.filter((m) => m.bloque === bl).reduce((s, m) => s + m.delta * PESO[m.fuente], 0);
  const relatoDe = (b: "coal" | "contra") =>
    ACTORES.filter((a) => bandos[a.id] === b).reduce((s, a) => s + a.recursos.relato, 0) +
    mods.filter((m) => m.bloque === b && m.fuente === "relato").reduce((s, m) => s + m.delta, 0);
  const difRelato = relatoDe("coal") - relatoDe("contra");
  const hegemonia: Bando | null = difRelato >= 2 ? "coal" : difRelato <= -2 ? "contra" : null;
  const coal = (suma("coal") + modDe("coal") + sinCoal) * (hegemonia === "coal" ? 1.1 : 1);
  const contra = (suma("contra") + modDe("contra") + sinContra) * (hegemonia === "contra" ? 1.1 : 1);
  const balance = Math.round((coal / (coal + contra)) * 100);
  const voces = Array.from(new Set(ACTORES.filter((a) => bandos[a.id] === "coal").flatMap((a) => a.cruces)));
  return { bandos, poderActor, coal, contra, balance, hegemonia, voces, fichasUsadas: gastoDe(ids), fallidas, activas };
}

export interface Resolucion {
  id: "firma" | "condiciones" | "frena" | "consulta";
  titulo: string;
  texto: string;
  tono: "mal" | "medio" | "bien";
}

/** Lo que pasa en el cabildo con el balance y las voces que llegaron. */
export function resolver(e: Estado): Resolucion {
  if (e.balance >= 55 && e.voces.length >= 4) {
    return { id: "consulta", tono: "bien", titulo: "Consulta pública y agua gestionada con la comunidad", texto: "El cabildo cancela la concesión y abre una consulta. Ganaron porque sumaron saber, redes y relato, y porque las voces más afectadas (clase, género, etnia y edad) estuvieron en la mesa." };
  }
  if (e.balance >= 55) {
    return { id: "frena", tono: "medio", titulo: "Se frena la concesión, pero sin todas las voces", texto: "La coalición pesa más, aunque falta alguien con un cruce de desigualdades en la mesa: el acuerdo decide por quienes no estuvieron." };
  }
  if (e.balance >= 45) {
    return { id: "condiciones", tono: "medio", titulo: "Concesión con condiciones", texto: "Hay un empate técnico: el cabildo aprueba la concesión, pero con tarifas congeladas un año. La contraparte conservó la iniciativa." };
  }
  return { id: "firma", tono: "mal", titulo: "Se firma la concesión tal como la propuso la empresa", texto: "La contraparte reunió más autoridad, dinero y relato. Quien tiene más fuentes de poder a la vez impone su voluntad aun contra la resistencia." };
}

/** Pista breve según la acción: ¿por qué su efecto salió así? */
export function lecturaDe(e: Estado, ids: string[]): string {
  if (ids.length === 0) return `Balance ${e.balance} %: la contraparte manda`;
  return `Balance ${e.balance} % · ${FICHAS - e.fichasUsadas} fichas libres`;
}
