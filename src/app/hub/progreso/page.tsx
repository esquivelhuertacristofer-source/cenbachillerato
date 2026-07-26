"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { getRSCColor, TIPO_CONFIG } from "@/components/hub/hub-colors";
import { ProgresoUACGrid } from "@/components/hub/ProgresoUACGrid";
import {
  getCurrentProfile,
  getProgresoSemestreBrowser,
  getRachaDelAlumnoBrowser,
  getProgresoDetallePorUACBrowser,
  getResumenActividadAlumnoBrowser,
  type ProgresoSemestreBrowser,
  type ProgresoUAC,
  type ResumenActividadAlumno,
  type RachaData,
} from "@/lib/queries/hub-browser";
import { calendarioVacio, statsVacias } from "@/lib/queries/progreso-shared";
import "./Progreso.css";

// Lever #2 — hidratación en navegador: la página es un Client Component que
// pinta su armazón (skeleton) al instante y rellena los datos con queries del
// navegador después. No exporta `metadata` (los Client Components no pueden);
// el título se fija con document.title en el efecto. La lógica de conteo/
// derivación es idéntica a la ruta de servidor: vive en hub-browser.ts /
// progreso-shared.ts, que ambas rutas comparten.

// Formas vacías para fallar-abierto: si una query se rechaza (red/RLS), la
// página se pinta con ceros en vez de quedar en blanco.
const PROGRESO_VACIO: ProgresoSemestreBrowser = {
  totalProgresiones: 0,
  progresionesCompletadas: 0,
  actividadesEstaSemana: 0,
  minutosEstaSemana: 0,
  porcentaje: 0,
};
const RACHA_VACIA: RachaData = { diasConsecutivos: 0, ultimos7Dias: [] };

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

// ── Skeleton: mismo esqueleto de layout que el contenido real, sin salto ──
function ProgresoSkeleton() {
  return (
    <div className="prog-page" aria-busy="true" aria-label="Cargando tu progreso">
      <div className="prog-head">
        <p className="prog-eyebrow">Dashboard personal</p>
        <h1 className="prog-title">Mi Progreso</h1>
      </div>

      <section className="prog-hero">
        <div className="prog-skel-box prog-skel-gauge" />
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          <div className="prog-skel-box prog-skel-line" style={{ width: "42%" }} />
          <div className="prog-skel-box prog-skel-line" style={{ width: "68%", height: 24 }} />
          <div className="prog-skel-box prog-skel-line" style={{ width: "54%" }} />
          <div style={{ display: "flex", gap: 14, marginTop: 8, flexWrap: "wrap" }}>
            <div className="prog-skel-box" style={{ width: 168, height: 58, borderRadius: 14 }} />
            <div className="prog-skel-box" style={{ width: 168, height: 58, borderRadius: 14 }} />
          </div>
        </div>
      </section>

      <div className="prog-block">
        <h2 className="prog-section-title">Por materia</h2>
        <div className="prog-uac-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="prog-skel-box prog-skel-uac" />
          ))}
        </div>
      </div>

      <div className="prog-2col">
        <div className="prog-card">
          <div className="prog-skel-box prog-skel-line" style={{ width: "45%", height: 18, marginBottom: 20 }} />
          <div className="prog-heat">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="prog-skel-box prog-heat-cell" />
            ))}
          </div>
        </div>
      </div>

      <div className="prog-card">
        <div className="prog-skel-box prog-skel-line" style={{ width: "45%", height: 18, marginBottom: 20 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="prog-skel-box prog-skel-line" style={{ height: 46 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProgresoPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [semestre, setSemestre] = useState(1);
  const [progreso, setProgreso] = useState<ProgresoSemestreBrowser>(PROGRESO_VACIO);
  const [rachaData, setRachaData] = useState<RachaData>(RACHA_VACIA);
  const [progresoUAC, setProgresoUAC] = useState<ProgresoUAC[]>([]);
  const [resumen, setResumen] = useState<ResumenActividadAlumno>({
    recientes: [],
    calendario: calendarioVacio(),
    stats: statsVacias(),
  });

  useEffect(() => {
    let cancelled = false;
    document.title = "Mi Progreso — CEN Bachillerato";

    async function fetchData() {
      try {
        const prof = await getCurrentProfile();
        if (cancelled) return;
        if (!prof) { router.replace("/log-in"); return; }

        const sem = prof.semestre;
        setSemestre(sem);

        // allSettled: una query que falle (RLS, red) no tumba la página; cada
        // sección cae a su forma vacía. Las tres primeras comparten la caché
        // consolidada del semestre (getDatosSemestre); solo la 4.ª hace sus 3
        // queries acotadas de recientes/calendario/stats.
        const [progresoR, rachaR, uacR, resumenR] = await Promise.allSettled([
          getProgresoSemestreBrowser(prof.userId, sem),
          getRachaDelAlumnoBrowser(prof.userId, sem),
          getProgresoDetallePorUACBrowser(prof.userId, sem),
          getResumenActividadAlumnoBrowser(15),
        ]);

        if (cancelled) return;

        setProgreso(progresoR.status === "fulfilled" ? progresoR.value : PROGRESO_VACIO);
        setRachaData(rachaR.status === "fulfilled" ? rachaR.value : RACHA_VACIA);
        setProgresoUAC(uacR.status === "fulfilled" ? uacR.value : []);
        if (resumenR.status === "fulfilled") setResumen(resumenR.value);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [router]);

  if (loading) return <ProgresoSkeleton />;

  if (error) {
    return (
      <div className="prog-page" style={{ textAlign: "center", paddingTop: 80 }}>
        <h2 style={{ marginBottom: 12, color: "#fff" }}>No pudimos cargar tu progreso</h2>
        <p style={{ opacity: 0.7, marginBottom: 24 }}>
          Revisa tu conexión e inténtalo de nuevo.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "10px 24px",
            borderRadius: 10,
            border: "none",
            background: "#38BDF8",
            color: "#04142d",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  const { recientes: actividadesRecientes, calendario, stats } = resumen;
  const { porcentaje, totalProgresiones, progresionesCompletadas, actividadesEstaSemana, minutosEstaSemana } = progreso;
  const { diasConsecutivos } = rachaData;

  // Medidor radial del hero
  const R = 66;
  const circ = 2 * Math.PI * R;
  const offset = circ * (1 - porcentaje / 100);

  const rachaRecord = diasConsecutivos;
  const tiempoTotal = `${Math.round(stats.totalMinutos / 60)}h ${stats.totalMinutos % 60}m`;

  const HERO_STATS = [
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
                Completá tu primera actividad para arrancar tu avance y
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
              <div key={item.label} className="prog-stat" style={{ "--stat-color": item.color } as CSSProperties}>
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
                <div key={act.id} className="prog-act" style={{ "--chip-color": color.hex } as CSSProperties}>
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
