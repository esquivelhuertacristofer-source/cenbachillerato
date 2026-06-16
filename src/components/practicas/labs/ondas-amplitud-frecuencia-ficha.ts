/**
 * Datos de la Ficha Teórica del laboratorio de Ondas: amplitud, frecuencia y longitud de onda.
 *
 * Contenido VERBATIM de las actividades ancla de CNEYT-V-P04:
 *   - Marco teórico: lectura A1 «El movimiento ondulatorio: sonido, mar y terremotos» (verbatim).
 *   - Glosario: glosario interactivo A5 «Movimiento ondulatorio» (verbatim).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const ONDAS_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-V · P04 · A1 — El movimiento ondulatorio: sonido, mar y terremotos",

  // Marco teórico — VERBATIM de la lectura A1.
  marcoTeorico: [
    "Una onda es una perturbación que se propaga por un medio (o por el vacío, en el caso de las ondas electromagnéticas) transportando energía sin transportar materia. El movimiento ondulatorio está presente en la naturaleza de manera omnipresente: el sonido que escuchas, las olas del mar, los sismos que sacuden a México, y la luz que te permite leer estas líneas son todos fenómenos ondulatorios.",
    "Las ondas se clasifican según la relación entre la dirección de la perturbación y la dirección de propagación:\n• Ondas transversales: la perturbación es perpendicular a la dirección de propagación. Ejemplos: ondas en una cuerda tensa, ondas sísmicas tipo S (corte), ondas de luz.\n• Ondas longitudinales: la perturbación es paralela a la dirección de propagación. Ejemplos: ondas de sonido, ondas sísmicas tipo P (compresión).",
    "Los parámetros fundamentales de una onda son:\n• Amplitud (A): la máxima perturbación respecto al equilibrio. Determina la intensidad (energía) de la onda. En sonido, mayor amplitud = mayor volumen.\n• Período (T): tiempo que tarda la onda en completar un ciclo completo, medido en segundos.\n• Frecuencia (f): número de ciclos completos por segundo, f = 1/T, medida en Hz (hertz). En sonido, mayor frecuencia = tono más agudo.\n• Longitud de onda (λ): distancia entre dos puntos consecutivos en fase (ej. cresta a cresta), medida en metros.\n• Velocidad de propagación (v): velocidad a la que se desplaza la perturbación. Relación fundamental: v = λ · f.",
    "El sonido es una onda mecánica longitudinal que requiere un medio material para propagarse (no hay sonido en el vacío). La velocidad del sonido en el aire a 20°C es aproximadamente 340 m/s. En agua, el sonido viaja ≈1,480 m/s (más rápido, porque el agua es menos compresible); en sólidos, puede superar los 5,000 m/s.",
    "México es uno de los países más sísmicamente activos del mundo. Los terremotos generan dos tipos de ondas sísmicas que viajan a velocidades distintas:\n• Ondas P (primarias o de compresión): son longitudinales, viajan a ≈8 km/s en la corteza y son las primeras en detectarse. Son menos destructivas pero se propagan por sólidos, líquidos y gases.\n• Ondas S (secundarias o de corte): son transversales, viajan a ≈4 km/s y son más destructivas. Solo se propagan por sólidos (no pasan por el núcleo líquido de la Tierra, lo que sirvió para descubrir su estructura interna).",
    "El Sistema de Alerta Sísmica Mexicano (SASMEX), operado por el CIRES, aprovecha exactamente la diferencia de velocidad entre las ondas P y S. Sus sensores en la costa del Pacífico (Guerrero, Oaxaca) detectan las ondas P de un terremoto (que llegan primero, siendo más rápidas). Al detectarlas, el sistema transmite una alerta a velocidad de la luz (señal de radio/celular) a la Ciudad de México antes de que lleguen las destructivas ondas S (que viajan más lento). Este margen de 40-120 segundos puede ser suficiente para evacuar edificios, detener el metro y preparar hospitales.",
    "El Efecto Doppler describe el cambio en la frecuencia percibida de una onda cuando la fuente o el receptor están en movimiento relativo. Cuando una ambulancia de la Cruz Roja Mexicana se acerca, las ondas de sonido se comprimen (mayor frecuencia, tono más agudo); cuando se aleja, las ondas se expanden (menor frecuencia, tono más grave). Los radares de velocidad en las carreteras mexicanas (SCT) usan el Efecto Doppler con ondas de radio: emiten una onda de frecuencia conocida y miden la diferencia de frecuencia del eco para calcular la velocidad del vehículo.",
  ],

  objetivos: [
    "Identificar las propiedades fundamentales de una onda: amplitud, frecuencia, período, longitud de onda y velocidad de propagación.",
    "Aplicar la relación fundamental v = λ·f para calcular longitud de onda dado el medio y la frecuencia.",
    "Distinguir ondas transversales de longitudinales y dar ejemplos de cada tipo.",
    "Explicar cómo el SASMEX aprovecha la diferencia de velocidad entre ondas P y S para emitir alertas sísmicas.",
    "Describir el Efecto Doppler y su relación con el movimiento relativo entre fuente y receptor.",
    "Resolver el reto evaluable de ondas mecánicas y sonido.",
  ],

  materiales: [
    { nombre: "Generador de onda (modo Onda)", detalle: "Controla amplitud, frecuencia y medio de propagación; calcula λ y T en vivo", icono: "fa-wave-square" },
    { nombre: "Interferómetro (modo Interferencia)", detalle: "Superposición constructiva, destructiva y onda estacionaria con nodos/antinodos", icono: "fa-water" },
    { nombre: "Simulador Doppler", detalle: "Fuente en movimiento: frentes comprimidos (agudo) y expandidos (grave)", icono: "fa-tower-broadcast" },
    { nombre: "Tabla de medios de propagación", detalle: "Aire 340 m/s · Agua 1,480 m/s · Acero 5,100 m/s con código de color", icono: "fa-table-cells" },
  ],

  // Conceptos centrales del lab — formulados a partir de la lectura A1.
  conceptos: [
    { termino: "Onda", definicion: "Perturbación que transporta energía sin transportar materia. Se propaga por un medio (mecánica) o por el vacío (electromagnética)." },
    { termino: "Amplitud (A)", definicion: "Máximo desplazamiento respecto al equilibrio. Determina la energía transportada (E ∝ A²). En sonido, mayor amplitud = mayor volumen." },
    { termino: "Frecuencia (f) y Período (T)", definicion: "f = número de ciclos por segundo (Hz); T = tiempo de un ciclo completo (s). Recíprocos: f = 1/T." },
    { termino: "Longitud de onda (λ)", definicion: "Distancia entre dos puntos consecutivos en igual fase (cresta a cresta). Unidad: metro. Se relaciona con v y f: λ = v/f." },
    { termino: "Velocidad de propagación v = λ·f", definicion: "Rapidez a la que la energía avanza por el medio. Depende del medio, no de la amplitud ni de la frecuencia de la fuente." },
    { termino: "Efecto Doppler", definicion: "Cambio en la frecuencia percibida cuando la fuente o el receptor están en movimiento relativo. Acercamiento → mayor f (agudo); alejamiento → menor f (grave)." },
  ],

  // Glosario — VERBATIM del glosario interactivo A5 de CNEYT-V-P04.
  glosario: [
    { termino: "Amplitud (A)", definicion: "Desplazamiento máximo de una partícula del medio respecto a su posición de equilibrio. Se mide en metros (m). Determina la energía transportada por la onda (E ∝ A²)." },
    { termino: "Frecuencia (f)", definicion: "Número de ciclos completos de oscilación por segundo. Unidad: hertz (Hz = 1/s). Relacionada con el período: f = 1/T." },
    { termino: "Período (T)", definicion: "Tiempo que tarda una partícula en completar un ciclo completo de oscilación. Unidad: segundo (s). T = 1/f." },
    { termino: "Longitud de onda (λ)", definicion: "Distancia entre dos puntos consecutivos en igual fase (por ejemplo, entre dos crestas o dos valles consecutivos). Unidad: metro (m)." },
    { termino: "Velocidad de propagación (v = f·λ)", definicion: "Rapidez a la que la energía de la onda se desplaza por el medio. v = f·λ. Depende de las propiedades del medio, no de la amplitud ni la fuente." },
    { termino: "Ondas transversales y longitudinales", definicion: "Transversales: las oscilaciones son perpendiculares a la dirección de propagación (ej. ondas en una cuerda, ondas de luz). Longitudinales: las oscilaciones son paralelas a la dirección de propagación (ej. sonido, ondas sísmicas P)." },
  ],

  aplicaciones: [
    "El SASMEX aprovecha la diferencia de velocidad entre ondas P y S para alertar a la CDMX con 40-120 segundos de margen antes de que lleguen las ondas S destructivas.",
    "Los radares de velocidad en carreteras mexicanas (SCT) usan el Efecto Doppler con ondas de radio para calcular la velocidad de los vehículos.",
    "Los sonares navales y ultrasonidos médicos usan ondas sonoras de alta frecuencia para mapear fondos marinos y obtener imágenes del interior del cuerpo.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Lectura A1 y glosario A5, CNEYT-V-P04.",
};
