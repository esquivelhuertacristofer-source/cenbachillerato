/**
 * Datos del Laboratorio — Trabajar juntos en la nube: herramientas colaborativas
 * (CD-II-P02, Ciudadanía Digital II).
 *
 * Contenido VERBATIM de CD-II·P02 («Trabajar juntos en la nube: herramientas
 * colaborativas»). Las descripciones de herramientas, funciones de la nube,
 * buenas prácticas y las afirmaciones del cuestionario se toman literalmente de
 * las actividades A1 (lectura), A2 (simulación) y A4 (V/F). Las tareas a
 * clasificar son los casos que la propia simulación A2 plantea y resuelve.
 */

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 1 — ¿Qué herramienta uso? (clasifica cada tarea escolar por la
 * categoría de herramienta colaborativa adecuada)
 * ───────────────────────────────────────────────────────────────────────── */
export type Categoria =
  | "documento"
  | "presentacion"
  | "hoja"
  | "pizarron"
  | "gestion"
  | "comunicacion";

export const CATEGORIA_INFO: Record<
  Categoria,
  { titulo: string; subtitulo: string; icono: string }
> = {
  documento: {
    titulo: "Documento de texto colaborativo",
    subtitulo: "Google Docs o Word en línea: edición simultánea en tiempo real de un mismo texto.",
    icono: "fa-file-lines",
  },
  presentacion: {
    titulo: "Presentación",
    subtitulo: "Google Slides o PowerPoint en línea: diapositivas para exponer ante un público.",
    icono: "fa-display",
  },
  hoja: {
    titulo: "Hoja de cálculo",
    subtitulo: "Google Sheets o Excel en línea: tablas, cálculos y fórmulas para datos numéricos.",
    icono: "fa-table-cells",
  },
  pizarron: {
    titulo: "Pizarrón visual",
    subtitulo: "Miro o Padlet: pizarrón y tableros digitales para lluvias de ideas con post-its.",
    icono: "fa-lightbulb",
  },
  gestion: {
    titulo: "Gestión de tareas (kanban)",
    subtitulo: "Trello o Notion: tableros con columnas por hacer, en proceso y terminado.",
    icono: "fa-list-check",
  },
  comunicacion: {
    titulo: "Comunicación de equipo",
    subtitulo: "Teams: comunicarse y avisar al equipo en un solo lugar.",
    icono: "fa-comments",
  },
};

