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

export function ProgresoUACGrid({ items }: ProgresoUACGridProps) {
  const reducedMotion = useReducedMotion();
  const [gridRef, inView] = useInView<HTMLDivElement>();

  return (
    <div ref={gridRef} className="prog-uac-grid">
      {items.map((uac, i) => {
        const color = getRSCColor(uac.rscCodigo);

        return (
          <motion.div
            key={uac.codigo}
            className="prog-uac"
            style={{ "--chip-color": color.hex } as React.CSSProperties}
            initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ ...springs.smooth, delay: i * stagger.fast }}
          >
            <div className="prog-uac-top">
              <span className="prog-uac-code">{uac.codigo}</span>
              <span className="prog-uac-pct">{uac.pct}%</span>
            </div>

            <h3 className="prog-uac-name">{uac.nombre}</h3>

            <div className="prog-uac-bar">
              <div
                className="prog-uac-bar-fill"
                style={{ width: inView ? `${uac.pct}%` : "0%" }}
              />
            </div>

            <div className="prog-uac-foot">
              {uac.completadas}/{uac.total} progresiones
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
