'use client';

import { useState, useEffect } from 'react';
import type { ProgresionPlan } from '@/lib/schemas/planteamiento.schema';
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
  Sun,
  Moon,
} from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import { PLANTEAMIENTO_CODES, loadUACProgresiones } from '@/data/planteamiento/hub-index';
import { UAC_BASE } from '@/lib/mccems/estructura';

// ── Helpers ────────────────────────────────────────────────────────────────

const UAC_POR_SEMESTRE = [1, 2, 3, 4, 5, 6].map((sem) => ({
  semestre: sem,
  uacs: UAC_BASE.filter((u) => u.semestre === sem && PLANTEAMIENTO_CODES.includes(u.codigo)),
}));

const FIRST_UAC = UAC_BASE.find((u) => PLANTEAMIENTO_CODES.includes(u.codigo));

type ContentTab = 'estrategia' | 'teoria' | 'evaluacion';

const CONTENT_TABS = [
  { id: 'estrategia' as ContentTab, label: 'Estrategia',    Icon: Zap          },
  { id: 'teoria'     as ContentTab, label: 'Marco Teórico', Icon: BookOpen     },
  { id: 'evaluacion' as ContentTab, label: 'Evaluación',    Icon: CheckCircle2 },
];

function isTodo(val?: string | null) {
  return !val || val.startsWith('_TODO');
}

// ── Theme ──────────────────────────────────────────────────────────────────

