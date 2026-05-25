/**
 * @jest-environment node
 */
import {
  getGruposDocente,
  getMetricasDocente,
  getAlumnosConProgreso,
  getUACsConCompletionGrupo,
  getActividadesDificiles,
  getAlumnosEnRiesgo,
  getTopAlumnosDocente,
  getAlumnoDetalle,
  getUACsForSemestre,
  getProgresionesAlumno,
} from "../docente";

jest.mock("@/lib/supabase-helpers", () => ({
  getSupabaseServer: jest.fn(),
}));

import { getSupabaseServer } from "@/lib/supabase-helpers";

const mockGetSupabaseServer = getSupabaseServer as jest.MockedFunction<
  typeof getSupabaseServer
>;

// ── Helpers de mocking ───────────────────────────────────────────────────────

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

// Builder genérico para mocks con cadena más compleja
function makeChain(result: unknown) {
  const resolved = Promise.resolve(result);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c: Record<string | symbol, any> = {};
  c.select = jest.fn(() => c);
  c.eq = jest.fn(() => c);
  c.in = jest.fn(() => c);
  c.is = jest.fn(() => c);
  c.gte = jest.fn(() => c);
  c.order = jest.fn(() => c);
  c.limit = jest.fn(() => c);
  c.maybeSingle = jest.fn(() => resolved);
  // also allow awaiting directly (for .in() terminal)
  c.then = resolved.then.bind(resolved);
  c[Symbol.toStringTag] = "Promise";
  return c;
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

// ── getAlumnosConProgreso ───────────────────────────────────────────────────

describe("getAlumnosConProgreso", () => {
  function makeSbAlumnosConProgreso(opts: {
    grupoValido: boolean;
    alumnos: Array<{ id: string; full_name: string; email: string }>;
    intentos: Array<{ user_id: string; score: number; tiempo_segundos: number; status: string; completed_at: string }>;
  }) {
    const grupoRes = opts.grupoValido ? { data: { id: "g1" }, error: null } : { data: null, error: null };
    const relacionesRes = { data: opts.alumnos.map((a) => ({ id_alumno: a.id })), error: null };
    const profilesRes = { data: opts.alumnos, error: null };
    const intentosRes = { data: opts.intentos, error: null };

    let callOrder = 0;
    const makeCallChain = (res: unknown) => {
      const resolved = Promise.resolve(res);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c: Record<string | symbol, any> = {};
      c.select = jest.fn(() => c);
      c.eq = jest.fn(() => c);
      c.in = jest.fn(() => c);
      c.maybeSingle = jest.fn(() => resolved);
      c.then = (resolved as Promise<unknown>).then.bind(resolved);
      return c;
    };

    // The queries fire in order: grupo check, relaciones, profiles, intentos
    const calls = [grupoRes, relacionesRes, profilesRes, intentosRes];
    return {
      from: jest.fn(() => {
        const res = calls[callOrder] ?? calls[calls.length - 1];
        callOrder++;
        return makeCallChain(res);
      }),
    } as unknown as Awaited<ReturnType<typeof getSupabaseServer>>;
  }

  test("retorna [] si el grupo no pertenece al docente", async () => {
    mockGetSupabaseServer.mockResolvedValue(
      makeSbAlumnosConProgreso({ grupoValido: false, alumnos: [], intentos: [] })
    );

    const result = await getAlumnosConProgreso("g-ajeno", "docente-x");
    expect(result).toEqual([]);
  });

  test("alumno sin intentos tiene actividades_completadas=0", async () => {
    mockGetSupabaseServer.mockResolvedValue(
      makeSbAlumnosConProgreso({
        grupoValido: true,
        alumnos: [{ id: "a1", full_name: "Ana López", email: "ana@test.com" }],
        intentos: [],
      })
    );

    const result = await getAlumnosConProgreso("g1", "docente-1");
    expect(result).toHaveLength(1);
    expect(result[0]!.actividades_completadas).toBe(0);
    expect(result[0]!.score_promedio).toBeNull();
  });
});

// ── getUACsConCompletionGrupo ───────────────────────────────────────────────

describe("getUACsConCompletionGrupo", () => {
  test("retorna [] si el grupo no existe", async () => {
    const noGrupoChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
    };
    const sb = {
      from: jest.fn(() => noGrupoChain),
    } as unknown as Awaited<ReturnType<typeof getSupabaseServer>>;
    mockGetSupabaseServer.mockResolvedValue(sb);

    const result = await getUACsConCompletionGrupo("g-inexistente");
    expect(result).toEqual([]);
  });

  test("UAC con semestre del grupo, sin alumnos → estado sin-datos", async () => {
    let call = 0;
    const responses = [
      { data: { semestre: 3 }, error: null },   // grupo
      { data: [{ id: "u1", codigo: "UAC-III-01", nombre: "UAC Test", semestre: 3, total_progresiones: 2 }], error: null }, // uacs
      { data: [], error: null },                  // alumnos_grupos (sin alumnos)
      { data: [{ id: "p1" }], error: null },     // progresiones
      { data: [{ id: "act1" }], error: null },   // actividades
    ];

    const makeC = (res: unknown) => {
      const resolved = Promise.resolve(res);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c: Record<string | symbol, any> = {};
      c.select = jest.fn(() => c);
      c.eq = jest.fn(() => c);
      c.in = jest.fn(() => c);
      c.order = jest.fn(() => c);
      c.maybeSingle = jest.fn(() => resolved);
      c.then = (resolved as Promise<unknown>).then.bind(resolved);
      return c;
    };

    const sb = {
      from: jest.fn(() => {
        const res = responses[call] ?? responses[responses.length - 1];
        call++;
        return makeC(res);
      }),
    } as unknown as Awaited<ReturnType<typeof getSupabaseServer>>;
    mockGetSupabaseServer.mockResolvedValue(sb);

    const result = await getUACsConCompletionGrupo("g1");
    // Con 0 alumnos → sin-datos
    expect(result).toHaveLength(1);
    expect(result[0]!.estado).toBe("sin-datos");
  });
});

