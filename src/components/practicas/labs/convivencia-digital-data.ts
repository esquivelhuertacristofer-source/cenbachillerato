/**
 * Datos del laboratorio «Convivencia digital» (CD-I-P07, Cultura Digital I).
 *
 * Progresión: «Identidades y respeto en el ciberespacio».
 *
 * VERBATIM de la base de datos: el marco teórico y el dato de A1, el quiz de
 * A2, las pistas de A3, los hechos de A4, el glosario de A5, el texto con
 * huecos de A6 (en `convivencia-digital-huecos.ts`) y la pregunta de cierre de
 * A7.
 *
 * ILUSTRATIVO (escrito para esta práctica, porque la progresión no trae casos):
 * los cuatro encargos de mensajería, el perfil que se cierra, los cuatro casos
 * de convivencia y los tres mensajes que se reescriben. Ninguna persona, cuenta
 * ni escuela corresponde a alguien real; los nombres son ficticios a propósito.
 *
 * Criterios que el contenido respeta y que el laboratorio enseña explícitamente:
 *  · Lo que distingue una molestia de un acoso es la REPETICIÓN y el
 *    DESEQUILIBRIO DE PODER, no lo fuerte que suene una frase suelta.
 *  · La responsabilidad del daño es de quien agrede. Cerrar un perfil reduce lo
 *    que se puede deducir de ti; no es la causa de la agresión ni la evita.
 *  · Bloquear NO resuelve todo: deja de mostrarte el contenido, no lo borra del
 *    mundo ni impide que siga circulando.
 *  · Cuando el caso es grave, pedir ayuda a una persona adulta forma parte de
 *    la respuesta correcta, no es una opción de reserva.
 *
 * No importa three ni React: son datos puros.
 */

/* ═══════════════════════════════════════════════════════════════════════════
 * VERBATIM — lectura A1
 * ═══════════════════════════════════════════════════════════════════════════ */

import type { QuizEvaluable } from "./_reto-quiz";
import type { ParTermino } from "./_mecanica-termino";

export const MARCO: string[] = [
  "El ciberespacio es un espacio social donde conviven millones de personas con identidades, culturas, lenguas y perspectivas muy diversas. Así como en el mundo físico la diversidad es una riqueza, en el mundo digital también lo es. Sin embargo, el anonimato y la distancia que proporciona internet pueden llevar a conductas que no se permitirían cara a cara: el ciberacoso (cyberbullying), el discurso de odio, la discriminación y la violencia digital.",
  "La comunicación digital respetuosa e inclusiva implica: usar un lenguaje que no discrimine ni excluya, reconocer que detrás de cada pantalla hay una persona, no compartir contenido que humille o violente a otros, respetar las distintas maneras de identificarse (género, orientación, origen, creencia) y preguntar cuando no estamos seguros sobre algo.",
  "Las identidades en el ciberespacio son múltiples y complejas. Una persona puede tener una presencia diferente en Instagram, en un foro de videojuegos, en WhatsApp familiar y en plataformas académicas. Estas identidades digitales se construyen, no son dadas: decidimos qué mostramos, cómo nos presentamos y con quién interactuamos.",
  "La empatía digital —ponerse en el lugar del otro en entornos virtuales— es tan importante como la empatía presencial. Las palabras escritas también duelen; los silencios digitales también excluyen.",
];

/** Recuadro «importante» de A1, verbatim. */
export const DATO_A1 =
  "Según la ENDUTIH (INEGI, 2023), el 78.6% de los mexicanos de 6 años y más usa internet. Sin embargo, la brecha digital entre zonas urbanas (86.7%) y rurales (50.8%) muestra que la Cultura Digital no puede pensarse sin abordar desigualdades estructurales de acceso.";

export const FUENTE =
  "CD-I-P07 · Identidades y respeto en el ciberespacio · Cultura Digital I (material elaborado para CEN Bachillerato).";

/** Las tres pistas de la reflexión A3, verbatim. */
export const PISTAS_A3: string[] = [
  "¿Qué muestras en tus redes que no mostrarías en persona y viceversa?",
  "¿Cómo reacciones cuando alguien es agresivo contigo o con otros en línea?",
  "¿Qué aspecto de tu identidad te importa más proteger o proyectar en digital?",
];

/** Pregunta de cierre de la autoevaluación A7, verbatim. */
export const PREGUNTA_A7 = "¿Cómo actuarías si vieras a alguien sufriendo ciberacoso?";

/* ═══════════════════════════════════════════════════════════════════════════
 * MODO 1 — «La misma frase, otro efecto»
 *
 * El mismo texto cambia de sentido según DÓNDE cae, CÓMO está escrito y si
 * lleva o no el motivo. El alumno mueve los tres controles y ve el efecto; cada
 * encargo pide un efecto concreto, que no siempre es «lo más privado posible».
 * ═══════════════════════════════════════════════════════════════════════════ */

export type CanalId = "privado" | "grupo" | "publica" | "foro";
export type TonoId = "neutro" | "firme" | "mayusculas" | "burla";
export type ContextoId = "con" | "sin";

export interface CanalInfo {
  id: CanalId;
  titulo: string;
  icono: string;
  color: string;
  /** Quién lo lee. */
  audiencia: string;
  /** Cuánto dura y cómo se propaga. */
  permanencia: string;
  /** ¿Hay público delante de quien lo recibe? */
  publico: boolean;
}

export const CANALES: CanalInfo[] = [
  {
    id: "privado",
    titulo: "Mensaje directo",
    icono: "fa-user",
    color: "#5BC8FF",
    audiencia: "Una persona",
    permanencia: "Queda en el chat de los dos; cualquiera de los dos puede capturarlo.",
    publico: false,
  },
  {
    id: "grupo",
    titulo: "Grupo del salón",
    icono: "fa-users",
    color: "#A78BFA",
    audiencia: "Los 38 del grupo",
    permanencia: "Queda en el historial del grupo y lo lee quien entre después.",
    publico: true,
  },
  {
    id: "publica",
    titulo: "Publicación abierta",
    icono: "fa-globe",
    color: "#FBBF24",
    audiencia: "Cualquiera, también fuera de la escuela",
    permanencia: "Se puede capturar y reenviar aunque después lo borres.",
    publico: true,
  },
  {
    id: "foro",
    titulo: "Chat del videojuego",
    icono: "fa-gamepad",
    color: "#F472B6",
    audiencia: "Gente que no conoces",
    permanencia: "El hilo se pierde rápido, pero la captura no.",
    publico: true,
  },
];

