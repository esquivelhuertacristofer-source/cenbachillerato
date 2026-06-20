/**
 * Imagen temática por laboratorio — datos puros (slug → tema → archivo WebP).
 * Cada laboratorio se asocia a una de las imágenes de `public/labs/*.webp`
 * (foto real con licencia libre, optimizada a ~800px WebP). Varios labs
 * comparten un mismo tema cuando ilustran el mismo fenómeno.
 *
 * Seguro para importar en páginas de listado (no arrastra three.js).
 * Las imágenes y su atribución viven en `public/labs/` (ver CREDITS.json).
 */

/** Slugs de laboratorio → clave de tema (archivo en /public/labs/{tema}.webp). */
export const LAB_TEMA: Record<string, string> = {
  // ── Química ──
  "densidad": "fluidos",
  "estados-materia": "materia",
  "modelos-atomicos": "molecula",
  "enlaces-quimicos": "molecula",
  "conservacion-materia": "reaccion",
  "separacion-mezclas": "reaccion",
  "propiedades-materia": "materia",
  "concentracion-disolucion": "reaccion",
  "balanceo-ecuaciones": "reaccion",
  "organica-visor": "molecula",
  "ph-escala": "reaccion",
  "reaccion-co2": "reaccion",
  "tipos-reacciones-quimicas": "reaccion",
  "redox-combustion": "termo",
  "equilibrio-quimico": "reaccion",
  "estructura-reaccion": "reaccion",
  "biomoleculas-cuatro-clases": "molecula",

  // ── Física ──
  "energia-electricidad": "electricidad",
  "conservacion-energia-pendulo": "energia",
  "gas-ideal-piston": "materia",
  "transferencia-calor-mecanismos": "termo",
  "entropia-segunda-ley": "termo",
  "maquina-termica-ciclos": "termo",
  "trabajo-potencia-mecanica": "energia",
  "formas-energia-transformacion": "energia",
  "propagacion-calor": "termo",
  "dcl-leyes-newton": "movimiento",
  "mrua-acelerar-frenar": "movimiento",
  "gravitacion-universal": "espacio",
  "ondas-amplitud-frecuencia": "ondas",
  "espectro-electromagnetico": "espectro",
  "optica-lentes-espejos": "optica",
  "electromagnetismo-ohm-faraday": "electricidad",
  "fluidos": "fluidos",

  // ── Matemáticas — aritmética y álgebra ──
  "fracciones-porcentajes": "algebra",
  "potencias-raices": "algebra",
  "notacion-cientifica": "algebra",
  "valor-posicional": "algebra",
  "recta-numerica": "graficas",
  "razon-proporcion": "graficas",
  "ecuacion-lineal-balanza": "algebra",
  "ecuacion-lineal-barras": "algebra",
  "factorizacion-area": "algebra",
  "inecuaciones-lineales": "algebra",
  "lenguaje-algebraico-mosaicos": "algebra",
  "clasificacion-expresiones-mosaicos": "algebra",
  "operaciones-binomios-mosaicos": "algebra",
  "sistemas-ecuaciones-2x2": "graficas",

  // ── Matemáticas — geometría ──
  "teorema-pitagoras": "geometria",
  "volumen-cilindro": "geometria",
  "productos-notables-3d": "geometria",
  "semejanza-triangulos": "geometria",
  "conicas-lugares-geometricos": "geometria",
  "modelado-conicas-estimacion": "geometria",

  // ── Matemáticas — trigonometría ──
  "circulo-unitario": "trigonometria",
  "triangulo-rectangulo": "trigonometria",
  "ley-senos-cosenos": "trigonometria",

  // ── Matemáticas — funciones, gráficas y cálculo ──
  "parabola-trayectoria": "graficas",
  "ecuacion-recta": "graficas",
  "funciones-variable-real": "graficas",
  "ecuacion-cuadratica": "graficas",
  "discriminante": "graficas",
  "geometria-analitica": "graficas",
  "transformaciones-funciones": "graficas",
  "funciones-concepto": "graficas",
  "distribucion-normal": "graficas",
  "medidas-tendencia-central": "graficas",
  "medidas-dispersion": "graficas",
  "datos-graficas-estadisticas": "graficas",
  "teorema-fundamental-calculo": "calculo",
  "limites-acercamiento": "calculo",
  "continuidad-tres-condiciones": "calculo",
  "derivada-secante-tangente": "calculo",
  "reglas-derivacion": "calculo",
  "trascendentes-derivacion": "calculo",
  "extremos-inflexion": "calculo",
  "optimizacion-cilindro": "calculo",
  "diferencial-linealizacion": "calculo",

  // ── Biología y células ──
  "celula-organelos-3d": "celula",
  "metabolismo-celular-3d": "celula",
  "division-celular": "celula",
  "respiracion-celular": "celula",
  "fotosintesis": "planta",
  "adn-dogma-central-3d": "adn",
  "genetica-mendeliana-punnett": "adn",
  "mutaciones-3d": "adn",
  "biotecnologia-crispr-3d": "adn",
  "seleccion-natural-evolucion-3d": "evolucion",
  "origen-vida-3d": "evolucion",

  // ── Ecología y Tierra ──
  "piramide-energia": "ecosistema",
  "biomas-ecosistemas": "ecosistema",
  "redes-troficas": "ecosistema",
  "ciclo-carbono": "ecosistema",
  "deforestacion": "ecosistema",
  "subsistemas-terrestres": "tierra",
};

/** Tema por defecto cuando un slug no está en el mapa (labs nuevos). */
const TEMA_FALLBACK = "molecula";

/** Devuelve la clave de tema para un slug de laboratorio. */
export function temaDeLab(slug: string): string {
  return LAB_TEMA[slug] ?? TEMA_FALLBACK;
}

/** Ruta pública de la imagen temática (WebP optimizado) de un laboratorio. */
export function imagenDeLab(slug: string): string {
  return `/labs/${temaDeLab(slug)}.webp`;
}
