/**
 * Datos de la Ficha Teórica del laboratorio "Mutaciones: tipos, causas y
 * consecuencias" (CNEYT-VI-P06).
 *
 * Contenido VERBATIM de las actividades ancla de CNEYT-VI-P06:
 *   - Marco teórico: lectura A1 «Mutaciones: tipos, causas y consecuencias»
 *     (4 párrafos verbatim).
 *   - Glosario: glosario interactivo A5 «Glosario — Mutaciones y variabilidad
 *     genética» (6 términos verbatim).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const MUTACIONES_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-VI · P06 · A1 — Mutaciones: tipos, causas y consecuencias",

  // Marco teórico — VERBATIM de la lectura A1.
  marcoTeorico: [
    "Una mutación es un cambio en la secuencia del ADN. Las mutaciones génicas afectan uno o pocos nucleótidos: sustitución (un nucleótido reemplaza a otro), inserción o deleción (se añade o elimina un nucleótido, causando desplazamiento del marco de lectura). Las mutaciones cromosómicas afectan la estructura o el número de cromosomas: deleción, duplicación, inversión, translocación y aneuploidía (ej. trisomía 21, síndrome de Down).",
    "Los mutágenos son agentes que aumentan la tasa de mutación. Los físicos incluyen la radiación ionizante (rayos X, gamma) y la radiación UV (forma dímeros de timina). Los químicos incluyen el humo del tabaco (benzopirenos, nitrosaminas), el formaldehído y los alquilantes. Los biológicos incluyen ciertos virus (VPH) y transposones.",
    "Las mutaciones somáticas ocurren en células del cuerpo y no se heredan a la descendencia; pueden acumular cambios en genes reguladores del ciclo celular y originar cáncer. Las mutaciones germinales ocurren en células reproductoras y pueden transmitirse a la siguiente generación, siendo la fuente de variabilidad genética en las poblaciones.",
    "Aunque la mayoría de las mutaciones son neutras o perjudiciales, algunas son beneficiosas: por ejemplo, la mutación que confiere resistencia a la malaria en portadores del rasgo falciforme (HbAS) es ventajosa en zonas endémicas. Las mutaciones son, en última instancia, el motor de la variación sobre la que actúa la selección natural.",
  ],

  objetivos: [
    "Distinguir las mutaciones génicas (sustitución, inserción, deleción) de las cromosómicas (deleción, duplicación, inversión, translocación, aneuploidía).",
    "Clasificar las sustituciones puntuales en silenciosa (sinónima), de sentido erróneo (missense) y sin sentido (nonsense).",
    "Reconocer los mutágenos físicos (UV, rayos X), químicos (tabaco, formaldehído) y biológicos (virus como el VPH).",
    "Diferenciar las mutaciones germinales (heredables) de las somáticas (no heredables, relacionadas con el cáncer).",
    "Explicar el papel de las mutaciones como motor de la variabilidad genética y la evolución.",
    "Resolver el reto evaluable de la actividad A2.",
  ],

  materiales: [
    { nombre: "Visor 3D de mutaciones", detalle: "Tres modos: puntuales, cromosómicas y mutágenos", icono: "fa-dna" },
    { nombre: "Secuencia de la β-globina", detalle: "Inicio real del gen humano (HBB) para las mutaciones puntuales", icono: "fa-droplet" },
    { nombre: "Cromosoma de bandas", detalle: "Modelo de 5 segmentos (A-B-C-D-E) para las mutaciones cromosómicas", icono: "fa-grip-lines-vertical" },
    { nombre: "Doble hélice y dímero de timina", detalle: "Daño por UV y reparación por escisión de nucleótidos (NER)", icono: "fa-radiation" },
  ],

  // Conceptos centrales del lab — formulados a partir de la lectura A1.
  conceptos: [
    { termino: "Mutación", definicion: "Un cambio en la secuencia del ADN. Las mutaciones génicas afectan uno o pocos nucleótidos; las cromosómicas afectan la estructura o el número de cromosomas." },
    { termino: "Sustitución, inserción y deleción", definicion: "Las mutaciones génicas: una base reemplaza a otra (sustitución) o se añade o elimina un nucleótido (inserción/deleción), causando desplazamiento del marco de lectura." },
    { termino: "Aneuploidía", definicion: "Mutación cromosómica que cambia el número de cromosomas, como la trisomía 21 (síndrome de Down)." },
    { termino: "Mutágeno", definicion: "Agente que aumenta la tasa de mutación. Pueden ser físicos (radiación UV, rayos X), químicos (humo del tabaco, formaldehído) o biológicos (virus como el VPH, transposones)." },
    { termino: "Germinal vs somática", definicion: "Las mutaciones somáticas ocurren en células del cuerpo y no se heredan, pero pueden originar cáncer; las germinales ocurren en células reproductoras y se transmiten a la descendencia." },
    { termino: "Variabilidad genética", definicion: "Las mutaciones son, en última instancia, el motor de la variación sobre la que actúa la selección natural." },
  ],

  // Glosario — VERBATIM del glosario interactivo A5 de P06.
  glosario: [
    { termino: "Mutación génica puntual", definicion: "Cambio en uno o pocos pares de bases del ADN. Tipos: (1) Sustitución: una base se reemplaza por otra; puede ser sinónima (sin cambio de aminoácido), missense (cambia aminoácido) o nonsense (genera codón de parada prematuro). (2) Inserción/deleción de 1-2 bases: causa desplazamiento del marco de lectura (frameshift), alterando todos los aminoácidos siguientes." },
    { termino: "Mutación cromosómica", definicion: "Cambio en la estructura o número de cromosomas. Estructurales: deleción (pérdida de segmento), duplicación, inversión, translocación. Numéricas: aneuploidía (pérdida o ganancia de cromosomas, ej: trisomía 21 = síndrome de Down) o poliploidía." },
    { termino: "Mutágenos físicos, químicos y biológicos", definicion: "Agentes que aumentan la tasa de mutación. Físicos: radiación UV (dímeros de timina), rayos X y gamma (roturas de doble cadena). Químicos: benzopirenos del humo de tabaco, aflatoxinas, agentes alquilantes. Biológicos: virus que integran su ADN en el genoma (VPH, retrovirus)." },
    { termino: "Reparación del ADN", definicion: "Las células poseen sistemas de reparación para corregir errores de replicación y daños al ADN: (1) Reparación por escisión de nucleótidos (NER): elimina dímeros de timina y lesiones voluminosas. (2) Reparación de emparejamientos erróneos (MMR). (3) Unión de extremos no homólogos (NHEJ) para roturas de doble cadena. Fallos en estos sistemas aumentan el riesgo de cáncer." },
    { termino: "Mutaciones germinales vs somáticas", definicion: "Germinales: ocurren en células de la línea germinal (gametos); son heredables y afectan a toda la descendencia. Somáticas: ocurren en células del cuerpo del individuo; no son heredables, pero pueden causar cáncer si afectan genes reguladores del ciclo celular (proto-oncogenes, genes supresores de tumor)." },
    { termino: "Variabilidad genética y evolución", definicion: "Las mutaciones introducen nuevos alelos en las poblaciones; la recombinación durante la meiosis crea nuevas combinaciones de alelos. Ambos procesos generan diversidad fenotípica sobre la que actúa la selección natural, la deriva génica y el flujo génico, impulsando la evolución." },
  ],

  aplicaciones: [
    "En México, el INMEGEN (Instituto Nacional de Medicina Genómica) estudia las variantes y mutaciones del genoma de la población mexicana para diseñar diagnósticos y tratamientos más precisos.",
    "La anemia de células falciformes se debe a una sustitución A→T en el codón 6 del gen de la β-globina (Glu→Val).",
    "La radiación ultravioleta forma dímeros de timina y es la principal causa del cáncer de piel; el síndrome de xeroderma pigmentoso impide repararlos.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Lectura A1 y glosario A5, CNEYT-VI-P06. Ref: Campbell, Biología (12a ed.); Alberts, Biología Molecular de la Célula.",
};
