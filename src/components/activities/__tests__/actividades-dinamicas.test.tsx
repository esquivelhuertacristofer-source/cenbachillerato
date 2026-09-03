/**
 * Los cinco tipos dinámicos (migración 26) se responden MOVIENDO cosas, y ahí
 * es donde una actividad se rompe de formas que un quiz no puede: el barajado
 * puede devolver el orden correcto, la calificación puede contar mal un par
 * deshecho, el reloj puede quedarse corriendo. Esto prueba justamente eso.
 */
import { render, screen, fireEvent, act } from "@testing-library/react";
import { OrdenarSecuenciaActivity } from "@/components/activities/OrdenarSecuenciaActivity";
import { RelacionarColumnasActivity } from "@/components/activities/RelacionarColumnasActivity";
import { ClasificarCategoriasActivity } from "@/components/activities/ClasificarCategoriasActivity";
import { CasoDecisionActivity } from "@/components/activities/CasoDecisionActivity";
import { RetoCronometradoActivity } from "@/components/activities/RetoCronometradoActivity";
import {
  ContenidoOrdenarSecuenciaSchema,
  ContenidoRelacionarColumnasSchema,
  ContenidoClasificarCategoriasSchema,
  ContenidoCasoDecisionSchema,
  ContenidoRetoCronometradoSchema,
} from "@/lib/activities/validators";

/* ── Validadores ─────────────────────────────────────────────────────────── */

describe("validadores de los tipos dinámicos", () => {
  it("clasificar_categorias rechaza un elemento cuya categoría no existe", () => {
    const r = ContenidoClasificarCategoriasSchema.safeParse({
      categorias: [{ nombre: "A" }, { nombre: "B" }],
      elementos: [
        { texto: "uno", categoria: "A" },
        { texto: "dos", categoria: "B" },
        { texto: "tres", categoria: "A" },
        { texto: "cuatro", categoria: "C" }, // no declarada
      ],
    });
    expect(r.success).toBe(false);
  });

  it("reto_cronometrado rechaza un índice de respuesta fuera de las opciones", () => {
    const pregunta = { enunciado: "x", opciones: ["a", "b"], respuesta_correcta: 5 };
    const r = ContenidoRetoCronometradoSchema.safeParse({
      preguntas: Array.from({ length: 5 }, () => pregunta),
    });
    expect(r.success).toBe(false);
  });

  it("ordenar_secuencia exige al menos tres pasos", () => {
    expect(
      ContenidoOrdenarSecuenciaSchema.safeParse({ pasos: [{ texto: "a" }, { texto: "b" }] }).success,
    ).toBe(false);
  });

  it("relacionar_columnas exige al menos tres parejas", () => {
    expect(
      ContenidoRelacionarColumnasSchema.safeParse({
        parejas: [{ izquierda: "a", derecha: "1" }, { izquierda: "b", derecha: "2" }],
      }).success,
    ).toBe(false);
  });

  it("caso_decision exige los tres cierres", () => {
    const escena = {
      situacion: "s", pregunta: "p",
      opciones: [{ texto: "a", consecuencia: "c", calidad: 2 }, { texto: "b", consecuencia: "c", calidad: 0 }],
    };
    expect(
      ContenidoCasoDecisionSchema.safeParse({
        contexto: "c", escenas: [escena, escena], cierre_bueno: "b", cierre_regular: "r",
      }).success,
    ).toBe(false);
  });
});

/* ── Ordenar secuencia ───────────────────────────────────────────────────── */

const PASOS = {
  pasos: [
    { texto: "Primero esto" },
    { texto: "Después esto otro" },
    { texto: "Y al final esto" },
    { texto: "Cierre del proceso" },
  ],
};

describe("OrdenarSecuenciaActivity", () => {
  it("NUNCA presenta las tarjetas ya en su orden correcto", () => {
    // Empezar resuelto convertiría la actividad en un botón de "Revisar".
    for (const id of ["a", "b", "c", "d", "e", "f", "g", "h"]) {
      const { unmount } = render(
        <OrdenarSecuenciaActivity actividad={{ id, titulo: "T", tipo: "ordenar_secuencia", contenido: PASOS }} />,
      );
      const items = screen.getAllByRole("listitem").map((li) => li.textContent ?? "");
      const correcto = PASOS.pasos.every((p, i) => items[i]?.includes(p.texto));
      expect(correcto).toBe(false);
      unmount();
    }
  });

  it("mueve una tarjeta con las flechas y califica el orden final", async () => {
    const onProgreso = jest.fn().mockResolvedValue({ ok: true });
    render(
      <OrdenarSecuenciaActivity
        actividad={{ id: "x1", titulo: "T", tipo: "ordenar_secuencia", contenido: PASOS }}
        onProgreso={onProgreso}
      />,
    );
    // Sube la última tarjeta una posición: cambia el orden sin resolverlo.
    const subir = screen.getAllByRole("button", { name: /^Subir/ });
    fireEvent.click(subir[subir.length - 1]!);

    fireEvent.click(screen.getByRole("button", { name: /Revisar mi orden/ }));
    expect(onProgreso).toHaveBeenCalledTimes(1);
    const arg = onProgreso.mock.calls[0]![0];
    expect(arg.puntaje).toBeGreaterThanOrEqual(0);
    expect(arg.puntaje).toBeLessThanOrEqual(100);
  });
});

