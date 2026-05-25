import { redirect } from "next/navigation";
import { getUser, getProfile } from "@/lib/supabase-helpers";
import MobileNav from "@/components/dashboard/MobileNav";

export default async function DocenteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user) redirect("/log-in");

  const profile = await getProfile(user.id);
  if (!profile) redirect("/log-in");

  if (profile.role === "student") redirect("/hub");
  if (profile.role === "admin" || profile.role === "super_admin") redirect("/admin/escuelas");

  return (
    <div className="pt-14 md:pt-0">
      <MobileNav teacherName={profile.full_name ?? undefined} />
      {children}
    </div>
  );
}
