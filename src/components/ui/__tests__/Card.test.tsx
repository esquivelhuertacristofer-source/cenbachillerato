import { render, screen } from "@testing-library/react";
import { Card, CardHeader, CardTitle, CardContent } from "../Card";

describe("Card", () => {
  test("renderiza hijos", () => {
    render(<Card>contenido</Card>);
    expect(screen.getByText("contenido")).toBeInTheDocument();
  });

  test("sin hoverable no aplica clases de hover", () => {
    render(<Card>x</Card>);
    const div = screen.getByText("x");
    expect(div.className).not.toContain("hover:shadow-md");
  });

  test("hoverable=true aplica clases de hover", () => {
    render(<Card hoverable>y</Card>);
    const div = screen.getByText("y");
    expect(div.className).toContain("hover:shadow-md");
  });

  test("acepta className adicional", () => {
    render(<Card className="extra">z</Card>);
    expect(screen.getByText("z").className).toContain("extra");
  });
});

describe("CardHeader", () => {
  test("renderiza hijos con mb-4", () => {
    render(<CardHeader>header</CardHeader>);
    const el = screen.getByText("header");
    expect(el).toBeInTheDocument();
    expect(el.className).toContain("mb-4");
  });
});

describe("CardTitle", () => {
  test("renderiza como h3", () => {
    render(<CardTitle>Título</CardTitle>);
    expect(screen.getByRole("heading", { name: "Título", level: 3 })).toBeInTheDocument();
  });
});

describe("CardContent", () => {
  test("renderiza hijos", () => {
    render(<CardContent>body</CardContent>);
    expect(screen.getByText("body")).toBeInTheDocument();
  });
});