/* ── Relacionar columnas ─────────────────────────────────────────────────── */

const PAREJAS = {
  parejas: [
    { izquierda: "Hardware", derecha: "Lo físico" },
    { izquierda: "Software", derecha: "Los programas" },
    { izquierda: "Licencia", derecha: "El permiso de uso" },
  ],
  distractores: [],
};

describe("RelacionarColumnasActivity", () => {
  it("no deja revisar hasta que están todas emparejadas", () => {
    render(<RelacionarColumnasActivity actividad={{ id: "r1", titulo: "T", tipo: "relacionar_columnas", contenido: PAREJAS }} />);
    expect(screen.getByRole("button", { name: /Faltan 3 por relacionar/ })).toBeDisabled();
  });

  it("empareja los tres pares y da 100", async () => {
    const onProgreso = jest.fn().mockResolvedValue({ ok: true });
    render(
      <RelacionarColumnasActivity
        actividad={{ id: "r2", titulo: "T", tipo: "relacionar_columnas", contenido: PAREJAS }}
        onProgreso={onProgreso}
      />,
    );
    for (const p of PAREJAS.parejas) {
      fireEvent.click(screen.getByRole("button", { name: new RegExp(p.izquierda) }));
      fireEvent.click(screen.getByRole("button", { name: new RegExp(p.derecha) }));
    }
    fireEvent.click(screen.getByRole("button", { name: /Revisar mis parejas/ }));
    expect(onProgreso).toHaveBeenCalledWith(expect.objectContaining({ puntaje: 100, completada: true }));
  });

  it("una opción de la derecha sólo puede estar en un par a la vez", () => {
    render(<RelacionarColumnasActivity actividad={{ id: "r3", titulo: "T", tipo: "relacionar_columnas", contenido: PAREJAS }} />);
    // "Lo físico" se asigna primero a Hardware y luego a Software: debe soltarse del primero.
    fireEvent.click(screen.getByRole("button", { name: /Hardware/ }));
    fireEvent.click(screen.getByRole("button", { name: /Lo físico/ }));
    fireEvent.click(screen.getByRole("button", { name: /Software/ }));
    fireEvent.click(screen.getByRole("button", { name: /Lo físico/ }));
    // Sólo queda un par hecho, así que siguen faltando dos.
    expect(screen.getByRole("button", { name: /Faltan 2 por relacionar/ })).toBeInTheDocument();
  });
});

/* ── Clasificar categorías ───────────────────────────────────────────────── */

const CLASIF = {
  categorias: [{ nombre: "Renovable" }, { nombre: "No renovable" }],
  elementos: [
    { texto: "Viento", categoria: "Renovable" },
    { texto: "Sol", categoria: "Renovable" },
    { texto: "Carbón", categoria: "No renovable" },
    { texto: "Petróleo", categoria: "No renovable" },
  ],
};

describe("ClasificarCategoriasActivity", () => {
  it("clasifica todo correctamente con dos toques por ficha", () => {
    const onProgreso = jest.fn().mockResolvedValue({ ok: true });
    render(
      <ClasificarCategoriasActivity
        actividad={{ id: "c1", titulo: "T", tipo: "clasificar_categorias", contenido: CLASIF }}
        onProgreso={onProgreso}
      />,
    );
    for (const el of CLASIF.elementos) {
      fireEvent.click(screen.getByRole("button", { name: el.texto }));
      fireEvent.click(screen.getByText(el.categoria));
    }
    fireEvent.click(screen.getByRole("button", { name: /Revisar mi clasificación/ }));
    expect(onProgreso).toHaveBeenCalledWith(expect.objectContaining({ puntaje: 100 }));
  });

  it("no deja revisar mientras queden fichas sin clasificar", () => {
    render(<ClasificarCategoriasActivity actividad={{ id: "c2", titulo: "T", tipo: "clasificar_categorias", contenido: CLASIF }} />);
    expect(screen.getByRole("button", { name: /Faltan 4 fichas/ })).toBeDisabled();
  });
});

/* ── Caso con decisiones ─────────────────────────────────────────────────── */

