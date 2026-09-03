/**
 * La partida es lo que convierte los laboratorios DOM en algo que se puede
 * hacer bien o mal. Si estas reglas se aflojan, vuelven a ser una hoja de
 * trabajo con arrastre, así que se fijan aquí.
 */
import { renderHook, act, render, screen } from "@testing-library/react";
import { usePartida, MarcadorPartida, ERRORES_PARA_TRES } from "@/components/practicas/labs/_partida";

describe("usePartida", () => {
  it("empieza en cero y sin precisión", () => {
    const { result } = renderHook(() => usePartida());
    expect(result.current.aciertos).toBe(0);
    expect(result.current.errores).toBe(0);
    expect(result.current.precision).toBeNull();
  });

  it("la racha sube con aciertos y se rompe con un error", () => {
    const { result } = renderHook(() => usePartida());
    act(() => { result.current.acierto(); result.current.acierto(); result.current.acierto(); });
    expect(result.current.racha).toBe(3);
    expect(result.current.mejorRacha).toBe(3);
    act(() => { result.current.error(); });
    expect(result.current.racha).toBe(0);
    expect(result.current.mejorRacha).toBe(3); // la mejor no se pierde
  });

  it("calcula la precisión sobre los intentos", () => {
    const { result } = renderHook(() => usePartida());
    act(() => { result.current.acierto(); result.current.acierto(); result.current.acierto(); result.current.error(); });
    expect(result.current.precision).toBe(75);
  });

  it("antes de terminar, una estrella por modo hecho", () => {
    const { result } = renderHook(() => usePartida());
    expect(result.current.estrellasCon(0)).toBe(0);
    expect(result.current.estrellasCon(1)).toBe(1);
    expect(result.current.estrellasCon(2)).toBe(2);
  });

  it("terminar limpio da 3★; terminar con errores de sobra da 2★", () => {
    const { result } = renderHook(() => usePartida());
    expect(result.current.estrellasCon(3)).toBe(3);

    act(() => { for (let i = 0; i <= ERRORES_PARA_TRES; i++) result.current.error(); });
    expect(result.current.errores).toBe(ERRORES_PARA_TRES + 1);
    expect(result.current.estrellasCon(3)).toBe(2); // se perdió la tercera, no la marca
  });

  it("reiniciar borra la cuenta del intento", () => {
    const { result } = renderHook(() => usePartida());
    act(() => { result.current.acierto(); result.current.error(); result.current.reiniciar(); });
    expect(result.current.aciertos).toBe(0);
    expect(result.current.errores).toBe(0);
    expect(result.current.precision).toBeNull();
  });
});

describe("MarcadorPartida", () => {
  function Marcador({ errores }: { errores: number }) {
    const partida = usePartida();
    return (
      <>
        <button onClick={() => partida.error()}>fallar</button>
        <button onClick={() => partida.acierto()}>acertar</button>
        <MarcadorPartida partida={partida} accent="#5BC8FF" rgba="91,200,255" />
        <span data-testid="errores">{errores}</span>
      </>
    );
  }

  it("dice cuántos errores quedan para la tercera estrella", () => {
    render(<Marcador errores={0} />);
    expect(screen.getByText(`${ERRORES_PARA_TRES} errores para 3★`)).toBeInTheDocument();
  });

  it("avisa cuando la tercera estrella ya se perdió", () => {
    render(<Marcador errores={0} />);
    for (let i = 0; i <= ERRORES_PARA_TRES; i++) {
      act(() => { screen.getByText("fallar").click(); });
    }
    expect(screen.getByText("3.ª estrella perdida")).toBeInTheDocument();
  });

  it("muestra la precisión en cuanto hay un intento", () => {
    render(<Marcador errores={0} />);
    expect(screen.queryByText(/precisión/)).toBeNull();
    act(() => { screen.getByText("acertar").click(); });
    expect(screen.getByText(/precisión/)).toBeInTheDocument();
  });
});
