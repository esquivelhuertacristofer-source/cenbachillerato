/**
 * Datos del laboratorio «Kit de herramientas digitales para estudiar» — CD-I-P08.
 *
 * Progresión: «Herramientas digitales para estudiar» (Cultura Digital I,
 * 1.er semestre).
 *
 * EL ÁNGULO DE ESTE LABORATORIO. Un catálogo de marcas envejece en un año y no
 * enseña nada: la app que hoy se llama de una forma mañana se llama de otra, o
 * deja de existir. Aquí lo evaluable no es el producto, es la DECISIÓN: dado un
 * encargo escolar concreto, qué CATEGORÍA de herramienta lo resuelve y por qué
 * las otras no; entre dos herramientas de la misma categoría, cuál gana según
 * la necesidad declarada (y qué pasa cuando la necesidad cambia); cómo se
 * nombra y se archiva un trabajo para encontrarlo en tres semanas; y en qué
 * orden ocurre un trabajo escolar real, con la herramienta de cada paso.
 *
 * NO DUPLICA a `herramientas-colaborativas` (CD-II-P02), que clasifica tareas
 * por herramienta de la nube y empareja funciones (edición simultánea,
 * historial, comentarios, sincronización). Aquí el conjunto de categorías es el
 * de la progresión de primer semestre —notas, calendario, procesador, hoja de
 * cálculo, presentación, buscador académico, referencias y respaldo— y ninguna
 * mecánica es «arrastra a la cubeta que le toca»: se decide, se compara contra
 * una necesidad, se renombra y se ordena.
 *
 * QUÉ ES VERBATIM Y QUÉ NO — el laboratorio lo declara al pie:
 *   · VERBATIM de la base de datos (CD-I-P08): la lectura A1 (`LECTURA_A1`),
 *     su callout «¿Sabías?» (`DATO_SABIAS`) y sus preguntas de comprensión
 *     (`COMPRENSION_A1`); el quiz A2 (`RETO_QUIZ`); la consigna y las pistas de
 *     A3 (`CONSIGNA_A3`); los cuatro enunciados verdadero/falso de A4
 *     (`HECHOS`); el glosario A5 (los cuatro primeros pares de `GLOSARIO` y sus
 *     ejemplos); el texto con huecos A6 (archivo `kit-herramientas-huecos.ts`);
 *     y la consigna final de A5 («Crea una estructura de carpetas para
 *     organizar tus materias de este semestre»), que es la que da pie al modo
 *     del escritorio.
 *   · ESCRITO PARA ESTE LABORATORIO (ilustrativo): los ocho encargos
 *     (`ENCARGOS`), las tres parejas de herramientas y sus siete rondas
 *     (`PAREJAS`, `RONDAS`), los seis archivos del escritorio (`ARCHIVOS`) con
 *     sus nombres candidatos y los ocho pasos del trabajo (`PASOS`). Son
 *     situaciones verosímiles de un bachillerato mexicano, con personas y
 *     salones ficticios.
 *
 * SOBRE LAS MARCAS. Los productos concretos que la progresión nombra (Google
 * Keep, Notion, Evernote, Google Calendar, Google Docs, LibreOffice Writer,
 * Google Classroom, Moodle, Microsoft Teams, WhatsApp, Telegram, Google
 * Scholar, Wikipedia, LibreOffice Calc e Impress) se conservan verbatim donde
 * la base de datos los trae: en la lectura, en el quiz y en los ejemplos del
 * glosario. Las mecánicas evaluables NO los usan: hablan de categorías y de
 * herramientas descritas por lo que hacen. Aquí no se afirma ningún precio,
 * límite de almacenamiento ni función de ningún producto.
 */

import type { QuizEvaluable } from "./_reto-quiz";
import type { ParTermino } from "./_mecanica-termino";

/* ─────────────────────────────────────────────────────────────────────────
 * LAS OCHO CATEGORÍAS
 *
 * Una categoría es «para qué sirve la herramienta», no «cómo se llama». Son
 * las ocho que la progresión pone en juego entre la lectura A1 (organizar,
 * planificar, escribir, buscar, citar) y el glosario A5 (procesador, hoja de
 * cálculo, presentación, respaldo).
 * ───────────────────────────────────────────────────────────────────────── */
export type Categoria =
  | "notas"
  | "calendario"
  | "fuentes"
  | "citas"
  | "texto"
  | "hoja"
  | "presentacion"
  | "respaldo";

export const CATEGORIA_INFO: Record<
  Categoria,
  { titulo: string; corto: string; subtitulo: string; icono: string; ejemploBD?: string }
