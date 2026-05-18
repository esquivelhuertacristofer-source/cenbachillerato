import { redirect, notFound } from "next/navigation";
import { getUser, getProfile } from "@/lib/supabase-helpers";
import { UAC_BASE } from "@/lib/mccems/estructura";
import { getRSCColor } from "@/components/hub/hub-colors";
import { getFichasBibliotecaUAC } from "@/lib/queries/biblioteca";
import Link from "next/link";
import type { Metadata } from "next";

interface Props { params: Promise<{ uac: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { uac } = await params;
  const uacData = UAC_BASE.find((u) => u.codigo === uac);
  return { title: `Biblioteca · ${uacData?.nombre ?? uac} — CEN Bachillerato` };
}

export default async function BibliotecaUACPage({ params }: Props) {
  const { uac: codigo } = await params;

  const user = await getUser();
  if (!user) redirect("/log-in");
  const profile = await getProfile(user.id);
  if (!profile) redirect("/log-in");

  const uacData = UAC_BASE.find((u) => u.codigo === codigo);
  if (!uacData) notFound();

  const color = getRSCColor(uacData.recursoCodigo ?? "");
  const fichas = await getFichasBibliotecaUAC(codigo, user.id);

  // Group by category
  const categorias = new Map<string, typeof fichas>();
  for (const ficha of fichas) {
    const cat = ficha.categoria ?? "General";
    if (!categorias.has(cat)) categorias.set(cat, []);
    categorias.get(cat)!.push(ficha);
  }

  const leidasCount = fichas.filter((f) => f.leida).length;

  return (
    <div style={{ padding: "36px 40px 80px", maxWidth: 1200, margin: "0 auto" }}>

      {/* ── Breadcrumb ─── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28, fontSize: 13, color: "rgba(11,37,69,0.40)" }}>
        <Link href="/hub/biblioteca" style={{ color: "inherit", textDecoration: "none", fontWeight: 600 }}>Biblioteca</Link>
        <i className="fa-solid fa-chevron-right" style={{ fontSize: 9 }} />
        <span style={{ fontWeight: 700, color: color.hex }}>{codigo}</span>
      </div>

      {/* ── Hero header ─── */}
      <div style={{
        borderRadius: 20,
        background: `linear-gradient(135deg, rgba(${color.rgba}, 0.08) 0%, rgba(${color.rgba}, 0.03) 100%)`,
        border: `1.5px solid rgba(${color.rgba}, 0.15)`,
        padding: "32px 36px",
        marginBottom: 36,
        display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap",
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: `rgba(${color.rgba}, 0.12)`,
          border: `2px solid rgba(${color.rgba}, 0.22)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 32, color: color.hex, flexShrink: 0,
        }}>
          <i className={`fa-solid ${color.faIcon}`} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: `rgba(${color.rgba}, 0.70)`, textTransform: "uppercase", letterSpacing: "0.12em", display: "block", marginBottom: 4 }}>
            {codigo} · Semestre {uacData.semestre}
          </span>
          <h1 style={{ fontSize: "clamp(20px, 2.5vw, 28px)", fontWeight: 900, color: "#0B2545", margin: "0 0 8px", letterSpacing: "-0.03em" }}>
            {uacData.nombre}
          </h1>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: "rgba(11,37,69,0.50)", fontWeight: 500 }}>
              {fichas.length} fichas disponibles
            </span>
            {leidasCount > 0 && (
              <span style={{ fontSize: 12, fontWeight: 700, color: "#16A34A" }}>
                · {leidasCount} leídas ({Math.round((leidasCount / fichas.length) * 100)}%)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Empty state ─── */}
      {fichas.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>📖</div>
          <p style={{ fontSize: 15, color: "rgba(11,37,69,0.45)" }}>
            Las fichas de {uacData.nombre} estarán disponibles pronto.
          </p>
          <Link href="/hub/biblioteca" style={{ fontSize: 13, color: "#1E40AF", fontWeight: 600 }}>
            ← Volver a Biblioteca
          </Link>
        </div>
      )}

      {/* ── Fichas por categoría ─── */}
      {[...categorias.entries()].map(([cat, fichasCat]) => (
        <section key={cat} style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ height: 1, flex: 1, background: "rgba(11,37,69,0.07)" }} />
            <span style={{ fontSize: 11, fontWeight: 800, color: "rgba(11,37,69,0.40)", textTransform: "uppercase", letterSpacing: "0.14em", flexShrink: 0 }}>
              {cat}
            </span>
            <div style={{ height: 1, flex: 1, background: "rgba(11,37,69,0.07)" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
            {fichasCat.map((ficha) => (
              <Link
                key={ficha.id}
                href={`/hub/biblioteca/${codigo}/ficha/${ficha.slug}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  className="bib-ficha-card"
                  style={{
                    background: "#fff",
                    borderRadius: 16,
                    border: ficha.leida
                      ? "1.5px solid rgba(34,197,94,0.20)"
                      : "1px solid rgba(11,37,69,0.08)",
                    boxShadow: "0 2px 12px rgba(11,37,69,0.05)",
                    overflow: "hidden",
                  }}
                >
                  {/* Thumb */}
                  <div style={{
                    height: 90, background: `rgba(${color.rgba}, 0.06)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    position: "relative",
                  }}>
                    <i className={`fa-solid ${color.faIcon}`} style={{ fontSize: 32, color: `rgba(${color.rgba}, 0.25)` }} />
                    {ficha.leida && (
                      <div style={{
                        position: "absolute", top: 8, right: 8,
                        background: "rgba(22,163,74,0.85)", borderRadius: 999,
                        padding: "2px 8px", fontSize: 9, fontWeight: 700, color: "#fff",
                        display: "flex", alignItems: "center", gap: 3,
                      }}>
                        <i className="fa-solid fa-check" style={{ fontSize: 7 }} />
                        Leída
                      </div>
                    )}
                  </div>

                  <div style={{ padding: "14px 16px 16px" }}>
                    <h3 style={{
                      fontSize: 14, fontWeight: 800, color: "#0B2545",
                      margin: "0 0 8px", letterSpacing: "-0.02em", lineHeight: 1.3,
                      overflow: "hidden", display: "-webkit-box",
                      WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                    }}>
                      {ficha.titulo}
                    </h3>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 11, color: "rgba(11,37,69,0.35)", fontWeight: 500 }}>
                        <i className="fa-solid fa-clock" style={{ fontSize: 9, marginRight: 4 }} />
                        {ficha.tiempo_lectura_minutos} min
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: color.hex, display: "flex", alignItems: "center", gap: 4 }}>
                        Leer <i className="fa-solid fa-arrow-right" style={{ fontSize: 9 }} />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
