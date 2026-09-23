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
  /*
   * `ipParaInet` va con su logica REAL, no como `jest.fn()`.
   *
   * Es una funcion pura de una linea y lo que decide es si el consentimiento se
   * guarda o se pierde: con un doble que devuelve `undefined` las pruebas de
   * abajo pasarian sin comprobar nada. Y el modulo entero esta doblado porque
   * `checkRateLimit`/`getClientIp` solo corren dentro de un runtime de Workers.
   */
  ipParaInet: (ip: string) => (ip === "ip-desconocida" ? null : ip),
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
      expect.objectContaining({ user_id: "user-42", document_type: "privacy", document_version: "1.0", ip_address: "203.0.113.5" }),
      expect.objectContaining({ user_id: "user-42", document_type: "terms", document_version: "1.0", ip_address: "203.0.113.5" }),
    ]);
  });

  /*
   * EL CENTINELA NO ES UNA DIRECCION, Y SE LLEVABA POR DELANTE LAS DOS FILAS.
   *
   * `getClientIp` devuelve `ip-desconocida` cuando no hay cabecera
   * `cf-connecting-ip`. Esa cadena vale como clave de rate-limit, pero
   * `user_consents.ip_address` es de tipo `inet`: Postgres rechazaba el insert
   * completo con «invalid input syntax for type inet» y no se guardaba NI el
   * consentimiento de privacidad NI el de terminos. La columna admite null.
   */
  test("sin cabecera de Cloudflare la direccion va como null, y el consentimiento SI se guarda", async () => {
    mockGetClientIp.mockResolvedValue("ip-desconocida");
    const { sb, consentInsert } = makeSb({ user: { id: "user-13" }, profile: { role: "student" } });
    mockGetSupabaseServer.mockResolvedValue(sb);

    const res = await iniciarSesion(INPUT_VALIDO);

    expect(res).toEqual({ ok: true, rol: "student" });
    expect(consentInsert).toHaveBeenCalledWith([
      expect.objectContaining({ document_type: "privacy", ip_address: null }),
      expect.objectContaining({ document_type: "terms", ip_address: null }),
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

// ── el token «del futuro» ────────────────────────────────────────────────────
//
// El 8-sep-2026, probando las 253 cuentas de las escuelas reales, 1 de cada ~60
// accesos falló con «JWT issued at future»: el reloj del servidor de Supabase
// que firma el token va unas décimas por delante del que sirve los datos, y
// PostgREST rechaza un token recién emitido.
//
// Aquí ese error no se miraba y `role` caía a 'student'. O sea que una maestra
// que pillara el desfase no veía ningún error: entraba COMO ALUMNA. Un fallo
// silencioso que devuelve el rol equivocado es peor que uno que no deja pasar.

/** Una cadena de consulta que devuelve, en orden, lo que se le diga. */
function cadenaEnSecuencia(...respuestas: Array<{ data: unknown; error: unknown }>) {
  let n = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c: Record<string, any> = {};
  for (const m of ["select", "eq"]) c[m] = jest.fn(() => c);
  c.single = jest.fn(() => Promise.resolve(respuestas[Math.min(n++, respuestas.length - 1)]));
  c.veces = () => n;
  return c;
}

function sbConPerfilEnSecuencia(...respuestas: Array<{ data: unknown; error: unknown }>) {
  const perfil = cadenaEnSecuencia(...respuestas);
  const from = jest.fn((tabla: string) => {
    if (tabla === "user_consents") return { insert: jest.fn().mockResolvedValue({ error: null }) };
    if (tabla === "profiles") return perfil;
    throw new Error(`tabla no mockeada en test: ${tabla}`);
  });
  const sb = {
    auth: {
      signInWithPassword: jest.fn().mockResolvedValue({ data: { user: { id: "user-1" } }, error: null }),
    },
    from,
  } as unknown as Awaited<ReturnType<typeof getSupabaseServer>>;
  return { sb, perfil };
}

describe("iniciarSesion — desfase de reloj al leer el rol", () => {
  test("reintenta una vez y la maestra entra COMO MAESTRA, no como alumna", async () => {
    const { sb, perfil } = sbConPerfilEnSecuencia(
      { data: null, error: { message: "JWT issued at future", code: "PGRST301" } },
      { data: { role: "teacher" }, error: null },
    );
    mockGetSupabaseServer.mockResolvedValue(sb);
    const res = await iniciarSesion(INPUT_VALIDO);
    expect(res).toEqual({ ok: true, rol: "teacher" });
    expect(perfil.veces()).toBe(2);
  });

  test("si el desfase persiste NO se inventa el rol: pide reintentar", async () => {
    const { sb, perfil } = sbConPerfilEnSecuencia({
      data: null,
      error: { message: "JWT issued at future", code: "PGRST301" },
    });
    mockGetSupabaseServer.mockResolvedValue(sb);
    const res = await iniciarSesion(INPUT_VALIDO);
    expect(res).toEqual({
      error: "No se pudo cargar tu perfil. Vuelve a intentarlo en unos segundos.",
    });
    expect(perfil.veces()).toBe(2);
  });

  test("un error que no es de reloj no se reintenta ni se disfraza de alumno", async () => {
    const { sb, perfil } = sbConPerfilEnSecuencia({
      data: null,
      error: { message: "permission denied for table profiles", code: "42501" },
    });
    mockGetSupabaseServer.mockResolvedValue(sb);
    const res = await iniciarSesion(INPUT_VALIDO);
    expect("error" in res).toBe(true);
    expect(perfil.veces()).toBe(1);
  });

  test("una cuenta que de verdad no tiene perfil sigue entrando como 'student'", async () => {
    const { sb, perfil } = sbConPerfilEnSecuencia({
      data: null,
      error: { message: "JSON object requested, multiple (or no) rows returned", code: "PGRST116" },
    });
    mockGetSupabaseServer.mockResolvedValue(sb);
    const res = await iniciarSesion(INPUT_VALIDO);
    expect(res).toEqual({ ok: true, rol: "student" });
    expect(perfil.veces()).toBe(1);
  });
});
