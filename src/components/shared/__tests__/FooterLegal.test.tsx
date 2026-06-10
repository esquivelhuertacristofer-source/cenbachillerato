import { render, screen } from "@testing-library/react";
import { FooterLegal } from "../FooterLegal";

describe("FooterLegal", () => {
  test("muestra el nombre CEN", () => {
    render(<FooterLegal />);
    expect(screen.getByText("CEN — Campaña Educativa Nacional")).toBeInTheDocument();
  });

  test("muestra el año actual en el copyright", () => {
    render(<FooterLegal />);
    const year = new Date().getFullYear();
    expect(screen.getByText(new RegExp(String(year)))).toBeInTheDocument();
  });

  test("enlace a /privacidad existe", () => {
    render(<FooterLegal />);
    expect(screen.getByRole("link", { name: "Aviso de Privacidad" })).toHaveAttribute("href", "/privacidad");
  });

  test("enlace a /terminos existe", () => {
    render(<FooterLegal />);
    expect(screen.getByRole("link", { name: "Términos de Uso" })).toHaveAttribute("href", "/terminos");
  });

  test("enlace de contacto apunta a mailto", () => {
    render(<FooterLegal />);
    expect(screen.getByRole("link", { name: "Contacto" })).toHaveAttribute("href", "mailto:campanaeducativanacional@gmail.com");
  });
});
