"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getCurrentProfile,
  getLaboratoriosSemestreBrowser,
  type LaboratorioItem,
} from "@/lib/queries/hub-browser";
import { getUACPorCodigo } from "@/lib/mccems/estructura";
import { getRSCColor } from "@/components/hub/hub-colors";
import { LAB_CATALOGO, nombreLab } from "@/lib/practicas/lab-catalogo";
import { imagenDeLab } from "@/lib/practicas/lab-imagenes";
import HubV2Skeleton from "@/components/hub-v2/HubV2Skeleton";
// ⚠️ TEMPORAL (presentación): pestaña "Destacados". Para revertir, eliminar
// este import, el bloque <DestacadosView/> + tabs, y el archivo labs-destacados.ts.
import { LABS_DESTACADOS } from "@/lib/practicas/labs-destacados";
import "../../HubV5.css";
import "./Laboratorios.css";

const ESTADO_META: Record<
  LaboratorioItem["estado"],
  { label: string; className: string }
> = {
  completada: { label: "Completado", className: "is-done" },
  en_progreso: { label: "En curso", className: "is-active" },
  no_iniciada: { label: "Disponible", className: "is-todo" },
};

interface Grupo {
  uacCodigo: string;
  uacNombre: string;
  rscCodigo: string | null;
  labs: LaboratorioItem[];
}

/* ──────────────────────────────────────────────────────────────
   VideoEmbed — fachada "click-to-play" (lite-youtube).
   Muestra la miniatura de YouTube + botón; al pulsar inserta el
   iframe con autoplay. Evita cargar ~24 iframes a la vez.
   ⚠️ TEMPORAL: parte de la pestaña Destacados.
   ────────────────────────────────────────────────────────────── */
