/**
 * @jest-environment jsdom
 *
 * Tests de la sync-queue centrados en las dos propiedades críticas:
 *
 * 1. ATRIBUCIÓN: la cola es por usuario. En una PC compartida de escuela el
 *    flush automático corre con la sesión del momento; una cola global
 *    insertaba las entregas del alumno A bajo la sesión del alumno B. Aquí
 *    se verifica que cada operación resuelve al usuario con sesión activa y
 *    que las colas ajenas / anónima / legacy jamás se flushean.
 *
 * 2. NO PERDER ENTREGAS: agotar MAX_INTENTOS ya no borra la entrada — queda
 *    'varada' (fuera del tick de 30 s pero reintentable en 'online' / carga
 *    de página) y se anuncia vía EVENTO_SYNC_VARADA.
 */

jest.mock("@/lib/actions/entregar-actividad", () => ({
  entregarActividad: jest.fn(),
}));

jest.mock("@/lib/actions/entregar-actividades-batch", () => ({
  entregarActividadesBatch: jest.fn(),
}));

jest.mock("@/lib/supabase-browser", () => ({
  getSupabaseBrowser: jest.fn(),
}));

import { entregarActividad } from "@/lib/actions/entregar-actividad";
import { entregarActividadesBatch } from "@/lib/actions/entregar-actividades-batch";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
// Importar el módulo dispara su auto-inicialización (listener 'online' +
// intervalo + flush inicial). Con los mocks sin configurar ese flush inicial
// resuelve usuario null y termina sin tocar nada — es inocuo para los tests.
import { syncQueue, EVENTO_SYNC_RESUELTO, EVENTO_SYNC_VARADA } from "@/lib/sync-queue";

const mockEntregar = entregarActividad as jest.Mock;
const mockEntregarLote = entregarActividadesBatch as jest.Mock;
const mockGetBrowser = getSupabaseBrowser as jest.Mock;

// Claves espejo de las del módulo (no se exportan: son detalle de persistencia).
const CLAVE_LEGACY = "cen.syncQueue.entregas";
const CLAVE_ANON = `${CLAVE_LEGACY}.anon`;
const CLAVE_CUARENTENA = `${CLAVE_LEGACY}.legacy`;
const claveDe = (userId: string) => `${CLAVE_LEGACY}.${userId}`;

/** Simula la sesión que verá `auth.getSession()` (null = sin sesión). */
function conSesion(userId: string | null) {
  mockGetBrowser.mockReturnValue({
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: userId ? { user: { id: userId } } : null },
      }),
    },
  });
}

function leer(clave: string): Record<string, { intentos: number; varada?: boolean }> | null {
  const raw = window.localStorage.getItem(clave);
  return raw ? (JSON.parse(raw) as Record<string, { intentos: number; varada?: boolean }>) : null;
}

function sembrar(clave: string, entradas: Record<string, unknown>) {
  window.localStorage.setItem(clave, JSON.stringify(entradas));
}

function entrada(actividadId: string, extra: Record<string, unknown> = {}) {
  return { actividadId, resultado: { puntaje: 90 }, intentos: 0, ts: Date.now(), ...extra };
}

/** Captura los actividadId anunciados por un evento de la cola durante `fn`. */
async function capturandoEvento(evento: string, fn: () => Promise<void>): Promise<string[]> {
  const ids: string[] = [];
  const listener = (e: Event) => {
    ids.push((e as CustomEvent<{ actividadId: string }>).detail.actividadId);
  };
  window.addEventListener(evento, listener);
  try {
    await fn();
  } finally {
    window.removeEventListener(evento, listener);
  }
  return ids;
}

beforeEach(() => {
  window.localStorage.clear();
  jest.resetAllMocks(); // resetea también los mockResolvedValue del test anterior
});

// ── Atribución: enqueue por usuario ─────────────────────────────────────────

describe("enqueue — clave por usuario", () => {
  test("con sesión escribe bajo la clave del usuario, no bajo la global", async () => {
    conSesion("user-a");

    await syncQueue.enqueue("act-1", { puntaje: 80 });

    expect(leer(claveDe("user-a"))).toHaveProperty("act-1");
    expect(leer(CLAVE_LEGACY)).toBeNull(); // la clave global antigua ya no se escribe
  });

  test("sin sesión encola bajo .anon", async () => {
    conSesion(null);

    await syncQueue.enqueue("act-1", { puntaje: 80 });

    expect(leer(CLAVE_ANON)).toHaveProperty("act-1");
  });

  test("re-encolar resetea intentos/varada (nueva acción manual del alumno)", async () => {
    conSesion("user-a");
    sembrar(claveDe("user-a"), { "act-1": entrada("act-1", { intentos: 10, varada: true }) });

    await syncQueue.enqueue("act-1", { puntaje: 95 });

    const cola = leer(claveDe("user-a"))!;
    expect(cola["act-1"]!.intentos).toBe(0);
    expect(cola["act-1"]!.varada).toBeUndefined();
  });
});

