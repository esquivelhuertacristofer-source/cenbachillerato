'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { cambiarPassword } from '@/lib/actions/cambiar-password';

export default function CambiarPasswordForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await cambiarPassword(password, confirmar);
      if ('error' in result) {
        setError(result.error);
        return;
      }

      // Redirigir al dashboard correcto según rol
      const { rol } = result;
      if (rol === 'teacher') {
        router.push('/dashboard/docente');
      } else if (rol === 'admin' || rol === 'super_admin') {
        router.push('/admin/escuelas');
      } else {
        router.push('/hub');
      }
      router.refresh();
    });
  }

  const inputClass =
    'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm ' +
    'placeholder-white/30 outline-none focus:ring-2 focus:ring-[#D4A574]/40 focus:border-[#D4A574]/50 ' +
    'transition-all';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-black uppercase tracking-widest text-white/50 mb-2">
          Nueva contraseña
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo 8 caracteres"
          className={inputClass}
          required
          minLength={8}
          autoComplete="new-password"
          disabled={isPending}
        />
      </div>

      <div>
        <label className="block text-xs font-black uppercase tracking-widest text-white/50 mb-2">
          Confirmar contraseña
        </label>
        <input
          type="password"
          value={confirmar}
          onChange={(e) => setConfirmar(e.target.value)}
          placeholder="Repite la contraseña"
          className={inputClass}
          required
          autoComplete="new-password"
          disabled={isPending}
        />
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-900/30 border border-red-500/30 rounded-xl">
          <p className="text-sm text-red-300 font-medium">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending || !password || !confirmar}
        className={[
          'w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-widest',
          'transition-all duration-200',
          isPending || !password || !confirmar
            ? 'bg-white/10 text-white/30 cursor-not-allowed'
            : 'bg-[#D4A574] text-[#011C40] hover:bg-[#c4955e] active:scale-[0.98] shadow-lg',
        ].join(' ')}
      >
        {isPending ? 'Guardando…' : 'Establecer contraseña'}
      </button>

      <p className="text-center text-xs text-white/25">
        Esta contraseña reemplaza la temporal que recibiste.
      </p>
    </form>
  );
}
