'use client';

import { useState } from 'react';

interface Materia {
  id: string;
  codigo: string;
  nombreCorto: string;
  nombreCompleto: string;
  icon: string;
  hex: string;
  rgba: string;
  descripcion: string;
}

interface PlataformaMosaico {
  id: string;
  nombreCorto: string;
  pillIcon: string;
  sub: string;
  tag: string;
  columnas: number;
  materias: Materia[];
}

// El tile del mosaico es un rombo (diamante, puntas arriba/abajo — ver
// clip-path de .rombo-tile). Los rombos tapizan sin huecos si se apilan en
// COLUMNAS: dos rombos uno sobre otro se tocan punta con punta, y una
// columna vecina desplazada 0.5·ancho y 0.5·alto encaja su rombo justo en
// el hueco romboidal que dejan (ver .rombo-col en LandingCEN.css).
// `columnas` reparte `total` lo más parejo posible entre ese número fijo
// de columnas.
function repartirEnColumnas(total: number, columnas: number): number[] {
  const base = Math.floor(total / columnas);
  const extra = total % columnas;
  return Array.from({ length: columnas }, (_, i) => base + (i < extra ? 1 : 0));
}

// Con 32-40 materias el rombo base (pensado para 8) se ve enorme — esta
// clase de densidad lo achica en CSS (.rombo-grid--md/--sm/--xs).
function densidadClase(total: number): string {
  if (total >= 35) return ' rombo-grid--xs';
  if (total >= 28) return ' rombo-grid--sm';
  if (total >= 16) return ' rombo-grid--md';
  return '';
}

type Fila = readonly [string, string, string, string?];

function tilesDeGrupo(grupo: { hex: string; rgba: string; icon: string }, idPrefix: string, filas: readonly Fila[]): Materia[] {
  return filas.map((fila, i) => ({
    id: `${idPrefix}-${i + 1}`,
    codigo: fila[0],
    nombreCorto: fila[1],
    nombreCompleto: fila[3] ?? fila[1],
    icon: grupo.icon,
    hex: grupo.hex,
    rgba: grupo.rgba,
    descripcion: fila[2],
  }));
}

// ── CEN Bachillerato — las 8 áreas de conocimiento del MCCEMS, desglosadas
// en sus 32 unidades curriculares reales (codigo + temaOficial verbatim de
// src/lib/mccems/contenido-2025.ts). Mismos colores e íconos por área que
// hub-colors.ts (RSC_COLORS). ────────────────────────────────────────────
const AREAS_BACHILLERATO = [
  { area: 'LC', hex: '#38BDF8', rgba: '56,189,248', icon: 'fa-book-open', nombreCompleto: 'Lengua y Comunicación', unidades: [
    ['I', 'Leer y Escribirnos', 'Leer y escribir para pensarnos juntos'],
    ['II', 'Imaginar y Comunicar', 'Libertad para imaginar, poder para comunicar'],
    ['III', 'Culturas y Palabras', 'Describir culturas, apropiarse de las palabras'],
  ] },
  { area: 'PM', hex: '#FB923C', rgba: '251,146,60', icon: 'fa-square-root-variable', nombreCompleto: 'Pensamiento Matemático', unidades: [
    ['I', 'Aritmética', 'Pensamiento aritmético'],
    ['II', 'Álgebra Inicial', 'Introducción al álgebra'],
    ['III', 'Álgebra y Geometría', 'Pensamiento algebraico e introducción a geometría plana'],
    ['IV', 'Trigonometría', 'Trigonometría y geometría analítica'],
    ['V', 'Cálculo Diferencial', 'Cálculo diferencial'],
    ['VI', 'Estadística y Probabilidad', 'Pensamiento estadístico y probabilístico'],
  ] },
  { area: 'IN', hex: '#A78BFA', rgba: '167,139,250', icon: 'fa-globe', nombreCompleto: 'Inglés', unidades: [
    ['I', 'To Be or Not to Be', 'To be, or not to be, that is the question'],
    ['II', 'Favorite Things', 'These are a few of my favorite things'],
    ['III', 'What We Were', 'What we were, we share'],
    ['IV', 'Stay or Go?', 'Should I stay or should I go?'],
    ['V', 'We Are the Champions', 'We are the champions'],
  ] },
  { area: 'CD', hex: '#34D399', rgba: '52,211,153', icon: 'fa-microchip', nombreCompleto: 'Cultura Digital', unidades: [
    ['I', 'Ciudadanía Digital', 'Ciudadanía digital'],
    ['II', 'Aprendizaje Colaborativo', 'Aprendizaje individual y colaborativo'],
    ['III', 'Uso del Conocimiento', 'Uso y difusión del conocimiento'],
  ] },
  { area: 'CH', hex: '#D97706', rgba: '217,119,6', icon: 'fa-landmark', nombreCompleto: 'Conciencia Histórica', unidades: [
    ['I', 'Coordenadas de la Historia', 'Coordenadas de la Historia'],
    ['II', 'Experiencia Histórica', 'La experiencia histórica'],
    ['III', 'Investigar el Tiempo', 'Navegar en el tiempo: investigaciones históricas'],
  ] },
  { area: 'CS', hex: '#FBBF24', rgba: '251,191,36', icon: 'fa-building-columns', nombreCompleto: 'Ciencias Sociales', unidades: [
    ['I', 'Estado y Poder', 'Estado, ciudadanía y relaciones de poder'],
    ['II', 'Relaciones Sociales', 'Organización, relaciones sociales y económicas'],
    ['III', 'Realidad Estudiantil', 'Las dinámicas de la realidad actual: la condición estudiantil al centro'],
  ] },
  { area: 'PFH', hex: '#F87171', rgba: '248,113,113', icon: 'fa-scale-balanced', nombreCompleto: 'Pensamiento Filosófico y Humanidades', unidades: [
    ['I', 'Filosofar y Humanismo', 'El ejercicio de filosofar y la perspectiva humanista'],
    ['II', 'Filosofía del Conocer', 'Las reflexiones filosóficas sobre el Conocer'],
    ['III', 'Filosofía del Hacer', 'Las reflexiones filosóficas sobre el Hacer'],
  ] },
  { area: 'CNEYT', hex: '#22D3EE', rgba: '34,211,238', icon: 'fa-microscope', nombreCompleto: 'Ciencias Naturales, Experimentales y Tecnología', unidades: [
    ['I', 'Naturaleza de la Materia', 'Invitación a la ciencia. Naturaleza de la materia'],
    ['II', 'Poder de la Energía', 'El poder de la energía'],
    ['III', 'Sistema Terrestre', 'Nuestro hogar. El sistema terrestre'],
    ['IV', 'Poder de la Química', 'El poder de la química'],
    ['V', 'Átomo y Universo', 'Del átomo al universo. Fuerza y energía'],
    ['VI', 'Vida y Evolución', '¿Qué es la vida? Evolución y diversidad biológica'],
  ] },
] as const;