// ── getActividadesDificiles ─────────────────────────────────────────────────

describe("getActividadesDificiles", () => {
  test("devuelve [] cuando no hay actividades con suficientes intentos", async () => {
    // Mock getActividadesStatsGrupo → vacío
    const responses = [
      { data: { semestre: 1 }, error: null },  // grupo check
      { data: [], error: null },                // alumnos_grupos
    ];
    let call = 0;
    const makeC = (res: unknown) => {
      const resolved = Promise.resolve(res);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c: Record<string | symbol, any> = {};
      c.select = jest.fn(() => c);
      c.eq = jest.fn(() => c);
      c.in = jest.fn(() => c);
      c.order = jest.fn(() => c);
      c.maybeSingle = jest.fn(() => resolved);
      c.then = (resolved as Promise<unknown>).then.bind(resolved);
      return c;
    };
    const sb = {
      from: jest.fn(() => {
        const r = responses[call] ?? responses[responses.length - 1];
        call++;
        return makeC(r);
      }),
    } as unknown as Awaited<ReturnType<typeof getSupabaseServer>>;
    mockGetSupabaseServer.mockResolvedValue(sb);

    const result = await getActividadesDificiles("g1", "docente-1");
    expect(result).toEqual([]);
  });

  test("filtra actividades con score_promedio < 50", async () => {
    // Usar un mock de getActividadesStatsGrupo directamente
    const mockStats = [
      {
        id: "act1", codigo: "CD-I-P01-A1", titulo: "Act difícil", tipo: "lectura",
        uac_codigo: "CD-I", uac_nombre: "CD Sem 1",
        total_intentos: 5, completadas: 5, score_promedio: 35, tiempo_promedio_min: 10,
        tasa_abandono: 0, ultima_actividad: null,
      },
      {
        id: "act2", codigo: "CD-I-P01-A2", titulo: "Act fácil", tipo: "lectura",
        uac_codigo: "CD-I", uac_nombre: "CD Sem 1",
        total_intentos: 5, completadas: 5, score_promedio: 85, tiempo_promedio_min: 8,
        tasa_abandono: 0, ultima_actividad: null,
      },
    ];

    // Inject the mock stats via the chain sequence
    const responses = [
      { data: { semestre: 1 }, error: null },
      { data: [{ id_alumno: "a1" }, { id_alumno: "a2" }], error: null },
      { data: [{ id: "u1", codigo: "CD-I", nombre: "CD Sem 1" }], error: null },
      { data: [{ id: "p1", uac_id: "u1" }], error: null },
      { data: mockStats.map((s) => ({ id: s.id, codigo: s.codigo, titulo: s.titulo, tipo: s.tipo, progresion_id: "p1" })), error: null },
      { data: mockStats.map((s) => ({ actividad_id: s.id, user_id: "a1", score: s.score_promedio, tiempo_segundos: 600, status: "completed", completed_at: null })), error: null },
    ];
    let call = 0;
    const makeC = (res: unknown) => {
      const resolved = Promise.resolve(res);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c: Record<string | symbol, any> = {};
      c.select = jest.fn(() => c);
      c.eq = jest.fn(() => c);
      c.in = jest.fn(() => c);
      c.order = jest.fn(() => c);
      c.maybeSingle = jest.fn(() => resolved);
      c.then = (resolved as Promise<unknown>).then.bind(resolved);
      return c;
    };
    const sb = {
      from: jest.fn(() => {
        const r = responses[call] ?? responses[responses.length - 1];
        call++;
        return makeC(r);
      }),
    } as unknown as Awaited<ReturnType<typeof getSupabaseServer>>;
    mockGetSupabaseServer.mockResolvedValue(sb);

    const result = await getActividadesDificiles("g1", "docente-1");
    // Solo la actividad con score < 50 debe aparecer
    expect(result.every((a) => a.score_promedio < 50 || a.tasa_abandono > 30)).toBe(true);
  });
});

