/**
 * Producto Integrador del semestre para CNEYT-VI (Ciencias Naturales, Experimentales y
 * Tecnología VI — Biología: Organismos y evolución biológica).
 * - Crea 1 capstone (reflexion_escrita) que integra las 8 progresiones:
 *   Origen de la vida, célula procariota y eucariota, metabolismo celular (respiración
 *   y fotosíntesis), ADN y dogma central, herencia mendeliana y no mendeliana,
 *   mutaciones y variabilidad genética, evolución por selección natural, y ética en
 *   biotecnología (transgénicos, CRISPR, clonación).
 *   Se aloja en la progresión de mayor número (culminante de CNEYT-VI).
 * - Queda en estado 'borrador' (no publica nada): el usuario decide cuándo publicar.
 * Uso: npx tsx scripts/seed-cneytvi-producto-integrador.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🎓 Producto Integrador CNEYT-VI — Biología: Organismos y evolución biológica (borrador)\n");

  const progs = await getProgresionesDeUAC(sb, "CNEYT-VI");
  if (progs.length === 0) throw new Error("No se encontraron progresiones de CNEYT-VI");
  const pFinal = progs.reduce((a, b) => (b.numero > a.numero ? b : a), progs[0]);

  const ok = await upsertActividad(sb, {
    codigo: "CNEYT-VI-PRODUCTO-INTEGRADOR",
    progresion_id: pFinal.id,
    titulo: "Producto Integrador: La Historia de la Vida — Del Origen de las Moléculas a la Biotecnología del Siglo XXI",
    descripcion: "Capstone del semestre: integra las ocho progresiones de CNEYT-VI (origen de la vida, célula procariota y eucariota, metabolismo celular, ADN y dogma central, herencia genética, mutaciones, evolución y ética en biotecnología) en un ensayo argumentativo que narra la historia de la vida desde la química primitiva hasta las intervenciones biotecnológicas actuales.",
    tipo: "reflexion_escrita",
    xp: 50,
    estado: "borrador",
    contenido: {
      prompt:
        "PRODUCTO INTEGRADOR — CNEYT-VI: Biología: Organismos y evolución biológica\n\n" +
        "A lo largo del semestre exploraste ocho temas fundamentales de la biología moderna: (1) las hipótesis sobre el origen de la vida en la Tierra y las condiciones primitivas del planeta; (2) la organización celular comparando células procariotas y eucariotas y la función de sus organelos; (3) el metabolismo celular — respiración aerobia (glucólisis, ciclo de Krebs, cadena de transporte de electrones) y fotosíntesis (fase lumínica y ciclo de Calvin) — a nivel molecular; (4) la estructura del ADN de doble hélice y los mecanismos del dogma central: replicación semiconservativa, transcripción y traducción con el código genético; (5) los patrones de herencia genética incluyendo las leyes de Mendel y la herencia no mendeliana (codominancia, dominancia incompleta, herencia ligada al sexo y herencia poligénica); (6) los tipos de mutaciones y su papel en la variabilidad genética y la evolución; (7) la teoría de la evolución por selección natural, sus mecanismos y las evidencias que la sustentan; y (8) las implicaciones éticas de las biotecnologías actuales: transgénicos, edición génica con CRISPR-Cas9 y clonación.\n\n" +
        "SITUACIÓN INTEGRADORA — LA HISTORIA DE LA VIDA EN LA TIERRA:\n" +
        "Imagina que eres un divulgador científico invitado a escribir el ensayo central de una revista de ciencias para jóvenes de bachillerato. Tu misión es narrar 'La Historia de la Vida en la Tierra' de manera rigurosa, apasionante y éticamente reflexiva, conectando todos los temas del semestre en un relato coherente que va desde la química de los océanos primitivos hasta los laboratorios de biotecnología del siglo XXI. Tu ensayo debe demostrar que cada uno de los ocho temas no es un capítulo aislado, sino un eslabón en una cadena de comprensión sobre qué significa ser un ser vivo, cómo surgió la vida y hacia dónde se dirige.\n\n" +
        "Tu ensayo (mínimo 300 palabras) debe desarrollar de forma integrada y argumentativa CADA UNO de los siguientes ocho puntos, con precisión científica y reflexión crítica:\n\n" +
        "1) ORIGEN DE LA VIDA: Inicia tu relato hace aproximadamente 4 000 millones de años. Describe las condiciones de la Tierra primitiva (atmósfera sin oxígeno libre, rica en H₂, CH₄, NH₃, H₂O; océanos calientes; intensa radiación UV y actividad volcánica). Explica cómo la hipótesis de Oparin-Haldane y el experimento de Miller-Urey aportan evidencia de que las moléculas orgánicas pudieron formarse abioticamente. Menciona el papel de las protocélulas (coacervados) y la hipótesis del mundo de ARN como puente hacia las primeras células. ¿Por qué ninguna hipótesis es aún definitiva y cuál es la evidencia más sólida disponible?\n\n" +
        "2) LA CÉLULA: UNIDAD DE LA VIDA: Narra la aparición de las primeras células procariotas hace ~3 800 millones de años. Explica la diferencia fundamental entre células procariotas (sin núcleo, ADN circular, ribosomas 70S) y eucariotas (con núcleo, organelos especializados, ribosomas 80S). Incorpora la teoría endosimbiótica (Lynn Margulis) para explicar el origen de mitocondrias y cloroplastos. Describe la función de al menos tres organelos eucariotas (mitocondria, cloroplasto, retículo endoplasmático, aparato de Golgi) y cómo cada uno contribuye a la vida de la célula.\n\n" +
        "3) METABOLISMO: EL MOTOR DE LA VIDA: Explica cómo las células obtienen energía. Describe la respiración celular aerobia en sus tres etapas (glucólisis en citosol, ciclo de Krebs en la matriz mitocondrial, cadena de transporte de electrones en membrana interna), indicando el producto energético de cada etapa y el total (~36-38 ATP por glucosa). Contrasta con la fotosíntesis: cómo las plantas y algas convierten CO₂ y H₂O en glucosa y O₂ usando la energía solar en los tilacoides (fase lumínica: fotosistemas, fotólisis del agua) y el estroma (ciclo de Calvin: fijación de CO₂ por RuBisCO). ¿Por qué ambos procesos son complementarios y esenciales para el ciclo del carbono en la Tierra?\n\n" +
        "4) EL ADN Y EL CÓDIGO DE LA VIDA: Conecta la historia de la vida con la información genética. Describe la estructura de la doble hélice (antiparalelismo, complementariedad A-T/G-C, esqueleto de fosfato-desoxirribosa). Explica el dogma central: la replicación semiconservativa del ADN (ADN polimerasa, confirmada por Meselson-Stahl), la transcripción (ARN polimerasa, producción de ARNm en el núcleo) y la traducción (ribosoma, ARNt, codones, síntesis de proteínas). Reflexiona sobre por qué el código genético es prácticamente universal: ¿qué nos dice esa universalidad sobre el origen común de todos los seres vivos?\n\n" +
        "5) HERENCIA: LA CONTINUIDAD DE LA VIDA: Narra cómo la información genética se transmite entre generaciones. Explica las dos leyes de Mendel (segregación y surtido independiente) y cómo predicen proporciones fenotípicas en cruzamientos (usa el cuadro de Punnett para ilustrar un ejemplo). Contrasta con la herencia no mendeliana: dominancia incompleta (fenotipo intermedio), codominancia (ambos alelos expresados, ej. grupo sanguíneo AB) y herencia ligada al sexo (ejemplo: daltonismo o hemofilia). Explica por qué la herencia poligénica produce variación continua en rasgos como la estatura.\n\n" +
        "6) MUTACIONES: EL MOTOR DEL CAMBIO: Explica cómo los errores y daños en el ADN generan variación. Distingue entre mutaciones génicas (sustitución, inserción, deleción — incluyendo el frameshift) y cromosómicas (aneuploidía como trisomía 21, translocaciones). Menciona los principales mutágenos (UV, radiaciones ionizantes, carcinógenos químicos, virus) y los sistemas de reparación del ADN. Diferencia mutaciones germinales (heredables) de somáticas (riesgo de cáncer). ¿Por qué, aunque las mutaciones pueden ser perjudiciales, son también imprescindibles para la evolución?\n\n" +
        "7) EVOLUCIÓN: LA UNIDAD DE LA BIOLOGÍA: Lleva tu relato al escenario de poblaciones a lo largo de millones de años. Explica los tres requisitos de Darwin para la selección natural (variación heredable, diferencias en supervivencia/reproducción, herencia). Distingue la selección natural del lamarckismo. Describe al menos dos evidencias de la evolución (registro fósil, estructuras homólogas, biogeografía o filogenia molecular). Menciona mecanismos evolutivos adicionales: deriva génica, flujo génico, especiación alopátrica (ejemplo: pinzones de Darwin). Reflexiona: ¿cómo conecta la evolución todos los temas anteriores (origen de la vida, células, metabolismo, ADN, herencia, mutaciones)?\n\n" +
        "8) BIOTECNOLOGÍA Y ÉTICA: ¿HACIA DÓNDE VAMOS?: Cierra tu ensayo reflexionando sobre el presente y el futuro. Explica qué son los transgénicos (ADN recombinante, ejemplos: insulina humana en bacterias, maíz Bt), cómo funciona CRISPR-Cas9 (ARN guía, corte de Cas9, reparación del ADN, Premio Nobel 2020) y los tipos de clonación (reproductiva: Dolly, 1996; terapéutica: células madre). Analiza al menos dos implicaciones éticas usando los principios de bioética (beneficencia, no maleficencia, justicia, autonomía): por ejemplo, el debate sobre transgénicos y soberanía alimentaria, o la edición germinal humana. ¿Dónde deben estar los límites éticos del control humano sobre la vida?\n\n" +
        "REFLEXIÓN INTEGRADORA FINAL: Responde en tu ensayo: ¿Cuál es el hilo conductor que une el origen de las primeras moléculas orgánicas hace 4 000 millones de años con las discusiones éticas sobre CRISPR hoy? ¿Qué te ha cambiado en tu forma de ver la vida, la enfermedad o el ambiente después de estudiar estos ocho temas? ¿Cuál de los ocho temas te parece el más transformador para la humanidad y por qué?\n\n" +
        "Escribe con rigor científico y precisión terminológica. Usa la nomenclatura correcta (ADN, ARNm, ARNt, ATP, NADH, fotosistema, RuBisCO, codón, alelo, fenotipo, genotipo, CRISPR-Cas9, etc.). Argumenta con evidencias, conecta explícitamente los temas entre sí, y expresa con claridad tus propias reflexiones éticas. Puedes organizar el ensayo con subtítulos correspondientes a cada sección.",
      pistas: [
        "Para la sección de ORIGEN DE LA VIDA: recuerda que el experimento de Miller-Urey no creó vida, sino moléculas orgánicas (aminoácidos). La hipótesis del mundo de ARN es importante porque el ARN puede tanto almacenar información (como el ADN) como catalizar reacciones (como las proteínas, a través de las ribozimas). Conecta esta sección con la siguiente: las protocélulas con membranas fosfolipídicas son el paso previo a las primeras células procariotas.",
        "Para las secciones de METABOLISMO y ADN: conecta ambas señalando que el ADN contiene los genes que codifican para todas las enzimas del metabolismo (glucólisis, ciclo de Krebs, fotosíntesis). Sin el dogma central (ADN→ARN→proteína), ningún proceso metabólico podría llevarse a cabo, porque las enzimas que los catalizan son proteínas producidas por traducción.",
        "Para la sección de HERENCIA y MUTACIONES: conecta ambas explicando que las leyes de Mendel describen cómo se transmiten los alelos (variantes de genes), y que los nuevos alelos surgen por mutación. La recombinación durante la meiosis mezcla los alelos existentes, pero solo las mutaciones crean variantes completamente nuevas. Ambos procesos alimentan la variabilidad genética sobre la que actúa la selección natural.",
        "Para la sección de EVOLUCIÓN: asegúrate de distinguir evolución de progreso o dirección. La evolución no tiene un 'objetivo'; la selección natural favorece lo que funciona en el ambiente actual. La resistencia bacteriana a antibióticos es un ejemplo contemporáneo perfecto de evolución por selección natural que puedes desarrollar: variación (mutaciones en genes de resistencia), selección (antibiótico elimina sensibles), herencia (bacterias resistentes se reproducen).",
        "Para la sección de BIOTECNOLOGÍA Y ÉTICA: usa el caso de He Jiankui (2018) — el científico chino que editó embriones humanos con CRISPR — para ilustrar la diferencia ética entre edición somática (aceptada en ensayos clínicos) y edición germinal (altamente controvertida). Discute por qué la comunidad científica internacional condenó ese experimento usando los cuatro principios de bioética.",
      ],
      longitud_minima_palabras: 300,
      criterios_evaluacion: [
        "Describe con precisión las condiciones de la Tierra primitiva, al menos dos hipótesis sobre el origen de la vida (Oparin-Haldane, mundo de ARN, panspermia) y explica la evidencia experimental que las apoya (experimento de Miller-Urey, ribozimas).",
        "Compara células procariotas y eucariotas identificando diferencias estructurales clave (núcleo, ribosomas, organelos), explica la teoría endosimbiótica y describe la función de al menos tres organelos eucariotas en el contexto del metabolismo celular.",
        "Describe las tres etapas de la respiración aerobia y sus productos energéticos (~36-38 ATP total), diferencia la fase lumínica de la fotosíntesis (tilacoides: ATP, NADPH, O₂) del ciclo de Calvin (estroma: fijación de CO₂, glucosa), y conecta ambos procesos en el ciclo del carbono.",
        "Explica la estructura de la doble hélice del ADN (antiparalelismo, complementariedad A-T/G-C), los tres mecanismos del dogma central (replicación semiconservativa, transcripción, traducción con codones) y reflexiona sobre la universalidad del código genético como evidencia de origen común.",
        "Aplica las leyes de Mendel para predecir proporciones fenotípicas (con cuadro de Punnett), distingue al menos dos tipos de herencia no mendeliana (dominancia incompleta, codominancia, ligada al sexo, poligénica) y da un ejemplo concreto de cada una.",
        "Clasifica los tipos de mutaciones génicas (sustitución/missense/nonsense, frameshift) y cromosómicas (aneuploidía), identifica mutágenos específicos (UV, carcinógenos) y diferencia mutaciones germinales (heredables) de somáticas (riesgo de cáncer), argumentando por qué las mutaciones son esenciales para la evolución.",
        "Explica los tres requisitos de la selección natural (variación heredable, diferencias en reproducción, herencia), la distingue del lamarckismo, presenta al menos dos evidencias de la evolución (fósiles, homologías, filogenia molecular) y conecta la evolución con todos los temas biológicos del semestre.",
        "Explica el mecanismo de al menos una biotecnología (transgénicos, CRISPR o clonación) con precisión técnica y analiza sus implicaciones éticas usando al menos dos principios de bioética (beneficencia, no maleficencia, justicia, autonomía), formulando una posición argumentada y fundamentada.",
      ],
      formato_esperado: "ensayo",
    },
  });
  log(ok ? "  ✓ Producto Integrador CNEYT-VI creado (borrador)\n" : "  ✗ Falló el Producto Integrador\n");

  // Estado actual de CNEYT-VI (sin publicar)
  const ids = progs.map((p) => p.id);
  const { data: all } = await sb.from("actividades").select("estado").in("progresion_id", ids);
  const porEstado: Record<string, number> = {};
  for (const a of all ?? []) porEstado[a.estado] = (porEstado[a.estado] ?? 0) + 1;
  log(`  📊 CNEYT-VI total: ${all?.length ?? 0} actividades → ${JSON.stringify(porEstado)}\n`);
}

main().catch((e) => { console.error("❌ Error:", e.message); process.exit(1); });
