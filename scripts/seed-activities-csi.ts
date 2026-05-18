/**
 * Seed de actividades pedagógicas para CS-I (Ciencias Sociales I).
 * 4 progresiones × 3 actividades = 12 actividades. estado='borrador'.
 * A1=lectura, A2=debate_estructurado, A3=reflexion_escrita.
 * Uso: npx tsx scripts/seed-activities-csi.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🌱 Seed actividades CS-I — Ciencias Sociales I\n");

  const progs = await getProgresionesDeUAC(sb, "CS-I");
  let ok = 0; let fail = 0;

  for (const p of progs) {
    const base = p.codigo;

    const a1ok = await upsertActividad(sb, {
      codigo: `${base}-A1`,
      titulo: titulos[p.numero - 1].a1,
      descripcion: "Lectura de contextualización sobre el tema de ciencias sociales.",
      tipo: "lectura",
      progresion_id: p.id,
      xp: 10,
      contenido: lecturas[p.numero - 1],
    });
    a1ok ? ok++ : fail++;

    const a2ok = await upsertActividad(sb, {
      codigo: `${base}-A2`,
      titulo: titulos[p.numero - 1].a2,
      descripcion: "Debate estructurado para analizar posturas y construir argumentos.",
      tipo: "debate_estructurado",
      progresion_id: p.id,
      xp: 15,
      contenido: debates[p.numero - 1],
    });
    a2ok ? ok++ : fail++;

    const a3ok = await upsertActividad(sb, {
      codigo: `${base}-A3`,
      titulo: titulos[p.numero - 1].a3,
      descripcion: "Reflexión escrita de cierre y análisis crítico.",
      tipo: "reflexion_escrita",
      progresion_id: p.id,
      xp: 20,
      contenido: reflexiones[p.numero - 1],
    });
    a3ok ? ok++ : fail++;
  }

  log(`\n✅ CS-I: ${ok} actividades insertadas, ${fail} fallidas.\n`);
}

// ── TÍTULOS ───────────────────────────────────────────────────────────────────

const titulos = [
  { a1: "El Estado: ¿qué es y para qué sirve?", a2: "¿El Estado cumple su función?", a3: "Mi relación con el Estado mexicano" },
  { a1: "¿Qué significa ser ciudadano/a hoy?", a2: "Ciudadanía formal vs. ciudadanía real", a3: "Soy ciudadano/a: ¿qué hago con eso?" },
  { a1: "Las normas sociales: ¿naturales o construidas?", a2: "¿Debemos obedecer las leyes que consideramos injustas?", a3: "Una norma que cambiaría y por qué" },
  { a1: "Diversidad, democracia y justicia", a2: "¿La diversidad fortalece o complica la democracia?", a3: "Diversidad en mi comunidad y en mi escuela" },
];

// ── LECTURAS (A1) ─────────────────────────────────────────────────────────────

const lecturas = [
  { // P01 — Estado, instituciones y ciudadanía
    texto: `El Estado es la forma de organización política que permite a una sociedad vivir bajo un sistema de normas comunes, resolver conflictos y tomar decisiones colectivas. En la teoría política clásica, el Estado se define por tres elementos: un territorio delimitado, una población que lo habita y un gobierno con el monopolio legítimo de la fuerza. Pero el Estado no es solo un conjunto de instituciones: es una relación social, una forma en que una sociedad se organiza para distribuir el poder y los recursos.\n\nEn México, el Estado está compuesto por tres poderes: el Ejecutivo (presidente de la república, gobernadores, presidentes municipales), el Legislativo (Congreso de la Unión: Senado y Cámara de Diputados; congresos locales) y el Judicial (Suprema Corte de Justicia, tribunales). Cada uno tiene funciones específicas y se supone que se controlan mutuamente.\n\nLas funciones del Estado incluyen garantizar la seguridad, administrar justicia, proveer servicios públicos (educación, salud, agua, transporte), recaudar impuestos y representar al país en el exterior. Cuando el Estado no cumple estas funciones de manera equitativa, se habla de "fallas del Estado" o de "captura del Estado" por intereses particulares.\n\nLa relación entre Estado y ciudadanía es bidireccional: el Estado tiene obligaciones hacia los ciudadanos, y los ciudadanos tienen derechos y deberes hacia el Estado. Esta relación no es estática: se transforma a través de la historia, los movimientos sociales y la acción política.`,
    fuente: "Material elaborado para CEN Bachillerato",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 9,
    preguntas_comprension: [
      { pregunta: "¿Cuáles son los tres elementos clásicos del Estado?", respuesta_guia: "Territorio delimitado, población y gobierno con monopolio legítimo de la fuerza." },
      { pregunta: "¿Cuáles son los tres poderes del Estado mexicano?", respuesta_guia: "Ejecutivo, Legislativo y Judicial." },
      { pregunta: "¿Por qué el texto dice que la relación Estado-ciudadanía es 'bidireccional'?", respuesta_guia: "Porque el Estado tiene obligaciones hacia los ciudadanos y los ciudadanos tienen derechos y deberes hacia el Estado." },
    ],
  },
  { // P02 — ciudadanía
    texto: `La ciudadanía es una de las ideas más importantes y más disputadas de la modernidad. En su dimensión formal, ser ciudadano significa tener un estatus jurídico reconocido por el Estado: documentos de identidad, derecho a votar, a ser votado, a acceder a servicios públicos. En México, la ciudadanía formal se adquiere a los 18 años con la credencial del INE.\n\nPero la ciudadanía tiene también una dimensión sustantiva o real, que no siempre coincide con la formal. Una persona puede tener todos los papeles en regla y sin embargo no poder ejercer sus derechos plenos: por falta de acceso a información, por discriminación, por vivir en una zona marginada donde el Estado no llega, por barreras económicas o culturales.\n\nHistóricamente, la ciudadanía ha sido un derecho que se ha ido ampliando: en muchos países, las mujeres no podían votar hasta el siglo XX (en México obtuvieron el sufragio en 1953), las personas de ciertos grupos étnicos eran excluidas, y los trabajadores sin propiedad no tenían derechos políticos. Esta historia muestra que la ciudadanía no es un dato natural: es una conquista que resulta de luchas y movimientos sociales.\n\nHoy, el concepto de ciudadanía se expande para incluir dimensiones como la ciudadanía digital (derechos y responsabilidades en el entorno virtual), la ciudadanía ambiental (responsabilidades hacia el planeta) y la ciudadanía global (conciencia de los problemas que trascienden las fronteras nacionales).`,
    fuente: "Material elaborado para CEN Bachillerato",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 9,
    preguntas_comprension: [
      { pregunta: "¿Cuál es la diferencia entre ciudadanía formal y ciudadanía sustantiva?", respuesta_guia: "La formal es el estatus jurídico; la sustantiva es la capacidad real de ejercer los derechos." },
      { pregunta: "¿En qué año obtuvieron las mujeres mexicanas el derecho al voto?", respuesta_guia: "En 1953." },
      { pregunta: "¿Por qué el texto dice que la ciudadanía es una 'conquista'?", respuesta_guia: "Porque ha sido históricamente negada a muchos grupos y se ha ampliado gracias a luchas y movimientos sociales." },
    ],
  },
  { // P03 — normas sociales e instituciones
    texto: `Las normas sociales son las reglas, escritas o no escritas, que regulan el comportamiento en una sociedad. Algunas son formales (leyes, reglamentos, constituciones) y otras son informales (costumbres, tradiciones, expectativas culturales). Las normas no son naturales ni eternas: son construcciones históricas que responden a las necesidades, valores y relaciones de poder de cada época y contexto.\n\nLo que hoy parece "normal" o "natural" fue en algún momento cuestionado, disputado y a veces impuesto. La esclavitud fue legal durante siglos. El trabajo infantil fue aceptado socialmente hace cien años. La exclusión de las mujeres de la vida pública se justificaba con argumentos "naturales" que hoy reconocemos como ideología. Esto no significa que todas las normas sean arbitrarias o que debamos rechazarlas: significa que debemos comprenderlas históricamente y cuestionarlas cuando producen injusticia.\n\nLas instituciones son conjuntos estables de normas, prácticas y organizaciones que estructuran la vida social: la familia, la escuela, el mercado, el sistema judicial, los partidos políticos. Las instituciones no son neutras: reflejan los valores y las relaciones de poder de la sociedad que las construyó. Por eso pueden ser transformadas cuando la sociedad lo demanda.\n\nEl cambio social ocurre precisamente cuando las personas y los movimientos cuestionan las normas e instituciones existentes y proponen alternativas. La historia está llena de ejemplos: el movimiento feminista, el movimiento por los derechos civiles, los movimientos indígenas, el movimiento LGBTQ+.`,
    fuente: "Material elaborado para CEN Bachillerato",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 9,
    preguntas_comprension: [
      { pregunta: "¿Cuál es la diferencia entre normas formales e informales?", respuesta_guia: "Las formales son escritas (leyes, reglamentos); las informales son costumbres y expectativas culturales no escritas." },
      { pregunta: "¿Por qué el texto dice que las normas son 'construcciones históricas'?", respuesta_guia: "Porque no son naturales ni eternas, sino que responden a necesidades, valores y relaciones de poder de cada época." },
      { pregunta: "¿Qué ejemplos da el texto de movimientos que cambiaron normas e instituciones?", respuesta_guia: "El movimiento feminista, por derechos civiles, indígenas y LGBTQ+." },
    ],
  },
  { // P04 — diversidad y democracia
    texto: `La diversidad —étnica, cultural, de género, de orientación sexual, de capacidad, de clase— no es un problema que la sociedad deba resolver: es una condición fundamental de la vida social y, en democracia, una riqueza. Sin embargo, históricamente las sociedades han tendido a tratar la diferencia como amenaza, estableciendo jerarquías entre grupos: unos "superiores" (blancos, hombres, heterosexuales, sin discapacidad) y otros "inferiores" o simplemente invisibles.\n\nEn México, la diversidad es una realidad inescapable: somos un país pluriétnico y multicultural, con más de 68 lenguas indígenas reconocidas, profundas diferencias regionales, una historia de migración interna e internacional, y una creciente visibilidad de identidades de género y orientación sexual diversas. Esta diversidad coexiste con el racismo estructural, la discriminación por género, la homofobia institucional y la marginación de personas con discapacidad.\n\nUna democracia sustantiva —no solo procedimental— requiere que todos los grupos puedan participar en igualdad de condiciones en la toma de decisiones que les afectan. Esto implica no solo garantizar el voto, sino eliminar las barreras económicas, culturales e históricas que impiden la participación real. También implica reconocer que algunas voces han sido históricamente silenciadas y que construir una sociedad más justa requiere escucharlas activamente.\n\nEl reconocimiento de la diversidad como valor democrático no es relativismo: no significa que "todo vale". Significa que la pluralidad de perspectivas enriquece la deliberación colectiva y que los derechos de todos los grupos merecen protección.`,
    fuente: "Material elaborado para CEN Bachillerato",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 9,
    preguntas_comprension: [
      { pregunta: "¿Cuántas lenguas indígenas reconoce México según el texto?", respuesta_guia: "Más de 68 lenguas indígenas." },
      { pregunta: "¿Cuál es la diferencia entre democracia procedimental y democracia sustantiva?", respuesta_guia: "La procedimental garantiza el voto; la sustantiva asegura que todos puedan participar en igualdad real de condiciones." },
      { pregunta: "¿El reconocimiento de la diversidad significa que 'todo vale'? ¿Por qué?", respuesta_guia: "No, significa que la pluralidad enriquece la deliberación y que todos los grupos merecen protección de derechos." },
    ],
  },
];

// ── DEBATES (A2) ──────────────────────────────────────────────────────────────

const debates = [
  { // P01 — Estado
    tema: "¿El Estado mexicano cumple su función de garantizar derechos a todos los ciudadanos por igual?",
    posturas: [
      "Sí cumple: tiene instituciones, leyes y programas sociales que garantizan derechos básicos a la mayoría.",
      "No cumple: existen desigualdades profundas, corrupción y fallas estructurales que impiden el acceso igualitario a derechos."
    ],
    argumentos_guia: {
      "Sí cumple": [
        "El Estado mexicano tiene una Constitución que reconoce derechos fundamentales.",
        "Programas como el IMSS, ISSSTE, escuelas públicas y hospitales existen en todo el país.",
        "Las instituciones electorales garantizan elecciones periódicas y competitivas."
      ],
      "No cumple": [
        "Millones de personas en zonas rurales e indígenas carecen de acceso real a salud, educación y justicia.",
        "La impunidad en México supera el 90%: la mayoría de los delitos no tienen consecuencias legales.",
        "La corrupción desvía recursos que deberían llegar a los ciudadanos más vulnerables."
      ]
    },
    reglas: [
      "Cada postura tiene 3 minutos para argumentar.",
      "Respetar los turnos y no interrumpir al otro participante.",
      "Los argumentos deben basarse en hechos o razonamientos, no en insultos.",
      "Al final, cada postura puede hacer una pregunta a la otra."
    ],
    tiempo_argumentacion_minutos: 3,
    criterios_evaluacion: [
      "Presenta al menos 2 argumentos con evidencia o razonamiento",
      "Escucha y responde a los argumentos de la postura contraria",
      "Mantiene un tono respetuoso y no descalifica a la persona",
      "Puede matizar su postura original tras el debate"
    ],
    modalidad: "escrito" as const,
  },
  { // P02 — ciudadanía
    tema: "¿Es posible ser ciudadano/a pleno/a en México con las desigualdades actuales?",
    posturas: [
      "Sí es posible: la ciudadanía formal garantiza derechos que cualquier persona puede ejercer independientemente de su situación.",
      "No es posible: sin condiciones materiales mínimas (educación, ingreso, acceso a servicios), la ciudadanía formal es insuficiente para ejercer derechos reales."
    ],
    argumentos_guia: {
      "Sí es posible": [
        "La Constitución garantiza derechos para todos sin importar su origen o condición económica.",
        "Hay mecanismos jurídicos como el amparo que cualquier ciudadano puede usar para defender sus derechos.",
        "Las organizaciones civiles y comunidades han logrado cambios significativos desde sus propios recursos."
      ],
      "No es posible": [
        "Una persona que trabaja 12 horas diarias no tiene tiempo ni energía para participar en política.",
        "El acceso a la justicia requiere abogados y recursos que la mayoría no tiene.",
        "La desnutrición, el analfabetismo y la pobreza extrema limitan la capacidad de ejercer derechos formales."
      ]
    },
    reglas: [
      "Argumentar con base en situaciones concretas y reales.",
      "No usar argumentos de autoridad sin evidencia.",
      "Reconocer los puntos válidos de la postura contraria.",
      "Concluir con una propuesta que reconozca la complejidad del problema."
    ],
    tiempo_argumentacion_minutos: 3,
    criterios_evaluacion: [
      "Distingue claramente entre ciudadanía formal y sustantiva",
      "Usa ejemplos concretos de la realidad mexicana",
      "Reconoce la validez de algunos argumentos de la postura contraria",
      "Propone alguna forma de avanzar hacia una ciudadanía más plena"
    ],
    modalidad: "escrito" as const,
  },
  { // P03 — normas sociales
    tema: "¿Tenemos el deber moral de obedecer las leyes que consideramos injustas?",
    posturas: [
      "Sí: la desobediencia a las leyes genera caos social y cada quien tiene su propia idea de justicia, lo que hace imposible la convivencia.",
      "No: existen situaciones donde la desobediencia civil es legítima e incluso necesaria para corregir injusticias estructurales."
    ],
    argumentos_guia: {
      "Sí": [
        "Si cada persona obedece solo las leyes que le parecen justas, el sistema legal deja de funcionar.",
        "Los mecanismos democráticos (votar, protestar legalmente, presentar amparos) permiten cambiar las leyes sin desobedecerlas.",
        "La desobediencia puede generar violencia y represalias que dañan a los más vulnerables."
      ],
      "No": [
        "Gandhi, Martin Luther King y el movimiento suffragette usaron la desobediencia civil para lograr cambios históricos.",
        "Una ley injusta (como la segregación racial) no merece obediencia solo por ser ley.",
        "La legitimidad de una ley no depende solo de su origen formal, sino de su contenido ético."
      ]
    },
    reglas: [
      "Distinguir entre desobediencia violenta y desobediencia civil pacífica.",
      "Argumentar con ejemplos históricos o situaciones concretas.",
      "No usar ejemplos que justifiquen la violencia.",
      "Reflexionar sobre los límites de cada postura al final."
    ],
    tiempo_argumentacion_minutos: 4,
    criterios_evaluacion: [
      "Distingue entre desobediencia violenta y civil",
      "Usa al menos un ejemplo histórico o concreto",
      "Reconoce los límites de su propia postura",
      "Argumenta con base ética, no solo legal"
    ],
    modalidad: "escrito" as const,
  },
  { // P04 — diversidad y democracia
    tema: "¿La diversidad cultural, étnica y de género fortalece o dificulta la democracia en México?",
    posturas: [
      "La diversidad fortalece la democracia: enriquece la deliberación con más perspectivas y hace los sistemas más justos e inclusivos.",
      "La diversidad puede dificultar la democracia: genera conflictos, hace difícil llegar a acuerdos y puede ser usada para dividir políticamente."
    ],
    argumentos_guia: {
      "La diversidad fortalece": [
        "Las comunidades indígenas han desarrollado sistemas de gobernanza comunitaria que pueden enriquecer la democracia nacional.",
        "La representación de mujeres en los parlamentos mejora la calidad de las políticas públicas en múltiples estudios.",
        "La pluralidad de perspectivas ayuda a identificar problemas que una sola perspectiva homogénea no vería."
      ],
      "La diversidad puede dificultar": [
        "Las diferencias culturales profundas dificultan los consensos sobre valores y normas comunes.",
        "En México, la diversidad étnica ha sido explotada políticamente para dividir comunidades.",
        "Sin mecanismos de traducción y diálogo intercultural, la diversidad puede generar malentendidos y conflictos."
      ]
    },
    reglas: [
      "No usar argumentos que desacrediten a ningún grupo cultural o de identidad.",
      "Distinguir entre los problemas que crea la diversidad y los que crea la discriminación.",
      "Proponer mecanismos concretos para que la diversidad beneficie a la democracia.",
      "Escuchar antes de responder."
    ],
    tiempo_argumentacion_minutos: 4,
    criterios_evaluacion: [
      "Distingue entre diversidad y discriminación como problemas diferentes",
      "Usa ejemplos concretos del contexto mexicano",
      "Propone mecanismos para aprovechar la diversidad en democracia",
      "Reconoce que ambas posturas tienen puntos válidos"
    ],
    modalidad: "escrito" as const,
  },
];

// ── REFLEXIONES (A3) ──────────────────────────────────────────────────────────

const reflexiones = [
  { // P01 — Estado
    prompt: "Piensa en tu experiencia personal con el Estado mexicano: ¿has tenido que ir a una institución pública (hospital, escuela, registro civil, policía)? ¿Cómo fue esa experiencia? ¿Sientes que el Estado cumple sus funciones en tu comunidad o barrio? ¿Qué falla y qué funciona? ¿Qué cambiarías si pudieras?",
    pistas: ["¿Qué servicios públicos usas regularmente (escuela, transporte, salud)?", "¿Hay problemas en tu colonia que el gobierno debería resolver y no resuelve?", "¿Conoces algún caso donde el Estado sí protegió derechos de alguien?"],
    longitud_minima_palabras: 100,
    longitud_maxima_palabras: 350,
    criterios_evaluacion: ["Describe experiencias concretas con instituciones del Estado", "Distingue lo que funciona de lo que falla con argumentos", "Propone al menos un cambio concreto y razonado", "Conecta su experiencia personal con conceptos del tema"],
    formato_esperado: "libre" as const,
  },
  { // P02 — ciudadanía
    prompt: "¿Qué significa para ti ser ciudadano/a en este momento de tu vida? ¿Ejerces algún derecho ciudadano activamente? ¿Hay algún derecho que conozcas pero que no puedas ejercer plenamente por alguna razón? ¿Qué acciones ciudadanas podrías tomar en tu escuela, comunidad o ciudad, aunque todavía no tengas derecho al voto?",
    pistas: ["¿Participas en alguna organización, colectivo o grupo comunitario?", "¿Conoces el derecho de petición, el acceso a información pública o el amparo?", "¿Qué problemas de tu comunidad podrías abordar como ciudadano/a activo/a?"],
    longitud_minima_palabras: 100,
    longitud_maxima_palabras: 350,
    criterios_evaluacion: ["Reflexiona sobre su propia experiencia ciudadana de manera concreta", "Identifica derechos que ejerce y derechos que no puede ejercer plenamente", "Propone acciones ciudadanas concretas y realizables", "Usa vocabulario del tema (ciudadanía formal/sustantiva, derechos, participación)"],
    formato_esperado: "libre" as const,
  },
  { // P03 — normas sociales
    prompt: "Elige una norma social (formal o informal) que consideres injusta o que te parezca que debería cambiarse. Explica: ¿cuál es esa norma?, ¿quién la estableció o cómo surgió?, ¿a quién beneficia y a quién perjudica?, ¿cómo podría cambiarse? ¿Es una norma que enfrentarías personalmente o buscarías cambiarla por medios colectivos?",
    pistas: ["¿Hay normas en tu escuela que no te parecen justas?", "¿Hay costumbres sociales en tu comunidad que discriminan a alguien?", "¿Hay leyes en México que crees que deberían reformarse?"],
    longitud_minima_palabras: 100,
    longitud_maxima_palabras: 350,
    criterios_evaluacion: ["Identifica claramente la norma y su origen histórico o social", "Analiza a quién beneficia y a quién perjudica", "Propone mecanismos concretos de cambio", "Reflexiona sobre su propio papel en ese proceso de cambio"],
    formato_esperado: "libre" as const,
  },
  { // P04 — diversidad
    prompt: "Describe la diversidad en tu escuela y/o comunidad: ¿qué tipos de diversidad existen (étnica, cultural, de género, socioeconómica, de capacidad)? ¿Cómo se trata esa diversidad: se celebra, se ignora o se discrimina? ¿Hubo alguna situación donde fuiste testigo de discriminación o de reconocimiento de la diversidad? ¿Qué harías diferente?",
    pistas: ["¿Hay compañeros/as de distintas regiones, etnias o identidades en tu escuela?", "¿Cómo se habla de la diversidad en tu salón de clases?", "¿Alguna vez alguien fue excluido por ser diferente? ¿Qué pasó?"],
    longitud_minima_palabras: 100,
    longitud_maxima_palabras: 350,
    criterios_evaluacion: ["Describe concretamente la diversidad de su entorno", "Analiza cómo se trata esa diversidad (celebración, invisibilización, discriminación)", "Narra una experiencia concreta relacionada con diversidad", "Propone acciones concretas para una convivencia más inclusiva"],
    formato_esperado: "libre" as const,
  },
];

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
