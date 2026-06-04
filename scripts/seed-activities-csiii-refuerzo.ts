/**
 * Refuerzo de actividades para CS-III (Ciencias Sociales III) según la "Plantilla CEN por UAC".
 * Agrega A4-A7 a cada una de las 3 progresiones (ya tienen A1-A3):
 *   A4 = quiz_verdadero_falso · A5 = glosario_interactivo · A6 = fill_blanks · A7 = autoevaluacion
 * 3 progresiones × 4 = 12 actividades nuevas. estado='borrador'.
 * Alineado al programa oficial de Ciencias Sociales III (MCCEMS 2025):
 *   P01: Crisis social (económica, ambiental, sanitaria, de violencia)
 *   P02: Políticas públicas y participación ciudadana
 *   P03: Juventudes como sujetos históricos y políticos
 * Uso: npx tsx scripts/seed-activities-csiii-refuerzo.ts
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
  log("\n🌱 Refuerzo CS-III — Ciencias Sociales III: A4-A7 por progresión\n");

  const progs = await getProgresionesDeUAC(sb, "CS-III");
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

  log(`\n✅ CS-III refuerzo: ${ok} actividades insertadas, ${fail} fallidas.\n`);
}

// ── REFUERZOS POR PROGRESIÓN ───────────────────────────────────────────────────

const refuerzos: Refuerzo[][] = [
  // ════════════ P01 — Crisis social: causas estructurales y actores ════════════
  [
    {
      titulo: "Verdadero o Falso — Crisis social: causas y actores",
      descripcion: "Decide si cada afirmación sobre crisis económica, ambiental, sanitaria y de violencia —sus causas estructurales y actores involucrados— es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "Las crisis sociales siempre tienen una sola causa y se pueden explicar desde una única escala de análisis (local, nacional o global).",
            respuesta: false,
            retroalimentacion: "Falso. Las crisis son multicausales y multiescalares: una pandemia, por ejemplo, combina factores biológicos, económicos, políticos y culturales que operan simultáneamente a escala local, nacional y global.",
          },
          {
            enunciado: "La desigualdad económica estructural puede aumentar la vulnerabilidad de ciertos grupos sociales ante crisis sanitarias o ambientales.",
            respuesta: true,
            retroalimentacion: "Correcto. Las condiciones de pobreza, falta de acceso a servicios de salud y vivienda precaria amplifican el impacto de una crisis sanitaria o ambiental en los sectores más marginados.",
          },
          {
            enunciado: "Los actores involucrados en una crisis social se limitan exclusivamente a los gobiernos y organismos internacionales.",
            respuesta: false,
            retroalimentacion: "Falso. Los actores de una crisis son múltiples: Estado, organizaciones civiles, empresas, comunidades afectadas, medios de comunicación y organismos internacionales, entre otros. Cada uno tiene intereses y capacidades distintas.",
          },
          {
            enunciado: "El análisis de una crisis ambiental desde múltiples escalas implica considerar tanto decisiones locales (uso del suelo, consumo) como acuerdos internacionales (COP, Acuerdo de París).",
            respuesta: true,
            retroalimentacion: "Correcto. La perspectiva multiescalar reconoce que los problemas ambientales como el cambio climático se producen y se abordan de manera interconectada en distintos niveles territoriales y de gobierno.",
          },
          {
            enunciado: "La violencia estructural es aquella que emerge únicamente de conflictos armados entre grupos y no tiene relación con las condiciones económicas o políticas de una sociedad.",
            respuesta: false,
            retroalimentacion: "Falso. Johan Galtung define la violencia estructural como la violencia 'silenciosa' inscrita en las instituciones y estructuras sociales —pobreza, discriminación, exclusión— que impide a las personas desarrollar su potencial.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Crisis social: causas estructurales y actores",
      descripcion: "Glosario interactivo de conceptos clave para el análisis de crisis sociales desde múltiples escalas y perspectivas.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Crisis social",
            definicion: "Situación de ruptura o tensión grave en los vínculos, instituciones o condiciones de vida de una sociedad, que afecta la cohesión y el bienestar colectivo.",
            ejemplo: "La crisis sanitaria del COVID-19 expuso y profundizó desigualdades preexistentes en el acceso a la salud en México y el mundo.",
            etiquetas: ["ciencias sociales", "análisis estructural"],
          },
          {
            termino: "Causa estructural",
            definicion: "Factor de fondo, profundo y duradero —económico, político, cultural o histórico— que origina o agrava una crisis, más allá de sus detonantes inmediatos.",
            ejemplo: "La falta de acceso a agua potable en comunidades rurales no es un accidente: responde a causas estructurales como el modelo de distribución de recursos y la exclusión histórica.",
            etiquetas: ["estructura social", "análisis causal"],
          },
          {
            termino: "Escala de análisis",
            definicion: "Nivel territorial o social desde el que se observa un fenómeno: local, regional, nacional o global. El mismo problema puede verse diferente según la escala elegida.",
            ejemplo: "La deforestación en una comunidad (escala local) es también parte de la crisis climática global (escala planetaria).",
            etiquetas: ["metodología", "geografía social"],
          },
          {
            termino: "Actor social",
            definicion: "Individuo, grupo, organización o institución que tiene intereses, recursos y capacidad de acción frente a una situación social determinada.",
            ejemplo: "En una crisis de violencia, los actores incluyen al gobierno, las víctimas, las organizaciones de derechos humanos, los medios de comunicación y los grupos armados.",
            etiquetas: ["actores", "participación"],
          },
          {
            termino: "Violencia estructural",
            definicion: "Forma de violencia invisible inscrita en las estructuras económicas, políticas y sociales que produce sufrimiento sin necesidad de un agresor directo identificable.",
            ejemplo: "Un adolescente que abandona la escuela por necesidad económica es víctima de violencia estructural: el sistema genera esa exclusión de forma silenciosa.",
            etiquetas: ["Galtung", "paz positiva", "exclusión"],
          },
          {
            termino: "Perspectiva multiescalar",
            definicion: "Enfoque analítico que conecta distintos niveles de la realidad social —desde lo cotidiano hasta lo global— para comprender un fenómeno de manera integral.",
            ejemplo: "Analizar el desempleo juvenil requiere mirar políticas macroeconómicas globales, políticas nacionales de empleo y la situación laboral concreta de jóvenes en una ciudad específica.",
            etiquetas: ["metodología", "análisis social"],
          },
        ],
        actividad_final: "Elige una crisis social que afecte tu comunidad o región (económica, ambiental, de violencia o sanitaria). Identifica: (a) al menos dos causas estructurales, (b) tres actores involucrados con sus respectivos intereses, y (c) una escala de análisis local y una global. Redacta tu análisis en un párrafo argumentado.",
      },
    },
    {
      titulo: "Completa los huecos — Crisis social y análisis estructural",
      descripcion: "Completa el texto sobre crisis social, causas estructurales y actores con los conceptos correctos.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Lee el párrafo y escribe en cada hueco el concepto de ciencias sociales que corresponde. Usa los términos del glosario de la progresión.",
        texto_con_huecos: "Las crisis sociales son fenómenos ___ que no pueden explicarse desde una sola causa ni desde un único nivel de análisis. Johan Galtung introdujo el concepto de violencia ___ para referirse a las formas de daño que produce el propio sistema social, sin un agresor directo visible. El enfoque ___ permite conectar lo que ocurre en una comunidad local con dinámicas regionales, nacionales y globales. Los ___ sociales son los grupos, instituciones y personas que tienen intereses y capacidad de acción ante una crisis.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "multicausales",
            alternativas_aceptadas: ["multidimensionales", "complejos"],
            pista: "Las crisis tienen múltiples causas, no una sola: son ___.",
          },
          {
            posicion: 1,
            respuesta_correcta: "estructural",
            alternativas_aceptadas: [],
            pista: "Tipo de violencia 'silenciosa' inscrita en las estructuras sociales, según Galtung: violencia ___.",
          },
          {
            posicion: 2,
            respuesta_correcta: "multiescalar",
            alternativas_aceptadas: ["multiescala"],
            pista: "Perspectiva que conecta distintos niveles de análisis: local, nacional y global. Enfoque ___.",
          },
          {
            posicion: 3,
            respuesta_correcta: "actores",
            alternativas_aceptadas: ["actores sociales"],
            pista: "Grupos o instituciones con intereses y capacidad de acción: ___ sociales.",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Crisis social: causas y actores",
      descripcion: "Reflexiona sobre tu capacidad para analizar situaciones de crisis social desde múltiples escalas y perspectivas.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio. Esta autoevaluación es para reconocer tus fortalezas y áreas de mejora, no tiene calificación.",
        criterios: [
          { descripcion: "Identifico y distingo distintos tipos de crisis social (económica, ambiental, sanitaria, de violencia) con ejemplos concretos.", escala: escala4 },
          { descripcion: "Explico las causas estructurales de una crisis social y las diferencia de sus detonantes inmediatos.", escala: escala4 },
          { descripcion: "Analizo una crisis desde al menos dos escalas distintas (local, nacional, global) y reconozco cómo se interrelacionan.", escala: escala4 },
          { descripcion: "Identifico los actores involucrados en una crisis y analizo sus intereses, recursos y posiciones.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Qué crisis social de tu comunidad o región consideras más urgente? ¿Qué causas estructurales la explican y qué actores deberían involucrarse en su solución?",
      },
    },
  ],

  // ════════════ P02 — Políticas públicas y participación ciudadana ════════════
  [
    {
      titulo: "Verdadero o Falso — Políticas públicas y participación ciudadana",
      descripcion: "Decide si cada afirmación sobre el diseño, implementación y evaluación de políticas públicas, y el papel de la ciudadanía, es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "Una política pública es cualquier acción o decisión de un gobierno que busca dar respuesta a un problema social reconocido como tal.",
            respuesta: true,
            retroalimentacion: "Correcto. Las políticas públicas son cursos de acción deliberados del Estado —leyes, programas, presupuestos, reglamentos— orientados a atender problemas colectivos. No toda acción gubernamental es una política pública: debe responder a un problema identificado.",
          },
          {
            enunciado: "La fase de evaluación de una política pública busca determinar si los recursos se gastaron correctamente, pero no si se lograron los objetivos sociales planteados.",
            respuesta: false,
            retroalimentacion: "Falso. La evaluación de políticas públicas comprende tanto la eficiencia en el uso de recursos como la eficacia (¿se lograron los objetivos?) y la equidad (¿quiénes se beneficiaron o quedaron excluidos?).",
          },
          {
            enunciado: "La participación ciudadana en el ciclo de las políticas públicas puede ocurrir en todas sus fases: diagnóstico, diseño, implementación y evaluación.",
            respuesta: true,
            retroalimentacion: "Correcto. La participación ciudadana puede ir desde la consulta en el diagnóstico del problema hasta la cogestión en la implementación y la contraloría social en la evaluación. Cada nivel de participación tiene distinto poder de incidencia.",
          },
          {
            enunciado: "Una política pública es efectiva únicamente si beneficia por igual a todos los grupos de la sociedad, sin distinguir sus condiciones de vulnerabilidad.",
            respuesta: false,
            retroalimentacion: "Falso. La equidad, no la igualdad mecánica, es el principio rector de muchas políticas sociales: se requiere tratar de manera diferenciada a grupos en situación de desventaja para reducir brechas. La igualdad formal puede reproducir desigualdad real.",
          },
          {
            enunciado: "La contraloría social es un mecanismo de participación ciudadana que permite a la comunidad vigilar que los recursos públicos se usen conforme a los objetivos de un programa.",
            respuesta: true,
            retroalimentacion: "Correcto. La contraloría social empodera a las comunidades para monitorear la ejecución de obras y programas, denunciar irregularidades y exigir rendición de cuentas a las autoridades.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Políticas públicas y participación ciudadana",
      descripcion: "Glosario interactivo de conceptos fundamentales: ciclo de política pública, participación ciudadana, evaluación, equidad y contraloría social.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Política pública",
            definicion: "Conjunto de decisiones, acciones y omisiones del Estado orientadas a dar respuesta a un problema social reconocido como de interés colectivo.",
            ejemplo: "El Programa de Becas para el Bienestar Benito Juárez es una política pública educativa que busca reducir la deserción escolar por razones económicas.",
            etiquetas: ["Estado", "gobierno", "problema social"],
          },
          {
            termino: "Ciclo de política pública",
            definicion: "Proceso iterativo que comprende las fases de identificación del problema, diseño, implementación, evaluación y retroalimentación de una política.",
            ejemplo: "Ante el problema de la contaminación del aire, el ciclo inicia con el diagnóstico técnico, continúa con la norma ambiental, su aplicación por inspectores, la medición de resultados y la actualización de la norma.",
            etiquetas: ["proceso", "gestión pública", "fases"],
          },
          {
            termino: "Participación ciudadana",
            definicion: "Involucramiento activo de la población en los asuntos públicos: desde informarse y votar hasta cogestionar programas o ejercer contraloría social.",
            ejemplo: "Los presupuestos participativos municipales permiten a vecinos decidir directamente en qué se invierte una parte del presupuesto local.",
            etiquetas: ["ciudadanía", "democracia", "incidencia"],
          },
          {
            termino: "Contraloría social",
            definicion: "Mecanismo mediante el cual la ciudadanía organizada vigila, evalúa y denuncia irregularidades en la ejecución de programas y obras públicas.",
            ejemplo: "Un comité vecinal que verifica que la obra de pavimentación cumpla con las especificaciones contratadas ejerce contraloría social.",
            etiquetas: ["rendición de cuentas", "transparencia", "ciudadanía"],
          },
          {
            termino: "Evaluación de impacto",
            definicion: "Análisis sistemático que mide los efectos causales de una política pública sobre la población objetivo, distinguiendo qué cambios son atribuibles a la intervención.",
            ejemplo: "Comparar los logros académicos de estudiantes becados versus no becados permite evaluar el impacto real de un programa de becas.",
            etiquetas: ["evaluación", "evidencia", "eficacia"],
          },
          {
            termino: "Equidad en políticas públicas",
            definicion: "Principio que orienta las políticas a distribuir recursos y oportunidades según las necesidades de cada grupo, priorizando a quienes enfrentan mayores desventajas.",
            ejemplo: "Una política de salud equitativa no ofrece los mismos servicios a todos, sino que concentra mayor inversión en comunidades con menor cobertura médica.",
            etiquetas: ["justicia social", "distribución", "vulnerabilidad"],
          },
        ],
        actividad_final: "Selecciona una política pública que conozcas o que afecte tu comunidad (educativa, de salud, ambiental, de seguridad). Describe brevemente su objetivo, identifica en qué fase del ciclo se encuentra y propone un mecanismo concreto de participación ciudadana o contraloría social para mejorarla.",
      },
    },
    {
      titulo: "Completa los huecos — Ciclo de política pública",
      descripcion: "Completa el texto sobre diseño, implementación y evaluación de políticas públicas con los conceptos correctos.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Lee el párrafo y escribe en cada hueco el concepto de ciencias sociales que corresponde. Usa los términos del glosario de la progresión.",
        texto_con_huecos: "El ___ de política pública describe el proceso que va desde identificar un problema social hasta diseñar, implementar y evaluar la respuesta institucional. La ___ ciudadana puede ocurrir en cualquiera de estas fases: consulta, cogestión o vigilancia. La ___ social es el mecanismo que permite a la comunidad verificar que los recursos públicos se usen correctamente. Para garantizar que una política beneficie prioritariamente a los más vulnerables, se aplica el principio de ___ en la distribución de recursos.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "ciclo",
            alternativas_aceptadas: ["ciclo de política pública"],
            pista: "Proceso iterativo de las políticas públicas: identificación, diseño, implementación y evaluación. Se llama ___ de política pública.",
          },
          {
            posicion: 1,
            respuesta_correcta: "participación",
            alternativas_aceptadas: ["participación ciudadana"],
            pista: "Involucramiento activo de la población en los asuntos públicos: ___ ciudadana.",
          },
          {
            posicion: 2,
            respuesta_correcta: "contraloría",
            alternativas_aceptadas: ["contraloría social"],
            pista: "Mecanismo ciudadano de vigilancia sobre la ejecución de programas y obras públicas: ___ social.",
          },
          {
            posicion: 3,
            respuesta_correcta: "equidad",
            alternativas_aceptadas: [],
            pista: "Principio que orienta la distribución de recursos según necesidades, priorizando a los más vulnerables: ___.",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Políticas públicas y participación ciudadana",
      descripcion: "Reflexiona sobre tu comprensión del diseño, implementación y evaluación de políticas públicas y tu capacidad de participación ciudadana.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio. El objetivo es reconocer tu punto de partida para seguir aprendiendo y para el Producto Integrador.",
        criterios: [
          { descripcion: "Explico qué es una política pública, cuál es su objetivo y cuáles son las fases de su ciclo.", escala: escala4 },
          { descripcion: "Analizo una política pública concreta identificando su población objetivo, recursos y resultados esperados.", escala: escala4 },
          { descripcion: "Distingo distintos niveles de participación ciudadana y evalúo cuál es más adecuado para un problema dado.", escala: escala4 },
          { descripcion: "Propongo un mecanismo de contraloría social o evaluación ciudadana para mejorar una política pública de mi entorno.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Qué política pública de tu comunidad o municipio modificarías? ¿Qué mecanismo de participación ciudadana propondrías para hacerlo?",
      },
    },
  ],

  // ════════════ P03 — Juventudes como sujetos históricos y políticos ════════════
  [
    {
      titulo: "Verdadero o Falso — Juventudes: sujetos históricos y políticos",
      descripcion: "Decide si cada afirmación sobre la agencia juvenil, la participación —electoral, comunitaria, cultural y digital— y el papel de las juventudes en la historia es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "El concepto de 'juventud' es universal y estático: tiene el mismo significado en todas las culturas, épocas y contextos socioeconómicos.",
            respuesta: false,
            retroalimentacion: "Falso. La juventud es una construcción social e histórica. Sus límites, significados, expectativas y derechos varían según la clase social, el género, la etnicidad, la cultura y el momento histórico. No existe una sola juventud, sino múltiples 'juventudes'.",
          },
          {
            enunciado: "Los jóvenes han sido actores históricos centrales en procesos de cambio social, como el movimiento estudiantil del 68 en México y las primaveras árabes.",
            respuesta: true,
            retroalimentacion: "Correcto. La historia demuestra que los jóvenes han encabezado movimientos sociales decisivos: el movimiento estudiantil de 1968 en México, las movilizaciones por los derechos civiles en EE. UU., las primaveras árabes o el movimiento #FridaysForFuture son ejemplos de agencia juvenil transformadora.",
          },
          {
            enunciado: "La participación política juvenil se reduce únicamente al voto en elecciones y no incluye formas culturales, digitales o comunitarias de acción.",
            respuesta: false,
            retroalimentacion: "Falso. La participación política juvenil es multidimensional: incluye el voto, pero también el activismo digital, la organización comunitaria, la expresión artística y cultural, el voluntariado, los movimientos sociales y la incidencia en políticas públicas.",
          },
          {
            enunciado: "El activismo digital puede ser una forma efectiva de participación política juvenil cuando articula la acción en línea con movilizaciones y demandas concretas en el espacio público.",
            respuesta: true,
            retroalimentacion: "Correcto. El activismo digital es más efectivo cuando combina la difusión en redes sociales con acciones concretas: peticiones, marchas, foros, propuestas de política pública. La articulación entre lo digital y lo presencial potencia la incidencia.",
          },
          {
            enunciado: "Reconocer a las juventudes como 'sujetos con agencia propia' significa que los jóvenes son responsables individuales de su situación, sin importar las condiciones estructurales en que viven.",
            respuesta: false,
            retroalimentacion: "Falso. Reconocer la agencia juvenil no implica ignorar las condiciones estructurales (pobreza, discriminación, falta de oportunidades). Significa afirmar que los jóvenes, dentro de sus contextos, son capaces de reflexionar, organizarse e incidir en su realidad colectiva.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Juventudes: sujetos históricos y políticos",
      descripcion: "Glosario interactivo de conceptos clave: agencia juvenil, sujeto histórico, participación política, activismo digital y diversidad juvenil.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Sujeto histórico",
            definicion: "Actor individual o colectivo que protagoniza y transforma los procesos históricos, no como mero receptor pasivo sino como agente activo de cambio.",
            ejemplo: "Las y los estudiantes del 68 en México fueron sujetos históricos que desafiaron el autoritarismo y abrieron camino a la democratización del país.",
            etiquetas: ["historia", "agencia", "transformación"],
          },
          {
            termino: "Agencia juvenil",
            definicion: "Capacidad de las personas jóvenes para tomar decisiones, organizarse, reflexionar críticamente y actuar sobre su entorno social, político y cultural.",
            ejemplo: "Cuando un grupo de jóvenes diseña y ejecuta una campaña de concientización sobre violencia de género en su escuela, ejercen agencia juvenil.",
            etiquetas: ["juventud", "participación", "autonomía"],
          },
          {
            termino: "Construcción social de la juventud",
            definicion: "Proceso mediante el cual una sociedad define qué es ser joven, cuáles son sus roles, derechos y expectativas, determinado por el contexto histórico, cultural y socioeconómico.",
            ejemplo: "En comunidades rurales indígenas, el paso a la 'adultez' puede ocurrir a los 15 años; en contextos urbanos de clase media, la 'juventud' puede extenderse hasta los 30.",
            etiquetas: ["construcción social", "diversidad", "cultura"],
          },
          {
            termino: "Participación política juvenil",
            definicion: "Conjunto de acciones mediante las cuales las personas jóvenes intervienen en los asuntos públicos: voto, militancia, activismo, organización comunitaria, expresión cultural o digital.",
            ejemplo: "Las marchas estudiantiles por la educación pública, el movimiento #MeToo en universidades y los foros juveniles de consulta de políticas públicas son formas de participación política juvenil.",
            etiquetas: ["política", "participación", "ciudadanía"],
          },
          {
            termino: "Activismo digital",
            definicion: "Uso de plataformas y herramientas digitales para difundir causas, movilizar apoyos, organizar acciones colectivas y presionar a autoridades o empresas.",
            ejemplo: "#FridaysForFuture comenzó con la campaña digital de Greta Thunberg y movilizó a millones de jóvenes en todo el mundo hacia la acción climática presencial.",
            etiquetas: ["internet", "redes sociales", "movimiento social"],
          },
          {
            termino: "Diversidad juvenil",
            definicion: "Reconocimiento de que no existe una juventud homogénea: las experiencias juveniles varían según género, clase social, etnicidad, región, orientación sexual y contexto cultural.",
            ejemplo: "La juventud indígena en Oaxaca enfrenta condiciones y formas de participación muy distintas a las de la juventud urbana en la Ciudad de México.",
            etiquetas: ["interseccionalidad", "pluralidad", "equidad"],
          },
        ],
        actividad_final: "Reflexiona sobre tu propia experiencia como joven. ¿En qué forma de participación —comunitaria, cultural, digital o electoral— te identificas más? Escribe un párrafo donde expliques cómo esa forma de participación puede contribuir a transformar un problema social de tu entorno, usando al menos dos conceptos del glosario.",
      },
    },
    {
      titulo: "Completa los huecos — Juventudes y participación política",
      descripcion: "Completa el texto sobre juventudes como sujetos históricos y políticos con los conceptos correctos.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Lee el párrafo y escribe en cada hueco el concepto de ciencias sociales que corresponde. Usa los términos del glosario de la progresión.",
        texto_con_huecos: "Las juventudes no son un grupo homogéneo: la ___ juvenil reconoce que las experiencias de ser joven varían según el género, la clase social, la etnicidad y el contexto cultural. Reconocer a los jóvenes como ___ históricos significa aceptar que tienen capacidad real de transformar la sociedad. La ___ juvenil abarca formas de acción que van mucho más allá del voto: incluye el activismo comunitario, la expresión cultural y el ___ digital.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "diversidad",
            alternativas_aceptadas: ["diversidad juvenil"],
            pista: "No existe una sola juventud: la ___ juvenil reconoce múltiples formas de ser joven.",
          },
          {
            posicion: 1,
            respuesta_correcta: "sujetos",
            alternativas_aceptadas: ["sujeto"],
            pista: "Los jóvenes son ___ históricos: no son receptores pasivos sino agentes activos de cambio.",
          },
          {
            posicion: 2,
            respuesta_correcta: "participación",
            alternativas_aceptadas: ["participación política", "participación política juvenil"],
            pista: "Conjunto de acciones con las que los jóvenes intervienen en los asuntos públicos: ___ política juvenil.",
          },
          {
            posicion: 3,
            respuesta_correcta: "activismo",
            alternativas_aceptadas: ["activismo digital"],
            pista: "Uso de plataformas digitales para difundir causas y movilizar apoyos: ___ digital.",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Juventudes como sujetos históricos y políticos",
      descripcion: "Reflexiona sobre tu comprensión de la agencia juvenil y tu capacidad para identificar y ejercer formas de participación como sujeto histórico y político.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio. Esta reflexión es el punto de partida para tu Producto Integrador del semestre.",
        criterios: [
          { descripcion: "Explico por qué 'juventud' es una construcción social con múltiples significados según el contexto histórico y cultural.", escala: escala4 },
          { descripcion: "Identifico ejemplos históricos y actuales en que las juventudes han actuado como sujetos de cambio social.", escala: escala4 },
          { descripcion: "Analizo distintas formas de participación política juvenil (electoral, comunitaria, cultural, digital) y sus alcances.", escala: escala4 },
          { descripcion: "Propongo una forma concreta de participación juvenil para incidir en un problema social de mi entorno.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿En qué momento de tu vida cotidiana ejerces agencia como sujeto histórico? ¿Qué acción colectiva —comunitaria, cultural o digital— podrías impulsar para transformar algo en tu escuela o comunidad?",
      },
    },
  ],
];

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
