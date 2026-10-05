/**
 * Modelo del SIMULADOR «Tu teléfono» (lab «navegacion-segura»).
 *
 * TODO es ficticio: el banco «Nortelago», la «Prepa Cerro Alto», las apps, los
 * números, los dominios (.example) y los medidores son valores de simulación
 * para aprender a decidir; no son marcas ni sitios reales y nada de esto
 * ocurre de verdad.
 *
 * Determinista: cada aviso trae una tabla fija «decisión → consecuencia», así
 * que las mismas decisiones dan siempre el mismo resultado y cada número del
 * medidor se puede rastrear a un aviso.
 */

export type Accion = "abrir" | "ignorar" | "reportar";
export type Valor = "bien" | "regular" | "mal";
export type TipoAviso = "sms" | "correo" | "wifi" | "descarga" | "permisos" | "sistema" | "premio" | "seguridad";

export interface Senal {
  id: string;
  icono: string;
  titulo: string;
  texto: string;
  /** true = señal de alerta; false = señal de que es confiable. */
  alerta: boolean;
}

export interface Efecto {
  seg: number;
  datos: number;
  val: Valor;
  texto: string;
}

export interface Aviso {
  id: string;
  tipo: TipoAviso;
  icono: string;
  remitente: string;
  texto: string;
  /** Clave de imagen en /media/labs-sim/navegacion-segura/ (opcional). */
  foto?: string;
  trampa: boolean;
  /** Texto de los tres botones: abrir / ignorar / reportar. */
  botones: [string, string, string];
  senales: Senal[];
  efectos: Record<Accion, Efecto>;
  /** Qué queda expuesto si caes (se acumula en la lista de datos). */
  expone: string[];
  /** Incidente simulado si caes. */
  incidente: string;
}

