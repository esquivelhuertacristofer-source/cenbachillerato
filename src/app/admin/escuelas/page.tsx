import { getSupabaseServer } from "@/lib/supabase-helpers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gestión de Escuelas — Admin | CEN Bachillerato",
};

export default async function EscuelasPage() {
  const sb = await getSupabaseServer();
  const { data: escuelas } = await sb
    .from("escuelas")
    .select("id, nombre, cct, subsistema, estado, municipio, created_at")
    .order("nombre");

  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px 64px' }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#1E40AF', marginBottom: 8 }}>
            Admin · Escuelas
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0B2545', letterSpacing: '-0.03em', margin: 0 }}>
            Escuelas
            <span style={{
              display: 'inline-flex',
              marginLeft: 12,
              borderRadius: 999,
              background: 'rgba(11,37,69,0.08)',
              padding: '2px 12px',
              fontSize: 15,
              fontWeight: 600,
              color: 'rgba(11,37,69,0.50)',
              verticalAlign: 'middle',
            }}>
              {escuelas?.length ?? 0}
            </span>
          </h1>
        </div>
        <button style={{
          borderRadius: 999,
          background: '#0B2545',
          padding: '10px 22px',
          fontSize: 13,
          fontWeight: 700,
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
        }}>
          <i className="fa-solid fa-plus" style={{ marginRight: 8 }} />
          Agregar escuela
        </button>
      </div>

      {!escuelas || escuelas.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          borderRadius: 24, border: '2px dashed rgba(11,37,69,0.14)',
          background: '#fff', padding: '80px 32px', textAlign: 'center',
        }}>
          <i className="fa-solid fa-school" style={{ fontSize: 44, color: 'rgba(11,37,69,0.14)', marginBottom: 20 }} />
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0B2545', margin: '0 0 8px' }}>Sin escuelas registradas</h3>
          <p style={{ fontSize: 14, color: 'rgba(11,37,69,0.55)', margin: 0 }}>
            Agrega la primera institución para comenzar a configurar la plataforma.
          </p>
        </div>
      ) : (
        <div style={{ overflow: 'hidden', borderRadius: 20, border: '1px solid rgba(11,37,69,0.10)', background: '#fff' }}>
          <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid rgba(11,37,69,0.08)' }}>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontWeight: 700, fontSize: 11, color: 'rgba(11,37,69,0.50)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Nombre</th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontWeight: 700, fontSize: 11, color: 'rgba(11,37,69,0.50)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>CCT</th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontWeight: 700, fontSize: 11, color: 'rgba(11,37,69,0.50)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Subsistema</th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontWeight: 700, fontSize: 11, color: 'rgba(11,37,69,0.50)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Estado</th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontWeight: 700, fontSize: 11, color: 'rgba(11,37,69,0.50)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Municipio</th>
              </tr>
            </thead>
            <tbody>
              {escuelas.map((esc) => (
                <tr key={esc.id} style={{ borderBottom: '1px solid rgba(11,37,69,0.06)' }}>
                  <td style={{ padding: '14px 24px', fontWeight: 600, color: '#0B2545' }}>{esc.nombre}</td>
                  <td style={{ padding: '14px 24px', fontFamily: 'monospace', fontSize: 12, color: 'rgba(11,37,69,0.50)' }}>{esc.cct ?? "—"}</td>
                  <td style={{ padding: '14px 24px' }}>
                    <span style={{ borderRadius: 999, background: '#DBEAFE', padding: '3px 10px', fontSize: 11, fontWeight: 700, color: '#1E40AF' }}>
                      {esc.subsistema ?? "—"}
                    </span>
                  </td>
                  <td style={{ padding: '14px 24px', color: 'rgba(11,37,69,0.60)' }}>{esc.estado ?? "—"}</td>
                  <td style={{ padding: '14px 24px', color: 'rgba(11,37,69,0.60)' }}>{esc.municipio ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
