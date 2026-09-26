"use client";

/**
 * CADA FICHA Y CADA ZONA, CON SU DIBUJO.
 *
 * Las 2.115 viñetas de los laboratorios salieron del GLOSARIO de la ficha
 * teórica, no de lo que se toca. `licencias-software` tenía «licencia-privativa»
 * y «licencia-libre», pero su zona se llama «Software privativo» y sus fichas
 * «Firefox», «GNU/Linux», «Windows»: el alumno arrastraba seis rótulos con el
 * mismo cubito gris hacia dos cajas vacías. Así estaban los 69 laboratorios que
 * no son 3D.
 *
 * Aquí se ilustra lo que se TOCA. Cada laboratorio está escrito a mano, con sus
 * propias clases (`lic-chip`, `fal-bin`, `seg-bin`…), así que en lugar de
 * editar 69 marcados distintos se engancha lo que todos comparten:
 *
 *  - una ficha es lo que se arrastra (`draggable`) o se elige (`data-sel`);
 *  - una zona es lo que lleva `data-zona`, que pone el `dropProps` de cada
 *    laboratorio.
 *
 * Su nombre es la primera línea de su texto, tal como lo lee el alumno, y la
 * imagen se busca con la misma clave que las viñetas del glosario
 * (`imagenDeTermino`). Si no hay imagen, no se pinta nada: un hueco es mejor
 * que un recuadro roto.
 *
 * TODO POR ATRIBUTO Y CSS, como el arrastre: nada de estado de React. El
 * laboratorio vuelve a dibujar sus fichas al moverlas, y un observador vuelve a
 * mirar en el siguiente cuadro. Solo se observan nodos y texto, no atributos,
 * así que escribir `data-vineta` no se dispara a sí mismo.
 */

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { imagenDeTermino } from "@/lib/practicas/terminos-imagen";

/* `button[data-done]` es el selector de casos («La casa de la abuela»,
 * «La azotea», «El frenón»…): los 69 laboratorios DOM lo usan, y es donde se
 * elige qué escenario trabajar. Las pestañas de modo usan `data-on` a secas y
 * no entran. */
const FICHA = '[draggable="true"], [data-sel], button[data-done]';
const ZONA = '[data-zona="true"]';

function primeraLinea(e: HTMLElement): string {
  const t = (e.innerText || "").split("\n").map((s) => s.trim()).find(Boolean) ?? "";
  /* Algunos selectores llevan el avance pegado al título («La foto en el
   * anuncio0/3»). Con él dentro, la clave cambiaría a «1/3» al acertar y el
   * dibujo desaparecería a media ronda. */
  return t.replace(/\s*\d+\s*\/\s*\d+\s*$/, "");
}

function enProsa(e: HTMLElement): boolean {
  /* Un fragmento marcable vive DENTRO del renglón: su padre es un <span>
   * (`display: inline`) o un párrafo con texto suelto. Una ficha de bandeja
   * cuelga de un contenedor flex o block. Mirar el `display` de la propia
   * ficha no sirve: el navegador calcula `inline-block` para cualquier
   * <button>, y el texto de alrededor suele ir en <span> hermanos. */
  const padre = e.parentElement;
  if (!padre) return false;
  if (getComputedStyle(padre).display === "inline") return true;
  for (const n of padre.childNodes) {
    if (n.nodeType === Node.TEXT_NODE && (n.textContent ?? "").trim()) return true;
  }
  return false;
}

/** Pone o quita la imagen de un elemento. */
function marcar(e: HTMLElement, atributo: "vineta", src: string | null) {
  if (src) {
    e.dataset[atributo] = "true";
    e.style.setProperty(`--${atributo}`, `url("${src}")`);
  } else if (e.dataset[atributo]) {
    delete e.dataset[atributo];
    e.style.removeProperty(`--${atributo}`);
  }
}

/** Id estable por nodo, para la `key` del portal. */
const ids = new WeakMap<Element, number>();
let siguienteId = 0;
const idDe = (e: Element) => {
  if (!ids.has(e)) ids.set(e, ++siguienteId);
  return ids.get(e)!;
};

