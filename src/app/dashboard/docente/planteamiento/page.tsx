'use client';

import { useState } from 'react';
import {
  Search,
  Clock,
  BarChart,
  Zap,
  FileText,
  Target,
  Lightbulb,
  Download,
  Monitor,
  CheckCircle2,
  ListTodo,
  BookOpen,
  ArrowRight,
  Info,
  GraduationCap,
} from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import { planteamientoData, getPlanUAC } from '@/data/planteamiento/hub';
import { UAC_BASE } from '@/lib/mccems/estructura';

// ── Helpers ────────────────────────────────────────────────────────────────

const UAC_POR_SEMESTRE = [1, 2, 3, 4, 5, 6].map((sem) => ({
  semestre: sem,
  uacs: UAC_BASE.filter((u) => u.semestre === sem && planteamientoData[u.codigo]),
}));

const FIRST_UAC = UAC_BASE.find((u) => planteamientoData[u.codigo]);

type ContentTab = 'estrategia' | 'teoria' | 'evaluacion';

const CONTENT_TABS = [
  { id: 'estrategia' as ContentTab, label: 'Estrategia',    Icon: Zap          },
  { id: 'teoria'     as ContentTab, label: 'Marco Teórico', Icon: BookOpen     },
  { id: 'evaluacion' as ContentTab, label: 'Evaluación',    Icon: CheckCircle2 },
];

function isTodo(val?: string | null) {
  return !val || val.startsWith('_TODO');
}

const PHASE_COLORS = ['#D4A574', '#0B2545', '#7DD3FC'] as const;

// ── Main Page ──────────────────────────────────────────────────────────────

