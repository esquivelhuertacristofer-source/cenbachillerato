import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getUser, getProfile } from "@/lib/supabase-helpers";
import { getUACPorCodigo } from "@/lib/mccems/estructura";
import { getActividadConContenido } from "@/lib/queries/hub";
import { getRSCColor, getTipoConfig } from "@/components/hub/hub-colors";
import { ActivityRunner } from "@/components/hub/ActivityRunner";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ codigo: string; id: string; orden: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { codigo, id, orden } = await params;
  const uac = getUACPorCodigo(codigo);
  return {
    title: uac
      ? `Actividad ${orden} · P${id} · ${uac.nombre} — CEN Bachillerato`
      : "Actividad — CEN Bachillerato",
  };
}

export default async function ActividadPage({ params }: Props) {
  const { codigo, id, orden } = await params;
  const progNum = parseInt(id, 10);
  const ordenNum = parseInt(orden, 10);

  const user = await getUser();
  if (!user) redirect("/log-in");

  const profile = await getProfile(user.id);
  if (!profile) redirect("/log-in");

  const uac = getUACPorCodigo(codigo);
  if (!uac) notFound();

  if (isNaN(progNum) || isNaN(ordenNum)) notFound();

  const actividad = await getActividadConContenido(codigo, progNum, ordenNum, user.id);
  if (!actividad) notFound();

  const color = getRSCColor(uac.recursoCodigo ?? null);
  const tc = getTipoConfig(actividad.tipo);

  const LABELS = ["Activación", "Práctica", "Aplicación"];
  const phaseLabel = LABELS[ordenNum - 1] ?? `Actividad ${ordenNum}`;

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 32px 60px" }}>
      <div style={{ maxWidth: 840 }}>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "rgba(11,37,69,0.45)", marginBottom: 24, flexWrap: "wrap" }}>
          <Link href="/hub" style={{ color: "rgba(11,37,69,0.45)", textDecoration: "none" }}>Mi Hub</Link>
          <i className="fa-solid fa-chevron-right" style={{ fontSize: 9 }} />
          <Link href={`/hub/uac/${codigo}`} style={{ color: "rgba(11,37,69,0.45)", textDecoration: "none" }}>{uac.nombre}</Link>
          <i className="fa-solid fa-chevron-right" style={{ fontSize: 9 }} />
          <Link href={`/hub/uac/${codigo}/progresion/${progNum}`} style={{ color: "rgba(11,37,69,0.45)", textDecoration: "none" }}>
            Progresión {progNum}
          </Link>
          <i className="fa-solid fa-chevron-right" style={{ fontSize: 9 }} />
          <span style={{ color: "#0B2545", fontWeight: 600 }}>A{ordenNum} · {phaseLabel}</span>
        </nav>

        {/* Activity header */}
        <div style={{
          borderRadius: 20,
          border: "1px solid rgba(11,37,69,0.10)",
          background: "#fff",
          padding: "20px 24px",
          marginBottom: 24,
          boxShadow: "0 2px 12px rgba(11,37,69,0.06)",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22,
            background: `rgba(${color.rgba}, 0.12)`,
            color: color.hex,
          }}>
            <i className={`fa-solid ${tc.faIcon}`} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 5 }}>
              <span style={{
                borderRadius: 999, background: `rgba(${color.rgba}, 0.12)`,
                border: `1px solid rgba(${color.rgba}, 0.25)`,
                padding: "2px 10px", fontSize: 10, fontWeight: 700, color: color.hex, letterSpacing: "0.06em",
              }}>
                A{ordenNum} · {phaseLabel}
              </span>
              <span style={{
                borderRadius: 999, background: "rgba(11,37,69,0.06)",
                padding: "2px 10px", fontSize: 10, fontWeight: 600, color: "rgba(11,37,69,0.50)",
              }}>
                {tc.label}
              </span>
              <span style={{
                borderRadius: 999, background: "rgba(11,37,69,0.06)",
                padding: "2px 10px", fontSize: 10, fontWeight: 600, color: "rgba(11,37,69,0.50)",
              }}>
                +{actividad.xp} XP
              </span>
              {actividad.estado === "completada" && (
                <span style={{
                  borderRadius: 999, background: "#DCFCE7", border: "1px solid rgba(34,197,94,0.25)",
                  padding: "2px 10px", fontSize: 10, fontWeight: 700, color: "#16A34A",
                }}>
                  <i className="fa-solid fa-check" style={{ marginRight: 4 }} />
                  Completada
                </span>
              )}
            </div>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: "#0B2545", margin: 0, letterSpacing: "-0.02em", lineHeight: 1.3 }}>
              {actividad.titulo}
            </h1>
          </div>
        </div>

        {/* Activity content */}
        <ActivityRunner
          actividadId={actividad.id}
          tipo={actividad.tipo}
          titulo={actividad.titulo}
          descripcion={actividad.descripcion}
          xp={actividad.xp}
          contenido={actividad.contenido}
          estado={actividad.estado}
          intentoId={actividad.intentoId}
          color={color}
          backHref={`/hub/uac/${codigo}/progresion/${progNum}`}
        />
      </div>
    </div>
  );
}
