/**
 * Seed de propósitos formativos oficiales para PM-V (Pensamiento Matemático V — Cálculo Diferencial).
 * Fuente: docs/programas-oficiales/extraidos/05-PENSAMIENTO-MATEMATICO.md
 *         PDF: 2025_MCC_PENSAMIENTO MATEMATICO_BN.pdf — Modelo Educativo 2025
 *
 * Uso: npx tsx scripts/seed-pmv.ts
 * Idempotente: upsert por campo "codigo".
 */

import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

type SB = ReturnType<typeof createClient<Database>>;

const META = "Analice fenómenos donde el cambio es parte central de su descripción, utilizando los conceptos fundamentales del cálculo diferencial para modelar tasas de cambio en contextos científicos y cotidianos.";

const PROGRESIONES_PMV = [
  {
    codigo: "PM-V-P01",
    numero: 1,
    titulo: "Comprende el concepto de límite de una función y lo calcula en casos sencillos.",
    descripcion: "Comprende el concepto de límite de una función y lo calcula en casos sencillos.",
    descripcion_extendida: "Comprende el concepto de límite de una función y lo calcula en casos sencillos. Contenidos: intuición del límite: acercarse a un valor sin necesariamente alcanzarlo; notación: lim(x→a) f(x) = L; límites por sustitución directa; factorización para resolver indeterminaciones 0/0; racionalización en límites con radicales; límites laterales: lim(x→a⁺) y lim(x→a⁻); límites al infinito: comportamiento asintótico; formas indeterminadas: 0/0, ∞/∞, 0·∞; límites notables: lim(x→0) sen(x)/x = 1; interpretación gráfica del límite: la función puede o no alcanzar el valor límite; límites y continuidad: conexión intuitiva.",
    meta_aprendizaje: META,
    categoria: "Cálculo diferencial",
    subcategoria: "Límites: concepto, cálculo algebraico, límites laterales, límites al infinito",
    ejes_articuladores: ["Pensamiento matemático y científico"],
    transversalidades: ["CNEYT-V"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "PM-V-P02",
    numero: 2,
    titulo: "Analiza la continuidad de funciones y la distingue de la discontinuidad con ejemplos gráficos y algebraicos.",
    descripcion: "Analiza la continuidad de funciones y la distingue de la discontinuidad con ejemplos gráficos y algebraicos.",
    descripcion_extendida: "Analiza la continuidad de funciones y la distingue de la discontinuidad con ejemplos gráficos y algebraicos. Contenidos: definición formal de continuidad en un punto: f(a) existe, lim(x→a) f(x) existe, lim(x→a) f(x) = f(a); continuidad en un intervalo; tipos de discontinuidad: evitable (o removible), salto (discontinuidad de primera especie) y esencial (segunda especie); ejemplos clásicos: función escalón, valor absoluto, función de Heaviside; teorema del valor intermedio (TVI): si f es continua en [a,b] y N está entre f(a) y f(b), existe c en (a,b) con f(c) = N; aplicaciones del TVI: existencia de raíces, bisección; funciones continuas en física e ingeniería: temperatura, posición, corriente.",
    meta_aprendizaje: META,
    categoria: "Cálculo diferencial",
    subcategoria: "Continuidad: tipos de discontinuidad, teorema del valor intermedio",
    ejes_articuladores: ["Pensamiento matemático y científico"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "PM-V-P03",
    numero: 3,
    titulo: "Define la derivada como límite del cociente diferencial y la interpreta geométricamente como pendiente de la tangente.",
    descripcion: "Define la derivada como límite del cociente diferencial y la interpreta geométricamente como pendiente de la recta tangente.",
    descripcion_extendida: "Define la derivada como límite del cociente diferencial y la interpreta geométricamente como pendiente de la tangente. Contenidos: cociente de Newton: [f(x+h) - f(x)] / h; definición de la derivada: f'(x) = lim(h→0) [f(x+h) - f(x)] / h; notaciones: f'(x), dy/dx, Df(x); interpretación geométrica: la derivada en x=a es la pendiente de la recta tangente a la curva en ese punto; interpretación cinemática: la derivada de la posición es la velocidad; derivada como tasa de cambio instantánea; derivadas de funciones elementales por definición: constante, lineal, cuadrática; relación entre derivabilidad y continuidad; puntos donde la derivada no existe: esquinas, cúspides, discontinuidades.",
    meta_aprendizaje: META,
    categoria: "Cálculo diferencial",
    subcategoria: "Definición de derivada: cociente de Newton, interpretación geométrica y cinemática",
    ejes_articuladores: ["Pensamiento matemático y científico"],
    transversalidades: ["CNEYT-V"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "PM-V-P04",
    numero: 4,
    titulo: "Aplica las reglas básicas de derivación (potencia, producto, cociente, regla de la cadena).",
    descripcion: "Aplica las reglas básicas de derivación: regla de la potencia, producto, cociente y regla de la cadena.",
    descripcion_extendida: "Aplica las reglas básicas de derivación (potencia, producto, cociente, regla de la cadena). Contenidos: regla de la potencia: d/dx [xⁿ] = nxⁿ⁻¹; derivada de una constante: d/dx [c] = 0; regla del múltiplo escalar: d/dx [cf(x)] = c·f'(x); regla de la suma/diferencia: d/dx [f±g] = f'±g'; regla del producto: d/dx [f·g] = f'g + fg'; regla del cociente: d/dx [f/g] = (f'g - fg') / g²; regla de la cadena: d/dx [f(g(x))] = f'(g(x))·g'(x); derivadas de funciones compuestas; derivadas de orden superior: f'', f''', fⁿ; ejemplos aplicados: velocidad y aceleración, tasa de cambio de áreas y volúmenes.",
    meta_aprendizaje: META,
    categoria: "Cálculo diferencial",
    subcategoria: "Reglas de derivación: constante, potencia, suma, producto, cociente, cadena",
    ejes_articuladores: ["Pensamiento matemático y científico"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "PM-V-P05",
    numero: 5,
    titulo: "Calcula derivadas de funciones trigonométricas, exponenciales y logarítmicas.",
    descripcion: "Calcula derivadas de funciones trigonométricas, exponenciales y logarítmicas.",
    descripcion_extendida: "Calcula derivadas de funciones trigonométricas, exponenciales y logarítmicas. Contenidos: derivadas trigonométricas: d/dx[sen x] = cos x; d/dx[cos x] = -sen x; d/dx[tan x] = sec²x; derivadas de csc, sec, cot; función exponencial natural: d/dx[eˣ] = eˣ (propiedad única); derivada de exponencial base a: d/dx[aˣ] = aˣ ln a; logaritmo natural: d/dx[ln x] = 1/x; logaritmo base a: d/dx[log_a x] = 1/(x·ln a); derivadas de funciones compuestas que incluyen trig, exp y log (cadena); aplicaciones: crecimiento exponencial, decaimiento radioactivo, oscilaciones en física; el número e como base natural de los procesos de cambio continuo.",
    meta_aprendizaje: META,
    categoria: "Cálculo diferencial",
    subcategoria: "Derivadas de funciones trascendentes: sin, cos, tan, eˣ, ln",
    ejes_articuladores: ["Pensamiento matemático y científico"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "PM-V-P06",
    numero: 6,
    titulo: "Aplica la derivada para encontrar máximos, mínimos y puntos de inflexión (análisis de funciones).",
    descripcion: "Aplica la derivada para encontrar máximos, mínimos y puntos de inflexión en el análisis de funciones.",
    descripcion_extendida: "Aplica la derivada para encontrar máximos, mínimos y puntos de inflexión (análisis de funciones). Contenidos: función creciente y decreciente: f'(x) > 0 crece, f'(x) < 0 decrece; puntos críticos: donde f'(x) = 0 o f'(x) no existe; prueba de la primera derivada: cambio de signo de f' determina máximo/mínimo local; prueba de la segunda derivada: f''(a) < 0 → máximo local, f''(a) > 0 → mínimo local; puntos de inflexión: donde f'' cambia de signo; concavidad: f'' > 0 cóncava hacia arriba, f'' < 0 cóncava hacia abajo; asíntotas horizontales, verticales y oblicuas; esquema completo de análisis de función: dominio, interceptos, simetría, crecimiento/decrecimiento, extremos, concavidad, asíntotas; graficación con toda la información.",
    meta_aprendizaje: META,
    categoria: "Cálculo diferencial",
    subcategoria: "Análisis de funciones con derivada: crecimiento/decrecimiento, extremos, concavidad",
    ejes_articuladores: ["Pensamiento matemático y científico"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "PM-V-P07",
    numero: 7,
    titulo: "Resuelve problemas de optimización usando la derivada en contextos reales (ingeniería, economía, biología).",
    descripcion: "Resuelve problemas de optimización usando la derivada en contextos reales de ingeniería, economía y biología.",
    descripcion_extendida: "Resuelve problemas de optimización usando la derivada en contextos reales (ingeniería, economía, biología). Contenidos: metodología de optimización: identificar la función objetivo, las restricciones, el dominio; expresar la función objetivo en una sola variable usando las restricciones; encontrar el extremo usando derivada e interpretarlo en contexto; problemas clásicos: maximizar el área de un recinto con perímetro fijo; minimizar el material para fabricar una caja abierta; maximizar la ganancia (economía: ingreso marginal = costo marginal); minimizar el tiempo de recorrido (óptica: ley de Snell como problema de optimización); diseño óptimo en ingeniería civil y arquitectura; problemas de crecimiento y tasa máxima en biología; aplicaciones en diseño de empaques y logística.",
    meta_aprendizaje: META,
    categoria: "Cálculo diferencial",
    subcategoria: "Optimización: problemas aplicados con condición de extremo",
    ejes_articuladores: ["Pensamiento matemático y científico"],
    transversalidades: ["CNEYT-V"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "PM-V-P08",
    numero: 8,
    titulo: "Introduce la noción de diferencial y su uso en aproximaciones lineales.",
    descripcion: "Introduce la noción de diferencial y su uso en aproximaciones lineales de funciones.",
    descripcion_extendida: "Introduce la noción de diferencial y su uso en aproximaciones lineales. Contenidos: diferencial dy: si y = f(x), entonces dy = f'(x)dx; interpretación geométrica: el diferencial es el cambio en la tangente, no en la curva; diferencial vs. incremento: Δy ≈ dy para valores pequeños de Δx; linealización de una función: L(x) = f(a) + f'(a)(x-a); aproximación lineal: f(x) ≈ L(x) para x cercano a a; error de aproximación: |Δy - dy|; aplicaciones de la linealización: estimación de errores de medición, cálculos rápidos sin calculadora (√(4.02) ≈ 2.005, (1.01)^10 ≈ 1.105); propagación de errores en mediciones físicas; conexión con el diferencial en cálculo integral (antecedente del dx en la integral).",
    meta_aprendizaje: META,
    categoria: "Cálculo diferencial",
    subcategoria: "Diferencial y aproximaciones lineales",
    ejes_articuladores: ["Pensamiento matemático y científico"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
] as const;

export async function seedPMV(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed PM-V (propósitos oficiales 2025)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac").select("id").eq("codigo", "PM-V").single();

  if (uacErr || !uacRow) {
    throw new Error(`UAC PM-V no encontrada. Ejecuta primero seed-mccems.ts. Error: ${uacErr?.message}`);
  }

  const rows = PROGRESIONES_PMV.map((p) => ({
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
  if (error) throw new Error(`Error seeding PM-V: ${error.message}`);
  console.log(`  ✓ ${rows.length} propósitos formativos de PM-V (es_placeholder=false)`);
  console.log("\n✅ Seed PM-V completado: 8 propósitos oficiales insertados.\n");
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
  seedPMV(sb).catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
}
