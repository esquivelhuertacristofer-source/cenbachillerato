"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { springs, stagger } from "@/lib/motion/tokens";
import { useReducedMotion, useInView } from "@/lib/motion/hooks";
import "@/app/hub/biblioteca/Biblioteca.css";

interface Ficha {
  id: string;
  slug: string;
  titulo: string;
  categoria?: string | null;
  tiempo_lectura_minutos: number;
  leida: boolean;
}

interface RscColor {
  hex: string;
  rgba: string;
  faIcon: string;
}

interface FichaCardProps {
  ficha: Ficha;
  color: RscColor;
  uacCodigo: string;
  index: number;
  inView: boolean;
  reducedMotion: boolean;
}

function FichaCard({ ficha, color, uacCodigo, index, inView, reducedMotion }: FichaCardProps) {
  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0, y: 18 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ ...springs.smooth, delay: index * stagger.fast }}
    >
      <Link
        href={`/hub/biblioteca/${uacCodigo}/ficha/${ficha.slug}`}
        className={`biblio-card ${ficha.leida ? "is-read" : ""}`}
        style={{ "--chip-color": color.hex } as React.CSSProperties}
      >
        {ficha.categoria && <span className="biblio-card-tag">{ficha.categoria}</span>}

        <h3 className="biblio-card-title">{ficha.titulo}</h3>

        <div className="biblio-card-foot">
          <span className="biblio-card-time">
            <i className="fa-solid fa-clock" />
            {ficha.tiempo_lectura_minutos} min
          </span>
          {ficha.leida && (
            <span className="biblio-card-read">
              <i className="fa-solid fa-check" />
              Leída
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

interface BibliotecaFichaGridProps {
  fichas: Ficha[];
  color: RscColor;
  uacCodigo: string;
  columns?: string;
}

export function BibliotecaFichaGrid({ fichas, color, uacCodigo, columns }: BibliotecaFichaGridProps) {
  const reducedMotion = useReducedMotion();
  const [gridRef, inView] = useInView<HTMLDivElement>();

  return (
    <div
      ref={gridRef}
      className="biblio-grid"
      style={columns ? { gridTemplateColumns: columns } : undefined}
    >
      {fichas.map((ficha, i) => (
        <FichaCard
          key={ficha.id}
          ficha={ficha}
          color={color}
          uacCodigo={uacCodigo}
          index={i}
          inView={inView}
          reducedMotion={reducedMotion}
        />
      ))}
    </div>
  );
}
