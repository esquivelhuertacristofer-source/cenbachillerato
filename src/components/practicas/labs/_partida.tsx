"use client";

/**
 * LA PARTIDA — precisión, racha y estrellas que se ganan.
 *
 * El problema que resuelve: en 43 de los 45 laboratorios DOM las estrellas se
 * calculaban así:
 *
 *     const estrellas = (modoADone ? 1 : 0) + (modoBDone ? 1 : 0) + (modoCDone ? 1 : 0);
 *
 * Es decir, 3★ por terminar, sin importar cuántas veces te equivocaras. No
 * existía ninguna forma de hacerlo mal, así que tampoco había razón para
 * intentarlo bien ni para volver a jugar: era una hoja de trabajo con arrastre,
 * no una práctica. Aquí vive la contabilidad que le faltaba.
 *
 * Cómo se ganan las estrellas (se le dice al alumno en el marcador, no se
 * esconde):
 *   · con los tres modos terminados y 2 errores o menos → 3★
 *   · con los tres modos terminados                     → 2★
 *   · antes de terminar → una estrella por modo completado (igual que antes,
 *     para que el avance se vea mientras juega)
 *
 * Terminar sigue valiendo una buena marca; lo que ahora hay que ganarse es la
 * tercera estrella. Como `useEstrellas` guarda el MÁXIMO, repetir para mejorar
 * la marca tiene sentido y nunca la empeora.
 *
 * NO hay cronómetro a propósito. Meter prisa castiga al que piensa despacio y
 * al que usa lector de pantalla, y no mide nada que nos importe: la precisión
 * sí.
 */

import { useCallback, useMemo, useState } from "react";
import { T } from "./_kit";

export interface Partida {
  aciertos: number;
  errores: number;
  /** Aciertos seguidos sin fallar. */
  racha: number;
  /** La racha más larga de esta sesión. */
  mejorRacha: number;
  /** Porcentaje 0-100, o null si todavía no hay ningún intento. */
  precision: number | null;
  acierto: () => void;
  error: () => void;
  reiniciar: () => void;
  /** Estrellas (0-3) dado cuántos modos lleva completados. */
  estrellasCon: (modosHechos: number, modosTotales?: number) => number;
}

/** Errores máximos que todavía permiten la tercera estrella. */
export const ERRORES_PARA_TRES = 2;

export function usePartida(): Partida {
  const [aciertos, setAciertos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [racha, setRacha] = useState(0);
  const [mejorRacha, setMejorRacha] = useState(0);

  const acierto = useCallback(() => {
    setAciertos((n) => n + 1);
    setRacha((r) => {
      const nx = r + 1;
      setMejorRacha((m) => (nx > m ? nx : m));
      return nx;
    });
  }, []);

  const error = useCallback(() => {
    setErrores((n) => n + 1);
    setRacha(0);
  }, []);

  const reiniciar = useCallback(() => {
    setAciertos(0);
    setErrores(0);
    setRacha(0);
  }, []);

  const estrellasCon = useCallback(
    (modosHechos: number, modosTotales = 3) => {
      if (modosHechos < modosTotales) return modosHechos;
      return errores <= ERRORES_PARA_TRES ? 3 : 2;
    },
    [errores]
  );

  const precision = useMemo(() => {
    const total = aciertos + errores;
    return total === 0 ? null : Math.round((aciertos / total) * 100);
  }, [aciertos, errores]);

  return { aciertos, errores, racha, mejorRacha, precision, acierto, error, reiniciar, estrellasCon };
}

const ORO = "#FFC75A";
const MAL = "#FF5E5E";

/**
 * Marcador vivo de la partida. Va en la barra del laboratorio, junto a los
 * botones. Compacto a propósito: no compite con la práctica, pero deja ver la
 * racha subiendo y los errores gastándose.
 */
export function MarcadorPartida({
  partida,
  accent,
  rgba,
}: {
  partida: Partida;
  accent: string;
  rgba: string;
}) {
  const { racha, errores, precision } = partida;
  const quedan = Math.max(0, ERRORES_PARA_TRES - errores);
  const enRacha = racha >= 3;

  return (
    <div
      className="pt-marcador"
      title={`Tercera estrella: termina los tres modos con ${ERRORES_PARA_TRES} errores o menos.`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        padding: "7px 13px",
        borderRadius: 11,
        border: `1px solid ${enRacha ? `${ORO}66` : T.line}`,
        background: enRacha ? `${ORO}14` : T.glass,
        boxShadow: enRacha ? `0 0 22px -8px rgba(${rgba},0.55)` : "none",
        transition: "all .2s",
        fontSize: 12.5,
        fontWeight: 800,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: enRacha ? ORO : T.text3 }}>
        <i className={`fa-solid ${enRacha ? "fa-fire" : "fa-bolt"}`} style={{ fontSize: 12 }} />
        <span style={{ fontVariantNumeric: "tabular-nums" }}>{racha}</span>
        <span style={{ fontWeight: 600, color: T.text3 }}>racha</span>
      </span>

      <span aria-hidden="true" style={{ width: 1, height: 16, background: T.line }} />

      <span
        style={{ display: "inline-flex", alignItems: "center", gap: 6, color: quedan === 0 ? MAL : T.text2 }}
      >
        <i className="fa-solid fa-star" style={{ fontSize: 11, color: quedan === 0 ? MAL : ORO }} />
        <span style={{ fontWeight: 600 }}>
          {quedan === 0 ? "3.ª estrella perdida" : `${quedan} error${quedan === 1 ? "" : "es"} para 3★`}
        </span>
      </span>

      {precision !== null && (
        <>
          <span aria-hidden="true" style={{ width: 1, height: 16, background: T.line }} />
          <span style={{ color: accent, fontVariantNumeric: "tabular-nums" }}>
            {precision}%
            <span style={{ color: T.text3, fontWeight: 600, marginLeft: 5 }}>precisión</span>
          </span>
        </>
      )}
    </div>
  );
}

/**
 * LOGROS QUE NO SE DESMARCAN.
 *
 * Muchos laboratorios 3D listan objetivos con un `done` calculado en vivo, del
 * estilo `modo === "crispr" && cortar`. El efecto es que el alumno cumple el
 * objetivo, cambia de modo y la palomita desaparece: el laboratorio le quita lo
 * que ya había hecho. Este enganche recuerda cada objetivo cumplido durante la
 * sesión y no lo suelta.
 *
 * El ajuste va DURANTE el render, que es el patrón que React documenta para
 * estado derivado; con un `useEffect` habría un fotograma con la palomita
 * apagada y una segunda pasada por cada objetivo.
 */
export function useLogros(hechosAhora: boolean[]): {
  /** Igual que la entrada, pero cada posición se queda en `true` para siempre. */
  logros: boolean[];
  cumplidos: number;
  total: number;
} {
  const [memoria, setMemoria] = useState<boolean[]>(hechosAhora);

  const siguiente = hechosAhora.map((h, i) => h || memoria[i] === true);
  const cambio =
    siguiente.length !== memoria.length || siguiente.some((v, i) => v !== memoria[i]);
  if (cambio) setMemoria(siguiente);

  return {
    logros: siguiente,
    cumplidos: siguiente.filter(Boolean).length,
    total: siguiente.length,
  };
}
