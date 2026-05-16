import { validarContenidoActividad } from '../validators';

describe('validarContenidoActividad', () => {
  // ── lectura ──────────────────────────────────────────────────────────────────
  it('valida lectura válida', () => {
    const res = validarContenidoActividad('lectura', {
      texto: 'A'.repeat(50),
    });
    expect(res.success).toBe(true);
  });

  it('rechaza lectura con texto corto', () => {
    const res = validarContenidoActividad('lectura', { texto: 'corto' });
    expect(res.success).toBe(false);
  });

  // ── quiz_multiple_opcion ─────────────────────────────────────────────────────
  it('valida quiz opción múltiple válido', () => {
    const res = validarContenidoActividad('quiz_multiple_opcion', {
      preguntas: [{
        enunciado: '¿Cuál es la capital?',
        opciones: ['Madrid', 'Barcelona', 'Valencia'],
        respuesta_correcta: 0,
      }],
    });
    expect(res.success).toBe(true);
  });

  it('rechaza quiz con respuesta_correcta fuera de rango', () => {
    const res = validarContenidoActividad('quiz_multiple_opcion', {
      preguntas: [{
        enunciado: '¿Pregunta?',
        opciones: ['A', 'B'],
        respuesta_correcta: 5,
      }],
    });
    expect(res.success).toBe(false);
  });

  // ── quiz_verdadero_falso ─────────────────────────────────────────────────────
  it('valida quiz verdadero/falso válido', () => {
    const res = validarContenidoActividad('quiz_verdadero_falso', {
      preguntas: [{ enunciado: 'El agua es H2O.', respuesta: true }],
    });
    expect(res.success).toBe(true);
  });

  // ── fill_blanks ──────────────────────────────────────────────────────────────
  it('valida fill_blanks válido', () => {
    const res = validarContenidoActividad('fill_blanks', {
      texto_con_huecos: 'El ___ es azul.',
      huecos: [{ posicion: 0, respuesta_correcta: 'cielo' }],
    });
    expect(res.success).toBe(true);
  });

  it('rechaza fill_blanks con menos ___ que huecos', () => {
    const res = validarContenidoActividad('fill_blanks', {
      texto_con_huecos: 'Sin huecos aquí.',
      huecos: [{ posicion: 0, respuesta_correcta: 'algo' }],
    });
    expect(res.success).toBe(false);
  });

  // ── ejercicio_matematico ─────────────────────────────────────────────────────
  it('valida ejercicio matemático válido', () => {
    const res = validarContenidoActividad('ejercicio_matematico', {
      problema: '¿Cuánto es 2 + 2?',
      tipo_respuesta: 'numerica',
    });
    expect(res.success).toBe(true);
  });

  // ── reflexion_escrita ────────────────────────────────────────────────────────
  it('valida reflexión escrita válida', () => {
    const res = validarContenidoActividad('reflexion_escrita', {
      prompt: '¿Qué aprendiste hoy en clase?',
    });
    expect(res.success).toBe(true);
  });

  it('rechaza reflexión con max < min palabras', () => {
    const res = validarContenidoActividad('reflexion_escrita', {
      prompt: '¿Reflexiona sobre esto?',
      longitud_minima_palabras: 100,
      longitud_maxima_palabras: 50,
    });
    expect(res.success).toBe(false);
  });

  // ── video_con_preguntas ──────────────────────────────────────────────────────
  it('valida video con preguntas válido', () => {
    const res = validarContenidoActividad('video_con_preguntas', {
      url_video: 'https://www.youtube.com/embed/abc123',
      titulo_video: 'Introducción al tema',
    });
    expect(res.success).toBe(true);
  });

  // ── infografia ───────────────────────────────────────────────────────────────
  it('valida infografía válida', () => {
    const res = validarContenidoActividad('infografia', {
      titulo: 'El ciclo del agua',
      url_imagen: '/img/ciclo-agua.png',
    });
    expect(res.success).toBe(true);
  });

  // ── debate_estructurado ──────────────────────────────────────────────────────
  it('valida debate estructurado válido', () => {
    const res = validarContenidoActividad('debate_estructurado', {
      tema: '¿Deben prohibirse las redes sociales en la escuela?',
      posturas: ['A favor', 'En contra'],
    });
    expect(res.success).toBe(true);
  });

  it('rechaza debate con menos de 2 posturas', () => {
    const res = validarContenidoActividad('debate_estructurado', {
      tema: 'Tema válido de debate',
      posturas: ['Solo una postura'],
    });
    expect(res.success).toBe(false);
  });

  // ── simulacion ───────────────────────────────────────────────────────────────
  it('valida simulación válida', () => {
    const res = validarContenidoActividad('simulacion', {
      tipo_simulacion: 'laboratorio',
      descripcion: 'Simulación del péndulo simple.',
    });
    expect(res.success).toBe(true);
  });

  // ── glosario_interactivo ─────────────────────────────────────────────────────
  it('valida glosario interactivo válido', () => {
    const res = validarContenidoActividad('glosario_interactivo', {
      terminos: [
        { termino: 'Ecosistema', definicion: 'Sistema formado por seres vivos y su entorno.' },
        { termino: 'Bioma', definicion: 'Región con características climáticas similares.' },
        { termino: 'Biodiversidad', definicion: 'Variedad de seres vivos en un área.' },
      ],
    });
    expect(res.success).toBe(true);
  });

  it('rechaza glosario con menos de 3 términos', () => {
    const res = validarContenidoActividad('glosario_interactivo', {
      terminos: [
        { termino: 'Uno', definicion: 'Primera definición.' },
        { termino: 'Dos', definicion: 'Segunda definición.' },
      ],
    });
    expect(res.success).toBe(false);
  });

  // ── autoevaluacion ───────────────────────────────────────────────────────────
  it('valida autoevaluación válida', () => {
    const res = validarContenidoActividad('autoevaluacion', {
      criterios: [{
        descripcion: 'Participo activamente en clase',
        escala: [
          { valor: 1, etiqueta: 'Nunca' },
          { valor: 2, etiqueta: 'A veces' },
          { valor: 3, etiqueta: 'Siempre' },
        ],
      }],
    });
    expect(res.success).toBe(true);
  });

  it('rechaza autoevaluación sin criterios', () => {
    const res = validarContenidoActividad('autoevaluacion', { criterios: [] });
    expect(res.success).toBe(false);
  });

  // ── tipo desconocido ─────────────────────────────────────────────────────────
  it('retorna error para tipo desconocido', () => {
    const res = validarContenidoActividad('tipo_inexistente' as never, {});
    expect(res.success).toBe(false);
  });
});