export default function PlanteamientoPage() {
  const [selectedUAC, setSelectedUAC]           = useState(FIRST_UAC?.codigo ?? 'LC-I');
  const [selectedProgCode, setSelectedProgCode] = useState<string | null>(null);
  const [activeTab, setActiveTab]               = useState<ContentTab>('estrategia');
  const [searchQuery, setSearchQuery]           = useState('');

  const progresiones = getPlanUAC(selectedUAC);

  const activeProgresion = (selectedProgCode
    ? progresiones.find((p) => p.code === selectedProgCode)
    : undefined) ?? progresiones[0];

  function handleUACChange(codigo: string) {
    setSelectedUAC(codigo);
    setSelectedProgCode(null);
    setSearchQuery('');
    setActiveTab('estrategia');
  }

  const filtered = progresiones.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const currentUACMeta = UAC_BASE.find((u) => u.codigo === selectedUAC);

  return (
    <div
      className="flex min-h-screen font-['Epilogue']"
      style={{ background: '#F4F1EA', color: '#0B2545' }}
    >
      <Sidebar />

      <main className="flex-1 md:ml-[260px] flex flex-col md:flex-row md:h-screen md:overflow-hidden">

        {/* ── LEFT PANEL (desktop) ─────────────────────────────────────────
            z-[50] > Sidebar z-40 → background pinta sobre la sombra del
            Sidebar, eliminando el "gap" oscuro en el borde del panel. */}
        <aside
          className="hidden md:flex flex-col relative z-[50] border-r border-[#0B2545]/10 shadow-[16px_0_48px_rgba(11,37,69,0.07)]"
          style={{
            width: 'clamp(260px, 26vw, 380px)',
            flexShrink: 0,
            background: 'rgba(255,255,255,0.75)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
          }}
        >
          {/* Header */}
          <div className="p-7 space-y-5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#0B2545] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#0B2545]/20">
                  <ListTodo className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.15em] text-[#0B2545] m-0">Contenido</p>
                  <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400 m-0">MCCEMS 2025</p>
                </div>
              </div>
              <div className="relative">
                <select
                  value={selectedUAC}
                  onChange={(e) => handleUACChange(e.target.value)}
                  className="appearance-none bg-[#D4A574] text-white text-[10px] font-black uppercase tracking-[0.08em] pl-3 pr-7 py-2 rounded-xl border-none cursor-pointer outline-none hover:bg-[#c4955e] motion-safe:transition-colors"
                >
                  {UAC_POR_SEMESTRE.map(({ semestre, uacs }) => (
                    <optgroup key={semestre} label={`Semestre ${semestre}`}>
                      {uacs.map((u) => (
                        <option key={u.codigo} value={u.codigo}>{u.codigo}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <div className="absolute right-2.5 top-1/2 -translate-y-[60%] rotate-45 w-1.5 h-1.5 border-r-2 border-b-2 border-white pointer-events-none" />
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar en el currículo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/90 border border-white rounded-2xl text-[12px] font-medium text-[#0B2545] placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#D4A574]/30 focus:border-[#D4A574]/40 motion-safe:transition-all"
              />
            </div>
          </div>

          <div className="px-7 pb-3 text-[11px] font-bold uppercase tracking-[0.06em] text-[#0B2545]/45 truncate border-b border-[#0B2545]/[0.05]">
            {currentUACMeta?.nombre}
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2.5 custom-scrollbar">
            {filtered.map((prog) => {
              const isActive = activeProgresion?.code === prog.code;
              return (
                <button
                  key={prog.code}
                  onClick={() => { setSelectedProgCode(prog.code); setActiveTab('estrategia'); }}
                  className={[
                    'w-full text-left px-5 py-[18px] rounded-[22px] border-none cursor-pointer',
                    'motion-safe:transition-all motion-safe:duration-200 relative overflow-hidden',
                    isActive
                      ? 'bg-[#0B2545] text-white shadow-[0_16px_32px_rgba(11,37,69,0.20)] scale-[1.02] -translate-y-px'
                      : 'bg-white text-[#0B2545] hover:bg-[#FFF8F0] hover:shadow-md hover:scale-[1.01]',
                  ].join(' ')}
                >
                  <div className="flex justify-between mb-2 items-center">
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${isActive ? 'text-[#7DD3FC]' : 'text-[#D4A574]'}`}>
                      {prog.code}
                    </span>
                    <div className="flex items-center gap-1 opacity-50">
                      <Clock className="w-2.5 h-2.5" />
                      <span className="text-[9px] font-bold">{prog.duration}</span>
                    </div>
                  </div>
                  <p className="text-[13px] font-black leading-snug tracking-tight m-0">{prog.title}</p>
                  <div className={`mt-3 text-[10px] font-bold flex items-center gap-1 motion-safe:transition-opacity ${isActive ? 'opacity-40' : 'opacity-0'}`}>
                    Ver planeamiento completo <ArrowRight className="w-2.5 h-2.5" />
                  </div>
                </button>
              );
            })}

            {filtered.length === 0 && (
              <div className="py-8 text-center text-[#0B2545]/40">
                <p className="text-[13px] font-semibold m-0">Sin resultados</p>
              </div>
            )}
          </div>
        </aside>

        {/* ── MOBILE: compact UAC + progresión selector ──────────────────── */}
        <div className="md:hidden bg-white/80 backdrop-blur border-b border-white/50 p-4 space-y-3 flex-shrink-0">
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <select
                value={selectedUAC}
                onChange={(e) => handleUACChange(e.target.value)}
                style={{
                  width: '100%', appearance: 'none', background: '#0B2545', color: '#fff',
                  fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em',
                  padding: '10px 32px 10px 14px', borderRadius: 12, border: 'none',
                  cursor: 'pointer', outline: 'none',
                }}
              >
                {UAC_POR_SEMESTRE.map(({ semestre, uacs }) => (
                  <optgroup key={semestre} label={`Semestre ${semestre}`}>
                    {uacs.map((u) => (
                      <option key={u.codigo} value={u.codigo}>{u.codigo}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-60%) rotate(45deg)', width: 6, height: 6, borderRight: '2px solid #fff', borderBottom: '2px solid #fff', pointerEvents: 'none' }} />
            </div>
          </div>
          {progresiones.length > 0 && (
            <div style={{ position: 'relative' }}>
              <select
                value={selectedProgCode ?? progresiones[0]?.code ?? ''}
                onChange={(e) => { setSelectedProgCode(e.target.value); setActiveTab('estrategia'); }}
                style={{
                  width: '100%', appearance: 'none', background: '#D4A574', color: '#fff',
                  fontSize: 11, fontWeight: 700, padding: '10px 32px 10px 14px',
                  borderRadius: 12, border: 'none', cursor: 'pointer', outline: 'none',
                }}
              >
                {progresiones.map((p) => (
                  <option key={p.code} value={p.code}>{p.code} — {p.title}</option>
                ))}
              </select>
              <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-60%) rotate(45deg)', width: 6, height: 6, borderRight: '2px solid #fff', borderBottom: '2px solid #fff', pointerEvents: 'none' }} />
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL ────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ background: '#F4F1EA' }}>

          {/* Sticky nav */}
          <div className="sticky top-0 z-30 border-b flex items-center justify-between px-6 lg:px-12 py-4 backdrop-blur-xl bg-[#F4F1EA]/85 border-[#0B2545]/[0.06]">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#0B2545]/50">
              Contenido MCCEMS
            </span>
            <button className="flex items-center gap-2.5 px-5 py-2.5 bg-[#0B2545] text-white rounded-xl font-black text-[11px] uppercase tracking-[0.1em] cursor-pointer border-none hover:bg-[#1a3a6e] motion-safe:transition-colors">
              <Download className="w-3.5 h-3.5 text-[#7DD3FC]" />
              Exportar
            </button>
          </div>

          <div className="p-5 sm:p-8 lg:p-12 flex flex-col gap-8 lg:gap-12">

            {/* ── HERO BENTO ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-5">

              {/* Main title card */}
              <div className="bg-white rounded-[2rem] p-8 lg:p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-56 h-56 bg-[#D4A574]/15 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col gap-5">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="px-3.5 py-1.5 bg-[#D4A574]/10 text-[#D4A574] rounded-full text-[10px] font-black uppercase tracking-[0.15em]">
                      {activeProgresion?.level ?? 'MCCEMS 2025'}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                      {activeProgresion?.code}
                    </span>
                  </div>
                  <h1 className="text-3xl lg:text-[34px] font-black text-[#0B2545] leading-[1.15] tracking-[-0.03em] m-0">
                    {activeProgresion?.title ?? 'Selecciona una progresión'}
                  </h1>
                  {activeProgresion?.category && !isTodo(activeProgresion.category) && (
                    <span className="text-[13px] font-bold text-[#D4A574]">{activeProgresion.category}</span>
                  )}
                </div>
              </div>

              {/* Quick info: side-by-side below xl, stacked at xl */}
              <div className="grid grid-cols-2 xl:grid-cols-1 gap-3.5">
                <div className="bg-[#0B2545] rounded-[1.75rem] p-6 text-white flex flex-col justify-between min-h-[100px]">
                  <Clock className="w-5 h-5 text-[#7DD3FC]" />
                  <div className="mt-4">
                    <p className="text-[9px] font-black uppercase text-white/40 m-0 mb-1">Duración</p>
                    <p className="text-[17px] font-black m-0">{activeProgresion?.duration ?? '—'}</p>
                  </div>
                </div>
                <div className="bg-white rounded-[1.75rem] p-6 flex flex-col justify-between min-h-[100px]">
                  <BarChart className="w-5 h-5 text-[#D4A574]" />
                  <div className="mt-4">
                    <p className="text-[9px] font-black uppercase text-slate-400 m-0 mb-1">Dificultad</p>
                    <p className="text-[17px] font-black text-[#0B2545] m-0">{activeProgresion?.difficulty ?? '—'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── TAB NAVIGATION ─────────────────────────────────────────── */}
            <div className="flex justify-center overflow-x-auto pb-1">
              <div className="flex-shrink-0 flex gap-2 p-2 rounded-[1.75rem] border border-white/80 backdrop-blur-md bg-white/50 shadow-xl">
                {CONTENT_TABS.map(({ id, label, Icon }) => {
                  const active = activeTab === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id)}
                      className={[
                        'flex items-center gap-2.5 px-6 lg:px-8 py-3.5 rounded-[1.25rem]',
                        'border-none cursor-pointer text-[11px] font-black uppercase tracking-[0.12em] whitespace-nowrap',
                        'motion-safe:transition-all motion-safe:duration-200',
                        active
                          ? 'bg-[#0B2545] text-white shadow-2xl scale-[1.04]'
                          : 'bg-transparent text-slate-500 hover:bg-white hover:text-[#0B2545]',
                      ].join(' ')}
                    >
                      <Icon className={`w-[15px] h-[15px] ${active ? 'text-[#7DD3FC]' : 'text-slate-400'}`} />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── CONTENT GRID ───────────────────────────────────────────── */}
            <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-8 items-start pb-12">

              {/* Main content */}
              <div className="flex flex-col gap-6">

                {activeTab === 'estrategia' && (
                  <>
                    {(activeProgresion?.strategy?.phases ?? []).length > 0 ? (
                      activeProgresion!.strategy.phases.map((phase, i) => (
                        <div key={i} className="bg-white rounded-[1.75rem] px-10 py-9 relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1.5 h-full" style={{ background: PHASE_COLORS[i] ?? '#D4A574' }} />
                          <div className="flex flex-col gap-5">
                            <div className="flex items-center gap-3 flex-wrap">
                              <div
                                className="w-8 h-8 rounded-[10px] flex items-center justify-center text-white font-black text-[13px] flex-shrink-0"
                                style={{ background: PHASE_COLORS[i] ?? '#D4A574' }}
                              >
                                {i + 1}
                              </div>
                              <h4 className="text-[18px] font-black text-[#0B2545] m-0 flex-1">{phase.title}</h4>
                              <span className="text-[12px] font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-lg flex-shrink-0">{phase.duration}</span>
                            </div>
                            {!isTodo(phase.description) && (
                              <p className="text-[15px] text-[#475569] leading-[1.7] m-0">{phase.description}</p>
                            )}
                            {!isTodo(phase.activity) && (
                              <div className="bg-[#F4F1EA] px-5 py-4 rounded-[1.1rem] border border-black/[0.04]">
                                <p className="text-[10px] font-black text-[#D4A574] uppercase tracking-[0.2em] mb-2 m-0 flex items-center gap-1.5">
                                  <Info className="w-3 h-3" /> Actividad Sugerida
                                </p>
                                <p className="text-[13px] font-bold text-[#0B2545] leading-[1.6] m-0">{phase.activity}</p>
                              </div>
                            )}
                            {isTodo(phase.description) && (
                              <PendingPlaceholder label="Contenido de esta fase pendiente de generación" />
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <EmptyContent />
                    )}
                  </>
                )}

                {activeTab === 'teoria' && (
                  <div className="bg-white rounded-[1.75rem] p-10 lg:p-14 flex flex-col gap-10">
                    <div className="flex flex-col gap-5">
                      <div className="w-16 h-1 bg-[#7DD3FC] rounded-full" />
                      <h2 className="text-3xl font-black text-[#0B2545] leading-[1.2] m-0">Marco Teórico</h2>
                      {!isTodo(activeProgresion?.theory?.introduction) ? (
                        <p className="text-[17px] text-slate-500 font-medium leading-[1.65] italic m-0">
                          &ldquo;{activeProgresion?.theory?.introduction}&rdquo;
                        </p>
                      ) : (
                        <PendingPlaceholder label="Introducción teórica pendiente de generación" />
                      )}
                    </div>
                    {(activeProgresion?.theory?.sections ?? []).some((s) => !isTodo(s.content)) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
                        {activeProgresion!.theory.sections.map((section, i) => (
                          <div key={i} className="flex flex-col gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-[12px] font-black text-[#0B2545]">
                              0{i + 1}
                            </div>
                            {!isTodo(section.subtitle) && (
                              <h4 className="text-[17px] font-black text-[#0B2545] m-0">{section.subtitle}</h4>
                            )}
                            {!isTodo(section.content) && (
                              <p className="text-[14px] text-[#475569] leading-[1.7] m-0">{section.content}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'evaluacion' && (
                  <div className="flex flex-col gap-6">
                    <div className="bg-white rounded-[1.75rem] p-8 lg:p-11 flex flex-col gap-7">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                        <h4 className="text-[22px] font-black text-[#0B2545] m-0">Banco de Evaluación</h4>
                        <div className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-[0.08em]">
                          MCCEMS 2025
                        </div>
                      </div>
                      <div className="flex flex-col gap-5">
                        {(activeProgresion?.evaluation?.exam_questions ?? []).map((q, i) => {
                          const hasContent = !isTodo(q.question) && q.options.every((o) => !isTodo(o));
                          if (!hasContent) return (
                            <PendingPlaceholder key={i} label={`Pregunta ${i + 1} pendiente de generación`} />
                          );
                          return (
                            <div key={i} className="p-7 bg-slate-50 rounded-[1.5rem] flex flex-col gap-5">
                              <p className="text-[17px] font-black text-[#0B2545] m-0">
                                <span className="text-[#D4A574] mr-2.5">Q{i + 1}.</span>
                                {q.question}
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {q.options.map((opt, j) => (
                                  <div
                                    key={j}
                                    className={`px-4 py-3.5 rounded-xl border-2 flex items-center gap-2.5 ${
                                      opt === q.correct
                                        ? 'bg-emerald-50 border-emerald-500/20 text-emerald-800 shadow-[0_8px_16px_rgba(16,185,129,0.08)]'
                                        : 'bg-white border-transparent text-slate-500'
                                    }`}
                                  >
                                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${opt === q.correct ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                                    <span className="text-[13px] font-bold">{opt}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="bg-[#0B2545] rounded-[1.75rem] p-8 lg:p-11 text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-9 opacity-[0.07] pointer-events-none">
                        <Target className="w-24 h-24" />
                      </div>
                      <div className="relative z-10 flex flex-col gap-5">
                        <div className="flex items-center gap-3.5">
                          <div className="w-11 h-11 bg-[#7DD3FC] rounded-xl flex items-center justify-center flex-shrink-0">
                            <Target className="w-5 h-5 text-[#0B2545]" />
                          </div>
                          <h4 className="text-[20px] font-black uppercase tracking-[0.1em] m-0">Rúbrica de Éxito</h4>
                        </div>
                        {!isTodo(activeProgresion?.evaluation?.rubric) ? (
                          <p className="text-[17px] text-white/60 leading-[1.65] font-light m-0">
                            {activeProgresion?.evaluation?.rubric}
                          </p>
                        ) : (
                          <p className="text-[14px] text-white/35 italic m-0">Rúbrica pendiente de generación</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Inner sidebar (Ficha Técnica + consejos + CTA) ─────── */}
              <div className="flex flex-col gap-5">

                <div className="bg-white rounded-[2.25rem] p-8 relative overflow-hidden">
                  <div className="absolute bottom-0 right-0 w-20 h-20 bg-[#7DD3FC]/10 rounded-full -mb-8 -mr-8 blur-2xl pointer-events-none" />
                  <div className="relative z-10 flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#0B2545] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#0B2545]/20">
                        <FileText className="w-[18px] h-[18px] text-white" />
                      </div>
                      <h3 className="text-[12px] font-black uppercase tracking-[0.15em] text-[#0B2545] m-0">Ficha Técnica</h3>
                    </div>
                    <div className="flex flex-col gap-5">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4A574] mb-1.5 m-0">Objetivo Pedagógico</p>
                        {!isTodo(activeProgresion?.metadata?.objective) ? (
                          <p className="text-[12px] font-bold text-[#475569] leading-[1.6] m-0">{activeProgresion?.metadata?.objective}</p>
                        ) : (
                          <p className="text-[12px] text-slate-400 italic m-0">Pendiente de generación</p>
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4A574] mb-2 m-0">Competencias</p>
                        {(activeProgresion?.metadata?.competencies ?? []).some((c) => !isTodo(c)) ? (
                          <div className="flex flex-wrap gap-1.5">
                            {activeProgresion!.metadata.competencies.filter((c) => !isTodo(c)).map((c, i) => (
                              <span key={i} className="px-2.5 py-1 bg-slate-50 text-[#0B2545] border border-slate-100 rounded-lg text-[10px] font-black">{c}</span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[12px] text-slate-400 italic m-0">Pendiente de generación</p>
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4A574] mb-2 m-0">Recursos Necesarios</p>
                        {(activeProgresion?.metadata?.materials ?? []).some((m) => !isTodo(m)) ? (
                          <div className="flex flex-col gap-1.5">
                            {activeProgresion!.metadata.materials.filter((m) => !isTodo(m)).map((m, i) => (
                              <div key={i} className="flex items-center gap-2 px-3 py-2 bg-[#F4F1EA]/60 rounded-xl">
                                <div className="w-1.5 h-1.5 bg-[#7DD3FC] rounded-full flex-shrink-0" />
                                <span className="text-[11px] font-bold text-[#0B2545]">{m}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[12px] text-slate-400 italic m-0">Pendiente de generación</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#FEF9F2] rounded-[2.25rem] p-8 border border-[#E8D5B7] relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.07] pointer-events-none">
                    <Lightbulb className="w-14 h-14 text-[#D4A574]" />
                  </div>
                  <div className="relative z-10 flex flex-col gap-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-[#D4A574] rounded-[10px] flex items-center justify-center flex-shrink-0">
                        <Lightbulb className="w-[17px] h-[17px] text-white" />
                      </div>
                      <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-[#0B2545] m-0">Consejo de Expertos</h3>
                    </div>
                    <div className="flex flex-col gap-3">
                      {(activeProgresion?.teacher_tips ?? []).some((t) => !isTodo(t)) ? (
                        activeProgresion!.teacher_tips.filter((t) => !isTodo(t)).map((tip, i) => (
                          <p key={i} className="text-[13px] font-bold text-[#0B2545]/70 leading-[1.6] italic m-0">
                            &ldquo;{tip}&rdquo;
                          </p>
                        ))
                      ) : (
                        <p className="text-[12px] text-[#0B2545]/40 italic m-0">
                          Consejos pedagógicos pendientes de generación
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  className="rounded-[2.25rem] p-8 text-white cursor-pointer hover:scale-[1.02] active:scale-[0.99] motion-safe:transition-transform group"
                  style={{ background: 'linear-gradient(135deg, #0B2545 0%, #1a3a6e 100%)' }}
                >
                  <div className="flex flex-col items-center text-center gap-3.5">
                    <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center group-hover:scale-110 motion-safe:transition-transform">
                      <Monitor className="w-6 h-6 text-[#7DD3FC]" />
                    </div>
                    <h4 className="text-[16px] font-black uppercase tracking-[-0.01em] leading-[1.2] m-0">
                      ¿Listo para proyectar esta sesión?
                    </h4>
                    <p className="text-[12px] text-white/45 font-medium m-0 leading-[1.6]">
                      Inicia el modo interactivo para que tus alumnos sigan la clase en vivo.
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function PendingPlaceholder({ label }: { label: string }) {
  return (
    <div className="px-5 py-4 bg-[#D4A574]/5 rounded-xl border border-dashed border-[#D4A574]/30">
      <p className="text-[12px] text-[#D4A574] font-bold m-0 italic">{label}</p>
    </div>
  );
}

function EmptyContent() {
  return (
    <div className="bg-white rounded-[1.75rem] p-14 text-center text-[#0B2545]/35">
      <GraduationCap className="w-11 h-11 mx-auto mb-4 opacity-25" />
      <p className="text-[14px] font-bold m-0">Contenido pendiente de generación</p>
    </div>
  );
}
