/**
 * @jest-environment node
 *
 * Cubre `crearAdminEscolar`: SOLO super_admin lo ejecuta, valida el input
 * (incluida la normalización del email a minúsculas), verifica que la escuela
 * exista antes de crear el usuario, crea el admin vía auth.admin.createUser con
 * `role: 'admin'` + `must_change_password: true`, y mapea `email_exists` a un
 * mensaje amigable.
 */

jest.mock("@/lib/supabase-helpers", () => ({
  getUser: jest.fn(),
  getProfile: jest.fn(),
}));

jest.mock("@/lib/supabase-admin", () => ({
  getSupabaseAdmin: jest.fn(),
}));

jest.mock("@/lib/email-generator", () => ({
  generarPassword: jest.fn(() => "Bachi-admin42"),
}));

import { getUser, getProfile } from "@/lib/supabase-helpers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { generarPassword } from "@/lib/email-generator";
import { crearAdminEscolar } from "@/lib/actions/crear-admin-escolar";

const mockGetUser = getUser as jest.MockedFunction<typeof getUser>;
const mockGetProfile = getProfile as jest.MockedFunction<typeof getProfile>;
const mockGetSupabaseAdmin = getSupabaseAdmin as jest.MockedFunction<typeof getSupabaseAdmin>;
const mockGenerarPassword = generarPassword as jest.MockedFunction<typeof generarPassword>;

const ESCUELA_ID = "44444444-4444-4444-8444-444444444444";

function makeAdminSb(opts: {
  escuela?: { id: string } | null;
  escuelaError?: { message: string } | null;
  createError?: { code?: string; message?: string } | null;
  createdUser?: { id: string } | null;
}) {
  const single = jest.fn().mockResolvedValue({
    data: opts.escuela === undefined ? { id: ESCUELA_ID } : opts.escuela,
    error: opts.escuelaError ?? null,
  });
  const eq = jest.fn(() => ({ single }));
  const select = jest.fn(() => ({ eq }));
  const from = jest.fn(() => ({ select }));

  const createUser = jest.fn().mockResolvedValue({
    data: { user: opts.createdUser === undefined ? { id: "new-admin-id" } : opts.createdUser },
    error: opts.createError ?? null,
  });

  const sbAdmin = {
    from,
    auth: { admin: { createUser } },
  } as unknown as ReturnType<typeof getSupabaseAdmin>;
  return { sbAdmin, from, createUser };
}

function makeProfile(role: string) {
  return { id: "caller-id", email: "root@cen.mx", role, escuela_id: null };
}

const INPUT_VALIDO = { full_name: "Ana López", email: "ana@escuela.mx", escuela_id: ESCUELA_ID };

beforeEach(() => {
  jest.resetAllMocks();
  // resetAllMocks borra la implementación fijada en la factory del jest.mock,
  // así que reafirmamos la contraseña temporal determinista en cada test.
  mockGenerarPassword.mockReturnValue("Bachi-admin42");
});

// ── autorización ────────────────────────────────────────────────────────────

describe("crearAdminEscolar — autorización", () => {
  test("sin sesión → 'No autorizado'", async () => {
    mockGetUser.mockResolvedValue(null);
    const res = await crearAdminEscolar(INPUT_VALIDO);
    expect(res).toEqual({ error: "No autorizado" });
  });

  test("admin escolar (no super_admin) → rechazado", async () => {
    mockGetUser.mockResolvedValue({ id: "caller-id" } as never);
    mockGetProfile.mockResolvedValue(makeProfile("admin") as never);
    const res = await crearAdminEscolar(INPUT_VALIDO);
    expect(res).toEqual({ error: "Solo super_admin puede crear administradores escolares" });
    expect(mockGetSupabaseAdmin).not.toHaveBeenCalled();
  });
});

// ── validación + escuela ─────────────────────────────────────────────────────

describe("crearAdminEscolar — validación y existencia de escuela", () => {
  beforeEach(() => {
    mockGetUser.mockResolvedValue({ id: "caller-id" } as never);
    mockGetProfile.mockResolvedValue(makeProfile("super_admin") as never);
  });

  test("email inválido → error de validación, sin crear usuario", async () => {
    const { sbAdmin, createUser } = makeAdminSb({});
    mockGetSupabaseAdmin.mockReturnValue(sbAdmin);
    const res = await crearAdminEscolar({ ...INPUT_VALIDO, email: "no-es-email" });
    expect("error" in res).toBe(true);
    expect(createUser).not.toHaveBeenCalled();
  });

  test("escuela inexistente → error, sin crear usuario", async () => {
    const { sbAdmin, createUser } = makeAdminSb({ escuela: null });
    mockGetSupabaseAdmin.mockReturnValue(sbAdmin);
    const res = await crearAdminEscolar(INPUT_VALIDO);
    expect(res).toEqual({ error: "La escuela seleccionada no existe" });
    expect(createUser).not.toHaveBeenCalled();
  });
});

// ── creación ────────────────────────────────────────────────────────────────

describe("crearAdminEscolar — creación", () => {
  beforeEach(() => {
    mockGetUser.mockResolvedValue({ id: "caller-id" } as never);
    mockGetProfile.mockResolvedValue(makeProfile("super_admin") as never);
  });

  test("email ya registrado (email_exists) → mensaje amigable", async () => {
    const { sbAdmin } = makeAdminSb({ createdUser: null, createError: { code: "email_exists", message: "dup" } });
    mockGetSupabaseAdmin.mockReturnValue(sbAdmin);
    const res = await crearAdminEscolar(INPUT_VALIDO);
    expect(res).toEqual({ error: "Ya existe un usuario con ese correo" });
  });

  test("éxito → crea admin con role/flag correctos, email normalizado a minúsculas", async () => {
    const { sbAdmin, createUser } = makeAdminSb({ createdUser: { id: "new-admin-id" } });
    mockGetSupabaseAdmin.mockReturnValue(sbAdmin);

    const res = await crearAdminEscolar({ ...INPUT_VALIDO, email: "ANA@Escuela.MX" });

    expect(res).toEqual({ ok: true, email: "ana@escuela.mx", password: "Bachi-admin42" });
    expect(createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "ana@escuela.mx",
        password: "Bachi-admin42",
        email_confirm: true,
        user_metadata: expect.objectContaining({
          full_name: "Ana López",
          role: "admin",
          escuela_id: ESCUELA_ID,
          must_change_password: true,
        }),
      }),
    );
  });
});
