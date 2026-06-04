/**
 * Producto Integrador del semestre para PM-IV (Pensamiento Matemático IV —
 * funciones, trigonometría, geometría analítica y cónicas).
 * - Crea 1 capstone (reflexion_escrita) que integra las 7 progresiones:
 *   Concepto de función, funciones polinomiales de 1er y 2do grado,
 *   razones trigonométricas en triángulo rectángulo, trigonometría en el
 *   círculo unitario, Ley de Senos y Cosenos, geometría analítica (distancia,
 *   punto medio, ecuación de la recta) y cónicas (circunferencia y parábola).
 *   Se aloja en la progresión de mayor número (culminante de PM-IV).
 * - Queda en estado 'borrador' (no publica nada): el usuario decide cuándo publicar.
 * Uso: npx tsx scripts/seed-pmiv-producto-integrador.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🎓 Producto Integrador PM-IV (borrador)\n");

  const progs = await getProgresionesDeUAC(sb, "PM-IV");
  if (progs.length === 0) throw new Error("No se encontraron progresiones de PM-IV");
  const pFinal = progs.reduce((a, b) => (b.numero > a.numero ? b : a), progs[0]);

  const ok = await upsertActividad(sb, {
    codigo: "PM-IV-PRODUCTO-INTEGRADOR",
    progresion_id: pFinal.id,
    titulo: "Producto Integrador: Modelado Matemático de una Ciudad — Funciones, Trigonometría, Geometría Analítica y Cónicas",
    descripcion: "Capstone del semestre: integra las siete progresiones de PM-IV (funciones y sus representaciones, funciones polinomiales de 1er y 2do grado, razones trigonométricas, círculo unitario, Ley de Senos y Cosenos, geometría analítica y cónicas) en una tarea de modelado matemático real de infraestructura urbana.",
    tipo: "reflexion_escrita",
    xp: 50,
    estado: "borrador",
    contenido: {
      prompt:
        "PRODUCTO INTEGRADOR — PM-IV: Pensamiento Matemático IV\n\n" +
        "A lo largo del semestre desarrollaste siete competencias matemáticas fundamentales: (1) el concepto de función y sus cuatro representaciones; (2) las funciones polinomiales de primer grado (lineales) y segundo grado (cuadráticas) y sus transformaciones; (3) las razones trigonométricas en triángulos rectángulos y la medición indirecta; (4) las razones trigonométricas en el círculo unitario, incluyendo ángulos de cualquier magnitud y sus signos por cuadrante; (5) la Ley de Senos y la Ley de Cosenos para resolver triángulos oblicuángulos; (6) la geometría analítica con las fórmulas de distancia, punto medio y ecuación de la recta en el plano cartesiano; y (7) las cónicas básicas: la circunferencia y la parábola como lugares geométricos.\n\n" +
        "SITUACIÓN INTEGRADORA — MODELADO MATEMÁTICO DE UNA CIUDAD:\n" +
        "Imagina que eres parte de un equipo de ingeniería y urbanismo encargado de planificar y modelar matemáticamente distintos elementos de una ciudad moderna. Tienes libertad de elegir el tipo de ciudad (costera, montañosa, industrial, turística, etc.) y el nombre de los elementos que diseñas. Tu tarea es elaborar un informe técnico-matemático que demuestre cómo cada una de las siete competencias de PM-IV aparece y es indispensable en el diseño urbano.\n\n" +
        "Tu informe (mínimo 300 palabras) debe desarrollar CADA UNO de los siguientes siete puntos con procedimientos matemáticos completos y su justificación en el contexto del proyecto:\n\n" +
        "1) FUNCIÓN Y REPRESENTACIONES: Identifica una variable de la ciudad que sea función de otra (por ejemplo, el consumo de energía eléctrica f en función de la hora del día t, o la temperatura en función de la altitud). Define explícitamente: (a) el dominio y el rango, (b) la regla de correspondencia f(x), (c) una representación tabular con al menos 5 pares (x, f(x)), y (d) una descripción verbal del comportamiento de la función. Verifica con la prueba de la línea vertical que tu gráfica represente efectivamente una función.\n\n" +
        "2) FUNCIÓN LINEAL O CUADRÁTICA Y TRANSFORMACIONES: Modela algún fenómeno de tu ciudad con una función polinomial. Si eliges una función lineal f(x) = mx + b, interpreta la pendiente m como tasa de cambio en el contexto urbano (por ejemplo, costo en pesos por metro cuadrado de construcción). Si eliges una función cuadrática f(x) = ax² + bx + c (o en forma vértice), calcula el vértice e interprétalo como un máximo o mínimo en el contexto (por ejemplo, la altura máxima de un arco de puente, la dimensión óptima de un parque). Describe al menos una transformación geométrica aplicada (desplazamiento, reflexión o dilatación) y su significado práctico.\n\n" +
        "3) TRIGONOMETRÍA EN EL TRIÁNGULO RECTÁNGULO: Identifica un triángulo rectángulo dentro de la infraestructura de tu ciudad (rampa de acceso, escalera, torre de telecomunicaciones, antena, pendiente de una calle, etc.). Usando sen, cos y/o tan con ángulos de elevación o depresión, calcula una medida inaccesible directamente (altura, distancia diagonal, longitud de rampa). Muestra el procedimiento completo con la razón trigonométrica aplicada y verifica con la identidad sen²(θ) + cos²(θ) = 1.\n\n" +
        "4) TRIGONOMETRÍA EN EL CÍRCULO UNITARIO: Uno de los fenómenos de tu ciudad varía de forma cíclica o periódica (por ejemplo, las mareas, la intensidad lumínica de un semáforo, la posición angular de una noria o de los aspas de un generador de viento). Describe el ángulo θ en posición estándar para al menos dos momentos del ciclo, identifica el cuadrante de cada ángulo, determina el ángulo de referencia y calcula los valores exactos de sen(θ) y cos(θ). Aplica la regla de signos por cuadrante para justificar cada resultado.\n\n" +
        "5) LEY DE SENOS Y LEY DE COSENOS: En el trazado de tu ciudad existen terrenos, parcelas o rutas con forma de triángulo oblicuángulo (sin ángulo recto). Elige un triángulo oblicuángulo que aparezca naturalmente en tu diseño (por ejemplo, una parcela triangular, una ruta entre tres puntos de interés, la estructura de un techo inclinado). Con los datos que conozcas del triángulo, aplica la Ley de Senos o la Ley de Cosenos para resolver todos sus elementos (lados y ángulos desconocidos). Justifica por qué elegiste esa ley y muestra cada paso del cálculo.\n\n" +
        "6) GEOMETRÍA ANALÍTICA — DISTANCIA, PUNTO MEDIO Y ECUACIÓN DE LA RECTA: Coloca dos elementos importantes de tu ciudad en el plano cartesiano (por ejemplo, el ayuntamiento en el punto A y el hospital en el punto B). Calcula: (a) la distancia entre A y B usando d = √((x₂−x₁)² + (y₂−y₁)²); (b) el punto medio M del segmento AB (por ejemplo, para ubicar una estación de servicio o un parque equidistante); (c) la ecuación de la recta que une A con B en forma pendiente-intercepto; (d) la ecuación de la recta perpendicular a AB que pasa por M (para trazar una avenida perpendicular). Interpreta cada resultado en el contexto urbano.\n\n" +
        "7) CÓNICAS — CIRCUNFERENCIA Y PARÁBOLA: Modela dos elementos de tu ciudad usando cónicas. (a) Una fuente circular, una rotonda, un estadio o una plaza circular: escribe su ecuación en la forma estándar (x−h)² + (y−k)² = r², identifica centro y radio, y determina si un punto de interés específico (una entrada, un monumento) está dentro, sobre o fuera de la circunferencia. (b) Un arco parabólico, una antena de satélite o una iluminación reflectora: escribe la ecuación de la parábola en forma vértice, identifica el vértice (máximo o mínimo), el eje de simetría y calcula la apertura (hacia dónde abre y por qué eso es funcional para el diseño).\n\n" +
        "REFLEXIÓN FINAL: Cierra tu informe respondiendo: ¿Cuál de las siete competencias matemáticas de PM-IV fue la más difícil de aplicar en tu proyecto y por qué? ¿Qué herramienta matemática consideras más útil para el diseño urbano y cuál sería tu siguiente paso si quisieras profundizar en este modelado?\n\n" +
        "Escribe con claridad y precisión, muestra todos los procedimientos matemáticos paso a paso con notación correcta (usa ² para exponentes, √ para raíces, θ para ángulos, etc.), y justifica cada decisión de diseño con argumentos matemáticos. Puedes incluir descripciones de diagramas, tablas o gráficas.",
      pistas: [
        "Para la sección de FUNCIONES: recuerda que el dominio debe ser el conjunto de valores de entrada con sentido real en tu contexto (por ejemplo, horas del día: [0, 24]). El rango lo determinas observando qué valores produce la función sobre ese dominio. Si no conoces la fórmula exacta, puedes inventar una función razonable y consistente con el fenómeno descrito.",
        "Para la sección de TRIGONOMETRÍA EN TRIÁNGULO RECTÁNGULO: elige un ángulo de elevación o depresión entre 15° y 75° para que los cálculos sean significativos. Los ángulos notables (30°, 45°, 60°) simplifican los cálculos con valores exactos. Recuerda: tan(θ) = altura/distancia horizontal, por lo que si conoces la distancia y el ángulo, la altura = distancia × tan(θ).",
        "Para la sección del CÍRCULO UNITARIO: los ángulos de una noria o sistema rotatorio pueden expresarse como θ = 360° × (fracción del ciclo completado). Por ejemplo, después de completar 1/3 de una vuelta: θ = 120° (segundo cuadrante). Usa la regla mnemotécnica de cuadrantes para verificar el signo de sen y cos antes de calcular el valor exacto con el ángulo de referencia.",
        "Para la sección de LEY DE SENOS Y COSENOS: si conoces dos lados y el ángulo comprendido entre ellos (caso LAL), usa la Ley de Cosenos: c² = a² + b² − 2ab·cos(C). Si conoces dos ángulos y un lado (caso AAL o ALA), usa la Ley de Senos: a/sen(A) = b/sen(B). Siempre verifica que los ángulos de un triángulo sumen 180°.",
        "Para la sección de CÓNICAS: al completar el cuadrado para convertir x² + y² + Dx + Ey + F = 0 a forma estándar, agrupa los términos en x y en y por separado, añade el cuadrado del semicoeficiente a ambos lados. Por ejemplo: x² − 6x → (x−3)² − 9. Para la parábola, identifica si abre verticalmente (función de x) u horizontalmente (función de y) según qué variable está al cuadrado.",
      ],
      longitud_minima_palabras: 300,
      criterios_evaluacion: [
        "Identifica una función real, define su dominio y rango en contexto, la representa en al menos dos formas (tabular y algebraica o gráfica) y evalúa f(a) para un valor específico del dominio.",
        "Modela un fenómeno urbano con una función lineal o cuadrática, calcula los datos relevantes (pendiente, vértice, ceros) e interpreta al menos una transformación geométrica en el contexto del proyecto.",
        "Aplica correctamente las razones trigonométricas (sen, cos, tan) en un triángulo rectángulo real de su ciudad para calcular una medida inaccesible, muestra el procedimiento completo y verifica con la identidad pitagórica trigonométrica.",
        "Extiende la trigonometría al círculo unitario: ubica ángulos en posición estándar, identifica cuadrantes, calcula ángulos de referencia y obtiene valores exactos de sen y cos para modelar un fenómeno periódico de la ciudad.",
        "Resuelve un triángulo oblicuángulo real de su diseño urbano aplicando la Ley de Senos o la Ley de Cosenos con el caso correcto (LAL, LLL, AAL), mostrando todos los pasos algebraicos y trigonométricos.",
        "Aplica la geometría analítica: calcula la distancia y el punto medio entre dos puntos clave de la ciudad, determina la ecuación de la recta que los une y la de la perpendicular, e interpreta cada resultado en el contexto urbano.",
        "Modela dos elementos urbanos con cónicas: una circunferencia (con ecuación estándar, centro y radio identificados) y una parábola (con vértice, eje de simetría y apertura interpretados), justificando la elección de la forma cónica en cada caso.",
      ],
      formato_esperado: "ensayo",
    },
  });
  log(ok ? "  ✓ Producto Integrador PM-IV creado (borrador)\n" : "  ✗ Falló el Producto Integrador\n");

  // Estado actual de PM-IV (sin publicar)
  const ids = progs.map((p) => p.id);
  const { data: all } = await sb.from("actividades").select("estado").in("progresion_id", ids);
  const porEstado: Record<string, number> = {};
  for (const a of all ?? []) porEstado[a.estado] = (porEstado[a.estado] ?? 0) + 1;
  log(`  📊 PM-IV total: ${all?.length ?? 0} actividades → ${JSON.stringify(porEstado)}\n`);
}

main().catch((e) => { console.error("❌ Error:", e.message); process.exit(1); });
