import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

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

  // Refresca el token de sesión Supabase si está próximo a expirar.
  // La autorización real se delega a los layout.tsx de cada sección.
  const { data: { user } } = await supabase.auth.getUser();

  // Si el usuario tiene must_change_password activo y no está en /cambiar-password,
  // redirigir para forzar el cambio antes de acceder a cualquier otra ruta.
  if (
    user &&
    user.user_metadata?.must_change_password === true &&
    !request.nextUrl.pathname.startsWith('/cambiar-password')
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/cambiar-password';
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
