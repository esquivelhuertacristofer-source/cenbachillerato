import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getUser, getProfile } from "@/lib/supabase-helpers";
import { getUACPorCodigo } from "@/lib/mccems/estructura";
import { getActividadesConEstado } from "@/lib/queries/hub";
import { getRSCColor, getTipoConfig } from "@/components/hub/hub-colors";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ codigo: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { codigo, id } = await params;
  const uac = getUACPorCodigo(codigo);
  return {
    title: uac ? `Progresión ${id} · ${uac.nombre} — CEN Bachillerato` : "Progresión — CEN Bachillerato",
  };
}

const PHASE_LABELS = ["Activación", "Práctica", "Aplicación"];

export default async function ProgresionPage({ params }: Props) {
  const { codigo, id } = await params;
  const numParsed = parseInt(id, 10);

  const user = await getUser();
  if (!user) redirect("/log-in");

  const profile = await getProfile(user.id);
  if (!profile) redirect("/log-in");

  const uac = getUACPorCodigo(codigo);
  if (!uac) notFound();

  if (isNaN(numParsed)) notFound();

  const { progresion, actividades } = await getActividadesConEstado(codigo, numParsed, user.id);
  if (!progresion) notFound();

  const color = getRSCColor(uac.recursoCodigo ?? null);
  const isCompleta = progresion.estado === "completada";
  const xpTotal = actividades.reduce((sum, a) => sum + a.xp, 0);
  const chips = [
    ...(progresion.ejes_articuladores ?? []).slice(0, 2),
    ...(progresion.transversalidades ?? []).slice(0, 1),
  ];

  return (
    <>
      <style>{`
        .prog-act-card:hover .prog-act-inner {
          border-color: rgba(${color.rgba}, 0.35) !important;
          box-shadow: 0 20px 60px rgba(${color.rgba}, 0.12) !important;
          transform: translateY(-2px);
        }
        .prog-act-card:hover .prog-act-icon-panel {
          background: linear-gradient(135deg, #011C40 0%, rgba(${color.rgba}, 0.18) 100%) !important;
        }
        .prog-act-card:hover .prog-act-icon {
          transform: scale(1.08);
        }
        .prog-act-inner { transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1); }
        .prog-act-icon { transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1); }
        @media (max-width: 640px) {
          .prog-hero { padding: 32px 20px 36px !important; }
          .prog-nav { padding: 14px 20px !important; }
          .prog-body { padding: 28px 20px 80px !important; }
          .prog-act-card-layout { flex-direction: column !important; min-height: auto !important; }
          .prog-act-img-panel { min-height: 160px !important; width: 100% !important; }
        }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: `radial-gradient(circle at 85% 0%, rgba(${color.rgba}, 0.06) 0%, transparent 40%), #011126`,
        fontFamily: "var(--font-epilogue), 'Plus Jakarta Sans', sans-serif",
        color: "#fff",
      }}>

        {/* ── NAV ──────────────────────────────────────────────────────── */}
        <nav
          className="prog-nav"
          style={{
            padding: "18px 48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 100,
            background: "rgba(1,17,38,0.90)",
            backdropFilter: "blur(24px)",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <Link
            href={`/hub/uac/${codigo}`}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em",
              color: "rgba(255,255,255,0.45)", textDecoration: "none",
              transition: "all 0.25s ease",
            }}
            className="uac-v2-back-link"
          >
            <i className="fa-solid fa-arrow-left" style={{ fontSize: 10 }} />
            {uac.nombre}
          </Link>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 11, color: "rgba(255,255,255,0.28)",
          }}>
            <Link href="/hub" style={{ color: "rgba(255,255,255,0.28)", textDecoration: "none" }}>Hub</Link>
            <span>/</span>
            <Link href={`/hub/uac/${codigo}`} style={{ color: "rgba(255,255,255,0.28)", textDecoration: "none" }}>{codigo}</Link>
            <span>/</span>
            <span style={{ color: "rgba(255,255,255,0.60)", fontWeight: 700 }}>P-{numParsed}</span>
          </div>
        </nav>

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <div
          className="prog-hero"
          style={{
            padding: "56px 48px 52px",
            background: `linear-gradient(180deg, rgba(${color.rgba}, 0.09) 0%, transparent 100%), #011C40`,
            borderBottom: `1px solid rgba(${color.rgba}, 0.12)`,
          }}
        >
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>

            {/* Top row: eyebrow + progress */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span style={{
                  fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.30em",
                  color: color.hex, padding: "5px 14px",
                  background: `rgba(${color.rgba}, 0.10)`,
                  border: `1px solid rgba(${color.rgba}, 0.22)`,
                  borderRadius: 999,
                }}>
                  {codigo} · Progresión {numParsed}
                </span>
                {isCompleta && (
                  <span style={{
                    fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.14em",
                    color: "#4ADE80", padding: "5px 14px",
                    background: "rgba(74,222,128,0.10)",
                    border: "1px solid rgba(74,222,128,0.22)",
                    borderRadius: 999,
                  }}>
                    <i className="fa-solid fa-check" style={{ marginRight: 5 }} />
                    Completada
                  </span>
                )}
              </div>

              {/* Progress fraction */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.40)" }}>
                  {progresion.actividadesCompletadas} / {progresion.totalActividades} actividades
                </span>
                <div style={{
                  width: 120, height: 6, borderRadius: 999, background: "rgba(255,255,255,0.10)", overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%", borderRadius: 999, background: isCompleta ? "#4ADE80" : color.hex,
                    width: `${progresion.totalActividades > 0 ? Math.round((progresion.actividadesCompletadas / progresion.totalActividades) * 100) : 0}%`,
                  }} />
                </div>
              </div>
            </div>

            {/* Title */}
            <h1 style={{
              fontSize: "clamp(28px, 4vw, 52px)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
              color: "#fff",
              margin: "0 0 20px",
              maxWidth: 820,
            }}>
              {progresion.titulo}
            </h1>

            {/* Description */}
            {progresion.descripcion && (
              <p style={{
                fontSize: 16, color: "rgba(255,255,255,0.55)", lineHeight: 1.65,
                margin: "0 0 24px", maxWidth: 680,
              }}>
                {progresion.descripcion}
              </p>
            )}

            {/* Chips + metadata */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {chips.map((chip, i) => (
                <span key={i} style={{
                  fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em",
                  color: "rgba(255,255,255,0.40)", padding: "5px 12px",
                  background: "rgba(255,255,255,0.05)", borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <span style={{
                    width: 5, height: 5, borderRadius: "50%",
                    background: color.hex,
                    boxShadow: `0 0 6px ${color.hex}`,
                    display: "inline-block", flexShrink: 0,
                  }} />
                  {chip}
                </span>
              ))}
              {progresion.tiempo_estimado_horas && (
                <span style={{
                  fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.35)", padding: "5px 12px",
                  background: "rgba(255,255,255,0.05)", borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.08)",
                }}>
                  <i className="fa-regular fa-clock" style={{ marginRight: 6, fontSize: 10 }} />
                  {progresion.tiempo_estimado_horas}h estimadas
                </span>
              )}
              {xpTotal > 0 && (
                <span style={{
                  fontSize: 11, fontWeight: 700, color: "#FBBF24", padding: "5px 12px",
                  background: "rgba(251,191,36,0.08)", borderRadius: 999,
                  border: "1px solid rgba(251,191,36,0.18)",
                }}>
                  <i className="fa-solid fa-bolt" style={{ marginRight: 6, fontSize: 10 }} />
                  +{xpTotal} XP disponibles
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── ACTIVITY CARDS ────────────────────────────────────────────── */}
        <div
          className="prog-body"
          style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 48px 100px" }}
        >
          <div style={{
            display: "flex", alignItems: "center", gap: 12, marginBottom: 36,
            fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.30em",
            color: "rgba(255,255,255,0.30)",
          }}>
            <i className="fa-solid fa-route" style={{ fontSize: 12, color: color.hex }} />
            Tu ruta de aprendizaje
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
          </div>

          {actividades.length === 0 ? (
            <div style={{
              borderRadius: 24,
              border: "1.5px dashed rgba(255,255,255,0.10)",
              background: "rgba(255,255,255,0.03)",
              padding: "64px 32px",
              display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 14,
            }}>
              <i className="fa-regular fa-clock" style={{ fontSize: 44, color: "rgba(255,255,255,0.15)" }} />
              <p style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.50)", margin: 0 }}>
                Las actividades estarán disponibles pronto
              </p>
              <Link href={`/hub/uac/${codigo}`} style={{
                marginTop: 8, borderRadius: 999,
                background: color.hex, color: "#011126",
                padding: "12px 24px", fontSize: 13, fontWeight: 800, textDecoration: "none",
                textTransform: "uppercase", letterSpacing: "0.10em",
              }}>
                <i className="fa-solid fa-arrow-left" style={{ marginRight: 8 }} />
                Volver a {uac.nombre}
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {actividades.map((act, i) => {
                const tc = getTipoConfig(act.tipo);
                const isActCompleta = act.estado === "completada";
                const isActEnProgreso = act.estado === "en_progreso";
                const phaseLabel = PHASE_LABELS[i] ?? `Actividad ${act.orden}`;

                let ctaText = "Empezar";
                let ctaIcon = "fa-chevron-right";
                if (isActCompleta) { ctaText = "Volver a hacer"; ctaIcon = "fa-rotate-right"; }
                else if (isActEnProgreso) { ctaText = "Continuar"; ctaIcon = "fa-play"; }

                return (
                  <div key={act.id} className="prog-act-card" style={{ display: "block" }}>
                    <Link
                      href={`/hub/uac/${codigo}/progresion/${numParsed}/actividad/${act.orden}`}
                      style={{ textDecoration: "none", display: "block" }}
                    >
                      <div
                        className="prog-act-inner"
                        style={{
                          borderRadius: 28,
                          border: isActCompleta
                            ? "1.5px solid rgba(74,222,128,0.22)"
                            : isActEnProgreso
                              ? `1.5px solid rgba(${color.rgba}, 0.28)`
                              : "1px solid rgba(255,255,255,0.08)",
                          overflow: "hidden",
                          display: "flex",
                        }}
                      >
                        {/* Left icon panel */}
                        <div
                          className="prog-act-img-panel"
                          style={{
                            width: "30%",
                            minWidth: 160,
                            minHeight: 200,
                            flexShrink: 0,
                            background: `linear-gradient(135deg, #011C40 0%, rgba(${color.rgba}, 0.10) 100%)`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            position: "relative",
                            overflow: "hidden",
                          }}
                        >
                          {/* Glow blob */}
                          <div style={{
                            position: "absolute",
                            width: 120, height: 120,
                            borderRadius: "50%",
                            background: `rgba(${color.rgba}, 0.08)`,
                            filter: "blur(40px)",
                          }} />
                          {/* Icon */}
                          <div
                            className="prog-act-icon"
                            style={{
                              width: 88, height: 88, borderRadius: "50%",
                              background: isActCompleta
                                ? "rgba(74,222,128,0.12)"
                                : `rgba(${color.rgba}, 0.12)`,
                              border: isActCompleta
                                ? "2px solid rgba(74,222,128,0.25)"
                                : `2px solid rgba(${color.rgba}, 0.22)`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 34,
                              color: isActCompleta ? "#4ADE80" : color.hex,
                              position: "relative",
                              boxShadow: isActCompleta
                                ? "0 0 30px rgba(74,222,128,0.15)"
                                : `0 0 30px rgba(${color.rgba}, 0.15)`,
                            }}
                          >
                            {isActCompleta
                              ? <i className="fa-solid fa-check" />
                              : <i className={`fa-solid ${tc.faIcon}`} />
                            }
                          </div>
                          {/* Numero badge */}
                          <div style={{
                            position: "absolute", bottom: 16, right: 16,
                            background: `rgba(${color.rgba}, 0.12)`,
                            border: `1px solid rgba(${color.rgba}, 0.22)`,
                            borderRadius: 8, padding: "4px 10px",
                            fontSize: 10, fontWeight: 900, color: color.hex,
                            letterSpacing: "0.12em",
                          }}>
                            A-{act.orden}
                          </div>
                        </div>

                        {/* Right content panel */}
                        <div style={{
                          flex: 1, display: "flex", flexDirection: "column",
                          justifyContent: "space-between",
                          padding: "32px 40px",
                          background: "#011C40",
                          minWidth: 0,
                        }}>
                          <div>
                            {/* Eyebrow */}
                            <div style={{
                              fontSize: 10, fontWeight: 900, textTransform: "uppercase",
                              letterSpacing: "0.40em", marginBottom: 12,
                              color: isActCompleta ? "#4ADE80" : isActEnProgreso ? color.hex : "rgba(255,255,255,0.30)",
                            }}>
                              A{act.orden} · {phaseLabel}
                            </div>

                            {/* Title */}
                            <h3 style={{
                              fontSize: "clamp(18px, 2vw, 26px)",
                              fontWeight: 900, color: "#fff",
                              margin: "0 0 12px", lineHeight: 1.2,
                              letterSpacing: "-0.02em",
                            }}>
                              {act.titulo}
                            </h3>

                            {/* Badges */}
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                              <span style={{
                                fontSize: 10, fontWeight: 700, color: tc.color,
                                padding: "4px 10px", borderRadius: 999,
                                background: "rgba(255,255,255,0.05)",
                                border: "1px solid rgba(255,255,255,0.08)",
                              }}>
                                <i className={`fa-solid ${tc.faIcon}`} style={{ marginRight: 6, fontSize: 9 }} />
                                {tc.label}
                              </span>
                              <span style={{
                                fontSize: 10, fontWeight: 700,
                                color: "rgba(255,255,255,0.35)",
                                padding: "4px 10px", borderRadius: 999,
                                background: "rgba(255,255,255,0.05)",
                                border: "1px solid rgba(255,255,255,0.08)",
                              }}>
                                +{act.xp} XP
                              </span>
                              {isActCompleta && (
                                <span style={{
                                  fontSize: 10, fontWeight: 800, color: "#4ADE80",
                                  padding: "4px 10px", borderRadius: 999,
                                  background: "rgba(74,222,128,0.10)",
                                  border: "1px solid rgba(74,222,128,0.22)",
                                }}>
                                  <i className="fa-solid fa-check" style={{ marginRight: 5 }} />
                                  Completada
                                </span>
                              )}
                              {isActEnProgreso && (
                                <span style={{
                                  fontSize: 10, fontWeight: 800, color: color.hex,
                                  padding: "4px 10px", borderRadius: 999,
                                  background: `rgba(${color.rgba}, 0.10)`,
                                  border: `1px solid rgba(${color.rgba}, 0.22)`,
                                }}>
                                  En curso
                                </span>
                              )}
                            </div>
                          </div>

                          {/* CTA row */}
                          <div style={{
                            display: "flex", alignItems: "center", justifyContent: "flex-end",
                            paddingTop: 20,
                            borderTop: "1px solid rgba(255,255,255,0.06)",
                            marginTop: 20,
                          }}>
                            <div style={{
                              display: "flex", alignItems: "center", gap: 10,
                              padding: "14px 28px", borderRadius: 24,
                              background: isActCompleta
                                ? "rgba(74,222,128,0.10)"
                                : isActEnProgreso
                                  ? color.hex
                                  : `rgba(${color.rgba}, 0.12)`,
                              border: isActCompleta
                                ? "1px solid rgba(74,222,128,0.25)"
                                : isActEnProgreso
                                  ? "none"
                                  : `1px solid rgba(${color.rgba}, 0.22)`,
                              fontSize: 12, fontWeight: 900,
                              textTransform: "uppercase", letterSpacing: "0.12em",
                              color: isActEnProgreso ? "#011126" : isActCompleta ? "#4ADE80" : color.hex,
                              boxShadow: isActEnProgreso ? `0 8px 24px rgba(${color.rgba}, 0.30)` : "none",
                            }}>
                              {ctaText}
                              <i className={`fa-solid ${ctaIcon}`} style={{ fontSize: 10 }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer */}
          <div style={{
            marginTop: 40,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: 12, flexWrap: "wrap",
          }}>
            <Link href={`/hub/uac/${codigo}`} style={{
              display: "flex", alignItems: "center", gap: 8,
              fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em",
              color: "rgba(255,255,255,0.40)", textDecoration: "none",
              padding: "12px 20px", borderRadius: 14,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              transition: "all 0.2s ease",
            }}>
              <i className="fa-solid fa-arrow-left" style={{ fontSize: 10 }} />
              Ver todas las progresiones
            </Link>

            {isCompleta && (
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "12px 20px", borderRadius: 14,
                background: "rgba(74,222,128,0.10)",
                border: "1px solid rgba(74,222,128,0.22)",
                fontSize: 13, fontWeight: 800, color: "#4ADE80",
              }}>
                <i className="fa-solid fa-trophy" style={{ fontSize: 14 }} />
                ¡Progresión completada!
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
