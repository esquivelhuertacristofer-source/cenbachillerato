/**
 * Datos del laboratorio "Técnicas de conteo: contar para decidir"
 * (PM-VI-P11, progresión 4 de Pensamiento Matemático VI).
 *
 * OJO con la numeración: en PM-VI el sufijo del código NO coincide con el
 * número de progresión. La progresión 4 ("Selecciona y aplica una técnica de
 * conteo…") es la que lleva los códigos PM-VI-P11-*.
 *
 * El laboratorio se ancla al ejercicio A2 «Cuenta y calcula: comités, podios y
 * probabilidad», que viaja verbatim como reto evaluable; el marco teórico es la
 * lectura A1 y el glosario el A5.
 *
 * Los conteos no se escriben a mano: los arreglos y las selecciones se
 * ENUMERAN uno por uno, y los totales de pantalla son la longitud de esas
 * listas. Que P(n,r) = C(n,r)·r! se ve, no se afirma.
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { RetoNumericoData } from "./_reto-numerico";

/* ── Modos ────────────────────────────────────────────────────────────── */
export type Modo = "multiplicativo" | "orden" | "reemplazo";

export const MODOS: Modo[] = ["multiplicativo", "orden", "reemplazo"];

export interface ModoDef {
  etq: string;
  subtitulo: string;
  icono: string;
  color: string;
  fuente: "A1" | "A2" | "A5";
}

export const MODOS_DEF: Record<Modo, ModoDef> = {
  multiplicativo: {
    etq: "Principio multiplicativo",
    subtitulo: "Un árbol que se ramifica por etapas",
    icono: "fa-sitemap",
    color: "#7dd3fc",
    fuente: "A1",
  },
  orden: {
    etq: "¿Importa el orden?",
    subtitulo: "Podio (permutación) frente a comité (combinación)",
    icono: "fa-ranking-star",
    color: "#fbbf24",
    fuente: "A2",
  },
  reemplazo: {
    etq: "Con y sin reemplazo",
    subtitulo: "Eventos independientes y dependientes",
    icono: "fa-flask-vial",
    color: "#34d399",
    fuente: "A1",
  },
};

/* ── Aritmética exacta ───────────────────────────────────────────────── */

export function factorial(n: number): number {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

/** P(n,r) = n!/(n−r)! */
export function permutacionesCuenta(n: number, r: number): number {
  if (r < 0 || r > n) return 0;
  let out = 1;
  for (let i = 0; i < r; i++) out *= n - i;
  return out;
}

/** C(n,r) = n!/[r!(n−r)!] */
export function combinacionesCuenta(n: number, r: number): number {
  if (r < 0 || r > n) return 0;
  return Math.round(permutacionesCuenta(n, r) / factorial(r));
}

function mcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : mcd(b, a % b);
}

/** Fracción reducida "a/b". */
export function fraccion(num: number, den: number): string {
  if (den === 0) return "—";
  const g = mcd(num, den) || 1;
  return `${num / g}/${den / g}`;
}

/* ══════════════════════════════════════════════════════════════════════
 * MODO 1 · PRINCIPIO MULTIPLICATIVO
 * ══════════════════════════════════════════════════════════════════════ */

export interface EtapaDef {
  nombre: string;
  /** Prefijo corto de cada opción: P1, P2… */
  prefijo: string;
  color: string;
  icono: string;
}

/** Las dos primeras etapas son el ejemplo verbatim de la lectura A1. */
export const ETAPAS: EtapaDef[] = [
  { nombre: "Playeras", prefijo: "P", color: "#60a5fa", icono: "fa-shirt" },
  { nombre: "Pantalones", prefijo: "J", color: "#f472b6", icono: "fa-person" },
  { nombre: "Zapatos", prefijo: "Z", color: "#fbbf24", icono: "fa-shoe-prints" },
];

export const OPCIONES_MAX = 4;

/** Cada hoja del árbol: la ruta de opciones elegidas, p. ej. [2, 0, 1]. */
export function hojasDelArbol(opciones: number[]): number[][] {
  let rutas: number[][] = [[]];
  for (const n of opciones) {
    const nuevas: number[][] = [];
    for (const r of rutas) for (let i = 0; i < n; i++) nuevas.push([...r, i]);
    rutas = nuevas;
  }
  return rutas;
}

