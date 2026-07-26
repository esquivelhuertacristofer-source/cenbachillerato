/**
 * Driver de la jornada de CARGA contra Supabase.
 *
 * Sube la concurrencia por etapas contra las lecturas PERSONALES reales del
 * alumno (snapshot / progreso / resumen) usando cuentas SINTÉTICAS autenticadas,
 * mide p50/p95/p99 + throughput + tasa de error por etapa, corta si una etapa se
 * satura (circuit breaker) y traduce el techo de req/s medido a "alumnos
 * concurrentes soportables" con la ley de Little.
 *
 * SEGURIDAD:
 *   • SIMULACRO por defecto: sin LOADTEST_CONFIRM=si imprime el plan y sale.
 *   • SOLO LECTURA por defecto: --writes (gated) añade inserts en `intentos`,
 *     siempre sobre cuentas sintéticas.
 *   • Requiere haber corrido antes provision-usuarios-carga.ts.
 *
 * Uso:
 *   # simulacro:
 *   npx tsx scripts/loadtest/correr-carga.ts
 *   # de verdad (solo lectura):
 *   LOADTEST_CONFIRM=si npx tsx scripts/loadtest/correr-carga.ts
 *   # con escrituras:
 *   LOADTEST_CONFIRM=si npx tsx scripts/loadtest/correr-carga.ts --writes
 *
 * Ajustes por env: LOADTEST_STAGES, LOADTEST_STAGE_SEC, LOADTEST_MAX_CLIENTS,
 *   LOADTEST_SLO_P95_MS, LOADTEST_ERROR_PCT, LOADTEST_SUPABASE_URL/ANON_KEY.
 */
import { pathToFileURL } from "url";
import { resolve } from "path";
import { writeFileSync, mkdirSync } from "fs";
import { performance } from "perf_hooks";
import { createClient } from "@supabase/supabase-js";
import {
  TARGET_URL,
  TARGET_ANON_KEY,
  SYNTH_PASSWORD,
  SANDBOX_CCT,
  confirmado,
  getServiceClient,
  targetHost,
  objetivoEsElDeLaApp,
  etapasConcurrencia,
  SEG_POR_ETAPA,
  MAX_CLIENTES,
  SLO_P95_MS,
  UMBRAL_ERROR_PCT,
  THINK_TIMES_SEG,
  MEZCLA_LECTURA,
  PESO_ESCRITURA,
} from "./config";
import { Recorder, tablaEscenarios, ms } from "./metricas";
import { ESCENARIOS, type NombreEscenario, type VU, type UserSb } from "./escenarios";

const CON_ESCRITURAS = process.argv.includes("--writes");
let abortado = false;

// ── Distribución de escenarios (ruleta acumulada) ─────────────────────────────
function construirRuleta(): NombreEscenario[] {
  // 100 casillas ponderadas; elegir = índice aleatorio. Simple y suficiente.
  const pesos: Array<[NombreEscenario, number]> = [
    ["snapshot", MEZCLA_LECTURA.snapshot ?? 0],
    ["progresoDetalle", MEZCLA_LECTURA.progresoDetalle ?? 0],
    ["resumen", MEZCLA_LECTURA.resumen ?? 0],
  ];
  if (CON_ESCRITURAS) pesos.push(["escritura", PESO_ESCRITURA]);
  const ruleta: NombreEscenario[] = [];
  for (const [nombre, peso] of pesos) {
    for (let k = 0; k < Math.round(peso); k++) ruleta.push(nombre);
  }
  return ruleta.length > 0 ? ruleta : ["snapshot"];
}

// ── Pool de usuarios sintéticos (enumerar + firmar) ───────────────────────────
async function enumerarSinteticos(): Promise<Array<{ email: string; semestre: number }>> {
  const sb = getServiceClient();
  const { data: esc } = await sb.from("escuelas").select("id").eq("cct", SANDBOX_CCT).maybeSingle();
  if (!esc) return [];
  const { data } = await sb
    .from("profiles")
    .select("email, semestre")
    .eq("escuela_id", esc.id);
  return ((data ?? []) as { email: string; semestre: number | null }[]).map((p) => ({
    email: p.email,
    semestre: p.semestre ?? 1,
  }));
}

