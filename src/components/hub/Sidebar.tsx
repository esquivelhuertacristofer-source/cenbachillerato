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

  const initials = (profile.full_name ?? profile.email).charAt(0).toUpperCase();

  return (
    <aside style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: 256,
      background: '#0B2545',
      borderRight: '1px solid rgba(255,255,255,0.07)',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '16px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <Link href="/hub" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img
            src="/Logo%20Cen.png"
            alt="CEN"
            style={{ width: 30, height: 30, objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.92 }}
          />
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>CEN Bachillerato</div>
            <div style={{ color: 'rgba(125,211,252,0.65)', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Hub Alumno
            </div>
          </div>
        </Link>
      </div>

      {/* Perfil del alumno */}
      <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36,
            borderRadius: '50%',
            background: 'rgba(125,211,252,0.15)',
            border: '1.5px solid rgba(125,211,252,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: '#7DD3FC',
            flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile.full_name ?? "Alumno"}
            </p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.50)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Semestre {semestreActual}
              {profile.area_eleccion && ` · ${profile.area_eleccion}`}
            </p>
          </div>
        </div>
      </div>

      {/* Navegación scrollable */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '16px 0' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Selector de semestre */}
          <SemestreSelector
            semestreActual={semestreActual}
            semestresDisponibles={semestresDisponibles}
          />

          {/* Recursos Sociocognitivos del semestre */}
          <div>
            <p style={{
              padding: '0 12px',
              marginBottom: 6,
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'rgba(125,211,252,0.55)',
            }}>
              Recursos Sociocognitivos
            </p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {uacDelSemestre.map((uac) => {
                const recurso = RECURSOS_SOCIOCOGNITIVOS.find(
                  (r) => r.codigo === uac.recursoCodigo
                );
                return (
                  <li key={uac.codigo}>
                    <Link
                      href={`/hub/uac/${uac.codigo}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '7px 12px',
                        margin: '1px 8px',
                        borderRadius: 8,
                        fontSize: 13,
                        color: 'rgba(255,255,255,0.75)',
                        textDecoration: 'none',
                      }}
                    >
                      <span style={{ fontSize: 15, lineHeight: 1 }}>{recurso?.icono ?? "📚"}</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{uac.nombre}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Ámbitos de Formación Socioemocional */}
          <div>
            <p style={{
              padding: '0 12px',
              marginBottom: 6,
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'rgba(125,211,252,0.55)',
            }}>
              Formación Socioemocional
            </p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {RECURSOS_SOCIOEMOCIONALES.map((rse) => (
                <li key={rse.codigo}>
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '7px 12px',
                    margin: '1px 8px',
                    borderRadius: 8,
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.40)',
                  }}>
                    <i className="fa-solid fa-seedling" style={{ fontSize: 12, width: 15, flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rse.nombre}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>

      {/* Footer del sidebar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '12px 8px' }}>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            width: '100%',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px',
            borderRadius: 8,
            fontSize: 13,
            color: 'rgba(255,255,255,0.45)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <i className="fa-solid fa-arrow-right-from-bracket" style={{ fontSize: 13 }} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
