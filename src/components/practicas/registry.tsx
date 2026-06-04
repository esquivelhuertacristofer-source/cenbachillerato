"use client";

/**
 * Registro de Prácticas experimentales (laboratorios como componentes React).
 *
 * Cada práctica se identifica con un `slug` único, que se guarda en la columna
 * `actividades.practica_slug`. Cuando una actividad tiene ese campo, la app
 * muestra el botón "Práctica experimental" y la sección /actividad/[orden]/practica
 * monta el componente registrado aquí bajo ese slug.
 *
 * Para agregar un laboratorio nuevo:
 *   1. Crea el componente en src/components/practicas/labs/MiLaboratorio.tsx
 *      (recibe PracticaLabProps). Usa PlantillaPractica.tsx como base.
 *   2. Impórtalo aquí y añádelo a PRACTICAS con un slug único.
 *   3. Asócialo a una actividad: npx tsx scripts/set-practica.ts <CODIGO> <slug>
 */

import type { ComponentType } from "react";
import type { AreaColor } from "@/components/hub/hub-colors";
import { PlantillaPractica } from "./labs/PlantillaPractica";
import { LabDensidad } from "./labs/LabDensidad";

/** Props que recibe cada componente de laboratorio. */
export interface PracticaLabProps {
  /** Color del área (UAC) para coherencia visual. */
  color: AreaColor;
  /** Código de la actividad de la que cuelga la práctica (p. ej. CNEYT-I-P02-A2). */
  actividadCodigo: string;
  /** Título de la actividad. */
  actividadTitulo: string;
}

export interface PracticaDef {
  /** Identificador único (= valor de actividades.practica_slug). */
  slug: string;
  /** Nombre visible de la práctica. */
  titulo: string;
  /** Descripción corta opcional. */
  descripcion?: string;
  /** Componente React del laboratorio. */
  Component: ComponentType<PracticaLabProps>;
}

export const PRACTICAS: Record<string, PracticaDef> = {
  "plantilla-demo": {
    slug: "plantilla-demo",
    titulo: "Práctica de ejemplo (plantilla)",
    descripcion: "Plantilla base para construir laboratorios. Reemplazar por la práctica real.",
    Component: PlantillaPractica,
  },
  densidad: {
    slug: "densidad",
    titulo: "Laboratorio 3D — Densidad y Flotación",
    descripcion:
      "Suelta objetos en distintos líquidos y descubre por qué flotan o se hunden según ρ = m / V (principio de Arquímedes).",
    Component: LabDensidad,
  },
};

/** Devuelve la práctica registrada para un slug, o null si no existe. */
export function getPractica(slug: string | null | undefined): PracticaDef | null {
  if (!slug) return null;
  return PRACTICAS[slug] ?? null;
}
