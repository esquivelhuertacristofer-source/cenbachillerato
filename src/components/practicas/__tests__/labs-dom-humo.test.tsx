/**
 * BANCO DE HUMO DE LOS LABORATORIOS DOM.
 *
 * Los 46 laboratorios no-STEM son DOM puro, así que se pueden montar y OPERAR
 * en jsdom. Hasta ahora nadie los había ejecutado nunca en una prueba: el único
 * control era abrirlos a mano. Esto los recorre a todos y, por cada uno:
 *
 *  1. lo monta y comprueba que dibuja algo,
 *  2. entra a CADA modo y comprueba que el contenido cambia (una pestaña que no
 *     cambia nada es una dinámica muerta),
 *  3. pulsa todos los botones del cuerpo sin que reviente,
 *  4. comprueba que el botón de reiniciar existe y no rompe el estado.
 *
 * Lo que busca es lo que no se ve leyendo el archivo: un modo que no responde,
 * un manejador que lanza, una pestaña que dibuja lo mismo que la anterior.
 *
 * Los laboratorios 3D quedan fuera: necesitan WebGL, que jsdom no tiene.
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { render, act, fireEvent } from "@testing-library/react";
import type { ComponentType } from "react";
import type { PracticaLabProps } from "@/components/practicas/registry";

const RAIZ = process.cwd();
const LABS_DIR = resolve(RAIZ, "src/components/practicas/labs");

const COLOR = { hex: "#5BC8FF", rgba: "91,200,255", nombre: "prueba" } as unknown as PracticaLabProps["color"];

/** slug → componente + archivo, leídos del registry. */
function labs(): { slug: string; componente: string; archivo: string }[] {
  const src = readFileSync(resolve(RAIZ, "src/components/practicas/registry.tsx"), "utf8");
  const rutas = new Map<string, string>();
  for (const m of src.matchAll(/const (\w+) = dynamic\(\(\) => import\("\.\/labs\/([\w-]+)"\)/g)) {
    if (m[1] && m[2]) rutas.set(m[1], m[2]);
  }
  const bloque = src.slice(src.indexOf("export const PRACTICAS"));
  const out: { slug: string; componente: string; archivo: string }[] = [];
  const vistos = new Set<string>();
  for (const m of bloque.matchAll(/^\s{2}"?([a-z0-9][a-z0-9-]*)"?:\s*\{[^}]*Component:\s*(\w+)/gm)) {
    const archivo = m[2] ? rutas.get(m[2]) : undefined;
    if (!m[1] || !m[2] || !archivo || vistos.has(archivo)) continue;
    vistos.add(archivo);
    out.push({ slug: m[1], componente: m[2], archivo });
  }
  return out;
}

/** DOM puro = ni él ni lo que importa toca @react-three. */
function esDom(archivo: string): boolean {
  const p = resolve(LABS_DIR, `${archivo}.tsx`);
  if (!existsSync(p)) return false;
  const src = readFileSync(p, "utf8");
  const hijos = new Set<string>();
  for (const m of src.matchAll(/from\s+"\.\/([\w-]+)"/g)) if (m[1]) hijos.add(m[1]);
  for (const m of src.matchAll(/import\(\s*"\.\/([\w-]+)"\s*\)/g)) if (m[1]) hijos.add(m[1]);
  const textos = [src];
  for (const h of hijos) {
    for (const ext of [".tsx", ".ts"]) {
      const q = resolve(LABS_DIR, h + ext);
      if (existsSync(q)) { textos.push(readFileSync(q, "utf8")); break; }
    }
  }
  return !textos.some((t) => t.includes("@react-three/"));
}

const DOM = labs().filter((l) => esDom(l.archivo));

/**
 * Los tabs de modo del laboratorio. Se excluye `.fc-tab`, que es la pestaña
 * interna de la ficha teórica y vive dentro del cajón: cambia el contenido del
 * cajón, no el del laboratorio.
 */
function tabsDeModo(cont: HTMLElement): HTMLElement[] {
  return [...cont.querySelectorAll<HTMLElement>('button[class$="-tab"]')].filter(
    (b) => !b.classList.contains("fc-tab")
  );
}

/**
 * Huella del laboratorio entero, para saber si cambiar de modo cambió algo.
 * Se toma del contenedor completo a propósito: acotarla a un subárbol (el
 * primer `div` con grid, por ejemplo) cae en la tarjeta del cuestionario, que
 * es la misma en todos los modos, y da colisiones falsas.
 */
function huella(cont: HTMLElement): string {
  return (cont.textContent ?? "").replace(/\s+/g, " ");
}

describe("laboratorios DOM: se montan y responden", () => {
  it("el banco cubre los 46 laboratorios DOM", () => {
    expect(DOM.length).toBe(46);
  });

  describe.each(DOM.map((l) => [l.slug, l.archivo] as const))("%s", (slug, archivo) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require(`../labs/${archivo}`) as Record<string, ComponentType<PracticaLabProps>>;
    const Lab = Object.values(mod).find((v) => typeof v === "function")!;
    const props: PracticaLabProps = { color: COLOR, actividadCodigo: slug, actividadTitulo: slug };

    it("se monta y dibuja contenido", () => {
      const { container } = render(<Lab {...props} />);
      expect((container.textContent ?? "").length).toBeGreaterThan(200);
    });

    it("cada modo dibuja algo distinto del anterior", () => {
      const { container } = render(<Lab {...props} />);
      const tabs = tabsDeModo(container);
      expect(tabs.length).toBeGreaterThanOrEqual(2);

      const huellas: string[] = [];
      for (const t of tabs) {
        act(() => { fireEvent.click(t); });
        huellas.push(huella(container));
      }
      // Dos modos con exactamente el mismo cuerpo = una pestaña que no lleva
      // a ningún lado; el alumno la pulsa y no pasa nada.
      expect(new Set(huellas).size).toBe(huellas.length);
    });

    it("lleva el marcador de la partida en la barra", () => {
      // Sin marcador el alumno no ve la racha ni cuántos errores le quedan
      // para la tercera estrella: la partida existiría pero sería invisible.
      const { container } = render(<Lab {...props} />);
      expect(container.querySelector(".pt-marcador")).not.toBeNull();
    });

    it("ningún botón del laboratorio lanza al pulsarlo", () => {
      const { container } = render(<Lab {...props} />);
      const errores: string[] = [];
      for (const tab of tabsDeModo(container)) {
        act(() => { fireEvent.click(tab); });
        const botones = [...container.querySelectorAll<HTMLButtonElement>("button")].filter((b) => !b.disabled);
        for (const b of botones.slice(0, 40)) {
          try {
            act(() => { fireEvent.click(b); });
          } catch (e) {
            errores.push(`${(b.textContent ?? b.className).slice(0, 40)}: ${(e as Error).message.slice(0, 80)}`);
          }
        }
      }
      expect(errores).toEqual([]);
    });
  });
});

