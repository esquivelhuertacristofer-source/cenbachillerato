/**
 * @jest-environment node
 *
 * Cubre el Server Action de login (`iniciarSesion`): validación de
 * consentimiento vía Zod, rate-limit por IP, mapeo de los errores de auth de
 * Supabase a mensajes que no filtran detalle interno, registro best-effort del
 * consentimiento (nunca bloquea el login) y resolución del rol desde
 * `profiles` (fuente de verdad) en vez del JWT.
 */

jest.mock("@/lib/supabase-helpers", () => ({
  getSupabaseServer: jest.fn(),
}));

jest.mock("@/lib/rate-limit", () => ({
  checkRateLimit: jest.fn(),
  getClientIp: jest.fn(),
}));

jest.mock("next/headers", () => ({
  headers: jest.fn(),
}));

import { getSupabaseServer } from "@/lib/supabase-helpers";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { headers } from "next/headers";
import { iniciarSesion } from "@/lib/actions/iniciar-sesion";

const mockGetSupabaseServer = getSupabaseServer as jest.MockedFunction<typeof getSupabaseServer>;
const mockCheckRateLimit = checkRateLimit as jest.MockedFunction<typeof checkRateLimit>;
const mockGetClientIp = getClientIp as jest.MockedFunction<typeof getClientIp>;
const mockHeaders = headers as jest.MockedFunction<typeof headers>;

// ── Mock de Supabase ─────────────────────────────────────────────────────────

function makeProfileChain(result: { data: unknown; error?: unknown }) {
  const resolved = Promise.resolve({ error: null, ...result });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c: Record<string, any> = {};
  for (const m of ["select", "eq"]) c[m] = jest.fn(() => c);
  c.single = jest.fn(() => resolved);
  return c;
}

function makeSb(opts: {
  signInError?: { message: string } | null;
  user?: { id: string } | null;
  consentError?: { message: string } | null;
  profile?: { role: string } | null;
}) {
  const signInWithPassword = jest.fn().mockResolvedValue({
    data: { user: opts.user === undefined ? { id: "user-1" } : opts.user },
    error: opts.signInError ?? null,
  });
  const consentInsert = jest.fn().mockResolvedValue({ error: opts.consentError ?? null });
  const profileChain = makeProfileChain({
    data: opts.profile === undefined ? { role: "student" } : opts.profile,
  });
  const from = jest.fn((table: string) => {
    if (table === "user_consents") return { insert: consentInsert };
    if (table === "profiles") return profileChain;
    throw new Error(`tabla no mockeada en test: ${table}`);
  });
  const sb = { auth: { signInWithPassword }, from } as unknown as Awaited<
    ReturnType<typeof getSupabaseServer>
  >;
  return { sb, signInWithPassword, consentInsert, from };
}

const INPUT_VALIDO = {
  email: "docente@escuela.mx",
  password: "secreto123",
  consentimiento: true as const,
};

beforeEach(() => {
  jest.resetAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => {});
  mockGetClientIp.mockResolvedValue("203.0.113.5");
  mockCheckRateLimit.mockResolvedValue({ allowed: true });
  mockHeaders.mockResolvedValue({ get: () => "jest-UA" } as never);
});

// ── validación ────────────────────────────────────────────────────────────────

describe("iniciarSesion — validación", () => {
  test("sin aceptar el consentimiento → error, no llega a rate-limit ni a auth", async () => {
    const res = await iniciarSesion({ ...INPUT_VALIDO, consentimiento: false as never });
    expect("error" in res).toBe(true);
    expect(mockGetClientIp).not.toHaveBeenCalled();
    expect(mockCheckRateLimit).not.toHaveBeenCalled();
    expect(mockGetSupabaseServer).not.toHaveBeenCalled();
  });

  test("email inválido → error de validación, sin tocar auth", async () => {
    const res = await iniciarSesion({ ...INPUT_VALIDO, email: "no-es-un-email" });
    expect("error" in res).toBe(true);
    expect(mockGetSupabaseServer).not.toHaveBeenCalled();
  });
});

// ── rate limit ──────────────────────────────────────────────────────────────