function buildTheme(dark: boolean) {
  return {
    // ── LEFT PANEL — siempre oscuro, continúa visualmente con el sidebar ──
    rootBg:        dark ? '#011C40'  : '#F4F1EA',
    rootColor:     dark ? '#F4F1EA'  : '#0B2545',
    leftBg:        '#0B2545',
    leftShadow:    'shadow-[16px_0_48px_rgba(0,0,0,0.4)]',
    iconBg:        'bg-white/10',
    labelPrimary:  'text-white',
    labelMuted:    'text-white/40',
    labelSubtle:   'text-white/25',
    sectionBorder: 'border-white/[0.06]',
    inputBg:       'bg-white/10',
    inputBorder:   'border-white/10',
    inputText:     'text-white',
    inputPH:       'placeholder-white/30',
    inputFocus:    'focus:ring-white/20 focus:border-white/30',
    progressTrack: 'bg-white/10',
    activeItem:    'bg-[#D4A574] text-white shadow-[0_0_28px_rgba(212,165,116,0.45),0_16px_32px_rgba(212,165,116,0.25)] scale-[1.02] -translate-y-px',
    inactiveItem:  'bg-white/5 text-white hover:bg-white/10 hover:shadow-md hover:scale-[1.01]',
    activeCode:    'text-white/60',
    stickyBg:      dark ? 'bg-[#011C40]/90'       : 'bg-[#F4F1EA]/85',
    stickyBorder:  dark ? 'border-white/10'       : 'border-[#0B2545]/[0.06]',
    stickyLabel:   dark ? 'text-white/40'         : 'text-[#0B2545]/50',
    exportBtn:     dark ? 'bg-white/10 text-white hover:bg-white/20 border border-white/10' : 'bg-[#0B2545] text-white hover:bg-[#1a3a6e]',
    toggleBtn:     dark ? 'bg-white/10 text-[#D4A574] hover:bg-white/15' : 'bg-[#0B2545]/10 text-[#0B2545] hover:bg-[#0B2545]/20',
    heroCard:      dark ? 'bg-white/5'            : 'bg-white',
    heroGlow:      dark ? 'bg-[#D4A574]/10'       : 'bg-[#D4A574]/15',
    heroTitle:     dark ? 'text-white'            : 'text-[#0B2545]',
    heroCode:      dark ? 'text-white/30'         : 'text-slate-400',
    metaChip:      dark ? 'bg-white/8 text-white/50 border border-white/10' : 'bg-[#0B2545]/[0.06] text-[#0B2545]/55 border border-[#0B2545]/10',
    metaChipGold:  dark ? 'bg-[#D4A574]/20 text-[#D4A574] border border-[#D4A574]/30' : 'bg-[#D4A574]/10 text-[#D4A574] border border-[#D4A574]/20',
    durCard:       dark ? 'bg-white/10'           : 'bg-[#0B2545]',
    diffCard:      dark ? 'bg-white/5'            : 'bg-white',
    diffLabel:     dark ? 'text-white/40'         : 'text-slate-400',
    diffText:      dark ? 'text-white'            : 'text-[#0B2545]',
    tabContainer:  dark ? 'bg-white/5 border-white/10' : 'bg-white/50 border-white/80',
    tabActive:     dark ? 'bg-[#D4A574] text-white shadow-2xl scale-[1.04]' : 'bg-[#0B2545] text-white shadow-2xl scale-[1.04]',
    tabActiveIcon: dark ? 'text-white'            : 'text-[#7DD3FC]',
    tabInactive:   dark ? 'text-white/40 hover:bg-white/10 hover:text-white' : 'bg-transparent text-slate-500 hover:bg-white hover:text-[#0B2545]',
    tabInactiveIcon: dark ? 'text-white/30'       : 'text-slate-400',
    phaseCard:     dark ? 'bg-white/5'            : 'bg-white',
    phaseTitle:    dark ? 'text-white'            : 'text-[#0B2545]',
    phaseDur:      dark ? 'text-white/40 bg-white/5' : 'text-slate-400 bg-slate-50',
    phaseDesc:     dark ? 'text-white/55'         : 'text-[#475569]',
    activityBg:    dark ? 'bg-white/5 border-white/5' : 'bg-[#F4F1EA] border-black/[0.04]',
    activityText:  dark ? 'text-white/70'         : 'text-[#0B2545]',
    theoryCard:    dark ? 'bg-white/5'            : 'bg-white',
    theoryTitle:   dark ? 'text-white'            : 'text-[#0B2545]',
    theoryIntro:   dark ? 'text-white/45'         : 'text-slate-500',
    secNumBg:      dark ? 'bg-white/5 text-white' : 'bg-slate-50 text-[#0B2545]',
    secTitle:      dark ? 'text-white'            : 'text-[#0B2545]',
    secContent:    dark ? 'text-white/50'         : 'text-[#475569]',
    evalCard:      dark ? 'bg-white/5'            : 'bg-white',
    evalTitle:     dark ? 'text-white'            : 'text-[#0B2545]',
    evalBorder:    dark ? 'border-white/10'       : 'border-slate-100',
    evalBadge:     dark ? 'bg-emerald-900/30 text-emerald-300' : 'bg-emerald-50 text-emerald-700',
    qBg:           dark ? 'bg-white/5'            : 'bg-slate-50',
    qText:         dark ? 'text-white'            : 'text-[#0B2545]',
    optDefault:    dark ? 'bg-white/5 border-white/5 text-white/50' : 'bg-white border-transparent text-slate-500',
    optCorrect:    dark
      ? 'bg-emerald-900/30 border-emerald-500/30 text-emerald-300 shadow-[0_8px_16px_rgba(16,185,129,0.08)]'
      : 'bg-emerald-50 border-emerald-500/20 text-emerald-800 shadow-[0_8px_16px_rgba(16,185,129,0.08)]',
    dotDefault:    dark ? 'bg-white/20'           : 'bg-slate-200',
    fichaCard:     dark ? 'bg-white/5'            : 'bg-white',
    fichaGlow:     dark ? 'bg-[#7DD3FC]/5'        : 'bg-[#7DD3FC]/10',
    fichaIconBg:   dark ? 'bg-white/10'           : 'bg-[#0B2545]',
    fichaTitle:    dark ? 'text-white'            : 'text-[#0B2545]',
    fichaVal:      dark ? 'text-white/55'         : 'text-[#475569]',
    fichaEmpty:    dark ? 'text-white/30'         : 'text-slate-400',
    competency:    dark ? 'bg-white/5 text-white border-white/10' : 'bg-slate-50 text-[#0B2545] border-slate-100',
    materialBg:    dark ? 'bg-white/5'            : 'bg-[#F4F1EA]/60',
    materialText:  dark ? 'text-white/70'         : 'text-[#0B2545]',
    consejoBg:     dark ? 'bg-white/5 border-white/5' : 'bg-[#FEF9F2] border-[#E8D5B7]',
    consejoTitle:  dark ? 'text-white'            : 'text-[#0B2545]',
    consejoText:   dark ? 'text-white/45'         : 'text-[#0B2545]/70',
    consejoEmpty:  dark ? 'text-white/25'         : 'text-[#0B2545]/40',
    emptyCard:     dark ? 'bg-white/5'            : 'bg-white',
    emptyText:     dark ? 'text-white/30'         : 'text-[#0B2545]/35',
    pendingBg:     dark
      ? 'bg-[#D4A574]/10 border border-dashed border-[#D4A574]/20'
      : 'bg-[#D4A574]/5 border border-dashed border-[#D4A574]/30',
  };
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function PlanteamientoPage() {
  const [selectedUAC, setSelectedUAC]           = useState(FIRST_UAC?.codigo ?? 'LC-I');
  const [selectedProgCode, setSelectedProgCode] = useState<string | null>(null);
  const [activeTab, setActiveTab]               = useState<ContentTab>('estrategia');
  const [searchQuery, setSearchQuery]           = useState('');
  const [dark, setDark]                         = useState(true);
  const [progresiones, setProgresiones]         = useState<ProgresionPlan[]>([]);

  useEffect(() => {
    let cancelled = false;
    setProgresiones([]);
    loadUACProgresiones(selectedUAC).then((plans) => {
      if (!cancelled) setProgresiones(plans);
    });
    return () => { cancelled = true; };
  }, [selectedUAC]);

  const t = buildTheme(dark);
  const phaseColors = dark
    ? ['#D4A574', '#7DD3FC', 'rgba(255,255,255,0.5)']
    : ['#D4A574', '#0B2545', '#7DD3FC'];

  const activeProgresion = (selectedProgCode
    ? progresiones.find((p) => p.code === selectedProgCode)
    : undefined) ?? progresiones[0];

  const progresionIndex = progresiones.findIndex((p) => p.code === activeProgresion?.code);

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
  const progresionPct  = Math.min(
    Math.round((progresiones.length / (currentUACMeta?.totalProgresionesEsperadas ?? progresiones.length)) * 100),
    100,
  );

  return (
    <div
      className="flex min-h-screen font-['Epilogue'] motion-safe:transition-colors motion-safe:duration-300"
      style={{ background: t.rootBg, color: t.rootColor }}
    >
      {/* ── Cinematic background (dark mode only) ──────────────────────── */}
      {dark && (
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-[1400px] h-[1400px] rounded-full blur-[200px] -mr-80 -mt-80 animate-pulse bg-[#D4A574]/5" />
          <div className="absolute bottom-0 left-[300px] w-[1200px] h-[1200px] rounded-full blur-[180px] -ml-80 -mb-80 bg-[#7DD3FC]/5" />
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '60px 60px' }}
          />
        </div>
      )}

      <Sidebar />

      <main className="flex-1 relative z-[50] flex flex-col md:flex-row md:h-screen md:overflow-hidden">

        {/* ── LEFT PANEL (desktop) ──────────────────────────────────────── */}
        <aside
          className={`hidden md:flex flex-col relative z-[50] ${t.leftShadow} motion-safe:transition-colors motion-safe:duration-300`}
          style={{ width: 'clamp(260px, 26vw, 380px)', flexShrink: 0, background: t.leftBg }}
        >
          {/* Gradient border right — replaces flat border-r */}
          <div
            className="absolute top-0 right-0 w-px h-full pointer-events-none z-20"
            style={{
              background: dark
                ? 'linear-gradient(180deg, #D4A574 0%, rgba(125,211,252,0.35) 38%, rgba(255,255,255,0.04) 100%)'
                : 'linear-gradient(180deg, #D4A574 0%, rgba(11,37,69,0.12) 42%, rgba(11,37,69,0.02) 100%)',
            }}
          />

          {/* Header */}
          <div className="p-7 space-y-5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${t.iconBg} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg motion-safe:transition-colors`}>
                  <ListTodo className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className={`text-[11px] font-black uppercase tracking-[0.15em] ${t.labelPrimary} m-0`}>Contenido</p>
                  <p className={`text-[9px] font-bold uppercase tracking-[0.1em] ${t.labelMuted} m-0`}>MCCEMS 2025</p>
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
              <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${t.labelMuted}`} />
              <input
                type="text"
                placeholder="Buscar en el currículo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 ${t.inputBg} border ${t.inputBorder} rounded-2xl text-[12px] font-medium ${t.inputText} ${t.inputPH} outline-none focus:ring-2 ${t.inputFocus} motion-safe:transition-all`}
              />
            </div>
          </div>

          {/* UAC name + progress bar */}
          <div className={`px-7 pb-3 border-b ${t.sectionBorder} space-y-2.5`}>
            <p className={`text-[11px] font-bold uppercase tracking-[0.06em] ${t.labelSubtle} truncate`}>
              {currentUACMeta?.nombre}
            </p>
            <div className="flex items-center gap-3">
              <div className={`h-0.5 flex-1 rounded-full overflow-hidden ${t.progressTrack}`}>
                <div
                  className="h-full bg-[#D4A574] rounded-full motion-safe:transition-all motion-safe:duration-700"
                  style={{ width: `${progresionPct}%` }}
                />
              </div>
              <span className="text-[9px] font-black text-[#D4A574] tabular-nums whitespace-nowrap">
                {progresiones.length} / {currentUACMeta?.totalProgresionesEsperadas ?? '?'}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2.5 custom-scrollbar">
            {filtered.map((prog, index) => {
              const isActive = activeProgresion?.code === prog.code;
              return (
                <button
                  key={`${selectedUAC}-${prog.code}`}
                  onClick={() => { setSelectedProgCode(prog.code); setActiveTab('estrategia'); }}
                  className={[
                    'w-full text-left px-5 py-[18px] rounded-[22px] border-none cursor-pointer',
                    'motion-safe:transition-all motion-safe:duration-200 relative overflow-hidden',
                    'plan-item-enter',
                    isActive ? t.activeItem : t.inactiveItem,
                  ].join(' ')}
                  style={{ animationDelay: `${index * 38}ms` }}
                >
                  <div className="flex justify-between mb-2 items-center">
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${isActive ? t.activeCode : 'text-[#D4A574]'}`}>
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
              <div className="py-8 text-center">
                <p className={`text-[13px] font-semibold m-0 ${t.labelSubtle}`}>Sin resultados</p>
              </div>
            )}
          </div>
        </aside>

        {/* ── MOBILE: compact UAC + progresión selector ──────────────────── */}
        <div
          className="md:hidden border-b p-4 space-y-3 flex-shrink-0 motion-safe:transition-colors"
          style={{
            background: t.leftBg,
            borderColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(11,37,69,0.08)',
          }}
        >
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
        <div
          className="flex-1 overflow-y-auto custom-scrollbar motion-safe:transition-colors motion-safe:duration-300"
          style={dark ? undefined : { background: '#F4F1EA' }}
        >
          {/* ── HUD Sticky nav ─────────────────────────────────────────── */}
          <div className={`sticky top-0 z-30 border-b flex items-center justify-between px-6 lg:px-12 py-4 backdrop-blur-xl ${t.stickyBg} ${t.stickyBorder}`}>
            <div className="flex items-center gap-4">
              {dark && (
                <>
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full animate-pulse bg-[#D4A574] shadow-[0_0_8px_rgba(212,165,116,0.7)]" />
                    <span className="hidden lg:block text-[10px] font-black uppercase tracking-[0.3em] text-[#D4A574]/60">
                      PLANEAMIENTO ACTIVO
                    </span>
                  </div>
                  <div className="h-4 w-px bg-white/10 hidden lg:block" />
                </>
              )}
              <span className={`text-[11px] font-extrabold uppercase tracking-[0.1em] truncate max-w-[180px] lg:max-w-none ${t.stickyLabel}`}>
                {currentUACMeta?.nombre ?? 'Contenido MCCEMS'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDark((d) => !d)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.1em] cursor-pointer border-none motion-safe:transition-all ${t.toggleBtn}`}
                aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              >
                {dark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{dark ? 'Claro' : 'Oscuro'}</span>
              </button>
              <button className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-[0.1em] cursor-pointer border-none motion-safe:transition-colors ${t.exportBtn}`}>
                <Download className="w-3.5 h-3.5 text-[#7DD3FC]" />
                Exportar
              </button>
            </div>
          </div>

          <div className="p-5 sm:p-8 lg:p-12 flex flex-col gap-8 lg:gap-12">

            {/* ── HERO BENTO ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-5">

              {/* Main title card */}
              <div className={`${t.heroCard} rounded-[2rem] p-8 lg:p-12 relative overflow-hidden motion-safe:transition-colors`}>
                <div className={`absolute top-0 right-0 w-56 h-56 ${t.heroGlow} rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none`} />
                <div className="relative z-10 flex flex-col gap-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="px-3.5 py-1.5 bg-[#D4A574]/10 text-[#D4A574] rounded-full text-[10px] font-black uppercase tracking-[0.15em]">
                      {activeProgresion?.level ?? 'MCCEMS 2025'}
                    </span>
                    <span className={t.labelMuted}>·</span>
                    <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${t.heroCode}`}>
                      {activeProgresion?.code}
                    </span>
                  </div>
                  <h1 className={`text-3xl lg:text-[34px] font-black ${t.heroTitle} leading-[1.15] tracking-[-0.03em] m-0`}>
                    {activeProgresion?.title ?? 'Selecciona una progresión'}
                  </h1>
                  {activeProgresion?.category && !isTodo(activeProgresion.category) && (
                    <span className="text-[13px] font-bold text-[#D4A574]">{activeProgresion.category}</span>
                  )}

                  {/* Metric chips */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {progresionIndex >= 0 && (
                      <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.12em] ${t.metaChipGold}`}>
                        Prog. {progresionIndex + 1} / {progresiones.length}
                      </span>
                    )}
                    {(activeProgresion?.strategy?.phases?.length ?? 0) > 0 && (
                      <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.12em] ${t.metaChip}`}>
                        <Zap className="w-3 h-3" />
                        {activeProgresion!.strategy.phases.length} Fases
                      </span>
                    )}
                    {activeProgresion?.difficulty && !isTodo(activeProgresion.difficulty) && (
                      <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.12em] ${t.metaChip}`}>
                        <BarChart className="w-3 h-3" />
                        {activeProgresion.difficulty}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick info: side-by-side below xl, stacked at xl */}
              <div className="grid grid-cols-2 xl:grid-cols-1 gap-3.5">
                <div className={`${t.durCard} rounded-[1.75rem] p-6 text-white flex flex-col justify-between min-h-[100px] motion-safe:transition-colors`}>
                  <Clock className="w-5 h-5 text-[#7DD3FC]" />
                  <div className="mt-4">
                    <p className="text-[9px] font-black uppercase text-white/40 m-0 mb-1">Duración</p>
                    <p className="text-[17px] font-black m-0">{activeProgresion?.duration ?? '—'}</p>
                  </div>
                </div>
                <div className={`${t.diffCard} rounded-[1.75rem] p-6 flex flex-col justify-between min-h-[100px] motion-safe:transition-colors`}>
                  <BarChart className="w-5 h-5 text-[#D4A574]" />
                  <div className="mt-4">
                    <p className={`text-[9px] font-black uppercase ${t.diffLabel} m-0 mb-1`}>Dificultad</p>
                    <p className={`text-[17px] font-black ${t.diffText} m-0`}>{activeProgresion?.difficulty ?? '—'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── TAB NAVIGATION ─────────────────────────────────────────── */}
            <div className="flex justify-center overflow-x-auto pb-1">
              <div className={`flex-shrink-0 flex gap-2 p-2 rounded-[1.75rem] border backdrop-blur-md shadow-xl motion-safe:transition-colors ${t.tabContainer}`}>
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
                        active ? t.tabActive : t.tabInactive,
                      ].join(' ')}
                    >
                      <Icon className={`w-[15px] h-[15px] ${active ? t.tabActiveIcon : t.tabInactiveIcon}`} />
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
                        <div key={i} className={`${t.phaseCard} rounded-[1.75rem] px-10 py-9 relative overflow-hidden motion-safe:transition-colors`}>
                          {/* Gradient accent stripe */}
                          <div
                            className="absolute top-0 left-0 w-1.5 h-full pointer-events-none"
                            style={{ background: `linear-gradient(to bottom, ${phaseColors[i] ?? '#D4A574'}, transparent)` }}
                          />
                          <div className="flex flex-col gap-5">
                            <div className="flex items-center gap-3 flex-wrap">
                              {/* Enlarged phase badge */}
                              <div
                                className="w-10 h-10 rounded-[12px] flex items-center justify-center text-white font-black text-[16px] flex-shrink-0 shadow-lg"
                                style={{ background: phaseColors[i] ?? '#D4A574' }}
                              >
                                {i + 1}
                              </div>
                              <h4 className={`text-[18px] font-black ${t.phaseTitle} m-0 flex-1`}>{phase.title}</h4>
                              <span className={`text-[12px] font-bold px-3 py-1 rounded-lg flex-shrink-0 ${t.phaseDur}`}>{phase.duration}</span>
                            </div>
                            {!isTodo(phase.description) && (
                              <p className={`text-[15px] ${t.phaseDesc} leading-[1.7] m-0`}>{phase.description}</p>
                            )}
                            {!isTodo(phase.activity) && (
                              <div className={`px-5 py-4 rounded-[1.1rem] border ${t.activityBg}`}>
                                <p className="text-[10px] font-black text-[#D4A574] uppercase tracking-[0.2em] mb-2 m-0 flex items-center gap-1.5">
                                  <Info className="w-3 h-3" /> Actividad Sugerida
                                </p>
                                <p className={`text-[13px] font-bold ${t.activityText} leading-[1.6] m-0`}>{phase.activity}</p>
                              </div>
                            )}
                            {isTodo(phase.description) && (
                              <PendingPlaceholder label="Contenido de esta fase pendiente de generación" pendingBg={t.pendingBg} />
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <EmptyContent emptyCard={t.emptyCard} emptyText={t.emptyText} />
                    )}
                  </>
                )}

                {activeTab === 'teoria' && (
                  <div className={`${t.theoryCard} rounded-[1.75rem] p-10 lg:p-14 flex flex-col gap-10 motion-safe:transition-colors`}>
                    <div className="flex flex-col gap-5">
                      <div className="w-16 h-1 bg-[#7DD3FC] rounded-full" />
                      <h2 className={`text-3xl font-black ${t.theoryTitle} leading-[1.2] m-0`}>Marco Teórico</h2>
                      {!isTodo(activeProgresion?.theory?.introduction) ? (
                        <p className={`text-[17px] ${t.theoryIntro} font-medium leading-[1.65] italic m-0`}>
                          &ldquo;{activeProgresion?.theory?.introduction}&rdquo;
                        </p>
                      ) : (
                        <PendingPlaceholder label="Introducción teórica pendiente de generación" pendingBg={t.pendingBg} />
                      )}
                    </div>
                    {(activeProgresion?.theory?.sections ?? []).some((s) => !isTodo(s.content)) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
                        {activeProgresion!.theory.sections.map((section, i) => (
                          <div key={i} className="flex flex-col gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[12px] font-black ${t.secNumBg}`}>
                              0{i + 1}
                            </div>
                            {!isTodo(section.subtitle) && (
                              <h4 className={`text-[17px] font-black ${t.secTitle} m-0`}>{section.subtitle}</h4>
                            )}
                            {!isTodo(section.content) && (
                              <p className={`text-[14px] ${t.secContent} leading-[1.7] m-0`}>{section.content}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'evaluacion' && (
                  <div className="flex flex-col gap-6">
                    <div className={`${t.evalCard} rounded-[1.75rem] p-8 lg:p-11 flex flex-col gap-7 motion-safe:transition-colors`}>
                      <div className={`flex items-center justify-between border-b ${t.evalBorder} pb-6`}>
                        <h4 className={`text-[22px] font-black ${t.evalTitle} m-0`}>Banco de Evaluación</h4>
                        <div className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.08em] ${t.evalBadge}`}>
                          MCCEMS 2025
                        </div>
                      </div>
                      <div className="flex flex-col gap-5">
                        {(activeProgresion?.evaluation?.exam_questions ?? []).map((q, i) => {
                          const hasContent = !isTodo(q.question) && q.options.every((o) => !isTodo(o));
                          if (!hasContent) return (
                            <PendingPlaceholder key={i} label={`Pregunta ${i + 1} pendiente de generación`} pendingBg={t.pendingBg} />
                          );
                          return (
                            <div key={i} className={`p-7 ${t.qBg} rounded-[1.5rem] flex flex-col gap-5`}>
                              <p className={`text-[17px] font-black ${t.qText} m-0`}>
                                <span className="text-[#D4A574] mr-2.5">Q{i + 1}.</span>
                                {q.question}
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {q.options.map((opt, j) => (
                                  <div
                                    key={j}
                                    className={`px-4 py-3.5 rounded-xl border-2 flex items-center gap-2.5 ${
                                      opt === q.correct ? t.optCorrect : t.optDefault
                                    }`}
                                  >
                                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${opt === q.correct ? 'bg-emerald-500' : t.dotDefault}`} />
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

                <div className={`${t.fichaCard} rounded-[2.25rem] p-8 relative overflow-hidden motion-safe:transition-colors`}>
                  <div className={`absolute bottom-0 right-0 w-20 h-20 ${t.fichaGlow} rounded-full -mb-8 -mr-8 blur-2xl pointer-events-none`} />
                  <div className="relative z-10 flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${t.fichaIconBg} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg motion-safe:transition-colors`}>
                        <FileText className="w-[18px] h-[18px] text-white" />
                      </div>
                      <h3 className={`text-[12px] font-black uppercase tracking-[0.15em] ${t.fichaTitle} m-0`}>Ficha Técnica</h3>
                    </div>
                    <div className="flex flex-col gap-5">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4A574] mb-1.5 m-0">Objetivo Pedagógico</p>
                        {!isTodo(activeProgresion?.metadata?.objective) ? (
                          <p className={`text-[12px] font-bold ${t.fichaVal} leading-[1.6] m-0`}>{activeProgresion?.metadata?.objective}</p>
                        ) : (
                          <p className={`text-[12px] ${t.fichaEmpty} italic m-0`}>Pendiente de generación</p>
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4A574] mb-2 m-0">Competencias</p>
                        {(activeProgresion?.metadata?.competencies ?? []).some((c) => !isTodo(c)) ? (
                          <div className="flex flex-wrap gap-1.5">
                            {activeProgresion!.metadata.competencies.filter((c) => !isTodo(c)).map((c, i) => (
                              <span key={i} className={`px-2.5 py-1 border rounded-lg text-[10px] font-black ${t.competency}`}>{c}</span>
                            ))}
                          </div>
                        ) : (
                          <p className={`text-[12px] ${t.fichaEmpty} italic m-0`}>Pendiente de generación</p>
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4A574] mb-2 m-0">Recursos Necesarios</p>
                        {(activeProgresion?.metadata?.materials ?? []).some((m) => !isTodo(m)) ? (
                          <div className="flex flex-col gap-1.5">
                            {activeProgresion!.metadata.materials.filter((m) => !isTodo(m)).map((m, i) => (
                              <div key={i} className={`flex items-center gap-2 px-3 py-2 ${t.materialBg} rounded-xl`}>
                                <div className="w-1.5 h-1.5 bg-[#7DD3FC] rounded-full flex-shrink-0" />
                                <span className={`text-[11px] font-bold ${t.materialText}`}>{m}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className={`text-[12px] ${t.fichaEmpty} italic m-0`}>Pendiente de generación</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`rounded-[2.25rem] p-8 border relative overflow-hidden motion-safe:transition-colors ${t.consejoBg}`}>
                  <div className="absolute top-0 right-0 p-4 opacity-[0.07] pointer-events-none">
                    <Lightbulb className="w-14 h-14 text-[#D4A574]" />
                  </div>
                  <div className="relative z-10 flex flex-col gap-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-[#D4A574] rounded-[10px] flex items-center justify-center flex-shrink-0">
                        <Lightbulb className="w-[17px] h-[17px] text-white" />
                      </div>
                      <h3 className={`text-[11px] font-black uppercase tracking-[0.15em] ${t.consejoTitle} m-0`}>Consejo de Expertos</h3>
                    </div>
                    <div className="flex flex-col gap-3">
                      {(activeProgresion?.teacher_tips ?? []).some((tip) => !isTodo(tip)) ? (
                        activeProgresion!.teacher_tips.filter((tip) => !isTodo(tip)).map((tip, i) => (
                          <p key={i} className={`text-[13px] font-bold ${t.consejoText} leading-[1.6] italic m-0`}>
                            &ldquo;{tip}&rdquo;
                          </p>
                        ))
                      ) : (
                        <p className={`text-[12px] ${t.consejoEmpty} italic m-0`}>
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

function PendingPlaceholder({ label, pendingBg }: { label: string; pendingBg: string }) {
  return (
    <div className={`px-5 py-4 rounded-xl ${pendingBg}`}>
      <p className="text-[12px] text-[#D4A574] font-bold m-0 italic">{label}</p>
    </div>
  );
}

function EmptyContent({ emptyCard, emptyText }: { emptyCard: string; emptyText: string }) {
  return (
    <div className={`${emptyCard} rounded-[1.75rem] p-14 text-center motion-safe:transition-colors`}>
      <GraduationCap className={`w-11 h-11 mx-auto mb-4 opacity-25 ${emptyText}`} />
      <p className={`text-[14px] font-bold m-0 ${emptyText}`}>Contenido pendiente de generación</p>
    </div>
  );
}
