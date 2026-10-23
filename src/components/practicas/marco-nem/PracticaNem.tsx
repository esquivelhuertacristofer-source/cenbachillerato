"use client";

// =============================================================================
// Práctica con el marco inmersivo de NEM (MarcoNem)
// =============================================================================
// El Atlas del cuerpo humano y el Sistema Solar (Explorador espacial) se
// muestran EXACTAMENTE como en NEM: portada propia, escena a pantalla completa,
// panel lateral y cajones. Por eso no pasan por la Expedición de CEN (dos
// portadas seguidas): ExpedicionPractica los desvía aquí.
//
// Los labs se cargan con dynamic(ssr:false): three.js nunca entra al Worker.
// =============================================================================

import dynamic from "next/dynamic";
import { MarcoNem } from "./MarcoNem";
import type { LabColor, LabMeta, PracticaNemProps } from "./tipos";

const LabAtlasCuerpo = dynamic(() => import("./labs/LabAtlasCuerpo").then((m) => m.LabAtlasCuerpo), { ssr: false });
const LabExploradorEspacial = dynamic(() => import("./labs/LabExploradorEspacial").then((m) => m.LabExploradorEspacial), { ssr: false });

const COLOR: LabColor = { hex: "#0f766e", rgba: "15, 118, 110" };

const METAS: Record<string, { meta: LabMeta; Lab: React.ComponentType<PracticaNemProps> }> = {
  "atlas-cuerpo-humano-3d": {
    Lab: LabAtlasCuerpo,
    meta: {
      slug: "atlas-cuerpo-humano-3d",
      temaPropio: true,
      titulo: "Atlas del cuerpo humano",
      descripcion:
        "Huesos y órganos con su forma real, en 3D: tócalos para saber cómo se llaman, de qué lado están y qué hacen. Enciende y apaga cada sistema y mira los órganos a través del esqueleto.",
      nivel: "todos",
      disciplina: "Ciencias Naturales",
      grado: "Bachillerato",
      icono: "fa-person",
      materiales: [],
    },
  },
  "sistema-solar-3d": {
    Lab: LabExploradorEspacial,
    meta: {
      slug: "sistema-solar-3d",
      temaPropio: true,
      titulo: "Explorador espacial",
      descripcion:
        "Vuela alrededor de la Tierra fotografiada desde el espacio: mira dónde es de día y de noche en este momento, las luces de las ciudades, las nubes y la Luna en la fase de hoy.",
      nivel: "todos",
      disciplina: "Ciencias Naturales",
      grado: "Bachillerato",
      icono: "fa-rocket",
      materiales: [],
    },
  },
};

/** Slugs de CEN que se abren con el marco de NEM. */
export const SLUGS_MARCO_NEM = Object.keys(METAS);
export const esMarcoNem = (slug: string) => Object.hasOwn(METAS, slug);

export const VOLVER_LABS = "/hub/recursos/laboratorios";

export function PracticaNem({ slug, backHref = VOLVER_LABS }: { slug: string; backHref?: string }) {
  const def = METAS[slug];
  if (!def) return null;
  const { meta, Lab } = def;
  return (
    <MarcoNem slug={slug} labMeta={meta} color={COLOR} volver={{ href: backHref, etiqueta: "Laboratorios" }}>
      <div className="lab-wrap" data-lab-tema="light" data-lab-fondo="propio">
        <Lab color={COLOR} actividadCodigo={slug} actividadTitulo={meta.titulo} />
      </div>
    </MarcoNem>
  );
}

/** Componentes para el registro (sin backHref propio). */
export function LabAtlasNem(_: PracticaNemProps) {
  return <PracticaNem slug="atlas-cuerpo-humano-3d" />;
}
export function LabSistemaSolarNem(_: PracticaNemProps) {
  return <PracticaNem slug="sistema-solar-3d" />;
}
