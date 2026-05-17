import { render, screen } from "@testing-library/react";
import { SemestreSelector } from "../SemestreSelector";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(() => "/hub"),
}));

import { usePathname } from "next/navigation";
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

const allSemestres = [1, 2, 3, 4, 5, 6] as const;

describe("SemestreSelector", () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue("/hub");
  });

  test("siempre muestra los 6 semestres", () => {
    render(
      <SemestreSelector semestreActual={1} semestresDisponibles={[...allSemestres]} />
    );
    for (let i = 1; i <= 6; i++) {
      expect(screen.getByText(String(i))).toBeInTheDocument();
    }
  });

  test("semestres no disponibles se renderizan como span (no como link)", () => {
    render(
      <SemestreSelector semestreActual={1} semestresDisponibles={[1, 2]} />
    );
    // Semestres 3-6 no disponibles → span, no link
    const links = screen.getAllByRole("link");
    const linkTexts = links.map((l) => l.textContent);
    expect(linkTexts).toContain("1");
    expect(linkTexts).toContain("2");
    expect(linkTexts).not.toContain("3");
    expect(linkTexts).not.toContain("4");
  });

  test("semestres disponibles se renderizan como links", () => {
    render(
      <SemestreSelector semestreActual={1} semestresDisponibles={[1, 2, 3]} />
    );
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(3);
  });

  test("link apunta a /hub/semestre/[num]", () => {
    render(
      <SemestreSelector semestreActual={1} semestresDisponibles={[1, 2]} />
    );
    const link1 = screen.getAllByRole("link").find((l) => l.textContent === "1");
    const link2 = screen.getAllByRole("link").find((l) => l.textContent === "2");
    expect(link1).toHaveAttribute("href", "/hub/semestre/1");
    expect(link2).toHaveAttribute("href", "/hub/semestre/2");
  });

  test("semestreActual tiene fondo activo (inline style)", () => {
    render(
      <SemestreSelector semestreActual={2} semestresDisponibles={[1, 2, 3]} />
    );
    const link2 = screen.getAllByRole("link").find((l) => l.textContent === "2") as HTMLElement | undefined;
    // El link activo recibe background distinto de 'transparent'
    expect(link2?.style.background).toBeTruthy();
    expect(link2?.style.background).not.toBe("transparent");
  });

  test("semestres disponibles no activos tienen fondo transparent", () => {
    render(
      <SemestreSelector semestreActual={2} semestresDisponibles={[1, 2, 3]} />
    );
    const link1 = screen.getAllByRole("link").find((l) => l.textContent === "1") as HTMLElement | undefined;
    expect(link1?.style.background).toBe("transparent");
  });

  test("pathname activo también marca el semestre como activo", () => {
    mockUsePathname.mockReturnValue("/hub/semestre/3");
    render(
      <SemestreSelector semestreActual={1} semestresDisponibles={[1, 2, 3]} />
    );
    const link3 = screen.getAllByRole("link").find((l) => l.textContent === "3") as HTMLElement | undefined;
    expect(link3?.style.background).toBeTruthy();
    expect(link3?.style.background).not.toBe("transparent");
  });

  test("semestres no disponibles tienen title informativo", () => {
    render(
      <SemestreSelector semestreActual={1} semestresDisponibles={[1]} />
    );
    const span4 = screen.getByTitle("Semestre 4 — no disponible");
    expect(span4).toBeInTheDocument();
  });

  test("sin semestres disponibles → ningún link", () => {
    render(
      <SemestreSelector semestreActual={1} semestresDisponibles={[]} />
    );
    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });
});
