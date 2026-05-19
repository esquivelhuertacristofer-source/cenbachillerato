"use client";

import { motion } from "motion/react";
import { springs, stagger } from "@/lib/motion/tokens";
import { useReducedMotion, useInView } from "@/lib/motion/hooks";
import { getRSCColor } from "./hub-colors";

interface UACProgresoItem {
  codigo: string;
  nombre: string;
  rscCodigo: string;
  pct: number;
  completadas: number;
  total: number;
}

interface ProgresoUACGridProps {
  items: UACProgresoItem[];
}

const R = 28;
const CIRC = 2 * Math.PI * R;

export function ProgresoUACGrid({ items }: ProgresoUACGridProps) {
  const reducedMotion = useReducedMotion();
  const [gridRef, inView] = useInView<HTMLDivElement>();

  return (
    <div
      ref={gridRef}
      style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}
    >
      {items.map((uac, i) => {
        const color = getRSCColor(uac.rscCodigo);
        const offset = CIRC * (1 - uac.pct / 100);

        return (
          <motion.div
            key={uac.codigo}
            initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ ...springs.smooth, delay: i * stagger.fast }}
            whileHover={reducedMotion ? {} : { y: -2, scale: 1.02 }}
            whileTap={reducedMotion ? {} : { scale: 0.98 }}
            style={{
              borderRadius: 16,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              padding: "18px",
              display: "flex", alignItems: "center", gap: 14,
              cursor: "default",
            }}
          >
            {/* Mini donut */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <svg width={64} height={64} viewBox="0 0 64 64" style={{ transform: "rotate(-90deg)" }}>
                <circle cx={32} cy={32} r={R} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth={5} />
                {uac.pct > 0 && (
                  <circle
                    cx={32} cy={32} r={R}
                    fill="none" stroke={color.hex} strokeWidth={5}
                    strokeDasharray={CIRC}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 1s ease" }}
                  />
                )}
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: "#fff" }}>{uac.pct}%</span>
              </div>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: color.hex, textTransform: "uppercase", letterSpacing: "0.10em", marginBottom: 3 }}>
                {uac.codigo}
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", lineHeight: 1.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {uac.nombre.split(" ").slice(0, 3).join(" ")}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
                {uac.completadas}/{uac.total} prog.
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