// ── getAlumnosEnRiesgo ──────────────────────────────────────────────────────

describe("getAlumnosEnRiesgo", () => {
  test("retorna [] si el grupo no existe", async () => {
    const noGrupoChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
    };
    const sb = {
      from: jest.fn(() => noGrupoChain),
    } as unknown as Awaited<ReturnType<typeof getSupabaseServer>>;
    mockGetSupabaseServer.mockResolvedValue(sb);

    const result = await getAlumnosEnRiesgo("g-inexistente");
    expect(result).toEqual([]);
  });

  test("alumno con intento reciente NO aparece en riesgo", async () => {
    const ahora = new Date().toISOString();
    let call = 0;
    const responses = [
      { data: { nombre: "Grupo Test" }, error: null },   // grupo
      { data: [{ id_alumno: "a1" }], error: null },      // alumnos_grupos
      { data: [{ id: "a1", full_name: "Ana", email: "ana@t.com" }], error: null }, // profiles
      { data: [{ user_id: "a1", completed_at: ahora }], error: null },            // intentos recientes
      { data: [], error: null },                                                    // todos sus completados
    ];
    const makeC = (res: unknown) => {
      const resolved = Promise.resolve(res);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c: Record<string | symbol, any> = {};
      c.select = jest.fn(() => c);
      c.eq = jest.fn(() => c);
      c.in = jest.fn(() => c);
      c.gte = jest.fn(() => c);
      c.maybeSingle = jest.fn(() => resolved);
      c.then = (resolved as Promise<unknown>).then.bind(resolved);
      return c;
    };
    const sb = {
      from: jest.fn(() => {
        const r = responses[call] ?? responses[responses.length - 1];
        call++;
        return makeC(r);
      }),
    } as unknown as Awaited<ReturnType<typeof getSupabaseServer>>;
    mockGetSupabaseServer.mockResolvedValue(sb);

    const result = await getAlumnosEnRiesgo("g1");
    // Ana tiene intento reciente → no debe aparecer en riesgo
    expect(result.find((a) => a.id === "a1")).toBeUndefined();
  });
});

// ── getTopAlumnosDocente ────────────────────────────────────────────────────

