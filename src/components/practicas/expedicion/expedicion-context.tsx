"use client";

/**
 * Avisa a las piezas de un laboratorio que están corriendo DENTRO de una
 * expedición. Lo usa `_ficha.tsx`: la ficha teórica ya se recorre completa en
 * el capítulo 1, así que dentro del laboratorio se muestra plegada y como
 * consulta, no como la presentación del tema. Sin este aviso, el alumno vería
 * la misma ficha dos veces seguidas.
 *
 * Fuera de una expedición el hook devuelve `false` y todo sigue igual que
 * siempre, así que ningún laboratorio necesita cambiar.
 */

import { createContext, useContext } from "react";

const Ctx = createContext(false);

export function DentroDeExpedicion({ children }: { children: React.ReactNode }) {
  return <Ctx.Provider value={true}>{children}</Ctx.Provider>;
}

export function useDentroDeExpedicion(): boolean {
  return useContext(Ctx);
}
