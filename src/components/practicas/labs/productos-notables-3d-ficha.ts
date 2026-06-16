/**
 * Datos de la Ficha Teórica del laboratorio de Productos notables (PM-II-P08).
 *
 * Contenido VERBATIM de la actividad ancla A1 «Polinomios y productos notables»
 * (lectura) y del glosario A5 «Glosario: polinomios y productos notables». El
 * reto evaluable vive en productos-notables-3d-data.ts (A8).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const PRODUCTOS_NOTABLES_FICHA: FichaTeoricaData = {
  ancla: "PM-II · P08 · A1 — Polinomios y productos notables",

  // Marco teórico — VERBATIM de la lectura A1.
  marcoTeorico: [
    "Un trinomio tiene tres términos y un polinomio tiene varios términos. Para sumarlos o restarlos se agrupan los términos semejantes; para multiplicarlos se aplica la propiedad distributiva, multiplicando cada término de uno por cada término del otro y luego reduciendo.",
    "ALGUNOS productos aparecen tan seguido que conviene memorizar su resultado: son los PRODUCTOS NOTABLES.",
    "1) Binomio al cuadrado (suma): (a mas b) al cuadrado es igual a a al cuadrado, mas 2ab, mas b al cuadrado. Ejemplo: (x mas 3) al cuadrado da x al cuadrado, mas 6x, mas 9. Comprobación: 2 por x por 3 da 6x, y 3 al cuadrado da 9.",
    "2) Binomio al cuadrado (resta): (a menos b) al cuadrado es igual a a al cuadrado, menos 2ab, mas b al cuadrado. Ejemplo: (x menos 4) al cuadrado da x al cuadrado, menos 8x, mas 16. Observa que el último término siempre es positivo.",
    "3) Producto de binomios conjugados: (a mas b)(a menos b) es igual a a al cuadrado, menos b al cuadrado (diferencia de cuadrados). Ejemplo: (x mas 5)(x menos 5) da x al cuadrado, menos 25. El término del medio se cancela.",
    "4) Binomio al cubo (suma): (a mas b) al cubo es igual a a al cubo, mas 3a al cuadrado b, mas 3ab al cuadrado, mas b al cubo.",
    "Dominar estos patrones permite multiplicar mentalmente y, más adelante, factorizar con rapidez.",
  ],

  objetivos: [
    "Sumar, restar y multiplicar polinomios usando la propiedad distributiva.",
    "Desarrollar el binomio al cuadrado: (a ± b)² = a² ± 2ab + b².",
    "Reconocer la diferencia de cuadrados: (a + b)(a − b) = a² − b².",
    "Visualizar el binomio al cubo (a + b)³ como el volumen de un cubo descompuesto.",
    "Resolver el ejercicio de productos notables y suma de polinomios en contexto (A8).",
  ],

  materiales: [
    { nombre: "Cuadrado de lado (a + b)", detalle: "El área a² + 2ab + b² muestra el binomio al cuadrado", icono: "fa-square" },
    { nombre: "Cubo de arista (a + b)", detalle: "El volumen a³ + 3a²b + 3ab² + b³ en 3D", icono: "fa-cube" },
    { nombre: "Diferencia de cuadrados", detalle: "Un cuadrado a² menos un cuadrado b² → a² − b²", icono: "fa-table-cells-large" },
    { nombre: "Despiece de piezas", detalle: "Separa la figura para ver de dónde sale cada término", icono: "fa-up-down-left-right" },
  ],

  // Conceptos centrales — formulados a partir de la lectura A1.
  conceptos: [
    { termino: "Binomio al cuadrado (suma)", definicion: "(a + b)² = a² + 2ab + b². Ejemplo: (x + 3)² = x² + 6x + 9." },
    { termino: "Binomio al cuadrado (resta)", definicion: "(a − b)² = a² − 2ab + b². El último término siempre es positivo: (x − 4)² = x² − 8x + 16." },
    { termino: "Binomios conjugados", definicion: "(a + b)(a − b) = a² − b² (diferencia de cuadrados): el término del medio se cancela." },
    { termino: "Binomio al cubo (suma)", definicion: "(a + b)³ = a³ + 3a²b + 3ab² + b³." },
    { termino: "Propiedad distributiva", definicion: "Para multiplicar polinomios: cada término de uno por cada término del otro, luego se reducen." },
  ],

  // Glosario — VERBATIM de A5 «Glosario: polinomios y productos notables».
  glosario: [
    { termino: "Trinomio", definicion: "Polinomio de tres términos. Ejemplo: x² + 6x + 9." },
    { termino: "Polinomio", definicion: "Expresión algebraica de varios términos sumados o restados. Ejemplo: 2x³ − x² + 5x − 7." },
    { termino: "Propiedad distributiva", definicion: "Regla para multiplicar: cada término de un factor multiplica a cada término del otro. Ejemplo: a(b + c) = ab + ac." },
    { termino: "Producto notable", definicion: "Multiplicación cuyo resultado sigue un patrón conocido y se puede escribir de memoria. Ejemplo: (a + b)² = a² + 2ab + b²." },
    { termino: "Diferencia de cuadrados", definicion: "Resultado del producto de binomios conjugados: (a + b)(a − b) = a² − b². Ejemplo: (x + 5)(x − 5) = x² − 25." },
  ],

  aplicaciones: [
    "Calcular el área de una plaza o terreno cuadrado de lado (x + 5) desarrollando (x + 5)².",
    "Multiplicar mentalmente productos de binomios reconociendo el patrón notable.",
    "Factorizar con rapidez más adelante, reconociendo trinomios y diferencias de cuadrados.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Lectura A1, PM-II-P08.",
};