> = {
  notas: {
    titulo: "Notas y pendientes",
    corto: "Notas",
    subtitulo: "Guarda ideas sueltas, listas de tareas y recordatorios. Se abre rápido y se escribe en dos renglones.",
    icono: "fa-note-sticky",
    ejemploBD: "Verbatim de A1: «herramientas como Google Keep, Notion o Evernote permiten guardar notas, listas de tareas y recordatorios».",
  },
  calendario: {
    titulo: "Calendario y cronograma",
    corto: "Calendario",
    subtitulo: "Coloca cada entrega en una fecha, reparte las semanas y avisa antes de que llegue el día.",
    icono: "fa-calendar-days",
    ejemploBD: "Verbatim de A1: «las apps de calendarios (Google Calendar) ayudan a planificar tareas y exámenes».",
  },
  fuentes: {
    titulo: "Buscador académico y biblioteca digital",
    corto: "Buscar fuentes",
    subtitulo: "Encuentra artículos, libros y revistas revisados por especialistas, no publicaciones sueltas.",
    icono: "fa-magnifying-glass",
    ejemploBD: "Verbatim de A1: «Google Scholar es útil para artículos académicos […] Las bibliotecas digitales (UNAM, CONACULTA) ofrecen acceso a libros y revistas verificados».",
  },
  citas: {
    titulo: "Registro de referencias y citas",
    corto: "Referencias",
    subtitulo: "Una lista donde anotas de cada fuente autor, título, año y liga, para citarla al final del trabajo.",
    icono: "fa-quote-right",
    ejemploBD: "Verbatim de A1: usar las herramientas responsablemente «implica citar correctamente las fuentes, no plagiar».",
  },
  texto: {
    titulo: "Procesador de texto",
    corto: "Procesador",
    subtitulo: "Escribe documentos con formato; si es en línea, varias personas pueden escribir el mismo texto a la vez.",
    icono: "fa-file-lines",
    ejemploBD: "Verbatim de A5: «programa para escribir y dar formato a documentos». Ejemplo de A5: «Writer de LibreOffice o Google Docs».",
  },
  hoja: {
    titulo: "Hoja de cálculo",
    corto: "Hoja de cálculo",
    subtitulo: "Organiza datos en filas y columnas, hace las operaciones sola y dibuja la gráfica.",
    icono: "fa-table-cells",
    ejemploBD: "Verbatim de A5: «programa para organizar datos en filas y columnas y hacer cálculos». Ejemplo de A5: «Calc de LibreOffice o Google Sheets».",
  },
  presentacion: {
    titulo: "Presentación electrónica",
    corto: "Presentación",
    subtitulo: "Diapositivas con títulos e imágenes para apoyar lo que dices frente al grupo.",
    icono: "fa-display",
    ejemploBD: "Verbatim de A5: «programa para crear diapositivas para exponer un tema». Ejemplo de A5: «Impress de LibreOffice».",
  },
  respaldo: {
    titulo: "Respaldo y versiones",
    corto: "Respaldo",
    subtitulo: "Una copia del trabajo fuera de tu computadora, para no perderlo y para poder volver a una versión anterior.",
    icono: "fa-cloud-arrow-up",
    ejemploBD: "Verbatim de A5: «copia de seguridad de tus archivos para no perderlos». Ejemplo de A5: «guardar tu tarea también en la nube o una USB».",
  },
};

