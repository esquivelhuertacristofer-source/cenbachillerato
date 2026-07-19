/**
 * Estado neutral de revisión cuando `respuestas` del intento llegó null o vacío
 * desde la BD (datos históricos, o detalle almacenado fuera de la fila).
 *
 * El bug original: QuizMultipleOpcionActivity fabricaba respuestas '-1' y el
 * resumen mostraba "0 aciertos" como si el alumno hubiera fallado todo. Cada
 * componente que rehidrata `respuestasIntento` debe, en ese caso, mostrar
 * "Entrega registrada — la revisión detallada no está disponible" y NUNCA
 * conteos calculados de respuestas ausentes. Cuando las respuestas SÍ están,
 * la revisión normal se conserva intacta (tests de regresión incluidos).
 */
import { render, screen } from '@testing-library/react';

// ── Mocks de entorno ──────────────────────────────────────────────────────────
// jest.setup.ts no instala matchMedia ni IntersectionObserver (jsdom no los
// trae), así que reemplazamos motion/react por componentes DOM planos y los
// hooks de movimiento por valores estáticos. Lo animado no es lo que se prueba.

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

// LecturaActivity: react-markdown y remark-gfm son ESM puro (jest no los
// transpila) y next/image exige el loader de Next; los reducimos a lo mínimo.
jest.mock('react-markdown', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  return {
    __esModule: true,
    default: ({ children }: { children?: React.ReactNode }) =>
      React.createElement('div', null, children),
  };
});
jest.mock('remark-gfm', () => ({ __esModule: true, default: () => null }));
jest.mock('next/image', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  return {
    __esModule: true,
    default: (props: Record<string, unknown>) => {
      const { fill, priority, sizes, ...rest } = props;
      void fill; void priority; void sizes;
      return React.createElement('img', rest);
    },
  };
});

import { QuizMultipleOpcionActivity } from '../QuizMultipleOpcionActivity';
import { FillBlanksActivity } from '../FillBlanksActivity';
import { EjercicioMatematicoActivity } from '../EjercicioMatematicoActivity';
import { ReflexionEscritaActivity } from '../ReflexionEscritaActivity';
import { DebateEstructuradoActivity } from '../DebateEstructuradoActivity';
import { LecturaActivity } from '../LecturaActivity';
import type {
  ActividadQuizMultipleOpcion,
  ActividadFillBlanks,
  ActividadEjercicioMatematico,
  ActividadReflexionEscrita,
  ActividadDebateEstructurado,
  ActividadLectura,
} from '@/types/activities';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const quiz: ActividadQuizMultipleOpcion = {
  tipo: 'quiz_multiple_opcion',
  titulo: 'Quiz de prueba',
  contenido: {
    preguntas: [
      { enunciado: '¿Cuánto es 2 + 2?', opciones: ['3', '4'], respuesta_correcta: 1 },
      { enunciado: '¿Cuánto es 3 + 3?', opciones: ['6', '9'], respuesta_correcta: 0 },
    ],
  },
};

const fillBlanks: ActividadFillBlanks = {
  tipo: 'fill_blanks',
  titulo: 'Completar espacios',
  contenido: {
    texto_con_huecos: 'El agua es ___ y el sol es ___.',
    huecos: [
      { posicion: 0, respuesta_correcta: 'líquida' },
      { posicion: 1, respuesta_correcta: 'caliente' },
    ],
  },
};

const ejercicio: ActividadEjercicioMatematico = {
  tipo: 'ejercicio_matematico',
  titulo: 'Ejercicio de prueba',
  contenido: {
    problema: 'Calcula 2 + 2',
    tipo_respuesta: 'numerica',
    respuesta_final: '4',
  },
};

const reflexion: ActividadReflexionEscrita = {
  tipo: 'reflexion_escrita',
  titulo: 'Reflexión de prueba',
  contenido: {
    prompt: '¿Qué aprendiste hoy sobre el tema?',
    longitud_minima_palabras: 5,
  },
};

