/**
 * Modelo del simulador «Una semana de proyecto» (CD-II-P02).
 *
 * Equipo FICTICIO de 4 estudiantes; todas las cifras son valores de juego
 * (simulación), no estadísticas. El modelo es determinista: las mismas
 * decisiones dan siempre la misma semana. Funciones puras, sin React.
 *
 * Cada necesidad se resuelve con una de tres herramientas; la mejor aprovecha la
 * edición simultánea, el historial, los comentarios o la sincronización de la
 * lectura A1. Los permisos y el historial de versiones del documento modifican
 * el resultado del martes.
 */

export type NecesidadId = "reunion" | "tareas" | "escribir" | "avisos" | "archivos" | "fechas";
export type Permisos = "todos" | "roles" | "uno";

export interface Companero {
  id: string;
  nombre: string;
  rasgo: string;
  icono: string;
  foto: string;
}

export const EQUIPO: Companero[] = [
  { id: "ana", nombre: "Ana", rasgo: "Solo tiene su celular entre semana.", icono: "fa-mobile-screen", foto: "ana-celular" },
  { id: "beto", nombre: "Beto", rasgo: "Vive en otro pueblo y llega tarde a casa.", icono: "fa-bus", foto: "beto-pueblo" },
  { id: "carla", nombre: "Carla", rasgo: "Organizada, pero sale tarde de su turno.", icono: "fa-clipboard-check", foto: "carla-biblioteca" },
  { id: "diego", nombre: "Diego", rasgo: "Escribe de noche y cambia de horario seguido.", icono: "fa-moon", foto: "diego-noche" },
];

export interface Opcion {
  id: string;
  titulo: string;
  icono: string;
  av: number;
  co: number;
  pa: number;
  porque: string;
  ok: boolean;
}

export interface Necesidad {
  id: NecesidadId;
  dia: number;
  titulo: string;
  situacion: string;
  icono: string;
  opciones: Opcion[];
}

export const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
export const DIAS_CORTOS = ["L", "M", "X", "J", "V"];

