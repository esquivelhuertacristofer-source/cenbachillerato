import { render, screen } from "@testing-library/react";
import { UACCard } from "../UACCard";

const defaultProps = {
  codigo: "LC-I",
  nombre: "Lengua y Comunicación I",
  totalProgresiones: 10,
  semestre: 1,
  tipo: "sociocognitivo" as const,
};

describe("UACCard", () => {
  test("muestra el nombre de la UAC", () => {
    render(<UACCard {...defaultProps} />);
    expect(screen.getByText("Lengua y Comunicación I")).toBeInTheDocument();
  });

  test("muestra el semestre", () => {
    render(<UACCard {...defaultProps} semestre={3} />);
    expect(screen.getByText("Sem. 3")).toBeInTheDocument();
  });

  test("muestra el total de propósitos formativos", () => {
    render(<UACCard {...defaultProps} totalProgresiones={12} />);
    expect(screen.getByText("12 propósitos formativos")).toBeInTheDocument();
  });

  test("badge 'sociocognitivo' → muestra 'Recurso Sociocognitivo'", () => {
    render(<UACCard {...defaultProps} tipo="sociocognitivo" />);
    expect(screen.getByText("Recurso Sociocognitivo")).toBeInTheDocument();
  });

  test("badge 'area' → muestra 'Área de Conocimiento'", () => {
    render(<UACCard {...defaultProps} tipo="area" />);
    expect(screen.getByText("Área de Conocimiento")).toBeInTheDocument();
  });

  test("badge 'socioemocional' → muestra 'Recurso Socioemocional'", () => {
    render(<UACCard {...defaultProps} tipo="socioemocional" />);
    expect(screen.getByText("Recurso Socioemocional")).toBeInTheDocument();
  });

  test("icono por defecto es 📚", () => {
    render(<UACCard {...defaultProps} />);
    expect(screen.getByText("📚")).toBeInTheDocument();
  });

  test("muestra el icono personalizado", () => {
    render(<UACCard {...defaultProps} icono="🔬" />);
    expect(screen.getByText("🔬")).toBeInTheDocument();
  });

  test("enlace apunta a /hub/uac/[codigo]", () => {
    render(<UACCard {...defaultProps} codigo="PM-II" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/hub/uac/PM-II");
  });

  test("muestra texto 'Ver contenido'", () => {
    render(<UACCard {...defaultProps} />);
    // El icono → ahora es un <i> FA separado; buscamos por regex para ser flexible
    expect(screen.getByText(/Ver contenido/i)).toBeInTheDocument();
  });
});
