import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Alumnos — Dashboard Docente | CEN Bachillerato",
};

export default function AlumnosPage() {
  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px 64px' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#1E40AF', marginBottom: 8 }}>
          Docente · Alumnos
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0B2545', letterSpacing: '-0.03em', margin: 0 }}>
          Alumnos
        </h1>
        <p style={{ fontSize: 15, color: 'rgba(11,37,69,0.60)', marginTop: 6 }}>
          Gestión de alumnos por grupo y semestre.
        </p>
      </div>

      <div style={{
        background: '#fff',
        border: '2px dashed rgba(11,37,69,0.14)',
        borderRadius: 24,
        padding: '80px 32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}>
        <i className="fa-solid fa-users" style={{ fontSize: 48, color: 'rgba(11,37,69,0.14)', marginBottom: 20 }} />
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0B2545', marginBottom: 8 }}>Próximamente</h2>
        <p style={{ fontSize: 15, color: 'rgba(11,37,69,0.55)', maxWidth: 420, lineHeight: 1.65 }}>
          Vista de alumnos con progreso por UAC, progresión y actividad.
        </p>
      </div>
    </main>
  );
}
