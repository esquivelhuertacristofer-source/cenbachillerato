'use client';

import { useRef, useState } from 'react';

import { useInView } from '@/lib/motion/hooks';

import { tintaSobre } from './contraste';

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

// El mosaico se lee por bloques: cada área/campo/grado es un grupo con su
// encabezado (punto de color + nombre + cuántas materias trae) y su propia
// rejilla de tiles. Agrupar es lo que devuelve la jerarquía que el teselado
// anterior aplanaba: sin grupos, 40 tiles del mismo tamaño son una pared.
interface Grupo {
  id: string;
  nombre: string;
  hex: string;
  rgba: string;
  icon: string;
  materias: Materia[];
}

interface Rotulo {
  art: 'los' | 'las';
  nombre: string;
}

interface PlataformaMosaico {
  id: string;
  nombreCorto: string;
  pillIcon: string;
  /**
   * A qué nivel educativo sirve la plataforma, dicho con las palabras del
   * sistema ("Educación básica · Primaria", "Educación media superior"). Va
   * montado sobre la foto, encima del nombre, y es dato que la ficha no decía
   * en ninguna parte: "CEN Primaria" y "CEN Labs" no dicen por sí solos que
   * una es básica y la otra bachillerato.
   */
  nivel: string;
  sub: string;
  /**
   * Las cifras de la plataforma, separadas por " · ". Cada tramo que empieza
   * con un número se pinta como cifra grande + rótulo (ver `cifrasDeTag`); los
   * que no traen número no entran a esa banda.
   */
  tag: string;
  /**
   * Foto de portada de la ficha. Se reusan las mismas imágenes que ya trae
   * `PRODUCTS` en ProductosSection.tsx para cada producto: son assets que ya
   * están en producción en esta misma landing, así la sección no contradice
   * visualmente a la de productos ni suma peso nuevo a `public/`.
   */
  imagen: string;
  /** Qué se ve en la foto, no cómo se llama la plataforma (eso ya va en el h3). */
  imagenAlt: string;
  /**
   * Cómo se llama cada nivel en ESTA plataforma. No son sinónimos: los 8 de
   * bachillerato son áreas, los 4 de preescolar campos formativos y los 9 de
   * financiera grados. El artículo va aparte porque el género cambia con el
   * sustantivo ("las 8 áreas" / "los 4 campos formativos") y el número lo pone
   * el componente contando el arreglo, para que no se desincronice del dato.
   */
  rotuloGrupos: Rotulo;
  rotuloMaterias: Rotulo;
  grupos: Grupo[];
  /** Plano de `grupos`, en el mismo orden en que se pintan. */
  materias: Materia[];
}

type Fila = readonly [string, string, string, string?];

/**
 * Guion suave (U+00AD): marca dónde puede partirse una palabra demasiado ancha
 * para su columna. Se construye con `fromCharCode` en vez de escribir el
 * carácter en el literal porque es invisible en el editor, y una cadena con un
 * carácter que no se ve es una trampa para quien venga a editar el nombre.
 *
 * Hace falta porque `hyphens: auto` depende de un diccionario de silabación que
 * Chrome no siempre tiene descargado; sin el guion suave el navegador parte la
 * palabra a la mitad y SIN guion ("Transformacione / s"). No se ve cuando la
 * palabra sí cabe, así que en móvil (columnas más anchas) no aparece.
 */
const GUION_SUAVE = String.fromCharCode(0xad);

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

function grupoDeCampo(
  campo: { hex: string; rgba: string; icon: string; nombreCompleto: string },
  idPrefix: string,
  filas: readonly Fila[],
): Grupo {
  return {
    id: idPrefix,
    nombre: campo.nombreCompleto,
    hex: campo.hex,
    rgba: campo.rgba,
    icon: campo.icon,
    materias: tilesDeGrupo(campo, idPrefix, filas),
  };
}

