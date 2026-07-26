/**
 * @jest-environment node
 *
 * Cubre `crearEscuela`: SOLO super_admin registra escuelas, valida el input
 * vía Zod (normalizando vacíos a null), y mapea el 23505 (unique_violation de
 * CCT) a un mensaje amigable sin filtrar el detalle interno de Postgres.
 */

jest.mock("@/lib/supabase-helpers", () => ({
  getUser: jest.fn(),
  getProfile: jest.fn(),
}));

jest.mock("@/lib/supabase-admin", () => ({
  getSupabaseAdmin: jest.fn(),
}));

import { getUser, getProfile } from "@/lib/supabase-helpers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { crearEscuela } from "@/lib/actions/crear-escuela";

const mockGetUser = getUser as jest.MockedFunction<typeof getUser>;
const mockGetProfile = getProfile as jest.MockedFunction<typeof getProfile>;
const mockGetSupabaseAdmin = getSupabaseAdmin as jest.MockedFunction<typeof getSupabaseAdmin>;

function makeAdminSb(opts: {
  data?: { id: string; nombre: string } | null;
  error?: { code?: string; message?: string } | null;
}) {
  const single = jest.fn().mockResolvedValue({
    data: opts.data === undefined ? { id: "esc-1", nombre: "Prepa Piloto" } : opts.data,
    error: opts.error ?? null,
  });
  const select = jest.fn(() => ({ single }));
  const insert = jest.fn(() => ({ select }));
  const from = jest.fn(() => ({ insert }));
  const sbAdmin = { from } as unknown as ReturnType<typeof getSupabaseAdmin>;
  return { sbAdmin, from, insert, select, single };
}

function makeProfile(role: string) {
  return { id: "caller-id", email: "caller@cen.mx", role, escuela_id: null };
}

beforeEach(() => {
  jest.resetAllMocks();
});

// ── autorización ────────────────────────────────────────────────────────────

describe("crearEscuela — autorización", () => {
  test("sin sesión → 'No autorizado'", async () => {
    mockGetUser.mockResolvedValue(null);
    const res = await crearEscuela({ nombre: "Prepa 1" });
    expect(res).toEqual({ error: "No autorizado" });
  });

  test("admin escolar (no super_admin) → rechazado", async () => {
    mockGetUser.mockResolvedValue({ id: "caller-id" } as never);
    mockGetProfile.mockResolvedValue(makeProfile("admin") as never);
    const res = await crearEscuela({ nombre: "Prepa 1" });
    expect(res).toEqual({ error: "Solo super_admin puede registrar escuelas" });
    expect(mockGetSupabaseAdmin).not.toHaveBeenCalled();
  });
});

// ── validación ────────────────────────────────────────────────────────────────

describe("crearEscuela — validación", () => {
  beforeEach(() => {
    mockGetUser.mockResolvedValue({ id: "caller-id" } as never);
    mockGetProfile.mockResolvedValue(makeProfile("super_admin") as never);
  });

  test("nombre vacío → error de validación, sin insertar", async () => {
    const { sbAdmin, insert } = makeAdminSb({});
    mockGetSupabaseAdmin.mockReturnValue(sbAdmin);
    const res = await crearEscuela({ nombre: "   " });
    expect("error" in res).toBe(true);
    expect(insert).not.toHaveBeenCalled();
  });
});

// ── persistencia ────────────────────────────────────────────────────────────

describe("crearEscuela — persistencia", () => {
  beforeEach(() => {
    mockGetUser.mockResolvedValue({ id: "caller-id" } as never);
    mockGetProfile.mockResolvedValue(makeProfile("super_admin") as never);
  });

  test("CCT duplicada (23505) → mensaje amigable", async () => {
    const { sbAdmin } = makeAdminSb({ data: null, error: { code: "23505", message: "dup key detail" } });
    mockGetSupabaseAdmin.mockReturnValue(sbAdmin);
    const res = await crearEscuela({ nombre: "Prepa 1", cct: "15EBH0001X" });
    expect(res).toEqual({ error: "Ya existe una escuela registrada con esa CCT" });
  });

  test("otro error de BD → mensaje genérico", async () => {
    const { sbAdmin } = makeAdminSb({ data: null, error: { code: "23503", message: "fk detail" } });
    mockGetSupabaseAdmin.mockReturnValue(sbAdmin);
    const res = await crearEscuela({ nombre: "Prepa 1" });
    expect("error" in res).toBe(true);
    if ("error" in res) expect(res.error).toContain("Error creando escuela");
  });

  test("éxito → ok con id/nombre; los campos opcionales ausentes se guardan como null", async () => {
    const { sbAdmin, insert } = makeAdminSb({ data: { id: "esc-9", nombre: "Prepa Piloto" } });
    mockGetSupabaseAdmin.mockReturnValue(sbAdmin);

    const res = await crearEscuela({ nombre: "Prepa Piloto" });

    expect(res).toEqual({ ok: true, id: "esc-9", nombre: "Prepa Piloto" });
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre: "Prepa Piloto",
        cct: null,
        subsistema: null,
        estado: null,
        municipio: null,
      }),
    );
  });
});
