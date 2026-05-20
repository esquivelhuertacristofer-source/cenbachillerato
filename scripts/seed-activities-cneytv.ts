/**
 * Seed de actividades pedagógicas para CNEYT-V (CNEyT V — Física Clásica, Semestre 5).
 * 8 propósitos × 3 actividades = 24 actividades. estado='publicada'.
 * Tipos: lectura, video_con_preguntas, simulacion, ejercicio_matematico,
 *        quiz_multiple_opcion, reflexion_escrita, autoevaluacion, infografia
 * Uso: npx tsx scripts/seed-activities-cneytv.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🌱 Seed actividades CNEYT-V — Física Clásica\n");

  const progs = await getProgresionesDeUAC(sb, "CNEYT-V");
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
      descripcion: "Práctica de verificación y ejercicio científico.",
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
      descripcion: "Aplicación crítica y cierre del propósito formativo.",
      tipo: tiposA3[n - 1],
      progresion_id: p.id,
      xp: 20,
      estado: "publicada",
      contenido: contenidosA3[n - 1],
    });
    a3ok ? ok++ : fail++;
  }

  log(`\n✅ CNEYT-V: ${ok} actividades insertadas, ${fail} fallidas.\n`);
}

const titulos = [
  { a1: "Leyes de Newton: inercia, F=ma y acción-reacción en la vida cotidiana", a2: "Simulación de fuerzas: diagrama de cuerpo libre interactivo", a3: "¿Cuánto sabes sobre las leyes de Newton?" },
  { a1: "MRU y MRUA: del movimiento uniforme a la aceleración constante", a2: "Calculando cinemática: posición, velocidad y aceleración", a3: "¿Verdadero o falso? Cinemática y gráficas de movimiento" },
  { a1: "Gravitación universal: de la manzana de Newton a los satélites mexicanos", a2: "Cálculos de gravitación: fuerza, peso y órbitas", a3: "Reflexión: ¿México en el espacio? La Agencia Espacial Mexicana y los satélites" },
  { a1: "El movimiento ondulatorio: sonido, mar y terremotos", a2: "Simulación de ondas: amplitud, frecuencia y longitud de onda", a3: "¿Cuánto sabes sobre ondas mecánicas y sonido?" },
  { a1: "El espectro electromagnético: de las ondas de radio a los rayos gamma", a2: "¿Cuánto sabes sobre el espectro electromagnético y sus aplicaciones?", a3: "Reflexión: tecnología electromagnética en mi vida cotidiana" },
  { a1: "Óptica geométrica: reflexión, refracción y la ley de Snell", a2: "Simulación de óptica: lentes, espejos y formación de imágenes", a3: "Autoevaluación: ¿domino los fenómenos ópticos?" },
  { a1: "Electromagnetismo: campos, inducción y la tecnología que nos rodea", a2: "Calculando electromagnetismo: Ohm, Faraday y motores", a3: "¿Verdadero o falso? Electromagnetismo en la tecnología cotidiana" },
  { a1: "Física y ética: energía nuclear, telecomunicaciones y sociedad", a2: "¿Cuánto sabes sobre la ética del desarrollo tecnológico?", a3: "Reflexión: ¿debería México expandir su energía nuclear?" },
];

const tiposA1 = ["lectura", "lectura", "lectura", "lectura", "infografia", "lectura", "lectura", "video_con_preguntas"] as const;
const tiposA2 = ["simulacion", "ejercicio_matematico", "ejercicio_matematico", "simulacion", "quiz_multiple_opcion", "simulacion", "ejercicio_matematico", "quiz_multiple_opcion"] as const;
const tiposA3 = ["quiz_multiple_opcion", "quiz_verdadero_falso", "reflexion_escrita", "quiz_multiple_opcion", "reflexion_escrita", "autoevaluacion", "quiz_verdadero_falso", "reflexion_escrita"] as const;

// ── A1 ──────────────────────────────────────────────────────────────────────────
const contenidosA1 = [
  { // P01 — lectura (Leyes de Newton con ejemplos mexicanos)
    titulo: "Leyes de Newton: inercia, F=ma y acción-reacción en la vida cotidiana",
    texto: `Isaac Newton formuló en 1687, en su obra Principia Mathematica, tres leyes que describen el movimiento de los cuerpos y las fuerzas que los producen. Estas leyes son la base de la mecánica clásica y siguen siendo esenciales para entender desde el movimiento de un automóvil en la autopista hasta el diseño de estructuras antisísmicas.\n\nLa Primera Ley de Newton, o Ley de la Inercia, establece que un cuerpo permanece en reposo o en movimiento rectilíneo uniforme a menos que una fuerza neta actúe sobre él. La inercia es la resistencia de un cuerpo a cambiar su estado de movimiento y es proporcional a su masa. Ejemplo concreto: un camión cisterna de PEMEX que circula por la carretera México-Querétaro a 90 km/h lleva una masa de 30,000 kg. Si el conductor frena de golpe, la carga de líquido dentro del tanque tiende a continuar su movimiento hacia adelante por inercia —razón por la cual estos vehículos tienen deflectores internos para controlar el movimiento del fluido. En los accidentes viales, los ocupantes de un automóvil que no portan cinturón de seguridad son proyectados hacia adelante por exactamente este principio.\n\nLa Segunda Ley de Newton establece que la fuerza neta que actúa sobre un cuerpo es igual a su masa multiplicada por la aceleración que adquiere: F = ma. Esta ley es cuantitativa: nos dice exactamente cuánta aceleración produce una fuerza dada sobre una masa conocida. Ejemplo mexicano: cuando un futbolista del Club América patea un balón de fútbol (masa ≈ 0.43 kg) con una fuerza de 215 N, la aceleración que imprime al balón es a = F/m = 215/0.43 ≈ 500 m/s². El balón sale disparado a alta velocidad en décimas de segundo. En ingeniería, esta misma ley permite calcular las fuerzas necesarias para que los elevadores del Edificio Torre Latinoamericana (Ciudad de México, 44 pisos) aceleren con pasajeros sin superar la capacidad estructural de los cables y motores.\n\nLa Tercera Ley de Newton, o Ley de Acción-Reacción, establece que cuando un cuerpo A ejerce una fuerza sobre un cuerpo B, este ejerce sobre A una fuerza de igual magnitud, misma dirección y sentido contrario. Las fuerzas siempre aparecen en pares sobre cuerpos distintos. Ejemplo: los motores de cohete funcionan exactamente por esta ley —expulsan gases hacia atrás (acción) y el cohete es impulsado hacia adelante (reacción). La Agencia Espacial Mexicana (AEM) trabaja en proyectos de satélites que se posicionan mediante pequeños propulsores basados en este principio.\n\nLos diagramas de cuerpo libre (DCL) son herramientas que representan todas las fuerzas que actúan sobre un objeto: el peso (W = mg, hacia abajo), la fuerza normal (N, perpendicular a la superficie, hacia arriba en plano horizontal), la tensión (T, a lo largo de cuerdas o cables), y la fricción (f, paralela a la superficie, oponiéndose al movimiento). En un plano inclinado, el peso se descompone en una componente paralela al plano (W sin θ, que impulsa hacia abajo por el plano) y una componente perpendicular (W cos θ, igual y opuesta a la normal). La fricción tiene dos variedades: estática (impide el movimiento antes de que comience, f_e ≤ μ_e · N) y cinética (actúa durante el movimiento, f_c = μ_c · N, con μ_c < μ_e siempre).\n\nAplicación sísmica: durante el sismo del 19 de septiembre de 2017 en México (M7.1), los edificios experimentaron fuerzas horizontales masivas. Las normas sísmicas del Reglamento de Construcciones del DF (hoy CDMX) utilizan la Segunda Ley de Newton para calcular las fuerzas sísmicas de diseño: F_sísmica = masa del edificio × aceleración del suelo. Edificios correctamente diseñados con marcos dúctiles y aisladores sísmicos pudieron disipar estas fuerzas sin colapsar, salvando miles de vidas.`,
    fuente: "Material elaborado para CEN Bachillerato — CNEYT-V. Ref: Serway & Jewett, Física para Ciencias e Ingeniería (9ª ed.); UNAM CENAPRED.",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 12,
    preguntas_comprension: [
      { pregunta: "¿Qué establece la Primera Ley de Newton y cómo se relaciona con la inercia? Da el ejemplo del camión de PEMEX.", respuesta_guia: "La Primera Ley establece que un cuerpo mantiene su estado de reposo o movimiento rectilíneo uniforme a menos que actúe una fuerza neta sobre él. La inercia es la resistencia al cambio de movimiento. Un camión cisterna de PEMEX a 90 km/h tiene enorme inercia (30,000 kg): al frenar, la carga líquida continúa su movimiento hacia adelante por inercia." },
      { pregunta: "Un futbolista patea un balón de 0.43 kg con 215 N de fuerza. ¿Qué aceleración imprime al balón? ¿Qué ley aplicas?", respuesta_guia: "Segunda Ley de Newton: a = F/m = 215 N / 0.43 kg ≈ 500 m/s². El balón adquiere una aceleración enorme en el instante del contacto, lo que le da su alta velocidad de salida." },
      { pregunta: "Explica la Tercera Ley de Newton con el ejemplo de los motores de cohete.", respuesta_guia: "La Tercera Ley establece que las fuerzas siempre aparecen en pares: si A ejerce fuerza sobre B, B ejerce sobre A una fuerza igual en magnitud y dirección, pero sentido contrario. En un cohete, los gases son expulsados hacia atrás (acción) y el cohete es impulsado hacia adelante (reacción)." },
      { pregunta: "¿Cómo se aplica la Segunda Ley de Newton en el diseño sísmico de edificios después del sismo de 2017?", respuesta_guia: "Las normas sísmicas usan F_sísmica = masa × aceleración del suelo. Al conocer la masa del edificio y la aceleración esperada del suelo, los ingenieros calculan las fuerzas de diseño para que la estructura resista sin colapsar. El sismo del 19-S 2017 (M7.1) validó estos cálculos en edificios bien diseñados." },
    ],
  },
  { // P02 — lectura (MRU y MRUA)
    titulo: "MRU y MRUA: del movimiento uniforme a la aceleración constante",
    texto: `La cinemática es la rama de la física que describe el movimiento de los cuerpos sin analizar las causas que lo producen. Sus dos modelos fundamentales en una dimensión son el Movimiento Rectilíneo Uniforme (MRU) y el Movimiento Rectilíneo Uniformemente Acelerado (MRUA).\n\nEl Movimiento Rectilíneo Uniforme (MRU) describe un cuerpo que se desplaza en línea recta a velocidad constante. Si la velocidad no cambia, la aceleración es cero. La ecuación cinemática del MRU es: x = x₀ + vt, donde x es la posición final, x₀ es la posición inicial, v es la velocidad (constante) y t es el tiempo. Ejemplo mexicano: el Tren Suburbano de la CDMX que conecta Buenavista con Cuautitlán circula en sus tramos de vía libre a 80 km/h (≈ 22.2 m/s) de manera aproximadamente uniforme. En 3 minutos (180 s) recorre: x = 0 + 22.2 × 180 = 3,996 m ≈ 4 km. En la gráfica posición-tiempo del MRU, la curva es una línea recta con pendiente igual a v. En la gráfica velocidad-tiempo, es una línea horizontal (velocidad constante).\n\nEl Movimiento Rectilíneo Uniformemente Acelerado (MRUA) describe un cuerpo que experimenta una aceleración constante. Sus ecuaciones cinemáticas son:\n• Velocidad: v = v₀ + at\n• Posición: x = x₀ + v₀t + ½at²\n• Relación sin tiempo: v² = v₀² + 2a(x - x₀)\n\nDonde v₀ es la velocidad inicial, a es la aceleración (constante), t es el tiempo y x - x₀ es el desplazamiento. En la gráfica posición-tiempo del MRUA, la curva es una parábola (el desplazamiento varía cuadráticamente con t). En la gráfica velocidad-tiempo, es una línea recta con pendiente igual a a.\n\nLa caída libre es el ejemplo más importante de MRUA: todos los cuerpos (sin considerar la resistencia del aire) caen con la misma aceleración gravitacional a = g = 9.8 m/s². Ejemplo mexicano: el Ángel de la Independencia en Paseo de la Reforma tiene una altura aproximada de 23 m desde la base hasta la cúspide. Si un objeto cae desde la punta del Ángel, el tiempo de caída se calcula con: h = ½gt² → t = √(2h/g) = √(2 × 23 / 9.8) = √(4.69) ≈ 2.17 s. Al llegar al suelo, su velocidad es: v = gt = 9.8 × 2.17 ≈ 21.3 m/s ≈ 76.6 km/h. Esto ilustra por qué los andamios de construcción deben estar asegurados: un objeto pequeño cayendo desde esa altura puede causar graves daños.\n\nDiferencias clave entre MRU y MRUA: en el MRU, v = constante y a = 0; la distancia recorrida en intervalos iguales de tiempo es siempre la misma. En el MRUA, a = constante y v aumenta o disminuye uniformemente; la distancia recorrida en intervalos iguales de tiempo aumenta (si acelera) o disminuye (si desacelera). Al frenar un automóvil, la distancia de frenado es proporcional al cuadrado de la velocidad inicial (d = v₀²/2a), razón por la cual a 100 km/h la distancia de frenado es cuatro veces mayor que a 50 km/h —un dato crítico para la seguridad vial en las carreteras mexicanas.`,
    fuente: "Material elaborado para CEN Bachillerato — CNEYT-V. Ref: Serway & Jewett, Física (9ª ed.); SCT México, estadísticas de velocidad en carreteras.",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 11,
    preguntas_comprension: [
      { pregunta: "¿Qué ecuación describe el MRU y qué significa cada variable? Aplícala al ejemplo del Tren Suburbano.", respuesta_guia: "x = x₀ + vt. x₀ = posición inicial, v = velocidad constante, t = tiempo. Para el Tren Suburbano: v = 22.2 m/s, t = 180 s → x = 0 + 22.2 × 180 = 3,996 m ≈ 4 km recorridos en 3 minutos." },
      { pregunta: "¿Cuánto tarda en caer un objeto desde la punta del Ángel de la Independencia (h=23 m) y con qué velocidad llega al suelo?", respuesta_guia: "t = √(2h/g) = √(2×23/9.8) ≈ 2.17 s. Velocidad al llegar: v = gt = 9.8 × 2.17 ≈ 21.3 m/s ≈ 76.6 km/h." },
      { pregunta: "¿Por qué la distancia de frenado de un automóvil a 100 km/h es cuatro veces mayor que a 50 km/h?", respuesta_guia: "Porque d = v₀²/2a: la distancia es proporcional al cuadrado de la velocidad. Al duplicar la velocidad (50→100 km/h), la distancia se cuadruplica (2² = 4). Es el principio físico detrás de los límites de velocidad en carreteras." },
      { pregunta: "¿Qué forma tienen las gráficas posición-tiempo y velocidad-tiempo para el MRU y para el MRUA?", respuesta_guia: "MRU: posición-tiempo es línea recta (pendiente = v); velocidad-tiempo es línea horizontal. MRUA: posición-tiempo es parábola; velocidad-tiempo es línea recta con pendiente = a." },
    ],
  },
  { // P03 — lectura (Gravitación universal y satélites mexicanos)
    titulo: "Gravitación universal: de la manzana de Newton a los satélites mexicanos",
    texto: `En 1687, Isaac Newton propuso que la misma fuerza que hace caer una manzana al suelo es la que mantiene a la Luna en órbita alrededor de la Tierra: la gravedad universal. Su Ley de Gravitación Universal establece que dos masas se atraen con una fuerza directamente proporcional al producto de sus masas e inversamente proporcional al cuadrado de la distancia que las separa:\n\nF = G · m₁ · m₂ / r²\n\nDonde G = 6.674 × 10⁻¹¹ N·m²/kg² es la constante de gravitación universal, m₁ y m₂ son las masas de los dos cuerpos y r es la distancia entre sus centros. Esta fuerza es siempre atractiva y actúa a distancia, sin contacto físico.\n\nEl peso de un cuerpo es la fuerza gravitacional que ejerce la Tierra sobre él: W = mg, donde g es la aceleración gravitacional de la superficie terrestre (g_Tierra ≈ 9.8 m/s²). Sin embargo, g varía de un cuerpo celeste a otro. En la Luna, g_Luna ≈ 1.62 m/s²: una persona de 70 kg pesa 70 × 1.62 = 113.4 N ≈ 11.6 kg-fuerza (aproximadamente 1/6 de su peso en la Tierra). En Marte, g_Marte ≈ 3.71 m/s² (≈ 38% de la Tierra). En Júpiter, g_Júpiter ≈ 24.8 m/s² (≈ 2.5 veces la Tierra): esa misma persona pesaría 1,736 N ≈ 177 kg-fuerza. La masa, en cambio, siempre es la misma (70 kg en cualquier planeta), ya que es una propiedad intrínseca del cuerpo.\n\nLas Tres Leyes de Kepler (formuladas entre 1609 y 1619, antes de Newton) describen el movimiento de los planetas:\n1ª Ley (de las órbitas): los planetas se mueven en órbitas elípticas con el Sol en uno de los focos.\n2ª Ley (de las áreas): la línea que une un planeta con el Sol barre áreas iguales en tiempos iguales (los planetas van más rápido cuando están más cerca del Sol).\n3ª Ley (de los períodos): el cuadrado del período orbital es proporcional al cubo del semieje mayor de la órbita (T² ∝ a³). Newton demostró que las leyes de Kepler son consecuencias matemáticas de su Ley de Gravitación Universal.\n\nLa órbita geoestacionaria es aquella en la que un satélite tiene exactamente el mismo período orbital que la rotación de la Tierra (T = 24 h = 86,400 s). Esto ocurre a una altura de 35,786 km sobre el ecuador terrestre. Un satélite en esta órbita parece fijo en el cielo desde cualquier punto de la Tierra, lo que lo hace ideal para telecomunicaciones y televisión satelital.\n\nMéxico tiene una larga historia satelital. En 1985 se lanzaron los satélites Morelos I y II (desde el transbordador espacial Discovery), utilizados para telecomunicaciones nacionales. Posteriormente vinieron Satmex 5 (1998), Morelos 3 (2015) y la constelación Mexsat (Bicentenario, Morelos 3), que actualmente provee servicios de telecomunicaciones a zonas rurales y remotas de México. La Agencia Espacial Mexicana (AEM) fue fundada en 2010 bajo la Secretaría de Comunicaciones y Transportes; coordina la política espacial del país, el desarrollo de capacidades tecnológicas y la participación en proyectos internacionales. México forma parte de la Agencia Espacial Latinoamericana y del Caribe (ALCE).`,
    fuente: "Material elaborado para CEN Bachillerato — CNEYT-V. Ref: Serway & Jewett, Física (9ª ed.); AEM — Agencia Espacial Mexicana; SCT México.",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 12,
    preguntas_comprension: [
      { pregunta: "Escribe la Ley de Gravitación Universal e identifica cada variable. ¿Qué significa que F varía con 1/r²?", respuesta_guia: "F = G·m₁·m₂/r². G=constante gravitacional, m₁ y m₂=masas de los cuerpos, r=distancia entre centros. Al duplicar la distancia, la fuerza se reduce a 1/4 (cuatro veces menos), porque r aparece elevado al cuadrado en el denominador." },
      { pregunta: "¿Por qué una persona pesa menos en la Luna y más en Júpiter, aunque su masa no cambia?", respuesta_guia: "El peso W=mg depende de la aceleración gravitacional del cuerpo celeste (g_Luna≈1.62, g_Júpiter≈24.8 m/s²). La masa (70 kg) es constante. En la Luna pesa ≈113 N; en Júpiter ≈1,736 N. La masa mide la cantidad de materia; el peso mide la fuerza gravitacional que actúa sobre esa masa." },
      { pregunta: "¿Qué es la órbita geoestacionaria y por qué es ideal para satélites de telecomunicaciones?", respuesta_guia: "Es la órbita circular a 35,786 km de altura sobre el ecuador terrestre donde el período orbital del satélite es igual al período de rotación de la Tierra (24 h). El satélite parece fijo en el cielo, lo que permite que las antenas parabólicas apunten siempre al mismo punto sin necesidad de seguimiento." },
      { pregunta: "¿Qué son los satélites Morelos y Mexsat, y cuál es el papel de la AEM en la política espacial mexicana?", respuesta_guia: "Morelos I y II (lanzados en 1985) fueron los primeros satélites mexicanos. Mexsat (Bicentenario, Morelos 3) son satélites actuales de telecomunicaciones. La AEM (fundada 2010) coordina la política espacial nacional, el desarrollo tecnológico y la participación de México en proyectos internacionales como la ALCE." },
    ],
  },
  { // P04 — lectura (Movimiento ondulatorio)
    titulo: "El movimiento ondulatorio: sonido, mar y terremotos",
    texto: `Una onda es una perturbación que se propaga por un medio (o por el vacío, en el caso de las ondas electromagnéticas) transportando energía sin transportar materia. El movimiento ondulatorio está presente en la naturaleza de manera omnipresente: el sonido que escuchas, las olas del mar, los sismos que sacuden a México, y la luz que te permite leer estas líneas son todos fenómenos ondulatorios.\n\nLas ondas se clasifican según la relación entre la dirección de la perturbación y la dirección de propagación:\n• Ondas transversales: la perturbación es perpendicular a la dirección de propagación. Ejemplos: ondas en una cuerda tensa, ondas sísmicas tipo S (corte), ondas de luz.\n• Ondas longitudinales: la perturbación es paralela a la dirección de propagación. Ejemplos: ondas de sonido, ondas sísmicas tipo P (compresión).\n\nLos parámetros fundamentales de una onda son:\n• Amplitud (A): la máxima perturbación respecto al equilibrio. Determina la intensidad (energía) de la onda. En sonido, mayor amplitud = mayor volumen.\n• Período (T): tiempo que tarda la onda en completar un ciclo completo, medido en segundos.\n• Frecuencia (f): número de ciclos completos por segundo, f = 1/T, medida en Hz (hertz). En sonido, mayor frecuencia = tono más agudo.\n• Longitud de onda (λ): distancia entre dos puntos consecutivos en fase (ej. cresta a cresta), medida en metros.\n• Velocidad de propagación (v): velocidad a la que se desplaza la perturbación. Relación fundamental: v = λ · f.\n\nEl sonido es una onda mecánica longitudinal que requiere un medio material para propagarse (no hay sonido en el vacío). La velocidad del sonido en el aire a 20°C es aproximadamente 340 m/s. En agua, el sonido viaja ≈1,480 m/s (más rápido, porque el agua es menos compresible); en sólidos, puede superar los 5,000 m/s.\n\nMéxico es uno de los países más sísmicamente activos del mundo. Los terremotos generan dos tipos de ondas sísmicas que viajan a velocidades distintas:\n• Ondas P (primarias o de compresión): son longitudinales, viajan a ≈8 km/s en la corteza y son las primeras en detectarse. Son menos destructivas pero se propagan por sólidos, líquidos y gases.\n• Ondas S (secundarias o de corte): son transversales, viajan a ≈4 km/s y son más destructivas. Solo se propagan por sólidos (no pasan por el núcleo líquido de la Tierra, lo que sirvió para descubrir su estructura interna).\n\nEl Sistema de Alerta Sísmica Mexicano (SASMEX), operado por el CIRES, aprovecha exactamente la diferencia de velocidad entre las ondas P y S. Sus sensores en la costa del Pacífico (Guerrero, Oaxaca) detectan las ondas P de un terremoto (que llegan primero, siendo más rápidas). Al detectarlas, el sistema transmite una alerta a velocidad de la luz (señal de radio/celular) a la Ciudad de México antes de que lleguen las destructivas ondas S (que viajan más lento). Este margen de 40-120 segundos puede ser suficiente para evacuar edificios, detener el metro y preparar hospitales.\n\nEl Efecto Doppler describe el cambio en la frecuencia percibida de una onda cuando la fuente o el receptor están en movimiento relativo. Cuando una ambulancia de la Cruz Roja Mexicana se acerca, las ondas de sonido se comprimen (mayor frecuencia, tono más agudo); cuando se aleja, las ondas se expanden (menor frecuencia, tono más grave). Los radares de velocidad en las carreteras mexicanas (SCT) usan el Efecto Doppler con ondas de radio: emiten una onda de frecuencia conocida y miden la diferencia de frecuencia del eco para calcular la velocidad del vehículo.`,
    fuente: "Material elaborado para CEN Bachillerato — CNEYT-V. Ref: Serway & Jewett, Física (9ª ed.); CIRES — SASMEX; Cenapred.",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 12,
    preguntas_comprension: [
      { pregunta: "¿Cuál es la diferencia entre una onda transversal y una longitudinal? Da un ejemplo sísmico de cada tipo.", respuesta_guia: "Transversal: perturbación perpendicular a propagación (ej. ondas S sísmicas). Longitudinal: perturbación paralela a propagación (ej. ondas P sísmicas). Las ondas P viajan ≈8 km/s y son compresivas; las ondas S viajan ≈4 km/s y son de corte, más destructivas." },
      { pregunta: "Si una onda de sonido tiene frecuencia 680 Hz y velocidad 340 m/s, ¿cuál es su longitud de onda?", respuesta_guia: "v = λ·f → λ = v/f = 340/680 = 0.5 m. La longitud de onda es de 50 cm." },
      { pregunta: "¿Cómo funciona el SASMEX y por qué puede alertar a la CDMX antes de que lleguen las ondas destructivas?", respuesta_guia: "El SASMEX detecta las ondas P (más rápidas, ≈8 km/s, menos destructivas) en la costa del Pacífico. Transmite la alerta a velocidad de la luz (señal de radio) a la CDMX antes de que lleguen las ondas S (≈4 km/s, más destructivas). La diferencia de velocidad da un margen de 40-120 segundos para evacuar." },
      { pregunta: "¿Qué es el Efecto Doppler y cómo lo usan los radares de velocidad en México?", respuesta_guia: "Es el cambio en la frecuencia percibida de una onda cuando hay movimiento relativo entre fuente y receptor. Los radares emiten ondas de radio de frecuencia conocida; el eco de un automóvil en movimiento regresa con una frecuencia diferente. La diferencia de frecuencias permite calcular la velocidad del vehículo." },
    ],
  },
  { // P05 — infografia (Espectro electromagnético)
    titulo: "El espectro electromagnético: de las ondas de radio a los rayos gamma",
    url_imagen: "/placeholder/infografia.svg",
    descripcion_accesible: "Infografía del espectro electromagnético ordenado de menor a mayor frecuencia/energía: ondas de radio (AM/FM, WiFi), microondas (hornos, 5G), infrarrojo (control remoto, cámaras térmicas), luz visible (colores del arcoíris), ultravioleta (quemaduras solares, esterilización UV), rayos X (diagnóstico médico), rayos gamma (radioterapia). Cada región muestra su longitud de onda típica y una aplicación concreta.",
    puntos_clave: [
      "Ondas de radio (λ > 1 mm, f < 300 GHz): las de mayor longitud de onda y menor energía. Aplicaciones: radio AM (535-1605 kHz) y FM (88-108 MHz) transmitidas por el IFT (Instituto Federal de Telecomunicaciones); televisión abierta; telefonía celular 4G/5G. El IFT regula y concesiona el espectro radioeléctrico nacional. Sin ondas de radio, no habría teléfonos celulares ni internet inalámbrico en México.",
      "Microondas (λ 1 mm – 1 m): usadas en hornos de microondas (2.45 GHz, hacen vibrar las moléculas de agua calentando los alimentos), redes WiFi (2.4 GHz y 5 GHz), satélites de telecomunicaciones (Mexsat), redes 5G y radares meteorológicos del SMN (Servicio Meteorológico Nacional) para detectar lluvia.",
      "Radiación infrarroja (λ 700 nm – 1 mm): emitida por cualquier cuerpo con temperatura superior al cero absoluto. Aplicaciones: controles remotos de televisión (850-940 nm); cámaras termográficas usadas por el IMSS y hospitales para detectar inflamaciones; visión nocturna en dispositivos militares; calefacción por infrarrojos; sensores de movimiento (portones automáticos).",
      "Luz visible (λ 380-750 nm): la única región del espectro que el ojo humano puede detectar. Dentro de ella, los colores van del violeta (λ ≈ 380 nm, mayor frecuencia/energía) al rojo (λ ≈ 750 nm, menor frecuencia/energía). El arcoíris y la dispersión por prismas nos muestran que la luz blanca es la superposición de todos estos colores.",
      "Radiación ultravioleta (λ 10-380 nm): tiene mayor energía que la luz visible. El Sol emite UV; la capa de ozono (O₃) en la estratósfera filtra la mayor parte del UV-B y UV-C peligrosos. Aplicaciones: esterilización UV en hospitales (UV-C mata bacterias y virus); detectores de billetes falsos; lámparas bronceadoras. Exceso de UV-B: quemaduras solares y cáncer de piel. La COFEPRIS regula el uso de lámparas UV en México.",
      "Rayos X (λ 0.01-10 nm): radiación ionizante de alta energía que atraviesa tejidos blandos pero es absorbida por huesos y metales. El IMSS y el ISSSTE realizan millones de radiografías anuales para diagnóstico de fracturas, enfermedades pulmonares (tuberculosis) y odontología. Dosis elevadas son dañinas: los técnicos de rayos X usan dosímetros y delantales de plomo. En puertos y aeropuertos, los escáneres de equipaje usan rayos X.",
      "Rayos gamma (λ < 0.01 nm): la radiación electromagnética de mayor energía y frecuencia. Son emitidos por núcleos radiactivos en desintegración nuclear. El INER (Instituto Nacional de Investigaciones Nucleares) de México usa rayos gamma en radioterapia para tratar tumores cancerosos (cobaltoterapia). También se usan en esterilización de alimentos y dispositivos médicos (irradiación de materiales). Debido a su alta energía ionizante, requieren blindaje de plomo o concreto denso.",
    ],
    fuente: "MCCEMS 2025 — CNEYT-V. Física. Ref: IFT, IMSS, INER, COFEPRIS.",
  },
  { // P06 — lectura (Óptica geométrica)
    titulo: "Óptica geométrica: reflexión, refracción y la ley de Snell",
    texto: `La óptica geométrica estudia el comportamiento de la luz cuando interactúa con superficies reflectoras y refractantes, usando el modelo de rayos de luz (líneas rectas) para trazar trayectorias. Tres fenómenos fundamentales la describen: la reflexión, la refracción y la dispersión.\n\nLa reflexión ocurre cuando un rayo de luz golpea una superficie y rebota. La Ley de Reflexión establece que el ángulo de incidencia (θᵢ) es igual al ángulo de reflexión (θᵣ), ambos medidos respecto a la normal a la superficie: θᵢ = θᵣ. Los espejos planos producen imágenes virtuales, derechas y del mismo tamaño que el objeto. Los espejos cóncavos (como los de telescopios y linternas de automóvil) concentran los rayos en un foco y pueden producir imágenes reales o virtuales según la posición del objeto. Los espejos convexos (retrovisores de automóvil, espejos de seguridad en tiendas) producen siempre imágenes virtuales, menores y con mayor campo visual.\n\nLa refracción ocurre cuando la luz pasa de un medio a otro con distinto índice de refracción. El índice de refracción (n) de un medio es la relación entre la velocidad de la luz en el vacío (c = 3×10⁸ m/s) y la velocidad de la luz en ese medio (v): n = c/v. Valores típicos: aire n ≈ 1.00, agua n = 1.33, vidrio n ≈ 1.50, diamante n = 2.42. Cuanto mayor el índice, más lenta viaja la luz en ese medio.\n\nLa Ley de Snell (o Ley de Snell-Descartes) describe cuánto se dobla un rayo de luz al pasar de un medio a otro: n₁ · sen θ₁ = n₂ · sen θ₂. Cuando la luz pasa de un medio menos denso a uno más denso (ej. de aire a vidrio), se dobla hacia la normal (θ₂ < θ₁). Cuando pasa de más denso a menos denso (ej. de vidrio a aire), se aleja de la normal. Si el ángulo de incidencia supera el ángulo crítico θ_c = arcsen(n₂/n₁) (con n₁ > n₂), la luz no se refracta y se refleja completamente: esto es la reflexión total interna.\n\nLas lentes utilizan la refracción para modificar la trayectoria de los rayos de luz y formar imágenes. Las lentes convergentes (convexas) hacen que los rayos paralelos converjan en un punto llamado foco (f > 0). Las lentes divergentes (cóncavas) hacen que los rayos diverjan como si vinieran de un foco virtual (f < 0). La ecuación de las lentes (ecuación de Gauss) es: 1/f = 1/d_o + 1/d_i, donde d_o es la distancia objeto y d_i la distancia imagen. El ojo humano es el sistema óptico más sofisticado de la naturaleza: la córnea realiza la mayor parte de la refracción, y el cristalino (una lente biológica flexible) ajusta el foco para ver a distintas distancias (acomodación). La miopía (el globo ocular es demasiado largo o la córnea muy curvada) se corrige con lentes divergentes. La hipermetropía (globo muy corto) se corrige con lentes convergentes.\n\nLa reflexión total interna hace posible la fibra óptica: un rayo de luz que viaja dentro de un núcleo de vidrio de alto índice de refracción no puede escapar si el ángulo de incidencia supera el ángulo crítico. La luz rebota indefinidamente por el interior de la fibra, transportando información digital (pulsos de luz) con pérdidas mínimas a lo largo de kilómetros. Las redes de fibra óptica de TELMEX y Totalplay en México usan este principio para proveer internet de banda ancha a millones de hogares.\n\nLa dispersión ocurre porque el índice de refracción depende de la longitud de onda (frecuencia) de la luz. En el vidrio de un prisma, la luz violeta (λ menor) se refracta más que la luz roja (λ mayor), separando la luz blanca en el espectro de colores del arcoíris. Los arcoíris naturales se forman por reflexión y dispersión dentro de millones de gotas de agua en suspensión, formando un arco a 42° del antisolar.`,
    fuente: "Material elaborado para CEN Bachillerato — CNEYT-V. Ref: Hecht, Óptica (4ª ed.); Serway & Jewett, Física (9ª ed.).",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 12,
    preguntas_comprension: [
      { pregunta: "Enuncia la Ley de Reflexión y la Ley de Snell. ¿Qué diferencia hay entre reflexión especular y reflexión difusa?", respuesta_guia: "Reflexión: θᵢ = θᵣ. Snell: n₁·senθ₁ = n₂·senθ₂. Reflexión especular (espejos pulidos): los rayos se reflejan todos en la misma dirección formando imagen. Reflexión difusa (pared rugosa): los rayos se dispersan en todas direcciones; no forma imagen pero hace visible la superficie." },
      { pregunta: "Un rayo de luz pasa de agua (n=1.33) a vidrio (n=1.50) con ángulo de incidencia de 30°. ¿Cuál es el ángulo de refracción?", respuesta_guia: "Snell: 1.33·sen30° = 1.50·senθ₂ → 1.33×0.5 = 1.50·senθ₂ → senθ₂ = 0.665/1.50 = 0.443 → θ₂ = arcsen(0.443) ≈ 26.3°. El rayo se dobla hacia la normal al pasar a un medio más denso." },
      { pregunta: "¿Cómo corrige la miopía una lente divergente? ¿Por qué el ojo miope forma la imagen antes de la retina?", respuesta_guia: "En el ojo miope, el globo es muy largo o la córnea muy curvada, por lo que los rayos convergen antes de la retina. Una lente divergente (f < 0) hace que los rayos se 'abran' ligeramente antes de entrar al ojo, desplazando el punto de convergencia exactamente sobre la retina." },
      { pregunta: "Explica cómo funciona la fibra óptica y por qué el ángulo crítico es fundamental para su funcionamiento.", respuesta_guia: "La fibra óptica usa reflexión total interna: la luz viaja dentro de un núcleo de alto índice de refracción. Si el ángulo de incidencia interior supera el ángulo crítico (θ_c = arcsen(n₂/n₁)), la luz se refleja completamente sin escapar por las paredes. Así, los pulsos de luz recorren kilómetros de fibra con mínimas pérdidas, transmitiendo datos digitales a alta velocidad. TELMEX y Totalplay usan este principio en México." },
    ],
  },
  { // P07 — lectura (Electromagnetismo)
    titulo: "Electromagnetismo: campos, inducción y la tecnología que nos rodea",
    texto: `El electromagnetismo es la rama de la física que estudia las fuerzas eléctricas y magnéticas y su íntima relación. A partir del trabajo de Coulomb, Faraday, Ampère y Maxwell en los siglos XVIII y XIX, sabemos que la electricidad y el magnetismo son dos manifestaciones del mismo fenómeno fundamental, y que la luz misma es una onda electromagnética.\n\nLa Ley de Coulomb describe la fuerza entre dos cargas eléctricas puntuales: F = k · q₁ · q₂ / r², donde k = 8.99 × 10⁹ N·m²/C² es la constante de Coulomb, q₁ y q₂ son las cargas en culombios y r la distancia entre ellas. Las cargas del mismo signo se repelen; las de signo contrario se atraen. Esta fuerza es 10³⁶ veces más intensa que la gravitacional a la misma distancia, aunque a escala macroscópica los efectos eléctricos suelen cancelarse porque la materia ordinaria contiene igual número de cargas positivas y negativas.\n\nLa Ley de Ohm establece la relación entre voltaje, corriente y resistencia en un conductor: V = I · R, donde V es el voltaje (diferencia de potencial, en voltios), I es la intensidad de corriente (en amperios) y R es la resistencia eléctrica (en ohmios, Ω). La potencia eléctrica disipada en una resistencia es P = I · V = I²R = V²/R, en vatios (W). La red eléctrica de la CFE distribuye corriente alterna (AC) a 127 V / 60 Hz en los hogares mexicanos. Los aparatos eléctricos típicos: un foco LED consume 10 W; un refrigerador entre 150-400 W; un horno de microondas 1,000-1,200 W; un calentador de agua 2,000 W.\n\nLa inducción electromagnética, descubierta por Michael Faraday en 1831, establece que un campo magnético cambiante en el tiempo genera una corriente eléctrica en un conductor cercano (Ley de Faraday). Esta es la base de generadores y transformadores. Un generador convierte energía mecánica en energía eléctrica: el movimiento de un conductor en un campo magnético induce una corriente. Las grandes hidroeléctricas de México, como la presa Chicoasén (Río Grijalva, Chiapas), con 2,400 MW de capacidad instalada, hacen girar enormes turbinas con el agua del río; las turbinas hacen girar generadores que producen la electricidad que distribuye la CFE.\n\nUn motor eléctrico realiza el proceso inverso: convierte energía eléctrica en mecánica. Cuando una corriente pasa por un conductor dentro de un campo magnético, experimenta una fuerza (Fuerza de Lorentz: F = qv × B) que lo pone en movimiento. Los trenes del Sistema de Transporte Colectivo Metro de la CDMX usan motores eléctricos de tracción en sus 12 líneas; la línea 12 (dorada) usa tecnología de motor de inducción. La ventaja del motor eléctrico es su alta eficiencia (90-97%), mucho mayor que los motores de combustión interna (~35%).\n\nLos transformadores usan la inducción mutua entre dos bobinas para cambiar el voltaje de la corriente alterna. La razón de transformación es V₂/V₁ = N₂/N₁, donde N₁ y N₂ son los números de vueltas de las bobinas. La CFE transmite electricidad a 400 kV (400,000 voltios) a través de líneas de alta tensión de larga distancia: a mayor voltaje, menor corriente y por tanto menores pérdidas por calor (P_pérdida = I²R). Luego, transformadores en las subestaciones reducen el voltaje a 127 V o 220 V para uso doméstico e industrial. El Sistema Eléctrico Nacional Interconectado de México conecta generadoras de Baja California a Yucatán con miles de kilómetros de líneas de transmisión.`,
    fuente: "Material elaborado para CEN Bachillerato — CNEYT-V. Ref: Serway & Jewett, Física (9ª ed.); CFE Informe anual 2023; STC Metro CDMX.",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 13,
    preguntas_comprension: [
      { pregunta: "Enuncia la Ley de Ohm y calcula: si una resistencia de 100 Ω está conectada a 127 V, ¿qué corriente circula y qué potencia disipa?", respuesta_guia: "V = IR → I = V/R = 127/100 = 1.27 A. Potencia: P = IV = 1.27 × 127 ≈ 161 W. (O bien P = V²/R = 127²/100 = 161 W)." },
      { pregunta: "¿Qué es la inducción electromagnética y cómo la aprovecha la presa Chicoasén para generar electricidad?", respuesta_guia: "La inducción electromagnética (Faraday, 1831) establece que un campo magnético cambiante induce corriente en un conductor. En Chicoasén, el agua del Río Grijalva hace girar turbinas que giran bobinas de cobre dentro de imanes (generadores), induciendo corriente alterna que se transmite por la red de la CFE." },
      { pregunta: "¿Por qué la CFE transmite la electricidad a 400,000 V y luego la reduce con transformadores?", respuesta_guia: "A mayor voltaje, menor corriente (P = IV, a P constante). Las pérdidas por resistencia de los cables son P = I²R: al reducir I (con mayor V), las pérdidas disminuyen drásticamente. Después, transformadores en subestaciones reducen el voltaje a 127-220 V para uso seguro en hogares e industrias." },
      { pregunta: "¿Qué diferencia hay entre un motor eléctrico y un generador, y cuál es la eficiencia del motor del Metro CDMX?", respuesta_guia: "Motor: convierte energía eléctrica en mecánica (Fuerza de Lorentz sobre conductor con corriente en campo magnético). Generador: el proceso inverso — movimiento mecánico en campo magnético induce corriente. Los motores eléctricos de los trenes del Metro CDMX tienen eficiencias del 90-97%, muy superiores a los motores de combustión (~35%)." },
    ],
  },
  { // P08 — video_con_preguntas (Física y ética)
    url_video: "https://www.youtube.com/watch?v=placeholder-fisica-etica",
    titulo_video: "Energía nuclear, telecomunicaciones y sus impactos sociales: un debate abierto",
    descripcion: "Video que presenta el debate sobre la energía nuclear (ventajas: baja emisión de CO₂; riesgos: Chernóbil, Fukushima, residuos radiactivos), la vigilancia digital y las telecomunicaciones, y la responsabilidad ética de los científicos e ingenieros.",
    tiempo_segundos: 900,
    preguntas: [
      { tiempo_segundos: 270, pregunta: "México opera la planta nuclear de Laguna Verde en Veracruz (dos reactores BWR). ¿Cuáles son las principales ventajas e inconvenientes de la energía nuclear comparada con las termoeléctricas de combustible fósil?", respuesta_guia: "Ventajas: muy baja emisión de CO₂ durante operación (casi cero gases de efecto invernadero por kWh generado); alta densidad energética (poco combustible para mucha energía); operación continua (no depende del clima). Desventajas: riesgo de accidente nuclear (Chernóbil 1986, Fukushima 2011); residuos radiactivos de larga vida media que requieren almacenamiento seguro por miles de años; alto costo de construcción y desmantelamiento; preocupación social y política." },
      { tiempo_segundos: 570, pregunta: "¿Qué responsabilidad ética tienen los científicos y los ingenieros cuando desarrollan tecnologías de alto impacto como la energía nuclear o las telecomunicaciones masivas? Menciona un caso concreto de México.", respuesta_guia: "Los científicos e ingenieros deben evaluar no solo la viabilidad técnica sino los riesgos ambientales, sociales y económicos de sus desarrollos. Ejemplo mexicano: los ingenieros del ININ (Instituto Nacional de Investigaciones Nucleares) tienen la responsabilidad de operar Laguna Verde con los más altos estándares de seguridad. En telecomunicaciones, el IFT tiene responsabilidad ética en la regulación del uso del espectro y la protección de la privacidad de los usuarios ante la vigilancia masiva." },
      { tiempo_segundos: 820, pregunta: "¿Qué es la basura electrónica (e-waste) y por qué representa un problema ético y ambiental en México? ¿Qué marcos normativos existen para su manejo?", respuesta_guia: "La basura electrónica son dispositivos eléctricos y electrónicos desechados (celulares, computadoras, pantallas) que contienen metales pesados tóxicos (plomo, mercurio, cadmio) y pueden contaminar suelo y agua. En México se generan más de 1 millón de toneladas anuales de e-waste. La SEMARNAT regula los residuos de manejo especial; la NOM-161-SEMARNAT establece obligaciones para productores y distribuidores de aparatos eléctricos. La ética científica exige diseñar productos más duraderos y con materiales reciclables." },
    ],
  },
];

// ── A2 ──────────────────────────────────────────────────────────────────────────
const contenidosA2 = [
  { // P01 — simulacion (Diagrama de cuerpo libre)
    tipo_simulacion: "laboratorio",
    descripcion: "Simulación de diagrama de cuerpo libre: el alumno coloca fuerzas (peso, normal, tensión, fricción) sobre objetos en distintas situaciones (plano horizontal, plano inclinado, sistema con polea) y verifica si el sistema está en equilibrio o calcula la aceleración resultante.",
    instrucciones: [
      "Selecciona el objeto del sistema (caja en plano horizontal, caja en plano inclinado a 30°, sistema con polea)",
      "Identifica y dibuja todas las fuerzas que actúan sobre el objeto",
      "Suma vectorialmente las fuerzas para obtener la fuerza neta",
      "Aplica F=ma para calcular la aceleración",
      "Verifica con los valores de la simulación",
      "Experimenta cambiando la masa, el ángulo o el coeficiente de fricción",
    ],
    variables_a_explorar: ["masa del objeto", "ángulo del plano inclinado", "coeficiente de fricción estática y cinética", "tensión en cuerdas"],
    preguntas_reflexion: [
      "¿Qué sucede con la aceleración cuando aumenta la masa pero la fuerza neta es igual?",
      "¿Por qué la fricción cinética siempre se opone al movimiento?",
      "¿Cómo cambia la normal en un plano inclinado comparada con el plano horizontal?",
    ],
  },
  { // P02 — ejercicio_matematico (Cinemática: MRU y MRUA)
    problema: "Un automóvil en la autopista Puebla-CDMX parte del reposo y acelera uniformemente a 3 m/s² durante 10 segundos.\n(a) ¿Qué velocidad alcanza al final de los 10 segundos?\n(b) ¿Qué distancia recorrió durante esos 10 segundos de aceleración?\n(c) Si después frena con una desaceleración uniforme de 5 m/s² hasta detenerse completamente, ¿cuánto tiempo tarda en detenerse y qué distancia adicional recorre durante el frenado?\n\nMuestra el procedimiento completo con las ecuaciones cinemáticas del MRUA.",
    tipo_respuesta: "desarrollo",
    pasos_guia: [
      "Datos del problema: v₀ = 0 (parte del reposo), a₁ = +3 m/s², t₁ = 10 s (fase de aceleración). Fase de frenado: v₀' = resultado del inciso (a), a₂ = −5 m/s² (desaceleración), v_f = 0.",
      "Inciso (a) — velocidad al final de la aceleración: v = v₀ + a₁·t₁ = 0 + 3 × 10 = 30 m/s. Convertir a km/h: 30 × 3.6 = 108 km/h. Esto es una velocidad típica de autopista en México.",
      "Inciso (b) — distancia durante la aceleración: x = v₀·t₁ + ½·a₁·t₁² = 0 + ½ × 3 × 10² = ½ × 3 × 100 = 150 m. Verificación alternativa: x = (v² − v₀²)/(2a) = (30² − 0)/(2×3) = 900/6 = 150 m ✓.",
      "Inciso (c) — tiempo de frenado: 0 = v₀' + a₂·t₂ → 0 = 30 + (−5)·t₂ → t₂ = 30/5 = 6 s.",
      "Inciso (c) — distancia de frenado: x₂ = v₀'·t₂ + ½·a₂·t₂² = 30×6 + ½×(−5)×36 = 180 − 90 = 90 m. Verificación: x₂ = (v_f² − v₀'²)/(2a₂) = (0 − 900)/(2×−5) = −900/−10 = 90 m ✓.",
      "Resumen: (a) v = 30 m/s ≈ 108 km/h; (b) d₁ = 150 m; (c) t_freno = 6 s, d₂ = 90 m. Distancia total recorrida: 150 + 90 = 240 m.",
    ],
    respuesta_final: "(a) 30 m/s ≈ 108 km/h; (b) 150 m; (c) 6 s y 90 m adicionales",
    tolerancia_error: 0.5,
    unidades: "m/s, metros, segundos",
  },
  { // P03 — ejercicio_matematico (Gravitación universal y satélites)
    problema: "Aplica la Ley de Gravitación Universal a situaciones reales del sistema Tierra-Luna y los satélites mexicanos.\n\n(a) Calcula la fuerza gravitacional entre la Tierra (M_T = 5.97×10²⁴ kg) y la Luna (m_L = 7.34×10²² kg), sabiendo que la distancia promedio entre sus centros es r = 3.84×10⁸ m. Usa G = 6.674×10⁻¹¹ N·m²/kg².\n\n(b) Una persona de 70 kg viaja en una misión espacial y llega a la Luna (g_Luna = 1.62 m/s²). ¿Cuánto pesa ahí en newtons? ¿Y en 'kilogramos-fuerza' (dividiendo entre 9.8)?\n\n(c) Los satélites Mexsat orbitan en órbita geoestacionaria a 35,786 km de altura. Explica (sin calcular) por qué esta órbita hace que el satélite parezca fijo desde la Tierra. ¿Qué condición debe cumplir el período orbital del satélite?",
    tipo_respuesta: "desarrollo",
    pasos_guia: [
      "Inciso (a): F = G·M_T·m_L/r². Sustituir: F = (6.674×10⁻¹¹)(5.97×10²⁴)(7.34×10²²) / (3.84×10⁸)². Numerador: 6.674×10⁻¹¹ × 5.97×10²⁴ = 3.982×10¹⁴; luego × 7.34×10²² = 2.922×10³⁷. Denominador: (3.84×10⁸)² = 14.75×10¹⁶ = 1.475×10¹⁷. F = 2.922×10³⁷ / 1.475×10¹⁷ ≈ 1.98×10²⁰ N.",
      "Interpretación: F ≈ 1.98×10²⁰ N es una fuerza enorme (casi 200 quintillones de newtons) que mantiene a la Luna en órbita alrededor de la Tierra y produce las mareas oceánicas en México (Golfo de México y Pacífico).",
      "Inciso (b): Peso en Luna = m × g_Luna = 70 × 1.62 = 113.4 N. En kg-fuerza: 113.4 / 9.8 ≈ 11.6 kg-fuerza. La persona 'pesa' apenas el 16.5% de su peso en la Tierra (70 kg × 9.8 = 686 N en la Tierra). La masa sigue siendo 70 kg.",
      "Inciso (c): La órbita geoestacionaria a 35,786 km tiene el período orbital T = 24 h (exactamente igual al período de rotación de la Tierra sobre su propio eje). Como el satélite da exactamente la misma vuelta angular que la Tierra en el mismo tiempo, desde cualquier punto de la superficie parece inmóvil. Las antenas parabólicas (Dish, SKY México) pueden apuntar siempre al mismo punto del cielo sin mecanismo de seguimiento.",
      "Verificación conceptual: si el período fuera diferente al de rotación terrestre (como en una órbita baja LEO a 400 km, T ≈ 92 minutos), el satélite se movería rápidamente por el cielo y solo sería visible durante minutos desde cada punto de la Tierra.",
    ],
    respuesta_final: "(a) F ≈ 1.98×10²⁰ N; (b) 113.4 N ≈ 11.6 kg-fuerza (≈1/6 del peso terrestre); (c) período orbital = 24 h, igual al período de rotación terrestre",
    tolerancia_error: 0.05e20,
    unidades: "N (newtons), kg-fuerza, horas",
  },
  { // P04 — simulacion (Generador de ondas)
    tipo_simulacion: "laboratorio",
    descripcion: "Simulación de generador de ondas: el alumno configura los parámetros de una onda mecánica (amplitud, frecuencia, velocidad de propagación) y observa cómo afecta la longitud de onda y la forma de la onda. Puede comparar dos ondas (interferencia constructiva y destructiva) y explorar el efecto Doppler.",
    instrucciones: [
      "Ajusta la frecuencia con el control deslizante (1-20 Hz)",
      "Observa cómo cambia la longitud de onda cuando aumentas la frecuencia (v = λf)",
      "Activa la segunda fuente de ondas y experimenta con interferencia",
      "Mueve la fuente para observar el efecto Doppler",
      "Registra los valores de λ, f y v para 3 configuraciones distintas",
      "Verifica la ecuación v = λf con tus datos",
    ],
    variables_a_explorar: ["frecuencia", "amplitud", "velocidad de propagación", "posición de la fuente (Doppler)"],
    preguntas_reflexion: [
      "¿Qué pasa con la longitud de onda cuando duplicas la frecuencia manteniendo v constante?",
      "¿Cómo se forma una onda estacionaria? ¿Qué condición debe cumplirse?",
      "¿Por qué el sonido de una ambulancia cambia de tono cuando pasa frente a ti?",
    ],
  },
  { // P05 — quiz_multiple_opcion (Espectro electromagnético)
    preguntas: [
      { enunciado: "¿Cuál de las siguientes regiones del espectro electromagnético tiene la MAYOR longitud de onda y la MENOR frecuencia?", opciones: ["Rayos gamma", "Luz ultravioleta", "Ondas de radio", "Rayos X"], respuesta_correcta: 2, retroalimentacion: "Las ondas de radio tienen la mayor longitud de onda (desde centímetros hasta kilómetros) y la menor frecuencia y energía del espectro. Los rayos gamma están en el extremo opuesto: menor longitud de onda y mayor frecuencia/energía." },
      { enunciado: "Las ondas electromagnéticas se diferencian de las ondas mecánicas (como el sonido) en que:", opciones: ["Viajan más lento que el sonido", "No pueden transportar energía", "Pueden propagarse en el vacío sin necesidad de un medio material", "Solo se propagan en sólidos"], respuesta_correcta: 2, retroalimentacion: "Las ondas electromagnéticas no necesitan medio material para propagarse; viajan en el vacío a c = 3×10⁸ m/s. Por eso la luz del Sol llega hasta la Tierra a través del vacío del espacio interestelar. El sonido, en cambio, necesita un medio (aire, agua, sólido) y no se propaga en el vacío." },
      { enunciado: "El IFT (Instituto Federal de Telecomunicaciones) de México regula el uso de:", opciones: ["Los rayos X en hospitales", "Las frecuencias de radio y televisión del espectro radioeléctrico", "La energía de los rayos gamma en radioterapia", "El infrarrojo en cámaras de seguridad"], respuesta_correcta: 1, retroalimentacion: "El IFT es el órgano regulador autónomo que administra y vigila el espectro radioeléctrico en México: concesiones de radio AM/FM, televisión abierta, telefonía celular (4G/5G), WiFi y otros servicios inalámbricos. Los rayos X son regulados por la COFEPRIS; los rayos gamma en medicina por la CNSNS (Comisión Nacional de Seguridad Nuclear y Salvaguardias)." },
      { enunciado: "La velocidad de la luz en el vacío es aproximadamente:", opciones: ["3×10⁶ m/s", "3×10⁸ m/s", "3×10¹⁰ m/s", "340 m/s"], respuesta_correcta: 1, retroalimentacion: "c ≈ 3×10⁸ m/s = 300,000 km/s. A esta velocidad, la luz tarda apenas 1.3 segundos en ir de la Luna a la Tierra, y 8 minutos en viajar del Sol a la Tierra. Las 340 m/s son la velocidad del sonido en el aire, no de la luz." },
      { enunciado: "¿Cuál de las siguientes afirmaciones sobre la radiación ionizante es CORRECTA?", opciones: ["Las ondas de radio son ionizantes porque tienen mucha longitud de onda", "La radiación infrarroja es la más ionizante del espectro", "Los rayos X y rayos gamma son ionizantes porque tienen suficiente energía para arrancar electrones de los átomos", "La luz visible es ionizante a temperaturas normales"], respuesta_correcta: 2, retroalimentacion: "La radiación ionizante (rayos X, rayos gamma, y algunas UV de onda corta) tiene suficiente energía para arrancar electrones de los átomos, dañando el ADN y los tejidos. Las ondas de radio, microondas, infrarrojo y luz visible son no ionizantes: no tienen energía suficiente para ionizar átomos. El IMSS y el INER regulan la exposición a radiación ionizante con dosímetros personales y blindajes de plomo." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P06 — simulacion (Óptica geométrica)
    tipo_simulacion: "laboratorio",
    descripcion: "Simulación de óptica geométrica: el alumno experimenta con reflexión en espejos (planos, cóncavos y convexos), refracción con la ley de Snell entre distintos medios, y formación de imágenes en lentes convergentes y divergentes.",
    instrucciones: [
      "Elige el componente óptico: espejo plano, espejo cóncavo, espejo convexo, lente convergente, lente divergente",
      "Coloca el objeto a distintas distancias del componente óptico",
      "Traza los rayos principales y encuentra la imagen",
      "Aplica la ley de Snell: cambia el ángulo de incidencia y los materiales (agua, vidrio, diamante)",
      "Verifica la ecuación de lentes: 1/f = 1/do + 1/di",
      "Explora el fenómeno de reflexión total interna variando el ángulo hasta superar el ángulo crítico",
    ],
    variables_a_explorar: ["distancia objeto", "tipo de lente/espejo", "índice de refracción", "ángulo de incidencia"],
    preguntas_reflexion: [
      "¿Qué tipo de imagen produce una lente convergente cuando el objeto está entre el foco y la lente?",
      "¿Por qué la fibra óptica usa reflexión total interna?",
      "¿Cómo corrige una lente divergente la miopía?",
    ],
  },
  { // P07 — ejercicio_matematico (Electromagnetismo: Ohm, Faraday, motores)
    problema: "Aplica las leyes del electromagnetismo a situaciones reales de México.\n\n(a) Una resistencia de 470 Ω está conectada a 120 V (corriente alterna de la red CFE). Calcula:\n   i. La corriente que circula por la resistencia (en amperios)\n   ii. La potencia eléctrica disipada (en vatios)\n   iii. La energía consumida en 8 horas de operación continua (en kWh)\n   iv. El costo de esa energía si el kWh vale $1.50 MXN (tarifa doméstica básica aproximada)\n\n(b) Un motor eléctrico del Metro de la CDMX tiene una eficiencia del 92% y consume 150 kW de potencia eléctrica. ¿Cuánta potencia mecánica útil entrega para mover el tren?",
    tipo_respuesta: "desarrollo",
    pasos_guia: [
      "Inciso (a-i): Ley de Ohm: I = V/R = 120/470 ≈ 0.2553 A ≈ 0.255 A.",
      "Inciso (a-ii): Potencia: P = V²/R = 120²/470 = 14,400/470 ≈ 30.6 W. Verificación: P = I×V = 0.255×120 = 30.6 W ✓. También P = I²×R = 0.255²×470 = 0.065×470 ≈ 30.6 W ✓.",
      "Inciso (a-iii): Energía en kWh: E = P × t = 30.6 W × 8 h = 244.8 Wh = 0.245 kWh. (Recordar: 1 kWh = 1,000 Wh; dividir entre 1,000).",
      "Inciso (a-iv): Costo = E × precio = 0.245 kWh × $1.50 MXN/kWh ≈ $0.37 MXN. Una resistencia de 470 Ω encendida 8 horas seguidas cuesta menos de 40 centavos de peso mexicano.",
      "Inciso (b): Potencia mecánica = eficiencia × potencia eléctrica = 0.92 × 150 kW = 138 kW. El 8% restante (12 kW) se disipa como calor en el bobinado del motor (pérdidas por resistencia óhmica y fricción).",
      "Comparación: 138 kW ≈ 185 hp (caballos de fuerza), la potencia mecánica de un tren del Metro. La alta eficiencia del motor eléctrico (92%) frente al motor de combustión interna (~35%) es la razón principal por la que el transporte eléctrico es más eficiente energéticamente.",
    ],
    respuesta_final: "(a-i) I ≈ 0.255 A; (a-ii) P ≈ 30.6 W; (a-iii) E ≈ 0.245 kWh; (a-iv) ≈ $0.37 MXN; (b) Pmec = 138 kW",
    tolerancia_error: 0.5,
    unidades: "amperios (A), vatios (W), kilovatios-hora (kWh), pesos mexicanos (MXN), kilovatios (kW)",
  },
  { // P08 — quiz_multiple_opcion (Ética del desarrollo tecnológico)
    preguntas: [
      { enunciado: "La planta nucleoeléctrica de Laguna Verde, en Veracruz, opera con reactores de tipo BWR (Boiling Water Reactor). ¿Cuál es el proceso físico que genera la energía en un reactor nuclear?", opciones: ["Fusión nuclear controlada de hidrógeno (como en el Sol)", "Fisión nuclear del uranio-235: el núcleo se divide liberando energía, calentando agua para mover turbinas", "Combustión del uranio metálico con oxígeno", "Reacción química exotérmica entre plutonio y agua"], respuesta_correcta: 1, retroalimentacion: "En Laguna Verde se usa fisión nuclear: neutrones impactan núcleos de U-235, que se dividen en fragmentos más pequeños liberando energía (calor), más neutrones y radiación. El calor produce vapor que mueve turbinas conectadas a generadores eléctricos. La fusión (opción A) es el proceso del Sol, pero aún no se ha logrado de forma comercial en reactores terrestres." },
      { enunciado: "¿Cuál es la principal ventaja ambiental de la energía nuclear frente a las termoeléctricas de gas natural o carbón?", opciones: ["No genera ningún tipo de residuos", "Produce emisiones de CO₂ extremadamente bajas durante su operación", "Sus residuos radiactivos desaparecen al cabo de 10 años", "No necesita agua para su operación"], respuesta_correcta: 1, retroalimentacion: "La energía nuclear genera prácticamente cero emisiones de CO₂ durante su operación (la principal causa del cambio climático). Esto la hace relevante en los debates sobre descarbonización de la economía. Sus desventajas incluyen: generación de residuos radiactivos de alta actividad con vida media de miles a millones de años; riesgo de accidente grave; alto costo de construcción y desmantelamiento." },
      { enunciado: "En el accidente de Fukushima (2011), el sistema de refrigeración del reactor falló tras el tsunami. ¿Qué riesgo fundamental ilustra este accidente?", opciones: ["Que los reactores nucleares pueden explotar como una bomba atómica", "Que sin refrigeración continua, el calor del decaimiento radiactivo puede fundir el núcleo del reactor y liberar radiación", "Que el uranio se termina rápidamente y deja de funcionar el reactor", "Que los generadores eléctricos del reactor producen radiación directamente"], respuesta_correcta: 1, retroalimentacion: "Aunque un reactor nuclear NO puede explotar como una bomba (la geometría del combustible no lo permite), el calor generado por el decaimiento radiactivo continúa incluso después de apagado el reactor. Sin refrigeración, el núcleo puede fundirse (meltdown), dañar el contenedor y liberar sustancias radiactivas. Esto es lo que ocurrió en Fukushima Daiichi con los reactores 1, 2 y 3 tras el tsunami del 11 de marzo de 2011." },
      { enunciado: "¿Qué es la 'basura electrónica' (e-waste) y cuál es el principal riesgo ambiental asociado a su manejo inadecuado?", opciones: ["Son archivos digitales corruptos que contaminan los servidores", "Son dispositivos eléctricos y electrónicos desechados que contienen metales pesados tóxicos (plomo, mercurio, cadmio) que contaminan suelo y agua", "Son emisiones de CO₂ de los centros de datos de internet", "Son los residuos radiactivos de los teléfonos celulares viejos"], respuesta_correcta: 1, retroalimentacion: "La basura electrónica incluye celulares, computadoras, televisores, pilas y otros dispositivos desechados. Contienen plomo en soldaduras, mercurio en pantallas, cadmio en baterías y arsénico en chips. En tiraderos informales, estos metales tóxicos lixivian al suelo y acuíferos. México genera más de 1 millón de toneladas anuales de e-waste; la NOM-161-SEMARNAT establece criterios para su gestión como residuo de manejo especial." },
      { enunciado: "¿Cuál de las siguientes afirmaciones sobre la responsabilidad ética en el desarrollo tecnológico es MÁS correcta?", opciones: ["Los científicos solo son responsables de descubrir; los ingenieros de aplicar; los políticos de decidir", "La responsabilidad ética es colectiva y abarca a científicos, ingenieros, empresas, gobiernos y ciudadanos informados", "Los riesgos tecnológicos son exclusiva responsabilidad del Estado", "El progreso tecnológico siempre compensa cualquier riesgo, por lo que la ética no debe frenar la innovación"], respuesta_correcta: 1, retroalimentacion: "El principio de responsabilidad ética en tecnología establece que todos los actores involucrados comparten responsabilidad: los científicos deben comunicar honestamente los riesgos; los ingenieros deben diseñar con seguridad máxima; las empresas deben actuar sin anteponer ganancias a la seguridad pública; los gobiernos deben regular y supervisar; los ciudadanos deben participar informados en decisiones que los afectan. La bioética y la ética de la ingeniería son disciplinas académicas que estudian estos principios." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
];

// ── A3 ──────────────────────────────────────────────────────────────────────────
const contenidosA3 = [
  { // P01 — quiz_multiple_opcion (Leyes de Newton)
    preguntas: [
      { enunciado: "Un pasajero en un autobús sin cinturón de seguridad es proyectado hacia adelante cuando el conductor frena de golpe. ¿Qué ley de Newton explica este fenómeno?", opciones: ["Segunda Ley (F=ma): el conductor frena con mucha fuerza", "Primera Ley (inercia): el pasajero tiende a mantener su movimiento hacia adelante", "Tercera Ley: el asiento ejerce una fuerza sobre el pasajero", "Ley de Gravitación Universal"], respuesta_correcta: 1, retroalimentacion: "Primera Ley de Newton (inercia): el pasajero tiene una velocidad hacia adelante; al frenar el autobús, el pasajero no tiene fuerza que cambie su estado de movimiento, por lo que sigue moviéndose hacia adelante. El cinturón de seguridad proporciona esa fuerza de frenado para protegerlo." },
      { enunciado: "Si se aplica una fuerza neta de 180 N a un objeto de 60 kg, ¿cuál es su aceleración?", opciones: ["10,800 m/s²", "0.33 m/s²", "3 m/s²", "120 m/s²"], respuesta_correcta: 2, retroalimentacion: "Segunda Ley: a = F/m = 180/60 = 3 m/s². La aceleración es directamente proporcional a la fuerza e inversamente proporcional a la masa. Si se duplica la fuerza manteniendo la misma masa, la aceleración también se duplica." },
      { enunciado: "Un cohete expulsa gases hacia abajo y el cohete sube. ¿Cuál ley de Newton describe esta situación?", opciones: ["Primera ley: el cohete en reposo tiende a permanecer en reposo", "Segunda ley: los gases tienen mayor masa que el cohete", "Tercera ley: los gases son expulsados hacia abajo (acción) y el cohete es impulsado hacia arriba (reacción)", "Ley de Gravitación Universal"], respuesta_correcta: 2, retroalimentacion: "Tercera Ley (acción-reacción): el motor expulsa gases hacia abajo con cierta fuerza (acción); por la Tercera Ley, los gases ejercen sobre el cohete una fuerza igual y opuesta hacia arriba (reacción). Toda la propulsión espacial, incluida la de los satélites Mexsat, se basa en este principio." },
      { enunciado: "¿Cuál es la diferencia entre masa y peso?", opciones: ["Son exactamente lo mismo, se miden en kilogramos", "La masa mide la cantidad de materia (kg, constante); el peso es la fuerza gravitacional sobre esa masa (N, varía según el lugar)", "El peso se mide en kg y la masa en N", "La masa varía con la altitud; el peso es constante"], respuesta_correcta: 1, retroalimentacion: "La masa (kg) es una propiedad intrínseca del cuerpo, mide la cantidad de materia y no cambia. El peso (N) es la fuerza gravitacional W = mg; depende de g, que varía según el cuerpo celeste. En la Tierra: g = 9.8 m/s². En la Luna: g = 1.62 m/s². Una persona de 70 kg tiene siempre 70 kg de masa pero pesa 686 N en la Tierra y solo 113 N en la Luna." },
      { enunciado: "En un plano inclinado sin fricción a 30°, ¿cuál es la aceleración de un bloque de masa m que desliza hacia abajo?", opciones: ["g (9.8 m/s²)", "g × cos 30° ≈ 8.49 m/s²", "g × sen 30° = 4.9 m/s²", "0 m/s² (el bloque no se mueve sin fricción)"], respuesta_correcta: 2, retroalimentacion: "La fuerza que impulsa el bloque hacia abajo del plano es la componente del peso paralela al plano: F = mg·sen θ. Aplicando F = ma: ma = mg·sen 30° → a = g·sen 30° = 9.8 × 0.5 = 4.9 m/s². Sin fricción, todos los bloques (sin importar su masa) bajan con la misma aceleración de 4.9 m/s²." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P02 — quiz_verdadero_falso (Cinemática: MRU, MRUA, caída libre)
    preguntas: [
      { enunciado: "En el MRU (Movimiento Rectilíneo Uniforme), la aceleración es cero y la gráfica posición-tiempo es una línea recta con pendiente igual a la velocidad.", respuesta: true, retroalimentacion: "VERDADERO. En el MRU, v = constante y a = 0. La ecuación es x = x₀ + vt (función lineal de t), por lo que la gráfica x-t es una línea recta con pendiente v. La gráfica v-t es una línea horizontal." },
      { enunciado: "En la caída libre, un objeto más pesado cae más rápido que uno más ligero (en ausencia de resistencia del aire).", respuesta: false, retroalimentacion: "FALSO. En ausencia de resistencia del aire, todos los objetos caen con la misma aceleración g ≈ 9.8 m/s², independientemente de su masa. Galileo demostró esto en el siglo XVI. La confusión viene de la experiencia cotidiana con resistencia del aire, que sí afecta diferente a objetos según su forma y densidad." },
      { enunciado: "Si un automóvil duplica su velocidad de 50 km/h a 100 km/h, su distancia de frenado también se duplica.", respuesta: false, retroalimentacion: "FALSO. La distancia de frenado es d = v₀²/(2a). Al duplicar la velocidad, la distancia se cuadruplica (2² = 4 veces más). A 50 km/h, d_freno ≈ 14 m (con desaceleración de 7 m/s²); a 100 km/h, d_freno ≈ 56 m. Por eso los límites de velocidad en zonas escolares son tan importantes." },
      { enunciado: "En el MRUA, la gráfica de velocidad en función del tiempo es una línea recta cuya pendiente es la aceleración.", respuesta: true, retroalimentacion: "VERDADERO. En el MRUA, v = v₀ + at es una ecuación lineal en t. La pendiente de la recta en la gráfica v-t es exactamente la aceleración a. Si a > 0, la recta sube; si a < 0 (desaceleración), la recta baja." },
      { enunciado: "Un objeto lanzado verticalmente hacia arriba desde el Estadio Azteca alcanza su punto más alto cuando su velocidad llega a cero y, en ese instante, su aceleración también es cero.", respuesta: false, retroalimentacion: "FALSO. En el punto más alto, la velocidad es cero (el objeto momentáneamente se detiene antes de comenzar a caer), pero la aceleración gravitacional sigue siendo g = 9.8 m/s² hacia abajo. La gravedad actúa continuamente, incluso cuando la velocidad es cero. Es un error común confundir velocidad nula con aceleración nula." },
      { enunciado: "El área bajo la curva de una gráfica velocidad-tiempo representa el desplazamiento recorrido.", respuesta: true, retroalimentacion: "VERDADERO. Matemáticamente, el desplazamiento es la integral de la velocidad respecto al tiempo: Δx = ∫v dt, que geométricamente es el área bajo la curva v-t. Para el MRU (rectángulo), Δx = v × t. Para el MRUA (triángulo o trapecio), el área da el desplazamiento total. Este principio es fundamental para analizar movimientos complejos con gráficas." },
    ],
    intentos_maximos: 2,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P03 — reflexion_escrita (México en el espacio y gravitación)
    prompt: "México lanzó sus primeros satélites en 1985 (Morelos I y II) y en 2010 creó la Agencia Espacial Mexicana (AEM). Reflexiona: (1) ¿Qué papel juega la gravitación universal en el funcionamiento de los satélites de telecomunicaciones? (2) ¿Qué beneficios concretos han traído los satélites mexicanos a las comunidades rurales con poca conectividad? (3) ¿Debería México invertir más en exploración espacial o priorizar otras necesidades?",
    pistas: [
      "¿Por qué un satélite geoestacionario siempre parece fijo en el cielo?",
      "¿Qué servicios (teléfono, internet, TV) dependen de satélites en México?",
      "¿Qué países emergentes tienen programas espaciales activos?",
    ],
    longitud_minima_palabras: 100,
  },
  { // P04 — quiz_multiple_opcion (Ondas mecánicas y sonido)
    preguntas: [
      { enunciado: "¿Cuál de las siguientes ondas es una onda LONGITUDINAL?", opciones: ["Onda S sísmica (corte)", "Onda de luz visible", "Onda de sonido en el aire", "Onda en una cuerda de guitarra"], respuesta_correcta: 2, retroalimentacion: "Las ondas de sonido en el aire son longitudinales: las moléculas de aire se comprimen y se expanden en la misma dirección que la propagación de la onda. Las ondas en una cuerda de guitarra y las ondas S sísmicas son transversales; la perturbación es perpendicular a la propagación." },
      { enunciado: "Una onda tiene frecuencia f = 440 Hz (nota La musical) y la velocidad del sonido en el aire es 340 m/s. ¿Cuál es su longitud de onda?", opciones: ["0.77 m", "149,600 m", "77 cm (0.77 m)", "440 m"], respuesta_correcta: 0, retroalimentacion: "λ = v/f = 340/440 ≈ 0.773 m ≈ 77 cm. La nota La de 440 Hz tiene una longitud de onda de 77 cm en el aire a temperatura ambiente. Nota: las opciones A y C son numéricamente iguales (0.77 m = 77 cm); la respuesta correcta es λ ≈ 0.77 m." },
      { enunciado: "El SASMEX (Sistema de Alerta Sísmica Mexicano) puede alertar a la CDMX antes de un sismo porque:", opciones: ["Los sensores predicen los sismos con días de anticipación", "Las ondas P (más rápidas, ~8 km/s) se detectan en la costa antes de que lleguen las destructivas ondas S (~4 km/s), y la alerta viaja a velocidad de la luz", "Los satélites Mexsat detectan los movimientos del fondo marino antes de que ocurra el sismo", "Las ondas S viajan más rápido que las ondas P"], respuesta_correcta: 1, retroalimentacion: "El SASMEX aprovecha la diferencia de velocidad entre ondas P y S. Sensores en la costa del Pacífico (Guerrero, Oaxaca) detectan las ondas P (compresión, ~8 km/s, menos destructivas) y transmiten la alerta a la CDMX a velocidad de la luz (señal de radio), antes de que lleguen las ondas S (~4 km/s, más destructivas). El margen es de 40-120 segundos." },
      { enunciado: "Una ambulancia de la Cruz Roja se acerca a 80 km/h emitiendo su sirena a 1,000 Hz. ¿Qué escucha un observador parado en la acera?", opciones: ["El mismo tono de 1,000 Hz sin cambios", "Un tono más grave (menor frecuencia) porque la ambulancia se acerca", "Un tono más agudo (mayor frecuencia) porque las ondas se comprimen frente a la ambulancia que se acerca", "No escucha nada porque el sonido no viaja si la fuente se mueve"], respuesta_correcta: 2, retroalimentacion: "Efecto Doppler: cuando la fuente se acerca, las ondas se comprimen frente a ella (menor λ, mayor f). El observador escucha un tono más agudo que los 1,000 Hz reales. Cuando la ambulancia se aleja, las ondas se expanden (mayor λ, menor f) y el tono baja. Este efecto es audible claramente cuando una ambulancia o un tren pasa a alta velocidad." },
      { enunciado: "¿Cuál de las siguientes propiedades de una onda de sonido determina su VOLUMEN (intensidad percibida)?", opciones: ["La frecuencia (f)", "La longitud de onda (λ)", "La amplitud (A)", "La velocidad de propagación (v)"], respuesta_correcta: 2, retroalimentacion: "La amplitud de una onda sonora determina su volumen o intensidad: mayor amplitud = mayor desplazamiento de las moléculas de aire = mayor presión sonora = sonido más fuerte. La frecuencia determina el tono (agudo/grave). La velocidad depende del medio (340 m/s en aire a 20°C) y no cambia el volumen ni el tono." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P05 — reflexion_escrita (Espectro electromagnético en la vida cotidiana)
    prompt: "El espectro electromagnético nos rodea en todo momento. Reflexiona: (1) Identifica al menos 5 tecnologías que usas en tu vida cotidiana que funcionan con distintas regiones del espectro (menciona cuál región usa cada una). (2) ¿Cuáles son los riesgos para la salud de la exposición a distintas radiaciones? ¿Cómo distingues entre radiación ionizante y no ionizante? (3) ¿Qué regulaciones existen en México sobre el uso del espectro (IFT) y sobre exposición a radiaciones (COFEPRIS)?",
    longitud_minima_palabras: 100,
  },
  { // P06 — autoevaluacion (Óptica geométrica)
    criterios: [
      { descripcion: "Comprendo la ley de reflexión y puedo trazar la trayectoria de un rayo reflejado", escala: [
        { valor: 1, etiqueta: "No lo comprendo", descripcion: "No comprendo este concepto o no puedo aplicarlo." },
        { valor: 2, etiqueta: "Lo comprendo parcialmente", descripcion: "Entiendo la idea general pero cometo errores al trazarlo." },
        { valor: 3, etiqueta: "Lo comprendo bien", descripcion: "Aplico la ley de reflexión correctamente en la mayoría de los casos." },
        { valor: 4, etiqueta: "Puedo explicárselo a otros", descripcion: "Domino el concepto y puedo enseñárselo a un compañero con claridad." },
      ] },
      { descripcion: "Aplico la ley de Snell para calcular ángulos de refracción entre medios", escala: [
        { valor: 1, etiqueta: "No lo comprendo", descripcion: "No recuerdo la ley de Snell o no sé cómo usarla." },
        { valor: 2, etiqueta: "Lo comprendo parcialmente", descripcion: "Reconozco la fórmula n₁·sen θ₁ = n₂·sen θ₂ pero cometo errores al despejar." },
        { valor: 3, etiqueta: "Lo comprendo bien", descripcion: "Aplico la ley de Snell para calcular ángulos en la mayoría de los problemas." },
        { valor: 4, etiqueta: "Puedo explicárselo a otros", descripcion: "Aplico Snell sin errores, incluyendo reflexión total interna, y puedo explicarlo." },
      ] },
      { descripcion: "Uso la ecuación de lentes (1/f = 1/do + 1/di) para encontrar la posición de imágenes", escala: [
        { valor: 1, etiqueta: "No lo comprendo", descripcion: "No recuerdo la ecuación de lentes o no sé cómo identificar do, di y f." },
        { valor: 2, etiqueta: "Lo comprendo parcialmente", descripcion: "Recuerdo la ecuación pero cometo errores de signo o no puedo interpretar el resultado." },
        { valor: 3, etiqueta: "Lo comprendo bien", descripcion: "Uso 1/f = 1/do + 1/di correctamente y determino si la imagen es real o virtual." },
        { valor: 4, etiqueta: "Puedo explicárselo a otros", descripcion: "Resuelvo problemas de lentes con precisión y explico el significado físico de los signos." },
      ] },
      { descripcion: "Explico el principio de reflexión total interna y su aplicación en fibra óptica", escala: [
        { valor: 1, etiqueta: "No lo comprendo", descripcion: "No comprendo por qué ocurre la reflexión total interna." },
        { valor: 2, etiqueta: "Lo comprendo parcialmente", descripcion: "Sé que ocurre cuando el ángulo supera el crítico pero no puedo calcularlo." },
        { valor: 3, etiqueta: "Lo comprendo bien", descripcion: "Explico la reflexión total interna y su relación con los índices de refracción y la fibra óptica." },
        { valor: 4, etiqueta: "Puedo explicárselo a otros", descripcion: "Domino completamente el concepto y puedo enseñarlo con ejemplos tecnológicos reales." },
      ] },
    ],
    reflexion_final_prompt: "¿Qué fenómeno óptico encuentras más difícil de entender: la reflexión, la refracción, o la formación de imágenes? ¿Qué estrategia usarías para comprenderlo mejor?",
  },
  { // P07 — quiz_verdadero_falso (Electromagnetismo)
    preguntas: [
      { enunciado: "Según la Ley de Ohm, si se duplica el voltaje aplicado a una resistencia (manteniendo R constante), la corriente también se duplica.", respuesta: true, retroalimentacion: "VERDADERO. V = IR → I = V/R. Si V se duplica y R es constante, I también se duplica. Ejemplo: si una resistencia de 100 Ω conectada a 12 V conduce 0.12 A, al conectarla a 24 V conducirá 0.24 A." },
      { enunciado: "Un generador eléctrico convierte energía mecánica en energía eléctrica usando el principio de inducción electromagnética descubierto por Faraday.", respuesta: true, retroalimentacion: "VERDADERO. Un generador hace girar bobinas de cobre dentro de un campo magnético; el flujo magnético cambiante induce una fuerza electromotriz (fem) que produce corriente alterna. La presa Chicoasén (CFE, Chiapas) y todas las centrales eléctricas del mundo usan este principio." },
      { enunciado: "Un motor eléctrico y un generador son fundamentalmente el mismo dispositivo, pero operando en sentido contrario.", respuesta: true, retroalimentacion: "VERDADERO. Ambos se basan en la interacción entre corriente eléctrica y campo magnético. El motor convierte energía eléctrica → mecánica (corriente en campo magnético genera movimiento). El generador convierte energía mecánica → eléctrica (movimiento en campo magnético induce corriente). Un mismo dispositivo físico puede funcionar como motor o generador dependiendo de cómo se use." },
      { enunciado: "La CFE transmite la electricidad a alta tensión (400 kV) para aumentar la corriente y llegar a más hogares simultáneamente.", respuesta: false, retroalimentacion: "FALSO. La alta tensión se usa para REDUCIR la corriente, no para aumentarla. A potencia constante (P = IV), mayor voltaje implica menor corriente. Las pérdidas por resistencia de los cables son P = I²R; al reducir I con alta tensión, las pérdidas en la transmisión disminuyen drásticamente. Luego los transformadores en subestaciones reducen el voltaje a 127-220 V para uso seguro." },
      { enunciado: "La corriente continua (DC) es la que usa la red eléctrica de los hogares mexicanos (127 V / 60 Hz).", respuesta: false, retroalimentacion: "FALSO. La red eléctrica doméstica en México distribuye corriente ALTERNA (AC) a 127 V y 60 Hz. Los 60 Hz significan que la corriente cambia de dirección 60 veces por segundo. La corriente continua (DC) es la de las baterías (celulares, automóviles). Los cargadores de celular y las fuentes de computadora convierten AC a DC internamente." },
      { enunciado: "En un transformador ideal, si el número de vueltas del secundario es el doble del primario, el voltaje de salida es el doble del voltaje de entrada.", respuesta: true, retroalimentacion: "VERDADERO. Razón de transformación: V₂/V₁ = N₂/N₁. Si N₂ = 2N₁, entonces V₂ = 2V₁. Este es un transformador elevador (step-up). Un transformador reductor (step-down) tiene N₂ < N₁ y reduce el voltaje. Los transformadores de CFE en las subestaciones son reductores: bajan de 400 kV a 23 kV, luego a 127 V en las acometidas domiciliarias." },
    ],
    intentos_maximos: 2,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P08 — reflexion_escrita (Energía nuclear y ética)
    prompt: "México tiene la planta nuclear de Laguna Verde en Veracruz, operada por CFE, con dos reactores de agua en ebullición (BWR). Reflexiona: (1) ¿Cuáles son los argumentos a favor y en contra de expandir la energía nuclear en México frente al cambio climático? (2) ¿Cómo se compara la energía nuclear con las energías renovables (solar, eólica) en términos de costo, riesgo y emisiones? (3) ¿Quién debería tomar esas decisiones y cómo debe participar la ciudadanía en decisiones sobre tecnología de alto impacto?",
    pistas: [
      "¿Cuánta energía produce Laguna Verde como porcentaje del total nacional?",
      "¿Qué ocurrió en Chernóbil (1986) y Fukushima (2011)?",
      "¿Cuál es la diferencia entre fisión y fusión nuclear?",
    ],
    longitud_minima_palabras: 120,
  },
];

main().catch((err) => { console.error("❌ Error fatal:", err.message); process.exit(1); });
