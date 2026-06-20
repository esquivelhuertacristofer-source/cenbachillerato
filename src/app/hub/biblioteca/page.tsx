import { redirect } from "next/navigation";
import { getUser, getProfile } from "@/lib/supabase-helpers";
import { UAC_BASE } from "@/lib/mccems/estructura";
import { getRSCColor } from "@/components/hub/hub-colors";
import { getFichasBibliotecaTodasUAC } from "@/lib/queries/biblioteca";
import { BibliotecaFichaGrid } from "@/components/hub/BibliotecaFichaGrid";
import { InfografiasCarousel } from "@/components/hub/InfografiasCarousel";
import { getInfografiasSemestre } from "@/lib/mccems/infografias";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Biblioteca — CEN Bachillerato" };

export default async function BibliotecaPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const user = await getUser();
  if (!user) redirect("/log-in");

  const profile = await getProfile(user.id);
  if (!profile) redirect("/log-in");

  const { q } = await searchParams;
  const semestre = profile.semestre ?? 1;
  const infografias = getInfografiasSemestre(semestre);
  const uacDelSemestre = UAC_BASE.filter((u) => u.semestre === semestre);
  const codigos = uacDelSemestre.map((u) => u.codigo);

  const fichasPorUAC = await getFichasBibliotecaTodasUAC(codigos, user.id);
  const totalFichas = fichasPorUAC.reduce((s, g) => s + g.fichas.length, 0);
  const totalLeidas = fichasPorUAC.reduce(
    (s, g) => s + g.fichas.filter((f) => f.leida).length,
    0
  );

  // Filter by search query (client-side over already-fetched data)
  const query = q?.toLowerCase().trim() ?? "";
  const filtradas = query
    ? fichasPorUAC.map((g) => ({
        ...g,
        fichas: g.fichas.filter(
          (f) => f.titulo.toLowerCase().includes(query) || (f.categoria ?? "").toLowerCase().includes(query)
        ),
      })).filter((g) => g.fichas.length > 0)
    : fichasPorUAC;

  return (
    <div style={{ padding: "36px 40px 80px" }}>

      {/* ── Header ─── */}
      <div style={{ marginBottom: 36 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#7DD3FC", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 6px" }}>
          Recursos de estudio
        </p>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
          <h1 style={{ fontSize: "clamp(26px, 3vw, 38px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", margin: 0 }}>
            Biblioteca
          </h1>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <span style={{ background: "rgba(125,211,252,0.1)", border: "1px solid rgba(125,211,252,0.2)", borderRadius: 999, padding: "5px 14px", fontSize: 12, fontWeight: 700, color: "#7DD3FC" }}>
              {totalFichas} fichas disponibles
            </span>
            {totalLeidas > 0 && (
              <span style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 999, padding: "5px 14px", fontSize: 12, fontWeight: 700, color: "#34D399" }}>
                {totalLeidas} leídas
              </span>
            )}
          </div>
        </div>

        {/* Buscador */}
        <form method="GET" style={{ maxWidth: 560 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 14, padding: "12px 18px",
          }}>
            <i className="fa-solid fa-magnifying-glass" style={{ fontSize: 14, color: "rgba(255,255,255,0.35)" }} />
            <input
              name="q"
              defaultValue={q}
              placeholder="Buscar concepto, tema o ficha..."
              style={{
                flex: 1, border: "none", outline: "none",
                fontSize: 14, color: "#fff", background: "transparent",
                fontFamily: "inherit",
              }}
            />
            {q && (
              <Link href="/hub/biblioteca" style={{ fontSize: 12, color: "#7DD3FC", fontWeight: 600, textDecoration: "none", flexShrink: 0 }}>
                Limpiar
              </Link>
            )}
          </div>
        </form>
      </div>

      {/* ── Carrusel de infografías (solo fuera de búsqueda) ─── */}
      {!query && infografias.length > 0 && (
        <InfografiasCarousel infografias={infografias} />
      )}

      {/* ── Empty state si no hay fichas en DB ─── */}
      {totalFichas === 0 && (
        <div style={{
          borderRadius: 20,
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
          padding: "56px 40px", textAlign: "center",
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: "#fff", margin: "0 0 10px", letterSpacing: "-0.03em" }}>
            Biblioteca en construcción
          </h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.40)", maxWidth: 380, margin: "0 auto", lineHeight: 1.65 }}>
            Las fichas pedagógicas del Semestre {semestre} estarán disponibles pronto.
            Ejecutá el script de migración 05_biblioteca.sql en Supabase y luego los seeds por UAC.
          </p>
        </div>
      )}

      {/* ── Sin resultados de búsqueda ─── */}
      {totalFichas > 0 && filtradas.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)" }}>
            No se encontraron fichas para <strong style={{ color: "#fff" }}>&ldquo;{q}&rdquo;</strong>.
          </p>
          <Link href="/hub/biblioteca" style={{ fontSize: 13, color: "#7DD3FC", fontWeight: 600 }}>
            Ver todas las fichas
          </Link>
        </div>
      )}

      {/* ── Secciones por UAC ─── */}
      {filtradas.map((grupo) => {
        const color = getRSCColor(grupo.uacRscCodigo);
        if (grupo.fichas.length === 0) return null;

        return (
          <section key={grupo.uacCodigo} style={{ marginBottom: 48 }}>
            {/* UAC header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 11,
                  background: `rgba(${color.rgba}, 0.12)`,
                  border: `1.5px solid rgba(${color.rgba}, 0.22)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, color: color.hex,
                }}>
                  <i className={`fa-solid ${color.faIcon}`} />
                </div>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 900, color: "#fff", margin: 0, letterSpacing: "-0.03em" }}>
                    {grupo.uacNombre}
                  </h2>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", margin: 0, fontWeight: 600 }}>
                    {grupo.uacCodigo} · {grupo.fichas.length} fichas
                  </p>
                </div>
              </div>
              <Link
                href={`/hub/biblioteca/${grupo.uacCodigo}`}
                style={{ fontSize: 12, fontWeight: 700, color: color.hex, textDecoration: "none", display: "flex", alignItems: "center", gap: 5 }}
              >
                Ver todas <i className="fa-solid fa-arrow-right" style={{ fontSize: 10 }} />
              </Link>
            </div>

            {/* Fichas grid — client component with spring hover + stagger */}
            <BibliotecaFichaGrid
              fichas={grupo.fichas.slice(0, 6)}
              color={color}
              uacCodigo={grupo.uacCodigo}
            />

            {grupo.fichas.length > 6 && (
              <div style={{ marginTop: 14, textAlign: "center" }}>
                <Link
                  href={`/hub/biblioteca/${grupo.uacCodigo}`}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 7,
                    background: `rgba(${color.rgba}, 0.10)`,
                    border: `1px solid rgba(${color.rgba}, 0.20)`,
                    borderRadius: 999, padding: "8px 20px",
                    fontSize: 12, fontWeight: 700, color: color.hex,
                    textDecoration: "none",
                  }}
                >
                  Ver {grupo.fichas.length - 6} fichas más de {grupo.uacNombre}
                  <i className="fa-solid fa-arrow-right" style={{ fontSize: 10 }} />
                </Link>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
