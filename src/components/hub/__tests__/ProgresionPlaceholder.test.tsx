import { render, screen } from "@testing-library/react";
import { ProgresionPlaceholder } from "../ProgresionPlaceholder";

describe("ProgresionPlaceholder", () => {
  const defaultProps = {
    numero: 3,
    titulo: "Progresión 3 — Lengua y Comunicación I",
    uacNombre: "Lengua y Comunicación I",
  };

  test("muestra el número de progresión", () => {
    render(<ProgresionPlaceholder {...defaultProps} />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  test("muestra el título", () => {
    render(<ProgresionPlaceholder {...defaultProps} />);
    expect(screen.getByText("Progresión 3 — Lengua y Comunicación I")).toBeInTheDocument();
  });

  test("muestra el nombre de la UAC", () => {
    render(<ProgresionPlaceholder {...defaultProps} />);
    expect(screen.getByText("Lengua y Comunicación I")).toBeInTheDocument();
  });

  test("muestra el badge 'Próximamente'", () => {
    render(<ProgresionPlaceholder {...defaultProps} />);
    expect(screen.getByText("Próximamente")).toBeInTheDocument();
  });

  test("muestra el texto 'Contenido en desarrollo'", () => {
    render(<ProgresionPlaceholder {...defaultProps} />);
    expect(screen.getByText("Contenido en desarrollo")).toBeInTheDocument();
  });
});
