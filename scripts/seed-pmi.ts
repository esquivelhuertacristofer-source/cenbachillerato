/**
 * Seed de progresiones reales para PM-I (Pensamiento Matemático I).
 * Alineado con el MCCEMS oficial — Semestre 1.
 *
 * Uso: npx tsx scripts/seed-pmi.ts
 *
 * Requiere NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local
 * Es idempotente: upsert por campo "codigo".
 *
 * NOTA: es_placeholder=true hasta que el área pedagógica valide el contenido.
 */

import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

type SB = ReturnType<typeof createClient<Database>>;

// ── Datos de las 10 progresiones de PM-I ────────────────────────────────────
// Fuente: Marco Curricular Común de la Educación Media Superior (MCCEMS)
//         Recurso Sociocognitivo: Pensamiento Matemático — Semestre 1

const PROGRESIONES_PMI = [
  {
    codigo: "PM-I-P01",
    numero: 1,
    titulo: "Números reales: conjuntos, operaciones y propiedades",
    descripcion: "Organización del sistema de los números reales (N, Z, Q, I, R). Operaciones y sus propiedades. Jerarquía de operaciones y uso de símbolos de agrupación.",
    descripcion_extendida: "Los estudiantes construyen el árbol del sistema numérico real identificando las relaciones de inclusión entre conjuntos. Se trabajan las operaciones fundamentales con énfasis en la jerarquía (PEMDAS/BODMAS) y el uso de símbolos de agrupación en expresiones cada vez más complejas. Se vincula con situaciones reales (presupuestos, mediciones, estadísticas) para dar sentido al cálculo. Se introducen propiedades conmutativa, asociativa y distributiva como herramientas de simplificación.",
    meta_aprendizaje: "Opera con números reales aplicando correctamente la jerarquía de operaciones y las propiedades algebraicas, en contextos numéricos y situacionales concretos.",
    categoria: "Aritmética y álgebra",
    subcategoria: "Sistema numérico real",
    ejes_articuladores: ["Pensamiento crítico"],
    transversalidades: ["LC-I", "CNEYT-I"],
    tiempo_estimado_horas: 5,
  },
  {
    codigo: "PM-I-P02",
    numero: 2,
    titulo: "Razones, proporciones y variación proporcional",
    descripcion: "Razón como comparación entre dos cantidades. Proporción y sus propiedades. Regla de tres simple y compuesta. Variación directa e inversa en situaciones reales.",
    descripcion_extendida: "A partir de problemas contextualizados (recetas, escalas de mapas, mezclas, velocidad) los estudiantes comprenden la razón como una relación multiplicativa entre magnitudes. Se desarrolla la proporción y sus propiedades (término medio y extremo, propiedad fundamental), y se aplica la regla de tres en variación directa e inversa. Se vincula con porcentajes, tasas y escalas en problemas de vida cotidiana, fomentando la modelización matemática desde situaciones reales.",
    meta_aprendizaje: "Resuelve problemas de variación proporcional directa e inversa aplicando razones, proporciones y regla de tres en contextos cotidianos y científicos.",
    categoria: "Aritmética y álgebra",
    subcategoria: "Proporcionalidad",
    ejes_articuladores: ["Pensamiento crítico", "Vida saludable"],
    transversalidades: ["CNEYT-I", "CD-I"],
    tiempo_estimado_horas: 4.5,
  },
  {
    codigo: "PM-I-P03",
    numero: 3,
    titulo: "Expresiones algebraicas y polinomios",
    descripcion: "El lenguaje algebraico: variables, constantes y coeficientes. Expresiones algebraicas: monomios, binomios y polinomios. Operaciones con polinomios (suma, resta, multiplicación).",
    descripcion_extendida: "Los estudiantes transitan del pensamiento aritmético al pensamiento algebraico comprendiendo la variable como número generalizado. Se trabaja la construcción de expresiones algebraicas a partir de situaciones verbales, y se realizan operaciones con polinomios enfatizando la ley de exponentes y la distribución. Se introducen los productos notables (cuadrado de binomio, producto de suma por diferencia) como casos especiales de la multiplicación de polinomios, con verificación mediante sustitución numérica.",
    meta_aprendizaje: "Opera con expresiones algebraicas y polinomios (suma, resta, multiplicación, productos notables), y traduce situaciones verbales a lenguaje algebraico.",
    categoria: "Aritmética y álgebra",
    subcategoria: "Expresiones y polinomios",
    ejes_articuladores: ["Pensamiento crítico"],
    transversalidades: ["CNEYT-I", "IN-I"],
    tiempo_estimado_horas: 5,
  },
  {
    codigo: "PM-I-P04",
    numero: 4,
    titulo: "Factorización de polinomios",
    descripcion: "Factorización como operación inversa de la multiplicación. Métodos: factor común, diferencia de cuadrados, trinomio cuadrado perfecto y trinomio de la forma x²+bx+c.",
    descripcion_extendida: "Los estudiantes comprenden la factorización como la descomposición de un polinomio en factores irreducibles, operación inversa a la multiplicación. Se trabajan los cuatro métodos principales con abundante práctica guiada y autónoma. Se enfatiza la verificación mediante la re-multiplicación y la identificación del método adecuado según la forma del polinomio. La factorización se contextualiza en la simplificación de fracciones algebraicas como antesala a las funciones racionales.",
    meta_aprendizaje: "Factoriza polinomios aplicando el método adecuado (factor común, diferencia de cuadrados, trinomio cuadrado perfecto, trinomio general) y verifica el resultado.",
    categoria: "Aritmética y álgebra",
    subcategoria: "Factorización",
    ejes_articuladores: ["Pensamiento crítico"],
    transversalidades: ["CNEYT-I"],
    tiempo_estimado_horas: 5,
  },
  {
    codigo: "PM-I-P05",
    numero: 5,
    titulo: "Ecuaciones lineales con una incógnita",
    descripcion: "Concepto de ecuación y sus elementos. Resolución de ecuaciones lineales con una incógnita. Verificación de soluciones. Planteamiento y resolución de problemas.",
    descripcion_extendida: "Los estudiantes comprenden la ecuación como una igualdad que contiene una incógnita y trabajan el principio de equivalencia para resolver ecuaciones lineales. Se enfatiza el proceso de trasposición de términos con fundamento en las propiedades de igualdad. La actividad central es el planteamiento de ecuaciones a partir de problemas verbales de contexto cotidiano (mezclas, edades, distancias, finanzas personales), fomentando la modelización matemática como competencia de resolución de problemas.",
    meta_aprendizaje: "Plantea y resuelve ecuaciones lineales con una incógnita en situaciones problemáticas concretas, verificando la solución por sustitución.",
    categoria: "Álgebra y funciones",
    subcategoria: "Ecuaciones lineales",
    ejes_articuladores: ["Pensamiento crítico", "Vida saludable"],
    transversalidades: ["CNEYT-I", "CS-I"],
    tiempo_estimado_horas: 5,
  },
  {
    codigo: "PM-I-P06",
    numero: 6,
    titulo: "Sistemas de ecuaciones lineales con dos incógnitas",
    descripcion: "Sistema de ecuaciones 2×2. Métodos de resolución: sustitución, igualación y eliminación (reducción). Interpretación gráfica. Problemas contextualizados.",
    descripcion_extendida: "Los estudiantes resuelven sistemas de dos ecuaciones con dos incógnitas usando los tres métodos algebraicos y verifican la consistencia con la interpretación gráfica (dos rectas que se cortan, son paralelas o coincidentes). Se trabajan problemas de aplicación en contextos económicos, científicos y de la vida cotidiana para desarrollar la modelización con sistemas. Se discuten los casos especiales (sistema inconsistente y dependiente) y su interpretación geométrica, conectando álgebra y geometría analítica.",
    meta_aprendizaje: "Resuelve sistemas de dos ecuaciones lineales con dos incógnitas usando métodos algebraicos, interpreta la solución geométricamente y lo aplica en situaciones problema.",
    categoria: "Álgebra y funciones",
    subcategoria: "Sistemas de ecuaciones",
    ejes_articuladores: ["Pensamiento crítico"],
    transversalidades: ["CNEYT-I", "CD-I"],
    tiempo_estimado_horas: 5.5,
  },
  {
    codigo: "PM-I-P07",
    numero: 7,
    titulo: "Funciones: concepto, notación y representaciones",
    descripcion: "Concepto de función como relación entre dos conjuntos. Dominio y rango. Representaciones: tabla de valores, gráfica cartesiana, fórmula algebraica y descripción verbal.",
    descripcion_extendida: "Los estudiantes construyen el concepto de función a partir de relaciones de la vida real (temperatura-tiempo, distancia-tiempo, precio-cantidad) y aprenden a transitar entre las cuatro representaciones. Se trabaja la prueba de la recta vertical para verificar si una relación es función, y se introduce la notación f(x). El énfasis está en desarrollar la flexibilidad representacional como competencia matemática fundamental, evitando la reducción de la función a su fórmula algebraica.",
    meta_aprendizaje: "Identifica funciones en distintos contextos y transita entre sus cuatro representaciones (verbal, tabular, gráfica y algebraica) aplicando la notación funcional.",
    categoria: "Álgebra y funciones",
    subcategoria: "Concepto de función",
    ejes_articuladores: ["Pensamiento crítico", "Ciudadanía"],
    transversalidades: ["CNEYT-I", "CD-I"],
    tiempo_estimado_horas: 5,
  },
  {
    codigo: "PM-I-P08",
    numero: 8,
    titulo: "La función lineal y su interpretación",
    descripcion: "Función lineal f(x) = mx + b. Pendiente e intercepto: significado geométrico y en contexto. Graficar funciones lineales. Modelización de situaciones reales.",
    descripcion_extendida: "Los estudiantes profundizan en la función lineal comprendiendo la pendiente como razón de cambio y el intercepto como valor inicial. Se trabajan las formas canónica, punto-pendiente y pendiente-intercepto, y se modela con funciones lineales situaciones de variación constante (costos, velocidad uniforme, crecimiento lineal). La actividad de cierre implica construir y analizar modelos lineales con datos reales (temperatura, consumo energético, tasas), conectando con estadística y análisis de datos.",
    meta_aprendizaje: "Grafica y analiza funciones lineales interpretando la pendiente como razón de cambio y el intercepto como valor inicial en modelos de situaciones reales.",
    categoria: "Álgebra y funciones",
    subcategoria: "Función lineal",
    ejes_articuladores: ["Pensamiento crítico", "Ciudadanía"],
    transversalidades: ["CNEYT-I", "CD-I"],
    tiempo_estimado_horas: 5,
  },
  {
    codigo: "PM-I-P09",
    numero: 9,
    titulo: "Estadística descriptiva: organización y representación de datos",
    descripcion: "Recolección y organización de datos: tablas de frecuencia, histogramas, polígonos de frecuencia y diagramas de caja. Medidas de tendencia central: media, mediana y moda.",
    descripcion_extendida: "Los estudiantes recopilan datos de su entorno (calificaciones, tiempo de estudio, consumo de agua) y los organizan en tablas de frecuencia, construyendo manualmente y con herramientas digitales histogramas y diagramas de caja. Se calculan e interpretan media, mediana y moda reconociendo cuándo cada medida es más informativa. El énfasis está en la lectura crítica de gráficas estadísticas en medios de comunicación, identificando gráficas engañosas y desarrollando la literacidad estadística como competencia ciudadana.",
    meta_aprendizaje: "Organiza datos en tablas y gráficas estadísticas, calcula e interpreta medidas de tendencia central, y lee críticamente representaciones estadísticas en medios de comunicación.",
    categoria: "Estadística y probabilidad",
    subcategoria: "Estadística descriptiva",
    ejes_articuladores: ["Pensamiento crítico", "Ciudadanía"],
    transversalidades: ["CD-I", "CS-I", "CNEYT-I"],
    tiempo_estimado_horas: 5,
  },
  {
    codigo: "PM-I-P10",
    numero: 10,
    titulo: "Probabilidad: conceptos básicos y aplicaciones",
    descripcion: "Experimento aleatorio, espacio muestral y eventos. Probabilidad clásica y frecuentista. Regla de la adición. Eventos mutuamente excluyentes. Aplicaciones cotidianas.",
    descripcion_extendida: "Los estudiantes exploran el concepto de probabilidad a través de experimentos aleatorios concretos (lanzamiento de monedas, dados, cartas) y construcción del espacio muestral. Se trabajan la definición clásica (casos favorables/posibles) y frecuentista (mediante simulación), comparando los resultados y discutiendo la ley de los grandes números. Se aplica la regla de la adición para eventos mutuamente excluyentes y se conecta con situaciones de toma de decisiones bajo incertidumbre (riesgo en finanzas, salud y ciencia).",
    meta_aprendizaje: "Calcula probabilidades de eventos simples y compuestos usando la definición clásica y frecuentista, e interpreta el resultado en el contexto de la toma de decisiones bajo incertidumbre.",
    categoria: "Estadística y probabilidad",
    subcategoria: "Probabilidad básica",
    ejes_articuladores: ["Pensamiento crítico", "Vida saludable"],
    transversalidades: ["CD-I", "CS-I", "CNEYT-I"],
    tiempo_estimado_horas: 4.5,
  },
] as const;

