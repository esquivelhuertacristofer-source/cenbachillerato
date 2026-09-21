/**
 * Ficha teórica — habitos-comparaciones-ingles (IN-III-P04, Inglés III).
 *
 * El marco teórico es VERBATIM de la lectura A1 «Habits and Comparisons in
 * English», partida en párrafos. El glosario recoge los términos de A5 y añade
 * las dos estructuras que este laboratorio trabaja y que A5 no nombra: la
 * igualdad «as … as» y «would rather».
 *
 * Los `conceptos` son las ideas centrales de ESTE laboratorio —las cuatro
 * reglas de formación, la diferencia entre comparar dos cosas y señalar el
 * extremo de una serie, la igualdad y las tres maneras de decir que algo se
 * prefiere— y se usan además para armar el capítulo «Prepárate» de la
 * Expedición.
 *
 * NOTA: el callout «info» que A1 trae en la base de datos habla de los MOOCs de
 * la UNAM en programación y ciencia de datos, tema ajeno a esta progresión de
 * inglés. Se omite a propósito, por fidelidad al tema.
 */
import type { FichaTeoricaData } from "./_ficha";

export const HABITOS_COMPARACIONES_FICHA: FichaTeoricaData = {
  ancla: "IN-III-P04-A1 · Habits and Comparisons in English",
  marcoTeorico: [
    "At A2 level, we combine (combinamos) comparatives, frequency adverbs (adverbios de frecuencia), and the expression «like + verb-ing» to talk about habits and preferences.",
    "Comparatives and superlatives (recordatorio): • One syllable: big → bigger → the biggest • Two+ syllables: interesting → more interesting → the most interesting • Irregular: good → better → the best / bad → worse → the worst",
    "Example sentences: • Oaxaca is more colorful than Monterrey, but Mexico City is the most visited city in the country. • Walking is healthier than driving, and cycling is the healthiest option.",
    "Like + verb-ing — expressing what we enjoy: • I like reading (me gusta leer) historical novels. • She doesn't like getting up (no le gusta levantarse) early. • Do you like cooking (te gusta cocinar)? — Yes, I love it!",
    "Frequency adverbs — how often we do things: always (siempre) 100%, usually/normally (normalmente) 80%, often/frequently (frecuentemente) 70%, sometimes (a veces) 50%, rarely/seldom (rara vez) 20%, never (nunca) 0%.",
    "Position: frequency adverbs go BEFORE the main verb but AFTER 'be': • She always drinks tea in the morning. (before main verb) • He is usually late for class. (after 'be')",
    "Combining structures: • I usually like cooking at home because it is cheaper than eating out. • My brother never likes doing exercise, but he is always the fastest runner in his group — it's a paradox!",
  ],
  objetivos: [
    "Decidir qué regla le toca a cada adjetivo (-er/-est, -ier/-iest, more/the most o irregular) y construir con ella el comparativo y el superlativo, sin caer en «more easier».",
    "Leer una tabla de datos y elegir la comparación en inglés que esos datos sostienen, descartando la que suena bien pero dice otra cosa.",
    "Distinguir cuándo toca comparativo (dos cosas) y cuándo superlativo (el extremo de tres o más).",
    "Expresar igualdad con «as … as» y negarla con «not as … as», y saber a qué comparativo equivale esa negación.",
    "Expresar preferencias con prefer … to, would rather … than y like … better than, respetando la forma del verbo que cada una exige detrás.",
  ],
  materiales: [
    { nombre: "Siete adjetivos", detalle: "fast, big, healthy, easy, interesting, good, bad — uno por cada regla de formación.", icono: "fa-stairs" },
    { nombre: "Seis tablas de datos", detalle: "Rutas, teléfonos, clima, frecuencia de gimnasio, libros leídos y precios de café.", icono: "fa-table" },
    { nombre: "El mazo de trampas", detalle: "more easier, gooder, more better, the most big, more oftener… las formas que todo el mundo produce.", icono: "fa-triangle-exclamation" },
    { nombre: "as … as / not as … as", detalle: "La igualdad y su negación, con el adjetivo siempre en forma base.", icono: "fa-equals" },
    { nombre: "Tres estructuras de preferencia", detalle: "prefer + to, would rather + than, like + better than.", icono: "fa-heart" },
  ],
  conceptos: [
    { termino: "Comparative", definicion: "Compara DOS cosas: faster than, more interesting than. Siempre lleva «than» y nunca junta -er con more." },
    { termino: "Superlative", definicion: "Señala el extremo de TRES o más: the fastest, the most interesting. Siempre lleva «the» delante." },
    { termino: "Short adjective", definicion: "De una sílaba: se le pega -er y -est. fast → faster → the fastest. Si termina en consonante-vocal-consonante, la consonante se duplica (big → bigger)." },
    { termino: "Long adjective", definicion: "De dos o más sílabas: no cambia, se le pone more o the most delante. interesting → more interesting → the most interesting." },
    { termino: "Adjective in -y", definicion: "La -y se convierte en -i: healthy → healthier → the healthiest; easy → easier → the easiest." },
    { termino: "Irregular forms", definicion: "No siguen ninguna regla: good → better → the best; bad → worse → the worst. No existen «gooder» ni «more better»." },
    { termino: "as … as", definicion: "Igualdad: el adjetivo va en forma BASE entre los dos «as». Coffee at Café Luna is as expensive as coffee at Café Sol." },
    { termino: "not as … as", definicion: "Niega la igualdad y deja a la primera cosa por debajo. «Route 2 is not as fast as Route 1» equivale a «Route 1 is faster than Route 2»." },
    { termino: "prefer … to", definicion: "Preferir una cosa sobre otra: I prefer cooking to eating out. La palabra que une es «to», nunca «than»." },
    { termino: "would rather … than", definicion: "Preferiría, aquí y ahora: verbo en forma base a los dos lados. I'd rather walk than take the bus." },
  ],
  glosario: [
    { termino: "comparative", definicion: "Para comparar dos cosas (revisión): taller than / more comfortable than." },
    { termino: "superlative", definicion: "Para el extremo de una serie: the fastest / the most popular." },
    { termino: "the best / the worst", definicion: "Superlativos irregulares de good/bad." },
    { termino: "like + verb-ing", definicion: "Expresar gustos: I like coffee / I like swimming." },
    { termino: "prefer…to", definicion: "Preferir una cosa sobre otra: I prefer cycling to running." },
    { termino: "as … as", definicion: "Igualdad: las dos cosas al mismo nivel, con el adjetivo en forma base." },
    { termino: "would rather", definicion: "Preferiría: + verbo en forma base + than + verbo en forma base." },
  ],
  aplicaciones: [
    "A5 (verbatim), actividad final del glosario: «Escribe 5 oraciones sobre tus hábitos y preferencias. Usa al menos 1 superlativo, 1 comparativo y 2 adverbios de frecuencia.»",
    "A6 (verbatim): «Football is ___ sport in my school (popular — superlative). I think cycling is ___ running (healthy — comparative).» El superlativo de un adjetivo largo es the most popular; el comparativo de healthy, healthier than.",
    "A7 (verbatim), autoevaluación: «Formo comparativos correctos (-er than / more...than)», «Formo superlativos correctos (the -est / the most)» y «Expreso preferencias con 'like + noun/verb-ing' y 'prefer...to'».",
    "Comparar hábitos y datos —no personas— es lo que hace útil esta gramática: dos rutas, dos teléfonos, dos climas, dos frecuencias. Los datos deciden la oración.",
  ],
  fuente: "CEN Bachillerato — Inglés III, progresión 4 (IN-III-P04)",
};
