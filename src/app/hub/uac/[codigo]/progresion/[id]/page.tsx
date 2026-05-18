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

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 32px 60px" }}>
      <div style={{ maxWidth: 840 }}>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "rgba(11,37,69,0.45)", marginBottom: 24, flexWrap: "wrap" }}>
          <Link href="/hub" style={{ color: "rgba(11,37,69,0.45)", textDecoration: "none" }}>Mi Hub</Link>
          <i className="fa-solid fa-chevron-right" style={{ fontSize: 9 }} />
          <Link href={`/hub/uac/${codigo}`} style={{ color: "rgba(11,37,69,0.45)", textDecoration: "none" }}>{uac.nombre}</Link>
          <i className="fa-solid fa-chevron-right" style={{ fontSize: 9 }} />
          <span style={{ color: "#0B2545", fontWeight: 600 }}>Progresión {numParsed}</span>
        </nav>

        {/* Progresion header card */}
        <div style={{
          borderRadius: 24,
          background: color.gradient,
          border: "1px solid rgba(255,255,255,0.08)",
          padding: "24px 28px",
          marginBottom: 28,
          boxShadow: "0 12px 40px rgba(0,0,0,0.20)",
        }}>
          {/* Top row */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 14 }}>
            <div style={{
              width: 48, height: 48,
              borderRadius: 14,
              background: `rgba(${color.rgba}, 0.15)`,
              border: `2px solid rgba(${color.rgba}, 0.30)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, color: color.hex,
              flexShrink: 0,
            }}>
              {isCompleta
                ? <i className="fa-solid fa-check" />
                : <span style={{ fontWeight: 900 }}>{numParsed}</span>
              }
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
                <span style={{
                  borderRadius: 999, background: `rgba(${color.rgba}, 0.18)`,
                  border: `1px solid rgba(${color.rgba}, 0.30)`,
                  padding: "2px 10px", fontSize: 11, fontWeight: 700, color: color.hex, letterSpacing: "0.05em",
                }}>
                  {codigo}
                </span>
                {progresion.tiempo_estimado_horas && (
                  <span style={{
                    borderRadius: 999, background: "rgba(255,255,255,0.10)",
                    padding: "2px 10px", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.60)",
                  }}>
                    {progresion.tiempo_estimado_horas}h
                  </span>
                )}
                {isCompleta && (
                  <span style={{
                    borderRadius: 999, background: "#16A34A",
                    padding: "2px 10px", fontSize: 11, fontWeight: 700, color: "#fff",
                  }}>
                    <i className="fa-solid fa-check" style={{ marginRight: 4, fontSize: 9 }} />
                    Completada
                  </span>
                )}
              </div>
              <h1 style={{ fontSize: 20, fontWeight: 900, color: "#fff", margin: 0, letterSpacing: "-0.02em", lineHeight: 1.3 }}>
                {progresion.titulo}
              </h1>
            </div>
          </div>

          {/* Progress bar */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
                {progresion.actividadesCompletadas} de {progresion.totalActividades} actividades
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: color.hex }}>
                {progresion.totalActividades > 0
                  ? Math.round((progresion.actividadesCompletadas / progresion.totalActividades) * 100)
                  : 0}%
              </span>
            </div>
            <div style={{ height: 4, borderRadius: 999, background: "rgba(255,255,255,0.12)" }}>
              {progresion.actividadesCompletadas > 0 && (
                <div style={{
                  height: "100%",
                  width: `${Math.round((progresion.actividadesCompletadas / progresion.totalActividades) * 100)}%`,
                  borderRadius: 999,
                  background: color.hex,
                }} />
              )}
            </div>
          </div>

          {/* Description */}
          {progresion.descripcion && (
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.60)", margin: "14px 0 0", lineHeight: 1.6 }}>
              {progresion.descripcion}
            </p>
          )}
        </div>

        {/* Section title */}
        <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0B2545", letterSpacing: "-0.02em", margin: "0 0 20px" }}>
          Ruta de actividades
        </h2>

        {/* Activity cards — vertical timeline */}
        {actividades.length === 0 ? (
          <div style={{
            borderRadius: 20,
            border: "2px dashed rgba(11,37,69,0.14)",
            background: "#fff",
            padding: "48px 32px",
            display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 12,
          }}>
            <i className="fa-regular fa-clock" style={{ fontSize: 40, color: "rgba(11,37,69,0.14)" }} />
            <p style={{ fontSize: 15, fontWeight: 700, color: "#0B2545", margin: 0 }}>
              Las actividades estarán disponibles pronto
            </p>
            <Link href={`/hub/uac/${codigo}`} style={{
              marginTop: 8, borderRadius: 999, background: "#0B2545", color: "#fff",
              padding: "10px 22px", fontSize: 13, fontWeight: 700, textDecoration: "none",
            }}>
              <i className="fa-solid fa-arrow-left" style={{ marginRight: 6 }} />
              Volver a {uac.nombre}
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {actividades.map((act, i) => {
              const tc = getTipoConfig(act.tipo);
              const isActCompleta = act.estado === "completada";
              const isActEnProgreso = act.estado === "en_progreso";
              const isLast = i === actividades.length - 1;

              const prevCompleted = i === 0 || actividades[i - 1]!.estado === "completada";
              const bloqueada = !prevCompleted;

              const LABELS = ["Activación", "Práctica", "Aplicación"];
              const phaseLabel = LABELS[i] ?? `Actividad ${act.orden}`;

              return (
                <div key={act.id} style={{ display: "flex", gap: 0 }}>
                  {/* Timeline node + connector */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: 16, flexShrink: 0 }}>
                    <div style={{
                      width: 40, height: 40,
                      borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14,
                      flexShrink: 0,
                      border: isActCompleta
                        ? "2px solid #16A34A"
                        : isActEnProgreso
                          ? `2px solid ${color.hex}`
                          : bloqueada
                            ? "2px solid rgba(11,37,69,0.12)"
                            : "2px solid rgba(11,37,69,0.18)",
                      background: isActCompleta
                        ? "#DCFCE7"
                        : isActEnProgreso
                          ? `rgba(${color.rgba}, 0.12)`
                          : "#F8FAFC",
                      color: isActCompleta
                        ? "#16A34A"
                        : isActEnProgreso
                          ? color.hex
                          : bloqueada
                            ? "rgba(11,37,69,0.20)"
                            : "rgba(11,37,69,0.50)",
                      zIndex: 1,
                    }}>
                      {isActCompleta
                        ? <i className="fa-solid fa-check" />
                        : bloqueada
                          ? <i className="fa-solid fa-lock" style={{ fontSize: 12 }} />
                          : <i className={`fa-solid ${tc.faIcon}`} style={{ fontSize: 13 }} />
                      }
                    </div>
                    {!isLast && (
                      <div style={{
                        width: 2,
                        flex: 1,
                        minHeight: 24,
                        background: isActCompleta ? "#BBF7D0" : `rgba(${color.rgba}, 0.18)`,
                        margin: "4px 0",
                      }} />
                    )}
                  </div>

                  {/* Card */}
                  <div style={{ flex: 1, paddingBottom: isLast ? 0 : 16 }}>
                    {bloqueada ? (
                      <div
                        title="Completá la actividad anterior primero"
                        style={{
                          borderRadius: 18,
                          border: "1px solid rgba(11,37,69,0.08)",
                          background: "#F8FAFC",
                          padding: "18px 20px",
                          opacity: 0.55,
                          cursor: "not-allowed",
                        }}
                      >
                        <ActivityCardContent act={act} phaseLabel={phaseLabel} color={color} tc={tc} isEnProgreso={false} />
                      </div>
                    ) : (
                      <Link
                        href={`/hub/uac/${codigo}/progresion/${numParsed}/actividad/${act.orden}`}
                        style={{ textDecoration: "none", display: "block" }}
                        className="hub-prog-card-link"
                      >
                        <div
                          style={{
                            borderRadius: 18,
                            border: isActCompleta
                              ? "1.5px solid rgba(34,197,94,0.25)"
                              : isActEnProgreso
                                ? `1.5px solid rgba(${color.rgba}, 0.35)`
                                : "1px solid rgba(11,37,69,0.10)",
                            background: isActCompleta
                              ? "#F0FDF4"
                              : isActEnProgreso
                                ? `rgba(${color.rgba}, 0.05)`
                                : "#fff",
                            padding: "18px 20px",
                            boxShadow: isActEnProgreso
                              ? `0 4px 20px rgba(${color.rgba}, 0.15)`
                              : "0 1px 4px rgba(11,37,69,0.05)",
                            transition: "box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease",
                            cursor: "pointer",
                          }}
                          className="hub-prog-card"
                        >
                          <ActivityCardContent act={act} phaseLabel={phaseLabel} color={color} tc={tc} isEnProgreso={isActEnProgreso} />
                        </div>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer nav */}
        <div style={{ marginTop: 32, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <Link href={`/hub/uac/${codigo}`} style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 13, fontWeight: 600, color: "rgba(11,37,69,0.55)",
            textDecoration: "none", padding: "8px 14px",
            borderRadius: 10, border: "1px solid rgba(11,37,69,0.10)",
            background: "#fff",
          }}>
            <i className="fa-solid fa-arrow-left" style={{ fontSize: 11 }} />
            Ver todas las progresiones
          </Link>
          {isCompleta && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "#16A34A" }}>
              <i className="fa-solid fa-circle-check" />
              ¡Progresión completada!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActivityCardContent({
  act,
  phaseLabel,
  color,
  tc,
  isEnProgreso,
}: {
  act: { titulo: string; tipo: string; xp: number; orden: number; estado: string };
  phaseLabel: string;
  color: { hex: string; rgba: string };
  tc: { faIcon: string; label: string; color: string };
  isEnProgreso: boolean;
}) {
  const isCompleta = act.estado === "completada";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      {/* Type icon */}
      <div style={{
        width: 48, height: 48,
        borderRadius: 14,
        flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 20,
        background: isCompleta
          ? "rgba(22,163,74,0.10)"
          : isEnProgreso
            ? `rgba(${color.rgba}, 0.12)`
            : "rgba(11,37,69,0.05)",
        color: isCompleta ? "#16A34A" : isEnProgreso ? color.hex : tc.color,
      }}>
        <i className={`fa-solid ${tc.faIcon}`} />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
          <span style={{
            fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em",
            color: isCompleta ? "#16A34A" : isEnProgreso ? color.hex : "rgba(11,37,69,0.40)",
          }}>
            A{act.orden} · {phaseLabel}
          </span>
          {isEnProgreso && (
            <span style={{
              borderRadius: 999, background: `rgba(${color.rgba}, 0.15)`,
              border: `1px solid rgba(${color.rgba}, 0.25)`,
              padding: "1px 7px", fontSize: 9, fontWeight: 700, color: color.hex,
              textTransform: "uppercase", letterSpacing: "0.08em",
            }}>
              Actual
            </span>
          )}
        </div>
        <p style={{ fontSize: 14, fontWeight: 700, color: "#0B2545", margin: "0 0 4px", lineHeight: 1.35 }}>
          {act.titulo}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            fontSize: 11, fontWeight: 600,
            color: isCompleta ? "#16A34A" : "rgba(11,37,69,0.45)",
          }}>
            {tc.label}
          </span>
          <span style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(11,37,69,0.20)", flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: "rgba(11,37,69,0.40)", fontWeight: 500 }}>
            +{act.xp} XP
          </span>
        </div>
      </div>

      {/* State indicator */}
      <div style={{ flexShrink: 0 }}>
        {isCompleta ? (
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "#DCFCE7", border: "1.5px solid rgba(34,197,94,0.30)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, color: "#16A34A",
          }}>
            <i className="fa-solid fa-check" />
          </div>
        ) : (
          <i className="fa-solid fa-chevron-right" style={{ fontSize: 12, color: "rgba(11,37,69,0.25)" }} />
        )}
      </div>
    </div>
  );
}