describe("el modo «Completa el texto»", () => {
  // 45 de las 46 progresiones tenían un `fill_blanks` publicado que ningún
  // laboratorio usaba. `estado-mexicano` es la única sin él: su texto se
  // escribió a mano sobre la lectura CS-I-P01-A1, tapando las palabras que la
  // propia lectura pregunta. Ninguno se queda fuera.
  const ESPERADOS = DOM;

  it("lo llevan los 46 laboratorios DOM", () => {
    expect(ESPERADOS.length).toBe(46);
  });

  it.each(ESPERADOS.map((l) => [l.slug, l.archivo] as const))(
    "%s: el modo existe y es una mecánica distinta de arrastrar",
    (_slug, archivo) => {
      const src = readFileSync(resolve(LABS_DIR, `${archivo}.tsx`), "utf8");
      expect(src).toContain('from "./_mecanica-huecos"');
      expect(src).toMatch(/<CompletaTexto\b/);
      expect(src).toMatch(/id: "texto", label: "(Completa el texto|Complete the text)"/);
      // El reinicio de la barra tiene que alcanzarlo, o el alumno se queda
      // con los huecos ya resueltos y sin forma de volver a intentarlo.
      expect(src).toMatch(/modo === "texto" \? reset(Texto|Huecos)\b/);
    }
  );
});

describe("el modo «Escribe el término»", () => {
  // El tercer modo de glosario era, en 28 laboratorios, otro arrastre más:
  // emparejar término con definición justo después de haber emparejado
  // concepto con definición. Ahora se escribe.
  //
  // Los cuatro de inglés quedan fuera A PROPÓSITO: su «glosario» no son
  // términos sino estructuras («You should / shouldn't + infinitive»), y
  // pedir que se tecleen evalúa mecanografía, no gramática.
  const ESTRUCTURAS_EN_INGLES = [
    "LabConsejosIngles",
    "LabPresentPerfectIngles",
    "LabProcesosIngles",
    "LabReglasIngles",
  ];

  const CONVERTIDOS = DOM.map((l) => l.archivo).filter((a) =>
    readFileSync(resolve(LABS_DIR, `${a}.tsx`), "utf8").includes("_mecanica-termino")
  );

  it("no queda ningún glosario de arrastre salvo las estructuras de inglés", () => {
    const conArrastre = DOM.map((l) => l.archivo).filter((a) =>
      readFileSync(resolve(LABS_DIR, `${a}.tsx`), "utf8").includes("const glosLibres = ")
    );
    expect(conArrastre.sort()).toEqual(ESTRUCTURAS_EN_INGLES.sort());
    expect(CONVERTIDOS.length).toBe(28);
  });

  it.each(CONVERTIDOS)("%s: el glosario ya no se arrastra", (archivo) => {
    const src = readFileSync(resolve(LABS_DIR, `${archivo}.tsx`), "utf8");
    expect(src).toContain('from "./_mecanica-termino"');
    expect(src).toMatch(/<EscribeTermino\b/);
    expect(src).toMatch(/id: "glosario", label: "Escribe el término"/);
    // La maquinaria de arrastre del glosario tiene que haberse ido ENTERA: un
    // resto sin usar no rompe la compilación pero deja el archivo mintiendo.
    // Con límites de palabra: `siglosLibres` (los siglos de méxico-en-el-mundo)
    // contiene «glosLibres» y no tiene nada que ver con el glosario.
    expect(src).not.toMatch(/\bempGlos\b|\bselGlos\b|\bshakeGlos\b|\bRowsGlosario\b|\bglosLibres\b/);
    // Y el modo sigue contando para las estrellas y para el reinicio.
    expect(src).toMatch(/\(glosarioDone \? 1 : 0\)/);
    expect(src).toMatch(/const resetGlosario = \(\) => \{/);
  });
});
