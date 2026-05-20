/**
 * Seed de actividades pedagógicas para CNEYT-VI (CNEyT VI — Biología: Vida, Herencia y Evolución, Semestre 6).
 * 8 propósitos × 3 actividades = 24 actividades. estado='publicada'.
 * Tipos A1: lectura, infografia, lectura, video_con_preguntas, lectura, lectura, lectura, infografia
 * Tipos A2: quiz_multiple_opcion, quiz_multiple_opcion, ejercicio_matematico, quiz_verdadero_falso,
 *           ejercicio_matematico, quiz_multiple_opcion, simulacion, quiz_multiple_opcion
 * Tipos A3: reflexion_escrita × 6, debate_estructurado × 2 (P06 y P08)
 * Uso: npx tsx scripts/seed-activities-cneytvi.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🌱 Seed actividades CNEYT-VI — Biología: Vida, Herencia y Evolución\n");

  const progs = await getProgresionesDeUAC(sb, "CNEYT-VI");
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
      descripcion: "Práctica de verificación y consolidación conceptual.",
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

  log(`\n✅ CNEYT-VI: ${ok} actividades insertadas, ${fail} fallidas.\n`);
}

// ── TÍTULOS ─────────────────────────────────────────────────────────────────────
const titulos = [
  { a1: "El origen de la vida: hipótesis científicas", a2: "Quiz: Origen de la vida", a3: "Reflexión: ¿Cuál hipótesis es más convincente?" },
  { a1: "Células procariota y eucariota: organelos y funciones", a2: "Quiz: Tipos de células y organelos", a3: "Reflexión: Diseña tu célula ideal" },
  { a1: "Metabolismo celular: fotosíntesis y respiración", a2: "Ejercicio: ATP total en respiración aerobia", a3: "Reflexión: Aerobia vs. fermentación" },
  { a1: "El dogma central de la biología molecular", a2: "Verdadero o Falso: ADN, ARN y proteínas", a3: "Reflexión: El dogma central en mis palabras" },
  { a1: "Herencia mendeliana y ligada al sexo", a2: "Ejercicio: Cruce monohíbrido Aa×Aa", a3: "Reflexión: Daltonismo y herencia ligada al sexo" },
  { a1: "Mutaciones: tipos, causas y consecuencias", a2: "Quiz: Mutaciones y variabilidad genética", a3: "Debate: ¿Error o motor de la evolución?" },
  { a1: "Evolución por selección natural: Darwin y evidencias", a2: "Simulación: Selección natural en conejos", a3: "Reflexión: La evidencia más sólida de la evolución" },
  { a1: "Biotecnología y bioética: CRISPR, OGM, clonación", a2: "Quiz: Bioética y biotecnología", a3: "Debate: ¿CRISPR en embriones humanos?" },
];

const tiposA1 = ["lectura", "infografia", "lectura", "video_con_preguntas", "lectura", "lectura", "lectura", "infografia"] as const;
const tiposA2 = ["quiz_multiple_opcion", "quiz_multiple_opcion", "ejercicio_matematico", "quiz_verdadero_falso", "ejercicio_matematico", "quiz_multiple_opcion", "simulacion", "quiz_multiple_opcion"] as const;
const tiposA3 = ["reflexion_escrita", "reflexion_escrita", "reflexion_escrita", "reflexion_escrita", "reflexion_escrita", "debate_estructurado", "reflexion_escrita", "debate_estructurado"] as const;

// ── A1 ──────────────────────────────────────────────────────────────────────────
const contenidosA1 = [
  { // P01 — lectura (Origen de la vida)
    titulo: "El origen de la vida: hipótesis científicas",
    texto: "Las hipótesis abióticas sobre el origen de la vida proponen que moléculas orgánicas complejas surgieron de compuestos inorgánicos en condiciones primitivas de la Tierra.\n\nLa hipótesis del caldo primordial de Oparin y Haldane (1920s) sugiere que la atmósfera primitiva (CH4, NH3, H2O, H2) y la energía de rayos y volcanes permitieron la síntesis de moléculas orgánicas en los océanos. En 1953, Stanley Miller y Harold Urey simularon estas condiciones en laboratorio y obtuvieron aminoácidos, validando experimentalmente que los bloques de la vida pueden formarse abioticamente.\n\nLa hipótesis de los ventiladeros hidrotermales propone que las chimeneas submarinas, ricas en minerales y con gradientes de temperatura y pH, fueron el ambiente donde surgieron las primeras biomoléculas y membranas. Esta hipótesis es hoy muy respaldada porque no requiere una atmósfera reductora.\n\nLa hipótesis del Mundo ARN plantea que el ARN fue la primera molécula de la vida, capaz tanto de almacenar información genética como de catalizar reacciones (ribozimas). Esto resuelve el dilema del huevo y la gallina entre ADN y proteínas.\n\nFinalmente, la panspermia sugiere que moléculas orgánicas o incluso microorganismos llegaron a la Tierra desde el espacio, en meteoritos. El meteorito de Murchison (1969) contenía aminoácidos extraterrestres. Esta hipótesis traslada el problema pero no lo elimina: ¿cómo surgió la vida en ese origen externo?",
    fuente: "Material elaborado para CEN Bachillerato — CNEYT-VI. Ref: Campbell, Biología (12a ed.); Miller & Urey, Science 1953.",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 8,
    preguntas_comprension: [
      { pregunta: "¿Qué demostró el experimento Miller-Urey (1953)?", respuesta_guia: "Que aminoácidos pueden formarse abioticamente a partir de gases inorgánicos simples bajo condiciones de la Tierra primitiva." },
      { pregunta: "¿Por qué la hipótesis del Mundo ARN resuelve el dilema ADN-proteína?", respuesta_guia: "Porque el ARN puede a la vez almacenar información genética y catalizar reacciones, por lo que no necesita al ADN ni a las proteínas para existir primero." },
    ],
  },
  { // P02 — infografia (Célula procariota y eucariota)
    titulo: "Células procariota y eucariota: organelos y funciones",
    url_imagen: "/placeholder/infografia.svg",
    descripcion_accesible: "Infografía comparativa de célula procariota (sin núcleo, circular, bacterias) y célula eucariota animal/vegetal (con núcleo y organelos membranosos). Se ilustran organelos y sus funciones principales.",
    puntos_clave: [
      "Célula procariota: sin núcleo definido, ADN circular en nucleoide, sin organelos membranosos, tamaño 1-10 µm. Ejemplos: bacterias, arqueas.",
      "Célula eucariota: núcleo con doble membrana que contiene el ADN lineal, organelos especializados, tamaño 10-100 µm. Ejemplos: células animales, vegetales, hongos.",
      "Núcleo: contiene el ADN y dirige la síntesis de proteínas. Centro de control de la célula.",
      "Mitocondria: produce ATP mediante respiración aerobia (fosforilación oxidativa). Tiene su propio ADN circular: evidencia de la teoría endosimbiótica.",
      "Cloroplasto (solo en plantas/algas): realiza la fotosíntesis convirtiendo luz en energía química. También tiene ADN propio.",
      "Retículo endoplásmico rugoso (con ribosomas): síntesis y procesamiento de proteínas. Retículo liso: síntesis de lípidos y desintoxicación.",
      "Aparato de Golgi: procesa, empaca y dirige proteínas y lípidos a su destino (secreción, lisosomas, membrana).",
      "Lisosoma: contiene enzimas digestivas que degradan moléculas, orgánulos dañados y patógenos.",
      "Vacuola: en células vegetales, regula la turgencia y almacena sustancias. En células animales, son pequeñas y transitorias.",
      "Membrana celular: bicapa fosfolipídica con proteínas. Controla el paso de sustancias (permeabilidad selectiva).",
      "Teoría endosimbiótica (Lynn Margulis): mitocondrias y cloroplastos fueron bacterias ancestrales que se incorporaron a células huésped. Evidencia: doble membrana, ADN propio, ribosomas 70S.",
    ],
    fuente: "Material elaborado para CEN Bachillerato — CNEYT-VI. Ref: Campbell, Biología (12a ed.); Alberts, Biología Molecular de la Célula.",
  },
  { // P03 — lectura (Metabolismo celular)
    titulo: "Metabolismo celular: fotosíntesis y respiración",
    texto: "El metabolismo celular comprende todas las reacciones químicas que ocurren en la célula para obtener y usar energía.\n\nLa fotosíntesis ocurre en los cloroplastos y tiene dos etapas. Las reacciones luminosas (tilacoides) capturan luz solar y la convierten en ATP y NADPH, liberando O2 a partir del agua. Las reacciones oscuras (ciclo de Calvin, estroma) usan el ATP y NADPH para fijar CO2 y sintetizar glucosa. Ecuación general: 6CO2 + 6H2O + luz -> C6H12O6 + 6O2.\n\nLa respiración celular aerobia ocurre en tres etapas. Glucólisis (citoplasma): una molécula de glucosa se divide en 2 piruvatos, produciendo 2 ATP netos y 2 NADH. Ciclo de Krebs (matriz mitocondrial): los piruvatos se oxidan completamente, produciendo 2 ATP, 8 NADH y 2 FADH2 por glucosa. Cadena transportadora de electrones (membrana interna mitocondrial): el NADH y FADH2 ceden electrones; el gradiente de protones impulsa la ATP sintasa produciendo aprox. 32 ATP. Total: ~36 ATP por glucosa.\n\nLa fermentación es un proceso anaerobio (sin oxígeno). La fermentación láctica (músculos en ejercicio intenso) convierte piruvato en lactato, produciendo solo 2 ATP. La fermentación alcohólica (levaduras) convierte piruvato en etanol y CO2. Ambas regeneran NAD+ para que la glucólisis pueda continuar, pero son mucho menos eficientes que la respiración aerobia.",
    fuente: "Material elaborado para CEN Bachillerato — CNEYT-VI. Ref: Campbell, Biología (12a ed.); Lehninger, Bioquímica.",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 9,
    preguntas_comprension: [
      { pregunta: "¿Cuáles son las dos etapas de la fotosíntesis y dónde ocurre cada una?", respuesta_guia: "Reacciones luminosas en los tilacoides (producen ATP y NADPH, liberan O2) y ciclo de Calvin en el estroma (fijan CO2 para hacer glucosa)." },
      { pregunta: "¿Por qué la respiración aerobia produce mucho más ATP que la fermentación?", respuesta_guia: "Porque la cadena transportadora de electrones (aerobia) extrae la mayor parte de la energía del NADH y FADH2, produciendo ~32 ATP adicionales. La fermentación solo produce 2 ATP por glucólisis." },
    ],
  },
  { // P04 — video_con_preguntas (Dogma central)
    url_video: "https://www.youtube.com/watch?v=placeholder-dogma-central",
    titulo_video: "El dogma central de la biología molecular: ADN, ARN y proteínas",
    descripcion: "Video que explica la replicación del ADN, la transcripción (ADN a ARNm) y la traducción (ARNm a proteína), con animaciones del ribosoma y el código genético.",
    tiempo_segundos: 720,
    preguntas: [
      { tiempo_segundos: 150, pregunta: "¿Qué es la replicación semiconservativa del ADN?", respuesta_guia: "Cada cadena del ADN sirve de molde para sintetizar una nueva cadena complementaria, resultando en dos moléculas de ADN idénticas, cada una con una cadena original y una nueva." },
      { tiempo_segundos: 320, pregunta: "¿Cuál es la diferencia entre ARNm, ARNt y ARNr?", respuesta_guia: "ARNm: lleva el mensaje genético del núcleo al ribosoma. ARNt: transporta aminoácidos y reconoce los codones del ARNm. ARNr: forma parte estructural del ribosoma y cataliza la unión de aminoácidos." },
      { tiempo_segundos: 520, pregunta: "¿Qué es un codón de inicio y cuál es su secuencia?", respuesta_guia: "Es la secuencia AUG en el ARNm que señala el inicio de la traducción y codifica el aminoácido metionina." },
      { tiempo_segundos: 680, pregunta: "¿Cómo puede una mutación puntual alterar una proteína?", respuesta_guia: "Un cambio en una sola base del ADN puede cambiar el codón correspondiente en el ARNm, lo que puede incorporar un aminoácido diferente o generar un codón de paro prematuro, alterando la estructura y función de la proteína." },
    ],
  },
  { // P05 — lectura (Herencia mendeliana)
    titulo: "Herencia mendeliana y ligada al sexo",
    texto: "Gregor Mendel (1865) enunció las leyes de la herencia a partir de experimentos con guisantes. La Ley de Segregación establece que cada organismo tiene dos alelos para cada gen y los separa durante la formación de gametos, transmitiendo uno solo a la descendencia. La Ley de la Distribución Independiente indica que los genes en cromosomas distintos se heredan de forma independiente.\n\nEn un cruce monohíbrido (Aa × Aa), el cuadro de Punnett da una proporción genotípica 1 AA : 2 Aa : 1 aa y una proporción fenotípica 3 dominante : 1 recesivo. La probabilidad de obtener un homocigoto recesivo (aa) es del 25%.\n\nLa herencia no mendeliana incluye la dominancia incompleta (el heterocigoto tiene un fenotipo intermedio), la codominancia (ambos alelos se expresan, como en el grupo sanguíneo ABO) y los genes ligados al sexo.\n\nLos grupos sanguíneos ABO están controlados por tres alelos (IA, IB, i). IA e IB son codominantes entre sí y dominantes sobre i. Así, el grupo AB (genotipo IAIB) expresa ambos antígenos.\n\nLa herencia ligada al sexo implica genes en el cromosoma X. El daltonismo (gen recesivo ligado a X) afecta más a hombres (XY) porque tienen un solo cromosoma X: si este lleva el alelo recesivo, expresan el fenotipo. Las mujeres (XX) necesitan dos copias del alelo recesivo para expresarlo, pero pueden ser portadoras.",
    fuente: "Material elaborado para CEN Bachillerato — CNEYT-VI. Ref: Campbell, Biología (12a ed.); Lewin, Genes XII.",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 9,
    preguntas_comprension: [
      { pregunta: "¿Qué proporción fenotípica produce un cruce Aa × Aa y por qué?", respuesta_guia: "3 dominante : 1 recesivo, porque el cuadro de Punnett da AA, Aa, Aa, aa; los tres primeros expresan el fenotipo dominante y solo aa expresa el recesivo." },
      { pregunta: "¿Por qué el daltonismo es más frecuente en hombres que en mujeres?", respuesta_guia: "Los hombres tienen un solo cromosoma X; si lleva el alelo recesivo del daltonismo, lo expresan. Las mujeres necesitan dos copias del alelo recesivo (una en cada X) para manifestarlo." },
    ],
  },
  { // P06 — lectura (Mutaciones)
    titulo: "Mutaciones: tipos, causas y consecuencias",
    texto: "Una mutación es un cambio en la secuencia del ADN. Las mutaciones génicas afectan uno o pocos nucleótidos: sustitución (un nucleótido reemplaza a otro), inserción o deleción (se añade o elimina un nucleótido, causando desplazamiento del marco de lectura). Las mutaciones cromosómicas afectan la estructura o el número de cromosomas: deleción, duplicación, inversión, translocación y aneuploidía (ej. trisomía 21, síndrome de Down).\n\nLos mutágenos son agentes que aumentan la tasa de mutación. Los físicos incluyen la radiación ionizante (rayos X, gamma) y la radiación UV (forma dímeros de timina). Los químicos incluyen el humo del tabaco (benzopirenos, nitrosaminas), el formaldehído y los alquilantes. Los biológicos incluyen ciertos virus (VPH) y transposones.\n\nLas mutaciones somáticas ocurren en células del cuerpo y no se heredan a la descendencia; pueden acumular cambios en genes reguladores del ciclo celular y originar cáncer. Las mutaciones germinales ocurren en células reproductoras y pueden transmitirse a la siguiente generación, siendo la fuente de variabilidad genética en las poblaciones.\n\nAunque la mayoría de las mutaciones son neutras o perjudiciales, algunas son beneficiosas: por ejemplo, la mutación que confiere resistencia a la malaria en portadores del rasgo falciforme (HbAS) es ventajosa en zonas endémicas. Las mutaciones son, en última instancia, el motor de la variación sobre la que actúa la selección natural.",
    fuente: "Material elaborado para CEN Bachillerato — CNEYT-VI. Ref: Campbell, Biología (12a ed.); Alberts, Biología Molecular de la Célula.",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 8,
    preguntas_comprension: [
      { pregunta: "¿Cuál es la diferencia entre una mutación génica puntual y una mutación cromosómica?", respuesta_guia: "La génica puntual afecta uno o pocos nucleótidos (sustitución, inserción, deleción) cambiando un codón. La cromosómica altera la estructura o el número de cromosomas enteros o fragmentos grandes." },
      { pregunta: "¿Por qué las mutaciones somáticas no se heredan pero sí pueden causar cáncer?", respuesta_guia: "Las mutaciones somáticas solo afectan células del cuerpo, no a los gametos, por lo que no pasan a la descendencia. Pero si alteran genes que controlan la división celular (oncogenes, supresores tumorales), pueden provocar crecimiento descontrolado: cáncer." },
    ],
  },
  { // P07 — lectura (Evolución)
    titulo: "Evolución por selección natural: Darwin y evidencias",
    texto: "Charles Darwin y Alfred Russell Wallace propusieron en 1858 la teoría de la evolución por selección natural, publicada por Darwin en 'El origen de las especies' (1859). Los cuatro postulados son: (1) existe variación heredable en las poblaciones; (2) los individuos producen más descendencia de la que puede sobrevivir; (3) algunos rasgos aumentan la probabilidad de sobrevivir y reproducirse; (4) los rasgos favorables se hacen más frecuentes en la población con el tiempo.\n\nLa selección natural no es aleatoria: opera sobre la variación existente, favoreciendo los fenotipos mejor adaptados al ambiente actual. El resultado acumulado a lo largo del tiempo es la evolución: cambio en las frecuencias alélicas de una población.\n\nLa especiación ocurre cuando poblaciones de una misma especie quedan aisladas reproductivamente. El aislamiento geográfico (especiación alopátrica) acumula diferencias genéticas hasta que las poblaciones ya no pueden reproducirse entre sí, formando nuevas especies.\n\nLas evidencias de la evolución son múltiples y convergentes. El registro fósil muestra formas de transición (ej. Tiktaalik, entre peces y tetrápodos). La anatomía comparada revela estructuras homólogas (mismo origen, distinta función: el hueso humero en humano, ballena, murciélago) y vestigiales (estructuras que perdieron su función, como el cóccix humano). La biogeografía explica la distribución de especies. La genómica comparada demuestra que especies más emparentadas comparten mayor porcentaje de su ADN; los humanos compartimos ~98.7% del genoma con los chimpancés.",
    fuente: "Material elaborado para CEN Bachillerato — CNEYT-VI. Ref: Campbell, Biología (12a ed.); Darwin, El origen de las especies.",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 9,
    preguntas_comprension: [
      { pregunta: "¿Cuáles son los cuatro postulados de la selección natural de Darwin?", respuesta_guia: "Variación heredable en la población; sobreproducción de descendencia; algunos rasgos aumentan la supervivencia y reproducción; los rasgos favorables aumentan en frecuencia generación a generación." },
      { pregunta: "Da dos ejemplos de evidencias de la evolución con distintos tipos de evidencia.", respuesta_guia: "Fósiles de transición como Tiktaalik (anatómica-paleontológica); homología del húmero en vertebrados (anatomía comparada); porcentaje compartido de ADN con chimpancés (genómica comparada)." },
    ],
  },
  { // P08 — infografia (Bioética y biotecnología)
    titulo: "Biotecnología y bioética: CRISPR, OGM, clonación",
    url_imagen: "/placeholder/infografia.svg",
    descripcion_accesible: "Infografía sobre biotecnología moderna y sus implicaciones éticas: organismos genéticamente modificados, CRISPR-Cas9, clonación y principios bioéticos aplicados.",
    puntos_clave: [
      "OGM (Organismos Genéticamente Modificados): se insertan genes de una especie en otra mediante vectores (plásmidos, virus). Usos: maíz Bt resistente a plagas, insulina humana producida en bacterias, vacunas recombinantes. En México, el maíz transgénico es tema de debate por la soberanía alimentaria y la biodiversidad del maíz nativo (centro de origen y diversificación del maíz).",
      "CRISPR-Cas9: sistema de edición genómica precisa basado en una ARN guía que dirige la proteína Cas9 al sitio exacto del ADN para cortarlo. Permite corregir mutaciones causantes de enfermedades (beta-talasemia, anemia falciforme), desarrollar terapias contra el cáncer y modificar organismos con alta precisión. Las primeras terapias CRISPR fueron aprobadas en 2023.",
      "Clonación reproductiva: producir un individuo genéticamente idéntico a otro (ej. la oveja Dolly, 1996). Técnicamente posible en mamíferos, pero considerada éticamente inaceptable en humanos por la mayoría de las comunidades científicas y los marcos legales.",
      "Clonación terapéutica: crear embriones para obtener células madre embrionarias compatibles con un paciente, sin fines reproductivos. Permite desarrollar tejidos para trasplante. El debate ético gira en torno al estatus moral del embrión.",
      "Principios bioéticos (Beauchamp y Childress): autonomía (respetar la decisión informada del individuo), beneficencia (buscar el bien del paciente), no maleficencia (no causar daño), justicia (distribución equitativa de beneficios y riesgos).",
      "CIBIOGEM (Comisión Intersecretarial de Bioseguridad de los Organismos Genéticamente Modificados): organismo del gobierno mexicano que regula la liberación, uso y comercialización de OGM en México, aplicando el principio de precaución.",
    ],
    fuente: "Material elaborado para CEN Bachillerato — CNEYT-VI. Ref: Doudna & Charpentier, Science 2012; CIBIOGEM; Beauchamp y Childress, Principios de Ética Biomédica.",
  },
];

// ── A2 ──────────────────────────────────────────────────────────────────────────
const contenidosA2 = [
  { // P01 — quiz_multiple_opcion (Origen de la vida)
    preguntas: [
      {
        enunciado: "¿Qué moléculas orgánicas obtuvo Miller en su experimento de 1953 al simular la atmósfera primitiva?",
        opciones: ["Ácidos grasos y glucosa", "Aminoácidos y otras moléculas orgánicas", "Nucleótidos y ATP", "Cloroplastos y mitocondrias"],
        respuesta_correcta: 1,
        retroalimentacion: "Miller obtuvo aminoácidos y otras moléculas orgánicas, demostrando que los bloques de la vida pueden formarse abioticamente. Este resultado respaldó la hipótesis de Oparin y Haldane.",
      },
      {
        enunciado: "¿Cuál hipótesis propone que el ARN fue la primera molécula capaz de almacenar información y catalizar reacciones?",
        opciones: ["Panspermia", "Mundo ARN", "Caldo primordial", "Ventiladeros hidrotermales"],
        respuesta_correcta: 1,
        retroalimentacion: "La hipótesis del Mundo ARN resuelve el dilema 'ADN vs. proteína' porque el ARN puede hacer ambas funciones. Las ribozimas son ARN catalíticos que respaldan esta hipótesis.",
      },
      {
        enunciado: "¿Qué evidencia respalda la hipótesis de la panspermia?",
        opciones: ["La síntesis de ADN en laboratorio", "El meteorito de Murchison contenía aminoácidos extraterrestres", "La existencia de ribozimas", "Los ventiladeros hidrotermales oceánicos"],
        respuesta_correcta: 1,
        retroalimentacion: "El meteorito de Murchison (1969) contenía más de 70 aminoácidos distintos de origen extraterrestre. Esto muestra que las moléculas orgánicas pueden formarse en el espacio.",
      },
      {
        enunciado: "¿Por qué se descartó la hipótesis de la generación espontánea en el siglo XIX?",
        opciones: ["Porque Oparin la refutó matemáticamente", "Porque los experimentos de Pasteur demostraron que la vida solo surge de vida preexistente", "Porque Miller demostró lo contrario", "Porque la panspermia la sustituyó"],
        respuesta_correcta: 1,
        retroalimentacion: "Pasteur demostró con sus matraces de cuello de cisne que los microorganismos provenían del aire, no surgían espontáneamente. Esto estableció el principio de biogénesis.",
      },
      {
        enunciado: "Los ventiladeros hidrotermales son atractivos como cuna de la vida porque:",
        opciones: ["Tienen mucho oxígeno libre", "Proveen gradientes de energía y minerales sin necesitar atmósfera reductora", "Están cerca de la superficie oceánica", "Emiten radiación ultravioleta"],
        respuesta_correcta: 1,
        retroalimentacion: "Los ventiladeros ofrecen gradientes de temperatura, pH y concentración de minerales que pueden impulsar reacciones prebióticas sin requerir la atmósfera reductora que se discute si existió en la Tierra primitiva.",
      },
    ],
  },
  { // P02 — quiz_multiple_opcion (Tipos de células y organelos)
    preguntas: [
      {
        enunciado: "¿Cuál es la principal diferencia entre una célula procariota y una eucariota?",
        opciones: ["La procariota tiene mitocondrias y la eucariota no", "La eucariota tiene núcleo definido con membrana nuclear; la procariota no", "La procariota tiene cloroplastos y la eucariota no", "La eucariota carece de membrana celular"],
        respuesta_correcta: 1,
        retroalimentacion: "La presencia de núcleo rodeado por membrana nuclear es la característica definitoria de las células eucariotas. Las procariotas tienen ADN circular en el nucleoide sin membrana que lo rodee.",
      },
      {
        enunciado: "¿Qué organelo produce la mayor parte del ATP en la célula eucariota?",
        opciones: ["Ribosoma", "Retículo endoplásmico", "Mitocondria", "Aparato de Golgi"],
        respuesta_correcta: 2,
        retroalimentacion: "La mitocondria es el sitio de la respiración aerobia y produce ~32-34 ATP por glucosa mediante la cadena transportadora de electrones y la ATP sintasa.",
      },
      {
        enunciado: "¿Qué evidencia apoya la teoría endosimbiótica de Lynn Margulis?",
        opciones: ["Las mitocondrias no tienen membrana propia", "Las mitocondrias tienen ADN propio y ribosomas 70S similares a los de bacterias", "El cloroplasto no puede reproducirse de forma independiente", "Las células procariotas no tienen pared celular"],
        respuesta_correcta: 1,
        retroalimentacion: "Las mitocondrias (y cloroplastos) tienen doble membrana, ADN circular propio y ribosomas 70S como las bacterias, lo que sugiere que fueron bacterias ancestrales incorporadas por endosimbiosis.",
      },
      {
        enunciado: "¿Cuál es la función principal del aparato de Golgi?",
        opciones: ["Síntesis de ATP", "Procesamiento, empaque y distribución de proteínas y lípidos", "Digestión intracelular de desechos", "Síntesis de ARN mensajero"],
        respuesta_correcta: 1,
        retroalimentacion: "El aparato de Golgi recibe vesículas del retículo endoplásmico, modifica y empaca las proteínas y lípidos, y los dirige a su destino final: membrana plasmática, lisosomas o secreción.",
      },
      {
        enunciado: "¿Qué organelo realizan exclusivamente las células vegetales y algunas algas?",
        opciones: ["Lisosoma", "Mitocondria", "Cloroplasto", "Vacuola pequeña"],
        respuesta_correcta: 2,
        retroalimentacion: "El cloroplasto es exclusivo de células vegetales y algas fotosintéticas; contiene clorofila y es el sitio de la fotosíntesis. Las mitocondrias están presentes en casi todas las células eucariotas.",
      },
    ],
  },
  { // P03 — ejercicio_matematico (ATP total respiración aerobia)
    problema: "Una célula lleva a cabo la respiración aerobia completa de 1 molécula de glucosa. La glucólisis produce 2 ATP netos. El ciclo de Krebs produce 2 ATP. La cadena transportadora de electrones produce 32 ATP. ¿Cuántos ATP se producen en total?",
    tipo_respuesta: "numerica" as const,
    respuesta_final: "36",
    unidades: "ATP",
    pasos_guia: [
      "Paso 1 — Glucólisis (citoplasma): 1 glucosa -> 2 piruvatos + 2 ATP netos + 2 NADH.",
      "Paso 2 — Ciclo de Krebs (mitocondria, matriz): 2 piruvatos -> CO2 + 2 ATP + 8 NADH + 2 FADH2.",
      "Paso 3 — Cadena transportadora de electrones (membrana interna mitocondrial): NADH y FADH2 ceden electrones; el gradiente de H+ impulsa la ATP sintasa produciendo 32 ATP.",
      "Paso 4 — Total: 2 + 2 + 32 = 36 ATP por molécula de glucosa.",
    ],
    retroalimentacion: "La respiración aerobia produce 36 ATP por glucosa. La cadena transportadora es responsable del 89% de ese total, lo que la hace la etapa más eficiente del proceso.",
  },
  { // P04 — quiz_verdadero_falso (ADN, ARN y proteínas)
    preguntas: [
      { enunciado: "El ADN se replica de forma semiconservativa: cada cadena original sirve de molde para una nueva cadena.", respuesta: true },
      { enunciado: "La transcripción produce una molécula de ADN a partir de una de ARN.", respuesta: false },
      { enunciado: "El ARN mensajero (ARNm) lleva la información genética del núcleo al ribosoma para la traducción.", respuesta: true },
      { enunciado: "El codón AUG codifica metionina y es el codón de inicio de la traducción.", respuesta: true },
      { enunciado: "Una mutación puntual silenciosa siempre cambia el aminoácido de la proteína resultante.", respuesta: false },
      { enunciado: "El ARN ribosómico (ARNr) forma parte de la estructura del ribosoma y cataliza la formación del enlace peptídico.", respuesta: true },
    ],
  },
  { // P05 — ejercicio_matematico (Cruce monohíbrido Aa×Aa)
    problema: "Cruza dos plantas heterocigotas para el carácter color de semilla (Aa × Aa). Usa el cuadro de Punnett para determinar la probabilidad de obtener descendencia homocigota recesiva (aa). Expresa la respuesta como porcentaje.",
    tipo_respuesta: "numerica" as const,
    respuesta_final: "25",
    unidades: "%",
    pasos_guia: [
      "Paso 1 — Gametos: cada progenitor Aa produce gametos A y a en igual proporción (50% cada uno).",
      "Paso 2 — Cuadro de Punnett: cruce Aa × Aa da cuatro combinaciones: AA (25%), Aa (25%), Aa (25%), aa (25%).",
      "Paso 3 — Contar homocigotos recesivos: solo la combinación aa es homocigota recesiva: 1 de 4 = 25%.",
      "Paso 4 — Proporción genotípica: 1 AA : 2 Aa : 1 aa. Proporción fenotípica: 3 dominante : 1 recesivo.",
    ],
    retroalimentacion: "El 25% de la descendencia sera aa (homocigota recesiva). Esto es la base de la Ley de Segregación de Mendel: los alelos se separan en los gametos y se recombinan al azar.",
  },
  { // P06 — quiz_multiple_opcion (Mutaciones y variabilidad genética)
    preguntas: [
      {
        enunciado: "¿Qué tipo de mutación génica desplaza el marco de lectura del ARNm?",
        opciones: ["Sustitución puntual silenciosa", "Inserción o deleción de un nucleótido", "Translocación cromosómica", "Inversión cromosómica"],
        respuesta_correcta: 1,
        retroalimentacion: "Las inserciones o deleciones de un nucleótido desplazan el marco de lectura (frameshift), alterando todos los codones posteriores y generalmente produciendo una proteína no funcional.",
      },
      {
        enunciado: "¿Cuál de los siguientes es un mutágeno físico?",
        opciones: ["Benzopireno del tabaco", "VPH (virus del papiloma humano)", "Radiación ultravioleta UV-B", "Formaldehído"],
        respuesta_correcta: 2,
        retroalimentacion: "La radiación UV-B es un mutágeno físico que causa dímeros de timina en el ADN. Los benzopirenos y el formaldehído son mutágenos químicos; el VPH es un mutágeno biológico.",
      },
      {
        enunciado: "Las mutaciones germinales se diferencian de las somáticas porque:",
        opciones: ["Son siempre dañinas y causan cáncer", "Ocurren en células reproductoras y pueden transmitirse a la descendencia", "Solo afectan a células musculares", "No alteran la secuencia del ADN"],
        respuesta_correcta: 1,
        retroalimentacion: "Las mutaciones germinales ocurren en gametos o células que los producen, por lo que pueden heredarse. Las somáticas afectan solo al individuo y no se transmiten.",
      },
      {
        enunciado: "¿Cuál es el papel de las mutaciones en la evolución?",
        opciones: ["Son siempre letales y eliminan especies", "Generan variabilidad genética sobre la que actúa la selección natural", "Solo afectan a individuos viejos", "Reducen la diversidad de alelos en la población"],
        respuesta_correcta: 1,
        retroalimentacion: "Las mutaciones son la fuente última de nuevos alelos. La mayor parte son neutras o ligeramente perjudiciales, pero ocasionalmente producen variantes ventajosas que la selección natural puede favorecer.",
      },
      {
        enunciado: "La trisomía 21 (síndrome de Down) es un ejemplo de:",
        opciones: ["Mutación génica puntual", "Mutación cromosómica por aneuploidía", "Mutación por inserción de nucleótido", "Mutación somática causada por UV"],
        respuesta_correcta: 1,
        retroalimentacion: "La trisomía 21 resulta de la no disyunción del cromosoma 21 durante la meiosis, produciendo una célula con tres copias del cromosoma 21. Es una mutación cromosómica numérica (aneuploidía).",
      },
    ],
  },
  { // P07 — simulacion (Selección natural en conejos)
    tipo_simulacion: "laboratorio" as const,
    nombre_simulacion: "Selección natural en poblaciones de conejos",
    descripcion: "El estudiante controla variables de una población de conejos con distinto color de pelaje en ambientes cambiantes y observa cómo la presión depredadora cambia las frecuencias alélicas a lo largo de generaciones.",
    parametros: {
      color_pelaje: { tipo: "seleccion", opciones: ["blanco", "cafe", "gris"], descripcion: "Color de pelaje inicial de la poblacion" },
      generaciones: { tipo: "number", min: 5, max: 50, descripcion: "Numero de generaciones a simular" },
      presion_depredadora: { tipo: "string", opciones: ["baja", "media", "alta"], descripcion: "Nivel de presion de depredadores en el ambiente" },
      ambiente: { tipo: "seleccion", opciones: ["pradera", "nieve", "bosque"], descripcion: "Tipo de ambiente que determina que color es ventajoso" },
    },
    resultados_esperados: [
      "En ambiente nevado con alta presion depredadora, la frecuencia del pelaje blanco aumenta mientras el cafe disminuye porque el blanco ofrece camuflaje.",
      "En pradera verde, el pelaje cafe o gris tiene ventaja y aumenta en frecuencia con el paso de las generaciones.",
      "Con presion depredadora baja, los cambios en frecuencias alélicas son lentos, mostrando que la seleccion actua sobre la variación existente.",
    ],
    preguntas_reflexion: [
      "¿Que le sucederia a la poblacion si el ambiente cambiara bruscamente de pradera a campo nevado?",
      "¿Por que la seleccion natural no puede crear variacion nueva, solo actuar sobre la existente?",
      "¿Como ilustra esta simulacion los cuatro postulados de Darwin?",
    ],
  },
  { // P08 — quiz_multiple_opcion (Bioética y biotecnología)
    preguntas: [
      {
        enunciado: "¿Cuál es el mecanismo de acción de CRISPR-Cas9?",
        opciones: ["Inserta genes al azar en el genoma usando virus", "Una ARN guía dirige la proteína Cas9 al sitio exacto del ADN para cortarlo", "Produce copias de ARNm para aumentar la expresión génica", "Elimina cromosomas completos de la célula"],
        respuesta_correcta: 1,
        retroalimentacion: "CRISPR-Cas9 usa una ARN guía complementaria al sitio diana del ADN. La Cas9 corta el ADN con precisión y la célula puede repararlo con o sin la secuencia deseada.",
      },
      {
        enunciado: "¿Por qué el maíz transgénico es tema de debate especial en México?",
        opciones: ["Porque México no produce maíz nativo", "Porque México es centro de origen y diversificación del maíz, y hay riesgo de contaminación del germoplasma nativo", "Porque el maíz OGM es ilegal en todo el mundo", "Porque el maíz Bt produce toxinas peligrosas para humanos"],
        respuesta_correcta: 1,
        retroalimentacion: "México es el centro de origen del maíz y alberga cientos de variedades nativas. La contaminación por flujo génico de variedades transgénicas amenaza esa biodiversidad y la soberanía alimentaria.",
      },
      {
        enunciado: "¿Cuál principio bioético obliga al médico a respetar la decision informada del paciente sobre su tratamiento?",
        opciones: ["No maleficencia", "Beneficencia", "Autonomia", "Justicia"],
        respuesta_correcta: 2,
        retroalimentacion: "El principio de autonomia establece que el paciente tiene derecho a tomar decisiones informadas sobre su propio cuerpo y tratamiento. El consentimiento informado es su expresion concreta.",
      },
      {
        enunciado: "¿Cuál es la diferencia entre clonacion reproductiva y clonacion terapéutica?",
        opciones: ["La reproductiva usa CRISPR y la terapéutica no", "La reproductiva busca crear un individuo completo; la terapéutica busca obtener células madre para tratar enfermedades", "La terapéutica esta prohibida en todos los paises", "No hay diferencia; son el mismo proceso"],
        respuesta_correcta: 1,
        retroalimentacion: "La clonacion reproductiva persigue generar un organismo completo geneticamente identico (como Dolly). La terapéutica usa embriones clonados solo para obtener células madre compatibles con un paciente, sin fines reproductivos.",
      },
      {
        enunciado: "¿Qué organismo regula en México el uso y liberacion de OGM al ambiente?",
        opciones: ["IMSS", "CIBIOGEM", "UNAM", "PEMEX"],
        respuesta_correcta: 1,
        retroalimentacion: "La CIBIOGEM (Comision Intersecretarial de Bioseguridad de los Organismos Geneticamente Modificados) es el organismo gubernamental mexicano que aplica el principio de precaucion y regula los OGM.",
      },
    ],
  },
];

// ── A3 ──────────────────────────────────────────────────────────────────────────
const contenidosA3 = [
  { // P01 — reflexion_escrita (Origen de la vida)
    prompt: "¿Cual hipótesis sobre el origen de la vida te parece más convincente y por qué? Analiza sus evidencias y limitaciones.",
    instrucciones: "Elige una hipotesis (caldo primordial, ventiladeros hidrotermales, Mundo ARN o panspermia) y argumenta tu postura con evidencias concretas. Reconoce también sus limitaciones.",
    longitud_minima_palabras: 100,
    pistas: [
      "¿Qué evidencias experimentales respaldan la hipotesis elegida?",
      "¿Que aspecto del origen de la vida no explica completamente?",
      "¿Por qué otras hipotesis te parecen menos convincentes?",
    ],
  },
  { // P02 — reflexion_escrita (Célula ideal)
    prompt: "Diseña mentalmente una célula optimizada para una función específica. ¿Qué organelos tendría en mayor cantidad? ¿Por qué?",
    instrucciones: "Elige una función (ej. secreción de enzimas, fotosintesis intensa, alta demanda energética) y justifica qué organelos serían más abundantes basándote en sus funciones reales.",
    longitud_minima_palabras: 80,
    pistas: [
      "¿Qué organelo produce energia? ¿Cuál sintetiza y exporta proteinas?",
      "¿Qué célula real del cuerpo ya cumple esa función al máximo?",
    ],
  },
  { // P03 — reflexion_escrita (Aerobia vs. fermentación)
    prompt: "Compara la eficiencia energetica de la respiracion aerobia y la fermentacion. ¿En qué situaciones usa cada proceso tu cuerpo?",
    instrucciones: "Usa los valores de ATP producidos por cada via para cuantificar la diferencia de eficiencia. Describe situaciones fisiologicas reales donde el cuerpo utiliza cada proceso.",
    longitud_minima_palabras: 80,
    pistas: [
      "¿Cuantos ATP produce cada via por molécula de glucosa?",
      "¿Qué pasa en tus musculos cuando haces ejercicio intenso y el oxigeno no alcanza?",
      "¿Por qué la levadura usa fermentacion para hacer pan y cerveza?",
    ],
  },
  { // P04 — reflexion_escrita (Dogma central)
    prompt: "Explica con tus palabras el dogma central de la biologia molecular. ¿Por qué es tan importante para entender la herencia y las enfermedades geneticas?",
    instrucciones: "Describe el flujo de informacion ADN -> ARN -> proteina y explica por qué una alteracion en cualquier punto puede causar enfermedad. Menciona un ejemplo concreto.",
    longitud_minima_palabras: 100,
    pistas: [
      "¿Qué ocurre si una mutacion en el ADN cambia un codón clave en el ARNm?",
      "¿Como se relaciona el dogma central con enfermedades geneticas como la anemia falciforme?",
      "¿Por qué el ARNm es importante en las vacunas contra COVID-19?",
    ],
  },
  { // P05 — reflexion_escrita (Daltonismo)
    prompt: "¿Por qué el daltonismo afecta más a hombres que a mujeres? Explica usando los conceptos de herencia ligada al sexo y cromosomas X e Y.",
    instrucciones: "Usa la notacion de herencia ligada al sexo (X^D, X^d) para explicar los genotipos posibles en hombres y mujeres. Calcula la probabilidad de que un hijo de una mujer portadora tenga daltonismo.",
    longitud_minima_palabras: 80,
    pistas: [
      "¿Cuántos cromosomas X tiene un hombre? ¿Y una mujer?",
      "Si una madre es portadora (X^D X^d) y el padre es normal (X^D Y), ¿qué genotipos son posibles en los hijos?",
    ],
  },
  { // P06 — debate_estructurado (Mutaciones: ¿error o motor?)
    tema: "¿Las mutaciones son principalmente un error del sistema genetico o el motor de la evolucion?",
    posturas: ["Las mutaciones son errores del sistema genetico que generalmente causan dano", "Las mutaciones son el motor de la evolucion y la fuente de variabilidad beneficiosa"],
    argumentos_guia: {
      "Las mutaciones son errores del sistema genetico que generalmente causan dano": [
        "La gran mayoria de las mutaciones puntuales son perjudiciales o neutras; solo una fraccion minima confiere ventaja adaptativa.",
        "Enfermedades como el cancer, la fibrosis quistica y las distrofias musculares son consecuencias directas de mutaciones, lo que evidencia su naturaleza danina.",
        "Los sistemas de reparacion del ADN (escision de nucleotidos, reparacion de errores de apareamiento) existen precisamente para corregir mutaciones, lo que sugiere que el organismo las trata como errores.",
      ],
      "Las mutaciones son el motor de la evolucion y la fuente de variabilidad beneficiosa": [
        "Sin mutaciones no habria variacion genetica y la seleccion natural no tendria material sobre el que actuar, haciendo imposible la evolucion adaptativa.",
        "Ejemplos como la resistencia a antibioticos en bacterias, la resistencia a la malaria en portadores del rasgo falciforme y la variacion de colores en polillas demuestran el valor adaptativo de las mutaciones.",
        "A escala geologica, las mutaciones acumuladas son la base de la especiacion y de la diversidad de la vida en la Tierra.",
      ],
    },
    reglas: [
      "Cada postura tiene 3 minutos para presentar sus argumentos iniciales.",
      "Se permiten réplicas de 2 minutos basadas en evidencia biologica, no en opinion personal.",
      "Las conclusiones deben integrar ambas perspectivas reconociendo que las mutaciones son fenomenos complejos con roles multiples.",
    ],
    tiempo_argumentacion_minutos: 15,
  },
  { // P07 — reflexion_escrita (Evidencia de la evolución)
    prompt: "¿Cuál consideras la evidencia más solida a favor de la evolucion por seleccion natural? ¿Por qué?",
    instrucciones: "Elige un tipo de evidencia (registro fosil, anatomia comparada, biogeografia o genomica comparada) y argumenta por qué la consideras la más convincente. Usa ejemplos concretos.",
    longitud_minima_palabras: 100,
    pistas: [
      "¿Qué nos dicen los fosiles de transicion como Tiktaalik o Archaeopteryx?",
      "¿Por qué el porcentaje de ADN compartido entre especies es evidencia de evolucion comun?",
      "¿Podria tu evidencia elegida convencer a alguien escéptico? ¿Por qué si o por qué no?",
    ],
  },
  { // P08 — debate_estructurado (CRISPR en embriones humanos)
    tema: "¿Debe permitirse el uso de CRISPR para modificar el genoma de embriones humanos?",
    posturas: ["Si debe permitirse bajo regulacion estricta para eliminar enfermedades geneticas graves", "No debe permitirse porque representa riesgos eticos y biologicos inaceptables"],
    argumentos_guia: {
      "Si debe permitirse bajo regulacion estricta para eliminar enfermedades geneticas graves": [
        "Podria eliminar enfermedades hereditarias devastadoras como la fibrosis quistica, la enfermedad de Huntington o la beta-talasemia antes del nacimiento, reduciendo el sufrimiento humano.",
        "Con regulacion adecuada y supervision etica, el uso terapeutico en embriones con mutaciones causantes de enfermedad es distinto de la eugenesia selectiva y puede hacerse con beneficencia y justicia.",
      ],
      "No debe permitirse porque representa riesgos eticos y biologicos inaceptables": [
        "Las modificaciones en embriones son hereditarias y afectan a todas las generaciones futuras sin su consentimiento, violando el principio de autonomia de individuos que aun no existen.",
        "El riesgo de efectos no deseados (off-target edits) en embriones es aun alto, y los errores podrian propagarse en la linea germinal con consecuencias impredecibles para la especie.",
      ],
    },
    reglas: [
      "Cada postura presenta sus argumentos en 4 minutos, citando evidencia cientifica o principios bioeticos.",
      "Se permiten réplicas de 2 minutos; se prohíben los argumentos de autoridad sin evidencia.",
      "El cierre de 3 minutos debe proponer un marco regulatorio que considere los riesgos y beneficios de ambas posturas.",
    ],
    tiempo_argumentacion_minutos: 20,
  },
];

main().catch((err) => { console.error("Error fatal:", err.message); process.exit(1); });
