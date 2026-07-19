/**
 * @jest-environment node
 *
 * `entregarActividadesBatch`: auth y rate limit se resuelven UNA sola vez
 * para todo el lote, y cada ítem se procesa con el mismo núcleo
 * (`procesarEntregaValidada`) que usa la entrega individual — aquí solo se
 * prueba la orquestación del lote (auth/rate-limit/tope/secuencial/errores
 * por ítem); la lógica de validación/R2/idempotencia del núcleo ya está
 * cubierta en entregar-actividad.test.ts.
 */

jest.mock("@/lib/supabase-helpers", () => ({
  getSupabaseServer: jest.fn(),
  getUser: jest.fn(),
}));

jest.mock("@/lib/rate-limit", () => ({
  checkRateLimit: jest.fn(),
}));

jest.mock("@/lib/actions/entregar-actividad", () => ({
  procesarEntregaValidada: jest.fn(),
}));

import { getSupabaseServer, getUser } from "@/lib/supabase-helpers";
import { checkRateLimit } from "@/lib/rate-limit";
import { procesarEntregaValidada } from "@/lib/actions/entregar-actividad";
import { entregarActividadesBatch } from "@/lib/actions/entregar-actividades-batch";

const mockGetSupabaseServer = getSupabaseServer as jest.MockedFunction<typeof getSupabaseServer>;
const mockGetUser = getUser as jest.MockedFunction<typeof getUser>;
const mockCheckRateLimit = checkRateLimit as jest.MockedFunction<typeof checkRateLimit>;
const mockProcesar = procesarEntregaValidada as jest.MockedFunction<typeof procesarEntregaValidada>;

const USER_ID = "22222222-2222-4222-8222-222222222222";
const ACT_1 = "11111111-1111-4111-8111-111111111111";
const ACT_2 = "33333333-3333-4333-8333-333333333333";
const SB_FAKE = { marcador: "sb" } as unknown as Awaited<ReturnType<typeof getSupabaseServer>>;

beforeEach(() => {
  jest.resetAllMocks();
  mockGetUser.mockResolvedValue({ id: USER_ID } as never);
  mockCheckRateLimit.mockResolvedValue({ allowed: true });
  mockGetSupabaseServer.mockResolvedValue(SB_FAKE);
});

describe("entregarActividadesBatch — auth y rate limit", () => {
  test("sin sesión → error, no llama rate limit ni al núcleo", async () => {
    mockGetUser.mockResolvedValue(null);

    const res = await entregarActividadesBatch([{ actividadId: ACT_1, resultado: {} }]);

    expect(res).toEqual({ error: "No autenticado" });
    expect(mockCheckRateLimit).not.toHaveBeenCalled();
    expect(mockProcesar).not.toHaveBeenCalled();
  });

  test("rate limit excedido → error, no llega al núcleo", async () => {
    mockCheckRateLimit.mockResolvedValue({ allowed: false });

    const res = await entregarActividadesBatch([{ actividadId: ACT_1, resultado: {} }]);

    expect(res).toEqual({ error: "Demasiados intentos. Intenta de nuevo en unos minutos." });
    expect(mockCheckRateLimit).toHaveBeenCalledWith(`entregar-actividad:${USER_ID}`, {
      limit: 30,
      windowSeconds: 60,
    });
    expect(mockProcesar).not.toHaveBeenCalled();
  });

  test("rate limit se resuelve UNA sola vez sin importar el tamaño del lote", async () => {
    mockProcesar.mockResolvedValue({ ok: true });

    await entregarActividadesBatch([
      { actividadId: ACT_1, resultado: {} },
      { actividadId: ACT_2, resultado: {} },
    ]);

    expect(mockCheckRateLimit).toHaveBeenCalledTimes(1);
  });
});

describe("entregarActividadesBatch — validación del lote", () => {
  test("lote vacío → error, no llama rate limit ni al núcleo", async () => {
    const res = await entregarActividadesBatch([]);

    expect(res).toEqual({ error: "No hay entregas para procesar" });
    expect(mockCheckRateLimit).not.toHaveBeenCalled();
    expect(mockProcesar).not.toHaveBeenCalled();
  });

  test("lote de más de 20 entregas → error, no llega al núcleo", async () => {
    const entregas = Array.from({ length: 21 }, (_, i) => ({
      actividadId: `act-${i}`,
      resultado: {},
    }));

    const res = await entregarActividadesBatch(entregas);

    expect(res).toEqual({ error: "Máximo 20 entregas por lote" });
    expect(mockProcesar).not.toHaveBeenCalled();
  });
});

describe("entregarActividadesBatch — orquestación por ítem", () => {
  test("procesa cada ítem secuencialmente con el mismo núcleo y agrega los resultados", async () => {
    mockProcesar
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ error: "Actividad no encontrada o no disponible" });

    const res = await entregarActividadesBatch([
      { actividadId: ACT_1, resultado: { puntaje: 90 } },
      { actividadId: ACT_2, resultado: { puntaje: 10 } },
    ]);

    expect(res).toEqual({
      ok: true,
      resultados: [
        { actividadId: ACT_1, ok: true },
        { actividadId: ACT_2, error: "Actividad no encontrada o no disponible" },
      ],
    });
    expect(mockProcesar).toHaveBeenNthCalledWith(1, SB_FAKE, USER_ID, ACT_1, { puntaje: 90 });
    expect(mockProcesar).toHaveBeenNthCalledWith(2, SB_FAKE, USER_ID, ACT_2, { puntaje: 10 });
  });

  test("un ítem fallido no interrumpe el procesamiento del resto del lote", async () => {
    mockProcesar
      .mockResolvedValueOnce({ error: "boom" })
      .mockResolvedValueOnce({ ok: true });

    const res = await entregarActividadesBatch([
      { actividadId: ACT_1, resultado: {} },
      { actividadId: ACT_2, resultado: {} },
    ]);

    expect(res).toEqual({
      ok: true,
      resultados: [
        { actividadId: ACT_1, error: "boom" },
        { actividadId: ACT_2, ok: true },
      ],
    });
  });
});
