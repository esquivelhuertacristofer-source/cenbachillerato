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
import { EstiloArrastre } from "../labs/_arrastre";
import { getPractica } from "../registry";

/* Atlas y Sistema Solar: marco inmersivo de NEM, cargado solo en el navegador. */
const PracticaNem = dynamic(() => import("../marco-nem/PracticaNem").then((m) => m.PracticaNem), { ssr: false });
const SLUGS_MARCO_NEM = new Set(["atlas-cuerpo-humano-3d", "sistema-solar-3d"]);

const Expedicion = dynamic(() => import("./Expedicion").then((m) => m.Expedicion), { ssr: false });
/* Solo en el navegador: arrastra el indice de las viñetas (miles de claves) y
 * en el servidor no hay nada que ilustrar. Importado directo, entraria en el
 * Worker, que tiene tope de 3 MiB. */
const IlustrarFichas = dynamic(() => import("../labs/_ilustrar-fichas").then((m) => m.IlustrarFichas), { ssr: false });

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

  // Atlas y Sistema Solar traen su propio marco (portada incluida, como en NEM):
  // no se envuelven en la Expedición para no mostrar dos portadas seguidas.
  if (SLUGS_MARCO_NEM.has(slug)) return <PracticaNem slug={slug} />;

  const imagen = mejorImagenDeLab(slug);
  const Lab = practica.Component;

  return (
    <LabImagenProvider valor={{ src: imagen, alt: practica.titulo, slug }}>
      {/* El vocabulario de movimiento del arrastre, una sola vez para los 211:
          la tarjeta que se lleva en la mano, la zona que se enciende debajo y
          el golpe de entrada al soltar. Va aquí y no en cada laboratorio
          porque es el único sitio por el que pasan todos. */}
      <EstiloArrastre />
      {/* El dibujo de cada ficha y cada zona: lo que se TOCA, no solo el glosario. */}
      <IlustrarFichas slug={slug} />
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