const CASO = {
  contexto: "Un contexto de prueba",
  escenas: [
    {
      situacion: "Situación uno", pregunta: "¿Qué haces?",
      opciones: [
        { texto: "La mejor", consecuencia: "Salió bien", calidad: 2 },
        { texto: "La peor", consecuencia: "Salió mal", calidad: 0 },
      ],
    },
    {
      situacion: "Situación dos", pregunta: "¿Y ahora?",
      opciones: [
        { texto: "Otra buena", consecuencia: "Bien otra vez", calidad: 2 },
        { texto: "Otra mala", consecuencia: "Mal otra vez", calidad: 0 },
      ],
    },
  ],
  cierre_bueno: "Terminó bien",
  cierre_regular: "Terminó a medias",
  cierre_malo: "Terminó mal",
};

describe("CasoDecisionActivity", () => {
  it("muestra la consecuencia de cada decisión y el cierre que toca", async () => {
    const onProgreso = jest.fn().mockResolvedValue({ ok: true });
    render(
      <CasoDecisionActivity
        actividad={{ id: "k1", titulo: "T", tipo: "caso_decision", contenido: CASO }}
        onProgreso={onProgreso}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "La mejor" }));
    expect(screen.getByText("Salió bien")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Otra buena" }));
    expect(screen.getByText("Terminó bien")).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Registrar mi caso/ }));
    });
    expect(onProgreso).toHaveBeenCalledWith(expect.objectContaining({ puntaje: 100 }));
  });

  it("las decisiones malas llevan al cierre malo", () => {
    render(<CasoDecisionActivity actividad={{ id: "k2", titulo: "T", tipo: "caso_decision", contenido: CASO }} />);
    fireEvent.click(screen.getByRole("button", { name: "La peor" }));
    fireEvent.click(screen.getByRole("button", { name: "Otra mala" }));
    expect(screen.getByText("Terminó mal")).toBeInTheDocument();
  });
});

/* ── Reto contrarreloj ───────────────────────────────────────────────────── */

const RETO = {
  segundos_por_pregunta: 10,
  preguntas: Array.from({ length: 5 }, (_, i) => ({
    enunciado: `Pregunta ${i + 1}`,
    opciones: ["Verdadero", "Falso"],
    respuesta_correcta: 0,
  })),
};

describe("RetoCronometradoActivity", () => {
  beforeEach(() => { jest.useFakeTimers(); });
  afterEach(() => {
    // Los intervalos pendientes disparan setState al vaciarse; sin act() React
    // avisa de una actualización fuera de act en cada prueba del bloque.
    act(() => { jest.runOnlyPendingTimers(); });
    jest.useRealTimers();
  });

  it("no arranca el reloj hasta que el alumno empieza", () => {
    render(<RetoCronometradoActivity actividad={{ id: "t1", titulo: "T", tipo: "reto_cronometrado", contenido: RETO }} />);
    expect(screen.getByRole("button", { name: /Empezar el reto/ })).toBeInTheDocument();
    act(() => { jest.advanceTimersByTime(30_000); });
    // Sigue en la pantalla previa: el reloj no corre solo.
    expect(screen.getByRole("button", { name: /Empezar el reto/ })).toBeInTheDocument();
  });

  it("al agotarse el tiempo cuenta la pregunta como fallada y AVANZA a la siguiente", () => {
    // Que el reloj cuelgue la ronda es el peor fallo posible de este tipo:
    // el alumno se queda mirando una pregunta muerta.
    render(<RetoCronometradoActivity actividad={{ id: "t2", titulo: "T", tipo: "reto_cronometrado", contenido: RETO }} />);
    fireEvent.click(screen.getByRole("button", { name: /Empezar el reto/ }));
    expect(screen.getByText("Pregunta 1")).toBeInTheDocument();

    act(() => { jest.advanceTimersByTime(10_000); }); // se acaba el tiempo
    act(() => { jest.advanceTimersByTime(600); });    // pausa de revelado
    expect(screen.getByText("Pregunta 2")).toBeInTheDocument();
  });

  it("responder bien las cinco da 100 y entrega una sola vez", () => {
    const onProgreso = jest.fn().mockResolvedValue({ ok: true });
    render(
      <RetoCronometradoActivity
        actividad={{ id: "t3", titulo: "T", tipo: "reto_cronometrado", contenido: RETO }}
        onProgreso={onProgreso}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Empezar el reto/ }));
    for (let i = 0; i < RETO.preguntas.length; i++) {
      fireEvent.click(screen.getByRole("button", { name: "Verdadero" }));
      act(() => { jest.advanceTimersByTime(600); });
    }
    expect(onProgreso).toHaveBeenCalledTimes(1);
    expect(onProgreso).toHaveBeenCalledWith(
      expect.objectContaining({ puntaje: 100, completada: true }),
    );
  });
});
