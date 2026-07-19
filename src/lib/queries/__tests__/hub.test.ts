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

import { getSupabaseServer } from "@/lib/supabase-helpers";
import { getRespuestas } from "@/lib/r2-respuestas";
import { getActividadConContenido } from "@/lib/queries/hub";

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
  for (const m of ["select", "eq", "order", "limit"]) {
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
