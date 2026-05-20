/**
 * Seed de fichas de biblioteca para CD-III (Cultura Digital III, Semestre 6).
 * 15 fichas temáticas alineadas al MCCEMS 2025, Semestre 6.
 *
 * Uso: npx tsx scripts/seed-fichas-cdiii.ts
 * Idempotente: upsert por campo "slug".
 */

import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

type SB = ReturnType<typeof createClient<Database>>;

const FICHAS_CDIII = [
  // ── Categoría 1: Comunicación digital multimodal ─────────────────────────

  {
    slug: "cd-iii-comunicacion-multimodal-texto-imagen-audio",
    titulo:
      "Comunicación digital multimodal: texto, imagen, audio y video en un solo mensaje",
    categoria: "Comunicación digital multimodal",
    conceptos_clave: [
      "comunicación multimodal",
      "TICCAD",
      "TikTok",
      "Instagram Reels",
      "lenguaje digital",
    ],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La comunicación digital multimodal integra texto, imagen, audio, video y animación en un solo mensaje. En la era de las redes sociales, ya no basta con escribir: los mensajes más efectivos combinan múltiples recursos expresivos para captar la atención y transmitir significado de forma completa. Esta forma de comunicarse es el estándar en plataformas como TikTok, Instagram Reels, YouTube Shorts y WhatsApp.",
        },
        {
          tipo: "parrafo",
          contenido:
            "Cada plataforma privilegia combinaciones distintas de modos comunicativos. TikTok integra video corto, música, texto sobreimpuesto y efectos visuales. Instagram Reels añade el componente de imagen estática y stories efímeras. WhatsApp combina mensajes de voz con imágenes y stickers animados. En México, creadores de contenido como Yalitza Aparicio utilizan la comunicación multimodal para amplificar causas sociales relacionadas con comunidades indígenas, combinando testimonios en video, subtítulos en lenguas originarias y música regional.",
        },
        {
          tipo: "subtitulo",
          contenido: "Los cinco elementos de la comunicación multimodal",
        },
        {
          tipo: "lista",
          items: [
            "Texto escrito: titulares, subtítulos, captions, hashtags y comentarios",
            "Imagen estática: fotografías, ilustraciones, infografías y memes",
            "Video: clips cortos, livestreams, tutoriales y documentales digitales",
            "Audio: música, podcasts, notas de voz y efectos de sonido",
            "Animación y GIF: elementos visuales en movimiento que añaden emoción y humor",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La alfabetización multimodal —la capacidad de leer, interpretar y producir mensajes que combinan múltiples modos expresivos— es hoy una competencia básica comparable a leer y escribir. Quien no domina el lenguaje multimodal tiene menor capacidad de comunicarse, informarse y participar en la vida pública digital del siglo XXI.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de los cinco modos de comunicación digital multimodal: texto, imagen, video, audio y animación",
          caption:
            "Los cinco modos que convergen en la comunicación digital contemporánea.",
        },
      ],
    },
  },

  {
    slug: "cd-iii-algoritmos-recomendacion-tiktok-youtube",
    titulo:
      "Algoritmos de recomendacion: como TikTok y YouTube deciden que ves",
    categoria: "Comunicación digital multimodal",
    conceptos_clave: [
      "algoritmo de recomendacion",
      "tiempo de uso",
      "engagement",
      "bubble filter",
      "economia de la atencion",
    ],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Los algoritmos de recomendación son sistemas de inteligencia artificial diseñados para predecir qué contenido querrás ver a continuación. Su objetivo no es informarte ni entretenerte de forma equilibrada: están optimizados para maximizar el tiempo que pasas en la plataforma, una métrica conocida como engagement. TikTok, YouTube, Instagram y Facebook emplean estos sistemas con sofisticación creciente.",
        },
        {
          tipo: "parrafo",
          contenido:
            "El For You Page de TikTok es considerado el algoritmo de recomendación más avanzado del mundo. Aprende de señales como el tiempo de visualización completo de un video, las veces que lo pausas, si lo compartes, tus búsquedas y hasta los videos que ves pero sobre los que no interactúas. Las sugerencias de YouTube son similares: el 70% del tiempo de visualización total en la plataforma proviene de contenido recomendado por el algoritmo, no buscado directamente por el usuario.",
        },
        {
          tipo: "subtitulo",
          contenido: "Consecuencias para la informacion",
        },
        {
          tipo: "parrafo",
          contenido:
            "Eli Pariser acuñó el concepto de burbuja de filtro en 2011: cuando el algoritmo solo te muestra contenido que confirma tus creencias previas, crea una burbuja informativa donde nunca encuentras perspectivas distintas. Con el tiempo, la realidad que percibes a través de tu feed se vuelve cada vez más estrecha y sesgada, sin que lo notes.",
        },
        {
          tipo: "lista",
          items: [
            "Tiempo de visualización: cuántos segundos o minutos ves el video completo",
            "Interacciones: likes, comentarios, compartidos y guardados",
            "Historial de búsqueda: temas que has explorado anteriormente",
            "Perfil demográfico: edad, ubicación, idioma y dispositivo",
            "Comportamiento de usuarios similares: lo que ven personas con patrones parecidos al tuyo",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Investigaciones internas filtradas de Meta en 2021 revelaron que Instagram tenía efectos negativos sobre la imagen corporal y el bienestar mental de adolescentes, especialmente mujeres. La empresa conocía estos hallazgos pero no los hizo públicos. En México, CONAPRED publicó en 2023 un reporte sobre discriminación algorítmica que afecta a comunidades indígenas y personas con discapacidad en plataformas de empleo y crédito.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama que muestra cómo un algoritmo de recomendación aprende de las interacciones del usuario y retroalimenta su burbuja de filtro",
          caption:
            "El ciclo de retroalimentación de los algoritmos: más interacción genera recomendaciones más personalizadas.",
        },
      ],
    },
  },

  {
    slug: "cd-iii-camaras-eco-polarizacion-politica-mexico",
    titulo:
      "Camaras de eco y polarizacion politica en el ecosistema digital mexicano",
    categoria: "Comunicación digital multimodal",
    conceptos_clave: [
      "camara de eco",
      "burbuja de filtro",
      "polarizacion politica",
      "desinformacion",
      "democracia digital",
    ],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Las burbujas de filtro y las cámaras de eco son dos fenómenos relacionados pero distintos. La burbuja de filtro es creada por el algoritmo: un sistema automatizado que filtra lo que ves según tu comportamiento previo. La cámara de eco es un fenómeno social: cuando elegimos rodearnos de personas que piensan como nosotros y evitamos activamente perspectivas contrarias, creamos una cámara donde nuestras ideas resuenan sin cuestionamiento.",
        },
        {
          tipo: "parrafo",
          contenido:
            "En México, el ecosistema digital político se fragmentó notablemente durante los sexenios de 2018 y 2024. Los ecosistemas pro y anti-cuarta transformación raramente se superponen en redes sociales: siguen cuentas distintas, comparten en grupos distintos y consumen medios distintos. Twitter/X y Facebook funcionaron como espacios de confrontación más que de deliberación. Los usuarios que intentan cruzar estas fronteras digitales suelen recibir respuestas agresivas de ambos lados.",
        },
        {
          tipo: "subtitulo",
          contenido: "La desinformacion como combustible",
        },
        {
          tipo: "parrafo",
          contenido:
            "Las cámaras de eco aceleran la propagación de desinformación porque la gente comparte contenido que confirma sus creencias sin verificarlo. Un estudio del MIT Media Lab (Vosoughi, Roy, Aral, 2018) demostró que las noticias falsas se propagan seis veces más rápido que las verdaderas en Twitter/X. En entornos polarizados, cuestionar una noticia favorable a tu bando puede percibirse como traición, lo que inhibe el pensamiento crítico colectivo.",
        },
        {
          tipo: "lista",
          items: [
            "Sigue deliberadamente cuentas con perspectivas diferentes a las tuyas aunque te incomoden",
            "Pausa antes de compartir contenido que confirma exactamente lo que ya creías",
            "Usa herramientas como AllSides o lectores de noticias diversificados",
            "Distingue entre fuentes primarias (documentos, datos, estadísticas) y comentarios editoriales",
            "Practica la lectura lateral: abre varias pestañas sobre el mismo tema antes de formar una opinión",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "México tiene uno de los índices más altos de compartición de contenido falso en América Latina, según el Reuters Institute Digital News Report 2023. Esto no es coincidencia: la combinación de alta penetración de WhatsApp, grupos cerrados sin moderación y baja confianza en medios tradicionales crea condiciones ideales para la viralización de desinformación.",
        },
        {
          tipo: "parrafo",
          contenido:
            "La tensión entre la curación algorítmica y la deliberación democrática es uno de los grandes desafíos políticos del siglo XXI. Una democracia sana requiere que los ciudadanos tengan acceso a información compartida y debatan sobre una base fáctica común. Los algoritmos que maximizan el engagement tienden a favorecer contenido emocionalmente activador, confrontacional y polarizante, exactamente lo contrario de lo que necesita la deliberación democrática.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Visualización de dos ecosistemas digitales polarizados que no se comunican entre sí, representando las cámaras de eco políticas en México",
          caption:
            "Las cámaras de eco digitales crean universos informativos paralelos que raramente se tocan.",
        },
      ],
    },
  },

  // ── Categoría 2: Brecha digital de género ────────────────────────────────

  {
    slug: "cd-iii-brecha-digital-genero-mexico-endutih",
    titulo: "La brecha digital de genero en Mexico: datos del INEGI ENDUTIH",
    categoria: "Brecha digital de género",
    conceptos_clave: [
      "brecha digital de genero",
      "ENDUTIH",
      "INEGI",
      "acceso a internet",
      "uso digital",
    ],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La brecha digital de género es la diferencia en el acceso, uso, habilidades y aprovechamiento de las tecnologías digitales entre hombres y mujeres. En México, el INEGI mide este fenómeno a través de la ENDUTIH (Encuesta Nacional sobre Disponibilidad y Uso de Tecnologías de la Información en los Hogares), que se realiza anualmente y es la fuente oficial de datos sobre conectividad en el país.",
        },
        {
          tipo: "parrafo",
          contenido:
            "Los datos de la ENDUTIH 2023 muestran que la brecha de acceso se ha reducido significativamente: el 76% de los hombres y el 72% de las mujeres en México son usuarias de internet. Sin embargo, la brecha de uso persiste y es más difícil de medir: las mujeres tienden a usar internet predominantemente para redes sociales y entretenimiento, mientras que los hombres lo usan más para trabajo, educación continua y programación. Esta diferencia no es biológica: refleja desigualdades históricas en oportunidades y expectativas sociales.",
        },
        {
          tipo: "subtitulo",
          contenido: "La brecha invisible del uso",
        },
        {
          tipo: "lista",
          items: [
            "Brecha de acceso: diferencia en disponibilidad de dispositivos y conexión a internet",
            "Brecha de uso: diferencias en para qué y cómo se usa la tecnología disponible",
            "Brecha de habilidades: diferencias en competencias digitales avanzadas como programación o análisis de datos",
            "Brecha de liderazgo: subrepresentación de mujeres en dirección de empresas tecnológicas y puestos de decisión",
            "Brecha salarial digital: las mujeres en roles tecnológicos ganan en promedio 15-20% menos que sus pares hombres",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La brecha digital de género no es consecuencia de diferencias biológicas entre hombres y mujeres. Es producto de la socialización, las expectativas culturales sobre los roles de género y el desigual acceso a oportunidades educativas y laborales. Cerrar esta brecha requiere intervenciones deliberadas en educación, políticas públicas y cultura empresarial.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Gráfica comparativa del uso de internet por género en México según datos ENDUTIH, mostrando las diferentes dimensiones de la brecha digital",
          caption:
            "La brecha digital de género tiene múltiples dimensiones más allá del simple acceso a un dispositivo.",
        },
      ],
    },
  },

  {
    slug: "cd-iii-mujeres-tecnologia-stem-mexico",
    titulo: "Mujeres en tecnologia: cerrando la brecha STEM en Mexico",
    categoria: "Brecha digital de género",
    conceptos_clave: [
      "mujeres en STEM",
      "Laboratoria",
      "Renata Flores",
      "vocaciones digitales",
      "inclusion tecnologica",
    ],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "En México, las mujeres representan apenas el 25 al 30% de la matrícula en ingenierías y carreras tecnológicas, según datos de la ANUIES (Asociación Nacional de Universidades e Instituciones de Educación Superior). Esta subrepresentación tiene raíces en múltiples factores: estereotipos sobre quién pertenece a las ciencias exactas, falta de modelos a seguir femeninos, ambientes universitarios que pueden ser hostiles y la doble carga del trabajo doméstico que recae desproporcionadamente sobre las mujeres.",
        },
        {
          tipo: "parrafo",
          contenido:
            "Diversas organizaciones están trabajando para cambiar esta realidad. Laboratoria ofrece bootcamps intensivos de programación y desarrollo web para mujeres en situación vulnerable, con un modelo de pago diferido (pagan cuando consiguen empleo). Niñas en Tecnología, impulsado por Plan International México, ha llegado a más de 10,000 niñas en estados como Oaxaca, Chiapas y Guerrero mediante talleres de pensamiento computacional. Girls in Tech México conecta a profesionales y emprendedoras del sector tecnológico.",
        },
        {
          tipo: "subtitulo",
          contenido: "Modelos a seguir mexicanas",
        },
        {
          tipo: "parrafo",
          contenido:
            "El ejemplo de Yalitza Aparicio ilustra cómo las mujeres indígenas pueden usar las plataformas digitales para amplificar sus voces y las de sus comunidades. Aunque conocida como actriz, Aparicio ha utilizado Instagram y Twitter para visibilizar causas de derechos indígenas, demostrando que el activismo digital puede ser herramienta de empoderamiento. En el sector tecnológico estricto, mujeres como Renata Flores Vázquez han liderado empresas de tecnología en México rompiendo esquemas de género.",
        },
        {
          tipo: "lista",
          items: [
            "Ciencia de datos y analítica: alta demanda con salarios competitivos y trabajo remoto frecuente",
            "Diseño UX/UI: combina creatividad y tecnología, con gran crecimiento en el ecosistema startup mexicano",
            "Ciberseguridad: enorme déficit de talento femenino y masculino, uno de los campos más urgentes",
            "Marketing digital y growth hacking: mezcla de creatividad, datos y estrategia de negocio",
            "Inteligencia artificial y machine learning: el campo de mayor crecimiento salarial de la próxima década",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "CONAPRED (Consejo Nacional para Prevenir la Discriminación) ha documentado que las mujeres que estudian carreras STEM en México enfrentan un fenómeno llamado efecto tijera: conforme sube el nivel académico y el prestigio de los puestos, la proporción de mujeres disminuye. En preparatoria la diferencia es pequeña; en doctorado y en posiciones directivas se vuelve abismal.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Ilustración de mujeres jóvenes mexicanas participando en talleres de programación y tecnología digital",
          caption:
            "Iniciativas como Laboratoria y Niñas en Tecnología buscan transformar la composición de género en el sector tecnológico mexicano.",
        },
      ],
    },
  },

  {
    slug: "cd-iii-violencia-digital-genero-deepfakes",
    titulo:
      "Violencia digital de genero: deepfakes, acoso y marcos legales en Mexico",
    categoria: "Brecha digital de género",
    conceptos_clave: [
      "violencia digital",
      "deepfake",
      "ciberacoso",
      "Ley Olimpia",
      "derechos digitales de las mujeres",
    ],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La violencia digital de género comprende todas las formas de violencia facilitadas por tecnologías digitales que afectan desproporcionadamente a mujeres y personas LGBTQ+. Sus formas principales incluyen el ciberacoso (hostigamiento sistemático vía mensajes, comentarios o redes sociales), la difusión no consensuada de imágenes íntimas (antes llamado revenge porn), el doxing (publicar información personal privada con intención de dañar), las amenazas en línea y el uso de deepfakes con contenido sexual.",
        },
        {
          tipo: "parrafo",
          contenido:
            "En México, la ENDIREH 2021 (Encuesta Nacional sobre la Dinámica de las Relaciones en los Hogares) documentó que el 24% de las mujeres mayores de 15 años reportaron haber experimentado alguna forma de violencia digital. Los deepfakes —videos generados por inteligencia artificial que muestran a una persona haciendo o diciendo cosas que nunca ocurrieron— se utilizan de manera desproporcionada contra mujeres: el 96% de los deepfakes no consensuados en internet son de naturaleza sexual, según un informe de Deeptrace (2019).",
        },
        {
          tipo: "subtitulo",
          contenido: "El marco legal mexicano",
        },
        {
          tipo: "parrafo",
          contenido:
            "La Ley Olimpia, aprobada en 2021 y vigente en la mayoría de los estados de México, tipifica como delito la difusión no consensuada de imágenes íntimas digitales. Su nombre es un homenaje a Olimpia Coral Melo, activista tlaxcalteca que fue víctima de este delito y dedicó años a impulsar su penalización. La ley ha permitido la primera ola de condenas en México por este tipo de violencia, aunque su aplicación es todavía desigual entre estados.",
        },
        {
          tipo: "lista",
          items: [
            "Difusión no consensuada de imágenes íntimas: penalizado por Ley Olimpia en la mayoría de estados",
            "Ciberacoso y hostigamiento digital: tipificado como delito en varios códigos penales estatales",
            "Doxing con fines de intimidación: puede perseguirse bajo delitos de amenazas y privacidad",
            "Deepfakes sexuales no consensuados: aún zona gris legal, en proceso de regulación específica",
            "Acoso laboral digital (bossing o mobbing en plataformas laborales): regulado por Ley Federal del Trabajo",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "México es uno de los países con mayores tasas de violencia digital contra periodistas y activistas mujeres, según Reporteros Sin Fronteras 2023. Organizaciones como Luchadoras, SocialTIC y los colectivos de Marea Verde en línea ofrecen acompañamiento digital y asesoría legal gratuita a mujeres que enfrentan violencia digital. Si tú o alguien que conoces enfrenta esta situación, no están solas: existen redes de apoyo especializadas.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Representación visual del escudo legal de la Ley Olimpia protegiendo los derechos digitales de las mujeres en México",
          caption:
            "La Ley Olimpia fue un hito en el reconocimiento de los derechos digitales de las mujeres en México.",
        },
      ],
    },
  },

  // ── Categoría 3: Vocaciones y carreras digitales ──────────────────────────

  {
    slug: "cd-iii-carreras-digitales-mexico-programacion-datos",
    titulo:
      "Carreras del futuro digital en Mexico: programacion, datos y disenyo UX",
    categoria: "Vocaciones y carreras digitales",
    conceptos_clave: [
      "carreras digitales",
      "programacion",
      "ciencia de datos",
      "diseño UX",
      "mercado laboral tecnologico",
    ],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El mercado laboral tecnológico en México está en plena expansión. Las carreras digitales de mayor demanda incluyen desarrollo de software, ciencia de datos, diseño UX/UI, ciberseguridad, marketing digital e inteligencia artificial. Estas áreas ofrecen salarios competitivos, posibilidades de trabajo remoto y, en muchos casos, no requieren título universitario de cuatro años: los empleadores valoran las habilidades demostrables por encima de los diplomas.",
        },
        {
          tipo: "parrafo",
          contenido:
            "Los rangos salariales en México reflejan esta alta demanda. Un desarrollador junior con 1 a 2 años de experiencia gana entre 15,000 y 25,000 MXN al mes; un desarrollador senior con 5 o más años puede ganar entre 40,000 y 80,000 MXN mensuales, con posibilidad de trabajar para empresas extranjeras en dólares o euros de manera remota. Plataformas como Platzi, Bedu, Coursera y los programas certificados de Google, AWS y Meta ofrecen formación en 6 a 12 meses con reconocimiento real en el mercado.",
        },
        {
          tipo: "subtitulo",
          contenido: "Que aprenden los programadores",
        },
        {
          tipo: "lista",
          items: [
            "Python: el lenguaje más versátil, usado en ciencia de datos, automatización e inteligencia artificial",
            "JavaScript: esencial para desarrollo web front-end y back-end (con Node.js), el más demandado en startups",
            "Java: estándar en aplicaciones empresariales, banca y sistemas de gran escala",
            "SQL: el lenguaje de bases de datos más universal, requerido en prácticamente todos los roles tecnológicos",
            "R: especializado en estadística y análisis de datos científicos, muy valorado en investigación y salud",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "México tendrá un déficit de 800,000 profesionales tecnológicos para el año 2030, según proyecciones de CANIETI (Cámara Nacional de la Industria Electrónica, de Telecomunicaciones y Tecnologías de la Información). Esto significa que nunca ha habido un mejor momento para comenzar a desarrollar habilidades digitales: la demanda supera ampliamente la oferta de talento disponible.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Mapa visual de las carreras digitales más demandadas en México con sus rangos salariales aproximados",
          caption:
            "El ecosistema de carreras digitales en México ofrece múltiples rutas de entrada, con o sin título universitario.",
        },
      ],
    },
  },

  {
    slug: "cd-iii-diseno-ux-ui-profesion-digital",
    titulo:
      "Diseño UX/UI: la profesion digital que combina psicologia y tecnologia",
    categoria: "Vocaciones y carreras digitales",
    conceptos_clave: [
      "diseño UX",
      "diseño UI",
      "experiencia de usuario",
      "investigacion con usuarios",
      "prototipado",
    ],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "UX (User Experience, experiencia de usuario) y UI (User Interface, interfaz de usuario) son dos disciplinas relacionadas pero distintas. El diseño UX se centra en cómo se siente el usuario al interactuar con un producto digital: ¿es fácil de usar?, ¿satisface su necesidad?, ¿genera frustración o satisfacción? El diseño UI se enfoca en los elementos visuales que el usuario ve: colores, tipografía, íconos, botones, espaciado y jerarquía visual.",
        },
        {
          tipo: "parrafo",
          contenido:
            "En la práctica, las personas que diseñan UX realizan investigación con usuarios (entrevistas en profundidad, pruebas de usabilidad, análisis de comportamiento en la app), crean arquitecturas de información (cómo se organizan las secciones), desarrollan wireframes (esquemas sin color ni estilo) y prototipos (versiones interactivas). Luego, el diseño UI convierte esos wireframes en interfaces visuales atractivas y coherentes con la identidad de la marca.",
        },
        {
          tipo: "parrafo",
          contenido:
            "En México, aplicaciones como Rappi, Kavak y Clip fueron diseñadas por equipos UX/UI que realizaron investigación específica con usuarios mexicanos para entender comportamientos locales: la desconfianza inicial al pago en línea, la preferencia por ciertos formatos de precios, la importancia del WhatsApp como canal de soporte. Un diseño UX que ignora el contexto cultural local tiene altas probabilidades de fracasar.",
        },
        {
          tipo: "subtitulo",
          contenido: "Como convertirse en diseñadora UX",
        },
        {
          tipo: "lista",
          items: [
            "Figma: la herramienta de diseño colaborativo más usada en la industria, con versión gratuita para estudiantes",
            "Adobe XD: alternativa de Adobe al ecosistema Figma, con integración con Photoshop e Illustrator",
            "Maze: plataforma de pruebas de usabilidad remota que permite testear prototipos con usuarios reales",
            "Hotjar: herramienta de análisis de comportamiento que registra mapas de calor y grabaciones de sesiones",
            "Miro: pizarra colaborativa virtual usada para talleres de Design Thinking y mapeo de experiencias",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "El diseño UX tiene sus raíces en lo que originalmente se llamó ingeniería de factores humanos, una disciplina que nació durante la Segunda Guerra Mundial para diseñar cabinas de aviones que los pilotos pudieran operar bajo estrés sin cometer errores fatales. Don Norman, que popularizó el término diseño centrado en el usuario, trabajó en Apple en los años 90 y su libro El diseño de los objetos cotidianos es lectura fundamental en cualquier programa UX del mundo.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Proceso de diseño UX/UI mostrando las etapas de investigación, wireframing, prototipado y testeo con usuarios",
          caption:
            "El proceso UX no es lineal: investigación, diseño y testeo se alternan en ciclos iterativos.",
        },
      ],
    },
  },

  {
    slug: "cd-iii-ciberseguridad-mexico-demanda-etica",
    titulo:
      "Ciberseguridad en Mexico: la carrera critica con mayor deficit de talento",
    categoria: "Vocaciones y carreras digitales",
    conceptos_clave: [
      "ciberseguridad",
      "hacking etico",
      "CERT-MX",
      "ransomware",
      "proteccion de datos",
    ],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "México es uno de los países más atacados cibernéticamente en América Latina, según Check Point Research. En 2023, el país recibió en promedio más de 1,600 ataques semanales por organización, afectando a empresas, gobierno e infraestructura crítica. Los tipos de ataques más comunes incluyen ransomware (secuestro de datos con extorsión económica), phishing (suplantación de identidad por correo electrónico), inyección SQL (ataque a bases de datos) y ataques DDoS (saturación de servidores para inhabilitarlos).",
        },
        {
          tipo: "parrafo",
          contenido:
            "Un caso emblemático fue el ataque de ransomware a PEMEX en noviembre de 2019, cuando cibercriminales cifraron miles de computadoras de la empresa y exigieron un rescate de 4.9 millones de dólares en criptomonedas. PEMEX se negó a pagar, pero el ataque paralizó operaciones administrativas durante días. Estos incidentes demuestran que la ciberseguridad no es un tema técnico abstracto: afecta directamente la economía, los servicios públicos y la soberanía nacional.",
        },
        {
          tipo: "parrafo",
          contenido:
            "Las principales instituciones de ciberseguridad en México son CERT-MX (Computer Emergency Response Team México), adscrito a la Guardia Nacional, que coordina la respuesta a incidentes en infraestructura crítica, e INAI (Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos Personales), que regula el manejo de datos personales. CONDUSEF emite alertas periódicas sobre fraudes cibernéticos en el sector bancario.",
        },
        {
          tipo: "subtitulo",
          contenido: "Etica en la ciberseguridad",
        },
        {
          tipo: "lista",
          items: [
            "Seguridad de redes: protección de infraestructura de comunicaciones contra intrusiones y espionaje",
            "Seguridad de aplicaciones: análisis y hardening de software antes y después de su lanzamiento",
            "Seguridad en la nube: protección de datos y servicios alojados en AWS, Azure o Google Cloud",
            "Forense digital: análisis de evidencia digital en investigaciones criminales y corporativas",
            "Respuesta a incidentes: equipos de CSIRT que gestionan ataques activos en tiempo real",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El hacking ético, también llamado pentesting (pruebas de penetración), es completamente legal cuando existe autorización explícita de la organización. Empresas como Google, Meta, Microsoft y cientos de startups tienen programas de bug bounty: pagan a investigadores de seguridad independientes desde unos cientos hasta decenas de miles de dólares por cada vulnerabilidad que encuentren y reporten responsablemente. Es una de las pocas áreas tecnológicas donde la experiencia práctica supera ampliamente al título universitario.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Mapa de las especialidades de ciberseguridad mostrando las cinco áreas principales y sus interrelaciones",
          caption:
            "La ciberseguridad es un campo multidisciplinario que requiere conocimientos técnicos, legales y de comunicación.",
        },
      ],
    },
  },

  // ── Categoría 4: Participación ciudadana digital ─────────────────────────

  {
    slug: "cd-iii-activismo-digital-hashtags-mexico",
    titulo:
      "Activismo digital en Mexico: hashtags que cambiaron el debate publico",
    categoria: "Participación ciudadana digital",
    conceptos_clave: [
      "activismo digital",
      "hashtag",
      "redes sociales",
      "movimiento social",
      "accion colectiva",
    ],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El activismo digital utiliza redes sociales, plataformas en línea y herramientas digitales para organizar, amplificar y movilizar movimientos sociales. En México, los hashtags han demostrado tener un poder real para colocar temas en la agenda pública y presionar a autoridades a actuar. La clave está en que no son solo tendencias pasajeras, sino puntos de organización colectiva que conectan historias individuales en una narrativa común.",
        },
        {
          tipo: "parrafo",
          contenido:
            "Algunos de los hashtags más significativos en México en años recientes incluyen: #MeTooMexicano (2018-2019), que detonó miles de denuncias de acoso sexual en entornos académicos, literarios y periodísticos; #MiPrimerAcoso, donde mujeres compartieron sus primeras experiencias de acoso muchas veces desde la infancia; #JusticiaParaFátima (2020), que surgió tras el feminicidio de Fátima Cecilia Aldrigett y exigió respuesta institucional urgente. Estos movimientos presionaron al gobierno federal y estatal a pronunciarse públicamente sobre la crisis de feminicidios.",
        },
        {
          tipo: "subtitulo",
          contenido: "Del hashtag a la accion",
        },
        {
          tipo: "lista",
          items: [
            "Slacktivismo: dar like o compartir sin más acción — visibiliza pero no moviliza recursos",
            "Activismo digital real: organiza reuniones, recauda fondos y coordina acciones presenciales",
            "Slacktivismo: firma peticiones en línea sin seguimiento posterior de su impacto",
            "Activismo digital real: documentación sistemática y archivo de evidencias de violaciones de derechos",
            "Activismo digital real: redes de solidaridad que ofrecen acompañamiento emocional, legal y de seguridad",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Los hashtags sin acción fuera de línea tienen impacto limitado. Los movimientos más efectivos combinan la amplificación digital con organización territorial: Marea Verde en México utilizó redes sociales para coordinar miles de manifestaciones simultáneas en múltiples ciudades, convirtiendo la tendencia en Twitter en movilización real. La tecnología amplifica la acción humana; no la sustituye.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Cronología visual de los principales hashtags de activismo social en México desde 2018 hasta 2024",
          caption:
            "Los hashtags de activismo en México han creado archivos digitales de testimonios con valor histórico y legal.",
        },
      ],
    },
  },

  {
    slug: "cd-iii-plataformas-participacion-ciudadana-conapred",
    titulo: "Plataformas de participacion ciudadana digital en Mexico",
    categoria: "Participación ciudadana digital",
    conceptos_clave: [
      "participacion ciudadana",
      "plataformas digitales",
      "Change.org",
      "CONAPRED",
      "gobierno digital",
    ],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Las plataformas de participación ciudadana digital permiten a las personas reportar problemas, firmar peticiones, exigir rendición de cuentas y acceder a servicios gubernamentales sin intermediarios. Representan una democratización del acceso a los mecanismos de participación política: cualquier ciudadana con conexión a internet puede presentar una queja ante el INAI, firmar una petición o acceder a información pública sin necesidad de contratar abogados o trasladarse a oficinas.",
        },
        {
          tipo: "parrafo",
          contenido:
            "Change.org es la plataforma de peticiones más usada en México: la petición más firmada en la historia del país exigió medidas contra los feminicidios, acumulando más de 2 millones de firmas. Organizaciones de la sociedad civil como Transparencia Mexicana, IMCO (Instituto Mexicano para la Competitividad) y MexicoAbierto usan datos públicos para monitorear el desempeño gubernamental y publicar rankings de transparencia. CONAPRED tiene un sistema digital de denuncias por discriminación accesible desde su sitio web.",
        },
        {
          tipo: "subtitulo",
          contenido: "Limites de la participacion digital",
        },
        {
          tipo: "parrafo",
          contenido:
            "La participación ciudadana digital tiene límites reales que no deben ignorarse. La desigualdad de acceso excluye a millones de mexicanos sin internet o sin habilidades digitales suficientes. Los bots y granjas de cuentas falsas pueden manipular peticiones y tendencias. Y quizás el límite más importante: las autoridades no están legalmente obligadas a responder o actuar frente a peticiones digitales, aunque sí frente a solicitudes formales de información presentadas por los canales oficiales.",
        },
        {
          tipo: "lista",
          items: [
            "Petición ciudadana en línea: Change.org, peticiones.gob.mx para temas federales",
            "Denuncia de corrupción: Plataforma Nacional de Denuncia de la SFP (secretariadefuncion.gob.mx)",
            "Solicitud de acceso a información: Plataforma Nacional de Transparencia (infomex.org.mx)",
            "Uso de datos abiertos: datos.gob.mx ofrece conjuntos de datos gubernamentales para ciudadanos y periodistas",
            "Periodismo ciudadano digital: documentar y difundir con herramientas como Ushahidi o plataformas locales",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "La Plataforma Nacional de Transparencia (transparencia.gob.mx) permite a cualquier ciudadano presentar una solicitud de acceso a la información a cualquier institución federal en menos de 10 minutos. El gobierno tiene un plazo máximo de 20 días hábiles para responder. Este es un derecho fundamental reconocido en el artículo sexto de la Constitución Mexicana: el acceso a la información es un derecho humano, no un privilegio.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Ecosistema de plataformas de participación ciudadana digital en México, incluyendo portales gubernamentales y organizaciones de la sociedad civil",
          caption:
            "La participación ciudadana digital en México combina plataformas gubernamentales, de sociedad civil e internacionales.",
        },
      ],
    },
  },

  {
    slug: "cd-iii-desinformacion-democracia-ecosistema-mexico",
    titulo:
      "Ecosistema de desinformacion en Mexico: como las noticias falsas afectan la democracia",
    categoria: "Participación ciudadana digital",
    conceptos_clave: [
      "desinformacion",
      "noticias falsas",
      "fact-checking",
      "Animal Politico",
      "democracia digital",
    ],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El campo de la desinformación distingue tres conceptos que con frecuencia se confunden. La desinformación es información falsa difundida de manera intencional para engañar o manipular. La desinformación no intencional (en inglés misinformation) es también falsa, pero quien la comparte cree genuinamente que es verdad. La malinformación es información verdadera difundida fuera de contexto o en el momento estratégico para dañar a una persona o institución. Los tres fenómenos erosionan la calidad del debate democrático.",
        },
        {
          tipo: "parrafo",
          contenido:
            "Durante la pandemia de COVID-19, México fue escenario de docenas de casos de desinformación con consecuencias de salud pública: circularon consejos falsos sobre beber dióxido de cloro, megadosis de vitaminas con efectos peligrosos o infusiones de plantas que supuestamente curaban el virus. En tiempos electorales, el ecosistema de desinformación se activó con citas falsas atribuidas a candidatas y candidatos, imágenes manipuladas con Photoshop y redes de bots que amplificaban narrativas favorables a sus contratantes.",
        },
        {
          tipo: "subtitulo",
          contenido: "Como verificar informacion",
        },
        {
          tipo: "parrafo",
          contenido:
            "Un estudio del MIT Media Lab publicado en Science (Vosoughi, Roy y Aral, 2018) analizó 126,000 cadenas de difusión en Twitter y encontró que las noticias falsas se difundían 6 veces más rápido que las verdaderas, llegaban a más personas y penetraban más profundamente en las redes sociales. La novedad y el contenido emocionalmente activador (indignación, miedo, sorpresa) eran los principales predictores de viralización, independientemente de la veracidad.",
        },
        {
          tipo: "lista",
          items: [
            "Identificar la afirmación concreta: ¿qué exactamente se está diciendo y quién lo dice?",
            "Buscar la fuente primaria: ¿hay un documento, estudio o declaración oficial que respalde la afirmación?",
            "Hacer búsqueda inversa de imágenes: en Google Images o TinEye para verificar si la foto es real y de cuándo es",
            "Consultar sitios de fact-checking: Verificado México, Animal Político, Chequeado o AFP Factual",
            "Considerar el contexto completo: ¿la información es correcta pero se está usando fuera de su contexto original?",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "México tiene uno de los niveles más bajos de confianza en los medios de comunicación de América Latina, según el Reuters Institute Digital News Report 2023. Sin embargo, la desconfianza total en todos los medios no es la respuesta correcta: lleva a un escepticismo corrosivo donde nada puede saberse con certeza. La alfabetización mediática —saber evaluar críticamente la calidad de las fuentes— es el antídoto tanto a la credulidad ingenua como al cinismo paralizante.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama del ecosistema de verificación de información en México mostrando los principales medios y organizaciones de fact-checking",
          caption:
            "La coalición Verificado México reúne a medios y organizaciones para combatir la desinformación de forma coordinada.",
        },
      ],
    },
  },

  // ── Categoría 5: Ética y producción de contenidos digitales ──────────────

  {
    slug: "cd-iii-licencias-creative-commons-derechos-autor",
    titulo:
      "Licencias Creative Commons y derechos de autor en el mundo digital",
    categoria: "Ética y producción de contenidos digitales",
    conceptos_clave: [
      "Creative Commons",
      "derechos de autor",
      "propiedad intelectual",
      "uso justo",
      "dominio publico",
    ],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Los derechos de autor protegen las creaciones intelectuales originales: textos, imágenes, música, videos, código de software. En México, la Ley Federal del Derecho de Autor establece que una obra queda protegida automáticamente desde el momento de su creación, sin necesidad de registrarla. Esto significa que una foto que tomas con tu celular, un texto que escribes o una canción que compones ya tienen protección legal, aunque nunca la registres ante el INDAUTOR.",
        },
        {
          tipo: "parrafo",
          contenido:
            "Creative Commons es un sistema de licencias diseñado para que los creadores puedan comunicar exactamente qué usos permiten de sus obras. Fue creado en 2001 como alternativa flexible al copyright tradicional. Sus licencias principales son: CC-BY (solo requiere dar crédito al autor), CC-BY-SA (crédito más obligación de compartir bajo la misma licencia), CC-BY-NC (uso no comercial únicamente), CC-BY-ND (no se permiten obras derivadas o modificaciones) y CC0 (renuncia a todos los derechos, equivalente al dominio público).",
        },
        {
          tipo: "subtitulo",
          contenido: "Como citar contenido digital",
        },
        {
          tipo: "lista",
          items: [
            "Las ideas y los conceptos: no se pueden patentar las ideas, solo su expresión específica",
            "Los hechos y datos estadísticos: las cifras del INEGI o del censo no tienen derechos de autor",
            "Los documentos oficiales del gobierno mexicano: leyes, decretos y resoluciones son de dominio público",
            "Las fórmulas matemáticas y algoritmos: no son protegibles por derechos de autor (sí por patente en algunos casos)",
            "Las obras en dominio público: en México, 100 años después de la muerte del autor",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "En México, crear una obra otorga automáticamente la protección de derechos de autor: no necesitas registrarla. Las obras pasan al dominio público 100 años después de la muerte del autor, lo que es uno de los plazos más largos del mundo. Wikipedia utiliza licencias CC-BY-SA, lo que permite a cualquier persona usar su contenido siempre que den crédito y publiquen sus modificaciones bajo la misma licencia. Muchas fotografías en Flickr también tienen licencias Creative Commons que puedes usar libremente.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Tabla visual de los seis tipos de licencias Creative Commons con sus íconos y usos permitidos",
          caption:
            "Las licencias Creative Commons permiten a los creadores comunicar claramente qué pueden hacer otros con su obra.",
        },
      ],
    },
  },

  {
    slug: "cd-iii-sesgos-algoritmicos-discriminacion-ia",
    titulo:
      "Sesgos algoritmicos: cuando la inteligencia artificial perpetua la injusticia",
    categoria: "Ética y producción de contenidos digitales",
    conceptos_clave: [
      "sesgo algoritmico",
      "inteligencia artificial",
      "discriminacion digital",
      "COMPAS",
      "equidad en IA",
    ],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Los sistemas de inteligencia artificial aprenden de datos históricos. Si esos datos reflejan discriminaciones y desigualdades sociales preexistentes, el algoritmo aprende esas discriminaciones y las automatiza y escala. El sesgo algorítmico no es solo un error técnico: es la codificación de injusticias humanas en sistemas que se perciben como objetivos por ser matemáticos, lo que los vuelve más difíciles de cuestionar.",
        },
        {
          tipo: "parrafo",
          contenido:
            "Casos documentados globalmente: COMPAS fue un algoritmo usado en tribunales de Estados Unidos para predecir la reincidencia criminal de acusados. Un análisis de ProPublica en 2016 demostró que el sistema clasificaba erróneamente a personas negras como de alto riesgo con el doble de frecuencia que a personas blancas. Amazon desarrolló un sistema de IA para filtrar currículos que aprendió a penalizar a candidatas mujeres porque fue entrenado con el historial de contrataciones pasadas, dominado por hombres. Los sistemas de reconocimiento facial de varios proveedores muestran tasas de error hasta 35% más altas en mujeres de piel oscura (MIT Media Lab, Joy Buolamwini, 2018).",
        },
        {
          tipo: "subtitulo",
          contenido: "Hacia una IA mas justa",
        },
        {
          tipo: "parrafo",
          contenido:
            "En México, los algoritmos de scoring crediticio pueden discriminar por código postal, afectando a personas que viven en colonias populares aunque tengan buen historial de pago. Las plataformas de empleo digital pueden reproducir sesgos de género o etnia en sus sistemas de recomendación de candidatos. Estas discriminaciones son difíciles de detectar y probar porque los algoritmos suelen ser cajas negras sin transparencia.",
        },
        {
          tipo: "lista",
          items: [
            "Transparencia: los sistemas de IA que toman decisiones sobre personas deben ser explicables y auditables",
            "Responsabilidad: debe haber personas y organizaciones responsables de los errores y daños del sistema",
            "Equidad: el sistema no debe discriminar sistemáticamente por raza, género, clase, origen o discapacidad",
            "Privacidad: los datos personales usados para entrenar sistemas deben estar protegidos y ser consentidos",
            "Supervisión humana: las decisiones importantes sobre personas no deben quedar solo en manos del algoritmo",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "En México, el INAI está trabajando en marcos de regulación de inteligencia artificial, pero los marcos específicos todavía están en desarrollo. Mientras tanto, la Ley Federal de Protección de Datos Personales en Posesión de Particulares ya establece que los ciudadanos tienen derechos sobre sus datos. Cualquier persona tiene derecho a saber cuándo una decisión que la afecta fue tomada por un algoritmo y a solicitar una revisión humana de esa decisión.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Ilustración del ciclo de retroalimentación del sesgo algorítmico: datos sesgados generan modelos sesgados que producen decisiones discriminatorias que refuerzan los datos sesgados",
          caption:
            "El sesgo algorítmico opera en un ciclo de retroalimentación que puede amplificar la discriminación con el tiempo.",
        },
      ],
    },
  },

  {
    slug: "cd-iii-economia-atencion-bienestar-digital",
    titulo:
      "La economia de la atencion: como las plataformas capturan tu tiempo y como resistir",
    categoria: "Ética y producción de contenidos digitales",
    conceptos_clave: [
      "economia de la atencion",
      "bienestar digital",
      "screen time",
      "dopamina",
      "diseno persuasivo",
    ],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La economía de la atención es el modelo de negocio que domina internet. El economista Herbert Simon la articuló en 1971: en un mundo con abundancia de información, lo que se vuelve escaso no es la información sino la atención humana. Las plataformas digitales compiten ferozmente por capturar y retener esa atención, porque cada minuto que pasas en la app es un minuto en que puedes ver más anuncios, generar más datos y contribuir a su modelo de negocio.",
        },
        {
          tipo: "parrafo",
          contenido:
            "Las técnicas de diseño persuasivo que usan las plataformas no son accidentales: son el resultado de décadas de investigación en psicología del comportamiento. El scroll infinito elimina el punto de parada natural que existía cuando la página terminaba. Las notificaciones usan refuerzo intermitente, el mismo mecanismo que hace adictivas a las máquinas tragamonedas: no sabes cuándo llegará la recompensa (un like, un mensaje), lo que genera un ciclo de comprobación compulsiva. Netflix estudió internamente que desactivar el autoplay les costaría el 30% de su tiempo de visualización total.",
        },
        {
          tipo: "parrafo",
          contenido:
            "La neurociencia detrás de esto es clara: cada notificación, cada like, cada mensaje nuevo activa una pequeña liberación de dopamina en el cerebro. Los sistemas de recompensa variable —donde no sabes cuándo llegará el siguiente estímulo positivo— son los más efectivos para generar comportamiento compulsivo, como lo documentó el psicólogo B.F. Skinner en sus experimentos clásicos. Las plataformas, en palabras de ex empleados de Silicon Valley, son básicamente máquinas de dopamina diseñadas por equipos de psicólogos y neurocientíficos.",
        },
        {
          tipo: "subtitulo",
          contenido: "Estrategias de resistencia",
        },
        {
          tipo: "lista",
          items: [
            "Tiempo de pantalla programado: define bloques horarios para revisar redes en lugar de hacerlo compulsivamente",
            "Agrupación de notificaciones: desactiva notificaciones en tiempo real y revísalas solo en momentos designados",
            "Modo escala de grises: configurar el teléfono en blanco y negro reduce significativamente el atractivo visual de las apps",
            "Temporizadores de aplicaciones: usa la función Screen Time (iOS) o Bienestar Digital (Android) para límites automáticos",
            "Zonas y momentos libres de teléfono: dormitorio, primera hora de la mañana, comidas en familia",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Ex empleados de grandes plataformas como Tristan Harris (ex Google, fundador del Center for Humane Technology) advierten desde adentro que las aplicaciones no están diseñadas para el beneficio del usuario sino para maximizar métricas de engagement que se venden a anunciantes. El mexicano promedio usa su smartphone 4.2 horas al día (DataReportal 2023). Saber que esto es resultado de un diseño deliberado y no de libre elección es el primer paso hacia un uso consciente. El objetivo no es eliminar la tecnología sino usarla como herramienta, no ser usado por ella.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Ilustración comparativa del uso consciente versus el uso compulsivo del teléfono, con estrategias de bienestar digital",
          caption:
            "El bienestar digital no es anti-tecnología: es recuperar la agencia sobre cómo y cuándo usamos nuestros dispositivos.",
        },
      ],
    },
  },
] as const;

