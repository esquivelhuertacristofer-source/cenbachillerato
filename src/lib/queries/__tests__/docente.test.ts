/**
 * @jest-environment node
 */
import { getGruposDocente, getMetricasDocente } from "../docente";

jest.mock("@/lib/supabase-helpers", () => ({
  getSupabaseServer: jest.fn(),
}));

import { getSupabaseServer } from "@/lib/supabase-helpers";

const mockGetSupabaseServer = getSupabaseServer as jest.MockedFunction<
  typeof getSupabaseServer
>;

// Chain where .eq() is the terminal awaitable
function makeEqChain(result: { data?: unknown; error?: unknown; count?: number | null }) {
  const resolved = Promise.resolve(result);
  const chain: Record<string, jest.Mock> = {};
  chain.select = jest.fn(() => chain);
  chain.eq = jest.fn(() => resolved);
  return chain;
}

function makeSbDocente(
  grupos: Array<{ id: string; nombre: string; semestre: number }>,
  alumnosPorGrupo: number
) {
  const gruposChain = makeEqChain({ data: grupos, error: null });
  const alumnosChain = makeEqChain({ count: alumnosPorGrupo, data: null, error: null });

  return {
    from: jest.fn((table: string) =>
      table === "grupos" ? gruposChain : alumnosChain
    ),
  } as unknown as Awaited<ReturnType<typeof getSupabaseServer>>;
}

// ── getGruposDocente ────────────────────────────────────────────────────────

describe("getGruposDocente", () => {
  test("happy path: devuelve grupos con total_alumnos correcto", async () => {
    const grupos = [
      { id: "g1", nombre: "Grupo A", semestre: 1 },
      { id: "g2", nombre: "Grupo B", semestre: 2 },
    ];
    mockGetSupabaseServer.mockResolvedValue(makeSbDocente(grupos, 25));

    const result = await getGruposDocente("docente-uuid-1");

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ id: "g1", nombre: "Grupo A", total_alumnos: 25 });
    expect(result[1]).toMatchObject({ id: "g2", nombre: "Grupo B", total_alumnos: 25 });
  });

  test("sin grupos → devuelve []", async () => {
    mockGetSupabaseServer.mockResolvedValue(makeSbDocente([], 0));

    const result = await getGruposDocente("docente-uuid-2");

    expect(result).toEqual([]);
  });

  test("grupos con data null → devuelve []", async () => {
    const gruposChain = makeEqChain({ data: null, error: null });
    const sb = {
      from: jest.fn(() => gruposChain),
    } as unknown as Awaited<ReturnType<typeof getSupabaseServer>>;
    mockGetSupabaseServer.mockResolvedValue(sb);

    const result = await getGruposDocente("docente-uuid-3");

    expect(result).toEqual([]);
  });

  test("consulta grupos con el docente_id correcto", async () => {
    const gruposChain = makeEqChain({ data: [], error: null });
    const sb = {
      from: jest.fn(() => gruposChain),
    } as unknown as Awaited<ReturnType<typeof getSupabaseServer>>;
    mockGetSupabaseServer.mockResolvedValue(sb);

    await getGruposDocente("docente-abc");

    expect(gruposChain.eq).toHaveBeenCalledWith("id_docente", "docente-abc");
  });

  test("count null → total_alumnos es 0", async () => {
    const grupos = [{ id: "g1", nombre: "Grupo A", semestre: 1 }];
    const gruposChain = makeEqChain({ data: grupos, error: null });
    const alumnosChain = makeEqChain({ count: null, data: null, error: null });

    const sb = {
      from: jest.fn((table: string) =>
        table === "grupos" ? gruposChain : alumnosChain
      ),
    } as unknown as Awaited<ReturnType<typeof getSupabaseServer>>;
    mockGetSupabaseServer.mockResolvedValue(sb);

    const result = await getGruposDocente("docente-uuid-4");

    expect(result[0]?.total_alumnos).toBe(0);
  });
});

// ── getMetricasDocente ──────────────────────────────────────────────────────

describe("getMetricasDocente", () => {
  test("agrega totalAlumnos de todos los grupos", async () => {
    const grupos = [
      { id: "g1", nombre: "A", semestre: 1 },
      { id: "g2", nombre: "B", semestre: 2 },
      { id: "g3", nombre: "C", semestre: 2 },
    ];
    mockGetSupabaseServer.mockResolvedValue(makeSbDocente(grupos, 10));

    const result = await getMetricasDocente("docente-uuid-5");

    expect(result.totalGrupos).toBe(3);
    expect(result.totalAlumnos).toBe(30);
  });

  test("uacEnCurso cuenta semestres únicos", async () => {
    const grupos = [
      { id: "g1", nombre: "A", semestre: 2 },
      { id: "g2", nombre: "B", semestre: 2 },
      { id: "g3", nombre: "C", semestre: 3 },
    ];
    mockGetSupabaseServer.mockResolvedValue(makeSbDocente(grupos, 5));

    const result = await getMetricasDocente("docente-uuid-6");

    expect(result.uacEnCurso).toBe(2);
  });

  test("sin grupos → métricas en cero", async () => {
    mockGetSupabaseServer.mockResolvedValue(makeSbDocente([], 0));

    const result = await getMetricasDocente("docente-uuid-7");

    expect(result.totalGrupos).toBe(0);
    expect(result.totalAlumnos).toBe(0);
    expect(result.uacEnCurso).toBe(0);
    expect(result.grupos).toEqual([]);
  });

  test("devuelve los grupos en el resultado", async () => {
    const grupos = [{ id: "g1", nombre: "G1", semestre: 1 }];
    mockGetSupabaseServer.mockResolvedValue(makeSbDocente(grupos, 7));

    const result = await getMetricasDocente("docente-uuid-8");

    expect(result.grupos).toHaveLength(1);
    expect(result.grupos[0]).toMatchObject({ id: "g1", total_alumnos: 7 });
  });
});
