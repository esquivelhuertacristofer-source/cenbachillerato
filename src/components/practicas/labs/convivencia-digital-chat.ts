/**
 * Simulador «El grupo del salón» (CD-I-P07). Todo es ILUSTRATIVO y FICTICIO:
 * personas, grupo y cifras son una simulación, no una medida real.
 *
 * Cada escena trae mensajes que ya están en el chat y cuatro respuestas. Cada
 * respuesta mueve dos medidores: el CLIMA del grupo (0-100) y el ALCANCE del
 * contenido dañino (cuántos de los 38 lo vieron), y hace que el chat conteste.
 */

export interface MsgChat {
  quien: string;
  texto: string;
  hora: string;
  /** clave de /media/labs-sim/convivencia-digital/<clave>.webp */
  foto?: string;
  /** Línea de sistema (alguien entró, salió, borró). */
  sistema?: boolean;
}

export interface OpcionChat {
  id: string;
  label: string;
  icono: string;
  /** Lo que envías (se ve en el chat o en un privado). */
  envio: string;
  /** Si es un mensaje privado: a quién. */
  privadoA?: string;
  clima: number;
  alcance: number;
  respuesta: MsgChat[];
  porque: string;
}

export interface EscenaChat {
  id: string;
  titulo: string;
  /** Cuánta gente ya vio el contenido cuando empieza la escena. */
  alcanceBase: number;
  entrada: MsgChat[];
  opciones: OpcionChat[];
}

export const CLIMA_INICIAL = 60;
export const GRUPO_TOTAL = 38;
export const META_CLIMA = 85;
export const META_ALCANCE = 15;
export const NOMBRE_GRUPO = "3.º B · Los de siempre";

export const COLOR_PERSONA: Record<string, string> = {
  Beto: "#F59E0B",
  Mauri: "#38BDF8",
  Ana: "#F472B6",
  Dani: "#A78BFA",
  Lupita: "#34D399",
  "Cuenta @v4le_real": "#FF5E5E",
  Tutora: "#5EEAD4",
  Tú: "#E5E7EB",
};

