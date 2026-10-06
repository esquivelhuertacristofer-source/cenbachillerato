/**
 * «Practicar con otros números» dentro del ejercicio matemático.
 *
 * - El botón aparece solo después de verificar (o en revisión) y solo si el
 *   ejercicio tiene generador de variantes.
 * - La variante se califica con `coincideNumero`, muestra la solución paso a
 *   paso y NUNCA llama a `onProgreso` (no cambia la calificación).
 */
import { render, screen, fireEvent } from '@testing-library/react';

// Mismos mocks de entorno que revision-sin-respuestas.test.tsx: jsdom no trae
// matchMedia ni IntersectionObserver, y lo animado no es lo que se prueba.
jest.mock('motion/react', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const MOTION_PROPS = [
    'initial', 'animate', 'exit', 'variants', 'transition',
    'whileHover', 'whileTap', 'whileInView', 'whileFocus', 'whileDrag',
    'viewport', 'layout', 'layoutId', 'drag', 'dragConstraints',
    'onAnimationStart', 'onAnimationComplete',
  ];
  const cache = new Map<string, React.ComponentType<Record<string, unknown>>>();
  const motion = new Proxy({} as Record<string, unknown>, {
    get(_target, tag: string) {
      if (!cache.has(tag)) {
        const Comp = React.forwardRef<unknown, Record<string, unknown>>((props, ref) => {
          const clean: Record<string, unknown> = { ...props };
          for (const p of MOTION_PROPS) delete clean[p];
          return React.createElement(tag, { ...clean, ref });
        });
        Comp.displayName = `motion.${tag}`;
        cache.set(tag, Comp as React.ComponentType<Record<string, unknown>>);
      }
      return cache.get(tag);
    },
  });
  return {
    __esModule: true,
    motion,
    AnimatePresence: ({ children }: { children?: React.ReactNode }) => children,
    useReducedMotion: () => true,
  };
});

jest.mock('@/lib/motion/hooks', () => ({
  useReducedMotion: () => true,
  useInView: () => [jest.fn(), true],
}));

jest.mock('@/lib/motion/celebrate', () => ({
  celebrate: jest.fn(),
  fireworks: jest.fn(),
}));

import { EjercicioMatematicoActivity } from '../EjercicioMatematicoActivity';
import { generarVariante, fmt } from '@/lib/ejercicios/variantes';
import type { ActividadEjercicioMatematico } from '@/types/activities';

const CODIGO = 'PM-I-P05-A6';

const conVariantes: ActividadEjercicioMatematico = {
  id: 'act-1',
  codigo: CODIGO,
  tipo: 'ejercicio_matematico',
  titulo: 'Regla de tres en contexto',
  contenido: {
    problema: 'Una receta para 4 personas necesita 300 g de harina. ¿Cuánta harina se necesita para 6 personas?',
    tipo_respuesta: 'numerica',
    respuesta_final: '450 g',
    unidades: 'gramos',
    tolerancia_error: 0,
  },
};

const sinVariantes: ActividadEjercicioMatematico = {
  ...conVariantes,
  codigo: 'NO-TIENE-GENERADOR',
};

// Semilla fija: `nuevaSemilla()` = floor(Math.random() × 2³²).
const RANDOM = 0.5;
const SEMILLA = Math.floor(RANDOM * 4294967296) >>> 0;

beforeEach(() => {
  jest.spyOn(Math, 'random').mockReturnValue(RANDOM);
  // jsdom no implementa scrollIntoView.
  Element.prototype.scrollIntoView = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

function resolverOriginal() {
  fireEvent.change(screen.getByLabelText(/Tu respuesta/), { target: { value: '450' } });
  fireEvent.click(screen.getByRole('button', { name: /Verificar respuesta/ }));
}

describe('EjercicioMatematicoActivity — practicar con otros números', () => {
  test('el botón aparece solo después de verificar', () => {
    render(<EjercicioMatematicoActivity actividad={conVariantes} />);
    expect(screen.queryByRole('button', { name: /Practicar con otros números/ })).toBeNull();

    resolverOriginal();
    expect(screen.getByText('¡Respuesta correcta!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Practicar con otros números/ })).toBeInTheDocument();
  });

  test('no aparece si el ejercicio no tiene generador', () => {
    render(<EjercicioMatematicoActivity actividad={sinVariantes} />);
    resolverOriginal();
    expect(screen.getByText('¡Respuesta correcta!')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Practicar con otros números/ })).toBeNull();
  });

  test('aparece también en modo revisión', () => {
    render(<EjercicioMatematicoActivity actividad={conVariantes} estado="completada" respuestasIntento={{ respuesta: '450' }} />);
    expect(screen.getByRole('button', { name: /Practicar con otros números/ })).toBeInTheDocument();
  });

  test('una variante se califica, muestra la solución y no toca la calificación', () => {
    const onProgreso = jest.fn().mockResolvedValue({ ok: true });
    const esperada = generarVariante(CODIGO, SEMILLA)!;
    render(<EjercicioMatematicoActivity actividad={conVariantes} onProgreso={onProgreso} />);
    resolverOriginal();

    fireEvent.click(screen.getByRole('button', { name: /Practicar con otros números/ }));
    expect(screen.getByText(esperada.problema)).toBeInTheDocument();

    const casilla = screen.getByLabelText(/Tu respuesta \(g\)/);
    const verificar = screen.getByRole('button', { name: /^Verificar$/ });

    // Respuesta equivocada → retroalimentación, sin calificar el ejercicio.
    fireEvent.change(casilla, { target: { value: String(esperada.respuesta + 1000) } });
    fireEvent.click(verificar);
    expect(screen.getByText(/Todavía no/)).toBeInTheDocument();

    // Solución paso a paso.
    fireEvent.click(screen.getByRole('button', { name: /Ver solución/ }));
    expect(screen.getByText(esperada.pasos[esperada.pasos.length - 1]!)).toBeInTheDocument();
    expect(screen.getByText(`Resultado: ${esperada.respuestaTexto}`)).toBeInTheDocument();

    // Respuesta correcta, escrita como la escribiría el alumno («1,950»).
    fireEvent.change(casilla, { target: { value: fmt(esperada.respuesta) } });
    fireEvent.click(screen.getByRole('button', { name: /^Verificar$/ }));
    expect(screen.getByText(`¡Correcto! ${esperada.respuestaTexto}.`)).toBeInTheDocument();
    expect(screen.getByText(/Llevas 0 de 1 a la primera/)).toBeInTheDocument();

    // Otro ejercicio: casilla vacía y sin retroalimentación.
    fireEvent.click(screen.getByRole('button', { name: /Otro ejercicio/ }));
    expect(screen.getByLabelText(/Tu respuesta \(g\)/)).toHaveValue('');
    expect(screen.queryByText(/¡Correcto!/)).toBeNull();

    // La práctica nunca se envía como progreso.
    expect(onProgreso).not.toHaveBeenCalled();

    // Cerrar el panel devuelve el botón.
    fireEvent.click(screen.getByRole('button', { name: /Cerrar la práctica/ }));
    expect(screen.getByRole('button', { name: /Practicar con otros números/ })).toBeInTheDocument();

    // La entrega del ejercicio original sigue funcionando igual.
    fireEvent.click(screen.getByRole('button', { name: /Continuar/ }));
    expect(onProgreso).toHaveBeenCalledTimes(1);
    expect(onProgreso).toHaveBeenCalledWith(expect.objectContaining({ actividadId: 'act-1', completada: true, puntaje: 100, respuestas: { respuesta: '450' } }));
  });
});
