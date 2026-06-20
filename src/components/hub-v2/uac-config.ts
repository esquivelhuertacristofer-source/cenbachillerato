import { getUACPorCodigo } from "@/lib/mccems/estructura";

export interface UACVisualConfig {
  emoji: string;
  bg: string;
  accent: string;
  accentRgb: string;
  shortTitle: string;
  glow: string;
}

export const UAC_CONFIG: Record<string, UACVisualConfig> = {
  // ── Lengua y Comunicación (sems 1-3) — azul cielo ────────────────────────────
  "LC-I":    { emoji: "📖", bg: "linear-gradient(135deg,#0B2545 0%,#0d3066 50%,#0b3a80 100%)", accent: "#38BDF8", accentRgb: "56,189,248",   shortTitle: "Lengua y Comunicación I",    glow: "rgba(56,189,248,0.25)" },
  "LC-II":   { emoji: "📖", bg: "linear-gradient(135deg,#0B2545 0%,#0d3066 50%,#0b3a80 100%)", accent: "#38BDF8", accentRgb: "56,189,248",   shortTitle: "Lengua y Comunicación II",   glow: "rgba(56,189,248,0.25)" },
  "LC-III":  { emoji: "📖", bg: "linear-gradient(135deg,#0B2545 0%,#0d3066 50%,#0b3a80 100%)", accent: "#38BDF8", accentRgb: "56,189,248",   shortTitle: "Lengua y Comunicación III",  glow: "rgba(56,189,248,0.25)" },

  // ── Pensamiento Matemático (sems 1-6) — naranja ───────────────────────────────
  "PM-I":    { emoji: "🧮", bg: "linear-gradient(135deg,#1a0e05 0%,#251604 50%,#2d1a06 100%)", accent: "#FB923C", accentRgb: "251,146,60",   shortTitle: "Pensamiento Matemático I",   glow: "rgba(251,146,60,0.25)" },
  "PM-II":   { emoji: "🧮", bg: "linear-gradient(135deg,#1a0e05 0%,#251604 50%,#2d1a06 100%)", accent: "#FB923C", accentRgb: "251,146,60",   shortTitle: "Pensamiento Matemático II",  glow: "rgba(251,146,60,0.25)" },
  "PM-III":  { emoji: "🧮", bg: "linear-gradient(135deg,#1a0e05 0%,#251604 50%,#2d1a06 100%)", accent: "#FB923C", accentRgb: "251,146,60",   shortTitle: "Pensamiento Matemático III", glow: "rgba(251,146,60,0.25)" },
  "PM-IV":   { emoji: "🧮", bg: "linear-gradient(135deg,#1a0e05 0%,#251604 50%,#2d1a06 100%)", accent: "#FB923C", accentRgb: "251,146,60",   shortTitle: "Pensamiento Matemático IV",  glow: "rgba(251,146,60,0.25)" },
  "PM-V":    { emoji: "🧮", bg: "linear-gradient(135deg,#1a0e05 0%,#251604 50%,#2d1a06 100%)", accent: "#FB923C", accentRgb: "251,146,60",   shortTitle: "Pensamiento Matemático V",   glow: "rgba(251,146,60,0.25)" },
  "PM-VI":   { emoji: "🧮", bg: "linear-gradient(135deg,#1a0e05 0%,#251604 50%,#2d1a06 100%)", accent: "#FB923C", accentRgb: "251,146,60",   shortTitle: "Pensamiento Matemático VI",  glow: "rgba(251,146,60,0.25)" },

  // ── Inglés (sems 1-5) — violeta ───────────────────────────────────────────────
  "IN-I":    { emoji: "🌐", bg: "linear-gradient(135deg,#0e0820 0%,#160d35 50%,#1a0f42 100%)", accent: "#A78BFA", accentRgb: "167,139,250",  shortTitle: "Inglés I",                   glow: "rgba(167,139,250,0.25)" },
  "IN-II":   { emoji: "🌐", bg: "linear-gradient(135deg,#0e0820 0%,#160d35 50%,#1a0f42 100%)", accent: "#A78BFA", accentRgb: "167,139,250",  shortTitle: "Inglés II",                  glow: "rgba(167,139,250,0.25)" },
  "IN-III":  { emoji: "🌐", bg: "linear-gradient(135deg,#0e0820 0%,#160d35 50%,#1a0f42 100%)", accent: "#A78BFA", accentRgb: "167,139,250",  shortTitle: "Inglés III",                 glow: "rgba(167,139,250,0.25)" },
  "IN-IV":   { emoji: "🌐", bg: "linear-gradient(135deg,#0e0820 0%,#160d35 50%,#1a0f42 100%)", accent: "#A78BFA", accentRgb: "167,139,250",  shortTitle: "Inglés IV",                  glow: "rgba(167,139,250,0.25)" },
  "IN-V":    { emoji: "🌐", bg: "linear-gradient(135deg,#0e0820 0%,#160d35 50%,#1a0f42 100%)", accent: "#A78BFA", accentRgb: "167,139,250",  shortTitle: "Inglés V",                   glow: "rgba(167,139,250,0.25)" },

  // ── Cultura Digital (sems 1, 2, 6) — verde tech ───────────────────────────────
  "CD-I":    { emoji: "💻", bg: "linear-gradient(135deg,#06150f 0%,#081a12 50%,#0a2016 100%)", accent: "#34D399", accentRgb: "52,211,153",   shortTitle: "Cultura Digital I",          glow: "rgba(52,211,153,0.25)" },
  "CD-II":   { emoji: "💻", bg: "linear-gradient(135deg,#06150f 0%,#081a12 50%,#0a2016 100%)", accent: "#34D399", accentRgb: "52,211,153",   shortTitle: "Cultura Digital II",         glow: "rgba(52,211,153,0.25)" },
  "CD-III":  { emoji: "💻", bg: "linear-gradient(135deg,#06150f 0%,#081a12 50%,#0a2016 100%)", accent: "#34D399", accentRgb: "52,211,153",   shortTitle: "Cultura Digital III",        glow: "rgba(52,211,153,0.25)" },

  // ── Ciencias Sociales (sems 1, 2, 4) — amarillo ───────────────────────────────
  "CS-I":    { emoji: "🏛️", bg: "linear-gradient(135deg,#1a1205 0%,#201605 50%,#271a04 100%)", accent: "#FBBF24", accentRgb: "251,191,36",   shortTitle: "Ciencias Sociales I",        glow: "rgba(251,191,36,0.25)" },
  "CS-II":   { emoji: "🏛️", bg: "linear-gradient(135deg,#1a1205 0%,#201605 50%,#271a04 100%)", accent: "#FBBF24", accentRgb: "251,191,36",   shortTitle: "Ciencias Sociales II",       glow: "rgba(251,191,36,0.25)" },
  "CS-III":  { emoji: "🏛️", bg: "linear-gradient(135deg,#1a1205 0%,#201605 50%,#271a04 100%)", accent: "#FBBF24", accentRgb: "251,191,36",   shortTitle: "Ciencias Sociales III",      glow: "rgba(251,191,36,0.25)" },

  // ── Pensamiento Filosófico y Humanidades (sems 1-3) — rojo terracota ──────────
  "PFH-I":   { emoji: "⚖️",  bg: "linear-gradient(135deg,#1a0505 0%,#200808 50%,#280a0a 100%)", accent: "#F87171", accentRgb: "248,113,113",  shortTitle: "Pensamiento Filosófico I",   glow: "rgba(248,113,113,0.25)" },
  "PFH-II":  { emoji: "⚖️",  bg: "linear-gradient(135deg,#1a0505 0%,#200808 50%,#280a0a 100%)", accent: "#F87171", accentRgb: "248,113,113",  shortTitle: "Pensamiento Filosófico II",  glow: "rgba(248,113,113,0.25)" },
  "PFH-III": { emoji: "⚖️",  bg: "linear-gradient(135deg,#1a0505 0%,#200808 50%,#280a0a 100%)", accent: "#F87171", accentRgb: "248,113,113",  shortTitle: "Pensamiento Filosófico III", glow: "rgba(248,113,113,0.25)" },

  // ── CNEYT — Ciencias Naturales, Experimentales y Tecnología (sems 1-6) — cian ─
  "CNEYT-I":   { emoji: "🔬", bg: "linear-gradient(135deg,#05131a 0%,#071820 50%,#091e28 100%)", accent: "#22D3EE", accentRgb: "34,211,238",   shortTitle: "Ciencias y Tecnología I",   glow: "rgba(34,211,238,0.25)" },
  "CNEYT-II":  { emoji: "🔬", bg: "linear-gradient(135deg,#05131a 0%,#071820 50%,#091e28 100%)", accent: "#22D3EE", accentRgb: "34,211,238",   shortTitle: "Ciencias y Tecnología II",  glow: "rgba(34,211,238,0.25)" },
  "CNEYT-III": { emoji: "🔬", bg: "linear-gradient(135deg,#05131a 0%,#071820 50%,#091e28 100%)", accent: "#22D3EE", accentRgb: "34,211,238",   shortTitle: "Ciencias y Tecnología III", glow: "rgba(34,211,238,0.25)" },
  "CNEYT-IV":  { emoji: "🔬", bg: "linear-gradient(135deg,#05131a 0%,#071820 50%,#091e28 100%)", accent: "#22D3EE", accentRgb: "34,211,238",   shortTitle: "Ciencias y Tecnología IV",  glow: "rgba(34,211,238,0.25)" },
  "CNEYT-V":   { emoji: "🔬", bg: "linear-gradient(135deg,#05131a 0%,#071820 50%,#091e28 100%)", accent: "#22D3EE", accentRgb: "34,211,238",   shortTitle: "Ciencias y Tecnología V",   glow: "rgba(34,211,238,0.25)" },
  "CNEYT-VI":  { emoji: "🔬", bg: "linear-gradient(135deg,#05131a 0%,#071820 50%,#091e28 100%)", accent: "#22D3EE", accentRgb: "34,211,238",   shortTitle: "Ciencias y Tecnología VI",  glow: "rgba(34,211,238,0.25)" },

  // ── Conciencia Histórica (sems 4-6) — lavanda/fuchsia ────────────────────────
  "CH-I":   { emoji: "🏺", bg: "linear-gradient(135deg,#1a0520 0%,#220830 50%,#2a0a3d 100%)", accent: "#D8B4FE", accentRgb: "216,180,254",  shortTitle: "Conciencia Histórica I",     glow: "rgba(216,180,254,0.25)" },
  "CH-II":  { emoji: "🏺", bg: "linear-gradient(135deg,#1a0520 0%,#220830 50%,#2a0a3d 100%)", accent: "#D8B4FE", accentRgb: "216,180,254",  shortTitle: "Conciencia Histórica II",    glow: "rgba(216,180,254,0.25)" },
  "CH-III": { emoji: "🏺", bg: "linear-gradient(135deg,#1a0520 0%,#220830 50%,#2a0a3d 100%)", accent: "#D8B4FE", accentRgb: "216,180,254",  shortTitle: "Conciencia Histórica III",   glow: "rgba(216,180,254,0.25)" },
};

