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
  it("la llevan los 46 laboratorios DOM", () => {
    expect(CON_TABLERO.length).toBe(46);
  });

  it.each(CON_TABLERO)("%s: el navegador acepta todas las reglas", (archivo) => {
    const css = bloqueTablero(readFileSync(resolve(LABS_DIR, archivo), "utf8"))!;
    const selectores = selectoresValidos(css);

    // Seis tonos + base + franja + completado + tres de ficha + el @media.
    expect(selectores.length).toBeGreaterThanOrEqual(12);
    expect(selectores.some((s) => s.includes(":nth-of-type(6n+6)"))).toBe(true);
    expect(selectores.some((s) => s.includes("::before"))).toBe(true);
    expect(selectores.some((s) => s.includes('[data-done="true"]'))).toBe(true);
    // El respeto por `prefers-reduced-motion` no es opcional: sin él, el
    // levantar de las fichas marea a quien pidió que nada se mueva.
    expect(css).toContain("prefers-reduced-motion");
  });
});
