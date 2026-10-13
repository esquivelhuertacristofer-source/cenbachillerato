/**
 * Modelo 3D «élite» del dogma central (CNEYT-VI-P04): constantes geométricas de
 * la doble hélice B y textos del modelo. Matemática pura, SIN three (lo importa
 * también el laboratorio, que viaja al Worker).
 *
 * La biología curricular sigue en `adn-dogma-data.ts` (no se toca: la reutilizan
 * mutaciones y biotecnología). Aquí solo vive lo que el modelo 3D necesita.
 */

import type { Base } from "./adn-dogma-data";

/* ── Doble hélice B a escala (1 unidad ≈ 0.91 nm) ─────────────────────────
 * ADN-B real: radio ~1 nm, subida 0.34 nm por par, 10.5 pares por vuelta
 * (paso ≈ 3.57 nm), hélice DEXTRÓGIRA. Las dos hebras no están a 180°: los
 * azúcares de un par quedan del mismo lado, y eso abre un surco MAYOR y uno
 * MENOR. Con 140° de separación el surco menor ocupa ~39 % de la vuelta. */
export const B_RADIO = 1.1;
export const B_SUBIDA = 0.374; // 0.34 nm × 1.1
export const B_PB_VUELTA = 10.5;
export const B_GIRO = (Math.PI * 2) / B_PB_VUELTA; // rad por par de bases
export const B_SURCO = (140 * Math.PI) / 180; // separación angular de las hebras

/** ADN que rodea al gen: el gen nunca está solo en el cromosoma. El flanco
 *  izquierdo lleva una caja TATA (promotor) en la hebra codificante. */
export const FLANCO_IZQ = "GCTATAAAGG";
export const FLANCO_DER = "CTAGCAGTCCAG";

/** Longitud de cada fragmento de Okazaki en el modelo (en la célula son de
 *  100–200 nucleótidos en eucariontes y 1000–2000 en bacterias). */
export const OKAZAKI_PB = 4;

/** Anticodón del ARNt que reconoce un codón del ARNm (A↔U, G↔C), escrito
 *  alineado con el codón (3'→5'). AUG → UAC. */
export function anticodon(codon: string): string {
  return codon
    .split("")
    .map((b) => (b === "A" ? "U" : b === "U" ? "A" : b === "G" ? "C" : b === "C" ? "G" : b))
    .join("");
}

/** ¿Purina (dos anillos: A, G) o pirimidina (un anillo: T, C, U)? */
export function esPurina(b: Base): boolean {
  return b === "A" || b === "G";
}

/** Colores de las hebras en la escena (leyenda del panel). */
export const HEBRA_COLOR = {
  codificante: "#8fbbe3",
  molde: "#b9a8e6",
  nueva: "#5eead4",
  cebador: "#fb923c",
  arn: "#f472b6",
  peptido: "#e2e8f0",
} as const;

/** Lo que el modelo 3D muestra, etapa por etapa (texto propio del laboratorio). */
export const MODELO_3D: { titulo: string; texto: string }[] = [
  {
    titulo: "La doble hélice",
    texto:
      "Hélice dextrógira de ~10.5 pares de bases por vuelta y 2 nm de diámetro. Como los azúcares de cada par quedan del mismo lado, entre las hebras se forman un surco mayor y un surco menor. Las purinas (A, G: dos anillos) son placas más largas que las pirimidinas (T, C, U: un anillo); por eso cada par mide lo mismo. Los puentes de hidrógeno brillan: 2 en A–T y 3 en G–C.",
  },
  {
    titulo: "Replicación: la horquilla",
    texto:
      "La helicasa (anillo de seis piezas) abre la doble hélice. Como la ADN polimerasa solo sintetiza en dirección 5'→3', una hebra nueva crece continua hacia la horquilla (hebra adelantada) y la otra se fabrica hacia atrás, en fragmentos de Okazaki que empiezan con un cebador de ARN (naranja). Después se reemplaza el cebador y la ligasa sella cada hueco. El anillo que abraza al ADN hijo es la abrazadera deslizante que mantiene a la polimerasa pegada.",
  },
  {
    titulo: "Transcripción: la burbuja",
    texto:
      "La ARN polimerasa se une al promotor (caja TATA), abre una burbuja de ~12 pares y lee la hebra molde 3'→5'. Dentro de la burbuja el ARN recién hecho forma un híbrido corto con el ADN; luego se desprende y sale como una hebra sencilla 5'→3', con uracilo (U) donde el ADN tenía timina (T). Detrás de la enzima, el ADN se vuelve a cerrar.",
  },
  {
    titulo: "Traducción: el ribosoma",
    texto:
      "El ribosoma tiene una subunidad menor (lee el ARNm) y una mayor (une aminoácidos). Cada ARNt entra al sitio A si su anticodón es complementario al codón; la cadena pasa del ARNt del sitio P al aminoácido nuevo (enlace peptídico) y el ribosoma avanza un codón: el ARNt vacío sale por el sitio E. La cadena sale por un túnel y se pliega. En el codón de paro entra un factor de liberación y la proteína se suelta.",
  },
];
