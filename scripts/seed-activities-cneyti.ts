/**
 * Seed de actividades pedagógicas para CNEYT-I (Ciencias Naturales, Experimentación y Tecnología I).
 * 8 progresiones × 3 actividades = 24 actividades. estado='borrador'.
 * A1=lectura, A2=quiz_multiple_opcion, A3=reflexion_escrita.
 * Uso: npx tsx scripts/seed-activities-cneyti.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🌱 Seed actividades CNEYT-I — Ciencias Naturales I\n");

  const progs = await getProgresionesDeUAC(sb, "CNEYT-I");
  let ok = 0; let fail = 0;

  for (const p of progs) {
    const base = p.codigo;

    const a1ok = await upsertActividad(sb, {
      codigo: `${base}-A1`,
      titulo: titulos[p.numero - 1].a1,
      descripcion: "Lectura de contextualización sobre ciencias naturales.",
      tipo: "lectura",
      progresion_id: p.id,
      xp: 10,
      contenido: lecturas[p.numero - 1],
    });
    a1ok ? ok++ : fail++;

    const a2ok = await upsertActividad(sb, {
      codigo: `${base}-A2`,
      titulo: titulos[p.numero - 1].a2,
      descripcion: "Quiz de comprensión conceptual científica.",
      tipo: "quiz_multiple_opcion",
      progresion_id: p.id,
      xp: 15,
      contenido: quizzes[p.numero - 1],
    });
    a2ok ? ok++ : fail++;

    const a3ok = await upsertActividad(sb, {
      codigo: `${base}-A3`,
      titulo: titulos[p.numero - 1].a3,
      descripcion: "Reflexión escrita de cierre y aplicación al entorno.",
      tipo: "reflexion_escrita",
      progresion_id: p.id,
      xp: 20,
      contenido: reflexiones[p.numero - 1],
    });
    a3ok ? ok++ : fail++;
  }

  log(`\n✅ CNEYT-I: ${ok} actividades insertadas, ${fail} fallidas.\n`);
}

// ── TÍTULOS ───────────────────────────────────────────────────────────────────

const titulos = [
  { a1: "Las ciencias: una práctica humana, no un conjunto de verdades absolutas", a2: "¿Qué sé sobre cómo funciona la ciencia?", a3: "Mi relación con el conocimiento científico" },
  { a1: "La materia y sus propiedades: lo que todo lo compone", a2: "Propiedades físicas y químicas de la materia", a3: "La materia en mi entorno cotidiano" },
  { a1: "El átomo: la unidad fundamental de la materia", a2: "Estructura atómica: componentes y propiedades", a3: "¿Por qué importa conocer el átomo?" },
  { a1: "Sustancias puras, mezclas y métodos de separación", a2: "¿Es mezcla o sustancia pura?", a3: "Separando mezclas en la cocina y la industria" },
  { a1: "Los estados de la materia y sus cambios", a2: "¿En qué estado está y por qué cambia?", a3: "Los estados de la materia en mi vida diaria" },
  { a1: "El método científico: cómo conocemos la naturaleza", a2: "Pasos del método científico", a3: "Diseño mi propia pequeña investigación" },
  { a1: "Ciencia con historia: mujeres y grupos marginados en el desarrollo científico", a2: "Científicas y científicos invisibilizados", a3: "La ciencia que no nos contaron" },
  { a1: "Materia, transformaciones y medio ambiente", a2: "Transformaciones de la materia y problemas ambientales", a3: "Mi huella en el entorno natural" },
];

// ── LECTURAS (A1) ─────────────────────────────────────────────────────────────

const lecturas = [
  { // P01 — ciencia como práctica social
    texto: `La ciencia suele presentarse en los libros de texto como un conjunto de hechos establecidos y verdades definitivas. Pero esta imagen distorsiona profundamente lo que la ciencia realmente es: una práctica social, histórica y colectiva, llena de errores, debates, revisiones y contextos culturales.\n\nLa ciencia se hace en laboratorios, universidades, instituciones y comunidades. Los científicos son personas con biografías, intereses, creencias y sesgos. Las preguntas que investigan no son neutrales: responden a las necesidades, intereses y valores de su época. El desarrollo de la física nuclear durante la Segunda Guerra Mundial fue posible gracias a enormes inversiones militares. La farmacología moderna está influida por los intereses de la industria.\n\nEsto no significa que la ciencia sea "solo opinión" o que todo valga. Significa que el conocimiento científico se construye colectivamente mediante procesos de revisión, debate, replicación de experimentos y crítica entre pares. Una hipótesis que nadie puede refutar (porque está mal diseñada para ser refutable) no es científica: es dogma.\n\nAdmitir que la ciencia es una práctica humana imperfecta no la invalida: al contrario, hace que confiemos en ella por mejores razones. Confiamos en la ciencia no porque los científicos sean infalibles, sino porque el método científico incluye mecanismos para detectar y corregir errores.`,
    fuente: "Material elaborado para CEN Bachillerato",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 8,
    preguntas_comprension: [
      { pregunta: "¿Por qué el texto dice que la imagen de la ciencia en los libros de texto es distorsionada?", respuesta_guia: "Porque presenta la ciencia como hechos definitivos, cuando en realidad es una práctica social llena de errores, debates y revisiones." },
      { pregunta: "¿Qué hace que el conocimiento científico sea confiable según el texto?", respuesta_guia: "El método científico incluye mecanismos para detectar y corregir errores mediante revisión, debate y replicación." },
      { pregunta: "¿Por qué una hipótesis irrefutable no es científica?", respuesta_guia: "Porque la ciencia requiere que las hipótesis puedan ser puestas a prueba y potencialmente refutadas." },
    ],
  },
  { // P02 — propiedades de la materia
    texto: `La materia es todo lo que tiene masa y ocupa un espacio. Desde el aire que respiramos hasta el agua, las rocas, los metales y nuestros propios cuerpos: todo está hecho de materia. Para estudiarla, los científicos la describen a través de sus propiedades, que se clasifican en físicas y químicas.\n\nLas propiedades físicas son aquellas que pueden medirse u observarse sin cambiar la composición química de la materia: la masa (cantidad de materia), el volumen (espacio que ocupa), la densidad (masa por unidad de volumen), el color, el punto de fusión, el punto de ebullición, la conductividad eléctrica y térmica, la dureza y la maleabilidad. Estas propiedades nos sirven para identificar sustancias: el oro se reconoce por su densidad y color, el cobre por su conductividad.\n\nLas propiedades químicas describen cómo una sustancia reacciona con otras o se transforma en una sustancia diferente: la inflamabilidad (facilidad para arder), la oxidación (reacción con el oxígeno, como el óxido del hierro), la acidez o basicidad, y la reactividad. Las propiedades químicas solo se observan cuando se produce un cambio químico.\n\nLa distinción entre propiedades físicas y químicas es fundamental en química porque nos ayuda a predecir cómo se comportará la materia en distintas condiciones y aplicaciones industriales, médicas y tecnológicas.`,
    fuente: "Material elaborado para CEN Bachillerato",
    nivel_lectura: "basico" as const,
    tiempo_estimado_minutos: 8,
    preguntas_comprension: [
      { pregunta: "¿Cuál es la diferencia entre propiedades físicas y químicas de la materia?", respuesta_guia: "Las físicas se miden sin cambiar la composición química; las químicas describen cómo la materia se transforma." },
      { pregunta: "Menciona tres propiedades físicas de la materia.", respuesta_guia: "Masa, volumen, densidad, color, punto de fusión, conductividad (cualquier tres)." },
      { pregunta: "¿Qué es la oxidación como propiedad química?", respuesta_guia: "La reacción de una sustancia con el oxígeno, como la formación de óxido en el hierro." },
    ],
  },
  { // P03 — estructura atómica
    texto: `Todo lo que existe en el universo está hecho de átomos. El átomo es la partícula más pequeña de un elemento que conserva sus propiedades químicas. Durante siglos se creyó que el átomo era indivisible (su nombre viene del griego "átomon": sin división). Hoy sabemos que está compuesto por partículas subatómicas.\n\nEl modelo atómico más usado en química básica es el de Bohr-Rutherford (aunque no es el más preciso desde la física cuántica). Según este modelo, el átomo tiene un núcleo central compuesto por protones (carga positiva) y neutrones (sin carga). Alrededor del núcleo, los electrones (carga negativa) orbitan en niveles de energía o capas.\n\nLas propiedades de un átomo dependen de su número atómico (Z): la cantidad de protones en el núcleo. Es lo que define el elemento: el hidrógeno tiene 1 protón, el carbono 6, el oxígeno 8, el hierro 26, el oro 79. Todos los átomos del mismo elemento tienen el mismo número de protones, aunque pueden diferir en el número de neutrones (isótopos).\n\nLos electrones son responsables de los enlaces químicos: la forma en que los átomos se unen para formar moléculas y compuestos. La cantidad de electrones en la capa exterior (electrones de valencia) determina cómo reacciona químicamente un elemento. Por eso la tabla periódica organiza los elementos según su número atómico y sus propiedades químicas.`,
    fuente: "Material elaborado para CEN Bachillerato",
    nivel_lectura: "basico" as const,
    tiempo_estimado_minutos: 9,
    preguntas_comprension: [
      { pregunta: "¿Qué partículas componen el núcleo del átomo?", respuesta_guia: "Protones (carga positiva) y neutrones (sin carga)." },
      { pregunta: "¿Qué es el número atómico?", respuesta_guia: "La cantidad de protones en el núcleo del átomo; define el elemento." },
      { pregunta: "¿Por qué los electrones son importantes para la química?", respuesta_guia: "Son responsables de los enlaces químicos y determinan cómo reacciona un elemento." },
    ],
  },
  { // P04 — sustancias puras y mezclas
    texto: `La materia que nos rodea puede clasificarse en sustancias puras y mezclas. Una sustancia pura tiene composición definida y constante: el agua pura (H₂O) siempre tiene la misma proporción de hidrógeno y oxígeno; el hierro puro siempre es Fe. Las sustancias puras pueden ser elementos (solo un tipo de átomo: hierro, oxígeno, oro) o compuestos (dos o más elementos unidos químicamente: agua, sal de mesa, glucosa).\n\nLas mezclas, en cambio, tienen composición variable: el agua de mar puede tener más o menos sal dependiendo de dónde se tome. Existen dos tipos de mezclas. Las mezclas homogéneas (o soluciones) tienen composición uniforme en toda su extensión: no se pueden ver los componentes por separado. Ejemplos: agua con sal, aire, vinagre. Las mezclas heterogéneas tienen composición no uniforme y los componentes son visibles o separables: ensalada, granito, arena con agua.\n\nSeparar los componentes de una mezcla es posible mediante métodos físicos que aprovechan las diferencias en propiedades físicas de sus componentes. Los principales son: filtración (separar sólido de líquido usando un filtro), decantación (separar líquidos de diferente densidad o sólidos pesados), destilación (separar líquidos con diferente punto de ebullición), evaporación (eliminar el líquido para obtener el sólido disuelto), cristalización (obtener sólidos puros a partir de soluciones), y tamizado (separar sólidos de diferente tamaño con una malla).\n\nEstos procesos tienen aplicaciones fundamentales en la industria, la medicina y la vida cotidiana.`,
    fuente: "Material elaborado para CEN Bachillerato",
    nivel_lectura: "basico" as const,
    tiempo_estimado_minutos: 9,
    preguntas_comprension: [
      { pregunta: "¿Cuál es la diferencia entre una mezcla homogénea y una heterogénea?", respuesta_guia: "La homogénea tiene composición uniforme (no se ven los componentes); la heterogénea tiene componentes visibles o separables." },
      { pregunta: "¿Qué método de separación usarías para separar sal del agua del mar?", respuesta_guia: "Evaporación (para obtener la sal sólida) o destilación (para obtener agua pura)." },
      { pregunta: "¿En qué se diferencia un compuesto de una mezcla?", respuesta_guia: "Un compuesto tiene composición fija y sus elementos están unidos químicamente; una mezcla tiene composición variable y se puede separar por métodos físicos." },
    ],
  },
  { // P05 — estados de la materia
    texto: `La materia puede existir en diferentes estados de agregación: sólido, líquido, gas y plasma (este último menos común en la vida cotidiana). El estado en que se encuentra la materia depende principalmente de la temperatura y la presión, que determinan la energía cinética de las partículas y las fuerzas de atracción entre ellas.\n\nEn el estado sólido, las partículas están muy juntas y vibran en posiciones fijas. Los sólidos tienen forma y volumen definidos, y son muy poco compresibles. En el estado líquido, las partículas están unidas pero pueden moverse entre sí: los líquidos tienen volumen definido pero adoptan la forma del recipiente que los contiene. En el estado gaseoso, las partículas están muy separadas y se mueven libremente: los gases no tienen ni forma ni volumen definidos y se comprimen fácilmente.\n\nLos cambios de estado ocurren cuando se agrega o se extrae energía (calor). Los nombres de esos cambios son: fusión (sólido → líquido), solidificación (líquido → sólido), vaporización o evaporación (líquido → gas), condensación (gas → líquido), sublimación (sólido → gas directamente) y deposición (gas → sólido directamente). La temperatura a la que ocurren estos cambios es específica para cada sustancia pura: el punto de fusión del agua es 0°C y su punto de ebullición es 100°C a nivel del mar.\n\nEstos cambios de estado son reversibles: la materia no cambia su naturaleza química, solo su forma de organizarse.`,
    fuente: "Material elaborado para CEN Bachillerato",
    nivel_lectura: "basico" as const,
    tiempo_estimado_minutos: 8,
    preguntas_comprension: [
      { pregunta: "¿Cuál es la diferencia entre sólido y líquido en cuanto a la forma?", respuesta_guia: "Los sólidos tienen forma definida; los líquidos adoptan la forma del recipiente." },
      { pregunta: "¿Qué es la sublimación?", respuesta_guia: "El cambio de estado de sólido a gas directamente, sin pasar por el estado líquido." },
      { pregunta: "¿Por qué los cambios de estado son 'reversibles'?", respuesta_guia: "Porque la materia no cambia su naturaleza química, solo su organización; puede volver al estado anterior." },
    ],
  },
  { // P06 — método científico
    texto: `El método científico es el conjunto de procedimientos sistemáticos que los científicos usan para investigar fenómenos naturales y construir conocimiento confiable. No es un algoritmo rígido que siempre se sigue en el mismo orden, pero sí tiene componentes reconocibles.\n\nGeneralmente incluye: (1) Observación: notar un fenómeno de forma sistemática y precisa. (2) Pregunta o problema: formular una pregunta clara y específica sobre ese fenómeno. (3) Hipótesis: plantear una explicación provisional que pueda ponerse a prueba. Una buena hipótesis es falsificable: puede ser refutada por los datos. (4) Experimentación: diseñar y realizar experimentos controlados que pongan a prueba la hipótesis. Incluye variables independientes (las que se manipulan), dependientes (las que se miden) y de control (las que se mantienen constantes). (5) Análisis de datos: interpretar los resultados usando estadística y gráficas. (6) Conclusión: aceptar, rechazar o modificar la hipótesis en función de los datos. (7) Comunicación: publicar los resultados para que otros científicos puedan replicarlos y criticarlos.\n\nEl método científico incluye mecanismos de autocorrección: la replicación (otros deben poder repetir el experimento y obtener los mismos resultados) y la revisión por pares (los resultados son evaluados por otros expertos antes de publicarse). Esto es lo que hace al conocimiento científico confiable, aunque siempre provisional.`,
    fuente: "Material elaborado para CEN Bachillerato",
    nivel_lectura: "basico" as const,
    tiempo_estimado_minutos: 9,
    preguntas_comprension: [
      { pregunta: "¿Qué es una hipótesis falsificable?", respuesta_guia: "Una hipótesis que puede ser refutada por los datos de la experimentación." },
      { pregunta: "¿Cuál es la diferencia entre variable independiente y dependiente?", respuesta_guia: "La independiente es la que se manipula; la dependiente es la que se mide como resultado." },
      { pregunta: "¿Por qué la replicación es importante en el método científico?", respuesta_guia: "Porque permite que otros científicos verifiquen los resultados, detectando errores o fraudes." },
    ],
  },
  { // P07 — mujeres y grupos marginados en ciencia
    texto: `La historia de la ciencia que se enseña en la escuela suele ser la historia de un pequeño grupo de científicos europeos y norteamericanos de élite, casi todos hombres blancos. Esta narrativa borra la contribución de miles de científicos de otros contextos y, en particular, el trabajo fundamental de las mujeres en el desarrollo del conocimiento científico.\n\nAlgunas de las historias más notables incluyen a Rosalind Franklin, cuya fotografía de rayos X del ADN (la "Foto 51") fue usada sin su permiso por Watson y Crick para describir la estructura de la doble hélice; el reconocimiento llegó para ellos, no para ella. Lise Meitner descubrió la fisión nuclear pero fue excluida del Premio Nobel que recibió su colega Otto Hahn. Hedy Lamarr, actriz de Hollywood, inventó un sistema de comunicación por espectro disperso que sentó las bases del WiFi y Bluetooth modernos.\n\nEn México, la historia de la ciencia también está llena de aportaciones invisibilizadas: de médicas indígenas cuyos conocimientos botánicos fueron adoptados por la medicina española sin reconocimiento, de mujeres que sostuvieron laboratorios y expediciones científicas sin crédito académico.\n\nReconocer estas historias no es solo un asunto de justicia histórica: es también entender mejor cómo funciona la ciencia, quién puede hacerla, y cómo los sesgos sociales (de género, raza, clase) afectan la producción y el reconocimiento del conocimiento.`,
    fuente: "Material elaborado para CEN Bachillerato",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 8,
    preguntas_comprension: [
      { pregunta: "¿Qué aportó Rosalind Franklin a la ciencia y qué le ocurrió?", respuesta_guia: "Su fotografía del ADN fue usada sin permiso para describir la doble hélice; Watson y Crick recibieron el Nobel, no ella." },
      { pregunta: "¿Qué inventó Hedy Lamarr?", respuesta_guia: "Un sistema de comunicación por espectro disperso que sentó las bases del WiFi y Bluetooth modernos." },
      { pregunta: "¿Por qué reconocer estas historias es importante para entender la ciencia?", respuesta_guia: "Porque muestra cómo los sesgos sociales afectan la producción y el reconocimiento del conocimiento científico." },
    ],
  },
  { // P08 — materia, transformaciones y medio ambiente
    texto: `La materia no desaparece: se transforma. Este principio, conocido como la Ley de Conservación de la Materia (formulada por Antoine Lavoisier en el siglo XVIII), establece que en toda reacción química la masa total de los reactivos es igual a la masa total de los productos. La materia puede cambiar de forma, de estado o de composición química, pero no se crea ni se destruye.\n\nEsta ley tiene consecuencias ambientales profundas. Cuando quemamos petróleo en los motores de los automóviles, el carbono del combustible no desaparece: se convierte en dióxido de carbono (CO₂) que se libera a la atmósfera. Cuando tiramos plástico al suelo, ese plástico no desaparece: se fragmenta en microplásticos que llegan a los suelos, ríos y océanos, y eventualmente a nuestra cadena alimentaria.\n\nLas transformaciones de la materia pueden ser físicas (cambios de estado, mezclas) o químicas (reacciones que producen nuevas sustancias). La combustión, la corrosión, la fotosíntesis y la descomposición son ejemplos de cambios químicos. En todos ellos, la materia se transforma pero se conserva.\n\nComprender estos principios es fundamental para entender los problemas ambientales de nuestro tiempo: el cambio climático (acumulación de gases de efecto invernadero), la contaminación del agua y el suelo, la pérdida de biodiversidad. No son problemas abstractos: ocurren en el territorio donde vivimos, y sus causas y consecuencias involucran transformaciones de la materia que podemos estudiar con herramientas científicas.`,
    fuente: "Material elaborado para CEN Bachillerato",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 9,
    preguntas_comprension: [
      { pregunta: "¿Qué establece la Ley de Conservación de la Materia?", respuesta_guia: "Que en toda reacción química la masa total de reactivos es igual a la de productos: la materia no se crea ni se destruye." },
      { pregunta: "¿Qué le pasa al carbono del combustible cuando quemamos gasolina?", respuesta_guia: "Se convierte en CO₂ que se libera a la atmósfera, contribuyendo al cambio climático." },
      { pregunta: "¿Cuál es la diferencia entre un cambio físico y un cambio químico?", respuesta_guia: "En el físico la composición química no cambia (solo estado o forma); en el químico se producen nuevas sustancias." },
    ],
  },
];

// ── QUIZZES (A2) ──────────────────────────────────────────────────────────────

const quizzes = [
  { // P01 — ciencia como práctica social
    preguntas: [
      { enunciado: "¿Por qué la ciencia NO es un conjunto de verdades absolutas?", opciones: ["Porque los científicos son poco confiables", "Porque el conocimiento científico se construye, revisa y corrige constantemente", "Porque no usa métodos rigurosos", "Porque está influida por el gobierno"], respuesta_correcta: 1, retroalimentacion: "La ciencia es provisional y autocorrectiva: sus conclusiones cambian cuando hay nueva evidencia." },
      { enunciado: "¿Cuál de estas características hace al conocimiento científico confiable?", opciones: ["Que lo dice una persona famosa", "Que los resultados pueden replicarse y son evaluados por otros expertos", "Que está publicado en internet", "Que es muy antiguo y probado por el tiempo"], respuesta_correcta: 1, retroalimentacion: "La replicabilidad y la revisión por pares son los mecanismos que hacen confiable al conocimiento científico." },
      { enunciado: "¿Qué significa que la ciencia es una práctica 'social'?", opciones: ["Que los científicos son muy sociables", "Que se hace en comunidades de personas que comparten, debaten y critican resultados", "Que se hace en redes sociales", "Que todos pueden hacer ciencia sin formación"], respuesta_correcta: 1, retroalimentacion: "La ciencia es social porque se construye colectivamente mediante el debate, la crítica y la colaboración entre científicos." },
      { enunciado: "¿Qué hace que una hipótesis sea científica?", opciones: ["Que sea propuesta por un científico famoso", "Que pueda ser puesta a prueba y potencialmente refutada", "Que sea muy compleja y difícil de entender", "Que esté publicada en un libro de texto"], respuesta_correcta: 1, retroalimentacion: "Una hipótesis científica debe ser falsificable: debe ser posible diseñar un experimento que la refute." },
      { enunciado: "¿Por qué los intereses económicos o políticos pueden influir en la ciencia?", opciones: ["Porque los científicos son corruptos en general", "Porque la investigación requiere financiamiento y quienes financian pueden orientar las preguntas que se investigan", "Porque la ciencia y la política son lo mismo", "Porque no existen organismos que regulen la ciencia"], respuesta_correcta: 1, retroalimentacion: "El financiamiento de la investigación influye en qué preguntas se investigan, aunque el método científico busca neutralizar sesgos." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P02 — propiedades de la materia
    preguntas: [
      { enunciado: "¿Cuál de estas es una propiedad FÍSICA de la materia?", opciones: ["La inflamabilidad", "La oxidación", "El punto de fusión", "La reactividad con ácidos"], respuesta_correcta: 2, retroalimentacion: "El punto de fusión es una propiedad física: se mide sin cambiar la composición química de la sustancia." },
      { enunciado: "¿Cuál de estas es una propiedad QUÍMICA de la materia?", opciones: ["La densidad", "El color", "La conductividad eléctrica", "La oxidación (reacción con el oxígeno)"], respuesta_correcta: 3, retroalimentacion: "La oxidación es una propiedad química: se observa solo cuando la sustancia reacciona y se transforma." },
      { enunciado: "La densidad se define como:", opciones: ["El peso de un objeto en la báscula", "La masa por unidad de volumen", "El espacio que ocupa un objeto", "La resistencia de un material a ser rayado"], respuesta_correcta: 1, retroalimentacion: "Densidad = masa / volumen. Es lo que determina si un objeto flota o se hunde en un líquido." },
      { enunciado: "¿Para qué sirven las propiedades físicas y químicas en la práctica?", opciones: ["Solo para aprobar exámenes de química", "Para identificar sustancias y predecir cómo se comportarán en distintas condiciones", "Para saber cuánto pesa algo", "Para determinar el precio de los materiales"], respuesta_correcta: 1, retroalimentacion: "Conocer las propiedades permite identificar materiales y diseñar aplicaciones industriales, médicas y tecnológicas." },
      { enunciado: "El oro se puede identificar por su color amarillo y su alta densidad (19.3 g/cm³). Estas son propiedades:", opciones: ["Químicas", "Físicas", "Biológicas", "Atómicas"], respuesta_correcta: 1, retroalimentacion: "El color y la densidad son propiedades físicas: se observan sin cambiar la composición química del oro." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P03 — estructura atómica
    preguntas: [
      { enunciado: "¿Dónde se encuentran los protones en un átomo?", opciones: ["En las capas de electrones", "En el núcleo, junto con los neutrones", "Orbitando el núcleo", "En toda la estructura del átomo por igual"], respuesta_correcta: 1, retroalimentacion: "Los protones (y neutrones) están en el núcleo central del átomo." },
      { enunciado: "¿Qué determina a qué elemento pertenece un átomo?", opciones: ["El número de neutrones", "El número de electrones en la capa exterior", "El número de protones (número atómico)", "El tamaño del átomo"], respuesta_correcta: 2, retroalimentacion: "El número atómico (número de protones) es lo que define el elemento. Todos los átomos de carbono tienen 6 protones." },
      { enunciado: "¿Qué son los isótopos?", opciones: ["Átomos de diferentes elementos con propiedades similares", "Átomos del mismo elemento con diferente número de neutrones", "Átomos con el mismo número de electrones pero diferente número de protones", "Moléculas formadas por el mismo tipo de átomo"], respuesta_correcta: 1, retroalimentacion: "Los isótopos son átomos del mismo elemento (mismo número de protones) con diferente número de neutrones." },
      { enunciado: "¿Cuál es la carga eléctrica del electrón?", opciones: ["Positiva", "Negativa", "Neutra (sin carga)", "Variable según el elemento"], respuesta_correcta: 1, retroalimentacion: "Los electrones tienen carga negativa; los protones tienen carga positiva; los neutrones son neutros." },
      { enunciado: "¿Por qué los electrones de valencia son importantes?", opciones: ["Porque determinan el tamaño del átomo", "Porque determinan cómo reacciona químicamente un elemento con otros", "Porque determinan la masa del átomo", "Porque son los electrones más cercanos al núcleo"], respuesta_correcta: 1, retroalimentacion: "Los electrones de valencia (en la capa exterior) son los que participan en los enlaces químicos." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P04 — sustancias y mezclas
    preguntas: [
      { enunciado: "¿Cuál de estos es una sustancia pura?", opciones: ["Agua de mar", "Aire", "Oxígeno puro (O₂)", "Vinagre"], respuesta_correcta: 2, retroalimentacion: "El oxígeno puro es una sustancia pura (elemento). Los demás son mezclas de varias sustancias." },
      { enunciado: "¿Cuál de estas es una mezcla homogénea?", opciones: ["Arena con piedritas", "Agua con aceite", "Ensalada", "Agua con azúcar bien disuelta"], respuesta_correcta: 3, retroalimentacion: "El agua con azúcar disuelta tiene composición uniforme en toda su extensión: es una mezcla homogénea (solución)." },
      { enunciado: "¿Qué método usarías para separar arena de agua?", opciones: ["Destilación", "Cristalización", "Filtración", "Evaporación"], respuesta_correcta: 2, retroalimentacion: "La filtración separa sólidos de líquidos usando un filtro que retiene la arena y deja pasar el agua." },
      { enunciado: "¿En qué se diferencia un elemento de un compuesto?", opciones: ["Los elementos tienen masa y los compuestos no", "Los elementos son de un solo tipo de átomo; los compuestos tienen dos o más elementos unidos químicamente", "Los compuestos son mezclas; los elementos son sustancias puras", "No hay diferencia real entre ellos"], respuesta_correcta: 1, retroalimentacion: "Un elemento tiene solo un tipo de átomo (hierro, oxígeno); un compuesto combina elementos mediante enlaces químicos (agua, sal)." },
      { enunciado: "¿Cómo obtendrías sal pura del agua de mar?", opciones: ["Filtrando", "Destilando", "Por tamizado", "Evaporando el agua para que quede la sal"], respuesta_correcta: 3, retroalimentacion: "Evaporando el agua del mar, el agua se va en forma de vapor y la sal permanece como sólido." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P05 — estados de la materia
    preguntas: [
      { enunciado: "¿Cuál es la característica principal del estado sólido?", opciones: ["Las partículas se mueven libremente en todas direcciones", "Las partículas están muy juntas y vibran en posiciones fijas", "Las partículas están muy separadas", "Las partículas tienen muy alta energía cinética"], respuesta_correcta: 1, retroalimentacion: "En el estado sólido, las partículas vibran pero no se mueven libremente: por eso los sólidos tienen forma definida." },
      { enunciado: "¿Qué nombre recibe el cambio de líquido a gas?", opciones: ["Fusión", "Solidificación", "Sublimación", "Vaporización o evaporación"], respuesta_correcta: 3, retroalimentacion: "El cambio de líquido a gas se llama vaporización (si ocurre en toda la masa del líquido: ebullición) o evaporación (en la superficie)." },
      { enunciado: "El hielo seco (CO₂ sólido) pasa directamente de sólido a gas sin pasar por el estado líquido. ¿Cómo se llama ese cambio?", opciones: ["Fusión", "Condensación", "Sublimación", "Deposición"], respuesta_correcta: 2, retroalimentacion: "La sublimación es el cambio directo de sólido a gas. El hielo seco es el ejemplo más conocido." },
      { enunciado: "¿Por qué el agua hierve a 100°C a nivel del mar?", opciones: ["Porque todos los líquidos hierven a 100°C", "Porque es el punto de ebullición específico del agua a la presión atmosférica estándar", "Porque esa es la temperatura máxima que puede alcanzar el agua", "Porque el agua es H₂O y eso determina arbitrariamente su temperatura de ebullición"], respuesta_correcta: 1, retroalimentacion: "El punto de ebullición es una propiedad específica de cada sustancia pura, que varía con la presión atmosférica." },
      { enunciado: "¿Por qué los cambios de estado son 'reversibles'?", opciones: ["Porque siempre pueden deshacerse con la misma temperatura", "Porque la materia no cambia su naturaleza química, solo su forma de organizarse", "Porque el agua siempre puede volver a ser hielo", "Porque todos los cambios en la naturaleza son reversibles"], respuesta_correcta: 1, retroalimentacion: "Los cambios de estado son físicos: la composición química no cambia, por lo que el proceso puede revertirse." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P06 — método científico
    preguntas: [
      { enunciado: "¿Cuál es la primera etapa del método científico?", opciones: ["Plantear una hipótesis", "Realizar el experimento", "Observar un fenómeno de forma sistemática", "Publicar los resultados"], respuesta_correcta: 2, retroalimentacion: "La observación sistemática de un fenómeno es el punto de partida del método científico." },
      { enunciado: "¿Qué es una variable de control en un experimento?", opciones: ["La variable que se manipula intencionalmente", "La variable que se mide como resultado", "Las variables que se mantienen constantes para no interferir con los resultados", "La variable más importante del experimento"], respuesta_correcta: 2, retroalimentacion: "Las variables de control se mantienen constantes para asegurar que solo la variable independiente causa cambios en la dependiente." },
      { enunciado: "¿Por qué es importante que otros científicos puedan replicar un experimento?", opciones: ["Para que todos aprendan la técnica", "Para verificar los resultados y detectar errores o fraudes", "Para que el experimento sea más famoso", "Para ahorrar tiempo de investigación"], respuesta_correcta: 1, retroalimentacion: "La replicabilidad es un mecanismo de autocorrección de la ciencia: si nadie puede reproducir los resultados, hay un problema." },
      { enunciado: "Una investigadora observa que las plantas crecen más cerca de la ventana. Formula: 'Las plantas crecen más rápido con más luz solar'. ¿Qué es esto?", opciones: ["Una conclusión", "Una observación", "Una hipótesis", "Un dato experimental"], respuesta_correcta: 2, retroalimentacion: "Es una hipótesis: una explicación provisional que puede ponerse a prueba experimentalmente." },
      { enunciado: "Si los datos de un experimento refutan la hipótesis original, ¿qué debe hacer el científico?", opciones: ["Ignorar los datos que no coinciden con la hipótesis", "Rechazar o modificar la hipótesis y diseñar nuevas investigaciones", "Publicar igualmente la hipótesis como si fuera correcta", "Repetir el experimento hasta obtener los resultados esperados"], respuesta_correcta: 1, retroalimentacion: "En ciencia, cuando los datos refutan una hipótesis, la hipótesis se rechaza o modifica: los datos tienen prioridad sobre las teorías previas." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P07 — mujeres y grupos marginados en ciencia
    preguntas: [
      { enunciado: "¿Qué aportó Rosalind Franklin que fue usado sin su crédito?", opciones: ["La tabla periódica de los elementos", "La Fotografía 51 del ADN, que permitió describir la doble hélice", "La estructura del núcleo atómico", "El descubrimiento del electron"], respuesta_correcta: 1, retroalimentacion: "La Fotografía 51 de Franklin fue usada por Watson y Crick sin su consentimiento para describir la doble hélice del ADN." },
      { enunciado: "Hedy Lamarr es conocida como actriz. ¿Cuál fue también su contribución científica?", opciones: ["Inventó el cine sonoro", "Sentó las bases del WiFi y Bluetooth con su sistema de espectro disperso", "Descubrió los rayos X", "Desarrolló la teoría de la relatividad"], respuesta_correcta: 1, retroalimentacion: "Hedy Lamarr inventó un sistema de comunicación por espectro disperso durante la Segunda Guerra Mundial que es la base de tecnologías inalámbricas modernas." },
      { enunciado: "¿Por qué la historia de la ciencia ha invisibilizado a mujeres y grupos marginados?", opciones: ["Porque no han hecho contribuciones significativas", "Por sesgos de género, raza y clase que han negado crédito y acceso a la investigación a estos grupos", "Porque sus descubrimientos fueron menos importantes", "Porque eligieron no publicar sus investigaciones"], respuesta_correcta: 1, retroalimentacion: "Los sesgos estructurales han negado crédito, acceso y reconocimiento a mujeres y grupos marginados en la historia de la ciencia." },
      { enunciado: "¿Qué ocurrió con Lise Meitner y el Premio Nobel por el descubrimiento de la fisión nuclear?", opciones: ["Fue la primera mujer en ganar el Premio Nobel de Física", "Descubrió la fisión pero fue excluida del Nobel que recibió su colega Otto Hahn", "Compartió el Nobel con dos otros científicos", "Rechazó el Nobel por razones personales"], respuesta_correcta: 1, retroalimentacion: "Lise Meitner fue fundamental en el descubrimiento de la fisión nuclear, pero el Nobel de 1944 se otorgó solo a Otto Hahn." },
      { enunciado: "¿Qué nos enseña reconocer las contribuciones invisibilizadas en la ciencia?", opciones: ["Que la ciencia actual es injusta", "Que los sesgos sociales afectan quién hace ciencia y quién recibe reconocimiento, y que la ciencia puede ser más inclusiva", "Que los hombres son mejores científicos", "Que la historia de la ciencia no es importante para la ciencia actual"], respuesta_correcta: 1, retroalimentacion: "Reconocer la historia de exclusión muestra que la ciencia puede ser más justa, inclusiva y enriquecida con más perspectivas." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P08 — materia, transformaciones y medio ambiente
    preguntas: [
      { enunciado: "¿Qué establece la Ley de Conservación de la Materia?", opciones: ["La materia puede crearse en condiciones extremas de temperatura", "La masa total de los reactivos es igual a la de los productos: la materia no se crea ni se destruye", "La materia siempre se destruye en las reacciones químicas", "Solo se conserva la masa en las reacciones físicas"], respuesta_correcta: 1, retroalimentacion: "La Ley de Lavoisier establece que la materia se transforma pero no se crea ni se destruye." },
      { enunciado: "Cuando quemamos gasolina, ¿qué le pasa al carbono?", opciones: ["Desaparece completamente", "Se convierte en CO₂ que se libera a la atmósfera", "Se convierte en carbono sólido que cae al suelo", "Se almacena en el motor del auto"], respuesta_correcta: 1, retroalimentacion: "Por la conservación de la materia, el carbono de la gasolina no desaparece: se convierte en CO₂, contribuyendo al cambio climático." },
      { enunciado: "¿Cuál es la diferencia entre un cambio físico y un cambio químico?", opciones: ["El físico es reversible, el químico no", "En el físico no cambia la composición química; en el químico se forman nuevas sustancias", "El físico requiere calor, el químico no", "No hay diferencia práctica entre ellos"], respuesta_correcta: 1, retroalimentacion: "El cambio físico no altera la composición química (fusión del hielo); el cambio químico produce nuevas sustancias (combustión)." },
      { enunciado: "¿Por qué el plástico que tiramos al suelo es un problema ambiental a largo plazo?", opciones: ["Porque ocupa mucho espacio", "Porque se convierte en microplásticos que persisten en suelos, agua y cadenas alimentarias", "Porque es feo visualmente", "Porque atrae animales peligrosos"], respuesta_correcta: 1, retroalimentacion: "Por conservación de la materia, el plástico no desaparece: se fragmenta en microplásticos que contaminan ecosistemas." },
      { enunciado: "¿Cuál de estos es un ejemplo de cambio químico?", opciones: ["El agua al congelarse en hielo", "La sal al disolverse en agua", "La fotosíntesis de las plantas", "El vidrio al romperse"], respuesta_correcta: 2, retroalimentacion: "La fotosíntesis convierte CO₂ y agua en glucosa y oxígeno: hay nuevas sustancias, por lo tanto es un cambio químico." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
];

// ── REFLEXIONES (A3) ──────────────────────────────────────────────────────────

const reflexiones = [
  { // P01 — ciencia como práctica social
    prompt: "¿Cómo se relacionas tú con el conocimiento científico en tu vida diaria? ¿Confías en la ciencia? ¿Por qué sí o por qué no? Describe una situación donde el conocimiento científico cambió cómo piensas o actúas sobre algo. ¿Qué diferencias encuentras entre 'información en redes sociales' y 'conocimiento científico verificado'?",
    pistas: ["¿Cómo decides si una noticia sobre salud o medioambiente es confiable?", "¿Recuerdas algún caso donde la ciencia cambió su postura sobre algo (como sobre el COVID)?", "¿Cómo tratas la información científica que contradice creencias populares o familiares?"],
    longitud_minima_palabras: 80,
    longitud_maxima_palabras: 300,
    criterios_evaluacion: ["Reflexiona honestamente sobre su relación con el conocimiento científico", "Describe una situación concreta donde la ciencia influyó en su pensamiento o conducta", "Distingue entre información no verificada y conocimiento científico", "Reflexiona sobre por qué confía o desconfía de la ciencia"],
    formato_esperado: "libre" as const,
  },
  { // P02 — propiedades de la materia
    prompt: "Elige 3 materiales u objetos de tu vida cotidiana (pueden ser alimentos, materiales de construcción, herramientas, ropa) y describe sus propiedades físicas y al menos una propiedad química. Explica cómo esas propiedades determinan para qué sirven. ¿Por qué crees que se eligió ese material y no otro para ese uso?",
    pistas: ["¿Por qué las sartenes son de metal y no de plástico?", "¿Por qué el vidrio se usa para ventanas?", "¿Por qué la ropa de algodón se siente diferente que la de poliéster?"],
    longitud_minima_palabras: 80,
    longitud_maxima_palabras: 300,
    criterios_evaluacion: ["Describe correctamente propiedades físicas y al menos una química por material", "Vincula las propiedades con el uso del material", "Reflexiona sobre por qué se elige ese material específicamente", "Usa vocabulario del tema (densidad, conductividad, oxidación, etc.)"],
    formato_esperado: "libre" as const,
  },
  { // P03 — átomo
    prompt: "¿Por qué crees que es importante saber que todo está hecho de átomos? ¿Cómo cambia tu forma de ver los objetos cotidianos saber que están compuestos por partículas subatómicas? Piensa en dos aplicaciones tecnológicas o médicas que serían imposibles sin el conocimiento de la estructura atómica (puedes investigar brevemente).",
    pistas: ["¿Qué tienen que ver los átomos con las medicinas, los semiconductores o la energía nuclear?", "¿Cómo funciona una radiografía si no hubiera física atómica?", "¿Por qué la tabla periódica es útil para predecir el comportamiento de los materiales?"],
    longitud_minima_palabras: 80,
    longitud_maxima_palabras: 300,
    criterios_evaluacion: ["Reflexiona sobre la relevancia del conocimiento atómico", "Describe dos aplicaciones tecnológicas o médicas concretas", "Conecta la estructura atómica con esas aplicaciones", "Muestra comprensión genuina, no solo repetición de datos"],
    formato_esperado: "libre" as const,
  },
  { // P04 — sustancias y mezclas
    prompt: "Busca en tu cocina o entorno 5 ejemplos de sustancias o mezclas. Clasifícalos: ¿son mezclas homogéneas, heterogéneas o sustancias puras? ¿Hay algún proceso de separación de mezclas que ocurra en tu casa sin que lo hayas llamado así? Describe el proceso y el método de separación que usa.",
    pistas: ["¿El café que preparas es mezcla o sustancia pura? ¿Homogénea o heterogénea?", "¿Cuando cuelan la leche o filtran el agua están separando mezclas?", "¿Qué pasa cuando hierves agua salada? ¿Hay separación?"],
    longitud_minima_palabras: 80,
    longitud_maxima_palabras: 300,
    criterios_evaluacion: ["Clasifica correctamente 5 ejemplos de su entorno", "Identifica al menos un proceso de separación cotidiano", "Describe el método de separación con vocabulario del tema", "Conecta los conceptos estudiados con la vida real"],
    formato_esperado: "libre" as const,
  },
  { // P05 — estados de la materia
    prompt: "Observa el agua en un día de tu vida: ¿en cuántos estados la encuentras? (líquida, vapor en el baño, hielo en el refrigerador, etc.) Describe los cambios de estado que ocurren en tu entorno. ¿Puedes explicar ahora por qué ocurren esos cambios usando los conceptos de temperatura y energía cinética?",
    pistas: ["¿Qué pasa con el vapor cuando sale de una olla de agua hirviendo y toca la pared fría?", "¿Por qué el hielo se derrite en tu bebida?", "¿Por qué la ropa se seca cuando la tiendes (aunque no esté a 100°C)?"],
    longitud_minima_palabras: 80,
    longitud_maxima_palabras: 300,
    criterios_evaluacion: ["Identifica al menos 3 cambios de estado en su vida cotidiana", "Explica correctamente cada cambio con su nombre técnico", "Conecta los cambios con temperatura y energía cinética", "Observación genuina del entorno, no solo repetición de ejemplos del texto"],
    formato_esperado: "libre" as const,
  },
  { // P06 — método científico
    prompt: "Diseña una pequeña investigación científica sobre algo que te genere curiosidad en tu entorno (puede ser sobre plantas, alimentos, comportamiento de materiales, etc.). Describe: (1) tu observación, (2) tu pregunta, (3) tu hipótesis, (4) cómo la pondrías a prueba, (5) qué variables controlarías. No necesitas realizarlo: solo diseñarlo.",
    pistas: ["¿Las plantas crecen más con música? ¿El pan se endurece más rápido en la cocina o en el refrigerador?", "Recuerda: la hipótesis debe ser específica y falsificable", "¿Cuál sería tu variable independiente (lo que cambias) y dependiente (lo que mides)?"],
    longitud_minima_palabras: 100,
    longitud_maxima_palabras: 350,
    criterios_evaluacion: ["Incluye los 5 componentes del diseño experimental pedidos", "La hipótesis es específica, falsificable y coherente con la observación", "Las variables están bien definidas (independiente, dependiente, control)", "El diseño es factible y original (no copiado directamente de los ejemplos)"],
    formato_esperado: "libre" as const,
  },
  { // P07 — mujeres y grupos marginados en ciencia
    prompt: "Investiga brevemente a una científica, científico o grupo históricamente marginado cuya contribución no sea tan conocida (puede ser mexicano/a o latinoamericano/a, o de cualquier otro país). Describe su contribución, las dificultades que enfrentó y qué habría cambiado en la ciencia si hubiera tenido las mismas oportunidades que sus contemporáneos con más privilegios.",
    pistas: ["Puedes buscar: Mario Molina (mexicano, Premio Nobel de Química), Matilde Montoya (primera médica mexicana), Celia Rodríguez Ballesteros (científica del UNAM)", "¿Qué obstáculos específicos de género, raza o clase enfrentaron?", "¿Su contribución fue reconocida en su momento o fue reconocida después?"],
    longitud_minima_palabras: 100,
    longitud_maxima_palabras: 350,
    criterios_evaluacion: ["Identifica a un científico/a históricamente marginado con contribución concreta", "Describe las dificultades que enfrentó con contexto histórico", "Reflexiona sobre qué habría cambiado con más igualdad de oportunidades", "Conecta la historia con el concepto de ciencia como práctica social"],
    formato_esperado: "libre" as const,
  },
  { // P08 — materia, transformaciones y medio ambiente
    prompt: "Describe un problema ambiental de tu comunidad o región (contaminación del agua, suelo, aire, acumulación de basura, etc.). Explica qué transformaciones de la materia están involucradas (físicas y/o químicas). Aplica la Ley de Conservación de la Materia: ¿adónde va la materia que contamina? ¿Qué podría hacerse para reducir el problema desde la perspectiva de las transformaciones químicas?",
    pistas: ["¿Hay un basurero, fábrica o fuente de contaminación cerca de donde vives?", "¿Qué pasa químicamente cuando queman basura?", "¿La solución es 'hacer desaparecer' la contaminación o transformar la materia en algo menos dañino?"],
    longitud_minima_palabras: 100,
    longitud_maxima_palabras: 350,
    criterios_evaluacion: ["Describe un problema ambiental real y concreto de su entorno", "Identifica transformaciones de la materia involucradas (físicas y/o químicas)", "Aplica correctamente la Ley de Conservación", "Propone soluciones con base en el conocimiento de transformaciones químicas"],
    formato_esperado: "libre" as const,
  },
];

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