export function etiquetaRuta(ruta: number[]): string {
  return ruta.map((i, k) => `${ETAPAS[k]!.prefijo}${i + 1}`).join("·");
}

/* ══════════════════════════════════════════════════════════════════════
 * MODO 2 · PERMUTACIONES Y COMBINACIONES
 * ══════════════════════════════════════════════════════════════════════ */

export interface Persona {
  nombre: string;
  inicial: string;
  color: string;
}

/** El grupo verbatim del ejercicio A2. */
export const PERSONAS: Persona[] = [
  { nombre: "Ana", inicial: "A", color: "#f472b6" },
  { nombre: "Beto", inicial: "B", color: "#60a5fa" },
  { nombre: "Carla", inicial: "C", color: "#fbbf24" },
  { nombre: "Diego", inicial: "D", color: "#34d399" },
  { nombre: "Eva", inicial: "E", color: "#c084fc" },
];

/** Todos los arreglos ordenados de r índices entre n, en orden lexicográfico. */
export function enumerarPermutaciones(n: number, r: number): number[][] {
  const out: number[][] = [];
  const actual: number[] = [];
  const usado = Array<boolean>(n).fill(false);
  const rec = () => {
    if (actual.length === r) {
      out.push([...actual]);
      return;
    }
    for (let i = 0; i < n; i++) {
      if (usado[i]) continue;
      usado[i] = true;
      actual.push(i);
      rec();
      actual.pop();
      usado[i] = false;
    }
  };
  rec();
  return out;
}

/** Todas las selecciones de r índices entre n, sin orden (crecientes). */
export function enumerarCombinaciones(n: number, r: number): number[][] {
  const out: number[][] = [];
  const actual: number[] = [];
  const rec = (desde: number) => {
    if (actual.length === r) {
      out.push([...actual]);
      return;
    }
    for (let i = desde; i < n; i++) {
      actual.push(i);
      rec(i + 1);
      actual.pop();
    }
  };
  rec(0);
  return out;
}

/** La combinación (conjunto ordenado) a la que pertenece un arreglo. */
export function claveConjunto(arr: number[]): string {
  return [...arr].sort((a, b) => a - b).join(",");
}

export function nombresDe(arr: number[]): string {
  return arr.map((i) => PERSONAS[i]!.nombre).join(" - ");
}

/* ══════════════════════════════════════════════════════════════════════
 * MODO 3 · CON Y SIN REEMPLAZO
 * ══════════════════════════════════════════════════════════════════════ */

export interface UrnaDef {
  id: string;
  etq: string;
  /** Qué representa el objeto especial, en singular y plural. */
  especial: string;
  especiales: string;
  total: number;
  marcadas: number;
  /** Rótulo corto de la urna, p. ej. «4 reyes de 52 cartas». */
  rotulo: string;
  /** El experimento solo tiene sentido con reemplazo (un dado siempre "vuelve"). */
  soloConReemplazo: boolean;
  nota: string;
  /** Etiqueta de cada bola cuando son pocas (el dado muestra sus caras). */
  etiquetas?: string[];
}

export const URNAS: UrnaDef[] = [
  {
    id: "dado",
    etq: "Un dado, dos tiros",
    especial: "6",
    especiales: "seises",
    total: 6,
    marcadas: 1,
    rotulo: "Un 6 entre 6 caras",
    soloConReemplazo: true,
    nota: "Inciso (d) del ejercicio A2. Tirar un dado dos veces es con reemplazo: la cara que salió vuelve a estar disponible.",
    etiquetas: ["1", "2", "3", "4", "5", "6"],
  },
  {
    id: "reyes",
    etq: "Baraja: dos reyes seguidos",
    especial: "rey",
    especiales: "reyes",
    total: 52,
    marcadas: 4,
    rotulo: "4 reyes de 52 cartas",
    soloConReemplazo: false,
    nota: "El ejemplo de la lectura A1: la segunda carta sabiendo que la primera ya fue un rey.",
  },
  {
    id: "urna",
    etq: "Urna de 10 con 3 doradas",
    especial: "dorada",
    especiales: "doradas",
    total: 10,
    marcadas: 3,
    rotulo: "3 doradas de 10 bolas",
    soloConReemplazo: false,
    nota: "Pocas bolas: la diferencia entre devolver o no devolver se nota mucho.",
  },
];

