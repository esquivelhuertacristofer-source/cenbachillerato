/**
 * Seed de actividades pedagógicas para CNEYT-III (Ciencias Naturales, Experimentales y Tecnología III).
 * 8 progresiones × 3 actividades = 24 actividades. estado='publicada'.
 * Tipos: infografia, quiz_multiple_opcion, reflexion_escrita, lectura,
 *        ejercicio_matematico, video_con_preguntas, quiz_verdadero_falso,
 *        autoevaluacion, fill_blanks, simulacion, debate_estructurado, glosario_interactivo (12 tipos)
 * Uso: npx tsx scripts/seed-activities-cneytiii.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🌱 Seed actividades CNEYT-III — Ecosistemas, interacciones y energía\n");

  const progs = await getProgresionesDeUAC(sb, "CNEYT-III");
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

  log(`\n✅ CNEYT-III: ${ok} actividades insertadas, ${fail} fallidas.\n`);
}

const titulos = [
  { a1: "Biomas y ecosistemas del mundo y México", a2: "¿Cuánto sabes sobre ecosistemas?", a3: "Reflexión: la biodiversidad que me rodea" },
  { a1: "Redes tróficas y flujo de energía", a2: "Calcula: ¿cuánta energía llega al tercer nivel trófico?", a3: "Reflexión: la regla del 10% y lo que comemos" },
  { a1: "Fotosíntesis: la fábrica de vida del planeta", a2: "¿Verdadero o falso? Fotosíntesis a fondo", a3: "Autoevaluación: comprensión de la fotosíntesis" },
  { a1: "Ciclos biogeoquímicos: agua, carbono, nitrógeno y fósforo", a2: "Completa los ciclos: huecos en los ciclos biogeoquímicos", a3: "¿Cuánto domino los ciclos? Quiz de cierre" },
  { a1: "Los subsistemas terrestres: atmósfera, hidrosfera, litosfera y biosfera", a2: "Simulación: interacciones entre subsistemas terrestres", a3: "¿Qué tanto conoces los subsistemas? Quiz de cierre" },
  { a1: "Deterioro ambiental: contaminación, deforestación y cambio climático", a2: "¿Cuánto sabes sobre el deterioro ambiental?", a3: "Debate: ¿individuos o corporaciones? Responsabilidad climática" },
  { a1: "Políticas de conservación en México: ANP, LGEEPA y convenios", a2: "¿Verdadero o falso? Conservación en México", a3: "Reflexión: el papel de las comunidades en la conservación" },
  { a1: "Glosario de sustentabilidad y acción ambiental", a2: "Autoevaluación: mi agencia ambiental", a3: "Reflexión: mi propuesta de acción local" },
];

const tiposA1 = ["infografia", "lectura", "video_con_preguntas", "infografia", "lectura", "video_con_preguntas", "lectura", "glosario_interactivo"] as const;
const tiposA2 = ["quiz_multiple_opcion", "ejercicio_matematico", "quiz_verdadero_falso", "fill_blanks", "simulacion", "quiz_multiple_opcion", "quiz_verdadero_falso", "autoevaluacion"] as const;
const tiposA3 = ["reflexion_escrita", "reflexion_escrita", "autoevaluacion", "quiz_multiple_opcion", "quiz_multiple_opcion", "debate_estructurado", "reflexion_escrita", "reflexion_escrita"] as const;

// ── A1 ──────────────────────────────────────────────────────────────────────────
const contenidosA1 = [
  { // P01 — infografia (Biomas y ecosistemas)
    titulo: "Biomas del mundo y ecosistemas de México",
    url_imagen: "/placeholder/infografia.svg",
    descripcion: "Infografía de los principales biomas terrestres y acuáticos del planeta, sus características climáticas, flora y fauna representativa, y los ecosistemas más importantes de México: selvas húmedas, bosques templados, manglares, desiertos y arrecifes de coral.",
    puntos_clave: [
      "Bioma: región geográfica caracterizada por clima, vegetación y fauna propios. Ejemplos: tundra (<0°C), taiga, bosque templado, selva tropical (>2000 mm lluvia/año), desierto (<250 mm/año), sabana y pradera.",
      "Ecosistema: sistema formado por la comunidad biótica (organismos) + el entorno abiótico (clima, suelo, agua, luz). Los componentes se relacionan en ciclos de materia y flujos de energía.",
      "México es megadiverso: ocupa el 4º lugar mundial en biodiversidad con ~200,000 especies conocidas (10-12% de la biodiversidad del planeta) en menos del 1.5% de la superficie terrestre.",
      "Ecosistemas clave de México: selvas húmedas (Chiapas, Veracruz), bosques de pino-encino (Sierra Madre), manglares (costas del Pacífico y Golfo), desiertos del norte (Chihuahuense, Sonorense) y arrecife mesoamericano (Quintana Roo).",
      "Componentes abióticos determinantes: temperatura, precipitación, tipo de suelo, radiación solar, altitud. Su combinación crea condiciones únicas para cada bioma.",
      "Zonas de transición (ecotono): área de contacto entre dos ecosistemas con alta biodiversidad propia (ej. borde selva-bosque). México concentra muchos ecotonos por su topografía variada.",
      "Servicios ecosistémicos: los ecosistemas proveen alimento, agua limpia, regulación del clima, polinización, medicamentos y cultura. Valorarlos es clave para la conservación.",
    ],
    fuente: "Material CEN Bachillerato — CNEYT-III. Datos: CONABIO, UICN, WWF 2024.",
  },
  { // P02 — lectura (Redes tróficas y flujo de energía)
    titulo: "Redes tróficas: quién come a quién y por qué importa",
    texto: `La energía que sustenta toda la vida en la Tierra proviene originalmente del Sol. Las plantas, algas y algunas bacterias capturan esa energía mediante la fotosíntesis y la convierten en materia orgánica (glucosa). Por eso se llaman productores o autótrofos: fabrican su propio alimento.\n\nA partir de los productores se construye la red trófica: la trama de relaciones de quién come a quién en un ecosistema. Los herbívoros (consumidores primarios) comen plantas; los carnívoros de primer orden (consumidores secundarios) comen herbívoros; los depredadores de alto nivel (consumidores terciarios o cuaternarios) comen otros carnívoros. Los descomponedores (hongos, bacterias) cierran el ciclo degradando la materia orgánica muerta y devolviendo nutrientes al suelo.\n\nUn concepto clave es la eficiencia ecológica: solo entre el 5% y el 20% de la energía de un nivel trófico se transfiere al siguiente. La regla del 10% es una simplificación didáctica útil: si los productores fijan 10,000 kcal, los consumidores primarios disponen de ~1,000 kcal, los secundarios de ~100 kcal y los terciarios de apenas ~10 kcal. El 90% restante se pierde como calor en la respiración celular, movimiento, calor corporal y heces.\n\nEsto tiene consecuencias enormes. Las pirámides de energía y biomasa muestran esta disminución en cada nivel: los ecosistemas pueden sustentar muchos más herbívoros que carnívoros. También explica por qué las dietas basadas en plantas son más eficientes energéticamente para el planeta: comer directamente del primer nivel trófico reduce las pérdidas de energía.`,
    fuente: "Material elaborado para CEN Bachillerato — CNEYT-III",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 10,
    preguntas_comprension: [
      { pregunta: "¿Por qué se llama 'productores' a las plantas y algas?", respuesta_guia: "Porque producen (fabrican) su propio alimento mediante la fotosíntesis, convirtiendo energía solar en materia orgánica; son la base de toda red trófica." },
      { pregunta: "¿Qué es la eficiencia ecológica y cómo explica la forma de las pirámides tróficas?", respuesta_guia: "Es el porcentaje de energía que se transfiere de un nivel trófico al siguiente (~10%). Como se pierde ~90% en cada nivel, la energía disponible disminuye hacia arriba, formando una pirámide." },
      { pregunta: "¿Por qué las dietas basadas en plantas son más eficientes energéticamente para el planeta?", respuesta_guia: "Porque al comer del primer nivel trófico (productores), se evitan las pérdidas de energía de los niveles intermedios; se necesita menos tierra y energía para producir la misma cantidad de calorías." },
      { pregunta: "¿Qué papel cumplen los descomponedores en la red trófica?", respuesta_guia: "Degradan la materia orgánica muerta y devuelven los nutrientes al suelo, cerrando el ciclo de la materia y permitiendo que los productores vuelvan a usarlos." },
    ],
  },
  { // P03 — video_con_preguntas (Fotosíntesis)
    url: "https://example.com/video-pendiente-cen",
    duracion_segundos: 510,
    titulo: "Fotosíntesis: la ecuación de la vida",
    descripcion: "Explica la ecuación general de la fotosíntesis (CO₂ + H₂O + luz → glucosa + O₂), las fases de la fotosíntesis (reacciones de luz y ciclo de Calvin), los tipos de plantas C3, C4 y CAM y sus adaptaciones a diferentes ambientes, y la importancia ecológica de la fotosíntesis como base de casi todas las redes tróficas y reguladora del CO₂ atmosférico.",
    preguntas: [
      { timestamp_segundos: 90, pregunta: "¿Cuáles son los reactivos y los productos de la fotosíntesis? Escribe la ecuación general.", respuesta_guia: "6 CO₂ + 6 H₂O + energía luminosa → C₆H₁₂O₆ (glucosa) + 6 O₂. Los reactivos son CO₂, H₂O y luz; los productos son glucosa y O₂." },
      { timestamp_segundos: 280, pregunta: "¿Qué diferencia existe entre las plantas C3, C4 y CAM en cuanto a su estrategia fotosintética?", respuesta_guia: "C3 (mayoría de plantas): fijan CO₂ directamente en el ciclo de Calvin; pierden agua. C4 (maíz, caña): prefijan CO₂ en mesófilo para concentrarlo; más eficientes en calor. CAM (cactus, agaves): abren estomas de noche para reducir pérdida de agua en ambientes áridos." },
      { timestamp_segundos: 450, pregunta: "¿Por qué se dice que la fotosíntesis es 'la base de casi toda la vida en la Tierra'?", respuesta_guia: "Porque convierte energía solar en materia orgánica que alimenta a todos los demás organismos; además produce el oxígeno que respiramos y absorbe CO₂, regulando el clima." },
    ],
  },
  { // P04 — infografia (Ciclos biogeoquímicos)
    titulo: "Los ciclos que sostienen la vida: agua, carbono, nitrógeno y fósforo",
    url_imagen: "/placeholder/infografia.svg",
    descripcion: "Infografía de los cuatro principales ciclos biogeoquímicos: el ciclo del agua (hidrológico), el ciclo del carbono, el ciclo del nitrógeno y el ciclo del fósforo. Muestra los reservorios, flujos y procesos clave de cada ciclo, y cómo la actividad humana los altera.",
    puntos_clave: [
      "Ciclo del agua: evaporación (océanos, lagos, suelo), transpiración vegetal, condensación (nubes), precipitación (lluvia, nieve), escorrentía e infiltración. El agua circula continuamente entre atmósfera, hidrosfera y litosfera.",
      "Ciclo del carbono: fijación fotosintética (CO₂ → glucosa), respiración celular (glucosa → CO₂), descomposición, combustión de fósiles (libera carbono acumulado durante millones de años), y el océano como gran reservorio (absorbe ~25% del CO₂ antropogénico).",
      "Ciclo del nitrógeno: el N₂ atmosférico (78% del aire) no puede usarse directamente. Proceso: fijación (bacterias como Rhizobium convierten N₂ → NH₃), nitrificación (NH₃ → NO₂⁻ → NO₃⁻), asimilación por plantas, y desnitrificación (bacterias devuelven N₂ al aire).",
      "Ciclo del fósforo: no tiene fase gaseosa significativa. El P se libera por meteorización de rocas, es absorbido por plantas, pasa a animales, y regresa al suelo por descomposición. Principal límite: la eutrofización de lagos por exceso de P de fertilizantes.",
      "Perturbaciones humanas: la quema de fósiles altera el ciclo del C; los fertilizantes sintéticos (Haber-Bosch) duplicaron la fijación de N artificial; la deforestación interrumpe el ciclo del agua y libera CO₂ almacenado en biomasa.",
      "Retroalimentación climática: el calentamiento global acelera la descomposición orgánica (libera más CO₂ y metano del permafrost), creando un ciclo de retroalimentación positiva que amplifica el cambio climático.",
    ],
    fuente: "Material CEN Bachillerato — CNEYT-III. Datos: IPCC 2023, NASA Earth Observatory.",
  },
  { // P05 — lectura (Subsistemas terrestres)
    titulo: "Los cuatro subsistemas de la Tierra: atmósfera, hidrosfera, litosfera y biosfera",
    texto: `La Tierra funciona como un sistema complejo formado por cuatro grandes subsistemas que interactúan constantemente. Comprenderlos es esencial para entender cómo funciona nuestro planeta y por qué los cambios en uno afectan a todos los demás.\n\nLa atmósfera es la capa gaseosa que envuelve la Tierra. Está formada principalmente por nitrógeno (78%), oxígeno (21%) y gases traza como CO₂, argón y vapor de agua. Protege la vida al absorber la radiación UV del Sol (capa de ozono) y regula la temperatura mediante el efecto invernadero natural. Sin él, la temperatura media sería de -18°C en lugar de los 15°C actuales.\n\nLa hidrosfera comprende toda el agua de la Tierra: océanos (97% del agua total), glaciares y casquetes polares (~2%), aguas subterráneas (~0.7%) y agua superficial dulce (<0.3%). Los océanos regulan el clima absorbiendo calor y CO₂, y las corrientes oceánicas distribuyen energía térmica por el planeta.\n\nLa litosfera es la capa sólida exterior: la corteza terrestre y la parte superior del manto. Está fragmentada en placas tectónicas que se mueven ~2-10 cm por año, causando sismos, volcanes y la formación de montañas. El vulcanismo libera CO₂, vapor de agua y SO₂ a la atmósfera, conectando la litosfera con los demás subsistemas.\n\nLa biosfera incluye todos los organismos vivos y los ecosistemas que habitan. Interactúa con los tres subsistemas anteriores: las plantas fijan CO₂ (atmósfera-biosfera), los corales construyen arrecifes de carbonato de calcio (hidrosfera-litosfera-biosfera), y las raíces desintegran la roca (litosfera-biosfera). La vida no solo habita el planeta: lo transforma.`,
    fuente: "Material elaborado para CEN Bachillerato — CNEYT-III",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 11,
    preguntas_comprension: [
      { pregunta: "¿Por qué se dice que la Tierra sin efecto invernadero natural tendría -18°C?", respuesta_guia: "Porque el efecto invernadero natural (CO₂, vapor de agua y otros gases) retiene parte de la energía solar que la Tierra reemite como calor; sin ese efecto, casi toda la energía escaparía al espacio y el planeta estaría congelado." },
      { pregunta: "¿Cómo conecta el vulcanismo la litosfera con la atmósfera?", respuesta_guia: "Los volcanes liberan CO₂, vapor de agua, SO₂ y otros gases directamente a la atmósfera; a lo largo de la historia geológica han influido en la composición del aire y en eventos climáticos globales." },
      { pregunta: "¿En qué sentido 'la vida transforma el planeta' y no solo lo habita?", respuesta_guia: "Los organismos modifican activamente los subsistemas: las plantas alteran la composición atmosférica (oxígeno), los arrecifes construyen estructuras geológicas, las raíces erosionan rocas y los microorganismos fijan nutrientes del aire." },
    ],
  },
  { // P06 — video_con_preguntas (Deterioro ambiental)
    url: "https://example.com/video-pendiente-cen",
    duracion_segundos: 540,
    titulo: "Crisis ambiental: contaminación, deforestación y cambio climático",
    descripcion: "Analiza las principales formas de deterioro ambiental: contaminación del agua (metales pesados, plásticos, agroquímicos), contaminación del aire (PM2.5, ozono troposférico, CO₂), deforestación (pérdida de 10 millones de ha/año), cambio climático (causas, evidencias del IPCC y consecuencias), y la huella ecológica como herramienta de medición del impacto humano.",
    preguntas: [
      { timestamp_segundos: 100, pregunta: "¿Qué diferencia hay entre contaminación del agua por fuentes puntuales y fuentes difusas? Da un ejemplo de cada una.", respuesta_guia: "Fuente puntual: descarga identificable como una tubería de fábrica o drenaje urbano. Fuente difusa: escorrentía agrícola que arrastra agroquímicos de toda una región, sin un punto de origen único." },
      { timestamp_segundos: 310, pregunta: "¿Cuáles son las tres evidencias más sólidas del cambio climático según el IPCC?", respuesta_guia: "Aumento de la temperatura media global (~1.1°C desde 1850), aumento del nivel del mar (~20 cm desde 1900) y disminución de la cobertura de hielo ártico y glaciares en todo el mundo." },
      { timestamp_segundos: 490, pregunta: "¿Qué es la huella ecológica y qué nos dice si es mayor que 1 Tierra?", respuesta_guia: "La huella ecológica mide cuánta superficie bioproductiva necesita una población para sostener su consumo y absorber sus residuos. Si supera 1 Tierra, estamos consumiendo más recursos de los que el planeta puede regenerar (déficit ecológico)." },
    ],
  },
  { // P07 — lectura (Políticas de conservación en México)
    titulo: "Conservar la biodiversidad en México: leyes, áreas protegidas y comunidades",
    texto: `México no solo es uno de los países más biodiversos del mundo; también cuenta con un marco legal e institucional de conservación que combina instrumentos nacionales, acuerdos internacionales y el papel fundamental de las comunidades locales e indígenas.\n\nLas Áreas Naturales Protegidas (ANP) son el instrumento más importante. México cuenta con más de 182 ANP que cubren ~90 millones de hectáreas (~17% del territorio nacional y aguas jurisdiccionales). Se dividen en categorías: Reservas de Biosfera (las de mayor restricción), Parques Nacionales, Monumentos Naturales, Áreas de Protección de Flora y Fauna, Santuarios y Zonas de Restauración Ecológica.\n\nEl marco legal principal es la Ley General del Equilibrio Ecológico y la Protección al Ambiente (LGEEPA, 1988), que regula la protección del ambiente, el uso racional de recursos naturales, la preservación de ecosistemas y la participación ciudadana. Instituciones como la SEMARNAT, la CONANP y la PROFEPA administran y vigilan su aplicación.\n\nEn el plano internacional, México es parte del Convenio sobre la Diversidad Biológica (CDB, 1992), que establece compromisos para conservar la biodiversidad, usar sosteniblemente sus componentes y distribuir equitativamente sus beneficios. También suscribió las Metas de Kunming-Montreal (2022): proteger el 30% de la superficie terrestre y marina para 2030.\n\nUn pilar muchas veces ignorado es el papel de las comunidades indígenas y rurales. En México, más del 80% de la biodiversidad silvestre se encuentra en tierras de uso común (ejidos y comunidades). Los sistemas de conocimiento ecológico tradicional han conservado ecosistemas durante siglos; la conservación comunitaria (como la certificación de predios como UMAFOR o ADVC) ha demostrado ser tan efectiva o más que las ANP formales en algunos contextos.`,
    fuente: "Material elaborado para CEN Bachillerato — CNEYT-III",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 12,
    preguntas_comprension: [
      { pregunta: "¿Qué son las Áreas Naturales Protegidas y cuánto territorio cubre México con ellas?", respuesta_guia: "Son zonas del territorio nacional donde el Estado restringe actividades para proteger ecosistemas y especies; México tiene más de 182 ANP que cubren ~17% del territorio y aguas jurisdiccionales (~90 millones de ha)." },
      { pregunta: "¿Qué establece el Convenio sobre la Diversidad Biológica (CDB)?", respuesta_guia: "Establece tres objetivos: conservar la biodiversidad, usar sus componentes de forma sostenible y distribuir equitativamente los beneficios derivados del uso de los recursos genéticos." },
      { pregunta: "¿Por qué el papel de las comunidades indígenas es clave para la conservación en México?", respuesta_guia: "Porque más del 80% de la biodiversidad silvestre de México se encuentra en tierras ejidales y comunales; el conocimiento ecológico tradicional ha conservado ecosistemas por siglos, y la conservación comunitaria es frecuentemente tan o más efectiva que las ANP formales." },
    ],
  },
  { // P08 — glosario_interactivo (Sustentabilidad y acción ambiental)
    terminos: [
      { termino: "Objetivos de Desarrollo Sostenible (ODS)", definicion: "Los 17 objetivos adoptados por la ONU en 2015 como parte de la Agenda 2030, que buscan erradicar la pobreza, proteger el planeta y garantizar la paz y prosperidad para 2030.", ejemplo: "El ODS 14 (Vida submarina) impulsa la protección de océanos y mares; el ODS 15 (Vida de ecosistemas terrestres) busca detener la deforestación.", etiquetas: ["ONU", "sustentabilidad", "agenda 2030"] },
      { termino: "Huella ecológica", definicion: "Indicador que mide cuánta superficie bioproductiva (tierra y agua) necesita una población para generar los recursos que consume y absorber los residuos que produce.", ejemplo: "La huella ecológica de México es ~2.5 ha/persona; la biocapacidad disponible es ~1.8 ha/persona, lo que indica un déficit ecológico.", etiquetas: ["impacto ambiental", "consumo", "biocapacidad"] },
      { termino: "Resiliencia ecológica", definicion: "Capacidad de un ecosistema para absorber perturbaciones y reorganizarse mientras experimenta cambios, manteniendo esencialmente la misma estructura, función y biodiversidad.", ejemplo: "Un arrecife de coral con alta diversidad de especies tiene mayor resiliencia: si una especie desaparece, otras ocupan su nicho.", etiquetas: ["ecosistemas", "perturbación", "adaptación"] },
      { termino: "Área Natural Protegida (ANP)", definicion: "Zona del territorio nacional en la que el Estado restringe actividades humanas para conservar ecosistemas, biodiversidad y servicios ambientales, según la LGEEPA.", ejemplo: "La Reserva de Biosfera de Calakmul (Campeche) protege la mayor extensión de selva maya en México y es Patrimonio de la Humanidad.", etiquetas: ["conservación", "México", "LGEEPA"] },
      { termino: "Restauración ecológica", definicion: "Proceso de asistir la recuperación de un ecosistema degradado, dañado o destruido para retornar su estructura, función y biodiversidad.", ejemplo: "Reforestar con especies nativas en una cuenca deforestada, eliminar especies invasoras y restaurar el flujo hídrico natural son acciones de restauración ecológica.", etiquetas: ["rehabilitación", "biodiversidad", "ecosistemas"] },
      { termino: "Biodiversidad", definicion: "Variedad de formas de vida en la Tierra en sus tres niveles: diversidad genética (dentro de una especie), diversidad de especies (entre especies) y diversidad de ecosistemas.", ejemplo: "México es megadiverso: posee ~10-12% de las especies del mundo en solo ~1.5% de la superficie terrestre, incluyendo ~800 especies de reptiles y ~30,000 de plantas vasculares.", etiquetas: ["vida", "especies", "ecosistemas", "México"] },
      { termino: "Servicios ecosistémicos", definicion: "Beneficios que los ecosistemas proveen a las sociedades humanas, clasificados en: servicios de aprovisionamiento (alimentos, agua, madera), servicios de regulación (clima, inundaciones, polinización), servicios culturales y servicios de soporte (ciclos de nutrientes, fotosíntesis).", ejemplo: "Los manglares proveen servicios de aprovisionamiento (pesca), regulación (protección costera ante huracanes) y culturales (turismo, identidad local).", etiquetas: ["naturaleza", "economía ecológica", "conservación"] },
      { termino: "Carbono neutral", definicion: "Estado en que las emisiones de CO₂ de una actividad u organización son compensadas por la captura o reducción equivalente de CO₂, resultando en un balance neto de cero emisiones.", ejemplo: "Una empresa puede ser carbono neutral plantando bosques que absorban el CO₂ que emite, o comprando bonos de carbono certificados que financien proyectos de reducción de emisiones.", etiquetas: ["cambio climático", "emisiones", "compensación"] },
      { termino: "Investigación acción participativa (IAP)", definicion: "Metodología que combina investigación científica y acción social: los propios afectados participan en identificar el problema, investigar sus causas y diseñar soluciones. Valora el conocimiento local.", ejemplo: "Una comunidad costera que mapea con los pescadores las zonas de pesca sobreexplotada y diseña vedas temporales basadas en sus observaciones realiza IAP.", etiquetas: ["metodología", "comunidad", "acción ambiental"] },
      { termino: "Agencia ciudadana ambiental", definicion: "Capacidad y disposición de los ciudadanos para actuar deliberadamente en defensa y mejora del ambiente, a través de acciones individuales, colectivas o políticas.", ejemplo: "Participar en la consulta ciudadana de un plan de desarrollo urbano para exigir áreas verdes, unirse a brigadas de limpieza de ríos o votar informado en elecciones sobre política ambiental son ejercicios de agencia ciudadana.", etiquetas: ["ciudadanía", "participación", "sustentabilidad"] },
    ],
  },
];

// ── A2 ──────────────────────────────────────────────────────────────────────────
const contenidosA2 = [
  { // P01 — quiz_multiple_opcion (Biomas y ecosistemas)
    preguntas: [
      { pregunta: "¿Qué distingue un bioma de un ecosistema?", opciones: ["Un bioma es microscópico; un ecosistema es macroscópico", "Un bioma es una región geográfica amplia con clima y vegetación característica; un ecosistema incluye la comunidad biótica y el entorno abiótico a cualquier escala", "Son sinónimos perfectos", "Un ecosistema solo aplica al mar; un bioma, a la tierra"], respuesta_correcta: 1, retroalimentacion: "El bioma es una unidad biogeográfica regional (como la selva tropical o la tundra); el ecosistema incluye la comunidad viva + factores abióticos y puede tener cualquier tamaño, desde un charco hasta un océano." },
      { pregunta: "¿Por qué México es considerado un país 'megadiverso'?", opciones: ["Porque tiene la mayor superficie territorial de América", "Porque posee entre el 10-12% de la biodiversidad mundial en menos del 2% de la superficie terrestre", "Porque tiene el mayor número de parques nacionales del continente", "Porque solo en México viven los jaguares y los axolotes"], respuesta_correcta: 1, retroalimentacion: "México comparte el título de megadiverso con solo 17 países del mundo que juntos albergan más del 70% de la biodiversidad del planeta. La combinación de climas, topografía y su posición biogeográfica explican esta riqueza." },
      { pregunta: "¿Cuál de estos factores abióticos es determinante para distinguir un desierto de una selva tropical?", opciones: ["La altitud sobre el nivel del mar", "La temperatura y la precipitación anual", "La presencia de suelo arenoso", "La latitud geográfica exclusivamente"], respuesta_correcta: 1, retroalimentacion: "La temperatura y la precipitación son los factores climáticos más determinantes para definir un bioma. Los desiertos tienen <250 mm de lluvia/año; las selvas tropicales, >2000 mm, con temperaturas cálidas todo el año." },
      { pregunta: "¿Qué son los servicios ecosistémicos?", opciones: ["Empresas que limpian ecosistemas contaminados", "Los beneficios que los ecosistemas proporcionan a las sociedades humanas (alimentos, agua limpia, regulación del clima, polinización)", "Los servicios turísticos en áreas naturales protegidas", "Las actividades económicas que se realizan dentro de un ecosistema"], respuesta_correcta: 1, retroalimentacion: "Los servicios ecosistémicos son todos los beneficios que las personas obtienen de los ecosistemas, incluyendo aprovisionamiento (alimento, agua), regulación (clima, inundaciones), culturales y de soporte (fotosíntesis, ciclos de nutrientes)." },
      { pregunta: "Un ecotono es:", opciones: ["Un tipo de bioma polar extremo", "La zona de transición entre dos ecosistemas, con alta biodiversidad propia", "Un organismo que vive en dos ecosistemas distintos", "El nivel máximo de un nivel trófico"], respuesta_correcta: 1, retroalimentacion: "El ecotono es la zona de contacto o transición entre dos ecosistemas (ej. borde entre un bosque y una pradera). Suele tener mayor biodiversidad que cada uno por separado, ya que combina especies de ambos." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P02 — ejercicio_matematico (Regla del 10% - flujo de energía)
    enunciado: "En una pradera, los productores (pastos) fijan 10,000 kcal de energía solar mediante fotosíntesis. Aplicando la regla del 10% de eficiencia ecológica:\n\n(a) ¿Cuánta energía (en kcal) estará disponible para los consumidores primarios (ratones y conejos)?\n(b) ¿Cuánta energía estará disponible para los consumidores secundarios (zorros)?\n(c) ¿Cuánta energía estará disponible para los consumidores terciarios (águilas)?\n(d) ¿Qué porcentaje de la energía original de los productores llega al nivel de los consumidores terciarios?",
    datos: ["Energía fijada por productores: 10,000 kcal", "Eficiencia ecológica entre niveles: 10% (regla del 10%)", "Niveles: productores → consumidores primarios → consumidores secundarios → consumidores terciarios"],
    pasos_guia: [
      "Nivel 1 (productores): 10,000 kcal",
      "Nivel 2 (consumidores primarios): 10,000 × 10% = 10,000 × 0.10 = 1,000 kcal",
      "Nivel 3 (consumidores secundarios): 1,000 × 10% = 1,000 × 0.10 = 100 kcal",
      "Nivel 4 (consumidores terciarios): 100 × 10% = 100 × 0.10 = 10 kcal",
      "Porcentaje que llega al nivel 4: (10 kcal / 10,000 kcal) × 100 = 0.1%",
    ],
    solucion: 10,
    solucion_explicada: "(a) 1,000 kcal; (b) 100 kcal; (c) 10 kcal; (d) 0.1% de la energía original llega al nivel de los consumidores terciarios. El 99.9% se pierde como calor en los procesos metabólicos de los niveles intermedios.",
    tolerancia: 0,
    unidades: "kcal (kilocalorías)",
  },
  { // P03 — quiz_verdadero_falso (Fotosíntesis)
    preguntas: [
      { afirmacion: "La fotosíntesis produce CO₂ y consume O₂, lo opuesto a la respiración celular.", es_verdadero: false, retroalimentacion: "Al revés: la fotosíntesis consume CO₂ y H₂O, y produce glucosa y O₂. La respiración celular consume O₂ y glucosa, y produce CO₂ y H₂O." },
      { afirmacion: "Las plantas C4 como el maíz son más eficientes que las C3 en ambientes cálidos y con alta radiación solar porque evitan la fotorrespiración.", es_verdadero: true, retroalimentacion: "Correcto. Las plantas C4 prefijan el CO₂ en el mesófilo y lo concentran en las células del haz vascular, reduciendo la fotorrespiración que afecta a las plantas C3 en condiciones de calor y luz intensa." },
      { afirmacion: "Los agaves y los cactus son plantas CAM que abren sus estomas de día para capturar CO₂.", es_verdadero: false, retroalimentacion: "Las plantas CAM abren sus estomas de NOCHE para capturar CO₂ y almacenarlo como ácido málico; durante el día los cierran para evitar la pérdida de agua (una adaptación clave a ambientes áridos)." },
      { afirmacion: "La fotosíntesis solo ocurre en las hojas de las plantas vasculares.", es_verdadero: false, retroalimentacion: "La fotosíntesis ocurre en todo tejido verde (hojas, tallos jóvenes, frutos verdes). Además, la realizan algas, cianobacterias y algunas bacterias fotosintéticas, no solo plantas terrestres." },
      { afirmacion: "El oxígeno liberado en la fotosíntesis proviene de la molécula de agua (H₂O), no del CO₂.", es_verdadero: true, retroalimentacion: "Correcto. En la fotólisis del agua (reacciones de luz), las moléculas de H₂O se dividen; el O₂ liberado proviene del oxígeno del agua, comprobado con experimentos con isótopos marcados (¹⁸O)." },
      { afirmacion: "Sin fotosíntesis, la concentración de O₂ en la atmósfera se mantendría igual gracias a la descomposición de materia orgánica.", es_verdadero: false, retroalimentacion: "Sin fotosíntesis, el O₂ atmosférico se consumiría rápidamente por la respiración y la oxidación. La fotosíntesis es prácticamente la única fuente de O₂ libre de la atmósfera terrestre." },
      { afirmacion: "Las algas unicelulares (fitoplancton) realizan fotosíntesis y son responsables de aproximadamente el 50% del O₂ que produce la Tierra.", es_verdadero: true, retroalimentacion: "Correcto. El fitoplancton marino (diatomeas, dinoflagelados, cianobacterias) genera alrededor de la mitad del oxígeno atmosférico global, a pesar de su pequeño tamaño individual." },
    ],
    intentos_maximos: 2,
    puntaje_minimo_aprobacion: 70,
  },
  { // P04 — fill_blanks (Ciclos biogeoquímicos)
    texto_con_huecos: `El ciclo del agua comienza con la ___ del agua de océanos, ríos y suelo, que sube a la atmósfera como vapor. Al enfriarse forma nubes (___), y cae nuevamente como ___ o nieve. En las plantas, el proceso de ___ también devuelve vapor de agua a la atmósfera.\n\nEn el ciclo del carbono, las plantas absorben ___ del aire durante la fotosíntesis. Este carbono pasa a los animales por la alimentación y regresa al aire mediante la ___ celular y la descomposición. La combustión de ___ libera carbono acumulado durante millones de años.\n\nEl nitrógeno atmosférico (N₂) no puede ser usado directamente por la mayoría de los organismos. Bacterias como ___ lo convierten en formas asimilables (fijación), y otras bacterias devuelven el N₂ al aire mediante la ___.`,
    huecos: [
      { respuesta_correcta: "evaporación", alternativas_aceptadas: ["evaporacion"], pista: "Proceso por el que el agua líquida pasa a vapor" },
      { respuesta_correcta: "condensación", alternativas_aceptadas: ["condensacion"], pista: "Proceso por el que el vapor de agua forma gotitas de agua en la atmósfera" },
      { respuesta_correcta: "precipitación", alternativas_aceptadas: ["precipitacion", "lluvia"], pista: "Caída de agua desde las nubes (lluvia, granizo)" },
      { respuesta_correcta: "transpiración", alternativas_aceptadas: ["transpiracion"], pista: "Las plantas liberan vapor de agua por sus estomas" },
      { respuesta_correcta: "CO₂", alternativas_aceptadas: ["co2", "dióxido de carbono", "dioxido de carbono"], pista: "Gas que las plantas fijan en la fotosíntesis; fórmula: CO₂" },
      { respuesta_correcta: "respiración", alternativas_aceptadas: ["respiracion"], pista: "Proceso metabólico que libera CO₂ y produce energía (ATP)" },
      { respuesta_correcta: "combustibles fósiles", alternativas_aceptadas: ["fosiles", "fósiles", "petroleo", "petróleo", "carbon", "carbón"], pista: "Petróleo, carbón y gas natural acumulados durante millones de años" },
      { respuesta_correcta: "Rhizobium", alternativas_aceptadas: ["rhizobium", "bacterias fijadoras de nitrógeno", "bacterias fijadoras"], pista: "Bacteria simbiótica de las raíces de leguminosas que fija N₂ atmosférico" },
      { respuesta_correcta: "desnitrificación", alternativas_aceptadas: ["desnitrificacion"], pista: "Proceso bacteriano que convierte nitratos en N₂ atmosférico" },
    ],
    distingue_mayusculas: false,
  },
  { // P05 — simulacion (Interacciones entre subsistemas terrestres)
    descripcion: "Simulación de las interacciones entre los cuatro subsistemas terrestres (atmósfera, hidrosfera, litosfera y biosfera). El estudiante modifica variables como la concentración de CO₂ atmosférico, la cobertura vegetal o la actividad volcánica, y observa cómo estas modificaciones alteran el comportamiento de los demás subsistemas (temperatura, nivel del mar, ciclo del agua, biodiversidad).",
    instrucciones: [
      "Observa el estado inicial del sistema: temperatura media, nivel del mar, concentración de CO₂ y cobertura vegetal en valores de referencia (año 1850).",
      "Aumenta gradualmente la concentración de CO₂ atmosférico en incrementos de 50 ppm (de 280 a 420 ppm) y registra los cambios en temperatura media y nivel del mar.",
      "Reduce la cobertura vegetal (deforestación: de 100% a 50%) y observa cómo cambian el ciclo del agua (precipitación, evapotranspiración) y la absorción de CO₂.",
      "Simula una erupción volcánica mayor: aumenta el SO₂ y CO₂ volcánico y observa sus efectos sobre la temperatura y la acidez del océano.",
      "Activa la variable 'retroalimentación del permafrost': observa cómo el deshielo libera metano y cómo este amplifica el calentamiento.",
      "Diseña un escenario de 'restauración': reforesta y reduce CO₂. Registra cuánto tiempo tarda el sistema en recuperar parámetros de referencia.",
    ],
    variables_a_explorar: ["Concentración de CO₂ atmosférico (ppm)", "Temperatura media global (°C)", "Nivel del mar (cm sobre la referencia)", "Cobertura vegetal (%)", "Acidez del océano (pH)", "Emisiones volcánicas de SO₂ y CO₂", "Metano del permafrost (ppb)"],
    preguntas_reflexion: [
      "¿Qué subsistema mostró la mayor sensibilidad al aumento de CO₂? ¿Por qué crees que es así?",
      "¿Cuánto tardaría el sistema (según la simulación) en recuperarse si se detuvieran todas las emisiones de CO₂ hoy? ¿Qué te dice eso sobre la urgencia de actuar?",
      "¿Cómo cambia el ciclo del agua cuando se reduce la cobertura vegetal? ¿Qué consecuencias tiene esto para las comunidades humanas?",
      "¿En qué se parece la retroalimentación del permafrost a un 'punto de no retorno'? Explica con tus propias palabras.",
    ],
  },
  { // P06 — quiz_multiple_opcion (Deterioro ambiental)
    preguntas: [
      { pregunta: "¿Qué es la eutrofización de un cuerpo de agua?", opciones: ["La salinización excesiva de lagos y ríos por evaporación", "El enriquecimiento excesivo de nutrientes (N y P) que causa proliferación de algas y agotamiento del oxígeno disuelto", "La contaminación por metales pesados de origen industrial", "El calentamiento artificial del agua por plantas termoeléctricas"], respuesta_correcta: 1, retroalimentacion: "La eutrofización ocurre cuando el exceso de nitrógeno y fósforo (de fertilizantes o aguas residuales) estimula la explosión de algas (bloom). Al morir, su descomposición agota el oxígeno disuelto y mata a los peces y otros organismos." },
      { pregunta: "¿Cuál de los siguientes es un GEI (gas de efecto invernadero) de MAYOR potencial de calentamiento que el CO₂?", opciones: ["Nitrógeno (N₂)", "Argón (Ar)", "Metano (CH₄)", "Oxígeno (O₂)"], respuesta_correcta: 2, retroalimentacion: "El metano (CH₄) tiene un potencial de calentamiento global ~80 veces mayor que el CO₂ en un horizonte de 20 años; aunque su concentración atmosférica es menor, su efecto por molécula es mucho más potente." },
      { pregunta: "La deforestación contribuye al cambio climático principalmente porque:", opciones: ["Genera lluvias ácidas por la quema de madera", "Libera el carbono almacenado en la biomasa y reduce la capacidad de absorción de CO₂ del planeta", "Aumenta la reflexión solar (albedo) del suelo, enfriando la atmósfera", "Solo afecta la biodiversidad local, no tiene efecto climático global"], respuesta_correcta: 1, retroalimentacion: "Los bosques almacenan grandes cantidades de carbono en su biomasa. Al deforestar (especialmente al quemar), ese carbono se libera como CO₂. Además, se pierde la capacidad fotosintética que absorbería CO₂ futuro." },
      { pregunta: "¿Qué describe mejor el concepto de 'islas de calor urbanas'?", opciones: ["Zonas del mar con temperatura anormalmente alta por corrientes oceánicas", "Áreas urbanas con temperaturas más altas que su entorno rural, por pavimento, edificios y poco verde", "Zonas geotérmicas dentro de ciudades con actividad volcánica subterránea", "Regiones costeras que reciben más radiación solar que el interior"], respuesta_correcta: 1, retroalimentacion: "Las islas de calor urbanas se forman porque el asfalto, el concreto y los edificios absorben más calor que la vegetación, y los autos, industrias y aires acondicionados generan calor adicional. La falta de áreas verdes agrava el fenómeno." },
      { pregunta: "¿Qué es la acidificación del océano y cuál es su causa principal?", opciones: ["El aumento de sal marina por la evaporación acelerada", "La absorción de CO₂ atmosférico por el océano, que forma ácido carbónico y reduce el pH", "El vertido de ácidos industriales directamente al mar", "El calentamiento del agua que libera ácidos naturales del suelo marino"], respuesta_correcta: 1, retroalimentacion: "El océano absorbe ~25% del CO₂ humano. El CO₂ disuelto reacciona con el agua: CO₂ + H₂O → H₂CO₃ (ácido carbónico), que se disocia y libera H⁺, bajando el pH. Esto daña corales, moluscos y otros organismos con concha de carbonato de calcio." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P07 — quiz_verdadero_falso (Conservación en México)
    preguntas: [
      { afirmacion: "La LGEEPA es la ley federal que regula el equilibrio ecológico y la protección ambiental en México desde 1988.", es_verdadero: true, retroalimentacion: "Correcto. La Ley General del Equilibrio Ecológico y la Protección al Ambiente (LGEEPA) es el principal instrumento jurídico ambiental de México, que norma la protección de ecosistemas, el uso racional de recursos y la participación ciudadana." },
      { afirmacion: "Las Reservas de Biosfera en México permiten cualquier tipo de actividad económica dentro de su perímetro total.", es_verdadero: false, retroalimentacion: "Las Reservas de Biosfera tienen zonas diferenciadas: una zona núcleo (máxima protección, sin actividades extractivas) y zonas de amortiguamiento donde se permiten actividades sostenibles controladas. No todo es libre." },
      { afirmacion: "Más del 80% de la biodiversidad silvestre de México se encuentra en tierras de ejidos y comunidades agrarias, no solo en ANP.", es_verdadero: true, retroalimentacion: "Correcto. Esto significa que la conservación de la biodiversidad en México depende en gran medida del manejo que hacen las comunidades locales e indígenas de sus tierras, no solo de las áreas protegidas formales." },
      { afirmacion: "México no ha firmado ningún tratado internacional relacionado con la biodiversidad.", es_verdadero: false, retroalimentacion: "México es parte del Convenio sobre la Diversidad Biológica (CDB, 1992), del Protocolo de Nagoya sobre acceso y distribución de beneficios, del Acuerdo de París sobre cambio climático y de las Metas de Kunming-Montreal (2022), entre otros." },
      { afirmacion: "Las Metas de Kunming-Montreal (2022) proponen proteger el 30% de la superficie terrestre y marina del planeta para el año 2030.", es_verdadero: true, retroalimentacion: "Correcto. El acuerdo conocido como '30x30' fue adoptado en la COP15 de biodiversidad en Montreal. México firmó este acuerdo como parte de sus compromisos con el Convenio de Diversidad Biológica." },
      { afirmacion: "La CONANP (Comisión Nacional de Áreas Naturales Protegidas) es la institución encargada de administrar las ANP en México.", es_verdadero: true, retroalimentacion: "Correcto. La CONANP es el órgano desconcentrado de la SEMARNAT responsable de administrar y vigilar las Áreas Naturales Protegidas federales de México." },
    ],
    intentos_maximos: 2,
    puntaje_minimo_aprobacion: 70,
  },
  { // P08 — autoevaluacion (Agencia ambiental y acción local)
    criterios: [
      {
        nombre: "Comprensión de los ODS relacionados con el ambiente",
        descripcion: "Identifico y comprendo los Objetivos de Desarrollo Sostenible vinculados a la protección ambiental (ODS 13, 14, 15) y puedo explicar su relevancia local.",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "No conozco los ODS o no puedo relacionarlos con problemas ambientales concretos." },
          { valor: 2, etiqueta: "En desarrollo", descripcion: "Conozco algunos ODS pero tengo dificultades para vincularlos con situaciones reales de mi comunidad." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Identifico los ODS ambientales clave y puedo dar ejemplos concretos de cómo se aplican o se violan en mi entorno inmediato." },
        ],
      },
      {
        nombre: "Identificación de problemas ambientales locales",
        descripcion: "Puedo identificar y describir con evidencia al menos un problema ambiental de mi comunidad o región.",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "Solo puedo nombrar problemas globales generales; no identifico problemas específicos de mi entorno." },
          { valor: 2, etiqueta: "En desarrollo", descripcion: "Identifico un problema local pero me cuesta describirlo con datos o evidencias concretas." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Identifico un problema ambiental de mi comunidad, lo describo con datos o ejemplos observables y puedo señalar sus causas principales." },
        ],
      },
      {
        nombre: "Diseño de propuestas de acción ambiental",
        descripcion: "Soy capaz de diseñar una propuesta de acción ambiental concreta, factible y fundamentada para mi contexto.",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "Mis propuestas son muy vagas (ej. 'cuidar el ambiente') sin pasos concretos ni fundamento." },
          { valor: 2, etiqueta: "En desarrollo", descripcion: "Propongo acciones específicas pero me falta considerar recursos, actores involucrados o viabilidad." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Diseño una propuesta con objetivo claro, acciones específicas, actores involucrados y al menos una forma de medir el éxito." },
        ],
      },
      {
        nombre: "Sentido de agencia y responsabilidad ambiental",
        descripcion: "Reconozco mi capacidad de influir en el ambiente desde mi posición como estudiante y ciudadano.",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "Siento que los problemas ambientales son tan grandes que lo que yo haga no importa." },
          { valor: 2, etiqueta: "En desarrollo", descripcion: "Reconozco que puedo contribuir pero me cuesta identificar acciones realmente significativas a mi alcance." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Identifico acciones concretas a mi alcance (individuales, colectivas y políticas) y comprendo cómo se suman para generar cambios mayores." },
        ],
      },
    ],
    prompt_reflexion_final: "¿En qué criterio obtuviste la puntuación más baja? Describe una acción concreta y específica que puedas realizar en los próximos 7 días para mejorar en ese aspecto.",
  },
];

// ── A3 ──────────────────────────────────────────────────────────────────────────
const contenidosA3 = [
  { // P01 — reflexion_escrita (La biodiversidad que me rodea)
    prompt: "Observa el ecosistema más cercano a tu casa o escuela. Puede ser un parque, un jardín, un camellón arbolado, un canal, o incluso el patio de tu escuela.\n\n¿Qué organismos puedes identificar? ¿Cuáles son los productores, los consumidores y los descomponedores que observas o sabes que están ahí? ¿Qué factores abióticos determinan ese ecosistema (luz, suelo, agua, temperatura)? ¿En qué bioma o tipo de ecosistema se clasifica ese lugar? Reflexiona: ¿ese ecosistema está bien conservado o muestra señales de deterioro? ¿Qué lo amenaza?",
    pistas: ["Los productores son cualquier planta, árbol, pasto o alga que veas (o imagines que hay).", "Los consumidores pueden ser insectos, pájaros, perros, gatos, ardillas, incluso humanos.", "Los descomponedores suelen ser invisibles: hongos en la tierra, bacterias del suelo.", "Un camellón en la ciudad es un fragmento de ecosistema rodeado de asfalto — ¿eso es una amenaza?"],
    pistas_evaluacion: ["Identifica al menos 3 organismos de diferentes niveles tróficos", "Menciona al menos 2 factores abióticos del lugar", "Relaciona lo observado con los conceptos de bioma y ecosistema", "Reflexiona críticamente sobre el estado de conservación"],
    longitud_minima: 80,
    criterios_evaluacion: ["Identifica organismos de al menos dos niveles tróficos diferentes en su entorno", "Menciona factores abióticos relevantes del ecosistema observado", "Relaciona el ecosistema local con algún bioma o tipo de ecosistema estudiado", "Reflexiona críticamente sobre el estado de conservación y las amenazas"],
  },
  { // P02 — reflexion_escrita (La regla del 10% y lo que comemos)
    prompt: "Acabas de calcular que del total de energía que fijan los productores, solo el 0.1% llega al nivel de los consumidores terciarios. Esto no es solo un cálculo de biología: tiene consecuencias enormes para cómo producimos alimentos.\n\n¿Qué implica la regla del 10% para comparar una dieta basada en plantas con una basada en carne? ¿Por qué se necesita más tierra y agua para producir 1 kg de carne que 1 kg de frijoles o maíz? ¿Tiene esto relación con el hambre en el mundo? Reflexiona: ¿cambiará esto alguna decisión sobre lo que comes? No tienes que decir que sí — argumenta honestamente.",
    pistas: ["Para producir 1 kg de carne de res se necesitan entre 6 y 15 kg de granos vegetales (según el sistema de producción).", "El agua necesaria para producir 1 kg de carne (~15,000 litros) es muy superior a la de 1 kg de legumbres (~1,000-4,000 litros).", "No se trata de juzgar dietas: se trata de entender las implicaciones ecológicas de las cadenas alimentarias.", "La soberanía alimentaria y el acceso a alimentos son dimensiones sociales que también importan."],
    pistas_evaluacion: ["Aplica la regla del 10% a la producción de alimentos", "Compara la eficiencia de al menos dos tipos de alimentos", "Conecta con el contexto de sustentabilidad o justicia alimentaria", "Argumenta con honestidad su postura personal"],
    longitud_minima: 80,
    criterios_evaluacion: ["Aplica correctamente la lógica de la regla del 10% a la producción de alimentos", "Compara al menos dos tipos de alimentos en términos de eficiencia energética o uso de recursos", "Conecta el análisis con alguna dimensión social, ambiental o de justicia", "Argumenta su postura personal con coherencia, sin importar cuál sea"],
  },
  { // P03 — autoevaluacion (Fotosíntesis)
    criterios: [
      {
        nombre: "Ecuación general de la fotosíntesis",
        descripcion: "Escribo y explico la ecuación general de la fotosíntesis, identificando reactivos, productos y la fuente de energía.",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "No recuerdo la ecuación o confundo reactivos con productos." },
          { valor: 2, etiqueta: "En desarrollo", descripcion: "Recuerdo la ecuación pero no puedo explicar de dónde proviene cada elemento (especialmente de dónde viene el O₂)." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Escribo la ecuación completa (6CO₂ + 6H₂O + luz → C₆H₁₂O₆ + 6O₂) y explico que el O₂ proviene de la fotólisis del agua." },
        ],
      },
      {
        nombre: "Tipos de plantas fotosintéticas: C3, C4 y CAM",
        descripcion: "Distingo los tres tipos de plantas según su estrategia fotosintética y los relaciono con sus adaptaciones al ambiente.",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "No conozco la diferencia entre plantas C3, C4 y CAM." },
          { valor: 2, etiqueta: "En desarrollo", descripcion: "Sé que existen los tres tipos pero confundo sus estrategias o no puedo dar ejemplos correctos." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Explico con precisión las diferencias (C3: mayoría, sin adaptación especial; C4: concentran CO₂, más eficientes en calor; CAM: abren estomas de noche en ambientes áridos) y doy ejemplos de cada tipo." },
        ],
      },
      {
        nombre: "Importancia ecológica de la fotosíntesis",
        descripcion: "Explico por qué la fotosíntesis es la base de casi toda la vida en la Tierra y su papel en el ciclo del carbono.",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "Solo sé que 'las plantas necesitan luz solar para vivir'; no puedo explicar sus implicaciones ecológicas." },
          { valor: 2, etiqueta: "En desarrollo", descripcion: "Sé que la fotosíntesis produce O₂ y glucosa, pero no puedo explicar bien su papel en el ciclo del carbono o las redes tróficas." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Explico que la fotosíntesis fija el carbono atmosférico en materia orgánica (base de todas las cadenas tróficas), produce el O₂ atmosférico y regula el CO₂, siendo clave para el clima." },
        ],
      },
      {
        nombre: "Conexión con el cambio climático",
        descripcion: "Relaciono la fotosíntesis con el cambio climático: su papel como sumidero de carbono y las consecuencias de la deforestación.",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "No veo relación entre la fotosíntesis y el cambio climático." },
          { valor: 2, etiqueta: "En desarrollo", descripcion: "Sé que los bosques absorben CO₂, pero no puedo explicar cuantitativamente o en detalle la relación." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Explico que los bosques son sumideros de carbono; la deforestación reduce esa capacidad y libera CO₂ almacenado, amplificando el cambio climático. Relaciono con el ciclo del carbono." },
        ],
      },
    ],
    prompt_reflexion_final: "¿En cuál de los cuatro criterios te sientes menos seguro/a? Escribe dos preguntas específicas sobre ese tema que todavía no puedes responder con confianza.",
  },
  { // P04 — quiz_multiple_opcion (Ciclos biogeoquímicos — cierre)
    preguntas: [
      { pregunta: "¿Qué proceso del ciclo del nitrógeno convierte el N₂ atmosférico en formas que las plantas pueden absorber?", opciones: ["Desnitrificación", "Nitrificación", "Fijación de nitrógeno", "Denitrificación"], respuesta_correcta: 2, retroalimentacion: "La fijación de nitrógeno (realizada por bacterias como Rhizobium y Azotobacter) convierte el N₂ gaseoso en amoníaco (NH₃) o iones amonio (NH₄⁺), que las plantas pueden absorber. Sin este proceso, el N₂ del aire sería inaccesible para los organismos." },
      { pregunta: "¿Por qué el ciclo del fósforo es diferente a los ciclos del carbono y del nitrógeno?", opciones: ["Porque el fósforo es un gas a temperatura ambiente", "Porque el fósforo no tiene una fase atmosférica significativa; circula principalmente entre la litosfera, el suelo y los seres vivos", "Porque el fósforo solo existe en los océanos", "Porque los microorganismos no participan en el ciclo del fósforo"], respuesta_correcta: 1, retroalimentacion: "A diferencia del C y N, el fósforo casi no tiene fase gaseosa; su ciclo es sedimentario. Se libera de las rocas por meteorización, es absorbido por plantas y devuelto al suelo por descomposición, o llega al océano y se deposita en sedimentos." },
      { pregunta: "La eutrofización de un lago es un ejemplo de perturbación humana en el ciclo del:", opciones: ["Agua únicamente", "Carbono únicamente", "Nitrógeno y fósforo principalmente", "Silicio y hierro"], respuesta_correcta: 2, retroalimentacion: "La eutrofización ocurre por el exceso de nitrógeno (N) y fósforo (P) provenientes de fertilizantes agrícolas o aguas residuales. Estos nutrientes estimulan el crecimiento masivo de algas, alterando gravemente el ciclo de ambos elementos en el ecosistema acuático." },
      { pregunta: "¿Qué papel juegan los hongos y las bacterias en los ciclos biogeoquímicos?", opciones: ["Solo perjudican los ciclos al consumir nutrientes", "Son descomponedores que liberan nutrientes de la materia orgánica muerta, haciéndolos disponibles para los productores", "Solo intervienen en el ciclo del nitrógeno", "No tienen un papel relevante en los ciclos biogeoquímicos"], respuesta_correcta: 1, retroalimentacion: "Los descomponedores (hongos y bacterias) son esenciales: sin ellos, los nutrientes quedarían atrapados en la materia orgánica muerta y los productores no podrían reincorporarlos. Son el cierre indispensable de todos los ciclos biogeoquímicos." },
      { pregunta: "El proceso de evapotranspiración combina:", opciones: ["La evaporación del suelo y la transpiración de las plantas", "La evaporación del océano y la precipitación de lluvia", "La transpiración animal y la condensación en nubes", "La filtración del agua y su evaporación en el subsuelo"], respuesta_correcta: 0, retroalimentacion: "La evapotranspiración suma la evaporación directa del agua del suelo, lagos y ríos, más la transpiración de las plantas (liberación de vapor de agua por los estomas). Es un proceso clave en el ciclo hidrológico, especialmente en bosques tropicales." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P05 — quiz_multiple_opcion (Subsistemas terrestres — cierre)
    preguntas: [
      { pregunta: "¿Cuál de los cuatro subsistemas terrestres incluye todos los organismos vivos del planeta?", opciones: ["Hidrosfera", "Litosfera", "Atmósfera", "Biosfera"], respuesta_correcta: 3, retroalimentacion: "La biosfera comprende todos los organismos vivos y los ecosistemas que habitan, desde las profundidades oceánicas hasta la alta atmósfera. Es el único subsistema formado exclusivamente por seres vivos y sus interacciones." },
      { pregunta: "¿Cuál es la composición aproximada de la atmósfera terrestre actual?", opciones: ["78% O₂, 21% N₂, 1% CO₂", "78% N₂, 21% O₂, ~1% otros gases (Ar, CO₂, vapor de agua)", "50% N₂, 50% O₂", "100% N₂ con trazas de O₂"], respuesta_correcta: 1, retroalimentacion: "La atmósfera es ~78% nitrógeno (N₂), ~21% oxígeno (O₂) y ~1% otros gases (argón, CO₂, metano, vapor de agua). El CO₂ actual es ~0.042% (420 ppm), pequeño en volumen pero enorme en efecto climático." },
      { pregunta: "¿Qué causa el movimiento de las placas tectónicas?", opciones: ["La rotación de la Tierra sobre su eje", "Las corrientes de convección en el manto terrestre caliente (astenósfera)", "La atracción gravitacional de la Luna", "La presión del agua de los océanos sobre la litosfera"], respuesta_correcta: 1, retroalimentacion: "Las corrientes de convección en la astenósfera (parte del manto superior, plástica y caliente) arrastran las placas tectónicas. El calor interno de la Tierra (radioactividad y calor residual de la formación) impulsa estas corrientes." },
      { pregunta: "¿Cómo conecta la biosfera con el ciclo del carbono de la atmósfera?", opciones: ["La biosfera solo produce CO₂ mediante la respiración", "Las plantas fijan CO₂ atmosférico mediante fotosíntesis; los organismos lo liberan por respiración y descomposición, creando un intercambio continuo entre biosfera y atmósfera", "La biosfera no tiene efecto sobre el CO₂ atmosférico", "Solo los océanos intercambian carbono con la atmósfera"], respuesta_correcta: 1, retroalimentacion: "La biosfera es un componente activo del ciclo del carbono: la fotosíntesis extrae CO₂ de la atmósfera y lo fija en biomasa; la respiración, descomposición y combustión de biomasa lo devuelven. Los bosques son grandes sumideros de carbono." },
      { pregunta: "¿Por qué el calentamiento global afecta la hidrosfera (ciclo del agua)?", opciones: ["Porque el calor evapora el agua de la atmósfera directamente", "Porque el aumento de temperatura acelera la evaporación, intensifica las precipitaciones extremas, derrite glaciares y eleva el nivel del mar, alterando todo el ciclo hidrológico", "Porque el calor crea nuevos océanos al derretir la litosfera", "Porque el calentamiento reduce la densidad del agua, lo que detiene las corrientes oceánicas inmediatamente"], respuesta_correcta: 1, retroalimentacion: "El calentamiento global altera el ciclo del agua en múltiples formas: mayor evaporación (más lluvias intensas y más sequías en otras regiones), deshielo de glaciares y casquetes (sube el nivel del mar), y alteración de las corrientes oceánicas que distribuyen calor." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P06 — debate_estructurado (Responsabilidad climática)
    tema: "¿La principal responsabilidad del cambio climático recae en los individuos o en las corporaciones y gobiernos?",
    postura_a: "La responsabilidad principal recae en las corporaciones y gobiernos, que deben liderar el cambio sistémico",
    postura_b: "La responsabilidad es compartida e individual: cada persona debe cambiar sus hábitos para generar presión y transformación",
    argumentos_a: [
      "El 71% de las emisiones globales de GEI proviene de solo 100 empresas (Carbon Disclosure Project, 2017); el impacto individual es marginal frente a decisiones corporativas.",
      "Las empresas fósiles han financiado activamente la desinformación climática durante décadas para retrasar regulaciones (documentado por investigaciones de Harvard y Columbia).",
      "Sin regulación estatal obligatoria (impuestos al carbono, prohibición de combustibles fósiles, estándares de emisiones), las empresas no cambiarán voluntariamente porque sus incentivos son económicos.",
      "Los países del G7 son responsables históricos desproporcionados: emitieron la mayor parte del CO₂ acumulado en la atmósfera mientras se industrializaban.",
      "La narrativa de la 'huella de carbono individual' fue popularizada por BP en una campaña de relaciones públicas de 2004 para desviar la atención de las emisiones industriales.",
    ],
    argumentos_b: [
      "La demanda de los consumidores impulsa la producción: sin demanda de combustibles fósiles, autos de gasolina y carne industrial, las empresas tendrían que cambiar.",
      "Las acciones individuales tienen efecto político: millones de personas que exigen políticas climáticas, votan informadas y cambian hábitos crean presión de mercado y política.",
      "Esperar solo a corporaciones y gobiernos genera pasividad; las comunidades que actúan localmente demuestran que el cambio es posible y construyen modelos replicables.",
      "Las decisiones de consumo individuales (dieta, transporte, energía en el hogar) representan entre el 40-60% de las emisiones totales en países de ingreso medio-alto.",
    ],
  },
  { // P07 — reflexion_escrita (Conservación y comunidades indígenas)
    prompt: "Aprendiste que más del 80% de la biodiversidad silvestre de México se encuentra en tierras de comunidades indígenas y ejidos, no en las ANP formales. Esto significa que la conservación de la naturaleza en México depende en gran parte de decisiones comunitarias, no solo del Estado.\n\n¿Qué opinas sobre esto? ¿Por qué el conocimiento ecológico tradicional podría ser tan valioso (o más) que el conocimiento científico formal para conservar ecosistemas locales? ¿Qué riesgos corren estas comunidades que conservan sus territorios? ¿Cómo debería el Estado apoyar (o no interferir) en la conservación comunitaria? Argumenta con al menos una referencia a algún instrumento legal o acuerdo internacional que viste en esta progresión.",
    pistas: ["El Convenio de Biodiversidad reconoce el valor del conocimiento indígena. ¿Qué implica eso en la práctica?", "Muchas comunidades indígenas que conservan sus bosques enfrentan amenazas: proyectos mineros, turísticos o agroindustriales que ignoran sus derechos.", "El concepto de 'territorio' para los pueblos indígenas va más allá de la propiedad: incluye identidad, espiritualidad y forma de vida.", "¿Puede la ley proteger la conservación comunitaria? Piensa en la LGEEPA y en los Acuerdos de Libre Determinación."],
    longitud_minima: 90,
    criterios_evaluacion: ["Reflexiona sobre el valor del conocimiento ecológico tradicional con argumentos concretos", "Menciona al menos un instrumento legal (LGEEPA, CDB u otro) en contexto correcto", "Identifica al menos una amenaza real que enfrentan las comunidades conservacionistas", "Toma y defiende una postura propia sobre el papel del Estado en la conservación comunitaria"],
  },
  { // P08 — reflexion_escrita (Propuesta de acción local)
    prompt: "Has estudiado ecosistemas, ciclos biogeoquímicos, deterioro ambiental, políticas de conservación y conceptos de sustentabilidad. Ahora es momento de pasar del conocimiento a la acción.\n\nDiseña una propuesta de acción ambiental local basada en los principios de la Investigación Acción Participativa (IAP). Tu propuesta debe:\n1. Identificar un problema ambiental específico de tu comunidad, escuela o barrio.\n2. Proponer al menos dos acciones concretas y factibles (no solo 'sensibilizar').\n3. Mencionar quiénes son los actores que deberían involucrarse.\n4. Conectar tu propuesta con al menos un ODS.\n5. Proponer cómo medirías si la acción funcionó.\n\nSé específico/a. No sirve 'plantar árboles en general'; sí sirve 'reforestar el camellón de la calle X con especies nativas del Bajío en coordinación con la delegación municipal'.",
    pistas: ["Investiga si hay un comité ambiental en tu escuela, municipio o colonia.", "Los ODS 13 (Acción por el clima), 14 (Vida submarina) y 15 (Vida de ecosistemas terrestres) son los más relevantes, pero ODS 11 (ciudades sostenibles) o 3 (salud) también pueden conectar.", "Una métrica sencilla puede ser: número de árboles plantados que sobrevivieron a 6 meses, kilos de residuos separados por mes, % de compañeros que cambiaron un hábito.", "Recuerda: el principio de la IAP es que la comunidad participa en todo el proceso, no solo como 'beneficiaria'."],
    longitud_minima: 100,
    criterios_evaluacion: ["Identifica un problema ambiental local real y específico", "Propone al menos dos acciones concretas y factibles (no genéricas)", "Menciona actores involucrados con roles definidos", "Conecta la propuesta con al menos un ODS correctamente", "Propone al menos una métrica para evaluar el éxito de la acción"],
  },
];

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
