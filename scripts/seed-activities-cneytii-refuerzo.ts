/**
 * Refuerzo CNEYT-II (Plantilla CEN): agrega A4-A7 a las 8 progresiones que ya tienen A1-A3
 * (A1=lectura, A2=quiz_multiple_opcion, A3=reflexion_escrita).
 *   A4 = quiz_verdadero_falso · A5 = glosario_interactivo · A6 = fill_blanks · A7 = autoevaluacion
 * SOLO P01-P08 (las NUEVAS P09/P10 NO se incluyen aquí). Keyed por CÓDIGO. estado='borrador'.
 * Uso: npx tsx scripts/seed-activities-cneytii-refuerzo.ts
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
  log("\n🌱 Refuerzo CNEYT-II — A4-A7 para las 8 progresiones existentes (P01-P08)\n");
  const progs = await getProgresionesDeUAC(sb, "CNEYT-II");
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
  log(`\n✅ CNEYT-II refuerzo: ${ok} insertadas, ${fail} fallidas, ${skip} progresiones omitidas (nuevas/no aplicables).\n`);
}

const refuerzos: Record<string, Refuerzo[]> = {
  // ════════ CNEYT-II-P01 — Energía: definición, formas y unidades ════════
  "CNEYT-II-P01": [
    { titulo: "Energía: formas y unidades — Verdadero o falso", descripcion: "Distingue afirmaciones sobre la energía, sus formas y sus unidades.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "La energía es la capacidad de un sistema para producir cambios o realizar trabajo.", respuesta: true, retroalimentacion: "Correcto: esa es su definición física." },
        { enunciado: "La energía cinética, la potencial y la térmica son formas distintas de energía.", respuesta: true, retroalimentacion: "Correcto: también la luminosa, la eléctrica y la química." },
        { enunciado: "El joule (J) y la caloría son unidades de energía.", respuesta: true, retroalimentacion: "Correcto: 1 caloría = 4.184 J." },
        { enunciado: "La energía solo existe en una única forma y no puede manifestarse de varias maneras.", respuesta: false, retroalimentacion: "Falso: hay muchas formas (cinética, potencial, térmica, luminosa, eléctrica, química)." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: energía y sus formas", descripcion: "Aprende los términos clave sobre la energía, sus formas y unidades.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Energía", definicion: "Capacidad de un sistema para producir cambios o realizar trabajo.", ejemplo: "El Sol entrega energía a la Tierra." },
        { termino: "Energía cinética", definicion: "Energía que tiene un cuerpo debido a su movimiento.", ejemplo: "Un auto en marcha." },
        { termino: "Energía potencial", definicion: "Energía almacenada que depende de la posición o el estado de un cuerpo.", ejemplo: "Una piedra en lo alto de una colina." },
        { termino: "Energía química", definicion: "Energía almacenada en los enlaces de las sustancias.", ejemplo: "La energía de los alimentos o de una pila." },
        { termino: "Joule (J)", definicion: "Unidad de energía y de trabajo en el Sistema Internacional.", ejemplo: "1 caloría equivale a 4.184 J." },
      ], actividad_final: "Identifica en tu casa un ejemplo de energía cinética, una de potencial y una química." } },
    { titulo: "Completa: energía, formas y unidades", descripcion: "Completa el texto sobre la energía, sus formas y sus unidades.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "La ___ es la capacidad de producir cambios o realizar trabajo. La energía de un cuerpo en movimiento se llama energía ___; la que se almacena por la posición es energía ___. La unidad de energía en el Sistema Internacional es el ___.",
        huecos: [
          { posicion: 0, respuesta_correcta: "energía", alternativas_aceptadas: ["energia"], pista: "Capacidad de producir cambios." },
          { posicion: 1, respuesta_correcta: "cinética", alternativas_aceptadas: ["cinetica"], pista: "Debida al movimiento." },
          { posicion: 2, respuesta_correcta: "potencial", pista: "Almacenada por la posición." },
          { posicion: 3, respuesta_correcta: "joule", alternativas_aceptadas: ["julio", "J"], pista: "Su símbolo es J." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Energía, formas y unidades", descripcion: "Valora tu comprensión de la energía, sus formas y unidades.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Defino qué es la energía.", escala: escala4 },
        { descripcion: "Identifico distintas formas de energía (cinética, potencial, térmica, luminosa, eléctrica, química).", escala: escala4 },
        { descripcion: "Reconozco las unidades de energía (joule y caloría).", escala: escala4 },
      ], reflexion_final_prompt: "¿Qué formas de energía utilizas en un día normal?" } },
  ],

  // ════════ CNEYT-II-P02 — Transformación, transferencia y conservación de la energía ════════
  "CNEYT-II-P02": [
    { titulo: "Transformación y conservación — Verdadero o falso", descripcion: "Distingue afirmaciones sobre la transformación, transferencia y conservación de la energía.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "La energía puede transformarse de una forma a otra (por ejemplo, química en eléctrica).", respuesta: true, retroalimentacion: "Correcto: una pila transforma energía química en eléctrica." },
        { enunciado: "La ley de conservación de la energía dice que la energía no se crea ni se destruye, solo se transforma.", respuesta: true, retroalimentacion: "Correcto: es un principio fundamental de la física." },
        { enunciado: "La transferencia de energía es el paso de energía de un cuerpo o sistema a otro.", respuesta: true, retroalimentacion: "Correcto: por ejemplo, el calor que pasa de un cuerpo caliente a uno frío." },
        { enunciado: "Al transformarse, la energía total de un sistema aislado desaparece.", respuesta: false, retroalimentacion: "Falso: la energía total se conserva, solo cambia de forma." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: transformación y conservación", descripcion: "Aprende los términos clave sobre transformación, transferencia y conservación de la energía.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Transformación de energía", definicion: "Cambio de la energía de una forma a otra.", ejemplo: "Una lámpara transforma energía eléctrica en luminosa y térmica." },
        { termino: "Transferencia de energía", definicion: "Paso de energía de un cuerpo o sistema a otro.", ejemplo: "El calor pasa de una taza caliente a tus manos." },
        { termino: "Conservación de la energía", definicion: "Principio según el cual la energía no se crea ni se destruye, solo se transforma.", ejemplo: "La energía de una pelota que cae se conserva entre potencial y cinética." },
        { termino: "Energía total", definicion: "Suma de todas las formas de energía de un sistema; en un sistema aislado se mantiene constante.", ejemplo: "La energía mecánica total en una caída sin fricción." },
      ], actividad_final: "Describe una cadena de transformaciones de energía en un aparato eléctrico de tu casa." } },
    { titulo: "Completa: transformación y conservación", descripcion: "Completa el texto sobre transformación, transferencia y conservación de la energía.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "La energía puede ___ de una forma a otra, por ejemplo de química a eléctrica. El paso de energía de un cuerpo a otro es una ___ de energía. La ley de ___ de la energía afirma que esta no se crea ni se ___, solo cambia de forma.",
        huecos: [
          { posicion: 0, respuesta_correcta: "transformarse", alternativas_aceptadas: ["transformar"], pista: "Cambiar de forma." },
          { posicion: 1, respuesta_correcta: "transferencia", pista: "Paso de un cuerpo a otro." },
          { posicion: 2, respuesta_correcta: "conservación", alternativas_aceptadas: ["conservacion"], pista: "No se crea ni se destruye." },
          { posicion: 3, respuesta_correcta: "destruye", pista: "Lo contrario de crear." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Transformación y conservación", descripcion: "Valora tu comprensión de la transformación, transferencia y conservación de la energía.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Explico cómo la energía se transforma de una forma a otra.", escala: escala4 },
        { descripcion: "Distingo transformación de transferencia de energía.", escala: escala4 },
        { descripcion: "Aplico la ley de conservación de la energía.", escala: escala4 },
      ], reflexion_final_prompt: "¿Qué cadena de transformaciones de energía ocurre cuando escuchas música en tu celular?" } },
  ],

  // ════════ CNEYT-II-P03 — Trabajo mecánico y principios de la termodinámica ════════
  "CNEYT-II-P03": [
    { titulo: "Trabajo mecánico y calor — Verdadero o falso", descripcion: "Distingue afirmaciones sobre el trabajo mecánico y la producción de calor.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "El trabajo mecánico se calcula como fuerza por distancia (W = F·d).", respuesta: true, retroalimentacion: "Correcto: cuando la fuerza actúa en la dirección del movimiento." },
        { enunciado: "Si una fuerza no produce desplazamiento, no realiza trabajo mecánico.", respuesta: true, retroalimentacion: "Correcto: sin desplazamiento (d = 0) el trabajo es cero." },
        { enunciado: "Los procesos mecánicos, como la fricción, pueden producir calor.", respuesta: true, retroalimentacion: "Correcto: frotar dos superficies genera calor." },
        { enunciado: "El trabajo y el calor no tienen ninguna relación con la energía.", respuesta: false, retroalimentacion: "Falso: ambos son formas de transferir energía." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: trabajo y calor", descripcion: "Aprende los términos clave sobre trabajo mecánico y termodinámica.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Trabajo mecánico (W)", definicion: "Energía transferida cuando una fuerza desplaza un cuerpo; W = F·d.", ejemplo: "Empujar una caja por el suelo una cierta distancia." },
        { termino: "Fuerza (F)", definicion: "Acción capaz de cambiar el movimiento o la forma de un cuerpo; se mide en newtons.", ejemplo: "El empuje que aplicas a una puerta." },
        { termino: "Fricción", definicion: "Fuerza que se opone al movimiento entre superficies en contacto y que produce calor.", ejemplo: "El roce de las manos al frotarlas." },
        { termino: "Calor", definicion: "Energía que se transfiere entre cuerpos debido a una diferencia de temperatura.", ejemplo: "El calor producido por la fricción de los frenos." },
      ], actividad_final: "Calcula el trabajo de empujar una caja con una fuerza de 10 N a lo largo de 3 m (W = F·d)." } },
    { titulo: "Completa: trabajo mecánico y calor", descripcion: "Completa el texto sobre trabajo mecánico y producción de calor.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra o símbolo correcto.",
        texto_con_huecos: "El trabajo mecánico se calcula como fuerza por ___ y se expresa con la fórmula W = F·___. Si no hay desplazamiento, el trabajo es ___. Los procesos mecánicos como la ___ pueden producir calor.",
        huecos: [
          { posicion: 0, respuesta_correcta: "distancia", alternativas_aceptadas: ["desplazamiento"], pista: "La longitud recorrida." },
          { posicion: 1, respuesta_correcta: "d", alternativas_aceptadas: ["distancia"], pista: "Símbolo de distancia." },
          { posicion: 2, respuesta_correcta: "cero", alternativas_aceptadas: ["0", "nulo"], pista: "Sin desplazamiento, W = ___." },
          { posicion: 3, respuesta_correcta: "fricción", alternativas_aceptadas: ["friccion", "roce"], pista: "Fuerza que se opone al movimiento." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Trabajo mecánico y calor", descripcion: "Valora tu comprensión del trabajo mecánico y la producción de calor.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Calculo el trabajo mecánico con la fórmula W = F·d.", escala: escala4 },
        { descripcion: "Reconozco cuándo una fuerza realiza trabajo y cuándo no.", escala: escala4 },
        { descripcion: "Explico cómo los procesos mecánicos (fricción) producen calor.", escala: escala4 },
      ], reflexion_final_prompt: "¿En qué actividad diaria realizas trabajo mecánico y dónde notas el calor que produce la fricción?" } },
  ],

  // ════════ CNEYT-II-P04 — Calor y temperatura: medición, escalas y propagación ════════
  "CNEYT-II-P04": [
    { titulo: "Calor y temperatura — Verdadero o falso", descripcion: "Distingue afirmaciones sobre calor, temperatura, escalas y propagación.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "Calor y temperatura son lo mismo.", respuesta: false, retroalimentacion: "Falso: el calor es energía en tránsito; la temperatura mide la agitación de las partículas." },
        { enunciado: "El equilibrio térmico se alcanza cuando dos cuerpos en contacto llegan a la misma temperatura.", respuesta: true, retroalimentacion: "Correcto: el calor fluye hasta igualar las temperaturas." },
        { enunciado: "La conducción, la convección y la radiación son formas de propagación del calor.", respuesta: true, retroalimentacion: "Correcto: son los tres mecanismos de transferencia de calor." },
        { enunciado: "En la escala Kelvin, las temperaturas pueden ser negativas con frecuencia.", respuesta: false, retroalimentacion: "Falso: el cero de la escala Kelvin es el cero absoluto; no hay valores por debajo." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: calor, temperatura y propagación", descripcion: "Aprende los términos clave sobre calor, temperatura y su propagación.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Temperatura", definicion: "Medida de la agitación o energía cinética promedio de las partículas de un cuerpo.", ejemplo: "Se mide con un termómetro en °C o K." },
        { termino: "Calor", definicion: "Energía que se transfiere entre cuerpos por una diferencia de temperatura.", ejemplo: "El calor que pasa del agua caliente a una cuchara." },
        { termino: "Equilibrio térmico", definicion: "Estado en que dos cuerpos en contacto alcanzan la misma temperatura.", ejemplo: "Un refresco que se entibia hasta igualar la temperatura del ambiente." },
        { termino: "Conducción", definicion: "Propagación del calor por contacto directo entre partículas, sin que la materia se desplace.", ejemplo: "Una cuchara de metal que se calienta en una sopa." },
        { termino: "Convección", definicion: "Propagación del calor por el movimiento de un fluido (líquido o gas).", ejemplo: "El aire caliente que sube en una habitación." },
        { termino: "Radiación", definicion: "Propagación del calor mediante ondas, sin necesidad de un medio material.", ejemplo: "El calor del Sol que llega a la Tierra." },
      ], actividad_final: "Identifica un ejemplo de conducción, uno de convección y uno de radiación en tu casa." } },
    { titulo: "Completa: calor, temperatura y escalas", descripcion: "Completa el texto sobre calor, temperatura y propagación.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "La ___ mide la agitación de las partículas; el ___ es la energía que se transfiere por una diferencia de temperatura. Dos cuerpos alcanzan el ___ térmico cuando igualan su temperatura. El calor se propaga por conducción, ___ y radiación.",
        huecos: [
          { posicion: 0, respuesta_correcta: "temperatura", pista: "Se mide con termómetro." },
          { posicion: 1, respuesta_correcta: "calor", pista: "Energía en tránsito." },
          { posicion: 2, respuesta_correcta: "equilibrio", pista: "Equilibrio ___ térmico." },
          { posicion: 3, respuesta_correcta: "convección", alternativas_aceptadas: ["conveccion"], pista: "Por movimiento de fluidos." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Calor y temperatura", descripcion: "Valora tu comprensión del calor, la temperatura, las escalas y la propagación.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Distingo el calor de la temperatura.", escala: escala4 },
        { descripcion: "Manejo las escalas Celsius, Kelvin y Fahrenheit y el equilibrio térmico.", escala: escala4 },
        { descripcion: "Identifico la conducción, la convección y la radiación.", escala: escala4 },
      ], reflexion_final_prompt: "¿Por qué crees que una cobija te mantiene caliente si no produce calor por sí misma?" } },
  ],

  // ════════ CNEYT-II-P05 — Energía mecánica: cinética y potencial ════════
  "CNEYT-II-P05": [
    { titulo: "Energía mecánica — Verdadero o falso", descripcion: "Distingue afirmaciones sobre energía cinética y potencial.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "La energía cinética se calcula con la fórmula Ec = ½mv².", respuesta: true, retroalimentacion: "Correcto: depende de la masa y del cuadrado de la velocidad." },
        { enunciado: "La energía potencial gravitatoria se calcula como Ep = mgh.", respuesta: true, retroalimentacion: "Correcto: depende de la masa, la gravedad y la altura." },
        { enunciado: "Si la velocidad de un cuerpo se duplica, su energía cinética también se duplica.", respuesta: false, retroalimentacion: "Falso: como depende de v², al duplicar v la energía cinética se cuadruplica." },
        { enunciado: "La energía mecánica es la suma de la energía cinética y la potencial.", respuesta: true, retroalimentacion: "Correcto: Em = Ec + Ep." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: energía mecánica", descripcion: "Aprende los términos clave sobre energía cinética y potencial.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Energía mecánica", definicion: "Suma de la energía cinética y la energía potencial de un cuerpo.", ejemplo: "La energía total de una pelota que cae." },
        { termino: "Energía cinética (Ec)", definicion: "Energía debida al movimiento; Ec = ½mv².", ejemplo: "Un balón que rueda." },
        { termino: "Energía potencial (Ep)", definicion: "Energía almacenada por la posición; la gravitatoria es Ep = mgh.", ejemplo: "Una maceta en una repisa alta." },
        { termino: "Velocidad (v)", definicion: "Rapidez con dirección con que se mueve un cuerpo; se mide en m/s.", ejemplo: "60 km/h de un auto en carretera." },
        { termino: "Gravedad (g)", definicion: "Aceleración con que la Tierra atrae a los cuerpos, cercana a 9.8 m/s².", ejemplo: "Hace que los objetos caigan." },
      ], actividad_final: "Calcula la energía potencial de un objeto de 2 kg a 5 m de altura (usa g = 9.8 m/s²)." } },
    { titulo: "Completa: energía mecánica", descripcion: "Completa el texto sobre energía cinética y potencial.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra o símbolo correcto.",
        texto_con_huecos: "La energía debida al movimiento es la energía ___, y se calcula con Ec = ½m___². La energía almacenada por la posición es la energía ___, y la gravitatoria es Ep = mg___. La suma de ambas es la energía mecánica.",
        huecos: [
          { posicion: 0, respuesta_correcta: "cinética", alternativas_aceptadas: ["cinetica"], pista: "Debida al movimiento." },
          { posicion: 1, respuesta_correcta: "v", alternativas_aceptadas: ["velocidad"], pista: "Símbolo de la velocidad (al cuadrado)." },
          { posicion: 2, respuesta_correcta: "potencial", pista: "Almacenada por la posición." },
          { posicion: 3, respuesta_correcta: "h", alternativas_aceptadas: ["altura"], pista: "Símbolo de la altura." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Energía mecánica", descripcion: "Valora tu comprensión de la energía cinética y potencial.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Calculo la energía cinética con Ec = ½mv².", escala: escala4 },
        { descripcion: "Calculo la energía potencial gravitatoria con Ep = mgh.", escala: escala4 },
        { descripcion: "Relaciono fuerza, posición, movimiento y velocidad con la energía mecánica.", escala: escala4 },
      ], reflexion_final_prompt: "¿Dónde tiene más energía potencial y dónde más energía cinética una pelota que dejas caer?" } },
  ],

  // ════════ CNEYT-II-P06 — Consumo energético, eficiencia y sustentabilidad (Complemento) ════════
  "CNEYT-II-P06": [
    { titulo: "Consumo y sustentabilidad — Verdadero o falso", descripcion: "Distingue afirmaciones sobre consumo energético, eficiencia y sustentabilidad.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "El consumo excesivo de energía puede tener impactos negativos en el ambiente.", respuesta: true, retroalimentacion: "Correcto: por ejemplo, contaminación y emisiones de gases." },
        { enunciado: "La eficiencia energética busca obtener el mismo servicio usando menos energía.", respuesta: true, retroalimentacion: "Correcto: ahorra recursos y reduce impactos." },
        { enunciado: "La sustentabilidad implica satisfacer nuestras necesidades sin comprometer a las generaciones futuras.", respuesta: true, retroalimentacion: "Correcto: esa es la idea de desarrollo sustentable." },
        { enunciado: "Apagar aparatos que no usamos no tiene ningún efecto en el consumo de energía.", respuesta: false, retroalimentacion: "Falso: pequeños hábitos reducen el consumo total." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: consumo y sustentabilidad", descripcion: "Aprende los términos clave sobre consumo energético, eficiencia y sustentabilidad.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Consumo energético", definicion: "Cantidad de energía que usan las personas, hogares, industrias o países.", ejemplo: "El consumo eléctrico que aparece en tu recibo de luz." },
        { termino: "Eficiencia energética", definicion: "Lograr el mismo resultado utilizando menos energía.", ejemplo: "Un foco LED ilumina igual gastando menos electricidad." },
        { termino: "Impacto ambiental", definicion: "Efecto que producen las actividades humanas sobre el ambiente.", ejemplo: "La contaminación por quemar combustibles fósiles." },
        { termino: "Sustentabilidad", definicion: "Uso de los recursos que satisface el presente sin comprometer el futuro.", ejemplo: "Aprovechar energías limpias y ahorrar recursos." },
      ], actividad_final: "Anota tres hábitos para reducir el consumo de energía en tu hogar." } },
    { titulo: "Completa: consumo y sustentabilidad", descripcion: "Completa el texto sobre consumo energético, eficiencia y sustentabilidad.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "El ___ excesivo de energía genera impacto ambiental. La ___ energética busca obtener el mismo servicio con menos energía. La ___ permite satisfacer nuestras necesidades sin comprometer a las generaciones ___.",
        huecos: [
          { posicion: 0, respuesta_correcta: "consumo", pista: "Cantidad de energía que usamos." },
          { posicion: 1, respuesta_correcta: "eficiencia", pista: "Mismo servicio con menos energía." },
          { posicion: 2, respuesta_correcta: "sustentabilidad", alternativas_aceptadas: ["sostenibilidad"], pista: "Sin comprometer el futuro." },
          { posicion: 3, respuesta_correcta: "futuras", pista: "Las que vendrán después." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Consumo y sustentabilidad", descripcion: "Valora tu comprensión del consumo energético, la eficiencia y la sustentabilidad.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Relaciono el consumo energético con su impacto ambiental.", escala: escala4 },
        { descripcion: "Explico la eficiencia energética con ejemplos.", escala: escala4 },
        { descripcion: "Propongo acciones de sustentabilidad en mi entorno.", escala: escala4 },
      ], reflexion_final_prompt: "¿Qué hábito vas a cambiar para ahorrar energía en tu vida diaria?" } },
  ],

  // ════════ CNEYT-II-P07 — Energías renovables y no renovables en México (Complemento) ════════
  "CNEYT-II-P07": [
    { titulo: "Energías renovables y no renovables — Verdadero o falso", descripcion: "Distingue afirmaciones sobre fuentes de energía renovables y no renovables.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "La energía solar, eólica, hidráulica y geotérmica son fuentes renovables.", respuesta: true, retroalimentacion: "Correcto: se reponen de forma natural y son más limpias." },
        { enunciado: "El petróleo, el carbón y el gas natural son combustibles fósiles no renovables.", respuesta: true, retroalimentacion: "Correcto: se agotan y contaminan más." },
        { enunciado: "México no cuenta con ningún potencial para las energías renovables.", respuesta: false, retroalimentacion: "Falso: México tiene gran potencial solar, eólico, hidráulico y geotérmico." },
        { enunciado: "Las energías renovables ayudan a reducir la contaminación frente a los combustibles fósiles.", respuesta: true, retroalimentacion: "Correcto: emiten menos gases contaminantes." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: fuentes de energía", descripcion: "Aprende los términos clave sobre energías renovables y no renovables.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Energía renovable", definicion: "Energía que proviene de fuentes que se reponen de forma natural.", ejemplo: "Solar, eólica, hidráulica y geotérmica." },
        { termino: "Energía solar", definicion: "Energía obtenida de la radiación del Sol.", ejemplo: "Los paneles fotovoltaicos." },
        { termino: "Energía eólica", definicion: "Energía obtenida del viento mediante aerogeneradores.", ejemplo: "Los parques eólicos del Istmo de Tehuantepec, en Oaxaca." },
        { termino: "Energía geotérmica", definicion: "Energía obtenida del calor interno de la Tierra.", ejemplo: "La central geotérmica de Cerro Prieto, en Baja California." },
        { termino: "Energía no renovable", definicion: "Energía de fuentes que se agotan, como los combustibles fósiles.", ejemplo: "Petróleo, carbón y gas natural." },
      ], actividad_final: "Investiga qué fuente de energía predomina en la región donde vives." } },
    { titulo: "Completa: fuentes de energía", descripcion: "Completa el texto sobre energías renovables y no renovables.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "Las energías ___ provienen de fuentes que se reponen de forma natural, como la solar, la eólica, la ___ y la geotérmica. Las energías no renovables, como los combustibles ___, se agotan y contaminan más. México tiene gran ___ para las energías limpias.",
        huecos: [
          { posicion: 0, respuesta_correcta: "renovables", pista: "Se reponen naturalmente." },
          { posicion: 1, respuesta_correcta: "hidráulica", alternativas_aceptadas: ["hidraulica"], pista: "Aprovecha el agua." },
          { posicion: 2, respuesta_correcta: "fósiles", alternativas_aceptadas: ["fosiles"], pista: "Petróleo, carbón, gas." },
          { posicion: 3, respuesta_correcta: "potencial", pista: "Capacidad o posibilidad." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Fuentes de energía", descripcion: "Valora tu comprensión de las energías renovables y no renovables en México.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Distingo energías renovables de no renovables.", escala: escala4 },
        { descripcion: "Identifico fuentes renovables (solar, eólica, hidráulica, geotérmica).", escala: escala4 },
        { descripcion: "Reconozco el potencial energético de México y su impacto ambiental.", escala: escala4 },
      ], reflexion_final_prompt: "¿Qué fuente de energía renovable crees que conviene más a tu región y por qué?" } },
  ],

  // ════════ CNEYT-II-P08 — Fenómenos energéticos y aplicaciones tecnológicas ════════
  "CNEYT-II-P08": [
    { titulo: "Fenómenos y aplicaciones — Verdadero o falso", descripcion: "Distingue afirmaciones sobre fenómenos energéticos y aplicaciones tecnológicas de la energía.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "Los conceptos de energía permiten explicar fenómenos naturales como las tormentas o el ciclo del agua.", respuesta: true, retroalimentacion: "Correcto: la energía está detrás de muchos fenómenos naturales." },
        { enunciado: "Una planta de generación eléctrica es una aplicación tecnológica de la energía.", respuesta: true, retroalimentacion: "Correcto: transforma una forma de energía en electricidad." },
        { enunciado: "El conocimiento de la energía no sirve para crear tecnología útil.", respuesta: false, retroalimentacion: "Falso: gracias a él se diseñan motores, paneles, electrodomésticos, etc." },
        { enunciado: "Explicar un fenómeno energético implica identificar las transformaciones de energía que ocurren.", respuesta: true, retroalimentacion: "Correcto: se analiza cómo cambia la energía de forma." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: fenómenos y tecnología de la energía", descripcion: "Aprende los términos clave sobre fenómenos energéticos y aplicaciones tecnológicas.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Fenómeno energético", definicion: "Suceso natural o artificial en el que intervienen transformaciones de energía.", ejemplo: "Un rayo durante una tormenta." },
        { termino: "Aplicación tecnológica", definicion: "Uso del conocimiento científico para crear dispositivos o procesos útiles.", ejemplo: "Un panel solar que produce electricidad." },
        { termino: "Máquina térmica", definicion: "Dispositivo que transforma calor en trabajo mecánico.", ejemplo: "El motor de un automóvil." },
        { termino: "Generador eléctrico", definicion: "Dispositivo que transforma energía mecánica en energía eléctrica.", ejemplo: "El generador de una central hidroeléctrica." },
      ], actividad_final: "Elige un aparato tecnológico y explica qué transformación de energía realiza." } },
    { titulo: "Completa: fenómenos y aplicaciones", descripcion: "Completa el texto sobre fenómenos energéticos y aplicaciones tecnológicas.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "Los conceptos de energía permiten ___ fenómenos naturales y tecnológicos. Una ___ térmica transforma calor en trabajo, y un generador transforma energía ___ en eléctrica. Explicar un fenómeno energético implica identificar las ___ de energía que ocurren.",
        huecos: [
          { posicion: 0, respuesta_correcta: "explicar", alternativas_aceptadas: ["entender", "comprender"], pista: "Dar razón de algo." },
          { posicion: 1, respuesta_correcta: "máquina", alternativas_aceptadas: ["maquina"], pista: "Máquina ___ (térmica)." },
          { posicion: 2, respuesta_correcta: "mecánica", alternativas_aceptadas: ["mecanica"], pista: "Energía del movimiento." },
          { posicion: 3, respuesta_correcta: "transformaciones", alternativas_aceptadas: ["transformacion", "transformación"], pista: "Cambios de forma de la energía." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Fenómenos y aplicaciones", descripcion: "Valora tu capacidad de explicar fenómenos energéticos y aplicaciones tecnológicas.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Explico fenómenos naturales usando conceptos de energía.", escala: escala4 },
        { descripcion: "Identifico aplicaciones tecnológicas de la energía (máquinas térmicas, generadores).", escala: escala4 },
        { descripcion: "Reconozco las transformaciones de energía en un fenómeno o dispositivo.", escala: escala4 },
      ], reflexion_final_prompt: "¿Qué aplicación tecnológica de la energía te parece más importante para tu comunidad y por qué?" } },
  ],
};

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
