/**
 * Seed de actividades pedagógicas para CD-III (Cultura Digital III, Semestre 6).
 * 4 propósitos × 3 actividades = 12 actividades. estado='publicada'.
 * Tipos A1: lectura, video_con_preguntas, infografia, lectura
 *       A2: quiz_multiple_opcion, simulacion, quiz_verdadero_falso, simulacion
 *       A3: debate_estructurado, reflexion_escrita, autoevaluacion, reflexion_escrita
 * Uso: npx tsx scripts/seed-activities-cdiii.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🌱 Seed actividades CD-III — Comunicación digital, género, vocaciones y participación comunitaria\n");

  const progs = await getProgresionesDeUAC(sb, "CD-III");
  let ok = 0; let fail = 0;

  for (const p of progs) {
    const base = p.codigo;
    const n = p.numero;

    const a1ok = await upsertActividad(sb, {
      codigo: `${base}-A1`,
      titulo: titulos[n - 1].a1,
      descripcion: "Introducción conceptual al propósito formativo.",
      tipo: tiposA1[n - 1],
      progresion_id: p.id,
      xp: 10,
      estado: "publicada",
      contenido: contenidosA1[n - 1],
    });
    a1ok ? ok++ : fail++;

    const a2ok = await upsertActividad(sb, {
      codigo: `${base}-A2`,
      titulo: titulos[n - 1].a2,
      descripcion: "Práctica de verificación y consolidación conceptual.",
      tipo: tiposA2[n - 1],
      progresion_id: p.id,
      xp: 15,
      estado: "publicada",
      contenido: contenidosA2[n - 1],
    });
    a2ok ? ok++ : fail++;

    const a3ok = await upsertActividad(sb, {
      codigo: `${base}-A3`,
      titulo: titulos[n - 1].a3,
      descripcion: "Aplicación crítica y cierre del propósito formativo.",
      tipo: tiposA3[n - 1],
      progresion_id: p.id,
      xp: 20,
      estado: "publicada",
      contenido: contenidosA3[n - 1],
    });
    a3ok ? ok++ : fail++;
  }

  log(`\n✅ CD-III: ${ok} actividades insertadas, ${fail} fallidas.\n`);
}

// ── TÍTULOS ─────────────────────────────────────────────────────────────────────
const titulos = [
  {
    a1: "Comunicación digital multimodal: texto, imagen, audio y video en la era digital",
    a2: "¿Cuánto sabes sobre comunicación multimodal, identidad digital y algoritmos?",
    a3: "Debate: ¿Las redes sociales construyen o destruyen la identidad de los jóvenes?",
  },
  {
    a1: "Brecha digital de género y producción ética de contenidos",
    a2: "Simulación: diseña una campaña digital inclusiva con perspectiva de género",
    a3: "Reflexión: ¿cómo evitar estereotipos de género en los contenidos digitales que produzco?",
  },
  {
    a1: "Carreras y profesiones en el campo digital: panorama con perspectiva de género",
    a2: "¿Verdadero o falso? Brecha de género en STEM y vocaciones digitales",
    a3: "Autoevaluación: mis fortalezas y mi vocación para las tecnologías digitales",
  },
  {
    a1: "Participación ciudadana digital: del activismo en línea al cambio real",
    a2: "Simulación: diseña y evalúa un proyecto de participación comunitaria digital",
    a3: "Reflexión: diseño de mi proyecto de transformación comunitaria con tecnologías digitales",
  },
];

// ── TIPOS ────────────────────────────────────────────────────────────────────────
const tiposA1 = ["lectura", "video_con_preguntas", "infografia", "lectura"] as const;
const tiposA2 = ["quiz_multiple_opcion", "simulacion", "quiz_verdadero_falso", "simulacion"] as const;
const tiposA3 = ["debate_estructurado", "reflexion_escrita", "autoevaluacion", "reflexion_escrita"] as const;

// ── A1 ──────────────────────────────────────────────────────────────────────────
const contenidosA1 = [
  {
    // P01 — lectura: comunicación multimodal, identidad digital, algoritmos, desinformación, brecha digital de género
    titulo: "Comunicación digital multimodal: entre la expresión, la identidad y los algoritmos",
    texto: "Vivimos en un ecosistema comunicativo radicalmente distinto al de hace veinte años. La comunicación digital multimodal integra en un mismo mensaje texto, imagen fija, video, audio, animación e hipervínculos, creando experiencias informativas y expresivas que desbordan las capacidades de cualquier medio anterior. TikTok, Instagram, YouTube y WhatsApp no son solo plataformas de entretenimiento: son infraestructuras de comunicación que millones de jóvenes mexicanos usan para informarse, relacionarse y construir su identidad pública.\n\nLos algoritmos de recomendación de estas plataformas no son neutrales. Son sistemas de inteligencia artificial entrenados para maximizar el tiempo que los usuarios pasan en la aplicación, lo que técnicamente se llama retención. Para lograrlo, los algoritmos tienden a mostrar contenido que provoca reacciones emocionales fuertes —indignación, miedo, entusiasmo, humor— y que refuerza las creencias previas del usuario, creando lo que se conoce como cámara de eco o burbuja de filtro. El resultado es que dos personas con diferentes opiniones políticas o valores pueden ver versiones completamente distintas de la realidad, aunque usen la misma plataforma.\n\nLa construcción de la identidad digital es uno de los fenómenos más complejos del presente. El filósofo Erving Goffman describió la vida social como una actuación en la que las personas gestionan la impresión que producen en los demás. En las redes sociales, esta performatividad se amplifica: las personas cuidadosamente seleccionan qué mostrar, cómo mostrarlo y para qué audiencia. La identidad que se proyecta en Instagram no es idéntica a la que se muestra en TikTok ni a la que se vive fuera de línea. Esta multiplicidad de identidades digitales puede ser enriquecedora, pero también genera presiones, ansiedad y comparación social, especialmente en la adolescencia.\n\nLa desinformación y la posverdad representan uno de los riesgos más serios del ecosistema comunicativo actual. Los deepfakes —videos o audios manipulados con inteligencia artificial que hacen parecer que una persona dijo o hizo algo que nunca ocurrió— se han vuelto cada vez más accesibles y difíciles de detectar. En México, la desinformación sobre salud, política y seguridad circula masivamente por WhatsApp, donde los mensajes reenviados sin verificación se viralizan en comunidades cerradas. Según datos de la organización Verificado, durante las elecciones de 2024 se registraron miles de noticias falsas en plataformas digitales mexicanas.\n\nLa brecha digital de género en México es una realidad documentada. El INEGI reportó en la Encuesta Nacional sobre Disponibilidad y Uso de Tecnologías de la Información en los Hogares (ENDUTIH) que, si bien la brecha de acceso a internet se ha reducido en los últimos años, persisten diferencias en el tipo de uso: las mujeres usan más las plataformas para comunicación y entretenimiento, mientras que los hombres presentan mayor uso para actividades laborales, educativas y de programación. Esta diferencia no es biológica: es producto de socializaciones distintas, estereotipos de género en la educación tecnológica y de la subrepresentación de mujeres en los sectores de diseño y desarrollo de plataformas digitales.\n\nLa alfabetización mediática es la herramienta fundamental para navegar críticamente en este ecosistema. Implica preguntar, ante cualquier contenido: ¿Quién lo produjo? ¿Con qué objetivo? ¿Qué se muestra y qué se omite? ¿Qué emociones busca generar? ¿Hay fuentes verificables? Desarrollar esta mirada crítica no significa desconfiar de todo, sino aprender a leer los medios digitales con la misma profundidad con que se analiza un texto literario o histórico.",
    fuente: "Material CEN Bachillerato — CD-III. Ref.: ENDUTIH INEGI 2023; Verificado México 2024; Goffman, 1959.",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 13,
    preguntas_comprension: [
      {
        pregunta: "¿Cómo funciona el algoritmo de recomendación de plataformas como TikTok e Instagram y qué efectos tiene en la percepción de la realidad de sus usuarios?",
        respuesta_guia: "Los algoritmos están diseñados para maximizar la retención: muestran contenido que provoca reacciones emocionales fuertes y que refuerza las creencias previas del usuario. Esto crea cámaras de eco o burbujas de filtro: cada usuario ve una versión del mundo seleccionada por el algoritmo según su historial de interacciones. Como resultado, personas con diferentes puntos de vista pueden tener percepciones radicalmente distintas de los mismos eventos, lo que dificulta el diálogo y facilita la polarización.",
      },
      {
        pregunta: "¿Qué es la performatividad de la identidad digital y por qué puede generar presiones en los jóvenes?",
        respuesta_guia: "La performatividad digital es la gestión cuidadosa de la imagen que se proyecta en las redes sociales: seleccionar qué mostrar, cómo editarlo y para qué audiencia. Los jóvenes construyen identidades distintas en distintas plataformas y mantienen una brecha entre la identidad presentada y la vivida. Esto genera presiones porque implica comparación constante con versiones idealizadas de los demás, búsqueda de aprobación (likes, seguidores) y ansiedad por mantener una imagen coherente. En la adolescencia, cuando la identidad está en formación, estas presiones son especialmente intensas.",
      },
      {
        pregunta: "¿Qué es un deepfake y por qué representa un riesgo para la vida democrática y la información pública?",
        respuesta_guia: "Un deepfake es un video o audio manipulado con inteligencia artificial que hace parecer que una persona dijo o hizo algo que nunca ocurrió. Representa un riesgo democrático porque puede usarse para desacreditar a candidatos, figuras públicas o activistas, difundir noticias falsas con apariencia de autenticidad y manipular la opinión pública en momentos electorales o de crisis. Su accesibilidad creciente y la dificultad de detección hacen que la alfabetización mediática crítica sea indispensable.",
      },
      {
        pregunta: "Según el texto, ¿en qué consiste la brecha digital de género en México y por qué no es de origen biológico?",
        respuesta_guia: "La brecha digital de género no es solo de acceso (que se ha reducido), sino de tipo de uso: las mujeres usan más las plataformas para comunicación y entretenimiento, mientras los hombres tienen mayor uso laboral, educativo y de programación. El texto señala que esta diferencia no es biológica sino resultado de socializaciones distintas (a los niños se les alienta más a usar tecnología con fines productivos), estereotipos de género en la educación tecnológica y la subrepresentación de mujeres en el diseño y desarrollo de plataformas. Es una brecha construida culturalmente y, por tanto, transformable.",
      },
    ],
  },

  {
    // P02 — video_con_preguntas: brecha digital de género y producción ética de contenidos
    url_video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    titulo_video: "Brecha digital de género y producción ética de contenidos digitales",
    tiempo_segundos: 780,
    preguntas: [
      {
        pregunta: "¿Qué es la brecha digital de género y cómo se manifiesta en México según las estadísticas del INEGI?",
        opciones: [
          "Es solo una diferencia en el acceso a dispositivos entre hombres y mujeres",
          "Es la diferencia en acceso, tipo de uso, habilidades digitales y representación en los sectores tecnológicos, que afecta desproporcionadamente a las mujeres",
          "Es un problema exclusivo de comunidades rurales sin electricidad",
          "Es una brecha que ya fue superada gracias a la expansión de internet móvil",
        ],
        respuesta_correcta: "Es la diferencia en acceso, tipo de uso, habilidades digitales y representación en los sectores tecnológicos, que afecta desproporcionadamente a las mujeres",
        explicacion: "La brecha digital de género es multidimensional: incluye diferencias en acceso (equipos, conectividad), en tipo de uso (las mujeres usan más redes sociales para comunicación personal; los hombres, para trabajo y programación), en habilidades digitales avanzadas y en representación en la industria tecnológica. El INEGI documenta estas diferencias en la ENDUTIH, y organismos como ONU Mujeres señalan que la brecha se profundiza en zonas rurales e indígenas de México.",
      },
      {
        pregunta: "¿Qué significa producir contenidos digitales desde una perspectiva ética y con equidad de género?",
        opciones: [
          "Publicar solo contenidos positivos y evitar toda crítica social",
          "Usar lenguaje incluyente, representar diversidad de cuerpos, identidades y roles, evitar estereotipos de género y respetar el consentimiento y la privacidad de las personas",
          "Usar fotografías de alta calidad y contratar diseñadores profesionales",
          "Publicar solo contenidos aprobados por autoridades educativas",
        ],
        respuesta_correcta: "Usar lenguaje incluyente, representar diversidad de cuerpos, identidades y roles, evitar estereotipos de género y respetar el consentimiento y la privacidad de las personas",
        explicacion: "La producción ética de contenidos digitales con perspectiva de género implica: usar lenguaje incluyente que no invisibilice a mujeres y disidencias; representar diversidad real (cuerpos, edades, colores de piel, roles no estereotipados); obtener consentimiento antes de publicar imágenes de otras personas; evitar cosificación y estereotipos; dar crédito a las fuentes (especialmente a creadoras mujeres frecuentemente invisibilizadas). Esto no es solo ética individual: tiene impacto en la cultura digital colectiva.",
      },
      {
        pregunta: "¿Qué son las licencias Creative Commons y por qué son relevantes para la producción ética de contenidos digitales?",
        opciones: [
          "Son licencias de software libre para programadores",
          "Son un sistema de licencias que permite a los creadores indicar qué usos autorizan de su obra, facilitando la reutilización legal y el respeto a la autoría",
          "Son certificados académicos para profesionales del diseño digital",
          "Son permisos de publicidad para plataformas comerciales",
        ],
        respuesta_correcta: "Son un sistema de licencias que permite a los creadores indicar qué usos autorizan de su obra, facilitando la reutilización legal y el respeto a la autoría",
        explicacion: "Las licencias Creative Commons (CC) permiten a los creadores especificar bajo qué condiciones otros pueden usar su trabajo: si pueden modificarlo, si deben dar crédito, si pueden usarlo comercialmente o no. Son fundamentales en la producción ética de contenidos porque evitan el plagio, facilitan el uso de recursos de libre acceso (imágenes, música, textos CC) y promueven una cultura de respeto a la autoría. Usar imágenes o música sin verificar su licencia es uno de los errores más comunes en producción digital.",
      },
      {
        pregunta: "¿Por qué los estereotipos de género en los contenidos digitales tienen un impacto mayor que en los medios tradicionales?",
        opciones: [
          "Porque los contenidos digitales son más baratos de producir y distribuir",
          "Porque los contenidos digitales se consumen de forma más pasiva que los medios tradicionales",
          "Porque los algoritmos amplifican y personalizan la exposición a contenidos, multiplicando el impacto de los estereotipos al mostrarlos repetidamente a audiencias específicas",
          "Porque los jóvenes no tienen acceso a medios tradicionales como televisión o radio",
        ],
        respuesta_correcta: "Porque los algoritmos amplifican y personalizan la exposición a contenidos, multiplicando el impacto de los estereotipos al mostrarlos repetidamente a audiencias específicas",
        explicacion: "Los algoritmos de recomendación aprenden qué tipo de contenido genera más interacción y lo amplifican. Si un usuario interactúa con contenidos que reproducen estereotipos de género (roles femeninos domésticos, masculinidad agresiva, cuerpos idealizados), el algoritmo mostrará más de eso, creando una exposición acumulativa. A diferencia de la televisión (que programa para audiencias amplias), los algoritmos personalizan y profundizan la exposición a ciertos tipos de contenido, potenciando el efecto de los estereotipos.",
      },
    ],
  },

  {
    // P03 — infografia: profesiones digitales en México con perspectiva de género
    titulo: "Profesiones digitales en México: panorama con perspectiva de género",
    descripcion_accesible: "Infografía sobre el panorama de profesiones y carreras en el sector digital en México, incluyendo datos sobre la brecha de género en STEM, referentes de mujeres mexicanas en tecnología, universidades y bootcamps accesibles, y rangos salariales aproximados por área.",
    url_imagen: "/placeholder/infografia.svg",
    puntos_clave: [
      "Principales áreas profesionales digitales en México: Desarrollo de software (frontend, backend, fullstack), Diseño UX/UI, Ciencia de datos e inteligencia artificial, Ciberseguridad, Marketing digital y gestión de comunidades, y Producción de contenidos digitales. Todas estas áreas tienen alta demanda laboral y salarios competitivos (de $12,000 a $60,000 MXN mensuales según experiencia y especialización), y pueden accederse desde bachillerato a través de bootcamps, cursos en línea gratuitos (MOOC) y carreras universitarias.",
      "Brecha de género en STEM en México: Según datos de la ANUIES (Asociación Nacional de Universidades e Instituciones de Educación Superior), las mujeres representan solo el 25-30% de las personas matriculadas en carreras de ingeniería y tecnología en México. En el sector de programación y desarrollo de software, esa proporción cae aún más: estimaciones de la industria señalan que menos del 20% de los desarrolladores de software en México son mujeres. Esta brecha no refleja diferencias de capacidad sino de acceso, socialización y representación.",
      "Referentes de mujeres mexicanas y latinoamericanas en tecnología: Fátima Treviño, cofundadora de la plataforma educativa Clip y referente en emprendimiento tecnológico; las científicas del Instituto de Investigaciones en Matemáticas Aplicadas y en Sistemas (IIMAS-UNAM) que trabajan en IA y ciencia de datos; la comunidad Women Who Code México y Laboratoria, organización latinoamericana que ha formado a miles de mujeres como programadoras y desarrolladoras de software en condiciones de vulnerabilidad socioeconómica.",
      "Opciones de formación accesibles en México: Universidades públicas (UNAM, IPN, UAM, universidades tecnológicas estatales) ofrecen carreras en Computación, Sistemas, Ciencias de la Información e Ingeniería en Tecnologías de la Información. Bootcamps con modelo deferred payment (pagas cuando consigues trabajo): Platzi, Bedu, Ironhack México, Wizeline Academy. MOOCs gratuitos: Google Activate, Microsoft Learn, Coursera (con becas disponibles), edX, Khan Academy. Programas de certificación profesional: AWS, Google Cloud, Cisco, Meta y otras empresas ofrecen certificaciones reconocidas internacionalmente.",
      "Habilidades del siglo XXI más demandadas en el sector digital: Pensamiento computacional y resolución de problemas, alfabetización en datos (leer, interpretar y comunicar datos), diseño centrado en el usuario (UX), colaboración en equipos distribuidos y multidisciplinarios, comunicación digital efectiva, ética en el manejo de datos y privacidad digital. Estas habilidades no son exclusivas de profesionales de tecnología: son transversales a todas las carreras en la economía digital.",
      "Iniciativas para cerrar la brecha de género en tecnología en México: El programa 'Niñas en Tecnología' de la Fundación Televisa y Plan International México, que ha llegado a más de 10,000 niñas y adolescentes en comunidades con baja conectividad. Las becas 'Mujeres en Tecnología' del INADEM y programas equivalentes en universidades tecnológicas. La Red Nacional de Mujeres en Ciencias y Tecnología del CONACYT (hoy CONAHCYT), que promueve mentorías entre estudiantes y profesionales.",
    ],
    fuente: "Material CEN Bachillerato — CD-III. Ref.: ANUIES 2023, Laboratoria 2024, CONAHCYT, Google Activate.",
  },

  {
    // P04 — lectura: participación ciudadana digital
    titulo: "Participación ciudadana digital: del activismo en línea al cambio real",
    texto: "La tecnología digital ha transformado profundamente las formas en que los ciudadanos participan en la vida pública. Peticiones en línea, campañas en redes sociales, colectivos organizados por WhatsApp, manifestaciones convocadas por Twitter o Instagram: estas prácticas son parte cotidiana de la vida política de millones de mexicanos, especialmente de las generaciones más jóvenes que crecieron con internet como parte de su entorno natural.\n\nEn México, algunos de los movimientos sociales más importantes de la última década se organizaron y amplificaron gracias a las redes sociales. El movimiento #MeToo llegó a México en 2019-2020 con una ola de denuncias públicas de acoso y abuso sexual en universidades, medios de comunicación y círculos culturales. Las listas de acosadores publicadas en Twitter y los testimonios compartidos en redes sociales rompieron el silencio que por décadas protegió a los agresores y abrieron debates públicos sobre la cultura del abuso en distintas instituciones. El movimiento #UnDíaSinNosotras del 9 de marzo de 2020 convocó a un paro nacional de mujeres que tuvo una organización masiva en redes sociales y movilizó a millones de mujeres en todo el país.\n\nLas comunidades digitales pueden tener impactos concretos en la realidad más allá de las tendencias en redes. Tras el sismo del 19 de septiembre de 2017, las redes sociales y aplicaciones de mensajería coordinaron en tiempo real las labores de rescate, la distribución de víveres y la localización de personas atrapadas. Equipos de voluntarios usaron Google Maps y plataformas colaborativas para mapear los edificios dañados y las necesidades urgentes de cada colonia. Colectivas feministas han construido redes de apoyo mutuo digitales para acompañar a víctimas de violencia de género, compartir información sobre albergues y recursos legales, y coordinar acciones de incidencia política.\n\nLa metodología de proyectos comunitarios permite canalizar estas energías colectivas hacia soluciones sostenibles. Un proyecto de participación comunitaria digital bien diseñado sigue cuatro etapas: primero, el diagnóstico participativo, que consiste en identificar colectivamente el problema que se quiere resolver, escuchando a quienes lo viven; segundo, el diseño, que implica definir la solución digital apropiada, los recursos necesarios y los actores involucrados; tercero, la implementación, que es la puesta en marcha de la solución con evaluación continua; y cuarto, la evaluación del impacto, que mide si la solución resolvió el problema y qué se puede mejorar.\n\nHerramientas digitales colaborativas facilitan el trabajo en equipo para estos proyectos. Trello y Notion son plataformas de gestión de proyectos que permiten organizar tareas, asignar responsabilidades y hacer seguimiento del avance. Google Workspace (Docs, Sheets, Slides, Forms) permite crear y editar documentos colaborativamente en tiempo real. Los repositorios de código abierto en GitHub permiten compartir y desarrollar colectivamente herramientas tecnológicas. Canva y Adobe Express facilitan la producción de contenidos visuales para comunicar el proyecto a la comunidad.\n\nEs importante distinguir entre el activismo digital genuino y el slacktivism: la tendencia a sentirse satisfecho con acciones digitales de bajo costo (compartir una publicación, firmar una petición en línea) sin comprometerse con acciones concretas fuera de las pantallas. Los movimientos sociales más efectivos combinan la movilización digital con la organización en el territorio: se conocen en persona, construyen confianza, desarrollan capacidades colectivas y generan cambios en las instituciones y las políticas. La tecnología es una herramienta poderosa de organización, pero no reemplaza la acción comunitaria directa.",
    fuente: "Material CEN Bachillerato — CD-III. Ref.: #UnDíaSinNosotras 2020; 19S CDMX 2017; Change.org México; Avaaz.",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 13,
    preguntas_comprension: [
      {
        pregunta: "¿Cómo utilizaron las redes sociales los movimientos #MeToo y #UnDíaSinNosotras en México y qué impacto concreto tuvieron?",
        respuesta_guia: "El #MeToo mexicano usó Twitter para publicar listas de acosadores y compartir testimonios de víctimas en universidades, medios y círculos culturales, rompiendo el silencio institucional que protegía a los agresores y abriendo debates públicos. #UnDíaSinNosotras coordinó en redes sociales un paro nacional de mujeres el 9 de marzo de 2020, logrando una movilización masiva con cobertura nacional. Ambos movimientos mostraron que las redes pueden amplificar voces históricamente silenciadas y presionar a instituciones para rendir cuentas.",
      },
      {
        pregunta: "¿Cómo se usaron las herramientas digitales para coordinar la respuesta al sismo del 19S en la Ciudad de México?",
        respuesta_guia: "Tras el sismo de 2017, voluntarios usaron redes sociales y aplicaciones de mensajería para coordinar rescates en tiempo real, distribuir víveres y localizar personas atrapadas. Plataformas colaborativas como Google Maps permitieron mapear edificios dañados y necesidades urgentes por colonia. Esto mostró que las herramientas digitales pueden acelerar y organizar la respuesta comunitaria en emergencias, complementando (y a veces adelantándose) a los recursos institucionales.",
      },
      {
        pregunta: "¿Cuáles son las cuatro etapas de la metodología de proyectos comunitarios digitales y qué ocurre en cada una?",
        respuesta_guia: "1. Diagnóstico participativo: identificar colectivamente el problema escuchando a quienes lo viven. 2. Diseño: definir la solución digital apropiada, los recursos y los actores. 3. Implementación: poner en marcha la solución con evaluación continua. 4. Evaluación del impacto: medir si la solución resolvió el problema y qué se puede mejorar. Esta metodología garantiza que el proyecto responda a necesidades reales, no a suposiciones externas.",
      },
      {
        pregunta: "¿Qué es el slacktivism y por qué el texto señala que el activismo digital más efectivo combina la acción en línea con la organización territorial?",
        respuesta_guia: "El slacktivism es la tendencia a sentirse satisfecho con acciones digitales de bajo costo (compartir, firmar peticiones) sin comprometerse con acciones concretas fuera de pantallas. El texto señala que los movimientos más efectivos combinan la movilización digital (que amplifica y conecta) con la organización en el territorio (que construye confianza, desarrolla capacidades colectivas y genera cambios institucionales reales). La tecnología potencia la acción comunitaria pero no la reemplaza.",
      },
    ],
  },
];

// ── A2 ──────────────────────────────────────────────────────────────────────────
const contenidosA2 = [
  {
    // P01 — quiz_multiple_opcion: comunicación multimodal, identidad digital, algoritmos, desinformación, brecha digital
    preguntas: [
      {
        enunciado: "¿Qué es la comunicación digital multimodal?",
        opciones: [
          { id: "a", texto: "La comunicación que solo usa texto en plataformas digitales como el correo electrónico" },
          { id: "b", texto: "La integración de texto, imagen, audio, video y animación en un mismo mensaje digital, como ocurre en TikTok, Instagram o YouTube" },
          { id: "c", texto: "La comunicación que se realiza simultáneamente en múltiples países usando satélites" },
          { id: "d", texto: "El uso exclusivo de emojis y stickers como forma de comunicación en chats privados" },
        ],
        respuesta_correcta: "b",
        retroalimentacion: "La comunicación multimodal integra múltiples sistemas de signos en un mismo mensaje: texto escrito, imagen fija, video, audio, gráficos e hipervínculos. TikTok, Instagram Reels y YouTube son los ejemplos más claros: combinan narración verbal, música, imagen en movimiento, texto superpuesto y efectos visuales para crear mensajes que ningún medio anterior podía producir. Esta integración transforma tanto la producción como la recepción de los mensajes.",
      },
      {
        enunciado: "¿Para qué están diseñados principalmente los algoritmos de recomendación de plataformas como TikTok o YouTube?",
        opciones: [
          { id: "a", texto: "Para garantizar que los usuarios accedan a contenidos educativos de calidad verificada" },
          { id: "b", texto: "Para maximizar el tiempo que los usuarios pasan en la plataforma, mostrando contenido que genera reacciones emocionales fuertes" },
          { id: "c", texto: "Para proteger a los usuarios de la desinformación eliminando automáticamente las noticias falsas" },
          { id: "d", texto: "Para distribuir el contenido de manera igualitaria entre todos los creadores registrados" },
        ],
        respuesta_correcta: "b",
        retroalimentacion: "Los algoritmos de recomendación están optimizados para la retención de usuarios: su objetivo principal es que la persona pase el mayor tiempo posible en la plataforma. Para lograrlo, aprenden qué tipo de contenido genera más interacción (likes, comentarios, tiempo de visualización) y muestran más de ese contenido. Esto favorece los contenidos emocionalmente impactantes, las narrativas de conflicto y los contenidos que confirman creencias previas, independientemente de su veracidad o valor educativo.",
      },
      {
        enunciado: "¿Qué es una 'cámara de eco' o 'burbuja de filtro' en el contexto de las redes sociales?",
        opciones: [
          { id: "a", texto: "Una función de WhatsApp que permite escuchar mensajes de voz en privado sin auriculares" },
          { id: "b", texto: "El fenómeno por el que los algoritmos muestran a cada usuario contenido que refuerza sus creencias previas, creando entornos informativos donde solo se ven perspectivas similares a las propias" },
          { id: "c", texto: "Un efecto de audio utilizado en la producción de podcasts y videos de YouTube" },
          { id: "d", texto: "La tendencia de los usuarios a compartir información solo dentro de grupos privados de familia" },
        ],
        respuesta_correcta: "b",
        retroalimentacion: "La 'burbuja de filtro' (filter bubble), concepto acuñado por Eli Pariser, describe cómo los algoritmos de personalización crean entornos informativos individualizados donde cada usuario solo ve contenidos afines a sus intereses y creencias. Esto dificulta el encuentro con perspectivas distintas y puede reforzar sesgos, polarizar opiniones y dificultar el diálogo democrático. La cámara de eco es el resultado social: grupos que solo se comunican entre sí y refuerzan las mismas narrativas.",
      },
      {
        enunciado: "¿Qué es un deepfake y por qué representa un riesgo para la información pública en México?",
        opciones: [
          { id: "a", texto: "Es un tipo de filtro de Instagram que hace parecer que alguien está en un lugar diferente" },
          { id: "b", texto: "Es un contenido de video o audio manipulado con inteligencia artificial que hace parecer que una persona dijo o hizo algo que nunca ocurrió" },
          { id: "c", texto: "Es un virus informático que roba contraseñas de redes sociales" },
          { id: "d", texto: "Es una noticia falsa publicada en formato de texto que usa un lenguaje técnico para parecer verídica" },
        ],
        respuesta_correcta: "b",
        retroalimentacion: "Los deepfakes usan inteligencia artificial (redes neuronales generativas) para crear o manipular videos y audios de forma que resulten convincentes. En México, durante procesos electorales o en contextos de conflicto social, se han usado para difundir falsas declaraciones de políticos y figuras públicas. Su peligro es que son cada vez más difíciles de detectar y se difunden rápidamente en plataformas digitales antes de que puedan ser verificados o desmentidos.",
      },
      {
        enunciado: "Según el INEGI (ENDUTIH), ¿en qué aspecto persiste principalmente la brecha digital de género en México?",
        opciones: [
          { id: "a", texto: "En el acceso a electricidad en el hogar, ya que las mujeres tienen menos electricidad que los hombres" },
          { id: "b", texto: "En el tipo de uso de internet: las mujeres usan más plataformas de comunicación y entretenimiento, mientras los hombres presentan mayor uso laboral, educativo y de programación" },
          { id: "c", texto: "En el número de teléfonos móviles poseídos, ya que los hombres tienen significativamente más dispositivos" },
          { id: "d", texto: "En el acceso a internet en zonas urbanas, donde los hombres tienen conexión exclusiva a ciertos portales" },
        ],
        respuesta_correcta: "b",
        retroalimentacion: "La ENDUTIH del INEGI documenta que si bien la brecha de acceso a internet se ha reducido en México, persiste una brecha en el tipo de uso. Las mujeres tienden a usar más las plataformas para comunicación personal y entretenimiento; los hombres presentan mayor uso para trabajo, búsqueda de información económica, programación y gestión de negocios. Esta brecha de uso refleja diferencias en las habilidades digitales avanzadas y en la socialización tecnológica desde la infancia.",
      },
      {
        enunciado: "¿Cuál de las siguientes preguntas es propia de la alfabetización mediática crítica ante un contenido digital?",
        opciones: [
          { id: "a", texto: "'¿Cuántos likes tiene este video?' y '¿Lo compartieron personas que conozco?'" },
          { id: "b", texto: "'¿Quién produjo este contenido, con qué objetivo, qué se muestra y qué se omite, y qué emociones busca generar?'" },
          { id: "c", texto: "'¿Es el video de buena calidad de imagen y tiene buena música?'" },
          { id: "d", texto: "'¿Está publicado en una plataforma oficial del gobierno o de la escuela?'" },
        ],
        respuesta_correcta: "b",
        retroalimentacion: "La alfabetización mediática crítica implica un análisis sistemático de cualquier contenido: identificar quién lo produce (intereses, financiamiento), para qué (informar, persuadir, vender, entretener), qué evidencias presenta y cuáles omite, y qué respuesta emocional busca generar. La cantidad de likes o la popularidad no son indicadores de veracidad ni calidad informativa. Esta actitud crítica es necesaria para navegar de forma autónoma y responsable en el ecosistema digital actual.",
      },
    ],
  },

  {
    // P02 — simulacion: diseña una campaña digital inclusiva con perspectiva de género
    tipo_simulacion: "social" as const,
    descripcion_escenario: "Eres parte del equipo de comunicación digital de tu escuela o comunidad. El Comité Estudiantil te ha pedido diseñar una campaña digital para promover la participación igualitaria de mujeres y hombres en actividades extracurriculares (deportes, talleres de tecnología, ciencias, artes). Actualmente, los talleres de robótica y programación tienen menos del 15% de participación femenina. Tu campaña debe usar al menos dos plataformas digitales, tener perspectiva de género en su lenguaje e imágenes, y llegar a toda la comunidad escolar.",
    instrucciones: [
      "Define la audiencia objetivo de tu campaña: ¿a quiénes va dirigida principalmente? ¿Estudiantes, familias, docentes? ¿Hay un grupo específico al que quieres llegar (por ejemplo, niñas de primer grado)?",
      "Elige las plataformas digitales que usarás (máximo dos) y justifica por qué son las más adecuadas para llegar a tu audiencia en el contexto de tu escuela.",
      "Diseña el mensaje principal de tu campaña: ¿cuál es el nombre o eslogan? ¿Qué imagen o video imaginas como contenido central? ¿Cómo aseguras que el lenguaje y las imágenes sean incluyentes y eviten estereotipos de género?",
      "Define los indicadores de impacto: ¿cómo sabrás si tu campaña fue exitosa? Propón al menos dos indicadores concretos y medibles (por ejemplo: porcentaje de inscripciones femeninas en talleres de tecnología antes y después de la campaña).",
      "Identifica posibles obstáculos o resistencias que podría enfrentar tu campaña (por ejemplo: prejuicios de familias, falta de acceso a dispositivos, contenido que se percibe como 'político') y propón cómo los abordarías.",
    ],
    variables_a_explorar: [
      "Audiencia objetivo y segmentación por edad, género y acceso digital",
      "Plataformas digitales y su alcance real en la comunidad escolar",
      "Lenguaje incluyente y representación visual libre de estereotipos de género",
      "Indicadores cuantitativos y cualitativos de impacto de la campaña",
      "Gestión de resistencias y obstáculos en el contexto escolar",
    ],
    preguntas_reflexion: [
      "¿Qué diferencias encontraste entre diseñar una campaña 'neutral' y una campaña con perspectiva de género? ¿Qué decisiones cambiaron?",
      "¿Cómo influyó el contexto específico de tu escuela o comunidad en las decisiones que tomaste sobre plataforma, lenguaje e imágenes?",
      "¿Qué estereotipos de género tuviste que cuestionar activamente al diseñar los mensajes y las imágenes de tu campaña?",
      "¿Crees que una campaña digital es suficiente para cambiar la participación de género en los talleres? ¿Qué otras acciones complementarias serían necesarias?",
    ],
  },

  {
    // P03 — quiz_verdadero_falso: brecha de género en STEM, vocaciones digitales, mujeres en tecnología
    preguntas: [
      {
        enunciado: "Las mujeres representan aproximadamente el 50% de las personas matriculadas en carreras de ingeniería y tecnología en México, según la ANUIES.",
        respuesta: false,
        retroalimentacion: "Falso. Las mujeres representan solo entre el 25% y el 30% de las matriculaciones en carreras de ingeniería y tecnología en México, según datos de la ANUIES. En áreas específicas como programación y desarrollo de software, la representación femenina cae por debajo del 20%. Esta brecha no refleja diferencias de capacidad sino de socialización, acceso desigual y falta de modelos femeninos en el sector tecnológico.",
      },
      {
        enunciado: "Las habilidades requeridas para trabajar en el sector digital, como el pensamiento computacional o la ciencia de datos, son habilidades masculinas por naturaleza y las mujeres tienen menos predisposición biológica para desarrollarlas.",
        respuesta: false,
        retroalimentacion: "Falso. No existe ninguna evidencia científica de que las habilidades digitales o computacionales tengan base biológica de género. Las diferencias en tasas de participación y desempeño en áreas STEM se explican por factores sociales y culturales: socialización diferenciada desde la infancia, ausencia de modelos femeninos, sesgos en el sistema educativo y en los procesos de selección laboral. Organismos como la UNESCO y la OCDE han documentado que cuando se eliminan las barreras sociales, las diferencias de desempeño desaparecen.",
      },
      {
        enunciado: "Laboratoria es una organización latinoamericana que ha formado a miles de mujeres en programación y desarrollo de software, especialmente en contextos de vulnerabilidad socioeconómica.",
        respuesta: true,
        retroalimentacion: "Correcto. Laboratoria es una organización fundada en Perú con presencia en México, Colombia, Chile y Brasil que ofrece bootcamps de programación a mujeres en situación de vulnerabilidad, con un modelo de financiamiento de pago diferido (se paga cuando se consigue trabajo). Ha graduado a miles de desarrolladoras web en América Latina y tiene una tasa de empleabilidad superior al 80%. Es un referente de cómo cerrar la brecha digital de género con modelos educativos innovadores.",
      },
      {
        enunciado: "Una persona puede aprender programación, diseño UX o ciencia de datos sin estudiar una carrera universitaria de cuatro o cinco años, a través de bootcamps, plataformas MOOC y certificaciones profesionales.",
        respuesta: true,
        retroalimentacion: "Correcto. El mercado de trabajo digital en México y en el mundo reconoce cada vez más las habilidades demostradas por encima de los títulos universitarios. Bootcamps intensivos de 6 a 12 meses (como los de Platzi, Bedu, Ironhack o Laboratoria), certificaciones de empresas como Google, AWS, Meta o Cisco, y plataformas MOOC como Coursera o edX (muchas con becas disponibles) permiten adquirir habilidades laboralmente valoradas sin la inversión de tiempo y recursos que requiere una carrera tradicional.",
      },
      {
        enunciado: "El programa 'Niñas en Tecnología' en México ha llegado principalmente a niñas en zonas urbanas con alta conectividad, excluyendo a comunidades rurales o indígenas.",
        respuesta: false,
        retroalimentacion: "Falso. El programa 'Niñas en Tecnología', impulsado por la Fundación Televisa y Plan International México, tiene como foco específico las comunidades con baja conectividad y marginación, incluyendo zonas rurales e indígenas. Ha llegado a más de 10,000 niñas y adolescentes en estados con alta presencia indígena como Oaxaca, Chiapas y Guerrero, y trabaja con modelos de enseñanza offline que no requieren conexión constante a internet.",
      },
      {
        enunciado: "El diseño UX/UI (experiencia de usuario e interfaz de usuario) es una profesión del sector digital que combina habilidades de diseño visual, psicología cognitiva y comprensión de las necesidades de los usuarios.",
        respuesta: true,
        retroalimentacion: "Correcto. El diseño UX (User Experience) se enfoca en cómo se siente el usuario al interactuar con un producto digital: si es fácil de usar, si responde a sus necesidades, si genera satisfacción. El diseño UI (User Interface) se enfoca en los elementos visuales: colores, tipografía, íconos, disposición de elementos. Combina conocimientos de diseño gráfico, psicología cognitiva, investigación con usuarios y programación básica. Es una de las carreras digitales con mayor demanda en México y América Latina.",
      },
      {
        enunciado: "La brecha salarial de género en el sector tecnológico en México ha desaparecido completamente gracias a las políticas de igualdad implementadas por las empresas del sector.",
        respuesta: false,
        retroalimentacion: "Falso. La brecha salarial de género persiste en el sector tecnológico en México. Según estudios del IMCO y encuestas de plataformas como Glassdoor México, las mujeres en puestos de tecnología ganan en promedio entre un 15% y un 25% menos que sus colegas hombres con perfiles similares. Las brechas son más pronunciadas en posiciones de liderazgo y en empresas de tecnología emergente. La brecha salarial de género es una realidad estructural que ningún sector ha eliminado por completo en México.",
      },
    ],
  },

  {
    // P04 — simulacion: diseña un proyecto de participación comunitaria digital
    tipo_simulacion: "social" as const,
    descripcion_escenario: "Eres parte de un grupo de jóvenes del bachillerato que quiere resolver un problema de su comunidad o colonia usando tecnologías digitales. El problema puede ser: falta de acceso a información sobre servicios públicos, contaminación de un parque o río, inseguridad vial cerca de la escuela, abandono escolar temprano, o falta de espacios culturales para jóvenes. Deben diseñar un proyecto comunitario digital que incluya diagnóstico del problema, solución tecnológica, plan de implementación e indicadores de impacto.",
    instrucciones: [
      "Elige el problema comunitario que tu proyecto abordará. Descríbelo con precisión: ¿a quiénes afecta, con qué intensidad, en qué zona o espacio específico, desde cuándo existe y por qué no ha sido resuelto?",
      "Define la solución digital que propones: ¿es una aplicación, un sitio web, un canal de redes sociales, un mapa colaborativo, un bot de WhatsApp, una plataforma de peticiones? ¿Por qué esta tecnología es apropiada para este problema en este contexto?",
      "Planifica cómo involucrarías a la comunidad en el proyecto: ¿quiénes serían los aliados clave? ¿Cómo garantizarías que las personas más afectadas por el problema participen en el diseño de la solución y no solo sean 'beneficiarias'?",
      "Define tres indicadores concretos y medibles para evaluar el impacto de tu proyecto a los seis meses de implementación.",
      "Identifica los recursos que necesitarías (humanos, tecnológicos, financieros) y cómo podrías obtenerlos desde el bachillerato (alianzas con la escuela, gobierno local, organizaciones de la sociedad civil, empresas locales).",
    ],
    variables_a_explorar: [
      "Precisión del diagnóstico del problema comunitario y quiénes son los más afectados",
      "Pertinencia tecnológica: ¿la solución digital propuesta es accesible para la comunidad objetivo?",
      "Participación comunitaria: ¿el diseño incorpora la voz de quienes viven el problema?",
      "Indicadores de impacto: ¿son medibles, realistas y relevantes para el problema elegido?",
      "Viabilidad de recursos desde el contexto del bachillerato",
    ],
    preguntas_reflexion: [
      "¿Cómo te aseguraste de que tu solución es accesible para todas las personas de la comunidad, incluyendo las que tienen menos acceso a tecnología o conectividad?",
      "¿Qué diferencia hay entre una solución que la comunidad usa pasivamente y una en la que la comunidad participa activamente como co-creadora?",
      "¿Cómo distinguirías entre un activismo digital superficial (slacktivism) y un proyecto de transformación comunitaria real con tecnología?",
    ],
  },
];

// ── A3 ──────────────────────────────────────────────────────────────────────────
const contenidosA3 = [
  {
    // P01 — debate_estructurado: ¿Las redes sociales construyen o destruyen la identidad de los jóvenes?
    tema: "¿Las redes sociales construyen o destruyen la identidad de los jóvenes?",
    posturas: [
      "Las redes sociales destruyen la identidad de los jóvenes: generan dependencia de la aprobación externa, promueven identidades artificiales y performativas, amplifican la ansiedad social y exponen a los jóvenes a contenidos dañinos, acoso y presión de imagen corporal.",
      "Las redes sociales contribuyen a construir la identidad de los jóvenes: ofrecen espacios de expresión, conexión con comunidades de pertenencia, acceso a perspectivas diversas y herramientas para el activismo y la participación social activa.",
    ],
    argumentos_guia: {
      "destruyen_identidad": [
        "Las redes sociales fomentan la comparación social constante con versiones idealizadas de otras personas (imágenes filtradas, vidas curadas), lo que genera insatisfacción con la propia imagen y baja autoestima, especialmente en adolescentes cuya identidad está en formación.",
        "El sistema de validación por likes y seguidores convierte la identidad en un producto de consumo: los jóvenes ajustan su personalidad, apariencia y opiniones para maximizar la aprobación externa, alejándose de una identidad auténtica construida desde valores propios.",
        "Los algoritmos de TikTok e Instagram amplifican contenidos de belleza y cuerpo que promueven estándares inalcanzables, contribuyendo a trastornos de conducta alimentaria, dismorfia corporal y ansiedad, especialmente en mujeres jóvenes. Estudios de la propia Meta (filtrados en 2021) reconocieron este impacto.",
        "La exposición al ciberacoso y al odio en línea puede ser devastadora para la identidad en desarrollo: comentarios anónimos violentos, campañas de humillación pública y exclusión digital afectan la salud mental y la autoconfianza de los jóvenes.",
      ],
      "construyen_identidad": [
        "Las redes sociales ofrecen a los jóvenes espacios de expresión que no existían antes: publicar arte, música, ideas políticas o reflexiones personales y recibir respuesta de audiencias que comparten esos intereses permite a los jóvenes explorar y afirmar aspectos de su identidad.",
        "Las comunidades digitales conectan a jóvenes con grupos de pertenencia que pueden no existir en su entorno físico inmediato: jóvenes LGBTQ+ en comunidades conservadoras, jóvenes con intereses académicos o artísticos poco valorados en su escuela, jóvenes indígenas que conectan con su cultura. Estas comunidades fortalecen la identidad.",
        "Las redes sociales han amplificado movimientos juveniles de transformación social: #MeToo, #FridaysForFuture, #BlackLivesMatter mostraron que los jóvenes pueden usar las plataformas digitales para construir identidades ciudadanas activas y comprometidas con causas más amplias que el yo individual.",
        "El acceso a perspectivas diversas que ofrecen las redes puede ampliar los horizontes identitarios: conocer otras culturas, otras formas de vida, otras ideas políticas y filosóficas enriquece el proceso de construcción de identidad propia.",
      ],
    },
    reglas: [
      "Argumentar con ejemplos concretos: mencionar plataformas específicas, estudios o casos reales en lugar de generalidades",
      "Escuchar completamente al lado contrario antes de responder; no interrumpir",
      "Distinguir entre el uso específico que hacen ciertos jóvenes de las redes y el efecto general de las plataformas como infraestructuras diseñadas con ciertos objetivos",
      "No usar argumentos de autoridad sin sustento: decir 'los científicos dicen' sin especificar quiénes o qué dijeron no es un argumento válido",
      "Al cierre, cada participante debe señalar qué argumento del lado contrario le pareció más sólido y por qué",
    ],
    tiempo_argumentacion_minutos: 15,
  },

  {
    // P02 — reflexion_escrita: evitar estereotipos de género en contenidos digitales
    prompt: "¿Cómo puedo asegurar que los contenidos digitales que produzco no reproducen estereotipos de género y contribuyen activamente a la inclusión? Reflexiona sobre decisiones concretas de lenguaje, representación visual, selección de temas y formas de interacción con la audiencia.",
    longitud_minima_palabras: 120,
    pistas: [
      "¿Qué tipo de imágenes o videos usas? ¿Representan diversidad de cuerpos, edades, colores de piel y roles de género, o tienden a mostrar siempre los mismos tipos de personas en los mismos roles?",
      "¿El lenguaje que usas en tus publicaciones incluye a personas de todos los géneros, o invisibiliza a mujeres y disidencias por defecto?",
      "¿Cómo respondes a comentarios que reproducen estereotipos o violencia de género en tus publicaciones? ¿Tienes una postura activa o pasiva ante eso?",
      "¿Conoces creadoras de contenido que trabajen con perspectiva de género? ¿Qué decisiones toman que podrías incorporar en tu propio trabajo?",
    ],
    criterios_evaluacion: [
      "Identifica al menos dos decisiones concretas de producción (lenguaje, imágenes, temas) relacionadas con la perspectiva de género",
      "Reflexiona sobre la diferencia entre no reproducir estereotipos pasivamente y contribuir activamente a la inclusión",
      "Conecta sus reflexiones con situaciones o contenidos digitales que ha producido o podría producir en su contexto",
      "Escribe con claridad y desarrolla las ideas con profundidad suficiente",
    ],
  },

  {
    // P03 — autoevaluacion: mis fortalezas y vocación para las tecnologías digitales
    criterios: [
      {
        descripcion: "Me interesa explorar cómo funcionan las tecnologías digitales (aplicaciones, algoritmos, redes, dispositivos) más allá de usarlas como consumidor.",
        escala: [
          { valor: 1, etiqueta: "Nada", descripcion: "No siento ningún interés en entender cómo funcionan las tecnologías; prefiero simplemente usarlas." },
          { valor: 2, etiqueta: "Poco", descripcion: "A veces me pregunto cómo funcionan, pero no lo exploro activamente ni busco aprenderlo." },
          { valor: 3, etiqueta: "Bastante", descripcion: "Me interesa regularmente entender el funcionamiento de las tecnologías y busco información sobre ello con cierta frecuencia." },
          { valor: 4, etiqueta: "Mucho", descripcion: "Tengo una curiosidad activa y constante sobre cómo funcionan las tecnologías; busco aprenderlo por cuenta propia." },
        ],
      },
      {
        descripcion: "Tengo habilidades digitales que van más allá del uso de redes sociales: sé crear contenidos, editar imágenes o video, usar hojas de cálculo, o tengo nociones básicas de programación o diseño.",
        escala: [
          { valor: 1, etiqueta: "Nada", descripcion: "Solo uso redes sociales y aplicaciones básicas de comunicación; no he explorado otras herramientas digitales." },
          { valor: 2, etiqueta: "Poco", descripcion: "He usado algunas herramientas digitales adicionales (Canva, Google Docs, iMovie) pero de forma muy básica y sin mucha confianza." },
          { valor: 3, etiqueta: "Bastante", descripcion: "Manejo con confianza varias herramientas digitales de creación o productividad y podría enseñar a otros a usarlas." },
          { valor: 4, etiqueta: "Mucho", descripcion: "Tengo habilidades digitales avanzadas: edición de video profesional, programación básica, diseño gráfico, manejo de datos o similares." },
        ],
      },
      {
        descripcion: "Estoy dispuesto o dispuesta a dedicar tiempo a aprender programación, diseño, ciencia de datos u otra habilidad digital avanzada si tuviera acceso a un curso o recurso adecuado.",
        escala: [
          { valor: 1, etiqueta: "Nada", descripcion: "No me llama la atención aprender esas habilidades; no las veo relevantes para mi vida o mis intereses." },
          { valor: 2, etiqueta: "Poco", descripcion: "Podría intentarlo si fuera obligatorio, pero no lo buscaría por iniciativa propia ni le dedicaría mucho tiempo." },
          { valor: 3, etiqueta: "Bastante", descripcion: "Me gustaría aprender y estaría dispuesto a dedicarle tiempo regularmente si encontrara un recurso accesible y motivador." },
          { valor: 4, etiqueta: "Mucho", descripcion: "Ya estoy buscando o aprendiendo activamente alguna habilidad digital avanzada, o tengo un plan concreto para hacerlo próximamente." },
        ],
      },
      {
        descripcion: "Me identifico con alguna área del campo digital (programación, diseño, datos, ciberseguridad, producción de contenidos, marketing digital) como una posible vocación o área de desarrollo profesional.",
        escala: [
          { valor: 1, etiqueta: "Nada", descripcion: "No veo ninguna área digital como una vocación; mis intereses están en otros campos completamente distintos." },
          { valor: 2, etiqueta: "Poco", descripcion: "Hay alguna área digital que me llama un poco la atención, pero no la considero seriamente como opción profesional." },
          { valor: 3, etiqueta: "Bastante", descripcion: "Me identifico con una o dos áreas digitales y las considero opciones reales para mi trayectoria profesional futura." },
          { valor: 4, etiqueta: "Mucho", descripcion: "Tengo clara una vocación en el campo digital y ya estoy tomando pasos concretos para desarrollarme en ella (cursos, proyectos, lecturas)." },
        ],
      },
    ],
    reflexion_final_prompt: "¿En qué área digital te ves desarrollándote profesionalmente y qué pasos concretos puedes dar en el bachillerato para avanzar hacia esa vocación?",
  },

  {
    // P04 — reflexion_escrita: diseño de proyecto de transformación comunitaria
    prompt: "Describe el problema comunitario que identificaste, la solución digital que diseñarías para abordarlo, cómo involucrarías activamente a tu comunidad en el proceso (no solo como beneficiaria sino como co-creadora), y cómo medirías el impacto real de tu proyecto a los seis meses de implementación.",
    longitud_minima_palabras: 150,
    pistas: [
      "¿El problema que elegiste lo conoces de primera mano o lo identificaste por observación directa de tu colonia, escuela o comunidad? ¿A quiénes afecta más?",
      "¿Por qué la solución digital que propones es más adecuada que otras soluciones no digitales para este problema específico? ¿Qué ventaja concreta ofrece la tecnología en este caso?",
      "¿Cómo te asegurarías de que las personas más afectadas por el problema participen en el diseño de la solución y no solo reciban el resultado? ¿Qué mecanismos de participación usarías?",
      "¿Tus indicadores de impacto miden cambios reales en la situación del problema, o solo miden la actividad del proyecto (como número de visitas al sitio web)? ¿Cuál es la diferencia?",
    ],
    criterios_evaluacion: [
      "Describe un problema comunitario concreto, específico y contextualizado en su entorno real",
      "Propone una solución digital justificada: explica por qué esa tecnología es apropiada para ese problema y ese contexto",
      "Plantea mecanismos concretos de participación comunitaria activa en el diseño o implementación",
      "Define indicadores de impacto que midan cambios reales en el problema, no solo actividad del proyecto",
    ],
  },
];

main().catch((err) => { console.error("❌ Error fatal:", err.message); process.exit(1); });
