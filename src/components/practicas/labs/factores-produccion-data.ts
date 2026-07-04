/**
 * Datos VERBATIM de CS-II·P03 «Economía formal e informal: trabajo y producción»
 * (Ciencias Sociales II). Fuente: A1 (lectura), A2 + A4 (quiz V/F), A5 (glosario),
 * A6 (fill_blanks).
 *
 * Módulo de datos puro (sin three.js, sin React) que alimenta a
 * LabFactoresProduccion. La callout «sabías» de A1 (68 pueblos indígenas / CDMX)
 * es ajena al tema (factores de producción) y NO se incluye, por fidelidad.
 */

/* ── Modo 1: «Los factores de producción» (clasifica ejemplos) ─────────────── */
export type Factor = "tierra" | "trabajo" | "capital" | "organizacion" | "tiempo";

export interface FactorInfo {
  titulo: string;
  descripcion: string;
  icono: string;
}

export const FACTOR_INFO: Record<Factor, FactorInfo> = {
  tierra: { titulo: "Tierra", descripcion: "Recursos naturales", icono: "fa-mountain-sun" },
  trabajo: { titulo: "Trabajo", descripcion: "Esfuerzo humano", icono: "fa-person-digging" },
  capital: { titulo: "Capital", descripcion: "Medios y herramientas", icono: "fa-industry" },
  organizacion: { titulo: "Organización", descripcion: "Coordinación y gestión", icono: "fa-sitemap" },
  tiempo: { titulo: "Tiempo", descripcion: "Duración del proceso", icono: "fa-hourglass-half" },
};

export interface ItemFactor {
  id: string;
  texto: string;
  factor: Factor;
}

export const ITEMS_FACTOR: ItemFactor[] = [
  { id: "if-harina", texto: "La harina de trigo", factor: "tierra" },
  { id: "if-terreno", texto: "El terreno de cultivo", factor: "tierra" },
  { id: "if-panaderos", texto: "Los panaderos", factor: "trabajo" },
  { id: "if-jornaleros", texto: "Los jornaleros del campo", factor: "trabajo" },
  { id: "if-horno", texto: "El horno de la panadería", factor: "capital" },
  { id: "if-camion", texto: "El camión de reparto", factor: "capital" },
  { id: "if-coordina", texto: "Quien coordina al equipo", factor: "organizacion" },
  { id: "if-planea", texto: "La planeación de la producción", factor: "organizacion" },
  { id: "if-meses", texto: "Los meses que tarda la cosecha", factor: "tiempo" },
  { id: "if-horas", texto: "Las horas de amasado", factor: "tiempo" },
];

/* ── Modo 2: «¿Formal o informal?» (clasifica actividades) ─────────────────── */
export type Sector = "formal" | "informal";

export interface SectorInfo {
  titulo: string;
  descripcion: string;
  icono: string;
}

export const SECTOR_INFO: Record<Sector, SectorInfo> = {
  formal: { titulo: "Economía formal", descripcion: "Registrada y regulada; con prestaciones", icono: "fa-building-columns" },
  informal: { titulo: "Economía informal", descripcion: "Sin registro ni regulación oficial", icono: "fa-cart-shopping" },
};

export interface ItemSector {
  id: string;
  texto: string;
  sector: Sector;
}

export const ITEMS_SECTOR: ItemSector[] = [
  { id: "is-hacienda", texto: "Empresa registrada ante Hacienda", sector: "formal" },
  { id: "is-imss", texto: "Empleo con contrato y seguro social (IMSS)", sector: "formal" },
  { id: "is-factura", texto: "Tienda que emite facturas", sector: "formal" },
  { id: "is-pension", texto: "Trabajador con prestaciones y pensión", sector: "formal" },
  { id: "is-viapublica", texto: "Venta en la vía pública sin permiso", sector: "informal" },
  { id: "is-sincontrato", texto: "Trabajar sin contrato ni seguridad social", sector: "informal" },
  { id: "is-taller", texto: "Un taller que no paga impuestos", sector: "informal" },
  { id: "is-comida", texto: "Vender comida en la calle sin registro", sector: "informal" },
];

/* ── Modo 3: «La cadena productiva» (ordena los eslabones) ─────────────────── */
export interface CadenaPaso {
  id: string;
  orden: number;
  texto: string;
  etapa: string;
}

/** El recorrido del tomate de Sinaloa (verbatim A1), de la producción al consumo. */
export const CADENA: CadenaPaso[] = [
  { id: "cp-cultivo", orden: 0, texto: "Se cultiva el tomate en Sinaloa", etapa: "Producción" },
  { id: "cp-intermediarios", orden: 1, texto: "Intermediarios compran la cosecha", etapa: "Distribución" },
  { id: "cp-transporte", orden: 2, texto: "Transportistas lo trasladan", etapa: "Distribución" },
  { id: "cp-venta", orden: 3, texto: "Se vende en mercados y supermercados", etapa: "Distribución" },
  { id: "cp-mesa", orden: 4, texto: "Llega a la mesa de las familias", etapa: "Consumo" },
];

/* ── Cuestionario (5 ítems V/F verbatim: A4 ×4 + A2 ×1) ────────────────────── */
export interface QuizItem {
  pregunta: string;
  opciones: string[];
  correcta: number;
  retro: string;
}

export const QUIZ: QuizItem[] = [
  {
    pregunta: "Los factores de producción incluyen la tierra, el trabajo, el capital, la organización y el tiempo.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto: combinados permiten producir bienes y servicios.",
  },
  {
    pregunta: "Los intercambios entre regiones y países siempre son equitativos y benefician por igual a todos.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "Muchos intercambios son desiguales y reproducen diferencias entre regiones y países.",
  },
  {
    pregunta: "Existen diferencias económicas marcadas entre las zonas urbanas y las zonas rurales.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto: hay desigualdades regionales urbano-rural.",
  },
  {
    pregunta: "El trabajo no remunerado, como el trabajo del hogar y de cuidados, no aporta nada a la economía.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "El trabajo no remunerado sostiene la vida y la economía aunque no se pague.",
  },
  {
    pregunta: "Estudiar la cadena productiva nos ayuda a entender quiénes se benefician más en cada eslabón.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto. El análisis de la cadena revela relaciones de poder y distribución inequitativa de ganancias.",
  },
];

/** Dato verbatim de A1: peso de la economía informal en México. */
export const DATO_PRODUCCION =
  "En México, la economía informal representa aproximadamente el 55% del empleo total: millones de personas trabajan sin seguridad social, sin contrato formal, sin acceso a crédito bancario ni a pensión.";