const MATERIAS_BACHILLERATO: Materia[] = AREAS_BACHILLERATO.flatMap(a =>
  a.unidades.map(([roman, corto, tema]) => ({
    id: `${a.area}-${roman}`.toLowerCase(),
    codigo: `${a.area}-${roman}`,
    nombreCorto: corto,
    nombreCompleto: `${a.nombreCompleto} · Unidad ${roman}`,
    icon: a.icon,
    hex: a.hex,
    rgba: a.rgba,
    descripcion: tema,
  }))
);

// ── Educación básica (Preescolar/Primaria/Secundaria) — los mismos 4 campos
// formativos de la Nueva Escuela Mexicana 2022, desglosados en sus
// contenidos/disciplinas reales por nivel (verbatim de supabase/seeds/
// fase-2-preescolar.sql, fase-3/4/5-primaria*.sql y fase-6-secundaria.sql
// del proyecto nem-plataforma). Colores e íconos por campo tomados del mismo
// catálogo (supabase/migrations/02_curriculo.sql). ────────────────────────
const CAMPOS_BASE = [
  { id: 'len', hex: '#2563EB', rgba: '37,99,235', icon: 'fa-book-open-reader', nombreCompleto: 'Lenguajes', nombreCorto: 'Lenguajes' },
  { id: 'spc', hex: '#16A34A', rgba: '22,163,74', icon: 'fa-flask', nombreCompleto: 'Saberes y Pensamiento Científico', nombreCorto: 'C. Científico' },
  { id: 'ens', hex: '#D97706', rgba: '217,119,6', icon: 'fa-earth-americas', nombreCompleto: 'Ética, Naturaleza y Sociedades', nombreCorto: 'Sociedades' },
  { id: 'hc', hex: '#7C3AED', rgba: '124,58,237', icon: 'fa-hand-holding-heart', nombreCompleto: 'De lo Humano y lo Comunitario', nombreCorto: 'Lo Humano' },
] as const;

