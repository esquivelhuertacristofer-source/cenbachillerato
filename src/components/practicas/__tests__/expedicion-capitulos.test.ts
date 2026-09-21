/**
 * Toda expedición se arma con sus tres capítulos.
 *
 * El capítulo 2 (el laboratorio) siempre existe; los otros dos salen de los
 * términos de la ficha. Si un laboratorio se queda sin ellos, el alumno entra
 * a una «expedición» que es sólo el laboratorio de siempre con una portada
 * encima, y eso no se ve roto —se ve pobre—, así que nadie lo reporta.
 */
import { FICHAS } from "@/components/practicas/expedicion/fichas-registry.generated";
import { capitulosDeFicha, fichaDeExpedicion } from "@/components/practicas/expedicion/terminos-de-ficha";
import type { FichaTeoricaData } from "@/components/practicas/labs/_ficha";

function ficha(conceptos: number, glosario: number): FichaTeoricaData {
  const term = (n: number, p: string) => Array.from({ length: n }, (_, i) => ({ termino: `${p}${i}`, definicion: "d" }));
  return { ancla: "A", marcoTeorico: ["m"], objetivos: [], materiales: [], conceptos: term(conceptos, "c"), glosario: term(glosario, "g") };
}

describe("capítulos de la expedición", () => {
  it("un laboratorio sin ficha conserva su capítulo de laboratorio", () => {
    expect(capitulosDeFicha(null)).toBe(1);
  });

  it("los términos se toman de la lista que el laboratorio sí llenó", () => {
    expect(capitulosDeFicha(ficha(6, 0))).toBe(3);
    expect(capitulosDeFicha(ficha(0, 6))).toBe(3);
    expect(capitulosDeFicha(ficha(6, 6))).toBe(3);
  });

  it("no inventa términos donde no los hay", () => {
    expect(capitulosDeFicha(ficha(0, 0))).toBe(1);
    expect(capitulosDeFicha(ficha(2, 0))).toBe(2); // hay qué descubrir, no qué comprobar
  });

  it("no duplica el contenido cuando las dos listas existen", () => {
    const f = fichaDeExpedicion(ficha(6, 6));
    expect(f.conceptos[0]!.termino).toBe("c0");
    expect(f.glosario[0]!.termino).toBe("g0");
  });

  it("los 187 laboratorios registrados arman los tres capítulos", async () => {
    const flojos: string[] = [];
    for (const [slug, cargar] of Object.entries(FICHAS)) {
      const f = await cargar();
      if (capitulosDeFicha(f) < 3) flojos.push(`${slug} (conceptos=${f.conceptos.length}, glosario=${f.glosario.length})`);
    }
    expect(flojos).toEqual([]);
  }, 60_000);
});
