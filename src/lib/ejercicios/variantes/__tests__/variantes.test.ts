/** @jest-environment node */
/**
 * Banco de ejercicios con variantes.
 *
 * 1. Cada generador, con 200 semillas: respuesta finita, enunciado sin
 *    «undefined»/«NaN», respuesta presente en el último paso y calificable
 *    con `coincideNumero` (también escrita como se muestra al alumno).
 * 2. Cada generador resuelto con los datos ORIGINALES del ejercicio da la
 *    respuesta que se calculó a mano a partir del enunciado publicado.
 */
import fs from 'fs';
import path from 'path';
import {
  DEFINICIONES, GENERADORES, EJERCICIOS_SIN_VARIANTE, generarVariante, tieneVariantes, fmt, mulberry32,
} from '../index';
import { poli, redondear } from '../motor';
import { coincideNumero, leerNumero } from '@/lib/activities/leer-numero';

const CODIGOS = Object.keys(GENERADORES).sort();
const SEMILLAS = Array.from({ length: 200 }, (_, i) => i * 7919 + 1);
const BASURA = /undefined|NaN|Infinity|\[object Object\]/;

/**
 * Respuesta de cada ejercicio con sus números ORIGINALES, verificada a mano
 * contra la fórmula (entre paréntesis, la cuenta).
 */
