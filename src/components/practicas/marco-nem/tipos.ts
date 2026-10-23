// Tipos mínimos que el marco inmersivo de NEM (MarcoNem) necesita. En NEM vivían
// en el catálogo de laboratorios; aquí se reducen a lo que usan los dos labs.

/** Color de acento ({ hex, rgba }), el mismo formato que AreaColor de CEN. */
export interface LabColor {
  hex: string;
  rgba: string;
}

export interface LabMeta {
  slug: string;
  titulo: string;
  descripcion: string;
  disciplina: string;
  /** Nivel visible en la etiqueta de la portada (sin primaria/secundaria). */
  grado?: string;
  nivel: "todos";
  icono: string;
  /** true = escenario de papel claro (los dos labs de marca CEN lo declaran). */
  temaPropio?: boolean;
  materiales: { id: string; nombre: string; icono: string; obligatorio: boolean }[];
}

export interface PracticaNemProps {
  color: LabColor;
  actividadCodigo: string;
  actividadTitulo: string;
}