function conMaterias(base: Omit<PlataformaMosaico, 'materias'>): PlataformaMosaico {
  return { ...base, materias: base.grupos.flatMap(g => g.materias) };
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

const GRUPOS_BACHILLERATO: Grupo[] = AREAS_BACHILLERATO.map(a => ({
  id: `bach-${a.area.toLowerCase()}`,
  nombre: a.nombreCompleto,
  hex: a.hex,
  rgba: a.rgba,
  icon: a.icon,
  materias: a.unidades.map(([roman, corto, tema]) => ({
    id: `${a.area}-${roman}`.toLowerCase(),
    codigo: `${a.area}-${roman}`,
    nombreCorto: corto,
    nombreCompleto: `${a.nombreCompleto} · Unidad ${roman}`,
    icon: a.icon,
    hex: a.hex,
    rgba: a.rgba,
    descripcion: tema,
  })),
}));

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

const GRUPOS_PREESCOLAR: Grupo[] = [
  grupoDeCampo(CAMPOS_BASE[0], 'preescolar-len', [
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
  grupoDeCampo(CAMPOS_BASE[1], 'preescolar-spc', [
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
  grupoDeCampo(CAMPOS_BASE[2], 'preescolar-ens', [
    ['ENS-F2-01', 'Cuidado de la Naturaleza', 'Interacción, cuidado, conservación y regeneración de la naturaleza, que favorece la construcción de una conciencia socioambiental.'],
    ['ENS-F2-02', 'Necesidades Básicas', 'Transformación responsable del entorno al satisfacer necesidades básicas de alimentación, vestido y vivienda.'],
    ['ENS-F2-03', 'Identidad y Patrimonio', 'Construcción de la identidad y pertenencia a una comunidad y país a partir del conocimiento de su historia, sus celebraciones, conmemoraciones tradicionales y obras del patrimonio artístico y cultural.'],
    ['ENS-F2-04', 'Cambios en el Tiempo', 'Cambios que ocurren en los lugares, entornos, objetos, costumbres y formas de vida de las distintas familias y comunidades con el paso del tiempo.'],
    ['ENS-F2-05', 'Bien Común', 'Labores y servicios que contribuyen al bien común de las distintas familias y comunidades.'],
    ['ENS-F2-06', 'Derechos de la Niñez', 'Los derechos de niñas y niños como base para el bienestar integral y el establecimiento de acuerdos que favorecen la convivencia pacífica.'],
    ['ENS-F2-07', 'Diversidad Familiar', 'La diversidad de personas y familias en la comunidad y su convivencia, en un ambiente de equidad, libertad, inclusión y respeto a los derechos humanos.'],
    ['ENS-F2-08', 'Cultura de Paz', 'La cultura de paz como una forma de relacionarse con otras personas para promover la inclusión y el respeto a la diversidad.'],
  ]),
  grupoDeCampo(CAMPOS_BASE[3], 'preescolar-hc', [
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

const GRUPOS_PRIMARIA: Grupo[] = CAMPOS_BASE.map(campo => ({
  id: `primaria-${campo.id}`,
  nombre: campo.nombreCompleto,
  hex: campo.hex,
  rgba: campo.rgba,
  icon: campo.icon,
  materias: FASES_PRIMARIA.map(f => {
    const n = f.conteos[campo.id];
    return {
      id: `primaria-${campo.id}-f${f.fase}`,
      codigo: `${campo.id.toUpperCase()}-F${f.fase}`,
      nombreCorto: `Fase ${f.fase} · ${f.grados}`,
      nombreCompleto: `${campo.nombreCompleto} · Fase ${f.fase} (${f.grados} de primaria)`,
      icon: campo.icon,
      hex: campo.hex,
      rgba: campo.rgba,
      descripcion: `${n} contenidos oficiales del campo "${campo.nombreCompleto}" para ${f.grados} de primaria (Fase ${f.fase}).`,
    };
  }),
}));

const GRUPOS_SECUNDARIA: Grupo[] = [
  grupoDeCampo(CAMPOS_BASE[0], 'secundaria-len', [
    ['LEN-F6-ESP', 'Español', '14 contenidos oficiales de Lengua Materna. Español en secundaria.', 'Lengua Materna. Español'],
    ['LEN-F6-LIM', 'Lengua Indígena', '14 contenidos oficiales de Lengua Indígena Materna en secundaria.', 'Lengua Indígena Materna'],
    ['LEN-F6-LI2', 'Ind. 2ª Lengua', '13 contenidos oficiales de Lengua Indígena como Segunda Lengua en secundaria.', 'Lengua Indígena como Segunda Lengua'],
    ['LEN-F6-ING', 'Inglés', '14 contenidos oficiales de Lengua Extranjera. Inglés en secundaria.', 'Lengua Extranjera. Inglés'],
    ['LEN-F6-ART', 'Artes', '14 contenidos oficiales de Artes en secundaria.', 'Artes'],
  ]),
  grupoDeCampo(CAMPOS_BASE[1], 'secundaria-spc', [
    ['SPC-F6-MAT', 'Matemáticas', '14 contenidos oficiales de Matemáticas en secundaria.', 'Matemáticas'],
    ['SPC-F6-BIO', 'Biología', '9 contenidos oficiales de Biología en secundaria.', 'Biología'],
    ['SPC-F6-FIS', 'Física', '10 contenidos oficiales de Física en secundaria.', 'Física'],
    ['SPC-F6-QUI', 'Química', '12 contenidos oficiales de Química en secundaria.', 'Química'],
  ]),
  grupoDeCampo(CAMPOS_BASE[2], 'secundaria-ens', [
    ['ENS-F6-GEO', 'Geografía', '14 contenidos oficiales de Geografía en secundaria.', 'Geografía'],
    ['ENS-F6-HIS', 'Historia', '12 contenidos oficiales de Historia en secundaria.', 'Historia'],
    ['ENS-F6-FCE', 'Cívica y Ética', '16 contenidos oficiales de Formación Cívica y Ética en secundaria.', 'Formación Cívica y Ética'],
  ]),
  grupoDeCampo(CAMPOS_BASE[3], 'secundaria-hc', [
    ['HC-F6-TEC', 'Tecnología', '8 contenidos oficiales de Tecnología en secundaria.', 'Tecnología'],
    ['HC-F6-ESO', 'Soc. y Emocional', '5 contenidos oficiales de Educación Socioemocional en secundaria.', 'Educación Socioemocional'],
    ['HC-F6-EFI', 'Ed. Física', '5 contenidos oficiales de Educación Física en secundaria.', 'Educación Física'],
  ]),
];

// ── CEN Labs — las 4 ciencias experimentales, desglosadas en sus 40
// simuladores reales (título + ecuación verbatim de src/data/simuladoresData.ts
// del proyecto CEN-LABS). Colores tomados del mismo catálogo (LABS_REAL). ──
const AREAS_LABS = [
  { id: 'quimica', hex: '#219EBC', rgba: '33,158,188', icon: 'fa-flask-vial', nombreCompleto: 'Química' },
  { id: 'fisica', hex: '#FB8500', rgba: '251,133,0', icon: 'fa-bolt', nombreCompleto: 'Física' },
  { id: 'matematicas', hex: '#FFB703', rgba: '255,183,3', icon: 'fa-calculator', nombreCompleto: 'Matemáticas' },
  { id: 'biologia', hex: '#8ECAE6', rgba: '142,202,230', icon: 'fa-microscope', nombreCompleto: 'Biología' },
] as const;

const GRUPOS_LABS: Grupo[] = [
  grupoDeCampo(AREAS_LABS[0], 'labs-qui', [
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
  grupoDeCampo(AREAS_LABS[1], 'labs-fis', [
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
  grupoDeCampo(AREAS_LABS[2], 'labs-mat', [
    ['LABS-MAT-01', 'Cuadráticas', 'Análisis de la función cuadrática: f(x) = ax² + bx + c.'],
    ['LABS-MAT-02', 'Triangulación', 'Resolución de un sistema de ecuaciones lineales 2×2: y = mx + b.'],
    ['LABS-MAT-03', 'Escala Richter', 'Energía liberada según la escala de Richter: E = 10^(1.5·ΔM).'],
    ['LABS-MAT-04', 'Pitágoras', 'Aplicación del teorema de Pitágoras: a² + b² = c².'],
    ['LABS-MAT-05', 'Círculo Trigonométrico', 'Funciones seno y coseno en el círculo unitario: y = sen(θ), x = cos(θ).'],
    // Única palabra de Matemáticas más ancha que su columna en escritorio.
    // El nombre completo (4.º campo) va limpio: es el que lee el panel de detalle.
    [
      'LABS-MAT-06',
      `Transforma${GUION_SUAVE}ciones`,
      "Transformaciones lineales sobre un vector: V' = M·V + T.",
      'Transformaciones',
    ],
    ['LABS-MAT-07', 'Ley de Snell', 'Refracción de la luz entre dos medios: n₁·sen(θ₁) = n₂·sen(θ₂).'],
    ['LABS-MAT-08', 'La Derivada', "Definición de la derivada por el límite: f'(x) = lim(h→0) [f(x+h) − f(x)] / h."],
    ['LABS-MAT-09', 'Sumas de Riemann', 'Aproximación de un área bajo la curva: A ≈ Σ f(xᵢ)·Δx.'],
    ['LABS-MAT-10', 'Máquina de Galton', 'Distribución binomial en la máquina de Galton: P(k) = C(n,k)·pᵏ·(1−p)ⁿ⁻ᵏ.'],
  ]),
  grupoDeCampo(AREAS_LABS[3], 'labs-bio', [
    ['LABS-BIO-01', 'Microscopio Virtual', 'Límite de resolución óptica de un microscopio: Resolución = 0.61λ/NA.'],
    ['LABS-BIO-02', 'Transporte Celular', 'Presión osmótica en el transporte celular: π = i·M·R·T.'],
    ['LABS-BIO-03', 'Síntesis de Proteínas', 'Flujo de la información genética: ADN → ARN → Proteína.'],
    ['LABS-BIO-04', 'Fotosíntesis', 'Reacción global de la fotosíntesis: 6CO₂ + 6H₂O + Luz → C₆H₁₂O₆ + 6O₂.'],
    ['LABS-BIO-05', 'Leyes de Mendel', 'Proporción fenotípica de un cruce dihíbrido: 9:3:3:1.'],
    ['LABS-BIO-06', 'Selección Natural', 'Frecuencias alélicas en la selección natural: f(A) + f(a) = 1, caso del melanismo industrial.'],
    ['LABS-BIO-07', 'Sistema Nervioso', 'Velocidad del arco reflejo rotuliano: v = Δx/Δt.'],
    // Única palabra de Biología más ancha que su columna en escritorio.
    [
      'LABS-BIO-08',
      `Electrocardio${GUION_SUAVE}grama`,
      'Frecuencia cardiaca a partir del ECG: T = 60/BPM.',
      'Electrocardiograma',
    ],
    ['LABS-BIO-09', 'Sistema Digestivo', 'Actividad enzimática según el pH: relación enzima–sustrato y pH óptimo.'],
    ['LABS-BIO-10', 'Din. de Poblaciones', 'Modelo depredador-presa de Lotka-Volterra: dx/dt = αx − βxy.'],
  ]),
];

// ── Educación Financiera — 9 grados reales (1.º a 9.º), cada uno desglosado
// en sus 3 habilidades oficiales (verbatim de GRADE_INFO en src/lib/hub.ts
// del proyecto CEN-FINANCIERA). Color de acento real por grado.
//
// Grados 6 y 7 son la única excepción a "el color no se toca": #6366F1 y
// #8B5CF6 caen en la zona muerta de luminancia media —reprueban el 4.5:1 de
// WCAG AA con tinta blanca (4.47 y 4.23) Y con tinta oscura (3.91 y 4.13)—,
// así que ninguna elección de tinta los salva. Se aclaran al siguiente paso
// de su propia rampa, conservando el tono: índigo 234° y violeta 270°. No
// pertenecen a hub-colors.ts; sólo viven aquí. ────────────────────────────
const GRADOS_FINANCIERA = [
  { grado: 1, hex: '#FF8C00', rgba: '255,140,0', titulo: 'Mis Primeros Pesos', objetivo: 'Descubrir el valor del dinero y el esfuerzo personal.', skills: [['Reconocer Monedas', 'fa-coins'], ['Valor del Trabajo', 'fa-hand-holding-dollar'], ['Mi Primer Ahorro', 'fa-piggy-bank']] },
  { grado: 2, hex: '#F59E0B', rgba: '245,158,11', titulo: 'El Origen de la Riqueza', objetivo: 'Comprender la historia del dinero y la administración del hogar.', skills: [['Historia del Trueque', 'fa-scroll'], ['Marcas de Seguridad', 'fa-shield-halved'], ['Ingresos y Gastos', 'fa-scale-balanced']] },
  { grado: 3, hex: '#10B981', rgba: '16,185,129', titulo: 'Mi Plan de Tesoros', objetivo: 'Dominar la planificación básica y la distinción de necesidades.', skills: [['Deseos vs Necesidades', 'fa-list-check'], ['Registro de Gastos', 'fa-receipt'], ['Presupuesto Familiar', 'fa-calculator']] },
  { grado: 4, hex: '#06B6D4', rgba: '6,182,212', titulo: 'Guardianes del Banco', objetivo: 'Descubrir el funcionamiento de los bancos y las herramientas de ahorro formal.', skills: [['Cuentas de Ahorro', 'fa-building-columns'], ['Seguridad Bancaria', 'fa-shield-halved'], ['Control de Inflación', 'fa-arrow-trend-up']] },
  { grado: 5, hex: '#3B82F6', rgba: '59,130,246', titulo: 'ADN Emprendedor', objetivo: 'Lanzar proyectos con valor agregado y entender la inversión básica.', skills: [['Valor Agregado', 'fa-gem'], ['Cálculo de Ganancias', 'fa-chart-line'], ['Inversión Inicial', 'fa-seedling']] },
  { grado: 6, hex: '#818CF8', rgba: '129,140,248', titulo: 'Pasaporte Financiero Global', objetivo: 'Navegar el comercio global y los impuestos con ética financiera.', skills: [['Comercio Global', 'fa-earth-americas'], ['Cultura Fiscal', 'fa-file-invoice-dollar'], ['Ética Financiera', 'fa-scale-balanced']] },
  { grado: 7, hex: '#C084FC', rgba: '192,132,252', titulo: 'México: Poder y Economía', objetivo: 'Analizar la historia económica de México y el impacto del comercio.', skills: [['Historia Económica', 'fa-landmark'], ['T-MEC y Nearshoring', 'fa-truck-fast'], ['Presupuesto Público', 'fa-building-columns']] },
  { grado: 8, hex: '#D946EF', rgba: '217,70,239', titulo: 'Arquitectos de Inversión', objetivo: 'Dominar el interés compuesto y la gestión de activos y pasivos.', skills: [['Interés Compuesto', 'fa-percent'], ['Activos vs Pasivos', 'fa-scale-unbalanced'], ['Mercado de Valores', 'fa-chart-line']] },
  { grado: 9, hex: '#F43F5E', rgba: '244,63,94', titulo: 'Visión 360: El Futuro', objetivo: 'Elaborar un plan financiero integral desde los 15 hasta los 65 años.', skills: [['Estrategia Fiscal', 'fa-file-invoice-dollar'], ['Venture Capital', 'fa-rocket'], ['Plan de Vida 360º', 'fa-compass']] },
] as const;

const GRUPOS_FINANCIERA: Grupo[] = GRADOS_FINANCIERA.map(g => ({
  id: `fin-g${g.grado}`,
  nombre: `${g.grado}.º grado · ${g.titulo}`,
  hex: g.hex,
  rgba: g.rgba,
  icon: 'fa-sack-dollar',
  materias: g.skills.map(([skill, icon], i) => ({
    id: `fin-g${g.grado}-${i + 1}`,
    codigo: `FIN-G${g.grado}-${i + 1}`,
    nombreCorto: skill,
    nombreCompleto: `${skill} · Grado ${g.grado}: ${g.titulo}`,
    icon,
    hex: g.hex,
    rgba: g.rgba,
    descripcion: g.objetivo,
  })),
}));

/**
 * La ficha es papel: fondo blanco, la foto pone el color, el azul CEN es tinta.
 *
 * Hubo tres intentos antes y los tres fallaron por el mismo sitio —el fondo—.
 * Primero cada plataforma traía su propio color pleno (azul, naranja, verde,
 * morado, celeste, ámbar): seis marcas distintas puestas en fila. Después las
 * seis en el mismo azul CEN: ya era una familia, pero seguía siendo un
 * rectángulo de 560×880 de color saturado, y a ese tamaño ningún tono se salva
 * —lee como cartel, no como producto—. Y después azul-negro, que sí resolvía el
 * rectángulo de color pero traía uno peor: el negro no es lenguaje de escuela.
 *
 * Lo que manda ahora es el papel. Blanco pleno, como una ficha impresa: se
 * retira del todo para que salgan las tres cosas que sí distinguen a cada
 * plataforma —su fotografía a todo color, su nombre y sus cifras—. El color no
 * se va, cambia de sitio: vive en la foto (un tercio de la ficha), en el azul
 * CEN de las cifras y del botón, y en los puntos de área del panel
 * (`Grupo.hex`), que sobre blanco leen su tono exacto en vez de una versión
 * teñida por el fondo. Nada apagado y nada pastel: blanco pleno, azul pleno,
 * foto plena. Lo que despega la hoja del fondo no es color, es sombra.
 */
export const FICHA = {
  /**
   * El fondo. Blanco puro, no crema ni gris: la ficha tiene que leerse como
   * hoja apoyada sobre el lavado azul de la sección, y cualquier tinte la
   * convierte en papel viejo.
   */
  fondo: '#FFFFFF',
  /** El mismo fondo en canales sueltos, para velos (`rgba(var(--…), α)`). */
  fondoRgba: '255,255,255',
  /**
   * Azul CEN como TINTA: las cifras, los contadores del panel y el lavado de la
   * fila al pasar el cursor. Sobre blanco da 5.17:1, así que aguanta incluso
   * los 11px de los contadores.
   */
  realce: '#2563EB',
  /**
   * El mismo azul CEN, ahora como relleno: el botón. Es el único bloque
   * saturado de la ficha fuera de la foto, y por eso se lee como LA acción.
   * Lleva tinta blanca (5.17:1, AA).
   */
  accion: '#2563EB',
  /**
   * El velo de la foto va en el navy de la landing y NO en el fondo de la
   * ficha. Ésa es la trampa de una ficha clara: un degradado hacia el blanco
   * desvanece la foto justo donde vive el nombre y lo deja sin piso. En navy el
   * velo oscurece el pie de la fotografía —el nombre en blanco pasa de 7:1
   * sobre cualquier foto, incluso una casi blanca— y la foto termina en un
   * canto limpio contra el papel, que es como termina una foto en una hoja.
   */
  velo: '#0B2545',
  /** El velo en canales sueltos, que es como lo consume el degradado. */
  veloRgba: '11,37,69',
  /**
   * El rótulo del nivel, sobre el velo. Azul muy claro (`--cen-accent-soft`) y
   * no blanco: así el nivel se retira medio paso del nombre en vez de competir
   * con él, y sigue siendo azul de marca. Sobre el velo al 78% da 6.3:1.
   */
  nivelSobreVelo: '#DBEAFE',
} as const;

/**
 * Las tres tintas se calculan, no se escriben: si alguien oscurece el fondo,
 * cambia el azul del botón o aclara el velo de la foto, el texto se da vuelta
 * solo en vez de quedar al revés y reventar la legibilidad en silencio.
 * Verificado en contraste.test.ts.
 */
const TINTA_FICHA = tintaSobre(FICHA.fondo);
const TINTA_ACCION = tintaSobre(FICHA.accion);
const TINTA_VELO = tintaSobre(FICHA.velo);

/**
 * Las cifras de la plataforma, sacadas de `tag`.
 *
 * La etiqueta ya venía escrita como cifras separadas por " · " ("4 campos
 * formativos · 34 contenidos oficiales"), pero se pintaba como píldoras: tres
 * cápsulas grises de 10px donde el número —que es justo lo que la sección
 * vende, currículo oficial completo— quedaba del mismo tamaño que la palabra.
 * Aquí se parte en número y rótulo para que el número pueda ir grande.
 *
 * Los tramos sin número al frente ("Currículo completo") se quedan fuera: en
 * una banda de cifras, una columna sin cifra rompe la línea de base y no hay
 * nada que alinear. Ese texto no se pierde —lo dice la descripción de la
 * ficha—; lo que se pierde es la caja vacía.
 */
export function cifrasDeTag(tag: string): { num: string; label: string }[] {
  return tag.split('·').flatMap(tramo => {
    const partido = /^(\d+)\s+(.+)$/.exec(tramo.trim());
    const num = partido?.[1];
    const label = partido?.[2];
    return num && label ? [{ num, label }] : [];
  });
}

// Robótica e Idiomas no entran al carrusel: son productos "Próximamente" sin
// currículo construido todavía (ver PRODUCTS en ProductosSection.tsx) — mostrar
// tiles ahí sería inventar contenido que aún no existe.
export const PLATAFORMAS: PlataformaMosaico[] = [
  conMaterias({
    id: 'bachillerato',
    nombreCorto: 'CEN Bachillerato',
    pillIcon: 'fa-graduation-cap',
    nivel: 'Educación media superior',
    sub: 'Las 8 áreas de conocimiento del MCCEMS, desglosadas en las 32 unidades curriculares reales que cursa un estudiante de bachillerato.',
    tag: 'Currículo completo · 8 áreas · 32 unidades curriculares',
    imagen: '/bachillerato.webp',
    imagenAlt: 'Cuatro estudiantes de bachillerato con libros y carpetas en el pasillo de su plantel',
    rotuloGrupos: { art: 'las', nombre: 'áreas de conocimiento' },
    rotuloMaterias: { art: 'las', nombre: 'unidades curriculares' },
    grupos: GRUPOS_BACHILLERATO,
  }),
  conMaterias({
    id: 'preescolar',
    nombreCorto: 'CEN Preescolar',
    pillIcon: 'fa-shapes',
    nivel: 'Educación básica · Preescolar',
    sub: 'Preescolar se organiza en los 4 campos formativos de la Nueva Escuela Mexicana, desglosados en sus 34 contenidos oficiales — la base con la que arranca todo el trayecto de educación básica.',
    tag: '4 campos formativos · 34 contenidos oficiales',
    imagen: '/4.webp',
    imagenAlt: 'Niñas y niños de preescolar levantando la mano frente a su maestra en el salón',
    rotuloGrupos: { art: 'los', nombre: 'campos formativos' },
    rotuloMaterias: { art: 'los', nombre: 'contenidos oficiales' },
    grupos: GRUPOS_PREESCOLAR,
  }),
  conMaterias({
    id: 'primaria',
    nombreCorto: 'CEN Primaria',
    pillIcon: 'fa-pencil',
    nivel: 'Educación básica · Primaria',
    sub: 'Primaria retoma los mismos 4 campos formativos y los reparte en las 3 fases oficiales (1.º-2.º, 3.º-4.º y 5.º-6.º), cada una con su propio número de contenidos.',
    tag: '4 campos formativos · 3 fases · 12 bloques',
    imagen: '/5.webp',
    imagenAlt: 'Alumnos de primaria de uniforme escribiendo con lápiz en su cuaderno',
    rotuloGrupos: { art: 'los', nombre: 'campos formativos' },
    rotuloMaterias: { art: 'los', nombre: 'bloques por fase' },
    grupos: GRUPOS_PRIMARIA,
  }),
  conMaterias({
    id: 'secundaria',
    nombreCorto: 'CEN Secundaria',
    pillIcon: 'fa-book',
    nivel: 'Educación básica · Secundaria',
    sub: 'En secundaria, los 4 campos formativos se concretan en 15 disciplinas especializadas: Español, Matemáticas, Biología, Física, Historia, Geografía y más.',
    tag: '4 campos formativos · 15 disciplinas',
    imagen: '/6.webp',
    imagenAlt: 'Cinco adolescentes de secundaria trabajando juntos alrededor de una mesa con sus cuadernos abiertos',
    rotuloGrupos: { art: 'los', nombre: 'campos formativos' },
    rotuloMaterias: { art: 'las', nombre: 'disciplinas' },
    grupos: GRUPOS_SECUNDARIA,
  }),
  conMaterias({
    id: 'labs',
    nombreCorto: 'CEN Labs',
    pillIcon: 'fa-flask',
    nivel: 'Bachillerato · Ciencias experimentales',
    sub: 'Laboratorios Virtuales cubre las 4 ciencias experimentales con 40 simuladores interactivos reales, alineados al MCCEMS.',
    tag: '4 materias · 40 laboratorios interactivos',
    imagen: '/3.webp',
    imagenAlt: 'Material de laboratorio —matraz aforado, matraz Erlenmeyer, vaso de precipitados y gradilla con tubos de ensayo— iluminado en azul',
    rotuloGrupos: { art: 'las', nombre: 'ciencias experimentales' },
    rotuloMaterias: { art: 'los', nombre: 'laboratorios' },
    grupos: GRUPOS_LABS,
  }),
  conMaterias({
    id: 'financiera',
    nombreCorto: 'Educación Financiera',
    pillIcon: 'fa-sack-dollar',
    nivel: 'Transversal · Los 9 grados de básica',
    sub: 'Educación Financiera acompaña los 9 grados de la educación básica, cada uno con 3 habilidades financieras propias, del primer ahorro al plan de vida a 360º.',
    tag: '9 grados · 27 habilidades financieras',
    imagen: '/2.webp',
    imagenAlt: 'Ilustración de un mapa de México con una alcancía, monedas y un birrete encima',
    rotuloGrupos: { art: 'los', nombre: 'grados' },
    rotuloMaterias: { art: 'las', nombre: 'habilidades financieras' },
    grupos: GRUPOS_FINANCIERA,
  }),
];

/**
 * Cuánto avanza el carrusel de un paso: el ancho REAL de la primera ficha más
 * la separación que declare el CSS vigente. Medido del DOM y no fijado como
 * constante porque la ficha encoge en móvil (`flex-basis` con `min()`); una
 * constante se desincroniza en cuanto alguien toca ese ancho y el carrusel
 * empieza a dejar fichas a medias.
 */
function pasoDelCarrusel(track: HTMLElement): number {
  const primera = track.firstElementChild;
  if (!(primera instanceof HTMLElement)) return 0;
  const separacion = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
  return primera.getBoundingClientRect().width + separacion;
}

/**
 * `scroll-behavior: smooth` del CSS sí respeta la preferencia del sistema, pero
 * el `behavior: 'smooth'` que se pasa por JS la ignora: hay que consultarla aquí.
 */
function comportamientoDeScroll(): ScrollBehavior {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}

/**
 * Hasta cuántos grupos lleva cada fila un segundo renglón con sus materias.
 *
 * Las seis fichas miden lo mismo pero traen de 4 a 9 grupos. Con una sola línea
 * por fila, las de 4 (Preescolar, Primaria, Secundaria, Labs) repartían el panel
 * en cuatro cajas altas con un renglón corto flotando dentro —aire con borde—,
 * mientras Bachillerato llenaba el suyo con ocho filas seguidas. Ese contraste
 * de densidad, más que el color, es lo que hacía que unas se vieran bonitas y
 * otras vacías. El segundo renglón usa el contenido que ya existe (las materias
 * del grupo) para llenar ese hueco con dato en vez de con espacio.
 *
 * Las densas se quedan en una línea: ahí no sobra alto y el panel se volvería
 * un muro de texto que además obligaría a la lista a scrollear.
 */
const MAX_GRUPOS_CON_DETALLE = 5;

export function MateriasMosaicoSection() {
  const pistaRef = useRef<HTMLDivElement>(null);
  // Ficha que el scroll dejó al frente; solo alimenta los puntos y el estado
  // deshabilitado de las flechas.
  const [actual, setActual] = useState(0);
  // Id de la ficha cuyo panel está mostrando las materias sueltas en vez de sus
  // grupos. Cadena vacía = ninguna (ningún id lo es).
  const [desglosada, setDesglosada] = useState('');

  // Entrada escalonada de las fichas. Va por clase y no con `motion` como el
  // resto de la landing a propósito: la pista tiene `scroll-snap`, y animar el
  // `transform` de las fichas desde JS le mueve el punto de anclaje a la pista
  // mientras dura la transición. Con una clase, el retardo por ficha lo lleva
  // CSS (`--matc-i`) y `prefers-reduced-motion` ya la anula en el bloque de
  // más abajo, sin ninguna rama extra en el componente.
  const [seccionRef, aLaVista] = useInView<HTMLElement>();

  function alHacerScroll() {
    const pista = pistaRef.current;
    if (!pista) return;
    const paso = pasoDelCarrusel(pista);
    if (paso <= 0) return;
    // Al tope de la pista caben varias fichas a la vez, así que `scrollLeft`
    // se queda muy por debajo de `(n-1) * paso` y por división nunca se llega
    // al último índice: los dos últimos puntos jamás se marcaban y la flecha
    // derecha nunca se deshabilitaba. Fin de pista = última ficha, y punto.
    const tope = pista.scrollWidth - pista.clientWidth;
    const idx = pista.scrollLeft >= tope - 1 ? PLATAFORMAS.length - 1 : Math.round(pista.scrollLeft / paso);
    setActual(Math.min(Math.max(idx, 0), PLATAFORMAS.length - 1));
  }

  function irAFicha(idx: number) {
    const pista = pistaRef.current;
    if (!pista) return;
    pista.scrollTo({ left: idx * pasoDelCarrusel(pista), behavior: comportamientoDeScroll() });
  }

  function desplazar(direccion: 1 | -1) {
    const pista = pistaRef.current;
    if (!pista) return;
    pista.scrollBy({ left: direccion * pasoDelCarrusel(pista), behavior: comportamientoDeScroll() });
  }

  return (
    <section id="materias" className="section materias-section" ref={seccionRef}>
      <div className="materias-bg-texture" aria-hidden="true" />
      <div className="materias-inner">
        <div className="matc-cab">
          <div className="materias-heading">
            <span className="materias-eyebrow"><i className="fas fa-gem" />Dentro de cada plataforma</span>
            <h2 className="materias-h2">Las materias detrás de <em>cada plataforma CEN</em></h2>
            <p className="materias-sub">
              Ninguna se arma con temas sueltos: todas parten de un currículo oficial completo.
              Estas son las áreas y las materias reales que trae cada una.
            </p>
          </div>

          <div className="matc-nav">
            <button
              type="button"
              className="matc-nav-btn"
              onClick={() => desplazar(-1)}
              disabled={actual === 0}
              aria-label="Ver la plataforma anterior"
            >
              <i className="fas fa-arrow-left" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="matc-nav-btn"
              onClick={() => desplazar(1)}
              disabled={actual === PLATAFORMAS.length - 1}
              aria-label="Ver la plataforma siguiente"
            >
              <i className="fas fa-arrow-right" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* `tabIndex` sobre la pista: es una región con scroll, y sin foco propio
            no habría forma de recorrerla con el teclado más que saltando de
            botón en botón (WCAG 2.1.1). */}
        <div
          className="matc-track"
          ref={pistaRef}
          onScroll={alHacerScroll}
          tabIndex={0}
          role="group"
          aria-label="Plataformas CEN — una ficha por plataforma"
        >
          {PLATAFORMAS.map((p, i) => {
            const abierta = desglosada === p.id;
            const rotulo = abierta ? p.rotuloMaterias : p.rotuloGrupos;
            const cuenta = abierta ? p.materias.length : p.grupos.length;
            const otro = abierta ? p.rotuloGrupos : p.rotuloMaterias;
            const otraCuenta = abierta ? p.grupos.length : p.materias.length;
            const listaId = `matc-lista-${p.id}`;
            const conDetalle = p.grupos.length <= MAX_GRUPOS_CON_DETALLE;

            return (
              <article
                key={p.id}
                className={`matc-card${aLaVista ? ' matc-card--entra' : ''}`}
                style={{
                  // Lo único que cambia de ficha a ficha: el retardo de entrada.
                  // Los demás tokens son iguales en las seis (van aquí y no en
                  // el CSS para que el color de la ficha se lea en un solo lugar,
                  // junto a `FICHA`) y se derivan de la tinta, no se escriben a
                  // mano: hoy el papel blanco pide tinta oscura, pero la rama
                  // oscura se conserva porque quien manda es `tintaSobre()` —si
                  // el fondo se oscurece, todo se da vuelta solo en vez de quedar
                  // al revés y reventar la legibilidad en silencio.
                  '--matc-i': i,
                  '--matc-fondo': FICHA.fondo,
                  '--matc-fondo-rgba': FICHA.fondoRgba,
                  '--matc-realce': FICHA.realce,
                  '--matc-accion': FICHA.accion,
                  '--matc-accion-tinta': TINTA_ACCION,
                  '--matc-tinta': TINTA_FICHA,
                  // La portada tiene su propio par fondo/tinta, independiente del
                  // de la ficha: el velo de la foto es navy aunque la ficha sea
                  // blanca (ver `FICHA.velo`), y por lo tanto el nombre montado
                  // encima lleva la tinta del VELO, no la de la ficha. Sin esta
                  // separación el título saldría en navy sobre navy.
                  '--matc-velo-foto': FICHA.veloRgba,
                  '--matc-tinta-foto': TINTA_VELO,
                  '--matc-nivel-foto': FICHA.nivelSobreVelo,
                  // El filo de un cabello: separa las filas del panel sin dibujar
                  // una caja alrededor de cada una. Es la tinta a muy poca fuerza,
                  // así que sigue al fondo si el fondo cambia.
                  '--matc-linea': TINTA_FICHA === '#FFFFFF' ? 'rgba(255,255,255,0.10)' : 'rgba(10,26,47,0.12)',
                  // Lo único que sí se rellena: el pulgar de la barra de scroll de
                  // la lista. Nunca texto encima.
                  '--matc-velo': TINTA_FICHA === '#FFFFFF' ? 'rgba(255,255,255,0.16)' : 'rgba(10,26,47,0.16)',
                  // Cuánto se retira la descripción. Sobre papel puede retirarse
                  // MÁS que sobre tinta oscura y no menos: la tinta al 78% sobre
                  // blanco da 8.7:1 (al 72% sobre azul-negro daba ~10:1, pero ahí
                  // el margen lo daba el fondo). Eso es lo que deja que el nombre
                  // y las cifras lean como primer plano. Verificado en el test.
                  '--matc-desc-op': TINTA_FICHA === '#FFFFFF' ? '0.72' : '0.78',
                  // El texto de servicio: rótulo del panel, pies de las cifras y
                  // segundo renglón de las filas. Sobre papel NO puede bajar a los
                  // 0.55-0.6 que aguantaba el azul-negro —ahí la tinta al 55% cae
                  // a 3.9:1 y se sale de AA a 10px—, así que la rama clara sube a
                  // 0.72 (6.9:1). Es el token que más fácil se rompe al aclarar un
                  // fondo, y por eso está aquí y no suelto en el CSS.
                  '--matc-sec-op': TINTA_FICHA === '#FFFFFF' ? '0.58' : '0.72',
                  // El halo del punto de área. Sobre azul-negro un halo del propio
                  // tono encendía el punto como un LED; sobre papel el mismo halo
                  // se lee como tinta corrida, así que en claro se apaga y al punto
                  // le basta su anillo.
                  '--matc-punto-brillo': TINTA_FICHA === '#FFFFFF' ? '55%' : '0%',
                } as React.CSSProperties}
              >
                {/* La portada: foto a sangre con el nombre montado encima. El
                    nombre vive aquí y no en el cuerpo porque es lo que la ficha
                    tiene que decir primero, y sobre la foto lo dice sin gastar
                    una línea del cuerpo. El texto va sobre un velo degradado
                    (`::after`) que le da piso pase lo que pase en la foto. El
                    `<img>` es deliberado —desplegamos en Cloudflare sin el
                    optimizador de Next, ver eslint.config.mjs—. */}
                <div className="matc-media">
                  <img
                    className="matc-media-img"
                    src={p.imagen}
                    alt={p.imagenAlt}
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="matc-card-icono" aria-hidden="true">
                    <i className={`fas ${p.pillIcon}`} />
                  </span>
                  <div className="matc-portada-txt">
                    <span className="matc-nivel">{p.nivel}</span>
                    <h3 className="matc-card-titulo">{p.nombreCorto}</h3>
                  </div>
                </div>

                <div className="matc-cuerpo">
                  <p className="matc-card-desc">{p.sub}</p>

                  {/* Las cifras, grandes. Antes eran píldoras de 10px donde el
                      número pesaba lo mismo que la palabra; aquí el número es el
                      titular y el rótulo su pie. Ver `cifrasDeTag`. */}
                  <div className="matc-cifras">
                    {cifrasDeTag(p.tag).map(c => (
                      <div className="matc-cifra" key={c.label}>
                        <span className="matc-cifra-num">{c.num}</span>
                        <span className="matc-cifra-lbl">{c.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="matc-panel">
                    <span className="matc-panel-label">{cuenta} {rotulo.nombre}</span>

                    <ul className="matc-lista" id={listaId}>
                      {abierta
                        ? p.materias.map(m => (
                          <li className="matc-item" key={m.id}>
                            <span className="matc-item-punto" style={{ '--matc-punto': m.hex } as React.CSSProperties} aria-hidden="true" />
                            <span className="matc-item-txt">
                              <span className="matc-item-nombre">{m.nombreCorto}</span>
                            </span>
                          </li>
                        ))
                        : p.grupos.map(g => (
                          <li className="matc-item" key={g.id}>
                            <span className="matc-item-punto" style={{ '--matc-punto': g.hex } as React.CSSProperties} aria-hidden="true" />
                            <span className="matc-item-txt">
                              <span className="matc-item-nombre">{g.nombre}</span>
                              {conDetalle && (
                                <span className="matc-item-detalle">
                                  {g.materias.map(m => m.nombreCorto).join(' · ')}
                                </span>
                              )}
                            </span>
                            <span className="matc-item-cuenta">{g.materias.length}</span>
                          </li>
                        ))}
                    </ul>

                    <button
                      type="button"
                      className="matc-cta"
                      onClick={() => setDesglosada(abierta ? '' : p.id)}
                      aria-controls={listaId}
                    >
                      Ver {otro.art} {otraCuenta} {otro.nombre}
                      <i
                        className={`fas ${abierta ? 'fa-arrow-left' : 'fa-arrow-right'} matc-cta-flecha`}
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="matc-dots" role="group" aria-label="Ir a una plataforma">
          {PLATAFORMAS.map((p, i) => (
            <button
              key={p.id}
              type="button"
              className={`matc-dot${i === actual ? ' matc-dot--activo' : ''}`}
              onClick={() => irAFicha(i)}
              aria-label={p.nombreCorto}
              aria-current={i === actual}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