describe("getTopAlumnosDocente", () => {
  function makeChainSeq(responses: unknown[]) {
    let call = 0;
    const makeC = (res: unknown) => {
      const resolved = Promise.resolve(res);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const c: Record<string | symbol, any> = {};
      c.select = jest.fn(() => c);
      c.eq = jest.fn(() => c);
      c.in = jest.fn(() => c);
      c.order = jest.fn(() => c);
      c.limit = jest.fn(() => c);
      c.maybeSingle = jest.fn(() => resolved);
      c.then = (resolved as Promise<unknown>).then.bind(resolved);
      return c;
    };
    return {
      from: jest.fn(() => {
        const r = responses[call] ?? responses[responses.length - 1];
        call++;
        return makeC(r);
      }),
    } as unknown as Awaited<ReturnType<typeof getSupabaseServer>>;
  }

  test("retorna [] si docente no tiene grupos", async () => {
    mockGetSupabaseServer.mockResolvedValue(
      makeChainSeq([{ data: [], error: null }])
    );
    const result = await getTopAlumnosDocente("docente-x");
    expect(result).toEqual([]);
  });

  test("ordena alumnos por score_total descendente", async () => {
    mockGetSupabaseServer.mockResolvedValue(
      makeChainSeq([
        { data: [{ id: "g1" }], error: null },                                           // grupos
        { data: [{ id_alumno: "a1" }, { id_alumno: "a2" }], error: null },              // alumnos_grupos
        { data: [{ id: "a1", full_name: "Ana", email: "ana@t.com" }, { id: "a2", full_name: "Bob", email: "bob@t.com" }], error: null }, // profiles
        { data: [
            { user_id: "a1", score: 80 }, { user_id: "a1", score: 90 },                // a1: 170 total
            { user_id: "a2", score: 95 },                                               // a2: 95 total
          ], error: null },                                                               // intentos
      ])
    );
    const result = await getTopAlumnosDocente("docente-1", 5);
    expect(result[0]?.id).toBe("a1");
    expect(result[0]?.score_total).toBe(170);
    expect(result[1]?.id).toBe("a2");
  });

  test("alumno sin intentos completados no aparece en top", async () => {
    mockGetSupabaseServer.mockResolvedValue(
      makeChainSeq([
        { data: [{ id: "g1" }], error: null },
        { data: [{ id_alumno: "a1" }], error: null },
        { data: [{ id: "a1", full_name: "Ana", email: "ana@t.com" }], error: null },
        { data: [], error: null }, // sin intentos
      ])
    );
    const result = await getTopAlumnosDocente("docente-1", 5);
    expect(result).toHaveLength(0);
  });
});

// ── getAlumnoDetalle ────────────────────────────────────────────────────────

describe("getAlumnoDetalle", () => {
  function makeChainSeq(responses: unknown[]) {
    let call = 0;
    const makeC = (res: unknown) => {
      const resolved = Promise.resolve(res);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const c: Record<string | symbol, any> = {};
      c.select = jest.fn(() => c);
      c.eq = jest.fn(() => c);
      c.in = jest.fn(() => c);
      c.order = jest.fn(() => c);
      c.limit = jest.fn(() => c);
      c.maybeSingle = jest.fn(() => resolved);
      c.then = (resolved as Promise<unknown>).then.bind(resolved);
      return c;
    };
    return {
      from: jest.fn(() => {
        const r = responses[call] ?? responses[responses.length - 1];
        call++;
        return makeC(r);
      }),
    } as unknown as Awaited<ReturnType<typeof getSupabaseServer>>;
  }

  test("retorna null si el perfil no existe", async () => {
    mockGetSupabaseServer.mockResolvedValue(
      makeChainSeq([{ data: null, error: null }])
    );
    const result = await getAlumnoDetalle("alumno-inexistente");
    expect(result).toBeNull();
  });

  test("calcula score_promedio y actividades_completadas correctamente", async () => {
    mockGetSupabaseServer.mockResolvedValue(
      makeChainSeq([
        { data: { id: "a1", full_name: "Ana", email: "ana@t.com" }, error: null },  // profile
        { data: [
            { id: "i1", actividad_id: "act1", score: 80, tiempo_segundos: 300, status: "completed", completed_at: "2026-01-01", started_at: "2026-01-01" },
            { id: "i2", actividad_id: "act2", score: 60, tiempo_segundos: 200, status: "completed", completed_at: "2026-01-02", started_at: "2026-01-02" },
          ], error: null },
        { data: [{ id: "act1", codigo: "A1", titulo: "Actividad 1" }, { id: "act2", codigo: "A2", titulo: "Actividad 2" }], error: null }, // actividades
      ])
    );
    const result = await getAlumnoDetalle("a1");
    expect(result).not.toBeNull();
    expect(result!.actividades_completadas).toBe(2);
    expect(result!.score_promedio).toBe(70);
    expect(result!.historial).toHaveLength(2);
  });
});