export function urnaPorId(id: string): UrnaDef {
  return URNAS.find((u) => u.id === id) ?? URNAS[0]!;
}

export interface ArbolDosExtracciones {
  /** P(1.ª especial) */
  p1: { num: number; den: number };
  /** P(2.ª especial | 1.ª especial) */
  p2dado1: { num: number; den: number };
  /** P(2.ª especial | 1.ª NO especial) */
  p2dadoNo1: { num: number; den: number };
  /** P(las dos especiales) = p1 · p2dado1 */
  ambas: { num: number; den: number };
}

export function arbolExtracciones(u: UrnaDef, conReemplazo: boolean): ArbolDosExtracciones {
  const N = u.total;
  const K = u.marcadas;
  const p1 = { num: K, den: N };
  const p2dado1 = conReemplazo ? { num: K, den: N } : { num: K - 1, den: N - 1 };
  const p2dadoNo1 = conReemplazo ? { num: K, den: N } : { num: K, den: N - 1 };
  return { p1, p2dado1, p2dadoNo1, ambas: { num: p1.num * p2dado1.num, den: p1.den * p2dado1.den } };
}

/* ══════════════════════════════════════════════════════════════════════
 * Reto de estrellas: ¿permutación o combinación?
 * ══════════════════════════════════════════════════════════════════════ */

export interface SituacionConteo {
  texto: string;
  n: number;
  r: number;
  importaOrden: boolean;
  porque: string;
}

export const SITUACIONES: SituacionConteo[] = [
  { texto: "Elegir presidente, secretario y tesorero de un club entre 6 personas.", n: 6, r: 3, importaOrden: true, porque: "Cada cargo es distinto: Ana presidenta y Beto secretario no es lo mismo que al revés." },
  { texto: "Formar un equipo de 3 personas entre 6 para una exposición.", n: 6, r: 3, importaOrden: false, porque: "Un equipo es el mismo sin importar en qué orden se nombre a sus integrantes." },
  { texto: "Decidir el 1.º y 2.º lugar de una carrera de 7 corredores.", n: 7, r: 2, importaOrden: true, porque: "Llegar primero no es lo mismo que llegar segundo." },
  { texto: "Escoger 2 sabores de helado entre 7 para una copa.", n: 7, r: 2, importaOrden: false, porque: "Fresa con limón es la misma copa que limón con fresa." },
  { texto: "Acomodar 4 libros distintos en 4 lugares de un estante.", n: 4, r: 4, importaOrden: true, porque: "Cambiar el orden de los libros produce un estante distinto." },
  { texto: "Elegir 4 preguntas de un banco de 8 para un examen.", n: 8, r: 4, importaOrden: false, porque: "El examen tiene las mismas preguntas sin importar el orden en que se escogieron." },
  { texto: "Crear una clave de 3 letras distintas usando solo A, B, C, D y E.", n: 5, r: 3, importaOrden: true, porque: "ABC y CBA son claves diferentes." },
  { texto: "Repartir 5 cartas de una pila de 10 para formar una mano.", n: 10, r: 5, importaOrden: false, porque: "Una mano de cartas es la misma sin importar el orden en que llegaron." },
];

export function respuestaSituacion(s: SituacionConteo): number {
  return s.importaOrden ? permutacionesCuenta(s.n, s.r) : combinacionesCuenta(s.n, s.r);
}

/* ══════════════════════════════════════════════════════════════════════
 * Textos — VERBATIM de las actividades ancla
 * ══════════════════════════════════════════════════════════════════════ */

export const PROBLEMA =
  "Antes de calcular la probabilidad de algo, muchas veces hay que CONTAR de cuántas formas distintas puede ocurrir. Para eso existen las TÉCNICAS DE CONTEO.";

export const DEFINICION =
  "La pregunta clave para elegir la técnica es: ¿importa el orden? Si sí, permutación; si no, combinación.";

