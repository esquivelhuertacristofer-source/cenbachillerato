/**
 * @jest-environment node
 *
 * Node (no jsdom) por dos razones: (1) `@/lib/jwt-claims` usa `TextEncoder`/
 * `TextDecoder`, que jsdom no expone como globals en este repo (ver
 * jwt-claims.test.ts); (2) es el entorno más fiel al runtime real de este
 * proxy (Cloudflare Workers vía @opennextjs/cloudflare / Edge), que también
 * expone esos globals de forma nativa.
 */

jest.mock("@supabase/ssr", () => ({
  createServerClient: jest.fn(),
}));

import { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const mockCreateServerClient = createServerClient as jest.MockedFunction<
  typeof createServerClient
>;

const URL_ENV = "https://test.supabase.co";
const ANON_ENV = "anon-key";

// ── Fixtures ─────────────────────────────────────────────────────────────
// Mismo builder de JWT de prueba que jwt-claims.test.ts (base64url a mano,
// firma inventada -- decodeJwtClaims nunca la verifica).

function toBase64Url(value: unknown): string {
  const json = JSON.stringify(value);
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function buildJwt(payload: Record<string, unknown>): string {
  const header = toBase64Url({ alg: "HS256", typ: "JWT" });
  return `${header}.${toBase64Url(payload)}.firma-falsa-no-verificada`;
}

const AHORA_SEGUNDOS = Math.floor(Date.now() / 1000);

type FakeSession = { access_token: string } | null;
type FakeUser = { user_metadata?: Record<string, unknown> } | null;

function makeFakeSupabase(opts: { session?: FakeSession; user?: FakeUser } = {}) {
  const session = opts.session ?? null;
  const user = opts.user ?? null;
  return {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session } }),
      getUser: jest.fn().mockResolvedValue({ data: { user } }),
    },
  };
}

function buildRequest(pathname: string): NextRequest {
  return new NextRequest(`https://example.com${pathname}`, {
    headers: { cookie: "sb-test-auth-token=abc123" },
  });
}

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = URL_ENV;
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = ANON_ENV;
});

afterEach(() => {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  jest.clearAllMocks();
});

describe("proxy", () => {
  test("sin sesión -> redirige a /log-in sin llamar a getUser()", async () => {
    const fake = makeFakeSupabase({ session: null });
    mockCreateServerClient.mockReturnValue(
      fake as unknown as ReturnType<typeof createServerClient>
    );

    const { proxy } = await import("@/proxy");
    const res = await proxy(buildRequest("/hub"));

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/log-in");
    expect(fake.auth.getUser).not.toHaveBeenCalled();
  });

  test("sesión válida, token vigente, must_change_password=false -> deja pasar sin llamar a getUser()", async () => {
    const token = buildJwt({
      exp: AHORA_SEGUNDOS + 3600,
      user_metadata: { must_change_password: false },
    });
    const fake = makeFakeSupabase({ session: { access_token: token } });
    mockCreateServerClient.mockReturnValue(
      fake as unknown as ReturnType<typeof createServerClient>
    );

    const { proxy } = await import("@/proxy");
    const res = await proxy(buildRequest("/hub"));

    // NextResponse.next() no es un redirect: no trae header Location.
    expect(res.headers.get("location")).toBeNull();
    expect(fake.auth.getUser).not.toHaveBeenCalled();
  });

  test("sesión válida, token vigente, must_change_password=true -> redirige a /cambiar-password sin llamar a getUser()", async () => {
    const token = buildJwt({
      exp: AHORA_SEGUNDOS + 3600,
      user_metadata: { must_change_password: true },
    });
    const fake = makeFakeSupabase({ session: { access_token: token } });
    mockCreateServerClient.mockReturnValue(
      fake as unknown as ReturnType<typeof createServerClient>
    );

    const { proxy } = await import("@/proxy");
    const res = await proxy(buildRequest("/hub"));

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/cambiar-password");
    expect(fake.auth.getUser).not.toHaveBeenCalled();
  });

  test("must_change_password=true pero ya en /cambiar-password -> no hay loop de redirect", async () => {
    const token = buildJwt({
      exp: AHORA_SEGUNDOS + 3600,
      user_metadata: { must_change_password: true },
    });
    const fake = makeFakeSupabase({ session: { access_token: token } });
    mockCreateServerClient.mockReturnValue(
      fake as unknown as ReturnType<typeof createServerClient>
    );

    const { proxy } = await import("@/proxy");
    const res = await proxy(buildRequest("/cambiar-password"));

    expect(res.headers.get("location")).toBeNull();
  });

  test("token por expirar (<=60s) -> cae al camino remoto getUser() (la fuente de verdad puede diferir del claim local)", async () => {
    const token = buildJwt({
      exp: AHORA_SEGUNDOS + 30,
      user_metadata: { must_change_password: false },
    });
    const fake = makeFakeSupabase({
      session: { access_token: token },
      user: { user_metadata: { must_change_password: true } },
    });
    mockCreateServerClient.mockReturnValue(
      fake as unknown as ReturnType<typeof createServerClient>
    );

    const { proxy } = await import("@/proxy");
    const res = await proxy(buildRequest("/hub"));

    expect(fake.auth.getUser).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/cambiar-password");
  });

  test("JWT malformado -> cae al camino remoto getUser(); sin user -> /log-in", async () => {
    const fake = makeFakeSupabase({
      session: { access_token: "esto-no-es-un-jwt-valido" },
      user: null,
    });
    mockCreateServerClient.mockReturnValue(
      fake as unknown as ReturnType<typeof createServerClient>
    );

    const { proxy } = await import("@/proxy");
    const res = await proxy(buildRequest("/hub"));

    expect(fake.auth.getUser).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/log-in");
  });

  test("token ya expirado -> camino remoto resuelve must_change_password=false -> deja pasar", async () => {
    const token = buildJwt({
      exp: AHORA_SEGUNDOS - 10,
      user_metadata: { must_change_password: true },
    });
    const fake = makeFakeSupabase({
      session: { access_token: token },
      user: { user_metadata: { must_change_password: false } },
    });
    mockCreateServerClient.mockReturnValue(
      fake as unknown as ReturnType<typeof createServerClient>
    );

    const { proxy } = await import("@/proxy");
    const res = await proxy(buildRequest("/hub"));

    expect(fake.auth.getUser).toHaveBeenCalledTimes(1);
    expect(res.headers.get("location")).toBeNull();
  });
});
