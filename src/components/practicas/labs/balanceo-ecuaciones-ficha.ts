/**
 * Datos de la Ficha Teórica del laboratorio de Balanceo de ecuaciones (CNEYT-IV-P01).
 *
 * Contenido VERBATIM de la actividad ancla A1
 * «La ley de conservación de masa y el balanceo de ecuaciones» (lectura).
 * El glosario proviene VERBATIM de A5 «Glosario — Ecuaciones y estequiometría»
 * (glosario_interactivo).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const BALANCEO_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-IV-P01-A2",

  // Marco teórico — VERBATIM de la lectura A1.
  marcoTeorico: [
    "Antoine Lavoisier formuló en el siglo XVIII uno de los principios fundamentales de la química: en una reacción química, la masa de los reactivos es exactamente igual a la masa de los productos. Los átomos no se crean ni se destruyen; solo se reorganizan para formar nuevas sustancias. Esta ley, conocida como la Ley de Conservación de la Masa, es la base de todo cálculo estequiométrico y del balanceo de ecuaciones químicas.",
    "Una ecuación química no balanceada es como una receta con las proporciones incorrectas. Por ejemplo, H₂ + O₂ → H₂O parece correcta, pero no lo está: hay 2 átomos de oxígeno en los reactivos y solo 1 en los productos. La versión balanceada es 2 H₂ + O₂ → 2 H₂O, donde se conservan todos los átomos.",
    "El procedimiento para balancear ecuaciones se llama balanceo por inspección o balanceo por tanteo. Consiste en ajustar los coeficientes estequiométricos (los números que preceden a las fórmulas) sin cambiar las subíndices de cada fórmula, porque cambiar los subíndices significaría cambiar la sustancia misma. Por ejemplo, H₂O (agua) y H₂O₂ (agua oxigenada) son moléculas completamente distintas.",
    "En México, la comprensión del balanceo tiene aplicaciones industriales cotidianas. PEMEX utiliza ecuaciones balanceadas para calcular el rendimiento de combustibles y los subproductos de la refinación del petróleo. Las plantas cementeras del grupo CEMEX controlan reacciones de descomposición del carbonato de calcio (CaCO₃ → CaO + CO₂) para optimizar su proceso productivo. En la metalurgia, como en las plantas de ArcelorMittal en Lázaro Cárdenas (Michoacán), el balanceo de las reacciones de reducción del hierro determina las cantidades exactas de coque y mineral de hierro que deben usarse.",
    "Dominar el balanceo no es solo un ejercicio matemático: es la herramienta que permite a los químicos, ingenieros y técnicos calcular cuánto de cada reactivo se necesita y cuánto producto se obtendrá, minimizando desperdicios y maximizando la seguridad industrial.",
  ],

  objetivos: [
    "Enunciar la Ley de Conservación de la Masa y relacionarla con el balanceo de ecuaciones.",
    "Distinguir coeficientes y subíndices en una ecuación química y saber cuál se puede modificar al balancear.",
    "Balancear ecuaciones simples por el método de tanteo verificando que el número de átomos sea igual en ambos lados.",
    "Interpretar los coeficientes de una ecuación balanceada como proporciones molares entre reactivos y productos.",
    "Resolver el reto evaluable de la actividad A2.",
  ],

  materiales: [
    { nombre: "Visor 3D de moléculas", detalle: "Muestra copias reales de cada molécula según el coeficiente elegido", icono: "fa-atom" },
    { nombre: "Ajuste de coeficientes", detalle: "Controles −/+ para cada especie (reactivos y productos)", icono: "fa-sliders" },
    { nombre: "Tabla de balance", detalle: "Conteo en vivo de átomos por elemento en ambos lados de la flecha", icono: "fa-table" },
    { nombre: "Tres reacciones reales", detalle: "H₂/O₂, CH₄/O₂ (combustión), Fe/O₂ (herrumbre)", icono: "fa-flask-vial" },
  ],

  // Conceptos centrales — formulados a partir de la lectura A1.
  conceptos: [
    {
      termino: "Ley de Conservación de la Masa",
      definicion: "En una reacción química, la masa de los reactivos es exactamente igual a la masa de los productos. Los átomos no se crean ni se destruyen; solo se reorganizan.",
    },
    {
      termino: "Coeficiente estequiométrico",
      definicion: "Número entero que precede a una fórmula química en la ecuación; indica cuántas moléculas (o moles) de esa sustancia participan. ES el único número que se ajusta al balancear.",
    },
    {
      termino: "Subíndice",
      definicion: "Número dentro de una fórmula que indica cuántos átomos de cada elemento hay en una molécula. NUNCA se cambia al balancear (cambiarlo cambiaría la sustancia misma).",
    },
    {
      termino: "Balanceo por tanteo (inspección)",
      definicion: "Método para ajustar coeficientes hasta que el número de átomos de cada elemento sea idéntico a ambos lados de la flecha. Empieza por el elemento que aparece en menos compuestos.",
    },
    {
      termino: "Estequiometría",
      definicion: "Parte de la química que estudia las proporciones cuantitativas en que los reactivos se combinan y los productos se forman. El balanceo es su herramienta básica.",
    },
  ],

  // Glosario — VERBATIM de A5 «Glosario — Ecuaciones y estequiometría».
  glosario: [
    {
      termino: "Ley de conservación de la masa",
      definicion: "Principio que establece que la masa total de los reactivos es igual a la masa total de los productos en cualquier reacción química.",
    },
    {
      termino: "Ecuación química",
      definicion: "Representación simbólica de una reacción química que muestra reactivos y productos con sus fórmulas y coeficientes.",
    },
    {
      termino: "Coeficiente estequiométrico",
      definicion: "Número entero que se coloca frente a una fórmula química para indicar la proporción molar de esa sustancia en la reacción.",
    },
    {
      termino: "Reactivo",
      definicion: "Sustancia que se consume en una reacción química; aparece al lado izquierdo de la flecha.",
    },
    {
      termino: "Producto",
      definicion: "Sustancia que se forma como resultado de una reacción química; aparece al lado derecho de la flecha.",
    },
    {
      termino: "Balanceo por tanteo",
      definicion: "Método para ajustar los coeficientes de una ecuación química igualando el número de átomos de cada elemento en ambos lados de la flecha.",
    },
  ],

  aplicaciones: [
    "PEMEX utiliza ecuaciones balanceadas para calcular el rendimiento de combustibles y los subproductos de la refinación del petróleo.",
    "Las plantas cementeras del grupo CEMEX controlan reacciones de descomposición del carbonato de calcio (CaCO₃ → CaO + CO₂) para optimizar su proceso productivo.",
    "En la metalurgia, ArcelorMittal en Lázaro Cárdenas (Michoacán) usa el balanceo de reacciones de reducción del hierro para determinar cantidades exactas de coque y mineral.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — CNEYT-IV",
};
