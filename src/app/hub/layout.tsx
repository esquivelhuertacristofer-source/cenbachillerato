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
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar profile={profile} />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
