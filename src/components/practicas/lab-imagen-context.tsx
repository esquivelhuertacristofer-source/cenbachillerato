"use client";

/**
 * Imagen del laboratorio, disponible dentro de la práctica.
 *
 * Cada lab tiene una carátula propia (`public/media/semN/labs/<slug>.webp`,
 * 137 de 140) que hasta ahora sólo se veía en el catálogo de laboratorios: al
 * entrar a la práctica desaparecía y el encabezado mostraba el mismo icono de
 * matraz para todos. Este contexto la lleva adentro, para que el encabezado y
 * la ficha teórica muestren de qué trata la práctica antes de leer una palabra.
 *
 * Va por contexto y no por props porque los 140 laboratorios montan
 * `<FichaTeorica>` desde su propio shell: pasarlo a mano serían 140 ediciones
 * para el mismo dato, que `PracticaRunner` ya conoce.
 *
 * El valor por defecto es `null`: una `FichaTeorica` montada fuera de una
 * práctica simplemente no dibuja imagen.
 */

import { createContext, useContext, type ReactNode } from "react";

export interface LabImagen {
  /** Ruta pública de la carátula, ya resuelta. */
  src: string;
  /** Texto alternativo: el título de la práctica. */
  alt: string;
}

const LabImagenContext = createContext<LabImagen | null>(null);

export function LabImagenProvider({
  valor,
  children,
}: {
  valor: LabImagen | null;
  children: ReactNode;
}) {
  return <LabImagenContext.Provider value={valor}>{children}</LabImagenContext.Provider>;
}

export function useLabImagen(): LabImagen | null {
  return useContext(LabImagenContext);
}
