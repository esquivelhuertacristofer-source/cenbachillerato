"use client";

/**
 * Kit compartido de los laboratorios 3D (practicas/labs).
 *
 * Tokens de diseño, helpers y componentes de UI que antes se duplicaban
 * (byte por byte) en cada Lab*.tsx. Centralizarlos elimina ~1.6k líneas
 * repetidas y asegura que un ajuste visual aplique a los 11 labs a la vez.
 *
 * NO importa three ni @react-three: es seguro importarlo desde los shells sin
 * arrastrar three.js a su bundle (three vive solo en los *Scene.tsx).
 */

import { Component, type CSSProperties, type ReactNode } from "react";

/* ── Tokens de diseño (tema oscuro, coherente con PracticaRunner) ─────── */
export const T = {
  text: "#ffffff",
  text2: "rgba(255,255,255,0.64)",
  text3: "rgba(255,255,255,0.42)",
  line: "rgba(255,255,255,0.10)",
  lineStrong: "rgba(255,255,255,0.18)",
  glass: "rgba(255,255,255,0.035)",
  glassSoft: "rgba(255,255,255,0.06)",
  inset: "rgba(2,12,28,0.55)",
  shadow: "0 1px 0 rgba(255,255,255,0.04) inset, 0 18px 44px -24px rgba(0,0,0,0.7)",
};

export const NUM: CSSProperties = { fontVariantNumeric: "tabular-nums" };
export const OK = "#34D399";

/** Estilo base de las tarjetas (glass). */
export const card: CSSProperties = {
  background: T.glass,
  border: `1px solid ${T.line}`,
  borderRadius: 18,
  boxShadow: T.shadow,
  backdropFilter: "blur(10px)",
};

/* ── Componentes de UI ────────────────────────────────────────────────── */

export const Eyebrow = ({ children }: { children: ReactNode }) => (
  <p style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: T.text3, margin: "0 0 13px" }}>{children}</p>
);

/**
 * Lectura numérica con etiqueta. `unit` opcional muestra una unidad pequeña.
 * `size`/`weight` ajustan la tipografía del valor (default 19/800).
 */
export const Readout = ({
  label,
  value,
  unit,
  col,
  size = 19,
  weight = 800,
}: {
  label: string;
  value: string;
  unit?: string;
  col?: string;
  size?: number;
  weight?: number;
}) => (
  <div style={{ flex: 1, padding: "13px 8px", textAlign: "center" }}>
    <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", color: T.text3, textTransform: "uppercase" }}>{label}</div>
    <div style={{ marginTop: 6, fontSize: size, fontWeight: weight, color: col ?? T.text, ...NUM, textShadow: col ? `0 0 18px ${col}55` : "none" }}>
      {value}
      {unit ? <span style={{ fontSize: 11, fontWeight: 600, color: T.text3 }}> {unit}</span> : null}
    </div>
  </div>
);

/* ── Error boundary: si la escena 3D falla ────────────────────────────── */
export class SceneBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
