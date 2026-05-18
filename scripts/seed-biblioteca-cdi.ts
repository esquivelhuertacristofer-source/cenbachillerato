/**
 * Seed script — Biblioteca Cultura Digital I (CD-I)
 * Ejecutar: npx ts-node scripts/seed-biblioteca-cdi.ts
 * Requiere: 05_biblioteca.sql ejecutada en Supabase
 * NO ejecutar hasta tener la migración aplicada.
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../.env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const UAC_CODIGO = "CD-I";

const FICHAS = [
  {
    slug: "cd-i-que-es-cultura-digital",
    titulo: "¿Qué es la Cultura Digital?",
    categoria: "Fundamentos",
    tiempo_lectura_minutos: 5,
    conceptos_clave: ["cultura digital", "ciudadanía digital", "sociedad de la información", "brecha digital"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "La cultura digital es el conjunto de prácticas, valores, habilidades y conocimientos que las personas desarrollan al interactuar con las tecnologías de la información y la comunicación (TIC). No se trata solo de saber usar un dispositivo, sino de comprender el impacto social, ético y creativo de vivir en un mundo digitalizado." },
        { tipo: "subtitulo", contenido: "Dimensiones de la cultura digital" },
        { tipo: "lista", items: ["Acceso: disponibilidad de tecnología e internet", "Alfabetización digital: capacidad de usar herramientas digitales eficazmente", "Participación: creación de contenidos y colaboración en línea", "Ciudadanía digital: ejercer derechos y responsabilidades en el mundo digital"] },
        { tipo: "callout", variante: "importante", contenido: "Tener un teléfono inteligente no equivale automáticamente a tener cultura digital. La cultura digital implica usar la tecnología de manera consciente, crítica, ética y creativa." },
        { tipo: "parrafo", contenido: "La brecha digital es la diferencia en el acceso y uso de las TIC entre personas, comunidades o países. En México, factores como el nivel socioeconómico, la ubicación geográfica y el nivel educativo influyen en esta brecha. Reducirla es una prioridad del sistema educativo nacional." },
        { tipo: "callout", variante: "sabias", contenido: "Según datos del INEGI (2023), aproximadamente 78 millones de mexicanos tienen acceso a internet, lo que representa cerca del 61% de la población. Sin embargo, solo el 40% de quienes se conectan lo hacen con habilidades digitales avanzadas." },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Infografía mostrando las cuatro dimensiones de la cultura digital: acceso, alfabetización, participación y ciudadanía", caption: "Las cuatro dimensiones de la cultura digital." },
      ],
    },
  },
  {
    slug: "cd-i-historia-de-internet",
    titulo: "Historia y Evolución de Internet",
    categoria: "Fundamentos",
    tiempo_lectura_minutos: 6,
    conceptos_clave: ["ARPANET", "Web 1.0", "Web 2.0", "Web 3.0", "Tim Berners-Lee"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "Internet nació como un proyecto militar y científico en los años 60. En 1969, la Agencia de Proyectos de Investigación Avanzada de Defensa de los Estados Unidos (ARPA) creó ARPANET, una red que permitía a las computadoras de distintas universidades compartir información. El primer mensaje enviado fue 'LO' — en realidad querían enviar 'LOGIN' pero el sistema colapsó." },
        { tipo: "subtitulo", contenido: "Las eras de la Web" },
        { tipo: "lista", items: [
          "Web 1.0 (1991–2004): páginas estáticas, solo se podía leer, sin interacción. El usuario era consumidor pasivo.",
          "Web 2.0 (2004–presente): plataformas interactivas, redes sociales, blogs, wikis. El usuario crea y comparte contenido.",
          "Web 3.0 (emergente): internet descentralizado, inteligencia artificial, blockchain, metaverso.",
        ] },
        { tipo: "callout", variante: "importante", contenido: "Tim Berners-Lee inventó la World Wide Web en 1989 como un sistema para compartir información científica entre investigadores. No la patentó: la entregó al mundo de forma gratuita, lo que permitió su explosivo crecimiento." },
        { tipo: "parrafo", contenido: "En México, internet llegó en 1989 cuando el Instituto Tecnológico de Estudios Superiores de Monterrey (ITESM) estableció la primera conexión. Para 1994, cuando el resto del mundo ya tenía el acceso más extendido, México apenas comenzaba su expansión digital." },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Línea de tiempo visual desde ARPANET en 1969 hasta la actualidad, marcando hitos como la WWW, Google, Facebook, iPhone y la IA", caption: "Evolución de internet desde 1969 hasta hoy." },
        { tipo: "callout", variante: "sabias", contenido: "En 2024, internet conecta a más de 5,400 millones de personas (67% de la humanidad). Cada minuto se envían 6 millones de mensajes en WhatsApp, se publican 500 horas de video en YouTube y se realizan 6 millones de búsquedas en Google." },
      ],
    },
  },
  {
    slug: "cd-i-seguridad-digital-basica",
    titulo: "Seguridad Digital: Protege tu Información",
    categoria: "Seguridad en línea",
    tiempo_lectura_minutos: 7,
    conceptos_clave: ["contraseña segura", "phishing", "autenticación de dos factores", "privacidad"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "En el mundo digital, nuestra información personal es uno de nuestros activos más valiosos. Los cibercriminales utilizan diversas técnicas para robar datos, suplantar identidades y cometer fraudes. Conocer estas amenazas y cómo protegerte es esencial para vivir con seguridad en internet." },
        { tipo: "subtitulo", contenido: "Contraseñas seguras" },
        { tipo: "parrafo", contenido: "Una contraseña segura debe tener al menos 12 caracteres y combinar letras mayúsculas y minúsculas, números y símbolos especiales. Evita usar nombres propios, fechas de cumpleaños o secuencias obvias como '123456'." },
        { tipo: "callout", variante: "importante", contenido: "'123456' fue la contraseña más usada en el mundo en 2023. Esta contraseña puede ser descifrada por un hacker en menos de 1 segundo. Usa un gestor de contraseñas como Bitwarden o 1Password para crear y guardar contraseñas fuertes." },
        { tipo: "subtitulo", contenido: "¿Qué es el phishing?" },
        { tipo: "parrafo", contenido: "El phishing es una técnica de engaño en la que los cibercriminales se hacen pasar por entidades confiables (bancos, servicios de streaming, gobierno) para robarte datos. Se presenta principalmente en correos electrónicos, mensajes de texto y redes sociales con enlaces falsos." },
        { tipo: "lista", items: [
          "Desconfía de mensajes urgentes que piden información personal",
          "Verifica siempre el dominio del sitio web (https:// + candado verde)",
          "No hagas clic en enlaces de correos no solicitados",
          "Si dudas, accede directamente al sitio oficial escribiendo la URL",
        ] },
        { tipo: "subtitulo", contenido: "Autenticación de dos factores (2FA)" },
        { tipo: "parrafo", contenido: "La 2FA agrega una capa adicional de seguridad: además de tu contraseña, necesitas un segundo factor (un código temporal que llega a tu teléfono, una app autenticadora, o tu huella digital). Actívala en todas tus cuentas importantes: correo, redes sociales y servicios bancarios." },
        { tipo: "callout", variante: "sabias", contenido: "Activar la autenticación de dos factores reduce en un 99.9% el riesgo de que tu cuenta sea hackeada, incluso si alguien conoce tu contraseña, según Microsoft." },
      ],
    },
  },
  {
    slug: "cd-i-derechos-digitales",
    titulo: "Derechos y Responsabilidades Digitales",
    categoria: "Ciudadanía Digital",
    tiempo_lectura_minutos: 6,
    conceptos_clave: ["derechos digitales", "privacidad", "libertad de expresión", "huella digital", "responsabilidad"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "Como ciudadanos digitales, tenemos derechos reconocidos por organismos internacionales y también responsabilidades que debemos cumplir. El mundo digital no es un espacio sin reglas: las leyes y principios éticos también aplican en internet." },
        { tipo: "subtitulo", contenido: "Tus derechos digitales" },
        { tipo: "lista", items: [
          "Derecho a la privacidad: protección de tus datos personales",
          "Derecho a la libertad de expresión: opinión libre sin censura arbitraria",
          "Derecho al acceso a internet: reconocido por la ONU desde 2016",
          "Derecho al olvido: solicitar que se eliminen datos sobre ti en buscadores",
          "Derecho a la seguridad digital: protección contra ataques y vigilancia ilegal",
        ] },
        { tipo: "callout", variante: "importante", contenido: "En México, la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) protege tu información. Las empresas deben pedirte permiso antes de usar tus datos y tienen obligación de protegerlos." },
        { tipo: "subtitulo", contenido: "La huella digital" },
        { tipo: "parrafo", contenido: "La huella digital es el rastro que dejamos al usar internet: búsquedas, publicaciones, me gusta, compras, ubicaciones. Esta huella puede ser permanente y accesible para empresas, empleadores y en algunos casos para cualquier persona. Todo lo que publicas en internet puede estar ahí para siempre." },
        { tipo: "callout", variante: "sabias", contenido: "Muchas universidades y empleadores revisan las redes sociales de los candidatos antes de aceptarlos. Tu perfil digital es parte de tu identidad y puede abrirte o cerrarte oportunidades. Cuídalo conscientemente." },
        { tipo: "subtitulo", contenido: "Responsabilidades en el espacio digital" },
        { tipo: "lista", items: [
          "No compartir información falsa o sin verificar",
          "Respetar los derechos de autor del contenido ajeno",
          "No participar en ciberacoso o comportamientos dañinos",
          "Proteger tu propia privacidad y la de los demás",
          "Reportar contenido ilegal o dañino a las plataformas",
        ] },
      ],
    },
  },
  {
    slug: "cd-i-redes-sociales-y-bienestar",
    titulo: "Redes Sociales y Bienestar Digital",
    categoria: "Ciudadanía Digital",
    tiempo_lectura_minutos: 6,
    conceptos_clave: ["redes sociales", "bienestar digital", "FOMO", "nomofobia", "uso consciente"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "Las redes sociales son herramientas poderosas para conectar, informar y crear comunidad. Sin embargo, su uso excesivo o no consciente puede tener impactos negativos en la salud mental, la autoestima y las relaciones personales. El bienestar digital implica usar la tecnología de manera equilibrada e intencional." },
        { tipo: "subtitulo", contenido: "Fenómenos psicológicos relacionados con las redes" },
        { tipo: "lista", items: [
          "FOMO (Fear Of Missing Out): miedo a perderse algo importante que otros están experimentando",
          "Nomofobia: ansiedad ante la ausencia del teléfono móvil",
          "Doomscrolling: consumo compulsivo de noticias negativas",
          "Comparación social: sentirse inferior al compararse con vidas 'perfectas' en redes",
        ] },
        { tipo: "callout", variante: "importante", contenido: "Las plataformas de redes sociales están diseñadas para maximizar el tiempo que pasas en ellas. Los algoritmos seleccionan el contenido que genera más reacciones (incluyendo el contenido que te molesta o preocupa) para mantenerte conectado más tiempo." },
        { tipo: "subtitulo", contenido: "Estrategias de bienestar digital" },
        { tipo: "lista", items: [
          "Establecer horarios sin pantalla (especialmente antes de dormir)",
          "Desactivar notificaciones no esenciales",
          "Practicar el 'ayuno digital': días o momentos sin redes",
          "Curar tu feed: seguir cuentas que te inspiren o informen positivamente",
          "Reflexionar: ¿cómo me siento después de usar redes? ¿Mejor o peor?",
        ] },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Persona usando el teléfono conscientemente mientras otro icono muestra notificaciones desactivadas y un reloj marcando límite de tiempo", caption: "El uso consciente de la tecnología mejora el bienestar." },
        { tipo: "callout", variante: "sabias", contenido: "Según estudios de la Universidad de Oxford, reducir el uso de redes sociales a 30 minutos diarios mejora significativamente los indicadores de bienestar mental, reduciendo la soledad y la depresión en jóvenes." },
      ],
    },
  },
  {
    slug: "cd-i-ciberacoso-y-violencia-digital",
    titulo: "Ciberacoso: Identificar, Prevenir y Actuar",
    categoria: "Seguridad en línea",
    tiempo_lectura_minutos: 7,
    conceptos_clave: ["ciberacoso", "cyberbullying", "grooming", "sexting", "denuncia"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "El ciberacoso o cyberbullying es el uso de medios digitales para acosar, amenazar, humillar o dañar a otra persona. A diferencia del acoso presencial, el ciberacoso puede ocurrir las 24 horas del día, los 7 días de la semana, y el contenido puede volverse viral y permanente." },
        { tipo: "subtitulo", contenido: "Tipos de violencia digital" },
        { tipo: "lista", items: [
          "Ciberacoso: hostigamiento, insultos, amenazas repetidas en línea",
          "Grooming: adultos que se hacen pasar por jóvenes para ganarse la confianza de menores con fines de abuso",
          "Sexting no consensual: difusión de imágenes íntimas sin permiso",
          "Exclusión digital: excluir intencionalmente a alguien de grupos en línea",
          "Doxing: publicar información personal de alguien sin su consentimiento",
        ] },
        { tipo: "callout", variante: "advertencia", contenido: "Difundir imágenes íntimas de otra persona sin su consentimiento es un delito en México tipificado en el Código Penal Federal (Art. 199 bis). Puede conllevar penas de 3 a 6 años de prisión. No importa quién las tomó ni cómo llegaron a tus manos." },
        { tipo: "subtitulo", contenido: "¿Qué hacer si sufres ciberacoso?" },
        { tipo: "lista", items: [
          "No respondas: responder puede escalar la situación",
          "Documenta: toma capturas de pantalla de las evidencias",
          "Bloquea: en todas las plataformas donde ocurre",
          "Reporta: a la plataforma y a un adulto de confianza",
          "Denuncia: ante la policía cibernética o la fiscalía de tu estado",
        ] },
        { tipo: "parrafo", contenido: "En México, la Policía Cibernética de la SSP atiende casos de violencia digital. También puedes contactar a la CONDUSEF (para fraudes financieros en línea) o al INAI (para violaciones a la privacidad de datos). No estás solo: buscar ayuda es un acto de valentía." },
        { tipo: "callout", variante: "importante", contenido: "Si eres testigo de ciberacoso, tienes el poder de ayudar. Reporta el contenido, apoya a la víctima en privado, no compartas ni reacciones al contenido dañino. Los testigos que actúan pueden detener el ciclo de violencia." },
      ],
    },
  },
  {
    slug: "cd-i-busqueda-de-informacion-y-pensamiento-critico",
    titulo: "Búsqueda de Información y Pensamiento Crítico en Internet",
    categoria: "Alfabetización Digital",
    tiempo_lectura_minutos: 7,
    conceptos_clave: ["búsqueda efectiva", "fuentes confiables", "fake news", "checado de datos", "CRAAP test"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "Internet contiene tanto información valiosa como desinformación peligrosa. La capacidad de buscar, evaluar y verificar información es una de las habilidades más importantes del siglo XXI. No todo lo que está en internet es verdad, y no toda fuente digital es confiable." },
        { tipo: "subtitulo", contenido: "Búsqueda efectiva en Google" },
        { tipo: "lista", items: [
          "Usa comillas para buscar frases exactas: \"calentamiento global causas\"",
          "Usa site: para buscar dentro de un sitio: site:gob.mx estadísticas educación",
          "Usa filetype: para buscar tipos de archivo: filetype:pdf informe OCDE",
          "Usa el operador - para excluir términos: python tutorial -videos",
        ] },
        { tipo: "callout", variante: "importante", contenido: "El test CRAAP evalúa la confiabilidad de una fuente: Currency (actualidad), Relevance (relevancia), Authority (autoridad del autor), Accuracy (precisión), Purpose (propósito). Aplícalo antes de citar cualquier fuente en trabajos escolares." },
        { tipo: "subtitulo", contenido: "¿Cómo identificar fake news?" },
        { tipo: "lista", items: [
          "Verifica quién publicó la información y cuándo",
          "Busca la misma noticia en 3 medios distintos y reconocidos",
          "Revisa si la imagen o video es auténtica (búsqueda inversa de imágenes en TinEye)",
          "Consulta verificadores de datos: Animal Político Verifica, Verificado.mx, AFP Factual",
          "Desconfía de titulares alarmistas, demasiado buenos o que apelan solo a emociones",
        ] },
        { tipo: "parrafo", contenido: "Las fake news se propagan 6 veces más rápido que las noticias verdaderas en redes sociales, según un estudio del MIT. Esto se debe a que el contenido falso suele ser más impactante, novedoso y emocionalmente estimulante que la realidad." },
        { tipo: "callout", variante: "sabias", contenido: "La búsqueda inversa de imágenes te permite verificar si una fotografía fue tomada en otro contexto o año diferente al que se dice. En Google Imágenes, haz clic derecho sobre una imagen y selecciona 'Buscar imagen en Google'." },
      ],
    },
  },
  {
    slug: "cd-i-productividad-digital",
    titulo: "Herramientas de Productividad Digital",
    categoria: "Herramientas Digitales",
    tiempo_lectura_minutos: 6,
    conceptos_clave: ["suite ofimática", "nube", "colaboración en línea", "Google Workspace", "Microsoft 365"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "Las herramientas de productividad digital son aplicaciones que facilitan la creación, organización y compartición de documentos, hojas de cálculo, presentaciones y más. En el entorno escolar y laboral actual, dominarlas es tan importante como saber leer y escribir." },
        { tipo: "subtitulo", contenido: "Suites de productividad principales" },
        { tipo: "lista", items: [
          "Google Workspace (Docs, Sheets, Slides, Drive, Forms, Meet): gratuito con cuenta Google, colaboración en tiempo real",
          "Microsoft 365 (Word, Excel, PowerPoint, OneDrive, Teams): versión web gratuita, estándar corporativo",
          "LibreOffice: software libre y gratuito, funciona sin internet, ideal cuando no hay conexión",
        ] },
        { tipo: "callout", variante: "importante", contenido: "La colaboración en tiempo real (varias personas editando el mismo documento simultáneamente) es una de las ventajas más poderosas de las suites en la nube. Permite trabajar en equipo sin necesidad de estar en el mismo lugar." },
        { tipo: "subtitulo", contenido: "Almacenamiento en la nube" },
        { tipo: "parrafo", contenido: "La nube (cloud) son servidores remotos donde se almacena información accesible desde cualquier dispositivo con internet. Google Drive, OneDrive, Dropbox e iCloud son ejemplos. Es recomendable usar la nube como respaldo de tus documentos importantes: si tu dispositivo falla, tu información está segura." },
        { tipo: "lista", items: [
          "Google Drive: 15 GB gratis por cuenta",
          "OneDrive: 5 GB gratis con cuenta Microsoft",
          "Dropbox: 2 GB gratis en el plan básico",
          "Mega: 20 GB gratis, encriptación de extremo a extremo",
        ] },
        { tipo: "callout", variante: "sabias", contenido: "La regla 3-2-1 de respaldo de datos: mantén 3 copias de tus archivos importantes, en 2 tipos de soporte diferentes (disco duro y nube), con 1 copia fuera del sitio principal (por ejemplo, en casa de un familiar). Así proteges tu información ante cualquier catástrofe." },
      ],
    },
  },
  {
    slug: "cd-i-creacion-de-contenido-digital",
    titulo: "Creación de Contenido Digital: Ser Prosumer",
    categoria: "Creación Digital",
    tiempo_lectura_minutos: 6,
    conceptos_clave: ["prosumer", "contenido digital", "derechos de autor", "Creative Commons", "licencias"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "Un prosumer (productor + consumidor) es quien no solo consume contenido digital sino que también lo crea y comparte. En la era de las redes sociales, todos podemos ser creadores de contenido: videos, podcasts, blogs, diseños, música, código. Esta capacidad trae consigo responsabilidades legales y éticas." },
        { tipo: "subtitulo", contenido: "Herramientas para crear contenido" },
        { tipo: "lista", items: [
          "Canva: diseño gráfico intuitivo (infografías, posters, presentaciones)",
          "CapCut / DaVinci Resolve: edición de video",
          "Audacity / GarageBand: grabación y edición de audio",
          "WordPress / Blogger: creación de blogs",
          "GitHub Pages: publicación de sitios web desde código",
        ] },
        { tipo: "callout", variante: "importante", contenido: "Todo contenido creado automáticamente tiene derechos de autor (copyright). Si usas una imagen, canción o texto de otro creador sin permiso, puedes infringir la ley aunque sea sin fines de lucro. Usa siempre contenido con licencias libres o pide permiso al autor." },
        { tipo: "subtitulo", contenido: "Licencias Creative Commons" },
        { tipo: "parrafo", contenido: "Creative Commons es un sistema de licencias que permiten a los creadores especificar cómo pueden usarse sus obras. Las licencias CC van desde las más permisivas (CC BY: solo dar crédito) hasta las más restrictivas (CC BY-NC-ND: solo ver, sin modificar ni usar comercialmente)." },
        { tipo: "lista", items: [
          "Unsplash y Pexels: fotografías gratuitas para uso libre",
          "Freesound: efectos de sonido y música Creative Commons",
          "Wikimedia Commons: imágenes y archivos de dominio público",
          "Google Fonts: tipografías de libre uso",
        ] },
        { tipo: "callout", variante: "sabias", contenido: "YouTube tiene un sistema de Content ID que detecta automáticamente el uso no autorizado de música y videos. Si usas una canción comercial en tu video, el canal del dueño puede reclamar los ingresos generados por ese video, aunque lo hayas subido sin fines de lucro." },
      ],
    },
  },
  {
    slug: "cd-i-pensamiento-computacional",
    titulo: "Pensamiento Computacional: Resolver Problemas como una Computadora",
    categoria: "Programación y Pensamiento Lógico",
    tiempo_lectura_minutos: 6,
    conceptos_clave: ["pensamiento computacional", "descomposición", "reconocimiento de patrones", "abstracción", "algoritmos"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "El pensamiento computacional es una forma de resolver problemas que utiliza los mismos principios que los informáticos al programar: descomponer problemas complejos, identificar patrones, abstraer lo esencial y diseñar pasos claros (algoritmos). No necesitas saber programar para aplicar el pensamiento computacional." },
        { tipo: "subtitulo", contenido: "Los cuatro pilares del pensamiento computacional" },
        { tipo: "lista", items: [
          "Descomposición: dividir un problema grande en partes pequeñas y manejables",
          "Reconocimiento de patrones: identificar similitudes y regularidades",
          "Abstracción: enfocarse solo en lo esencial, ignorar detalles innecesarios",
          "Diseño de algoritmos: crear una secuencia ordenada de pasos para resolver el problema",
        ] },
        { tipo: "callout", variante: "importante", contenido: "Un algoritmo es simplemente una lista de instrucciones claras y ordenadas para resolver un problema. La receta de cocina de tu abuela, las instrucciones para armar un mueble de IKEA y el GPS de tu teléfono funcionan todos con el mismo principio: un algoritmo." },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Diagrama que muestra los cuatro pilares del pensamiento computacional con ejemplos cotidianos de cada uno", caption: "El pensamiento computacional aplicado a situaciones de la vida diaria." },
        { tipo: "parrafo", contenido: "Ejemplo práctico: planear un cumpleaños usando pensamiento computacional. Descomposición: invitados, comida, decoración, lugar. Patrones: todos mis cumpleaños pasados tuvieron pastel. Abstracción: me enfoco en lo esencial (comida + personas), no en detalles de decoración. Algoritmo: 1. Confirmar asistentes, 2. Seleccionar menú, 3. Comprar, 4. Preparar, 5. Celebrar." },
        { tipo: "callout", variante: "sabias", contenido: "La Dra. Jeannette Wing, vicepresidenta de Microsoft Research, popularizó el término 'pensamiento computacional' en 2006 y argumentó que debería enseñarse junto con lectura, escritura y aritmética en todas las escuelas del mundo." },
      ],
    },
  },
  {
    slug: "cd-i-introduccion-a-la-programacion",
    titulo: "Introducción a la Programación: Tu Primera Línea de Código",
    categoria: "Programación y Pensamiento Lógico",
    tiempo_lectura_minutos: 7,
    conceptos_clave: ["programación", "lenguaje de programación", "Scratch", "Python", "variables", "funciones"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "La programación es la acción de escribir instrucciones que una computadora puede entender y ejecutar. Los lenguajes de programación son el medio de comunicación entre humanos y máquinas. Aprender a programar no es solo aprender una herramienta tecnológica: es desarrollar una forma de pensar lógica y creativa." },
        { tipo: "subtitulo", contenido: "Tipos de lenguajes de programación" },
        { tipo: "lista", items: [
          "Scratch: lenguaje visual por bloques, ideal para principiantes sin experiencia previa",
          "Python: legible y versátil, usado en ciencia de datos, inteligencia artificial y automatización",
          "JavaScript: lenguaje de la web, hace que las páginas sean interactivas",
          "HTML/CSS: no son lenguajes de programación sino de marcado y estilos, pero son la base de toda la web",
        ] },
        { tipo: "callout", variante: "importante", contenido: "No necesitas memorizar código. Los programadores profesionales buscan en Google e internet constantemente. Lo que importa es entender la lógica: qué problema estás resolviendo y cómo dividirlo en pasos que la computadora pueda ejecutar." },
        { tipo: "subtitulo", contenido: "Conceptos fundamentales de programación" },
        { tipo: "lista", items: [
          "Variable: espacio en la memoria para guardar un dato (nombre = 'Ana')",
          "Condicional: decisión basada en una condición (si edad > 18, entonces puede votar)",
          "Bucle: repetir una acción un número de veces (repetir 10 veces: avanzar un paso)",
          "Función: bloque de código reutilizable que realiza una tarea específica",
        ] },
        { tipo: "parrafo", contenido: "Tu primer programa en Python podría ser tan simple como: print('Hola, mundo!'). Esta tradición de hacer que el primer programa imprima '¡Hola, mundo!' existe desde 1974 y es el punto de partida de millones de programadores alrededor del planeta." },
        { tipo: "callout", variante: "sabias", contenido: "La mayoría de los lenguajes de programación están escritos en inglés porque los creadores de las primeras computadoras eran estadounidenses. Por eso palabras como 'if', 'for', 'while', 'print' son comandos universales. Aprender inglés te da ventaja en programación." },
      ],
    },
  },
  {
    slug: "cd-i-inteligencia-artificial-y-sociedad",
    titulo: "Inteligencia Artificial: Qué es y Cómo Afecta Tu Vida",
    categoria: "Tecnologías Emergentes",
    tiempo_lectura_minutos: 7,
    conceptos_clave: ["inteligencia artificial", "machine learning", "sesgo algorítmico", "ChatGPT", "ética de la IA"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "La inteligencia artificial (IA) es la capacidad de las computadoras para realizar tareas que normalmente requieren inteligencia humana: reconocer imágenes, traducir idiomas, predecir resultados, generar texto o jugar ajedrez. La IA ya está presente en tu vida diaria aunque no siempre lo notes." },
        { tipo: "subtitulo", contenido: "¿Dónde encuentras IA en tu día a día?" },
        { tipo: "lista", items: [
          "Recomendaciones de Spotify, Netflix o YouTube (¿qué quieres ver a continuación?)",
          "Asistentes de voz: Siri, Alexa, Google Assistant",
          "Filtros de spam en tu correo electrónico",
          "Reconocimiento facial para desbloquear tu teléfono",
          "Navegación GPS con predicción de tráfico",
          "Generadores de texto e imagen: ChatGPT, Gemini, DALL-E",
        ] },
        { tipo: "callout", variante: "importante", contenido: "La IA no piensa ni siente: es un sistema estadístico que predice cuál es la respuesta más probable basándose en los datos con los que fue entrenada. Cuando ChatGPT 'inventa' información falsa (alucinaciones), no está mintiendo conscientemente: simplemente predice texto con alta confianza aunque sea incorrecto." },
        { tipo: "subtitulo", contenido: "Sesgo algorítmico: cuando la IA discrimina" },
        { tipo: "parrafo", contenido: "Si los datos con los que se entrena una IA contienen sesgos humanos (racismo, sexismo, clasismo), la IA aprende y reproduce esos sesgos. Por ejemplo, sistemas de reconocimiento facial entrenados principalmente con rostros blancos tienen tasas de error mucho más altas con rostros de personas negras o asiáticas." },
        { tipo: "callout", variante: "sabias", contenido: "La palabra 'robot' fue inventada por el escritor checo Karel Čapek en su obra de teatro R.U.R. (1920). La palabra 'algoritmo' viene del nombre del matemático persa Al-Juarismi (siglo IX), cuyo apellido latinizado dio origen al término. La IA tiene raíces muy antiguas y culturalmente diversas." },
      ],
    },
  },
  {
    slug: "cd-i-identidad-digital",
    titulo: "Mi Identidad Digital: Quién Soy en Línea",
    categoria: "Ciudadanía Digital",
    tiempo_lectura_minutos: 5,
    conceptos_clave: ["identidad digital", "avatar", "reputación en línea", "anonimato", "autenticidad"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "Tu identidad digital es la representación de ti mismo en el mundo digital: tu nombre de usuario, fotos de perfil, publicaciones, comentarios, likes y todo lo que has creado o compartido en línea. Esta identidad coexiste con tu identidad física y cada vez más las dos se fusionan e influyen mutuamente." },
        { tipo: "subtitulo", contenido: "Componentes de la identidad digital" },
        { tipo: "lista", items: [
          "Identidad declarada: lo que dices de ti mismo (bio, perfil, publicaciones propias)",
          "Identidad actuada: cómo te comportas en línea (comentarios, interacciones, tono)",
          "Identidad calculada: cómo los algoritmos te clasifican (intereses inferidos, anuncios que ves)",
          "Identidad narrada: cómo otros te describen (etiquetas, menciones, reseñas)",
        ] },
        { tipo: "callout", variante: "importante", contenido: "Aunque uses un apodo o un perfil anónimo, tus actividades digitales generan metadatos que pueden rastrear tu identidad real: dirección IP, horarios de conexión, dispositivo, ubicación. El anonimato total en internet es prácticamente imposible." },
        { tipo: "parrafo", contenido: "La autenticidad en línea es un tema complejo. Las redes sociales incentivan mostrar la versión más atractiva y exitosa de nuestra vida, lo que puede generar una brecha entre quiénes somos realmente y cómo nos presentamos digitalmente. Cultivar una identidad digital auténtica es un acto de salud mental y ética." },
        { tipo: "callout", variante: "sabias", contenido: "Investigaciones del Pew Research Center muestran que el 40% de los adolescentes en Estados Unidos sienten presión de publicar solo contenido que haga quedar bien en redes sociales, y el 64% dice que frecuentemente o a veces no publica cosas por miedo a la reacción de otros." },
      ],
    },
  },
  {
    slug: "cd-i-datos-y-privacidad",
    titulo: "Tus Datos: El Nuevo Petróleo del Siglo XXI",
    categoria: "Seguridad en línea",
    tiempo_lectura_minutos: 7,
    conceptos_clave: ["datos personales", "economía de datos", "cookies", "consentimiento", "GDPR"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "Se dice que 'si el producto es gratis, el producto eres tú'. Google, Facebook, Instagram y muchas otras plataformas son gratuitas porque su modelo de negocio se basa en recopilar datos sobre ti, analizarlos y usarlos para mostrar publicidad personalizada. Tus datos tienen un valor económico real." },
        { tipo: "subtitulo", contenido: "¿Qué datos recopilan sobre ti?" },
        { tipo: "lista", items: [
          "Información que das voluntariamente: nombre, correo, fecha de nacimiento, teléfono",
          "Datos de comportamiento: qué buscas, qué videos ves cuánto tiempo, dónde haces clic",
          "Datos de dispositivo: modelo, sistema operativo, batería, sensores",
          "Datos de ubicación: dónde estás en cada momento si activas el GPS",
          "Datos de red social: con quién interactúas, cuánto tiempo, qué te gusta",
        ] },
        { tipo: "callout", variante: "importante", contenido: "Facebook (Meta) puede inferir tu orientación sexual, afiliación política, estado de salud y nivel socioeconómico AUNQUE nunca lo hayas declarado explícitamente, solo analizando tus interacciones. Esto lo demostró una investigación académica publicada en la revista Nature." },
        { tipo: "subtitulo", contenido: "Cómo proteger tu privacidad" },
        { tipo: "lista", items: [
          "Lee (aunque sea por encima) los términos de privacidad antes de aceptar",
          "Ajusta la configuración de privacidad en cada red social",
          "Usa navegadores con bloqueadores de rastreo (Firefox, Brave)",
          "Utiliza motores de búsqueda que no rastreen (DuckDuckGo)",
          "Revisa y revoca permisos de aplicaciones regularmente",
        ] },
        { tipo: "callout", variante: "sabias", contenido: "El GDPR (Reglamento General de Protección de Datos) de la Unión Europea es la ley de privacidad más estricta del mundo. Obliga a las empresas a pedir consentimiento explícito para usar tus datos y permite a los ciudadanos solicitar que sus datos sean eliminados. Ha servido de modelo para leyes en México y otros países." },
      ],
    },
  },
  {
    slug: "cd-i-trabajo-colaborativo-en-linea",
    titulo: "Trabajo Colaborativo en Entornos Digitales",
    categoria: "Herramientas Digitales",
    tiempo_lectura_minutos: 5,
    conceptos_clave: ["colaboración digital", "gestión de proyectos", "Trello", "Notion", "comunicación asíncrona"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "El trabajo colaborativo en entornos digitales implica coordinar esfuerzos con otras personas usando herramientas tecnológicas, con frecuencia sin estar en el mismo lugar ni en el mismo horario. Esta modalidad se expandió radicalmente durante la pandemia de COVID-19 y se ha consolidado como una competencia laboral fundamental." },
        { tipo: "subtitulo", contenido: "Herramientas para trabajo en equipo" },
        { tipo: "lista", items: [
          "Trello / Asana: tableros kanban para gestión de tareas y proyectos",
          "Notion: wiki colaborativo para documentación y gestión de conocimiento",
          "Slack / Discord: comunicación por canales temáticos",
          "Miro / FigJam: pizarras digitales para lluvia de ideas y diseño colaborativo",
          "GitHub: colaboración en proyectos de código",
        ] },
        { tipo: "callout", variante: "importante", contenido: "La comunicación asíncrona (sin necesidad de que todos estén conectados al mismo tiempo) es la base del trabajo remoto efectivo. Aprende a escribir mensajes claros, completos y que no requieran respuesta inmediata: es una habilidad muy valorada en el mundo laboral." },
        { tipo: "subtitulo", contenido: "Principios de colaboración digital efectiva" },
        { tipo: "lista", items: [
          "Define roles y responsabilidades desde el inicio",
          "Usa canales específicos para temas específicos",
          "Respeta los horarios: no esperes respuesta inmediata fuera de horas de trabajo",
          "Documenta decisiones y acuerdos por escrito",
          "Sé puntual en videoconferencias: respeta el tiempo de todos",
        ] },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Diagrama de equipo trabajando de forma distribuida con flechas indicando herramientas de comunicación y colaboración", caption: "El trabajo colaborativo digital requiere organización y herramientas adecuadas." },
      ],
    },
  },
  {
    slug: "cd-i-etica-digital",
    titulo: "Ética Digital: Principios para Vivir Bien en la Red",
    categoria: "Ciudadanía Digital",
    tiempo_lectura_minutos: 6,
    conceptos_clave: ["ética digital", "netiqueta", "responsabilidad", "empatía digital", "dilemas éticos"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "La ética digital es el conjunto de principios y valores que guían nuestro comportamiento en el entorno digital. No porque algo sea tecnológicamente posible significa que sea éticamente correcto. La velocidad y el anonimato de internet no eximen de responsabilidad moral a quien actúa en la red." },
        { tipo: "subtitulo", contenido: "Netiqueta: buenas maneras en línea" },
        { tipo: "lista", items: [
          "No escribas en MAYÚSCULAS sostenidas (equivale a gritar)",
          "Piensa antes de publicar: ¿lo dirías en persona? ¿Cómo te sentirías si te lo dijeran?",
          "Usa lenguaje apropiado al contexto (WhatsApp familiar vs. correo profesional)",
          "Da crédito siempre que uses contenido de otros",
          "Responde con respeto incluso cuando no estés de acuerdo",
        ] },
        { tipo: "callout", variante: "importante", contenido: "El efecto de desinhibición en línea es un fenómeno psicológico real: las personas tienden a comportarse de manera más agresiva o desinhibida en internet que en persona, debido al anonimato percibido y la ausencia de retroalimentación física inmediata. Ser consciente de esto te permite actuar con mayor intención." },
        { tipo: "subtitulo", contenido: "Dilemas éticos digitales comunes" },
        { tipo: "lista", items: [
          "¿Está bien usar IA para hacer tareas escolares? ¿Cuándo se convierte en trampa?",
          "¿Debo denunciar contenido que me parece ofensivo aunque no me afecte directamente?",
          "¿Tengo responsabilidad si comparto una noticia falsa sin saber que lo era?",
          "¿Es aceptable rastrear la ubicación de mi pareja con su teléfono 'por seguridad'?",
        ] },
        { tipo: "callout", variante: "sabias", contenido: "La prueba del periódico (o del periodista): antes de publicar algo en línea, pregúntate si te sentiría cómodo/a si esa acción apareciera en la primera plana de un periódico. Si la respuesta es no, reconsidera. Es un principio ético simple pero eficaz." },
      ],
    },
  },
  {
    slug: "cd-i-derechos-de-autor-en-la-era-digital",
    titulo: "Propiedad Intelectual y Derechos de Autor en la Era Digital",
    categoria: "Alfabetización Digital",
    tiempo_lectura_minutos: 6,
    conceptos_clave: ["propiedad intelectual", "copyright", "plagio", "licencias libres", "dominio público"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "La propiedad intelectual protege las creaciones de la mente: obras literarias, musicales, artísticas, inventos, marcas y diseños. En la era digital, la facilidad de copiar y compartir contenido hace que entender estos derechos sea más importante que nunca, tanto para proteger las obras propias como para respetar las ajenas." },
        { tipo: "subtitulo", contenido: "¿Qué es el copyright?" },
        { tipo: "parrafo", contenido: "El copyright (©) es el derecho exclusivo del autor sobre su obra. En México, el derecho de autor protege una obra desde el momento de su creación y durante toda la vida del autor más 100 años adicionales. No se necesita registrarse ni poner el símbolo © para tener derechos: basta con crear la obra." },
        { tipo: "callout", variante: "advertencia", contenido: "Bajar música, películas o software sin pagar (piratería digital) es un delito en México sancionado por la Ley Federal del Derecho de Autor. Aunque es muy común, no es legal. Los sitios de streaming legales (Spotify, Netflix, YouTube) son alternativas accesibles y legales." },
        { tipo: "subtitulo", contenido: "Dominio público y cultura libre" },
        { tipo: "parrafo", contenido: "Cuando expira el período de protección de una obra, entra al dominio público y puede usarse libremente. Las obras de Mozart, Shakespeare o Diego Rivera, por ejemplo, están en dominio público. El movimiento de cultura libre (copyleft) promueve que las obras puedan ser usadas, modificadas y distribuidas libremente." },
        { tipo: "lista", items: [
          "Project Gutenberg: más de 60,000 libros en dominio público gratuitos",
          "Internet Archive: millones de libros, música y videos históricos de libre acceso",
          "OpenStreetMap: mapas colaborativos de libre uso",
          "Wikipedia: enciclopedia de contenido libre (aunque no es fuente académica)",
        ] },
        { tipo: "callout", variante: "sabias", contenido: "El plagio académico (copiar el trabajo de otro sin citar la fuente) es diferente al plagio legal, pero igual de grave en el contexto escolar. Citar correctamente tus fuentes no solo evita problemas: demuestra que investigaste, que sabes evaluar fuentes y que respetas el trabajo intelectual ajeno." },
      ],
    },
  },
  {
    slug: "cd-i-medioambiente-y-tecnologia",
    titulo: "Tecnología y Medio Ambiente: Huella Ambiental Digital",
    categoria: "Tecnologías Emergentes",
    tiempo_lectura_minutos: 5,
    conceptos_clave: ["huella de carbono digital", "e-waste", "consumo energético", "cloud computing", "tecnología sostenible"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "La tecnología digital tiene un impacto ambiental significativo que frecuentemente se ignora porque no es visible. Los servidores que almacenan internet, la fabricación de dispositivos y la basura electrónica (e-waste) consumen recursos naturales y energía, y generan contaminación. La cultura digital responsable incluye la conciencia ambiental." },
        { tipo: "subtitulo", contenido: "El costo ambiental de internet" },
        { tipo: "lista", items: [
          "Un correo electrónico con adjunto emite aproximadamente 50 gramos de CO₂",
          "Ver 30 minutos de video en streaming emite tanta CO₂ como conducir 6 km en auto",
          "Los centros de datos (datacenters) consumen el 1-2% de la electricidad mundial",
          "Bitcoin consume más electricidad al año que Argentina",
        ] },
        { tipo: "callout", variante: "importante", contenido: "La industria tecnológica genera entre 2 y 4% de las emisiones globales de CO₂, comparable a la aviación comercial. Sin embargo, la tecnología también puede ser parte de la solución: monitoreo ambiental, energías renovables, agricultura de precisión, transporte inteligente." },
        { tipo: "subtitulo", contenido: "Basura electrónica (e-waste)" },
        { tipo: "parrafo", contenido: "El e-waste son los dispositivos electrónicos desechados: teléfonos, laptops, cables, baterías. Contienen materiales valiosos (oro, plata, cobre) pero también sustancias tóxicas (plomo, mercurio, cadmio). México genera aproximadamente 1.1 millones de toneladas de e-waste al año, y solo una pequeña fracción se recicla adecuadamente." },
        { tipo: "callout", variante: "sabias", contenido: "Puedes reducir tu huella digital: borrar correos y archivos que no uses (liberas espacio en servidores), usar el modo oscuro (ahorra batería en pantallas OLED), descargar en lugar de hacer streaming (un archivo se descarga una vez, el streaming usa energía cada vez), y llevar dispositivos viejos a centros de reciclaje electrónico." },
      ],
    },
  },
  {
    slug: "cd-i-accesibilidad-digital",
    titulo: "Accesibilidad Digital: Tecnología para Todas y Todos",
    categoria: "Ciudadanía Digital",
    tiempo_lectura_minutos: 5,
    conceptos_clave: ["accesibilidad", "diseño universal", "lectores de pantalla", "tecnología asistiva", "inclusión"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "La accesibilidad digital es el diseño de tecnología que puede ser usada por todas las personas, incluyendo aquellas con discapacidades visuales, auditivas, motoras o cognitivas. Un web accesible, una app accesible o un video con subtítulos no solo ayuda a personas con discapacidad: beneficia a todos en distintas situaciones." },
        { tipo: "subtitulo", contenido: "Principios del diseño accesible (WCAG)" },
        { tipo: "lista", items: [
          "Perceptible: la información debe presentarse de maneras que todos puedan percibir (texto alternativo para imágenes, subtítulos para videos)",
          "Operable: los usuarios deben poder navegar e interactuar (teclado, comandos de voz)",
          "Comprensible: el contenido y la interfaz deben ser claros y predecibles",
          "Robusto: el contenido debe funcionar con tecnologías asistivas actuales y futuras",
        ] },
        { tipo: "callout", variante: "importante", contenido: "Agregar texto alternativo (alt text) a las imágenes no es opcional en diseño web inclusivo: es un requerimiento ético y en muchos países legal. Permite que lectores de pantalla describan las imágenes a personas con discapacidad visual." },
        { tipo: "parrafo", contenido: "En México, la Ley General para la Inclusión de las Personas con Discapacidad (2011) establece que las tecnologías de información y comunicación deben ser accesibles. Sin embargo, la implementación práctica sigue siendo un desafío en muchos sitios gubernamentales y privados." },
        { tipo: "callout", variante: "sabias", contenido: "Cuando creas una presentación, infografía o post en redes sociales, agregar texto alternativo a las imágenes y subtítulos a los videos hace tu contenido accesible a millones de personas. Son pequeños cambios con gran impacto. YouTube tiene subtitulado automático; Instagram y Facebook permiten agregar alt text a las fotos." },
      ],
    },
  },
  {
    slug: "cd-i-economia-digital",
    titulo: "Economía Digital: Comercio Electrónico y Trabajo en Línea",
    categoria: "Tecnologías Emergentes",
    tiempo_lectura_minutos: 6,
    conceptos_clave: ["e-commerce", "economía gig", "freelancing", "startups", "emprendimiento digital"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "La economía digital es el conjunto de actividades económicas que se llevan a cabo principalmente a través de internet y tecnologías digitales. Incluye el comercio electrónico, los servicios digitales, la economía gig (trabajo por encargo) y el emprendimiento en línea. La economía digital crece aceleradamente y genera oportunidades para quienes saben aprovecharla." },
        { tipo: "subtitulo", contenido: "Comercio electrónico en México" },
        { tipo: "parrafo", contenido: "México es uno de los mercados de e-commerce de mayor crecimiento en América Latina. Plataformas como Mercado Libre, Amazon México, Liverpool y Coppel en línea manejan millones de transacciones. El e-commerce creció exponencialmente durante la pandemia y se consolidó como hábito de consumo permanente." },
        { tipo: "lista", items: [
          "Verifica siempre la reputación del vendedor antes de comprar",
          "Usa métodos de pago seguros (tarjeta virtual, PayPal, transferencias) en lugar de efectivo",
          "Guarda confirmaciones de compra y números de seguimiento",
          "Conoce tus derechos: en México la Profeco protege al consumidor en compras en línea",
        ] },
        { tipo: "callout", variante: "importante", contenido: "Si un precio en línea parece demasiado bueno para ser verdad, probablemente sea una estafa. Los fraudes de e-commerce (cobrar sin enviar, vender productos falsificados) son un delito que puedes denunciar ante la Policía Cibernética o la Profeco." },
        { tipo: "subtitulo", contenido: "Economía gig y freelancing" },
        { tipo: "parrafo", contenido: "La economía gig permite trabajar de forma independiente, por proyectos, para múltiples clientes. Plataformas como Fiverr, Upwork, Workana o 99designs conectan freelancers con empresas del mundo entero. Diseño gráfico, programación, traducción, redacción, marketing digital y soporte técnico son las áreas más demandadas." },
        { tipo: "callout", variante: "sabias", contenido: "El 36% de los trabajadores en Estados Unidos ya son freelancers o trabajadores independientes, y se espera que esta proporción supere el 50% para 2030. Desarrollar habilidades digitales que puedas ofrecer en plataformas internacionales puede darte ingresos significativos desde México." },
      ],
    },
  },
  {
    slug: "cd-i-futuro-digital",
    titulo: "El Futuro Digital: Tendencias que Cambiarán el Mundo",
    categoria: "Tecnologías Emergentes",
    tiempo_lectura_minutos: 6,
    conceptos_clave: ["metaverso", "blockchain", "IoT", "computación cuántica", "realidad aumentada"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "El mundo digital evoluciona a una velocidad sin precedentes. Las tecnologías que hoy parecen ciencia ficción serán parte de la vida cotidiana en los próximos años. Comprender estas tendencias no es solo curiosidad intelectual: te prepara para adaptarte y aprovechar las oportunidades que traerán consigo." },
        { tipo: "subtitulo", contenido: "Tendencias tecnológicas clave" },
        { tipo: "lista", items: [
          "Internet de las Cosas (IoT): objetos cotidianos conectados a internet (refrigeradores, autos, ciudades inteligentes)",
          "Realidad Aumentada y Virtual (AR/VR): fusión del mundo físico y digital (desde filtros de Instagram hasta quirófanos virtuales)",
          "Blockchain y Web3: registros digitales descentralizados, criptomonedas, contratos inteligentes",
          "Computación cuántica: procesadores que usarán principios de la mecánica cuántica para resolver problemas imposibles para computadoras actuales",
          "Neurointerfaz: conexión directa entre cerebro y computadora (Neuralink y proyectos similares)",
        ] },
        { tipo: "callout", variante: "importante", contenido: "La automatización y la IA reemplazarán muchos empleos actuales, pero también crearán nuevas profesiones que hoy no existen. Según el Foro Económico Mundial, el 65% de los niños que entran a la primaria hoy trabajarán en empleos que aún no han sido inventados. Aprender a aprender es más importante que aprender contenidos específicos." },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Gráfico de tendencias tecnológicas emergentes con íconos representando IoT, IA, blockchain, realidad virtual y computación cuántica", caption: "Las tecnologías del futuro que moldearán el mundo en los próximos 10 años." },
        { tipo: "callout", variante: "sabias", contenido: "México tiene un ecosistema de startups tecnológicas en crecimiento: Ciudad de México es considerado uno de los principales hubs de innovación de América Latina, con empresas como Clip, Kueski, Conekta y Kavak valuadas en miles de millones de dólares. El sector tecnológico mexicano necesita talento joven con habilidades digitales." },
      ],
    },
  },
];

async function main() {
  console.log(`\n📚 Seed Biblioteca — ${UAC_CODIGO}\n`);

  const { data: uac, error: uacErr } = await supabase
    .from("uac")
    .select("id")
    .eq("codigo", UAC_CODIGO)
    .single();

  if (uacErr || !uac) {
    console.error(`❌ UAC ${UAC_CODIGO} no encontrada. Ejecuta seed-mccems.ts primero.`);
    process.exit(1);
  }

  let ok = 0;
  let fail = 0;

  for (let i = 0; i < FICHAS.length; i++) {
    const f = FICHAS[i];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("fichas_biblioteca").upsert(
      {
        uac_id: uac.id,
        slug: f.slug,
        titulo: f.titulo,
        categoria: f.categoria,
        tiempo_lectura_minutos: f.tiempo_lectura_minutos,
        conceptos_clave: f.conceptos_clave,
        contenido: f.contenido,
        fichas_relacionadas: [],
        orden: i + 1,
        es_placeholder: true,
      },
      { onConflict: "slug" }
    );

    if (error) {
      console.error(`  ✗ ${f.slug}: ${error.message}`);
      fail++;
    } else {
      console.log(`  ✓ ${f.slug}`);
      ok++;
    }
  }

  console.log(`\n✅ ${UAC_CODIGO}: ${ok} fichas insertadas, ${fail} fallidas.\n`);
}

main().catch((err) => {
  console.error("❌ Error fatal:", err.message);
  process.exit(1);
});
