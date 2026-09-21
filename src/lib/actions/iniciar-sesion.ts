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

  /*
   * EL TOKEN «DEL FUTURO», Y POR QUÉ AQUÍ ERA PEOR QUE UN ERROR (8-sep-2026).
   *
   * En 1 de cada ~60 accesos medidos, el reloj del servidor que FIRMA el token
   * va unas décimas por delante del que SIRVE los datos, y PostgREST rechaza un
   * token recién emitido: «JWT issued at future».
   *
   * Aquí el `error` no se miraba y `role` caía a `'student'`. O sea que una
   * maestra que pillara ese desfase NO veía un error: entraba, y entraba COMO
   * ALUMNA — a la clase de otro, sin su panel y sin sus grupos, con todo el
   * aspecto de estar funcionando. Un fallo silencioso que devuelve el rol
   * equivocado es peor que uno ruidoso que no deja pasar.
   *
   * Dos cambios: se reintenta una vez tras esperar más de lo que dura la deriva
   * observada, y si aun así no se puede leer el rol NO se inventa uno. Se pide
   * volver a intentarlo, que es honesto y cuesta cinco segundos.
   *
   * `PGRST116` es «no hay ninguna fila», que no es un fallo de reloj: esa cuenta
   * de verdad no tiene perfil, y para ella el valor por omisión sigue valiendo.
   */
  const leerRol = () =>
    supabase.from('profiles').select('role').eq('id', data.user.id).single();

  let { data: profile, error: profileError } = await leerRol();

  if (profileError && /issued at future|JWSInvalidSignature|PGRST301/i.test(profileError.message ?? '')) {
    await new Promise((listo) => setTimeout(listo, 1200));
    ({ data: profile, error: profileError } = await leerRol());
  }

  if (profileError && profileError.code !== 'PGRST116') {
    console.error('[iniciarSesion] no se pudo leer el rol:', profileError.message);
    return { error: 'No se pudo cargar tu perfil. Vuelve a intentarlo en unos segundos.' };
  }

  const role = profile?.role ?? 'student';
  return { ok: true, rol: role };
}
