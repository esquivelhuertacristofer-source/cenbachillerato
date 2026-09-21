/**
 * La pestaña "Todos" tiene que enseñar TODOS los laboratorios que existen.
 *
 * No basta comprobar los datos: esta prueba monta la vista de verdad y cuenta
 * los enlaces que pinta, porque el defecto que la motiva era justamente que la
 * pantalla enseñaba menos laboratorios de los que la plataforma tenía (141 de
 * 211) sin que nada fallara.
 */
import { render, screen } from "@testing-library/react";
import {
  TodosLosLaboratorios,
  agrupaTodos,
} from "../TodosLosLaboratorios";
import { PRACTICAS_META } from "../registry-meta";
import { LAB_CATALOGO } from "@/lib/practicas/lab-catalogo";

// El sustituto conserva TODAS las props (className incluida): sin ella las
// tarjetas se pintan sin su clase y la prueba mide cero aunque todo esté bien.
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children, ...resto }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...resto}>
      {children}
    </a>
  ),
}));

const TOTAL = Object.keys(PRACTICAS_META).length;

describe("agrupaTodos", () => {
  it("reparte todos los laboratorios, sin perder ninguno", () => {
    const repartidos = agrupaTodos().flatMap((g) => g.slugs);
    expect(repartidos).toHaveLength(TOTAL);
    expect(new Set(repartidos).size).toBe(TOTAL);
  });

  it("no repite ningún laboratorio en dos grupos", () => {
    const repartidos = agrupaTodos().flatMap((g) => g.slugs);
    const vistos = new Set<string>();
    const repetidos = repartidos.filter((s) => (vistos.has(s) ? true : (vistos.add(s), false)));
    expect(repetidos).toEqual([]);
  });

  it("cada laboratorio del catálogo cae en algún grupo", () => {
    const repartidos = new Set(agrupaTodos().flatMap((g) => g.slugs));
    const perdidos = Object.keys(LAB_CATALOGO).filter((s) => !repartidos.has(s));
    expect(perdidos).toEqual([]);
  });
});

describe("TodosLosLaboratorios, montado", () => {
  it("pinta un enlace por laboratorio", () => {
    const { container } = render(<TodosLosLaboratorios />);
    const tarjetas = container.querySelectorAll("a.lab-card");
    expect(tarjetas).toHaveLength(TOTAL);
  });

  it("cada enlace apunta a la ruta propia de su laboratorio", () => {
    const { container } = render(<TodosLosLaboratorios />);
    const hrefs = [...container.querySelectorAll("a.lab-card")].map((a) => a.getAttribute("href"));
    const malos = hrefs.filter((h) => !h || !/^\/hub\/laboratorios\/[a-z0-9-]+$/.test(h));
    expect(malos).toEqual([]);
    const slugs = hrefs.map((h) => h!.split("/").pop()!);
    expect(new Set(slugs).size).toBe(TOTAL);
    expect(slugs.filter((s) => !PRACTICAS_META[s])).toEqual([]);
  });

  it("ningún título sale como el identificador en crudo", () => {
    const { container } = render(<TodosLosLaboratorios />);
    const titulos = [...container.querySelectorAll("h3.lab-card-titulo")].map((h) => h.textContent ?? "");
    expect(titulos).toHaveLength(TOTAL);
    expect(titulos.filter((t) => t.trim() === "")).toEqual([]);
    // "Adn Dogma Central 3d": el slug embellecido siempre lleva su número pegado
    // al final de una palabra, porque el slug lo trae como "-3d".
    expect(titulos.filter((t) => /\b3d$/.test(t))).toEqual([]);
  });

  it("los grupos declaran cuántos laboratorios traen", () => {
    render(<TodosLosLaboratorios />);
    const grupos = agrupaTodos();
    expect(grupos.length).toBeGreaterThan(1);
    for (const g of grupos) {
      expect(screen.getByRole("heading", { name: g.titulo, level: 2 })).toBeInTheDocument();
    }
  });
});
