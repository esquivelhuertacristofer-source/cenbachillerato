/**
 * Seed de actividades pedagógicas para CD-II (Cultura Digital II).
 * 5 progresiones × 3 actividades = 15 actividades. estado='publicada'.
 * Tipos: lectura, video_con_preguntas, infografia, simulacion,
 *        quiz_multiple_opcion, quiz_verdadero_falso,
 *        reflexion_escrita, autoevaluacion (8 tipos)
 * Uso: npx tsx scripts/seed-activities-cdii.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🌱 Seed actividades CD-II — Cultura Digital II\n");

  const progs = await getProgresionesDeUAC(sb, "CD-II");
  let ok = 0; let fail = 0;

  for (const p of progs) {
    const base = p.codigo;
    const n = p.numero;

    const a1ok = await upsertActividad(sb, {
      codigo: `${base}-A1`,
      titulo: titulos[n - 1].a1,
      descripcion: "Actividad de contextualización del propósito formativo.",
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
      descripcion: "Actividad de práctica y verificación de aprendizajes.",
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
      descripcion: "Reflexión o autoevaluación de cierre.",
      tipo: tiposA3[n - 1],
      progresion_id: p.id,
      xp: 20,
      estado: "publicada",
      contenido: contenidosA3[n - 1],
    });
    a3ok ? ok++ : fail++;
  }

  log(`\n✅ CD-II: ${ok} actividades insertadas, ${fail} fallidas.\n`);
}

const titulos = [
  { a1: "Estrategias para buscar información confiable en internet", a2: "¿Qué tan confiable es esta fuente?", a3: "Mi práctica personal de búsqueda digital" },
  { a1: "Trabajar juntos en la nube: herramientas colaborativas", a2: "Explorando herramientas digitales colaborativas", a3: "¿Qué tan bien trabajo digitalmente en equipo?" },
  { a1: "Fake news y desinformación: cómo verificar antes de compartir", a2: "¿Verdadero o falso? Verificación de información", a3: "Mi protocolo personal contra la desinformación" },
  { a1: "Tipos de gráficas y cuándo usarlas", a2: "Explorando datos con hojas de cálculo", a3: "Analizando datos de mi comunidad" },
  { a1: "Creatividad y ética en la producción digital", a2: "Propiedad intelectual y licencias: ¿qué debo saber?", a3: "¿Produzco contenido digital responsablemente?" },
];

const tiposA1 = ["lectura", "video_con_preguntas", "lectura", "infografia", "video_con_preguntas"] as const;
const tiposA2 = ["quiz_multiple_opcion", "simulacion", "quiz_verdadero_falso", "simulacion", "quiz_multiple_opcion"] as const;
const tiposA3 = ["reflexion_escrita", "autoevaluacion", "reflexion_escrita", "reflexion_escrita", "autoevaluacion"] as const;

const contenidosA1 = [
  { // P01 — lectura
    texto: `No toda la información que encontramos en internet es confiable. La red es un espacio donde coexisten artículos académicos revisados por expertos, blogs personales sin verificación, noticias de medios serios y contenido generado para desinformar. Saber distinguir fuentes confiables de las que no lo son es una habilidad esencial en el siglo XXI.\n\nAlgunas estrategias útiles para evaluar la confiabilidad de una fuente:\n\n1. Verifica el dominio y la autoría: ¿Quién publicó el contenido? ¿Hay un autor identificado con credenciales verificables?\n2. Revisa la fecha: ¿La información es actual o puede estar desactualizada?\n3. Busca citas y referencias: ¿El texto cita otras fuentes que puedes verificar?\n4. Lateral reading: Antes de leer en profundidad un texto, busca qué dicen otras fuentes sobre el sitio que lo publica.\n5. Evalúa el tono: ¿El texto usa lenguaje alarmista o extremo? Eso puede ser señal de baja calidad o sesgo.\n\nRecuerda: buscar en varios lugares y comparar fuentes antes de aceptar una información como verdadera.`,
    fuente: "Material elaborado para CEN Bachillerato — CD-II",
    nivel_lectura: "basico" as const,
    tiempo_estimado_minutos: 9,
    preguntas_comprension: [
      { pregunta: "¿Qué es el 'lateral reading'?", respuesta_guia: "Buscar qué dicen otras fuentes sobre el sitio que publica la información, antes de leerlo en profundidad." },
      { pregunta: "¿Por qué el lenguaje alarmista en un texto puede ser una señal de alerta?", respuesta_guia: "Puede indicar bajo nivel de calidad o sesgo intencional para generar reacciones emocionales." },
      { pregunta: "Menciona tres criterios para evaluar la confiabilidad de una fuente digital.", respuesta_guia: "Autoría con credenciales, fecha de publicación, citas y referencias verificables." },
    ],
  },
  { // P02 — video_con_preguntas
    url_video: "https://example.com/video-pendiente-cen",
    titulo_video: "Trabajar juntos en la nube: herramientas colaborativas",
    descripcion_video: "Introducción a las principales herramientas de trabajo colaborativo en línea: documentos compartidos (Google Docs, OneDrive), pizarras digitales (Miro, Jamboard), y plataformas educativas. Se explica cómo estas herramientas facilitan la producción colectiva de conocimiento.",
    duracion_segundos: 450,
    subtitulos_disponibles: true,
    preguntas: [
      { tiempo_segundos: 100, pregunta: "¿Cuál es la ventaja principal de trabajar en documentos compartidos en la nube?", tipo: "abierta" as const },
      { tiempo_segundos: 250, pregunta: "¿Qué diferencia hay entre la comunicación asincrónica y la sincrónica en herramientas colaborativas?", tipo: "abierta" as const },
      { tiempo_segundos: 400, pregunta: "¿En qué tipo de proyecto escolar usarías una pizarra digital colaborativa?", tipo: "abierta" as const },
    ],
  },
  { // P03 — lectura
    texto: `Las fake news (noticias falsas) son contenidos deliberadamente falsos o engañosos que se difunden como si fueran noticias reales. Existen desde siempre, pero las redes sociales las amplifican enormemente: un artículo falso puede llegar a miles de personas en minutos.\n\n¿Por qué se crean? Por razones políticas (desprestigiar a alguien), económicas (generar clics y publicidad), o simplemente para crear confusión o miedo. El problema no es solo la malicia del creador, sino también la velocidad con que los usuarios las comparten sin verificar.\n\nHerramientas y estrategias para verificar:\n• Fact-checking: organizaciones especializadas (Verificado, Animal Político, AFP Factual) revisan y publican correcciones de noticias falsas.\n• Búsqueda inversa de imágenes: en Google Imágenes o TinEye puedes verificar si una fotografía fue usada en otro contexto.\n• Buscar la fuente original: ¿hay un comunicado oficial? ¿La nota cita una fuente verificable?\n• Desconfiar de los titulares sensacionalistas: si el titular es impactante y no aparece en ningún medio serio, probablemente es falso.`,
    fuente: "Material elaborado para CEN Bachillerato — CD-II",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 9,
    preguntas_comprension: [
      { pregunta: "¿Por qué se crean las fake news? Menciona dos razones.", respuesta_guia: "Por razones políticas (desprestigiar) y económicas (generar clics y publicidad)." },
      { pregunta: "¿Qué es la búsqueda inversa de imágenes?", respuesta_guia: "Verificar si una fotografía fue usada antes en otro contexto diferente, usando herramientas como Google Imágenes." },
      { pregunta: "¿Qué señal nos indica que un titular probablemente es falso?", respuesta_guia: "Si es sensacionalista e impactante y no aparece en ningún medio serio." },
    ],
  },
  { // P04 — infografia
    titulo: "Tipos de gráficas y cuándo usarlas",
    url_imagen: "/placeholder/infografia.svg",
    descripcion_accesible: "Infografía que presenta los tipos de gráficas estadísticas más comunes (barras, pastel, línea, dispersión) y su uso apropiado según el tipo de datos y el mensaje que se quiere comunicar.",
    puntos_clave: [
      "Gráfica de barras: compara cantidades entre categorías distintas (ventas por mes, población por estado).",
      "Gráfica de pastel: muestra proporciones de un total (porcentaje de uso por plataforma).",
      "Gráfica de línea: muestra tendencias y cambios a lo largo del tiempo (temperatura diaria, crecimiento poblacional).",
      "Gráfica de dispersión: muestra la relación entre dos variables numéricas (altura vs. peso).",
      "Eje Y: siempre debe comenzar en cero para no distorsionar visualmente los datos.",
      "Título y etiquetas: toda gráfica necesita título claro, etiquetas en los ejes y fuente de los datos.",
      "Trampa visual: una gráfica puede mentir si el eje no comienza en cero o si usa proporciones engañosas.",
    ],
    fuente: "Material CEN Bachillerato — CD-II",
    actividad_post: "Elige un conjunto de datos de tu comunidad o escuela (número de estudiantes por grupo, horas de uso de redes sociales por semana, etc.) y decide qué tipo de gráfica sería más apropiada. Justifica tu elección.",
  },
  { // P05 — video_con_preguntas
    url_video: "https://example.com/video-pendiente-cen",
    titulo_video: "Creatividad y ética en la producción digital",
    descripcion_video: "Introducción a los conceptos de propiedad intelectual, licencias Creative Commons y ética en la producción de contenido digital. Explica la diferencia entre copyright y copyleft, y muestra cómo citar correctamente imágenes, textos y videos tomados de internet.",
    duracion_segundos: 420,
    subtitulos_disponibles: true,
    preguntas: [
      { tiempo_segundos: 90, pregunta: "¿Qué es el copyright y qué implica para quien quiere usar el contenido de otro?", tipo: "abierta" as const },
      { tiempo_segundos: 250, pregunta: "¿Qué son las licencias Creative Commons y qué permiten?", tipo: "abierta" as const },
      { tiempo_segundos: 380, pregunta: "¿Por qué citar las fuentes de imágenes y textos que usas es éticamente importante?", tipo: "abierta" as const },
    ],
  },
];

const contenidosA2 = [
  { // P01 — quiz_multiple_opcion
    preguntas: [
      { enunciado: "¿Qué es el 'lateral reading' como estrategia de verificación?", opciones: ["Leer el artículo de izquierda a derecha", "Buscar información sobre la fuente antes de leer el contenido", "Leer solo los encabezados del artículo", "Compartir el artículo en redes para recibir opiniones"], respuesta_correcta: 1, retroalimentacion: "El lateral reading consiste en investigar la reputación del sitio antes de leer el contenido." },
      { enunciado: "¿Cuál de estas características NO es señal de una fuente confiable?", opciones: ["Autor identificado con credenciales", "Citas de otras fuentes verificables", "Titulares sensacionalistas", "Fecha de publicación reciente"], respuesta_correcta: 2, retroalimentacion: "Los titulares sensacionalistas son una señal de alarma, no de confiabilidad." },
      { enunciado: "Si encuentras una noticia con un titular que dice '¡INCREÍBLE! El gobierno oculta que...', deberías:", opciones: ["Compartirla inmediatamente", "Ignorarla por completo sin leerla", "Verificar en fuentes confiables antes de compartir", "Creerla porque es muy específica"], respuesta_correcta: 2, retroalimentacion: "Siempre verifica en fuentes confiables antes de compartir, especialmente si el titular es alarmista." },
      { enunciado: "¿Qué dominio sugiere mayor confiabilidad académica?", opciones: [".com", ".edu o .gob", ".net", ".org siempre"], respuesta_correcta: 1, retroalimentacion: "Los dominios .edu (educativos) y .gob (gubernamentales) suelen indicar fuentes institucionales más confiables." },
      { enunciado: "El método de buscar la misma imagen en Google para verificar su origen se llama:", opciones: ["Fact-checking", "Lateral reading", "Búsqueda inversa de imágenes", "SEO"], respuesta_correcta: 2, retroalimentacion: "La búsqueda inversa de imágenes permite verificar si una foto fue usada en otro contexto diferente." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P02 — simulacion
    tipo_simulacion: "tecnologia" as const,
    descripcion: "Exploración guiada de herramientas de colaboración digital. En esta simulación, identificarás las funciones básicas de tres tipos de herramientas colaborativas y determinarás cuál sería más adecuada para diferentes tipos de proyectos escolares.",
    instrucciones: [
      "Identifica qué herramienta usarías para escribir un documento entre tres personas simultáneamente.",
      "Decide qué herramienta sería mejor para hacer una lluvia de ideas visual con post-its digitales.",
      "Determina qué plataforma permite compartir archivos, asignar tareas y comunicarse en un solo lugar.",
      "Reflexiona: ¿qué necesitas saber antes de usar una herramienta colaborativa con datos personales?",
    ],
    variables_a_explorar: [
      "Tipo de tarea (escritura, visualización, comunicación, gestión)",
      "Número de participantes (equipo pequeño vs. grupo grande)",
      "Privacidad y seguridad de los datos personales",
      "Accesibilidad (¿requiere cuenta? ¿funciona en celular?)",
    ],
    preguntas_reflexion: [
      "¿Qué herramienta colaborativa digital ya usas en tu vida escolar o personal?",
      "¿Qué ventaja tiene la colaboración asincrónica (no en tiempo real) sobre la sincrónica?",
      "¿Qué riesgos tiene compartir documentos de trabajo en la nube?",
    ],
    reporte_esperado: "Escribe en 3-4 oraciones qué herramienta colaborativa elegirías para tu próximo proyecto escolar grupal y por qué.",
  },
  { // P03 — quiz_verdadero_falso
    preguntas: [
      { enunciado: "Las fake news son un fenómeno exclusivo de internet y las redes sociales.", respuesta: false, retroalimentacion: "Las noticias falsas existen desde antes de internet; las redes sociales solo las amplifican más rápido." },
      { enunciado: "Una forma de verificar si una imagen fue manipulada o usada fuera de contexto es la búsqueda inversa.", respuesta: true, retroalimentacion: "Correcto. La búsqueda inversa de imágenes permite ver dónde y cómo se ha usado una foto antes." },
      { enunciado: "Si una noticia aparece en muchos sitios web, necesariamente es verdadera.", respuesta: false, retroalimentacion: "Las noticias falsas también se comparten masivamente. La cantidad de sitios no garantiza la veracidad." },
      { enunciado: "Organizaciones de fact-checking como Verificado o AFP Factual verifican y publican correcciones de noticias.", respuesta: true, retroalimentacion: "Correcto. Los fact-checkers son una herramienta valiosa para contrastar información." },
      { enunciado: "Compartir una noticia falsa sin saber que lo era no tiene consecuencias éticas.", respuesta: false, retroalimentacion: "Compartir sin verificar contribuye a la difusión de desinformación, incluso si no fue intencional." },
      { enunciado: "Un titular sensacionalista es siempre señal de que la noticia es falsa.", respuesta: false, retroalimentacion: "No siempre, pero sí es una señal de alerta que debe motivar verificación antes de compartir." },
    ],
    intentos_maximos: 2,
    puntaje_minimo_aprobacion: 70,
  },
  { // P04 — simulacion
    tipo_simulacion: "matematica" as const,
    descripcion: "Exploración de datos con hojas de cálculo. En esta simulación, aprenderás a ingresar datos, calcular estadísticos básicos (promedio, moda, máximo, mínimo) y elegir el tipo de gráfica más adecuado para representar la información de un conjunto de datos comunitarios.",
    instrucciones: [
      "Imagina que tienes los datos del número de horas que estudiantes de tu grupo pasan en redes sociales por semana: 3, 7, 5, 12, 4, 8, 6, 9, 3, 5, 7, 11.",
      "Calcula mentalmente o en papel: ¿cuál sería el promedio de horas? ¿Cuál el valor más alto y más bajo?",
      "¿Qué tipo de gráfica usarías para comparar el tiempo de uso por persona? ¿Y para mostrar la tendencia a lo largo del tiempo?",
      "Reflexiona: ¿cómo cambiaría la gráfica si el eje Y empezara en 2 en lugar de 0?",
    ],
    variables_a_explorar: [
      "Promedio (media aritmética) vs. mediana como representantes del conjunto",
      "Efecto de los valores extremos en el promedio",
      "Elección del tipo de gráfica según el mensaje que se quiere comunicar",
      "Distorsión visual por eje Y que no empieza en cero",
    ],
    preguntas_reflexion: [
      "¿El promedio de horas semanal en redes sociales te parece alto o bajo? ¿Qué factores podrían explicar los valores extremos?",
      "Si quisieras convencer a alguien de que el uso de redes sociales es preocupante, ¿qué gráfica elegirías y cómo la construirías?",
      "¿Qué otro dato de tu comunidad te gustaría analizar con una hoja de cálculo?",
    ],
    reporte_esperado: "Escribe 3-4 oraciones describiendo qué tipo de gráfica elegiste para los datos de redes sociales y por qué fue la más adecuada.",
  },
  { // P05 — quiz_multiple_opcion
    preguntas: [
      { enunciado: "¿Qué significa que una imagen tiene licencia Creative Commons CC-BY?", opciones: ["No puedes usarla bajo ninguna circunstancia", "Puedes usarla libremente siempre que cites al autor", "Puedes modificarla y venderla sin restricciones", "Solo puedes verla, no descargarla"], respuesta_correcta: 1, retroalimentacion: "CC-BY permite uso libre con la condición de dar crédito al autor original." },
      { enunciado: "¿Qué significa 'copyright' (todos los derechos reservados)?", opciones: ["El contenido es de dominio público", "El autor permite el uso libre", "El uso requiere permiso expreso del autor o pago de derechos", "El contenido puede usarse con cita"], respuesta_correcta: 2, retroalimentacion: "Copyright protege la obra: para usarla se necesita permiso del titular o debe ser uso educativo sin fines de lucro." },
      { enunciado: "Si usas una imagen de Google Images en tu presentación escolar sin citar la fuente, ¿qué estás haciendo?", opciones: ["Plagio, ya que no reconoces la autoría", "Algo completamente legal porque la imagen está en internet", "Algo permitido si es para uso académico", "Nada cuestionable, las imágenes en internet son libres"], respuesta_correcta: 0, retroalimentacion: "No citar la fuente de una imagen es plagio, aunque sea para un trabajo escolar." },
      { enunciado: "¿Qué plataforma permite encontrar imágenes con licencia libre para usar?", opciones: ["Solo Google Images", "Unsplash, Pixabay o Wikimedia Commons", "Pinterest exclusivamente", "Solo imágenes que crees tú mismo"], respuesta_correcta: 1, retroalimentacion: "Plataformas como Unsplash, Pixabay y Wikimedia Commons ofrecen imágenes con licencias libres." },
      { enunciado: "Producir un video con música de fondo sin permiso del artista es:", opciones: ["Legal si el video no tiene fines comerciales", "Siempre un problema de derechos de autor que puede generar sanciones", "Legal si no monetizas el video", "Solo un problema si el artista se queja"], respuesta_correcta: 1, retroalimentacion: "Usar música protegida sin permiso viola derechos de autor, incluso en videos educativos no comerciales." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
];

const contenidosA3 = [
  { // P01 — reflexion_escrita
    prompt: "Piensa en la última vez que buscaste información para un trabajo escolar o para informarte sobre algo importante. Responde: ¿Cómo elegiste las fuentes que usaste? ¿Aplicaste alguna de las estrategias de verificación que estudiaste? ¿Algo que encontraste te generó dudas sobre su veracidad? ¿Qué cambiarías en tu proceso de búsqueda la próxima vez?",
    pistas: ["Sé específico/a: ¿qué buscabas? ¿qué sitios abriste?", "Reflexiona sobre lo que hacías antes y lo que harías ahora.", "No tienes que haber encontrado fake news: lo valioso es el proceso de verificación."],
    longitud_minima_palabras: 80,
    longitud_maxima_palabras: 280,
    criterios_evaluacion: ["Describe una experiencia concreta de búsqueda digital", "Identifica qué estrategias de verificación aplicó o debió aplicar", "Reflexiona sobre una mejora concreta en su proceso", "Usa vocabulario del tema (fuente confiable, verificar, lateral reading)"],
    formato_esperado: "libre" as const,
  },
  { // P02 — autoevaluacion
    instrucciones: "Evalúa tu competencia en el trabajo colaborativo digital.",
    criterios: [
      {
        descripcion: "Uso herramientas digitales colaborativas con comodidad",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "Solo conozco una herramienta y me cuesta usarla." },
          { valor: 2, etiqueta: "En proceso", descripcion: "Uso una herramienta de forma básica." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Uso al menos dos herramientas y sé elegir la adecuada para cada tarea." },
          { valor: 4, etiqueta: "Destacado", descripcion: "Uso varias herramientas, las comparo y puedo guiar a otros en su uso." },
        ],
      },
      {
        descripcion: "Colaboro de manera responsable y respetuosa en entornos digitales compartidos",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "A veces edito o elimino trabajo de otros sin avisar." },
          { valor: 2, etiqueta: "En proceso", descripcion: "Generalmente respeto el trabajo de otros pero cometo errores." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Siempre comunico mis cambios y respeto el trabajo del equipo." },
          { valor: 4, etiqueta: "Destacado", descripcion: "Promuevo buenas prácticas colaborativas y ayudo a resolver conflictos en el equipo." },
        ],
      },
    ],
    reflexion_final_prompt: "¿Qué herramienta colaborativa digital aprendiste a usar (o quieres aprender) que crees que usarás en el futuro? ¿Por qué te parece útil?",
    visible_para_docente: true,
  },
  { // P03 — reflexion_escrita
    prompt: "Diseña tu protocolo personal de verificación de noticias para redes sociales. Escribe una lista de entre 5 y 7 pasos que seguirás antes de compartir cualquier información en redes sociales. Explica brevemente por qué cada paso es importante. Luego, reflexiona: ¿hay algún tipo de contenido que sigas compartiendo sin verificar? ¿Por qué?",
    pistas: ["Tu protocolo debe ser realista: pasos que sí puedes seguir con tiempo limitado.", "Incluye al menos una herramienta de fact-checking o búsqueda inversa.", "Sé honesto/a en la reflexión final: todos tenemos puntos ciegos."],
    longitud_minima_palabras: 100,
    longitud_maxima_palabras: 350,
    criterios_evaluacion: ["Lista entre 5 y 7 pasos concretos y aplicables", "Explica la importancia de al menos 3 pasos", "Reflexiona honestamente sobre una debilidad propia", "El protocolo es realista y aplicable en la vida cotidiana"],
    formato_esperado: "libre" as const,
  },
  { // P04 — reflexion_escrita
    prompt: "Elige UN dato real de tu comunidad o entorno (puede ser de tu familia, tu colonia, tu escuela o tu municipio). Describe el dato, cómo lo obtendrías, qué tipo de gráfica elegirías para representarlo y qué conclusión podrías extraer de esa representación visual. ¿Cómo podría ese análisis ser útil para tu comunidad?",
    pistas: ["Ejemplo de dato: número de horas de uso de celular en tu familia por semana.", "Piensa en quién necesitaría esa información y para qué.", "¿Una gráfica de barras, de línea o de pastel comunica mejor tu dato?"],
    longitud_minima_palabras: 80,
    longitud_maxima_palabras: 280,
    criterios_evaluacion: ["Identifica un dato real y concreto de su entorno", "Elige y justifica el tipo de gráfica con argumento claro", "Extrae una conclusión relevante del dato analizado", "Reflexiona sobre la utilidad de ese análisis para la comunidad"],
    formato_esperado: "libre" as const,
  },
  { // P05 — autoevaluacion
    instrucciones: "Evalúa tu práctica ética en la producción y difusión de contenido digital.",
    criterios: [
      {
        descripcion: "Cito correctamente las fuentes (imágenes, textos, videos) que uso en mis producciones",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "Rara vez cito las fuentes." },
          { valor: 2, etiqueta: "En proceso", descripcion: "Cito algunas fuentes pero no todas." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Cito todas las fuentes que uso de manera consistente." },
          { valor: 4, etiqueta: "Destacado", descripcion: "Cito fuentes correctamente, uso licencias libres y lo explico a otros." },
        ],
      },
      {
        descripcion: "Antes de compartir contenido, verifico su veracidad y origen",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "Comparto sin verificar habitualmente." },
          { valor: 2, etiqueta: "En proceso", descripcion: "Verifico cuando tengo dudas claras, pero no siempre." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Hago una verificación básica antes de compartir la mayoría del contenido." },
          { valor: 4, etiqueta: "Destacado", descripcion: "Siempre verifico, uso herramientas de fact-checking y comparto solo lo confiable." },
        ],
      },
      {
        descripcion: "Produzco contenido digital con perspectiva crítica y respeto a la diversidad",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "No reflexiono sobre el impacto de mi contenido." },
          { valor: 2, etiqueta: "En proceso", descripcion: "A veces pienso en el impacto pero no sistemáticamente." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Reviso que mi contenido sea respetuoso y no reproduzca estereotipos." },
          { valor: 4, etiqueta: "Destacado", descripcion: "Produzco contenido con perspectiva crítica, inclusiva y lo argumento." },
        ],
      },
    ],
    reflexion_final_prompt: "¿En qué aspecto de la ética digital te sientes más sólido/a y en cuál necesitas seguir trabajando? ¿Qué acción concreta tomarás en los próximos días?",
    visible_para_docente: true,
  },
];

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
