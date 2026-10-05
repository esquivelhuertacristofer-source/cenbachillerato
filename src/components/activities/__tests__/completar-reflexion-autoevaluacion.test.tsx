/**
 * Rediseño de «Completa los espacios», «Reflexión escrita» y «Autoevaluación»
 * (menos texto, mejor acomodo, usable en celular). Lo que se prueba aquí es
 * que el nuevo acomodo NO cambió el contrato: mismos datos y mismo puntaje a
 * `onProgreso`, y que las piezas nuevas (banco de palabras, revisión por
 * espacio, consigna plegable, un criterio a la vez + resumen) funcionan.
 */
import { render, screen, fireEvent, act } from '@testing-library/react';

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

import { FillBlanksActivity } from '../FillBlanksActivity';
import { ReflexionEscritaActivity } from '../ReflexionEscritaActivity';
import { AutoevaluacionActivity } from '../AutoevaluacionActivity';
import type {
  ActividadFillBlanks,
  ActividadReflexionEscrita,
  ActividadAutoevaluacion,
} from '@/types/activities';

// ── Completa los espacios ─────────────────────────────────────────────────────

const conBanco: ActividadFillBlanks = {
  id: 'fb-1',
  tipo: 'fill_blanks',
  titulo: 'Calor',
  contenido: {
    instrucciones: 'Completa el texto con el banco de palabras: calor, Kelvin, Joule.',
    texto_con_huecos: 'La escala absoluta es ___ y la unidad de energía es el ___.',
    huecos: [
      { posicion: 0, respuesta_correcta: 'Kelvin' },
      { posicion: 1, respuesta_correcta: 'Joule', pista: 'Unidad del SI.' },
    ],
  },
};

describe('FillBlanksActivity — rediseño', () => {
  test('el banco de palabras sale de las instrucciones y llena el espacio vacío', () => {
    render(<FillBlanksActivity actividad={conBanco} />);

    expect(screen.getByText('Completa el texto con el banco de palabras:')).toBeInTheDocument();
    const banco = screen.getByRole('group', { name: 'Banco de palabras' });
    expect(banco).toHaveTextContent('calor');

    fireEvent.click(screen.getByRole('button', { name: 'Kelvin' }));
    expect(screen.getByLabelText('Hueco 1')).toHaveValue('Kelvin');
    expect(screen.getByLabelText('Hueco 2')).toHaveValue('');
  });

  test('la pista se abre bajo el párrafo', () => {
    render(<FillBlanksActivity actividad={conBanco} />);
    fireEvent.click(screen.getByRole('button', { name: 'Pista para hueco 2' }));
    expect(screen.getByText('Unidad del SI.')).toBeInTheDocument();
  });

  test('al comprobar marca cada espacio y entrega el mismo puntaje', async () => {
    const onProgreso = jest.fn().mockResolvedValue({ ok: true });
    render(<FillBlanksActivity actividad={conBanco} onProgreso={onProgreso} />);

    fireEvent.change(screen.getByLabelText('Hueco 1'), { target: { value: 'kelvin' } });
    fireEvent.change(screen.getByLabelText('Hueco 2'), { target: { value: 'caloría' } });
    fireEvent.click(screen.getByRole('button', { name: /Verificar respuestas/ }));

    expect(screen.getByText('1 / 2 aciertos')).toBeInTheDocument();
    // Revisión espacio por espacio: la respuesta correcta del que falló.
    expect(screen.getByRole('list', { name: 'Revisión por espacio' })).toHaveTextContent('Joule');

    fireEvent.click(screen.getByRole('button', { name: /Ver respuestas correctas/ }));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Continuar/ }));
    });
    expect(onProgreso).toHaveBeenCalledWith({
      actividadId: 'fb-1',
      completada: false,
      puntaje: 50,
      respuestas: { '0': 'kelvin', '1': 'caloría' },
    });
  });
});

// ── Reflexión escrita ─────────────────────────────────────────────────────────

