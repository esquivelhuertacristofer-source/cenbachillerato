import { redirect } from "next/navigation";
import { getUser, getProfile } from "@/lib/supabase-helpers";
import CrearEscuelaForm from "@/components/admin/CrearEscuelaForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registrar Escuela — Admin | CEN Bachillerato",
};

export default async function NuevaEscuelaPage() {
  const user = await getUser();
  if (!user) redirect("/log-in");

  const profile = await getProfile(user.id);
  if (!profile) redirect("/log-in");

  // El admin layout ya garantiza 'admin' o 'super_admin'; registrar escuelas
  // es exclusivo de super_admin (ADMIN-FLOW.md §5.1, policy "super_admin can
  // manage escuelas" en la migración 01).
  if (profile.role !== "super_admin") {
    redirect("/admin/escuelas");
  }

  return (
    <main style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 24px 64px" }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "#1E40AF", marginBottom: 8 }}>
          Admin · Escuelas
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0B2545", letterSpacing: "-0.03em", margin: 0 }}>
          Registrar escuela
        </h1>
      </div>

      <CrearEscuelaForm />
    </main>
  );
}
