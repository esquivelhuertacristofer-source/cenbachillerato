/**
 * Datos para el laboratorio del Teorema de Pitágoras (PM-III-P01).
 *
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabPitagoras.tsx) y la escena 3D (PitagorasScene.tsx) sin arrastrar three.js
 * al bundle del shell.
 *
 * Idea pedagógica (MCCEMS 2025 — PM-III): en todo triángulo RECTÁNGULO, el
 * cuadrado construido sobre la hipotenusa tiene la misma área que la suma de los
 * cuadrados construidos sobre los catetos:
 *     a² + b² = c²
 * Construir un cuadrado sobre cada lado y comparar sus áreas hace VISIBLE por qué
 * la relación se cumple, y permite calcular distancias reales (la escalera, la
 * diagonal de una pantalla, el hilo de un papalote) cuando se conocen dos lados.
 */

export interface Escenario {
  key: string;
  titulo: string;
  icono: string; // Font Awesome 6 (solid, free)
  contexto: string; // historia real
  porque: string; // qué representa cada lado
  a: number; // cateto horizontal
  b: number; // cateto vertical
  aNombre: string;
  bNombre: string;
  cNombre: string; // qué es la hipotenusa en el problema
  unidad: string;
}

// Rango de los deslizadores de los catetos (enteros para poder contar cuadritos).
export const CAT_MIN = 2;
export const CAT_MAX = 12;
export const CAT_STEP = 1;

export const ESCENARIOS: Escenario[] = [
  {
    key: "escalera",
    titulo: "La escalera y la pared",
    icono: "fa-stairs",
    contexto:
      "Una escalera se apoya en una pared. Su base está a 3 m del muro y alcanza 4 m de altura. ¿Cuánto mide la escalera?",
    porque:
      "La pared y el suelo forman el ángulo recto: son los catetos (3 m y 4 m). La escalera es la hipotenusa, el lado más largo, frente al ángulo recto.",
    a: 3,
    b: 4, // 3-4-5
    aNombre: "Distancia al muro",
    bNombre: "Altura en la pared",
    cNombre: "Escalera",
    unidad: "m",
  },
  {
    key: "pantalla",
    titulo: "La diagonal de la pantalla",
    icono: "fa-tv",
    contexto:
      "Una pantalla mide 8 cm de ancho y 6 cm de alto. ¿Cuánto mide su diagonal (la medida que anuncian las marcas)?",
    porque:
      "El ancho y el alto son los catetos (forman las esquinas rectas). La diagonal cruza la pantalla de esquina a esquina: es la hipotenusa.",
    a: 8,
    b: 6, // 6-8-10
    aNombre: "Ancho",
    bNombre: "Alto",
    cNombre: "Diagonal",
    unidad: "cm",
  },
  {
    key: "terreno",
    titulo: "La diagonal del terreno",
    icono: "fa-vector-square",
    contexto:
      "Un terreno rectangular mide 5 m por 12 m. ¿Qué distancia hay entre dos esquinas opuestas en línea recta?",
    porque:
      "Los dos lados del rectángulo son los catetos (5 m y 12 m). La línea que cruza de esquina a esquina es la hipotenusa.",
    a: 5,
    b: 12, // 5-12-13
    aNombre: "Lado corto",
    bNombre: "Lado largo",
    cNombre: "Diagonal",
    unidad: "m",
  },
  {
    key: "rampa",
    titulo: "La rampa del parque",
    icono: "fa-person-skating",
    contexto:
      "Una rampa avanza 12 m en horizontal mientras sube 9 m. ¿Cuánto mide la superficie inclinada por la que ruedas?",
    porque:
      "El avance horizontal y la subida vertical son los catetos (12 m y 9 m). La superficie por la que se rueda es la hipotenusa.",
    a: 12,
    b: 9, // 9-12-15
    aNombre: "Avance horizontal",
    bNombre: "Subida",
    cNombre: "Superficie de la rampa",
    unidad: "m",
  },
  {
    key: "papalote",
    titulo: "El hilo del papalote",
    icono: "fa-wind",
    contexto:
      "Un papalote está 7 m de altura y 5 m adelante de quien lo sostiene. ¿Cuánto hilo hay tensado hasta él?",
    porque:
      "La altura y la distancia horizontal son los catetos (7 m y 5 m). El hilo tensado es la hipotenusa. Aquí la respuesta NO es un entero.",
    a: 5,
    b: 7, // √74 ≈ 8.60  (no es terna pitagórica)
    aNombre: "Distancia horizontal",
    bNombre: "Altura",
    cNombre: "Hilo",
    unidad: "m",
  },
];

/** Hipotenusa de un triángulo rectángulo de catetos a y b. */
export const hipotenusa = (a: number, b: number) => Math.hypot(a, b);

/** ¿Los tres lados son enteros (terna pitagórica)? */
export const esTerna = (a: number, b: number) => Number.isInteger(hipotenusa(a, b));

/** Formatea con signo "−" tipográfico y hasta 2 decimales. */
export const fmtNum = (n: number) => {
  const s = Number.isInteger(n)
    ? n.toLocaleString("es-MX")
    : n.toLocaleString("es-MX", { maximumFractionDigits: 2 });
  return s.replace("-", "−");
};
