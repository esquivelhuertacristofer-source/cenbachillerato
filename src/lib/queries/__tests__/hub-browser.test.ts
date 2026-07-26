/**
 * @jest-environment node
 *
 * Tests del núcleo consolidado de hub-browser (anti-cascada N×4): las 3
 * queries por carga (progresiones+join uac, actividades, intentos) que
 * comparten las tarjetas de UAC, el héroe y los tiles de recursos, y la
 * reconstrucción EN MEMORIA de los conteos que antes hacía cada cascada.
 */

jest.mock("@supabase/ssr", () => ({
  createBrowserClient: jest.fn(),
}));

import { createBrowserClient } from "@supabase/ssr";
import {
  getProgresionesCompletadasDeUAC,
  getProgresoSemestreBrowser,
  getProgresoRecursosSemestre,
  getUltimaActividadActivaBrowser,
  limpiarCacheDatosSemestre,
} from "../hub-browser";
import { CATEGORIA_COMPLEMENTO } from "@/lib/mccems/categorias";

const mockCreateBrowserClient = createBrowserClient as jest.Mock;

// ── Helpers de mocking ───────────────────────────────────────────────────────

type Resultado = { data: unknown; error: unknown };

function ok(data: unknown): Resultado {
  return { data, error: null };
}

/** Builder encadenable que imita al de supabase-js (thenable: se puede await). */
function makeQuery(resultado: Resultado) {
  const resuelto = Promise.resolve(resultado);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const q: Record<string, any> = {};
  for (const m of ["select", "eq", "in", "order", "limit", "not"]) {
    q[m] = jest.fn(() => q);
  }
  q.maybeSingle = jest.fn(() => resuelto);
  q.single = jest.fn(() => resuelto);
  q.then = resuelto.then.bind(resuelto);
  return q;
}

/**
 * Cliente falso: cada tabla tiene una cola FIFO de resultados (para funciones
 * que consultan la misma tabla varias veces); el último resultado se repite.
 */
function makeSb(tablas: Record<string, Resultado | Resultado[]>) {
  const pendientes: Record<string, Resultado[]> = {};
  for (const [tabla, r] of Object.entries(tablas)) {
    pendientes[tabla] = Array.isArray(r) ? [...r] : [r];
  }
  const queries: Record<string, ReturnType<typeof makeQuery>[]> = {};
  const from = jest.fn((tabla: string) => {
    const cola = pendientes[tabla] ?? [];
    const resultado =
      cola.length > 1 ? cola.shift()! : cola[0] ?? { data: [], error: null };
    const q = makeQuery(resultado);
    (queries[tabla] ??= []).push(q);
    return q;
  });
  return { sb: { from }, from, queries };
}

// ── Escenario base (semestre 1: PM-I y LC-I existen en el catálogo) ──────────
//
// p1 (PM-I, oficial)      → a1, a2  (ambas completadas)
// p2 (PM-I, complemento)  → a3      (no cuenta para el avance)
// p3 (LC-I, oficial)      → a4      (solo in_progress)
// p4 (LC-I, oficial)      → sin actividades (nunca cuenta como completada)

const PROGS = [
  { id: "p1", categoria: "Cat A", uac: { codigo: "PM-I" } },
  { id: "p2", categoria: CATEGORIA_COMPLEMENTO, uac: { codigo: "PM-I" } },
  { id: "p3", categoria: null, uac: { codigo: "LC-I" } },
  { id: "p4", categoria: null, uac: { codigo: "LC-I" } },
];

const ACTS = [
  { id: "a1", progresion_id: "p1", tipo: "lectura" },
  { id: "a2", progresion_id: "p1", tipo: "quiz_multiple_opcion" },
  { id: "a3", progresion_id: "p2", tipo: "lectura" },
  { id: "a4", progresion_id: "p3", tipo: "lectura" },
];

// Como los devuelve la query: ordenados por started_at DESC.
const INTENTOS = [
  { actividad_id: "a4", status: "in_progress", started_at: "2026-07-16T12:00:00Z" },
  { actividad_id: "a2", status: "completed", started_at: "2026-07-15T10:00:00Z" },
  { actividad_id: "a1", status: "completed", started_at: "2026-07-14T09:00:00Z" },
];

