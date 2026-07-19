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

  // ── No-STEM (CD/CS/IN/LC) ──
  "bioetica": "laboratorio",
  "busqueda-confiable": "laboratorio",
  "comparativos-ingles": "laboratorio",
  "deteccion-fake-news": "laboratorio",
  "diversidad-discriminacion": "laboratorio",
  "etica-produccion-digital": "laboratorio",
  "factores-produccion": "graficas",
  "herramientas-colaborativas": "laboratorio",
  "necesidades-satisfactores": "laboratorio",
  "personajes-escenarios": "laboratorio",
  "relaciones-poder": "laboratorio",
  "tipos-graficas": "graficas",
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

/**
 * Slugs con carátula específica generada (ComfyUI, ver public/media/{semX}/labs/).
 * A diferencia de la imagen temática (compartida por tema), esta es única por laboratorio.
 * Un slug pertenece a un único semestre; se resuelve el más reciente primero.
 */
const LABS_CON_IMAGEN_ESPECIFICA_SEM2 = new Set<string>([
  "bioetica",
  "busqueda-confiable",
  "clasificacion-expresiones-mosaicos",
  "comparativos-ingles",
  "conservacion-energia-pendulo",
  "deteccion-fake-news",
  "diversidad-discriminacion",
  "ecuacion-lineal-balanza",
  "entropia-segunda-ley",
  "etica-produccion-digital",
  "factores-produccion",
  "factorizacion-area",
  "formas-energia-transformacion",
  "gas-ideal-piston",
  "herramientas-colaborativas",
  "lenguaje-algebraico-mosaicos",
  "maquina-termica-ciclos",
  "necesidades-satisfactores",
  "operaciones-binomios-mosaicos",
  "personajes-escenarios",
  "productos-notables-3d",
  "propagacion-calor",
  "relaciones-poder",
  "tipos-graficas",
  "trabajo-potencia-mecanica",
  "transferencia-calor-mecanismos",
]);

const LABS_CON_IMAGEN_ESPECIFICA_SEM1 = new Set<string>([
  "algoritmos-deciden",
  "concentracion-disolucion",
  "concordancia-conectores",
  "conservacion-materia",
  "constructor-algoritmos",
  "densidad",
  "energia-electricidad",
  "enlaces-quimicos",
  "estado-mexicano",
  "estados-materia",
  "fracciones-porcentajes",
  "hardware-software",
  "licencias-software",
  "modelos-atomicos",
  "navegacion-segura",
  "notacion-cientifica",
  "posesivos-ingles",
  "potencias-raices",
  "presentaciones-ingles",
  "propiedades-materia",
  "razon-proporcion",
  "recta-numerica",
  "separacion-mezclas",
  "taller-parrafos",
  "tipos-de-preguntas",
  "valor-posicional",
]);

const LABS_CON_IMAGEN_ESPECIFICA_SEM3 = new Set<string>([
  "deforestacion",
  "discriminante",
  "ecuacion-cuadratica",
  "ecuacion-lineal-barras",
  "ecuacion-recta",
  "estructura-reaccion",
  "exposicion-oral",
  "falacias-logica",
  "figuras-retoricas",
  "fotosintesis",
  "generos-literarios",
  "inecuaciones-lineales",
  "movimientos-literarios",
  "parabola-trayectoria",
  "pasado-simple-ingles",
  "piramide-energia",
  "redes-troficas",
  "reglas-ingles",
  "resena-critica",
  "semejanza-triangulos",
  "sistemas-ecuaciones-2x2",
  "subgeneros-narrativos",
  "teorema-pitagoras",
  "volumen-cilindro",
]);

const LABS_CON_IMAGEN_ESPECIFICA_SEM4 = new Set<string>([
  "balanceo-ecuaciones",
  "biomoleculas-cuatro-clases",
  "causalidad-historica",
  "circulo-unitario",
  "conicas-lugares-geometricos",
  "consejos-ingles",
  "equilibrio-quimico",
  "funciones-concepto",
  "geometria-analitica",
  "juventudes-politicas",
  "ley-senos-cosenos",
  "modelado-conicas-estimacion",
  "organica-visor",
  "ph-escala",
  "politicas-publicas",
  "reaccion-co2",
  "redox-combustion",
  "respiracion-celular",
  "tiempo-historico",
  "tipos-reacciones-quimicas",
  "transformaciones-funciones",
  "triangulo-rectangulo",
]);

const LABS_CON_IMAGEN_ESPECIFICA_SEM5 = new Set<string>([
  "continuidad-tres-condiciones",
  "dcl-leyes-newton",
  "derivada-secante-tangente",
  "diferencial-linealizacion",
  "electromagnetismo-ohm-faraday",
  "espectro-electromagnetico",
  "extremos-inflexion",
  "fluidos",
  "funciones-variable-real",
  "gravitacion-universal",
  "hipotesis-historicas",
  "limites-acercamiento",
  "mexico-en-el-mundo",
  "mrua-acelerar-frenar",
  "ondas-amplitud-frecuencia",
  "optica-lentes-espejos",
  "optimizacion-cilindro",
  "present-perfect-ingles",
  "procesos-ingles",
  "reglas-derivacion",
  "sentido-historico",
  "teorema-fundamental-calculo",
  "trascendentes-derivacion",
]);

const LABS_CON_IMAGEN_ESPECIFICA_SEM6 = new Set<string>([
  "adn-dogma-central-3d",
  "biotecnologia-crispr-3d",
  "carreras-digitales",
  "celula-organelos-3d",
  "comunicacion-multimodal",
  "datos-graficas-estadisticas",
  "distribucion-normal",
  "division-celular",
  "fuentes-historicas",
  "genetica-mendeliana-punnett",
  "medidas-dispersion",
  "medidas-tendencia-central",
  "metabolismo-celular-3d",
  "mutaciones-3d",
  "origen-vida-3d",
  "seleccion-natural-evolucion-3d",
]);

/** Ruta de la carátula específica de un laboratorio, o null si aún no existe. */
export function imagenEspecificaDeLab(slug: string): string | null {
  if (LABS_CON_IMAGEN_ESPECIFICA_SEM6.has(slug)) return `/media/sem6/labs/${slug}.webp`;
  if (LABS_CON_IMAGEN_ESPECIFICA_SEM5.has(slug)) return `/media/sem5/labs/${slug}.webp`;
  if (LABS_CON_IMAGEN_ESPECIFICA_SEM4.has(slug)) return `/media/sem4/labs/${slug}.webp`;
  if (LABS_CON_IMAGEN_ESPECIFICA_SEM3.has(slug)) return `/media/sem3/labs/${slug}.webp`;
  if (LABS_CON_IMAGEN_ESPECIFICA_SEM2.has(slug)) return `/media/sem2/labs/${slug}.webp`;
  if (LABS_CON_IMAGEN_ESPECIFICA_SEM1.has(slug)) return `/media/sem1/labs/${slug}.webp`;
  return null;
}

/** Mejor imagen disponible para un laboratorio: carátula específica si existe, si no el pool temático. */
export function mejorImagenDeLab(slug: string): string {
  return imagenEspecificaDeLab(slug) ?? imagenDeLab(slug);
}
