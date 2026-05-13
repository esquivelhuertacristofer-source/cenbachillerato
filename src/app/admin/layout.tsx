import { redirect } from "next/navigation";
import { getUser, getProfile } from "@/lib/supabase-helpers";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user) redirect("/log-in");

  const profile = await getProfile(user.id);
  if (!profile) redirect("/log-in");

  if (profile.role === "student") redirect("/hub");
  if (profile.role === "teacher") redirect("/dashboard/docente");

  return <>{children}</>;
}
