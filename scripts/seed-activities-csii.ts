/**
 * Seed de actividades pedagógicas para CS-II (Ciencias Sociales II).
 * 4 progresiones × 3 actividades = 12 actividades. estado='publicada'.
 * Tipos: lectura, video_con_preguntas, infografia,
 *        quiz_multiple_opcion, quiz_verdadero_falso,
 *        reflexion_escrita, debate_estructurado (7 tipos)
 * Uso: npx tsx scripts/seed-activities-csii.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🌱 Seed actividades CS-II — Ciencias Sociales II\n");

  const progs = await getProgresionesDeUAC(sb, "CS-II");
  let ok = 0; let fail = 0;

  for (const p of progs) {
    const base = p.codigo;
    const n = p.numero;

    const a1ok = await upsertActividad(sb, {
      codigo: `${base}-A1`,
      titulo: titulos[n - 1].a1,
      descripcion: "Contextualización del propósito formativo.",
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
      descripcion: "Práctica de verificación y análisis conceptual.",
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
      descripcion: "Aplicación crítica: debate o reflexión de cierre.",
      tipo: tiposA3[n - 1],
      progresion_id: p.id,
      xp: 20,
      estado: "publicada",
      contenido: contenidosA3[n - 1],
    });
    a3ok ? ok++ : fail++;
  }

  log(`\n✅ CS-II: ${ok} actividades insertadas, ${fail} fallidas.\n`);
}

const titulos = [
  { a1: "Bienestar social y desigualdades en México y el mundo", a2: "¿Verdadero o falso? Bienestar y desarrollo humano", a3: "Debate: ¿La desigualdad económica es inevitable?" },
  { a1: "Formas de organización social en México", a2: "Sociedad civil, movimientos sociales y tejido comunitario", a3: "Debate: ¿Los movimientos sociales transforman la sociedad?" },
  { a1: "Economía formal e informal: trabajo y producción", a2: "¿Verdadero o falso? Economía y trabajo", a3: "El trabajo en mi comunidad: una mirada crítica" },
  { a1: "Poder, desigualdad y sus estructuras en la sociedad", a2: "Clase, género, etnia y edad como categorías de análisis", a3: "Debate: ¿Cómo transformar las desigualdades estructurales?" },
];

const tiposA1 = ["lectura", "infografia", "lectura", "video_con_preguntas"] as const;
const tiposA2 = ["quiz_verdadero_falso", "quiz_multiple_opcion", "quiz_verdadero_falso", "quiz_multiple_opcion"] as const;
const tiposA3 = ["debate_estructurado", "debate_estructurado", "reflexion_escrita", "debate_estructurado"] as const;

const contenidosA1 = [
  { // P01 — lectura
    texto: `El bienestar social se refiere al conjunto de condiciones que permiten a las personas vivir una vida digna y plena. El Índice de Desarrollo Humano (IDH), creado por el PNUD (Programa de las Naciones Unidas para el Desarrollo), mide tres dimensiones: esperanza de vida, educación y nivel de vida (ingreso per cápita).\n\nOtro indicador clave es el Coeficiente de GINI, que mide la desigualdad en la distribución del ingreso dentro de un país. Un GINI de 0 significa igualdad perfecta (todos tienen lo mismo); un GINI de 1 significa desigualdad total (una persona tiene todo). México tiene un GINI alto (~0.44), lo que indica desigualdades importantes.\n\nLa desigualdad no es solo económica: también es espacial (las regiones rurales del sur tienen menor bienestar que las zonas metropolitanas del norte), de género (las mujeres enfrentan brechas salariales y mayor carga de trabajo no remunerado), y étnica (las poblaciones indígenas tienen índices de bienestar inferiores al promedio nacional). Comprender estas desigualdades es el primer paso para cuestionarlas y buscar transformarlas.`,
    fuente: "Material elaborado para CEN Bachillerato — CS-II",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 9,
    preguntas_comprension: [
      { pregunta: "¿Qué tres dimensiones mide el IDH?", respuesta_guia: "Esperanza de vida, educación y nivel de vida (ingreso per cápita)." },
      { pregunta: "¿Qué significa un GINI cercano a 1?", respuesta_guia: "Una desigualdad casi total: una persona o grupo concentra casi toda la riqueza." },
      { pregunta: "Menciona tres tipos de desigualdad que existen en México según el texto.", respuesta_guia: "Espacial (sur vs. norte), de género (brechas salariales) y étnica (poblaciones indígenas)." },
    ],
  },
  { // P02 — infografia
    titulo: "Formas de organización social en México",
    url_imagen: "/placeholder/infografia.svg",
    descripcion_accesible: "Infografía sobre las diferentes formas de organización social en México: familia, comunidad, organizaciones civiles, sindicatos y movimientos sociales, con ejemplos concretos de cada tipo.",
    puntos_clave: [
      "Familia: primera red de apoyo y socialización; diversas estructuras (nuclear, extensa, monoparental).",
      "Comunidad: vínculos de pertenencia territorial; tequio, mayordomías, asambleas comunitarias.",
      "OSC (Organizaciones de la Sociedad Civil): grupos formales que trabajan por causas sociales sin fines de lucro.",
      "Sindicatos: organizaciones de trabajadores para defender derechos laborales colectivos.",
      "Movimientos sociales: acciones colectivas para promover cambios: feminismo, ambientalismo, derechos indígenas.",
      "Capital social: la red de confianza y relaciones que tienen las comunidades para resolver problemas colectivos.",
    ],
    fuente: "Material CEN Bachillerato — CS-II",
    actividad_post: "Identifica en tu comunidad un ejemplo de cada tipo de organización social. ¿Cuál crees que tiene más influencia en la vida cotidiana de las personas?",
  },
  { // P03 — lectura
    texto: `La economía de un país no funciona solo con los sectores formales que aparecen en las estadísticas oficiales. En México, la economía informal representa aproximadamente el 55% del empleo total: millones de personas trabajan sin seguridad social, sin contrato formal, sin acceso a crédito bancario ni a pensión.\n\nEl trabajo no remunerado es otro aspecto invisible de la economía: el trabajo doméstico y de cuidados (cocinar, limpiar, cuidar a niños o personas mayores) no tiene salario pero sostiene la vida. Las mujeres realizan en promedio tres veces más trabajo no remunerado que los hombres en México.\n\nLa cadena productiva conecta la producción, la distribución y el consumo. Un tomate cultivado en Sinaloa pasa por intermediarios, transportistas, vendedores en mercados y supermercados antes de llegar a la mesa. En cada eslabón hay actores económicos, muchos de ellos en la informalidad. Entender esta cadena nos permite ver quiénes se benefician de cada paso y quiénes son los más vulnerables.`,
    fuente: "Material elaborado para CEN Bachillerato — CS-II",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 9,
    preguntas_comprension: [
      { pregunta: "¿Qué porcentaje del empleo en México es informal según el texto?", respuesta_guia: "Aproximadamente el 55% del empleo total." },
      { pregunta: "¿Por qué el trabajo doméstico y de cuidados se considera 'invisible'?", respuesta_guia: "Porque no tiene salario ni reconocimiento económico oficial, aunque sustenta la vida cotidiana." },
      { pregunta: "¿Qué es la cadena productiva?", respuesta_guia: "La conexión entre producción, distribución y consumo, con múltiples actores en cada eslabón." },
    ],
  },
  { // P04 — video_con_preguntas
    url_video: "https://example.com/video-pendiente-cen",
    titulo_video: "Poder, desigualdad y sus estructuras en la sociedad",
    descripcion_video: "Introducción al concepto sociológico de poder y sus dimensiones: clase social, género, etnia y edad. Explica cómo estas categorías se intersectan (interseccionalidad) para determinar el acceso diferenciado a recursos y oportunidades en México.",
    duracion_segundos: 480,
    subtitulos_disponibles: true,
    preguntas: [
      { tiempo_segundos: 100, pregunta: "¿Cómo define el video el concepto de 'poder' en el análisis social?", tipo: "abierta" as const },
      { tiempo_segundos: 280, pregunta: "¿Qué es la interseccionalidad y por qué es importante para analizar las desigualdades?", tipo: "abierta" as const },
      { tiempo_segundos: 420, pregunta: "Da un ejemplo concreto de cómo clase social y género se intersectan para afectar el acceso a oportunidades.", tipo: "abierta" as const },
    ],
  },
];

const contenidosA2 = [
  { // P01 — quiz_verdadero_falso
    preguntas: [
      { enunciado: "El IDH mide exclusivamente el nivel de ingresos de la población.", respuesta: false, retroalimentacion: "El IDH mide tres dimensiones: esperanza de vida, educación y nivel de vida (no solo ingresos)." },
      { enunciado: "Un Coeficiente de GINI cercano a 0 indica alta igualdad en la distribución del ingreso.", respuesta: true, retroalimentacion: "Correcto. GINI 0 = igualdad perfecta; GINI 1 = desigualdad máxima." },
      { enunciado: "La desigualdad en México es solo económica, no espacial ni étnica.", respuesta: false, retroalimentacion: "La desigualdad en México es multidimensional: espacial (regiones), étnica y de género." },
      { enunciado: "Las mujeres en México realizan más trabajo no remunerado que los hombres.", respuesta: true, retroalimentacion: "Correcto. Las mujeres realizan en promedio tres veces más trabajo doméstico y de cuidados no remunerado." },
      { enunciado: "El bienestar social solo puede medirse con indicadores económicos.", respuesta: false, retroalimentacion: "El bienestar social incluye salud, educación, participación, seguridad y otros factores no solo económicos." },
      { enunciado: "Las poblaciones indígenas en México tienen, en promedio, índices de IDH más bajos que la media nacional.", respuesta: true, retroalimentacion: "Correcto. La desigualdad étnica hace que las comunidades indígenas enfrenten condiciones de bienestar más bajas." },
    ],
    intentos_maximos: 2,
    puntaje_minimo_aprobacion: 70,
  },
  { // P02 — quiz_multiple_opcion
    preguntas: [
      { enunciado: "¿Qué diferencia a una OSC de un movimiento social?", opciones: ["Las OSC son informales y los movimientos son legalmente registrados", "Las OSC son organizaciones formales y registradas; los movimientos sociales son acciones colectivas más flexibles", "No hay diferencia entre ambos", "Los movimientos son gubernamentales; las OSC son privadas"], respuesta_correcta: 1, retroalimentacion: "Las OSC son organizaciones estructuradas; los movimientos sociales son procesos colectivos con mayor fluidez organizativa." },
      { enunciado: "El tequio es un ejemplo de:", opciones: ["Economía informal", "Trabajo comunitario no remunerado basado en reciprocidad", "Un movimiento sindical", "Una política gubernamental de desarrollo"], respuesta_correcta: 1, retroalimentacion: "El tequio es una práctica comunitaria indígena de trabajo colectivo para el bien común, basada en reciprocidad." },
      { enunciado: "¿Cuál de estos es un ejemplo de movimiento social en México?", opciones: ["El IMSS", "El movimiento feminista #NiUnaMenos", "La Secretaría de Educación Pública", "El Banco de México"], respuesta_correcta: 1, retroalimentacion: "El movimiento feminista es un ejemplo de movilización social organizada para transformar normas y estructuras." },
      { enunciado: "El capital social de una comunidad hace referencia a:", opciones: ["El dinero que tiene la comunidad en el banco", "Las redes de confianza y relaciones que permiten resolver problemas colectivos", "Las propiedades de la comunidad", "El nivel educativo promedio de los habitantes"], respuesta_correcta: 1, retroalimentacion: "El capital social son los lazos de confianza y reciprocidad que facilitan la cooperación comunitaria." },
      { enunciado: "¿Qué ha logrado el movimiento sindical históricamente?", opciones: ["Aumentar la jornada de trabajo", "Conquistar derechos como salario mínimo, jornada laboral de 8 horas y vacaciones", "Eliminar la economía informal", "Privatizar los servicios públicos"], respuesta_correcta: 1, retroalimentacion: "Los sindicatos han luchado históricamente por derechos laborales fundamentales que hoy son ley." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P03 — quiz_verdadero_falso
    preguntas: [
      { enunciado: "En México, la mayoría de los trabajadores tienen acceso a seguridad social formal.", respuesta: false, retroalimentacion: "Aproximadamente el 55% de los trabajadores en México se encuentra en la informalidad, sin seguridad social." },
      { enunciado: "El trabajo doméstico y de cuidados es un tipo de trabajo económico aunque no tenga salario.", respuesta: true, retroalimentacion: "Correcto. El trabajo no remunerado sostiene la reproducción social, aunque no aparezca en el PIB." },
      { enunciado: "La cadena productiva conecta solo a productores y consumidores, sin intermediarios.", respuesta: false, retroalimentacion: "La cadena productiva incluye múltiples intermediarios: transportistas, distribuidores, comercializadores." },
      { enunciado: "La economía informal permite que muchas personas generen ingresos fuera del sistema formal.", respuesta: true, retroalimentacion: "Correcto. Aunque vulnerable, la economía informal es la fuente de ingreso de millones de mexicanos." },
      { enunciado: "La división sexual del trabajo implica que mujeres y hombres realizan tipos de trabajo similares en cantidad.", respuesta: false, retroalimentacion: "La división sexual del trabajo asigna tipos distintos de trabajo a hombres y mujeres, con más carga no remunerada para ellas." },
      { enunciado: "Estudiar la cadena productiva nos ayuda a entender quiénes se benefician más en cada eslabón.", respuesta: true, retroalimentacion: "Correcto. El análisis de la cadena revela relaciones de poder y distribución inequitativa de ganancias." },
    ],
    intentos_maximos: 2,
    puntaje_minimo_aprobacion: 70,
  },
  { // P04 — quiz_multiple_opcion
    preguntas: [
      { enunciado: "¿Qué es la interseccionalidad?", opciones: ["Un concepto de geometría aplicado a lo social", "La forma en que múltiples categorías (género, clase, etnia) se combinan y crean experiencias únicas de desigualdad", "La intersección entre economía formal e informal", "Un tipo de organización social comunitaria"], respuesta_correcta: 1, retroalimentacion: "La interseccionalidad explica cómo diferentes categorías sociales se combinan para producir desigualdades compuestas." },
      { enunciado: "¿Qué es el clasismo?", opciones: ["Discriminación basada en la clase social (nivel socioeconómico)", "Discriminación por razones de edad", "Discriminación racial", "Discriminación basada en el género"], respuesta_correcta: 0, retroalimentacion: "El clasismo es la discriminación o prejuicio basado en la clase social o nivel socioeconómico de una persona." },
      { enunciado: "¿Cuál es un ejemplo de discriminación étnica estructural en México?", opciones: ["La brecha salarial por género", "Las poblaciones indígenas con menor acceso a salud y educación de calidad", "La economía informal", "La migración a ciudades"], respuesta_correcta: 1, retroalimentacion: "La menor cobertura de servicios de salud y educación en comunidades indígenas es discriminación étnica estructural." },
      { enunciado: "El patriarcado, como sistema de organización social, implica:", opciones: ["Que las mujeres tienen más poder que los hombres", "Una estructura donde los hombres tienen mayor poder y privilegios sistémicos", "Que solo los padres tienen autoridad en la familia", "Un tipo de gobierno administrado por ancianos"], respuesta_correcta: 1, retroalimentacion: "El patriarcado es un sistema social donde los hombres tienen privilegios y poder sistémicos sobre las mujeres." },
      { enunciado: "¿Qué busca el análisis de 'relaciones de poder' en las Ciencias Sociales?", opciones: ["Promover que una clase social domine a las demás", "Comprender cómo las estructuras sociales determinan quién accede a qué recursos y oportunidades", "Estudiar la física del movimiento", "Analizar las relaciones internacionales"], respuesta_correcta: 1, retroalimentacion: "El análisis crítico del poder busca visibilizar y transformar estructuras que producen desigualdad." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
];

const contenidosA3 = [
  { // P01 — debate_estructurado
    tema: "¿La desigualdad económica es inevitable en las sociedades contemporáneas?",
    posturas: ["La desigualdad económica es inevitable y tiene funciones en la sociedad", "La desigualdad económica no es inevitable: es resultado de decisiones políticas y puede reducirse"],
    argumentos_guia: {
      "La desigualdad económica es inevitable y tiene funciones en la sociedad": [
        "Las diferencias de habilidades, esfuerzo y suerte generan resultados diferentes de manera natural.",
        "La desigualdad crea incentivos para la innovación y el emprendimiento.",
        "Ninguna sociedad en la historia ha logrado eliminar por completo la desigualdad.",
        "Los intentos de igualdad total han generado problemas de eficiencia económica.",
      ],
      "La desigualdad económica no es inevitable: es resultado de decisiones políticas y puede reducirse": [
        "Los países nórdicos tienen menor desigualdad que México con políticas redistributivas.",
        "La desigualdad extrema es resultado de decisiones fiscales, de herencia de riqueza y de poder político.",
        "El IDH muestra que países con menor GINI tienen mejor desarrollo humano.",
        "Las políticas de redistribución (impuestos progresivos, gasto social) han reducido la desigualdad históricamente.",
        "La desigualdad frena el desarrollo al limitar el potencial de millones de personas.",
      ],
    },
    reglas: ["Escuchar con respeto la postura contraria", "Apoyar los argumentos con datos o ejemplos concretos", "No atacar a las personas, solo debatir las ideas"],
    tiempo_argumentacion_minutos: 4,
    criterios_evaluacion: ["Presenta al menos 3 argumentos de la postura asignada", "Usa datos o ejemplos concretos", "Responde o refuta al menos un argumento de la postura contraria", "Mantiene un tono respetuoso"],
    modalidad: "escrito" as const,
  },
  { // P02 — debate_estructurado
    tema: "¿Los movimientos sociales son la forma más efectiva de transformar la sociedad?",
    posturas: ["Los movimientos sociales son la forma más efectiva de transformar la sociedad", "Los cambios sociales más duraderos se logran por otras vías (leyes, instituciones, educación)"],
    argumentos_guia: {
      "Los movimientos sociales son la forma más efectiva de transformar la sociedad": [
        "El movimiento obrero del siglo XIX logró el derecho a la jornada de 8 horas y el salario mínimo.",
        "El movimiento feminista ha transformado leyes y normas culturales en décadas.",
        "El movimiento por los derechos civiles en EE.UU. cambió leyes que parecían inamovibles.",
        "Sin presión social colectiva, muchos cambios institucionales nunca habrían ocurrido.",
      ],
      "Los cambios sociales más duraderos se logran por otras vías (leyes, instituciones, educación)": [
        "Las leyes y constituciones formalizan y protegen los derechos de manera permanente.",
        "La educación transforma mentalidades a largo plazo de forma más sostenida.",
        "Muchos movimientos sociales generan resistencia y polarización sin lograr cambios.",
        "Las instituciones democráticas ofrecen canales formales para el cambio político.",
      ],
    },
    reglas: ["Usar argumentos basados en ejemplos históricos o actuales", "Respetar el tiempo asignado", "Escuchar activamente antes de responder"],
    tiempo_argumentacion_minutos: 4,
    criterios_evaluacion: ["Argumenta con ejemplos históricos o actuales concretos", "Presenta la postura de manera organizada y clara", "Refuta al menos un argumento de la postura contraria", "Demuestra comprensión del tema más allá de la postura asignada"],
    modalidad: "escrito" as const,
  },
  { // P03 — reflexion_escrita
    prompt: "Observa durante un día el trabajo que realizan las personas de tu hogar o comunidad cercana. Incluye en tu observación tanto el trabajo remunerado (con salario) como el no remunerado (doméstico, de cuidados, voluntario). Escribe: ¿quiénes hacen qué tipo de trabajo?, ¿hay una distribución equitativa?, ¿qué pasaría si el trabajo no remunerado desapareciera? Reflexiona críticamente sobre lo que observaste.",
    pistas: ["Incluye trabajo de hombres y mujeres, de diferentes edades.", "Distingue: trabajo formal (con sueldo) vs. informal (sin contrato) vs. no remunerado.", "La pregunta '¿qué pasaría si...?' te ayuda a ver la importancia del trabajo invisible."],
    longitud_minima_palabras: 100,
    longitud_maxima_palabras: 350,
    criterios_evaluacion: ["Describe el trabajo observado de forma concreta y específica", "Distingue entre trabajo remunerado, informal y no remunerado", "Reflexiona sobre la distribución y la equidad", "Incluye una mirada crítica propia, no solo descriptiva"],
    formato_esperado: "libre" as const,
  },
  { // P04 — debate_estructurado
    tema: "¿Es posible transformar las desigualdades estructurales de clase, género y etnia en México?",
    posturas: ["Las desigualdades estructurales pueden transformarse mediante políticas y acción colectiva", "Las desigualdades estructurales son tan profundas que los cambios reales son muy lentos o imposibles a corto plazo"],
    argumentos_guia: {
      "Las desigualdades estructurales pueden transformarse mediante políticas y acción colectiva": [
        "Países con similar historia colonial han reducido sus brechas con políticas redistributivas.",
        "Los movimientos sociales han logrado cambios legales significativos en décadas recientes.",
        "El reconocimiento de derechos de pueblos indígenas ha avanzado en algunos estados de México.",
        "La educación con perspectiva de género ha transformado actitudes en generaciones jóvenes.",
      ],
      "Las desigualdades estructurales son tan profundas que los cambios reales son muy lentos o imposibles a corto plazo": [
        "Las estructuras de poder tienen mecanismos de reproducción que resisten los cambios.",
        "Las élites económicas y políticas tienen interés en mantener el statu quo.",
        "Los cambios culturales (racismo, sexismo) son lentos y no dependen solo de leyes.",
        "La historia de México muestra ciclos donde los avances se revierten.",
      ],
    },
    reglas: ["Basarse en evidencia concreta de México u otros países", "Reconocer la complejidad del tema", "No descalificar posiciones contrarias sin argumentos"],
    tiempo_argumentacion_minutos: 5,
    criterios_evaluacion: ["Argumenta con evidencia específica de México o el mundo", "Aborda al menos dos categorías (clase, género o etnia)", "Responde con solidez a al menos un argumento contrario", "Muestra comprensión crítica del tema y postura personal fundamentada"],
    modalidad: "escrito" as const,
  },
];

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