export const NECESIDADES: Necesidad[] = [
  {
    id: "reunion",
    dia: 0,
    titulo: "Reunirse para arrancar",
    situacion: "El equipo debe acordar el tema el lunes, pero no todos pueden estar en el mismo lugar.",
    icono: "fa-people-group",
    opciones: [
      { id: "video", titulo: "Videollamada en grupo", icono: "fa-video", av: 12, co: 0, pa: 8, ok: true, porque: "Los cuatro se ven y se oyen desde donde estén: nadie queda fuera de la decisión." },
      { id: "presencial", titulo: "Reunión presencial en la escuela", icono: "fa-school", av: 4, co: 1, pa: -10, ok: false, porque: "Beto no alcanza a llegar: se pierde el arranque y se entera después." },
      { id: "individual", titulo: "Llamar a cada persona por separado", icono: "fa-phone", av: 6, co: 1, pa: -2, ok: false, porque: "Se repite lo mismo cuatro veces y cada quien entiende algo distinto." },
    ],
  },
  {
    id: "tareas",
    dia: 0,
    titulo: "Repartir quién hace qué",
    situacion: "Hay que definir roles: quién redacta, quién revisa y quién presenta.",
    icono: "fa-list-check",
    opciones: [
      { id: "tablero", titulo: "Tablero de tareas con columnas", icono: "fa-table-columns", av: 14, co: 0, pa: 6, ok: true, porque: "Por hacer, en proceso y terminado: todos ven los roles y el avance de los demás." },
      { id: "cuaderno", titulo: "Lista en el cuaderno de Carla", icono: "fa-book", av: 4, co: 2, pa: -6, ok: false, porque: "Solo Carla la ve: los demás no saben qué les toca y el trabajo se duplica." },
      { id: "palabra", titulo: "Acordarlo de palabra", icono: "fa-comment", av: 2, co: 2, pa: -2, ok: false, porque: "Empezar sin acordar quién hace cada cosa deja tareas sin dueño." },
    ],
  },
  {
    id: "escribir",
    dia: 1,
    titulo: "Escribir el informe entre los cuatro",
    situacion: "El texto se redacta el martes y los cuatro quieren aportar, a distintas horas.",
    icono: "fa-file-lines",
    opciones: [
      { id: "documento", titulo: "Documento compartido en línea", icono: "fa-file-pen", av: 16, co: 0, pa: 4, ok: true, porque: "Edición simultánea: todos escriben sobre el mismo archivo y ven los cambios al instante." },
      { id: "adjunto", titulo: "Adjuntos por correo, cada quien su copia", icono: "fa-paperclip", av: 4, co: 3, pa: 0, ok: false, porque: "Aparecen cuatro versiones distintas y nadie sabe cuál es la buena." },
      { id: "usb", titulo: "Una memoria USB que pasa de mano en mano", icono: "fa-usb", av: 2, co: 2, pa: -8, ok: false, porque: "Solo escribe quien la tiene en la mano; los demás esperan sin poder aportar." },
    ],
  },
  {
    id: "avisos",
    dia: 2,
    titulo: "Avisar cambios de último momento",
    situacion: "Diego cambia su horario y la entrega se adelanta una hora.",
    icono: "fa-bell",
    opciones: [
      { id: "chat", titulo: "Chat de grupo", icono: "fa-comments", av: 12, co: 0, pa: 6, ok: true, porque: "El aviso llega a los cuatro en el momento, cada quien desde su celular." },
      { id: "correo", titulo: "Un correo a la semana", icono: "fa-envelope", av: 2, co: 2, pa: -4, ok: false, porque: "El cambio se lee tarde: Diego y Ana llegan a la hora equivocada." },
      { id: "cartel", titulo: "Pegar un aviso en el salón", icono: "fa-thumbtack", av: 0, co: 2, pa: -6, ok: false, porque: "Beto no pasa por el salón: el aviso nunca le llega." },
    ],
  },
  {
    id: "archivos",
    dia: 3,
    titulo: "Guardar fotos, tablas y borradores",
    situacion: "Ana trabaja desde el celular y Carla desde la computadora de la biblioteca.",
    icono: "fa-folder-open",
    opciones: [
      { id: "nube", titulo: "Carpeta compartida en la nube", icono: "fa-cloud-arrow-up", av: 12, co: 0, pa: 6, ok: true, porque: "Se sincroniza entre dispositivos: Ana sigue en su celular lo que Carla dejó en la compu." },
      { id: "disco", titulo: "Disco duro de Carla", icono: "fa-hard-drive", av: 2, co: 2, pa: -6, ok: false, porque: "Ana no tiene acceso al disco y se queda sin material para su parte." },
      { id: "propio", titulo: "Cada quien en su propia computadora", icono: "fa-laptop", av: 1, co: 3, pa: -2, ok: false, porque: "Los archivos se duplican y nadie encuentra la versión más reciente." },
    ],
  },
  {
    id: "fechas",
    dia: 4,
    titulo: "No olvidar la entrega",
    situacion: "El viernes hay que entregar y exponer; los horarios de todos son distintos.",
    icono: "fa-calendar-check",
    opciones: [
      { id: "calendario", titulo: "Calendario compartido con recordatorios", icono: "fa-calendar-days", av: 14, co: 0, pa: 6, ok: true, porque: "Cada quien ve la fecha y recibe el recordatorio a su hora." },
      { id: "memoria", titulo: "Confiar en que todos se acuerden", icono: "fa-brain", av: 2, co: 2, pa: -2, ok: false, porque: "Dos olvidan la hora de la exposición y llegan tarde." },
      { id: "viernes", titulo: "Avisar el viernes por la mañana", icono: "fa-clock", av: 3, co: 1, pa: -4, ok: false, porque: "Se avisa sin tiempo para preparar nada; la entrega queda a medias." },
    ],
  },
];

export interface Decisiones {
  eleccion: Partial<Record<NecesidadId, string>>;
  permisos: Permisos;
  historial: boolean;
}