// ── Runner ───────────────────────────────────────────────────────────────────

export async function seedPMI(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed PM-I (Pensamiento Matemático I)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac")
    .select("id")
    .eq("codigo", "PM-I")
    .single();

  if (uacErr || !uacRow) {
    throw new Error(`UAC PM-I no encontrada. Ejecuta primero seed-mccems.ts. Error: ${uacErr?.message}`);
  }

  const uac_id = uacRow.id;
  console.log(`  ✓ UAC PM-I encontrada (id: ${uac_id})`);

  const rows = PROGRESIONES_PMI.map((p) => ({
    codigo: p.codigo,
    uac_id,
    numero: p.numero,
    titulo: p.titulo,
    descripcion: p.descripcion,
    meta_aprendizaje: p.meta_aprendizaje,
    categoria: p.categoria,
    subcategoria: p.subcategoria,
    descripcion_extendida: p.descripcion_extendida,
    ejes_articuladores: p.ejes_articuladores as unknown as string[],
    transversalidades: p.transversalidades as unknown as string[],
    tiempo_estimado_horas: p.tiempo_estimado_horas,
    es_placeholder: true,
  }));

  const { error } = await sb
    .from("progresiones")
    .upsert(rows, { onConflict: "codigo" });

  if (error) throw new Error(`Error seeding progresiones PM-I: ${error.message}`);

  console.log(`  ✓ ${rows.length} progresiones de PM-I enriquecidas (es_placeholder=true)`);
  console.log("\n✅ Seed PM-I completado.\n");
}

if (
  process.env.NODE_ENV !== "test" &&
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  config({ path: resolve(process.cwd(), ".env.local") });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error("ERROR: Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
    process.exit(1);
  }

  const sb = createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  seedPMI(sb).catch((err) => {
    console.error("❌ Error en seed PM-I:", err.message);
    process.exit(1);
  });
}
