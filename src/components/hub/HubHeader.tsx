import Link from "next/link";
import type { Profile } from "@/types/domain.types";
import { HubHeaderMenu } from "./HubHeaderMenu";

interface HubHeaderProps {
  profile: Profile;
  racha: number;
}

function getSaludo(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Buen día";
  if (h >= 12 && h < 19) return "Buenas tardes";
  if (h >= 19) return "Buenas noches";
  return "Hola";
}

function getDiaDelSemestre(semestre: number): number {
  // TODO: Replace with actual semester start date from escuela config
  const INICIO: Record<number, string> = {
    1: "2026-02-02",
    2: "2025-08-11",
    3: "2026-02-02",
    4: "2025-08-11",
    5: "2026-02-02",
    6: "2025-08-11",
  };
  const inicioStr = INICIO[semestre] ?? "2026-02-02";
  const inicio = new Date(inicioStr);
  const hoy = new Date();
  const diff = Math.floor((hoy.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff + 1);
}

export function HubHeader({ profile, racha }: HubHeaderProps) {
  const nombre = profile.full_name?.split(" ")[0] ?? "Alumno";
  const saludo = getSaludo();
  const semestre = profile.semestre ?? 1;
  const dia = getDiaDelSemestre(semestre);
  const initials = ((profile.full_name ?? profile.email ?? "A")[0] ?? "A").toUpperCase();
  const email = profile.email ?? "";

  return (
    <header
      style={{
        background: "#0B2545",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        position: "sticky",
        top: 0,
        zIndex: 30,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 32px",
          height: 72,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
        {/* Left: logo + divider + greeting */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, minWidth: 0 }}>
          <Link
            href="/hub"
            style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Logo%20Cen.png"
              alt="CEN"
              style={{ width: 32, height: 32, objectFit: "contain", filter: "brightness(0) invert(1)", opacity: 0.92 }}
            />
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em", display: "none" }}
              className="sm-visible"
            >
              CEN Bachillerato
            </span>
          </Link>

          {/* Divider */}
          <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.14)", flexShrink: 0 }} className="md-visible" />

          {/* Greeting */}
          <div className="md-visible" style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em", lineHeight: 1.2 }}>
              {saludo},{" "}
              <span style={{ color: "#7DD3FC" }}>{nombre}</span>
            </p>
            <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.3, marginTop: 2 }}>
              Día {dia} del semestre · Sem. {semestre}
            </p>
          </div>
        </div>

        {/* Right: streak + bell + avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          {/* Streak */}
          {racha > 0 && (
            <div
              title={`${racha} días consecutivos`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                background: "rgba(251,146,60,0.15)",
                border: "1px solid rgba(251,146,60,0.30)",
                borderRadius: 999,
                padding: "5px 12px",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 15 }}>🔥</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#FB923C" }}>{racha}</span>
            </div>
          )}

          {/* Notifications bell — TODO: wire to anuncios table */}
          <button
            aria-label="Notificaciones"
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "rgba(255,255,255,0.60)",
              fontSize: 15,
              flexShrink: 0,
              position: "relative",
            }}
          >
            <i className="fa-regular fa-bell" />
          </button>

          {/* Avatar dropdown (client component) */}
          <HubHeaderMenu initials={initials} nombre={nombre} email={email} />
        </div>
      </div>

      {/* Mobile: greeting bar */}
      <div
        className="md-hidden"
        style={{
          padding: "8px 20px 10px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#fff" }}>
          {saludo}, <span style={{ color: "#7DD3FC" }}>{nombre}</span>
        </p>
        <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.40)" }}>
          Día {dia} del semestre
        </p>
      </div>
    </header>
  );
}
