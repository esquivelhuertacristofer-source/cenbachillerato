"use client";

/**
 * Monta un laboratorio dentro de su Expedición.
 *
 * Es la pieza que usa la ruta real de prácticas
 * (/hub/uac/[codigo]/progresion/[id]/actividad/[orden]/practica): resuelve la
 * carátula, la ficha teórica y el laboratorio del slug, y deja que
 * `Expedicion` ponga alrededor la portada, los capítulos y el cierre.
 *
 * Todo se carga en el cliente (`ssr: false`): los laboratorios traen three.js y
 * las fichas traen el texto verbatim de su actividad; ninguno de los dos debe
 * viajar en el bundle del Worker, que tiene 3 MiB. Por eso este módulo NO toca
 * el registro de fichas: lo importa `Expedicion`, que sí queda fuera del
 * servidor. Importarlo aquí metía las 187 fichas en el Worker.
 */

import dynamic from "next/dynamic";
import type { AreaColor } from "@/components/hub/hub-colors";
import { mejorImagenDeLab } from "@/lib/practicas/lab-imagenes";
import { LabImagenProvider } from "../lab-imagen-context";
import { getPractica } from "../registry";

const Expedicion = dynamic(() => import("./Expedicion").then((m) => m.Expedicion), { ssr: false });

export interface ExpedicionPracticaProps {
  slug: string;
  color: AreaColor;
  backHref: string;
  uacNombre: string;
  uacCodigo: string;
  actividadCodigo: string;
  actividadTitulo: string;
}

export function ExpedicionPractica({
  slug,
  color,
  backHref,
  uacNombre,
  uacCodigo,
  actividadCodigo,
  actividadTitulo,
}: ExpedicionPracticaProps) {
  const practica = getPractica(slug);

  if (!practica) return null;

  const imagen = mejorImagenDeLab(slug);
  const Lab = practica.Component;

  return (
    <LabImagenProvider valor={{ src: imagen, alt: practica.titulo }}>
      <Expedicion
        slug={slug}
        titulo={practica.titulo}
        descripcion={practica.descripcion}
        imagen={imagen}
        color={color}
        uacNombre={uacNombre}
        etiqueta={uacCodigo}
        backHref={backHref}
      >
        <Lab color={color} actividadCodigo={actividadCodigo} actividadTitulo={actividadTitulo} />
      </Expedicion>
    </LabImagenProvider>
  );
}
