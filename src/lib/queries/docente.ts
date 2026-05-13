import { getSupabaseServer } from "@/lib/supabase-helpers";

export interface GrupoConAlumnos {
  id: string;
  nombre: string;
  semestre: number;
  total_alumnos: number;
}

export async function getGruposDocente(docenteId: string): Promise<GrupoConAlumnos[]> {
  const sb = await getSupabaseServer();

  const { data: grupos } = await sb
    .from("grupos")
    .select("id, nombre, semestre")
    .eq("id_docente", docenteId);

  if (!grupos || grupos.length === 0) return [];

  const gruposConAlumnos = await Promise.all(
    grupos.map(async (g) => {
      const { count } = await sb
        .from("alumnos_grupos")
        .select("id_alumno", { count: "exact", head: true })
        .eq("id_grupo", g.id);
      return { ...g, total_alumnos: count ?? 0 };
    })
  );

  return gruposConAlumnos;
}

export async function getMetricasDocente(docenteId: string) {
  const grupos = await getGruposDocente(docenteId);
  const totalAlumnos = grupos.reduce((sum, g) => sum + g.total_alumnos, 0);
  const uacEnCurso = new Set(grupos.map((g) => g.semestre)).size;

  return {
    totalGrupos: grupos.length,
    totalAlumnos,
    uacEnCurso,
    grupos,
  };
}
