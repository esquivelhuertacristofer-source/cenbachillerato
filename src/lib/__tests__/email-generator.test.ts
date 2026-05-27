/**
 * @jest-environment node
 */

import {
  generarEmailBase,
  generarEmailConDesempate,
  resolverEmailUnico,
  generarPassword,
} from '@/lib/email-generator';

describe('generarEmailBase', () => {
  test('genera email básico sin acentos', () => {
    expect(generarEmailBase('María', 'López')).toBe('maria.lopez@cenbachillerato.mx');
  });

  test('quita acentos agudos y graves', () => {
    expect(generarEmailBase('José', 'García')).toBe('jose.garcia@cenbachillerato.mx');
  });

  test('transforma ñ a n', () => {
    expect(generarEmailBase('Iñaki', 'Núñez')).toBe('inaki.nunez@cenbachillerato.mx');
  });

  test('convierte a minúsculas', () => {
    expect(generarEmailBase('CARLOS', 'RODRIGUEZ')).toBe('carlos.rodriguez@cenbachillerato.mx');
  });

  test('elimina espacios internos', () => {
    expect(generarEmailBase('Ana María', 'Ruiz')).toBe('anamaria.ruiz@cenbachillerato.mx');
  });

  test('maneja nombres simples sin acentos', () => {
    expect(generarEmailBase('Pedro', 'Gomez')).toBe('pedro.gomez@cenbachillerato.mx');
  });
});

describe('generarEmailConDesempate', () => {
  test('incluye apellido materno', () => {
    expect(
      generarEmailConDesempate('María', 'López', 'Hernández')
    ).toBe('maria.lopez.hernandez@cenbachillerato.mx');
  });

  test('incluye sufijo numérico cuando se pasa', () => {
    expect(
      generarEmailConDesempate('María', 'López', 'Hernández', 2)
    ).toBe('maria.lopez.hernandez2@cenbachillerato.mx');
  });

  test('sufijo 3', () => {
    expect(
      generarEmailConDesempate('María', 'López', 'Hernández', 3)
    ).toBe('maria.lopez.hernandez3@cenbachillerato.mx');
  });
});

describe('resolverEmailUnico', () => {
  test('usa base si no hay colisión', () => {
    const result = resolverEmailUnico('María', 'López', 'Hernández', new Set(), new Set());
    expect(result).toBe('maria.lopez@cenbachillerato.mx');
  });

  test('usa apellido_materno si base colisiona en DB', () => {
    const existingEmails = new Set(['maria.lopez@cenbachillerato.mx']);
    const result = resolverEmailUnico('María', 'López', 'Hernández', existingEmails, new Set());
    expect(result).toBe('maria.lopez.hernandez@cenbachillerato.mx');
  });

  test('usa apellido_materno si base colisiona en el lote', () => {
    const lote = new Set(['maria.lopez@cenbachillerato.mx']);
    const result = resolverEmailUnico('María', 'López', 'Hernández', new Set(), lote);
    expect(result).toBe('maria.lopez.hernandez@cenbachillerato.mx');
  });

  test('usa sufijo numérico si también hay colisión con materno', () => {
    const existingEmails = new Set([
      'maria.lopez@cenbachillerato.mx',
      'maria.lopez.hernandez@cenbachillerato.mx',
    ]);
    const result = resolverEmailUnico('María', 'López', 'Hernández', existingEmails, new Set());
    expect(result).toBe('maria.lopez.hernandez2@cenbachillerato.mx');
  });

  test('usa sufijo 3 cuando 2 también está ocupado', () => {
    const existingEmails = new Set([
      'maria.lopez@cenbachillerato.mx',
      'maria.lopez.hernandez@cenbachillerato.mx',
      'maria.lopez.hernandez2@cenbachillerato.mx',
    ]);
    const result = resolverEmailUnico('María', 'López', 'Hernández', existingEmails, new Set());
    expect(result).toBe('maria.lopez.hernandez3@cenbachillerato.mx');
  });

  test('respeta colisiones mixtas DB + lote', () => {
    const existingEmails = new Set(['maria.lopez@cenbachillerato.mx']);
    const lote = new Set(['maria.lopez.hernandez@cenbachillerato.mx']);
    const result = resolverEmailUnico('María', 'López', 'Hernández', existingEmails, lote);
    expect(result).toBe('maria.lopez.hernandez2@cenbachillerato.mx');
  });

  test('lanza error si no puede generar email único en 100 intentos', () => {
    const allEmails = new Set([
      'a.b@cenbachillerato.mx',
      'a.b.c@cenbachillerato.mx',
      ...Array.from({ length: 99 }, (_, i) => `a.b.c${i + 2}@cenbachillerato.mx`),
    ]);
    expect(() =>
      resolverEmailUnico('A', 'B', 'C', allEmails, new Set())
    ).toThrow('Imposible generar email único');
  });
});

describe('generarPassword', () => {
  test('empieza con Bachi-', () => {
    const pw = generarPassword();
    expect(pw).toMatch(/^Bachi-/);
  });

  test('tiene exactamente 14 caracteres (Bachi- + 8)', () => {
    const pw = generarPassword();
    expect(pw).toHaveLength(14);
  });

  test('parte aleatoria solo contiene alfanuméricos minúsculas', () => {
    const pw = generarPassword();
    const parte = pw.slice(6); // después de 'Bachi-'
    expect(parte).toMatch(/^[a-z0-9]{8}$/);
  });

  test('genera passwords distintos en sucesivas llamadas', () => {
    const pws = new Set(Array.from({ length: 20 }, () => generarPassword()));
    expect(pws.size).toBeGreaterThan(15); // altamente improbable que colisionen
  });
});