export const AVISOS: Aviso[] = [
  {
    id: "a1",
    tipo: "sms",
    icono: "fa-comment-sms",
    remitente: "Banco Nortelago (SMS)",
    texto: "AVISO URGENTE: tu cuenta será bloqueada en 30 minutos. Verifica tus datos ahora en http://nortelago-verifica.example/acceso e ingresa tu contraseña.",
    foto: "estudiante-celular",
    trampa: true,
    botones: ["Abrir el enlace", "Ignorar el mensaje", "Reportar y bloquear"],
    senales: [
      { id: "dom", icono: "fa-link-slash", titulo: "Dominio raro", texto: "El enlace va a nortelago-verifica.example, no al sitio del banco (nortelago.example). Agregar palabras al nombre es un truco clásico.", alerta: true },
      { id: "urg", icono: "fa-hourglass-half", titulo: "Urgencia", texto: "Amenaza con bloquear tu cuenta en 30 minutos para que no lo pienses.", alerta: true },
      { id: "http", icono: "fa-lock-open", titulo: "Sin candado", texto: "Empieza con http, no https: la conexión no va cifrada.", alerta: true },
      { id: "pass", icono: "fa-key", titulo: "Pide tu contraseña", texto: "Un banco no te pide la contraseña por mensaje.", alerta: true },
    ],
    efectos: {
      abrir: { seg: -30, datos: 30, val: "mal", texto: "Escribiste tu contraseña en una página falsa. Cuenta robada (simulación): alguien puede vaciar tu saldo." },
      ignorar: { seg: 0, datos: 0, val: "bien", texto: "No caíste. Un mensaje urgente que pide tu contraseña es una señal clásica de phishing." },
      reportar: { seg: 5, datos: 0, val: "bien", texto: "Reportar y bloquear el número ayuda a que otras personas no caigan." },
    },
    expone: ["Contraseña del banco"],
    incidente: "Cuenta bancaria vaciada",
  },
  {
    id: "a2",
    tipo: "correo",
    icono: "fa-envelope",
    remitente: "Control Escolar · Prepa Cerro Alto",
    texto: "Tus calificaciones del parcial ya están publicadas. Consúltalas cuando quieras en https://prepacerroalto.example/calificaciones",
    foto: "salon-prepa",
    trampa: false,
    botones: ["Abrir el enlace", "Ignorar el correo", "Reportar como engaño"],
    senales: [
      { id: "dom", icono: "fa-link", titulo: "Dominio conocido", texto: "prepacerroalto.example es el sitio que ya usas en tu escuela.", alerta: false },
      { id: "https", icono: "fa-lock", titulo: "Con candado", texto: "El enlace empieza con https.", alerta: false },
      { id: "calma", icono: "fa-clock", titulo: "Sin prisa", texto: "No amenaza ni pone plazos de minutos.", alerta: false },
      { id: "datos", icono: "fa-user-shield", titulo: "No pide datos", texto: "No te pide contraseñas ni documentos por el correo.", alerta: false },
    ],
    efectos: {
      abrir: { seg: 0, datos: 0, val: "bien", texto: "Era legítimo: dominio conocido, https, sin urgencia y sin pedirte datos." },
      ignorar: { seg: 0, datos: 0, val: "regular", texto: "No pasó nada, pero te quedas sin ver tus calificaciones: desconfiar de todo también tiene costo." },
      reportar: { seg: 0, datos: 0, val: "regular", texto: "Falsa alarma: reportar mensajes legítimos satura a quien revisa los reportes reales." },
    },
    expone: [],
    incidente: "",
  },
  {
    id: "a3",
    tipo: "wifi",
    icono: "fa-wifi",
    remitente: "Redes Wi-Fi cercanas",
    texto: "Cafe_Gratis_WiFi: red abierta, sin contraseña. Estás en una cafetería y necesitas entrar a tu cuenta del banco. ¿Te conectas?",
    foto: "cafe-mesa",
    trampa: true,
    botones: ["Conectarme", "No conectarme: usar datos móviles", "Olvidar la red y avisar"],
    senales: [
      { id: "abierta", icono: "fa-lock-open", titulo: "Red abierta", texto: "Sin contraseña, el tráfico puede ir sin cifrar: alguien en la misma red puede monitorearlo (ataque man-in-the-middle).", alerta: true },
      { id: "nombre", icono: "fa-user-secret", titulo: "Nombre sin dueño", texto: "Cualquiera puede crear una red con ese nombre; no sabes quién la administra.", alerta: true },
      { id: "alt", icono: "fa-signal", titulo: "Hay alternativa", texto: "Tienes datos móviles (o una VPN) a la mano para operar con tu banco.", alerta: false },
    ],
    efectos: {
      abrir: { seg: -18, datos: 20, val: "mal", texto: "Un atacante en la misma red interceptó tu tráfico (simulación): tus datos de acceso quedaron expuestos." },
      ignorar: { seg: 0, datos: 0, val: "bien", texto: "Bien: usar datos móviles o una VPN evita que te espíen en una red pública." },
      reportar: { seg: 4, datos: 0, val: "bien", texto: "Olvidar la red evita que tu teléfono se reconecte solo, y avisar protege a los demás clientes." },
    },
    expone: ["Datos de acceso a tus cuentas"],
    incidente: "Tráfico interceptado en red abierta",
  },
  {
    id: "a4",
    tipo: "descarga",
    icono: "fa-download",
    remitente: "Número desconocido",
    texto: "¡Mira las fotos de la graduación! Instala el archivo Fotos_graduacion.apk. Te pedirá acceso a tus contactos, tus mensajes y el micrófono.",
    foto: "fotos-grupo",
    trampa: true,
    botones: ["Descargar e instalar", "Ignorar", "Reportar y bloquear"],
    senales: [
      { id: "rem", icono: "fa-user-slash", titulo: "Remitente desconocido", texto: "Nadie de tus contactos lo envía; no hay contexto.", alerta: true },
      { id: "apk", icono: "fa-file-zipper", titulo: "Archivo ejecutable", texto: "Unas fotos no son un programa (.apk) ni se instalan fuera de la tienda oficial.", alerta: true },
      { id: "perm", icono: "fa-shield-halved", titulo: "Permisos excesivos", texto: "Pedir contactos, mensajes y micrófono para ver fotos no tiene sentido.", alerta: true },
    ],
    efectos: {
      abrir: { seg: -35, datos: 35, val: "mal", texto: "Instalaste un programa espía (simulación): lee tus mensajes y copia tus contactos." },
      ignorar: { seg: 0, datos: 0, val: "bien", texto: "Bien: no instalaste nada que no vino de una fuente confiable." },
      reportar: { seg: 5, datos: 0, val: "bien", texto: "Bloquear al remitente evita que siga mandándote programas dañinos." },
    },
    expone: ["Contactos", "Mensajes", "Micrófono"],
    incidente: "Programa espía instalado",
  },
  {
    id: "a5",
    tipo: "sistema",
    icono: "fa-gear",
    remitente: "Ajustes del teléfono",
    texto: "Hay una actualización de seguridad del sistema. Se instalará con el Wi-Fi de tu casa y la batería al 80 %.",
    foto: "candado-llave",
    trampa: false,
    botones: ["Actualizar ahora", "Posponer", "Reportar como engaño"],
    senales: [
      { id: "orig", icono: "fa-gear", titulo: "Viene del sistema", texto: "Aparece en los ajustes del propio teléfono, no en un enlace de un mensaje.", alerta: false },
      { id: "datos", icono: "fa-user-shield", titulo: "No pide datos", texto: "No te pide contraseñas ni pagos.", alerta: false },
      { id: "calma", icono: "fa-clock", titulo: "Sin prisa", texto: "Puedes programarla; no te amenaza con perder nada.", alerta: false },
    ],
    efectos: {
      abrir: { seg: 8, datos: 0, val: "bien", texto: "Mantener el sistema actualizado cierra fallas conocidas que usan los atacantes." },
      ignorar: { seg: -6, datos: 0, val: "mal", texto: "Aplazar las actualizaciones deja abiertas fallas que ya se conocen." },
      reportar: { seg: 0, datos: 0, val: "regular", texto: "Era un aviso legítimo del propio sistema: reportarlo no protege nada." },
    },
    expone: [],
    incidente: "",
  },
  {
    id: "a6",
    tipo: "permisos",
    icono: "fa-lightbulb",
    remitente: "App «Linterna Brillante»",
    texto: "Para instalarla necesita permiso para ver tus contactos, tu ubicación y usar el micrófono. ¿Aceptas todo?",
    foto: "linterna-oscuro",
    trampa: true,
    botones: ["Aceptar todos los permisos", "No instalarla", "Reportar la app"],
    senales: [
      { id: "perm", icono: "fa-shield-halved", titulo: "Permisos que no corresponden", texto: "Una linterna solo necesita el flash; contactos, ubicación y micrófono no los usa.", alerta: true },
      { id: "dev", icono: "fa-user-secret", titulo: "Autor sin verificar", texto: "No hay información de quién la hizo ni política de privacidad.", alerta: true },
      { id: "alt", icono: "fa-mobile-screen", titulo: "Ya tienes linterna", texto: "Tu teléfono trae una en el panel rápido.", alerta: false },
    ],
    efectos: {
      abrir: { seg: -15, datos: 25, val: "mal", texto: "La app recopiló tu ubicación y contactos para venderlos (simulación): vigilancia digital." },
      ignorar: { seg: 0, datos: 0, val: "bien", texto: "Revisar los permisos y negarlos cuando no tienen sentido te protege de la vigilancia." },
      reportar: { seg: 4, datos: 0, val: "bien", texto: "Reportar una app abusiva en la tienda ayuda a retirarla." },
    },
    expone: ["Ubicación", "Contactos"],
    incidente: "Ubicación y contactos vendidos",
  },
  {
    id: "a7",
    tipo: "premio",
    icono: "fa-gift",
    remitente: "Sorteo Mega Regalos",
    texto: "¡Ganaste un teléfono nuevo! Reclámalo en 10 minutos: paga $49 de envío y mándanos tu CURP y tu domicilio.",
    foto: "regalo-caja",
    trampa: true,
    botones: ["Reclamar mi premio", "Ignorar", "Reportar y bloquear"],
    senales: [
      { id: "part", icono: "fa-ticket", titulo: "Premio sin participar", texto: "Nunca te inscribiste a ningún sorteo.", alerta: true },
      { id: "urg", icono: "fa-hourglass-half", titulo: "Urgencia", texto: "Solo tienes 10 minutos: la prisa evita que verifiques.", alerta: true },
      { id: "datos", icono: "fa-id-card", titulo: "Pide datos y dinero", texto: "Compartir tu CURP o domicilio sin necesidad te expone al robo de identidad.", alerta: true },
    ],
    efectos: {
      abrir: { seg: -20, datos: 35, val: "mal", texto: "Entregaste tu CURP, domicilio y datos de tarjeta (simulación): riesgo de robo de identidad." },
      ignorar: { seg: 0, datos: 0, val: "bien", texto: "Bien: un premio que pide dinero y datos personales es un engaño." },
      reportar: { seg: 5, datos: 0, val: "bien", texto: "Reportar y bloquear frena a quien envía el engaño a muchas personas." },
    },
    expone: ["CURP", "Domicilio", "Datos de tarjeta"],
    incidente: "Identidad suplantada",
  },
  {
    id: "a8",
    tipo: "seguridad",
    icono: "fa-key",
    remitente: "Tu aplicación de correo",
    texto: "¿Eres tú? Alguien intenta iniciar sesión en tu correo desde otro dispositivo. Tú no estás iniciando sesión ahora mismo.",
    trampa: true,
    botones: ["Aprobar el inicio de sesión", "Ignorar la notificación", "Rechazar y cambiar contraseña"],
    senales: [
      { id: "no", icono: "fa-user-xmark", titulo: "Tú no lo iniciaste", texto: "Si no fuiste tú, otra persona ya tiene tu contraseña.", alerta: true },
      { id: "dos", icono: "fa-shield-halved", titulo: "La verificación en dos pasos funcionó", texto: "Gracias a la 2FA el intento se detuvo en este aviso: aprobarlo le abriría la puerta.", alerta: false },
      { id: "cam", icono: "fa-rotate", titulo: "Hay que cambiar la contraseña", texto: "Ignorar el aviso no la protege: conviene cambiarla y usar una distinta en cada cuenta.", alerta: true },
    ],
    efectos: {
      abrir: { seg: -30, datos: 25, val: "mal", texto: "Aprobaste: la otra persona entró a tu correo (simulación) y puede restablecer tus demás cuentas." },
      ignorar: { seg: -8, datos: 5, val: "regular", texto: "La alerta pasa, pero tu contraseña ya pudo filtrarse: sin cambiarla, el intento puede repetirse." },
      reportar: { seg: 8, datos: 0, val: "bien", texto: "Rechazar y cambiar la contraseña cierra la puerta. Mantén activada la autenticación de dos factores." },
    },
    expone: ["Correo y mensajes"],
    incidente: "Cuenta de correo robada",
  },
];