export const TONOS: { id: TonoId; titulo: string; icono: string; nota: string }[] = [
  { id: "neutro", titulo: "Normal", icono: "fa-comment", nota: "La frase tal cual, con su saludo." },
  { id: "firme", titulo: "Firme y breve", icono: "fa-hand", nota: "Directo, sin adornos y sin insultar." },
  { id: "mayusculas", titulo: "TODO EN MAYÚSCULAS", icono: "fa-arrow-up-a-z", nota: "En la red equivale a gritar (netiqueta)." },
  { id: "burla", titulo: "Con emoji de burla", icono: "fa-face-rolling-eyes", nota: "Añade un gesto de desprecio que el texto no dice." },
];

export const CONTEXTOS: { id: ContextoId; titulo: string; icono: string; nota: string }[] = [
  { id: "con", titulo: "Con el motivo", icono: "fa-circle-info", nota: "Dice por qué escribes." },
  { id: "sin", titulo: "Solo el reclamo", icono: "fa-scissors", nota: "El otro tiene que adivinar el motivo." },
];

export interface Encargo {
  id: string;
  titulo: string;
  icono: string;
  /** La situación de la que sale el mensaje. */
  situacion: string;
  /** Lo que se le pide conseguir al alumno. */
  pide: string;
  /** Frase que explica por qué escribes (se incluye si el contexto es «con»). */
  motivo: string;
  /** Cuerpo en tono normal. */
  cuerpo: string;
  /** Cuerpo en tono firme y breve. */
  cuerpoFirme: string;
  objetivo: { canal: CanalId; tono: TonoId; contexto: ContextoId };
  /** Por qué esa combinación es la que el encargo pedía. */
  porque: string;
}

export const ENCARGOS: Encargo[] = [
  {
    id: "apuntes",
    titulo: "Los apuntes que no volvieron",
    icono: "fa-book",
    situacion:
      "Le prestaste tus apuntes a Dani el lunes y llevas tres días sin verlos. Mañana tienes examen. Quieres que te los devuelva y seguir siendo su amigo.",
    pide: "Consigue que se lea como una petición que se puede responder, sin público y explicando el motivo.",
    motivo: "Te presté mis apuntes el lunes y mañana tengo examen.",
    cuerpo: "¿Me los puedes devolver hoy, por favor?",
    cuerpoFirme: "Necesito que me los devuelvas hoy.",
    objetivo: { canal: "privado", tono: "neutro", contexto: "con" },
    porque:
      "Es un asunto entre dos: en privado, Dani puede responder sin quedar expuesto ante los 38 del grupo. Con el motivo a la vista, tu petición se entiende como lo que es —necesitas estudiar— y no como un reproche.",
  },
  {
    id: "aviso",
    titulo: "El aviso que todos necesitan",
    icono: "fa-bullhorn",
    situacion:
      "La maestra cambió la fecha de entrega del reporte y la mitad del salón no estaba. Quieres que el aviso llegue a todos y que nadie quede señalado.",
    pide: "Consigue que la información llegue a los 38 de una vez, con el motivo y sin exhibir a nadie.",
    motivo: "La maestra movió la entrega del reporte.",
    cuerpo: "Ahora se entrega el viernes a las 8 de la mañana.",
    cuerpoFirme: "Es el viernes a las 8. No hay prórroga.",
    objetivo: { canal: "grupo", tono: "neutro", contexto: "con" },
    porque:
      "Aquí lo privado no sirve: la información le hace falta a todo el grupo y repetirla 38 veces la deforma. El grupo es el canal correcto porque el mensaje habla de una tarea, no de una persona: nadie queda exhibido.",
  },
  {
    id: "limite",
    titulo: "El límite de la madrugada",
    icono: "fa-moon",
    situacion:
      "Un compañero te manda memes a las dos de la mañana y te despierta. No quieres pelear, pero tampoco quieres seguir así.",
    pide: "Consigue que se lea como un límite firme —ni agresivo ni disculpándose—, en privado y con el motivo.",
    motivo: "Los mensajes de la madrugada me despiertan.",
    cuerpo: "Si puedes, mejor mándamelos más temprano, ¿va?",
    cuerpoFirme: "No me escribas después de las diez. Mañana te contesto.",
    objetivo: { canal: "privado", tono: "firme", contexto: "con" },
    porque:
      "Un límite se pone en privado y se dice completo: qué pasa, qué pides y qué sí vas a hacer («mañana te contesto»). En tono normal la frase queda como un favor negociable; firme no significa grosero, significa claro.",
  },
  {
    id: "colecta",
    titulo: "La colecta que debe correr",
    icono: "fa-box-open",
    situacion:
      "La escuela junta cobijas para un albergue y cierra el viernes. Mientras más gente se entere, mejor: también vecinos y familiares.",
    pide: "Consigue que llegue a la mayor cantidad de gente posible, también fuera de la escuela, y con el motivo.",
    motivo: "La escuela está juntando cobijas para un albergue y cierra el viernes.",
    cuerpo: "Si puedes traer una, déjala en la entrada antes del viernes.",
    cuerpoFirme: "Trae una cobija antes del viernes. Se deja en la entrada.",
    objetivo: { canal: "publica", tono: "neutro", contexto: "con" },
    porque:
      "Lo público no es el canal malo: es el canal ancho. Cuando el mensaje no habla de nadie en particular y conviene que circule, la publicación abierta es exactamente lo que hace falta. El criterio nunca es «privado = bueno», sino a quién le sirve y a quién puede dañar.",
  },
];

/** Arma el texto que se enviaría con los controles actuales. */
export function componeMensaje(e: Encargo, tono: TonoId, contexto: ContextoId): string {
  const cuerpo = tono === "firme" ? e.cuerpoFirme : e.cuerpo;
  const base = contexto === "con" ? `${e.motivo} ${cuerpo}` : cuerpo;
  if (tono === "mayusculas") return base.toUpperCase();
  if (tono === "burla") return `Obvio, ${base.charAt(0).toLowerCase()}${base.slice(1)} 🙄`;
  return base;
}

export interface Lectura {
  titulo: string;
  detalle: string;
  /** 0 = se entiende; 3 = casi seguro que hiere. */
  riesgo: number;
}

/**
 * Cómo es PROBABLE que se lea el mensaje. Es un modelo ilustrativo y las reglas
 * están a la vista: el tono manda sobre el canal, la falta de motivo obliga al
 * otro a suponer, y el público convierte un reclamo en una exhibición.
 */