async function firmarClientes(
  usuarios: Array<{ email: string; semestre: number }>,
  authRec: Recorder
): Promise<VU[]> {
  const objetivo = usuarios.slice(0, MAX_CLIENTES);
  const vus: VU[] = [];
  let cursor = 0;
  const CONCURRENCIA_LOGIN = 20;
  const workers = Array.from({ length: Math.min(CONCURRENCIA_LOGIN, objetivo.length) }, async () => {
    while (cursor < objetivo.length) {
      const u = objetivo[cursor++]!;
      const sb = createClient(TARGET_URL, TARGET_ANON_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
      }) as unknown as UserSb;
      const t0 = performance.now();
      const { data, error } = await sb.auth.signInWithPassword({ email: u.email, password: SYNTH_PASSWORD });
      const dt = performance.now() - t0;
      authRec.registrar("login", dt, !error && !!data?.user);
      if (!error && data?.user) {
        vus.push({ userId: data.user.id, semestre: u.semestre, sb });
      }
    }
  });
  await Promise.all(workers);
  return vus;
}

// ── Una etapa: mantener `concurrencia` requests en vuelo por `segundos` ────────
interface ResultadoEtapa {
  concurrencia: number;
  segundos: number;
  total: number;
  errores: number;
  errorPct: number;
  throughput: number;
  p95: number;
  elLagMaxMs: number;
  cortadaPorError: boolean;
  pasa: boolean;
}

async function correrEtapa(concurrencia: number, vus: VU[], ruleta: NombreEscenario[]): Promise<ResultadoEtapa> {
  const rec = new Recorder();
  const deadline = Date.now() + SEG_POR_ETAPA * 1000;
  const inicio = performance.now();
  let cortadaPorError = false;

  // Medidor de lag del event loop (delata saturación del PROPIO loader).
  let elLagMax = 0;
  let ticEsperado = performance.now() + 200;
  const elTimer = setInterval(() => {
    const ahora = performance.now();
    const lag = ahora - ticEsperado;
    if (lag > elLagMax) elLagMax = lag;
    ticEsperado = ahora + 200;
  }, 200);

  async function worker() {
    while (Date.now() < deadline && !abortado && !cortadaPorError) {
      const vu = vus[Math.floor(Math.random() * vus.length)]!;
      const nombre = ruleta[Math.floor(Math.random() * ruleta.length)]!;
      const t0 = performance.now();
      let ok = true;
      try {
        await ESCENARIOS[nombre](vu);
      } catch {
        ok = false;
      }
      rec.registrar(nombre, performance.now() - t0, ok);

      // Circuit breaker: con muestra suficiente, si la tasa de error dispara, corta.
      const tot = rec.totales();
      if (tot.n >= 200 && tot.errorPct > UMBRAL_ERROR_PCT) cortadaPorError = true;
    }
  }

  await Promise.all(Array.from({ length: concurrencia }, () => worker()));
  clearInterval(elTimer);

  const elapsedS = (performance.now() - inicio) / 1000;
  const tot = rec.totales();
  const p95 = rec.p95Peor();
  const throughput = tot.n / elapsedS;
  const pasa = !cortadaPorError && p95 <= SLO_P95_MS && tot.errorPct <= UMBRAL_ERROR_PCT;

  console.log(`\n── Etapa: ${concurrencia} en vuelo · ${SEG_POR_ETAPA}s ──`);
  console.log(tablaEscenarios(rec));
  console.log(
    `  → total=${tot.n}  throughput=${throughput.toFixed(1)} req/s  ` +
      `p95(peor)=${ms(p95)}  err=${tot.errorPct.toFixed(2)}%  ` +
      `el-lag-max=${ms(elLagMax)}  ${pasa ? "✅ PASA" : cortadaPorError ? "⛔ CORTADA (errores)" : "⚠️ FUERA DE SLO"}`
  );

  return {
    concurrencia,
    segundos: elapsedS,
    total: tot.n,
    errores: tot.errores,
    errorPct: tot.errorPct,
    throughput,
    p95,
    elLagMaxMs: elLagMax,
    cortadaPorError,
    pasa,
  };
}

