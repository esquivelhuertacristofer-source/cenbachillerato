/**
 * Datos de la Ficha Teórica del laboratorio "Where and when? — la terminal de
 * autobuses" (IN-I-P05, progresión 5 de Inglés I).
 *
 * Contenido VERBATIM de las actividades ancla:
 *   - Marco teórico: lectura A1 «Where and when? — Preguntas sencillas en
 *     inglés».
 *   - Glosario: glosario interactivo A6 (6 términos).
 * Objetivos, materiales, conceptos y aplicaciones son del laboratorio.
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";
import { GLOSARIO, LECTURA_A1, FUENTE } from "./terminal-horarios-ingles-data";

export const TERMINAL_HORARIOS_FICHA: FichaTeoricaData = {
  ancla: "IN-I · P05 · A1 — Where and when? Preguntas sencillas en inglés",

  marcoTeorico: LECTURA_A1,

  objetivos: [
    "Elegir la palabra interrogativa que corresponde al dato que necesitas: Where, What time, When, How much, How long, Which, Is there / Are there.",
    "Formular preguntas con la estructura correcta: is / are con lugares (Where are the restrooms?) y does + verbo base con acciones (What time does the bus leave?).",
    "Iniciar con cortesía una pregunta a un desconocido con Excuse me.",
    "Interpretar un tablero de salidas y llegadas en inglés (departure, arrival, gate, on time, delayed, boarding, canceled) y responder con el dato vigente.",
    "Responder con respuestas cortas y completas: at para horas, on para días, preposiciones de lugar para ubicar y there is / there are para decir si algo existe.",
  ],

  materiales: [
    { nombre: "Terminal de autobuses 3D", detalle: "Central Valle Verde (ficticia): taquillas, cajero, farmacia, cafetería, baños, lockers, sala de espera y 6 andenes.", icono: "fa-building" },
    { nombre: "Tablero de salidas y llegadas", detalle: "Cambia con el reloj: retrasos, cambios de andén y cancelaciones (horarios ilustrativos).", icono: "fa-table-list" },
    { nombre: "Lucy, viajera", detalle: "Necesita datos; tú escribes las preguntas.", icono: "fa-person-walking-luggage" },
    { nombre: "Rosa, empleada del módulo", detalle: "Responde exactamente lo que preguntas, si la pregunta está bien hecha.", icono: "fa-user-tie" },
    { nombre: "Hoja del módulo", detalle: "Horarios de servicios, precios y tiempos de viaje para atender a los visitantes.", icono: "fa-clipboard-list" },
    { nombre: "Voz en inglés (opcional)", detalle: "Escucha las preguntas con la voz en-US de tu navegador.", icono: "fa-volume-high" },
  ],

  conceptos: [
    {
      termino: "Una palabra interrogativa por dato",
      definicion:
        "Where = dónde (lugar). What time = a qué hora (hora exacta). When = cuándo (hora, día o fecha). How much = cuánto cuesta. How long = cuánto tiempo dura. Which = cuál, entre varias opciones (Which gate…?). Si preguntas con la palabra equivocada, te darán otro dato: «Where…?» devuelve un lugar aunque necesitaras una hora.",
    },
    {
      termino: "Preguntas con to be",
      definicion: "Con lugares y estados se invierte el verbo to be: Where is the café? / Where are the restrooms? (is para singular, are para plural). When is the lost and found office open?",
    },
    {
      termino: "Preguntas con does + verbo base",
      definicion:
        "Con verbos de acción (leave, arrive, open, close, cost, take) se usa el auxiliar does y el verbo SIN -s: What time does the bus to Veracruz leave? How much does a ticket cost? How long does the trip take? Errores típicos: «What time the bus leaves?» (falta does) o «does … leaves» (sobra la -s).",
    },
    {
      termino: "Is there…? / Are there…?",
      definicion: "Preguntan si algo existe: Is there an ATM in the terminal? (singular) / Are there any lockers? (plural). Se responde Yes, there is / No, there isn't y Yes, there are / No, there aren't.",
    },
    {
      termino: "Preguntas indirectas (más corteses)",
      definicion: "Can you tell me…? / Do you know…? van seguidas del orden de una afirmación, sin invertir: Can you tell me where the restrooms are? (no «where are the restrooms»).",
    },
    {
      termino: "Leer un tablero",
      definicion:
        "DEPARTURES = salidas; ARRIVALS = llegadas; TIME = hora programada; GATE = andén; REMARKS = observaciones: On time (a tiempo), Delayed (retrasado, con la hora nueva), Boarding (abordando), Departed (ya salió), Arrived (ya llegó), Canceled (cancelado; en inglés británico, cancelled), Gate changed (cambió el andén).",
    },
    {
      termino: "Respuestas cortas y completas",
      definicion: "At para horas (It leaves at 11:40), on para días (on Monday), in para meses (in December), preposición de lugar para ubicar (They're next to the café) y there is / there are para existencia.",
    },
  ],

  glosario: GLOSARIO.map((g) => ({ termino: g.termino, definicion: `${g.definicion} Ejemplo: ${g.ejemplo}` })),

  aplicaciones: [
    "Pedir información en una terminal, un aeropuerto o una estación de tren cuando viajas a un país de habla inglesa.",
    "Leer pantallas de salidas y llegadas en inglés y darte cuenta a tiempo de un retraso o de un cambio de andén.",
    "Orientar a visitantes extranjeros en tu comunidad: dónde está un lugar, a qué hora abre, cuánto cuesta.",
    "Atender a clientes en un trabajo de turismo o servicios respondiendo con frases cortas y claras.",
  ],

  fuente: FUENTE,
};
