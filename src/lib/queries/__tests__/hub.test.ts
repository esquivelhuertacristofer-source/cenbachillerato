/**
 * @jest-environment node
 *
 * getActividadConContenido — dos propiedades del runner de actividad:
 *
 * 1. QUERY EN 2 PASOS: resuelve el id de la actividad objetivo (por el
 *    sufijo -A{orden} del código) con una query LIGERA sin "contenido", y
 *    solo descarga "contenido" para ESA actividad — nunca el jsonb de todas
 *    las actividades de la progresión (ver comentario en hub.ts).
 * 2. MARCADOR __r2: cuando `intentos.respuestas` es `{"__r2": 1}` (dejado por
 *    entregar-actividad.ts al descargar una respuesta larga a R2), lee de R2
 *    vía el helper; si no hay dato (o binding) degrada a null sin romper.
 */

jest.mock("@/lib/supabase-helpers", () => ({
  getSupabaseServer: jest.fn(),
}));

jest.mock("@/lib/r2-respuestas", () => ({
  getRespuestas: jest.fn(),
}));

// Sin binding KV (como en cualquier corrida de Jest), getCachedCatalog cae al
// productor — su comportamiento de cache MISS, que es justo el path que estas
// pruebas ejercen. Mockearlo así evita cargar @opennextjs/cloudflare (ESM sin
// transformar) y deja intacta la lógica de query real del productor.
// Es función plana a propósito (no jest.fn): el beforeEach corre
// jest.resetAllMocks(), que borraría la implementación de un jest.fn y haría que
// devolviera undefined en vez de correr el productor.
jest.mock("@/lib/catalog-cache", () => ({
  getCachedCatalog: (_key: string, _ttl: number, producer: () => Promise<unknown>) =>
    producer(),
  CATALOG_TTL: { TREE: 43200, CONTENT: 86400 },
}));

import { getSupabaseServer } from "@/lib/supabase-helpers";
import { getRespuestas } from "@/lib/r2-respuestas";
import { getActividadConContenido, getProgresionesConEstado } from "@/lib/queries/hub";

const mockGetSupabaseServer = getSupabaseServer as jest.MockedFunction<typeof getSupabaseServer>;
const mockGetRespuestas = getRespuestas as jest.MockedFunction<typeof getRespuestas>;

const USER_ID = "user-1";
const ACT_ID = "act-1";
const CODIGO_UAC = "XX-I";
const CODIGO_ACTIVIDAD = "XX-I-P01-A1";

// Cadena awaitable estilo PostgREST (mismo patrón que progreso.test.ts):
// select/eq/order/limit encadenan, single/maybeSingle son terminales propios,
// y `.then` resuelve directo para el paso que no llama ningún terminal
// (la query ligera de actividades, que solo hace .select().eq().order()).
function makeChain(result: { data: unknown; error?: unknown }) {
  const resolved = Promise.resolve({ error: null, ...result });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c: Record<string, any> = {};
  for (const m of ["select", "eq", "order", "limit", "in", "gte"]) {
    c[m] = jest.fn(() => c);
  }
  c.single = jest.fn(() => resolved);
  c.maybeSingle = jest.fn(() => resolved);
  c.then = resolved.then.bind(resolved);
  return c;
}

const ACT_FULL_DEFAULT = {
  id: ACT_ID,
  codigo: CODIGO_ACTIVIDAD,
  titulo: "Título de prueba",
  descripcion: null,
  tipo: "reflexion",
  contenido: { preguntas: [] },
  nivel_revision: null,
  practica_slug: null,
};

