/**
 * Refuerzo de actividades para CNEYT-IV (Ciencias Naturales, Experimentales y Tecnología IV)
 * según la "Plantilla CEN por UAC".
 * Agrega A4-A7 a cada una de las 8 progresiones (ya tienen A1-A3):
 *   A4 = quiz_verdadero_falso · A5 = glosario_interactivo · A6 = fill_blanks · A7 = autoevaluacion
 * 8 progresiones × 4 = 32 actividades nuevas. estado='borrador'.
 * Alineado al programa oficial MCCEMS 2025: reacciones químicas.
 * Uso: npx tsx scripts/seed-activities-cneytiv-refuerzo.ts
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
  log("\n🌱 Refuerzo CNEYT-IV — Ciencias Naturales, Experimentales y Tecnología IV: A4-A7 por progresión\n");

  const progs = await getProgresionesDeUAC(sb, "CNEYT-IV");
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

  log(`\n✅ CNEYT-IV refuerzo: ${ok} actividades insertadas, ${fail} fallidas.\n`);
}

// ── REFUERZOS POR PROGRESIÓN ───────────────────────────────────────────────────

const refuerzos: Refuerzo[][] = [
  // ════════════ P01 — Balanceo de ecuaciones químicas ════════════
  [
    {
      titulo: "Verdadero o Falso — Ecuaciones químicas y ley de conservación",
      descripcion: "Decide si cada afirmación sobre el balanceo de ecuaciones y la ley de conservación de la masa es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "La ley de conservación de la masa establece que la masa total de los reactivos es igual a la masa total de los productos en una reacción química.", respuesta: true, retroalimentacion: "Correcto: Lavoisier formuló que la materia no se crea ni se destruye, solo se transforma; los átomos se reorganizan." },
          { enunciado: "Al balancear una ecuación química se pueden cambiar los subíndices de las fórmulas para igualar los átomos de cada elemento.", respuesta: false, retroalimentacion: "Nunca se cambian los subíndices porque alterarían la identidad de las sustancias. Solo se ajustan los coeficientes estequiométricos frente a cada fórmula." },
          { enunciado: "En la ecuación balanceada H₂ + O₂ → H₂O, el número de átomos de oxígeno es igual en reactivos y productos.", respuesta: false, retroalimentacion: "Esa ecuación no está balanceada: hay 2 átomos de O en los reactivos y solo 1 en H₂O. La forma correcta es 2H₂ + O₂ → 2H₂O." },
          { enunciado: "Los coeficientes en una ecuación balanceada representan la proporción molar de cada sustancia que interviene en la reacción.", respuesta: true, retroalimentacion: "Correcto: los coeficientes indican cuántos moles de cada reactivo se consumen y cuántos moles de cada producto se forman." },
          { enunciado: "Una ecuación química balanceada conserva el número de átomos de cada elemento entre reactivos y productos.", respuesta: true, retroalimentacion: "Correcto: el balance asegura que cada tipo de átomo esté en igual cantidad en ambos lados de la flecha." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Ecuaciones y estequiometría",
      descripcion: "Glosario interactivo de términos esenciales sobre ecuaciones químicas y ley de conservación de la masa.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "Ley de conservación de la masa", definicion: "Principio que establece que la masa total de los reactivos es igual a la masa total de los productos en cualquier reacción química.", ejemplo: "Al quemar 12 g de carbono con 32 g de oxígeno se obtienen 44 g de CO₂, conservando la masa total.", etiquetas: ["leyes", "estequiometría"] },
          { termino: "Ecuación química", definicion: "Representación simbólica de una reacción química que muestra reactivos y productos con sus fórmulas y coeficientes.", ejemplo: "CH₄ + 2O₂ → CO₂ + 2H₂O representa la combustión del metano.", etiquetas: ["ecuaciones"] },
          { termino: "Coeficiente estequiométrico", definicion: "Número entero que se coloca frente a una fórmula química para indicar la proporción molar de esa sustancia en la reacción.", ejemplo: "En 2H₂ + O₂ → 2H₂O, el '2' frente a H₂ y H₂O son coeficientes.", etiquetas: ["estequiometría", "ecuaciones"] },
          { termino: "Reactivo", definicion: "Sustancia que se consume en una reacción química; aparece al lado izquierdo de la flecha.", ejemplo: "En la combustión del propano, el C₃H₈ y el O₂ son los reactivos.", etiquetas: ["ecuaciones"] },
          { termino: "Producto", definicion: "Sustancia que se forma como resultado de una reacción química; aparece al lado derecho de la flecha.", ejemplo: "En la combustión del propano, CO₂ y H₂O son los productos.", etiquetas: ["ecuaciones"] },
          { termino: "Balanceo por tanteo", definicion: "Método para ajustar los coeficientes de una ecuación química igualando el número de átomos de cada elemento en ambos lados de la flecha.", ejemplo: "Para balancear Fe + O₂ → Fe₂O₃ se obtiene 4Fe + 3O₂ → 2Fe₂O₃.", etiquetas: ["ecuaciones", "métodos"] },
        ],
        actividad_final: "Balancea las siguientes ecuaciones: a) Al + O₂ → Al₂O₃, b) C₃H₈ + O₂ → CO₂ + H₂O. Explica qué coeficientes usaste y por qué.",
      },
    },
    {
      titulo: "Rellena los huecos — Ecuaciones químicas",
      descripcion: "Completa el texto con los términos correctos sobre balanceo de ecuaciones y ley de conservación.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los cuatro huecos con la palabra o expresión correcta.",
        texto_con_huecos: "La ley de conservación de la ___ establece que los átomos no se crean ni se destruyen en una reacción. Para balancear una ecuación solo se modifican los ___ estequiométricos, nunca los subíndices. Los ___ son las sustancias de partida que aparecen al lado izquierdo de la flecha. Los ___ son las sustancias que se forman al lado derecho de la flecha.",
        huecos: [
          { posicion: 0, respuesta_correcta: "masa", alternativas_aceptadas: ["materia"], pista: "Magnitud física que se conserva en toda reacción química según el principio de Lavoisier." },
          { posicion: 1, respuesta_correcta: "coeficientes", alternativas_aceptadas: ["coeficiente"], pista: "Números enteros que se colocan frente a las fórmulas para balancear la ecuación." },
          { posicion: 2, respuesta_correcta: "reactivos", alternativas_aceptadas: ["reactivo"], pista: "Sustancias que se consumen en la reacción; aparecen a la izquierda de la flecha." },
          { posicion: 3, respuesta_correcta: "productos", alternativas_aceptadas: ["producto"], pista: "Sustancias que se forman en la reacción; aparecen a la derecha de la flecha." },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Ecuaciones químicas y balanceo",
      descripcion: "Evalúa tu comprensión sobre el balanceo de ecuaciones y la ley de conservación de la masa.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio. Esta autoevaluación te ayuda a identificar qué reforzar.",
        criterios: [
          { descripcion: "Enuncio la ley de conservación de la masa y la relaciono con el balanceo de ecuaciones.", escala: escala4 },
          { descripcion: "Distingo coeficientes y subíndices en una ecuación química y sé cuál se puede modificar al balancear.", escala: escala4 },
          { descripcion: "Balanceo ecuaciones simples por el método de tanteo verificando que el número de átomos sea igual en ambos lados.", escala: escala4 },
          { descripcion: "Interpreto los coeficientes de una ecuación balanceada como proporciones molares entre reactivos y productos.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Qué estrategia usas cuando te cuesta balancear una ecuación compleja? ¿Qué parte del proceso te resulta más difícil y por qué?",
      },
    },
  ],

  // ════════════ P02 — Tipos de reacciones químicas ════════════
  [
    {
      titulo: "Verdadero o Falso — Tipos de reacciones químicas",
      descripcion: "Decide si cada afirmación sobre los tipos de reacciones químicas (síntesis, descomposición, desplazamiento, combustión) es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "En una reacción de síntesis (combinación) dos o más sustancias simples o compuestas se unen para formar un único producto.", respuesta: true, retroalimentacion: "Correcto: la síntesis sigue el patrón A + B → AB. Ejemplo: 2Na + Cl₂ → 2NaCl." },
          { enunciado: "En una reacción de descomposición, una sola sustancia se divide en dos o más productos más simples.", respuesta: true, retroalimentacion: "Sí: la descomposición sigue el patrón AB → A + B. Ejemplo: 2H₂O₂ → 2H₂O + O₂." },
          { enunciado: "En una reacción de combustión completa, el oxígeno es el producto principal que se genera.", respuesta: false, retroalimentacion: "En la combustión, el oxígeno es el reactivo (comburente), no el producto. Los productos de una combustión completa de hidrocarburos son CO₂ y H₂O." },
          { enunciado: "En una reacción de desplazamiento simple, un elemento reemplaza a otro en un compuesto.", respuesta: true, retroalimentacion: "Correcto: el patrón es A + BC → AC + B. Ejemplo: Zn + H₂SO₄ → ZnSO₄ + H₂." },
          { enunciado: "La precipitación es una reacción en la que dos soluciones iónicas producen un sólido insoluble llamado precipitado.", respuesta: true, retroalimentacion: "Correcto: la reacción de doble desplazamiento puede generar un precipitado cuando los iones formados son insolubles. Ejemplo: AgNO₃ + NaCl → AgCl↓ + NaNO₃." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Tipos de reacciones químicas",
      descripcion: "Glosario interactivo de los principales tipos de reacciones químicas y sus características.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "Reacción de síntesis", definicion: "Tipo de reacción en que dos o más sustancias se combinan para formar un único compuesto. Patrón: A + B → AB.", ejemplo: "2Mg + O₂ → 2MgO (formación de óxido de magnesio).", etiquetas: ["tipos de reacciones"] },
          { termino: "Reacción de descomposición", definicion: "Tipo de reacción en que una sola sustancia se divide en dos o más productos más simples. Patrón: AB → A + B.", ejemplo: "2H₂O₂ → 2H₂O + O₂↑ (descomposición del peróxido de hidrógeno).", etiquetas: ["tipos de reacciones"] },
          { termino: "Reacción de desplazamiento simple", definicion: "Un elemento desplaza a otro en un compuesto. Patrón: A + BC → AC + B.", ejemplo: "Fe + CuSO₄ → FeSO₄ + Cu (el hierro desplaza al cobre).", etiquetas: ["tipos de reacciones"] },
          { termino: "Reacción de doble desplazamiento", definicion: "Dos compuestos iónicos intercambian sus cationes formando dos nuevos compuestos. Patrón: AB + CD → AD + CB.", ejemplo: "AgNO₃ + NaCl → AgCl↓ + NaNO₃ (precipitación de cloruro de plata).", etiquetas: ["tipos de reacciones"] },
          { termino: "Reacción de combustión", definicion: "Un combustible reacciona con oxígeno liberando energía en forma de calor y luz. La combustión completa de hidrocarburos produce CO₂ y H₂O.", ejemplo: "CH₄ + 2O₂ → CO₂ + 2H₂O (combustión completa del gas natural).", etiquetas: ["tipos de reacciones", "energía"] },
          { termino: "Precipitado", definicion: "Sólido insoluble que se forma dentro de una solución como resultado de una reacción de doble desplazamiento.", ejemplo: "El PbSO₄ es un precipitado blanco que se forma al mezclar soluciones de Pb(NO₃)₂ y Na₂SO₄.", etiquetas: ["precipitación", "solubilidad"] },
        ],
        actividad_final: "Clasifica las siguientes reacciones según su tipo y predice los productos: a) Ca + Cl₂ → ?, b) CaCO₃ → ?, c) C₂H₅OH + O₂ → ?, d) Pb(NO₃)₂ + 2KI → ?",
      },
    },
    {
      titulo: "Rellena los huecos — Tipos de reacciones",
      descripcion: "Completa el texto con los términos correctos sobre los tipos de reacciones químicas.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los cuatro huecos con la palabra o expresión correcta.",
        texto_con_huecos: "En una reacción de ___, dos o más sustancias se unen para formar un solo producto nuevo. La reacción en que una sustancia se divide en dos o más compuestos más simples se llama ___. La combustión completa de un hidrocarburo produce ___ y agua como productos principales. Cuando se mezclan dos soluciones iónicas y se forma un sólido insoluble, el sólido recibe el nombre de ___.",
        huecos: [
          { posicion: 0, respuesta_correcta: "síntesis", alternativas_aceptadas: ["combinación", "sintesis"], pista: "Tipo de reacción donde A + B → AB; dos sustancias se unen en una sola." },
          { posicion: 1, respuesta_correcta: "descomposición", alternativas_aceptadas: ["descomposicion"], pista: "Tipo de reacción donde AB → A + B; una sustancia se divide en varias más simples." },
          { posicion: 2, respuesta_correcta: "dióxido de carbono", alternativas_aceptadas: ["CO2", "CO₂", "bióxido de carbono"], pista: "Gas que se produce al oxidar completamente el carbono presente en un hidrocarburo." },
          { posicion: 3, respuesta_correcta: "precipitado", alternativas_aceptadas: [], pista: "Sólido insoluble que se forma dentro de una solución en una reacción de doble desplazamiento." },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Tipos de reacciones químicas",
      descripcion: "Evalúa tu comprensión sobre la clasificación y predicción de los tipos de reacciones químicas.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Identifico y clasifico los cinco tipos principales de reacciones (síntesis, descomposición, desplazamiento simple, doble desplazamiento y combustión) con sus patrones.", escala: escala4 },
          { descripcion: "Predigo los productos de una reacción de combustión completa dado un hidrocarburo como reactivo.", escala: escala4 },
          { descripcion: "Explico qué es un precipitado y en qué tipo de reacción se forma.", escala: escala4 },
          { descripcion: "Relaciono el tipo de reacción con aplicaciones cotidianas o industriales concretas.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Cuál tipo de reacción química encuentras más en tu vida cotidiana? Describe un ejemplo y clasifícalo correctamente.",
      },
    },
  ],

  // ════════════ P03 — pH, ácidos y bases ════════════
  [
    {
      titulo: "Verdadero o Falso — pH, ácidos y bases",
      descripcion: "Decide si cada afirmación sobre el pH y las propiedades de ácidos y bases en contextos cotidianos y biológicos es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "Una solución con pH 3 es más ácida que una solución con pH 6.", respuesta: true, retroalimentacion: "Correcto: a menor valor de pH, mayor concentración de iones H⁺ y mayor acidez. La escala es logarítmica, así que pH 3 es 1000 veces más ácido que pH 6." },
          { enunciado: "Los ácidos tienen pH mayor de 7 y los bases tienen pH menor de 7.", respuesta: false, retroalimentacion: "Es al revés: los ácidos tienen pH menor de 7 (mayor [H⁺]) y las bases tienen pH mayor de 7 (mayor [OH⁻])." },
          { enunciado: "La sangre humana tiene un pH aproximado de 7.4, lo que la hace ligeramente básica.", respuesta: true, retroalimentacion: "Correcto: el pH de la sangre oscila entre 7.35 y 7.45; mantenerlo en ese rango es vital para el funcionamiento de enzimas y proteínas." },
          { enunciado: "Los indicadores de pH como el papel tornasol cambian de color dependiendo de la acidez o basicidad de la solución.", respuesta: true, retroalimentacion: "Correcto: el papel tornasol se vuelve rojo en medios ácidos y azul en medios básicos; otros indicadores como la fenolftaleína tienen colores distintos." },
          { enunciado: "La neutralización de un ácido con una base siempre produce sal y agua.", respuesta: true, retroalimentacion: "Correcto: la reacción ácido-base de neutralización generaliza ácido + base → sal + agua. Ejemplo: HCl + NaOH → NaCl + H₂O." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — pH, ácidos y bases",
      descripcion: "Glosario interactivo de términos clave sobre el pH, ácidos, bases y su importancia biológica.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "pH", definicion: "Medida de la concentración de iones hidrógeno (H⁺) en solución, en escala de 0 a 14. pH < 7 ácido, pH = 7 neutro, pH > 7 básico.", ejemplo: "El jugo de limón tiene pH ≈ 2 (ácido); el agua de mar tiene pH ≈ 8 (básico).", etiquetas: ["pH", "ácidos y bases"] },
          { termino: "Ácido de Arrhenius", definicion: "Sustancia que en solución acuosa libera iones hidrógeno (H⁺). Según Brønsted-Lowry, es un donador de protones.", ejemplo: "El ácido clorhídrico (HCl) es un ácido fuerte que se ioniza completamente en agua: HCl → H⁺ + Cl⁻.", etiquetas: ["ácidos"] },
          { termino: "Base de Arrhenius", definicion: "Sustancia que en solución acuosa libera iones hidróxido (OH⁻). Según Brønsted-Lowry, es un aceptor de protones.", ejemplo: "El hidróxido de sodio (NaOH) es una base fuerte: NaOH → Na⁺ + OH⁻.", etiquetas: ["bases"] },
          { termino: "Neutralización", definicion: "Reacción entre un ácido y una base que produce sal y agua, aproximando el pH al valor neutro 7.", ejemplo: "HCl + NaOH → NaCl + H₂O (sal de mesa + agua).", etiquetas: ["reacciones ácido-base"] },
          { termino: "Indicador de pH", definicion: "Sustancia (natural o sintética) que cambia de color en función del pH de la solución, permitiendo estimar su acidez o basicidad.", ejemplo: "El repollo morado contiene antocianinas que cambian de rojo intenso (ácido) a verde-amarillo (básico).", etiquetas: ["pH", "indicadores"] },
          { termino: "Buffer (solución tampón)", definicion: "Solución que resiste cambios bruscos de pH al añadir pequeñas cantidades de ácido o base.", ejemplo: "La sangre tiene un sistema buffer de bicarbonato que mantiene el pH entre 7.35 y 7.45.", etiquetas: ["pH", "biología"] },
        ],
        actividad_final: "Utiliza jugo de repollo morado como indicador natural y clasifica 5 sustancias del hogar (vinagre, bicarbonato, limón, leche, jabón) en ácidas, neutras o básicas según el color que presenten.",
      },
    },
    {
      titulo: "Rellena los huecos — pH, ácidos y bases",
      descripcion: "Completa el texto con los términos correctos sobre el pH y la química de ácidos y bases.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los cuatro huecos con la palabra o expresión correcta.",
        texto_con_huecos: "El ___ es una escala que mide la concentración de iones H⁺ en una solución y va de 0 a 14. Las soluciones con pH menor de 7 son ___, mientras que las soluciones con pH mayor de 7 son básicas. La sangre humana es ligeramente ___ con un pH de aproximadamente 7.4. La reacción de un ácido con una base produce ___ y agua en un proceso llamado neutralización.",
        huecos: [
          { posicion: 0, respuesta_correcta: "pH", alternativas_aceptadas: ["potencial de hidrógeno"], pista: "Escala logarítmica de 0 a 14 que mide la acidez o basicidad de una solución." },
          { posicion: 1, respuesta_correcta: "ácidas", alternativas_aceptadas: ["ácidos", "acidas", "acidos"], pista: "Tipo de solución con pH menor de 7 y mayor concentración de iones H⁺." },
          { posicion: 2, respuesta_correcta: "básica", alternativas_aceptadas: ["alcalina", "basica"], pista: "Tipo de solución con pH mayor de 7; la sangre tiene pH ≈ 7.4." },
          { posicion: 3, respuesta_correcta: "sal", alternativas_aceptadas: ["una sal"], pista: "Compuesto iónico que se forma junto con agua en la reacción de neutralización." },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — pH, ácidos y bases",
      descripcion: "Evalúa tu comprensión sobre el pH y la importancia de los ácidos y bases en contextos cotidianos y biológicos.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Interpreto la escala de pH y clasifico soluciones como ácidas, neutras o básicas.", escala: escala4 },
          { descripcion: "Describo las propiedades de ácidos y bases y doy ejemplos de cada uno en contextos cotidianos.", escala: escala4 },
          { descripcion: "Explico qué es la neutralización y escribo la ecuación general ácido + base → sal + agua.", escala: escala4 },
          { descripcion: "Argumento la importancia del pH en sistemas biológicos como la sangre, el estómago y los suelos agrícolas.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Por qué es peligroso para el organismo que el pH de la sangre se aleje de 7.4? Menciona al menos dos consecuencias fisiológicas.",
      },
    },
  ],

  // ════════════ P04 — Compuestos orgánicos básicos ════════════
  [
    {
      titulo: "Verdadero o Falso — Compuestos orgánicos: alcanos, alquenos, alcoholes y ácidos carboxílicos",
      descripcion: "Decide si cada afirmación sobre las propiedades y reactividad de los compuestos orgánicos básicos es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "Los alcanos son hidrocarburos saturados porque solo tienen enlaces simples carbono-carbono (C-C).", respuesta: true, retroalimentacion: "Correcto: los alcanos (CₙH₂ₙ₊₂) solo poseen enlaces simples, lo que los hace relativamente estables y poco reactivos comparados con los alquenos." },
          { enunciado: "Los alquenos contienen al menos un doble enlace carbono-carbono (C=C) que los hace más reactivos que los alcanos.", respuesta: true, retroalimentacion: "Correcto: el doble enlace C=C es un sitio de alta densidad electrónica que favorece reacciones de adición." },
          { enunciado: "El grupo funcional de los alcoholes es el carbonilo (C=O).", respuesta: false, retroalimentacion: "El grupo funcional de los alcoholes es el hidroxilo (-OH). El carbonilo (C=O) es el grupo característico de aldehídos, cetonas y ácidos carboxílicos." },
          { enunciado: "Los ácidos carboxílicos tienen el grupo funcional -COOH y son capaces de donar un protón (H⁺).", respuesta: true, retroalimentacion: "Correcto: el grupo carboxilo (-COOH) puede liberar H⁺ en solución acuosa, lo que confiere acidez a estos compuestos." },
          { enunciado: "El etanol (CH₃CH₂OH) es un alcohol de cadena larga con más de diez carbonos.", respuesta: false, retroalimentacion: "El etanol tiene solo 2 átomos de carbono; es un alcohol de cadena muy corta. Los alcoholes de cadena larga (como los cetílicos) tienen 12 o más carbonos." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Química orgánica básica",
      descripcion: "Glosario interactivo sobre alcanos, alquenos, alcoholes y ácidos carboxílicos.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "Alcano", definicion: "Hidrocarburo saturado con fórmula general CₙH₂ₙ₊₂ que solo contiene enlaces simples C-C.", ejemplo: "El metano (CH₄) es el alcano más simple; es el componente principal del gas natural.", etiquetas: ["orgánica", "hidrocarburos"] },
          { termino: "Alqueno", definicion: "Hidrocarburo insaturado con al menos un doble enlace C=C; fórmula general CₙH₂ₙ para cadena abierta.", ejemplo: "El etileno (CH₂=CH₂) es el alqueno más simple; se usa para madurar frutas artificialmente.", etiquetas: ["orgánica", "hidrocarburos"] },
          { termino: "Alcohol", definicion: "Compuesto orgánico con el grupo funcional hidroxilo (-OH) unido a un carbono saturado.", ejemplo: "El etanol (CH₃CH₂OH) es el alcohol presente en bebidas alcohólicas; el metanol (CH₃OH) es tóxico.", etiquetas: ["orgánica", "grupos funcionales"] },
          { termino: "Ácido carboxílico", definicion: "Compuesto orgánico con el grupo funcional carboxilo (-COOH); es ácido débil que cede un protón H⁺ en solución.", ejemplo: "El ácido acético (CH₃COOH) es el ácido carboxílico del vinagre.", etiquetas: ["orgánica", "grupos funcionales"] },
          { termino: "Grupo funcional", definicion: "Átomo o conjunto de átomos que determina las propiedades químicas características de una familia de compuestos orgánicos.", ejemplo: "El grupo carbonilo (C=O) es el grupo funcional de aldehídos y cetonas; el -OH lo es de los alcoholes.", etiquetas: ["orgánica", "grupos funcionales"] },
          { termino: "Hidrocarburo", definicion: "Compuesto orgánico formado exclusivamente por carbono e hidrógeno; incluye alcanos, alquenos, alquinos y aromáticos.", ejemplo: "El propano (C₃H₈) y el benceno (C₆H₆) son ejemplos de hidrocarburos.", etiquetas: ["orgánica", "hidrocarburos"] },
        ],
        actividad_final: "Identifica el grupo funcional y la familia orgánica de: a) CH₃OH, b) C₄H₁₀, c) CH₂=CHCH₃, d) CH₃COOH. Indica una propiedad o uso de cada uno.",
      },
    },
    {
      titulo: "Rellena los huecos — Compuestos orgánicos básicos",
      descripcion: "Completa el texto con los términos correctos sobre alcanos, alquenos, alcoholes y ácidos carboxílicos.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los cuatro huecos con la palabra o expresión correcta.",
        texto_con_huecos: "Los ___ son hidrocarburos que solo tienen enlaces simples C-C, lo que los hace relativamente poco reactivos. Los alquenos contienen al menos un enlace doble ___ que los hace más reactivos y capaces de sufrir reacciones de adición. El grupo funcional ___ (-OH) es característico de los alcoholes como el etanol. Los ácidos carboxílicos poseen el grupo ___ (-COOH) que les confiere carácter ácido.",
        huecos: [
          { posicion: 0, respuesta_correcta: "alcanos", alternativas_aceptadas: ["alcano"], pista: "Hidrocarburos saturados con fórmula CₙH₂ₙ₊₂ que solo tienen enlaces simples." },
          { posicion: 1, respuesta_correcta: "C=C", alternativas_aceptadas: ["carbono-carbono", "doble enlace carbono carbono"], pista: "Tipo de enlace característico de los alquenos que les da alta reactividad." },
          { posicion: 2, respuesta_correcta: "hidroxilo", alternativas_aceptadas: ["-OH", "OH"], pista: "Grupo funcional -OH que identifica a los alcoholes." },
          { posicion: 3, respuesta_correcta: "carboxilo", alternativas_aceptadas: ["-COOH", "COOH"], pista: "Grupo funcional -COOH que identifica a los ácidos carboxílicos." },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Compuestos orgánicos básicos",
      descripcion: "Evalúa tu comprensión sobre las propiedades y reactividad de alcanos, alquenos, alcoholes y ácidos carboxílicos.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Distingo las familias orgánicas (alcanos, alquenos, alcoholes, ácidos carboxílicos) por su grupo funcional y fórmula general.", escala: escala4 },
          { descripcion: "Relaciono el tipo de enlace (simple vs. doble) con la reactividad de alcanos y alquenos.", escala: escala4 },
          { descripcion: "Identifico el grupo funcional de un compuesto orgánico dado su nombre o fórmula.", escala: escala4 },
          { descripcion: "Menciono al menos un uso cotidiano o industrial de cada familia orgánica estudiada.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Por qué la química orgánica es esencial en la industria y la vida cotidiana? Menciona tres productos de tu vida diaria que sean compuestos orgánicos e identifica su familia.",
      },
    },
  ],

  // ════════════ P05 — Biomoléculas ════════════
  [
    {
      titulo: "Verdadero o Falso — Biomoléculas y sus funciones",
      descripcion: "Decide si cada afirmación sobre carbohidratos, lípidos, proteínas y ácidos nucleicos es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "Los carbohidratos son la principal fuente de energía inmediata de las células.", respuesta: true, retroalimentacion: "Correcto: la glucosa es el carbohidrato que las células oxidan preferentemente en la glucólisis y respiración celular para producir ATP." },
          { enunciado: "Los lípidos son insolubles en agua porque sus ácidos grasos son moléculas apolares.", respuesta: true, retroalimentacion: "Correcto: la cadena de carbonos e hidrógenos de los ácidos grasos es apolar; esto causa que los lípidos no se disuelvan en agua (solvente polar)." },
          { enunciado: "Las proteínas están formadas por la unión de nucleótidos mediante enlaces fosfodiéster.", respuesta: false, retroalimentacion: "Las proteínas están formadas por aminoácidos unidos mediante enlaces peptídicos. Los nucleótidos y los enlaces fosfodiéster son característicos de los ácidos nucleicos (ADN, ARN)." },
          { enunciado: "El ADN contiene la información genética codificada en secuencias de nucleótidos que determinan la síntesis de proteínas.", respuesta: true, retroalimentacion: "Correcto: la secuencia de bases nitrogenadas en el ADN codifica los aminoácidos de las proteínas a través del código genético." },
          { enunciado: "Los lípidos tienen función exclusivamente energética y no participan en la estructura celular.", respuesta: false, retroalimentacion: "Los lípidos tienen múltiples funciones: energía de reserva (triglicéridos), componentes estructurales de membranas (fosfolípidos) y moléculas señalizadoras (esteroides y hormonas)." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Biomoléculas",
      descripcion: "Glosario interactivo de los cuatro grupos de biomoléculas y sus funciones biológicas.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "Carbohidrato (glúcido)", definicion: "Biomolécula compuesta por C, H y O con fórmula general Cₙ(H₂O)ₙ; función principal: fuente de energía rápida y almacenamiento.", ejemplo: "La glucosa (C₆H₁₂O₆) es el carbohidrato que las células utilizan en la respiración celular.", etiquetas: ["biomoléculas", "energía"] },
          { termino: "Lípido", definicion: "Biomolécula apolar formada principalmente por C, H y O; funciones: reserva energética, componente de membranas y señalización.", ejemplo: "Los triglicéridos son lípidos de reserva; los fosfolípidos forman la bicapa lipídica de las membranas celulares.", etiquetas: ["biomoléculas", "membranas"] },
          { termino: "Proteína", definicion: "Polímero de aminoácidos unidos por enlaces peptídicos; funciones: estructura, catálisis (enzimas), transporte, defensa inmune y señalización.", ejemplo: "La hemoglobina transporta oxígeno; la queratina forma el cabello y las uñas.", etiquetas: ["biomoléculas", "enzimas"] },
          { termino: "Ácido nucleico", definicion: "Polímero de nucleótidos (ADN y ARN) que almacena y transmite la información genética y dirige la síntesis de proteínas.", ejemplo: "El ADN contiene el genoma; el ARNm lleva el mensaje del ADN al ribosoma para sintetizar proteínas.", etiquetas: ["biomoléculas", "genética"] },
          { termino: "Aminoácido", definicion: "Unidad estructural de las proteínas; molécula con un grupo amino (-NH₂), un grupo carboxilo (-COOH) y una cadena lateral (R) variable.", ejemplo: "La glicina es el aminoácido más simple; existen 20 aminoácidos proteinogénicos.", etiquetas: ["proteínas"] },
          { termino: "Nucleótido", definicion: "Unidad estructural de los ácidos nucleicos; compuesto por una base nitrogenada, un azúcar (ribosa o desoxirribosa) y un grupo fosfato.", ejemplo: "El AMP (adenosín monofosfato) es un nucleótido; el ATP (trifosfato) es la moneda energética de la célula.", etiquetas: ["ácidos nucleicos"] },
        ],
        actividad_final: "Elabora un cuadro comparativo de las cuatro biomoléculas indicando: unidad estructural, función principal y dos ejemplos de cada una.",
      },
    },
    {
      titulo: "Rellena los huecos — Biomoléculas",
      descripcion: "Completa el texto con los términos correctos sobre carbohidratos, lípidos, proteínas y ácidos nucleicos.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los cuatro huecos con el nombre correcto de la biomolécula o su unidad estructural.",
        texto_con_huecos: "Las proteínas están formadas por ___ unidos mediante enlaces peptídicos y cumplen funciones enzimáticas, estructurales y de transporte. Los ___ son apolares e insolubles en agua; forman la bicapa de las membranas celulares y sirven como reserva energética. El ADN y el ARN son ___ que almacenan y transmiten la información genética. Los ___ como la glucosa son la principal fuente de energía inmediata para las células.",
        huecos: [
          { posicion: 0, respuesta_correcta: "aminoácidos", alternativas_aceptadas: ["aminoacidos", "aminoácido"], pista: "Monómeros de las proteínas que contienen grupos -NH₂ y -COOH." },
          { posicion: 1, respuesta_correcta: "lípidos", alternativas_aceptadas: ["lipidos", "grasas"], pista: "Biomoléculas apolares que forman las membranas celulares y almacenan energía." },
          { posicion: 2, respuesta_correcta: "ácidos nucleicos", alternativas_aceptadas: ["acidos nucleicos"], pista: "Polímeros de nucleótidos que incluyen el ADN y el ARN." },
          { posicion: 3, respuesta_correcta: "carbohidratos", alternativas_aceptadas: ["glúcidos", "glucidos", "azúcares", "azucares"], pista: "Biomoléculas con fórmula Cₙ(H₂O)ₙ; la glucosa es su representante más conocido." },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Biomoléculas",
      descripcion: "Evalúa tu comprensión sobre los cuatro grupos de biomoléculas y sus funciones biológicas.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Identifico las cuatro biomoléculas principales (carbohidratos, lípidos, proteínas y ácidos nucleicos) y sus unidades estructurales.", escala: escala4 },
          { descripcion: "Relaciono la estructura de cada biomolécula con sus funciones biológicas específicas.", escala: escala4 },
          { descripcion: "Explico por qué los lípidos son insolubles en agua usando el concepto de polaridad.", escala: escala4 },
          { descripcion: "Describo el papel del ADN y el ARN en el flujo de información genética (ADN → ARN → proteína).", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Qué pasaría si las células no tuvieran proteínas? Menciona al menos tres procesos biológicos que se verían afectados.",
      },
    },
  ],

  // ════════════ P06 — Química orgánica, industria y sociedad ════════════
  [
    {
      titulo: "Verdadero o Falso — Química orgánica en la industria",
      descripcion: "Decide si cada afirmación sobre las aplicaciones de la química orgánica en la industria farmacéutica, alimentaria y de materiales es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "Los polímeros sintéticos como el nylon y el PET están formados por cadenas largas de monómeros orgánicos repetidos.", respuesta: true, retroalimentacion: "Correcto: los polímeros sintéticos se obtienen por reacciones de polimerización de monómeros orgánicos como éteres, ésteres o amidas." },
          { enunciado: "La fermentación alcohólica es un proceso industrial en que las levaduras transforman azúcares en etanol y CO₂.", respuesta: true, retroalimentacion: "Correcto: la fermentación alcohólica (C₆H₁₂O₆ → 2C₂H₅OH + 2CO₂) se usa en la producción de bebidas, pan y biocombustibles." },
          { enunciado: "Los fármacos son siempre sustancias inorgánicas; la química orgánica no participa en su síntesis.", respuesta: false, retroalimentacion: "La mayoría de los fármacos modernos son compuestos orgánicos. Ejemplo: la aspirina (ácido acetilsalicílico) y la penicilina son moléculas orgánicas de síntesis o semisíntesis." },
          { enunciado: "La petroquímica utiliza el petróleo como materia prima para producir plásticos, combustibles y solventes orgánicos.", respuesta: true, retroalimentacion: "Correcto: el refinado del petróleo y el craqueo catalítico producen compuestos orgánicos base para múltiples industrias." },
          { enunciado: "Los colorantes artificiales de los alimentos son siempre compuestos inorgánicos basados en metales pesados.", respuesta: false, retroalimentacion: "La mayoría de los colorantes artificiales (como tartrazina, rojo 40) son compuestos orgánicos sintéticos. Algunos colorantes inorgánicos existen, pero son la minoría." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Química orgánica industrial",
      descripcion: "Glosario interactivo sobre aplicaciones de la química orgánica en la industria farmacéutica, alimentaria y de materiales.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "Polímero", definicion: "Macromolécula formada por la unión repetida de unidades pequeñas llamadas monómeros mediante reacciones de polimerización.", ejemplo: "El polietileno (PE) es un polímero de etileno usado en envases y bolsas; la celulosa es un polímero natural de glucosa.", etiquetas: ["materiales", "orgánica"] },
          { termino: "Petroquímica", definicion: "Industria que procesa el petróleo y el gas natural para obtener compuestos orgánicos base: plásticos, combustibles, fibras sintéticas, solventes y fertilizantes.", ejemplo: "El etileno obtenido por craqueo del petróleo es la materia prima del polietileno y el PVC.", etiquetas: ["industria", "petróleo"] },
          { termino: "Fermentación", definicion: "Proceso metabólico anaerobio en que microorganismos (levaduras, bacterias) transforman azúcares en productos orgánicos útiles: etanol, ácido láctico, ácido acético.", ejemplo: "La fermentación alcohólica de la caña de azúcar produce bioetanol que se mezcla con la gasolina en México.", etiquetas: ["industria alimentaria", "biotecnología"] },
          { termino: "Fármaco", definicion: "Compuesto químico (mayoritariamente orgánico) que interactúa con moléculas biológicas para prevenir, tratar o curar enfermedades.", ejemplo: "La aspirina (C₉H₈O₄) es un fármaco orgánico antiinflamatorio derivado del ácido salicílico.", etiquetas: ["farmacéutica"] },
          { termino: "Aditivo alimentario", definicion: "Sustancia orgánica o inorgánica añadida a los alimentos para mejorar sabor, color, textura o vida útil.", ejemplo: "El ácido cítrico (E330) es un aditivo acidulante y conservante natural de origen orgánico.", etiquetas: ["industria alimentaria"] },
          { termino: "Bioplástico", definicion: "Polímero derivado de fuentes biológicas renovables (almidón, celulosa, PLA) en lugar de petróleo; generalmente biodegradable.", ejemplo: "Los envases de ácido poliláctico (PLA) hechos de almidón de maíz son bioplásticos.", etiquetas: ["materiales", "sostenibilidad"] },
        ],
        actividad_final: "Investiga un producto de uso cotidiano (medicamento, plástico o aditivo alimentario) e identifica: qué compuesto orgánico contiene, de dónde proviene la materia prima y qué reacción química se usa en su fabricación.",
      },
    },
    {
      titulo: "Rellena los huecos — Química orgánica en la industria",
      descripcion: "Completa el texto con los términos correctos sobre las aplicaciones industriales de la química orgánica.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los cuatro huecos con la palabra o expresión correcta.",
        texto_con_huecos: "Los ___ son macromoléculas formadas por la unión de monómeros orgánicos repetidos; el nylon y el PET son ejemplos industriales. La ___ es la industria que refina el petróleo para obtener plásticos, combustibles y solventes orgánicos. La fermentación alcohólica convierte azúcares en ___ y dióxido de carbono mediante levaduras. La mayoría de los ___ modernos son compuestos orgánicos que interactúan con moléculas biológicas del cuerpo.",
        huecos: [
          { posicion: 0, respuesta_correcta: "polímeros", alternativas_aceptadas: ["polimeros", "plásticos"], pista: "Macromoléculas formadas por monómeros repetidos; incluyen plásticos y fibras sintéticas." },
          { posicion: 1, respuesta_correcta: "petroquímica", alternativas_aceptadas: ["industria petroquímica", "petroquimica"], pista: "Industria que procesa el petróleo para obtener compuestos orgánicos base." },
          { posicion: 2, respuesta_correcta: "etanol", alternativas_aceptadas: ["alcohol etílico", "alcohol"], pista: "Alcohol de 2 carbonos producido por fermentación alcohólica de azúcares." },
          { posicion: 3, respuesta_correcta: "fármacos", alternativas_aceptadas: ["medicamentos", "farmacos"], pista: "Compuestos químicos que se usan para prevenir, tratar o curar enfermedades." },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Química orgánica en la industria",
      descripcion: "Evalúa tu comprensión sobre las aplicaciones de la química orgánica en la industria farmacéutica, alimentaria y de materiales.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Explico qué es un polímero y doy ejemplos de polímeros sintéticos de uso cotidiano.", escala: escala4 },
          { descripcion: "Relaciono la fermentación con la producción de alimentos, bebidas y biocombustibles.", escala: escala4 },
          { descripcion: "Argumento por qué la mayoría de los fármacos modernos son compuestos orgánicos.", escala: escala4 },
          { descripcion: "Identifico el papel de la petroquímica en la producción de materiales de uso diario.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Cuál consideras el avance más importante de la química orgánica para la sociedad mexicana? Argumenta con datos concretos.",
      },
    },
  ],

  // ════════════ P07 — Contaminantes químicos y plásticos en el ambiente ════════════
  [
    {
      titulo: "Verdadero o Falso — Contaminantes químicos y plásticos",
      descripcion: "Decide si cada afirmación sobre el impacto de los contaminantes químicos y los plásticos en el ambiente es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "Los microplásticos son fragmentos de plástico menores a 5 mm que pueden acumularse en organismos acuáticos y terrestres.", respuesta: true, retroalimentacion: "Correcto: los microplásticos provienen de la fragmentación de plásticos mayores por acción de la luz UV, el calor y el oleaje; afectan la cadena trófica." },
          { enunciado: "Los plásticos biodegradables se descomponen completamente en días en cualquier ambiente.", respuesta: false, retroalimentacion: "Los plásticos biodegradables requieren condiciones específicas de temperatura y humedad (compostaje industrial) para degradarse. En el ambiente natural su descomposición puede llevar meses o años." },
          { enunciado: "Los pesticidas organoclorados como el DDT pueden acumularse en los tejidos grasos de los organismos (bioacumulación).", respuesta: true, retroalimentacion: "Correcto: el DDT es lipofílico (se disuelve en grasas) y se bioacumula en la cadena trófica, alcanzando niveles tóxicos en depredadores apicales como águilas y ballenas." },
          { enunciado: "Los metales pesados como el plomo y el mercurio son fácilmente eliminados por el organismo humano sin causar daño.", respuesta: false, retroalimentacion: "Los metales pesados no son biodegradables en el organismo; se acumulan en órganos como el hígado, riñones y cerebro, causando daños neurológicos y sistémicos graves." },
          { enunciado: "La economía circular propone reducir residuos manteniendo los materiales en uso el mayor tiempo posible mediante reutilización y reciclaje.", respuesta: true, retroalimentacion: "Correcto: la economía circular se opone al modelo lineal (producir, usar, desechar) y busca cerrar ciclos de materiales para reducir la contaminación." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Contaminantes y plásticos en el ambiente",
      descripcion: "Glosario interactivo sobre microplásticos, contaminantes orgánicos persistentes y sus impactos ambientales.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "Microplástico", definicion: "Fragmento de plástico con diámetro menor a 5 mm que persiste en el ambiente acuático y terrestre.", ejemplo: "Las microfibras que se liberan al lavar ropa sintética son microplásticos que llegan al océano y son ingeridos por peces.", etiquetas: ["plásticos", "contaminación"] },
          { termino: "Contaminante orgánico persistente (COP)", definicion: "Compuesto orgánico sintético resistente a la degradación, altamente tóxico, que se bioacumula en la cadena trófica.", ejemplo: "El DDT, los PCB y las dioxinas son COPs regulados por el Convenio de Estocolmo.", etiquetas: ["contaminación", "orgánica"] },
          { termino: "Bioacumulación", definicion: "Acumulación de un contaminante en los tejidos de un organismo a mayor concentración que en su entorno.", ejemplo: "El mercurio se bioacumula en los tejidos de los peces de aguas contaminadas.", etiquetas: ["contaminación", "trófico"] },
          { termino: "Metal pesado", definicion: "Elemento metálico de alta densidad (Pb, Hg, Cd, As) que es tóxico incluso en pequeñas concentraciones y no es biodegradable.", ejemplo: "El plomo de las pinturas antiguas y el mercurio de termómetros rotos son fuentes de intoxicación por metales pesados.", etiquetas: ["contaminación", "toxicología"] },
          { termino: "Economía circular", definicion: "Modelo económico que busca eliminar residuos manteniendo materiales y productos en uso el mayor tiempo posible mediante reutilización, reparación y reciclaje.", ejemplo: "Fabricar nuevas botellas de PET a partir de botellas recicladas es un ejemplo de economía circular.", etiquetas: ["sostenibilidad", "plásticos"] },
          { termino: "Fotodegradación de plásticos", definicion: "Fragmentación de polímeros plásticos en partículas más pequeñas por la acción de la radiación ultravioleta del sol.", ejemplo: "Las botellas de plástico expuestas al sol durante años se vuelven frágiles y se fragmentan en microplásticos.", etiquetas: ["plásticos", "degradación"] },
        ],
        actividad_final: "Realiza un análisis de los residuos plásticos de tu hogar en una semana: registra tipo de plástico, cantidad y propone una alternativa para reducir cada uno.",
      },
    },
    {
      titulo: "Rellena los huecos — Contaminantes y plásticos",
      descripcion: "Completa el texto con los términos correctos sobre el impacto ambiental de los contaminantes químicos y los plásticos.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los cuatro huecos con la palabra o expresión correcta.",
        texto_con_huecos: "Los ___ son fragmentos de plástico menores a 5 mm que se acumulan en los organismos acuáticos y pueden llegar al ser humano a través de la cadena alimentaria. El DDT es un ejemplo de ___ orgánico persistente porque resiste la degradación y se bioacumula en las grasas de los organismos. Los metales pesados como el plomo y el mercurio no son ___ en el cuerpo humano y se acumulan causando daños graves. La ___ circular propone reutilizar y reciclar materiales para reducir los residuos y la contaminación.",
        huecos: [
          { posicion: 0, respuesta_correcta: "microplásticos", alternativas_aceptadas: ["microplasticos"], pista: "Fragmentos de plástico menores a 5 mm presentes en océanos y suelos." },
          { posicion: 1, respuesta_correcta: "contaminante", alternativas_aceptadas: ["contaminantes", "compuesto"], pista: "Tipo de sustancia química que persiste en el ambiente sin degradarse y se bioacumula." },
          { posicion: 2, respuesta_correcta: "biodegradables", alternativas_aceptadas: ["degradables"], pista: "Característica de ser descompuestos por microorganismos; los metales pesados NO la tienen." },
          { posicion: 3, respuesta_correcta: "economía", alternativas_aceptadas: ["modelo"], pista: "Término que completa 'economía circular': modelo que elimina residuos manteniendo materiales en uso." },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Contaminantes y plásticos en el ambiente",
      descripcion: "Evalúa tu comprensión sobre el impacto de los contaminantes químicos y los plásticos en el ambiente.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Explico qué son los microplásticos, cómo se forman y por qué representan un riesgo para los ecosistemas.", escala: escala4 },
          { descripcion: "Relaciono el concepto de bioacumulación con los contaminantes orgánicos persistentes y los metales pesados.", escala: escala4 },
          { descripcion: "Distingo las propiedades de los plásticos convencionales frente a los biodegradables y sus condiciones de degradación.", escala: escala4 },
          { descripcion: "Argumento por qué la economía circular es una alternativa sostenible al modelo de producción lineal.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Qué cambio de hábito concreto adoptarías para reducir tu huella de plásticos? Menciona uno a nivel personal y uno a nivel comunitario.",
      },
    },
  ],

  // ════════════ P08 — Experimentos de química con materiales accesibles ════════════
  [
    {
      titulo: "Verdadero o Falso — Experimentos de química casera",
      descripcion: "Decide si cada afirmación sobre el diseño, la seguridad y la interpretación de experimentos químicos con materiales accesibles es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "Una variable controlada en un experimento es aquella que el investigador mantiene constante para que no afecte los resultados.", respuesta: true, retroalimentacion: "Correcto: en el método científico, las variables controladas (o de control) son las que se mantienen iguales en todos los grupos del experimento." },
          { enunciado: "El volcán de bicarbonato es un ejemplo de reacción ácido-base porque el vinagre (ácido acético) reacciona con el bicarbonato de sodio (base).", respuesta: true, retroalimentacion: "Correcto: CH₃COOH + NaHCO₃ → CH₃COONa + H₂O + CO₂↑. El CO₂ genera la 'erupción'." },
          { enunciado: "En todo experimento químico, el uso de equipo de protección personal (bata, gafas) es opcional si los reactivos son caseros.", respuesta: false, retroalimentacion: "El equipo de protección siempre es necesario, incluso con reactivos caseros; el ácido acético concentrado puede irritar los ojos y la piel, y el bicarbonato puede generar salpicaduras." },
          { enunciado: "Una hipótesis debe ser falsable, es decir, debe poder ser refutada mediante observaciones o experimentos.", respuesta: true, retroalimentacion: "Correcto: la falsabilidad es un criterio central del método científico (Popper); una hipótesis no falsable no es científica." },
          { enunciado: "Los resultados de un experimento solo son válidos si confirman la hipótesis planteada.", respuesta: false, retroalimentacion: "Los resultados que refutan la hipótesis son igualmente válidos y valiosos; en ciencia, refutar hipótesis es parte esencial del proceso de construcción del conocimiento." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Método experimental y seguridad en el laboratorio",
      descripcion: "Glosario interactivo sobre el diseño experimental, la seguridad y la interpretación de resultados en experimentos de química.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "Variable independiente", definicion: "Factor que el investigador manipula deliberadamente para observar su efecto en la variable dependiente.", ejemplo: "En un experimento sobre velocidad de reacción, la temperatura es la variable independiente si se cambia de 20 °C a 40 °C.", etiquetas: ["método científico", "experimentación"] },
          { termino: "Variable dependiente", definicion: "Factor que se mide u observa en respuesta a los cambios en la variable independiente.", ejemplo: "En el mismo experimento, la velocidad de producción de burbujas es la variable dependiente.", etiquetas: ["método científico", "experimentación"] },
          { termino: "Hipótesis", definicion: "Explicación tentativa y falsable de un fenómeno observado, que puede comprobarse mediante experimentación.", ejemplo: "Hipótesis: 'Si aumento la temperatura, la velocidad de reacción entre el bicarbonato y el vinagre aumentará'.", etiquetas: ["método científico"] },
          { termino: "Grupo control", definicion: "Grupo del experimento que no recibe el tratamiento estudiado; sirve como referencia para comparar los resultados.", ejemplo: "En un experimento sobre solubilidad, el grupo control usa agua a temperatura ambiente mientras los experimentales usan agua caliente.", etiquetas: ["método científico", "experimentación"] },
          { termino: "Equipo de protección personal (EPP)", definicion: "Conjunto de dispositivos de seguridad (bata, gafas, guantes, mascarilla) que protegen al experimentador de riesgos químicos o físicos.", ejemplo: "Al mezclar ácido acético y bicarbonato se deben usar gafas y bata para evitar salpicaduras.", etiquetas: ["seguridad", "laboratorio"] },
          { termino: "Indicador natural de pH", definicion: "Pigmento vegetal que cambia de color en función del pH; se extrae de plantas como el repollo morado, la Jamaica o la cúrcuma.", ejemplo: "El jugo de repollo morado se vuelve rojo en medios ácidos, verde en medios básicos y violeta en medios neutros.", etiquetas: ["pH", "experimentación"] },
        ],
        actividad_final: "Diseña un experimento para medir la velocidad de reacción entre vinagre y bicarbonato a dos temperaturas distintas. Incluye: hipótesis, variable independiente, variable dependiente, variables controladas, procedimiento y tabla de resultados.",
      },
    },
    {
      titulo: "Rellena los huecos — Diseño experimental",
      descripcion: "Completa el texto con los términos correctos sobre el método experimental y la seguridad en el laboratorio.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los cuatro huecos con la palabra o expresión correcta.",
        texto_con_huecos: "En un experimento, la ___ independiente es el factor que el investigador modifica deliberadamente. La ___ dependiente es la que se mide como respuesta a ese cambio. El grupo ___ no recibe el tratamiento y sirve de referencia para comparar los resultados. Para plantear una buena hipótesis científica esta debe ser ___, es decir, debe poderse comprobar o refutar con evidencia.",
        huecos: [
          { posicion: 0, respuesta_correcta: "variable", alternativas_aceptadas: [], pista: "Factor del experimento que el investigador manipula de forma deliberada." },
          { posicion: 1, respuesta_correcta: "variable", alternativas_aceptadas: [], pista: "Factor que se mide u observa como resultado de los cambios en la variable independiente." },
          { posicion: 2, respuesta_correcta: "control", alternativas_aceptadas: ["de control"], pista: "Grupo que no recibe el tratamiento y actúa como referencia en el experimento." },
          { posicion: 3, respuesta_correcta: "falsable", alternativas_aceptadas: ["comprobable", "verificable", "refutable"], pista: "Característica esencial de una hipótesis científica: debe poder ser refutada con datos." },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Experimentos de química",
      descripcion: "Evalúa tu capacidad para diseñar, realizar e interpretar experimentos sencillos de química con materiales accesibles.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio. Es la autoevaluación final de CNEYT-IV.",
        criterios: [
          { descripcion: "Identifico las variables independiente, dependiente y controladas de un experimento dado.", escala: escala4 },
          { descripcion: "Redacto una hipótesis falsable relacionando una variable independiente con una variable dependiente.", escala: escala4 },
          { descripcion: "Aplico las normas básicas de seguridad (EPP) al diseñar o realizar experimentos con reactivos caseros.", escala: escala4 },
          { descripcion: "Interpreto correctamente los resultados de un experimento, incluyendo cuando refutan la hipótesis planteada.", escala: escala4 },
        ],
        reflexion_final_prompt: "De todos los experimentos de química que realizaste en CNEYT-IV, ¿cuál te pareció más revelador? ¿Qué concepto químico te aclaró y cómo lo conectas con tu vida cotidiana?",
      },
    },
  ],
];

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
