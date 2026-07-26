/**
 * @jest-environment node
 *
 * Cubre `resetearPassword` (reset admin-asistido): valida el UUID, exige que
 * quien llama sea admin/super_admin, aplica el AISLAMIENTO MULTI-TENANT (un
 * admin escolar solo resetea usuarios de SU escuela y nunca a un super_admin),
 * hace merge del user_metadata para no perder full_name/role, y devuelve la
 * contraseña temporal una sola vez.
 */

jest.mock("@/lib/supabase-helpers", () => ({
  getUser: jest.fn(),
  getProfile: jest.fn(),
}));

jest.mock("@/lib/supabase-admin", () => ({
  getSupabaseAdmin: jest.fn(),
}));

jest.mock("@/lib/email-generator", () => ({
  generarPassword: jest.fn(() => "Bachi-reset99"),
}));

import { getUser, getProfile } from "@/lib/supabase-helpers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { generarPassword } from "@/lib/email-generator";
import { resetearPassword } from "@/lib/actions/resetear-password";

const mockGetUser = getUser as jest.MockedFunction<typeof getUser>;
const mockGetProfile = getProfile as jest.MockedFunction<typeof getProfile>;
const mockGetSupabaseAdmin = getSupabaseAdmin as jest.MockedFunction<typeof getSupabaseAdmin>;
const mockGenerarPassword = generarPassword as jest.MockedFunction<typeof generarPassword>;

const TARGET_ID = "33333333-3333-4333-8333-333333333333";

type Target = { id: string; email: string; escuela_id: string | null; role: string };

