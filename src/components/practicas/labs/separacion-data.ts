/**
 * Datos para el laboratorio de Separación de mezclas (CNEYT-I-P04).
 *
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabSeparacionMezclas.tsx) y la escena 3D (SeparacionMezclasScene.tsx) sin
 * arrastrar three.js al bundle del shell.
 *
 * Idea pedagógica: una mezcla se separa aprovechando una PROPIEDAD FÍSICA en la
 * que sus componentes difieren (tamaño de partícula, densidad, punto de
 * ebullición, magnetismo). El método correcto depende de esa propiedad: por eso
 * filtrar agua salada no quita la sal, pero destilarla sí.
 */

export type CompKey = "agua" | "arena" | "sal" | "aceite" | "hierro";

export interface ComponenteInfo {
  nombre: string;
  color: string;
}

/** Componentes que aparecen en las mezclas. */
export const COMPONENTES: Record<CompKey, ComponenteInfo> = {
  agua: { nombre: "Agua", color: "#3FA7FF" },
  arena: { nombre: "Arena", color: "#C2A36B" },
  sal: { nombre: "Sal", color: "#E6ECF2" },
  aceite: { nombre: "Aceite", color: "#E8C24A" },
  hierro: { nombre: "Limaduras de hierro", color: "#6B7280" },
};

export type MetodoKey = "filtracion" | "decantacion" | "destilacion" | "imantacion";

export interface MetodoInfo {
  key: MetodoKey;
  nombre: string;
  icono: string; // Font Awesome 6
  propiedad: string; // propiedad física que aprovecha
  desc: string;
}

/** Métodos de separación disponibles. */
export const METODOS: MetodoInfo[] = [
  { key: "filtracion", nombre: "Filtración", icono: "fa-filter", propiedad: "Tamaño de partícula / insolubilidad", desc: "Pasa la mezcla por un filtro: retiene el sólido insoluble y deja pasar el líquido." },
  { key: "decantacion", nombre: "Decantación", icono: "fa-flask", propiedad: "Densidad / inmiscibilidad", desc: "Separa líquidos que no se mezclan (o un sólido sedimentado) por diferencia de densidad." },
  { key: "destilacion", nombre: "Destilación", icono: "fa-fire", propiedad: "Punto de ebullición", desc: "Calienta para evaporar el componente más volátil y luego lo condensa, separándolo del resto." },
  { key: "imantacion", nombre: "Imantación", icono: "fa-magnet", propiedad: "Magnetismo", desc: "Acerca un imán para atraer los materiales magnéticos y separarlos del resto." },
];

export interface CompRol {
  c: CompKey;
  rol: string; // a dónde va / qué papel cumple al separarse
}

export interface Mezcla {
  key: string;
  nombre: string;
  /** comps[0] va al vaso izquierdo; comps[1] al derecho (al separar bien). */
  comps: [CompRol, CompRol];
  metodo: MetodoKey; // método que SÍ la separa
  propiedad: string; // propiedad que diferencia a los componentes
  explica: string;
}

export const MEZCLAS: Mezcla[] = [
  {
    key: "arena-agua",
    nombre: "Arena y agua",
    comps: [
      { c: "arena", rol: "Arena (retenida en el filtro)" },
      { c: "agua", rol: "Agua (filtrada)" },
    ],
    metodo: "filtracion",
    propiedad: "Tamaño de partícula / insolubilidad",
    explica: "La arena no se disuelve y sus granos son demasiado grandes para pasar por el filtro; el agua sí pasa.",
  },
  {
    key: "sal-agua",
    nombre: "Agua salada",
    comps: [
      { c: "sal", rol: "Sal (queda como residuo)" },
      { c: "agua", rol: "Agua destilada" },
    ],
    metodo: "destilacion",
    propiedad: "Punto de ebullición",
    explica: "El agua hierve y se evapora; al enfriarse se condensa pura. La sal, con un punto de ebullición altísimo, queda en el fondo. Filtrar NO la separa porque la sal está disuelta.",
  },
  {
    key: "agua-aceite",
    nombre: "Agua y aceite",
    comps: [
      { c: "aceite", rol: "Aceite (capa superior)" },
      { c: "agua", rol: "Agua (capa inferior)" },
    ],
    metodo: "decantacion",
    propiedad: "Densidad / inmiscibilidad",
    explica: "No se mezclan: el aceite es menos denso y flota, el agua queda abajo. Se separan dejándolos reposar y abriendo la llave del embudo.",
  },
  {
    key: "hierro-arena",
    nombre: "Limaduras de hierro y arena",
    comps: [
      { c: "hierro", rol: "Hierro (atraído por el imán)" },
      { c: "arena", rol: "Arena (queda)" },
    ],
    metodo: "imantacion",
    propiedad: "Magnetismo",
    explica: "El imán atrae las limaduras de hierro; la arena, que no es magnética, se queda. La diferencia está en el magnetismo.",
  },
];

/** ¿El método elegido separa correctamente la mezcla? */
export const separa = (mezcla: Mezcla, metodo: MetodoKey) => mezcla.metodo === metodo;
