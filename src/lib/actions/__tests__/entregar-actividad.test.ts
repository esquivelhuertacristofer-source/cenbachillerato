/**
 * @jest-environment node
 *
 * Cubre el núcleo compartido `procesarEntregaValidada` (validación Zod,
 * tope de 20 KB, idempotencia 23505→ok, y el volcado a R2 del jsonb
 * "respuestas" cuando supera 2 KB) y el wrapper `entregarActividad`
 * (auth + rate limit antes de delegar al núcleo).
 */

jest.mock("@/lib/supabase-helpers", () => ({
  getSupabaseServer: jest.fn(),
  getUser: jest.fn(),
}));

jest.mock("@/lib/rate-limit", () => ({
  checkRateLimit: jest.fn(),
}));

jest.mock("@/lib/r2-respuestas", () => ({
  putRespuestas: jest.fn(),
}));

import { getSupabaseServer, getUser } from "@/lib/supabase-helpers";
import { checkRateLimit } from "@/lib/rate-limit";
import { putRespuestas } from "@/lib/r2-respuestas";
import { entregarActividad, procesarEntregaValidada } from "@/lib/actions/entregar-actividad";

const mockGetSupabaseServer = getSupabaseServer as jest.MockedFunction<typeof getSupabaseServer>;
const mockGetUser = getUser as jest.MockedFunction<typeof getUser>;
const mockCheckRateLimit = checkRateLimit as jest.MockedFunction<typeof checkRateLimit>;
const mockPutRespuestas = putRespuestas as jest.MockedFunction<typeof putRespuestas>;

// ── Helpers de mocking ───────────────────────────────────────────────────────

// Cadena awaitable estilo PostgREST (mismo patrón thenable que progreso.test.ts),
// con `maybeSingle` como método terminal propio (así lo usa entregar-actividad.ts).
function makeChain(result: { data: unknown; error?: unknown }) {
  const resolved = Promise.resolve({ error: null, ...result });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c: Record<string, any> = {};
  for (const m of ["select", "eq"]) {
    c[m] = jest.fn(() => c);
  }
  c.maybeSingle = jest.fn(() => resolved);
  c.then = resolved.then.bind(resolved);
  return c;
}

function makeSb(opts: {
  actividad?: { id: string; estado: string } | null;
  insertError?: { code?: string; message?: string } | null;
}) {
  const actChain = makeChain({ data: opts.actividad === undefined ? { id: "act-1", estado: "publicada" } : opts.actividad });
  const insert = jest.fn(() => Promise.resolve({ error: opts.insertError ?? null }));
  const from = jest.fn((table: string) => {
    if (table === "actividades") return actChain;
    if (table === "intentos") return { insert };
    throw new Error(`tabla no mockeada en test: ${table}`);
  });
  const sb = { from } as unknown as Awaited<ReturnType<typeof getSupabaseServer>>;
  return { sb, from, insert, actChain };
}

const UUID_ACTIVIDAD = "11111111-1111-4111-8111-111111111111";
const USER_ID = "22222222-2222-4222-8222-222222222222";

beforeEach(() => {
  jest.resetAllMocks();
});

// ── procesarEntregaValidada — validación Zod ────────────────────────────────

describe("procesarEntregaValidada — validación", () => {
  test("actividadId que no es UUID → error de validación, sin tocar la BD", async () => {
    const { sb, from } = makeSb({});

    const res = await procesarEntregaValidada(sb, USER_ID, "no-es-un-uuid", { puntaje: 90 });

    expect(res).toEqual({ error: "actividadId debe ser un UUID válido" });
    expect(from).not.toHaveBeenCalled();
  });

  test("respuestas que excede 20 KB → error de validación, sin tocar la BD", async () => {
    const { sb, from } = makeSb({});
    const respuestasEnormes = { texto: "a".repeat(21_000) };

    const res = await procesarEntregaValidada(sb, USER_ID, UUID_ACTIVIDAD, {
      respuestas: respuestasEnormes,
    });

    expect("error" in res).toBe(true);
    expect(from).not.toHaveBeenCalled();
  });
});

// ── procesarEntregaValidada — actividad no encontrada ───────────────────────

describe("procesarEntregaValidada — actividad", () => {
  test("actividad inexistente o no publicada → error, sin insertar intento", async () => {
    const { sb, insert } = makeSb({ actividad: null });

    const res = await procesarEntregaValidada(sb, USER_ID, UUID_ACTIVIDAD, { puntaje: 100 });

    expect(res).toEqual({ error: "Actividad no encontrada o no disponible" });
    expect(insert).not.toHaveBeenCalled();
  });
});

// ── procesarEntregaValidada — "respuestas" chica vs grande (R2) ─────────────

