"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SemestreNum } from "@/types/domain.types";

interface SemestreSelectorProps {
  semestreActual: number;
  semestresDisponibles: SemestreNum[];
}

export function SemestreSelector({
  semestreActual,
  semestresDisponibles,
}: SemestreSelectorProps) {
  const pathname = usePathname();
  const semestres = [1, 2, 3, 4, 5, 6] as SemestreNum[];

  return (
    <div>
      <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
        Semestre
      </p>
      <div className="flex flex-wrap gap-1 px-3">
        {semestres.map((s) => {
          const disponible = semestresDisponibles.includes(s);
          const activo = s === semestreActual || pathname.includes(`/semestre/${s}`);

          if (!disponible) {
            return (
              <span
                key={s}
                className="flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-lg text-sm text-gray-300"
                title={`Semestre ${s} — no disponible`}
              >
                {s}
              </span>
            );
          }

          return (
            <Link
              key={s}
              href={`/hub/semestre/${s}`}
              className={[
                "flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors",
                activo
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 hover:bg-gray-100",
              ].join(" ")}
            >
              {s}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
