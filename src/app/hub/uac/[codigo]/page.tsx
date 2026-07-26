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
  CATEGORIA_COMPLEMENTO,
  type ProgresionBrowser,
} from "@/lib/queries/hub-browser";
import { getUACConfig, getUACImagen } from "@/components/hub-v2/uac-config";
import ProgresionTimeline from "@/components/hub-v2/ProgresionTimeline";
import AccesosMateria from "@/components/hub-v2/AccesosMateria";
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
  const reducedMotion = useReducedMotion();

  const uac = getUACPorCodigo(codigo);
  const cfg = getUACConfig(codigo);

  useEffect(() => {
    if (!codigo) return;
    let cancelled = false;

    async function fetchData() {
      try {
        const prof = await getCurrentProfile();
        if (cancelled) return;
        if (!prof) { router.replace("/log-in"); return; }

        const progs = await getProgresionesConEstadoBrowser(codigo, prof.userId);
        if (cancelled) return;
        setProgresiones(progs);
      } catch (e) {
        // Si falla la carga, queda lista vacía en vez de skeleton infinito.
        // Se registra para que un error de red/permiso no pase inadvertido.
        console.error("[hub/uac] carga de progresiones falló:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
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

  if (loading) return <UACPageSkeleton accentColor={cfg.accentRgb} />;

  // Solo los propósitos OFICIALES 2025 cuentan para el avance; los complementos
  // se muestran (timeline) pero no inflan la meta.
  const oficiales = progresiones.filter((p) => p.categoria !== CATEGORIA_COMPLEMENTO);
  const completadas = oficiales.filter((p) => p.estado === "completada").length;
  const total = oficiales.length;
  const pct = total > 0 ? Math.round((completadas / total) * 100) : 0;

  // Imagen ilustrativa de la materia (degradada al fondo del hero).
  const imagen = getUACImagen(codigo);

  // Destino directo de "continuar": primera progresión/actividad pendiente,
  // o la primera de todas si ya está todo hecho.
  const progPendiente = progresiones.find((p) => p.estado !== "completada") ?? progresiones[0];
  const actPendiente =
    progPendiente?.actividades.find((a) => a.estado !== "completada") ??
    progPendiente?.actividades[0];
  const continuarHref =
    progPendiente && actPendiente
      ? `/hub/uac/${codigo}/progresion/${progPendiente.numero}/actividad/${actPendiente.orden}`
      : null;
  const continuarLabel = completadas === 0 ? "Comenzar la ruta" : completadas >= total ? "Repasar la ruta" : "Continuar la ruta";

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
        {/* Imagen de la materia, degradada hacia el fondo (lado derecho) */}
        {imagen && (
          <div
            className="uac-v2-hero-art"
            style={{ backgroundImage: `url('${imagen}')` }}
            aria-hidden
          />
        )}
        {/* Velo: oscurece la izquierda (texto legible) y tiñe con el color del área */}
        <div
          className="uac-v2-hero-veil"
          aria-hidden
          style={{
            background: `linear-gradient(90deg, #011126 0%, #011126 32%, rgba(1,17,38,0.78) 52%, rgba(1,17,38,0.30) 80%, rgba(1,17,38,0.10) 100%), linear-gradient(180deg, transparent 55%, #011126 100%), radial-gradient(70% 90% at 88% 8%, rgba(${cfg.accentRgb},0.22) 0%, transparent 60%)`,
          }}
        />

        <div className="uac-v2-hero-grid">
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
            {completadas} de {total > 0 ? total : uac.totalProgresionesEsperadas} propósitos formativos
            completados. Avanzá secuencialmente para desbloquear cada etapa del aprendizaje.
          </motion.p>

          <motion.div
            style={{ marginTop: 26, display: "flex", gap: 12, flexWrap: "wrap" }}
            initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springs.smooth, delay: 0.05 + stagger.fast * 4 }}
          >
            {continuarHref && (
              <Link
                href={continuarHref}
                className="uac-v2-cta-primary"
                style={{
                  background: cfg.accent,
                  boxShadow: `0 14px 34px rgba(${cfg.accentRgb},0.35)`,
                }}
              >
                <i className={`fa-solid ${completadas >= total ? "fa-rotate-right" : "fa-play"}`} style={{ fontSize: 12 }} />
                {continuarLabel}
              </Link>
            )}
            <Link
              href={`/hub/biblioteca/${codigo}`}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: `rgba(${cfg.accentRgb},0.12)`,
                border: `1px solid rgba(${cfg.accentRgb},0.22)`,
                color: cfg.accent, textDecoration: "none",
                borderRadius: 999, padding: "11px 20px", fontSize: 13, fontWeight: 700,
              }}
            >
              <i className="fa-solid fa-book-open" style={{ fontSize: 12 }} />
              Biblioteca de esta materia
            </Link>
          </motion.div>
        </div>
        </div>
      </header>

      {/* ── Accesos rápidos por tipo de contenido (banda horizontal) ─── */}
      {progresiones.length > 0 && (
        <AccesosMateria
          progresiones={progresiones}
          codigoUAC={codigo}
          accent={cfg.accent}
          horizontal
        />
      )}

      {/* ── Progresiones ─── */}
      <main className="uac-v2-timeline">
        <h2 className="uac-v2-timeline-header" style={{ marginTop: 0 }}>
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
        </h2>

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
              Los propósitos formativos de {uac.nombre} estarán disponibles próximamente.
            </p>
          </div>
        ) : (
          <ProgresionTimeline
            progresiones={progresiones}
            codigoUAC={codigo}
            accentColor={cfg.accent}
            accentRgb={cfg.accentRgb}
          />
        )}
      </main>
    </div>
  );
}
