/**
 * Ficha teórica — lectura-campo-ingles (IN-V-P05, Inglés V).
 *
 * El marco teórico es VERBATIM de la lectura A1 «Reading strategies for B1:
 * skimming, scanning y lectura detallada», partida en párrafos. Los
 * `conceptos` son las seis frases del glosario A5 con su definición verbatim.
 * El `glosario` reúne los términos cortos con definiciones verbatim de A1 (las
 * tres estrategias, hecho y opinión) y de la retroalimentación del reactivo 2
 * de A4 (topic sentence).
 */
import type { FichaTeoricaData } from "./_ficha";

export const LECTURA_CAMPO_INGLES_FICHA: FichaTeoricaData = {
  ancla: "IN-V-P05-A1 · Reading strategies for B1: skimming, scanning y lectura detallada",
  marcoTeorico: [
    "Leer en inglés a nivel B1 no significa entender cada palabra — significa usar estrategias inteligentes para extraer la información que necesitas. Las tres estrategias principales son: skimming, scanning y lectura detallada.",
    "Skimming significa leer rápidamente un texto para identificar su tema principal y estructura, sin leer cada palabra. Es útil cuando tienes poco tiempo o cuando necesitas decidir si un texto es relevante antes de leerlo con detalle.",
    "Cómo hacer skimming: • Lee el título y los subtítulos (headings) • Lee el primer y último párrafo completos • Lee la primera oración de cada párrafo intermedio (topic sentence) • Mira imágenes, gráficos y palabras en negrita o cursiva",
    "Scanning significa mover los ojos rápidamente por el texto buscando información específica: un nombre, una fecha, un número, una cifra o un término clave. No lees todo — solo buscas lo que necesitas.",
    "Trucos para scanning eficaz: • Sabe exactamente qué estás buscando ANTES de empezar • Mueve los ojos en zigzag o en \"S\" por el texto • Para cuando encuentres lo que buscas — no sigas leyendo",
    "La lectura detallada (close reading) implica leer con atención para entender argumentos, matices e ideas complejas. Se usa para textos académicos, instrucciones importantes o pasajes que necesitas analizar.",
    "Cómo identificar HECHOS vs. OPINIONES: • HECHO (fact): puede verificarse con datos o evidencia objetiva. Ejemplo: \"Mexico has over 130 million inhabitants.\" (Esto se puede comprobar con el censo.) • OPINIÓN (opinion): refleja el punto de vista de alguien. Ejemplo: \"Mexico City is the best place to study in Latin America.\" (Esto varía según la persona.)",
    "• Palabras que señalan opinión: believe, think, argue, suggest, in my view, according to [person] • Palabras que señalan hechos: show, prove, demonstrate, according to [official data/study]",
  ],
  objetivos: [
    "Usar skimming (títulos y primeras oraciones) para saber de qué trata un texto antes de leerlo completo.",
    "Usar scanning para encontrar un número, un nombre o una palabra clave sin leer todo.",
    "Leer con detalle la oración que decide, atendiendo a conectores como «However».",
    "Deducir por el contexto el significado de palabras técnicas y de falsos cognados.",
    "Distinguir hechos de opiniones por sus palabras señal y dar la idea principal de un texto.",
  ],
  materiales: [
    { nombre: "Cuatro textos breves de campos distintos", detalle: "Aviso de laboratorio, aviso de biblioteca, instructivo de invernadero y folleto turístico (ficticios).", icono: "fa-file-lines" },
    { nombre: "Reloj de lectura", detalle: "45 segundos por texto: cada herramienta cuesta tiempo (simulación).", icono: "fa-stopwatch" },
    { nombre: "Herramientas de lectura", detalle: "Skimming, lupa de scanning, lectura detallada y pista de contexto.", icono: "fa-magnifying-glass" },
    { nombre: "Texto de práctica de A1", detalle: "La biodiversidad en México, para el boletín y su verificación.", icono: "fa-leaf" },
  ],
  conceptos: [
    { termino: "The main idea of the text is...", definicion: "A phrase used to introduce the central message or topic of a text when summarizing or analyzing it. Equivalent to 'the text is mainly about...'" },
    { termino: "According to the author / According to the text...", definicion: "A citation phrase used to attribute an idea to the source text without copying it verbatim. Essential for academic writing and reading responses." },
    { termino: "However / Nevertheless / On the other hand...", definicion: "Contrast connectors used in texts to introduce opposing ideas, counterarguments, or contrasting information. Recognizing them helps comprehension of complex texts." },
    { termino: "In other words, / That is to say...", definicion: "Paraphrasing markers used in texts to restate a complex idea in simpler terms. Useful for both comprehension and for writing summaries." },
    { termino: "I find this text / argument... because...", definicion: "An opinion structure for evaluating a text. 'I find [noun] [adjective] because [reason]' expresses a personal evaluation supported by reasoning." },
    { termino: "To sum up / In conclusion / To summarize...", definicion: "Summary markers used at the end of a text or paragraph to restate the most important points. They signal that the writer is closing or concluding." },
  ],
  glosario: [
    { termino: "skimming", definicion: "Leer rápido para captar la idea general." },
    { termino: "scanning", definicion: "Buscar un dato concreto (una fecha, un nombre o una cifra) sin leer todo el texto." },
    { termino: "close reading", definicion: "Lectura detallada: leer con atención para entender argumentos, matices e ideas complejas." },
    { termino: "topic sentence", definicion: "The topic sentence introduces the main idea of a paragraph and is typically the first sentence." },
    { termino: "fact", definicion: "Puede verificarse con datos o evidencia objetiva." },
    { termino: "opinion", definicion: "Refleja el punto de vista de alguien." },
  ],
  aplicaciones: [
    "Skimming es leer rápido para captar la idea general; scanning es buscar un dato concreto (una fecha, un nombre o una cifra) sin leer todo el texto.",
  ],
  fuente: "Material CEN Bachillerato — IN-V (A2+/B1)",
};
