"use client";

import { motion } from "motion/react";
import { springs, stagger } from "@/lib/motion/tokens";
import { useReducedMotion } from "@/lib/motion/hooks";

interface RscColor {
  hex: string;
  rgba: string;
  faIcon: string;
}

interface FichaHeroSectionProps {
  titulo: string;
  categoria?: string | null;
  color: RscColor;
  uacNombre: string;
  tiempoLectura: number;
  leida: boolean;
}

export function FichaHeroSection({ titulo, categoria, color, uacNombre, tiempoLectura, leida }: FichaHeroSectionProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springs.smooth, delay: 0.08 }}
      style={{
        borderRadius: 20,
        background: `rgba(${color.rgba}, 0.08)`,
        border: `1.5px solid rgba(${color.rgba}, 0.18)`,
        padding: "32px 36px",
        marginBottom: 36,
      }}
    >
      {categoria && (
        <motion.span
          initial={reducedMotion ? {} : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springs.smooth, delay: 0.12 }}
          style={{ fontSize: 10, fontWeight: 800, color: color.hex, textTransform: "uppercase", letterSpacing: "0.14em", display: "block", marginBottom: 10 }}
        >
          {categoria}
        </motion.span>
      )}
      <motion.h1
        initial={reducedMotion ? {} : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springs.smooth, delay: 0.12 + stagger.fast }}
        style={{
          fontSize: "clamp(22px, 3vw, 34px)",
          fontWeight: 900, color: "#fff",
          margin: "0 0 16px", letterSpacing: "-0.04em", lineHeight: 1.12,
        }}
      >
        {titulo}
      </motion.h1>
      <motion.div
        initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springs.smooth, delay: 0.12 + stagger.fast * 2 }}
        style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>
          <i className={`fa-solid ${color.faIcon}`} style={{ color: color.hex }} />
          {uacNombre}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>
          <i className="fa-solid fa-clock" />
          {tiempoLectura} min de lectura
        </span>
        {leida && (
          <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#34D399", fontWeight: 700 }}>
            <i className="fa-solid fa-check-circle" />
            Leída
          </span>
        )}
      </motion.div>
    </motion.div>
  );
}