const MATERIAS_PREESCOLAR: Materia[] = [
  ...tilesDeGrupo(CAMPOS_BASE[0], 'preescolar-len', [
    ['LEN-F2-01', 'Comunicación Oral', 'Comunicación oral de necesidades, emociones, gustos, ideas y saberes, a través de los diversos lenguajes, desde una perspectiva comunitaria.'],
    ['LEN-F2-02', 'Narración de Historias', 'Narración de historias mediante diversos lenguajes, en un ambiente donde niñas y niños participen y se apropien de la cultura, a través de diferentes textos.'],
    ['LEN-F2-03', 'Juegos del Lenguaje', 'Recursos y juegos del lenguaje que fortalecen la diversidad de formas de expresión oral, y que rescatan la o las lenguas de la comunidad y de otros lugares.'],
    ['LEN-F2-04', 'Diversidad Lingüística', 'Reconocimiento y aprecio de la diversidad lingüística, al identificar las formas en que se comunican las distintas personas de la comunidad.'],
    ['LEN-F2-05', 'Representación Gráfica', 'Representación gráfica de ideas y descubrimientos, al explorar los diversos textos que hay en su comunidad y otros lugares.'],
    ['LEN-F2-06', 'Expresión Gráfica', 'Expresión de emociones y experiencias, en igualdad de oportunidades, apoyándose de recursos gráficos personales y de los lenguajes artísticos.'],
    ['LEN-F2-07', 'Producciones Gráficas', 'Producciones gráficas dirigidas a diversas destinatarias y diversos destinatarios, para establecer vínculos sociales y acercarse a la cultura escrita.'],
    ['LEN-F2-08', 'Cultura y Naturaleza', 'Reconocimiento de ideas o emociones en la interacción con manifestaciones culturales y artísticas y con la naturaleza, a través de diversos lenguajes.'],
    ['LEN-F2-09', 'Lenguajes Artísticos', 'Producción de expresiones creativas con los distintos elementos de los lenguajes artísticos.'],
  ]),
  ...tilesDeGrupo(CAMPOS_BASE[1], 'preescolar-spc', [
    ['SPC-F2-01', 'Diversidad Natural', 'Exploración de la diversidad natural que existe en la comunidad y en otros lugares.'],
    ['SPC-F2-02', 'Saberes Comunitarios', 'Saberes familiares y comunitarios que resuelven situaciones y necesidades en el hogar y la comunidad.'],
    ['SPC-F2-03', 'Seres Vivos', 'Los seres vivos: elementos, procesos y fenómenos naturales que ofrecen oportunidades para entender y explicar hechos cotidianos, desde distintas perspectivas.'],
    ['SPC-F2-04', 'Saberes Numéricos', 'Los saberes numéricos como herramienta para resolver situaciones del entorno, en diversos contextos socioculturales.'],
    ['SPC-F2-05', 'Espacio y Formas', 'El dominio del espacio y reconocimiento de formas en el entorno desde diversos puntos de observación y mediante desplazamientos o recorridos.'],
    ['SPC-F2-06', 'Magnitudes y Medición', 'Las magnitudes de longitud, peso, capacidad y tiempo en situaciones cotidianas del hogar y del entorno sociocultural.'],
    ['SPC-F2-07', 'Clasificación', 'Clasificación y experimentación con objetos y elementos del entorno que reflejan la diversidad de la comunidad o región.'],
    ['SPC-F2-08', 'Materiales del Entorno', 'Características de objetos y comportamiento de los materiales del entorno sociocultural.'],
    ['SPC-F2-09', 'Artefactos Tecnológicos', 'Objetos y artefactos tecnológicos que mejoran y facilitan la vida familiar y de la comunidad.'],
  ]),
  ...tilesDeGrupo(CAMPOS_BASE[2], 'preescolar-ens', [
    ['ENS-F2-01', 'Cuidado de la Naturaleza', 'Interacción, cuidado, conservación y regeneración de la naturaleza, que favorece la construcción de una conciencia socioambiental.'],
    ['ENS-F2-02', 'Necesidades Básicas', 'Transformación responsable del entorno al satisfacer necesidades básicas de alimentación, vestido y vivienda.'],
    ['ENS-F2-03', 'Identidad y Patrimonio', 'Construcción de la identidad y pertenencia a una comunidad y país a partir del conocimiento de su historia, sus celebraciones, conmemoraciones tradicionales y obras del patrimonio artístico y cultural.'],
    ['ENS-F2-04', 'Cambios en el Tiempo', 'Cambios que ocurren en los lugares, entornos, objetos, costumbres y formas de vida de las distintas familias y comunidades con el paso del tiempo.'],
    ['ENS-F2-05', 'Bien Común', 'Labores y servicios que contribuyen al bien común de las distintas familias y comunidades.'],
    ['ENS-F2-06', 'Derechos de la Niñez', 'Los derechos de niñas y niños como base para el bienestar integral y el establecimiento de acuerdos que favorecen la convivencia pacífica.'],
    ['ENS-F2-07', 'Diversidad Familiar', 'La diversidad de personas y familias en la comunidad y su convivencia, en un ambiente de equidad, libertad, inclusión y respeto a los derechos humanos.'],
    ['ENS-F2-08', 'Cultura de Paz', 'La cultura de paz como una forma de relacionarse con otras personas para promover la inclusión y el respeto a la diversidad.'],
  ]),
  ...tilesDeGrupo(CAMPOS_BASE[3], 'preescolar-hc', [
    ['HC-F2-01', 'Identidad Personal', 'Construcción de la identidad personal a partir de su pertenencia a un territorio, su origen étnico, cultural y lingüístico, y la interacción con personas cercanas.'],
    ['HC-F2-02', 'Habilidades Motrices', 'Posibilidades de movimiento en diferentes espacios, para favorecer las habilidades motrices.'],
    ['HC-F2-03', 'Coordinación Motriz', 'Precisión y coordinación en los movimientos al usar objetos, herramientas y materiales, de acuerdo con sus condiciones, capacidades y características.'],
    ['HC-F2-04', 'Educación Emocional', 'Las emociones en la interacción con diversas personas y situaciones.'],
    ['HC-F2-05', 'Relaciones Positivas', 'Interacción con personas de diversos contextos, que contribuyan al establecimiento de relaciones positivas y a una convivencia basada en la aceptación de la diversidad.'],
    ['HC-F2-06', 'Cuidado de la Salud', 'Cuidado de la salud personal y colectiva, al llevar a cabo acciones de higiene, limpieza, y actividad física, desde los saberes prácticos de la comunidad y la información científica.'],
    ['HC-F2-07', 'Alimentación Saludable', 'Consumo de alimentos y bebidas que benefician la salud, de acuerdo con los contextos socioculturales.'],
    ['HC-F2-08', 'Prevención de Riesgos', 'Medidas de prevención de accidentes y situaciones de riesgo de acuerdo con el contexto, para el cuidado de la integridad personal y colectiva.'],
  ]),
];

