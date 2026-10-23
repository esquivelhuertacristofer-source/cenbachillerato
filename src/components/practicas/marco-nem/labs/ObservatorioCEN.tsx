"use client";
// =============================================================================
// Observatorio CEN — la piel de marca del Explorador espacial (vista Sistema Solar)
// =============================================================================
// El cliente dijo del sistema solar «esto es IA, cualquiera lo trae»: un visor
// flotando en negro con paneles alrededor. Aquí el mismo sistema solar real se
// proyecta como holograma en la mesa de un observatorio CEN (cúpula, volcanes y
// pueblo mexicano por la ventana), con una guía fija con voz, una misión corta y
// un álbum de estampas que el niño va llenando.
//
//   · <FondoObservatorio/> va DEBAJO del lienzo: pintura + velo + haz de luz.
//   · <CapaObservatorio/> va ENCIMA: misión, álbum, Citlali y su globo.
//   · El lienzo se mezcla con `mix-blend-mode: screen` (lo negro desaparece, lo
//     luminoso se suma): por eso no hace falta un lienzo transparente.
//
// El progreso (paso y estampas) vive en localStorage y se lee DESPUÉS de montar:
// leerlo en el primer render rompe la hidratación (ver nem-use-client…).
// =============================================================================

import type { CSSProperties } from "react";
import { crearGuiaCEN } from "./_guia-cen";

const BASE = "/media/nem/observatorio";

const FRASES: Record<string, string> = {
  bienvenida: "¡Hola! Soy Citlali, y te doy la bienvenida al Observatorio CEN. Hoy vamos a conocer a nuestros vecinos del espacio. Primero, toca el Sol.",
  sol: "¡Muy bien! El Sol es una estrella, y todos los planetas giran a su alrededor. Ahora busca la Tierra, nuestro planeta.",
  tierra: "¡Ahí vivimos! La Tierra es el tercer planeta desde el Sol. Ahora encuentra el planeta que tiene anillos.",
  saturno: "¡Lo lograste! Saturno tiene anillos de hielo y roca. Ya tienes tus primeras estampas. Abre los demás planetas para llenar tu álbum.",
  album: "¡Completaste tu álbum del Sistema Solar! Eres una gran exploradora, un gran explorador.",
};

const PASOS = [
  { id: "sol", texto: "Toca el Sol" },
  { id: "tierra", texto: "Encuentra la Tierra" },
  { id: "saturno", texto: "Encuentra el planeta con anillos" },
];

/** Las estampas del álbum: el Sol y los ocho planetas, con su textura real. */
const ESTAMPAS: { id: string; nombre: string; textura: string }[] = [
  { id: "sol", nombre: "Sol", textura: "sol-2k" },
  { id: "mercurio", nombre: "Mercurio", textura: "mercurio-2k" },
  { id: "venus", nombre: "Venus", textura: "venus-2k" },
  { id: "tierra", nombre: "Tierra", textura: "tierra-dia-2k" },
  { id: "marte", nombre: "Marte", textura: "marte-2k" },
  { id: "jupiter", nombre: "Júpiter", textura: "jupiter-2k" },
  { id: "saturno", nombre: "Saturno", textura: "saturno-2k" },
  { id: "urano", nombre: "Urano", textura: "urano-2k" },
  { id: "neptuno", nombre: "Neptuno", textura: "neptuno-2k" },
];

/* ── Debajo del lienzo ───────────────────────────────────────────────────── */
export function FondoObservatorio() {
  return (
    <>
      {/* La pintura al 40 %: es ambiente, no protagonista (pedido del usuario: bajarla a 30-50 %). */}
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "#000a1f" }} />
      <div aria-hidden style={{ position: "absolute", inset: 0, background: `url(${BASE}/observatorio.webp) center 62%/cover`, opacity: 0.4 }} />
      {/* Oscurece el cuarto detrás de la proyección para que las órbitas no se pierdan. */}
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 36% 34% at 50% 44%, rgba(0,8,30,.8) 0%, rgba(0,8,30,.45) 58%, transparent 82%)" }} />
      {/* El haz que sube de la mesa al holograma. */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: "50%",
          top: "40%",
          width: "58%",
          height: "34%",
          transform: "translateX(-50%)",
          background: "linear-gradient(180deg, transparent 0%, rgba(120,180,255,.12) 50%, rgba(150,210,255,.34) 100%)",
          clipPath: "polygon(0% 0%, 100% 0%, 82% 100%, 18% 100%)",
          filter: "blur(2px)",
        }}
      />
    </>
  );
}

/** Estilo de la caja del lienzo en el observatorio: holograma sobre la mesa. */
export const CAJA_HOLOGRAMA: CSSProperties = {
  position: "absolute",
  left: "17%",
  right: "17%",
  top: "9%",
  bottom: "22%",
  mixBlendMode: "screen",
  filter: "brightness(1.35) contrast(1.1)",
  WebkitMaskImage: "radial-gradient(ellipse 50% 50% at 50% 50%, #000 66%, transparent 100%)",
  maskImage: "radial-gradient(ellipse 50% 50% at 50% 50%, #000 66%, transparent 100%)",
};

/* ── Encima del lienzo: misión, álbum y Citlali ─────────────────────────── */
const TEXTURA = Object.fromEntries(ESTAMPAS.map((e) => [e.id, e.textura]));
export const CapaObservatorio = crearGuiaCEN({
  clave: "cen-observatorio-v1",
  audios: BASE,
  titulo: "Conoce a tus vecinos del espacio",
  frases: FRASES,
  pasos: PASOS,
  estampas: ESTAMPAS,
  arte: (id) => ({
    width: "72%",
    aspectRatio: "1",
    borderRadius: "50%",
    background: `url(/media/espacio/${TEXTURA[id]}.webp) center/220% 100%`,
    boxShadow: "inset -4px -3px 6px rgba(0,0,0,.65)",
  }),
});