export interface Decision {
  id: string;
  accion: Accion;
  /** ¿Revisó las señales antes de decidir? */
  revisado: boolean;
}

export interface Resumen {
  seguridad: number;
  datos: number;
  expuestos: string[];
  incidentes: string[];
  procesados: number;
  bien: number;
  informadas: number;
  cerrado: boolean;
}

export const SEG_INICIAL = 80;
export const DATOS_INICIAL = 0;

const tope = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export const efectoDe = (a: Aviso, accion: Accion): Efecto => a.efectos[accion];

/** Reconstruye los medidores a partir de las decisiones tomadas. */
export function calcular(decisiones: Decision[]): Resumen {
  let seguridad = SEG_INICIAL;
  let datos = DATOS_INICIAL;
  const expuestos: string[] = [];
  const incidentes: string[] = [];
  let bien = 0;
  let informadas = 0;
  for (const d of decisiones) {
    const a = AVISOS.find((x) => x.id === d.id);
    if (!a) continue;
    const e = a.efectos[d.accion];
    seguridad = tope(seguridad + e.seg);
    datos = tope(datos + e.datos);
    if (e.val === "bien") bien++;
    if (d.revisado) informadas++;
    if (a.trampa && d.accion === "abrir") {
      for (const x of a.expone) if (!expuestos.includes(x)) expuestos.push(x);
      if (a.incidente) incidentes.push(a.incidente);
    }
  }
  return { seguridad, datos, expuestos, incidentes, procesados: decisiones.length, bien, informadas, cerrado: decisiones.length >= AVISOS.length };
}

export function nivelSeguridad(n: number): { texto: string; color: string } {
  if (n >= 75) return { texto: "Protegido", color: "#34D399" };
  if (n >= 50) return { texto: "Vulnerable", color: "#FFC75A" };
  return { texto: "Comprometido", color: "#FF5E5E" };
}

export function nivelDatos(n: number): { texto: string; color: string } {
  if (n <= 15) return { texto: "Resguardados", color: "#34D399" };
  if (n <= 40) return { texto: "Algunos expuestos", color: "#FFC75A" };
  return { texto: "Muy expuestos", color: "#FF5E5E" };
}
