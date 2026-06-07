/**
 * Seed de los 7 huecos LIGEROS del re-alineamiento 2025 (sin laboratorio 3D).
 *
 * Cierra los propósitos formativos oficiales que aún no tenían contenido, con una
 * progresión de 7 actividades cada uno (lectura, ejercicio, reflexión, quiz,
 * glosario, fill_blanks, autoevaluación), TODO estado='borrador' y VERBATIM del
 * Modelo MCCEMS 2025 (regla anti-fake). NO crean lab 3D (decisión del usuario:
 * la plataforma ya tiene 88 labs; estos huecos se llenan con contenido más ligero).
 *
 *   PM-IV·O7   → PM-IV-P08   (numero 7)
 *   PM-VI·O3   → PM-VI-P10   (numero 3)
 *   PM-VI·O4   → PM-VI-P11   (numero 4)
 *   PM-VI·O6   → PM-VI-P12   (numero 6)
 *   CNEYT-III·O2 → CNEYT-III-P10 (numero 2)
 *   CNEYT-III·O5 → CNEYT-III-P11 (numero 5)
 *   CNEYT-VI·O2  → CNEYT-VI-P10  (numero 2)
 *
 * Idempotente: upsert por "codigo". Recuenta uac.total_progresiones al final.
 *
 * Uso:
 *   npx tsx scripts/seed-huecos-ligeros.ts            (dry-run)
 *   npx tsx scripts/seed-huecos-ligeros.ts --apply    (aplica)
 */

import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

import { createSB, upsertActividad, type ActividadInput, type SB } from "./lib/activity-utils";

const ESCALA = [
  { valor: 1, etiqueta: "Aún no" },
  { valor: 2, etiqueta: "Con ayuda" },
  { valor: 3, etiqueta: "Casi siempre" },
  { valor: 4, etiqueta: "Con seguridad" },
];

interface Spec {
  uac: string;
  progCodigo: string;
  numero: number;
  categoria: string;
  subcategoria: string;
  meta: string;
  O: string; // propósito verbatim
  C: string; // contenidos verbatim
  descripcion: string;
  fuente: string;
  a1: { titulo: string; desc: string; texto: string; minutos: number; preguntas: { p: string; r: string }[] };
  a2: { titulo: string; desc: string; instrucciones: string; problema: string; contexto: string; pasos: string[]; final: string; unidades: string };
  a3: { titulo: string; desc: string; prompt: string; pistas: string[]; criterios: string[] };
  a4: { titulo: string; desc: string; preguntas: { e: string; r: boolean; fb: string }[] };
  a5: { titulo: string; desc: string; terminos: { t: string; d: string; e: string }[]; final: string };
  a6: { titulo: string; desc: string; texto: string; huecos: { c: string; alt: string[] }[] };
  a7: { titulo: string; desc: string; criterios: string[]; reflexion: string };
}

type Act = Pick<ActividadInput, "titulo" | "descripcion" | "tipo" | "xp" | "contenido"> & { estado: "borrador" };

function construir(s: Spec): Act[] {
  return [
    {
      titulo: s.a1.titulo, descripcion: s.a1.desc, tipo: "lectura", xp: 10, estado: "borrador",
      contenido: {
        texto: s.a1.texto, fuente: s.fuente, nivel_lectura: "intermedio",
        tiempo_estimado_minutos: s.a1.minutos,
        preguntas_comprension: s.a1.preguntas.map((q) => ({ pregunta: q.p, respuesta_guia: q.r })),
      },
    },
    {
      titulo: s.a2.titulo, descripcion: s.a2.desc, tipo: "ejercicio_matematico", xp: 15, estado: "borrador",
      contenido: {
        instrucciones: s.a2.instrucciones, problema: s.a2.problema, contexto: s.a2.contexto,
        tipo_respuesta: "desarrollo", pasos_guia: s.a2.pasos, respuesta_final: s.a2.final,
        unidades: s.a2.unidades, tolerancia_error: 0.01,
      },
    },
    {
      titulo: s.a3.titulo, descripcion: s.a3.desc, tipo: "reflexion_escrita", xp: 20, estado: "borrador",
      contenido: {
        prompt: s.a3.prompt, pistas: s.a3.pistas, longitud_minima_palabras: 100,
        formato_esperado: "libre", criterios_evaluacion: s.a3.criterios,
      },
    },
    {
      titulo: s.a4.titulo, descripcion: s.a4.desc, tipo: "quiz_verdadero_falso", xp: 10, estado: "borrador",
      contenido: { preguntas: s.a4.preguntas.map((q) => ({ enunciado: q.e, respuesta: q.r, retroalimentacion: q.fb })) },
    },
    {
      titulo: s.a5.titulo, descripcion: s.a5.desc, tipo: "glosario_interactivo", xp: 15, estado: "borrador",
      contenido: {
        terminos: s.a5.terminos.map((t) => ({ termino: t.t, definicion: t.d, ejemplo: t.e })),
        actividad_final: s.a5.final,
      },
    },
    {
      titulo: s.a6.titulo, descripcion: s.a6.desc, tipo: "fill_blanks", xp: 10, estado: "borrador",
      contenido: {
        instrucciones: "Arrastra o escribe la palabra correcta en cada espacio.",
        texto_con_huecos: s.a6.texto,
        huecos: s.a6.huecos.map((h, i) => ({ posicion: i, respuesta_correcta: h.c, alternativas_aceptadas: h.alt })),
      },
    },
    {
      titulo: s.a7.titulo, descripcion: s.a7.desc, tipo: "autoevaluacion", xp: 10, estado: "borrador",
      contenido: {
        instrucciones: "Marca con honestidad qué tan seguro te sientes en cada punto. No hay respuestas correctas: te sirve para saber qué repasar.",
        criterios: s.a7.criterios.map((c) => ({ descripcion: c, escala: ESCALA })),
        reflexion_final_prompt: s.a7.reflexion,
      },
    },
  ];
}

const META_PMIV = "Resuelva problemas a partir del planteamiento y análisis de funciones trigonométricas, ecuaciones de primer y segundo grado, considerando la pertinencia y conocimiento de las variables y relaciones para explicar una situación o fenómeno.";
const META_PMVI = "Aplique procedimientos, técnicas y lenguaje matemático para plantear posibles soluciones a problemas derivados de fenómenos naturales o sociales, cuyo comportamiento puede describirse probabilísticamente y contribuir a una toma de decisiones fundamentada.";
const META_CN3 = "Construya explicaciones sobre fenómenos naturales que subyacen a la estructura y función de sistemas o esferas terrestres, y comprenda su importancia para la existencia de la vida en la Tierra, así como la relevancia de las acciones humanas para su cuidado.";
const META_CN6 = "Comprenda los rasgos que caracterizan a los seres vivos para construir explicaciones sobre fenómenos naturales, mediados por el funcionamiento celular, la herencia y la evolución biológica.";

