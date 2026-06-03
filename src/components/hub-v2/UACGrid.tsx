"use client";

import { motion } from "motion/react";
import { springs, stagger } from "@/lib/motion/tokens";
import { useReducedMotion, useInView } from "@/lib/motion/hooks";
import { EmptyState } from "@/components/ui/EmptyState";
import UACCard from "./UACCard";

interface UACItem {
  codigo: string;
  nombre: string;
  done: number;
  total: number;
  pct: number;
}

interface UACGridProps {
  items: UACItem[];
}

export default function UACGrid({ items }: UACGridProps) {
  const reducedMotion = useReducedMotion();
  const [gridRef, inView] = useInView<HTMLDivElement>();

  if (items.length === 0) {
    return (
      <EmptyState
        icon="📚"
        title="Sin materias asignadas"
        description="Aún no hay materias registradas para tu semestre. Contacta a tu docente para que configure tu grupo."
        variant="dark"
      />
    );
  }

  return (
    <div
      ref={gridRef}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      {items.map((item, i) => (
        <motion.div
          key={item.codigo}
          initial={reducedMotion ? {} : { opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ ...springs.smooth, delay: i * stagger.fast }}
        >
          <UACCard
            codigo={item.codigo}
            nombre={item.nombre}
            done={item.done}
            total={item.total}
            pct={item.pct}
          />
        </motion.div>
      ))}
    </div>
  );
}