function VideoEmbed({
  videoId,
  title,
  className,
}: {
  videoId: string;
  title: string;
  className?: string;
}) {
  const [play, setPlay] = useState(false);
  const cls = `vid-frame ${className ?? ""}`.trim();

  if (play) {
    return (
      <div className={cls}>
        <iframe
          className="vid-iframe"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      className={`${cls} vid-facade`}
      onClick={() => setPlay(true)}
      aria-label={`Reproducir video: ${title}`}
    >
      <img
        className="vid-thumb"
        src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
        alt=""
        loading="lazy"
        decoding="async"
      />
      <span className="vid-play" aria-hidden="true">
        <i className="fa-solid fa-play" />
      </span>
    </button>
  );
}

/* ──────────────────────────────────────────────────────────────
   DestacadoCard — tarjeta de una práctica destacada: video propio
   del laboratorio (fachada click-to-play) + materia + acceso 3D.
   Proporción uniforme; ningún elemento domina la pantalla.
   ⚠️ TEMPORAL: solo para la presentación.
   ────────────────────────────────────────────────────────────── */
function DestacadoCard({ lab }: { lab: (typeof LABS_DESTACADOS)[number] }) {
  const color = getRSCColor(getUACPorCodigo(lab.uacCodigo)?.recursoCodigo ?? null);
  const nombre = nombreLab(lab.slug);
  return (
    <article
      className="dest-card"
      style={
        {
          "--lab-accent": color.hex,
          "--lab-accent-rgb": color.rgba,
        } as CSSProperties
      }
    >
      <VideoEmbed videoId={lab.videoId} title={nombre} className="dest-card-video" />
      <div className="dest-card-body">
        <span className="dest-card-uac">
          <i className={`fa-solid ${color.faIcon}`} /> {lab.uacCodigo}
        </span>
        <h3 className="dest-card-title">{nombre}</h3>
        <Link
          href={lab.ruta}
          className="dest-card-cta"
          aria-label={`Abrir laboratorio 3D: ${nombre}`}
        >
          <i className="fa-solid fa-cube" /> Abrir laboratorio 3D
          <i className="fa-solid fa-arrow-right dest-card-cta-arrow" />
        </Link>
      </div>
    </article>
  );
}

/* ──────────────────────────────────────────────────────────────
   SemestreDestacado — encabezado del semestre + rejilla uniforme
   de sus prácticas destacadas. Sin video de semestre, sin escenario.
   ⚠️ TEMPORAL: solo para la presentación.
   ────────────────────────────────────────────────────────────── */
function SemestreDestacado({
  semestre,
  labs,
}: {
  semestre: number;
  labs: typeof LABS_DESTACADOS;
}) {
  return (
    <section className="dest-sem">
      <div className="dest-sem-head">
        <span className="dest-sem-num">{semestre}</span>
        <div>
          <h2 className="dest-sem-title">Semestre {semestre}</h2>
          <p className="dest-sem-sub">
            {labs.length}{" "}
            {labs.length === 1 ? "práctica destacada" : "prácticas destacadas"}
          </p>
        </div>
      </div>

      <div className="dest-grid">
        {labs.map((lab) => (
          <DestacadoCard key={lab.n} lab={lab} />
        ))}
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────
   DestacadosView — 18 prácticas destacadas (3 por semestre).
   ⚠️ TEMPORAL: solo para la presentación.
   ────────────────────────────────────────────────────────────── */
function DestacadosView() {
  return (
    <div className="dest-wrap">
      {[1, 2, 3, 4, 5, 6].map((s) => (
        <SemestreDestacado
          key={s}
          semestre={s}
          labs={LABS_DESTACADOS.filter((l) => l.semestre === s)}
        />
      ))}
    </div>
  );
}

export default function LaboratoriosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [labs, setLabs] = useState<LaboratorioItem[]>([]);
  const [semestre, setSemestre] = useState(1);
  // ⚠️ TEMPORAL: por defecto abre "destacados" para la presentación.
  const [tab, setTab] = useState<"destacados" | "semestre">("destacados");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const prof = await getCurrentProfile();
        if (cancelled) return;
        if (!prof) {
          router.replace("/log-in");
          return;
        }
        const data = await getLaboratoriosSemestreBrowser(prof.userId, prof.semestre);
        if (cancelled) return;
        setLabs(data);
        setSemestre(prof.semestre);
      } catch {
        // Si falla la carga, queda lista vacía en vez de skeleton infinito.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  // Agrupa por UAC conservando el orden ya ordenado de la query.
  const grupos: Grupo[] = [];
  for (const lab of labs) {
    let g = grupos.find((x) => x.uacCodigo === lab.uacCodigo);
    if (!g) {
      g = {
        uacCodigo: lab.uacCodigo,
        uacNombre: lab.uacNombre,
        rscCodigo: getUACPorCodigo(lab.uacCodigo)?.recursoCodigo ?? null,
        labs: [],
      };
      grupos.push(g);
    }
    g.labs.push(lab);
  }

  const total = labs.length;
  const hechos = labs.filter((l) => l.estado === "completada").length;
  const enDestacados = tab === "destacados";

  return (
    <div className="labs-page">
      {/* ── Hero ─── */}
      <header className="labs-hero">
        <div className="labs-hero-grid" aria-hidden="true" />
        <div className="labs-hero-glow" aria-hidden="true" />
        <div className="labs-hero-art" aria-hidden="true">
          <span className="labs-hero-ring labs-hero-ring--3" />
          <span className="labs-hero-ring labs-hero-ring--2" />
          <span className="labs-hero-ring labs-hero-ring--1" />
          <span className="labs-hero-cube">
            <i className="fa-solid fa-cube" />
          </span>
          <span className="labs-hero-spark labs-hero-spark--a">
            <i className="fa-solid fa-atom" />
          </span>
          <span className="labs-hero-spark labs-hero-spark--b">
            <i className="fa-solid fa-flask" />
          </span>
        </div>
        <div className="labs-hero-body">
          <div className="labs-hero-eyebrow">
            <span className="labs-hero-eyebrow-dot" />
            {enDestacados
              ? "Laboratorios 3D · Selección destacada"
              : `Laboratorios 3D · Semestre ${semestre}`}
          </div>
          <h1 className="labs-hero-title">
            {enDestacados ? "Laboratorios destacados." : "Todos los laboratorios."}
          </h1>
          <p className="labs-hero-frase">
            {enDestacados
              ? "Una selección de las prácticas más representativas de los seis semestres, cada una con su video. Ábrelas directo, sin importar el semestre."
              : "Cada práctica experimental de tu semestre en un solo lugar. Ábrelas directo, sin buscar entre materias ni actividades."}
          </p>
          <div className="labs-hero-stats">
            {enDestacados ? (
              <>
                <span className="labs-hero-stat">
                  <strong>{LABS_DESTACADOS.length}</strong> prácticas
                </span>
                <span className="labs-hero-stat-sep" />
                <span className="labs-hero-stat">
                  <strong>6</strong> semestres
                </span>
              </>
            ) : (
              <>
                <span className="labs-hero-stat">
                  <strong>{total}</strong>{" "}
                  {total === 1 ? "laboratorio" : "laboratorios"}
                </span>
                <span className="labs-hero-stat-sep" />
                <span className="labs-hero-stat">
                  <strong>{hechos}</strong> completado{hechos === 1 ? "" : "s"}
                </span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Pestañas (⚠️ TEMPORAL: presentación) ─── */}
      <div className="labs-tabs" role="tablist" aria-label="Vistas de laboratorios">
        <button
          type="button"
          role="tab"
          aria-selected={enDestacados}
          className={`labs-tab ${enDestacados ? "is-active" : ""}`}
          onClick={() => setTab("destacados")}
        >
          <i className="fa-solid fa-star" /> Destacados
          <span className="labs-tab-count">{LABS_DESTACADOS.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={!enDestacados}
          className={`labs-tab ${!enDestacados ? "is-active" : ""}`}
          onClick={() => setTab("semestre")}
        >
          <i className="fa-solid fa-flask" /> Mi semestre
        </button>
      </div>

      {/* ── Contenido por pestaña ─── */}
      {enDestacados ? (
        <DestacadosView />
      ) : loading ? (
        <HubV2Skeleton />
      ) : total === 0 ? (
        <div className="labs-empty">
          <i className="fa-solid fa-flask" />
          <p>Aún no hay laboratorios en tu semestre.</p>
        </div>
      ) : (
        <>
          {grupos.map((grupo) => {
            const color = getRSCColor(grupo.rscCodigo);
            return (
              <section key={grupo.uacCodigo} className="labs-section">
                {/* Encabezado de UAC */}
                <div className="labs-section-head">
                  <div
                    className="labs-section-icon"
                    style={{
                      background: `rgba(${color.rgba}, 0.12)`,
                      borderColor: `rgba(${color.rgba}, 0.22)`,
                      color: color.hex,
                    }}
                  >
                    <i className={`fa-solid ${color.faIcon}`} />
                  </div>
                  <div>
                    <h2 className="labs-section-title">{grupo.uacNombre}</h2>
                    <p className="labs-section-sub">
                      {grupo.uacCodigo} · {grupo.labs.length}{" "}
                      {grupo.labs.length === 1 ? "laboratorio" : "laboratorios"}
                    </p>
                  </div>
                </div>

                {/* Grid de labs */}
                <div className="labs-grid">
                  {grupo.labs.map((lab) => {
                    const est = ESTADO_META[lab.estado];
                    const meta = LAB_CATALOGO[lab.slug];
                    const desc = meta?.descripcion ?? "";
                    return (
                      <Link
                        key={lab.id}
                        href={`/hub/uac/${lab.uacCodigo}/progresion/${lab.progresionNumero}/actividad/${lab.orden}/practica`}
                        className={`lab-card ${est.className}`}
                        style={
                          {
                            "--lab-accent": color.hex,
                            "--lab-accent-rgb": color.rgba,
                          } as CSSProperties
                        }
                      >
                        {/* Cabecera visual — foto temática con tratamiento */}
                        <div className="lab-card-media">
                          <img
                            className="lab-card-img"
                            src={imagenDeLab(lab.slug)}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            width={800}
                            height={420}
                          />
                          <span className="lab-card-tint" aria-hidden="true" />
                          <div className="lab-card-media-top">
                            <span className="lab-card-badge">
                              <i className="fa-solid fa-cube" /> Lab 3D
                            </span>
                            <span className={`lab-card-estado ${est.className}`}>
                              <span className="lab-card-estado-dot" />
                              {est.label}
                            </span>
                          </div>
                        </div>

                        {/* Cuerpo */}
                        <div className="lab-card-body">
                          <h3 className="lab-card-titulo">{nombreLab(lab.slug)}</h3>
                          {desc && <p className="lab-card-desc">{desc}</p>}

                          <div className="lab-card-foot">
                            <span className="lab-card-prog">
                              Propósito formativo {lab.progresionNumero}
                            </span>
                            <span className="lab-card-cta">
                              Abrir <i className="fa-solid fa-arrow-right" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}

          <p className="labs-credits">
            <i className="fa-solid fa-image" /> Imágenes temáticas de Wikimedia
            Commons, bajo licencias libres (CC / dominio público).
          </p>
        </>
      )}
    </div>
  );
}
