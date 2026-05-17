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
      <p style={{
        padding: '0 12px',
        marginBottom: 8,
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        color: 'rgba(125,211,252,0.55)',
      }}>
        Semestre
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: '0 12px' }}>
        {semestres.map((s) => {
          const disponible = semestresDisponibles.includes(s);
          const activo = s === semestreActual || pathname.includes(`/semestre/${s}`);

          if (!disponible) {
            return (
              <span
                key={s}
                style={{
                  width: 32, height: 32,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 8,
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.20)',
                  cursor: 'not-allowed',
                }}
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
              style={{
                width: 32, height: 32,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: activo ? 700 : 500,
                textDecoration: 'none',
                color: activo ? '#7DD3FC' : 'rgba(255,255,255,0.55)',
                background: activo ? 'rgba(125,211,252,0.15)' : 'transparent',
                transition: 'all 0.15s ease',
              }}
            >
              {s}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
