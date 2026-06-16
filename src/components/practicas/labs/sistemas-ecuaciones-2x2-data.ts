/**
 * Datos puros del reto evaluable del laboratorio de Sistemas de ecuaciones 2x2
 * (PM-III-P08).
 *
 * Reproduce VERBATIM el ejercicio ancla A2 «Resuelvo sistemas de ecuaciones
 * lineales» (ejercicio_matematico, practica_slug=sistemas-ecuaciones-2x2).
 * El alumno captura los seis resultados (x e y para cada uno de los tres
 * apartados) y comprueba con tolerancia 0.
 *
 * Fuente: scripts/_sem3_dump.txt, líneas 5103–5116 (PM-III-P08-A2).
 *
 * Verificación aritmética:
 *   (a) Sustitución: x + y = 10 y 2x − y = 5
 *       De eq1: y = 10 − x → 2x − (10 − x) = 5 → 3x = 15 → x = 5, y = 5 ✓
 *   (b) Eliminación: 3x + 2y = 16 y x − 2y = 0
 *       Suma: 4x = 16 → x = 4; de eq2: 4 − 2y = 0 → y = 2 ✓
 *   (c) Monedas de $5 (a) y $10 (b): a + b = 12 y 5a + 10b = 80
 *       a = 12 − b → 5(12 − b) + 10b = 80 → 60 + 5b = 80 → b = 4, a = 8 ✓
 *
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { RetoNumericoData } from "./_reto-numerico";

// VERBATIM de PM-III-P08-A2 (ejercicio_matematico, tipo_respuesta "desarrollo").
export const RETO_A2: RetoNumericoData = {
  titulo: "Resuelvo sistemas de ecuaciones lineales",
  contexto:
    "Los sistemas de ecuaciones modelan situaciones donde dos condiciones deben cumplirse simultáneamente.",
  problema:
    "Resuelve el siguiente sistema usando el método indicado:\n" +
    "(a) Método de sustitución:\n" +
    "    x + y = 10\n" +
    "    2x - y = 5\n" +
    "\n" +
    "(b) Método de eliminación:\n" +
    "    3x + 2y = 16\n" +
    "    x - 2y = 0\n" +
    "\n" +
    "(c) Problema: Juan tiene $80 en monedas de $5 y de $10. En total tiene 12 monedas. ¿Cuántas monedas de cada tipo tiene?",
  campos: [
    { etiqueta: "(a) x  (sustitución)", objetivo: 5, tolerancia: 0, placeholder: "5" },
    { etiqueta: "(a) y  (sustitución)", objetivo: 5, tolerancia: 0, placeholder: "5" },
    { etiqueta: "(b) x  (eliminación)", objetivo: 4, tolerancia: 0, placeholder: "4" },
    { etiqueta: "(b) y  (eliminación)", objetivo: 2, tolerancia: 0, placeholder: "2" },
    { etiqueta: "(c) Monedas de $5", objetivo: 8, tolerancia: 0, unidad: "monedas", placeholder: "8" },
    { etiqueta: "(c) Monedas de $10", objetivo: 4, tolerancia: 0, unidad: "monedas", placeholder: "4" },
  ],
  pasosGuia: [
    "(a) Despeja x (o y) en la primera ecuación, sustituye en la segunda.",
    "(b) Suma ambas ecuaciones para eliminar y directamente.",
    "(c) Define variables (monedas de $5 = a, de $10 = b), plantea dos ecuaciones (total monedas y total valor) y resuelve.",
  ],
  respuestaFinal:
    "(a) x=5, y=5; (b) x=4, y=2; (c) 8 monedas de $5 y 4 de $10",
};
