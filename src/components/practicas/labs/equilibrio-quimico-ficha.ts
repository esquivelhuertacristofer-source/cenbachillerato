/**
 * Datos de la Ficha Teórica del laboratorio de Equilibrio Químico
 * (CNEYT-IV-P10).
 *
 * Contenido VERBATIM de la actividad ancla A1
 * «El equilibrio químico: cuando una reacción nunca se detiene» (lectura)
 * y del glosario A5 «Glosario: equilibrio químico, Kc, Q y Le Châtelier».
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const EQUILIBRIO_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-IV · P10 · A1 — El equilibrio químico: cuando una reacción nunca se detiene",

  // Marco teórico — VERBATIM de la lectura A1 (CNEYT-IV-P10-A1).
  marcoTeorico: [
    "Cuando piensas en una reacción química imaginas que los reactivos se transforman en productos y ahí acaba todo. Eso ocurre en las reacciones IRREVERSIBLES, que avanzan en un solo sentido hasta agotar un reactivo: la combustión de la gasolina o el oxidado (herrumbre) del hierro no se devuelven solos. Se escriben con una flecha sencilla →. Pero muchísimas reacciones son REVERSIBLES: ocurren a la vez en los dos sentidos, los productos vuelven a formar reactivos. Se escriben con una doble flecha ⇌, y pueden alcanzar un estado especial llamado EQUILIBRIO QUÍMICO.",
    "EL EQUILIBRIO ES DINÁMICO. Al principio de una reacción reversible solo hay reactivos, así que únicamente ocurre la reacción DIRECTA (reactivos → productos) a gran velocidad. A medida que se acumulan productos, empieza también la reacción INVERSA (productos → reactivos), cada vez más rápida. Llega un momento en que ambas velocidades se IGUALAN: por cada molécula de producto que se forma, otra se descompone. Eso es el equilibrio químico. Es DINÁMICO, no un reposo: las moléculas siguen reaccionando sin parar en ambos sentidos, pero como lo hacen al mismo ritmo, las CONCENTRACIONES de reactivos y productos ya no cambian. Ojo: que sean constantes no significa que sean iguales entre sí.",
    "LA CONSTANTE DE EQUILIBRIO Kc. Para una reacción general a A + b B ⇌ c C + d D, la constante de equilibrio se define como Kc = [C]^c · [D]^d / ([A]^a · [B]^b): el producto de las concentraciones de los productos, cada una elevada a su coeficiente, dividido entre el de los reactivos. Su valor SOLO depende de la temperatura. Un Kc GRANDE significa que en el equilibrio dominan los productos (la reacción «se va a la derecha»); un Kc PEQUEÑO, que dominan los reactivos. Una reacción «irreversible» en realidad solo tiene una Kc gigantesca: el equilibrio existe, pero está tan corrido a productos que no se nota.",
    "EL COCIENTE Q PREDICE EL SENTIDO. El cociente de reacción Q se calcula con la MISMA fórmula que Kc, pero usando las concentraciones de CUALQUIER instante (no solo las del equilibrio). Comparar Q con Kc dice hacia dónde se moverá el sistema: si Q < Kc faltan productos, así que la reacción avanza a la DERECHA; si Q > Kc sobran productos y avanza a la IZQUIERDA; si Q = Kc, el sistema ya está en equilibrio.",
    "EL PRINCIPIO DE LE CHÂTELIER. Si un sistema en equilibrio se PERTURBA, responde desplazándose en el sentido que CONTRARRESTA el cambio. Si agregas reactivo, el equilibrio se mueve a la derecha para consumirlo; si agregas producto, a la izquierda. Si SUBES LA PRESIÓN (comprimiendo un gas), se desplaza hacia el lado con MENOS moles de gas. Si SUBES LA TEMPERATURA, se desplaza hacia el lado que ABSORBE calor: hacia los productos si la reacción directa es endotérmica (ΔH > 0), hacia los reactivos si es exotérmica (ΔH < 0). Un CATALIZADOR, en cambio, acelera por igual ambas reacciones: hace que el equilibrio llegue antes, pero NO lo desplaza ni cambia Kc.",
    "EN MÉXICO Y EN LA NATURALEZA. El equilibrio químico está por todas partes. El proceso Haber-Bosch (N₂ + 3 H₂ ⇌ 2 NH₃) sintetiza el amoniaco de los fertilizantes que alimentan al campo mexicano; se trabaja a alta presión justamente para desplazar el equilibrio hacia el NH₃ (menos moles de gas). El NO₂ pardo del esmog del Valle de México proviene del equilibrio N₂O₄ ⇌ 2 NO₂. Y en tu propia sangre, el equilibrio del bicarbonato (CO₂ + H₂O ⇌ H₂CO₃ ⇌ HCO₃⁻ + H⁺) mantiene estable el pH para que puedas vivir. Entender el equilibrio químico permite explicar y controlar fenómenos naturales, industriales y biológicos.",
  ],

  objetivos: [
    "Distinguir una reacción reversible (⇌) de una irreversible (→) y reconocer el equilibrio como un estado dinámico.",
    "Escribir y usar la constante de equilibrio Kc = [productos]^coef / [reactivos]^coef.",
    "Calcular el cociente Q y compararlo con Kc para predecir el sentido de la reacción.",
    "Aplicar el principio de Le Châtelier para predecir el efecto de cambiar concentración, presión o temperatura.",
    "Resolver el reto evaluable de la actividad A2 (CNEYT-IV-P10-A2).",
  ],

  materiales: [
    { nombre: "Visor 3D — Equilibrio dinámico", detalle: "Observa cómo las velocidades directa e inversa se igualan", icono: "fa-arrows-rotate" },
    { nombre: "Modo Constante Kc", detalle: "Ve cómo Q se acerca a Kc conforme la reacción avanza", icono: "fa-chart-line" },
    { nombre: "Calculadora Q vs Kc", detalle: "Escribe concentraciones y compara Q con Kc al instante", icono: "fa-calculator" },
    { nombre: "Modo Le Châtelier", detalle: "Simula perturbaciones y visualiza el desplazamiento del equilibrio", icono: "fa-weight-hanging" },
  ],

  // Conceptos centrales — formulados a partir de la lectura A1.
  conceptos: [
    { termino: "Reacción irreversible (→)", definicion: "Avanza en un solo sentido hasta agotar un reactivo; no se devuelve sola (p. ej. combustión de gasolina, herrumbre)." },
    { termino: "Reacción reversible (⇌)", definicion: "Ocurre a la vez en ambos sentidos; los productos vuelven a formar reactivos y puede alcanzar equilibrio." },
    { termino: "Equilibrio dinámico", definicion: "Estado en que las velocidades directa e inversa son iguales y las concentraciones permanecen constantes, aunque las moléculas siguen reaccionando." },
    { termino: "Constante de equilibrio (Kc)", definicion: "Kc = [C]^c·[D]^d / ([A]^a·[B]^b); depende solo de la temperatura. Kc grande ⇒ dominan productos; Kc pequeña ⇒ dominan reactivos." },
    { termino: "Cociente de reacción (Q)", definicion: "Misma fórmula que Kc pero con concentraciones de cualquier instante. Si Q < Kc: reacción va a la derecha; Q > Kc: a la izquierda; Q = Kc: equilibrio." },
    { termino: "Principio de Le Châtelier", definicion: "Si se perturba un sistema en equilibrio, este se desplaza en el sentido que contrarresta el cambio (concentración, presión o temperatura)." },
  ],

  // Glosario — VERBATIM de A5 (CNEYT-IV-P10-A5, glosario_interactivo).
  glosario: [
    {
      termino: "Reacción reversible",
      definicion: "La que ocurre en ambos sentidos y puede alcanzar un equilibrio; se escribe con doble flecha ⇌. Ejemplo: N₂O₄ ⇌ 2 NO₂.",
    },
    {
      termino: "Reacción irreversible",
      definicion: "La que avanza prácticamente en un solo sentido hasta agotar un reactivo; se escribe con →. Ejemplo: La combustión: CH₄ + 2 O₂ → CO₂ + 2 H₂O.",
    },
    {
      termino: "Equilibrio químico",
      definicion: "Estado en que las velocidades directa e inversa son iguales y las concentraciones permanecen constantes. Ejemplo: Un refresco cerrado: CO₂(g) ⇌ CO₂(ac).",
    },
    {
      termino: "Equilibrio dinámico",
      definicion: "El equilibrio no es reposo: las moléculas siguen reaccionando en ambos sentidos al mismo ritmo. Ejemplo: Por cada N₂O₄ que se rompe, otro se forma.",
    },
    {
      termino: "Constante de equilibrio (Kc)",
      definicion: "Cociente [productos]^coef / [reactivos]^coef en el equilibrio; depende solo de la temperatura. Ejemplo: Para H₂ + I₂ ⇌ 2 HI, Kc = 50.5 a 448 °C.",
    },
    {
      termino: "Cociente de reacción (Q)",
      definicion: "Mismo cociente que Kc pero con las concentraciones de cualquier instante; predice el sentido del avance. Ejemplo: Si Q < Kc, la reacción avanza hacia los productos.",
    },
    {
      termino: "Principio de Le Châtelier",
      definicion: "Si se altera un sistema en equilibrio, este se desplaza en el sentido que contrarresta la alteración. Ejemplo: Más presión sobre N₂ + 3 H₂ ⇌ 2 NH₃ favorece el amoniaco.",
    },
    {
      termino: "Reacción endotérmica / exotérmica",
      definicion: "La que absorbe (ΔH>0) o libera (ΔH<0) calor; determina el efecto de la temperatura sobre el equilibrio. Ejemplo: N₂O₄ ⇌ 2 NO₂ es endotérmica: calentar produce más NO₂ pardo.",
    },
    {
      termino: "Catalizador",
      definicion: "Sustancia que acelera ambas reacciones por igual; acerca el equilibrio sin desplazarlo ni cambiar Kc. Ejemplo: El hierro cataliza el proceso Haber-Bosch.",
    },
    {
      termino: "Proceso Haber-Bosch",
      definicion: "Síntesis industrial del amoniaco (N₂ + 3 H₂ ⇌ 2 NH₃) a alta presión, base de los fertilizantes. Ejemplo: Alta presión desplaza el equilibrio hacia el NH₃ (menos moles de gas).",
    },
  ],

  aplicaciones: [
    "Proceso Haber-Bosch (N₂ + 3 H₂ ⇌ 2 NH₃): producción de fertilizantes que alimentan al campo mexicano; alta presión desplaza el equilibrio hacia el amoniaco.",
    "Esmog del Valle de México: equilibrio N₂O₄ ⇌ 2 NO₂ produce el NO₂ pardo característico de la contaminación.",
    "Regulación del pH sanguíneo: CO₂ + H₂O ⇌ H₂CO₃ ⇌ HCO₃⁻ + H⁺ mantiene estable el pH para la vida.",
    "Refresco cerrado: CO₂(g) ⇌ CO₂(ac); al abrir baja la presión y el equilibrio se desplaza liberando el gas.",
  ],

  fuente:
    "MCCEMS 2025 — Ciencias Naturales, Experimentales y Tecnología IV «El poder de la química», contenido formativo: Reacciones reversibles e irreversibles · Constante y ecuación de equilibrio químico · Identificación de reacciones reversibles e irreversibles en la naturaleza.",
};
