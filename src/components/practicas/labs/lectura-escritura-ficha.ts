/**
 * Ficha teórica — lectura-escritura-dialogo (LC-I-P01).
 *
 * El marco teórico es VERBATIM de la lectura LC-I-P01-A1 («Lectura y escritura:
 * un diálogo permanente») y la aplicación es su callout «¿Sabías?», también
 * verbatim. El glosario es el de LC-I-P01-A5, salvo «Borrador», que se añade
 * aquí porque el laboratorio lo pone a trabajar en los tres circuitos.
 *
 * Los `conceptos` son los que el alumno manipula en el laboratorio: las cuatro
 * funciones que clasifica, el circuito que arma y la lectura en voz alta que la
 * propia lectura A1 nombra. Van aparte del glosario a propósito: la Expedición
 * usa una lista para el capítulo de «Prepárate» y la otra para el de
 * «Comprueba», y repetirlas dejaría los dos capítulos diciendo lo mismo.
 */
import type { FichaTeoricaData } from "./_ficha";

export const LECTURA_ESCRITURA_FICHA: FichaTeoricaData = {
  ancla: "LC-I-P01-A1 · Lectura y escritura: un diálogo permanente",
  marcoTeorico: [
    "Leer y escribir son dos caras de la misma moneda. Cuando leemos, construimos significado a partir de las palabras de otras personas; cuando escribimos, creamos significado para que otras personas lo lean. Esta relación no es unidireccional: la lectura alimenta a la escritura y la escritura transforma nuestra manera de leer.",
    "Desde muy pequeños aprendemos que las letras representan sonidos y que los sonidos forman palabras. Pero leer y escribir van mucho más allá de ese código. Leer un texto literario nos invita a imaginar mundos posibles; leer un artículo informativo nos pide activar nuestra capacidad crítica; escribir un diario personal nos ayuda a procesar emociones y experiencias.",
    "En el Modelo Educativo 2025, la Lengua y Comunicación propone que desarrolles estas habilidades no de forma aislada sino en situaciones reales y significativas: investigando tu comunidad, analizando textos que te interesan, practicando la lectura en voz alta y preparando exposiciones orales. Todo esto porque la lengua es, antes que nada, una práctica social: la usamos para relacionarnos, para aprender, para expresarnos y para transformar nuestra realidad.",
  ],
  objetivos: [
    "Arma los tres circuitos del sentido y observa cómo leer y escribir se alternan hasta cerrarse.",
    "Clasifica doce textos reales según lo que hacen: imaginar, activar la crítica, procesar o transformar.",
    "Escribe de memoria los cinco términos del glosario de la progresión.",
    "Completa el texto sobre la lengua como práctica social.",
    "Escribe tu propia reflexión sobre leer y escribir usando el vocabulario del tema.",
    "Toma postura en el debate y reconoce un punto válido de la postura contraria.",
    "Aprueba el reto evaluable de la actividad LC-I-P01-A2.",
  ],
  materiales: [
    { nombre: "Circuito del sentido", detalle: "Tres situaciones para ordenar paso a paso", icono: "fa-rotate" },
    { nombre: "Banco de textos", detalle: "Doce textos para clasificar por su función", icono: "fa-layer-group" },
    { nombre: "Glosario de la progresión", detalle: "Cinco términos verbatim de LC-I-P01-A5", icono: "fa-spell-check" },
    { nombre: "Cuaderno de reflexión", detalle: "Espacio de escritura con contador de palabras", icono: "fa-pen-nib" },
    { nombre: "Mesa de debate", detalle: "Dos posturas con sus argumentos guía", icono: "fa-comments" },
  ],
  conceptos: [
    {
      termino: "Circuito del sentido",
      definicion:
        "Vuelta completa en la que una lectura alimenta lo que escribes y lo escrito cambia cómo vuelves a leer; ninguna de las dos prácticas basta sola.",
    },
    {
      termino: "Imaginar mundos",
      definicion:
        "Función de la lectura literaria: el texto no pide comprobación, invita a figurarse mundos posibles y habitarlos.",
    },
    {
      termino: "Capacidad crítica",
      definicion:
        "Lo que exige un texto informativo: evaluar y cuestionar la información, preguntar de dónde salen los datos y quién los sostiene.",
    },
    {
      termino: "Procesar emociones",
      definicion:
        "Función de la escritura personal: dar forma a lo que se siente escribiéndolo, aunque nadie más lo lea.",
    },
    {
      termino: "Transformar la realidad",
      definicion:
        "Uso de la lengua para actuar: una carta, un reglamento o una convocatoria buscan que algo cambie fuera del papel.",
    },
    {
      termino: "Lectura en voz alta",
      definicion:
        "Práctica que vuelve audible el texto: lo que en el papel parecía correcto, dicho se enreda, y obliga a reescribir.",
    },
  ],
  glosario: [
    {
      termino: "Escritura",
      definicion:
        "Práctica de crear significado mediante signos para que otra persona lo lea; desarrolla el pensamiento y la comunicación.",
    },
    {
      termino: "Lectura",
      definicion:
        "Práctica de construir significado a partir de las palabras de otra persona; es un diálogo entre contextos.",
    },
    {
      termino: "Empatía",
      definicion:
        "Capacidad de comprender lo que siente o piensa otra persona; la escritura y la lectura la fortalecen.",
    },
    {
      termino: "Práctica social",
      definicion:
        "Uso de la lengua en situaciones reales para relacionarnos, aprender, expresarnos y transformar la realidad.",
    },
    {
      termino: "Código alfabético",
      definicion: "Sistema que relaciona letras con sonidos; es la base, pero no el límite, de leer y escribir.",
    },
    {
      termino: "Borrador",
      definicion:
        "Primera versión de un texto, escrita para releerla y corregirla; es el texto puesto a prueba, no el que se entrega.",
    },
  ],
  aplicaciones: [
    "México reconoce 68 lenguas nacionales además del español, según el catálogo del INALI (Instituto Nacional de Lenguas Indígenas). Cada una tiene variantes dialectales propias: el náhuatl, por ejemplo, tiene más de 30 variantes distribuidas desde Guerrero hasta Veracruz.",
  ],
  fuente: "CEN Bachillerato — UAC Lengua y Comunicación I · progresión LC-I-P01",
};