const ESPERADO: Record<string, number> = {
  'CNEYT-I-P02-A6': 2.7, // 270 / 100
  'CNEYT-I-P04-A6': 20, // 20 / (20 + 80) × 100
  'CNEYT-I-P06-A6': 1750, // 1.75 × 1000 mm
  'CNEYT-II-P05-A2': 200, // (80 × 5) / 2
  'CNEYT-II-P11-A2': 3600, // 0.8 × 1.5 × 18 / 0.006
  'CNEYT-III-P02-A2': 10, // 10 000 × 0.1³
  'CNEYT-III-P09-A2': 4, // O en productos: 1×2 (CO₂) + 2×1 (H₂O)
  'CNEYT-III-P10-A2': 1, // 500 / 500
  'CNEYT-III-P11-A2': 6, // 6 O₂ por glucosa
  'CNEYT-IV-P01-A2': 4, // 4 Fe + 3 O₂ → 2 Fe₂O₃
  'CNEYT-IV-P09-A2': 1.1, // 0.34 − (−0.76)
  'CNEYT-IV-P10-A2': 6.25, // 0.5² / (0.2 × 0.2)
  'CNEYT-IV-P11-A2': 30, // 5 × 6
  'CNEYT-V-P02-A2': 150, // ½ × 3 × 10²
  'CNEYT-V-P03-A2': 113.4, // 70 × 1.62
  'CNEYT-V-P07-A2': 30.6, // 120² / 470 = 30.64
  'CNEYT-V-P09-A2': 78480, // 1000 × 9.81 × 8
  'CNEYT-VI-P03-A2': 36, // 2 + 2 + 32
  'CNEYT-VI-P05-A2': 25, // aa en Aa × Aa: 1/4
  'CNEYT-VI-P09-A2': 8388608, // 2²³
  'CNEYT-VI-P10-A2': 50, // 1000 / 20
  'PM-I-P01-A2': 5, // 2 × 10 / 4
  'PM-I-P02-A2': 11, // 8 − (−3)
  'PM-I-P04-A2': 535.5, // 850 × 0.7 × 0.9
  'PM-I-P05-A2': 4, // 5 × 12 / 15
  'PM-I-P05-A6': 450, // 300 × 6 / 4
  'PM-I-P06-A2': 450000, // 25 × 10 × 1.8 × 1000
  'PM-I-P06-A6': 2, // 0.000002 × 1 000 000
  'PM-I-P08-A2': 700, // 7 centenas
  'PM-I-P09-A2': 32, // 2⁵
  'PM-I-P09-A6': 243, // 3⁵
  'PM-I-P10-A2': 14, // 2 + 12
  'PM-I-P10-A6': 14, // 12 ÷ 3 + 10
  'PM-II-P01-A2': 49, // 4 + 9 × 5
  'PM-II-P09-A8': 5, // 12 − 7
  'PM-III-P01-A2': 4.84, // √23.4
  'PM-III-P02-A2': 7, // (−5 + 33) / 4
  'PM-III-P03-A2': 1100, // 900 + 200
  'PM-III-P04-A2': 22.62, // π × 1.5² × 3.2
  'PM-III-P05-A2': 24.8, // 1.6 × 12.4 / 0.8
  'PM-III-P05-A3': 10.32, // 1.72 × 6
  'PM-III-P06-A2': 9, // h(15) = −9 + 18
  'PM-III-P07-A2': 5, // (950 − 200) / 150
  'PM-III-P08-A2': 8, // 12 − 4
  'PM-III-P09-A2': 6, // (120 − 30) / 15
  'PM-III-P10-A2': 40.84, // 1.07 × 30 + 8.74
  'PM-IV-P01-A2': 30, // 90 − 6 × 10
  'PM-IV-P02-A2': 21, // −20 + 40 + 1
  'PM-IV-P03-A2': 12.2, // 15 × 0.7002 + 1.70
  'PM-IV-P05-A2': 64.26, // √(15425 − 15200 × 0.7431)
  'PM-IV-P06-A2': 10, // √(36 + 64)
  'PM-IV-P08-A2': 1, // 0.25 × 2²
  'PM-V-P01-A2': 6, // 3 + 3
  'PM-V-P02-A2': 4, // 2 + 2
  'PM-V-P03-A2': 4, // f′(2) para x²
  'PM-V-P04-A2': 8, // g′(x) = 9x² − 4x + 3 en x = 1
  'PM-V-P05-A2': 1, // 2(1) / (1 + 1)
  'PM-V-P06-A2': -22, // f(3) = 27 − 27 − 27 + 5
  'PM-V-P07-A2': 6.83, // ∛(1000/π)
  'PM-V-P08-A2': 3.0067, // 3 + 0.04/6
  'PM-V-P09-A2': 2, // f(−1) = −1 + 3
  'PM-V-P10-A2': 16, // ½ × 4 × 8
  'PM-VI-P02-A2': 100, // 20/20
  'PM-VI-P03-A2': 8500, // 5.º dato de 9
  'PM-VI-P04-A2': 10, // √(500/5)
  'PM-VI-P06-A2': 66.67, // 0.09 / 0.135
  'PM-VI-P07-A2': 25, // 1.º grado: 250 × 0.10
  'PM-VI-P09-A2': 97.72, // Φ(2)
  'PM-VI-P10-A2': 10, // 40 − (22 + 18 − 10)
  'PM-VI-P11-A2': 10, // C(5,3)
  'PM-VI-P12-A2': 60, // 30/50
};

describe('motor', () => {
  test('mulberry32 es reproducible y está en [0, 1)', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    for (let i = 0; i < 1000; i++) {
      const x = a();
      expect(x).toBe(b());
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
  });

  test('fmt usa formato de México y leerNumero lo lee de vuelta', () => {
    expect(fmt(1750)).toBe('1,750');
    expect(fmt(8388608)).toBe('8,388,608');
    expect(fmt(-22)).toBe('−22');
    expect(fmt(3.00666667)).toBe('3.0067');
    expect(fmt(2.5, 2, 2)).toBe('2.50');
    expect(fmt(0.0005, 4)).toBe('0.0005');
    for (const n of [0, 1, 12.5, -3.25, 1000, 12345.67, 450000, 0.125]) {
      expect(leerNumero(fmt(n))).toBeCloseTo(n, 6);
    }
  });

  test('poli escribe polinomios con signos tipográficos', () => {
    expect(poli([1, -3, -9, 5])).toBe('x³ − 3x² − 9x + 5');
    expect(poli([1, 0, -12, 0])).toBe('x³ − 12x');
    expect(poli([-1, 2])).toBe('−x + 2');
  });

  test('redondear evita −0', () => {
    expect(Object.is(redondear(-0.0001, 2), 0)).toBe(true);
  });
});

