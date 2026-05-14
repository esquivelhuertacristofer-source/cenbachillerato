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
      <p className="mb-2 px-3 text-[9px] font-black uppercase tracking-[0.3em] text-ink-40">
        Semestre
      </p>
      <div className="flex flex-wrap gap-1 px-3">
        {semestres.map((s) => {
          const disponible = semestresDisponibles.includes(s);
          const activo =
            s === semestreActual || pathname.includes(`/semestre/${s}`);

          if (!disponible) {
            return (
              <span
                key={s}
                className="flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-lg text-sm text-ink-10"
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
                "flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold transition-all duration-150",
                activo
                  ? "bg-cen-navy text-white shadow-[0_4px_12px_rgba(11,37,69,0.25)]"
                  : "text-ink-60 hover:bg-cen-cool",
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
