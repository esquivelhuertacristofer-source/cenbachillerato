/** Color system for each RSC (Recurso Sociocognitivo) area. */
export interface AreaColor {
  hex: string;
  rgba: string;
  faIcon: string;
  gradient: string;
}

export const RSC_COLORS: Record<string, AreaColor> = {
  "RSC-LC": {
    hex: "#38BDF8",
    rgba: "56,189,248",
    faIcon: "fa-book-open",
    gradient: "linear-gradient(135deg, #0B2545 0%, #0d2f60 60%, #0b3366 100%)",
  },
  "RSC-PM": {
    hex: "#FB923C",
    rgba: "251,146,60",
    faIcon: "fa-square-root-variable",
    gradient: "linear-gradient(135deg, #0B2545 0%, #1a1408 60%, #1f1608 100%)",
  },
  "RSC-IN": {
    hex: "#A78BFA",
    rgba: "167,139,250",
    faIcon: "fa-globe",
    gradient: "linear-gradient(135deg, #0B2545 0%, #160d35 60%, #1a1040 100%)",
  },
  "RSC-CD": {
    hex: "#34D399",
    rgba: "52,211,153",
    faIcon: "fa-microchip",
    gradient: "linear-gradient(135deg, #0B2545 0%, #071a14 60%, #081e16 100%)",
  },
  "RSC-CS": {
    hex: "#FBBF24",
    rgba: "251,191,36",
    faIcon: "fa-building-columns",
    gradient: "linear-gradient(135deg, #0B2545 0%, #1a1508 60%, #201904 100%)",
  },
  "RSC-PFH": {
    hex: "#F87171",
    rgba: "248,113,113",
    faIcon: "fa-scale-balanced",
    gradient: "linear-gradient(135deg, #0B2545 0%, #1a0a0a 60%, #200808 100%)",
  },
  "RSC-CNEYT": {
    hex: "#22D3EE",
    rgba: "34,211,238",
    faIcon: "fa-microscope",
    gradient: "linear-gradient(135deg, #0B2545 0%, #071820 60%, #081d24 100%)",
  },
  "RSC-CH": {
    hex: "#D97706",
    rgba: "217,119,6",
    faIcon: "fa-landmark",
    gradient: "linear-gradient(135deg, #0B2545 0%, #1a1100 60%, #201300 100%)",
  },
};

const FALLBACK: AreaColor = {
  hex: "#7DD3FC",
  rgba: "125,211,252",
  faIcon: "fa-graduation-cap",
  gradient: "linear-gradient(135deg, #0B2545 0%, #0E2D56 100%)",
};

export function getRSCColor(rscCodigo: string | null | undefined): AreaColor {
  return RSC_COLORS[rscCodigo ?? ""] ?? FALLBACK;
}

/** Icon label for activity tipo_codigo */
export const TIPO_CONFIG: Record<string, { faIcon: string; label: string; color: string }> = {
  lectura:                { faIcon: "fa-book",            label: "Lectura",            color: "#38BDF8" },
  quiz_multiple_opcion:   { faIcon: "fa-circle-dot",      label: "Quiz",               color: "#A78BFA" },
  quiz_verdadero_falso:   { faIcon: "fa-toggle-on",       label: "V o F",              color: "#A78BFA" },
  fill_blanks:            { faIcon: "fa-pen-line",        label: "Rellena huecos",     color: "#34D399" },
  ejercicio_matematico:   { faIcon: "fa-calculator",      label: "Ejercicio",          color: "#FB923C" },
  reflexion_escrita:      { faIcon: "fa-feather-pointed", label: "Reflexión",          color: "#F87171" },
  video_con_preguntas:    { faIcon: "fa-video",           label: "Video",              color: "#FBBF24" },
  infografia:             { faIcon: "fa-chart-pie",       label: "Infografía",         color: "#22D3EE" },
  debate_estructurado:    { faIcon: "fa-comments",        label: "Debate",             color: "#D97706" },
  simulacion:             { faIcon: "fa-flask",           label: "Simulación",         color: "#34D399" },
  glosario_interactivo:   { faIcon: "fa-spell-check",     label: "Glosario",           color: "#7DD3FC" },
  autoevaluacion:         { faIcon: "fa-clipboard-check", label: "Autoevaluación",     color: "#FB923C" },
};

export function getTipoConfig(tipo: string) {
  return TIPO_CONFIG[tipo] ?? { faIcon: "fa-star", label: tipo, color: "#7DD3FC" };
}
