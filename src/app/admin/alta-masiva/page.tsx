import { redirect } from 'next/navigation';
import { getUser, getProfile } from '@/lib/supabase-helpers';
import AltaMasivaForm from '@/components/admin/AltaMasivaForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Alta Masiva de Usuarios — CEN Bachillerato Admin',
};

export default async function AltaMasivaPage() {
  const user = await getUser();
  if (!user) redirect('/log-in');

  const profile = await getProfile(user.id);
  if (!profile) redirect('/log-in');

  // El admin layout ya protege esta sección, pero doble chequeo explícito
  if (!['admin', 'super_admin'].includes(profile.role)) {
    redirect('/hub');
  }

  const escuelaId = (profile as Record<string, unknown>).escuela_id as string | null;

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#94A3B8', marginBottom: 8 }}>
            Administración · CEN Bachillerato
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0B2545', marginBottom: 8, lineHeight: 1.2 }}>
            Alta Masiva de Usuarios
          </h1>
          <p style={{ fontSize: 14, color: '#64748B' }}>
            Carga un CSV con docentes y alumnos. El sistema crea cuentas, asigna grupos y devuelve las credenciales.
          </p>
        </div>

        {!escuelaId && (
          <div style={{
            padding: '1rem 1.25rem',
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: 12,
            marginBottom: '1.5rem',
          }}>
            <p style={{ fontSize: 14, color: '#991B1B', fontWeight: 600, margin: 0 }}>
              ⚠️ Tu perfil no tiene una escuela asignada. Contacta a un super_admin para configurar tu cuenta antes de usar esta función.
            </p>
          </div>
        )}

        <AltaMasivaForm disabled={!escuelaId} />
      </div>
    </div>
  );
}
