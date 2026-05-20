/**
 * Seed de actividades pedagógicas para CH-II (Conciencia Histórica II, Semestre 5).
 * 4 propósitos × 3 actividades = 12 actividades. estado='publicada'.
 * Tipos: lectura, video_con_preguntas, lectura, infografia,
 *        quiz_multiple_opcion, quiz_verdadero_falso, quiz_multiple_opcion, quiz_verdadero_falso,
 *        reflexion_escrita, reflexion_escrita, debate_estructurado, reflexion_escrita
 * Uso: npx tsx scripts/seed-activities-chii.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🌱 Seed actividades CH-II — Historicidad, hipótesis y sentido histórico\n");

  const progs = await getProgresionesDeUAC(sb, "CH-II");
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

  log(`\n✅ CH-II: ${ok} actividades insertadas, ${fail} fallidas.\n`);
}

// ── TÍTULOS ─────────────────────────────────────────────────────────────────────
const titulos = [
  {
    a1: "Mi historia en la historia: autobiografía histórica",
    a2: "¿Cuánto sabes sobre historicidad y sujeto histórico?",
    a3: "Reflexión: los procesos históricos que marcaron mi familia y comunidad",
  },
  {
    a1: "¿Cómo formular hipótesis históricas? Análisis de fuentes del siglo XIX mexicano",
    a2: "¿Verdadero o falso? Hipótesis históricas y fuentes",
    a3: "Reflexión: mi hipótesis sobre la Revolución Mexicana",
  },
  {
    a1: "El sentido histórico: por qué el pasado importa en el presente",
    a2: "¿Cuánto sabes sobre memoria colectiva y sentido histórico?",
    a3: "Debate: ¿La historia nos condena a repetir el pasado o nos da herramientas para cambiarlo?",
  },
  {
    a1: "México en el mundo: procesos históricos interconectados del siglo XIX al XXI",
    a2: "¿Verdadero o falso? México y sus procesos históricos globales",
    a3: "Reflexión: causas y consecuencias de un proceso histórico mexicano",
  },
];

// ── TIPOS ────────────────────────────────────────────────────────────────────────
const tiposA1 = ["lectura", "video_con_preguntas", "lectura", "infografia"] as const;
const tiposA2 = ["quiz_multiple_opcion", "quiz_verdadero_falso", "quiz_multiple_opcion", "quiz_verdadero_falso"] as const;
const tiposA3 = ["reflexion_escrita", "reflexion_escrita", "debate_estructurado", "reflexion_escrita"] as const;

// ── A1 ──────────────────────────────────────────────────────────────────────────
const contenidosA1 = [
  { // P01 — lectura (historicidad, sujeto histórico, autobiografía histórica)
    titulo: "Mi historia en la historia: la autobiografía histórica como herramienta",
    texto: `¿Alguna vez te has preguntado por qué tu familia vive donde vive, por qué tiene las costumbres que tiene, o por qué tus abuelos recuerdan ciertos eventos con tanta intensidad? La respuesta está en la historia: no la historia abstracta de los libros de texto, sino la historia concreta, personal y comunitaria que tejió el presente en el que vivimos.\n\nEl concepto de historicidad nos dice que los seres humanos no solo vivimos en la historia: somos producto de ella. Todo lo que somos —el idioma que hablamos, los alimentos que comemos, las creencias que tenemos, las oportunidades que se nos abren o cierran— es resultado de procesos históricos que ocurrieron mucho antes de que naciéramos. Al mismo tiempo, la historicidad nos dice que no somos simples receptores pasivos del pasado: también somos agentes que, con nuestras acciones cotidianas, contribuimos a construir el futuro.\n\nEl filósofo alemán Hans-Georg Gadamer desarrolló el concepto de historicidad (Geschichtlichkeit) para señalar que el ser humano siempre está situado en un momento histórico específico: no hay una perspectiva "desde ningún lugar". Siempre interpretamos el mundo desde nuestra posición histórica, cultural y social. Esto no es una limitación: es la condición misma de la comprensión humana.\n\nUna herramienta pedagógica poderosa para explorar la propia historicidad es la autobiografía histórica: el ejercicio de narrar la propia historia personal conectándola con los procesos históricos más amplios que la moldean. ¿Dónde naciste y por qué tus padres estaban ahí? ¿Por qué tu familia tiene determinado origen étnico o regional? ¿Qué crisis, migraciones o transformaciones estructurales explican la situación actual de tu familia?\n\nEn México, este ejercicio revela conexiones profundas con la historia nacional. La Revolución Mexicana (1910-1920) transformó la estructura de la propiedad de la tierra y la vida rural en todo el país: millones de familias campesinas recibieron tierras ejidales después de décadas de despojo porfiriano. Muchos mexicanos de hoy son descendientes de familias que cambiaron radicalmente de situación en esa época. El Porfiriato (1876-1911), con su política de modernización basada en inversión extranjera y expansión de las haciendas, generó migraciones forzadas del campo a las ciudades y a la frontera norte que configuraron la distribución poblacional actual de México.\n\nLas crisis económicas también dejan huellas familiares profundas. La crisis de 1994 —el llamado "Efecto Tequila" o "Error de Diciembre"— devaluó el peso, disparó el desempleo y precipitó la quiebra de miles de pequeñas empresas y hogares de clase media. Muchas familias que habían logrado estabilidad material en los años ochenta perdieron sus ahorros y propiedades en semanas. Esa crisis aceleró también la migración hacia Estados Unidos: entre 1995 y 2000, la emigración mexicana alcanzó cifras récord. Si tienes familiares en Estados Unidos, es posible que su partida esté conectada con ese momento histórico.\n\nEl antropólogo Guillermo Bonfil Batalla, en su obra México Profundo (1987), argumentó que México tiene una civilización mesoamericana viva —el México Profundo— que coexiste y resiste frente al México imaginario de las élites occidentalizadas. La historia oral, es decir, la recuperación de memorias, relatos y tradiciones de las comunidades, es una herramienta fundamental para conocer el México Profundo que no aparece en los libros de texto oficiales. Enrique Florescano, historiador mexicano, ha señalado también que la memoria histórica de los pueblos es una forma de poder: quien controla el relato del pasado, orienta el presente.\n\nExplorar tu propia historicidad no es un ejercicio de nostalgia: es una forma de entender por qué eres quien eres y de reconocerte como un sujeto histórico con capacidad de acción en el presente.`,
    fuente: "Material CEN Bachillerato — CH-II. Referencias: Bonfil Batalla, 1987; Florescano, 2012; Gadamer, 1975.",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 12,
    preguntas_comprension: [
      {
        pregunta: "¿Qué significa el concepto de historicidad y por qué implica que somos tanto productos como agentes de la historia?",
        respuesta_guia: "La historicidad señala que los seres humanos están siempre situados en un momento histórico específico que moldea su visión del mundo, sus oportunidades y su identidad (somos productos de la historia). Al mismo tiempo, con nuestras acciones cotidianas contribuimos a transformar la sociedad y construir el futuro (somos agentes). No somos receptores pasivos: participamos en la historia incluso cuando no lo percibimos.",
      },
      {
        pregunta: "¿Cómo explica el texto que la Revolución Mexicana o la crisis de 1994 pueden haber influido en la historia de familias concretas de hoy?",
        respuesta_guia: "La Revolución Mexicana transformó la propiedad de la tierra (reparto agrario) y cambió radicalmente la vida de millones de familias campesinas que habían sido despojadas durante el Porfiriato. La crisis de 1994 devaluó el peso, generó desempleo masivo, afectó los ahorros de familias de clase media y aceleró la migración a Estados Unidos. Ambos procesos macrohistóricos tuvieron efectos concretos en historias familiares: dónde vivían, qué tenían, qué tuvieron que hacer para sobrevivir.",
      },
      {
        pregunta: "¿Qué es la autobiografía histórica y por qué es una herramienta útil para explorar la propia historicidad?",
        respuesta_guia: "Es el ejercicio de narrar la propia historia personal conectándola con procesos históricos más amplios. Es útil porque permite ver que las situaciones individuales y familiares no son accidentales: están moldeadas por migraciones, crisis, reformas agrarias, guerras u otros procesos estructurales. Hace visible la conexión entre lo personal y lo histórico, y ayuda a reconocerse como sujeto histórico.",
      },
      {
        pregunta: "¿Qué proponen Guillermo Bonfil Batalla y Enrique Florescano sobre la memoria histórica en México y por qué es relevante para ejercitar la historicidad?",
        respuesta_guia: "Bonfil Batalla argumenta que hay un México Profundo con una civilización mesoamericana viva que resiste frente a la visión occidentalizada oficial. La historia oral recupera esa memoria invisible en los libros de texto. Florescano señala que la memoria histórica es una forma de poder: quien controla el relato del pasado orienta el presente. Conocer la historia de la propia comunidad es, entonces, un acto político y de identidad, no solo académico.",
      },
    ],
  },

  { // P02 — video_con_preguntas (metodología histórica: hipótesis, fuentes del siglo XIX mexicano)
    url_video: "https://www.youtube.com/watch?v=placeholder-chii-hipotesis",
    titulo_video: "Cómo trabajan los historiadores: fuentes, hipótesis y evidencias",
    descripcion: "Video explicativo sobre la metodología histórica: cómo los historiadores formulan hipótesis a partir de fuentes primarias y secundarias, el proceso de corroboración y la construcción de argumentos.",
    tiempo_segundos: 720,
    preguntas: [
      {
        tiempo_segundos: 180,
        pregunta: "¿Cuál es la diferencia entre una fuente primaria y una secundaria en la investigación histórica? Da un ejemplo de cada una relacionado con la historia del siglo XIX mexicano.",
        respuesta_guia: "Una fuente primaria es producida en el momento del evento o por actores directos: por ejemplo, el Plan de Ayala (1911) escrito por Emiliano Zapata, las actas de sesión del Congreso Constituyente de 1857, o los documentos del Archivo General de la Nación (AGN) sobre la Reforma juarista. Una fuente secundaria es una interpretación elaborada posteriormente: libros de historia sobre la Reforma Liberal, artículos académicos sobre el Porfiriato, o manuales escolares sobre la guerra de Intervención francesa.",
      },
      {
        tiempo_segundos: 420,
        pregunta: "El Códice Mendoza es un ejemplo clásico de fuente iconográfica mesoamericana. ¿Cómo usaría un historiador esa fuente para formular y sostener una hipótesis sobre la organización tributaria del Imperio Azteca?",
        respuesta_guia: "El historiador partiría de observar sistemáticamente las imágenes del Códice Mendoza que registran los tributos entregados por los pueblos sometidos a Tenochtitlán (mantas, plumas, cacao, jade). Formularía una hipótesis: por ejemplo, 'el tributo fue el mecanismo principal de extracción económica del Imperio Azteca y condicionó las alianzas políticas que hicieron posible la Conquista'. Luego buscaría corroboración cruzada con otras fuentes: relaciones de conquista, documentos coloniales tempranos del AGN, crónicas de frailes como Sahagún o Durán. Si otras fuentes confirman el patrón tributario y el resentimiento de pueblos tributarios que se aliaron con Cortés, la hipótesis se sostiene.",
      },
      {
        tiempo_segundos: 620,
        pregunta: "Los documentos de la época de la Independencia mexicana (1810-1821) incluyen periódicos, proclamas y cartas de diferentes actores: realistas, insurgentes, clero, criollos y pueblos indígenas. ¿Por qué es importante para el historiador contrastar fuentes de diferentes actores antes de formular una hipótesis sobre las causas de la Independencia?",
        respuesta_guia: "Porque cada actor tenía intereses y perspectivas distintos que influían en cómo describían los mismos eventos. Un realista describía el movimiento insurgente como rebelión criminal; un insurgente lo describía como lucha de liberación; un indígena de comunidad podía enfocarse en la defensa de sus tierras comunales. Si el historiador solo usa fuentes de un actor, construye una hipótesis sesgada. La contrastación de fuentes múltiples permite identificar qué elementos son comunes a todas las perspectivas (más probablemente verdaderos) y cuáles son contradictorios (requieren análisis crítico). Esto es la base del método histórico.",
      },
    ],
  },

  { // P03 — lectura (sentido histórico: pasado y presente)
    titulo: "El sentido histórico: comprender el presente desde el pasado",
    texto: `¿Por qué importa saber lo que ocurrió hace cien o doscientos años? ¿Qué tiene que ver la Reforma Liberal del siglo XIX con México hoy? ¿Por qué la Conquista, ocurrida hace cinco siglos, sigue siendo un tema de debate en el país? La respuesta está en lo que los historiadores llaman el sentido histórico: la capacidad humana de situar el presente en un proceso temporal más amplio para comprenderlo mejor.\n\nEl sentido histórico no es simplemente saber muchas fechas y datos. Es una forma de mirar: la capacidad de preguntarse, ante cualquier fenómeno del presente, cómo llegó a ser lo que es. ¿Por qué hay tanta desigualdad en México? El sentido histórico nos dice que no podemos entenderlo sin mirar la herencia colonial, la concentración de la tierra durante el Porfiriato, las crisis económicas de las últimas décadas. ¿Por qué hay tantos municipios indígenas en condiciones de marginación? No es accidente ni destino natural: es el resultado de siglos de exclusión sistemática que se puede rastrear históricamente.\n\nEl historiador mexicano Luis González y González desarrolló el concepto de microhistoria para mostrar que la historia no solo se hace en los grandes palacios y batallas nacionales: también se hace en los pueblos, las comunidades y las familias. Su obra San José de Gracia: un pueblo en la historia (1968) demostró que la historia de un pueblo michoacano reflejaba, en escala pequeña, todos los grandes procesos nacionales: la guerra de Independencia, la Reforma, la Revolución. La microhistoria nos enseña que el pasado está presente en los detalles de la vida cotidiana.\n\nLa memoria colectiva es otro concepto clave para entender el sentido histórico. El sociólogo Maurice Halbwachs argumentó que los grupos sociales construyen una memoria compartida del pasado que les da identidad y cohesión. En México, la memoria de la Conquista (y su conmemoración cada 12 de octubre) es un campo de disputa: para algunos es el "Día de la Raza" que celebra el mestizaje; para muchos pueblos indígenas es el inicio de un genocidio y un despojo que no ha terminado. Dos memorias del mismo evento que revelan perspectivas históricas opuestas y vigentes.\n\nEl uso político de la historia es otra dimensión del sentido histórico que es necesario comprender críticamente. Los estados y los gobiernos utilizan constantemente el pasado para legitimarse. En México, la Revolución Mexicana ha sido usada durante décadas como fuente de legitimidad del Estado: los presidentes del PRI se presentaron durante setenta años como continuadores de la Revolución, aunque sus políticas económicas muchas veces contradecían los principios agraristas y laborales del movimiento original. La historia oficial es siempre una selección: enfatiza ciertos eventos y actores, y silencia otros.\n\nEl presentismo es uno de los errores más comunes al ejercitar el sentido histórico: consiste en interpretar el pasado con los valores y criterios del presente, sin considerar el contexto en que vivieron los actores históricos. Juzgar a los conquistadores del siglo XVI con los estándares de los derechos humanos del siglo XXI es presentismo. Esto no significa que no podamos criticar el pasado: significa que debemos entender primero el contexto antes de emitir juicios. El anacronismo es el error opuesto: atribuir al pasado ideas o prácticas que no existían en esa época.\n\nDesarrollar el sentido histórico es, en última instancia, una forma de ciudadanía crítica: permite cuestionar los relatos oficiales, identificar para qué sirve cierta versión del pasado, y comprender que el presente no es inevitable —fue construido y puede ser transformado.`,
    fuente: "Material CEN Bachillerato — CH-II. Ref.: Luis González y González, 1968; Halbwachs, 1950; Florescano, 2002.",
    nivel_lectura: "avanzado" as const,
    tiempo_estimado_minutos: 14,
    preguntas_comprension: [
      {
        pregunta: "¿Qué es el sentido histórico y por qué el texto lo describe como 'una forma de mirar' más que como un conjunto de fechas y datos?",
        respuesta_guia: "El sentido histórico es la capacidad de situar cualquier fenómeno del presente en un proceso temporal más amplio para comprenderlo. Es una forma de mirar porque implica una actitud activa: preguntarse cómo llegó a ser lo que es, qué procesos del pasado lo explican. No es solo acumular datos cronológicos, sino establecer conexiones causales y estructurales entre el pasado y el presente.",
      },
      {
        pregunta: "¿Cómo ilustra el ejemplo del 12 de octubre que la memoria colectiva puede ser un campo de disputa en México?",
        respuesta_guia: "El 12 de octubre conmemora el mismo evento histórico (la llegada de Colón a América en 1492) pero es recordado de forma radicalmente distinta según la perspectiva: como 'Día de la Raza' que celebra el mestizaje (memoria de las élites criollas y el Estado), o como inicio de un genocidio y despojo continuo (memoria de los pueblos indígenas). Esta disputa muestra que la memoria colectiva no es neutral: selecciona, enfatiza y está al servicio de identidades e intereses concretos del presente.",
      },
      {
        pregunta: "¿Qué es el presentismo en el análisis histórico y por qué el texto lo considera un error, aunque no niega que podamos criticar el pasado?",
        respuesta_guia: "El presentismo es interpretar el pasado con los valores y criterios del presente, sin considerar el contexto histórico en que vivieron los actores. Es un error porque distorsiona la comprensión: juzgamos sin entender las condiciones reales de quienes tomaron decisiones. El texto aclara que esto no significa que no podamos criticar el pasado, sino que debemos primero entender el contexto para luego emitir juicios bien fundamentados.",
      },
    ],
  },

  { // P04 — infografia (México en el mundo: procesos interconectados siglo XIX-XXI)
    titulo: "México en el mundo: línea de tiempo de procesos interconectados",
    url_imagen: "/placeholder/infografia.svg",
    descripcion_accesible: "Infografía con línea de tiempo del siglo XIX al XXI que muestra cómo procesos globales (colonialismo tardío, Primera y Segunda Guerra Mundial, Guerra Fría, globalización neoliberal) se conectan con procesos mexicanos (Reforma juarista, Porfiriato, Revolución, milagro mexicano, crisis 1994, TLCAN/T-MEC).",
    puntos_clave: [
      "Siglo XIX — Reforma y contexto global: mientras Europa vivía el auge del liberalismo económico y las revoluciones de 1848, México enfrentó la guerra de Reforma (1858-1861) entre liberales y conservadores. La Intervención Francesa (1862-1867) fue directamente consecuencia de la política de expansión imperialista europea: Napoleón III intentó establecer un Imperio en México aprovechando la deuda externa como pretexto. La victoria juarista consolidó el Estado laico y la propiedad privada, conectando México al liberalismo global del siglo XIX.",
      "Porfiriato y primera globalización (1876-1911): el Porfiriato se integró a la primera ola de globalización económica capitalista. La inversión extranjera (norteamericana, británica, francesa) construyó ferrocarriles, explotó minas y concentró tierras. México se insertó en el mercado mundial como exportador de materias primas (plata, henequén, petróleo) y receptor de capital. Esta inserción dependiente generó riqueza para las élites y despojo para campesinos e indígenas, creando las tensiones que estallarían en 1910.",
      "Revolución Mexicana y Primera Guerra Mundial (1910-1920): mientras México vivía su revolución interna, Europa se desangraba en la Primera Guerra Mundial (1914-1918). El conflicto global elevó los precios de las materias primas mexicanas (petróleo, algodón) y atrajo capitales extranjeros a México. El Telegrama Zimmermann (1917), en que Alemania propuso a México recuperar Texas, Nuevo México y Arizona a cambio de aliarse, muestra la inserción de México en la geopolítica global, aunque Carranza rechazó la propuesta.",
      "Milagro mexicano y Guerra Fría (1940-1970): el llamado 'milagro mexicano' de crecimiento sostenido (6% anual) ocurrió en el contexto de la Guerra Fría: México mantuvo neutralidad formal pero se alineó con Estados Unidos en el bloque occidental. La industrialización sustitutiva de importaciones (ISI) fue la respuesta latinoamericana al modelo económico de la CEPAL para reducir la dependencia. El movimiento estudiantil de 1968 y la masacre de Tlatelolco ocurrieron el mismo año que el Mayo Francés y las protestas contra la guerra de Vietnam: un ciclo global de insurgencia juvenil.",
      "Crisis del modelo y neoliberalismo (1982-1994): la crisis de la deuda de 1982 (cuando México declaró la moratoria de pagos) fue parte de una crisis global de los países del sur que habían tomado préstamos a tasas variables. El FMI impuso programas de ajuste estructural: privatizaciones, reducción del gasto público, apertura comercial. El TLCAN (1994) integró a México al bloque económico de América del Norte. La crisis del Efecto Tequila (1994) se extendió a Argentina y otros países latinoamericanos, mostrando la interconexión financiera global.",
      "México en el siglo XXI: T-MEC, pandemia y reconfiguración global: el T-MEC (Tratado México-Estados Unidos-Canadá, 2020) reemplazó al TLCAN con nuevas reglas laborales y de origen. La pandemia de COVID-19 (2020-2021) mostró la dependencia de México de cadenas de suministro globales, especialmente en salud e industria. La reconfiguración geopolítica global (competencia EE.UU.-China, nearshoring) abre oportunidades para México como destino de inversión industrial, conectando la geopolítica global del siglo XXI con la política industrial mexicana del presente.",
    ],
    fuente: "MCCEMS 2025 — CH-II. Historia conectada: análisis multicausal. Ref.: CEPAL, INEGI, Secretaría de Economía.",
  },
];

// ── A2 ──────────────────────────────────────────────────────────────────────────
const contenidosA2 = [
  { // P01 — quiz_multiple_opcion (historicidad, sujeto histórico, autobiografía histórica, memoria colectiva)
    preguntas: [
      {
        enunciado: "¿Qué significa el concepto de historicidad aplicado a los seres humanos?",
        opciones: [
          "Que los seres humanos son irrelevantes para el curso de la historia y solo los grandes líderes importan",
          "Que los seres humanos siempre están situados en un momento histórico que moldea su visión del mundo, y al mismo tiempo son agentes que transforman esa historia con sus acciones",
          "Que la historia es una ciencia exacta que puede predecir el comportamiento humano con precisión",
          "Que los seres humanos son completamente libres de su contexto histórico y pueden actuar sin condicionamientos del pasado",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "La historicidad (Geschichtlichkeit en la filosofía de Gadamer) señala que los humanos somos siempre seres en situación histórica: nuestros valores, lenguaje, oportunidades y visión del mundo son moldeados por el tiempo y el lugar en que vivimos. Pero también somos agentes: nuestras acciones, aunque condicionadas, contribuyen a transformar la sociedad. Somos productos Y productores de la historia.",
      },
      {
        enunciado: "¿Cuál de los siguientes ejemplos ilustra mejor cómo un proceso histórico macro puede haber afectado la historia de una familia concreta en México?",
        opciones: [
          "Que un estudiante sepa de memoria las fechas de la Revolución Mexicana",
          "Que una familia campesina de Morelos recibió tierras ejidales en los años 1920 como consecuencia del reparto agrario pos-revolucionario, lo que cambió radicalmente su situación y la de sus descendientes",
          "Que alguien vea documentales sobre el Porfiriato en televisión",
          "Que un historiador publique un libro sobre la crisis de 1994",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "El reparto agrario pos-revolucionario (basado en el Art. 27 constitucional de 1917) distribuyó millones de hectáreas a comunidades campesinas que habían sido despojadas durante el Porfiriato. Eso cambió concretamente quién tenía tierras, dónde vivía, qué podía producir y qué heredó a sus hijos. Es un ejemplo directo de cómo los procesos históricos se traducen en trayectorias familiares concretas.",
      },
      {
        enunciado: "¿Qué es la autobiografía histórica como herramienta pedagógica?",
        opciones: [
          "Un relato de los presidentes de México ordenado cronológicamente",
          "El ejercicio de narrar la propia historia personal conectándola con los procesos históricos más amplios que la han moldeado",
          "Una biografía oficial escrita por el gobierno sobre una figura histórica",
          "Un diario personal donde se anota la vida cotidiana sin referencia a procesos históricos",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "La autobiografía histórica conecta lo personal con lo estructural: permite ver que las situaciones familiares (dónde se vive, qué se tiene, qué oportunidades existen) no son accidentales sino resultado de migraciones, crisis, guerras, reformas o procesos de desigualdad que se pueden rastrear históricamente. Es una forma de ejercitar la conciencia histórica desde la propia experiencia.",
      },
      {
        enunciado: "Según la lectura, Guillermo Bonfil Batalla propuso el concepto de 'México Profundo' para referirse a:",
        opciones: [
          "Los yacimientos arqueológicos más importantes de México",
          "La profundidad geológica del territorio mexicano",
          "La civilización mesoamericana viva que coexiste y resiste frente al México imaginario occidentalizado de las élites",
          "Los sectores más pobres de México que viven en zonas rurales aisladas",
        ],
        respuesta_correcta: 2,
        retroalimentacion: "Bonfil Batalla en 'México Profundo' (1987) argumentó que la mayoría de la población mexicana vive según valores, prácticas y visiones del mundo de raíz mesoamericana (el México Profundo), mientras que el Estado y las élites proyectan un 'México imaginario' de modernización occidental que no corresponde a esa realidad. La historia oral recupera las memorias del México Profundo que los libros de texto oficiales suelen invisibilizar.",
      },
      {
        enunciado: "¿Cómo se relaciona la crisis del 'Efecto Tequila' de 1994 con la emigración mexicana hacia Estados Unidos?",
        opciones: [
          "No hay ninguna relación; la emigración depende exclusivamente de decisiones personales",
          "La crisis económica de 1994 (devaluación del peso, desempleo, quiebra de empresas) aceleró la emigración al dejar sin opciones económicas a millones de mexicanos, lo que se refleja en cifras récord de emigración entre 1995 y 2000",
          "La crisis de 1994 redujo la emigración porque el gobierno repartió apoyos económicos que disuadieron a la gente de irse",
          "La crisis de 1994 solo afectó a empresarios ricos; las familias populares no sufrieron sus consecuencias",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "La crisis de diciembre de 1994 devaluó el peso más de un 50%, disparó la inflación y el desempleo, y quebró miles de pequeñas empresas y hogares endeudados. Esto empujó a millones de mexicanos, especialmente de clases populares y medias, a buscar trabajo en Estados Unidos. Los datos del INEGI y del Consejo Nacional de Población (CONAPO) muestran que entre 1995 y 2000 la emigración mexicana alcanzó su pico histórico.",
      },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },

  { // P02 — quiz_verdadero_falso (hipótesis históricas, fuentes primarias/secundarias, corroboración)
    preguntas: [
      {
        enunciado: "Una hipótesis histórica es una afirmación definitiva sobre el pasado que no necesita ser corroborada con evidencias.",
        respuesta: false,
        retroalimentacion: "Falso. Una hipótesis histórica es una proposición provisional y verificable que el historiador formula para explicar un proceso o evento. Para convertirse en argumento sólido, debe ser contrastada con fuentes primarias y secundarias, ser coherente con otras evidencias y resistir la crítica de otros investigadores. La historia no es una colección de verdades inmutables, sino de interpretaciones fundamentadas.",
      },
      {
        enunciado: "El Códice Mendoza es una fuente iconográfica mesoamericana que contiene registros tributarios del Imperio Azteca y puede ser usada como evidencia para formular hipótesis sobre la organización económica prehispánica.",
        respuesta: true,
        retroalimentacion: "Correcto. El Códice Mendoza (c. 1541) es una fuente iconográfica de primera importancia: registra en imágenes los tributos que los pueblos sometidos entregaban a Tenochtitlán, las conquistas del Imperio y escenas de vida cotidiana. Los historiadores lo usan para formular hipótesis sobre el sistema tributario azteca, la extensión del Imperio y los tipos de bienes que circulaban en la economía mesoamericana.",
      },
      {
        enunciado: "Para sostener una hipótesis histórica sobre la Independencia de México (1810-1821) es suficiente con usar una sola fuente primaria, como la carta de un insurgente.",
        respuesta: false,
        retroalimentacion: "Falso. Una sola fuente refleja una sola perspectiva, con sus sesgos e intereses. Para sostener una hipótesis sólida, el historiador necesita corroborar con múltiples fuentes de diferentes tipos y perspectivas: documentos insurgentes, fuentes realistas, registros eclesiásticos, testimonios indígenas, prensa de la época. La confluencia de evidencias independientes fortalece la hipótesis; las contradicciones obligan a revisarla.",
      },
      {
        enunciado: "Los documentos del Archivo General de la Nación (AGN) son fuentes primarias porque fueron producidos por actores del momento histórico que se estudia.",
        respuesta: true,
        retroalimentacion: "Correcto. El AGN conserva documentos producidos desde la época virreinal: actas de juicios de la Inquisición, registros de propiedad colonial, documentos de la Independencia, expedientes de la Reforma, registros de la Revolución Mexicana. Son fuentes primarias porque no son interpretaciones posteriores sino registros directos del período que documentan.",
      },
      {
        enunciado: "Un libro de historia publicado en 2020 sobre la Revolución Mexicana es una fuente primaria porque está basado en investigación de archivos.",
        respuesta: false,
        retroalimentacion: "Falso. Que un libro esté basado en investigación de archivos no lo convierte en fuente primaria. Es una fuente secundaria: es la interpretación que un historiador hace de las fuentes primarias. Las fuentes primarias son los documentos, fotografías, testimonios y objetos producidos durante la Revolución misma (1910-1920). El libro de 2020 es un análisis posterior.",
      },
      {
        enunciado: "Contrastar fuentes de diferentes actores históricos (insurgentes, realistas, pueblos indígenas) antes de formular una hipótesis es un principio fundamental del método histórico.",
        respuesta: true,
        retroalimentacion: "Correcto. Cada actor histórico tiene una perspectiva condicionada por sus intereses, posición social y objetivos. Comparar fuentes de distintos actores permite identificar qué elementos son comunes (probablemente más cercanos a lo ocurrido) y cuáles son contradictorios (requieren análisis crítico). Este principio de triangulación de fuentes es la base de la metodología histórica rigurosa.",
      },
    ],
    intentos_maximos: 2,
    puntaje_minimo_aprobacion: 70,
  },

  { // P03 — quiz_multiple_opcion (sentido histórico, memoria colectiva, presentismo, anacronismo)
    preguntas: [
      {
        enunciado: "¿Qué es el sentido histórico en el contexto de la Conciencia Histórica?",
        opciones: [
          "La capacidad de memorizar grandes cantidades de fechas y datos históricos",
          "La capacidad humana de situar el presente en un proceso temporal más amplio, comprendiendo cómo el pasado explica y condiciona la realidad actual",
          "La habilidad para hacer predicciones sobre el futuro basadas en el pasado",
          "El sentimiento de orgullo o vergüenza que se experimenta al estudiar la historia nacional",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "El sentido histórico es una competencia cognitiva y actitudinal: implica preguntarse ante cualquier fenómeno del presente cómo llegó a ser lo que es, qué procesos históricos lo explican. Va más allá de saber datos: es una forma de pensar que relaciona temporalidades, identifica continuidades y rupturas, y comprende que el presente es resultado de decisiones y procesos del pasado.",
      },
      {
        enunciado: "¿Qué es el presentismo como error del pensamiento histórico?",
        opciones: [
          "Estudiar solo la historia reciente y no el pasado lejano",
          "Interpretar el pasado con los valores, criterios y estándares del presente, sin considerar el contexto histórico en que vivieron los actores",
          "Dar demasiada importancia a los eventos del presente en comparación con el pasado",
          "Usar fuentes modernas para estudiar períodos históricos antiguos",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "El presentismo distorsiona la comprensión histórica porque juzga a los actores del pasado como si hubieran tenido acceso a los conocimientos, valores y derechos que existen hoy. Por ejemplo, juzgar a los conquistadores del siglo XVI con los estándares de los derechos humanos del siglo XXI, sin entender el contexto cultural, jurídico y moral de su época, es presentismo. Esto no impide criticar el pasado, pero exige primero entender el contexto.",
      },
      {
        enunciado: "La memoria colectiva, según el sociólogo Maurice Halbwachs, es:",
        opciones: [
          "Un registro objetivo y neutro del pasado compartido por toda la humanidad",
          "El conjunto de recuerdos compartidos por un grupo social que construye identidad y cohesión, seleccionando y transformando el pasado desde las necesidades del presente",
          "El equivalente exacto a la historia académica, solo que expresado en lenguaje popular",
          "Un fenómeno exclusivo de las sociedades sin escritura que no tienen archivos históricos",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "Halbwachs demostró que los grupos sociales construyen memorias compartidas del pasado que no son fotografías objetivas: son reconstrucciones que enfatizan ciertos eventos y omiten otros, según las necesidades de identidad e integración del grupo en el presente. La memoria colectiva y la historia académica pueden coincidir o contradecirse: ambas son formas legítimas pero distintas de relacionarse con el pasado.",
      },
      {
        enunciado: "¿Por qué la conmemoración del 12 de octubre en México es un ejemplo de que la memoria colectiva puede ser campo de disputa política y social?",
        opciones: [
          "Porque es una fecha con dos nombres diferentes (Día de la Raza / Día de la Resistencia Indígena) que no generan ningún debate",
          "Porque el mismo evento histórico (llegada de Colón, 1492) es recordado de formas opuestas: como inicio del mestizaje celebrable (visión oficial) o como inicio de un genocidio y despojo no resuelto (perspectiva indígena), revelando que la memoria sirve a intereses e identidades distintas",
          "Porque es un día feriado que el gobierno usa para dar descanso a los trabajadores",
          "Porque en esa fecha se fundó la Ciudad de México y hay confusión sobre su significado",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "El 12 de octubre ilustra que la memoria colectiva no es neutral ni única: el mismo evento tiene significados opuestos según la perspectiva. El Estado mexicano construyó la narrativa del mestizaje como síntesis cultural positiva. Los movimientos indígenas, especialmente desde 1992 (V Centenario), rechazaron esa narrativa y reivindican el 12 de octubre como Día de la Resistencia Indígena. Esta disputa de memorias refleja conflictos políticos y sociales vigentes sobre tierra, derechos y reconocimiento.",
      },
      {
        enunciado: "¿Qué propuso el historiador Luis González y González con el concepto de 'microhistoria' y cómo se relaciona con el sentido histórico?",
        opciones: [
          "Que solo importa estudiar los grandes eventos nacionales e internacionales, no los locales",
          "Que la historia de los pueblos y comunidades locales refleja en escala pequeña todos los grandes procesos históricos nacionales, mostrando que el pasado está presente en los detalles de la vida cotidiana",
          "Que los historiadores deben usar microscopios para estudiar documentos antiguos",
          "Que la historia de México puede resumirse en eventos muy breves de pocos días de duración",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "Luis González y González demostró en 'San José de Gracia: un pueblo en la historia' que la historia de un pequeño pueblo michoacano condensaba todos los grandes procesos nacionales: la guerra de Independencia, las guerras de Reforma, la Revolución. La microhistoria afirma que el sentido histórico puede ejercitarse desde lo local: comprender el pueblo propio, la familia propia, la comunidad propia, es también comprender la historia nacional y global.",
      },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },

  { // P04 — quiz_verdadero_falso (procesos históricos mexicanos siglos XIX-XX y conexiones globales)
    preguntas: [
      {
        enunciado: "El Porfiriato (1876-1911) integró a México en la primera ola de globalización capitalista principalmente como exportador de materias primas y receptor de inversión extranjera.",
        respuesta: true,
        retroalimentacion: "Correcto. Durante el Porfiriato, México se insertó en el mercado mundial como proveedor de plata, henequén, petróleo, café y otros productos primarios. La inversión norteamericana, británica y francesa construyó ferrocarriles, explotó minas y haciendas, y concentró la riqueza en pocas manos. Este modelo de inserción dependiente generó crecimiento económico desigual y las tensiones que estallarían en la Revolución de 1910.",
      },
      {
        enunciado: "La masacre de Tlatelolco del 2 de octubre de 1968 ocurrió de forma aislada en México, sin ninguna conexión con procesos políticos globales de ese año.",
        respuesta: false,
        retroalimentacion: "Falso. El movimiento estudiantil mexicano de 1968 formó parte de un ciclo global de insurgencia juvenil que incluyó el Mayo Francés en Francia, las protestas contra la guerra de Vietnam en Estados Unidos, la Primavera de Praga en Checoslovaquia y movimientos estudiantiles en muchos países. La represión en Tlatelolco fue la respuesta del gobierno de Díaz Ordaz a una movilización estudiantil que tenía raíces tanto locales (autoritarismo del PRI) como globales (contracultura y movimientos de liberación).",
      },
      {
        enunciado: "El TLCAN (Tratado de Libre Comercio de América del Norte, 1994) fue consecuencia del proceso de apertura económica neoliberal que México inició en los años ochenta tras la crisis de la deuda de 1982.",
        respuesta: true,
        retroalimentacion: "Correcto. Tras la crisis de la deuda de 1982 y los programas de ajuste del FMI, México inició una apertura comercial gradual: ingresó al GATT en 1986, privatizó empresas públicas y redujo aranceles. El TLCAN de 1994 fue la culminación de ese giro neoliberal, integrando formalmente a México al bloque económico norteamericano. Este proceso está directamente conectado con la crisis de la deuda global y las presiones del FMI y el Banco Mundial sobre los países latinoamericanos.",
      },
      {
        enunciado: "La Intervención Francesa en México (1862-1867) fue una iniciativa independiente de Napoleón III sin ninguna relación con la política de expansionismo europeo de mediados del siglo XIX.",
        respuesta: false,
        retroalimentacion: "Falso. La Intervención Francesa fue precisamente una expresión del imperialismo europeo de la segunda mitad del siglo XIX. Napoleón III buscaba extender la influencia francesa en América Latina (llamaba a su proyecto el 'Imperio Latino') y aprovechó la deuda que México debía a Francia, España e Inglaterra como pretexto. El contexto global de expansión colonial y la Doctrina Monroe de Estados Unidos (que en ese momento estaba ocupado en la Guerra Civil) determinaron el marco en que ocurrió.",
      },
      {
        enunciado: "El 'milagro mexicano' (crecimiento económico sostenido entre 1940 y 1970) se dio en el contexto de la Guerra Fría y del modelo de industrialización sustitutiva de importaciones promovido por la CEPAL.",
        respuesta: true,
        retroalimentacion: "Correcto. El crecimiento mexicano de ese período se enmarcó en dos contextos globales: la Guerra Fría (que llevó a México a alinearse con Estados Unidos y recibir apoyo e inversión norteamericana) y el modelo de industrialización sustitutiva de importaciones (ISI), diseñado por la CEPAL para reducir la dependencia latinoamericana de los productos manufacturados del norte. Ambos contextos son indispensables para comprender el milagro mexicano.",
      },
      {
        enunciado: "La crisis del Efecto Tequila de 1994 en México tuvo efectos exclusivamente nacionales y no se extendió a otros países de América Latina.",
        respuesta: false,
        retroalimentacion: "Falso. La crisis mexicana de 1994 se extendió rápidamente a otros países latinoamericanos en lo que se llamó el 'efecto tequila': Argentina, Brasil y otros países experimentaron salidas de capital y ataques especulativos sobre sus monedas. Esto demostró el grado de interconexión financiera global que había alcanzado América Latina tras los procesos de liberalización económica de los años ochenta y noventa.",
      },
    ],
    intentos_maximos: 2,
    puntaje_minimo_aprobacion: 70,
  },
];

// ── A3 ──────────────────────────────────────────────────────────────────────────
const contenidosA3 = [
  { // P01 — reflexion_escrita (historicidad personal: procesos históricos en la historia familiar)
    prompt: "Escribe una reflexión personal sobre cómo un proceso histórico importante (puede ser la Revolución Mexicana, la migración campo-ciudad, una crisis económica o cualquier otro) ha marcado la historia de tu familia o comunidad. ¿Cómo ese proceso del pasado explica algo de tu presente? ¿Te ves como producto de ese proceso o también como agente de cambio?",
    pistas: [
      "¿Tus abuelos o bisabuelos vivieron algún evento histórico importante?",
      "¿Tu familia migró de algún lugar? ¿Por qué?",
      "¿Alguna crisis económica o social cambió la vida de tu familia?",
      "¿Hay tradiciones o costumbres en tu familia que se explican por la historia?",
    ],
    criterios_evaluacion: [
      "Identifica al menos un proceso histórico concreto relacionado con su historia familiar",
      "Establece una conexión clara entre ese proceso histórico y su situación presente",
      "Reflexiona sobre su propio rol como sujeto histórico (producto y agente)",
      "Escribe con claridad y coherencia",
    ],
    longitud_minima_palabras: 120,
  },

  { // P02 — reflexion_escrita (hipótesis propia sobre la Revolución Mexicana)
    prompt: "Elige un momento de la Revolución Mexicana (1910-1920) que te resulte especialmente significativo o poco comprendido. Formula una hipótesis histórica sobre ese momento: ¿por qué ocurrió? ¿Qué causas estructurales y contingentes puedes identificar? ¿Qué evidencias necesitarías para sostener tu hipótesis?",
    pistas: [
      "¿Qué fuentes primarias existen sobre ese momento? (periódicos de la época, cartas, fotografías)",
      "¿Qué causas estructurales (económicas, sociales, políticas) influyeron?",
      "¿Hubo decisiones individuales (coyunturales) que marcaron el resultado?",
      "¿Tu hipótesis se puede probar o refutar con evidencias?",
    ],
    criterios_evaluacion: [
      "Identifica un momento específico de la Revolución Mexicana con suficiente detalle",
      "Formula una hipótesis histórica clara y verificable sobre ese momento",
      "Distingue al menos una causa estructural y una causa contingente",
      "Señala qué tipo de evidencias o fuentes necesitaría para sostener o refutar su hipótesis",
    ],
    longitud_minima_palabras: 100,
  },

  { // P03 — debate_estructurado (¿La historia condena a repetir o da herramientas?)
    tema: "¿La historia nos condena a repetir el pasado, o nos da herramientas para cambiarlo?",
    descripcion: "Debate filosófico-histórico sobre el valor del conocimiento histórico para transformar el presente.",
    postura_a: {
      titulo: "La historia nos condena a repetir el pasado",
      argumentos_guia: [
        "Las estructuras sociales son muy resistentes al cambio: la desigualdad en México, con raíces en el colonialismo, persiste a pesar de la Independencia, la Reforma, la Revolución y décadas de programas sociales.",
        "Los patrones de desigualdad en México se repiten desde la Colonia: concentración de tierras en el Porfiriato, concentración de riqueza en la era neoliberal. El coeficiente de GINI apenas ha variado en décadas.",
        "Las élites utilizan la historia para legitimar el status quo: la historia oficial del PRI convirtió la Revolución en justificación del partido en el poder durante 70 años, neutralizando su potencial transformador.",
        "Los ciclos de crisis económica se repiten con variaciones mínimas: la crisis de 1982, el Efecto Tequila de 1994, la crisis de 2008-2009, todas siguieron patrones similares de endeudamiento, especulación y ajuste que afectaron a los mismos sectores populares.",
      ],
    },
    postura_b: {
      titulo: "La historia nos da herramientas para cambiar el presente",
      argumentos_guia: [
        "El conocimiento histórico permite identificar las causas profundas de los problemas actuales: saber que la desigualdad tiene raíces coloniales orienta las políticas hacia reformas estructurales, no solo paliativos.",
        "Los movimientos sociales se inspiran en experiencias históricas de cambio exitoso: el movimiento zapatista (EZLN, 1994) se nutrió de la memoria de Zapata y la Revolución para articular demandas de autonomía indígena y reforma agraria.",
        "La conciencia histórica es la base de la ciudadanía activa y la democracia: identificar cómo se han usado históricamente el fraude, la represión y la manipulación mediática en México permite a los ciudadanos reconocer esos patrones y resistirlos.",
        "México ha experimentado transformaciones profundas a lo largo de su historia: la Reforma juarista separó la Iglesia del Estado, la Revolución redistribuyó tierras, la alternancia política de 2000 terminó 70 años de hegemonía priista. El cambio histórico es posible.",
      ],
    },
    reglas_debate: [
      "Argumentar con evidencias históricas concretas, no solo con opiniones abstractas",
      "Escuchar y refutar los argumentos del lado contrario antes de presentar los propios",
      "No usar falacias ad hominem ni atacar a personas o partidos políticos",
    ],
    duracion_minutos: 20,
  },

  { // P04 — reflexion_escrita (análisis multicausal de un proceso histórico mexicano)
    prompt: "Elige un proceso histórico mexicano del siglo XIX o XX (puede ser la Reforma Liberal, el Porfiriato, la Revolución Mexicana, el 'milagro mexicano', o la crisis de 1994). Analiza: (1) qué causas estructurales lo originaron, (2) qué conexión tiene con procesos globales de la misma época, (3) qué consecuencias tuvo a corto y largo plazo, y (4) cómo ese proceso sigue siendo visible en México hoy.",
    pistas: [
      "¿Qué estaba pasando en el mundo en esa misma época?",
      "¿Qué actores sociales participaron y cuáles fueron sus intereses?",
      "¿Quiénes se beneficiaron y quiénes resultaron perjudicados?",
      "¿Puedes ver alguna consecuencia de ese proceso en tu vida o comunidad hoy?",
    ],
    criterios_evaluacion: [
      "Elige un proceso histórico concreto y lo describe con precisión suficiente",
      "Identifica al menos una causa estructural y la conecta con un proceso global de la misma época",
      "Distingue consecuencias a corto plazo y a largo plazo del proceso elegido",
      "Establece una conexión entre ese proceso histórico y algún aspecto visible de México en el presente",
    ],
    longitud_minima_palabras: 150,
  },
];

main().catch((err) => { console.error("❌ Error fatal:", err.message); process.exit(1); });
