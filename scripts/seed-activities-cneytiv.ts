/**
 * Seed de actividades pedagógicas para CNEYT-IV (Ciencias Naturales, Experimentales y Tecnología IV).
 * Unidad de Aprendizaje: Química — reacciones, ácidos/bases, orgánica y biomoléculas.
 * 8 progresiones × 3 actividades = 24 actividades. estado='publicada'.
 * Tipos: lectura, ejercicio_matematico, quiz_multiple_opcion, infografia, reflexion_escrita,
 *        video_con_preguntas, simulacion, quiz_verdadero_falso, autoevaluacion, debate_estructurado (10 tipos)
 * Uso: npx tsx scripts/seed-activities-cneytiv.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🌱 Seed actividades CNEYT-IV — Química: reacciones, ácidos y biomoléculas\n");

  const progs = await getProgresionesDeUAC(sb, "CNEYT-IV");
  let ok = 0; let fail = 0;

  // 8 propósitos × 3 actividades = 24 total
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
      descripcion: "Práctica de verificación y ejercicio científico.",
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

  log(`\n✅ CNEYT-IV: ${ok} actividades insertadas, ${fail} fallidas.\n`);
}

const titulos = [
  { a1: "La ley de conservación de masa y el balanceo de ecuaciones", a2: "Balancea: ejercicio paso a paso con ecuaciones reales", a3: "¿Cuánto dominas el balanceo? Quiz de cierre" },
  { a1: "Tipos de reacciones químicas: de la síntesis a la combustión", a2: "Clasifica las reacciones: quiz de tipos", a3: "Reflexión: las reacciones químicas en mi vida cotidiana" },
  { a1: "El pH: ácidos, bases y la química de lo cotidiano", a2: "Simulación de laboratorio: midiendo el pH", a3: "Reflexión: ácidos y bases en mi cuerpo y en casa" },
  { a1: "Química orgánica: alcanos, alquenos, alcoholes y ácidos carboxílicos", a2: "Grupos funcionales y nomenclatura: quiz de química orgánica", a3: "Autoevaluación: comprensión de compuestos orgánicos básicos" },
  { a1: "Biomoléculas: los cuatro compuestos de la vida", a2: "¿Verdadero o falso? Biomoléculas a fondo", a3: "Reflexión: las biomoléculas en la alimentación mexicana" },
  { a1: "Química orgánica en la industria: fármacos, alimentos y materiales", a2: "Aplicaciones industriales de la química orgánica: quiz", a3: "Debate: ¿ganancias o bienestar? La responsabilidad de la industria química" },
  { a1: "Contaminantes químicos y plásticos: la crisis silenciosa", a2: "¿Verdadero o falso? Plásticos y contaminantes en el ambiente", a3: "Reflexión: el plástico en mi comunidad y qué puedo hacer" },
  { a1: "Química en casa: experimentos con materiales accesibles", a2: "Simulación: experimentos de química casera", a3: "Autoevaluación: mis habilidades de experimentación científica" },
];

const tiposA1 = ["lectura", "infografia", "video_con_preguntas", "lectura", "infografia", "lectura", "video_con_preguntas", "lectura"] as const;
const tiposA2 = ["ejercicio_matematico", "quiz_multiple_opcion", "simulacion", "quiz_multiple_opcion", "quiz_verdadero_falso", "quiz_multiple_opcion", "quiz_verdadero_falso", "simulacion"] as const;
const tiposA3 = ["quiz_multiple_opcion", "reflexion_escrita", "reflexion_escrita", "autoevaluacion", "reflexion_escrita", "debate_estructurado", "reflexion_escrita", "autoevaluacion"] as const;

// ── A1 ──────────────────────────────────────────────────────────────────────────
const contenidosA1 = [
  { // P01 — lectura (Balanceo de ecuaciones y ley de conservación de masa)
    titulo: "La ley de conservación de masa: nada se crea ni se destruye",
    texto: `Antoine Lavoisier formuló en el siglo XVIII uno de los principios fundamentales de la química: en una reacción química, la masa de los reactivos es exactamente igual a la masa de los productos. Los átomos no se crean ni se destruyen; solo se reorganizan para formar nuevas sustancias. Esta ley, conocida como la Ley de Conservación de la Masa, es la base de todo cálculo estequiométrico y del balanceo de ecuaciones químicas.\n\nUna ecuación química no balanceada es como una receta con las proporciones incorrectas. Por ejemplo, H₂ + O₂ → H₂O parece correcta, pero no lo está: hay 2 átomos de oxígeno en los reactivos y solo 1 en los productos. La versión balanceada es 2 H₂ + O₂ → 2 H₂O, donde se conservan todos los átomos.\n\nEl procedimiento para balancear ecuaciones se llama balanceo por inspección o balanceo por tanteo. Consiste en ajustar los coeficientes estequiométricos (los números que preceden a las fórmulas) sin cambiar las subíndices de cada fórmula, porque cambiar los subíndices significaría cambiar la sustancia misma. Por ejemplo, H₂O (agua) y H₂O₂ (agua oxigenada) son moléculas completamente distintas.\n\nEn México, la comprensión del balanceo tiene aplicaciones industriales cotidianas. PEMEX utiliza ecuaciones balanceadas para calcular el rendimiento de combustibles y los subproductos de la refinación del petróleo. Las plantas cementeras del grupo CEMEX controlan reacciones de descomposición del carbonato de calcio (CaCO₃ → CaO + CO₂) para optimizar su proceso productivo. En la metalurgia, como en las plantas de ArcelorMittal en Lázaro Cárdenas (Michoacán), el balanceo de las reacciones de reducción del hierro determina las cantidades exactas de coque y mineral de hierro que deben usarse.\n\nDominar el balanceo no es solo un ejercicio matemático: es la herramienta que permite a los químicos, ingenieros y técnicos calcular cuánto de cada reactivo se necesita y cuánto producto se obtendrá, minimizando desperdicios y maximizando la seguridad industrial.`,
    fuente: "Material elaborado para CEN Bachillerato — CNEYT-IV",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 10,
    preguntas_comprension: [
      { pregunta: "¿Qué establece la Ley de Conservación de la Masa y quién la formuló?", respuesta_guia: "Formulada por Lavoisier, establece que en una reacción química la masa de los reactivos es igual a la masa de los productos; los átomos no se crean ni destruyen, solo se reorganizan." },
      { pregunta: "¿Por qué no se deben cambiar los subíndices al balancear una ecuación?", respuesta_guia: "Porque los subíndices definen la fórmula química de cada sustancia; cambiarlos significaría cambiar la sustancia (ej. H₂O → agua; H₂O₂ → agua oxigenada). Solo se ajustan los coeficientes estequiométricos." },
      { pregunta: "Da un ejemplo de cómo el balanceo de ecuaciones se aplica en la industria mexicana.", respuesta_guia: "PEMEX lo usa para calcular el rendimiento de combustibles; CEMEX para controlar la descomposición del CaCO₃ en la producción de cemento; ArcelorMittal en Lázaro Cárdenas para calcular proporciones de coque y mineral de hierro en la producción de acero." },
      { pregunta: "¿Qué diferencia hay entre un coeficiente estequiométrico y un subíndice en una fórmula química?", respuesta_guia: "El coeficiente (ej. el '2' en 2 H₂O) indica cuántas moléculas de esa sustancia participan; el subíndice (ej. el '2' en H₂) indica cuántos átomos de cada elemento hay dentro de una sola molécula." },
    ],
  },
  { // P02 — infografia (Tipos de reacciones químicas)
    titulo: "Cinco tipos de reacciones químicas: reconocerlas y clasificarlas",
    url_imagen: "/placeholder/infografia.svg",
    descripcion_accesible: "Infografía de los cinco tipos principales de reacciones químicas: síntesis (combinación), descomposición, sustitución simple (desplazamiento), doble sustitución (metátesis) y combustión. Para cada tipo se muestra el esquema general, un ejemplo con fórmulas reales y una aplicación cotidiana o industrial.",
    puntos_clave: [
      "Síntesis o combinación (A + B → AB): dos o más sustancias se unen para formar una sola. Ejemplo: 2 H₂ + O₂ → 2 H₂O. Aplicación: producción de amoníaco en el proceso Haber-Bosch (N₂ + 3 H₂ → 2 NH₃), base de los fertilizantes nitrogenados que alimentan al mundo.",
      "Descomposición (AB → A + B): una sola sustancia se divide en dos o más productos más simples. Ejemplo: 2 H₂O₂ → 2 H₂O + O₂ (descomposición del agua oxigenada con catalizador). Aplicación: CEMEX controla la descomposición de CaCO₃ → CaO + CO₂ en la fabricación de cemento.",
      "Sustitución simple o desplazamiento (A + BC → AC + B): un elemento desplaza a otro dentro de un compuesto. Ejemplo: Fe + CuSO₄ → FeSO₄ + Cu. Aplicación: electrodeposición de metales en la industria joyera y de recubrimientos metálicos.",
      "Doble sustitución o metátesis (AB + CD → AD + CB): los iones de dos compuestos se intercambian para formar dos nuevos compuestos. Ejemplo: HCl + NaOH → NaCl + H₂O (reacción de neutralización). Aplicación: tratamiento de aguas residuales industriales para neutralizar efluentes ácidos o básicos.",
      "Combustión (hidrocarburo + O₂ → CO₂ + H₂O): un combustible se oxida rápidamente liberando energía. Ejemplo completo: CH₄ + 2 O₂ → CO₂ + 2 H₂O. Aplicación: las refinerías de PEMEX procesan hidrocarburos cuya combustión satisface el 70% de la demanda energética primaria de México.",
      "Indicios de reacción química: cambio de color, formación de precipitado, producción de gas (burbujas), cambio de temperatura notable o producción de luz. Estos cambios indican que se formó una nueva sustancia con propiedades diferentes a los reactivos.",
      "Conservación en todos los tipos: independientemente del tipo de reacción, la Ley de Conservación de la Masa siempre se cumple. Los coeficientes estequiométricos garantizan que el número de átomos de cada elemento sea idéntico en reactivos y productos.",
    ],
    fuente: "Material CEN Bachillerato — CNEYT-IV. Referencias: Chang & Goldsby, Química (12ª ed.); PEMEX Informe anual 2023.",
  },
  { // P03 — video_con_preguntas (pH en la vida cotidiana y biológica)
    url_video: "https://example.com/video-pendiente-cen",
    titulo_video: "El pH en tu cuerpo y en tu cocina: la química del equilibrio ácido-base",
    duracion_segundos: 495,
    preguntas: [
      { tiempo_segundos: 95, pregunta: "¿Qué mide la escala de pH y cuáles son los valores que corresponden a una solución ácida, neutra y básica? Menciona el pH del ácido estomacal y de la sangre.", respuesta_guia: "El pH mide la concentración de iones H⁺ en solución. Escala de 0 a 14: ácido (<7), neutro (7), básico o alcalino (>7). El ácido gástrico tiene pH ~1-2 (muy ácido); la sangre humana tiene pH 7.35-7.45 (ligeramente básica)." },
      { tiempo_segundos: 290, pregunta: "¿Qué es una reacción de neutralización? Da el ejemplo del antiácido estomacal y escribe la ecuación general.", respuesta_guia: "Una neutralización es la reacción entre un ácido y una base que produce sal y agua. Ejemplo: los antiácidos (como el hidróxido de magnesio, Mg(OH)₂) neutralizan el HCl estomacal: Mg(OH)₂ + 2 HCl → MgCl₂ + 2 H₂O. El IMSS y el ISSSTE distribuyen antiácidos como medicamento de primer nivel." },
      { tiempo_segundos: 440, pregunta: "¿Qué ocurre si el pH de la sangre sube a 7.6 o baja a 7.2? ¿Cómo mantiene el cuerpo el pH sanguíneo estable?", respuesta_guia: "Si el pH sanguíneo sube de 7.45 (alcalosis) o baja de 7.35 (acidosis), las enzimas dejan de funcionar correctamente y puede haber convulsiones, paro cardíaco o muerte. El cuerpo usa sistemas amortiguadores (buffer) como el bicarbonato (HCO₃⁻/H₂CO₃) y la respiración (excretar más o menos CO₂) para mantenerlo estable." },
    ],
  },
  { // P04 — lectura (Química orgánica básica: grupos funcionales)
    titulo: "Química orgánica: el carbono como arquitecto de la vida y la industria",
    texto: `La química orgánica es el estudio de los compuestos del carbono. ¿Por qué el carbono es tan especial? Porque puede formar cuatro enlaces covalentes, lo que le permite unirse a sí mismo formando cadenas, ramificaciones y anillos de cualquier longitud. Esta capacidad genera millones de compuestos diferentes; se conocen más de 20 millones de compuestos orgánicos distintos, comparados con solo unos 500,000 compuestos inorgánicos.\n\nLos alcanos son los hidrocarburos más simples: contienen solo carbono e hidrógeno con enlaces simples (C–C). El metano (CH₄) es el principal componente del gas natural que distribuye la CFE en México; el propano (C₃H₈) y el butano (C₄H₁₀) forman el gas LP que usan millones de hogares mexicanos para cocinar y calentar agua. Los alcanos son relativamente poco reactivos (por eso también se les llama "parafinas") y su principal reacción es la combustión.\n\nLos alquenos tienen al menos un doble enlace C=C, que los hace mucho más reactivos. El etileno (eteno, C₂H₄) es el compuesto orgánico más producido industrialmente en el mundo: es la materia prima del polietileno (bolsas de plástico, tuberías) y del PVC. En agricultura, el etileno es además una hormona vegetal que estimula la maduración de frutas; los distribuidores de frutas en México controlan su concentración para madurar plátanos, aguacates y jitomates de manera controlada.\n\nLos alcoholes tienen el grupo funcional –OH (hidroxilo). El etanol (C₂H₅OH) es el alcohol de las bebidas fermentadas y destiladas; también es aditivo de gasolinas en Brasil y, en menor medida, en México. El metanol (CH₃OH) es altamente tóxico; los fraudes de adulteración de bebidas alcohólicas con metanol han causado muertes en México, lo que motiva la regulación de la COFEPRIS.\n\nLos ácidos carboxílicos tienen el grupo –COOH. El ácido acético (CH₃COOH, al 5-8% en solución) es el vinagre presente en la cocina mexicana; el ácido cítrico da el sabor ácido a los limones (México es el mayor productor mundial de limón persa); el ácido acetilsalicílico (aspirina) fue el primer fármaco moderno producido en escala industrial.`,
    fuente: "Material elaborado para CEN Bachillerato — CNEYT-IV",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 11,
    preguntas_comprension: [
      { pregunta: "¿Por qué el carbono puede formar millones de compuestos distintos?", respuesta_guia: "Porque puede formar cuatro enlaces covalentes y unirse a sí mismo formando cadenas, ramas y anillos de cualquier longitud y geometría, generando una diversidad estructural enorme." },
      { pregunta: "¿Qué diferencia a un alcano de un alqueno en cuanto a su reactividad y por qué?", respuesta_guia: "Los alcanos solo tienen enlaces simples C–C y son poco reactivos ('parafinas'). Los alquenos tienen al menos un doble enlace C=C, que es más reactivo porque puede romperse para agregar otros átomos o grupos (reacciones de adición)." },
      { pregunta: "¿Qué conexión existe entre los ácidos carboxílicos y la gastronomía y farmacología mexicana?", respuesta_guia: "El ácido acético es el vinagre (usado en la cocina mexicana); el ácido cítrico da el sabor al limón (México es el mayor productor mundial de limón persa); el ácido acetilsalicílico (aspirina) es un medicamento de amplio uso." },
      { pregunta: "¿Por qué la COFEPRIS regula el metanol en bebidas alcohólicas?", respuesta_guia: "Porque el metanol (CH₃OH) es altamente tóxico; al ser metabolizado produce formaldehído y ácido fórmico, que causan ceguera y muerte. Ha habido casos de fraude en México con bebidas adulteradas con metanol que han provocado muertes." },
    ],
  },
  { // P05 — infografia (Las cuatro biomoléculas)
    titulo: "Las cuatro biomoléculas: carbohidratos, lípidos, proteínas y ácidos nucleicos",
    url_imagen: "/placeholder/infografia.svg",
    descripcion_accesible: "Infografía de las cuatro clases de biomoléculas esenciales para la vida: carbohidratos, lípidos, proteínas y ácidos nucleicos. Para cada una se muestra su estructura básica, ejemplos representativos (glucosa, triglicéridos saturados, colágeno/hemoglobina, ADN/ARN) y sus principales funciones biológicas.",
    puntos_clave: [
      "Carbohidratos (azúcares y almidones): compuestos de C, H y O con fórmula general (CH₂O)n. Monosacáridos: glucosa (C₆H₁₂O₆, energía celular inmediata), fructosa (frutas), galactosa. Polisacáridos: almidón y glucógeno (reserva de energía), celulosa (estructura de las plantas, fibra dietética). El maíz y el frijol —base de la dieta mexicana— proveen principalmente almidón y proteínas vegetales.",
      "Lípidos (grasas y aceites): moléculas hidrofóbicas formadas por ácidos grasos y glicerol. Grasas saturadas (manteca, mantequilla): enlaces simples C–C, sólidas a temperatura ambiente. Grasas insaturadas (aceite de oliva, aguacate): tienen dobles enlaces C=C, líquidas a temperatura ambiente. Función: reserva energética de largo plazo (9 kcal/g), aislamiento térmico, componente de membranas celulares (fosfolípidos) y precursores de hormonas.",
      "Proteínas: polímeros de aminoácidos (unidades de 20 tipos distintos). Función estructural: colágeno (tendones, cartílagos, piel); función de transporte: hemoglobina (transporta O₂ en la sangre); función enzimática: enzimas digestivas como la amilasa y la pepsina; función de defensa: anticuerpos del sistema inmunológico. Las proteínas son los 'obreros' de la célula.",
      "Ácidos nucleicos (ADN y ARN): polímeros de nucleótidos (base nitrogenada + azúcar + fosfato). El ADN contiene la información genética de todos los organismos vivos; el ARN la transcribe y la traduce para fabricar proteínas. La doble hélice del ADN fue descrita por Watson, Crick, Franklin y Wilkins en 1953. En México, el INMEGEN (Instituto Nacional de Medicina Genómica) estudia el genoma de la población mexicana.",
      "Monómeros y polímeros: la vida construye gigantes con piezas pequeñas. Los monosacáridos forman polisacáridos; los aminoácidos forman proteínas; los nucleótidos forman ácidos nucleicos. Este principio de polimerización es también la base de los plásticos sintéticos.",
      "Energía por biomoléculas: carbohidratos y proteínas aportan ~4 kcal/g; los lípidos, ~9 kcal/g. El orden de uso energético en el cuerpo es: glucosa → glucógeno → lípidos → proteínas (en caso extremo de inanición).",
      "Digestión y absorción: las macromoléculas deben hidrolizarse (dividirse con agua) antes de absorberse. El almidón → glucosa; las proteínas → aminoácidos; los triglicéridos → glicerol + ácidos grasos. Las enzimas del páncreas y el intestino delgado realizan esta digestión.",
    ],
    fuente: "Material CEN Bachillerato — CNEYT-IV. Datos: Lehninger Principios de Bioquímica (7ª ed.); INMEGEN 2024.",
  },
  { // P06 — lectura (Química orgánica en la industria mexicana)
    titulo: "La química orgánica que mueve a México: fármacos, alimentos y materiales",
    texto: `La química orgánica no es solo una asignatura escolar: es la base de industrias que generan millones de empleos y determinan la calidad de vida de la población mexicana. Tres sectores son especialmente relevantes: la industria farmacéutica, la industria alimentaria y la industria de los materiales plásticos y textiles.\n\nLa industria farmacéutica en México tiene un valor aproximado de 16,000 millones de dólares anuales. Los laboratorios nacionales como Laboratorio Silanes, Senosiain y PiSA producen principios activos orgánicos: analgésicos (paracetamol, C₈H₉NO₂), antibióticos (amoxicilina, amiodarona), antiinflamatorios (ibuprofeno, C₁₃H₁₈O₂) y vitaminas sintéticas. El IMSS y el ISSSTE juntos distribuyen más de 700 millones de recetas al año; la mayoría de los medicamentos son moléculas orgánicas diseñadas para interactuar con receptores específicos del cuerpo humano —también moléculas orgánicas.\n\nLa industria alimentaria utiliza aditivos químicos orgánicos para conservar, colorear, endulzar y potenciar sabores. El ácido benzoico y el benzoato de sodio son conservadores ampliamente utilizados en refrescos y jugos; el ácido cítrico (extraído industrialmente por fermentación del maíz) se usa en miles de productos. Los edulcorantes como la sacarina (C₇H₅NO₃S) y el aspartamo (C₁₄H₁₈N₂O₅) son moléculas orgánicas complejas que endulzan sin aportar calorías. La empresa Bimbo, con sede en México, es uno de los mayores consumidores de aditivos alimentarios orgánicos del continente.\n\nLa industria de los materiales es quizás la aplicación más visible: prácticamente todo objeto plástico que usas es un polímero orgánico. El polietileno (bolsas), el PET (botellas de refresco), el PVC (tuberías), el poliestireno (unicel) y el nylon (textiles) son todos polímeros de monómeros orgánicos. En México, el programa ECOCE (Envases y Empaques de México) busca reciclar PET para reducir la dependencia de petróleo crudo como materia prima. Sin embargo, la producción de plástico en México supera los 4 millones de toneladas anuales, planteando serios retos ambientales que la industria química también debe resolver.`,
    fuente: "Material elaborado para CEN Bachillerato — CNEYT-IV",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 11,
    preguntas_comprension: [
      { pregunta: "¿Qué papel juega la química orgánica en la industria farmacéutica mexicana? Menciona un ejemplo concreto.", respuesta_guia: "Los medicamentos son en su mayoría moléculas orgánicas diseñadas para interactuar con receptores del cuerpo. Ejemplo: el paracetamol (C₈H₉NO₂) es un analgésico producido por laboratorios nacionales como Silanes y distribuido masivamente por el IMSS." },
      { pregunta: "¿Qué son los aditivos alimentarios orgánicos y cuál es su función en la industria de alimentos?", respuesta_guia: "Son compuestos orgánicos añadidos a los alimentos para conservarlos (benzoato de sodio), endulzarlos sin calorías (sacarina, aspartamo), acidificarlos (ácido cítrico) o potenciar sabores. Su uso está regulado por la COFEPRIS en México." },
      { pregunta: "¿Qué es un polímero y cómo se relaciona con los plásticos de uso cotidiano?", respuesta_guia: "Un polímero es una macromolécula formada por la repetición de unidades más pequeñas (monómeros). Los plásticos como el polietileno (bolsas), PET (botellas) y PVC (tuberías) son polímeros de monómeros orgánicos derivados del petróleo." },
      { pregunta: "¿Qué es el programa ECOCE y qué problema ambiental busca atender?", respuesta_guia: "ECOCE (Envases y Empaques de México) es un programa de reciclaje de PET para reducir residuos plásticos y la dependencia de petróleo crudo como materia prima. Atiende el problema de que México produce más de 4 millones de toneladas anuales de plástico." },
    ],
  },
  { // P07 — video_con_preguntas (Contaminantes químicos y plásticos)
    url_video: "https://example.com/video-pendiente-cen",
    titulo_video: "Plásticos y contaminantes: la química que enferma al planeta",
    duracion_segundos: 525,
    preguntas: [
      { tiempo_segundos: 110, pregunta: "¿Qué son los microplásticos y cómo llegan a la cadena alimentaria humana? Menciona al menos dos rutas.", respuesta_guia: "Los microplásticos son fragmentos de plástico menores a 5 mm generados por la degradación de plásticos más grandes o fabricados directamente (microperlas en cosméticos). Rutas: 1) Los peces marinos los ingieren confundiéndolos con plancton → llegan a nuestra dieta cuando los comemos. 2) Se disuelven en agua potable que tomamos. 3) Se inhalan del aire (fibras de ropa sintética)." },
      { tiempo_segundos: 310, pregunta: "¿Qué es la Gran Mancha de Basura del Pacífico y cuál es su relación con la contaminación de México?", respuesta_guia: "Es una acumulación de plásticos en el Pacífico Norte con una superficie estimada en ~1.6 millones de km² (3 veces Francia). México, con sus costas en el Pacífico, el Golfo y el Caribe, contribuye con residuos plásticos fluviales y costeros. Los ríos Lerma-Santiago y Balsas arrastran plásticos al Pacífico." },
      { tiempo_segundos: 475, pregunta: "¿Qué diferencia hay entre un plástico biodegradable y uno compostable? ¿Por qué no todos los plásticos 'biodegradables' son la solución al problema?", respuesta_guia: "Biodegradable: se descompone por acción de microorganismos, pero puede tardar décadas y dejar microplásticos. Compostable: se descompone en condiciones específicas de compostaje industrial (temperatura, humedad, microorganismos controlados) en semanas. El problema: muchos plásticos etiquetados como 'biodegradables' no se descomponen en condiciones reales (tiraderos, océanos) y generan igual cantidad de microplásticos." },
    ],
  },
  { // P08 — lectura (Experimentos caseros de química)
    titulo: "Química en casa: ciencia con lo que tienes en la cocina",
    texto: `Una de las ideas erróneas más comunes sobre la química es que solo ocurre en laboratorios con equipos costosos y sustancias peligrosas. En realidad, la cocina de cualquier hogar mexicano es un laboratorio lleno de reacciones químicas esperando ser exploradas. Con vinagre, bicarbonato, col morada, limón y agua es posible diseñar y realizar experimentos que ilustran principios fundamentales de la química.\n\nEl bicarbonato de sodio (NaHCO₃) y el vinagre (solución diluida de ácido acético, CH₃COOH) producen una reacción de doble sustitución: CH₃COOH + NaHCO₃ → CH₃COONa + H₂O + CO₂. La formación de burbujas (CO₂ gaseoso) es evidencia visible de la reacción química. Esta misma reacción es la base de los polvos para hornear en la panadería: el CO₂ producido hace que el pan esponje.\n\nLa col morada (repollo morado) contiene antocianinas, pigmentos que actúan como indicadores naturales de pH: en ambiente ácido viran hacia el rojo/rosa; en neutro permanecen morados; en básico cambian a verde/amarillo. Con el extracto de col morada y diferentes líquidos del hogar (jugo de limón, agua, bicarbonato disuelto, jabón, agua de cal), puedes construir una escala de pH casera completamente funcional.\n\nLa investigación con materiales accesibles tiene una larga tradición. En México, el programa de ferias de ciencias de la SEP ha promovido experimentos de este tipo desde la década de 1980. Los laboratorios del CINVESTAV y la UNAM frecuentemente refieren que los científicos más creativos son aquellos que aprendieron a hacerse preguntas con recursos limitados. La química experimental no requiere equipos costosos: requiere curiosidad, método y observación cuidadosa.\n\nEl método científico aplicado a estos experimentos incluye: formular una pregunta o hipótesis, diseñar el experimento controlando variables, registrar observaciones sistemáticamente, analizar resultados y comunicar conclusiones. Estos pasos son idénticos en el experimento más sencillo y en las investigaciones más avanzadas.`,
    fuente: "Material elaborado para CEN Bachillerato — CNEYT-IV",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 10,
    preguntas_comprension: [
      { pregunta: "¿Qué reacción química ocurre al mezclar vinagre y bicarbonato? Escribe la ecuación y explica la evidencia observable.", respuesta_guia: "CH₃COOH + NaHCO₃ → CH₃COONa + H₂O + CO₂. Es una reacción de doble sustitución (neutralización con formación de gas). La evidencia es la producción de burbujas de CO₂ y el efervescimiento." },
      { pregunta: "¿Cómo funciona la col morada como indicador de pH y qué colores produce en ambientes ácidos, neutros y básicos?", respuesta_guia: "Las antocianinas de la col morada cambian de estructura química según el pH: en ácido (pH <7) son rojas/rosas; en neutro (pH 7) son moradas; en básico (pH >7) son verdes o amarillas. Es un indicador visual natural." },
      { pregunta: "¿Qué pasos del método científico se aplican en un experimento de química casera?", respuesta_guia: "Los mismos que en cualquier investigación: formular pregunta/hipótesis, diseñar experimento (controlar variables), observar y registrar datos sistemáticamente, analizar resultados y comunicar conclusiones." },
    ],
  },
];

// ── A2 ──────────────────────────────────────────────────────────────────────────
const contenidosA2 = [
  { // P01 — ejercicio_matematico (Balanceo de ecuaciones)
    problema: "Balancea las siguientes ecuaciones químicas aplicando el método de inspección (tanteo). Para cada una, escribe los coeficientes estequiométricos que hacen que el número de átomos de cada elemento sea igual en reactivos y productos.\n\nEcuación 1: H₂ + O₂ → H₂O\nEcuación 2: CH₄ + O₂ → CO₂ + H₂O\nEcuación 3: Fe + O₂ → Fe₂O₃\n\nRecuerda: SOLO puedes cambiar los coeficientes (los números delante de cada fórmula). NO puedes cambiar los subíndices dentro de las fórmulas. Verifica que el número de átomos de cada elemento sea idéntico a ambos lados de la flecha.",
    tipo_respuesta: "desarrollo",
    pasos_guia: [
      "Ecuación 1 — H₂ + O₂ → H₂O: Cuenta átomos: izquierda H=2, O=2; derecha H=2, O=1. El oxígeno no está balanceado. Coloca coeficiente 2 delante de H₂O: H₂ + O₂ → 2 H₂O. Ahora O está par (O=2 y O=2), pero H no: izquierda H=2, derecha H=4. Coloca 2 delante de H₂: 2 H₂ + O₂ → 2 H₂O. Verificación: H izq=4, H der=4 ✓; O izq=2, O der=2 ✓.",
      "Ecuación 2 — CH₄ + O₂ → CO₂ + H₂O: Cuenta átomos iniciales: C=1/1 ✓, H=4/2 ✗, O=2/3 ✗. Balancea H primero: coloca 2 delante de H₂O → CH₄ + O₂ → CO₂ + 2 H₂O. Ahora O derecho = 2+2 = 4; O izquierdo = 2 (falta). Coloca 2 delante de O₂: CH₄ + 2 O₂ → CO₂ + 2 H₂O. Verifica: C=1/1 ✓, H=4/4 ✓, O=4/4 ✓.",
      "Ecuación 3 — Fe + O₂ → Fe₂O₃: Átomos iniciales: Fe=1, O=2 izq; Fe=2, O=3 der. Fe y O están desbalanceados. El mínimo común múltiplo de O es 6 (2×3). Coloca 3 delante de O₂ y 2 delante de Fe₂O₃: Fe + 3 O₂ → 2 Fe₂O₃. Ahora O=6/6 ✓, pero Fe=1 izq vs 4 der. Coloca 4 delante de Fe: 4 Fe + 3 O₂ → 2 Fe₂O₃. Verifica: Fe=4/4 ✓, O=6/6 ✓.",
      "Verificación general para las tres ecuaciones: suma el número de átomos de cada elemento en cada lado de la flecha y confirma que son iguales. Un solo átomo desbalanceado invalida la ecuación.",
      "Interpretación estequiométrica: en 2 H₂ + O₂ → 2 H₂O, los coeficientes significan que 2 moléculas de H₂ reaccionan con 1 molécula de O₂ para producir 2 moléculas de H₂O; o bien, 2 moles de H₂ reaccionan con 1 mol de O₂ para producir 2 moles de H₂O.",
      "Respuestas finales: (1) 2 H₂ + O₂ → 2 H₂O; (2) CH₄ + 2 O₂ → CO₂ + 2 H₂O; (3) 4 Fe + 3 O₂ → 2 Fe₂O₃.",
    ],
    respuesta_final: "2 H₂ + O₂ → 2 H₂O | CH₄ + 2 O₂ → CO₂ + 2 H₂O | 4 Fe + 3 O₂ → 2 Fe₂O₃",
    tolerancia_error: 0,
    unidades: "coeficientes estequiométricos (número enteros positivos)",
  },
  { // P02 — quiz_multiple_opcion (Tipos de reacciones químicas)
    preguntas: [
      { enunciado: "La reacción N₂ + 3 H₂ → 2 NH₃ (síntesis de amoníaco — Proceso Haber-Bosch) es un ejemplo de:", opciones: ["Descomposición", "Síntesis o combinación", "Sustitución simple", "Combustión"], respuesta_correcta: 1, retroalimentacion: "Es una síntesis (A + B → AB): dos reactivos se combinan para formar un solo producto (NH₃). El proceso Haber-Bosch es la reacción industrial más importante del siglo XX: el amoníaco producido es la base de los fertilizantes nitrogenados que alimentan a ~50% de la humanidad." },
      { enunciado: "El calcio (Ca) se añade a agua y desplaza al hidrógeno: Ca + 2 H₂O → Ca(OH)₂ + H₂. Este tipo de reacción se llama:", opciones: ["Combustión", "Síntesis", "Sustitución simple o desplazamiento", "Doble sustitución"], respuesta_correcta: 2, retroalimentacion: "Es una sustitución simple: un elemento (Ca) desplaza a otro (H) de un compuesto. El calcio es más reactivo que el hidrógeno, por lo que el desplazamiento procede espontáneamente. Este tipo de reacciones sigue el orden de la serie de actividad química (serie de reactividad)." },
      { enunciado: "La reacción: HCl + NaOH → NaCl + H₂O es un ejemplo de:", opciones: ["Síntesis", "Descomposición", "Combustión", "Doble sustitución (neutralización)"], respuesta_correcta: 3, retroalimentacion: "Es una doble sustitución o metátesis, específicamente una reacción de neutralización: el ácido (HCl) y la base (NaOH) intercambian sus iones para formar una sal (NaCl) y agua. El producto NaCl es el cloruro de sodio (sal de mesa)." },
      { enunciado: "¿Cuál de estas reacciones es una COMBUSTIÓN COMPLETA?", opciones: ["C + O₂ → CO (sin suficiente O₂)", "C₃H₈ + 5 O₂ → 3 CO₂ + 4 H₂O", "2 H₂O₂ → 2 H₂O + O₂", "2 Na + 2 H₂O → 2 NaOH + H₂"], respuesta_correcta: 1, retroalimentacion: "La combustión completa de un hidrocarburo produce CO₂ y H₂O exclusivamente. C₃H₈ + 5 O₂ → 3 CO₂ + 4 H₂O es la combustión completa del propano (gas LP). La opción A es combustión incompleta (produce CO tóxico, no CO₂)." },
      { enunciado: "¿Cuál es la principal diferencia entre una reacción de síntesis y una de descomposición?", opciones: ["En la síntesis se libera calor; en la descomposición se absorbe siempre", "En la síntesis, múltiples reactivos forman un solo producto; en la descomposición, un solo reactivo origina múltiples productos", "Son lo mismo con nombres distintos", "En la síntesis participan solo elementos; en la descomposición, solo compuestos"], respuesta_correcta: 1, retroalimentacion: "La síntesis une para formar: A + B → AB. La descomposición divide: AB → A + B. Son procesos inversos. Ejemplo: 2 H₂ + O₂ → 2 H₂O (síntesis); 2 H₂O → 2 H₂ + O₂ (descomposición por electrólisis)." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P03 — simulacion (Laboratorio de pH)
    tipo_simulacion: "laboratorio",
    descripcion: "Simulación de laboratorio de pH: el estudiante mide el pH de diferentes soluciones cotidianas, realiza reacciones de neutralización y observa cómo cambia el pH al agregar ácidos o bases. Explora el concepto de buffer (solución amortiguadora) y su importancia en sistemas biológicos como la sangre.",
    instrucciones: [
      "Abre el panel de soluciones disponibles: ácido clorhídrico diluido (HCl 0.1M, pH~1), vinagre (ácido acético 5%, pH~3), agua destilada (pH 7), solución de bicarbonato (NaHCO₃ 0.1M, pH~8.3), solución de hidróxido de sodio diluida (NaOH 0.01M, pH~12), y agua de cloro doméstico (pH~13). Registra el pH de cada una en tu tabla.",
      "Toma una solución de HCl (pH~1) y agrega gota a gota la solución de NaOH. Observa cómo cambia el pH con cada adición. Registra el pH cada 5 gotas. ¿En qué punto el pH alcanza 7 (punto de equivalencia)?",
      "Repite el experimento pero ahora usa vinagre (ácido acético) en lugar de HCl. Compara qué tan rápido cambia el pH en cada caso. El vinagre es un ácido débil; el HCl es un ácido fuerte. ¿Cuál muestra mayor resistencia al cambio de pH al agregar la base?",
      "Activa la opción 'buffer de bicarbonato' (sistema HCO₃⁻/H₂CO₃ que simula la sangre). Agrega ácido y observa cuánto cambia el pH comparado con el agua pura. Registra los valores antes y después.",
      "Explora la sección 'pH en el cuerpo humano': ajusta el pH de la sangre simulada a 7.2 y observa los efectos fisiológicos graficados (acidosis). Luego llévala a 7.6 (alcalosis). ¿Qué diferencias observas?",
      "En la sección de síntesis: combina la simulación de la col morada como indicador. Agrega distintas soluciones y registra el color que toma el indicador. Construye tu propia escala de colores para estimar pH sin pHímetro.",
    ],
    variables_a_explorar: [
      "pH inicial de diferentes soluciones cotidianas (1–14)",
      "Velocidad de cambio de pH al neutralizar un ácido fuerte vs uno débil",
      "Efecto del buffer (amortiguador) en la resistencia al cambio de pH",
      "Rango de pH de la sangre humana normal (7.35–7.45) y consecuencias de desviaciones",
      "Cambio de color de indicadores naturales (col morada, tornasol) según pH",
    ],
    preguntas_reflexion: [
      "¿Por qué el ácido acético (vinagre) muestra mayor resistencia al cambio de pH que el HCl cuando se agrega una base? ¿Qué dice eso sobre la diferencia entre ácidos fuertes y débiles?",
      "¿Cuánto tardó el sistema buffer de bicarbonato en 'absorber' el ácido añadido comparado con el agua pura? ¿Por qué esto es vital para la supervivencia?",
      "Si el pH de la sangre cayera a 7.2 de forma sostenida, ¿qué implicaciones clínicas tiene? ¿Qué podrías hacer (tratamiento básico) para corregirlo?",
      "¿Qué diferencia observaste entre las soluciones con pH 1 y pH 3? ¿Y entre pH 11 y pH 13? ¿La escala de pH es lineal o logarítmica? ¿Qué implica eso?",
    ],
  },
  { // P04 — quiz_multiple_opcion (Química orgánica — grupos funcionales)
    preguntas: [
      { enunciado: "¿Cuál es el grupo funcional que define a los alcoholes?", opciones: ["–COOH (carboxilo)", "–OH (hidroxilo)", "–NH₂ (amino)", "C=C (doble enlace)"], respuesta_correcta: 1, retroalimentacion: "El grupo –OH (hidroxilo) es el grupo funcional de los alcoholes. El etanol (C₂H₅OH) es el alcohol de las bebidas fermentadas; el metanol (CH₃OH) es el alcohol tóxico. Ambos tienen –OH pero son moléculas distintas con efectos biológicos completamente diferentes." },
      { enunciado: "El metano (CH₄), el etano (C₂H₆) y el propano (C₃H₈) pertenecen a la familia de los:", opciones: ["Alquenos", "Alquinos", "Alcanos", "Ácidos carboxílicos"], respuesta_correcta: 2, retroalimentacion: "Son alcanos: hidrocarburos con solo enlaces simples C–C. Su fórmula general es CₙH₂ₙ₊₂. El metano es el gas natural; el propano y butano forman el gas LP que se usa en millones de hogares mexicanos para cocinar." },
      { enunciado: "El ácido acético (CH₃COOH) contiene el grupo funcional:", opciones: ["Hidroxilo (–OH)", "Carboxilo (–COOH)", "Amino (–NH₂)", "Aldehído (–CHO)"], respuesta_correcta: 1, retroalimentacion: "El grupo carboxilo (–COOH) define a los ácidos carboxílicos. El ácido acético al 5-8% es el vinagre; el ácido cítrico (con 3 grupos –COOH) es el responsable del sabor ácido del limón. México es el principal productor mundial de limón persa." },
      { enunciado: "¿Cuál de estas propiedades distingue a los alquenos de los alcanos?", opciones: ["Los alquenos contienen solo hidrógeno; los alcanos, solo carbono", "Los alquenos tienen al menos un doble enlace C=C que los hace más reactivos que los alcanos", "Los alquenos son gases; los alcanos son siempre líquidos", "Los alquenos son más estables químicamente que los alcanos"], respuesta_correcta: 1, retroalimentacion: "El doble enlace C=C en los alquenos puede romperse para agregar otros átomos (reacciones de adición), haciéndolos mucho más reactivos. El etileno (eteno, C₂H₄) es el alqueno más simple y el compuesto orgánico más producido industrialmente: base del polietileno y del PVC." },
      { enunciado: "¿Por qué el etanol (C₂H₅OH) y el metanol (CH₃OH) tienen efectos biológicos tan distintos si ambos son alcoholes?", opciones: ["Son exactamente iguales en sus efectos; el nombre cambia pero la molécula es la misma", "Difieren solo en una longitud de cadena: el metanol se metaboliza en formaldehído y ácido fórmico, que son altamente tóxicos; el etanol se metaboliza en acetaldehído y ácido acético, mucho menos tóxicos en dosis moderadas", "El metanol es más dulce, por eso se prefiere en bebidas alcohólicas fraudulentas", "No hay diferencia en toxicidad; la dosis es lo único que importa"], respuesta_correcta: 1, retroalimentacion: "El metanol se metaboliza por la enzima alcohol deshidrogenasa en formaldehído (CH₂O) y luego en ácido fórmico (HCOOH), que destruyen el nervio óptico y pueden causar acidosis severa y muerte. El etanol produce acetaldehído y ácido acético, metabolizados más fácilmente. La diferencia de un grupo –CH₂– cambia completamente la toxicidad." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P05 — quiz_verdadero_falso (Biomoléculas)
    preguntas: [
      { enunciado: "Las proteínas son polímeros de aminoácidos unidos por enlaces peptídicos.", respuesta: true, retroalimentacion: "Correcto. Los aminoácidos se unen mediante enlaces peptídicos (–CO–NH–) formando cadenas que se pliegan en estructuras tridimensionales específicas (estructura secundaria, terciaria y cuaternaria) que determinan su función." },
      { enunciado: "La glucosa (C₆H₁₂O₆) es un lípido que sirve como fuente inmediata de energía para las células.", respuesta: false, retroalimentacion: "La glucosa es un carbohidrato (monosacárido), no un lípido. Es la principal fuente de energía inmediata para las células, incluyendo las neuronas del cerebro. Los lípidos (grasas) son la reserva de energía a largo plazo (9 kcal/g vs 4 kcal/g de los carbohidratos)." },
      { enunciado: "El ADN contiene la información genética codificada en la secuencia de sus cuatro bases nitrogenadas: adenina, timina, guanina y citosina.", respuesta: true, retroalimentacion: "Correcto. El código genético está escrito en el lenguaje de cuatro bases (A, T, G, C en el ADN; A, U, G, C en el ARN). La secuencia de estas bases en los genes determina la secuencia de aminoácidos en las proteínas." },
      { enunciado: "Las grasas saturadas tienen dobles enlaces C=C en sus cadenas de ácidos grasos, lo que las hace líquidas a temperatura ambiente.", respuesta: false, retroalimentacion: "Es al revés: las grasas INSATURADAS tienen dobles enlaces C=C que crean 'codos' en la cadena, impidiendo el empaquetamiento y haciéndolas líquidas (aceites). Las grasas SATURADAS no tienen dobles enlaces: sus cadenas se empaquetan bien y son sólidas a temperatura ambiente (manteca, mantequilla)." },
      { enunciado: "El colágeno es la proteína más abundante del cuerpo humano y tiene función estructural en piel, tendones y cartílagos.", respuesta: true, retroalimentacion: "Correcto. El colágeno representa ~30% de todas las proteínas del cuerpo humano. Forma fibras resistentes en tendones, cartílagos, huesos, piel y córnea. Su degradación con el envejecimiento produce arrugas y pérdida de elasticidad en la piel." },
      { enunciado: "Los ácidos nucleicos (ADN y ARN) son los únicos polímeros biológicos que existen en la naturaleza.", respuesta: false, retroalimentacion: "Los polímeros biológicos (biopolímeros) incluyen cuatro familias: ácidos nucleicos (ADN y ARN), proteínas (polímeros de aminoácidos), polisacáridos como el almidón y la celulosa (polímeros de glucosa), y en algunos contextos los lípidos de membrana (fosfolípidos). Hay muchos tipos de biopolímeros, no solo los ácidos nucleicos." },
    ],
    intentos_maximos: 2,
    puntaje_minimo_aprobacion: 70,
  },
  { // P06 — quiz_multiple_opcion (Industria farmacéutica, alimentaria y de materiales)
    preguntas: [
      { enunciado: "El paracetamol (acetaminofén, C₈H₉NO₂) es un medicamento del tipo analgésico/antipirético. ¿A qué familia de compuestos orgánicos pertenece por su grupo funcional –NHCOCH₃?", opciones: ["Alcohol", "Amida", "Ácido carboxílico", "Éter"], respuesta_correcta: 1, retroalimentacion: "El grupo –NHCO– es una amida (enlace amida). El paracetamol contiene un grupo amida (acetamida) y un grupo fenol. Es uno de los medicamentos más consumidos en México y en el mundo, distribuido masivamente por el IMSS y de venta libre en farmacias." },
      { enunciado: "¿Qué es un polímero sintético y cuál es un ejemplo de aplicación industrial en México?", opciones: ["Una molécula natural de origen vegetal usada en perfumería", "Una macromolécula fabricada por la unión repetida de monómeros orgánicos, como el PET de las botellas de refresco recicladas por el programa ECOCE", "Un compuesto mineral extraído de rocas para la construcción", "Una proteína producida por ingeniería genética en laboratorio"], respuesta_correcta: 1, retroalimentacion: "Los polímeros sintéticos se fabrican por polimerización de monómeros orgánicos derivados del petróleo. El PET (polietileno tereftalato) forma las botellas de refresco; el programa ECOCE en México recicla PET para reducir dependencia del petróleo crudo y disminuir residuos sólidos." },
      { enunciado: "El ácido benzoico y el benzoato de sodio se usan en la industria alimentaria principalmente como:", opciones: ["Colorantes artificiales para dar apariencia atractiva", "Conservadores antimicrobianos que inhiben el crecimiento de bacterias y hongos en bebidas y alimentos ácidos", "Edulcorantes no calóricos para reducir el azúcar", "Emulsificantes para mezclar agua y aceite en salsas"], respuesta_correcta: 1, retroalimentacion: "El benzoato de sodio es uno de los conservadores más usados a nivel global (código E211). Inhibe el crecimiento de levaduras, bacterias y hongos, especialmente en ambientes ácidos (pH < 4). Está presente en refrescos, jugos y salsas embotelladas. En México, la COFEPRIS regula sus límites de concentración." },
      { enunciado: "La industria farmacéutica diseña medicamentos como 'moléculas que encajan en receptores del cuerpo'. Este concepto se conoce como:", opciones: ["Síntesis orgánica total", "El modelo llave-cerradura (o interacción fármaco-receptor)", "Polimeración en cadena", "Esterificación controlada"], respuesta_correcta: 1, retroalimentacion: "El modelo llave-cerradura (propuesto por Emil Fischer en 1894) describe que un fármaco (llave) tiene una forma molecular complementaria al receptor biológico (cerradura). La interacción es altamente específica, lo que permite que medicamentos actúen sobre tejidos concretos con efectos selectivos." },
      { enunciado: "¿Por qué la producción de plástico a partir del petróleo genera dependencia de un recurso no renovable?", opciones: ["Porque el petróleo es el único solvente que puede polimerizar plásticos", "Porque los monómeros de la mayoría de los plásticos sintéticos (etileno, propileno, estireno) se obtienen por refinación del petróleo crudo, un recurso fósil que tarda millones de años en formarse", "Porque el plástico es en realidad petróleo solidificado directamente", "Porque sin petróleo no hay energía para los hornos de polimerización"], respuesta_correcta: 1, retroalimentacion: "Los plásticos más comunes (polietileno, PET, PVC, poliestireno) se fabrican a partir de monómeros orgánicos como el etileno y el propileno, obtenidos por craqueo (fraccionamiento) del petróleo. Al ser el petróleo no renovable, la dependencia del plástico convencional es un problema de sostenibilidad a largo plazo." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P07 — quiz_verdadero_falso (Plásticos y contaminantes)
    preguntas: [
      { enunciado: "Los microplásticos son fragmentos de plástico menores a 5 mm y pueden provenir tanto de la fragmentación de plásticos grandes como de su fabricación directa (microperlas).", respuesta: true, retroalimentacion: "Correcto. Los microplásticos de tipo secundario se generan por la degradación UV, mecánica y química de plásticos grandes (botellas, bolsas). Los primarios se fabrican directamente: microperlas en cosméticos exfoliantes y ropa sintética que libera microfibras al lavarse." },
      { enunciado: "El plástico biodegradable se descompone completamente y sin residuos en cualquier ambiente natural en menos de un año.", respuesta: false, retroalimentacion: "Falso. La mayoría de los plásticos etiquetados como 'biodegradables' requieren condiciones específicas (temperatura >58°C, humedad controlada, microorganismos adecuados) que solo se dan en plantas de compostaje industrial. En ríos, playas o tiraderos a cielo abierto, se degradan igual de lento o generan microplásticos." },
      { enunciado: "El PET (polietileno tereftalato) puede reciclarse mecánicamente para fabricar nuevas botellas, fibras textiles o materiales de construcción.", respuesta: true, retroalimentacion: "Correcto. El PET es uno de los plásticos más reciclables. El programa ECOCE en México recupera botellas PET para producir rPET (PET reciclado) que se usa en nuevas botellas, ropa polar (fleece), alfombras y tuberías. Sin embargo, Mexico recicla menos del 30% del PET que consume." },
      { enunciado: "El DDT es un contaminante orgánico persistente (COP) que se acumula en los tejidos grasos de los organismos a medida que sube en la cadena alimentaria, en un proceso llamado biomagnificación.", respuesta: true, retroalimentacion: "Correcto. El DDT (dicloro difenil tricloroetano) es lipofílico: se disuelve en grasas y se acumula en los tejidos grasos. En cada nivel trófico la concentración aumenta (biomagnificación): el DDT puede estar a 0.000003 ppm en el agua, 0.5 ppm en peces pequeños y 25 ppm en águilas pescadoras. México lo prohibió en 2000." },
      { enunciado: "Todos los plásticos flotan en el océano, por eso es posible recolectarlos completamente con redes en la superficie del agua.", respuesta: false, retroalimentacion: "Falso. Algunos plásticos son más densos que el agua de mar (PVC, PS expandido al absorber agua, PET con sedimento) y se hunden. Además, los microplásticos y nanoplásticos se distribuyen en toda la columna de agua, incluyendo los sedimentos del fondo marino, donde las redes superficiales no los capturan." },
      { enunciado: "En México, el uso de bolsas de plástico de un solo uso ha sido completamente prohibido en todos los estados del país desde 2020.", respuesta: false, retroalimentacion: "Falso. Aunque varios estados y municipios han aprobado restricciones (Ciudad de México, Oaxaca, Baja California, Quintana Roo, entre otros), no hay una ley federal única que prohíba las bolsas de plástico en todo el país. La regulación es fragmentada y la aplicación varía mucho por región." },
    ],
    intentos_maximos: 2,
    puntaje_minimo_aprobacion: 70,
  },
  { // P08 — simulacion (Experimentos de química casera)
    tipo_simulacion: "laboratorio",
    descripcion: "Simulación de experimentos de química con materiales accesibles en casa: reacción vinagre-bicarbonato, extracción de indicador de pH con col morada, y preparación de una solución de almidón como indicador de yodo. El estudiante aplica el método científico completo: formula hipótesis, controla variables, registra observaciones y extrae conclusiones.",
    instrucciones: [
      "Experimento 1 — Reacción vinagre-bicarbonato: Selecciona 50 mL de vinagre blanco (5% de ácido acético) en el recipiente virtual. Agrega 1 cucharada de bicarbonato de sodio (NaHCO₃). Observa las burbujas y mide el volumen de CO₂ producido. Anota el tiempo que dura la reacción. Ahora cambia la variable: aumenta a 2 cucharadas de bicarbonato. ¿Cambia la cantidad de CO₂? ¿Y si usas vinagre al 10%?",
      "Experimento 2 — Indicador de col morada: Prepara el extracto virtual de col morada (antocianinas en agua). Añade porciones del extracto a 6 vasos con: (a) jugo de limón, (b) vinagre, (c) agua destilada, (d) bicarbonato disuelto, (e) leche de magnesia, (f) jabón de manos. Registra el color en cada caso. Ordena los vasos de más ácido a más básico.",
      "Experimento 3 — Almidón e yodo: Prepara solución de almidón (maicena en agua tibia). Agrega una gota de yodo: observa el cambio a color azul-negro. Ahora agrega vitamina C (ácido ascórbico) en polvo y observa cómo el color desaparece. Diseña un experimento para probar si el pan blanco, la tortilla o el arroz contienen almidón.",
      "Aplica el método científico: Para cada experimento, formula una hipótesis antes de 'realizarlo', diseña el control (muestra sin variable experimental) y registra tres observaciones cuantitativas y dos cualitativas.",
      "Análisis de errores: Para cada experimento, identifica dos posibles fuentes de error experimental y propón cómo minimizarlas (ej. medir con mayor precisión, usar instrumentos calibrados, repetir el experimento 3 veces).",
      "Síntesis: Relaciona cada experimento con un concepto de la UAC: el experimento 1 con tipos de reacciones; el experimento 2 con la escala de pH y los indicadores; el experimento 3 con los carbohidratos como biomoléculas.",
    ],
    variables_a_explorar: [
      "Efecto de la cantidad de bicarbonato en el volumen de CO₂ producido (variable cuantitativa)",
      "Cambio de color del indicador de col morada según el pH de distintas soluciones cotidianas",
      "Presencia de almidón en diferentes alimentos detectada con yodo como reactivo de prueba",
      "Tiempo de reacción de la neutralización vinagre-bicarbonato según la concentración del ácido",
    ],
    preguntas_reflexion: [
      "¿Qué tipo de reacción química ocurre entre el vinagre y el bicarbonato? ¿Cómo verificarías que es esa y no otra?",
      "¿Por qué la col morada cambia de color según el pH? ¿Qué cambio en la estructura molecular de las antocianinas explica ese cambio de color?",
      "¿La vitamina C que 'decolora' el yodo-almidón está actuando como ácido, base o agente reductor? ¿Qué te dice eso sobre sus propiedades químicas?",
    ],
  },
];

// ── A3 ──────────────────────────────────────────────────────────────────────────
const contenidosA3 = [
  { // P01 — quiz_multiple_opcion (Balanceo — cierre)
    preguntas: [
      { enunciado: "¿Qué establece la Ley de Conservación de la Masa en relación con el balanceo de ecuaciones?", opciones: ["Que los productos siempre tienen más masa que los reactivos", "Que la masa total de los reactivos es igual a la masa total de los productos; los átomos se reorganizan pero no se crean ni destruyen", "Que los coeficientes estequiométricos deben ser siempre iguales a los subíndices", "Que en toda reacción química se libera energía en forma de calor"], respuesta_correcta: 1, retroalimentacion: "La Ley de Conservación de la Masa (Lavoisier, siglo XVIII) establece que la masa se conserva en las reacciones químicas. Por eso, el número de átomos de cada elemento debe ser idéntico a ambos lados de la ecuación; el balanceo es la forma de cumplir esta ley matemáticamente." },
      { enunciado: "En la ecuación balanceada: 4 Fe + 3 O₂ → 2 Fe₂O₃, ¿cuántos átomos de oxígeno hay en los productos?", opciones: ["3", "2", "6", "4"], respuesta_correcta: 2, retroalimentacion: "En 2 Fe₂O₃: cada Fe₂O₃ tiene 3 oxígenos; con coeficiente 2 son 2×3 = 6 átomos de O. En los reactivos: 3 O₂ = 3×2 = 6 átomos de O. La ecuación está balanceada: 6 = 6 ✓." },
      { enunciado: "Para balancear la ecuación Al + O₂ → Al₂O₃, ¿cuáles son los coeficientes correctos?", opciones: ["1, 1, 1", "2, 3, 1 (incompleto)", "4 Al + 3 O₂ → 2 Al₂O₃", "2 Al + O₂ → Al₂O₃"], respuesta_correcta: 2, retroalimentacion: "4 Al + 3 O₂ → 2 Al₂O₃. Verificación: Al izq=4, Al der (2×2)=4 ✓; O izq (3×2)=6, O der (2×3)=6 ✓. Esta reacción es la combustión del aluminio, producida en la termita (mezcla de polvo de Al y Fe₂O₃), que alcanza temperaturas de ~2500°C." },
      { enunciado: "¿Cuál es la diferencia entre los coeficientes estequiométricos y los subíndices en una fórmula química?", opciones: ["No hay diferencia; ambos indican el número de átomos", "Los coeficientes indican cuántas moléculas de una sustancia participan; los subíndices indican cuántos átomos hay dentro de cada molécula. Solo se pueden cambiar los coeficientes al balancear", "Los subíndices se pueden cambiar si hacen falta más átomos", "Los coeficientes son siempre números decimales; los subíndices son enteros"], respuesta_correcta: 1, retroalimentacion: "Al balancear solo se modifican los coeficientes (multiplicadores externos). Cambiar los subíndices cambiaría la fórmula de la sustancia: H₂O (agua) ≠ H₂O₂ (agua oxigenada). Los subíndices son parte de la identidad química de la molécula." },
      { enunciado: "Si en la combustión del metano (CH₄ + 2 O₂ → CO₂ + 2 H₂O) se consumen 10 g de CH₄, ¿qué afirmación es correcta respecto a la masa?", opciones: ["Los productos pesarán más de 10 g porque la combustión agrega masa", "Los productos pesarán menos de 10 g porque parte de la energía 'destruye' masa", "La masa total de CO₂ + H₂O producidos más el O₂ que no reaccionó será igual a la masa total de CH₄ + O₂ inicial", "No es posible saber la masa de los productos sin información sobre el calor liberado"], respuesta_correcta: 2, retroalimentacion: "Por la Ley de Conservación de la Masa, la masa total inicial (CH₄ + O₂) es igual a la masa total final (CO₂ + H₂O). En este caso: 10 g CH₄ + 40 g O₂ (proporción estequiométrica 1:2 molar) → 27.5 g CO₂ + 22.5 g H₂O. Masa total: 50 g = 50 g ✓." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P02 — reflexion_escrita (Reacciones en la vida cotidiana)
    prompt: "Durante un día normal en México hay docenas de reacciones químicas ocurriendo a tu alrededor, muchas sin que las notes: el gas LP ardiendo en la estufa, el antiácido disolviendo el ácido estomacal, el hierro de un portón oxidándose lentamente, el bicarbonato haciendo esponjar el pan.\n\nElige DOS de los tipos de reacciones que estudiaste (síntesis, descomposición, sustitución, doble sustitución o combustión) y describe un ejemplo concreto de cada una que ocurra en tu vida cotidiana o en la de tu comunidad. Para cada ejemplo: nombra el tipo de reacción, describe qué sustancias reaccionan y qué productos se forman (aunque sea en palabras), e identifica alguna evidencia observable de que ocurrió una reacción (cambio de color, temperatura, gas, precipitado). ¿Hay alguna de estas reacciones que consideres útil, y alguna que te parezca dañina o problemática?",
    pistas: ["La combustión del gas LP en la estufa es C₃H₈ + O₂ → CO₂ + H₂O + energía (calor y luz).", "El orín o herrumbre del hierro es una oxidación lenta (sustitución/redox): 4 Fe + 3 O₂ → 2 Fe₂O₃.", "El antiácido de bicarbonato de sodio neutralizando el ácido gástrico es una doble sustitución: NaHCO₃ + HCl → NaCl + H₂O + CO₂.", "El sabor amargo del limón exprimido cambiando en el ceviche al 'cocer' el pescado con ácido cítrico implica desnaturalización de proteínas, no exactamente la misma reacción, pero ligada a la acidez."],
    longitud_minima_palabras: 80,
    criterios_evaluacion: [
      "Identifica correctamente el tipo de las dos reacciones elegidas con su nombre",
      "Describe reactivos y productos de cada ejemplo con al menos un nombre químico correcto",
      "Menciona una evidencia observable concreta de que ocurrió la reacción",
      "Reflexiona críticamente sobre la utilidad o el riesgo de al menos una de las reacciones",
    ],
  },
  { // P03 — reflexion_escrita (Ácidos y bases en el cuerpo y en casa)
    prompt: "Acabas de aprender que el pH del ácido estomacal es ~1-2, el del agua es 7 y el de la sangre es 7.35-7.45. Una variación de solo 0.1 en el pH sanguíneo puede tener consecuencias médicas graves.\n\n¿Qué te dice eso sobre la importancia de los sistemas reguladores del pH en el cuerpo? Piensa en situaciones concretas: ¿qué ocurre cuando alguien tiene acidez estomacal y toma un antiácido? ¿Por qué los deportistas de alto rendimiento en los Juegos Olímpicos o en la Liga MX pueden sufrir acidosis muscular durante el ejercicio intenso? ¿Qué productos del hogar tienen un pH muy alto o muy bajo y por qué se debe tener cuidado con ellos? Usa al menos dos valores de pH concretos en tu reflexión.",
    pistas: ["El agua de cloro doméstico tiene pH ~12-13; el limpiador de tuberías puede llegar a pH 14. ¿Por qué deben usarse con guantes?", "Durante el ejercicio intenso, los músculos producen ácido láctico, que puede bajar el pH muscular y causar fatiga y calambres.", "Los antiácidos de hidróxido de magnesio (Mg(OH)₂) o bicarbonato de sodio neutralizan el HCl estomacal. ¿Qué reacción es esa según los tipos?", "El pH 7 es neutro, pero la sangre humana normal es ligeramente básica (7.35-7.45). ¿Por qué no es exactamente 7?"],
    longitud_minima_palabras: 80,
    criterios_evaluacion: [
      "Menciona al menos dos valores de pH concretos y los interpreta correctamente en la escala ácido-neutro-base",
      "Explica la función de los sistemas buffer (amortiguadores) o antiácidos con un ejemplo correcto",
      "Conecta el concepto de pH con una situación biológica concreta (acidosis muscular, digestión, etc.)",
      "Menciona al menos un riesgo del hogar relacionado con el pH extremo de un producto doméstico",
    ],
  },
  { // P04 — autoevaluacion (Química orgánica)
    reflexion_final_prompt: "¿En qué criterio obtuviste la puntuación más baja? Escribe un ejemplo concreto de un compuesto orgánico de ese grupo funcional que uses o consumas regularmente, y explica por qué pertenece a esa familia.",
    criterios: [
      {
        descripcion: "Identifico los cuatro grupos funcionales básicos (alcanos, alquenos, alcoholes, ácidos carboxílicos) y puedo reconocerlos por su estructura o notación química.",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "Confundo los grupos funcionales o no puedo reconocerlos en una fórmula escrita." },
          { valor: 2, etiqueta: "En desarrollo", descripcion: "Reconozco algunos grupos funcionales pero cometo errores frecuentes al identificarlos en fórmulas o en nombres." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Identifico correctamente alcanos (solo C–C), alquenos (C=C), alcoholes (–OH) y ácidos carboxílicos (–COOH) tanto en fórmulas estructurales como en nombres IUPAC básicos." },
        ],
      },
      {
        descripcion: "Puedo dar al menos un ejemplo real de cada familia de compuestos orgánicos con una aplicación cotidiana o industrial en México.",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "Solo recuerdo nombres de compuestos sin poder asociarlos con su familia o con aplicaciones reales." },
          { valor: 2, etiqueta: "En desarrollo", descripcion: "Puedo dar ejemplos para dos o tres familias pero no para todas, o los ejemplos son imprecisos." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Doy ejemplos precisos: metano/propano (alcanos, gas LP), etileno (alqueno, plásticos), etanol/metanol (alcoholes, bebidas/tóxico), ácido acético/cítrico (ácidos carboxílicos, vinagre/limón)." },
        ],
      },
      {
        descripcion: "Comprendo por qué el carbono es el elemento central de la química orgánica y puedo explicar su versatilidad estructural.",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "Solo sé que la química orgánica 'trata del carbono' sin poder explicar por qué el carbono es tan especial." },
          { valor: 2, etiqueta: "En desarrollo", descripcion: "Sé que el carbono forma 4 enlaces, pero no puedo explicar bien cómo eso genera diversidad estructural." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Explico que el carbono forma 4 enlaces covalentes y puede unirse a sí mismo en cadenas, ramas y anillos de cualquier longitud, generando millones de compuestos con propiedades muy diferentes." },
        ],
      },
      {
        descripcion: "Distingo la diferencia de toxicidad entre el etanol y el metanol y puedo explicar por qué esta distinción tiene importancia en la salud pública en México.",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "No veo diferencia entre etanol y metanol o creo que ambos son igualmente seguros/tóxicos." },
          { valor: 2, etiqueta: "En desarrollo", descripcion: "Sé que el metanol es más tóxico pero no puedo explicar por qué ni mencionar casos concretos en México." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Explico que el metanol se metaboliza en formaldehído y ácido fórmico (tóxicos que causan ceguera y muerte), a diferencia del etanol que produce acetaldehído y acetato. Relaciono con fraudes de bebidas adulteradas y la regulación de la COFEPRIS." },
        ],
      },
    ],
  },
  { // P05 — reflexion_escrita (Biomoléculas en la alimentación mexicana)
    prompt: "La dieta tradicional mexicana —tortilla, frijoles, chile, nopal, aguacate, atún, huevo— es, desde la perspectiva bioquímica, una combinación de biomoléculas: carbohidratos, lípidos, proteínas y vitaminas (que incluyen algunos ácidos nucleicos precursores).\n\nElige tres alimentos típicos de la alimentación mexicana que consumas regularmente y analiza su composición en términos de biomoléculas: ¿cuáles son los carbohidratos, lípidos o proteínas principales de ese alimento? ¿Qué función biológica cumple esa biomolécula en tu cuerpo? ¿Hay algún alimento en tu dieta que creas que está 'mal equilibrado' desde el punto de vista de las biomoléculas? ¿Qué ajuste harías y por qué?",
    pistas: ["La tortilla de maíz es principalmente almidón (carbohidrato complejo que se digiere a glucosa). También contiene proteína de maíz, pero incompleta (le falta lisina). El proceso nixtamal mejora la biodisponibilidad de nutrientes.", "El aguacate es rico en grasas monoinsaturadas (ácido oleico, C18:1), las mismas que el aceite de oliva. Son lípidos 'buenos' para el corazón.", "Los frijoles aportan proteína vegetal y fibra (celulosa + pectinas). Combinados con maíz forman una proteína completa en aminoácidos esenciales.", "El huevo es una de las fuentes de proteína de mayor valor biológico: contiene los 9 aminoácidos esenciales en buenas proporciones."],
    longitud_minima_palabras: 80,
    criterios_evaluacion: [
      "Analiza correctamente la biomolécula principal de al menos dos de los tres alimentos elegidos",
      "Describe una función biológica concreta de cada biomolécula mencionada (no solo 'da energía')",
      "Conecta la composición bioquímica con algún aspecto de la cultura alimentaria mexicana",
      "Reflexiona críticamente sobre el equilibrio de su propia dieta con argumentos bioquímicos concretos",
    ],
  },
  { // P06 — debate_estructurado (Industria química: ganancias vs bienestar)
    tema: "¿Deben las empresas farmacéuticas y alimentarias priorizar las ganancias o el bienestar social al usar química orgánica en sus productos?",
    posturas: [
      "Las empresas tienen la responsabilidad primaria de generar ganancias para sus accionistas; la regulación del Estado es la que debe proteger al consumidor",
      "Las empresas farmacéuticas y alimentarias tienen una obligación ética de priorizar el bienestar humano por encima de las ganancias, dado que sus productos afectan directamente la salud",
    ],
    argumentos_guia: {
      "Las empresas tienen la responsabilidad primaria de generar ganancias para sus accionistas; la regulación del Estado es la que debe proteger al consumidor": [
        "En una economía de mercado, las empresas son legalmente responsables ante sus accionistas, no ante el público. La regulación (COFEPRIS en México, FDA en EUA) existe precisamente para compensar esta brecha.",
        "La búsqueda de ganancias impulsa la innovación: la inversión privada en investigación y desarrollo de fármacos ha generado vacunas y medicamentos que han salvado millones de vidas; sin incentivos económicos, esa inversión no existiría.",
        "La competencia entre empresas farmacéuticas y alimentarias puede reducir precios y mejorar calidad, beneficiando a los consumidores sin necesidad de intervención directa del Estado.",
        "La responsabilidad individual del consumidor también importa: la educación científica (como la que provee la escuela) permite a las personas tomar decisiones informadas sobre qué comprar y qué evitar.",
      ],
      "Las empresas farmacéuticas y alimentarias tienen una obligación ética de priorizar el bienestar humano por encima de las ganancias, dado que sus productos afectan directamente la salud": [
        "A diferencia de otros productos, los alimentos y medicamentos son bienes de primera necesidad que afectan la salud; su producción involucra una relación de confianza y asimetría de información con los consumidores que genera obligaciones éticas especiales.",
        "Casos como el escándalo de la talidomida (medicamento que causó malformaciones fetales en los años 60) o los aditivos cancerígenos en alimentos ultraprocesados muestran que las ganancias a corto plazo pueden causar daños irreversibles cuando no se priorizan la seguridad y el bienestar.",
        "México tiene una epidemia de obesidad y diabetes tipo 2 (primer lugar mundial per cápita en consumo de refrescos hasta hace pocos años) directamente relacionada con el diseño de productos ultraprocesados optimizados para el consumo adictivo, no para la nutrición.",
        "La industria farmacéutica en países en desarrollo como México puede abusar de su posición fijando precios prohibitivos para medicamentos esenciales (patentes) cuando las ganancias se priorizan sobre el acceso a la salud.",
      ],
    },
    modalidad: "escrito",
  },
  { // P07 — reflexion_escrita (El plástico en mi comunidad)
    prompt: "Has aprendido que México produce más de 4 millones de toneladas de plástico al año, que solo recicla una fracción pequeña, que los microplásticos ya están en el agua que bebemos y en la comida que consumimos, y que los plásticos 'biodegradables' no se descomponen en condiciones reales.\n\nObserva durante un día la cantidad y tipos de plástico que usas o descartarás: envases de alimentos, bolsas, botellas, pajillas, envoltorios. Luego reflexiona: ¿cuál de esos plásticos crees que es más fácil de eliminar o sustituir? ¿Cuál sería más difícil? ¿Qué obstáculos concretos (económicos, culturales, de infraestructura) impiden que tu comunidad reduzca su consumo de plástico? ¿Qué papel tiene la industria química en crear soluciones, y qué papel tienes tú como consumidor?",
    pistas: ["Los plásticos de un solo uso (bolsas, pajillas, cubiertos desechables) son más fáciles de sustituir que los empaques de alimentos que requieren una cadena de frío.", "En muchas colonias de México no hay infraestructura de reciclaje accesible: aunque quieras reciclar, no siempre puedes.", "El costo de los sustitutos (botellas de vidrio, bolsas de tela) puede ser una barrera real para familias de bajos ingresos.", "Piensa también en la responsabilidad extendida del productor (REP): la idea de que quien produce el plástico debe hacerse cargo de su fin de vida, no solo el consumidor."],
    longitud_minima_palabras: 80,
    criterios_evaluacion: [
      "Identifica tipos concretos de plástico de su vida cotidiana con al menos un nombre de tipo (PET, HDPE, PVC, etc.) o descripción específica",
      "Distingue entre plásticos más y menos sustituibles con argumentos concretos (no solo 'es difícil')",
      "Menciona al menos un obstáculo estructural (económico, de infraestructura, cultural) para reducir el plástico en su comunidad",
      "Reflexiona sobre la responsabilidad compartida: industria química vs consumidor individual, con postura propia argumentada",
    ],
  },
  { // P08 — autoevaluacion (Habilidades de experimentación científica)
    reflexion_final_prompt: "¿En qué criterio obtuviste la puntuación más baja? Diseña un experimento casero simple (con materiales accesibles en cualquier hogar mexicano) que te permita practicar esa habilidad. Describe qué harías, qué observarías y cómo registrarías los datos.",
    criterios: [
      {
        descripcion: "Formulo hipótesis claras y verificables antes de realizar un experimento, siguiendo la estructura 'Si... entonces... porque...'",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "Mis hipótesis son predicciones vagas sin fundamento ('creo que pasará algo') o no las formulo antes del experimento." },
          { valor: 2, etiqueta: "En desarrollo", descripcion: "Formulo hipótesis pero no siempre incluyen el mecanismo propuesto ('porque...') o no son fácilmente verificables." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Formulo hipótesis con estructura clara: variable independiente, variable dependiente y justificación teórica. Ej: 'Si aumento la cantidad de bicarbonato, entonces se producirá más CO₂, porque hay más reactivo disponible para la reacción con el ácido acético.'" },
        ],
      },
      {
        descripcion: "Identifico y controlo las variables en un experimento (variable independiente, dependiente y controladas).",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "No distingo entre los tipos de variables o cambio múltiples variables al mismo tiempo sin darme cuenta." },
          { valor: 2, etiqueta: "En desarrollo", descripcion: "Identifico la variable que cambio (independiente) pero tengo dificultades para mantener constantes las demás o para medir la variable dependiente con precisión." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Identifico claramente qué variable modifico (independiente), qué mido como resultado (dependiente) y qué mantengo igual (controladas). Incluyo siempre un control (muestra de referencia sin la variable experimental)." },
        ],
      },
      {
        descripcion: "Registro observaciones de manera sistemática, distinguiendo entre observaciones cualitativas (descriptivas) y cuantitativas (con medidas).",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "Mis registros son informales: 'se puso más oscuro', 'hizo muchas burbujas', sin datos cuantitativos ni registro estructurado." },
          { valor: 2, etiqueta: "En desarrollo", descripcion: "Registro algunos datos numéricos pero mi tabla o lista no está bien organizada, o mezclo observaciones con interpretaciones." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Uso tablas con columnas para variable independiente, variable dependiente y observaciones adicionales. Distingo claramente entre lo que observo directamente y lo que concluyo." },
        ],
      },
      {
        descripcion: "Extraigo conclusiones basadas en los datos obtenidos y las relaciono con los conceptos químicos del propósito formativo.",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "Mis conclusiones no están relacionadas con los datos obtenidos o repiten la hipótesis sin verificarla contra la evidencia." },
          { valor: 2, etiqueta: "En desarrollo", descripcion: "Relaciono los datos con la hipótesis pero no siempre los conecto con los conceptos teóricos de la química (tipos de reacciones, pH, biomoléculas)." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Evalúo si los datos apoyan o refutan mi hipótesis, identifico posibles fuentes de error y conecto el resultado del experimento con al menos un concepto teórico estudiado en la UAC." },
        ],
      },
    ],
  },
];

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
