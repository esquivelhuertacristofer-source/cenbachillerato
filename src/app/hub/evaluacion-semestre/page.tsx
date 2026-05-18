import { redirect } from "next/navigation";
import { getUser, getProfile } from "@/lib/supabase-helpers";
import { getProgresoSemestre } from "@/lib/queries/hub";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Evaluación del Semestre — CEN Bachillerato" };

export default async function EvaluacionSemestrePage() {
  const user = await getUser();
  if (!user) redirect("/log-in");

  const profile = await getProfile(user.id);
  if (!profile) redirect("/log-in");

  const semestre = profile.semestre ?? 1;
  const progreso = await getProgresoSemestre(user.id, semestre);
  const elegible = progreso.porcentaje >= 80;

  if (!elegible) redirect("/hub");

  return (
    <div style={{
      minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: "40px",
    }}>
      <div style={{
        maxWidth: 560, width: "100%", textAlign: "center",
        borderRadius: 28,
        background: "linear-gradient(145deg, #0B2545 0%, #0E2D60 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        padding: "56px 48px",
        boxShadow: "0 40px 80px rgba(6,14,32,0.30)",
      }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>📝</div>
        <h1 style={{
          fontSize: 32, fontWeight: 900, color: "#fff",
          letterSpacing: "-0.04em", margin: "0 0 14px", lineHeight: 1.1,
        }}>
          Evaluación del Semestre {semestre}
        </h1>
        <p style={{
          fontSize: 15, color: "rgba(255,255,255,0.50)",
          lineHeight: 1.70, margin: "0 0 32px",
        }}>
          ¡Felicitaciones! Desbloqueaste la evaluación integradora del semestre.
          El contenido específico de la evaluación estará disponible próximamente.
        </p>

        <div style={{
          background: "rgba(125,211,252,0.10)",
          border: "1px solid rgba(125,211,252,0.20)",
          borderRadius: 16, padding: "18px 20px", marginBottom: 32,
          display: "flex", alignItems: "center", gap: 12, textAlign: "left",
        }}>
          <i className="fa-solid fa-circle-info" style={{ fontSize: 20, color: "#7DD3FC", flexShrink: 0 }} />
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.60)", margin: 0, lineHeight: 1.60 }}>
            La evaluación integradora cubre las 7 materias del semestre y será
            habilitada por tu docente cuando esté disponible.
          </p>
        </div>

        <Link
          href="/hub"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            borderRadius: 999,
            background: "#7DD3FC", color: "#0B2545",
            padding: "13px 28px",
            fontSize: 14, fontWeight: 800,
            textDecoration: "none",
            boxShadow: "0 10px 28px rgba(125,211,252,0.35)",
          }}
        >
          <i className="fa-solid fa-arrow-left" style={{ fontSize: 12 }} />
          Volver al Hub
        </Link>
      </div>
    </div>
  );
}
