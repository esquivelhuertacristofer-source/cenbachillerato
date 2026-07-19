/**
 * @jest-environment node
 */

jest.mock("@opennextjs/cloudflare", () => ({
  getCloudflareContext: jest.fn(),
}));

jest.mock("next/headers", () => ({
  headers: jest.fn(),
}));

import { getCloudflareContext, type CloudflareContext } from "@opennextjs/cloudflare";
import { headers } from "next/headers";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// `getCloudflareContext` is overloaded (sync vs `{ async: true }`); `rate-limit.ts` only ever
// calls the async form, so the mock is typed against that single shape rather than fighting
// jest's overload inference (which otherwise collapses `mockResolvedValue`'s param to `never`).
const mockGetCloudflareContext = getCloudflareContext as unknown as jest.Mock<
  Promise<CloudflareContext>,
  [{ async: true }]
>;
const mockHeaders = headers as jest.MockedFunction<typeof headers>;

function fakeContext(env: Record<string, unknown>): CloudflareContext {
  return { env, cf: undefined, ctx: undefined } as unknown as CloudflareContext;
}

afterEach(() => {
  jest.clearAllMocks();
});

// ── checkRateLimit: fail-open (the critical property) ──────────────────────

describe("checkRateLimit — fail open", () => {
  test("getCloudflareContext throwing → allowed: true, no throw", async () => {
    mockGetCloudflareContext.mockRejectedValue(
      new Error("getCloudflareContext called without initOpenNextCloudflareForDev")
    );

    await expect(
      checkRateLimit("k1", { limit: 5, windowSeconds: 60 })
    ).resolves.toEqual({ allowed: true });
  });

  test("RATE_LIMIT_KV binding missing → allowed: true", async () => {
    mockGetCloudflareContext.mockResolvedValue(fakeContext({}));

    await expect(
      checkRateLimit("k2", { limit: 5, windowSeconds: 60 })
    ).resolves.toEqual({ allowed: true });
  });

  test("KV.get throwing → allowed: true", async () => {
    mockGetCloudflareContext.mockResolvedValue(
      fakeContext({
        RATE_LIMIT_KV: {
          get: jest.fn().mockRejectedValue(new Error("KV unavailable")),
          put: jest.fn(),
        },
      })
    );

    await expect(
      checkRateLimit("k3", { limit: 5, windowSeconds: 60 })
    ).resolves.toEqual({ allowed: true });
  });

  test("KV.put throwing → allowed: true", async () => {
    mockGetCloudflareContext.mockResolvedValue(
      fakeContext({
        RATE_LIMIT_KV: {
          get: jest.fn().mockResolvedValue("0"),
          put: jest.fn().mockRejectedValue(new Error("KV write unavailable")),
        },
      })
    );

    await expect(
      checkRateLimit("k3b", { limit: 5, windowSeconds: 60 })
    ).resolves.toEqual({ allowed: true });
  });
});

// ── checkRateLimit: happy path behavior ─────────────────────────────────────

describe("checkRateLimit — fixed window counting", () => {
  function makeKv(initialCount: number | null) {
    const store = { value: initialCount };
    return {
      get: jest.fn(async () => (store.value === null ? null : String(store.value))),
      put: jest.fn(async (_key: string, value: string) => {
        store.value = Number(value);
      }),
    };
  }

  test("under the limit → allowed: true and increments", async () => {
    const kv = makeKv(0);
    mockGetCloudflareContext.mockResolvedValue(fakeContext({ RATE_LIMIT_KV: kv }));

    const result = await checkRateLimit("k4", { limit: 5, windowSeconds: 60 });
    expect(result).toEqual({ allowed: true });
    expect(kv.put).toHaveBeenCalledWith("k4", "1", { expirationTtl: 60 });
  });

  test("at the limit → allowed: false", async () => {
    const kv = makeKv(5);
    mockGetCloudflareContext.mockResolvedValue(fakeContext({ RATE_LIMIT_KV: kv }));

    const result = await checkRateLimit("k5", { limit: 5, windowSeconds: 60 });
    expect(result).toEqual({ allowed: false });
    expect(kv.put).not.toHaveBeenCalled();
  });

  test("corrupted (non-numeric) stored value → treated as 0, self-heals", async () => {
    const kv = {
      get: jest.fn().mockResolvedValue("not-a-number"),
      put: jest.fn().mockResolvedValue(undefined),
    };
    mockGetCloudflareContext.mockResolvedValue(fakeContext({ RATE_LIMIT_KV: kv }));
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const result = await checkRateLimit("k6", { limit: 5, windowSeconds: 60 });
    expect(result).toEqual({ allowed: true });
    expect(kv.put).toHaveBeenCalledWith("k6", "1", { expirationTtl: 60 });

    errorSpy.mockRestore();
  });
});

// ── checkRateLimit: binding nativo de Rate Limiting por prefijo de key ──────
// Los prefijos reales de los llamadores: `login:${ip}` y `entregar-actividad:${user.id}`.
// Con binding presente, checkRateLimit debe delegar en él e IGNORAR el camino KV
// (esa es la razón de ser del cambio: no gastar el cupo de 1,000 escrituras/día
// de KV Free). Sin binding, o con prefijo desconocido, KV sigue siendo el fallback.

