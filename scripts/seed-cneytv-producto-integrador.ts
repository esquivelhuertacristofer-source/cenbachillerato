/**
 * Producto Integrador del semestre para CNEYT-V (La energía en procesos de vida diaria —
 * física: leyes de Newton, cinemática, gravitación universal, movimiento ondulatorio,
 * espectro electromagnético, óptica, electromagnetismo y ética tecnológica).
 * - Crea 1 capstone (reflexion_escrita) que integra las 8 progresiones.
 *   Se aloja en la progresión de mayor número (culminante de CNEYT-V).
 * - Queda en estado 'borrador' (no publica nada): el usuario decide cuándo publicar.
 * Uso: npx tsx scripts/seed-cneytv-producto-integrador.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🎓 Producto Integrador CNEYT-V (borrador)\n");

  const progs = await getProgresionesDeUAC(sb, "CNEYT-V");
  if (progs.length === 0) throw new Error("No se encontraron progresiones de CNEYT-V");
  const pFinal = progs.reduce((a, b) => (b.numero > a.numero ? b : a), progs[0]);

  const ok = await upsertActividad(sb, {
    codigo: "CNEYT-V-PRODUCTO-INTEGRADOR",
    progresion_id: pFinal.id,
    titulo: "Producto Integrador: Análisis Físico de una Misión Espacial — De Newton al Cosmos y la Ética Tecnológica",
    descripcion: "Capstone del semestre: integra las ocho progresiones de CNEYT-V (leyes de Newton, cinemática MRU/MRUA, gravitación universal, movimiento ondulatorio, espectro electromagnético, fenómenos ópticos, electromagnetismo y ética tecnológica) en el análisis físico completo de una misión espacial real o diseñada.",
    tipo: "reflexion_escrita",
    xp: 50,
    estado: "borrador",
    contenido: {
      prompt:
        "PRODUCTO INTEGRADOR — CNEYT-V: La energía en procesos de vida diaria\n\n" +
        "A lo largo del semestre desarrollaste ocho competencias fundamentales de física: (1) las leyes de Newton y el análisis de fuerzas; (2) el movimiento rectilíneo uniforme (MRU) y uniformemente acelerado (MRUA) con representaciones algebraicas y gráficas; (3) la gravitación universal y sus implicaciones en el sistema solar y la exploración espacial; (4) el movimiento ondulatorio y sus características (amplitud, frecuencia, longitud de onda, velocidad: v = f·λ); (5) el espectro electromagnético y sus aplicaciones tecnológicas y biomédicas; (6) los fenómenos ópticos (reflexión, refracción, dispersión) y la ley de Snell; (7) los principios del electromagnetismo (ley de Faraday, motores, generadores, transformadores); y (8) la reflexión ética sobre el desarrollo tecnológico en física.\n\n" +
        "SITUACIÓN INTEGRADORA — ANÁLISIS FÍSICO DE UNA MISIÓN ESPACIAL:\n" +
        "Eres parte de un equipo científico interdisciplinario que diseña, analiza o documenta una misión espacial. Puedes elegir una misión histórica real (Apolo 11, Voyager 1, Curiosity en Marte, James Webb Space Telescope) o diseñar una misión hipotética hacia cualquier destino del sistema solar o más allá. Tu tarea es elaborar un informe técnico-científico que demuestre cómo cada una de las ocho competencias de CNEYT-V es indispensable para planificar, ejecutar y reflexionar sobre esta misión.\n\n" +
        "Tu informe (mínimo 300 palabras) debe desarrollar CADA UNO de los siguientes ocho puntos con procedimientos, conceptos y razonamientos físicamente correctos:\n\n" +
        "1) LEYES DE NEWTON EN LA MISIÓN: Analiza el lanzamiento del cohete o nave. Aplica la tercera ley de Newton para explicar la propulsión (gases expulsados hacia atrás → nave empujada hacia adelante). Usando la segunda ley (F = ma), estima la aceleración inicial si conoces la fuerza de empuje y la masa de la nave (puedes usar valores aproximados reales o razonables). Identifica las fuerzas en juego durante el despegue: empuje, peso (W = mg con g ≈ 9.8 m/s²) y aerodinámica. ¿En qué momento la fuerza neta es cero y la nave viaja con velocidad constante en el espacio?\n\n" +
        "2) CINEMÁTICA (MRU Y MRUA): Describe al menos dos fases del movimiento de la misión usando cinemática. Por ejemplo: (a) la fase de aceleración del cohete en los primeros minutos (MRUA: v = v₀ + at, x = v₀t + ½at²); (b) el trayecto interplanetario en que la nave, lejos de la atmósfera y con motores apagados, viaja a velocidad prácticamente constante (MRU: d = v·t). Calcula numéricamente al menos un valor (velocidad, tiempo o distancia) con datos aproximados y muestra la gráfica v-t o x-t correspondiente descrita en palabras.\n\n" +
        "3) GRAVITACIÓN UNIVERSAL: Aplica la ley F = G·m₁·m₂/r² para analizar la atracción gravitacional que experimenta la nave en distintos momentos del viaje (cerca de la Tierra, en el espacio profundo, cerca del destino). Calcula la velocidad de escape terrestre (v_esc = √(2GM/R) ≈ 11.2 km/s) y explica por qué la nave debe alcanzarla para abandonar la órbita terrestre. Si tu misión llega a otro cuerpo celeste, calcula o estima el peso del astronauta o del rover en ese cuerpo usando g = GM/R² y compara con la Tierra.\n\n" +
        "4) MOVIMIENTO ONDULATORIO Y COMUNICACIONES: La nave se comunica con la Tierra mediante ondas electromagnéticas. Usando v = f·λ (con v = c ≈ 3 × 10⁸ m/s), calcula la longitud de onda de una señal de radio usada en la misión (por ejemplo, la banda de 8.4 GHz usada en comunicaciones de espacio profundo). Calcula también el tiempo que tarda una señal en llegar desde el destino de tu misión hasta la Tierra (distancia / velocidad de la luz). Explica qué características de la onda (amplitud, frecuencia) afectan la calidad y potencia de la señal recibida.\n\n" +
        "5) ESPECTRO ELECTROMAGNÉTICO EN LA MISIÓN: Identifica al menos tres bandas del espectro electromagnético utilizadas en la misión y explica su función: por ejemplo, ondas de radio para comunicaciones, infrarrojo para detección de calor o análisis atmosférico, rayos X o gamma para detectar composición de rocas o para observaciones astronómicas, luz visible para fotografías, ultravioleta para estudios atmosféricos. Para cada banda, indica la longitud de onda aproximada y la razón física por la que esa banda es la adecuada para esa función.\n\n" +
        "6) FENÓMENOS ÓPTICOS: La misión usa instrumentos ópticos (telescopios, cámaras, espectrómetros). Explica cómo al menos dos fenómenos ópticos son relevantes: (a) Reflexión: cómo los espejos de un telescopio espacial (como el James Webb, que usa un espejo primario de 6.5 m) concentran la luz de objetos distantes hacia el detector. (b) Refracción o dispersión: cómo un espectrómetro separa la luz de una estrella o planeta en sus longitudes de onda para determinar composición química. Si aplica, usa la ley de Snell (n₁·sen θ₁ = n₂·sen θ₂) para describir cómo un elemento óptico dirige la luz.\n\n" +
        "7) ELECTROMAGNETISMO: La nave genera y consume electricidad. Explica: (a) Cómo los paneles solares o generadores de radioisótopos (RTG) producen electricidad (relación con la inducción de Faraday o con el efecto fotoeléctrico). (b) Cómo los motores iónicos (usados en misiones como Dawn o Hayabusa) aplican fuerzas electromagnéticas para propulsar iones con alta eficiencia. (c) Cómo los transformadores y sistemas de distribución eléctrica a bordo aseguran que los diferentes instrumentos reciban el voltaje adecuado. Menciona al menos un cálculo o estimación cuantitativa relacionada con potencia, voltaje o corriente.\n\n" +
        "8) REFLEXIÓN ÉTICA: Toda misión espacial tiene implicaciones éticas y sociales. Analiza al menos dos de las siguientes dimensiones: (a) ¿Es ético invertir miles de millones de dólares en exploración espacial cuando existen problemas sociales urgentes en la Tierra? Presenta argumentos a favor y en contra. (b) Si la misión involucra tecnología nuclear (plutonio en RTG, propulsión nuclear), aplica el principio de precaución: ¿cuáles son los riesgos y cómo se minimizan? (c) ¿Cómo garantizar que los beneficios tecnológicos de la exploración espacial (GPS, imágenes satelitales, materiales avanzados) sean accesibles para todos y no amplíen la brecha tecnológica entre países ricos y pobres?\n\n" +
        "REFLEXIÓN FINAL: Cierra tu informe respondiendo: ¿Cuál de las ocho competencias de física de CNEYT-V fue la más sorprendente de encontrar en el contexto de la exploración espacial? ¿Cómo cambió tu perspectiva sobre la física cotidiana después de analizarla en una escala cósmica?\n\n" +
        "Escribe con claridad y rigor científico. Incluye todos los procedimientos matemáticos paso a paso, usa notación física correcta (F en N, v en m/s, λ en m o nm, G = 6.674 × 10⁻¹¹ N·m²/kg², c ≈ 3 × 10⁸ m/s), y justifica cada afirmación con principios físicos. Puedes describir diagramas, esquemas de la órbita o de la nave.",
      pistas: [
        "Para la sección de NEWTON y CINEMÁTICA: recuerda que durante el despegue la nave experimenta MRUA (aceleración constante aproximada). A los motores apagados en el vacío, la inercia mantiene la velocidad casi constante (MRU), excepto por la leve influencia gravitacional. Para el cálculo de aceleración: a = (F_empuje − W)/m. Asegúrate de que las unidades sean consistentes (N, kg, m/s²).",
        "Para la sección de GRAVITACIÓN UNIVERSAL: la velocidad de escape de la Tierra es v_esc = √(2GM_T/R_T) ≈ 11.2 km/s. Para Marte: M = 6.39 × 10²³ kg, R = 3.39 × 10⁶ m, g_Marte = GM/R² ≈ 3.72 m/s². Para la Luna: g_Luna ≈ 1.62 m/s². La tercera ley de Kepler (T² ∝ a³) permite estimar el tiempo de viaje interplanetario.",
        "Para la sección de ONDAS y ESPECTRO EM: las señales de comunicación de espacio profundo usan la banda X (≈ 8.4 GHz) o la banda Ka (≈ 32 GHz). La distancia Tierra-Marte varía entre 54.6 y 401 millones de km; divídela entre c ≈ 3 × 10⁸ m/s para obtener el retardo de señal. Para el telescopio James Webb: observa en infrarrojo (0.6-28 μm) porque la luz de galaxias lejanas se desplaza al rojo (redshift cosmológico).",
        "Para la sección de ÓPTICA: los telescopios reflectores (como Hubble o James Webb) usan espejos cóncavos que reflejan y concentran la luz en el foco. La ley de reflexión (θᵢ = θᵣ) se aplica en cada punto del espejo parabólico. Los espectrómetros separan longitudes de onda por difracción o dispersión para identificar elementos químicos mediante sus líneas espectrales (cada elemento tiene un patrón único de absorción/emisión).",
        "Para la sección de ÉTICA: el debate sobre la inversión en exploración espacial es genuinamente complejo. Argumentos a favor incluyen: spin-offs tecnológicos (velcro, GPS, agua purificada, telemedicina), inspiración científica, seguridad planetaria (asteroides). Argumentos en contra: costo de oportunidad frente a pobreza, cambio climático. No hay respuesta única correcta; lo importante es argumentar con evidencia y principios éticos claros como el bien común, la equidad y el principio de precaución.",
      ],
      longitud_minima_palabras: 300,
      criterios_evaluacion: [
        "Aplica las tres leyes de Newton al análisis del lanzamiento y la propulsión de la nave, calcula la aceleración usando F = ma e identifica correctamente el peso (W = mg) y la fuerza neta en diferentes fases de la misión.",
        "Describe y distingue las fases de MRU y MRUA de la misión con las ecuaciones cinemáticas correspondientes (v = v₀ + at; x = v₀t + ½at²; d = vt), realiza al menos un cálculo numérico y menciona la representación gráfica (x-t o v-t) de cada fase.",
        "Aplica la ley de gravitación universal F = G·m₁·m₂/r² para analizar la atracción gravitacional en distintos puntos del viaje, calcula la velocidad de escape terrestre y determina el peso de un objeto en el cuerpo celeste de destino usando g = GM/R².",
        "Usa la ecuación v = f·λ (con v = c ≈ 3 × 10⁸ m/s) para calcular la longitud de onda de la señal de comunicación y el tiempo de retardo entre la nave y la Tierra, relacionando amplitud y frecuencia con la calidad y energía de la señal.",
        "Identifica al menos tres bandas del espectro electromagnético utilizadas en la misión, indica su longitud de onda aproximada, su función específica y justifica físicamente por qué esa banda es idónea para cada aplicación tecnológica o científica.",
        "Explica la aplicación de al menos dos fenómenos ópticos (reflexión en espejos del telescopio, dispersión/refracción en espectrómetros) usando los principios físicos correctos (ley de reflexión θᵢ = θᵣ; ley de Snell n₁·sen θ₁ = n₂·sen θ₂).",
        "Describe cómo la nave genera y usa electricidad aplicando principios del electromagnetismo (inducción de Faraday, motores iónicos, transformadores) e incluye al menos un dato cuantitativo (potencia, voltaje o corriente estimada).",
        "Reflexiona críticamente sobre las implicaciones éticas y sociales de la misión (inversión económica, uso de tecnología nuclear, brecha tecnológica), presenta argumentos equilibrados y aplica el principio de precaución al menos en un punto del análisis.",
      ],
      formato_esperado: "ensayo",
    },
  });
  log(ok ? "  ✓ Producto Integrador CNEYT-V creado (borrador)\n" : "  ✗ Falló el Producto Integrador CNEYT-V\n");

  // Estado actual de CNEYT-V (sin publicar)
  const ids = progs.map((p) => p.id);
  const { data: all } = await sb.from("actividades").select("estado").in("progresion_id", ids);
  const porEstado: Record<string, number> = {};
  for (const a of all ?? []) porEstado[a.estado] = (porEstado[a.estado] ?? 0) + 1;
  log(`  📊 CNEYT-V total: ${all?.length ?? 0} actividades → ${JSON.stringify(porEstado)}\n`);
}

main().catch((e) => { console.error("❌ Error:", e.message); process.exit(1); });
