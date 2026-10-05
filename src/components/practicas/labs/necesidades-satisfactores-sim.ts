/**
 * Simulador del presupuesto de una familia FICTICIA («Ramírez Luna»).
 * Todas las cifras son valores de juego (simulación), no estadísticas reales.
 *
 * Modelo: la familia tiene 12 fichas al mes y cinco necesidades vitales
 * (las del glosario A5: alimentación, hidratación, salud, vivienda y
 * educación). Cada necesidad parte de un nivel base de 20 sobre 100 y se
 * considera «cubierta» a partir de 50. Un satisfactor suma a una o a varias
 * necesidades; un pseudo-satisfactor aparenta cubrir una y resta en otra.
 */

export type NecesidadId = "alimentacion" | "hidratacion" | "salud" | "vivienda" | "educacion";

export const INGRESO = 12;
export const BASE = 20;
export const UMBRAL = 50;

export const NECESIDADES_FAMILIA: { id: NecesidadId; nombre: string; icono: string; color: string }[] = [
  { id: "alimentacion", nombre: "Alimentación", icono: "fa-bowl-food", color: "#FBBF24" },
  { id: "hidratacion", nombre: "Hidratación", icono: "fa-droplet", color: "#38BDF8" },
  { id: "salud", nombre: "Salud", icono: "fa-heart-pulse", color: "#F87171" },
  { id: "vivienda", nombre: "Vivienda", icono: "fa-house", color: "#A78BFA" },
  { id: "educacion", nombre: "Educación", icono: "fa-graduation-cap", color: "#34D399" },
];

export interface SatisfactorSim {
  id: string;
  nombre: string;
  costo: number;
  /** Clave de la imagen en /media/labs-sim/necesidades-satisfactores/. */
  clave: string;
  icono: string;
  /** Efecto sobre cada necesidad (puede ser negativo). */
  efectos: Partial<Record<NecesidadId, number>>;
  pseudo?: boolean;
  /** Por qué sirve (o por qué engaña). */
  explica: string;
}

export const SATISFACTORES: SatisfactorSim[] = [
  {
    id: "despensa",
    nombre: "Despensa de fruta, verdura y tortilla",
    costo: 3,
    clave: "despensa",
    icono: "fa-basket-shopping",
    efectos: { alimentacion: 45, salud: 10 },
    explica: "El alimento satisface la necesidad de nutrición y, de paso, ayuda a la salud: comer variado previene enfermedades.",
  },
  {
    id: "agua",
    nombre: "Agua potable y filtro en casa",
    costo: 2,
    clave: "agua-potable",
    icono: "fa-faucet-drip",
    efectos: { hidratacion: 50, salud: 15 },
    explica: "El agua potable cubre la hidratación y también protege la salud: evita infecciones del estómago.",
  },
  {
    id: "consulta",
    nombre: "Consulta y medicinas en el centro de salud",
    costo: 2,
    clave: "consulta-salud",
    icono: "fa-stethoscope",
    efectos: { salud: 45 },
    explica: "El acceso a servicios de salud cubre la necesidad de salud cuando una persona se enferma.",
  },
  {
    id: "vivienda",
    nombre: "Arreglar el techo y las paredes de la casa",
    costo: 4,
    clave: "casa-techo",
    icono: "fa-house-chimney",
    efectos: { vivienda: 50, salud: 10, educacion: 10 },
    explica: "Una vivienda digna cubre el refugio, evita la humedad que enferma y da un lugar donde estudiar.",
  },
  {
    id: "utiles",
    nombre: "Útiles y transporte para ir a la escuela",
    costo: 2,
    clave: "utiles-escuela",
    icono: "fa-school",
    efectos: { educacion: 40 },
    explica: "El acceso a la escuela cubre la necesidad de educación, un derecho reconocido en la Constitución.",
  },
  {
    id: "biblioteca",
    nombre: "Libros prestados de la biblioteca",
    costo: 1,
    clave: "biblioteca",
    icono: "fa-book-open-reader",
    efectos: { educacion: 20 },
    explica: "Un medio barato que suma a la educación sin sustituir a la escuela.",
  },
  {
    id: "refrescos",
    nombre: "Refrescos y botanas todos los días",
    costo: 2,
    clave: "refrescos-botanas",
    icono: "fa-bottle-water",
    pseudo: true,
    efectos: { alimentacion: 10, hidratacion: 5, salud: -15 },
    explica: "Pseudo-satisfactor: llena y quita la sed un rato, pero no nutre ni hidrata bien, y con el tiempo daña la salud.",
  },
  {
    id: "tonico",
    nombre: "Tónico «milagroso» de venta ambulante",
    costo: 3,
    clave: "tonico",
    icono: "fa-flask",
    pseudo: true,
    efectos: { salud: 5, alimentacion: -5 },
    explica: "Pseudo-satisfactor: promete salud, pero no sustituye una consulta ni una buena alimentación; gasta fichas sin cubrir la necesidad.",
  },
];

export function gasto(sel: string[]): number {
  return SATISFACTORES.filter((s) => sel.includes(s.id)).reduce((t, s) => t + s.costo, 0);
}

export function niveles(sel: string[]): Record<NecesidadId, number> {
  const n: Record<NecesidadId, number> = { alimentacion: BASE, hidratacion: BASE, salud: BASE, vivienda: BASE, educacion: BASE };
  for (const s of SATISFACTORES) {
    if (!sel.includes(s.id)) continue;
    for (const [k, v] of Object.entries(s.efectos)) n[k as NecesidadId] += v ?? 0;
  }
  for (const k of Object.keys(n) as NecesidadId[]) n[k] = Math.max(0, Math.min(100, n[k]));
  return n;
}

/** Cuántas necesidades distintas mejora un satisfactor. */
export function cuantasCubre(s: SatisfactorSim): number {
  return Object.values(s.efectos).filter((v) => (v ?? 0) > 0).length;
}

export function cubiertas(sel: string[]): number {
  const n = niveles(sel);
  return NECESIDADES_FAMILIA.filter((x) => n[x.id] >= UMBRAL).length;
}

export interface InformeMes {
  ok: boolean;
  faltan: NecesidadId[];
  pseudos: SatisfactorSim[];
  /** Mensajes explicativos, en orden. */
  notas: string[];
}

export function informe(sel: string[]): InformeMes {
  const n = niveles(sel);
  const faltan = NECESIDADES_FAMILIA.filter((x) => n[x.id] < UMBRAL).map((x) => x.id);
  const pseudos = SATISFACTORES.filter((s) => s.pseudo && sel.includes(s.id));
  const notas: string[] = [];
  for (const id of faltan) {
    const nec = NECESIDADES_FAMILIA.find((x) => x.id === id)!;
    const medios = SATISFACTORES.filter((s) => !s.pseudo && (s.efectos[id] ?? 0) > 0 && !sel.includes(s.id));
    notas.push(
      medios.length > 0
        ? `${nec.nombre} quedó en ${n[id]}: ningún satisfactor suficiente. Prueba con «${medios[0]!.nombre}».`
        : `${nec.nombre} quedó en ${n[id]}: lo que compraste no la cubre.`
    );
  }
  for (const p of pseudos) notas.push(`«${p.nombre}». ${p.explica}`);
  if (faltan.length === 0 && pseudos.length === 0) {
    notas.push("Las cinco necesidades quedaron cubiertas y cada ficha trabajó por más de una a la vez.");
  }
  return { ok: faltan.length === 0, faltan, pseudos, notas };
}
