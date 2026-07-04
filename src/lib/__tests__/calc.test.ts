/**
 * @jest-environment node
 */

import { evaluar, formatearResultado } from "@/lib/herramientas/calc";

const val = (src: string, modo?: "deg" | "rad") => {
  const r = evaluar(src, modo);
  if (!r.ok) throw new Error(`esperaba ok pero falló: ${r.error}`);
  return r.value;
};

describe("evaluar — aritmética básica", () => {
  test("suma y resta", () => {
    expect(val("2+3-1")).toBe(4);
  });
  test("precedencia × sobre +", () => {
    expect(val("2+3*4")).toBe(14);
  });
  test("paréntesis cambian la precedencia", () => {
    expect(val("(2+3)*4")).toBe(20);
  });
  test("símbolos × y ÷", () => {
    expect(val("6÷2×3")).toBe(9);
  });
  test("decimales con coma o punto", () => {
    expect(val("1,5+2.5")).toBe(4);
  });
  test("unario negativo", () => {
    expect(val("-5+3")).toBe(-2);
    expect(val("3*-2")).toBe(-6);
  });
});

describe("evaluar — potencias y postfijos", () => {
  test("potencia asociativa a la derecha", () => {
    expect(val("2^3^2")).toBe(512); // 2^(3^2)
  });
  test("factorial", () => {
    expect(val("5!")).toBe(120);
  });
  test("porcentaje sufijo", () => {
    expect(val("50%")).toBe(0.5);
    expect(val("200*10%")).toBe(20);
  });
});

describe("evaluar — funciones y constantes", () => {
  test("raíz cuadrada y símbolo √", () => {
    expect(val("sqrt(16)")).toBe(4);
    expect(val("√(81)")).toBe(9);
  });
  test("π y e", () => {
    expect(val("pi")).toBeCloseTo(Math.PI, 10);
    expect(val("π")).toBeCloseTo(Math.PI, 10);
    expect(val("e")).toBeCloseTo(Math.E, 10);
  });
  test("trigonometría en grados", () => {
    expect(val("sin(30)", "deg")).toBeCloseTo(0.5, 10);
    expect(val("cos(60)", "deg")).toBeCloseTo(0.5, 10);
  });
  test("trigonometría en radianes", () => {
    expect(val("sin(pi/2)", "rad")).toBeCloseTo(1, 10);
  });
  test("logaritmos", () => {
    expect(val("log(1000)")).toBeCloseTo(3, 10);
    expect(val("ln(e)")).toBeCloseTo(1, 10);
  });
});

describe("evaluar — errores controlados (nunca lanza)", () => {
  test("división entre cero", () => {
    const r = evaluar("1/0");
    expect(r.ok).toBe(false);
  });
  test("raíz de negativo", () => {
    expect(evaluar("sqrt(-4)").ok).toBe(false);
  });
  test("paréntesis sin cerrar", () => {
    expect(evaluar("(2+3").ok).toBe(false);
  });
  test("carácter no permitido", () => {
    expect(evaluar("2 & 3").ok).toBe(false);
  });
  test("vacío", () => {
    expect(evaluar("   ").ok).toBe(false);
  });
});

describe("formatearResultado", () => {
  test("entero limpio", () => {
    expect(formatearResultado(120)).toBe("120");
  });
  test("mata el ruido de coma flotante", () => {
    expect(formatearResultado(0.1 + 0.2)).toBe("0.3");
  });
  test("notación científica para magnitudes extremas", () => {
    expect(formatearResultado(6.022e23)).toContain("e");
  });
});
