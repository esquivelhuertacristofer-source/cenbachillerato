/**
 * Seed de actividades pedagógicas para PM-IV (Pensamiento Matemático IV).
 * 7 progresiones × 3 actividades = 21 actividades. estado='publicada'.
 * Tipos A1: lectura, video_con_preguntas, lectura, infografia, video_con_preguntas, lectura, infografia
 * Tipos A2: ejercicio_matematico (todos)
 * Tipos A3: reflexion_escrita, autoevaluacion, reflexion_escrita, quiz_multiple_opcion,
 *            reflexion_escrita, autoevaluacion, reflexion_escrita
 * Uso: npx tsx scripts/seed-activities-pmiv.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🌱 Seed actividades PM-IV — Funciones, Trigonometría y Geometría Analítica\n");

  const progs = await getProgresionesDeUAC(sb, "PM-IV");
  let ok = 0; let fail = 0;

  // 7 propósitos × 3 actividades = 21 total
  for (const p of progs) {
    const base = p.codigo;
    const n = p.numero;

    const a1ok = await upsertActividad(sb, {
      codigo: `${base}-A1`,
      titulo: titulos[n - 1].a1,
      descripcion: "Contextualización conceptual del propósito formativo.",
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
      descripcion: "Ejercicio matemático de práctica y resolución en contexto.",
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
      descripcion: "Evaluación o reflexión de cierre del propósito formativo.",
      tipo: tiposA3[n - 1],
      progresion_id: p.id,
      xp: 20,
      estado: "publicada",
      contenido: contenidosA3[n - 1],
    });
    a3ok ? ok++ : fail++;
  }

  log(`\n✅ PM-IV: ${ok} actividades insertadas, ${fail} fallidas.\n`);
}

// ── TÍTULOS ──────────────────────────────────────────────────────────────────

const titulos = [
  { a1: "¿Qué es una función? Representaciones y ejemplos reales", a2: "Identifico y evalúo una función a partir de una tabla de valores", a3: "Una función que vive en mi día a día" },
  { a1: "Funciones lineales y cuadráticas: gráficas y transformaciones", a2: "Modelo la trayectoria de un balón con una función cuadrática", a3: "¿Comprendo las transformaciones de funciones?" },
  { a1: "Trigonometría: cómo medir lo que no podemos alcanzar", a2: "Calculo la altura de un árbol con razones trigonométricas", a3: "La trigonometría en la arquitectura y la ingeniería mexicana" },
  { a1: "El círculo unitario: valores exactos de seno, coseno y tangente", a2: "Determino valores trigonométricos exactos en el círculo unitario", a3: "¿Sé ubicar ángulos y razones en el círculo unitario?" },
  { a1: "Ley de Senos y Ley de Cosenos: triángulos sin ángulo recto", a2: "Calculo el lado desconocido de un terreno con la Ley de Cosenos", a3: "Mido un lago sin mojarte: Ley de Senos y Cosenos en acción" },
  { a1: "Geometría analítica: el GPS y las coordenadas", a2: "Distancia, punto medio y pendiente entre dos puntos reales", a3: "¿Domino las fórmulas de geometría analítica?" },
  { a1: "Cónicas: circunferencia y parábola como lugares geométricos", a2: "Identifico cónicas por su ecuación y calculo sus elementos", a3: "Cónicas en el mundo que me rodea" },
];

const tiposA1 = ["lectura", "video_con_preguntas", "lectura", "infografia", "video_con_preguntas", "lectura", "infografia"] as const;
const tiposA2 = ["ejercicio_matematico", "ejercicio_matematico", "ejercicio_matematico", "ejercicio_matematico", "ejercicio_matematico", "ejercicio_matematico", "quiz_multiple_opcion"] as const;
const tiposA3 = ["reflexion_escrita", "autoevaluacion", "reflexion_escrita", "quiz_multiple_opcion", "reflexion_escrita", "autoevaluacion", "reflexion_escrita"] as const;

// ── CONTENIDOS A1 ─────────────────────────────────────────────────────────────

const contenidosA1 = [
  { // P01 — lectura — Concepto de función
    titulo: "¿Qué es una función? Historia, definición y ejemplos cotidianos",
    texto: `La idea de función es una de las más poderosas de toda la matemática. Aunque el concepto formal se formalizó en el siglo XVII con Leibniz y Euler, la intuición de que una cantidad depende de otra es antiquísima: los astrónomos babilonios ya tabulaban la posición de los planetas en función del tiempo hace más de 3 000 años.\n\nUna función es una regla que a cada elemento de un conjunto (el dominio) le asigna exactamente un elemento de otro conjunto (el rango o codominio). La palabra clave es "exactamente uno": si un mismo valor de entrada produce dos valores de salida distintos, la relación no es una función.\n\nLa prueba de la línea vertical resume esto en términos gráficos: si cualquier línea vertical corta la gráfica en más de un punto, la gráfica no representa una función. Una circunferencia completa no pasa la prueba; una parábola sí.\n\nEn la vida cotidiana las funciones están en todos lados. La velocidad de un automóvil en el Periférico de la Ciudad de México es una función del tiempo: en cada instante hay exactamente una velocidad. La temperatura del Pico de Orizaba es una función de la altitud: a mayor altura, menor temperatura, con una relación aproximadamente lineal (~6°C por cada 1 000 m de ascenso). El costo de una llamada telefónica era una función del número de minutos; el precio del transporte metro es constante (función constante).\n\nLas funciones se pueden representar de cuatro maneras complementarias:\n\n**Tabular:** una tabla que muestra pares (x, y). Es discreta y fácil de leer pero limitada.\n**Gráfica:** una curva en el plano cartesiano. Permite ver tendencias, máximos y mínimos visualmente.\n**Algebraica:** una fórmula como f(x) = 2x + 3 o h(t) = -5t² + 20t. Permite calcular cualquier valor y generalizar.\n**Verbal:** una descripción en palabras como "la altura aumenta 2 metros por cada segundo transcurrido". Es la más natural pero la menos precisa.\n\nDominar las cuatro representaciones y pasar de una a otra es una habilidad central del pensamiento matemático.`,
    fuente: "Material elaborado para CEN Bachillerato — PM-IV",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 11,
    preguntas_comprension: [
      { pregunta: "¿Qué condición debe cumplir una regla para ser una función?", respuesta_guia: "Que a cada elemento del dominio le asigne exactamente un elemento del rango. Si un valor de entrada produce dos salidas distintas, no es función." },
      { pregunta: "¿Qué es la prueba de la línea vertical y para qué sirve?", respuesta_guia: "Es un criterio gráfico: si cualquier línea vertical corta la gráfica en más de un punto, la relación no es función. Sirve para identificar visualmente si una gráfica representa una función." },
      { pregunta: "Menciona dos ejemplos de funciones de la vida cotidiana en México y di qué representa cada variable.", respuesta_guia: "Ejemplos posibles: temperatura del Pico de Orizaba como función de la altitud (altitud=dominio, temperatura=rango); velocidad en el Periférico como función del tiempo; costo del metro como función constante del número de viajes." },
      { pregunta: "¿Por qué es útil conocer las cuatro representaciones de una función (tabular, gráfica, algebraica, verbal)?", respuesta_guia: "Porque cada representación destaca aspectos distintos: la tabla muestra valores específicos, la gráfica muestra tendencias visuales, la fórmula permite calcular cualquier valor y generalizar, y la descripción verbal comunica la idea en contexto." },
    ],
  },
  { // P02 — video_con_preguntas — Funciones lineales y cuadráticas: transformaciones
    url_video: "https://example.com/video-pendiente-cen",
    titulo_video: "Funciones lineales y cuadráticas: gráficas y transformaciones",
    duracion_segundos: 480,
    preguntas: [
      { tiempo_segundos: 120, pregunta: "Una función lineal tiene la forma f(x) = mx + b. ¿Qué representa m y qué representa b en la gráfica? ¿Cómo cambia la gráfica si m es negativa?", respuesta_guia: "m es la pendiente (inclinación de la recta): si m > 0 la recta sube de izquierda a derecha; si m < 0 baja. b es la ordenada al origen (punto donde la recta cruza el eje y). Si m es negativa, la recta desciende." },
      { tiempo_segundos: 290, pregunta: "Si tenemos la función g(x) = f(x) + 3, ¿cómo se transforma la gráfica de f(x)? ¿Y si es g(x) = f(x - 2)?", respuesta_guia: "g(x) = f(x) + 3 desplaza la gráfica 3 unidades hacia arriba (traslación vertical). g(x) = f(x - 2) desplaza la gráfica 2 unidades hacia la derecha (traslación horizontal). El desplazamiento horizontal es contraintuitivo: restar 2 mueve a la derecha." },
      { tiempo_segundos: 430, pregunta: "Para la función h(x) = -2x² + 8x - 5, ¿cómo sabes que es cuadrática y no lineal? ¿Abre hacia arriba o hacia abajo? ¿Cómo lo determines sin graficarla?", respuesta_guia: "Es cuadrática porque el grado más alto es 2 (tiene x²). El coeficiente a = -2 es negativo, por lo que la parábola abre hacia abajo (tiene un máximo, no un mínimo). Si a > 0 abre hacia arriba; si a < 0 abre hacia abajo." },
    ],
  },
  { // P03 — lectura — Trigonometría: medición indirecta
    titulo: "¿Cómo medimos lo que no podemos alcanzar? La trigonometría como herramienta de medición",
    texto: `Imagina que eres un ingeniero en el siglo XVI y debes calcular la altura de la Pirámide del Sol en Teotihuacán sin escalarla. O que eres un topógrafo moderno midiendo la distancia entre dos puntos separados por un barranco. La trigonometría nació precisamente para resolver este tipo de problemas: medir lo que no se puede medir directamente.\n\nLa trigonometría de triángulos rectángulos se basa en tres razones fundamentales que relacionan los lados de un triángulo con sus ángulos:\n\n**Seno (sen θ):** cateto opuesto al ángulo θ dividido entre la hipotenusa. sen θ = opuesto / hipotenusa.\n**Coseno (cos θ):** cateto adyacente al ángulo θ dividido entre la hipotenusa. cos θ = adyacente / hipotenusa.\n**Tangente (tan θ):** cateto opuesto dividido entre el cateto adyacente. tan θ = opuesto / adyacente = sen θ / cos θ.\n\nEl acrónimo SOHCAHTOA (Seno = Opuesto / Hipotenusa; Coseno = Adyacente / Hipotenusa; Tangente = Opuesto / Adyacente) es una ayuda mnemotécnica universalmente usada.\n\nEn la práctica, un topógrafo que quiere medir la altura de la Pirámide del Sol se coloca a una distancia horizontal conocida de la base, mide el ángulo de elevación hasta la cima con un teodolito, y aplica la tangente: altura = distancia × tan(ángulo). Este mismo principio se usa en GPS satelital, en astronomía para calcular distancias a estrellas cercanas (paralaje), en construcción de puentes y represas, en topografía de montañas y en la navegación marítima y aérea.\n\nLa identidad fundamental de la trigonometría —sin²θ + cos²θ = 1— se deriva directamente del Teorema de Pitágoras aplicado al círculo unitario y es la base de innumerables simplificaciones. En arquitectura colonial mexicana, los constructores usaban cuerdas con nudos en proporciones 3-4-5 para verificar ángulos rectos; hoy sus equivalentes digitales usan trigonometría computacional.\n\nDominar estas tres razones abre la puerta a resolver cualquier triángulo rectángulo: conociendo dos elementos (un lado y un ángulo, o dos lados), podemos calcular todos los demás sin medirlos físicamente.`,
    fuente: "Material elaborado para CEN Bachillerato — PM-IV",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 11,
    preguntas_comprension: [
      { pregunta: "¿Qué representan seno, coseno y tangente en un triángulo rectángulo? Escribe las tres razones con sus fórmulas.", respuesta_guia: "sen θ = cateto opuesto / hipotenusa; cos θ = cateto adyacente / hipotenusa; tan θ = cateto opuesto / cateto adyacente. Las razones relacionan cada ángulo con los lados del triángulo rectángulo." },
      { pregunta: "¿Cómo mediría la altura de la Pirámide del Sol un topógrafo usando trigonometría? Describe los pasos.", respuesta_guia: "Se coloca a una distancia horizontal d conocida de la base de la pirámide, mide el ángulo de elevación θ hasta la cima con un teodolito, y aplica: altura = d × tan(θ). También suma su altura si mide desde sus ojos." },
      { pregunta: "¿Cuál es la identidad fundamental de la trigonometría y de dónde proviene?", respuesta_guia: "sin²θ + cos²θ = 1. Se deriva del Teorema de Pitágoras aplicado a un triángulo rectángulo con hipotenusa 1 (círculo unitario): el cuadrado del cateto opuesto más el cuadrado del adyacente siempre iguala el cuadrado de la hipotenusa." },
    ],
  },
  { // P04 — infografia — El círculo unitario
    titulo: "El círculo unitario: ángulos, coordenadas y valores exactos",
    url_imagen: "/placeholder/infografia.svg",
    descripcion_accesible: "Infografía del círculo unitario (radio = 1) con los ángulos más importantes (0°, 30°, 45°, 60°, 90°, 120°, 135°, 150°, 180°, 270°, 360°) marcados sobre el círculo, sus coordenadas exactas (cos θ, sen θ), los cuatro cuadrantes con el signo de cada función trigonométrica, y la tabla de valores exactos de seno, coseno y tangente para los ángulos notables.",
    puntos_clave: [
      "El círculo unitario tiene centro en el origen (0,0) y radio 1. Para cualquier ángulo θ en posición estándar, el punto P en el círculo tiene coordenadas (cos θ, sen θ). Esto extiende las razones trigonométricas a todos los ángulos, no solo los de triángulos rectángulos.",
      "Ángulos y coordenadas exactas: 0° → (1, 0); 30° → (√3/2, 1/2); 45° → (√2/2, √2/2); 60° → (1/2, √3/2); 90° → (0, 1). La x-coordenada es siempre cos θ y la y-coordenada es siempre sen θ.",
      "Valores exactos memorables: sen 30° = cos 60° = 1/2; sen 60° = cos 30° = √3/2 ≈ 0.866; sen 45° = cos 45° = √2/2 ≈ 0.707; tan 30° = 1/√3 = √3/3; tan 45° = 1; tan 60° = √3 ≈ 1.732.",
      "Signos por cuadrante (regla CAST o ASTC): Cuadrante I (0°–90°): todos positivos. Cuadrante II (90°–180°): solo sen positivo. Cuadrante III (180°–270°): solo tan positivo. Cuadrante IV (270°–360°): solo cos positivo.",
      "Periodicidad: sen y cos se repiten cada 360° (período = 360° o 2π radianes); tan se repite cada 180° (período = 180° o π radianes). La periodicidad explica las ondas en física: sonido, luz, movimiento armónico.",
      "Relación con SOHCAHTOA: en el primer cuadrante el círculo unitario es un triángulo rectángulo con hipotenusa 1, por lo que las razones trigonométricas clásicas coinciden con las coordenadas del círculo. Esto unifica ambas definiciones.",
    ],
    fuente: "Material CEN Bachillerato — PM-IV. Valores exactos verificados.",
  },
  { // P05 — video_con_preguntas — Ley de Senos y Ley de Cosenos
    url_video: "https://example.com/video-pendiente-cen",
    titulo_video: "Ley de Senos y Cosenos: cuando los triángulos no tienen ángulo recto",
    duracion_segundos: 510,
    preguntas: [
      { tiempo_segundos: 110, pregunta: "¿Cuándo se usa la Ley de Senos y cuándo se usa la Ley de Cosenos? Da una regla práctica para decidir cuál aplicar.", respuesta_guia: "Ley de Senos (sen A/a = sen B/b = sen C/c): se usa cuando se conoce un par ángulo-lado opuesto y se necesita otro lado o ángulo (casos ALA, AAL). Ley de Cosenos (c² = a² + b² - 2ab·cos C): se usa cuando se conocen dos lados y el ángulo comprendido (caso LAL) o los tres lados (caso LLL). Si no hay ángulo recto, hay que elegir entre estas dos leyes." },
      { tiempo_segundos: 290, pregunta: "Escribe la fórmula de la Ley de Cosenos para el lado c. ¿En qué caso especial se convierte en el Teorema de Pitágoras?", respuesta_guia: "c² = a² + b² - 2ab·cos(C). Cuando C = 90°, cos(90°) = 0, por lo que el último término desaparece y queda c² = a² + b², que es exactamente el Teorema de Pitágoras. La Ley de Cosenos es la generalización del Teorema de Pitágoras para cualquier triángulo." },
      { tiempo_segundos: 450, pregunta: "Un triángulo oblicuángulo tiene los tres lados conocidos (a, b, c). ¿Cómo encuentras el ángulo A usando la Ley de Cosenos? Despeja cos(A) de la fórmula.", respuesta_guia: "De a² = b² + c² - 2bc·cos(A), despejamos: cos(A) = (b² + c² - a²) / (2bc). Luego A = arccos((b² + c² - a²) / (2bc)). Este es el caso LLL: tres lados conocidos, se buscan los ángulos." },
    ],
  },
  { // P06 — lectura — Geometría analítica y GPS
    titulo: "¿Cómo funciona el GPS? La geometría de las coordenadas en la vida real",
    texto: `Cada vez que usas Google Maps para navegar por las calles de tu ciudad, o cuando el servicio de entrega ubica tu dirección, estás usando geometría analítica. El GPS (Sistema de Posicionamiento Global) funciona midiendo distancias entre tu dispositivo y satélites en órbita, y luego calculando tu posición exacta con las mismas fórmulas que estudiaremos en este propósito.\n\nLa geometría analítica, fundada por René Descartes en el siglo XVII, es el puente entre el álgebra y la geometría. Consiste en representar figuras geométricas con ecuaciones y coordenadas en el plano cartesiano. Esta unión revolucionó las matemáticas y es la base del cálculo, la física moderna y la computación gráfica.\n\nLas tres herramientas fundamentales de la geometría analítica plana son:\n\n**Fórmula de distancia.** La distancia entre dos puntos A(x₁, y₁) y B(x₂, y₂) es:\nd = √((x₂ - x₁)² + (y₂ - y₁)²)\nEsta fórmula es simplemente el Teorema de Pitágoras aplicado en el plano cartesiano.\n\n**Fórmula del punto medio.** El punto M que está exactamente a la mitad entre A y B es:\nM = ((x₁ + x₂)/2, (y₁ + y₂)/2)\nEsto es el promedio de las coordenadas. Se usa para encontrar centros de segmentos, centros de gravedad y midpoints en diseño.\n\n**Pendiente de una recta.** La pendiente m entre A y B mide qué tan inclinada está la recta:\nm = (y₂ - y₁) / (x₂ - x₁)\nUna pendiente positiva indica que la recta sube; negativa, que baja; cero, que es horizontal; indefinida, que es vertical. Dos rectas son paralelas si tienen la misma pendiente; perpendiculares si sus pendientes son recíprocas negativas (m₁ × m₂ = -1).\n\nEn la Ciudad de México, la Avenida Insurgentes y Paseo de la Reforma se cruzan formando ángulos que los ingenieros urbanos calcularon con geometría analítica. El diseño de la Línea 12 del Metro, con sus curvas y estaciones, requirió coordenadas precisas y fórmulas de distancia para garantizar trayectorias seguras y eficientes.`,
    fuente: "Material elaborado para CEN Bachillerato — PM-IV",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 11,
    preguntas_comprension: [
      { pregunta: "¿De qué teorema proviene la fórmula de distancia entre dos puntos? Explica la conexión.", respuesta_guia: "Del Teorema de Pitágoras. Si A y B son dos puntos, la diferencia horizontal (x₂-x₁) y la diferencia vertical (y₂-y₁) forman los catetos de un triángulo rectángulo, y la distancia AB es la hipotenusa: d = √((x₂-x₁)² + (y₂-y₁)²)." },
      { pregunta: "¿Qué nos dice la pendiente de una recta y cómo se relaciona con las rectas paralelas y perpendiculares?", respuesta_guia: "La pendiente m mide la inclinación: cuánto sube (m>0) o baja (m<0) la recta por cada unidad horizontal. Rectas paralelas tienen la misma pendiente. Rectas perpendiculares tienen pendientes cuyo producto es -1 (recíprocas negativas)." },
      { pregunta: "¿Cómo se usa la geometría analítica en el GPS? Describe el principio básico.", respuesta_guia: "El GPS mide la distancia del dispositivo a varios satélites. Con la fórmula de distancia (o su equivalente en 3D), el sistema calcula la intersección de esferas centradas en los satélites para determinar la posición única del receptor." },
    ],
  },
  { // P07 — infografia — Cónicas
    titulo: "Cónicas: circunferencia y parábola como lugares geométricos",
    url_imagen: "/placeholder/infografia.svg",
    descripcion_accesible: "Infografía de las secciones cónicas con foco en la circunferencia y la parábola. Muestra la definición como lugar geométrico de cada una, sus elementos (centro, radio, vértice, foco, directriz), las ecuaciones canónicas y ejemplos de aplicaciones reales como antenas parabólicas, espejos de telescopios, arcos de puentes y ventanas circulares.",
    puntos_clave: [
      "Lugar geométrico: conjunto de todos los puntos que satisfacen una condición geométrica dada. Las cónicas son los lugares geométricos que resultan de cortar un cono doble con un plano en distintas orientaciones: circunferencia, elipse, parábola e hipérbola.",
      "Circunferencia: lugar geométrico de todos los puntos del plano que están a una distancia r (radio) de un punto fijo llamado centro C(h, k). Ecuación canónica: (x - h)² + (y - k)² = r². Si el centro es el origen: x² + y² = r².",
      "Parábola: lugar geométrico de todos los puntos del plano que equidistan de un punto fijo llamado foco F y de una recta fija llamada directriz. Ecuación canónica con eje vertical: y = a(x - h)² + k, donde (h, k) es el vértice. Si a > 0 abre hacia arriba; si a < 0 hacia abajo.",
      "Ecuaciones canónicas para identificar: circunferencia → (x-h)²+(y-k)²=r²; parábola vertical → y=a(x-h)²+k o x²=4py; parábola horizontal → x=a(y-k)²+h. La forma general de una cónica es Ax²+Bxy+Cy²+Dx+Ey+F=0.",
      "Aplicaciones reales: la parábola refleja ondas paralelas en un punto (el foco), por eso las antenas parabólicas satelitales, los espejos de telescopios reflectores, los faros de automóviles y las antenas de radio tienen forma parabólica. Los arcos de puentes (Puente Atirantado de Tampico, viaductos de la CDMX) usan curvas cónicas por su resistencia estructural.",
      "Identificación rápida: si los coeficientes de x² e y² son iguales y positivos → circunferencia. Si uno de los términos cuadráticos está ausente → parábola. Si ambos están presentes con coeficientes distintos y del mismo signo → elipse. Si tienen signos opuestos → hipérbola.",
    ],
    fuente: "Material CEN Bachillerato — PM-IV.",
  },
];

// ── CONTENIDOS A2 ─────────────────────────────────────────────────────────────

const contenidosA2 = [
  { // P01 — ejercicio_matematico — Concepto de función: tabla de valores
    problema: "Se registró la temperatura (en °C) de una taza de café en reposo a lo largo del tiempo:\n\n| Tiempo (min) | 0 | 2 | 4 | 6 | 8 |\n| Temperatura (°C) | 90 | 78 | 66 | 54 | 42 |\n\n(a) ¿La tabla representa una función? Justifica usando la definición.\n(b) Determina la regla algebraica que relaciona el tiempo t y la temperatura T. (Pista: observa cuánto disminuye T cada 2 minutos.)\n(c) Usando la regla encontrada, calcula la temperatura a los 10 minutos.\n(d) Según el modelo, ¿a qué tiempo la temperatura llegará a 20°C? Plantea y resuelve la ecuación.",
    tipo_respuesta: "desarrollo" as const,
    pasos_guia: [
      "(a) Verifica que a cada valor de t (0, 2, 4, 6, 8) le corresponde exactamente un valor de T. Sí es función: cada entrada tiene una única salida.",
      "(b) Observa el cambio: T disminuye 12°C cada 2 minutos → tasa de cambio = -6°C por minuto. En t=0, T=90. Regla: T(t) = 90 - 6t.",
      "(c) Sustituye t=10: T(10) = 90 - 6(10) = 90 - 60 = 30°C.",
      "(d) Resuelve 90 - 6t = 20 → 6t = 70 → t = 70/6 ≈ 11.67 minutos.",
      "Verifica: T(11.67) = 90 - 6(11.67) = 90 - 70 = 20°C. ✓",
    ],
    respuesta_final: "(a) Sí es función: cada tiempo tiene exactamente una temperatura. (b) T(t) = 90 - 6t. (c) T(10) = 30°C. (d) t = 70/6 ≈ 11.7 minutos.",
    tolerancia_error: 0.1,
    unidades: "°C y minutos",
  },
  { // P02 — ejercicio_matematico — Función cuadrática: tiro parabólico
    problema: "Desde la azotea de un edificio en Guadalajara, se lanza verticalmente hacia arriba una pelota. La altura (en metros sobre el suelo) en función del tiempo (en segundos) está dada por:\n\nh(t) = -5t² + 20t + 1\n\ndonde t es el tiempo en segundos y 1 metro es la altura inicial de lanzamiento sobre la azotea.\n\n(a) ¿A qué tiempo alcanza la pelota su altura máxima?\n(b) ¿Cuál es la altura máxima?\n(c) ¿En qué tiempo la pelota llega al suelo (h = 0)? Plantea la ecuación y usa la fórmula general.\n(d) ¿Cuál es el dominio físico razonable de esta función?",
    tipo_respuesta: "desarrollo" as const,
    pasos_guia: [
      "(a) El vértice de una parábola f(t) = at² + bt + c tiene su abscisa en t_v = -b / (2a). Identifica a = -5, b = 20.",
      "(a) t_v = -20 / (2 × (-5)) = -20 / (-10) = 2 segundos.",
      "(b) Sustituye t = 2 en h(t): h(2) = -5(4) + 20(2) + 1 = -20 + 40 + 1 = 21 metros.",
      "(c) Resuelve -5t² + 20t + 1 = 0. Aplica la fórmula: t = (-20 ± √(400 + 20)) / (-10) = (-20 ± √420) / (-10).",
      "(c) √420 ≈ 20.49. Raíces: t = (-20 + 20.49)/(-10) ≈ -0.049 (descarta: negativo) y t = (-20 - 20.49)/(-10) ≈ 4.05 s.",
      "(d) El dominio físico es 0 ≤ t ≤ 4.05 s (desde el lanzamiento hasta que toca el suelo).",
    ],
    respuesta_final: "(a) t = 2 s. (b) Altura máxima = 21 m. (c) La pelota llega al suelo en t ≈ 4.05 s. (d) Dominio físico: [0, 4.05] segundos.",
    tolerancia_error: 0.05,
    unidades: "metros y segundos",
  },
  { // P03 — ejercicio_matematico — Razones trigonométricas: altura de un árbol
    problema: "Daniela tiene 1.70 m de estatura (desde el suelo hasta sus ojos). Está parada a 15 metros de la base de un árbol en el Bosque de Chapultepec. Cuando levanta la vista hacia la cima del árbol, forma un ángulo de elevación de 35°.\n\n(a) Dibuja el triángulo rectángulo que describe la situación (opcional pero recomendado).\n(b) ¿Qué razón trigonométrica relaciona el ángulo de elevación con la distancia horizontal y la altura desconocida?\n(c) Calcula la altura del árbol sobre el nivel de los ojos de Daniela. (Usa tan 35° ≈ 0.7002.)\n(d) ¿Cuánto mide el árbol desde el suelo?\n(e) Calcula la longitud de la línea de visión de Daniela hasta la cima del árbol (hipotenusa). (Usa cos 35° ≈ 0.8192.)",
    tipo_respuesta: "numerica" as const,
    pasos_guia: [
      "(b) La tangente relaciona el cateto opuesto (altura sobre los ojos) con el cateto adyacente (distancia horizontal): tan(35°) = altura_sobre_ojos / 15.",
      "(c) Despeja: altura_sobre_ojos = 15 × tan(35°) = 15 × 0.7002 = 10.503 m.",
      "(d) Altura total = altura_sobre_ojos + estatura de Daniela = 10.503 + 1.70 = 12.203 m.",
      "(e) Línea de visión (hipotenusa): cos(35°) = 15 / hipotenusa → hipotenusa = 15 / cos(35°) = 15 / 0.8192 ≈ 18.31 m.",
      "Verificación con Pitágoras: √(15² + 10.503²) = √(225 + 110.31) = √335.31 ≈ 18.31 m. ✓",
    ],
    respuesta_final: "(c) Altura sobre los ojos ≈ 10.50 m. (d) Altura total del árbol ≈ 12.20 m. (e) Longitud de la línea de visión ≈ 18.31 m.",
    tolerancia_error: 0.05,
    unidades: "metros",
  },
  { // P04 — ejercicio_matematico — Círculo unitario: valores exactos
    problema: "Usando el círculo unitario y los valores exactos de las razones trigonométricas:\n\n(a) Encuentra sen(150°), cos(150°) y tan(150°) usando el ángulo de referencia en el Cuadrante II.\n(b) Encuentra cos(270°) y sen(270°) directamente de las coordenadas del círculo unitario.\n(c) Calcula tan(45°) usando sus valores exactos. Verifica la identidad: sen²(45°) + cos²(45°) = 1.\n(d) En el círculo unitario, ¿en qué cuadrante está el ángulo 225°? ¿Cuáles son sus valores exactos de seno y coseno?",
    tipo_respuesta: "desarrollo" as const,
    pasos_guia: [
      "(a) El ángulo de referencia de 150° es 180° - 150° = 30°. En el cuadrante II: sen > 0, cos < 0.",
      "(a) sen(150°) = sen(30°) = 1/2. cos(150°) = -cos(30°) = -√3/2. tan(150°) = sen/cos = (1/2)/(-√3/2) = -1/√3 = -√3/3.",
      "(b) 270° está en el eje negativo de las y. Las coordenadas del punto son (0, -1). Por lo tanto cos(270°) = 0 y sen(270°) = -1.",
      "(c) tan(45°) = sen(45°)/cos(45°) = (√2/2)/(√2/2) = 1. Verificación: sen²(45°) + cos²(45°) = (√2/2)² + (√2/2)² = 1/2 + 1/2 = 1. ✓",
      "(d) 225° = 180° + 45°, está en el Cuadrante III (entre 180° y 270°). En el Q-III sen < 0 y cos < 0. Ángulo de referencia = 45°. sen(225°) = -√2/2, cos(225°) = -√2/2.",
    ],
    respuesta_final: "(a) sen(150°)=1/2, cos(150°)=-√3/2, tan(150°)=-√3/3. (b) cos(270°)=0, sen(270°)=-1. (c) tan(45°)=1; identidad verificada: 1/2+1/2=1. (d) Q-III: sen(225°)=-√2/2, cos(225°)=-√2/2.",
    tolerancia_error: 0,
    unidades: "valores adimensionales (razones trigonométricas)",
  },
  { // P05 — ejercicio_matematico — Ley de Cosenos: terreno triangular
    problema: "Un terreno triangular en las afueras de Oaxaca tiene dos lados medidos con cinta métrica: a = 80 m y b = 95 m. El ángulo C entre esos dos lados mide 42°.\n\n(a) Escribe la fórmula de la Ley de Cosenos para encontrar el lado c (opuesto al ángulo C).\n(b) Sustituye los valores y calcula c. (Usa cos 42° ≈ 0.7431.)\n(c) Calcula el perímetro del terreno.\n(d) Calcula el área del triángulo usando la fórmula: Área = (1/2)·a·b·sen(C). (Usa sen 42° ≈ 0.6691.)",
    tipo_respuesta: "numerica" as const,
    pasos_guia: [
      "(a) Ley de Cosenos: c² = a² + b² - 2·a·b·cos(C). Identifica a = 80, b = 95, C = 42°.",
      "(b) c² = (80)² + (95)² - 2·(80)·(95)·cos(42°) = 6400 + 9025 - 15200 × 0.7431.",
      "(b) c² = 15425 - 11295.12 = 4129.88. c = √4129.88 ≈ 64.26 m.",
      "(c) Perímetro = a + b + c = 80 + 95 + 64.26 = 239.26 m.",
      "(d) Área = (1/2)·80·95·sen(42°) = (1/2)·7600·0.6691 = 3800 × 0.6691 ≈ 2542.58 m².",
    ],
    respuesta_final: "(b) c ≈ 64.26 m. (c) Perímetro ≈ 239.26 m. (d) Área ≈ 2542.58 m².",
    tolerancia_error: 0.5,
    unidades: "metros y metros cuadrados",
  },
  { // P06 — ejercicio_matematico — Geometría analítica: distancia, punto medio, pendiente
    problema: "Dos técnicos de una empresa de telecomunicaciones colocan repetidoras de señal en dos puntos del mapa de la Ciudad de México, representados en coordenadas (en kilómetros desde un punto de referencia central) como:\n\nA(2, -1) y B(8, 7)\n\n(a) Calcula la distancia entre las dos repetidoras.\n(b) Encuentra el punto medio M entre A y B (donde colocarán un amplificador de señal).\n(c) Calcula la pendiente de la recta que une A con B.\n(d) Escribe la ecuación de la recta que pasa por A y B en la forma pendiente-intercepto (y = mx + b).\n(e) ¿Cuánto mide cada segmento AM y MB? ¿Confirman que M es el punto medio?",
    tipo_respuesta: "desarrollo" as const,
    pasos_guia: [
      "(a) d = √((x₂-x₁)² + (y₂-y₁)²) = √((8-2)² + (7-(-1))²) = √(36 + 64) = √100 = 10 km.",
      "(b) M = ((2+8)/2, (-1+7)/2) = (10/2, 6/2) = (5, 3).",
      "(c) m = (y₂-y₁)/(x₂-x₁) = (7-(-1))/(8-2) = 8/6 = 4/3.",
      "(d) Usa la forma punto-pendiente con A(2,-1) y m=4/3: y - (-1) = (4/3)(x - 2) → y + 1 = (4/3)x - 8/3 → y = (4/3)x - 8/3 - 1 = (4/3)x - 11/3.",
      "(e) AM = √((5-2)² + (3-(-1))²) = √(9+16) = √25 = 5 km. MB = √((8-5)²+(7-3)²) = √(9+16) = 5 km. AM = MB = 5 = d/2. ✓",
    ],
    respuesta_final: "(a) d = 10 km. (b) M = (5, 3). (c) m = 4/3. (d) y = (4/3)x - 11/3. (e) AM = MB = 5 km, confirma que M es el punto medio.",
    tolerancia_error: 0,
    unidades: "kilómetros",
  },
  { // P07 — quiz_multiple_opcion — Cónicas: circunferencia y parábola
    preguntas: [
      {
        enunciado: "¿Cuál es la ecuación de la circunferencia con centro en (3, -2) y radio 5?",
        opciones: [
          "(x + 3)² + (y - 2)² = 25",
          "(x - 3)² + (y + 2)² = 25",
          "(x - 3)² + (y + 2)² = 5",
          "(x + 3)² + (y - 2)² = 5",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "La ecuación canónica de la circunferencia con centro (h, k) y radio r es (x-h)² + (y-k)² = r². Con h=3, k=-2 y r=5: (x-3)² + (y-(-2))² = 5² → (x-3)² + (y+2)² = 25.",
      },
      {
        enunciado: "La ecuación x² + y² - 4x + 6y - 3 = 0 representa una circunferencia. ¿Cuál es su centro?",
        opciones: ["(-2, 3)", "(2, -3)", "(4, -6)", "(-4, 6)"],
        respuesta_correcta: 1,
        retroalimentacion: "Completando el cuadrado: (x²-4x+4) + (y²+6y+9) = 3+4+9 → (x-2)²+(y+3)²=16. El centro es (2,-3) y el radio es 4.",
      },
      {
        enunciado: "La parábola y = 2(x - 1)² + 3 tiene su vértice en:",
        opciones: ["(1, 3)", "(-1, -3)", "(2, 3)", "(1, -3)"],
        respuesta_correcta: 0,
        retroalimentacion: "En la forma y = a(x-h)² + k, el vértice es el punto (h, k). Aquí h=1 y k=3, así que el vértice es (1, 3). Como a=2>0, la parábola abre hacia arriba y el vértice es un mínimo.",
      },
      {
        enunciado: "¿Cuál de las siguientes ecuaciones representa una parábola que abre hacia abajo?",
        opciones: [
          "y = 3x² + 2x - 1",
          "x² + y² = 16",
          "y = -½x² + 4x",
          "y = (x + 2)² - 5",
        ],
        respuesta_correcta: 2,
        retroalimentacion: "Una parábola y = ax² + bx + c abre hacia abajo cuando a < 0. En y = -½x² + 4x, el coeficiente a = -½ < 0, por lo que abre hacia abajo y tiene un máximo. La opción b es una circunferencia; c y d tienen a > 0 (abren hacia arriba).",
      },
      {
        enunciado: "¿Cuál es la aplicación tecnológica que aprovecha la propiedad reflexiva de la parábola (que los rayos paralelos al eje se reflejan en el foco)?",
        opciones: [
          "Las ventanas circulares de los aviones",
          "Las antenas parabólicas satelitales y los espejos de telescopios reflectores",
          "Los arcos de los puentes colgantes (que son catenarias, no parábolas)",
          "Las pantallas curvas de televisores OLED",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "La propiedad de la parábola establece que toda onda paralela al eje se refleja hacia el foco. Las antenas parabólicas concentran las señales satelitales en el receptor colocado en el foco. Los espejos de los telescopios reflectores (Cassegrain, Newton) usan paraboloides por la misma razón.",
      },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
];

// ── CONTENIDOS A3 ─────────────────────────────────────────────────────────────

const contenidosA3 = [
  { // P01 — reflexion_escrita — Una función en mi vida cotidiana
    prompt: "Piensa en tu rutina diaria: tu trayecto a la escuela, el gasto semanal de tu familia, el tiempo que tardas en hacer tarea según el número de materias, el saldo de tu tarjeta de transporte, la temperatura del día.\n\nElige una de estas situaciones (u otra que prefieras) donde una cantidad depende de otra, y descríbela usando las cuatro representaciones de una función:\n\n1. **Verbal:** describe la relación en palabras completas.\n2. **Tabular:** proporciona una tabla con al menos 5 pares de valores (x, y) con valores inventados pero realistas.\n3. **Gráfica:** describe cómo se vería la gráfica (¿es una línea recta? ¿una curva? ¿sube o baja? ¿dónde empieza?).\n4. **Algebraica:** escribe la fórmula que modela la relación (puede ser simple como f(x) = 2x + 5).\n\nPor último, identifica el dominio y el rango físicamente razonables de tu función.",
    pistas: [
      "Ejemplo: el costo del camión en CDMX (precio fijo = función constante). Pero busca algo más interesante para ti.",
      "Si el trayecto de tu casa a la escuela es de 3 km y caminas a 5 km/h, la distancia recorrida en función del tiempo es d(t) = 5t.",
      "La tabla debe mostrar valores concretos con unidades: no solo 'x' e 'y', sino 'tiempo (min)' y 'distancia (km)'.",
      "Si no puedes encontrar la fórmula exacta, aproxima: ¿la relación es lineal (línea recta)? ¿cuadrática (curva)?",
    ],
    longitud_minima_palabras: 80,
    criterios_evaluacion: [
      "Describe una situación real cotidiana donde una cantidad depende de otra",
      "Presenta las cuatro representaciones (verbal, tabular, gráfica, algebraica) con coherencia entre ellas",
      "Los valores de la tabla son razonables y consistentes con la fórmula",
      "Identifica el dominio y el rango con unidades apropiadas",
    ],
  },
  { // P02 — autoevaluacion — Transformaciones de funciones
    criterios: [
      {
        descripcion: "Identifico si una función es lineal o cuadrática a partir de su fórmula, tabla o gráfica, y justifico mi respuesta.",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "Confundo funciones lineales y cuadráticas, o solo puedo identificarlas cuando están en forma estándar simple." },
          { valor: 2, etiqueta: "En desarrollo", descripcion: "Identifico el tipo de función en forma estándar pero tengo dificultad cuando está transformada (ej. y = 2(x-3)² + 1)." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Identifico funciones lineales y cuadráticas en cualquier representación (tabla, gráfica, fórmula) y justifico usando el grado o la forma de la gráfica." },
        ],
      },
      {
        descripcion: "Aplico transformaciones a funciones: traslaciones verticales y horizontales, reflexiones y escalamientos.",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "No comprendo cómo las transformaciones afectan la gráfica; confundo traslaciones verticales con horizontales." },
          { valor: 2, etiqueta: "En desarrollo", descripcion: "Aplico traslaciones verticales (y=f(x)+k) correctamente pero cometo errores en las horizontales (y=f(x-h)) o en la dirección del desplazamiento." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Aplico las cuatro transformaciones básicas (traslación vertical/horizontal, reflexión en eje x/y, escalamiento) y puedo predecir la gráfica transformada sin graficarla." },
        ],
      },
      {
        descripcion: "Encuentro el vértice, la apertura, el dominio y el rango de una función cuadrática.",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "No recuerdo la fórmula del vértice o no sé determinar si la parábola abre hacia arriba o abajo." },
          { valor: 2, etiqueta: "En desarrollo", descripcion: "Calculo el vértice y la apertura correctamente, pero cometo errores al determinar el dominio y el rango, especialmente cuando la parábola tiene máximo." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Encuentro el vértice (x_v = -b/2a), determino apertura (signo de a), establezco el dominio (todos los reales) y el rango correctamente ([y_v, ∞) si a>0 o (-∞, y_v] si a<0)." },
        ],
      },
      {
        descripcion: "Modelo situaciones reales con funciones lineales o cuadráticas y las interpreto en contexto.",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "Solo resuelvo ejercicios abstractos; no sé cómo plantear un problema real con una función." },
          { valor: 2, etiqueta: "En desarrollo", descripcion: "Puedo plantear la función para un problema dado, pero cometo errores al interpretar el significado de los resultados (vértice, ceros) en contexto físico." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Planteo y resuelvo modelos con funciones lineales y cuadráticas en contextos reales, e interpreto el vértice, los ceros y la apertura en términos del problema." },
        ],
      },
    ],
    reflexion_final_prompt: "¿En qué criterio obtuviste la puntuación más baja? Escribe un ejemplo propio (inventado por ti) de una función que te ayude a practicar ese aspecto específico.",
  },
  { // P03 — reflexion_escrita — Trigonometría en arquitectura e ingeniería mexicana
    prompt: "Los ingenieros y arquitectos que construyen puentes, edificios, carreteras y monumentos usan trigonometría a diario. En México existen ejemplos fascinantes: la Pirámide del Sol en Teotihuacán, el Puente Baluarte en Sinaloa/Durango (el puente atirantado más alto del mundo en su momento), la Torre Latinoamericana en la CDMX, o el Puente Mezcala en Guerrero.\n\nReflexiona y responde:\n\n1. **Caso histórico:** ¿Cómo pudieron los topógrafos del siglo XIX o XX medir la altura de la Pirámide del Sol usando trigonometría sin modernos instrumentos láser? Describe el procedimiento paso a paso con las razones trigonométricas.\n\n2. **Caso moderno:** Elige una obra de ingeniería en México (puede ser de tu estado o ciudad) y describe cómo crees que la trigonometría fue necesaria para su diseño o construcción.\n\n3. **Reflexión personal:** ¿Cambia tu percepción de las matemáticas saber que herramientas como la tangente y el seno se usan para construir el mundo físico que habitamos?",
    pistas: [
      "Para medir la Pirámide del Sol: necesitas una distancia horizontal conocida, un instrumento para medir ángulos (teodolito, o en el pasado astrolabios), y la fórmula altura = distancia × tan(ángulo de elevación).",
      "El Puente Baluarte tiene torres de 152 m y cables inclinados: los ángulos de los cables se calcularon con trigonometría para garantizar la tensión correcta.",
      "No necesitas inventar datos precisos: describe el método y las razones que usarías.",
      "Piensa en tu propio estado o ciudad: ¿hay presas, puentes, torres de comunicación, pirámides o edificios altos cerca?",
    ],
    longitud_minima_palabras: 80,
    criterios_evaluacion: [
      "Describe el procedimiento trigonométrico para medir la Pirámide del Sol con pasos claros y las razones correctas (tangente, ángulo de elevación)",
      "Elige una obra de ingeniería real en México y describe el uso específico de la trigonometría en su construcción",
      "Reflexiona de forma personal y argumentada sobre la utilidad de las matemáticas en la ingeniería",
    ],
  },
  { // P04 — quiz_multiple_opcion — Círculo unitario
    preguntas: [
      {
        enunciado: "En el círculo unitario, el punto correspondiente al ángulo 90° tiene coordenadas:",
        opciones: ["(1, 0)", "(0, 1)", "(0, -1)", "(-1, 0)"],
        respuesta_correcta: 1,
        retroalimentacion: "En 90° (apuntando directamente hacia arriba sobre el eje y positivo), las coordenadas son (cos 90°, sen 90°) = (0, 1). La x-coordenada es el coseno y la y-coordenada es el seno.",
      },
      {
        enunciado: "¿En qué cuadrante tiene sen < 0 y cos > 0?",
        opciones: ["Cuadrante I", "Cuadrante II", "Cuadrante III", "Cuadrante IV"],
        respuesta_correcta: 3,
        retroalimentacion: "En el Cuadrante IV (270°–360° o equivalentemente entre el eje x positivo y el eje y negativo): la x-coordenada (coseno) es positiva y la y-coordenada (seno) es negativa. Regla CAST: en Q-IV solo el coseno es positivo.",
      },
      {
        enunciado: "¿Cuál es el valor exacto de sen(120°)?",
        opciones: ["-√3/2", "1/2", "√3/2", "-1/2"],
        respuesta_correcta: 2,
        retroalimentacion: "120° está en el Cuadrante II. El ángulo de referencia es 180° - 120° = 60°. En Q-II el seno es positivo. sen(120°) = +sen(60°) = √3/2 ≈ 0.866.",
      },
      {
        enunciado: "La función tangente (tan θ) es indefinida cuando:",
        opciones: ["sen θ = 0", "cos θ = 0", "sen θ = cos θ", "tan θ = 1"],
        respuesta_correcta: 1,
        retroalimentacion: "tan θ = sen θ / cos θ. La división es indefinida cuando el denominador es cero, es decir, cuando cos θ = 0. Esto ocurre en θ = 90°, 270°, 450°, etc. (múltiplos impares de 90°).",
      },
      {
        enunciado: "El período de la función coseno es 360° (o 2π radianes). Esto significa que:",
        opciones: [
          "cos(θ) = cos(θ + 90°) para cualquier ángulo θ",
          "cos(θ) = cos(θ + 360°) para cualquier ángulo θ",
          "cos(θ) siempre es positivo",
          "cos(θ + 180°) = cos(θ) para cualquier ángulo θ",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "El período 360° significa que la función se repite exactamente cada 360°: cos(θ) = cos(θ + 360°). Esto se puede verificar en el círculo unitario: dar una vuelta completa (360°) te devuelve al mismo punto, con las mismas coordenadas.",
      },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P05 — reflexion_escrita — Mido un lago con trigonometría
    prompt: "Imagina esta situación: estás en una excursión en la Sierra Norte de Puebla y necesitas calcular el ancho de un lago alargado. No tienes GPS, no puedes nadar hasta el otro lado, y la cinta métrica solo alcanza 30 metros. Solo tienes: una cinta métrica, un transportador de ángulos (para medir ángulos en el terreno), y los conocimientos de la Ley de Senos y la Ley de Cosenos.\n\nDiseña una estrategia para medir la distancia a través del lago. Responde:\n\n1. ¿Qué mediciones tomarías desde la orilla? ¿Cómo organizarías los puntos de referencia?\n2. ¿Usarías la Ley de Senos o la Ley de Cosenos? ¿Por qué esa y no la otra?\n3. Inventa un escenario numérico concreto (con valores posibles) y aplica la fórmula para calcular la distancia.\n4. ¿Qué fuentes de error podrían afectar tu medición en el terreno real? ¿Cómo las minimizarías?",
    pistas: [
      "Clásico método de triangulación: desde la orilla, fija dos puntos A y B separados una distancia conocida d. Desde A y B, mide los ángulos hacia un punto P en la otra orilla. Ahora tienes un triángulo con un lado (AB) y dos ángulos conocidos: Ley de Senos.",
      "Si mides dos lados y el ángulo entre ellos (desde un punto, mides la distancia a dos puntos de la otra orilla y el ángulo entre las líneas de visión): usa la Ley de Cosenos.",
      "Para la Ley de Senos: si A=α, B=β, AB=c, entonces AP = c·sen(β)/sen(180°-α-β).",
      "Fuentes de error: irregularidad del terreno, dificultad para medir ángulos con precisión, refracción visual sobre el agua.",
    ],
    longitud_minima_palabras: 80,
    criterios_evaluacion: [
      "Propone un método de triangulación coherente con los instrumentos disponibles",
      "Justifica correctamente la elección entre Ley de Senos y Ley de Cosenos según los datos disponibles",
      "Aplica la fórmula elegida con un ejemplo numérico inventado y obtiene un resultado",
      "Identifica al menos dos fuentes de error reales y propone una forma de reducirlas",
    ],
  },
  { // P06 — autoevaluacion — Geometría analítica
    criterios: [
      {
        descripcion: "Calculo correctamente la distancia entre dos puntos en el plano cartesiano usando la fórmula d = √((x₂-x₁)² + (y₂-y₁)²).",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "No recuerdo la fórmula o cometo errores en las operaciones con coordenadas negativas." },
          { valor: 2, etiqueta: "En desarrollo", descripcion: "Aplico la fórmula correctamente en casos simples pero cometo errores cuando las coordenadas son negativas o fraccionarias." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Calculo distancias con precisión en cualquier caso, incluyendo coordenadas negativas, y sé que la fórmula proviene del Teorema de Pitágoras." },
        ],
      },
      {
        descripcion: "Encuentro el punto medio entre dos puntos y comprendo su significado geométrico.",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "No recuerdo la fórmula del punto medio o la confundo con la fórmula de distancia." },
          { valor: 2, etiqueta: "En desarrollo", descripcion: "Calculo el punto medio correctamente pero no puedo explicar por qué la fórmula es el promedio de las coordenadas." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Calculo el punto medio con la fórmula M = ((x₁+x₂)/2, (y₁+y₂)/2), verifico que las distancias al punto medio sean iguales, y explico que es el promedio de coordenadas." },
        ],
      },
      {
        descripcion: "Calculo la pendiente de una recta y la interpreto en contexto (inclinación, dirección, rectas paralelas y perpendiculares).",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "No recuerdo la fórmula de la pendiente o confundo el orden de las coordenadas (y₂-y₁ vs x₂-x₁)." },
          { valor: 2, etiqueta: "En desarrollo", descripcion: "Calculo la pendiente correctamente pero no puedo interpretar su significado ni usarla para identificar rectas paralelas o perpendiculares." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Calculo m = (y₂-y₁)/(x₂-x₁), interpreto el signo y la magnitud, determino paralelismo (misma m) y perpendicularidad (m₁·m₂=-1), y escribo la ecuación de la recta." },
        ],
      },
      {
        descripcion: "Escribo la ecuación de una recta en distintas formas (pendiente-intercepto, punto-pendiente, general) y paso de una a otra.",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "Solo reconozco la forma y = mx + b; no puedo escribir la ecuación de una recta si me dan un punto y la pendiente." },
          { valor: 2, etiqueta: "En desarrollo", descripcion: "Uso correctamente la forma pendiente-intercepto, pero cometo errores al usar la forma punto-pendiente o al convertir a la forma general Ax+By+C=0." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Escribo la ecuación de la recta en cualquiera de las tres formas y puedo convertir entre ellas dado un punto y la pendiente, o dos puntos." },
        ],
      },
    ],
    reflexion_final_prompt: "¿En qué criterio sientes que tienes más dificultades? Escribe dos ejemplos propios (con tus propios números) que te sirvan para practicar ese criterio específico antes del siguiente propósito.",
  },
  { // P07 — reflexion_escrita — Cónicas en el mundo real
    prompt: "Las cónicas están en todas partes: en la arquitectura, la tecnología, la naturaleza y el arte. Busca (en tu entorno, en internet o en tu imaginación) al menos dos ejemplos de cónicas en el mundo real, uno que sea una circunferencia y uno que sea una parábola.\n\nPara cada ejemplo responde:\n\n1. **¿Qué objeto o fenómeno es?** Descríbelo concretamente (una antena parabólica en tu azotea, el arco del estadio de tu ciudad, una ventana circular de iglesia, etc.).\n2. **¿Por qué esa forma cónica?** ¿Qué ventaja matemática o física tiene esa forma en ese contexto específico?\n3. **Ecuación aproximada:** Inventa o estima valores y escribe la ecuación canónica de esa cónica (para la circunferencia: (x-h)²+(y-k)²=r²; para la parábola: y = a(x-h)² + k). Explica qué significan los parámetros en tu ejemplo.\n4. **Reflexión:** ¿Te sorprende que una fórmula matemática describa perfectamente un objeto físico? ¿Por qué crees que la naturaleza y la ingeniería tienden a producir formas cónicas?",
    pistas: [
      "Parábola: antena parabólica satelital (concentra señal en el foco), faros de automóviles (proyectan luz paralela desde el foco), espejos de telescopios, trayectoria de un balón (aproximadamente).",
      "Circunferencia: ruedas, relojes, monedas, la base de una taza, ventanas circulares (óculo), la pupila del ojo, anillos de árboles, sección de un cilindro.",
      "Para la ecuación, no necesitas medidas exactas: estima. Una antena parabólica de 0.6 m de diámetro podría modelarse con y = 2x², con vértice en el origen.",
      "La razón por la que la parábola es tan útil tecnológicamente es su propiedad reflectante: todo rayo paralelo al eje converge en el foco (y viceversa).",
    ],
    longitud_minima_palabras: 80,
    criterios_evaluacion: [
      "Identifica un ejemplo real de circunferencia con descripción concreta y justificación de la forma",
      "Identifica un ejemplo real de parábola con descripción concreta y justificación de por qué esa forma es útil allí",
      "Escribe la ecuación canónica de cada cónica con parámetros que tengan sentido en el contexto descrito",
      "Reflexiona de forma personal sobre la relación entre formas matemáticas y el mundo físico",
    ],
  },
];

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
