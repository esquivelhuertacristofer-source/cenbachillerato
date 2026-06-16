/**
 * Datos de la Ficha Teórica del laboratorio de derivadas de funciones
 * trascendentes (PM-V-P05).
 *
 * Contenido VERBATIM de:
 *   A1 — «Derivadas de funciones trascendentes: seno, coseno, eˣ y ln» (lectura).
 *   A5 — «Glosario — Derivadas de trig, exponencial y logarítmica»
 *        (glosario_interactivo). ✅ Glosario SÍ existe en PM-V-P05-A5.
 *
 * Sin importaciones de three: seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const TRASCENDENTES_FICHA: FichaTeoricaData = {
  ancla: "PM-V-P05-A2",

  // Marco teórico — VERBATIM de la lectura A1 (PM-V-P05-A1).
  marcoTeorico: [
    "Las funciones trascendentes —trigonométricas, exponenciales y logarítmicas— aparecen en los modelos más importantes de la ciencia y la ingeniería. Conocer sus derivadas abre la puerta a modelar oscilaciones, crecimiento, decaimiento y flujo de calor.",
    "Derivadas de funciones trigonométricas. Usando la definición de derivada y el límite notable lim(x→0) sen(x)/x = 1, se demuestran: d/dx [sen x] = cos x; d/dx [cos x] = −sen x; d/dx [tan x] = sec²x. Observa la elegancia del par seno-coseno: la derivada del seno es el coseno, y la del coseno es el seno negativo. Si derivas el seno cuatro veces, vuelves al seno. Esta propiedad de periodicidad de las derivadas explica por qué las funciones trigonométricas describen perfectamente las oscilaciones: un péndulo, una onda sonora, una corriente alterna. Ejemplo con la cadena: d/dx[sen(3x)] = cos(3x) · 3 = 3cos(3x).",
    "La derivada de eˣ: la función que es su propia derivada. d/dx [eˣ] = eˣ. Este resultado extraordinario establece que la función exponencial natural eˣ (donde e ≈ 2.71828...) es la única función (salvo multiplicar por constante) que es igual a su propia derivada. Esta propiedad la hace ideal para modelar cualquier proceso donde la tasa de cambio es proporcional al estado actual: crecimiento bacteriano (N(t) = N₀eᵏᵗ), decaimiento radioactivo (M(t) = M₀e⁻ᵏᵗ), descarga de un condensador en un circuito eléctrico, disipación de calor en un objeto (Ley de Newton de enfriamiento). Ejemplo con la cadena: d/dx[e^(2x)] = e^(2x) · 2 = 2e^(2x).",
    "La derivada del logaritmo natural. d/dx [ln x] = 1/x (para x > 0). Observa que ln x toma una función trascendente y produce una función racional simple. Esto hace que el logaritmo sea una herramienta poderosa para simplificar cálculos. La derivación logarítmica (tomar ln antes de derivar) facilita derivar productos y cocientes complicados. Ejemplo con la cadena: d/dx[ln(x² + 1)] = 1/(x²+1) · 2x = 2x/(x²+1).",
    "Aplicación: decaimiento radioactivo y péndulo. El decaimiento del Carbono-14 se modela con C(t) = C₀e^(−0.000121t), donde t está en años. La tasa de decaimiento en cualquier instante es: C'(t) = −0.000121 · C₀e^(−0.000121t) = −0.000121 · C(t). Esto confirma que la tasa de decaimiento es proporcional a la cantidad presente: un hecho verificado experimentalmente que la derivada de eˣ captura perfectamente. Un péndulo de longitud L (para oscilaciones pequeñas) sigue θ(t) = A·cos(ωt + φ), donde ω = √(g/L). La velocidad angular es θ'(t) = −Aω·sen(ωt + φ), que confirma el patrón: derivada del coseno es menos el seno.",
  ],

  objetivos: [
    "Memorizar y aplicar las derivadas básicas: d/dx[sen x]=cos x, d/dx[cos x]=−sen x, d/dx[tan x]=sec²x.",
    "Aplicar d/dx[eˣ]=eˣ y d/dx[ln x]=1/x, combinándolas con la regla de la cadena para funciones compuestas.",
    "Derivar funciones compuestas tipo sen(g(x)), e^(g(x)) o ln(g(x)) aplicando correctamente la cadena.",
    "Combinar reglas del producto, cociente y cadena con las derivadas trascendentes en una sola expresión.",
    "Resolver el reto evaluable de la actividad A2.",
  ],

  materiales: [
    { nombre: "Curva de f(x)", detalle: "Trascendente seleccionada: trig, exponencial, logarítmica o cadena", icono: "fa-wave-square" },
    { nombre: "Curva de f'(x)", detalle: "Derivada simbólica exacta trazada en ámbar", icono: "fa-chart-line" },
    { nombre: "Sonda x = a", detalle: "Deslizador para recorrer el dominio y ver la pendiente de la tangente", icono: "fa-crosshairs" },
    { nombre: "Recta tangente", detalle: "La pendiente de la tangente a f en a coincide con f'(a)", icono: "fa-ruler-combined" },
  ],

  // Conceptos — formulados desde la lectura A1 verbatim.
  conceptos: [
    { termino: "Derivada de sen x", definicion: "d/dx[sen x] = cos x. Si derivas el seno cuatro veces seguidas, vuelves al seno original (ciclo de periodo 4)." },
    { termino: "Derivada de cos x", definicion: "d/dx[cos x] = −sen x. La derivada del coseno es el seno negativo." },
    { termino: "Derivada de tan x", definicion: "d/dx[tan x] = sec²x = 1/cos²x." },
    { termino: "Derivada de eˣ", definicion: "d/dx[eˣ] = eˣ. La función exponencial natural es la única (salvo múltiplos) que es igual a su propia derivada." },
    { termino: "Derivada de ln x", definicion: "d/dx[ln x] = 1/x (para x > 0). El logaritmo transforma una función trascendente en una racional simple." },
    { termino: "Regla de la cadena", definicion: "d/dx[f(g(x))] = f'(g(x))·g'(x). Se deriva «de afuera hacia adentro». Ejemplo: d/dx[sen(3x)] = cos(3x)·3." },
  ],

  // Glosario VERBATIM de PM-V-P05-A5 (glosario_interactivo). SÍ existe.
  glosario: [
    {
      termino: "Derivadas de seno y coseno",
      definicion: "d/dx[sin x] = cos x; d/dx[cos x] = −sin x. Con la cadena: d/dx[sin(g(x))] = cos(g(x))·g'(x). Ejemplo: d/dx[sin(3x²)] = cos(3x²)·6x = 6x·cos(3x²).",
    },
    {
      termino: "Derivada de la tangente",
      definicion: "d/dx[tan x] = sec²x = 1/cos²x. Con la cadena: d/dx[tan(g(x))] = sec²(g(x))·g'(x). Ejemplo: d/dx[tan(x²+1)] = sec²(x²+1)·2x.",
    },
    {
      termino: "Derivadas de secante, cosecante y cotangente",
      definicion: "d/dx[sec x] = sec x·tan x; d/dx[csc x] = −csc x·cot x; d/dx[cot x] = −csc²x. Ejemplo: d/dx[sec(2x)] = sec(2x)·tan(2x)·2 = 2sec(2x)tan(2x).",
    },
    {
      termino: "Derivada de la exponencial natural eˣ",
      definicion: "d/dx[eˣ] = eˣ. Con la cadena: d/dx[e^(g(x))] = e^(g(x))·g'(x). La exponencial natural es su propia derivada. Ejemplo: d/dx[e^(x²)] = e^(x²)·2x.",
    },
    {
      termino: "Derivada de aˣ (base arbitraria)",
      definicion: "d/dx[aˣ] = aˣ·ln(a), para a > 0 y a ≠ 1. Ejemplo: d/dx[2ˣ] = 2ˣ·ln 2 ≈ 2ˣ·0.693; d/dx[10ˣ] = 10ˣ·ln 10 ≈ 10ˣ·2.303.",
    },
    {
      termino: "Derivada del logaritmo",
      definicion: "d/dx[ln x] = 1/x (x > 0). d/dx[log_a x] = 1/(x·ln a). Con la cadena: d/dx[ln(g(x))] = g'(x)/g(x). Ejemplo: d/dx[ln(x²+3)] = 2x/(x²+3).",
    },
  ],

  aplicaciones: [
    "Modelar el crecimiento bacteriano: N(t) = N₀eᵏᵗ, donde la tasa de reproducción es proporcional al número actual de bacterias.",
    "Calcular la velocidad de decaimiento del Carbono-14: C'(t) = −0.000121·C(t). Confirma que la tasa es proporcional a la cantidad presente.",
    "Describir la velocidad angular de un péndulo: θ'(t) = −Aω·sen(ωt + φ), patrón de la derivada del coseno.",
    "Modelar la descarga de un condensador y la disipación de calor (Ley de Newton de enfriamiento).",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Lectura A1 y Glosario A5, PM-V-P05. Referencia: MCCEMS 2025.",
};
