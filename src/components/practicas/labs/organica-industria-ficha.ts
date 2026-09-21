/**
 * Datos de la Ficha Teórica del laboratorio "Química orgánica en la industria"
 * (CNEYT-IV, progresión 9; actividades CNEYT-IV-P06).
 *
 * Contenido VERBATIM de las actividades ancla:
 *   - Marco teórico: lectura A1 «Química orgánica en la industria: fármacos,
 *     alimentos y materiales» (4 párrafos).
 *   - Glosario: glosario interactivo A5 (6 términos).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";
import { GLOSARIO, LECTURA_A1, FUENTE } from "./organica-industria-data";

export const ORGANICA_INDUSTRIA_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-IV · P06 · A1 — Química orgánica en la industria: fármacos, alimentos y materiales",

  marcoTeorico: LECTURA_A1,

  objetivos: [
    "Relacionar la química orgánica con la industria farmacéutica, alimentaria y de materiales.",
    "Identificar qué enlaces se rompen y cuáles se forman en la síntesis de la aspirina, el paracetamol y un éster de aroma.",
    "Calcular el reactivo limitante, el producto teórico y la economía atómica de una síntesis.",
    "Explicar cómo el exceso de un reactivo o el retiro del agua desplazan un equilibrio.",
    "Distinguir la polimerización por adición de la polimerización por condensación.",
    "Relacionar el grado de polimerización con las propiedades del material.",
    "Asociar grupo funcional, propiedad y uso en productos cotidianos.",
  ],

  materiales: [
    { nombre: "Reactor de síntesis", detalle: "Moléculas reales (confórmeros 3D de PubChem) de reactivos y productos.", icono: "fa-flask-vial" },
    { nombre: "Balanza y deslizadores de masa", detalle: "Gramos de cada reactivo para calcular moles y reactivo limitante.", icono: "fa-scale-balanced" },
    { nombre: "Levadura (Saccharomyces cerevisiae)", detalle: "Biocatalizador de la fermentación alcohólica.", icono: "fa-bacteria" },
    { nombre: "Planta de polímeros", detalle: "Etileno, ácido tereftálico, etilenglicol, ácido adípico y hexametilendiamina.", icono: "fa-link" },
    { nombre: "Nueve productos cotidianos", detalle: "Fármacos, aditivos y plásticos para clasificar por grupo funcional.", icono: "fa-boxes-stacked" },
  ],

  conceptos: [
    {
      termino: "Grupo funcional",
      definicion: "Conjunto de átomos que da a una familia de compuestos sus propiedades y reacciones: –OH (alcohol), –COOH (ácido carboxílico), –COO– (éster), –CONH– (amida), C=C (alqueno).",
    },
    {
      termino: "Acetilación",
      definicion: "Transferencia de un grupo acetilo (CH₃CO–). Con anhídrido acético, el –OH del ácido salicílico da un éster (aspirina) y el –NH₂ del 4-aminofenol da una amida (paracetamol); en ambos casos sale ácido acético.",
    },
    {
      termino: "Esterificación de Fischer",
      definicion: "Ácido carboxílico + alcohol ⇌ éster + agua, con catalizador ácido. Es un equilibrio: el exceso de un reactivo o el retiro del agua aumentan el rendimiento (principio de Le Châtelier).",
    },
    {
      termino: "Reactivo limitante y economía atómica",
      definicion: "El reactivo que se acaba primero fija la cantidad de producto. La economía atómica es la fracción de la masa de los reactivos que termina en el producto deseado.",
    },
    {
      termino: "Adición y condensación",
      definicion: "En la adición (polietileno) el doble enlace se abre y no sale subproducto. En la condensación (PET, nylon) cada enlace éster o amida libera una molécula pequeña, casi siempre agua.",
    },
    {
      termino: "Ecuación de Carothers",
      definicion: "En la condensación, el grado de polimerización promedio es Xₙ = 1/(1 − p), con p la fracción de grupos que reaccionó. Para 150 unidades se necesita p ≈ 99.3 %.",
    },
  ],

  glosario: GLOSARIO.map((g) => ({ termino: g.termino, definicion: g.definicion })),

  aplicaciones: [
    "Laboratorios farmacéuticos mexicanos producen analgésicos y antiinflamatorios orgánicos como el paracetamol y el ibuprofeno.",
    "Ésteres como el acetato de isoamilo dan sabor a plátano a dulces y bebidas.",
    "El benzoato de sodio (E211) conserva refrescos y jugos ácidos.",
    "El PET de las botellas se recicla en México a través de ECOCE.",
    "El bioetanol de caña de azúcar se obtiene por fermentación alcohólica.",
  ],

  fuente: FUENTE,
};
