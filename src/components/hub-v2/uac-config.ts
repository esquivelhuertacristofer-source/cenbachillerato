export interface UACVisualConfig {
  emoji: string;
  bg: string;
  accent: string;
  accentRgb: string;
  shortTitle: string;
  glow: string;
}

export const UAC_CONFIG: Record<string, UACVisualConfig> = {
  "LC-I":    { emoji: "📖", bg: "linear-gradient(135deg,#0B2545 0%,#0d3066 50%,#0b3a80 100%)", accent: "#38BDF8", accentRgb: "56,189,248",   shortTitle: "Lengua y Comunicación I",    glow: "rgba(56,189,248,0.25)" },
  "LC-II":   { emoji: "📖", bg: "linear-gradient(135deg,#0B2545 0%,#0d3066 50%,#0b3a80 100%)", accent: "#38BDF8", accentRgb: "56,189,248",   shortTitle: "Lengua y Comunicación II",   glow: "rgba(56,189,248,0.25)" },
  "LC-III":  { emoji: "📖", bg: "linear-gradient(135deg,#0B2545 0%,#0d3066 50%,#0b3a80 100%)", accent: "#38BDF8", accentRgb: "56,189,248",   shortTitle: "Lengua y Comunicación III",  glow: "rgba(56,189,248,0.25)" },
  "PM-I":    { emoji: "🧮", bg: "linear-gradient(135deg,#1a0e05 0%,#251604 50%,#2d1a06 100%)", accent: "#FB923C", accentRgb: "251,146,60",   shortTitle: "Pensamiento Matemático I",   glow: "rgba(251,146,60,0.25)" },
  "PM-II":   { emoji: "🧮", bg: "linear-gradient(135deg,#1a0e05 0%,#251604 50%,#2d1a06 100%)", accent: "#FB923C", accentRgb: "251,146,60",   shortTitle: "Pensamiento Matemático II",  glow: "rgba(251,146,60,0.25)" },
  "PM-III":  { emoji: "🧮", bg: "linear-gradient(135deg,#1a0e05 0%,#251604 50%,#2d1a06 100%)", accent: "#FB923C", accentRgb: "251,146,60",   shortTitle: "Pensamiento Matemático III", glow: "rgba(251,146,60,0.25)" },
  "IN-I":    { emoji: "🌐", bg: "linear-gradient(135deg,#0e0820 0%,#160d35 50%,#1a0f42 100%)", accent: "#A78BFA", accentRgb: "167,139,250",  shortTitle: "Inglés I",                   glow: "rgba(167,139,250,0.25)" },
  "IN-II":   { emoji: "🌐", bg: "linear-gradient(135deg,#0e0820 0%,#160d35 50%,#1a0f42 100%)", accent: "#A78BFA", accentRgb: "167,139,250",  shortTitle: "Inglés II",                  glow: "rgba(167,139,250,0.25)" },
  "IN-III":  { emoji: "🌐", bg: "linear-gradient(135deg,#0e0820 0%,#160d35 50%,#1a0f42 100%)", accent: "#A78BFA", accentRgb: "167,139,250",  shortTitle: "Inglés III",                 glow: "rgba(167,139,250,0.25)" },
  "CD-I":    { emoji: "💻", bg: "linear-gradient(135deg,#06150f 0%,#081a12 50%,#0a2016 100%)", accent: "#34D399", accentRgb: "52,211,153",   shortTitle: "Cultura Digital I",          glow: "rgba(52,211,153,0.25)" },
  "CS-I":    { emoji: "🏛️", bg: "linear-gradient(135deg,#1a1205 0%,#201605 50%,#271a04 100%)", accent: "#FBBF24", accentRgb: "251,191,36",   shortTitle: "Ciencias Sociales I",        glow: "rgba(251,191,36,0.25)" },
  "PFH-I":   { emoji: "⚖️",  bg: "linear-gradient(135deg,#1a0505 0%,#200808 50%,#280a0a 100%)", accent: "#F87171", accentRgb: "248,113,113",  shortTitle: "Pensamiento Filosófico I",   glow: "rgba(248,113,113,0.25)" },
  "CNEYT-I": { emoji: "🔬", bg: "linear-gradient(135deg,#05131a 0%,#071820 50%,#091e28 100%)", accent: "#22D3EE", accentRgb: "34,211,238",   shortTitle: "Ciencias y Tecnología I",   glow: "rgba(34,211,238,0.25)" },
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