// ── Reporte final + mapeo a alumnos concurrentes ──────────────────────────────
function reporteFinal(etapas: ResultadoEtapa[], vusFirmados: number, authP95: number) {
  console.log("\n" + "═".repeat(72));
  console.log("RESUMEN DE LA JORNADA DE CARGA");
  console.log("═".repeat(72));
  console.log(`  Objetivo        : ${targetHost()}`);
  console.log(`  Clientes firmados: ${vusFirmados}   login p95: ${ms(authP95)}`);
  console.log(`  SLO p95         : ${SLO_P95_MS}ms   umbral error: ${UMBRAL_ERROR_PCT}%`);
  console.log("");
  console.log("  conc   throughput   p95(peor)   err%    el-lag   veredicto");
  console.log("  " + "─".repeat(62));
  for (const e of etapas) {
    console.log(
      "  " +
        String(e.concurrencia).padEnd(7) +
        (e.throughput.toFixed(1) + " r/s").padEnd(13) +
        ms(e.p95).padEnd(12) +
        e.errorPct.toFixed(1).padEnd(8) +
        ms(e.elLagMaxMs).padEnd(9) +
        (e.pasa ? "✅ PASA" : e.cortadaPorError ? "⛔ errores" : "⚠️ fuera SLO")
    );
  }

  const pasables = etapas.filter((e) => e.pasa);
  const mejor = pasables.reduce<ResultadoEtapa | null>((a, b) => (a && a.throughput >= b.throughput ? a : b), null);

  console.log("\n" + "─".repeat(72));
  if (!mejor) {
    console.log("❌ Ninguna etapa cumplió el SLO. Revisa la config del proyecto Supabase");
    console.log("   (tier de cómputo, pooler) y los índices de intentos/snapshot.");
    return { lambdaMax: 0, capacidad: {} as Record<number, number>, saturoLoader: false, alcanzoTecho: false };
  }

  const lambdaMax = mejor.throughput;
  const topStage = etapas[etapas.length - 1]!;
  const alcanzoTecho = !topStage.pasa; // hubo una etapa que ya NO pasó → encontramos la rodilla
  // Sospecha de saturación del LOADER (no de Postgres): lag alto o el throughput
  // dejó de crecer al subir la concurrencia.
  const saturoLoader = mejor.elLagMaxMs > 250;

  console.log(`Techo sostenible medido: ~${lambdaMax.toFixed(0)} req/s`);
  console.log(`  (a ${mejor.concurrencia} requests en vuelo, p95 ${ms(mejor.p95)}, err ${mejor.errorPct.toFixed(2)}%)\n`);
  console.log("Mapeo a ALUMNOS CONCURRENTES soportables (ley de Little: alumnos ≈ req/s × think-time):");
  const capacidad: Record<number, number> = {};
  for (const tt of THINK_TIMES_SEG) {
    const alumnos = Math.round(lambdaMax * tt);
    capacidad[tt] = alumnos;
    const marca = alumnos >= 7000 ? "  ✅ ≥ objetivo 5-7k" : alumnos >= 5000 ? "  ✅ dentro de 5-7k" : "  ⚠️ debajo de 5k";
    console.log(`  • think-time ${tt}s → ~${alumnos.toLocaleString("es-MX")} alumnos${marca}`);
  }

  console.log("\nLecturas honestas:");
  if (!alcanzoTecho) {
    console.log("  • NO se alcanzó saturación: la etapa más alta aún PASA. El techo real es");
    console.log("    ≥ lo medido — sube LOADTEST_STAGES para empujarlo más.");
  } else {
    console.log(`  • Saturación observada arriba de ${mejor.concurrencia} en vuelo (la siguiente etapa no pasó).`);
  }
  if (saturoLoader) {
    console.log("  • ⚠️ El lag del event-loop fue alto: es probable que el CUELLO sea ESTE");
    console.log("    proceso Node (un solo box), no Postgres. El techo real de Supabase puede");
    console.log("    ser MAYOR. Corre en paralelo desde varias máquinas/procesos para confirmarlo.");
  }
  console.log("  • think-time = seg entre interacciones de un mismo alumno; es un SUPUESTO.");
  console.log("    15-30s es razonable para navegar/resolver; ajústalo a tu telemetría real.");

  return { lambdaMax, capacidad, saturoLoader, alcanzoTecho };
}

