"use client";

/**
 * LA VIÑETA DE UN TÉRMINO, DENTRO DEL LABORATORIO.
 *
 * Hay 2.115 ilustraciones de plastilina generadas —una por cada concepto y
 * cada palabra del glosario de los 211 laboratorios, en
 * `public/media/labs-terminos/<slug>/<clave>.webp`— y hasta ahora SOLO se
 * veían en el capítulo 1 de la Expedición. En cuanto el alumno entraba al
 * laboratorio, desaparecían: dentro no había ni una sola imagen, solo tarjetas
 * de texto sobre fondo oscuro. Este componente las trae adentro.
 *
 * El slug viaja por el contexto de la carátula, no por props: lo conoce el
 * contenedor de la práctica y pasarlo a mano serían más de doscientas
 * ediciones para el mismo dato.
 *
 * SIEMPRE HAY RESERVA. `imagenDeTermino` devuelve null cuando esa viñeta no se
 * ha generado, y entonces se dibuja el icono de Font Awesome que el
 * laboratorio ya traía. Nunca un recuadro roto, nunca un hueco: quien no tiene
 * foto se ve exactamente como antes.
 */

import { useState } from "react";
import { imagenDeTermino } from "@/lib/practicas/terminos-imagen";
import { useLabImagen } from "../lab-imagen-context";

export function VinetaTermino({
  termino,
  color,
  icono,
  tam = 44,
  radio = 11,
}: {
  /** El término tal cual lo escribe el laboratorio; se normaliza al buscar. */
  termino: string;
  /** El color de la categoría, para el icono de reserva y el marco. */
  color: string;
  /** Icono de Font Awesome de reserva, con o sin el prefijo `fa-`. */
  icono?: string;
  tam?: number;
  radio?: number;
}) {
  const lab = useLabImagen();
  const src = lab?.slug ? imagenDeTermino(lab.slug, termino) : null;
  /* Una imagen puede estar indexada y aun así fallar al cargar (un despliegue
   * a medias, una caché rara). Si eso pasa se cae al icono en caliente, en vez
   * de dejar el recuadro roto delante del alumno. */
  const [rota, setRota] = useState(false);

  if (!src || rota) {
    if (!icono) return null;
    const clase = icono.startsWith("fa-") ? icono : `fa-${icono}`;
    return (
      <i
        className={`fa-solid ${clase}`}
        style={{ color, fontSize: Math.round(tam * 0.42), width: tam, textAlign: "center", flexShrink: 0 }}
        aria-hidden
      />
    );
  }

  return (
    <img
      src={src}
      alt=""
      aria-hidden
      loading="lazy"
      decoding="async"
      onError={() => setRota(true)}
      style={{
        width: tam,
        height: tam,
        objectFit: "cover",
        borderRadius: radio,
        border: `1px solid ${color}55`,
        boxShadow: `0 4px 14px -6px ${color}aa`,
        flexShrink: 0,
        /* Sin fondo propio, una ilustración con transparencia se funde con la
         * tarjeta y se pierde el recorte. */
        background: "#0a1524",
      }}
    />
  );
}

/** true si este laboratorio tiene viñeta para ese término. Para decidir diseño. */
export function useTieneVineta(termino: string): boolean {
  const lab = useLabImagen();
  return Boolean(lab?.slug && imagenDeTermino(lab.slug, termino));
}
