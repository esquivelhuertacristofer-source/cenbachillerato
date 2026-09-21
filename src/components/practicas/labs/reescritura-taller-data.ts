/**
 * Datos del laboratorio «Taller de reescritura» — LC-II-P06.
 *
 * Progresión: «Reescribe un texto» (Lengua y Comunicación II, 2.º semestre).
 *
 * QUÉ HACE ESTE LABORATORIO QUE NO HAGAN LOS OTROS DE LENGUA.
 * `ideas-clave-subrayado` (LC-I-P05) enseña a LEER: qué subrayar y por qué.
 * `lectura-escritura-dialogo` (LC-I-P01) enseña el circuito leer↔escribir.
 * `taller-descripcion-narracion` (LC-II-P02) enseña a ESCRIBIR la primera
 * versión: qué adjetivo, qué orden, qué verbo. `historia-de-vida-relato`
 * (LC-II-P01) enseña a ordenar una anécdota y elegir desde dónde se cuenta.
 * Aquí el objeto de estudio es OTRO: el BORRADOR QUE YA EXISTE y hay que
 * intervenir. No se reconoce una figura: se opera un texto y se ve qué se gana
 * y qué se pierde con cada corte.
 *
 * Por eso la escena es DOM y no three.js: el fenómeno es el texto mismo, con
 * sus palabras tachadas y su contador bajando. Una geometría aquí sería
 * decoración, y además el laboratorio funciona con ratón, teclado y pantalla
 * táctil sin inflar el bundle del Worker.
 *
 * QUÉ ES VERBATIM DE LA BASE DE DATOS Y QUÉ ESCRIBÍ YO (el laboratorio lo
 * declara al pie; el alumno tiene derecho a saberlo):
 *   · VERBATIM — la lectura LC-II-P06-A1 íntegra (`LECTURA_A1`), su recuadro
 *     «importante» (`CALLOUT_A1`) y sus preguntas de comprensión con su
 *     respuesta guía (`COMPRENSION_A1`); el ejemplo de amplificación «hacía
 *     calor» → «el pavimento de la avenida…» que la propia A1 propone y que
 *     aquí es una de las fichas de operación; la consigna, las pistas y los
 *     criterios de la reflexión escrita A3 (`TALLER_A3`); los cuatro
 *     enunciados verdadero/falso de A4 y las dos preguntas cerradas del video
 *     A9, que juntos forman el reto evaluable (`RETO_QUIZ`); el glosario A5
 *     con sus ejemplos (`PARES`); y el texto con huecos A2 (en
 *     `reescritura-taller-huecos.ts`).
 *   · ILUSTRATIVO, escrito para este laboratorio — los tres borradores del
 *     quirófano (`BORRADORES`), los doce defectos de `DEFECTOS`, los seis
 *     borradores anotados de `MARCAS` y las seis parejas de `VERSIONES`.
 *     Ninguna persona, colonia, escuela, fonda ni comercio de esos textos
 *     existe; las cifras que aparecen dentro de ellos (litros, magnitudes,
 *     horarios) son parte de la ficción y no se presentan como dato real.
 *   · Las marcas de corrector son las tradicionales de imprenta (deleatur,
 *     caret de inserción, transposición, sustitución y calderón de punto y
 *     aparte); su dibujo aquí es una versión simplificada para pantalla.
 *
 * No se cita ni se atribuye nada a ningún autor real.
 *
 * Sin three ni React: datos puros.
 */

import type { QuizEvaluable } from "./_reto-quiz";
import type { ParTermino } from "./_mecanica-termino";

/* ═══════════════════════════════════════════════════════════════════════════
 * Contador de palabras — el mismo para el quirófano y para las versiones.
 *
 * Cuenta como palabra todo bloque sin espacios que contenga al menos una letra
 * o un dígito: así «10:00» y «temas:» cuentan una vez y un punto suelto no
 * cuenta ninguna.
 * ═══════════════════════════════════════════════════════════════════════════ */
