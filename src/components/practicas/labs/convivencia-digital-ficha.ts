/**
 * Ficha teórica del laboratorio «Convivencia digital» (CD-I-P07).
 *
 * El marco teórico es VERBATIM de la lectura CD-I-P07-A1 y las definiciones del
 * glosario son las de CD-I-P07-A5 (las mismas que relaciona A9). Alimenta
 * además los capítulos «Prepárate» (conceptos) y «Comprueba» (glosario) de la
 * Expedición.
 */
import type { FichaTeoricaData } from "./_ficha";
import { MARCO, FUENTE } from "./convivencia-digital-data";

export const CONVIVENCIA_FICHA: FichaTeoricaData = {
  ancla: "CD-I-P07-A1 · Identidades y respeto en el ciberespacio",

  marcoTeorico: MARCO,

  objetivos: [
    "Comprobar que un mismo mensaje cambia de sentido según el canal, el tono y si lleva o no el motivo.",
    "Reconocer qué revela un perfil sin decirlo, y cerrarlo sin dejar de estar presente.",
    "Distinguir una molestia de un ciberacoso por la repetición, el desequilibrio de poder y la intención de dañar.",
    "Elegir la respuesta proporcional a la gravedad: hablar, no responder, documentar, bloquear, reportar o pedir ayuda a una persona adulta.",
    "Reescribir una respuesta hostil en una respuesta firme, que dice el hecho, el efecto y lo que se pide.",
    "Aplicar la netiqueta y la comunicación inclusiva en los espacios digitales de todos los días.",
  ],

  materiales: [
    { nombre: "Consola de mensajes", detalle: "Cuatro canales, cuatro tonos y el motivo del mensaje, para ver el efecto de cada combinación.", icono: "fa-sliders" },
    { nombre: "Perfil público", detalle: "Siete elementos de un perfil, con lo que cada uno revela sin decirlo.", icono: "fa-id-card" },
    { nombre: "Medidores de exposición y presencia", detalle: "Para comprobar que borrarlo todo también cuesta.", icono: "fa-gauge" },
    { nombre: "Cuatro casos de convivencia", detalle: "Una broma, un rumor, un hostigamiento sostenido y una suplantación.", icono: "fa-folder-open" },
    { nombre: "Catálogo de respuestas", detalle: "Diez acciones posibles, de hablarlo en privado a pedir ayuda a una persona adulta.", icono: "fa-list-check" },
    { nombre: "Mesa de reescritura", detalle: "Tres mensajes hostiles partidos en movimientos, con su versión agresiva, sumisa y firme.", icono: "fa-pen-to-square" },
  ],

  conceptos: [
    {
      termino: "Identidad digital",
      definicion: "Lo que decides mostrar de ti en cada espacio digital. No viene dada: se construye eligiendo qué compartes, cómo te presentas y con quién interactúas.",
    },
    {
      termino: "Huella digital",
      definicion: "El rastro que dejan tus publicaciones, tus horarios y tus ubicaciones. De él se deduce información que nunca escribiste.",
    },
    {
      termino: "Empatía digital",
      definicion: "Ponerse en el lugar del otro en entornos virtuales, reconociendo que las palabras escritas también duelen y los silencios también excluyen.",
    },
    {
      termino: "Desequilibrio de poder",
      definicion: "Ventaja de un lado sobre el otro —más gente, más popularidad, o tener algo tuyo— que impide a la persona afectada defenderse sola.",
    },
    {
      termino: "Respuesta proporcional",
      definicion: "Elegir la reacción según la gravedad: no es lo mismo una broma que hirió una vez que un hostigamiento repetido.",
    },
    {
      termino: "Mensaje firme",
      definicion: "El que dice el hecho, el efecto y lo que se pide, sin insultar y sin retirar lo pedido. No es agresivo ni sumiso.",
    },
    {
      termino: "Suplantación de identidad",
      definicion: "Hacerse pasar por otra persona usando su nombre, su foto o su cuenta. Daña a la persona suplantada y a quien recibe los mensajes.",
    },
    {
      termino: "Evidencia digital",
      definicion: "Capturas con fecha, enlaces y nombres de cuenta que sostienen lo que ocurrió cuando el contenido original desaparece.",
    },
  ],

  glosario: [
    { termino: "Diversidad digital", definicion: "Presencia de personas con distintas identidades, culturas y formas de pensar en el ciberespacio." },
    { termino: "Comunicación inclusiva", definicion: "Forma de comunicarse que respeta y representa a todas las personas." },
    { termino: "Ciberacoso", definicion: "Acoso u hostigamiento hacia una persona mediante medios digitales." },
    { termino: "Netiqueta", definicion: "Conjunto de normas de buena conducta y respeto en la comunicación digital." },
    { termino: "Discurso de odio", definicion: "Expresión que ataca o degrada a una persona o a un grupo por su origen, género, creencia u orientación." },
    { termino: "Anonimato", definicion: "Actuar en línea sin que se sepa quién eres; la distancia que da reduce la sensación de consecuencias." },
  ],

  aplicaciones: [
    "Decidir, antes de enviar, si ese mensaje va al grupo o a la persona.",
    "Revisar tu perfil y quitar los datos de los que se deduce dónde estás y a qué hora.",
    "Acompañar a alguien que está recibiendo mensajes ofensivos: guardar evidencia y buscar a una persona adulta.",
    "Cortar la cadena de un rumor escribiendo en privado a quien te lo reenvió.",
    "Acordar tres reglas de convivencia para el grupo de chat del salón (actividad final de A5).",
  ],

  fuente: FUENTE,
};
