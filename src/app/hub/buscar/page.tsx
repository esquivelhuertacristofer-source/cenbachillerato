import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase-helpers";
import { buscarActividades } from "@/lib/queries/buscar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buscar actividades — CEN Bachillerato",
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function BuscarPage({ searchParams }: Props) {
  const user = await getUser();
  if (!user) redirect("/log-in");

  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const resultados = q.trim().length >= 2 ? await buscarActividades(q) : [];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#011126",
      color: "#fff",
      fontFamily: "var(--font-epilogue), 'Plus Jakarta Sans', sans-serif",
      padding: "48px 48px 100px",
    }}>
      <style>{`
        .bsc-input:focus { outline: none; border-color: rgba(56,189,248,0.55) !important; background: rgba(56,189,248,0.06) !important; }
        .bsc-card { text-decoration: none; display: block; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03); padding: 18px 22px; transition: all 0.18s ease; }
        .bsc-card:hover { background: rgba(255,255,255,0.07) !important; border-color: rgba(255,255,255,0.16) !important; transform: translateY(-2px); }
        @media (max-width: 640px) { .bsc-page { padding: 28px 20px 80px !important; } .bsc-results { grid-template-columns: 1fr !important; } }
      `}</style>

      <div className="bsc-page" style={{ maxWidth: 860, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <Link href="/hub" style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            fontSize: 11, fontWeight: 800, textTransform: "uppercase",
            letterSpacing: "0.14em", color: "rgba(255,255,255,0.40)",
            textDecoration: "none", marginBottom: 20,
            transition: "color 0.2s",
          }}>
            <i className="fa-solid fa-arrow-left" style={{ fontSize: 10 }} /> Hub
          </Link>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, letterSpacing: "-0.04em", margin: "0 0 8px" }}>
            <i className="fa-solid fa-magnifying-glass" style={{ marginRight: 14, opacity: 0.7, fontSize: "0.75em" }} />
            Buscar actividades
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", margin: 0 }}>
            Busca por título en las 1 600+ actividades de la plataforma.
          </p>
        </div>

        {/* Search form */}
        <form method="GET" action="/hub/buscar" style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", gap: 12 }}>
            <input
              type="search"
              name="q"
              defaultValue={q}
              autoFocus
              placeholder="Escribe al menos 2 caracteres…"
              className="bsc-input"
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 14,
                color: "#fff",
                fontSize: 16,
                fontWeight: 600,
                padding: "14px 18px",
                fontFamily: "inherit",
                transition: "all 0.2s",
              }}
            />
            <button
              type="submit"
              style={{
                borderRadius: 14,
                border: "none",
                background: "#38BDF8",
                color: "#011126",
                fontWeight: 800,
                fontSize: 14,
                padding: "14px 24px",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <i className="fa-solid fa-magnifying-glass" />
            </button>
          </div>
        </form>

        {/* Results */}
        {q.trim().length >= 2 && (
          <>
            <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 16 }}>
              {resultados.length === 0
                ? "Sin resultados"
                : `${resultados.length} resultado${resultados.length !== 1 ? "s" : ""} para «${q}»`}
            </div>

            {resultados.length === 0 ? (
              <div style={{
                borderRadius: 18, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)",
                padding: "48px 32px", textAlign: "center",
              }}>
                <i className="fa-solid fa-face-meh" style={{ fontSize: 36, color: "rgba(255,255,255,0.20)", marginBottom: 14, display: "block" }} />
                <p style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>No encontramos nada con ese término</p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: 0 }}>Intenta con otras palabras o busca por tema o concepto.</p>
              </div>
            ) : (
              <div className="bsc-results" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {resultados.map((r) => (
                  <Link key={r.actividadId} href={r.href} className="bsc-card">
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <span style={{
                        width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, background: `rgba(${r.accentRgba}, 0.14)`,
                        border: `1px solid rgba(${r.accentRgba}, 0.22)`, color: r.accentHex,
                      }}>
                        <i className={`fa-solid ${r.tipoIcono}`} />
                      </span>
                      <span style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.14em", color: r.accentHex }}>
                        {r.tipoLabel}
                      </span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", lineHeight: 1.35, marginBottom: 8 }}>
                      {r.actividadTitulo}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.40)", lineHeight: 1.4 }}>
                      {r.uacNombre} · P{r.progresionNumero} · A{r.orden}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {!q.trim() && (
          <div style={{
            borderRadius: 18, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)",
            padding: "48px 32px", textAlign: "center",
          }}>
            <i className="fa-solid fa-magnifying-glass" style={{ fontSize: 36, color: "rgba(255,255,255,0.18)", marginBottom: 14, display: "block" }} />
            <p style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.60)", margin: 0 }}>
              Escribe algo para buscar
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
