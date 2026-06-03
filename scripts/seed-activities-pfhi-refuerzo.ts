/**
 * Refuerzo PFH-I (Plantilla CEN): agrega A4-A7 a las 5 progresiones con A1-A3
 * (A1=lectura, A2=quiz_multiple_opcion, A3=reflexion_escrita).
 *   A4=quiz_verdadero_falso · A5=glosario_interactivo · A6=fill_blanks · A7=autoevaluacion
 * Keyed por CÓDIGO. Todas estado='borrador'. Uso: npx tsx scripts/seed-activities-pfhi-refuerzo.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad, type ActividadInput } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

type Refuerzo = Pick<ActividadInput, "titulo" | "descripcion" | "tipo" | "xp" | "contenido">;
const letras = ["A4", "A5", "A6", "A7"];

const escala4 = [
  { valor: 1, etiqueta: "En inicio", descripcion: "Todavía necesito apoyo y consultar el material." },
  { valor: 2, etiqueta: "En proceso", descripcion: "Lo logro con algunos errores o dudas." },
  { valor: 3, etiqueta: "Logrado", descripcion: "Lo hago bien de forma autónoma." },
  { valor: 4, etiqueta: "Destacado", descripcion: "Lo hago con seguridad y puedo argumentarlo." },
];

async function main() {
  const sb = createSB();
  log("\n🌱 Refuerzo PFH-I — A4-A7 para las 5 progresiones existentes\n");
  const progs = await getProgresionesDeUAC(sb, "PFH-I");
  let ok = 0, fail = 0, skip = 0;
  for (const p of progs) {
    const set = refuerzos[p.codigo];
    if (!set) { skip++; continue; }
    for (let i = 0; i < set.length; i++) {
      const r = set[i];
      const res = await upsertActividad(sb, {
        codigo: `${p.codigo}-${letras[i]}`, titulo: r.titulo, descripcion: r.descripcion,
        tipo: r.tipo, progresion_id: p.id, xp: r.xp, contenido: r.contenido,
      });
      res ? ok++ : fail++;
    }
  }
  log(`\n✅ PFH-I refuerzo: ${ok} insertadas, ${fail} fallidas, ${skip} progresiones omitidas (nuevas).\n`);
}

const refuerzos: Record<string, Refuerzo[]> = {
  // ════════ PFH-I-P01 — El ejercicio de filosofar (Oficial 1) ════════
  "PFH-I-P01": [
    { titulo: "El ejercicio de filosofar — Verdadero o falso", descripcion: "Distingue afirmaciones sobre qué es filosofar y la perspectiva humanista.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "Filosofar es, ante todo, el acto de preguntarse, dudar y reflexionar sobre la realidad.", respuesta: true, retroalimentacion: "Correcto: filosofar es una práctica, no solo memorizar ideas." },
        { enunciado: "El conocimiento filosófico acumulado (lo que han dicho los filósofos) es lo mismo que el ejercicio de filosofar.", respuesta: false, retroalimentacion: "Son distintos: una cosa es estudiar a los filósofos y otra es filosofar uno mismo." },
        { enunciado: "Cualquier persona, a partir de experiencias cotidianas, puede ejercer el pensamiento propio.", respuesta: true, retroalimentacion: "Correcto: la filosofía parte de la experiencia común." },
        { enunciado: "La perspectiva humanista pone en el centro a la persona y su dignidad.", respuesta: true, retroalimentacion: "Correcto: lo humano es el eje de esta mirada." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: filosofar y perspectiva humanista", descripcion: "Aprende los términos clave del ejercicio de filosofar.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Filosofar", definicion: "Acto de preguntarse, dudar y reflexionar de forma crítica sobre la realidad y la propia existencia.", ejemplo: "Preguntarse '¿qué es una vida buena?'." },
        { termino: "Pensamiento filosófico", definicion: "Forma de pensar que problematiza lo que se da por evidente y busca razones.", ejemplo: "Cuestionar una creencia común." },
        { termino: "Perspectiva humanista", definicion: "Enfoque que pone en el centro a la persona, su dignidad y su capacidad de pensar.", ejemplo: "Valorar a cada ser humano como fin en sí mismo." },
        { termino: "Comunidad de diálogo", definicion: "Grupo que reflexiona en conjunto, escucha y argumenta de forma respetuosa.", ejemplo: "Un círculo de discusión en clase." },
      ], actividad_final: "Escribe una pregunta filosófica que te haya surgido de una experiencia cotidiana." } },
    { titulo: "Completa: el ejercicio de filosofar", descripcion: "Completa el texto sobre filosofar y la perspectiva humanista.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "___ es el acto de preguntarse, dudar y reflexionar sobre la realidad. Es distinto del conocimiento filosófico ___. La perspectiva ___ pone en el centro a la persona. Reflexionar en grupo, escuchando y argumentando, forma una comunidad de ___.",
        huecos: [
          { posicion: 0, respuesta_correcta: "filosofar", pista: "El acto, no el contenido." },
          { posicion: 1, respuesta_correcta: "acumulado", alternativas_aceptadas: ["histórico", "historico"], pista: "Lo que ya dijeron los filósofos." },
          { posicion: 2, respuesta_correcta: "humanista", pista: "Centrada en lo humano." },
          { posicion: 3, respuesta_correcta: "diálogo", alternativas_aceptadas: ["dialogo"], pista: "Comunidad de ___." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — El ejercicio de filosofar", descripcion: "Valora tu comprensión del ejercicio de filosofar.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Distingo filosofar (la práctica) del conocimiento filosófico acumulado.", escala: escala4 },
        { descripcion: "Reconozco la práctica filosófica como modo de problematizar la realidad.", escala: escala4 },
        { descripcion: "Comprendo la perspectiva humanista.", escala: escala4 },
      ], reflexion_final_prompt: "¿Sobre qué tema de tu vida te gustaría empezar a filosofar?" } },
  ],

  // ════════ PFH-I-P02 — La pregunta filosófica (Oficial 2) ════════
  "PFH-I-P02": [
    { titulo: "La pregunta filosófica — Verdadero o falso", descripcion: "Distingue afirmaciones sobre los tipos y la validez de las preguntas.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "Una pregunta filosófica busca cuestionar lo que comúnmente se considera cierto.", respuesta: true, retroalimentacion: "Correcto: problematiza lo evidente." },
        { enunciado: "Las preguntas científicas y las filosóficas son exactamente iguales.", respuesta: false, retroalimentacion: "La ciencia busca datos verificables; la filosofía explora sentidos y fundamentos." },
        { enunciado: "Preguntar bien es una habilidad que se puede desarrollar.", respuesta: true, retroalimentacion: "Correcto: formular buenas preguntas se aprende." },
        { enunciado: "Una pregunta filosófica suele admitir varias respuestas que enriquecen la visión del mundo.", respuesta: true, retroalimentacion: "Correcto: abre, no cierra, el pensamiento." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: tipos de preguntas", descripcion: "Aprende los términos clave sobre la pregunta filosófica.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Pregunta filosófica", definicion: "Cuestión que problematiza lo evidente y busca razones y sentidos profundos.", ejemplo: "¿Qué es ser libre?" },
        { termino: "Pregunta ontológica", definicion: "Pregunta sobre el ser y la realidad.", ejemplo: "¿Qué es real?" },
        { termino: "Pregunta epistemológica", definicion: "Pregunta sobre el conocimiento y cómo lo obtenemos.", ejemplo: "¿Cómo sé que algo es verdad?" },
        { termino: "Pregunta ética", definicion: "Pregunta sobre lo bueno, lo justo y cómo actuar.", ejemplo: "¿Qué debo hacer?" },
        { termino: "Validez de una pregunta", definicion: "Que la pregunta esté bien formulada y sea pertinente para abrir reflexión.", ejemplo: "Una pregunta clara y relevante." },
      ], actividad_final: "Formula una pregunta ontológica, una epistemológica y una ética." } },
    { titulo: "Completa: la pregunta filosófica", descripcion: "Completa el texto sobre los tipos de preguntas.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "Una pregunta ___ problematiza lo evidente. Las preguntas sobre el ser son ___; las que tratan del conocimiento son epistemológicas; las que tratan de lo bueno y lo justo son ___. Que una pregunta esté bien formulada y sea pertinente se refiere a su ___.",
        huecos: [
          { posicion: 0, respuesta_correcta: "filosófica", alternativas_aceptadas: ["filosofica"], pista: "Tipo de pregunta del tema." },
          { posicion: 1, respuesta_correcta: "ontológicas", alternativas_aceptadas: ["ontologicas"], pista: "Sobre el ser." },
          { posicion: 2, respuesta_correcta: "éticas", alternativas_aceptadas: ["eticas"], pista: "Sobre lo bueno y lo justo." },
          { posicion: 3, respuesta_correcta: "validez", pista: "Que esté bien formulada." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — La pregunta filosófica", descripcion: "Valora tu capacidad de formular preguntas filosóficas.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Distingo las preguntas filosóficas de las científicas y cotidianas.", escala: escala4 },
        { descripcion: "Identifico tipos de preguntas (ontológicas, epistemológicas, éticas...).", escala: escala4 },
        { descripcion: "Formulo preguntas válidas y significativas.", escala: escala4 },
      ], reflexion_final_prompt: "¿Qué pregunta te gustaría poder responder algún día?" } },
  ],

  // ════════ PFH-I-P03 — Problemas filosóficos y sentido de la vida (Oficial 3) ════════
  "PFH-I-P03": [
    { titulo: "Problemas filosóficos — Verdadero o falso", descripcion: "Distingue afirmaciones sobre los problemas filosóficos y el sentido de la vida.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "La libertad, la muerte y el sentido de la vida son problemas filosóficos clásicos.", respuesta: true, retroalimentacion: "Correcto: la filosofía los ha abordado por siglos." },
        { enunciado: "Categorizar y conceptualizar ayuda a comprender mejor un problema filosófico.", respuesta: true, retroalimentacion: "Correcto: ordenar ideas es parte del análisis filosófico." },
        { enunciado: "Los problemas filosóficos solo le importan a los expertos, no a la vida cotidiana.", respuesta: false, retroalimentacion: "Atraviesan la vida de todas las personas." },
        { enunciado: "Distintas perspectivas filosóficas pueden dar sentidos diferentes a la vida.", respuesta: true, retroalimentacion: "Correcto: hay varias formas legítimas de comprender la existencia." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: problemas filosóficos", descripcion: "Aprende los conceptos clave de los problemas filosóficos.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Problema filosófico", definicion: "Cuestión profunda y abierta sobre la realidad, la existencia o el sentido que admite distintas respuestas.", ejemplo: "¿Qué es la libertad?" },
        { termino: "Conceptualizar", definicion: "Formar y precisar las ideas o conceptos con que pensamos algo.", ejemplo: "Definir qué entendemos por 'felicidad'." },
        { termino: "Sentido de la vida", definicion: "Reflexión sobre el propósito, el valor y la dirección de la existencia.", ejemplo: "Preguntarse para qué vivimos." },
        { termino: "Devenir", definicion: "El cambio constante de las cosas a lo largo del tiempo.", ejemplo: "Todo fluye y se transforma." },
      ], actividad_final: "Elige un problema filosófico (libertad, tiempo, felicidad...) y escribe por qué te interesa." } },
    { titulo: "Completa: problemas filosóficos", descripcion: "Completa el texto sobre los problemas filosóficos.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "Un problema ___ es una cuestión profunda y abierta. ___ y categorizar ayuda a comprenderlo. La reflexión sobre el propósito de la existencia es el ___ de la vida. El cambio constante de las cosas se llama ___.",
        huecos: [
          { posicion: 0, respuesta_correcta: "filosófico", alternativas_aceptadas: ["filosofico"], pista: "Tipo de problema del tema." },
          { posicion: 1, respuesta_correcta: "conceptualizar", pista: "Precisar las ideas." },
          { posicion: 2, respuesta_correcta: "sentido", pista: "El ___ de la vida." },
          { posicion: 3, respuesta_correcta: "devenir", pista: "El cambio constante." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Problemas filosóficos", descripcion: "Valora tu análisis de los problemas filosóficos.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Reconozco problemas filosóficos clásicos y contemporáneos.", escala: escala4 },
        { descripcion: "Relaciono los problemas filosóficos con mi propia experiencia.", escala: escala4 },
        { descripcion: "Analizo el sentido de la vida desde distintas perspectivas.", escala: escala4 },
      ], reflexion_final_prompt: "¿Qué le da sentido a tu vida en este momento?" } },
  ],

  // ════════ PFH-I-P04 (numero 5) — El diálogo filosófico (Oficial 5) ════════
  "PFH-I-P04": [
    { titulo: "El diálogo filosófico — Verdadero o falso", descripcion: "Distingue afirmaciones sobre el diálogo y las comunidades de diálogo.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "El diálogo filosófico busca construir conocimiento de forma colectiva.", respuesta: true, retroalimentacion: "Correcto: se piensa con otras personas." },
        { enunciado: "En un diálogo filosófico lo importante es 'ganar' la discusión a toda costa.", respuesta: false, retroalimentacion: "Se busca comprender mejor, no vencer al otro." },
        { enunciado: "Escuchar con apertura y reformular las propias ideas es parte del diálogo filosófico.", respuesta: true, retroalimentacion: "Correcto: el diálogo transforma nuestro pensamiento." },
        { enunciado: "La controversia, bien encauzada, puede ser una oportunidad para el diálogo.", respuesta: true, retroalimentacion: "Correcto: el desacuerdo respetuoso enriquece." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: diálogo filosófico", descripcion: "Aprende los términos clave del diálogo filosófico.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Diálogo filosófico", definicion: "Conversación reflexiva en la que se construye conocimiento de forma colectiva, con escucha y argumentos.", ejemplo: "Discutir en clase qué es la justicia." },
        { termino: "Escucha activa", definicion: "Atender con apertura y respeto lo que el otro dice, para comprenderlo.", ejemplo: "Repetir con tus palabras la idea del otro antes de responder." },
        { termino: "Argumento", definicion: "Razón que se ofrece para sostener una afirmación.", ejemplo: "'Es injusto porque trata distinto a quienes son iguales'." },
        { termino: "Controversia", definicion: "Desacuerdo sobre un tema que, encauzado con respeto, abre el diálogo.", ejemplo: "Dos posturas distintas sobre un dilema." },
      ], actividad_final: "Anota dos reglas que ayudarían a que un diálogo en tu salón sea respetuoso." } },
    { titulo: "Completa: el diálogo filosófico", descripcion: "Completa el texto sobre el diálogo filosófico.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "El diálogo ___ construye conocimiento de forma colectiva. Requiere ___ activa, es decir, atender con apertura al otro. Una razón que sostiene una afirmación es un ___. El desacuerdo respetuoso, o ___, puede abrir el diálogo.",
        huecos: [
          { posicion: 0, respuesta_correcta: "filosófico", alternativas_aceptadas: ["filosofico"], pista: "Tipo de diálogo del tema." },
          { posicion: 1, respuesta_correcta: "escucha", pista: "___ activa." },
          { posicion: 2, respuesta_correcta: "argumento", pista: "Una razón." },
          { posicion: 3, respuesta_correcta: "controversia", pista: "Desacuerdo respetuoso." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — El diálogo filosófico", descripcion: "Valora tu práctica del diálogo filosófico.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Participo en comunidades de diálogo con respeto y rigor.", escala: escala4 },
        { descripcion: "Escucho con apertura y reformulo mis ideas.", escala: escala4 },
        { descripcion: "Manejo la controversia como oportunidad de diálogo.", escala: escala4 },
      ], reflexion_final_prompt: "¿Qué actitud tuya mejorarías para dialogar mejor con los demás?" } },
  ],

  // ════════ PFH-I-P05 (numero 6) — Diversidad de tradiciones (Complemento) ════════
  "PFH-I-P05": [
    { titulo: "Tradiciones filosóficas — Verdadero o falso", descripcion: "Distingue afirmaciones sobre la diversidad de tradiciones filosóficas.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "Existen tradiciones filosóficas distintas: occidental, oriental e indígena, entre otras.", respuesta: true, retroalimentacion: "Correcto: el pensamiento es diverso en el mundo." },
        { enunciado: "Solo la filosofía occidental es una forma legítima de pensar el mundo.", respuesta: false, retroalimentacion: "Todas las tradiciones son formas válidas de filosofar." },
        { enunciado: "Las filosofías indígenas y mesoamericanas también aportan visiones del mundo valiosas.", respuesta: true, retroalimentacion: "Correcto: enriquecen la perspectiva humanista." },
        { enunciado: "Conocer otras tradiciones ayuda a ampliar y cuestionar la propia visión del mundo.", respuesta: true, retroalimentacion: "Correcto: la interculturalidad enriquece el pensamiento." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: tradiciones filosóficas", descripcion: "Aprende los términos clave sobre la diversidad filosófica.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Tradición filosófica", definicion: "Conjunto de ideas y formas de pensar desarrolladas por una cultura a lo largo del tiempo.", ejemplo: "La tradición griega clásica." },
        { termino: "Filosofía oriental", definicion: "Tradiciones de pensamiento de Asia, como el budismo, el taoísmo o el confucianismo.", ejemplo: "El concepto de equilibrio en el taoísmo." },
        { termino: "Filosofía indígena", definicion: "Pensamiento de los pueblos originarios sobre la vida, la comunidad y la naturaleza.", ejemplo: "La visión de la naturaleza como comunidad de vida." },
        { termino: "Interculturalidad", definicion: "Diálogo y respeto entre culturas distintas, reconociendo su valor.", ejemplo: "Aprender de varias tradiciones sin jerarquizarlas." },
      ], actividad_final: "Investiga una idea de una tradición filosófica distinta a la occidental y anótala." } },
    { titulo: "Completa: tradiciones filosóficas", descripcion: "Completa el texto sobre la diversidad de tradiciones.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "Existen distintas ___ filosóficas: occidental, ___ e indígena, entre otras. Todas son formas ___ de pensar el mundo. El diálogo y respeto entre culturas se llama ___.",
        huecos: [
          { posicion: 0, respuesta_correcta: "tradiciones", pista: "Conjuntos de ideas de una cultura." },
          { posicion: 1, respuesta_correcta: "oriental", pista: "La de Asia." },
          { posicion: 2, respuesta_correcta: "legítimas", alternativas_aceptadas: ["legitimas", "válidas", "validas"], pista: "Válidas." },
          { posicion: 3, respuesta_correcta: "interculturalidad", pista: "Diálogo entre culturas." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Tradiciones filosóficas", descripcion: "Valora tu reconocimiento de la diversidad filosófica.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Reconozco distintas tradiciones filosóficas (occidental, oriental, indígena).", escala: escala4 },
        { descripcion: "Valoro todas las tradiciones como formas legítimas de pensar.", escala: escala4 },
        { descripcion: "Aplico una mirada intercultural al pensar el mundo.", escala: escala4 },
      ], reflexion_final_prompt: "¿Qué podrías aprender de una tradición filosófica distinta a la tuya?" } },
  ],
};

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
