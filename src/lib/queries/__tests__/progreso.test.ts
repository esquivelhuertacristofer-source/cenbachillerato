/**
 * @jest-environment node
 *
 * getResumenActividadAlumno — contrato de egress acotado:
 *   · recientes con .limit() y calendario con .gte() (nunca historial completo)
 *   · stats vía RPC resumen_stats_alumno SIN pasar user_id (auth.uid() adentro)
 *   · fallback legacy en memoria SOLO si la RPC no existe aún (PGRST202/42883),
 *     con console.warn una única vez por instancia.
 */
import { getResumenActividadAlumno } from "../progreso";

jest.mock("@/lib/supabase-helpers", () => ({
  getSupabaseServer: jest.fn(),
}));

import { getSupabaseServer } from "@/lib/supabase-helpers";

const mockGetSupabaseServer = getSupabaseServer as jest.MockedFunction<
  typeof getSupabaseServer
>;

// ── Helpers de mocking ───────────────────────────────────────────────────────

// Cadena awaitable estilo PostgREST: cada método devuelve la cadena y el await
// resuelve al resultado (mismo patrón thenable que docente.test.ts).
function makeChain(result: { data: unknown; error?: unknown }) {
  const resolved = Promise.resolve({ error: null, ...result });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c: Record<string | symbol, any> = {};
  for (const m of ["select", "eq", "not", "gte", "order", "limit", "in"]) {
    c[m] = jest.fn(() => c);
  }
  c.then = resolved.then.bind(resolved);
  return c;
}

function makeSb(opts: {
  recientes?: unknown[];
  calendario?: unknown[];
  rpc?: { data?: unknown; error?: unknown };
  legacy?: unknown[];
}) {
  const recChain = makeChain({ data: opts.recientes ?? [] });
  const calChain = makeChain({ data: opts.calendario ?? [] });
  const legacyChain = makeChain({ data: opts.legacy ?? [] });
  // Orden de construcción determinista dentro del Promise.all del código:
  // 1.º recientes, 2.º calendario; el 3.º from() solo ocurre en el fallback.
  const from = jest
    .fn()
    .mockReturnValueOnce(recChain)
    .mockReturnValueOnce(calChain)
    .mockReturnValue(legacyChain);
  const rpc = jest.fn(() =>
    Promise.resolve({ data: null, error: null, ...(opts.rpc ?? {}) })
  );
  const sb = { from, rpc } as unknown as Awaited<ReturnType<typeof getSupabaseServer>>;
  return { sb, recChain, calChain, legacyChain, from, rpc };
}

const hoyIso = () => new Date().toISOString();

// ── getResumenActividadAlumno ────────────────────────────────────────────────

