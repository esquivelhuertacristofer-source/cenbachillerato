import { redirect } from "next/navigation";
import { getUser, getProfile } from "@/lib/supabase-helpers";
import { UAC_BASE } from "@/lib/mccems/estructura";
import { RECURSOS_SOCIOCOGNITIVOS } from "@/lib/mccems/recursos-sociocognitivos";
import { getRSCColor } from "@/components/hub/hub-colors";
import {
  getProgresoSemestre,
  getRachaDelAlumno,
  getProgresionesCompletadasDeUAC,
} from "@/lib/queries/hub";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mi Hub — CEN Bachillerato",
};

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
  const start = new Date(starts[startKey]?.replace(/^\d{4}/, String(startYear)) ?? starts[1] ?? "2025-08-25");
  const diff = Math.floor((now.getTime() - start.getTime()) / 86_400_000) + 1;
  return Math.max(1, Math.min(diff, 200));
}

function timeAgo(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const diffMin = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (diffMin < 2)  return "Hace un momento";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const h = Math.floor(diffMin / 60);
  if (h < 24) return `Hace ${h}h`;
  const d = Math.floor(h / 24);
  if (d === 1) return "Ayer";
  if (d < 7)  return `Hace ${d} días`;
  return new Date(dateStr).toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}

export default async function HubPage() {
  const user = await getUser();
  if (!user) redirect("/log-in");

  const profile = await getProfile(user.id);
  if (!profile) redirect("/log-in");

  const semestre = profile.semestre ?? 1;
  const nombre = profile.full_name?.split(" ")[0] ?? "Alumno";
  const dia = getDiaDelSemestre();

  const uacDelSemestre = UAC_BASE.filter((u) => u.semestre === semestre);

  const [progreso, , ...progresosUAC] = await Promise.all([
    getProgresoSemestre(user.id, semestre),
    getRachaDelAlumno(user.id),
    ...uacDelSemestre.map((u) => getProgresionesCompletadasDeUAC(u.codigo, user.id)),
  ]);

  const uacConProgreso = uacDelSemestre.map((uac, i) => {
    const p = progresosUAC[i] ?? { completadas: 0, total: uac.totalProgresionesEsperadas, ultimaActividad: null };
    return {
      codigo: uac.codigo,
      nombre: uac.nombre,
      rscCodigo: uac.recursoCodigo ?? "RSC-LC",
      semestre: uac.semestre,
      totalProgresiones: p.total > 0 ? p.total : uac.totalProgresionesEsperadas,
      completadas: p.completadas,
      ultimaActividad: p.ultimaActividad as string | null,
    };
  });

  // Evaluación eligibility
  const pctGlobal = progreso.porcentaje;
  const elegible = pctGlobal >= 80;
  const totalProg = progreso.totalProgresiones;
  const completadasProg = progreso.progresionesCompletadas;
  const necesarias = Math.max(0, Math.ceil(totalProg * 0.80) - completadasProg);
  const pctHacia80 = Math.min(100, Math.round((pctGlobal / 80) * 100));

  return (
    <div style={{ padding: "36px 40px 80px", maxWidth: 1200, margin: "0 auto" }}>

      {/* ── Greeting header ─── */}
      <div style={{ marginBottom: 40 }}>
        <p style={{
          fontSize: 13, fontWeight: 700, color: "#1E40AF",
          textTransform: "uppercase", letterSpacing: "0.12em",
          margin: "0 0 4px",
        }}>
          {getSaludo()}
        </p>
        <h1 style={{
          fontSize: "clamp(28px, 3.5vw, 42px)",
          fontWeight: 900,
          color: "#0B2545",
          letterSpacing: "-0.04em",
          margin: "0 0 10px",
          lineHeight: 1.05,
        }}>
          {nombre}.
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(30,64,175,0.07)",
            border: "1px solid rgba(30,64,175,0.13)",
            borderRadius: 999, padding: "5px 14px",
            fontSize: 12, fontWeight: 600, color: "#1E40AF",
          }}>
            <i className="fa-solid fa-calendar-day" style={{ fontSize: 10 }} />
            Día {dia} del semestre · Sem. {semestre}
          </span>
          <Link
            href="/hub/progreso"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "rgba(30,64,175,0.07)",
              border: "1px solid rgba(30,64,175,0.13)",
              borderRadius: 999, padding: "5px 14px",
              fontSize: 12, fontWeight: 600, color: "#1E40AF",
              textDecoration: "none",
            }}
          >
            <i className="fa-solid fa-chart-line" style={{ fontSize: 10 }} />
            {pctGlobal}% del semestre
          </Link>
        </div>
      </div>

      {/* ── Section header ─── */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#1E40AF", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 4px" }}>
            Tus materias
          </p>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: "#0B2545", letterSpacing: "-0.03em", margin: 0 }}>
            Semestre {semestre}
          </h2>
        </div>
        <span style={{
          background: "#EFF6FF", border: "1px solid rgba(30,64,175,0.14)",
          borderRadius: 999, padding: "5px 14px",
          fontSize: 12, fontWeight: 700, color: "#1E40AF",
        }}>
          {uacConProgreso.length} materias
        </span>
      </div>

      {/* ── UAC grid ─── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 20,
          marginBottom: 40,
        }}
        className="hub-uac-grid-v2"
      >
        {uacConProgreso.map((uac, i) => {
          const color = getRSCColor(uac.rscCodigo);
          const pct = uac.totalProgresiones > 0
            ? Math.round((uac.completadas / uac.totalProgresiones) * 100)
            : 0;
          const last = timeAgo(uac.ultimaActividad);
          const isComplete = pct === 100 && uac.totalProgresiones > 0;

          return (
            <div
              key={uac.codigo}
              style={{
                animationDelay: `${i * 60}ms`,
                animation: "fadeInUp 0.42s cubic-bezier(.22,1,.36,1) both",
                // CSS vars for hover effect
                "--card-color": color.hex,
                "--card-shadow": `rgba(${color.rgba}, 0.20)`,
              } as React.CSSProperties}
              className="hub-uac-card-v2-link"
            >
              <Link href={`/hub/uac/${uac.codigo}`} style={{ textDecoration: "none", display: "block" }}>
                <article
                  className="hub-uac-card-v2"
                  style={{
                    borderTop: `4px solid ${color.hex}`,
                    padding: "26px 24px 22px",
                    minHeight: 300,
                    display: "flex",
                    flexDirection: "column",
                    gap: 18,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Completion badge */}
                  {isComplete && (
                    <div style={{
                      position: "absolute", top: 16, right: 16,
                      display: "inline-flex", alignItems: "center", gap: 4,
                      background: "rgba(22,163,74,0.10)",
                      border: "1px solid rgba(34,197,94,0.25)",
                      borderRadius: 999, padding: "3px 10px",
                      fontSize: 10, fontWeight: 700, color: "#16A34A",
                    }}>
                      <i className="fa-solid fa-check" style={{ fontSize: 8 }} />
                      Completada
                    </div>
                  )}

                  {/* Icon */}
                  <div style={{
                    width: 64, height: 64, borderRadius: 18,
                    background: `rgba(${color.rgba}, 0.10)`,
                    border: `1.5px solid rgba(${color.rgba}, 0.20)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 28, color: color.hex,
                    flexShrink: 0,
                  }}>
                    <i className={`fa-solid ${color.faIcon}`} />
                  </div>

                  {/* Name + code */}
                  <div>
                    <span style={{
                      fontSize: 10, fontWeight: 700,
                      color: `rgba(${color.rgba}, 0.70)`,
                      textTransform: "uppercase", letterSpacing: "0.12em",
                      display: "block", marginBottom: 5,
                    }}>
                      {uac.codigo} · Semestre {uac.semestre}
                    </span>
                    <h3 style={{
                      fontSize: "clamp(17px, 1.8vw, 20px)",
                      fontWeight: 900,
                      color: "#0B2545",
                      margin: 0,
                      letterSpacing: "-0.025em",
                      lineHeight: 1.2,
                    }}>
                      {uac.nombre}
                    </h3>
                  </div>

                  {/* Progress + CTA */}
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 14 }}>
                    {/* Bar */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7, alignItems: "center" }}>
                        <span style={{ fontSize: 11, color: "rgba(11,37,69,0.45)", fontWeight: 500 }}>
                          <span style={{ fontWeight: 700, color: "rgba(11,37,69,0.70)" }}>{uac.completadas}</span>
                          {" "}/ {uac.totalProgresiones} progresiones
                        </span>
                        <span style={{
                          fontSize: 12, fontWeight: 800,
                          color: pct > 0 ? color.hex : "rgba(11,37,69,0.20)",
                        }}>
                          {pct}%
                        </span>
                      </div>
                      <div style={{ height: 6, borderRadius: 999, background: "rgba(11,37,69,0.07)", overflow: "hidden" }}>
                        {pct > 0 && (
                          <div style={{
                            height: "100%", width: `${pct}%`, borderRadius: 999,
                            background: color.hex,
                            boxShadow: `0 0 10px rgba(${color.rgba}, 0.45)`,
                          }} />
                        )}
                      </div>
                    </div>

                    {/* Last activity + CTA */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <span style={{ fontSize: 11, color: "rgba(11,37,69,0.32)", fontWeight: 500 }}>
                        {last ?? "Sin actividad aún"}
                      </span>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        background: color.hex,
                        color: "#0B2545",
                        borderRadius: 999, padding: "9px 18px",
                        fontSize: 12, fontWeight: 800, letterSpacing: "-0.01em",
                        boxShadow: `0 4px 16px rgba(${color.rgba}, 0.38)`,
                        flexShrink: 0,
                        whiteSpace: "nowrap",
                      }}>
                        {uac.completadas === 0 ? "Comenzar" : "Continuar"}
                        <i className="fa-solid fa-arrow-right" style={{ fontSize: 9 }} />
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            </div>
          );
        })}
      </div>

      {/* ── Evaluación del semestre ─── */}
      <div style={{
        borderRadius: 24,
        background: "linear-gradient(135deg, #060E20 0%, #0B2545 50%, #0D2E64 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 20px 60px rgba(6,14,32,0.25)",
        overflow: "hidden",
        position: "relative",
        padding: "40px 44px",
        display: "flex",
        gap: 48,
        alignItems: "center",
        flexWrap: "wrap",
      }}>
        {/* BG decoration */}
        <svg aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
          viewBox="0 0 1000 240" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="eval-dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="3" cy="3" r="1.4" fill="rgba(255,255,255,0.05)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#eval-dots)" />
          <circle cx="900" cy="-40" r="260" fill="rgba(125,211,252,0.05)" />
          <circle cx="800" cy="280" r="180" fill="rgba(30,64,175,0.07)" />
        </svg>

        {/* Left: text */}
        <div style={{ flex: "1 1 360px", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 13,
              background: "rgba(125,211,252,0.12)",
              border: "1px solid rgba(125,211,252,0.20)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, color: "#7DD3FC",
            }}>
              <i className="fa-solid fa-file-pen" />
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(125,211,252,0.60)", textTransform: "uppercase", letterSpacing: "0.14em", margin: 0 }}>
                Evaluación integradora
              </p>
              <h3 style={{ fontSize: 20, fontWeight: 900, color: "#fff", margin: 0, letterSpacing: "-0.03em" }}>
                Evaluación del semestre
              </h3>
            </div>
          </div>

          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: "0 0 20px", lineHeight: 1.65, maxWidth: 420 }}>
            Examen integrador que cubre las {uacConProgreso.length} materias del semestre.
            Se desbloquea al completar el 80% del currículo.
          </p>

          {elegible ? (
            <Link
              href="/hub/evaluacion-semestre"
              style={{
                display: "inline-flex", alignItems: "center", gap: 9,
                borderRadius: 999,
                background: "#7DD3FC",
                color: "#0B2545",
                padding: "13px 28px",
                fontSize: 14, fontWeight: 800,
                textDecoration: "none",
                boxShadow: "0 10px 28px rgba(125,211,252,0.35)",
                letterSpacing: "-0.01em",
              }}
            >
              <i className="fa-solid fa-rocket" style={{ fontSize: 12 }} />
              Comenzar evaluación
            </Link>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                borderRadius: 999,
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.12)",
                padding: "10px 20px",
                fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.35)",
              }}>
                <i className="fa-solid fa-lock" style={{ fontSize: 11 }} />
                Bloqueada
              </span>
              {necesarias > 0 && (
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.30)" }}>
                  Completá {necesarias} progresión{necesarias !== 1 ? "es" : ""} más
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right: progress toward 80% */}
        <div style={{ flex: "0 1 280px", position: "relative", zIndex: 1 }}>
          {elegible ? (
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              background: "rgba(34,197,94,0.10)",
              border: "1px solid rgba(34,197,94,0.22)",
              borderRadius: 16, padding: "16px 20px",
            }}>
              <i className="fa-solid fa-check-circle" style={{ fontSize: 28, color: "#4ADE80" }} />
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#4ADE80", letterSpacing: "-0.03em" }}>
                  ¡Listo!
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
                  Superaste el 80% requerido
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.40)" }}>
                  Avance hacia el desbloqueo
                </span>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#7DD3FC" }}>
                  {pctGlobal}% / 80%
                </span>
              </div>
              {/* Progress bar toward 80% */}
              <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.07)", overflow: "hidden", position: "relative" }}>
                <div style={{
                  height: "100%",
                  width: `${pctHacia80}%`,
                  borderRadius: 999,
                  background: "linear-gradient(90deg, #38BDF8, #7DD3FC)",
                  boxShadow: "0 0 12px rgba(56,189,248,0.50)",
                  transition: "width 1s cubic-bezier(.22,1,.36,1)",
                }} />
                {/* 80% marker */}
                <div style={{
                  position: "absolute", top: 0, bottom: 0, left: "100%",
                  width: 2, background: "rgba(255,255,255,0.30)",
                  pointerEvents: "none",
                }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>0%</span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.40)", fontWeight: 700 }}>🔒 80%</span>
              </div>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.30)", margin: "10px 0 0", lineHeight: 1.5 }}>
                {completadasProg} de {totalProg} progresiones completadas
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
