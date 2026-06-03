'use client';

import React from 'react';

const TESTIMONIOS = [
  {
    nombre: 'Verónica Salinas',
    avatar: 'VS',
    color: '#1E40AF',
    quote: 'CEN nos permitió alinear todas las materias sin depender de hojas de cálculo. El seguimiento por progresión es espectacular y exacto.',
  },
  {
    nombre: 'Alejandro Mendoza',
    avatar: 'AM',
    color: '#0F766E',
    quote: 'Ver en qué momento exacto se atasca cada alumno cambió mi forma de dar clase. Ya no tengo que esperar a los exámenes para ayudarlos.',
  },
  {
    nombre: 'Patricia Guerrero',
    avatar: 'PG',
    color: '#7C3AED',
    quote: 'El panel de seguimiento en vivo eliminó horas de captura manual. Ahora solo me enfoco en lo que importa: dar una mejor clase.',
  },
  {
    nombre: 'Roberto Cavazos',
    avatar: 'RC',
    color: '#B45309',
    quote: 'La velocidad de la plataforma es increíble, incluso con el internet inestable de la escuela. Mis alumnos entran desde el celular sin ningún problema.',
  },
  {
    nombre: 'Mariana Robles',
    avatar: 'MR',
    color: '#BE185D',
    quote: 'Tener simuladores interactivos de ciencia directamente integrados en el currículo ha hecho que las clases de biología sean las favoritas.',
  },
  {
    nombre: 'Carlos Echeverría',
    avatar: 'CE',
    color: '#0369A1',
    quote: 'La automatización de las evaluaciones formativas nos salvó la vida. Todo está alineado a la Nueva Escuela Mexicana sin esfuerzo.',
  },
  {
    nombre: 'Lucía Fernández',
    avatar: 'LF',
    color: '#6D28D9',
    quote: 'El nivel de diseño y usabilidad es de primer mundo. Por fin usamos software educativo que no parece hecho hace 20 años.',
  },
  {
    nombre: 'Héctor Salgado',
    avatar: 'HS',
    color: '#15803D',
    quote: 'El reporte en tiempo real para coordinación es magia pura. Sé exactamente qué grupo necesita ayuda antes de que termine el mes.',
  },
];

/* Card navy sobre fondo claro — contraste garantizado sin depender de CSS heredado */
function TestCard({ t }: { t: typeof TESTIMONIOS[number] }) {
  return (
    <div className="tcv-card">
      <span className="tcv-bigquote" aria-hidden="true">❝</span>
      <p className="tcv-text">{t.quote}</p>
      <div className="tcv-author">
        <div className="tcv-avatar" style={{ background: t.color }}>{t.avatar}</div>
        <span className="tcv-name">{t.nombre}</span>
      </div>
    </div>
  );
}

export function TestimoniosSection() {
  const fwd = [...TESTIMONIOS, ...TESTIMONIOS];
  const rev = [...TESTIMONIOS.slice().reverse(), ...TESTIMONIOS.slice().reverse()];

  return (
    /* Fondo claro + clases propias — sin depender de .testimonios-section y sus 5 overrides */
    <section className="tcv-section">
      <div className="tcv-header">
        <span className="tcv-bigquote-deco" aria-hidden="true">❝</span>
        <h2 className="tcv-title">
          Lo que dicen los <em>docentes</em>
        </h2>
        <p className="tcv-sub">
          Más de 127 docentes activos en todo México ya usan CEN en su plantel.
        </p>
      </div>

      {/* Fila 1 — izquierda */}
      <div className="tcv-mq-wrap">
        <div className="tcv-mq-track tcv-mq-fwd">
          {fwd.map((t, i) => <TestCard key={i} t={t} />)}
        </div>
      </div>

      {/* Fila 2 — derecha */}
      <div className="tcv-mq-wrap">
        <div className="tcv-mq-track tcv-mq-rev">
          {rev.map((t, i) => <TestCard key={i} t={t} />)}
        </div>
      </div>
    </section>
  );
}
