/**
 * «Completa el texto» es la primera mecánica de los labs DOM que pide producir
 * y no reconocer. Las reglas que la hacen justa —aceptar las alternativas que
 * la actividad declara, ignorar acentos y mayúsculas, no dar por buena una
 * respuesta vacía— se fijan aquí, porque si se aflojan el alumno escribe bien
 * y el laboratorio le dice que no.
 */
import { render, screen, act, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CompletaTexto, type TextoHuecosData } from "@/components/practicas/labs/_mecanica-huecos";

const DATOS: TextoHuecosData = {
  ancla: "PFH-III-P01-A6 · prueba",
  instrucciones: "Completa el párrafo.",
  partes: ["Aristóteles construyó su ", " categórico y lo llamó ", "."],
  huecos: [
    { respuesta: "silogismo", alternativas: [], pista: "Tres partes." },
    { respuesta: "deducción", alternativas: ["razonamiento deductivo"], pista: "De lo general a lo particular." },
  ],
};

function montar(extra: Partial<React.ComponentProps<typeof CompletaTexto>> = {}) {
  const onCompletado = jest.fn();
  const onAcierto = jest.fn();
  const onError = jest.fn();
  const r = render(
    <CompletaTexto
      data={DATOS}
      accent="#5BC8FF"
      rgba="91,200,255"
      completado={false}
      onCompletado={onCompletado}
      onAcierto={onAcierto}
      onError={onError}
      {...extra}
    />
  );
  const campos = () => r.container.querySelectorAll<HTMLInputElement>("input.mh-in");
  return { ...r, campos, onCompletado, onAcierto, onError };
}

async function escribir(campo: HTMLInputElement, texto: string) {
  await userEvent.clear(campo);
  await userEvent.type(campo, texto);
  act(() => { fireEvent.blur(campo); });
}

describe("CompletaTexto", () => {
  it("dibuja el párrafo con un hueco por respuesta", () => {
    const { campos } = montar();
    expect(campos()).toHaveLength(2);
    expect(screen.getByText(/Aristóteles construyó su/)).toBeInTheDocument();
    expect(screen.getByText("0/2")).toBeInTheDocument();
  });

  it("acepta la respuesta correcta y bloquea ese hueco", async () => {
    const { campos, onAcierto } = montar();
    await escribir(campos()[0]!, "silogismo");
    expect(campos()[0]).toBeDisabled();
    expect(campos()[0]).toHaveAttribute("data-e", "bien");
    expect(onAcierto).toHaveBeenCalledTimes(1);
    expect(screen.getByText("1/2")).toBeInTheDocument();
  });

  it("ignora acentos y mayúsculas", async () => {
    const { campos, onAcierto } = montar();
    await escribir(campos()[1]!, "DEDUCCION");
    expect(campos()[1]).toHaveAttribute("data-e", "bien");
    expect(onAcierto).toHaveBeenCalledTimes(1);
  });

  it("acepta las alternativas que declara la actividad", async () => {
    const { campos } = montar();
    await escribir(campos()[1]!, "razonamiento deductivo");
    expect(campos()[1]).toHaveAttribute("data-e", "bien");
  });

  it("marca el error y no lo bloquea, para poder corregir", async () => {
    const { campos, onError } = montar();
    await escribir(campos()[0]!, "premisa");
    expect(campos()[0]).toHaveAttribute("data-e", "mal");
    expect(campos()[0]).not.toBeDisabled();
    expect(onError).toHaveBeenCalledTimes(1);

    await escribir(campos()[0]!, "silogismo");
    expect(campos()[0]).toHaveAttribute("data-e", "bien");
  });

  it("un hueco vacío no cuenta ni como acierto ni como error", async () => {
    const { campos, onAcierto, onError } = montar();
    act(() => { fireEvent.blur(campos()[0]!); });
    expect(onAcierto).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
    expect(campos()[0]).toHaveAttribute("data-e", "vacio");
  });

  it("avisa una sola vez cuando el texto queda completo", async () => {
    const { campos, onCompletado } = montar();
    await escribir(campos()[0]!, "silogismo");
    expect(onCompletado).not.toHaveBeenCalled();
    await escribir(campos()[1]!, "deducción");
    expect(onCompletado).toHaveBeenCalledTimes(1);
    expect(screen.getByText("¡Texto completo!")).toBeInTheDocument();
  });

  it("la pista de cada hueco está disponible y es la de la actividad", async () => {
    montar();
    expect(screen.queryByText("Tres partes.")).toBeNull();
    await userEvent.click(screen.getByLabelText("Pista del hueco 1"));
    expect(screen.getByText("Tres partes.")).toBeInTheDocument();
  });

  it("el banco de palabras coloca en el primer hueco libre", async () => {
    const { campos } = montar();
    await userEvent.click(screen.getByText(/Ver el banco de palabras/));
    await userEvent.click(screen.getByRole("button", { name: "silogismo" }));
    expect(campos()[0]).toHaveAttribute("data-e", "bien");
  });
});