function makeSb(opts: {
  uac?: { id: string } | null;
  prog?: { id: string } | null;
  actsLigero?: { id: string; codigo: string }[];
  actFull?: typeof ACT_FULL_DEFAULT | null;
  intento?: { id: string; status: string; respuestas: unknown } | null;
}) {
  const uacChain = makeChain({ data: opts.uac === undefined ? { id: "uac-1" } : opts.uac });
  const progChain = makeChain({ data: opts.prog === undefined ? { id: "prog-1" } : opts.prog });
  const actsLigeroChain = makeChain({
    data: opts.actsLigero ?? [{ id: ACT_ID, codigo: CODIGO_ACTIVIDAD }],
  });
  const actFullChain = makeChain({
    data: opts.actFull === undefined ? ACT_FULL_DEFAULT : opts.actFull,
  });
  const intentoChain = makeChain({ data: opts.intento === undefined ? null : opts.intento });

  let llamadasActividades = 0;
  const from = jest.fn((table: string) => {
    if (table === "uac") return uacChain;
    if (table === "progresiones") return progChain;
    if (table === "actividades") {
      llamadasActividades++;
      // 1.ª llamada = query ligera (resolver id por sufijo); 2.ª = contenido completo de esa sola actividad.
      return llamadasActividades === 1 ? actsLigeroChain : actFullChain;
    }
    if (table === "intentos") return intentoChain;
    throw new Error(`tabla no mockeada en test: ${table}`);
  });

  const sb = { from } as unknown as Awaited<ReturnType<typeof getSupabaseServer>>;
  return { sb, from, uacChain, progChain, actsLigeroChain, actFullChain, intentoChain };
}

beforeEach(() => {
  jest.resetAllMocks();
});

// ── Query en 2 pasos ──────────────────────────────────────────────────────

describe("getActividadConContenido — query en 2 pasos", () => {
  test("la query ligera de actividades NO pide 'contenido'; la 2.ª sí, y solo para el id resuelto", async () => {
    const { sb, actsLigeroChain, actFullChain } = makeSb({});
    mockGetSupabaseServer.mockResolvedValue(sb);

    const res = await getActividadConContenido(CODIGO_UAC, 1, 1, USER_ID);

    expect(actsLigeroChain.select).toHaveBeenCalledWith("id, codigo");
    expect(actsLigeroChain.select).not.toHaveBeenCalledWith(
      expect.stringContaining("contenido")
    );
    expect(actFullChain.select).toHaveBeenCalledWith(
      expect.stringContaining("contenido")
    );
    expect(actFullChain.eq).toHaveBeenCalledWith("id", ACT_ID);
    expect(res?.contenido).toEqual(ACT_FULL_DEFAULT.contenido);
  });

  test("uac inexistente → null sin llegar a las siguientes queries", async () => {
    const { sb, from } = makeSb({ uac: null });
    mockGetSupabaseServer.mockResolvedValue(sb);

    const res = await getActividadConContenido(CODIGO_UAC, 1, 1, USER_ID);

    expect(res).toBeNull();
    expect(from).toHaveBeenCalledTimes(1); // solo "uac"
  });

  test("ningún código coincide con el sufijo -A{orden} → null", async () => {
    const { sb } = makeSb({ actsLigero: [{ id: "otro", codigo: "XX-I-P01-A9" }] });
    mockGetSupabaseServer.mockResolvedValue(sb);

    const res = await getActividadConContenido(CODIGO_UAC, 1, 1, USER_ID);

    expect(res).toBeNull();
  });
});

// ── Marcador __r2 ─────────────────────────────────────────────────────────

