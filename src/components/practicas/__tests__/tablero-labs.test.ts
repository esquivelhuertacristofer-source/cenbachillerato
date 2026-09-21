/**
 * El CSS del tablero se inserta con un codemod dentro de una plantilla de JS.
 * Un paréntesis de más no rompe la compilación: el navegador simplemente
 * descarta la regla y el laboratorio se ve exactamente igual que antes, sin que
 * nadie se entere. Aquí se pasa por un analizador de CSS de verdad y se
 * comprueba que ninguna regla se cae.
 */
import { readFileSync, readdirSync } from "fs";
import { resolve } from "path";

const LABS_DIR = resolve(process.cwd(), "src/components/practicas/labs");
const MARCA = "/* Identidad del tablero */";

/** El bloque de tablero de un lab, con las interpolaciones ya resueltas. */
function bloqueTablero(src: string): string | null {
  const i = src.indexOf(MARCA);
  if (i < 0) return null;
  const fin = src.indexOf("`}</style>", i);
  return src
    .slice(i, fin)
    // `${...}` no existe para el analizador: se sustituye por un valor plausible.
    .replace(/\$\{[^}]*\}/g, "#123456");
}

/**
 * Reglas escritas en el bloque, contadas a mano: cada vez que se abre una llave
 * estando fuera de toda llave empieza una regla de primer nivel (las anidadas
 * dentro de un `@media` no cuentan, igual que no cuentan en `cssRules`).
 */
function reglasEscritas(css: string): number {
  let profundidad = 0;
  let reglas = 0;
  for (const c of css) {
    if (c === "{") {
      if (profundidad === 0) reglas++;
      profundidad++;
    } else if (c === "}") {
      profundidad = Math.max(0, profundidad - 1);
    }
  }
  return reglas;
}

/** Reglas que el analizador aceptó, por selector. */
function selectoresValidos(css: string): string[] {
  const hoja = document.createElement("style");
  hoja.textContent = css;
  document.head.appendChild(hoja);
  const reglas = [...((hoja.sheet?.cssRules ?? []) as unknown as CSSRule[])];
  hoja.remove();
  return reglas.map((r) =>
    r instanceof CSSStyleRule ? r.selectorText : `@${(r as CSSGroupingRule).constructor.name}`
  );
}

const SHELLS = readdirSync(LABS_DIR).filter((f) => f.startsWith("Lab") && f.endsWith(".tsx"));
const CON_TABLERO = SHELLS.filter((f) => readFileSync(resolve(LABS_DIR, f), "utf8").includes(MARCA));

describe("identidad visual del tablero", () => {
  it("la lleva el grueso de los laboratorios DOM", () => {
    // Un suelo, no una cifra exacta: la lista crece con cada campaña y la
    // cuenta clavada sólo servía para fijar el alcance de la que la escribió.
    // Lo que de verdad se garantiza es lo de abajo, laboratorio por laboratorio.
    //
    // No todos lo llevan, y está bien: los laboratorios cuyas columnas tienen
    // color PROPIO (el de la categoría que representan, puesto desde el JSX)
    // no deben además ciclar tonos decorativos, porque ahí el tono significa.
    expect(CON_TABLERO.length).toBeGreaterThanOrEqual(46);
  });

  it.each(CON_TABLERO)("%s: el navegador acepta todas las reglas", (archivo) => {
    const css = bloqueTablero(readFileSync(resolve(LABS_DIR, archivo), "utf8"))!;
    const selectores = selectoresValidos(css);

    // Lo que de verdad se vigila: que el navegador acepte TODAS las reglas que
    // hay escritas. Una cifra mínima no lo mide —un laboratorio puede declarar
    // las reglas de la ficha antes de la marca y quedarse corto sin que nada
    // esté roto—; un paréntesis de más, en cambio, hace desaparecer una regla
    // exacta. Así que se cuentan las que están escritas y se exige el mismo
    // número del otro lado del analizador.
    expect(selectores.length).toBe(reglasEscritas(css));
    expect(selectores.some((s) => s.includes(":nth-of-type(6n+6)"))).toBe(true);
    expect(selectores.some((s) => s.includes("::before"))).toBe(true);
    expect(selectores.some((s) => s.includes('[data-done="true"]'))).toBe(true);
    // El respeto por `prefers-reduced-motion` no es opcional: sin él, el
    // levantar de las fichas marea a quien pidió que nada se mueva.
    expect(css).toContain("prefers-reduced-motion");
  });
});
