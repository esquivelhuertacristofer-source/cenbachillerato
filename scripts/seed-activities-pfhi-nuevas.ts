/**
 * Plantilla CEN completa (A1-A7) para la progresión NUEVA de PFH-I:
 *   PFH-I-P06 (numero 4) — Conocimiento, Ciencia y Verdad (Oficial 4)
 * A1=lectura · A2=quiz_multiple_opcion · A3=reflexion_escrita · A4=quiz_verdadero_falso
 * A5=glosario_interactivo · A6=fill_blanks · A7=autoevaluacion. estado='borrador'.
 * Uso: npx tsx scripts/seed-activities-pfhi-nuevas.ts
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
  log("\n🌱 PFH-I — A1-A7 para la progresión nueva P06 (Conocimiento, Ciencia y Verdad)\n");
  const progs = await getProgresionesDeUAC(sb, "PFH-I");
  let ok = 0, fail = 0, skip = 0;
  for (const p of progs) {
    const set = nuevas[p.codigo];
    if (!set) { skip++; continue; }
    for (let i = 0; i < set.length; i++) {
      const a = set[i];
      const res = await upsertActividad(sb, {
        codigo: `${p.codigo}-${letras[i]}`, titulo: a.titulo, descripcion: a.descripcion,
        tipo: a.tipo, progresion_id: p.id, xp: a.xp, contenido: a.contenido,
      });
      res ? ok++ : fail++;
    }
  }
  log(`\n✅ PFH-I nuevas: ${ok} insertadas, ${fail} fallidas, ${skip} progresiones omitidas (existentes).\n`);
}

const nuevas: Record<string, Act[]> = {
  "PFH-I-P06": [
    { titulo: "Conocimiento, Ciencia y Verdad", descripcion: "Lectura sobre las teorías del conocimiento, el problema de la verdad y la posverdad.", tipo: "lectura", xp: 10,
      contenido: {
        texto: "Desde siempre, los seres humanos se preguntan cómo conocen el mundo y qué significa que algo sea verdadero. La rama de la filosofía que estudia esto es la teoría del conocimiento o epistemología. Sus preguntas básicas son: ¿qué podemos conocer?, ¿cómo lo conocemos? y ¿hasta qué punto podemos estar seguros?\n\nEn esa búsqueda aparecen dos fuentes clásicas del conocimiento: la percepción (lo que captamos por los sentidos) y la razón (lo que comprendemos con el pensamiento). Algunas corrientes confían más en la experiencia sensible y otras en la razón; la mayoría reconoce que ambas se complementan. El conocimiento científico se construye con métodos, evidencia y revisión entre pares, mientras que los saberes sociales y humanísticos aportan sentido, valores e interpretación: entre ambos hay encuentros y desencuentros, pero los dos son valiosos.\n\nEl problema de la verdad consiste en preguntarnos qué hace que una afirmación sea verdadera. ¿Es verdad lo que corresponde a los hechos? ¿Lo que es coherente con lo demás que sabemos? ¿Lo que resulta útil? Hoy este problema se vuelve urgente por la posverdad: situaciones en que las emociones y las creencias personales pesan más que los hechos a la hora de formar opiniones, algo que las noticias falsas y las redes sociales amplifican. Por eso, interpretar con cuidado la información —preguntar quién lo dice, con qué pruebas y con qué intención— es una habilidad filosófica esencial para la vida cotidiana.",
        nivel_lectura: "intermedio",
        preguntas_comprension: [
          { pregunta: "¿Cuáles son las dos fuentes clásicas del conocimiento?", respuesta_guia: "La percepción (los sentidos) y la razón (el pensamiento)." },
          { pregunta: "¿Qué es la posverdad?", respuesta_guia: "Situaciones en que las emociones y creencias pesan más que los hechos al formar opiniones." },
        ], tiempo_estimado_minutos: 13 } },
    { titulo: "Conocimiento y Verdad — Opción múltiple", descripcion: "Evalúa lo que aprendiste sobre teoría del conocimiento, verdad y posverdad.", tipo: "quiz_multiple_opcion", xp: 15,
      contenido: { preguntas: [
        { enunciado: "La rama de la filosofía que estudia el conocimiento se llama…", opciones: ["estética", "epistemología", "ontología", "ética"], respuesta_correcta: 1, retroalimentacion: "La epistemología o teoría del conocimiento." },
        { enunciado: "Las dos fuentes clásicas del conocimiento son…", opciones: ["la fe y la costumbre", "la percepción y la razón", "el dinero y el poder", "la suerte y el azar"], respuesta_correcta: 1, retroalimentacion: "Los sentidos (percepción) y el pensamiento (razón)." },
        { enunciado: "La 'posverdad' describe situaciones en que…", opciones: ["los hechos siempre se respetan", "las emociones y creencias pesan más que los hechos", "no existe internet", "todos dicen la verdad"], respuesta_correcta: 1, retroalimentacion: "Las emociones pesan más que la evidencia." },
        { enunciado: "Ante una información, una actitud filosófica crítica es…", opciones: ["creer todo lo que se comparte", "preguntar quién lo dice y con qué pruebas", "ignorar siempre las fuentes", "difundirla sin leerla"], respuesta_correcta: 1, retroalimentacion: "Interpretar con cuidado: fuente, pruebas e intención." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Reflexión: ¿cómo sé que algo es verdad?", descripcion: "Reflexiona sobre cómo distingues lo verdadero de lo falso en tu vida diaria.", tipo: "reflexion_escrita", xp: 20,
      contenido: { instrucciones: "Escribe un texto reflexionando sobre el conocimiento y la verdad.", prompt: "En la era de las redes sociales y las noticias falsas, ¿cómo decides tú si una información es verdadera o no? Describe los pasos o criterios que usas y reflexiona sobre por qué es importante no dejarse llevar solo por las emociones (posverdad).", formato_esperado: "libre", longitud_minima_palabras: 120 } },
    { titulo: "Conocimiento y Verdad — Verdadero o falso", descripcion: "Distingue afirmaciones sobre el conocimiento, la ciencia y la verdad.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "La percepción y la razón se complementan en la construcción del conocimiento.", respuesta: true, retroalimentacion: "Correcto: ambas aportan." },
        { enunciado: "El conocimiento científico y los saberes humanísticos no tienen ningún valor en común.", respuesta: false, retroalimentacion: "Ambos son valiosos; tienen encuentros y desencuentros." },
        { enunciado: "En la posverdad, los hechos pesan menos que las emociones al formar opiniones.", respuesta: true, retroalimentacion: "Correcto: esa es su característica central." },
        { enunciado: "Interpretar la información con cuidado es una habilidad filosófica útil para la vida.", respuesta: true, retroalimentacion: "Correcto: ayuda a no caer en engaños." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: teoría del conocimiento", descripcion: "Aprende los términos clave sobre conocimiento, ciencia y verdad.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Epistemología", definicion: "Rama de la filosofía que estudia el conocimiento: qué podemos conocer y cómo.", ejemplo: "Preguntar cómo sabemos que algo es verdad." },
        { termino: "Percepción", definicion: "Conocimiento que obtenemos a través de los sentidos.", ejemplo: "Ver, oír o tocar algo." },
        { termino: "Razón", definicion: "Capacidad de pensar, comprender y argumentar.", ejemplo: "Deducir una conclusión a partir de premisas." },
        { termino: "Verdad", definicion: "Cualidad de una afirmación que corresponde a los hechos o es coherente y fundada.", ejemplo: "'Está lloviendo' es verdad si efectivamente llueve." },
        { termino: "Posverdad", definicion: "Situación en que las emociones y creencias personales influyen más que los hechos en la opinión pública.", ejemplo: "Creer una noticia falsa porque encaja con lo que ya pensábamos." },
      ], actividad_final: "Busca una noticia y anota tres preguntas para comprobar si es verdadera." } },
    { titulo: "Completa: conocimiento y verdad", descripcion: "Completa el texto sobre teoría del conocimiento y posverdad.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "La ___ es la rama de la filosofía que estudia el conocimiento. Sus dos fuentes clásicas son la ___, por los sentidos, y la razón, por el pensamiento. El problema de la ___ pregunta qué hace verdadera una afirmación. Cuando las emociones pesan más que los hechos hablamos de ___.",
        huecos: [
          { posicion: 0, respuesta_correcta: "epistemología", alternativas_aceptadas: ["epistemologia", "teoría del conocimiento", "teoria del conocimiento"], pista: "Estudia el conocimiento." },
          { posicion: 1, respuesta_correcta: "percepción", alternativas_aceptadas: ["percepcion"], pista: "Por los sentidos." },
          { posicion: 2, respuesta_correcta: "verdad", pista: "El problema de la ___." },
          { posicion: 3, respuesta_correcta: "posverdad", pista: "Emociones por encima de los hechos." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Conocimiento, Ciencia y Verdad", descripcion: "Valora tu comprensión de la teoría del conocimiento y la verdad.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Distingo la percepción de la razón como fuentes del conocimiento.", escala: escala4 },
        { descripcion: "Comprendo el problema de la verdad y la posverdad.", escala: escala4 },
        { descripcion: "Interpreto la información de forma crítica (fuente, pruebas, intención).", escala: escala4 },
      ], reflexion_final_prompt: "¿Qué harás de ahora en adelante antes de compartir una noticia?" } },
  ],
};

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
