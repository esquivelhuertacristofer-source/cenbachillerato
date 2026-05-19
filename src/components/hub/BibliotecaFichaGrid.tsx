"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { springs, stagger } from "@/lib/motion/tokens";
import { useReducedMotion, useMouseAura, useInView } from "@/lib/motion/hooks";

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
  const auraRef = useMouseAura<HTMLDivElement>();

  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ ...springs.smooth, delay: index * stagger.fast }}
      whileHover={reducedMotion ? {} : { y: -3, scale: 1.02 }}
      whileTap={reducedMotion ? {} : { scale: 0.98 }}
    >
      <Link href={`/hub/biblioteca/${uacCodigo}/ficha/${ficha.slug}`} style={{ textDecoration: "none", display: "block" }}>
        <div
          ref={auraRef}
          style={{
            position: "relative",
            background: "rgba(255,255,255,0.04)",
            borderRadius: 14,
            border: ficha.leida
              ? "1.5px solid rgba(52,211,153,0.25)"
              : "1px solid rgba(255,255,255,0.08)",
            overflow: "hidden",
            transition: "border-color 0.2s ease, box-shadow 0.2s ease",
          }}
        >
          {/* Mouse aura */}
          {!reducedMotion && (
            <div
              aria-hidden="true"
              style={{
                position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2,
                background: "radial-gradient(150px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.05), transparent 70%)",
              }}
            />
          )}

          {/* Thumbnail */}
          <div style={{
            height: 90, background: `rgba(${color.rgba}, 0.08)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative",
          }}>
            <i className={`fa-solid ${color.faIcon}`} style={{ fontSize: 32, color: `rgba(${color.rgba}, 0.35)` }} />
            {ficha.leida && (
              <div style={{
                position: "absolute", top: 8, right: 8,
                background: "rgba(52,211,153,0.85)", borderRadius: 999,
                padding: "2px 8px", fontSize: 9, fontWeight: 700, color: "#022C22",
                display: "flex", alignItems: "center", gap: 3,
              }}>
                <i className="fa-solid fa-check" style={{ fontSize: 7 }} />
                Leída
              </div>
            )}
          </div>

          {/* Content */}
          <div style={{ padding: "12px 14px 14px", position: "relative", zIndex: 1 }}>
            {ficha.categoria && (
              <span style={{
                fontSize: 9, fontWeight: 700, color: color.hex,
                textTransform: "uppercase", letterSpacing: "0.10em",
                display: "block", marginBottom: 5,
              }}>
                {ficha.categoria}
              </span>
            )}
            <p style={{
              fontSize: 13, fontWeight: 700, color: "#fff",
              margin: "0 0 8px", lineHeight: 1.3,
              overflow: "hidden", display: "-webkit-box",
              WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
            }}>
              {ficha.titulo}
            </p>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>
              <i className="fa-solid fa-clock" style={{ fontSize: 9, marginRight: 4 }} />
              {ficha.tiempo_lectura_minutos} min
            </span>
          </div>
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

export function BibliotecaFichaGrid({ fichas, color, uacCodigo, columns = "repeat(auto-fill, minmax(220px, 1fr))" }: BibliotecaFichaGridProps) {
  const reducedMotion = useReducedMotion();
  const [gridRef, inView] = useInView<HTMLDivElement>();

  return (
    <div
      ref={gridRef}
      style={{ display: "grid", gridTemplateColumns: columns, gap: 14 }}
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
