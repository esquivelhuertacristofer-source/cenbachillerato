/**
 * Cada término que la expedición le enseña al alumno tiene su viñeta.
 *
 * Sin viñeta el concepto se dibuja con un icono genérico: no se ve roto, se ve
 * pobre, y por eso nadie lo reporta. La prueba mira las dos puntas —el índice
 * de las imágenes generadas y el archivo que está en disco— porque un índice
 * que promete una imagen inexistente sí le deja al alumno un recuadro roto.
 */
import { existsSync } from "fs";
import { resolve } from "path";
import { FICHAS } from "@/components/practicas/expedicion/fichas-registry.generated";
import { fichaDeExpedicion } from "@/components/practicas/expedicion/terminos-de-ficha";
import { imagenDeTermino } from "@/lib/practicas/terminos-imagen";

/** Los mismos términos que se pintan: los conceptos y las seis parejas del cierre. */
async function terminosVisibles(): Promise<Array<{ slug: string; termino: string }>> {
  const out: Array<{ slug: string; termino: string }> = [];
  for (const [slug, cargar] of Object.entries(FICHAS)) {
    const f = fichaDeExpedicion(await cargar());
    for (const c of [...f.conceptos, ...f.glosario.slice(0, 6)]) out.push({ slug, termino: c.termino });
  }
  return out;
}

describe("viñetas de los términos", () => {
  it("todo término visible tiene viñeta y la viñeta existe en disco", async () => {
    const sinViñeta: string[] = [];
    const rotas: string[] = [];
    for (const { slug, termino } of await terminosVisibles()) {
      const src = imagenDeTermino(slug, termino);
      if (!src) sinViñeta.push(`${slug} → ${termino}`);
      else if (!existsSync(resolve(process.cwd(), "public", src.replace(/^\//, "")))) rotas.push(`${slug} → ${src}`);
    }
    expect({ sinViñeta, rotas }).toEqual({ sinViñeta: [], rotas: [] });
  }, 60_000);
});
