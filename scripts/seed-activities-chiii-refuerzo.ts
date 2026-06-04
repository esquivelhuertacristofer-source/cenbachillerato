/**
 * Refuerzo de actividades para CH-III (Conciencia Histórica III — crítica de fuentes,
 * corroboración, narrativa histórica argumentada y comunicación histórica) según la
 * "Plantilla CEN por UAC". Agrega A4-A7 a cada una de las 4 progresiones (ya tienen A1-A3):
 *   A4 = quiz_verdadero_falso · A5 = glosario_interactivo · A6 = fill_blanks · A7 = autoevaluacion
 * 4 progresiones × 4 = 16 actividades nuevas. estado='borrador'.
 * Alineado al programa oficial CH-III (MCCEMS 2025): selección y evaluación de fuentes,
 * corroboración de evidencias, narraciones históricas argumentadas, comunicación histórica.
 * Uso: npx tsx scripts/seed-activities-chiii-refuerzo.ts
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
  log("\n🌱 Refuerzo CH-III — Conciencia Histórica III: A4-A7 por progresión\n");

  const progs = await getProgresionesDeUAC(sb, "CH-III");
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

  log(`\n✅ CH-III refuerzo: ${ok} actividades insertadas, ${fail} fallidas.\n`);
}

// ── REFUERZOS POR PROGRESIÓN ───────────────────────────────────────────────────

const refuerzos: Refuerzo[][] = [
  // ════════════ P01 — Selecciona, evalúa y contrasta fuentes históricas diversas ════════════
  [
    {
      titulo: "Verdadero o Falso — Evaluación y contraste de fuentes históricas",
      descripcion: "Decide si cada afirmación sobre la selección, evaluación y contraste de fuentes primarias y secundarias, así como los criterios de fiabilidad y sesgo, es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "Una fuente primaria es aquella que fue producida durante el período histórico que se estudia o por participantes directos de los hechos.",
            respuesta: true,
            retroalimentacion: "Correcto. Las fuentes primarias son testimonios directos o registros del período: documentos oficiales, cartas, fotografías de época, objetos arqueológicos, relatos de testigos presenciales.",
          },
          {
            enunciado: "Una fuente secundaria siempre es más confiable que una fuente primaria porque fue escrita con mayor distancia temporal y análisis reflexivo.",
            respuesta: false,
            retroalimentacion: "Falso. La distancia temporal no garantiza mayor fiabilidad. Las fuentes secundarias pueden contener interpretaciones sesgadas, errores de análisis o perspectivas ideológicas. Ambos tipos requieren evaluación crítica.",
          },
          {
            enunciado: "Contrastar fuentes consiste en comparar versiones de distintos testimonios o documentos para identificar coincidencias, contradicciones y perspectivas diversas sobre un mismo hecho histórico.",
            respuesta: true,
            retroalimentacion: "Correcto. El contraste de fuentes es una técnica fundamental del método histórico: permite detectar sesgos, completar la imagen del pasado y construir interpretaciones más robustas.",
          },
          {
            enunciado: "El sesgo en una fuente histórica la invalida automáticamente y debe ser descartada del análisis.",
            respuesta: false,
            retroalimentacion: "Falso. El sesgo no invalida una fuente; al contrario, identificarlo es parte del análisis histórico. Una fuente sesgada puede revelar las intenciones, valores e intereses de quien la produjo, lo que tiene valor historiográfico.",
          },
          {
            enunciado: "La iconografía histórica (pinturas, fotografías, grabados) puede constituir una fuente primaria válida para el estudio del pasado.",
            respuesta: true,
            retroalimentacion: "Correcto. Las imágenes históricas son fuentes primarias de tipo iconográfico. Requieren análisis específico: contexto de producción, intención del autor, usos y circulación de la imagen.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Fuentes históricas: selección, evaluación y contraste",
      descripcion: "Glosario interactivo de los conceptos clave para seleccionar, evaluar y contrastar fuentes primarias y secundarias en el análisis histórico.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Fuente primaria",
            definicion: "Documento, objeto o testimonio producido durante el período histórico estudiado o por participantes directos de los hechos. Proporciona evidencia de primera mano.",
            ejemplo: "El Diario de Cristóbal Colón (1492), fotografías de la Revolución Mexicana (1910-1920), documentos del Archivo General de la Nación.",
            etiquetas: ["fuente primaria", "evidencia histórica"],
          },
          {
            termino: "Fuente secundaria",
            definicion: "Análisis, interpretación o síntesis elaborada por historiadores u otros autores sobre el pasado, generalmente con base en fuentes primarias. Incluye libros de historia, artículos académicos y enciclopedias.",
            ejemplo: "El libro 'México a través de los siglos' de Vicente Riva Palacio, un artículo académico sobre la Revolución Francesa publicado en 2010.",
            etiquetas: ["fuente secundaria", "historiografía"],
          },
          {
            termino: "Sesgo histórico",
            definicion: "Tendencia parcial de una fuente que refleja los intereses, valores, ideología o perspectiva de quien la produjo. Identificar el sesgo es parte esencial del análisis crítico de fuentes.",
            ejemplo: "Un diario escrito por un funcionario colonial puede omitir perspectivas indígenas; una crónica oficial de guerra puede exaltar la victoria y minimizar las bajas propias.",
            etiquetas: ["sesgo", "crítica de fuentes"],
          },
          {
            termino: "Fiabilidad de una fuente",
            definicion: "Grado en que una fuente refleja de manera precisa y honesta los hechos que describe. Se evalúa considerando la proximidad temporal, la posición del autor, su intención y la consistencia con otras fuentes.",
            ejemplo: "Un acta notarial del siglo XIX tiene alta fiabilidad como registro legal, aunque su perspectiva puede ser limitada a una sola parte de la transacción.",
            etiquetas: ["fiabilidad", "evaluación de fuentes"],
          },
          {
            termino: "Contraste de fuentes",
            definicion: "Técnica del método histórico que consiste en comparar múltiples fuentes sobre el mismo hecho para identificar coincidencias, contradicciones y perspectivas diversas, construyendo una interpretación más completa.",
            ejemplo: "Comparar el relato de un conquistador español con el códice de un tlacuilo mexica sobre la Conquista de Tenochtitlan revela perspectivas radicalmente distintas.",
            etiquetas: ["contraste", "método histórico"],
          },
          {
            termino: "Fuente iconográfica",
            definicion: "Fuente histórica de carácter visual: pinturas, grabados, fotografías, mapas, carteles, caricaturas políticas. Requiere análisis específico: contexto de producción, intención del autor y circulación.",
            ejemplo: "El mural 'Sueño de una tarde dominical en la Alameda Central' de Diego Rivera como fuente iconográfica sobre la identidad nacional mexicana.",
            etiquetas: ["iconografía", "fuente visual"],
          },
        ],
        actividad_final: "Elige dos fuentes sobre un mismo hecho histórico (una primaria y una secundaria). Complétalas en la siguiente tabla: tipo de fuente, autor, fecha, propósito, posible sesgo y lo que aporta cada una a la comprensión del hecho. Concluye: ¿cuál te parece más fiable y por qué?",
      },
    },
    {
      titulo: "Completa los espacios — Evaluación de fuentes históricas",
      descripcion: "Completa los conceptos clave sobre tipos de fuentes, criterios de fiabilidad, sesgo y contraste en el análisis histórico.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el término o concepto correcto.",
        texto_con_huecos: "Una carta escrita por un soldado durante la Revolución Mexicana es un ejemplo de fuente ___. Un libro publicado en 2020 que analiza documentos coloniales es una fuente ___. La tendencia parcial de una fuente que refleja los intereses de su autor se llama ___. Comparar múltiples fuentes sobre un mismo hecho para detectar coincidencias y contradicciones se denomina ___ de fuentes.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "primaria",
            alternativas_aceptadas: [],
            pista: "Las fuentes producidas durante el período histórico o por testigos directos se llaman fuentes ___.",
          },
          {
            posicion: 1,
            respuesta_correcta: "secundaria",
            alternativas_aceptadas: [],
            pista: "Las fuentes que interpretan o analizan hechos históricos con base en otras fuentes se llaman fuentes ___.",
          },
          {
            posicion: 2,
            respuesta_correcta: "sesgo",
            alternativas_aceptadas: [],
            pista: "Cuando una fuente refleja una perspectiva parcial o interesada, decimos que tiene ___.",
          },
          {
            posicion: 3,
            respuesta_correcta: "contraste",
            alternativas_aceptadas: ["contrastación"],
            pista: "La técnica de comparar varias fuentes sobre el mismo hecho se llama ___ de fuentes.",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Selección, evaluación y contraste de fuentes históricas",
      descripcion: "Reflexiona sobre tu capacidad para seleccionar, evaluar críticamente y contrastar fuentes históricas diversas para construir interpretaciones informadas.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio. Esto te ayudará a identificar qué reforzar.",
        criterios: [
          { descripcion: "Distingo con precisión entre fuentes primarias y secundarias y puedo ejemplificar cada tipo.", escala: escala4 },
          { descripcion: "Evalúo la fiabilidad de una fuente considerando el autor, la fecha, el propósito y el contexto de producción.", escala: escala4 },
          { descripcion: "Identifico el sesgo presente en una fuente histórica sin descartarla, sino incorporando el sesgo como dato del análisis.", escala: escala4 },
          { descripcion: "Contrasto al menos dos fuentes sobre el mismo hecho histórico y extraigo conclusiones sobre sus diferencias y coincidencias.", escala: escala4 },
        ],
        reflexion_final_prompt: "Piensa en un hecho histórico importante para tu comunidad o país. ¿Qué fuente primaria te gustaría consultar para conocerlo mejor? ¿Qué sesgo podría tener esa fuente y cómo lo contrarrestarías?",
      },
    },
  ],

  // ════════════ P02 — Aplica el procedimiento de corroboración de fuentes ════════════
  [
    {
      titulo: "Verdadero o Falso — Corroboración de fuentes y validación de evidencias",
      descripcion: "Decide si cada afirmación sobre el procedimiento de corroboración de fuentes históricas y la validación de evidencias es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "La corroboración de fuentes consiste en buscar otros documentos o testimonios que confirmen, maticen o contradigan la información de una fuente inicial.",
            respuesta: true,
            retroalimentacion: "Correcto. Corroborar significa buscar evidencias adicionales que respalden, complementen o pongan en duda lo afirmado por una fuente. Es el paso que sigue a la lectura crítica de la fuente.",
          },
          {
            enunciado: "Una evidencia histórica queda validada con una sola fuente si esta es muy detallada y está bien redactada.",
            respuesta: false,
            retroalimentacion: "Falso. El rigor historiográfico exige corroborar la evidencia con múltiples fuentes independientes. La calidad de la redacción no garantiza la veracidad del contenido.",
          },
          {
            enunciado: "El análisis documental es una técnica que permite examinar la estructura, el lenguaje, el contexto de producción y la intención de un documento histórico.",
            respuesta: true,
            retroalimentacion: "Correcto. El análisis documental es una metodología sistemática que va más allá del contenido literal: examina quién escribió el documento, para quién, cuándo, con qué propósito y cómo circuló.",
          },
          {
            enunciado: "Si dos fuentes contradicen la misma afirmación, el historiador debe elegir la más antigua y descarta la más reciente.",
            respuesta: false,
            retroalimentacion: "Falso. La antigüedad de una fuente no la hace automáticamente más válida. El historiador pondera la fiabilidad, el contexto y la perspectiva de cada fuente, y puede suspender el juicio si la evidencia es insuficiente.",
          },
          {
            enunciado: "La corroboración cruzada (cross-checking) entre fuentes de diferentes tipos — oral, escrita, iconográfica — fortalece la validez de una interpretación histórica.",
            respuesta: true,
            retroalimentacion: "Correcto. Cuando fuentes de distintos tipos y orígenes coinciden en un hecho, la interpretación gana solidez. La diversidad de tipos de fuentes reduce el riesgo de sesgo sistemático.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Corroboración de fuentes y análisis documental",
      descripcion: "Glosario interactivo de los conceptos y técnicas del procedimiento de corroboración de fuentes para validar evidencias históricas.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Corroboración de fuentes",
            definicion: "Procedimiento metodológico que consiste en contrastar una fuente con otras evidencias independientes para verificar, matizar o refutar la información que contiene. Elemento central del método histórico crítico.",
            ejemplo: "Para corroborar la fecha de un decreto colonial, el historiador busca registros notariales, cartas de la época y actas del cabildo que confirmen o contradigan esa fecha.",
            etiquetas: ["corroboración", "método histórico"],
          },
          {
            termino: "Evidencia histórica",
            definicion: "Todo vestigio del pasado — objeto, documento, imagen, tradición oral — que puede ser analizado críticamente para sustentar afirmaciones sobre hechos históricos. No toda evidencia tiene el mismo peso.",
            ejemplo: "Una moneda acuñada en el siglo XVI es evidencia histórica del sistema económico colonial; un relato oral transcrito en el siglo XX es evidencia secundaria de menor inmediatez.",
            etiquetas: ["evidencia", "prueba histórica"],
          },
          {
            termino: "Análisis documental",
            definicion: "Técnica sistemática de examen de un documento histórico que considera: autoría, fecha, destinatario, propósito, contexto de producción, lenguaje utilizado y circulación del documento.",
            ejemplo: "Analizar el Acta de Independencia de México (1821) implica examinar quiénes la firmaron, en qué contexto político fue redactada, qué términos usaron y qué intereses representaba.",
            etiquetas: ["análisis documental", "técnica histórica"],
          },
          {
            termino: "Corroboración cruzada (cross-checking)",
            definicion: "Comparación de fuentes de tipos distintos (escritas, orales, iconográficas, arqueológicas) sobre el mismo hecho. Cuando coinciden, fortalece la interpretación; cuando divergen, señala aspectos a profundizar.",
            ejemplo: "Cruzar el relato de un testigo oral con un periódico de la época y una fotografía del evento proporciona una imagen más completa y menos sesgada.",
            etiquetas: ["cross-checking", "corroboración cruzada"],
          },
          {
            termino: "Validación de evidencias",
            definicion: "Proceso por el cual el historiador decide si una evidencia es suficientemente sólida para sustentar una afirmación histórica. Implica evaluar su autenticidad, relevancia y consistencia con otras evidencias.",
            ejemplo: "Antes de citar un documento como prueba, el historiador verifica que no sea una falsificación, que su fecha sea coherente con el hecho descrito y que otros documentos lo respalden.",
            etiquetas: ["validación", "rigor histórico"],
          },
          {
            termino: "Suspensión del juicio historiográfico",
            definicion: "Práctica metodológica que consiste en abstenerse de emitir una conclusión cuando las evidencias son insuficientes o contradictorias, reconociendo explícitamente la incertidumbre histórica.",
            ejemplo: "Si dos crónicas de la época dan fechas distintas para una batalla y no hay documentación adicional, el historiador registra la discrepancia sin elegir arbitrariamente una fecha.",
            etiquetas: ["suspensión del juicio", "incertidumbre histórica"],
          },
        ],
        actividad_final: "Selecciona un hecho histórico de tu interés. Busca o imagina dos fuentes distintas (por ejemplo, un periódico de la época y un testimonio oral). Aplica el procedimiento de corroboración: ¿en qué coinciden? ¿en qué divergen? ¿qué tipo de fuente adicional necesitarías para validar la evidencia?",
      },
    },
    {
      titulo: "Completa los espacios — Corroboración y validación de evidencias históricas",
      descripcion: "Completa los conceptos clave del procedimiento de corroboración de fuentes históricas y la validación de evidencias.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el término o concepto correcto.",
        texto_con_huecos: "El procedimiento que consiste en buscar otras fuentes independientes para verificar o refutar la información de una fuente se llama ___ de fuentes. Cuando el historiador no tiene evidencia suficiente para afirmar un hecho, debe practicar la ___ del juicio. El examen sistemático de un documento considerando su autor, fecha, propósito y contexto se llama análisis ___. La comparación de fuentes de distintos tipos (oral, escrita, iconográfica) se conoce como corroboración ___ .",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "corroboración",
            alternativas_aceptadas: ["contraste"],
            pista: "El método de verificar una fuente con otras evidencias independientes se llama ___ de fuentes.",
          },
          {
            posicion: 1,
            respuesta_correcta: "suspensión",
            alternativas_aceptadas: [],
            pista: "Cuando la evidencia es insuficiente, el historiador practica la ___ del juicio historiográfico.",
          },
          {
            posicion: 2,
            respuesta_correcta: "documental",
            alternativas_aceptadas: [],
            pista: "El examen sistemático de un documento histórico se llama análisis ___.",
          },
          {
            posicion: 3,
            respuesta_correcta: "cruzada",
            alternativas_aceptadas: ["cross-checking"],
            pista: "Cuando se comparan fuentes de tipos distintos, hablamos de corroboración ___.",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Corroboración de fuentes y validación de evidencias",
      descripcion: "Reflexiona sobre tu capacidad para aplicar el procedimiento de corroboración de fuentes y validar evidencias históricas con rigor metodológico.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Explico en qué consiste el procedimiento de corroboración de fuentes y por qué es necesario en el método histórico.", escala: escala4 },
          { descripcion: "Aplico el análisis documental a un documento histórico concreto, examinando su autor, fecha, propósito y contexto.", escala: escala4 },
          { descripcion: "Realizo corroboración cruzada comparando fuentes de al menos dos tipos distintos sobre el mismo hecho.", escala: escala4 },
          { descripcion: "Practico la suspensión del juicio cuando la evidencia es insuficiente o contradictoria, sin imponer conclusiones arbitrarias.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Por qué crees que en la actualidad la corroboración de fuentes es una habilidad valiosa no solo para historiadores sino para cualquier ciudadano? Relaciona el método histórico con la verificación de noticias o información en redes sociales.",
      },
    },
  ],

  // ════════════ P03 — Elabora narraciones históricas argumentadas ════════════
  [
    {
      titulo: "Verdadero o Falso — Narrativa histórica argumentada",
      descripcion: "Decide si cada afirmación sobre la estructura de una narración histórica argumentada, la incorporación de causas, consecuencias y perspectivas múltiples es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "Una narración histórica argumentada debe incluir una tesis o interpretación central que el autor defiende con evidencias.",
            respuesta: true,
            retroalimentacion: "Correcto. A diferencia de una crónica descriptiva, la narración histórica argumentada parte de una tesis: la posición interpretativa del historiador, que luego sostiene con evidencias y razonamiento.",
          },
          {
            enunciado: "Las perspectivas múltiples en la narración histórica significan que todos los puntos de vista son igualmente válidos y el historiador no puede privilegiar ninguno.",
            respuesta: false,
            retroalimentacion: "Falso. Incorporar perspectivas múltiples no significa relativismo absoluto. El historiador considera diversas voces pero evalúa la solidez de las evidencias y puede concluir que algunas interpretaciones son más sólidas que otras.",
          },
          {
            enunciado: "La multicausalidad histórica reconoce que los procesos del pasado no tienen una única causa sino que son producto de factores estructurales, coyunturales y contingentes.",
            respuesta: true,
            retroalimentacion: "Correcto. El pensamiento histórico maduro rechaza el monocausalismo. Los grandes procesos históricos resultan de la intersección de causas a largo plazo (estructurales), de coyuntura y de factores imprevisibles (contingentes).",
          },
          {
            enunciado: "Mencionar las consecuencias de un hecho histórico en una narración argumentada es opcional y solo añade longitud innecesaria al texto.",
            respuesta: false,
            retroalimentacion: "Falso. Las consecuencias son parte esencial del análisis histórico. Permiten evaluar el peso y el significado del hecho estudiado en el tiempo largo y en el presente.",
          },
          {
            enunciado: "La historiografía es la disciplina que estudia las distintas maneras en que los historiadores han interpretado y escrito sobre el pasado a lo largo del tiempo.",
            respuesta: true,
            retroalimentacion: "Correcto. La historiografía examina las escuelas, métodos y perspectivas de los historiadores: positivismo, Annales, historia social, historia cultural, microhistoria, etc.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Estructura de la narrativa histórica argumentada",
      descripcion: "Glosario interactivo de los conceptos clave para elaborar narraciones históricas argumentadas que incorporan tesis, evidencias, causas, consecuencias y perspectivas múltiples.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Narración histórica argumentada",
            definicion: "Texto histórico que, además de describir hechos del pasado, defiende una tesis interpretativa con evidencias y razonamiento lógico. Combina la precisión factual con el análisis crítico.",
            ejemplo: "En lugar de 'La Revolución Mexicana ocurrió de 1910 a 1920', una narración argumentada afirma: 'La Revolución Mexicana fue fundamentalmente una revolución agraria cuyos resultados políticos superaron a los sociales', y sostiene esa tesis con evidencias.",
            etiquetas: ["narración histórica", "argumentación"],
          },
          {
            termino: "Tesis histórica",
            definicion: "Afirmación interpretativa central que el historiador defiende en su narración. Debe ser específica, debatible (no obvia) y sustentable con evidencias históricas.",
            ejemplo: "Tesis débil: 'La Conquista fue un hecho importante'. Tesis argumentada: 'La Conquista de México fue posible principalmente por la fractura política interna del mundo mesoamericano, no solo por la superioridad militar española'.",
            etiquetas: ["tesis", "interpretación histórica"],
          },
          {
            termino: "Multicausalidad histórica",
            definicion: "Principio del pensamiento histórico que reconoce que los procesos del pasado son resultado de múltiples causas: estructurales (largo plazo), coyunturales (corto plazo) y contingentes (inesperadas).",
            ejemplo: "La Revolución Francesa tuvo causas estructurales (crisis del feudalismo), coyunturales (hambruna de 1788) y contingentes (la decisión de convocar los Estados Generales).",
            etiquetas: ["multicausalidad", "causas históricas"],
          },
          {
            termino: "Perspectiva histórica múltiple",
            definicion: "Capacidad de examinar un hecho histórico desde los puntos de vista de distintos actores sociales: gobernantes, pueblos colonizados, mujeres, clases subalternas, grupos étnicos, etc. Enriquece la comprensión del pasado.",
            ejemplo: "La Conquista de Tenochtitlan vista desde la perspectiva española (victoria militar) difiere radicalmente de la perspectiva mexica (derrumbe civilizatorio) o de los aliados tlaxcaltecas (oportunidad política).",
            etiquetas: ["perspectiva múltiple", "historia social"],
          },
          {
            termino: "Consecuencias históricas",
            definicion: "Efectos de un hecho o proceso histórico en el corto, mediano y largo plazo. Pueden ser políticos, económicos, sociales, culturales o ambientales. Su análisis revela el peso histórico del acontecimiento.",
            ejemplo: "Consecuencias de la Revolución Industrial: a corto plazo, migración masiva a las ciudades; a largo plazo, surgimiento del movimiento obrero y transformación del sistema económico mundial.",
            etiquetas: ["consecuencias", "impacto histórico"],
          },
          {
            termino: "Historiografía",
            definicion: "Disciplina que estudia cómo los historiadores han interpretado y escrito sobre el pasado: sus métodos, escuelas (positivismo, Annales, historia social, microhistoria, historia cultural) y perspectivas ideológicas.",
            ejemplo: "La escuela de los Annales (Bloch, Febvre) revolucionó la historiografía al desplazar el foco de los grandes hombres y eventos políticos hacia las estructuras sociales, económicas y mentales de larga duración.",
            etiquetas: ["historiografía", "escuelas históricas"],
          },
        ],
        actividad_final: "Elige un hecho histórico que conozcas bien. Escribe una tesis argumentada (una oración). Luego indica: (a) dos causas estructurales, (b) una causa coyuntural, (c) una causa contingente, (d) dos consecuencias a largo plazo, (e) una perspectiva de un grupo social subalterno involucrado.",
      },
    },
    {
      titulo: "Completa los espacios — Narración histórica argumentada",
      descripcion: "Completa los conceptos clave sobre la estructura de la narración histórica: tesis, causas, consecuencias y perspectivas múltiples.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el término o concepto correcto.",
        texto_con_huecos: "La afirmación interpretativa central que el historiador defiende con evidencias se llama ___. El reconocimiento de que los procesos históricos tienen varias causas (estructurales, coyunturales y contingentes) se llama ___. Examinar un hecho desde los puntos de vista de distintos actores sociales se conoce como perspectiva ___. La disciplina que estudia cómo los historiadores han interpretado el pasado se llama ___.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "tesis",
            alternativas_aceptadas: ["tesis histórica"],
            pista: "La posición interpretativa central de una narración histórica argumentada se llama ___.",
          },
          {
            posicion: 1,
            respuesta_correcta: "multicausalidad",
            alternativas_aceptadas: ["multicausalidad histórica"],
            pista: "Reconocer que un proceso histórico tiene múltiples causas se llama ___.",
          },
          {
            posicion: 2,
            respuesta_correcta: "múltiple",
            alternativas_aceptadas: ["múltiples"],
            pista: "La historia que incorpora distintos puntos de vista (de mujeres, pueblos indígenas, clases subalternas) practica la perspectiva ___.",
          },
          {
            posicion: 3,
            respuesta_correcta: "historiografía",
            alternativas_aceptadas: [],
            pista: "El estudio de cómo los historiadores escriben e interpretan el pasado se llama ___.",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Elaboración de narraciones históricas argumentadas",
      descripcion: "Reflexiona sobre tu capacidad para elaborar narraciones históricas argumentadas que incorporen tesis, evidencias, multicausalidad, consecuencias y perspectivas múltiples.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Formulo una tesis histórica específica y debatible que puedo defender con evidencias concretas.", escala: escala4 },
          { descripcion: "Incorporo multicausalidad en mi análisis: identifico causas estructurales, coyunturales y contingentes de un proceso histórico.", escala: escala4 },
          { descripcion: "Analizo las consecuencias de un hecho histórico en el corto, mediano y largo plazo.", escala: escala4 },
          { descripcion: "Incorporo perspectivas múltiples en mi narración, considerando al menos dos actores sociales con posiciones distintas.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Cuál es la diferencia entre un relato histórico descriptivo y una narración histórica argumentada? ¿Por qué crees que el pensamiento histórico requiere argumentar en lugar de solo describir?",
      },
    },
  ],

  // ════════════ P04 — Comunica su interpretación histórica con rigor y creatividad ════════════
  [
    {
      titulo: "Verdadero o Falso — Comunicación de la interpretación histórica",
      descripcion: "Decide si cada afirmación sobre la comunicación oral y escrita de interpretaciones históricas con rigor y creatividad es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "El rigor en la comunicación histórica implica citar las fuentes utilizadas, usar terminología precisa y respaldar cada afirmación con evidencias.",
            respuesta: true,
            retroalimentacion: "Correcto. El rigor histórico en la comunicación exige transparencia metodológica: el lector o escucha debe poder rastrear la evidencia que sustenta cada afirmación.",
          },
          {
            enunciado: "La creatividad en la comunicación histórica es incompatible con el rigor académico y debe evitarse en trabajos de historia.",
            respuesta: false,
            retroalimentacion: "Falso. Creatividad y rigor son complementarios. Recursos como la narrativa vívida, el uso de anécdotas bien fundamentadas, la infografía o el ensayo literario pueden hacer más accesible y atractiva la historia sin sacrificar la precisión.",
          },
          {
            enunciado: "La 'historia del presente' es una corriente historiográfica que estudia procesos históricos recientes que aún tienen efectos en la actualidad.",
            respuesta: true,
            retroalimentacion: "Correcto. La historia del presente (o historia inmediata) analiza procesos de las últimas décadas cuyas consecuencias siguen vivas. Exige especial cuidado con la perspectiva del historiador y la distancia crítica.",
          },
          {
            enunciado: "En una exposición oral de historia, la precisión en las fechas y datos es lo único que importa; el manejo del lenguaje y la estructura del discurso son irrelevantes.",
            respuesta: false,
            retroalimentacion: "Falso. Una exposición histórica eficaz combina precisión factual con claridad expositiva, estructura argumentativa, dominio del lenguaje y recursos comunicativos que faciliten la comprensión del público.",
          },
          {
            enunciado: "El ensayo histórico es un formato que permite al estudiante integrar fuentes, análisis crítico y voz propia para defender una interpretación del pasado.",
            respuesta: true,
            retroalimentacion: "Correcto. El ensayo histórico es el formato paradigmático de comunicación histórica escrita: articula tesis, argumentos, evidencias y reflexión personal en un texto coherente y riguroso.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Comunicación histórica: rigor y creatividad",
      descripcion: "Glosario interactivo de los conceptos y formatos clave para comunicar interpretaciones históricas con rigor académico y creatividad.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Rigor histórico en la comunicación",
            definicion: "Conjunto de exigencias metodológicas que garantizan la credibilidad de una comunicación histórica: citar fuentes, usar terminología precisa, respaldar afirmaciones con evidencias y reconocer las limitaciones del conocimiento.",
            ejemplo: "Un ensayo histórico riguroso incluye notas al pie o referencias bibliográficas, distingue entre hechos documentados e interpretaciones, y señala explícitamente cuando hay incertidumbre.",
            etiquetas: ["rigor", "metodología histórica"],
          },
          {
            termino: "Ensayo histórico",
            definicion: "Formato de comunicación escrita que integra tesis, argumentos, evidencias de fuentes y reflexión del autor para defender una interpretación del pasado. Combina estructura argumentativa con voz propia.",
            ejemplo: "Un ensayo que argumenta: 'La Independencia de México no fue una revolución social sino un cambio de élite' y lo demuestra con datos demográficos, legislación y testimonios de la época.",
            etiquetas: ["ensayo histórico", "escritura académica"],
          },
          {
            termino: "Historia del presente",
            definicion: "Corriente historiográfica que estudia procesos históricos recientes (últimas décadas) cuyos efectos persisten en la actualidad. Requiere especial atención a la perspectiva del historiador y la distancia crítica.",
            ejemplo: "El análisis histórico de los movimientos migratorios de los últimos 30 años como consecuencia de procesos económicos y políticos previos.",
            etiquetas: ["historia del presente", "historia inmediata"],
          },
          {
            termino: "Creatividad en la comunicación histórica",
            definicion: "Uso de recursos expresivos que hacen más accesible, atractiva y memorable la presentación de la historia sin sacrificar la precisión: narrativa vívida, comparaciones, imágenes, infografías, dramatizaciones.",
            ejemplo: "Presentar la vida cotidiana durante la Revolución Mexicana a través del diario ficticio de un campesino, basado en fuentes reales, es una estrategia creativa y rigurosa.",
            etiquetas: ["creatividad", "comunicación histórica"],
          },
          {
            termino: "Exposición histórica oral",
            definicion: "Presentación en voz alta de una interpretación histórica ante un público. Requiere estructura clara (introducción-desarrollo-conclusión), dominio del tema, manejo del lenguaje y recursos comunicativos (contacto visual, tono, ejemplos).",
            ejemplo: "Una ponencia que expone la tesis sobre las causas de la Revolución Rusa con datos, mapas proyectados y citas de Lenin y Trotski.",
            etiquetas: ["exposición oral", "comunicación"],
          },
          {
            termino: "Cita de fuentes históricas",
            definicion: "Práctica de indicar explícitamente de dónde proviene la evidencia utilizada. Garantiza la verificabilidad, la honestidad intelectual y el respeto a la autoría de los testimonios analizados.",
            ejemplo: "Al citar el testimonio de Bernal Díaz del Castillo en 'Historia Verdadera de la Conquista de la Nueva España', el historiador indica: autor, obra, año y fragmento citado.",
            etiquetas: ["cita", "referencias", "honestidad académica"],
          },
        ],
        actividad_final: "Elabora el esquema (no el texto completo) de un ensayo histórico de una página sobre un hecho que te interese. Incluye: (a) título, (b) tesis en una oración, (c) tres argumentos con la fuente que usarías para cada uno, (d) la perspectiva que incorporarías y (e) la conclusión que conecta el hecho con el presente.",
      },
    },
    {
      titulo: "Completa los espacios — Comunicación histórica con rigor y creatividad",
      descripcion: "Completa los conceptos clave sobre los formatos y las exigencias de la comunicación histórica oral y escrita.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el término o concepto correcto.",
        texto_con_huecos: "El formato escrito que integra tesis, argumentos, evidencias y reflexión del autor para defender una interpretación histórica se llama ___ histórico. La práctica de indicar explícitamente de dónde proviene la evidencia utilizada se llama ___ de fuentes. La corriente historiográfica que estudia procesos recientes cuyos efectos persisten en la actualidad se denomina historia del ___. El conjunto de exigencias metodológicas que garantizan la credibilidad de una comunicación histórica se llama ___ histórico.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "ensayo",
            alternativas_aceptadas: [],
            pista: "El texto académico que defiende una tesis con argumentos y evidencias se llama ___ histórico.",
          },
          {
            posicion: 1,
            respuesta_correcta: "cita",
            alternativas_aceptadas: ["citación"],
            pista: "Indicar explícitamente el origen de la evidencia que se usa se llama ___ de fuentes.",
          },
          {
            posicion: 2,
            respuesta_correcta: "presente",
            alternativas_aceptadas: [],
            pista: "La historiografía que estudia hechos recientes con efectos actuales se llama historia del ___.",
          },
          {
            posicion: 3,
            respuesta_correcta: "rigor",
            alternativas_aceptadas: [],
            pista: "La precisión, el uso de evidencias y la transparencia metodológica conforman el ___ histórico.",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Comunicación de la interpretación histórica",
      descripcion: "Reflexiona sobre tu capacidad para comunicar interpretaciones históricas de manera oral y escrita con rigor metodológico y creatividad expresiva.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Redacto un ensayo histórico con tesis clara, argumentos sustentados con evidencias y conclusión que conecta el pasado con el presente.", escala: escala4 },
          { descripcion: "Cito correctamente las fuentes que utilizo, indicando autor, obra y fragmento, tanto en trabajos escritos como en exposiciones orales.", escala: escala4 },
          { descripcion: "Expongo oralmente una interpretación histórica con estructura clara, datos precisos y recursos que facilitan la comprensión del público.", escala: escala4 },
          { descripcion: "Combino rigor académico con creatividad: uso recursos expresivos (narrativa, ejemplos, imágenes) sin perder precisión histórica.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Por qué es importante que los ciudadanos (no solo los historiadores) puedan comunicar interpretaciones históricas con rigor? ¿Qué riesgos existen cuando la historia se comunica sin evidencias ni perspectiva crítica?",
      },
    },
  ],
];

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
