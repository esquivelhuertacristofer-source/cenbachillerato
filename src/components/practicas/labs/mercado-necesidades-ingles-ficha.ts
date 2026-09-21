/**
 * Datos de la Ficha Teórica del laboratorio "Needs and wishes: el tianguis y el
 * centro de acopio" (IN-II-P07, progresión 7 de Inglés II).
 *
 * Contenido VERBATIM de las actividades ancla:
 *   - Marco teórico: lectura A1 «Expressing Needs and Desires in English».
 *   - Glosario: glosario interactivo A5 (6 términos).
 *   - Frase de empatía: video A8.
 * Los conceptos «would rather», medidas de incontables, some / any y ofrecer
 * ayuda son ampliación del laboratorio y se marcan como tal.
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";
import { GLOSARIO, LECTURA_A1, FUENTE, TITULO_A1, EMPATIA_A8 } from "./mercado-necesidades-ingles-data";

export const MERCADO_NECESIDADES_INGLES_FICHA: FichaTeoricaData = {
  ancla: `IN-II · P07 · A1 — ${TITULO_A1}`,

  marcoTeorico: LECTURA_A1,

  objetivos: [
    "Pedir cosas con cortesía usando «I'd like + sustantivo» en lugar de «I want».",
    "Expresar deseos con «would like + to + verbo» y preferencias con «would rather + verbo».",
    "Distinguir sustantivos contables e incontables y preguntar con how many / how much.",
    "Pedir incontables con una medida: two kilos of rice, two liters of milk.",
    "Preguntar precios con «How much is it?» y entender la cantidad que te dicen.",
    "Elegir entre dos opciones y justificar la elección con «because» y una razón verdadera.",
    "Responder con empatía a una necesidad y ofrecer ayuda concreta: «Would you like me to…?».",
  ],

  materiales: [
    { nombre: "Puesto del tianguis", detalle: "Siete productos con letreros de precio en inglés; lo que compras vuela al canasto y se anota en el ticket.", icono: "fa-store" },
    { nombre: "Lista de Doña Carmen y billete de 250 pesos", detalle: "Cinco productos con cantidad, una nota sobre la fruta y un presupuesto que no debes rebasar.", icono: "fa-receipt" },
    { nombre: "Plaza de la asamblea", detalle: "Cuatro necesidades de la colonia, cada una con dos opciones en maqueta cuyos datos se revelan al preguntar.", icono: "fa-people-group" },
    { nombre: "Fichas de palabras", detalle: "I'd like · I'd like to · I'd rather · las dos opciones · because · tres razones.", icono: "fa-puzzle-piece" },
    { nombre: "Centro de acopio", detalle: "Estantes con arroz, frijoles, agua, cobijas, libros y jabón; una caja para armar y la zona de entregas.", icono: "fa-box-open" },
  ],

  conceptos: [
    {
      termino: "Would like (A1)",
      definicion: "Más cortés que «want». Would like + noun: I would like a glass of water, please. Would like + to + verb: She would like to study medicine. Pregunta: Would you like some coffee? La contracción es I'd like; «would like» nunca lleva -s.",
    },
    {
      termino: "Would rather (ampliación)",
      definicion: "Para decir qué prefieres entre opciones: I'd rather plant trees (= preferiría plantar árboles). Va con el verbo base, SIN «to»: no se dice «I'd rather to plant».",
    },
    {
      termino: "How much / How many (A1)",
      definicion: "How much + incontable (water, money, rice, time): How much water do you need? How many + contable (apples, people, days, liters): How many students are in your class? Para precios: How much is it?",
    },
    {
      termino: "Incontables con medida (ampliación)",
      definicion: "Los incontables no llevan número ni -s directamente; se cuentan con una medida + of: two kilos of rice, two liters of milk, a glass of juice, four bars of soap, a piece of information. La medida sí va en plural: two kilos.",
    },
    {
      termino: "Some / any (ampliación)",
      definicion: "Some en ofrecimientos, peticiones y afirmaciones: Would you like some bananas? We'd like some storybooks. Any en negativas y muchas preguntas: We don't need any money. Many students don't have any.",
    },
    {
      termino: "Elegir y justificar",
      definicion: "Primero la elección y después la razón con because: I'd like to organize a book drive because it is cheaper. La razón tiene que ser verdadera para lo que elegiste.",
    },
    {
      termino: "Empatía y ofrecer ayuda",
      definicion: `Primero reconoce lo que siente la otra persona (I'm sorry to hear that. That sounds really hard.) y después ofrece algo concreto: Would you like me to carry the water for you? Can I help you with some blankets? Video A8: ${EMPATIA_A8}`,
    },
  ],

  glosario: GLOSARIO.map((g) => ({ termino: g.termino, definicion: `${g.definicion} Ejemplo: ${g.ejemplo}` })),

  aplicaciones: [
    "Hacer las compras en un mercado o una tienda cuando viajas: I'd like two kilos of oranges, please. How much is it?",
    "Pedir en un café o restaurante: What would you like? — I'd like a coffee and a sandwich, please.",
    "Participar en una reunión escolar o vecinal y defender una propuesta: I'd rather plant trees because they clean the air.",
    "Organizar o apoyar un centro de acopio y hablar con las personas afectadas con respeto: I'm so sorry. Would you like some water?",
  ],

  fuente: FUENTE,
};