export function cuentaPalabras(s: string): number {
  return s.split(/\s+/).filter((t) => /[\p{L}\p{N}]/u.test(t)).length;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * MODO 1 — «Cirugía de párrafo»
 *
 * El alumno opera un borrador real: toca los trozos que sobran y el contador
 * de palabras baja. Lo que sobra no es «lo feo»: es la muletilla que no
 * informa, la repetición de algo ya dicho y el relleno valorativo. Tocar un
 * trozo que carga información cuesta un error y explica por qué esa parte se
 * queda.
 * ═══════════════════════════════════════════════════════════════════════════ */
export type Estorbo = "muletilla" | "repeticion" | "relleno";

export const ESTORBO_INFO: Record<Estorbo, { label: string; corto: string; color: string; icono: string; descripcion: string }> = {
  muletilla: {
    label: "Muletilla",
    corto: "Muletillas",
    color: "#FFC75A",
    icono: "fa-comment-slash",
    descripcion: "Fórmula de apoyo que se dice por costumbre y no añade información.",
  },
  repeticion: {
    label: "Repetición",
    corto: "Repeticiones",
    color: "#7DD3FC",
    icono: "fa-clone",
    descripcion: "Vuelve a decir algo que el lector ya leyó una línea antes.",
  },
  relleno: {
    label: "Relleno",
    corto: "Relleno",
    color: "#F0ABFC",
    icono: "fa-wind",
    descripcion: "Ocupa lugar y suena importante, pero no dice nada verificable.",
  },
};

export interface Trozo {
  id: string;
  texto: string;
  /** `null` = este trozo carga información y debe quedarse. */
  estorbo: Estorbo | null;
  /** Por qué se cae (o por qué se queda). Es la retroalimentación. */
  porque: string;
}

export interface Borrador {
  id: string;
  titulo: string;
  contexto: string;
  trozos: Trozo[];
  /** La versión final, ya recompuesta (mayúsculas y puntuación ajustadas). */
  limpio: string;
}

export const BORRADORES: Borrador[] = [
  {
    id: "bo-aviso",
    titulo: "Aviso vecinal",
    contexto: "Cartel pegado en la tienda de la esquina. Quien lo lee necesita saber cuándo, dónde y para qué.",
    limpio:
      "La asamblea vecinal de la colonia Lomas del Sur se realizará el sábado 11 de octubre a las 10:00 en el salón de usos múltiples. Se tratarán dos temas: el alumbrado de la calle Pino y la recolección de basura. Se pide a los vecinos que asistan puntualmente.",
    trozos: [
      {
        id: "av-1",
        texto: "Este aviso es para informar que ",
        estorbo: "relleno",
        porque: "Un aviso ya avisa. La fórmula ocupa seis palabras para decir lo que el papel pegado en la pared dice solo.",
      },
      {
        id: "av-2",
        texto: "la asamblea vecinal de la colonia Lomas del Sur",
        estorbo: null,
        porque: "Aquí está el QUÉ y el DÓNDE de la convocatoria. Sin esto el aviso no convoca a nada.",
      },
      {
        id: "av-3",
        texto: ", como ustedes ya saben,",
        estorbo: "muletilla",
        porque: "Si ya lo saben, el aviso sobra; si no lo saben, la frase les miente. En los dos casos estorba.",
      },
      {
        id: "av-4",
        texto: " se realizará el sábado 11 de octubre a las 10:00",
        estorbo: null,
        porque: "Fecha y hora: el dato por el que alguien se detiene a leer un aviso.",
      },
      {
        id: "av-5",
        texto: " en el salón de usos múltiples",
        estorbo: null,
        porque: "El lugar exacto. Es lo que permite llegar.",
      },
      {
        id: "av-6",
        texto: ", o sea, en el salón de siempre",
        estorbo: "muletilla",
        porque: "«O sea» anuncia una aclaración que no aclara: «el salón de siempre» es menos preciso que el nombre que ya se dio.",
      },
      {
        id: "av-7",
        texto: ". Se tratarán dos temas:",
        estorbo: null,
        porque: "Anuncia la lista y dice cuántos son. El lector sabe qué esperar.",
      },
      {
        id: "av-8",
        texto: " el alumbrado de la calle Pino y la recolección de basura",
        estorbo: null,
        porque: "Los dos temas, con nombre y apellido. Esto es lo que hace que alguien decida ir o no ir.",
      },
      {
        id: "av-9",
        texto: ". Cabe mencionar que",
        estorbo: "muletilla",
        porque: "«Cabe mencionar que» nunca menciona nada: solo retrasa la frase que viene detrás.",
      },
      {
        id: "av-10",
        texto: " son temas de suma importancia para todos",
        estorbo: "relleno",
        porque: "Calificar los temas de importantes no informa. Los temas ya están escritos: que el vecino juzgue.",
      },
      {
        id: "av-11",
        texto: ". Se pide a",
        estorbo: null,
        porque: "Introduce la petición final, que es el propósito del aviso.",
      },
      {
        id: "av-12",
        texto: " todos y cada uno de",
        estorbo: "repeticion",
        porque: "«Todos» y «cada uno» dicen lo mismo dos veces. Con «los vecinos» ya están incluidos todos.",
      },
      {
        id: "av-13",
        texto: " los vecinos que asistan puntualmente.",
        estorbo: null,
        porque: "A quién se le pide y qué se le pide. Es la acción que el aviso persigue.",
      },
    ],
  },
  {
    id: "bo-terminal",
    titulo: "Diario de viaje",
    contexto: "Página de un cuaderno personal. El propósito es que quien lo lea sienta la noche en la terminal.",
    limpio:
      "Llegué a la terminal de autobuses de Oaxaca ya de noche. La sala estaba casi vacía. Sentí miedo porque no conocía a nadie en esa ciudad. Me senté en una banca a esperar el amanecer.",
    trozos: [
      {
        id: "te-1",
        texto: "Llegué a la terminal de autobuses de Oaxaca",
        estorbo: null,
        porque: "Quién, dónde. Es el ancla de toda la escena.",
      },
      {
        id: "te-2",
        texto: ", la verdad,",
        estorbo: "muletilla",
        porque: "«La verdad» sugiere que lo demás podría no serlo. En un diario nadie está mintiendo: la coletilla solo frena la frase.",
      },
      {
        id: "te-3",
        texto: " ya de noche",
        estorbo: null,
        porque: "La hora del día cambia toda la escena: una terminal de noche no es la misma terminal.",
      },
      {
        id: "te-4",
        texto: ". La sala estaba casi vacía",
        estorbo: null,
        porque: "Es la imagen que sostiene el miedo que viene después.",
      },
      {
        id: "te-5",
        texto: ". Prácticamente no había nadie",
        estorbo: "repeticion",
        porque: "«Casi vacía» y «prácticamente no había nadie» son la misma frase con otras palabras. Repetir no intensifica: diluye.",
      },
      {
        id: "te-6",
        texto: ". Sentí",
        estorbo: null,
        porque: "El verbo de la emoción. Sin él no hay narrador que sienta.",
      },
      {
        id: "te-7",
        texto: ", en lo personal,",
        estorbo: "relleno",
        porque: "Quien escribe «sentí» ya está hablando de sí mismo. «En lo personal» no añade un solo dato.",
      },
      {
        id: "te-8",
        texto: " miedo",
        estorbo: null,
        porque: "La palabra exacta de la emoción. Es el centro del párrafo.",
      },
      {
        id: "te-9",
        texto: ", un miedo muy pero muy feo,",
        estorbo: "relleno",
        porque: "«Muy pero muy feo» sube el volumen sin decir nada nuevo. Si el miedo necesita fuerza, se la da la escena, no el adverbio.",
      },
      {
        id: "te-10",
        texto: " porque no conocía a nadie en esa ciudad",
        estorbo: null,
        porque: "La causa del miedo. Es la información que convierte una emoción suelta en una experiencia entendible.",
      },
      {
        id: "te-11",
        texto: ". Me senté en una banca",
        estorbo: null,
        porque: "La acción con la que cierra la escena.",
      },
      {
        id: "te-12",
        texto: ", en una banca de metal,",
        estorbo: "repeticion",
        porque: "«En una banca» acaba de decirse. Si el metal importara, iría en la primera mención: «me senté en una banca de metal».",
      },
      {
        id: "te-13",
        texto: " a esperar el amanecer.",
        estorbo: null,
        porque: "Dice cuánto va a durar la espera sin decir una hora. Es el cierre.",
      },
    ],
  },
  {
    id: "bo-reporte",
    titulo: "Reporte escolar",
    contexto: "Informe de un proyecto de ciencias. Su propósito es que otro equipo pueda repetir y comprobar lo que se hizo.",
    limpio:
      "En esta investigación medimos cuánta agua se pierde por fugas en la escuela. Las tres llaves del patio gotean desde marzo. Cada llave pierde cerca de 30 litros al día. Con ese dato propusimos cambiar los empaques antes de que termine el ciclo escolar.",
    trozos: [
      {
        id: "re-1",
        texto: "En esta investigación",
        estorbo: null,
        porque: "Sitúa al lector: lo que viene es el objeto del informe.",
      },
      {
        id: "re-2",
        texto: ", que es el tema del presente trabajo,",
        estorbo: "relleno",
        porque: "«Esta investigación» y «el presente trabajo» son el mismo documento. La aclaración da una vuelta para volver al punto de partida.",
      },
      {
        id: "re-3",
        texto: " medimos cuánta agua se pierde por fugas en la escuela",
        estorbo: null,
        porque: "Qué se midió y dónde: el corazón del reporte.",
      },
      {
        id: "re-4",
        texto: ". Cabe mencionar que",
        estorbo: "muletilla",
        porque: "Fórmula de arranque automática. Quítala y la oración empieza directo en el dato.",
      },
      {
        id: "re-5",
        texto: " las tres llaves del patio gotean desde marzo",
        estorbo: null,
        porque: "Cuántas llaves, dónde y desde cuándo. Es lo que otro equipo necesita para verificarlo.",
      },
      {
        id: "re-6",
        texto: ". Es importante señalar que",
        estorbo: "muletilla",
        porque: "Si de verdad es importante, el dato lo demuestra solo. Anunciarlo gasta cuatro palabras y no prueba nada.",
      },
      {
        id: "re-7",
        texto: " cada llave pierde cerca de 30 litros al día",
        estorbo: null,
        porque: "La cifra del reporte. Sin ella no hay medición, solo impresión.",
      },
      {
        id: "re-8",
        texto: ", es decir, unos 30 litros diarios cada una",
        estorbo: "repeticion",
        porque: "«Es decir» promete una reformulación que aclare; aquí repite la misma cifra con sinónimos.",
      },
      {
        id: "re-9",
        texto: ". Con ese dato",
        estorbo: null,
        porque: "Enlaza la medición con la propuesta: sin este puente, la recomendación llega de la nada.",
      },
      {
        id: "re-10",
        texto: ", y esto es muy importante,",
        estorbo: "muletilla",
        porque: "Un informe no se hace más importante avisando que lo es. Ese juicio le toca a quien lee.",
      },
      {
        id: "re-11",
        texto: " propusimos cambiar los empaques",
        estorbo: null,
        porque: "La propuesta concreta. Es a lo que llegaba todo el reporte.",
      },
      {
        id: "re-12",
        texto: ", de manera inmediata y a la brevedad posible,",
        estorbo: "repeticion",
        porque: "«De manera inmediata» y «a la brevedad posible» son la misma prisa dicha dos veces, y ninguna da una fecha.",
      },
      {
        id: "re-13",
        texto: " antes de que termine el ciclo escolar.",
        estorbo: null,
        porque: "Este sí es un plazo: se puede cumplir o incumplir, y por eso sirve.",
      },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * MODO 2 — «Elige la operación»
 *
 * Cuatro operaciones de reescritura y doce oraciones defectuosas. No se trata
 * de decir si la oración está mal —eso ya se dice en el diagnóstico— sino de
 * decidir CUÁL de las cuatro herramientas la repara. Elegir mal la operación
 * es el error típico: se amplía lo que había que suprimir, o se sustituye una
 * palabra cuando el problema era el orden.
 * ═══════════════════════════════════════════════════════════════════════════ */
export type Operacion = "suprimir" | "sustituir" | "reordenar" | "ampliar";

export const OPERACION_INFO: Record<Operacion, { label: string; color: string; icono: string; descripcion: string; pista: string }> = {
  suprimir: {
    label: "Suprimir",
    color: "#FF8A8A",
    icono: "fa-eraser",
    descripcion: "Sobra algo: se dice dos veces o no aporta.",
    pista: "¿Puedes tachar palabras sin perder ninguna información? Entonces sobran.",
  },
  sustituir: {
    label: "Sustituir",
    color: "#FFC75A",
    icono: "fa-right-left",
    descripcion: "Una palabra vaga ocupa el lugar de una precisa.",
    pista: "¿Hay un comodín («cosa», «bien», «raro») que podría significar cualquier cosa? Cámbialo, no lo quites.",
  },
  reordenar: {
    label: "Reordenar",
    color: "#7DD3FC",
    icono: "fa-arrows-left-right-to-line",
    descripcion: "Las palabras están todas; el orden confunde.",
    pista: "¿El sujeto quedó lejos de su verbo, o un adjetivo parece referirse a quien no le toca? Es cuestión de orden.",
  },
  ampliar: {
    label: "Ampliar",
    color: "#34D399",
    icono: "fa-plus",
    descripcion: "Falta el detalle que el lector necesita.",
    pista: "¿Te quedaste con una pregunta obvia sin responder (cuánto, dónde, qué se vio)? Falta información.",
  },
};

export interface Defecto {
  id: string;
  /** La oración tal como está en el borrador. */
  texto: string;
  /** Diagnóstico corto: qué le pasa. */
  defecto: string;
  operacion: Operacion;
  /** La misma oración después de aplicar la operación. */
  arreglo: string;
  porque: string;
  /** Verdadero si la oración o su arreglo vienen de la lectura A1. */
  deA1?: boolean;
}

export const DEFECTOS: Defecto[] = [
  {
    id: "de-1",
    texto: "Subió hacia arriba por la escalera de caracol hasta el tercer piso.",
    defecto: "«Hacia arriba» ya está dentro de «subió».",
    operacion: "suprimir",
    arreglo: "Subió por la escalera de caracol hasta el tercer piso.",
    porque: "No hay nada que cambiar ni que añadir: hay dos palabras que el verbo ya dijo. Se tachan y la frase queda entera.",
  },
  {
    id: "de-2",
    texto: "En mi opinión personal, yo creo que la cancha debería abrirse los domingos.",
    defecto: "Tres marcas de opinión («en mi opinión», «personal», «yo creo») para una sola idea.",
    operacion: "suprimir",
    arreglo: "Creo que la cancha debería abrirse los domingos.",
    porque: "Repetir que es tu opinión no la hace más tuya. Con «creo» basta: el resto son palabras de más.",
  },
  {
    id: "de-3",
    texto: "Los alumnos que participaron en el taller salieron todos juntos a la vez.",
    defecto: "«Juntos» y «a la vez» dicen lo mismo.",
    operacion: "suprimir",
    arreglo: "Los alumnos que participaron en el taller salieron todos juntos.",
    porque: "Es la condensación de la lectura A1: eliminar lo que ya fue dicho para que cada palabra cuente.",
  },
  {
    id: "de-4",
    texto: "El señor hizo una cosa con el motor y el camión arrancó.",
    defecto: "«Señor» y «hizo una cosa» son comodines: podrían ser cualquiera y cualquier cosa.",
    operacion: "sustituir",
    arreglo: "El mecánico ajustó el carburador y el camión arrancó.",
    porque: "No sobra nada ni falta información nueva: las palabras que están hay que cambiarlas por otras más precisas.",
  },
  {
    id: "de-5",
    texto: "La comida de la fonda estaba muy buena.",
    defecto: "«Muy buena» es un juicio que no deja ver ni oler nada.",
    operacion: "sustituir",
    arreglo: "El mole de la fonda sabía a chile pasilla tostado.",
    porque: "Es la sustitución léxica de A1: cambiar la palabra por otra de registro y precisión adecuados, no añadirle adverbios.",
  },
  {
    id: "de-6",
    texto: "Caminó de forma rara por el pasillo del hospital.",
    defecto: "«De forma rara» describe cualquier manera de caminar.",
    operacion: "sustituir",
    arreglo: "Renqueó por el pasillo del hospital.",
    porque: "Un verbo preciso hace el trabajo de cuatro palabras vagas. Sustituir también es cambiar varias palabras por una sola mejor.",
  },
  {
    id: "de-7",
    texto:
      "El director, después de leer las quince cartas que los alumnos de tercer semestre escribieron durante el paro de octubre, respondió.",
    defecto: "El sujeto queda a diecinueve palabras de su verbo.",
    operacion: "reordenar",
    arreglo:
      "Después de leer las quince cartas que los alumnos de tercer semestre escribieron durante el paro de octubre, el director respondió.",
    porque: "No falta ni sobra nada: el lector se pierde porque olvidó quién era el sujeto antes de llegar al verbo. Junta sujeto y verbo.",
  },
  {
    id: "de-8",
    texto: "Se vende bicicleta para niño con canasta y rueditas casi nueva.",
    defecto: "«Casi nueva» quedó junto a las rueditas y parece referirse a ellas.",
    operacion: "reordenar",
    arreglo: "Se vende bicicleta casi nueva para niño, con canasta y rueditas.",
    porque: "En español el adjetivo se pega a lo que está más cerca. Mover dos palabras arregla lo que ninguna palabra nueva arreglaría.",
  },
  {
    id: "de-9",
    texto: "La maestra les entregó a los alumnos, que llevaban toda la mañana esperando en el patio bajo el sol, las boletas.",
    defecto: "El complemento largo se metió entre el verbo y lo que se entrega.",
    operacion: "reordenar",
    arreglo: "La maestra les entregó las boletas a los alumnos, que llevaban toda la mañana esperando en el patio bajo el sol.",
    porque: "Lo entregado llega al final, después de una interrupción de doce palabras. Cambiar el orden lo pone donde se espera.",
  },
  {
    id: "de-10",
    texto: "Llegamos tarde por el tráfico.",
    defecto: "En una crónica, el lector no sabe cuánto ni dónde.",
    operacion: "ampliar",
    arreglo: "Llegamos cuarenta minutos tarde: la Calzada Zaragoza estaba cerrada por un desfile.",
    porque: "No hay palabra mala que cambiar: falta información. Ampliar es añadir el dato o el detalle que el lector necesita.",
  },
  {
    id: "de-11",
    texto: "El experimento no funcionó.",
    defecto: "En un reporte, nadie puede repetirlo ni corregirlo con eso.",
    operacion: "ampliar",
    arreglo: "El experimento no funcionó: la solución nunca cambió de color, ni siquiera después de veinte minutos.",
    porque: "Un reporte sirve para que otro lo repita. Sin qué se observó y cuánto se esperó, la frase no deja trabajar a nadie.",
  },
  {
    id: "de-12",
    texto: "Hacía calor.",
    defecto: "Dos palabras para una escena entera: el lector no ve, no huele, no suda.",
    operacion: "ampliar",
    arreglo:
      "El pavimento de la avenida irradiaba el calor acumulado del mediodía y el aire olía a asfalto quemado y tortillas de maíz.",
    porque:
      "Es el ejemplo de amplificación de la lectura A1: añadir detalles sensoriales, ejemplos, datos o contexto que enriquecen la comprensión del lector.",
    deA1: true,
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * MODO 3 — «Marcas del corrector»
 *
 * Un borrador vuelve del corrector con una marca en el margen. La marca dice
 * QUÉ operación hay que hacer; el alumno tiene que APLICARLA, ni más ni menos.
 * Las tres opciones no son «buena, regular y mala»: dos de ellas son
 * reescrituras defendibles que, sencillamente, no hacen lo que la marca pide.
 * ═══════════════════════════════════════════════════════════════════════════ */
export type Marca = "deleatur" | "insercion" | "transposicion" | "sustitucion" | "aparte";

export const MARCA_INFO: Record<Marca, { label: string; simbolo: string; icono: string; significa: string }> = {
  deleatur: { label: "Deleatur", simbolo: "ɗ", icono: "fa-eraser", significa: "Suprime lo señalado, sin tocar nada más." },
  insercion: { label: "Inserción", simbolo: "∧", icono: "fa-caret-up", significa: "Falta algo aquí: añade lo que el margen pide." },
  transposicion: { label: "Transposición", simbolo: "⇄", icono: "fa-arrow-right-arrow-left", significa: "Cambia de lugar lo señalado; no cambies las palabras." },
  sustitucion: { label: "Sustitución", simbolo: "✎", icono: "fa-pen", significa: "Cambia lo tachado por lo que indica el margen." },
  aparte: { label: "Punto y aparte", simbolo: "¶", icono: "fa-paragraph", significa: "Corta aquí: empieza un párrafo nuevo." },
};

export interface OpcionMarca {
  texto: string;
  ok: boolean;
  porque: string;
}

export interface BorradorMarcado {
  id: string;
  marca: Marca;
  /** Lo que el corrector escribió en el margen. */
  anotacion: string;
  /** El borrador partido en tres: antes, lo señalado, después. */
  antes: string;
  senalado: string;
  despues: string;
  opciones: OpcionMarca[];
}

export const MARCAS: BorradorMarcado[] = [
  {
    id: "ma-1",
    marca: "deleatur",
    anotacion: "Fuera: es un juicio, no un dato.",
    antes: "El taller de reescritura",
    senalado: ", que es muy importante,",
    despues: " empieza el lunes a las cuatro.",
    opciones: [
      {
        texto: "El taller de reescritura empieza el lunes a las cuatro.",
        ok: true,
        porque: "Aplica el deleatur exactamente: cae lo señalado y todo lo demás queda igual.",
      },
      {
        texto: "El taller empieza el lunes a las cuatro.",
        ok: false,
        porque: "Suprimió de más: se llevó «de reescritura», que estaba fuera de la marca y dice de qué taller hablamos.",
      },
      {
        texto: "El taller de reescritura, importante, empieza el lunes a las cuatro.",
        ok: false,
        porque: "Suprimió de menos: dejó el juicio de valor, que era justo lo que el corrector señaló.",
      },
    ],
  },
  {
    id: "ma-2",
    marca: "insercion",
    anotacion: "∧ ¿a qué hora?",
    antes: "La biblioteca abre de lunes a viernes",
    senalado: "∧",
    despues: ".",
    opciones: [
      {
        texto: "La biblioteca abre de lunes a viernes de 8:00 a 19:00.",
        ok: true,
        porque: "Inserta justo el dato que el margen pedía, en el lugar marcado, sin tocar lo demás.",
      },
      {
        texto: "La biblioteca abre todos los días.",
        ok: false,
        porque: "Eso no es insertar: cambia el dato que ya estaba y, además, dice algo distinto.",
      },
      {
        texto: "La biblioteca abre de lunes a viernes, según el horario publicado.",
        ok: false,
        porque: "Añadió palabras pero no el dato. El lector sigue sin saber a qué hora ir.",
      },
    ],
  },
  {
    id: "ma-3",
    marca: "transposicion",
    anotacion: "⇄ «amueblado» va junto a «cuarto».",
    antes: "Se renta cuarto para estudiante con baño propio",
    senalado: " amueblado",
    despues: ".",
    opciones: [
      {
        texto: "Se renta cuarto amueblado para estudiante, con baño propio.",
        ok: true,
        porque: "Mueve la palabra al lugar que pide la marca y no cambia ninguna otra. Ahora «amueblado» solo puede referirse al cuarto.",
      },
      {
        texto: "Se renta cuarto para estudiante amueblado con baño propio.",
        ok: false,
        porque: "La movió, pero al lugar equivocado: ahora el amueblado parece el estudiante.",
      },
      {
        texto: "Se renta cuarto para estudiante con baño propio y amueblado.",
        ok: false,
        porque: "Sigue al final, lejos de «cuarto»: la ambigüedad que motivó la marca continúa ahí.",
      },
    ],
  },
  {
    id: "ma-4",
    marca: "sustitucion",
    anotacion: "✎ palabra precisa.",
    antes: "El vendedor dijo que el aparato estaba",
    senalado: " bien",
    despues: ".",
    opciones: [
      {
        texto: "El vendedor dijo que el aparato funcionaba sin fallas.",
        ok: true,
        porque: "Cambia la palabra vaga por una precisa, que es lo que pide la marca de sustitución.",
      },
      {
        texto: "El vendedor dijo que el aparato estaba muy bien.",
        ok: false,
        porque: "Intensificó en vez de precisar. «Muy bien» sigue sin decir qué hacía el aparato.",
      },
      {
        texto: "El vendedor dijo que el aparato estaba.",
        ok: false,
        porque: "Eso es un deleatur, no una sustitución: borró la palabra en lugar de cambiarla.",
      },
    ],
  },
  {
    id: "ma-5",
    marca: "aparte",
    anotacion: "¶ aquí empieza otra idea.",
    antes: "En la primera parte del informe describimos el problema del agua en la escuela y",
    senalado: " ¶ ",
    despues: "en la segunda parte proponemos tres soluciones y explicamos cuánto costaría cada una.",
    opciones: [
      {
        texto:
          "En la primera parte del informe describimos el problema del agua en la escuela. || En la segunda parte proponemos tres soluciones y explicamos cuánto costaría cada una.",
        ok: true,
        porque: "Corta donde dice la marca, cierra con punto y arranca el párrafo nuevo con mayúscula. Cada idea queda en su párrafo.",
      },
      {
        texto:
          "En la primera parte del informe describimos el problema del agua en la escuela, en la segunda parte proponemos tres soluciones y explicamos cuánto costaría cada una.",
        ok: false,
        porque: "Cambió la «y» por una coma: sigue siendo una sola oración larga. El calderón pedía un párrafo nuevo, no otra pausa.",
      },
      {
        texto:
          "En la primera parte del informe describimos el problema del agua en la escuela y en la segunda parte proponemos tres soluciones. || Explicamos cuánto costaría cada una.",
        ok: false,
        porque: "Cortó en otro lugar: partió la segunda idea por la mitad y dejó las dos primeras pegadas.",
      },
    ],
  },
  {
    id: "ma-6",
    marca: "deleatur",
    anotacion: "Fuera: ya lo dice «asistentes».",
    antes: "Los asistentes",
    senalado: " que asistieron al evento",
    despues: " recibieron una constancia.",
    opciones: [
      {
        texto: "Los asistentes recibieron una constancia.",
        ok: true,
        porque: "Cae exactamente lo señalado. «Asistentes» ya contiene «asistieron al evento».",
      },
      {
        texto: "Recibieron una constancia.",
        ok: false,
        porque: "Se llevó también el sujeto: ahora no se sabe quién recibió la constancia.",
      },
      {
        texto: "Los que asistieron al evento recibieron una constancia.",
        ok: false,
        porque: "La oración es correcta, pero es otra reescritura: quitó «asistentes» en vez de lo señalado. Una marca se aplica tal cual.",
      },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * MODO 4 — «Antes o después»
 *
 * La pregunta nunca es cuál suena mejor: es cuál cumple el PROPÓSITO que está
 * declarado arriba. Por eso dos parejas aparecen dos veces con propósitos
 * opuestos y la respuesta se voltea: la misma versión gana o pierde según para
 * qué se escriba. Después de elegir la versión hay que elegir la RAZÓN, y una
 * de las razones falsas es siempre del tipo «suena mejor» o «es más larga».
 * ═══════════════════════════════════════════════════════════════════════════ */
export interface RazonVersion {
  texto: string;
  ok: boolean;
}

export interface ParVersion {
  id: string;
  /** Con qué otro par comparte las dos versiones (el propósito cambia). */
  gemelo?: string;
  proposito: string;
  contexto: string;
  a: string;
  b: string;
  correcta: "a" | "b";
  razones: RazonVersion[];
  porque: string;
}

export const VERSIONES: ParVersion[] = [
  {
    id: "ve-sismo-informar",
    gemelo: "ve-sismo-sentir",
    proposito: "Informar, en menos de treinta palabras, a quien necesita saber qué pasó.",
    contexto: "Primera línea del boletín de la radio escolar, a las 6 de la mañana.",
    a: "Un sismo de magnitud 5.2 se registró anoche a las 23:14, con epicentro a 12 kilómetros de la costa; no se reportaron daños.",
    b: "La cama se movió como si alguien la empujara. Mi mamá gritó desde la cocina. Salimos al patio y desde ahí vimos los postes de luz balancearse.",
    correcta: "a",
    razones: [
      { texto: "Da los datos verificables (magnitud, hora, epicentro, daños) que el oyente necesita para decidir qué hacer.", ok: true },
      { texto: "Está mejor escrita y usa un lenguaje más serio.", ok: false },
      { texto: "Es más corta, y en la radio siempre conviene lo más corto.", ok: false },
    ],
    porque:
      "Para informar, la versión útil es la que responde qué, cuándo, dónde y con qué consecuencia. La otra versión no está peor escrita: está escrita para otra cosa.",
  },
  {
    id: "ve-sismo-sentir",
    gemelo: "ve-sismo-informar",
    proposito: "Hacer que el lector sienta lo que se sintió dentro de la casa.",
    contexto: "Misma noche, misma persona: ahora es el primer párrafo de una crónica para la revista del plantel.",
    a: "Un sismo de magnitud 5.2 se registró anoche a las 23:14, con epicentro a 12 kilómetros de la costa; no se reportaron daños.",
    b: "La cama se movió como si alguien la empujara. Mi mamá gritó desde la cocina. Salimos al patio y desde ahí vimos los postes de luz balancearse.",
    correcta: "b",
    razones: [
      { texto: "Cambia el dato por lo que se vio, se oyó y se hizo: el lector reconstruye la escena y la siente.", ok: true },
      { texto: "Tiene más adjetivos y eso la hace más literaria.", ok: false },
      { texto: "Es la versión más larga, y lo largo permite explicar mejor.", ok: false },
    ],
    porque:
      "Son las MISMAS dos versiones del par anterior y la respuesta se volteó. No hay una versión buena y otra mala: hay una que cumple el propósito declarado y otra que no.",
  },
  {
    id: "ve-mendoza-pie",
    gemelo: "ve-mendoza-importa",
    proposito: "Que quepa como pie de foto en el periódico escolar: máximo diez palabras.",
    contexto: "Debajo de una fotografía del laboratorio de química.",
    a: "El profesor Mendoza, que llevaba treinta y dos años dando clase de química y todavía se emocionaba al encender un mechero, entró al laboratorio.",
    b: "El profesor Mendoza entró al laboratorio.",
    correcta: "b",
    razones: [
      { texto: "Cumple el límite de espacio y dice lo único que el pie de foto tiene que decir: quién y dónde.", ok: true },
      { texto: "Es más clara porque las oraciones cortas siempre son más claras.", ok: false },
      { texto: "La otra tiene demasiadas comas y las comas confunden.", ok: false },
    ],
    porque:
      "Condensar no es empobrecer: es ajustar el texto al espacio y a la función que va a cumplir. Debajo de la foto, los treinta y dos años no caben ni hacen falta.",
  },
  {
    id: "ve-mendoza-importa",
    gemelo: "ve-mendoza-pie",
    proposito: "Que el lector entienda por qué ese hombre importa en la historia que va a leer.",
    contexto: "Primer párrafo de un perfil de tres páginas sobre el mismo profesor.",
    a: "El profesor Mendoza, que llevaba treinta y dos años dando clase de química y todavía se emocionaba al encender un mechero, entró al laboratorio.",
    b: "El profesor Mendoza entró al laboratorio.",
    correcta: "a",
    razones: [
      { texto: "Añade los dos datos que explican el personaje: cuánto tiempo lleva y qué le sigue importando.", ok: true },
      { texto: "Suena más elegante y demuestra mejor vocabulario.", ok: false },
      { texto: "Al ser más larga, el lector le dedica más atención.", ok: false },
    ],
    porque:
      "La misma pareja del par anterior, con el propósito volteado. Amplificar sirve cuando el lector necesita ese detalle para entender; estorba cuando no.",
  },
  {
    id: "ve-experimento",
    proposito: "Que cualquier otro equipo pueda repetir el experimento y comprobar el resultado.",
    contexto: "Apartado de procedimiento en el reporte de la feria de ciencias.",
    a: "Calentamos el agua un rato, hasta que se puso bien caliente.",
    b: "Calentamos 250 mililitros de agua en una parrilla eléctrica durante ocho minutos, hasta los 80 °C.",
    correcta: "b",
    razones: [
      { texto: "Da cantidades, instrumento y tiempo: sin esos datos nadie puede repetir el procedimiento.", ok: true },
      { texto: "Suena más científica porque usa números.", ok: false },
      { texto: "Es más larga y por lo tanto más completa.", ok: false },
    ],
    porque:
      "Aquí ampliar no es adornar: es hacer el texto verificable. «Un rato» y «bien caliente» describen cualquier cosa, y por eso no describen ninguna.",
  },
  {
    id: "ve-aviso",
    proposito: "Que un aviso de la escuela se entienda en la primera lectura, sin releer.",
    contexto: "Hoja pegada en la entrada, a las 7 de la mañana, con alumnos pasando de prisa.",
    a: "Se hace del conocimiento de la comunidad estudiantil que, derivado de los trabajos de mantenimiento, el acceso por la puerta norte permanecerá restringido.",
    b: "La puerta norte estará cerrada por mantenimiento.",
    correcta: "b",
    razones: [
      { texto: "Dice exactamente lo mismo con palabras que se entienden sin volver atrás.", ok: true },
      { texto: "Es más corta, y más corto siempre es mejor.", ok: false },
      { texto: "Usa un lenguaje menos formal, y lo informal se lee más rápido.", ok: false },
    ],
    porque:
      "Ojo con la trampa: en el par del profesor Mendoza la versión larga era la correcta. Lo que decide no es la longitud, es el propósito: aquí, entenderse a la primera.",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * Contenido VERBATIM de la base de datos
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Lectura LC-II-P06-A1, íntegra. */
export const LECTURA_A1: string[] = [
  "Reescribir no es corregir errores de ortografía ni cambiar algunas palabras al azar. Reescribir es someter un texto a una transformación profunda que lo hace más claro, más rico o más adecuado a su propósito comunicativo. Es, según muchos escritores profesionales, la etapa más importante del proceso de escritura.",
  "La reescritura opera mediante cuatro grandes estrategias que el escritor elige según lo que el texto necesita. La primera es la amplificación: añadir detalles sensoriales, ejemplos, datos o contexto que enriquecen la comprensión del lector. Un texto que dice 'hacía calor' puede amplificarse a 'el pavimento de la avenida irradiaba el calor acumulado del mediodía y el aire olía a asfalto quemado y tortillas de maíz'. La segunda es la condensación: eliminar lo redundante, lo que ya fue dicho, las frases de relleno que no aportan significado. Un texto conciso respeta el tiempo del lector y hace que cada palabra cuente.",
  "La tercera estrategia es el cambio de voz narrativa. Si el texto original está escrito en tercera persona y se reescribe en primera, el efecto emocional cambia radicalmente: lo que era un reporte se convierte en testimonio. Cambiar de pasado a presente aumenta la sensación de inmediatez. La cuarta estrategia es la sustitución léxica: reemplazar palabras por sinónimos de registro más adecuado. 'Comer' puede convertirse en 'devorar', 'saborear', 'ingerir' o 'picotear' según el tono que se busca.",
  "En México, el proceso editorial muestra estas estrategias en acción. Editoriales como Almadía, con sede en Oaxaca, son conocidas por su cuidado minucioso de los manuscritos: los editores trabajan con los autores en múltiples rondas de revisión antes de que un libro llegue a la imprenta. Editorial Planeta México, de mayor escala comercial, también documenta procesos de reescritura que a veces implican cambios profundos de estructura y voz.",
  "Reconocer cuándo un texto necesita amplificación y cuándo necesita condensación es una habilidad que se desarrolla con la práctica y con la lectura atenta. Un buen ejercicio es tomar un párrafo propio, leerlo en voz alta y preguntar: ¿qué palabra podría eliminarse sin que se pierda significado? ¿Qué imagen podría añadirse para que el lector vea lo que yo vi?",
  "La reescritura también implica distancia temporal: revisar un texto con horas o días de diferencia permite leerlo con ojos más frescos, detectar inconsistencias y encontrar oportunidades de mejora que eran invisibles en el momento de la escritura inicial. Escribir es reescribir, y reescribir es pensar con mayor profundidad.",
];

/** Recuadro «importante» de LC-II-P06-A1, verbatim. */
export const CALLOUT_A1 =
  'La sustitución léxica no consiste en usar sinónimos del diccionario sin criterio. Cada sinónimo tiene matices distintos: no es lo mismo "caminar" que "deambular", "avanzar" o "marchar". Elegir bien requiere entender el registro y el tono del texto.';

/** Preguntas de comprensión de LC-II-P06-A1, con su respuesta guía. */
export const COMPRENSION_A1: { pregunta: string; guia: string }[] = [
  {
    pregunta: "¿Cuál es la diferencia entre amplificación y condensación como estrategias de reescritura?",
    guia: "La amplificación añade detalles, ejemplos y contexto para enriquecer el texto; la condensación elimina lo redundante para que cada palabra sea significativa.",
  },
  {
    pregunta: "¿Por qué el cambio de voz narrativa transforma la experiencia del lector?",
    guia: "Porque cambia la perspectiva y la distancia emocional: pasar de tercera a primera persona convierte un reporte en testimonio, generando mayor cercanía e implicación.",
  },
  {
    pregunta: "¿Por qué es útil dejar pasar tiempo antes de revisar un texto propio?",
    guia: "Porque la distancia temporal permite leer con ojos más frescos, detectar inconsistencias y encontrar oportunidades de mejora que no se veían al escribirlo.",
  },
];

/** Reflexión escrita LC-II-P06-A3: consigna, pistas y criterios, verbatim. */
export const TALLER_A3 = {
  prompt:
    "Elige una narrativa popular breve (una leyenda, un cuento corto o una creepypasta) y reescríbela cambiando al menos DOS de los siguientes elementos: (a) la perspectiva narrativa (de primera a tercera persona o viceversa), (b) el tono (de dramático a humorístico, de misterioso a cotidiano), (c) el contexto temporal o espacial. Explica al final qué cambiaste y por qué.",
  pistas: [
    "Elige una narrativa que conozcas bien para concentrarte en la reescritura.",
    "Cambiar el tono es el desafío más creativo: ¿cómo suena La Llorona en versión humorística?",
    "Al final explica: ¿qué efecto produce tu versión diferente a la original?",
  ],
  criterios: [
    "Reescribe claramente cambiando al menos dos elementos",
    "La reescritura mantiene la esencia de la historia original",
    "Explica con claridad qué cambió y el efecto que produce",
    "El texto resultante tiene coherencia y fluidez",
  ],
  minimo: 150,
  maximo: 500,
};

/** Glosario interactivo LC-II-P06-A5, verbatim (término, definición y ejemplo). */
export const PARES: ParTermino[] = [
  {
    id: "gl-conector",
    termino: "Conector textual",
    definicion: "Palabra o frase que enlaza ideas y marca su jerarquía u orden.",
    ejemplo: "Además, sin embargo, por lo tanto, primero, finalmente.",
  },
  {
    id: "gl-trama",
    termino: "Trama",
    definicion: "Conjunto ordenado de acontecimientos que forman la historia.",
    ejemplo: "Inicio, desarrollo, clímax y desenlace de un cuento.",
  },
  {
    id: "gl-conflicto",
    termino: "Conflicto",
    definicion: "Problema o situación de tensión que enfrenta el personaje.",
    ejemplo: "Un héroe que debe superar un obstáculo.",
  },
  {
    id: "gl-tipo",
    termino: "Tipo de narración",
    definicion: "Clase de relato según su contenido: realista, fantástica, histórica o autobiográfica.",
    ejemplo: "Una narración fantástica con dragones.",
  },
  {
    id: "gl-tono",
    termino: "Tono narrativo",
    definicion: "Actitud o intención emocional con que se cuenta la historia.",
    ejemplo: "Tono humorístico, dramático o irónico.",
  },
];

/**
 * Reto evaluable. No hay `quiz_multiple_opcion` en esta progresión: se arma
 * con los cuatro enunciados verdadero/falso de LC-II-P06-A4 (con su
 * retroalimentación verbatim) y las dos preguntas cerradas del video
 * LC-II-P06-A9. El puntaje mínimo (70 %) es el de A4.
 */
export const RETO_QUIZ: QuizEvaluable = {
  titulo: "Reto evaluable — Reescribir un texto",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "¿Qué estrategia de reescritura convierte un reporte en un testimonio?",
      opciones: ["La sustitución léxica", "El cambio de voz narrativa", "La condensación"],
      respuestaCorrecta: 1,
      retroalimentacion:
        "Verbatim de LC-II-P06-A9. Lo dice la lectura A1: si el texto está en tercera persona y se reescribe en primera, «lo que era un reporte se convierte en testimonio».",
    },
    {
      enunciado: "Reescribir es solo corregir errores de ortografía y cambiar algunas palabras.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 1,
      retroalimentacion:
        "Verbatim de LC-II-P06-A9. Reescribir es someter el texto a una transformación profunda que lo hace más claro, más rico o más adecuado a su propósito.",
    },
    {
      enunciado: "Los conectores textuales son palabras o frases que enlazan ideas y marcan jerarquías.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion: "Correcto: por ejemplo 'sin embargo', 'por lo tanto', 'además'.",
    },
    {
      enunciado: "El conflicto es el problema o situación que da tensión a la trama.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion: "Correcto: el conflicto mueve la historia hacia adelante.",
    },
    {
      enunciado: "Una narración autobiográfica cuenta hechos inventados de personas desconocidas.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 1,
      retroalimentacion: "La autobiográfica cuenta la propia vida del autor; lo inventado sería ficción/fantástica.",
    },
    {
      enunciado: "El tono narrativo puede ser humorístico, dramático o irónico, entre otros.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion: "Correcto: el tono expresa la actitud con que se cuenta la historia.",
    },
  ],
};

export const NOTA_PIE =
  "Verbatim de la base de datos (Lengua y Comunicación II, progresión 6): la lectura A1 íntegra y su recuadro, las preguntas de comprensión de A1, el ejemplo de amplificación «hacía calor» → «el pavimento de la avenida…», la consigna, las pistas y los criterios de A3, el glosario A5 con sus ejemplos, el texto con huecos A2 y los reactivos del reto (A4 y las preguntas cerradas del video A9). Escrito para este laboratorio y por tanto ILUSTRATIVO: los tres borradores del quirófano, los doce defectos, los seis borradores anotados y las seis parejas «antes o después»; ninguna persona, colonia, escuela ni comercio de esos textos existe, y las cifras que aparecen dentro de ellos son parte de la ficción. Las marcas de corrector son las tradicionales de imprenta (deleatur, caret de inserción, transposición, sustitución y calderón de punto y aparte), dibujadas aquí en una versión simplificada para pantalla. No se cita ni se atribuye nada a ningún autor real.";
