"use client";

/**
 * PLANTILLA de Práctica experimental (laboratorio como componente React).
 *
 * Copia este archivo para crear un laboratorio nuevo:
 *   1. Duplica este archivo en src/components/practicas/labs/MiLaboratorio.tsx
 *   2. Renombra el componente y programa la interacción que necesites.
 *   3. Regístralo en src/components/practicas/registry.tsx con un slug único.
 *   4. Asocia el slug a una actividad con: npx tsx scripts/set-practica.ts <CODIGO_ACTIVIDAD> <slug>
 *
 * Recibe `props: PracticaLabProps` (color del área y datos de la actividad) por si
 * quieres usarlos. No necesitas guardar progreso; esta sección es solo la práctica.
 */

import { useState } from "react";
import type { PracticaLabProps } from "../registry";

export function PlantillaPractica({ color }: PracticaLabProps) {
  // Ejemplo mínimo de interactividad: un control que modifica un valor en vivo.
  const [valor, setValor] = useState(50);

  return (
    <div
      style={{
        borderRadius: 20,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.04)",
        padding: "32px 28px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          alignSelf: "flex-start",
          fontSize: 10,
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          color: "#CA8A04",
          padding: "5px 12px",
          background: "rgba(202,138,4,0.10)",
          border: "1px solid rgba(202,138,4,0.25)",
          borderRadius: 999,
        }}
      >
        <i className="fa-solid fa-pen-ruler" style={{ fontSize: 9 }} />
        Plantilla — reemplazar con el laboratorio real
      </div>

      <p style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.70)", margin: 0 }}>
        Esta es la <strong>sección de práctica experimental</strong>. Aquí se monta el
        laboratorio/simulador interactivo programado como componente React. El ejemplo de
        abajo solo demuestra que la interactividad funciona; sustitúyelo por tu laboratorio.
      </p>

      {/* Demo de interactividad */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <label style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
          Variable de ejemplo: {valor}
        </label>
        <input
          type="range"
          min={0}
          max={100}
          value={valor}
          onChange={(e) => setValor(Number(e.target.value))}
          style={{ width: "100%", accentColor: color.hex }}
        />
        <div
          style={{
            height: 14,
            borderRadius: 999,
            background: "rgba(255,255,255,0.06)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${valor}%`,
              background: color.hex,
              transition: "width 0.15s ease",
            }}
          />
        </div>
      </div>
    </div>
  );
}
