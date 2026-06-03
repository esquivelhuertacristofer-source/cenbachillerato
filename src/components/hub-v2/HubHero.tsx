"use client";

import Link from "next/link";
import { getUACPorCodigo } from "@/lib/mccems/estructura";
import { RECURSOS_SOCIOCOGNITIVOS } from "@/lib/mccems/recursos-sociocognitivos";
import { getVideoBienvenida } from "@/lib/mccems/bienvenida";
import "./HubHero.css";

interface HeroUAC {
  codigo: string;
  nombre: string;
  done: number;
  total: number;
  pct: number;
}

interface HubHeroProps {
  semestre: number;
  pctGlobal: number;
  dia: number;
  materiasActivas: number;
  uacs: HeroUAC[];
}

export default function HubHero({
  semestre,
  pctGlobal,
  dia,
  materiasActivas,
  uacs,
}: HubHeroProps) {
  // ── Métricas reales (todo sale del progreso del alumno) ──
  const totalUAC = uacs.length;
  const totalProg = uacs.reduce((s, u) => s + u.total, 0);
  const doneProg = uacs.reduce((s, u) => s + u.done, 0);

  // ── Áreas (recursos sociocognitivos) presentes este semestre, sin repetir ──
  const areas: string[] = [];
  for (const u of uacs) {
    const base = getUACPorCodigo(u.codigo);
    const rec = RECURSOS_SOCIOCOGNITIVOS.find((r) => r.codigo === base?.recursoCodigo);
    if (rec && !areas.includes(rec.nombre)) areas.push(rec.nombre);
  }
  const areasTexto =
    areas.length > 1
      ? `${areas.slice(0, -1).join(", ")} y ${areas[areas.length - 1]}`
      : areas[0] ?? "el Currículum Fundamental";

  const dominioColor = pctGlobal >= 80 ? "#34D399" : "#7DD3FC";

  const video = getVideoBienvenida(semestre);

  return (
    <header className="hub-hero hub-v2-animate">
      <div className="hub-hero-grid">
        {/* ── Columna de texto: el semestre es el protagonista ─── */}
        <div className="hub-hero-inner">
          <div className="hub-hero-eyebrow">
            <i className="fa-solid fa-graduation-cap" />
            Marco Curricular Común · Currículum Fundamental
          </div>

          <h1 className="hub-hero-title">
            Semestre <span className="hub-hero-sem-num">{semestre}</span>
          </h1>

          <h2 className="hub-hero-subtitle">
            {totalUAC} materias · {areas.length} áreas de conocimiento
          </h2>

          <p className="hub-hero-desc">
            Cursas <strong>{totalUAC} materias del Currículum Fundamental</strong> del MCCEMS,
            en {areas.length} áreas: {areasTexto}. Es la base común y obligatoria para todos
            los bachilleratos del país.
          </p>
        </div>

        {/* ── Columna de media (video de bienvenida) ─── */}
        <div className="hub-hero-media">
          <HeroVideo video={video} semestre={semestre} />
        </div>
      </div>

      {/* ── Barra de dominio global: full-width, debajo de todo el bloque ─── */}
      <div className="hub-hero-progress">
        <div className="hub-hero-progress-head">
          <span className="hub-hero-progress-label">Dominio global del semestre</span>
          <span className="hub-hero-progress-val" style={{ color: dominioColor }}>
            {pctGlobal}
            <span className="hub-hero-progress-pct">%</span>
          </span>
        </div>
        <div className="hub-hero-progress-track">
          <div
            className="hub-hero-progress-fill"
            style={{
              width: `${pctGlobal}%`,
              background:
                pctGlobal >= 80
                  ? "linear-gradient(90deg,#34D399,#6EE7B7)"
                  : "linear-gradient(90deg,#38BDF8,#7DD3FC)",
            }}
          />
        </div>
        <div className="hub-hero-progress-foot">
          <span>
            <i className="fa-solid fa-layer-group" /> {totalUAC} materias
          </span>
          <span>
            <i className="fa-solid fa-circle-check" /> {doneProg}/{totalProg} progresiones
          </span>
          <span>
            <i className="fa-solid fa-calendar-day" /> Día {dia} del semestre
          </span>
          {materiasActivas > 0 && (
            <span className="hub-hero-foot-active">
              <span className="hub-hero-foot-dot" /> {materiasActivas} en curso
            </span>
          )}
        </div>
      </div>
    </header>
  );
}

/* ── Panel de video: reproductor real si hay URL, placeholder honesto si no ── */
function HeroVideo({
  video,
  semestre,
}: {
  video: ReturnType<typeof getVideoBienvenida>;
  semestre: number;
}) {
  const hayVideo = Boolean(video.url);

  return (
    <div
      className={`hub-hero-featured${hayVideo ? "" : " hub-hero-featured--placeholder"}`}
      style={
        !hayVideo && video.poster
          ? { backgroundImage: `url(${video.poster})` }
          : undefined
      }
    >
      {/* Reproductor real (llena el panel) */}
      {hayVideo &&
        (video.tipo === "embed" ? (
          <iframe
            className="hub-hero-video-frame"
            src={video.url!}
            title={video.titulo}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            className="hub-hero-video-frame"
            src={video.url!}
            poster={video.poster ?? undefined}
            controls
            preload="metadata"
          />
        ))}

      {/* Placeholder: botón play centrado */}
      {!hayVideo && (
        <>
          <span className="hub-hero-video-glow" aria-hidden="true" />
          <span className="hub-hero-video-play">
            <i className="fa-solid fa-play" />
          </span>
        </>
      )}

      {/* Pie del panel, anclado abajo a la izquierda */}
      <div className="hub-hero-featured-meta">
        <div className="hub-hero-featured-text">
          <span className="hub-hero-featured-eyebrow">{video.titulo}</span>
          <span className="hub-hero-featured-title">Bienvenida · Semestre {semestre}</span>
        </div>
        {!hayVideo && (
          <span className="hub-hero-featured-badge">
            <i className="fa-solid fa-clock" /> Próximamente
          </span>
        )}
      </div>
    </div>
  );
}
