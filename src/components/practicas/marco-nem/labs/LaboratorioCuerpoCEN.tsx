"use client";
// =============================================================================
// Laboratorio del Cuerpo CEN — la piel de marca del Atlas del cuerpo humano
// =============================================================================
// Mismo remedio que el Observatorio CEN: el cuerpo real (Z-Anatomy) deja de
// flotar sobre un fondo genérico y se presenta en un salón de ciencias de una
// primaria mexicana (jacarandas y casas de colores por la ventana), con Citlali,
// una misión corta y un álbum de estampas de órganos.
//
// El lienzo del atlas ya es transparente: el cuerpo se pinta sólido encima de la
// pintura, sin mezcla de luz.
// =============================================================================

import type { Pieza } from "./AtlasCuerpoScene";
import { NOMBRES } from "./atlas-cuerpo-nombres";
import { crearGuiaCEN } from "./_guia-cen";

const BASE = "/media/nem/laboratorio-cuerpo";

/* ── Debajo del lienzo ───────────────────────────────────────────────────── */
export function FondoLaboratorio() {
  return (
    <>
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "#000a1f" }} />
      {/* La pintura al 40 %: ambiente, no protagonista (mismo criterio que el observatorio). */}
      <div aria-hidden style={{ position: "absolute", inset: 0, background: `url(${BASE}/laboratorio.webp) center 60%/cover`, opacity: 0.4 }} />
      {/* Un foco detrás del cuerpo para que se despegue del salón. */}
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 26% 46% at 50% 50%, rgba(40,110,230,.35) 0%, rgba(0,10,40,.55) 60%, transparent 85%)" }} />
    </>
  );
}

/* ── Qué estampa da cada pieza ─────────────────────────────────────────────
   Por el nombre real de la pieza en el atlas (NOMBRES), no por posición. */
export function estampaDe(p: Pieza | null): string | null {
  if (!p) return null;
  const n = NOMBRES[p.clave];
  if (!n) return null;
  const es = n.es;
  if (n.g === "corazon" || /^(Left|Right) (ventricle|atrium)$/.test(p.clave)) return "corazon";
  if (n.s === "respiratorio" && /lobe of (left|right) lung/i.test(p.clave)) return "pulmones";
  if (n.g === "encefalo") return "cerebro";
  if (n.s === "digestivo" && /^Estómago/.test(es)) return "estomago";
  if (n.s === "digestivo" && /hígado/i.test(es)) return "higado";
  if (n.s === "digestivo" && /^(Colon|Yeyuno|Íleon|Duodeno|Ciego|Recto|Intestino)/.test(es)) return "intestino";
  if (n.s === "urinario" && /^Riñón/.test(es)) return "rinones";
  if (p.clave === "Femur") return "femur";
  if (n.s === "sentidos" && /(ojo|Córnea|Globo ocular|Iris|Cristalino)/.test(es)) return "ojo";
  return null;
}

const ESTAMPAS = [
  { id: "corazon", nombre: "Corazón" },
  { id: "pulmones", nombre: "Pulmones" },
  { id: "cerebro", nombre: "Cerebro" },
  { id: "estomago", nombre: "Estómago" },
  { id: "higado", nombre: "Hígado" },
  { id: "intestino", nombre: "Intestinos" },
  { id: "rinones", nombre: "Riñones" },
  { id: "femur", nombre: "Fémur" },
  { id: "ojo", nombre: "Ojo" },
];

/* ── Encima del lienzo: misión, álbum y Citlali ─────────────────────────── */
export const CapaCuerpo = crearGuiaCEN({
  clave: "cen-laboratorio-cuerpo-v1",
  audios: BASE,
  titulo: "Un viaje por dentro de tu cuerpo",
  frases: {
    bienvenida: "¡Hola de nuevo! Soy Citlali. Te doy la bienvenida al Laboratorio del Cuerpo de CEN. Hoy vamos a viajar por dentro del cuerpo humano. Primero, toca el corazón.",
    corazon: "¡Muy bien! El corazón es un músculo que bombea la sangre a todo tu cuerpo, y late unas cien mil veces al día. Ahora busca los pulmones.",
    pulmones: "¡Eso es! Con los pulmones respiras: toman el oxígeno del aire. Ahora encuentra el estómago.",
    estomago: "¡Lo lograste! En el estómago la comida, como la tortilla y los frijoles, se sigue deshaciendo. Ya tienes tus primeras estampas. Toca más órganos para llenar tu álbum.",
    album: "¡Completaste tu álbum del cuerpo humano! Ahora conoces cómo es tu cuerpo por dentro.",
  },
  pasos: [
    { id: "corazon", texto: "Toca el corazón" },
    { id: "pulmones", texto: "Encuentra los pulmones" },
    { id: "estomago", texto: "Encuentra el estómago" },
  ],
  estampas: ESTAMPAS,
  arte: (id) => ({
    width: "100%",
    height: "100%",
    borderRadius: 3,
    background: `url(${BASE}/est-${id}.webp) center/cover`,
  }),
});
