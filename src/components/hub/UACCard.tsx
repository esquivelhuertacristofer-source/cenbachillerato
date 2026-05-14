"use client";

import { useRef, type MouseEvent } from "react";
import Link from "next/link";
import { ProgressRing } from "@/components/ui/ProgressRing";

const tipoBadge: Record<string, string> = {
  sociocognitivo: "Recurso Sociocognitivo",
  area: "Área de Conocimiento",
  socioemocional: "Recurso Socioemocional",
};

const tipoGradient: Record<string, string> = {
  sociocognitivo: "from-[#0B2545] to-[#1E40AF]",
  area:           "from-[#0E2D56] to-[#2563EB]",
  socioemocional: "from-[#0B2545] to-[#0369A1]",
};

interface UACCardProps {
  codigo: string;
  nombre: string;
  icono?: string;
  colorClass?: string;
  totalProgresiones: number;
  semestre: number;
  tipo: "sociocognitivo" | "area" | "socioemocional";
}

export function UACCard({
  codigo,
  nombre,
  icono = "📚",
  totalProgresiones,
  semestre,
  tipo,
}: UACCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const auraRef = useRef<HTMLDivElement>(null);

  function onMouseMove(e: MouseEvent<HTMLDivElement>) {
    const el = cardRef.current;
    const aura = auraRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotX = ((y - cy) / cy) * -8;
    const rotY = ((x - cx) / cx) * 8;
    el.style.transition = "transform 0.1s ease";
    el.style.transform = `perspective(2000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;
    if (aura) {
      aura.style.opacity = "1";
      aura.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(125,211,252,0.12) 0%, transparent 65%)`;
    }
  }

  function onMouseLeave() {
    const el = cardRef.current;
    const aura = auraRef.current;
    if (el) {
      el.style.transition = "transform 0.7s cubic-bezier(0.23,1,0.32,1)";
      el.style.transform =
        "perspective(2000px) rotateX(0deg) rotateY(0deg) scale(1)";
    }
    if (aura) aura.style.opacity = "0";
  }

  const gradient = tipoGradient[tipo] ?? tipoGradient.sociocognitivo;

  return (
    <Link href={`/hub/uac/${codigo}`} className="block select-none">
      <div
        ref={cardRef}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className={[
          "relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br",
          gradient,
          "flex min-h-[300px] cursor-pointer flex-col gap-4 p-6",
          "shadow-[0_20px_50px_rgba(11,37,69,0.15)]",
        ].join(" ")}
      >
        {/* Dot-grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          aria-hidden="true"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        {/* Mouse aura flare */}
        <div
          ref={auraRef}
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300"
          aria-hidden="true"
        />

        {/* Header row: progress ring + semestre badge */}
        <div className="relative z-10 flex items-start justify-between">
          <div className="relative">
            <ProgressRing
              pct={0}
              size={48}
              stroke={4}
              color="#7DD3FC"
              trackColor="rgba(255,255,255,0.15)"
            />
            <span className="absolute inset-0 flex items-center justify-center text-lg">
              {icono}
            </span>
          </div>
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white/80">
            Sem. {semestre}
          </span>
        </div>

        {/* Body */}
        <div className="relative z-10 flex flex-1 flex-col gap-2">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cen-sky/80">
            {tipoBadge[tipo]}
          </p>
          <h3 className="text-lg font-bold leading-snug text-white">{nombre}</h3>
        </div>

        {/* Footer row */}
        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-3">
          <span className="text-xs text-white/50">
            {totalProgresiones} progresiones
          </span>
          <span className="text-xs font-bold text-cen-sky">
            Ver contenido →
          </span>
        </div>
      </div>
    </Link>
  );
}
