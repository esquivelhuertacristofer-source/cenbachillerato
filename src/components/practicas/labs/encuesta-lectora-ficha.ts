/**
 * Ficha teórica — encuesta-lectora-comunidad
 *
 * Contenido VERBATIM de la progresión LC-I-P02 (Lengua y Comunicación I):
 * el marco teórico es la lectura LC-I-P02-A1 completa; el glosario sale de
 * LC-I-P02-A4; las aplicaciones recogen el recuadro de A1 y el dato nacional
 * del MOLEC (INEGI).
 */
import type { FichaTeoricaData } from "./_ficha";

export const ENCUESTA_LECTORA_FICHA: FichaTeoricaData = {
  ancla: "LC-I-P02-A1 · ¿Qué leen las personas de mi comunidad?",
  marcoTeorico: [
    "Cuando pensamos en quiénes leen en nuestra comunidad, la respuesta puede sorprendernos. La lectura no ocurre solo en la escuela: ocurre en el trabajo, en el hogar, en el transporte público, en las redes sociales y en los mercados. Una persona puede leer las instrucciones de un medicamento, las etiquetas de los productos que compra, los mensajes de WhatsApp de su familia, o los subtítulos de una película.",
    "Investigar los gustos e inclinaciones lectoras de las personas que nos rodean es una forma de reconocer que existen múltiples formas de relacionarse con los textos. Algunas personas prefieren los textos informativos (noticias, artículos, manuales); otras disfrutan los textos narrativos (cuentos, novelas, historias de vida); y otras se inclinan por los textos digitales (publicaciones en redes sociales, blogs, foros).",
    "Esta diversidad no tiene jerarquías: ningún tipo de lectura es más válido que otro. Lo que importa es comprender para qué leemos y cómo la lectura se integra a nuestra vida cotidiana. Al investigar los hábitos lectores de tu comunidad, también aprenderás a formular preguntas, a escuchar activamente y a sistematizar información.",
  ],
  objetivos: [
    "Decide qué preguntas entran a tu encuesta y reconoce las que inducen, son ambiguas o se salen del tema.",
    "Codifica respuestas abiertas reales asignándoles tipo de texto y soporte.",
    "Lee la gráfica que producen tus propios datos y distingue lo que los datos sí dicen de lo que no.",
    "Completa el texto sobre tipos de texto cotidianos y aprueba el cuestionario de la progresión.",
  ],
  materiales: [
    { nombre: "Banco de preguntas candidatas", detalle: "Doce preguntas: seis útiles y seis con un defecto que se nombra.", icono: "fa-clipboard-question" },
    { nombre: "Nueve respuestas de la comunidad", detalle: "Testimonios ilustrativos de estudiantes, docentes, familias y personal de la escuela.", icono: "fa-users" },
    { nombre: "Tabla de codificación", detalle: "Tipo de texto (informativo / narrativo / digital) y soporte (papel / pantalla / calle).", icono: "fa-table-list" },
    { nombre: "Gráfica de frecuencias en vivo", detalle: "Las barras crecen conforme codificas cada respuesta.", icono: "fa-chart-simple" },
  ],
  conceptos: [
    { termino: "Comunidad escolar", definicion: "Las personas que conviven alrededor de la escuela: estudiantes, docentes, familias y personal de apoyo." },
    { termino: "Hábito lector", definicion: "Lo que una persona lee de manera habitual, en qué momento lo lee y para qué lo hace." },
    { termino: "Encuesta", definicion: "Instrumento que plantea las mismas preguntas a varias personas para poder comparar sus respuestas." },
    { termino: "Pregunta abierta", definicion: "Pregunta que se contesta con las propias palabras, sin opciones dadas de antemano." },
    { termino: "Pregunta inducida", definicion: "Pregunta que deja ver la respuesta esperada y empuja a la persona a contestar eso." },
    { termino: "Pregunta ambigua", definicion: "Pregunta cuyo significado cambia según quién la escuche, así que sus respuestas no son comparables." },
    { termino: "Tabular respuestas", definicion: "Ordenar las respuestas en categorías y contar cuántas caen en cada una." },
    { termino: "Frecuencia", definicion: "Número de veces que una categoría aparece en los datos recogidos." },
    { termino: "Muestra", definicion: "Conjunto de personas que efectivamente contestaron; no equivale a toda la comunidad." },
  ],
  glosario: [
    { termino: "Texto informativo", definicion: "Texto que reporta hechos y datos verificables sobre la realidad." },
    { termino: "Texto narrativo", definicion: "Texto que relata hechos reales o ficticios a lo largo del tiempo." },
    { termino: "Texto digital", definicion: "Texto que circula en pantallas y plataformas electrónicas." },
    { termino: "Soporte", definicion: "Material o medio físico/electrónico donde aparece el texto." },
    { termino: "Formato", definicion: "Manera en que se organiza y presenta visualmente el texto." },
    { termino: "Escucha activa", definicion: "Atender lo que la persona dice y registrarlo con fidelidad, sin corregirlo ni completarlo." },
  ],
  aplicaciones: [
    "El INEGI levanta cada febrero el MOLEC (Módulo sobre Lectura) en 32 ciudades de 100 mil habitantes o más, entre población de 18 años y más que sabe leer y escribir. Considera cinco materiales: libros, revistas, periódicos, historietas y páginas de internet, foros o blogs. Alrededor de 7 de cada 10 personas encuestadas declaran haber leído alguno de ellos en los últimos doce meses (INEGI, MOLEC 2024). Las etiquetas, los instructivos y los avisos de la calle no entran en esa cuenta: cada encuesta decide qué cuenta como leer.",
    "La Academia Mexicana de la Lengua (AML) y el Diccionario del Español de México (DEM) de El Colegio de México son los referentes mexicanos para resolver dudas sobre el uso correcto del español, incluido el vocabulario técnico y digital. La Fundéu RAE, de origen español, también ofrece recomendaciones, pero no es una institución mexicana.",
  ],
  fuente: "Progresión LC-I-P02 · Material elaborado para CEN Bachillerato. Dato nacional: INEGI, Módulo sobre Lectura (MOLEC), febrero de 2024.",
};
