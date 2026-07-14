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