function makeAdminSb(opts: {
  target?: Target | null;
  targetError?: { message: string } | null;
  authUser?: { user: { user_metadata: Record<string, unknown> } } | null;
  getUserError?: { message: string } | null;
  updateError?: { message: string } | null;
}) {
  const targetSingle = jest.fn().mockResolvedValue({
    data: opts.target === undefined ? null : opts.target,
    error: opts.targetError ?? null,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectChain: Record<string, any> = {};
  selectChain.select = jest.fn(() => selectChain);
  selectChain.eq = jest.fn(() => selectChain);
  selectChain.single = targetSingle;

  const updateEq = jest.fn().mockResolvedValue({ error: null });
  const update = jest.fn(() => ({ eq: updateEq }));

  const from = jest.fn(() => ({ ...selectChain, update }));

  const getUserById = jest.fn().mockResolvedValue({
    data: opts.authUser === undefined ? { user: { user_metadata: {} } } : opts.authUser,
    error: opts.getUserError ?? null,
  });
  const updateUserById = jest.fn().mockResolvedValue({ error: opts.updateError ?? null });

  const sbAdmin = {
    from,
    auth: { admin: { getUserById, updateUserById } },
  } as unknown as ReturnType<typeof getSupabaseAdmin>;

  return { sbAdmin, from, update, updateEq, getUserById, updateUserById };
}

function makeProfile(role: string, escuela_id: string | null = "esc-A") {
  return { id: "caller-id", email: "caller@escuela.mx", role, escuela_id };
}

beforeEach(() => {
  jest.resetAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => {});
  // resetAllMocks borra la implementación fijada en la factory del jest.mock,
  // así que reafirmamos la contraseña temporal determinista en cada test.
  mockGenerarPassword.mockReturnValue("Bachi-reset99");
});

// ── validación + autorización ──────────────────────────────────────────────

describe("resetearPassword — validación y autorización", () => {
  test("userId que no es UUID → error, sin comprobar sesión", async () => {
    const res = await resetearPassword("no-es-uuid");
    expect(res).toEqual({ error: "Identificador de usuario inválido" });
    expect(mockGetUser).not.toHaveBeenCalled();
  });

  test("sin sesión → 'No autorizado'", async () => {
    mockGetUser.mockResolvedValue(null);
    const res = await resetearPassword(TARGET_ID);
    expect(res).toEqual({ error: "No autorizado" });
  });

  test("perfil sin rol admin → rechazado", async () => {
    mockGetUser.mockResolvedValue({ id: "caller-id" } as never);
    mockGetProfile.mockResolvedValue(makeProfile("student") as never);
    const res = await resetearPassword(TARGET_ID);
    expect(res).toEqual({ error: "Solo administradores pueden restablecer contraseñas" });
  });
});

// ── aislamiento multi-tenant ────────────────────────────────────────────────

describe("resetearPassword — aislamiento multi-tenant", () => {
  beforeEach(() => {
    mockGetUser.mockResolvedValue({ id: "caller-id" } as never);
  });

  test("target inexistente → 'Usuario no encontrado'", async () => {
    mockGetProfile.mockResolvedValue(makeProfile("admin") as never);
    mockGetSupabaseAdmin.mockReturnValue(makeAdminSb({ target: null }).sbAdmin);
    const res = await resetearPassword(TARGET_ID);
    expect(res).toEqual({ error: "Usuario no encontrado" });
  });

  test("admin escolar NO puede resetear a un usuario de OTRA escuela", async () => {
    mockGetProfile.mockResolvedValue(makeProfile("admin", "esc-A") as never);
    mockGetSupabaseAdmin.mockReturnValue(
      makeAdminSb({
        target: { id: TARGET_ID, email: "otro@escuela.mx", escuela_id: "esc-B", role: "student" },
      }).sbAdmin,
    );
    const res = await resetearPassword(TARGET_ID);
    expect(res).toEqual({ error: "No tienes permiso sobre este usuario" });
  });

  test("admin escolar NO puede resetear a un super_admin (aunque comparta escuela)", async () => {
    mockGetProfile.mockResolvedValue(makeProfile("admin", "esc-A") as never);
    mockGetSupabaseAdmin.mockReturnValue(
      makeAdminSb({
        target: { id: TARGET_ID, email: "root@cen.mx", escuela_id: "esc-A", role: "super_admin" },
      }).sbAdmin,
    );
    const res = await resetearPassword(TARGET_ID);
    expect(res).toEqual({ error: "No tienes permiso sobre este usuario" });
  });
});

// ── errores del sistema de auth ─────────────────────────────────────────────

describe("resetearPassword — errores de auth admin", () => {
  beforeEach(() => {
    mockGetUser.mockResolvedValue({ id: "caller-id" } as never);
    mockGetProfile.mockResolvedValue(makeProfile("super_admin") as never);
  });

  test("no se puede leer el usuario en auth → error", async () => {
    mockGetSupabaseAdmin.mockReturnValue(
      makeAdminSb({
        target: { id: TARGET_ID, email: "alumno@escuela.mx", escuela_id: "esc-A", role: "student" },
        authUser: null,
        getUserError: { message: "not found" },
      }).sbAdmin,
    );
    const res = await resetearPassword(TARGET_ID);
    expect(res).toEqual({ error: "No se pudo leer el usuario en el sistema de autenticación" });
  });

  test("error de updateUserById → mensaje de error", async () => {
    mockGetSupabaseAdmin.mockReturnValue(
      makeAdminSb({
        target: { id: TARGET_ID, email: "alumno@escuela.mx", escuela_id: "esc-A", role: "student" },
        updateError: { message: "boom" },
      }).sbAdmin,
    );
    const res = await resetearPassword(TARGET_ID);
    expect(res).toEqual({ error: "Error actualizando contraseña: boom" });
  });
});

// ── éxito ──────────────────────────────────────────────────────────────────

describe("resetearPassword — éxito", () => {
  test("super_admin resetea: devuelve credencial y hace MERGE del user_metadata", async () => {
    mockGetUser.mockResolvedValue({ id: "caller-id" } as never);
    mockGetProfile.mockResolvedValue(makeProfile("super_admin") as never);
    const { sbAdmin, updateUserById } = makeAdminSb({
      target: { id: TARGET_ID, email: "alumno@escuela.mx", escuela_id: "esc-B", role: "student" },
      authUser: { user: { user_metadata: { full_name: "Alumno Existente", role: "student" } } },
    });
    mockGetSupabaseAdmin.mockReturnValue(sbAdmin);

    const res = await resetearPassword(TARGET_ID);

    expect(res).toEqual({ ok: true, email: "alumno@escuela.mx", password: "Bachi-reset99" });
    // El merge conserva full_name/role y solo agrega must_change_password
    expect(updateUserById).toHaveBeenCalledWith(TARGET_ID, {
      password: "Bachi-reset99",
      user_metadata: { full_name: "Alumno Existente", role: "student", must_change_password: true },
    });
  });

  test("admin escolar SÍ puede resetear a un usuario de su MISMA escuela", async () => {
    mockGetUser.mockResolvedValue({ id: "caller-id" } as never);
    mockGetProfile.mockResolvedValue(makeProfile("admin", "esc-A") as never);
    mockGetSupabaseAdmin.mockReturnValue(
      makeAdminSb({
        target: { id: TARGET_ID, email: "alumno@escuela.mx", escuela_id: "esc-A", role: "student" },
      }).sbAdmin,
    );
    const res = await resetearPassword(TARGET_ID);
    expect(res).toEqual({ ok: true, email: "alumno@escuela.mx", password: "Bachi-reset99" });
  });
});
