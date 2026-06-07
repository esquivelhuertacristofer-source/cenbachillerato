/**
 * Datos para el laboratorio de Ecuaciones lineales — el modelo de barras
 * (PM-II-P04-A2, "Planteo y resuelvo ecuaciones lineales").
 *
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabEcuaciones.tsx) y la escena 3D (EcuacionesScene.tsx).
 *
 * Idea pedagógica (MCCEMS 2025 — PM-II, pensamiento algebraico):
 * el reto de esta actividad es PLANTEAR (traducir un problema en palabras a una
 * ecuación a·x + b = c) y luego resolverlo. El "modelo de barras" (tape diagram)
 * lo hace visible: cada cantidad de la historia es un segmento de una barra.
 *   · a·x  = la parte que depende de la incógnita (a copias de x, o una tasa)
 *   · b    = la parte fija (lo que se suma siempre)
 *   · c    = la meta (el total conocido)
 * Resolver es hallar el valor de x que hace que la barra a·x + b alcance
 * exactamente la meta c. El despeje es x = (c − b) / a.
 *
 * Se diferencia del laboratorio de la balanza (PM-II-P09-A8), que enfatiza el
 * equilibrio y la propiedad de uniformidad al despejar.
 */

export interface Escenario {
  key: string;
  titulo: string;
  icono: string; // Font Awesome 6 (solid, free)
  historia: string; // el problema en palabras (verbatim de la actividad)
  comoPlantear: string; // cómo se traduce a la ecuación
  a: number; // coeficiente de la incógnita
  b: number; // término constante
  c: number; // total (meta)
  xNombre: string; // nombre de la incógnita (x, h, …)
  unidad: string; // unidad del resultado ("", "horas", "años")
  xMin: number;
  xMax: number;
  xStep: number;
}

export const ESCENARIOS: Escenario[] = [
  {
    key: "numero",
    titulo: "El número misterioso",
    icono: "fa-hashtag",
    historia: "El doble de un número aumentado en 7 es igual a 23. ¿Cuál es el número?",
    comoPlantear: "Sea x el número. «El doble» es 2x; «aumentado en 7» suma 7; «es igual a 23» da el total: 2x + 7 = 23.",
    a: 2,
    b: 7,
    c: 23,
    xNombre: "x",
    unidad: "",
    xMin: 0,
    xMax: 16,
    xStep: 1,
  },
  {
    key: "artesano",
    titulo: "El artesano",
    icono: "fa-hammer",
    historia: "Un artesano cobra $150 por hora de trabajo más $200 de materiales fijos. Si cobró $950 en total, ¿cuántas horas trabajó?",
    comoPlantear: "Sea h las horas. Las horas cuestan 150·h; los materiales suman 200 fijos; el total cobrado es 950: 150h + 200 = 950.",
    a: 150,
    b: 200,
    c: 950,
    xNombre: "h",
    unidad: "horas",
    xMin: 0,
    xMax: 10,
    xStep: 1,
  },
  {
    key: "hermanos",
    titulo: "Los dos hermanos",
    icono: "fa-user-group",
    historia: "Dos hermanos tienen en total 45 años. El mayor tiene 9 años más que el menor. ¿Cuántos años tiene cada uno?",
    comoPlantear: "Sea x la edad del menor. El mayor es x + 9. Juntos suman 45: x + (x + 9) = 45, es decir 2x + 9 = 45.",
    a: 2,
    b: 9,
    c: 45,
    xNombre: "x",
    unidad: "años",
    xMin: 0,
    xMax: 30,
    xStep: 1,
  },
];

/** Valor que resuelve a·x + b = c, es decir x = (c − b) / a. */
export const solucion = (e: Escenario) => (e.c - e.b) / e.a;

/** Total actual de la barra para un valor de x: a·x + b. */
export const total = (a: number, b: number, x: number) => a * x + b;

/** Cadena de la ecuación a·x + b = c (oculta coeficiente 1 y término 0). */
export const ecuacionStr = (e: Escenario) => {
  const coef = e.a === 1 ? "" : String(e.a);
  const termino = e.b === 0 ? "" : ` + ${e.b}`;
  return `${coef}${e.xNombre}${termino} = ${e.c}`;
};

/** Formatea un número con coma decimal es-MX y "−" tipográfico. */
export const fmtNum = (n: number, dec = 0) => {
  const s = n.toLocaleString("es-MX", { maximumFractionDigits: dec });
  return s.replace("-", "−");
};
