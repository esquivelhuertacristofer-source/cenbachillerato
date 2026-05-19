import { redirect } from "next/navigation";
import { getUser, getProfile } from "@/lib/supabase-helpers";
import { DocenteHeader } from "@/components/dashboard/DocenteHeader";

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
  if (profile.role === "admin") redirect("/admin/escuelas");

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC" }}>
      <DocenteHeader />
      {children}
    </div>
  );
}
