import { redirect } from 'next/navigation';
import { getUser, getProfile } from '@/lib/supabase-helpers';
import CambiarPasswordForm from '@/components/auth/CambiarPasswordForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cambiar contraseña — CEN Bachillerato',
};

export default async function CambiarPasswordPage() {
  const user = await getUser();
  if (!user) redirect('/log-in');

  // Si ya cambió su password, redirigir según rol
  if (user.user_metadata?.must_change_password !== true) {
    const profile = await getProfile(user.id);
    const role = profile?.role ?? 'student';
    if (role === 'teacher') redirect('/dashboard/docente');
    if (role === 'admin' || role === 'super_admin') redirect('/admin/escuelas');
    redirect('/hub');
  }

  const fullName = (user.user_metadata?.full_name as string | undefined) ?? 'Usuario';

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#011C40] px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl">
          {/* Logo / Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#D4A574]/20 rounded-2xl mb-4">
              <svg className="w-8 h-8 text-[#D4A574]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Crea tu contraseña
            </h1>
            <p className="text-sm text-white/50 mt-2">
              Hola {fullName}, establece tu contraseña personal para continuar.
            </p>
          </div>

          <CambiarPasswordForm />
        </div>

        <p className="text-center text-xs text-white/25 mt-6">
          CEN Bachillerato · Sistema de Gestión Académica MCCEMS
        </p>
      </div>
    </div>
  );
}
