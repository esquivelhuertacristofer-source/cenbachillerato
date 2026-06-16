/**
 * Datos de la Ficha Teórica del laboratorio de Formas y transformación de la
 * energía.
 *
 * Contenido VERBATIM de las actividades ancla de CNEYT-II-P01:
 *   - Marco teórico: lectura A1 «Formas de energía en el mundo cotidiano»
 *     (4 párrafos verbatim).
 *   - Glosario: glosario interactivo A5 «Glosario: energía y sus formas».
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const FORMAS_ENERGIA_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-II · P01 · A1 — Formas de energía en el mundo cotidiano",

  // Marco teórico — VERBATIM de la lectura A1.
  marcoTeorico: [
    "La energía es la capacidad de producir cambios o de realizar trabajo. No podemos crearla ni destruirla, pero sí transformarla de una forma a otra. Este principio se llama conservación de la energía y es uno de los más fundamentales de la física.",
    "En la naturaleza encontramos distintas formas de energía. La energía cinética es la energía del movimiento: un carro en marcha, una pelota cayendo, el viento que sopla. Depende de la masa y la velocidad del objeto (Ec = ½mv²). La energía potencial es la energía almacenada en función de la posición: un libro en un estante tiene energía potencial gravitacional que se libera al caer (Ep = mgh).",
    "La energía térmica está relacionada con el movimiento de los átomos y moléculas que forman la materia: cuanto más rápido se mueven, mayor es la temperatura. La energía luminosa (o radiante) es transportada por ondas electromagnéticas, como la luz del Sol. Finalmente, la energía eléctrica es el resultado del movimiento de cargas eléctricas a través de un conductor.",
    "En la vida cotidiana, los transformadores de energía son omnipresentes. Una planta hidroeléctrica convierte energía potencial del agua en energía cinética (la turbina) y luego en energía eléctrica (el generador). Una planta solar fotovoltaica convierte energía luminosa en energía eléctrica. Nuestro cuerpo convierte energía química (los alimentos) en energía mecánica (el movimiento) y energía térmica (el calor corporal).",
  ],

  objetivos: [
    "Definir la energía como la capacidad de producir cambios o realizar trabajo.",
    "Reconocer el principio de conservación: la energía no se crea ni se destruye, solo se transforma.",
    "Identificar las distintas formas de energía: cinética, potencial, térmica, luminosa, eléctrica y química.",
    "Observar las transformaciones de energía en transformadores cotidianos (hidroeléctrica, solar, cuerpo humano).",
    "Resolver el reto evaluable de la actividad A2.",
  ],

  materiales: [
    { nombre: "Visor 3D del transformador", detalle: "Muestra cómo la energía fluye y cambia de forma en cada aparato", icono: "fa-bolt" },
    { nombre: "Selector de transformadores", detalle: "Hidroeléctrica, solar, foco, cuerpo humano y otros casos cotidianos", icono: "fa-sliders" },
    { nombre: "Deslizador de energía de entrada", detalle: "Regula los joules que entran al transformador", icono: "fa-battery-full" },
    { nombre: "Balance de energía", detalle: "Energía útil + calor disipado = energía de entrada (se conserva)", icono: "fa-scale-balanced" },
  ],

  // Conceptos centrales del lab — formulados a partir de la lectura A1.
  conceptos: [
    { termino: "Energía", definicion: "La capacidad de producir cambios o de realizar trabajo. No podemos crearla ni destruirla, pero sí transformarla de una forma a otra." },
    { termino: "Conservación de la energía", definicion: "Principio según el cual la energía no se crea ni se destruye, solo se transforma de una forma a otra. Es uno de los más fundamentales de la física." },
    { termino: "Energía cinética", definicion: "La energía del movimiento: un carro en marcha, una pelota cayendo, el viento. Depende de la masa y la velocidad del objeto (Ec = ½mv²)." },
    { termino: "Energía potencial", definicion: "La energía almacenada en función de la posición: un libro en un estante tiene energía potencial gravitacional que se libera al caer (Ep = mgh)." },
    { termino: "Transformadores de energía", definicion: "Aparatos cotidianos que convierten una forma de energía en otra, como una planta hidroeléctrica (potencial → cinética → eléctrica) o una planta solar (luminosa → eléctrica)." },
  ],

  // Glosario — VERBATIM del glosario interactivo A5 de P01.
  glosario: [
    { termino: "Energía", definicion: "Capacidad de un sistema para producir cambios o realizar trabajo." },
    { termino: "Energía cinética", definicion: "Energía que tiene un cuerpo debido a su movimiento." },
    { termino: "Energía potencial", definicion: "Energía almacenada que depende de la posición o el estado de un cuerpo." },
    { termino: "Energía química", definicion: "Energía almacenada en los enlaces de las sustancias." },
    { termino: "Joule (J)", definicion: "Unidad de energía y de trabajo en el Sistema Internacional." },
  ],

  aplicaciones: [
    "Una planta hidroeléctrica convierte energía potencial del agua en energía cinética (la turbina) y luego en energía eléctrica (el generador).",
    "Una planta solar fotovoltaica convierte energía luminosa en energía eléctrica.",
    "Nuestro cuerpo convierte energía química (los alimentos) en energía mecánica (el movimiento) y energía térmica (el calor corporal).",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Lectura A1, CNEYT-II-P01.",
};