describe("getActividadConContenido — marcador __r2", () => {
  test("respuestas normales (sin marcador) pasan tal cual a respuestasIntento", async () => {
    const { sb } = makeSb({
      intento: { id: "int-1", status: "completed", respuestas: { p1: "hola" } },
    });
    mockGetSupabaseServer.mockResolvedValue(sb);

    const res = await getActividadConContenido(CODIGO_UAC, 1, 1, USER_ID);

    expect(mockGetRespuestas).not.toHaveBeenCalled();
    expect(res?.respuestasIntento).toEqual({ p1: "hola" });
  });

  test("marcador __r2 con dato disponible → lee de R2 y lo usa como respuestasIntento", async () => {
    const { sb } = makeSb({
      intento: { id: "int-1", status: "completed", respuestas: { __r2: 1 } },
    });
    mockGetSupabaseServer.mockResolvedValue(sb);
    mockGetRespuestas.mockResolvedValue({ reflexion: "texto largo recuperado de R2" });

    const res = await getActividadConContenido(CODIGO_UAC, 1, 1, USER_ID);

    expect(mockGetRespuestas).toHaveBeenCalledWith(USER_ID, ACT_ID);
    expect(res?.respuestasIntento).toEqual({ reflexion: "texto largo recuperado de R2" });
  });

  test("marcador __r2 sin dato en R2 (o sin binding) → respuestasIntento null, no rompe", async () => {
    const { sb } = makeSb({
      intento: { id: "int-1", status: "completed", respuestas: { __r2: 1 } },
    });
    mockGetSupabaseServer.mockResolvedValue(sb);
    mockGetRespuestas.mockResolvedValue(null);

    const res = await getActividadConContenido(CODIGO_UAC, 1, 1, USER_ID);

    expect(res?.respuestasIntento).toBeNull();
    expect(res?.estado).toBe("completada"); // el estado no depende de si se recuperó el detalle
  });

  test("sin intento previo → respuestasIntento null, sin tocar R2", async () => {
    const { sb } = makeSb({ intento: null });
    mockGetSupabaseServer.mockResolvedValue(sb);

    const res = await getActividadConContenido(CODIGO_UAC, 1, 1, USER_ID);

    expect(mockGetRespuestas).not.toHaveBeenCalled();
    expect(res?.respuestasIntento).toBeNull();
    expect(res?.estado).toBe("no_iniciada");
  });
});

// ── Snapshot de progreso (lever de costo #3) — read path fail-open ─────────────
//
// getProgresionesConEstado deriva "qué completó el alumno" de
// `progreso_alumno_snapshot` (1 lookup por PK) cuando existe, y cae al scan vivo
// de `intentos` cuando NO (fila ausente / tabla sin crear todavía / error). Estas
// pruebas fijan las dos garantías del diseño:
//   1) PARIDAD: snapshot y scan vivo producen EXACTAMENTE el mismo resultado.
//   2) SEGURO DE DESPLEGAR ANTES DE LA MIGRACIÓN: sin la tabla (error PostgREST)
//      o sin fila, el hub se comporta igual que hoy (usa `intentos`).

const UAC_PROG = "XX-I";
const PROG_ROW = {
  id: "prog-1",
  numero: 1,
  titulo: "Propósito 1",
  descripcion: null,
  tiempo_estimado_horas: null,
  ejes_articuladores: null,
  transversalidades: null,
};
const ACTS_PROG = [
  { id: "act-1", codigo: "XX-I-P01-A1", titulo: "Actividad 1", tipo: "lectura", progresion_id: "prog-1" },
  { id: "act-2", codigo: "XX-I-P01-A2", titulo: "Actividad 2", tipo: "quiz_multiple_opcion", progresion_id: "prog-1" },
];
const STARTED_AT = "2026-01-15T10:00:00.000Z";
// El alumno completó act-1 (no act-2). El intento vivo y el snapshot describen el
// MISMO hecho, cada uno en su forma: fila de `intentos` vs entrada {i,s,t}.
const INTENTO_ACT1 = {
  id: "int-1",
  actividad_id: "act-1",
  status: "completed",
  started_at: STARTED_AT,
};
const SNAPSHOT_ACT1 = { "act-1": { i: "int-1", s: STARTED_AT, t: 120 } };

