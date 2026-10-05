/**
 * Quizzes de una pregunta a la vez (V/F y opción múltiple): el rediseño
 * cambió la presentación, NO la calificación. Aquí se prueba el flujo
 * (responder → retroalimentación inmediata → siguiente → resultado) y que
 * `onProgreso` reciba exactamente el mismo puntaje y las mismas respuestas.
 */
import { render, screen, fireEvent } from '@testing-library/react';

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

import { QuizVerdaderoFalsoActivity } from '../QuizVerdaderoFalsoActivity';
import { QuizMultipleOpcionActivity } from '../QuizMultipleOpcionActivity';
import type { ActividadQuizVerdaderoFalso, ActividadQuizMultipleOpcion } from '@/types/activities';

const vf: ActividadQuizVerdaderoFalso = {
  id: 'vf-1',
  tipo: 'quiz_verdadero_falso',
  titulo: 'V/F de prueba',
  contenido: {
    preguntas: [
      { enunciado: 'El agua hierve a 100 °C al nivel del mar.', respuesta: true, retroalimentacion: 'A 1 atm, sí.' },
      { enunciado: 'La Luna tiene luz propia.', respuesta: false, retroalimentacion: 'Refleja la luz del Sol.' },
    ],
  },
};

const mo: ActividadQuizMultipleOpcion = {
  id: 'mo-1',
  tipo: 'quiz_multiple_opcion',
  titulo: 'Opción múltiple de prueba',
  contenido: {
    preguntas: [
      { enunciado: '¿Cuánto es 2 + 2?', opciones: ['3', '4'], respuesta_correcta: 1, retroalimentacion: 'Dos más dos son cuatro.' },
      { enunciado: '¿Cuánto es 3 + 3?', opciones: ['6', '9'], respuesta_correcta: 0, retroalimentacion: 'Tres más tres son seis.' },
    ],
  },
};

describe('QuizVerdaderoFalsoActivity — una afirmación a la vez', () => {
  test('muestra solo la primera afirmación y corrige al instante', () => {
    render(<QuizVerdaderoFalsoActivity actividad={vf} />);

    expect(screen.getByText('Pregunta 1 de 2')).toBeInTheDocument();
    expect(screen.getByText(vf.contenido.preguntas[0]!.enunciado)).toBeInTheDocument();
    expect(screen.queryByText(vf.contenido.preguntas[1]!.enunciado)).toBeNull();
    // No se puede avanzar sin responder, ni saltar a una pregunta no vista
    expect(screen.getByRole('button', { name: 'Elige una respuesta' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Pregunta 2, aún no disponible/ })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: /Verdadero/ }));
    expect(screen.getByText('¡Correcto!')).toBeInTheDocument();
    expect(screen.getByText('A 1 atm, sí.')).toBeInTheDocument();
    // La respuesta queda fija una vez corregida
    expect(screen.getByRole('button', { name: /Falso/ })).toBeDisabled();
  });

  test('flujo completo: resultado con lo fallado y mismo onProgreso que antes', () => {
    const onProgreso = jest.fn();
    render(<QuizVerdaderoFalsoActivity actividad={vf} onProgreso={onProgreso} />);

    fireEvent.click(screen.getByRole('button', { name: /Verdadero/ }));
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
    expect(screen.getByText('Pregunta 2 de 2')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Verdadero/ })); // incorrecta
    expect(screen.getByText('Incorrecto')).toBeInTheDocument();
    expect(screen.getByText('Refleja la luz del Sol.')).toBeInTheDocument();

    // Se puede volver a la anterior y regresar
    fireEvent.click(screen.getByRole('button', { name: 'Pregunta anterior' }));
    expect(screen.getByText('Pregunta 1 de 2')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Pregunta 2, incorrecta/ }));
    fireEvent.click(screen.getByRole('button', { name: /Ver resultado/ }));

    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText(/1 de 2 correctas/)).toBeInTheDocument();
    expect(screen.getByText(/2\. La Luna tiene luz propia\./)).toBeInTheDocument();
    expect(onProgreso).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /Enviar respuestas \(2\/2\)/ }));
    expect(onProgreso).toHaveBeenCalledTimes(1);
    expect(onProgreso).toHaveBeenCalledWith({
      actividadId: 'vf-1',
      completada: false,
      puntaje: 50,
      respuestas: { 0: true, 1: true },
    });
    expect(screen.getByText('Respuestas enviadas')).toBeInTheDocument();
  });

  test('revisión con respuestas guardadas abre en el resultado sin re-enviar', () => {
    const onProgreso = jest.fn();
    render(
      <QuizVerdaderoFalsoActivity
        actividad={vf}
        onProgreso={onProgreso}
        estado="completada"
        respuestasIntento={{ '0': true, '1': 'false' }}
      />
    );
    expect(screen.getByText(/2 de 2 correctas/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Enviar respuestas/ })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /Revisar preguntas/ }));
    expect(screen.getByText('Pregunta 1 de 2')).toBeInTheDocument();
    expect(screen.getByText('¡Correcto!')).toBeInTheDocument();
    expect(onProgreso).not.toHaveBeenCalled();
  });
});

describe('QuizMultipleOpcionActivity — una pregunta a la vez', () => {
  test('flujo completo con retroalimentación inmediata y mismo onProgreso', () => {
    const onProgreso = jest.fn();
    render(<QuizMultipleOpcionActivity actividad={mo} onProgreso={onProgreso} />);

    expect(screen.getByText('Pregunta 1 de 2')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Opción B: 4' }));
    expect(screen.getByText('¡Correcto!')).toBeInTheDocument();
    expect(screen.getByText('Dos más dos son cuatro.')).toBeInTheDocument();
    // Doble clic / cambio de opción no duplica ni cambia la respuesta
    expect(screen.getByRole('button', { name: 'Opción A: 3' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Opción B: 9' })); // incorrecta
    expect(screen.getByText('Respuesta incorrecta')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Ver resultado/ }));

    expect(screen.getByText(/1 de 2 correctas/)).toBeInTheDocument();
    expect(screen.getByText(/2\. ¿Cuánto es 3 \+ 3\?/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /continuar/i }));
    expect(onProgreso).toHaveBeenCalledWith({
      actividadId: 'mo-1',
      completada: false,
      puntaje: 50,
      respuestas: { 0: 1, 1: 1 },
    });
    expect(screen.getByText('Quiz entregado')).toBeInTheDocument();
  });

  test('en revisión se navega por todas las preguntas y se ven las respuestas', () => {
    render(
      <QuizMultipleOpcionActivity
        actividad={mo}
        estado="completada"
        respuestasIntento={{ '0': '1', '1': '1' }}
      />
    );
    expect(screen.getByText(/1 de 2 correctas/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Pregunta 2, incorrecta/ }));
    expect(screen.getByText('Pregunta 2 de 2')).toBeInTheDocument();
    expect(screen.getByText('Respuesta incorrecta')).toBeInTheDocument();
    expect(screen.getByText('Tres más tres son seis.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Opción B: 9' })).toHaveAttribute('aria-pressed', 'true');
  });
});
