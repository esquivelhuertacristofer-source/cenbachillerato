/**
 * Datos de la Ficha Teórica del laboratorio de Semejanza de triángulos (PM-III-P05).
 *
 * Contenido VERBATIM de la actividad ancla A1 «Semejanza y congruencia de
 * triángulos» (lectura). El glosario proviene de A5 «Glosario — Semejanza y
 * congruencia de triángulos» (glosario_interactivo), también VERBATIM.
 * El reto evaluable vive en semejanza-triangulos-data.ts (A2).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const SEMEJANZA_FICHA: FichaTeoricaData = {
  ancla: "PM-III · P05 · A1 — Semejanza y congruencia de triángulos",

  // Marco teórico — VERBATIM de la lectura A1.
  marcoTeorico: [
    "Dos figuras son congruentes si tienen exactamente la misma forma y el mismo tamaño (los lados y ángulos correspondientes son iguales). Dos figuras son semejantes si tienen la misma forma pero distinto tamaño: los ángulos correspondientes son iguales y los lados correspondientes son proporcionales, con una razón de semejanza k.",
    "Para los triángulos existen criterios que permiten establecer congruencia o semejanza sin necesidad de conocer todos los elementos:\n\nCriterios de congruencia: LLL (Lado-Lado-Lado: los tres pares de lados son iguales), LAL (Lado-Ángulo-Lado: dos lados y el ángulo comprendido), ALA (Ángulo-Lado-Ángulo: dos ángulos y el lado comprendido).\n\nCriterios de semejanza: AA (dos pares de ángulos iguales), LLL proporcional (los tres pares de lados son proporcionales), LAL proporcional (dos pares de lados proporcionales y el ángulo comprendido igual).",
    "La razón de semejanza k es el cociente entre lados correspondientes. Si k = 3, el triángulo grande tiene sus lados 3 veces más largos que el triángulo pequeño. Las áreas se relacionan con k² y los volúmenes con k³.",
    "La medición indirecta es una aplicación práctica: si no podemos medir directamente la altura de un árbol, un poste o un edificio, podemos usar las sombras que proyectan. Si nuestra sombra mide 1.5 m y nuestra estatura es 1.65 m, y el árbol proyecta una sombra de 8 m, el árbol mide 1.65 × (8/1.5) = 8.8 m. Esto funciona porque el sol forma triángulos semejantes.",
  ],

  objetivos: [
    "Distinguir entre figuras congruentes (misma forma y tamaño) y semejantes (misma forma, lados proporcionales).",
    "Identificar y aplicar los criterios de congruencia LLL, LAL y ALA.",
    "Identificar y aplicar los criterios de semejanza AA, LLL proporcional y LAL proporcional.",
    "Calcular la razón de semejanza k a partir de lados correspondientes.",
    "Usar la semejanza de triángulos para medir alturas de forma indirecta mediante proporciones.",
    "Resolver el ejercicio de medición indirecta de la actividad A2 (caso de Sofía).",
  ],

  materiales: [
    { nombre: "Escena 3D de sombras", detalle: "Persona y torre bajo el mismo Sol forman triángulos semejantes", icono: "fa-ruler-vertical" },
    { nombre: "Deslizador de elevación solar", detalle: "Mueve el Sol y observa cómo cambian las sombras sin alterar k", icono: "fa-sun" },
    { nombre: "Ajuste de alturas", detalle: "Varía la estatura de la persona y la altura de la torre", icono: "fa-person" },
    { nombre: "Caso de Sofía", detalle: "Reproduce el ejercicio verbatim del ancla A2 con un clic", icono: "fa-clock" },
  ],

  // Conceptos formulados a partir de la lectura A1.
  conceptos: [
    { termino: "Figuras congruentes (≅)", definicion: "Tienen exactamente la misma forma y el mismo tamaño: todos los lados y ángulos correspondientes son iguales." },
    { termino: "Figuras semejantes (≈)", definicion: "Tienen la misma forma pero distinto tamaño: los ángulos correspondientes son iguales y los lados correspondientes son proporcionales con razón k." },
    { termino: "Razón de semejanza (k)", definicion: "Cociente entre lados correspondientes de dos figuras semejantes. Las áreas se relacionan con k² y los volúmenes con k³." },
    { termino: "Criterio AA de semejanza", definicion: "Si dos pares de ángulos son iguales en dos triángulos, los triángulos son semejantes." },
    { termino: "Medición indirecta", definicion: "Técnica que usa la proporcionalidad de triángulos semejantes para calcular alturas inaccesibles a partir de sombras y una medida conocida." },
  ],

  // Glosario — VERBATIM de A5 «Glosario — Semejanza y congruencia de triángulos».
  glosario: [
    {
      termino: "Congruencia de triángulos",
      definicion: "Dos triángulos son congruentes si tienen exactamente la misma forma y el mismo tamaño (todos los lados y ángulos correspondientes son iguales). Ejemplo: △ABC ≅ △DEF si AB=DE, BC=EF, CA=FD y sus ángulos correspondientes son iguales.",
    },
    {
      termino: "Criterio LLL",
      definicion: "Lado-Lado-Lado: si los tres lados de un triángulo son iguales a los tres lados correspondientes de otro, los triángulos son congruentes. Ejemplo: si a=a', b=b' y c=c', entonces △ABC ≅ △A'B'C'.",
    },
    {
      termino: "Criterio LAL",
      definicion: "Lado-Ángulo-Lado: si dos lados y el ángulo comprendido entre ellos son iguales en ambos triángulos, son congruentes. Ejemplo: AB=DE, ∠A=∠D, AC=DF → △ABC ≅ △DEF.",
    },
    {
      termino: "Criterio ALA",
      definicion: "Ángulo-Lado-Ángulo: si dos ángulos y el lado comprendido son iguales en ambos triángulos, son congruentes. Ejemplo: ∠A=∠D, AB=DE, ∠B=∠E → △ABC ≅ △DEF.",
    },
    {
      termino: "Semejanza de triángulos",
      definicion: "Dos triángulos son semejantes si tienen los mismos ángulos y sus lados son proporcionales. La razón de proporcionalidad se llama razón de semejanza. Ejemplo: △ABC ~ △DEF con razón k=2 → DE=2·AB, EF=2·BC, FD=2·CA.",
    },
    {
      termino: "Razón de semejanza y áreas",
      definicion: "Si la razón de semejanza es k, la razón de los perímetros es k y la razón de las áreas es k². Ejemplo: razón k=3 → el área del triángulo mayor es 9 veces la del menor.",
    },
  ],

  aplicaciones: [
    "Medición de alturas inaccesibles (árboles, torres, edificios) usando sombras y proporciones.",
    "Cartografía y mapas a escala: razón de semejanza entre el mapa y la realidad.",
    "Fotografía y óptica: la imagen en el sensor es semejante a la escena real.",
    "Topografía y arquitectura: planos y maquetas usan relaciones de semejanza.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Lectura A1 y Glosario A5, PM-III-P05.",
};