export function lecturaDe(canal: CanalId, tono: TonoId, contexto: ContextoId): Lectura {
  const info = CANALES.find((c) => c.id === canal) ?? CANALES[0]!;
  if (tono === "burla") {
    return {
      titulo: "Se lee como burla",
      detalle: info.publico
        ? "El emoji añade un desprecio que las palabras no dicen, y hay público mirando: quien lo recibe no puede responder sin quedar peor."
        : "El emoji añade un desprecio que las palabras no dicen. Aunque sea en privado, la burla cierra la conversación en vez de abrirla.",
      riesgo: 3,
    };
  }
  if (tono === "mayusculas") {
    return {
      titulo: "Se lee como grito",
      detalle: info.publico
        ? "Las mayúsculas equivalen a gritar (es la netiqueta), y aquí gritas delante de gente: el mensaje deja de ser una petición y pasa a ser una escena."
        : "Las mayúsculas equivalen a gritar. El contenido puede ser razonable, pero llega con un volumen que nadie pidió.",
      riesgo: 3,
    };
  }
  if (contexto === "sin") {
    return {
      titulo: "Se lee como ataque",
      detalle:
        "Falta el motivo, así que quien lo recibe tiene que suponerlo. Cuando hay que suponer, casi siempre se supone lo peor: que estás molesto con la persona y no con lo que pasó.",
      riesgo: 2,
    };
  }
  if (info.publico) {
    return {
      titulo: "Se entiende, pero hay público",
      detalle: `Se lee ${
        canal === "foro" ? "entre gente que no te conoce" : "delante de otras personas"
      }. Si el mensaje habla de alguien en concreto, esa persona queda expuesta y responderá defendiéndose, no resolviendo. Si habla de un asunto que a todos importa, el público es justo lo que hace falta.`,
      riesgo: 1,
    };
  }
  return {
    titulo: "Se lee como una petición que se puede responder",
    detalle:
      "Llega a la persona indicada, con el motivo por delante y sin espectadores. Es el punto donde el otro todavía puede decir «perdón, se me pasó» sin quedar mal ante nadie.",
    riesgo: 0,
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
 * MODO 2 — «Huella e identidad»
 *
 * Un perfil revela cosas que nunca escribió. El alumno decide elemento por
 * elemento, y el tablero mide DOS cosas a la vez: cuánto se puede deducir de
 * ti (exposición) y cuánto sigues estando presente para quien sí te importa
 * (presencia). Borrarlo todo baja la exposición a cero y también la presencia:
 * desaparecer no es la respuesta.
 * ═══════════════════════════════════════════════════════════════════════════ */

export interface OpcionPerfil {
  id: string;
  label: string;
  /** 0-3: cuánto se puede deducir de ti con ese elemento así. */
  exposicion: number;
  /** 0-2: cuánto sigues estando y siendo reconocible para los tuyos. */
  presencia: number;
  efecto: string;
}

export interface ElementoPerfil {
  id: string;
  titulo: string;
  detalle: string;
  icono: string;
  /** Lo que ese elemento revela sin decirlo. */
  revela: string;
  opciones: OpcionPerfil[];
}

export const PERFIL: ElementoPerfil[] = [
  {
    id: "foto",
    titulo: "Foto de perfil con el uniforme",
    detalle: "Una selfie en la entrada de la escuela, con el escudo del uniforme a la vista.",
    icono: "fa-image",
    revela: "A qué escuela vas y, con el escudo, en qué colonia está.",
    opciones: [
      { id: "tal-cual", label: "Dejarla tal cual", exposicion: 2, presencia: 2, efecto: "Cualquiera que vea tu perfil sabe dónde estudias sin preguntártelo." },
      { id: "recortada", label: "La misma foto, sin el escudo", exposicion: 0, presencia: 2, efecto: "Te sigues viendo tú: tus amigos te reconocen igual y el dato de la escuela deja de estar." },
      { id: "sin-foto", label: "Quitar la foto de perfil", exposicion: 0, presencia: 0, efecto: "Nadie deduce nada… y nadie te reconoce. Varias personas dejarán de escribirte porque no saben si eres tú." },
    ],
  },
  {
    id: "usuario",
    titulo: "Nombre de usuario: valeria_ruiz2008",
    detalle: "El usuario con el que apareces en las búsquedas.",
    icono: "fa-at",
    revela: "Tu apellido y tu año de nacimiento: con eso se arma tu edad exacta y se te busca en otras redes.",
    opciones: [
      { id: "tal-cual", label: "Dejarlo tal cual", exposicion: 2, presencia: 2, efecto: "Apellido y año quedan públicos; es la llave para encontrarte en cualquier otra plataforma." },
      { id: "alias", label: "Cambiarlo por un alias que tus amigos reconocen", exposicion: 0, presencia: 2, efecto: "«vale_dibuja» dice quién eres a quien te conoce y no regala ni apellido ni edad." },
      { id: "cuenta-nueva", label: "Cerrar la cuenta y abrir otra sin nombre", exposicion: 0, presencia: 0, efecto: "Empiezas de cero: pierdes a la gente con la que ya hablabas y el problema era solo el nombre." },
    ],
  },
  {
    id: "bio",
    titulo: "Bio: «3.º B · salgo a las 2:30»",
    detalle: "Las dos líneas que aparecen bajo tu nombre.",
    icono: "fa-id-card",
    revela: "Tu grupo y tu hora de salida: quién te busca sabe dónde y cuándo encontrarte.",
    opciones: [
      { id: "tal-cual", label: "Dejarla tal cual", exposicion: 2, presencia: 1, efecto: "Grupo y horario juntos son una cita: cualquiera puede estar ahí a esa hora." },
      { id: "quien-eres", label: "Dejar solo lo que te describe: «dibujo y juego básquet»", exposicion: 0, presencia: 2, efecto: "Dice más de ti que la anterior y no da ninguna coordenada. La bio sirve para eso." },
      { id: "vacia", label: "Dejar la bio vacía", exposicion: 0, presencia: 0, efecto: "No revelas nada, pero tampoco das a nadie una razón para acercarse." },
    ],
  },
  {
    id: "ubicacion",
    titulo: "Ubicación activada en las historias",
    detalle: "Cada historia lleva la etiqueta del lugar donde la grabaste.",
    icono: "fa-location-dot",
    revela: "Dónde estás AHORA mismo, en tiempo real, para todo el que te siga.",
    opciones: [
      { id: "tal-cual", label: "Dejarla encendida", exposicion: 3, presencia: 1, efecto: "Es el dato más delicado del perfil: no dice dónde estuviste, dice dónde estás." },
      { id: "despues", label: "Subir el lugar cuando ya te fuiste", exposicion: 1, presencia: 2, efecto: "Cuentas lo mismo —dónde fuiste, con quién— y ya no eres localizable mientras pasa." },
      { id: "apagar", label: "Apagar la ubicación", exposicion: 0, presencia: 2, efecto: "Tus historias siguen igual de tuyas: el lugar casi nunca era la parte interesante." },
    ],
  },
  {
    id: "rutina",
    titulo: "Publicas todos los días a la misma hora",
    detalle: "7:10 de la mañana, desde la misma banca del parque, de lunes a viernes.",
    icono: "fa-clock",
    revela: "Tu ruta y tu horario. No lo escribiste: se deduce de la repetición.",
    opciones: [
      { id: "tal-cual", label: "No cambiar nada", exposicion: 2, presencia: 2, efecto: "Nadie necesita leer tu bio: mirando tus últimas veinte publicaciones ya sabe por dónde pasas y a qué hora." },
      { id: "desfasar", label: "Publicar más tarde, no en el momento", exposicion: 0, presencia: 2, efecto: "La misma foto del parque, contada después: se pierde la pista y no se pierde la historia." },
      { id: "dejar", label: "Dejar de publicar por la mañana", exposicion: 0, presencia: 0, efecto: "Resuelve el rastro quitándote a ti. Callarse no es la única forma de cuidarse." },
    ],
  },
  {
    id: "contactos",
    titulo: "Tu lista de contactos es pública",
    detalle: "Cualquiera puede abrir a quién sigues y quién te sigue.",
    icono: "fa-user-group",
    revela: "Quiénes son tus amigos y tu familia: por ahí se llega a ti aunque tu perfil esté cerrado.",
    opciones: [
      { id: "tal-cual", label: "Dejarla pública", exposicion: 2, presencia: 1, efecto: "Tu red es un mapa: quien quiera presionarte sabe a quién escribirle primero." },
      { id: "solo-contactos", label: "Que solo la vean tus contactos", exposicion: 0, presencia: 1, efecto: "Tus amigos siguen encontrándose entre ellos; los de fuera ya no leen tu agenda." },
      { id: "oculta", label: "Ocultarla para todos", exposicion: 0, presencia: 0, efecto: "Se cierra del todo, y también para la gente que te buscaba por un conocido en común." },
    ],
  },
  {
    id: "comentarios",
    titulo: "Cualquiera puede comentar tus publicaciones",
    detalle: "El muro de comentarios está abierto a cuentas que no conoces.",
    icono: "fa-comments",
    revela: "Que tu espacio está abierto a que escriban encima, y eso se queda pegado a lo que publicaste.",
    opciones: [
      { id: "tal-cual", label: "Dejarlos abiertos a cualquiera", exposicion: 2, presencia: 2, efecto: "Llega gente nueva… y también quien solo quiere dejar algo feo donde más se vea." },
      { id: "solo-seguidos", label: "Que solo comente quien tú sigues", exposicion: 0, presencia: 2, efecto: "La conversación sigue viva con los tuyos y deja de ser un buzón abierto." },
      { id: "cerrados", label: "Desactivar los comentarios", exposicion: 0, presencia: 1, efecto: "Nadie escribe encima, y tampoco nadie te dice nada. Es una puerta cerrada, no una puerta con timbre." },
    ],
  },
];

export const META_EXPOSICION = 3;
export const META_PRESENCIA = 10;

export const AVISO_PERFIL =
  "Cerrar un perfil reduce lo que se puede deducir de ti. No es una garantía y NUNCA es la causa de una agresión: si alguien te acosa, la responsabilidad es de quien acosa, sin importar lo que hubieras publicado.";

/* ═══════════════════════════════════════════════════════════════════════════
 * MODO 3 — «Escalar o no escalar»
 *
 * Primero se lee la situación con tres señales (repetición, desequilibrio de
 * poder, intención de dañar). Esas tres son lo que distingue un roce de un
 * acoso. Con el nivel en la mano, se elige la respuesta PROPORCIONAL.
 * ═══════════════════════════════════════════════════════════════════════════ */

export type SenalId = "repeticion" | "desequilibrio" | "intencion";

export const SENALES: { id: SenalId; pregunta: string; explica: string; icono: string }[] = [
  {
    id: "repeticion",
    pregunta: "¿Se repite?",
    explica: "Una vez es un hecho; muchas veces es un patrón. La repetición es la primera señal que separa una molestia de un acoso.",
    icono: "fa-repeat",
  },
  {
    id: "desequilibrio",
    pregunta: "¿Hay desequilibrio de poder?",
    explica: "Más gente de un lado que del otro, más popularidad, más edad, o tener algo tuyo (una foto, tu nombre). Sin equilibrio, la persona afectada no puede defenderse sola.",
    icono: "fa-scale-unbalanced",
  },
  {
    id: "intencion",
    pregunta: "¿Hay intención de dañar?",
    explica: "A veces sí y a veces no: se puede hacer mucho daño sin querer. Que no haya intención no borra el daño, pero sí cambia la respuesta que corresponde.",
    icono: "fa-bullseye",
  },
];

export type NivelId = "molestia" | "conflicto" | "acoso";

export const NIVELES: Record<NivelId, { titulo: string; color: string; icono: string; descripcion: string }> = {
  molestia: {
    titulo: "Una molestia",
    color: "#34D399",
    icono: "fa-face-meh",
    descripcion: "Pasó una vez, entre iguales y sin querer hacer daño. Se resuelve hablando; reportar o bloquear aquí sería desproporcionado.",
  },
  conflicto: {
    titulo: "Un conflicto que puede escalar",
    color: "#FBBF24",
    icono: "fa-triangle-exclamation",
    descripcion: "Ya se repite o ya hay desventaja de un lado. Todavía no es acoso, pero si nadie hace nada suele convertirse en uno: toca documentar y frenarlo.",
  },
  acoso: {
    titulo: "Ciberacoso",
    color: "#FF5E5E",
    icono: "fa-circle-exclamation",
    descripcion: "Se repite, hay desequilibrio de poder y hay intención de dañar. Aquí la persona afectada no puede —ni tiene por qué— resolverlo sola: pedir ayuda a una persona adulta forma parte de la respuesta correcta.",
  },
};

/** El nivel sale de las tres señales, y la regla está a la vista del alumno. */
export function nivelPor(senales: boolean[]): NivelId {
  const si = senales.filter(Boolean).length;
  if (si >= 3) return "acoso";
  if (si === 2) return "conflicto";
  return "molestia";
}

export interface AccionCat {
  id: string;
  label: string;
  icono: string;
}

export const ACCIONES: AccionCat[] = [
  { id: "privado", label: "Hablarlo en privado con esa persona", icono: "fa-comment" },
  { id: "no-responder", label: "No responder ahora", icono: "fa-hand" },
  { id: "evidencia", label: "Guardar evidencia: capturas con fecha y enlace", icono: "fa-camera" },
  { id: "bloquear", label: "Bloquear o silenciar la cuenta", icono: "fa-ban" },
  { id: "reportar", label: "Reportar el contenido a la plataforma", icono: "fa-flag" },
  { id: "adulto", label: "Pedir ayuda a una persona adulta de confianza", icono: "fa-user-shield" },
  { id: "escuela", label: "Avisar a la escuela (tutoría u orientación)", icono: "fa-school" },
  { id: "avisar-contactos", label: "Avisar a tus contactos de que esa cuenta no es tuya", icono: "fa-tower-broadcast" },
  { id: "mismo-tono", label: "Responder en público con el mismo tono", icono: "fa-fire" },
  { id: "reenviar", label: "Reenviarlo a otros para que vean lo que te hicieron", icono: "fa-share" },
];

export interface CasoEscala {
  id: string;
  titulo: string;
  icono: string;
  relato: string;
  senales: Record<SenalId, boolean>;
  porqueSenal: Record<SenalId, string>;
  nivel: NivelId;
  /** La idea que el caso deja, después de acertar. */
  nota: string;
  correctas: string[];
  porque: Record<string, string>;
}

export const CASOS: CasoEscala[] = [
  {
    id: "broma",
    titulo: "La broma que hirió",
    icono: "fa-face-laugh",
    relato:
      "En el grupo del salón, tu amigo Beto publicó una foto tuya del festival con el pie «miren al bailarín». Todos reaccionaron con risas. A ti te dio vergüenza. Beto no lo había hecho antes y, cuando entraste al chat, seguía mandando memes como si nada.",
    senales: { repeticion: false, desequilibrio: false, intencion: false },
    porqueSenal: {
      repeticion: "Es la primera vez. No hay patrón: hay un hecho.",
      desequilibrio: "Son amigos, del mismo salón y del mismo grupo. Ninguno tiene poder sobre el otro.",
      intencion: "Beto buscaba una risa, no lastimarte. Eso no borra que te hirió: el daño es real aunque no fuera el objetivo.",
    },
    nivel: "molestia",
    nota: "Que te haya dolido no convierte esto en acoso, y que no sea acoso no significa que tengas que aguantarlo. Decirlo es exactamente lo que corresponde.",
    correctas: ["privado"],
    porque: {
      privado: "Sí. Beto no sabe que te hirió. Díselo en privado y pídele que lo borre: es la única acción que cambia algo aquí.",
      "no-responder": "No hace falta callarse. Callar ante un amigo que no se dio cuenta deja el malestar dentro y la foto fuera.",
      evidencia: "Guardar pruebas contra un amigo por una broma única es tratar un roce como un caso. Todavía no hay nada que probar.",
      bloquear: "Bloquear a un amigo por una broma sin intención rompe la relación en vez de arreglar el problema.",
      reportar: "La plataforma no va a retirar una foto de un festival con un pie de foto tonto, y tú ya tienes la vía directa: hablarle.",
      adulto: "No hace falta todavía. Reservar la ayuda de un adulto para lo que no puedes resolver solo no es orgullo: es proporción.",
      escuela: "Llevar a tutoría una broma que aún no has hablado con quien la hizo desproporciona el asunto.",
      "avisar-contactos": "Nadie está suplantando tu identidad: no hay nada que avisar.",
      "mismo-tono": "Nunca. Responder con otra burla delante del grupo convierte un malentendido en una pelea con público.",
      reenviar: "Nunca. Reenviar la foto la hace circular más, justo lo contrario de lo que quieres.",
    },
  },
  {
    id: "rumor",
    titulo: "El rumor que se reenvía",
    icono: "fa-comment-dots",
    relato:
      "Desde el lunes circula un audio que dice que copiaste en el examen. No es cierto. Empezó en un grupo, ya va en tres y hoy te escribieron dos personas de otro salón preguntándote si es verdad. Casi nadie lo reenvía para hacerte daño: lo reenvían porque les llegó.",
    senales: { repeticion: true, desequilibrio: true, intencion: false },
    porqueSenal: {
      repeticion: "Lleva cuatro días y va en tres grupos. Cada reenvío es una repetición más.",
      desequilibrio: "Son muchos contra una persona. Tú no puedes llegar a todos los grupos donde ya se habla de ti: esa es la desventaja.",
      intencion: "La mayoría lo reenvía sin pensar. Que no haya intención no quita el daño, pero sí explica por qué pedirles que paren suele funcionar.",
    },
    nivel: "conflicto",
    nota: "Dos señales de tres: todavía no es acoso, pero va camino de serlo. Este es el momento en que actuar cuesta poco; si esperas a la tercera señal, cuesta mucho más.",
    correctas: ["privado", "no-responder", "evidencia", "adulto"],
    porque: {
      privado: "Sí. Escríbele en privado a quien te lo reenvió: «esto no es cierto, te pido que no lo pases». Cortar la cadena persona por persona es lo que de verdad la frena.",
      "no-responder": "Sí, en público. Contestar el rumor en el grupo lo pone frente a más gente y lo mantiene vivo un día más.",
      evidencia: "Sí. Guarda el audio, la fecha y en qué grupo apareció. Si esto sigue, esa captura es lo único que sostiene tu versión.",
      bloquear: "Bloquear a quien reenvía no detiene el audio: sigue circulando en grupos donde tú ya ni lo ves. Bloquear te tapa los ojos, no apaga el rumor.",
      reportar: "La plataforma difícilmente retira un audio entre conocidos: no infringe sus reglas aunque sea falso. Reportar aquí gasta el esfuerzo sin resultado.",
      adulto: "Sí. Un rumor que ya cruzó de salón necesita a alguien con alcance que tú no tienes. Contárselo a una persona adulta no es acusar: es no cargarlo solo.",
      escuela: "Razonable si sigue después de hablarlo, pero primero hay pasos más directos que todavía no diste.",
      "avisar-contactos": "Nadie está usando tu nombre ni tu cuenta: aquí no aplica.",
      "mismo-tono": "Nunca. Inventar algo de quien empezó el rumor te pone en el mismo lugar y borra la razón que tenías.",
      reenviar: "Nunca. Reenviarlo «para que vean» es reenviarlo: lo estarías propagando tú.",
    },
  },
  {
    id: "hostigamiento",
    titulo: "El hostigamiento que no para",
    icono: "fa-skull",
    relato:
      "Desde hace tres semanas recibes insultos diarios. Vienen de cuentas distintas, pero todas repiten los mismos apodos que usa un compañero del salón, el que mueve al grupo. Cuando bloqueas una cuenta, al día siguiente aparece otra. Ya no quieres abrir el teléfono.",
    senales: { repeticion: true, desequilibrio: true, intencion: true },
    porqueSenal: {
      repeticion: "Tres semanas, todos los días. Es el ejemplo de patrón.",
      desequilibrio: "Él mueve al grupo y tú no; además usa varias cuentas contra una sola. No es una discusión entre iguales.",
      intencion: "Abrir cuentas nuevas cada vez que lo bloqueas solo se hace a propósito. Aquí la intención es evidente.",
    },
    nivel: "acoso",
    nota: "Tres de tres: esto es ciberacoso y no es tu trabajo aguantarlo. Bloquear sirve —deja de llegarte— pero no lo resuelve: el que agrede sigue ahí y sigue teniendo cuentas. Por eso la respuesta incluye a alguien más.",
    correctas: ["no-responder", "evidencia", "bloquear", "reportar", "adulto", "escuela"],
    porque: {
      privado: "No. Con hostigamiento sostenido y desequilibrio de poder, buscarlo en privado te expone más: le confirma que funciona y te deja sin testigos.",
      "no-responder": "Sí. No responder no es rendirse: es no darle el material que busca. Tu respuesta se dirige a la plataforma y a los adultos, no a él.",
      evidencia: "Sí, y antes que nada. Capturas con fecha, nombre de las cuentas y enlaces. Sin evidencia, la escuela y la plataforma solo tienen tu palabra contra la suya.",
      bloquear: "Sí, pero sabiendo qué hace: deja de mostrártelo. No borra las cuentas ni impide que abra otra, y por eso NO basta por sí solo.",
      reportar: "Sí. Los insultos repetidos sí infringen las reglas de las plataformas. Reporta cada cuenta: cada reporte deja registro.",
      adulto: "Sí, y no es opcional. Tres semanas de insultos diarios es algo que ningún estudiante tiene que sostener solo. Una persona adulta de confianza puede acompañarte con la escuela y, si hace falta, ante las autoridades.",
      escuela: "Sí. Viene de un compañero del salón, así que la escuela tiene tanto la responsabilidad como la forma de intervenir. Lleva las capturas.",
      "avisar-contactos": "Nadie se hace pasar por ti: aquí no aplica.",
      "mismo-tono": "Nunca, y aquí menos: con público y desequilibrio, responder igual le da la escena que quería y te deja a ti como parte de la pelea.",
      reenviar: "Nunca. Reenviar los insultos los hace circular y los pone delante de gente que no los había visto.",
    },
  },
  {
    id: "suplantacion",
    titulo: "La cuenta que no es tuya",
    icono: "fa-user-secret",
    relato:
      "Apareció una cuenta con tu nombre, tu foto de perfil y tus fotos del año pasado. Desde ayer le escribe cosas groseras a compañeros tuyos, que creen que eres tú. Ya son once personas siguiéndola y dos te reclamaron por algo que nunca escribiste.",
    senales: { repeticion: true, desequilibrio: true, intencion: true },
    porqueSenal: {
      repeticion: "La cuenta sigue publicando: cada mensaje enviado a tu nombre es una vez más.",
      desequilibrio: "Quien la controla tiene tu identidad y tú no tienes acceso a ella. Es el desequilibrio más claro que hay: habla por ti.",
      intencion: "Copiar tu nombre y tu foto para escribir groserías a tus compañeros no es un descuido.",
    },
    nivel: "acoso",
    nota: "La suplantación de identidad no es una travesura: hace daño a tu nombre y a las personas que reciben esos mensajes. Aquí bloquear es casi inútil —la cuenta seguiría escribiéndoles a los demás aunque tú dejaras de verla— y avisar a los tuyos es urgente.",
    correctas: ["evidencia", "reportar", "adulto", "escuela", "avisar-contactos"],
    porque: {
      privado: "No hay con quién hablar: no sabes quién está detrás, y escribirle a la cuenta le confirma que te alcanzó.",
      "no-responder": "No basta con callar: mientras tú no haces nada, la cuenta sigue hablando a tu nombre. Aquí hay que actuar, no esperar.",
      evidencia: "Sí. Captura el perfil falso, su dirección y los mensajes que envía. Es lo primero, porque esa cuenta puede desaparecer de un día para otro.",
      bloquear: "Bloquearla solo hace que tú dejes de verla. Le seguiría escribiendo a tus compañeros exactamente igual: es el ejemplo perfecto de que bloquear no resuelve todo.",
      reportar: "Sí. Suplantar la identidad de alguien está prohibido en todas las plataformas grandes y es de los motivos que sí llevan a cerrar una cuenta.",
      adulto: "Sí. Usar el nombre y la imagen de otra persona puede constituir un delito; en México existen unidades de policía cibernética que reciben estos reportes, y una persona adulta debe acompañarte a hacerlo.",
      escuela: "Sí. Los afectados son compañeros tuyos y los mensajes circulan en la escuela: avisar evita que más gente crea que eres tú.",
      "avisar-contactos": "Sí, y cuanto antes. Un mensaje tuyo diciendo «esa cuenta no es mía» corta el daño de golpe: los once que la siguen dejan de creerle.",
      "mismo-tono": "Nunca. Además, aquí ni siquiera sabes a quién le estarías respondiendo.",
      reenviar: "Nunca. Reenviar lo que escribió la cuenta falsa reparte su contenido y confunde todavía más a quien lo reciba.",
    },
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * MODO 4 — «Reescribe para desescalar»
 *
 * Firme no es agresivo ni sumiso. Cada mensaje hostil se rehace por movimientos
 * y en cada uno hay tres salidas: atacar a la persona, ceder lo que no había que
 * ceder, o decir el hecho, el efecto y lo que pides.
 * ═══════════════════════════════════════════════════════════════════════════ */

export type TipoResp = "agresiva" | "sumisa" | "firme";

export const TIPO_RESP: Record<TipoResp, { titulo: string; color: string; icono: string; descripcion: string }> = {
  agresiva: {
    titulo: "Agresiva",
    color: "#FF5E5E",
    icono: "fa-fire",
    descripcion: "Ataca a la persona en vez de hablar del hecho. Gana la frase y pierde la conversación.",
  },
  sumisa: {
    titulo: "Sumisa",
    color: "#A78BFA",
    icono: "fa-face-frown",
    descripcion: "Se disculpa por molestar y retira lo que pedía. Evita el conflicto de hoy y lo repite mañana.",
  },
  firme: {
    titulo: "Firme",
    color: "#34D399",
    icono: "fa-hand",
    descripcion: "Dice el hecho, el efecto y lo que pides, sin insultar y sin retirarse.",
  },
};

export interface OpcionMov {
  id: string;
  texto: string;
  tipo: TipoResp;
  porque: string;
}

export interface Movimiento {
  id: string;
  pide: string;
  opciones: OpcionMov[];
}

export interface MensajeHostil {
  id: string;
  titulo: string;
  icono: string;
  contexto: string;
  hostil: string;
  movimientos: Movimiento[];
  cierre: string;
}

export const REESCRITURAS: MensajeHostil[] = [
  {
    id: "equipo",
    titulo: "El equipo que no entrega",
    icono: "fa-people-group",
    contexto: "Faltan dos días para entregar el trabajo en equipo y tres de las cuatro partes siguen en blanco. Escribiste esto y no lo has enviado.",
    hostil: "Ya me tienen harto, son unos inútiles. Nadie hace nada y por su culpa voy a reprobar.",
    movimientos: [
      {
        id: "abrir",
        pide: "Abre el mensaje sin declarar la guerra.",
        opciones: [
          { id: "a", texto: "Ya me tienen harto.", tipo: "agresiva", porque: "Empieza hablando de tu enojo, no del trabajo. Quien lo lea se defiende antes de llegar al asunto." },
          { id: "b", texto: "Perdón por molestar, seguro es cosa mía.", tipo: "sumisa", porque: "Pides perdón por reclamar algo que sí toca reclamar. El equipo entiende que no pasa nada." },
          { id: "c", texto: "Necesito que hablemos del trabajo antes del viernes.", tipo: "firme", porque: "Nombra el tema y el plazo en una línea. Nadie se siente atacado y todos saben de qué va." },
        ],
      },
      {
        id: "hecho",
        pide: "Di el hecho, no lo que las personas son.",
        opciones: [
          { id: "a", texto: "De las cuatro partes, tres siguen sin entregarse.", tipo: "firme", porque: "Un dato comprobable. Contra un dato no se discute: se responde." },
          { id: "b", texto: "Son unos inútiles, nunca hacen nada.", tipo: "agresiva", porque: "Califica a las personas. Aunque tuvieras razón en el fondo, la frase convierte el tema en una ofensa." },
          { id: "c", texto: "Bueno, igual tampoco es tan urgente.", tipo: "sumisa", porque: "Quita importancia a algo que sí la tiene. Con eso el plazo llega igual y nadie se movió." },
        ],
      },
      {
        id: "efecto",
        pide: "Explica el efecto sin culpar a nadie de tu futuro.",
        opciones: [
          { id: "a", texto: "Por su culpa voy a reprobar.", tipo: "agresiva", porque: "Convierte el reclamo en una acusación. La respuesta previsible es «no es mi culpa», y ahí se acabó la conversación." },
          { id: "b", texto: "Si llegamos así al viernes, entregamos incompleto y eso nos baja a todos.", tipo: "firme", porque: "Describe la consecuencia y la pone en plural, que es donde está: es un trabajo en equipo." },
          { id: "c", texto: "No importa, yo lo termino solo.", tipo: "sumisa", porque: "Resuelve el viernes y garantiza que la próxima vez vuelva a pasar, porque nadie tuvo que responder." },
        ],
      },
      {
        id: "pide",
        pide: "Pide algo concreto que se pueda contestar.",
        opciones: [
          { id: "a", texto: "Pónganse a trabajar ya.", tipo: "agresiva", porque: "Es una orden sin contenido: nadie sabe qué tiene que hacer ni para cuándo." },
          { id: "b", texto: "¿Pueden decirme hoy antes de las 8 quién toma cada parte?", tipo: "firme", porque: "Pregunta concreta, con hora. Se puede responder con un mensaje y deja ver quién sí y quién no." },
          { id: "c", texto: "Si pueden, y si no, pues ya veremos.", tipo: "sumisa", porque: "Deja la puerta abierta a que no pase nada. Una petición sin fecha es una intención." },
        ],
      },
    ],
    cierre: "El mensaje firme es MÁS incómodo para el equipo que el agresivo, porque no se puede contestar con un insulto: hay que contestar con nombres y una hora.",
  },
  {
    id: "burla",
    titulo: "El comentario en tu foto",
    icono: "fa-camera",
    contexto: "Alguien del salón comentó tu foto con una burla sobre cómo te ves. Te dieron ganas de contestar esto.",
    hostil: "Mira quién habla, con esa cara. Das asco.",
    movimientos: [
      {
        id: "limite",
        pide: "Pon el límite sin devolver el golpe.",
        opciones: [
          { id: "a", texto: "Mira quién habla, con esa cara.", tipo: "agresiva", porque: "Contesta con lo mismo. A partir de aquí la conversación ya no es sobre lo que te hizo, es sobre quién pega más fuerte." },
          { id: "b", texto: "Jaja, no pasa nada.", tipo: "sumisa", porque: "Dices que está bien algo que no lo está. Quien lo escribió entiende que puede repetirlo." },
          { id: "c", texto: "No me gustó ese comentario. No lo vuelvas a hacer.", tipo: "firme", porque: "Dos frases cortas: qué sentiste y qué pides. No hay nada que rebatir ahí." },
        ],
      },
      {
        id: "hecho",
        pide: "Habla del comentario, no de la persona.",
        opciones: [
          { id: "a", texto: "El comentario sobre mi foto estuvo de más.", tipo: "firme", porque: "Señala la conducta. Una conducta se puede cambiar; una persona insultada solo se defiende." },
          { id: "b", texto: "Eres un idiota y todos lo saben.", tipo: "agresiva", porque: "Ataca a la persona y suma a «todos». Es exactamente lo que te hicieron a ti." },
          { id: "c", texto: "Igual y sí me veo mal en esa foto.", tipo: "sumisa", porque: "Le das la razón a la burla. El problema no era tu foto: era el comentario." },
        ],
      },
      {
        id: "canal",
        pide: "Decide dónde se lo dices.",
        opciones: [
          { id: "a", texto: "Lo voy a subir al grupo para que todos vean lo que escribiste.", tipo: "agresiva", porque: "Buscar público convierte tu límite en una venganza, y la conversación pasa a tener espectadores que la van a alargar." },
          { id: "b", texto: "Te lo digo por aquí, en privado, para no hacerlo público.", tipo: "firme", porque: "Dejas claro que podrías haberlo hecho público y eliges no hacerlo. Eso es firmeza, no debilidad." },
          { id: "c", texto: "Bueno, ya, olvídalo.", tipo: "sumisa", porque: "Retiras lo que acabas de decir. El mensaje completo se anula con esa última línea." },
        ],
      },
    ],
    cierre: "Firme no significa frío ni cortante: significa que después de leerte se sabe qué pasó, qué te molestó y qué pides. Nada más, y nada menos.",
  },
  {
    id: "rumor",
    titulo: "A quien reenvía el rumor",
    icono: "fa-comment-slash",
    contexto: "Una compañera te reenvió el audio que asegura que copiaste en el examen. No lo empezó ella, pero lo pasó. Quieres que la cadena se corte en ella.",
    hostil: "¿Neta lo pasaste? Eres igual de chismosa que los demás, no vuelvas a escribirme.",
    movimientos: [
      {
        id: "hecho",
        pide: "Empieza por el hecho, en una línea.",
        opciones: [
          { id: "a", texto: "Lo que estás reenviando sobre mí no es cierto.", tipo: "firme", porque: "Primero el hecho. Lo demás solo tiene sentido si ella ya sabe que el audio es falso." },
          { id: "b", texto: "Eres igual de chismosa que los demás.", tipo: "agresiva", porque: "La etiquetas antes de decirle lo importante, y con eso pierdes a la única persona que podía cortar la cadena." },
          { id: "c", texto: "Oye, no sé, igual sí se malinterpretó algo…", tipo: "sumisa", porque: "Dejas la duda abierta sobre ti misma. Si tú no afirmas que es falso, nadie más lo va a hacer." },
        ],
      },
      {
        id: "pide",
        pide: "Pide exactamente lo que necesitas.",
        opciones: [
          { id: "a", texto: "No lo reenvíes y bórralo del chat donde lo pasaste.", tipo: "firme", porque: "Dos acciones concretas, las dos posibles hoy. Ahí sí puede ayudarte." },
          { id: "b", texto: "Haz lo que quieras, total, ya todos lo vieron.", tipo: "sumisa", porque: "Renuncias a lo único que cambiaría algo. Que ya circule no significa que no se pueda frenar." },
          { id: "c", texto: "Si lo vuelves a pasar, te va a ir mal.", tipo: "agresiva", porque: "Es una amenaza. Además de que no debes hacerla, te pone a ti en el lugar de quien agrede." },
        ],
      },
      {
        id: "cierre",
        pide: "Cierra dejando claro qué vas a hacer tú.",
        opciones: [
          { id: "a", texto: "Voy a guardar capturas y, si sigue, lo hablo con la tutora.", tipo: "firme", porque: "No es una amenaza: es lo que vas a hacer de todos modos, dicho de frente. Y avisa de que esto ya no se queda entre dos." },
          { id: "b", texto: "Te voy a acusar con todos para que vean quién eres.", tipo: "agresiva", porque: "Convierte tu defensa en un ataque con público, que es la misma mecánica del rumor que te hizo daño." },
          { id: "c", texto: "En fin, ya qué. Perdón por escribirte.", tipo: "sumisa", porque: "Pides perdón por defenderte. Después de leer eso, nadie borra nada." },
        ],
      },
    ],
    cierre: "Anunciar que vas a documentar y a pedir ayuda no es amenazar: es informar. La diferencia está en que amenazas con dañar a alguien y aquí solo dices qué vas a hacer para protegerte.",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * VERBATIM — evaluables
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Quiz de CD-I-P07-A2, verbatim (enunciados, opciones, orden y retroalimentación). */
export const QUIZ: QuizEvaluable = {
  titulo: "Comunicación digital respetuosa",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "¿Qué es el ciberacoso (cyberbullying)?",
      opciones: [
        "Publicar memes de humor sin identificar al autor",
        "Acoso, intimidación o agresión repetida hacia una persona a través de medios digitales",
        "Tener muchos seguidores en redes sociales",
        "Discutir en los comentarios de una publicación",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "El ciberacoso es acoso sistemático y repetido a través de plataformas digitales, y puede tener consecuencias graves.",
    },
    {
      enunciado: "¿Qué caracteriza a la comunicación digital respetuosa?",
      opciones: [
        "Usar mayúsculas para enfatizar todos los mensajes importantes",
        "Reconocer que detrás de cada pantalla hay una persona y usar lenguaje inclusivo",
        "Responder siempre inmediatamente para no dejar en visto",
        "Agregar a todas las personas posibles a tus grupos de chat",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "La comunicación digital respetuosa parte de reconocer la humanidad del interlocutor y usar lenguaje que no discrimine.",
    },
    {
      enunciado: "¿Por qué el anonimato en internet puede facilitar conductas negativas?",
      opciones: [
        "Porque las personas se vuelven más inteligentes en línea",
        "Porque la distancia y el anonimato reducen la sensación de consecuencias por las acciones",
        "Porque internet tiene menos normas que el mundo real",
        "Porque los algoritmos recompensan el comportamiento agresivo",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "El anonimato reduce el sentido de responsabilidad y las consecuencias percibidas, facilitando conductas que no ocurrirían cara a cara.",
    },
    {
      enunciado: "¿Qué significa que las identidades digitales 'se construyen'?",
      opciones: [
        "Que son completamente falsas",
        "Que decidimos conscientemente qué mostramos, cómo nos presentamos y con quién interactuamos",
        "Que solo existen en las redes sociales",
        "Que no reflejan nuestra personalidad real",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "Las identidades digitales son activamente construidas: elegimos qué compartir, cómo presentarnos y cuáles aspectos de nosotros mostrar.",
    },
    {
      enunciado: "¿Qué es la empatía digital?",
      opciones: [
        "Compartir mucho contenido de otros para apoyarlos",
        "Ponerse en el lugar del otro en entornos virtuales y reconocer el impacto de las palabras digitales",
        "Tener muchos seguidores en redes",
        "Responder a todos los comentarios que te hacen",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "La empatía digital es reconocer que las personas detrás de las pantallas sienten, y que las palabras escritas también tienen impacto.",
    },
  ],
};

/** Verdadero/falso de CD-I-P07-A4, verbatim. */
export const HECHOS: { enunciado: string; verdadero: boolean; retro: string }[] = [
  {
    enunciado: "En el ciberespacio conviven personas con identidades, culturas y opiniones muy diversas.",
    verdadero: true,
    retro: "Correcto: la diversidad es parte de la vida en línea.",
  },
  {
    enunciado: "La comunicación digital respetuosa incluye no agredir ni discriminar a otras personas.",
    verdadero: true,
    retro: "Correcto: el respeto también aplica en línea.",
  },
  {
    enunciado: "El ciberacoso es inofensivo y no tiene consecuencias reales.",
    verdadero: false,
    retro: "El ciberacoso causa daño real y puede tener consecuencias legales.",
  },
  {
    enunciado: "Un lenguaje inclusivo ayuda a que más personas se sientan representadas y respetadas.",
    verdadero: true,
    retro: "Correcto: favorece una convivencia sana.",
  },
];

/** Glosario de CD-I-P07-A5, verbatim (los mismos pares que relaciona A9). */
export const PARES: ParTermino[] = [
  {
    id: "diversidad",
    termino: "Diversidad digital",
    definicion: "Presencia de personas con distintas identidades, culturas y formas de pensar en el ciberespacio.",
    ejemplo: "Comunidades en línea de todo el mundo.",
  },
  {
    id: "inclusiva",
    termino: "Comunicación inclusiva",
    definicion: "Forma de comunicarse que respeta y representa a todas las personas.",
    ejemplo: "Evitar expresiones discriminatorias.",
  },
  {
    id: "ciberacoso",
    termino: "Ciberacoso",
    definicion: "Acoso u hostigamiento hacia una persona mediante medios digitales.",
    ejemplo: "Mensajes ofensivos o difundir rumores en redes.",
  },
  {
    id: "netiqueta",
    termino: "Netiqueta",
    definicion: "Conjunto de normas de buena conducta y respeto en la comunicación digital.",
    ejemplo: "No escribir todo en mayúsculas (equivale a gritar).",
  },
];

/** La tarea de cierre del glosario A5, verbatim. */
export const TAREA_A5 = "Propón tres reglas de convivencia para un grupo de chat de tu salón.";
