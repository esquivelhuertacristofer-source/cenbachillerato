/**
 * Seed de actividades pedagógicas para PFH-II (Pensamiento Filosófico y Humanidades II).
 * 5 progresiones × 3 actividades = 15 actividades. estado='publicada'.
 * Tipos: glosario_interactivo, lectura, video_con_preguntas, infografia,
 *        quiz_multiple_opcion, quiz_verdadero_falso, reflexion_escrita,
 *        debate_estructurado, autoevaluacion (9 tipos)
 * Uso: npx tsx scripts/seed-activities-pfhii.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🌱 Seed actividades PFH-II — Pensamiento Filosófico y Humanidades II\n");

  const progs = await getProgresionesDeUAC(sb, "PFH-II");
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
      descripcion: "Práctica de verificación y análisis filosófico.",
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
      descripcion: "Aplicación crítica: debate o reflexión filosófica de cierre.",
      tipo: tiposA3[n - 1],
      progresion_id: p.id,
      xp: 20,
      estado: "publicada",
      contenido: contenidosA3[n - 1],
    });
    a3ok ? ok++ : fail++;
  }

  log(`\n✅ PFH-II: ${ok} actividades insertadas, ${fail} fallidas.\n`);
}

const titulos = [
  { a1: "Glosario filosófico: conceptos de ontología", a2: "¿Qué es la ontología? Preguntas sobre el ser y la realidad", a3: "Reflexión: ¿Qué pregunta sobre la existencia te parece más importante?" },
  { a1: "Fundamentos éticos de la acción humana", a2: "Corrientes éticas: ¿quién tiene razón?", a3: "Debate: ¿Los fines justifican los medios?" },
  { a1: "Bioética: cuando la ciencia y la moral se encuentran", a2: "¿Verdadero o falso? Dilemas bioéticos contemporáneos", a3: "Reflexión: Mi postura ante un dilema bioético" },
  { a1: "Filosofía feminista y perspectiva de género", a2: "Autoevaluación: perspectiva de género en el pensamiento filosófico", a3: "Reflexión: ¿A quiénes ha excluido la filosofía y por qué importa?" },
  { a1: "Humanismo mexicano: una tradición filosófica propia", a2: "Pensadores del humanismo mexicano", a3: "Reflexión: vigencia del humanismo mexicano en el siglo XXI" },
];

const tiposA1 = ["glosario_interactivo", "lectura", "video_con_preguntas", "lectura", "infografia"] as const;
const tiposA2 = ["quiz_multiple_opcion", "quiz_multiple_opcion", "quiz_verdadero_falso", "autoevaluacion", "quiz_multiple_opcion"] as const;
const tiposA3 = ["reflexion_escrita", "debate_estructurado", "reflexion_escrita", "reflexion_escrita", "reflexion_escrita"] as const;

// ── A1 ──────────────────────────────────────────────────────────────────────────
const contenidosA1 = [
  { // P01 — glosario_interactivo (Ontología)
    terminos: [
      { termino: "Ontología", definicion: "Rama de la filosofía que estudia el ser, la existencia y la realidad en sus aspectos más fundamentales.", ejemplo: "La pregunta '¿por qué existe algo en lugar de nada?' es una pregunta ontológica clásica.", etiquetas: ["filosofía", "metafísica", "ser"] },
      { termino: "Ser", definicion: "Concepto filosófico que designa todo lo que existe, ya sea de manera concreta, abstracta, potencial o actual.", ejemplo: "Para Parménides, el ser es uno, eterno e inmutable; no puede surgir ni desaparecer.", etiquetas: ["ontología", "existencia"] },
      { termino: "Existencia", definicion: "Modo de ser concreto y real de un ente en el mundo, a diferencia de su mera posibilidad lógica.", ejemplo: "Un unicornio puede concebirse conceptualmente, pero no tiene existencia real.", etiquetas: ["ser", "realidad"] },
      { termino: "Realismo", definicion: "Postura filosófica que sostiene que la realidad existe de manera independiente de nuestra mente o percepción.", ejemplo: "El árbol en el bosque existe aunque nadie lo vea, según el realismo filosófico.", etiquetas: ["ontología", "epistemología"] },
      { termino: "Idealismo", definicion: "Corriente filosófica que plantea que la realidad es, en última instancia, de naturaleza mental o espiritual.", ejemplo: "Para Berkeley, 'ser es ser percibido': las cosas existen solo en tanto son percibidas por una mente.", etiquetas: ["ontología", "Hegel", "Kant"] },
      { termino: "Materialismo", definicion: "Postura filosófica según la cual solo existe la materia y sus propiedades; la mente y el espíritu son fenómenos materiales.", ejemplo: "Marx sostuvo que las condiciones materiales de vida determinan la conciencia social.", etiquetas: ["ontología", "Marx", "ciencia"] },
      { termino: "Metafísica", definicion: "Rama de la filosofía que estudia la naturaleza última de la realidad, más allá de lo que es observable empíricamente.", ejemplo: "Las preguntas sobre la inmortalidad del alma o la existencia de Dios son metafísicas.", etiquetas: ["filosofía", "ontología", "realidad"] },
      { termino: "Universales", definicion: "En filosofía, propiedades o esencias abstractas que se aplican a múltiples particulares concretos.", ejemplo: "La 'rojez' es un universal que se aplica a todos los objetos rojos particulares.", etiquetas: ["ontología", "abstracciones", "Platón"] },
      { termino: "Particulares", definicion: "Entidades únicas, concretas e individuales, a diferencia de los universales abstractos.", ejemplo: "Esta manzana roja que tengo en la mano es un particular; la 'manzanidad' sería el universal.", etiquetas: ["ontología", "concreción"] },
      { termino: "Dualismo", definicion: "Postura que sostiene la existencia de dos sustancias o principios radicalmente distintos, como mente y cuerpo (Descartes).", ejemplo: "Descartes distinguía entre res cogitans (sustancia pensante) y res extensa (sustancia corporal).", etiquetas: ["ontología", "mente", "cuerpo", "Descartes"] },
    ],
    actividad_final: "Elige tres términos del glosario y construye un párrafo filosófico que los conecte. ¿Cómo se relacionan el ser, la existencia y la realidad en tu propia perspectiva?",
  },
  { // P02 — lectura (Ética)
    texto: `La ética es la rama de la filosofía que reflexiona sobre la moralidad: qué es bueno, qué debemos hacer y cómo debemos vivir. A lo largo de la historia, los filósofos han desarrollado distintas corrientes para responder estas preguntas fundamentales.\n\nLa ética deontológica, representada por Immanuel Kant, sostiene que la moralidad se basa en deberes y principios racionales universales. Para Kant, una acción es moral si puede convertirse en ley universal para todos: "Actúa solo según aquella máxima que puedas querer que se convierta en ley universal." El resultado de la acción no importa; lo que importa es si se actuó por deber y respeto a la ley moral.\n\nEl consecuencialismo, en contraste, evalúa las acciones por sus consecuencias. El utilitarismo de John Stuart Mill propone que la acción moralmente correcta es la que produce la mayor felicidad para el mayor número de personas. Los fines y los resultados son lo que cuenta.\n\nLa ética de la virtud, con raíces en Aristóteles, se centra no en las reglas ni en las consecuencias, sino en el carácter de la persona. Una acción es buena si la realiza una persona virtuosa, aquella que ha desarrollado hábitos como la valentía, la justicia y la prudencia. La meta es la eudaimonía: la vida buena y floreciente.\n\nFinalmente, la ética del cuidado, desarrollada por Carol Gilligan y Nel Noddings, surge como crítica a las éticas centradas en principios abstractos y universales. Propone que la moralidad se funda en relaciones concretas de cuidado y responsabilidad hacia los demás, especialmente los vulnerables.`,
    fuente: "Material elaborado para CEN Bachillerato — PFH-II",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 10,
    preguntas_comprension: [
      { pregunta: "¿Qué criterio usa la ética kantiana para determinar si una acción es moral?", respuesta_guia: "Que la máxima de la acción pueda convertirse en ley universal para todos, actuando por deber racional." },
      { pregunta: "¿En qué se diferencia el consecuencialismo del deontologismo?", respuesta_guia: "El consecuencialismo evalúa las acciones por sus resultados/consecuencias; el deontologismo se basa en deberes y principios, independientemente del resultado." },
      { pregunta: "¿Qué crítica le hace la ética del cuidado a las éticas de principios universales?", respuesta_guia: "Que ignoran las relaciones concretas y la responsabilidad hacia personas específicas y vulnerables." },
    ],
  },
  { // P03 — video_con_preguntas (Bioética)
    url_video: "https://example.com/video-pendiente-cen",
    titulo_video: "Bioética: cuando la ciencia, la tecnología y los derechos se encuentran",
    descripcion_video: "Exploración de los principales dilemas bioéticos contemporáneos: eutanasia, aborto, ingeniería genética, derechos del cuerpo y ética ambiental. Presenta los marcos filosóficos (utilitarista, deontológico, de la virtud, del cuidado) aplicados a casos concretos desde una perspectiva de género.",
    duracion_segundos: 510,
    subtitulos_disponibles: true,
    preguntas: [
      { tiempo_segundos: 90, pregunta: "¿Qué hace que un dilema sea 'bioético' y no simplemente médico o científico?", tipo: "abierta" as const },
      { tiempo_segundos: 270, pregunta: "¿Cómo se aplica la perspectiva de género al análisis de los derechos del cuerpo?", tipo: "abierta" as const },
      { tiempo_segundos: 430, pregunta: "Menciona dos dilemas bioéticos del video y el enfoque filosófico que usarías para analizarlos.", tipo: "abierta" as const },
    ],
  },
  { // P04 — lectura (Filosofía feminista y perspectiva de género)
    texto: `Durante siglos, la filosofía occidental se presentó como un saber universal y objetivo, pero en realidad fue construida casi exclusivamente por hombres de élite occidental. Esta exclusión histórica no es neutra: los problemas filosóficos que se consideraron importantes, los ejemplos usados y las conclusiones alcanzadas están marcados por sesgos androcéntricos (centrados en la perspectiva masculina).\n\nSimone de Beauvoir, en El segundo sexo (1949), fue una de las primeras en señalar esta exclusión sistemática. Su célebre afirmación "no se nace mujer, se llega a serlo" cuestiona la idea de que las diferencias de género son naturales o inevitables, y las enmarca como construcciones sociales y culturales.\n\nLa epistemología feminista pregunta no solo quién filosofa, sino desde dónde y para quién. La filósofa chicana Gloria Anzaldúa y la estadounidense bell hooks han mostrado cómo la experiencia de quienes viven en los márgenes (por género, raza y clase) produce conocimientos que la filosofía dominante suele ignorar. La filósofa mexicana Graciela Hierro contribuyó a la ética feminista latinoamericana, vinculando el placer y el bienestar de las mujeres con la justicia social.\n\nIncorporar la perspectiva de género a la filosofía no es solo una cuestión de "incluir mujeres": es transformar los métodos, las preguntas y los criterios de validez del conocimiento filosófico. Una filosofía que excluye la mitad de la humanidad no puede pretender hablar de lo humano universal.`,
    fuente: "Material elaborado para CEN Bachillerato — PFH-II",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 10,
    preguntas_comprension: [
      { pregunta: "¿Qué significa que la filosofía tiene 'sesgos androcéntricos'?", respuesta_guia: "Que está construida desde una perspectiva centrada en la experiencia masculina, ignorando o invisibilizando otras perspectivas." },
      { pregunta: "¿Qué quiso decir Beauvoir con 'no se nace mujer, se llega a serlo'?", respuesta_guia: "Que el género femenino no es biológico e inevitable, sino una construcción social y cultural." },
      { pregunta: "¿Qué propone la epistemología feminista que es diferente a la epistemología tradicional?", respuesta_guia: "Que pregunta desde dónde y para quién se produce el conocimiento, reconociendo que la posición social afecta lo que se puede conocer y cómo." },
    ],
  },
  { // P05 — infografia (Humanismo mexicano)
    titulo: "El humanismo mexicano: raíces, voces y vigencia",
    url_imagen: "/placeholder/infografia.svg",
    descripcion_accesible: "Línea del tiempo e infografía sobre las tres vertientes del humanismo mexicano: pensamiento filosófico indígena, tradición novohispana y humanismo moderno del siglo XX. Presenta a los pensadores clave y sus ideas centrales.",
    puntos_clave: [
      "Vertiente indígena: el tlamatini (sabio nahua) y el conocimiento del rostro y corazón (ixtli-yóllotl); la filosofía del Buen Vivir como alternativa al individualismo occidental.",
      "Vertiente novohispana: Sor Juana Inés de la Cruz (s. XVII), primera filósofa mexicana, defiende el derecho de las mujeres al conocimiento.",
      "José Vasconcelos (1882–1959): 'la raza cósmica'; propone la síntesis cultural latinoamericana como aportación universal.",
      "Alfonso Reyes (1889–1959): humanismo universalista anclado en la cultura mexicana; el ensayo como forma filosófica.",
      "Leopoldo Zea (1912–2004): 'la filosofía americana como filosofía sin más'; afirma la legitimidad del pensamiento filosófico latinoamericano.",
      "Filosofía de la liberación (s. XX): Enrique Dussel y el 'giro descolonial'; cuestiona la modernidad eurocentrica y reivindica la alteridad.",
      "Graciela Hierro (1928–2003): ética feminista mexicana; filosofía del placer y el bienestar como justicia para las mujeres.",
    ],
    fuente: "Material CEN Bachillerato — PFH-II",
    actividad_post: "¿Cuál de estos pensadores o ideas te resulta más vigente para entender los problemas que vive México hoy? Escribe dos oraciones justificando tu elección.",
  },
];

// ── A2 ──────────────────────────────────────────────────────────────────────────
const contenidosA2 = [
  { // P01 — quiz_multiple_opcion (Ontología)
    preguntas: [
      { enunciado: "¿Cuál es la pregunta central de la ontología?", opciones: ["¿Cómo podemos conocer la realidad?", "¿Qué existe y qué es el ser?", "¿Qué es lo moralmente correcto?", "¿Qué es la belleza?"], respuesta_correcta: 1, retroalimentacion: "La ontología es la rama de la filosofía que pregunta por el ser, la existencia y la naturaleza última de la realidad." },
      { enunciado: "¿Qué sostenía el idealismo filosófico de Berkeley?", opciones: ["Solo existe la materia y sus propiedades", "La realidad existe independientemente de nuestra mente", "Ser es ser percibido: las cosas existen en tanto son percibidas", "El ser es uno, eterno e inmutable"], respuesta_correcta: 2, retroalimentacion: "Berkeley sostuvo que 'esse est percipi' (ser es ser percibido): la realidad depende de la percepción mental." },
      { enunciado: "El materialismo filosófico sostiene que:", opciones: ["La mente es la única realidad verdadera", "Solo existe la materia y sus propiedades; la mente es un fenómeno material", "Existen dos sustancias: mente y cuerpo", "El ser es independiente de la materia y el pensamiento"], respuesta_correcta: 1, retroalimentacion: "El materialismo afirma que todo lo que existe, incluyendo la mente, tiene base material." },
      { enunciado: "¿Qué son los 'universales' en la filosofía de Platón?", opciones: ["Los objetos físicos y concretos que vemos cada día", "Esencias o formas abstractas que existen independientemente de los particulares", "Las leyes de la naturaleza estudiadas por la ciencia", "Los principios morales compartidos por todas las culturas"], respuesta_correcta: 1, retroalimentacion: "Para Platón, los universales son las Ideas o Formas eternas (como la Belleza, la Justicia), de las que los objetos particulares son solo copias imperfectas." },
      { enunciado: "¿Cuál es la diferencia entre metafísica y ontología?", opciones: ["No hay diferencia: son sinónimos completos", "La metafísica es más amplia e incluye a la ontología; la ontología se centra específicamente en el estudio del ser", "La ontología estudia la ciencia; la metafísica estudia la religión", "La metafísica estudia el ser; la ontología estudia el conocimiento"], respuesta_correcta: 1, retroalimentacion: "La ontología es la parte de la metafísica que estudia el ser; la metafísica también abarca otras preguntas sobre la realidad última." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P02 — quiz_multiple_opcion (Corrientes éticas)
    preguntas: [
      { enunciado: "¿Qué caracteriza a la ética deontológica de Kant?", opciones: ["Las acciones son buenas si producen la mayor felicidad", "Las acciones son buenas si el agente tiene buen carácter", "Las acciones son buenas si cumplen con un deber moral universal, independientemente del resultado", "Las acciones son buenas si responden al cuidado concreto de otros"], respuesta_correcta: 2, retroalimentacion: "La ética kantiana se basa en el deber y la ley moral universal, no en las consecuencias." },
      { enunciado: "El principio de utilidad en el utilitarismo de Mill establece que:", opciones: ["Hay que respetar los derechos individuales por encima de todo", "Se debe actuar para producir la mayor felicidad para el mayor número de personas", "La virtud es el hábito adquirido mediante la práctica reiterada", "La moral se funda en relaciones concretas de cuidado interpersonal"], respuesta_correcta: 1, retroalimentacion: "El utilitarismo evalúa las acciones por su resultado: producir la máxima utilidad o bienestar colectivo." },
      { enunciado: "La ética de la virtud pregunta principalmente:", opciones: ["¿Qué debo hacer en esta situación específica?", "¿Qué resultados produce mi acción?", "¿Qué tipo de persona debo ser?", "¿Qué reglas debo seguir siempre?"], respuesta_correcta: 2, retroalimentacion: "La ética de la virtud (Aristóteles) se centra en el carácter del agente y en cultivar virtudes para vivir bien." },
      { enunciado: "¿Cuál es la crítica principal de la ética del cuidado a las éticas universalistas?", opciones: ["Que no tienen reglas claras", "Que ignoran las relaciones concretas y las responsabilidades hacia personas específicas", "Que promueven el individualismo extremo", "Que no sirven para resolver dilemas prácticos"], respuesta_correcta: 1, retroalimentacion: "La ética del cuidado (Gilligan) critica que los principios abstractos y universales invisibilizan las relaciones y el cuidado concreto." },
      { enunciado: "En un dilema donde mentir salvaría muchas vidas, ¿qué diría Kant?", opciones: ["Miente porque el resultado es bueno", "Miente si cuidas a las personas afectadas", "No mientes, porque mentir viola el imperativo categórico universal", "Depende de la virtud del agente"], respuesta_correcta: 2, retroalimentacion: "Para Kant, el deber de no mentir es una ley moral universal; violarla no puede justificarse por las consecuencias." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P03 — quiz_verdadero_falso (Bioética)
    preguntas: [
      { enunciado: "La bioética es solo una rama de la medicina clínica, no de la filosofía.", respuesta: false, retroalimentacion: "La bioética es una disciplina filosófica interdisciplinar que incluye ética, derecho, medicina y ciencias sociales." },
      { enunciado: "La autonomía de la persona es uno de los principios fundamentales de la bioética moderna.", respuesta: true, retroalimentacion: "Correcto. La bioética principialista (Beauchamp y Childress) incluye autonomía, beneficencia, no maleficencia y justicia." },
      { enunciado: "El debate sobre la eutanasia implica únicamente consideraciones médicas, no filosóficas ni jurídicas.", respuesta: false, retroalimentacion: "La eutanasia involucra dilemas filosóficos (autonomía, muerte digna), éticos, religiosos y jurídicos profundos." },
      { enunciado: "La perspectiva de género en la bioética señala que las mujeres históricamente han tenido menos control sobre las decisiones sobre su propio cuerpo.", respuesta: true, retroalimentacion: "Correcto. La bioética feminista señala cómo el patriarcado ha controlado los cuerpos de las mujeres en medicina, reproducción y salud." },
      { enunciado: "La ingeniería genética no plantea dilemas éticos relevantes porque es solo tecnología.", respuesta: false, retroalimentacion: "La ingeniería genética plantea preguntas filosóficas serias: ¿quién decide qué genes son 'mejores'?, ¿hay riesgo de eugenesia?, ¿qué es una vida 'normal'?" },
      { enunciado: "La ética ambiental puede considerarse parte de la bioética cuando analiza los derechos de los seres vivos no humanos.", respuesta: true, retroalimentacion: "Correcto. La bioética extendida incluye las relaciones éticas con el ambiente, animales y ecosistemas." },
    ],
    intentos_maximos: 2,
    puntaje_minimo_aprobacion: 70,
  },
  { // P04 — autoevaluacion (Filosofía feminista y perspectiva de género)
    instrucciones: "Reflexiona honestamente sobre tu comprensión y aplicación de la perspectiva de género en el análisis filosófico. No hay respuestas 'correctas': el objetivo es identificar tus áreas de fortaleza y las que aún puedes desarrollar.",
    criterios: [
      {
        descripcion: "Identifico sesgos androcéntricos en textos filosóficos clásicos",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "No identifico aún los sesgos; los textos filosóficos me parecen neutrales." },
          { valor: 2, etiqueta: "En desarrollo", descripcion: "Comienzo a notar ausencias (pocas filósofas citadas) pero no analizo los sesgos en profundidad." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Identifico sesgos androcéntricos en los textos y puedo explicar cómo afectan las conclusiones filosóficas." },
        ],
      },
      {
        descripcion: "Relaciono la experiencia situada (género, clase, etnia) con la producción de conocimiento filosófico",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "No veo la conexión entre experiencia personal y el tipo de conocimiento que se produce." },
          { valor: 2, etiqueta: "En desarrollo", descripcion: "Entiendo que la perspectiva del filósofo influye, pero no sé cómo analizarlo sistemáticamente." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Puedo analizar cómo la posición social del filósofo (género, clase, etnia) moldea los problemas que aborda y las soluciones que propone." },
        ],
      },
      {
        descripcion: "Conozco al menos tres filósofas o pensadoras feministas y sus contribuciones",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "No conozco filósofas feministas o recuerdo solo sus nombres sin poder describir sus ideas." },
          { valor: 2, etiqueta: "En desarrollo", descripcion: "Conozco a Simone de Beauvoir y alguna otra, pero no puedo relacionar sus ideas entre sí." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Conozco las contribuciones de Beauvoir, bell hooks y Graciela Hierro (u otras) y puedo relacionarlas con debates filosóficos actuales." },
        ],
      },
      {
        descripcion: "Aplico la perspectiva de género para enriquecer mi propio análisis filosófico",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "Aún no incorporo la perspectiva de género en mis reflexiones filosóficas propias." },
          { valor: 2, etiqueta: "En desarrollo", descripcion: "Intento incluirla pero me resulta difícil; la veo como un 'añadido' y no como parte integral del análisis." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Integro la perspectiva de género de forma natural en mis argumentos filosóficos, enriqueciendo el análisis." },
        ],
      },
    ],
    reflexion_final_prompt: "Basándote en tu autoevaluación, ¿en qué criterio sientes que más puedes crecer? Escribe una acción concreta que puedas tomar en las próximas semanas para desarrollarlo.",
    visible_para_docente: true,
  },
  { // P05 — quiz_multiple_opcion (Humanismo mexicano)
    preguntas: [
      { enunciado: "¿Qué propuso José Vasconcelos con el concepto de 'la raza cósmica'?", opciones: ["La superioridad biológica de la raza mestiza", "La síntesis cultural de todos los pueblos latinoamericanos como aportación filosófica universal", "El proyecto de exterminar las culturas indígenas para modernizar México", "La separación radical entre las culturas europeas e indígenas"], respuesta_correcta: 1, retroalimentacion: "Vasconcelos propuso que América Latina, por ser mestiza, tiene potencial para sintetizar todas las culturas y crear algo nuevo y universal." },
      { enunciado: "¿Cuál fue la contribución filosófica más importante de Leopoldo Zea?", opciones: ["Proponer que América Latina debe copiar la filosofía europea", "Desarrollar la ética del cuidado en México", "Afirmar la legitimidad de una filosofía latinoamericana propia, 'sin más'", "Criticar el humanismo y proponer el existencialismo mexicano"], respuesta_correcta: 2, retroalimentacion: "Zea defendió que el pensamiento filosófico latinoamericano es legítimo y tiene valor universal, sin necesitar validación europea." },
      { enunciado: "¿Por qué se considera a Sor Juana Inés de la Cruz una figura filosófica pionera en México?", opciones: ["Fue la primera mujer en gobernar una universidad", "Defendió en el siglo XVII el derecho de las mujeres al conocimiento y la vida intelectual", "Fue la primera en escribir en náhuatl sobre filosofía occidental", "Propuso la unificación del pensamiento indígena y cristiano"], respuesta_correcta: 1, retroalimentacion: "Sor Juana desafió las restricciones de género de su época al reclamar el derecho de la mujer al aprendizaje y la expresión intelectual." },
      { enunciado: "¿Qué es el 'giro descolonial' en la filosofía latinoamericana?", opciones: ["Un movimiento que propone volver a la colonización europea para modernizar América", "La crítica a la modernidad eurocéntrica y la reivindicación de los saberes y experiencias de los pueblos colonizados", "El abandono total de la filosofía occidental en favor de la filosofía indígena", "Una corriente que promueve el regreso al pensamiento precolombino sin modificaciones"], respuesta_correcta: 1, retroalimentacion: "El giro descolonial (Dussel, Quijano, Mignolo) cuestiona que la modernidad occidental sea el único modelo válido de conocimiento y progreso." },
      { enunciado: "¿Qué aportó Graciela Hierro a la filosofía mexicana?", opciones: ["Desarrolló la filosofía de la ciencia en México", "Construyó una ética feminista latinoamericana que vincula bienestar, placer y justicia social", "Escribió la primera historia de la filosofía mexicana", "Introdujo el existencialismo francés en México"], respuesta_correcta: 1, retroalimentacion: "Graciela Hierro construyó una ética feminista desde América Latina, vinculando el placer y el bienestar de las mujeres con la justicia." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
];

// ── A3 ──────────────────────────────────────────────────────────────────────────
const contenidosA3 = [
  { // P01 — reflexion_escrita (Ontología — pregunta existencial personal)
    prompt: "Los filósofos llevan siglos preguntando: ¿Por qué existe algo en lugar de nada? ¿Qué soy yo en realidad: un cuerpo, una mente, las dos cosas, ninguna? ¿La realidad que percibo es la realidad tal como es, o solo mi versión de ella?\n\nElige la pregunta ontológica que más te interpele. Explica por qué esa pregunta te parece importante, intenta responderla desde al menos dos posturas filosóficas diferentes (realismo, idealismo, materialismo u otra que hayas estudiado), y di con cuál te identificas más y por qué.",
    pistas: ["No hay respuesta 'correcta': en ontología, el argumento importa más que la conclusión.", "Conecta la pregunta filosófica con algo concreto de tu propia vida.", "Usa vocabulario del glosario cuando puedas."],
    longitud_minima_palabras: 120,
    longitud_maxima_palabras: 400,
    criterios_evaluacion: ["Identifica claramente la pregunta ontológica elegida", "Presenta al menos dos posturas filosóficas relevantes con sus argumentos", "Expresa una postura personal fundamentada filosóficamente", "Usa vocabulario filosófico del glosario de manera precisa"],
    formato_esperado: "ensayo" as const,
  },
  { // P02 — debate_estructurado (Ética — ¿Los fines justifican los medios?)
    tema: "¿Los fines justifican los medios? Un debate entre ética consecuencialista y deontológica",
    posturas: ["Los fines sí justifican los medios si el resultado es suficientemente bueno (postura consecuencialista)", "Los fines nunca justifican los medios: hay límites morales absolutos (postura deontológica)"],
    argumentos_guia: {
      "Los fines sí justifican los medios si el resultado es suficientemente bueno (postura consecuencialista)": [
        "Si mentir salva muchas vidas inocentes, la mentira está moralmente justificada.",
        "Juzgar las acciones sin considerar sus consecuencias puede llevar a resultados absurdamente dañinos.",
        "La historia muestra que muchas luchas por la justicia requirieron acciones que violaban reglas establecidas.",
        "La moral debe adaptarse al mundo real, no a principios abstractos desconectados de las consecuencias.",
      ],
      "Los fines nunca justifican los medios: hay límites morales absolutos (postura deontológica)": [
        "Si cualquier medio puede justificarse con un fin suficientemente 'bueno', se abre la puerta a cualquier abuso.",
        "Kant: usar a una persona solo como medio para un fin viola su dignidad, que es inviolable.",
        "Los derechos humanos son deontológicos: existen independientemente de si respetarlos produce buenos resultados.",
        "La tortura de un inocente no puede justificarse aunque produzca información que salve vidas.",
        "Si aceptamos que los fines justifican los medios, destruimos la base misma de la moral.",
      ],
    },
    reglas: ["Argumenta desde la corriente ética asignada, usando sus conceptos clave", "Apoya con ejemplos concretos, históricos o filosóficos", "Responde al menos un argumento de la postura contraria"],
    tiempo_argumentacion_minutos: 4,
    criterios_evaluacion: ["Argumenta coherentemente desde la corriente ética asignada", "Usa conceptos filosóficos precisos (consecuencias/utilidad o deber/imperativo categórico)", "Presenta al menos 3 argumentos sólidos", "Refuta al menos un argumento de la postura contraria"],
    modalidad: "escrito" as const,
  },
  { // P03 — reflexion_escrita (Bioética — postura personal ante un dilema)
    prompt: "Elige uno de los siguientes dilemas bioéticos contemporáneos:\n\n(A) Eutanasia o muerte digna: ¿tiene una persona el derecho a decidir el momento de su propia muerte cuando sufre una enfermedad terminal e irreversible?\n\n(B) Ingeniería genética: ¿es éticamente aceptable modificar el genoma de un embrión humano para eliminar enfermedades hereditarias? ¿Y para mejorar características como la inteligencia o el aspecto físico?\n\n(C) Medio ambiente y ética: ¿tienen los seres humanos deberes morales hacia los animales y los ecosistemas, o solo hacia otros seres humanos?\n\nPresenta tu postura filosófica: ¿qué corriente ética usarías para analizar el dilema que elegiste? ¿A qué conclusión llegas? ¿Qué perspectiva de género o interculturalidad aporta a tu análisis?",
    pistas: ["Elige el dilema que más te mueva o sobre el que más tengas qué decir.", "Nombra explícitamente qué corriente ética usas (deontológica, consecuencialista, del cuidado, etc.).", "La perspectiva de género puede enriquecer el análisis: ¿el dilema afecta igual a todas las personas?"],
    longitud_minima_palabras: 120,
    longitud_maxima_palabras: 450,
    criterios_evaluacion: ["Identifica claramente el dilema elegido", "Aplica al menos una corriente ética de forma precisa y coherente", "Formula una postura personal razonada y no solo emocional", "Incorpora una perspectiva de género, intercultural o de justicia social"],
    formato_esperado: "ensayo" as const,
  },
  { // P04 — reflexion_escrita (Filosofía y género — exclusiones y su relevancia)
    prompt: "La filósofa bell hooks escribió: 'El feminismo es para todo el mundo.' El texto que leíste argumenta que la filosofía ha excluido históricamente a las mujeres, a las personas no blancas y a quienes no pertenecen a la élite occidental.\n\nResponde: ¿Qué piensas que se ha perdido filosóficamente con esas exclusiones? ¿Qué preguntas o perspectivas no se han explorado? Da al menos un ejemplo concreto. ¿Cómo cambiaría la filosofía si incluyera sistemáticamente las perspectivas de grupos históricamente marginados?",
    pistas: ["Piensa en qué experiencias de vida generan preguntas filosóficas que los filósofos privilegiados no tendrían.", "Usa las ideas de Beauvoir, bell hooks o Graciela Hierro si las recuerdas.", "No tienes que tener 'la respuesta correcta': lo importante es argumentar con coherencia."],
    longitud_minima_palabras: 100,
    longitud_maxima_palabras: 380,
    criterios_evaluacion: ["Identifica la exclusión histórica en filosofía y la argumenta con al menos un ejemplo", "Reflexiona sobre qué se pierde epistemológicamente con esas exclusiones", "Propone cómo incluir otras perspectivas transformaría la filosofía", "Muestra comprensión de al menos una pensadora feminista estudiada"],
    formato_esperado: "ensayo" as const,
  },
  { // P05 — reflexion_escrita (Humanismo mexicano — vigencia hoy)
    prompt: "El humanismo mexicano reúne voces muy diversas: el tlamatini nahua que busca el 'rostro y corazón' verdadero, Sor Juana defendiendo el derecho a saber, Vasconcelos soñando con una 'raza cósmica', Zea afirmando que nuestra filosofía es tan válida como cualquier otra, y Dussel cuestionando la modernidad colonial.\n\n¿Alguna de estas ideas o pensadores te parece especialmente relevante para entender o enfrentar un problema que vive México hoy? Elige uno o dos y desarrolla: ¿qué problema contemporáneo ilumina su pensamiento? ¿En qué sentido es una filosofía 'vigente' y no solo historia?",
    pistas: ["Piensa en problemas actuales: desigualdad, diversidad cultural, educación, derechos indígenas, identidad nacional.", "No necesitas estar de acuerdo con el pensador que elijas: puedes elegirlo para criticarlo.", "La 'vigencia' de una idea filosófica se puede medir por qué tan bien ayuda a entender o resolver problemas presentes."],
    longitud_minima_palabras: 110,
    longitud_maxima_palabras: 380,
    criterios_evaluacion: ["Identifica con claridad al pensador o idea elegida", "Conecta su pensamiento con un problema contemporáneo específico de México", "Argumenta por qué esa idea es vigente (o, si lo criticas, por qué ya no lo es)", "Muestra comprensión del contexto histórico del pensador elegido"],
    formato_esperado: "ensayo" as const,
  },
];

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
