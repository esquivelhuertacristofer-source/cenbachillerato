/**
 * Ficha teórica — perfil-personal-ingles (IN-I-P04, Inglés I).
 *
 * El marco teórico es VERBATIM de la lectura A1 «About me — Información
 * personal en inglés», partida en párrafos. El glosario recoge los términos de
 * A6; las tres preguntas que A6 guarda como términos («How old are you?»,
 * «Where are you from?») viven en el propio laboratorio, en el modo «Pregunta
 * y respuesta», y aquí quedan los campos de formulario, que son los términos
 * cortos y concretos.
 *
 * Los `conceptos` son las ideas centrales de ESTE laboratorio —los campos que
 * se confunden y las tres piezas de gramática que sostienen las respuestas— y
 * se usan además para armar el capítulo «Prepárate» de la Expedición.
 *
 * NOTA: el callout «info» que la actividad A1 trae en la base de datos habla
 * del Tec de Monterrey y del aprendizaje basado en retos en Informática, tema
 * que no tiene relación con esta progresión de inglés. Se omite a propósito.
 */
import type { FichaTeoricaData } from "./_ficha";

export const PERFIL_PERSONAL_FICHA: FichaTeoricaData = {
  ancla: "IN-I-P04-A1 · About me — Información personal en inglés",
  marcoTeorico: [
    "Dar y solicitar información personal es una de las interacciones más comunes en inglés. Las preguntas clave son: «What's your name?» → «My name is...» / «I'm...»; «How old are you?» → «I'm [edad] years old.»; «Where are you from?» → «I'm from [ciudad/país].»",
    "«What's your nationality?» → «I'm Mexican / American / French...» (adjetivo de nacionalidad); «What's your phone number?» → «It's [número].»; «What's your address?» → «My address is [calle y número].»; «What's your email?» → «My email is [dirección].»",
    "Nota importante: en inglés las nacionalidades se escriben con mayúscula (Mexican, American, Canadian). Los números telefónicos se dicen dígito por dígito en inglés: el número 55-1234-5678 se dice «five five, one two three four, five six seven eight».",
    "Al llenar formularios en inglés, las etiquetas comunes son: First name (nombre), Last name/Surname (apellido), Date of birth (fecha de nacimiento), Address (dirección), Zip code (código postal), Email address (correo electrónico).",
  ],
  objetivos: [
    "Colocar cada dato personal en el campo que le corresponde en un formulario en inglés, y distinguir los que se confunden: nombre y apellido, nacionalidad y país, teléfono y correo.",
    "Elegir, entre varias respuestas correctas en inglés, la única que contesta la pregunta que se hizo.",
    "Formar la afirmativa, la negativa y la interrogativa del verbo to be, y comprobar qué cambia al cambiar el sujeto.",
    "Pasar de «I am…» a «He is… / She is…» y de «My name is…» a «His name is… / Her name is…» al presentar a otra persona.",
    "Escribir en inglés las etiquetas de un formulario a partir de su definición en español.",
  ],
  materiales: [
    { nombre: "Un formulario en inglés", detalle: "First name, Last name, Age, Nationality, Country, Occupation, Phone number, Email address.", icono: "fa-rectangle-list" },
    { nombre: "Dos fichas de personaje", detalle: "Datos ficticios de Sofía Ramírez Torres y Mateo Herrera Solís: nadie escribe aquí sus datos reales.", icono: "fa-id-card" },
    { nombre: "El verbo to be", detalle: "am, is, are, con su forma negativa (not) y su forma de pregunta (verbo al principio).", icono: "fa-equals" },
    { nombre: "Pronombres y posesivos", detalle: "He / She para el sujeto; His / Her para decir «su».", icono: "fa-user-group" },
    { nombre: "Ocho preguntas de información personal", detalle: "Name, age, origin, nationality, occupation, phone, email, address.", icono: "fa-circle-question" },
  ],
  conceptos: [
    { termino: "First name", definicion: "Nombre de pila. En inglés va primero, al revés de como solemos decirlo en español." },
    { termino: "Last name", definicion: "Apellido. En los formularios aparece también como «Surname»: significan lo mismo." },
    { termino: "Nationality", definicion: "Nacionalidad. Es un adjetivo (Mexican) y siempre lleva mayúscula; no es lo mismo que el país (Mexico)." },
    { termino: "Occupation", definicion: "Ocupación. Se pregunta «What do you do?» y se responde con artículo: «I'm a student»." },
    { termino: "Verb to be", definicion: "El verbo ser/estar: am con I, is con he/she/it, are con you/we/they. La edad y el origen se dicen con él." },
    { termino: "Negative form", definicion: "La negación del verbo to be lleva «not» justo después del verbo: I am not, she is not. No usa «don't»." },
    { termino: "Yes/No question", definicion: "Para preguntar con to be, el verbo salta delante del sujeto: You are… → Are you…?" },
    { termino: "Third person", definicion: "Hablar de alguien más: He / She como sujeto y His / Her como posesivo. «His name is», nunca «He name is»." },
  ],
  glosario: [
    { termino: "First name", definicion: "Nombre de pila: el primer campo de un formulario en inglés." },
    { termino: "Last name", definicion: "Apellido. También aparece como «Surname»." },
    { termino: "Age", definicion: "Edad. Se dice con el verbo to be: «I am 16 years old»." },
    { termino: "Nationality", definicion: "Nacionalidad (con mayúscula en inglés)." },
    { termino: "Address", definicion: "Dirección o domicilio." },
    { termino: "Email address", definicion: "Correo electrónico." },
  ],
  aplicaciones: [
    "A6 (verbatim), actividad final del glosario: «Llena una mini-ficha personal en inglés con 5 datos.»",
    "A3 (verbatim): «Imagina que llenas una solicitud de inscripción a un curso de verano en inglés. Escribe los datos que pedirían (nombre, apellido, edad, nacionalidad, dirección, teléfono, correo). Usa el formato de formulario.»",
    "A7 (verbatim), autoevaluación: «Sé qué datos personales debo proteger al compartirlos.» Por eso este laboratorio trabaja siempre sobre personajes ficticios y nunca pide los datos del alumno.",
  ],
  fuente: "CEN Bachillerato — Inglés I, progresión 4 (IN-I-P04)",
};
