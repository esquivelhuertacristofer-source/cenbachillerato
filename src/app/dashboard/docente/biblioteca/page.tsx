'use client';

import React, { useState, useMemo } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import {
  Book,
  Library,
  Search,
  ArrowUpRight,
  ShieldCheck,
  GraduationCap,
  Scale,
  Filter,
  Info,
  Globe,
  Layers,
} from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  author?: string;
  description: string;
  longDescription: string;
  url: string;
  category: 'Oficial' | 'Evaluación' | 'Libros' | 'Docentes' | 'Ciencia y Tech';
  type: string;
  tags: string[];
  level: ('1-2 Semestre' | '3-4 Semestre' | '5-6 Semestre' | 'Docentes')[];
  isPremium?: boolean;
}

const resources: Resource[] = [
  {
    id: 'sep-1',
    title: 'MCCEMS — Marco Curricular y Plan de Estudios 2022',
    description: 'Documento oficial SEP con el marco completo del NEM para bachillerato.',
    longDescription: 'Fuente primaria indispensable. Contiene las 4 dimensiones, los saberes, las progresiones y los criterios de evaluación del Nuevo Marco Curricular para la Educación Media Superior.',
    url: 'https://www.sep.gob.mx/work/models/sep1/Resource/10933/1/images/plan_de_estudios_2022.pdf',
    category: 'Oficial',
    type: 'Documento SEP',
    tags: ['MCCEMS', 'OFICIAL', 'NEM'],
    level: ['Docentes'],
    isPremium: true,
  },
  {
    id: 'sep-2',
    title: 'COSDAC — Centro de Estudios Científicos y Tecnológicos',
    description: 'Plataforma de la DGB con recursos curriculares alineados al NEM.',
    longDescription: 'Repositorio oficial con programas de estudio, guías didácticas y materiales de apoyo para docentes de bachillerato. Actualizado para el plan 2022.',
    url: 'https://www.cosdac.sems.gob.mx/',
    category: 'Oficial',
    type: 'Portal Gubernamental',
    tags: ['DGB', 'COSDAC', 'RECURSOS'],
    level: ['Docentes', '1-2 Semestre', '3-4 Semestre', '5-6 Semestre'],
  },
  {
    id: 'eval-1',
    title: 'CENEVAL — Guía EXANI-II',
    description: 'Guía oficial del examen de admisión universitaria con reactivos resueltos.',
    longDescription: 'Herramienta fundamental para preparar a los alumnos de 5° y 6° semestre. Contiene reactivos de razonamiento matemático, verbal y lectura crítica alineados al perfil de egreso del NEM.',
    url: 'https://www.ceneval.edu.mx/guias-de-estudio',
    category: 'Evaluación',
    type: 'Evaluación Externa',
    tags: ['EXANI', 'ADMISIÓN', 'EGRESO'],
    level: ['5-6 Semestre', 'Docentes'],
    isPremium: true,
  },
  {
    id: 'sci-1',
    title: 'Khan Academy en Español',
    description: 'Plataforma gratuita con lecciones de matemáticas, ciencias y humanidades.',
    longDescription: 'Excelente recurso de apoyo para refuerzo académico. Cubre desde álgebra básica hasta cálculo diferencial. Ideal para alumnos que necesitan repasar saberes fundamentales.',
    url: 'https://es.khanacademy.org/',
    category: 'Ciencia y Tech',
    type: 'Plataforma Digital',
    tags: ['MATEMÁTICAS', 'CIENCIAS', 'GRATUITO'],
    level: ['1-2 Semestre', '3-4 Semestre', '5-6 Semestre'],
  },
  {
    id: 'doc-1',
    title: 'SEMS — Subsecretaría de Educación Media Superior',
    description: 'Portal oficial con circulares, lineamientos y actualizaciones docentes.',
    longDescription: 'Fuente autorizada para mantenerse al día con disposiciones administrativas, evaluaciones docentes, programas de formación continua y convocatorias oficiales del nivel medio superior.',
    url: 'https://www.gob.mx/sems',
    category: 'Docentes',
    type: 'Portal Gubernamental',
    tags: ['SEMS', 'LINEAMIENTOS', 'FORMACIÓN'],
    level: ['Docentes'],
  },
  {
    id: 'book-1',
    title: 'Cómo Aprende la Gente',
    author: 'National Academies of Sciences',
    description: 'Síntesis de la investigación sobre el aprendizaje y la enseñanza efectiva.',
    longDescription: 'Traducción al español del influyente informe "How People Learn". Explica los principios del aprendizaje basados en evidencia, con implicaciones prácticas para el diseño de situaciones didácticas en el NEM.',
    url: 'https://nap.nationalacademies.org/catalog/24783/how-people-learn-brain-mind-experience-and-school-expanded-edition',
    category: 'Libros',
    type: 'Investigación',
    tags: ['PEDAGOGÍA', 'APRENDIZAJE', 'EVIDENCIA'],
    level: ['Docentes'],
    isPremium: true,
  },
  {
    id: 'sci-2',
    title: 'Desmos — Calculadora Gráfica',
    description: 'Herramienta gratuita de visualización matemática para el aula.',
    longDescription: 'Imprescindible para los saberes matemáticos. Permite a los alumnos explorar funciones, estadística y geometría de forma visual e interactiva, directamente desde el navegador o dispositivo móvil.',
    url: 'https://www.desmos.com/calculator?lang=es',
    category: 'Ciencia y Tech',
    type: 'Herramienta Digital',
    tags: ['MATEMÁTICAS', 'VISUAL', 'GRATUITO'],
    level: ['1-2 Semestre', '3-4 Semestre', '5-6 Semestre', 'Docentes'],
  },
  {
    id: 'doc-2',
    title: 'Pensamiento Crítico — Guía Práctica para Docentes',
    author: 'Richard Paul & Linda Elder',
    description: 'Manual de referencia para enseñar y evaluar el pensamiento crítico en aula.',
    longDescription: 'Referente internacional adaptado al contexto del NEM. Ofrece estrategias concretas para diseñar preguntas, debates y situaciones que desarrollen la metacognición y el análisis en los alumnos de bachillerato.',
    url: 'https://www.criticalthinking.org/',
    category: 'Docentes',
    type: 'Manual Pedagógico',
    tags: ['METACOGNICIÓN', 'PENSAMIENTO', 'MCCEMS'],
    level: ['Docentes'],
  },
];

