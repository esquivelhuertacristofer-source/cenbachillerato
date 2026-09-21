/**
 * «Completa el texto» — perfil-personal-ingles
 *
 * VERBATIM de IN-I-P04-A2 («Fill in the form»). El párrafo, las instrucciones,
 * las pistas, las respuestas y las alternativas aceptadas son las de esa
 * actividad; aquí solo se parte el texto por sus huecos.
 *
 * `distingue_mayusculas` viene en falso en la actividad, y `normaliza()` ya
 * ignora mayúsculas y acentos, así que «Last» y «last» valen igual. Se añaden
 * los sinónimos que un formulario real acepta (Surname por Last, mail por
 * email) porque lo que aquí se evalúa es el campo, no la ortografía exacta.
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

export const PERFIL_PERSONAL_HUECOS: TextoHuecosData = {
  ancla: "IN-I-P04-A2 · Fill in the form",
  instrucciones:
    "Completa el formulario y el diálogo con las palabras correctas: name / old / from / nationality / email / address / phone / last",
  partes: [
    "First ",
    ": Ana. ",
    " name: García. Age: I am 17 years ",
    ". I am ",
    " Oaxaca, Mexico. My ",
    " is Mexican. My ",
    " number is 951-234-5678. My home ",
    " is Calle Hidalgo 45. My ",
    " is ana.garcia@correo.com.",
  ],
  huecos: [
    { respuesta: "name", alternativas: [], pista: "First ___ = nombre de pila" },
    { respuesta: "Last", alternativas: ["last", "Surname", "surname"], pista: "___ name = apellido" },
    { respuesta: "old", alternativas: [], pista: "years ___" },
    { respuesta: "from", alternativas: [], pista: "I am ___ Oaxaca" },
    { respuesta: "nationality", alternativas: [], pista: "My ___ is Mexican" },
    { respuesta: "phone", alternativas: [], pista: "___ number = número de teléfono" },
    { respuesta: "address", alternativas: [], pista: "home ___ = domicilio" },
    { respuesta: "email", alternativas: ["e-mail", "mail"], pista: "Mi correo electrónico" },
  ],
};