export function IlustrarFichas({ slug }: { slug: string }) {
  /* Las zonas se ilustran con una <img> de verdad, metida por portal, y no
   * con un ::before: cada laboratorio ya usa el ::before de su caja (la franja
   * de color de arriba) y el suyo gana al nuestro, o el nuestro se la come.
   * El estado vive en ESTE componente, que no pinta nada más: cambiarlo no
   * vuelve a dibujar el laboratorio. */
  const [zonas, setZonas] = useState<{ el: HTMLElement; src: string }[]>([]);

  useEffect(() => {
    /* El texto con el que se ilustró cada nodo: si no cambió, no se vuelve a
     * medir. `innerText` obliga a maquetar, y esto corre en cada cambio. */
    const hecho = new WeakMap<Element, string>();

    const ilustrar = () => {
      for (const e of document.querySelectorAll<HTMLElement>(FICHA)) {
        // Las que ya traen su propia viñeta (VinetaTermino) se respetan.
        if (e.querySelector("img")) continue;
        /* DENTRO DE LA PROSA, NO. En «marca los rasgos» las fichas son
         * palabras de un párrafo: un dibujo de 40 px parte la línea de lectura
         * y, si unas lo tienen y otras no, señala lo que el alumno debería
         * descubrir leyendo. Se reconoce porque su contenedor tiene texto
         * suelto alrededor; una bandeja de fichas no lo tiene. */
        if (enProsa(e)) {
          marcar(e, "vineta", null);
          continue;
        }
        const t = primeraLinea(e);
        if (hecho.get(e) === t) continue;
        hecho.set(e, t);
        marcar(e, "vineta", t ? imagenDeTermino(slug, t) : null);
      }
      const nuevas: { el: HTMLElement; src: string }[] = [];
      for (const e of document.querySelectorAll<HTMLElement>(ZONA)) {
        // Las 45 zonas que ya llevan `FondoTermino` tienen su <img> propia.
        if (e.querySelector(":scope > img:not([data-fondo-auto])")) continue;
        const src = imagenDeTermino(slug, primeraLinea(e));
        if (!src) { delete e.dataset.fondo; continue; }
        e.dataset.fondo = "true";
        nuevas.push({ el: e, src });
      }
      setZonas((antes) =>
        antes.length === nuevas.length && antes.every((z, i) => z.el === nuevas[i]!.el && z.src === nuevas[i]!.src)
          ? antes
          : nuevas,
      );
    };

    let cuadro = 0;
    const obs = new MutationObserver(() => {
      cancelAnimationFrame(cuadro);
      cuadro = requestAnimationFrame(ilustrar);
    });
    ilustrar();
    obs.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => {
      obs.disconnect();
      cancelAnimationFrame(cuadro);
    };
  }, [slug]);

  return (
    <>
      {zonas.map(({ el, src }) =>
        createPortal(
          <img
            data-fondo-auto=""
            src={src}
            alt=""
            aria-hidden
            loading="lazy"
            decoding="async"
            style={{
              /* CUADRADA, del alto de la zona: la mascara radial se centra en
               * la caja de la <img>, y si la caja es mas ancha que el dibujo
               * el borde del dibujo cae en la parte opaca y se ve un corte. */
              position: "absolute", right: "2%", bottom: "2%", height: "92%", width: "auto",
              aspectRatio: "1", maxWidth: "48%", objectFit: "contain",
              opacity: 0.55, filter: "saturate(.85)",
              /* Las ilustraciones son de fondo claro opaco: sin mascara, sobre
               * una tarjeta oscura se leen como un rectangulo gris. */
              maskImage: "radial-gradient(closest-side, #000 45%, transparent 90%)",
              WebkitMaskImage: "radial-gradient(closest-side, #000 45%, transparent 90%)",
              pointerEvents: "none", userSelect: "none", zIndex: -1,
            }}
          />,
          el,
          String(idDe(el)),
        ),
      )}
    <style>{`
      /* ── la ficha: su dibujo delante del nombre ─────────────────────── */
      [data-vineta="true"]::before {
        content: "";
        display: inline-block;
        vertical-align: middle;
        flex: 0 0 auto;
        width: 40px;
        height: 40px;
        margin-right: 8px;
        border-radius: 10px;
        background: var(--vineta) center / cover no-repeat;
        box-shadow: 0 2px 8px rgba(0,0,0,.35), inset 0 0 0 1px rgba(255,255,255,.14);
      }
      /* El cubito genérico que llevaban todas sobra en cuanto hay dibujo. */
      [data-vineta="true"] > i.fa-solid:first-child { display: none; }

      /* ── la zona: su dibujo al fondo, sin tapar el texto ───────────── */
      /* Un position:relative sin z-index NO crea contexto de apilamiento y el
         z-index:-1 se iria detras del fondo de la caja: hace falta isolation. */
      [data-fondo="true"] { position: relative; isolation: isolate; }
    `}</style>
    </>
  );
}
