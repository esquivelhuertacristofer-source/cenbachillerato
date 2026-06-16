/**
 * Datos de la Ficha Teórica del laboratorio de Máquinas térmicas y ciclos.
 *
 * Contenido VERBATIM de las actividades ancla de CNEYT-II-P03:
 *   - Marco teórico: lectura A1 «Introducción a la termodinámica: leyes y
 *     aplicaciones» (4 párrafos verbatim).
 *   - Glosario: glosario interactivo A5 «Glosario: trabajo y calor».
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const MAQUINA_TERMICA_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-II · P03 · A1 — Introducción a la termodinámica: leyes y aplicaciones",

  // Marco teórico — VERBATIM de la lectura A1.
  marcoTeorico: [
    "La termodinámica es la rama de la física que estudia las relaciones entre calor, trabajo y temperatura en sistemas que intercambian energía. Sus leyes fundamentales describen límites y posibilidades del universo físico.",
    "La primera ley de la termodinámica es la ley de conservación de la energía aplicada a procesos térmicos: la energía total de un sistema cerrado se conserva. Si un sistema absorbe calor (Q) y realiza trabajo (W), la variación de su energía interna (ΔU) es: ΔU = Q - W. Esto explica por qué los motores necesitan combustible: la energía interna debe reponerse constantemente.",
    "La segunda ley introduce el concepto de entropía (S): la tendencia natural de los sistemas a la desorganización. En cualquier proceso real, la entropía del universo siempre aumenta. Esto explica por qué el calor fluye espontáneamente del cuerpo caliente al frío (y nunca al revés), por qué los motores no pueden ser 100% eficientes, y por qué los procesos naturales son irreversibles.",
    "Las aplicaciones prácticas son enormes. Los refrigeradores funcionan usando trabajo eléctrico para transferir calor del interior frío al exterior caliente (contra el flujo espontáneo). Los motores de combustión interna convierten energía química en calor y parte de ese calor en trabajo mecánico. Los sistemas biológicos mantienen su organización interna (baja entropía) consumiendo energía continuamente.",
  ],

  objetivos: [
    "Comprender la termodinámica como el estudio de las relaciones entre calor, trabajo y temperatura.",
    "Aplicar la primera ley de la termodinámica: la conservación de la energía (ΔU = Q − W).",
    "Reconocer la segunda ley y la entropía: por qué el calor fluye de caliente a frío y ningún motor es 100% eficiente.",
    "Distinguir un motor de calor de un refrigerador como procesos inversos de transferencia de energía.",
    "Resuelve el reto evaluable de la actividad A4",
  ],

  materiales: [
    { nombre: "Visor 3D de la máquina térmica", detalle: "Muestra el motor de calor y el refrigerador con sus focos caliente y frío", icono: "fa-gears" },
    { nombre: "Deslizadores de temperatura", detalle: "Ajustan el foco caliente (T_c) y el foco frío (T_f) del ciclo", icono: "fa-temperature-half" },
    { nombre: "Balance de energía en vivo", detalle: "Calor que entra, trabajo útil y calor desechado (1.ª ley)", icono: "fa-scale-balanced" },
    { nombre: "Lecturas de rendimiento", detalle: "Eficiencia de Carnot (η = 1 − T_f/T_c) y COP del refrigerador", icono: "fa-gauge-high" },
  ],

  // Conceptos centrales del lab — formulados a partir de la lectura A1.
  conceptos: [
    { termino: "Termodinámica", definicion: "Rama de la física que estudia las relaciones entre calor, trabajo y temperatura en sistemas que intercambian energía." },
    { termino: "Primera ley (ΔU = Q − W)", definicion: "Ley de conservación de la energía aplicada a procesos térmicos: la energía total de un sistema cerrado se conserva. Si absorbe calor Q y realiza trabajo W, su energía interna varía ΔU = Q − W." },
    { termino: "Segunda ley y entropía (S)", definicion: "La entropía es la tendencia natural de los sistemas a la desorganización; en cualquier proceso real la entropía del universo siempre aumenta. Por eso el calor fluye espontáneamente de caliente a frío y los motores no pueden ser 100% eficientes." },
    { termino: "Motor de combustión interna", definicion: "Convierte energía química en calor y parte de ese calor en trabajo mecánico." },
    { termino: "Refrigerador", definicion: "Usa trabajo eléctrico para transferir calor del interior frío al exterior caliente, contra el flujo espontáneo." },
  ],

  // Glosario — VERBATIM del glosario interactivo A5 de P03.
  glosario: [
    { termino: "Trabajo mecánico (W)", definicion: "Energía transferida cuando una fuerza desplaza un cuerpo; W = F·d." },
    { termino: "Fuerza (F)", definicion: "Acción capaz de cambiar el movimiento o la forma de un cuerpo; se mide en newtons." },
    { termino: "Fricción", definicion: "Fuerza que se opone al movimiento entre superficies en contacto y que produce calor." },
    { termino: "Calor", definicion: "Energía que se transfiere entre cuerpos debido a una diferencia de temperatura." },
  ],

  aplicaciones: [
    "Los refrigeradores funcionan usando trabajo eléctrico para transferir calor del interior frío al exterior caliente (contra el flujo espontáneo).",
    "Los motores de combustión interna convierten energía química en calor y parte de ese calor en trabajo mecánico.",
    "Los sistemas biológicos mantienen su organización interna (baja entropía) consumiendo energía continuamente.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Lectura A1, CNEYT-II-P03.",
};
