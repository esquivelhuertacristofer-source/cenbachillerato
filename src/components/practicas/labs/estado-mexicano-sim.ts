/**
 * Simulador «El caso de Las Palmas» (estado-mexicano). Módulo PURO (sin React).
 *
 * La comunidad «Las Palmas», del municipio «San Isidro» (ficticios), se queda sin
 * agua. El alumno lleva el caso por el tablero del Estado: 3 niveles de gobierno
 * (federal, estatal, municipal) × 3 poderes (Ejecutivo, Legislativo, Judicial).
 * Las instituciones son reales como instituciones; los hechos, las familias y los
 * días son SIMULACIÓN. Reglas verbatim de CS-I·P01: el Ejecutivo aplica las leyes
 * y administra, el Legislativo hace las leyes, el Judicial imparte justicia.
 */
import type { Poder } from "./estado-mexicano-data";

export type Nivel = "federal" | "estatal" | "municipal";

export const NIVELES: { id: Nivel; label: string }[] = [
  { id: "federal", label: "Federal" },
  { id: "estatal", label: "Estatal" },
  { id: "municipal", label: "Municipal" },
];

export const PODERES_COL: Poder[] = ["ejecutivo", "legislativo", "judicial"];

export interface Celda {
  id: string;
  nivel: Nivel;
  poder: Poder;
  nombre: string;
  icono: string;
  /** Qué hace esta institución (se muestra cuando no era la que tocaba). */
  funcion: string;
}

export const CELDAS: Celda[] = [
  { id: "presidencia", nivel: "federal", poder: "ejecutivo", nombre: "Presidencia de la República", icono: "fa-flag", funcion: "Aplica las leyes federales y administra al país; no presta el servicio de agua de una comunidad." },
  { id: "congreso-union", nivel: "federal", poder: "legislativo", nombre: "Congreso de la Unión", icono: "fa-scroll", funcion: "Senado y Cámara de Diputados hacen las leyes federales; no escriben las leyes de un estado ni llevan pipas." },
  { id: "scjn", nivel: "federal", poder: "judicial", nombre: "Suprema Corte de Justicia", icono: "fa-scale-balanced", funcion: "Es la última instancia que interpreta la Constitución; no atiende emergencias ni hace leyes." },
  { id: "gobernador", nivel: "estatal", poder: "ejecutivo", nombre: "Gobernador del estado", icono: "fa-user-tie", funcion: "Aplica las leyes del estado y administra; no las escribe ni juzga." },
  { id: "congreso-local", nivel: "estatal", poder: "legislativo", nombre: "Congreso del estado", icono: "fa-file-pen", funcion: "Hace las leyes del estado; no las aplica ni reparte agua." },
  { id: "tribunales", nivel: "estatal", poder: "judicial", nombre: "Tribunales del estado", icono: "fa-gavel", funcion: "Imparten justicia en el estado: resuelven demandas y obligan a cumplir la ley." },
  { id: "presidente-mun", nivel: "municipal", poder: "ejecutivo", nombre: "Presidente municipal", icono: "fa-city", funcion: "Aplica las leyes en el municipio y presta sus servicios públicos, como el agua." },
  { id: "cabildo", nivel: "municipal", poder: "legislativo", nombre: "Cabildo del ayuntamiento", icono: "fa-people-roof", funcion: "Aprueba los reglamentos del municipio; no lleva pipas ni juzga." },
  { id: "juzgado-civico", nivel: "municipal", poder: "judicial", nombre: "Juzgado cívico", icono: "fa-hand-holding-hand", funcion: "Resuelve faltas administrativas del municipio; no demandas contra empresas." },
];

export interface Paso {
  id: number;
  situacion: string;
  necesita: string;
  correcta: string;
  resuelto: string;
}

export const PASOS: Paso[] = [
  {
    id: 1,
    situacion: "El pozo de Las Palmas se secó: 300 familias (simulación) llevan días sin agua y necesitan pipas hoy mismo.",
    necesita: "alguien que ejecute y preste el servicio de agua en la comunidad",
    correcta: "presidente-mun",
    resuelto: "El ayuntamiento manda 5 pipas: la emergencia se atiende, pero el problema de fondo sigue.",
  },
  {
    id: 2,
    situacion: "Se descubre que el estado no tiene ninguna ley que obligue a las embotelladoras a reponer el agua que extraen.",
    necesita: "quien haga la ley del estado",
    correcta: "congreso-local",
    resuelto: "El Congreso del estado aprueba la ley: ahora las embotelladoras deben reponer el agua.",
  },
  {
    id: 3,
    situacion: "La ley ya existe, pero la embotelladora se niega a cumplirla. Los vecinos presentan una demanda.",
    necesita: "quien imparta justicia y obligue a cumplir la ley en el estado",
    correcta: "tribunales",
    resuelto: "Los tribunales ordenan a la embotelladora cumplir. Ella apela: dice que la ley choca con la Constitución.",
  },
  {
    id: 4,
    situacion: "La embotelladora asegura que la ley estatal contradice la Constitución. Alguien debe decidir en última instancia.",
    necesita: "quien interprete la Constitución como última instancia",
    correcta: "scjn",
    resuelto: "La Suprema Corte confirma que la ley es constitucional: el agua vuelve a Las Palmas y el caso se cierra.",
  },
];

/** Días sin agua que se suman cada vez que el trámite se atora (simulación). */
export const DIAS_POR_ATORO = 10;
export const DIAS_INICIO = 3;

export const celdaPorId = (id: string): Celda | undefined => CELDAS.find((c) => c.id === id);

export function porQueNo(paso: Paso, celdaId: string): string {
  const c = celdaPorId(celdaId);
  if (!c) return "";
  return `${c.nombre}: ${c.funcion} Este paso necesita ${paso.necesita}.`;
}
