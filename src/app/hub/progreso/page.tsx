import { redirect } from "next/navigation";
import { getUser, getProfile } from "@/lib/supabase-helpers";
import { getProgresoSemestre, getRachaDelAlumno } from "@/lib/queries/hub";
import { getRSCColor, TIPO_CONFIG } from "@/components/hub/hub-colors";
import { ProgresoUACGrid } from "@/components/hub/ProgresoUACGrid";
import {
  getProgresoDetallePorUAC,
  getActividadesRecientes,
  getCalendario30Dias,
  getEstadisticasProgreso,
  getLogros,
} from "@/lib/queries/progreso";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mi Progreso — CEN Bachillerato" };

const DAY_LABELS = ["D", "L", "M", "X", "J", "V", "S"];

function timeAgo(dateStr: string): string {
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

export default async function ProgresoPage() {
  const user = await getUser();
  if (!user) redirect("/log-in");

  const profile = await getProfile(user.id);
  if (!profile) redirect("/log-in");

  const semestre = profile.semestre ?? 1;

  const [progreso, rachaData, progresoUAC, actividadesRecientes, calendario, stats, logros] = await Promise.all([
    getProgresoSemestre(user.id, semestre),
    getRachaDelAlumno(user.id),
    getProgresoDetallePorUAC(user.id, semestre),
    getActividadesRecientes(user.id, 15),
    getCalendario30Dias(user.id),
    getEstadisticasProgreso(user.id),
    getLogros(user.id),
  ]);

  const { porcentaje, totalProgresiones, progresionesCompletadas, actividadesEstaSemana, minutosEstaSemana } = progreso;
  const { diasConsecutivos } = rachaData;

  // Donut ring
  const R = 54;
  const circ = 2 * Math.PI * R;
  const offset = circ * (1 - porcentaje / 100);

  const rachaRecord = diasConsecutivos;

  const CARD_STYLE = {
    borderRadius: 20,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    padding: "24px",
  };

  return (
    <div style={{ padding: "36px 40px 80px", maxWidth: 1200, margin: "0 auto" }}>

      {/* ── Header ─── */}
      <div style={{ marginBottom: 36 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 4px" }}>
          Dashboard personal
        </p>
        <h1 style={{ fontSize: "clamp(26px, 3vw, 38px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", margin: 0 }}>
          Mi Progreso
        </h1>
      </div>

      {/* ── Bloque 1: Resumen global ─── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: 20,
        marginBottom: 32,
      }}>
        {/* Donut global — already dark */}
        <div style={{
          gridColumn: "span 1",
          borderRadius: 20,
          background: "linear-gradient(145deg, #0B2545 0%, #0E2D60 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          padding: "28px 24px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
          display: "flex", alignItems: "center", gap: 20,
        }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <svg width={120} height={120} viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
              <circle cx={60} cy={60} r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={9} />
              {porcentaje > 0 && (
                <circle
                  cx={60} cy={60} r={R}
                  fill="none" stroke="#38BDF8" strokeWidth={9}
                  strokeDasharray={circ}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 1.2s ease" }}
                />
              )}
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1, letterSpacing: "-0.03em" }}>{porcentaje}%</span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.40)", fontWeight: 600, marginTop: 2 }}>avance</span>
            </div>
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(125,211,252,0.70)", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 6px" }}>
              Semestre {semestre}
            </p>
            <p style={{ fontSize: 28, fontWeight: 900, color: "#fff", margin: "0 0 4px", letterSpacing: "-0.04em", lineHeight: 1 }}>
              {progresionesCompletadas}
              <span style={{ fontSize: 15, fontWeight: 400, color: "rgba(255,255,255,0.35)" }}>/{totalProgresiones}</span>
            </p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: "0 0 12px" }}>progresiones</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
                <span style={{ fontWeight: 800, color: "#38BDF8" }}>{actividadesEstaSemana}</span>
                {" "}actividades esta semana
              </span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
                <span style={{ fontWeight: 800, color: "#38BDF8" }}>{minutosEstaSemana}m</span>
                {" "}dedicados
              </span>
            </div>
          </div>
        </div>

        {/* XP + actividades */}
        <div style={CARD_STYLE}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 16px" }}>
            Estadísticas
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { label: "Total XP ganado", value: stats.totalXP.toLocaleString("es-MX"), icon: "fa-star", color: "#FBBF24" },
              { label: "Actividades completadas", value: stats.totalActividades, icon: "fa-check", color: "#34D399" },
              { label: "Tiempo total", value: `${Math.round(stats.totalMinutos / 60)}h ${stats.totalMinutos % 60}m`, icon: "fa-clock", color: "#38BDF8" },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: `${item.color}20`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, color: item.color, flexShrink: 0,
                }}>
                  <i className={`fa-solid ${item.icon}`} />
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1 }}>{item.value}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.40)", fontWeight: 500 }}>{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Materia más fuerte + tipo fav */}
        <div style={CARD_STYLE}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 16px" }}>
            Destaque
          </p>
          {stats.materiaMasFuerte ? (
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.10em", display: "block", marginBottom: 4 }}>
                Materia más fuerte
              </span>
              <span style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>{stats.materiaMasFuerte.nombre}</span>
            </div>
          ) : (
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)" }}>Completá actividades para ver estadísticas.</p>
          )}
          {stats.tipoActividades[0] && (
            <div>
              <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.10em", display: "block", marginBottom: 4 }}>
                Actividad favorita
              </span>
              <span style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>
                {TIPO_CONFIG[stats.tipoActividades[0].tipo]?.label ?? stats.tipoActividades[0].tipo}
              </span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginLeft: 6 }}>({stats.tipoActividades[0].cantidad} veces)</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Bloque 2: Por materia — client component with stagger ─── */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", margin: "0 0 16px" }}>
          Por materia
        </h2>
        <ProgresoUACGrid items={progresoUAC} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }} className="progreso-2col">

        {/* ── Bloque 3: Racha 30 días ─── */}
        <div style={CARD_STYLE}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>Racha diaria</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: diasConsecutivos > 0 ? "rgba(251,146,60,0.12)" : "rgba(255,255,255,0.05)", border: diasConsecutivos > 0 ? "1px solid rgba(251,146,60,0.25)" : "1px solid rgba(255,255,255,0.08)", borderRadius: 999, padding: "4px 12px" }}>
              <span style={{ fontSize: 16 }}>🔥</span>
              <span style={{ fontSize: 16, fontWeight: 900, color: diasConsecutivos > 0 ? "#FB923C" : "rgba(255,255,255,0.20)", letterSpacing: "-0.02em" }}>{diasConsecutivos}</span>
            </div>
          </div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.40)", margin: "0 0 14px" }}>
            {diasConsecutivos === 0 ? "Empezá hoy y construí tu racha 💪" : `¡${diasConsecutivos} día${diasConsecutivos !== 1 ? "s" : ""} seguido${diasConsecutivos !== 1 ? "s" : ""}!`}
          </p>

          {/* 30-day calendar */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 5 }}>
            {calendario.map((day) => {
              const d = new Date(day.fecha + "T12:00:00");
              const dow = d.getDay();
              const rscColor = day.rscCodigo ? getRSCColor(day.rscCodigo) : null;
              return (
                <div key={day.fecha} title={day.fecha} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                  <span style={{ fontSize: 8, color: "rgba(255,255,255,0.22)", fontWeight: 600 }}>
                    {DAY_LABELS[dow]}
                  </span>
                  <div style={{
                    width: "100%", aspectRatio: "1", borderRadius: 5,
                    background: day.activo
                      ? (rscColor ? rscColor.hex : "#1E40AF")
                      : "rgba(255,255,255,0.06)",
                    opacity: day.activo ? 1 : 0.6,
                    boxShadow: day.activo ? `0 2px 6px ${rscColor?.hex ?? "#1E40AF"}40` : "none",
                  }} />
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", margin: "12px 0 0" }}>
            Récord: {rachaRecord} días · Últimos 30 días
          </p>
        </div>

        {/* ── Bloque 5: Logros ─── */}
        <div style={CARD_STYLE}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: "#fff", margin: 0 }}>Logros</h2>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.20)", cursor: "not-allowed" }}>Ver todos</span>
          </div>
          {logros.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>🏆</div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: "0 0 6px" }}>Sin logros todavía</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.40)", margin: 0, lineHeight: 1.55 }}>
                Completá actividades y desbloqueá tus primeros logros.
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {logros.map((logro) => (
                <div key={logro.id} title={`${logro.nombre}: ${logro.descripcion}`} style={{
                  width: "100%", aspectRatio: "1",
                  borderRadius: 12, background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 24, cursor: "default",
                }}>
                  {logro.icono}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Bloque 4: Actividades recientes ─── */}
      <div style={{ ...CARD_STYLE }}>
        <h2 style={{ fontSize: 15, fontWeight: 800, color: "#fff", margin: "0 0 18px" }}>Actividades recientes</h2>
        {actividadesRecientes.length === 0 ? (
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", textAlign: "center", padding: "20px 0" }}>
            No hay actividades completadas todavía.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {actividadesRecientes.map((act) => {
              const color = getRSCColor(act.rscCodigo);
              const tipoConf = TIPO_CONFIG[act.tipo];
              return (
                <div key={act.id} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "10px 12px", borderRadius: 12,
                  cursor: "default",
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: `rgba(${color.rgba}, 0.12)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, color: color.hex, flexShrink: 0,
                  }}>
                    <i className={`fa-solid ${tipoConf?.faIcon ?? "fa-check"}`} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {act.titulo}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", display: "flex", gap: 8 }}>
                      <span style={{ fontWeight: 600, color: color.hex }}>{act.uacCodigo}</span>
                      <span>·</span>
                      <span>{tipoConf?.label ?? act.tipo}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#FBBF24" }}>+{act.xpGanado} XP</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.28)" }}>{timeAgo(act.completadaEn)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
