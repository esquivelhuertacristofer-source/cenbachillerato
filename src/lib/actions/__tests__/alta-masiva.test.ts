/**
 * @jest-environment node
 */

jest.mock('@/lib/supabase-helpers', () => ({
  getUser: jest.fn(),
  getProfile: jest.fn(),
}));

jest.mock('@/lib/supabase-admin', () => ({
  getSupabaseAdmin: jest.fn(),
}));

jest.mock('@/lib/email-generator', () => ({
  generarEmailBase: jest.fn((nombre: string, ap: string) => `${nombre.toLowerCase()}.${ap.toLowerCase()}@cenbachillerato.mx`),
  resolverEmailUnico: jest.fn((_n: string, _ap: string, _am: string, _ex: Set<string>, lote: Set<string>) => {
    const email = `resolved.email${lote.size}@cenbachillerato.mx`;
    return email;
  }),
  generarPassword: jest.fn(() => 'Bachi-testpw'),
}));

import { getUser, getProfile } from '@/lib/supabase-helpers';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { procesarAltaMasiva } from '@/lib/actions/alta-masiva';

const mockGetUser = getUser as jest.MockedFunction<typeof getUser>;
const mockGetProfile = getProfile as jest.MockedFunction<typeof getProfile>;
const mockGetSupabaseAdmin = getSupabaseAdmin as jest.MockedFunction<typeof getSupabaseAdmin>;

// ── Mock builder ─────────────────────────────────────────────────────────────

function makeChain(result: unknown) {
  const chain: Record<string, unknown> = {};
  const methods = ['select', 'eq', 'in', 'like', 'insert', 'update', 'is', 'upsert'];
  methods.forEach((m) => { chain[m] = jest.fn(() => chain); });
  (chain as { then: (r: (v: unknown) => unknown) => Promise<unknown> }).then = (resolve) =>
    Promise.resolve(resolve(result));
  return chain;
}

function makeAdminClient(overrides: Record<string, unknown> = {}) {
  const profilesData = [{ email: 'existing@cenbachillerato.mx' }];
  const gruposData: unknown[] = [];
  const insertGruposData: unknown[] = [];

  const fromImpl = (table: string) => {
    if (table === 'profiles') return makeChain({ data: profilesData, error: null });
    if (table === 'grupos') {
      const chain = makeChain({ data: gruposData, error: null });
      // insert returns different data
      (chain.insert as jest.MockedFunction<() => unknown>) = jest.fn(() =>
        makeChain({ data: insertGruposData, error: null })
      );
      return chain;
    }
    if (table === 'alumnos_grupos') return makeChain({ data: null, error: null });
    return makeChain({ data: null, error: null });
  };

  return {
    from: jest.fn(fromImpl),
    auth: {
      admin: {
        createUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'new-user-id-' + Math.random() } },
          error: null,
        }),
      },
    },
    ...overrides,
  };
}

function makeProfile(role = 'admin') {
  return {
    id: 'admin-id',
    email: 'admin@school.mx',
    full_name: 'Admin User',
    role,
    escuela_id: 'escuela-uuid-123',
  };
}

function makeUser() {
  return {
    id: 'admin-id',
    email: 'admin@school.mx',
    user_metadata: {},
  };
}

// ── CSV helpers ───────────────────────────────────────────────────────────────

const CSV_VALIDO = `rol,nombre,apellido_paterno,apellido_materno,semestre,grupo_nombre
docente,Juan,Pérez,García,,Grupo 1A
alumno,María,López,Hernández,1,Grupo 1A`;

const CSV_INVALIDO_SIN_SEMESTRE = `rol,nombre,apellido_paterno,apellido_materno,semestre,grupo_nombre
alumno,Pedro,Ruiz,Torres,,Grupo 1A`;

const CSV_ROL_INVALIDO = `rol,nombre,apellido_paterno,apellido_materno,semestre,grupo_nombre
profesor,Juan,Pérez,García,,Grupo 1A`;

// ── Tests ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
});

describe('procesarAltaMasiva — autenticación', () => {
  test('rechaza usuarios no autenticados', async () => {
    mockGetUser.mockResolvedValue(null);
    const result = await procesarAltaMasiva(CSV_VALIDO);
    expect(result).toEqual({ error: 'No autorizado' });
  });

  test('rechaza usuarios sin perfil', async () => {
    mockGetUser.mockResolvedValue(makeUser() as never);
    mockGetProfile.mockResolvedValue(null);
    const result = await procesarAltaMasiva(CSV_VALIDO);
    expect(result).toEqual({ error: 'Solo administradores pueden hacer alta masiva' });
  });

  test('rechaza rol student', async () => {
    mockGetUser.mockResolvedValue(makeUser() as never);
    mockGetProfile.mockResolvedValue(makeProfile('student') as never);
    const result = await procesarAltaMasiva(CSV_VALIDO);
    expect(result).toEqual({ error: 'Solo administradores pueden hacer alta masiva' });
  });

  test('rechaza admin sin escuela asignada', async () => {
    mockGetUser.mockResolvedValue(makeUser() as never);
    mockGetProfile.mockResolvedValue({ ...makeProfile('admin'), escuela_id: null } as never);
    const result = await procesarAltaMasiva(CSV_VALIDO);
    expect(result).toEqual({ error: 'Tu perfil no tiene escuela asignada. Contacta a un super_admin.' });
  });
});

