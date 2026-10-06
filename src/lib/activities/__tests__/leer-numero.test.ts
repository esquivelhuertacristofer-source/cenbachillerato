import { leerNumero, coincideNumero } from '../leer-numero';

describe('leerNumero', () => {
  it.each([
    ['2.7 g/cm³ (aluminio)', 2.7],
    ['2,7', 2.7],
    ['0,125', 0.125],
    ['8,500', 8500],
    ['8500', 8500],
    ['1 250 000', 1250000],
    ['$1,250', 1250],
    ['$ 12,404.50', 12404.5],
    ['20% en masa', 20],
    ['-3', -3],
    ['−3', -3],
    ['3/4', 0.75],
    ['2 × 10⁻⁶ m', 2e-6],
    ['2x10^-6', 2e-6],
    ['2 * 10^(-6)', 2e-6],
    ['2e-6', 2e-6],
    ['6.02 × 10²³', 6.02e23],
    ['66.67', 66.67],
    ['.5', 0.5],
  ])('«%s» → %d', (texto, esperado) => {
    expect(leerNumero(texto)).toBeCloseTo(esperado as number, 12);
  });

  it.each(['', 'x = 3', '(a) 32, (b) 9', 'aluminio', undefined, null])('«%s» no es número', (texto) => {
    expect(leerNumero(texto as string)).toBeNaN();
  });

  it('una coma seguida de dos cifras es decimal, no miles', () => {
    expect(leerNumero('12,50')).toBe(12.5);
  });
});

describe('coincideNumero', () => {
  it('acepta «8,500» cuando la respuesta es 8500', () => {
    expect(coincideNumero('8,500', '8500')).toBe(true);
  });
  it('respeta la tolerancia absoluta', () => {
    expect(coincideNumero('2.74', '2.7 g/cm³', 0.05)).toBe(true);
    expect(coincideNumero('2.8', '2.7 g/cm³', 0.05)).toBe(false);
  });
  it('en notación científica compara en relativo: 0 no pasa por 2 × 10⁻⁶', () => {
    expect(coincideNumero('0.000002', '2 × 10⁻⁶', 0.05)).toBe(true);
    expect(coincideNumero('2e-6', '2 × 10⁻⁶', 0)).toBe(true);
    expect(coincideNumero('0', '2 × 10⁻⁶', 0.05)).toBe(false);
  });
  it('sin respuesta esperada legible, nunca acierta', () => {
    expect(coincideNumero('3', undefined)).toBe(false);
    expect(coincideNumero('3', '(a) 3; (b) 4')).toBe(false);
  });
});