function makeSbSemestre() {
  return makeSb({
    progresiones: ok(PROGS),
    actividades: ok(ACTS),
    intentos: ok(INTENTOS),
  });
}

beforeEach(() => {
  // La caché es del módulo: sin limpiar, un test contaminaría al siguiente.
  limpiarCacheDatosSemestre();
  mockCreateBrowserClient.mockReset();
});

// ── getProgresionesCompletadasDeUAC ──────────────────────────────────────────

describe("getProgresionesCompletadasDeUAC", () => {
  test("reconstruye conteos por UAC: oficiales, completadas y ultimaActividad", async () => {
    const { sb } = makeSbSemestre();
    mockCreateBrowserClient.mockReturnValue(sb);

    const pm = await getProgresionesCompletadasDeUAC("PM-I", "u1");
    // p2 es complemento → total 1; a1+a2 completadas → p1 completada.
    // ultimaActividad = intento más reciente que toque a1/a2 (el de a2).
    expect(pm).toEqual({
      completadas: 1,
      total: 1,
      ultimaActividad: "2026-07-15T10:00:00Z",
    });

    const lc = await getProgresionesCompletadasDeUAC("LC-I", "u1");
    // p3 y p4 oficiales → total 2; a4 solo in_progress y p4 sin actividades
    // → 0 completadas; el in_progress de a4 sí marca ultimaActividad.
    expect(lc).toEqual({
      completadas: 0,
      total: 2,
      ultimaActividad: "2026-07-16T12:00:00Z",
    });
  });

  test("UAC sin filas en BD → ceros (misma forma pública que antes)", async () => {
    const { sb } = makeSbSemestre();
    mockCreateBrowserClient.mockReturnValue(sb);

    // CS-I es semestre 1 en el catálogo pero no viene en PROGS (BD manda).
    const r = await getProgresionesCompletadasDeUAC("CS-I", "u1");
    expect(r).toEqual({ completadas: 0, total: 0, ultimaActividad: null });
  });

  test("código fuera del catálogo estático → carga puntual por uac.codigo", async () => {
    const { sb, queries } = makeSb({
      progresiones: ok([{ id: "p9", categoria: null, uac: { codigo: "ZZ-99" } }]),
      actividades: ok([{ id: "a9", progresion_id: "p9", tipo: "lectura" }]),
      intentos: ok([
        { actividad_id: "a9", status: "completed", started_at: "2026-07-10T08:00:00Z" },
      ]),
    });
    mockCreateBrowserClient.mockReturnValue(sb);

    const r = await getProgresionesCompletadasDeUAC("ZZ-99", "u1");
    expect(r).toEqual({
      completadas: 1,
      total: 1,
      ultimaActividad: "2026-07-10T08:00:00Z",
    });
    // El fallback filtra por código de UAC, no por semestre.
    expect(queries.progresiones?.[0]?.eq).toHaveBeenCalledWith("uac.codigo", "ZZ-99");
  });
});

// ── Consolidación: 3 queries por carga, compartidas ──────────────────────────

