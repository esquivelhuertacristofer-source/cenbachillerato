/**
 * Datos para el laboratorio de Semejanza de triángulos / medición indirecta
 * (PM-III-P05-A2, "Mido una altura de forma indirecta usando semejanza";
 * progresión 5). Módulo de DATOS PUROS (sin three, sin react): lo comparten el
 * shell de UI (LabSemejanza.tsx) y la escena 3D (SemejanzaScene.tsx).
 *
 * Idea pedagógica (MCCEMS 2025 — PM-III P5: "Aplica semejanza y congruencia de
 * triángulos en la resolución de problemas geométricos"):
 * los rayos del Sol llegan PARALELOS, así que un objeto y su sombra forman un
 * triángulo rectángulo con EL MISMO ángulo que cualquier otro objeto y su sombra
 * al mismo instante. Por el criterio AA esos dos triángulos son SEMEJANTES, y sus
 * lados son proporcionales:
 *
 *     altura_objeto / sombra_objeto = altura_referencia / sombra_referencia
 *
 * De ahí se despeja una altura inalcanzable (un árbol, un poste, una torre)
 * midiendo solo sombras y una estatura conocida. La razón de semejanza k es el
 * cociente entre lados correspondientes (las áreas van con k², los volúmenes con
 * k³). Lo notable: la altura calculada y k NO dependen del ángulo del Sol —al
 * bajar el Sol las dos sombras se alargan a la par y la proporción se conserva.
 *
 * Caso verbatim de la actividad: Sofía (1.60 m) proyecta 0.80 m de sombra; la
 * torre del reloj proyecta 12.40 m → H = 24.8 m, k = 15.5; un monumento con
 * sombra de 3.2 m mide 6.4 m.
 */

/* ── Controles ────────────────────────────────────────────────────────── */
// Ángulo de elevación del Sol (grados). Más bajo el Sol → sombras más largas.
export const ANG_MIN = 28;
export const ANG_MAX = 80;
export const ANG_STEP = 1;
export const ANG_DEFAULT = 58;

// Altura de la persona de referencia (m), la única medida directamente.
export const HREF_MIN = 1.2;
export const HREF_MAX = 2.0;
export const HREF_STEP = 0.05;
export const HREF_DEFAULT = 1.6;

// Altura real del objeto a medir (m) — la torre. En la práctica es la incógnita;
// aquí la fijamos para construir la escena y luego comprobamos que el método
// indirecto la recupera exactamente a partir de las sombras.
export const HOBJ_MIN = 5;
export const HOBJ_MAX = 40;
export const HOBJ_STEP = 0.2;
export const HOBJ_DEFAULT = 24.8;

/* ── Caso verbatim de la actividad (PM-III-P05-A2) ────────────────────── */
export const CASO = {
  hRef: 1.6,
  sombraRef: 0.8,
  hObj: 24.8,
  sombraObj: 12.4,
  k: 15.5,
  ang: 63.4349, // arctan(1.60 / 0.80): produce sombras de 0.80 m y 12.40 m
  monSombra: 3.2,
  monH: 6.4,
} as const;

/* ── Modelo geométrico ────────────────────────────────────────────────── */
const rad = (deg: number): number => (deg * Math.PI) / 180;

/** Longitud de la sombra de un objeto de altura h con el Sol a `angDeg` grados. */
export const sombra = (h: number, angDeg: number): number => h / Math.tan(rad(angDeg));

/** Razón de semejanza k entre el triángulo del objeto y el de la referencia. */
export const razonK = (hObj: number, hRef: number): number => hObj / hRef;

/** Altura del objeto despejada por la proporción (medición indirecta). */
export const alturaIndirecta = (hRef: number, sombraObj: number, sombraRef: number): number =>
  hRef * (sombraObj / sombraRef);

/* ── Criterios (para el panel lateral) ────────────────────────────────── */
export interface Criterio {
  sigla: string;
  desc: string;
}

export const CRITERIOS_SEMEJANZA: Criterio[] = [
  { sigla: "AA", desc: "dos pares de ángulos iguales (el caso de las sombras)" },
  { sigla: "LLL prop.", desc: "los tres pares de lados son proporcionales" },
  { sigla: "LAL prop.", desc: "dos pares de lados proporcionales y el ángulo entre ellos igual" },
];

export const CRITERIOS_CONGRUENCIA: Criterio[] = [
  { sigla: "LLL", desc: "los tres pares de lados iguales" },
  { sigla: "LAL", desc: "dos lados y el ángulo comprendido" },
  { sigla: "ALA", desc: "dos ángulos y el lado comprendido" },
];

/* ── Formato ──────────────────────────────────────────────────────────── */
/** Longitud en metros (es-MX), hasta 2 decimales. */
export const fmtM = (m: number): string =>
  m.toLocaleString("es-MX", { maximumFractionDigits: 2, minimumFractionDigits: 0 }).replace("-", "−") + " m";

/** Número sin unidad (es-MX), `dec` decimales. */
export const fmtNum = (n: number, dec = 2): string =>
  n.toLocaleString("es-MX", { maximumFractionDigits: dec, minimumFractionDigits: 0 }).replace("-", "−");
