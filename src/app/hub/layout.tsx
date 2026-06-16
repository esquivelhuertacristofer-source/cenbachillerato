import { redirect } from "next/navigation";
import { getUser, getProfile } from "@/lib/supabase-helpers";
import { getRachaDelAlumno, getUltimaActividadActiva } from "@/lib/queries/hub";
import { HubShell } from "@/components/hub/HubShell";

export default async function HubLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect("/log-in");

  const profile = await getProfile(user.id);
  if (!profile) redirect("/log-in");

  if (profile.role !== "student") {
    if (profile.role === "teacher") redirect("/dashboard/docente");
    if (profile.role === "admin" || profile.role === "super_admin") redirect("/admin/escuelas");
  }

  const [rachaData, continuar] = await Promise.all([
    getRachaDelAlumno(user.id),
    getUltimaActividadActiva(user.id, profile.semestre ?? 1),
  ]);

  return (
    <HubShell
      profile={profile}
      racha={rachaData.diasConsecutivos}
      ultimos7Dias={rachaData.ultimos7Dias}
      continuar={continuar}
    >
      {children}
    </HubShell>
  );
}