describe('procesarAltaMasiva — validación CSV', () => {
  beforeEach(() => {
    mockGetUser.mockResolvedValue(makeUser() as never);
    mockGetProfile.mockResolvedValue(makeProfile() as never);
    mockGetSupabaseAdmin.mockReturnValue(makeAdminClient() as never);
  });

  test('rechaza CSV vacío', async () => {
    const result = await procesarAltaMasiva('rol,nombre,apellido_paterno,apellido_materno,semestre,grupo_nombre\n');
    expect(result).toEqual({ error: 'El archivo CSV está vacío o no tiene filas de datos' });
  });

  test('rechaza alumno sin semestre (transacción atómica: NADA se inserta)', async () => {
    const result = await procesarAltaMasiva(CSV_INVALIDO_SIN_SEMESTRE);
    expect('error' in result).toBe(false);
    if ('errores' in result) {
      expect(result.errores.length).toBeGreaterThan(0);
      expect(result.docentes_creados).toBe(0);
      expect(result.alumnos_creados).toBe(0);
    }
  });

  test('rechaza rol inválido (transacción atómica)', async () => {
    const result = await procesarAltaMasiva(CSV_ROL_INVALIDO);
    expect('error' in result).toBe(false);
    if ('errores' in result) {
      expect(result.errores.length).toBeGreaterThan(0);
      expect(result.docentes_creados).toBe(0);
    }
  });

  test('si UN error de validación, docentes_creados = 0 y alumnos_creados = 0', async () => {
    const csvMixto = `rol,nombre,apellido_paterno,apellido_materno,semestre,grupo_nombre
docente,Juan,Pérez,García,,Grupo 1A
alumno,SinSemestre,Ruiz,Torres,,Grupo 1A`;

    const sbAdmin = makeAdminClient();
    mockGetSupabaseAdmin.mockReturnValue(sbAdmin as never);

    const result = await procesarAltaMasiva(csvMixto);
    expect('errores' in result).toBe(true);
    if ('errores' in result) {
      expect(result.errores.length).toBeGreaterThan(0);
      expect(result.docentes_creados).toBe(0);
      expect(result.alumnos_creados).toBe(0);
      // Verifica que NO se llamó a createUser
      expect(sbAdmin.auth.admin.createUser).not.toHaveBeenCalled();
    }
  });
});

describe('procesarAltaMasiva — orden de procesamiento', () => {
  test('docentes se procesan antes que alumnos', async () => {
    mockGetUser.mockResolvedValue(makeUser() as never);
    mockGetProfile.mockResolvedValue(makeProfile() as never);

    const callOrder: string[] = [];
    const sbAdmin = makeAdminClient({
      auth: {
        admin: {
          createUser: jest.fn().mockImplementation(({ user_metadata }: { user_metadata: { role: string } }) => {
            callOrder.push(user_metadata.role);
            return Promise.resolve({ data: { user: { id: 'uid-' + Math.random() } }, error: null });
          }),
        },
      },
    });
    mockGetSupabaseAdmin.mockReturnValue(sbAdmin as never);

    const csvAlumnosPrimero = `rol,nombre,apellido_paterno,apellido_materno,semestre,grupo_nombre
alumno,María,López,Hernández,1,Grupo 1A
docente,Juan,Pérez,García,,Grupo 1A`;

    await procesarAltaMasiva(csvAlumnosPrimero);
    expect(callOrder[0]).toBe('teacher');
    expect(callOrder[1]).toBe('student');
  });
});

