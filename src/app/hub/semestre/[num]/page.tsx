import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getUser, getProfile } from "@/lib/supabase-helpers";
import { UAC_BASE, COMPONENTES_CURRICULARES, getUACPorCodigo } from "@/lib/mccems/estructura";
import UACGrid from "@/components/hub-v2/UACGrid";
import type { Metadata } from "next";
import "../../HubV5.css";

type Props = {
  params: Promise<{ num: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { num } = await params;
  return { title: `Semestre ${num} — CEN Bachillerato` };
}

export default async function SemestrePage({ params }: Props) {
  const { num } = await params;
  const semestre = parseInt(num, 10);

  if (isNaN(semestre) || semestre < 1 || semestre > 6) notFound();

  const user = await getUser();
  if (!user) redirect("/log-in");

  const profile = await getProfile(user.id);
  if (!profile) redirect("/log-in");

  const miSemestre = profile.semestre ?? 1;
  const esExploracion = miSemestre !== semestre;

  // Si es su propio semestre, el hub principal (/hub) sí guarda progreso.
  if (!esExploracion) redirect("/hub");

  const uacSemestre = UAC_BASE.filter((uac) => uac.semestre === semestre);

  // Agrupar materias por componente curricular (igual que el hub principal).
  const gruposComponente = COMPONENTES_CURRICULARES
    .map((comp) => ({
      comp,
      items: uacSemestre
        .filter((u) => getUACPorCodigo(u.codigo)?.componenteCodigo === comp.codigo)
        .map((u) => ({
          codigo: u.codigo,
          nombre: u.nombre,
          done: 0,
          total: u.totalProgresionesEsperadas,
          pct: 0,
        })),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="hub-v2-page">
      {/* ── Aviso de exploración (tema oscuro) ─── */}
      <div
        className="hub-v2-animate"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 13,
          flexWrap: "wrap",
          background: "linear-gradient(135deg, rgba(251,146,60,0.14) 0%, rgba(251,146,60,0.04) 100%)",
          border: "1px solid rgba(251,146,60,0.28)",
          borderRadius: 16,
          padding: "13px 18px",
          marginBottom: 24,
        }}
      >
        <span
          style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, color: "#FB923C",
            background: "rgba(251,146,60,0.16)",
            border: "1px solid rgba(251,146,60,0.28)",
          }}
        >
          <i className="fa-solid fa-compass" />
        </span>
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.78)", fontWeight: 600, flex: 1, minWidth: 220, lineHeight: 1.45 }}>
          Estás explorando el {semestre}.º semestre. Tu semestre es el {miSemestre}.º — aquí no se guarda tu progreso.
        </span>
        <Link
          href="/hub"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(56,189,248,0.14)",
            border: "1px solid rgba(56,189,248,0.30)",
            color: "#7DD3FC", textDecoration: "none",
            borderRadius: 999, padding: "8px 16px", fontSize: 12.5, fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          <i className="fa-solid fa-arrow-left" style={{ fontSize: 10 }} />
          Volver a mi hub
        </Link>
      </div>

      {/* ── Encabezado ─── */}
      <div className="hub-v2-animate" style={{ marginBottom: 40 }}>
        <nav style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: "rgba(255,255,255,0.40)", marginBottom: 12 }}>
          <Link href="/hub" style={{ color: "rgba(255,255,255,0.40)", textDecoration: "none" }}>Mi Hub</Link>
          <i className="fa-solid fa-chevron-right" style={{ fontSize: 8 }} />
          <span style={{ color: "rgba(255,255,255,0.80)", fontWeight: 600 }}>Semestre {semestre}</span>
        </nav>
        <h1 style={{ fontSize: 30, fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", margin: "0 0 6px" }}>
          Semestre {semestre}
        </h1>
        <p style={{ fontSize: 14.5, color: "rgba(255,255,255,0.50)", margin: 0 }}>
          Explora las Unidades de Aprendizaje Curricular de este semestre.
        </p>
      </div>

      {/* ── Materias por componente curricular ─── */}
      {gruposComponente.map(({ comp, items }) => (
        <section key={comp.codigo} className="hub-v2-componente">
          <div className="hub-v2-rotulo">
            <span className="hub-v2-rotulo-tag">{comp.codigo}</span>
            <div className="hub-v2-rotulo-text">
              <h2 className="hub-v2-rotulo-title">{comp.nombre}</h2>
              <p className="hub-v2-rotulo-desc">{comp.descripcion}</p>
            </div>
            <span className="hub-v2-rotulo-badge">
              {items.length} {items.length === 1 ? "materia" : "materias"}
            </span>
          </div>

          <UACGrid items={items} />
        </section>
      ))}
    </div>
  );
}