const FASES_PRIMARIA = [
  { fase: 3, grados: '1.º y 2.º', conteos: { len: 26, spc: 16, ens: 18, hc: 20 } },
  { fase: 4, grados: '3.º y 4.º', conteos: { len: 25, spc: 19, ens: 18, hc: 20 } },
  { fase: 5, grados: '5.º y 6.º', conteos: { len: 24, spc: 23, ens: 21, hc: 17 } },
] as const;

const MATERIAS_PRIMARIA: Materia[] = CAMPOS_BASE.flatMap(campo =>
  FASES_PRIMARIA.map(f => {
    const n = f.conteos[campo.id];
    return {
      id: `primaria-${campo.id}-f${f.fase}`,
      codigo: `${campo.id.toUpperCase()}-F${f.fase}`,
      nombreCorto: `${campo.nombreCorto} ${f.grados}`,
      nombreCompleto: `${campo.nombreCompleto} · Fase ${f.fase} (${f.grados} de primaria)`,
      icon: campo.icon,
      hex: campo.hex,
      rgba: campo.rgba,
      descripcion: `${n} contenidos oficiales del campo "${campo.nombreCompleto}" para ${f.grados} de primaria (Fase ${f.fase}).`,
    };
  })
);

const MATERIAS_SECUNDARIA: Materia[] = [
  ...tilesDeGrupo(CAMPOS_BASE[0], 'secundaria-len', [
    ['LEN-F6-ESP', 'Español', '14 contenidos oficiales de Lengua Materna. Español en secundaria.', 'Lengua Materna. Español'],
    ['LEN-F6-LIM', 'Lengua Indígena', '14 contenidos oficiales de Lengua Indígena Materna en secundaria.', 'Lengua Indígena Materna'],
    ['LEN-F6-LI2', 'Ind. 2ª Lengua', '13 contenidos oficiales de Lengua Indígena como Segunda Lengua en secundaria.', 'Lengua Indígena como Segunda Lengua'],
    ['LEN-F6-ING', 'Inglés', '14 contenidos oficiales de Lengua Extranjera. Inglés en secundaria.', 'Lengua Extranjera. Inglés'],
    ['LEN-F6-ART', 'Artes', '14 contenidos oficiales de Artes en secundaria.', 'Artes'],
  ]),
  ...tilesDeGrupo(CAMPOS_BASE[1], 'secundaria-spc', [
    ['SPC-F6-MAT', 'Matemáticas', '14 contenidos oficiales de Matemáticas en secundaria.', 'Matemáticas'],
    ['SPC-F6-BIO', 'Biología', '9 contenidos oficiales de Biología en secundaria.', 'Biología'],
    ['SPC-F6-FIS', 'Física', '10 contenidos oficiales de Física en secundaria.', 'Física'],
    ['SPC-F6-QUI', 'Química', '12 contenidos oficiales de Química en secundaria.', 'Química'],
  ]),
  ...tilesDeGrupo(CAMPOS_BASE[2], 'secundaria-ens', [
    ['ENS-F6-GEO', 'Geografía', '14 contenidos oficiales de Geografía en secundaria.', 'Geografía'],
    ['ENS-F6-HIS', 'Historia', '12 contenidos oficiales de Historia en secundaria.', 'Historia'],
    ['ENS-F6-FCE', 'Cívica y Ética', '16 contenidos oficiales de Formación Cívica y Ética en secundaria.', 'Formación Cívica y Ética'],
  ]),
  ...tilesDeGrupo(CAMPOS_BASE[3], 'secundaria-hc', [
    ['HC-F6-TEC', 'Tecnología', '8 contenidos oficiales de Tecnología en secundaria.', 'Tecnología'],
    ['HC-F6-ESO', 'Soc. y Emocional', '5 contenidos oficiales de Educación Socioemocional en secundaria.', 'Educación Socioemocional'],
    ['HC-F6-EFI', 'Ed. Física', '5 contenidos oficiales de Educación Física en secundaria.', 'Educación Física'],
  ]),
];