const CATEGORY_ICON: Record<string, React.ElementType> = {
  'Oficial': ShieldCheck,
  'Evaluación': Scale,
  'Libros': Book,
  'Docentes': GraduationCap,
  'Ciencia y Tech': Layers,
};

const CATEGORY_STYLE: Record<string, string> = {
  'Oficial': 'bg-emerald-50 text-emerald-600',
  'Evaluación': 'bg-blue-50 text-blue-600',
  'Libros': 'bg-amber-50 text-amber-600',
  'Docentes': 'bg-violet-50 text-violet-600',
  'Ciencia y Tech': 'bg-sky-50 text-sky-600',
};

export default function BibliotecaPage() {
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [activeLevel, setActiveLevel] = useState<string>('Todos');
  const [search, setSearch] = useState('');

  const filteredResources = useMemo(() => {
    return resources.filter(r => {
      const matchesCategory = activeCategory === 'Todos' || r.category === activeCategory;
      const matchesLevel = activeLevel === 'Todos' || r.level.includes(activeLevel as Resource['level'][number]);
      const matchesSearch =
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.description.toLowerCase().includes(search.toLowerCase()) ||
        r.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
      return matchesCategory && matchesLevel && matchesSearch;
    });
  }, [activeCategory, activeLevel, search]);

  return (
    <div className="flex min-h-screen bg-[#F4F1EA] font-['Epilogue'] text-[#011C40]">
      <Sidebar />

      <main className="flex-1 md:ml-[260px] p-4 sm:p-8 md:p-12 space-y-8 md:space-y-12 relative">

        {/* Header */}
        <div className="relative overflow-hidden rounded-[2.5rem] md:rounded-[3.5rem] bg-[#011C40] p-8 sm:p-12 md:p-16 shadow-[0_40px_80px_rgba(1,28,64,0.3)]">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#D4A574]/20 rounded-full blur-[140px] animate-pulse" />
          <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-8 md:gap-12">
            <div className="space-y-5 md:space-y-8 flex-1 text-center xl:text-left">
              <div className="flex items-center justify-center xl:justify-start gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                  <Library className="w-5 h-5 md:w-6 md:h-6 text-[#7DD3FC]" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50">CEN Bachillerato · MCCEMS</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white leading-none tracking-tighter">
                Biblioteca <span className="italic font-sans text-[#D4A574]">Maestra</span>
              </h1>
              <p className="max-w-2xl text-xl text-white/50 font-medium leading-relaxed">
                Repositorio auditado de recursos pedagógicos para la excelencia en el NEM y el MCCEMS.
              </p>
            </div>

            <div className="w-full xl:w-[450px] space-y-6">
              <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-white/30 group-focus-within:text-[#D4A574] transition-colors" />
                <input
                  type="text"
                  placeholder="Búsqueda inteligente..."
                  className="w-full pl-16 pr-8 py-7 bg-white/5 border border-white/10 rounded-[2.5rem] text-white font-bold focus:ring-4 focus:ring-[#D4A574]/20 focus:border-[#D4A574] outline-none transition-all backdrop-blur-xl"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="sticky top-0 z-30 bg-[#F4F1EA]/90 backdrop-blur-2xl p-4 md:p-6 rounded-[2rem] md:rounded-[3rem] border border-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 md:p-3 bg-[#011C40] text-white rounded-xl md:rounded-2xl flex-shrink-0">
              <Filter className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <div className="overflow-x-auto -mr-4 pr-4 md:mr-0 md:pr-0">
              <div className="flex gap-1.5 md:gap-2 p-1.5 bg-white rounded-2xl border border-slate-100 min-w-max">
                {['Todos', 'Oficial', 'Evaluación', 'Libros', 'Docentes', 'Ciencia y Tech'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 md:px-6 py-2.5 md:py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                      activeCategory === cat
                        ? 'bg-[#011C40] text-white shadow-lg scale-[1.02]'
                        : 'text-slate-400 hover:text-[#011C40] hover:bg-slate-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3 overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap flex-shrink-0">Semestre:</span>
            <div className="flex gap-1.5 md:gap-2 min-w-max">
              {['Todos', '1-2 Sem', '3-4 Sem', '5-6 Sem', 'Docentes'].map((lvl, i) => {
                const lvlFull = ['Todos', '1-2 Semestre', '3-4 Semestre', '5-6 Semestre', 'Docentes'][i]!;
                return (
                  <button
                    key={lvl}
                    onClick={() => setActiveLevel(lvlFull)}
                    className={`px-3 md:px-5 py-2.5 md:py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${
                      activeLevel === lvlFull
                        ? 'bg-[#D4A574] border-[#D4A574] text-white'
                        : 'bg-white border-slate-100 text-slate-400 hover:border-[#D4A574] hover:text-[#D4A574]'
                    }`}
                  >
                    {lvl}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Resources grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-10">
          {filteredResources.map((resource, i) => {
            const Icon = CATEGORY_ICON[resource.category] ?? Globe;
            const iconStyle = CATEGORY_STYLE[resource.category] ?? 'bg-slate-50 text-slate-600';
            return (
              <div
                key={resource.id}
                className="group relative bg-white rounded-[3.5rem] p-12 border border-white shadow-[0_30px_60px_rgba(0,0,0,0.03)] hover:shadow-[0_60px_100px_rgba(1,28,64,0.1)] transition-all duration-700 hover:-translate-y-4 flex flex-col"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {resource.isPremium && (
                  <div className="absolute top-8 right-8 px-4 py-2 bg-[#D4A574] text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg">
                    CEN Choice
                  </div>
                )}

                <div className="flex items-start justify-between mb-10">
                  <div className={`w-16 h-16 rounded-[1.75rem] flex items-center justify-center ${iconStyle}`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{resource.type}</span>
                    <div className="flex gap-1">
                      {resource.level.map(l => (
                        <div key={l} className="w-2 h-2 rounded-full bg-[#7DD3FC]" title={l} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6 flex-1">
                  <div>
                    <h4 className="text-3xl font-black text-[#011C40] leading-none tracking-tighter group-hover:text-[#D4A574] transition-colors mb-3">
                      {resource.title}
                    </h4>
                    {resource.author && (
                      <p className="text-[11px] font-black text-[#011C40]/40 uppercase tracking-widest mb-4">Por {resource.author}</p>
                    )}
                  </div>

                  <p className="text-slate-500 font-medium leading-relaxed">
                    {resource.description}
                  </p>

                  <div className="bg-[#F4F1EA] rounded-3xl p-6 space-y-3 border border-slate-100/50">
                    <div className="flex items-center gap-2 text-[9px] font-black text-[#D4A574] uppercase tracking-widest">
                      <Info className="w-3 h-3" /> Por qué lo recomendamos
                    </div>
                    <p className="text-[12px] font-bold text-[#011C40]/70 leading-relaxed italic">
                      &ldquo;{resource.longDescription}&rdquo;
                    </p>
                  </div>
                </div>

                <div className="mt-10 pt-10 border-t border-slate-50 flex flex-wrap gap-2 mb-10">
                  {resource.tags.map(tag => (
                    <span key={tag} className="px-4 py-2 bg-slate-50 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] border border-slate-100">
                      {tag}
                    </span>
                  ))}
                </div>

                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-6 bg-[#011C40] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-4 group/btn hover:bg-[#D4A574] transition-all shadow-xl active:scale-95"
                >
                  Acceder al Recurso
                  <ArrowUpRight className="w-5 h-5 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                </a>
              </div>
            );
          })}
        </div>

        {filteredResources.length === 0 && (
          <div className="flex flex-col items-center justify-center py-40 space-y-8">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl">
              <Search className="w-10 h-10 text-slate-200" />
            </div>
            <p className="text-xl font-black text-[#011C40] tracking-tight">No se encontraron recursos</p>
            <button
              onClick={() => { setActiveCategory('Todos'); setActiveLevel('Todos'); setSearch(''); }}
              className="px-8 py-4 bg-[#011C40] text-white rounded-xl font-black text-[10px] uppercase tracking-widest"
            >
              Restablecer Filtros
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