export interface EventoDia {
  necesidad: NecesidadId;
  titulo: string;
  texto: string;
  tono: "ok" | "medio" | "mal";
  av: number;
  co: number;
  pa: number;
}

export interface DiaResultado {
  dia: string;
  eventos: EventoDia[];
  avance: number;
  conflictos: number;
  participacion: number;
}

export interface Resultado {
  dias: DiaResultado[];
  avance: number;
  conflictos: number;
  participacion: number;
  decididas: number;
  meta: boolean;
}

export const META = { avance: 70, conflictos: 2, participacion: 60 };
export const PARTICIPACION_INICIO = 50;

export const PERMISOS_INFO: { id: Permisos; titulo: string; detalle: string; icono: string }[] = [
  { id: "todos", titulo: "Todos editan todo", detalle: "Los cuatro pueden cambiar cualquier párrafo.", icono: "fa-users" },
  { id: "roles", titulo: "Redactan y comentan", detalle: "Quien redacta edita; quien revisa deja comentarios.", icono: "fa-user-pen" },
  { id: "uno", titulo: "Solo una persona edita", detalle: "Los demás solo pueden ver el documento.", icono: "fa-eye" },
];

/** Efecto del permiso y del historial sobre el documento compartido. */
export function ajustesDocumento(permisos: Permisos, historial: boolean): { av: number; co: number; pa: number; texto: string } {
  let av = historial ? 2 : 0;
  let co = 0;
  let pa = 0;
  let texto = "";
  if (permisos === "roles") {
    av += 2;
    pa += 4;
    texto = "Los revisores sugieren con comentarios y nadie pisa el texto de otro.";
  } else if (permisos === "todos") {
    pa += 2;
    if (historial) {
      texto = "Dos personas editan el mismo párrafo, pero el historial de versiones recupera lo borrado.";
    } else {
      av -= 6;
      co += 3;
      texto = "Dos personas editan el mismo párrafo y se borra trabajo; sin historial no hay cómo recuperarlo.";
    }
  } else {
    av -= 4;
    pa -= 10;
    texto = "Solo escribe una persona: los otros tres miran y su aporte se queda fuera.";
  }
  if (historial && permisos !== "todos") texto += " El historial de versiones queda como respaldo.";
  return { av, co, pa, texto };
}

export function simular(d: Decisiones): Resultado {
  let avance = 0;
  let conflictos = 0;
  let participacion = PARTICIPACION_INICIO;
  let decididas = 0;
  const dias: DiaResultado[] = DIAS.map((dia) => ({ dia, eventos: [], avance: 0, conflictos: 0, participacion: 0 }));

  for (const n of NECESIDADES) {
    const op = n.opciones.find((o) => o.id === d.eleccion[n.id]);
    if (!op) continue;
    decididas += 1;
    let { av, co, pa } = op;
    let texto = op.porque;
    let tono: EventoDia["tono"] = op.ok ? "ok" : co >= 2 || av <= 4 ? "mal" : "medio";
    if (n.id === "escribir" && op.id === "documento") {
      const a = ajustesDocumento(d.permisos, d.historial);
      av += a.av;
      co += a.co;
      pa += a.pa;
      texto += " " + a.texto;
      tono = co >= 2 || av <= 12 ? "mal" : co === 0 && av >= 18 ? "ok" : "medio";
    }
    dias[n.dia]!.eventos.push({ necesidad: n.id, titulo: op.titulo, texto, tono, av, co, pa });
  }

  dias.forEach((dia) => {
    for (const e of dia.eventos) {
      avance += e.av;
      conflictos += e.co;
      participacion += e.pa;
    }
    avance = Math.max(0, Math.min(100, avance));
    participacion = Math.max(0, Math.min(100, participacion));
    dia.avance = avance;
    dia.conflictos = conflictos;
    dia.participacion = participacion;
  });

  return {
    dias,
    avance,
    conflictos,
    participacion,
    decididas,
    meta: decididas === NECESIDADES.length && avance >= META.avance && conflictos <= META.conflictos && participacion >= META.participacion,
  };
}
