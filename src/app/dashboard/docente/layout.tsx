import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getUser, getProfile, getSupabaseServer } from "@/lib/supabase-helpers";
import MobileNav from "@/components/dashboard/MobileNav";

export default async function DocenteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user) redirect("/log-in");
  if (user.user_metadata?.must_change_password === true) redirect("/cambiar-password");

  const profile = await getProfile(user.id);
  if (!profile) redirect("/log-in");

  if (profile.role === "student") redirect("/hub");
  if (profile.role === "admin" || profile.role === "super_admin") redirect("/admin/escuelas");

  // El menú móvil también cambia de grupo (en escritorio lo hace el lateral).
  // Solo id, nombre y semestre: es la consulta más ligera posible.
  const sb = await getSupabaseServer();
  const { data: grupos } = await sb
    .from("grupos")
    .select("id, nombre, semestre")
    .eq("id_docente", user.id);

  return (
    <div className="pt-14 md:pt-0">
      <Suspense fallback={null}>
        <MobileNav teacherName={profile.full_name ?? undefined} grupos={grupos ?? []} />
      </Suspense>
      {children}
    </div>
  );
}
