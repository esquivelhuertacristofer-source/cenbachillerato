/**
 * «Escribe el término» sustituye a un tercer arrastre que repetía el segundo.
 * Lo que se fija aquí es lo que hace justa a la sustitución: que el término se
 * dé por bueno sin acentos ni mayúsculas, que un error no bloquee la tarjeta,
 * que la pista salga de la propia respuesta (inicial y letras) y que el aviso
 * de modo terminado llegue una sola vez — si algo de esto se afloja, el alumno
 * escribe bien y el laboratorio le dice que no.
 */
import { render, screen, act, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EscribeTermino, variantes, type ParTermino } from "@/components/practicas/labs/_mecanica-termino";

const PARES: ParTermino[] = [
  { id: "a", termino: "bioética", definicion: "Reflexión ética sobre la vida y la salud.", ejemplo: "Un comité decide sobre un trasplante." },
  { id: "b", termino: "autonomía", definicion: "Capacidad de decidir sobre uno mismo." },
];

function montar() {
  const onCompletado = jest.fn();
  const onAcierto = jest.fn();
  const onError = jest.fn();
  const r = render(
    <EscribeTermino
      pares={PARES}
      accent="#5BC8FF"
      rgba="91,200,255"
      completado={false}
      onCompletado={onCompletado}
      onAcierto={onAcierto}
      onError={onError}
    />
  );
  const campos = () => r.container.querySelectorAll<HTMLInputElement>("input.mt-in");
  return { ...r, campos, onCompletado, onAcierto, onError };
}

async function escribir(campo: HTMLInputElement, texto: string) {
  await userEvent.clear(campo);
  await userEvent.type(campo, texto);
  act(() => { fireEvent.blur(campo); });
}

describe("EscribeTermino", () => {
  it("dibuja una tarjeta por par, con su definición y su ejemplo", () => {
    const { campos } = montar();
    expect(campos()).toHaveLength(2);
    expect(screen.getByText("Reflexión ética sobre la vida y la salud.")).toBeInTheDocument();
    expect(screen.getByText(/Un comité decide sobre un trasplante./)).toBeInTheDocument();
    expect(screen.getByText("0/2")).toBeInTheDocument();
  });

  it("acepta el término ignorando acentos y mayúsculas, y bloquea la tarjeta", async () => {
    const { campos, onAcierto } = montar();
    await escribir(campos()[0]!, "BIOETICA");
    expect(campos()[0]).toBeDisabled();
    expect(campos()[0]).toHaveAttribute("data-e", "bien");
    expect(onAcierto).toHaveBeenCalledTimes(1);
    expect(screen.getByText("1/2")).toBeInTheDocument();
  });

  it("marca el error sin bloquear, para poder corregir", async () => {
    const { campos, onError } = montar();
    await escribir(campos()[0]!, "eutanasia");
    expect(campos()[0]).toHaveAttribute("data-e", "mal");
    expect(campos()[0]).not.toBeDisabled();
    expect(onError).toHaveBeenCalledTimes(1);

    await escribir(campos()[0]!, "bioética");
    expect(campos()[0]).toHaveAttribute("data-e", "bien");
  });

  it("una tarjeta vacía no cuenta ni como acierto ni como error", () => {
    const { campos, onAcierto, onError } = montar();
    act(() => { fireEvent.blur(campos()[0]!); });
    expect(onAcierto).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });

  it("avisa una sola vez cuando el glosario queda completo", async () => {
    const { campos, onCompletado } = montar();
    await escribir(campos()[0]!, "bioética");
    expect(onCompletado).not.toHaveBeenCalled();
    await escribir(campos()[1]!, "autonomía");
    expect(onCompletado).toHaveBeenCalledTimes(1);
    expect(screen.getByText("¡Glosario completo!")).toBeInTheDocument();
  });

  it("la pista sale de la propia respuesta: inicial y número de letras", async () => {
    montar();
    await userEvent.click(screen.getByLabelText("Pista del término 1"));
    expect(screen.getByText(/Empieza por «B» y tiene 8 letras./)).toBeInTheDocument();
  });

  it("acepta la sigla y su desarrollo cuando el término trae paréntesis", () => {
    // «Sector TIC (Tecnologías de la Información y Comunicación)» existe tal
    // cual en el glosario de carreras-digitales. Exigir el paréntesis entero
    // no evalúa el concepto, evalúa la paciencia.
    const vs = variantes("Sector TIC (Tecnologías de la Información y Comunicación)");
    expect(vs).toContain("Sector TIC");
    expect(vs).toContain("Tecnologías de la Información y Comunicación");
    expect(vs[0]).toBe("Sector TIC (Tecnologías de la Información y Comunicación)");
  });

  it("el banco de términos coloca en la primera tarjeta sin resolver", async () => {
    const { campos } = montar();
    await userEvent.click(screen.getByText(/Ver el banco de términos/));
    await userEvent.click(screen.getByRole("button", { name: "bioética" }));
    expect(campos()[0]).toHaveAttribute("data-e", "bien");
  });
});
