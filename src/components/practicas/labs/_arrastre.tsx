"use client";

/**
 * EL ARRASTRE, VIVO.
 *
 * Medido antes de tocar nada: de los 207 laboratorios, **uno solo** reaccionaba
 * al pasar una tarjeta por encima de una zona. En los otros 206 levantabas la
 * ficha y la interfaz se quedaba muerta hasta que soltabas: no sabías si ibas a
 * acertar la zona, no sabías si el gesto se había registrado, y al soltar la
 * tarjeta simplemente aparecía en otro sitio. Eso es lo que hace que un
 * arrastrar-y-soltar se sienta barato, más que ninguna falta de colores.
 *
 * Aquí está el vocabulario de movimiento, en un solo sitio:
 *
 *  - la tarjeta que llevas en la mano se inclina y se levanta;
 *  - la de origen se queda como un hueco tenue, para que se vea de dónde salió;
 *  - la zona bajo el cursor se enciende, crece un punto y marca su borde;
 *  - al soltar bien, la tarjeta entra con un golpe de escala;
 *  - al fallar, tiembla.
 *
 * TODO SE HACE CON ATRIBUTOS `data-*`, no con estado de React. Un `useState`
 * por cada `dragenter` volvería a dibujar el laboratorio entero decenas de
 * veces mientras mueves la mano, y en un laboratorio con veinte tarjetas eso se
 * nota. Los manejadores tocan el atributo y el CSS hace el resto.
 *
 * Y todo va detrás de `prefers-reduced-motion`: quien pidió menos animación
 * conserva el resalte —que es información— y pierde solo el movimiento.
 */

export function EstiloArrastre() {
  return (
    <style>{`
      /* ── la tarjeta que se lleva en la mano ─────────────────────────── */
      [data-arrastrando="true"] {
        opacity: .38;
        transform: scale(.97);
        filter: saturate(.6);
      }
      [draggable="true"] {
        transition: transform .14s ease, opacity .14s ease, box-shadow .18s ease, filter .18s ease;
        cursor: grab;
      }
      [draggable="true"]:active { cursor: grabbing; }

      /* ── la zona bajo el cursor ─────────────────────────────────────── */
      [data-sobre="true"] {
        /* El velo va en ::after y necesita un ancestro posicionado; si la zona
           es estatica, el velo se ancla en cualquier otro sitio y tapa media
           pantalla. Con relative no se mueve nada: sigue en el flujo.
           (Sin acentos graves aqui dentro: cerrarian la plantilla.) */
        position: relative;
        /* El color sale del propio laboratorio: cada UAC tiene el suyo y una
           zona que se encendiera siempre en azul rompería su identidad. */
        outline: 2px dashed currentColor;
        outline-offset: 3px;
        transform: scale(1.015);
        transition: transform .16s cubic-bezier(.34,1.3,.64,1), box-shadow .16s ease;
        box-shadow: 0 10px 34px -12px currentColor;
      }
      [data-sobre="true"]::after {
        /* Un velo tenue del mismo color, para que la zona entera se lea como
           «aquí cae», no solo su borde. */
        content: "";
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: currentColor;
        opacity: .07;
        pointer-events: none;
      }

      /* ── la tarjeta que acaba de caer bien ──────────────────────────── */
      @keyframes arrEntra {
        0%   { transform: scale(.82) translateY(-6px); opacity: 0; }
        60%  { transform: scale(1.04); opacity: 1; }
        100% { transform: scale(1); }
      }
      .arr-entra { animation: arrEntra .34s cubic-bezier(.34,1.4,.64,1) both; }

      /* ── el fallo ───────────────────────────────────────────────────── */
      @keyframes arrTiembla {
        0%,100% { transform: translateX(0); }
        18%     { transform: translateX(-6px); }
        38%     { transform: translateX(6px); }
        58%     { transform: translateX(-4px); }
        78%     { transform: translateX(4px); }
      }
      .arr-tiembla { animation: arrTiembla .38s ease both; }

      @media (prefers-reduced-motion: reduce) {
        [draggable="true"], [data-sobre="true"] { transition: none; transform: none; }
        [data-sobre="true"] { transform: none; }
        .arr-entra, .arr-tiembla { animation: none; }
      }
    `}</style>
  );
}
