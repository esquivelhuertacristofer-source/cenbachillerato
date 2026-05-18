"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UAC_BASE } from "@/lib/mccems/estructura";
import {
  getCurrentProfile,
  getProgresionesCompletadasDeUAC,
  getProgresoSemestreBrowser,
  type HubProfile,
} from "@/lib/queries/hub-browser";
import UACGrid from "@/components/hub-v2/UACGrid";
import HubV2Skeleton from "@/components/hub-v2/HubV2Skeleton";
import "./HubV5.css";

interface UACItem {
  codigo: string;
  nombre: string;
  done: number;
  total: number;
  pct: number;
}

function getSaludo() {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

function getDiaDelSemestre() {
  const starts: Record<number, string> = { 1: "2025-08-25", 2: "2026-02-02" };
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const startKey = month >= 8 ? 1 : 2;
  const startYear = startKey === 1 ? (month >= 8 ? year : year - 1) : year;
  const start = new Date(
    (starts[startKey] ?? starts[1] ?? "2025-08-25").replace(/^\d{4}/, String(startYear))
  );
  const diff = Math.floor((now.getTime() - start.getTime()) / 86_400_000) + 1;
  return Math.max(1, Math.min(diff, 200));
}

export default function HubPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<HubProfile | null>(null);
  const [uacs, setUACs] = useState<UACItem[]>([]);
  const [pctGlobal, setPctGlobal] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      const prof = await getCurrentProfile();
      if (cancelled) return;
      if (!prof) { router.replace("/log-in"); return; }

      const semestre = prof.semestre;
      const uacDelSemestre = UAC_BASE.filter((u) => u.semestre === semestre);

      const [progreso, ...progresosUAC] = await Promise.all([
        getProgresoSemestreBrowser(prof.userId, semestre),
        ...uacDelSemestre.map((u) =>
          getProgresionesCompletadasDeUAC(u.codigo, prof.userId)
        ),
      ]);

      if (cancelled) return;

      setPctGlobal(progreso.porcentaje);
      setProfile(prof);

      const items: UACItem[] = uacDelSemestre.map((uac, i) => {
        const p = progresosUAC[i] ?? { completadas: 0, total: uac.totalProgresionesEsperadas, ultimaActividad: null };
        const total = p.total > 0 ? p.total : uac.totalProgresionesEsperadas;
        const done = p.completadas;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        return { codigo: uac.codigo, nombre: uac.nombre, done, total, pct };
      });

      setUACs(items);
      setLoading(false);
    }

    fetchData();
    return () => { cancelled = true; };
  }, [router]);

  if (loading) return <HubV2Skeleton />;

  const nombre = profile?.fullName?.split(" ")[0] ?? "Alumno";
  const semestre = profile?.semestre ?? 1;
  const dia = getDiaDelSemestre();
  const materiasActivas = uacs.filter((u) => u.done > 0 && u.pct < 100).length;

  return (
    <div className="hub-v2-page">
      {/* ── Hero ─── */}
      <header className="hub-v2-hero hub-v2-animate">
        <p className="hub-v2-eyebrow">{getSaludo()}</p>
        <h1 className="hub-v2-title">
          {nombre}.<br />
          <span>Semestre {semestre}</span>
        </h1>

        <div className="hub-v2-stats">
          {/* Global progress */}
          <span className="hub-v2-stat">
            <span
              className="hub-v2-stat-dot"
              style={{ background: pctGlobal >= 80 ? "#34D399" : "#38BDF8" }}
            />
            {pctGlobal}% completado
          </span>

          {/* Active materias */}
          {materiasActivas > 0 && (
            <span className="hub-v2-stat">
              <span className="hub-v2-stat-dot" style={{ background: "#FB923C" }} />
              {materiasActivas} materia{materiasActivas !== 1 ? "s" : ""} activa{materiasActivas !== 1 ? "s" : ""}
            </span>
          )}

          {/* Day of semester */}
          <span className="hub-v2-stat">
            <span className="hub-v2-stat-dot" style={{ background: "#A78BFA" }} />
            Día {dia} del semestre
          </span>

          {/* Link to progress */}
          <Link
            href="/hub/progreso"
            className="hub-v2-stat"
            style={{ textDecoration: "none", cursor: "pointer" }}
          >
            <i className="fa-solid fa-chart-line" style={{ fontSize: 10 }} />
            Ver progreso completo
          </Link>
        </div>
      </header>

      {/* ── Materias section ─── */}
      <section>
        <div className="hub-v2-section-header">
          <h2 className="hub-v2-section-title">Tus Materias</h2>
          <div className="hub-v2-section-line" />
          <span className="hub-v2-section-badge">{uacs.length} materias</span>
        </div>

        <UACGrid items={uacs} />
      </section>

      {/* ── Evaluación banner ─── */}
      {pctGlobal >= 80 ? (
        <div
          style={{
            marginTop: 64,
            borderRadius: 32,
            background: "linear-gradient(135deg, #065F46 0%, #047857 100%)",
            border: "1px solid rgba(52,211,153,0.30)",
            padding: "40px 48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 32,
            flexWrap: "wrap",
            boxShadow: "0 24px 60px rgba(16,185,129,0.15)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.3em",
                color: "#6EE7B7",
                marginBottom: 10,
              }}
            >
              ✓ Evaluación disponible
            </div>
            <h3
              style={{
                fontSize: "clamp(24px,3vw,40px)",
                fontWeight: 900,
                color: "#fff",
                letterSpacing: "-0.03em",
                marginBottom: 8,
              }}
            >
              Evaluación del Semestre
            </h3>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.70)", maxWidth: 480, lineHeight: 1.6 }}>
              Completaste más del 80% del currículo. El examen integrador está desbloqueado.
            </p>
          </div>
          <Link
            href="/hub/evaluacion-semestre"
            style={{
              position: "relative",
              zIndex: 1,
              background: "#fff",
              color: "#065F46",
              borderRadius: 20,
              padding: "18px 36px",
              fontWeight: 900,
              fontSize: 13,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              textDecoration: "none",
              whiteSpace: "nowrap",
              boxShadow: "0 8px 24px rgba(0,0,0,0.20)",
              transition: "transform 0.2s ease",
            }}
          >
            Iniciar evaluación
            <i className="fa-solid fa-arrow-right" style={{ marginLeft: 8, fontSize: 11 }} />
          </Link>
        </div>
      ) : (
        <div
          style={{
            marginTop: 64,
            borderRadius: 32,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            padding: "32px 48px",
            display: "flex",
            alignItems: "center",
            gap: 32,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: "rgba(125,211,252,0.10)",
              border: "1px solid rgba(125,211,252,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#7DD3FC",
              fontSize: 20,
              flexShrink: 0,
            }}
          >
            <i className="fa-solid fa-lock" />
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: "rgba(125,211,252,0.60)",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                marginBottom: 6,
              }}
            >
              Evaluación integradora
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: "#fff", marginBottom: 4 }}>
              Evaluación del semestre
            </h3>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.40)", lineHeight: 1.6 }}>
              Se desbloquea al completar el 80% del currículo.{" "}
              <span style={{ color: "rgba(255,255,255,0.65)", fontWeight: 700 }}>
                Avance actual: {pctGlobal}% / 80%
              </span>
            </p>
          </div>
          {/* Mini progress bar */}
          <div style={{ flex: "0 1 200px" }}>
            <div
              style={{
                height: 6,
                borderRadius: 999,
                background: "rgba(255,255,255,0.08)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${Math.min(100, Math.round((pctGlobal / 80) * 100))}%`,
                  borderRadius: 999,
                  background: "linear-gradient(90deg, #38BDF8, #7DD3FC)",
                  transition: "width 1s ease",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 6,
                fontSize: 10,
                color: "rgba(255,255,255,0.30)",
              }}
            >
              <span>0%</span>
              <span style={{ color: "rgba(255,255,255,0.45)", fontWeight: 700 }}>🔒 80%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
