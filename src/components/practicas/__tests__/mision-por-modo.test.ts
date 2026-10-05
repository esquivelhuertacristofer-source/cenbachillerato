/**
 * LA BARRA DE MISIONES RESPETA EL MODO.
 *
 * Defecto que cubre: en el laboratorio de leyes de Newton, estando en «Polea»,
 * la barra pedía «Encuentra el ángulo exacto…», que solo se puede hacer en el
 * plano inclinado. `elegirMision` decide qué misión se enseña.
 */
import { elegirMision } from "@/components/practicas/labs/_shell";
import type { ObjetivoLab } from "@/components/practicas/labs/_objetivos";

const MODOS = [
  { id: "horizontal", etiqueta: "Horizontal" },
  { id: "inclinado", etiqueta: "Plano inclinado" },
  { id: "polea", etiqueta: "Polea" },
];

const NEWTON: ObjetivoLab[] = [
  { txt: "ángulo", done: false, modo: "inclinado" },
  { txt: "plano", done: false, modo: "inclinado" },
  { txt: "pasa", done: false, modo: ["horizontal", "polea"] },
  { txt: "equilibrio", done: false },
  { txt: "rompe", done: false },
];

describe("elegirMision", () => {
  it("en Polea no enseña la misión del plano inclinado", () => {
    const logros = [false, false, true, false, false];
    const r = elegirMision(NEWTON, logros, { opciones: MODOS, valor: "polea" });
    expect(r.indice).toBe(3);
    expect(r.cambiarA).toBeNull();
  });

  it("si el modo actual ya no tiene pendientes, propone cambiar de modo", () => {
    const logros = [false, true, true, true, true];
    const r = elegirMision(NEWTON, logros, { opciones: MODOS, valor: "polea" });
    expect(r.indice).toBe(0);
    expect(r.cambiarA?.id).toBe("inclinado");
  });

  it("acepta una lista de modos", () => {
    const logros = [true, true, false, true, true];
    expect(elegirMision(NEWTON, logros, { opciones: MODOS, valor: "horizontal" })).toEqual({ indice: 2, cambiarA: null });
    expect(elegirMision(NEWTON, logros, { opciones: MODOS, valor: "inclinado" }).cambiarA?.id).toBe("horizontal");
  });

  it("sin selector de modos es la regla de siempre: la primera pendiente", () => {
    expect(elegirMision(NEWTON, [true, false, false, false, false])).toEqual({ indice: 1, cambiarA: null });
  });

  it("todas cumplidas → -1", () => {
    expect(elegirMision(NEWTON, [true, true, true, true, true], { opciones: MODOS, valor: "polea" }).indice).toBe(-1);
  });

  it("un modo que el selector no ofrece vale en cualquier modo (no se esconde)", () => {
    const objs: ObjetivoLab[] = [{ txt: "x", done: false, modo: "fantasma" }, { txt: "y", done: false, modo: "polea" }];
    expect(elegirMision(objs, [false, false], { opciones: MODOS, valor: "horizontal" })).toEqual({ indice: 0, cambiarA: null });
  });
});
