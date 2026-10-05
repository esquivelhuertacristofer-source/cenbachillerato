/**
 * Toda guía publicada en public/lecturas-guia/ tiene que estar bien formada:
 * una guía rota no rompe la lectura (cae a la vista de siempre), pero se
 * perdería en silencio. Aquí no hay BD: que cubra el número real de párrafos
 * lo revisa scripts/validar-lecturas-guia.ts contra la base.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { erroresGuia, guiaValida, type LecturaGuia } from "../lectura-guia";

const DIR = join(process.cwd(), "public", "lecturas-guia");
const archivos = readdirSync(DIR).filter((f) => f.endsWith(".json"));

describe("guías de lectura publicadas", () => {
  it("hay guías", () => {
    expect(archivos.length).toBeGreaterThan(0);
  });

  it.each(archivos)("%s está bien formada", (f) => {
    const g = JSON.parse(readFileSync(join(DIR, f), "utf8")) as LecturaGuia;
    expect(g.codigo + ".json").toBe(f);
    expect(erroresGuia(g)).toEqual([]);
  });
});

describe("guiaValida", () => {
  const g: LecturaGuia = {
    codigo: "X",
    conceptos: [],
    partes: [{ parrafos: [0, 1], titulo: "a", idea: "b" }, { parrafos: [2], titulo: "c", idea: "d" }],
  };
  it("acepta la guía que cubre todos los párrafos en orden", () => {
    expect(guiaValida(g, "uno\n\ndos\n\ntres")).toBe(true);
  });
  it("rechaza la guía si el texto tiene más o menos párrafos", () => {
    expect(guiaValida(g, "uno\n\ndos")).toBe(false);
    expect(guiaValida(g, "uno\n\ndos\n\ntres\n\ncuatro")).toBe(false);
  });
});
