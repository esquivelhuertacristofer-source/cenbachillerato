/**
 * @jest-environment node
 *
 * Cubre `cambiarPassword`: exige sesión, valida la contraseña (largo + que
 * coincida la confirmación), SOLO permite el cambio a usuarios con el flag
 * `must_change_password` (no es un "cambiar mi contraseña" arbitrario),
 * limpia el flag en auth y lo sincroniza en `profiles` vía service_role, y
 * devuelve el rol leído de `profiles` (no del JWT, que puede estar obsoleto).
 */

jest.mock("@/lib/supabase-helpers", () => ({
  getUser: jest.fn(),
  getProfile: jest.fn(),
  getSupabaseServer: jest.fn(),
}));

jest.mock("@/lib/supabase-admin", () => ({
  getSupabaseAdmin: jest.fn(),
}));

import { getUser, getProfile, getSupabaseServer } from "@/lib/supabase-helpers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { cambiarPassword } from "@/lib/actions/cambiar-password";

const mockGetUser = getUser as jest.MockedFunction<typeof getUser>;
const mockGetProfile = getProfile as jest.MockedFunction<typeof getProfile>;
const mockGetSupabaseServer = getSupabaseServer as jest.MockedFunction<typeof getSupabaseServer>;
const mockGetSupabaseAdmin = getSupabaseAdmin as jest.MockedFunction<typeof getSupabaseAdmin>;

function makeUser(overrides: Record<string, unknown> = {}) {
  return { id: "user-1", user_metadata: { must_change_password: true }, ...overrides };
}

function makeServerSb(updateError: { message: string } | null = null) {
  const updateUser = jest.fn().mockResolvedValue({ error: updateError });
  const sb = { auth: { updateUser } } as unknown as Awaited<ReturnType<typeof getSupabaseServer>>;
  return { sb, updateUser };
}

function makeAdminSb() {
  const eq = jest.fn().mockResolvedValue({ error: null });
  const update = jest.fn(() => ({ eq }));
  const from = jest.fn(() => ({ update }));
  const sbAdmin = { from } as unknown as ReturnType<typeof getSupabaseAdmin>;
  return { sbAdmin, from, update, eq };
}

beforeEach(() => {
  jest.resetAllMocks();
});

// ── guardas ────────────────────────────────────────────────────────────────

describe("cambiarPassword — guardas", () => {
  test("sin sesión → 'No autenticado', no toca la BD", async () => {
    mockGetUser.mockResolvedValue(null);
    const res = await cambiarPassword("nuevaClave1", "nuevaClave1");
    expect(res).toEqual({ error: "No autenticado" });
    expect(mockGetSupabaseServer).not.toHaveBeenCalled();
  });

  test("contraseña de menos de 8 caracteres → error de validación", async () => {
    mockGetUser.mockResolvedValue(makeUser() as never);
    const res = await cambiarPassword("corta", "corta");
    expect("error" in res).toBe(true);
    expect(mockGetSupabaseServer).not.toHaveBeenCalled();
  });

  test("la confirmación que no coincide → error", async () => {
    mockGetUser.mockResolvedValue(makeUser() as never);
    const res = await cambiarPassword("claveBuena1", "otraClave2");
    expect("error" in res).toBe(true);
    expect(mockGetSupabaseServer).not.toHaveBeenCalled();
  });

  test("usuario que NO requiere cambio → rechazado (no es cambio arbitrario)", async () => {
    mockGetUser.mockResolvedValue(makeUser({ user_metadata: { must_change_password: false } }) as never);
    const res = await cambiarPassword("claveBuena1", "claveBuena1");
    expect(res).toEqual({ error: "No se requiere cambio de contraseña" });
    expect(mockGetSupabaseServer).not.toHaveBeenCalled();
  });
});

// ── actualización ────────────────────────────────────────────────────────────

describe("cambiarPassword — actualización", () => {
  test("un error de updateUser se propaga como mensaje de error", async () => {
    mockGetUser.mockResolvedValue(makeUser() as never);
    const { sb } = makeServerSb({ message: "weak password" });
    mockGetSupabaseServer.mockResolvedValue(sb);
    const res = await cambiarPassword("claveBuena1", "claveBuena1");
    expect(res).toEqual({ error: "Error actualizando contraseña: weak password" });
  });

  test("éxito → limpia el flag en auth, lo sincroniza en profiles y devuelve el rol", async () => {
    mockGetUser.mockResolvedValue(makeUser({ id: "user-77" }) as never);
    const { sb, updateUser } = makeServerSb(null);
    mockGetSupabaseServer.mockResolvedValue(sb);
    const { sbAdmin, from, update, eq } = makeAdminSb();
    mockGetSupabaseAdmin.mockReturnValue(sbAdmin);
    mockGetProfile.mockResolvedValue({ role: "teacher" } as never);

    const res = await cambiarPassword("claveBuena1", "claveBuena1");

    expect(res).toEqual({ ok: true, rol: "teacher" });
    expect(updateUser).toHaveBeenCalledWith({
      password: "claveBuena1",
      data: { must_change_password: false },
    });
    expect(from).toHaveBeenCalledWith("profiles");
    expect(update).toHaveBeenCalledWith({ must_change_password: false });
    expect(eq).toHaveBeenCalledWith("id", "user-77");
  });

  test("éxito sin perfil → el rol cae a 'student'", async () => {
    mockGetUser.mockResolvedValue(makeUser() as never);
    const { sb } = makeServerSb(null);
    mockGetSupabaseServer.mockResolvedValue(sb);
    mockGetSupabaseAdmin.mockReturnValue(makeAdminSb().sbAdmin);
    mockGetProfile.mockResolvedValue(null);

    const res = await cambiarPassword("claveBuena1", "claveBuena1");
    expect(res).toEqual({ ok: true, rol: "student" });
  });
});
