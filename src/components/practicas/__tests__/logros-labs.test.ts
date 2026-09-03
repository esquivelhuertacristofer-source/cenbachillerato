/**
 * Dos cosas que se rompen sin dar la cara:
 *
 *  1. Un objetivo cuyo `done` depende del modo activo se DESMARCA al cambiar de
 *     pestaña. El alumno hace el trabajo y el laboratorio se lo quita. Se
 *     arregla leyendo del enganche `useLogros`, no de `o.done`.
 *  2. Un laboratorio que lleva objetivos pero no registra marca: el alumno los
 *     cumple, cierra y no queda nada. Se arregla con `useEstrellas`.
 */
import { readFileSync, readdirSync } from "fs";
import { resolve } from "path";

const LABS_DIR = resolve(process.cwd(), "src/components/practicas/labs");
const SHELLS = readdirSync(LABS_DIR).filter((f) => f.startsWith("Lab") && f.endsWith(".tsx"));

/**
 * Los archivos están guardados con CRLF. Sin normalizar, un patrón anclado en
 * `
  const` no casa con NINGUNO y la prueba pasa revisando cero laboratorios
 * — verde por no mirar, que es el peor resultado posible aquí.
 */
function leer(archivo: string): string {
  return readFileSync(resolve(LABS_DIR, archivo), "utf8").replace(/\r\n/g, "\n");
}

/** El cuerpo de `const objetivos = [ … ];`, si el lab lo tiene. */
function listaObjetivos(src: string): string | null {
  return src.match(/\n {2}const objetivos = \[\n((?:.*?\n)*?) {2}\];\n/)?.[1] ?? null;
}

/** El bloque JSX que pinta los objetivos. */
function renderObjetivos(src: string): string | null {
  return src.match(/\{objetivos\.map\(\(o, i\) => \(\n(?:.*?\n)*?\s*\)\)\}/)?.[0] ?? null;
}

const CON_OBJETIVOS = SHELLS.map((f) => ({ f, src: leer(f) }))
  .filter((x) => listaObjetivos(x.src) !== null);

describe("objetivos de los laboratorios", () => {
  it("hay laboratorios con objetivos guiados", () => {
    expect(CON_OBJETIVOS.length).toBeGreaterThan(100);
  });

  it.each(CON_OBJETIVOS.map((x) => [x.f] as const))(
    "%s: ningún objetivo se desmarca al cambiar de modo",
    (archivo) => {
      const src = leer(archivo);
      const lista = listaObjetivos(src)!;
      const transitorio = /done:\s*[^\n]*(?:modo|fase) ===/.test(lista);
      if (!transitorio) return;
      // Con un `done` que depende del modo, el render TIENE que leer del
      // enganche que recuerda lo cumplido, no del valor en vivo.
      const render = renderObjetivos(src);
      expect(src).toContain("useLogros");
      if (render) expect(render).not.toMatch(/\bo\.done\b/);
    }
  );

  it.each(CON_OBJETIVOS.map((x) => [x.f] as const))(
    "%s: la marca del alumno se guarda en alguna parte",
    (archivo) => {
      const src = leer(archivo);
      expect(src).toContain("useEstrellas");
    }
  );
});
