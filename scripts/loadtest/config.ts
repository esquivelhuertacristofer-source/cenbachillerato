/**
 * Configuración compartida + candados de seguridad de la jornada de carga.
 *
 * ⚠️ Estos scripts pueden mandar MILES de requests a Supabase y (con --writes)
 * CREAR/BORRAR filas. Todo corre en modo SIMULACRO por defecto: sin
 * `LOADTEST_CONFIRM=si` en el entorno, ninguno manda tráfico ni escribe nada.
 *
 * Datos de MENORES: la carga usa SOLO cuentas sintéticas en una escuela sandbox
 * claramente etiquetada (nunca alumnos reales) y es de SOLO LECTURA salvo que se
 * pase --writes explícitamente. Ver scripts/loadtest/README.md.
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../src/types/database.types";

loadEnv({ path: resolve(process.cwd(), ".env.local") });

// ── Escuela / cuentas sintéticas ─────────────────────────────────────────────
// Todo lo sintético cuelga de esta escuela para poder identificarlo y borrarlo
// sin tocar datos reales. El nombre grita "no real" a propósito.
export const SANDBOX_CCT = "LOADTEST-000";
export const SANDBOX_NOMBRE = "ZZZ Carga Sintética — NO ES ESCUELA REAL";
export const EMAIL_DOMINIO = "loadtest.cen.local";
export const EMAIL_PREFIJO = "carga";

/** Contraseña común de las cuentas sintéticas (override: LOADTEST_PASSWORD). */
export const SYNTH_PASSWORD = process.env.LOADTEST_PASSWORD ?? "Carga-Sintetica-2026!";

/** Email determinista de la cuenta sintética i (1-based, 6 dígitos). */
export function emailParaIndice(i: number): string {
  return `${EMAIL_PREFIJO}+${String(i).padStart(6, "0")}@${EMAIL_DOMINIO}`;
}

// ── Objetivo de la prueba ────────────────────────────────────────────────────
// Por defecto apunta al MISMO Supabase de la app (.env.local). Para no golpear
// producción con datos de menores, se puede apuntar a un clon/staging con
// LOADTEST_SUPABASE_URL / LOADTEST_SUPABASE_ANON_KEY.
export const TARGET_URL =
  process.env.LOADTEST_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const TARGET_ANON_KEY =
  process.env.LOADTEST_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** Host legible (sin credenciales) para imprimir en los planes de simulacro. */
export function targetHost(): string {
  try {
    return new URL(TARGET_URL).host;
  } catch {
    return "(URL inválida o ausente)";
  }
}

/** ¿El objetivo es el mismo proyecto que la app (probable PRODUCCIÓN)? */
export function objetivoEsElDeLaApp(): boolean {
  const app = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return app !== "" && TARGET_URL === app;
}

// ── Candado de confirmación ──────────────────────────────────────────────────
/** true solo si el operador puso LOADTEST_CONFIRM=si en el entorno. */
export function confirmado(): boolean {
  return (process.env.LOADTEST_CONFIRM ?? "").toLowerCase() === "si";
}

// ── Cliente service_role (solo provisión/limpieza; nunca la carga de lectura) ─
export function getServiceClient(): SupabaseClient<Database> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local"
    );
  }
  return createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ── Reintentos ante fallos transitorios ──────────────────────────────────────
// Supabase puede devolver `bad_jwt` ("unrecognized JWT kid <nil> for algorithm
// ES256") de forma INTERMITENTE mientras propaga una rotación de llaves de firma
// JWT, además de los típicos 5xx / fetch failed del edge. Son transitorios: el
// mismo request funciona segundos después. Los reintentamos con backoff.
export function esErrorTransitorio(msg: string): boolean {
  const m = (msg ?? "").toLowerCase();
  return (
    m.includes("bad_jwt") ||
    m.includes("unverifiable") ||
    m.includes("unrecognized jwt kid") ||
    m.includes("unable to parse or verify") ||
    m.includes("fetch failed") ||
    m.includes("timeout") ||
    m.includes("econnreset") ||
    m.includes("502") ||
    m.includes("503") ||
    m.includes("504")
  );
}

/** Reintenta fn con backoff exponencial mientras el error parezca transitorio. */
export async function reintentar<T>(
  fn: () => Promise<T>,
  { intentos = 5, baseMs = 400 }: { intentos?: number; baseMs?: number } = {}
): Promise<T> {
  let ultimo: unknown;
  for (let i = 0; i < intentos; i++) {
    try {
      return await fn();
    } catch (err) {
      ultimo = err;
      const msg = err instanceof Error ? err.message : String(err);
      if (!esErrorTransitorio(msg) || i === intentos - 1) throw err;
      await new Promise((r) => setTimeout(r, baseMs * 2 ** i));
    }
  }
  throw ultimo;
}

// ── Parámetros de la corrida (todos override por env) ─────────────────────────
function numEnv(name: string, def: number): number {
  const v = Number(process.env[name]);
  return Number.isFinite(v) && v > 0 ? v : def;
}

/** Etapas de concurrencia (requests en vuelo simultáneas). */
export function etapasConcurrencia(): number[] {
  const raw = process.env.LOADTEST_STAGES;
  if (raw) {
    const parsed = raw
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n) && n > 0);
    if (parsed.length > 0) return parsed;
  }
  return [10, 25, 50, 100, 200, 400];
}

/** Segundos que dura cada etapa. */
export const SEG_POR_ETAPA = numEnv("LOADTEST_STAGE_SEC", 30);

/** Cuántas cuentas sintéticas firmar (clientes autenticados distintos). */
export const MAX_CLIENTES = numEnv("LOADTEST_MAX_CLIENTS", 400);

/** SLO de latencia: p95 objetivo por debajo de esto (ms). */
export const SLO_P95_MS = numEnv("LOADTEST_SLO_P95_MS", 800);

/** Corta la etapa si la tasa de error supera este porcentaje (circuit breaker). */
export const UMBRAL_ERROR_PCT = numEnv("LOADTEST_ERROR_PCT", 5);

/**
 * Tiempos de "think time" (seg entre interacciones de UN alumno) para mapear el
 * techo de req/s medido → alumnos concurrentes soportables (ley de Little).
 */
export const THINK_TIMES_SEG = [15, 20, 30];

/**
 * Mezcla de escenarios de LECTURA (deben sumar 100). Refleja una sesión real:
 * dominada por lecturas baratas del snapshot (navegar el hub), con cargas
 * ocasionales más pesadas de progreso/resumen.
 */
export const MEZCLA_LECTURA: Record<string, number> = {
  snapshot: 55, // lookup por PK al navegar el hub
  progresoDetalle: 20, // abrir la vista de progreso de un semestre (4 queries)
  resumen: 25, // abrir /hub/progreso (3 queries en paralelo + RPC)
};

/** Peso del escenario de ESCRITURA cuando --writes está activo (se añade a la mezcla). */
export const PESO_ESCRITURA = numEnv("LOADTEST_WRITE_PCT", 5);
