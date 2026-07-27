import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { decodeJwtClaims } from "@/lib/jwt-claims";

// ⚠️ NO renombrar este archivo a `proxy.ts`. Next.js 16 deprecó la convención
// `middleware` en favor de `proxy`, PERO la guía oficial de upgrade es
// explícita (node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md,
// "middleware to proxy"): «The `edge` runtime is NOT supported in `proxy`. The
// `proxy` runtime is `nodejs`, and it cannot be configured. If you want to
// continue using the `edge` runtime, keep using `middleware`.»
// Nuestro deploy es Cloudflare Workers vía @opennextjs/cloudflare, que ABORTA el
// build con "Node.js middleware is not currently supported" (exit 1, sin generar
// worker) en cuanto detecta un middleware de runtime nodejs. Entre 2026-07-14 y
// 2026-07-26 este archivo vivió como `proxy.ts` y `npm run pages:build` falló
// todo ese tiempo, dejando el deploy congelado. Todo el código de abajo está
// escrito para edge a propósito (atob en vez de Buffer, ver paso 3).
// Cuando Next publique instrucciones de runtime edge para `proxy`, se migra.
//
// Responsabilidades (sin él, NINGUNA corría en producción):
//
//   1. Refrescar la sesión de Supabase en cada request (igual que antes).
//   2. Forzar /cambiar-password si el usuario tiene must_change_password=true
//      (igual que antes).
//   3. NUEVO — gate deny-by-default: si no hay usuario autenticado y la ruta
//      es protegida, redirigir a /log-in aquí mismo, en el edge, en vez de
//      depender únicamente de que cada layout.tsx recuerde hacer su propio
//      getUser()+redirect. Es defensa en profundidad: NO sustituye los guards
//      existentes en hub/layout.tsx, admin/layout.tsx, dashboard/docente/layout.tsx
//      (se dejan intactos) ni la revalidación de auth/rol dentro de cada
//      Server Action (Next.js NO garantiza que el matcher de Proxy cubra las
//      Server Functions — ver docs/proxy.md, sección "Server Functions").
//
// ── Verificación LOCAL + refresh perezoso (evitar getUser() en cada request) ──
// La versión anterior llamaba a `supabase.auth.getUser()` -- verificación
// REMOTA contra Supabase Auth -- en TODO request bajo /hub, /admin,
// /dashboard y /cambiar-password, incluidos los prefetches de Next. Eso
// convertía a este proxy en la primera fuente de TTFB (1.5-3s en cascada) y
// en el mayor consumidor de cuota de Supabase Auth a escala.
//
// Ahora el flujo es:
//   1. `getSession()` -- lectura LOCAL de la cookie del request, sin red en
//      el caso general (ver nota de abajo sobre la única excepción).
//   2. Si no hay sesión, redirect a /log-in gratis (sin red).
//   3. Se decodifica el `access_token` LOCALMENTE (base64url + atob, sin
//      Buffer porque este proxy corre en runtime de Cloudflare Workers vía
//      @opennextjs/cloudflare) para leer `exp` y
//      `user_metadata.must_change_password` -- ver `src/lib/jwt-claims.ts`.
//      Deliberadamente NO se lee `session.user`: en el cliente server-side
//      `session.user` viene envuelto en un Proxy de @supabase/auth-js que
//      emite el warning "insecure getSession" en el primer acceso a
//      cualquiera de sus propiedades; `session.access_token` es un string
//      plano y no pasa por ese proxy, así que decodificarlo a mano no genera
//      ruido en los logs.
//   4. Si al token le quedan más de 60s de vida, se resuelve todo con esos
//      claims decodificados localmente y NUNCA se llama a getUser().
//   5. Si el token expiró, está por expirar (<=60s) o el JWT vino
//      malformado, se cae al camino remoto de siempre: getUser() (que
//      refresca tokens y sincroniza cookies vía setAll) + sus mismos checks.
//
// NOTA sobre "sin red en el caso general": @supabase/auth-js tiene un margen
// interno (EXPIRY_MARGIN_MS = 90s, no configurable) dentro de getSession():
// si el access_token cacheado está a menos de 90s de expirar,
// internamente dispara un refresh (POST a /token) *aunque* este cliente se
// creó con autoRefreshToken:false -- ese flag solo apaga el temporizador en
// segundo plano, no este refresh perezoso al leer. Lo aceptamos como parte
// del "camino local": es una llamada mucho más liviana que getUser() (no
// golpea /user, solo /token) y sincroniza cookies mediante el mismo
// onAuthStateChange que createServerClient ya tiene cableado, así que el
// resultado sigue siendo correcto aunque el comentario "sin red" tenga esta
// única excepción, acotada a una ventana de ~90s de cada hora de vida del
// token (~2.5% de los requests en el peor caso).
//
// NOTA DE SEGURIDAD (honesta, a propósito): la decodificación del JWT en el
// paso 3 NO verifica la firma, solo lee estructura y expiración. Es
// aceptable porque este gate es defensa en profundidad para routing/UX --
// la autorización real vive en RLS, en los guards de los layouts (hub,
// admin, dashboard/docente) y en la revalidación dentro de cada Server
// Action, tal como ya documentaba el comentario original de este archivo.
// Un token forjado con un `exp` futuro pasaría este chequeo local sin error,
// pero eso no le da datos a nadie: muere contra RLS o contra el getUser()
// real de las capas de abajo. A cambio, con tokens de 1h, cada usuario paga
// ~1 getUser() remoto por hora (cuando su token está realmente por expirar)
// en vez de uno por cada request bajo las rutas protegidas.
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const pathname = request.nextUrl.pathname;

  const irALogIn = () => {
    const url = request.nextUrl.clone();
    url.pathname = "/log-in";
    return NextResponse.redirect(url);
  };

  // PASO 1 — lectura LOCAL de la sesión (ver nota grande arriba sobre la
  // única excepción de red que trae getSession() por diseño de auth-js).
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Gate deny-by-default: toda ruta cubierta por `matcher` (abajo) exige
  // sesión. /log-in no está en el matcher, así que no puede haber loop.
  if (!session) {
    return irALogIn();
  }

  // PASO 2 — intentar resolver must_change_password SOLO con los claims
  // decodificados localmente. `mustChangePassword` queda en `null` mientras
  // no se pueda confiar en el camino local (token malformado o por expirar),
  // lo que dispara el camino remoto más abajo.
  const MARGEN_REFRESCO_SEGUNDOS = 60;
  let mustChangePassword: boolean | null = null;

  try {
    const claims = decodeJwtClaims(session.access_token);
    const segundosParaExpirar = claims.exp - Math.floor(Date.now() / 1000);

    if (segundosParaExpirar > MARGEN_REFRESCO_SEGUNDOS) {
      mustChangePassword = claims.mustChangePassword;
    }
  } catch {
    // JWT malformado (no son 3 segmentos, el payload no es JSON válido, o
    // falta un "exp" numérico) -- no confiamos en nada local, cae al camino
    // remoto de abajo tal como si el token estuviera por expirar.
  }

  // PASO 3 — camino remoto completo: solo corre cuando el paso 2 no pudo
  // resolver must_change_password localmente (token expirado/por expirar o
  // JWT malformado). Refresca tokens y sincroniza cookies vía setAll, igual
  // que la versión anterior de este archivo hacía en TODO request.
  if (mustChangePassword === null) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return irALogIn();
    }

    mustChangePassword = user.user_metadata?.must_change_password === true;
  }

  if (mustChangePassword && !pathname.startsWith("/cambiar-password")) {
    const url = request.nextUrl.clone();
    url.pathname = "/cambiar-password";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/hub/:path*",
    "/admin/:path*",
    "/dashboard/:path*",
    "/cambiar-password",
  ],
};