describe("consolidación de queries del hub", () => {
  test("tarjetas de UAC + héroe + tiles comparten 3 queries en total", async () => {
    const { sb, from, queries } = makeSbSemestre();
    mockCreateBrowserClient.mockReturnValue(sb);

    // Simula la carga real del hub: todo concurrente (Promise.allSettled).
    await Promise.all([
      getProgresoSemestreBrowser("u1", 1),
      getProgresionesCompletadasDeUAC("PM-I", "u1"),
      getProgresionesCompletadasDeUAC("LC-I", "u1"),
      getProgresoRecursosSemestre("u1", 1),
    ]);

    // Antes: ~4 queries POR UAC + 4 del héroe + 4 de tiles. Ahora: 3 totales.
    expect(from).toHaveBeenCalledTimes(3);
    expect(queries.progresiones).toHaveLength(1);
    expect(queries.actividades).toHaveLength(1);
    expect(queries.intentos).toHaveLength(1);

    // La query de progresiones filtra por semestre vía el join con uac.
    expect(queries.progresiones?.[0]?.eq).toHaveBeenCalledWith("es_placeholder", false);
    expect(queries.progresiones?.[0]?.eq).toHaveBeenCalledWith("uac.semestre", 1);
  });

  test("los intentos se piden por user_id SIN .in(actividad_id, [...])", async () => {
    const { sb, queries } = makeSbSemestre();
    mockCreateBrowserClient.mockReturnValue(sb);

    await getProgresoSemestreBrowser("u1", 1);

    const intentosQuery = queries.intentos?.[0];
    // Sin .in(): cientos de UUIDs reventarían el límite de URL de PostgREST.
    expect(intentosQuery?.in).not.toHaveBeenCalled();
    expect(intentosQuery?.eq).toHaveBeenCalledWith("user_id", "u1");
    expect(intentosQuery?.select).toHaveBeenCalledWith(
      "actividad_id, status, started_at, tiempo_segundos"
    );
  });

  test("limpiarCacheDatosSemestre fuerza un refetch en la siguiente carga", async () => {
    const { sb, from } = makeSbSemestre();
    mockCreateBrowserClient.mockReturnValue(sb);

    await getProgresoSemestreBrowser("u1", 1);
    expect(from).toHaveBeenCalledTimes(3);

    limpiarCacheDatosSemestre();
    await getProgresoSemestreBrowser("u1", 1);
    expect(from).toHaveBeenCalledTimes(6);
  });

  test("un error en las queries devuelve ceros y NO se cachea", async () => {
    const { sb, from } = makeSb({
      progresiones: { data: null, error: { message: "boom" } },
      intentos: ok([]),
    });
    mockCreateBrowserClient.mockReturnValue(sb);

    const r1 = await getProgresoSemestreBrowser("u1", 1);
    expect(r1).toEqual({
      totalProgresiones: 0,
      progresionesCompletadas: 0,
      actividadesEstaSemana: 0,
      minutosEstaSemana: 0,
      porcentaje: 0,
    });
    // Sin progresiones no se lanza la query de actividades: 2 requests.
    expect(from).toHaveBeenCalledTimes(2);

    // La siguiente carga reintenta (el fallo no quedó congelado en la caché).
    await getProgresoSemestreBrowser("u1", 1);
    expect(from).toHaveBeenCalledTimes(4);
  });
});

// ── getProgresoSemestreBrowser ───────────────────────────────────────────────

describe("getProgresoSemestreBrowser", () => {
  test("cuenta solo progresiones oficiales con TODAS sus actividades completadas", async () => {
    const { sb } = makeSbSemestre();
    mockCreateBrowserClient.mockReturnValue(sb);

    const r = await getProgresoSemestreBrowser("u1", 1);
    // Oficiales: p1, p3, p4 (p2 es complemento). Completada: solo p1.
    // p4 no tiene actividades → no cuenta como completada.
    // (Las métricas "esta semana" tienen su propio test determinista abajo; los
    //  intentos de este escenario son históricos y quedan fuera de la ventana.)
    expect(r).toMatchObject({
      totalProgresiones: 3,
      progresionesCompletadas: 1,
      porcentaje: 33,
    });
  });

  test("semestre sin progresiones → ceros", async () => {
    const { sb } = makeSb({ progresiones: ok([]), intentos: ok([]) });
    mockCreateBrowserClient.mockReturnValue(sb);

    const r = await getProgresoSemestreBrowser("u1", 1);
    expect(r).toEqual({
      totalProgresiones: 0,
      progresionesCompletadas: 0,
      actividadesEstaSemana: 0,
      minutosEstaSemana: 0,
      porcentaje: 0,
    });
  });

  test("actividadesEstaSemana / minutosEstaSemana: solo completadas OFICIALES desde el domingo", async () => {
    // Reloj fijo (viernes) para que la ventana "esta semana" (domingo 00:00) sea
    // determinista sin importar cuándo corra la suite. La semana arranca el
    // domingo 2026-07-19.
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-07-24T12:00:00Z"));
    try {
      const intentos = [
        // a2 (p1, oficial) completada esta semana, 30 min → cuenta.
        { actividad_id: "a2", status: "completed", started_at: "2026-07-20T10:00:00Z", tiempo_segundos: 1800 },
        // a1 (p1, oficial) completada esta semana, 15 min → cuenta.
        { actividad_id: "a1", status: "completed", started_at: "2026-07-21T09:00:00Z", tiempo_segundos: 900 },
        // a4 (p3, oficial) pero in_progress → NO cuenta.
        { actividad_id: "a4", status: "in_progress", started_at: "2026-07-22T09:00:00Z", tiempo_segundos: 600 },
        // a3 (p2, complemento) completada esta semana → NO cuenta (no oficial).
        { actividad_id: "a3", status: "completed", started_at: "2026-07-22T09:00:00Z", tiempo_segundos: 600 },
        // a1 completada la SEMANA PASADA → NO cuenta (fuera de la ventana).
        { actividad_id: "a1", status: "completed", started_at: "2026-07-15T09:00:00Z", tiempo_segundos: 9999 },
      ];
      const { sb } = makeSb({ progresiones: ok(PROGS), actividades: ok(ACTS), intentos: ok(intentos) });
      mockCreateBrowserClient.mockReturnValue(sb);

      const r = await getProgresoSemestreBrowser("u1", 1);
      expect(r.actividadesEstaSemana).toBe(2);
      expect(r.minutosEstaSemana).toBe(45); // (1800 + 900) / 60
    } finally {
      jest.useRealTimers();
    }
  });
});

