"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUACPorCodigo } from "@/lib/mccems/estructura";
import { RECURSOS_SOCIOCOGNITIVOS } from "@/lib/mccems/recursos-sociocognitivos";
import { getVideoBienvenida } from "@/lib/mccems/bienvenida";
import { getCurrentProfile, getLaboratoriosSemestreBrowser, type LaboratorioItem } from "@/lib/queries/hub-browser";
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
  nombre?: string;
}

export default function HubHero({
  semestre,
  pctGlobal,
  dia,
  materiasActivas,
  uacs,
  nombre,
}: HubHeroProps) {
  const router = useRouter();
  const [mostrarPanorama, setMostrarPanorama] = useState(false);
  const [labs, setLabs] = useState<LaboratorioItem[]>([]);

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

  // Cargar laboratorios del semestre actual
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const prof = await getCurrentProfile();
        if (cancelled) return;
        if (prof) {
          const data = await getLaboratoriosSemestreBrowser(prof.userId, semestre);
          if (cancelled) return;
          setLabs(data);
        }
      } catch (err) {
        if (process.env.NODE_ENV === 'development') console.error("Error loading labs for hero:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [semestre]);

  const irAlLaboratorio = (slug: string, uacCodigo: string) => {
    const matchingLab = labs.find((l) => l.slug === slug);
    if (matchingLab) {
      router.push(`/hub/uac/${matchingLab.uacCodigo}/progresion/${matchingLab.progresionNumero}/actividad/${matchingLab.orden}/practica`);
    } else {
      router.push(`/hub/uac/${uacCodigo}`);
    }
  };

  return (
    <header className="hub-hero hub-v2-animate">
      <div className="hub-hero-grid">
        {/* ── Columna de texto: el semestre es el protagonista ─── */}
        <div className="hub-hero-inner">
          {nombre && (
            <p className="hub-hero-greeting">
              Hola, <strong>{nombre}</strong> <span aria-hidden>👋</span>
            </p>
          )}
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

          <div className="hub-hero-actions">
            <button
              onClick={() => setMostrarPanorama(!mostrarPanorama)}
              className="hub-hero-btn"
            >
              <i className={`fa-solid ${mostrarPanorama ? 'fa-xmark' : 'fa-map'}`} style={{ marginRight: 8 }} />
              {mostrarPanorama ? 'Ocultar mapa del semestre' : 'Ver mapa y laboratorios 3D'}
            </button>
          </div>
        </div>

        {/* ── Columna de media (video de bienvenida) ─── */}
        <div className="hub-hero-media">
          <HeroVideo
            video={video}
            semestre={semestre}
            onPlayClick={() => setMostrarPanorama(!mostrarPanorama)}
          />
        </div>
      </div>

      {/* ── Desglose interactivo del Panorama / Mapa del Semestre ─── */}
      {mostrarPanorama && (
        <div className="hub-hero-panorama hub-v2-animate-fade">
          <div className="hub-hero-panorama-grid">
            {/* Columna Objetivos */}
            <div className="hub-hero-pan-col">
              <h3 className="hub-hero-pan-h3">
                <i className="fa-solid fa-bullseye" /> Objetivos de Aprendizaje
              </h3>
              <ul className="hub-hero-pan-list">
                {video.objetivos?.map((obj, i) => (
                  <li key={i} className="hub-hero-pan-item">
                    <span className="hub-hero-pan-bullet">{i + 1}</span>
                    <p className="hub-hero-pan-text">{obj}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Columna Laboratorios */}
            <div className="hub-hero-pan-col">
              <h3 className="hub-hero-pan-h3">
                <i className="fa-solid fa-flask" /> Laboratorios 3D Destacados
              </h3>
              <p className="hub-hero-pan-sub">
                Experimenta y pon en práctica tus conocimientos interactuando con variables reales en los simuladores de este semestre:
              </p>
              <div className="hub-hero-pan-labs">
                {video.laboratorios?.map((lab, i) => {
                  const matchingLab = labs.find((l) => l.slug === lab.slug);
                  const estado = matchingLab ? matchingLab.estado : "no_iniciada";
                  
                  let badgeLabel = "Disponible";
                  let badgeClass = "is-todo";
                  if (estado === "completada") {
                    badgeLabel = "Completado";
                    badgeClass = "is-done";
                  } else if (estado === "en_progreso") {
                    badgeLabel = "En curso";
                    badgeClass = "is-active";
                  }

                  return (
                    <div
                      key={i}
                      onClick={() => irAlLaboratorio(lab.slug, lab.uac)}
                      className="hub-hero-pan-lab-card"
                    >
                      <div className="hub-hero-pan-lab-info">
                        <span className="hub-hero-pan-lab-uac">{lab.uac}</span>
                        <h4 className="hub-hero-pan-lab-title">{lab.titulo}</h4>
                      </div>
                      <div className="hub-hero-pan-lab-meta">
                        <span className={`hub-hero-pan-lab-badge ${badgeClass}`}>
                          <span className="lab-card-estado-dot" />
                          {badgeLabel}
                        </span>
                        <span className="hub-hero-pan-lab-btn">
                          Iniciar <i className="fa-solid fa-arrow-right" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

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

/** Extrae el ID de un URL de YouTube (formato embed o watch). */
function youTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([\w-]{11})/);
  return m?.[1] ?? null;
}

/* ── Panel de video: reproductor real si hay URL, placeholder honesto si no ── */
function HeroVideo({
  video,
  semestre,
  onPlayClick,
}: {
  video: ReturnType<typeof getVideoBienvenida>;
  semestre: number;
  onPlayClick: () => void;
}) {
  const hayVideo = Boolean(video.url);
  const ytId = video.url && video.tipo === "embed" ? youTubeId(video.url) : null;
  // Fachada: mostramos una miniatura limpia + botón play propio y solo montamos
  // el iframe de YouTube (con su chrome) al hacer clic. Evita el "ruido" del
  // reproductor incrustado (cabecera del canal, compartir, "Mirar en YouTube").
  const [reproduciendo, setReproduciendo] = useState(false);
  // Si maxresdefault no existe, caemos a hqdefault (siempre disponible).
  const [thumbAlt, setThumbAlt] = useState(false);
  const thumb = ytId
    ? `https://i.ytimg.com/vi/${ytId}/${thumbAlt ? "hqdefault" : "maxresdefault"}.jpg`
    : null;

  return (
    <div className="hub-hero-media-stack">
    <div
      className={`hub-hero-featured${hayVideo ? "" : " hub-hero-featured--placeholder"}`}
      onClick={!hayVideo ? onPlayClick : undefined}
      style={!hayVideo ? { cursor: "pointer" } : undefined}
    >
      {/* Video con URL real */}
      {hayVideo && video.tipo === "embed" && ytId ? (
        reproduciendo ? (
          <iframe
            className="hub-hero-video-frame"
            src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
            title={video.titulo}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          // Fachada limpia: miniatura + botón play gigante (sin chrome de YouTube)
          <button
            type="button"
            className="hub-hero-video-facade"
            onClick={() => setReproduciendo(true)}
            aria-label={`Reproducir: ${video.titulo}`}
          >
            {thumb && (
              <img
                className="hub-hero-video-frame"
                src={thumb}
                alt=""
                aria-hidden="true"
                onError={() => setThumbAlt(true)}
              />
            )}
            <span className="hub-hero-video-glow" aria-hidden="true" />
            <span className="hub-hero-video-play hub-hero-video-play--xl">
              <i className="fa-solid fa-play" />
            </span>
            <span className="hub-hero-featured-meta">
              <span className="hub-hero-featured-text">
                <span className="hub-hero-featured-eyebrow">Video de bienvenida</span>
                <span className="hub-hero-featured-title">{video.titulo}</span>
              </span>
              <span className="hub-hero-featured-badge">
                <i className="fa-brands fa-youtube" /> Ver
              </span>
            </span>
          </button>
        )
      ) : hayVideo && video.tipo === "file" ? (
        <video
          className="hub-hero-video-frame"
          src={video.url!}
          poster={video.poster ?? undefined}
          controls
          preload="metadata"
        />
      ) : null}

      {/* Placeholder: botón play centrado */}
      {!hayVideo && (
        <>
          <span className="hub-hero-video-glow" aria-hidden="true" />
          <span className="hub-hero-video-play">
            <i className="fa-solid fa-play" />
          </span>
        </>
      )}

      {/* Pie del panel: SOLO en el placeholder. Para video real, el pie vive
          dentro de la fachada (arriba) o como caption debajo del reproductor. */}
      {!hayVideo && (
        <div className="hub-hero-featured-meta">
          <div className="hub-hero-featured-text">
            <span className="hub-hero-featured-eyebrow">{video.titulo}</span>
            <span className="hub-hero-featured-title">Bienvenida · Semestre {semestre}</span>
          </div>
          <span className="hub-hero-featured-badge">
            <i className="fa-solid fa-clock" /> Próximamente
          </span>
        </div>
      )}
    </div>

      {/* Caption debajo del reproductor, solo mientras se está reproduciendo
          (la fachada ya muestra su propio título encima de la miniatura). */}
      {hayVideo && reproduciendo && (
        <div className="hub-hero-media-caption">
          <span className="hub-hero-featured-eyebrow">Video de bienvenida</span>
          <span className="hub-hero-featured-title">{video.titulo}</span>
        </div>
      )}
    </div>
  );
}
