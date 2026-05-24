import { redirect } from "next/navigation";
import { getUser, getProfile } from "@/lib/supabase-helpers";
import { getGruposDocente, getFichasBibliotecaPorSemestre } from "@/lib/queries/docente";
import type { FichaBiblioteca } from "@/lib/queries/docente";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Biblioteca — Dashboard Docente | CEN Bachillerato",
};

const CATEGORIA_COLOR: Record<string, string> = {
  teorica: '#6366f1',
  practica: '#10b981',
  evaluacion: '#f59e0b',
  referencia: '#06b6d4',
  complementaria: '#8b5cf6',
};

function FichaCard({ ficha }: { ficha: FichaBiblioteca }) {
  const color = CATEGORIA_COLOR[ficha.categoria ?? ''] ?? '#94a3b8';

  return (
    <div style={{
      background: '#fff',
      border: '1px solid rgba(11,37,69,0.10)',
      borderRadius: 16,
      padding: '20px 22px',
      borderTop: `3px solid ${color}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0B2545', lineHeight: 1.35 }}>{ficha.titulo}</div>
          {ficha.uac_codigo && (
            <div style={{ fontSize: 11, color: '#1E40AF', fontWeight: 600, fontFamily: 'monospace', marginTop: 4 }}>
              {ficha.uac_codigo} · {ficha.uac_nombre}
            </div>
          )}
        </div>
        {ficha.tiempo_lectura_minutos && (
          <span style={{
            fontSize: 11, fontWeight: 600, color: 'rgba(11,37,69,0.50)',
            background: 'rgba(11,37,69,0.06)', padding: '3px 8px', borderRadius: 999,
            whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            <i className="fa-regular fa-clock" style={{ marginRight: 4 }} />
            {ficha.tiempo_lectura_minutos}m
          </span>
        )}
      </div>
      {ficha.categoria && (
        <span style={{
          fontSize: 11, fontWeight: 700, color,
          background: `${color}18`, padding: '3px 9px', borderRadius: 999,
          textTransform: 'capitalize',
        }}>
          {ficha.categoria}
        </span>
      )}
    </div>
  );
}

export default async function BibliotecaPage() {
  const user = await getUser();
  if (!user) redirect("/log-in");
  const profile = await getProfile(user.id);
  if (!profile || profile.role === "student") redirect("/hub");

  const grupos = await getGruposDocente(user.id);

  const semestres = [...new Set(grupos.map((g) => g.semestre))].sort();

  // Fichas para cada semestre en paralelo
  const fichasPorSemestre = semestres.length > 0
    ? await Promise.all(semestres.map((s) => getFichasBibliotecaPorSemestre(s)))
    : [];

  const fichasSemMap = new Map<number, FichaBiblioteca[]>(
    semestres.map((s, i) => [s, fichasPorSemestre[i] ?? []])
  );

  const totalFichas = fichasPorSemestre.reduce((s, f) => s + f.length, 0);

  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#1E40AF', marginBottom: 8 }}>
          <i className="fa-solid fa-circle" style={{ fontSize: 8, color: '#10b981', marginRight: 6 }} />
          Docente · Biblioteca
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0B2545', letterSpacing: '-0.03em', margin: 0 }}>
          Biblioteca de fichas
        </h1>
        <p style={{ fontSize: 15, color: 'rgba(11,37,69,0.60)', marginTop: 6 }}>
          {totalFichas === 0
            ? 'No hay fichas disponibles para tus semestres.'
            : `${totalFichas} ficha${totalFichas !== 1 ? 's' : ''} · Semestres ${semestres.join(', ')}`}
        </p>
      </div>

      {totalFichas === 0 ? (
        <div style={{
          background: '#fff', border: '2px dashed rgba(11,37,69,0.14)',
          borderRadius: 24, padding: '80px 32px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        }}>
          <i className="fa-solid fa-book-open" style={{ fontSize: 48, color: 'rgba(11,37,69,0.14)', marginBottom: 20 }} />
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0B2545', marginBottom: 8 }}>Sin fichas disponibles</h2>
          <p style={{ fontSize: 15, color: 'rgba(11,37,69,0.55)', maxWidth: 420, lineHeight: 1.65 }}>
            Las fichas de biblioteca se asocian a las UAC de tus semestres. Cuando el administrador las cargue, aparecerán aquí.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          {semestres.map((sem) => {
            const fichas = fichasSemMap.get(sem) ?? [];
            if (fichas.length === 0) return null;

            // Agrupar por UAC
            const porUAC = new Map<string, { codigo: string; nombre: string; fichas: FichaBiblioteca[] }>();
            for (const f of fichas) {
              const key = f.uac_id;
              if (!porUAC.has(key)) {
                porUAC.set(key, { codigo: f.uac_codigo ?? '—', nombre: f.uac_nombre ?? '—', fichas: [] });
              }
              porUAC.get(key)!.fichas.push(f);
            }

            return (
              <div key={sem}>
                {/* Semestre header */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: '#0B2545', color: '#7DD3FC',
                  borderRadius: 999, padding: '6px 16px',
                  fontSize: 13, fontWeight: 700, marginBottom: 20,
                }}>
                  <i className="fa-solid fa-layer-group" style={{ fontSize: 11 }} />
                  Semestre {sem}° MCCEMS · {fichas.length} ficha{fichas.length !== 1 ? 's' : ''}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {[...porUAC.entries()].map(([uacId, { codigo, nombre, fichas: uacFichas }]) => (
                    <div key={uacId}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        marginBottom: 12, paddingBottom: 10,
                        borderBottom: '1px solid rgba(11,37,69,0.08)',
                      }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#1E40AF', fontFamily: 'monospace' }}>{codigo}</span>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#0B2545' }}>{nombre}</span>
                        <span style={{ fontSize: 12, color: 'rgba(11,37,69,0.40)', marginLeft: 'auto' }}>
                          {uacFichas.length} ficha{uacFichas.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                        {uacFichas.map((f) => <FichaCard key={f.id} ficha={f} />)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