// ── Atribución: flush solo del usuario con sesión ───────────────────────────

describe("flush — atribución en PC compartida", () => {
  test("procesa SOLO la cola del usuario con sesión; las demás quedan intactas", async () => {
    conSesion("user-b");
    sembrar(claveDe("user-a"), { "act-a": entrada("act-a") });
    sembrar(claveDe("user-b"), { "act-b": entrada("act-b") });
    sembrar(CLAVE_ANON, { "act-c": entrada("act-c") });
    mockEntregar.mockResolvedValue({ ok: true });

    await syncQueue.flush();

    expect(mockEntregar).toHaveBeenCalledTimes(1);
    expect(mockEntregar).toHaveBeenCalledWith("act-b", { puntaje: 90 });
    expect(leer(claveDe("user-b"))).toEqual({}); // la suya se entregó y se limpió
    expect(leer(claveDe("user-a"))).toHaveProperty("act-a"); // la de A espera a que A vuelva
    expect(leer(CLAVE_ANON)).toHaveProperty("act-c"); // la anónima nunca se flushea
  });

  test("sin sesión no llama al server ni toca colas", async () => {
    conSesion(null);
    sembrar(claveDe("user-a"), { "act-a": entrada("act-a") });
    sembrar(CLAVE_ANON, { "act-c": entrada("act-c") });

    await syncQueue.flush();

    expect(mockEntregar).not.toHaveBeenCalled();
    expect(leer(claveDe("user-a"))).toHaveProperty("act-a");
    expect(leer(CLAVE_ANON)).toHaveProperty("act-c");
  });

  test("la clave global legacy se mueve a cuarentena y NUNCA se entrega", async () => {
    conSesion("user-a");
    sembrar(CLAVE_LEGACY, { "act-x": entrada("act-x") });
    mockEntregar.mockResolvedValue({ ok: true });

    await syncQueue.flush();

    // No es atribuible con seguridad: preferimos perderla antes que
    // insertarla bajo el alumno equivocado.
    expect(mockEntregar).not.toHaveBeenCalled();
    expect(leer(CLAVE_LEGACY)).toBeNull();
    expect(leer(CLAVE_CUARENTENA)).toHaveProperty("act-x");
  });
});

// ── No perder entregas: estado 'varada' en vez de borrado ───────────────────

describe("flush — entradas varadas", () => {
  test("tras MAX_INTENTOS queda varada (no se borra) y dispara EVENTO_SYNC_VARADA", async () => {
    conSesion("user-a");
    sembrar(claveDe("user-a"), { "act-1": entrada("act-1", { intentos: 9 }) });
    mockEntregar.mockResolvedValue({ error: "Error al guardar el intento. Intenta de nuevo." });
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    const varadas = await capturandoEvento(EVENTO_SYNC_VARADA, () => syncQueue.flush());

    const cola = leer(claveDe("user-a"))!;
    expect(cola["act-1"]).toMatchObject({ intentos: 10, varada: true });
    expect(varadas).toEqual(["act-1"]);
    warnSpy.mockRestore();
  });

  test("el tick normal salta varadas; con incluirVaradas se reintenta y resuelve", async () => {
    conSesion("user-a");
    sembrar(claveDe("user-a"), { "act-1": entrada("act-1", { intentos: 10, varada: true }) });
    mockEntregar.mockResolvedValue({ ok: true });

    // Tick de intervalo: la varada no se reintenta (el timer ciego ya demostró no destrancarla)
    await syncQueue.flush();
    expect(mockEntregar).not.toHaveBeenCalled();

    // 'online' / carga de página: sí se reintenta, y al lograrse se anuncia y se limpia
    const resueltas = await capturandoEvento(EVENTO_SYNC_RESUELTO, () =>
      syncQueue.flush({ incluirVaradas: true })
    );
    expect(mockEntregar).toHaveBeenCalledTimes(1);
    expect(resueltas).toEqual(["act-1"]);
    expect(leer(claveDe("user-a"))).toEqual({});
  });

  test("un fallo de red (promesa rechazada) suma intento pero conserva la entrada", async () => {
    conSesion("user-a");
    sembrar(claveDe("user-a"), { "act-1": entrada("act-1") });
    mockEntregar.mockRejectedValue(new Error("offline"));

    await syncQueue.flush();

    const cola = leer(claveDe("user-a"))!;
    expect(cola["act-1"]).toMatchObject({ intentos: 1 });
    expect(cola["act-1"]!.varada).toBeUndefined();
  });
});

// ── Rate limit: cortar el ciclo para no auto-colisionar ─────────────────────

