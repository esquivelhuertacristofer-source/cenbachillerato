/**
 * Fix de alta severidad: mismatch ___ vs huecos en IN-I-P05-A2 e IN-I-P07-A2.
 * Añade el hueco faltante en cada actividad para que marcadores === huecos.
 * Ejecutar: npx tsx scripts/fix-fillblanks-mismatch.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";
import { validarContenidoActividad } from "../src/lib/activities/validators";
import * as fs from "fs";

config({ path: resolve(process.cwd(), ".env.local") });

const sb = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const lines: string[] = [];
function log(msg: string) { console.log(msg); lines.push(msg); }

async function main() {
  log("=".repeat(70));
  log("FIX — MISMATCH fill_blanks: IN-I-P05-A2 e IN-I-P07-A2");
  log("=".repeat(70));
  log(`Ejecutado: ${new Date().toISOString()}\n`);

  // ── IN-I-P05-A2 ──────────────────────────────────────────────────────────
  // Problema: texto tiene 9 marcadores ___, huecos array tiene 8 elementos.
  // El 9th marcador: "Yes, ___ is one on the corner" — respuesta: "there"
  // Fix: añadir hueco posicion:8 {respuesta_correcta:"there"}

  log("Obteniendo IN-I-P05-A2...");
  const { data: act05, error: err05 } = await sb
    .from("actividades")
    .select("id, codigo, contenido")
    .eq("codigo", "IN-I-P05-A2")
    .single();

  if (err05 || !act05) {
    log(`  ❌ Error obteniendo IN-I-P05-A2: ${err05?.message}`);
  } else {
    const c05 = act05.contenido as {
      instrucciones?: string;
      texto_con_huecos: string;
      huecos: Array<{ posicion: number; respuesta_correcta: string; alternativas_aceptadas?: string[]; pista?: string }>;
      distingue_mayusculas?: boolean;
    };

    const marcadores05 = (c05.texto_con_huecos.match(/___/g) ?? []).length;
    const huecos05 = c05.huecos.length;
    log(`  Marcadores actuales: ${marcadores05}, Huecos: ${huecos05}`);

    if (marcadores05 === huecos05) {
      log("  ✅ IN-I-P05-A2 ya no tiene mismatch. Skip.");
    } else {
      // Añadir hueco faltante para "Yes, ___ is one on the corner"
      const nuevoContenido = {
        ...c05,
        huecos: [
          ...c05.huecos,
          {
            posicion: 8,
            respuesta_correcta: "there",
            alternativas_aceptadas: ["There"],
            pista: "Yes, ___ is one on the corner (ahí hay una)",
          },
        ],
      };

      // Validar antes de guardar
      const validacion = validarContenidoActividad("fill_blanks", nuevoContenido);
      if (!validacion.success) {
        log(`  ❌ Validación Zod falló: ${JSON.stringify((validacion as { error: { issues: unknown[] } }).error.issues)}`);
      } else {
        const { error: upErr } = await sb
          .from("actividades")
          .update({ contenido: nuevoContenido as Record<string, unknown> })
          .eq("id", act05.id);

        if (upErr) {
          log(`  ❌ Error actualizando DB: ${upErr.message}`);
        } else {
          const nuevosM = (nuevoContenido.texto_con_huecos.match(/___/g) ?? []).length;
          log(`  ✅ IN-I-P05-A2 corregido: ${nuevosM} marcadores === ${nuevoContenido.huecos.length} huecos`);
        }
      }
    }
  }

  // ── IN-I-P07-A2 ──────────────────────────────────────────────────────────
  // Problema: texto tiene 9 marcadores ___, huecos array tiene 8 elementos.
  // Análisis del texto:
  //   Marker 7 (0-indexed): "___ you like English?" → debería ser hueco (Do/do)
  //   Marker 8: "Yes, I ___!" → debería ser hueco (do)
  // El hueco existente en posicion:7 tiene pista "Yes, I ___!" lo que indica
  // que fue diseñado para el marker 8, pero no hay hueco para marker 7.
  // Fix: añadir hueco posicion:7 para "___ you like English?" con respuesta "Do"
  // y reasignar el existente posicion:7 → posicion:8.

  log("\nObteniendo IN-I-P07-A2...");
  const { data: act07, error: err07 } = await sb
    .from("actividades")
    .select("id, codigo, contenido")
    .eq("codigo", "IN-I-P07-A2")
    .single();

  if (err07 || !act07) {
    log(`  ❌ Error obteniendo IN-I-P07-A2: ${err07?.message}`);
  } else {
    const c07 = act07.contenido as {
      instrucciones?: string;
      texto_con_huecos: string;
      huecos: Array<{ posicion: number; respuesta_correcta: string; alternativas_aceptadas?: string[]; pista?: string }>;
      distingue_mayusculas?: boolean;
    };

    const marcadores07 = (c07.texto_con_huecos.match(/___/g) ?? []).length;
    const huecos07 = c07.huecos.length;
    log(`  Marcadores actuales: ${marcadores07}, Huecos: ${huecos07}`);

    if (marcadores07 === huecos07) {
      log("  ✅ IN-I-P07-A2 ya no tiene mismatch. Skip.");
    } else {
      // Verificar si el hueco 7 existente tiene pista "Yes, I ___!" (fue diseñado para marker 8)
      const hueco7Existente = c07.huecos.find(h => h.posicion === 7);
      log(`  Hueco 7 actual: posicion=${hueco7Existente?.posicion}, respuesta='${hueco7Existente?.respuesta_correcta}', pista='${hueco7Existente?.pista}'`);

      // Estrategia: mover hueco 7 a posicion 8, añadir nuevo hueco 7 para "___ you like English?"
      const huecosSinEl7 = c07.huecos.filter(h => h.posicion !== 7);
      const nuevoContenido = {
        ...c07,
        huecos: [
          ...huecosSinEl7,
          {
            posicion: 7,
            respuesta_correcta: "Do",
            alternativas_aceptadas: ["do"],
            pista: "___ you like English? (pregunta con Do/do)",
          },
          {
            posicion: 8,
            respuesta_correcta: "do",
            alternativas_aceptadas: ["Do", "yes"],
            pista: "Yes, I ___! (respuesta afirmativa)",
          },
        ].sort((a, b) => a.posicion - b.posicion),
      };

      // Validar antes de guardar
      const validacion = validarContenidoActividad("fill_blanks", nuevoContenido);
      if (!validacion.success) {
        log(`  ❌ Validación Zod falló: ${JSON.stringify((validacion as { error: { issues: unknown[] } }).error.issues)}`);
      } else {
        const { error: upErr } = await sb
          .from("actividades")
          .update({ contenido: nuevoContenido as Record<string, unknown> })
          .eq("id", act07.id);

        if (upErr) {
          log(`  ❌ Error actualizando DB: ${upErr.message}`);
        } else {
          const nuevosM = (nuevoContenido.texto_con_huecos.match(/___/g) ?? []).length;
          log(`  ✅ IN-I-P07-A2 corregido: ${nuevosM} marcadores === ${nuevoContenido.huecos.length} huecos`);
        }
      }
    }
  }

  // ── Verificación final ──────────────────────────────────────────────────
  log("\n── VERIFICACIÓN FINAL ───────────────────────────────────────────────");
  const { data: verificacion } = await sb
    .from("actividades")
    .select("codigo, contenido")
    .in("codigo", ["IN-I-P05-A2", "IN-I-P07-A2"]);

  for (const a of verificacion ?? []) {
    const c = a.contenido as { texto_con_huecos?: string; huecos?: unknown[] };
    const m = (c.texto_con_huecos?.match(/___/g) ?? []).length;
    const h = Array.isArray(c.huecos) ? c.huecos.length : 0;
    const ok = m === h;
    log(`  ${a.codigo}: ${m} marcadores, ${h} huecos — ${ok ? "✅ MATCH" : "❌ MISMATCH"}`);
  }

  // Write log
  const logPath = resolve(process.cwd(), "_diagnostico-robustez-actividades.log");
  const existing = fs.existsSync(logPath) ? fs.readFileSync(logPath, "utf8") : "";
  fs.writeFileSync(logPath, existing + "\n" + lines.join("\n") + "\n\n");
  log(`\nLog actualizado en: ${logPath}`);
}

main().catch((err) => { console.error("❌", err.message); process.exit(1); });