// ── getProgresoRecursosSemestre ──────────────────────────────────────────────

describe("getProgresoRecursosSemestre", () => {
  test("agrupa por tipo incluyendo complementos, con completadas del usuario", async () => {
    const { sb } = makeSbSemestre();
    mockCreateBrowserClient.mockReturnValue(sb);

    const r = await getProgresoRecursosSemestre("u1", 1);
    const porTipo = new Map(r.map((t) => [t.tipo, t]));
    // Lecturas: a1 (completada), a3 (complemento, cuenta), a4 → total 3, done 1.
    expect(porTipo.get("lectura")).toEqual({ tipo: "lectura", total: 3, completadas: 1 });
    // Quiz: a2 completada → total 1, done 1.
    expect(porTipo.get("quiz_multiple_opcion")).toEqual({
      tipo: "quiz_multiple_opcion",
      total: 1,
      completadas: 1,
    });
  });

  test("tipos desconocidos colapsan en 'otro'", async () => {
    const { sb } = makeSb({
      progresiones: ok([{ id: "p1", categoria: null, uac: { codigo: "PM-I" } }]),
      actividades: ok([{ id: "a1", progresion_id: "p1", tipo: "tipo-raro" }]),
      intentos: ok([]),
    });
    mockCreateBrowserClient.mockReturnValue(sb);

    const r = await getProgresoRecursosSemestre("u1", 1);
    expect(r).toEqual([{ tipo: "otro", total: 1, completadas: 0 }]);
  });

  test("sin actividades → []", async () => {
    const { sb } = makeSb({ progresiones: ok([]), intentos: ok([]) });
    mockCreateBrowserClient.mockReturnValue(sb);

    expect(await getProgresoRecursosSemestre("u1", 1)).toEqual([]);
  });
});

// ── getUltimaActividadActivaBrowser (cascada intacta, selects acotados) ──────

describe("getUltimaActividadActivaBrowser", () => {
  test("con intento en progreso arma la ContinuarData completa", async () => {
    const { sb } = makeSb({
      // 1.ª: intento in_progress; 2.ª: intentos completados de la progresión.
      intentos: [
        ok({ actividad_id: "a1" }),
        ok([{ actividad_id: "a1" }]),
      ],
      // 1.ª: detalle de la actividad; 2.ª: todas las de la progresión.
      actividades: [
        ok({ codigo: "PM-I-P1-A1", titulo: "Intro", tipo: "lectura", progresion_id: "p1" }),
        ok([{ id: "a1" }, { id: "a2" }]),
      ],
      progresiones: ok({ id: "p1", numero: 1, titulo: "Progresión 1", uac_id: "uac-pm" }),
      uac: ok({ codigo: "PM-I", nombre: "Pensamiento Matemático I" }),
    });
    mockCreateBrowserClient.mockReturnValue(sb);

    const r = await getUltimaActividadActivaBrowser("u1", 1);
    expect(r).toEqual({
      progresionId: "p1",
      progresionNumero: 1,
      progresionTitulo: "Progresión 1",
      uacCodigo: "PM-I",
      uacNombre: "Pensamiento Matemático I",
      uacRscCodigo: "RSC-PM",
      actividadOrden: 1,
      actividadTitulo: "Intro",
      actividadTipo: "lectura",
      actividadesCompletadas: 1,
      totalActividades: 2,
    });
  });
});
