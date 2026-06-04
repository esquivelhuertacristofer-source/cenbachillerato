/**
 * Refuerzo CS-II (Plantilla CEN): agrega A4-A7 a las 4 progresiones que ya tienen A1-A3
 * (A1=lectura, A2=quiz_multiple_opcion, A3=reflexion_escrita).
 *   A4 = quiz_verdadero_falso · A5 = glosario_interactivo · A6 = fill_blanks · A7 = autoevaluacion
 * UAC: CS-II — Ciencias Sociales II "Organización, relaciones sociales y económicas".
 * Keyed por CÓDIGO. Todas en estado='borrador'. Contenido fiel al programa oficial.
 * Uso: npx tsx scripts/seed-activities-csii-refuerzo.ts
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
  log("\n🌱 Refuerzo CS-II — A4-A7 para las 4 progresiones existentes\n");
  const progs = await getProgresionesDeUAC(sb, "CS-II");
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
  log(`\n✅ CS-II refuerzo: ${ok} insertadas, ${fail} fallidas, ${skip} progresiones omitidas.\n`);
}

const refuerzos: Record<string, Refuerzo[]> = {
  // ════════ CS-II-P01 — Necesidades y satisfactores; organización social y bienestar ════════
  "CS-II-P01": [
    { titulo: "Necesidades y bienestar social — Verdadero o falso", descripcion: "Distingue afirmaciones sobre necesidades, satisfactores y el bienestar desde el enfoque de derechos.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "Una necesidad es una carencia que las personas buscan satisfacer para vivir y desarrollarse.", respuesta: true, retroalimentacion: "Correcto: las necesidades motivan la búsqueda de satisfactores." },
        { enunciado: "Un satisfactor es el medio (bien, servicio o relación) con el que se cubre una necesidad.", respuesta: true, retroalimentacion: "Correcto: por ejemplo, el alimento satisface la necesidad de nutrición." },
        { enunciado: "El bienestar social desde el enfoque de derechos solo depende de la caridad y no de garantías para todas las personas.", respuesta: false, retroalimentacion: "El enfoque de derechos plantea que el bienestar es una garantía exigible, no una dádiva." },
        { enunciado: "Las necesidades vitales (alimentación, salud, vivienda, educación) se satisfacen de formas distintas según el entorno familiar y comunitario.", respuesta: true, retroalimentacion: "Correcto: las formas de satisfacerlas varían entre contextos." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: necesidades, satisfactores y bienestar", descripcion: "Aprende los términos clave sobre necesidades, organización social y bienestar.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Necesidad", definicion: "Carencia o falta de algo indispensable para la vida y el desarrollo de las personas.", ejemplo: "La necesidad de alimentarse, de salud o de educación." },
        { termino: "Satisfactor", definicion: "Bien, servicio o relación social con el que se cubre una necesidad.", ejemplo: "El agua potable como satisfactor de la necesidad de hidratación." },
        { termino: "Necesidades vitales", definicion: "Aquellas indispensables para sobrevivir y vivir con dignidad, como alimentación, salud, vivienda y educación.", ejemplo: "Tener acceso a servicios de salud cuando se enferma una persona." },
        { termino: "Bienestar social", definicion: "Conjunto de condiciones que permiten a las personas vivir con dignidad y satisfacer sus necesidades.", ejemplo: "Acceso a salud, educación y un ingreso suficiente." },
        { termino: "Enfoque de derechos", definicion: "Perspectiva que entiende el bienestar como un conjunto de derechos garantizados para todas las personas, no como un favor.", ejemplo: "El derecho a la educación o a la salud reconocidos en la Constitución." },
      ], actividad_final: "Haz una lista de tres necesidades vitales de tu familia e indica con qué satisfactor se cubre cada una." } },
    { titulo: "Completa: necesidades y bienestar", descripcion: "Completa el texto sobre necesidades, satisfactores y bienestar social.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "Una ___ es una carencia que las personas buscan cubrir; el medio para cubrirla es el ___. Las necesidades ___, como alimentación o salud, son indispensables para vivir con dignidad. El ___ social, desde el enfoque de derechos, debe estar garantizado para todas las personas.",
        huecos: [
          { posicion: 0, respuesta_correcta: "necesidad", pista: "Carencia de algo indispensable." },
          { posicion: 1, respuesta_correcta: "satisfactor", pista: "El medio que cubre la necesidad." },
          { posicion: 2, respuesta_correcta: "vitales", alternativas_aceptadas: ["básicas", "basicas"], pista: "Indispensables para vivir." },
          { posicion: 3, respuesta_correcta: "bienestar", pista: "Condiciones para vivir con dignidad." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Necesidades y bienestar social", descripcion: "Valora tu comprensión de las necesidades, los satisfactores y el bienestar.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Distingo una necesidad de un satisfactor.", escala: escala4 },
        { descripcion: "Identifico necesidades vitales y las formas de satisfacerlas en mi entorno familiar y comunitario.", escala: escala4 },
        { descripcion: "Explico el bienestar social desde el enfoque de derechos.", escala: escala4 },
      ], reflexion_final_prompt: "¿Qué necesidad vital de tu comunidad crees que está peor satisfecha y por qué?" } },
  ],

  // ════════ CS-II-P02 — Organización social, diversidad cultural y discriminación ════════
  "CS-II-P02": [
    { titulo: "Organización social y discriminación — Verdadero o falso", descripcion: "Distingue afirmaciones sobre organización social, diversidad cultural y formas de discriminación.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "La organización comunitaria, familiar y personal forma parte de las maneras en que la sociedad se estructura.", respuesta: true, retroalimentacion: "Correcto: son distintas formas de organización social." },
        { enunciado: "La diversidad cultural es una característica de las sociedades y enriquece la vida en común.", respuesta: true, retroalimentacion: "Correcto: distintas culturas, lenguas y formas de vida conviven en la sociedad." },
        { enunciado: "El racismo y la discriminación no afectan el acceso a derechos y oportunidades de las personas.", respuesta: false, retroalimentacion: "Sí afectan: producen exclusión y desigualdad en el acceso a derechos." },
        { enunciado: "La subordinación, la exclusión y la dominación son manifestaciones de la discriminación.", respuesta: true, retroalimentacion: "Correcto: son formas en que opera la discriminación en la sociedad." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: diversidad cultural y discriminación", descripcion: "Aprende los términos clave sobre organización social, diversidad y exclusión.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Organización comunitaria", definicion: "Forma en que las personas de una comunidad se agrupan y cooperan para resolver asuntos comunes.", ejemplo: "Una asamblea de vecinos o un tequio para una obra del barrio." },
        { termino: "Diversidad cultural", definicion: "Coexistencia de distintas culturas, lenguas, tradiciones y formas de vida en una sociedad.", ejemplo: "Los pueblos originarios con sus propias lenguas y costumbres en México." },
        { termino: "Discriminación", definicion: "Trato desigual e injusto hacia una persona o grupo por características como origen, color de piel, género o creencias.", ejemplo: "Negar un empleo por la apariencia o el origen de alguien." },
        { termino: "Racismo", definicion: "Forma de discriminación que considera superiores a unas personas sobre otras por su origen étnico o color de piel.", ejemplo: "Burlas o exclusión hacia personas por su tono de piel." },
        { termino: "Exclusión social", definicion: "Proceso por el cual a ciertas personas o grupos se les impide participar plenamente en la sociedad.", ejemplo: "Comunidades sin acceso a servicios o sin representación." },
      ], actividad_final: "Describe un caso de discriminación o exclusión que conozcas y propón una forma de resistirla." } },
    { titulo: "Completa: diversidad y discriminación", descripcion: "Completa el texto sobre diversidad cultural y manifestaciones de la discriminación.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "La ___ cultural es la coexistencia de distintas culturas en la sociedad. El trato injusto hacia una persona por su origen o características se llama ___. Cuando ese trato se basa en el color de piel u origen étnico, hablamos de ___. La subordinación, la dominación y la ___ son manifestaciones de la discriminación.",
        huecos: [
          { posicion: 0, respuesta_correcta: "diversidad", pista: "Coexistencia de muchas culturas." },
          { posicion: 1, respuesta_correcta: "discriminación", alternativas_aceptadas: ["discriminacion"], pista: "Trato desigual e injusto." },
          { posicion: 2, respuesta_correcta: "racismo", pista: "Discriminación por origen étnico o color de piel." },
          { posicion: 3, respuesta_correcta: "exclusión", alternativas_aceptadas: ["exclusion"], pista: "Impedir la participación plena." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Organización social y discriminación", descripcion: "Valora tu comprensión de la diversidad cultural y las formas de discriminación.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Reconozco las formas de organización comunitaria, familiar y personal.", escala: escala4 },
        { descripcion: "Valoro la diversidad cultural de mi entorno.", escala: escala4 },
        { descripcion: "Identifico manifestaciones de la discriminación (subordinación, exclusión, dominación, racismo).", escala: escala4 },
      ], reflexion_final_prompt: "¿Qué disidencias, luchas o resistencias frente a la discriminación conoces en tu comunidad?" } },
  ],

  // ════════ CS-II-P03 — Producción, distribución desigual y factores de producción ════════
  "CS-II-P03": [
    { titulo: "Producción y distribución desigual — Verdadero o falso", descripcion: "Distingue afirmaciones sobre factores de producción, distribución desigual y tipos de trabajo.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "Los factores de producción incluyen la tierra, el trabajo, el capital, la organización y el tiempo.", respuesta: true, retroalimentacion: "Correcto: combinados permiten producir bienes y servicios." },
        { enunciado: "Los intercambios entre regiones y países siempre son equitativos y benefician por igual a todos.", respuesta: false, retroalimentacion: "Muchos intercambios son desiguales y reproducen diferencias entre regiones y países." },
        { enunciado: "Existen diferencias económicas marcadas entre las zonas urbanas y las zonas rurales.", respuesta: true, retroalimentacion: "Correcto: hay desigualdades regionales urbano-rural." },
        { enunciado: "El trabajo no remunerado, como el trabajo del hogar y de cuidados, no aporta nada a la economía.", respuesta: false, retroalimentacion: "El trabajo no remunerado sostiene la vida y la economía aunque no se pague." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: producción, distribución y trabajo", descripcion: "Aprende los términos clave sobre factores de producción y economía.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Factores de producción", definicion: "Elementos que se combinan para producir bienes y servicios: tierra, trabajo, capital, organización y tiempo.", ejemplo: "Una panadería usa harina (tierra), panaderos (trabajo) y un horno (capital)." },
        { termino: "Distribución", definicion: "Forma en que se reparten la riqueza, los bienes y los ingresos producidos en una sociedad.", ejemplo: "Cómo se reparten las ganancias de una cosecha entre quienes participaron." },
        { termino: "Intercambio desigual", definicion: "Relación de comercio en la que una región o país obtiene más beneficio que otro.", ejemplo: "Exportar materias primas baratas e importar productos elaborados caros." },
        { termino: "Economía informal", definicion: "Actividades económicas que no están registradas ni reguladas oficialmente y suelen carecer de prestaciones.", ejemplo: "Ventas en la vía pública sin contrato ni seguridad social." },
        { termino: "Trabajo no remunerado", definicion: "Trabajo que sostiene la vida pero por el que no se recibe pago, como las tareas del hogar y de cuidados.", ejemplo: "Cocinar, limpiar o cuidar a familiares sin recibir un salario." },
      ], actividad_final: "Identifica en tu hogar dos trabajos remunerados y dos no remunerados, y di quién los realiza." } },
    { titulo: "Completa: factores de producción y trabajo", descripcion: "Completa el texto sobre producción, distribución y tipos de trabajo.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "Los factores de ___ son la tierra, el trabajo, el capital, la organización y el tiempo. Cuando una región se beneficia más que otra en el comercio, hay un intercambio ___. La economía ___ no está registrada ni regulada oficialmente. El trabajo del hogar y de cuidados suele ser un trabajo no ___.",
        huecos: [
          { posicion: 0, respuesta_correcta: "producción", alternativas_aceptadas: ["produccion"], pista: "Crear bienes y servicios." },
          { posicion: 1, respuesta_correcta: "desigual", pista: "Una parte gana más que la otra." },
          { posicion: 2, respuesta_correcta: "informal", pista: "Sin registro ni regulación oficial." },
          { posicion: 3, respuesta_correcta: "remunerado", alternativas_aceptadas: ["pagado"], pista: "Que recibe pago." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Producción y distribución", descripcion: "Valora tu comprensión de los factores de producción y la distribución desigual.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Identifico los factores de producción (tierra, trabajo, capital, organización, tiempo).", escala: escala4 },
        { descripcion: "Explico cómo la distribución y los intercambios desiguales generan diferencias regionales.", escala: escala4 },
        { descripcion: "Distingo entre economía formal e informal y entre trabajo remunerado y no remunerado.", escala: escala4 },
      ], reflexion_final_prompt: "¿Qué diferencias económicas observas entre tu localidad y otras zonas urbanas o rurales que conoces?" } },
  ],

  // ════════ CS-II-P04 — Relaciones de poder, interseccionalidad y sociedad-naturaleza ════════
  "CS-II-P04": [
    { titulo: "Relaciones de poder e interseccionalidad — Verdadero o falso", descripcion: "Distingue afirmaciones sobre poder, interseccionalidad y la relación sociedad-naturaleza.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "Las relaciones de poder atraviesan instituciones y prácticas sociales, donde las personas cumplen distintos roles.", respuesta: true, retroalimentacion: "Correcto: el poder se ejerce en familias, escuelas, trabajo y gobierno." },
        { enunciado: "La interseccionalidad analiza cómo se combinan desigualdades por clase, género, raza, origen étnico, orientación sexual y edad.", respuesta: true, retroalimentacion: "Correcto: varias formas de desigualdad pueden cruzarse en una misma persona." },
        { enunciado: "Los trabajos del hogar y de cuidados no tienen relación con los modos de producción ni con los modelos de desarrollo.", respuesta: false, retroalimentacion: "Sí se relacionan: sostienen la fuerza de trabajo y el funcionamiento de la economía." },
        { enunciado: "El modelo de desarrollo puede provocar degradación ambiental y afectar la relación entre sociedad y naturaleza.", respuesta: true, retroalimentacion: "Correcto: ciertos modos de producción degradan el ambiente." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: poder, interseccionalidad y ambiente", descripcion: "Aprende los términos clave sobre relaciones de poder y sociedad-naturaleza.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Relaciones de poder", definicion: "Vínculos en los que unas personas o grupos influyen, deciden o controlan sobre otros dentro de la sociedad.", ejemplo: "La autoridad de un gobierno o la jerarquía en un centro de trabajo." },
        { termino: "Hegemonía", definicion: "Dominio o liderazgo de un grupo que se sostiene mediante consensos, no solo por la fuerza.", ejemplo: "Ideas que se vuelven 'de sentido común' y benefician a un grupo." },
        { termino: "Interseccionalidad", definicion: "Enfoque que estudia cómo se cruzan distintas desigualdades (clase, género, raza, origen étnico, orientación sexual, edad) en una persona.", ejemplo: "Una mujer indígena de bajos ingresos enfrenta varias desigualdades a la vez." },
        { termino: "Modos de producción", definicion: "Maneras en que una sociedad organiza la producción de bienes y las relaciones de trabajo.", ejemplo: "Incluye también los trabajos del hogar y de cuidados que sostienen la economía." },
        { termino: "Degradación ambiental", definicion: "Deterioro de la naturaleza causado por la actividad humana y ciertos modelos de desarrollo.", ejemplo: "Contaminación de ríos o deforestación por la sobreexplotación." },
      ], actividad_final: "Explica con un ejemplo cómo dos desigualdades (por ejemplo, género y clase) se cruzan en una misma persona." } },
    { titulo: "Completa: poder, interseccionalidad y ambiente", descripcion: "Completa el texto sobre relaciones de poder y sociedad-naturaleza.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "Las relaciones de ___ atraviesan las instituciones y las prácticas sociales. La ___ analiza cómo se cruzan desigualdades de clase, género, raza, edad u orientación sexual. El dominio que se sostiene mediante consensos se llama ___. Ciertos modelos de desarrollo provocan ___ ambiental y dañan la relación entre sociedad y naturaleza.",
        huecos: [
          { posicion: 0, respuesta_correcta: "poder", pista: "Influir, decidir o controlar sobre otros." },
          { posicion: 1, respuesta_correcta: "interseccionalidad", pista: "Cruce de varias desigualdades." },
          { posicion: 2, respuesta_correcta: "hegemonía", alternativas_aceptadas: ["hegemonia"], pista: "Dominio sostenido por consensos." },
          { posicion: 3, respuesta_correcta: "degradación", alternativas_aceptadas: ["degradacion", "deterioro"], pista: "Deterioro de la naturaleza." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Relaciones de poder e interseccionalidad", descripcion: "Valora tu comprensión de las relaciones de poder, la interseccionalidad y el ambiente.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Reconozco las relaciones de poder en instituciones y prácticas sociales.", escala: escala4 },
        { descripcion: "Analizo desigualdades desde la interseccionalidad (clase, género, raza, edad, etc.).", escala: escala4 },
        { descripcion: "Relaciono los modos de producción y los modelos de desarrollo con la degradación ambiental.", escala: escala4 },
      ], reflexion_final_prompt: "¿Qué desafío demográfico o ambiental de tu entorno crees que requiere acción urgente y por qué?" } },
  ],
};

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
