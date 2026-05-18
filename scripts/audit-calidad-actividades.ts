/**
 * FASE 3 + 5 + 6 — Auditoría de calidad pedagógica, duplicados y progresión.
 * Ejecutar: npx tsx scripts/audit-calidad-actividades.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";
import * as fs from "fs";

config({ path: resolve(process.cwd(), ".env.local") });

const sb = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const lines: string[] = [];
function log(msg: string) { console.log(msg); lines.push(msg); }

// Tipos válidos para cada posición de la secuencia pedagógica
const TIPOS_A1 = ["lectura", "video_con_preguntas", "infografia", "glosario_interactivo"];
const TIPOS_A2 = ["quiz_multiple_opcion", "quiz_verdadero_falso", "fill_blanks", "ejercicio_matematico", "simulacion"];
const TIPOS_A3 = ["reflexion_escrita", "debate_estructurado", "autoevaluacion"];

interface ActividadDB {
  id: string;
  codigo: string;
  titulo: string;
  tipo: string;
  contenido: Record<string, unknown>;
  progresion_id: string;
}

interface ProgresionConActs {
  id: string;
  codigo: string;
  numero: number;
  uacCodigo: string;
  actividades: ActividadDB[];
}

// ── Heurísticas de calidad ─────────────────────────────────────────────────

interface IssueCalidad {
  codigo: string;
  tipo: string;
  problema: string;
  severidad: "alta" | "media" | "baja";
}

function auditarLectura(a: ActividadDB): IssueCalidad[] {
  const issues: IssueCalidad[] = [];
  const c = a.contenido as { texto?: string; preguntas_comprension?: unknown[]; nivel_lectura?: string };
  const texto = c.texto ?? "";
  const palabras = texto.split(/\s+/).filter(Boolean).length;

  if (palabras < 200) {
    issues.push({ codigo: a.codigo, tipo: a.tipo, problema: `Texto corto: ${palabras} palabras (mínimo recomendado: 200)`, severidad: palabras < 100 ? "alta" : "media" });
  }
  const preguntas = Array.isArray(c.preguntas_comprension) ? c.preguntas_comprension : [];
  if (preguntas.length < 3) {
    issues.push({ codigo: a.codigo, tipo: a.tipo, problema: `Solo ${preguntas.length} preguntas de comprensión (mínimo recomendado: 3)`, severidad: preguntas.length === 0 ? "alta" : "baja" });
  }
  const preguntasSinGuia = preguntas.filter((p: unknown) => {
    const pobj = p as { respuesta_guia?: string };
    return !pobj.respuesta_guia || pobj.respuesta_guia.length < 5;
  });
  if (preguntasSinGuia.length > 0) {
    issues.push({ codigo: a.codigo, tipo: a.tipo, problema: `${preguntasSinGuia.length} preguntas sin respuesta_guia`, severidad: "media" });
  }
  return issues;
}

function auditarQuiz(a: ActividadDB): IssueCalidad[] {
  const issues: IssueCalidad[] = [];
  const c = a.contenido as { preguntas?: unknown[] };
  const preguntas = Array.isArray(c.preguntas) ? c.preguntas : [];

  if (preguntas.length < 5) {
    issues.push({ codigo: a.codigo, tipo: a.tipo, problema: `Solo ${preguntas.length} preguntas (mínimo recomendado: 5)`, severidad: preguntas.length < 3 ? "alta" : "media" });
  }

  let sinRetro = 0;
  let opcionesIncorrectas = 0;
  let indiceInvalido = 0;

  for (const p of preguntas) {
    const pobj = p as { opciones?: string[]; respuesta_correcta?: number; retroalimentacion?: string };
    const opciones = pobj.opciones ?? [];
    if (opciones.length !== 4) opcionesIncorrectas++;
    const ri = pobj.respuesta_correcta ?? -1;
    if (ri < 0 || ri >= opciones.length) indiceInvalido++;
    if (!pobj.retroalimentacion || pobj.retroalimentacion.length < 10) sinRetro++;
  }

  if (opcionesIncorrectas > 0) {
    issues.push({ codigo: a.codigo, tipo: a.tipo, problema: `${opcionesIncorrectas} preguntas con ≠4 opciones`, severidad: "media" });
  }
  if (indiceInvalido > 0) {
    issues.push({ codigo: a.codigo, tipo: a.tipo, problema: `${indiceInvalido} preguntas con respuesta_correcta fuera de rango`, severidad: "alta" });
  }
  if (sinRetro > 0) {
    issues.push({ codigo: a.codigo, tipo: a.tipo, problema: `${sinRetro} preguntas sin retroalimentación`, severidad: "baja" });
  }
  return issues;
}

function auditarReflexion(a: ActividadDB): IssueCalidad[] {
  const issues: IssueCalidad[] = [];
  const c = a.contenido as { prompt?: string; pistas?: string[]; criterios_evaluacion?: string[]; longitud_minima_palabras?: number };

  const prompt = c.prompt ?? "";
  const palabrasPrompt = prompt.split(/\s+/).filter(Boolean).length;
  if (palabrasPrompt < 30) {
    issues.push({ codigo: a.codigo, tipo: a.tipo, problema: `Prompt genérico/corto: ${palabrasPrompt} palabras`, severidad: palabrasPrompt < 15 ? "alta" : "media" });
  }
  const pistas = Array.isArray(c.pistas) ? c.pistas : [];
  if (pistas.length < 3) {
    issues.push({ codigo: a.codigo, tipo: a.tipo, problema: `Solo ${pistas.length} pistas (mínimo recomendado: 3)`, severidad: pistas.length === 0 ? "alta" : "baja" });
  }
  const criterios = Array.isArray(c.criterios_evaluacion) ? c.criterios_evaluacion : [];
  if (criterios.length < 3) {
    issues.push({ codigo: a.codigo, tipo: a.tipo, problema: `Solo ${criterios.length} criterios de evaluación (mínimo: 3)`, severidad: criterios.length === 0 ? "alta" : "baja" });
  }
  const minPal = c.longitud_minima_palabras ?? 0;
  if (minPal < 80) {
    issues.push({ codigo: a.codigo, tipo: a.tipo, problema: `longitud_minima_palabras=${minPal} (mínimo recomendado: 80)`, severidad: "baja" });
  }
  return issues;
}

function auditarEjercicioMat(a: ActividadDB): IssueCalidad[] {
  const issues: IssueCalidad[] = [];
  const c = a.contenido as { problema?: string; respuesta_final?: string; pasos_guia?: string[]; tipo_respuesta?: string };

  if (!c.problema || c.problema.length < 20) {
    issues.push({ codigo: a.codigo, tipo: a.tipo, problema: "Problema vacío o muy corto", severidad: "alta" });
  }
  if (!c.respuesta_final || c.respuesta_final.length < 3) {
    issues.push({ codigo: a.codigo, tipo: a.tipo, problema: "Sin respuesta_final", severidad: "media" });
  }
  const pasos = Array.isArray(c.pasos_guia) ? c.pasos_guia : [];
  if (pasos.length < 3) {
    issues.push({ codigo: a.codigo, tipo: a.tipo, problema: `Solo ${pasos.length} pasos_guia (mínimo: 3)`, severidad: "baja" });
  }
  if (!c.tipo_respuesta) {
    issues.push({ codigo: a.codigo, tipo: a.tipo, problema: "Sin tipo_respuesta", severidad: "alta" });
  }
  return issues;
}

function auditarFillBlanks(a: ActividadDB): IssueCalidad[] {
  const issues: IssueCalidad[] = [];
  const c = a.contenido as { texto_con_huecos?: string; huecos?: unknown[] };

  const texto = c.texto_con_huecos ?? "";
  const marcadores = (texto.match(/___/g) ?? []).length;
  const huecos = Array.isArray(c.huecos) ? c.huecos : [];

  if (marcadores === 0) {
    issues.push({ codigo: a.codigo, tipo: a.tipo, problema: "Sin marcadores ___ en texto_con_huecos", severidad: "alta" });
  }
  if (huecos.length === 0) {
    issues.push({ codigo: a.codigo, tipo: a.tipo, problema: "Array huecos vacío", severidad: "alta" });
  }
  if (marcadores > 0 && huecos.length > 0 && marcadores !== huecos.length) {
    issues.push({ codigo: a.codigo, tipo: a.tipo, problema: `Mismatch: ${marcadores} marcadores ___ vs ${huecos.length} huecos`, severidad: "alta" });
  }
  return issues;
}

function auditarDebate(a: ActividadDB): IssueCalidad[] {
  const issues: IssueCalidad[] = [];
  const c = a.contenido as { tema?: string; posturas?: string[]; argumentos_guia?: Record<string, unknown> };

  const tema = c.tema ?? "";
  if (tema.length < 20) {
    issues.push({ codigo: a.codigo, tipo: a.tipo, problema: "Tema genérico/corto", severidad: "alta" });
  }
  const posturas = Array.isArray(c.posturas) ? c.posturas : [];
  if (posturas.length < 2) {
    issues.push({ codigo: a.codigo, tipo: a.tipo, problema: `Solo ${posturas.length} postura(s) (mínimo: 2)`, severidad: "alta" });
  }
  if (!c.argumentos_guia || Object.keys(c.argumentos_guia).length === 0) {
    issues.push({ codigo: a.codigo, tipo: a.tipo, problema: "Sin argumentos_guia", severidad: "media" });
  }
  return issues;
}

function auditarActividad(a: ActividadDB): IssueCalidad[] {
  switch (a.tipo) {
    case "lectura": return auditarLectura(a);
    case "quiz_multiple_opcion": return auditarQuiz(a);
    case "reflexion_escrita": return auditarReflexion(a);
    case "ejercicio_matematico": return auditarEjercicioMat(a);
    case "fill_blanks": return auditarFillBlanks(a);
    case "debate_estructurado": return auditarDebate(a);
    default: return [];
  }
}

async function main() {
  log("=".repeat(70));
  log("FASES 3 + 5 + 6 — CALIDAD PEDAGÓGICA, DUPLICADOS Y SECUENCIA");
  log("=".repeat(70));
  log(`Ejecutado: ${new Date().toISOString()}\n`);

  // Obtener datos
  const { data: uacs } = await sb.from("uac").select("id, codigo").eq("semestre", 1);
  if (!uacs) { log("ERROR: no se pudo obtener UACs"); process.exit(1); }

  const { data: progs } = await sb
    .from("progresiones")
    .select("id, codigo, numero, uac_id")
    .in("uac_id", uacs.map(u => u.id))
    .order("codigo");
  if (!progs) { log("ERROR: no se pudo obtener progresiones"); process.exit(1); }

  const { data: acts } = await sb
    .from("actividades")
    .select("id, codigo, titulo, tipo, contenido, progresion_id")
    .in("progresion_id", progs.map(p => p.id))
    .order("codigo");
  if (!acts) { log("ERROR: no se pudo obtener actividades"); process.exit(1); }

  // Map para acceso rápido
  const uacMap = new Map(uacs.map(u => [u.id, u.codigo]));

  // Construir estructura progresiones → actividades
  const actsMap = new Map<string, ActividadDB[]>();
  for (const a of acts as ActividadDB[]) {
    const arr = actsMap.get(a.progresion_id) ?? [];
    arr.push(a);
    actsMap.set(a.progresion_id, arr);
  }

  const progresionesConActs: ProgresionConActs[] = progs.map(p => ({
    id: p.id,
    codigo: p.codigo,
    numero: p.numero,
    uacCodigo: uacMap.get(p.uac_id) ?? "?",
    actividades: (actsMap.get(p.id) ?? []).sort((a, b) => a.codigo.localeCompare(b.codigo)),
  }));

  // ── FASE 3: Auditoría de calidad ────────────────────────────────────────

  log("── FASE 3: AUDITORÍA DE CALIDAD PEDAGÓGICA (HEURÍSTICAS) ───────────\n");

  const todosIssues: IssueCalidad[] = [];
  let actsFuertes = 0;
  let actsDebiles = 0;

  const issuesPorUAC: Record<string, IssueCalidad[]> = {};

  for (const a of acts as ActividadDB[]) {
    const issues = auditarActividad(a);
    if (issues.length === 0) {
      actsFuertes++;
    } else {
      actsDebiles++;
      todosIssues.push(...issues);
    }
  }

  // Agrupar issues por UAC
  for (const a of acts as ActividadDB[]) {
    const prog = progs.find(p => p.id === a.progresion_id);
    const uac = prog ? uacMap.get(prog.uac_id) ?? "?" : "?";
    const issues = auditarActividad(a);
    if (issues.length > 0) {
      if (!issuesPorUAC[uac]) issuesPorUAC[uac] = [];
      issuesPorUAC[uac].push(...issues);
    }
  }

  // Reporte por UAC
  for (const [uac, issues] of Object.entries(issuesPorUAC).sort()) {
    log(`${uac}: ${issues.length} issues`);
    const altas = issues.filter(i => i.severidad === "alta");
    const medias = issues.filter(i => i.severidad === "media");
    const bajas = issues.filter(i => i.severidad === "baja");
    if (altas.length > 0) log(`  Alta severidad (${altas.length}):`);
    for (const i of altas) log(`    ❌ ${i.codigo}: ${i.problema}`);
    if (medias.length > 0) log(`  Media severidad (${medias.length}):`);
    for (const i of medias) log(`    🟡 ${i.codigo}: ${i.problema}`);
    if (bajas.length > 0) log(`  Baja severidad (${bajas.length}):`);
    for (const i of bajas) log(`    ℹ️  ${i.codigo}: ${i.problema}`);
  }

  const issuesAlta = todosIssues.filter(i => i.severidad === "alta").length;
  const issuesMedia = todosIssues.filter(i => i.severidad === "media").length;
  const issuesBaja = todosIssues.filter(i => i.severidad === "baja").length;

  log(`\nResumen Fase 3:`);
  log(`  Actividades sin issues: ${actsFuertes}/${acts.length}`);
  log(`  Actividades con issues: ${actsDebiles}/${acts.length}`);
  log(`  Issues alta severidad: ${issuesAlta}`);
  log(`  Issues media severidad: ${issuesMedia}`);
  log(`  Issues baja severidad: ${issuesBaja}`);

  // ── FASE 5: Duplicados ──────────────────────────────────────────────────

  log("\n── FASE 5: VERIFICACIÓN DE DUPLICADOS ───────────────────────────────\n");

  // 5.1 Títulos duplicados
  const tituloCounts = new Map<string, string[]>();
  for (const a of acts as ActividadDB[]) {
    const key = a.titulo.trim().toLowerCase();
    const arr = tituloCounts.get(key) ?? [];
    arr.push(a.codigo);
    tituloCounts.set(key, arr);
  }
  let titulosDuplicados = 0;
  for (const [titulo, codigos] of tituloCounts) {
    if (codigos.length > 1) {
      log(`  ⚠️  Título duplicado: "${titulo}"`);
      log(`     Actividades: ${codigos.join(", ")}`);
      titulosDuplicados++;
    }
  }
  if (titulosDuplicados === 0) log("  ✅ Sin títulos duplicados.");

  // 5.2 Prompt/texto principal duplicados (exactos)
  const promptCounts = new Map<string, string[]>();
  for (const a of acts as ActividadDB[]) {
    let texto = "";
    const c = a.contenido as Record<string, unknown>;
    if (a.tipo === "reflexion_escrita") texto = (c.prompt as string) ?? "";
    else if (a.tipo === "lectura") texto = (c.texto as string)?.substring(0, 200) ?? "";
    else if (a.tipo === "debate_estructurado") texto = (c.tema as string) ?? "";
    if (texto.length > 20) {
      const key = texto.trim().toLowerCase().substring(0, 150);
      const arr = promptCounts.get(key) ?? [];
      arr.push(a.codigo);
      promptCounts.set(key, arr);
    }
  }
  let promptsDuplicados = 0;
  for (const [, codigos] of promptCounts) {
    if (codigos.length > 1) {
      log(`  ⚠️  Contenido principal duplicado: ${codigos.join(", ")}`);
      promptsDuplicados++;
    }
  }
  if (promptsDuplicados === 0) log("  ✅ Sin contenido principal duplicado entre actividades.");

  // ── FASE 6: Progresión pedagógica ──────────────────────────────────────

  log("\n── FASE 6: VERIFICACIÓN DE SECUENCIA PEDAGÓGICA A1→A2→A3 ───────────\n");

  let secuenciasOK = 0;
  let secuenciasRotas = 0;
  const secuenciasRotasDetalle: string[] = [];

  for (const p of progresionesConActs) {
    const acts3 = p.actividades;
    if (acts3.length !== 3) continue;

    // Sort by suffix A1, A2, A3
    const sorted = [...acts3].sort((a, b) => {
      const sufA = a.codigo.match(/-A(\d+)$/)?.[1] ?? "0";
      const sufB = b.codigo.match(/-A(\d+)$/)?.[1] ?? "0";
      return parseInt(sufA) - parseInt(sufB);
    });

    const a1tipo = sorted[0]?.tipo ?? "";
    const a2tipo = sorted[1]?.tipo ?? "";
    const a3tipo = sorted[2]?.tipo ?? "";

    const a1ok = TIPOS_A1.includes(a1tipo);
    const a2ok = TIPOS_A2.includes(a2tipo);
    const a3ok = TIPOS_A3.includes(a3tipo);

    if (a1ok && a2ok && a3ok) {
      secuenciasOK++;
    } else {
      secuenciasRotas++;
      const detail = `${p.codigo} (${p.uacCodigo}): A1=${a1tipo}(${a1ok ? "✅" : "❌"}) A2=${a2tipo}(${a2ok ? "✅" : "❌"}) A3=${a3tipo}(${a3ok ? "✅" : "❌"})`;
      log(`  ⚠️  ${detail}`);
      secuenciasRotasDetalle.push(detail);
    }
  }

  if (secuenciasRotas === 0) {
    log(`  ✅ Todas las progresiones respetan la secuencia A1(contextualización)→A2(práctica)→A3(cierre)`);
  }
  log(`  Secuencias OK: ${secuenciasOK}/48, rotas: ${secuenciasRotas}/48`);

  // ── RESUMEN GLOBAL ──────────────────────────────────────────────────────

  log("\n" + "=".repeat(70));
  log("RESUMEN FASES 3 + 5 + 6");
  log("=".repeat(70));
  log(`Calidad Fase 3: ${actsDebiles} actividades con issues (${issuesAlta} alta, ${issuesMedia} media, ${issuesBaja} baja)`);
  log(`Duplicados Fase 5: ${titulosDuplicados} títulos dup, ${promptsDuplicados} contenidos dup`);
  log(`Secuencia Fase 6: ${secuenciasOK}/48 correctas, ${secuenciasRotas}/48 rotas`);

  const score = Math.round(((acts.length - actsDebiles) / acts.length) * 100);
  log(`\nEstimación de calidad global: ${score}% de actividades sin issues de formato`);

  // Write log
  const logPath = resolve(process.cwd(), "_diagnostico-robustez-actividades.log");
  const existing = fs.existsSync(logPath) ? fs.readFileSync(logPath, "utf8") : "";
  fs.writeFileSync(logPath, existing + "\n" + lines.join("\n") + "\n\n");
  log(`\nLog actualizado en: ${logPath}`);
}

main().catch((err) => { console.error("❌", err.message); process.exit(1); });
