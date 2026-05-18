import { redirect, notFound } from "next/navigation";
import { getUser, getProfile } from "@/lib/supabase-helpers";
import { UAC_BASE } from "@/lib/mccems/estructura";
import { getRSCColor } from "@/components/hub/hub-colors";
import { getFichaBiblioteca, marcarFichaLeida } from "@/lib/queries/biblioteca";
import type { SeccionContenido } from "@/lib/queries/biblioteca";
import Link from "next/link";
import type { Metadata } from "next";

interface Props { params: Promise<{ uac: string; id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `Ficha · ${id} — CEN Bachillerato` };
}

function RenderSeccion({ seccion }: { seccion: SeccionContenido }) {
  switch (seccion.tipo) {
    case "subtitulo":
      return (
        <h2 style={{
          fontSize: 20, fontWeight: 800, color: "#0B2545",
          margin: "36px 0 14px", letterSpacing: "-0.025em", lineHeight: 1.25,
        }}>
          {seccion.contenido}
        </h2>
      );

    case "parrafo":
      return (
        <p style={{ fontSize: 16, color: "rgba(11,37,69,0.80)", lineHeight: 1.80, margin: "0 0 20px" }}>
          {seccion.contenido}
        </p>
      );

    case "lista":
      return (
        <ul style={{ paddingLeft: 24, margin: "0 0 20px" }}>
          {(seccion.items ?? []).map((item, i) => (
            <li key={i} style={{ fontSize: 15, color: "rgba(11,37,69,0.75)", lineHeight: 1.7, marginBottom: 8 }}>
              {item}
            </li>
          ))}
        </ul>
      );

    case "cita":
      return (
        <blockquote style={{
          borderLeft: "3px solid #38BDF8",
          paddingLeft: 20, margin: "24px 0",
          fontStyle: "italic",
        }}>
          <p style={{ fontSize: 16, color: "rgba(11,37,69,0.70)", lineHeight: 1.70, margin: "0 0 8px" }}>
            &ldquo;{seccion.contenido}&rdquo;
          </p>
          {seccion.fuente && (
            <cite style={{ fontSize: 12, color: "rgba(11,37,69,0.40)", fontStyle: "normal", fontWeight: 600 }}>
              — {seccion.fuente}
            </cite>
          )}
        </blockquote>
      );

    case "callout": {
      const paleta = {
        importante: { bg: "rgba(239,68,68,0.07)", border: "rgba(239,68,68,0.20)", icon: "fa-circle-exclamation", iconColor: "#EF4444", label: "Importante" },
        sabias:     { bg: "rgba(56,189,248,0.07)", border: "rgba(56,189,248,0.20)", icon: "fa-lightbulb", iconColor: "#38BDF8", label: "¿Sabías que...?" },
        advertencia:{ bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.22)", icon: "fa-triangle-exclamation", iconColor: "#FBBF24", label: "Atención" },
      };
      const v = seccion.variante ?? "importante";
      const p = paleta[v] ?? paleta.importante;
      return (
        <div style={{
          borderRadius: 14, border: `1.5px solid ${p.border}`,
          background: p.bg, padding: "16px 20px", margin: "24px 0",
          display: "flex", gap: 14, alignItems: "flex-start",
        }}>
          <i className={`fa-solid ${p.icon}`} style={{ fontSize: 17, color: p.iconColor, marginTop: 2, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: p.iconColor, textTransform: "uppercase", letterSpacing: "0.10em", marginBottom: 6 }}>
              {p.label}
            </div>
            <p style={{ fontSize: 14, color: "rgba(11,37,69,0.75)", lineHeight: 1.65, margin: 0 }}>
              {seccion.contenido}
            </p>
          </div>
        </div>
      );
    }

    case "imagen":
      return (
        <figure style={{ margin: "28px 0" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={seccion.url ?? "/biblioteca/placeholder-ficha.svg"}
            alt={seccion.alt ?? ""}
            style={{ width: "100%", borderRadius: 14, border: "1px solid rgba(11,37,69,0.08)", display: "block" }}
          />
          {seccion.caption && (
            <figcaption style={{ fontSize: 12, color: "rgba(11,37,69,0.40)", marginTop: 8, textAlign: "center", fontStyle: "italic" }}>
              {seccion.caption}
            </figcaption>
          )}
        </figure>
      );

    default:
      return null;
  }
}

export default async function FichaPage({ params }: Props) {
  const { uac: codigo, id: slug } = await params;

  const user = await getUser();
  if (!user) redirect("/log-in");
  const profile = await getProfile(user.id);
  if (!profile) redirect("/log-in");

  const uacData = UAC_BASE.find((u) => u.codigo === codigo);
  if (!uacData) notFound();

  const ficha = await getFichaBiblioteca(slug, user.id);
  if (!ficha) notFound();

  // Marcar como leída (fire-and-forget)
  marcarFichaLeida(ficha.id, user.id).catch(() => {});

  const color = getRSCColor(uacData.recursoCodigo ?? "");
  const secciones = ficha.contenido?.secciones ?? [];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 40px 80px" }}>

      {/* ── Breadcrumb ─── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28, fontSize: 13, color: "rgba(11,37,69,0.40)", flexWrap: "wrap" }}>
        <Link href="/hub/biblioteca" style={{ color: "inherit", textDecoration: "none", fontWeight: 600 }}>Biblioteca</Link>
        <i className="fa-solid fa-chevron-right" style={{ fontSize: 9 }} />
        <Link href={`/hub/biblioteca/${codigo}`} style={{ color: color.hex, textDecoration: "none", fontWeight: 700 }}>{codigo}</Link>
        <i className="fa-solid fa-chevron-right" style={{ fontSize: 9 }} />
        <span style={{ color: "rgba(11,37,69,0.60)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>
          {ficha.titulo}
        </span>
      </div>

      <div style={{ display: "flex", gap: 40, alignItems: "flex-start" }}>

        {/* ── Main article ─── */}
        <article style={{ flex: 1, minWidth: 0 }}>

          {/* Hero */}
          <div style={{
            borderRadius: 20,
            background: `rgba(${color.rgba}, 0.06)`,
            border: `1.5px solid rgba(${color.rgba}, 0.12)`,
            padding: "32px 36px",
            marginBottom: 36,
          }}>
            {ficha.categoria && (
              <span style={{ fontSize: 10, fontWeight: 800, color: color.hex, textTransform: "uppercase", letterSpacing: "0.14em", display: "block", marginBottom: 10 }}>
                {ficha.categoria}
              </span>
            )}
            <h1 style={{
              fontSize: "clamp(22px, 3vw, 34px)",
              fontWeight: 900, color: "#0B2545",
              margin: "0 0 16px", letterSpacing: "-0.04em", lineHeight: 1.12,
            }}>
              {ficha.titulo}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(11,37,69,0.45)", fontWeight: 500 }}>
                <i className={`fa-solid ${color.faIcon}`} style={{ color: color.hex }} />
                {uacData.nombre}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "rgba(11,37,69,0.45)", fontWeight: 500 }}>
                <i className="fa-solid fa-clock" />
                {ficha.tiempo_lectura_minutos} min de lectura
              </span>
              {ficha.leida && (
                <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#16A34A", fontWeight: 700 }}>
                  <i className="fa-solid fa-check-circle" />
                  Leída
                </span>
              )}
            </div>
          </div>

          {/* Content body */}
          <div style={{ maxWidth: 720 }}>
            {secciones.length === 0 ? (
              <p style={{ fontSize: 15, color: "rgba(11,37,69,0.45)", lineHeight: 1.7 }}>
                El contenido de esta ficha estará disponible próximamente.
              </p>
            ) : (
              secciones.map((sec, i) => <RenderSeccion key={i} seccion={sec} />)
            )}
          </div>

          {/* Conceptos clave */}
          {ficha.conceptos_clave.length > 0 && (
            <div style={{
              marginTop: 40,
              borderRadius: 16,
              background: "#EFF6FF",
              border: "1px solid rgba(30,64,175,0.12)",
              padding: "22px 24px",
            }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: "#1E40AF", textTransform: "uppercase", letterSpacing: "0.14em", margin: "0 0 12px" }}>
                Conceptos clave
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {ficha.conceptos_clave.map((c) => (
                  <span key={c} style={{
                    background: "#fff", border: "1px solid rgba(30,64,175,0.18)",
                    borderRadius: 999, padding: "5px 14px",
                    fontSize: 12, fontWeight: 700, color: "#1E40AF",
                  }}>
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Navigation footer */}
          <div style={{ marginTop: 40, paddingTop: 24, borderTop: "1px solid rgba(11,37,69,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <Link
              href={`/hub/biblioteca/${codigo}`}
              style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 700, color: "#1E40AF", textDecoration: "none" }}
            >
              <i className="fa-solid fa-arrow-left" style={{ fontSize: 11 }} />
              Volver a {uacData.nombre}
            </Link>
            <Link
              href="/hub/biblioteca"
              style={{ fontSize: 13, fontWeight: 600, color: "rgba(11,37,69,0.40)", textDecoration: "none" }}
            >
              Ver toda la Biblioteca
            </Link>
          </div>
        </article>

        {/* ── Sidebar right ─── */}
        <aside style={{ width: 240, flexShrink: 0, position: "sticky", top: 24 }} className="bib-sidebar-desktop">
          {/* UAC card */}
          <div style={{
            borderRadius: 16,
            background: `rgba(${color.rgba}, 0.06)`,
            border: `1.5px solid rgba(${color.rgba}, 0.14)`,
            padding: "18px",
            marginBottom: 16,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: `rgba(${color.rgba}, 0.14)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 15, color: color.hex,
              }}>
                <i className={`fa-solid ${color.faIcon}`} />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#0B2545" }}>{codigo}</div>
                <div style={{ fontSize: 10, color: "rgba(11,37,69,0.45)" }}>Semestre {uacData.semestre}</div>
              </div>
            </div>
            <Link
              href={`/hub/biblioteca/${codigo}`}
              style={{ display: "block", fontSize: 12, fontWeight: 700, color: color.hex, textDecoration: "none" }}
            >
              Ver más fichas de esta materia →
            </Link>
          </div>

          {/* Placeholder for related fichas */}
          {ficha.fichas_relacionadas.length > 0 && (
            <div style={{ borderRadius: 16, background: "#fff", border: "1px solid rgba(11,37,69,0.08)", padding: "16px" }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: "rgba(11,37,69,0.45)", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 12px" }}>
                Relacionadas
              </p>
              {ficha.fichas_relacionadas.map((slug) => (
                <Link
                  key={slug}
                  href={`/hub/biblioteca/${codigo}/ficha/${slug}`}
                  style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1E40AF", textDecoration: "none", padding: "6px 0", borderBottom: "1px solid rgba(11,37,69,0.06)" }}
                >
                  {slug}
                </Link>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