const debate: ActividadDebateEstructurado = {
  tipo: 'debate_estructurado',
  titulo: 'Debate de prueba',
  contenido: {
    tema: '¿Debe usarse la IA en el aula?',
    posturas: ['A favor', 'En contra'],
  },
};

const lectura: ActividadLectura = {
  tipo: 'lectura',
  titulo: 'Lectura de prueba',
  contenido: {
    texto: 'Un texto breve para la prueba.',
    preguntas_comprension: [{ pregunta: '¿Qué dice el texto?' }],
  },
};

// ── QuizMultipleOpcionActivity ────────────────────────────────────────────────

describe('QuizMultipleOpcionActivity — revisión sin respuestas', () => {
  test('muestra estado neutral sin conteos cuando respuestasIntento es undefined', () => {
    render(<QuizMultipleOpcionActivity actividad={quiz} estado="completada" />);

    expect(screen.getByText('Entrega registrada')).toBeInTheDocument();
    // Nunca el "0 aciertos" fabricado con '-1'
    expect(screen.queryByText(/de 2 correctas/)).toBeNull();
    expect(screen.queryByText(/aciertos/i)).toBeNull();
    // Sin "Continuar": re-entregar sin respuestas registraría puntaje 0
    expect(screen.queryByRole('button', { name: /continuar/i })).toBeNull();
    expect(screen.getByRole('button', { name: /volver a hacer/i })).toBeInTheDocument();
  });

  test('muestra estado neutral cuando respuestasIntento es un objeto vacío', () => {
    render(<QuizMultipleOpcionActivity actividad={quiz} estado="completada" respuestasIntento={{}} />);

    expect(screen.getByText('Entrega registrada')).toBeInTheDocument();
    expect(screen.queryByText(/de 2 correctas/)).toBeNull();
    expect(screen.queryByRole('button', { name: /continuar/i })).toBeNull();
  });

  test('conserva el resumen normal cuando sí hay respuestas guardadas', () => {
    render(
      <QuizMultipleOpcionActivity
        actividad={quiz}
        estado="completada"
        respuestasIntento={{ '0': '1', '1': '0' }}
      />
    );

    expect(screen.getByText(/2 de 2 correctas/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continuar/i })).toBeInTheDocument();
    expect(screen.queryByText('Entrega registrada')).toBeNull();
  });
});

// ── FillBlanksActivity ────────────────────────────────────────────────────────

describe('FillBlanksActivity — revisión sin respuestas', () => {
  test('muestra estado neutral sin marcador de aciertos', () => {
    render(<FillBlanksActivity actividad={fillBlanks} estado="completada" />);

    expect(
      screen.getByText('Entrega registrada — la revisión detallada no está disponible')
    ).toBeInTheDocument();
    expect(screen.getByText('Entrega registrada')).toBeInTheDocument();
    // Nunca "0 / 2 aciertos" ni "0 / 2 correctos" de huecos vacíos
    expect(screen.queryByText(/aciertos/)).toBeNull();
    expect(screen.queryByText(/correctos/)).toBeNull();
  });

  test('conserva la revisión normal cuando sí hay respuestas guardadas', () => {
    render(
      <FillBlanksActivity
        actividad={fillBlanks}
        estado="completada"
        respuestasIntento={{ '0': 'líquida', '1': 'caliente' }}
      />
    );

    expect(
      screen.getByText('Ya completaste esta actividad · Revisando tus respuestas anteriores')
    ).toBeInTheDocument();
    expect(screen.getByText('2 / 2 correctos')).toBeInTheDocument();
    expect(screen.getByText('2 / 2 aciertos')).toBeInTheDocument();
  });
});

// ── EjercicioMatematicoActivity ───────────────────────────────────────────────

describe('EjercicioMatematicoActivity — revisión sin respuestas', () => {
  test('el banner avisa que el detalle no está disponible', () => {
    render(<EjercicioMatematicoActivity actividad={ejercicio} estado="completada" />);

    expect(
      screen.getByText('Entrega registrada — la revisión detallada no está disponible')
    ).toBeInTheDocument();
  });

  test('conserva el banner de revisión normal cuando hay respuesta guardada', () => {
    render(
      <EjercicioMatematicoActivity
        actividad={ejercicio}
        estado="completada"
        respuestasIntento={{ respuesta: '4' }}
      />
    );

    expect(
      screen.getByText('Ya completaste este ejercicio · Revisando tu respuesta anterior')
    ).toBeInTheDocument();
  });
});

