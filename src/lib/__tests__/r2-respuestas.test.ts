/**
 * @jest-environment node
 *
 * Helper fail-safe R2 (`putRespuestas`/`getRespuestas`): la propiedad crítica
 * es que NUNCA lanza, sin importar la causa (sin binding, `getCloudflareContext`
 * lanzando fuera de un runtime de Workers, o un error del propio R2) — mismo
 * criterio que `rate-limit.ts` (ver rate-limit.test.ts).
 */

jest.mock("@opennextjs/cloudflare", () => ({
  getCloudflareContext: jest.fn(),
}));

import { getCloudflareContext, type CloudflareContext } from "@opennextjs/cloudflare";
import { putRespuestas, getRespuestas } from "@/lib/r2-respuestas";

// Mismo patrón que rate-limit.test.ts: getCloudflareContext solo se llama en su forma
// async ({ async: true }) desde este módulo.
const mockGetCloudflareContext = getCloudflareContext as unknown as jest.Mock<
  Promise<CloudflareContext>,
  [{ async: true }]
>;

function fakeContext(env: Record<string, unknown>): CloudflareContext {
  return { env, cf: undefined, ctx: undefined } as unknown as CloudflareContext;
}

const USER_ID = "user-1";
const ACTIVIDAD_ID = "act-1";

afterEach(() => {
  jest.clearAllMocks();
});

// ── putRespuestas ────────────────────────────────────────────────────────────

describe("putRespuestas — fail-safe", () => {
  test("getCloudflareContext lanzando → devuelve false, no lanza", async () => {
    mockGetCloudflareContext.mockRejectedValue(
      new Error("getCloudflareContext called without initOpenNextCloudflareForDev")
    );

    await expect(putRespuestas(USER_ID, ACTIVIDAD_ID, { a: 1 })).resolves.toBe(false);
  });

  test("sin binding RESPUESTAS_BUCKET → devuelve false", async () => {
    mockGetCloudflareContext.mockResolvedValue(fakeContext({}));

    await expect(putRespuestas(USER_ID, ACTIVIDAD_ID, { a: 1 })).resolves.toBe(false);
  });

  test("bucket.put lanzando → devuelve false, no lanza", async () => {
    mockGetCloudflareContext.mockResolvedValue(
      fakeContext({
        RESPUESTAS_BUCKET: { put: jest.fn().mockRejectedValue(new Error("R2 unavailable")) },
      })
    );

    await expect(putRespuestas(USER_ID, ACTIVIDAD_ID, { a: 1 })).resolves.toBe(false);
  });

  test("éxito: sube JSON.stringify(valor) bajo la key respuestas/<userId>/<actividadId>.json", async () => {
    const put = jest.fn().mockResolvedValue(undefined);
    mockGetCloudflareContext.mockResolvedValue(fakeContext({ RESPUESTAS_BUCKET: { put } }));

    await expect(putRespuestas(USER_ID, ACTIVIDAD_ID, { a: 1 })).resolves.toBe(true);

    expect(put).toHaveBeenCalledWith(
      `respuestas/${USER_ID}/${ACTIVIDAD_ID}.json`,
      JSON.stringify({ a: 1 }),
      { httpMetadata: { contentType: "application/json" } }
    );
  });
});

// ── getRespuestas ────────────────────────────────────────────────────────────

describe("getRespuestas — fail-safe", () => {
  test("getCloudflareContext lanzando → devuelve null, no lanza", async () => {
    mockGetCloudflareContext.mockRejectedValue(new Error("fuera de Workers"));

    await expect(getRespuestas(USER_ID, ACTIVIDAD_ID)).resolves.toBeNull();
  });

  test("sin binding RESPUESTAS_BUCKET → devuelve null", async () => {
    mockGetCloudflareContext.mockResolvedValue(fakeContext({}));

    await expect(getRespuestas(USER_ID, ACTIVIDAD_ID)).resolves.toBeNull();
  });

  test("objeto inexistente en R2 (bucket.get devuelve null) → devuelve null", async () => {
    mockGetCloudflareContext.mockResolvedValue(
      fakeContext({ RESPUESTAS_BUCKET: { get: jest.fn().mockResolvedValue(null) } })
    );

    await expect(getRespuestas(USER_ID, ACTIVIDAD_ID)).resolves.toBeNull();
  });

  test("bucket.get lanzando → devuelve null, no lanza", async () => {
    mockGetCloudflareContext.mockResolvedValue(
      fakeContext({
        RESPUESTAS_BUCKET: { get: jest.fn().mockRejectedValue(new Error("R2 unavailable")) },
      })
    );

    await expect(getRespuestas(USER_ID, ACTIVIDAD_ID)).resolves.toBeNull();
  });

  test("éxito: parsea el JSON descargado de la key esperada", async () => {
    const get = jest.fn().mockResolvedValue({
      text: jest.fn().mockResolvedValue(JSON.stringify({ reflexion: "texto largo" })),
    });
    mockGetCloudflareContext.mockResolvedValue(fakeContext({ RESPUESTAS_BUCKET: { get } }));

    await expect(getRespuestas(USER_ID, ACTIVIDAD_ID)).resolves.toEqual({
      reflexion: "texto largo",
    });
    expect(get).toHaveBeenCalledWith(`respuestas/${USER_ID}/${ACTIVIDAD_ID}.json`);
  });
});
