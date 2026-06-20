import { redirect, notFound } from "next/navigation";
import { getUser, getProfile } from "@/lib/supabase-helpers";
import { UAC_BASE } from "@/lib/mccems/estructura";
import { getRSCColor } from "@/components/hub/hub-colors";
import { getFichasBibliotecaUAC } from "@/lib/queries/biblioteca";
import { BibliotecaFichaGrid } from "@/components/hub/BibliotecaFichaGrid";
import { HubBreadcrumb } from "@/components/hub/HubBreadcrumb";
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
    <div style={{ padding: "36px 40px 80px" }}>

      {/* ── Breadcrumb ─── */}
      <HubBreadcrumb
        separator="chevron"
        accentHex={color.hex}
        style={{ fontSize: 13, marginBottom: 28 }}
        items={[
          { label: "Hub", href: "/hub" },
          { label: "Biblioteca", href: "/hub/biblioteca" },
          { label: codigo },
        ]}
      />

      {/* ── Hero header ─── */}
      <div style={{
        borderRadius: 20,
        background: `linear-gradient(135deg, rgba(${color.rgba}, 0.10) 0%, rgba(${color.rgba}, 0.05) 100%)`,
        border: `1.5px solid rgba(${color.rgba}, 0.20)`,
        padding: "32px 36px",
        marginBottom: 36,
        display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap",
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: `rgba(${color.rgba}, 0.14)`,
          border: `2px solid rgba(${color.rgba}, 0.25)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 32, color: color.hex, flexShrink: 0,
        }}>
          <i className={`fa-solid ${color.faIcon}`} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: color.hex, opacity: 0.75, textTransform: "uppercase", letterSpacing: "0.12em", display: "block", marginBottom: 4 }}>
            {codigo} · Semestre {uacData.semestre}
          </span>
          <h1 style={{ fontSize: "clamp(20px, 2.5vw, 28px)", fontWeight: 900, color: "#fff", margin: "0 0 8px", letterSpacing: "-0.03em" }}>
            {uacData.nombre}
          </h1>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>
              {fichas.length} fichas disponibles
            </span>
            {leidasCount > 0 && (
              <span style={{ fontSize: 12, fontWeight: 700, color: "#34D399" }}>
                · {leidasCount} leídas ({Math.round((leidasCount / fichas.length) * 100)}%)
              </span>
            )}
          </div>
          <Link
            href={`/hub/uac/${codigo}`}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8, marginTop: 16,
              background: `rgba(${color.rgba}, 0.16)`,
              border: `1px solid rgba(${color.rgba}, 0.30)`,
              color: color.hex, textDecoration: "none",
              borderRadius: 999, padding: "9px 18px", fontSize: 13, fontWeight: 700,
            }}
          >
            <i className="fa-solid fa-graduation-cap" style={{ fontSize: 12 }} />
            Ir a la ruta de aprendizaje
            <i className="fa-solid fa-arrow-right" style={{ fontSize: 11 }} />
          </Link>
        </div>
      </div>

      {/* ── Empty state ─── */}
      {fichas.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>📖</div>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)" }}>
            Las fichas de {uacData.nombre} estarán disponibles pronto.
          </p>
          <Link href="/hub/biblioteca" style={{ fontSize: 13, color: "#7DD3FC", fontWeight: 600 }}>
            ← Volver a Biblioteca
          </Link>
        </div>
      )}

      {/* ── Fichas por categoría ─── */}
      {[...categorias.entries()].map(([cat, fichasCat]) => (
        <section key={cat} style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ height: 1, flex: 1, background: "rgba(255,255,255,0.07)" }} />
            <span style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.14em", flexShrink: 0 }}>
              {cat}
            </span>
            <div style={{ height: 1, flex: 1, background: "rgba(255,255,255,0.07)" }} />
          </div>

          {/* Fichas grid — client component with spring hover + stagger */}
          <BibliotecaFichaGrid
            fichas={fichasCat}
            color={color}
            uacCodigo={codigo}
            columns="repeat(auto-fill, minmax(260px, 1fr))"
          />
        </section>
      ))}
    </div>
  );
}
