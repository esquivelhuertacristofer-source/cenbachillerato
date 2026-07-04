/**
 * Datos del Laboratorio — Carreras y profesiones en el campo digital:
 * panorama con perspectiva de género (CD-III-P03, Cultura Digital III).
 *
 * Contenido VERBATIM de CD-III·P03. Los perfiles, sus funciones, el glosario, los
 * ejemplos y las afirmaciones del cuestionario se toman literalmente de las
 * actividades A1 (infografía), A2 (quiz V/F), A4 (V/F) y A5 (glosario). Los
 * perfiles a clasificar son los ocho que la propia infografía (A1,
 * descripcion_accesible) enumera; las áreas son las que la fuente nombra.
 */

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 1 — ¿A qué área pertenece? (clasifica cada perfil por su área digital)
 * Los ocho perfiles son los que enumera A1 (descripcion_accesible).
 * ───────────────────────────────────────────────────────────────────────── */
export type Area = "datos-ia" | "seguridad" | "diseno" | "comunicacion";

export const AREA_INFO: Record<
  Area,
  { titulo: string; subtitulo: string; icono: string }
> = {
  "datos-ia": {
    titulo: "Datos e inteligencia artificial",
    subtitulo:
      "Extraen conocimiento de grandes conjuntos de datos y construyen sistemas inteligentes para apoyar decisiones.",
    icono: "fa-chart-line",
  },
  seguridad: {
    titulo: "Seguridad e infraestructura",
    subtitulo:
      "Protegen sistemas, redes y datos, y sostienen la infraestructura digital (la nube) sobre la que operan las organizaciones.",
    icono: "fa-shield-halved",
  },
  diseno: {
    titulo: "Desarrollo y diseño de producto",
    subtitulo:
      "Construyen y diseñan los productos digitales: el software y las interfaces intuitivas y estéticas con que interactúan las personas.",
    icono: "fa-pen-ruler",
  },
  comunicacion: {
    titulo: "Comunicación y marketing digital",
    subtitulo:
      "Gestionan la presencia, la comunidad y la difusión de las organizaciones en los entornos digitales.",
    icono: "fa-bullhorn",
  },
};

