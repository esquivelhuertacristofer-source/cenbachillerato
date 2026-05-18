/**
 * Seed de actividades pedagógicas para CD-I (Cultura Digital I).
 * 8 progresiones × 3 actividades = 24 actividades. estado='borrador'.
 * Uso: npx tsx scripts/seed-activities-cdi.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🌱 Seed actividades CD-I — Cultura Digital I\n");

  const progs = await getProgresionesDeUAC(sb, "CD-I");
  let ok = 0; let fail = 0;

  for (const p of progs) {
    const base = p.codigo;

    const a1ok = await upsertActividad(sb, {
      codigo: `${base}-A1`,
      titulo: titulos[p.numero - 1].a1,
      descripcion: "Lectura de contextualización sobre cultura digital crítica.",
      tipo: "lectura",
      progresion_id: p.id,
      xp: 10,
      contenido: lecturas[p.numero - 1],
    });
    a1ok ? ok++ : fail++;

    const a2ok = await upsertActividad(sb, {
      codigo: `${base}-A2`,
      titulo: titulos[p.numero - 1].a2,
      descripcion: "Quiz de comprensión y verificación de aprendizajes.",
      tipo: "quiz_multiple_opcion",
      progresion_id: p.id,
      xp: 15,
      contenido: quizzes[p.numero - 1],
    });
    a2ok ? ok++ : fail++;

    const a3ok = await upsertActividad(sb, {
      codigo: `${base}-A3`,
      titulo: titulos[p.numero - 1].a3,
      descripcion: "Reflexión escrita de cierre y aplicación crítica.",
      tipo: "reflexion_escrita",
      progresion_id: p.id,
      xp: 20,
      contenido: reflexiones[p.numero - 1],
    });
    a3ok ? ok++ : fail++;
  }

  log(`\n✅ CD-I: ${ok} actividades insertadas, ${fail} fallidas.\n`);
}

// ── TÍTULOS ───────────────────────────────────────────────────────────────────

const titulos = [
  { a1: "¿Qué hay dentro de mis dispositivos?", a2: "Hardware y software: ¿qué sé?", a3: "El dispositivo que uso todos los días" },
  { a1: "¿De quién es el software que uso?", a2: "Licencias digitales: ¿libre o propietario?", a3: "Las licencias y mi vida digital" },
  { a1: "¿Quién controla la información en internet?", a2: "Datos, poder y colonialismo digital", a3: "Mis datos: ¿quién los tiene?" },
  { a1: "Los algoritmos deciden por nosotros", a2: "¿Qué sé sobre los algoritmos?", a3: "El algoritmo que me sigue" },
  { a1: "Mis derechos en el mundo digital", a2: "Derechos digitales: ¿los conoces?", a3: "Ejercer mis derechos digitales" },
  { a1: "Navegar seguro en internet", a2: "Riesgos digitales: phishing y desinformación", a3: "Mi perfil de riesgo digital" },
  { a1: "Identidades y respeto en el ciberespacio", a2: "Comunicación digital respetuosa", a3: "Cómo me comporto en línea" },
  { a1: "Herramientas digitales para estudiar", a2: "¿Qué herramientas digitales conozco?", a3: "Mi kit de herramientas para aprender" },
];

// ── LECTURAS (A1) ─────────────────────────────────────────────────────────────

const lecturas = [
  { // P01 — hardware y software
    texto: `Cuando usas tu celular, tablet o computadora, estás interactuando con dos tipos de componentes que trabajan juntos: el hardware y el software. El hardware es todo lo que puedes tocar físicamente: la pantalla, el procesador, la memoria RAM, el disco de almacenamiento, la cámara, el micrófono. El software es el conjunto de programas e instrucciones que le dicen al hardware qué hacer: el sistema operativo (Android, iOS, Windows, Linux), las aplicaciones (WhatsApp, YouTube, calculadora) y los controladores que conectan el hardware con los programas.\n\nEl procesador (CPU) es el "cerebro" del dispositivo: ejecuta las instrucciones. La memoria RAM (Random Access Memory) es la memoria de trabajo temporal: guarda lo que el procesador necesita en este momento. El almacenamiento (disco duro, SSD, memoria interna) guarda los archivos de forma permanente. La tarjeta gráfica (GPU) procesa imágenes y videos.\n\nEntender estos componentes te ayuda a tomar mejores decisiones: saber por qué tu celular "se traba" (poca RAM o procesador lento), por qué se llena el almacenamiento, o por qué algunas apps consumen más batería. También te ayuda a detectar cuando alguien te está vendiendo un dispositivo con especificaciones engañosas.`,
    fuente: "Material elaborado para CEN Bachillerato",
    nivel_lectura: "basico" as const,
    tiempo_estimado_minutos: 8,
    preguntas_comprension: [
      { pregunta: "¿Cuál es la diferencia entre hardware y software?", respuesta_guia: "Hardware es lo físico (pantalla, procesador); software son los programas e instrucciones." },
      { pregunta: "¿Qué hace la memoria RAM?", respuesta_guia: "Es la memoria de trabajo temporal que guarda lo que el procesador necesita en el momento." },
      { pregunta: "¿Por qué 'se traba' un celular según el texto?", respuesta_guia: "Por poca RAM o un procesador lento." },
    ],
  },
  { // P02 — licencias
    texto: `Cuando instalas una aplicación o descargas un archivo, estás aceptando una licencia de uso, aunque rara vez la leas. Una licencia es un contrato legal que establece qué puedes y qué no puedes hacer con ese software o contenido.\n\nEl software propietario (o privativo) es el que pertenece a una empresa y cuyo código fuente es secreto. Puedes usarlo bajo sus condiciones, pero no modificarlo ni distribuirlo libremente. Ejemplos: Windows, Microsoft Office, Adobe Photoshop. El software libre (o de código abierto) permite usar, estudiar, modificar y redistribuir el programa. No significa que sea gratis, aunque muchas veces lo es. Ejemplos: Linux, LibreOffice, Firefox.\n\nLas licencias Creative Commons (CC) son para contenidos creativos (textos, imágenes, música, videos). Tienen diferentes niveles: CC BY (puedes usar si das crédito), CC BY-SA (puedes usar si das crédito y compartes igual), CC BY-NC (solo para uso no comercial), y otras combinaciones. La licencia más restrictiva es CC BY-NC-ND (solo puedes descargar y compartir tal cual, sin modificar ni usar comercialmente).\n\nConocer los tipos de licencias te protege legalmente y te permite tomar decisiones éticas sobre el software que usas, el contenido que compartes y los derechos que tienes como creador o consumidor digital.`,
    fuente: "Material elaborado para CEN Bachillerato",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 9,
    preguntas_comprension: [
      { pregunta: "¿Cuál es la característica principal del software libre?", respuesta_guia: "Permite usar, estudiar, modificar y redistribuir el programa." },
      { pregunta: "¿Qué significa la licencia CC BY?", respuesta_guia: "Puedes usar el contenido siempre que des crédito al autor." },
      { pregunta: "¿Por qué el texto dice que conocer licencias te protege?", respuesta_guia: "Porque te permite actuar legalmente y tomar decisiones éticas como creador o consumidor." },
    ],
  },
  { // P03 — colonialismo de datos
    texto: `Cada vez que usas una aplicación gratuita, estás pagando con algo más valioso que el dinero: tus datos. Las grandes plataformas digitales (Google, Meta, Amazon, TikTok) recolectan enormes cantidades de información sobre sus usuarios: qué buscas, cuánto tiempo pasas viendo cada contenido, qué compras, a qué horas te conectas, con quién hablas, qué emociones expresas. Con estos datos construyen perfiles detallados que venden a anunciantes o usan para influir en tu comportamiento.\n\nEsta dinámica tiene una dimensión geopolítica importante: la mayoría de las plataformas que dominan internet son de Estados Unidos o China, no de México ni de América Latina. Esto significa que los datos de millones de mexicanos son procesados, almacenados y controlados por empresas extranjeras bajo leyes de otros países. Algunos académicos llaman a esto "colonialismo de datos": una forma contemporánea de extracción de recursos, donde el recurso extraído es la información sobre las personas.\n\nEsta asimetría también se refleja en quién produce el conocimiento digital y quién lo consume: la mayoría de los contenidos, algoritmos y sistemas de inteligencia artificial son creados en inglés y desde perspectivas de países del Norte Global. Los usuarios de países como México son principalmente consumidores, no productores, del ecosistema digital global.`,
    fuente: "Material elaborado para CEN Bachillerato",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 9,
    preguntas_comprension: [
      { pregunta: "¿Qué tipo de datos recolectan las plataformas digitales según el texto?", respuesta_guia: "Búsquedas, tiempo en contenidos, compras, horarios de conexión, emociones, entre otros." },
      { pregunta: "¿Qué es el 'colonialismo de datos' según el texto?", respuesta_guia: "Una forma contemporánea de extracción donde el recurso extraído es información sobre personas de países como México." },
      { pregunta: "¿Qué asimetría existe entre México y los países del Norte Global en el ecosistema digital?", respuesta_guia: "México es principalmente consumidor; los países del Norte son productores del conocimiento, algoritmos y sistemas digitales." },
    ],
  },
  { // P04 — algoritmos
    texto: `Un algoritmo es un conjunto de instrucciones ordenadas para resolver un problema o completar una tarea. Los cocineros siguen algoritmos (recetas), los médicos siguen algoritmos (protocolos de diagnóstico), y las computadoras ejecutan algoritmos para hacer cualquier cosa que les pedimos.\n\nEn internet, los algoritmos son los responsables de decidir qué contenido ves. El algoritmo de YouTube decide qué video te recomienda a continuación. El de Instagram decide qué publicaciones aparecen primero en tu feed. El de TikTok analiza cuánto tiempo pasas en cada video y aprende tus preferencias con rapidez asombrosa. El de Google decide en qué orden aparecen los resultados de búsqueda.\n\nEstos algoritmos no son neutrales: están diseñados con objetivos específicos, generalmente maximizar el tiempo que pasas en la plataforma (para mostrarte más anuncios). Estudios han mostrado que los algoritmos de redes sociales tienden a promover contenido que genera reacciones emocionales fuertes (indignación, miedo, sorpresa), lo que puede amplificar la desinformación y la polarización.\n\nComprender cómo funcionan los algoritmos te ayuda a ser un usuario más consciente: entender por qué ves lo que ves, cuestionarlo, buscar información de fuentes diversas y no dejar que el algoritmo decida sola tu visión del mundo.`,
    fuente: "Material elaborado para CEN Bachillerato",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 9,
    preguntas_comprension: [
      { pregunta: "¿Qué es un algoritmo?", respuesta_guia: "Un conjunto de instrucciones ordenadas para resolver un problema o completar una tarea." },
      { pregunta: "¿Con qué objetivo principal están diseñados los algoritmos de redes sociales?", respuesta_guia: "Maximizar el tiempo que el usuario pasa en la plataforma para mostrarle más anuncios." },
      { pregunta: "¿Qué tipo de contenido tienden a promover los algoritmos y por qué es problemático?", respuesta_guia: "Contenido con reacciones emocionales fuertes (indignación, miedo), lo que amplifica desinformación y polarización." },
    ],
  },
  { // P05 — derechos digitales
    texto: `En el mundo digital, tenemos derechos que muchas veces desconocemos. Los derechos digitales son extensiones de los derechos humanos fundamentales aplicados al entorno tecnológico. Algunos de los más importantes son:\n\n• Derecho a la privacidad digital: nadie puede acceder sin autorización a tus comunicaciones, archivos o datos personales. En México está protegido por el artículo 16 constitucional y la Ley Federal de Protección de Datos Personales.\n• Derecho al olvido: puedes solicitar que se eliminen datos personales tuyos que ya no son relevantes o que afectan tu reputación.\n• Derecho a la no discriminación algorítmica: los sistemas automatizados no deben tomar decisiones que te discriminen por raza, género, clase social u otras características.\n• Derecho al acceso a internet: algunos instrumentos internacionales reconocen el acceso a internet como un derecho fundamental, ya que es necesario para ejercer otros derechos (educación, información, trabajo).\n• Derecho a la seguridad digital: tienes derecho a usar herramientas de cifrado y proteger tus comunicaciones.\n\nEjercer estos derechos requiere conocerlos, saber a qué instancias acudir cuando son violados (INAI en México para protección de datos) y usar las herramientas tecnológicas disponibles para protegerse.`,
    fuente: "Material elaborado para CEN Bachillerato",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 9,
    preguntas_comprension: [
      { pregunta: "¿Qué es el 'derecho al olvido'?", respuesta_guia: "El derecho a solicitar que se eliminen datos personales que ya no son relevantes o afectan la reputación." },
      { pregunta: "¿Qué institución en México protege los datos personales?", respuesta_guia: "El INAI (Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos Personales)." },
      { pregunta: "¿Por qué el acceso a internet se considera un derecho fundamental?", respuesta_guia: "Porque es necesario para ejercer otros derechos como la educación, la información y el trabajo." },
    ],
  },
  { // P06 — navegación segura
    texto: `Navegar en internet conlleva riesgos que conviene conocer para protegerse. Los tres principales que todo usuario debe reconocer son el phishing, la desinformación y la vigilancia.\n\nEl phishing (suplantación de identidad) es cuando alguien crea una página web, correo o mensaje falso que imita a una entidad legítima (banco, gobierno, empresa) para engañarte y obtener tus datos. Señales de alerta: URLs con errores de ortografía, mensajes urgentes que piden contraseñas, remitentes desconocidos.\n\nLa desinformación es la difusión de información falsa o engañosa, a veces intencional (fake news) y a veces no. Para detectarla: verifica la fuente del contenido, busca la misma información en varios medios confiables, revisa si la imagen o video ha sido manipulado, y usa verificadores de hechos (Verificado, Animal Político).\n\nLa vigilancia digital es el monitoreo de tus actividades en línea por parte de empresas, gobiernos o hackers. Para protegerte: usa contraseñas fuertes y diferentes para cada cuenta, activa la autenticación de dos factores (2FA), usa una VPN en redes públicas, revisa los permisos que das a las apps, y mantén actualizado tu sistema operativo.\n\nLa seguridad digital no es paranoia: es higiene básica en un mundo donde nuestros datos valen mucho dinero y los ataques cibernéticos son cada vez más sofisticados.`,
    fuente: "Material elaborado para CEN Bachillerato",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 9,
    preguntas_comprension: [
      { pregunta: "¿Qué es el phishing y cómo reconocerlo?", respuesta_guia: "Suplantación de identidad mediante páginas o mensajes falsos; señales: URLs con errores, solicitud de contraseñas urgente." },
      { pregunta: "¿Qué herramientas menciona el texto para verificar desinformación?", respuesta_guia: "Verificadores de hechos como Verificado y Animal Político, y contrastar con múltiples fuentes confiables." },
      { pregunta: "¿Qué es la autenticación de dos factores (2FA)?", respuesta_guia: "Un mecanismo de seguridad que requiere una segunda verificación además de la contraseña." },
    ],
  },
  { // P07 — identidades y comunicación digital
    texto: `El ciberespacio es un espacio social donde conviven millones de personas con identidades, culturas, lenguas y perspectivas muy diversas. Así como en el mundo físico la diversidad es una riqueza, en el mundo digital también lo es. Sin embargo, el anonimato y la distancia que proporciona internet pueden llevar a conductas que no se permitirían cara a cara: el ciberacoso (cyberbullying), el discurso de odio, la discriminación y la violencia digital.\n\nLa comunicación digital respetuosa e inclusiva implica: usar un lenguaje que no discrimine ni excluya, reconocer que detrás de cada pantalla hay una persona, no compartir contenido que humille o violente a otros, respetar las distintas maneras de identificarse (género, orientación, origen, creencia) y preguntar cuando no estamos seguros sobre algo.\n\nLas identidades en el ciberespacio son múltiples y complejas. Una persona puede tener una presencia diferente en Instagram, en un foro de videojuegos, en WhatsApp familiar y en plataformas académicas. Estas identidades digitales se construyen, no son dadas: decidimos qué mostramos, cómo nos presentamos y con quién interactuamos.\n\nLa empatía digital —ponerse en el lugar del otro en entornos virtuales— es tan importante como la empatía presencial. Las palabras escritas también duelen; los silencios digitales también excluyen.`,
    fuente: "Material elaborado para CEN Bachillerato",
    nivel_lectura: "basico" as const,
    tiempo_estimado_minutos: 8,
    preguntas_comprension: [
      { pregunta: "¿Qué conductas negativas facilita el anonimato en internet?", respuesta_guia: "Ciberacoso, discurso de odio, discriminación y violencia digital." },
      { pregunta: "¿Qué implica la comunicación digital respetuosa según el texto?", respuesta_guia: "Usar lenguaje no discriminatorio, reconocer que hay personas detrás de las pantallas, no compartir contenido que humille, respetar identidades diversas." },
      { pregunta: "¿Qué es la empatía digital?", respuesta_guia: "Ponerse en el lugar del otro en entornos virtuales, reconociendo que las palabras escritas también afectan." },
    ],
  },
  { // P08 — herramientas digitales
    texto: `Las herramientas digitales para el estudio y la organización han transformado la forma en que aprendemos, colaboramos y comunicamos. Conocerlas y usarlas estratégicamente puede marcar una gran diferencia en tu rendimiento académico.\n\nPara la organización de información, herramientas como Google Keep, Notion o Evernote permiten guardar notas, listas de tareas y recordatorios. Las apps de calendarios (Google Calendar) ayudan a planificar tareas y exámenes. Los procesadores de texto como Google Docs o LibreOffice Writer permiten crear documentos y colaborar en tiempo real.\n\nPara la comunicación escolar, el correo electrónico sigue siendo fundamental para comunicaciones formales. Plataformas como Google Classroom, Moodle o Microsoft Teams concentran las actividades escolares. Los chats grupales (WhatsApp, Telegram) son útiles para coordinación informal, aunque conviene mantener un tono respetuoso incluso en espacios informales.\n\nPara la búsqueda y verificación de información, Google Scholar es útil para artículos académicos. Wikipedia es un buen punto de partida pero no una fuente primaria. Las bibliotecas digitales (UNAM, CONACULTA) ofrecen acceso a libros y revistas verificados.\n\nUsarlas responsablemente implica citar correctamente las fuentes, no plagiar, proteger la privacidad de los compañeros y mantener separados los espacios de ocio y estudio.`,
    fuente: "Material elaborado para CEN Bachillerato",
    nivel_lectura: "basico" as const,
    tiempo_estimado_minutos: 8,
    preguntas_comprension: [
      { pregunta: "¿Qué diferencia hay entre Google Keep y Google Calendar?", respuesta_guia: "Keep es para notas y listas; Calendar es para planificar tareas y eventos en el tiempo." },
      { pregunta: "¿Por qué Wikipedia no es una fuente primaria?", respuesta_guia: "Porque cualquiera puede editarla y no siempre es verificada por expertos; es un punto de partida, no una fuente definitiva." },
      { pregunta: "¿Qué implica usar herramientas digitales responsablemente?", respuesta_guia: "Citar fuentes, no plagiar, proteger la privacidad y separar espacios de ocio y estudio." },
    ],
  },
];

// ── QUIZZES (A2) ──────────────────────────────────────────────────────────────

const quizzes = [
  { // P01 — hardware y software
    preguntas: [
      { enunciado: "¿Cuál de estos componentes es hardware?", opciones: ["El sistema operativo Android", "Una aplicación de música", "El procesador (CPU) de un celular", "Un archivo de texto"], respuesta_correcta: 2, retroalimentacion: "El procesador es un componente físico (hardware); los demás son software." },
      { enunciado: "¿Qué hace la memoria RAM?", opciones: ["Guarda archivos permanentemente", "Guarda lo que el procesador necesita en el momento (temporal)", "Controla la pantalla", "Conecta a internet"], respuesta_correcta: 1, retroalimentacion: "La RAM es la memoria de trabajo temporal del dispositivo." },
      { enunciado: "¿Cuál es la función del sistema operativo?", opciones: ["Reproducir música", "Coordinar el hardware y permitir que corran los programas", "Guardar fotos", "Conectarse a redes sociales"], respuesta_correcta: 1, retroalimentacion: "El sistema operativo (Android, iOS, Windows) es el software base que administra el hardware." },
      { enunciado: "Un celular 'se traba' frecuentemente. ¿Cuál es la causa más probable?", opciones: ["Demasiadas fotos guardadas", "Poca memoria RAM o procesador lento", "La pantalla es muy grande", "El color del fondo de pantalla"], respuesta_correcta: 1, retroalimentacion: "Poca RAM o procesador lento impiden ejecutar varias tareas a la vez con fluidez." },
      { enunciado: "¿Cuál de estos es un ejemplo de software libre?", opciones: ["Windows 11", "Adobe Photoshop", "Microsoft Office 365", "Linux"], respuesta_correcta: 3, retroalimentacion: "Linux es un sistema operativo de código abierto y software libre." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P02 — licencias
    preguntas: [
      { enunciado: "¿Cuál es la característica principal del software propietario?", opciones: ["Se puede modificar libremente", "Su código fuente es secreto y no puede redistribuirse sin autorización", "Es siempre gratuito", "Solo funciona en Linux"], respuesta_correcta: 1, retroalimentacion: "El software propietario tiene código fuente cerrado y uso limitado por licencia de la empresa." },
      { enunciado: "Una imagen con licencia CC BY-NC puede usarse:", opciones: ["Solo si pagas una tarifa", "Para uso no comercial dando crédito al autor", "Para cualquier propósito sin restricciones", "Solo en México"], respuesta_correcta: 1, retroalimentacion: "CC BY-NC = Attribution NonCommercial: se permite usar con crédito pero no con fines comerciales." },
      { enunciado: "¿Cuál de estas licencias es la más restrictiva?", opciones: ["CC BY (Solo atribución)", "Software libre GPL", "CC BY-NC-ND", "Dominio público"], respuesta_correcta: 2, retroalimentacion: "CC BY-NC-ND: solo puedes descargar y compartir sin modificar ni usar comercialmente." },
      { enunciado: "¿Qué significa que un programa es 'de código abierto'?", opciones: ["Que es gratuito siempre", "Que puedes ver, modificar y distribuir su código fuente", "Que solo funciona en internet", "Que no tiene derechos de autor"], respuesta_correcta: 1, retroalimentacion: "Código abierto (open source) significa que el código fuente es accesible para estudiar, modificar y redistribuir." },
      { enunciado: "Descargaste una imagen de internet para usarla en tu exposición escolar. ¿Qué debes verificar primero?", opciones: ["Que sea de buena calidad", "Su tipo de licencia y si permite uso educativo", "Que sea de colores llamativos", "Que pese menos de 1 MB"], respuesta_correcta: 1, retroalimentacion: "Antes de usar cualquier contenido digital, verifica su licencia para saber si está permitido ese uso." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P03 — colonialismo de datos
    preguntas: [
      { enunciado: "¿Qué tipo de datos recopilan las plataformas digitales de sus usuarios?", opciones: ["Solo el nombre y correo electrónico", "Solo los datos que el usuario ingresa manualmente", "Comportamiento, preferencias, emociones, horarios, contactos y más", "Solo la ubicación geográfica"], respuesta_correcta: 2, retroalimentacion: "Las plataformas recopilan datos masivos sobre comportamiento, emociones, horarios y mucho más." },
      { enunciado: "¿Qué significa que las apps 'gratuitas' en realidad se pagan con datos?", opciones: ["Que hay un cargo oculto en la factura telefónica", "Que la información personal del usuario es el producto que se vende a anunciantes", "Que debes compartir la app con amigos para usarla gratis", "Que tienes que ver anuncios sin saltarlos"], respuesta_correcta: 1, retroalimentacion: "El modelo de negocio de muchas apps gratuitas es vender datos de usuarios a anunciantes." },
      { enunciado: "¿Qué es el 'colonialismo de datos' según el tema estudiado?", opciones: ["Una forma de piratería de software", "La extracción de datos de usuarios de países en desarrollo por plataformas de países del Norte Global", "El robo de contraseñas", "La exportación ilegal de computadoras"], respuesta_correcta: 1, retroalimentacion: "El colonialismo de datos es la extracción de información de millones de personas de países como México por plataformas extranjeras." },
      { enunciado: "¿Cuál es la asimetría digital que menciona el tema?", opciones: ["Que los hombres usan más internet que las mujeres", "Que los países del Norte Global producen el conocimiento digital y los del Sur lo consumen", "Que internet es más rápido en ciudades que en el campo", "Que los jóvenes usan más redes sociales que los adultos"], respuesta_correcta: 1, retroalimentacion: "La asimetría es que países como EE.UU. y China producen algoritmos, IA y sistemas; México principalmente los consume." },
      { enunciado: "¿Cuál de estas acciones ayuda a proteger tu privacidad de datos?", opciones: ["Tener muchos seguidores en redes sociales", "Leer los términos de privacidad y ajustar los permisos de las apps", "Usar solo apps de empresas grandes y conocidas", "Publicar mucha información personal para ganar popularidad"], respuesta_correcta: 1, retroalimentacion: "Revisar y ajustar los permisos de privacidad en apps es una acción concreta de protección de datos." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P04 — algoritmos
    preguntas: [
      { enunciado: "¿Qué es un algoritmo?", opciones: ["Un virus informático", "Un conjunto de instrucciones ordenadas para resolver un problema", "Una red social", "Un tipo de contraseña segura"], respuesta_correcta: 1, retroalimentacion: "Un algoritmo es una secuencia ordenada de instrucciones para completar una tarea o resolver un problema." },
      { enunciado: "¿Con qué objetivo principal están diseñados los algoritmos de redes sociales?", opciones: ["Mostrarte la información más verídica", "Conectarte con tus amigos más cercanos", "Maximizar el tiempo que pasas en la plataforma", "Educarte sobre temas importantes"], respuesta_correcta: 2, retroalimentacion: "Los algoritmos de redes sociales están optimizados para que pases más tiempo en la plataforma y ver más anuncios." },
      { enunciado: "¿Por qué los algoritmos tienden a promover contenido que genera emociones fuertes?", opciones: ["Porque ese contenido es el más verídico", "Porque genera más interacciones y tiempo en la plataforma", "Porque es lo que los usuarios piden explícitamente", "Porque ayuda a la salud mental"], respuesta_correcta: 1, retroalimentacion: "El contenido que genera reacciones emocionales fuertes produce más comentarios, likes y shares, lo que aumenta el tiempo en la app." },
      { enunciado: "¿Cuál de estas acciones te ayuda a ser más consciente del algoritmo?", opciones: ["Ver todo lo que el algoritmo recomienda sin cuestionarlo", "Buscar activamente información de fuentes diversas fuera del feed", "Seguir solo cuentas similares a las que ya sigues", "Desactivar las notificaciones de amigos"], respuesta_correcta: 1, retroalimentacion: "Buscar fuentes diversas activamente evita que el algoritmo cree una 'burbuja de filtro' que limita tu perspectiva." },
      { enunciado: "¿Qué es una 'burbuja de filtro'?", opciones: ["Un sistema de protección de datos personales", "El fenómeno donde el algoritmo te muestra solo contenido que confirma tus ideas previas", "Una lista de contactos bloqueados", "Una función de privacidad en redes sociales"], respuesta_correcta: 1, retroalimentacion: "La burbuja de filtro es cuando los algoritmos te encierran en contenido que confirma tus creencias, reduciendo tu exposición a ideas diversas." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P05 — derechos digitales
    preguntas: [
      { enunciado: "¿Cuál de estos es un ejemplo de violación al derecho a la privacidad digital?", opciones: ["Una empresa envía un boletín de noticias al que te suscribiste", "Tu proveedor de internet comparte tus datos de navegación sin tu permiso", "Una red social te sugiere amigos en común", "Google guarda tu historial de búsqueda (con tu consentimiento)"], respuesta_correcta: 1, retroalimentacion: "Compartir datos de navegación sin consentimiento viola el derecho a la privacidad digital." },
      { enunciado: "¿Qué es el 'derecho al olvido'?", opciones: ["El derecho a borrar mensajes enviados en WhatsApp", "El derecho a solicitar que plataformas eliminen datos personales desactualizados o dañinos", "El derecho a no recibir publicidad", "El derecho a usar internet de forma anónima"], respuesta_correcta: 1, retroalimentacion: "El derecho al olvido permite pedir la eliminación de datos personales que ya no son relevantes o afectan la reputación." },
      { enunciado: "¿Qué institución en México protege los datos personales?", opciones: ["SEP", "CONAPRED", "INAI", "IMSS"], respuesta_correcta: 2, retroalimentacion: "El INAI (Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos Personales) es la autoridad en México." },
      { enunciado: "La 'discriminación algorítmica' ocurre cuando:", opciones: ["Un algoritmo recomienda contenido que no te interesa", "Un sistema automatizado toma decisiones que discriminan por características personales como raza o género", "Las redes sociales bloquean cuentas falsas", "Un buscador no encuentra lo que necesitas"], respuesta_correcta: 1, retroalimentacion: "La discriminación algorítmica es cuando sistemas automáticos refuerzan sesgos y discriminan a personas por sus características." },
      { enunciado: "¿Cuál de estas acciones ejerces tu derecho a la seguridad digital?", opciones: ["Usar la misma contraseña en todas tus cuentas por comodidad", "Activar la autenticación de dos factores en tus cuentas importantes", "Compartir tu contraseña con amigos de confianza", "No actualizar el sistema operativo para no perder configuraciones"], respuesta_correcta: 1, retroalimentacion: "Activar 2FA es una medida concreta para ejercer el derecho a la seguridad digital." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P06 — navegación segura
    preguntas: [
      { enunciado: "¿Cuál de estos es una señal de alerta de phishing?", opciones: ["Un correo de tu banco con tu nombre completo y número de cuenta visible", "Un mensaje urgente que pide tu contraseña 'para verificar tu cuenta'", "Una notificación de un pedido que compraste en línea", "Una actualización automática de tu sistema operativo"], respuesta_correcta: 1, retroalimentacion: "Los mensajes urgentes que piden contraseñas son una señal clásica de phishing." },
      { enunciado: "¿Qué es la desinformación?", opciones: ["Información que no entiendes por ser muy técnica", "Difusión de información falsa o engañosa, a veces intencional", "Información sobre política que no te interesa", "Noticias de otros países que no te afectan"], respuesta_correcta: 1, retroalimentacion: "La desinformación es la difusión de información falsa o engañosa, que puede ser intencional (fake news) o accidental." },
      { enunciado: "Para verificar si una noticia es falsa, ¿qué deberías hacer?", opciones: ["Compartirla inmediatamente si parece importante", "Buscar la misma información en varias fuentes confiables y verificar con fact-checkers", "Preguntar a tus amigos si la conocen", "Ver cuántos likes tiene"], respuesta_correcta: 1, retroalimentacion: "Verificar en múltiples fuentes confiables y con verificadores de hechos es la forma correcta de combatir la desinformación." },
      { enunciado: "¿Por qué es arriesgado conectarse a una red WiFi pública sin protección?", opciones: ["Porque consume más batería", "Porque puede haber un atacante monitoreando el tráfico de red y robando datos", "Porque la conexión es más lenta", "Porque gasta más datos móviles"], respuesta_correcta: 1, retroalimentacion: "En redes WiFi públicas sin cifrado, un atacante puede interceptar tus comunicaciones y robar datos (ataque man-in-the-middle)." },
      { enunciado: "¿Cuál es la característica de una contraseña segura?", opciones: ["Que sea tu fecha de nacimiento para que la recuerdes fácil", "Que sea larga, combine letras, números y símbolos, y sea única para cada cuenta", "Que sea el nombre de tu mascota", "Que la compartas con alguien de confianza por si la olvidas"], respuesta_correcta: 1, retroalimentacion: "Una contraseña segura es larga, compleja y única para cada cuenta. Nunca debe compartirse." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P07 — identidades y comunicación digital
    preguntas: [
      { enunciado: "¿Qué es el ciberacoso (cyberbullying)?", opciones: ["Publicar memes de humor sin identificar al autor", "Acoso, intimidación o agresión repetida hacia una persona a través de medios digitales", "Tener muchos seguidores en redes sociales", "Discutir en los comentarios de una publicación"], respuesta_correcta: 1, retroalimentacion: "El ciberacoso es acoso sistemático y repetido a través de plataformas digitales, y puede tener consecuencias graves." },
      { enunciado: "¿Qué caracteriza a la comunicación digital respetuosa?", opciones: ["Usar mayúsculas para enfatizar todos los mensajes importantes", "Reconocer que detrás de cada pantalla hay una persona y usar lenguaje inclusivo", "Responder siempre inmediatamente para no dejar en visto", "Agregar a todas las personas posibles a tus grupos de chat"], respuesta_correcta: 1, retroalimentacion: "La comunicación digital respetuosa parte de reconocer la humanidad del interlocutor y usar lenguaje que no discrimine." },
      { enunciado: "¿Por qué el anonimato en internet puede facilitar conductas negativas?", opciones: ["Porque las personas se vuelven más inteligentes en línea", "Porque la distancia y el anonimato reducen la sensación de consecuencias por las acciones", "Porque internet tiene menos normas que el mundo real", "Porque los algoritmos recompensan el comportamiento agresivo"], respuesta_correcta: 1, retroalimentacion: "El anonimato reduce el sentido de responsabilidad y las consecuencias percibidas, facilitando conductas que no ocurrirían cara a cara." },
      { enunciado: "¿Qué significa que las identidades digitales 'se construyen'?", opciones: ["Que son completamente falsas", "Que decidimos conscientemente qué mostramos, cómo nos presentamos y con quién interactuamos", "Que solo existen en las redes sociales", "Que no reflejan nuestra personalidad real"], respuesta_correcta: 1, retroalimentacion: "Las identidades digitales son activamente construidas: elegimos qué compartir, cómo presentarnos y cuáles aspectos de nosotros mostrar." },
      { enunciado: "¿Qué es la empatía digital?", opciones: ["Compartir mucho contenido de otros para apoyarlos", "Ponerse en el lugar del otro en entornos virtuales y reconocer el impacto de las palabras digitales", "Tener muchos seguidores en redes", "Responder a todos los comentarios que te hacen"], respuesta_correcta: 1, retroalimentacion: "La empatía digital es reconocer que las personas detrás de las pantallas sienten, y que las palabras escritas también tienen impacto." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P08 — herramientas digitales
    preguntas: [
      { enunciado: "¿Para qué sirve Google Scholar?", opciones: ["Para buscar imágenes de alta calidad", "Para buscar artículos y publicaciones académicas", "Para crear presentaciones en línea", "Para organizar tareas y recordatorios"], respuesta_correcta: 1, retroalimentacion: "Google Scholar es un buscador especializado en literatura académica y científica." },
      { enunciado: "¿Por qué Wikipedia no es una fuente primaria?", opciones: ["Porque está en inglés", "Porque cualquiera puede editarla y no siempre es verificada por expertos", "Porque es muy antigua", "Porque no tiene imágenes"], respuesta_correcta: 1, retroalimentacion: "Wikipedia es un buen punto de partida, pero al ser editable por cualquiera, no se considera fuente primaria confiable." },
      { enunciado: "¿Cuál de estas herramientas es más adecuada para planificar tus exámenes y tareas?", opciones: ["Google Scholar", "Wikipedia", "Google Calendar", "YouTube"], respuesta_correcta: 2, retroalimentacion: "Google Calendar permite organizar fechas, recordatorios y eventos como exámenes y entregas." },
      { enunciado: "¿Qué es el plagio en el contexto digital?", opciones: ["Descargar música para uso personal", "Usar el trabajo o ideas de otros sin dar crédito, presentándolo como propio", "Compartir artículos en redes sociales", "Guardar páginas web en favoritos"], respuesta_correcta: 1, retroalimentacion: "El plagio es usar el trabajo intelectual de otros sin citarlos, y es una falta académica y ética grave." },
      { enunciado: "¿Cuál es un uso responsable de las herramientas digitales escolares?", opciones: ["Compartir las credenciales de la plataforma escolar con amigos", "Citar correctamente las fuentes y proteger la privacidad de los compañeros", "Usar el correo escolar para mensajes personales y redes sociales", "Instalar extensiones en la computadora de la escuela sin permiso"], respuesta_correcta: 1, retroalimentacion: "Citar fuentes y respetar la privacidad son prácticas de uso responsable de herramientas digitales." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
];

// ── REFLEXIONES (A3) ──────────────────────────────────────────────────────────

const reflexiones = [
  { // P01 — hardware y software
    prompt: "Piensa en el dispositivo digital que más usas (celular, tablet, computadora). Describe sus componentes de hardware que conoces (pantalla, cámara, memoria, etc.) y el software que usas regularmente. ¿Cuándo o por qué 'se traba'? A partir de lo aprendido, ¿qué mejorarías de ese dispositivo si pudieras elegir sus especificaciones?",
    pistas: ["¿Cuánta memoria RAM tiene tu celular? ¿Cómo afecta eso su rendimiento?", "¿Qué sistema operativo usa? ¿Es software libre o propietario?", "¿Qué aplicaciones consumen más batería o almacenamiento?"],
    longitud_minima_palabras: 80,
    longitud_maxima_palabras: 300,
    criterios_evaluacion: ["Describe correctamente componentes de hardware y software del dispositivo", "Conecta el rendimiento del dispositivo con especificaciones concretas", "Reflexiona sobre qué mejoraría con razonamiento técnico", "Usa vocabulario del tema (RAM, procesador, almacenamiento, software)"],
    formato_esperado: "libre" as const,
  },
  { // P02 — licencias
    prompt: "Revisa 3 aplicaciones que uses habitualmente (redes sociales, juegos, apps de estudio, etc.) e investiga qué tipo de licencia tienen. ¿Son software libre o propietario? ¿Qué términos de uso te piden aceptar? ¿Hay algún término que te preocupe o que no sabías que estabas aceptando? ¿Cambiaría algo en la forma en que las usas?",
    pistas: ["¿Leíste alguna vez los 'Términos y condiciones' antes de instalar una app?", "¿WhatsApp, TikTok o Instagram son software libre o propietario?", "¿Existen alternativas de software libre a las apps que usas?"],
    longitud_minima_palabras: 80,
    longitud_maxima_palabras: 300,
    criterios_evaluacion: ["Analiza correctamente el tipo de licencia de 3 apps", "Identifica al menos un término de uso que considera importante", "Reflexiona sobre cómo cambiaría su uso a partir de este conocimiento", "Usa vocabulario del tema (licencia, software libre, propietario, código fuente)"],
    formato_esperado: "libre" as const,
  },
  { // P03 — colonialismo de datos
    prompt: "Piensa en las plataformas digitales que más usas. ¿De qué país son? ¿Qué datos crees que tienen sobre ti? ¿Cómo crees que los usan? ¿Te parece justo el intercambio 'datos por servicio gratuito'? ¿Qué harías diferente si tuvieras más control sobre tus datos?",
    pistas: ["¿TikTok, Google, WhatsApp y YouTube son de qué países?", "¿Qué permisos les has dado (cámara, micrófono, ubicación, contactos)?", "¿Existe alguna plataforma mexicana o latinoamericana que uses?"],
    longitud_minima_palabras: 80,
    longitud_maxima_palabras: 300,
    criterios_evaluacion: ["Identifica correctamente el origen de al menos 2 plataformas", "Reflexiona sobre los datos que esas plataformas tienen sobre él/ella", "Emite un juicio ético fundamentado sobre el modelo 'datos por servicio'", "Propone acciones concretas para mayor control de sus datos"],
    formato_esperado: "libre" as const,
  },
  { // P04 — algoritmos
    prompt: "Observa durante un día qué te recomienda el algoritmo de una red social o plataforma de video que uses regularmente. ¿Qué patrones ves? ¿El algoritmo te muestra diversidad de perspectivas o solo contenido similar? ¿Alguna vez ha influido en tu opinión sobre algo? ¿Qué harías para salir de tu 'burbuja de filtro'?",
    pistas: ["¿Qué tan diferentes son los videos o publicaciones que te recomienda respecto a lo que buscas?", "¿Te recomienda cosas con las que generalmente estás de acuerdo o también con las que discrepas?", "¿Puedes recordar algún caso donde el algoritmo te llevó a contenido que resultó falso o exagerado?"],
    longitud_minima_palabras: 80,
    longitud_maxima_palabras: 300,
    criterios_evaluacion: ["Describe observaciones concretas del comportamiento del algoritmo", "Analiza si hay diversidad o burbuja de filtro en sus recomendaciones", "Reflexiona sobre el impacto del algoritmo en su formación de opiniones", "Propone acciones concretas para diversificar sus fuentes"],
    formato_esperado: "libre" as const,
  },
  { // P05 — derechos digitales
    prompt: "¿Conocías tus derechos digitales antes de esta actividad? Describe una situación real o imaginaria donde uno de estos derechos podría ser violado (privacidad, olvido, no discriminación, acceso, seguridad). ¿Qué harías tú o qué debería hacerse para proteger ese derecho?",
    pistas: ["¿Has tenido alguna experiencia donde tus datos fueron usados sin tu conocimiento?", "¿Conoces el INAI y para qué sirve?", "¿Qué pasaría si una universidad o empresa usa un algoritmo que discrimina por nombre o código postal?"],
    longitud_minima_palabras: 80,
    longitud_maxima_palabras: 300,
    criterios_evaluacion: ["Identifica correctamente al menos un derecho digital", "Describe una situación concreta (real o plausible) de violación", "Propone acciones concretas de protección o reparación", "Usa vocabulario del tema (INAI, privacidad, 2FA, derecho al olvido)"],
    formato_esperado: "libre" as const,
  },
  { // P06 — navegación segura
    prompt: "Describe tu 'perfil de riesgo digital' actual: ¿qué prácticas de seguridad ya tienes? ¿cuáles deberías mejorar? ¿Has recibido alguna vez un intento de phishing o visto desinformación que casi te creyó? ¿Qué vas a cambiar en tus hábitos digitales a partir de hoy?",
    pistas: ["¿Usas contraseñas diferentes para cada cuenta? ¿Tienes activada la verificación en dos pasos?", "¿Alguna vez compartiste una noticia que luego resultó falsa?", "¿Revisas los permisos de las apps que instalas?"],
    longitud_minima_palabras: 80,
    longitud_maxima_palabras: 300,
    criterios_evaluacion: ["Evalúa honestamente sus prácticas actuales de seguridad digital", "Describe una experiencia con phishing o desinformación (real o que conoce)", "Identifica al menos 3 cambios concretos que adoptará", "Usa vocabulario del tema (phishing, 2FA, desinformación, VPN, contraseña)"],
    formato_esperado: "libre" as const,
  },
  { // P07 — identidades y comunicación digital
    prompt: "Reflexiona sobre cómo te comportas en diferentes espacios digitales (Instagram, WhatsApp, videojuegos, plataforma escolar). ¿Hay diferencias en cómo te presentas en cada uno? ¿Alguna vez has sido testigo de ciberacoso o falta de respeto en línea? ¿Qué hiciste o harías en esa situación? ¿Cómo defines tu 'identidad digital'?",
    pistas: ["¿Qué muestras en tus redes que no mostrarías en persona y viceversa?", "¿Cómo reacciones cuando alguien es agresivo contigo o con otros en línea?", "¿Qué aspecto de tu identidad te importa más proteger o proyectar en digital?"],
    longitud_minima_palabras: 80,
    longitud_maxima_palabras: 300,
    criterios_evaluacion: ["Analiza sus propias identidades en al menos 2 espacios digitales diferentes", "Reflexiona sobre una situación de respeto o irrespeto digital", "Define su identidad digital con profundidad personal", "Usa vocabulario del tema (ciberacoso, empatía digital, identidad, anonimato)"],
    formato_esperado: "libre" as const,
  },
  { // P08 — herramientas digitales
    prompt: "Diseña tu 'kit de herramientas digitales para estudiar' basado en lo aprendido. Menciona al menos 4 herramientas (para organizar, comunicar, buscar información y crear). Explica para qué usarías cada una y por qué la elegiste. ¿Qué herramientas ya usas y qué herramientas nuevas descubriste o quieres probar?",
    pistas: ["¿Qué app te ayudaría a no olvidar las fechas de entrega?", "¿Dónde buscarías fuentes confiables para un trabajo de investigación?", "¿Qué herramienta usarías para tomar notas compartidas con un compañero?"],
    longitud_minima_palabras: 80,
    longitud_maxima_palabras: 300,
    criterios_evaluacion: ["Menciona al menos 4 herramientas con función específica justificada", "Distingue entre herramientas ya conocidas y nuevas", "Reflexiona sobre uso responsable y citación de fuentes", "El kit es coherente con necesidades reales de estudiante de bachillerato"],
    formato_esperado: "libre" as const,
  },
];

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