export const ESCENAS_CHAT: EscenaChat[] = [
  {
    id: "foto",
    titulo: "La foto del festival",
    alcanceBase: 20,
    entrada: [
      { quien: "Beto", texto: "miren al bailarín jajaja", hora: "7:41", foto: "festival-baile" },
      { quien: "Lupita", texto: "JAJAJA 😂😂", hora: "7:41" },
      { quien: "Dani", texto: "ya es sticker", hora: "7:42" },
      { quien: "Mauri", texto: "…", hora: "7:43" },
    ],
    opciones: [
      {
        id: "reir",
        label: "Reaccionar con 😂 para no quedar mal",
        icono: "fa-face-laugh-squint",
        envio: "😂",
        clima: -10,
        alcance: 10,
        respuesta: [
          { quien: "Dani", texto: "mandaré el sticker a otros grupos", hora: "7:44" },
          { quien: "Mauri", texto: "salió del grupo", hora: "7:45", sistema: true },
        ],
        porque:
          "Cada reacción le da más vida a la foto: ahora la ven más personas y Mauri se va. Reír «para no quedar mal» también cuenta como participar.",
      },
      {
        id: "publico",
        label: "Escribir en el grupo: «Qué crueles son todos»",
        icono: "fa-bullhorn",
        envio: "Qué crueles son todos.",
        clima: -3,
        alcance: 6,
        respuesta: [
          { quien: "Beto", texto: "uy ya, era broma, no la hagan de tos", hora: "7:44" },
          { quien: "Lupita", texto: "jaja la mamá del grupo", hora: "7:44" },
        ],
        porque:
          "Tu intención es buena, pero la discusión en público mantiene la foto a la vista y pone a Beto a defenderse en vez de reflexionar.",
      },
      {
        id: "privado-beto",
        label: "Escribirle a Beto en privado: «Borra la foto, a Mauri le dio pena»",
        icono: "fa-comment",
        envio: "Beto, borra la foto, a Mauri le dio pena. Te lo digo aquí para no hacerlo público.",
        privadoA: "Beto",
        clima: 10,
        alcance: -20,
        respuesta: [
          { quien: "Beto", texto: "uf, no pensé que le diera pena. ya la borro", hora: "7:46" },
          { quien: "Beto", texto: "eliminó la foto", hora: "7:47", sistema: true },
        ],
        porque:
          "Beto no sabía que había herido a Mauri. En privado puede decir «se me pasó» sin quedar expuesto, y la foto desaparece del grupo.",
      },
      {
        id: "apoyo",
        label: "Escribirle a Mauri en privado para apoyarlo",
        icono: "fa-heart",
        envio: "Mauri, no estás solo, a mí no me dio risa. ¿Quieres que le diga algo a Beto?",
        privadoA: "Mauri",
        clima: 4,
        alcance: 0,
        respuesta: [
          { quien: "Mauri", texto: "gracias… sí me cayó mal. la foto sigue ahí", hora: "7:46" },
        ],
        porque:
          "Acompañar ayuda, pero la foto sigue circulando: quien la subió todavía no sabe nada. Apoyo y petición juntos funcionan mejor.",
      },
    ],
  },
  {
    id: "rumor",
    titulo: "El audio que circula",
    alcanceBase: 12,
    entrada: [
      { quien: "Ana", texto: "Pásenlo, dice que Mauri copió en el examen 👀", hora: "10:12" },
      { quien: "Ana", texto: "envió un audio reenviado (0:23)", hora: "10:12", sistema: true },
      { quien: "Dani", texto: "ay no manches", hora: "10:13" },
    ],
    opciones: [
      {
        id: "reenviar",
        label: "Reenviarlo a tu otro grupo: «¿ya vieron esto?»",
        icono: "fa-share",
        envio: "¿Ya vieron esto?",
        clima: -12,
        alcance: 14,
        respuesta: [
          { quien: "Lupita", texto: "ya me llegó de tres lados", hora: "10:15" },
          { quien: "Mauri", texto: "¿en serio lo están pasando?", hora: "10:16" },
        ],
        porque:
          "Reenviar es propagar, aunque lo hagas «para que vean». Cada reenvío es una repetición más y tú pasas a ser parte de la cadena.",
      },
      {
        id: "nada",
        label: "No hacer nada y esperar que se pase",
        icono: "fa-hourglass-half",
        envio: "(no respondes)",
        clima: -4,
        alcance: 6,
        respuesta: [{ quien: "Dani", texto: "ya va en otro grupo, ¿es cierto?", hora: "10:17" }],
        porque: "Un rumor no se apaga solo: mientras nadie lo frena, sigue sumando gente. Callar no lo detiene.",
      },
      {
        id: "privado-captura",
        label: "Guardar captura y pedirle a Ana en privado que lo borre",
        icono: "fa-camera",
        envio: "Ana, ese audio no es cierto y le hace daño a Mauri. ¿Lo borras y no lo pasas? Guardé captura por si hace falta.",
        privadoA: "Ana",
        clima: 10,
        alcance: -8,
        respuesta: [
          { quien: "Ana", texto: "no sabía que era falso, perdón. lo borro", hora: "10:19" },
          { quien: "Ana", texto: "eliminó el audio", hora: "10:19", sistema: true },
        ],
        porque:
          "Pedirlo en privado corta la cadena en la persona que la pasa, y la captura con fecha es tu evidencia si el rumor sigue.",
      },
      {
        id: "tutora",
        label: "Contarle a la tutora lo del audio",
        icono: "fa-user-shield",
        envio: "Tutora, circula un audio falso sobre Mauri. ¿Puede ayudarnos?",
        privadoA: "Tutora",
        clima: 6,
        alcance: -4,
        respuesta: [
          { quien: "Tutora", texto: "Gracias por avisar. Hablo con el grupo mañana.", hora: "10:25" },
        ],
        porque:
          "Pedir ayuda es válido, pero llega mañana. Antes puedes cortar la cadena con quien lo pasó: es más rápido y casi siempre funciona.",
      },
    ],
  },
  {
    id: "hostigamiento",
    titulo: "Los apodos de las cuentas nuevas",
    alcanceBase: 18,
    entrada: [
      { quien: "Cuenta @v4le_real", texto: "otra vez el bailarín 🤡", hora: "13:02" },
      { quien: "Cuenta @v4le_real", texto: "nadie te quiere aquí, bailarín", hora: "13:05" },
      { quien: "Mauri", texto: "ya van tres semanas…", hora: "13:06" },
    ],
    opciones: [
      {
        id: "insulto",
        label: "Contestarle con otro insulto delante de todos",
        icono: "fa-fire",
        envio: "Tú eres el payaso, cobarde.",
        clima: -10,
        alcance: 10,
        respuesta: [
          { quien: "Cuenta @v4le_real", texto: "😂 ya se enojó, más", hora: "13:08" },
          { quien: "Lupita", texto: "se está poniendo feo", hora: "13:08" },
        ],
        porque: "Responder igual le da la escena que buscaba y te mete en la pelea. Con público y repetición, no funciona.",
      },
      {
        id: "bloquear",
        label: "Bloquear la cuenta y ya",
        icono: "fa-ban",
        envio: "(bloqueas @v4le_real)",
        clima: 2,
        alcance: 0,
        respuesta: [
          { quien: "Grupo", texto: "entró otra cuenta con los mismos apodos", hora: "13:10", sistema: true },
        ],
        porque:
          "Bloquear sirve para que tú dejes de verlo, pero no borra la cuenta ni impide que aparezca otra. Es útil y nunca basta por sí solo.",
      },
      {
        id: "reportar",
        label: "Capturar, reportar las cuentas y avisar a la tutora",
        icono: "fa-flag",
        envio: "Tutora, adjunto capturas con fecha: son cuentas nuevas que repiten los mismos apodos desde hace tres semanas.",
        privadoA: "Tutora",
        clima: 12,
        alcance: -14,
        respuesta: [
          { quien: "Tutora", texto: "Gracias. Esto no tienes que sostenerlo solo; hablo hoy con orientación.", hora: "13:30" },
          { quien: "La plataforma", texto: "suspendió la cuenta @v4le_real", hora: "13:48", sistema: true },
        ],
        porque:
          "Con tres señales (se repite, hay desventaja, hay intención) la respuesta incluye a una persona adulta. La captura da pruebas y el reporte deja registro.",
      },
      {
        id: "salir",
        label: "Salirte del grupo para no leerlo",
        icono: "fa-door-open",
        envio: "(sales del grupo)",
        clima: -6,
        alcance: 0,
        respuesta: [
          { quien: "Tú", texto: "saliste del grupo", hora: "13:12", sistema: true },
          { quien: "Mauri", texto: "…ya nadie dice nada", hora: "13:13" },
        ],
        porque: "Protegerte es válido, pero el hostigamiento sigue y Mauri se queda sin quien lo respalde. Salir no resuelve nada.",
      },
    ],
  },
  {
    id: "suplantacion",
    titulo: "La cuenta con tu nombre",
    alcanceBase: 11,
    entrada: [
      { quien: "Cuenta @v4le_real", texto: "ustedes me dan asco, los voy a exhibir a todos 🙄", hora: "17:40", foto: "cuenta-falsa" },
      { quien: "Dani", texto: "¿qué te pasó?? ¿por qué escribes eso?", hora: "17:41" },
      { quien: "Lupita", texto: "ya le llegó a media escuela", hora: "17:41" },
    ],
    opciones: [
      {
        id: "bloquear2",
        label: "Bloquear la cuenta falsa",
        icono: "fa-ban",
        envio: "(bloqueas la cuenta)",
        clima: -2,
        alcance: 0,
        respuesta: [{ quien: "Dani", texto: "me sigue escribiendo cosas, ¿tú sigues enojado?", hora: "17:44" }],
        porque:
          "Dejas de ver la cuenta, pero sigue escribiéndole a los demás en tu nombre. Aquí bloquear casi no ayuda.",
      },
      {
        id: "preguntar",
        label: "Escribirle a la cuenta: «¿Quién eres?»",
        icono: "fa-question",
        envio: "¿Quién eres? Dame la cara.",
        clima: -4,
        alcance: 4,
        respuesta: [{ quien: "Cuenta @v4le_real", texto: "jajaja ya cayó, sigan viendo", hora: "17:46" }],
        porque: "Escribirle confirma que te alcanzó y le da material. No sabes quién está detrás.",
      },
      {
        id: "avisar",
        label: "Avisar al grupo que esa cuenta no eres tú, capturar y reportarla",
        icono: "fa-tower-broadcast",
        envio: "Esa cuenta NO soy yo. No le respondan. Ya la capturé y la estoy reportando; avisen si les escribe.",
        clima: 10,
        alcance: -9,
        respuesta: [
          { quien: "Dani", texto: "uf, qué bueno que avisas, ya la bloqueé", hora: "17:50" },
          { quien: "Lupita", texto: "reporté la cuenta también", hora: "17:51" },
          { quien: "La plataforma", texto: "eliminó la cuenta falsa por suplantación", hora: "18:10", sistema: true },
        ],
        porque:
          "Avisar corta el daño de golpe: quienes la siguen dejan de creerle. La captura y el reporte hacen que la plataforma cierre la cuenta.",
      },
      {
        id: "esperar",
        label: "Contárselo a tu mamá y esperar sin avisar a nadie",
        icono: "fa-hourglass-half",
        envio: "(se lo cuentas a tu mamá)",
        clima: 4,
        alcance: 0,
        respuesta: [{ quien: "Dani", texto: "¿entonces sí eres tú? ya me dio miedo", hora: "17:55" }],
        porque:
          "Pedir ayuda a un adulto es correcto, pero mientras no avises, tus compañeros siguen creyendo que eres tú.",
      },
    ],
  },
];

export function carasClima(clima: number): { emoji: string; texto: string; color: string } {
  if (clima >= 85) return { emoji: "😊", texto: "Grupo sano", color: "#34D399" };
  if (clima >= 60) return { emoji: "🙂", texto: "Tensión baja", color: "#A3E635" };
  if (clima >= 35) return { emoji: "😕", texto: "Ambiente pesado", color: "#FBBF24" };
  return { emoji: "😟", texto: "Grupo hostil", color: "#FF5E5E" };
}
