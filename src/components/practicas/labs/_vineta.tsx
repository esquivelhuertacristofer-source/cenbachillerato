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
  velada = false,
}: {
  /** El término tal cual lo escribe el laboratorio; se normaliza al buscar. */
  termino: string;
  /** El color de la categoría, para el icono de reserva y el marco. */
  color: string;
  /** Icono de Font Awesome de reserva, con o sin el prefijo `fa-`. */
  icono?: string;
  tam?: number;
  radio?: number;
  /**
   * Tapada hasta que el alumno acierte.
   *
   * En «Escribe el término» la ilustración ES la respuesta: una plastilina de
   * un anzuelo con un sobre delante de la definición de «phishing» resuelve el
   * ejercicio sin leerlo. Velada se ve que hay algo, se intuye la forma y el
   * color, y al acertar se aclara: la imagen pasa de pista a premio.
   *
   * Sin viñeta no se dibuja NADA en este modo —ni el icono de reserva—, para
   * que una tarjeta sin foto no acabe enseñando un icono nítido mientras las
   * demás están borrosas.
   */
  velada?: boolean;
}) {
  const lab = useLabImagen();
  const src = lab?.slug ? imagenDeTermino(lab.slug, termino) : null;
  /* Una imagen puede estar indexada y aun así fallar al cargar (un despliegue
   * a medias, una caché rara). Si eso pasa se cae al icono en caliente, en vez
   * de dejar el recuadro roto delante del alumno. */
  const [rota, setRota] = useState(false);

  if (!src || rota) {
    if (!icono || velada) return null;
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
        filter: velada ? "blur(7px) saturate(.45) brightness(.8)" : "none",
        transform: velada ? "scale(.94)" : "scale(1)",
        transition: "filter .5s ease, transform .5s cubic-bezier(.34,1.3,.64,1)",
      }}
    />
  );
}

/** true si este laboratorio tiene viñeta para ese término. Para decidir diseño. */
export function useTieneVineta(termino: string): boolean {
  const lab = useLabImagen();
  return Boolean(lab?.slug && imagenDeTermino(lab.slug, termino));
}

/**
 * LA MISMA ILUSTRACIÓN, DE FONDO, LLENANDO LA ZONA DE DESTINO.
 *
 * Una cubeta de clasificar mide 230 px de alto y al abrir el laboratorio solo
 * tiene dentro un título, una línea de definición y un «Arrastra aquí…» en
 * gris. Más de la mitad de esa altura, multiplicada por cinco cubetas, era
 * rectángulo oscuro vacío: el bloque de espacio muerto más grande de la
 * pantalla, y lo primero que se ve antes de tocar nada.
 *
 * Aquí va la ilustración del concepto, grande y muy tenue. No compite con el
 * texto, y a medida que el alumno suelta tarjetas se va tapando sola.
 *
 * EL APILAMIENTO ES LO QUE HACE QUE ESTO FUNCIONE O SE VEA FATAL:
 *
 *  - con `z-index: 0` la marca taparía el contenido, porque un elemento
 *    posicionado pinta POR ENCIMA del contenido en flujo aunque vaya antes;
 *  - con `z-index: -1` a secas se iría por DETRÁS del fondo de la propia caja
 *    —una caja `position: relative` sin z-index no crea contexto de apilamiento
 *    y el -1 la atraviesa— y desaparecería.
 *
 * Por eso la caja lleva `isolation: isolate` (la pone el codemod junto con
 * `position: relative`; las dos son neutras para la maquetación): crea el
 * contexto, y dentro de él el -1 queda encima del fondo y debajo del texto.
 */
export function FondoTermino({ termino, opacidad = 0.17 }: { termino: string; opacidad?: number }) {
  const lab = useLabImagen();
  const src = lab?.slug ? imagenDeTermino(lab.slug, termino) : null;
  const [rota, setRota] = useState(false);
  if (!src || rota) return null;

  return (
    <img
      src={src}
      alt=""
      aria-hidden
      loading="lazy"
      decoding="async"
      onError={() => setRota(true)}
      style={{
        position: "absolute",
        /* DENTRO DE LA CAJA, sin desbordar. Con desplazamientos negativos la
         * ilustración asomaba por fuera del borde redondeado: la caja no
         * recorta, y ponerle `overflow: hidden` recortaría también cosas que sí
         * tienen que salir. */
        right: "3%",
        bottom: "3%",
        width: "52%",
        maxHeight: "70%",
        objectFit: "contain",
        opacity: opacidad,
        filter: "saturate(.7)",
        /* LA MÁSCARA ES LO QUE LA CONVIERTE EN ILUSTRACIÓN Y NO EN MANCHA.
         * Estas plastilinas están renderizadas sobre un fondo claro opaco: a
         * baja opacidad sobre una tarjeta oscura, ese fondo no se lee como una
         * foto, se lee como un rectángulo gris pegado en la esquina. El
         * degradado radial desvanece los bordes y solo queda la figura. */
        maskImage: "radial-gradient(closest-side, #000 42%, transparent 88%)",
        WebkitMaskImage: "radial-gradient(closest-side, #000 42%, transparent 88%)",
        pointerEvents: "none",
        userSelect: "none",
        zIndex: -1,
      }}
    />
  );
}