describe("flush — rate limit del server", () => {
  test("con UNA pendiente (camino individual), el error de rate limit no suma intento", async () => {
    conSesion("user-a");
    sembrar(claveDe("user-a"), { "act-1": entrada("act-1") });
    // Mismo texto exacto que devuelve entregar-actividad.ts al agotar 30/60s
    mockEntregar.mockResolvedValue({
      error: "Demasiados intentos. Intenta de nuevo en unos minutos.",
    });

    await syncQueue.flush();

    expect(mockEntregar).toHaveBeenCalledTimes(1);
    expect(mockEntregarLote).not.toHaveBeenCalled();
    const cola = leer(claveDe("user-a"))!;
    expect(cola["act-1"]!.intentos).toBe(0); // el throttle no es culpa de la entrada
  });

  test("con MÁS DE UNA pendiente (camino en lote), el error de rate limit del lote no suma intento a ninguna", async () => {
    conSesion("user-a");
    sembrar(claveDe("user-a"), {
      "act-1": entrada("act-1"),
      "act-2": entrada("act-2"),
    });
    // Mismo texto exacto que devuelve entregar-actividades-batch.ts al agotar 30/60s
    mockEntregarLote.mockResolvedValue({
      error: "Demasiados intentos. Intenta de nuevo en unos minutos.",
    });

    await syncQueue.flush();

    // Una sola llamada para las dos pendientes, no una por ítem
    expect(mockEntregarLote).toHaveBeenCalledTimes(1);
    expect(mockEntregar).not.toHaveBeenCalled();
    const cola = leer(claveDe("user-a"))!;
    expect(cola["act-1"]!.intentos).toBe(0); // el throttle no es culpa de ninguna entrada
    expect(cola["act-2"]!.intentos).toBe(0);
  });
});

// ── Lote: >1 pendiente usa entregarActividadesBatch en UNA llamada ──────────

describe("flush — lote (>1 pendiente)", () => {
  test("resuelve cada ítem exitoso del lote: dequeue + EVENTO_SYNC_RESUELTO por cada uno", async () => {
    conSesion("user-a");
    sembrar(claveDe("user-a"), {
      "act-1": entrada("act-1"),
      "act-2": entrada("act-2"),
    });
    mockEntregarLote.mockResolvedValue({
      ok: true,
      resultados: [
        { actividadId: "act-1", ok: true },
        { actividadId: "act-2", ok: true },
      ],
    });

    const resueltas = await capturandoEvento(EVENTO_SYNC_RESUELTO, () => syncQueue.flush());

    expect(mockEntregarLote).toHaveBeenCalledTimes(1);
    expect(mockEntregarLote).toHaveBeenCalledWith([
      { actividadId: "act-1", resultado: { puntaje: 90 } },
      { actividadId: "act-2", resultado: { puntaje: 90 } },
    ]);
    expect(resueltas.sort()).toEqual(["act-1", "act-2"]);
    expect(leer(claveDe("user-a"))).toEqual({});
  });

  test("resultado mixto: el ítem con error del lote suma intento, el exitoso se limpia", async () => {
    conSesion("user-a");
    sembrar(claveDe("user-a"), {
      "act-1": entrada("act-1"),
      "act-2": entrada("act-2"),
    });
    mockEntregarLote.mockResolvedValue({
      ok: true,
      resultados: [
        { actividadId: "act-1", ok: true },
        { actividadId: "act-2", error: "Actividad no encontrada o no disponible" },
      ],
    });

    await syncQueue.flush();

    const cola = leer(claveDe("user-a"))!;
    expect(cola).not.toHaveProperty("act-1"); // se entregó y se limpió
    expect(cola["act-2"]).toMatchObject({ intentos: 1 }); // sumó intento, sigue en cola
  });

  test("fallo de red del lote entero (promesa rechazada) suma intento a CADA pendiente", async () => {
    conSesion("user-a");
    sembrar(claveDe("user-a"), {
      "act-1": entrada("act-1"),
      "act-2": entrada("act-2"),
    });
    mockEntregarLote.mockRejectedValue(new Error("offline"));

    await syncQueue.flush();

    const cola = leer(claveDe("user-a"))!;
    expect(cola["act-1"]).toMatchObject({ intentos: 1 });
    expect(cola["act-2"]).toMatchObject({ intentos: 1 });
  });
});

// ── dequeue ─────────────────────────────────────────────────────────────────

describe("dequeue", () => {
  test("limpia la cola del usuario y también la copia anónima huérfana", async () => {
    conSesion("user-a");
    sembrar(claveDe("user-a"), { "act-1": entrada("act-1") });
    sembrar(CLAVE_ANON, { "act-1": entrada("act-1") });

    await syncQueue.dequeue("act-1");

    expect(leer(claveDe("user-a"))).toEqual({});
    expect(leer(CLAVE_ANON)).toEqual({});
  });

  test("no toca colas de otros usuarios", async () => {
    conSesion("user-a");
    sembrar(claveDe("user-b"), { "act-1": entrada("act-1") });

    await syncQueue.dequeue("act-1");

    expect(leer(claveDe("user-b"))).toHaveProperty("act-1");
  });
});