async function main() {
  const ruleta = construirRuleta();
  const etapas = etapasConcurrencia();

  console.log("\n🔥 CEN Bachillerato — Jornada de CARGA en Supabase\n");
  console.log(`  Objetivo Supabase : ${targetHost()}${objetivoEsElDeLaApp() ? "  ⚠️ (proyecto de la app / probable PROD con datos de MENORES)" : ""}`);
  console.log(`  Etapas (en vuelo) : ${etapas.join(", ")}`);
  console.log(`  Duración/etapa    : ${SEG_POR_ETAPA}s`);
  console.log(`  Clientes máx      : ${MAX_CLIENTES}`);
  console.log(`  Mezcla lectura    : snapshot ${MEZCLA_LECTURA.snapshot}% · progresoDetalle ${MEZCLA_LECTURA.progresoDetalle}% · resumen ${MEZCLA_LECTURA.resumen}%`);
  console.log(`  Escrituras        : ${CON_ESCRITURAS ? `SÍ (insert intentos, +${PESO_ESCRITURA}%)` : "no (solo lectura)"}`);
  console.log(`  SLO p95 / corte   : ${SLO_P95_MS}ms / error > ${UMBRAL_ERROR_PCT}%`);

  if (!TARGET_URL || !TARGET_ANON_KEY) {
    console.error("\nERROR: faltan TARGET_URL/ANON_KEY (NEXT_PUBLIC_SUPABASE_* o LOADTEST_SUPABASE_*).");
    process.exit(1);
  }

  const usuarios = await enumerarSinteticos();
  console.log(`\n  Cuentas sintéticas disponibles: ${usuarios.length}`);
  if (usuarios.length === 0) {
    console.error("  ⚠️ No hay cuentas sintéticas. Corre primero provision-usuarios-carga.ts.");
    process.exit(1);
  }

  if (!confirmado()) {
    const picoConc = Math.max(...etapas);
    console.log("\n🟡 SIMULACRO — no se mandó ni un request.");
    console.log(`   Pico de concurrencia planeado: ${picoConc} requests en vuelo.`);
    console.log("   Para ejecutar de verdad, repite con LOADTEST_CONFIRM=si en el entorno.");
    if (objetivoEsElDeLaApp()) {
      console.log("   ⚠️ El objetivo es el proyecto de la app (datos de menores). Considera");
      console.log("      apuntar a un clon/staging con LOADTEST_SUPABASE_URL/ANON_KEY.");
    }
    console.log("");
    return;
  }

  console.log("\n▶ Firmando clientes autenticados…");
  const authRec = new Recorder();
  const vus = await firmarClientes(usuarios, authRec);
  console.log(`  ✓ ${vus.length} clientes firmados  (login p95 ${ms(authRec.p95Peor())})`);
  if (vus.length === 0) {
    console.error("  ⚠️ Ningún login exitoso. ¿Contraseña (LOADTEST_PASSWORD) correcta?");
    process.exit(1);
  }

  process.on("SIGINT", () => {
    console.log("\n⏹  Interrumpido — cerrando la etapa en curso…");
    abortado = true;
  });

  const resultados: ResultadoEtapa[] = [];
  for (const c of etapas) {
    if (abortado) break;
    const r = await correrEtapa(c, vus, ruleta);
    resultados.push(r);
    // Si una etapa se cortó por errores, no tiene sentido subir más la carga.
    if (r.cortadaPorError) {
      console.log("  ⛔ Etapa cortada por errores — no se escalan más etapas.");
      break;
    }
  }

  const veredicto = reporteFinal(resultados, vus.length, authRec.p95Peor());

  // Persistir el reporte para comparar corridas.
  try {
    const dir = resolve(process.cwd(), "scripts/loadtest/out");
    mkdirSync(dir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const ruta = resolve(dir, `carga-${stamp}.json`);
    writeFileSync(
      ruta,
      JSON.stringify(
        {
          objetivo: targetHost(),
          fecha: new Date().toISOString(),
          config: { etapas, segPorEtapa: SEG_POR_ETAPA, maxClientes: MAX_CLIENTES, sloP95: SLO_P95_MS, umbralErrorPct: UMBRAL_ERROR_PCT, conEscrituras: CON_ESCRITURAS, mezcla: MEZCLA_LECTURA },
          clientesFirmados: vus.length,
          loginP95Ms: authRec.p95Peor(),
          etapas: resultados,
          veredicto,
        },
        null,
        2
      )
    );
    console.log(`\n📄 Reporte guardado: ${ruta}\n`);
  } catch (e) {
    console.log(`\n(no se pudo guardar el reporte JSON: ${e instanceof Error ? e.message : e})\n`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error("\nERROR FATAL:", err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
