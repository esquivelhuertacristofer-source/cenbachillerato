"use client";

import React, { useState } from "react";
import Link from "next/link";
import { getUACConfig } from "./uac-config";

const R = 18;
const C = 2 * Math.PI * R;

function ProgressRing({ pct }: { pct: number }) {
  const offset = C - (pct / 100) * C;
  return (
    <div className="relative flex items-center justify-center">
      <svg width="40" height="40" viewBox="0 0 40 40" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="20" cy="20" r={R} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3.5" />
        <circle
          cx="20" cy="20" r={R} fill="none" stroke="white" strokeWidth="3.5"
          strokeDasharray={C} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <span className="absolute text-[9px] font-black text-white leading-none">{pct}%</span>
    </div>
  );
}

interface UACCardProps {
  codigo: string;
  nombre: string;
  done: number;
  total: number;
  pct: number;
}

export default function UACCard({ codigo, nombre, done, total, pct }: UACCardProps) {
  const cfg = getUACConfig(codigo);
  const isComplete = done === total && total > 0;
  const isStarted = done > 0 && !isComplete;

  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [auraPos, setAuraPos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setTilt({ x: (y - rect.height / 2) / 1000, y: (rect.width / 2 - x) / 1000 });
    setAuraPos({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  const displayTitle = cfg.shortTitle || nombre;

  return (
    <Link
      href={`/hub/uac/${codigo}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(2000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: "all 1.5s cubic-bezier(0.23, 1, 0.32, 1)",
        textDecoration: "none",
        display: "block",
        outline: isComplete ? "2px solid #34D399" : "none",
        outlineOffset: isComplete ? "4px" : "0",
      }}
      className="group relative flex flex-col justify-end overflow-hidden rounded-[2.5rem] min-h-[350px] shadow-lg hover:shadow-[0_40px_80px_rgba(0,0,0,0.5)] transition-shadow duration-500"
    >
      {/* Mouse aura (flare) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"
        style={{
          background: `radial-gradient(circle at ${auraPos.x}% ${auraPos.y}%, rgba(255,255,255,0.18) 0%, transparent 60%)`,
        }}
      />

      {/* Gradient background */}
      <div
        className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
        style={{ background: cfg.bg }}
      />

      {/* Dot-grid texture */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: "radial-gradient(white 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      {/* Colored glow orb top-right */}
      <div
        className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl"
        style={{ background: cfg.glow }}
      />
      {/* Dark shadow orb bottom-left */}
      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-black/20 rounded-full blur-2xl" />

      {/* Emoji icon + progress ring */}
      <div className="absolute inset-0 flex items-center justify-center pb-24">
        <div className="relative">
          <div
            className="w-28 h-28 rounded-[2rem] flex items-center justify-center text-6xl shadow-2xl group-hover:scale-110 transition-transform duration-500 border border-white/20"
            style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)" }}
          >
            {cfg.emoji}
          </div>
          <div className="absolute -top-3 -right-3">
            <ProgressRing pct={pct} />
          </div>
        </div>
      </div>

      {/* Bottom gradient overlay + content */}
      <div className="relative z-10 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-6 pt-12 pb-6 flex flex-col gap-3">
        <div>
          <p className="text-white/50 text-[9px] font-black uppercase tracking-[0.3em] mb-0.5">
            {codigo}
          </p>
          <h3 className="text-white font-black text-2xl leading-tight tracking-tight">
            {displayTitle}
          </h3>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-white/60 text-[10px] font-bold">
              {done} de {total} progresiones
            </span>
            {isComplete && (
              <span className="text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                ✓ Completada
              </span>
            )}
          </div>
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div
          className={`w-full py-3 rounded-2xl text-center text-[11px] font-black uppercase tracking-widest transition-all duration-200 ${
            isComplete
              ? "bg-emerald-400 text-emerald-900"
              : isStarted
              ? "bg-white text-[#011C40]"
              : "bg-white/20 text-white/80 border border-white/20 group-hover:bg-white/30"
          }`}
        >
          {isComplete ? "✓ Completada" : isStarted ? "Continuar →" : "Comenzar →"}
        </div>
      </div>
    </Link>
  );
}
