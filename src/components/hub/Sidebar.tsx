"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { SemestreSelector } from "./SemestreSelector";
import type { Profile } from "@/types/domain.types";
import type { SemestreNum } from "@/types/domain.types";
import { RECURSOS_SOCIOCOGNITIVOS } from "@/lib/mccems/recursos-sociocognitivos";
import { UAC_BASE } from "@/lib/mccems/estructura";
import { RECURSOS_SOCIOEMOCIONALES } from "@/lib/mccems/estructura";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

interface SidebarProps {
  profile: Profile;
}

export function Sidebar({ profile }: SidebarProps) {
  const router = useRouter();
  const semestreActual = (profile.semestre ?? 1) as SemestreNum;
  const semestresDisponibles: SemestreNum[] = [1, 2, 3, 4, 5, 6];

  const uacDelSemestre = UAC_BASE.filter(
    (uac) => uac.semestre === semestreActual
  );

  async function handleLogout() {
    try {
      const supabase = getSupabaseBrowser();
      await supabase.auth.signOut();
      router.replace("/log-in");
    } catch (err) {
      console.error("[Sidebar] logout error:", err);
    }
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-4">
        <Link href="/hub" className="flex items-center gap-2">
          <span className="text-lg font-bold text-indigo-700">CEN</span>
          <span className="text-sm text-gray-500">Bachillerato</span>
        </Link>
      </div>

      {/* Perfil del alumno */}
      <div className="border-b border-gray-100 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
            {(profile.full_name ?? profile.email)
              .charAt(0)
              .toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">
              {profile.full_name ?? "Alumno"}
            </p>
            <p className="truncate text-xs text-gray-500">
              Semestre {semestreActual}
              {profile.area_eleccion && ` · ${profile.area_eleccion}`}
            </p>
          </div>
        </div>
      </div>

      {/* Navegación scrollable */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-6">
          {/* Selector de semestre */}
          <SemestreSelector
            semestreActual={semestreActual}
            semestresDisponibles={semestresDisponibles}
          />

          {/* Recursos Sociocognitivos del semestre */}
          <div>
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Recursos Sociocognitivos
            </p>
            <ul className="space-y-0.5">
              {uacDelSemestre.map((uac) => {
                const recurso = RECURSOS_SOCIOCOGNITIVOS.find(
                  (r) => r.codigo === uac.recursoCodigo
                );
                return (
                  <li key={uac.codigo}>
                    <Link
                      href={`/hub/uac/${uac.codigo}`}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
                    >
                      <span>{recurso?.icono ?? "📚"}</span>
                      <span className="truncate">{uac.nombre}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Ámbitos de Formación Socioemocional */}
          <div>
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Formación Socioemocional
            </p>
            <ul className="space-y-0.5">
              {RECURSOS_SOCIOEMOCIONALES.map((rse) => (
                <li key={rse.codigo}>
                  <span className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-500">
                    <span>🌱</span>
                    <span className="truncate text-xs">{rse.nombre}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>

      {/* Footer del sidebar */}
      <div className="border-t border-gray-200 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-red-50 hover:text-red-600"
        >
          <span>→</span>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