describe("iniciarSesion — rate limit por IP", () => {
  test("límite excedido → error específico, no intenta autenticar", async () => {
    mockCheckRateLimit.mockResolvedValue({ allowed: false });
    const res = await iniciarSesion(INPUT_VALIDO);
    expect(res).toEqual({
      error: "Demasiados intentos de acceso. Espera un minuto e inténtalo de nuevo.",
    });
    expect(mockGetSupabaseServer).not.toHaveBeenCalled();
  });

  test("la clave de rate-limit usa la IP del cliente", async () => {
    const { sb } = makeSb({ profile: { role: "student" } });
    mockGetSupabaseServer.mockResolvedValue(sb);
    await iniciarSesion(INPUT_VALIDO);
    expect(mockCheckRateLimit).toHaveBeenCalledWith("login:203.0.113.5", {
      limit: 10,
      windowSeconds: 60,
    });
  });
});

// ── errores de autenticación ───────────────────────────────────────────────

describe("iniciarSesion — errores de autenticación", () => {
  test("credenciales inválidas → mensaje amigable (no filtra el texto interno)", async () => {
    const { sb } = makeSb({ signInError: { message: "Invalid login credentials" }, user: null });
    mockGetSupabaseServer.mockResolvedValue(sb);
    const res = await iniciarSesion(INPUT_VALIDO);
    expect(res).toEqual({ error: "Correo o contraseña incorrectos." });
  });

  test("email no confirmado → mensaje específico", async () => {
    const { sb } = makeSb({ signInError: { message: "Email not confirmed" }, user: null });
    mockGetSupabaseServer.mockResolvedValue(sb);
    const res = await iniciarSesion(INPUT_VALIDO);
    expect(res).toEqual({ error: "Debes confirmar tu correo electrónico antes de acceder." });
  });

  test("cualquier otro error de auth → mensaje genérico", async () => {
    const { sb } = makeSb({ signInError: { message: "unexpected internal xyz" }, user: null });
    mockGetSupabaseServer.mockResolvedValue(sb);
    const res = await iniciarSesion(INPUT_VALIDO);
    expect(res).toEqual({ error: "Ocurrió un error al iniciar sesión. Intenta de nuevo." });
  });

  test("sin error pero sin user en la respuesta → error de sesión", async () => {
    const { sb } = makeSb({ user: null });
    mockGetSupabaseServer.mockResolvedValue(sb);
    const res = await iniciarSesion(INPUT_VALIDO);
    expect(res).toEqual({ error: "No se pudo obtener la sesión. Intenta de nuevo." });
  });
});

// ── éxito ──────────────────────────────────────────────────────────────────

describe("iniciarSesion — éxito", () => {
  test("login correcto → ok con el rol de profiles y registra ambos consentimientos", async () => {
    const { sb, consentInsert } = makeSb({ user: { id: "user-42" }, profile: { role: "admin" } });
    mockGetSupabaseServer.mockResolvedValue(sb);

    const res = await iniciarSesion(INPUT_VALIDO);

    expect(res).toEqual({ ok: true, rol: "admin" });
    expect(consentInsert).toHaveBeenCalledWith([
      expect.objectContaining({ user_id: "user-42", document_type: "privacy", document_version: "1.0" }),
      expect.objectContaining({ user_id: "user-42", document_type: "terms", document_version: "1.0" }),
    ]);
  });

  test("sin perfil → el rol cae a 'student' (no rompe el login)", async () => {
    const { sb } = makeSb({ user: { id: "user-99" }, profile: null });
    mockGetSupabaseServer.mockResolvedValue(sb);
    const res = await iniciarSesion(INPUT_VALIDO);
    expect(res).toEqual({ ok: true, rol: "student" });
  });

  test("un fallo al registrar el consentimiento NO bloquea el login", async () => {
    const { sb } = makeSb({
      user: { id: "user-7" },
      profile: { role: "teacher" },
      consentError: { message: "insert boom" },
    });
    mockGetSupabaseServer.mockResolvedValue(sb);
    const res = await iniciarSesion(INPUT_VALIDO);
    expect(res).toEqual({ ok: true, rol: "teacher" });
  });
});