export async function seedBibliotecaCDIII(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed Biblioteca CD-III (15 fichas)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac")
    .select("id")
    .eq("codigo", "CD-III")
    .single();

  if (uacErr || !uacRow) {
    throw new Error(
      `UAC CD-III no encontrada. Ejecuta primero seed-mccems.ts y seed-cdiii.ts. Error: ${uacErr?.message}`
    );
  }

  const rows = FICHAS_CDIII.map((f, i) => ({
    uac_id: uacRow.id,
    slug: f.slug,
    titulo: f.titulo,
    categoria: f.categoria,
    conceptos_clave: f.conceptos_clave as unknown as string[],
    tiempo_lectura_minutos: f.tiempo_lectura_minutos,
    es_placeholder: f.es_placeholder,
    contenido: f.contenido,
    orden: i + 1,
  }));

  const { error } = await sb
    .from("fichas_biblioteca")
    .upsert(rows, { onConflict: "slug" });

  if (error) throw new Error(`Error seeding fichas CD-III: ${error.message}`);

  console.log(
    `  ✓ ${rows.length} fichas de biblioteca de CD-III insertadas/actualizadas.`
  );
  console.log("\n✅ Seed Biblioteca CD-III completado.\n");
}

if (
  process.env.NODE_ENV !== "test" &&
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  config({ path: resolve(process.cwd(), ".env.local") });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error(
      "❌ Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY"
    );
    process.exit(1);
  }
  const sb = createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  seedBibliotecaCDIII(sb).catch((err) => {
    console.error("❌ Error:", err.message);
    process.exit(1);
  });
}
