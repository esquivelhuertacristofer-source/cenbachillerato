"use client";

/**
 * Destinos del marco del laboratorio: el ESCENARIO, el CAJÓN de teoría y el
 * de la guía docente.
 *
 * El defecto que arregla: cada laboratorio armaba su propia página en una sola
 * columna —ficha, botones, una caja 3D de 420 px, tarjetas, más tarjetas— y la
 * pantalla mostraba una cuarta parte de lo que había. La escena era una
 * ventanita a media página y para mover lo que se veía había que bajar.
 *
 * Ahora el MARCO (`MarcoLab.tsx`) pone la escena a todo lo que da la pantalla
 * y el resto del laboratorio en un panel lateral que se desplaza por dentro.
 * El laboratorio no tiene que reacomodarse: envuelve su escena en
 * `<EscenaLab>` y ésta se va al escenario por un portal, venga de donde venga
 * en su árbol. La ficha teórica y la guía docente hacen lo mismo hacia sus
 * cajones, así que dejan de ocupar el panel.
 *
 * Fuera del marco (una prueba, otra página) los tres componentes se pintan en
 * su lugar, como antes: nada depende de que el marco exista.
 *
 * NO importa three: seguro desde cualquier shell.
 */

import {
  createContext,
  useContext,
  useLayoutEffect,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

export type Destino = "escena" | "teoria" | "guia" | "lleno" | "ancho";

export interface DestinosLab {
  /** Los nodos del marco donde aterriza cada cosa (null mientras se montan). */
  nodos: Record<"escena" | "teoria" | "guia", HTMLElement | null>;
  /** El laboratorio avisa que usa (1) o deja de usar (-1) un destino. */
  avisar: (d: Destino, delta: 1 | -1) => void;
  /** El escenario es de papel claro (fases tempranas) o de noche (el resto). */
  tono: "noche" | "papel";
}

export const DestinosLabCtx = createContext<DestinosLab | null>(null);

/** Registra que este componente ocupa un destino mientras esté montado. */
function useOcupar(d: Destino | null) {
  const ctx = useContext(DestinosLabCtx);
  const avisar = ctx?.avisar;
  // De diseño (layout) y no de efecto: el marco decide si muestra el escenario
  // antes de pintar, y así el laboratorio no aparece un cuadro a todo lo ancho
  // y luego salta al panel.
  useLayoutEffect(() => {
    if (!avisar || !d) return undefined;
    avisar(d, 1);
    return () => avisar(d, -1);
  }, [avisar, d]);
  return ctx;
}

/**
 * La escena del laboratorio. Dentro del marco llena el escenario; fuera de él
 * es una caja alta como la de siempre.
 *
 * `arriba` y `pie` son controles que viven SOBRE la escena (selector de modo
 * arriba, botones o deslizadores abajo): lo que el alumno mueve queda junto a
 * lo que cambia, sin bajar.
 */
export function EscenaLab({
  children,
  fondo,
  arriba,
  pie,
  alto = "clamp(360px, 60vh, 680px)",
  lleno = false,
  panelAncho = false,
}: {
  children: ReactNode;
  /** Fondo detrás del lienzo (el lienzo de three suele ser transparente). */
  fondo?: string;
  arriba?: ReactNode;
  pie?: ReactNode;
  /** Alto fuera del marco. */
  alto?: CSSProperties["height"];
  /**
   * La escena trae sus propios paneles flotantes (atlas, explorador): ocupa
   * todo el cuerpo del marco y el panel lateral se quita.
   */
  lleno?: boolean;
  /**
   * El panel trae algo que necesita ancho (la tabla periódica de 18
   * columnas): el panel crece y la escena cede.
   */
  panelAncho?: boolean;
}) {
  const ctx = useOcupar("escena");
  useOcupar(lleno ? "lleno" : null);
  useOcupar(panelAncho ? "ancho" : null);
  const nodo = ctx?.nodos.escena;
  const contenido = (
    <>
      <div className="lx-lienzo">{children}</div>
      {arriba ? <div className="lx-sobre-arriba">{arriba}</div> : null}
      {pie ? <div className="lx-sobre-pie">{pie}</div> : null}
    </>
  );
  if (!ctx) {
    return (
      <div className="lx-escena-suelta" style={{ position: "relative", height: alto, borderRadius: 18, overflow: "hidden", background: fondo }}>
        {contenido}
      </div>
    );
  }
  if (!nodo) return null;
  return createPortal(
    <div className="lx-escena-in" style={fondo ? { background: fondo } : undefined}>
      {contenido}
    </div>,
    nodo,
  );
}

/**
 * Manda su contenido al cajón de teoría o al de la guía docente. Fuera del
 * marco lo pinta en su lugar.
 */
export function EnCajon({ destino, children }: { destino: "teoria" | "guia"; children: ReactNode }) {
  const ctx = useOcupar(destino);
  if (!ctx) return <>{children}</>;
  const nodo = ctx.nodos[destino];
  return nodo ? createPortal(children, nodo) : null;
}

/** ¿Este componente está dentro del marco? (para quitar márgenes de página). */
export function useEnMarco(): DestinosLab | null {
  return useContext(DestinosLabCtx);
}