describe("procesarEntregaValidada — jsonb vs R2", () => {
  test("respuestas chica (<=2048 bytes) se guarda tal cual en Postgres, sin tocar R2", async () => {
    const { sb, insert } = makeSb({});
    const respuestasChicas = { p1: "respuesta corta" };

    const res = await procesarEntregaValidada(sb, USER_ID, UUID_ACTIVIDAD, {
      respuestas: respuestasChicas,
    });

    expect(res).toEqual({ ok: true });
    expect(mockPutRespuestas).not.toHaveBeenCalled();
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ respuestas: respuestasChicas })
    );
  });

  test("respuestas grande (>2048 bytes) y R2 sube bien → Postgres guarda el marcador __r2", async () => {
    const { sb, insert } = makeSb({});
    const respuestasLargas = { reflexion: "x".repeat(3000) };
    mockPutRespuestas.mockResolvedValue(true);

    const res = await procesarEntregaValidada(sb, USER_ID, UUID_ACTIVIDAD, {
      respuestas: respuestasLargas,
    });

    expect(res).toEqual({ ok: true });
    expect(mockPutRespuestas).toHaveBeenCalledWith(USER_ID, UUID_ACTIVIDAD, respuestasLargas);
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ respuestas: { __r2: 1 } })
    );
  });

  test("respuestas grande y R2 falla → cae al jsonb completo en Postgres (nunca se pierde la entrega)", async () => {
    const { sb, insert } = makeSb({});
    const respuestasLargas = { reflexion: "x".repeat(3000) };
    mockPutRespuestas.mockResolvedValue(false);

    const res = await procesarEntregaValidada(sb, USER_ID, UUID_ACTIVIDAD, {
      respuestas: respuestasLargas,
    });

    expect(res).toEqual({ ok: true });
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ respuestas: respuestasLargas })
    );
  });

  test("sin respuestas → se guarda null, sin tocar R2", async () => {
    const { sb, insert } = makeSb({});

    const res = await procesarEntregaValidada(sb, USER_ID, UUID_ACTIVIDAD, { puntaje: 50 });

    expect(res).toEqual({ ok: true });
    expect(mockPutRespuestas).not.toHaveBeenCalled();
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ respuestas: null }));
  });
});

// ── procesarEntregaValidada — idempotencia / errores de inserción ──────────

describe("procesarEntregaValidada — insert", () => {
  test("23505 (unique_violation) se trata como éxito idempotente", async () => {
    const { sb } = makeSb({ insertError: { code: "23505", message: "duplicate key" } });

    const res = await procesarEntregaValidada(sb, USER_ID, UUID_ACTIVIDAD, { puntaje: 80 });

    expect(res).toEqual({ ok: true });
  });

  test("otro error de inserción devuelve mensaje genérico, no filtra detalle interno", async () => {
    const { sb } = makeSb({ insertError: { code: "23503", message: "fk violation detail" } });

    const res = await procesarEntregaValidada(sb, USER_ID, UUID_ACTIVIDAD, { puntaje: 80 });

    expect(res).toEqual({ error: "Error al guardar el intento. Intenta de nuevo." });
  });
});

// ── entregarActividad — auth + rate limit antes de delegar al núcleo ───────

describe("entregarActividad — wrapper", () => {
  test("sin sesión → error, no llama rate limit ni BD", async () => {
    mockGetUser.mockResolvedValue(null);

    const res = await entregarActividad(UUID_ACTIVIDAD, { puntaje: 90 });

    expect(res).toEqual({ error: "No autenticado" });
    expect(mockCheckRateLimit).not.toHaveBeenCalled();
    expect(mockGetSupabaseServer).not.toHaveBeenCalled();
  });

  test("rate limit excedido → error, no llega a la BD", async () => {
    mockGetUser.mockResolvedValue({ id: USER_ID } as never);
    mockCheckRateLimit.mockResolvedValue({ allowed: false });

    const res = await entregarActividad(UUID_ACTIVIDAD, { puntaje: 90 });

    expect(res).toEqual({ error: "Demasiados intentos. Intenta de nuevo en unos minutos." });
    expect(mockCheckRateLimit).toHaveBeenCalledWith(`entregar-actividad:${USER_ID}`, {
      limit: 30,
      windowSeconds: 60,
    });
    expect(mockGetSupabaseServer).not.toHaveBeenCalled();
  });

  test("con sesión y dentro del límite, delega en el núcleo compartido y guarda el intento", async () => {
    mockGetUser.mockResolvedValue({ id: USER_ID } as never);
    mockCheckRateLimit.mockResolvedValue({ allowed: true });
    const { sb, insert } = makeSb({});
    mockGetSupabaseServer.mockResolvedValue(sb);

    const res = await entregarActividad(UUID_ACTIVIDAD, { puntaje: 90 });

    expect(res).toEqual({ ok: true });
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: USER_ID, actividad_id: UUID_ACTIVIDAD, score: 90 })
    );
  });
});
