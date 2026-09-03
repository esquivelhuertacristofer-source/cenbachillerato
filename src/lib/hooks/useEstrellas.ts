"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { guardarEstrellas, leerEstrellas } from "@/app/actions/guardarEstrellas";

/**
 * Persiste la mejor marca de estrellas (0-3) de un reto de lab.
 *
 * - Inicializa desde localStorage (SSR-safe, sin flash).
 * - Al montar, hidrata desde la BD (toma el MAX entre local y remoto).
 * - Al registrar, actualiza localStorage y persiste en la BD.
 */
export function useEstrellas(retoKey: string) {
  const [mejorEstrellas, setMejorEstrellas] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    try { return Number(window.localStorage.getItem(retoKey)) || 0; } catch { return 0; }
  });

  // Hidratación desde BD: toma el MAX para sincronizar entre dispositivos
  useEffect(() => {
    let cancelled = false;
    void leerEstrellas(retoKey).then((remoto) => {
      if (cancelled || remoto <= 0) return;
      setMejorEstrellas((local) => {
        const nx = Math.max(local, remoto);
        if (nx !== local) {
          try { window.localStorage.setItem(retoKey, String(nx)); } catch { /* noop */ }
        }
        return nx;
      });
    });
    return () => { cancelled = true; };
  }, [retoKey]);

  // La mejor marca que este cliente ya mandó al servidor. Sin esto, un lab que
  // registra cada vez que el alumno cumple un objetivo dispara una consulta por
  // objetivo, y todas menos la primera son para que el servidor conteste que ya
  // tenía algo igual o mejor. Es un ref y no estado: cambiarlo no debe pintar.
  const enviado = useRef(0);

  const registraEstrellas = useCallback(
    (est: number) => {
      setMejorEstrellas((m) => {
        const nx = Math.max(m, est);
        try { window.localStorage.setItem(retoKey, String(nx)); } catch { /* noop */ }
        return nx;
      });
      if (est > enviado.current) {
        enviado.current = est;
        void guardarEstrellas(retoKey, est);
      }
    },
    [retoKey],
  );

  return { mejorEstrellas, registraEstrellas };
}
