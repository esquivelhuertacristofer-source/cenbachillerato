/**
 * @jest-environment node
 */
import { getProgresionesDeUAC, getUACIdPorCodigo } from "../uac";

jest.mock("@/lib/supabase-helpers", () => ({
  getSupabaseServer: jest.fn(),
}));

import { getSupabaseServer } from "@/lib/supabase-helpers";

const mockGetSupabaseServer = getSupabaseServer as jest.MockedFunction<
  typeof getSupabaseServer
>;

function makeChain(result: { data: unknown; error?: unknown; count?: number }) {
  const resolved = Promise.resolve(result);
  const chain: Record<string, jest.Mock> = {};
  chain.select = jest.fn(() => chain);
  chain.eq = jest.fn(() => chain);
  chain.order = jest.fn(() => resolved);
  chain.single = jest.fn(() => resolved);
  chain.is = jest.fn(() => chain);
  return chain;
}

function makeSb(fromImpl: (table: string) => ReturnType<typeof makeChain>) {
  return { from: jest.fn((table: string) => fromImpl(table)) } as unknown as Awaited<
    ReturnType<typeof getSupabaseServer>
  >;
}

// ── getProgresionesDeUAC ────────────────────────────────────────────────────

describe("getProgresionesDeUAC", () => {
  test("happy path: UAC existe → devuelve progresiones ordenadas", async () => {
    const uacChain = makeChain({ data: { id: "uac-uuid-1" }, error: null });
    const progChain = makeChain({
      data: [
        { id: "p1", numero: 1, titulo: "Prog 1" },
        { id: "p2", numero: 2, titulo: "Prog 2" },
      ],
      error: null,
    });

    mockGetSupabaseServer.mockResolvedValue(
      makeSb((table) => (table === "uac" ? uacChain : progChain))
    );

    const result = await getProgresionesDeUAC("LC-I");

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ numero: 1 });
    expect(result[1]).toMatchObject({ numero: 2 });
  });

  test("UAC no existe → devuelve []", async () => {
    const uacChain = makeChain({ data: null, error: null });
    const progChain = makeChain({ data: [], error: null });

    mockGetSupabaseServer.mockResolvedValue(
      makeSb((table) => (table === "uac" ? uacChain : progChain))
    );

    const result = await getProgresionesDeUAC("NO-EXISTE");

    expect(result).toEqual([]);
    // No debe consultar progresiones si no hay UAC
    expect(progChain.select).not.toHaveBeenCalled();
  });

  test("UAC existe pero sin progresiones → devuelve []", async () => {
    const uacChain = makeChain({ data: { id: "uac-uuid-2" }, error: null });
    const progChain = makeChain({ data: null, error: null });

    mockGetSupabaseServer.mockResolvedValue(
      makeSb((table) => (table === "uac" ? uacChain : progChain))
    );

    const result = await getProgresionesDeUAC("CNEYT-I");

    expect(result).toEqual([]);
  });

  test("consulta uac con el código correcto", async () => {
    const uacChain = makeChain({ data: null, error: null });
    mockGetSupabaseServer.mockResolvedValue(
      makeSb(() => uacChain)
    );

    await getProgresionesDeUAC("PM-III");

    expect(uacChain.eq).toHaveBeenCalledWith("codigo", "PM-III");
  });

  test("ordena progresiones por numero", async () => {
    const uacChain = makeChain({ data: { id: "x" }, error: null });
    const progChain = makeChain({ data: [], error: null });

    mockGetSupabaseServer.mockResolvedValue(
      makeSb((table) => (table === "uac" ? uacChain : progChain))
    );

    await getProgresionesDeUAC("LC-I");

    expect(progChain.order).toHaveBeenCalledWith("numero");
  });
});

// ── getUACIdPorCodigo ───────────────────────────────────────────────────────

describe("getUACIdPorCodigo", () => {
  test("happy path: devuelve el id de la UAC", async () => {
    const chain = makeChain({ data: { id: "uuid-abc" }, error: null });
    mockGetSupabaseServer.mockResolvedValue(makeSb(() => chain));

    const result = await getUACIdPorCodigo("HUM-I");

    expect(result).toBe("uuid-abc");
  });

  test("UAC no encontrada → devuelve null", async () => {
    const chain = makeChain({ data: null, error: null });
    mockGetSupabaseServer.mockResolvedValue(makeSb(() => chain));

    const result = await getUACIdPorCodigo("INVALIDA");

    expect(result).toBeNull();
  });

  test("consulta con el código correcto", async () => {
    const chain = makeChain({ data: { id: "x" }, error: null });
    mockGetSupabaseServer.mockResolvedValue(makeSb(() => chain));

    await getUACIdPorCodigo("CS-III");

    expect(chain.eq).toHaveBeenCalledWith("codigo", "CS-III");
  });
});