const SPECS: Spec[] = [
  // ════════════════ PM-IV·O7 — Modelado con secciones cónicas ════════════════
  {
    uac: "PM-IV", progCodigo: "PM-IV-P08", numero: 7,
    categoria: "Trigonometría y geometría analítica", subcategoria: "Modelado y estimación con secciones cónicas",
    meta: META_PMIV,
    O: "Aplica conocimientos sobre ecuaciones con dos variables para realizar estimaciones sencillas, para consolidar los aprendizajes.",
    C: "Modelado y estimación Aplicación de las secciones cónicas: elipse, parábola, hipérbola y circunferencia",
    descripcion: "Consolida lo aprendido aplicando las ecuaciones de las secciones cónicas —circunferencia, parábola, elipse e hipérbola— para modelar y estimar situaciones reales: la trayectoria de un balón o el chorro de una fuente (parábola), las antenas y faros parabólicos, las órbitas de los planetas y los arcos arquitectónicos (elipse), el alcance de una señal (circunferencia) y fenómenos de proporcionalidad inversa (hipérbola). El propósito es usar la ecuación con dos variables como herramienta para describir y estimar fenómenos del entorno.",
    fuente: "MCCEMS 2025 — Pensamiento Matemático IV «Trigonometría y geometría analítica», contenido formativo: Modelado y estimación · Aplicación de las secciones cónicas: elipse, parábola, hipérbola y circunferencia.",
    a1: {
      titulo: "Modelar el mundo con cónicas: parábolas, elipses, circunferencias e hipérbolas",
      desc: "Lee cómo las secciones cónicas modelan trayectorias, antenas, órbitas y arcos, y cómo su ecuación permite estimar.",
      minutos: 11,
      texto:
        "Las SECCIONES CÓNICAS —circunferencia, parábola, elipse e hipérbola— son las curvas que se obtienen al cortar un cono con un plano, y resultan ser el lenguaje matemático de muchísimos fenómenos del mundo real. Lo poderoso es que cada una tiene una ECUACIÓN con dos variables (x, y) que nos permite no solo dibujarla, sino MODELAR situaciones y hacer ESTIMACIONES: ¿hasta dónde llega un balón?, ¿dónde se concentra la señal de una antena?, ¿qué forma tiene la órbita de un planeta?\n\n" +
        "LA PARÁBOLA modela todo lo que sube y baja por efecto de la gravedad y todo lo que concentra o refleja: la trayectoria de un balón pateado o el chorro de una fuente, el cable de un puente colgante, y sobre todo las ANTENAS y FAROS parabólicos. Su ecuación ordinaria con vértice en el origen es y = a·x² (o x² = 4py): la propiedad clave es que todos los rayos paralelos al eje se concentran en un punto, el FOCO. Por eso las antenas de DISH o de internet satelital y los faros de un auto tienen forma de parábola. Con la ecuación puedes ESTIMAR, por ejemplo, la altura máxima de un balón o dónde colocar el receptor de una antena.\n\n" +
        "LA ELIPSE es una circunferencia «achatada», con dos focos. Modela las ÓRBITAS de los planetas y satélites (primera ley de Kepler: los planetas giran en elipses con el Sol en un foco), los ARCOS arquitectónicos y las «galerías de susurros» (lo que se dice en un foco se oye en el otro). Su ecuación es x²/a² + y²/b² = 1, donde a y b son los semiejes. Con ella se estima, por ejemplo, el ancho y alto de un arco o la distancia máxima y mínima de un satélite a la Tierra.\n\n" +
        "LA CIRCUNFERENCIA es el caso particular de la elipse con a = b: todos sus puntos están a la misma distancia (el radio r) del centro. Su ecuación es (x − h)² + (y − k)² = r². Modela el ALCANCE de una señal de radio o wifi, el área que cubre un aspersor de riego o la zona de cobertura de una antena de telefonía. Con ella estimas si un punto queda dentro o fuera del alcance.\n\n" +
        "LA HIPÉRBOLA aparece en relaciones de proporcionalidad inversa y en sistemas de navegación. Su ecuación es x²/a² − y²/b² = 1. Modela fenómenos donde una variable crece cuando otra decrece (como la ley de Boyle presión-volumen de un gas) y es la base de sistemas de posicionamiento por diferencia de distancias. \n\n" +
        "MODELAR Y ESTIMAR. Aplicar una cónica a un problema real tiene tres pasos: (1) identificar qué curva describe el fenómeno; (2) escribir su ecuación con los datos conocidos; (3) usar la ecuación para ESTIMAR el valor buscado (una altura, un alcance, una distancia). Así se consolidan los aprendizajes del semestre: la geometría analítica deja de ser teoría y se vuelve una herramienta para describir y predecir el entorno, desde una cancha de fútbol hasta la órbita de un satélite mexicano.",
      preguntas: [
        { p: "¿Qué propiedad de la parábola la hace ideal para antenas y faros?", r: "Que todos los rayos paralelos a su eje se reflejan hacia un único punto, el foco (y viceversa). Por eso una antena parabólica concentra la señal en el receptor y un faro proyecta un haz a partir de una fuente en el foco." },
        { p: "¿Por qué la elipse modela las órbitas planetarias?", r: "Por la primera ley de Kepler: los planetas describen órbitas elípticas con el Sol situado en uno de los dos focos de la elipse. Su ecuación x²/a²+y²/b²=1 permite estimar las distancias máxima y mínima al Sol." },
        { p: "¿Cuáles son los tres pasos para modelar y estimar con una cónica?", r: "(1) Identificar qué cónica describe el fenómeno; (2) escribir su ecuación con los datos conocidos; (3) usar la ecuación para estimar el valor buscado (altura, alcance, distancia)." },
      ],
    },
    a2: {
      titulo: "Estima con cónicas: una antena parabólica y el alcance de una señal",
      desc: "Aplica las ecuaciones de la parábola y la circunferencia para modelar y estimar situaciones reales.",
      instrucciones: "Plantea la ecuación de cada cónica con los datos y úsala para estimar lo que se pide. Apóyate en bocetos.",
      problema:
        "a) ANTENA PARABÓLICA. Una antena tiene forma de parábola y = a·x² (vértice en el origen, abierta hacia arriba, x e y en metros). Si pasa por el punto (1, 0.25) (a 1 m del eje la antena sube 0.25 m), halla el valor de a y la ecuación de la antena.\n\n" +
        "b) PROFUNDIDAD. Con esa ecuación, estima cuánto sube la antena (su «profundidad») a 2 m del eje, es decir y cuando x = 2.\n\n" +
        "c) ALCANCE DE SEÑAL (circunferencia). Una antena de telefonía cubre un radio de 5 km. Tomando la antena en el origen, escribe la ecuación de la circunferencia de cobertura.\n\n" +
        "d) ¿DENTRO O FUERA? Estima si una casa ubicada en el punto (3, 4) (km) tiene señal, comprobando si está dentro de esa circunferencia.",
      contexto: "El ejercicio consolida el contenido formativo aplicando la parábola (antena/faro) y la circunferencia (alcance de señal) para modelar y estimar, tal como ocurre con la cobertura de telefonía o internet en México.",
      pasos: [
        "a) Sustituye (1, 0.25) en y = a·x²: 0.25 = a·(1)² ⇒ a = 0.25. La ecuación de la antena es y = 0.25·x².",
        "b) Para x = 2: y = 0.25·(2)² = 0.25·4 = 1 m. A 2 m del eje la antena sube 1 m de profundidad.",
        "c) Circunferencia con centro en el origen y radio 5: x² + y² = 5² ⇒ x² + y² = 25.",
        "d) Evalúa (3, 4): 3² + 4² = 9 + 16 = 25. Como 25 = 25, la casa está justo sobre el borde del alcance (a exactamente 5 km): tiene señal en el límite. Cualquier punto con x²+y² < 25 está dentro (con señal) y > 25 está fuera.",
      ],
      final: "a) a = 0.25 ⇒ y = 0.25·x². b) y = 1 m a x = 2 m. c) x² + y² = 25. d) 3²+4² = 25 = 25: la casa está en el borde del alcance (a 5 km), con señal al límite.",
      unidades: "metros (antena); kilómetros (cobertura)",
    },
    a3: {
      titulo: "Una cónica en tu entorno",
      desc: "Reflexiona sobre un objeto o fenómeno de tu entorno que tenga forma de cónica y modélalo.",
      prompt: "Busca en tu entorno un objeto o fenómeno que tenga la forma de una sección cónica —una antena de DISH o de wifi (parábola), un arco de un puente o una puerta (parábola/elipse), la trayectoria del agua de una manguera o de un balón (parábola), el área que riega un aspersor o cubre una antena (circunferencia), la órbita de un satélite (elipse)— y descríbelo. Di qué cónica es y por qué, escribe (aunque sea aproximada) su ecuación con dos variables, e indica qué podrías ESTIMAR con ella (una altura, un alcance, una distancia). Explica cómo este modelado consolida lo que aprendiste de geometría analítica.",
      pistas: [
        "Parábola y = a·x²: trayectorias, antenas, faros; concentra rayos en el foco.",
        "Circunferencia (x−h)²+(y−k)²=r²: alcances y coberturas; r es el radio.",
        "Elipse x²/a²+y²/b²=1: órbitas y arcos; dos focos, a y b semiejes.",
        "Modelar = identificar la cónica, escribir su ecuación con datos y estimar el valor buscado.",
      ],
      criterios: [
        "Identifica un objeto/fenómeno real y la cónica que lo modela, justificando por qué.",
        "Escribe (aunque sea aproximada) su ecuación con dos variables y la interpreta.",
        "Indica qué estimación permite hacer y conecta con los aprendizajes de geometría analítica.",
      ],
    },
    a4: {
      titulo: "Verdadero o falso: cónicas y modelado",
      desc: "Pon a prueba lo que entendiste sobre las secciones cónicas y sus aplicaciones.",
      preguntas: [
        { e: "Una antena parabólica concentra los rayos paralelos a su eje en un punto llamado foco.", r: true, fb: "Correcto: esa propiedad reflectora de la parábola es la que aprovechan antenas, faros y telescopios." },
        { e: "La ecuación de una circunferencia de centro (h,k) y radio r es (x−h)²+(y−k)²=r².", r: true, fb: "Correcto: todos sus puntos están a distancia r del centro." },
        { e: "Según Kepler, los planetas describen órbitas con forma de hipérbola.", r: false, fb: "Falso: las órbitas planetarias son ELIPSES, con el Sol en uno de los focos (primera ley de Kepler)." },
        { e: "La circunferencia es un caso particular de la elipse en el que los dos semiejes son iguales (a = b).", r: true, fb: "Correcto: cuando a = b la elipse se vuelve una circunferencia de radio r = a." },
        { e: "Para saber si un punto está dentro del alcance de una antena basta con comprobar si cumple x²+y² < r² (con la antena en el origen).", r: true, fb: "Correcto: dentro si x²+y²<r², en el borde si es igual y fuera si es mayor." },
        { e: "La hipérbola modela relaciones de proporcionalidad directa entre dos variables.", r: false, fb: "Falso: la hipérbola modela proporcionalidad INVERSA (cuando una variable crece, la otra decrece), como en la ley de Boyle." },
      ],
    },
    a5: {
      titulo: "Glosario: secciones cónicas y modelado",
      desc: "Términos clave para aplicar las cónicas al modelado y la estimación.",
      terminos: [
        { t: "Sección cónica", d: "Curva que resulta de cortar un cono con un plano: circunferencia, parábola, elipse o hipérbola.", e: "Cada una tiene una ecuación con dos variables (x, y)." },
        { t: "Parábola", d: "Curva de los puntos equidistantes de un foco y una recta directriz; refleja los rayos paralelos hacia el foco.", e: "y = a·x²; antenas, faros y trayectorias." },
        { t: "Foco", d: "Punto especial de una cónica donde se concentran o desde donde se proyectan los rayos.", e: "El receptor de una antena parabólica va en el foco." },
        { t: "Elipse", d: "Curva cerrada con dos focos; suma de distancias a ambos focos constante.", e: "x²/a²+y²/b²=1; órbitas y arcos." },
        { t: "Circunferencia", d: "Conjunto de puntos a la misma distancia (radio r) de un centro; elipse con a = b.", e: "(x−h)²+(y−k)²=r²; alcance de una señal." },
        { t: "Hipérbola", d: "Curva de dos ramas; diferencia de distancias a dos focos constante; modela proporcionalidad inversa.", e: "x²/a²−y²/b²=1; ley de Boyle, navegación." },
        { t: "Modelado", d: "Representar un fenómeno real mediante una ecuación matemática.", e: "Describir una antena con y = a·x²." },
        { t: "Estimación", d: "Usar la ecuación del modelo para calcular de forma aproximada un valor buscado.", e: "Estimar la altura de un balón o el alcance de una antena." },
      ],
      final: "Para una antena y = 0.5·x²: (1) di qué cónica es y dónde está su foco; (2) estima cuánto sube a x = 2 m; (3) escribe la ecuación de una circunferencia de cobertura de radio 3 km y di si el punto (2,2) tiene señal.",
    },
    a6: {
      titulo: "Completa: las secciones cónicas y sus usos",
      desc: "Completa el texto con los términos correctos sobre cónicas y modelado.",
      texto: "Las secciones cónicas son la ___, la parábola, la elipse y la hipérbola. La ___ refleja los rayos paralelos hacia su ___, por eso se usa en antenas y faros; su ecuación es y = a·x². La ___ tiene dos focos y modela las órbitas planetarias según las leyes de ___. La circunferencia es el caso de la elipse con semiejes ___ y su ecuación es (x−h)²+(y−k)²=___. La ___ modela la proporcionalidad inversa. Modelar consiste en escribir la ___ del fenómeno con dos variables y usarla para ___ un valor buscado.",
      huecos: [
        { c: "circunferencia", alt: ["la circunferencia"] },
        { c: "parábola", alt: ["la parábola"] },
        { c: "foco", alt: ["el foco"] },
        { c: "elipse", alt: ["la elipse"] },
        { c: "Kepler", alt: ["kepler"] },
        { c: "iguales", alt: ["igual", "a = b"] },
        { c: "r²", alt: ["r2", "r al cuadrado"] },
        { c: "hipérbola", alt: ["hiperbola", "la hipérbola"] },
        { c: "ecuación", alt: ["ecuacion"] },
        { c: "estimar", alt: ["calcular", "aproximar"] },
      ],
    },
    a7: {
      titulo: "¿Cómo voy con el modelado mediante cónicas?",
      desc: "Evalúa tu dominio de la aplicación de las secciones cónicas.",
      criterios: [
        "Identifico qué sección cónica modela un fenómeno real y justifico por qué.",
        "Escribo la ecuación de una parábola, circunferencia o elipse a partir de datos.",
        "Uso la ecuación del modelo para estimar un valor (altura, alcance, distancia).",
        "Conecto el modelado con cónicas con situaciones de mi entorno.",
      ],
      reflexion: "¿Qué cónica te resultó más útil para modelar algo de tu entorno y qué pudiste estimar con su ecuación?",
    },
  },

  // ════════════════ PM-VI·O3 — Teoría de conjuntos ════════════════
  {
    uac: "PM-VI", progCodigo: "PM-VI-P10", numero: 3,
    categoria: "Pensamiento estadístico y probabilístico", subcategoria: "Teoría de conjuntos",
    meta: META_PMVI,
    O: "Comprende los conceptos básicos de la teoría de conjuntos para aplicarlos en problemas que le sean presentados.",
    C: "Concepto general de conjunto Notación e igualdad de conjuntos Subconjunto, conjunto universal y subconjuntos Representación de conjuntos con diagramas de Venn Leyes de Morgan",
    descripcion: "Introduce la teoría de conjuntos como lenguaje para organizar y razonar sobre colecciones de objetos: el concepto de conjunto y su notación, la igualdad de conjuntos, los subconjuntos, el conjunto universal, las operaciones (unión, intersección, complemento, diferencia), su representación con diagramas de Venn y las leyes de De Morgan. Es la base del conteo y la probabilidad del semestre, con aplicaciones a encuestas y clasificación de datos.",
    fuente: "MCCEMS 2025 — Pensamiento Matemático VI «Pensamiento estadístico y probabilístico», contenido formativo: Concepto general de conjunto · Notación e igualdad de conjuntos · Subconjunto, conjunto universal y subconjuntos · Representación de conjuntos con diagramas de Venn · Leyes de Morgan.",
    a1: {
      titulo: "Conjuntos: el lenguaje para organizar y razonar con colecciones",
      desc: "Lee qué es un conjunto, su notación, los subconjuntos, las operaciones, los diagramas de Venn y las leyes de De Morgan.",
      minutos: 11,
      texto:
        "Un CONJUNTO es una colección bien definida de objetos llamados ELEMENTOS. «Bien definida» significa que siempre se puede decir con claridad si algo pertenece o no al conjunto. Los conjuntos se nombran con letras mayúsculas y sus elementos se escriben entre llaves: por ejemplo, A = {1, 2, 3, 4, 5} o V = {a, e, i, o, u}. La pertenencia se escribe con el símbolo ∈: «3 ∈ A» se lee «3 pertenece a A»; y «7 ∉ A», «7 no pertenece a A». Un conjunto puede definirse por EXTENSIÓN (listando sus elementos) o por COMPRENSIÓN (con una propiedad: A = {x | x es un número natural del 1 al 5}).\n\n" +
        "IGUALDAD Y SUBCONJUNTOS. Dos conjuntos son IGUALES si tienen exactamente los mismos elementos, sin importar el orden ni las repeticiones: {1,2,3} = {3,2,1}. Un conjunto B es SUBCONJUNTO de A (se escribe B ⊆ A) si todos los elementos de B están también en A. Por ejemplo, {1,2} ⊆ {1,2,3,4,5}. El CONJUNTO VACÍO (∅), que no tiene elementos, es subconjunto de cualquier conjunto. El CONJUNTO UNIVERSAL (U) es el conjunto de referencia que contiene a todos los elementos posibles del problema (por ejemplo, todos los estudiantes de un grupo).\n\n" +
        "LAS OPERACIONES. Con los conjuntos se opera como con números, pero con su propio significado. La UNIÓN (A ∪ B) reúne todos los elementos que están en A, en B o en ambos («o»). La INTERSECCIÓN (A ∩ B) toma solo los elementos que están en A Y en B a la vez («y»); si no comparten elementos, son DISJUNTOS y A ∩ B = ∅. El COMPLEMENTO (Aᶜ o A') son todos los elementos del universal que NO están en A. La DIFERENCIA (A − B) son los elementos de A que no están en B. Estas operaciones permiten combinar y filtrar colecciones.\n\n" +
        "DIAGRAMAS DE VENN. La forma más clara de visualizar conjuntos y operaciones son los DIAGRAMAS DE VENN: un rectángulo representa el universal U y dentro, óvalos representan los conjuntos. Las zonas donde se traslapan los óvalos son las intersecciones. Estos diagramas son la herramienta clave para resolver problemas de encuestas: por ejemplo, cuántas personas practican fútbol, básquetbol, ambos o ninguno. Se colocan primero los datos de la intersección y luego se completan las demás zonas.\n\n" +
        "LAS LEYES DE DE MORGAN. Dos identidades muy útiles relacionan complemento, unión e intersección. La primera dice que el complemento de una unión es la intersección de los complementos: (A ∪ B)ᶜ = Aᶜ ∩ Bᶜ. La segunda, que el complemento de una intersección es la unión de los complementos: (A ∩ B)ᶜ = Aᶜ ∪ Bᶜ. En palabras: «no (A o B)» equivale a «no A y no B», y «no (A y B)» equivale a «no A o no B». Estas leyes son fundamentales en lógica, en bases de datos y en probabilidad, y muestran que la teoría de conjuntos es el lenguaje que organiza el razonamiento del semestre antes de entrar al conteo y la probabilidad.",
      preguntas: [
        { p: "¿Qué diferencia hay entre la unión y la intersección de dos conjuntos?", r: "La unión A∪B reúne los elementos que están en A, en B o en ambos («o»); la intersección A∩B toma solo los que están en A y en B a la vez («y»). Si no comparten elementos, la intersección es el conjunto vacío." },
        { p: "¿Qué es el conjunto universal y para qué sirve en un diagrama de Venn?", r: "Es el conjunto de referencia (U) que contiene todos los elementos posibles del problema; en un diagrama de Venn se representa con el rectángulo que rodea a los óvalos, y sirve para definir el complemento (lo que queda fuera de un conjunto)." },
        { p: "Enuncia una de las leyes de De Morgan.", r: "El complemento de una unión es la intersección de los complementos: (A∪B)ᶜ=Aᶜ∩Bᶜ («no (A o B)» = «no A y no B»). La otra: (A∩B)ᶜ=Aᶜ∪Bᶜ." },
      ],
    },
    a2: {
      titulo: "Encuesta con diagrama de Venn: deportes en un grupo",
      desc: "Aplica conjuntos, intersección, unión y complemento para resolver un problema de encuesta con un diagrama de Venn.",
      instrucciones: "Dibuja un diagrama de Venn de dos conjuntos dentro del universal y llénalo empezando por la intersección.",
      problema:
        "En un grupo de 40 estudiantes se preguntó qué deporte practican. 22 practican fútbol (F), 18 practican básquetbol (B) y 10 practican AMBOS.\n\n" +
        "a) ¿Cuántos practican SOLO fútbol y cuántos SOLO básquetbol?\n\n" +
        "b) ¿Cuántos practican fútbol O básquetbol (la unión F ∪ B)?\n\n" +
        "c) ¿Cuántos NO practican ninguno de los dos (el complemento de la unión)?\n\n" +
        "d) Verifica tu resultado del inciso (c) usando la idea de las leyes de De Morgan: «no (F o B)» = «no F y no B».",
      contexto: "El problema aplica el contenido formativo: conjuntos, subconjuntos, intersección, unión, complemento, diagramas de Venn y las leyes de De Morgan, en un contexto cotidiano de encuesta escolar.",
      pasos: [
        "a) La intersección F∩B = 10 (ambos). Solo fútbol = 22 − 10 = 12. Solo básquetbol = 18 − 10 = 8.",
        "b) Unión F∪B = solo F + solo B + ambos = 12 + 8 + 10 = 30. (Equivale a 22 + 18 − 10 = 30, por el principio de inclusión-exclusión.)",
        "c) Ninguno = universal − unión = 40 − 30 = 10 estudiantes.",
        "d) «no F y no B» = los que no están ni en F ni en B = los 10 de fuera de ambos óvalos: coincide con el complemento de la unión (F∪B)ᶜ = 10, confirmando la ley de De Morgan.",
      ],
      final: "a) Solo fútbol 12, solo básquetbol 8. b) Unión = 30. c) Ninguno = 10. d) (F∪B)ᶜ = Fᶜ∩Bᶜ = 10 (verifica De Morgan).",
      unidades: "número de estudiantes",
    },
    a3: {
      titulo: "Conjuntos en tu vida diaria",
      desc: "Reflexiona sobre una situación de tu entorno que puedas organizar con conjuntos y un diagrama de Venn.",
      prompt: "Piensa en una situación de tu vida donde clasifiques cosas o personas en grupos que pueden traslaparse —por ejemplo: compañeros que juegan fútbol y/o básquetbol, canciones de dos géneros, apps que usas para estudiar y/o para entretenerte, alimentos dulces y/o saludables— y organízala con teoría de conjuntos. Define el conjunto universal y dos conjuntos, describe su intersección, su unión y el complemento, y dibuja (con palabras) cómo quedaría el diagrama de Venn. Explica qué conclusión puedes sacar y cómo las leyes de De Morgan te ayudan a interpretar el «ninguno».",
      pistas: [
        "Conjunto = colección bien definida; usa llaves { } y el símbolo ∈ para pertenencia.",
        "Intersección (∩) = «y» (en ambos); Unión (∪) = «o» (en alguno); Complemento = lo que queda fuera, dentro del universal.",
        "Diagrama de Venn: rectángulo = universal U; óvalos = conjuntos; traslape = intersección.",
        "De Morgan: «no (A o B)» = «no A y no B»; útil para contar los que no están en ninguno.",
      ],
      criterios: [
        "Define un universal y dos conjuntos de una situación real y los describe con notación.",
        "Identifica correctamente intersección, unión y complemento, y los visualiza como Venn.",
        "Saca una conclusión e interpreta el «ninguno» con las leyes de De Morgan.",
      ],
    },
    a4: {
      titulo: "Verdadero o falso: teoría de conjuntos",
      desc: "Pon a prueba lo que entendiste sobre conjuntos, operaciones y diagramas de Venn.",
      preguntas: [
        { e: "Los conjuntos {1,2,3} y {3,2,1} son iguales.", r: true, fb: "Correcto: en un conjunto no importa el orden ni las repeticiones; tienen los mismos elementos." },
        { e: "La intersección A∩B contiene los elementos que están en A o en B (en al menos uno).", r: false, fb: "Falso: eso es la UNIÓN (∪). La intersección (∩) contiene solo los elementos que están en A Y en B a la vez." },
        { e: "El conjunto vacío ∅ es subconjunto de cualquier conjunto.", r: true, fb: "Correcto: el conjunto vacío no tiene elementos, por lo que ⊆ a todo conjunto." },
        { e: "El conjunto universal U contiene todos los elementos posibles del problema considerado.", r: true, fb: "Correcto: es el conjunto de referencia; en un Venn es el rectángulo que rodea los óvalos." },
        { e: "Según las leyes de De Morgan, (A∪B)ᶜ = Aᶜ ∩ Bᶜ.", r: true, fb: "Correcto: el complemento de una unión es la intersección de los complementos." },
        { e: "Si dos conjuntos son disjuntos, su intersección es el conjunto universal.", r: false, fb: "Falso: si son disjuntos no comparten elementos, así que su intersección es el conjunto VACÍO (∅), no el universal." },
      ],
    },
    a5: {
      titulo: "Glosario: conjuntos, operaciones y Venn",
      desc: "Términos clave de la teoría de conjuntos.",
      terminos: [
        { t: "Conjunto", d: "Colección bien definida de objetos llamados elementos.", e: "A = {1, 2, 3, 4, 5}." },
        { t: "Elemento / pertenencia (∈)", d: "Cada objeto del conjunto; ∈ indica que pertenece, ∉ que no.", e: "3 ∈ A; 7 ∉ A." },
        { t: "Subconjunto (⊆)", d: "B es subconjunto de A si todos los elementos de B están en A.", e: "{1,2} ⊆ {1,2,3}." },
        { t: "Conjunto vacío (∅)", d: "Conjunto sin elementos; es subconjunto de todos.", e: "Los meses con 32 días = ∅." },
        { t: "Conjunto universal (U)", d: "Conjunto de referencia con todos los elementos posibles del problema.", e: "Todos los estudiantes de un grupo." },
        { t: "Unión (∪)", d: "Elementos que están en A, en B o en ambos («o»).", e: "{1,2}∪{2,3} = {1,2,3}." },
        { t: "Intersección (∩)", d: "Elementos que están en A y en B a la vez («y»).", e: "{1,2}∩{2,3} = {2}." },
        { t: "Complemento (Aᶜ)", d: "Elementos del universal que no están en A.", e: "Si U={1..5} y A={1,2}, Aᶜ={3,4,5}." },
        { t: "Diagrama de Venn", d: "Representación gráfica: rectángulo (U) y óvalos (conjuntos) que se traslapan.", e: "Sirve para resolver problemas de encuestas." },
        { t: "Leyes de De Morgan", d: "(A∪B)ᶜ=Aᶜ∩Bᶜ y (A∩B)ᶜ=Aᶜ∪Bᶜ.", e: "«no (A o B)» = «no A y no B»." },
      ],
      final: "Sea U = {1,2,3,4,5,6}, A = {1,2,3}, B = {3,4}: calcula A∪B, A∩B, Aᶜ y comprueba (A∪B)ᶜ = Aᶜ∩Bᶜ.",
    },
    a6: {
      titulo: "Completa: el lenguaje de los conjuntos",
      desc: "Completa el texto con los términos correctos de teoría de conjuntos.",
      texto: "Un ___ es una colección bien definida de objetos llamados ___. La ___ A∪B reúne lo que está en A, en B o en ambos, mientras que la ___ A∩B solo toma lo que está en ambos a la vez. El ___ de A son los elementos del conjunto ___ que no están en A. Dos conjuntos sin elementos en común son ___ y su intersección es el conjunto ___. Los ___ de Venn representan estas operaciones con óvalos. Las leyes de ___ afirman que (A∪B)ᶜ = Aᶜ ∩ Bᶜ.",
      huecos: [
        { c: "conjunto", alt: ["el conjunto"] },
        { c: "elementos", alt: ["elemento"] },
        { c: "unión", alt: ["union", "la unión"] },
        { c: "intersección", alt: ["interseccion", "la intersección"] },
        { c: "complemento", alt: ["el complemento"] },
        { c: "universal", alt: ["conjunto universal"] },
        { c: "disjuntos", alt: ["disjuntas", "ajenos"] },
        { c: "vacío", alt: ["vacio", "∅"] },
        { c: "diagramas", alt: ["diagrama"] },
        { c: "De Morgan", alt: ["de morgan", "Morgan"] },
      ],
    },
    a7: {
      titulo: "¿Cómo voy con la teoría de conjuntos?",
      desc: "Evalúa tu dominio de los conceptos de conjuntos.",
      criterios: [
        "Defino un conjunto por extensión y por comprensión y uso la notación (∈, ⊆, ∅, U).",
        "Calculo unión, intersección y complemento de dos conjuntos.",
        "Resuelvo un problema de encuesta con un diagrama de Venn.",
        "Aplico las leyes de De Morgan para interpretar complementos.",
      ],
      reflexion: "¿Qué concepto de conjuntos (subconjunto, complemento, Venn o De Morgan) te costó más y cómo lo aclararías con un ejemplo propio?",
    },
  },

  // ════════════════ PM-VI·O4 — Técnicas de conteo y probabilidad ════════════════
  {
    uac: "PM-VI", progCodigo: "PM-VI-P11", numero: 4,
    categoria: "Pensamiento estadístico y probabilístico", subcategoria: "Técnicas de conteo y probabilidad",
    meta: META_PMVI,
    O: "Selecciona y aplica una técnica de conteo (permutaciones, combinaciones, reemplazo con y sin orden) para calcular probabilidad en eventos simples y apoyar la toma de decisiones.",
    C: "Técnicas de conteo Probabilidad dependiente e independiente Probabilidad condicionada",
    descripcion: "Enseña a contar de cuántas formas puede ocurrir algo —principio multiplicativo, permutaciones (cuando importa el orden), combinaciones (cuando no importa) y conteo con o sin reemplazo— para luego calcular la probabilidad de eventos simples. Distingue la probabilidad de eventos independientes (la regla del producto) de los dependientes y la probabilidad condicionada, con aplicaciones a juegos, sorteos y toma de decisiones.",
    fuente: "MCCEMS 2025 — Pensamiento Matemático VI «Pensamiento estadístico y probabilístico», contenido formativo: Técnicas de conteo · Probabilidad dependiente e independiente · Probabilidad condicionada.",
    a1: {
      titulo: "Contar para decidir: permutaciones, combinaciones y probabilidad",
      desc: "Lee cómo contar casos con permutaciones y combinaciones y cómo usar ese conteo para calcular probabilidades.",
      minutos: 12,
      texto:
        "Antes de calcular la probabilidad de algo, muchas veces hay que CONTAR de cuántas formas distintas puede ocurrir. Para eso existen las TÉCNICAS DE CONTEO. La más básica es el PRINCIPIO MULTIPLICATIVO: si una decisión se toma en etapas, el total de resultados es el producto de las opciones de cada etapa. Por ejemplo, si tienes 3 playeras y 2 pantalones, puedes formar 3 × 2 = 6 atuendos. Este principio es la base de todo lo demás.\n\n" +
        "PERMUTACIONES: cuando IMPORTA el orden. Una PERMUTACIÓN es un arreglo de objetos en el que el orden sí importa. ¿De cuántas formas pueden quedar el 1.º, 2.º y 3.er lugar de una carrera de 5 corredores? El primero puede ser cualquiera de los 5, el segundo cualquiera de los 4 restantes y el tercero de los 3: 5 × 4 × 3 = 60. En general, las permutaciones de n objetos tomados de r en r son P(n,r) = n! / (n−r)!, donde n! (factorial) es el producto de todos los enteros del 1 al n. El orden distingue: «Ana-Beto-Carla» es distinto de «Carla-Beto-Ana».\n\n" +
        "COMBINACIONES: cuando NO importa el orden. Una COMBINACIÓN es una selección en la que el orden NO importa. ¿De cuántas formas se puede elegir un comité de 3 personas entre 5? Aquí «Ana, Beto, Carla» es el mismo comité que «Carla, Beto, Ana». Las combinaciones de n tomados de r son C(n,r) = n! / [r!·(n−r)!]. Siempre hay menos combinaciones que permutaciones, porque varias permutaciones equivalen a una sola combinación. La pregunta clave para elegir la técnica es: ¿importa el orden? Si sí, permutación; si no, combinación.\n\n" +
        "CON Y SIN REEMPLAZO. Al extraer objetos, importa si se devuelven o no. SIN REEMPLAZO, cada extracción reduce el total disponible (sacar 2 cartas de una baraja sin regresarlas). CON REEMPLAZO, se devuelve el objeto y el total no cambia (tirar un dado dos veces). Esto afecta directamente el conteo y la probabilidad.\n\n" +
        "DE CONTAR A LA PROBABILIDAD. La probabilidad clásica de un evento es P = casos favorables / casos posibles, y ambos se obtienen contando. Por ejemplo, la probabilidad de ganar un sorteo donde eliges 6 números de 49 es 1 / C(49,6), un número diminuto. Cuando hay varios eventos, hay que distinguir: dos eventos son INDEPENDIENTES si el resultado de uno no afecta al otro (dos tiros de dado); entonces P(A y B) = P(A) × P(B). Son DEPENDIENTES si uno afecta al otro (sacar dos cartas sin reemplazo): la probabilidad de la segunda depende de lo que pasó en la primera.\n\n" +
        "PROBABILIDAD CONDICIONADA. La PROBABILIDAD CONDICIONADA P(B|A) es la probabilidad de que ocurra B SABIENDO que ya ocurrió A: P(B|A) = P(A y B) / P(A). Por ejemplo, la probabilidad de sacar un rey en la segunda carta sabiendo que la primera ya fue un rey. Dominar el conteo y estas reglas permite calcular probabilidades reales y tomar decisiones informadas: evaluar un juego de azar, un sorteo o el riesgo de un evento.",
      preguntas: [
        { p: "¿Cómo se decide si usar una permutación o una combinación?", r: "Preguntando si importa el orden. Si el orden distingue los arreglos (podio de una carrera, contraseñas), es una permutación P(n,r)=n!/(n−r)!. Si el orden no importa (un comité, una mano de cartas), es una combinación C(n,r)=n!/[r!(n−r)!]." },
        { p: "¿Qué diferencia hay entre eventos independientes y dependientes?", r: "En los independientes el resultado de uno no afecta al otro (dos tiros de dado), y P(A y B)=P(A)×P(B). En los dependientes uno sí afecta al otro (extraer cartas sin reemplazo), y la probabilidad del segundo depende del primero." },
        { p: "¿Qué expresa la probabilidad condicionada P(B|A)?", r: "La probabilidad de que ocurra B sabiendo que ya ocurrió A; se calcula como P(B|A)=P(A y B)/P(A)." },
      ],
    },
    a2: {
      titulo: "Cuenta y calcula: comités, podios y probabilidad",
      desc: "Aplica permutaciones, combinaciones y la regla del producto para contar casos y calcular probabilidades.",
      instrucciones: "Decide en cada inciso si importa el orden (permutación) o no (combinación), y úsalo para contar; luego calcula la probabilidad pedida.",
      problema:
        "En un grupo de 5 estudiantes: Ana, Beto, Carla, Diego y Eva.\n\n" +
        "a) PODIO. ¿De cuántas formas pueden ocupar el 1.º, 2.º y 3.er lugar de un concurso? (¿Importa el orden?)\n\n" +
        "b) COMITÉ. ¿De cuántas formas se puede elegir un comité de 3 entre los 5? (¿Importa el orden?)\n\n" +
        "c) PROBABILIDAD. Si el comité de 3 se elige al azar, ¿cuál es la probabilidad de que Ana quede incluida?\n\n" +
        "d) INDEPENDENCIA. Si se lanza un dado dos veces, ¿cuál es la probabilidad de sacar 6 en ambos lanzamientos?",
      contexto: "El ejercicio aplica el contenido formativo: técnicas de conteo (permutaciones vs combinaciones), probabilidad como favorables/posibles, y la regla del producto para eventos independientes.",
      pasos: [
        "a) Importa el orden (1.º ≠ 2.º) ⇒ permutación P(5,3) = 5×4×3 = 60 formas.",
        "b) No importa el orden (un comité es el mismo sin importar cómo se nombre) ⇒ combinación C(5,3) = 5!/(3!·2!) = 120/(6·2) = 10 comités.",
        "c) Comités que incluyen a Ana: fijamos a Ana y elegimos 2 de los 4 restantes = C(4,2) = 6. Probabilidad = 6/10 = 0.6 = 60%.",
        "d) Lanzamientos independientes: P(6) = 1/6 cada uno ⇒ P(6 y 6) = 1/6 × 1/6 = 1/36 ≈ 0.0278 ≈ 2.78%.",
      ],
      final: "a) P(5,3) = 60 formas. b) C(5,3) = 10 comités. c) 6/10 = 0.6 = 60% incluye a Ana. d) 1/6 × 1/6 = 1/36 ≈ 2.78%.",
      unidades: "número de formas; probabilidad (fracción o %)",
    },
    a3: {
      titulo: "Conteo y azar en una decisión real",
      desc: "Reflexiona sobre una situación de tu vida donde contar casos te ayude a estimar una probabilidad y decidir.",
      prompt: "Piensa en una situación de tu vida donde el azar interviene y contar las posibilidades te ayudaría a decidir: un sorteo o rifa escolar, elegir un equipo o comité, armar combinaciones de ropa o de comida, una contraseña, o un juego de cartas o dados. Describe la situación, identifica si para contar las posibilidades importa o no el orden (permutación o combinación), calcula cuántos casos hay y estima la probabilidad del resultado que te interesa. Concluye qué decisión informada tomarías a partir de esa probabilidad (por ejemplo, si conviene jugar un sorteo).",
      pistas: [
        "Principio multiplicativo: multiplica las opciones de cada etapa.",
        "Permutación (importa el orden): P(n,r)=n!/(n−r)!. Combinación (no importa): C(n,r)=n!/[r!(n−r)!].",
        "Probabilidad clásica = casos favorables / casos posibles.",
        "Eventos independientes: P(A y B)=P(A)×P(B). Condicionada: P(B|A)=P(A y B)/P(A).",
      ],
      criterios: [
        "Describe una situación real de azar y decide correctamente entre permutación y combinación.",
        "Cuenta los casos posibles y favorables y estima la probabilidad pedida.",
        "Usa la probabilidad para fundamentar una decisión.",
      ],
    },
    a4: {
      titulo: "Verdadero o falso: conteo y probabilidad",
      desc: "Pon a prueba lo que entendiste sobre permutaciones, combinaciones y probabilidad.",
      preguntas: [
        { e: "En una permutación importa el orden de los elementos; en una combinación no.", r: true, fb: "Correcto: por eso un podio (orden) es permutación y un comité (sin orden) es combinación." },
        { e: "Siempre hay más combinaciones que permutaciones de los mismos objetos.", r: false, fb: "Falso: hay MENOS combinaciones, porque varias permutaciones (que solo difieren en el orden) equivalen a una sola combinación." },
        { e: "La probabilidad clásica de un evento es casos favorables entre casos posibles.", r: true, fb: "Correcto: P = favorables/posibles, y ambos se obtienen contando." },
        { e: "Para dos eventos independientes, P(A y B) = P(A) × P(B).", r: true, fb: "Correcto: como uno no afecta al otro, se multiplican sus probabilidades (regla del producto)." },
        { e: "Extraer dos cartas de una baraja sin devolverlas son eventos independientes.", r: false, fb: "Falso: son DEPENDIENTES, porque al no reemplazar la primera carta cambian las posibilidades de la segunda." },
        { e: "La probabilidad condicionada P(B|A) es la probabilidad de B sabiendo que ya ocurrió A.", r: true, fb: "Correcto: P(B|A) = P(A y B)/P(A)." },
      ],
    },
    a5: {
      titulo: "Glosario: técnicas de conteo y probabilidad",
      desc: "Términos clave del conteo y la probabilidad.",
      terminos: [
        { t: "Principio multiplicativo", d: "Si una tarea se hace en etapas, el total de resultados es el producto de las opciones de cada etapa.", e: "3 playeras × 2 pantalones = 6 atuendos." },
        { t: "Factorial (n!)", d: "Producto de todos los enteros positivos del 1 al n.", e: "4! = 4×3×2×1 = 24." },
        { t: "Permutación", d: "Arreglo en el que importa el orden: P(n,r)=n!/(n−r)!.", e: "Podio de 3 entre 5: P(5,3)=60." },
        { t: "Combinación", d: "Selección en la que no importa el orden: C(n,r)=n!/[r!(n−r)!].", e: "Comité de 3 entre 5: C(5,3)=10." },
        { t: "Con/sin reemplazo", d: "Si el objeto extraído se devuelve (con) o no (sin) antes de la siguiente extracción.", e: "Dado dos veces: con reemplazo. Dos cartas seguidas: sin reemplazo." },
        { t: "Probabilidad clásica", d: "Casos favorables entre casos posibles.", e: "Sacar par en un dado: 3/6 = 1/2." },
        { t: "Eventos independientes", d: "El resultado de uno no afecta al otro; P(A y B)=P(A)×P(B).", e: "Dos tiros de dado." },
        { t: "Eventos dependientes", d: "Uno afecta al otro; la probabilidad del segundo cambia según el primero.", e: "Sacar dos cartas sin reemplazo." },
        { t: "Probabilidad condicionada", d: "P(B|A)=P(A y B)/P(A): probabilidad de B sabiendo que ocurrió A.", e: "Rey en la 2.ª carta sabiendo que la 1.ª fue rey." },
      ],
      final: "Con 6 personas: (1) ¿cuántos podios de 3 hay? (permutación); (2) ¿cuántos equipos de 3? (combinación); (3) si se elige un equipo de 3 al azar, ¿probabilidad de que cierta persona quede incluida?",
    },
    a6: {
      titulo: "Completa: contar y calcular probabilidades",
      desc: "Completa el texto con los términos correctos de conteo y probabilidad.",
      texto: "Cuando importa el orden de los elementos, usamos una ___; cuando no importa, una ___. El ___ multiplicativo dice que el total de resultados es el ___ de las opciones de cada etapa. La probabilidad clásica es casos ___ entre casos ___. Dos eventos son ___ si el resultado de uno no afecta al otro, y entonces P(A y B) = P(A) ___ P(B). Si uno afecta al otro son ___. La probabilidad ___ P(B|A) es la de B sabiendo que ya ocurrió A.",
      huecos: [
        { c: "permutación", alt: ["permutacion", "una permutación"] },
        { c: "combinación", alt: ["combinacion", "una combinación"] },
        { c: "principio", alt: ["el principio"] },
        { c: "producto", alt: ["la multiplicación", "multiplicación"] },
        { c: "favorables", alt: ["favorable"] },
        { c: "posibles", alt: ["posible", "totales"] },
        { c: "independientes", alt: ["independiente"] },
        { c: "×", alt: ["por", "multiplicado por", "x"] },
        { c: "dependientes", alt: ["dependiente"] },
        { c: "condicionada", alt: ["condicional"] },
      ],
    },
    a7: {
      titulo: "¿Cómo voy con el conteo y la probabilidad?",
      desc: "Evalúa tu dominio de las técnicas de conteo y la probabilidad.",
      criterios: [
        "Distingo cuándo usar permutación y cuándo combinación según importe el orden.",
        "Cuento casos con el principio multiplicativo, permutaciones y combinaciones.",
        "Calculo la probabilidad de un evento simple como favorables/posibles.",
        "Distingo eventos independientes, dependientes y aplico la probabilidad condicionada.",
      ],
      reflexion: "¿Qué te costó más: decidir entre permutación y combinación, o distinguir eventos independientes de dependientes? ¿Cómo lo repasarías?",
    },
  },

  // ════════════════ PM-VI·O6 — Relación entre variables ════════════════
  {
    uac: "PM-VI", progCodigo: "PM-VI-P12", numero: 6,
    categoria: "Pensamiento estadístico y probabilístico", subcategoria: "Relación entre variables",
    meta: META_PMVI,
    O: "Reconoce algunas problemáticas o fenómenos de interés, para identificar cómo se relacionan entre sí dos o más variables categóricas y dos o más variables cuantitativas.",
    C: "Independencia de variables cualitativas Correlación de variables cuantitativas",
    descripcion: "Estudia cómo se relacionan dos variables: si son cualitativas (categóricas), mediante tablas de contingencia para ver si son independientes o están asociadas; si son cuantitativas (numéricas), mediante diagramas de dispersión y el coeficiente de correlación, que mide si crecen juntas (correlación positiva), en sentido contrario (negativa) o sin relación. Insiste en la idea clave de que correlación no implica causalidad.",
    fuente: "MCCEMS 2025 — Pensamiento Matemático VI «Pensamiento estadístico y probabilístico», contenido formativo: Independencia de variables cualitativas · Correlación de variables cuantitativas.",
    a1: {
      titulo: "¿Están relacionadas? Independencia y correlación entre variables",
      desc: "Lee cómo detectar relación entre variables cualitativas (tablas de contingencia) y cuantitativas (correlación).",
      minutos: 11,
      texto:
        "Muchas preguntas interesantes son sobre la RELACIÓN entre dos cosas: ¿el sexo se relaciona con la preferencia deportiva?, ¿estudiar más horas se relaciona con una mejor calificación?, ¿la temperatura con el consumo de helado? Para responder con datos hay que distinguir el tipo de variables: CUALITATIVAS (categóricas, como sexo, color o preferencia) y CUANTITATIVAS (numéricas, como horas, calificación o temperatura). Cada tipo se analiza con herramientas distintas.\n\n" +
        "VARIABLES CUALITATIVAS: tablas de contingencia e independencia. Cuando las dos variables son categóricas, se organizan en una TABLA DE CONTINGENCIA (o tabla de doble entrada), que cruza las categorías de una variable con las de la otra y cuenta cuántos casos caen en cada cruce. Con ella se pregunta si las variables son INDEPENDIENTES (no se relacionan) o están ASOCIADAS. La idea es comparar lo OBSERVADO con lo que se ESPERARÍA si fueran independientes: si la proporción de, digamos, quienes prefieren fútbol es igual entre hombres y mujeres, las variables son independientes; si difiere mucho, hay asociación. Por ejemplo, si en una encuesta el 70% de los hombres y el 30% de las mujeres prefieren cierto deporte, sexo y preferencia están asociados.\n\n" +
        "VARIABLES CUANTITATIVAS: diagramas de dispersión y correlación. Cuando las dos variables son numéricas, se grafican como puntos en un DIAGRAMA DE DISPERSIÓN: cada individuo es un punto (x, y). La forma de la nube de puntos revela la relación. Si al crecer x tiende a crecer y, la CORRELACIÓN es POSITIVA (la nube sube de izquierda a derecha); si al crecer x tiende a decrecer y, es NEGATIVA (la nube baja); si no hay patrón, no hay correlación (nube dispersa).\n\n" +
        "EL COEFICIENTE DE CORRELACIÓN. Para medir la fuerza y el sentido de la relación lineal se usa el COEFICIENTE DE CORRELACIÓN (r), un número entre −1 y +1. Un valor cercano a +1 indica correlación positiva fuerte (los puntos casi forman una recta ascendente); cercano a −1, negativa fuerte (recta descendente); cercano a 0, poca o ninguna relación lineal. Por ejemplo, horas de estudio y calificación suelen tener r positivo; horas frente a la TV y calificación, r negativo.\n\n" +
        "CORRELACIÓN NO ES CAUSALIDAD. La advertencia más importante: que dos variables estén correlacionadas NO significa que una CAUSE la otra. Puede haber una tercera variable oculta o una coincidencia. El clásico ejemplo: las ventas de helado y los ahogamientos suben juntas, pero el helado no causa ahogamientos; ambos suben por el calor del verano. Por eso, al analizar la relación entre variables —en salud, economía o educación— se reconoce la asociación, pero se es prudente al hablar de causas. Saber leer tablas de contingencia y diagramas de dispersión permite reconocer fenómenos de interés y fundamentar decisiones con datos.",
      preguntas: [
        { p: "¿Qué herramienta se usa para analizar la relación entre dos variables cualitativas y cómo se detecta la asociación?", r: "Una tabla de contingencia (doble entrada), que cruza las categorías y cuenta los casos. Se comparan las proporciones: si son parecidas entre grupos, las variables son independientes; si difieren mucho, están asociadas." },
        { p: "¿Qué indica el signo y el valor del coeficiente de correlación r?", r: "El signo indica el sentido: r positivo = al crecer una crece la otra; r negativo = al crecer una decrece la otra. El valor (entre −1 y +1) indica la fuerza: cercano a ±1 relación lineal fuerte, cercano a 0 poca o ninguna relación lineal." },
        { p: "¿Por qué se dice que «correlación no implica causalidad»?", r: "Porque dos variables pueden subir o bajar juntas sin que una cause la otra; puede haber una tercera variable oculta o una coincidencia, como el helado y los ahogamientos, que aumentan ambos por el calor del verano." },
      ],
    },
    a2: {
      titulo: "Tabla de contingencia y dispersión: ¿hay relación?",
      desc: "Analiza la independencia de dos variables cualitativas y el sentido de la correlación de dos cuantitativas.",
      instrucciones: "En (a–b) compara proporciones en la tabla; en (c–d) interpreta el sentido y la fuerza de la correlación.",
      problema:
        "PARTE 1 — Cualitativas. Se encuestó a 100 estudiantes sobre su sexo y su deporte favorito (fútbol o básquetbol):\n" +
        "  · Hombres: 30 fútbol, 20 básquetbol (50 en total).\n" +
        "  · Mujeres: 30 fútbol, 20 básquetbol (50 en total).\n\n" +
        "a) ¿Qué proporción de los hombres prefiere fútbol? ¿Y de las mujeres?\n\n" +
        "b) Según esas proporciones, ¿el sexo y el deporte favorito son independientes o están asociados? Justifica.\n\n" +
        "PARTE 2 — Cuantitativas. Para 5 estudiantes se registró (horas de estudio, calificación): (1, 6), (2, 7), (3, 7), (4, 9), (5, 10).\n\n" +
        "c) Al aumentar las horas de estudio, ¿la calificación tiende a subir, bajar o no cambia? ¿Qué signo tendría el coeficiente de correlación r?\n\n" +
        "d) Si además registráramos (horas de TV, calificación) y r resultara cercano a −0.9, ¿cómo se interpretaría? ¿Significa que ver TV CAUSA bajas calificaciones?",
      contexto: "El ejercicio aplica el contenido formativo: independencia de variables cualitativas mediante tabla de contingencia y correlación de variables cuantitativas mediante el sentido y el signo de r, con la advertencia de que correlación no es causalidad.",
      pasos: [
        "a) Hombres con fútbol: 30/50 = 0.60 = 60%. Mujeres con fútbol: 30/50 = 0.60 = 60%.",
        "b) Las proporciones son IGUALES (60% en ambos grupos), así que el deporte favorito no depende del sexo: las variables son INDEPENDIENTES (no hay asociación).",
        "c) Al aumentar las horas, la calificación tiende a SUBIR (de 6 a 10): correlación POSITIVA, con r de signo positivo (cercano a +1, pues los puntos casi forman una recta ascendente).",
        "d) r ≈ −0.9 indica correlación NEGATIVA fuerte: a más horas de TV, menores calificaciones. Pero NO prueba causalidad: podría haber una tercera variable (p. ej. menos tiempo de estudio); correlación no implica causa.",
      ],
      final: "a) 60% de hombres y 60% de mujeres prefieren fútbol. b) Independientes (proporciones iguales). c) Sube ⇒ r positivo (≈ +1). d) r≈−0.9 = relación negativa fuerte, pero NO implica causalidad (puede haber una variable oculta).",
      unidades: "proporciones (% ); coeficiente r entre −1 y +1",
    },
    a3: {
      titulo: "¿Se relacionan? Dos variables de tu interés",
      desc: "Reflexiona sobre dos variables de tu entorno que creas relacionadas y analiza su posible relación.",
      prompt: "Elige dos variables de tu vida o tu comunidad que creas que podrían estar relacionadas —por ejemplo: horas de sueño y rendimiento, horas en el celular y calificaciones, temperatura del día y consumo de agua, género y materia favorita, lugar de residencia y medio de transporte— y analiza su relación. Indica si son cualitativas o cuantitativas; si son cualitativas, describe cómo harías una tabla de contingencia para ver si son independientes; si son cuantitativas, describe cómo se vería su diagrama de dispersión y qué signo esperarías para r. Concluye reflexionando sobre por qué, aunque encuentres correlación, no puedes afirmar que una variable CAUSA la otra.",
      pistas: [
        "Cualitativas (categorías) → tabla de contingencia; compara proporciones entre grupos.",
        "Cuantitativas (números) → diagrama de dispersión; nube ascendente = r positivo, descendente = r negativo.",
        "r va de −1 a +1; cerca de 0 = poca relación lineal.",
        "Correlación no implica causalidad: puede haber una tercera variable oculta.",
      ],
      criterios: [
        "Identifica dos variables reales y clasifica correctamente su tipo (cualitativas/cuantitativas).",
        "Describe la herramienta adecuada (tabla de contingencia o dispersión/correlación) y qué esperaría observar.",
        "Reflexiona con claridad sobre por qué correlación no implica causalidad.",
      ],
    },
    a4: {
      titulo: "Verdadero o falso: relación entre variables",
      desc: "Pon a prueba lo que entendiste sobre independencia y correlación.",
      preguntas: [
        { e: "La relación entre dos variables cualitativas se analiza con una tabla de contingencia.", r: true, fb: "Correcto: cruza las categorías y permite comparar proporciones para ver si hay asociación." },
        { e: "Si dos variables cualitativas tienen las mismas proporciones en todos los grupos, se consideran independientes.", r: true, fb: "Correcto: si la distribución de una no cambia según la otra, no hay asociación: son independientes." },
        { e: "Un coeficiente de correlación cercano a +1 indica que al crecer una variable, la otra tiende a decrecer.", r: false, fb: "Falso: r cercano a +1 indica correlación POSITIVA (crecen juntas). El que decrezca al crecer la otra es r cercano a −1." },
        { e: "El coeficiente de correlación r toma valores entre −1 y +1.", r: true, fb: "Correcto: −1 (negativa perfecta), 0 (sin relación lineal) y +1 (positiva perfecta)." },
        { e: "Si dos variables están fuertemente correlacionadas, entonces una causa a la otra.", r: false, fb: "Falso: correlación NO implica causalidad; puede haber una tercera variable o una coincidencia (helado y ahogamientos suben por el calor)." },
        { e: "Un diagrama de dispersión sirve para visualizar la relación entre dos variables cuantitativas.", r: true, fb: "Correcto: cada caso es un punto (x,y) y la forma de la nube revela el tipo de relación." },
      ],
    },
    a5: {
      titulo: "Glosario: independencia y correlación",
      desc: "Términos clave para analizar la relación entre variables.",
      terminos: [
        { t: "Variable cualitativa", d: "Variable que expresa categorías, no números.", e: "Sexo, color favorito, deporte." },
        { t: "Variable cuantitativa", d: "Variable que toma valores numéricos.", e: "Horas de estudio, calificación, temperatura." },
        { t: "Tabla de contingencia", d: "Tabla de doble entrada que cruza las categorías de dos variables cualitativas y cuenta los casos.", e: "Sexo (filas) × deporte (columnas)." },
        { t: "Independencia", d: "Dos variables son independientes si la distribución de una no cambia según la otra.", e: "Mismas proporciones en todos los grupos." },
        { t: "Asociación", d: "Existe cuando las proporciones difieren entre grupos; las variables se relacionan.", e: "70% de hombres vs 30% de mujeres prefieren X." },
        { t: "Diagrama de dispersión", d: "Gráfica de puntos (x, y) para visualizar la relación entre dos variables cuantitativas.", e: "Horas de estudio vs calificación." },
        { t: "Correlación positiva", d: "Al crecer una variable, la otra tiende a crecer (nube ascendente, r > 0).", e: "Estudio y calificación." },
        { t: "Correlación negativa", d: "Al crecer una variable, la otra tiende a decrecer (nube descendente, r < 0).", e: "Horas de TV y calificación." },
        { t: "Coeficiente de correlación (r)", d: "Número entre −1 y +1 que mide fuerza y sentido de la relación lineal.", e: "r ≈ +0.9 relación positiva fuerte." },
        { t: "Correlación ≠ causalidad", d: "Una relación estadística no prueba que una variable cause la otra.", e: "Helado y ahogamientos suben por el calor." },
      ],
      final: "Para (horas de ejercicio, pulso en reposo) con r ≈ −0.8: (1) di si la correlación es positiva o negativa; (2) describe la nube de puntos; (3) explica por qué no puedes afirmar que el ejercicio CAUSA por sí solo ese pulso.",
    },
    a6: {
      titulo: "Completa: relación entre variables",
      desc: "Completa el texto con los términos correctos sobre independencia y correlación.",
      texto: "Las variables ___ expresan categorías y se analizan con una tabla de ___, comparando proporciones para ver si son ___ o están asociadas. Las variables ___ son numéricas y se grafican en un diagrama de ___. Si al crecer una crece la otra, la correlación es ___; si al crecer una decrece la otra, es ___. El coeficiente de correlación r va de ___ a +1. Una advertencia clave es que correlación no implica ___, porque puede existir una tercera ___ oculta.",
      huecos: [
        { c: "cualitativas", alt: ["categóricas", "categoricas"] },
        { c: "contingencia", alt: ["doble entrada"] },
        { c: "independientes", alt: ["independiente"] },
        { c: "cuantitativas", alt: ["numéricas", "numericas"] },
        { c: "dispersión", alt: ["dispersion"] },
        { c: "positiva", alt: ["directa"] },
        { c: "negativa", alt: ["inversa"] },
        { c: "−1", alt: ["-1", "menos 1"] },
        { c: "causalidad", alt: ["causa", "causación"] },
        { c: "variable", alt: ["variable oculta"] },
      ],
    },
    a7: {
      titulo: "¿Cómo voy con la relación entre variables?",
      desc: "Evalúa tu dominio del análisis de relación entre variables.",
      criterios: [
        "Distingo variables cualitativas de cuantitativas en un problema.",
        "Uso una tabla de contingencia para juzgar si dos variables cualitativas son independientes.",
        "Interpreto el signo y la fuerza del coeficiente de correlación en datos cuantitativos.",
        "Explico por qué correlación no implica causalidad.",
      ],
      reflexion: "¿Qué idea te costó más: la independencia en tablas de contingencia o que correlación no implica causalidad? ¿Cómo la aclararías con un ejemplo propio?",
    },
  },

  // ════════════════ CNEYT-III·O2 — Hidrósfera y atmósfera ════════════════
  {
    uac: "CNEYT-III", progCodigo: "CNEYT-III-P10", numero: 2,
    categoria: "Nuestro hogar. El sistema terrestre", subcategoria: "Hidrósfera y atmósfera",
    meta: META_CN3,
    O: "Aplica el conocimiento sobre los estados de agregación y clasificación de la materia; propiedades de los cuerpos y temperatura para explicar las capas, composición e interacción de la hidrósfera y atmósfera.",
    C: "Capas y composición química de la hidrósfera y la atmósfera Conceptos involucrados: aire, agua, densidad, presión, temperatura y compuestos químicos Ciclo biogeoquímico del agua Concepto de clima y tiempo atmosférico",
    descripcion: "Aplica los estados de agregación y las propiedades de la materia (densidad, presión, temperatura) para explicar la hidrósfera y la atmósfera: las capas y composición química del agua y del aire, el ciclo biogeoquímico del agua (evaporación, condensación, precipitación) y la diferencia entre clima y tiempo atmosférico. Conecta con fenómenos de México como el agua de la CDMX o los climas del país.",
    fuente: "MCCEMS 2025 — Ciencias Naturales, Experimentales y Tecnología III «Nuestro hogar. El sistema terrestre», contenido formativo: Capas y composición química de la hidrósfera y la atmósfera · Conceptos involucrados: aire, agua, densidad, presión, temperatura y compuestos químicos · Ciclo biogeoquímico del agua · Concepto de clima y tiempo atmosférico.",
    a1: {
      titulo: "Aire y agua: las capas y la química de la atmósfera y la hidrósfera",
      desc: "Lee cómo los estados de la materia, la densidad, la presión y la temperatura explican la atmósfera, la hidrósfera y el ciclo del agua.",
      minutos: 12,
      texto:
        "La Tierra es un sistema de esferas que interactúan. Dos de ellas, la ATMÓSFERA (el aire) y la HIDRÓSFERA (el agua), se explican muy bien aplicando lo que sabemos de los ESTADOS DE AGREGACIÓN de la materia (sólido, líquido, gas) y de sus propiedades: densidad, presión y temperatura. Entender su composición química y sus capas es clave para comprender el clima, el agua que bebemos y la vida en el planeta.\n\n" +
        "LA ATMÓSFERA: un océano de aire. La atmósfera es la capa de gases que rodea la Tierra. El AIRE es una mezcla: aproximadamente 78% de nitrógeno (N₂), 21% de oxígeno (O₂) y un 1% de otros gases (argón, dióxido de carbono CO₂, vapor de agua). Se organiza en CAPAS según su temperatura y altura: la TROPÓSFERA (donde vivimos y ocurre el clima, los primeros ~12 km), la ESTRATÓSFERA (con la capa de ozono que filtra la radiación ultravioleta), la MESÓSFERA, la TERMÓSFERA y la EXÓSFERA. La PRESIÓN ATMOSFÉRICA —el peso del aire— disminuye con la altura: por eso en la Ciudad de México (a 2240 m) el agua hierve a unos 92 °C en lugar de 100 °C, y por eso cuesta más respirar en la montaña.\n\n" +
        "DENSIDAD, PRESIÓN Y TEMPERATURA. Estas tres propiedades explican el comportamiento del aire y el agua. La DENSIDAD es la masa por unidad de volumen (densidad = masa/volumen): el aire caliente es menos denso y sube, lo que genera vientos y nubes. La PRESIÓN es la fuerza por unidad de área; en los gases aumenta con la temperatura y disminuye con la altura. La TEMPERATURA mide la energía del movimiento de las partículas. Juntas explican fenómenos cotidianos: por qué sube el humo, por qué se forman las nubes o por qué el agua del mar circula.\n\n" +
        "LA HIDRÓSFERA: toda el agua del planeta. La hidrósfera es el conjunto del agua terrestre en sus tres estados: líquida (océanos, ríos, lagos), sólida (glaciares, hielo polar) y gaseosa (vapor en el aire). El AGUA (H₂O) es un compuesto con propiedades únicas: gran capacidad para disolver (por eso el agua de mar contiene sales) y para almacenar calor (regula el clima). La mayor parte (~97%) es agua salada de los océanos; solo una pequeña fracción es agua dulce, y de ella casi toda está congelada, lo que vuelve crucial cuidar el agua disponible.\n\n" +
        "EL CICLO DEL AGUA. La atmósfera y la hidrósfera se conectan en el CICLO BIOGEOQUÍMICO DEL AGUA, un viaje continuo entre estados de agregación impulsado por el Sol: el agua se EVAPORA de océanos y lagos (líquido → gas), se CONDENSA en las nubes (gas → líquido), PRECIPITA como lluvia o nieve (líquido o sólido), y regresa por ríos e infiltración. Es un ejemplo perfecto de cambios de estado de la materia operando a escala planetaria.\n\n" +
        "CLIMA vs TIEMPO ATMOSFÉRICO. Conviene no confundir dos conceptos. El TIEMPO ATMOSFÉRICO es el estado de la atmósfera en un lugar y momento concretos (hoy está nublado y llueve). El CLIMA es el patrón promedio del tiempo en una región durante muchos años (el clima de Mérida es cálido y húmedo). México tiene una enorme variedad de climas —desérticos en el norte, templados en el centro, tropicales en el sur— precisamente por su relieve, latitud y la interacción entre la atmósfera y la hidrósfera. Aplicar las propiedades de la materia permite explicar todos estos fenómenos de nuestro hogar, el sistema terrestre.",
      preguntas: [
        { p: "¿Cuál es la composición aproximada del aire y cómo se organiza la atmósfera?", r: "El aire es ~78% nitrógeno (N₂), ~21% oxígeno (O₂) y ~1% de otros gases (argón, CO₂, vapor de agua). La atmósfera se organiza en capas: tropósfera (donde ocurre el clima), estratósfera (capa de ozono), mesósfera, termósfera y exósfera." },
        { p: "¿Cómo explican la densidad, la presión y la temperatura el comportamiento del aire?", r: "La densidad (masa/volumen) hace que el aire caliente, menos denso, suba y forme vientos y nubes; la presión (peso del aire) disminuye con la altura, por eso el agua hierve a menor temperatura en lugares altos; la temperatura mide la energía de las partículas y modifica densidad y presión." },
        { p: "¿En qué se diferencian el tiempo atmosférico y el clima?", r: "El tiempo atmosférico es el estado de la atmósfera en un lugar y momento concretos (hoy llueve); el clima es el patrón promedio del tiempo en una región durante muchos años (el clima cálido de Mérida)." },
      ],
    },
    a2: {
      titulo: "Densidad, presión y el ciclo del agua",
      desc: "Aplica las propiedades de la materia (densidad) y los cambios de estado para explicar la hidrósfera y la atmósfera.",
      instrucciones: "Usa la fórmula de densidad = masa/volumen y los conceptos de cambios de estado y presión.",
      problema:
        "a) DENSIDAD DEL AGUA. Una muestra de agua tiene una masa de 500 g y ocupa un volumen de 500 cm³. Calcula su densidad. (Fórmula: densidad = masa / volumen.)\n\n" +
        "b) ¿FLOTA O SE HUNDE? El hielo tiene una densidad de aproximadamente 0.92 g/cm³ y el agua líquida 1.0 g/cm³. ¿Por qué el hielo flota en el agua?\n\n" +
        "c) CICLO DEL AGUA. Nombra, en orden, los tres cambios de estado principales del ciclo del agua e indica qué transformación de la materia ocurre en cada uno (de qué estado a qué estado).\n\n" +
        "d) PRESIÓN Y ALTURA. En la Ciudad de México (2240 m) el agua hierve a ~92 °C y no a 100 °C. Explica por qué, usando el concepto de presión atmosférica.",
      contexto: "El ejercicio aplica el contenido formativo: densidad como propiedad de la materia, los estados de agregación en el ciclo biogeoquímico del agua y la presión atmosférica, con un caso real de la Ciudad de México.",
      pasos: [
        "a) densidad = masa/volumen = 500 g / 500 cm³ = 1.0 g/cm³ (la densidad típica del agua).",
        "b) El hielo (0.92 g/cm³) es MENOS denso que el agua líquida (1.0 g/cm³); como tiene menos masa por unidad de volumen, flota. (Es una propiedad inusual del agua: al congelarse se expande.)",
        "c) Evaporación: líquido → gas (el agua de océanos y lagos pasa a vapor). Condensación: gas → líquido (el vapor forma las gotas de las nubes). Precipitación: líquido o sólido cae como lluvia o nieve.",
        "d) A mayor altura hay menos aire encima, así que la presión atmosférica es menor. El agua hierve cuando su presión de vapor iguala a la presión externa; si esta es menor (como en la CDMX), hierve a menor temperatura (~92 °C).",
      ],
      final: "a) 1.0 g/cm³. b) El hielo flota por ser menos denso (0.92 < 1.0 g/cm³). c) Evaporación (líq→gas), condensación (gas→líq), precipitación (cae líq/sólido). d) Menor presión atmosférica en altura ⇒ el agua hierve a menor temperatura (~92 °C).",
      unidades: "densidad en g/cm³; temperatura en °C",
    },
    a3: {
      titulo: "El agua y el aire en tu localidad",
      desc: "Reflexiona sobre un fenómeno de la atmósfera o la hidrósfera de tu región y explícalo con las propiedades de la materia.",
      prompt: "Observa un fenómeno de la atmósfera o la hidrósfera de tu localidad —la lluvia o las nubes, la neblina, el rocío de la mañana, un río o presa, el agua que llega a tu casa, el clima de tu región o por qué hierve distinto el agua según la altura— y explícalo aplicando lo que aprendiste. Usa al menos dos conceptos (estados de agregación, densidad, presión, temperatura, ciclo del agua) y distingue si describes el tiempo atmosférico o el clima. Reflexiona sobre por qué cuidar el agua y el aire es importante para tu comunidad.",
      pistas: [
        "Estados del agua: líquido (ríos), sólido (hielo/nieve), gas (vapor/nubes).",
        "Densidad = masa/volumen; el aire o el agua caliente, menos densos, suben.",
        "Ciclo del agua: evaporación → condensación → precipitación.",
        "Tiempo = estado de la atmósfera hoy; clima = patrón promedio de muchos años.",
      ],
      criterios: [
        "Describe un fenómeno real de la atmósfera o la hidrósfera de su entorno.",
        "Lo explica aplicando al menos dos propiedades/conceptos de la materia.",
        "Distingue tiempo de clima y reflexiona sobre el cuidado del agua y el aire.",
      ],
    },
    a4: {
      titulo: "Verdadero o falso: atmósfera, hidrósfera y ciclo del agua",
      desc: "Pon a prueba lo que entendiste sobre el aire, el agua y las propiedades de la materia.",
      preguntas: [
        { e: "El aire está compuesto en su mayoría por nitrógeno (~78%) y oxígeno (~21%).", r: true, fb: "Correcto: el N₂ es el gas más abundante, seguido del O₂, y el ~1% restante son otros gases." },
        { e: "La presión atmosférica aumenta a medida que subimos a mayor altura.", r: false, fb: "Falso: la presión DISMINUYE con la altura, porque hay menos aire encima; por eso el agua hierve a menor temperatura en lugares altos." },
        { e: "La densidad se calcula como masa dividida entre volumen.", r: true, fb: "Correcto: densidad = masa/volumen; el agua tiene ~1.0 g/cm³." },
        { e: "En el ciclo del agua, la evaporación es el paso de líquido a gas.", r: true, fb: "Correcto: el agua líquida se transforma en vapor; luego se condensa (gas→líquido) y precipita." },
        { e: "El clima y el tiempo atmosférico son exactamente lo mismo.", r: false, fb: "Falso: el tiempo es el estado de la atmósfera aquí y ahora; el clima es el patrón promedio de muchos años en una región." },
        { e: "El hielo flota en el agua porque es menos denso que el agua líquida.", r: true, fb: "Correcto: el hielo (~0.92 g/cm³) es menos denso que el agua (~1.0 g/cm³), por eso flota." },
      ],
    },
    a5: {
      titulo: "Glosario: atmósfera, hidrósfera y propiedades de la materia",
      desc: "Términos clave para explicar el aire y el agua.",
      terminos: [
        { t: "Atmósfera", d: "Capa de gases que rodea la Tierra; el aire.", e: "Sus capas: tropósfera, estratósfera, mesósfera, termósfera, exósfera." },
        { t: "Hidrósfera", d: "Conjunto del agua del planeta en estado sólido, líquido y gaseoso.", e: "Océanos, glaciares y vapor atmosférico." },
        { t: "Aire", d: "Mezcla de gases: ~78% N₂, ~21% O₂ y ~1% otros.", e: "Incluye argón, CO₂ y vapor de agua." },
        { t: "Densidad", d: "Masa por unidad de volumen (masa/volumen).", e: "Agua ≈ 1.0 g/cm³; hielo ≈ 0.92 g/cm³." },
        { t: "Presión atmosférica", d: "Peso del aire por unidad de área; disminuye con la altura.", e: "En la CDMX el agua hierve a ~92 °C." },
        { t: "Temperatura", d: "Medida de la energía del movimiento de las partículas.", e: "El aire caliente es menos denso y sube." },
        { t: "Estados de agregación", d: "Formas de la materia: sólido, líquido y gas.", e: "El agua aparece en los tres en la naturaleza." },
        { t: "Ciclo del agua", d: "Movimiento continuo del agua por cambios de estado: evaporación, condensación y precipitación.", e: "Impulsado por la energía del Sol." },
        { t: "Tiempo atmosférico", d: "Estado de la atmósfera en un lugar y momento concretos.", e: "Hoy está nublado y llueve." },
        { t: "Clima", d: "Patrón promedio del tiempo en una región durante muchos años.", e: "El clima cálido-húmedo del sureste de México." },
      ],
      final: "Para una muestra de 250 g de agua que ocupa 250 cm³: (1) calcula su densidad; (2) di en qué se diferencia del hielo; (3) ordena los tres pasos del ciclo del agua indicando el cambio de estado de cada uno.",
    },
    a6: {
      titulo: "Completa: el aire, el agua y sus propiedades",
      desc: "Completa el texto con los términos correctos sobre la atmósfera y la hidrósfera.",
      texto: "La ___ es la capa de gases que rodea la Tierra; el aire es ~78% de ___ y ~21% de oxígeno. La ___ es toda el agua del planeta en sus tres estados. La ___ es la masa por unidad de volumen, y la presión atmosférica ___ con la altura. En el ciclo del agua, el agua se ___ (líquido a gas), se condensa (gas a líquido) y ___ como lluvia o nieve. El ___ atmosférico es el estado de la atmósfera ahora, mientras que el ___ es el patrón promedio de muchos años. El hielo flota porque es menos ___ que el agua líquida.",
      huecos: [
        { c: "atmósfera", alt: ["atmosfera", "la atmósfera"] },
        { c: "nitrógeno", alt: ["nitrogeno", "N₂", "N2"] },
        { c: "hidrósfera", alt: ["hidrosfera", "la hidrósfera"] },
        { c: "densidad", alt: ["la densidad"] },
        { c: "disminuye", alt: ["baja", "decrece"] },
        { c: "evapora", alt: ["evaporación", "evaporiza"] },
        { c: "precipita", alt: ["precipitación", "cae"] },
        { c: "tiempo", alt: ["tiempo atmosférico"] },
        { c: "clima", alt: ["el clima"] },
        { c: "denso", alt: ["densa", "denso que"] },
      ],
    },
    a7: {
      titulo: "¿Cómo voy con la atmósfera y la hidrósfera?",
      desc: "Evalúa tu dominio de los conceptos del aire y el agua.",
      criterios: [
        "Describo la composición y las capas de la atmósfera y de la hidrósfera.",
        "Aplico densidad, presión y temperatura para explicar fenómenos del aire y el agua.",
        "Explico el ciclo del agua como una secuencia de cambios de estado.",
        "Distingo el tiempo atmosférico del clima.",
      ],
      reflexion: "¿Qué concepto te costó más (densidad, presión con la altura o el ciclo del agua) y cómo lo aclararías con un fenómeno de tu localidad?",
    },
  },

  // ════════════════ CNEYT-III·O5 — Oxígeno y atmósfera primitiva ════════════════
  {
    uac: "CNEYT-III", progCodigo: "CNEYT-III-P11", numero: 5,
    categoria: "Nuestro hogar. El sistema terrestre", subcategoria: "Oxígeno y atmósfera primitiva",
    meta: META_CN3,
    O: "Comprende la importancia del oxígeno para la vida en la Tierra, a partir del análisis del proceso de oxigenación de la atmósfera primitiva y la intervención de los organismos fotosintéticos.",
    C: "Composición química de la atmósfera reductora según Oparin-Haldane y las diferencias con la atmósfera actual Ciclo biogeoquímico del oxígeno Formación de óxidos básicos y ácidos",
    descripcion: "Explica de dónde salió el oxígeno que respiramos: la atmósfera primitiva era REDUCTORA (sin O₂ libre, con metano, amoniaco, vapor de agua y CO₂, según Oparin-Haldane), y se oxigenó gracias a los organismos fotosintéticos (cianobacterias) en la Gran Oxidación. Analiza el ciclo biogeoquímico del oxígeno y la formación de óxidos básicos (metal + O₂) y ácidos (no metal + O₂), conectando con la lluvia ácida.",
    fuente: "MCCEMS 2025 — Ciencias Naturales, Experimentales y Tecnología III «Nuestro hogar. El sistema terrestre», contenido formativo: Composición química de la atmósfera reductora según Oparin-Haldane y las diferencias con la atmósfera actual · Ciclo biogeoquímico del oxígeno · Formación de óxidos básicos y ácidos.",
    a1: {
      titulo: "El oxígeno que respiramos: de la atmósfera primitiva a la actual",
      desc: "Lee cómo la atmósfera pasó de reductora a oxigenada gracias a la fotosíntesis, y cómo se forman los óxidos.",
      minutos: 12,
      texto:
        "El oxígeno (O₂) que respiramos es tan común que parece que siempre estuvo ahí, pero no es así: durante miles de millones de años la Tierra casi no tuvo oxígeno libre en el aire. Entender de dónde salió —y por qué es vital— es comprender una de las grandes transformaciones químicas de nuestro planeta.\n\n" +
        "LA ATMÓSFERA PRIMITIVA: REDUCTORA. Según la hipótesis de OPARIN-HALDANE, la atmósfera de la Tierra primitiva era muy distinta de la actual: era una atmósfera REDUCTORA, es decir, sin oxígeno libre (O₂) y rica en gases como metano (CH₄), amoniaco (NH₃), vapor de agua (H₂O) e hidrógeno (H₂), además de dióxido de carbono (CO₂). «Reductora» significa que predominaban sustancias capaces de ceder electrones (lo contrario de «oxidante»). En ese ambiente sin oxígeno no podrían vivir los organismos que respiran aire como nosotros, pero sí surgieron las primeras formas de vida.\n\n" +
        "LA GRAN OXIDACIÓN: el papel de la fotosíntesis. El cambio llegó con la aparición de organismos FOTOSINTÉTICOS, sobre todo las CIANOBACTERIAS, hace unos 2400 millones de años. La FOTOSÍNTESIS toma dióxido de carbono y agua y, con la energía del Sol, produce materia orgánica liberando OXÍGENO como subproducto: 6 CO₂ + 6 H₂O → C₆H₁₂O₆ + 6 O₂. Durante cientos de millones de años, esas bacterias fueron llenando de O₂ los océanos y luego la atmósfera, en lo que se conoce como la GRAN OXIDACIÓN. Así, la atmósfera reductora se transformó en la atmósfera OXIDANTE actual (~21% de O₂). La diferencia es enorme: la vida que respira oxígeno, incluidos nosotros, solo fue posible gracias a esos organismos fotosintéticos.\n\n" +
        "EL CICLO DEL OXÍGENO. El oxígeno no se queda quieto: circula en el CICLO BIOGEOQUÍMICO DEL OXÍGENO. Los organismos fotosintéticos (plantas, algas, cianobacterias) PRODUCEN O₂; los seres vivos (incluidas las plantas de noche) lo CONSUMEN en la respiración, devolviendo CO₂; y este CO₂ vuelve a la fotosíntesis. Además, el oxígeno participa en la combustión y en la oxidación de minerales. La capa de OZONO (O₃) de la estratósfera, formada a partir de O₂, protege a la vida de la radiación ultravioleta. El ciclo del oxígeno y el del carbono están entrelazados y mantienen el equilibrio de la atmósfera.\n\n" +
        "ÓXIDOS BÁSICOS Y ÁCIDOS. El oxígeno es muy reactivo y forma ÓXIDOS al combinarse con otros elementos. Hay dos grandes tipos. Los ÓXIDOS BÁSICOS se forman cuando el oxígeno reacciona con un METAL (por ejemplo, 2 Mg + O₂ → 2 MgO, óxido de magnesio; o la herrumbre del hierro); al disolverse en agua dan bases (hidróxidos). Los ÓXIDOS ÁCIDOS se forman cuando el oxígeno reacciona con un NO METAL (por ejemplo, S + O₂ → SO₂, dióxido de azufre; o C + O₂ → CO₂); al disolverse en agua dan ácidos. Estos óxidos ácidos son la causa de la LLUVIA ÁCIDA: los óxidos de azufre y nitrógeno que emiten autos e industrias se combinan con el agua de la atmósfera y forman ácidos que dañan bosques, lagos y edificios. Comprender la química del oxígeno —su origen, su ciclo y sus óxidos— explica tanto la historia de la vida en la Tierra como problemas ambientales actuales de México y el mundo.",
      preguntas: [
        { p: "¿Cómo era la atmósfera primitiva según Oparin-Haldane y en qué se diferencia de la actual?", r: "Era una atmósfera reductora, sin oxígeno libre (O₂), rica en metano (CH₄), amoniaco (NH₃), vapor de agua y CO₂. La actual es oxidante, con ~21% de O₂. La diferencia clave es la presencia de oxígeno libre, ausente al principio." },
        { p: "¿Qué organismos oxigenaron la atmósfera y mediante qué proceso?", r: "Los organismos fotosintéticos, sobre todo las cianobacterias, mediante la fotosíntesis (6 CO₂ + 6 H₂O → C₆H₁₂O₆ + 6 O₂), que libera O₂. A lo largo de cientos de millones de años produjeron la Gran Oxidación." },
        { p: "¿Qué diferencia a un óxido básico de un óxido ácido?", r: "Un óxido básico se forma cuando el oxígeno reacciona con un metal (p. ej. 2 Mg + O₂ → 2 MgO) y al disolverse da bases; un óxido ácido se forma con un no metal (p. ej. S + O₂ → SO₂) y al disolverse da ácidos, causa de la lluvia ácida." },
      ],
    },
    a2: {
      titulo: "Óxidos y oxígeno: clasifica y balancea",
      desc: "Identifica la atmósfera reductora, clasifica óxidos en básicos y ácidos y comprueba la conservación de la materia.",
      instrucciones: "Analiza cada reacción, clasifica el óxido (metal→básico, no metal→ácido) y cuenta átomos para verificar el balance.",
      problema:
        "a) ATMÓSFERA PRIMITIVA. Menciona dos gases de la atmósfera reductora primitiva (Oparin-Haldane) y di qué gas, ausente entonces, abunda hoy (~21%).\n\n" +
        "b) ÓXIDO BÁSICO. Clasifica y completa: 2 Mg + O₂ → 2 MgO. ¿Es básico o ácido? ¿Por qué? Verifica que esté balanceada contando los átomos de Mg y O.\n\n" +
        "c) ÓXIDO ÁCIDO. Clasifica: S + O₂ → SO₂. ¿Es básico o ácido? ¿Por qué? ¿Con qué problema ambiental se relaciona?\n\n" +
        "d) FOTOSÍNTESIS. En la ecuación 6 CO₂ + 6 H₂O → C₆H₁₂O₆ + 6 O₂, ¿cuántas moléculas de O₂ se liberan por cada molécula de glucosa? ¿Por qué fue clave para oxigenar la atmósfera?",
      contexto: "El ejercicio aplica el contenido formativo: composición de la atmósfera reductora vs actual, formación de óxidos básicos (metal + O₂) y ácidos (no metal + O₂) y el papel de la fotosíntesis en el ciclo del oxígeno, con la conexión a la lluvia ácida.",
      pasos: [
        "a) Atmósfera reductora: metano (CH₄), amoniaco (NH₃), vapor de agua (H₂O), CO₂, H₂ (cualquier par). El gas ausente entonces y abundante hoy es el OXÍGENO (O₂, ~21%).",
        "b) ÓXIDO BÁSICO, porque el oxígeno reacciona con un METAL (magnesio). Balance: Mg 2=2; O: izquierda 2 (de O₂), derecha 2 (de 2 MgO). Está balanceada y cumple la conservación de la materia.",
        "c) ÓXIDO ÁCIDO, porque el oxígeno reacciona con un NO METAL (azufre). El SO₂ (y otros óxidos de azufre y nitrógeno) se relaciona con la LLUVIA ÁCIDA al disolverse en el agua de la atmósfera.",
        "d) Por cada molécula de glucosa (C₆H₁₂O₆) se liberan 6 moléculas de O₂. Fue clave porque, repetida durante cientos de millones de años por las cianobacterias, llenó de oxígeno los océanos y la atmósfera (Gran Oxidación).",
      ],
      final: "a) Reductora: CH₄, NH₃, H₂O, CO₂ (dos cualesquiera); hoy abunda el O₂ (~21%). b) Básico (metal Mg); balanceada (Mg 2=2, O 2=2). c) Ácido (no metal S); ligado a la lluvia ácida. d) 6 O₂ por glucosa; oxigenó la atmósfera durante la Gran Oxidación.",
      unidades: "átomos por elemento; moléculas",
    },
    a3: {
      titulo: "El oxígeno y los óxidos en tu entorno",
      desc: "Reflexiona sobre la importancia del oxígeno y un fenómeno de oxidación que observes en tu entorno.",
      prompt: "Reflexiona sobre la importancia del oxígeno para la vida y conéctalo con algo que observes en tu entorno: una reja o un clavo oxidados (herrumbre, un óxido básico), el humo o los gases de los autos (óxidos ácidos, lluvia ácida), una planta que produce oxígeno, o una fogata o vela que lo consume. Explica de dónde vino el oxígeno de la atmósfera (de reductora a oxigenada gracias a los organismos fotosintéticos), describe el fenómeno de oxidación que elegiste indicando si forma un óxido básico (con metal) o ácido (con no metal), y reflexiona sobre por qué cuidar los bosques y reducir las emisiones es importante para el equilibrio del oxígeno.",
      pistas: [
        "Atmósfera primitiva: reductora (sin O₂), con CH₄, NH₃, H₂O, CO₂; hoy oxidante (~21% O₂).",
        "La fotosíntesis libera O₂: 6 CO₂ + 6 H₂O → C₆H₁₂O₆ + 6 O₂.",
        "Óxido básico = oxígeno + metal (herrumbre, MgO). Óxido ácido = oxígeno + no metal (SO₂, CO₂).",
        "La lluvia ácida proviene de óxidos ácidos (azufre, nitrógeno) disueltos en el agua de la atmósfera.",
      ],
      criterios: [
        "Explica el origen del oxígeno atmosférico (de reductora a oxigenada por la fotosíntesis).",
        "Describe un fenómeno de oxidación real y lo clasifica como óxido básico o ácido.",
        "Reflexiona sobre la importancia del oxígeno y el cuidado del equilibrio ambiental.",
      ],
    },
    a4: {
      titulo: "Verdadero o falso: oxígeno, atmósfera primitiva y óxidos",
      desc: "Pon a prueba lo que entendiste sobre la oxigenación de la atmósfera y los óxidos.",
      preguntas: [
        { e: "Según Oparin-Haldane, la atmósfera primitiva era reductora y carecía de oxígeno libre.", r: true, fb: "Correcto: era rica en CH₄, NH₃, vapor de agua y CO₂, pero sin O₂ libre." },
        { e: "El oxígeno de la atmósfera actual fue producido principalmente por organismos fotosintéticos como las cianobacterias.", r: true, fb: "Correcto: la fotosíntesis liberó O₂ durante cientos de millones de años (la Gran Oxidación)." },
        { e: "Un óxido básico se forma cuando el oxígeno reacciona con un no metal.", r: false, fb: "Falso: los óxidos BÁSICOS se forman con METALES (2 Mg + O₂ → 2 MgO). Con no metales se forman óxidos ÁCIDOS." },
        { e: "La fotosíntesis se resume en 6 CO₂ + 6 H₂O → C₆H₁₂O₆ + 6 O₂.", r: true, fb: "Correcto: produce glucosa y libera 6 moléculas de O₂ por cada glucosa." },
        { e: "Los óxidos ácidos como el SO₂ se relacionan con la formación de la lluvia ácida.", r: true, fb: "Correcto: al disolverse en el agua de la atmósfera forman ácidos que dañan bosques, lagos y edificios." },
        { e: "La atmósfera actual y la primitiva tienen la misma composición química.", r: false, fb: "Falso: la primitiva era reductora (sin O₂); la actual es oxidante, con ~21% de oxígeno." },
      ],
    },
    a5: {
      titulo: "Glosario: oxígeno, atmósfera y óxidos",
      desc: "Términos clave sobre la oxigenación de la Tierra y los óxidos.",
      terminos: [
        { t: "Atmósfera reductora", d: "Atmósfera sin oxígeno libre, rica en gases que ceden electrones (CH₄, NH₃, H₂).", e: "La Tierra primitiva según Oparin-Haldane." },
        { t: "Hipótesis de Oparin-Haldane", d: "Propuesta de que la vida surgió en una atmósfera primitiva reductora.", e: "Base del experimento de Miller-Urey." },
        { t: "Organismos fotosintéticos", d: "Seres que producen materia orgánica y liberan O₂ usando la luz.", e: "Cianobacterias, algas y plantas." },
        { t: "Gran Oxidación", d: "Periodo en que la fotosíntesis llenó de O₂ océanos y atmósfera.", e: "Hace ~2400 millones de años." },
        { t: "Ciclo del oxígeno", d: "Circulación del O₂: producido en la fotosíntesis y consumido en la respiración.", e: "Entrelazado con el ciclo del carbono." },
        { t: "Óxido", d: "Compuesto de oxígeno con otro elemento.", e: "MgO, SO₂, CO₂, herrumbre." },
        { t: "Óxido básico", d: "Óxido de un metal con el oxígeno; al disolverse da bases.", e: "2 Mg + O₂ → 2 MgO." },
        { t: "Óxido ácido", d: "Óxido de un no metal con el oxígeno; al disolverse da ácidos.", e: "S + O₂ → SO₂." },
        { t: "Lluvia ácida", d: "Lluvia con ácidos formados por óxidos de azufre y nitrógeno disueltos.", e: "Daña bosques, lagos y monumentos." },
        { t: "Capa de ozono (O₃)", d: "Capa de la estratósfera que filtra la radiación ultravioleta.", e: "Se forma a partir del O₂." },
      ],
      final: "Clasifica como óxido básico o ácido y di con qué se relaciona: (1) 4 Fe + 3 O₂ → 2 Fe₂O₃ (herrumbre); (2) C + O₂ → CO₂; (3) explica por qué sin organismos fotosintéticos no respiraríamos.",
    },
    a6: {
      titulo: "Completa: el origen y la química del oxígeno",
      desc: "Completa el texto con los términos correctos sobre la atmósfera y los óxidos.",
      texto: "Según Oparin-Haldane, la atmósfera primitiva era ___, sin oxígeno libre y rica en metano y ___. El oxígeno actual fue producido por organismos ___, como las ___, mediante la ___, en un proceso llamado la Gran ___. El oxígeno circula en su ciclo: lo producen las plantas y lo consume la ___. Cuando el oxígeno reacciona con un metal forma un óxido ___, y cuando reacciona con un no metal forma un óxido ___, causa de la lluvia ___.",
      huecos: [
        { c: "reductora", alt: ["reductiva"] },
        { c: "amoniaco", alt: ["amoníaco", "NH₃", "NH3"] },
        { c: "fotosintéticos", alt: ["fotosinteticos"] },
        { c: "cianobacterias", alt: ["cianobacteria"] },
        { c: "fotosíntesis", alt: ["fotosintesis", "la fotosíntesis"] },
        { c: "Oxidación", alt: ["oxidación", "oxidacion"] },
        { c: "respiración", alt: ["respiracion", "la respiración"] },
        { c: "básico", alt: ["basico"] },
        { c: "ácido", alt: ["acido"] },
        { c: "ácida", alt: ["acida"] },
      ],
    },
    a7: {
      titulo: "¿Cómo voy con el oxígeno y la atmósfera?",
      desc: "Evalúa tu dominio de la oxigenación de la Tierra y los óxidos.",
      criterios: [
        "Describo la atmósfera primitiva reductora y la diferencio de la actual.",
        "Explico cómo los organismos fotosintéticos oxigenaron la atmósfera.",
        "Describo el ciclo del oxígeno (producción y consumo).",
        "Clasifico óxidos en básicos (metal) y ácidos (no metal) y los relaciono con la lluvia ácida.",
      ],
      reflexion: "¿Qué te resultó más sorprendente: que la atmósfera no tuviera oxígeno al principio o que la lluvia ácida venga de óxidos? ¿Cómo lo explicarías a alguien más?",
    },
  },

  // ════════════════ CNEYT-VI·O2 — Descubrimiento de la célula y teoría celular ════════════════
  {
    uac: "CNEYT-VI", progCodigo: "CNEYT-VI-P10", numero: 2,
    categoria: "¿Qué es la vida? Evolución y diversidad biológica", subcategoria: "Descubrimiento de la célula y teoría celular",
    meta: META_CN6,
    O: "Analiza los procesos históricos que llevaron al descubrimiento de la célula y el desarrollo de la teoría celular como unidad fundamental de los organismos vivos.",
    C: "Procesos históricos que llevaron al descubrimiento de la célula Teoría celular",
    descripcion: "Recorre la historia del descubrimiento de la célula: la invención del microscopio, Robert Hooke (1665) que observó las «celdas» del corcho y acuñó la palabra célula, Anton van Leeuwenhoek y sus «animáculos», y la consolidación de la TEORÍA CELULAR por Schleiden, Schwann y Virchow en el siglo XIX. Explica sus tres postulados —la célula como unidad estructural, funcional y de origen de todos los seres vivos— y la importancia de la tecnología (el microscopio) en el avance de la ciencia.",
    fuente: "MCCEMS 2025 — Ciencias Naturales, Experimentales y Tecnología VI «¿Qué es la vida? Evolución y diversidad biológica», contenido formativo: Procesos históricos que llevaron al descubrimiento de la célula · Teoría celular.",
    a1: {
      titulo: "El descubrimiento de la célula y el nacimiento de la teoría celular",
      desc: "Lee cómo el microscopio reveló la célula y cómo Schleiden, Schwann y Virchow formularon la teoría celular.",
      minutos: 11,
      texto:
        "Hoy sabemos que todos los seres vivos estamos hechos de CÉLULAS, pero ese conocimiento es relativamente reciente y dependió por completo de la TECNOLOGÍA: sin el microscopio, la célula habría sido invisible para siempre. La historia de su descubrimiento muestra cómo la ciencia avanza cuando se combinan la curiosidad, la observación y las herramientas adecuadas.\n\n" +
        "EL MICROSCOPIO ABRE UN MUNDO. A finales del siglo XVI y durante el XVII, la invención y mejora del MICROSCOPIO permitió ver lo que ningún ojo había visto. En 1665, el inglés ROBERT HOOKE observó con su microscopio una fina lámina de corcho y vio que estaba formada por pequeñas cavidades, como las celdas de un panal; las llamó «cells» (celdas o CÉLULAS). En realidad veía las paredes de células vegetales muertas, pero acuñó la palabra que usamos hasta hoy. Poco después, el holandés ANTON VAN LEEUWENHOEK, puliendo lentes de gran calidad, fue el primero en observar organismos vivos microscópicos —bacterias, protozoos, espermatozoides—, a los que llamó «animáculos». Por primera vez la humanidad veía la vida a escala microscópica.\n\n" +
        "EL CAMINO HACIA UNA TEORÍA. Durante casi dos siglos se acumularon observaciones de células en plantas y animales, pero faltaba una idea que las unificara. Eso llegó en el siglo XIX, gracias a la mejora de los microscopios y al trabajo de varios científicos. En 1838, el botánico MATTHIAS SCHLEIDEN concluyó que todas las PLANTAS están formadas por células. En 1839, el zoólogo THEODOR SCHWANN extendió la idea a los ANIMALES: también están hechos de células. Juntos propusieron que la célula es la unidad básica de todos los seres vivos. Faltaba una pieza: ¿de dónde salen las células nuevas? En 1855, el médico RUDOLF VIRCHOW respondió con su célebre frase «omnis cellula e cellula» («toda célula proviene de otra célula»), descartando la idea de generación espontánea a nivel celular.\n\n" +
        "LA TEORÍA CELULAR Y SUS POSTULADOS. La unión de estas aportaciones dio lugar a la TEORÍA CELULAR, uno de los pilares de la biología, que se resume en tres postulados: (1) todos los seres vivos están formados por una o más células —la célula es la unidad ESTRUCTURAL de la vida—; (2) la célula es la unidad FUNCIONAL, es decir, la unidad más pequeña capaz de realizar las funciones vitales; y (3) toda célula proviene de otra célula preexistente —la célula es la unidad de ORIGEN o reproducción—. Estos tres postulados explican por qué la célula es la «unidad fundamental» de los organismos vivos.\n\n" +
        "POR QUÉ IMPORTA. La teoría celular cambió para siempre nuestra comprensión de la vida: unificó a todos los seres vivos bajo una misma base, desde una bacteria hasta una ballena o un ser humano (que tiene unos 37 billones de células). Además, es el ejemplo perfecto de cómo el desarrollo tecnológico (el microscopio, y más tarde el microscopio electrónico) impulsa el avance científico. Hoy, esa misma lógica sigue viva en México y el mundo: la microscopía y la biología celular son la base de la medicina, la biotecnología y la investigación en salud. Comprender cómo se descubrió la célula es comprender cómo se construye el conocimiento científico.",
      preguntas: [
        { p: "¿Qué aportaron Robert Hooke y Anton van Leeuwenhoek al descubrimiento de la célula?", r: "Hooke (1665) observó las celdas del corcho con su microscopio y acuñó la palabra «célula»; van Leeuwenhoek, con lentes de gran calidad, fue el primero en observar organismos vivos microscópicos (bacterias, protozoos), sus «animáculos»." },
        { p: "¿Quiénes formularon la teoría celular y qué aportó cada uno?", r: "Schleiden (1838) concluyó que las plantas están hechas de células; Schwann (1839) extendió la idea a los animales; y Virchow (1855) añadió que toda célula proviene de otra célula («omnis cellula e cellula»)." },
        { p: "¿Cuáles son los tres postulados de la teoría celular?", r: "(1) Todos los seres vivos están formados por células (unidad estructural); (2) la célula es la unidad funcional, capaz de realizar las funciones vitales; (3) toda célula proviene de otra célula preexistente (unidad de origen)." },
      ],
    },
    a2: {
      titulo: "La escala de la célula y la cronología del descubrimiento",
      desc: "Aplica nociones de escala y orden cronológico para dimensionar la célula y situar los hitos de su descubrimiento.",
      instrucciones: "Usa conversiones de unidades para la escala y ordena cronológicamente los aportes.",
      problema:
        "a) ESCALA. Una célula animal típica mide alrededor de 20 micrómetros (µm). Sabiendo que 1 mm = 1000 µm, ¿cuántas células de 20 µm cabrían, en fila, en 1 mm?\n\n" +
        "b) ¿POR QUÉ EL MICROSCOPIO? El ojo humano distingue objetos de aproximadamente 0.1 mm (100 µm) como mínimo. Explica, comparando con el tamaño de la célula (20 µm), por qué fue indispensable el microscopio para descubrir la célula.\n\n" +
        "c) CRONOLOGÍA. Ordena de más antiguo a más reciente estos hitos: Schwann extiende la teoría a los animales (1839); Hooke observa las celdas del corcho (1665); Virchow afirma que toda célula viene de otra (1855); Schleiden concluye que las plantas son células (1838).\n\n" +
        "d) POSTULADOS. Asocia cada postulado de la teoría celular con la palabra clave: unidad estructural, unidad funcional, unidad de origen.",
      contexto: "El ejercicio aplica nociones de escala (micrómetros) para dimensionar la célula y la cronología histórica que llevó a la teoría celular, mostrando el papel del microscopio como tecnología que impulsó el descubrimiento.",
      pasos: [
        "a) 1 mm = 1000 µm. Número de células = 1000 µm ÷ 20 µm = 50 células en fila en 1 mm.",
        "b) La célula (20 µm) es unas 5 veces más pequeña que el mínimo que ve el ojo (100 µm = 0.1 mm). Como está por debajo del límite de resolución del ojo, era invisible sin un instrumento que aumentara la imagen: por eso el microscopio fue indispensable.",
        "c) Orden cronológico: 1665 Hooke (celdas del corcho) → 1838 Schleiden (plantas) → 1839 Schwann (animales) → 1855 Virchow (toda célula de otra célula).",
        "d) Unidad estructural: todos los seres vivos están formados por células. Unidad funcional: la célula realiza las funciones vitales. Unidad de origen: toda célula proviene de otra célula.",
      ],
      final: "a) 50 células. b) La célula (20 µm) es menor que el límite del ojo (100 µm), así que se necesitó el microscopio. c) Hooke (1665) → Schleiden (1838) → Schwann (1839) → Virchow (1855). d) Estructural = formados por células; funcional = realiza funciones vitales; origen = toda célula de otra célula.",
      unidades: "micrómetros (µm) y milímetros (mm); años",
    },
    a3: {
      titulo: "La tecnología que hace ver lo invisible",
      desc: "Reflexiona sobre cómo una tecnología permite descubrir lo que no se ve y sobre la importancia de la teoría celular.",
      prompt: "La célula no pudo descubrirse hasta que existió el microscopio. Reflexiona sobre cómo el desarrollo de una TECNOLOGÍA permite a la ciencia «ver lo invisible» y avanzar. Explica con tus palabras cómo se descubrió la célula (microscopio, Hooke, van Leeuwenhoek) y cómo nació la teoría celular (Schleiden, Schwann, Virchow) con sus tres postulados. Luego conéctalo con el presente: menciona otra tecnología actual (microscopio electrónico, telescopio, ecografía, etc.) que haya ampliado lo que la ciencia puede observar, y reflexiona sobre por qué entender que todos los seres vivos compartimos la misma unidad —la célula— es importante para la biología y la medicina.",
      pistas: [
        "Hooke (1665): celdas del corcho, acuñó «célula». Van Leeuwenhoek: primeros microorganismos vivos.",
        "Teoría celular: Schleiden (plantas, 1838), Schwann (animales, 1839), Virchow (toda célula de otra, 1855).",
        "Tres postulados: unidad estructural, funcional y de origen.",
        "La tecnología (microscopio) impulsa el avance científico: hace observable lo invisible.",
      ],
      criterios: [
        "Explica el papel del microscopio y los aportes de Hooke y van Leeuwenhoek.",
        "Describe la teoría celular y sus tres postulados con sus autores.",
        "Conecta con una tecnología actual y reflexiona sobre la importancia de la célula como unidad común.",
      ],
    },
    a4: {
      titulo: "Verdadero o falso: descubrimiento de la célula y teoría celular",
      desc: "Pon a prueba lo que entendiste sobre la historia de la célula y la teoría celular.",
      preguntas: [
        { e: "Robert Hooke acuñó la palabra «célula» al observar el corcho con un microscopio en 1665.", r: true, fb: "Correcto: vio cavidades como celdas de panal y las llamó «cells» (células)." },
        { e: "Anton van Leeuwenhoek fue el primero en observar microorganismos vivos (sus «animáculos»).", r: true, fb: "Correcto: con lentes de gran calidad vio bacterias y protozoos por primera vez." },
        { e: "La teoría celular fue formulada por un solo científico de forma instantánea.", r: false, fb: "Falso: fue un proceso histórico con aportes de Schleiden (plantas), Schwann (animales) y Virchow (toda célula de otra célula), entre otros." },
        { e: "Uno de los postulados de la teoría celular es que toda célula proviene de otra célula preexistente.", r: true, fb: "Correcto: es la frase de Virchow «omnis cellula e cellula» (unidad de origen)." },
        { e: "La célula es la unidad estructural y funcional de los seres vivos.", r: true, fb: "Correcto: es la unidad más pequeña que forma a los organismos y que realiza las funciones vitales." },
        { e: "El descubrimiento de la célula fue posible sin ningún instrumento, a simple vista.", r: false, fb: "Falso: la célula es demasiado pequeña para el ojo humano; fue indispensable el microscopio." },
      ],
    },
    a5: {
      titulo: "Glosario: célula, microscopio y teoría celular",
      desc: "Términos clave de la historia y la teoría celular.",
      terminos: [
        { t: "Célula", d: "Unidad fundamental (estructural, funcional y de origen) de todos los seres vivos.", e: "Un ser humano tiene unos 37 billones de células." },
        { t: "Microscopio", d: "Instrumento que aumenta la imagen de objetos diminutos, invisibles al ojo.", e: "Sin él la célula no podría haberse descubierto." },
        { t: "Robert Hooke", d: "Científico inglés que en 1665 observó el corcho y acuñó la palabra «célula».", e: "Vio celdas como las de un panal." },
        { t: "Anton van Leeuwenhoek", d: "Holandés que observó por primera vez microorganismos vivos.", e: "Los llamó «animáculos»." },
        { t: "Matthias Schleiden", d: "Botánico que concluyó (1838) que todas las plantas están hechas de células.", e: "Primer pilar de la teoría celular." },
        { t: "Theodor Schwann", d: "Zoólogo que extendió (1839) la idea celular a los animales.", e: "Unificó plantas y animales bajo la célula." },
        { t: "Rudolf Virchow", d: "Médico que afirmó (1855) que toda célula proviene de otra célula.", e: "«Omnis cellula e cellula»." },
        { t: "Teoría celular", d: "Principio de que la célula es la unidad fundamental de la vida.", e: "Tiene tres postulados." },
        { t: "Unidad estructural", d: "Todos los seres vivos están formados por una o más células.", e: "Primer postulado." },
        { t: "Unidad de origen", d: "Toda célula proviene de otra célula preexistente.", e: "Tercer postulado (Virchow)." },
      ],
      final: "Ordena cronológicamente a Hooke, Schwann, Schleiden y Virchow, y di con cuál de los tres postulados de la teoría celular se relaciona más directamente la frase de Virchow.",
    },
    a6: {
      titulo: "Completa: la historia de la célula",
      desc: "Completa el texto con los términos correctos sobre el descubrimiento de la célula.",
      texto: "El descubrimiento de la célula fue posible gracias al ___. En 1665, Robert ___ observó el corcho y acuñó la palabra «célula». Anton van ___ fue el primero en ver microorganismos vivos. En el siglo XIX, ___ concluyó que las plantas son células, ___ lo extendió a los animales y ___ afirmó que toda célula proviene de otra célula. Así nació la ___ celular, que dice que la célula es la unidad ___, funcional y de origen de todos los seres vivos.",
      huecos: [
        { c: "microscopio", alt: ["el microscopio"] },
        { c: "Hooke", alt: ["hooke"] },
        { c: "Leeuwenhoek", alt: ["leeuwenhoek", "van Leeuwenhoek"] },
        { c: "Schleiden", alt: ["schleiden"] },
        { c: "Schwann", alt: ["schwann"] },
        { c: "Virchow", alt: ["virchow"] },
        { c: "teoría", alt: ["teoria", "la teoría"] },
        { c: "estructural", alt: ["estructura"] },
      ],
    },
    a7: {
      titulo: "¿Cómo voy con el descubrimiento de la célula?",
      desc: "Evalúa tu dominio de la historia y la teoría celular.",
      criterios: [
        "Explico el papel del microscopio y los aportes de Hooke y van Leeuwenhoek.",
        "Identifico las aportaciones de Schleiden, Schwann y Virchow.",
        "Enuncio los tres postulados de la teoría celular.",
        "Reconozco la célula como unidad fundamental de todos los seres vivos.",
      ],
      reflexion: "¿Qué te pareció más interesante del descubrimiento de la célula y cómo lo relacionarías con una tecnología actual que permita ver lo invisible?",
    },
  },
];