/** Lectura A1 — los seis párrafos, verbatim. */
export const LECTURA_A1: string[] = [
  "Antes de calcular la probabilidad de algo, muchas veces hay que CONTAR de cuántas formas distintas puede ocurrir. Para eso existen las TÉCNICAS DE CONTEO. La más básica es el PRINCIPIO MULTIPLICATIVO: si una decisión se toma en etapas, el total de resultados es el producto de las opciones de cada etapa. Por ejemplo, si tienes 3 playeras y 2 pantalones, puedes formar 3 × 2 = 6 atuendos. Este principio es la base de todo lo demás.",
  "PERMUTACIONES: cuando IMPORTA el orden. Una PERMUTACIÓN es un arreglo de objetos en el que el orden sí importa. ¿De cuántas formas pueden quedar el 1.º, 2.º y 3.er lugar de una carrera de 5 corredores? El primero puede ser cualquiera de los 5, el segundo cualquiera de los 4 restantes y el tercero de los 3: 5 × 4 × 3 = 60. En general, las permutaciones de n objetos tomados de r en r son P(n,r) = n! / (n−r)!, donde n! (factorial) es el producto de todos los enteros del 1 al n. El orden distingue: «Ana-Beto-Carla» es distinto de «Carla-Beto-Ana».",
  "COMBINACIONES: cuando NO importa el orden. Una COMBINACIÓN es una selección en la que el orden NO importa. ¿De cuántas formas se puede elegir un comité de 3 personas entre 5? Aquí «Ana, Beto, Carla» es el mismo comité que «Carla, Beto, Ana». Las combinaciones de n tomados de r son C(n,r) = n! / [r!·(n−r)!]. Siempre hay menos combinaciones que permutaciones, porque varias permutaciones equivalen a una sola combinación. La pregunta clave para elegir la técnica es: ¿importa el orden? Si sí, permutación; si no, combinación.",
  "CON Y SIN REEMPLAZO. Al extraer objetos, importa si se devuelven o no. SIN REEMPLAZO, cada extracción reduce el total disponible (sacar 2 cartas de una baraja sin regresarlas). CON REEMPLAZO, se devuelve el objeto y el total no cambia (tirar un dado dos veces). Esto afecta directamente el conteo y la probabilidad.",
  "DE CONTAR A LA PROBABILIDAD. La probabilidad clásica de un evento es P = casos favorables / casos posibles, y ambos se obtienen contando. Por ejemplo, la probabilidad de ganar un sorteo donde eliges 6 números de 49 es 1 / C(49,6), un número diminuto. Cuando hay varios eventos, hay que distinguir: dos eventos son INDEPENDIENTES si el resultado de uno no afecta al otro (dos tiros de dado); entonces P(A y B) = P(A) × P(B). Son DEPENDIENTES si uno afecta al otro (sacar dos cartas sin reemplazo): la probabilidad de la segunda depende de lo que pasó en la primera.",
  "PROBABILIDAD CONDICIONADA. La PROBABILIDAD CONDICIONADA P(B|A) es la probabilidad de que ocurra B SABIENDO que ya ocurrió A: P(B|A) = P(A y B) / P(A). Por ejemplo, la probabilidad de sacar un rey en la segunda carta sabiendo que la primera ya fue un rey. Dominar el conteo y estas reglas permite calcular probabilidades reales y tomar decisiones informadas: evaluar un juego de azar, un sorteo o el riesgo de un evento.",
];

/** Preguntas de comprensión de la lectura A1 — verbatim. */
export const PREGUNTAS: string[] = [
  "¿Cómo se decide si usar una permutación o una combinación?",
  "¿Qué diferencia hay entre eventos independientes y dependientes?",
  "¿Qué expresa la probabilidad condicionada P(B|A)?",
];

export const INSTRUCCIONES: string[] = [
  "En «Principio multiplicativo», cambia cuántas opciones hay en cada etapa y agrega una tercera. Cada hoja del árbol es un resultado distinto: cuéntalas y compáralas con el producto.",
  "En «¿Importa el orden?», elige cuántos lugares hay (r) y alterna entre podio y comité. Reproduce los arreglos para verlos pasar uno por uno.",
  "Con el comité elegido, fíjate en los podios resaltados en la lista: son todos los órdenes posibles de las mismas personas. Siempre son r! por cada comité.",
  "Activa «Solo comités con Ana» para resolver el inciso (c): cuenta los comités que la incluyen y divide entre el total.",
  "En «Con y sin reemplazo», extrae dos objetos de la urna. Alterna el reemplazo y observa cómo cambia la probabilidad de la segunda extracción.",
  "Simula miles de pares de extracciones y compara la frecuencia observada con el árbol de probabilidades.",
  "Resuelve las situaciones de la tarjeta de estrellas: decide primero si importa el orden y después cuenta.",
  "Cierra con el reto evaluable: los cuatro incisos del ejercicio A2.",
];

