"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getCurrentProfile,
  getRecursosSemestreBrowser,
  type RecursoActividad,
} from "@/lib/queries/hub-browser";
import { getTipoRecursoMeta, ORDEN_TIPOS } from "@/lib/mccems/tipos-recurso";
import { getUACPorCodigo } from "@/lib/mccems/estructura";
import { getRSCColor } from "@/components/hub/hub-colors";
import HubV2Skeleton from "@/components/hub-v2/HubV2Skeleton";
import "../HubV5.css";
import "./Recursos.css";

const ESTADO_META: Record<
  RecursoActividad["estado"],
  { label: string; icon: string; className: string }
> = {
  completada: { label: "Completada", icon: "fa-circle-check", className: "is-done" },
  en_progreso: { label: "En curso", icon: "fa-circle-half-stroke", className: "is-active" },
  no_iniciada: { label: "Pendiente", icon: "fa-circle", className: "is-todo" },
};

/* Hero personalizado por tipo de actividad: cada tipo tiene su propia
   voz (eyebrow, frase y palabra de fondo), todo guiado por su color. */
const HERO_POR_TIPO: Record<
  string,
  { eyebrow: string; titulo: string; frase: string; palabra: string }
> = {
  lectura: {
    eyebrow: "Modo lectura",
    titulo: "Lee, subraya, entiende.",
    frase: "Textos para leer con calma y construir tu base de cada materia.",
    palabra: "LEER",
  },
  reflexion_escrita: {
    eyebrow: "Modo reflexión",
    titulo: "Piensa y ponlo en palabras.",
    frase: "Escribe lo que entendiste con tus propias ideas, sin respuestas correctas.",
    palabra: "PENSAR",
  },
  quiz_multiple_opcion: {
    eyebrow: "Modo quiz",
    titulo: "Comprueba lo que sabes.",
    frase: "Preguntas rápidas para confirmar que de verdad lo dominas.",
    palabra: "PROBAR",
  },
  ejercicio_matematico: {
    eyebrow: "Modo práctica",
    titulo: "Practica hasta que salga.",
    frase: "Resuelve paso a paso y agarra confianza con los números.",
    palabra: "RESOLVER",
  },
  fill_blanks: {
    eyebrow: "Modo completar",
    titulo: "Completa la idea.",
    frase: "Rellena los huecos y fija los conceptos clave de cada tema.",
    palabra: "COMPLETAR",
  },
  debate_estructurado: {
    eyebrow: "Modo debate",
    titulo: "Argumenta tu postura.",
    frase: "Toma posición y defiéndela con razones bien construidas.",
    palabra: "DEBATIR",
  },
  video: {
    eyebrow: "Modo video",
    titulo: "Míralo en movimiento.",
    frase: "Explicaciones en video para ver el tema desde otro ángulo.",
    palabra: "VER",
  },
  imagen: {
    eyebrow: "Modo visual",
    titulo: "Apréndelo viéndolo.",
    frase: "Recursos visuales para entender de un solo vistazo.",
    palabra: "MIRAR",
  },
};

function getHeroTipo(tipo: string) {
  return (
    HERO_POR_TIPO[tipo] ?? {
      eyebrow: "Centro de recursos",
      titulo: "Explora por tipo.",
      frase: "Todas las actividades de tu semestre, agrupadas por tipo.",
      palabra: "CEN",
    }
  );
}

/* ──────────────────────────────────────────────────────────────
   Grupo de actividades de una misma materia (UAC) dentro de un tipo.
   ────────────────────────────────────────────────────────────── */
interface GrupoMateria {
  uacCodigo: string;
  uacNombre: string;
  rscCodigo: string | null;
  items: RecursoActividad[];
}

/* ──────────────────────────────────────────────────────────────
   MateriaRail — "estante" horizontal de una materia: encabezado con
   color de área + progreso, y un riel de tarjetas con scroll lateral
   y flechas. Rompe el muro vertical agrupando por materia.
   ────────────────────────────────────────────────────────────── */
