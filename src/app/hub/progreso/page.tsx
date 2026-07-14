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
  getLogrosCatalogo,
} from "@/lib/queries/progreso";
import type { Metadata } from "next";
import "./Progreso.css";

export const metadata: Metadata = { title: "Mi Progreso — CEN Bachillerato" };

function criterioLabel(tipo: string, valor: number): string {
  if (tipo === "actividades") return `Completá ${valor} actividad${valor === 1 ? "" : "es"}`;
  if (tipo === "xp") return `Acumulá ${valor.toLocaleString("es-MX")} XP`;
  if (tipo === "racha") return `Racha de ${valor} día${valor === 1 ? "" : "s"}`;
  if (tipo === "minutos") return `Estudia ${Math.floor(valor / 60)}h en total`;
  return String(valor);
}

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

  const [progreso, rachaData, progresoUAC, actividadesRecientes, calendario, stats, logrosCatalogo] = await Promise.all([
    getProgresoSemestre(user.id, semestre),
    getRachaDelAlumno(user.id),
    getProgresoDetallePorUAC(user.id, semestre),
    getActividadesRecientes(user.id, 15),
    getCalendario30Dias(user.id),
    getEstadisticasProgreso(user.id),
    getLogrosCatalogo(user.id),
  ]);

  const { porcentaje, totalProgresiones, progresionesCompletadas, actividadesEstaSemana, minutosEstaSemana } = progreso;
  const { diasConsecutivos } = rachaData;

  // Medidor radial del hero
  const R = 66;
  const circ = 2 * Math.PI * R;
  const offset = circ * (1 - porcentaje / 100);

  const rachaRecord = diasConsecutivos;
  const tiempoTotal = `${Math.round(stats.totalMinutos / 60)}h ${stats.totalMinutos % 60}m`;

  const HERO_STATS = [
    { label: "Total XP ganado", value: stats.totalXP.toLocaleString("es-MX"), icon: "fa-star", color: "#FBBF24" },
    { label: "Actividades completadas", value: stats.totalActividades, icon: "fa-check", color: "#34D399" },
    { label: "Tiempo total", value: tiempoTotal, icon: "fa-clock", color: "#38BDF8" },
  ];

  return (
    <div className="prog-page">

      {/* ── Encabezado ─── */}
      <div className="prog-head">
        <p className="prog-eyebrow">Dashboard personal</p>
        <h1 className="prog-title">Mi Progreso</h1>
      </div>

      {/* ── HERO: resumen global ─── */}
      <section className="prog-hero">
        {/* Medidor radial */}
        <div className="prog-hero-gauge">
          <svg viewBox="0 0 160 160">
            <defs>
              <linearGradient id="prog-gauge-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#A78BFA" />
              </linearGradient>
            </defs>
            <circle cx={80} cy={80} r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={12} />
            {porcentaje > 0 && (
              <circle
                cx={80} cy={80} r={R}
                fill="none" stroke="url(#prog-gauge-grad)" strokeWidth={12}
                strokeDasharray={circ}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 1.2s ease" }}
              />
            )}
          </svg>
          <div className="prog-hero-gauge-center">
            <span className="prog-hero-gauge-num">{porcentaje}%</span>
            <span className="prog-hero-gauge-cap">avance</span>
          </div>
        </div>

        {/* Contenido */}
        <div className="prog-hero-main">
          <p className="prog-hero-kicker">Semestre {semestre} · avance global</p>
          {porcentaje === 0 ? (
            <>
              <p className="prog-hero-big">Tu semestre empieza aquí</p>
              <p className="prog-hero-sub">
                Completá tu primera actividad para arrancar tu avance, sumar XP y
                encender tu racha. <strong>{totalProgresiones} propósitos formativos</strong> te esperan.
              </p>
            </>
          ) : (
            <>
              <p className="prog-hero-big">
                {progresionesCompletadas}<span> / {totalProgresiones} propósitos formativos</span>
              </p>
              <p className="prog-hero-sub">
                <strong>{actividadesEstaSemana}</strong> actividades y{" "}
                <strong>{minutosEstaSemana} min</strong> dedicados esta semana.
              </p>
            </>
          )}

          <div className="prog-hero-stats">
            {HERO_STATS.map((item) => (
              <div key={item.label} className="prog-stat" style={{ "--stat-color": item.color } as React.CSSProperties}>
                <div className="prog-stat-ico"><i className={`fa-solid ${item.icon}`} /></div>
                <div>
                  <div className="prog-stat-val">{item.value}</div>
                  <div className="prog-stat-lbl">{item.label}</div>
                </div>
              </div>
            ))}
          </div>

          {(stats.materiaMasFuerte || stats.tipoActividades[0]) && (
            <div className="prog-hero-chips">
              {stats.materiaMasFuerte && (
                <span className="prog-chip">
                  Materia más fuerte <strong>{stats.materiaMasFuerte.nombre}</strong>
                </span>
              )}
              {stats.tipoActividades[0] && (
                <span className="prog-chip">
                  Actividad favorita{" "}
                  <strong>{TIPO_CONFIG[stats.tipoActividades[0].tipo]?.label ?? stats.tipoActividades[0].tipo}</strong>
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Por materia ─── */}
      <div className="prog-block">
        <h2 className="prog-section-title">Por materia</h2>
        <ProgresoUACGrid items={progresoUAC} />
      </div>

      <div className="prog-2col">

        {/* ── Racha 30 días ─── */}
        <div className="prog-card">
          <div className="prog-card-head">
            <h2 className="prog-card-title">Racha diaria</h2>
            <div className={`prog-racha-flame ${diasConsecutivos > 0 ? "" : "off"}`}>
              <span style={{ fontSize: 15 }}>🔥</span>
              <span>{diasConsecutivos}</span>
            </div>
          </div>
          <p className="prog-racha-sub">
            {diasConsecutivos === 0
              ? "Empezá hoy y construí tu racha 💪"
              : `¡${diasConsecutivos} día${diasConsecutivos !== 1 ? "s" : ""} seguido${diasConsecutivos !== 1 ? "s" : ""}!`}
          </p>

          {/* Heatmap 30 días */}
          <div className="prog-heat">
            {calendario.map((day) => {
              const rscColor = day.rscCodigo ? getRSCColor(day.rscCodigo) : null;
              const hex = rscColor?.hex ?? "#38BDF8";
              return (
                <div
                  key={day.fecha}
                  title={day.fecha}
                  className={`prog-heat-cell ${day.activo ? "on" : ""}`}
                  style={day.activo ? { background: hex, boxShadow: `0 2px 8px ${hex}55` } : undefined}
                />
              );
            })}
          </div>
          <div className="prog-heat-foot">
            <span>Récord: {rachaRecord} días · últimos 30 días</span>
            <span className="prog-heat-legend">
              menos
              <i style={{ background: "rgba(255,255,255,0.08)" }} />
              <i style={{ background: "rgba(56,189,248,0.5)" }} />
              <i style={{ background: "#38BDF8" }} />
              más
            </span>
          </div>
        </div>

        {/* ── Logros ─── */}
        <div className="prog-card">
          <div className="prog-card-head">
            <h2 className="prog-card-title">Logros</h2>
            {logrosCatalogo.length > 0 && (
              <span className="prog-logros-count">
                {logrosCatalogo.filter((l) => l.desbloqueado).length}
                {" / "}
                {logrosCatalogo.length}
              </span>
            )}
          </div>
          {logrosCatalogo.length === 0 ? (
            <div className="prog-empty">
              <div className="prog-empty-badge">🏆</div>
              <p className="prog-empty-title">Sin logros todavía</p>
              <p className="prog-empty-desc">Completá actividades y desbloqueá tus primeros logros.</p>
            </div>
          ) : (
            <div className="prog-logros-grid">
              {logrosCatalogo.map((logro) => (
                <div
                  key={logro.id}
                  title={
                    logro.desbloqueado
                      ? `${logro.nombre}: ${logro.descripcion}`
                      : `🔒 ${logro.nombre} · ${criterioLabel(logro.criterio_tipo, logro.criterio_valor)}`
                  }
                  className={`prog-logro${logro.desbloqueado ? "" : " locked"}`}
                >
                  {logro.icono}
                  {!logro.desbloqueado && (
                    <i className="fa-solid fa-lock prog-logro-lock" aria-hidden="true" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Actividades recientes ─── */}
      <div className="prog-card">
        <h2 className="prog-card-title" style={{ marginBottom: 18 }}>Actividades recientes</h2>
        {actividadesRecientes.length === 0 ? (
          <p className="prog-empty-line">No hay actividades completadas todavía.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {actividadesRecientes.map((act) => {
              const color = getRSCColor(act.rscCodigo);
              const tipoConf = TIPO_CONFIG[act.tipo];
              return (
                <div key={act.id} className="prog-act" style={{ "--chip-color": color.hex } as React.CSSProperties}>
                  <div className="prog-act-ico"><i className={`fa-solid ${tipoConf?.faIcon ?? "fa-check"}`} /></div>
                  <div className="prog-act-body">
                    <div className="prog-act-title">{act.titulo}</div>
                    <div className="prog-act-meta">
                      <span className="uac">{act.uacCodigo}</span>
                      <span>·</span>
                      <span>{tipoConf?.label ?? act.tipo}</span>
                    </div>
                  </div>
                  <div className="prog-act-right">
                    <div className="prog-act-xp">+{act.xpGanado} XP</div>
                    <div className="prog-act-when">{timeAgo(act.completadaEn)}</div>
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