export const CATEGORIAS_ORDEN: Categoria[] = [
  "notas",
  "calendario",
  "fuentes",
  "citas",
  "texto",
  "hoja",
  "presentacion",
  "respaldo",
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 1 — «El encargo del día»
 *
 * Llega una tarea escolar concreta y hay que decidir la categoría. Cada
 * encargo trae además los dos descartes que más tientan, con la razón de por
 * qué no sirven AQUÍ: no basta con acertar, hay que poder decir por qué no la
 * otra.
 * ───────────────────────────────────────────────────────────────────────── */
export interface Encargo {
  id: string;
  materia: string;
  texto: string;
  correcta: Categoria;
  /** Por qué esta categoría y no otra. */
  porque: string;
  /** Las dos categorías que más tientan, con su razón de descarte. */
  descartes: { cat: Categoria; porque: string }[];
}

export const ENCARGOS: Encargo[] = [
  {
    id: "en-notas",
    materia: "Camino a casa",
    texto: "Vas en el camión y se te ocurre el tema del proyecto de Cultura Digital. Quieres dejarlo guardado antes de que se te olvide, sin bajarte del camión.",
    correcta: "notas",
    porque: "Una idea suelta necesita un lugar que se abra rápido y acepte dos renglones. Eso es exactamente lo que hace una herramienta de notas y pendientes.",
    descartes: [
      { cat: "texto", porque: "Abrir un documento con formato, márgenes y tipografía para escribir dos renglones es más trabajo que la idea que quieres guardar." },
      { cat: "calendario", porque: "El calendario guarda algo que ocurre en una fecha. Tu idea todavía no tiene fecha: tiene que existir primero." },
    ],
  },
  {
    id: "en-calendario",
    materia: "Historia",
    texto: "El examen de Historia es dentro de tres semanas y quieres repartir los temas por semana y que algo te avise dos días antes.",
    correcta: "calendario",
    porque: "Lo que necesitas no es una lista, es el tiempo repartido: fechas, bloques por semana y un aviso antes del día. Eso vive en un calendario.",
    descartes: [
      { cat: "notas", porque: "Una lista de pendientes te dice QUÉ falta, pero no CUÁNDO toca cada cosa ni te avisa el día anterior." },
      { cat: "hoja", porque: "Podrías dibujar el cronograma en una tabla, pero la tabla no te avisa: tendrías que acordarte de abrirla, que es justo lo que quieres evitar." },
    ],
  },
  {
    id: "en-fuentes",
    materia: "Ciencias Naturales",
    texto: "Necesitas artículos sobre la calidad del agua revisados por especialistas, no publicaciones sueltas de redes sociales.",
    correcta: "fuentes",
    porque: "«Revisado por especialistas» es la señal de un buscador académico o una biblioteca digital: ahí lo que aparece pasó por una revisión antes de publicarse.",
    descartes: [
      { cat: "notas", porque: "Guardar la liga en una nota sirve DESPUÉS de haber encontrado la fuente; no te ayuda a encontrarla." },
      { cat: "citas", porque: "La lista de referencias se llena con lo que ya encontraste. Primero hay que dar con el artículo." },
    ],
  },
  {
    id: "en-citas",
    materia: "Cultura Digital",
    texto: "Terminaste el ensayo y ahora hay que decir de dónde salió cada dato: autor, título, año y la liga de cada fuente que usaste.",
    correcta: "citas",
    porque: "Citar es registrar la procedencia de cada dato. Se hace en una lista de referencias que llevas mientras investigas, para no reconstruirla al final de memoria.",
    descartes: [
      { cat: "fuentes", porque: "El buscador te llevó hasta la fuente, pero no guarda por ti lo que tienes que citar de ella." },
      { cat: "presentacion", porque: "Las diapositivas muestran conclusiones; la referencia completa va en el trabajo escrito, no en el apoyo visual." },
    ],
  },
  {
    id: "en-texto",
    materia: "Lengua y Comunicación",
    texto: "Tres compañeros tienen que entregar mañana el mismo ensayo y hoy cada quien está en su casa, escribiendo su parte.",
    correcta: "texto",
    porque: "Un solo documento con formato que varias personas escriben al mismo tiempo: es lo que un procesador de texto en línea permite, sin andar mandándose el archivo por turnos.",
    descartes: [
      { cat: "notas", porque: "Una nota compartida no da un documento con formato, ni portada, ni el texto continuo que se va a entregar." },
      { cat: "respaldo", porque: "El respaldo guarda el archivo, pero no es donde se escribe: guardar tres copias distintas del mismo ensayo es justo el problema que quieres evitar." },
    ],
  },
  {
    id: "en-hoja",
    materia: "Química",
    texto: "El viernes hay que entregar la masa de 12 muestras, el promedio de todas y una gráfica de barras con los resultados.",
    correcta: "hoja",
    porque: "Doce datos, una operación sobre todos ellos y una gráfica: una hoja de cálculo recalcula el promedio sola cada vez que corriges un dato.",
    descartes: [
      { cat: "texto", porque: "El procesador escribe la tabla, pero no calcula: sacarías el promedio a mano y volverías a sacarlo cada vez que corrijas un número." },
      { cat: "presentacion", porque: "Las diapositivas muestran el resultado, no lo calculan. Primero hay que tenerlo." },
    ],
  },
  {
    id: "en-presentacion",
    materia: "Cultura Digital",
    texto: "Van a exponer ocho minutos frente al grupo y quieren apoyarse en imágenes y títulos que se lean desde la última banca.",
    correcta: "presentacion",
    porque: "Un apoyo visual para exponer se ve a distancia y va detrás de quien habla. Eso es una presentación electrónica: pocas palabras por diapositiva, imágenes grandes.",
    descartes: [
      { cat: "texto", porque: "Proyectar cinco cuartillas de documento y leerlas en voz alta no es un apoyo visual: el público lee en lugar de escucharte." },
      { cat: "hoja", porque: "La hoja de cálculo sirve para obtener los datos; para enseñarlos al grupo hace falta pasarlos a una diapositiva legible." },
    ],
  },
  {
    id: "en-respaldo",
    materia: "Todas",
    texto: "Se te dañó la memoria USB dos días antes de la entrega. Quieres que el trabajo exista en más de un lugar y poder volver a la versión de anteayer.",
    correcta: "respaldo",
    porque: "Dos cosas a la vez: una copia fuera de tu computadora y versiones anteriores a las que puedas volver. Eso es lo que hace un respaldo.",
    descartes: [
      { cat: "notas", porque: "Una nota guarda texto corto, no los archivos del trabajo ni su historial." },
      { cat: "calendario", porque: "El calendario te recuerda la fecha de entrega; no conserva el archivo ni lo que decía antes." },
    ],
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 2 — «Elegir entre dos»
 *
 * Dos herramientas de la MISMA categoría, descritas por lo que hacen (no por
 * su marca). Una necesidad declarada hace ganar a una. Tres de las siete
 * rondas repiten pareja con otra necesidad: la respuesta se voltea, y ese es
 * el punto —no hay una herramienta «mejor», hay una que sirve para esto.
 * ───────────────────────────────────────────────────────────────────────── */
export interface Herramienta {
  nombre: string;
  icono: string;
  /** Características declaradas: lo que sí hace. */
  aFavor: string[];
  /** Lo que no hace o lo que cuesta. */
  enContra: string[];
}

export interface Pareja {
  id: string;
  categoria: string;
  a: Herramienta;
  b: Herramienta;
}

export const PAREJAS: Pareja[] = [
  {
    id: "pj-editor",
    categoria: "Procesador de texto",
    a: {
      nombre: "Editor instalado en la computadora",
      icono: "fa-desktop",
      aFavor: ["Funciona sin internet", "El archivo queda en tu disco"],
      enContra: ["Solo escribe una persona a la vez", "Si no lo guardas tú, no hay versión anterior"],
    },
    b: {
      nombre: "Editor en el navegador",
      icono: "fa-globe",
      aFavor: ["Varias personas escriben a la vez", "Conserva versiones anteriores"],
      enContra: ["Necesita internet para abrirlo", "Hay que tener una cuenta"],
    },
  },
  {
    id: "pj-formato",
    categoria: "Formato del archivo que entregas",
    a: {
      nombre: "Archivo editable del procesador",
      icono: "fa-file-pen",
      aFavor: ["Se puede seguir corrigiendo", "Acepta comentarios y cambios"],
      enContra: ["Puede verse distinto en otro programa o computadora", "Cualquiera que lo abra puede modificarlo"],
    },
    b: {
      nombre: "El mismo trabajo exportado a PDF",
      icono: "fa-file-pdf",
      aFavor: ["Se ve igual en cualquier dispositivo", "Conserva tipografía, márgenes y saltos de página"],
      enContra: ["No se edita como un documento", "Hay que volver a exportarlo tras cada corrección"],
    },
  },
  {
    id: "pj-respaldo",
    categoria: "Dónde guardas la copia",
    a: {
      nombre: "Memoria USB",
      icono: "fa-usb",
      aFavor: ["No necesita internet", "Funciona en cualquier computadora con puerto USB"],
      enContra: ["Si se pierde o se daña, se pierde la copia", "Solo guarda lo último que copiaste"],
    },
    b: {
      nombre: "Carpeta sincronizada en la nube",
      icono: "fa-cloud",
      aFavor: ["Está en todos tus dispositivos", "Conserva versiones anteriores del archivo"],
      enContra: ["Necesita internet para subir y para bajar", "Hay que tener una cuenta"],
    },
  },
];

export interface Ronda {
  id: string;
  parejaId: string;
  necesidad: string;
  gana: "a" | "b";
  porque: string;
  /** Por qué la otra no, EN ESTE CASO. */
  porqueNo: string;
  /** Marca las rondas que repiten pareja para voltear la respuesta. */
  giro?: boolean;
}

export const RONDAS: Ronda[] = [
  {
    id: "rd-1",
    parejaId: "pj-editor",
    necesidad: "Hoy no hay internet en tu casa y quieres dejar avanzado el borrador esta noche.",
    gana: "a",
    porque: "Sin internet, lo único que abre y guarda es el editor instalado. Lo demás puede esperar a mañana.",
    porqueNo: "El editor en el navegador no abre sin conexión: esta noche no te serviría de nada.",
  },
  {
    id: "rd-2",
    parejaId: "pj-editor",
    necesidad: "Son las nueve de la noche, ustedes tres tienen que terminar el mismo texto para mañana y cada quien está en su casa.",
    gana: "b",
    porque: "Tres personas escribiendo el mismo texto al mismo tiempo: eso solo lo resuelve el editor en el navegador, que además deja ver quién escribió qué.",
    porqueNo: "Con el editor instalado tendrían que mandarse el archivo por turnos y alguien terminaría pegando a mano lo que escribieron los otros dos.",
    giro: true,
  },
  {
    id: "rd-3",
    parejaId: "pj-editor",
    necesidad: "Alguien borró media página ayer y hoy necesitan recuperar lo que decía.",
    gana: "b",
    porque: "Conservar versiones anteriores es una característica declarada del editor en el navegador: se vuelve a la de ayer y ahí está el párrafo.",
    porqueNo: "En el editor instalado solo existe lo último que alguien guardó: si guardó encima, el párrafo no está en ninguna parte.",
    giro: true,
  },
  {
    id: "rd-4",
    parejaId: "pj-formato",
    necesidad: "Es la versión final y quieres que el profesor la vea exactamente como la dejaste, aunque la abra en su teléfono.",
    gana: "b",
    porque: "El PDF conserva tipografía, márgenes y saltos de página: lo que ves tú es lo que ve quien lo abre, en la computadora o en el teléfono.",
    porqueNo: "El archivo editable puede recorrerse o cambiar de tipografía en otro programa, y justo eso es lo que no quieres en la entrega final.",
  },
  {
    id: "rd-5",
    parejaId: "pj-formato",
    necesidad: "Tu compañera todavía tiene que corregir la ortografía y marcar dos párrafos que sobran.",
    gana: "a",
    porque: "Mientras el trabajo se está corrigiendo tiene que poder editarse y aceptar comentarios. El PDF llega después, cuando ya no se toca.",
    porqueNo: "Exportar a PDF ahora obligaría a corregir en el documento original y volver a exportar en cada vuelta.",
    giro: true,
  },
  {
    id: "rd-6",
    parejaId: "pj-respaldo",
    necesidad: "En el laboratorio de la escuela no hay internet y tienes que llevarte hoy el archivo a tu casa.",
    gana: "a",
    porque: "Sin conexión, la USB es la copia que sí puedes hacer ahora mismo y llevarte en la mochila.",
    porqueNo: "La carpeta en la nube necesita internet para subir el archivo: en ese laboratorio no es una opción hoy.",
  },
  {
    id: "rd-7",
    parejaId: "pj-respaldo",
    necesidad: "Quieres que el trabajo siga existiendo aunque mañana pierdas la mochila con todo adentro.",
    gana: "b",
    porque: "La copia tiene que estar en un lugar que no viaje contigo. La carpeta sincronizada está también fuera de la mochila, y además conserva versiones.",
    porqueNo: "Si la única copia es la USB y la USB va en la mochila, perder la mochila es perder el trabajo.",
    giro: true,
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 3 — «Arregla el escritorio»
 *
 * Nace de la consigna verbatim de A5: «Crea una estructura de carpetas para
 * organizar tus materias de este semestre.» Primero se renombra (un nombre que
 * puedas encontrar en tres semanas) y después se archiva.
 * ───────────────────────────────────────────────────────────────────────── */
export type MateriaId = "quimica" | "matematicas" | "historia" | "cultura";

export const MATERIA_INFO: Record<MateriaId, { titulo: string; icono: string }> = {
  quimica: { titulo: "Química", icono: "fa-flask" },
  matematicas: { titulo: "Matemáticas", icono: "fa-square-root-variable" },
  historia: { titulo: "Historia", icono: "fa-landmark" },
  cultura: { titulo: "Cultura Digital", icono: "fa-laptop-code" },
};

export const REGLAS_NOMBRE: { regla: string; porque: string; icono: string }[] = [
  {
    regla: "Empieza por la materia",
    porque: "Al ordenar la carpeta por nombre, todo lo de una misma materia queda junto sin que tengas que buscarlo.",
    icono: "fa-folder-tree",
  },
  {
    regla: "Sigue el tema, no «tarea»",
    porque: "En tres semanas vas a tener seis archivos llamados «tarea». El tema es lo único que distingue a uno de otro.",
    icono: "fa-tag",
  },
  {
    regla: "La fecha en formato AAAA-MM-DD",
    porque: "Escrita así, la lista se ordena sola en orden cronológico. Escrita 20-02-2026, el 20 de febrero queda junto al 20 de marzo.",
    icono: "fa-calendar-day",
  },
  {
    regla: "La versión con número: v2, v3",
    porque: "«final», «definitiva» y «BUENA» no se pueden ordenar ni comparar. Un número sí dice cuál es la última.",
    icono: "fa-code-branch",
  },
  {
    regla: "Sin espacios ni acentos",
    porque: "Al subir el archivo o compartirlo por una liga, los espacios y los acentos se transforman y el nombre llega deformado.",
    icono: "fa-font",
  },
];

export interface ArchivoDesordenado {
  id: string;
  nombreMalo: string;
  icono: string;
  /** Qué es el archivo en realidad (lo que hay que poder deducir del nombre). */
  contexto: string;
  materia: MateriaId;
  opciones: string[];
  correcta: number;
  porque: string;
  /** Una razón por cada opción equivocada, en el mismo orden que `opciones`. */
  porqueNo: string[];
}

export const ARCHIVOS: ArchivoDesordenado[] = [
  {
    id: "ar-1",
    nombreMalo: "Documento sin título (3).docx",
    icono: "fa-file-word",
    contexto: "Reporte de la práctica de la tabla periódica, de Química, que entregas el 20 de febrero de 2026.",
    materia: "quimica",
    opciones: [
      "Quimica_TablaPeriodica_2026-02-20.docx",
      "tarea de quimica.docx",
      "Documento sin título (4).docx",
    ],
    correcta: 0,
    porque: "Materia, tema y fecha en formato AAAA-MM-DD: con ese nombre lo encuentras en tres semanas y queda junto al resto de Química.",
    porqueNo: [
      "",
      "«Tarea de química» va a describir también a las otras cinco tareas de Química del semestre.",
      "Subirle el número al «sin título» conserva el problema: el nombre sigue sin decir qué hay adentro.",
    ],
  },
  {
    id: "ar-2",
    nombreMalo: "tarea final BUENA ok ok.docx",
    icono: "fa-file-word",
    contexto: "Segunda versión del ensayo de Historia sobre la Revolución Mexicana, del 18 de febrero de 2026.",
    materia: "historia",
    opciones: [
      "tarea final BUENA ok ok (copia).docx",
      "Historia_Ensayo-Revolucion_2026-02-18_v2.docx",
      "ensayo.docx",
    ],
    correcta: 1,
    porque: "La versión con número (v2) sí se puede comparar con la v1 y con la v3. «BUENA ok ok» no dice cuál es la última.",
    porqueNo: [
      "Añadir «(copia)» es exactamente como se llega a tener cuatro archivos y no saber cuál entregar.",
      "",
      "«Ensayo» a secas no dice de qué materia es ni de qué trata: dentro de un mes no lo vas a reconocer.",
    ],
  },
  {
    id: "ar-3",
    nombreMalo: "IMG_20260214_093301.jpg",
    icono: "fa-file-image",
    contexto: "Foto del cartel que hizo el equipo 3 para Cultura Digital, tomada el 14 de febrero de 2026.",
    materia: "cultura",
    opciones: [
      "foto cartel.jpg",
      "IMG_20260214_093301 - copia.jpg",
      "CulturaDigital_Cartel-Equipo3_2026-02-14.jpg",
    ],
    correcta: 2,
    porque: "El nombre que pone la cámara tiene la fecha, pero no dice de qué es la foto. Añadir materia y tema lo vuelve buscable.",
    porqueNo: [
      "«Foto cartel» pierde la fecha y la materia: dos datos que el nombre original sí traía.",
      "La copia hereda el problema del original y además duplica el archivo sin razón.",
      "",
    ],
  },
  {
    id: "ar-4",
    nombreMalo: "Nueva hoja de cálculo.xlsx",
    icono: "fa-file-excel",
    contexto: "Concentrado de la encuesta de Matemáticas para el tema de estadística, del 16 de febrero de 2026.",
    materia: "matematicas",
    opciones: [
      "Matematicas_Estadistica-Encuesta_2026-02-16.xlsx",
      "Nueva hoja de cálculo (1).xlsx",
      "encuesta 16-02-2026.xlsx",
    ],
    correcta: 0,
    porque: "Materia, tema y fecha ordenable. El nombre que pone el programa al crear el archivo no describe nada.",
    porqueNo: [
      "",
      "El (1) solo indica que ya existía otro igual de anónimo.",
      "La fecha 16-02-2026 no ordena bien: en la lista, el 16 de febrero queda junto al 16 de marzo y al 16 de abril.",
    ],
  },
  {
    id: "ar-5",
    nombreMalo: "presentacion FINAL definitiva real.pptx",
    icono: "fa-file-powerpoint",
    contexto: "Tercera versión de la presentación del kit de herramientas, de Cultura Digital, del 23 de febrero de 2026.",
    materia: "cultura",
    opciones: [
      "presentacion FINAL definitiva real 2.pptx",
      "CulturaDigital_Exposicion-Kit_2026-02-23_v3.pptx",
      "PRESENTACION.pptx",
    ],
    correcta: 1,
    porque: "Cuando la versión es un número, la siguiente es v4 y no hay que inventar otro adjetivo. Ese es el punto de versionar.",
    porqueNo: [
      "Después de «final definitiva real» ya no queda palabra que agregar; por eso la gente termina poniendo «2».",
      "",
      "Escribirlo en mayúsculas no agrega información: sigue sin decir materia, tema ni fecha.",
    ],
  },
  {
    id: "ar-6",
    nombreMalo: "Captura de pantalla 2026-02-10 a las 21.14.05.png",
    icono: "fa-file-image",
    contexto: "Evidencia del simulador de reacciones de Química, capturada el 10 de febrero de 2026.",
    materia: "quimica",
    opciones: [
      "captura.png",
      "Quimica_Evidencia-Simulador_2026-02-10.png",
      "Captura de pantalla 2026-02-10 a las 21.14.05 (2).png",
    ],
    correcta: 1,
    porque: "La captura ya traía la fecha correcta; lo que le faltaba era decir de qué materia es y de qué es evidencia. De paso pierde los espacios.",
    porqueNo: [
      "«Captura» va a nombrar también a las otras once capturas del semestre.",
      "",
      "El (2) no resuelve nada y el nombre sigue con espacios, que al compartirlo por una liga se deforman.",
    ],
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 4 — «El trabajo completo»
 *
 * Los ocho pasos de un trabajo escolar real, en el orden en que ocurren, y la
 * herramienta de cada paso. El orden importa: registrar la fuente DESPUÉS de
 * escribir el ensayo es como se llega a la bibliografía inventada.
 * ───────────────────────────────────────────────────────────────────────── */
export interface PasoTrabajo {
  id: string;
  orden: number;
  titulo: string;
  detalle: string;
  correcta: Categoria;
  /** Tres categorías entre las que elegir (incluye la correcta). */
  opciones: Categoria[];
  porque: string;
  /** Por qué va en ese lugar de la secuencia. */
  porqueAhi: string;
}

export const PASOS: PasoTrabajo[] = [
  {
    id: "pa-1",
    orden: 0,
    titulo: "Apuntar las indicaciones que dictó el profesor",
    detalle: "Extensión, fecha de entrega, si es en equipo y qué hay que incluir.",
    correcta: "notas",
    opciones: ["notas", "presentacion", "hoja"],
    porque: "Son cuatro datos sueltos dictados en clase: van a una nota rápida, no a un documento con formato.",
    porqueAhi: "Va primero porque todo lo demás depende de lo que pidió el profesor. Lo que no se apunta en ese momento se pierde.",
  },
  {
    id: "pa-2",
    orden: 1,
    titulo: "Repartir las semanas hasta la fecha de entrega",
    detalle: "Qué queda hecho cada semana y cuándo hay que tener el borrador.",
    correcta: "calendario",
    opciones: ["calendario", "citas", "texto"],
    porque: "Repartir el tiempo y recibir un aviso antes de cada fecha es lo que hace un calendario.",
    porqueAhi: "Va antes de empezar a trabajar: planear a mitad del camino ya no cambia el tiempo que queda.",
  },
  {
    id: "pa-3",
    orden: 2,
    titulo: "Buscar artículos y libros confiables sobre el tema",
    detalle: "Fuentes revisadas, no la primera publicación que aparezca en una red social.",
    correcta: "fuentes",
    opciones: ["fuentes", "respaldo", "notas"],
    porque: "Un buscador académico o una biblioteca digital son las herramientas para encontrar material verificado.",
    porqueAhi: "Antes de escribir hay que tener qué decir. Buscar al final solo sirve para adornar lo que ya opinabas.",
  },
  {
    id: "pa-4",
    orden: 3,
    titulo: "Registrar autor, título, año y liga de cada fuente",
    detalle: "En cuanto la encuentras, no al terminar el trabajo.",
    correcta: "citas",
    opciones: ["citas", "presentacion", "calendario"],
    porque: "La lista de referencias es el lugar donde queda la procedencia de cada dato para poder citarlo después.",
    porqueAhi: "Va junto a la búsqueda: reconstruir de memoria de dónde salió cada dato es como se llega, sin querer, al plagio.",
  },
  {
    id: "pa-5",
    orden: 4,
    titulo: "Calcular los resultados de la encuesta que aplicaron",
    detalle: "Sumas, porcentajes y la gráfica que va a ir en el trabajo.",
    correcta: "hoja",
    opciones: ["hoja", "texto", "notas"],
    porque: "Filas, columnas, una operación sobre todos los datos y su gráfica: hoja de cálculo.",
    porqueAhi: "Los resultados tienen que existir antes de escribir el párrafo que los interpreta.",
  },
  {
    id: "pa-6",
    orden: 5,
    titulo: "Escribir el borrador entre los tres",
    detalle: "Cada quien desde su casa, sobre el mismo documento.",
    correcta: "texto",
    opciones: ["texto", "fuentes", "respaldo"],
    porque: "Un procesador de texto en línea permite que varias personas escriban el mismo documento a la vez y comenten en el margen.",
    porqueAhi: "Se escribe cuando ya hay fuentes y resultados; escribir primero obliga a reescribir después.",
  },
  {
    id: "pa-7",
    orden: 6,
    titulo: "Guardar una copia fuera de tu computadora",
    detalle: "Antes de entregar, no después del susto.",
    correcta: "respaldo",
    opciones: ["respaldo", "calendario", "citas"],
    porque: "Una copia en otro lugar es lo que te protege si se daña el equipo o se pierde la memoria.",
    porqueAhi: "Va antes de la entrega: el respaldo que se hace después de perder el archivo no sirve para nada.",
  },
  {
    id: "pa-8",
    orden: 7,
    titulo: "Preparar el apoyo visual para exponerlo",
    detalle: "Títulos e imágenes que se lean desde la última banca.",
    correcta: "presentacion",
    opciones: ["presentacion", "hoja", "notas"],
    porque: "Una presentación electrónica es el apoyo visual: pocas palabras por diapositiva y la gráfica en grande.",
    porqueAhi: "Al final, porque la exposición resume un trabajo que ya está hecho.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 5 — Escribe el término (glosario)
 *
 * Los cuatro primeros pares y sus ejemplos son VERBATIM de A5. Los dos últimos
 * los define la propia lectura A1 y los vuelve a preguntar el quiz A2.
 * ───────────────────────────────────────────────────────────────────────── */
export const GLOSARIO: ParTermino[] = [
  {
    id: "gl-procesador",
    termino: "Procesador de texto",
    definicion: "Programa para escribir y dar formato a documentos.",
    ejemplo: "Writer de LibreOffice o Google Docs.",
  },
  {
    id: "gl-hoja",
    termino: "Hoja de cálculo",
    definicion: "Programa para organizar datos en filas y columnas y hacer cálculos.",
    ejemplo: "Calc de LibreOffice o Google Sheets.",
  },
  {
    id: "gl-presentacion",
    termino: "Presentación electrónica",
    definicion: "Programa para crear diapositivas para exponer un tema.",
    ejemplo: "Impress de LibreOffice.",
  },
  {
    id: "gl-respaldo",
    termino: "Respaldo (backup)",
    definicion: "Copia de seguridad de tus archivos para no perderlos.",
    ejemplo: "Guardar tu tarea también en la nube o una USB.",
  },
  {
    id: "gl-plagio",
    termino: "Plagio",
    definicion: "Usar el trabajo o ideas de otros sin dar crédito, presentándolo como propio.",
    ejemplo: "Verbatim de A2: es una falta académica y ética grave.",
  },
  {
    id: "gl-scholar",
    termino: "Buscador académico",
    definicion: "Buscador especializado en literatura académica y científica, útil para encontrar artículos y publicaciones revisadas.",
    ejemplo: "Verbatim de A1 y A2: Google Scholar es útil para artículos académicos.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * Hechos verdadero/falso — VERBATIM de A4
 * ───────────────────────────────────────────────────────────────────────── */
export const HECHOS: { enunciado: string; respuesta: boolean; retro: string }[] = [
  {
    enunciado: "Organizar tus archivos en carpetas con nombres claros facilita encontrarlos después.",
    respuesta: true,
    retro: "Correcto: la organización ahorra tiempo.",
  },
  {
    enunciado: "Una hoja de cálculo sirve para organizar datos y hacer operaciones automáticas.",
    respuesta: true,
    retro: "Correcto: es útil para tablas, sumas y gráficas.",
  },
  {
    enunciado: "Guardar una copia de respaldo de tus trabajos es una pérdida de tiempo.",
    respuesta: false,
    retro: "Un respaldo te protege si pierdes o se daña el original.",
  },
  {
    enunciado: "Las plataformas de colaboración permiten trabajar en un documento entre varias personas a la vez.",
    respuesta: true,
    retro: "Correcto: facilitan el trabajo en equipo.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * Lectura A1 y sus preguntas — VERBATIM
 * ───────────────────────────────────────────────────────────────────────── */
export const LECTURA_A1: string[] = [
  "Las herramientas digitales para el estudio y la organización han transformado la forma en que aprendemos, colaboramos y comunicamos. Conocerlas y usarlas estratégicamente puede marcar una gran diferencia en tu rendimiento académico.",
  "Para la organización de información, herramientas como Google Keep, Notion o Evernote permiten guardar notas, listas de tareas y recordatorios. Las apps de calendarios (Google Calendar) ayudan a planificar tareas y exámenes. Los procesadores de texto como Google Docs o LibreOffice Writer permiten crear documentos y colaborar en tiempo real.",
  "Para la comunicación escolar, el correo electrónico sigue siendo fundamental para comunicaciones formales. Plataformas como Google Classroom, Moodle o Microsoft Teams concentran las actividades escolares. Los chats grupales (WhatsApp, Telegram) son útiles para coordinación informal, aunque conviene mantener un tono respetuoso incluso en espacios informales.",
  "Para la búsqueda y verificación de información, Google Scholar es útil para artículos académicos. Wikipedia es un buen punto de partida pero no una fuente primaria. Las bibliotecas digitales (UNAM, CONACULTA) ofrecen acceso a libros y revistas verificados.",
  "Usarlas responsablemente implica citar correctamente las fuentes, no plagiar, proteger la privacidad de los compañeros y mantener separados los espacios de ocio y estudio.",
];

export const COMPRENSION_A1: { pregunta: string; guia: string }[] = [
  {
    pregunta: "¿Qué diferencia hay entre Google Keep y Google Calendar?",
    guia: "Keep es para notas y listas; Calendar es para planificar tareas y eventos en el tiempo.",
  },
  {
    pregunta: "¿Por qué Wikipedia no es una fuente primaria?",
    guia: "Porque cualquiera puede editarla y no siempre es verificada por expertos; es un punto de partida, no una fuente definitiva.",
  },
  {
    pregunta: "¿Qué implica usar herramientas digitales responsablemente?",
    guia: "Citar fuentes, no plagiar, proteger la privacidad y separar espacios de ocio y estudio.",
  },
];

/** Callout «¿Sabías?» de A1, verbatim. */
export const DATO_SABIAS =
  "La Ciudad de México fue designada Ciudad Creativa del Diseño por la UNESCO en 2017, dentro de la Red de Ciudades Creativas. Aparte, 'Ciudad Creativa Digital' es un proyecto de desarrollo de la industria audiovisual y digital impulsado en Guadalajara, Jalisco —no una designación de la UNESCO.";

/** Consigna de la reflexión A3, verbatim. */
export const CONSIGNA_A3: { prompt: string; pistas: string[] } = {
  prompt:
    "Diseña tu 'kit de herramientas digitales para estudiar' basado en lo aprendido. Menciona al menos 4 herramientas (para organizar, comunicar, buscar información y crear). Explica para qué usarías cada una y por qué la elegiste. ¿Qué herramientas ya usas y qué herramientas nuevas descubriste o quieres probar?",
  pistas: [
    "¿Qué app te ayudaría a no olvidar las fechas de entrega?",
    "¿Dónde buscarías fuentes confiables para un trabajo de investigación?",
    "¿Qué herramienta usarías para tomar notas compartidas con un compañero?",
  ],
};

/** Actividad final del glosario A5, verbatim: de aquí sale el modo del escritorio. */
export const CONSIGNA_A5 = "Crea una estructura de carpetas para organizar tus materias de este semestre.";

/* ─────────────────────────────────────────────────────────────────────────
 * Reto evaluable — VERBATIM del quiz A2 (puntaje mínimo 70)
 * ───────────────────────────────────────────────────────────────────────── */
export const RETO_QUIZ: QuizEvaluable = {
  titulo: "¿Qué herramientas digitales conozco? · CD-I-P08-A2",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "¿Para qué sirve Google Scholar?",
      opciones: [
        "Para buscar imágenes de alta calidad",
        "Para buscar artículos y publicaciones académicas",
        "Para crear presentaciones en línea",
        "Para organizar tareas y recordatorios",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "Google Scholar es un buscador especializado en literatura académica y científica.",
    },
    {
      enunciado: "¿Por qué Wikipedia no es una fuente primaria?",
      opciones: [
        "Porque está en inglés",
        "Porque cualquiera puede editarla y no siempre es verificada por expertos",
        "Porque es muy antigua",
        "Porque no tiene imágenes",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "Wikipedia es un buen punto de partida, pero al ser editable por cualquiera, no se considera fuente primaria confiable.",
    },
    {
      enunciado: "¿Cuál de estas herramientas es más adecuada para planificar tus exámenes y tareas?",
      opciones: ["Google Scholar", "Wikipedia", "Google Calendar", "YouTube"],
      respuestaCorrecta: 2,
      retroalimentacion: "Google Calendar permite organizar fechas, recordatorios y eventos como exámenes y entregas.",
    },
    {
      enunciado: "¿Qué es el plagio en el contexto digital?",
      opciones: [
        "Descargar música para uso personal",
        "Usar el trabajo o ideas de otros sin dar crédito, presentándolo como propio",
        "Compartir artículos en redes sociales",
        "Guardar páginas web en favoritos",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "El plagio es usar el trabajo intelectual de otros sin citarlos, y es una falta académica y ética grave.",
    },
    {
      enunciado: "¿Cuál es un uso responsable de las herramientas digitales escolares?",
      opciones: [
        "Compartir las credenciales de la plataforma escolar con amigos",
        "Citar correctamente las fuentes y proteger la privacidad de los compañeros",
        "Usar el correo escolar para mensajes personales y redes sociales",
        "Instalar extensiones en la computadora de la escuela sin permiso",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "Citar fuentes y respetar la privacidad son prácticas de uso responsable de herramientas digitales.",
    },
  ],
};