// snapshotResult: lo que devuelve el maybeSingle sobre progreso_alumno_snapshot.
//   { data: { completadas } } → snapshot presente (path por PK)
//   { data: null }            → alumno sin fila (0 completadas) → fallback a intentos
//   { data: null, error }     → tabla inexistente / error PostgREST → fallback a intentos
function makeSbProg(snapshotResult: { data: unknown; error?: unknown }) {
  const uacChain = makeChain({ data: { id: "uac-1" } });
  const progChain = makeChain({ data: [PROG_ROW] });
  const actsChain = makeChain({ data: ACTS_PROG });
  const snapChain = makeChain(snapshotResult);
  const intentosChain = makeChain({ data: [INTENTO_ACT1] });

  const from = jest.fn((table: string) => {
    if (table === "uac") return uacChain;
    if (table === "progresiones") return progChain;
    if (table === "actividades") return actsChain;
    if (table === "progreso_alumno_snapshot") return snapChain;
    if (table === "intentos") return intentosChain;
    throw new Error(`tabla no mockeada en test: ${table}`);
  });

  const sb = { from } as unknown as Awaited<ReturnType<typeof getSupabaseServer>>;
  return { sb, from, snapChain, intentosChain };
}

describe("getProgresionesConEstado — snapshot vs scan vivo (lever #3)", () => {
  test("PARIDAD: derivar del snapshot y del scan vivo produce el MISMO resultado", async () => {
    // Path snapshot
    const conSnap = makeSbProg({ data: { completadas: SNAPSHOT_ACT1 } });
    mockGetSupabaseServer.mockResolvedValue(conSnap.sb);
    const resSnapshot = await getProgresionesConEstado(UAC_PROG, "user-a");

    // Path vivo (snapshot ausente → cae a intentos)
    const sinSnap = makeSbProg({ data: null });
    mockGetSupabaseServer.mockResolvedValue(sinSnap.sb);
    const resVivo = await getProgresionesConEstado(UAC_PROG, "user-a");

    // Ambos describen el mismo hecho (act-1 completada, act-2 no) ⇒ mismo objeto.
    expect(resSnapshot).toEqual(resVivo);

    // Y el contenido es el esperado (no un empate de dos vacíos).
    expect(resSnapshot).toHaveLength(1);
    const prog = resSnapshot[0]!;
    expect(prog.estado).toBe("en_progreso");
    expect(prog.actividadesCompletadas).toBe(1);
    expect(prog.totalActividades).toBe(2);
    const [a1, a2] = prog.actividades!;
    expect(a1).toMatchObject({ id: "act-1", estado: "completada", intentoId: "int-1" });
    expect(a2).toMatchObject({ id: "act-2", estado: "no_iniciada", intentoId: null });
  });

  test("con snapshot presente NO se consulta `intentos` (1 lookup por PK, no un scan)", async () => {
    const { sb, from, snapChain } = makeSbProg({ data: { completadas: SNAPSHOT_ACT1 } });
    mockGetSupabaseServer.mockResolvedValue(sb);

    await getProgresionesConEstado(UAC_PROG, "user-b");

    expect(snapChain.maybeSingle).toHaveBeenCalled();
    expect(from).not.toHaveBeenCalledWith("intentos");
  });

  test("sin fila de snapshot (alumno con 0 completadas) → cae al scan vivo de `intentos`", async () => {
    const { sb, from } = makeSbProg({ data: null });
    mockGetSupabaseServer.mockResolvedValue(sb);

    const res = await getProgresionesConEstado(UAC_PROG, "user-c");

    expect(from).toHaveBeenCalledWith("intentos");
    // El scan vivo sigue marcando act-1 como completada (comportamiento previo intacto).
    expect(res[0]!.actividades![0]).toMatchObject({ id: "act-1", estado: "completada" });
  });

  test("SEGURO ANTES DE LA MIGRACIÓN: error PostgREST del snapshot (tabla inexistente) → scan vivo", async () => {
    const { sb, from } = makeSbProg({
      data: null,
      error: { message: 'relation "progreso_alumno_snapshot" does not exist' },
    });
    mockGetSupabaseServer.mockResolvedValue(sb);

    const res = await getProgresionesConEstado(UAC_PROG, "user-d");

    // Falla abierto: usa `intentos` y el hub se comporta exactamente como hoy.
    expect(from).toHaveBeenCalledWith("intentos");
    expect(res[0]!.actividades![0]).toMatchObject({ id: "act-1", estado: "completada" });
  });
});
