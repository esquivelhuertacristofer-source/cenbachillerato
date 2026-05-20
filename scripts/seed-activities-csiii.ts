/**
 * Seed de actividades pedagógicas para CS-III (Ciencias Sociales III, Semestre 4).
 * 3 propósitos × 3 actividades = 9 actividades. estado='publicada'.
 * Tipos: lectura, quiz_multiple_opcion, debate_estructurado,
 *        infografia, quiz_verdadero_falso, reflexion_escrita,
 *        video_con_preguntas (7 tipos)
 * Uso: npx tsx scripts/seed-activities-csiii.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🌱 Seed actividades CS-III — Crisis social, políticas públicas y juventudes\n");

  const progs = await getProgresionesDeUAC(sb, "CS-III");
  let ok = 0; let fail = 0;

  // 3 propósitos × 3 actividades = 9 total
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

  log(`\n✅ CS-III: ${ok} actividades insertadas, ${fail} fallidas.\n`);
}

const titulos = [
  {
    a1: "Causas y actores de las crisis sociales en México",
    a2: "¿Cuánto sabes sobre crisis sociales? Quiz de comprensión",
    a3: "Debate: ¿desigualdad estructural o decisiones políticas? Las raíces de las crisis en México",
  },
  {
    a1: "El ciclo de las políticas públicas: del problema a la solución",
    a2: "¿Verdadero o falso? Políticas públicas en México",
    a3: "Reflexión: un problema social de mi comunidad y la política pública que necesita",
  },
  {
    a1: "Las juventudes como sujetos políticos: agencia, derechos y participación",
    a2: "¿Cuánto sabes sobre derechos y participación juvenil?",
    a3: "Reflexión: mi participación y la forma de participación juvenil que más me mueve",
  },
];

const tiposA1 = ["lectura", "infografia", "video_con_preguntas"] as const;
const tiposA2 = ["quiz_multiple_opcion", "quiz_verdadero_falso", "quiz_multiple_opcion"] as const;
const tiposA3 = ["debate_estructurado", "reflexion_escrita", "reflexion_escrita"] as const;

// ── A1 ──────────────────────────────────────────────────────────────────────────
const contenidosA1 = [
  { // P01 — lectura (análisis multicausal de crisis social: COVID-19 en México)
    titulo: "La pandemia de COVID-19 en México: una crisis social desde múltiples escalas",
    texto: `En 2020, la pandemia de COVID-19 no solo fue una crisis sanitaria: fue también una crisis económica, social y política que expuso las fracturas estructurales de la sociedad mexicana y del mundo. Analizar lo que ocurrió nos permite comprender cómo se originan, se profundizan y se enfrentan las crisis sociales.\n\nDesde la escala global, la pandemia mostró la interdependencia de los sistemas productivos y logísticos mundiales. La interrupción de cadenas de suministro, el colapso del turismo y la caída del precio del petróleo golpearon simultáneamente a economías de todos los niveles. Organismos como la Organización Mundial de la Salud (OMS) y el Fondo Monetario Internacional (FMI) debieron coordinar respuestas urgentes, aunque con resultados desiguales según el poder de negociación de cada país.\n\nDesde la escala nacional, México enfrentó la pandemia con desafíos estructurales previos: aproximadamente el 55% de su fuerza laboral en la informalidad (sin acceso a seguro médico ni a prestaciones de desempleo), un sistema de salud público fragmentado (IMSS para trabajadores formales, ISSSTE para empleados del Estado, y el desmantelado Seguro Popular que en 2019 dio paso al INSABI) y altos niveles de enfermedades crónicas comórbidas como diabetes e hipertensión, especialmente prevalentes en sectores populares. México registró una de las tasas de exceso de mortalidad más altas del mundo durante 2020-2021, especialmente entre trabajadores informales y comunidades indígenas.\n\nDesde la escala local, las desigualdades se volvieron brutales: en las colonias populares de las grandes ciudades, el hacinamiento impedía el confinamiento; la pérdida de ingresos diarios era inmediata para vendedores ambulantes, obreros y jornaleros; y el acceso digital para estudiar en línea era un privilegio. Las mujeres soportaron una carga desproporcionada: trabajo doméstico y de cuidados intensificado, mayor violencia intrafamiliar y pérdida de empleo más pronunciada.\n\nLos actores involucrados fueron múltiples y con intereses distintos. El Estado mexicano (gobierno federal, gobiernos estatales, secretarías de salud) diseñó medidas de contención y apoyos económicos parciales (como el programa Sembrando Vida y los Programas de Bienestar, que continuaron operando). La sociedad civil —organizaciones comunitarias, colectivos feministas, redes de apoyo mutuo— llenó vacíos donde el Estado llegaba tarde o no llegaba. El sector empresarial negoció condiciones para la reapertura económica. Y los organismos internacionales (OPS, OMS, UNICEF) orientaron la política sanitaria y el acceso a vacunas.\n\nLa pandemia de COVID-19 ilustra un principio fundamental de las ciencias sociales: las crisis nunca son solo naturales o accidentales. Son el resultado de estructuras previas (desigualdad, falta de servicios públicos universales, informalidad laboral) que determinan quién sobrevive, quién pierde más y quién tiene voz para exigir respuestas.`,
    fuente: "Material elaborado para CEN Bachillerato — CS-III. Datos: INEGI, CONEVAL, OPS/OMS 2020-2022.",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 13,
    preguntas_comprension: [
      {
        pregunta: "¿Por qué los trabajadores informales en México fueron especialmente vulnerables durante la pandemia de COVID-19?",
        respuesta_guia: "Porque no tenían acceso a seguro médico ni a prestaciones por desempleo; su ingreso dependía del trabajo diario y no podían confinarse sin perder sus medios de subsistencia. La informalidad laboral, que afecta a aproximadamente el 55% de la fuerza laboral, dejó a millones sin redes de protección social.",
      },
      {
        pregunta: "¿Qué actores sociales identifica el texto y qué papel jugó cada uno durante la pandemia?",
        respuesta_guia: "El Estado (gobierno federal y estatales): diseñó medidas sanitarias y apoyos económicos parciales. La sociedad civil (OSC, colectivos, redes comunitarias): llenó vacíos donde el Estado no llegaba. El sector empresarial: negoció reactivación económica. Organismos internacionales (OMS, OPS, UNICEF): orientaron política sanitaria y acceso a vacunas.",
      },
      {
        pregunta: "¿Qué quiere decir el texto cuando afirma que las crisis 'nunca son solo naturales o accidentales'?",
        respuesta_guia: "Significa que las crisis no ocurren en un vacío: siempre se dan sobre estructuras previas de desigualdad, falta de servicios públicos y fragilidad institucional. Estas estructuras determinan quién resulta más afectado. La pandemia fue un evento biológico, pero su impacto social fue moldeado por decisiones políticas y económicas anteriores.",
      },
      {
        pregunta: "¿Cómo afectó la pandemia de manera diferenciada a las mujeres? ¿A qué se debe esa diferencia?",
        respuesta_guia: "Las mujeres enfrentaron mayor carga de trabajo doméstico y de cuidados (que se intensificó con el confinamiento), mayor violencia intrafamiliar y pérdida de empleo más pronunciada. Esto se debe a la división sexual del trabajo preexistente, que asigna a las mujeres la mayor parte del trabajo reproductivo no remunerado.",
      },
    ],
  },
  { // P02 — infografia (ciclo de políticas públicas)
    titulo: "El ciclo de las políticas públicas: cómo el Estado responde a los problemas sociales",
    url_imagen: "/placeholder/infografia.svg",
    descripcion_accesible: "Infografía del ciclo de las políticas públicas en seis fases: diagnóstico, diseño, implementación, evaluación, retroalimentación y participación ciudadana. Explica cada fase con ejemplos de programas sociales mexicanos reales y muestra cómo la participación ciudadana puede incidir en cada etapa.",
    puntos_clave: [
      "Diagnóstico: identificación y definición del problema social. Implica recopilar datos, escuchar a los afectados y determinar causas. Ejemplo: CONEVAL diagnostica la pobreza multidimensional en México con indicadores de ingreso, salud, educación, vivienda, servicios y alimentación.",
      "Diseño: elaboración de la propuesta de intervención pública. Incluye definir objetivos, población objetivo, presupuesto, mecanismos de operación y marco legal. Ejemplo: el diseño de la pensión para adultos mayores como derecho universal, inscrita en el Art. 4° constitucional en 2020.",
      "Implementación: puesta en marcha de la política. Involucra a dependencias gubernamentales, recursos humanos, reglas de operación y coordinación interinstitucional. Ejemplo: la distribución de apoyos del programa Sembrando Vida a ejidatarios y comuneros en zonas rurales.",
      "Evaluación: medición del cumplimiento de objetivos. Puede ser interna (la propia dependencia) o externa (CONEVAL, ASF, investigadores). Valora eficiencia, eficacia, cobertura e impacto. Ejemplo: las evaluaciones de CONEVAL al PROSPERA/Becas Bienestar que midieron cambios en asistencia escolar.",
      "Retroalimentación: uso de los resultados de la evaluación para corregir, ajustar o cancelar la política. Cierra el ciclo y reinicia el diagnóstico con nueva información. Ejemplo: la transformación del Seguro Popular en INSABI en 2020 como respuesta a diagnósticos de acceso desigual al sistema de salud.",
      "Participación ciudadana en cada fase: los ciudadanos pueden y deben incidir en todo el ciclo: denunciando problemas (diagnóstico), proponiendo soluciones (diseño), vigilando la ejecución (implementación), auditando resultados (evaluación) y exigiendo cambios (retroalimentación). Mecanismos: consultas públicas, contralorías sociales, acceso a información (INAI), organizaciones civiles y movilización social.",
    ],
    fuente: "Material CEN Bachillerato — CS-III. Referencia: CONEVAL, Secretaría de Hacienda y Crédito Público, Ley de Planeación 2023.",
  },
  { // P03 — video_con_preguntas (participación política juvenil en México)
    url_video: "https://example.com/video-pendiente-cen",
    titulo_video: "Juventudes que mueven México: #YoSoy132, voto joven y participación política",
    duracion_segundos: 480,
    preguntas: [
      {
        tiempo_segundos: 110,
        pregunta: "¿Qué fue el movimiento #YoSoy132 y qué lo desencadenó en 2012?",
        respuesta_guia: "El #YoSoy132 fue un movimiento estudiantil surgido en mayo de 2012, durante la campaña presidencial. Comenzó cuando estudiantes de la Universidad Iberoamericana protestaron contra Enrique Peña Nieto y respondieron colectivamente a quienes cuestionaron su identidad estudiantil. Criticaba la concentración mediática (Televisa y TV Azteca) y demandaba democratización de los medios y transparencia electoral. Se extendió a universidades públicas y privadas, incluyendo la UNAM y el IPN.",
      },
      {
        tiempo_segundos: 280,
        pregunta: "¿Qué implica la reforma constitucional que permite votar a los 17 años en México y qué debate social generó?",
        respuesta_guia: "La reforma al Art. 34 constitucional para reducir la edad de voto activo a 17 años reconoce que los jóvenes tienen capacidad para participar en decisiones políticas antes de cumplir 18. El debate incluyó argumentos a favor (madurez política, interés de los jóvenes en el futuro del país) y en contra (preocupación por la influencia familiar o institucional en el voto). Amplió el padrón electoral y reconoce a los jóvenes como sujetos políticos.",
      },
      {
        tiempo_segundos: 400,
        pregunta: "¿Por qué los movimientos estudiantiles en la UNAM (como el del CGH en 1999-2000) son considerados una forma de participación juvenil con impacto político más allá del campus universitario?",
        respuesta_guia: "Porque sus demandas trascendieron lo universitario: el movimiento de 1999-2000 en la UNAM (huelga contra la propuesta de cobro de cuotas) debatió el derecho a la educación pública y gratuita como bien común. Involucró a cientos de miles de estudiantes, activó solidaridades en toda la sociedad y obligó al Estado a retirar la propuesta de cuotas. Demostró que la organización estudiantil puede disputar políticas públicas a escala nacional.",
      },
    ],
  },
];

// ── A2 ──────────────────────────────────────────────────────────────────────────
const contenidosA2 = [
  { // P01 — quiz_multiple_opcion (tipos de crisis, actores, escalas, multicausalidad)
    preguntas: [
      {
        enunciado: "¿Qué distingue a una crisis social de un problema social ordinario?",
        opciones: [
          "Una crisis social solo afecta a un grupo pequeño de la población",
          "Una crisis social implica una ruptura o desequilibrio profundo que afecta a amplios sectores de la sociedad, supera la capacidad de respuesta de las instituciones y exige intervención urgente",
          "Los problemas sociales son siempre de origen económico; las crisis, de origen político",
          "Una crisis social es un evento natural, no construido socialmente",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "Una crisis social se distingue por su magnitud, su capacidad de desestabilizar sistemas institucionales y por afectar a amplios sectores de forma simultánea. Ejemplos: la pandemia de COVID-19, la crisis hídrica de Monterrey (2022) o la crisis de violencia en algunas regiones del país.",
      },
      {
        enunciado: "¿Qué es el análisis multiescalar en las ciencias sociales?",
        opciones: [
          "El estudio de una crisis solo desde la perspectiva del Estado nacional",
          "El enfoque que analiza un fenómeno social simultáneamente desde diferentes niveles: local, regional, nacional y global, para entender sus causas y efectos en cada nivel",
          "La medición estadística de un problema con diferentes instrumentos de medición",
          "Un método de encuesta que aplica el mismo cuestionario en varias ciudades",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "El análisis multiescalar reconoce que los fenómenos sociales tienen causas y consecuencias que operan al mismo tiempo en diferentes niveles. La crisis de agua en Monterrey (2022), por ejemplo, tenía causas locales (gestión del recurso), nacionales (política hídrica, CONAGUA) y globales (cambio climático).",
      },
      {
        enunciado: "Durante la crisis hídrica de Monterrey en 2022, ¿cuáles fueron actores clave involucrados?",
        opciones: [
          "Solo el gobierno federal y las empresas de agua potable",
          "Gobierno estatal y municipal, empresas industriales y zonas residenciales de alto consumo, comunidades afectadas por cortes de agua, CONAGUA y organizaciones civiles que denunciaron inequidad en la distribución",
          "Únicamente los agricultores de la región",
          "Solo organismos internacionales como el Banco Mundial",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "La crisis hídrica de Monterrey (2022) involucró múltiples actores con intereses distintos: el gobierno estatal gestionó la emergencia; la industria y los fraccionamientos de alto consumo fueron señalados por acaparar el recurso; las colonias populares sufrieron cortes prolongados; CONAGUA administraba las concesiones; y organizaciones civiles visibilizaron la desigualdad en el acceso al agua.",
      },
      {
        enunciado: "¿Qué se entiende por 'causas estructurales' de una crisis social?",
        opciones: [
          "Las causas inmediatas o visibles que provocan el estallido de la crisis",
          "Las condiciones históricas, económicas y sociales de largo plazo (desigualdad, exclusión, falta de servicios) que crean la vulnerabilidad sobre la que opera la crisis",
          "Los errores individuales de los funcionarios públicos que generan la crisis",
          "Los desastres naturales que desencadenan emergencias humanitarias",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "Las causas estructurales son las condiciones de fondo que hacen a una sociedad vulnerable: la pobreza acumulada, la falta de servicios universales de salud o agua, la informalidad laboral, la discriminación histórica. Estas condiciones no causan la crisis por sí solas, pero determinan quién la sufre más y con menos recursos para responder.",
      },
      {
        enunciado: "¿Cuál de las siguientes es una característica de la multicausalidad en el análisis de crisis sociales?",
        opciones: [
          "Que una crisis siempre tiene una única causa principal identificable",
          "Que las crisis resultan de la combinación de factores económicos, políticos, ambientales, históricos y culturales que se potencian entre sí",
          "Que las causas de una crisis son siempre externas al país o región afectada",
          "Que la causa más importante siempre es la más reciente",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "La multicausalidad implica que las crisis no tienen una sola causa: son el resultado de la convergencia de múltiples factores que se refuerzan. En el caso de la pandemia, se combinaron: la fragilidad del sistema de salud (histórica), la informalidad laboral (estructural), las comorbilidades crónicas (problema de salud pública previo) y la respuesta tardía o desigual del Estado.",
      },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P02 — quiz_verdadero_falso (políticas públicas en México)
    preguntas: [
      {
        enunciado: "El IMSS (Instituto Mexicano del Seguro Social) brinda atención médica a todos los mexicanos, independientemente de si tienen empleo formal o no.",
        respuesta: false,
        retroalimentacion: "El IMSS cubre principalmente a trabajadores del sector formal y sus familias. Los trabajadores informales (aproximadamente el 55% de la fuerza laboral) no tienen acceso automático al IMSS; históricamente han dependido del Seguro Popular (hoy INSABI/IMSS-Bienestar) u otros servicios de salud pública.",
      },
      {
        enunciado: "El programa Sembrando Vida está diseñado para apoyar a ejidatarios y comuneros con proyectos agroforestales productivos en zonas rurales.",
        respuesta: true,
        retroalimentacion: "Correcto. Sembrando Vida es un programa federal que otorga apoyos económicos mensuales y asistencia técnica a pequeños productores rurales para establecer sistemas agroforestales, con el objetivo de reactivar la producción agropecuaria y el tejido social comunitario.",
      },
      {
        enunciado: "CONEVAL es la institución encargada de medir la pobreza en México y evaluar la efectividad de los programas sociales del gobierno federal.",
        respuesta: true,
        retroalimentacion: "Correcto. El Consejo Nacional de Evaluación de la Política de Desarrollo Social (CONEVAL) mide la pobreza multidimensional en México con una metodología que combina indicadores de bienestar económico y derechos sociales (salud, educación, vivienda, alimentación, seguridad social y servicios básicos).",
      },
      {
        enunciado: "En México, la participación ciudadana en el diseño de políticas públicas está completamente prohibida por la Constitución.",
        respuesta: false,
        retroalimentacion: "Todo lo contrario: el Art. 39 de la Constitución establece que la soberanía nacional reside en el pueblo. La Ley de Planeación y otras leyes establecen mecanismos de consulta y participación ciudadana. Además, la Ley Federal de Transparencia y Acceso a la Información (LFTAIP) garantiza el derecho ciudadano a conocer y cuestionar las políticas públicas.",
      },
      {
        enunciado: "CONAFE (Consejo Nacional de Fomento Educativo) atiende a comunidades rurales e indígenas con alta marginación que no cuentan con escuela regular.",
        respuesta: true,
        retroalimentacion: "Correcto. El CONAFE lleva educación a comunidades pequeñas y dispersas en todo México, con instructores comunitarios (jóvenes que se forman como educadores). Es uno de los pocos programas educativos diseñados específicamente para contextos de alta marginación rural.",
      },
      {
        enunciado: "La evaluación de políticas públicas es una etapa opcional que el gobierno puede omitir si considera que el programa está funcionando.",
        respuesta: false,
        retroalimentacion: "La evaluación es obligatoria para los programas sujetos a reglas de operación en México, conforme a la Ley Federal de Presupuesto y Responsabilidad Hacendaria. CONEVAL está facultado por ley para evaluar de forma independiente los programas sociales del gobierno federal, aunque en la práctica la rendición de cuentas presenta limitaciones.",
      },
    ],
    intentos_maximos: 2,
    puntaje_minimo_aprobacion: 70,
  },
  { // P03 — quiz_multiple_opcion (derechos juveniles, participación, agencia, movimientos)
    preguntas: [
      {
        enunciado: "¿Qué establece el Artículo 35 de la Constitución Política de los Estados Unidos Mexicanos en relación con los ciudadanos jóvenes?",
        opciones: [
          "Que los jóvenes menores de 21 años no pueden votar en ninguna elección",
          "Que son derechos del ciudadano votar en las elecciones y consultas populares, poder ser votado para cargos de elección popular, y asociarse individual y libremente para tomar parte en los asuntos políticos del país",
          "Que la participación política está reservada exclusivamente a personas mayores de 30 años con credencial de elector",
          "Que los jóvenes solo pueden participar en elecciones federales, no locales",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "El Art. 35 de la Constitución establece los derechos políticos de los ciudadanos mexicanos. Con la reforma para el voto a los 17 años, los jóvenes que cumplan esa edad antes de la jornada electoral pueden ejercer el voto activo. El derecho a ser votado y a asociarse políticamente se adquiere al cumplir 18 años (ciudadanía plena).",
      },
      {
        enunciado: "¿Por qué las ciencias sociales consideran a las juventudes como 'sujetos históricos'?",
        opciones: [
          "Porque los jóvenes siempre han sido los únicos agentes del cambio social en la historia",
          "Porque las juventudes son actores que producen historia: sus acciones, demandas y formas de organización transforman las sociedades, no son solo receptores pasivos de la cultura adulta",
          "Porque los jóvenes heredan la historia de sus padres sin posibilidad de modificarla",
          "Porque 'sujeto histórico' es simplemente una forma académica de decir que los jóvenes estudian historia en la escuela",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "Considerar a las juventudes como sujetos históricos implica reconocer que no son solo el 'futuro' del país, sino actores presentes con capacidad de transformar el presente. El #YoSoy132, el movimiento estudiantil del 68, las marchas feministas encabezadas por jóvenes, o el voto joven en elecciones recientes son ejemplos de cómo la acción juvenil ha modificado el curso político de México.",
      },
      {
        enunciado: "¿Cuál de las siguientes opciones describe mejor la 'participación cultural' como forma de participación política juvenil?",
        opciones: [
          "Asistir a clases de danza folklórica en la escuela",
          "Usar el arte, la música, el grafiti, las redes sociales o la cultura popular como medios para expresar demandas políticas, visibilizar injusticias y construir identidades colectivas",
          "Coleccionar objetos culturales de diferentes regiones del país",
          "Participar en concursos académicos de historia y ciencias sociales",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "La participación cultural como forma política incluye el rap que denuncia la violencia policial, los murales que reivindican derechos de comunidades, los memes que critican al poder, los hashtags que amplifican demandas y los colectivos culturales que construyen comunidad. En México, el movimiento feminista ha usado el arte callejero como instrumento político de alta visibilidad.",
      },
      {
        enunciado: "¿Qué es la 'agencia política' de las juventudes en el contexto de las ciencias sociales?",
        opciones: [
          "La capacidad de los jóvenes para trabajar como agentes electorales en las casillas",
          "La capacidad de los jóvenes para actuar de forma deliberada, organizada y con propósito en la esfera pública, influyendo en las decisiones colectivas que afectan sus vidas",
          "La obligación de los partidos políticos de contratar jóvenes como empleados",
          "El conjunto de restricciones legales que limitan la participación política de los menores de edad",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "La agencia política implica reconocer que los jóvenes no actúan solo por impulso o influencia de otros: tienen capacidad de reflexión, organización y acción propia. Esto implica reconocerlos como sujetos con derechos presentes, no solo como ciudadanos del futuro.",
      },
      {
        enunciado: "¿Cuál de las siguientes es una forma de participación comunitaria juvenil reconocida en México?",
        opciones: [
          "Pertenecer a una empresa transnacional como becario",
          "Integrarse a brigadas comunitarias de limpieza, comités de seguridad vecinal, redes de ayuda mutua o proyectos culturales en el barrio o comunidad",
          "Publicar contenido en redes sociales de carácter exclusivamente personal",
          "Asistir obligatoriamente a actos cívicos escolares",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "La participación comunitaria incluye todas las formas de involucramiento en la vida colectiva del barrio, pueblo o comunidad: desde los comités escolares y las brigadas de salud hasta los colectivos culturales y las redes de apoyo mutuo. Estas formas de participación construyen capital social y son reconocidas en instrumentos como la Ley General de Desarrollo Social y la Ley de la Juventud de cada entidad federativa.",
      },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
];

// ── A3 ──────────────────────────────────────────────────────────────────────────
const contenidosA3 = [
  { // P01 — debate_estructurado (PRIORITY)
    tema: "¿Cuál es la principal causa de las crisis sociales en México: la desigualdad estructural heredada o las decisiones políticas recientes?",
    posturas: [
      "La principal causa es la desigualdad estructural heredada: siglos de colonialismo, concentración de la riqueza y exclusión que ningún gobierno ha podido desmantelar",
      "La principal causa son las decisiones políticas recientes: la corrupción, la mala gestión del Estado y las políticas económicas de las últimas décadas profundizan las crisis",
    ],
    argumentos_guia: {
      "La principal causa es la desigualdad estructural heredada: siglos de colonialismo, concentración de la riqueza y exclusión que ningún gobierno ha podido desmantelar": [
        "México nació como país con una profunda desigualdad heredada del sistema colonial: la concentración de tierras (haciendas), la exclusión de pueblos indígenas y afrodescendientes, y la estratificación racial siguen configurando las oportunidades de vida siglos después.",
        "El coeficiente de GINI de México (~0.44) muestra una desigualdad de ingreso que no ha variado sustancialmente en décadas, independientemente del partido en el gobierno, lo que sugiere causas estructurales más profundas que las decisiones de un sexenio.",
        "La informalidad laboral (~55% de la PEA) no es un fenómeno reciente: es resultado de décadas de un modelo de industrialización que nunca incorporó plenamente a la población en empleos formales con derechos.",
        "Comunidades indígenas y afromexicanas concentran los peores indicadores de desarrollo (CONEVAL, INEGI) no por decisiones de un gobierno concreto, sino por exclusiones acumuladas durante generaciones que ninguna política pública ha revertido completamente.",
      ],
      "La principal causa son las decisiones políticas recientes: la corrupción, la mala gestión del Estado y las políticas económicas de las últimas décadas profundizan las crisis": [
        "Las políticas de austeridad de los años ochenta y noventa (Consenso de Washington, privatizaciones, reducción del gasto social) desmantelaron servicios públicos que tardaron décadas en reconstruirse, agravando la vulnerabilidad social ante crisis como la pandemia.",
        "La corrupción en los programas sociales (desvío de recursos del FONDEN, fraudes en reconstrucción post-sismo de 2017) no es 'herencia colonial': son decisiones concretas de funcionarios concretos en sexenios recientes.",
        "La crisis de seguridad y violencia que afecta a México —con más de 30,000 homicidios anuales en los años recientes— es resultado en gran parte de decisiones de política de seguridad, acuerdos fallidos con el crimen organizado y falta de estado de derecho, no de determinismos históricos.",
        "El desmantelamiento del Seguro Popular en 2019-2020 y la transición fallida al INSABI justo antes de la pandemia es un ejemplo claro de cómo una decisión política reciente puede agravar una crisis sanitaria estructural.",
      ],
    },
    reglas: [
      "Presentar los argumentos con orden y claridad, sin interrumpir al compañero",
      "Apoyar cada argumento con al menos un ejemplo concreto de México (programa, dato, evento histórico)",
      "Escuchar la postura contraria antes de refutarla: describir con precisión el argumento del otro antes de responder",
      "No atacar a personas ni partidos políticos; debatir ideas y evidencias",
    ],
    criterios_evaluacion: [
      "Presenta al menos 3 de los 4 argumentos guía de su postura, con ejemplos concretos de México",
      "Refuta al menos un argumento de la postura contraria con evidencia o contraejemplo",
      "Mantiene un tono analítico y respetuoso a lo largo del debate",
    ],
    tiempo_argumentacion_minutos: 5,
    modalidad: "escrito" as const,
  },
  { // P02 — reflexion_escrita (problema social en la comunidad del estudiante + propuesta de política pública)
    prompt: "Identifica un problema social concreto que exista en tu comunidad, barrio, municipio o ciudad. Puede ser falta de agua potable, violencia, falta de empleo, basura, contaminación, falta de espacios para jóvenes, abandono escolar u otro que conozcas de primera mano.\n\nEscribe una reflexión que incluya:\n1. Descripción del problema: ¿qué ocurre, a quiénes afecta y desde cuándo?\n2. Diagnóstico de causas: ¿por qué existe ese problema? Identifica al menos una causa estructural y un actor responsable.\n3. Una propuesta de política pública concreta: ¿qué acción debería tomar el gobierno (municipal, estatal o federal)? ¿Qué institución debería implementarla? ¿Cómo involucraría a la ciudadanía?\n\nNo es necesario que sea perfecta. Lo importante es que pienses como ciudadano/a que conoce su contexto y exige respuestas al Estado.",
    pistas: [
      "Para el diagnóstico de causas, pregúntate: ¿este problema existía antes? ¿Qué condiciones estructurales lo mantienen? ¿Hay alguna decisión política o falta de inversión que lo agrave?",
      "Para los actores: ¿quién tiene el poder de cambiar esta situación? ¿El gobierno municipal, el estatal, el federal? ¿Una empresa privada? ¿La comunidad organizada?",
      "Para la propuesta: no digas solo 'que el gobierno haga algo'. Sé específico/a: ¿qué tipo de programa, qué presupuesto aproximado, quién lo operaría, cómo sabrías si está funcionando?",
      "Puedes inspirarte en programas reales que existen en México (CONAGUA, IMSS-Bienestar, INFONAVIT, CONAFE) o proponer algo nuevo que no exista todavía.",
    ],
    longitud_minima_palabras: 80,
    criterios_evaluacion: [
      "Describe un problema social concreto y local con al menos un detalle específico del contexto",
      "Identifica al menos una causa estructural y un actor responsable",
      "Propone una acción de política pública específica con la institución que debería implementarla",
      "Considera, aunque sea brevemente, cómo participaría la ciudadanía en esa política",
    ],
  },
  { // P03 — reflexion_escrita (participación juvenil propia + forma de participación más impactante)
    prompt: "Esta reflexión es sobre ti, no sobre conceptos abstractos.\n\n¿Alguna vez has participado en algo colectivo? Puede ser una marcha, una brigada, un comité escolar, una colecta, un grupo de WhatsApp de vecinos, un equipo deportivo con causa, una publicación viral, un proyecto comunitario, o cualquier acción que hayas hecho junto con otros para lograr algo.\n\nEscribe:\n1. Cuéntalo: ¿en qué participaste? ¿Con quiénes? ¿Qué querían lograr?\n2. ¿Lo lograron? ¿Qué aprendiste de esa experiencia?\n3. Si nunca has participado en nada colectivo, reflexiona honestamente: ¿por qué no? ¿Qué lo ha impedido (miedo, falta de oportunidad, desconfianza, otra razón)?\n4. De todas las formas de participación juvenil que viste en esta progresión (electoral, comunitaria, cultural, digital), ¿cuál te parece la más poderosa para transformar algo real? Argumenta por qué.\n\nNo hay respuesta correcta. Solo honestidad y pensamiento propio.",
    pistas: [
      "No necesitas haber participado en algo 'grande' o famoso. Una colecta para un compañero enfermo, limpiar el parque del barrio o hacer un video sobre un problema local cuentan.",
      "Si no has participado nunca en nada colectivo, eso también es valioso de explorar: ¿qué condiciones o experiencias llevan a la no-participación? Es una pregunta legítima de las ciencias sociales.",
      "Para elegir la forma de participación más poderosa, piensa en qué contexto la usarías: ¿qué problema quieres resolver? ¿Con quiénes cuentas? ¿Qué recursos tienes?",
      "Relaciona tu respuesta con algo concreto que viste en esta progresión: el #YoSoy132, el voto joven, movimientos estudiantiles, participación comunitaria o digital.",
    ],
    longitud_minima_palabras: 80,
    criterios_evaluacion: [
      "Narra una experiencia de participación colectiva propia (o reflexiona honestamente sobre la no-participación) con detalles concretos",
      "Identifica algo que aprendió o algo que le impidió participar, con argumentos propios",
      "Elige una forma de participación juvenil y argumenta por qué la considera la más poderosa, con fundamento en contenidos de la progresión",
      "La reflexión es genuina y personal, no una respuesta genérica sobre 'la importancia de participar'",
    ],
  },
];

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
