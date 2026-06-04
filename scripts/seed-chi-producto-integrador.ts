/**
 * Producto Integrador del semestre para CH-I (Conciencia Histórica I).
 * - Crea 1 capstone (reflexion_escrita) que integra las 4 progresiones:
 *   P01: Coordenadas espacio-temporales · P02: Formas de medir el tiempo histórico
 *   P03: Causalidad histórica · P04: Fuentes históricas primarias y secundarias.
 * - El PI consiste en elaborar un ANÁLISIS HISTÓRICO INTEGRAL de un proceso a elección del estudiante,
 *   aplicando todas las herramientas de la Conciencia Histórica desarrolladas en el semestre.
 * - Se aloja en la progresión de mayor número (culminante de CH-I).
 * - Queda en estado 'borrador' (no publica nada): el usuario decide cuándo publicarlo.
 * Uso: npx tsx scripts/seed-chi-producto-integrador.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🎓 Producto Integrador CH-I (borrador)\n");

  const progs = await getProgresionesDeUAC(sb, "CH-I");
  if (progs.length === 0) throw new Error("No se encontraron progresiones de CH-I");
  const pFinal = progs.reduce((a, b) => (b.numero > a.numero ? b : a), progs[0]);

  const ok = await upsertActividad(sb, {
    codigo: "CH-I-PRODUCTO-INTEGRADOR",
    progresion_id: pFinal.id,
    titulo: "Producto Integrador: Análisis Histórico Integral — Ejerciendo la Conciencia Histórica",
    descripcion: "Capstone del semestre: elabora un ensayo de análisis histórico que integre las cuatro herramientas de la Conciencia Histórica —coordenadas espacio-temporales, concepciones del tiempo, causalidad histórica y evaluación crítica de fuentes— aplicadas a un proceso histórico de tu elección.",
    tipo: "reflexion_escrita",
    xp: 50,
    estado: "borrador",
    contenido: {
      prompt:
        "Producto Integrador de Conciencia Histórica I.\n\n" +
        "A lo largo de este semestre desarrollaste cuatro herramientas fundamentales para pensar históricamente: " +
        "(1) ubicar eventos y procesos en sus coordenadas espacio-temporales; " +
        "(2) comprender las distintas formas en que las culturas miden y conceptualizan el tiempo; " +
        "(3) analizar las relaciones de causalidad y multicausalidad que explican los fenómenos históricos; y " +
        "(4) identificar, clasificar y evaluar críticamente fuentes históricas primarias y secundarias como evidencias del pasado.\n\n" +
        "Ahora integrarás todo esto en un ANÁLISIS HISTÓRICO INTEGRAL. Elige un proceso histórico que te resulte significativo " +
        "(puede ser de México, América Latina o la historia mundial). Puede ser un proceso que hayas estudiado en clase, " +
        "uno que conozcas por otra vía, o uno que te interese investigar. Redacta un ensayo argumentado (mínimo 300 palabras) " +
        "con la siguiente estructura:\n\n" +
        "1. PRESENTACIÓN DEL PROCESO E IDENTIFICACIÓN DE COORDENADAS ESPACIO-TEMPORALES:\n" +
        "Presenta el proceso histórico elegido. Ubícalo con precisión: ¿cuándo ocurrió? (fechas, período, era), ¿dónde ocurrió? " +
        "(espacio geográfico, territorios involucrados). Explica por qué las coordenadas espacio-temporales importan para comprender " +
        "este proceso: ¿cómo influyó el contexto geográfico?, ¿en qué período histórico se inscribe? " +
        "Sitúa el proceso en relación con al menos un evento anterior relevante mediante una referencia cronológica.\n\n" +
        "2. ANÁLISIS TEMPORAL: CONCEPCIONES DEL TIEMPO EN EL PROCESO:\n" +
        "Reflexiona sobre las concepciones del tiempo presentes en tu proceso histórico. " +
        "¿Los actores del período tenían una concepción lineal o cíclica del tiempo? ¿Cómo medían el tiempo en esa época y cultura? " +
        "¿Hay diferencias entre el tiempo subjetivo que vivieron los protagonistas y el tiempo cronológico que podemos medir hoy? " +
        "Si aplica, ¿puedes identificar ritmos históricos de distinta duración en tu proceso (larga duración, coyuntura, evento)? " +
        "Fundamenta tu respuesta con al menos un concepto sobre las concepciones del tiempo estudiado en el semestre.\n\n" +
        "3. ANÁLISIS DE CAUSALIDAD: MULTICAUSALIDAD Y CONSECUENCIAS:\n" +
        "Aplica el principio de multicausalidad: identifica al menos TRES causas de diferente naturaleza (política, económica, social, " +
        "cultural) que explican el proceso. Distingue entre causas estructurales (condiciones de largo plazo) y causas coyunturales " +
        "(detonantes inmediatos). Analiza al menos TRES consecuencias del proceso: una de corto plazo, una de mediano plazo y una " +
        "de largo alcance (que llegue hasta el presente o que haya determinado eventos posteriores). " +
        "Señala si hubo consecuencias no intencionadas que los actores no previeron. " +
        "Menciona la agencia de al menos un actor histórico clave y cómo sus decisiones influyeron en el curso del proceso.\n\n" +
        "4. EVALUACIÓN CRÍTICA DE FUENTES HISTÓRICAS:\n" +
        "Identifica y clasifica al menos CUATRO fuentes históricas sobre tu proceso elegido: mínimo 2 fuentes primarias y " +
        "2 fuentes secundarias. Para cada una: (a) descríbela brevemente, (b) clasifícala como primaria o secundaria y justifica, " +
        "(c) identifica su posible sesgo o perspectiva, (d) explica qué aporta específicamente al conocimiento de tu proceso. " +
        "¿Cómo se complementan o contradicen estas fuentes entre sí? ¿Cuáles consideras más confiables y por qué?\n\n" +
        "5. SÍNTESIS E INTERPRETACIÓN HISTÓRICA:\n" +
        "Cierra tu ensayo con una síntesis crítica: ¿qué aprendes de este proceso histórico cuando lo analizas con las herramientas " +
        "de la Conciencia Histórica? ¿Qué conexión encuentras entre ese proceso del pasado y el presente? " +
        "¿Qué preguntas históricas quedan abiertas para seguir investigando? " +
        "Reflexiona: ¿cómo cambia tu comprensión del presente cuando conoces mejor el pasado?\n\n" +
        "Escribe con rigor histórico: usa los conceptos del semestre con precisión, construye argumentos fundamentados en evidencia, " +
        "y sé honesto sobre las limitaciones de tu análisis y del conocimiento histórico disponible.",
      pistas: [
        "Para elegir tu proceso histórico, piensa en algo que te cause curiosidad genuina: puede ser la Independencia de México, la Revolución Industrial, la Conquista de América, la Segunda Guerra Mundial, el Movimiento Estudiantil de 1968 o cualquier otro. Lo importante es que puedas aplicar las cuatro herramientas de la Conciencia Histórica.",
        "Para el análisis de coordenadas espacio-temporales, no te limites a dar una fecha y un país. Reflexiona: ¿el espacio geográfico tuvo algún papel causal? ¿Los actores tenían consciencia de estar viviendo un momento histórico? ¿Cómo sitúas este proceso en la gran periodización histórica (Edad Moderna, Contemporánea, etc.)?",
        "Para la multicausalidad, usa la distinción estructural/coyuntural: las causas estructurales son las condiciones de fondo (desigualdad, tensiones acumuladas, cambios tecnológicos) que hacen posible el proceso; las coyunturales son los eventos concretos que lo detonan. Ambas son necesarias para una explicación completa.",
        "Para las fuentes históricas, si no tienes acceso físico a documentos de archivo, puedes describir qué tipo de fuentes primarias EXISTIRÍAN sobre tu proceso (cartas, diarios, fotografías, documentos oficiales, restos arqueológicos) y dónde podrían encontrarse (archivos históricos, museos, bibliotecas digitales). Para las secundarias, puedes citar libros de texto, documentales o artículos que hayas consultado.",
        "En tu síntesis final, practica el pensamiento histórico: el pasado no solo 'ocurrió', sino que sigue moldeando el presente. Pregúntate: ¿qué herencia dejó este proceso en las instituciones, los valores, los conflictos o la identidad de la sociedad actual? Esta conexión pasado-presente es el corazón de la Conciencia Histórica.",
      ],
      longitud_minima_palabras: 300,
      criterios_evaluacion: [
        "Ubica el proceso histórico elegido con precisión en sus coordenadas espacio-temporales, explicando la relevancia del contexto geográfico y del período histórico para comprender el proceso.",
        "Analiza las concepciones del tiempo presentes en el proceso histórico, aplicando con corrección al menos un concepto sobre el tiempo histórico (cronológico, cíclico, subjetivo, duraciones de Braudel) estudiado en el semestre.",
        "Aplica el principio de multicausalidad, identificando al menos tres causas de diferente naturaleza y distinguiendo entre causas estructurales y coyunturales con claridad conceptual.",
        "Analiza las consecuencias del proceso en distintos horizontes temporales (corto, mediano y largo plazo), señalando al menos una consecuencia no intencionada y el papel de la agencia histórica de un actor clave.",
        "Identifica y clasifica al menos cuatro fuentes históricas (mínimo 2 primarias y 2 secundarias), describiendo el sesgo o perspectiva de cada una y explicando su aporte específico al conocimiento del proceso.",
        "Cruza críticamente las fuentes identificadas, señalando cómo se complementan o contradicen y argumentando cuáles resultan más confiables para el análisis del proceso elegido.",
        "Elabora una síntesis histórica que integra coherentemente las cuatro dimensiones de la Conciencia Histórica, establece conexiones entre el proceso pasado y el presente, y propone al menos una pregunta histórica abierta para continuar la investigación.",
      ],
      formato_esperado: "ensayo",
    },
  });

  log(ok ? "  ✓ Producto Integrador CH-I creado (borrador)\n" : "  ✗ Falló el Producto Integrador\n");

  // Estado actual de CH-I (sin publicar)
  const ids = progs.map((p) => p.id);
  const { data: all } = await sb.from("actividades").select("estado").in("progresion_id", ids);
  const porEstado: Record<string, number> = {};
  for (const a of all ?? []) porEstado[a.estado] = (porEstado[a.estado] ?? 0) + 1;
  log(`  📊 CH-I total: ${all?.length ?? 0} actividades → ${JSON.stringify(porEstado)}\n`);
}

main().catch((e) => { console.error("❌ Error:", e.message); process.exit(1); });
