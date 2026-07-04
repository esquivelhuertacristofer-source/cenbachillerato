/**
 * Datos del Laboratorio — Navegar seguro en internet
 * (CD-I-P06, Cultura Digital I).
 *
 * Contenido VERBATIM de CD-I·P06 ("Navegar seguro en internet"). Las prácticas
 * a clasificar, los pares amenaza↔defensa, el glosario, los ejemplos y las
 * afirmaciones del cuestionario se toman literalmente de las actividades A1
 * (lectura), A2 (quiz de opción múltiple), A4 (V/F) y A5 (glosario).
 */

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 1 — ¿Práctica segura o riesgosa? (clasifica hábitos de navegación)
 * Las prácticas seguras provienen de las recomendaciones verbatim de A1
 * (protección frente a phishing, desinformación y vigilancia) y A2/A4; las
 * riesgosas son las señales de alerta y hábitos inseguros que esas mismas
 * actividades describen.
 * ───────────────────────────────────────────────────────────────────────── */
export type Categoria = "segura" | "riesgosa";

export const CATEGORIA_INFO: Record<
  Categoria,
  { titulo: string; subtitulo: string; icono: string }
> = {
  segura: {
    titulo: "Práctica segura",
    subtitulo: "Hábito de higiene digital que te protege del phishing, la desinformación y la vigilancia.",
    icono: "fa-shield-halved",
  },
  riesgosa: {
    titulo: "Práctica riesgosa",
    subtitulo: "Señal de alerta o hábito inseguro que te expone a perder tus datos o ser engañado.",
    icono: "fa-triangle-exclamation",
  },
};

