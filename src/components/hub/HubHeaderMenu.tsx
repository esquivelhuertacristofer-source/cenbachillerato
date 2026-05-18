"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import Link from "next/link";

interface HubHeaderMenuProps {
  initials: string;
  nombre: string;
  email: string;
}

export function HubHeaderMenu({ initials, nombre, email }: HubHeaderMenuProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    try {
      const supabase = getSupabaseBrowser();
      await supabase.auth.signOut();
      router.replace("/log-in");
    } catch (err) {
      console.error("[HubHeaderMenu] logout error:", err);
    }
  }

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={`Menú de ${nombre}`}
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "rgba(125,211,252,0.18)",
          border: "1.5px solid rgba(125,211,252,0.40)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 15,
          fontWeight: 700,
          color: "#7DD3FC",
          cursor: "pointer",
          transition: "background 0.2s ease, border-color 0.2s ease",
          flexShrink: 0,
        }}
      >
        {initials}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 40 }}
          />
          {/* Dropdown */}
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 10px)",
              right: 0,
              width: 220,
              background: "#fff",
              borderRadius: 16,
              border: "1px solid rgba(11,37,69,0.12)",
              boxShadow: "0 16px 40px rgba(11,37,69,0.18)",
              zIndex: 50,
              overflow: "hidden",
              animation: "slideDown 0.18s ease",
            }}
          >
            {/* User info */}
            <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(11,37,69,0.08)" }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#0B2545", margin: "0 0 2px" }}>
                {nombre}
              </p>
              <p style={{ fontSize: 12, color: "rgba(11,37,69,0.50)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {email}
              </p>
            </div>

            {/* Menu items */}
            <div style={{ padding: "8px 0" }}>
              <Link
                href="/hub"
                onClick={() => setOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 16px",
                  fontSize: 13,
                  color: "#0B2545",
                  textDecoration: "none",
                  transition: "background 0.15s",
                }}
                className="hub-menu-item"
              >
                <i className="fa-solid fa-house" style={{ width: 16, color: "#1E40AF" }} />
                Mi Hub
              </Link>
            </div>

            {/* Logout */}
            <div style={{ borderTop: "1px solid rgba(11,37,69,0.08)", padding: "8px 0" }}>
              <button
                onClick={handleLogout}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 16px",
                  fontSize: 13,
                  color: "#DC2626",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                  transition: "background 0.15s",
                }}
              >
                <i className="fa-solid fa-arrow-right-from-bracket" style={{ width: 16 }} />
                Cerrar sesión
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