// ── getUACsForSemestre ──────────────────────────────────────────────────────

describe("getUACsForSemestre", () => {
  function makeSimpleChain(data: unknown) {
    const resolved = Promise.resolve({ data, error: null });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const c: Record<string | symbol, any> = {};
    c.select = jest.fn(() => c);
    c.eq = jest.fn(() => c);
    c.order = jest.fn(() => c);
    c.then = (resolved as Promise<unknown>).then.bind(resolved);
    return c;
  }

  test("retorna UACs del semestre solicitado", async () => {
    const uacs = [
      { id: "u1", codigo: "UAC-I-01", nombre: "UAC Uno", semestre: 1, total_progresiones: 3 },
      { id: "u2", codigo: "UAC-I-02", nombre: "UAC Dos", semestre: 1, total_progresiones: 4 },
    ];
    const sb = {
      from: jest.fn(() => makeSimpleChain(uacs)),
    } as unknown as Awaited<ReturnType<typeof getSupabaseServer>>;
    mockGetSupabaseServer.mockResolvedValue(sb);

    const result = await getUACsForSemestre(1);
    expect(result).toHaveLength(2);
    expect(result[0]!.codigo).toBe("UAC-I-01");
  });

  test("retorna [] si no hay UACs para el semestre", async () => {
    const sb = {
      from: jest.fn(() => makeSimpleChain(null)),
    } as unknown as Awaited<ReturnType<typeof getSupabaseServer>>;
    mockGetSupabaseServer.mockResolvedValue(sb);

    const result = await getUACsForSemestre(9);
    expect(result).toEqual([]);
  });
});

// ── getProgresionesAlumno ───────────────────────────────────────────────────

describe("getProgresionesAlumno", () => {
  function makeChainSeq(responses: unknown[]) {
    let call = 0;
    const makeC = (res: unknown) => {
      const resolved = Promise.resolve(res);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const c: Record<string | symbol, any> = {};
      c.select = jest.fn(() => c);
      c.eq = jest.fn(() => c);
      c.in = jest.fn(() => c);
      c.order = jest.fn(() => c);
      c.maybeSingle = jest.fn(() => resolved);
      c.then = (resolved as Promise<unknown>).then.bind(resolved);
      return c;
    };
    return {
      from: jest.fn(() => {
        const r = responses[call] ?? responses[responses.length - 1];
        call++;
        return makeC(r);
      }),
    } as unknown as Awaited<ReturnType<typeof getSupabaseServer>>;
  }

  test("retorna [] si el grupo no existe", async () => {
    mockGetSupabaseServer.mockResolvedValue(
      makeChainSeq([{ data: null, error: null }])
    );
    const result = await getProgresionesAlumno("a1", "g-inexistente");
    expect(result).toEqual([]);
  });

  test("calcula pct_completion por progresion correctamente", async () => {
    mockGetSupabaseServer.mockResolvedValue(
      makeChainSeq([
        { data: { semestre: 1 }, error: null },                                         // grupo
        { data: [{ id: "u1", codigo: "UAC-I-01" }], error: null },                      // uacs
        { data: [{ id: "p1", codigo: "P1", numero: 1, titulo: "Prog 1", uac_id: "u1" }], error: null }, // progresiones
        { data: [{ id: "act1" }, { id: "act2" }], error: null },                         // actividades (2 total)
        { data: null, count: 1, error: null },                                           // intentos completados (1 de 2)
      ])
    );
    const result = await getProgresionesAlumno("a1", "g1");
    expect(result).toHaveLength(1);
    expect(result[0]!.total_actividades).toBe(2);
  });
});
