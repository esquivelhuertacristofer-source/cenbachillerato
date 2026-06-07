/**
 * Semestre 1 — Simuladores / ejercicios interactivos (tipo 'simulacion').
 * 12 simuladores concentrados en CNEYT-I (6), PM-I (4) y CD-I (2): las únicas
 * UACs de sem1 con simuladores reales, gratuitos y alineados al MCCEMS 2025.
 * Todas las URLs fueron verificadas como existentes (PhET HTML5 en español,
 * GeoGebra, Blockly Games, Scratch). estado='borrador' hasta validación del cliente.
 * Cada simulador se ancla a la progresión cuya meta oficial corresponde al tema.
 * Uso: npx tsx scripts/seed-sem1-simuladores.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionId, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

interface SimDef {
  progresion: string;   // código de progresión (ej: CNEYT-I-P02)
  codigo: string;       // código único de actividad
  titulo: string;
  descripcion: string;
  xp: number;
  tipo_simulacion: "laboratorio" | "matematica" | "social" | "tecnologia" | "historica";
  url: string;
  sim_descripcion: string;
  instrucciones: string[];
  variables_a_explorar: string[];
  preguntas_reflexion: string[];
  reporte_esperado: string;
}

const sims: SimDef[] = [
  // ════════════════════ CNEYT-I — Laboratorios virtuales (PhET) ════════════════════
  {
    progresion: "CNEYT-I-P02",
    codigo: "CNEYT-I-P02-SIM01",
    titulo: "Laboratorio virtual: Densidad",
    descripcion: "Explora la relación entre masa, volumen y densidad con el simulador PhET «Densidad». Descubre por qué un objeto flota o se hunde.",
    xp: 20,
    tipo_simulacion: "laboratorio",
    url: "https://phet.colorado.edu/sims/html/density/latest/density_es.html",
    sim_descripcion: "Simulador interactivo de PhET (Universidad de Colorado) para investigar la densidad como propiedad de la materia. Mide la masa y el volumen de distintos bloques y calcula su densidad (ρ = m/V), comprobando cuáles flotan y cuáles se hunden en agua.",
    instrucciones: [
      "Abre el simulador y selecciona el modo «Misterio» o «Personalizado».",
      "Mide la masa de un bloque con la balanza y su volumen sumergiéndolo en agua (volumen desplazado).",
      "Calcula la densidad con la fórmula ρ = masa / volumen.",
      "Cambia el material y el volumen y observa cómo varía si flota o se hunde.",
    ],
    variables_a_explorar: ["Masa (kg)", "Volumen (L)", "Densidad (kg/L)", "Flotación respecto al agua (ρ = 1 kg/L)"],
    preguntas_reflexion: [
      "¿Por qué dos bloques del mismo tamaño pueden tener masas diferentes?",
      "¿Qué condición debe cumplir la densidad de un objeto para que flote en agua?",
      "Si duplicas el volumen de un bloque pero mantienes el mismo material, ¿cambia su densidad? ¿Por qué?",
    ],
    reporte_esperado: "Registra en una tabla la masa, el volumen y la densidad de al menos 3 materiales distintos, indica cuáles flotan y explica con tus palabras la relación entre densidad y flotación.",
  },
  {
    progresion: "CNEYT-I-P03",
    codigo: "CNEYT-I-P03-SIM01",
    titulo: "Laboratorio virtual: Construye un átomo",
    descripcion: "Arma átomos colocando protones, neutrones y electrones con el simulador PhET «Construye un Átomo» y observa cómo cambian el elemento, la carga y la masa.",
    xp: 20,
    tipo_simulacion: "laboratorio",
    url: "https://phet.colorado.edu/sims/html/build-an-atom/latest/build-an-atom_es.html",
    sim_descripcion: "Simulador interactivo de PhET para construir átomos partícula por partícula. Permite ver cómo el número de protones define el elemento, cómo los electrones determinan la carga y cómo los neutrones afectan la masa, conectando con la evolución de los modelos atómicos.",
    instrucciones: [
      "Arrastra protones al núcleo y observa cómo cambia el nombre del elemento en la tabla periódica.",
      "Agrega electrones a las capas y verifica cuándo el átomo es neutro, catión o anión.",
      "Modifica el número de neutrones y observa el efecto en el número de masa.",
      "Usa la pestaña «Símbolo» para leer número atómico (Z), número de masa (A) y carga.",
    ],
    variables_a_explorar: ["Número de protones (número atómico Z)", "Número de electrones (carga)", "Número de neutrones (número de masa A)", "Estabilidad / ion formado"],
    preguntas_reflexion: [
      "¿Qué partícula subatómica determina de qué elemento se trata? ¿Por qué?",
      "¿Cómo se forma un ion positivo (catión) y uno negativo (anión)?",
      "¿En qué se diferencia el modelo que usa el simulador del modelo de Dalton?",
    ],
    reporte_esperado: "Construye 3 átomos distintos y para cada uno anota el elemento, su número atómico (Z), número de masa (A) y carga. Explica cómo distinguir un átomo neutro de un ion.",
  },
  {
    progresion: "CNEYT-I-P04",
    codigo: "CNEYT-I-P04-SIM01",
    titulo: "Laboratorio virtual: Concentración de disoluciones",
    descripcion: "Prepara disoluciones y observa cómo cambia la concentración al agregar soluto, agua o evaporar, con el simulador PhET «Concentración».",
    xp: 20,
    tipo_simulacion: "laboratorio",
    url: "https://phet.colorado.edu/sims/html/concentration/latest/concentration_es.html",
    sim_descripcion: "Simulador interactivo de PhET para explorar disoluciones y mezclas homogéneas. Agrega distintos solutos, varía la cantidad de agua y observa cómo cambian la concentración (mol/L) y la saturación, distinguiendo soluto, disolvente y disolución.",
    instrucciones: [
      "Selecciona un soluto (por ejemplo, sulfato de cobre) y agrégalo al agua.",
      "Observa cómo cambia la concentración mostrada al añadir más soluto o más agua.",
      "Evapora agua y observa el efecto sobre la concentración y la saturación.",
      "Identifica cuándo la disolución se satura (aparece precipitado/sólido).",
    ],
    variables_a_explorar: ["Cantidad de soluto (mol)", "Volumen de disolvente (agua)", "Concentración (mol/L)", "Punto de saturación"],
    preguntas_reflexion: [
      "¿Qué le ocurre a la concentración si agregas más agua sin cambiar el soluto?",
      "¿Cuál es la diferencia entre una sustancia pura y una mezcla como una disolución?",
      "¿Qué significa que una disolución esté «saturada»?",
    ],
    reporte_esperado: "Describe un experimento en el que primero aumentas y luego disminuyes la concentración de una disolución. Indica qué hiciste en cada paso y cómo lo comprobaste con el valor de concentración.",
  },
  {
    progresion: "CNEYT-I-P05",
    codigo: "CNEYT-I-P05-SIM01",
    titulo: "Laboratorio virtual: Estados de la materia",
    descripcion: "Calienta y enfría sustancias para observar los cambios entre sólido, líquido y gas, y relaciona la temperatura con el movimiento de las partículas (teoría cinética). Simulador PhET.",
    xp: 20,
    tipo_simulacion: "laboratorio",
    url: "https://phet.colorado.edu/sims/html/states-of-matter-basics/latest/states-of-matter-basics_es.html",
    sim_descripcion: "Simulador interactivo de PhET «Estados de la Materia: Intro». Permite calentar y enfriar diferentes sustancias para observar los cambios de estado y cómo el movimiento de las partículas (energía cinética) se relaciona con la temperatura y el estado de agregación.",
    instrucciones: [
      "Selecciona una sustancia y agrégale o quítale calor con el control de temperatura.",
      "Observa el movimiento de las partículas en estado sólido, líquido y gaseoso.",
      "Identifica las temperaturas en las que ocurren los cambios de estado (fusión, ebullición).",
      "Compara el comportamiento de partículas a baja y alta temperatura.",
    ],
    variables_a_explorar: ["Temperatura", "Energía cinética de las partículas", "Estado de agregación (sólido/líquido/gas)", "Cambios de estado"],
    preguntas_reflexion: [
      "¿Cómo cambia el movimiento de las partículas cuando aumentas la temperatura?",
      "Según la teoría cinética, ¿qué diferencia a un sólido de un gas a nivel de partículas?",
      "¿Qué ocurre con la energía durante un cambio de estado?",
    ],
    reporte_esperado: "Explica, con apoyo de lo observado, cómo la energía cinética de las partículas determina si una sustancia es sólida, líquida o gaseosa. Incluye una descripción de al menos un cambio de estado.",
  },
  {
    progresion: "CNEYT-I-P10",
    codigo: "CNEYT-I-P10-SIM01",
    titulo: "Laboratorio virtual: Isótopos y masa atómica",
    descripcion: "Explora cómo los neutrones generan isótopos de un mismo elemento y cómo se calcula la masa atómica promedio según la abundancia. Simulador PhET.",
    xp: 20,
    tipo_simulacion: "laboratorio",
    url: "https://phet.colorado.edu/sims/html/isotopes-and-atomic-mass/latest/isotopes-and-atomic-mass_es.html",
    sim_descripcion: "Simulador interactivo de PhET para investigar los isótopos. Cambia el número de neutrones de un elemento para formar sus distintos isótopos y observa cómo la abundancia natural de cada uno determina la masa atómica promedio que aparece en la tabla periódica.",
    instrucciones: [
      "Elige un elemento (por ejemplo, hidrógeno o carbono).",
      "Agrega o quita neutrones para formar sus distintos isótopos y observa el cambio en el número de masa.",
      "Usa la pestaña de mezcla de la naturaleza para ver la abundancia de cada isótopo.",
      "Observa cómo se obtiene la masa atómica promedio del elemento.",
    ],
    variables_a_explorar: ["Número de neutrones", "Número de masa (A)", "Abundancia natural de cada isótopo", "Masa atómica promedio"],
    preguntas_reflexion: [
      "¿Qué tienen en común y en qué se diferencian dos isótopos del mismo elemento?",
      "¿Por qué la masa atómica de la tabla periódica casi nunca es un número entero?",
      "¿Cómo influye la abundancia de cada isótopo en la masa atómica promedio?",
    ],
    reporte_esperado: "Elige un elemento con varios isótopos y explica con tus palabras qué es un isótopo y cómo la abundancia de cada uno determina la masa atómica promedio. Incluye un ejemplo numérico observado.",
  },
  {
    progresion: "CNEYT-I-P11",
    codigo: "CNEYT-I-P11-SIM01",
    titulo: "Laboratorio virtual: Globos y electricidad estática",
    descripcion: "Frota un globo contra un suéter y observa la transferencia de cargas eléctricas, conectando la naturaleza corpuscular de la materia con los fenómenos eléctricos. Simulador PhET.",
    xp: 20,
    tipo_simulacion: "laboratorio",
    url: "https://phet.colorado.edu/sims/html/balloons-and-static-electricity/latest/balloons-and-static-electricity_es.html",
    sim_descripcion: "Simulador interactivo de PhET «Globos y electricidad estática». Permite frotar un globo contra un suéter para transferir electrones y observar cómo las cargas positivas y negativas explican la atracción y repulsión, vinculando la estructura de la materia con la actividad eléctrica.",
    instrucciones: [
      "Frota el globo contra el suéter y observa el movimiento de las cargas (electrones).",
      "Acerca el globo cargado a la pared y al suéter y observa la atracción/repulsión.",
      "Activa la vista de cargas para distinguir cargas positivas y negativas.",
      "Experimenta con dos globos para observar la repulsión entre cargas iguales.",
    ],
    variables_a_explorar: ["Carga transferida (electrones)", "Carga neta del globo", "Atracción y repulsión", "Distribución de cargas en los objetos"],
    preguntas_reflexion: [
      "¿Qué partícula se transfiere al frotar el globo con el suéter?",
      "¿Por qué el globo cargado se pega a la pared?",
      "¿Cómo se relaciona la actividad eléctrica con la naturaleza corpuscular de la materia?",
    ],
    reporte_esperado: "Explica, con base en lo observado, cómo el movimiento de electrones produce los fenómenos de electricidad estática. Describe un caso de atracción y uno de repulsión.",
  },

  // ════════════════════ PM-I — Simulaciones matemáticas ════════════════════
  {
    progresion: "PM-I-P02",
    codigo: "PM-I-P02-SIM01",
    titulo: "Simulación: Recta numérica y operaciones",
    descripcion: "Visualiza la suma y resta de números enteros (positivos y negativos) sobre la recta numérica con el simulador PhET «Recta Numérica: Operaciones».",
    xp: 20,
    tipo_simulacion: "matematica",
    url: "https://phet.colorado.edu/sims/html/number-line-operations/latest/number-line-operations_es.html",
    sim_descripcion: "Simulador interactivo de PhET para representar operaciones de suma y resta de números enteros sobre la recta numérica. Ayuda a comprender el significado de los números negativos y de las operaciones como desplazamientos a la izquierda o a la derecha.",
    instrucciones: [
      "Abre el simulador y elige una operación de suma o resta.",
      "Representa la operación como saltos sobre la recta numérica.",
      "Observa la dirección del salto al sumar o restar números negativos.",
      "Comprueba el resultado en la recta y compáralo con el cálculo a mano.",
    ],
    variables_a_explorar: ["Números positivos y negativos", "Suma como desplazamiento a la derecha", "Resta como desplazamiento a la izquierda", "Valor absoluto y dirección"],
    preguntas_reflexion: [
      "¿Qué dirección tomas en la recta numérica al sumar un número negativo?",
      "¿Por qué restar un número negativo equivale a sumar un positivo?",
      "¿Cómo te ayuda la recta numérica a entender el resultado de 3 + (−5)?",
    ],
    reporte_esperado: "Resuelve y representa en la recta numérica al menos 4 operaciones con enteros (incluyendo negativos). Explica con tus palabras la regla de los signos que descubriste.",
  },
  {
    progresion: "PM-I-P04",
    codigo: "PM-I-P04-SIM01",
    titulo: "Simulación: Fracciones e introducción",
    descripcion: "Representa fracciones con figuras y rectas numéricas, y descubre fracciones equivalentes con el simulador PhET «Fracciones: Intro».",
    xp: 20,
    tipo_simulacion: "matematica",
    url: "https://phet.colorado.edu/sims/html/fractions-intro/latest/fractions-intro_es.html",
    sim_descripcion: "Simulador interactivo de PhET para construir y comparar fracciones usando representaciones visuales (círculos, rectángulos, rectas numéricas). Permite explorar el concepto de unidad, fracciones equivalentes y fracciones impropias.",
    instrucciones: [
      "Construye una fracción dividiendo una figura y coloreando partes.",
      "Compara dos fracciones distintas usando las representaciones visuales.",
      "Busca fracciones equivalentes (por ejemplo, 1/2 = 2/4 = 3/6).",
      "Representa una fracción impropia y conviértela a número mixto.",
    ],
    variables_a_explorar: ["Numerador y denominador", "Concepto de unidad (entero)", "Fracciones equivalentes", "Fracciones propias e impropias"],
    preguntas_reflexion: [
      "¿Qué representa el denominador y qué representa el numerador de una fracción?",
      "¿Cómo puedes saber si dos fracciones son equivalentes?",
      "¿Qué relación hay entre una fracción impropia y un número mixto?",
    ],
    reporte_esperado: "Representa 3 fracciones distintas y encuentra una fracción equivalente para cada una. Explica con tus palabras qué significa que dos fracciones sean equivalentes.",
  },
  {
    progresion: "PM-I-P09",
    codigo: "PM-I-P09-SIM01",
    titulo: "Ejercicio interactivo: Potencias y raíces (GeoGebra)",
    descripcion: "Explora la potenciación y la radicación con ejemplos y ejercicios interactivos en el material de GeoGebra «Potencia y Raíz».",
    xp: 20,
    tipo_simulacion: "matematica",
    url: "https://www.geogebra.org/m/SjV43kxY",
    sim_descripcion: "Material interactivo de GeoGebra «Potencia y Raíz» con ejemplos y ejercicios de potencias (cuadradas y cúbicas, distintas bases) y raíces (cuadrada y cúbica, raíces de potencias). Permite practicar el cálculo de exponentes y radicales de forma visual y autoevaluable.",
    instrucciones: [
      "Recorre las secciones del material sobre potencias y raíces.",
      "Resuelve los ejercicios interactivos de cada apartado.",
      "Identifica la relación inversa entre potenciación y radicación.",
      "Verifica tus respuestas con la retroalimentación del material.",
    ],
    variables_a_explorar: ["Base y exponente", "Potencias cuadradas y cúbicas", "Raíz cuadrada y cúbica", "Relación inversa potencia ↔ raíz"],
    preguntas_reflexion: [
      "¿Qué significa elevar un número a una potencia? Da un ejemplo.",
      "¿Por qué la radicación es la operación inversa de la potenciación?",
      "¿Cuánto vale √64 y por qué?",
    ],
    reporte_esperado: "Resuelve al menos 4 ejercicios (2 de potencias y 2 de raíces) anotando el procedimiento. Explica con un ejemplo por qué la raíz es la operación inversa de la potencia.",
  },
  {
    progresion: "PM-I-P05",
    codigo: "PM-I-P05-SIM01",
    titulo: "Simulación: Razón y proporción",
    descripcion: "Experimenta con razones y proporciones (mezclas, precios, escalas) con el simulador PhET «Pista de juego de proporciones».",
    xp: 20,
    tipo_simulacion: "matematica",
    url: "https://phet.colorado.edu/sims/html/proportion-playground/latest/proportion-playground_es.html",
    sim_descripcion: "Simulador interactivo de PhET «Pista de juego de proporciones» (Proportion Playground) para explorar razones y razonamiento proporcional con situaciones como mezclas de colores, precios por unidad y escalas. Permite descubrir cuándo dos razones son equivalentes (proporción).",
    instrucciones: [
      "Explora el modo de mezclas o de precios por unidad.",
      "Ajusta las cantidades para mantener la misma proporción y observa el resultado.",
      "Identifica cuándo dos razones son equivalentes (forman una proporción).",
      "Experimenta con proporcionalidad directa: si una cantidad aumenta, ¿qué pasa con la otra?",
    ],
    variables_a_explorar: ["Razón entre dos cantidades", "Proporción (razones equivalentes)", "Proporcionalidad directa", "Precio por unidad / tasa unitaria"],
    preguntas_reflexion: [
      "¿Qué diferencia hay entre una razón y una proporción?",
      "Si una receta usa 2 tazas de harina por 1 de azúcar, ¿cuánta harina necesitas para 3 de azúcar?",
      "¿Cómo reconoces una situación de proporcionalidad directa?",
    ],
    reporte_esperado: "Crea dos situaciones de proporcionalidad directa (por ejemplo, una receta y un precio) y muestra cómo las resolviste manteniendo la razón constante. Explica qué es una proporción.",
  },

  // ════════════════════ CD-I — Simulaciones tecnológicas ════════════════════
  {
    progresion: "CD-I-P04",
    codigo: "CD-I-P04-SIM01",
    titulo: "Ejercicio interactivo: Pensamiento algorítmico con Blockly (Laberinto)",
    descripcion: "Resuelve laberintos programando con bloques en Blockly Games «Laberinto»: practica secuencias, bucles y condicionales para diseñar algoritmos.",
    xp: 20,
    tipo_simulacion: "tecnologia",
    url: "https://blockly.games/maze?lang=es",
    sim_descripcion: "Juego interactivo de Blockly Games «Laberinto» (en español): guía a un personaje hasta la meta encadenando bloques de instrucciones. Introduce el pensamiento algorítmico mediante secuencias, repeticiones (bucles) y condicionales, sin necesidad de escribir código.",
    instrucciones: [
      "Abre el laberinto y observa el punto de partida y la meta.",
      "Arrastra bloques de movimiento para crear una secuencia de pasos.",
      "Usa bloques de repetición (bucles) para acortar tu solución.",
      "Aplica condicionales («si hay camino...») para resolver los niveles más difíciles.",
    ],
    variables_a_explorar: ["Secuencia de instrucciones", "Bucles (repetición)", "Condicionales (decisiones)", "Eficiencia del algoritmo (menos bloques)"],
    preguntas_reflexion: [
      "¿Qué es un algoritmo y cómo lo aplicaste para salir del laberinto?",
      "¿Para qué sirve un bucle en lugar de repetir el mismo bloque muchas veces?",
      "¿Cuándo necesitaste un condicional («si... entonces...»)?",
    ],
    reporte_esperado: "Describe el algoritmo (la secuencia de pasos) que usaste para resolver uno de los niveles, indicando dónde usaste bucles o condicionales. Explica qué es un algoritmo con tus palabras.",
  },
  {
    progresion: "CD-I-P11",
    codigo: "CD-I-P11-SIM01",
    titulo: "Ejercicio interactivo: Lenguaje algorítmico con Scratch",
    descripcion: "Crea un programa por bloques en Scratch: usa secuencias, bucles, condicionales y variables para implementar un algoritmo sencillo.",
    xp: 20,
    tipo_simulacion: "tecnologia",
    url: "https://scratch.mit.edu/projects/editor/?lang=es",
    sim_descripcion: "Editor interactivo de Scratch (MIT, en español): entorno de programación por bloques para construir programas arrastrando instrucciones. Permite poner en práctica los elementos del lenguaje algorítmico (secuencia, repetición, decisión y variables) creando una animación o juego sencillo.",
    instrucciones: [
      "Abre el editor de Scratch y elige un personaje (objeto).",
      "Construye una secuencia de instrucciones para que el personaje se mueva o hable.",
      "Agrega un bucle de repetición y un bloque condicional («si... entonces»).",
      "Crea y usa una variable (por ejemplo, un contador de puntos).",
    ],
    variables_a_explorar: ["Secuencia de bloques", "Bucles (repetir)", "Condicionales (si... entonces)", "Variables"],
    preguntas_reflexion: [
      "¿Qué elementos del lenguaje algorítmico (secuencia, repetición, decisión, variables) usaste?",
      "¿Para qué te sirvió la variable que creaste?",
      "¿En qué se parece programar en Scratch a escribir un algoritmo en papel?",
    ],
    reporte_esperado: "Describe el programa que creaste en Scratch indicando qué hace, y señala dónde usaste una secuencia, un bucle, un condicional y una variable.",
  },
];

async function main() {
  const sb = createSB();
  log("\n🧪 Semestre 1 — Simuladores / ejercicios interactivos (tipo 'simulacion')\n");

  let ok = 0;
  let fail = 0;

  for (const s of sims) {
    const progresion_id = await getProgresionId(sb, s.progresion);
    const res = await upsertActividad(sb, {
      codigo: s.codigo,
      titulo: s.titulo,
      descripcion: s.descripcion,
      tipo: "simulacion",
      progresion_id,
      xp: s.xp,
      estado: "borrador",
      contenido: {
        tipo_simulacion: s.tipo_simulacion,
        descripcion: s.sim_descripcion,
        url_simulacion: s.url,
        instrucciones: s.instrucciones,
        variables_a_explorar: s.variables_a_explorar,
        preguntas_reflexion: s.preguntas_reflexion,
        reporte_esperado: s.reporte_esperado,
      },
    });
    res ? ok++ : fail++;
  }

  log(`\n✅ Sem1 simuladores: ${ok} insertados, ${fail} fallidos (de ${sims.length}).\n`);
  if (fail > 0) process.exit(1);
}

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