describe('ReflexionEscritaActivity — rediseño', () => {
  test('consigna corta: completa, sin plegar, con la meta de extensión', () => {
    const a: ActividadReflexionEscrita = {
      tipo: 'reflexion_escrita',
      titulo: 'Reflexión',
      contenido: { prompt: '¿Qué aprendiste hoy?', longitud_minima_palabras: 3, longitud_maxima_palabras: 50 },
    };
    render(<ReflexionEscritaActivity actividad={a} />);
    expect(screen.queryByText('Ver instrucciones completas')).toBeNull();
    expect(screen.getByText('3–50 palabras')).toBeInTheDocument();
  });

  test('consigna larga: se ve el arranque y el resto se pliega', () => {
    const largo = `Primera parte de la consigna con el contexto del semestre.\n\nINSTRUCCIONES\n\n${'Detalle extenso del producto integrador. '.repeat(40)}\n- Punto uno\n- Punto dos`;
    const a: ActividadReflexionEscrita = {
      tipo: 'reflexion_escrita',
      titulo: 'Integrador',
      contenido: { prompt: largo, longitud_minima_palabras: 3 },
    };
    render(<ReflexionEscritaActivity actividad={a} />);
    expect(screen.getByText('Ver instrucciones completas')).toBeInTheDocument();
    expect(screen.getByText('Punto uno').tagName).toBe('LI');
  });

  test('entrega el mismo payload', async () => {
    const onProgreso = jest.fn().mockResolvedValue({ ok: true });
    const a: ActividadReflexionEscrita = {
      id: 'rf-1',
      tipo: 'reflexion_escrita',
      titulo: 'Reflexión',
      contenido: { prompt: '¿Qué aprendiste hoy?', longitud_minima_palabras: 3 },
    };
    render(<ReflexionEscritaActivity actividad={a} onProgreso={onProgreso} />);
    expect(screen.getByRole('button', { name: 'Faltan 3 palabras' })).toBeDisabled();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'uno dos tres' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Entregar reflexión/ }));
    });
    expect(onProgreso).toHaveBeenCalledWith({
      actividadId: 'rf-1', completada: true, puntaje: 100, respuestas: { texto: 'uno dos tres' },
    });
  });
});

// ── Autoevaluación ────────────────────────────────────────────────────────────

const escala = [
  { valor: 1, etiqueta: 'En inicio', descripcion: 'Necesito apoyo.' },
  { valor: 2, etiqueta: 'En proceso' },
  { valor: 3, etiqueta: 'Logrado' },
  { valor: 4, etiqueta: 'Destacado' },
];
const auto: ActividadAutoevaluacion = {
  id: 'ae-1',
  tipo: 'autoevaluacion',
  titulo: 'Autoevaluación',
  contenido: {
    instrucciones: 'Marca tu nivel honesto en cada criterio.',
    criterios: [
      { descripcion: 'Distingo hardware de software.', escala },
      { descripcion: 'Explico la evolución digital.', escala },
    ],
    reflexion_final_prompt: '¿Qué mejorarías?',
  },
};

describe('AutoevaluacionActivity — un criterio a la vez', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test('avanza criterio por criterio, resume y entrega el mismo puntaje', () => {
    const onProgreso = jest.fn();
    render(<AutoevaluacionActivity actividad={auto} onProgreso={onProgreso} />);

    expect(screen.getByText('Criterio 1 de 2')).toBeInTheDocument();
    expect(screen.getByText('Distingo hardware de software.')).toBeInTheDocument();
    expect(screen.queryByText('Explico la evolución digital.')).toBeNull();

    fireEvent.click(screen.getByRole('radio', { name: /Logrado/ }));
    act(() => { jest.advanceTimersByTime(500); });
    expect(screen.getByText('Criterio 2 de 2')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('radio', { name: /Destacado/ }));
    act(() => { jest.advanceTimersByTime(500); });

    // Resumen antes de entregar
    expect(screen.getByText('Revisa antes de entregar')).toBeInTheDocument();
    expect(screen.getByText('Logrado')).toBeInTheDocument();
    expect(screen.getByText('Destacado')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('¿Qué mejorarías?'), { target: { value: 'Practicar más' } });
    fireEvent.click(screen.getByRole('button', { name: /Entregar autoevaluación/ }));

    expect(onProgreso).toHaveBeenCalledWith({
      actividadId: 'ae-1',
      completada: true,
      puntaje: Math.round((7 / 8) * 100),
      respuestas: { criterios: { 0: 3, 1: 4 }, reflexion: 'Practicar más' },
    });
    expect(screen.getByText('Autoevaluación entregada')).toBeInTheDocument();
  });

  test('«Cambiar» desde el resumen regresa al criterio y vuelve al resumen', () => {
    render(<AutoevaluacionActivity actividad={auto} />);
    fireEvent.click(screen.getByRole('radio', { name: /En inicio/ }));
    act(() => { jest.advanceTimersByTime(500); });
    fireEvent.click(screen.getByRole('radio', { name: /En proceso/ }));
    act(() => { jest.advanceTimersByTime(500); });

    fireEvent.click(screen.getByRole('button', { name: 'Cambiar criterio 1' }));
    expect(screen.getByText('Criterio 1 de 2')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: /Destacado/ }));
    fireEvent.click(screen.getByRole('button', { name: /Volver al resumen/ }));
    expect(screen.getByText('Revisa antes de entregar')).toBeInTheDocument();
    expect(screen.getByText('Destacado')).toBeInTheDocument();
  });
});