export const TAREAS: { id: string; texto: string; categoria: Categoria }[] = [
  { id: "ta-doc", texto: "Redactar el ensayo final en equipo de 3, escribiendo los tres a la vez", categoria: "documento" },
  { id: "ta-pres", texto: "Diseñar las diapositivas de la exposición del proyecto", categoria: "presentacion" },
  { id: "ta-hoja", texto: "Calcular el presupuesto del evento con fórmulas", categoria: "hoja" },
  { id: "ta-piz", texto: "Hacer una lluvia de ideas visual con post-its digitales", categoria: "pizarron" },
  { id: "ta-gest", texto: "Organizar las etapas del proyecto en columnas: por hacer, en proceso y terminado", categoria: "gestion" },
  { id: "ta-com", texto: "Avisar al equipo de un cambio de hora de la reunión", categoria: "comunicacion" },
  { id: "ta-doc2", texto: "Escribir un documento entre tres personas simultáneamente", categoria: "documento" },
  { id: "ta-hoja2", texto: "Registrar las calificaciones del equipo en una tabla con totales automáticos", categoria: "hoja" },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 2 — Funciones de la nube (empareja cada función con la descripción
 * verbatim de la lectura A1)
 * ───────────────────────────────────────────────────────────────────────── */
export const FUNCIONES: { id: string; funcion: string; descripcion: string; ejemplo: string }[] = [
  {
    id: "fn-edicion",
    funcion: "Edición simultánea",
    descripcion: "Varias personas trabajan sobre el mismo archivo en tiempo real, viendo los cambios de las demás al instante.",
    ejemplo: "Su ventaja central es la edición simultánea en tiempo real.",
  },
  {
    id: "fn-historial",
    funcion: "Historial de versiones",
    descripcion: "Permite recuperar cualquier versión anterior del archivo.",
    ejemplo: "Si alguien borra un párrafo por error, puedes volver a la versión de ayer.",
  },
  {
    id: "fn-comentarios",
    funcion: "Comentarios",
    descripcion: "Permiten hacer sugerencias sin modificar el texto directamente.",
    ejemplo: "Dejas una nota al margen proponiendo un cambio, en vez de reescribir lo de tu compañero.",
  },
  {
    id: "fn-sincronizacion",
    funcion: "Sincronización",
    descripcion: "La nube almacena archivos, ejecuta programas y sincroniza datos entre dispositivos.",
    ejemplo: "Empiezas el trabajo en la computadora del aula y lo continúas en tu celular sin perder nada.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 3 — Buenas prácticas vs. errores (clasifica cada acción en una de las
 * dos cestas, verbatim de la lectura A1)
 * ───────────────────────────────────────────────────────────────────────── */
export type Juicio = "buena" | "error";

export const JUICIO_INFO: Record<
  Juicio,
  { titulo: string; subtitulo: string; icono: string }
> = {
  buena: {
    titulo: "Buena práctica",
    subtitulo: "Acuerdos y hábitos que hacen fluido y ordenado el trabajo colaborativo.",
    icono: "fa-thumbs-up",
  },
  error: {
    titulo: "Error",
    subtitulo: "Hábitos que generan confusión, conflictos o pérdida de información.",
    icono: "fa-thumbs-down",
  },
};

export const ACCIONES: { id: string; texto: string; juicio: Juicio }[] = [
  { id: "ac-roles", texto: "Definir roles claros desde el inicio: quién redacta, quién revisa, quién presenta", juicio: "buena" },
  { id: "ac-nombre", texto: "Nombrar el archivo Proyecto_Final_v3_Equipo2", juicio: "buena" },
  { id: "ac-comentar", texto: "Usar los comentarios para sugerir un cambio en lugar de editar directamente el texto de otro", juicio: "buena" },
  { id: "ac-verificar", texto: "Verificar que la fuente de la información sea confiable antes de usarla", juicio: "buena" },
  { id: "ac-malnombre", texto: "Llamar al archivo «último definitivo real»", juicio: "error" },
  { id: "ac-editar", texto: "Editar directamente el texto de otra persona sin avisar", juicio: "error" },
  { id: "ac-fuente", texto: "Copiar información de internet sin verificar la fuente", juicio: "error" },
  { id: "ac-sinroles", texto: "Empezar el trabajo sin acordar quién hace cada cosa", juicio: "error" },
];

/* ─────────────────────────────────────────────────────────────────────────
 * Cuestionario de comprensión (V/F de A4, verbatim).
 * Renderizado como opción doble Verdadero / Falso.
 * ───────────────────────────────────────────────────────────────────────── */
export const QUIZ: {
  pregunta: string;
  opciones: [string, string];
  correcta: 0 | 1;
  retro: string;
}[] = [
  {
    pregunta: "TICCAD significa Tecnologías de Información, Comunicación, Conocimiento y Aprendizajes Digitales.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto. TICCAD son las Tecnologías de Información, Comunicación, Conocimiento y Aprendizajes Digitales: amplían las TIC al conocimiento y el aprendizaje.",
  },
  {
    pregunta: "Toda la información que aparece en internet es verdadera y confiable.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "Falso. Discriminar información significa distinguir las fuentes confiables de las que no lo son: no toda la información de internet es verdadera.",
  },
  {
    pregunta: "La nube es un conjunto de servidores remotos a los que se accede por internet y que almacenan archivos, ejecutan programas y sincronizan datos entre dispositivos.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto. La nube (cloud) es justamente eso: servidores remotos accesibles por internet que guardan archivos, ejecutan programas y sincronizan datos entre tus dispositivos.",
  },
  {
    pregunta: "Es mejor editar directamente el texto de otra persona en vez de usar los comentarios para sugerir cambios.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "Falso. La buena práctica es usar los comentarios para sugerir cambios en lugar de editar directamente el texto de otro, así nadie pierde su trabajo ni se generan conflictos.",
  },
];

/** Dato verbatim de la lectura A1 (definición de la nube). */
export const DATO_NUBE =
  "La nube (cloud) es simplemente un conjunto de servidores remotos a los que se accede a través de internet y que almacenan archivos, ejecutan programas y sincronizan datos entre dispositivos.";
