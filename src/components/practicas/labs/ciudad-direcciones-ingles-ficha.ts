/**
 * Datos de la Ficha Teórica del laboratorio "Directions in town"
 * (IN-II-P06, progresión 6 de Inglés II).
 *
 * Contenido VERBATIM de las actividades ancla:
 *   - Marco teórico: lectura A1 «How to Ask for and Give Directions in
 *     English» (7 párrafos, en inglés como en la plataforma).
 *   - Glosario: glosario interactivo A5 (6 términos).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";
import { GLOSARIO, LECTURA_A1, FUENTE } from "./ciudad-direcciones-ingles-data";

export const CIUDAD_DIRECCIONES_FICHA: FichaTeoricaData = {
  ancla: "IN-II · P06 · A1 — How to Ask for and Give Directions in English",

  marcoTeorico: LECTURA_A1,

  objetivos: [
    "Comprender indicaciones en inglés y seguirlas paso a paso desde el punto de vista de quien camina.",
    "Dar indicaciones en imperativo (go straight, turn left, take the first street on the right, cross the street) que otra persona pueda seguir sin perderse.",
    "Usar referencias visibles (the traffic light, the bank, Reforma Avenue) para indicar dónde girar.",
    "Ubicar lugares con preposiciones: next to, across from / opposite, between … and …, on the corner of … and ….",
    "Preguntar con cortesía: Excuse me, where is…? / how can I get to…? / is there a … near here?",
    "Distinguir there is (singular) de there are (plural) al describir lo que hay en un lugar.",
  ],

  materiales: [
    { nombre: "Barrio 3D en cuadrícula", detalle: "4 calles norte-sur, 4 avenidas este-oeste, 14 lugares, un parque con kiosco y tres semáforos (colonia ficticia).", icono: "fa-city" },
    { nombre: "Emma, turista", detalle: "Sigue las indicaciones que eliges con los botones.", icono: "fa-person-walking" },
    { nombre: "Sam, visitante", detalle: "Ejecuta al pie de la letra la ruta que escribes en inglés.", icono: "fa-person-walking-luggage" },
    { nombre: "Fichas de palabras", detalle: "Para armar preguntas corteses en el orden correcto.", icono: "fa-puzzle-piece" },
    { nombre: "Voz en inglés (opcional)", detalle: "Escucha las indicaciones con la voz en-US de tu navegador.", icono: "fa-volume-high" },
  ],

  conceptos: [
    {
      termino: "Imperativo",
      definicion: "Para dar indicaciones se usa el verbo base sin sujeto: Go straight for two blocks. Turn right. Cross the street. El sujeto (you) se entiende.",
    },
    {
      termino: "Left y right son de quien camina",
      definicion: "«Turn left» es la izquierda de la persona que va caminando, según hacia dónde mira; no la izquierda de quien ve el mapa. Si caminas hacia ti en el mapa, sus lados se ven al revés.",
    },
    {
      termino: "Referencias (landmarks)",
      definicion: "«Turn left at the bank» significa: camina hasta la esquina del banco y ahí gira. «Take the second street on the right» obliga a contar las calles que salen hacia ese lado.",
    },
    {
      termino: "Next to · across from · between",
      definicion: "Next to = al lado, del mismo lado de la calle. Across from (u opposite) = del otro lado de la calle, frente a frente. Between … and … = en medio de dos lugares.",
    },
    {
      termino: "On the corner of … and …",
      definicion: "Ubica un lugar en la esquina donde se cruzan dos calles; se nombran las dos: The health center is on the corner of Reforma Avenue and Juárez Street.",
    },
    {
      termino: "Preguntas corteses",
      definicion: "Empieza con Excuse me. Where is the …? pregunta por el lugar; How can I get to / How do I get to the …? por el camino; Is there a … near here? por si existe uno cerca (there is = singular, there are = plural).",
    },
  ],

  glosario: GLOSARIO.map((g) => ({ termino: g.termino, definicion: `${g.definicion} Ejemplo: ${g.ejemplo}` })),

  aplicaciones: [
    "Orientar en inglés a turistas en tu ciudad o pueblo, usando las referencias que todos conocen.",
    "Pedir ayuda para llegar a una estación, una farmacia o un hospital cuando viajas a un país de habla inglesa.",
    "Leer las indicaciones de una app de mapas en inglés (turn left in 200 feet, your destination is on the right).",
    "Escribir cómo llegar a tu escuela o a un evento de tu comunidad para visitantes que hablan inglés.",
  ],

  fuente: FUENTE,
};
