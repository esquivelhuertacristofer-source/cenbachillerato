/**
 * @jest-environment node
 */
export {};

jest.mock("@supabase/ssr", () => ({
  createBrowserClient: jest.fn(() => ({ _tag: "mock-browser-client" })),
}));

const SB_URL = "https://test.supabase.co";
const ANON = "anon-key-xyz";

beforeEach(() => {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
});

afterEach(() => {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
});

describe("getSupabaseBrowser", () => {
  test("throws cuando faltan env vars", () => {
    jest.isolateModules(() => {
      const { getSupabaseBrowser } = require("@/lib/supabase-browser");
      expect(() => getSupabaseBrowser()).toThrow(
        "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
      );
    });
  });

  test("throws cuando falta solo NEXT_PUBLIC_SUPABASE_ANON_KEY", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = SB_URL;
    jest.isolateModules(() => {
      const { getSupabaseBrowser } = require("@/lib/supabase-browser");
      expect(() => getSupabaseBrowser()).toThrow();
    });
  });

  test("crea el cliente con URL y anon key", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = SB_URL;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = ANON;
    jest.isolateModules(() => {
      const { createBrowserClient } = require("@supabase/ssr");
      const { getSupabaseBrowser } = require("@/lib/supabase-browser");
      getSupabaseBrowser();
      expect(createBrowserClient).toHaveBeenCalledWith(SB_URL, ANON);
    });
  });

  test("patrón singleton: devuelve la misma instancia", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = SB_URL;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = ANON;
    jest.isolateModules(() => {
      const { createBrowserClient } = require("@supabase/ssr");
      const { getSupabaseBrowser } = require("@/lib/supabase-browser");
      const inst1 = getSupabaseBrowser();
      const inst2 = getSupabaseBrowser();
      expect(inst1).toBe(inst2);
      expect(createBrowserClient).toHaveBeenCalledTimes(1);
    });
  });
});