describe("checkRateLimit — binding nativo por prefijo", () => {
  function makeLimiter(success: boolean) {
    return { limit: jest.fn().mockResolvedValue({ success }) };
  }

  function makeUntouchedKv() {
    return {
      get: jest.fn().mockResolvedValue(null),
      put: jest.fn().mockResolvedValue(undefined),
    };
  }

  test("key login:* con LOGIN_RATE_LIMITER → usa el binding y no toca KV", async () => {
    const limiter = makeLimiter(true);
    const kv = makeUntouchedKv();
    mockGetCloudflareContext.mockResolvedValue(
      fakeContext({ LOGIN_RATE_LIMITER: limiter, RATE_LIMIT_KV: kv })
    );

    const result = await checkRateLimit("login:203.0.113.7", { limit: 10, windowSeconds: 60 });
    expect(result).toEqual({ allowed: true });
    expect(limiter.limit).toHaveBeenCalledWith({ key: "login:203.0.113.7" });
    expect(kv.get).not.toHaveBeenCalled();
    expect(kv.put).not.toHaveBeenCalled();
  });

  test("key entregar-actividad:* con ENTREGA_RATE_LIMITER → usa SU binding, no el de login", async () => {
    const loginLimiter = makeLimiter(true);
    const entregaLimiter = makeLimiter(true);
    mockGetCloudflareContext.mockResolvedValue(
      fakeContext({ LOGIN_RATE_LIMITER: loginLimiter, ENTREGA_RATE_LIMITER: entregaLimiter })
    );

    const result = await checkRateLimit("entregar-actividad:user-1", {
      limit: 30,
      windowSeconds: 60,
    });
    expect(result).toEqual({ allowed: true });
    expect(entregaLimiter.limit).toHaveBeenCalledWith({ key: "entregar-actividad:user-1" });
    expect(loginLimiter.limit).not.toHaveBeenCalled();
  });

  test("binding devuelve success: false → allowed: false", async () => {
    const limiter = makeLimiter(false);
    mockGetCloudflareContext.mockResolvedValue(fakeContext({ LOGIN_RATE_LIMITER: limiter }));

    await expect(
      checkRateLimit("login:203.0.113.7", { limit: 10, windowSeconds: 60 })
    ).resolves.toEqual({ allowed: false });
  });

  test("binding.limit() lanzando → fail-open allowed: true, sin caer a KV", async () => {
    const limiter = { limit: jest.fn().mockRejectedValue(new Error("limiter unavailable")) };
    const kv = makeUntouchedKv();
    mockGetCloudflareContext.mockResolvedValue(
      fakeContext({ LOGIN_RATE_LIMITER: limiter, RATE_LIMIT_KV: kv })
    );
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    await expect(
      checkRateLimit("login:203.0.113.7", { limit: 10, windowSeconds: 60 })
    ).resolves.toEqual({ allowed: true });
    expect(kv.get).not.toHaveBeenCalled();
    expect(kv.put).not.toHaveBeenCalled();

    errorSpy.mockRestore();
  });

  test("prefijo login: SIN binding en el env → cae al camino KV original", async () => {
    const kv = {
      get: jest.fn().mockResolvedValue("2"),
      put: jest.fn().mockResolvedValue(undefined),
    };
    mockGetCloudflareContext.mockResolvedValue(fakeContext({ RATE_LIMIT_KV: kv }));

    const result = await checkRateLimit("login:203.0.113.7", { limit: 10, windowSeconds: 60 });
    expect(result).toEqual({ allowed: true });
    expect(kv.put).toHaveBeenCalledWith("login:203.0.113.7", "3", { expirationTtl: 60 });
  });

  test("prefijo desconocido con bindings presentes → usa KV (opts gobiernan)", async () => {
    const loginLimiter = makeLimiter(true);
    const entregaLimiter = makeLimiter(true);
    const kv = {
      get: jest.fn().mockResolvedValue(null),
      put: jest.fn().mockResolvedValue(undefined),
    };
    mockGetCloudflareContext.mockResolvedValue(
      fakeContext({
        LOGIN_RATE_LIMITER: loginLimiter,
        ENTREGA_RATE_LIMITER: entregaLimiter,
        RATE_LIMIT_KV: kv,
      })
    );

    const result = await checkRateLimit("otro-endpoint:abc", { limit: 3, windowSeconds: 30 });
    expect(result).toEqual({ allowed: true });
    expect(loginLimiter.limit).not.toHaveBeenCalled();
    expect(entregaLimiter.limit).not.toHaveBeenCalled();
    expect(kv.put).toHaveBeenCalledWith("otro-endpoint:abc", "1", { expirationTtl: 30 });
  });
});

// ── getClientIp ──────────────────────────────────────────────────────────────

describe("getClientIp", () => {
  test("returns cf-connecting-ip when present", async () => {
    mockHeaders.mockResolvedValue({
      get: (name: string) => (name === "cf-connecting-ip" ? "203.0.113.7" : null),
    } as unknown as Awaited<ReturnType<typeof headers>>);

    await expect(getClientIp()).resolves.toBe("203.0.113.7");
  });

  test("falls back to a constant when header is absent", async () => {
    mockHeaders.mockResolvedValue({
      get: () => null,
    } as unknown as Awaited<ReturnType<typeof headers>>);

    await expect(getClientIp()).resolves.toBe("ip-desconocida");
  });

  test("falls back to a constant when headers() throws", async () => {
    mockHeaders.mockRejectedValue(new Error("no request context"));

    await expect(getClientIp()).resolves.toBe("ip-desconocida");
  });
});
