import { redirect } from "next/navigation";
import { getUser, getProfile } from "@/lib/supabase-helpers";
import { AdminHeader } from "@/components/dashboard/AdminHeader";

export default async function AdminLayout({
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
  if (profile.role === "teacher") redirect("/dashboard/docente");

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      <AdminHeader />
      {children}
    </div>
  );
}
