/**
 * Refuerzo de actividades para CS-I (Ciencias Sociales I) según la "Plantilla CEN por UAC".
 * Agrega A4-A7 a cada una de las 4 progresiones (ya tienen A1=lectura, A2=debate, A3=reflexión):
 *   A4 = quiz_multiple_opcion · A5 = quiz_verdadero_falso · A6 = glosario_interactivo · A7 = autoevaluacion
 * 4 progresiones × 4 = 16 actividades nuevas. estado='borrador'.
 * Alineado a los propósitos formativos oficiales MCCEMS 2025 (Ciencias Sociales I):
 *   P01 Estado e instituciones · P02 ciudadanía · P03 normas sociales · P04 diversidad y democracia.
 * Uso: npx tsx scripts/seed-activities-csi-refuerzo.ts
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
  log("\n🌱 Refuerzo CS-I — Ciencias Sociales I: A4-A7 por progresión\n");

  const progs = await getProgresionesDeUAC(sb, "CS-I");
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

  log(`\n✅ CS-I refuerzo: ${ok} actividades insertadas, ${fail} fallidas.\n`);
}

// ── REFUERZOS POR PROGRESIÓN ───────────────────────────────────────────────────

const refuerzos: Refuerzo[][] = [
  // ════════════ P01 — El Estado, instituciones y ciudadanía ════════════
  [
    {
      titulo: "El Estado mexicano — Quiz",
      descripcion: "Quiz de opción múltiple sobre los elementos, poderes y funciones del Estado.",
      tipo: "quiz_multiple_opcion",
      xp: 15,
      contenido: {
        preguntas: [
          { enunciado: "¿Cuáles son los tres elementos clásicos del Estado?", opciones: ["Territorio, población y gobierno", "Bandera, himno y escudo", "Presidente, congreso y jueces", "Dinero, ejército y leyes"], respuesta_correcta: 0, retroalimentacion: "El Estado se define por territorio delimitado, población y un gobierno con monopolio legítimo de la fuerza." },
          { enunciado: "¿Cuáles son los tres poderes del Estado mexicano?", opciones: ["Federal, estatal y municipal", "Ejecutivo, Legislativo y Judicial", "Civil, militar y religioso", "Económico, político y social"], respuesta_correcta: 1, retroalimentacion: "Ejecutivo, Legislativo y Judicial: se controlan mutuamente." },
          { enunciado: "El Congreso de la Unión pertenece al poder:", opciones: ["Ejecutivo", "Judicial", "Legislativo", "Municipal"], respuesta_correcta: 2, retroalimentacion: "El Legislativo (Senado y Cámara de Diputados) hace las leyes." },
          { enunciado: "Cuando intereses particulares controlan al Estado para su beneficio se habla de:", opciones: ["división de poderes", "captura del Estado", "estado de derecho", "soberanía popular"], respuesta_correcta: 1, retroalimentacion: "La 'captura del Estado' ocurre cuando intereses particulares lo controlan." },
          { enunciado: "Que la relación Estado-ciudadanía sea 'bidireccional' significa que:", opciones: ["solo el Estado tiene obligaciones", "solo los ciudadanos tienen deberes", "ambos tienen derechos y obligaciones mutuas", "no hay relación entre ellos"], respuesta_correcta: 2, retroalimentacion: "El Estado tiene obligaciones hacia los ciudadanos y éstos derechos y deberes hacia el Estado." },
        ],
        intentos_maximos: 3,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "El Estado — ¿Verdadero o falso?",
      descripcion: "Distingue afirmaciones correctas e incorrectas sobre el Estado y sus instituciones.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "El Estado es solo un conjunto de edificios e instituciones.", respuesta: false, retroalimentacion: "Es también una relación social: una forma de organizar el poder y los recursos." },
          { enunciado: "Los tres poderes deben controlarse mutuamente (pesos y contrapesos).", respuesta: true, retroalimentacion: "Correcto: ese control mutuo limita el abuso de poder." },
          { enunciado: "Recaudar impuestos y proveer servicios públicos son funciones del Estado.", respuesta: true, retroalimentacion: "Sí: seguridad, justicia, servicios, impuestos y representación exterior." },
          { enunciado: "La impunidad y la corrupción son ejemplos de un Estado que funciona perfectamente.", respuesta: false, retroalimentacion: "Son ejemplos de fallas del Estado." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Estado e instituciones",
      descripcion: "Glosario interactivo de los conceptos clave sobre el Estado.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "Estado", definicion: "Organización política de una sociedad con territorio, población y gobierno.", ejemplo: "El Estado mexicano se rige por la Constitución de 1917.", etiquetas: ["concepto"] },
          { termino: "División de poderes", definicion: "Separación de funciones en Ejecutivo, Legislativo y Judicial para evitar abusos.", ejemplo: "La división de poderes limita el poder del presidente.", etiquetas: ["concepto"] },
          { termino: "Monopolio legítimo de la fuerza", definicion: "Solo el Estado puede usar la fuerza de forma legal (policía, ejército).", ejemplo: "Por eso un particular no puede ejercer justicia por mano propia.", etiquetas: ["concepto"] },
          { termino: "Institución", definicion: "Conjunto estable de normas y organizaciones que estructuran la vida social.", ejemplo: "La escuela y el IMSS son instituciones.", etiquetas: ["concepto"] },
          { termino: "Impunidad", definicion: "Falta de castigo a quien comete un delito.", ejemplo: "En México la impunidad supera el 90%.", etiquetas: ["problema"] },
          { termino: "Captura del Estado", definicion: "Cuando intereses privados controlan al Estado en su beneficio.", ejemplo: "La captura del Estado debilita la democracia.", etiquetas: ["problema"] },
        ],
        actividad_final: "Explica con tus palabras la diferencia entre 'Estado' e 'institución' usando un ejemplo de tu comunidad.",
      },
    },
    {
      titulo: "Autoevaluación — El Estado",
      descripcion: "Autoevaluación de tu comprensión del Estado, sus poderes y funciones.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio. No es calificación: es para saber qué reforzar.",
        criterios: [
          { descripcion: "Explico qué es el Estado y sus tres elementos.", escala: escala4 },
          { descripcion: "Distingo los tres poderes y sus funciones.", escala: escala4 },
          { descripcion: "Identifico funciones y fallas del Estado en mi entorno.", escala: escala4 },
          { descripcion: "Comprendo la relación bidireccional Estado-ciudadanía.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Qué función del Estado consideras más urgente que mejore en tu comunidad y por qué?",
      },
    },
  ],

  // ════════════ P02 — Ciudadanía ════════════
  [
    {
      titulo: "Ciudadanía — Quiz",
      descripcion: "Quiz de opción múltiple sobre ciudadanía formal, sustantiva y su historia.",
      tipo: "quiz_multiple_opcion",
      xp: 15,
      contenido: {
        preguntas: [
          { enunciado: "¿A qué edad se adquiere la ciudadanía formal en México?", opciones: ["A los 15 años", "A los 16 años", "A los 18 años", "A los 21 años"], respuesta_correcta: 2, retroalimentacion: "A los 18 años, con la credencial del INE." },
          { enunciado: "La ciudadanía 'sustantiva' o real se refiere a:", opciones: ["tener la credencial de elector", "la capacidad real de ejercer los derechos", "haber nacido en el país", "pagar impuestos"], respuesta_correcta: 1, retroalimentacion: "Es la capacidad efectiva de ejercer derechos, más allá del estatus jurídico." },
          { enunciado: "¿En qué año obtuvieron las mujeres mexicanas el derecho al voto?", opciones: ["1917", "1929", "1953", "1968"], respuesta_correcta: 2, retroalimentacion: "En 1953 se reconoció el sufragio femenino a nivel federal." },
          { enunciado: "Que la ciudadanía sea una 'conquista' significa que:", opciones: ["es un dato natural", "se ha ampliado gracias a luchas y movimientos sociales", "se compra con dinero", "la otorga un solo gobernante"], respuesta_correcta: 1, retroalimentacion: "Históricamente fue negada a muchos grupos y se amplió por la lucha social." },
          { enunciado: "¿Cuál es un ejemplo de ciudadanía ampliada hoy?", opciones: ["ciudadanía digital", "ciudadanía hereditaria", "ciudadanía militar", "ciudadanía vitalicia"], respuesta_correcta: 0, retroalimentacion: "Ciudadanía digital, ambiental y global son expansiones contemporáneas del concepto." },
        ],
        intentos_maximos: 3,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Ciudadanía — ¿Verdadero o falso?",
      descripcion: "Distingue afirmaciones correctas e incorrectas sobre la ciudadanía.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "Tener todos los papeles en regla garantiza poder ejercer todos los derechos.", respuesta: false, retroalimentacion: "La ciudadanía formal no asegura la sustantiva: hay barreras económicas, culturales y de acceso." },
          { enunciado: "La ciudadanía ha sido históricamente un derecho que se ha ido ampliando.", respuesta: true, retroalimentacion: "Correcto: antes se excluía a mujeres, grupos étnicos y trabajadores sin propiedad." },
          { enunciado: "La ciudadanía ambiental implica responsabilidades hacia el planeta.", respuesta: true, retroalimentacion: "Sí, es una de las dimensiones contemporáneas de la ciudadanía." },
          { enunciado: "Antes de poder votar, una persona joven no puede ejercer ninguna acción ciudadana.", respuesta: false, retroalimentacion: "Puede organizarse, participar en su comunidad, peticionar y exigir derechos." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Ciudadanía",
      descripcion: "Glosario interactivo de los conceptos clave sobre ciudadanía.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "Ciudadanía formal", definicion: "Estatus jurídico reconocido por el Estado (votar, identidad, servicios).", ejemplo: "Obtener la credencial del INE a los 18 años.", etiquetas: ["concepto"] },
          { termino: "Ciudadanía sustantiva", definicion: "Capacidad real de ejercer los derechos que se tienen formalmente.", ejemplo: "Poder acceder de verdad a la justicia o a la salud.", etiquetas: ["concepto"] },
          { termino: "Sufragio", definicion: "Derecho a votar y ser votado.", ejemplo: "El sufragio femenino en México data de 1953.", etiquetas: ["derecho"] },
          { termino: "Derecho de petición", definicion: "Derecho a dirigir solicitudes a la autoridad y recibir respuesta.", ejemplo: "Pedir por escrito información a un ayuntamiento.", etiquetas: ["derecho"] },
          { termino: "Ciudadanía digital", definicion: "Derechos y responsabilidades en el entorno virtual.", ejemplo: "Usar redes con respeto y proteger datos personales.", etiquetas: ["concepto"] },
          { termino: "Participación", definicion: "Acción de involucrarse en los asuntos públicos.", ejemplo: "Sumarse a una asamblea o colectivo comunitario.", etiquetas: ["acción"] },
        ],
        actividad_final: "Da un ejemplo concreto de cómo podrías ejercer la ciudadanía aunque aún no votes.",
      },
    },
    {
      titulo: "Autoevaluación — Ciudadanía",
      descripcion: "Autoevaluación de tu comprensión y ejercicio de la ciudadanía.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Distingo ciudadanía formal de ciudadanía sustantiva.", escala: escala4 },
          { descripcion: "Conozco la historia de ampliación de derechos ciudadanos.", escala: escala4 },
          { descripcion: "Identifico acciones ciudadanas que puedo realizar ya.", escala: escala4 },
          { descripcion: "Reconozco las dimensiones nuevas de la ciudadanía (digital, ambiental, global).", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Qué acción ciudadana concreta te comprometes a realizar este semestre?",
      },
    },
  ],

  // ════════════ P03 — Normas sociales e instituciones ════════════
  [
    {
      titulo: "Normas sociales — Quiz",
      descripcion: "Quiz de opción múltiple sobre normas formales/informales y cambio social.",
      tipo: "quiz_multiple_opcion",
      xp: 15,
      contenido: {
        preguntas: [
          { enunciado: "¿Cuál es un ejemplo de norma FORMAL?", opciones: ["Saludar al entrar a un lugar", "Una ley del Congreso", "Una costumbre familiar", "Una moda de vestir"], respuesta_correcta: 1, retroalimentacion: "Las normas formales están escritas (leyes, reglamentos, constituciones)." },
          { enunciado: "Que las normas sean 'construcciones históricas' significa que:", opciones: ["son naturales y eternas", "responden a necesidades y poder de cada época", "nunca cambian", "las dicta la naturaleza"], respuesta_correcta: 1, retroalimentacion: "No son naturales: cambian según el contexto histórico." },
          { enunciado: "¿Cuál de estos fue alguna vez legal o socialmente aceptado?", opciones: ["La esclavitud", "El voto universal", "La educación gratuita", "Los derechos humanos"], respuesta_correcta: 0, retroalimentacion: "La esclavitud fue legal durante siglos; muestra que lo 'normal' cambia." },
          { enunciado: "Las instituciones (familia, escuela, mercado) son:", opciones: ["totalmente neutras", "reflejo de valores y relaciones de poder", "imposibles de cambiar", "iguales en todas las épocas"], respuesta_correcta: 1, retroalimentacion: "Reflejan los valores y el poder de la sociedad que las construyó." },
          { enunciado: "El cambio social suele ocurrir cuando:", opciones: ["nadie cuestiona las normas", "los movimientos sociales cuestionan normas e instituciones", "el Estado prohíbe protestar", "las costumbres se vuelven leyes naturales"], respuesta_correcta: 1, retroalimentacion: "Movimientos como el feminista o por derechos civiles transformaron normas." },
        ],
        intentos_maximos: 3,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Normas sociales — ¿Verdadero o falso?",
      descripcion: "Distingue afirmaciones correctas e incorrectas sobre normas e instituciones.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "Las normas informales no están escritas (costumbres, tradiciones).", respuesta: true, retroalimentacion: "Correcto: son expectativas culturales no escritas." },
          { enunciado: "Que una norma sea histórica significa que debemos rechazarla siempre.", respuesta: false, retroalimentacion: "No: significa comprenderla y cuestionarla cuando produce injusticia." },
          { enunciado: "Las instituciones son neutras y no reflejan relaciones de poder.", respuesta: false, retroalimentacion: "Sí reflejan los valores y el poder de quien las construyó." },
          { enunciado: "Los movimientos sociales pueden transformar normas e instituciones.", respuesta: true, retroalimentacion: "Correcto: feminista, derechos civiles, indígenas, LGBTQ+." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Normas e instituciones",
      descripcion: "Glosario interactivo de los conceptos clave sobre normas y cambio social.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "Norma formal", definicion: "Regla escrita y obligatoria (ley, reglamento).", ejemplo: "El reglamento escolar.", etiquetas: ["concepto"] },
          { termino: "Norma informal", definicion: "Regla no escrita basada en costumbre o expectativa cultural.", ejemplo: "Saludar al llegar a casa.", etiquetas: ["concepto"] },
          { termino: "Construcción histórica", definicion: "Algo que no es natural sino producto de una época y contexto.", ejemplo: "Los roles de género son una construcción histórica.", etiquetas: ["concepto"] },
          { termino: "Institución", definicion: "Conjunto estable de normas y prácticas que estructuran la vida social.", ejemplo: "La familia, la escuela, el sistema judicial.", etiquetas: ["concepto"] },
          { termino: "Cambio social", definicion: "Transformación de normas e instituciones a lo largo del tiempo.", ejemplo: "El reconocimiento del voto femenino.", etiquetas: ["proceso"] },
          { termino: "Desobediencia civil", definicion: "Incumplimiento pacífico y consciente de una ley injusta.", ejemplo: "Las marchas por los derechos civiles.", etiquetas: ["acción"] },
        ],
        actividad_final: "Identifica una norma de tu entorno y clasifícala como formal o informal, explicando su origen.",
      },
    },
    {
      titulo: "Autoevaluación — Normas sociales",
      descripcion: "Autoevaluación de tu comprensión de las normas e instituciones sociales.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Distingo normas formales de informales.", escala: escala4 },
          { descripcion: "Comprendo que las normas son construcciones históricas.", escala: escala4 },
          { descripcion: "Analizo a quién benefician y perjudican las normas.", escala: escala4 },
          { descripcion: "Reconozco cómo los movimientos sociales cambian normas.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Qué norma de tu entorno cambiarías y por qué medios (individuales o colectivos)?",
      },
    },
  ],

  // ════════════ P04 — Diversidad y democracia ════════════
  [
    {
      titulo: "Diversidad y democracia — Quiz",
      descripcion: "Quiz de opción múltiple sobre diversidad, democracia sustantiva y derechos.",
      tipo: "quiz_multiple_opcion",
      xp: 15,
      contenido: {
        preguntas: [
          { enunciado: "¿Cuántas lenguas indígenas reconoce México (según el material)?", opciones: ["Más de 20", "Más de 40", "Más de 68", "Más de 100"], respuesta_correcta: 2, retroalimentacion: "Más de 68 lenguas indígenas reconocidas." },
          { enunciado: "La democracia 'sustantiva' (no solo procedimental) requiere:", opciones: ["solo elecciones periódicas", "que todos puedan participar en igualdad real", "un solo partido fuerte", "eliminar las diferencias culturales"], respuesta_correcta: 1, retroalimentacion: "Va más allá del voto: elimina barreras para una participación real." },
          { enunciado: "¿Cuál NO es una forma de diversidad mencionada en el material?", opciones: ["étnica y cultural", "de género y orientación sexual", "de capacidad y de clase", "de marca de teléfono"], respuesta_correcta: 3, retroalimentacion: "La diversidad relevante es étnica, cultural, de género, capacidad y clase." },
          { enunciado: "Reconocer la diversidad como valor democrático significa que:", opciones: ["'todo vale' sin límites", "la pluralidad enriquece la deliberación y los derechos se protegen", "una cultura debe dominar a las demás", "no existen los conflictos"], respuesta_correcta: 1, retroalimentacion: "No es relativismo: es proteger derechos y enriquecer la deliberación." },
          { enunciado: "El racismo estructural en México es:", opciones: ["un problema inexistente", "una realidad que coexiste con la diversidad", "exclusivo de otros países", "lo mismo que la diversidad"], respuesta_correcta: 1, retroalimentacion: "La diversidad coexiste con racismo, discriminación de género y homofobia." },
        ],
        intentos_maximos: 3,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Diversidad y democracia — ¿Verdadero o falso?",
      descripcion: "Distingue afirmaciones correctas e incorrectas sobre diversidad y democracia.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "La diversidad es una condición fundamental de la vida social.", respuesta: true, retroalimentacion: "Correcto: no es un problema a eliminar, sino una riqueza en democracia." },
          { enunciado: "Reconocer la diversidad significa que 'todo vale' (relativismo total).", respuesta: false, retroalimentacion: "No: significa proteger derechos de todos y enriquecer la deliberación." },
          { enunciado: "La discriminación y la diversidad son exactamente lo mismo.", respuesta: false, retroalimentacion: "La diversidad es una condición; la discriminación es un trato injusto a la diferencia." },
          { enunciado: "Una democracia sustantiva busca eliminar barreras para la participación real.", respuesta: true, retroalimentacion: "Correcto: va más allá de garantizar solo el voto." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Diversidad y democracia",
      descripcion: "Glosario interactivo de los conceptos clave sobre diversidad y democracia.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "Diversidad", definicion: "Pluralidad de identidades: étnica, cultural, de género, capacidad y clase.", ejemplo: "México es pluriétnico y multicultural.", etiquetas: ["concepto"] },
          { termino: "Democracia procedimental", definicion: "La que garantiza procesos como las elecciones y el voto.", ejemplo: "Votar cada cierto número de años.", etiquetas: ["concepto"] },
          { termino: "Democracia sustantiva", definicion: "La que asegura participación real e igualdad de condiciones.", ejemplo: "Eliminar barreras económicas y culturales para participar.", etiquetas: ["concepto"] },
          { termino: "Discriminación", definicion: "Trato injusto a una persona o grupo por su diferencia.", ejemplo: "Negar un empleo por origen étnico.", etiquetas: ["problema"] },
          { termino: "Racismo estructural", definicion: "Discriminación racial inscrita en instituciones y prácticas sociales.", ejemplo: "Brechas de acceso por color de piel u origen.", etiquetas: ["problema"] },
          { termino: "Inclusión", definicion: "Garantizar que todos los grupos participen en igualdad.", ejemplo: "Rampas, intérpretes y materiales en lenguas indígenas.", etiquetas: ["acción"] },
        ],
        actividad_final: "Da un ejemplo de tu entorno donde la diversidad se celebre y otro donde se discrimine.",
      },
    },
    {
      titulo: "Autoevaluación — Diversidad y democracia",
      descripcion: "Autoevaluación de tu comprensión de la diversidad como valor democrático.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Reconozco las distintas formas de diversidad en mi entorno.", escala: escala4 },
          { descripcion: "Distingo democracia procedimental de sustantiva.", escala: escala4 },
          { descripcion: "Diferencio diversidad de discriminación.", escala: escala4 },
          { descripcion: "Propongo acciones para una convivencia más inclusiva.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Qué harías para que tu escuela sea un espacio más inclusivo con la diversidad?",
      },
    },
  ],
];

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
