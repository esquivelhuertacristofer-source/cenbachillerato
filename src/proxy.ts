import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Next.js 16 renombró `middleware.ts` a `proxy.ts` (misma función, nueva
// convención de archivo/export). Este archivo reemplaza al `src/middleware.ts`
// que quedó borrado tras la migración a Next 16 — sin él, NINGUNA de las dos
// protecciones de abajo corría en producción: ni el refresco de sesión ni el
// redirect por must_change_password.
//
// Responsabilidades:
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
export async function proxy(request: NextRequest) {
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Gate deny-by-default: toda ruta cubierta por `matcher` (abajo) exige
  // sesión. /log-in no está en el matcher, así que no puede haber loop.
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/log-in";
    return NextResponse.redirect(url);
  }

  if (
    user &&
    user.user_metadata?.must_change_password === true &&
    !pathname.startsWith("/cambiar-password")
  ) {
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