// ── CEN Labs — las 4 ciencias experimentales, desglosadas en sus 40
// simuladores reales (título + ecuación verbatim de src/data/simuladoresData.ts
// del proyecto CEN-LABS). Colores tomados del mismo catálogo (LABS_REAL). ──
const AREAS_LABS = [
  { id: 'quimica', hex: '#219EBC', rgba: '33,158,188', icon: 'fa-flask-vial' },
  { id: 'fisica', hex: '#FB8500', rgba: '251,133,0', icon: 'fa-bolt' },
  { id: 'matematicas', hex: '#FFB703', rgba: '255,183,3', icon: 'fa-calculator' },
  { id: 'biologia', hex: '#8ECAE6', rgba: '142,202,230', icon: 'fa-microscope' },
] as const;

const MATERIAS_LABS: Materia[] = [
  ...tilesDeGrupo(AREAS_LABS[0], 'labs-qui', [
    ['LABS-QUI-01', 'Construcción Atómica', 'Estructura atómica del Carbono-14 a partir del número atómico y másico: A = Z + N.'],
    ['LABS-QUI-02', 'Leyes de los Gases', 'Ley de Gay-Lussac aplicada a un sistema cerrado: P = T / (30 · V).'],
    ['LABS-QUI-03', 'Estequiometría', 'Ley de conservación de la masa de Lavoisier: Σm(Reactivos) = Σm(Productos).'],
    ['LABS-QUI-04', 'Reactivo Limitante', 'Síntesis de amoniaco y cálculo del reactivo limitante: N₂ + 3H₂ → 2NH₃.'],
    ['LABS-QUI-05', 'Molaridad', 'Cálculo de molaridad al preparar una disolución de NaCl: M = n / V(L).'],
    ['LABS-QUI-06', 'Solubilidad', 'Curva de solubilidad del KNO₃ en función de la temperatura: S(T) = f(T²).'],
    ['LABS-QUI-07', 'Titulación Ácido-Base', 'Neutralización de HCl con NaOH mediante titulación: Ca·Va = Cb·Vb.'],
    ['LABS-QUI-08', 'Equilibrio Químico', 'Principio de Le Châtelier sobre el equilibrio N₂O₄ + Calor ⇌ 2NO₂.'],
    ['LABS-QUI-09', 'Celdas Galvánicas', 'Potencial de una celda galvánica: E°celda = E°cátodo − E°ánodo.'],
    ['LABS-QUI-10', 'Destilación', 'Separación de etanol por diferencia de punto de ebullición: ΔT = Teb(B) − Teb(A).'],
  ]),
  ...tilesDeGrupo(AREAS_LABS[1], 'labs-fis', [
    ['LABS-FIS-01', 'Tiro Parabólico', 'Trayectoria de un proyectil: y = x·tan(θ) − (g·x²)/(2·v₀²·cos²θ).'],
    ['LABS-FIS-02', 'Leyes de Newton', 'Segunda ley de Newton sobre un plano inclinado: F neta = m·a.'],
    ['LABS-FIS-03', 'Péndulo Simple', 'Periodo de un péndulo simple: T = 2π·√(L/g).'],
    ['LABS-FIS-04', 'Suspensión Rover', 'Ley de Hooke aplicada a la suspensión de un rover: F = −k·x.'],
    ['LABS-FIS-05', 'Sistemas Hidráulicos', 'Principio de Pascal en un sistema hidráulico: F₁/A₁ = F₂/A₂.'],
    ['LABS-FIS-06', 'Empuje Estático', 'Principio de Arquímedes: E = ρ_fluido·g·V_sumergido.'],
    ['LABS-FIS-07', 'Dilatación Térmica', 'Dilatación lineal de materiales: ΔL = L₀·α·ΔT.'],
    ['LABS-FIS-08', 'Ley de Ohm', 'Ley de Ohm en un circuito eléctrico: V = I·R.'],
    ['LABS-FIS-09', 'Electrostática', 'Ley de Coulomb entre dos cargas: F = k·|q₁q₂|/r².'],
    ['LABS-FIS-10', 'Motor Eléctrico', 'Torque de un motor eléctrico: τ = N·I·A·B·sen(φ).'],
  ]),
  ...tilesDeGrupo(AREAS_LABS[2], 'labs-mat', [
    ['LABS-MAT-01', 'Cuadráticas', 'Análisis de la función cuadrática: f(x) = ax² + bx + c.'],
    ['LABS-MAT-02', 'Triangulación', 'Resolución de un sistema de ecuaciones lineales 2×2: y = mx + b.'],
    ['LABS-MAT-03', 'Escala Richter', 'Energía liberada según la escala de Richter: E = 10^(1.5·ΔM).'],
    ['LABS-MAT-04', 'Pitágoras', 'Aplicación del teorema de Pitágoras: a² + b² = c².'],
    ['LABS-MAT-05', 'Círculo Trigonométrico', 'Funciones seno y coseno en el círculo unitario: y = sen(θ), x = cos(θ).'],
    ['LABS-MAT-06', 'Transformaciones', "Transformaciones lineales sobre un vector: V' = M·V + T."],
    ['LABS-MAT-07', 'Ley de Snell', 'Refracción de la luz entre dos medios: n₁·sen(θ₁) = n₂·sen(θ₂).'],
    ['LABS-MAT-08', 'La Derivada', "Definición de la derivada por el límite: f'(x) = lim(h→0) [f(x+h) − f(x)] / h."],
    ['LABS-MAT-09', 'Sumas de Riemann', 'Aproximación de un área bajo la curva: A ≈ Σ f(xᵢ)·Δx.'],
    ['LABS-MAT-10', 'Máquina de Galton', 'Distribución binomial en la máquina de Galton: P(k) = C(n,k)·pᵏ·(1−p)ⁿ⁻ᵏ.'],
  ]),
  ...tilesDeGrupo(AREAS_LABS[3], 'labs-bio', [
    ['LABS-BIO-01', 'Microscopio Virtual', 'Límite de resolución óptica de un microscopio: Resolución = 0.61λ/NA.'],
    ['LABS-BIO-02', 'Transporte Celular', 'Presión osmótica en el transporte celular: π = i·M·R·T.'],
    ['LABS-BIO-03', 'Síntesis de Proteínas', 'Flujo de la información genética: ADN → ARN → Proteína.'],
    ['LABS-BIO-04', 'Fotosíntesis', 'Reacción global de la fotosíntesis: 6CO₂ + 6H₂O + Luz → C₆H₁₂O₆ + 6O₂.'],
    ['LABS-BIO-05', 'Leyes de Mendel', 'Proporción fenotípica de un cruce dihíbrido: 9:3:3:1.'],
    ['LABS-BIO-06', 'Selección Natural', 'Frecuencias alélicas en la selección natural: f(A) + f(a) = 1, caso del melanismo industrial.'],
    ['LABS-BIO-07', 'Sistema Nervioso', 'Velocidad del arco reflejo rotuliano: v = Δx/Δt.'],
    ['LABS-BIO-08', 'Electrocardiograma', 'Frecuencia cardiaca a partir del ECG: T = 60/BPM.'],
    ['LABS-BIO-09', 'Sistema Digestivo', 'Actividad enzimática según el pH: relación enzima–sustrato y pH óptimo.'],
    ['LABS-BIO-10', 'Din. de Poblaciones', 'Modelo depredador-presa de Lotka-Volterra: dx/dt = αx − βxy.'],
  ]),
];

