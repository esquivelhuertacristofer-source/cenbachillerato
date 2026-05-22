/**
 * reauditoria-bachillerato.ts
 * Sesión 9 — Re-auditoría pedagógica post-robustecimiento.
 *
 * Consulta las ~621 actividades, aplica la rúbrica de 8 dimensiones (D1-D8, 5 pts c/u)
 * y genera docs/auditoria/AUDIT-POST-ROBUSTECIMIENTO-[fecha].md con:
 *   - Score global y comparación con baseline 27.9/40
 *   - Distribución por categoría (Crítica/Media/Aceptable/Sólida)
 *   - Análisis por UAC y por tipo de actividad
 *   - Top 10 actividades que aún necesitan atención
 *
 * Uso: npx tsx scripts/reauditoria-bachillerato.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { writeFile, mkdir } from "fs/promises";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

config({ path: resolve(process.cwd(), ".env.local") });

type SB = ReturnType<typeof createClient<Database>>;

// ── Constantes ────────────────────────────────────────────────────────────────

const BASELINE_SCORE = 27.9;
const MAX_SCORE = 40;
const BASELINE_DATE = "2026-05-20";

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface ActividadRow {
  id: string;
  codigo: string;
  tipo: string;
  contenido: Record<string, unknown>;
  nivel_revision: string | null;
  xp: number;
  estado: string;
}

interface ScoreDesglosado {
  d1_alineacion: number;
  d2_profundidad: number;
  d3_contextualizacion: number;
  d4_andamiaje: number;
  d5_densidad: number;
  d6_claridad: number;
  d7_originalidad: number;
  d8_activacion: number;
  total: number;
}

type Categoria = "CRÍTICA" | "MEDIA" | "ACEPTABLE" | "SÓLIDA";

function getCategoria(score: number): Categoria {
  if (score < 16) return "CRÍTICA";
  if (score < 24) return "MEDIA";
  if (score < 32) return "ACEPTABLE";
  return "SÓLIDA";
}

// ── Rúbrica ───────────────────────────────────────────────────────────────────

function countWords(text: string | undefined | null): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function hasMexicanRef(cont: Record<string, unknown>): boolean {
  const MEXICO_TERMS = [
    "méxico", "mexican", "unam", "inegi", "conacyt", "conabio", "inali",
    "semarnat", "cinvestav", "ipn", "tec de monterrey", "guadalajara",
    "mexic", "cdmx", "veracruz", "oaxaca", "michoacán", "jalisco",
  ];
  const hayCallouts = Array.isArray(cont.callouts) && (cont.callouts as unknown[]).length > 0;
  if (hayCallouts) {
    const calloutsStr = JSON.stringify(cont.callouts).toLowerCase();
    if (MEXICO_TERMS.some((t) => calloutsStr.includes(t))) return true;
  }
  const texto = (cont.texto as string) ?? (cont.prompt as string) ?? "";
  const textoLower = texto.toLowerCase();
  return MEXICO_TERMS.some((t) => textoLower.includes(t));
}

function scoreActividad(act: ActividadRow): ScoreDesglosado {
  const c = act.contenido;
  const tipo = act.tipo;
  const nivelRev = act.nivel_revision;

  // ── D1: Alineación curricular ─────────────────────────────────────────────
  let d1 = 3; // default: aceptable
  if (tipo === "lectura") {
    const words = countWords(c.texto as string);
    d1 = words >= 400 ? 5 : words >= 200 ? 4 : words >= 100 ? 3 : words >= 50 ? 2 : 1;
  } else if (tipo === "quiz_multiple_opcion") {
    const nq = Array.isArray(c.preguntas) ? (c.preguntas as unknown[]).length : 0;
    d1 = nq >= 6 ? 5 : nq >= 4 ? 4 : nq >= 2 ? 3 : 2;
  } else if (tipo === "quiz_verdadero_falso") {
    const nq = Array.isArray(c.preguntas) ? (c.preguntas as unknown[]).length : 0;
    d1 = nq >= 6 ? 5 : nq >= 4 ? 4 : nq >= 2 ? 3 : 2;
  } else if (tipo === "fill_blanks") {
    const nh = Array.isArray(c.huecos) ? (c.huecos as unknown[]).length : 0;
    d1 = nh >= 7 ? 5 : nh >= 5 ? 4 : nh >= 3 ? 3 : 2;
  } else if (tipo === "reflexion_escrita") {
    const words = countWords(c.prompt as string);
    d1 = words >= 50 ? 4 : words >= 20 ? 3 : 2;
  } else if (tipo === "debate_estructurado") {
    const nposturas = Array.isArray(c.posturas) ? (c.posturas as unknown[]).length : 0;
    d1 = nposturas >= 3 ? 5 : nposturas >= 2 ? 4 : 2;
  } else if (tipo === "glosario_interactivo") {
    const nt = Array.isArray(c.terminos) ? (c.terminos as unknown[]).length : 0;
    d1 = nt >= 8 ? 5 : nt >= 5 ? 4 : nt >= 3 ? 3 : 2;
  }

  // ── D2: Profundidad pedagógica (Bloom) ────────────────────────────────────
  const PROFUNDIDAD_POR_TIPO: Record<string, number> = {
    debate_estructurado: 5,
    reflexion_escrita: 4,
    ejercicio_matematico: 4,
    autoevaluacion: 4,
    simulacion: 5,
    fill_blanks: 3,
    lectura: 3,
    quiz_multiple_opcion: 3,
    glosario_interactivo: 2,
    quiz_verdadero_falso: 2,
    video_con_preguntas: 3,
    infografia: 2,
  };
  const d2 = PROFUNDIDAD_POR_TIPO[tipo] ?? 3;

  // ── D3: Contextualización mexicana ────────────────────────────────────────
  const d3 = hasMexicanRef(c) ? 5 : 1;

  // ── D4: Variedad de andamiaje ─────────────────────────────────────────────
  let d4 = 0;
  if (tipo === "reflexion_escrita") {
    if (Array.isArray(c.criterios_evaluacion) && (c.criterios_evaluacion as string[]).length >= 2) d4 += 2;
    if (Array.isArray(c.pistas) && (c.pistas as string[]).length >= 1) d4 += 2;
    if (c.ejemplo_respuesta) d4 += 1;
  } else if (tipo === "fill_blanks") {
    const huecos = (c.huecos as Array<Record<string, unknown>>) ?? [];
    const conPista = huecos.filter((h) => h.pista).length;
    const conAlts = huecos.filter((h) =>
      Array.isArray(h.alternativas_aceptadas) && (h.alternativas_aceptadas as string[]).length > 0
    ).length;
    if (c.instrucciones) d4 += 1;
    if (conPista > 0) d4 += 2;
    if (conAlts > 0) d4 += 2;
  } else if (tipo === "quiz_multiple_opcion" || tipo === "quiz_verdadero_falso") {
    const preguntas = (c.preguntas as Array<Record<string, unknown>>) ?? [];
    const conRetro = preguntas.filter((p) => p.retroalimentacion).length;
    d4 = conRetro >= preguntas.length * 0.8 ? 4 : conRetro > 0 ? 2 : 0;
    if (c.intentos_maximos) d4 = Math.min(5, d4 + 1);
  } else if (tipo === "debate_estructurado") {
    if (Array.isArray(c.reglas) && (c.reglas as string[]).length >= 3) d4 += 2;
    if (Array.isArray(c.criterios_evaluacion) && (c.criterios_evaluacion as string[]).length >= 2) d4 += 2;
    if (c.tiempo_argumentacion_minutos) d4 += 1;
  } else if (tipo === "lectura") {
    const callouts = Array.isArray(c.callouts) ? (c.callouts as unknown[]).length : 0;
    const preguntas = Array.isArray(c.preguntas_comprension)
      ? (c.preguntas_comprension as unknown[]).length : 0;
    d4 = Math.min(5, callouts * 2 + (preguntas >= 2 ? 2 : 0) + (c.nivel_lectura ? 1 : 0));
  } else {
    d4 = 3;
  }
  d4 = Math.min(5, Math.max(0, d4));

  // ── D5: Densidad de contenido ─────────────────────────────────────────────
  let d5 = 3;
  if (tipo === "lectura") {
    const words = countWords(c.texto as string);
    d5 = words >= 600 ? 5 : words >= 400 ? 4 : words >= 200 ? 3 : words >= 100 ? 2 : 1;
  } else if (tipo === "quiz_multiple_opcion") {
    const nq = Array.isArray(c.preguntas) ? (c.preguntas as unknown[]).length : 0;
    d5 = nq >= 8 ? 5 : nq >= 6 ? 4 : nq >= 4 ? 3 : nq >= 2 ? 2 : 1;
  } else if (tipo === "quiz_verdadero_falso") {
    const nq = Array.isArray(c.preguntas) ? (c.preguntas as unknown[]).length : 0;
    d5 = nq >= 8 ? 5 : nq >= 6 ? 4 : nq >= 4 ? 3 : nq >= 2 ? 2 : 1;
  } else if (tipo === "fill_blanks") {
    const nh = Array.isArray(c.huecos) ? (c.huecos as unknown[]).length : 0;
    d5 = nh >= 8 ? 5 : nh >= 6 ? 4 : nh >= 4 ? 3 : 2;
  } else if (tipo === "glosario_interactivo") {
    const nt = Array.isArray(c.terminos) ? (c.terminos as unknown[]).length : 0;
    d5 = nt >= 10 ? 5 : nt >= 7 ? 4 : nt >= 5 ? 3 : 2;
  } else if (tipo === "reflexion_escrita") {
    const minWords = (c.longitud_minima_palabras as number) ?? 0;
    d5 = minWords >= 150 ? 5 : minWords >= 100 ? 4 : minWords >= 60 ? 3 : 2;
  }

  // ── D6: Claridad lingüística ──────────────────────────────────────────────
  let d6 = 4; // default: clara
  if (tipo === "reflexion_escrita") {
    const words = countWords(c.prompt as string);
    d6 = words >= 30 ? 4 : words >= 15 ? 3 : 2;
  } else if (tipo === "lectura") {
    const words = countWords(c.texto as string);
    d6 = words < 50 ? 2 : 4;
  }

  // ── D7: Originalidad ─────────────────────────────────────────────────────
  let d7 = 3;
  if (nivelRev === "validada_pedagogicamente") d7 = 5;
  else if (nivelRev === "robustecida") d7 = 4;
  else d7 = 2;

  // ── D8: Activación cognitiva ──────────────────────────────────────────────
  const ACTIVACION_POR_TIPO: Record<string, number> = {
    debate_estructurado: 5,
    simulacion: 5,
    ejercicio_matematico: 4,
    autoevaluacion: 4,
    reflexion_escrita: 4,
    fill_blanks: 3,
    lectura: 3,
    quiz_multiple_opcion: 3,
    video_con_preguntas: 3,
    glosario_interactivo: 3,
    infografia: 2,
    quiz_verdadero_falso: 2,
  };
  const d8 = ACTIVACION_POR_TIPO[tipo] ?? 3;

  const total = d1 + d2 + d3 + d4 + d5 + d6 + d7 + d8;

  return { d1_alineacion: d1, d2_profundidad: d2, d3_contextualizacion: d3, d4_andamiaje: d4, d5_densidad: d5, d6_claridad: d6, d7_originalidad: d7, d8_activacion: d8, total };
}

// ── Generador de reporte Markdown ─────────────────────────────────────────────

function generarReporte(
  actividades: ActividadRow[],
  scores: Map<string, ScoreDesglosado>,
  fecha: string
): string {
  const allScores = [...scores.values()];
  const avgTotal = allScores.reduce((s, x) => s + x.total, 0) / allScores.length;

  const dist = {
    CRÍTICA: allScores.filter((s) => getCategoria(s.total) === "CRÍTICA").length,
    MEDIA: allScores.filter((s) => getCategoria(s.total) === "MEDIA").length,
    ACEPTABLE: allScores.filter((s) => getCategoria(s.total) === "ACEPTABLE").length,
    SÓLIDA: allScores.filter((s) => getCategoria(s.total) === "SÓLIDA").length,
  };

  const mejora = avgTotal - BASELINE_SCORE;
  const mejoraPct = ((avgTotal - BASELINE_SCORE) / BASELINE_SCORE * 100).toFixed(1);
  const pctTotal = ((avgTotal / MAX_SCORE) * 100).toFixed(1);
  const baselinePct = ((BASELINE_SCORE / MAX_SCORE) * 100).toFixed(1);

  // Por tipo
  const tipoGroups: Record<string, number[]> = {};
  actividades.forEach((a) => {
    if (!tipoGroups[a.tipo]) tipoGroups[a.tipo] = [];
    const s = scores.get(a.id);
    if (s) tipoGroups[a.tipo].push(s.total);
  });

  const tipoRows = Object.entries(tipoGroups)
    .map(([tipo, ss]) => ({
      tipo,
      count: ss.length,
      avg: ss.reduce((a, b) => a + b, 0) / ss.length,
    }))
    .sort((a, b) => b.avg - a.avg);

  // Por UAC (prefix)
  const uacGroups: Record<string, number[]> = {};
  actividades.forEach((a) => {
    const prefix = a.codigo.split("-").slice(0, 2).join("-"); // e.g. 'LC-I'
    if (!uacGroups[prefix]) uacGroups[prefix] = [];
    const s = scores.get(a.id);
    if (s) uacGroups[prefix].push(s.total);
  });

  const uacRows = Object.entries(uacGroups)
    .map(([uac, ss]) => ({
      uac,
      count: ss.length,
      avg: ss.reduce((a, b) => a + b, 0) / ss.length,
    }))
    .sort((a, b) => a.avg - b.avg); // ascending: worst first

  // Top 10 peores
  const worst10 = actividades
    .map((a) => ({ codigo: a.codigo, tipo: a.tipo, score: scores.get(a.id)?.total ?? 0, nivelRev: a.nivel_revision }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 10);

  // Promedios por dimensión
  const avgD: Record<string, string> = {};
  const dims = ["d1_alineacion", "d2_profundidad", "d3_contextualizacion", "d4_andamiaje", "d5_densidad", "d6_claridad", "d7_originalidad", "d8_activacion"] as const;
  dims.forEach((d) => {
    const avg = allScores.reduce((s, x) => s + x[d], 0) / allScores.length;
    avgD[d] = avg.toFixed(2);
  });

  const lines: string[] = [];
  lines.push(`# Auditoría Pedagógica Post-Robustecimiento — CEN Bachillerato`);
  lines.push(`**Fecha:** ${fecha} | **Baseline:** ${BASELINE_DATE}`);
  lines.push(``);
  lines.push(`---`);
  lines.push(``);
  lines.push(`## Resumen ejecutivo`);
  lines.push(``);
  lines.push(`| Métrica | Baseline | Post-Robustecer | Δ |`);
  lines.push(`|---|---|---|---|`);
  lines.push(`| Score global /40 | ${BASELINE_SCORE.toFixed(1)} | **${avgTotal.toFixed(2)}** | ${mejora >= 0 ? "+" : ""}${mejora.toFixed(2)} |`);
  lines.push(`| Porcentaje | ${baselinePct}% | **${pctTotal}%** | ${mejora >= 0 ? "+" : ""}${mejoraPct}% |`);
  lines.push(`| Total actividades | — | ${allScores.length} | — |`);
  lines.push(``);
  lines.push(`## Distribución por categoría`);
  lines.push(``);
  lines.push(`| Categoría | Rango | N | % |`);
  lines.push(`|---|---|---|---|`);
  lines.push(`| 🔴 CRÍTICA | 0–15 | ${dist.CRÍTICA} | ${(dist.CRÍTICA / allScores.length * 100).toFixed(1)}% |`);
  lines.push(`| 🟡 MEDIA | 16–23 | ${dist.MEDIA} | ${(dist.MEDIA / allScores.length * 100).toFixed(1)}% |`);
  lines.push(`| 🟢 ACEPTABLE | 24–31 | ${dist.ACEPTABLE} | ${(dist.ACEPTABLE / allScores.length * 100).toFixed(1)}% |`);
  lines.push(`| 🏆 SÓLIDA | 32–40 | ${dist.SÓLIDA} | ${(dist.SÓLIDA / allScores.length * 100).toFixed(1)}% |`);
  lines.push(``);
  lines.push(`## Promedio por dimensión (sobre 5)`);
  lines.push(``);
  lines.push(`| Dimensión | Score /5 | Semáforo |`);
  lines.push(`|---|---|---|`);
  const DIM_LABELS: Record<string, string> = {
    d1_alineacion: "D1 Alineación curricular",
    d2_profundidad: "D2 Profundidad pedagógica",
    d3_contextualizacion: "D3 Contextualización mexicana",
    d4_andamiaje: "D4 Variedad de andamiaje",
    d5_densidad: "D5 Densidad de contenido",
    d6_claridad: "D6 Claridad lingüística",
    d7_originalidad: "D7 Originalidad",
    d8_activacion: "D8 Activación cognitiva",
  };
  dims.forEach((d) => {
    const v = parseFloat(avgD[d]);
    const sem = v >= 4 ? "🟢" : v >= 3 ? "🟡" : "🔴";
    lines.push(`| ${DIM_LABELS[d]} | ${v.toFixed(2)} | ${sem} |`);
  });
  lines.push(``);
  lines.push(`## Score promedio por tipo de actividad`);
  lines.push(``);
  lines.push(`| Tipo | N | Score Prom /40 |`);
  lines.push(`|---|---|---|`);
  tipoRows.forEach((r) => {
    lines.push(`| ${r.tipo} | ${r.count} | ${r.avg.toFixed(2)} |`);
  });
  lines.push(``);
  lines.push(`## UACs con menor score promedio (Top 10 prioritarias)`);
  lines.push(``);
  lines.push(`| UAC | N | Score Prom /40 | Categoría |`);
  lines.push(`|---|---|---|---|`);
  uacRows.slice(0, 10).forEach((r) => {
    const cat = getCategoria(r.avg);
    const em = { CRÍTICA: "🔴", MEDIA: "🟡", ACEPTABLE: "🟢", SÓLIDA: "🏆" }[cat];
    lines.push(`| ${r.uac} | ${r.count} | ${r.avg.toFixed(2)} | ${em} ${cat} |`);
  });
  lines.push(``);
  lines.push(`## Actividades que requieren atención urgente (10 peores)`);
  lines.push(``);
  lines.push(`| Código | Tipo | Score /40 | nivel_revision |`);
  lines.push(`|---|---|---|---|`);
  worst10.forEach((a) => {
    lines.push(`| ${a.codigo} | ${a.tipo} | ${a.score} | ${a.nivelRev ?? "—"} |`);
  });
  lines.push(``);
  lines.push(`## Nivel de revisión`);
  lines.push(``);
  const byNivel = { borrador: 0, robustecida: 0, validada_pedagogicamente: 0 };
  actividades.forEach((a) => {
    const k = (a.nivel_revision ?? "borrador") as keyof typeof byNivel;
    if (k in byNivel) byNivel[k]++;
  });
  lines.push(`| nivel_revision | N | % |`);
  lines.push(`|---|---|---|`);
  lines.push(`| borrador | ${byNivel.borrador} | ${(byNivel.borrador / actividades.length * 100).toFixed(1)}% |`);
  lines.push(`| robustecida | ${byNivel.robustecida} | ${(byNivel.robustecida / actividades.length * 100).toFixed(1)}% |`);
  lines.push(`| validada_pedagogicamente | ${byNivel.validada_pedagogicamente} | ${(byNivel.validada_pedagogicamente / actividades.length * 100).toFixed(1)}% |`);
  lines.push(``);
  lines.push(`---`);
  lines.push(`*Generado automáticamente por scripts/reauditoria-bachillerato.ts el ${fecha}.*`);
  lines.push(`*Rúbrica: 8 dimensiones × 5 pts = 40 pts máx. Baseline: ${BASELINE_SCORE}/40 (${BASELINE_DATE}).*`);

  return lines.join("\n");
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const sb = createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const fecha = new Date().toISOString().slice(0, 10);

  console.log(`\n📊 CEN Bachillerato — Sesión 9: Re-auditoría pedagógica (${fecha})\n`);
  console.log("Consultando actividades...");

  // Fetch in batches to avoid response size issues
  const pageSize = 250;
  let allActividades: ActividadRow[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await sb
      .from("actividades")
      .select("id, codigo, tipo, contenido, nivel_revision, xp, estado")
      .eq("estado", "publicada")
      .range(from, from + pageSize - 1)
      .order("codigo");

    if (error) {
      console.error("Error consultando actividades:", error.message);
      process.exit(1);
    }

    if (!data || data.length === 0) break;
    allActividades = [...allActividades, ...(data as unknown as ActividadRow[])];
    if (data.length < pageSize) break;
    from += pageSize;
  }

  console.log(`Total actividades: ${allActividades.length}`);
  console.log("Calculando scores...\n");

  const scores = new Map<string, ScoreDesglosado>();
  let scored = 0;

  for (const act of allActividades) {
    const s = scoreActividad(act);
    scores.set(act.id, s);
    scored++;
    if (scored % 100 === 0) console.log(`  ...${scored}/${allActividades.length}`);
  }

  console.log(`\n✅ Scoring completado para ${scored} actividades.`);

  const avgTotal = [...scores.values()].reduce((s, x) => s + x.total, 0) / scores.size;
  const mejora = avgTotal - BASELINE_SCORE;
  console.log(`\nScore global: ${avgTotal.toFixed(2)}/40 (${mejora >= 0 ? "+" : ""}${mejora.toFixed(2)} vs baseline)`);

  // Generate report
  const reporte = generarReporte(allActividades, scores, fecha);

  const outputDir = resolve(process.cwd(), "docs", "auditoria");
  const outputPath = resolve(outputDir, `AUDIT-POST-ROBUSTECIMIENTO-${fecha}.md`);

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, reporte, "utf-8");

  console.log(`\n📝 Reporte escrito en: ${outputPath}`);
  console.log(`${"=".repeat(60)}`);
  console.log(`Baseline: ${BASELINE_SCORE}/40 (${BASELINE_DATE})`);
  console.log(`Post:     ${avgTotal.toFixed(2)}/40 (${fecha})`);
  console.log(`Mejora:   ${mejora >= 0 ? "+" : ""}${mejora.toFixed(2)} pts`);
  console.log(`${"=".repeat(60)}\n`);
}

if (
  process.env.NODE_ENV !== "test" &&
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
