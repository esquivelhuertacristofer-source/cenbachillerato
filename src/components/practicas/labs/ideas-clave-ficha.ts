/**
 * Ficha teórica — ideas-clave-subrayado
 *
 * Contenido VERBATIM de la progresión LC-I-P05 (Lengua y Comunicación I).
 * El marco teórico es la lectura LC-I-P05-A1 íntegra; el glosario sale de
 * LC-I-P05-A6 (con la «oración temática», que la propia lectura A1 nombra);
 * los conceptos centrales son los que el laboratorio hace manipular.
 *
 * Esta ficha arma además los capítulos «Prepárate» y «Comprueba» de la
 * Expedición: por eso los términos son cortos y concretos.
 */
import type { FichaTeoricaData } from "./_ficha";

export const IDEAS_CLAVE_FICHA: FichaTeoricaData = {
  ancla: "LC-I-P05-A1 · Subrayar e identificar lo esencial de un texto",
  marcoTeorico: [
    "Leer un texto implica mucho más que entender las palabras que lo componen. Implica identificar cuáles son las ideas más importantes, cuáles son los detalles de apoyo y cuáles son los ejemplos o datos secundarios. Esta habilidad —conocida como selección de información relevante— es fundamental para el estudio, para la investigación y para la vida cotidiana.",
    "Algunas estrategias útiles para identificar la información más relevante son: subrayar las palabras o frases clave, hacer anotaciones al margen, identificar la oración temática de cada párrafo y formularse preguntas sobre el texto (¿Quién? ¿Qué? ¿Cómo? ¿Por qué? ¿Para qué?).",
    "Una vez identificada la información relevante, podemos elaborar resúmenes, esquemas o mapas conceptuales que nos ayuden a organizar y retener lo aprendido. El resumen no es copiar fragmentos del texto original: es reescribir las ideas principales con nuestras propias palabras, demostrando que realmente comprendimos el contenido.",
  ],
  objetivos: [
    "Subraya con tres marcadores distintos las oraciones de tres textos y distingue la idea principal, el detalle de apoyo y el relleno.",
    "Elige el tema que abarca un texto completo, sin quedarte corto ni pasarte de amplio.",
    "Arma el esquema jerárquico de cada texto: tema, idea principal de cada párrafo y el detalle que la sostiene.",
    "Diagnostica resúmenes ajenos y nombra su defecto: copia literal, quedarse en un detalle o decir lo que el texto no dice.",
    "Completa el texto sobre ideas principales, secundarias y paratextos, y aprueba el reto evaluable de la progresión.",
  ],
  materiales: [
    { nombre: "Tres textos informativos", detalle: "Maíz, Metro de la CDMX y alerta sísmica; tres párrafos cada uno", icono: "fa-newspaper" },
    { nombre: "Marcador de idea principal", detalle: "Resalta la oración temática del párrafo", icono: "fa-highlighter" },
    { nombre: "Marcador de detalle de apoyo", detalle: "Resalta ejemplos, cifras y explicaciones", icono: "fa-pen-nib" },
    { nombre: "Descarte de relleno", detalle: "Tacha lo que no aporta información", icono: "fa-ban" },
    { nombre: "Tablero del esquema", detalle: "Tema, ideas principales y detalles en tres niveles", icono: "fa-sitemap" },
    { nombre: "Banco de resúmenes", detalle: "Nueve resúmenes por diagnosticar", icono: "fa-clipboard-check" },
  ],
  conceptos: [
    { termino: "Idea principal", definicion: "La información más importante de un párrafo o texto." },
    { termino: "Idea secundaria", definicion: "Información que apoya, ejemplifica o amplía la idea principal." },
    { termino: "Oración temática", definicion: "La oración que expresa la idea principal del párrafo y engloba al resto." },
    { termino: "Detalle de apoyo", definicion: "Ejemplo, dato o explicación que respalda la idea principal sin sustituirla." },
    { termino: "Palabra clave", definicion: "Término que concentra el sentido del párrafo y guía el subrayado." },
    { termino: "Subrayado", definicion: "Estrategia de marcar las palabras o frases clave durante la lectura." },
    { termino: "Resumen", definicion: "Versión breve que reescribe las ideas principales con palabras propias." },
    { termino: "Mapa conceptual", definicion: "Esquema que organiza visualmente las relaciones entre las ideas de un texto." },
  ],
  glosario: [
    { termino: "Idea principal", definicion: "La información más importante de un párrafo o texto." },
    { termino: "Idea secundaria", definicion: "Información que apoya, ejemplifica o amplía la idea principal." },
    { termino: "Elemento paratextual", definicion: "Recurso que rodea al texto y ayuda a anticiparlo: título, subtítulos, imágenes, índice." },
    { termino: "Resumen", definicion: "Versión breve que reescribe las ideas principales con palabras propias." },
    { termino: "Subrayado", definicion: "Estrategia de marcar las palabras o frases clave durante la lectura." },
    { termino: "Oración temática", definicion: "Oración de cada párrafo que enuncia su idea principal; puede ir al inicio, en medio o al final." },
  ],
  aplicaciones: [
    "Elena Poniatowska es una de las periodistas y escritoras mexicanas más influyentes del siglo XX. Su libro La noche de Tlatelolco (1971) documenta la masacre estudiantil del 2 de octubre de 1968 a través de testimonios orales — un hito del periodismo narrativo en lengua española.",
    "Quien sabe jerarquizar la información lee más rápido y estudia mejor: es la misma destreza que pide tomar apuntes en clase, preparar un examen, revisar una noticia antes de compartirla o localizar un dato en un reglamento escolar.",
  ],
  fuente: "Material elaborado para CEN Bachillerato",
};
