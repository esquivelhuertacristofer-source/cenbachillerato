/**
 * Ficha teórica — temas-ideas-narrativa
 *
 * Contenido VERBATIM de la progresión LC-II-P05 (Lengua y Comunicación II).
 * El marco teórico es la lectura LC-II-P05-A1 íntegra; el glosario sale de
 * LC-II-P05-A5, más los dos términos que este laboratorio hace manipular
 * («asunto» y «motivo recurrente») y que la progresión usa sin definir.
 *
 * Esta ficha arma además los capítulos «Prepárate» y «Comprueba» de la
 * Expedición: por eso los términos son cortos y concretos.
 */
import type { FichaTeoricaData } from "./_ficha";

export const TEMAS_IDEAS_FICHA: FichaTeoricaData = {
  ancla: "LC-II-P05-A1 · El tema y las ideas en la narrativa popular",
  marcoTeorico: [
    "Todo texto narrativo trata sobre algo: ese “algo” es el tema. El tema es la idea central que el autor quiere explorar o comunicar a través de su historia. Puede ser explícito (mencionado directamente) o implícito (deducible del desarrollo de la historia). Ejemplos de temas comunes en narrativas populares: la lucha entre el bien y el mal, la importancia de la comunidad, el peligro de la ambición desmedida, la fuerza del amor.",
    "Al mismo tiempo, dentro de un texto hay ideas centrales (las más importantes, sin las cuales el texto perdería su sentido principal) e ideas secundarias (que enriquecen, contextualizan o apoyan las ideas centrales, pero que podrían eliminarse sin destruir el sentido del texto).",
    "Saber distinguir el tema de las ideas centrales y secundarias es fundamental para comprender profundamente cualquier texto narrativo. Esta habilidad también te ayudará a organizar tus propios textos: al definir con claridad el tema de lo que quieres escribir, podrás seleccionar qué información es central y qué es secundaria.",
  ],
  objetivos: [
    "Separa, en tres narrativas populares, lo que pasa (el asunto) de aquello sobre lo que la historia hace pensar (el tema).",
    "Elige entre tres temas candidatos el único que el texto sostiene, y descarta los que sólo suponemos.",
    "Señala los hilos que sostienen el tema: el motivo que se repite, el objeto que vuelve y lo que dice un personaje.",
    "Mide el tema: descarta la formulación demasiado amplia y la que se queda en un detalle.",
    "Empareja seis relatos distintos por el tema que comparten y nombra ese tema compartido.",
    "Escribe de memoria el glosario de la progresión y completa el texto de LC-II-P05-A6.",
  ],
  materiales: [
    { nombre: "Tres narrativas populares", detalle: "Una leyenda de camino, un cuento de familia y un relato de la partida", icono: "fa-book-open" },
    { nombre: "Dos cajas de lectura", detalle: "«Lo que pasa» y «De qué trata», para repartir doce tarjetas", icono: "fa-boxes-stacked" },
    { nombre: "Tablero de hilos", detalle: "Cinco líneas por relato; sólo dos sostienen el tema", icono: "fa-diagram-project" },
    { nombre: "Regla del tema", detalle: "Tres medidas: demasiado amplio, a la medida, demasiado estrecho", icono: "fa-ruler-horizontal" },
    { nombre: "Mesa de comparación", detalle: "Seis fichas de relato para armar tres parejas por tema", icono: "fa-clone" },
    { nombre: "Glosario de memoria", detalle: "Seis términos que se escriben, no se arrastran", icono: "fa-spell-check" },
  ],
  conceptos: [
    { termino: "Tema", definicion: "Asunto general del que trata un texto, expresable en pocas palabras." },
    { termino: "Asunto", definicion: "Lo que pasa en la historia: los hechos que se cuentan, en el orden en que se cuentan." },
    { termino: "Idea principal", definicion: "Afirmación más importante que el texto hace sobre el tema." },
    { termino: "Idea secundaria", definicion: "Idea que apoya, explica o ejemplifica la idea principal." },
    { termino: "Tema implícito", definicion: "Tema que no se menciona en el texto y el lector deduce del desarrollo de la historia." },
    { termino: "Motivo recurrente", definicion: "Detalle, objeto o frase que vuelve a aparecer en el relato y sostiene el tema." },
    { termino: "Narrativa popular", definicion: "Relato que una comunidad cuenta y transmite de boca en boca: leyenda, corrido, cuento tradicional." },
    { termino: "Comparación de temas", definicion: "Analizar cómo distintas narrativas tratan un mismo tema." },
  ],
  glosario: [
    { termino: "Tema", definicion: "Asunto general del que trata un texto, expresable en pocas palabras." },
    { termino: "Idea principal", definicion: "Afirmación más importante que el texto hace sobre el tema." },
    { termino: "Idea secundaria", definicion: "Idea que apoya, explica o ejemplifica la idea principal." },
    { termino: "Comparación de temas", definicion: "Analizar cómo distintas narrativas tratan un mismo tema." },
    { termino: "Asunto", definicion: "Lo que pasa en la historia: los hechos que se cuentan, en el orden en que se cuentan." },
    { termino: "Motivo recurrente", definicion: "Detalle, objeto o frase que vuelve a aparecer en el relato y sostiene el tema." },
  ],
  aplicaciones: [
    "Las narrativas populares mexicanas —leyendas, corridos, cuentos de camino— se transmiten oralmente y cambian de boca en boca: los nombres, los lugares y los detalles se mueven, pero el tema suele ser lo que se conserva. Por eso dos versiones muy distintas de un mismo relato se siguen reconociendo como el mismo relato.",
    "Distinguir el tema del asunto sirve fuera de la clase de Lengua: es lo que se hace al resumir una película para recomendarla, al explicar de qué trata una canción o al decidir si dos noticias hablan en realidad del mismo problema.",
  ],
  fuente: "Material elaborado para CEN Bachillerato — LC-II",
};
