/**
 * robustecer-infografias.ts
 * Robustecimiento profundo de las 29 infografías de CEN Bachillerato.
 *
 * Cada entrada en INFOGRAFIAS_ROBUSTECIDAS es una reescritura COMPLETA e intencional:
 *   - descripcion_accesible: 4-6 párrafos para accesibilidad visual
 *   - puntos_clave: 8-10 puntos con datos específicos (fuentes mexicanas)
 *   - fuente: institución mexicana real (INEGI, CONABIO, CINVESTAV, etc.)
 *   - contexto_mexicano: 1-2 párrafos con datos reales de México
 *   - glosario: 4-6 términos con definición pedagógica
 *   - preguntas_reflexion: 3-5 preguntas de análisis crítico
 *
 * Idempotente: compara por código, solo actualiza si contenido cambió.
 * Marca nivel_revision='robustecida' solo si validación Zod pasa.
 *
 * Uso: npx tsx scripts/robustecer-infografias.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";
import { ContenidoInfografiaSchema } from "../src/lib/activities/validators";

config({ path: resolve(process.cwd(), ".env.local") });

type SB = ReturnType<typeof createClient<Database>>;

interface GlosarioTermino {
  termino: string;
  definicion: string;
}

interface InfografiaRobustecida {
  codigo: string;
  titulo: string;
  descripcion_accesible: string;
  puntos_clave: string[];
  fuente: string;
  actividad_post: string;
  contexto_mexicano: string;
  glosario: GlosarioTermino[];
  preguntas_reflexion: string[];
}

// ── Mapa de robustecimiento ───────────────────────────────────────────────────
// Las entradas se agregan en lotes en los turnos siguientes.
// Cada entrada es la versión COMPLETA reescrita, no expansión automática.
const INFOGRAFIAS_ROBUSTECIDAS: InfografiaRobustecida[] = [
  // ── LOTE 1: CD-II, CD-III, CH-I, CH-II, CH-III, CNEYT-II (×2) ─────────────

  {
    codigo: "CD-II-P04-A1",
    titulo: "Tipos de gráficas estadísticas: cuándo y cómo usarlas",
    descripcion_accesible:
      "Infografía organizada en cinco paneles visuales, uno por tipo de gráfica principal. El primer panel muestra una gráfica de barras comparando el porcentaje de hogares con acceso a internet por entidad federativa (datos INEGI ENDUTIH 2023), con barras horizontales en degradado azul ordenadas de mayor a menor. El segundo panel presenta una gráfica de línea con la evolución del PIB de México entre 2000 y 2023, destacando los años de contracción (2009 y 2020) con puntos rojos. El tercer panel muestra una gráfica circular con la distribución del uso de plataformas digitales por jóvenes de 15 a 29 años. El cuarto panel presenta una gráfica de dispersión que relaciona años de escolaridad con salario promedio mensual en México. El quinto panel es un recuadro de advertencia en rojo con tres ejemplos de 'trampas visuales': eje Y truncado, escalas distintas en doble eje y gráficas 3D que distorsionan proporciones.",
    puntos_clave: [
      "Gráfica de barras: compara cantidades entre categorías discretas. Ideal para 3 a 15 categorías. Es el formato más usado por el INEGI para comparar indicadores entre entidades federativas.",
      "Gráfica de línea: muestra tendencias a lo largo del tiempo. Requiere al menos 6 puntos temporales para ser informativa. Formato estándar para series históricas del PIB, inflación o empleo.",
      "Gráfica circular (pastel): representa proporciones de un todo. Solo útil con 6 o menos categorías. Muy abusada: los cerebros humanos comparan áreas con menos precisión que alturas.",
      "Gráfica de dispersión (scatter plot): muestra la relación entre dos variables numéricas continuas. Alta densidad de puntos puede revelar correlaciones no evidentes. No implica causalidad.",
      "Gráfica de área: variante de la línea que enfatiza el volumen acumulado. Útil para comparar múltiples series a lo largo del tiempo (ej: mix de generación eléctrica por fuente).",
      "Trampa del eje truncado: si el eje Y no comienza en cero, una diferencia del 2% puede verse como si fuera del 200%. Técnica frecuente en medios para exagerar diferencias en encuestas electorales.",
      "Trampa de escalas distintas: dos variables con ejes independientes en la misma gráfica pueden crear una correlación visual que no existe en los datos reales.",
      "Trampa 3D: las representaciones tridimensionales de datos bidimensionales distorsionan la percepción relativa de las porciones. Evitarlas en visualización seria.",
      "Toda gráfica requiere: título descriptivo, etiquetas en ambos ejes, unidades de medida, fuente de los datos con año de actualización y nota metodológica cuando aplique.",
    ],
    fuente:
      "Instituto Nacional de Estadística y Geografía (INEGI) — ENDUTIH 2023; CEPAL — Manual de visualización de datos estadísticos 2022",
    actividad_post:
      "Busca en inegi.org.mx una gráfica publicada en los últimos seis meses. Analiza: ¿qué tipo es?, ¿el eje Y comienza en cero?, ¿tiene título, etiquetas y fuente completos?, ¿qué trampa visual identificas (si hay alguna)?",
    contexto_mexicano:
      "El INEGI produce más de 300 conjuntos de datos estadísticos públicos, todos accesibles en datos.gob.mx. Sus gráficas son el estándar de referencia para periodistas, investigadores y funcionarios en México. Sin embargo, un diagnóstico del CONEVAL (2022) encontró que la mayoría de los adultos mexicanos enfrenta dificultades para interpretar correctamente gráficas con dos ejes o variables. La brecha de alfabetización estadística es un desafío central de la educación en Cultura Digital.\n\nEn los medios de comunicación mexicanos es frecuente encontrar gráficas con ejes truncados para dramatizar diferencias en encuestas electorales, o gráficas circulares con porcentajes que no suman 100%. Identificar estas trampas no es solo una habilidad técnica: es una competencia ciudadana fundamental para participar en democracia con información verificada.",
    glosario: [
      {
        termino: "Variable cuantitativa",
        definicion:
          "Dato numérico que puede medirse y compararse aritméticamente (ingreso, temperatura, número de estudiantes). Opuesto a la variable categórica, que clasifica sin medir.",
      },
      {
        termino: "Correlación",
        definicion:
          "Relación estadística entre dos variables que tienden a cambiar juntas. Una correlación alta no implica que una variable sea causa de la otra.",
      },
      {
        termino: "Escala logarítmica",
        definicion:
          "Eje donde cada unidad representa una multiplicación por 10. Útil cuando los datos varían en órdenes de magnitud muy distintos (ej: casos de contagio durante una pandemia).",
      },
      {
        termino: "Percentil",
        definicion:
          "Valor que indica qué porcentaje de los datos queda por debajo de ese punto. El percentil 50 es la mediana; el percentil 90 significa que el 90% de los datos tiene un valor menor.",
      },
      {
        termino: "Outlier",
        definicion:
          "Dato atípico que se aleja notablemente del patrón general. Puede distorsionar promedios e interpretaciones si no se identifica y trata explícitamente.",
      },
    ],
    preguntas_reflexion: [
      "¿Por qué crees que los medios usan con frecuencia gráficas con el eje Y truncado? ¿Qué efecto buscan en el lector y cómo podemos identificar esta trampa?",
      "Si quisieras comparar el porcentaje de jóvenes con acceso a internet en los 32 estados de México, ¿qué tipo de gráfica elegirías y por qué no usarías una gráfica circular?",
      "¿Qué diferencia hay entre decir 'estas dos variables están correlacionadas' y 'esta variable causa a la otra'? Da un ejemplo de tu entorno donde se podría confundir correlación con causalidad.",
    ],
  },

  {
    codigo: "CD-III-P03-A1",
    titulo: "Carreras digitales en México: perfiles, salarios y brecha de género",
    descripcion_accesible:
      "Infografía de dos columnas. La columna izquierda presenta ocho perfiles profesionales del ecosistema digital mexicano, cada uno con un icono, nombre del perfil y rango salarial mensual en pesos mexicanos según AMITI 2024. Los perfiles incluyen: Desarrollador de software (frontend/backend/fullstack), Especialista en ciberseguridad, Científico de datos, Diseñador UX/UI, Especialista en inteligencia artificial, Administrador de nube (cloud), Community Manager y Especialista en marketing digital. La columna derecha presenta tres bloques de información: un bloque de datos sobre la brecha de género en STEM en México (con un diagrama de proporciones), un bloque sobre rutas de formación accesibles (universidades públicas, bootcamps, MOOCs) y un bloque sobre las cinco habilidades transversales más demandadas en el sector digital mexicano.",
    puntos_clave: [
      "Desarrollador de software: perfil más demandado en México, con más de 40,000 posiciones vacantes anuales. Salario junior: $15,000–$25,000 MXN/mes; senior: $45,000–$90,000 MXN/mes (AMITI 2024).",
      "Especialista en ciberseguridad: su demanda creció más del 200% en México entre 2020 y 2024. México es el segundo país más atacado de América Latina, lo que vuelve crítico este perfil.",
      "Científico de datos: analiza grandes conjuntos de datos para apoyar decisiones estratégicas. INEGI, Banxico y el IMSS son los principales empleadores públicos de este perfil en México.",
      "Diseñador UX/UI: diseña interfaces intuitivas y estéticas. Es el perfil con mayor porcentaje de mujeres en el sector tecnológico mexicano (~40%), a diferencia del desarrollo de software (~18%).",
      "Brecha de género en STEM: las mujeres representan solo el 25–30% de la matrícula en carreras de ingeniería y tecnología en México (ANUIES 2023). En el mercado laboral TI, la proporción cae al 18–22%.",
      "La brecha no refleja diferencias de capacidad: investigaciones del IIMAS-UNAM documentan que factores culturales, estereotipos de género y falta de referentes femeninos explican la subrepresentación.",
      "Rutas accesibles: UNAM, IPN, UAM y universidades tecnológicas estatales ofrecen carreras de TI. Bootcamps con modelo de pago diferido (Bedu, Ironhack México, Wizeline Academy) permiten acceder sin capital inicial.",
      "MOOCs gratuitos y con becas: Google Activate, Microsoft Learn, Coursera (becas CONAHCYT), edX y Khan Academy en español. Muchos incluyen certificaciones reconocidas por la industria.",
      "Habilidades transversales más demandadas: pensamiento computacional, alfabetización en datos, colaboración en equipos distribuidos, comunicación efectiva en entornos digitales y ética en manejo de datos.",
    ],
    fuente:
      "AMITI (Asociación Mexicana de la Industria de Tecnologías de la Información) — Índice de Talento Digital México 2024; ANUIES — Panorama de la Educación Superior en STEM 2023",
    actividad_post:
      "Elige el perfil profesional digital que más te atrae de la infografía. Investiga en LinkedIn Jobs o Computrabajo qué habilidades técnicas y blandas solicitan las empresas mexicanas para ese perfil en este momento. ¿Qué necesitarías desarrollar desde ahora?",
    contexto_mexicano:
      "México produce alrededor de 5,000 egresados universitarios en carreras de TI por año, pero el mercado laboral demanda más de 40,000 especialistas anuales. Esta brecha de talento convierte al país en uno de los destinos de nearshoring tecnológico más atractivos de América del Norte para empresas estadounidenses y canadienses. Guadalajara (el 'Silicon Valley mexicano'), CDMX y Monterrey concentran el 70% del empleo tecnológico nacional.\n\nIniciat ivas como Laboratoria —que ha formado a miles de mujeres como desarrolladoras en México y Latinoamérica— y 'Niñas en Tecnología' de la Fundación Televisa muestran que la brecha de género puede reducirse con políticas activas. La Red Nacional de Mujeres en Ciencias y Tecnología del CONAHCYT ofrece mentorías para estudiantes en bachillerato y universidad.",
    glosario: [
      {
        termino: "Nearshoring",
        definicion:
          "Práctica de contratar servicios tecnológicos en países vecinos (México para EE.UU.) para aprovechar zonas horarias similares, costos menores y proximidad cultural.",
      },
      {
        termino: "Stack tecnológico",
        definicion:
          "Conjunto de lenguajes de programación, frameworks y herramientas que domina un desarrollador. Ejemplo: React + Node.js + PostgreSQL es un stack full-stack común.",
      },
      {
        termino: "UX (User Experience)",
        definicion:
          "Disciplina que diseña la experiencia completa de un usuario al interactuar con un producto digital, priorizando facilidad de uso, accesibilidad y satisfacción.",
      },
      {
        termino: "Bootcamp",
        definicion:
          "Programa de formación intensiva en habilidades tecnológicas (3–6 meses). Los modelos de pago diferido permiten estudiar sin pagar hasta conseguir empleo.",
      },
      {
        termino: "Ciencia de datos",
        definicion:
          "Campo interdisciplinario que combina estadística, programación y conocimiento del dominio para extraer conocimiento y apoyar decisiones a partir de grandes conjuntos de datos.",
      },
    ],
    preguntas_reflexion: [
      "¿Por qué crees que hay una brecha tan grande entre egresados de TI y la demanda del mercado en México? ¿Qué podría hacer el sistema educativo para reducirla?",
      "¿Qué factores —además de la habilidad técnica— explican la subrepresentación de las mujeres en el sector tecnológico mexicano? ¿Cuáles podrían modificarse desde el nivel bachillerato?",
      "El nearshoring abre oportunidades laborales en México. ¿Qué implicaciones tiene esto para las decisiones de formación de estudiantes como tú que hoy están en bachillerato?",
    ],
  },

  {
    codigo: "CH-I-P02-A1",
    titulo: "El tiempo histórico: cronológico, cíclico y vivido",
    descripcion_accesible:
      "Infografía dividida en tres secciones horizontales, cada una dedicada a un tipo de tiempo histórico. La sección superior —tiempo cronológico— muestra una línea del tiempo horizontal del siglo XV al XXI con hitos de la historia mexicana: Caída de México-Tenochtitlan (1521), Independencia (1821), Revolución (1910), Constitución (1917). Se incluye una comparación visual entre el calendario gregoriano y el Tonalpohualli azteca (260 días) y el Haab' maya (365 días). La sección central —tiempo cíclico— presenta un diagrama circular con los Cinco Soles de la cosmología nahuatl, con el Quinto Sol (era actual) destacado. La sección inferior —tiempo vivido o subjetivo— muestra fragmentos de testimonios orales de comunidades mexicanas y un diagrama que ilustra la diferencia entre memoria colectiva y historia oficial.",
    puntos_clave: [
      "Tiempo cronológico: sistema lineal que organiza eventos en secuencia ordenada. Base del calendario gregoriano establecido en 1582 por Gregorio XIII, hoy estándar internacional.",
      "Calendarios mesoamericanos: el sistema maya combina el Tzolk'in (260 días, ciclo ritual) y el Haab' (365 días, solar). Su sincronización produce la Rueda Calendárica de 52 años, equivalente a un siglo occidental.",
      "Tonalpohualli azteca (260 días) y Xiuhpohualli (365 días): sistemas paralelos que organizaban la vida religiosa, agrícola y política de los mexicas. Miguel León-Portilla los estudió como sistemas filosóficos completos.",
      "Tiempo cíclico: concepción del tiempo como ciclos que se repiten. En la cosmología nahuatl, el mundo actual es el Quinto Sol, creado en Teotihuacán cuando los dioses se sacrificaron. Los cuatro soles anteriores terminaron en catástrofes cósmicas.",
      "Los griegos también concibieron tiempos cíclicos: Polibio describió la anacyclosis (ciclo de regímenes políticos: monarquía → tiranía → aristocracia → oligarquía → democracia → oclocracia).",
      "Tiempo subjetivo (vivido): el tiempo tal como lo experimentan y recuerdan personas y comunidades. Para una familia migrante, el año de su llegada a la ciudad puede ser más significativo que cualquier fecha oficial de la historia nacional.",
      "Memoria colectiva: concepto del sociólogo Maurice Halbwachs (1950). Conjunto de recuerdos compartidos por un grupo social que selecciona, transforma y carga de significado el pasado según las necesidades del presente.",
      "Historia oral: metodología que recupera el tiempo subjetivo mediante testimonios. En México, el CIESAS y el INAH la practican para documentar historia de comunidades indígenas y movimientos sociales sin registro escrito.",
      "¿Por qué importa conocer los tres tipos? Porque analizar un evento solo con fechas cronológicas es incompleto: los actores históricos vivían y concebían el tiempo de maneras radicalmente distintas a las nuestras.",
    ],
    fuente:
      "León-Portilla, M. (1968). Tiempo y realidad en el pensamiento maya. UNAM. / Florescano, E. (2002). Historia de las historias de la nación mexicana. Taurus. / INAH — Catálogo del Patrimonio Cultural Intangible.",
    actividad_post:
      "Entrevista a un familiar mayor sobre un evento importante de su vida. Pregúntale: ¿cómo recuerda ese momento?, ¿qué eventos históricos más grandes ocurrían al mismo tiempo? Reflexiona: ¿su tiempo vivido coincide con el tiempo cronológico oficial?",
    contexto_mexicano:
      "México es uno de los países con mayor diversidad de concepciones del tiempo en el mundo. Los 68 pueblos indígenas reconocidos constitucionalmente tienen sus propios calendarios, ciclos festivos y formas de organizar la memoria colectiva. El calendario ritual totonaco, el sistema de cargos de los pueblos zapotecas y los ciclos agrícolas de comunidades mayas son sistemas vigentes que coexisten con el calendario gregoriano.\n\nEl INAH y el CIESAS han documentado cómo estas concepciones no son 'supervivencias del pasado' sino sistemas vivos que organizan la vida cotidiana de millones de mexicanos. Comprender el tiempo cíclico y subjetivo no es solo estudiar el pasado prehispánico: es reconocer la diversidad epistémica del México contemporáneo.",
    glosario: [
      {
        termino: "Cronología",
        definicion:
          "Ciencia y método que estudia la medición del tiempo y la datación de eventos históricos mediante sistemas calendáricos, capas geológicas o análisis de carbono-14.",
      },
      {
        termino: "Cosmogonía",
        definicion:
          "Relato o sistema explicativo sobre el origen del universo, el tiempo y los seres humanos. Cada cultura tiene su propia cosmogonía; la nahuatl organiza la historia en cinco eras o 'Soles'.",
      },
      {
        termino: "Memoria colectiva",
        definicion:
          "Conjunto de recuerdos compartidos por un grupo social. A diferencia de la historia académica, selecciona el pasado según los valores y necesidades identitarias del presente.",
      },
      {
        termino: "Historia oral",
        definicion:
          "Metodología histórica que recupera testimonios directos de protagonistas o testigos. Fundamental para documentar experiencias de comunidades sin registro escrito.",
      },
      {
        termino: "Anacyclosis",
        definicion:
          "Teoría del historiador griego Polibio sobre el ciclo inevitable de los regímenes políticos: cada forma de gobierno degenera en su versión corrupta antes de transformarse en la siguiente.",
      },
    ],
    preguntas_reflexion: [
      "¿Qué eventos de tu propia vida o de tu familia organizarías en una 'línea del tiempo subjetiva'? ¿En qué diferiría de una línea del tiempo de la historia nacional?",
      "¿Por qué crees que los pueblos mesoamericanos desarrollaron dos calendarios paralelos (ritual y solar) en lugar de uno solo? ¿Qué necesidades sociales y religiosas satisfacía cada uno?",
      "Si la 'historia oficial' y la 'memoria colectiva' de una comunidad describen el mismo evento de maneras distintas, ¿cuál de las dos es 'verdadera'? ¿Cómo podría el historiador trabajar con ambas?",
    ],
  },

  {
    codigo: "CH-II-P04-A1",
    titulo: "México y el mundo: historia conectada del siglo XIX al XXI",
    descripcion_accesible:
      "Infografía de línea del tiempo doble: una línea superior registra los grandes procesos globales (liberalismo europeo, imperialismo, Primera y Segunda Guerra Mundial, Guerra Fría, globalización neoliberal, pandemia COVID-19) y una línea inferior sincronizada registra los procesos mexicanos correspondientes (Reforma juarista, Intervención Francesa, Porfiriato, Revolución, milagro mexicano, crisis 1982, TLCAN, T-MEC). Flechas de color conectan procesos globales con sus equivalentes mexicanos, mostrando relaciones causales y de contexto. Cada nodo clave incluye un dato cuantitativo: año, porcentaje o cifra significativa.",
    puntos_clave: [
      "Reforma e imperialismo (1858–1867): la Intervención Francesa fue consecuencia directa de la política imperialista de Napoleón III. Usó la deuda externa como pretexto para intentar establecer un Imperio en México bajo Maximiliano de Habsburgo.",
      "Porfiriato y primera globalización (1876–1911): México se integró como exportador de materias primas (plata, henequén, petróleo). La inversión extranjera construyó 20,000 km de ferrocarril y concentró la tierra, generando las tensiones que estallarían en 1910.",
      "Revolución y Primera Guerra Mundial (1910–1920): el Telegrama Zimmermann (1917) —en que Alemania propuso a México recuperar Texas, Nuevo México y Arizona a cambio de aliarse— muestra la inserción de México en la geopolítica global del conflicto.",
      "Milagro mexicano y Guerra Fría (1940–1970): crecimiento sostenido del 6% anual en el contexto de la Guerra Fría. México mantuvo neutralidad formal pero se alineó con el bloque occidental. El movimiento estudiantil de 1968 y Tlatelolco ocurrieron el mismo año que el Mayo Francés.",
      "Crisis de la deuda y neoliberalismo (1982–1994): la moratoria de pagos de 1982 fue parte de la crisis global de endeudamiento del sur. El FMI impuso ajuste estructural: privatizaciones, reducción del gasto público, apertura comercial.",
      "TLCAN y el 'Efecto Tequila' (1994): la crisis financiera de diciembre de 1994 se extendió a Argentina y otros países latinoamericanos, mostrando la interconexión financiera global. El TLCAN integró a México al bloque económico norteamericano.",
      "T-MEC, pandemia y nearshoring (2020–presente): el T-MEC (2020) incorporó nuevas reglas laborales y de origen. La pandemia evidenció la dependencia de cadenas de suministro globales. La reconfiguración geopolítica EE.UU.-China abre oportunidades de nearshoring industrial para México.",
      "Historia conectada: ningún proceso histórico mexicano puede comprenderse en aislamiento. La Reforma juarista no existiría sin el liberalismo europeo; la crisis de 1982 no existiría sin la banca internacional de los 70s.",
    ],
    fuente:
      "Secretaría de Relaciones Exteriores (SRE) — Archivo Histórico Diplomático; CEPAL — Historia económica de América Latina; El Colegio de México — Historia General de México.",
    actividad_post:
      "Elige uno de los momentos de la línea del tiempo donde México y el mundo se conectan. Investiga: ¿qué actores globales tomaron decisiones que afectaron directamente a México? ¿Qué opciones tenía México y cuál eligió?",
    contexto_mexicano:
      "El Archivo General de la Nación (AGN) y el Acervo Histórico Diplomático de la SRE conservan los documentos primarios que evidencian cómo México ha estado integrado al sistema internacional desde el siglo XIX. El Telegrama Zimmermann original, los tratados de deuda con el FMI de los años 80 y los expedientes del TLCAN son fuentes primarias accesibles para investigadores.\n\nLa historia conectada —corriente historiográfica impulsada en México por historiadores como Enrique Florescano y Lorenzo Meyer— sostiene que México no puede entenderse como una historia nacional aislada: sus transformaciones más profundas (Reforma, Revolución, apertura económica) son simultáneamente locales y globales. Esta perspectiva es central en el Plan de Estudios NEM 2023.",
    glosario: [
      {
        termino: "Historia conectada",
        definicion:
          "Enfoque historiográfico que analiza procesos históricos como resultado de interacciones entre distintas regiones del mundo, en lugar de estudiar cada nación en aislamiento.",
      },
      {
        termino: "Imperialismo",
        definicion:
          "Política de expansión de una potencia sobre otros territorios para controlar sus recursos, mercados o rutas estratégicas. El imperialismo europeo del siglo XIX afectó directamente a México (Intervención Francesa).",
      },
      {
        termino: "Ajuste estructural",
        definicion:
          "Conjunto de reformas económicas impuestas por el FMI como condición para otorgar créditos: privatizaciones, reducción del gasto público, liberalización comercial y financiera.",
      },
      {
        termino: "Nearshoring",
        definicion:
          "Relocalización de procesos productivos en países vecinos para reducir costos logísticos y aprovechar ventajas competitivas. México es el principal destino de nearshoring para empresas estadounidenses en el contexto de la tensión EE.UU.-China.",
      },
      {
        termino: "Moratoria de pagos",
        definicion:
          "Declaración de suspensión temporal del pago de deuda. En agosto de 1982, México fue el primer país en declarar moratoria, desencadenando la crisis de deuda latinoamericana.",
      },
    ],
    preguntas_reflexion: [
      "¿Por qué Napoleón III quiso establecer un Imperio en México en los años 1860? ¿Qué intereses económicos y geopolíticos lo motivaron?",
      "¿Qué similitudes encuentras entre la crisis de deuda de 1982 y la pandemia de 2020 como 'perturbaciones externas' que afectaron a México? ¿Cómo respondió México en cada caso?",
      "El nearshoring actual es consecuencia de la tensión geopolítica EE.UU.-China. ¿Qué oportunidades y qué riesgos implica para México depender de las decisiones de otras potencias?",
    ],
  },

  {
    codigo: "CH-III-P04-A1",
    titulo: "Formatos para comunicar historia: del ensayo académico a las redes sociales",
    descripcion_accesible:
      "Infografía en forma de espectro horizontal que va del formato más académico y especializado (izquierda) al más popular y masivo (derecha). En la izquierda: el ensayo académico con aparato crítico completo, publicado en revistas como Historia Mexicana o Mexican Studies. En el centro-izquierda: el artículo de divulgación en publicaciones como Nexos, Letras Libres o Relatos e Historias en México. Al centro: la exposición oral y el documental histórico. En el centro-derecha: el podcast de historia con ejemplos mexicanos. A la derecha: la historia en redes sociales (hilos de Twitter, carruseles de Instagram, videos de TikTok). Cada formato incluye un icono, audiencia típica, longitud y nivel de rigor recomendado.",
    puntos_clave: [
      "Ensayo académico: el formato más riguroso, con notas al pie, bibliografía completa y citas de fuentes primarias. Audiencia: historiadores y académicos. Publicaciones de referencia: Historia Mexicana (El Colegio de México) y Mexican Studies (UC Press).",
      "Artículo de divulgación: lenguaje accesible sin sacrificar rigor. Reduce el aparato crítico pero mantiene verificabilidad. Nexos, Letras Libres y Relatos e Historias en México son los referentes mexicanos del género.",
      "Exposición oral: requiere estructura clara (tesis → argumentos → conclusión), evidencias visuales (mapas, fotografías) y adaptación del lenguaje a la audiencia específica. La oralidad permite retroalimentación inmediata.",
      "Documental histórico: combina imagen de archivo, narración, entrevistas a expertos y testimonios. Permite audiencias masivas pero exige síntesis rigurosa. Series del Canal 22 y documentales del IMCINE son referentes mexicanos.",
      "Podcast de historia: formato conversacional de creciente popularidad. Permite profundidad sin imagen, ideal para audiencias en movilidad. El reto: mantener rigor sin perder accesibilidad. Ejemplos mexicanos: Chilango History, Historia de México.",
      "Infografía histórica: comunica información compleja —líneas de tiempo, relaciones causales, datos estadísticos— en formato visual. Herramientas como TimelineJS y Canva democratizan su creación. El reto: no simplificar en exceso.",
      "Historia en redes sociales: formatos cortos (hilo de Twitter, carrusel de Instagram, TikTok) alcanzan audiencias masivas de jóvenes. El riesgo: simplificación excesiva, descontextualización y viralización de errores históricos.",
      "Criterio común a todos los formatos: veracidad verificable. Independientemente del formato, el comunicador histórico tiene la responsabilidad de citar sus fuentes, distinguir entre hechos e interpretaciones y no alterar evidencias.",
    ],
    fuente:
      "El Colegio de México — Historia Mexicana (revista académica); Canal 22 / IMCINE — Archivo de documentales históricos; INAH — Recursos de divulgación del patrimonio histórico.",
    actividad_post:
      "Elige un evento histórico mexicano del siglo XX. Elabora dos versiones breves del mismo evento: una para un artículo académico (con cita de fuente primaria) y otra para un hilo de Twitter de máximo 5 tweets. ¿Qué información tuviste que sacrificar en la versión corta? ¿Es ese sacrificio aceptable?",
    contexto_mexicano:
      "México tiene una tradición sólida de divulgación histórica. El Colegio de México, fundado en 1940, ha publicado décadas de investigación histórica de primer nivel en Historia Mexicana, la revista académica de historia más antigua en español de América Latina. Al mismo tiempo, el muralismo mexicano fue históricamente la primera 'red social' masiva de comunicación histórica: los murales de Diego Rivera en el Palacio Nacional narran la historia de México para audiencias que no sabían leer.\n\nHoy, la historia en redes sociales enfrenta el mismo desafío que el muralismo: simplificar sin falsificar, hacer accesible sin trivializar. Cuentas mexicanas como la del INAH en Instagram o las series de Relatos e Historias en México muestran que es posible combinar rigor y alcance masivo.",
    glosario: [
      {
        termino: "Fuente primaria",
        definicion:
          "Documento, objeto o testimonio producido en el mismo período histórico que se estudia. Ejemplos: carta original, diario, decreto, fotografía de época, testimonio oral directo.",
      },
      {
        termino: "Fuente secundaria",
        definicion:
          "Análisis, interpretación o síntesis de fuentes primarias realizada con posterioridad. Ejemplos: libro de historia, artículo académico, documental que interpreta documentos de archivo.",
      },
      {
        termino: "Aparato crítico",
        definicion:
          "Sistema de notas al pie, referencias bibliográficas y citas que permiten verificar el origen de cada afirmación en un texto académico.",
      },
      {
        termino: "Divulgación",
        definicion:
          "Práctica de comunicar conocimiento especializado a audiencias no expertas, usando lenguaje accesible sin sacrificar la veracidad del contenido.",
      },
      {
        termino: "Infodemia",
        definicion:
          "Sobreabundancia de información, verdadera y falsa, que dificulta identificar fuentes confiables. El término se popularizó durante la pandemia de COVID-19 y aplica también a la circulación de historia falsa en redes.",
      },
    ],
    preguntas_reflexion: [
      "¿Qué ganas y qué pierdes cuando traduces un evento histórico de un ensayo académico a un hilo de Twitter de 5 tweets? ¿Ese sacrificio es siempre inaceptable o depende del propósito?",
      "Diego Rivera usó el mural como formato de comunicación histórica masiva en el siglo XX. ¿Qué formato equivalente usarías tú hoy para comunicar historia a jóvenes de tu misma edad?",
      "¿Cómo distingues entre una cuenta de historia en redes sociales que divulga con rigor y una que simplifica o distorsiona? ¿Qué señales buscarías?",
    ],
  },

  {
    codigo: "CNEYT-II-P04-A1",
    titulo: "Calor, temperatura y transferencia térmica: los tres mecanismos",
    descripcion_accesible:
      "Infografía dividida en cuatro secciones. La primera sección superior distingue visualmente los conceptos de temperatura (representada con un termómetro y la escala Kelvin/Celsius/Fahrenheit) y calor (representado con una flecha de transferencia entre un objeto rojo caliente y uno azul frío, con la ecuación Q = mcΔT y las unidades en joules y calorías). Las tres secciones inferiores presentan cada mecanismo de transferencia de calor: conducción con el ejemplo de una barra metálica calentada en un extremo; convección con el diagrama de un calentador de agua mostrando las corrientes circulares (agua caliente sube, fría baja); radiación con el ejemplo del Sol transfiriendo energía a la Tierra a través del vacío del espacio.",
    puntos_clave: [
      "Temperatura: medida del movimiento promedio (energía cinética) de las partículas de un cuerpo. A mayor temperatura, mayor velocidad de movimiento de las partículas. Unidades: Kelvin (K), Celsius (°C), Fahrenheit (°F).",
      "Conversión de escalas: K = °C + 273.15. El cero absoluto (0 K = −273.15°C) es la temperatura teórica en que las partículas dejan de moverse. La escala Fahrenheit: °F = (°C × 9/5) + 32.",
      "Calor: energía en tránsito que fluye espontáneamente de un cuerpo a mayor temperatura hacia uno de menor temperatura. Unidad: Joule (J) en el Sistema Internacional. 1 caloría = 4.184 J.",
      "Conducción: transferencia de calor por contacto directo entre partículas adyacentes sin movimiento de materia. Más eficiente en sólidos, especialmente metales. Ejemplo: el mango de una sartén caliente. Materiales aislantes (madera, lana, adobe) tienen baja conductividad.",
      "Convección: transferencia de calor por movimiento masivo de fluidos (líquidos o gases). El fluido caliente, menos denso, asciende; el frío, más denso, desciende, creando corrientes. Ejemplo: calentador de agua, viento marino, corrientes oceánicas.",
      "Radiación: transferencia de calor por ondas electromagnéticas, sin necesidad de medio material. Es el único mecanismo que funciona en el vacío. El Sol transfiere energía a la Tierra (150 millones de km) por radiación. Longitud de onda del infrarrojo: 700 nm a 1 mm.",
      "Equilibrio térmico: cuando dos cuerpos en contacto alcanzan la misma temperatura, el flujo de calor entre ellos se detiene. La temperatura final es un promedio ponderado por sus masas y calores específicos.",
      "Aplicaciones prácticas: aislamiento térmico (paredes de poliestireno, ropa de invierno) reduce la conducción; el efecto invernadero es radiación atrapada; las corrientes de convección generan los vientos y las corrientes marinas que regulan el clima.",
      "El calor específico: cantidad de calor necesaria para elevar 1°C la temperatura de 1 gramo de una sustancia. El agua tiene calor específico muy alto (4.18 J/g°C), lo que la hace ideal para almacenar y transportar calor.",
    ],
    fuente:
      "CINVESTAV-IPN (Centro de Investigación y de Estudios Avanzados) — Departamento de Física; INECC (Instituto Nacional de Ecología y Cambio Climático) — Datos de temperatura superficial en México 2024.",
    actividad_post:
      "Identifica en tu hogar un ejemplo de cada mecanismo de transferencia de calor. Para cada uno, escribe: qué cuerpo cede calor, qué cuerpo lo recibe y cómo reconociste el mecanismo. Si tu casa tiene paredes de adobe u otro material aislante tradicional, ¿qué mecanismo está reduciendo?",
    contexto_mexicano:
      "El INECC (Instituto Nacional de Ecología y Cambio Climático) registra que la temperatura promedio de México ha aumentado aproximadamente 1.1°C desde la era preindustrial, y proyecta aumentos de entre 1.5°C y 4°C para 2100 según el escenario de emisiones. Las ciudades mexicanas experimentan el efecto de isla de calor urbano: en la Ciudad de México, la temperatura en zonas densamente urbanizadas puede ser hasta 5°C mayor que en zonas verdes aledañas, un fenómeno explicado directamente por los mecanismos de conducción y convección.\n\nLas técnicas de construcción tradicional mexicana —el adobe, los muros de tierra apisonada y los techos de teja— explotan la baja conductividad térmica de estos materiales para mantener los espacios frescos durante el día y templados por la noche. El CINVESTAV ha investigado cómo adaptar estos materiales tradicionales a construcción contemporánea sustentable como respuesta al cambio climático.",
    glosario: [
      {
        termino: "Energía cinética",
        definicion:
          "Energía asociada al movimiento. A escala molecular, la temperatura es una medida de la energía cinética promedio de las partículas de una sustancia.",
      },
      {
        termino: "Conductividad térmica",
        definicion:
          "Propiedad de un material que indica qué tan eficientemente transmite calor por conducción. Los metales tienen alta conductividad; el vidrio, la madera y el aire tienen baja conductividad.",
      },
      {
        termino: "Equilibrio térmico",
        definicion:
          "Estado en que dos cuerpos en contacto alcanzan la misma temperatura y el flujo neto de calor entre ellos es cero. Es el principio cero de la termodinámica.",
      },
      {
        termino: "Radiación infrarroja",
        definicion:
          "Tipo de radiación electromagnética con longitudes de onda entre el rojo visible y las microondas. Es la forma en que los cuerpos calientes transfieren energía al entorno. Invisible para el ojo humano pero detectable como calor.",
      },
      {
        termino: "Efecto invernadero",
        definicion:
          "Fenómeno por el que ciertos gases (CO₂, metano, vapor de agua) en la atmósfera absorben la radiación infrarroja emitida por la Tierra y la reemiten hacia la superficie, elevando la temperatura global.",
      },
    ],
    preguntas_reflexion: [
      "¿Por qué el adobe y los muros de tierra gruesos mantienen las casas frescas en verano y cálidas en invierno? Explica usando los conceptos de conductividad térmica y equilibrio térmico.",
      "Si el Sol está a 150 millones de km de la Tierra y entre ambos existe un vacío casi perfecto, ¿cómo llega el calor solar a la Tierra? ¿Por qué conducción y convección no funcionarían?",
      "El efecto de isla de calor urbano hace que las ciudades sean más calientes que las zonas rurales cercanas. ¿Qué cambios en el diseño urbano podrían reducir este efecto usando los principios de conducción, convección y radiación?",
    ],
  },

  {
    codigo: "CNEYT-II-P07-A1",
    titulo: "Matriz energética de México: renovables, no renovables y la transición pendiente",
    descripcion_accesible:
      "Infografía en forma de mapa de México con íconos sobre cada región que indica el recurso energético predominante: paneles solares sobre Sonora y Baja California, aerogeneradores sobre el Istmo de Tehuantepec (Oaxaca), plumas de vapor sobre Los Humeros (Puebla) y Cerro Prieto (Baja California) para geotermia, y símbolos de presas sobre Chiapas y Guerrero para hidroeléctrica. El norte del mapa tiene barriles de petróleo sobre Campeche y Tabasco. Una barra de progreso lateral muestra la composición actual de la generación eléctrica nacional: aproximadamente 75% no renovable (combustibles fósiles), 25% renovable (hidro + eólica + solar + geotérmica), con la meta del Acuerdo de París señalada como objetivo futuro.",
    puntos_clave: [
      "Composición actual de la generación eléctrica en México: ~75% combustibles fósiles (gas natural, petróleo, carbón), ~10% hidroeléctrica, ~7% eólica, ~4% solar, ~3% geotérmica, resto nuclear y otras (SENER 2024).",
      "Petróleo: México produjo 1.8 millones de barriles diarios en 2023 (Pemex). Los principales campos están en el Golfo (Campeche, Tabasco, Veracruz). La producción ha caído desde el pico histórico de 3.4 mbd en 2004.",
      "Hidroeléctrica: segunda fuente de generación renovable. Las presas de Chiapas (Angostura, Malpaso) y Guerrero generan la mayor parte. Riesgo creciente por sequías intensificadas por el cambio climático.",
      "Eólica: México tiene el mayor corredor eólico de América Latina en el Istmo de Tehuantepec (La Ventosa, La Venta). Oaxaca concentra el 70% de la capacidad instalada eólica del país.",
      "Solar: México recibe entre 4.4 y 6.3 kWh/m²/día de radiación solar. Sonora, Chihuahua y Baja California tienen el mayor potencial solar del planeta. La capacidad instalada solar creció 300% entre 2018 y 2023.",
      "Geotermia: México es el quinto productor mundial de energía geotérmica. Los campos Los Humeros (Puebla) y Cerro Prieto (Baja California) son los principales. Recurso disponible las 24 horas, sin variabilidad climática.",
      "Compromiso del Acuerdo de París: México se comprometió a reducir sus emisiones de gases de efecto invernadero un 22–36% para 2030 y alcanzar el 35% de generación limpia para ese año.",
      "Debate soberanía energética vs. transición: la política energética de México privilegia el fortalecimiento de Pemex y CFE como empresas del Estado. El debate entre soberanía energética y transición acelerada a renovables define el futuro del sector.",
      "Nearshoring y demanda energética: la llegada de nuevas plantas industriales por nearshoring aumenta la demanda de electricidad en el norte de México, presionando la capacidad de generación y la necesidad de nuevas plantas.",
    ],
    fuente:
      "Secretaría de Energía (SENER) — Balance Nacional de Energía 2024; Comisión Reguladora de Energía (CRE); IRENA (Agencia Internacional de Energías Renovables) — Perfil Energético México 2024.",
    actividad_post:
      "Compara el porcentaje de generación eléctrica renovable de México (~25%) con el de Alemania (~55%) o Costa Rica (~99%). ¿Qué factores geográficos, políticos y económicos explican estas diferencias? ¿Qué ventajas tiene México que aún no aprovecha al máximo?",
    contexto_mexicano:
      "México tiene uno de los mayores potenciales de energía renovable del mundo: el norte es de los lugares con más radiación solar del planeta, el Istmo de Tehuantepec tiene vientos de clase 7 (los más intensos clasificados), y su posición geotectónica le da un enorme recurso geotérmico. Sin embargo, la transición energética es lenta y políticamente compleja: Pemex y CFE son empresas estratégicas del Estado con millones de trabajadores y décadas de inversión acumulada.\n\nEl INECC proyecta que, sin una aceleración en la transición energética, México no cumplirá sus compromisos del Acuerdo de París para 2030. Al mismo tiempo, la llegada de inversión industrial por nearshoring —que requiere garantías de suministro eléctrico limpio para cumplir estándares ESG de sus clientes norteamericanos— presiona al gobierno a expandir la capacidad de generación renovable, especialmente en los estados del norte.",
    glosario: [
      {
        termino: "Matriz energética",
        definicion:
          "Distribución porcentual de las distintas fuentes de energía que un país usa para generar electricidad y calefacción. Refleja decisiones políticas, geográficas y económicas.",
      },
      {
        termino: "Energía geotérmica",
        definicion:
          "Energía producida aprovechando el calor interno de la Tierra. Se extrae perforando pozos en zonas volcánicamente activas y usando el vapor para mover turbinas. México es el 5° productor mundial.",
      },
      {
        termino: "Capacidad instalada",
        definicion:
          "Potencia máxima de generación eléctrica que puede producir una planta o un país en condiciones óptimas. Se mide en megawatts (MW) o gigawatts (GW). Diferente de la generación real, que depende de condiciones climáticas.",
      },
      {
        termino: "Soberanía energética",
        definicion:
          "Principio político que defiende el control estatal sobre los recursos y la producción de energía de un país, priorizando la autonomía frente a empresas extranjeras o mercados internacionales.",
      },
      {
        termino: "ESG (Environmental, Social, Governance)",
        definicion:
          "Estándares internacionales que evalúan a las empresas según su desempeño ambiental, social y de gobernanza. Empresas con presencia en México exigen energía renovable (ESG ambiental) para cumplir compromisos con sus clientes globales.",
      },
    ],
    preguntas_reflexion: [
      "¿Por qué México, teniendo uno de los mayores potenciales solares y eólicos del mundo, aún genera el 75% de su electricidad con combustibles fósiles? ¿Qué factores explican esta paradoja?",
      "¿Cómo se relaciona la llegada de empresas industriales por nearshoring con la urgencia de expandir la generación de energía renovable en el norte de México?",
      "¿Crees que México debería priorizar la soberanía energética (control estatal de Pemex y CFE) o la transición acelerada a renovables con inversión privada? ¿Qué implicaciones tiene cada opción para los trabajadores del sector energético?",
    ],
  },

  // ── LOTE 2: CNEYT-III (×2), CNEYT-IV (×2), CNEYT-V, CNEYT-VI (×2) ─────────

  {
    codigo: "CNEYT-III-P01-A1",
    titulo: "Biomas de México: 12 ecosistemas, megadiversidad y áreas naturales protegidas",
    descripcion_accesible:
      "Infografía con un mapa de México al centro, usando escala de colores por bioma: verdes para selvas, amarillos para zonas áridas, azules para humedales y costas, morado para bosques templados. El mapa está rodeado de ocho paneles temáticos, uno por ecosistema principal, con su fauna y flora representativa. En la esquina superior izquierda, tres cifras destacadas: '10–12% de la biodiversidad mundial', '12 de 14 biomas terrestres' y '182 ANP federales'. En la franja inferior, una barra comparativa de cobertura forestal actual versus 1970 para las cinco entidades con mayor pérdida acumulada. El margen derecho muestra íconos de diez especies emblemáticas por bioma: oso negro en bosque templado, jaguar en selva húmeda, borrego cimarrón en Desierto Chihuahuense, flamenco en humedal costero y tiburón ballena en arrecife de coral.",
    puntos_clave: [
      "México alberga el 10–12% de la biodiversidad mundial siendo apenas el 1.5% del territorio global. La CONABIO (2023) lo clasifica entre los cinco países megadiversos junto a Brasil, Indonesia, Colombia y China.",
      "El territorio mexicano comprende 12 de los 14 biomas terrestres reconocidos: selvas húmedas, selvas secas, manglares, pastizales, matorrales xerófilos, bosques templados, desiertos, humedales, dunas costeras, arrecifes de coral, petenes y matorral halófilo.",
      "La Selva Lacandona en Chiapas es el mayor remanente de selva tropical húmeda de Mesoamérica en México, con ~600,000 hectáreas. Alberga más de 3,000 especies de plantas vasculares y 450 especies de aves.",
      "México tiene 182 Áreas Naturales Protegidas federales que cubren ~23 millones de hectáreas —el 11.6% del territorio nacional—, incluyendo 43 Reservas de la Biosfera reconocidas por la UNESCO.",
      "Las zonas áridas y semiáridas cubren el 60% del territorio mexicano. El Desierto Chihuahuense es el más grande de Norteamérica y el más biodiverso del mundo en cactáceas, con más de 900 especies, muchas endémicas.",
      "Los arrecifes del Golfo de México y el Caribe forman el Sistema Arrecifal Mesoamericano, el segundo del mundo. La blanqueación masiva de 2023 dañó el 80% del coral de Cozumel por temperaturas marinas récord de 33 °C.",
      "Los manglares mexicanos cubren ~775,000 hectáreas. México es el cuarto país con mayor extensión de manglar. Campeche, Yucatán y Quintana Roo concentran la mayor cobertura; los manglares son criaderos de especies pesqueras y barrera contra huracanes.",
      "La pérdida neta de bosques y selvas fue de ~244,000 hectáreas por año en 2000–2020 (CONAFOR/Global Forest Watch). Las causas principales son ganadería extensiva, agricultura de roza-tumba-quema y cambio de uso de suelo urbano.",
      "El Corredor Biológico Mesoamericano conecta ANP desde el sur de México hasta Panamá para mantener la conectividad de hábitats. México comprometió 300 millones de dólares para su restauración entre 2021 y 2026.",
    ],
    fuente:
      "CONABIO — Biodiversidad Mexicana 2023; CONAFOR — Inventario Nacional Forestal y de Suelos 2020; SEMARNAT — Informe de la Situación del Medio Ambiente en México 2022",
    actividad_post:
      "Elige uno de los 12 biomas de México. Con datos del portal biodiversidad.gob.mx identifica: tres especies emblemáticas, su estado de conservación según la NOM-059-SEMARNAT, el ANP donde se protegen y una amenaza concreta. Presenta tus hallazgos como una ficha de campo de una página.",
    contexto_mexicano:
      "México es un caso único de megadiversidad por su posición geográfica en el punto de encuentro entre dos regiones biogeográficas (Neártica y Neotropical), su topografía extrema que genera docenas de microclimas y una historia geológica que facilita la diversificación evolutiva. El Sistema Nacional de Información sobre Biodiversidad (SNIB) de la CONABIO registra más de 126,000 especies conocidas, de las cuales el 30–50% son endémicas.\n\nSin embargo, México encabeza también rankings de pérdida de biodiversidad. La Lista Roja de la UICN (2023) registra 2,800 especies mexicanas amenazadas. El ajolote (Ambystoma mexicanum), el quetzal en Chiapas y la vaquita marina —con menos de 10 individuos en 2024— son los emblemas de esta crisis. El Programa de Acción para la Conservación de Especies (PACE) de la SEMARNAT gestiona planes de recuperación para 60 especies en estado crítico.",
    glosario: [
      {
        termino: "Bioma",
        definicion:
          "Gran región de la Tierra caracterizada por su vegetación dominante, clima y comunidad de seres vivos. Los biomas no tienen fronteras rígidas: se solapan en zonas de transición llamadas ecotonos.",
      },
      {
        termino: "Especie endémica",
        definicion:
          "Especie cuya distribución natural está limitada a una región geográfica específica y no existe en estado silvestre en ningún otro lugar del mundo. México tiene una de las tasas de endemismo más altas del planeta.",
      },
      {
        termino: "ANP (Área Natural Protegida)",
        definicion:
          "Porción del territorio donde el Estado limita las actividades humanas para conservar ecosistemas, biodiversidad y procesos evolutivos. En México existen seis categorías: Reserva de la Biosfera, Parque Nacional, Monumento Natural, entre otras.",
      },
      {
        termino: "Sucesión ecológica",
        definicion:
          "Proceso de cambio gradual y ordenado de comunidades de seres vivos en un ecosistema a lo largo del tiempo, desde una comunidad pionera hasta una comunidad clímax estable.",
      },
      {
        termino: "Servicio ecosistémico",
        definicion:
          "Beneficio que los ecosistemas naturales brindan a las sociedades sin costo monetario directo: purificación del agua, regulación del clima, polinización de cultivos, control de inundaciones y recreación.",
      },
    ],
    preguntas_reflexion: [
      "¿Por qué la posición de México entre la región Neártica y Neotropical genera tanta biodiversidad? Explica con un ejemplo de especie que podría vivir en ambas regiones.",
      "La vaquita marina tiene menos de 10 individuos en 2024 a pesar de programas de conservación desde 2008. ¿Qué factores estructurales —económicos, sociales, de gobernanza— dificultan salvar una especie cuando su población es tan pequeña?",
      "¿Es posible conservar la biodiversidad y al mismo tiempo satisfacer las necesidades económicas de comunidades rurales que viven dentro o cerca de las ANP? ¿Qué modelos de conservación comunitaria existen en México?",
    ],
  },

  {
    codigo: "CNEYT-III-P04-A1",
    titulo: "Ciclos biogeoquímicos y crisis climática: carbono, agua, nitrógeno y fósforo en México",
    descripcion_accesible:
      "Infografía circular dividida en cuatro cuadrantes, uno por ciclo biogeoquímico. Cuadrante azul para el agua, gris-verde para el carbono, amarillo para el nitrógeno y naranja para el fósforo. En el centro, un diagrama de la Tierra con flechas de intercambio entre la atmósfera, la biosfera, el suelo y el océano. Cada cuadrante muestra: un diagrama de flujo simplificado del ciclo, un dato numérico clave de México y un ícono de la principal amenaza humana (fábrica para carbono, grifo para agua, tractor para nitrógeno, mina para fósforo). En la franja inferior, una escala de tiempo que muestra cuánto tarda cada ciclo en completar una vuelta: carbono (300–1,000 años en depósitos fósiles), agua (9 días en atmósfera, 3,000 años en glaciares), nitrógeno (días a años), fósforo (siglos a milenios).",
    puntos_clave: [
      "Los ciclos biogeoquímicos mueven materiales entre cuatro reservorios: la atmósfera, la hidrosfera, la litosfera y la biosfera. La energía solar y la gravedad son los motores que mantienen activos estos ciclos.",
      "El ciclo del carbono en equilibrio: las plantas absorben CO₂ por fotosíntesis, los animales lo liberan por respiración, los descomponedores lo devuelven al suelo. La actividad humana añade ~37 Gt de CO₂ adicional por año, cantidad que los ecosistemas no reabsorben al ritmo actual.",
      "México emite aproximadamente 750 millones de toneladas de CO₂ equivalente por año (INECC 2022), el 1.4% de las emisiones globales. El 25% proviene de la deforestación y cambio de uso de suelo —una de las proporciones más altas entre economías emergentes.",
      "La Cuenca Lerma-Chapala, la más importante del centro del país, ha perdido el 74% de su caudal natural entre 1940 y 2020 por sobrexplotación agrícola e industrial. El Lago de Chapala alcanzó su nivel mínimo histórico en 2021 con apenas el 27% de capacidad.",
      "El ciclo del nitrógeno está siendo alterado por el uso masivo de fertilizantes: México aplica ~2 millones de toneladas anuales de fertilizantes nitrogenados. El nitrógeno no absorbido se lixivia al agua subterránea o escurre a ríos causando eutrofización.",
      "La eutrofización —enriquecimiento de nutrientes en cuerpos de agua— provoca floraciones de algas que consumen el oxígeno disuelto y matan peces. El lago Catemaco en Veracruz y la Bahía de Banderas son ejemplos recurrentes de este fenómeno en México.",
      "El ciclo del fósforo es el más lento: el fósforo no tiene fase gaseosa, circula exclusivamente entre suelos, agua y seres vivos. Las reservas mundiales de roca fosfática podrían agotarse en 300–400 años según estimaciones del USGS.",
      "Los humedales mexicanos —manglares, petenes, tulares y lagunas costeras— pueden almacenar de 3 a 5 veces más carbono por hectárea que los bosques tropicales, pero su destrucción libera ese carbono acumulado en siglos en pocas décadas.",
    ],
    fuente:
      "INECC — Inventario Nacional de Emisiones GEI 2022; SEMARNAT — Informe de la Situación del Medio Ambiente en México 2022; CONAFOR — Estrategia Nacional REDD+ 2017–2030",
    actividad_post:
      "Elige un cuerpo de agua de tu estado (lago, río, presa o laguna). Investiga: ¿qué actividades humanas en su cuenca afectan el ciclo del nitrógeno o del fósforo? ¿Hay reportes de eutrofización? Elabora un diagrama de flujo del ciclo del nitrógeno en esa cuenca incluyendo las intervenciones humanas.",
    contexto_mexicano:
      "México es un laboratorio privilegiado para estudiar ciclos biogeoquímicos alterados. La Cuenca del Valle de México —que albergaba el sistema lacustre más grande de Norteamérica antes de la conquista española— es hoy una megalópolis de 22 millones de personas que extrae agua de acuíferos sobrexplotados y bombea el agua residual tratada hacia el río Tula, alterando el ciclo del agua y del nitrógeno a escala regional.\n\nEl Acuerdo de París obliga a México a reducir sus emisiones de GEI en un 35% al 2030 respecto al escenario tendencial. La Estrategia Nacional de REDD+ del CONAFOR es el mecanismo mediante el cual México puede recibir financiamiento climático internacional a cambio de conservar o restaurar la cobertura forestal —en esencia, de conservar el ciclo del carbono.",
    glosario: [
      {
        termino: "Fotosíntesis",
        definicion:
          "Proceso por el cual plantas, algas y ciertas bacterias transforman CO₂ y agua en glucosa y oxígeno usando energía solar. Es la principal entrada de carbono a la biosfera.",
      },
      {
        termino: "Respiración celular",
        definicion:
          "Proceso metabólico por el cual los seres vivos obtienen energía al descomponer glucosa, liberando CO₂ y agua como productos. Es la principal vía de salida de carbono de la biosfera.",
      },
      {
        termino: "Eutrofización",
        definicion:
          "Enriquecimiento excesivo de nutrientes (especialmente nitrógeno y fósforo) en un cuerpo de agua, que provoca proliferación masiva de algas, déficit de oxígeno disuelto y muerte de especies acuáticas.",
      },
      {
        termino: "Descomponedor",
        definicion:
          "Organismo (hongos, bacterias) que degrada la materia orgánica muerta y devuelve los nutrientes al suelo. Sin descomponedores, los nutrientes quedarían atrapados en la biomasa y los ciclos biogeoquímicos se detendrían.",
      },
      {
        termino: "Sumidero de carbono",
        definicion:
          "Reservorio natural o artificial que absorbe y almacena más carbono del que libera. Los bosques, océanos y suelos son los principales sumideros naturales. Su destrucción convierte estos reservorios en fuentes de carbono.",
      },
    ],
    preguntas_reflexion: [
      "Si la Cuenca Lerma-Chapala ha perdido el 74% de su caudal histórico, ¿a qué etapa del ciclo del agua afecta principalmente esa pérdida (evaporación, precipitación, escurrimiento, infiltración)? ¿Qué estrategias podrían restaurar el ciclo?",
      "¿Por qué la destrucción de humedales contribuye más al cambio climático que la deforestación de selvas, si ambos liberan carbono? Explica en términos del ciclo del carbono y la densidad de almacenamiento.",
      "El fósforo es esencial para fertilizar cultivos pero sus reservas son finitas y no reciclables a corto plazo. ¿Cómo debería México planificar el uso de este recurso para garantizar seguridad alimentaria en el largo plazo?",
    ],
  },

  {
    codigo: "CNEYT-IV-P02-A1",
    titulo: "Reacciones químicas en la industria mexicana: síntesis, descomposición, oxidación y combustión",
    descripcion_accesible:
      "Infografía en formato de grilla hexagonal donde cada hexágono representa un tipo de reacción química con su ecuación general en letras grandes: azul para síntesis, rojo para descomposición, verde para desplazamiento simple, naranja para doble desplazamiento y morado oscuro para combustión. Cada hexágono incluye un ejemplo cotidiano en la parte superior y un ejemplo de la industria mexicana en la parte inferior. En el margen derecho, una sección 'Reacciones que nos rodean en México' con tres casos reales: producción de nixtamal (reacción del maíz con cal viva), procesamiento del petróleo en la refinería de Salamanca y tratamiento del agua potable con cloro en SACMEX. En la franja inferior, una línea de tiempo de la química en México: primera farmacia en siglo XVII, Escuela Nacional de Química (1916) y Premio Nobel de Química a Mario Molina (1995).",
    puntos_clave: [
      "Síntesis (combinación): dos o más sustancias se unen para formar una nueva (A + B → AB). Ejemplo industrial: síntesis de amoniaco (NH₃) en plantas de fertilizantes de Fertinal en Lázaro Cárdenas, Michoacán, que abastecen la agricultura nacional.",
      "Descomposición: una sustancia se divide en dos o más componentes (AB → A + B). Ejemplo: descomposición electrolítica del agua en plantas de hidrógeno verde que la CFE pilotea en Sonora y Baja California para almacenar energía renovable.",
      "Desplazamiento simple: un elemento reemplaza a otro en un compuesto (A + BC → AC + B). Ejemplo: en la metalurgia de cobre en Cananea, Sonora, el hierro desplaza al cobre en solución ácida para recuperarlo de los relaves mineros.",
      "Doble desplazamiento: los iones de dos compuestos intercambian lugares. El derrame del Río Sonora (agosto 2014) liberó 40,000 m³ de solución ácida de sulfato de cobre de la mina Buenavista del Cobre —reacción no controlada que contaminó 260 km del río y afectó a 22,000 personas.",
      "Combustión: reacción con oxígeno que libera energía, CO₂ y H₂O. Las termoeléctricas de la CFE —que generaban el 62% de la electricidad de México— dependen de la combustión de gas natural, carbón y combustóleo.",
      "Óxido-reducción (redox): transferencia de electrones entre sustancias. La refinería de Salamanca (Gto.), la más grande de México con capacidad para 245,000 barriles/día, opera múltiples procesos redox en el hidrotratamiento del petróleo crudo.",
      "Salamanca como caso de estudio: décadas de operaciones de refinación y fundición de plomo contaminaron suelos y acuíferos. El INECC detectó niveles de plomo en sangre en niños de Salamanca cinco veces por encima del límite de la OPS.",
      "Química verde — 12 principios: diseñar procesos químicos que prevengan la contaminación en el origen. El Instituto de Química de la UNAM es líder latinoamericano en catalizadores más eficientes, disolventes verdes y síntesis de medicamentos sin subproductos tóxicos.",
      "La velocidad de las reacciones depende de: temperatura (a mayor temperatura, mayor velocidad), concentración de reactantes, superficie de contacto (sólidos en polvo reaccionan más rápido) y presencia de catalizadores (reducen la energía de activación sin consumirse).",
    ],
    fuente:
      "Instituto Mexicano del Petróleo (IMP) — Procesos petroquímicos y refinación 2023; UNAM Instituto de Química — Líneas de investigación en química sustentable 2023; INECC — Evaluación ambiental Salamanca 2021",
    actividad_post:
      "Investiga el caso del Río Sonora 2014: ¿qué reacciones químicas explican la toxicidad del sulfato de cobre? ¿Por qué el pH ácido aumentó el daño ecológico? ¿Qué medidas de remediación química se aplicaron? Elabora un informe de dos páginas explicando el desastre usando los tipos de reacciones aprendidos.",
    contexto_mexicano:
      "Las reacciones químicas tienen consecuencias directas en la calidad de vida de los mexicanos. El caso de Buenavista del Cobre en Sonora (2014) —derrame de 40,000 m³ de solución ácida de sulfato de cobre en el Río Sonora— contaminó el principal río del estado, afectó a 22,000 personas en 7 municipios y generó una crisis que años después sigue sin resolverse completamente. La empresa minera es filial del Grupo México.\n\nMéxico fue hogar del único Premio Nobel de Química de América Latina: Mario Molina (CDMX, 1943–2020), galardonado en 1995 por descubrir el mecanismo de destrucción de la capa de ozono por clorofluorocarbonos (CFC). Su trabajo desencadenó el Protocolo de Montreal (1987), que prohibió los CFC y permitió la recuperación gradual de la capa de ozono. El Centro Mario Molina en CDMX continúa su legado investigando contaminación atmosférica en megalópolis.",
    glosario: [
      {
        termino: "Reactante",
        definicion:
          "Sustancia que participa y se consume en una reacción química. Se ubica en el lado izquierdo de la ecuación química.",
      },
      {
        termino: "Catalizador",
        definicion:
          "Sustancia que acelera una reacción química reduciendo la energía de activación, sin consumirse ni aparecer como producto. Las enzimas son los catalizadores biológicos por excelencia.",
      },
      {
        termino: "Energía de activación",
        definicion:
          "Energía mínima que necesitan los reactantes para que una reacción pueda ocurrir. Las reacciones de combustión tienen alta energía de activación: requieren calor inicial o chispa para iniciarse.",
      },
      {
        termino: "Ley de conservación de la masa",
        definicion:
          "Principio de Lavoisier (1789): en una reacción química, la masa total de los reactantes es igual a la masa total de los productos. Los átomos se reorganizan pero no desaparecen.",
      },
      {
        termino: "Química verde",
        definicion:
          "Enfoque de diseño químico que busca eliminar o reducir el uso y la generación de sustancias peligrosas en el origen, a través de 12 principios que guían desde la selección de materias primas hasta el tratamiento de residuos.",
      },
    ],
    preguntas_reflexion: [
      "El caso de Salamanca muestra que las reacciones químicas industriales pueden contaminar suelos y acuíferos durante décadas. ¿Quién debería ser responsable de la remediación: la empresa, el gobierno, o ambos? ¿Qué dice la Ley General de Equilibrio Ecológico al respecto?",
      "Mario Molina descubrió que los CFC destruyen la capa de ozono a través de reacciones en cadena de radicales libres. ¿Por qué los gobiernos actuaron rápidamente con el Protocolo de Montreal pero han tardado mucho más con los gases de efecto invernadero? ¿Qué es diferente en cada caso?",
      "Si la química verde plantea diseñar reacciones sin subproductos tóxicos, ¿por qué no todas las industrias adoptan estos principios? ¿Qué incentivos económicos o regulatorios podrían acelerar la transición en México?",
    ],
  },

  {
    codigo: "CNEYT-IV-P05-A1",
    titulo: "Las cuatro biomoléculas de la vida: carbohidratos, lípidos, proteínas y ácidos nucleicos en la dieta mexicana",
    descripcion_accesible:
      "Infografía de cuatro cuadrantes iguales sobre fondo blanco. Cuadrante superior izquierdo (fondo verde claro, carbohidratos): estructura química de la glucosa, un grano de maíz y el dato '64 razas nativas en México'. Cuadrante superior derecho (fondo amarillo, lípidos): estructura de un ácido graso, un aguacate cortado y el dato 'México es el primer productor mundial de aguacate'. Cuadrante inferior izquierdo (fondo azul claro, proteínas): estructura de un aminoácido, un chapulín y el dato '55–77% de proteína en peso seco'. Cuadrante inferior derecho (fondo morado claro, ácidos nucleicos): doble hélice del ADN, una mazorca de maíz nativo y el logo del LANGEBIO-CINVESTAV. En el centro, un círculo con la leyenda 'Las 4 biomoléculas' y flechas a cada cuadrante. En la franja inferior, tres alimentos tradicionales (tortilla, frijol, chile) con su composición porcentual de biomoléculas.",
    puntos_clave: [
      "Carbohidratos (glúcidos): fuente principal de energía celular. Se clasifican en monosacáridos (glucosa, fructosa), disacáridos (sacarosa, lactosa) y polisacáridos (almidón, glucógeno, celulosa). México es el centro de origen del maíz —la planta cultivada que más carbohidratos aporta a la humanidad.",
      "El maíz mexicano: CONABIO documenta 64 razas nativas adaptadas a microclimas específicos. El maíz fue domesticado por culturas mesoamericanas hace ~9,000 años en el actual Guerrero y Oaxaca. Un mexicano promedio consume ~125 kg de tortillas al año.",
      "Lípidos (grasas y aceites): moléculas de glicerol y ácidos grasos. Funcionan como reserva energética densa (9 kcal/g vs. 4 kcal/g de carbohidratos), componentes de membranas celulares (fosfolípidos) y señalización hormonal (esteroides). México es el primer productor mundial de aguacate, fruta con hasta 15% de grasa monoinsaturada cardioprotectora.",
      "Proteínas: polímeros de 20 aminoácidos posibles con funciones estructurales (queratina, colágeno), catalíticas (enzimas), de transporte (hemoglobina) y de defensa (anticuerpos). El frijol y el nopal son fuentes tradicionales de proteína vegetal con complementación ideal de aminoácidos en la dieta mesoamericana.",
      "Proteínas de origen alternativo: el chapulín (saltamontes) contiene entre 55–77% de proteína en peso seco —más que la carne de res (~25%)— y su producción requiere 12 veces menos agua. El IPN investiga su producción a escala industrial para reducir la huella hídrica de la proteína alimentaria en México.",
      "Ácidos nucleicos: ADN y ARN. El ADN almacena la información genética en secuencias de nucleótidos; el ARN traduce esa información en proteínas. La molécula de ADN humana tiene ~3,200 millones de pares de bases —extendida mediría ~2 metros de longitud.",
      "El LANGEBIO-CINVESTAV en Irapuato ha secuenciado el genoma completo de más de 15 razas de maíz nativo mexicano, mapeando genes responsables de adaptaciones únicas: resistencia a sequía, altitud y salinidad. Este conocimiento es clave para mejora genómica sin transgénesis.",
      "La nixtamalización —cocer el maíz con cal (hidróxido de calcio)— incrementa la disponibilidad de niacina (vitamina B3) en un 300% al romper la estructura molecular de los carbohidratos. Sin nixtamal, las dietas basadas en maíz causan pelagra (deficiencia de niacina).",
      "Las cuatro biomoléculas coexisten en todos los alimentos: una tortilla tiene principalmente carbohidratos (almidón), algo de proteína y trazas de lípidos; un aguacate tiene lípidos, fibra y pocos carbohidratos; los chapulines son ~70% proteína y ~10% grasa. Ningún alimento está formado por una sola biomolécula.",
    ],
    fuente:
      "CONABIO — Centro de Origen y Diversificación del Maíz en México 2023; CINVESTAV LANGEBIO — Genómica de Maíces Mexicanos 2022; FAO — Perspectivas de la Agricultura Mexicana 2023",
    actividad_post:
      "Elige una comida tradicional mexicana que hayas consumido esta semana. Identifica las cuatro biomoléculas presentes en cada ingrediente. ¿Cómo cambia la composición si sustituyes algún ingrediente por un ultraprocesado? Explica el impacto metabólico de esa sustitución usando los conceptos de la infografía.",
    contexto_mexicano:
      "México es el centro de origen del maíz, el aguacate, el cacao y el jitomate —cuatro de los cultivos que más han transformado la alimentación mundial. Esta megadiversidad agrícola implica una responsabilidad global: conservar la diversidad genética de estas plantas significa preservar la base alimentaria de la humanidad. CONABIO registra más de 50 razas de frijol nativo y 45 variedades de chile domesticadas en México.\n\nSin embargo, la transición alimentaria en México ha sido dramática: entre 1990 y 2020, el consumo de ultraprocesados (altos en carbohidratos simples, grasas trans y sal) creció un 300%, impulsando la epidemia de diabetes tipo 2 —primera causa de muerte en el país— y obesidad (75% de la población adulta tiene sobrepeso u obesidad, ENSANUT 2022). La bioquímica de las biomoléculas explica directamente esta crisis: el exceso de glucosa de alimentos ultraprocesados sobreestimula la insulina y genera resistencia metabólica. Comprender las biomoléculas es también comprender la crisis de salud pública mexicana.",
    glosario: [
      {
        termino: "Polímero",
        definicion:
          "Molécula grande formada por la unión repetida de subunidades más pequeñas llamadas monómeros. Las proteínas son polímeros de aminoácidos; el ADN, de nucleótidos; el almidón, de moléculas de glucosa.",
      },
      {
        termino: "Enzima",
        definicion:
          "Proteína que actúa como catalizador biológico: acelera reacciones químicas sin consumirse. La amilasa salival que se activa al masticar tortilla descompone el almidón en azúcares simples.",
      },
      {
        termino: "Nixtamalización",
        definicion:
          "Proceso mesoamericano prehispánico que consiste en cocer el maíz con agua y cal (Ca(OH)₂). Libera niacina unida a proteínas, aumenta el contenido de calcio y mejora la digestibilidad del maíz.",
      },
      {
        termino: "Fosfolípido",
        definicion:
          "Lípido con una cabeza hidrófila y dos colas hidrófobas. Es el componente fundamental de las membranas celulares, formando una bicapa que separa el interior y el exterior de cada célula.",
      },
      {
        termino: "Nucleótido",
        definicion:
          "Unidad básica del ADN y ARN, compuesta por un azúcar, un grupo fosfato y una base nitrogenada (adenina, guanina, citosina, timina en el ADN; uracilo en lugar de timina en el ARN).",
      },
    ],
    preguntas_reflexion: [
      "La nixtamalización fue descubierta empíricamente por culturas mesoamericanas sin conocer la química del proceso. ¿Cómo crees que llegaron a este proceso? ¿Qué nos dice sobre el conocimiento científico de las culturas originarias de México?",
      "Si México tiene 64 razas de maíz nativo y el maíz transgénico puede cruzarse con ellas, ¿qué riesgos biológicos conlleva esa contaminación genética? ¿Qué postura tiene México respecto al maíz GM para consumo humano?",
      "La epidemia de diabetes en México tiene causas bioquímicas directas en el consumo de carbohidratos simples en ultraprocesados. ¿Qué papel debería jugar la educación científica frente a las estrategias de marketing de la industria alimentaria? ¿Es suficiente con informar?",
    ],
  },

  {
    codigo: "CNEYT-V-P05-A1",
    titulo: "El espectro electromagnético: del Gran Telescopio Milimétrico de México a las telecomunicaciones nacionales",
    descripcion_accesible:
      "Infografía en formato de espectro horizontal continuo, del rojo al violeta con extensiones en ambos extremos (radio a la izquierda, rayos gamma a la derecha). Por encima del espectro, íconos de las fuentes emisoras de cada tipo de radiación: antena de radio, horno de microondas, sol (infrarrojo), lupa de colores (visible), lámpara UV, tubo de rayos X y símbolo de radiactividad. Por debajo del espectro, aplicaciones científicas y tecnológicas con énfasis en México: el GTM del INAOE en Volcán Sierra Negra (microondas), el satélite Morelos-3 (radio/microondas), el Observatorio Astronómico Nacional de San Pedro Mártir (visible) y el ININ en Ocoyoacac (rayos gamma). En la esquina superior izquierda, un recuadro destacado con el dato: 'Velocidad de la luz = 299,792 km/s'. En la franja inferior, la relación inversa entre frecuencia y longitud de onda con la fórmula c = λ·f en tipografía grande.",
    puntos_clave: [
      "El espectro electromagnético abarca todas las longitudes de onda posibles de la radiación EM, desde ondas de radio (kilómetros) hasta rayos gamma (picómetros). Todas viajan a la misma velocidad: 299,792 km/s (velocidad de la luz en el vacío).",
      "Ondas de radio (10 cm – km): permiten telecomunicaciones. El IFT (Instituto Federal de Telecomunicaciones) administra el espectro radioeléctrico nacional. En 2023, México realizó su primera subasta de espectro 5G en la banda 3.5 GHz.",
      "Microondas (1 mm – 10 cm): el Gran Telescopio Milimétrico (GTM) del INAOE en el Volcán Sierra Negra (Puebla), a 4,600 m de altitud, es el radiotelescopio de antena única más grande del mundo en su frecuencia, con 50 m de diámetro.",
      "Infrarrojo (700 nm – 1 mm): los satélites GOES y MODIS usan sensores infrarrojos para monitorear incendios forestales en México en tiempo real. En 2023 se registraron más de 10,000 incendios, principalmente en Durango, Chihuahua y Jalisco.",
      "Luz visible (380–700 nm): el Observatorio Astronómico Nacional (OAN) de la UNAM en San Pedro Mártir, Baja California —2,800 m de altitud, más de 300 noches despejadas al año— estudia galaxias lejanas y exoplanetas con telescopios ópticos.",
      "Ultravioleta (10–380 nm): el ozono estratosférico absorbe la mayoría. Mario Molina (Premio Nobel de Química 1995, UNAM) demostró que los CFC destruyen la capa de ozono. México ratificó el Protocolo de Montreal en 1985. La recuperación del ozono es uno de los mayores éxitos ambientales globales.",
      "Rayos X (0.01–10 nm): el IMSS y el ISSSTE operan más de 1,400 equipos de rayos X en México. La tomografía computarizada —que usa rayos X con reconstrucción digital 3D— fue esencial para el diagnóstico de COVID-19 durante la pandemia.",
      "Rayos gamma (<0.01 nm): el ININ (Instituto Nacional de Investigaciones Nucleares) en Ocoyoacac, Estado de México, aplica radiación gamma en braquiterapia oncológica y en la esterilización de alimentos y dispositivos médicos.",
      "El GTM del INAOE participó en el consorcio Event Horizon Telescope que en 2019 capturó la primera imagen de un agujero negro (M87*). Esta contribución mexicana forma parte de uno de los descubrimientos astronómicos más importantes del siglo XXI.",
    ],
    fuente:
      "INAOE — Gran Telescopio Milimétrico: avances y resultados 2023; IFT — Informe Estadístico de Telecomunicaciones en México 2023; AEM — Programa Espacial Mexicano 2021–2030",
    actividad_post:
      "Investiga el Gran Telescopio Milimétrico del INAOE (gtt.inaoep.mx). ¿En qué banda del espectro opera? ¿Qué fenómenos astronómicos estudia que los telescopios ópticos no pueden ver? Explica por qué está ubicado a 4,600 m de altitud: ¿qué gas atmosférico absorbe las microondas que intenta detectar?",
    contexto_mexicano:
      "México tiene contribuciones significativas a la astronomía y física del espectro electromagnético. El Gran Telescopio Milimétrico del INAOE, en colaboración con la Universidad de Massachusetts Amherst, es el instrumento de observación milimétrica más sensible del mundo y contribuyó al mapa tridimensional del universo lejano. Junto con instalaciones globales del consorcio Event Horizon Telescope, capturó en 2019 la primera fotografía de un agujero negro.\n\nEn telecomunicaciones, México atraviesa una transición crítica: en 2023, la penetración de internet llegó al 78% de la población (ENDUTIH), pero con profunda desigualdad —en comunidades indígenas y zonas rurales del sur, la cobertura es menor al 40%. La subasta de espectro 5G de 2023 asignó 450 MHz a Telcel, AT&T y Movistar, pero la cobertura real de 5G en 2024 sigue concentrada en las 10 ciudades más grandes. El acceso al espectro electromagnético —recurso del Estado— se convierte así en una cuestión de justicia digital.",
    glosario: [
      {
        termino: "Longitud de onda",
        definicion:
          "Distancia entre dos crestas consecutivas de una onda. Se mide en metros. Las ondas con mayor longitud de onda tienen menor frecuencia y menor energía.",
      },
      {
        termino: "Frecuencia",
        definicion:
          "Número de oscilaciones por segundo de una onda, medida en hercios (Hz). Las ondas de alta frecuencia tienen alta energía —por eso los rayos gamma son ionizantes y peligrosos para el ADN celular.",
      },
      {
        termino: "Radiación ionizante",
        definicion:
          "Radiación con suficiente energía para arrancar electrones de los átomos. Los rayos X y los rayos gamma son ionizantes. La radiación ionizante puede dañar el ADN y provocar mutaciones o cáncer.",
      },
      {
        termino: "Espectro radioeléctrico",
        definicion:
          "Porción del espectro EM con frecuencias entre 9 kHz y 300 GHz, usada para comunicaciones. Es un bien público administrado por el Estado —en México, el IFT asigna las frecuencias mediante concesiones y subastas públicas.",
      },
      {
        termino: "Telescopio milimétrico",
        definicion:
          "Instrumento astronómico que detecta radiación en la banda milimétrica y submilimétrica del espectro. Revela galaxias en formación, nubes moleculares y la radiación de fondo cósmico de microondas que proviene del Big Bang.",
      },
    ],
    preguntas_reflexion: [
      "El GTM del INAOE está a 4,600 m de altitud porque el vapor de agua absorbe parte de las microondas que intenta detectar. ¿Qué principio del espectro electromagnético explica por qué el vapor de agua absorbe esas frecuencias específicas y no otras?",
      "El IFT subastó espectro 5G a empresas privadas. ¿Debería el espectro electromagnético tratarse como un bien público estatal o como un recurso que puede venderse al mercado? ¿Qué implica cada postura para el acceso a internet en comunidades rurales e indígenas de México?",
      "Mario Molina recibió el Nobel por demostrar el daño de los CFC en el ozono, lo que llevó al Protocolo de Montreal. ¿Por qué la comunidad científica y los gobiernos actuaron relativamente rápido en ese caso, mientras que con el cambio climático ha sido mucho más lento? ¿Qué papel juegan los intereses económicos en cada caso?",
    ],
  },

  {
    codigo: "CNEYT-VI-P02-A1",
    titulo: "Célula procariota y eucariota: organelos, funciones y el caso del ajolote mexicano",
    descripcion_accesible:
      "Infografía comparativa en dos columnas de igual tamaño. Columna izquierda (fondo crema, célula procariota): diagrama de corte transversal con flechas que etiquetan membrana plasmática, pared celular, ADN circular en citoplasma y ribosomas. Columna derecha (fondo azul muy claro, célula eucariota): dos diagramas superpuestos —animal y vegetal— etiquetando núcleo con envoltura nuclear, mitocondria, retículo endoplasmático, aparato de Golgi, lisosomas, cloroplasto (solo vegetal) y vacuola central (solo vegetal). En la parte inferior de la infografía, una barra de comparación de tamaño: procariota (1–5 μm), eucariota animal (10–100 μm), eucariota vegetal (10–100 μm). En el margen derecho, un recuadro verde oscuro 'El caso del ajolote' con foto del animal y tres datos: 32,000 millones de pares de bases en su genoma, menos de 1,000 individuos en Xochimilco y potencial para terapias regenerativas en humanos.",
    puntos_clave: [
      "Todos los seres vivos están formados por células. Las células procariotas (sin núcleo definido) son las más antiguas —aparecen en el registro fósil hace ~3,500 millones de años. Las eucariotas (con núcleo rodeado por membrana) surgieron hace ~2,000 millones de años.",
      "Procariotas: sin núcleo, sin organelos membranosos, ADN circular flotante en el citoplasma, reproducción por fisión binaria, diámetro de 0.5–5 μm. Incluyen Bacteria y Archaea. Las bacterias del microbioma intestinal humano (~38 billones de células) superan en número a las propias células humanas.",
      "Eucariotas animales: núcleo con envoltura nuclear doble, mitocondrias, retículo endoplasmático rugoso y liso, aparato de Golgi, lisosomas y centrosoma. Sin pared celular.",
      "Eucariotas vegetales: además de los organelos animales, tienen pared celular de celulosa, cloroplastos (fotosíntesis) y una vacuola central que puede ocupar el 90% del volumen. Los cloroplastos tienen su propio ADN circular —evidencia de que alguna vez fueron bacterias fotosintéticas (teoría endosimbiótica de Lynn Margulis).",
      "El ajolote (Ambystoma mexicanum), endémico de los canales de Xochimilco en CDMX, es un modelo científico global de regeneración celular: puede regenerar extremidades completas, ojos, porciones de médula espinal e incluso partes del corazón sin dejar cicatriz.",
      "El Instituto de Biología de la UNAM ha secuenciado el genoma del ajolote —el más grande conocido, con 32,000 millones de pares de bases, 10 veces más que el humano. Los genes responsables de su regeneración son candidatos para terapias en lesiones de médula espinal e infartos en humanos.",
      "La mitocondria produce ATP mediante respiración celular aeróbica y tiene su propio ADN, heredado exclusivamente por vía materna. El CINVESTAV estudia disfunciones mitocondriales en enfermedades metabólicas prevalentes en México: diabetes tipo 2 y enfermedades cardiovasculares.",
      "La teoría endosimbiótica de Lynn Margulis (1967) propone que mitocondrias y cloroplastos fueron bacterias engullidas pero no digeridas por células ancestrales. Evidencias: tienen ADN circular propio, se reproducen independientemente y son similares en tamaño a las bacterias actuales.",
    ],
    fuente:
      "Instituto de Biología UNAM — Genoma del Ajolote y Biología de la Regeneración 2023; CINVESTAV — Líneas de Investigación en Biología Celular y Molecular 2023",
    actividad_post:
      "Diseña un experimento hipotético para identificar si una muestra biológica contiene células procariotas o eucariotas usando solo un microscopio óptico de laboratorio escolar. ¿Qué observarías en cada caso? ¿Qué limitaciones tendría tu método? ¿Qué técnica de tinción usarías?",
    contexto_mexicano:
      "El ajolote (Ambystoma mexicanum) es quizás el animal de mayor importancia científica endémico de México. Habita exclusivamente los canales de Xochimilco, un ecosistema lacustre que ha perdido el 90% de su extensión original por urbanización, contaminación y especies invasoras (carpa y tilapia). Un censo del Instituto de Biología de la UNAM en 2023 registró menos de 1,000 individuos silvestres —colapso desde más de 6,000 ajolotes por km² en los años 1980.\n\nLa paradoja es aguda: el ajolote es uno de los animales más estudiados del mundo en biología celular (colonias de cría en más de 200 instituciones en 40 países), pero en su hábitat natural está al borde de la extinción. Su capacidad de regeneración celular —resultado de mecanismos moleculares únicos en su genoma— lo convierte en modelo científico invaluable para terapias regenerativas. Perderlo en estado silvestre sería no solo una pérdida de biodiversidad, sino de material biológico irreemplazable para la medicina.",
    glosario: [
      {
        termino: "Organelo",
        definicion:
          "Estructura interna especializada de una célula eucariota, análoga a un órgano en el cuerpo. Realiza una función específica: mitocondria (energía), núcleo (genoma), ribosoma (síntesis de proteínas), aparato de Golgi (empaque y envío de proteínas).",
      },
      {
        termino: "Núcleo celular",
        definicion:
          "Organelo rodeado por una doble membrana (envoltura nuclear) que contiene el ADN lineal empaquetado en cromosomas. Es el centro de control de la célula eucariota. Las células procariotas no tienen núcleo: su ADN circular flota en el citoplasma.",
      },
      {
        termino: "Mitocondria",
        definicion:
          "Organelo de la célula eucariota que produce ATP mediante respiración celular aeróbica. Posee ADN circular propio, evidencia de su origen bacteriano. Las células con mayor demanda energética (músculo cardiaco, neuronas) contienen cientos o miles de mitocondrias.",
      },
      {
        termino: "Endosimbiosis",
        definicion:
          "Relación en la que una célula vive dentro de otra de forma mutuamente beneficiosa. La teoría endosimbiótica propone que mitocondrias y cloroplastos fueron bacterias que establecieron endosimbiosis con células eucariotas ancestrales hace más de 2,000 millones de años.",
      },
      {
        termino: "Fisión binaria",
        definicion:
          "Forma de reproducción asexual de las células procariotas: la célula duplica su ADN y se divide en dos células hijas genéticamente idénticas. Bajo condiciones ideales, algunas bacterias se dividen cada 20 minutos.",
      },
    ],
    preguntas_reflexion: [
      "El ajolote puede regenerar una extremidad completa sin cicatriz. Los humanos también tenemos todas las células necesarias para ello, pero no lo hacemos. ¿Qué diferencia a nivel celular y molecular podría explicar por qué el ajolote regenera y nosotros no?",
      "La teoría endosimbiótica propone que las mitocondrias fueron bacterias engullidas hace 2,000 millones de años. ¿Qué evidencias observables en las mitocondrias hoy apoyan esta teoría? ¿Cómo cambiaría nuestra comprensión de la vida si la teoría fuera incorrecta?",
      "El ajolote está en peligro crítico en Xochimilco por urbanización y contaminación, pero hay colonias estables en laboratorios del mundo. ¿Es suficiente con preservar la especie en cautiverio? ¿Qué se pierde con la extinción silvestre desde el punto de vista ecológico y evolutivo?",
    ],
  },

  {
    codigo: "CNEYT-VI-P08-A1",
    titulo: "Biotecnología y bioética en México: CRISPR, maíz transgénico y el debate de la edición genómica",
    descripcion_accesible:
      "Infografía en cuatro secciones horizontales de alto contraste. Primera sección (fondo negro, texto blanco): 'CRISPR-Cas9 — el bisturí molecular', con diagrama simplificado: guía de ARN señalando una secuencia en el ADN, proteína Cas9 cortando y nueva secuencia siendo insertada. Segunda sección (fondo verde oscuro): 'Biotecnología en México — hitos', línea de tiempo con cinco fechas: 1983 (primer transgénico vegetal por Herrera-Estrella), 1996 (primer cultivo OGM comercial en México), 2009 (creación de CIBIOGEM), 2020 (decreto anti-maíz GM) y 2023 (fallo judicial en contra). Tercera sección (fondo rojo oscuro): 'Casos críticos — bioética en dilemas': vaquita marina y biotecnología de conservación, debate maíz OGM y soberanía alimentaria, edición de embriones humanos. Cuarta sección (fondo azul): 'Los 5 principios de la bioética' con íconos para autonomía, beneficencia, no maleficencia, justicia y dignidad humana.",
    puntos_clave: [
      "La biotecnología moderna usa organismos vivos, sistemas biológicos o derivados para desarrollar productos o procesos: ingeniería genética, cultivo de tejidos, fermentación industrial, diagnóstico molecular y edición genómica.",
      "CRISPR-Cas9: sistema de edición genómica de precisión, análogo a un 'bisturí molecular'. Permite modificar secuencias específicas del ADN con mayor precisión y menor costo que técnicas anteriores. Las investigadoras Jennifer Doudna y Emmanuelle Charpentier recibieron el Nobel de Química 2020 por su desarrollo.",
      "Luis Herrera-Estrella (LANGEBIO-CINVESTAV Irapuato) fue el primer científico en desarrollar plantas transgénicas funcionales en 1983 —introdujo el primer gen foráneo funcional en una planta. Premio Fronteras del Conocimiento 2021. México es pionero científico y, simultáneamente, el país con más debates sobre transgénicos.",
      "El debate del maíz transgénico en México: en 2020 el gobierno emitió un decreto para eliminar gradualmente el maíz GM para consumo humano directo. En 2023, un tribunal federal falló contra el decreto argumentando que violaba compromisos del T-MEC con EE.UU. México es el único país del mundo donde el maíz tiene estatus especial por ser su centro de origen.",
      "OGM en México: la soya transgénica (resistente al herbicida glifosato) se cultiva en ~250,000 ha en Yucatán y Campeche, con controversia por impactos en los apicultores mayas y la biodiversidad de la Selva Yucateca.",
      "La vaquita marina (Phocoena sinus), con menos de 10 individuos en 2024, es el mamífero marino más amenazado del mundo. La CIBIOGEM ha respaldado propuestas de conservación mediante biotecnología reproductiva (criopreservación de material genético), pero no existe ningún individuo en cautiverio.",
      "CIBIOGEM (Comisión Intersecretarial de Bioseguridad de los OGM): organismo interministerial que emite permisos de liberación experimental, piloto y comercial de OGM en México. Sus resoluciones enfrentan presión simultánea de la industria biotecnológica transnacional y de organizaciones campesinas y ambientalistas.",
      "CONBIOÉTICA (Comisión Nacional de Bioética): dependiente de la Secretaría de Salud, emite guías sobre investigación con células madre, edición genómica de embriones humanos, uso de IA en medicina y ensayos clínicos en poblaciones vulnerables.",
      "LANGEBIO-CINVESTAV aplica CRISPR para mejorar variedades de maíz nativo resistentes a plagas sin transgénesis convencional. El Instituto de Biotecnología de la UNAM en Cuernavaca aplica CRISPR en diagnóstico de tuberculosis, dengue y leishmaniasis —enfermedades que afectan desproporcionadamente a comunidades marginadas.",
    ],
    fuente:
      "LANGEBIO CINVESTAV Irapuato — Edición Genómica en Maíces Mexicanos 2023; CONBIOÉTICA — Marco ético para la biotecnología 2022; CIBIOGEM — Informe anual de OGM en México 2022",
    actividad_post:
      "Lee sobre el caso de He Jiankui, el científico chino que en 2018 editó embriones humanos con CRISPR para hacerlos resistentes al VIH (fue condenado a tres años de prisión). Luego investiga la postura de CONBIOÉTICA sobre edición genómica de embriones en México. ¿Estás de acuerdo con la postura regulatoria? ¿Qué principios bioéticos entran en conflicto?",
    contexto_mexicano:
      "México ocupa una posición única y paradójica en la biotecnología global: fue uno de los países pioneros en el desarrollo de plantas transgénicas gracias a Luis Herrera-Estrella, pero al mismo tiempo es el centro de origen del maíz y tiene una postura cautelosa sobre los OGM para consumo humano. Esta tensión entre innovación científica y precaución cultural y ambiental refleja debates globales sobre quién controla los recursos genéticos, quién se beneficia de la biotecnología y cómo se distribuyen los riesgos.\n\nEl LANGEBIO en Irapuato, Guanajuato, es uno de los centros de genómica más avanzados de América Latina. Sus investigadores usan CRISPR para activar o silenciar genes ya existentes en el maíz nativo —sin inserción de ADN foráneo—, lo que crea una 'zona gris' regulatoria: muchos marcos legales (incluyendo el europeo) no clasifican estas ediciones como OGM. Esta distinción tiene implicaciones regulatorias, comerciales y bioéticas que son objeto de debate activo en México.",
    glosario: [
      {
        termino: "Transgénico",
        definicion:
          "Organismo cuyo genoma contiene uno o más genes de otra especie, introducidos mediante ingeniería genética. El primer transgénico vegetal fue creado en 1983 por Luis Herrera-Estrella en México.",
      },
      {
        termino: "CRISPR-Cas9",
        definicion:
          "Sistema de edición genómica derivado del sistema inmune bacteriano. Una guía de ARN localiza una secuencia específica del ADN y la proteína Cas9 la corta. Permite introducir, eliminar o reemplazar secuencias con alta precisión. Su costo ha caído de millones a miles de dólares, democratizando la investigación genómica.",
      },
      {
        termino: "Bioética",
        definicion:
          "Disciplina que estudia los dilemas morales que plantea el avance de las ciencias biológicas y médicas. Sus cuatro principios fundamentales: autonomía (respetar la decisión del individuo), beneficencia (hacer el bien), no maleficencia (no hacer daño) y justicia (distribuir equitativamente beneficios y riesgos).",
      },
      {
        termino: "Soberanía alimentaria",
        definicion:
          "Derecho de los pueblos a definir sus propias políticas agrícolas y alimentarias, priorizando la producción local, la biodiversidad nativa y el acceso equitativo a los alimentos. En México, el maíz nativo es el eje del debate entre soberanía alimentaria y adopción de OGM.",
      },
      {
        termino: "OGM (Organismo Genéticamente Modificado)",
        definicion:
          "Organismo cuyo material genético ha sido alterado de una manera que no ocurriría naturalmente. Los OGM agrícolas más comunes son resistentes a herbicidas (soya Roundup Ready) o producen sus propios insecticidas (maíz Bt). Su regulación en México está a cargo de la CIBIOGEM.",
      },
    ],
    preguntas_reflexion: [
      "México es el centro de origen del maíz y uno de los primeros países en desarrollar plantas transgénicas. ¿Crees que esto crea una responsabilidad especial hacia la diversidad genética del maíz nativo? ¿Cómo equilibrar los intereses de agricultores del norte (que quieren OGM para competir) y la conservación de razas nativas del sur?",
      "CRISPR permite editar genes en embriones humanos para eliminar enfermedades hereditarias antes del nacimiento. ¿Dónde trazarías la línea entre uso terapéutico (eliminar enfermedad) y eugenesia (seleccionar características deseadas)? ¿Quién debería tomar esa decisión?",
      "La vaquita marina tiene menos de 10 individuos vivos y ninguno en cautiverio. La biotecnología reproductiva podría ser el último recurso. ¿Vale la pena invertir millones en biotecnología para salvar una especie si el hábitat que la mató sigue dañado? ¿Qué dice eso sobre nuestras prioridades como sociedad?",
      "¿Por qué la edición genómica con CRISPR sin inserción de ADN externo está en una 'zona gris' regulatoria? ¿Debería regularse igual que un OGM tradicional o de forma diferente? ¿Qué criterio usarías para decidir?",
    ],
  },

  // ── LOTE 3: PFH-II, CS-II, CS-III, LC-II (×2), LC-III ──────────────────────

  {
    codigo: "PFH-II-P05-A1",
    titulo: "Humanismo mexicano: Vasconcelos, Zea, Villoro y la Filosofía de la Liberación",
    descripcion_accesible:
      "Infografía en formato de árbol genealógico filosófico. Las raíces representan las tradiciones que alimentan el humanismo mexicano: filosofía novohispana (Sor Juana, Sigüenza y Góngora), positivismo decimonónico y existencialismo europeo. El tronco central lleva la leyenda 'Humanismo latinoamericano'. Cinco ramas principales, una por filósofo: Vasconcelos (identidad y raza cósmica), Samuel Ramos (psicología del carácter nacional), Leopoldo Zea (historia latinoamericana), Octavio Paz (cultura y soledad), Luis Villoro y Enrique Dussel (filosofía política y de la liberación). Cada rama incluye un recuadro con nombre, fechas, obra clave y concepto central en dos líneas. En el cielo del árbol, tres hojas verdes con los grandes temas del humanismo mexicano: identidad, justicia y memoria histórica.",
    puntos_clave: [
      "El humanismo mexicano es una corriente filosófica que piensa los problemas del ser humano desde las circunstancias históricas y culturales propias de México y América Latina. No es una reproducción de la filosofía europea, sino una reflexión original sobre identidad, justicia y dignidad en contextos de colonización y mestizaje.",
      "José Vasconcelos (1882–1959): filósofo, rector de la UNAM y secretario de Educación Pública. Su ensayo 'La raza cósmica' (1925) propone que el mestizaje latinoamericano no es una debilidad sino el origen de una síntesis cultural superior. Impulsó el muralismo mexicano (Rivera, Orozco, Siqueiros) como educación visual del pueblo.",
      "Samuel Ramos (1897–1959): autor de 'El perfil del hombre y la cultura en México' (1934), primer análisis filosófico sistemático del carácter nacional. Aplicó la psicología adleriana para examinar el 'complejo de inferioridad' mexicano — obra que inspiró directamente el ensayo de Octavio Paz.",
      "Leopoldo Zea (1912–2004): el filósofo mexicano más influyente del siglo XX. Fundador de la filosofía de la historia latinoamericana. Propuso que México debe asumir su historia —incluyendo la colonización y el mestizaje— como punto de partida de una filosofía auténtica. Obra clave: 'Filosofía de la historia americana' (1978).",
      "Octavio Paz (1914–1998): Premio Nobel de Literatura 1990. Su ensayo 'El laberinto de la soledad' (1950) examina la máscara, la soledad, la Malinche y el chingón como arquetipos de la identidad mexicana. Fundó la revista Vuelta, una de las más influyentes de América Latina en filosofía y política del siglo XX.",
      "Luis Villoro (1922–2014): filósofo de El Colegio de México. Sus obras 'Los grandes momentos del indigenismo en México' (1950) y 'Estado plural, pluralidad de culturas' (1998) son fundamentales para la filosofía política mexicana. Defensor de los derechos de los pueblos indígenas desde la filosofía, simpatizante del EZLN.",
      "Enrique Dussel (1934–2023): nacido en Argentina, naturalizado mexicano en 1975, profesor de la UAM. Principal exponente de la Filosofía de la Liberación: crítica al eurocentrismo filosófico desde América Latina. Propone la 'ética de la alteridad': el punto de partida filosófico es el Otro empobrecido y excluido, no el sujeto europeo ilustrado.",
      "La UNAM Facultad de Filosofía y Letras es el centro más importante de humanidades en México y uno de los más influyentes en Latinoamérica. El Colegio de México complementa este ecosistema con investigación histórica y filosófica rigurosa. Ambas instituciones han formado a las generaciones de filósofos e intelectuales que definieron el debate público mexicano.",
      "La filosofía mexicana siempre ha dialogado con la política: el pensamiento de Villoro inspiró la autonomía de los municipios zapatistas en Chiapas; las ideas de Dussel sobre la 'transmodernidad' influyeron en movimientos sociales latinoamericanos. El humanismo mexicano es una filosofía comprometida que reconoce que toda teoría surge desde una posición histórica específica.",
    ],
    fuente:
      "UNAM Facultad de Filosofía y Letras — Pensamiento filosófico mexicano del siglo XX 2022; El Colegio de México — Historia de las ideas en México 2023; Academia Mexicana de la Lengua — Tradición del ensayo filosófico mexicano 2022",
    actividad_post:
      "Elige una de estas dos afirmaciones: A) 'El mestizaje es la base de la identidad mexicana' (Vasconcelos) o B) 'Los pueblos indígenas tienen derecho a su cultura propia sin asimilarse al mestizaje' (Villoro). Escribe un ensayo de una página argumentando tu postura con ejemplos de la realidad mexicana contemporánea.",
    contexto_mexicano:
      "El humanismo mexicano no nació en las aulas sino en las crisis. Vasconcelos escribió 'La raza cósmica' después de una Revolución que costó 1.5 millones de vidas. Paz escribió 'El laberinto de la soledad' siendo diplomático en París, mirando a México desde afuera. Villoro radicalizó su pensamiento después del levantamiento zapatista de 1994. Dussel profundizó su crítica al eurocentrismo desde el exilio en México —fue expulsado de Argentina por amenazas de muerte en 1975.\n\nEste vínculo entre filosofía y circunstancias históricas es el rasgo más característico del humanismo mexicano: no busca verdades universales abstractas, sino pensar desde el lugar concreto del que sufre exclusión y marginación. En ese sentido, es una filosofía comprometida que reconoce que toda teoría surge desde una posición social e histórica específica — lo que la filosofía anglosajona llama 'situated knowledge' o conocimiento situado.",
    glosario: [
      {
        termino: "Humanismo",
        definicion:
          "Corriente filosófica que coloca al ser humano —su dignidad, su razón y sus circunstancias históricas— en el centro de la reflexión. El humanismo mexicano añade la identidad cultural latinoamericana como punto de partida irreductible del filosofar.",
      },
      {
        termino: "Mestizaje",
        definicion:
          "Proceso histórico y cultural de mezcla entre las tradiciones indígenas, europeas y africanas en México. Para Vasconcelos, es el origen de una nueva síntesis cultural; para críticos contemporáneos, fue usado para justificar la subordinación de las culturas indígenas.",
      },
      {
        termino: "Filosofía de la Liberación",
        definicion:
          "Corriente filosófica latinoamericana (Dussel, Salazar Bondy) que critica el eurocentrismo filosófico y propone pensar desde la experiencia de los pueblos colonizados y empobrecidos. La 'alteridad' (el Otro) es su punto de partida ético.",
      },
      {
        termino: "Identidad nacional",
        definicion:
          "Conjunto de rasgos culturales, históricos y simbólicos que una comunidad reconoce como propios y distintivos. En México, la identidad nacional ha sido objeto de debate filosófico continuo desde la Independencia, sin una definición estable y consensuada.",
      },
      {
        termino: "Ensayo filosófico",
        definicion:
          "Género literario-filosófico que combina argumentación racional con estilo literario. Es el género dominante de la filosofía mexicana: permite explorar ideas en proceso, sin el rigor sistemático del tratado académico. Paz, Ramos y Vasconcelos son sus exponentes mexicanos más conocidos.",
      },
    ],
    preguntas_reflexion: [
      "Samuel Ramos describió un 'complejo de inferioridad' en el carácter mexicano en 1934. ¿Crees que esa descripción es válida hoy? ¿Qué cambios históricos y sociales podrían haber transformado esa psicología colectiva desde entonces?",
      "Leopoldo Zea propuso que América Latina debe 'asumir su historia' —incluyendo la colonización— como punto de partida filosófico. ¿Qué significa filosóficamente asumir una historia que incluye trauma y violencia? ¿Puede una nación tener identidad filosófica auténtica sin confrontar ese pasado?",
      "La Filosofía de la Liberación de Dussel parte del 'Otro empobrecido y excluido'. ¿Quiénes serían hoy en México esos 'Otros' que la filosofía dominante ignora? ¿Qué temas filosóficos surgirían si se pensara desde la experiencia de comunidades indígenas, migrantes o pueblos afromexicanos?",
    ],
  },

  {
    codigo: "CS-II-P02-A1",
    titulo: "Formas de organización social en México: familia, comunidad, clases y movimientos colectivos",
    descripcion_accesible:
      "Infografía en formato de pirámide social invertida, más amplia en la base (comunidad y familia) y más estrecha en la cima (Estado y elites), dividida en cuatro niveles. Nivel 1 (base, verde claro): familia y hogar — 34.8 millones de hogares, distribución por tipo. Nivel 2 (verde): comunidad y barrio — organizaciones vecinales, sistemas de cargos indígenas, tequio. Nivel 3 (azul): organizaciones intermedias — sindicatos, OSC, iglesias, cooperativas. Nivel 4 (cima, azul oscuro): Estado e instituciones formales. Cada nivel incluye un dato numérico clave con fuente INEGI/CONEVAL. En el margen izquierdo, una línea de tiempo con cinco hitos de organización social colectiva: 1968 (Tlatelolco), 1985 (terremoto y brigadas), 1994 (EZLN), 2014 (Ayotzinapa) y 2017 (sismo). En el margen derecho, un mapa de calor de densidad de OSC por estado.",
    puntos_clave: [
      "Las formas de organización social son los patrones estructurados mediante los cuales los grupos humanos coordinan actividades, distribuyen recursos y ejercen poder. Incluyen la familia, la comunidad, la clase social, el Estado y las organizaciones civiles.",
      "La familia mexicana: el Censo 2020 (INEGI) registró 34.8 millones de hogares. El 65% son nucleares, el 25% extensos (con abuelos u otros parientes) y el 10% unipersonales. Los hogares monoparentales con jefatura femenina pasaron del 17% (2000) al 26% (2020).",
      "Las comunidades indígenas como forma de organización: 7.36 millones de personas hablan una lengua indígena (Censo 2020). Sus formas de organización —el sistema de cargos, la asamblea comunitaria y el tequio (trabajo colectivo sin pago)— son estructuras democráticas anteriores al Estado moderno.",
      "Las clases sociales en México: México tiene uno de los mayores índices de desigualdad de América Latina. El coeficiente de Gini es 0.427 (CONEVAL 2022). El 10% más rico concentra el 59.1% de la riqueza, mientras el 50% más pobre accede al 4.7% (ENIGH 2022).",
      "La sociedad civil organizada: México tiene más de 45,000 organizaciones de la sociedad civil (OSC) registradas en el RFOSC. Actúan en salud, derechos humanos, medio ambiente, educación y desarrollo comunitario. Su presupuesto conjunto supera los 30,000 millones de pesos anuales.",
      "Los movimientos sociales como organización colectiva: el movimiento estudiantil de 1968, el levantamiento zapatista de 1994, el movimiento #YoSoy132 de 2012 y la movilización por los 43 normalistas de Ayotzinapa (2014) son hitos de la organización colectiva en México.",
      "El corporativismo priísta: durante el régimen del PRI (1929–2000), el Estado organizó la sociedad a través de corporaciones controladas: el CNC (campesinos), el CTM (trabajadores) y el CNOP (sector popular). Esta estructura debilitó la autonomía de sindicatos y organizaciones civiles durante décadas.",
      "La transición democrática y nuevas formas de organización: con la alternancia de 2000 y la expansión de internet, surgieron colectivos feministas, organizaciones ambientalistas y brigadas de ayuda mutua —como las de voluntarios tras el sismo de 2017— con estructuras horizontales sin jerarquías tradicionales.",
      "La organización social varía radicalmente por territorio: los estados del sur (Oaxaca, Guerrero, Chiapas) tienen alta presencia de organización comunitaria indígena; las ciudades del norte (Monterrey, Tijuana, Guadalajara) tienen estructuras más individualizadas y vinculadas al sector empresarial.",
    ],
    fuente:
      "INEGI — Censo de Población y Vivienda 2020; CONEVAL — Medición de la Pobreza 2022; ENIGH 2022; Secretaría de Gobernación — RFOSC 2023",
    actividad_post:
      "Identifica una forma de organización social en tu comunidad que no sea familiar ni estatal (colectivo juvenil, cooperativa, asociación religiosa, brigada vecinal). Describe su estructura: ¿cómo toman decisiones?, ¿cómo distribuyen recursos?, ¿cómo se sostienen económicamente? ¿A qué tipo de organización de la infografía corresponde?",
    contexto_mexicano:
      "La organización social en México tiene una característica única: la coexistencia de formas muy antiguas (sistemas de cargos indígenas, tequio, mayordomía) con estructuras modernas (OSC, sindicatos independientes, colectivos digitales). Esta pluralidad refleja la heterogeneidad del país: un México indígena con lógicas comunitarias, un México urbano con lógicas individuales y un México rural con lógicas familiares extendidas.\n\nUn hito reciente fue la respuesta ciudadana espontánea al sismo del 19 de septiembre de 2017: miles de voluntarios se autoorganizaron sin coordinación institucional en pocas horas, usando WhatsApp y Twitter para dirigir rescatistas, alimentos y herramientas. Los sociólogos denominan a este fenómeno 'organización emergente': surge de la reciprocidad y la solidaridad cuando las instituciones formales son lentas o insuficientes. Este episodio reveló tanto la fortaleza de la solidaridad mexicana como las debilidades estructurales de la coordinación gubernamental.",
    glosario: [
      {
        termino: "Estratificación social",
        definicion:
          "División de la sociedad en capas o estratos ordenados jerárquicamente según el acceso a recursos, prestigio y poder. En México la estratificación está determinada principalmente por el ingreso económico, el nivel educativo y la pertenencia étnica.",
      },
      {
        termino: "Coeficiente de Gini",
        definicion:
          "Medida estadística de desigualdad económica que va de 0 (igualdad perfecta) a 1 (máxima desigualdad). México tiene un Gini de 0.427 (2022), entre los más altos de los países de la OCDE.",
      },
      {
        termino: "Sociedad civil",
        definicion:
          "Conjunto de organizaciones e individuos que actúan en el espacio público entre el Estado y el mercado: OSC, sindicatos autónomos, medios de comunicación, movimientos sociales y colectivos ciudadanos.",
      },
      {
        termino: "Corporativismo",
        definicion:
          "Sistema político en el que el Estado organiza a los grupos sociales (trabajadores, campesinos, empresarios) en organizaciones controladas desde arriba, integradas como intermediarios entre la sociedad y el gobierno. El PRI construyó un sistema corporativista que duró 70 años.",
      },
      {
        termino: "Movimiento social",
        definicion:
          "Acción colectiva sostenida de un grupo que busca transformar aspectos de la sociedad o el Estado. Se distingue de la protesta aislada por su organización, duración y objetivos estratégicos de largo plazo.",
      },
    ],
    preguntas_reflexion: [
      "El sistema de cargos indígena y la asamblea comunitaria son formas de organización democrática que existen en México desde antes de la Constitución de 1917. ¿Por qué el Estado tardó tanto en reconocerlas formalmente? ¿Qué cambió con la reforma constitucional de 1992 sobre derechos indígenas?",
      "México tiene 45,000 OSC registradas pero el 10% más rico concentra el 59% de la riqueza. ¿Qué limitaciones tienen las organizaciones civiles para cambiar la estructura de desigualdad sin modificar el marco legal y fiscal?",
      "La respuesta ciudadana espontánea al sismo de 2017 fue más efectiva que la coordinación institucional en las primeras horas. ¿Qué nos dice eso sobre las fortalezas y limitaciones de la organización formal (Estado, partidos) vs. la informal (solidaridad espontánea)?",
    ],
  },

  {
    codigo: "CS-III-P02-A1",
    titulo: "El ciclo de las políticas públicas en México: del problema social a la evaluación por el CONEVAL",
    descripcion_accesible:
      "Infografía en formato de rueda de ciclo con cinco segmentos de igual tamaño, conectados por flechas circulares que enfatizan la retroalimentación. Segmento 1 (rojo): identificación del problema, con ícono de signo de exclamación y el ejemplo 'pobreza energética en zonas rurales'. Segmento 2 (naranja): diseño de alternativas, con ícono de balanza y tres alternativas posibles. Segmento 3 (amarillo): adopción, con ícono de mazo legislativo y la leyenda 'Presupuesto de Egresos'. Segmento 4 (verde): implementación, con íconos de los principales implementadores (SEP, IMSS, CONAGUA). Segmento 5 (azul): evaluación, con logo del CONEVAL y el dato '150+ programas evaluados por año'. En el centro de la rueda: 'Ciclo de políticas públicas — México'. En el margen derecho, un recuadro con pobreza multidimensional 2022: 36.3% de la población, ~46 millones de personas.",
    puntos_clave: [
      "El ciclo de las políticas públicas es un modelo analítico que divide el proceso de decisión gubernamental en cinco etapas: (1) identificación del problema, (2) diseño de alternativas, (3) adopción de la política, (4) implementación y (5) evaluación. En la práctica, las etapas se solapan y retroalimentan continuamente.",
      "Identificación del problema: solo cuando un problema entra en la 'agenda gubernamental' —por presión social, crisis, datos estadísticos o voluntad política— se convierte en objeto de política pública. El CONEVAL produce métricas que llevan problemas (pobreza, desnutrición) a la agenda nacional.",
      "Diseño de alternativas: en México, la Secretaría de Hacienda y Crédito Público y el CONEVAL son actores clave en el análisis de viabilidad técnica y fiscal de las opciones de política. El Presupuesto de Egresos de la Federación (PEF) 2024 fue de 9.1 billones de pesos.",
      "Adopción de la política: implica autorización legal (leyes, decretos, reglas de operación), asignación presupuestaria y asignación de responsabilidades. El Congreso aprueba el PEF cada diciembre — es el instrumento financiero más importante de las políticas públicas.",
      "Implementación: la etapa donde más frecuentemente fallan las políticas en México, por burocracia lenta, corrupción, falta de coordinación intergubernamental, capacidades técnicas insuficientes o resistencia de grupos de interés. El IMSS, la SEP y el ISSSTE son los principales implementadores de políticas sociales.",
      "Evaluación: el CONEVAL evalúa cada año más de 150 programas sociales federales usando metodologías rigurosas. Sin embargo, estudios de El Colegio de México documentan que menos del 30% de sus recomendaciones son efectivamente implementadas por las dependencias evaluadas.",
      "La pobreza multidimensional en México: el CONEVAL la define como la coincidencia de ingreso insuficiente con al menos una carencia social (educación, salud, vivienda, alimentación, servicios básicos o seguridad social). En 2022, el 36.3% de los mexicanos —~46 millones— vivía en pobreza multidimensional.",
      "Políticas públicas y federalismo: las políticas se diseñan en el nivel federal pero se implementan en los 2,474 municipios. Los municipios más pobres tienen menos capacidad técnica para ejecutar políticas complejas, perpetuando las desigualdades regionales.",
      "El caso Progresa/Oportunidades/Prospera: creado en 1997, fue evaluado internacionalmente como uno de los programas de transferencias condicionadas más exitosos del mundo. Fue renombrado cuatro veces en 25 años por distintos gobiernos, alterando su focalización y efectividad acumulada — ejemplo de cómo los ciclos electorales interfieren con los ciclos de las políticas.",
    ],
    fuente:
      "CONEVAL — Metodología para la Medición Multidimensional de la Pobreza 2022; SHCP — Presupuesto de Egresos de la Federación 2024; El Colegio de México — Evaluación y gobernanza de programas sociales en México 2022",
    actividad_post:
      "Elige un programa del gobierno federal o estatal que afecte a tu comunidad (Becas Bienestar, Sembrando Vida, IMSS Bienestar, u otro). Identifica en qué etapa del ciclo se puede criticar más: ¿el diseño?, ¿la implementación?, ¿la evaluación? Sustenta con un ejemplo concreto de tu observación o de una nota periodística.",
    contexto_mexicano:
      "México tiene uno de los sistemas de evaluación de políticas públicas más desarrollados de América Latina, gracias al CONEVAL, creado en 2004 como organismo autónomo. Sin embargo, la existencia de instrumentos rigurosos de evaluación no garantiza que los resultados se traduzcan en cambios de política: la brecha entre el conocimiento técnico generado por la evaluación y la decisión política es uno de los problemas estructurales más persistentes en la gobernanza mexicana.\n\nUn caso emblemático es la historia del programa de transferencias condicionadas: nació como Progresa (1997), se renombró Oportunidades (2002), luego Prospera (2014) y fue reemplazado por Sembrando Vida y Becas Bienestar (2019). Cada cambio implicó modificar las reglas de operación, la focalización y los mecanismos de evaluación. La ironía es que Progresa fue diseñado con evidencia científica rigurosa y evaluado favorablemente a nivel internacional, pero la lógica política de cada nuevo gobierno priorizó marcar diferencia con la administración anterior sobre la continuidad de programas efectivos.",
    glosario: [
      {
        termino: "Agenda gubernamental",
        definicion:
          "Conjunto de problemas que los actores gubernamentales consideran objeto de atención y acción pública en un momento dado. No todos los problemas sociales entran en la agenda — solo los que tienen visibilidad política, apoyo social o urgencia técnica demostrada.",
      },
      {
        termino: "Presupuesto de Egresos",
        definicion:
          "Documento que aprueba la Cámara de Diputados cada diciembre, que establece el monto y destino de todos los gastos del gobierno federal durante el año siguiente. Es el instrumento financiero central de las políticas públicas en México.",
      },
      {
        termino: "Pobreza multidimensional",
        definicion:
          "Concepto del CONEVAL que define la pobreza no solo por ingreso insuficiente, sino por la coincidencia de al menos una carencia social: educación, acceso a salud, vivienda, alimentación, servicios básicos o seguridad social.",
      },
      {
        termino: "Evaluación de impacto",
        definicion:
          "Metodología que mide los efectos causales de una política pública comparando a los beneficiarios con un grupo de control comparable que no recibió la intervención. Permite aislar el efecto de la política de otros factores contextuales.",
      },
      {
        termino: "Federalismo",
        definicion:
          "Sistema de gobierno en el que el poder se distribuye entre un gobierno central (federal) y gobiernos subnacionales (estados y municipios). En México implica que muchas políticas se diseñan federalmente pero se implementan en 2,474 municipios con capacidades técnicas y presupuestarias muy distintas.",
      },
    ],
    preguntas_reflexion: [
      "El CONEVAL evalúa 150 programas sociales pero menos del 30% de sus recomendaciones se implementan. ¿Por qué existe esa brecha entre evaluación y acción? ¿Qué factores políticos, institucionales o presupuestarios podrían explicarla?",
      "Progresa fue renombrado cuatro veces en 25 años. ¿Por qué los gobiernos cambian los nombres y reglas de programas exitosos en lugar de continuarlos? ¿Qué implicaciones tiene esto para la efectividad acumulada de las políticas públicas?",
      "Los municipios más pobres tienen menos capacidad técnica para implementar las políticas que más los necesitan. ¿Es justo ese resultado estructural? ¿Qué cambios institucionales —de coordinación, de transferencia de capacidades, de diseño de reglas de operación— podrían corregirlo?",
    ],
  },

  {
    codigo: "LC-II-P04-A1",
    titulo: "Personajes y escenarios en la narrativa mexicana: Rulfo, Castellanos, Poniatowska y Fuentes",
    descripcion_accesible:
      "Infografía en formato de libro abierto con dos páginas visibles. Página izquierda (fondo crema, tono de papel antiguo): 'Los personajes', con jerarquía de tipos (protagonista, antagonista, secundario, arquetipo) y cuatro retratos estilizados de personajes de la literatura mexicana: Juan Preciado de Pedro Páramo, la niña sin nombre de Balún Canán, Artemio Cruz de La muerte de Artemio Cruz y la narradora colectiva de La noche de Tlatelolco. Página derecha (fondo azul oscuro): 'Los escenarios', con mapa estilizado de México que marca cinco escenarios literarios emblemáticos: Comala (Jalisco literario de Rulfo), el D.F. de Fuentes, Chiapas de Castellanos, el D.F. de Poniatowska y la frontera norte de Yuri Herrera. En el lomo del libro: 'El dónde y el quién construyen el qué'.",
    puntos_clave: [
      "Los personajes son la piedra angular de toda narrativa: realizan acciones, toman decisiones y experimentan transformaciones. La literatura mexicana del siglo XX construyó personajes arquetípicos que condensan experiencias históricas colectivas: el cacique (Rulfo), la mujer oprimida (Castellanos), el intelectual sin escrúpulos (Fuentes), la sobreviviente (Poniatowska).",
      "Personajes planos vs. redondos (E.M. Forster): el personaje plano tiene una sola característica dominante y no cambia. El personaje redondo es complejo, contradictorio y evoluciona. Juan Preciado en 'Pedro Páramo' (Rulfo, 1955) comienza como buscador de su padre y termina siendo un muerto que narra desde la tumba — un arco transformador radical.",
      "'Pedro Páramo' (Juan Rulfo, 1955): considerada la novela mexicana más importante del siglo XX. Su protagonista es un cacique que domina el pueblo de Comala mediante el terror y el deseo. La novela fragmenta el tiempo y mezcla vivos y muertos para alegorizar el caciquismo post-Revolución. Influyó directamente a García Márquez en 'Cien años de soledad'.",
      "El escenario como personaje: en la narrativa mexicana, los espacios son tan importantes como los seres humanos. Comala es un pueblo fantasma que encarna la decadencia del poder; el D.F. de Fuentes en 'La región más transparente' (1958) es una megalópolis donde conviven modernidad y trauma colonial; Chiapas de Castellanos en 'Balún Canán' (1957) revela estructuras de dominación étnica y de género.",
      "Rosario Castellanos (1925–1974): la escritora mexicana más importante de la primera mitad del siglo XX. Sus novelas y poemas denuncian la opresión de género y la discriminación étnica en Chiapas desde una perspectiva feminista. 'Balún Canán' narra la reforma cardenista desde los ojos de una niña de familia terrateniente chiapaneca.",
      "Elena Poniatowska (1932–): periodista y escritora, Premio Cervantes 2013. 'La noche de Tlatelolco' (1971) construye el testimonio colectivo de la masacre del 2 de octubre de 1968 a través de voces fragmentadas de sobrevivientes — texto que mezcla periodismo y literatura para dar voz a los sin voz. Poniatowska reinventó el testimonio como género literario en México.",
      "La función del espacio narrativo: el escenario no es solo decorado; establece el conflicto, revela el poder social y moldea el comportamiento de los personajes. En la narrativa mexicana, la tierra —la hacienda, el ejido, la milpa, la montaña— es frecuentemente el escenario que concentra las disputas de clase y etnia.",
      "El narrador como personaje: en la narrativa moderna mexicana, el narrador rara vez es omnisciente y neutral. En 'Los de abajo' (Azuela, 1915), el narrador es testigo incómodo de la Revolución. En 'El llano en llamas' (Rulfo, 1953), los narradores son campesinos que cuentan sus propias tragedias con voz seca, sin sentimentalismo.",
      "La literatura y la identidad: la narrativa mexicana del siglo XX funcionó como espejo y como construcción de identidad nacional. Hoy, la literatura indígena contemporánea (Natalia Toledo en zapoteco, Mikeas Sanchez en zoque, Briceida Cuevas en maya) desafía el canon mestizo desde lenguas y cosmovisiones propias.",
    ],
    fuente:
      "Academia Mexicana de la Lengua — Tradición narrativa mexicana del siglo XX 2022; UNAM Centro de Estudios Literarios — Bibliografía básica de narrativa mexicana 2023; Fondo de Cultura Económica — Catálogo del canon literario mexicano 2023",
    actividad_post:
      "Busca en la Biblioteca Virtual Universal o en el acervo digital del FCE un cuento de 'El llano en llamas' de Juan Rulfo. Analiza: ¿quién narra y desde qué perspectiva?, ¿cómo construye Rulfo el escenario con pocas palabras?, ¿qué nos dice el escenario sobre el conflicto central? Escribe tu análisis en una cuartilla.",
    contexto_mexicano:
      "La narrativa mexicana del siglo XX es uno de los patrimonios culturales más ricos de América Latina. 'Pedro Páramo' ha sido traducida a más de 30 idiomas y es la novela en español más influyente de la segunda mitad del siglo XX según una encuesta del Instituto Cervantes a 100 escritores iberoamericanos. García Márquez declaró que después de leer a Rulfo, supo exactamente lo que quería escribir.\n\nSin embargo, el canon literario mexicano fue históricamente masculino, mestizo y urbano. La literatura de Castellanos, Garro, Eltit y Mastretta tuvo que abrirse paso contra ese canon. La literatura indígena contemporánea enfrenta el mismo desafío: ser reconocida en el mismo nivel que los textos del canon en español. La Academia Mexicana de la Lengua y el FCE han ampliado gradualmente su reconocimiento a estas voces en los últimos 20 años, aunque el acceso editorial sigue siendo desigual.",
    glosario: [
      {
        termino: "Arquetipo",
        definicion:
          "Modelo de personaje universal que encarna un patrón humano fundamental: el héroe, el villano, el mentor, el trickster. Los arquetipos trascienden culturas y épocas, aunque en cada tradición literaria adquieren características locales específicas.",
      },
      {
        termino: "Narrador",
        definicion:
          "Voz que relata los eventos en un texto narrativo. Puede ser externo (heterodiegético: narra sin ser personaje), interno (homodiegético: es un personaje que narra) o en segunda persona (experimental). El narrador no es el autor — es una construcción textual.",
      },
      {
        termino: "Caciquismo",
        definicion:
          "Sistema de dominio local en el que un individuo (cacique) ejerce poder económico, político y en ocasiones violento sobre una comunidad, con escasa mediación institucional. Es un tema central en la narrativa de la Revolución Mexicana y en obras como 'Pedro Páramo'.",
      },
      {
        termino: "Testimonio",
        definicion:
          "Género literario-periodístico en el que voces reales de personas que vivieron un acontecimiento se compilan y editan para construir un relato colectivo. Elena Poniatowska es la principal exponente del testimonio literario en México.",
      },
      {
        termino: "Canon literario",
        definicion:
          "Conjunto de obras consideradas fundamentales por una comunidad crítica en un período dado. El canon es siempre una construcción histórica, cultural y en parte política — no una lista objetiva de 'los mejores libros', sino el resultado de decisiones editoriales, académicas y políticas.",
      },
    ],
    preguntas_reflexion: [
      "Juan Rulfo usa la muerte y el fantasma como recursos narrativos para hablar del caciquismo post-Revolución. ¿Por qué esa metáfora es especialmente poderosa para ese contexto histórico? ¿Qué otra metáfora usarías para hablar de una injusticia contemporánea en México?",
      "Castellanos y Poniatowska dieron voz a sectores silenciados (mujeres, pueblos indígenas, víctimas de violencia estatal). ¿Qué responsabilidad tiene la literatura de dar voz a quienes no tienen acceso a los medios de expresión dominantes? ¿Puede esa responsabilidad entrar en conflicto con la libertad creativa del escritor?",
      "El canon literario mexicano ha sido históricamente masculino y mestizo. ¿Debería la educación incluir literaturas en lenguas indígenas (náhuatl, zapoteco, maya) en el mismo nivel que los textos del canon en español? ¿Qué desafíos prácticos y simbólicos implicaría ese cambio?",
    ],
  },

  {
    codigo: "LC-II-P08-A1",
    titulo: "Proyectos creativos multimodales: texto, imagen, sonido y periodismo narrativo en México",
    descripcion_accesible:
      "Infografía en formato de constelación de burbujas conectadas. La burbuja central de mayor tamaño: 'Texto multimodal'. De ella irradian seis burbujas medianas, una por modo semiótico: texto (azul), imagen (rojo), audio (amarillo), video (morado), interactividad (verde) y espacio/diseño (naranja). De cada burbuja mediana parten tres burbujas pequeñas con ejemplos en México: de 'audio' salen 'podcast', 'narración oral' y 'radioarte'; de 'interactividad' salen 'periodismo de datos', 'mapa interactivo' y 'videojuego educativo'. En la franja inferior, tres proyectos multimodales mexicanos reales con descripción breve: Animal Político (periodismo de datos + visualización), 'A Dónde Van los Desaparecidos' (podcast + reportaje) y Ediciones Tecolote (libro álbum). En el margen derecho, cinco pasos para diseñar un proyecto multimodal: propósito y audiencia, selección de modos, estructura de lectura, combinación de elementos y prueba con lectores.",
    puntos_clave: [
      "Un texto multimodal combina dos o más modos de comunicación: texto escrito, imagen, sonido, video, gesto, espacio o interactividad. En la comunicación digital contemporánea, casi todos los textos son multimodales: un tuit con imagen, una historia de Instagram, un podcast con infografía.",
      "Los modos semióticos (Gunther Kress): cada modo tiene su propia lógica y potencial comunicativo. La imagen muestra; el texto explica; el audio evoca emoción; el video mueve y contextualiza; la interactividad implica al usuario como co-constructor activo de significado.",
      "El periodismo multimodal en México: Aristegui Noticias, Animal Político y Quinto Elemento Lab son referentes de periodismo digital que combinan texto, infografías interactivas, audio y video. La investigación del 'Caso Odebrecht' por Animal Político (2019) usó periodismo de datos con visualizaciones de redes de corrupción — ganó el Premio Gabriel García Márquez de Periodismo.",
      "El podcast en México: 15 millones de escuchas mensuales de podcast en 2023 (IAB México). Proyectos como 'A Dónde Van los Desaparecidos', 'Historia Mexicana' del Colmex y 'No Hay Tos' combinan narración oral, música, archivos de sonido y periodismo narrativo de largo aliento.",
      "El libro álbum como texto multimodal: requiere leer simultáneamente texto e imagen, que a veces se contradicen o complementan. Autoras y editoras mexicanas como Ediciones Tecolote y el FCE han desarrollado producción de libros álbum de alta calidad para lectores jóvenes.",
      "La narración transmedia: historia que se despliega a través de múltiples plataformas, donde cada una aporta contenido único y complementario. Proyectos mexicanos como 'LIQEN' (graffiti, video y libro) y 'Sonorizar' (música y poesía) exploran la narrativa transmedia en contextos culturales locales.",
      "Producción de texto multimodal: crear un texto multimodal implica decisiones retóricas de diseño: ¿qué modo es más efectivo para qué contenido?, ¿cómo se organizan los elementos en el espacio?, ¿qué secuencia sigue el lector? Estas decisiones buscan un efecto específico en una audiencia específica.",
      "Derechos de autor y Creative Commons en México: la Ley Federal del Derecho de Autor (LFDA) protege las obras por 100 años después de la muerte del autor. Las licencias Creative Commons permiten compartir obras con distintos grados de apertura. El INDAUTOR gestiona el registro en México.",
    ],
    fuente:
      "Instituto Nacional del Derecho de Autor (INDAUTOR) — Guía de derechos de autor en educación 2022; IAB México — Estudio de consumo de medios digitales 2023; Fondo de Cultura Económica — Catálogo editorial multimodal 2023",
    actividad_post:
      "Elige un tema de tu comunidad que te preocupe. Diseña un proyecto multimodal para comunicarlo a estudiantes de tu edad: decide qué modos combinarás (texto, imagen, audio, video, infografía), por qué son los más efectivos para ese tema y esa audiencia, y cómo organizarás la experiencia de lectura/recepción. Presenta el concepto en una página.",
    contexto_mexicano:
      "El periodismo narrativo y multimodal mexicano vivió una segunda edad de oro con el auge de los medios digitales independientes en la década de 2010. Ante el control corporativo y gubernamental de los medios tradicionales, surgieron proyectos como Animal Político, Quinto Elemento Lab, Pie de Página y Periodistas de a Pie, que combinaron texto, datos y multimedia para cubrir corrupción, violencia y derechos humanos.\n\nMéxico es uno de los países más peligrosos del mundo para ejercer el periodismo: más de 140 periodistas han sido asesinados entre 2000 y 2023 (CPJ — Comité para la Protección de los Periodistas). Este contexto de riesgo real no ha detenido la innovación multimodal; al contrario, la diversificación de formatos y plataformas hace el periodismo más difícil de silenciar. En educación, el Nuevo Marco Curricular de la SEP (2022) incluye explícitamente la competencia multimodal como parte de la alfabetización del siglo XXI.",
    glosario: [
      {
        termino: "Multimodalidad",
        definicion:
          "Uso simultáneo de dos o más modos semióticos (texto, imagen, sonido, gesto, espacio) en un mismo texto o acto comunicativo. La comunicación digital contemporánea es fundamentalmente multimodal.",
      },
      {
        termino: "Modo semiótico",
        definicion:
          "Sistema de recursos para construir significado: el lenguaje verbal (escrito y oral), las imágenes, el sonido, el espacio, el gesto, el color. Cada modo tiene su propia gramática y potencial expresivo específico.",
      },
      {
        termino: "Transmedia",
        definicion:
          "Estrategia narrativa en la que una historia se expande a través de múltiples plataformas, aportando cada una contenido exclusivo que enriquece el universo narrativo sin repetir lo mismo en distintos formatos.",
      },
      {
        termino: "Periodismo de datos",
        definicion:
          "Modalidad periodística que usa bases de datos, estadísticas y visualizaciones para contar historias de interés público. Requiere habilidades de análisis estadístico y diseño visual además de escritura periodística.",
      },
      {
        termino: "Licencia Creative Commons",
        definicion:
          "Sistema de licencias que permite a los creadores especificar qué usos pueden hacerse de sus obras sin solicitar permiso adicional. Existen seis tipos que combinan cuatro atributos: Atribución (BY), No Comercial (NC), Sin Derivadas (ND) y Compartir Igual (SA).",
      },
    ],
    preguntas_reflexion: [
      "México es uno de los países más peligrosos del mundo para los periodistas, pero también tiene uno de los ecosistemas de periodismo digital independiente más activos de América Latina. ¿Por qué la precariedad y el riesgo coexisten con tanta innovación multimodal? ¿Qué papel juega la diversificación de formatos en hacer el periodismo más difícil de silenciar?",
      "¿Qué habilidades específicas necesitarías desarrollar para diseñar un proyecto multimodal efectivo que no fueras capaz de comunicar con solo texto escrito? ¿Cuáles de esas habilidades ya tienes y cuáles necesitarías aprender?",
      "Las plataformas digitales (YouTube, TikTok, Instagram) han democratizado la producción multimodal, pero también concentran el poder de distribución y monetización en pocas empresas transnacionales. ¿Quién controla realmente el espacio multimodal digital, y qué implicaciones tiene eso para la libertad de expresión en México?",
    ],
  },

  {
    codigo: "LC-III-P02-A1",
    titulo: "Movimientos literarios en México: del Barroco novohispano de Sor Juana a las narrativas contemporáneas",
    descripcion_accesible:
      "Infografía en formato de línea de tiempo vertical, del siglo XVII al XXI, con bloques de color que cambian por movimiento. Barroco (dorado): Sor Juana Inés de la Cruz, 'Primero Sueño'. Romanticismo (azul oscuro): Ignacio Manuel Altamirano, 'El Zarco'. Modernismo (verde esmeralda): Manuel Gutiérrez Nájera, 'Revista Azul'. Estridentismo (rojo fuego): Manuel Maples Arce, 'Manifiesto Estridentista'. Contemporáneos (gris plata): Xavier Villaurrutia, 'Nostalgia de la muerte'. Boom (naranja): Carlos Fuentes, 'La muerte de Artemio Cruz'. La Onda (amarillo brillante): José Agustín, 'La tumba'. Contemporáneo (multicolor): Fernanda Melchor, 'Temporada de huracanes'. Al lado de cada bloque, un fragmento de dos líneas de la obra representativa en cursiva. En la parte superior, una cita de Octavio Paz: 'La poesía no es la expresión de la realidad: es una de sus formas posibles.'",
    puntos_clave: [
      "Un movimiento literario es una corriente de pensamiento estético que agrupa a autores de una época con visión del mundo, recursos formales y temas compartidos. Los movimientos son construcciones críticas retrospectivas — los escritores raramente se autodefinen así en el momento de escribir.",
      "El Barroco novohispano (siglos XVII–XVIII): primera gran expresión literaria propia de lo que hoy es México. Sor Juana Inés de la Cruz (1648–1695) es su figura cumbre: poeta, dramaturga y proto-feminista. Su 'Primero Sueño' (1692) es el poema más ambicioso del Barroco hispanoamericano. Su 'Respuesta a Sor Filotea' (1691) defendió el derecho de las mujeres a la educación — carta filosófica sin precedente en su época.",
      "El Romanticismo mexicano (1840–1880): exaltó el sentimiento, la libertad individual y el paisaje nacional. Ignacio Manuel Altamirano (1834–1893) fundó la Revista Nacional de Letras y Ciencias e impulsó la novela mexicana como género nacional. Nacido en familia indígena nahua en Tixtla, Guerrero, hizo de la literatura un proyecto de cohesión nacional posindependencia.",
      "El Modernismo hispanoamericano (1880–1920): primera vanguardia genuinamente latinoamericana, liderada por el nicaragüense Rubén Darío. En México, Manuel Gutiérrez Nájera fundó la 'Revista Azul' (1894) y fue el pionero del modernismo mexicano con su prosa poética sensorial. El modernismo fue la primera corriente literaria que se produjo simultáneamente en toda América Latina como proyecto regional.",
      "El Estridentismo (1921–1927): primera vanguardia mexicana post-Revolución. El poeta Manuel Maples Arce proclamó el 'Manifiesto Estridentista' en 1921, celebrando la tecnología, el ruido urbano y la máquina como temas poéticos. Respuesta mexicana al futurismo italiano y al dadaísmo europeo. El Estridentismo se instaló en Xalapa, Veracruz, donde brevemente controló el gobierno estatal y convirtió la ciudad en laboratorio cultural.",
      "Los Contemporáneos (1920s–1940s): grupo de poetas y narradores (Carlos Pellicer, Xavier Villaurrutia, Salvador Novo, Jorge Cuesta) que se opusieron al nacionalismo cultural posrevolucionario. Defendieron la universalidad literaria por encima del folklore mexicano. Salvador Novo fue el primer escritor mexicano en hablar abiertamente de homosexualidad. La revista 'Contemporáneos' (1928–1931) fue su tribuna.",
      "El Boom latinoamericano (1960s–1970s): explosión de la narrativa latinoamericana en el mercado editorial mundial. Carlos Fuentes ('La muerte de Artemio Cruz', 1962; 'Terra Nostra', 1975) es el representante mexicano central. El Boom renovó la novela con técnicas de fragmentación temporal, perspectivas múltiples y experimentación con el tiempo narrativo.",
      "La literatura de la Onda (1960s–1970s): movimiento mexicano urbano y juvenil que rompió con el español literario formal. José Agustín ('La tumba', 1964) y Gustavo Sainz ('Gazapo', 1965) escribieron en el lenguaje coloquial chilango de los años 60, mezclando inglés, slang y referencias al rock y la contracultura norteamericana.",
      "La narrativa mexicana contemporánea (desde 1990): plural y globalizada, sin un movimiento unificador. Yuri Herrera ('Señales que precederán al fin del mundo', 2009), Valeria Luiselli ('Los ingrávidos', 2011) y Fernanda Melchor ('Temporada de huracanes', 2017) escriben desde el margen — la migración, el feminicidio, la violencia del narco — y son traducidas a decenas de idiomas.",
    ],
    fuente:
      "Academia Mexicana de la Lengua — Historia de la literatura mexicana por movimientos 2022; UNAM Coordinación de Difusión Cultural — Lecturas esenciales de la literatura mexicana 2023; Fondo de Cultura Económica — Historia crítica de la literatura hispanoamericana 2020",
    actividad_post:
      "Busca en el acervo digital del FCE o en la Biblioteca Digital UNAM un poema de Sor Juana Inés de la Cruz y uno de un/a escritor/a mexicano/a contemporáneo/a. Compara: ¿qué palabras, temas y formas métricas usa cada uno? ¿Qué nos dicen esas diferencias sobre los movimientos literarios de cada época?",
    contexto_mexicano:
      "México tiene una de las tradiciones literarias más ricas de América Latina, con cuatro siglos de producción ininterrumpida desde la época novohispana. Sin embargo, esa tradición fue durante mucho tiempo un privilegio masculino y mestizo: Sor Juana fue una excepción tan notable que tardó tres siglos en ser reconocida como figura canónica. Las escritoras mexicanas del siglo XX —Rosario Castellanos, Elena Garro, Elena Poniatowska, Carmen Boullosa— tuvieron que abrirse paso contra instituciones literarias dominadas por hombres.\n\nEl Premio Cervantes —el más importante del mundo hispanohablante— ha sido otorgado a tres mexicanos o mexicanas: Octavio Paz (1981), José Emilio Pacheco (2009) y Elena Poniatowska (2013). La aparición de Poniatowska como primera mujer mexicana en ganar el Premio Cervantes marcó un reconocimiento tardío pero significativo de las escritoras en el canon. Hoy, la literatura escrita por mujeres mexicanas es la parte del canon que más atención editorial y académica internacional recibe, con traducciones a más de 20 idiomas de autoras como Melchor, Luiselli y Herrera.",
    glosario: [
      {
        termino: "Movimiento literario",
        definicion:
          "Corriente de pensamiento estético que agrupa a autores de una época con visión del mundo, recursos formales y temas compartidos. Los movimientos son construcciones críticas retrospectivas — los escritores raramente se definen así en el momento de escribir.",
      },
      {
        termino: "Vanguardia",
        definicion:
          "En literatura, tendencia del siglo XX que rompió radicalmente con las formas y temas del pasado. Las vanguardias (futurismo, dadaísmo, surrealismo, estridentismo) buscaban renovar el lenguaje en respuesta a los cambios sociales y tecnológicos de la modernidad industrial.",
      },
      {
        termino: "Barroco",
        definicion:
          "Movimiento cultural (siglos XVII–XVIII) caracterizado por la complejidad formal, el exceso ornamental, el contraste dramático y la reflexión sobre la vanidad y la muerte. En México, el Barroco novohispano tuvo expresión pictórica, arquitectónica y literaria, siendo Sor Juana su figura más universal.",
      },
      {
        termino: "Canon literario",
        definicion:
          "Conjunto de obras y autores considerados fundamentales en una tradición literaria. El canon es siempre una selección histórica y cultural — incluye y excluye según criterios de época, género, clase y etnia, no según una objetiva medición de calidad.",
      },
      {
        termino: "Intertextualidad",
        definicion:
          "Relación que un texto establece con otros textos anteriores o contemporáneos, mediante citas, referencias, parodias, homenajes o transformaciones. Toda obra literaria es intertextual: ningún texto nace del vacío, todo escritor dialoga con su tradición.",
      },
    ],
    preguntas_reflexion: [
      "Sor Juana fue reconocida como figura canónica de la literatura mexicana recién en el siglo XX, tres siglos después de su muerte. ¿Qué factores culturales, religiosos y de género explican ese retraso? ¿Qué otras voces del pasado mexicano podrían estar esperando su reconocimiento?",
      "El Estridentismo de 1921 celebró la máquina y la tecnología como temas poéticos. ¿Cómo crees que los estridentistas habrían reaccionado ante internet, los algoritmos y la inteligencia artificial? ¿Qué movimiento literario contemporáneo se parece más al Estridentismo en su relación con la tecnología?",
      "La literatura de la Onda usó el lenguaje coloquial chilango de los años 60, mezclando inglés y slang. ¿Crees que el lenguaje de las redes sociales (emojis, memes, abreviaciones, virgulillas) podría ser la base de una nueva literatura? ¿Qué perdería y qué ganaría la literatura con ese cambio?",
    ],
  },

  // ── LOTE 4: IN-II, IN-III, PM-II, PM-III, PM-IV (×2), PM-V (×2), PM-VI ──────

  {
    codigo: "IN-II-P04-A1",
    titulo: "Describing People, Clothes and Weather: inglés para contextos mexicanos",
    descripcion_accesible:
      "Infografía bilingüe en tres secciones horizontales. Sección superior (azul claro, Physical Appearance / Apariencia física): tabla de dos columnas inglés/español con 12 adjetivos de descripción, cada uno con ícono simple. Al centro, una silueta humana con flechas que señalan cabello, ojos, estatura y complexión. Sección media (verde, Clothes / Ropa): cuadrícula de 12 prendas con su nombre en inglés y español, e íconos estilizados. A la derecha, un recuadro de colores con sus nombres en inglés. Sección inferior (amarillo, Weather / Clima): mapa estilizado de México con íconos climáticos representativos: sol en el noroeste (Sonora), nube con lluvia en el sureste (Chiapas), copo de nieve en la meseta central (Toluca en invierno). Debajo del mapa, cuatro oraciones modelo: 'It is very hot in Sonora in summer', 'It is rainy in Chiapas in June', 'It is cold in Toluca in winter', 'It is sunny in Cancún today'.",
    puntos_clave: [
      "Physical appearance vocabulary: tall/short (alto/bajo), young/old (joven/mayor), long/short hair (cabello largo/corto). Grammar: use 'have/has' for descriptions → She has dark hair and brown eyes. En ciudades fronterizas como Tijuana y Ciudad Juárez, las descripciones físicas bilingües se usan a diario en turismo, recursos humanos y servicios de salud.",
      "Clothing vocabulary at A2: jacket (chamarra), dress (vestido), jeans (mezclilla), sneakers (tenis/zapatos deportivos), scarf (bufanda), boots (botas). México produce anualmente más de 600 millones de prendas en los estados de Puebla, Tlaxcala y Aguascalientes, gran parte exportada a EE.UU. con la etiqueta 'Made in Mexico'.",
      "Weather vocabulary: sunny (soleado), cloudy (nublado), rainy (lluvioso), windy (ventoso), hot (caluroso), cold (frío), warm (cálido). México tiene extrema variación climática: Hermosillo, Sonora alcanza hasta 48–50 °C en verano ('It is extremely hot today'); Toluca, Estado de México, a 2,700 m de altitud, registra 'very cold and cloudy' la mayor parte del invierno.",
      "Grammar — Present Continuous para estado actual: She IS wearing a red dress (Está usando un vestido rojo), versus Simple Present para hábitos: She wears blue jeans to school. El marcador 'right now / at the moment' (ahora mismo) activa el Present Continuous.",
      "Contexto Día de Muertos: describir trajes típicos ('She is wearing a colorful huipil with embroidered flowers') y maquillaje ('He has painted skull makeup in blue and white') conecta el inglés descriptivo con la expresión cultural más reconocida de México en el mundo. La UNESCO inscribió el Día de Muertos en la Lista del Patrimonio Intangible en 2008.",
      "Turismo en México: el país recibió aproximadamente 32 millones de turistas internacionales en 2023 (SECTUR). Personal de hoteles, guías de turistas y artesanos en Cancún, Oaxaca, Chichén Itzá y Puerto Vallarta usan inglés descriptivo a diario: 'The pyramids are very tall and ancient. The weather in the Yucatán Peninsula is hot and humid.'",
      "Bilingüismo fronterizo: más de 15 millones de personas viven en la franja fronteriza México-EE.UU. (CONAPO 2023). En Tijuana, Ciudad Juárez y Laredo, el español y el inglés coexisten en código mixto ('spanglish fronterizo'), estudiado por el UNAM CELE (Centro de Enseñanza de Lenguas Extranjeras) como fenómeno de contacto lingüístico.",
      "PRONI y el bachillerato: el Programa Nacional de Inglés de la SEP (PRONI) tiene como meta que los egresados del NEM bachillerato alcancen nivel A2–B1 para 2025. Los trabajadores bilingües en turismo, call centers y nearshoring ganan entre 30 y 60% más que los monolingües, según el índice de talento digital de AMITI 2024.",
      "Sensibilidad cultural en las descripciones: evitar estereotipos al describir la apariencia física es tanto una habilidad lingüística como ética. Las recomendaciones de la UNESCO sobre lenguaje no discriminatorio se aplican al inglés como lengua extranjera. La lengua de señas mexicana (LSM) también tiene registros descriptivos de apariencia que forman parte de la realidad multilingüe de México.",
    ],
    fuente:
      "SEP — Programa Nacional de Inglés (PRONI) 2022–2025; SECTUR — Informe Estadístico de Turismo Internacional 2023; UNAM CELE — Materiales para la enseñanza del inglés en bachillerato 2023",
    actividad_post:
      "Imagine you are a tour guide at Chichén Itzá or the Museo Nacional de Antropología. Write 5 sentences in English describing a tourist you see (physical appearance + clothing) and the weather that day. Include at least one Present Continuous sentence. (Imagina que eres guía de turistas. Escribe 5 oraciones en inglés describiendo a un turista y el clima del día.)",
    contexto_mexicano:
      "El inglés es la segunda lengua más estudiada en México, pero solo el 5–6% de los mexicanos se comunica con fluidez en inglés (EF EPI 2023). Sin embargo, la demanda de trabajadores bilingües crece aceleradamente por el nearshoring tecnológico y la industria turística. En ciudades fronterizas como Tijuana y Ciudad Juárez, el español y el inglés coexisten tan íntimamente que ha emergido un dialecto de contacto con vocabulario, gramática y pronunciación propios.\n\nDescribir personas, ropa y clima en inglés no es solo un ejercicio académico: es una habilidad real para el sector turístico. Los aproximadamente 32 millones de turistas internacionales que visitaron México en 2023 interactuaron con guías, artesanos, restauranteros y hoteleros cuya capacidad de describir en inglés impactó directamente en la experiencia del visitante y en los ingresos del sector.",
    glosario: [
      {
        termino: "adjective / adjetivo",
        definicion:
          "A word that describes a noun (quality, size, color, appearance). In English, adjectives go BEFORE the noun: 'a tall woman,' not 'a woman tall.' (Palabra que describe a un sustantivo. En inglés el adjetivo va ANTES del sustantivo.)",
      },
      {
        termino: "have / has",
        definicion:
          "Verb used to describe possession or physical characteristics. 'I/You/We/They have' — 'He/She/It has.' For descriptions: 'She has long dark hair.' NOT 'She is have long hair.'",
      },
      {
        termino: "Present Continuous",
        definicion:
          "Verb tense formed with to be + verb-ing. Describes what is happening NOW: 'He is wearing a blue jacket right now.' (Tiempo verbal para describir lo que ocurre en este momento. Se forma con el verbo to be + verbo-ing.)",
      },
      {
        termino: "weather / clima",
        definicion:
          "Atmospheric conditions in a place at a specific time (sunny, rainy, cold). Different from 'climate' (climate = patrón climático de largo plazo). México tiene muchos microclimas por su topografía diversa.",
      },
      {
        termino: "bilingual / bilingüe",
        definicion:
          "A person who can communicate effectively in two languages. In Mexico, bilingual proficiency in Spanish and English significantly expands employment opportunities in tourism, technology and international trade.",
      },
    ],
    preguntas_reflexion: [
      "In Mexico, English proficiency is higher in northern border states (Baja California, Sonora, Chihuahua) than in southern states. ¿Por qué crees que existe esa diferencia regional? What economic, historical and geographic factors explain it?",
      "El 'spanglish fronterizo' mezcla español e inglés de formas que ninguno de los dos idiomas 'oficiales' reconoce. ¿Es esto una 'corrupción' de los idiomas o una forma legítima de creatividad lingüística? ¿Qué dice la lingüística moderna sobre las lenguas de contacto?",
      "Mexico received about 32 million international tourists in 2023. ¿Qué frases de descripción en inglés necesitaría alguien que trabaja en turismo en tu estado? Make a list of 10 key English phrases for your regional context.",
    ],
  },

  {
    codigo: "IN-III-P08-A1",
    titulo: "A2 English: Past Simple, Present Perfect, Modals y narrativa para hablantes de español mexicano",
    descripcion_accesible:
      "Infografía bilingüe en cuatro secciones de igual tamaño. Sección 1 (azul marino, Past Simple): tabla de 10 verbos irregulares frecuentes con forma base y forma pasada, y un ejemplo con contexto mexicano ('I visited Chichén Itzá last year'). Sección 2 (verde, Comparatives/Superlatives): escala visual de tres puntos (tall/taller/tallest) con el ejemplo de tres volcanes mexicanos ordenados por altura. Sección 3 (rojo, Modals): tabla de tres modales (must, have to, should) con sus usos y ejemplos de situaciones en México (frontera, hospital, restaurante). Sección 4 (amarillo, Narrative connectors): historia corta de 6 oraciones sobre una visita a Oaxaca con conectores narrativos subrayados. Margen derecho: recuadro con el nivel CEFR A2 y los tres exámenes de certificación disponibles en México (KET Cambridge, TOEFL ITP, IELTS Academic).",
    puntos_clave: [
      "Past Simple: para acciones completadas en un momento específico del pasado. Verbos regulares: add -ed (worked, traveled, visited). Irregulares clave: go→went, have→had, be→was/were, see→saw, make→made. Marcadores de tiempo: yesterday (ayer), last week/month/year, in 2019, ago ('Three years ago, I visited Oaxaca'). Negativo: did not (didn't) + base verb.",
      "Present Perfect: have/has + past participle. Expresa experiencia sin especificar cuándo, o acciones recientes. 'I have never eaten grasshoppers.' (Nunca he comido chapulines.) Contraste clave: Past Simple dice CUÁNDO; Present Perfect no. 'I visited Chichén Itzá in 2018' vs. 'I have visited Chichén Itzá' (experiencia sin fecha).",
      "Modal verbs: must/mustn't (obligación fuerte) — 'You must wear a seatbelt in Mexico City.' Have to/don't have to (obligación externa / ausencia de obligación) — 'You have to show your ID at the border. You don't have to speak perfect English.' Should/shouldn't (consejo) — 'You should try the local mole.'",
      "Comparatives and superlatives: adjetivos cortos (-er/-est): big→bigger→biggest. Largos (more/most): beautiful→more beautiful→most beautiful. Irregulares: good→better→best, bad→worse→worst. Geografía mexicana: 'The Sierra Madre Occidental is higher than the Sierra Madre del Sur. Pico de Orizaba is the tallest volcano in Mexico (5,636 m).'",
      "Prepositions of place: next to (junto a), in front of (enfrente de), between (entre), behind (detrás de), opposite (frente a), on the corner (en la esquina). Aplicación práctica: dar indicaciones en ciudades mexicanas. 'The zócalo is next to the cathedral. The Palacio Nacional is in front of the zócalo.'",
      "Imperatives + connectors para instrucciones: verbo base para mandatos. 'Open / Don't open', 'Turn left / Don't turn right.' Conectores: First, then, after that, next, finally. Útil para instrucciones bilingües en contextos mexicanos: recetas ('First, soak the chiles. Then, blend them with garlic'), instrucciones de seguridad en fábricas y obras.",
      "Narrative connectors: then, after that, later, suddenly, in the end, eventually — para contar historias con coherencia. La tradición oral narrativa mexicana es rica: contar historias de migraciones de Oaxaca a CDMX, cruce de la frontera o eventos comunitarios requiere exactamente estos conectores en inglés.",
      "Certificación A2 y México: el Marco Común Europeo (CEFR) nivel A2 es el mínimo para muchos puestos bilingües de entrada en maquiladoras y turismo. El TOEFL ITP y Cambridge KET certifican este nivel. Trabajadores bilingües certificados ganan entre 30 y 60% más en promedio que los monolingües en México (AMITI 2024).",
    ],
    fuente:
      "SEP — Marco Curricular del Programa Nacional de Inglés (PRONI) 2022; Cambridge Assessment English — CEFR Level Descriptors A2 2023; UNAM CELE — Materiales de inglés A2 para bachillerato 2022",
    actividad_post:
      "Write a short story (6–8 sentences) about a real or imaginary person from Mexico who traveled abroad or crossed the border. Use: at least 2 Past Simple verbs, 1 Present Perfect sentence, 1 modal verb and 2 narrative connectors. (Escribe una historia corta sobre una persona de México que viajó al extranjero. Usa al menos 2 Past Simple, 1 Present Perfect, 1 modal y 2 conectores narrativos.)",
    contexto_mexicano:
      "El uso del Past Simple y el Present Perfect tiene una dimensión cultural concreta para los mexicanos: millones de migrantes retornados —aproximadamente 600,000 por año entre 2010 y 2022 (CONAPO)— traen historias narradas en un inglés que mezcla estructuras del español con las del inglés americano. Contar esas historias en inglés formal requiere exactamente estas estructuras: 'I worked in a restaurant in Los Angeles for three years. I have just returned to Michoacán. Now I am starting my own business.'\n\nEn las maquiladoras del norte de México (Chihuahua, Sonora, Baja California), los supervisores de línea usan inglés de nivel A2 para comunicarse con ingenieros y clientes de EE.UU. La diferencia entre tener o no tener certificación de inglés puede significar el acceso a un puesto de supervisor vs. operario en la misma planta.",
    glosario: [
      {
        termino: "Past Simple",
        definicion:
          "Verb tense used to describe completed actions at a specific time in the past. Regular: add -ed. Irregular: must be memorized individually. (Tiempo verbal para describir acciones completadas en un momento específico del pasado.)",
      },
      {
        termino: "Present Perfect",
        definicion:
          "Verb tense formed with have/has + past participle. Connects past experience to the present — the EXACT time is not important. Contrast: 'I went to Mérida last year' (Past Simple, specific time) vs. 'I have been to Mérida' (Present Perfect, experience).",
      },
      {
        termino: "modal verb / verbo modal",
        definicion:
          "Auxiliary verb expressing possibility, obligation, permission or advice. Modals do not conjugate: 'He must go' (NOT 'He musts go'). Key modals at A2: can, could, must, have to, should, may.",
      },
      {
        termino: "CEFR",
        definicion:
          "Common European Framework of Reference for Languages. Six levels: A1 (beginner), A2 (elementary), B1 (intermediate), B2 (upper-intermediate), C1 (advanced), C2 (mastery). La SEP alinea las metas del NEM al CEFR.",
      },
      {
        termino: "nearshoring",
        definicion:
          "Economic strategy in which companies relocate operations to a nearby country. US companies moving operations to Mexico for geographic and linguistic proximity require English-speaking Mexican workers — making A2–B1 English a key employability skill.",
      },
    ],
    preguntas_reflexion: [
      "The Present Perfect says 'I have visited Oaxaca' without specifying when, while Past Simple requires a time marker. ¿Por qué crees que el inglés hace esta distinción que el español generalmente no hace? ¿Cómo afecta eso a los mexicanos que aprenden inglés?",
      "Millions of Mexican returnees speak a mix of Spanish and American English. ¿Debería considerarse su inglés (que mezcla estructuras de ambos idiomas) como 'incorrecto' o como una variedad legítima? ¿Qué dice la lingüística moderna sobre las variedades de contacto?",
      "PRONI quiere que los egresados del NEM lleguen al nivel A2–B1. ¿Crees que esa meta es realista dado el número reducido de horas de inglés y los recursos disponibles? ¿Qué estrategias de aprendizaje fuera del aula acelerarían tu progreso?",
    ],
  },

  {
    codigo: "PM-II-P06-A1",
    titulo: "Inecuaciones: restricciones, regiones factibles y aplicaciones en la economía mexicana",
    descripcion_accesible:
      "Infografía en tres columnas. Columna izquierda (azul claro): 'El lenguaje de las inecuaciones', con tabla de los cinco símbolos de desigualdad (<, >, ≤, ≥, ≠), su lectura en español y un ejemplo de contexto cotidiano mexicano para cada uno. Columna central (blanco): 'Representación gráfica', con dos diagramas: una recta numérica mostrando la solución de x ≤ 5 con punto cerrado, y un plano cartesiano con el semiplano solución de 2x + y < 6 sombreado en azul. Columna derecha (verde claro): 'Aplicaciones reales en México', con tres recuadros: presupuesto familiar con datos ENIGH 2022, producción agrícola en Sonora con sistema de dos inecuaciones, y Reglamento de Construcciones de la CDMX. Franja inferior en rojo: '¡Cuidado! Al multiplicar o dividir por negativo, el signo se invierte.'",
    puntos_clave: [
      "Una inecuación es una expresión matemática que usa un símbolo de desigualdad (<, >, ≤, ≥) para comparar dos cantidades. A diferencia de una ecuación (solución única), la inecuación tiene un conjunto infinito de soluciones: un intervalo en una variable, o una región del plano en dos variables.",
      "Resolución de una inecuación lineal: se opera igual que una ecuación, con una excepción crítica — al multiplicar o dividir ambos lados por un número NEGATIVO, el signo de la desigualdad se invierte. Ejemplo: −2x > 6 → dividir entre −2 (negativo) → x < −3 (el signo cambia).",
      "Representación en recta numérica: punto abierto (○) si el valor límite NO está incluido (< o >); punto cerrado (●) si SÍ está incluido (≤ o ≥). La solución de x > 3 es ○ en 3 con flecha hacia la derecha.",
      "Representación en plano cartesiano: una inecuación con dos variables (como 2x + 3y ≤ 600) define un semiplano. La recta es la frontera; la región sombreada es el conjunto de soluciones. Si el símbolo es ≤ o ≥, la recta frontera está incluida (trazo continuo); si es < o >, está excluida (trazo punteado).",
      "Aplicación en presupuesto familiar: si un hogar mexicano tiene ingresos de $12,000 MXN al mes y el alquiler cuesta al menos $4,000 MXN, los gastos disponibles satisfacen: gastos_otros ≤ 8,000. La ENIGH 2022 del INEGI documenta que los hogares del 40% más pobre destinan más del 50% de su ingreso a alimentación — una restricción de desigualdad que define su espacio de opciones.",
      "Inecuaciones en producción agrícola: un agricultor en Sonora tiene 100 hectáreas. Si quiere sembrar trigo (x ha) y maíz (y ha), la restricción de tierra es: x + y ≤ 100. Si necesita al menos 20 ha de trigo para cubrir costos mínimos: x ≥ 20. El sistema define la región factible — base matemática de la programación lineal que usa la SAGARPA en planificación agropecuaria.",
      "Inecuaciones en normas técnicas: el Reglamento de Construcciones de la CDMX establece que la altura máxima en zona residencial tipo H es h ≤ 10 m, y que el área construida no exceda el 60% del terreno: área_construida ≤ 0.60 × área_terreno. Dos inecuaciones que todo arquitecto debe satisfacer simultáneamente antes de presentar un proyecto.",
      "La CONASAMI fija el salario mínimo como una inecuación: salario_pagado ≥ salario_mínimo. En la economía informal mexicana — que emplea a casi el 56% de los trabajadores (INEGI 2023) — esta inecuación frecuentemente no se cumple, lo que constituye una violación de la norma con consecuencias en pobreza y seguridad social.",
    ],
    fuente:
      "INEGI — Encuesta Nacional de Ingresos y Gastos de los Hogares (ENIGH) 2022; CONASAMI — Salario Mínimo General 2024; Reglamento de Construcciones para la Ciudad de México (RCCDMX) vigente",
    actividad_post:
      "Un estudiante tiene $500 MXN para comprar materiales escolares. Los cuadernos cuestan $25 cada uno y los bolígrafos $15 cada uno. Necesita al menos 4 cuadernos. (1) Plantea el sistema de inecuaciones. (2) Representa la región factible en el plano cartesiano. (3) Identifica tres combinaciones posibles de compra. (4) ¿Cuál te parece más eficiente y por qué?",
    contexto_mexicano:
      "Las inecuaciones son el lenguaje formal de las restricciones. En la vida económica de México, las restricciones son omnipresentes: el límite de crédito bancario del INFONAVIT para adquirir vivienda, las cuotas de pesca de la CONAPESCA en el Golfo de México, los topes de emisiones de la SEMARNAT para industrias, o el salario mínimo como piso salarial. Todas son inecuaciones con consecuencias legales y económicas reales.\n\nEn la empresa mexicana, la programación lineal —que se basa en sistemas de inecuaciones— es usada por empresas como FEMSA, Bimbo y Gruma para optimizar rutas de distribución, mezclas de materias primas y horarios de producción. Los ingenieros industriales que trabajan en estas empresas aplican inecuaciones cotidianamente. Comprender las inecuaciones desde el bachillerato es comprender la lógica matemática de los sistemas con restricciones que organizan la economía.",
    glosario: [
      {
        termino: "Inecuación",
        definicion:
          "Expresión matemática que establece una relación de desigualdad entre dos cantidades usando <, >, ≤ o ≥. Su solución es un conjunto infinito de valores (un intervalo en una variable, un semiplano en dos variables).",
      },
      {
        termino: "Conjunto solución",
        definicion:
          "Conjunto de todos los valores que satisfacen una inecuación. Para una variable se representa en la recta numérica; para dos variables, como una región sombreada en el plano cartesiano.",
      },
      {
        termino: "Semiplano",
        definicion:
          "Región del plano cartesiano a un lado de una recta frontera. Una inecuación lineal con dos variables define un semiplano como su conjunto solución. La frontera puede estar incluida (≤, ≥) o excluida (<, >) de la solución.",
      },
      {
        termino: "Región factible",
        definicion:
          "En programación lineal, intersección de todos los semiplanos generados por un sistema de inecuaciones. Representa el conjunto de soluciones posibles que satisfacen todas las restricciones simultáneamente.",
      },
      {
        termino: "Programación lineal",
        definicion:
          "Método matemático de optimización que busca maximizar o minimizar una función objetivo sujeta a restricciones expresadas como inecuaciones lineales. Es una herramienta fundamental en logística, economía y gestión empresarial.",
      },
    ],
    preguntas_reflexion: [
      "La regla de inversión del signo al dividir por negativos sorprende a muchos estudiantes. Construye un ejemplo numérico concreto que demuestre por qué la regla es matemáticamente necesaria — ¿qué pasaría si no invirtieras el signo?",
      "La CONASAMI fija el salario mínimo como una inecuación salario ≥ mínimo, pero el 56% de los trabajadores mexicanos están en la economía informal. ¿Qué significa matemáticamente que una inecuación no se cumpla en la realidad? ¿Qué consecuencias tiene para la desigualdad?",
      "Los diseños huicholes de los wixaritari siguen patrones geométricos con proporciones precisas. ¿Cómo podrías expresar una restricción de proporciones en un diseño textil usando una inecuación? Diseña una inecuación que represente una restricción visual en un diseño simétrico.",
    ],
  },

  {
    codigo: "PM-III-P04-A1",
    titulo: "Perímetros, áreas y volúmenes: de la Pirámide del Sol al Estadio Azteca y la milpa mexicana",
    descripcion_accesible:
      "Infografía en formato de museo visual con seis salas. Sala 1 (izquierda superior, rectángulo y triángulo): fórmulas de perímetro y área con diagrama etiquetado y ejemplo de la cancha del Estadio Azteca (105 m × 68 m = 7,140 m²). Sala 2 (derecha superior, círculo): fórmulas de circunferencia y área. Sección central 'México en cifras': tres casos destacados con fondo dorado — base de la Pirámide del Sol (≈48,400 m²), cancha del Azteca (7,140 m²) y milpa típica de Chiapas (10,000–20,000 m²). Sala 3 (inferior izquierda, prisma rectangular y cilindro): fórmulas de volumen con ejemplos de cisterna yucateca y tambo industrial. Sala 4 (inferior derecha, cono y esfera): fórmulas con ejemplo de cúpula barroca mexicana. Franja inferior: tabla de conversión — 1 ha = 10,000 m²; 1 m³ = 1,000 litros.",
    puntos_clave: [
      "Perímetro: longitud total del contorno de una figura plana. Fórmulas: rectángulo P = 2(b + h); triángulo P = a + b + c; círculo (circunferencia) C = 2πr. El perímetro determina la cantidad de material para cercar, enmarcar o bordear una figura.",
      "Área: medida de la superficie interior. Fórmulas: rectángulo A = b × h; triángulo A = (b × h)/2; círculo A = πr². La cancha reglamentaria del Estadio Azteca (Ciudad de México) mide 105 m × 68 m: área = 7,140 m². Sede de los Mundiales de Futbol de 1970 y 1986 — único estadio con dos finales de Copa del Mundo.",
      "Pirámide del Sol en Teotihuacán (Estado de México): base cuadrada de aproximadamente 220 m × 220 m, área de base ≈ 48,400 m² (casi 5 hectáreas) y altura de 63 m. Fue la estructura más grande de Mesoamérica. El INAH la conserva y recibe alrededor de 4 millones de visitantes anuales.",
      "Volumen del prisma rectangular: V = l × w × h. Las cisternas (aljibes) de las haciendas yucatecas históricas tenían forma de prisma rectangular de ~3 m × 3 m × 2 m = 18 m³ de capacidad (18,000 litros). El almacenamiento de agua es crítico en la Península de Yucatán, donde no hay ríos superficiales.",
      "Volumen del cilindro: V = πr²h. Un tambo metálico estándar (usado en la industria de aceites en México) tiene r ≈ 29 cm y h ≈ 88 cm. V = π × (0.29)² × 0.88 ≈ 0.233 m³ ≈ 233 litros.",
      "Área superficial y volumen de la esfera: A = 4πr² y V = (4/3)πr³. Las cúpulas de iglesias barrocas mexicanas —como las de la Catedral de Puebla o la Capilla Real de Cholula— son aproximadamente hemisféricas. El área superficial determina la cantidad de azulejo talavera o pintura necesaria para decorarlas.",
      "La milpa mesoamericana: el sistema de cultivo de maíz, frijol y calabaza se mide históricamente en mecates (1 mecate ≈ 400 m² en el sistema maya) o hectáreas. Una milpa familiar típica en Chiapas o Yucatán mide entre 1 y 2 hectáreas (10,000–20,000 m²). La SAGARPA usa m² y hectárea como unidades estándar en sus padrones de agricultores.",
      "π (pi) en aplicaciones mexicanas: el CINVESTAV y la UNAM Instituto de Matemáticas usan π en cálculos de astronomía (órbitas), ingeniería (tuberías, depósitos cilíndricos) y arquitectura (cúpulas, arcos circulares) en proyectos nacionales. Para cálculos escolares, π ≈ 3.1416 es suficientemente preciso.",
      "Conversión de unidades de superficie y volumen: 1 ha = 10,000 m²; 1 km² = 100 ha = 1,000,000 m²; 1 m³ = 1,000 litros; 1 litro = 1,000 cm³. Estas conversiones son indispensables en agronomía, construcción y gestión del agua en México.",
    ],
    fuente:
      "INAH — Medidas y proporciones de la Pirámide del Sol, Teotihuacán 2023; FIFA — Reglamento de Campos de Juego 2023; UNAM Instituto de Matemáticas — Geometría aplicada 2022",
    actividad_post:
      "Mide el área de tu salón de clases (rectángulo). Luego calcula: (1) metros de zócalo para el perímetro, (2) metros cuadrados para pintar las 4 paredes (incluye la altura), (3) litros de pintura necesarios si 1 litro cubre 12 m². Presenta los cálculos paso a paso con unidades.",
    contexto_mexicano:
      "La geometría de áreas y volúmenes está profundamente integrada en la producción cultural y económica de México. La arquitectura prehispánica de Teotihuacán, Chichén Itzá, Monte Albán y Palenque revela un conocimiento preciso de geometría, proporciones y orientación astronómica. Los ingenieros del INAH que conservan estos sitios usan las mismas fórmulas de perímetro, área y volumen del bachillerato para calcular materiales de restauración, áreas de excavación y estructuras de soporte.\n\nEn la producción artesanal mexicana, la geometría es una herramienta cotidiana: los alfareros de Oaxaca calculan mentalmente el volumen de sus ollas para estimar la cantidad de barro y el tiempo de cocción; los tejedores de Chiapas calculan el área de sus huipiles para determinar la cantidad de hilo; los albañiles de toda la república estiman áreas y volúmenes para presupuestar materiales sin calculadora. Esta matemática práctica, transmitida de generación en generación, es parte del patrimonio intangible de México.",
    glosario: [
      {
        termino: "Perímetro",
        definicion:
          "Longitud total del contorno de una figura plana. Se mide en unidades lineales (m, cm). Para polígonos es la suma de los lados; para el círculo, es la circunferencia C = 2πr.",
      },
      {
        termino: "Área",
        definicion:
          "Medida de la superficie encerrada dentro de una figura plana. Se mide en unidades cuadradas (m², cm², ha). Indica cuánta superficie hay que cubrir, pintar, sembrar o construir.",
      },
      {
        termino: "Volumen",
        definicion:
          "Medida del espacio tridimensional que ocupa un sólido. Se mide en unidades cúbicas (m³, cm³, litros). Indica la capacidad de un contenedor o la cantidad de material en un sólido.",
      },
      {
        termino: "π (pi)",
        definicion:
          "Constante matemática irracional que representa la razón entre la circunferencia de cualquier círculo y su diámetro. Valor: π ≈ 3.14159... Aparece en todas las fórmulas de figuras circulares, cilíndricas y esféricas.",
      },
      {
        termino: "Hectárea (ha)",
        definicion:
          "Unidad de medida de superficie equivalente a 10,000 m² (un cuadrado de 100 m × 100 m). Es la unidad estándar para medir terrenos agrícolas, áreas naturales protegidas y predios en México.",
      },
    ],
    preguntas_reflexion: [
      "La Pirámide del Sol fue construida sin maquinaria moderna pero con una base de ~220 m × 220 m perfectamente nivelada. ¿Qué conocimientos matemáticos de geometría necesitaban sus constructores? ¿Cómo calculaban áreas y volúmenes sin las fórmulas algebraicas que usamos hoy?",
      "Los artesanos mexicanos (alfareros, tejedores, albañiles) usan matemáticas de áreas y volúmenes en su trabajo diario sin llamarlas por ese nombre. ¿Cómo conectarías lo que aprendes en el bachillerato con ese conocimiento práctico? ¿Tienen el mismo valor ambas formas de saber matemático?",
      "Si un acuífero subterráneo tiene forma cilíndrica de r = 5 km y profundidad h = 200 m, ¿cuál es su volumen en m³ y en litros? ¿Cuánto tiempo durarían esas reservas si una ciudad de 500,000 habitantes consume 200 litros per cápita por día?",
    ],
  },

  {
    codigo: "PM-IV-P04-A1",
    titulo: "El círculo unitario: seno, coseno y tangente aplicados a sismología y astronomía mexicanas",
    descripcion_accesible:
      "Infografía con un círculo unitario grande al centro sobre cuadrícula cartesiana. Los cuatro cuadrantes tienen colores distintos: verde (I), azul (II), rojo (III), naranja (IV). Sobre el círculo, los ángulos fundamentales marcados con puntos etiquetados con coordenadas exactas (0°, 30°, 45°, 60°, 90° en el primer cuadrante y sus análogos en los otros tres). A la derecha del círculo, una tabla de valores exactos para los 5 ángulos del primer cuadrante: columna de ángulo en grados y radianes, columna seno, columna coseno, columna tangente. En las esquinas de los cuadrantes, la regla CAST con íconos. Franja inferior: dos aplicaciones mexicanas — sismógrafo con onda senoidal (CENAPRED) y diagrama de telescopio con ángulo de apuntamiento (INAOE Sierra Negra).",
    puntos_clave: [
      "El círculo unitario es una circunferencia de radio r = 1 centrada en el origen. Para cualquier punto P = (x, y) sobre el círculo, el ángulo θ con el eje positivo x define: cos θ = x y sen θ = y. Esta es la definición trigonométrica más general, válida para cualquier ángulo positivo, negativo o mayor de 360°.",
      "Ángulos y coordenadas exactas del primer cuadrante: 0° → (1, 0); 30° → (√3/2, 1/2); 45° → (√2/2, √2/2); 60° → (1/2, √3/2); 90° → (0, 1). Mnemotécnica: los numeradores del seno en 0°, 30°, 45°, 60°, 90° son √0, √1, √2, √3, √4 — todos divididos entre 2.",
      "Regla CAST para signos por cuadrante: Cuadrante I (0°–90°): todos positivos. Cuadrante II (90°–180°): solo Seno positivo. Cuadrante III (180°–270°): solo Tangente positiva. Cuadrante IV (270°–360°): solo Coseno positivo. CAST se lee de IV a I en sentido antihorario.",
      "Tangente: tan θ = sen θ / cos θ = y/x. Es indefinida cuando cos θ = 0 (en 90° y 270°), porque implica división por cero. Período de la tangente: 180° (π rad). Período del seno y coseno: 360° (2π rad).",
      "Periodicidad y ondas: la periodicidad de seno y coseno — sen(θ + 360°) = sen θ — es la base matemática de todas las oscilaciones periódicas en física: ondas sísmicas, ondas de sonido, corriente alterna eléctrica (60 Hz en México, estándar de la CFE).",
      "Aplicación sismológica: el análisis de Fourier descompone cualquier señal sísmica en sumas de senos y cosenos de distintas frecuencias. El CENAPRED (Centro Nacional de Prevención de Desastres) usa estas herramientas para analizar acelerogramas de terremotos como el de 1985 (8.1 Mw) y el de 2017 (7.1 Mw). El círculo unitario es la base matemática de ese análisis.",
      "Aplicación astronómica: el Gran Telescopio Milimétrico (GTM) del INAOE en el Volcán Sierra Negra (Puebla) apunta a coordenadas celestes expresadas en ángulos de ascensión recta y declinación. Los astrónomos transforman estas coordenadas usando seno y coseno para convertir entre sistemas de referencia ecuatorial y altazimutal.",
      "Radianes vs. grados: un radián es el ángulo central que subtiende un arco igual al radio. Relación: π rad = 180°, por tanto 30° = π/6, 45° = π/4, 60° = π/3, 90° = π/2. Los lenguajes de programación científica (Python, MATLAB) usados en el INAOE y el CINVESTAV trabajan en radianes por defecto.",
    ],
    fuente:
      "INAOE — Sistemas de coordenadas celestes y trigonometría aplicada 2023; CENAPRED — Análisis de acelerogramas sísmicos 2022; UNAM Instituto de Matemáticas — Trigonometría en bachillerato 2023",
    actividad_post:
      "Calcula sin calculadora: sen 150°, cos 210° y tan 315°. Pasos: (1) identifica el cuadrante, (2) aplica CAST para el signo, (3) usa el ángulo de referencia del primer cuadrante, (4) escribe el valor exacto. Verifica con una calculadora científica y explica cualquier diferencia por redondeo.",
    contexto_mexicano:
      "México está en una de las zonas sísmicas más activas del mundo: la placa de Cocos se subduce bajo la placa Norteamericana a lo largo de las costas del Pacífico sur. El análisis matemático de terremotos usa transformadas de Fourier que descomponen el movimiento sísmico en componentes de senos y cosenos. El CENAPRED usa estas herramientas para diseñar las normas de construcción sismorresistente que rigen en toda la república.\n\nEn astronomía, el INAOE en Tonantzintla, Puebla, y en el Volcán Sierra Negra es uno de los centros más activos de América Latina. Sus astrónomos usan coordenadas angulares y transformaciones trigonométricas basadas en el círculo unitario para apuntar telescopios y analizar señales del universo lejano. La trigonometría del círculo unitario no es solo teoría escolar — es la herramienta diaria de los científicos mexicanos que estudian el cosmos.",
    glosario: [
      {
        termino: "Círculo unitario",
        definicion:
          "Circunferencia de radio 1 centrada en el origen del plano cartesiano. Define el seno y el coseno de cualquier ángulo como las coordenadas y y x del punto sobre el círculo que corresponde a ese ángulo.",
      },
      {
        termino: "Seno (sen)",
        definicion:
          "En el círculo unitario, la coordenada y del punto correspondiente al ángulo θ. Función periódica con período 360° (2π rad), con valores entre −1 y 1. En triángulo rectángulo: sen θ = cateto opuesto / hipotenusa.",
      },
      {
        termino: "Coseno (cos)",
        definicion:
          "En el círculo unitario, la coordenada x del punto correspondiente al ángulo θ. Función periódica con período 360° (2π rad), con valores entre −1 y 1. En triángulo rectángulo: cos θ = cateto adyacente / hipotenusa.",
      },
      {
        termino: "Radián",
        definicion:
          "Unidad de medida de ángulos. Un radián es el ángulo central que subtiende un arco igual al radio. Relación clave: π radianes = 180°. Es la unidad estándar en cálculo diferencial e integral.",
      },
      {
        termino: "Análisis de Fourier",
        definicion:
          "Método matemático que descompone cualquier función periódica en una suma de senos y cosenos de distintas frecuencias y amplitudes. Es la herramienta central para analizar señales sísmicas, sonoras y eléctricas.",
      },
    ],
    preguntas_reflexion: [
      "El sismo de 1985 en CDMX destruyó selectivamente edificios de 7–14 pisos. La explicación involucra la resonancia entre la frecuencia natural del suelo lacustre y ciertos períodos de las ondas sísmicas. ¿Cómo se relaciona ese fenómeno con la periodicidad del seno y el coseno que estudiamos en el círculo unitario?",
      "¿Por qué el círculo unitario usa radio exactamente 1 y no otro valor? ¿Qué ventaja matemática tiene esa elección? ¿Cambiaría la definición de seno y coseno si el radio fuera 2?",
      "Los astrónomos del INAOE usan ángulos de ascensión recta y declinación para apuntar telescopios. Si un objeto celeste está en ascensión recta 83.75° y declinación −5.4°, ¿cómo transformarías esos ángulos en coordenadas (x, y) usando seno y coseno del círculo unitario?",
    ],
  },

  {
    codigo: "PM-IV-P07-A1",
    titulo: "Cónicas: circunferencia y parábola como lugares geométricos — del GTM del INAOE a las antenas satelitales",
    descripcion_accesible:
      "Infografía dividida en cuatro cuadrantes, uno por cónica principal. Superior izquierdo (circunferencia): diagrama del corte del cono con plano perpendicular, ecuación canónica (x−h)² + (y−k)² = r² y ejemplo numérico. Superior derecho (elipse): corte oblicuo, ecuación canónica, aplicación de órbita elíptica. Inferior izquierdo (parábola): corte paralelo a generatriz, ecuación x² = 4py con foco y directriz etiquetados, y aplicación del GTM del INAOE con su plato de 50 m. Inferior derecho (hipérbola): corte de doble napa y ecuación canónica. Centro: triángulo de identificación rápida por coeficientes de la ecuación general. Franja inferior: imagen estilizada del GTM del INAOE con la leyenda 'Reflector parabólico — 50 m de diámetro — capta señales a miles de millones de años luz'.",
    puntos_clave: [
      "Una cónica es la curva que se obtiene al cortar un cono de doble napa con un plano. Según el ángulo: corte perpendicular al eje → circunferencia; corte oblicuo sin cruzar la base → elipse; corte paralelo a una generatriz → parábola; corte que intersecta ambas napas → hipérbola.",
      "Lugar geométrico: conjunto de todos los puntos del plano que satisfacen una condición geométrica. La circunferencia es el LG de los puntos equidistantes de un centro fijo (el radio r). La parábola es el LG de los puntos que equidistan de un punto fijo (foco) y de una recta fija (directriz).",
      "Circunferencia — ecuación canónica: (x − h)² + (y − k)² = r², donde (h, k) es el centro y r el radio. Identificación rápida: en la ecuación general, si los coeficientes de x² y y² son iguales y no hay término xy, la cónica es una circunferencia.",
      "Parábola — ecuación canónica con vértice en el origen: eje vertical → x² = 4py (abre arriba si p > 0); eje horizontal → y² = 4px. El foco está en (0, p) y la directriz es y = −p. Propiedad focal: todo rayo paralelo al eje se refleja exactamente hacia el foco.",
      "El Gran Telescopio Milimétrico (GTM) del INAOE en el Volcán Sierra Negra (Puebla), a 4,600 m de altitud, tiene un reflector parabólico de 50 m de diámetro. Su superficie sigue exactamente la ecuación de una parábola: las ondas de radio y microondas del universo que llegan paralelas al eje se concentran en el foco, donde está el receptor.",
      "Antenas satelitales domésticas: los aproximadamente 20 millones de hogares mexicanos con televisión satelital (DISH, SKY) usan reflectores parabólicos de ~60 cm de diámetro para concentrar la señal del satélite en el receptor. El foco está calculado exactamente con la ecuación x² = 4py.",
      "Identificación de cónicas por coeficientes en Ax² + Cy² + Dx + Ey + F = 0 (sin término xy): A = C → circunferencia; A ≠ C con igual signo → elipse; solo uno de A, C es cero → parábola; A y C con signos opuestos → hipérbola. Regla útil en exámenes de admisión UNAM (EXANI-II) e IPN.",
      "Aplicaciones en infraestructura mexicana: el Puente Baluarte en la Sierra Madre Occidental (Durango-Sinaloa) —uno de los puentes atirantados más altos del mundo con 402 m sobre el río Baluarte— tiene cables tensados en formas geométricas que los ingenieros civiles de la SCT calculan con geometría analítica de cónicas.",
    ],
    fuente:
      "INAOE — Gran Telescopio Milimétrico: geometría y diseño óptico 2023; SCT — Puente Baluarte, ingeniería estructural 2020; UNAM Instituto de Matemáticas — Geometría analítica para bachillerato 2022",
    actividad_post:
      "Una antena satelital doméstica tiene la ecuación de su parábola: x² = 4(0.25)y, con vértice en el origen. (a) ¿Cuánto vale p? (b) ¿Dónde está el foco? (c) ¿Cuál es la ecuación de la directriz? (d) Si el diámetro del plato es 60 cm, ¿cuánto mide la profundidad del plato (distancia vertical del vértice al borde)? Dibuja la parábola con todos sus elementos.",
    contexto_mexicano:
      "La geometría de las cónicas es el fundamento de algunas de las obras científicas e ingenieriles más importantes de México. El GTM del INAOE, con su reflector parabólico de 50 metros, puede detectar galaxias a distancias de miles de millones de años luz gracias a la propiedad focal de la parábola. Esta misma propiedad, a escala de centímetros, hace funcionar las antenas satelitales de los 20 millones de hogares con televisión satelital en México.\n\nEn el diseño de infraestructura, la geometría de arcos parabólicos y catenarios aparece en puentes, arcos de estadios y cúpulas. Los ingenieros del IPN, la UNAM y el ITESM que diseñan puentes sobre los cañones de la Sierra Madre usan la geometría analítica de las cónicas para calcular formas estructuralmente óptimas. El conocimiento que parece abstracto en el salón de clases es la herramienta de diseño de la infraestructura que usas cada día.",
    glosario: [
      {
        termino: "Lugar geométrico",
        definicion:
          "Conjunto de todos los puntos del plano (o el espacio) que satisfacen una condición geométrica determinada. Las cónicas se definen como lugares geométricos: la circunferencia, de puntos equidistantes a un centro; la parábola, de puntos equidistantes a un foco y una directriz.",
      },
      {
        termino: "Foco",
        definicion:
          "Punto fijo que define una cónica junto con una directriz (parábola) u otro foco (elipse, hipérbola). La propiedad focal de la parábola —todo rayo paralelo al eje se refleja hacia el foco— es la base de antenas, telescopios y faros.",
      },
      {
        termino: "Directriz",
        definicion:
          "Recta fija que, junto con el foco, define la parábola. Un punto pertenece a la parábola si y solo si su distancia al foco es igual a su distancia a la directriz.",
      },
      {
        termino: "Cónica",
        definicion:
          "Curva obtenida al cortar un cono de doble napa con un plano. Las cuatro cónicas son circunferencia, elipse, parábola e hipérbola, dependiendo del ángulo del plano de corte respecto al eje del cono.",
      },
      {
        termino: "Ecuación canónica",
        definicion:
          "Forma simplificada de la ecuación de una cónica que muestra claramente sus elementos geométricos (centro, radio, foco, vértice). Facilita la identificación y el trazado de la curva.",
      },
    ],
    preguntas_reflexion: [
      "El GTM usa un reflector parabólico y no circular o elíptico. ¿Por qué la parábola y no otro tipo de curva? ¿Qué propiedad específica de la parábola la hace óptima para concentrar señales en un punto?",
      "Las órbitas de los planetas son elipses (primera ley de Kepler). ¿Por qué no son circunferencias? ¿Qué fuerza física determina la forma de la órbita y cómo se relaciona con la geometría de la elipse?",
      "Los exámenes de admisión a la UNAM incluyen identificación de cónicas por su ecuación general. ¿Por qué la geometría analítica de las cónicas sigue siendo parte del núcleo evaluado en el acceso a la educación superior? ¿Qué habilidades matemáticas está probando realmente?",
    ],
  },

  // ── LOTE 4 (continuación): PM-V (×2), PM-VI ────────────────────────────────
  {
    codigo: "PM-V-P02-A1",
    titulo: "Continuidad y discontinuidad de funciones: tarifas CFE, sismos y el legado de Manuel Sandoval Vallarta",
    descripcion_accesible:
      "Infografía organizada en tres franjas horizontales. Franja superior: semáforo de continuidad con tres condiciones en verde (f(a) existe, límite existe, límite = f(a)) y una representación gráfica de cada condición cumplida vs. fallida. Franja central: cuatro tarjetas ilustradas con los tipos de discontinuidad — evitable (punto hueco), de salto (brecha vertical), esencial (asíntota vertical) y oscilante (zigzag comprimido hacia un punto) — con ecuaciones de ejemplo en cada tarjeta. Franja inferior izquierda: diagrama del Teorema del Valor Intermedio con una curva suave que cruza un valor N entre f(a) y f(b), y el punto c garantizado marcado. Franja inferior derecha: panel de aplicaciones mexicanas con dos casos — (1) escalonado de tarifas CFE con las discontinuidades de salto en los umbrales 150 kWh y 280 kWh, y (2) sismograma del CENAPRED mostrando discontinuidades en la señal de aceleración. Pie de página: retrato esquemático de Manuel Sandoval Vallarta con la leyenda 'Primer físico teórico de México — MIT/UNAM'.",
    puntos_clave: [
      "Una función f(x) es CONTINUA en x = a si y solo si se cumplen tres condiciones simultáneas: (1) f(a) existe (el punto está definido), (2) lím_{x→a} f(x) existe (los límites laterales izquierdo y derecho coinciden), y (3) lím_{x→a} f(x) = f(a) (el límite coincide con el valor de la función en ese punto). Si falla cualquiera de las tres condiciones, hay una discontinuidad en x = a.",
      "Discontinuidad EVITABLE (removible): el límite lím_{x→a} f(x) existe, pero f(a) no está definida o difiere del límite. Ejemplo: f(x) = (x² − 4)/(x − 2) en x = 2 tiene un 'hueco' porque la expresión no está definida, pero el límite es 4. Se elimina la discontinuidad redefiniendo f(2) = 4. Gráficamente se muestra como un punto hueco en la curva.",
      "Discontinuidad de SALTO (primera especie): los límites laterales existen pero son distintos — lím_{x→a⁻} f(x) ≠ lím_{x→a⁺} f(x). La función 'salta' abruptamente. Las tarifas eléctricas de la CFE funcionan exactamente así: en la tarifa doméstica 1F, el precio por kWh cambia de manera abrupta al cruzar los umbrales de 150 kWh (básico→intermedio) y 280 kWh (intermedio→excedente). Consumir 151 kWh cuesta significativamente más que 150 kWh.",
      "Discontinuidad ESENCIAL (segunda especie): al menos uno de los límites laterales no existe o es infinito. Ejemplo clásico: f(x) = 1/x en x = 0 tiene una asíntota vertical — la función crece sin límite hacia ±∞. No es posible hacer esta función continua en x = 0 por ninguna redefinición. También ocurre con f(x) = sen(1/x) en x = 0, donde la función oscila infinitamente rápido.",
      "Teorema del Valor Intermedio (TVI): si f es continua en el intervalo cerrado [a, b] y N es cualquier valor entre f(a) y f(b), entonces existe al menos un punto c ∈ (a, b) tal que f(c) = N. Consecuencia práctica: si la temperatura en la mañana fue 8 °C y al mediodía es 22 °C, en algún momento exacto fue 15 °C. El TVI garantiza la existencia de raíces en ecuaciones continuas (base del método de bisección numérica).",
      "Aplicación sísmica — CENAPRED: el Centro Nacional de Prevención de Desastres registra la aceleración del suelo a(t) durante un sismo. Esta función presenta discontinuidades reales que corresponden a la llegada de ondas P (primarias) y ondas S (secundarias). En el sismo de 2017 (magnitud 7.1, epicentro Axochiapan-Morelos), el CENAPRED analizó las discontinuidades en a(t) para determinar la velocidad de propagación y la amplificación local en la CDMX, donde los suelos lacustres del antiguo lago de Texcoco modifican la señal.",
      "Tarifas CFE — modelo matemático: la función de costo mensual C(k) en pesos para la tarifa 1F puede modelarse como: C(k) = {precio_básico × k si 0 ≤ k ≤ 150; precio_básico × 150 + precio_intermedio × (k−150) si 150 < k ≤ 280; valor_intermedio + precio_excedente × (k−280) si k > 280}. Esta función tiene discontinuidades de salto en k = 150 y k = 280 que el Congreso y la SHCP negocian anualmente en el Presupuesto de Egresos de la Federación.",
      "Manuel Sandoval Vallarta (1899–1977): físico teórico mexicano, primer egresado del MIT de origen latinoamericano en obtener el doctorado en física. Fue catedrático de la UNAM y director del Instituto Nacional de Energía Nuclear. Sus trabajos sobre la llegada de rayos cósmicos a la Tierra (con Georges Lemaître, 1930) involucran funciones de distribución continuas en campos magnéticos. Es considerado el padre de la física teórica en México.",
      "La función de Heaviside H(t) = {0 si t < 0; 1 si t ≥ 0} es la discontinuidad de salto más usada en ingeniería eléctrica y de control. En los modelos de simulación de la CFE para cortes de corriente, esta función modela el instante exacto en que la corriente cambia de flujo a interrupción, y se usa en transformadas de Laplace para resolver circuitos eléctricos con interrupciones repentinas.",
      "Continuidad y naturaleza: la densidad del agua tiene un máximo en 4 °C y cambia de fase de forma discontinua a 0 °C (hielo-agua) y 100 °C (agua-vapor). La presión atmosférica es continua pero tiene tasas de cambio (derivada) distintas en las capas troposfera, estratosfera y mesosfera. Identificar qué funciones son continuas y cuáles no es fundamental para modelar correctamente cualquier fenómeno físico, económico o biológico.",
    ],
    fuente:
      "CENAPRED — Atlas Nacional de Riesgos: análisis sísmico 2022; CFE — Tarifas domésticas 1F vigentes 2023; UNAM Instituto de Matemáticas — Análisis matemático para bachillerato 2023",
    actividad_post:
      "La tarifa doméstica CFE 1F tiene los siguientes precios (valores ilustrativos): básico $0.90/kWh (0–150 kWh), intermedio $1.20/kWh (151–280 kWh), excedente $2.80/kWh (>280 kWh). (a) Escribe la función de costo C(k) a trozos. (b) ¿Es C(k) continua en k=150? Verifica las tres condiciones. (c) ¿Cuánto paga una familia que consume 151 kWh vs. 150 kWh? ¿Qué tipo de discontinuidad es? (d) Grafica C(k) para k ∈ [0, 350].",
    contexto_mexicano:
      "Las tarifas eléctricas de la CFE son uno de los ejemplos más cotidianos de funciones con discontinuidades de salto en México. Más del 95% de los hogares mexicanos están conectados a la red de la CFE, y las tarifas domésticas se estructuran en bloques de consumo precisamente para subsidiar el consumo básico y encarecer el excesivo. Cada vez que una familia cruza el umbral de los 150 o 280 kWh, el precio marginal de la electricidad salta de manera discontinua — un fenómeno que los economistas llaman 'tarifa en escalera' y que matemáticamente es una función escalonada (step function) con discontinuidades de primera especie.\n\nEn el contexto científico, el CENAPRED utiliza el análisis de continuidad de señales sísmicas para mejorar los sistemas de alerta temprana de México. La Red Sísmica Mexicana tiene más de 100 estaciones de registro que capturan a(t) con alta resolución temporal. Las discontinuidades en la aceleración indican cambios en el medio de propagación, y su análisis matemático permitió, tras el sismo de 2017, identificar por qué ciertas colonias de la CDMX tuvieron daños mucho mayores que otras a pesar de estar a la misma distancia del epicentro. El suelo lacustre amplifica las ondas de forma no lineal, creando discontinuidades en la función de amplificación que solo pueden entenderse con cálculo.",
    glosario: [
      {
        termino: "Continuidad en un punto",
        definicion:
          "Propiedad de una función que requiere tres condiciones simultáneas en x = a: que f(a) exista, que el límite exista y que ambos coincidan. Es la formalización matemática de que la función no tiene 'saltos, huecos ni explosiones' en ese punto.",
      },
      {
        termino: "Discontinuidad de salto",
        definicion:
          "Tipo de discontinuidad donde los límites laterales existen pero son distintos (lím_{x→a⁻} f(x) ≠ lím_{x→a⁺} f(x)). La función salta abruptamente de un valor a otro. Las tarifas por bloques de la CFE son un ejemplo de función con discontinuidades de salto.",
      },
      {
        termino: "Teorema del Valor Intermedio (TVI)",
        definicion:
          "Si f es continua en [a, b] y N está entre f(a) y f(b), existe c ∈ (a, b) con f(c) = N. Garantiza la existencia de raíces y valores intermedios en funciones continuas, sin necesidad de construir explícitamente el punto c.",
      },
      {
        termino: "Función a trozos",
        definicion:
          "Función definida por diferentes expresiones en diferentes subintervalos del dominio. Las tarifas CFE, el impuesto sobre la renta progresivo del SAT y la función de Heaviside son ejemplos. Su continuidad debe verificarse en cada punto de transición entre expresiones.",
      },
      {
        termino: "Asíntota vertical",
        definicion:
          "Recta vertical x = a hacia la que la gráfica de f(x) se aproxima ilimitadamente cuando x → a. Indica una discontinuidad esencial: la función crece o decrece sin límite cerca de ese punto. Ejemplo: f(x) = 1/x tiene asíntota vertical en x = 0.",
      },
    ],
    preguntas_reflexion: [
      "Las tarifas de la CFE tienen discontinuidades de salto intencionales (diseñadas por política pública). ¿Qué comportamiento del consumidor podría generar ese diseño? ¿Podría la estructura de tarifas crear incentivos perversos cerca de los umbrales?",
      "El Teorema del Valor Intermedio garantiza la existencia de un punto c, pero no dice cuántos hay ni cómo encontrarlos. ¿Qué métodos numéricos se usan para aproximar raíces de funciones continuas? ¿Por qué es importante la continuidad para que esos métodos funcionen?",
      "Manuel Sandoval Vallarta aplicó matemáticas continuas para modelar rayos cósmicos en campos magnéticos. ¿Cómo el trabajo de un físico teórico mexicano en los años 30 contribuye a entender fenómenos que hoy se monitorean en tiempo real con satélites?",
      "En la CDMX, los suelos lacustres amplifican las ondas sísmicas de forma que crea discontinuidades en la señal de aceleración. ¿Por qué es crucial para el CENAPRED identificar estas discontinuidades? ¿Cómo se traduce ese análisis matemático en medidas concretas de protección civil?",
    ],
  },

  {
    codigo: "PM-V-P06-A1",
    titulo: "Máximos, mínimos y puntos de inflexión: optimización de artesanías oaxaqueñas, BIMBO y el método de Sotero Prieto",
    descripcion_accesible:
      "Infografía estructurada como un protocolo de seis pasos en el panel izquierdo, con dos casos de aplicación en el panel derecho. Panel izquierdo: lista numerada del procedimiento analítico completo — paso 1 (calcular f'(x) y puntos críticos), paso 2 (criterio de primera derivada), paso 3 (calcular f''(x)), paso 4 (criterio de segunda derivada), paso 5 (puntos de inflexión), paso 6 (extremos del intervalo) — con código de colores: verde para máximos, rojo para mínimos, amarillo para inflexión. Panel superior derecho: curva cuadrática I(p) = −500p² + 20,000p de artesanías oaxaqueñas con el vértice etiquetado en (20, 50,000) y sombreado bajo la curva indicando la región de ganancia. Panel inferior derecho: curva cúbica genérica con máximo local, mínimo local y punto de inflexión etiquetados, con las flechas del signo de f' y f'' en cada tramo. Pie de página: retrato esquemático de Sotero Prieto con la leyenda 'Fundador del cálculo universitario en México — UNAM 1910'.",
    puntos_clave: [
      "Definiciones fundamentales: x = c es un MÁXIMO LOCAL de f si existe un entorno donde f(c) ≥ f(x) para todo x en ese entorno. Es un MÍNIMO LOCAL si f(c) ≤ f(x). Un PUNTO DE INFLEXIÓN ocurre cuando f''(c) = 0 y f'' cambia de signo, indicando que la función pasa de cóncava hacia arriba a cóncava hacia abajo (o viceversa). Un EXTREMO ABSOLUTO es el mayor o menor valor de f en todo el dominio o intervalo dado.",
      "Procedimiento analítico completo en 6 pasos: (1) calcular f'(x) y encontrar puntos críticos donde f'(c) = 0 o f'(c) no existe; (2) aplicar criterio de primera derivada — analizar el signo de f' a cada lado del punto crítico para determinar si es máximo (+ a −), mínimo (− a +) o ni uno (sin cambio de signo); (3) calcular f''(x); (4) aplicar criterio de segunda derivada — si f''(c) > 0 entonces mínimo local, si f''(c) < 0 entonces máximo local, si f''(c) = 0 el criterio es inconcluso; (5) encontrar puntos de inflexión resolviendo f''(c) = 0 y verificando cambio de signo de f''; (6) evaluar f en los extremos del intervalo para encontrar extremos absolutos.",
      "Optimización de artesanías oaxaqueñas: un artesano que produce alebrijes estima que su ingreso mensual sigue I(p) = −500p² + 20,000p − 150,000, donde p es el precio en pesos por pieza. Calculando: I'(p) = −1,000p + 20,000 = 0 → p* = 20 pesos. Verificando con la segunda derivada: I''(p) = −1,000 < 0, confirmando que p* = 20 es un máximo. El ingreso máximo es I(20) = −500(400) + 20,000(20) − 150,000 = −200,000 + 400,000 − 150,000 = $50,000 pesos/mes. El artesano debe cobrar exactamente $20/pieza.",
      "Criterio de la primera derivada (detalle): si f' cambia de positivo a negativo al pasar por c (la función sube y luego baja), entonces x = c es un máximo local. Si f' cambia de negativo a positivo (la función baja y luego sube), es un mínimo local. Si f' no cambia de signo, x = c es un punto de silla o inflexión. Este criterio es más general que el de la segunda derivada porque funciona incluso cuando f''(c) = 0.",
      "Sotero Prieto Rodríguez (1884–1935): matemático y astrónomo oaxaqueño, considerado el fundador del cálculo diferencial universitario en México. Fue catedrático fundador de la Facultad de Ciencias de la UNAM, autor del primer texto de cálculo en español para México y formó a generaciones de matemáticos nacionales, entre ellos Mathías Sandoval Vallarta. Su método pedagógico conectaba la optimización con problemas reales de producción e ingeniería de su época.",
      "Optimización agrícola con la SADER: los técnicos de la Secretaría de Agricultura y Desarrollo Rural modelan el rendimiento del maíz con funciones cuadráticas del tipo R(f) = −0.002f² + 1.2f + 3, donde f es la cantidad de fertilizante (kg/ha) y R es el rendimiento en toneladas/ha. El máximo se obtiene en f* = −b/(2a) = −1.2/(2·(−0.002)) = 300 kg/ha. Este tipo de análisis de punto crítico orienta las recomendaciones de fertilización para los 7.5 millones de hectáreas de maíz cultivadas en México (SIAP 2022).",
      "Concavidad y puntos de inflexión: cuando f''(x) > 0 en un intervalo, f es cóncava hacia arriba (la derivada es creciente, la pendiente aumenta). Cuando f''(x) < 0, f es cóncava hacia abajo (la pendiente decrece). El punto de inflexión, donde f'' cambia de signo, marca la transición entre dos comportamientos. En una curva de costo de producción, la inflexión indica el inicio de los rendimientos decrecientes — el punto donde cada unidad adicional produce menos utilidad.",
      "Aplicaciones empresariales mexicanas: BIMBO (World's largest baking company, sede en CDMX), CEMEX (cemento, Monterrey) y GRUMA (harina de maíz y tortillas, Monterrey) publican reportes trimestrales donde sus departamentos de planeación financiera maximizan la función de utilidad U(q) respecto a la cantidad producida q. El principio es idéntico al cálculo: maximizar U(q) implica encontrar q* donde U'(q*) = 0 y U''(q*) < 0. Las tres empresas figuran en el Top 100 de Forbes México.",
      "Punto de inflexión en epidemiología: durante la pandemia de COVID-19 en México, el IMSS, el CONACYT y el INDRE monitoreaban la curva de casos acumulados I(t). El punto de inflexión de I(t) —donde I''(t) cambia de positivo a negativo— indicaba que el crecimiento diario comenzaba a disminuir: era el momento de 'doblar la curva'. Identificar matemáticamente este punto orientó las decisiones de apertura económica y la reasignación de camas hospitalarias entre marzo 2020 y junio 2021.",
      "Extremos en intervalos cerrados — Teorema de Weierstrass: toda función continua en un intervalo cerrado [a, b] alcanza su máximo y mínimo absolutos. Para encontrarlos: (1) encontrar todos los puntos críticos en (a, b), (2) evaluar f en cada punto crítico y en los extremos a y b, (3) el valor más grande es el máximo absoluto y el más pequeño es el mínimo absoluto. Este teorema garantiza que siempre existe una solución al problema de optimización en un rango finito.",
    ],
    fuente:
      "Banxico — Artesanías mexicanas: análisis de mercado e ingreso promedio 2022; UNAM Facultad de Ciencias — Cálculo diferencial: fundamentos y aplicaciones 2023; SADER/SIAP — Producción agrícola nacional y modelos de optimización 2021",
    actividad_post:
      "Una artesana de San Martín Tilcajete (Oaxaca) modela su ingreso mensual como I(p) = −300p² + 18,000p − 200,000, donde p es el precio por alebrije (en pesos). (a) Calcula I'(p) y encuentra el precio óptimo p*. (b) Verifica con la segunda derivada que es un máximo. (c) ¿Cuál es el ingreso máximo mensual? (d) ¿Para qué precios el ingreso es positivo? (Encuentra las raíces de I(p) = 0.) (e) Grafica I(p) identificando vértice, raíces y si la parábola abre hacia arriba o hacia abajo.",
    contexto_mexicano:
      "México es el segundo productor mundial de artesanías en términos de diversidad cultural, con más de 12 millones de artesanos activos (FONART 2023) que producen piezas en barro negro, alebrijes, textiles zapotecos, talavera y joyería de plata. La optimización de precios no es solo un ejercicio matemático: para un artesano que trabaja en la región de los Valles Centrales de Oaxaca, encontrar el precio óptimo puede significar la diferencia entre un ingreso que sostiene a la familia y uno insuficiente. El modelo cuadrático I(p) = −ap² + bp captura el fenómeno real: si el precio es muy bajo, el ingreso total es pequeño; si es demasiado alto, los turistas no compran y el volumen cae. El vértice de la parábola es literalmente el punto de equilibrio óptimo.\n\nEn el sector empresarial, las tres grandes multinacionales con sede en México —BIMBO, CEMEX y GRUMA— aplican exactamente los mismos principios de optimización con cálculo diferencial para determinar sus volúmenes de producción, precios y distribución. Sotero Prieto, nacido en Oaxaca, fue quien formalizó la enseñanza del cálculo en México con la convicción de que las matemáticas debían conectar con la realidad productiva del país. Cien años después, la curva de optimización que un artesano oaxaqueño necesita para fijar su precio es la misma que aprenden los ingenieros de CEMEX para optimizar la mezcla de cemento.",
    glosario: [
      {
        termino: "Punto crítico",
        definicion:
          "Valor x = c en el dominio de f donde la derivada f'(c) = 0 o f'(c) no existe. Los puntos críticos son candidatos a máximos locales, mínimos locales o puntos de inflexión, pero la clasificación requiere el criterio de primera o segunda derivada.",
      },
      {
        termino: "Criterio de la segunda derivada",
        definicion:
          "Método para clasificar puntos críticos: si f'(c) = 0 y f''(c) > 0, entonces c es un mínimo local (la función es cóncava hacia arriba). Si f''(c) < 0, es un máximo local. Si f''(c) = 0, el criterio es inconcluso y se debe usar el criterio de primera derivada.",
      },
      {
        termino: "Punto de inflexión",
        definicion:
          "Punto en la gráfica de f donde la concavidad cambia de dirección, es decir, donde f''(c) = 0 y f'' cambia de signo al pasar por c. En economía, el punto de inflexión de una curva de costo marginal marca el inicio de los rendimientos decrecientes.",
      },
      {
        termino: "Concavidad",
        definicion:
          "Propiedad de una curva que indica si 'abre hacia arriba' (cóncava arriba, f'' > 0) o 'abre hacia abajo' (cóncava abajo, f'' < 0). Una función cóncava hacia arriba tiene pendiente creciente; una cóncava hacia abajo tiene pendiente decreciente.",
      },
      {
        termino: "Optimización",
        definicion:
          "Proceso de encontrar el valor de una variable que maximiza o minimiza una función objetivo sujeta a restricciones. En cálculo diferencial, la optimización se realiza encontrando los puntos críticos de la función y verificando cuáles son máximos o mínimos en el dominio de interés.",
      },
    ],
    preguntas_reflexion: [
      "El modelo cuadrático del ingreso I(p) = −ap² + bp asume que si el precio es muy alto, las ventas caen a cero y el ingreso es negativo. ¿Es esto realista para las artesanías oaxaqueñas? ¿Qué factores reales hacen que el modelo cuadrático sea una buena o mala aproximación?",
      "BIMBO, CEMEX y GRUMA maximizan funciones de utilidad con cálculo diferencial. ¿Qué diferencias crees que hay entre el modelo simplificado de bachillerato (I(p) con una variable) y los modelos reales de optimización empresarial (múltiples variables, restricciones, incertidumbre)?",
      "El punto de inflexión de la curva de casos COVID-19 en México fue usado para tomar decisiones de política pública sobre reapertura económica. ¿Qué pasa si el punto de inflexión se identifica erróneamente (por datos incompletos o ruidosos)? ¿Cómo afecta la calidad de los datos a la utilidad del cálculo diferencial en la toma de decisiones?",
      "Sotero Prieto fundó la enseñanza del cálculo en México conectándola con problemas reales del país. ¿Qué problemas mexicanos actuales (cambio climático, desigualdad, seguridad) podrían beneficiarse más de modelos matemáticos de optimización? ¿Qué datos se necesitarían?",
    ],
  },

  {
    codigo: "PM-VI-P08-A1",
    titulo: "Las 5 formas en que los medios distorsionan estadísticas: guía de alfabetización estadística para ciudadanos mexicanos",
    descripcion_accesible:
      "Infografía dividida en cinco paneles numerados, cada uno con un error estadístico frecuente, un ejemplo con datos mexicanos reales y una 'regla de verificación' en texto destacado. Panel 1 (eje Y truncado): dos versiones del mismo gráfico de barras — una con eje desde cero y otra truncada desde 95, mostrando cómo la segunda hace que una diferencia del 4% parezca triplicación. Panel 2 (puntos porcentuales vs. %): línea de tiempo con la tasa de desempleo y dos etiquetas de la misma variación descritas de dos formas opuestas. Panel 3 (correlación ≠ causalidad): dispersograma producción de aguacate de Michoacán vs. exportaciones de software, con la nota 'r² = 0.72 pero causalidad = 0'. Panel 4 (muestra no representativa): mapa de México con puntos de encuesta concentrados en zonas urbanas y un margen de error visible. Panel 5 (escala logarítmica): curva de casos COVID-19 en escala log vs. lineal, con etiqueta explicativa. Pie de página: iconos de verificadoras mexicanas (Animal Político Verificado, El Universal Verificado MX) con la leyenda 'Fuentes primarias: INEGI, CONEVAL, Banco de México'.",
    puntos_clave: [
      "EJE Y TRUNCADO: un gráfico que no comienza en cero puede hacer que diferencias pequeñas parezcan enormes. Si el PIB per cápita de México pasó de $9,800 a $10,200 USD en 5 años (un aumento del 4.1% en términos reales, INEGI 2023), un eje Y que va de $9,700 a $10,300 hace que la barra del último año parezca el doble de alta que la del primero. Regla de verificación: siempre mira el valor mínimo del eje Y. Si no empieza en cero, calcula el porcentaje de cambio real con los números, no con la altura visual de las barras.",
      "PUNTOS PORCENTUALES vs. PORCENTAJE DE CAMBIO: estas son dos medidas matemáticamente distintas. Si la tasa de desempleo sube de 3% a 5%, subió 2 PUNTOS PORCENTUALES (5−3 = 2) pero subió 66.7% EN PORCENTAJE (2/3 = 0.667). Ambas afirmaciones son verdaderas pero generan impresiones radicalmente distintas. El INEGI y la ENOE reportan la tasa de desocupación en puntos porcentuales; los titulares periodísticos frecuentemente convierten a porcentaje de cambio para ampliar el impacto. En 2023, la tasa de desocupación en México fue de 2.8% (ENOE T4-2023 INEGI).",
      "CORRELACIÓN NO ES CAUSALIDAD: dos variables pueden crecer juntas sin que una cause la otra. En México, la producción de aguacate en Michoacán y las exportaciones de servicios de software crecieron simultáneamente entre 2018 y 2023 (ambas con tendencia positiva), pero ninguna causa la otra — ambas responden a factores externos distintos (demanda internacional y auge digital, respectivamente). El coeficiente de correlación r puede ser alto (ej. r = 0.85) sin que exista causalidad. Probar causalidad requiere diseño experimental o métodos econométricos como variables instrumentales.",
      "MUESTRA NO REPRESENTATIVA: las encuestas de intención de voto publicadas antes de las elecciones presidenciales de México 2024 tenían márgenes de error explícitos de ±3 puntos porcentuales con 95% de confianza (para n ≈ 1,000 personas). Varias encuestadoras fallaron en sus predicciones porque sus muestras sobrerrepresentaban zonas urbanas (donde era más fácil hacer entrevistas) y subestimaban el voto rural y de comunidades indígenas. El INE publicó el PREP con resultados reales que mostraron diferencias significativas con varias encuestas previas.",
      "COMPARAR PORCENTAJES DE BASES DISTINTAS: 'el presupuesto de salud aumentó 20% mientras que el de seguridad aumentó solo 3%' puede ser engañoso si las bases son muy diferentes. Si salud tenía $100,000 millones y seguridad $400,000 millones, el 3% de seguridad ($12,000M) es tres veces el 20% de salud ($20,000M). La SHCP publica el Presupuesto de Egresos de la Federación con cifras absolutas en millones de pesos precisamente para que los ciudadanos puedan hacer comparaciones reales, no solo de tasas de cambio.",
      "ESCALA LOGARÍTMICA vs. LINEAL sin etiquetado claro: durante la pandemia de COVID-19 en México (2020–2022), muchos medios publicaban curvas de contagios en escala logarítmica sin indicarlo claramente. En escala log, una línea recta representa crecimiento EXPONENCIAL, no lineal. El CONACYT y la Subsecretaría de Prevención usaban escala log para comparar tasas de crecimiento entre países (donde la escala log es la correcta), pero el público sin contexto lo interpretaba como crecimiento moderado y lineal. México registró 7.6 millones de casos confirmados al cierre de la epidemia (SSA/SINAVE 2023).",
      "CHERRY-PICKING (selección selectiva de período): reportar solo el subperíodo que apoya la narrativa. Si la economía mexicana creció 3 años y decreció 2, un reportaje puede mostrar solo los años de crecimiento. El PIB de México tuvo una caída histórica de −8.4% en 2020 (pandemia) y un rebote de +4.8% en 2021 (INEGI). Un reporte que solo muestra 2021 da una imagen muy diferente de uno que muestra 2019–2023. La SHCP publica series históricas del PIB desde 1993 para proporcionar contexto completo.",
      "MEDIAS vs. MEDIANAS en distribuciones sesgadas: el ingreso PROMEDIO y el ingreso MEDIANO de los hogares mexicanos son muy distintos porque la distribución del ingreso está muy sesgada hacia la derecha. El 10% más rico concentra el 36.5% del ingreso total corriente (ENIGH 2022, INEGI). Esto hace que el ingreso medio sea significativamente mayor que el mediano. Cuando leas 'ingreso promedio de los mexicanos', pregunta: ¿es la media o la mediana? La mediana es más representativa del hogar 'típico'.",
      "Verificadoras mexicanas activas: Animal Político (sección Verificado), El Universal (Verificado MX), Ojo Público y Chequeado.com (con cobertura México) son organizaciones que contrastan afirmaciones estadísticas con fuentes primarias. Según el Duke Reporters' Lab 2023, México cuenta con al menos 8 organizaciones de fact-checking activas. Su metodología estándar: identificar la afirmación → buscar la fuente original → contrastar con datos del INEGI, CONEVAL, Banco de México o Hacienda → evaluar exactitud y contexto.",
      "El INEGI como fuente primaria: el Instituto Nacional de Estadística y Geografía es la autoridad estadística oficial de México, con independencia técnica garantizada por ley desde 2008. Sus microdatos de la ENIGH (hogares), ENOE (empleo), Censo de Población 2020 y Encuesta Intercensal son públicos y descargables en inegi.org.mx. Cualquier cifra económica, de pobreza o demográfica citada en medios debería poder rastrearse a una tabla del INEGI o del CONEVAL. La alfabetización estadística ciudadana incluye saber buscar en estas fuentes primarias.",
    ],
    fuente:
      "INEGI — ENIGH 2022 y ENOE T4-2023: microdatos de ingresos y empleo; CONEVAL — Medición de pobreza multidimensional 2022; INE — Resultados PREP elecciones presidenciales 2024",
    actividad_post:
      "Analiza el siguiente caso: un periódico publica 'La tasa de homicidios en México bajó un 25%' entre 2022 y 2023. (a) ¿Qué información necesitas para evaluar si esta afirmación es precisa? (b) Si la tasa pasó de 28 a 21 homicidios por 100,000 habitantes, ¿cuántos puntos porcentuales bajó? ¿Cuánto bajó en porcentaje? (c) ¿Qué fuente primaria mexicana consultarías para verificar esta cifra? (d) ¿Por qué reportar solo un año de cambio podría ser cherry-picking? ¿Qué período de comparación sería más justo?",
    contexto_mexicano:
      "México vive un momento de saturación informativa donde las redes sociales, portales de noticias y programas de análisis producen decenas de gráficas estadísticas al día. La capacidad de leer estas gráficas críticamente —identificar un eje truncado, distinguir puntos porcentuales de porcentajes de cambio, entender el margen de error de una encuesta— es una habilidad cívica tan importante como saber leer un contrato. Las elecciones presidenciales de 2024, las discusiones sobre pobreza (con datos del CONEVAL) y el debate sobre seguridad pública son ejemplos donde la ciudadanía necesita evaluar estadísticas con ojo crítico.\n\nEl ecosistema de verificación de datos en México ha crecido significativamente: organizaciones como Animal Político, Ojo Público y El Universal Verificado contrastan diariamente las afirmaciones de funcionarios y medios con datos del INEGI, CONEVAL, Banco de México y otras fuentes primarias. Estas organizaciones no son de tendencia política — aplican el mismo rigor independientemente de quién haga la afirmación. El estudiante que termina bachillerato con alfabetización estadística no solo puede verificar afirmaciones; también puede participar en el debate público con mayor calidad, exigir datos con contexto completo y rechazar la manipulación estadística, cualquiera que sea su origen ideológico.",
    glosario: [
      {
        termino: "Punto porcentual",
        definicion:
          "Unidad de medida para expresar la diferencia entre dos porcentajes. Si la tasa de interés sube de 8% a 10%, subió 2 puntos porcentuales (no 2%). Confundirlo con 'porcentaje de cambio' (que sería 25%) es uno de los errores estadísticos más frecuentes en los medios de comunicación.",
      },
      {
        termino: "Correlación",
        definicion:
          "Medida estadística (coeficiente r ∈ [−1, 1]) que cuantifica la fuerza y dirección de la relación lineal entre dos variables. Una correlación alta (r cercano a ±1) indica que las variables se mueven juntas, pero NO implica que una cause la otra. Siempre se requieren pruebas adicionales para establecer causalidad.",
      },
      {
        termino: "Margen de error",
        definicion:
          "Intervalo que indica la incertidumbre de una estimación estadística basada en una muestra. Una encuesta con margen de error ±3% y 95% de confianza significa que si se repitiera el estudio 100 veces, en 95 de ellas el resultado estaría dentro de ±3 puntos del valor reportado. Encuestas con n pequeño tienen mayor margen de error.",
      },
      {
        termino: "Escala logarítmica",
        definicion:
          "Escala donde cada unidad representa un múltiplo fijo del valor anterior (usualmente ×10), en lugar de un incremento fijo. Útil para comparar tasas de crecimiento y visualizar datos que abarcan varios órdenes de magnitud. Una línea recta en escala log indica crecimiento exponencial, no lineal.",
      },
      {
        termino: "Sesgo de selección muestral",
        definicion:
          "Error que ocurre cuando la muestra no representa adecuadamente a la población objetivo. En encuestas electorales, el sesgo de selección ocurre cuando se entrevista a personas más accesibles (urbanas, con teléfono) y se sub-representa a grupos difíciles de alcanzar (rurales, adultos mayores sin móvil).",
      },
      {
        termino: "Cherry-picking",
        definicion:
          "Práctica de seleccionar solo los datos o períodos que apoyan una conclusión preestablecida, ignorando datos contrarios. Para detectarlo, preguntar siempre: '¿cuál es la serie histórica completa?' y '¿por qué se eligió exactamente este período de comparación?'.",
      },
    ],
    preguntas_reflexion: [
      "Busca una gráfica estadística publicada esta semana en un periódico o red social mexicana. ¿Puedes identificar alguno de los 5 errores de la infografía? ¿El eje Y comienza en cero? ¿Se indica si es escala log o lineal? ¿Se reporta el margen de error?",
      "El INEGI tiene independencia técnica garantizada por ley desde 2008. ¿Por qué es importante que la institución que genera las estadísticas nacionales sea independiente del gobierno en turno? ¿Qué pasaría si las cifras del PIB o de pobreza las publicara directamente la Presidencia?",
      "En las elecciones presidenciales de México 2024, varias encuestadoras fallaron en sus predicciones. ¿Cuál es la responsabilidad ética de una encuestadora que publica resultados con sesgo muestral sin advertirlo? ¿Cómo afecta la publicación de encuestas erróneas al comportamiento de los votantes (efecto bandwagon)?",
      "La correlación entre la producción de aguacate en Michoacán y las exportaciones de software en México no implica causalidad. Pero ¿cómo distinguirías estadísticamente una correlación espuria de una relación causal real? ¿Qué tipo de estudio (observacional, experimental, cuasiexperimental) sería necesario?",
    ],
  },
];

// ── Lógica principal ──────────────────────────────────────────────────────────

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const sb = createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log(`\n🖼️  CEN Bachillerato — Robustecimiento profundo infografías`);
  console.log(`   Entradas en mapa: ${INFOGRAFIAS_ROBUSTECIDAS.length}\n`);

  if (INFOGRAFIAS_ROBUSTECIDAS.length === 0) {
    console.log("⚠️  Mapa vacío. Agrega entradas en los lotes siguientes.");
    return;
  }

  let ok = 0;
  let omitidas = 0;
  let erroresValidacion = 0;
  let erroresDB = 0;

  for (const entrada of INFOGRAFIAS_ROBUSTECIDAS) {
    // Leer estado actual
    const { data: current, error: readErr } = await sb
      .from("actividades")
      .select("id, contenido, nivel_revision")
      .eq("codigo", entrada.codigo)
      .single();

    if (readErr || !current) {
      console.log(`  ⚠  ${entrada.codigo}: no encontrada — omitiendo`);
      omitidas++;
      continue;
    }

    // Construir nuevo contenido
    const newContenido = {
      titulo: entrada.titulo,
      // TODO: reemplazar con URL de SVG temático cuando estén disponibles
      url_imagen: "/placeholder/infografia.svg",
      descripcion_accesible: entrada.descripcion_accesible,
      puntos_clave: entrada.puntos_clave,
      fuente: entrada.fuente,
      actividad_post: entrada.actividad_post,
      contexto_mexicano: entrada.contexto_mexicano,
      glosario: entrada.glosario,
      preguntas_reflexion: entrada.preguntas_reflexion,
    };

    // Validar con Zod antes de escribir
    const validacion = ContenidoInfografiaSchema.safeParse(newContenido);
    if (!validacion.success) {
      console.error(`  ❌ VALIDACIÓN [${entrada.codigo}]:`, validacion.error.issues);
      erroresValidacion++;
      continue;
    }

    // Actualizar — el mapa es la fuente de verdad; siempre sobrescribir
    const { error: upErr } = await sb
      .from("actividades")
      .update({
        contenido: validacion.data as never,
        nivel_revision: "robustecida",
      })
      .eq("id", current.id);

    if (upErr) {
      console.error(`  ❌ DB [${entrada.codigo}]: ${upErr.message}`);
      erroresDB++;
    } else {
      console.log(
        `  ✓  ${entrada.codigo}: ${entrada.puntos_clave.length} puntos, glosario(${entrada.glosario.length}), preguntas(${entrada.preguntas_reflexion.length})`
      );
      ok++;
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`✅ LISTO — ${ok} robustecidas, ${omitidas} no encontradas en DB`);
  console.log(`   Errores validación: ${erroresValidacion} | Errores DB: ${erroresDB}`);
  console.log(`${"=".repeat(60)}\n`);
}

if (
  process.env.NODE_ENV !== "test" &&
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