// ── ReflexionEscritaActivity ──────────────────────────────────────────────────

describe('ReflexionEscritaActivity — revisión sin respuestas', () => {
  test('sustituye el textarea vacío y el contador por el estado neutral', () => {
    render(<ReflexionEscritaActivity actividad={reflexion} estado="completada" />);

    // Banner + tarjeta neutral
    expect(screen.getAllByText('Entrega registrada')).toHaveLength(2);
    expect(
      screen.getByText('La revisión detallada no está disponible para este intento.')
    ).toBeInTheDocument();
    // Sin textarea vacío ni "0 / 5 palabras"
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.queryByText(/0 \/ 5 palabras/)).toBeNull();
  });

  test('conserva la revisión normal cuando el texto guardado existe', () => {
    render(
      <ReflexionEscritaActivity
        actividad={reflexion}
        estado="completada"
        respuestasIntento={{ texto: 'uno dos tres cuatro cinco seis' }}
      />
    );

    expect(screen.getByText('Revisando tu entrega anterior')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('uno dos tres cuatro cinco seis');
    expect(screen.getByText(/6 \/ 5 palabras/)).toBeInTheDocument();
  });
});

// ── DebateEstructuradoActivity ────────────────────────────────────────────────

describe('DebateEstructuradoActivity — revisión sin respuestas', () => {
  test('no abre el editor vacío y avisa que el detalle no está disponible', () => {
    render(<DebateEstructuradoActivity actividad={debate} estado="completada" />);

    expect(
      screen.getByText('Entrega registrada — la revisión detallada no está disponible')
    ).toBeInTheDocument();
    // Sin editor con "0 / 80 palabras" ni "Postura: —"
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.queryByText(/Postura:/)).toBeNull();
  });

  test('conserva la revisión normal cuando la entrega guardada existe', () => {
    const argumentacion = Array(80).fill('palabra').join(' ');
    render(
      <DebateEstructuradoActivity
        actividad={debate}
        estado="completada"
        respuestasIntento={{ postura: '0', posturaNombre: 'A favor', argumentacion }}
      />
    );

    expect(screen.getByText(/Revisando tu entrega · Postura: A favor/)).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue(argumentacion);
  });
});

// ── LecturaActivity ───────────────────────────────────────────────────────────

describe('LecturaActivity — revisión sin respuestas', () => {
  test('con preguntas y sin respuestas guardadas avisa e invita a re-entregar', () => {
    render(<LecturaActivity actividad={lectura} estado="completada" />);

    expect(screen.getByText('Entrega registrada')).toBeInTheDocument();
    expect(
      screen.getByText(
        'La revisión detallada no está disponible. Puedes responder de nuevo y re-entregar si lo deseas.'
      )
    ).toBeInTheDocument();
  });

  test('conserva la revisión normal cuando sí hay respuestas guardadas', () => {
    render(
      <LecturaActivity
        actividad={lectura}
        estado="completada"
        respuestasIntento={{ '0': 'Dice algo breve.' }}
      />
    );

    expect(screen.getByText('Ya completaste esta lectura')).toBeInTheDocument();
    expect(screen.queryByText('Entrega registrada')).toBeNull();
  });

  test('una lectura SIN preguntas no muestra el aviso neutral (entrega sin respuestas es legítima)', () => {
    const sinPreguntas: ActividadLectura = {
      ...lectura,
      contenido: { texto: lectura.contenido.texto },
    };
    render(<LecturaActivity actividad={sinPreguntas} estado="completada" />);

    expect(screen.getByText('Ya completaste esta lectura')).toBeInTheDocument();
    expect(screen.queryByText('Entrega registrada')).toBeNull();
  });
});
