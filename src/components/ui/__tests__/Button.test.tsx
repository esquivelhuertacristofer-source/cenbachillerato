import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../Button";

describe("Button", () => {
  test("renderiza el texto hijo", () => {
    render(<Button>Guardar</Button>);
    expect(screen.getByRole("button", { name: /guardar/i })).toBeInTheDocument();
  });

  test("variante primary usa bg-cen-navy por defecto", () => {
    render(<Button>ok</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-cen-navy");
  });

  test("variante danger aplica clases de red", () => {
    render(<Button variant="danger">Eliminar</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-red-600");
  });

  test("variante secondary aplica borde cen-navy", () => {
    render(<Button variant="secondary">Cancelar</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("border-cen-navy");
  });

  test("variante ghost aplica bg-transparent", () => {
    render(<Button variant="ghost">X</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-transparent");
  });

  test("size sm aplica text-sm con px-3", () => {
    render(<Button size="sm">Pequeño</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("px-3");
  });

  test("size lg aplica text-base con px-6", () => {
    render(<Button size="lg">Grande</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("px-6");
  });

  test("loading=true deshabilita el botón", () => {
    render(<Button loading>Cargando</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  test("loading=true muestra el spinner SVG", () => {
    render(<Button loading>ok</Button>);
    expect(screen.getByRole("button").querySelector("svg")).toBeTruthy();
  });

  test("loading=false no muestra spinner", () => {
    render(<Button>Sin carga</Button>);
    const svgs = screen.getByRole("button").querySelectorAll("svg");
    expect(svgs.length).toBe(0);
  });

  test("disabled=true deshabilita el botón", () => {
    render(<Button disabled>No disponible</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  test("ejecuta onClick al hacer clic", async () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Clic</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("no ejecuta onClick cuando está deshabilitado", async () => {
    const onClick = jest.fn();
    render(<Button disabled onClick={onClick}>No clic</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  test("acepta className adicional", () => {
    render(<Button className="my-custom">ok</Button>);
    expect(screen.getByRole("button").className).toContain("my-custom");
  });
});