// ── Educación Financiera — 9 grados reales (1.º a 9.º), cada uno desglosado
// en sus 3 habilidades oficiales (verbatim de GRADE_INFO en src/lib/hub.ts
// del proyecto CEN-FINANCIERA). Color de acento real por grado. ──────────
const GRADOS_FINANCIERA = [
  { grado: 1, hex: '#FF8C00', rgba: '255,140,0', titulo: 'Mis Primeros Pesos', objetivo: 'Descubrir el valor del dinero y el esfuerzo personal.', skills: [['Reconocer Monedas', 'fa-coins'], ['Valor del Trabajo', 'fa-hand-holding-dollar'], ['Mi Primer Ahorro', 'fa-piggy-bank']] },
  { grado: 2, hex: '#F59E0B', rgba: '245,158,11', titulo: 'El Origen de la Riqueza', objetivo: 'Comprender la historia del dinero y la administración del hogar.', skills: [['Historia del Trueque', 'fa-scroll'], ['Marcas de Seguridad', 'fa-shield-halved'], ['Ingresos y Gastos', 'fa-scale-balanced']] },
  { grado: 3, hex: '#10B981', rgba: '16,185,129', titulo: 'Mi Plan de Tesoros', objetivo: 'Dominar la planificación básica y la distinción de necesidades.', skills: [['Deseos vs Necesidades', 'fa-list-check'], ['Registro de Gastos', 'fa-receipt'], ['Presupuesto Familiar', 'fa-calculator']] },
  { grado: 4, hex: '#06B6D4', rgba: '6,182,212', titulo: 'Guardianes del Banco', objetivo: 'Descubrir el funcionamiento de los bancos y las herramientas de ahorro formal.', skills: [['Cuentas de Ahorro', 'fa-building-columns'], ['Seguridad Bancaria', 'fa-shield-halved'], ['Control de Inflación', 'fa-arrow-trend-up']] },
  { grado: 5, hex: '#3B82F6', rgba: '59,130,246', titulo: 'ADN Emprendedor', objetivo: 'Lanzar proyectos con valor agregado y entender la inversión básica.', skills: [['Valor Agregado', 'fa-gem'], ['Cálculo de Ganancias', 'fa-chart-line'], ['Inversión Inicial', 'fa-seedling']] },
  { grado: 6, hex: '#6366F1', rgba: '99,102,241', titulo: 'Pasaporte Financiero Global', objetivo: 'Navegar el comercio global y los impuestos con ética financiera.', skills: [['Comercio Global', 'fa-earth-americas'], ['Cultura Fiscal', 'fa-file-invoice-dollar'], ['Ética Financiera', 'fa-scale-balanced']] },
  { grado: 7, hex: '#8B5CF6', rgba: '139,92,246', titulo: 'México: Poder y Economía', objetivo: 'Analizar la historia económica de México y el impacto del comercio.', skills: [['Historia Económica', 'fa-landmark'], ['T-MEC y Nearshoring', 'fa-truck-fast'], ['Presupuesto Público', 'fa-building-columns']] },
  { grado: 8, hex: '#D946EF', rgba: '217,70,239', titulo: 'Arquitectos de Inversión', objetivo: 'Dominar el interés compuesto y la gestión de activos y pasivos.', skills: [['Interés Compuesto', 'fa-percent'], ['Activos vs Pasivos', 'fa-scale-unbalanced'], ['Mercado de Valores', 'fa-chart-line']] },
  { grado: 9, hex: '#F43F5E', rgba: '244,63,94', titulo: 'Visión 360: El Futuro', objetivo: 'Elaborar un plan financiero integral desde los 15 hasta los 65 años.', skills: [['Estrategia Fiscal', 'fa-file-invoice-dollar'], ['Venture Capital', 'fa-rocket'], ['Plan de Vida 360º', 'fa-compass']] },
] as const;

