import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getUser, getProfile } from "@/lib/supabase-helpers";
import { getUACPorCodigo } from "@/lib/mccems/estructura";
import { getProgresionesConEstado } from "@/lib/queries/hub";
import { getRSCColor, getTipoConfig } from "@/components/hub/hub-colors";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ codigo: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { codigo } = await params;
  const uac = getUACPorCodigo(codigo);
  return {
    title: uac ? `${uac.nombre} — CEN Bachillerato` : "UAC — CEN Bachillerato",
  };
}

export default async function UACPage({ params }: Props) {
  const { codigo } = await params;

  const user = await getUser();
  if (!user) redirect("/log-in");

  const profile = await getProfile(user.id);
  if (!profile) redirect("/log-in");

  const uac = getUACPorCodigo(codigo);
  if (!uac) notFound();

  const color = getRSCColor(uac.recursoCodigo ?? null);
  const progresiones = await getProgresionesConEstado(codigo, user.id);
  const completadas = progresiones.filter((p) => p.estado === "completada").length;
  const pct = progresiones.length > 0 ? Math.round((completadas / progresiones.length) * 100) : 0;

  const tieneContenido = progresiones.length > 0;

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 32px 60px" }}>
      <div style={{ maxWidth: 840 }}>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "rgba(11,37,69,0.45)", marginBottom: 24 }}>
          <Link href="/hub" style={{ color: "rgba(11,37,69,0.45)", textDecoration: "none" }}>Mi Hub</Link>
          <i className="fa-solid fa-chevron-right" style={{ fontSize: 9 }} />
          <span style={{ color: "#0B2545", fontWeight: 600 }}>{uac.nombre}</span>
        </nav>

        {/* UAC Header */}
        <div style={{
          borderRadius: 24,
          background: color.gradient,
          border: "1px solid rgba(255,255,255,0.08)",
          padding: "28px 32px",
          marginBottom: 28,
          display: "flex",
          gap: 24,
          alignItems: "center",
          boxShadow: "0 12px 40px rgba(0,0,0,0.20)",
        }}>
          {/* Icon */}
          <div style={{
            width: 72, height: 72,
            borderRadius: 20,
            background: `rgba(${color.rgba}, 0.15)`,
            border: `2px solid rgba(${color.rgba}, 0.30)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 32, color: color.hex,
            flexShrink: 0,
          }}>
            <i className={`fa-solid ${color.faIcon}`} />
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
              <span style={{
                borderRadius: 999, background: `rgba(${color.rgba}, 0.18)`,
                border: `1px solid rgba(${color.rgba}, 0.30)`,
                padding: "3px 12px", fontSize: 11, fontWeight: 700,
                color: color.hex, letterSpacing: "0.05em",
              }}>
                {codigo}
              </span>
              <span style={{
                borderRadius: 999, background: "rgba(255,255,255,0.10)",
                padding: "3px 12px", fontSize: 11, fontWeight: 600,
                color: "rgba(255,255,255,0.65)",
              }}>
                Semestre {uac.semestre}
              </span>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
              {uac.nombre}
            </h1>

            {/* Progress bar */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
                  {completadas} de {tieneContenido ? progresiones.length : uac.totalProgresionesEsperadas} progresiones
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: color.hex }}>{pct}%</span>
              </div>
              <div style={{ height: 4, borderRadius: 999, background: "rgba(255,255,255,0.12)" }}>
                {pct > 0 && (
                  <div style={{ height: "100%", width: `${pct}%`, borderRadius: 999, background: color.hex }} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Progresiones */}
        <div>
          <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0B2545", letterSpacing: "-0.02em", margin: "0 0 16px" }}>
            Ruta de aprendizaje
          </h2>

          {!tieneContenido ? (
            // Empty state
            <div style={{
              borderRadius: 20,
              border: "2px dashed rgba(11,37,69,0.14)",
              background: "#fff",
              padding: "48px 32px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: 12,
            }}>
              <i className="fa-regular fa-clock" style={{ fontSize: 40, color: "rgba(11,37,69,0.14)" }} />
              <p style={{ fontSize: 15, fontWeight: 700, color: "#0B2545", margin: 0 }}>Esta materia estará disponible próximamente</p>
              <p style={{ fontSize: 13, color: "rgba(11,37,69,0.50)", margin: 0, maxWidth: 360 }}>
                El contenido de {uac.nombre} está en preparación. Volvé pronto.
              </p>
              <Link href="/hub" style={{
                marginTop: 8,
                borderRadius: 999, background: "#0B2545", color: "#fff",
                padding: "10px 22px", fontSize: 13, fontWeight: 700, textDecoration: "none",
              }}>
                <i className="fa-solid fa-arrow-left" style={{ marginRight: 6 }} />
                Volver al Hub
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {progresiones.map((prog, i) => {
                const isLast = i === progresiones.length - 1;
                const isCompleta = prog.estado === "completada";
                const isEnProgreso = prog.estado === "en_progreso";
                const bloqueada = i > 0 && progresiones[i - 1]!.estado === "no_iniciada";

                return (
                  <div key={prog.id} style={{ display: "flex", gap: 0 }}>
                    {/* Timeline line + node */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: 16, flexShrink: 0 }}>
                      {/* Node */}
                      <div style={{
                        width: 36, height: 36,
                        borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 13, fontWeight: 800,
                        flexShrink: 0,
                        border: isCompleta
                          ? "2px solid #16A34A"
                          : isEnProgreso
                            ? `2px solid ${color.hex}`
                            : bloqueada
                              ? "2px solid rgba(11,37,69,0.15)"
                              : "2px solid rgba(11,37,69,0.18)",
                        background: isCompleta
                          ? "#DCFCE7"
                          : isEnProgreso
                            ? `rgba(${color.rgba}, 0.12)`
                            : "#F8FAFC",
                        color: isCompleta
                          ? "#16A34A"
                          : isEnProgreso
                            ? color.hex
                            : bloqueada
                              ? "rgba(11,37,69,0.25)"
                              : "rgba(11,37,69,0.55)",
                        zIndex: 1,
                        transition: "all 0.2s",
                      }}>
                        {isCompleta
                          ? <i className="fa-solid fa-check" style={{ fontSize: 13 }} />
                          : bloqueada
                            ? <i className="fa-solid fa-lock" style={{ fontSize: 11 }} />
                            : prog.numero}
                      </div>
                      {/* Connector line */}
                      {!isLast && (
                        <div style={{
                          width: 2,
                          flex: 1,
                          minHeight: 20,
                          background: isCompleta ? "#BBF7D0" : `rgba(${color.rgba}, 0.20)`,
                          margin: "4px 0",
                        }} />
                      )}
                    </div>

                    {/* Card content */}
                    <div style={{ flex: 1, paddingBottom: isLast ? 0 : 12 }}>
                      {bloqueada ? (
                        // Non-clickable locked state
                        <div
                          title="Completá la progresión anterior primero"
                          style={{
                            borderRadius: 16,
                            border: "1px solid rgba(11,37,69,0.08)",
                            background: "#F8FAFC",
                            padding: "14px 16px",
                            opacity: 0.6,
                            cursor: "not-allowed",
                          }}
                        >
                          <ProgresionCardContent prog={prog} color={color} isEnProgreso={false} />
                        </div>
                      ) : (
                        <Link
                          href={`/hub/uac/${codigo}/progresion/${prog.numero}`}
                          style={{ textDecoration: "none", display: "block" }}
                          className="hub-prog-card-link"
                        >
                          <div
                            style={{
                              borderRadius: 16,
                              border: isEnProgreso
                                ? `1.5px solid rgba(${color.rgba}, 0.35)`
                                : isCompleta
                                  ? "1.5px solid rgba(34,197,94,0.25)"
                                  : "1px solid rgba(11,37,69,0.10)",
                              background: isCompleta ? "#F0FDF4" : isEnProgreso ? `rgba(${color.rgba}, 0.05)` : "#fff",
                              padding: "14px 16px",
                              boxShadow: isEnProgreso
                                ? `0 4px 16px rgba(${color.rgba}, 0.15)`
                                : "0 1px 4px rgba(11,37,69,0.05)",
                              transition: "box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease",
                              cursor: "pointer",
                            }}
                            className="hub-prog-card"
                          >
                            <ProgresionCardContent prog={prog} color={color} isEnProgreso={isEnProgreso} />
                          </div>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProgresionCardContent({
  prog,
  color,
  isEnProgreso,
}: {
  prog: { numero: number; titulo: string; descripcion: string | null; tiempo_estimado_horas: number | null; estado: string; actividadesCompletadas: number; totalActividades: number; actividades?: Array<{ tipo: string; estado: string; orden: number }> };
  color: { hex: string; rgba: string; faIcon: string };
  isEnProgreso: boolean;
}) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {isEnProgreso && (
            <span style={{
              display: "inline-block",
              marginBottom: 4,
              borderRadius: 999,
              background: `rgba(${color.rgba}, 0.15)`,
              border: `1px solid rgba(${color.rgba}, 0.25)`,
              padding: "2px 8px",
              fontSize: 10,
              fontWeight: 700,
              color: color.hex,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}>
              Actual
            </span>
          )}
          <p style={{ fontSize: 14, fontWeight: 700, color: "#0B2545", margin: 0, lineHeight: 1.4 }}>
            {prog.titulo}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <span style={{ fontSize: 12, color: "rgba(11,37,69,0.50)" }}>
            {prog.actividadesCompletadas}/{prog.totalActividades}
          </span>
          {prog.tiempo_estimado_horas && (
            <span style={{
              borderRadius: 999, background: "rgba(11,37,69,0.07)",
              padding: "2px 8px", fontSize: 11, fontWeight: 600, color: "rgba(11,37,69,0.50)",
            }}>
              {prog.tiempo_estimado_horas}h
            </span>
          )}
        </div>
      </div>

      {/* Mini activity previews */}
      {prog.actividades && prog.actividades.length > 0 && (
        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
          {prog.actividades.map((act) => {
            const tc = getTipoConfig(act.tipo);
            const done = act.estado === "completada";
            const inProg = act.estado === "en_progreso";
            return (
              <div
                key={act.orden}
                title={`A${act.orden}: ${tc.label}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  borderRadius: 8,
                  padding: "4px 8px",
                  fontSize: 11,
                  fontWeight: 600,
                  background: done ? "#DCFCE7" : inProg ? `rgba(${color.rgba}, 0.12)` : "rgba(11,37,69,0.06)",
                  color: done ? "#16A34A" : inProg ? color.hex : "rgba(11,37,69,0.45)",
                  border: done ? "1px solid rgba(34,197,94,0.25)" : "1px solid transparent",
                }}
              >
                <i className={`fa-solid ${tc.faIcon}`} style={{ fontSize: 10 }} />
                A{act.orden}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
