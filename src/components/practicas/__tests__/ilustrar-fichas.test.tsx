/**
 * Garantías del dibujo de fichas y zonas (`_ilustrar-fichas.tsx`).
 *
 * El defecto que lo motivó no daba error: «licencias-software» tenía imágenes
 * en disco y el alumno arrastraba seis rótulos grises hacia dos cajas vacías,
 * porque nada unía el texto de la ficha con su imagen. Estas pruebas fijan esa
 * unión, y también la otra mitad: que lo que NO tiene imagen se quede tal cual,
 * sin recuadros rotos.
 *
 * Además, que todos los laboratorios con zona lleven `data-zona`: sin esa marca
 * el componente no encuentra la caja y la deja vacía, otra vez en silencio.
 */
import { readFileSync, readdirSync } from "fs";
import { resolve } from "path";
import { render, act } from "@testing-library/react";
import { IlustrarFichas } from "@/components/practicas/labs/_ilustrar-fichas";

jest.mock("@/lib/practicas/terminos-imagen", () => ({
  imagenDeTermino: (slug: string, t: string) =>
    slug === "lab-prueba" && (t === "Firefox" || t === "Software libre")
      ? `/media/labs-terminos/lab-prueba/${t.toLowerCase().replace(/ /g, "-")}.webp`
      : null,
}));

/* jsdom no implementa `innerText`; el componente lo usa porque respeta los
 * saltos de línea de la maqueta. Aquí se imita lo justo: cada hijo, en su
 * línea. Con `textContent` a secas, «Software libre» y «Suelta aquí…» salen
 * pegados y la zona nunca encontraría su imagen. */
beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, "innerText", {
    configurable: true,
    get(this: HTMLElement) {
      return [...this.childNodes].map((n) => n.textContent ?? "").join("\n");
    },
  });
  global.requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(() => cb(0), 0) as unknown as number;
  global.cancelAnimationFrame = (id: number) => clearTimeout(id);
});

function montar() {
  return render(
    <div>
      <button draggable="true" data-testid="con">
        <i className="fa-solid fa-cube" />
        Firefox
      </button>
      <button data-on="false" data-done="false" data-testid="caso">
        Firefox
      </button>
      <button data-on="true" data-testid="pestana">
        Firefox
      </button>
      <p>
        Cuentan que un día <span data-sel="false" data-testid="prosa">Firefox</span> llegó al pueblo.
      </p>
      <button draggable="true" data-testid="sin">
        Un programa sin dibujo
      </button>
      <div data-zona="true" data-testid="zona">
        <strong>Software libre</strong>
        <span>Suelta aquí…</span>
      </div>
      <div data-zona="true" data-testid="zona-sin">
        <strong>Otra caja</strong>
      </div>
      <IlustrarFichas slug="lab-prueba" />
    </div>,
  );
}

describe("IlustrarFichas", () => {
  it("la ficha cuyo texto tiene imagen recibe su dibujo", () => {
    const { getByTestId } = montar();
    const f = getByTestId("con");
    expect(f.dataset.vineta).toBe("true");
    expect(f.style.getPropertyValue("--vineta")).toContain("/media/labs-terminos/lab-prueba/firefox.webp");
  });

  it("el selector de casos (data-done) también se ilustra; la pestaña de modo no", () => {
    const { getByTestId } = montar();
    expect(getByTestId("caso").dataset.vineta).toBe("true");
    expect(getByTestId("pestana").dataset.vineta).toBeUndefined();
  });

  it("una ficha dentro de un párrafo no se ilustra aunque tenga imagen", () => {
    const { getByTestId } = montar();
    expect(getByTestId("prosa").dataset.vineta).toBeUndefined();
  });

  it("la ficha sin imagen se queda como estaba", () => {
    const { getByTestId } = montar();
    const f = getByTestId("sin");
    expect(f.dataset.vineta).toBeUndefined();
    expect(f.style.getPropertyValue("--vineta")).toBe("");
  });

  it("la zona con imagen recibe una <img> propia, y la que no, nada", async () => {
    const { getByTestId } = montar();
    await act(async () => {});
    const img = getByTestId("zona").querySelector("img[data-fondo-auto]");
    expect(img).not.toBeNull();
    expect(img!.getAttribute("src")).toContain("software-libre.webp");
    expect(getByTestId("zona-sin").querySelector("img")).toBeNull();
  });
});

describe("las zonas de los laboratorios están marcadas", () => {
  const DIR = resolve(process.cwd(), "src/components/practicas/labs");
  const conZona = readdirSync(DIR)
    .filter((f) => f.endsWith(".tsx"))
    .filter((f) => readFileSync(resolve(DIR, f), "utf8").includes("const dropProps"));

  it("hay laboratorios con zonas de soltar", () => {
    expect(conZona.length).toBeGreaterThan(50);
  });

  it.each(conZona)("%s: su dropProps devuelve data-zona", (f) => {
    const s = readFileSync(resolve(DIR, f), "utf8");
    const i = s.indexOf("const dropProps");
    const cierre = s.indexOf("\n  });", i);
    expect(s.slice(i, cierre)).toContain('"data-zona": "true"');
  });
});
