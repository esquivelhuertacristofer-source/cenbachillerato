/**
 * Refuerzo PFH-II (Plantilla CEN): agrega A4-A7 a las 5 progresiones con A1-A3
 * (A1=lectura, A2=quiz_multiple_opcion, A3=reflexion_escrita).
 *   A4=quiz_verdadero_falso · A5=glosario_interactivo · A6=fill_blanks · A7=autoevaluacion
 * Keyed por CÓDIGO. Todas estado='borrador'. Uso: npx tsx scripts/seed-activities-pfhii-refuerzo.ts
 * Contenido fiel al programa oficial PFH-II "Las reflexiones filosóficas sobre el Conocer".
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
  log("\n🌱 Refuerzo PFH-II — A4-A7 para las 5 progresiones existentes\n");
  const progs = await getProgresionesDeUAC(sb, "PFH-II");
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
  log(`\n✅ PFH-II refuerzo: ${ok} insertadas, ${fail} fallidas, ${skip} progresiones omitidas (nuevas).\n`);
}

const refuerzos: Record<string, Refuerzo[]> = {
  // ════════ PFH-II-P01 — Fundamentos del Ser (pensamiento ontológico) ════════
  "PFH-II-P01": [
    { titulo: "Fundamentos del Ser — Verdadero o falso", descripcion: "Distingue afirmaciones sobre el asombro, la ontología, la metafísica y la existencia.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "El asombro ante la realidad es considerado uno de los orígenes de la Filosofía.", respuesta: true, retroalimentacion: "Correcto: el asombro despierta la pregunta filosófica." },
        { enunciado: "El pensamiento filosófico no tiene límites ni problemas que no pueda resolver de inmediato.", respuesta: false, retroalimentacion: "La Filosofía reconoce sus propios límites y preguntas abiertas." },
        { enunciado: "La Ontología se pregunta por el Ser, es decir, por aquello que hace que las cosas sean.", respuesta: true, retroalimentacion: "Correcto: la Ontología estudia el Ser en cuanto ser." },
        { enunciado: "Realidad y apariencia siempre coinciden: las cosas son tal como las percibimos.", respuesta: false, retroalimentacion: "La distinción entre realidad y apariencia muestra que percibir no es siempre conocer." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: ontología y metafísica", descripcion: "Aprende los términos clave del pensamiento sobre el Ser.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Asombro", definicion: "Estado de admiración ante la realidad que despierta la pregunta filosófica.", ejemplo: "Preguntarse '¿por qué hay algo en lugar de nada?'." },
        { termino: "Ontología", definicion: "Parte de la Filosofía que estudia el Ser, lo que hace que las cosas sean.", ejemplo: "Preguntar qué significa que algo 'exista'." },
        { termino: "Metafísica", definicion: "Reflexión sobre la realidad más allá de lo físico y sus principios fundamentales.", ejemplo: "Indagar la causa primera de todo lo que existe." },
        { termino: "Realidad y apariencia", definicion: "Distinción entre lo que las cosas son y cómo se nos muestran a la percepción.", ejemplo: "Un bastón recto parece quebrado dentro del agua." },
        { termino: "Existencia", definicion: "Modo en que el ser humano es y se hace en el mundo a lo largo de su vida.", ejemplo: "Reflexionar sobre el propio proyecto de vida." },
      ], actividad_final: "Escribe una situación cotidiana que te haya provocado asombro y conviértela en una pregunta sobre el Ser." } },
    { titulo: "Completa: fundamentos del Ser", descripcion: "Completa el texto sobre ontología, metafísica y existencia.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "El ___ ante la realidad es uno de los orígenes de la Filosofía. La ___ estudia el Ser, mientras que la ___ reflexiona sobre la realidad más allá de lo físico. Distinguir lo que las cosas son de cómo se nos muestran es la diferencia entre realidad y ___.",
        huecos: [
          { posicion: 0, respuesta_correcta: "asombro", pista: "Admiración que despierta la pregunta." },
          { posicion: 1, respuesta_correcta: "ontología", alternativas_aceptadas: ["ontologia"], pista: "Estudia el Ser." },
          { posicion: 2, respuesta_correcta: "metafísica", alternativas_aceptadas: ["metafisica"], pista: "Más allá de lo físico." },
          { posicion: 3, respuesta_correcta: "apariencia", pista: "Cómo se nos muestran las cosas." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Fundamentos del Ser", descripcion: "Valora tu comprensión del pensamiento ontológico.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Reconozco el asombro como origen de la Filosofía y los límites del pensar filosófico.", escala: escala4 },
        { descripcion: "Distingo entre Ontología y Metafísica y comprendo qué es el Ser.", escala: escala4 },
        { descripcion: "Diferencio realidad de apariencia al reflexionar sobre la existencia humana.", escala: escala4 },
      ], reflexion_final_prompt: "¿Qué pregunta sobre el Ser o la existencia te gustaría seguir explorando?" } },
  ],

  // ════════ PFH-II-P02 — Fundamentos éticos y su aplicación en la vida cotidiana ════════
  "PFH-II-P02": [
    { titulo: "Fundamentos éticos — Verdadero o falso", descripcion: "Distingue afirmaciones sobre ética, moral, justicia, libertad e igualdad.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "La Ética reflexiona de forma crítica sobre los fundamentos de la moral y la conducta.", respuesta: true, retroalimentacion: "Correcto: la Ética piensa el porqué de lo que consideramos bueno." },
        { enunciado: "Moral y Ética son exactamente lo mismo y no se pueden distinguir.", respuesta: false, retroalimentacion: "La moral son las normas vividas; la Ética las reflexiona y fundamenta." },
        { enunciado: "La Justicia, la Libertad y la Igualdad son valores centrales de la reflexión ética y política.", respuesta: true, retroalimentacion: "Correcto: orientan la convivencia y las decisiones públicas." },
        { enunciado: "Un dilema moral es una situación con una única respuesta evidente y sin conflicto de valores.", respuesta: false, retroalimentacion: "Un dilema moral enfrenta valores o deberes que entran en conflicto." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: ética, moral y valores", descripcion: "Aprende los términos clave de la reflexión ética.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Ética", definicion: "Reflexión filosófica y crítica sobre los fundamentos de la moral y la buena conducta.", ejemplo: "Preguntar por qué algo es justo o injusto." },
        { termino: "Moral", definicion: "Conjunto de normas, valores y costumbres que orientan la conducta en una comunidad.", ejemplo: "Las normas de honestidad aprendidas en casa." },
        { termino: "Justicia", definicion: "Valor que busca dar a cada quien lo que le corresponde y un trato equitativo.", ejemplo: "Repartir cargas y beneficios de forma equitativa." },
        { termino: "Libertad", definicion: "Capacidad de decidir y actuar de forma responsable, asumiendo sus consecuencias.", ejemplo: "Elegir con base en razones propias." },
        { termino: "Dilema moral", definicion: "Situación en la que valores o deberes entran en conflicto y obligan a decidir.", ejemplo: "Decir la verdad aunque dañe a alguien." },
      ], actividad_final: "Describe un dilema moral de la vida cotidiana y qué valores entran en conflicto en él." } },
    { titulo: "Completa: fundamentos éticos", descripcion: "Completa el texto sobre ética, moral y valores.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "La ___ reflexiona críticamente sobre los fundamentos de la conducta, mientras que la ___ son las normas y costumbres vividas en comunidad. La ___ busca dar a cada quien lo que le corresponde. Cuando valores o deberes entran en conflicto se presenta un ___ moral.",
        huecos: [
          { posicion: 0, respuesta_correcta: "ética", alternativas_aceptadas: ["etica"], pista: "Reflexión crítica sobre la conducta." },
          { posicion: 1, respuesta_correcta: "moral", pista: "Normas y costumbres vividas." },
          { posicion: 2, respuesta_correcta: "justicia", pista: "Dar a cada quien lo suyo." },
          { posicion: 3, respuesta_correcta: "dilema", pista: "Conflicto de valores o deberes." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Fundamentos éticos", descripcion: "Valora tu comprensión de la ética aplicada a la vida cotidiana.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Distingo la Ética de la moral y comprendo sus fundamentos.", escala: escala4 },
        { descripcion: "Relaciono la Justicia, la Libertad y la Igualdad con la Ética y la Política.", escala: escala4 },
        { descripcion: "Analizo dilemas morales con argumentos y desde distintas posturas.", escala: escala4 },
      ], reflexion_final_prompt: "¿Qué valor (justicia, libertad o igualdad) te parece más urgente en tu entorno y por qué?" } },
  ],

  // ════════ PFH-II-P03 — Desafíos éticos de la ciencia y la tecnología ════════
  "PFH-II-P03": [
    { titulo: "Ciencia, tecnología y ética — Verdadero o falso", descripcion: "Distingue afirmaciones sobre bioética, inteligencia artificial, ambiente y animalidad.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "La Bioética reflexiona sobre los problemas éticos que surgen de la vida, la salud y la biotecnología.", respuesta: true, retroalimentacion: "Correcto: la Bioética piensa las implicaciones éticas de intervenir la vida." },
        { enunciado: "La inteligencia artificial abre debates filosóficos sobre la naturaleza del Ser y de la conciencia.", respuesta: true, retroalimentacion: "Correcto: la IA replantea qué entendemos por pensar, decidir y ser." },
        { enunciado: "El avance científico y tecnológico no requiere ninguna reflexión ética.", respuesta: false, retroalimentacion: "Todo avance implica decisiones con consecuencias que la Ética debe valorar." },
        { enunciado: "Los problemas medioambientales pueden abordarse desde una postura ética.", respuesta: true, retroalimentacion: "Correcto: la crisis ambiental plantea deberes hacia el planeta y las generaciones futuras." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: bioética y tecnología", descripcion: "Aprende los términos clave de los desafíos éticos de la ciencia.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Bioética", definicion: "Reflexión ética sobre los problemas derivados de la vida, la salud y la biotecnología.", ejemplo: "Debatir los límites de la manipulación genética." },
        { termino: "Inteligencia artificial", definicion: "Tecnología que simula procesos del pensamiento humano y plantea debates sobre el Ser.", ejemplo: "Preguntar si una máquina puede 'decidir' o 'comprender'." },
        { termino: "Postura ética", definicion: "Posición razonada sobre lo correcto frente a un problema, como el ambiental.", ejemplo: "Asumir el cuidado del planeta como un deber." },
        { termino: "Filosofía de la animalidad", definicion: "Reflexión sobre el estatus moral de los animales y nuestra relación con ellos.", ejemplo: "Preguntar si los animales tienen derechos." },
        { termino: "Problema medioambiental", definicion: "Daño al entorno que plantea responsabilidades éticas hacia la vida y el futuro.", ejemplo: "El cambio climático y la contaminación." },
      ], actividad_final: "Elige un avance tecnológico actual y formula una pregunta ética que plantee." } },
    { titulo: "Completa: ciencia, tecnología y ética", descripcion: "Completa el texto sobre bioética, IA y ambiente.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "La ___ reflexiona sobre los problemas éticos de la vida y la salud. La inteligencia ___ abre debates sobre la naturaleza del Ser. Frente a los problemas medioambientales conviene asumir una ___ ética. La reflexión sobre el estatus moral de los animales es la filosofía de la ___.",
        huecos: [
          { posicion: 0, respuesta_correcta: "bioética", alternativas_aceptadas: ["bioetica"], pista: "Ética de la vida y la salud." },
          { posicion: 1, respuesta_correcta: "artificial", pista: "Inteligencia ___." },
          { posicion: 2, respuesta_correcta: "postura", pista: "Posición razonada." },
          { posicion: 3, respuesta_correcta: "animalidad", pista: "Estatus moral de los animales." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Ciencia, tecnología y ética", descripcion: "Valora tu reflexión sobre los desafíos éticos de la ciencia.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Comprendo perspectivas bioéticas sobre la ciencia y la tecnología.", escala: escala4 },
        { descripcion: "Analizo los debates que la inteligencia artificial plantea sobre el Ser.", escala: escala4 },
        { descripcion: "Asumo una postura ética ante los problemas medioambientales y la animalidad.", escala: escala4 },
      ], reflexion_final_prompt: "¿Qué responsabilidad ética crees que tenemos frente a la tecnología y el ambiente?" } },
  ],

  // ════════ PFH-II-P04 — Desigualdades de género desde la filosofía ════════
  "PFH-II-P04": [
    { titulo: "Género y filosofía — Verdadero o falso", descripcion: "Distingue afirmaciones sobre feminismos, desigualdad de género y subjetividades trans.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "Los feminismos en México han impulsado reflexiones filosóficas sobre la desigualdad de género.", respuesta: true, retroalimentacion: "Correcto: el feminismo aporta perspectivas críticas al pensamiento." },
        { enunciado: "La desigualdad de género es solo un problema individual sin dimensión social ni filosófica.", respuesta: false, retroalimentacion: "Es un problema estructural que la Filosofía analiza críticamente." },
        { enunciado: "La Filosofía puede ofrecer perspectivas para comprender y cuestionar la desigualdad de género.", respuesta: true, retroalimentacion: "Correcto: aporta categorías para pensar la equidad." },
        { enunciado: "Reflexionar sobre las subjetividades trans amplía la comprensión de la identidad humana.", respuesta: true, retroalimentacion: "Correcto: enriquece la reflexión sobre la diversidad y la dignidad." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: género y desigualdad", descripcion: "Aprende los términos clave de la filosofía sobre el género.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Género", definicion: "Construcción social y cultural de lo que se considera propio de mujeres y hombres.", ejemplo: "Los roles asignados socialmente según el sexo." },
        { termino: "Feminismo", definicion: "Pensamiento y movimiento que busca la igualdad de derechos y cuestiona la desigualdad de género.", ejemplo: "El movimiento feminista en México." },
        { termino: "Desigualdad de género", definicion: "Trato o acceso injusto basado en el género de las personas.", ejemplo: "Brechas salariales entre mujeres y hombres." },
        { termino: "Subjetividad trans", definicion: "Experiencia y forma de ser de las personas trans, que amplía la comprensión de la identidad.", ejemplo: "Reconocer la identidad de género autopercibida." },
        { termino: "Equidad", definicion: "Trato justo que reconoce y corrige las desventajas para lograr igualdad real.", ejemplo: "Medidas para cerrar brechas de género." },
      ], actividad_final: "Identifica una situación de desigualdad de género en tu entorno y propón una idea para promover la equidad." } },
    { titulo: "Completa: género y filosofía", descripcion: "Completa el texto sobre feminismos y desigualdad de género.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "El ___ es la construcción social de lo propio de mujeres y hombres. Los ___ en México impulsan reflexiones sobre la ___ de género. Reconocer las subjetividades ___ amplía la comprensión de la identidad humana.",
        huecos: [
          { posicion: 0, respuesta_correcta: "género", alternativas_aceptadas: ["genero"], pista: "Construcción social, no solo biológica." },
          { posicion: 1, respuesta_correcta: "feminismos", pista: "Movimientos por la igualdad." },
          { posicion: 2, respuesta_correcta: "desigualdad", pista: "Trato injusto." },
          { posicion: 3, respuesta_correcta: "trans", pista: "Subjetividades ___." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Género y filosofía", descripcion: "Valora tu reflexión filosófica sobre la desigualdad de género.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Reconozco los aportes de los feminismos en México al pensamiento.", escala: escala4 },
        { descripcion: "Analizo experiencias de desigualdad de género desde perspectivas filosóficas.", escala: escala4 },
        { descripcion: "Valoro las subjetividades trans dentro de la reflexión sobre la identidad.", escala: escala4 },
      ], reflexion_final_prompt: "¿Cómo puedes contribuir, desde tu lugar, a una convivencia más equitativa?" } },
  ],

  // ════════ PFH-II-P05 — Integra saberes filosóficos y perspectivas humanistas (síntesis) ════════
  "PFH-II-P05": [
    { titulo: "Síntesis humanista — Verdadero o falso", descripcion: "Distingue afirmaciones sobre praxis transformadora, Humanismo Mexicano y ética del pensamiento.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "La praxis transformadora une la reflexión filosófica con la acción para mejorar el mundo.", respuesta: true, retroalimentacion: "Correcto: la praxis articula pensar y actuar." },
        { enunciado: "El Humanismo Mexicano pone en el centro la dignidad de las personas y el bien común.", respuesta: true, retroalimentacion: "Correcto: rescata valores de justicia, solidaridad y comunidad." },
        { enunciado: "Integrar saberes filosóficos no aporta nada para construir un mundo más habitable y justo.", respuesta: false, retroalimentacion: "La síntesis filosófica orienta la acción hacia un mundo más justo." },
        { enunciado: "La ética del pensamiento implica pensar con rigor, honestidad y responsabilidad.", respuesta: true, retroalimentacion: "Correcto: pensar bien también es una responsabilidad ética." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: praxis y humanismo", descripcion: "Aprende los términos clave de la síntesis filosófica humanista.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Praxis transformadora", definicion: "Unión de reflexión y acción orientada a transformar la realidad para bien.", ejemplo: "Un proyecto que mejora la convivencia en la comunidad." },
        { termino: "Humanismo Mexicano", definicion: "Perspectiva que pone en el centro la dignidad humana, la justicia y el bien común desde nuestra cultura.", ejemplo: "Valorar la solidaridad y la comunidad." },
        { termino: "Ética del pensamiento", definicion: "Compromiso de pensar con rigor, honestidad y responsabilidad ante los demás.", ejemplo: "Sostener una idea con argumentos y reconocer los propios errores." },
        { termino: "Mundo habitable y justo", definicion: "Horizonte de una convivencia digna, equitativa y respetuosa de la vida.", ejemplo: "Una sociedad que cuida a las personas y al planeta." },
        { termino: "Síntesis filosófica", definicion: "Integración de distintos saberes y perspectivas para comprender y actuar mejor.", ejemplo: "Relacionar ética, ontología y humanismo en un proyecto." },
      ], actividad_final: "Propón una pequeña acción de praxis transformadora que podrías realizar en tu escuela o comunidad." } },
    { titulo: "Completa: síntesis humanista", descripcion: "Completa el texto sobre praxis, humanismo y ética del pensamiento.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "La ___ transformadora une reflexión y acción para mejorar el mundo. El Humanismo ___ pone en el centro la dignidad humana y el bien común. Integrar saberes ayuda a construir un mundo más ___ y justo. Pensar con rigor, honestidad y responsabilidad es la ___ del pensamiento.",
        huecos: [
          { posicion: 0, respuesta_correcta: "praxis", pista: "Unión de reflexión y acción." },
          { posicion: 1, respuesta_correcta: "Mexicano", alternativas_aceptadas: ["mexicano"], pista: "Humanismo ___." },
          { posicion: 2, respuesta_correcta: "habitable", pista: "Un mundo ___ y justo." },
          { posicion: 3, respuesta_correcta: "ética", alternativas_aceptadas: ["etica"], pista: "Pensar con responsabilidad." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Síntesis humanista", descripcion: "Valora tu integración de saberes filosóficos y humanistas.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Integro saberes filosóficos del semestre en una visión propia.", escala: escala4 },
        { descripcion: "Comprendo la praxis transformadora y la perspectiva del Humanismo Mexicano.", escala: escala4 },
        { descripcion: "Asumo la ética del pensamiento al pensar y dialogar con rigor y responsabilidad.", escala: escala4 },
      ], reflexion_final_prompt: "¿Cómo te gustaría usar lo aprendido en Filosofía para contribuir a un mundo más habitable y justo?" } },
  ],
};

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