export const UAC_CONFIG_FALLBACK: UACVisualConfig = {
  emoji: "📚",
  bg: "linear-gradient(135deg,#0B2545 0%,#0E2D56 100%)",
  accent: "#7DD3FC",
  accentRgb: "125,211,252",
  shortTitle: "",
  glow: "rgba(125,211,252,0.25)",
};

export function getUACConfig(codigo: string): UACVisualConfig {
  return UAC_CONFIG[codigo] ?? UAC_CONFIG_FALLBACK;
}

/** Imagen ilustrativa por recurso sociocognitivo (archivos reales en public/rsc/). */
const RSC_IMAGE: Record<string, string> = {
  "RSC-LC": "/rsc/lc.webp",
  "RSC-PM": "/rsc/pm.webp",
  "RSC-IN": "/rsc/in.webp",
  "RSC-CD": "/rsc/cd.webp",
  "RSC-CH": "/rsc/ch.webp",
  "RSC-CS": "/rsc/cs.webp",
  "RSC-PFH": "/rsc/hum.webp",
  "RSC-CNEYT": "/rsc/cneyt.webp",
};

/** Ruta de la imagen ilustrativa de una UAC, o undefined si no hay. */
export function getUACImagen(codigo: string): string | undefined {
  const uac = getUACPorCodigo(codigo);
  return uac?.recursoCodigo ? RSC_IMAGE[uac.recursoCodigo] : undefined;
}

export const TIPO_ICON: Record<string, string> = {
  lectura:              "fa-book",
  quiz_multiple_opcion: "fa-circle-dot",
  quiz_verdadero_falso: "fa-toggle-on",
  fill_blanks:          "fa-pen-line",
  ejercicio_matematico: "fa-calculator",
  reflexion_escrita:    "fa-feather-pointed",
  video_con_preguntas:  "fa-video",
  infografia:           "fa-chart-pie",
  debate_estructurado:  "fa-comments",
  simulacion:           "fa-flask",
  glosario_interactivo: "fa-spell-check",
  autoevaluacion:       "fa-clipboard-check",
};