const MATERIAS_FINANCIERA: Materia[] = GRADOS_FINANCIERA.flatMap(g =>
  g.skills.map(([skill, icon], i) => ({
    id: `fin-g${g.grado}-${i + 1}`,
    codigo: `FIN-G${g.grado}-${i + 1}`,
    nombreCorto: skill,
    nombreCompleto: `${skill} · Grado ${g.grado}: ${g.titulo}`,
    icon,
    hex: g.hex,
    rgba: g.rgba,
    descripcion: g.objetivo,
  }))
);

// Robótica e Idiomas no entran al carrusel: son productos "Próximamente" sin
// currículo construido todavía (ver PRODUCTS en ProductosSection.tsx) — mostrar
// tiles ahí sería inventar contenido que aún no existe.
const PLATAFORMAS: PlataformaMosaico[] = [
  {
    id: 'bachillerato',
    nombreCorto: 'CEN Bachillerato',
    pillIcon: 'fa-graduation-cap',
    sub: 'Cada plataforma CEN se construye sobre un currículo oficial completo. Así se desglosan las 8 áreas de conocimiento del MCCEMS en sus 32 unidades curriculares reales.',
    tag: 'Currículo completo · 8 áreas · 32 unidades curriculares',
    columnas: 6,
    materias: MATERIAS_BACHILLERATO,
  },
  {
    id: 'preescolar',
    nombreCorto: 'CEN Preescolar',
    pillIcon: 'fa-shapes',
    sub: 'Preescolar se organiza en los 4 campos formativos de la Nueva Escuela Mexicana, desglosados en sus 34 contenidos oficiales — la base con la que arranca todo el trayecto de educación básica.',
    tag: '4 campos formativos · 34 contenidos oficiales',
    columnas: 5,
    materias: MATERIAS_PREESCOLAR,
  },
  {
    id: 'primaria',
    nombreCorto: 'CEN Primaria',
    pillIcon: 'fa-pencil',
    sub: 'Primaria retoma los mismos 4 campos formativos y los reparte en las 3 fases oficiales (1.º-2.º, 3.º-4.º y 5.º-6.º), cada una con su propio número de contenidos.',
    tag: '4 campos formativos · 3 fases · 12 bloques',
    columnas: 4,
    materias: MATERIAS_PRIMARIA,
  },
  {
    id: 'secundaria',
    nombreCorto: 'CEN Secundaria',
    pillIcon: 'fa-book',
    sub: 'En secundaria, los 4 campos formativos se concretan en 15 disciplinas especializadas: Español, Matemáticas, Biología, Física, Historia, Geografía y más.',
    tag: '4 campos formativos · 15 disciplinas',
    columnas: 4,
    materias: MATERIAS_SECUNDARIA,
  },
  {
    id: 'labs',
    nombreCorto: 'CEN Labs',
    pillIcon: 'fa-flask',
    sub: 'Laboratorios Virtuales cubre las 4 ciencias experimentales con 40 simuladores interactivos reales, alineados al MCCEMS.',
    tag: '4 materias · 40 laboratorios interactivos',
    columnas: 6,
    materias: MATERIAS_LABS,
  },
  {
    id: 'financiera',
    nombreCorto: 'Educación Financiera',
    pillIcon: 'fa-sack-dollar',
    sub: 'Educación Financiera acompaña los 9 grados de la educación básica, cada uno con 3 habilidades financieras propias, del primer ahorro al plan de vida a 360º.',
    tag: '9 grados · 27 habilidades financieras',
    columnas: 5,
    materias: MATERIAS_FINANCIERA,
  },
];

