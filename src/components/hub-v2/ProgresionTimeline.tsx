"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { springs, stagger } from "@/lib/motion/tokens";
import { useReducedMotion, useInView } from "@/lib/motion/hooks";
import { CATEGORIA_COMPLEMENTO } from "@/lib/queries/hub-browser";
import ProgresionCard from "./ProgresionCard";

interface Actividad {
  orden: number;
  tipo: string;
  estado: "no_iniciada" | "en_progreso" | "completada";
}

interface Progresion {
  id: string;
  numero: number;
  titulo: string;
  descripcion: string | null;
  ejes_articuladores: string[] | null;
  categoria: string | null;
  estado: "no_iniciada" | "en_progreso" | "completada";
  actividades: Actividad[];
}

interface ProgresionTimelineProps {
  progresiones: Progresion[];
  codigoUAC: string;
  accentColor: string;
  accentRgb: string;
  uacEmoji: string;
}

export default function ProgresionTimeline({
  progresiones,
  codigoUAC,
  accentColor,
  accentRgb,
  uacEmoji,
}: ProgresionTimelineProps) {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const [listRef, inView] = useInView<HTMLDivElement>();

  function getStatus(prog: Progresion, index: number): "locked" | "available" | "completed" {
    if (prog.estado === "completada") return "completed";
    if (index > 0 && progresiones[index - 1]!.estado === "no_iniciada") return "locked";
    return "available";
  }

  return (
    <div ref={listRef} style={{ display: "flex", flexDirection: "column" }}>
      {progresiones.map((prog, i) => {
        const esComplemento = prog.categoria === CATEGORIA_COMPLEMENTO;
        const primerComplemento =
          esComplemento && (i === 0 || progresiones[i - 1]!.categoria !== CATEGORIA_COMPLEMENTO);
        return (
        <div key={prog.id}>
          {primerComplemento && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                margin: "12px 0 28px",
                color: "rgba(255,255,255,0.34)",
                fontSize: 12,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.18em",
              }}
            >
              <i className="fa-solid fa-plus" style={{ fontSize: 11 }} />
              Contenido complementario · no oficial 2025
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.10)" }} />
            </div>
          )}
        <motion.div
          initial={reducedMotion ? {} : { opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ ...springs.smooth, delay: i * stagger.fast }}
        >
          <ProgresionCard
            numero={prog.numero}
            titulo={prog.titulo}
            descripcion={prog.descripcion}
            ejesArticuladores={prog.ejes_articuladores}
            actividades={prog.actividades}
            status={getStatus(prog, i)}
            isLast={i === progresiones.length - 1}
            accentColor={accentColor}
            accentRgb={accentRgb}
            uacEmoji={uacEmoji}
            onClick={() => router.push(`/hub/uac/${codigoUAC}/progresion/${prog.numero}`)}
          />
        </motion.div>
        </div>
        );
      })}
    </div>
  );
}
