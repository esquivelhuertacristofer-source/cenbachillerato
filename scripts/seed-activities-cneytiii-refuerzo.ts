/**
 * Refuerzo de actividades para CNEYT-III (Ciencias Naturales, Experimentales y Tecnología III)
 * según la "Plantilla CEN por UAC".
 * Agrega A4-A7 a cada una de las 8 progresiones (ya tienen A1-A3):
 *   A4 = quiz_verdadero_falso · A5 = glosario_interactivo · A6 = fill_blanks · A7 = autoevaluacion
 * 8 progresiones × 4 = 32 actividades nuevas. estado='borrador'.
 * Alineado al programa oficial MCCEMS 2025: ecosistemas, sistema terrestre y ambiente.
 * Uso: npx tsx scripts/seed-activities-cneytiii-refuerzo.ts
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
  log("\n🌱 Refuerzo CNEYT-III — Ciencias Naturales, Experimentales y Tecnología III: A4-A7 por progresión\n");

  const progs = await getProgresionesDeUAC(sb, "CNEYT-III");
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

  log(`\n✅ CNEYT-III refuerzo: ${ok} actividades insertadas, ${fail} fallidas.\n`);
}

// ── REFUERZOS POR PROGRESIÓN ───────────────────────────────────────────────────

const refuerzos: Refuerzo[][] = [
  // ════════════ P01 — Biomas y ecosistemas ════════════
  [
    {
      titulo: "Verdadero o Falso — Biomas y ecosistemas",
      descripcion: "Decide si cada afirmación sobre biomas, ecosistemas y biodiversidad de México es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "Un bioma es una gran región caracterizada por un clima particular y comunidades de seres vivos adaptados a ese clima.", respuesta: true, retroalimentacion: "Correcto: los biomas se definen por el clima y la vegetación dominante." },
          { enunciado: "México es considerado un país megadiverso porque alberga entre el 10 y el 12 % de las especies conocidas del planeta.", respuesta: true, retroalimentacion: "Sí: México forma parte del grupo de países que concentran la mayor biodiversidad del mundo." },
          { enunciado: "El ecosistema incluye únicamente a los organismos vivos, sin considerar el ambiente físico.", respuesta: false, retroalimentacion: "Un ecosistema integra tanto los componentes bióticos (seres vivos) como los abióticos (clima, suelo, agua, luz)." },
          { enunciado: "La selva tropical es el bioma con mayor biodiversidad del planeta.", respuesta: true, retroalimentacion: "Correcto: las selvas tropicales húmedas albergan cerca del 50 % de las especies terrestres del mundo." },
          { enunciado: "El desierto es un bioma con alta precipitación y poca variación de temperatura.", respuesta: false, retroalimentacion: "Los desiertos se caracterizan por escasas precipitaciones (menos de 250 mm/año) y grandes variaciones térmicas diarias." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Biomas y ecosistemas",
      descripcion: "Glosario interactivo de términos clave sobre biomas, ecosistemas y biodiversidad.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "Bioma", definicion: "Gran unidad ecológica definida por el clima y la vegetación dominante que se extiende a escala continental.", ejemplo: "La taiga es el bioma de bosque boreal que rodea el Ártico.", etiquetas: ["ecología", "biomas"] },
          { termino: "Ecosistema", definicion: "Sistema formado por la comunidad de organismos (biocenosis) y su ambiente físico-químico (biotopo) en interacción.", ejemplo: "Un lago con sus peces, algas, bacterias, agua y sedimentos es un ecosistema.", etiquetas: ["ecología"] },
          { termino: "Biodiversidad", definicion: "Variedad de seres vivos en todos sus niveles: genes, especies y ecosistemas.", ejemplo: "México posee alta biodiversidad de reptiles, mamíferos y plantas.", etiquetas: ["biodiversidad"] },
          { termino: "País megadiverso", definicion: "País que concentra un porcentaje desproporcionadamente alto de la biodiversidad mundial.", ejemplo: "México, Brasil y Colombia son países megadiversos.", etiquetas: ["biodiversidad", "México"] },
          { termino: "Componente abiótico", definicion: "Elemento no vivo del ecosistema: luz solar, temperatura, agua, suelo, nutrientes.", ejemplo: "La cantidad de lluvia es un factor abiótico que determina el tipo de vegetación.", etiquetas: ["ecología"] },
          { termino: "Componente biótico", definicion: "Todos los organismos vivos que forman parte de un ecosistema.", ejemplo: "Los árboles, hongos, insectos y bacterias son componentes bióticos.", etiquetas: ["ecología"] },
        ],
        actividad_final: "Elige dos biomas distintos de México y compara sus componentes abióticos y bióticos principales.",
      },
    },
    {
      titulo: "Rellena los huecos — Biomas y ecosistemas de México",
      descripcion: "Completa el texto con los términos correctos sobre biomas, ecosistemas y biodiversidad.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los cuatro huecos con la palabra o expresión correcta.",
        texto_con_huecos: "México es un país ___ porque alberga entre el 10 y el 12 % de las especies del planeta. Un ___ incluye tanto seres vivos como factores abióticos como el clima y el suelo. La selva tropical es el ___ con mayor diversidad de especies. El clima y la vegetación dominante son los criterios que definen a un ___.",
        huecos: [
          { posicion: 0, respuesta_correcta: "megadiverso", alternativas_aceptadas: ["megadiverso"], pista: "Término que describe a los países con mayor concentración de biodiversidad mundial." },
          { posicion: 1, respuesta_correcta: "ecosistema", alternativas_aceptadas: [], pista: "Sistema que integra seres vivos y su ambiente físico-químico." },
          { posicion: 2, respuesta_correcta: "bioma", alternativas_aceptadas: [], pista: "Gran unidad ecológica a escala continental con clima y vegetación característicos." },
          { posicion: 3, respuesta_correcta: "bioma", alternativas_aceptadas: [], pista: "El mismo término de la pista anterior: unidad definida por clima y vegetación." },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Biomas y ecosistemas",
      descripcion: "Evalúa tu comprensión sobre biomas, ecosistemas y la biodiversidad de México.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio. Esta autoevaluación te ayuda a identificar qué reforzar.",
        criterios: [
          { descripcion: "Distingo el concepto de bioma del de ecosistema y puedo dar ejemplos de ambos.", escala: escala4 },
          { descripcion: "Explico por qué México es considerado un país megadiverso.", escala: escala4 },
          { descripcion: "Identifico los componentes bióticos y abióticos de un ecosistema.", escala: escala4 },
          { descripcion: "Relaciono el clima con el tipo de bioma y la biodiversidad que alberga.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Qué bioma de México te resulta más interesante y por qué es importante conservarlo?",
      },
    },
  ],

  // ════════════ P02 — Flujo de energía y ciclos de materia ════════════
  [
    {
      titulo: "Verdadero o Falso — Flujo de energía y redes tróficas",
      descripcion: "Decide si cada afirmación sobre cadenas alimentarias, redes tróficas y niveles tróficos es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "Los productores son organismos que fabrican su propio alimento a partir de energía solar o química.", respuesta: true, retroalimentacion: "Correcto: los autótrofos (plantas, algas, algunas bacterias) producen materia orgánica sin consumir otros seres vivos." },
          { enunciado: "En una cadena trófica, la energía fluye desde los consumidores hacia los productores.", respuesta: false, retroalimentacion: "El flujo de energía es unidireccional: va de los productores a los consumidores primarios, luego a los secundarios y así sucesivamente." },
          { enunciado: "Al pasar de un nivel trófico al siguiente se transfiere aproximadamente el 10 % de la energía disponible.", respuesta: true, retroalimentacion: "Correcto: la regla del 10 % explica que el 90 % restante se pierde como calor en la respiración." },
          { enunciado: "Los descomponedores son organismos que devuelven nutrientes al suelo al degradar materia orgánica muerta.", respuesta: true, retroalimentacion: "Sí: hongos y bacterias descomponedoras mineralizan la materia orgánica y cierran los ciclos de nutrientes." },
          { enunciado: "Una red trófica es simplemente una sola cadena alimentaria lineal.", respuesta: false, retroalimentacion: "Una red trófica es la interconexión de múltiples cadenas alimentarias dentro de un ecosistema." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Redes tróficas y flujo de energía",
      descripcion: "Glosario interactivo de términos esenciales sobre cadenas y redes tróficas.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "Productor (autótrofo)", definicion: "Organismo que sintetiza materia orgánica a partir de fuentes inorgánicas mediante fotosíntesis o quimiosíntesis.", ejemplo: "Las plantas, algas y cianobacterias son productores.", etiquetas: ["trófico", "energía"] },
          { termino: "Consumidor primario", definicion: "Herbívoro que se alimenta directamente de los productores.", ejemplo: "El conejo que come pasto es un consumidor primario.", etiquetas: ["trófico"] },
          { termino: "Consumidor secundario", definicion: "Organismo que se alimenta de consumidores primarios.", ejemplo: "La víbora que come al ratón (herbívoro) es un consumidor secundario.", etiquetas: ["trófico"] },
          { termino: "Descomponedor", definicion: "Organismo (hongo, bacteria) que degrada materia orgánica muerta liberando nutrientes inorgánicos.", ejemplo: "Los hongos del suelo descomponen hojas caídas.", etiquetas: ["trófico", "ciclos"] },
          { termino: "Regla del 10 %", definicion: "Solo el 10 % de la energía de un nivel trófico se transfiere al siguiente; el 90 % se pierde como calor.", ejemplo: "De 10 000 kcal en plantas, solo 1 000 llegan al herbívoro y 100 al carnívoro.", etiquetas: ["energía"] },
          { termino: "Red trófica", definicion: "Conjunto de cadenas alimentarias interconectadas que muestra las relaciones de alimentación en un ecosistema.", ejemplo: "En un bosque, la red trófica incluye decenas de especies en múltiples niveles.", etiquetas: ["trófico", "ecología"] },
        ],
        actividad_final: "Dibuja o describe una red trófica de al menos 5 organismos de un ecosistema mexicano, indicando el nivel trófico de cada uno.",
      },
    },
    {
      titulo: "Rellena los huecos — Flujo de energía",
      descripcion: "Completa el texto con los términos correctos sobre cadenas tróficas y transferencia de energía.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los cuatro huecos con la palabra o expresión adecuada.",
        texto_con_huecos: "En un ecosistema, las plantas son los ___ porque producen su propio alimento. Los herbívoros actúan como consumidores ___ al alimentarse de plantas. Solo el ___ % de la energía de cada nivel trófico se transfiere al siguiente. Los hongos y bacterias son ___ que liberan nutrientes al descomponer materia orgánica.",
        huecos: [
          { posicion: 0, respuesta_correcta: "productores", alternativas_aceptadas: ["autótrofos"], pista: "Organismos que elaboran su propio alimento mediante la fotosíntesis." },
          { posicion: 1, respuesta_correcta: "primarios", alternativas_aceptadas: ["1"], pista: "El primer nivel de consumidores en la cadena trófica." },
          { posicion: 2, respuesta_correcta: "10", alternativas_aceptadas: ["diez"], pista: "Porcentaje de energía que pasa a cada nivel trófico según la regla clásica." },
          { posicion: 3, respuesta_correcta: "descomponedores", alternativas_aceptadas: [], pista: "Organismos que degradan materia orgánica muerta y cierran los ciclos de nutrientes." },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Flujo de energía y redes tróficas",
      descripcion: "Evalúa tu comprensión sobre cadenas alimentarias, niveles tróficos y transferencia de energía.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Distingo productores, consumidores (primarios y secundarios) y descomponedores.", escala: escala4 },
          { descripcion: "Explico el flujo unidireccional de la energía en una cadena trófica.", escala: escala4 },
          { descripcion: "Aplico la regla del 10 % para calcular la energía disponible en cada nivel.", escala: escala4 },
          { descripcion: "Describo la diferencia entre una cadena trófica y una red trófica.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Qué ocurriría con un ecosistema si desaparecieran los descomponedores? Explica con base en lo aprendido.",
      },
    },
  ],

  // ════════════ P03 — Fotosíntesis ════════════
  [
    {
      titulo: "Verdadero o Falso — Fotosíntesis",
      descripcion: "Decide si cada afirmación sobre la fotosíntesis, sus reactivos, productos y tipos es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "Los reactivos de la fotosíntesis son el dióxido de carbono (CO₂) y el agua (H₂O), y el producto principal es la glucosa.", respuesta: true, retroalimentacion: "Correcto: 6CO₂ + 6H₂O + energía luminosa → C₆H₁₂O₆ + 6O₂." },
          { enunciado: "Las plantas C4 fijan el CO₂ directamente en el ciclo de Calvin sin pre-fijación previa.", respuesta: false, retroalimentacion: "Las plantas C4 (maíz, caña de azúcar) tienen un mecanismo de pre-fijación en células del mesófilo que concentra CO₂ antes del ciclo de Calvin." },
          { enunciado: "Las plantas CAM abren sus estomas de noche para reducir la pérdida de agua.", respuesta: true, retroalimentacion: "Correcto: las suculentas con metabolismo ácido de las crasuláceas (CAM) fijan CO₂ por la noche cuando la temperatura es baja." },
          { enunciado: "El oxígeno liberado en la fotosíntesis proviene de la molécula de CO₂.", respuesta: false, retroalimentacion: "El O₂ liberado proviene de la fotólisis del agua (H₂O), no del CO₂." },
          { enunciado: "Las plantas C3 son el tipo más común y fijan el carbono directamente en una molécula de tres carbonos (3-PGA).", respuesta: true, retroalimentacion: "Correcto: la mayoría de las plantas terrestres son C3 (trigo, arroz, árboles)." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Fotosíntesis: reactivos, productos y tipos",
      descripcion: "Glosario interactivo de los conceptos clave de la fotosíntesis.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "Fotosíntesis", definicion: "Proceso mediante el cual los organismos autótrofos convierten energía luminosa en energía química almacenada en glucosa.", ejemplo: "Las plantas capturan luz solar con la clorofila y producen glucosa a partir de CO₂ y H₂O.", etiquetas: ["fotosíntesis"] },
          { termino: "Clorofila", definicion: "Pigmento verde localizado en los cloroplastos que absorbe principalmente luz roja y azul para la fotosíntesis.", ejemplo: "La clorofila a y la clorofila b son los pigmentos fotosintéticos principales.", etiquetas: ["fotosíntesis", "pigmento"] },
          { termino: "Plantas C3", definicion: "Plantas que fijan el CO₂ directamente en el ciclo de Calvin formando un compuesto de 3 carbonos (3-PGA). Son las más comunes.", ejemplo: "El trigo, el arroz y la mayoría de los árboles son plantas C3.", etiquetas: ["fotosíntesis", "tipos"] },
          { termino: "Plantas C4", definicion: "Plantas con mecanismo de pre-fijación del CO₂ en células del mesófilo; más eficientes en climas cálidos y luminosos.", ejemplo: "El maíz, la caña de azúcar y el sorgo son plantas C4.", etiquetas: ["fotosíntesis", "tipos"] },
          { termino: "Plantas CAM", definicion: "Plantas que fijan el CO₂ de noche (estomas cerrados de día) para minimizar la pérdida de agua en ambientes áridos.", ejemplo: "Los cactos, las agaves y la piña son plantas CAM.", etiquetas: ["fotosíntesis", "tipos"] },
          { termino: "Fotólisis del agua", definicion: "Separación de la molécula de agua mediante la energía luminosa en la fase luminosa de la fotosíntesis; libera O₂.", ejemplo: "El oxígeno que respiramos proviene de la fotólisis del agua durante la fotosíntesis.", etiquetas: ["fotosíntesis", "reacción"] },
        ],
        actividad_final: "Elabora un cuadro comparativo entre plantas C3, C4 y CAM indicando: ambiente donde prosperan, ejemplo de especie y ventaja adaptativa.",
      },
    },
    {
      titulo: "Rellena los huecos — Fotosíntesis",
      descripcion: "Completa el texto con los términos correctos sobre reactivos, productos y tipos de fotosíntesis.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los cuatro huecos con la palabra o expresión correcta.",
        texto_con_huecos: "En la fotosíntesis, las plantas utilizan energía ___ para transformar CO₂ y agua en glucosa y ___. El oxígeno liberado proviene de la ___ del agua. El maíz es una planta ___ que pre-fija el CO₂ para ser más eficiente en climas cálidos.",
        huecos: [
          { posicion: 0, respuesta_correcta: "luminosa", alternativas_aceptadas: ["solar", "luz"], pista: "Tipo de energía que captura la clorofila para impulsar la fotosíntesis." },
          { posicion: 1, respuesta_correcta: "oxígeno", alternativas_aceptadas: ["O2", "O₂"], pista: "Gas liberado como subproducto de la fotosíntesis que respiramos." },
          { posicion: 2, respuesta_correcta: "fotólisis", alternativas_aceptadas: [], pista: "Proceso de separación de la molécula de agua usando energía luminosa." },
          { posicion: 3, respuesta_correcta: "C4", alternativas_aceptadas: ["c4"], pista: "Tipo de planta fotosintética eficiente en climas cálidos y luminosos (maíz, caña)." },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Fotosíntesis",
      descripcion: "Evalúa tu comprensión sobre el proceso fotosintético y sus tipos.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Escribo la ecuación general de la fotosíntesis identificando reactivos y productos.", escala: escala4 },
          { descripcion: "Explico de dónde proviene el oxígeno liberado en la fotosíntesis.", escala: escala4 },
          { descripcion: "Distingo las características y ejemplos de plantas C3, C4 y CAM.", escala: escala4 },
          { descripcion: "Argumento la importancia de la fotosíntesis para el flujo de energía y el equilibrio del CO₂ atmosférico.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Por qué la fotosíntesis es considerada el proceso más importante para la vida en la Tierra? Justifica con dos argumentos.",
      },
    },
  ],

  // ════════════ P04 — Ciclos biogeoquímicos ════════════
  [
    {
      titulo: "Verdadero o Falso — Ciclos biogeoquímicos",
      descripcion: "Decide si cada afirmación sobre los ciclos del agua, carbono, nitrógeno y fósforo es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "En el ciclo del agua, la evaporación y la transpiración son procesos que incorporan agua a la atmósfera.", respuesta: true, retroalimentacion: "Correcto: la evapotranspiración (evaporación + transpiración vegetal) es la principal fuente de vapor de agua atmosférico." },
          { enunciado: "El ciclo del carbono solo ocurre en la atmósfera y no involucra a los océanos.", respuesta: false, retroalimentacion: "Los océanos son el mayor reservorio de carbono en la Tierra; absorben CO₂ atmosférico y lo incorporan en carbonatos y seres vivos marinos." },
          { enunciado: "La fijación de nitrógeno es el proceso mediante el cual algunas bacterias convierten el N₂ atmosférico en formas asimilables para las plantas.", respuesta: true, retroalimentacion: "Correcto: bacterias como Rhizobium fijan N₂ en amonio (NH₄⁺) que las plantas pueden absorber." },
          { enunciado: "El fósforo tiene un reservorio atmosférico importante, al igual que el carbono y el nitrógeno.", respuesta: false, retroalimentacion: "A diferencia del C y el N, el fósforo no tiene fase gaseosa significativa; su reservorio principal son las rocas fosfatadas." },
          { enunciado: "La deforestación altera el ciclo del carbono porque disminuye la absorción de CO₂ por las plantas.", respuesta: true, retroalimentacion: "Correcto: menos vegetación implica menos fotosíntesis y menos captura de CO₂, aumentando su concentración en la atmósfera." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Ciclos biogeoquímicos",
      descripcion: "Glosario interactivo de los ciclos del agua, carbono, nitrógeno y fósforo.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "Ciclo biogeoquímico", definicion: "Movimiento continuo de elementos químicos entre los componentes bióticos y abióticos de la biosfera.", ejemplo: "El ciclo del carbono mueve C entre la atmósfera, los seres vivos, los suelos y los océanos.", etiquetas: ["ciclos"] },
          { termino: "Evapotranspiración", definicion: "Suma de la evaporación del agua superficial y la transpiración de las plantas; incorpora vapor de agua a la atmósfera.", ejemplo: "Las selvas tropicales tienen alta evapotranspiración, lo que genera lluvias locales.", etiquetas: ["ciclo del agua"] },
          { termino: "Fijación de nitrógeno", definicion: "Conversión del N₂ atmosférico en amonio (NH₄⁺) o nitratos por bacterias fijadoras, haciéndolo asimilable para las plantas.", ejemplo: "Rhizobium vive en nódulos de raíces de leguminosas y fija nitrógeno.", etiquetas: ["ciclo del nitrógeno"] },
          { termino: "Denitrificación", definicion: "Proceso bacteriano que convierte nitratos (NO₃⁻) de nuevo en N₂ gaseoso, completando el ciclo del nitrógeno.", ejemplo: "La denitrificación en suelos anóxicos libera N₂ a la atmósfera.", etiquetas: ["ciclo del nitrógeno"] },
          { termino: "Ciclo del fósforo", definicion: "Ciclo sin fase gaseosa significativa; el P se libera por erosión de rocas, pasa al suelo y agua, y es absorbido por plantas y animales.", ejemplo: "El fósforo de los fertilizantes puede contaminar cuerpos de agua causando eutrofización.", etiquetas: ["ciclo del fósforo"] },
          { termino: "Sumidero de carbono", definicion: "Reservorio que absorbe más CO₂ del que libera, reduciendo su concentración en la atmósfera.", ejemplo: "Los bosques y los océanos son los principales sumideros de carbono del planeta.", etiquetas: ["ciclo del carbono", "clima"] },
        ],
        actividad_final: "Explica cómo la quema de combustibles fósiles altera el ciclo del carbono y cuáles son sus consecuencias para el clima.",
      },
    },
    {
      titulo: "Rellena los huecos — Ciclos biogeoquímicos",
      descripcion: "Completa el texto con los términos correctos sobre los ciclos del agua, carbono, nitrógeno y fósforo.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los cuatro huecos con la palabra o expresión correcta.",
        texto_con_huecos: "El ciclo del ___ es el único ciclo biogeoquímico sin fase gaseosa significativa, ya que su reservorio principal son las rocas. En el ciclo del nitrógeno, bacterias como Rhizobium realizan la ___ de nitrógeno atmosférico para que las plantas puedan usarlo. Los bosques actúan como ___ de carbono al absorber CO₂ mediante la fotosíntesis. La ___ combina la evaporación del agua superficial con la transpiración vegetal en el ciclo hidrológico.",
        huecos: [
          { posicion: 0, respuesta_correcta: "fósforo", alternativas_aceptadas: ["fosforo"], pista: "Elemento cuyo ciclo no tiene fase gaseosa y cuyo reservorio son rocas fosfatadas." },
          { posicion: 1, respuesta_correcta: "fijación", alternativas_aceptadas: [], pista: "Proceso de convertir N₂ gaseoso en formas asimilables (amonio o nitratos)." },
          { posicion: 2, respuesta_correcta: "sumideros", alternativas_aceptadas: ["sumidero"], pista: "Reservorios que absorben más carbono del que liberan." },
          { posicion: 3, respuesta_correcta: "evapotranspiración", alternativas_aceptadas: [], pista: "Proceso combinado de evaporación + transpiración vegetal en el ciclo del agua." },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Ciclos biogeoquímicos",
      descripcion: "Evalúa tu comprensión sobre los ciclos del agua, carbono, nitrógeno y fósforo.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Explico las etapas principales del ciclo del agua (evaporación, condensación, precipitación, infiltración).", escala: escala4 },
          { descripcion: "Describo cómo la fotosíntesis y la respiración regulan el ciclo del carbono.", escala: escala4 },
          { descripcion: "Distingo fijación, nitrificación y denitrificación en el ciclo del nitrógeno.", escala: escala4 },
          { descripcion: "Identifico cómo las actividades humanas alteran los ciclos biogeoquímicos y sus consecuencias ambientales.", escala: escala4 },
        ],
        reflexion_final_prompt: "Elige uno de los cuatro ciclos y describe cómo una acción humana específica lo altera y qué medida podría revertir ese impacto.",
      },
    },
  ],

  // ════════════ P05 — Subsistemas terrestres ════════════
  [
    {
      titulo: "Verdadero o Falso — Subsistemas terrestres",
      descripcion: "Decide si cada afirmación sobre la atmósfera, hidrosfera, litosfera y biosfera es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "La atmósfera es la capa de gases que rodea la Tierra y regula la temperatura y protege de la radiación UV.", respuesta: true, retroalimentacion: "Correcto: la atmósfera (con la capa de ozono en la estratosfera) regula el clima y filtra la radiación ultravioleta dañina." },
          { enunciado: "La hidrosfera incluye únicamente el agua de los océanos, sin considerar el agua dulce continental.", respuesta: false, retroalimentacion: "La hidrosfera comprende toda el agua de la Tierra: océanos, ríos, lagos, glaciares, agua subterránea y vapor de agua." },
          { enunciado: "La litosfera es la capa más superficial de la Tierra, formada por la corteza y la parte superior del manto.", respuesta: true, retroalimentacion: "Correcto: la litosfera sólida incluye la corteza continental y oceánica más el manto litosférico superior." },
          { enunciado: "La biosfera abarca todos los organismos vivos de la Tierra y los ambientes donde viven.", respuesta: true, retroalimentacion: "Sí: la biosfera es la suma de todos los ecosistemas del planeta, desde las profundidades oceánicas hasta la alta atmósfera." },
          { enunciado: "Los subsistemas terrestres actúan de forma completamente independiente sin interaccionar entre sí.", respuesta: false, retroalimentacion: "Los subsistemas (atmósfera, hidrosfera, litosfera y biosfera) interactúan constantemente: la lluvia erosiona rocas, las plantas modifican la atmósfera, etc." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Subsistemas terrestres",
      descripcion: "Glosario interactivo de los cuatro subsistemas terrestres y sus interacciones.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "Atmósfera", definicion: "Envoltura gaseosa de la Tierra compuesta principalmente por N₂ (78 %) y O₂ (21 %); regula el clima y protege de la radiación UV.", ejemplo: "La capa de ozono estratosférico filtra los rayos UV que podrían dañar los seres vivos.", etiquetas: ["subsistemas", "atmósfera"] },
          { termino: "Hidrosfera", definicion: "Toda el agua de la Tierra en sus tres estados: océanos, ríos, glaciares, agua subterránea y vapor de agua.", ejemplo: "El 97 % del agua de la hidrosfera es salada; solo el 3 % es agua dulce.", etiquetas: ["subsistemas", "hidrosfera"] },
          { termino: "Litosfera", definicion: "Capa sólida externa de la Tierra que incluye la corteza y el manto litosférico superior; dividida en placas tectónicas.", ejemplo: "El movimiento de las placas litosféricas genera sismos y volcanes.", etiquetas: ["subsistemas", "litosfera"] },
          { termino: "Biosfera", definicion: "Zona de la Tierra donde existe vida; integra partes de la atmósfera, hidrosfera y litosfera.", ejemplo: "La biosfera se extiende desde las trincheras oceánicas hasta varios kilómetros de altitud.", etiquetas: ["subsistemas", "biosfera"] },
          { termino: "Interacción entre subsistemas", definicion: "Proceso mediante el cual los cuatro subsistemas terrestres se influyen mutuamente de manera continua.", ejemplo: "La lluvia (hidrosfera) erosiona rocas (litosfera) y libera nutrientes que usan las plantas (biosfera).", etiquetas: ["subsistemas", "interacción"] },
          { termino: "Efecto invernadero natural", definicion: "Fenómeno en que la atmósfera retiene calor solar gracias a gases como CO₂, CH₄ y H₂O, manteniendo la temperatura media en ~15 °C.", ejemplo: "Sin el efecto invernadero natural, la Tierra tendría una temperatura promedio de −18 °C.", etiquetas: ["atmósfera", "clima"] },
        ],
        actividad_final: "Elige dos subsistemas terrestres y describe con un ejemplo concreto cómo interactúan entre sí.",
      },
    },
    {
      titulo: "Rellena los huecos — Subsistemas terrestres",
      descripcion: "Completa el texto con los nombres correctos de los subsistemas terrestres y sus características.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los cuatro huecos con el nombre correcto del subsistema o concepto.",
        texto_con_huecos: "La ___ es la envoltura gaseosa que protege la Tierra de la radiación ultravioleta. Toda el agua del planeta forma la ___. La capa sólida externa dividida en placas tectónicas se llama ___. La zona donde existe vida en la Tierra recibe el nombre de ___.",
        huecos: [
          { posicion: 0, respuesta_correcta: "atmósfera", alternativas_aceptadas: ["atmosfera"], pista: "Envoltura gaseosa de la Tierra compuesta por N₂, O₂ y otros gases." },
          { posicion: 1, respuesta_correcta: "hidrosfera", alternativas_aceptadas: [], pista: "Subsistema que incluye océanos, ríos, glaciares y agua subterránea." },
          { posicion: 2, respuesta_correcta: "litosfera", alternativas_aceptadas: [], pista: "Capa sólida externa de la Tierra dividida en placas tectónicas." },
          { posicion: 3, respuesta_correcta: "biosfera", alternativas_aceptadas: [], pista: "Zona de la Tierra donde existen organismos vivos." },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Subsistemas terrestres",
      descripcion: "Evalúa tu comprensión sobre los cuatro subsistemas terrestres y sus interacciones.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Identifico y describo las características principales de los cuatro subsistemas terrestres.", escala: escala4 },
          { descripcion: "Explico al menos dos ejemplos de interacción entre subsistemas distintos.", escala: escala4 },
          { descripcion: "Relaciono el efecto invernadero natural con la regulación de la temperatura terrestre.", escala: escala4 },
          { descripcion: "Argumento cómo la alteración de un subsistema afecta a los demás.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Cómo afectaría a los demás subsistemas terrestres la desaparición total de la cobertura vegetal? Razona tu respuesta.",
      },
    },
  ],

  // ════════════ P06 — Deterioro ambiental ════════════
  [
    {
      titulo: "Verdadero o Falso — Deterioro ambiental",
      descripcion: "Decide si cada afirmación sobre contaminación, deforestación y cambio climático a distintas escalas es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "El cambio climático antropogénico se debe principalmente al aumento de gases de efecto invernadero por actividades humanas.", respuesta: true, retroalimentacion: "Correcto: la quema de combustibles fósiles, la deforestación y la ganadería intensiva incrementan CO₂, CH₄ y N₂O, intensificando el efecto invernadero." },
          { enunciado: "La lluvia ácida es un fenómeno local que no puede afectar a ecosistemas a cientos de kilómetros de la fuente de contaminación.", respuesta: false, retroalimentacion: "Las partículas de SO₂ y NOₓ pueden viajar cientos de kilómetros antes de depositarse como lluvia ácida, afectando bosques y lagos lejanos." },
          { enunciado: "La deforestación afecta únicamente a la biodiversidad, sin impacto en los ciclos biogeoquímicos.", respuesta: false, retroalimentacion: "La deforestación altera el ciclo del carbono (menos absorción de CO₂), el ciclo del agua (menor evapotranspiración) y la estabilidad del suelo." },
          { enunciado: "La contaminación del suelo por agroquímicos puede transferirse a los organismos a través de la cadena trófica.", respuesta: true, retroalimentacion: "Correcto: la bioacumulación y biomagnificación de pesticidas (como el DDT) en la cadena trófica puede alcanzar concentraciones tóxicas en los depredadores apicales." },
          { enunciado: "El calentamiento global puede reducir la frecuencia e intensidad de los fenómenos meteorológicos extremos.", respuesta: false, retroalimentacion: "El aumento de temperatura global incrementa la energía disponible para fenómenos extremos: huracanes más intensos, sequías prolongadas e inundaciones más frecuentes." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Deterioro ambiental",
      descripcion: "Glosario interactivo sobre contaminación, deforestación, cambio climático y sus escalas.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "Cambio climático antropogénico", definicion: "Modificación del clima global causada por actividades humanas que aumentan los gases de efecto invernadero.", ejemplo: "El incremento de CO₂ desde 280 ppm en la era preindustrial hasta más de 420 ppm en la actualidad es la principal causa del calentamiento global.", etiquetas: ["cambio climático", "global"] },
          { termino: "Deforestación", definicion: "Eliminación de la cubierta forestal por tala, incendios o conversión de tierras para agricultura o ganadería.", ejemplo: "México perdió millones de hectáreas de selva tropical en el siglo XX por la expansión agropecuaria.", etiquetas: ["deforestación", "México"] },
          { termino: "Lluvia ácida", definicion: "Precipitación con pH bajo causada por la disolución de SO₂ y NOₓ en la atmósfera; daña bosques, suelos y cuerpos de agua.", ejemplo: "La lluvia ácida generada por industrias ha dañado bosques en Europa y Norteamérica.", etiquetas: ["contaminación", "regional"] },
          { termino: "Biomagnificación", definicion: "Aumento progresivo de la concentración de un contaminante al ascender en la cadena trófica.", ejemplo: "El mercurio se biomagnifica en los peces grandes (atún, pez espada), acumulando niveles peligrosos para el ser humano.", etiquetas: ["contaminación", "trófico"] },
          { termino: "Eutrofización", definicion: "Exceso de nutrientes (N y P) en cuerpos de agua que provoca crecimiento masivo de algas y depleción de oxígeno.", ejemplo: "Los fertilizantes agrícolas que llegan a ríos y lagos causan eutrofización y muerte de peces.", etiquetas: ["contaminación", "agua"] },
          { termino: "Huella de carbono", definicion: "Cantidad total de gases de efecto invernadero emitidos directa o indirectamente por una persona, organización o producto.", ejemplo: "Un vuelo transatlántico genera alrededor de 1.5 toneladas de CO₂ por pasajero.", etiquetas: ["cambio climático", "emisiones"] },
        ],
        actividad_final: "Identifica un problema ambiental de tu comunidad y explica si su escala es local, regional o global, y cómo se relaciona con los que aprendiste.",
      },
    },
    {
      titulo: "Rellena los huecos — Deterioro ambiental",
      descripcion: "Completa el texto con los términos correctos sobre los problemas ambientales a distintas escalas.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los cuatro huecos con el término o concepto correcto.",
        texto_con_huecos: "La ___ reduce la captura de CO₂ y altera el ciclo del agua al eliminar la cubierta forestal. El aumento progresivo de contaminantes en la cadena alimentaria se denomina ___. La acumulación de gases de efecto invernadero producida por actividades humanas es la causa principal del ___ ___. El exceso de fertilizantes en ríos y lagos genera ___, un proceso que agota el oxígeno del agua.",
        huecos: [
          { posicion: 0, respuesta_correcta: "deforestación", alternativas_aceptadas: [], pista: "Eliminación masiva de la cubierta forestal." },
          { posicion: 1, respuesta_correcta: "biomagnificación", alternativas_aceptadas: ["bioacumulación"], pista: "Proceso por el que los contaminantes se concentran más al ascender en la cadena trófica." },
          { posicion: 2, respuesta_correcta: "cambio climático", alternativas_aceptadas: ["calentamiento global"], pista: "Fenómeno global de alteración del clima por gases de efecto invernadero de origen humano." },
          { posicion: 3, respuesta_correcta: "eutrofización", alternativas_aceptadas: [], pista: "Enriquecimiento excesivo de nutrientes en cuerpos de agua que provoca crecimiento de algas y falta de oxígeno." },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Deterioro ambiental",
      descripcion: "Evalúa tu comprensión sobre los problemas ambientales a escala local, regional y global.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Distingo problemas ambientales locales, regionales y globales con ejemplos concretos.", escala: escala4 },
          { descripcion: "Explico las causas y consecuencias del cambio climático antropogénico.", escala: escala4 },
          { descripcion: "Relaciono la deforestación con la alteración de los ciclos biogeoquímicos y la pérdida de biodiversidad.", escala: escala4 },
          { descripcion: "Identifico cómo la contaminación se propaga a través de la cadena trófica (bioacumulación y biomagnificación).", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Qué problema ambiental de tu región consideras más urgente y qué acción personal podrías tomar para contribuir a su solución?",
      },
    },
  ],

  // ════════════ P07 — Políticas y estrategias de conservación en México ════════════
  [
    {
      titulo: "Verdadero o Falso — Conservación y legislación ambiental en México",
      descripcion: "Decide si cada afirmación sobre áreas naturales protegidas, legislación y estrategias de conservación en México es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "Las Áreas Naturales Protegidas (ANP) en México son gestionadas principalmente por la CONANP.", respuesta: true, retroalimentacion: "Correcto: la Comisión Nacional de Áreas Naturales Protegidas (CONANP) administra las ANP federales de México." },
          { enunciado: "La Ley General del Equilibrio Ecológico y la Protección al Ambiente (LGEEPA) es el principal instrumento jurídico ambiental federal de México.", respuesta: true, retroalimentacion: "Sí: la LGEEPA (1988) establece las bases para la preservación del medio ambiente y el aprovechamiento sustentable de los recursos naturales en México." },
          { enunciado: "Una reserva de la biosfera es una categoría de ANP donde se prohíbe absolutamente cualquier actividad humana en toda su extensión.", respuesta: false, retroalimentacion: "Las reservas de la biosfera tienen zonas núcleo de protección estricta, pero también zonas de amortiguamiento y de transición donde se permiten actividades sustentables y habitación humana." },
          { enunciado: "La restauración ecológica busca recuperar la estructura, composición y función de un ecosistema degradado.", respuesta: true, retroalimentacion: "Correcto: la restauración va más allá de la conservación pasiva; implica intervenciones activas para restablecer procesos ecológicos." },
          { enunciado: "México no cuenta con corredores biológicos porque toda la conservación se realiza en ANP aisladas.", respuesta: false, retroalimentacion: "México ha establecido estrategias de conectividad biológica (corredores) para unir áreas protegidas y permitir el flujo de especies entre ellas." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Políticas y estrategias de conservación en México",
      descripcion: "Glosario interactivo sobre ANP, legislación ambiental y estrategias de conservación en México.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "Área Natural Protegida (ANP)", definicion: "Zona del territorio nacional con características relevantes que el Estado protege y maneja para conservar la biodiversidad y los servicios ecosistémicos.", ejemplo: "La Reserva de la Biosfera Calakmul, en Campeche, es una de las ANP más grandes de México.", etiquetas: ["conservación", "México", "ANP"] },
          { termino: "CONANP", definicion: "Comisión Nacional de Áreas Naturales Protegidas; organismo federal encargado de administrar y conservar las ANP de México.", ejemplo: "La CONANP gestiona más de 180 ANP que cubren cerca del 11 % del territorio nacional.", etiquetas: ["conservación", "México", "institución"] },
          { termino: "LGEEPA", definicion: "Ley General del Equilibrio Ecológico y la Protección al Ambiente; principal marco jurídico ambiental federal de México (1988).", ejemplo: "La LGEEPA define las categorías de ANP y regula las actividades que pueden realizarse en ellas.", etiquetas: ["legislación", "México"] },
          { termino: "Reserva de la biosfera", definicion: "Categoría de ANP con zonas núcleo (protección estricta), amortiguamiento y transición; designadas por la UNESCO dentro del programa MAB.", ejemplo: "La Reserva de la Biosfera El Vizcaíno, en Baja California Sur, protege ballenas grises y lobos marinos.", etiquetas: ["ANP", "UNESCO"] },
          { termino: "Corredor biológico", definicion: "Zona de conectividad que une áreas protegidas aisladas para permitir el movimiento de especies y el flujo genético.", ejemplo: "El Corredor Biológico Mesoamericano conecta áreas protegidas desde México hasta Panamá.", etiquetas: ["conservación", "conectividad"] },
          { termino: "Restauración ecológica", definicion: "Proceso de asistir la recuperación de un ecosistema degradado, dañado o destruido para restablecer su estructura, composición y función.", ejemplo: "La reforestación con especies nativas en cuencas hidrográficas es una forma de restauración ecológica.", etiquetas: ["restauración", "conservación"] },
        ],
        actividad_final: "Investiga una ANP de tu estado o región de México: identifica su categoría, los ecosistemas que protege y las principales amenazas que enfrenta.",
      },
    },
    {
      titulo: "Rellena los huecos — Conservación y legislación en México",
      descripcion: "Completa el texto con los términos correctos sobre políticas y estrategias de conservación en México.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los cuatro huecos con el nombre o término correcto.",
        texto_con_huecos: "La ___ es el principal marco jurídico ambiental federal de México que regula las áreas protegidas y el aprovechamiento de recursos. La ___ administra las Áreas Naturales Protegidas federales del país. Una reserva de la biosfera tiene zonas ___ de protección estricta donde se limitan las actividades humanas. Los corredores biológicos permiten la ___ entre poblaciones de distintas áreas protegidas.",
        huecos: [
          { posicion: 0, respuesta_correcta: "LGEEPA", alternativas_aceptadas: ["lgeepa"], pista: "Siglas de la Ley General del Equilibrio Ecológico y la Protección al Ambiente." },
          { posicion: 1, respuesta_correcta: "CONANP", alternativas_aceptadas: ["conanp"], pista: "Comisión Nacional de Áreas Naturales Protegidas." },
          { posicion: 2, respuesta_correcta: "núcleo", alternativas_aceptadas: ["nucleo", "de núcleo"], pista: "Tipo de zona de una reserva de la biosfera con el mayor nivel de protección." },
          { posicion: 3, respuesta_correcta: "conectividad", alternativas_aceptadas: ["conexión", "flujo genético"], pista: "Función de los corredores biológicos: permitir el movimiento y el intercambio genético entre poblaciones." },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Políticas y estrategias de conservación",
      descripcion: "Evalúa tu comprensión sobre las estrategias e instrumentos de conservación de ecosistemas en México.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Explico qué son las Áreas Naturales Protegidas y cuáles son sus principales categorías en México.", escala: escala4 },
          { descripcion: "Identifico el papel de la CONANP y la LGEEPA en la conservación ambiental de México.", escala: escala4 },
          { descripcion: "Distingo la conservación in situ de la ex situ y doy ejemplos de cada una.", escala: escala4 },
          { descripcion: "Argumento la importancia de los corredores biológicos para la conservación de la biodiversidad.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Por qué las leyes ambientales por sí solas no son suficientes para conservar la biodiversidad? ¿Qué otros factores son necesarios?",
      },
    },
  ],

  // ════════════ P08 — Acciones locales de conservación ════════════
  [
    {
      titulo: "Verdadero o Falso — Acciones locales para la conservación",
      descripcion: "Decide si cada afirmación sobre acciones locales fundamentadas en evidencia para la conservación del ambiente es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "Una acción de conservación fundamentada en evidencia se basa en datos científicos para evaluar su efectividad antes y después de aplicarla.", respuesta: true, retroalimentacion: "Correcto: la ciencia de la conservación requiere monitoreo con indicadores medibles para demostrar que la acción funciona." },
          { enunciado: "Plantar cualquier especie de árbol en un área degradada es siempre la mejor estrategia de restauración.", respuesta: false, retroalimentacion: "La restauración exitosa requiere plantar especies nativas adaptadas al ecosistema local; las especies exóticas pueden convertirse en invasoras y agravar la degradación." },
          { enunciado: "El monitoreo ciudadano (ciencia ciudadana) puede aportar datos válidos para la toma de decisiones en conservación.", respuesta: true, retroalimentacion: "Sí: proyectos de ciencia ciudadana como el monitoreo de aves, mariposas o calidad del agua generan grandes bases de datos útiles para la conservación." },
          { enunciado: "Las acciones locales de conservación no tienen impacto en problemas ambientales de escala global.", respuesta: false, retroalimentacion: "Las acciones locales acumuladas (reducción de emisiones, restauración de vegetación, gestión de residuos) contribuyen significativamente a mitigar problemas globales." },
          { enunciado: "Un diagnóstico ambiental previo es fundamental para diseñar acciones de conservación eficaces.", respuesta: true, retroalimentacion: "Correcto: sin conocer el estado actual del ecosistema (diagnóstico), las acciones pueden ser inadecuadas o ineficientes." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Acciones locales de conservación",
      descripcion: "Glosario interactivo de conceptos para diseñar y evaluar acciones locales de conservación ambiental.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "Diagnóstico ambiental", definicion: "Evaluación del estado actual de un ecosistema que identifica sus principales problemas, causas y actores involucrados como base para la acción.", ejemplo: "Un diagnóstico ambiental de una barranca urbana puede revelar contaminación por residuos sólidos, pérdida de vegetación y erosión del suelo.", etiquetas: ["conservación", "metodología"] },
          { termino: "Indicador de impacto", definicion: "Variable medible que permite evaluar el efecto de una acción de conservación sobre el ecosistema.", ejemplo: "El porcentaje de cobertura vegetal nativa antes y después de una reforestación es un indicador de impacto.", etiquetas: ["conservación", "monitoreo"] },
          { termino: "Especie nativa", definicion: "Especie que evolucionó en un ecosistema y forma parte de sus relaciones ecológicas naturales.", ejemplo: "El encino (Quercus spp.) es una especie nativa de los bosques templados de México.", etiquetas: ["restauración", "biodiversidad"] },
          { termino: "Especie invasora", definicion: "Especie introducida fuera de su distribución natural que compite con las nativas y puede alterar el ecosistema.", ejemplo: "El pez diablo (Pterygoplichthys spp.) es una especie invasora que afecta ríos y lagos de México.", etiquetas: ["biodiversidad", "amenaza"] },
          { termino: "Ciencia ciudadana", definicion: "Participación de ciudadanos no especializados en la recolección y análisis de datos científicos para proyectos de investigación o conservación.", ejemplo: "El conteo navideño de aves de la National Audubon Society es un ejemplo de ciencia ciudadana con décadas de datos.", etiquetas: ["conservación", "participación"] },
          { termino: "Servicio ecosistémico", definicion: "Beneficio que los ecosistemas proveen a los seres humanos: provisión (agua, alimentos), regulación (clima, inundaciones), soporte (ciclos de nutrientes) y culturales.", ejemplo: "Los manglares proveen servicios de regulación al proteger costas de huracanes y almacenar carbono.", etiquetas: ["ecosistema", "conservación"] },
        ],
        actividad_final: "Diseña una acción de conservación para un problema ambiental de tu comunidad: define el diagnóstico, la acción propuesta, las especies nativas involucradas y los indicadores para evaluar su éxito.",
      },
    },
    {
      titulo: "Rellena los huecos — Acciones locales de conservación",
      descripcion: "Completa el texto sobre el diseño de acciones de conservación fundamentadas en evidencia.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los cuatro huecos con el término o concepto correcto.",
        texto_con_huecos: "Antes de diseñar cualquier acción de conservación, es necesario realizar un ___ ambiental que describa el estado actual del ecosistema. Para restaurar un área degradada se recomienda plantar ___ nativas, no introducidas, para respetar las relaciones ecológicas locales. El avance de la restauración se mide con ___ de impacto como la cobertura vegetal o la riqueza de especies. La participación de la comunidad en el monitoreo ambiental se conoce como ciencia ___.",
        huecos: [
          { posicion: 0, respuesta_correcta: "diagnóstico", alternativas_aceptadas: ["diagnostico"], pista: "Evaluación inicial que identifica los problemas y causas en un ecosistema." },
          { posicion: 1, respuesta_correcta: "especies", alternativas_aceptadas: ["especie"], pista: "Organismos propios del ecosistema que evolucionaron en él y forman relaciones ecológicas naturales." },
          { posicion: 2, respuesta_correcta: "indicadores", alternativas_aceptadas: ["indicador"], pista: "Variables medibles que permiten saber si una acción de conservación está teniendo efecto." },
          { posicion: 3, respuesta_correcta: "ciudadana", alternativas_aceptadas: [], pista: "Tipo de ciencia en la que participan personas no especializadas en la recolección de datos." },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Acciones locales de conservación",
      descripcion: "Evalúa tu capacidad para proponer y evaluar acciones locales de conservación fundamentadas en evidencia.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio. Es la autoevaluación final de CNEYT-III.",
        criterios: [
          { descripcion: "Realizo un diagnóstico ambiental básico identificando problemas, causas y actores en un ecosistema concreto.", escala: escala4 },
          { descripcion: "Propongo acciones de conservación o restauración usando especies nativas y fundamentadas en evidencia científica.", escala: escala4 },
          { descripcion: "Defino indicadores medibles para evaluar el éxito de una acción de conservación.", escala: escala4 },
          { descripcion: "Argumento cómo las acciones locales se conectan con problemas ambientales regionales y globales.", escala: escala4 },
        ],
        reflexion_final_prompt: "De todo lo que aprendiste en CNEYT-III, ¿qué concepto cambió más tu forma de ver el ambiente y cómo lo aplicarías en tu vida cotidiana?",
      },
    },
  ],
];

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
