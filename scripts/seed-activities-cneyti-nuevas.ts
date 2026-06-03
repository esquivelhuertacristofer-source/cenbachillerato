/**
 * Plantilla CEN completa (A1-A7) para las 3 progresiones NUEVAS de CNEYT-I,
 * agregadas en la realineación al programa oficial MCCEMS 2025:
 *   CNEYT-I-P09 — Interrelación física/química/biología y su vínculo con la tecnología (Propósito 2)
 *   CNEYT-I-P10 — Iones, moléculas, isótopos y enlaces químicos (Propósito 6)
 *   CNEYT-I-P11 — Naturaleza energética y corpuscular de la materia + actividad eléctrica (Propósito 8)
 * A1=lectura · A2=quiz_multiple_opcion · A3=reflexion_escrita · A4=quiz_verdadero_falso
 * A5=glosario_interactivo · A6=fill_blanks · A7=autoevaluacion. Todas estado='borrador'.
 * Uso: npx tsx scripts/seed-activities-cneyti-nuevas.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad, type ActividadInput } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

type Act = Pick<ActividadInput, "titulo" | "descripcion" | "tipo" | "xp" | "contenido">;
const letras = ["A1", "A2", "A3", "A4", "A5", "A6", "A7"];

const escala4 = [
  { valor: 1, etiqueta: "En inicio", descripcion: "Todavía necesito apoyo y consultar el material." },
  { valor: 2, etiqueta: "En proceso", descripcion: "Lo logro con algunos errores o dudas." },
  { valor: 3, etiqueta: "Logrado", descripcion: "Lo hago bien de forma autónoma." },
  { valor: 4, etiqueta: "Destacado", descripcion: "Lo hago con seguridad y puedo argumentarlo." },
];

async function main() {
  const sb = createSB();
  log("\n🌱 CNEYT-I — A1-A7 para las 3 progresiones nuevas (P09/P10/P11)\n");

  const progs = await getProgresionesDeUAC(sb, "CNEYT-I");
  let ok = 0; let fail = 0;

  for (const codigo of Object.keys(actividades)) {
    const p = progs.find((x) => x.codigo === codigo);
    if (!p) { log(`  ⚠ No se encontró la progresión ${codigo}, se omite.`); continue; }
    const set = actividades[codigo];
    for (let i = 0; i < set.length; i++) {
      const a = set[i];
      const res = await upsertActividad(sb, {
        codigo: `${p.codigo}-${letras[i]}`,
        titulo: a.titulo, descripcion: a.descripcion, tipo: a.tipo,
        progresion_id: p.id, xp: a.xp, contenido: a.contenido,
      });
      res ? ok++ : fail++;
    }
  }
  log(`\n✅ CNEYT-I nuevas: ${ok} insertadas, ${fail} fallidas.\n`);
}

const actividades: Record<string, Act[]> = {
  // ════════════════════ P09 — Interrelación de las ciencias y la tecnología ════════════════════
  "CNEYT-I-P09": [
    {
      titulo: "Las ciencias no trabajan solas", descripcion: "Cómo la física, la química y la biología se relacionan entre sí y con la tecnología.",
      tipo: "lectura", xp: 10,
      contenido: {
        texto: "Aunque en la escuela estudiamos la física, la química y la biología por separado, en la naturaleza los fenómenos no vienen divididos en materias: están entrelazados.\n\nLa FÍSICA estudia la materia, la energía y sus movimientos (fuerzas, luz, calor, electricidad). La QUÍMICA estudia de qué está hecha la materia y cómo se transforma (átomos, enlaces, reacciones). La BIOLOGÍA estudia los seres vivos. Pero un mismo fenómeno suele necesitar las tres.\n\nPiensa en la FOTOSÍNTESIS: una planta capta la energía de la luz (física), con ella transforma agua y dióxido de carbono en glucosa y oxígeno (química) dentro de células vivas (biología). O piensa en cómo late tu corazón: hay impulsos eléctricos (física), reacciones químicas en las células (química) y un órgano vivo que late (biología).\n\nA esta forma de mirar los problemas usando varias ciencias a la vez se le llama enfoque INTERDISCIPLINARIO. Y de la unión entre el conocimiento científico y la solución de necesidades humanas nace la TECNOLOGÍA: paneles solares, vacunas, potabilizadoras de agua, celulares. La ciencia BÁSICA busca entender el mundo; la ciencia APLICADA y la tecnología usan ese conocimiento para resolver problemas concretos.\n\nMirar la naturaleza de forma interdisciplinaria te permite entender problemas reales —como el cambio climático o una enfermedad— que ninguna ciencia podría explicar sola.",
        fuente: "CEN Bachillerato — Ciencias Naturales, Experimentales y Tecnología I",
        nivel_lectura: "intermedio",
        preguntas_comprension: [
          { pregunta: "¿Por qué se dice que en la naturaleza los fenómenos no están divididos por materias?", respuesta_guia: "Porque un mismo fenómeno (como la fotosíntesis) involucra física, química y biología al mismo tiempo." },
          { pregunta: "¿Qué diferencia hay entre ciencia básica y tecnología?", respuesta_guia: "La ciencia básica busca entender el mundo; la tecnología aplica ese conocimiento para resolver necesidades humanas." },
        ],
        tiempo_estimado_minutos: 8,
      },
    },
    {
      titulo: "Interrelación de las ciencias — Quiz", descripcion: "Comprueba qué entendiste sobre la interrelación de las ciencias y la tecnología.",
      tipo: "quiz_multiple_opcion", xp: 15,
      contenido: { preguntas: [
        { enunciado: "En la fotosíntesis, ¿qué ciencia explica la captación de la energía de la luz?", opciones: ["La física", "Solo la biología", "Ninguna ciencia", "Solo la economía"], respuesta_correcta: 0, retroalimentacion: "La energía y la luz son objeto de estudio de la física." },
        { enunciado: "Un enfoque que usa varias ciencias a la vez para entender un fenómeno se llama:", opciones: ["Unidisciplinario", "Interdisciplinario", "Anticientífico", "Aislado"], respuesta_correcta: 1, retroalimentacion: "Interdisciplinario: combina aportes de distintas ciencias." },
        { enunciado: "¿Cuál es un ejemplo de tecnología que aplica conocimiento científico?", opciones: ["Una nube de lluvia", "Un panel solar", "Una montaña", "Un eclipse"], respuesta_correcta: 1, retroalimentacion: "El panel solar aplica física y química para generar electricidad." },
        { enunciado: "La ciencia básica se diferencia de la aplicada porque:", opciones: ["Busca entender el mundo, sin un uso inmediato", "Nunca sirve para nada", "Solo la hacen empresas", "Es lo mismo que la tecnología"], respuesta_correcta: 0, retroalimentacion: "La ciencia básica busca comprender; la aplicada y la tecnología resuelven problemas." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 },
    },
    {
      titulo: "Un fenómeno, varias ciencias", descripcion: "Analiza un fenómeno cotidiano desde la física, la química y la biología.",
      tipo: "reflexion_escrita", xp: 20,
      contenido: {
        prompt: "Elige un fenómeno cotidiano (por ejemplo: cocinar un huevo, hacer ejercicio, encender una fogata, que se oxide una reja, o digerir los alimentos). Explica en un texto de al menos 100 palabras cómo intervienen en él la física, la química y la biología (las que apliquen), y menciona alguna tecnología relacionada con ese fenómeno.",
        pistas: ["Pregúntate: ¿hay energía o movimiento? (física) ¿se forman sustancias nuevas? (química) ¿interviene un ser vivo? (biología)", "No necesitas que estén las tres ciencias a la fuerza, pero explica las que sí aparecen.", "Cierra con una tecnología relacionada (un aparato, un proceso, un invento)."],
        longitud_minima_palabras: 100, longitud_maxima_palabras: 350,
        criterios_evaluacion: ["Identifica un fenómeno concreto.", "Explica el papel de al menos dos ciencias.", "Relaciona el fenómeno con una tecnología.", "Redacción clara y coherente."],
        formato_esperado: "libre",
      },
    },
    {
      titulo: "Ciencia y tecnología — Verdadero o falso", descripcion: "Distingue afirmaciones sobre la interrelación de las ciencias.",
      tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "La física, la química y la biología pueden estudiar partes distintas de un mismo fenómeno.", respuesta: true, retroalimentacion: "Correcto: por eso el enfoque interdisciplinario es tan útil." },
        { enunciado: "La tecnología surge sin ninguna relación con el conocimiento científico.", respuesta: false, retroalimentacion: "La tecnología aplica conocimiento científico para resolver problemas." },
        { enunciado: "La fotosíntesis es un buen ejemplo de fenómeno interdisciplinario.", respuesta: true, retroalimentacion: "Correcto: involucra física, química y biología." },
        { enunciado: "La ciencia básica y la ciencia aplicada son exactamente lo mismo.", respuesta: false, retroalimentacion: "La básica busca entender; la aplicada resuelve problemas concretos." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 },
    },
    {
      titulo: "Glosario — Ciencias y tecnología", descripcion: "Conceptos clave sobre la interrelación de las ciencias.",
      tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Física", definicion: "Ciencia que estudia la materia, la energía y sus interacciones.", ejemplo: "El movimiento, la luz, el calor, la electricidad.", etiquetas: ["ciencia"] },
        { termino: "Química", definicion: "Ciencia que estudia la composición de la materia y sus transformaciones.", ejemplo: "Las reacciones y los enlaces entre átomos.", etiquetas: ["ciencia"] },
        { termino: "Biología", definicion: "Ciencia que estudia a los seres vivos.", ejemplo: "Las células, los organismos y los ecosistemas.", etiquetas: ["ciencia"] },
        { termino: "Interdisciplina", definicion: "Trabajo conjunto de varias ciencias para entender un fenómeno.", ejemplo: "Estudiar el cambio climático con física, química y biología.", etiquetas: ["concepto"] },
        { termino: "Tecnología", definicion: "Aplicación del conocimiento científico para resolver necesidades humanas.", ejemplo: "Vacunas, paneles solares, potabilizadoras.", etiquetas: ["concepto"] },
        { termino: "Ciencia básica y aplicada", definicion: "La básica busca comprender; la aplicada resuelve problemas concretos.", ejemplo: "Entender la electricidad (básica) vs. diseñar una batería (aplicada).", etiquetas: ["concepto"] },
      ], actividad_final: "Da un ejemplo propio de un problema que necesite más de una ciencia para resolverse." },
    },
    {
      titulo: "Completa: ciencias entrelazadas", descripcion: "Completa el texto sobre la interrelación de las ciencias y la tecnología.",
      tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "En la naturaleza los fenómenos no están separados por materias. La ___ estudia la energía y el movimiento, la ___ estudia las transformaciones de la materia y la biología estudia a los seres vivos. Cuando varias ciencias se combinan para entender un fenómeno se usa un enfoque ___. La aplicación de este conocimiento para resolver necesidades humanas se llama ___.",
        huecos: [
          { posicion: 0, respuesta_correcta: "física", alternativas_aceptadas: ["fisica"], pista: "Estudia energía y movimiento." },
          { posicion: 1, respuesta_correcta: "química", alternativas_aceptadas: ["quimica"], pista: "Estudia las transformaciones de la materia." },
          { posicion: 2, respuesta_correcta: "interdisciplinario", alternativas_aceptadas: ["interdisciplinar"], pista: "Combina varias ciencias." },
          { posicion: 3, respuesta_correcta: "tecnología", alternativas_aceptadas: ["tecnologia"], pista: "Aplica el conocimiento para resolver problemas." },
        ], distingue_mayusculas: false },
    },
    {
      titulo: "Autoevaluación — Interrelación de las ciencias", descripcion: "Valora tu comprensión de la interrelación de las ciencias y la tecnología.",
      tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Distingo el objeto de estudio de la física, la química y la biología.", escala: escala4 },
          { descripcion: "Explico un fenómeno usando más de una ciencia (enfoque interdisciplinario).", escala: escala4 },
          { descripcion: "Relaciono el conocimiento científico con la tecnología.", escala: escala4 },
        ], reflexion_final_prompt: "¿Qué problema de tu comunidad te gustaría resolver combinando varias ciencias?" },
    },
  ],

  // ════════════════════ P10 — Iones, moléculas, isótopos y enlaces químicos ════════════════════
  "CNEYT-I-P10": [
    {
      titulo: "Por qué los átomos se unen", descripcion: "Iones, moléculas, electrones de valencia y los tipos de enlace químico.",
      tipo: "lectura", xp: 10,
      contenido: {
        texto: "Casi nada en la naturaleza está hecho de átomos sueltos: los átomos se unen entre sí formando todo lo que existe. ¿Por qué se unen? Por sus ELECTRONES DE VALENCIA, los electrones de la última capa, que son los que participan en los enlaces.\n\nMuchos átomos son más estables cuando completan ocho electrones en su última capa (la 'regla del octeto', como los gases nobles). Para lograrlo, pueden ganar, perder o compartir electrones.\n\nCuando un átomo gana o pierde electrones queda cargado: se convierte en un ION. Si pierde electrones queda positivo (CATIÓN); si los gana queda negativo (ANIÓN). Recuerda también que los ISÓTOPOS son átomos del mismo elemento con distinto número de neutrones; no cambian la carga, cambian la masa.\n\nLos TIPOS DE ENLACE dependen de cómo los átomos resuelven sus electrones:\n• ENLACE IÓNICO: un átomo cede electrones a otro; se forman iones de carga opuesta que se atraen. Típico entre un metal y un no metal. Ejemplo: la sal, NaCl.\n• ENLACE COVALENTE: dos no metales COMPARTEN electrones. Forman MOLÉCULAS. Ejemplo: el agua, H₂O.\n• ENLACE METÁLICO: los átomos de un metal comparten un 'mar' de electrones libres, lo que explica por qué los metales conducen la electricidad.\n\nUna pista útil es la ELECTRONEGATIVIDAD: la tendencia de un átomo a atraer electrones. Si la diferencia entre dos átomos es muy grande, el enlace tiende a ser iónico; si es pequeña, covalente.",
        fuente: "CEN Bachillerato — Ciencias Naturales, Experimentales y Tecnología I",
        nivel_lectura: "intermedio",
        preguntas_comprension: [
          { pregunta: "¿Qué son los electrones de valencia y por qué importan?", respuesta_guia: "Son los electrones de la última capa; son los que participan en los enlaces químicos." },
          { pregunta: "¿En qué se diferencia un enlace iónico de uno covalente?", respuesta_guia: "En el iónico un átomo cede electrones a otro (se forman iones); en el covalente los átomos comparten electrones (se forman moléculas)." },
        ],
        tiempo_estimado_minutos: 9,
      },
    },
    {
      titulo: "Enlaces químicos — Quiz", descripcion: "Comprueba qué entendiste sobre iones, moléculas y enlaces.",
      tipo: "quiz_multiple_opcion", xp: 15,
      contenido: { preguntas: [
        { enunciado: "Un átomo que PIERDE electrones se convierte en:", opciones: ["Un anión (carga negativa)", "Un catión (carga positiva)", "Un isótopo", "Un neutrón"], respuesta_correcta: 1, retroalimentacion: "Al perder electrones (negativos) queda con carga positiva: catión." },
        { enunciado: "El enlace en el que dos no metales COMPARTEN electrones se llama:", opciones: ["Iónico", "Covalente", "Metálico", "Nuclear"], respuesta_correcta: 1, retroalimentacion: "Compartir electrones entre no metales = enlace covalente; forma moléculas." },
        { enunciado: "La sal de mesa (NaCl) es un ejemplo de enlace:", opciones: ["Covalente", "Metálico", "Iónico", "Sin enlace"], respuesta_correcta: 2, retroalimentacion: "El sodio (metal) cede un electrón al cloro (no metal): enlace iónico." },
        { enunciado: "Los isótopos de un elemento se diferencian en su número de:", opciones: ["Protones", "Electrones de valencia", "Neutrones", "Enlaces"], respuesta_correcta: 2, retroalimentacion: "Mismo elemento (mismos protones), distinto número de neutrones." },
        { enunciado: "La electronegatividad es la tendencia de un átomo a:", opciones: ["Atraer electrones", "Perder neutrones", "Emitir luz", "Ganar protones"], respuesta_correcta: 0, retroalimentacion: "Mide cuánto atrae un átomo los electrones del enlace." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 },
    },
    {
      titulo: "Enlaces en la vida diaria", descripcion: "Relaciona los tipos de enlace con materiales que usas todos los días.",
      tipo: "reflexion_escrita", xp: 20,
      contenido: {
        prompt: "En un texto de al menos 100 palabras, explica con tus palabras por qué los átomos se unen y describe los tres tipos de enlace (iónico, covalente y metálico). Para cada uno, da un ejemplo de un material que uses en tu vida diaria (por ejemplo: la sal, el agua, un cable o una cuchara de metal) y explica qué propiedad de ese material se relaciona con su tipo de enlace.",
        pistas: ["Empieza por los electrones de valencia y la idea de estabilidad (regla del octeto).", "Iónico = ceder/ganar electrones; covalente = compartir; metálico = mar de electrones.", "Conecta una propiedad observable (conduce electricidad, se disuelve en agua, es maleable) con el tipo de enlace."],
        longitud_minima_palabras: 100, longitud_maxima_palabras: 350,
        criterios_evaluacion: ["Explica por qué los átomos forman enlaces.", "Describe correctamente los tres tipos de enlace.", "Da un ejemplo cotidiano para cada tipo.", "Relaciona al menos una propiedad observable con su enlace."],
        formato_esperado: "libre",
      },
    },
    {
      titulo: "Iones y enlaces — Verdadero o falso", descripcion: "Distingue afirmaciones sobre iones, moléculas y enlaces químicos.",
      tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "Un catión tiene carga positiva porque perdió electrones.", respuesta: true, retroalimentacion: "Correcto: menos electrones (negativos) = carga neta positiva." },
        { enunciado: "En un enlace covalente los átomos comparten electrones y forman moléculas.", respuesta: true, retroalimentacion: "Correcto: como en el agua (H₂O)." },
        { enunciado: "Los isótopos de un elemento tienen distinto número de protones.", respuesta: false, retroalimentacion: "Tienen los mismos protones; cambian los neutrones (y por tanto la masa)." },
        { enunciado: "El enlace metálico explica por qué los metales conducen la electricidad.", respuesta: true, retroalimentacion: "Correcto: gracias a su 'mar' de electrones libres." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 },
    },
    {
      titulo: "Glosario — Iones, moléculas y enlaces", descripcion: "Conceptos clave de los enlaces químicos.",
      tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Electrón de valencia", definicion: "Electrón de la última capa; participa en los enlaces.", ejemplo: "El sodio tiene 1 electrón de valencia.", etiquetas: ["concepto"] },
        { termino: "Ion", definicion: "Átomo con carga por ganar o perder electrones.", ejemplo: "Na⁺ y Cl⁻ en la sal.", etiquetas: ["concepto"] },
        { termino: "Catión / Anión", definicion: "Ion positivo (pierde e⁻) / ion negativo (gana e⁻).", ejemplo: "Na⁺ es catión; Cl⁻ es anión.", etiquetas: ["concepto"] },
        { termino: "Molécula", definicion: "Grupo de átomos unidos por enlaces covalentes.", ejemplo: "H₂O, O₂, CO₂.", etiquetas: ["concepto"] },
        { termino: "Isótopo", definicion: "Átomos del mismo elemento con distinto número de neutrones.", ejemplo: "Carbono-12 y carbono-14.", etiquetas: ["concepto"] },
        { termino: "Electronegatividad", definicion: "Tendencia de un átomo a atraer electrones del enlace.", ejemplo: "El flúor es muy electronegativo.", etiquetas: ["concepto"] },
        { termino: "Enlace iónico / covalente / metálico", definicion: "Ceder electrones / compartirlos / mar de electrones libres.", ejemplo: "NaCl / H₂O / un cable de cobre.", etiquetas: ["concepto"] },
      ], actividad_final: "Clasifica el tipo de enlace probable: sal (NaCl), agua (H₂O) y una cuchara de metal." },
    },
    {
      titulo: "Completa: enlaces químicos", descripcion: "Completa el texto sobre por qué y cómo se unen los átomos.",
      tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "Los átomos se unen usando sus electrones de ___, los de la última capa. Si un átomo pierde electrones se forma un ion positivo o ___. En el enlace ___ los átomos comparten electrones y forman moléculas, como el agua. La ___ mide cuánto atrae un átomo los electrones del enlace.",
        huecos: [
          { posicion: 0, respuesta_correcta: "valencia", pista: "Electrones de la última capa." },
          { posicion: 1, respuesta_correcta: "catión", alternativas_aceptadas: ["cation"], pista: "Ion con carga positiva." },
          { posicion: 2, respuesta_correcta: "covalente", pista: "Se comparten electrones." },
          { posicion: 3, respuesta_correcta: "electronegatividad", pista: "Tendencia a atraer electrones." },
        ], distingue_mayusculas: false },
    },
    {
      titulo: "Autoevaluación — Enlaces químicos", descripcion: "Valora tu comprensión de iones, moléculas y enlaces.",
      tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Explico por qué los átomos forman enlaces (electrones de valencia, estabilidad).", escala: escala4 },
          { descripcion: "Distingo ion, catión, anión, molécula e isótopo.", escala: escala4 },
          { descripcion: "Diferencio enlace iónico, covalente y metálico con ejemplos.", escala: escala4 },
        ], reflexion_final_prompt: "¿Qué propiedad de un material cotidiano te ayudó a deducir su tipo de enlace?" },
    },
  ],

  // ════════════════════ P11 — Naturaleza energética y corpuscular + actividad eléctrica ════════════════════
  "CNEYT-I-P11": [
    {
      titulo: "Energía, partículas y electricidad", descripcion: "La naturaleza energética y corpuscular de la materia y su actividad eléctrica.",
      tipo: "lectura", xp: 10,
      contenido: {
        texto: "La materia tiene una doble naturaleza: es CORPUSCULAR (está hecha de partículas: átomos, iones, electrones) y a la vez está ligada a la ENERGÍA. De hecho, materia y energía están profundamente relacionadas: las partículas se mueven, vibran e interactúan, y en esas interacciones hay energía.\n\nUna de las manifestaciones más importantes de esta relación es la ACTIVIDAD ELÉCTRICA. Los electrones tienen CARGA ELÉCTRICA negativa y los protones positiva. Cargas iguales se repelen y cargas opuestas se atraen. Cuando los electrones se mueven de forma ordenada a través de un material, hay una CORRIENTE ELÉCTRICA.\n\nNo todos los materiales dejan pasar la corriente igual:\n• CONDUCTORES: permiten el paso de la corriente porque tienen electrones libres. Los metales (cobre, aluminio) son buenos conductores; por eso los cables son de metal.\n• AISLANTES: casi no dejan pasar la corriente (plástico, vidrio, madera seca). Por eso los cables se forran de plástico.\n• SEMICONDUCTORES: conducen en condiciones controladas (como el silicio). Son la base de los chips, las computadoras y los celulares.\n\nEsta relación entre partículas y energía explica TECNOLOGÍAS que usas a diario: las pilas y baterías guardan energía química y la convierten en eléctrica; los focos convierten energía eléctrica en luz y calor; los paneles solares convierten la energía de la luz en electricidad. Entender la materia como partículas con energía te permite comprender —y cuidar— el uso de la energía en tu vida.",
        fuente: "CEN Bachillerato — Ciencias Naturales, Experimentales y Tecnología I",
        nivel_lectura: "intermedio",
        preguntas_comprension: [
          { pregunta: "¿Qué significa que la materia tenga naturaleza corpuscular?", respuesta_guia: "Que está formada por partículas: átomos, iones y electrones." },
          { pregunta: "¿Por qué los cables son de metal por dentro y de plástico por fuera?", respuesta_guia: "El metal es conductor (deja pasar la corriente) y el plástico es aislante (la contiene y protege)." },
        ],
        tiempo_estimado_minutos: 9,
      },
    },
    {
      titulo: "Materia, energía y electricidad — Quiz", descripcion: "Comprueba qué entendiste sobre la naturaleza energética y eléctrica de la materia.",
      tipo: "quiz_multiple_opcion", xp: 15,
      contenido: { preguntas: [
        { enunciado: "Que la materia sea 'corpuscular' significa que está hecha de:", opciones: ["Ondas de sonido", "Partículas (átomos, iones, electrones)", "Energía pura sin materia", "Luz solamente"], respuesta_correcta: 1, retroalimentacion: "Corpuscular = formada por partículas." },
        { enunciado: "Una corriente eléctrica es, en esencia:", opciones: ["Protones que vibran sin moverse", "El movimiento ordenado de electrones", "Calor sin partículas", "Luz reflejada"], respuesta_correcta: 1, retroalimentacion: "Es el movimiento ordenado de cargas (electrones) por un material." },
        { enunciado: "¿Cuál de estos es un buen conductor de electricidad?", opciones: ["El plástico", "El vidrio", "El cobre", "La madera seca"], respuesta_correcta: 2, retroalimentacion: "El cobre es un metal con electrones libres: buen conductor." },
        { enunciado: "Los chips de las computadoras y celulares se basan en:", opciones: ["Aislantes perfectos", "Semiconductores como el silicio", "Cargas que no se mueven", "Materiales sin átomos"], respuesta_correcta: 1, retroalimentacion: "Los semiconductores (silicio) son la base de la electrónica." },
        { enunciado: "Dos cargas eléctricas del mismo signo:", opciones: ["Se atraen", "Se repelen", "No interactúan", "Se convierten en luz"], respuesta_correcta: 1, retroalimentacion: "Cargas iguales se repelen; opuestas se atraen." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 },
    },
    {
      titulo: "La energía en mi vida diaria", descripcion: "Relaciona la naturaleza energética de la materia con la tecnología que usas.",
      tipo: "reflexion_escrita", xp: 20,
      contenido: {
        prompt: "En un texto de al menos 100 palabras, explica con tus palabras qué significa que la materia tenga naturaleza corpuscular y energética, y cómo se relaciona con la electricidad. Luego elige un aparato que uses todos los días (celular, foco, pila, ventilador) y describe qué transformación de energía ocurre en él y por qué necesita materiales conductores y aislantes.",
        pistas: ["Parte de la idea de partículas con carga (electrones) y movimiento de cargas (corriente).", "Identifica la transformación de energía: química→eléctrica (pila), eléctrica→luz (foco), etc.", "Explica para qué sirve el conductor y para qué el aislante en ese aparato."],
        longitud_minima_palabras: 100, longitud_maxima_palabras: 350,
        criterios_evaluacion: ["Explica la naturaleza corpuscular y energética de la materia.", "Relaciona el movimiento de cargas con la corriente eléctrica.", "Describe una transformación de energía en un aparato real.", "Distingue el papel de conductores y aislantes."],
        formato_esperado: "libre",
      },
    },
    {
      titulo: "Energía y electricidad — Verdadero o falso", descripcion: "Distingue afirmaciones sobre la naturaleza energética y eléctrica de la materia.",
      tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "La materia está formada por partículas y, a la vez, está ligada a la energía.", respuesta: true, retroalimentacion: "Correcto: es su doble naturaleza corpuscular y energética." },
        { enunciado: "Los aislantes, como el plástico, conducen muy bien la electricidad.", respuesta: false, retroalimentacion: "Los aislantes casi no dejan pasar la corriente; por eso protegen los cables." },
        { enunciado: "Una pila convierte energía química en energía eléctrica.", respuesta: true, retroalimentacion: "Correcto: y un foco convierte la eléctrica en luz y calor." },
        { enunciado: "Cargas eléctricas opuestas se repelen.", respuesta: false, retroalimentacion: "Las opuestas se atraen; las iguales se repelen." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 },
    },
    {
      titulo: "Glosario — Energía, partículas y electricidad", descripcion: "Conceptos clave de la naturaleza energética y eléctrica de la materia.",
      tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Naturaleza corpuscular", definicion: "La materia está formada por partículas (átomos, iones, electrones).", ejemplo: "Un trozo de metal es un conjunto de átomos.", etiquetas: ["concepto"] },
        { termino: "Carga eléctrica", definicion: "Propiedad de las partículas: positiva (protón) o negativa (electrón).", ejemplo: "Cargas iguales se repelen, opuestas se atraen.", etiquetas: ["concepto"] },
        { termino: "Corriente eléctrica", definicion: "Movimiento ordenado de cargas (electrones) por un material.", ejemplo: "La que circula por un cable encendido.", etiquetas: ["concepto"] },
        { termino: "Conductor", definicion: "Material que deja pasar la corriente por tener electrones libres.", ejemplo: "El cobre y el aluminio.", etiquetas: ["material"] },
        { termino: "Aislante", definicion: "Material que casi no deja pasar la corriente.", ejemplo: "El plástico, el vidrio, la madera seca.", etiquetas: ["material"] },
        { termino: "Semiconductor", definicion: "Material que conduce en condiciones controladas.", ejemplo: "El silicio de los chips.", etiquetas: ["material"] },
        { termino: "Transformación de energía", definicion: "Cambio de un tipo de energía a otro.", ejemplo: "Pila: química→eléctrica; foco: eléctrica→luz.", etiquetas: ["concepto"] },
      ], actividad_final: "Clasifica como conductor o aislante: cobre, plástico, aluminio y vidrio." },
    },
    {
      titulo: "Completa: energía y electricidad", descripcion: "Completa el texto sobre la naturaleza energética y eléctrica de la materia.",
      tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "La materia tiene naturaleza ___ porque está formada por partículas. Los electrones tienen carga ___. Cuando estos se mueven de forma ordenada por un material se produce una ___ eléctrica. Los metales son buenos ___ porque tienen electrones libres, mientras que el plástico es un aislante.",
        huecos: [
          { posicion: 0, respuesta_correcta: "corpuscular", pista: "Hecha de partículas." },
          { posicion: 1, respuesta_correcta: "negativa", pista: "La carga del electrón." },
          { posicion: 2, respuesta_correcta: "corriente", pista: "Movimiento ordenado de cargas." },
          { posicion: 3, respuesta_correcta: "conductores", alternativas_aceptadas: ["conductor"], pista: "Dejan pasar la corriente." },
        ], distingue_mayusculas: false },
    },
    {
      titulo: "Autoevaluación — Energía y electricidad", descripcion: "Valora tu comprensión de la naturaleza energética y eléctrica de la materia.",
      tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Explico la doble naturaleza corpuscular y energética de la materia.", escala: escala4 },
          { descripcion: "Relaciono la carga y el movimiento de electrones con la corriente eléctrica.", escala: escala4 },
          { descripcion: "Distingo conductores, aislantes y semiconductores con ejemplos.", escala: escala4 },
        ], reflexion_final_prompt: "¿Cómo cuidarías el uso de la energía eléctrica en tu casa sabiendo lo que aprendiste?" },
    },
  ],
};

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