export const PRACTICAS: { id: string; texto: string; cat: Categoria }[] = [
  { id: "pr-s1", texto: "Usar contraseñas fuertes y diferentes para cada cuenta", cat: "segura" },
  { id: "pr-s2", texto: "Activar la autenticación de dos factores (2FA)", cat: "segura" },
  { id: "pr-s3", texto: "Usar una VPN en redes públicas", cat: "segura" },
  { id: "pr-s4", texto: "Mantener actualizado tu sistema operativo", cat: "segura" },
  { id: "pr-s5", texto: "Buscar la misma información en varios medios confiables", cat: "segura" },
  { id: "pr-s6", texto: "Revisar los permisos que das a las apps", cat: "segura" },
  { id: "pr-r1", texto: "Responder a un mensaje urgente que pide tu contraseña «para verificar tu cuenta»", cat: "riesgosa" },
  { id: "pr-r2", texto: "Usar la misma contraseña sencilla en todas tus cuentas", cat: "riesgosa" },
  { id: "pr-r3", texto: "Conectarte a una WiFi pública sin protección", cat: "riesgosa" },
  { id: "pr-r4", texto: "Compartir una noticia de inmediato si parece importante", cat: "riesgosa" },
  { id: "pr-r5", texto: "Abrir enlaces de remitentes desconocidos con URLs con errores de ortografía", cat: "riesgosa" },
  { id: "pr-r6", texto: "Compartir tu CURP o domicilio sin necesidad", cat: "riesgosa" },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 2 — Amenaza ↔ defensa (empareja cada riesgo con cómo protegerte)
 * Los tres riesgos principales y sus defensas son verbatim de la lectura A1.
 * ───────────────────────────────────────────────────────────────────────── */
export const AMENAZAS: { id: string; amenaza: string; descripcion: string; defensa: string; ejemplo: string }[] = [
  {
    id: "am-phishing",
    amenaza: "Phishing",
    descripcion:
      "Suplantación de identidad: alguien crea una página, correo o mensaje falso que imita a una entidad legítima (banco, gobierno, empresa) para engañarte y obtener tus datos.",
    defensa: "Desconfía de URLs con errores de ortografía, de mensajes urgentes que piden contraseñas y de remitentes desconocidos.",
    ejemplo: "Un correo falso del «banco» que pide tu contraseña.",
  },
  {
    id: "am-desinformacion",
    amenaza: "Desinformación",
    descripcion:
      "Difusión de información falsa o engañosa, a veces intencional (fake news) y a veces no.",
    defensa:
      "Verifica la fuente, busca la misma información en varios medios confiables, revisa si la imagen o video fue manipulado y usa verificadores de hechos (Verificado, Animal Político).",
    ejemplo: "Una noticia falsa que se vuelve viral.",
  },
  {
    id: "am-vigilancia",
    amenaza: "Vigilancia digital",
    descripcion:
      "Monitoreo de tus actividades en línea por parte de empresas, gobiernos o hackers.",
    defensa:
      "Usa contraseñas fuertes y únicas, activa la 2FA, usa una VPN en redes públicas, revisa los permisos de las apps y mantén actualizado tu sistema operativo.",
    ejemplo: "Rastreo de tu navegación para crear tu perfil.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 3 — Empareja término y definición (glosario A5, verbatim)
 * ───────────────────────────────────────────────────────────────────────── */
export const PARES: { id: string; termino: string; definicion: string; ejemplo: string }[] = [
  {
    id: "gl-phishing",
    termino: "Phishing",
    definicion: "Engaño que suplanta a una entidad de confianza para robar datos o contraseñas.",
    ejemplo: "Un correo falso del «banco» que pide tu contraseña.",
  },
  {
    id: "gl-desinformacion",
    termino: "Desinformación",
    definicion: "Información falsa o engañosa que se difunde, a veces de forma intencional.",
    ejemplo: "Una noticia falsa que se vuelve viral.",
  },
  {
    id: "gl-vigilancia",
    termino: "Vigilancia digital",
    definicion: "Seguimiento de la actividad en línea de las personas, a veces sin su consentimiento.",
    ejemplo: "Rastreo de tu navegación para crear tu perfil.",
  },
  {
    id: "gl-seguridad",
    termino: "Seguridad digital",
    definicion: "Conjunto de prácticas para proteger tu información, dispositivos y cuentas.",
    ejemplo: "Contraseñas robustas y verificación en dos pasos.",
  },
  {
    id: "gl-proteccion",
    termino: "Protección de datos",
    definicion: "Resguardo de la información personal frente a usos indebidos.",
    ejemplo: "No compartir tu CURP o domicilio sin necesidad.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * Cuestionario de comprensión.
 * Combina las V/F de A4 (verbatim, opción doble Verdadero / Falso) con las
 * preguntas de opción múltiple de A2 (verbatim) reducidas a Verdadero / Falso
 * con su retroalimentación literal.
 * ───────────────────────────────────────────────────────────────────────── */
export const QUIZ: {
  pregunta: string;
  opciones: [string, string];
  correcta: 0 | 1;
  retro: string;
}[] = [
  {
    pregunta: "El phishing es un engaño para robar tus datos haciéndose pasar por una empresa o persona de confianza.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto: por eso hay que desconfiar de enlaces y mensajes sospechosos.",
  },
  {
    pregunta: "Usar la misma contraseña sencilla en todas tus cuentas es una práctica segura.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "Es inseguro: conviene contraseñas distintas y robustas.",
  },
  {
    pregunta: "La normatividad del ciberespacio establece reglas para usar los servicios digitales de forma responsable.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto: protege a las personas usuarias.",
  },
  {
    pregunta: "Proteger tus datos personales es parte de tu seguridad digital.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto: cuidar tu información reduce riesgos.",
  },
  {
    pregunta: "Un mensaje urgente que pide tu contraseña «para verificar tu cuenta» es una señal de alerta de phishing.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Los mensajes urgentes que piden contraseñas son una señal clásica de phishing.",
  },
  {
    pregunta: "Conectarse a una red WiFi pública sin protección es arriesgado porque un atacante puede monitorear el tráfico de red y robar datos.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "En redes WiFi públicas sin cifrado, un atacante puede interceptar tus comunicaciones y robar datos (ataque man-in-the-middle).",
  },
];

/** Dato verbatim de la lectura A1. */
export const DATO_SEGURIDAD =
  "La seguridad digital no es paranoia: es higiene básica en un mundo donde nuestros datos valen mucho dinero y los ataques cibernéticos son cada vez más sofisticados.";
