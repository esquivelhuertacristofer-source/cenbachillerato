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

export default function LaboratoriosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [labs, setLabs] = useState<LaboratorioItem[]>([]);
  const [semestre, setSemestre] = useState(1);

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

  if (loading) return <HubV2Skeleton />;

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

  return (
    <div className="labs-page">
      {/* ── Hero ─── */}
      <header className="labs-hero">
        <div className="labs-hero-word" aria-hidden="true">
          LAB
        </div>
        <div className="labs-hero-body">
          <div className="labs-hero-eyebrow">
            <span className="labs-hero-eyebrow-dot" />
            Laboratorios 3D · Semestre {semestre}
          </div>
          <h1 className="labs-hero-title">Todos los laboratorios.</h1>
          <p className="labs-hero-frase">
            Cada práctica experimental de tu semestre en un solo lugar. Ábrelas
            directo, sin buscar entre materias ni actividades.
          </p>
          <div className="labs-hero-stats">
            <span className="labs-hero-stat">
              <strong>{total}</strong> {total === 1 ? "laboratorio" : "laboratorios"}
            </span>
            <span className="labs-hero-stat-sep" />
            <span className="labs-hero-stat">
              <strong>{hechos}</strong> completado{hechos === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </header>

      {/* ── Sin labs ─── */}
      {total === 0 ? (
        <div className="labs-empty">
          <i className="fa-solid fa-flask" />
          <p>Aún no hay laboratorios en tu semestre.</p>
        </div>
      ) : (
        grupos.map((grupo) => {
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
        })
      )}

      {total > 0 && (
        <p className="labs-credits">
          <i className="fa-solid fa-image" /> Imágenes temáticas de Wikimedia
          Commons, bajo licencias libres (CC / dominio público).
        </p>
      )}
    </div>
  );
}