describe("getResumenActividadAlumno", () => {
  test("con RPC disponible: deriva recientes/calendario y usa las stats de la RPC", async () => {
    const statsRpc = {
      totalActividades: 42,
      totalMinutos: 210,
      materiaMasFuerte: { nombre: "Pensamiento Matemático V", cantidad: 12 },
      tipoActividades: [{ tipo: "lectura", cantidad: 9 }],
    };
    const { sb, recChain, calChain, from, rpc } = makeSb({
      recientes: [
        {
          id: "i1",
          completed_at: hoyIso(),
          actividades: {
            titulo: "Derivadas en contexto",
            tipo_codigo: "lectura",
            progresiones: { uac: { codigo: "PM-V" } },
          },
        },
      ],
      calendario: [
        {
          completed_at: hoyIso(),
          actividades: { progresiones: { uac: { codigo: "PM-V" } } },
        },
      ],
      rpc: { data: statsRpc },
    });
    mockGetSupabaseServer.mockResolvedValueOnce(sb);

    const res = await getResumenActividadAlumno("alumno-1", 15);

    // Stats: tal cual las reporta la RPC.
    expect(res.stats).toEqual(statsRpc);

    // Recientes: mapeo a la forma que pinta la página (sin uacNombre ni UUIDs).
    expect(res.recientes).toHaveLength(1);
    expect(res.recientes[0]).toMatchObject({
      id: "i1",
      titulo: "Derivadas en contexto",
      tipo: "lectura",
      uacCodigo: "PM-V",
      rscCodigo: "RSC-PM", // derivado de UAC_BASE por codigo
    });

    // Calendario: 30 días, el de hoy activo y coloreado por la UAC.
    expect(res.calendario).toHaveLength(30);
    const hoy = res.calendario[res.calendario.length - 1]!;
    expect(hoy.activo).toBe(true);
    expect(hoy.rscCodigo).toBe("RSC-PM");

    // Contrato anti-egress: recientes acotadas y calendario con ventana .gte().
    expect(recChain.limit).toHaveBeenCalledWith(15);
    expect(calChain.gte).toHaveBeenCalledWith(
      "completed_at",
      expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/)
    );

    // La RPC se llama SIN user_id (auth.uid() decide adentro) y no hay
    // tercera consulta legacy cuando la RPC responde bien.
    expect(rpc).toHaveBeenCalledWith("resumen_stats_alumno");
    expect(from).toHaveBeenCalledTimes(2);
  });

  test("RPC inexistente (PGRST202): cae al cálculo legacy y avisa UNA sola vez", async () => {
    const legacyRows = [
      {
        completed_at: hoyIso(),
        actividades: {
          tipo_codigo: "lectura",
          duracion_estimada_minutos: null, // → cuenta como 5 min (el "?? 5")
          progresiones: { uac: { codigo: "PM-V", nombre: "Pensamiento Matemático V" } },
        },
      },
      {
        completed_at: hoyIso(),
        actividades: {
          tipo_codigo: "lectura",
          duracion_estimada_minutos: 10,
          progresiones: { uac: { codigo: "PM-V", nombre: "Pensamiento Matemático V" } },
        },
      },
      {
        completed_at: hoyIso(),
        actividades: {
          tipo_codigo: "quiz_multiple_opcion",
          duracion_estimada_minutos: 20,
          progresiones: { uac: { codigo: "LC-I", nombre: "Lengua y Comunicación I" } },
        },
      },
    ];
    const rpcError = {
      error: {
        code: "PGRST202",
        message: "Could not find the function public.resumen_stats_alumno",
      },
    };
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    const primera = makeSb({ rpc: rpcError, legacy: legacyRows });
    mockGetSupabaseServer.mockResolvedValueOnce(primera.sb);
    const res = await getResumenActividadAlumno("alumno-1");

    expect(res.stats).toEqual({
      totalActividades: 3,
      totalMinutos: 35, // 5 (null→5) + 10 + 20
      materiaMasFuerte: { nombre: "Pensamiento Matemático V", cantidad: 2 },
      tipoActividades: [
        { tipo: "lectura", cantidad: 2 },
        { tipo: "quiz_multiple_opcion", cantidad: 1 },
      ],
    });
    // Hubo tercera consulta (el historial legacy) además de recientes+calendario.
    expect(primera.from).toHaveBeenCalledTimes(3);

    // Segunda carga con la RPC aún ausente: NO debe volver a avisar.
    const segunda = makeSb({ rpc: rpcError, legacy: legacyRows });
    mockGetSupabaseServer.mockResolvedValueOnce(segunda.sb);
    await getResumenActividadAlumno("alumno-1");

    expect(warnSpy).toHaveBeenCalledTimes(1);
    warnSpy.mockRestore();
  });

  test("otro error de la RPC (no 'inexistente'): stats vacías SIN bajar historial", async () => {
    const { sb, from } = makeSb({
      rpc: { error: { code: "57014", message: "canceling statement due to timeout" } },
    });
    mockGetSupabaseServer.mockResolvedValueOnce(sb);

    const res = await getResumenActividadAlumno("alumno-1");

    expect(res.stats).toEqual({
      materiaMasFuerte: null,
      tipoActividades: [],
      totalMinutos: 0,
      totalActividades: 0,
    });
    // Sin fallback: no debe existir una tercera consulta con el historial.
    expect(from).toHaveBeenCalledTimes(2);
  });

  test("fallo total (getSupabaseServer lanza): forma vacía estable", async () => {
    mockGetSupabaseServer.mockRejectedValueOnce(new Error("boom"));

    const res = await getResumenActividadAlumno("alumno-1");

    expect(res.recientes).toEqual([]);
    expect(res.calendario).toHaveLength(30);
    expect(res.calendario.every((d) => !d.activo && d.rscCodigo === null)).toBe(true);
    expect(res.stats).toEqual({
      materiaMasFuerte: null,
      tipoActividades: [],
      totalMinutos: 0,
      totalActividades: 0,
    });
  });

  test("blindaje de la RPC: payload parcial no rompe la forma de EstadisticasProgreso", async () => {
    // jsonb inesperado (claves ausentes): normalizarStatsRpc rellena defaults.
    const { sb } = makeSb({ rpc: { data: { totalMinutos: 90 } } });
    mockGetSupabaseServer.mockResolvedValueOnce(sb);

    const res = await getResumenActividadAlumno("alumno-1");

    expect(res.stats).toEqual({
      materiaMasFuerte: null,
      tipoActividades: [],
      totalMinutos: 90,
      totalActividades: 0,
    });
  });
});
