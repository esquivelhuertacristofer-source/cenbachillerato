/**
 * Refuerzo de actividades para CNEYT-VI (Ciencias Naturales, Experimentales y Tecnología VI —
 * Biología: Organismos y evolución biológica) según la "Plantilla CEN por UAC".
 * Agrega A4-A7 a cada una de las 8 progresiones (ya tienen A1-A3):
 *   A4 = quiz_verdadero_falso · A5 = glosario_interactivo · A6 = fill_blanks · A7 = autoevaluacion
 * 8 progresiones × 4 = 32 actividades nuevas. estado='borrador'.
 * Alineado al programa oficial CNEYT-VI (MCCEMS 2025): origen de la vida, célula, metabolismo
 * celular, ADN y dogma central, herencia mendeliana y no mendeliana, mutaciones, evolución,
 * y ética en biotecnología (transgénicos, CRISPR, clonación).
 * Uso: npx tsx scripts/seed-activities-cneytvi-refuerzo.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad, type ActividadInput } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

type Refuerzo = Pick<ActividadInput, "titulo" | "descripcion" | "tipo" | "xp" | "contenido">;

const letras = ["A4", "A5", "A6", "A7"];

// Escala estándar de autoevaluación (1-4) reutilizada en todas las progresiones.
const escala4 = [
  { valor: 1, etiqueta: "En inicio", descripcion: "Todavía necesito apoyo y consultar el material." },
  { valor: 2, etiqueta: "En proceso", descripcion: "Lo logro con algunos errores o dudas." },
  { valor: 3, etiqueta: "Logrado", descripcion: "Lo hago bien de forma autónoma." },
  { valor: 4, etiqueta: "Destacado", descripcion: "Lo hago con seguridad y puedo ayudar a otra persona." },
];

async function main() {
  const sb = createSB();
  log("\n🌱 Refuerzo CNEYT-VI — Biología: Organismos y evolución biológica: A4-A7 por progresión\n");

  const progs = await getProgresionesDeUAC(sb, "CNEYT-VI");
  let ok = 0; let fail = 0;

  for (const p of progs) {
    const set = refuerzos[p.numero - 1];
    if (!set) { log(`⚠️  Sin refuerzos definidos para P${p.numero}`); continue; }
    for (let i = 0; i < set.length; i++) {
      const r = set[i];
      const res = await upsertActividad(sb, {
        codigo: `${p.codigo}-${letras[i]}`,
        titulo: r.titulo,
        descripcion: r.descripcion,
        tipo: r.tipo,
        progresion_id: p.id,
        xp: r.xp,
        contenido: r.contenido,
      });
      res ? ok++ : fail++;
    }
  }

  log(`\n✅ CNEYT-VI refuerzo: ${ok} actividades insertadas, ${fail} fallidas.\n`);
}

// ── REFUERZOS POR PROGRESIÓN ───────────────────────────────────────────────────

const refuerzos: Refuerzo[][] = [
  // ════════════ P01 — Hipótesis sobre el origen de la vida ════════════
  [
    {
      titulo: "Verdadero o Falso — Origen de la vida en la Tierra",
      descripcion: "Decide si cada afirmación sobre las hipótesis del origen de la vida, la atmósfera primitiva y el experimento de Miller-Urey es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "La hipótesis de Oparin-Haldane propone que las primeras moléculas orgánicas se formaron en una atmósfera reductora primitiva (sin oxígeno libre) mediante reacciones químicas abióticas.",
            respuesta: true,
            retroalimentacion: "Correcto. Oparin y Haldane postularon de forma independiente en la década de 1920 que la Tierra primitiva tenía una atmósfera anóxica (sin O₂) rica en H₂, CH₄, NH₃ y vapor de agua, donde la energía de rayos y volcanes impulsó la síntesis de moléculas orgánicas.",
          },
          {
            enunciado: "El experimento de Miller-Urey (1953) demostró que las proteínas se forman espontáneamente en condiciones primitivas, produciendo directamente seres vivos.",
            respuesta: false,
            retroalimentacion: "Falso. Miller y Urey produjeron aminoácidos y otras moléculas orgánicas a partir de gases simples (CH₄, NH₃, H₂, H₂O) y descargas eléctricas, pero no produjeron proteínas completas ni seres vivos; demostraron que los precursores orgánicos pueden formarse abioticamente.",
          },
          {
            enunciado: "La hipótesis de la panspermia sugiere que las semillas de la vida llegaron a la Tierra desde el espacio en meteoritos o cometas.",
            respuesta: true,
            retroalimentacion: "Correcto. La panspermia propone que moléculas orgánicas o incluso microorganismos viajaron a través del espacio y colonizaron la Tierra, apoyada por el hallazgo de aminoácidos en meteoritos como el de Murchison.",
          },
          {
            enunciado: "Los coacervados descritos por Oparin son burbujas lipídicas que poseen ya un metabolismo completo y una membrana celular igual a la de las células modernas.",
            respuesta: false,
            retroalimentacion: "Falso. Los coacervados son agregados coloidales de macromoléculas rodeados de agua; son modelos sencillos de protocélulas que concentran moléculas orgánicas pero no poseen el metabolismo complejo ni la bicapa lipídica sofisticada de las células actuales.",
          },
          {
            enunciado: "La existencia de ribozimas (ARN con actividad catalítica) apoya la hipótesis del 'mundo de ARN', que postula que el ARN fue la primera molécula capaz de almacenar información y catalizar reacciones.",
            respuesta: true,
            retroalimentacion: "Correcto. Las ribozimas son ARN catalíticos descubiertos por Thomas Cech y Sidney Altman. Su existencia sustenta la hipótesis del mundo de ARN: antes de la división entre ADN (almacenamiento) y proteínas (catálisis), el ARN pudo haber cumplido ambas funciones.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Origen de la vida e hipótesis abióticas",
      descripcion: "Glosario interactivo de los conceptos fundamentales relacionados con las hipótesis sobre el origen de la vida: abiótico, protocélula, mundo ARN y experimento de Miller-Urey.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Generación espontánea (refutada)",
            definicion: "Teoría antigua que afirmaba que los seres vivos podían surgir directamente de materia inerte sin progenitores. Refutada definitivamente por Louis Pasteur en 1859 con sus matraces de cuello de cisne.",
            ejemplo: "La creencia de que los ratones surgían de la paja húmeda fue desacreditada por Redi (1668) y confirmada experimentalmente por Pasteur.",
            etiquetas: ["historia", "abiogénesis", "Pasteur"],
          },
          {
            termino: "Hipótesis de Oparin-Haldane (sopa primordial)",
            definicion: "Propone que en la Tierra primitiva (hace ~4000 millones de años), la atmósfera sin oxígeno libre y con H₂, CH₄, NH₃ y H₂O permitió la síntesis abiótica de moléculas orgánicas que se acumularon en los océanos formando una 'sopa primordial'.",
            ejemplo: "Aminoácidos, azúcares y bases nitrogenadas pudieron formarse a partir de moléculas simples impulsadas por la energía de relámpagos, luz UV y calor volcánico.",
            etiquetas: ["Oparin", "Haldane", "sopa primordial", "abiogénesis"],
          },
          {
            termino: "Experimento de Miller-Urey (1953)",
            definicion: "Stanley Miller y Harold Urey simularon la atmósfera primitiva (CH₄, NH₃, H₂, H₂O) y aplicaron descargas eléctricas. Tras una semana obtuvieron más de 20 aminoácidos distintos, confirmando la síntesis abiótica de moléculas orgánicas.",
            ejemplo: "El experimento produjo glicina, alanina, ácido aspártico y otros aminoácidos sin ninguna célula presente, solo reacciones químicas.",
            etiquetas: ["Miller", "Urey", "aminoácidos", "experimento"],
          },
          {
            termino: "Coacervados y protocélulas",
            definicion: "Los coacervados son agregados esféricos de polímeros en solución acuosa que pueden concentrar moléculas y llevar a cabo reacciones sencillas. Representan un modelo de protocélula: estructura precelular que precedió a las células verdaderas.",
            ejemplo: "Los liposomas (vesículas de fosfolípidos en agua) también son modelos de protocélulas ya que forman espontáneamente dobles membranas lipídicas.",
            etiquetas: ["coacervados", "protocélula", "Oparin"],
          },
          {
            termino: "Hipótesis del mundo de ARN",
            definicion: "Postula que en el origen de la vida el ARN actuó tanto como molécula de almacenamiento de información (como el ADN hoy) y como catalizador (como las proteínas). Las ribozimas (ARN catalítico) son evidencia de esa capacidad dual.",
            ejemplo: "El ARN ribosomal (ARNr) es catalíticamente activo: el ribosoma usa ARNr para catalizar la formación de enlaces peptídicos en la traducción.",
            etiquetas: ["ARN", "ribozima", "mundo ARN"],
          },
          {
            termino: "Panspermia",
            definicion: "Hipótesis que propone que la vida o sus precursores orgánicos llegaron a la Tierra desde el espacio exterior a través de meteoritos, cometas o polvo cósmico. No explica el origen último de la vida, solo su llegada.",
            ejemplo: "En el meteorito Murchison (caído en Australia en 1969) se encontraron más de 70 aminoácidos distintos de origen extraterrestre, incluyendo varios presentes en los seres vivos.",
            etiquetas: ["panspermia", "meteorito", "extraterrestre"],
          },
        ],
        actividad_final: "Compara las hipótesis de Oparin-Haldane, el mundo de ARN y la panspermia: ¿qué evidencia apoya a cada una y cuál consideras más consistente con los datos actuales? Escribe un párrafo argumentativo.",
      },
    },
    {
      titulo: "Completa los espacios — Origen de la vida",
      descripcion: "Completa los conceptos clave sobre las hipótesis del origen de la vida y el experimento de Miller-Urey.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el término o valor correcto.",
        texto_con_huecos: "La hipótesis de ___ y Haldane propone que la vida surgió en una atmósfera primitiva sin oxígeno libre. El experimento de Miller-Urey produjo ___ a partir de gases simples y descargas eléctricas. Los ___ son agregados esféricos de polímeros que sirven como modelo de protocélula. La hipótesis del mundo de ___ postula que esta molécula actuó como almacenadora de información y catalizadora antes del surgimiento del ADN.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "Oparin",
            alternativas_aceptadas: ["oparin"],
            pista: "Científico ruso que propuso en 1924 la síntesis abiótica de moléculas orgánicas en la atmósfera primitiva.",
          },
          {
            posicion: 1,
            respuesta_correcta: "aminoácidos",
            alternativas_aceptadas: ["aminoacidos"],
            pista: "Los monómeros fundamentales de las proteínas; más de 20 tipos distintos se obtuvieron en el experimento.",
          },
          {
            posicion: 2,
            respuesta_correcta: "coacervados",
            alternativas_aceptadas: [],
            pista: "Estructuras esféricas de polímeros en solución acuosa, propuestas por Oparin como precursoras de las células.",
          },
          {
            posicion: 3,
            respuesta_correcta: "ARN",
            alternativas_aceptadas: ["arn"],
            pista: "Molécula que puede tanto almacenar información genética como catalizar reacciones; las ribozimas son ARN con actividad catalítica.",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Hipótesis sobre el origen de la vida",
      descripcion: "Reflexiona sobre tu comprensión de las principales hipótesis que explican el origen de la vida en la Tierra.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio. Esto te ayudará a identificar qué reforzar.",
        criterios: [
          { descripcion: "Explico por qué la generación espontánea fue refutada y qué experimentos lo demostraron.", escala: escala4 },
          { descripcion: "Describo la hipótesis de Oparin-Haldane y las condiciones de la Tierra primitiva que la sustentan.", escala: escala4 },
          { descripcion: "Explico el diseño y los resultados del experimento de Miller-Urey y su significado para el origen de la vida.", escala: escala4 },
          { descripcion: "Distingo las hipótesis del mundo de ARN y la panspermia, y puedo mencionar evidencia que apoya a cada una.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Por qué ninguna hipótesis sobre el origen de la vida puede considerarse aún una teoría completamente probada? ¿Qué tipo de evidencia adicional necesitaríamos para mayor certeza?",
      },
    },
  ],

  // ════════════ P02 — Célula procariota y eucariota: organelos y funciones ════════════
  [
    {
      titulo: "Verdadero o Falso — Célula procariota y eucariota",
      descripcion: "Decide si cada afirmación sobre las diferencias entre células procariotas y eucariotas, sus organelos y funciones es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "Las células procariotas carecen de núcleo definido por membrana: su material genético se localiza en una región llamada nucleoide.",
            respuesta: true,
            retroalimentacion: "Correcto. Las células procariotas (bacterias y arqueas) no poseen envoltura nuclear; el ADN se concentra en el nucleoide, una región sin membrana propia.",
          },
          {
            enunciado: "Las mitocondrias presentes en las células eucariotas son los organelos donde se realiza la fotosíntesis.",
            respuesta: false,
            retroalimentacion: "Falso. La fotosíntesis ocurre en los cloroplastos (solo en células vegetales y algas). Las mitocondrias son el sitio de la respiración celular aerobia y la producción de la mayor parte del ATP.",
          },
          {
            enunciado: "La teoría endosimbiótica propone que mitocondrias y cloroplastos fueron originalmente bacterias independientes que se integraron simbioticamente a células huéspedes, dando origen a los organelos eucariotas.",
            respuesta: true,
            retroalimentacion: "Correcto. Lynn Margulis propuso la teoría endosimbiótica, respaldada por el hecho de que mitocondrias y cloroplastos tienen su propio ADN circular, ribosomas 70S y se dividen por fisión binaria, igual que las bacterias.",
          },
          {
            enunciado: "El retículo endoplasmático rugoso (RER) recibe ese nombre porque está tapizado de ribosomas; su función principal es la síntesis y procesamiento de proteínas que serán secretadas o insertas en membranas.",
            respuesta: true,
            retroalimentacion: "Correcto. Los ribosomas asociados al RER sintetizan proteínas que ingresan a la luz del retículo para su plegamiento, modificación y posterior transporte al aparato de Golgi.",
          },
          {
            enunciado: "Las células procariotas poseen ribosomas de tipo 80S, al igual que las eucariotas.",
            respuesta: false,
            retroalimentacion: "Falso. Las células procariotas tienen ribosomas 70S (subunidades 30S y 50S). Las eucariotas tienen ribosomas 80S (subunidades 40S y 60S) en el citoplasma; los de mitocondrias y cloroplastos son 70S, otro argumento a favor de la endosimbiosis.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Organelos celulares y sus funciones",
      descripcion: "Glosario interactivo de los principales organelos de las células eucariotas y las estructuras características de las células procariotas.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Núcleo celular",
            definicion: "Organelo rodeado por la envoltura nuclear (doble membrana con poros). Contiene el ADN genómico organizado en cromosomas y es el sitio de la replicación del ADN y la transcripción del ARN.",
            ejemplo: "En una célula humana, el núcleo contiene 46 cromosomas (23 pares homólogos) con toda la información genética del individuo.",
            etiquetas: ["núcleo", "eucariota", "ADN"],
          },
          {
            termino: "Mitocondria",
            definicion: "Organelo con doble membrana (externa lisa e interna plegada en crestas) donde se lleva a cabo la respiración celular aerobia. Produce la mayor parte del ATP celular mediante la cadena de transporte de electrones.",
            ejemplo: "Una célula muscular activa puede tener miles de mitocondrias para satisfacer su alta demanda energética durante el ejercicio.",
            etiquetas: ["mitocondria", "ATP", "respiración"],
          },
          {
            termino: "Cloroplasto",
            definicion: "Organelo exclusivo de células vegetales y algas con doble membrana y un sistema interno de tilacoides apilados (grana) en el estroma. Es el sitio de la fotosíntesis: convierte luz solar, CO₂ y H₂O en glucosa y O₂.",
            ejemplo: "Las hojas verdes contienen cloroplastos con clorofila que absorbe luz roja y azul; la luz verde es reflejada, por eso las plantas se ven verdes.",
            etiquetas: ["cloroplasto", "fotosíntesis", "vegetal"],
          },
          {
            termino: "Retículo endoplasmático (RE)",
            definicion: "Red de membranas continua con el núcleo. El RE rugoso (con ribosomas) sintetiza y procesa proteínas de secreción o de membrana. El RE liso (sin ribosomas) sintetiza lípidos y desintoxica compuestos.",
            ejemplo: "Las células del páncreas que secretan enzimas digestivas tienen un RE rugoso muy desarrollado.",
            etiquetas: ["retículo endoplasmático", "proteínas", "lípidos"],
          },
          {
            termino: "Aparato de Golgi",
            definicion: "Sistema de sacos membranosos apilados (cisternas) que recibe proteínas del RE, las modifica (glucosilación, corte), clasifica y empaqueta en vesículas para enviarlas a su destino: membrana plasmática, lisosomas o secreción.",
            ejemplo: "El aparato de Golgi procesa las proteínas de anticuerpos en los linfocitos B y las empaqueta para su secreción.",
            etiquetas: ["Golgi", "secreción", "vesículas"],
          },
          {
            termino: "Diferencias clave procariota vs eucariota",
            definicion: "Procariota: sin núcleo membranoso, ADN circular en nucleoide, ribosomas 70S, sin organelos membranosos, tamaño ~1-10 µm. Eucariota: núcleo con envoltura nuclear, ADN lineal en cromosomas, ribosomas 80S, organelos especializados, tamaño ~10-100 µm.",
            ejemplo: "Escherichia coli (bacteria) es procariota; una célula hepática humana (hepatocito) es eucariota con núcleo, mitocondrias, RE y Golgi bien desarrollados.",
            etiquetas: ["procariota", "eucariota", "comparación"],
          },
        ],
        actividad_final: "Dibuja o describe por escrito un cuadro comparativo con al menos 5 características que diferencien a las células procariota y eucariota, e indica dónde se localiza cada función: síntesis de proteínas, producción de ATP, almacenamiento de ADN, fotosíntesis.",
      },
    },
    {
      titulo: "Completa los espacios — Células procariota y eucariota",
      descripcion: "Completa los conceptos clave sobre la estructura y organelos de las células procariota y eucariota.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el término correcto.",
        texto_con_huecos: "Las células procariotas no tienen ___ definido por membrana; su ADN se encuentra en una región llamada nucleoide. La fotosíntesis se realiza en el ___ , organelo exclusivo de las células vegetales y algas. Los ribosomas de las células procariotas son de tipo ___ S, mientras que los del citoplasma eucariota son 80S. La teoría ___ propone que las mitocondrias y cloroplastos fueron bacterias que se integraron simbioticamente a células huéspedes.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "núcleo",
            alternativas_aceptadas: ["nucleo"],
            pista: "Organelo rodeado por envoltura nuclear que contiene el ADN; ausente en bacterias y arqueas.",
          },
          {
            posicion: 1,
            respuesta_correcta: "cloroplasto",
            alternativas_aceptadas: [],
            pista: "Organelo con tilacoides y clorofila donde la energía solar se convierte en glucosa.",
          },
          {
            posicion: 2,
            respuesta_correcta: "70",
            alternativas_aceptadas: [],
            pista: "Los ribosomas procariotas tienen un coeficiente de sedimentación de ___S (subunidades 30S y 50S).",
          },
          {
            posicion: 3,
            respuesta_correcta: "endosimbiótica",
            alternativas_aceptadas: ["endosimbiosis"],
            pista: "Teoría propuesta por Lynn Margulis que explica el origen de mitocondrias y cloroplastos a partir de bacterias ancestrales.",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Célula procariota y eucariota",
      descripcion: "Reflexiona sobre tu comprensión de las estructuras celulares, los organelos y sus funciones.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Identifico las diferencias estructurales fundamentales entre células procariota y eucariota (núcleo, ribosomas, organelos).", escala: escala4 },
          { descripcion: "Describo la función de los organelos principales: mitocondria, cloroplasto, RE rugoso y liso, aparato de Golgi, lisosoma.", escala: escala4 },
          { descripcion: "Explico la teoría endosimbiótica y las evidencias que la sustentan (ADN propio, ribosomas 70S, fisión binaria).", escala: escala4 },
          { descripcion: "Relaciono cada organelo con el proceso celular que realiza y puedo dar un ejemplo de célula especializada para cada función.", escala: escala4 },
        ],
        reflexion_final_prompt: "Si pudieras observar una célula con microscopio electrónico, ¿qué características usarías para determinar si es procariota o eucariota? ¿Y para saber si es vegetal o animal?",
      },
    },
  ],

  // ════════════ P03 — Metabolismo celular: respiración y fotosíntesis ════════════
  [
    {
      titulo: "Verdadero o Falso — Respiración celular y fotosíntesis",
      descripcion: "Decide si cada afirmación sobre la respiración celular aerobia (glucólisis, ciclo de Krebs, cadena de transporte de electrones) y la fotosíntesis (fase lumínica y ciclo de Calvin) es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "La glucólisis ocurre en el citoplasma de la célula y convierte una molécula de glucosa (6C) en dos moléculas de piruvato (3C), produciendo una ganancia neta de 2 ATP y 2 NADH.",
            respuesta: true,
            retroalimentacion: "Correcto. La glucólisis es la primera etapa de la respiración celular, ocurre en el citosol, no requiere oxígeno y produce 2 piruvatos, 2 ATP netos y 2 NADH a partir de cada glucosa.",
          },
          {
            enunciado: "El ciclo de Krebs ocurre en la membrana interna de la mitocondria y produce directamente la mayor parte del ATP celular.",
            respuesta: false,
            retroalimentacion: "Falso. El ciclo de Krebs ocurre en la matriz mitocondrial y produce principalmente NADH y FADH₂ (portadores de electrones), además de 2 ATP por glucosa. La mayor parte del ATP se genera en la cadena de transporte de electrones (fosforilación oxidativa) en la membrana interna.",
          },
          {
            enunciado: "La respiración celular aerobia completa de una molécula de glucosa produce aproximadamente 36-38 moléculas de ATP.",
            respuesta: true,
            retroalimentacion: "Correcto. La glucólisis aporta ~2 ATP netos, el ciclo de Krebs ~2 ATP, y la cadena de transporte de electrones ~32-34 ATP, sumando un total de ~36-38 ATP por molécula de glucosa. El número exacto varía según la eficiencia de transporte del NADH citosólico.",
          },
          {
            enunciado: "En la fase lumínica de la fotosíntesis, el CO₂ se fija mediante el ciclo de Calvin, produciéndose glucosa directamente en los tilacoides.",
            respuesta: false,
            retroalimentacion: "Falso. La fase lumínica ocurre en los tilacoides y produce ATP, NADPH y O₂ (liberado al oxidar el agua). La fijación del CO₂ y la síntesis de azúcares ocurre en el estroma del cloroplasto durante el ciclo de Calvin (fase oscura).",
          },
          {
            enunciado: "La fermentación láctica es una forma de respiración anaeróbica que regenera el NAD⁺ oxidando el piruvato a ácido láctico, permitiendo que la glucólisis continúe sin oxígeno.",
            respuesta: true,
            retroalimentacion: "Correcto. En ausencia de oxígeno, el piruvato se reduce a lactato (fermentación láctica) o a etanol + CO₂ (fermentación alcohólica). Ambas regeneran NAD⁺ para que la glucólisis pueda continuar produciendo ATP.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Metabolismo celular: respiración y fotosíntesis",
      descripcion: "Glosario interactivo de los procesos metabólicos celulares: glucólisis, ciclo de Krebs, cadena de electrones, fotosíntesis (fases lumínica y de Calvin).",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Glucólisis",
            definicion: "Primera etapa de la respiración celular. Ocurre en el citosol. Convierte 1 glucosa (6C) en 2 piruvatos (3C) con ganancia neta de 2 ATP y 2 NADH. No requiere oxígeno; es la única vía energética en anaerobios estrictos.",
            ejemplo: "Los eritrocitos (glóbulos rojos) carecen de mitocondrias y obtienen toda su energía solo de la glucólisis.",
            etiquetas: ["glucólisis", "ATP", "piruvato", "citosol"],
          },
          {
            termino: "Ciclo de Krebs (ciclo del ácido cítrico)",
            definicion: "Segunda etapa de la respiración aerobia. Ocurre en la matriz mitocondrial. El piruvato se convierte en acetil-CoA (2C) que ingresa al ciclo, produciendo por cada vuelta: 3 NADH, 1 FADH₂, 1 GTP (≈1 ATP) y 2 CO₂. Por glucosa: 2 vueltas = 6 NADH, 2 FADH₂, 2 ATP y 4 CO₂.",
            ejemplo: "El CO₂ que exhalamos proviene principalmente del ciclo de Krebs durante la oxidación del acetil-CoA.",
            etiquetas: ["Krebs", "NADH", "FADH₂", "mitocondria"],
          },
          {
            termino: "Cadena de transporte de electrones y fosforilación oxidativa",
            definicion: "Tercera etapa. Ocurre en la membrana interna mitocondrial. Los electrones de NADH y FADH₂ pasan por proteínas (complejos I-IV) que bombean H⁺ al espacio intermembranoso. El flujo de H⁺ de regreso a través de la ATP sintasa genera ~32-34 ATP. El O₂ es el aceptor final de electrones, formando H₂O.",
            ejemplo: "Cada NADH produce ~2.5 ATP y cada FADH₂ ~1.5 ATP al ceder sus electrones a la cadena.",
            etiquetas: ["cadena de electrones", "ATP sintasa", "fosforilación oxidativa"],
          },
          {
            termino: "Fase lumínica de la fotosíntesis",
            definicion: "Ocurre en las membranas de los tilacoides del cloroplasto. La luz solar excita la clorofila; los fotosistemas II y I captan fotones. El agua se fotoliza (H₂O → O₂ + H⁺ + e⁻) y los electrones energizados generan ATP (fotofosforilación) y NADPH. El O₂ se libera.",
            ejemplo: "El oxígeno que respiramos es subproducto de la fotólisis del agua durante la fase lumínica de la fotosíntesis en plantas y algas.",
            etiquetas: ["fase lumínica", "clorofila", "fotólisis", "ATP", "NADPH"],
          },
          {
            termino: "Ciclo de Calvin (fase oscura / fase de fijación de CO₂)",
            definicion: "Ocurre en el estroma del cloroplasto. Usa el ATP y NADPH de la fase lumínica. La enzima RuBisCO fija CO₂ en la ribulosa 1,5-bisfosfato (RuBP) (5C). Por cada 3 CO₂ fijados se produce 1 gliceraldehído-3-fosfato (G3P), precursor de glucosa y otros azúcares.",
            ejemplo: "Para sintetizar 1 molécula de glucosa se necesitan 6 vueltas del ciclo de Calvin, consumiendo 18 ATP y 12 NADPH.",
            etiquetas: ["ciclo de Calvin", "CO₂", "RuBisCO", "glucosa"],
          },
          {
            termino: "Fermentación",
            definicion: "Proceso anaeróbico que regenera el NAD⁺ a partir del NADH para que la glucólisis continúe. Fermentación láctica: piruvato → lactato (músculo, bacterias lácticas). Fermentación alcohólica: piruvato → etanol + CO₂ (levaduras). Solo produce 2 ATP por glucosa.",
            ejemplo: "El pan y la cerveza utilizan la fermentación alcohólica de levaduras (Saccharomyces cerevisiae); el yogur aprovecha la fermentación láctica de bacterias.",
            etiquetas: ["fermentación", "anaerobia", "lactato", "etanol"],
          },
        ],
        actividad_final: "Compara la respiración celular aerobia y la fotosíntesis: indica en qué organelo ocurre cada proceso, qué materias primas consume, qué productos genera y en qué sentido se relacionan ambos ciclos en un ecosistema.",
      },
    },
    {
      titulo: "Completa los espacios — Respiración celular y fotosíntesis",
      descripcion: "Completa los datos clave sobre los procesos de metabolismo celular: glucólisis, ciclo de Krebs y fotosíntesis.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el término o valor correcto.",
        texto_con_huecos: "La glucólisis produce una ganancia neta de ___ ATP por molécula de glucosa. El ciclo de Krebs ocurre en la ___ mitocondrial y produce NADH, FADH₂ y CO₂. La respiración aerobia completa produce aproximadamente ___ ATP por glucosa. En la fotosíntesis, la fase lumínica ocurre en los ___ y produce ATP, NADPH y O₂.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "2",
            alternativas_aceptadas: ["dos"],
            pista: "La glucólisis invierte 2 ATP y produce 4 ATP, con una ganancia neta de ___ ATP.",
          },
          {
            posicion: 1,
            respuesta_correcta: "matriz",
            alternativas_aceptadas: [],
            pista: "La región central interna de la mitocondria (sin membrana) donde ocurre el ciclo de Krebs se llama ___.",
          },
          {
            posicion: 2,
            respuesta_correcta: "36",
            alternativas_aceptadas: ["38", "36-38", "36 a 38"],
            pista: "Glucólisis (~2) + Krebs (~2) + Cadena de electrones (~32-34) = aproximadamente ___ ATP.",
          },
          {
            posicion: 3,
            respuesta_correcta: "tilacoides",
            alternativas_aceptadas: ["tilacoide"],
            pista: "Membranas internas apiladas del cloroplasto (organizadas en grana) donde se captura la energía luminosa.",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Metabolismo celular",
      descripcion: "Reflexiona sobre tu comprensión de la respiración celular aerobia y la fotosíntesis a nivel molecular.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Describo las tres etapas de la respiración aerobia (glucólisis, Krebs, cadena de electrones), su localización y sus productos principales.", escala: escala4 },
          { descripcion: "Explico cómo se producen aproximadamente 36-38 ATP por glucosa y la función del oxígeno como aceptor final de electrones.", escala: escala4 },
          { descripcion: "Diferencio la fase lumínica (tilacoides: produce ATP, NADPH, O₂) de la fase oscura/ciclo de Calvin (estroma: fija CO₂ y produce glucosa).", escala: escala4 },
          { descripcion: "Relaciono la respiración celular y la fotosíntesis como procesos complementarios en el ciclo del carbono y el flujo de energía en los ecosistemas.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Por qué se dice que la respiración celular es el proceso 'inverso' a la fotosíntesis? ¿Es una afirmación completamente correcta? Argumenta tu respuesta.",
      },
    },
  ],

  // ════════════ P04 — ADN: estructura, replicación, transcripción y traducción ════════════
  [
    {
      titulo: "Verdadero o Falso — Estructura del ADN y dogma central",
      descripcion: "Decide si cada afirmación sobre la estructura de doble hélice del ADN, la complementariedad de bases y los mecanismos del dogma central (replicación, transcripción, traducción) es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "En la doble hélice del ADN, la adenina (A) se empareja con la timina (T) mediante 2 puentes de hidrógeno, y la guanina (G) con la citosina (C) mediante 3 puentes de hidrógeno.",
            respuesta: true,
            retroalimentacion: "Correcto. La complementariedad de bases A-T (2 puentes H) y G-C (3 puentes H) fue parte del modelo de doble hélice propuesto por Watson y Crick en 1953, basado en los datos de difracción de rayos X de Rosalind Franklin.",
          },
          {
            enunciado: "Las dos cadenas de la doble hélice del ADN son paralelas: ambas corren en dirección 5'→3'.",
            respuesta: false,
            retroalimentacion: "Falso. Las cadenas de la doble hélice son antiparalelas: una corre en dirección 5'→3' y la otra en dirección 3'→5'. Esta antiparalelismo es esencial para la replicación y la transcripción.",
          },
          {
            enunciado: "La replicación del ADN es semiconservativa: cada nueva doble hélice conserva una cadena parental y sintetiza una cadena nueva complementaria.",
            respuesta: true,
            retroalimentacion: "Correcto. El experimento de Meselson-Stahl (1958) confirmó el modelo semiconservativo: después de cada ronda de replicación, cada molécula hija contiene una cadena original y una cadena recién sintetizada.",
          },
          {
            enunciado: "En la transcripción, el ARN mensajero (ARNm) se sintetiza en el ribosoma a partir del ARN de transferencia (ARNt).",
            respuesta: false,
            retroalimentacion: "Falso. En la transcripción, la ARN polimerasa sintetiza el ARNm usando el ADN como molde en el núcleo. Los ribosomas son el lugar de la traducción, donde el ARNm sirve de molde y los ARNt llevan los aminoácidos.",
          },
          {
            enunciado: "En la traducción, cada codón del ARNm (triplete de bases) codifica para un aminoácido específico, y el codón AUG (metionina) sirve como codón de inicio.",
            respuesta: true,
            retroalimentacion: "Correcto. El código genético es un lenguaje de tripletes: los 64 codones posibles codifican 20 aminoácidos (código degenerado) más codones de parada (UAA, UAG, UGA). AUG es el codón de inicio universal.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — ADN, replicación, transcripción y traducción",
      descripcion: "Glosario interactivo sobre la estructura del ADN y los mecanismos del dogma central de la biología molecular: replicación, transcripción y traducción.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Estructura de la doble hélice del ADN",
            definicion: "El ADN es un polímero de desoxirribonucleótidos formado por dos cadenas antiparalelas enrolladas en hélice. Las bases nitrogenadas (A, T, G, C) se complementan: A-T (2 H) y G-C (3 H). El esqueleto exterior es de fosfato-desoxirribosa.",
            ejemplo: "Si una cadena tiene la secuencia 5'-AATGCC-3', la cadena complementaria antiparalela es 3'-TTACGG-5'.",
            etiquetas: ["ADN", "doble hélice", "Watson-Crick", "bases nitrogenadas"],
          },
          {
            termino: "Replicación del ADN (semiconservativa)",
            definicion: "Proceso por el cual el ADN se duplica antes de la división celular. La ADN helicasa separa las cadenas; la ADN polimerasa III sintetiza la nueva cadena en dirección 5'→3' usando cada cadena como molde. Resultado: dos moléculas hijas idénticas, cada una con una cadena parental.",
            ejemplo: "La replicación ocurre en múltiples orígenes simultáneamente en eucariotas (horquillas de replicación) para copiar eficientemente los ~3000 millones de pares de bases del genoma humano.",
            etiquetas: ["replicación", "ADN polimerasa", "semiconservativa"],
          },
          {
            termino: "Transcripción",
            definicion: "Síntesis de ARNm a partir del ADN. La ARN polimerasa se une al promotor, separa el ADN y sintetiza el ARNm complementario en dirección 5'→3'. En eucariotas ocurre en el núcleo; el ARNm se procesa (capuchón 5', cola poli-A, eliminación de intrones) antes de salir al citoplasma.",
            ejemplo: "Si el molde de ADN es 3'-TACGGG-5', el ARNm transcrito será 5'-AUGCCC-3'.",
            etiquetas: ["transcripción", "ARNm", "ARN polimerasa", "promotor"],
          },
          {
            termino: "Código genético y codones",
            definicion: "Lenguaje de tripletes de bases del ARNm que codifican aminoácidos. 64 codones posibles (4³) codifican 20 aminoácidos más 3 codones de parada. Es universal (mismo en casi todos los seres vivos), degenerado (varios codones por aminoácido) y sin solapamiento.",
            ejemplo: "AUG = metionina (inicio). UUU y UUC = fenilalanina. UAA, UAG, UGA = codones de parada (no codifican aminoácido).",
            etiquetas: ["código genético", "codón", "triplete", "universal"],
          },
          {
            termino: "Traducción",
            definicion: "Síntesis de proteínas en el ribosoma usando el ARNm como molde. Los ARNt (con anticodón complementario al codón) llevan aminoácidos específicos. El ribosoma cataliza la formación de enlaces peptídicos. Termina al encontrar un codón de parada.",
            ejemplo: "En la síntesis de insulina, el ARNm del gen de insulina es traducido en el RE rugoso: el ribosoma lee codón a codón y une aminoácidos formando la cadena polipeptídica de la preproinsulina.",
            etiquetas: ["traducción", "ribosoma", "ARNt", "proteína"],
          },
          {
            termino: "Dogma central de la biología molecular",
            definicion: "Flujo de información genética propuesto por Francis Crick (1958): ADN → ARN → Proteína. La replicación reproduce el ADN; la transcripción produce ARN; la traducción produce proteínas. Las retrovirus (VIH) añaden transcripción inversa: ARN → ADN.",
            ejemplo: "El dogma central explica cómo un gen (secuencia de ADN) dirige la síntesis de una proteína específica con función biológica determinada.",
            etiquetas: ["dogma central", "Crick", "flujo de información"],
          },
        ],
        actividad_final: "Traza el flujo completo del dogma central: describe qué enzima actúa en cada etapa, dónde ocurre en la célula eucariota y cuál es el producto de cada proceso (replicación → ADN hija; transcripción → ARNm; traducción → polipéptido).",
      },
    },
    {
      titulo: "Completa los espacios — ADN y dogma central",
      descripcion: "Completa los conceptos clave sobre la estructura del ADN y los mecanismos de replicación, transcripción y traducción.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el término correcto.",
        texto_con_huecos: "En la doble hélice del ADN, la adenina se empareja con la ___ mediante 2 puentes de hidrógeno. La replicación del ADN es ___ : cada molécula hija conserva una cadena parental. La transcripción ocurre en el ___ de la célula eucariota y produce ARN mensajero. En la traducción, cada ___ del ARNm (triplete de bases) codifica un aminoácido específico.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "timina",
            alternativas_aceptadas: ["T"],
            pista: "La adenina (A) se empareja por complementariedad con la ___ (T) en el ADN.",
          },
          {
            posicion: 1,
            respuesta_correcta: "semiconservativa",
            alternativas_aceptadas: [],
            pista: "Tipo de replicación demostrado por Meselson-Stahl: cada nueva doble hélice conserva una cadena parental y sintetiza una nueva. Modelo ___.",
          },
          {
            posicion: 2,
            respuesta_correcta: "núcleo",
            alternativas_aceptadas: ["nucleo"],
            pista: "En las células eucariotas, la ARN polimerasa transcribe el ADN en el ___ celular.",
          },
          {
            posicion: 3,
            respuesta_correcta: "codón",
            alternativas_aceptadas: ["codon"],
            pista: "Triplete de bases del ARNm que codifica un aminoácido o una señal de parada en la traducción.",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — ADN: estructura y dogma central",
      descripcion: "Reflexiona sobre tu dominio de la estructura del ADN y los mecanismos del dogma central de la biología molecular.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Describo la estructura de la doble hélice del ADN: antiparalelismo, complementariedad de bases (A-T, G-C) y esqueleto de fosfato-desoxirribosa.", escala: escala4 },
          { descripcion: "Explico la replicación semiconservativa del ADN y el papel de la ADN helicasa y la ADN polimerasa.", escala: escala4 },
          { descripcion: "Diferencio transcripción (ADN→ARNm, en el núcleo, ARN polimerasa) de traducción (ARNm→proteína, en el ribosoma, ARNt).", escala: escala4 },
          { descripcion: "Aplico el código genético para traducir una secuencia de ARNm a aminoácidos e identifico codones de inicio y de parada.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Por qué el código genético es considerado 'universal'? ¿Qué implicación tiene esta universalidad para la biotecnología moderna (por ejemplo, para producir insulina humana en bacterias)?",
      },
    },
  ],

  // ════════════ P05 — Herencia genética: leyes de Mendel y herencia no mendeliana ════════════
  [
    {
      titulo: "Verdadero o Falso — Leyes de Mendel y herencia no mendeliana",
      descripcion: "Decide si cada afirmación sobre las leyes de Mendel, la herencia dominante-recesiva, la codominancia, la dominancia incompleta y la herencia ligada al sexo es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "La primera ley de Mendel (segregación) establece que los alelos de un gen se separan durante la formación de gametos, de modo que cada gameto recibe solo uno de los dos alelos.",
            respuesta: true,
            retroalimentacion: "Correcto. La ley de segregación explica por qué los individuos F1 (Aa) producen gametos con 50% del alelo A y 50% del alelo a, resultando en una proporción F2 de 3:1 para el fenotipo dominante:recesivo.",
          },
          {
            enunciado: "En la codominancia, el fenotipo del heterocigoto es intermedio entre los dos homocigotos; por ejemplo, la flor roja × blanca da flores rosas.",
            respuesta: false,
            retroalimentacion: "Falso. Ese es un ejemplo de dominancia incompleta, no de codominancia. En la codominancia, ambos alelos se expresan simultáneamente en el heterocigoto sin mezcla: el ejemplo clásico es el grupo sanguíneo AB, donde se expresan tanto el antígeno A como el B.",
          },
          {
            enunciado: "La segunda ley de Mendel (surtido independiente) aplica para genes ubicados en cromosomas diferentes o muy distantes en el mismo cromosoma, ya que sus alelos se distribuyen independientemente en los gametos.",
            respuesta: true,
            retroalimentacion: "Correcto. La ley del surtido independiente fue derivada por Mendel al cruzar rasgos ubicados en cromosomas distintos. Genes ligados (muy cercanos en el mismo cromosoma) no siguen esta ley y tienden a heredarse juntos.",
          },
          {
            enunciado: "La hemofilia A es un trastorno ligado al cromosoma X; los hombres (XY) que heredan el alelo afectado son portadores asintomáticos, mientras que las mujeres (XX) con un alelo afectado son las que padecen la enfermedad.",
            respuesta: false,
            retroalimentacion: "Falso. Es al contrario: los hombres (XY) con un solo alelo recesivo afectado (X^h Y) padecen hemofilia porque no tienen un segundo alelo X normal. Las mujeres necesitan dos alelos afectados (X^h X^h) para expresar la enfermedad; con un solo alelo (X^h X) son portadoras asintomáticas.",
          },
          {
            enunciado: "Los caracteres poligénicos como la estatura, el color de piel y el peso corporal son determinados por la interacción de múltiples genes, por lo que presentan distribución continua (variación gradual) en la población.",
            respuesta: true,
            retroalimentacion: "Correcto. La herencia poligénica resulta de la adición de efectos de varios genes, produciendo una amplia gama de fenotipos intermedios con distribución continua, frecuentemente con forma de campana de Gauss.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Herencia genética: Mendel y herencia no mendeliana",
      descripcion: "Glosario interactivo sobre los principios de la herencia genética: alelos, leyes de Mendel, cuadro de Punnett, codominancia, dominancia incompleta, herencia ligada al sexo y herencia poligénica.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Alelos y locus génico",
            definicion: "Un gen ocupa una posición específica en el cromosoma llamada locus. Los alelos son formas alternativas del mismo gen. Un individuo diploide tiene dos alelos por locus (uno de cada progenitor): puede ser homocigoto (AA o aa) o heterocigoto (Aa).",
            ejemplo: "El gen del color de flor en guisantes tiene alelos: A (color morado, dominante) y a (color blanco, recesivo). Aa produce flores moradas (A es dominante).",
            etiquetas: ["alelo", "locus", "homocigoto", "heterocigoto"],
          },
          {
            termino: "Primera ley de Mendel: segregación",
            definicion: "Los dos alelos de un gen se separan (segregan) durante la meiosis y cada gameto recibe solo uno. Al fecundarse, el cigoto recibve un alelo de cada progenitor. Esto explica las proporciones fenotípicas 3:1 en F2 de cruzamientos monohíbridos.",
            ejemplo: "Cruce Aa × Aa: gametos posibles A y a. Cuadro de Punnett → 1/4 AA : 2/4 Aa : 1/4 aa = 3/4 dominante (A_) : 1/4 recesivo (aa).",
            etiquetas: ["ley de segregación", "Mendel", "gametos"],
          },
          {
            termino: "Segunda ley de Mendel: surtido independiente",
            definicion: "Para genes en cromosomas distintos, los alelos de un gen se distribuyen en los gametos independientemente de los alelos de otro gen. Esto produce proporciones 9:3:3:1 en cruzamientos dihíbridos (F2).",
            ejemplo: "Cruce AaBb × AaBb (color y forma de semilla en guisantes): la proporción F2 es 9 A_B_ : 3 A_bb : 3 aaB_ : 1 aabb.",
            etiquetas: ["surtido independiente", "dihíbrido", "Mendel"],
          },
          {
            termino: "Dominancia incompleta y codominancia",
            definicion: "Dominancia incompleta: el heterocigoto presenta fenotipo intermedio (ej: rojo × blanco → rosa). Codominancia: ambos alelos se expresan simultáneamente sin mezcla (ej: grupo sanguíneo AB: se expresan antígenos A y B).",
            ejemplo: "Boca de dragón: roja (R¹R¹) × blanca (R²R²) → rosa (R¹R²) = dominancia incompleta. Tipo sanguíneo: I^A I^B → expresa A y B = codominancia.",
            etiquetas: ["dominancia incompleta", "codominancia", "heterocigoto"],
          },
          {
            termino: "Herencia ligada al sexo",
            definicion: "Herencia de genes ubicados en el cromosoma X. Los hombres (XY) expresan cualquier alelo recesivo ligado al X porque solo tienen una copia. Las mujeres (XX) necesitan dos copias recesivas para expresar el rasgo. Ejemplos: hemofilia A, daltonismo.",
            ejemplo: "Daltonismo: X^d Y (hombre daltónico), X^D X^d (mujer portadora), X^d X^d (mujer daltónica, raro). La madre portadora transmite el alelo X^d a sus hijos.",
            etiquetas: ["ligado al sexo", "cromosoma X", "hemofilia", "daltonismo"],
          },
          {
            termino: "Herencia poligénica",
            definicion: "Rasgos determinados por la interacción de múltiples genes (cada uno con efecto pequeño y aditivo). Producen variación continua con distribución normal en la población. También influye el ambiente (herencia multifactorial).",
            ejemplo: "La estatura humana depende de decenas de genes más factores ambientales (nutrición). Las poblaciones muestran distribución continua de tallas, no categorías discretas.",
            etiquetas: ["poligénica", "variación continua", "multifactorial"],
          },
        ],
        actividad_final: "Resuelve este cruzamiento: una mujer portadora del daltonismo (X^D X^d) tiene hijos con un hombre con visión normal (X^D Y). Elabora el cuadro de Punnett y determina: ¿cuál es la probabilidad de que un hijo varón sea daltónico? ¿Y una hija?",
      },
    },
    {
      titulo: "Completa los espacios — Herencia genética",
      descripcion: "Completa los conceptos clave sobre las leyes de Mendel y los patrones de herencia no mendeliana.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el término correcto.",
        texto_con_huecos: "La primera ley de Mendel se llama ley de ___ y establece que los alelos se separan durante la formación de gametos. En el cruce Aa × Aa, la proporción fenotípica F2 es ___ (dominante:recesivo). En la codominancia, el fenotipo del heterocigoto expresa ___ alelos simultáneamente, sin mezcla. La hemofilia es un ejemplo de herencia ligada al cromosoma ___ .",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "segregación",
            alternativas_aceptadas: ["segregacion"],
            pista: "Primera ley de Mendel: los alelos se ___ durante la meiosis y cada gameto recibe uno de ellos.",
          },
          {
            posicion: 1,
            respuesta_correcta: "3:1",
            alternativas_aceptadas: ["3 a 1", "3/1"],
            pista: "Del cruce Aa × Aa resultan ¼ AA, ½ Aa, ¼ aa → ___ fenotípicamente dominante:recesivo.",
          },
          {
            posicion: 2,
            respuesta_correcta: "ambos",
            alternativas_aceptadas: ["los dos"],
            pista: "En la codominancia, ___ alelos se expresan al mismo tiempo (ej: antígenos A y B en el grupo AB).",
          },
          {
            posicion: 3,
            respuesta_correcta: "X",
            alternativas_aceptadas: [],
            pista: "Los genes ligados al sexo se ubican principalmente en el cromosoma ___ (no en el Y).",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Herencia genética",
      descripcion: "Reflexiona sobre tu comprensión de las leyes de Mendel y los patrones de herencia no mendeliana.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Enuncio las dos leyes de Mendel y las aplico para predecir proporciones fenotípicas con el cuadro de Punnett.", escala: escala4 },
          { descripcion: "Distingo entre dominancia completa, dominancia incompleta y codominancia con ejemplos concretos.", escala: escala4 },
          { descripcion: "Explico la herencia ligada al sexo y resuelvo cruzamientos con genes ligados al cromosoma X.", escala: escala4 },
          { descripcion: "Identifico características de la herencia poligénica (variación continua, múltiples genes) y la distingo de la herencia mendeliana clásica.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Por qué Mendel eligió el guisante (Pisum sativum) para sus experimentos? ¿Qué características de esta planta facilitaron el descubrimiento de las leyes de la herencia?",
      },
    },
  ],

  // ════════════ P06 — Mutaciones y variabilidad genética ════════════
  [
    {
      titulo: "Verdadero o Falso — Mutaciones y variabilidad genética",
      descripcion: "Decide si cada afirmación sobre los tipos de mutaciones, sus causas, efectos y su papel en la evolución es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "Una mutación puntual es un cambio en un solo par de bases del ADN; puede ser una sustitución, una inserción o una deleción de un nucleótido.",
            respuesta: true,
            retroalimentacion: "Correcto. Las mutaciones puntuales afectan un único par de bases. Las sustituciones cambian una base por otra; las inserciones o deleciones de uno o dos nucleótidos causan mutaciones de desplazamiento del marco de lectura (frameshift).",
          },
          {
            enunciado: "Las mutaciones de sentido erróneo (missense) siempre causan enfermedades graves porque el cambio de aminoácido siempre destruye la función de la proteína.",
            respuesta: false,
            retroalimentacion: "Falso. Muchas mutaciones missense son silenciosas o conservadoras: si el aminoácido sustituido tiene propiedades similares (por ejemplo, ambos son hidrofóbicos), la función proteica puede conservarse. Solo algunas missense en posiciones críticas (sitio activo, puentes disulfuro) tienen consecuencias graves.",
          },
          {
            enunciado: "La radiación ultravioleta (UV) puede inducir mutaciones en el ADN al formar dímeros de timina, donde dos timinas adyacentes se unen covalentemente alterando la estructura de la doble hélice.",
            respuesta: true,
            retroalimentacion: "Correcto. La exposición excesiva a rayos UV es la principal causa del melanoma de piel porque los dímeros de timina, si no se reparan correctamente, causan errores de replicación del ADN en células de la epidermis.",
          },
          {
            enunciado: "Las mutaciones germinales (en células sexuales) solo afectan al individuo que las porta y no son heredables por la descendencia.",
            respuesta: false,
            retroalimentacion: "Falso. Es exactamente al revés: las mutaciones germinales ocurren en células reproductoras (espermatogonias u ovogonias) y son heredables a la descendencia. Las mutaciones somáticas (en células del cuerpo) solo afectan al individuo y no se transmiten.",
          },
          {
            enunciado: "Las mutaciones son la fuente primaria de variación genética nueva en las poblaciones y, junto con la recombinación genética, proporcionan el material para la evolución por selección natural.",
            respuesta: true,
            retroalimentacion: "Correcto. Sin mutaciones no habría variantes genéticas nuevas sobre las que actúe la selección natural. La recombinación durante la meiosis redistribuye las variantes existentes, aumentando la diversidad fenotípica en cada generación.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Mutaciones y variabilidad genética",
      descripcion: "Glosario interactivo sobre los tipos de mutaciones, sus agentes causantes (mutágenos), mecanismos de reparación del ADN y su papel en la variabilidad genética y la evolución.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Mutación génica puntual",
            definicion: "Cambio en uno o pocos pares de bases del ADN. Tipos: (1) Sustitución: una base se reemplaza por otra; puede ser sinónima (sin cambio de aminoácido), missense (cambia aminoácido) o nonsense (genera codón de parada prematuro). (2) Inserción/deleción de 1-2 bases: causa desplazamiento del marco de lectura (frameshift), alterando todos los aminoácidos siguientes.",
            ejemplo: "La anemia de células falciformes: sustitución A→T en el codón 6 del gen de la beta-globina → GAG (ácido glutámico) se convierte en GTG (valina) → hemoglobina S que se polomeriza en hipoxia.",
            etiquetas: ["mutación puntual", "sustitución", "frameshift", "missense"],
          },
          {
            termino: "Mutación cromosómica",
            definicion: "Cambio en la estructura o número de cromosomas. Estructurales: deleción (pérdida de segmento), duplicación, inversión, translocación. Numéricas: aneuploidía (pérdida o ganancia de cromosomas, ej: trisomía 21 = síndrome de Down) o poliploidía.",
            ejemplo: "Síndrome de Down (trisomía 21): células con 47 cromosomas por no disyunción durante la meiosis materna. El leucocrito de Filadelfia en leucemia mieloide crónica es una translocación t(9;22).",
            etiquetas: ["mutación cromosómica", "aneuploidía", "trisomía", "translocación"],
          },
          {
            termino: "Mutágenos físicos, químicos y biológicos",
            definicion: "Agentes que aumentan la tasa de mutación. Físicos: radiación UV (dímeros de timina), rayos X y gamma (roturas de doble cadena). Químicos: benzopirenos del humo de tabaco, aflatoxinas, agentes alquilantes. Biológicos: virus que integran su ADN en el genoma (VPH, retrovirus).",
            ejemplo: "El tabaco contiene >70 carcinógenos químicos que dañan el ADN de células pulmonares; la mayoría de los cánceres de pulmón están asociados al consumo de tabaco.",
            etiquetas: ["mutágeno", "UV", "carcinógeno", "tabaco"],
          },
          {
            termino: "Reparación del ADN",
            definicion: "Las células poseen sistemas de reparación para corregir errores de replicación y daños al ADN: (1) Reparación por escisión de nucleótidos (NER): elimina dímeros de timina y lesiones voluminosas. (2) Reparación de emparejamientos erróneos (MMR). (3) Unión de extremos no homólogos (NHEJ) para roturas de doble cadena. Fallos en estos sistemas aumentan el riesgo de cáncer.",
            ejemplo: "El síndrome de xeroderma pigmentoso es una enfermedad genética rara por deficiencia en NER: los pacientes no pueden reparar dímeros de timina y desarrollan cáncer de piel con exposición mínima al sol.",
            etiquetas: ["reparación ADN", "NER", "MMR", "xeroderma pigmentoso"],
          },
          {
            termino: "Mutaciones germinales vs somáticas",
            definicion: "Germinales: ocurren en células de la línea germinal (gametos); son heredables y afectan a toda la descendencia. Somáticas: ocurren en células del cuerpo del individuo; no son heredables, pero pueden causar cáncer si afectan genes reguladores del ciclo celular (proto-oncogenes, genes supresores de tumor).",
            ejemplo: "La fibrosis quística (mutación germinal del gen CFTR) se hereda. El melanoma surge de mutaciones somáticas en células de la piel inducidas por UV.",
            etiquetas: ["germinal", "somática", "cáncer", "herencia"],
          },
          {
            termino: "Variabilidad genética y evolución",
            definicion: "Las mutaciones introducen nuevos alelos en las poblaciones; la recombinación durante la meiosis crea nuevas combinaciones de alelos. Ambos procesos generan diversidad fenotípica sobre la que actúa la selección natural, la deriva génica y el flujo génico, impulsando la evolución.",
            ejemplo: "La resistencia de bacterias a los antibióticos evoluciona por mutaciones aleatorias en genes de resistencia, seguidas de selección positiva: las bacterias con mutación ventajosa sobreviven y se reproducen.",
            etiquetas: ["variabilidad", "recombinación", "selección natural", "evolución"],
          },
        ],
        actividad_final: "Analiza el siguiente caso: una persona desarrolla melanoma después de años de exposición solar sin protección. (1) ¿Qué tipo de mutación indujo el UV? (2) ¿Es una mutación germinal o somática? (3) ¿Puede transmitirla a sus hijos? Justifica cada respuesta.",
      },
    },
    {
      titulo: "Completa los espacios — Mutaciones genéticas",
      descripcion: "Completa los conceptos clave sobre los tipos de mutaciones, sus causas y su papel en la variabilidad genética.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el término correcto.",
        texto_con_huecos: "Las mutaciones de ___ del marco de lectura se producen cuando se inserta o elimina un número de bases que no es múltiplo de tres. La anemia de células falciformes es causada por una mutación de ___ en el gen de la beta-globina. Las mutaciones ___ ocurren en células reproductoras y son heredables por la descendencia. La radiación ___ provoca dímeros de timina, un tipo de daño frecuente en el ADN de las células de la piel.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "desplazamiento",
            alternativas_aceptadas: ["corrimiento"],
            pista: "Inserción o deleción de bases que no son múltiplo de 3 causa mutaciones de ___ del marco de lectura (frameshift).",
          },
          {
            posicion: 1,
            respuesta_correcta: "sustitución",
            alternativas_aceptadas: ["punto", "puntual"],
            pista: "En la anemia falciforme, una sola base cambia: A por T en el codón 6 del gen de beta-globina. Esto es una mutación de ___.",
          },
          {
            posicion: 2,
            respuesta_correcta: "germinales",
            alternativas_aceptadas: ["germinales"],
            pista: "Mutaciones que ocurren en óvulos o espermatozoides y pueden transmitirse a la siguiente generación.",
          },
          {
            posicion: 3,
            respuesta_correcta: "ultravioleta",
            alternativas_aceptadas: ["UV", "uv"],
            pista: "Tipo de radiación del espectro solar que induce la formación de dímeros de timina y es la principal causa del cáncer de piel.",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Mutaciones y variabilidad genética",
      descripcion: "Reflexiona sobre tu comprensión de los tipos de mutaciones, sus causas y su papel en la variabilidad genética y la evolución.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Clasifico los tipos de mutaciones génicas (sustitución, inserción, deleción) y cromosómicas (aneuploidía, translocación) con ejemplos.", escala: escala4 },
          { descripcion: "Identifico los principales mutágenos (físicos, químicos, biológicos) y explico el mecanismo por el que dañan el ADN.", escala: escala4 },
          { descripcion: "Distingo entre mutaciones germinales (heredables) y somáticas (no heredables, relacionadas con cáncer).", escala: escala4 },
          { descripcion: "Explico cómo las mutaciones y la recombinación genética generan la variabilidad necesaria para la evolución por selección natural.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Son todas las mutaciones perjudiciales? Da ejemplos de mutaciones neutras y de mutaciones que han resultado ventajosas para una población en un ambiente determinado.",
      },
    },
  ],

  // ════════════ P07 — Evolución por selección natural ════════════
  [
    {
      titulo: "Verdadero o Falso — Teoría de la evolución por selección natural",
      descripcion: "Decide si cada afirmación sobre la teoría de la evolución de Darwin, los mecanismos evolutivos y la evidencia que la sustenta es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "La selección natural actúa sobre el fenotipo, favoreciendo a los individuos cuyas características les confieren mayor éxito reproductivo en un ambiente particular.",
            respuesta: true,
            retroalimentacion: "Correcto. Darwin identificó los tres requisitos para que ocurra la selección natural: variación heredable en la población, diferencias en supervivencia/reproducción según esa variación (aptitud diferencial), y que el rasgo sea heritable.",
          },
          {
            enunciado: "Darwin propuso que la evolución ocurre porque los individuos adquieren características útiles durante su vida y las transmiten a su descendencia, mecanismo conocido como herencia de los caracteres adquiridos.",
            respuesta: false,
            retroalimentacion: "Falso. Esa es la teoría de Lamarck (herencia de caracteres adquiridos), que fue descartada. Darwin propuso la selección natural: los individuos con variaciones heredables ventajosas sobreviven y se reproducen más, no adquieren rasgos durante su vida.",
          },
          {
            enunciado: "Los fósiles constituyen una evidencia directa de la evolución porque muestran formas de vida del pasado y permiten rastrear la aparición y transformación de grupos biológicos a lo largo del tiempo geológico.",
            respuesta: true,
            retroalimentacion: "Correcto. El registro fósil es la evidencia más directa de la evolución. Los fósiles de Tiktaalik (pez con aletas similares a extremidades), Archaeopteryx (transición dinosaurio-ave) y la secuencia de equinos (Hyracotherium→Equus) son ejemplos icónicos.",
          },
          {
            enunciado: "Las estructuras análogas (como las alas de los murciélagos, las aves y los insectos) son evidencia de ancestro común porque muestran la misma arquitectura ósea adaptada a funciones distintas.",
            respuesta: false,
            retroalimentacion: "Falso. Las estructuras con la misma arquitectura interna pero funciones distintas son estructuras HOMÓLOGAS (evidencia de ancestro común). Las estructuras ANÁLOGAS tienen funciones similares pero origen evolutivo independiente (evolución convergente), como las alas de aves e insectos.",
          },
          {
            enunciado: "La biología molecular y la comparación de secuencias de ADN y proteínas entre especies son evidencias de la evolución: cuanto más parecidas son las secuencias, más cercano es el parentesco evolutivo.",
            respuesta: true,
            retroalimentacion: "Correcto. La filogenia molecular compara genomas, proteínas (como el citocromo c) y ARNr para reconstruir árboles filogenéticos. El genoma humano comparte ~98.7% de similitud con el chimpancé y ~85% con el ratón, consistente con el parentesco evolutivo.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Evolución y selección natural",
      descripcion: "Glosario interactivo sobre los mecanismos de la evolución biológica: selección natural, deriva génica, flujo génico, especiación y las evidencias del proceso evolutivo.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Selección natural (Darwin-Wallace)",
            definicion: "Mecanismo evolutivo que actúa sobre la variación heredable en una población. Los individuos con variaciones que aumentan su supervivencia y reproducción en el ambiente actual dejan más descendencia, por lo que esas variaciones se vuelven más frecuentes en la siguiente generación.",
            ejemplo: "El caso de la polilla del abedul (Biston betularia): antes de la industrialización predominaban las polillas claras (camufladas en corteza pálida); tras la contaminación que oscureció los troncos, las polillas oscuras sobrevivieron mejor y aumentaron en frecuencia.",
            etiquetas: ["selección natural", "Darwin", "aptitud", "variación heredable"],
          },
          {
            termino: "Tipos de selección natural",
            definicion: "Selección estabilizadora: favorece fenotipos intermedios, reduce la varianza (ej: peso al nacer en humanos). Selección direccional: favorece un extremo del rango fenotípico (ej: resistencia a antibióticos). Selección disruptiva: favorece ambos extremos, puede llevar a especiación.",
            ejemplo: "La talla media al nacer (~3.3 kg) tiene mayor supervivencia; bebés muy grandes o muy pequeños tienen mayor riesgo = selección estabilizadora.",
            etiquetas: ["selección estabilizadora", "direccional", "disruptiva"],
          },
          {
            termino: "Deriva génica",
            definicion: "Cambio aleatorio en la frecuencia de alelos en una población, especialmente pronunciado en poblaciones pequeñas. No es adaptativo; puede fijar alelos neutros o perjudiciales. Incluye el efecto fundador (nueva población a partir de pocos individuos) y el cuello de botella (reducción drástica del tamaño poblacional).",
            ejemplo: "El síndrome de Ellis-van Creveld (polidactilia + cardiopatías) es muy frecuente entre los Amish de Pennsylvania por efecto fundador: toda la comunidad desciende de unos pocos fundadores que portaban el alelo.",
            etiquetas: ["deriva génica", "efecto fundador", "cuello de botella"],
          },
          {
            termino: "Evidencia fósil de la evolución",
            definicion: "El registro fósil muestra la cronología de aparición de grupos biológicos, formas de transición y extinciones. Las dataciones radiométricas permiten establecer la edad de los fósiles. Las series de fósiles de equinos, cetáceos (de ungulados a ballenas) y homínidos son secuencias evolutivas documentadas.",
            ejemplo: "Archaeopteryx (~150 Ma) muestra características de dinosaurios terópodos (dientes, garras en alas, cola ósea) y de aves (plumas, fúrcula), siendo un fósil de transición clave.",
            etiquetas: ["fósil", "registro fósil", "transición", "evidencia"],
          },
          {
            termino: "Estructuras homólogas y analogías",
            definicion: "Homólogas: misma estructura anatómica derivada del mismo ancestro, adaptada a funciones distintas (ej: extremidad anterior de humano, ballena, murciélago). Son evidencia de ancestro común. Análogas: funciones similares pero origen evolutivo independiente (convergencia); ej: ala de ave vs ala de insecto.",
            ejemplo: "El ala de murciélago, la aleta de ballena y el brazo humano tienen la misma disposición ósea (húmero, radio, cúbito, carpos, falanges): son homólogos derivados del ancestro amnioide.",
            etiquetas: ["homología", "analogía", "ancestro común", "convergencia"],
          },
          {
            termino: "Especiación",
            definicion: "Proceso por el cual surgen nuevas especies. Especiación alopátrica: separación geográfica impide el flujo génico entre poblaciones que divergen hasta no poder reproducirse. Especiación simpátrica: aislamiento reproductivo dentro del mismo territorio (poliploidía, selección disruptiva).",
            ejemplo: "Los pinzones de Darwin en las Galápagos: un ancestro colonizador se diferenció en ~14 especies con picos adaptados a distintos alimentos (semillas, insectos, cactus) al colonizar islas distintas = especiación alopátrica.",
            etiquetas: ["especiación", "alopátrica", "simpátrica", "aislamiento reproductivo"],
          },
        ],
        actividad_final: "Analiza el caso de la resistencia a antibióticos en bacterias. Aplica los conceptos de variación heredable, selección natural y evolución para explicar en un párrafo cómo surge y se propaga la resistencia en una población bacteriana expuesta al antibiótico.",
      },
    },
    {
      titulo: "Completa los espacios — Evolución por selección natural",
      descripcion: "Completa los conceptos clave sobre la teoría de la evolución y las evidencias que la sustentan.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el término correcto.",
        texto_con_huecos: "La selección natural favorece a los individuos con características ___ que les permiten reproducirse más exitosamente en su ambiente. Los fósiles son evidencia ___ de la evolución porque muestran formas de vida del pasado. Las estructuras ___ tienen la misma arquitectura anatómica pero funciones distintas y son evidencia de ancestro común. La ___ génica es un cambio aleatorio en la frecuencia de alelos, especialmente importante en poblaciones pequeñas.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "heredables",
            alternativas_aceptadas: ["hereditarias", "heredadas"],
            pista: "Para que la selección natural actúe, las variaciones deben ser ___ (transmitirse a la descendencia).",
          },
          {
            posicion: 1,
            respuesta_correcta: "directa",
            alternativas_aceptadas: [],
            pista: "El registro fósil es la evidencia más ___ de la evolución: muestra organismos reales del pasado.",
          },
          {
            posicion: 2,
            respuesta_correcta: "homólogas",
            alternativas_aceptadas: ["homologas"],
            pista: "Estructuras con la misma arquitectura interna derivada de un ancestro común (ej: ala de murciélago y brazo humano) son estructuras ___.",
          },
          {
            posicion: 3,
            respuesta_correcta: "deriva",
            alternativas_aceptadas: [],
            pista: "Mecanismo evolutivo no adaptativo: cambio al azar en la frecuencia de alelos. Se llama ___ génica.",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Evolución por selección natural",
      descripcion: "Reflexiona sobre tu comprensión de la teoría de la evolución, los mecanismos evolutivos y las evidencias que la sustentan.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Explico los requisitos para que ocurra la selección natural (variación, herencia, diferencia en reproducción) y la distingo del lamarckismo.", escala: escala4 },
          { descripcion: "Describo los tipos de selección natural (estabilizadora, direccional, disruptiva) con un ejemplo de cada uno.", escala: escala4 },
          { descripcion: "Identifico y explico las principales evidencias de la evolución: registro fósil, estructuras homólogas, y filogenia molecular.", escala: escala4 },
          { descripcion: "Explico la deriva génica, el flujo génico y la especiación como mecanismos evolutivos complementarios a la selección natural.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Por qué la evolución no tiene una 'dirección' ni un 'propósito'? ¿Qué significa decir que un organismo está 'mejor adaptado' a su ambiente en términos evolutivos?",
      },
    },
  ],

  // ════════════ P08 — Ética en biotecnología: transgénicos, CRISPR y clonación ════════════
  [
    {
      titulo: "Verdadero o Falso — Biotecnología y ética: transgénicos, CRISPR y clonación",
      descripcion: "Decide si cada afirmación sobre las técnicas biotecnológicas actuales (transgénicos, edición génica con CRISPR-Cas9, clonación) y sus implicaciones éticas, sociales y ambientales es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "Un organismo genéticamente modificado (OGM o transgénico) es aquel al que se le ha insertado uno o más genes de otra especie para conferirle una característica nueva.",
            respuesta: true,
            retroalimentacion: "Correcto. Los transgénicos se producen mediante técnicas de ADN recombinante. Ejemplos: maíz Bt (gen de Bacillus thuringiensis que produce una toxina contra insectos), arroz dorado (genes de síntesis de betacaroteno), y la insulina humana producida en bacterias (E. coli transgénica con el gen de la insulina humana).",
          },
          {
            enunciado: "CRISPR-Cas9 es una tecnología de edición génica que permite modificar secuencias de ADN con alta precisión; funciona usando un ARN guía que dirige a la proteína Cas9 al lugar exacto del genoma donde se realizará el corte.",
            respuesta: true,
            retroalimentacion: "Correcto. CRISPR (Clustered Regularly Interspaced Short Palindromic Repeats) fue adaptado como herramienta de edición génica por Jennifer Doudna y Emmanuelle Charpentier (Premio Nobel de Química 2020). El ARN guía (sgRNA) determina la especificidad; Cas9 realiza el corte de doble cadena.",
          },
          {
            enunciado: "La clonación reproductiva (como la de la oveja Dolly) crea organismos con un genoma idéntico al donante; es una técnica actualmente aprobada para aplicarse en humanos en la mayoría de los países.",
            respuesta: false,
            retroalimentacion: "Falso. La clonación reproductiva humana está prohibida o fuertemente regulada en casi todos los países debido a serias objeciones éticas (identidad, autonomía, dignidad humana) y a la baja eficiencia y alto riesgo de anomalías. La clonación terapéutica (para obtener células madre) tiene un estatus legal diferente según el país.",
          },
          {
            enunciado: "Uno de los argumentos en contra de los transgénicos es el posible flujo génico hacia variedades silvestres relacionadas, lo que podría alterar ecosistemas y reducir la biodiversidad de las variedades nativas.",
            respuesta: true,
            retroalimentacion: "Correcto. El flujo génico (transferencia de genes transgénicos a plantas silvestres emparentadas mediante polinización cruzada) es una preocupación ambiental real. En México, país megadiverso y centro de origen del maíz, este riesgo es especialmente relevante para las variedades nativas.",
          },
          {
            enunciado: "La edición génica de la línea germinal humana (modificación de embriones cuyos cambios se heredan) es éticamente equivalente a la edición génica de células somáticas con fines terapéuticos.",
            respuesta: false,
            retroalimentacion: "Falso. Hay una diferencia ética fundamental: las modificaciones en células somáticas solo afectan al individuo tratado y no son heredables. Las modificaciones en la línea germinal afectan a todas las células del individuo Y a sus descendientes, introduciendo cambios permanentes en el genoma de la especie, lo que genera preocupaciones éticas mucho mayores (consentimiento de generaciones futuras, eugenesia).",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Biotecnología y bioética",
      descripcion: "Glosario interactivo sobre las principales técnicas de biotecnología moderna (transgénicos, CRISPR, clonación, células madre) y los principios éticos que guían su uso.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Organismos genéticamente modificados (OGM/transgénicos)",
            definicion: "Organismos a los que se les ha transferido material genético exógeno mediante técnicas de ADN recombinante (plásmidos, vectores virales, biobalística). Aplicaciones: agricultura (resistencia a herbicidas, plagas, sequía), medicina (insulina, vacunas, factores de coagulación), industria (enzimas para alimentos, biocombustibles).",
            ejemplo: "La insulina humana producida por E. coli transgénica (gen de la insulina humana insertado en plásmido bacteriano) es usada por millones de diabéticos desde 1982, sustituyendo a la insulina animal.",
            etiquetas: ["OGM", "transgénico", "ADN recombinante", "biotecnología"],
          },
          {
            termino: "CRISPR-Cas9",
            definicion: "Sistema de edición génica derivado de un mecanismo inmune bacteriano contra fagos. Un ARN guía (sgRNA) lleva a la proteína Cas9 a una secuencia específica del genoma donde hace un corte de doble cadena. La célula repara el corte por NHEJ (deleción/mutación) o HDR (inserción precisa). Más rápido, barato y preciso que técnicas anteriores.",
            ejemplo: "CRISPR se ha usado para eliminar genes de susceptibilidad a la malaria en mosquitos Anopheles, desarrollar tratamientos para anemia de células falciformes (edición de células madre hematopoyéticas) y crear cultivos resistentes a enfermedades.",
            etiquetas: ["CRISPR", "Cas9", "edición génica", "Nobel 2020"],
          },
          {
            termino: "Clonación",
            definicion: "Proceso que produce copias genéticamente idénticas. Clonación molecular: amplifica fragmentos de ADN. Clonación reproductiva: produce un organismo con el mismo genoma que el donante (ej: Dolly, 1996, por transferencia nuclear de células somáticas). Clonación terapéutica: produce células madre embrionarias para medicina regenerativa, sin propósito reproductivo.",
            ejemplo: "La oveja Dolly fue clonada en 1996 en el Instituto Roslin transfiriendo el núcleo de una célula mamaria ovina a un óvulo enucleado; fue el primer mamífero clonado a partir de una célula adulta diferenciada.",
            etiquetas: ["clonación", "Dolly", "célula madre", "terapéutica"],
          },
          {
            termino: "Principios de bioética",
            definicion: "Marco para evaluar intervenciones biotecnológicas: (1) Beneficencia: buscar el mayor beneficio. (2) No maleficencia: evitar daños. (3) Justicia: acceso equitativo a los beneficios. (4) Autonomía: consentimiento informado. En biotecnología también aplican: precaución (actuar con cuidado ante incertidumbre), transparencia y soberanía alimentaria.",
            ejemplo: "El debate sobre los transgénicos involucra beneficencia (mayor rendimiento, reducción de pesticidas), justicia (¿quién controla las semillas? monopolios de patentes) y precaución (riesgos ambientales a largo plazo).",
            etiquetas: ["bioética", "beneficencia", "justicia", "precaución"],
          },
          {
            termino: "Edición de línea germinal vs somática",
            definicion: "Edición somática: modifica células del cuerpo del individuo; los cambios no son heredables; ejemplos en ensayos clínicos para cáncer y enfermedades genéticas. Edición germinal: modifica embriones, óvulos o espermatozoides; los cambios se heredan indefinidamente. Caso He Jiankui (2018): primer bebé CRISPR, generó condena científica y ética internacional.",
            ejemplo: "El tratamiento Casgevy (aprobado en EE.UU. 2023) usa CRISPR en células madre hematopoyéticas de adultos con anemia falciforme: edición somática, no heredable.",
            etiquetas: ["línea germinal", "somática", "He Jiankui", "herencia"],
          },
          {
            termino: "Bioprospección y propiedad intelectual en biotecnología",
            definicion: "La bioprospección es la búsqueda de organismos con propiedades útiles para biotecnología. Genera debates éticos sobre: propiedad de los recursos genéticos de países megadiversos, biopiratería (patentar conocimiento indígena sin compensación) y el Protocolo de Nagoya (acceso y beneficios compartidos).",
            ejemplo: "El maíz azul mexicano y sus propiedades nutricionales son conocimiento indígena ancestral. El patentamiento de variedades derivadas por empresas transnacionales sin compensación a comunidades originarias es un caso de biopiratería.",
            etiquetas: ["bioprospección", "biopiratería", "Nagoya", "soberanía"],
          },
        ],
        actividad_final: "Selecciona una de las tres biotecnologías (transgénicos, CRISPR o clonación) y elabora un argumento a favor y uno en contra de su aplicación en humanos, usando los principios de bioética (beneficencia, no maleficencia, justicia y autonomía).",
      },
    },
    {
      titulo: "Completa los espacios — Biotecnología y bioética",
      descripcion: "Completa los conceptos clave sobre las técnicas de biotecnología moderna y sus implicaciones éticas.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el término correcto.",
        texto_con_huecos: "CRISPR-Cas9 usa un ARN ___ que lleva a la proteína Cas9 al sitio exacto del genoma donde realizará el corte. Jennifer Doudna y Emmanuelle Charpentier recibieron el Premio Nobel de ___ en 2020 por el desarrollo de CRISPR como herramienta de edición génica. La oveja ___ fue el primer mamífero clonado a partir de una célula adulta diferenciada (1996). Las modificaciones en la línea ___ de humanos son heredables por la descendencia y generan las mayores preocupaciones éticas.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "guía",
            alternativas_aceptadas: ["guia"],
            pista: "El ARN ___ (sgRNA) determina a qué secuencia del genoma se dirige Cas9 para realizar el corte.",
          },
          {
            posicion: 1,
            respuesta_correcta: "Química",
            alternativas_aceptadas: ["quimica", "Quimica"],
            pista: "El Premio Nobel de ___ (no de Medicina ni de Física) fue otorgado a Doudna y Charpentier en 2020 por CRISPR.",
          },
          {
            posicion: 2,
            respuesta_correcta: "Dolly",
            alternativas_aceptadas: ["dolly"],
            pista: "La primera oveja clonada en el Instituto Roslin (1996) se llamó ___ .",
          },
          {
            posicion: 3,
            respuesta_correcta: "germinal",
            alternativas_aceptadas: [],
            pista: "Las células de la ___ (óvulos, espermatozoides, embriones) transmiten los cambios genéticos a todas las generaciones siguientes.",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Biotecnología y ética",
      descripcion: "Reflexiona sobre tu comprensión de las principales técnicas biotecnológicas y la importancia de los principios éticos para evaluar su aplicación.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Explico qué son los transgénicos, cómo se producen y doy ejemplos de aplicaciones en agricultura y medicina.", escala: escala4 },
          { descripcion: "Describo el mecanismo de CRISPR-Cas9 (ARN guía, corte de doble cadena, reparación) y menciono aplicaciones terapéuticas actuales.", escala: escala4 },
          { descripcion: "Distingo entre clonación reproductiva y terapéutica, y explico por qué la primera en humanos genera debate ético.", escala: escala4 },
          { descripcion: "Aplico los principios de bioética (beneficencia, no maleficencia, justicia, autonomía) para analizar un caso concreto de biotecnología.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Dónde deberían estar los límites de la edición génica en humanos? ¿Aceptarías una terapia génica somática para curar una enfermedad hereditaria que padeces? ¿Y la modificación germinal para evitar que tu descendencia herede esa enfermedad? Argumenta tu posición.",
      },
    },
  ],
];

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