function MateriaRail({ grupo }: { grupo: GrupoMateria }) {
  const color = getRSCColor(grupo.rscCodigo);
  const total = grupo.items.length;
  const hechas = grupo.items.filter((i) => i.estado === "completada").length;
  const pct = total > 0 ? Math.round((hechas / total) * 100) : 0;

  const railRef = useRef<HTMLDivElement | null>(null);
  const [edge, setEdge] = useState({ l: false, r: false });

  const medir = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    const l = el.scrollLeft > 4;
    const r = el.scrollLeft + el.clientWidth < el.scrollWidth - 4;
    setEdge((prev) => (prev.l === l && prev.r === r ? prev : { l, r }));
  }, []);

  // Medición inicial al montar el riel (sin setState en cuerpo de efecto).
  const attach = useCallback(
    (el: HTMLDivElement | null) => {
      railRef.current = el;
      if (el) medir();
    },
    [medir]
  );

  useEffect(() => {
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, [medir]);

  const desplazar = (dir: number) =>
    railRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });

  return (
    <section
      className="recursos-mat"
      style={
        {
          "--mat-color": color.hex,
          "--mat-rgb": color.rgba,
        } as CSSProperties
      }
    >
      <div className="recursos-mat-head">
        <span className="recursos-mat-icon">
          <i className={`fa-solid ${color.faIcon}`} />
        </span>
        <div className="recursos-mat-headtext">
          <h2 className="recursos-mat-title">{grupo.uacNombre}</h2>
          <div className="recursos-mat-meta">
            <span className="recursos-mat-count">
              {grupo.uacCodigo} · {total}{" "}
              {total === 1 ? "actividad" : "actividades"}
            </span>
            <span className="recursos-mat-bar" aria-hidden="true">
              <span
                className="recursos-mat-bar-fill"
                style={{ width: `${pct}%` }}
              />
            </span>
            <span className="recursos-mat-pct">{hechas}/{total}</span>
          </div>
        </div>
        <div className="recursos-mat-nav">
          <button
            type="button"
            className="recursos-mat-arrow"
            onClick={() => desplazar(-1)}
            disabled={!edge.l}
            aria-label="Desplazar a la izquierda"
          >
            <i className="fa-solid fa-chevron-left" />
          </button>
          <button
            type="button"
            className="recursos-mat-arrow"
            onClick={() => desplazar(1)}
            disabled={!edge.r}
            aria-label="Desplazar a la derecha"
          >
            <i className="fa-solid fa-chevron-right" />
          </button>
        </div>
      </div>

      <div
        className={`recursos-rail ${edge.l ? "fade-l" : ""} ${
          edge.r ? "fade-r" : ""
        }`}
      >
        <div className="recursos-rail-track" ref={attach} onScroll={medir}>
          {grupo.items.map((it) => {
            const m = getTipoRecursoMeta(it.tipo);
            const est = ESTADO_META[it.estado];
            return (
              <Link
                key={it.id}
                href={`/hub/uac/${it.uacCodigo}/progresion/${it.progresionNumero}/actividad/${it.orden}`}
                className={`recursos-card ${est.className}`}
                style={{ "--chip-color": m.color } as CSSProperties}
              >
                <div className="recursos-card-head">
                  <span className="recursos-card-tag">{m.singular}</span>
                  <span className={`recursos-card-estado ${est.className}`}>
                    <span className="recursos-card-estado-dot" />
                    <span className="recursos-card-estado-label">
                      {est.label}
                    </span>
                  </span>
                </div>

                <h3 className="recursos-card-titulo">{it.titulo}</h3>

                <div className="recursos-card-foot">
                  <span className="recursos-card-prog">
                    Propósito formativo {it.progresionNumero}
                  </span>
                  <span className="recursos-card-go" aria-hidden="true">
                    <i className="fa-solid fa-arrow-right" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function RecursosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<RecursoActividad[]>([]);
  const [filtro, setFiltro] = useState<string | null>(searchParams.get("tipo"));

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
        const data = await getRecursosSemestreBrowser(prof.userId, prof.semestre);
        if (cancelled) return;
        setItems(data);
      } catch {
        // Una query que falle deja la lista vacía (se muestra el estado vacío),
        // nunca un skeleton infinito.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading) return <HubV2Skeleton />;

  // Tipos presentes (con conteo real) y orden canónico
  const conteo = new Map<string, number>();
  for (const it of items) conteo.set(it.tipo, (conteo.get(it.tipo) ?? 0) + 1);
  const tiposPresentes = [...conteo.keys()].sort(
    (a, b) => ORDEN_TIPOS.indexOf(a) - ORDEN_TIPOS.indexOf(b)
  );

  // Sin opción "Todos": siempre hay un tipo activo (el de la URL o el primero).
  const filtroActivo =
    filtro && tiposPresentes.includes(filtro) ? filtro : tiposPresentes[0] ?? null;

  const lista = items
    .filter((i) => i.tipo === filtroActivo)
    .slice()
    .sort(
      (a, b) =>
        a.uacCodigo.localeCompare(b.uacCodigo) ||
        a.progresionNumero - b.progresionNumero ||
        a.orden - b.orden
    );

  // Agrupa la lista (ya ordenada) por materia, conservando el orden.
  const grupos: GrupoMateria[] = [];
  for (const it of lista) {
    let g = grupos.find((x) => x.uacCodigo === it.uacCodigo);
    if (!g) {
      g = {
        uacCodigo: it.uacCodigo,
        uacNombre: it.uacNombre,
        rscCodigo: getUACPorCodigo(it.uacCodigo)?.recursoCodigo ?? null,
        items: [],
      };
      grupos.push(g);
    }
    g.items.push(it);
  }

  function seleccionar(t: string) {
    setFiltro(t);
    router.replace(`/hub/recursos?tipo=${t}`);
  }

  const metaActivo = filtroActivo ? getTipoRecursoMeta(filtroActivo) : null;
  const heroActivo = filtroActivo ? getHeroTipo(filtroActivo) : null;
  const hechas = lista.filter((i) => i.estado === "completada").length;

  return (
    <div className="hub-v2-page">
      {/* ── Acceso directo a la pantalla de laboratorios 3D ─── */}
      <Link href="/hub/recursos/laboratorios" className="recursos-labs-banner">
        <span className="recursos-labs-banner-icon">
          <i className="fa-solid fa-flask" />
        </span>
        <span className="recursos-labs-banner-body">
          <span className="recursos-labs-banner-titulo">Laboratorios 3D</span>
          <span className="recursos-labs-banner-sub">
            Abre todas las prácticas experimentales de tu semestre en un solo lugar.
          </span>
        </span>
        <span className="recursos-labs-banner-cta">
          Ver todos <i className="fa-solid fa-arrow-right" />
        </span>
      </Link>

      {/* ── Panel único: tabs fusionadas con el hero del tipo activo ─── */}
      {metaActivo && heroActivo && (
        <section
          className="recursos-panel"
          style={{ "--chip-color": metaActivo.color } as React.CSSProperties}
        >
          {/* Tabs superiores (pegadas al hero) */}
          <div className="recursos-tabs" role="tablist">
            {tiposPresentes.map((t) => {
              const m = getTipoRecursoMeta(t);
              const activo = filtroActivo === t;
              return (
                <button
                  key={t}
                  role="tab"
                  aria-selected={activo}
                  className={`recursos-tab ${activo ? "is-active" : ""}`}
                  style={{ "--tab-color": m.color } as React.CSSProperties}
                  onClick={() => seleccionar(t)}
                >
                  <span className="recursos-tab-dot" />
                  <span className="recursos-tab-label">{m.label}</span>
                  <span className="recursos-tab-count">{conteo.get(t)}</span>
                </button>
              );
            })}
          </div>

          {/* Cuerpo del hero */}
          <header className="recursos-hero">
            <div className="recursos-hero-word" aria-hidden="true">
              {heroActivo.palabra}
            </div>

            <div className="recursos-hero-body">
              <div className="recursos-hero-eyebrow">
                <span className="recursos-hero-eyebrow-dot" />
                {heroActivo.eyebrow}
              </div>
              <h1 className="recursos-hero-title">{heroActivo.titulo}</h1>
              <p className="recursos-hero-frase">{heroActivo.frase}</p>

              <div className="recursos-hero-stats">
                <span className="recursos-hero-stat">
                  <strong>{lista.length}</strong>
                  {lista.length === 1 ? " actividad" : " actividades"}
                </span>
                <span className="recursos-hero-stat-sep" />
                <span className="recursos-hero-stat">
                  <strong>{hechas}</strong> completada{hechas === 1 ? "" : "s"}
                </span>
              </div>
            </div>
          </header>
        </section>
      )}

      {/* ── Galería: estantes horizontales por materia ─── */}
      {lista.length === 0 ? (
        <div className="recursos-empty">
          <i className="fa-solid fa-inbox" />
          <p>No hay actividades de este tipo en tu semestre todavía.</p>
        </div>
      ) : (
        <div className="recursos-estantes">
          {grupos.map((g) => (
            <MateriaRail key={g.uacCodigo} grupo={g} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function RecursosPage() {
  return (
    <Suspense fallback={<HubV2Skeleton />}>
      <RecursosContent />
    </Suspense>
  );
}