export const IDEAS: string[] = [
  "Antes de usar cualquier fórmula, pregúntate si cambiar el orden produce un resultado distinto. Esa respuesta decide la técnica.",
  "El principio multiplicativo es el origen de todo: P(n,r) = n × (n−1) × … es multiplicar las opciones que quedan en cada etapa.",
  "Cada combinación de r objetos se puede ordenar de r! maneras. Por eso C(n,r) = P(n,r) / r! y siempre hay menos combinaciones.",
  "Con reemplazo, la segunda extracción no se entera de la primera: los eventos son independientes y las probabilidades se multiplican tal cual.",
  "Sin reemplazo, el total disminuye y la probabilidad de la segunda extracción depende de lo que salió: eso es probabilidad condicionada.",
  "Con muchos objetos y pocas extracciones, con y sin reemplazo dan casi lo mismo; con pocos objetos, la diferencia es grande.",
];

/** Hechos del quiz verdadero/falso A4 — verbatim. */
export const HECHOS: string[] = [
  "En una permutación importa el orden de los elementos; en una combinación no. Por eso un podio (orden) es permutación y un comité (sin orden) es combinación.",
  "Hay MENOS combinaciones que permutaciones, porque varias permutaciones (que solo difieren en el orden) equivalen a una sola combinación.",
  "Para dos eventos independientes, P(A y B) = P(A) × P(B): como uno no afecta al otro, se multiplican sus probabilidades (regla del producto).",
  "Extraer dos cartas de una baraja sin devolverlas son eventos DEPENDIENTES, porque al no reemplazar la primera carta cambian las posibilidades de la segunda.",
  "La probabilidad condicionada P(B|A) es la probabilidad de B sabiendo que ya ocurrió A: P(B|A) = P(A y B)/P(A).",
];

export interface DatoClave {
  valor: string;
  texto: string;
  icono: string;
}

export const DATOS: DatoClave[] = [
  { valor: "3 × 2 = 6", texto: "Tres playeras y dos pantalones forman seis atuendos.", icono: "fa-shirt" },
  { valor: "P(5,3) = 60", texto: "Podios posibles de 3 lugares entre 5 personas.", icono: "fa-ranking-star" },
  { valor: "C(5,3) = 10", texto: "Comités de 3 entre las mismas 5 personas.", icono: "fa-people-group" },
  { valor: "1 / 13 983 816", texto: "Probabilidad de acertar un sorteo de 6 números entre 49: 1 / C(49,6).", icono: "fa-ticket" },
];

export const CONTEXTO =
  "La probabilidad de ganar un sorteo donde eliges 6 números de 49 es 1 / C(49,6). Contar esas combinaciones da 13 983 816: comprar un boleto a la semana durante toda una vida adulta no alcanza ni al 0.03 % de ellas. Contar bien es lo que permite evaluar un juego de azar antes de apostar.";

export const FUENTE =
  "MCCEMS 2025 — Pensamiento Matemático VI «Pensamiento estadístico y probabilístico», contenido formativo: Técnicas de conteo · Probabilidad dependiente e independiente · Probabilidad condicionada.";

/** Glosario A5 — los 9 términos verbatim. */
export interface GlosarioItem {
  termino: string;
  definicion: string;
  ejemplo: string;
}