describe('registro', () => {
  test('hay 71 generadores y 7 ejercicios documentados sin variante (78 en total, sin traslape)', () => {
    expect(CODIGOS).toHaveLength(71);
    expect(Object.keys(EJERCICIOS_SIN_VARIANTE)).toHaveLength(7);
    for (const c of Object.keys(EJERCICIOS_SIN_VARIANTE)) expect(tieneVariantes(c)).toBe(false);
  });

  test('cada generador tiene su caso verificado a mano', () => {
    expect(Object.keys(ESPERADO).sort()).toEqual(CODIGOS);
  });

  test('generarVariante: reproducible con semilla y null sin generador', () => {
    expect(generarVariante('PM-I-P05-A6', 123)).toEqual(generarVariante('PM-I-P05-A6', 123));
    expect(generarVariante('NO-EXISTE', 1)).toBeNull();
    expect(generarVariante('toString', 1)).toBeNull();
    expect(tieneVariantes(undefined)).toBe(false);
    expect(generarVariante('PM-I-P05-A6')).not.toBeNull();
  });

  // El volcado de auditoría puede no estar en todos los clones del repo.
  const volcado = path.join(process.cwd(), 'scripts', '.auditoria', 'actividades.json');
  (fs.existsSync(volcado) ? test : test.skip)('cubre los 78 ejercicios del volcado de auditoría', () => {
    const acts = JSON.parse(fs.readFileSync(volcado, 'utf8')) as { codigo: string; tipo: string }[];
    const codigos = acts.filter((a) => a.tipo === 'ejercicio_matematico').map((a) => a.codigo).sort();
    const cubiertos = [...CODIGOS, ...Object.keys(EJERCICIOS_SIN_VARIANTE)].sort();
    expect(cubiertos).toEqual(codigos);
  });
});

describe.each(CODIGOS)('%s', (codigo) => {
  test('200 semillas: variantes válidas y calificables', () => {
    const generar = GENERADORES[codigo]!;
    const problemas = new Set<string>();
    for (const semilla of SEMILLAS) {
      const v = generar(mulberry32(semilla));
      expect(Number.isFinite(v.respuesta)).toBe(true);
      expect(Number.isFinite(v.tolerancia)).toBe(true);
      expect(v.tolerancia).toBeGreaterThanOrEqual(0);
      expect(v.problema).not.toMatch(BASURA);
      expect(v.respuestaTexto).not.toMatch(BASURA);
      expect(v.pasos.length).toBeGreaterThan(0);
      for (const p of v.pasos) expect(p).not.toMatch(BASURA);
      // La respuesta aparece, tal como se le muestra al alumno, en el último paso.
      expect(v.pasos[v.pasos.length - 1]).toContain(fmt(v.respuesta));
      // Se califica a sí misma, también escrita en el formato que se muestra.
      expect(coincideNumero(String(v.respuesta), String(v.respuesta), v.tolerancia)).toBe(true);
      expect(coincideNumero(fmt(v.respuesta), String(v.respuesta), v.tolerancia)).toBe(true);
      problemas.add(v.problema);
    }
    // De verdad cambia los números.
    expect(problemas.size).toBeGreaterThanOrEqual(5);
  });

  test('con los datos originales reproduce la respuesta calculada a mano', () => {
    const v = DEFINICIONES[codigo]!.original();
    expect(v.respuesta).toBeCloseTo(ESPERADO[codigo]!, 6);
    expect(v.pasos[v.pasos.length - 1]).toContain(fmt(v.respuesta));
  });
});
