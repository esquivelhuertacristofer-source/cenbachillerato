/**
 * Refuerzo de actividades para CD-III (Cultura Digital III — comunicación digital
 * multimodal, producción de contenidos con perspectiva de género, vocaciones digitales
 * y participación comunitaria mediada por tecnología) según la "Plantilla CEN por UAC".
 * Agrega A4-A7 a cada una de las 4 progresiones (ya tienen A1-A3):
 *   A4 = quiz_verdadero_falso · A5 = glosario_interactivo · A6 = fill_blanks · A7 = autoevaluacion
 * 4 progresiones × 4 = 16 actividades nuevas. estado='borrador'.
 * Alineado al programa oficial CD-III (MCCEMS 2025): comunicación multimodal, identidades digitales,
 * producción de contenidos con perspectiva de género, vocaciones TIC y proyectos comunitarios digitales.
 * Uso: npx tsx scripts/seed-activities-cdiii-refuerzo.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad, type ActividadInput } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

type Refuerzo = Pick<ActividadInput, "titulo" | "descripcion" | "tipo" | "xp" | "contenido">;

const letras = ["A4", "A5", "A6", "A7"];

// Escala estándar de autoevaluación (1-4) reutilizada en todas las progresiones.
const escala4 = [
  { valor: 1, etiqueta: "En inicio", descripcion: "Todavía necesito apoyo y consultar el material." },
  { valor: 2, etiqueta: "En proceso", descripcion: "Lo logro con algunos errores o dudas." },
  { valor: 3, etiqueta: "Logrado", descripcion: "Lo hago bien de forma autónoma." },
  { valor: 4, etiqueta: "Destacado", descripcion: "Lo hago con seguridad y puedo ayudar a otra persona." },
];

async function main() {
  const sb = createSB();
  log("\n🌱 Refuerzo CD-III — Cultura Digital III: A4-A7 por progresión\n");

  const progs = await getProgresionesDeUAC(sb, "CD-III");
  let ok = 0; let fail = 0;

  for (const p of progs) {
    const set = refuerzos[p.numero - 1];
    if (!set) { log(`⚠️  Sin refuerzos definidos para P${p.numero}`); continue; }
    for (let i = 0; i < set.length; i++) {
      const r = set[i];
      const res = await upsertActividad(sb, {
        codigo: `${p.codigo}-${letras[i]}`,
        titulo: r.titulo,
        descripcion: r.descripcion,
        tipo: r.tipo,
        progresion_id: p.id,
        xp: r.xp,
        contenido: r.contenido,
      });
      res ? ok++ : fail++;
    }
  }

  log(`\n✅ CD-III refuerzo: ${ok} actividades insertadas, ${fail} fallidas.\n`);
}

// ── REFUERZOS POR PROGRESIÓN ───────────────────────────────────────────────────

const refuerzos: Refuerzo[][] = [
  // ════════════ P01 — Comunicación digital multimodal e identidades sociales ════════════
  [
    {
      titulo: "Verdadero o Falso — Comunicación digital multimodal",
      descripcion: "Decide si cada afirmación sobre la comunicación multimodal, sus modos semióticos y sus efectos en la construcción de identidades y realidades sociales es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "La comunicación multimodal integra simultáneamente distintos modos semióticos (texto, imagen, audio, video, gesto) para construir significado.",
            respuesta: true,
            retroalimentacion: "Correcto. La multimodalidad reconoce que el significado se construye combinando múltiples modos de representación, no solo el texto escrito.",
          },
          {
            enunciado: "Los algoritmos de las redes sociales distribuyen los contenidos de manera completamente neutral, sin favorecer ningún tipo de mensaje o perfil de usuario.",
            respuesta: false,
            retroalimentacion: "Falso. Los algoritmos priorizan contenidos según criterios de engagement, tiempo de visualización y datos del usuario, lo que genera burbujas de filtro y puede amplificar ciertos mensajes mientras silencia otros.",
          },
          {
            enunciado: "La identidad digital de una persona está determinada exclusivamente por lo que ella misma publica en redes sociales.",
            respuesta: false,
            retroalimentacion: "Falso. La identidad digital se construye también por los datos recopilados por plataformas, los perfiles que crean los algoritmos, las etiquetas de terceros y la huella digital acumulada.",
          },
          {
            enunciado: "Un meme puede ser analizado como un texto multimodal porque combina imagen fija y texto escrito para producir un significado que ninguno de los dos elementos transmitiría por separado.",
            respuesta: true,
            retroalimentacion: "Correcto. El meme es un formato multimodal donde la imagen y el texto se complementan e interactúan para crear un mensaje específico, a menudo con intención irónica o humorística.",
          },
          {
            enunciado: "La realidad social construida en entornos digitales no tiene efectos en la vida offline de las personas.",
            respuesta: false,
            retroalimentacion: "Falso. Las narrativas digitales influyen en percepciones, actitudes, relaciones y decisiones que se manifiestan en la vida cotidiana fuera de la pantalla, como demuestran fenómenos como el cyberbullying o los movimientos sociales en línea.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Comunicación digital multimodal e identidad digital",
      descripcion: "Glosario interactivo de conceptos clave sobre multimodalidad, semiótica digital, identidad en línea y construcción de realidades sociales en entornos digitales.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Comunicación multimodal",
            definicion: "Forma de comunicar que combina de manera simultánea e integrada diferentes modos semióticos: texto escrito, imagen, audio, video, color, gesto y diseño espacial. El significado emerge de la interacción entre todos los modos.",
            ejemplo: "Un video de TikTok que combina música, texto superpuesto, efectos visuales y gestos del creador es un mensaje multimodal donde cada elemento aporta capas de significado.",
            etiquetas: ["multimodalidad", "semiótica", "comunicación"],
          },
          {
            termino: "Modo semiótico",
            definicion: "Sistema de recursos culturales y sociales para crear significado. Los modos digitales incluyen: texto, imagen estática, imagen en movimiento, audio, color, tipografía y diseño de interfaz.",
            ejemplo: "En una infografía, el modo visual (íconos y colores) y el modo textual (etiquetas y estadísticas) trabajan juntos para comunicar datos de forma accesible.",
            etiquetas: ["modo semiótico", "representación", "lenguaje digital"],
          },
          {
            termino: "Identidad digital",
            definicion: "Conjunto de rasgos, representaciones y datos que caracterizan a una persona en entornos digitales. Se construye a partir de publicaciones propias, datos recopilados por plataformas, interacciones y la narrativa que los algoritmos elaboran sobre el usuario.",
            ejemplo: "El perfil de Instagram de una persona refleja su identidad gestionada, pero los datos de comportamiento (qué ve, cuánto tiempo, a qué horas) forman una identidad calculada que las plataformas explotan comercialmente.",
            etiquetas: ["identidad digital", "huella digital", "privacidad"],
          },
          {
            termino: "Burbuja de filtro (filter bubble)",
            definicion: "Fenómeno por el cual los algoritmos personalizan el contenido que recibe un usuario basándose en sus interacciones previas, limitando su exposición a perspectivas diversas y reforzando sus creencias existentes.",
            ejemplo: "Si una persona solo interactúa con contenido de un partido político, el algoritmo le mostrará cada vez más contenido de ese espectro, reduciendo su exposición a otras posturas.",
            etiquetas: ["algoritmo", "burbuja de filtro", "desinformación"],
          },
          {
            termino: "Narrativa digital y construcción de realidad",
            definicion: "Las narrativas que circulan en entornos digitales configuran percepciones colectivas sobre grupos sociales, eventos y valores. A través de la repetición y viralización, ciertos relatos se naturalizan como 'realidad'.",
            ejemplo: "La difusión masiva de imágenes editadas o noticias falsas sobre migrantes puede construir una percepción social negativa que influye en políticas públicas y actitudes cotidianas.",
            etiquetas: ["narrativa", "construcción social", "posverdad"],
          },
          {
            termino: "Análisis crítico de medios digitales",
            definicion: "Práctica de examinar mensajes digitales preguntando: ¿quién lo produce?, ¿con qué intención?, ¿qué voces incluye y cuáles excluye?, ¿qué valores implica?, ¿qué efectos puede tener? Es una competencia de ciudadanía digital.",
            ejemplo: "Ante un video viral, el análisis crítico implica verificar la fuente, buscar el contexto original, identificar el encuadre elegido y preguntarse qué información omite.",
            etiquetas: ["pensamiento crítico", "alfabetización mediática", "ciudadanía digital"],
          },
        ],
        actividad_final: "Selecciona un mensaje digital que hayas recibido recientemente (publicación, meme, video corto o noticia). Identifica: (a) los modos semióticos que usa, (b) la identidad o imagen que construye sobre algún grupo social, (c) un posible sesgo o efecto en la percepción de la realidad. Redacta un párrafo de análisis crítico.",
      },
    },
    {
      titulo: "Completa los espacios — Comunicación multimodal e identidad digital",
      descripcion: "Completa los conceptos clave sobre comunicación multimodal, identidad digital y efectos de los algoritmos en la construcción de realidades sociales.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el término o concepto correcto.",
        texto_con_huecos: "La comunicación que combina texto, imagen, audio y video de manera integrada se denomina comunicación ___. El fenómeno por el cual los algoritmos limitan la exposición a perspectivas distintas se llama burbuja de ___. La representación digital que una persona construye de sí misma y que las plataformas elaboran con sus datos se denomina identidad ___. El análisis que cuestiona quién produce un mensaje, con qué intención y qué efectos tiene se llama análisis ___ de medios.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "multimodal",
            alternativas_aceptadas: [],
            pista: "La comunicación que usa múltiples modos semióticos (texto, imagen, audio, video) se llama comunicación ___.",
          },
          {
            posicion: 1,
            respuesta_correcta: "filtro",
            alternativas_aceptadas: ["filter bubble"],
            pista: "El algoritmo crea una ___ de filtro al personalizar el contenido y reducir la diversidad de perspectivas.",
          },
          {
            posicion: 2,
            respuesta_correcta: "digital",
            alternativas_aceptadas: [],
            pista: "La huella en línea y los datos que definen a una persona en el ciberespacio forman su identidad ___.",
          },
          {
            posicion: 3,
            respuesta_correcta: "crítico",
            alternativas_aceptadas: ["crítica"],
            pista: "Cuestionar la fuente, la intención y el efecto de un mensaje es hacer análisis ___ de medios.",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Comunicación digital multimodal",
      descripcion: "Reflexiona sobre tu capacidad de analizar críticamente la comunicación digital multimodal y sus efectos en la construcción de identidades y realidades sociales.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio. Esto te ayudará a identificar qué aspectos reforzar.",
        criterios: [
          { descripcion: "Identifico los modos semióticos (texto, imagen, audio, video) presentes en mensajes digitales y explico cómo interactúan para crear significado.", escala: escala4 },
          { descripcion: "Analizo críticamente mensajes digitales preguntando por su origen, intención, sesgos y efectos en la percepción de grupos sociales.", escala: escala4 },
          { descripcion: "Explico cómo los algoritmos de redes sociales construyen burbujas de filtro y moldean las identidades y realidades que percibimos en línea.", escala: escala4 },
          { descripcion: "Reconozco la diferencia entre mi identidad gestionada (lo que publico) y mi identidad calculada (lo que las plataformas infieren de mis datos).", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Alguna vez notaste que las redes sociales te mostraban principalmente contenido que confirma lo que ya piensas? ¿Qué podrías hacer conscientemente para ampliar las perspectivas a las que te expones en el entorno digital?",
      },
    },
  ],

  // ════════════ P02 — Producción de contenidos digitales con perspectiva de género e inclusión ════════════
  [
    {
      titulo: "Verdadero o Falso — Contenidos digitales con perspectiva de género",
      descripcion: "Decide si cada afirmación sobre la producción de contenidos digitales de calidad orientados a la transformación social con perspectiva de género e inclusión es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "La perspectiva de género en la producción de contenidos digitales implica cuestionar y desafiar los estereotipos de género reproducidos en medios y plataformas.",
            respuesta: true,
            retroalimentacion: "Correcto. Incorporar perspectiva de género significa identificar y cuestionar representaciones que perpetúan desigualdades, así como crear contenidos que promuevan la equidad.",
          },
          {
            enunciado: "Un contenido digital inclusivo solo necesita estar disponible en formato de texto, ya que todos los usuarios pueden leer.",
            respuesta: false,
            retroalimentacion: "Falso. La inclusión digital implica ofrecer contenidos accesibles para personas con diferentes capacidades: subtítulos para sordos, descripciones de audio para ciegos, lenguaje claro para personas con diferentes niveles de alfabetización, entre otros.",
          },
          {
            enunciado: "La brecha digital de género se refiere a las desigualdades en el acceso, uso y apropiación de las tecnologías digitales entre hombres y mujeres.",
            respuesta: true,
            retroalimentacion: "Correcto. La brecha digital de género abarca no solo el acceso a dispositivos o internet, sino también las habilidades digitales, la participación en espacios tecnológicos y la representación en carreras TIC.",
          },
          {
            enunciado: "Publicar un video en YouTube con lenguaje inclusivo y subtítulos automáticos es suficiente para garantizar que el contenido sea plenamente inclusivo.",
            respuesta: false,
            retroalimentacion: "Falso. Los subtítulos automáticos suelen cometer errores, especialmente con acentos regionales. La inclusión plena requiere revisar subtítulos, asegurar accesibilidad visual, usar lenguaje claro y considerar las condiciones de conectividad de la audiencia.",
          },
          {
            enunciado: "La calidad de un contenido digital orientado a la transformación social se mide únicamente por el número de visualizaciones o reproducciones que obtiene.",
            respuesta: false,
            retroalimentacion: "Falso. La calidad y el impacto social de un contenido no se reducen a métricas de viralidad. Un contenido puede tener alto impacto transformador en una comunidad específica con un alcance moderado pero bien dirigido.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Producción digital con perspectiva de género",
      descripcion: "Glosario interactivo sobre perspectiva de género, inclusión digital, brecha de género y estrategias para producir contenidos digitales transformadores y accesibles.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Perspectiva de género",
            definicion: "Enfoque analítico que examina cómo las normas, roles y expectativas sociales asignadas por género producen desigualdades. En la producción digital, implica crear contenidos que cuestionen estereotipos y promuevan relaciones más equitativas.",
            ejemplo: "Un podcast sobre carreras STEM que entrevista principalmente a mujeres científicas y tecnólogas aplica perspectiva de género al visibilizar referentes que suelen estar subrepresentados.",
            etiquetas: ["género", "equidad", "transformación social"],
          },
          {
            termino: "Brecha digital de género",
            definicion: "Desigualdad en el acceso, uso, habilidades y participación en entornos digitales entre personas de diferentes géneros. Afecta especialmente a mujeres y disidencias en comunidades rurales, de bajos ingresos y en países en desarrollo.",
            ejemplo: "En México, estudios han mostrado que las mujeres tienen menor acceso a dispositivos propios y menor participación en programas de formación tecnológica avanzada, lo que perpetúa desigualdades laborales en el sector TIC.",
            etiquetas: ["brecha digital", "género", "equidad tecnológica"],
          },
          {
            termino: "Contenido digital de calidad",
            definicion: "Producción digital que es veraz, accesible, relevante para su audiencia, éticamente producida (cita fuentes, respeta derechos de autor), estéticamente cuidada y orientada a un propósito comunicativo claro.",
            ejemplo: "Una infografía sobre violencia de género que cita estadísticas oficiales, usa lenguaje claro, tiene contraste visual adecuado y proporciona recursos de ayuda es un contenido de calidad.",
            etiquetas: ["calidad", "ética digital", "producción"],
          },
          {
            termino: "Accesibilidad digital",
            definicion: "Diseño de contenidos y plataformas que pueden ser usados por todas las personas, independientemente de sus capacidades físicas, sensoriales o cognitivas. Incluye subtítulos, descripciones de audio, contraste visual y lenguaje sencillo.",
            ejemplo: "Añadir texto alternativo (alt text) a las imágenes de un sitio web permite que personas con discapacidad visual, que usan lectores de pantalla, accedan al contenido de las imágenes.",
            etiquetas: ["accesibilidad", "inclusión", "diseño universal"],
          },
          {
            termino: "Transformación social digital",
            definicion: "Uso de herramientas y plataformas digitales para visibilizar problemáticas sociales, movilizar comunidades, amplificar voces marginadas y proponer soluciones colectivas a injusticias estructurales.",
            ejemplo: "Campañas como #MeToo o #NiUnaMenos usaron redes sociales para visibilizar la violencia de género y generar movimientos de incidencia política a escala global.",
            etiquetas: ["activismo digital", "cambio social", "comunidad"],
          },
          {
            termino: "Lenguaje incluyente",
            definicion: "Uso del lenguaje que evita la invisibilización o estereotipación de géneros. Puede incluir formas no binarias (la/el directora/director), términos neutros (estudiantado, comunidad) o el uso del género no marcado según contexto.",
            ejemplo: "En lugar de 'los alumnos', usar 'el alumnado' o 'las y los alumnos' incluye a todas las personas sin asumir un género por defecto.",
            etiquetas: ["lenguaje", "inclusión", "comunicación"],
          },
        ],
        actividad_final: "Elige una problemática social de tu comunidad (violencia, desigualdad, falta de espacios seguros, acceso a servicios). Diseña el concepto de un contenido digital (especifica formato: video, infografía, podcast, etc.) que lo aborde con perspectiva de género e inclusión. Describe: (a) la problemática, (b) la audiencia, (c) el formato y por qué lo elegiste, (d) al menos dos estrategias de accesibilidad que incluirías.",
      },
    },
    {
      titulo: "Completa los espacios — Producción digital con perspectiva de género",
      descripcion: "Completa los conceptos clave sobre la producción de contenidos digitales orientados a la transformación social con perspectiva de género e inclusión.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el término o concepto correcto.",
        texto_con_huecos: "La desigualdad en el acceso y uso de tecnologías entre géneros se denomina brecha digital de ___. Diseñar contenidos digitales que puedan ser utilizados por personas con distintas capacidades se llama ___ digital. Usar el término 'estudiantado' en lugar de 'los alumnos' es un ejemplo de lenguaje ___. Un contenido digital que cita fuentes confiables, respeta derechos de autor y tiene propósito comunicativo claro se considera de ___.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "género",
            alternativas_aceptadas: [],
            pista: "La desigualdad tecnológica entre hombres y mujeres se llama brecha digital de ___.",
          },
          {
            posicion: 1,
            respuesta_correcta: "accesibilidad",
            alternativas_aceptadas: ["accesible"],
            pista: "El principio que busca que todos puedan usar los contenidos digitales sin importar su capacidad se llama ___.",
          },
          {
            posicion: 2,
            respuesta_correcta: "incluyente",
            alternativas_aceptadas: ["inclusivo", "no sexista"],
            pista: "El lenguaje que evita invisibilizar o estereotipar géneros se llama lenguaje ___.",
          },
          {
            posicion: 3,
            respuesta_correcta: "calidad",
            alternativas_aceptadas: [],
            pista: "Un contenido veraz, accesible y éticamente producido es un contenido de ___.",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Producción digital con perspectiva de género e inclusión",
      descripcion: "Reflexiona sobre tu capacidad de producir contenidos digitales de calidad orientados a la transformación social con perspectiva de género e inclusión.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Identifico y cuestiono estereotipos de género en contenidos digitales y propongo formas de representar la diversidad de manera más equitativa.", escala: escala4 },
          { descripcion: "Produzco contenidos digitales aplicando criterios de accesibilidad (subtítulos, contraste, lenguaje claro) para audiencias diversas.", escala: escala4 },
          { descripcion: "Explico qué es la brecha digital de género y propongo al menos dos estrategias para reducirla en mi contexto.", escala: escala4 },
          { descripcion: "Diseño o evalúo contenidos digitales con perspectiva de género que busquen generar un impacto positivo en mi comunidad.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Has producido algún contenido digital recientemente (publicación, historia, video corto, comentario)? ¿Incorporaba perspectiva de género o criterios de inclusión? ¿Qué cambiarías si lo produjeras hoy con lo que aprendiste?",
      },
    },
  ],

  // ════════════ P03 — Vocaciones y trayectorias profesionales en tecnologías digitales ════════════
  [
    {
      titulo: "Verdadero o Falso — Vocaciones y carreras digitales con perspectiva de género",
      descripcion: "Decide si cada afirmación sobre las trayectorias profesionales en el sector digital, la perspectiva de género en las TIC y las habilidades del siglo XXI es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "Las carreras vinculadas a las tecnologías digitales incluyen únicamente programación e ingeniería en sistemas; el diseño gráfico y la comunicación no pertenecen al sector digital.",
            respuesta: false,
            retroalimentacion: "Falso. El sector digital es amplio e incluye programación, ingeniería de software, diseño UX/UI, ciencia de datos, ciberseguridad, marketing digital, gestión de redes sociales, comunicación digital y muchas más disciplinas.",
          },
          {
            enunciado: "Las mujeres y personas de géneros no binarios están históricamente subrepresentadas en carreras STEM (Ciencia, Tecnología, Ingeniería y Matemáticas) en comparación con los hombres.",
            respuesta: true,
            retroalimentacion: "Correcto. Datos de organismos como la ONU y la UNESCO muestran que las mujeres representan apenas el 28-35% de los profesionales en carreras STEM a nivel global, una brecha que se ha documentado en prácticamente todos los países.",
          },
          {
            enunciado: "La habilidad de programar es la única competencia relevante para desarrollar una carrera exitosa en el sector de tecnologías digitales.",
            respuesta: false,
            retroalimentacion: "Falso. El sector digital valora también pensamiento crítico, comunicación, trabajo en equipo, gestión de proyectos, creatividad, ética tecnológica y comprensión del impacto social de la tecnología, además de las habilidades técnicas.",
          },
          {
            enunciado: "La ciberseguridad es un campo profesional emergente dentro del sector digital que se ocupa de proteger sistemas, redes y datos de ataques o accesos no autorizados.",
            respuesta: true,
            retroalimentacion: "Correcto. La ciberseguridad es una de las áreas de mayor crecimiento en el sector TIC, con alta demanda de profesionales que protejan la infraestructura digital de organizaciones y personas.",
          },
          {
            enunciado: "Para explorar vocaciones en el campo digital, es necesario esperar a ingresar a la universidad, ya que las habilidades TIC no pueden desarrollarse en el bachillerato.",
            respuesta: false,
            retroalimentacion: "Falso. El bachillerato es una etapa clave para explorar vocaciones digitales a través de proyectos, cursos en línea, hackatones, comunidades digitales y certificaciones accesibles. Muchas personas desarrollan habilidades TIC significativas desde la preparatoria.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Vocaciones y trayectorias en el sector digital",
      descripcion: "Glosario interactivo sobre perfiles profesionales, habilidades del siglo XXI, perspectiva de género en las TIC y trayectorias formativas en el campo digital.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Sector TIC (Tecnologías de la Información y Comunicación)",
            definicion: "Conjunto de industrias y profesiones relacionadas con la creación, gestión, difusión y uso de tecnologías digitales. Incluye programación, diseño digital, ciencia de datos, ciberseguridad, comunicación digital, inteligencia artificial y más.",
            ejemplo: "Una diseñadora UX (experiencia de usuario), un analista de datos, una ingeniera en ciberseguridad y un creador de contenido digital trabajan todas en el sector TIC, aunque con roles muy distintos.",
            etiquetas: ["TIC", "sector digital", "empleo"],
          },
          {
            termino: "Diseño UX/UI",
            definicion: "UX (User Experience) se ocupa de que los productos digitales sean funcionales, intuitivos y satisfactorios para el usuario. UI (User Interface) diseña los elementos visuales e interactivos de la interfaz. Ambos roles son fundamentales en el desarrollo de apps y sitios web.",
            ejemplo: "Cuando una app de banco es fácil de navegar, tiene botones grandes y claros, y el proceso de transferencia es intuitivo, hay detrás un trabajo de diseño UX/UI bien ejecutado.",
            etiquetas: ["diseño", "UX", "UI", "experiencia de usuario"],
          },
          {
            termino: "Ciencia de datos (Data Science)",
            definicion: "Disciplina que combina estadística, programación y conocimiento del dominio para extraer información valiosa de grandes conjuntos de datos. Permite tomar decisiones basadas en evidencia en áreas como salud, educación, negocios y gobierno.",
            ejemplo: "Un científico de datos puede analizar patrones en el ausentismo escolar de un municipio para identificar factores de riesgo y proponer intervenciones focalizadas.",
            etiquetas: ["datos", "estadística", "programación"],
          },
          {
            termino: "Ciberseguridad",
            definicion: "Campo profesional dedicado a proteger sistemas informáticos, redes, datos y usuarios de ataques, accesos no autorizados, robo de información y otros riesgos digitales. Incluye roles como analista de seguridad, hacker ético y gestor de incidentes.",
            ejemplo: "Las empresas contratan especialistas en ciberseguridad para hacer 'pruebas de penetración' (ethical hacking) que detecten vulnerabilidades antes de que los atacantes las exploten.",
            etiquetas: ["seguridad", "hacking ético", "privacidad"],
          },
          {
            termino: "Brecha de género en STEM",
            definicion: "Subrepresentación histórica de mujeres y personas de géneros no binarios en carreras de Ciencia, Tecnología, Ingeniería y Matemáticas. Se origina en estereotipos de género, falta de referentes, sesgos en la enseñanza y ambientes laborales poco inclusivos.",
            ejemplo: "Según UNESCO, menos del 30% de los investigadores en ciencia y tecnología a nivel mundial son mujeres, y la brecha es aún mayor en ingeniería de software e inteligencia artificial.",
            etiquetas: ["género", "STEM", "equidad", "educación"],
          },
          {
            termino: "Trayectoria formativa no lineal",
            definicion: "En el sector digital, muchas personas construyen su carrera combinando educación formal (universidad, técnico) con aprendizaje autodidacta, cursos en línea (MOOC), bootcamps, proyectos personales y comunidades de práctica. No existe una única ruta.",
            ejemplo: "Una desarrolladora web puede haber completado un bootcamp de 4 meses, tomado cursos gratuitos en plataformas como freeCodeCamp y construido un portafolio en GitHub, sin haber cursado una carrera universitaria tradicional.",
            etiquetas: ["formación", "autogestión", "aprendizaje"],
          },
        ],
        actividad_final: "Investiga brevemente tres perfiles profesionales del sector digital que te generen curiosidad (puedes usar LinkedIn, IMCO u otras fuentes confiables). Para cada uno describe: (a) qué hace en su trabajo cotidiano, (b) qué formación requiere, (c) si existe brecha de género en ese perfil y qué barreras enfrentan las mujeres para acceder a él. Reflexiona sobre cuál te atrae más y por qué.",
      },
    },
    {
      titulo: "Completa los espacios — Vocaciones digitales y perspectiva de género",
      descripcion: "Completa los conceptos clave sobre perfiles profesionales, habilidades TIC y la perspectiva de género en el sector digital.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el término o concepto correcto.",
        texto_con_huecos: "El campo profesional que se ocupa de proteger sistemas y datos de ataques digitales se llama ___. La disciplina que combina estadística y programación para extraer valor de grandes conjuntos de datos se denomina ciencia de ___. El acrónimo que agrupa Ciencia, Tecnología, Ingeniería y Matemáticas, áreas donde persiste una brecha de género, es ___. El diseño de interfaces digitales que prioriza la experiencia del usuario se conoce como diseño ___ .",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "ciberseguridad",
            alternativas_aceptadas: ["seguridad informática", "seguridad digital"],
            pista: "El campo que protege sistemas, redes y datos de ataques o accesos no autorizados se llama ___.",
          },
          {
            posicion: 1,
            respuesta_correcta: "datos",
            alternativas_aceptadas: [],
            pista: "La ciencia que extrae información valiosa de grandes conjuntos de información es la ciencia de ___.",
          },
          {
            posicion: 2,
            respuesta_correcta: "STEM",
            alternativas_aceptadas: ["CTIM"],
            pista: "Las iniciales en inglés de Ciencia, Tecnología, Ingeniería y Matemáticas forman el acrónimo ___.",
          },
          {
            posicion: 3,
            respuesta_correcta: "UX",
            alternativas_aceptadas: ["UX/UI", "experiencia de usuario"],
            pista: "El diseño centrado en la experiencia y satisfacción del usuario se conoce como diseño ___ (o UX/UI).",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Vocaciones digitales y perspectiva de género",
      descripcion: "Reflexiona sobre tu exploración de trayectorias profesionales vinculadas a las tecnologías digitales y el papel de la perspectiva de género en el sector.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Identifico al menos cuatro perfiles profesionales distintos dentro del sector TIC y describo sus funciones principales.", escala: escala4 },
          { descripcion: "Explico qué es la brecha de género en STEM, sus causas estructurales y sus consecuencias para la sociedad.", escala: escala4 },
          { descripcion: "Reconozco mis propios intereses y habilidades en relación con posibles trayectorias formativas y profesionales en el campo digital.", escala: escala4 },
          { descripcion: "Propongo estrategias concretas para que el sector TIC sea más inclusivo y equitativo en cuanto a género.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Alguna vez has sentido que una carrera tecnológica 'no es para ti' por tu género u otro factor? ¿Qué referentes o experiencias cambiarían esa percepción? Si ya te interesa el sector digital, ¿qué pasos concretos puedes dar desde ahora para explorar esa vocación?",
      },
    },
  ],

  // ════════════ P04 — Proyecto de participación comunitaria mediado por tecnologías digitales ════════════
  [
    {
      titulo: "Verdadero o Falso — Proyectos comunitarios mediados por tecnología",
      descripcion: "Decide si cada afirmación sobre el diseño y desarrollo de proyectos de participación comunitaria mediados por tecnologías digitales es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "El diagnóstico comunitario es el primer paso en el diseño de un proyecto de participación digital y consiste en identificar las necesidades, recursos y contexto de la comunidad antes de proponer soluciones tecnológicas.",
            respuesta: true,
            retroalimentacion: "Correcto. Un buen diagnóstico comunitario evita imponer soluciones tecnológicas descontextualizadas y garantiza que el proyecto responda a necesidades reales de las personas.",
          },
          {
            enunciado: "La participación comunitaria digital requiere que todos los miembros de la comunidad tengan acceso a smartphones de última generación y conexión de banda ancha.",
            respuesta: false,
            retroalimentacion: "Falso. Un proyecto comunitario bien diseñado considera las condiciones de conectividad y los dispositivos disponibles en la comunidad, adaptando las herramientas digitales a la realidad existente (por ejemplo, SMS, WhatsApp, grupos de Facebook en lugar de plataformas que requieren conexión permanente).",
          },
          {
            enunciado: "En un proyecto de participación comunitaria digital, la evaluación solo debe realizarse al finalizar el proyecto para determinar si fue exitoso o no.",
            respuesta: false,
            retroalimentacion: "Falso. La evaluación debe ser continua (diagnóstico, proceso y resultado). El seguimiento durante la implementación permite ajustar el proyecto a tiempo y aprender de los obstáculos que surgen.",
          },
          {
            enunciado: "El activismo digital puede ser una forma de participación comunitaria: peticiones en línea, campañas en redes sociales y plataformas de incidencia pueden complementar la acción comunitaria presencial.",
            respuesta: true,
            retroalimentacion: "Correcto. El activismo digital amplía el alcance de la participación comunitaria y puede articularse con acciones presenciales para lograr mayor impacto. Herramientas como Change.org, campañas de hashtag o grupos de WhatsApp son ejemplos.",
          },
          {
            enunciado: "Al diseñar un proyecto digital comunitario, basta con elegir la tecnología más avanzada disponible para garantizar el éxito del proyecto.",
            respuesta: false,
            retroalimentacion: "Falso. El éxito de un proyecto comunitario depende principalmente de que responda a una necesidad real, involucre a la comunidad en su diseño e implementación, y sea sostenible. La tecnología es un medio, no un fin en sí mismo.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Participación comunitaria mediada por tecnología digital",
      descripcion: "Glosario interactivo sobre diagnóstico comunitario, diseño participativo, herramientas de participación digital y evaluación de proyectos comunitarios con tecnología.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Diagnóstico comunitario",
            definicion: "Proceso sistemático de identificar y analizar las necesidades, recursos, actores y contexto de una comunidad antes de diseñar una intervención. En proyectos digitales, incluye mapear el acceso a tecnología y las competencias digitales de la comunidad.",
            ejemplo: "Antes de crear una plataforma de información para vecinos, un grupo de estudiantes encuestó a 50 familias del barrio para saber qué dispositivos tenían, qué aplicaciones usaban y qué información necesitaban con más urgencia.",
            etiquetas: ["diagnóstico", "comunidad", "metodología"],
          },
          {
            termino: "Diseño participativo",
            definicion: "Enfoque de diseño que involucra a los usuarios finales (en este caso, la comunidad) como co-creadores del proyecto desde el inicio, no solo como receptores de soluciones. Garantiza pertinencia y apropiación del proyecto.",
            ejemplo: "Al diseñar una app para reportar baches en el municipio, el equipo realizó talleres con vecinos para que ellos mismos propusieran las funciones que necesitaban y el lenguaje más claro para usarla.",
            etiquetas: ["diseño participativo", "co-creación", "metodología"],
          },
          {
            termino: "Ciudadanía digital activa",
            definicion: "Práctica de participar responsablemente en la vida cívica, política y comunitaria a través de herramientas digitales: peticiones, campañas, consultas, difusión de información y organización colectiva en línea.",
            ejemplo: "Jóvenes de una preparatoria crearon una cuenta de Instagram para documentar problemas de infraestructura escolar y etiquetar a las autoridades municipales, logrando que se atendieran tres solicitudes en un semestre.",
            etiquetas: ["ciudadanía digital", "activismo", "participación"],
          },
          {
            termino: "Herramientas de participación digital",
            definicion: "Plataformas y aplicaciones que facilitan la organización, comunicación y acción colectiva en comunidades. Incluyen: grupos de WhatsApp/Telegram, encuestas en línea (Google Forms), plataformas de peticiones (Change.org), mapas colaborativos (Google Maps, Ushahidi) y redes sociales.",
            ejemplo: "Un grupo juvenil usó Google Forms para levantar datos sobre el estado de las luminarias de su colonia, creó un mapa con los puntos sin luz y compartió el reporte con el gobierno municipal vía Twitter.",
            etiquetas: ["herramientas digitales", "organización", "comunidad"],
          },
          {
            termino: "Sostenibilidad del proyecto",
            definicion: "Capacidad de un proyecto comunitario de mantenerse activo y generar impacto más allá del período inicial sin depender de recursos externos constantes. Implica formación de capacidades locales, liderazgo distribuido y uso de tecnologías de bajo costo.",
            ejemplo: "Un proyecto de radio comunitaria digital es sostenible si forma a varios jóvenes como operadores, usa software libre (Audacity, OBS) y cuenta con el apoyo de la organización comunitaria para su continuidad.",
            etiquetas: ["sostenibilidad", "impacto", "largo plazo"],
          },
          {
            termino: "Evaluación de impacto comunitario",
            definicion: "Proceso de medir y valorar los cambios producidos por un proyecto en la comunidad: participación, conocimiento generado, problemas resueltos, redes fortalecidas. Incluye indicadores cuantitativos y cualitativos.",
            ejemplo: "Después de tres meses, el equipo del proyecto evaluó: ¿cuántas personas usaron la plataforma?, ¿qué problemas se reportaron y cuántos fueron atendidos?, ¿qué aprendió la comunidad sobre el proceso?",
            etiquetas: ["evaluación", "impacto", "indicadores"],
          },
        ],
        actividad_final: "Identifica un problema o necesidad real de tu comunidad escolar, barrial o familiar que podría abordarse con tecnología digital. Diseña el esquema básico de un proyecto: (a) diagnóstico (¿cuál es el problema y quiénes afecta?), (b) propuesta de solución digital (¿qué herramienta usarías y por qué?), (c) estrategia de participación (¿cómo involucrarias a la comunidad?), (d) indicadores de evaluación (¿cómo sabrías que funcionó?).",
      },
    },
    {
      titulo: "Completa los espacios — Proyectos de participación comunitaria digital",
      descripcion: "Completa los conceptos clave sobre el diseño, implementación y evaluación de proyectos de participación comunitaria mediados por tecnologías digitales.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el término o concepto correcto.",
        texto_con_huecos: "El primer paso en el diseño de un proyecto comunitario digital es realizar un ___ comunitario para identificar necesidades y recursos. El enfoque que involucra a los usuarios como co-creadores del proyecto desde el inicio se llama diseño ___. La capacidad de un proyecto de mantenerse activo y generar impacto sin recursos externos constantes se denomina ___. La práctica de participar en la vida cívica a través de herramientas digitales se conoce como ciudadanía digital ___.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "diagnóstico",
            alternativas_aceptadas: ["diagnostico"],
            pista: "Antes de diseñar soluciones, se debe hacer un ___ para entender el contexto y las necesidades reales de la comunidad.",
          },
          {
            posicion: 1,
            respuesta_correcta: "participativo",
            alternativas_aceptadas: ["participativa"],
            pista: "El diseño que co-crea con la comunidad en lugar de imponer soluciones se llama diseño ___.",
          },
          {
            posicion: 2,
            respuesta_correcta: "sostenibilidad",
            alternativas_aceptadas: ["sostenible"],
            pista: "La propiedad de un proyecto que le permite continuar generando impacto a largo plazo con recursos propios se llama ___.",
          },
          {
            posicion: 3,
            respuesta_correcta: "activa",
            alternativas_aceptadas: ["activo"],
            pista: "La ciudadanía digital ___ implica participar con responsabilidad en la vida cívica a través de herramientas digitales.",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Proyecto de participación comunitaria digital",
      descripcion: "Reflexiona sobre tu capacidad de diseñar y desarrollar proyectos de participación comunitaria mediados por tecnologías digitales.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Realizo un diagnóstico comunitario identificando necesidades reales, actores clave y condiciones de acceso a tecnología en una comunidad específica.", escala: escala4 },
          { descripcion: "Diseño la propuesta de un proyecto de participación digital con objetivos claros, herramientas pertinentes y estrategia de involucramiento comunitario.", escala: escala4 },
          { descripcion: "Selecciono herramientas digitales apropiadas al contexto comunitario (conectividad, dispositivos, habilidades) y las justifico.", escala: escala4 },
          { descripcion: "Propongo indicadores de evaluación que me permitan medir el impacto del proyecto en la comunidad a corto y mediano plazo.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Qué problema de tu comunidad escolar o barrial podrías comenzar a abordar HOY con las herramientas digitales que ya tienes (un celular, acceso a internet, redes sociales)? ¿Cuál sería tu primer paso concreto esta semana?",
      },
    },
  ],
];

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
