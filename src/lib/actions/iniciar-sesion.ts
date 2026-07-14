'use server';

import { headers } from 'next/headers';
import { getSupabaseServer } from '@/lib/supabase-helpers';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { IniciarSesionSchema, type IniciarSesionInput } from '@/lib/schemas/iniciar-sesion.schema';

// Antes, el login corría enteramente en el navegador (signInWithPassword +
// insert de user_consents + lectura de profiles.role directo desde el
// cliente): sin rate-limit posible (checkRateLimit/getClientIp solo corren
// server-side) y con el rol de redirección decidido por un fetch que el
// cliente controla. Este Server Action es el único punto de entrada para
// iniciar sesión: valida el consentimiento, aplica rate-limit por IP,
// autentica, registra el consentimiento y resuelve el rol — todo server-side.
const LOGIN_RATE_LIMIT = { limit: 10, windowSeconds: 60 };

export type IniciarSesionResult = { ok: true; rol: string } | { error: string };

export async function iniciarSesion(input: IniciarSesionInput): Promise<IniciarSesionResult> {
  const parsed = IniciarSesionSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };
  }
  const { email, password } = parsed.data;

  const ip = await getClientIp();
  const { allowed } = await checkRateLimit(`login:${ip}`, LOGIN_RATE_LIMIT);
  if (!allowed) {
    return { error: 'Demasiados intentos de acceso. Espera un minuto e inténtalo de nuevo.' };
  }

  const supabase = await getSupabaseServer();
  const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

  if (authError) {
    const msg =
      authError.message === 'Invalid login credentials'
        ? 'Correo o contraseña incorrectos.'
        : authError.message === 'Email not confirmed'
        ? 'Debes confirmar tu correo electrónico antes de acceder.'
        : 'Ocurrió un error al iniciar sesión. Intenta de nuevo.';
    return { error: msg };
  }

  if (!data.user) {
    return { error: 'No se pudo obtener la sesión. Intenta de nuevo.' };
  }

  // supabase-js no lanza en error de insert: devuelve { error }. El
  // consentimiento nunca bloquea el login (registro best-effort).
  let userAgent: string | null = null;
  try {
    userAgent = (await headers()).get('user-agent');
  } catch {
    // sin request context disponible — no debería ocurrir en un Server Action
  }

  const { error: consentError } = await supabase.from('user_consents').insert([
    { user_id: data.user.id, document_type: 'privacy', document_version: '1.0', ip_address: ip, user_agent: userAgent },
    { user_id: data.user.id, document_type: 'terms', document_version: '1.0', ip_address: ip, user_agent: userAgent },
  ]);
  if (consentError) {
    console.error('[iniciarSesion] no se pudo registrar consentimiento:', consentError.message);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single();

  const role = profile?.role ?? 'student';
  return { ok: true, rol: role };
}
