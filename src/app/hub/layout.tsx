import { redirect } from "next/navigation";
import { getUser, getProfile } from "@/lib/supabase-helpers";
import { Sidebar } from "@/components/hub/Sidebar";

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

  return (
    <div data-hub-layout="" style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#F8FAFC' }}>
      <Sidebar profile={profile} />
      <main data-hub-main="" style={{ flex: 1, overflowY: 'auto', padding: 32 }}>{children}</main>
    </div>
  );
}
