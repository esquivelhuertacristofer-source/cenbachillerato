/**
 * @jest-environment node
 */
export {};

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({ _tag: "mock-admin-client" })),
}));

const SB_URL = "https://test.supabase.co";
const KEY = "service-role-key-abc";

beforeEach(() => {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
});

afterEach(() => {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
});

describe("getSupabaseAdmin", () => {
  test("throws cuando faltan env vars", () => {
    jest.isolateModules(() => {
      const { getSupabaseAdmin } = require("@/lib/supabase-admin");
      expect(() => getSupabaseAdmin()).toThrow(
        "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
      );
    });
  });

  test("throws cuando falta solo SUPABASE_SERVICE_ROLE_KEY", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = SB_URL;
    jest.isolateModules(() => {
      const { getSupabaseAdmin } = require("@/lib/supabase-admin");
      expect(() => getSupabaseAdmin()).toThrow();
    });
  });

  test("crea el cliente con URL y service role key", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = SB_URL;
    process.env.SUPABASE_SERVICE_ROLE_KEY = KEY;
    jest.isolateModules(() => {
      const { createClient } = require("@supabase/supabase-js");
      const { getSupabaseAdmin } = require("@/lib/supabase-admin");
      getSupabaseAdmin();
      expect(createClient).toHaveBeenCalledWith(
        SB_URL,
        KEY,
        expect.objectContaining({
          auth: expect.objectContaining({
            autoRefreshToken: false,
            persistSession: false,
          }),
        })
      );
    });
  });

  test("patrón singleton: devuelve la misma instancia", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = SB_URL;
    process.env.SUPABASE_SERVICE_ROLE_KEY = KEY;
    jest.isolateModules(() => {
      const { createClient } = require("@supabase/supabase-js");
      const { getSupabaseAdmin } = require("@/lib/supabase-admin");
      const inst1 = getSupabaseAdmin();
      const inst2 = getSupabaseAdmin();
      expect(inst1).toBe(inst2);
      expect(createClient).toHaveBeenCalledTimes(1);
    });
  });
});
