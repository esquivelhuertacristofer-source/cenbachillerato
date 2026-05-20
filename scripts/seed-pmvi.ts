/**
 * Seed de propósitos formativos oficiales para PM-VI (Pensamiento Matemático VI).
 * Fuente: docs/programas-oficiales/extraidos/05-PENSAMIENTO-MATEMATICO.md
 *         Modelo Curricular MCCEMS 2025 — Semestre 6
 *
 * Cierre de la familia PM (Semestres 1-6). PM-VI cubre Estadística y Probabilidad
 * (NO cálculo integral). La secuencia completa: aritmética → álgebra → geometría →
 * trigonometría → cálculo diferencial → estadística/probabilidad.
 *
 * Uso: npx tsx scripts/seed-pmvi.ts
 * Idempotente: upsert por campo "codigo".
 */

import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

type SB = ReturnType<typeof createClient<Database>>;

const META = "Aplique procedimientos estadísticos y probabilísticos para recopilar, organizar, analizar e interpretar datos, y tome decisiones informadas en situaciones que involucran incertidumbre.";

export const PROGRESIONES_PMVI = [
  {
    codigo: "PM-VI-P01",
    numero: 1,
    titulo: "Distingue estadística descriptiva e inferencial y reconoce su papel en la toma de decisiones basada en datos.",
    descripcion: "Distingue estadística descriptiva e inferencial y reconoce su papel en la toma de decisiones basada en datos.",
    descripcion_extendida: "Distingue estadística descriptiva e inferencial y reconoce su papel en la toma de decisiones basada en datos. Contenidos: estadística: concepto, historia y campos de aplicación; estadística descriptiva: organización, resumen y presentación de datos; estadística inferencial: generalización de muestras a poblaciones; tipos de variables: cualitativas (nominales, ordinales) y cuantitativas (discretas, continuas); población vs. muestra: conceptos y diferencias; usos de la estadística en la vida cotidiana: salud pública, economía, medios de comunicación, política; estadística en México: INEGI, CONEVAL, CONAPO como fuentes de datos; ética en el manejo de datos: privacidad y representatividad.",
    meta_aprendizaje: META,
    categoria: "Estadística descriptiva e inferencial",
    subcategoria: "Estadística descriptiva: tipos de variables, tablas de frecuencia",
    ejes_articuladores: ["Pensamiento crítico", "Ciudadanía democrática"],
    transversalidades: ["CD-II", "CS-III"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "PM-VI-P02",
    numero: 2,
    titulo: "Organiza y representa conjuntos de datos en tablas de frecuencia, histogramas, polígonos de frecuencia y ojivas.",
    descripcion: "Organiza y representa conjuntos de datos en tablas de frecuencia, histogramas, polígonos de frecuencia y ojivas.",
    descripcion_extendida: "Organiza y representa conjuntos de datos en tablas de frecuencia, histogramas, polígonos de frecuencia y ojivas. Contenidos: tablas de frecuencia: absoluta, relativa, acumulada; intervalos de clase: amplitud, límites, marcas de clase; histograma: construcción, interpretación, distribución de frecuencias; polígono de frecuencias: unión de marcas de clase; ojiva (gráfica acumulada): construcción e interpretación, percentiles; otros gráficos: gráfica de pastel, barras, líneas, diagrama de caja y bigotes; selección del gráfico apropiado según el tipo de datos; herramientas digitales: Excel, hojas de cálculo de Google, GeoGebra para graficación estadística.",
    meta_aprendizaje: META,
    categoria: "Representación estadística",
    subcategoria: "Representaciones gráficas: histograma, polígono de frecuencias, ojiva, diagrama de caja",
    ejes_articuladores: ["Pensamiento crítico"],
    transversalidades: ["CD-II"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "PM-VI-P03",
    numero: 3,
    titulo: "Calcula e interpreta medidas de tendencia central (media, mediana, moda) en contextos reales.",
    descripcion: "Calcula e interpreta medidas de tendencia central (media, mediana, moda) en contextos reales.",
    descripcion_extendida: "Calcula e interpreta medidas de tendencia central (media, mediana, moda) en contextos reales. Contenidos: media aritmética: cálculo para datos no agrupados y agrupados, propiedades; mediana: cálculo para datos no agrupados y agrupados, interpolación; moda: unimodal, bimodal, multimodal, amodal; comparación de medidas: cuándo usar cada una y por qué; efecto de valores atípicos (outliers) sobre la media; media ponderada: promedio escolar, índices económicos; media geométrica y armónica: cuándo y para qué; interpretación contextual: salario promedio vs. salario mediano en México; aplicaciones en economía, salud y educación.",
    meta_aprendizaje: META,
    categoria: "Medidas de tendencia central",
    subcategoria: "Medidas de tendencia central: media aritmética, mediana, moda",
    ejes_articuladores: ["Pensamiento crítico", "Ciudadanía democrática"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "PM-VI-P04",
    numero: 4,
    titulo: "Calcula e interpreta medidas de dispersión (rango, varianza, desviación estándar) y las vincula con la confiabilidad de los datos.",
    descripcion: "Calcula e interpreta medidas de dispersión (rango, varianza, desviación estándar) y las vincula con la confiabilidad de los datos.",
    descripcion_extendida: "Calcula e interpreta medidas de dispersión (rango, varianza, desviación estándar) y las vincula con la confiabilidad de los datos. Contenidos: rango o recorrido: cálculo e interpretación; varianza: definición, cálculo para datos no agrupados y agrupados, interpretación; desviación estándar: definición, relación con varianza, interpretación; coeficiente de variación: comparación de dispersión entre conjuntos con distintas escalas; percentiles y cuartiles: Q1, Q2, Q3, rango intercuartílico; diagrama de caja y bigotes: construcción e interpretación; valores atípicos: identificación y tratamiento; distribución normal: curva de campana, regla empírica 68-95-99.7; aplicaciones: control de calidad, pruebas estandarizadas, clima.",
    meta_aprendizaje: META,
    categoria: "Medidas de dispersión",
    subcategoria: "Medidas de dispersión: rango, varianza, desviación estándar, coeficiente de variación",
    ejes_articuladores: ["Pensamiento crítico"],
    transversalidades: ["PM-VI-P03"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "PM-VI-P05",
    numero: 5,
    titulo: "Comprende y aplica el concepto de probabilidad clásica, frecuentista y subjetiva.",
    descripcion: "Comprende y aplica el concepto de probabilidad clásica, frecuentista y subjetiva.",
    descripcion_extendida: "Comprende y aplica el concepto de probabilidad clásica, frecuentista y subjetiva. Contenidos: experimento aleatorio, espacio muestral y evento; probabilidad clásica (de Laplace): definición, condición de equiprobabilidad, ejemplos; probabilidad frecuentista: ley de los grandes números, frecuencia relativa; probabilidad subjetiva: grados de creencia, usos en toma de decisiones; axiomas de Kolmogorov: no negatividad, normalización, aditividad; complemento de un evento: P(A') = 1 - P(A); probabilidad de la unión e intersección de eventos; regla de la suma: eventos mutuamente excluyentes y no excluyentes; experimentos con monedas, dados, cartas y urnas.",
    meta_aprendizaje: META,
    categoria: "Probabilidad",
    subcategoria: "Probabilidad: espacio muestral, eventos, axiomas de Kolmogorov",
    ejes_articuladores: ["Pensamiento crítico"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "PM-VI-P06",
    numero: 6,
    titulo: "Calcula probabilidades de eventos simples, compuestos, condicionales e independientes.",
    descripcion: "Calcula probabilidades de eventos simples, compuestos, condicionales e independientes.",
    descripcion_extendida: "Calcula probabilidades de eventos simples, compuestos, condicionales e independientes. Contenidos: eventos simples y compuestos: definición y diferencia; eventos independientes: P(A∩B) = P(A)·P(B); eventos dependientes: cálculo con probabilidad condicional; probabilidad condicional: P(A|B) = P(A∩B)/P(B); regla del producto: P(A∩B) = P(A)·P(B|A); teorema de Bayes básico: actualización de probabilidades con nueva información; árbol de probabilidad: diagrama para problemas condicionales; permutaciones y combinaciones: conteo para probabilidades; aplicaciones: pruebas diagnósticas, sensibilidad y especificidad, epidemiología.",
    meta_aprendizaje: META,
    categoria: "Probabilidad condicional e independencia",
    subcategoria: "Regla de la suma, regla del producto, probabilidad condicional (Bayes básico)",
    ejes_articuladores: ["Pensamiento crítico"],
    transversalidades: ["PM-VI-P05"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "PM-VI-P07",
    numero: 7,
    titulo: "Aplica técnicas de muestreo para planear y ejecutar una encuesta o estudio estadístico en su comunidad.",
    descripcion: "Aplica técnicas de muestreo para planear y ejecutar una encuesta o estudio estadístico en su comunidad.",
    descripcion_extendida: "Aplica técnicas de muestreo para planear y ejecutar una encuesta o estudio estadístico en su comunidad. Contenidos: muestreo: definición, ventajas sobre censo total, errores de muestreo; muestreo aleatorio simple: procedimiento, tabla de números aleatorios; muestreo sistemático: selección cada k elementos; muestreo estratificado: división en estratos homogéneos; muestreo por conglomerados: agrupamiento en clusters; tamaño de muestra: factores que lo determinan, fórmulas básicas; sesgo de selección: muestreo de conveniencia, sesgo del voluntariado; diseño de cuestionario: preguntas abiertas vs. cerradas, escala Likert; recolección y limpieza de datos: proceso y errores comunes; presentación de resultados con medidas estadísticas.",
    meta_aprendizaje: META,
    categoria: "Muestreo y diseño de estudios",
    subcategoria: "Muestreo: aleatorio simple, sistemático, estratificado, por conglomerados",
    ejes_articuladores: ["Pensamiento crítico", "Ciudadanía democrática"],
    transversalidades: ["CD-II", "CS-III"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "PM-VI-P08",
    numero: 8,
    titulo: "Interpreta resultados estadísticos presentados en medios de comunicación con sentido crítico.",
    descripcion: "Interpreta resultados estadísticos presentados en medios de comunicación con sentido crítico.",
    descripcion_extendida: "Interpreta resultados estadísticos presentados en medios de comunicación con sentido crítico. Contenidos: lectura crítica de gráficas: gráficas engañosas, escalas truncadas, ejes manipulados; interpretación de porcentajes en noticias: porcentaje del total vs. porcentaje de cambio; correlación vs. causalidad: error frecuente en informes mediáticos; sesgo en encuestas publicadas: preguntas tendenciosas, muestra conveniente; margen de error e intervalo de confianza: interpretación básica; uso político y mediático de la estadística: elecciones, encuestas de opinión; alfabetización estadística como herramienta ciudadana; análisis de casos reales: noticias de salud, economía y elecciones en México.",
    meta_aprendizaje: META,
    categoria: "Lectura crítica estadística",
    subcategoria: "Lectura crítica de datos estadísticos en medios y contextos sociales",
    ejes_articuladores: ["Pensamiento crítico", "Ciudadanía democrática"],
    transversalidades: ["LC-III", "CD-III"],
    tiempo_estimado_horas: 3,
  },
] as const;

export async function seedPMVI(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed PM-VI (propósitos oficiales 2025)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac").select("id").eq("codigo", "PM-VI").single();

  if (uacErr || !uacRow) {
    throw new Error(`UAC PM-VI no encontrada. Ejecuta primero seed-mccems.ts. Error: ${uacErr?.message}`);
  }

  const rows = PROGRESIONES_PMVI.map((p) => ({
    codigo: p.codigo,
    uac_id: uacRow.id,
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
    es_placeholder: false,
  }));

  const { error } = await sb.from("progresiones").upsert(rows, { onConflict: "codigo" });
  if (error) throw new Error(`Error seeding PM-VI: ${error.message}`);
  console.log(`  ✓ ${rows.length} propósitos formativos de PM-VI (es_placeholder=false)`);
  console.log("\n✅ Seed PM-VI completado: 8 propósitos oficiales insertados.\n");
}

if (
  process.env.NODE_ENV !== "test" &&
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  config({ path: resolve(process.cwd(), ".env.local") });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) { console.error("Faltan variables de entorno"); process.exit(1); }
  const sb = createClient<Database>(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  seedPMVI(sb).catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
}