export const GLOSARIO: GlosarioItem[] = [
  { termino: "Principio multiplicativo", definicion: "Si una tarea se hace en etapas, el total de resultados es el producto de las opciones de cada etapa.", ejemplo: "3 playeras × 2 pantalones = 6 atuendos." },
  { termino: "Factorial (n!)", definicion: "Producto de todos los enteros positivos del 1 al n.", ejemplo: "4! = 4×3×2×1 = 24." },
  { termino: "Permutación", definicion: "Arreglo en el que importa el orden: P(n,r)=n!/(n−r)!.", ejemplo: "Podio de 3 entre 5: P(5,3)=60." },
  { termino: "Combinación", definicion: "Selección en la que no importa el orden: C(n,r)=n!/[r!(n−r)!].", ejemplo: "Comité de 3 entre 5: C(5,3)=10." },
  { termino: "Con/sin reemplazo", definicion: "Si el objeto extraído se devuelve (con) o no (sin) antes de la siguiente extracción.", ejemplo: "Dado dos veces: con reemplazo. Dos cartas seguidas: sin reemplazo." },
  { termino: "Probabilidad clásica", definicion: "Casos favorables entre casos posibles.", ejemplo: "Sacar par en un dado: 3/6 = 1/2." },
  { termino: "Eventos independientes", definicion: "El resultado de uno no afecta al otro; P(A y B)=P(A)×P(B).", ejemplo: "Dos tiros de dado." },
  { termino: "Eventos dependientes", definicion: "Uno afecta al otro; la probabilidad del segundo cambia según el primero.", ejemplo: "Sacar dos cartas sin reemplazo." },
  { termino: "Probabilidad condicionada", definicion: "P(B|A)=P(A y B)/P(A): probabilidad de B sabiendo que ocurrió A.", ejemplo: "Rey en la 2.ª carta sabiendo que la 1.ª fue rey." },
];

/* ── Reto evaluable: el ejercicio A2, verbatim ────────────────────────── */

export const RETO_A2: RetoNumericoData = {
  titulo: "Cuenta y calcula: comités, podios y probabilidad",
  contexto:
    "El ejercicio aplica el contenido formativo: técnicas de conteo (permutaciones vs combinaciones), probabilidad como favorables/posibles, y la regla del producto para eventos independientes.",
  problema:
    "En un grupo de 5 estudiantes: Ana, Beto, Carla, Diego y Eva.\n\na) PODIO. ¿De cuántas formas pueden ocupar el 1.º, 2.º y 3.er lugar de un concurso? (¿Importa el orden?)\n\nb) COMITÉ. ¿De cuántas formas se puede elegir un comité de 3 entre los 5? (¿Importa el orden?)\n\nc) PROBABILIDAD. Si el comité de 3 se elige al azar, ¿cuál es la probabilidad de que Ana quede incluida?\n\nd) INDEPENDENCIA. Si se lanza un dado dos veces, ¿cuál es la probabilidad de sacar 6 en ambos lanzamientos?",
  campos: [
    { etiqueta: "a) Podios posibles", objetivo: 60, tolerancia: 0.01, unidad: "formas" },
    { etiqueta: "b) Comités posibles", objetivo: 10, tolerancia: 0.01, unidad: "comités" },
    { etiqueta: "c) P(Ana en el comité)", objetivo: 0.6, tolerancia: 0.01, unidad: "en decimal", placeholder: "0.6" },
    { etiqueta: "d) P(6 y 6)", objetivo: 1 / 36, tolerancia: 0.001, unidad: "en decimal", placeholder: "0.0278" },
  ],
  pasosGuia: [
    "a) Importa el orden (1.º ≠ 2.º) ⇒ permutación P(5,3) = 5×4×3 = 60 formas.",
    "b) No importa el orden (un comité es el mismo sin importar cómo se nombre) ⇒ combinación C(5,3) = 5!/(3!·2!) = 120/(6·2) = 10 comités.",
    "c) Comités que incluyen a Ana: fijamos a Ana y elegimos 2 de los 4 restantes = C(4,2) = 6. Probabilidad = 6/10 = 0.6 = 60%.",
    "d) Lanzamientos independientes: P(6) = 1/6 cada uno ⇒ P(6 y 6) = 1/6 × 1/6 = 1/36 ≈ 0.0278 ≈ 2.78%.",
  ],
  respuestaFinal: "a) P(5,3) = 60 formas. b) C(5,3) = 10 comités. c) 6/10 = 0.6 = 60% incluye a Ana. d) 1/6 × 1/6 = 1/36 ≈ 2.78%.",
};
