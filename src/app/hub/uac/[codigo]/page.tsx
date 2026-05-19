"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { springs, stagger } from "@/lib/motion/tokens";
import { useReducedMotion } from "@/lib/motion/hooks";
import { getUACPorCodigo } from "@/lib/mccems/estructura";
import {
  getCurrentProfile,
  getProgresionesConEstadoBrowser,
  type ProgresionBrowser,
} from "@/lib/queries/hub-browser";
import { getUACConfig } from "@/components/hub-v2/uac-config";
import ProgresionTimeline from "@/components/hub-v2/ProgresionTimeline";
import "../../HubV5.css";

function UACPageSkeleton({ accentColor }: { accentColor: string }) {
  return (
    <div style={{ minHeight: "100vh", background: "#011126" }}>
      {/* Nav skeleton */}
      <div
        style={{
          padding: "28px 48px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          alignItems: "center",
          gap: 24,
        }}
      >
        <div
          className="animate-pulse"
          style={{ width: 90, height: 20, borderRadius: 8, background: "rgba(255,255,255,0.07)" }}
        />
      </div>
      {/* Hero skeleton */}
      <div style={{ padding: "64px 48px 48px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div
          className="animate-pulse"
          style={{ width: 80, height: 12, borderRadius: 6, background: `rgba(${accentColor},0.15)` }}
        />
        <div
          className="animate-pulse"
          style={{ width: 420, height: 64, borderRadius: 12, background: "rgba(255,255,255,0.07)" }}
        />
        <div
          className="animate-pulse"
          style={{ width: 300, height: 10, borderRadius: 999, background: "rgba(255,255,255,0.06)", marginTop: 8 }}
        />
      </div>
      {/* Timeline skeleton */}
      <div style={{ padding: "0 48px" }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="animate-pulse"
            style={{
              height: 280,
              borderRadius: 48,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              marginBottom: 24,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function UACPage() {
  const params = useParams();
  const router = useRouter();
  const codigo = typeof params?.codigo === "string" ? params.codigo : "";

  const [loading, setLoading] = useState(true);
  const [progresiones, setProgresiones] = useState<ProgresionBrowser[]>([]);

  const uac = getUACPorCodigo(codigo);
  const cfg = getUACConfig(codigo);

  useEffect(() => {
    if (!codigo) return;
    let cancelled = false;

    async function fetchData() {
      const prof = await getCurrentProfile();
      if (cancelled) return;
      if (!prof) { router.replace("/log-in"); return; }

      const progs = await getProgresionesConEstadoBrowser(codigo, prof.userId);
      if (cancelled) return;
      setProgresiones(progs);
      setLoading(false);
    }

    fetchData();
    return () => { cancelled = true; };
  }, [codigo, router]);

  if (!uac) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#011126",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          flexDirection: "column",
          gap: 20,
          padding: 48,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 48 }}>🔍</div>
        <h2 style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.03em" }}>
          UAC no encontrada
        </h2>
        <p style={{ color: "rgba(255,255,255,0.45)", maxWidth: 360, lineHeight: 1.6 }}>
          El código <code style={{ color: cfg.accent }}>{codigo}</code> no existe en el currículo.
        </p>
        <Link
          href="/hub"
          style={{
            marginTop: 8,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 999,
            padding: "12px 28px",
            fontSize: 13,
            fontWeight: 700,
            color: "#fff",
            textDecoration: "none",
          }}
        >
          <i className="fa-solid fa-arrow-left" style={{ marginRight: 8 }} />
          Volver al Hub
        </Link>
      </div>
    );
  }

  const reducedMotion = useReducedMotion();

  if (loading) return <UACPageSkeleton accentColor={cfg.accentRgb} />;

  const completadas = progresiones.filter((p) => p.estado === "completada").length;
  const total = progresiones.length;
  const pct = total > 0 ? Math.round((completadas / total) * 100) : 0;

  return (
    <div className="uac-v2-page">
      {/* ── Sticky nav ─── */}
      <nav className="uac-v2-nav">
        <Link href="/hub" className="uac-v2-back-link">
          <i className="fa-solid fa-chevron-left" style={{ fontSize: 12 }} />
          Mi Hub
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: 9,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color: "rgba(255,255,255,0.28)",
              }}
            >
              {codigo}
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{uac.nombre}</div>
          </div>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: `rgba(${cfg.accentRgb},0.15)`,
              border: `1px solid rgba(${cfg.accentRgb},0.25)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
            }}
          >
            {cfg.emoji}
          </div>
        </div>
      </nav>

      {/* ── Hero ─── */}
      <header className="uac-v2-hero">
        {/* Accent glow */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "45%",
            height: "100%",
            background: `radial-gradient(circle at center, rgba(${cfg.accentRgb},0.08) 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />

        <div className="uac-v2-hero-content">
          <motion.span
            className="uac-v2-tag"
            style={{ color: cfg.accent }}
            initial={reducedMotion ? {} : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springs.smooth, delay: 0.05 }}
          >
            CEN Bachillerato · {codigo}
          </motion.span>

          <motion.h1
            className="uac-v2-h1"
            initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springs.smooth, delay: 0.05 + stagger.fast }}
          >
            {uac.nombre}
          </motion.h1>

          <motion.div
            className="uac-v2-progress-row"
            initial={reducedMotion ? {} : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springs.smooth, delay: 0.05 + stagger.fast * 2 }}
          >
            <div className="uac-v2-prog-track">
              <div
                className="uac-v2-prog-fill"
                style={{ width: `${pct}%`, background: cfg.accent }}
              />
            </div>
            <div className="uac-v2-prog-val" style={{ color: cfg.accent }}>
              {pct}%
            </div>
          </motion.div>

          <motion.p
            style={{
              marginTop: 20,
              fontSize: 15,
              color: "rgba(255,255,255,0.40)",
              maxWidth: 520,
              lineHeight: 1.65,
            }}
            initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springs.smooth, delay: 0.05 + stagger.fast * 3 }}
          >
            {completadas} de {total > 0 ? total : uac.totalProgresionesEsperadas} progresiones
            completadas. Avanzá secuencialmente para desbloquear cada etapa del aprendizaje.
          </motion.p>
        </div>
      </header>

      {/* ── Progresiones ─── */}
      <main className="uac-v2-timeline">
        <div className="uac-v2-timeline-header">
          <i className="fa-solid fa-route" style={{ color: cfg.accent, fontSize: 22 }} />
          Ruta de Aprendizaje
          <div className="uac-v2-timeline-line" />
          {total > 0 && (
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "rgba(255,255,255,0.35)",
                whiteSpace: "nowrap",
              }}
            >
              {completadas}/{total}
            </span>
          )}
        </div>

        {progresiones.length === 0 ? (
          <div
            style={{
              borderRadius: 32,
              border: "1px solid rgba(255,255,255,0.07)",
              background: "rgba(255,255,255,0.02)",
              padding: "60px 48px",
              textAlign: "center",
              color: "rgba(255,255,255,0.30)",
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
            <p style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.50)" }}>
              Contenido en preparación
            </p>
            <p style={{ fontSize: 13, marginTop: 8, lineHeight: 1.6 }}>
              Las progresiones de {uac.nombre} estarán disponibles próximamente.
            </p>
          </div>
        ) : (
          <ProgresionTimeline
            progresiones={progresiones}
            codigoUAC={codigo}
            accentColor={cfg.accent}
            accentRgb={cfg.accentRgb}
            uacEmoji={cfg.emoji}
          />
        )}
      </main>
    </div>
  );
}