async function recontar(sb: SB, uacId: string): Promise<number> {
  const { count, error } = await sb.from("progresiones").select("id", { count: "exact", head: true }).eq("uac_id", uacId);
  if (error) throw new Error(`Error contando progresiones: ${error.message}`);
  return count ?? 0;
}

async function sembrar(sb: SB, s: Spec, apply: boolean) {
  const acts = construir(s);
  const { data: uac, error: uacErr } = await sb.from("uac").select("id, total_progresiones").eq("codigo", s.uac).single();
  if (uacErr || !uac) throw new Error(`UAC ${s.uac} no encontrada: ${uacErr?.message}`);

  // guardas de colisión
  const { data: choque } = await sb.from("progresiones").select("codigo").eq("uac_id", uac.id).eq("numero", s.numero).maybeSingle();
  if (choque && choque.codigo !== s.progCodigo) throw new Error(`${s.uac}: numero=${s.numero} ocupado por ${choque.codigo} — abortado.`);
  const { data: choqueCod } = await sb.from("progresiones").select("numero").eq("codigo", s.progCodigo).maybeSingle();
  if (choqueCod && choqueCod.numero !== s.numero) throw new Error(`${s.progCodigo} ya existe con numero=${choqueCod.numero} — abortado.`);

  console.log(`\n▶ ${s.progCodigo} (numero=${s.numero}) — ${s.O.slice(0, 70)}...`);
  for (let i = 0; i < acts.length; i++) console.log(`    ${s.progCodigo}-A${i + 1} | ${acts[i]!.tipo} | xp${acts[i]!.xp}`);

  if (!apply) return;

  const { error: pErr } = await sb.from("progresiones").upsert({
    codigo: s.progCodigo, uac_id: uac.id, numero: s.numero, titulo: s.O,
    descripcion: s.descripcion, meta_aprendizaje: s.meta, categoria: s.categoria, subcategoria: s.subcategoria,
    descripcion_extendida: `${s.O} Contenidos formativos: ${s.C}.`,
    ejes_articuladores: ["Pensamiento crítico"], transversalidades: [] as string[],
    tiempo_estimado_horas: 3, es_placeholder: false,
  }, { onConflict: "codigo" });
  if (pErr) throw new Error(`Error upsert progresión ${s.progCodigo}: ${pErr.message}`);

  const { data: prog, error: gErr } = await sb.from("progresiones").select("id").eq("codigo", s.progCodigo).single();
  if (gErr || !prog) throw new Error(`No se pudo releer ${s.progCodigo}: ${gErr?.message}`);

  let ok = 0;
  for (let i = 0; i < acts.length; i++) {
    const a = acts[i]!;
    const exito = await upsertActividad(sb, {
      codigo: `${s.progCodigo}-A${i + 1}`, titulo: a.titulo, descripcion: a.descripcion,
      tipo: a.tipo, contenido: a.contenido, progresion_id: prog.id, xp: a.xp, estado: a.estado,
    });
    if (exito) ok++;
  }
  if (ok !== acts.length) throw new Error(`${s.progCodigo}: solo ${ok}/${acts.length} actividades válidas.`);

  const total = await recontar(sb, uac.id);
  const { error: uErr } = await sb.from("uac").update({ total_progresiones: total }).eq("id", uac.id);
  if (uErr) throw new Error(`Error total_progresiones ${s.uac}: ${uErr.message}`);
  console.log(`    ✓ ${ok}/${acts.length} actividades · ${s.uac}.total_progresiones = ${total} (antes ${uac.total_progresiones})`);
}

async function main() {
  const apply = process.argv.includes("--apply");
  const sb = createSB();
  console.log(`\n🌱 7 huecos LIGEROS (sin lab 3D)  (${apply ? "APLICAR" : "DRY-RUN"})`);
  for (const s of SPECS) await sembrar(sb, s, apply);
  if (!apply) { console.log("\n(DRY-RUN) No se escribió nada. Repite con --apply.\n"); return; }
  console.log(`\n✅ 7 huecos ligeros sembrados (borrador). 207/207 cubiertos.\n`);
}

main().then(() => process.exit(0)).catch((e) => { console.error("❌", e.message); process.exit(1); });
