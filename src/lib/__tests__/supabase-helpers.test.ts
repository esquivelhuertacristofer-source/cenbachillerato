/**
 * @jest-environment node
 */

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

jest.mock("@supabase/ssr", () => ({
  createServerClient: jest.fn(),
}));

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const mockCookies = cookies as jest.MockedFunction<typeof cookies>;
const mockCreateServerClient = createServerClient as jest.MockedFunction<
  typeof createServerClient
>;

const URL = "https://test.supabase.co";
const ANON = "anon-key";

function makeFakeSupabase(overrides: Record<string, unknown> = {}) {
  return {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: "u1" } } }, error: null }),
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: "u1", email: "a@b.com" } }, error: null }),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { id: "u1", rol: "alumno" }, error: null }),
    })),
    ...overrides,
  };
}

function setupEnv() {
  process.env.NEXT_PUBLIC_SUPABASE_URL = URL;
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = ANON;
}

function teardownEnv() {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

beforeEach(() => {
  const fakeCookieStore = { getAll: jest.fn(() => []), set: jest.fn() };
  mockCookies.mockResolvedValue(fakeCookieStore as unknown as Awaited<ReturnType<typeof cookies>>);
  mockCreateServerClient.mockReturnValue(makeFakeSupabase() as unknown as ReturnType<typeof createServerClient>);
  setupEnv();
});

afterEach(() => {
  teardownEnv();
  jest.clearAllMocks();
});

// ── getSupabaseServer ───────────────────────────────────────────────────────

describe("getSupabaseServer", () => {
  test("throws cuando faltan env vars", async () => {
    teardownEnv();
    const { getSupabaseServer } = await import("@/lib/supabase-helpers");
    await expect(getSupabaseServer()).rejects.toThrow(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  });

  test("crea el cliente con URL y anon key", async () => {
    const { getSupabaseServer } = await import("@/lib/supabase-helpers");
    await getSupabaseServer();
    expect(mockCreateServerClient).toHaveBeenCalledWith(
      URL,
      ANON,
      expect.objectContaining({ cookies: expect.any(Object) })
    );
  });
});

// ── getSession ──────────────────────────────────────────────────────────────

describe("getSession", () => {
  test("happy path: devuelve la sesión", async () => {
    const { getSession } = await import("@/lib/supabase-helpers");
    const session = await getSession();
    expect(session).toMatchObject({ user: { id: "u1" } });
  });

  test("error en getSession → devuelve null", async () => {
    mockCreateServerClient.mockReturnValue({
      ...makeFakeSupabase(),
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: new Error("auth error") }),
        getUser: jest.fn(),
      },
    } as unknown as ReturnType<typeof createServerClient>);

    const { getSession } = await import("@/lib/supabase-helpers");
    const session = await getSession();
    expect(session).toBeNull();
  });
});

// ── getUser ─────────────────────────────────────────────────────────────────

describe("getUser", () => {
  test("happy path: devuelve el user", async () => {
    const { getUser } = await import("@/lib/supabase-helpers");
    const user = await getUser();
    expect(user).toMatchObject({ id: "u1", email: "a@b.com" });
  });

  test("error en getUser → devuelve null", async () => {
    mockCreateServerClient.mockReturnValue({
      ...makeFakeSupabase(),
      auth: {
        getSession: jest.fn(),
        getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: new Error("unauth") }),
      },
    } as unknown as ReturnType<typeof createServerClient>);

    const { getUser } = await import("@/lib/supabase-helpers");
    const user = await getUser();
    expect(user).toBeNull();
  });
});

// ── getProfile ──────────────────────────────────────────────────────────────

describe("getProfile", () => {
  test("happy path: devuelve el perfil", async () => {
    const { getProfile } = await import("@/lib/supabase-helpers");
    const profile = await getProfile("u1");
    expect(profile).toMatchObject({ id: "u1", rol: "alumno" });
  });

  test("error en query → devuelve null", async () => {
    const fakeSb = {
      ...makeFakeSupabase(),
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: new Error("not found") }),
      })),
    };
    mockCreateServerClient.mockReturnValue(fakeSb as unknown as ReturnType<typeof createServerClient>);

    const { getProfile } = await import("@/lib/supabase-helpers");
    const profile = await getProfile("nonexistent");
    expect(profile).toBeNull();
  });

  test("consulta la tabla profiles con el userId correcto", async () => {
    const mockSingle = jest.fn().mockResolvedValue({ data: { id: "u99" }, error: null });
    const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });

    mockCreateServerClient.mockReturnValue({
      ...makeFakeSupabase(),
      from: mockFrom,
    } as unknown as ReturnType<typeof createServerClient>);

    const { getProfile } = await import("@/lib/supabase-helpers");
    await getProfile("u99");

    expect(mockFrom).toHaveBeenCalledWith("profiles");
    expect(mockEq).toHaveBeenCalledWith("id", "u99");
  });
});