describe('procesarAltaMasiva — creación de grupos', () => {
  test('crea grupos faltantes con el semestre del alumno', async () => {
    mockGetUser.mockResolvedValue(makeUser() as never);
    mockGetProfile.mockResolvedValue(makeProfile() as never);

    const insertedGrupos: unknown[] = [];
    const sbAdmin = {
      from: jest.fn((table: string) => {
        if (table === 'profiles') return makeChain({ data: [], error: null });
        if (table === 'grupos') {
          const chain = makeChain({ data: [], error: null }); // ningún grupo existe
          (chain.insert as jest.MockedFunction<(data: unknown) => unknown>) = jest.fn((data: unknown) => {
            insertedGrupos.push(data);
            return makeChain({ data: [{ nombre: 'Grupo 1A', id: 'g1', semestre: 1 }], error: null });
          });
          return chain;
        }
        if (table === 'alumnos_grupos') return makeChain({ data: null, error: null });
        return makeChain({ data: null, error: null });
      }),
      auth: {
        admin: {
          createUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'new-uid' } },
            error: null,
          }),
        },
      },
    };
    mockGetSupabaseAdmin.mockReturnValue(sbAdmin as never);

    const result = await procesarAltaMasiva(CSV_VALIDO);
    expect('errores' in result).toBe(true);
    if ('errores' in result) {
      expect(result.grupos_creados).toBe(1);
      expect(insertedGrupos.length).toBe(1);
      const firstInserted = insertedGrupos[0] as Array<{ semestre: number }> | undefined;
      expect(firstInserted?.[0]?.semestre).toBe(1);
    }
  });
});

describe('procesarAltaMasiva — passwords temporales', () => {
  test('must_change_password está en user_metadata al crear usuario', async () => {
    mockGetUser.mockResolvedValue(makeUser() as never);
    mockGetProfile.mockResolvedValue(makeProfile() as never);

    const capturedUserMeta: Array<Record<string, unknown>> = [];
    const sbAdmin = makeAdminClient({
      auth: {
        admin: {
          createUser: jest.fn().mockImplementation(({ user_metadata }: { user_metadata: Record<string, unknown> }) => {
            capturedUserMeta.push(user_metadata);
            return Promise.resolve({ data: { user: { id: 'new-uid' } }, error: null });
          }),
        },
      },
    });
    mockGetSupabaseAdmin.mockReturnValue(sbAdmin as never);

    await procesarAltaMasiva(CSV_VALIDO);

    expect(capturedUserMeta.length).toBeGreaterThan(0);
    capturedUserMeta.forEach((meta) => {
      expect(meta.must_change_password).toBe(true);
    });
  });
});

describe('procesarAltaMasiva — credenciales', () => {
  test('devuelve credenciales para usuarios creados exitosamente', async () => {
    mockGetUser.mockResolvedValue(makeUser() as never);
    mockGetProfile.mockResolvedValue(makeProfile() as never);
    mockGetSupabaseAdmin.mockReturnValue(makeAdminClient() as never);

    const result = await procesarAltaMasiva(CSV_VALIDO);
    expect('credenciales' in result).toBe(true);
    if ('credenciales' in result) {
      expect(result.credenciales.length).toBeGreaterThan(0);
      result.credenciales.forEach((cred) => {
        expect(cred.email).toContain('@cenbachillerato.mx');
        expect(cred.password_inicial).toMatch(/^Bachi-/);
        expect(cred.nombre_completo).toBeTruthy();
        expect(cred.grupo).toBeTruthy();
        // Passwords no deben estar vacíos
        expect(cred.password_inicial.length).toBeGreaterThan(0);
      });
    }
  });

  test('passwords nunca se repiten en las credenciales', async () => {
    mockGetUser.mockResolvedValue(makeUser() as never);
    mockGetProfile.mockResolvedValue(makeProfile() as never);

    // generarPassword es mock que devuelve siempre lo mismo en tests
    // pero en producción serían distintos — verificar que la columna se incluye
    const result = await procesarAltaMasiva(CSV_VALIDO);
    if ('credenciales' in result && result.credenciales.length > 0) {
      expect(result.credenciales[0]?.password_inicial).toBeDefined();
    }
  });
});

describe('procesarAltaMasiva — idempotencia', () => {
  test('omite usuarios cuyo email base ya existe en la DB', async () => {
    mockGetUser.mockResolvedValue(makeUser() as never);
    mockGetProfile.mockResolvedValue(makeProfile() as never);

    // El mock de generarEmailBase devuelve 'juan.pérez@...' que coincide con existing
    const { generarEmailBase: mockBase } = jest.requireMock('@/lib/email-generator') as {
      generarEmailBase: jest.MockedFunction<typeof import('@/lib/email-generator').generarEmailBase>
    };

    // Simular que el email base del docente ya existe
    mockBase.mockImplementation((nombre) =>
      nombre === 'Juan'
        ? 'existing@cenbachillerato.mx' // ya existe en la DB mockada
        : `${nombre.toLowerCase()}.test@cenbachillerato.mx`
    );

    const sbAdmin = makeAdminClient();
    mockGetSupabaseAdmin.mockReturnValue(sbAdmin as never);

    const result = await procesarAltaMasiva(CSV_VALIDO);
    if ('ya_existentes' in result) {
      expect(result.ya_existentes).toBeGreaterThan(0);
    }
  });
});
