/**
 * Datos de la Ficha Teórica del laboratorio "People, clothes and weather"
 * (IN-I-P06, progresión 6 de Inglés I).
 *
 * Contenido VERBATIM de las actividades ancla:
 *   - Marco teórico: lectura A1 «People, clothes and weather — Describir en
 *     inglés» (5 párrafos).
 *   - Glosario: glosario interactivo A6 (6 términos).
 * Los conceptos centrales resumen la lectura A1 y la infografía IN-II-P04-A1.
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";
import { GLOSARIO, LECTURA_A1, FUENTE } from "./clima-vestimenta-ingles-data";

export const CLIMA_VESTIMENTA_INGLES_FICHA: FichaTeoricaData = {
  ancla: "IN-I · P06 · A1 — People, clothes and weather: describir en inglés",

  marcoTeorico: LECTURA_A1,

  objetivos: [
    "Describir el clima con «It is» + adjetivo (sunny, cloudy, rainy, windy, foggy) y con el Present Continuous (It is raining, It is snowing).",
    "Elegir hot, warm, cool o cold según la temperatura en grados Celsius.",
    "Comprender un pronóstico en inglés y decidir qué ropa conviene, explicando por qué.",
    "Decir lo que alguien lleva puesto con «is wearing» y dar la razón con «because it is…».",
    "Describir la apariencia con to be (tall, slim) y con have / has (short curly hair, a beard).",
    "Describir a las personas con vocabulario neutro y respetuoso, sin juicios de valor.",
  ],

  materiales: [
    { nombre: "La plaza de la colonia", detalle: "Kiosco, papel picado, árboles y un termómetro en °C y °F bajo seis tipos de clima.", icono: "fa-tree-city" },
    { nombre: "Seis pronósticos de México", detalle: "Toluca, Tuxtla Gutiérrez, Hermosillo, Ciudad de México, Cancún y Chihuahua (valores típicos ilustrativos).", icono: "fa-cloud-sun-rain" },
    { nombre: "Perchero con 15 prendas", detalle: "Prendas de arriba, de abajo, calzado y complementos, cada una con su nombre en inglés.", icono: "fa-shirt" },
    { nombre: "La parada del camión", detalle: "Seis personas ficticias de distintas edades, estaturas, complexiones y tonos de piel; una usa silla de ruedas.", icono: "fa-bus" },
  ],

  conceptos: [
    { termino: "It is + adjetivo", definicion: "El clima siempre lleva el sujeto «it»: It is sunny. «Is sunny» o «It sunny» están incompletos." },
    { termino: "Adjetivo o sustantivo", definicion: "rain, sun, cloud, wind, fog y snow son sustantivos. Para describir se usa el adjetivo con -y (rainy, sunny, cloudy, windy, foggy) o el verbo en -ing (raining, snowing)." },
    { termino: "Present Continuous", definicion: "to be + verbo-ing para lo que ocurre ahora: It is raining. She is wearing a raincoat. Para costumbres se usa el Simple Present: She wears jeans to school." },
    { termino: "be, have y wear", definicion: "Estatura y complexión con be (He is tall); rasgos con have/has (She has curly hair); ropa con wear (She is wearing boots). Un paraguas no se «wear»: se carga (carrying an umbrella)." },
    { termino: "Orden y artículos", definicion: "El adjetivo va antes del sustantivo (long black hair). Las prendas plurales van sin «a»: jeans, boots, glasses, sunglasses, gloves." },
    { termino: "Describir sin juzgar", definicion: "Se describe lo observable. Palabras como ugly, weird o fat juzgan; lo neutro es heavy-set, older y «uses a wheelchair»." },
    { termino: "°C y °F", definicion: "En Estados Unidos se usan grados Fahrenheit: °F = °C × 9/5 + 32. 0 °C = 32 °F; 24 °C ≈ 75 °F; 40 °C = 104 °F." },
  ],

  glosario: GLOSARIO.map((g) => ({ termino: g.termino, definicion: `${g.definicion} Ejemplo: ${g.ejemplo}` })),

  aplicaciones: [
    "Entender el pronóstico del tiempo en una aplicación o un noticiero en inglés antes de un viaje.",
    "Describir a una persona a un guardia o a personal de seguridad si se pierde un familiar en un aeropuerto o en un parque.",
    "Atender a turistas en México: recomendarles ropa para el calor de Cancún o el frío de Toluca.",
    "Escribir descripciones respetuosas en trabajos escolares, redes sociales o anuncios.",
  ],

  fuente: FUENTE,
};