function agruparEnColumnas(materias: Materia[], forma: number[]): Materia[][] {
  const columnas: Materia[][] = [];
  let cursor = 0;
  for (const n of forma) {
    columnas.push(materias.slice(cursor, cursor + n));
    cursor += n;
  }
  return columnas;
}

export function MateriasMosaicoSection() {
  const [plataformaIdx, setPlataformaIdx] = useState(0);
  const [activa, setActiva] = useState(0);

  // `plataformaIdx` solo toma índices producidos por irAPlataforma() sobre
  // PLATAFORMAS, y `activa` solo índices dentro de plataforma.materias —
  // ambos caen siempre dentro de rango.
  const plataforma = PLATAFORMAS[plataformaIdx] as PlataformaMosaico;
  const materiaActiva = plataforma.materias[activa] as Materia;
  const columnas = agruparEnColumnas(plataforma.materias, repartirEnColumnas(plataforma.materias.length, plataforma.columnas));

  function irAPlataforma(idx: number) {
    setPlataformaIdx(idx);
    setActiva(0);
  }

  function RomboTile({ materia, idx }: { materia: Materia; idx: number }) {
    const isActive = idx === activa;
    return (
      <button
        type="button"
        className={`rombo-slot${isActive ? ' rombo-slot--active' : ''}`}
        style={{ '--hex-accent': materia.hex, '--hex-rgba': materia.rgba } as React.CSSProperties}
        onClick={() => setActiva(idx)}
        aria-pressed={isActive}
      >
        <span className="rombo-tile">
          <span className="rombo-tile-inner">
            <i className={`fas ${materia.icon} rombo-icon`} />
            <span className="rombo-label">{materia.nombreCorto}</span>
          </span>
        </span>
      </button>
    );
  }

  return (
    <section id="materias" className="section materias-section">
      <div className="materias-bg-texture" aria-hidden="true" />
      <div className="materias-inner">
        <div className="materias-content" key={plataforma.id}>
          <div className={`rombo-grid${densidadClase(plataforma.materias.length)}`} role="group" aria-label={`Materias principales de ${plataforma.nombreCorto}`}>
            {columnas.map((columna, i) => (
              <div className="rombo-col" key={i}>
                {columna.map(m => <RomboTile key={m.id} materia={m} idx={plataforma.materias.indexOf(m)} />)}
              </div>
            ))}
          </div>

          <div className="materias-side">
            <div className="materias-heading">
              <span className="materias-eyebrow"><i className="fas fa-gem" />Dentro de cada plataforma</span>
              <h2 className="materias-h2">Las materias detrás de <em>{plataforma.nombreCorto}</em></h2>
              <p className="materias-sub">{plataforma.sub}</p>
              <span className="materias-tag"><i className="fas fa-check" /> {plataforma.tag}</span>
            </div>

            <div className="materias-platform-list" role="group" aria-label="Elegir plataforma CEN">
              {PLATAFORMAS.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  className={`materias-platform-card${i === plataformaIdx ? ' materias-platform-card--active' : ''}`}
                  onClick={() => irAPlataforma(i)}
                  aria-pressed={i === plataformaIdx}
                >
                  <span className="materias-platform-icon"><i className={`fas ${p.pillIcon}`} /></span>
                  <span className="materias-platform-label">{p.nombreCorto}</span>
                  {i === plataformaIdx && <i className="fas fa-check materias-platform-check" aria-hidden="true" />}
                </button>
              ))}
            </div>

            <div
              className="materias-detail"
              style={{ '--hex-accent': materiaActiva.hex, '--hex-rgba': materiaActiva.rgba } as React.CSSProperties}
            >
              <span className="materias-detail-icon">
                <i className={`fas ${materiaActiva.icon}`} />
              </span>
              <span className="materias-detail-codigo">{materiaActiva.codigo}</span>
              <h3 className="materias-detail-nombre">{materiaActiva.nombreCompleto}</h3>
              <p className="materias-detail-desc">{materiaActiva.descripcion}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
