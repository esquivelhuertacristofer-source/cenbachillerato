/**
 * Plantilla CEN completa (A1-A7) para las 2 progresiones NUEVAS de CNEYT-II:
 *   CNEYT-II-P09 (numero 6) — Gas ideal y primera ley de la termodinámica
 *   CNEYT-II-P10 (numero 7) — Entropía, entalpía y leyes de la termodinámica
 * A1=lectura · A2=quiz_multiple_opcion · A3=reflexion_escrita · A4=quiz_verdadero_falso
 * A5=glosario_interactivo · A6=fill_blanks · A7=autoevaluacion. estado='borrador'.
 * Uso: npx tsx scripts/seed-activities-cneytii-nuevas.ts
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
  log("\n🌱 CNEYT-II — A1-A7 para las 2 progresiones nuevas (P09 gas ideal y 1ª ley · P10 entropía, entalpía y leyes)\n");
  const progs = await getProgresionesDeUAC(sb, "CNEYT-II");
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
  log(`\n✅ CNEYT-II nuevas: ${ok} insertadas, ${fail} fallidas, ${skip} progresiones omitidas (existentes).\n`);
}

const nuevas: Record<string, Act[]> = {
  // ════════ CNEYT-II-P09 — Gas ideal y primera ley de la termodinámica ════════
  "CNEYT-II-P09": [
    { titulo: "Gas ideal y primera ley de la termodinámica", descripcion: "Lectura sobre sistemas termodinámicos, el gas ideal (PV = nRT) y la primera ley (ΔU = Q − W).", tipo: "lectura", xp: 10,
      contenido: {
        texto: "La termodinámica estudia cómo se transfiere y transforma la energía en forma de calor y trabajo. Para estudiarla, primero delimitamos un sistema termodinámico: la porción del universo que nos interesa, separada del entorno por fronteras. Según lo que puede atravesar esas fronteras, el sistema es abierto (intercambia materia y energía con el entorno, como una olla destapada), cerrado (intercambia solo energía, no materia, como una olla con tapa) o aislado (no intercambia ni materia ni energía, como un termo ideal).\n\nEl estado de un sistema gaseoso se describe con sus variables de estado: la presión P, el volumen V, la temperatura T y la cantidad de sustancia n (en moles). El principio cero de la termodinámica afirma que, si dos sistemas están en equilibrio térmico con un tercero, entonces están en equilibrio térmico entre sí; este principio es el que da sentido al concepto de temperatura y al uso del termómetro.\n\nUn gas ideal es un modelo en el que se supone que las partículas no interactúan entre sí (salvo en choques) y que su volumen propio es despreciable. Su comportamiento se resume en la ecuación de estado PV = nRT, donde R es la constante universal de los gases (R = 8.314 J/mol·K). Este modelo describe muy bien a los gases reales a baja presión y alta temperatura.\n\nEl calor y el trabajo son formas de transferir energía. Gracias al experimento de Joule sabemos que el trabajo mecánico puede producir calor (por ejemplo, la fricción), y que existe una equivalencia entre ambas medidas de energía: 1 caloría = 4.184 J. La primera ley de la termodinámica es la conservación de la energía aplicada a estos sistemas: ΔU = Q − W. Significa que el cambio en la energía interna del sistema (ΔU) es igual al calor que entra al sistema (Q) menos el trabajo que el sistema realiza sobre el entorno (W). La energía no se crea ni se destruye: solo cambia de forma o se transfiere.",
        nivel_lectura: "intermedio",
        preguntas_comprension: [
          { pregunta: "¿Qué diferencia hay entre un sistema abierto, uno cerrado y uno aislado?", respuesta_guia: "El abierto intercambia materia y energía; el cerrado solo energía; el aislado ni materia ni energía." },
          { pregunta: "¿Qué expresa la ecuación PV = nRT y qué significa cada variable?", respuesta_guia: "La ecuación de estado del gas ideal: P presión, V volumen, n moles, R constante (8.314 J/mol·K), T temperatura." },
          { pregunta: "¿Qué dice la primera ley de la termodinámica?", respuesta_guia: "ΔU = Q − W: el cambio de energía interna es el calor que entra menos el trabajo que realiza el sistema; es la conservación de la energía." },
        ], tiempo_estimado_minutos: 15 } },
    { titulo: "Gas ideal y primera ley — Opción múltiple", descripcion: "Evalúa lo que aprendiste sobre sistemas, gas ideal y la primera ley de la termodinámica.", tipo: "quiz_multiple_opcion", xp: 15,
      contenido: { preguntas: [
        { enunciado: "Un sistema que intercambia energía con el entorno pero NO materia se llama…", opciones: ["abierto", "cerrado", "aislado", "ideal"], respuesta_correcta: 1, retroalimentacion: "El sistema cerrado intercambia solo energía (p. ej. una olla con tapa)." },
        { enunciado: "La ecuación de estado del gas ideal es…", opciones: ["ΔU = Q − W", "PV = nRT", "Ec = ½mv²", "W = F·d"], respuesta_correcta: 1, retroalimentacion: "PV = nRT relaciona presión, volumen, moles, R y temperatura." },
        { enunciado: "El principio cero de la termodinámica fundamenta el concepto de…", opciones: ["trabajo", "presión", "temperatura", "volumen"], respuesta_correcta: 2, retroalimentacion: "Da sentido a la temperatura y al equilibrio térmico." },
        { enunciado: "La equivalencia entre caloría y joule es…", opciones: ["1 caloría = 4.184 J", "1 caloría = 1 J", "1 caloría = 8.314 J", "1 caloría = 100 J"], respuesta_correcta: 0, retroalimentacion: "1 caloría = 4.184 J (experimento de Joule)." },
        { enunciado: "Según la primera ley (ΔU = Q − W), si un sistema recibe calor y no realiza trabajo, su energía interna…", opciones: ["disminuye", "aumenta", "no cambia", "se vuelve negativa"], respuesta_correcta: 1, retroalimentacion: "Con W = 0, ΔU = Q: la energía interna aumenta al recibir calor." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Reflexión: la energía en un fenómeno cotidiano", descripcion: "Reflexiona sobre cómo se transfiere la energía como calor y trabajo en tu vida diaria.", tipo: "reflexion_escrita", xp: 20,
      contenido: { instrucciones: "Escribe un texto aplicando la primera ley de la termodinámica a una situación cotidiana.", prompt: "Elige una situación de tu vida diaria en la que haya transferencia de energía como calor y como trabajo (por ejemplo: inflar una bomba de bicicleta, frotar tus manos para calentarlas, cocinar en una olla a presión o el motor de un coche). Explica con tus palabras cómo se aplica la primera ley de la termodinámica (ΔU = Q − W): ¿entra o sale calor del sistema?, ¿el sistema realiza trabajo o se hace trabajo sobre él?, ¿qué pasa con su energía interna? Relaciona tu explicación con la conservación de la energía.", formato_esperado: "libre", longitud_minima_palabras: 120 } },
    { titulo: "Gas ideal y primera ley — Verdadero o falso", descripcion: "Distingue afirmaciones sobre sistemas termodinámicos, gas ideal y la primera ley.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "En un sistema aislado no se intercambia ni materia ni energía con el entorno.", respuesta: true, retroalimentacion: "Correcto: el termo ideal es un ejemplo aproximado." },
        { enunciado: "En el modelo de gas ideal se supone que las partículas no interactúan entre sí.", respuesta: true, retroalimentacion: "Correcto: esa es una de las suposiciones del modelo." },
        { enunciado: "Una caloría equivale a 8.314 joules.", respuesta: false, retroalimentacion: "Falso: 1 caloría = 4.184 J. El valor 8.314 J/mol·K es la constante R." },
        { enunciado: "La primera ley de la termodinámica es la conservación de la energía aplicada a estos sistemas.", respuesta: true, retroalimentacion: "Correcto: la energía no se crea ni se destruye, solo se transfiere o transforma." },
        { enunciado: "El trabajo mecánico, como la fricción, puede producir calor.", respuesta: true, retroalimentacion: "Correcto: lo demostró el experimento de Joule." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: termodinámica básica", descripcion: "Aprende los términos clave sobre sistemas, gas ideal y primera ley.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Sistema termodinámico", definicion: "Porción del universo que se estudia, delimitada del entorno por fronteras.", ejemplo: "El gas dentro de un cilindro con pistón." },
        { termino: "Variables de estado", definicion: "Magnitudes que describen el estado de un sistema: presión, volumen, temperatura y cantidad de sustancia.", ejemplo: "P, V, T y n en un gas." },
        { termino: "Principio cero", definicion: "Si dos sistemas están en equilibrio térmico con un tercero, lo están entre sí; fundamenta la temperatura.", ejemplo: "Un termómetro mide la temperatura porque alcanza equilibrio térmico con el cuerpo." },
        { termino: "Gas ideal", definicion: "Modelo de gas cuyas partículas no interactúan y cumple la ecuación PV = nRT.", ejemplo: "El aire a baja presión se comporta casi como gas ideal." },
        { termino: "Energía interna (U)", definicion: "Energía total contenida en un sistema, asociada al movimiento y a las interacciones de sus partículas.", ejemplo: "Al calentar un gas aumenta su energía interna." },
        { termino: "Primera ley", definicion: "Conservación de la energía en termodinámica: ΔU = Q − W.", ejemplo: "El calor que recibe un gas se reparte entre aumentar su energía interna y realizar trabajo." },
      ], actividad_final: "Clasifica como abierto, cerrado o aislado: una taza de café sin tapa, una lata de refresco sellada y un termo de buena calidad." } },
    { titulo: "Completa: gas ideal y primera ley", descripcion: "Completa el texto sobre sistemas, gas ideal y la primera ley de la termodinámica.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra o símbolo correcto.",
        texto_con_huecos: "Un sistema ___ intercambia solo energía con el entorno, no materia. El estado de un gas se describe con variables como presión, volumen, temperatura y cantidad de sustancia. El modelo de gas ideal cumple la ecuación PV = ___. La equivalencia entre energías es: 1 caloría = ___ J. La primera ley de la termodinámica se escribe ΔU = Q − ___.",
        huecos: [
          { posicion: 0, respuesta_correcta: "cerrado", pista: "Solo energía, no materia." },
          { posicion: 1, respuesta_correcta: "nRT", pista: "PV = n por R por T." },
          { posicion: 2, respuesta_correcta: "4.184", alternativas_aceptadas: ["4.184", "4,184"], pista: "Resultado del experimento de Joule." },
          { posicion: 3, respuesta_correcta: "W", alternativas_aceptadas: ["trabajo"], pista: "El trabajo que realiza el sistema." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Gas ideal y primera ley", descripcion: "Valora tu comprensión de los sistemas, el gas ideal y la primera ley.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Distingo sistemas abiertos, cerrados y aislados.", escala: escala4 },
        { descripcion: "Uso la ecuación del gas ideal (PV = nRT) e identifico sus variables.", escala: escala4 },
        { descripcion: "Explico la primera ley (ΔU = Q − W) como conservación de la energía.", escala: escala4 },
      ], reflexion_final_prompt: "¿Qué idea de la termodinámica te resultó más útil para entender el mundo que te rodea?" } },
  ],

  // ════════ CNEYT-II-P10 — Entropía, entalpía y leyes de la termodinámica ════════
  "CNEYT-II-P10": [
    { titulo: "Entropía, entalpía y leyes de la termodinámica", descripcion: "Lectura sobre entalpía, entropía y la segunda y tercera leyes de la termodinámica.", tipo: "lectura", xp: 10,
      contenido: {
        texto: "La primera ley de la termodinámica nos dice que la energía se conserva, y tiene muchas aplicaciones: explica el funcionamiento de las máquinas térmicas y los motores, que transforman calor en trabajo. Pero la primera ley no lo explica todo; por ejemplo, no dice por qué el calor fluye siempre de lo caliente a lo frío y nunca al revés por sí solo. Para eso necesitamos otros conceptos y leyes.\n\nLa entalpía (H = U + PV) es una magnitud útil para medir el calor intercambiado por un sistema a presión constante, como ocurre en muchas reacciones químicas al aire libre. Cuando un proceso libera calor al entorno se llama exotérmico (por ejemplo, una combustión); cuando un proceso absorbe calor del entorno se llama endotérmico (por ejemplo, disolver ciertas sales que enfrían el agua).\n\nLa entropía (S) es una medida del desorden de un sistema o, dicho con más precisión, de la dispersión de la energía. En la naturaleza, los sistemas tienden a evolucionar hacia estados de mayor entropía. La segunda ley de la termodinámica establece que, en todo proceso espontáneo, la entropía total del universo aumenta. De ahí se deducen hechos cotidianos: el calor fluye espontáneamente de los cuerpos calientes a los fríos, y ninguna máquina térmica puede ser 100% eficiente, porque siempre se 'pierde' algo de energía en forma de calor disperso.\n\nLa tercera ley de la termodinámica afirma que la entropía de un cristal perfecto en el cero absoluto es cero. El cero absoluto es la temperatura más baja posible: 0 K, equivalente a −273.15 °C. Además, la tercera ley implica que el cero absoluto es inalcanzable: podemos acercarnos mucho, pero nunca llegar exactamente a él. Juntas, estas leyes explican por qué la energía, aunque se conserve, se vuelve cada vez menos aprovechable.",
        nivel_lectura: "intermedio",
        preguntas_comprension: [
          { pregunta: "¿Qué diferencia hay entre un proceso exotérmico y uno endotérmico?", respuesta_guia: "El exotérmico libera calor al entorno; el endotérmico lo absorbe del entorno." },
          { pregunta: "¿Qué establece la segunda ley de la termodinámica?", respuesta_guia: "En todo proceso espontáneo la entropía total del universo aumenta; el calor fluye de lo caliente a lo frío y ninguna máquina térmica es 100% eficiente." },
          { pregunta: "¿Cuál es el valor del cero absoluto y qué dice la tercera ley sobre él?", respuesta_guia: "0 K = −273.15 °C; la entropía de un cristal perfecto allí es cero y el cero absoluto es inalcanzable." },
        ], tiempo_estimado_minutos: 15 } },
    { titulo: "Entropía, entalpía y leyes — Opción múltiple", descripcion: "Evalúa lo que aprendiste sobre entalpía, entropía y las leyes de la termodinámica.", tipo: "quiz_multiple_opcion", xp: 15,
      contenido: { preguntas: [
        { enunciado: "Un proceso que libera calor al entorno se llama…", opciones: ["endotérmico", "exotérmico", "isotérmico", "adiabático"], respuesta_correcta: 1, retroalimentacion: "Exotérmico: libera calor (p. ej. una combustión)." },
        { enunciado: "La entropía (S) es una medida de…", opciones: ["la presión del sistema", "el desorden o dispersión de la energía", "la masa del sistema", "el trabajo realizado"], respuesta_correcta: 1, retroalimentacion: "La entropía mide el desorden o la dispersión de la energía." },
        { enunciado: "Según la segunda ley, en todo proceso espontáneo la entropía del universo…", opciones: ["disminuye", "se mantiene constante", "aumenta", "se vuelve cero"], respuesta_correcta: 2, retroalimentacion: "La entropía total del universo aumenta." },
        { enunciado: "El cero absoluto corresponde a…", opciones: ["0 °C", "−273.15 °C (0 K)", "100 K", "−100 °C"], respuesta_correcta: 1, retroalimentacion: "0 K = −273.15 °C, la temperatura más baja posible." },
        { enunciado: "Una consecuencia de la segunda ley es que ninguna máquina térmica…", opciones: ["puede funcionar", "es 100% eficiente", "produce trabajo", "necesita combustible"], respuesta_correcta: 1, retroalimentacion: "Siempre se dispersa algo de energía como calor; no hay eficiencia del 100%." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Reflexión: el desorden que crece", descripcion: "Reflexiona sobre la entropía y la segunda ley en fenómenos de tu entorno.", tipo: "reflexion_escrita", xp: 20,
      contenido: { instrucciones: "Escribe un texto relacionando la entropía y la segunda ley con tu experiencia.", prompt: "Piensa en un ejemplo de tu vida en el que las cosas tienden naturalmente al desorden o en el que la energía se dispersa y se vuelve menos aprovechable (por ejemplo: un café caliente que se enfría, un cuarto que se desordena con el uso, una pila que se agota, el hielo que se derrite). Explica con tus palabras cómo se relaciona con la entropía y con la segunda ley de la termodinámica. ¿Por qué el calor fluye de lo caliente a lo frío y no al revés? ¿Por qué crees que ninguna máquina es perfectamente eficiente?", formato_esperado: "libre", longitud_minima_palabras: 120 } },
    { titulo: "Entropía, entalpía y leyes — Verdadero o falso", descripcion: "Distingue afirmaciones sobre entalpía, entropía y las leyes de la termodinámica.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "En un proceso endotérmico el sistema absorbe calor del entorno.", respuesta: true, retroalimentacion: "Correcto: endo = hacia dentro; absorbe calor." },
        { enunciado: "La entropía total del universo disminuye en los procesos espontáneos.", respuesta: false, retroalimentacion: "Falso: la segunda ley dice que aumenta." },
        { enunciado: "El calor fluye espontáneamente de los cuerpos fríos a los calientes.", respuesta: false, retroalimentacion: "Falso: fluye de lo caliente a lo frío por sí solo." },
        { enunciado: "La tercera ley dice que la entropía de un cristal perfecto en el cero absoluto es cero.", respuesta: true, retroalimentacion: "Correcto: esa es la tercera ley." },
        { enunciado: "El cero absoluto (0 K = −273.15 °C) es inalcanzable en la práctica.", respuesta: true, retroalimentacion: "Correcto: podemos acercarnos, pero nunca llegar exactamente." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: entalpía, entropía y leyes", descripcion: "Aprende los términos clave sobre entalpía, entropía y las leyes de la termodinámica.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Entalpía (H)", definicion: "Magnitud que mide el calor intercambiado a presión constante; H = U + PV.", ejemplo: "El calor liberado por una reacción al aire libre." },
        { termino: "Proceso exotérmico", definicion: "Proceso que libera calor al entorno.", ejemplo: "La combustión de la madera." },
        { termino: "Proceso endotérmico", definicion: "Proceso que absorbe calor del entorno.", ejemplo: "Disolver ciertas sales que enfrían el agua." },
        { termino: "Entropía (S)", definicion: "Medida del desorden de un sistema o de la dispersión de la energía; tiende a aumentar.", ejemplo: "El hielo que se derrite y se mezcla con el agua." },
        { termino: "Segunda ley", definicion: "En todo proceso espontáneo la entropía total del universo aumenta; el calor fluye de lo caliente a lo frío.", ejemplo: "Ninguna máquina térmica es 100% eficiente." },
        { termino: "Cero absoluto", definicion: "Temperatura más baja posible: 0 K = −273.15 °C; es inalcanzable.", ejemplo: "Los laboratorios solo logran acercarse a ella." },
      ], actividad_final: "Clasifica como exotérmico o endotérmico: encender un cerillo, derretir hielo y la combustión de gas en una estufa." } },
    { titulo: "Completa: entropía, entalpía y leyes", descripcion: "Completa el texto sobre entalpía, entropía y las leyes de la termodinámica.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "La ___ mide el calor intercambiado a presión constante. Un proceso que libera calor es ___ y uno que absorbe calor es endotérmico. La ___ es una medida del desorden o la dispersión de la energía. La segunda ley dice que en todo proceso espontáneo la entropía del universo ___. La tercera ley se refiere al cero absoluto, que equivale a ___ °C.",
        huecos: [
          { posicion: 0, respuesta_correcta: "entalpía", alternativas_aceptadas: ["entalpia"], pista: "H = U + PV." },
          { posicion: 1, respuesta_correcta: "exotérmico", alternativas_aceptadas: ["exotermico"], pista: "Libera calor." },
          { posicion: 2, respuesta_correcta: "entropía", alternativas_aceptadas: ["entropia"], pista: "Medida del desorden." },
          { posicion: 3, respuesta_correcta: "aumenta", alternativas_aceptadas: ["crece"], pista: "Siempre crece." },
          { posicion: 4, respuesta_correcta: "-273.15", alternativas_aceptadas: ["-273.15", "−273.15", "-273,15", "-273"], pista: "0 K en grados Celsius." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Entropía, entalpía y leyes", descripcion: "Valora tu comprensión de la entalpía, la entropía y las leyes de la termodinámica.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Distingo procesos exotérmicos de endotérmicos y comprendo la entalpía.", escala: escala4 },
        { descripcion: "Explico la entropía y la segunda ley (la entropía del universo aumenta).", escala: escala4 },
        { descripcion: "Conozco la tercera ley y el significado del cero absoluto (0 K = −273.15 °C).", escala: escala4 },
      ], reflexion_final_prompt: "¿Cómo cambia tu forma de ver el ahorro de energía sabiendo que ninguna máquina es 100% eficiente?" } },
  ],
};

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
