import { redirect } from "next/navigation";
import { getUser, getProfile } from "@/lib/supabase-helpers";
import { getRachaDelAlumno, getUltimaActividadActiva } from "@/lib/queries/hub";
import { HubShell } from "@/components/hub/HubShell";

export default async function HubLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect("/log-in");
  if (user.user_metadata?.must_change_password === true) redirect("/cambiar-password");

  const profile = await getProfile(user.id);
  if (!profile) redirect("/log-in");

  /*
   * EL DOCENTE PASA, PERO DE VISITA (2026-09-22).
   *
   * Aquí se le devolvía al panel, así que un maestro NO tenía forma de ver las
   * actividades de sus materias como las ve su grupo: el panel es de métricas y
   * Planteamiento es la planeación, no la actividad. Una maestra de Froebel pasó
   * dos días buscándolo, y no estaba.
   *
   * Entra en VISTA PREVIA: ve lo mismo que el alumno y no escribe nada. Lo de
   * "no escribe nada" no lo sostiene esta pantalla —eso sería confiar en que
   * nadie llama a la acción por su cuenta—, sino la guarda de rol dentro de
   * `entregarActividad`. Aquí solo se avisa, para que no crea que está
   * resolviendo la actividad de verdad.
   *
   * El administrador sigue yendo a lo suyo: su trabajo no es este.
   */
  const vistaPrevia = profile.role === "teacher";
  if (!vistaPrevia && profile.role !== "student") {
    if (profile.role === "admin" || profile.role === "super_admin") redirect("/admin/escuelas");
  }

  const [rachaData, continuar] = await Promise.all([
    getRachaDelAlumno(user.id),
    getUltimaActividadActiva(user.id, profile.semestre ?? 1),
  ]);

  return (
    <HubShell
      profile={profile}
      vistaPrevia={vistaPrevia}
      racha={rachaData.diasConsecutivos}
      ultimos7Dias={rachaData.ultimos7Dias}
      continuar={continuar}
    >
      {children}
    </HubShell>
  );
}
