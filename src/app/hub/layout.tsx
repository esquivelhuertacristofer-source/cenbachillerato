import { redirect } from "next/navigation";
import { getUser, getProfile } from "@/lib/supabase-helpers";
import { HubHeader } from "@/components/hub/HubHeader";
import { getRachaDelAlumno } from "@/lib/queries/hub";

export default async function HubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user) redirect("/log-in");

  const profile = await getProfile(user.id);
  if (!profile) redirect("/log-in");

  if (profile.role !== "student") {
    if (profile.role === "teacher") redirect("/dashboard/docente");
    if (profile.role === "admin" || profile.role === "super_admin") redirect("/admin/escuelas");
  }

  const rachaData = await getRachaDelAlumno(user.id);

  return (
    <div className="hub-root" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <HubHeader profile={profile} racha={rachaData.diasConsecutivos} />
      <main style={{ flex: 1 }}>
        {children}
      </main>
    </div>
  );
}