export const PERFILES: { id: string; texto: string; area: Area }[] = [
  { id: "pe-dev", texto: "Desarrollador de software (frontend/backend/fullstack)", area: "diseno" },
  { id: "pe-uxui", texto: "Diseñador UX/UI", area: "diseno" },
  { id: "pe-datos", texto: "Científico de datos", area: "datos-ia" },
  { id: "pe-ia", texto: "Especialista en inteligencia artificial", area: "datos-ia" },
  { id: "pe-ciber", texto: "Especialista en ciberseguridad", area: "seguridad" },
  { id: "pe-cloud", texto: "Administrador de nube (cloud)", area: "seguridad" },
  { id: "pe-cm", texto: "Community Manager", area: "comunicacion" },
  { id: "pe-mkt", texto: "Especialista en marketing digital", area: "comunicacion" },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 2 — ¿Qué hace cada perfil? (empareja perfil → función)
 * Funciones verbatim de A1 (puntos_clave / descripcion_accesible) y A5.
 * ───────────────────────────────────────────────────────────────────────── */
export const FUNCIONES: { id: string; perfil: string; funcion: string; ejemplo: string }[] = [
  {
    id: "fn-dev",
    perfil: "Desarrollador de software",
    funcion: "Es el perfil más demandado en México, con más de 40,000 posiciones vacantes anuales.",
    ejemplo: "Salario junior: $15,000–$25,000 MXN/mes; senior: $45,000–$90,000 MXN/mes (AMITI 2024).",
  },
  {
    id: "fn-ciber",
    perfil: "Especialista en ciberseguridad",
    funcion: "Su demanda creció más del 200% en México entre 2020 y 2024.",
    ejemplo: "México es el segundo país más atacado de América Latina, lo que vuelve crítico este perfil.",
  },
  {
    id: "fn-datos",
    perfil: "Científico de datos",
    funcion: "Analiza grandes conjuntos de datos para apoyar decisiones estratégicas.",
    ejemplo: "INEGI, Banxico y el IMSS son los principales empleadores públicos de este perfil en México.",
  },
  {
    id: "fn-uxui",
    perfil: "Diseñador UX/UI",
    funcion: "Diseña interfaces intuitivas y estéticas.",
    ejemplo:
      "Es el perfil con mayor porcentaje de mujeres en el sector tecnológico mexicano (~40%), a diferencia del desarrollo de software (~18%).",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 3 — Empareja término y definición (glosario A5, verbatim)
 * ───────────────────────────────────────────────────────────────────────── */
export const PARES: { id: string; termino: string; definicion: string; ejemplo: string }[] = [
  {
    id: "gl-tic",
    termino: "Sector TIC (Tecnologías de la Información y Comunicación)",
    definicion:
      "Conjunto de industrias y profesiones relacionadas con la creación, gestión, difusión y uso de tecnologías digitales. Incluye programación, diseño digital, ciencia de datos, ciberseguridad, comunicación digital, inteligencia artificial y más.",
    ejemplo:
      "Una diseñadora UX (experiencia de usuario), un analista de datos, una ingeniera en ciberseguridad y un creador de contenido digital trabajan todas en el sector TIC, aunque con roles muy distintos.",
  },
  {
    id: "gl-uxui",
    termino: "Diseño UX/UI",
    definicion:
      "UX (User Experience) se ocupa de que los productos digitales sean funcionales, intuitivos y satisfactorios para el usuario. UI (User Interface) diseña los elementos visuales e interactivos de la interfaz. Ambos roles son fundamentales en el desarrollo de apps y sitios web.",
    ejemplo:
      "Cuando una app de banco es fácil de navegar, tiene botones grandes y claros, y el proceso de transferencia es intuitivo, hay detrás un trabajo de diseño UX/UI bien ejecutado.",
  },
  {
    id: "gl-datos",
    termino: "Ciencia de datos (Data Science)",
    definicion:
      "Disciplina que combina estadística, programación y conocimiento del dominio para extraer información valiosa de grandes conjuntos de datos. Permite tomar decisiones basadas en evidencia en áreas como salud, educación, negocios y gobierno.",
    ejemplo:
      "Un científico de datos puede analizar patrones en el ausentismo escolar de un municipio para identificar factores de riesgo y proponer intervenciones focalizadas.",
  },
  {
    id: "gl-ciber",
    termino: "Ciberseguridad",
    definicion:
      "Campo profesional dedicado a proteger sistemas informáticos, redes, datos y usuarios de ataques, accesos no autorizados, robo de información y otros riesgos digitales. Incluye roles como analista de seguridad, hacker ético y gestor de incidentes.",
    ejemplo:
      "Las empresas contratan especialistas en ciberseguridad para hacer «pruebas de penetración» (ethical hacking) que detecten vulnerabilidades antes de que los atacantes las exploten.",
  },
  {
    id: "gl-brecha",
    termino: "Brecha de género en STEM",
    definicion:
      "Subrepresentación histórica de mujeres y personas de géneros no binarios en carreras de Ciencia, Tecnología, Ingeniería y Matemáticas. Se origina en estereotipos de género, falta de referentes, sesgos en la enseñanza y ambientes laborales poco inclusivos.",
    ejemplo:
      "Según UNESCO, menos del 30% de los investigadores en ciencia y tecnología a nivel mundial son mujeres, y la brecha es aún mayor en ingeniería de software e inteligencia artificial.",
  },
  {
    id: "gl-trayectoria",
    termino: "Trayectoria formativa no lineal",
    definicion:
      "En el sector digital, muchas personas construyen su carrera combinando educación formal (universidad, técnico) con aprendizaje autodidacta, cursos en línea (MOOC), bootcamps, proyectos personales y comunidades de práctica. No existe una única ruta.",
    ejemplo:
      "Una desarrolladora web puede haber completado un bootcamp de 4 meses, tomado cursos gratuitos en plataformas como freeCodeCamp y construido un portafolio en GitHub, sin haber cursado una carrera universitaria tradicional.",
  },
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
    pregunta:
      "Las carreras vinculadas a las tecnologías digitales incluyen únicamente programación e ingeniería en sistemas; el diseño gráfico y la comunicación no pertenecen al sector digital.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro:
      "Falso. El sector digital es amplio e incluye programación, ingeniería de software, diseño UX/UI, ciencia de datos, ciberseguridad, marketing digital, gestión de redes sociales, comunicación digital y muchas más disciplinas.",
  },
  {
    pregunta:
      "Las mujeres y personas de géneros no binarios están históricamente subrepresentadas en carreras STEM (Ciencia, Tecnología, Ingeniería y Matemáticas) en comparación con los hombres.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro:
      "Correcto. Datos de organismos como la ONU y la UNESCO muestran que las mujeres representan apenas el 28-35% de los profesionales en carreras STEM a nivel global, una brecha que se ha documentado en prácticamente todos los países.",
  },
  {
    pregunta:
      "La habilidad de programar es la única competencia relevante para desarrollar una carrera exitosa en el sector de tecnologías digitales.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro:
      "Falso. El sector digital valora también pensamiento crítico, comunicación, trabajo en equipo, gestión de proyectos, creatividad, ética tecnológica y comprensión del impacto social de la tecnología, además de las habilidades técnicas.",
  },
  {
    pregunta:
      "La ciberseguridad es un campo profesional emergente dentro del sector digital que se ocupa de proteger sistemas, redes y datos de ataques o accesos no autorizados.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro:
      "Correcto. La ciberseguridad es una de las áreas de mayor crecimiento en el sector TIC, con alta demanda de profesionales que protejan la infraestructura digital de organizaciones y personas.",
  },
  {
    pregunta:
      "Para explorar vocaciones en el campo digital, es necesario esperar a ingresar a la universidad, ya que las habilidades TIC no pueden desarrollarse en el bachillerato.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro:
      "Falso. El bachillerato es una etapa clave para explorar vocaciones digitales a través de proyectos, cursos en línea, hackatones, comunidades digitales y certificaciones accesibles. Muchas personas desarrollan habilidades TIC significativas desde la preparatoria.",
  },
];

/** Dato verbatim del contexto mexicano de A1 (brecha de talento / nearshoring). */
export const DATO_CARRERAS =
  "México produce alrededor de 5,000 egresados universitarios en carreras de TI por año, pero el mercado laboral demanda más de 40,000 especialistas anuales. Guadalajara (el «Silicon Valley mexicano»), CDMX y Monterrey concentran el 70% del empleo tecnológico nacional.";
