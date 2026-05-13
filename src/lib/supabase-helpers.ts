import { cache } from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.types";
import type { Profile } from "@/types/domain.types";

export async function getSupabaseServer() {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Component — cookies no pueden setearse desde aquí.
          // El proxy/middleware se encarga de refrescar la sesión.
        }
      },
    },
  });
}

export async function getSession() {
  const supabase = await getSupabaseServer();
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  } catch (error) {
    console.error("[supabase-helpers] getSession error:", error);
    return null;
  }
}

// cache() deduplicates calls with the same args within a single React render request
export const getUser = cache(async function getUser() {
  const supabase = await getSupabaseServer();
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  } catch (error) {
    console.error("[supabase-helpers] getUser error:", error);
    return null;
  }
});

export const getProfile = cache(async function getProfile(
  userId: string
): Promise<Profile | null> {
  const supabase = await getSupabaseServer();
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (error) throw error;
    return data as Profile | null;
  } catch (error) {
    console.error("[supabase-helpers] getProfile error:", error);
    return null;
  }
});
