/**
 * Datos de la Ficha Teórica del laboratorio "Estructura de una reacción química"
 * (CNEYT-III-P09).
 *
 * Contenido VERBATIM de la actividad ancla A1 «Anatomía de una reacción química:
 * cómo se escribe la transformación de la materia» (lectura). El glosario proviene
 * de A5 «Glosario: reacción, ecuación, coeficiente, subíndice y simbología química»
 * (glosario_interactivo). El reto evaluable numérico vive en el campo RETO_A2 de
 * estructura-reaccion-data.ts (A2 ejercicio_matematico, practica_slug=estructura-reaccion).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const ESTRUCTURA_REACCION_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-III-P09-A2",

  // Marco teórico — VERBATIM de la lectura A1 (CNEYT-III-P09-A1).
  marcoTeorico: [
    "La materia que nos rodea está en constante transformación: una vela arde, una manzana se oxida, el maíz crece con la luz del sol, un antiácido calma la acidez del estómago. En todos estos casos ocurre una REACCIÓN QUÍMICA: un proceso en el que una o más sustancias (los REACTIVOS) se transforman en otras sustancias nuevas y distintas (los PRODUCTOS). No es solo un cambio de aspecto: los átomos se reorganizan, se rompen y se forman enlaces, y nacen compuestos con propiedades diferentes. Entender la ESTRUCTURA de una reacción —cómo se escribe y qué significa cada parte— es la llave para comprender la química como el lenguaje de la transformación de la materia.",
    "LA ECUACIÓN QUÍMICA. Para representar una reacción usamos una ECUACIÓN QUÍMICA, una especie de «oración» con su propia gramática. Se lee de izquierda a derecha: a la izquierda van los REACTIVOS, en medio una FLECHA (→) que se lee «se transforma en» o «produce», y a la derecha los PRODUCTOS. Por ejemplo, la combustión del gas de la estufa (metano) se escribe: CH₄ + 2 O₂ → CO₂ + 2 H₂O. Se lee: «una molécula de metano reacciona con dos de oxígeno para producir una de dióxido de carbono y dos de agua». El signo + separa las distintas sustancias de cada lado.",
    "COEFICIENTES vs SUBÍNDICES: dos números que NO significan lo mismo. Esta es la confusión más común y la clave de toda la estructura. El SUBÍNDICE es el número pequeño abajo dentro de una fórmula: indica CUÁNTOS ÁTOMOS de ese elemento hay en UNA molécula. En H₂O el subíndice 2 dice que cada molécula de agua tiene 2 átomos de hidrógeno y 1 de oxígeno (cuando no hay subíndice, se entiende 1). El COEFICIENTE es el número grande delante de la fórmula: indica CUÁNTAS MOLÉCULAS (o moles) de esa sustancia participan. En 2 H₂O el coeficiente 2 dice que hay 2 moléculas de agua completas. La diferencia es enorme: cambiar un subíndice cambia la sustancia (H₂O es agua, H₂O₂ es agua oxigenada); cambiar un coeficiente solo cambia la cantidad. Los subíndices NO se tocan al balancear; solo se ajustan los coeficientes.",
    "LA LEY DE LA CONSERVACIÓN DE LA MATERIA. En 1789 Antoine Lavoisier estableció que «en una reacción química la materia no se crea ni se destruye, solo se transforma». Esto significa que el número de átomos de cada elemento debe ser EL MISMO antes y después: lo que entra como reactivo tiene que salir como producto. Por eso una ecuación debe estar BALANCEADA. En CH₄ + 2 O₂ → CO₂ + 2 H₂O cuenta los átomos: a la izquierda hay 1 C, 4 H y 4 O (2 moléculas de O₂ × 2); a la derecha hay 1 C, 4 H (2 H₂O × 2) y 4 O (2 en CO₂ + 2 en las 2 H₂O). Todo cuadra: la ecuación está balanceada y respeta a Lavoisier. Contar átomos a ambos lados es la forma de comprobar que una ecuación es correcta.",
    "LA SIMBOLOGÍA: pistas dentro de la ecuación. Además de fórmulas, flechas, coeficientes y subíndices, la ecuación usa SÍMBOLOS que dan información extra. Entre paréntesis se indica el ESTADO DE AGREGACIÓN: (s) sólido, (l) líquido, (g) gas y (ac) acuoso (disuelto en agua). Una flecha sencilla → marca una reacción que va en un solo sentido; una flecha DOBLE ⇌ indica una reacción REVERSIBLE, que ocurre en ambos sentidos a la vez, como la síntesis del amoniaco N₂ + 3 H₂ ⇌ 2 NH₃ (base de los fertilizantes). La letra griega Δ (delta) sobre la flecha indica que se necesita CALOR, y a veces las flechas ↑ y ↓ señalan un gas que se desprende o un sólido que precipita.",
    "POR QUÉ IMPORTA, AQUÍ EN MÉXICO. Saber leer la estructura de una reacción explica fenómenos de todos los días. La combustión del gas LP en la estufa (CH₄/propano + O₂ → CO₂ + H₂O) libera la energía con que cocinamos. La FOTOSÍNTESIS del maíz y de las selvas (6 CO₂ + 6 H₂O → C₆H₁₂O₆ + 6 O₂) captura dióxido de carbono y produce el oxígeno que respiramos, conectando con el ciclo del carbono y el oxígeno de las esferas terrestres. La síntesis del AMONIACO sostiene la producción de fertilizantes para el campo mexicano. Y la NEUTRALIZACIÓN (HCl + NaOH → NaCl + H₂O) es la química de un antiácido calmando el estómago. En todas, la ecuación química es la herramienta que nos deja ver —y contar— cómo la materia se transforma sin perderse.",
  ],

  objetivos: [
    "Identificar las partes de una ecuación química: reactivos, flecha y productos.",
    "Distinguir un coeficiente de un subíndice y explicar qué indica cada uno.",
    "Contar los átomos de cada elemento a ambos lados de la flecha (coeficiente × subíndice).",
    "Verificar que una ecuación está balanceada aplicando la ley de conservación de la materia de Lavoisier.",
    "Resolver el reto evaluable de la actividad A2 (conteo de átomos en la combustión del metano).",
  ],

  materiales: [
    { nombre: "Visor 3D — modo Anatomía", detalle: "Recorre reactivos, flecha, productos, coeficientes y subíndices", icono: "fa-diagram-project" },
    { nombre: "Visor 3D — modo Conservación", detalle: "Cuenta los átomos de cada elemento a ambos lados", icono: "fa-scale-balanced" },
    { nombre: "Visor 3D — modo Simbología", detalle: "Galería de todos los símbolos de una ecuación (→, ⇌, +, Δ, estados)", icono: "fa-icons" },
    { nombre: "Calculadora de átomos", detalle: "Selecciona cualquier reacción y verifica el balance lado a lado", icono: "fa-calculator" },
  ],

  // Conceptos centrales — formulados a partir de la lectura A1 (CNEYT-III-P09-A1).
  conceptos: [
    { termino: "Reacción química", definicion: "Proceso en el que unas sustancias (reactivos) se transforman en otras nuevas (productos), rompiendo y formando enlaces; los átomos se reacomodan sin crearse ni destruirse." },
    { termino: "Ecuación química", definicion: "Representación escrita de una reacción: reactivos (izquierda) → productos (derecha), con fórmulas, coeficientes, una flecha y simbología." },
    { termino: "Coeficiente", definicion: "Número grande delante de una fórmula; indica cuántas moléculas (o moles) de esa sustancia participan. En «2 O₂» el coeficiente es 2." },
    { termino: "Subíndice", definicion: "Número pequeño dentro de la fórmula; indica cuántos átomos de un elemento hay en UNA molécula. En H₂O el subíndice 2 dice que hay 2 H por molécula." },
    { termino: "Ley de conservación de la materia (Lavoisier)", definicion: "La materia no se crea ni se destruye, solo se transforma; por eso el número de átomos de cada elemento debe ser igual en reactivos y en productos." },
    { termino: "Ecuación balanceada", definicion: "Aquella en la que el número de átomos de cada elemento es igual en ambos lados de la flecha. Para balancear solo se ajustan coeficientes, nunca subíndices." },
    { termino: "Estados de agregación (s, l, g, ac)", definicion: "Simbología entre paréntesis: (s) sólido, (l) líquido, (g) gas, (ac) acuoso (disuelto en agua)." },
    { termino: "Reacción reversible (⇌)", definicion: "Reacción que ocurre en ambos sentidos a la vez; se escribe con doble flecha ⇌, como la síntesis del amoniaco N₂ + 3 H₂ ⇌ 2 NH₃." },
  ],

  // Glosario VERBATIM de A5 (glosario_interactivo, CNEYT-III-P09-A5).
  glosario: [
    { termino: "Reacción química", definicion: "Proceso en el que unas sustancias (reactivos) se transforman en otras nuevas (productos) reorganizando sus átomos. Ejemplo: la combustión del gas de la estufa o la fotosíntesis de una planta." },
    { termino: "Reactivos", definicion: "Las sustancias que entran a la reacción; se escriben a la izquierda de la flecha. Ejemplo: en CH₄ + 2 O₂ → CO₂ + 2 H₂O, los reactivos son CH₄ y O₂." },
    { termino: "Productos", definicion: "Las sustancias nuevas que se forman; se escriben a la derecha de la flecha. Ejemplo: en la misma reacción, los productos son CO₂ y H₂O." },
    { termino: "Ecuación química", definicion: "Representación escrita de una reacción usando fórmulas, coeficientes, una flecha y simbología. Ejemplo: 2 H₂ + O₂ → 2 H₂O representa la formación del agua." },
    { termino: "Flecha de reacción (→)", definicion: "Símbolo que separa reactivos de productos y se lee «se transforma en» o «produce». Una flecha doble ⇌ indica que la reacción es reversible." },
    { termino: "Coeficiente", definicion: "Número grande delante de una fórmula; indica cuántas moléculas (o moles) de esa sustancia participan. Ejemplo: en 2 H₂O el coeficiente 2 significa 2 moléculas de agua." },
    { termino: "Subíndice", definicion: "Número pequeño dentro de una fórmula; indica cuántos átomos de un elemento hay en una molécula (si no aparece, es 1). Ejemplo: en H₂O el subíndice 2 dice que hay 2 átomos de hidrógeno." },
    { termino: "Ley de conservación de la materia", definicion: "Principio de Lavoisier: la materia no se crea ni se destruye, solo se transforma; los átomos de cada elemento se conservan. Por eso una ecuación debe estar balanceada (mismos átomos a ambos lados)." },
    { termino: "Ecuación balanceada", definicion: "Aquella en la que el número de átomos de cada elemento es igual en reactivos y productos. Ejemplo: CH₄ + 2 O₂ → CO₂ + 2 H₂O: C 1=1, H 4=4, O 4=4." },
    { termino: "Reacción reversible", definicion: "Reacción que ocurre en ambos sentidos a la vez; se escribe con flecha doble ⇌. Ejemplo: N₂ + 3 H₂ ⇌ 2 NH₃, la síntesis del amoniaco." },
    { termino: "Estado de agregación (s, l, g, ac)", definicion: "Simbología entre paréntesis que indica si una sustancia es sólida (s), líquida (l), gaseosa (g) o acuosa (ac, disuelta en agua). Ejemplo: HCl(ac) + NaOH(ac) → NaCl(ac) + H₂O(l)." },
  ],

  aplicaciones: [
    "La combustión del gas LP en la estufa (CH₄ + 2 O₂ → CO₂ + 2 H₂O) produce la energía con que cocinamos en México.",
    "La fotosíntesis del maíz y los bosques (6 CO₂ + 6 H₂O → C₆H₁₂O₆ + 6 O₂) captura CO₂ y produce el oxígeno que respiramos.",
    "La síntesis del amoniaco (N₂ + 3 H₂ ⇌ 2 NH₃) sostiene la producción de fertilizantes para el campo mexicano.",
    "La neutralización ácido-base (HCl + NaOH → NaCl + H₂O) es la reacción de un antiácido calmando el estómago.",
  ],

  fuente: "MCCEMS 2025 — Ciencias Naturales, Experimentales y Tecnología III «Nuestro hogar. El sistema terrestre», CNEYT-III-P09-A1 (lectura) y A5 (glosario).",
};
