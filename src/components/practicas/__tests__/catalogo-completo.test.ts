/**
 * El registro de laboratorios manda, y los dos espejos generados tienen que
 * seguirlo.
 *
 * POR QUÉ EXISTE ESTA PRUEBA: los espejos se generan con un guion, y el guion
 * que producía `lab-catalogo.ts` era efímero y se perdió. El espejo se quedó
 * congelado en 95 entradas mientras el registro llegaba a 211, y 116
 * laboratorios pasaron meses enseñándole al alumno el slug embellecido
 * ("Adn Dogma Central 3d") en vez de su título. Nadie se enteró porque nada lo
 * comprobaba.
 *
 * Si esta prueba falla, el arreglo no es editar los espejos a mano:
 *   npx tsx scripts/generar-lab-catalogo.ts
 *   npx tsx scripts/generar-lab-ubicacion.ts
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { PRACTICAS_META } from "../registry-meta";
import { LAB_CATALOGO, nombreLab } from "@/lib/practicas/lab-catalogo";
import { LAB_UBICACION } from "@/lib/practicas/lab-ubicacion.generated";

const slugs = Object.keys(PRACTICAS_META);

const RAIZ = process.cwd();
const REGISTRY = readFileSync(resolve(RAIZ, "src/components/practicas/registry.tsx"), "utf8");

/** slug → archivo del componente, leídos del registry. */
function archivoDe(slug: string): string | null {
  const rutas = new Map<string, string>();
  for (const m of REGISTRY.matchAll(/const\s+(\w+)\s*=\s*dynamic\(\s*\(\)\s*=>\s*import\(\s*["']\.\/labs\/([\w./-]+)["']/g)) {
    if (m[1] && m[2]) rutas.set(m[1], m[2]);
  }
  const bloque = REGISTRY.slice(REGISTRY.indexOf("export const PRACTICAS"));
  for (const m of bloque.matchAll(/^\s+"?([a-z0-9_-]+)"?:\s*\{[^}]*Component:\s*(\w+)/gm)) {
    if (m[1] === slug) return (m[2] && rutas.get(m[2])) ?? null;
  }
  return null;
}

describe("espejos del registro de laboratorios", () => {
  it("hay laboratorios que comprobar", () => {
    expect(slugs.length).toBeGreaterThan(200);
  });

  it("todos los laboratorios tienen título en el catálogo", () => {
    const sinTitulo = slugs.filter((s) => !LAB_CATALOGO[s]);
    expect(sinTitulo).toEqual([]);
  });

  it("todos los laboratorios tienen ubicación declarada", () => {
    const sinUbicacion = slugs.filter((s) => !LAB_UBICACION[s]);
    expect(sinUbicacion).toEqual([]);
  });

  it("el catálogo no inventa laboratorios que el registro no tiene", () => {
    const sobrantes = Object.keys(LAB_CATALOGO).filter((s) => !PRACTICAS_META[s]);
    expect(sobrantes).toEqual([]);
  });

  it("el título del catálogo coincide con el del registro", () => {
    const distintos = slugs.filter((s) => LAB_CATALOGO[s]?.titulo !== PRACTICAS_META[s]?.titulo);
    expect(distintos).toEqual([]);
  });

  it("ningún laboratorio cae al nombre derivado del slug", () => {
    // nombreLab() sin título devuelve el slug con guiones y mayúsculas: eso es
    // exactamente lo que el alumno no debe leer nunca.
    const feos = slugs.filter((s) => nombreLab(s) === s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()));
    expect(feos).toEqual([]);
  });

  it("cada laboratorio resuelve a un componente que existe en disco", () => {
    // Sin esto, la tarjeta se pinta y el enlace abre una pantalla vacía: el
    // laboratorio "se ve" en el listado y no existe al entrar.
    const rotos = slugs.filter((s) => {
      const archivo = archivoDe(s);
      return !archivo || !existsSync(resolve(RAIZ, "src/components/practicas/labs", `${archivo}.tsx`));
    });
    expect(rotos).toEqual([]);
  });

  it("la ubicación, cuando existe, apunta a una UAC con forma de código", () => {
    const malas = slugs
      .map((s) => LAB_UBICACION[s]!.uacCodigo)
      .filter((u): u is string => u !== null)
      .filter((u) => !/^[A-Z]{2,6}-[IVX]+$/.test(u));
    expect(malas).toEqual([]);
  });
});
