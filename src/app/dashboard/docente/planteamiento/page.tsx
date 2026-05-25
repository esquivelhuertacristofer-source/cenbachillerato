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
  { id: 'estrategia' as ContentTab, label: 'Estrategia',    Icon: Zap         },
  { id: 'teoria'     as ContentTab, label: 'Marco Teórico', Icon: BookOpen    },
  { id: 'evaluacion' as ContentTab, label: 'Evaluación',    Icon: CheckCircle2 },
];

function isTodo(val?: string | null) {
  return !val || val.startsWith('_TODO');
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function PlanteamientoPage() {
  const [selectedUAC, setSelectedUAC] = useState(FIRST_UAC?.codigo ?? 'LC-I');
  const [selectedProgCode, setSelectedProgCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ContentTab>('estrategia');
  const [searchQuery, setSearchQuery] = useState('');

  const progresiones = getPlanUAC(selectedUAC);

  // Derived: si selectedProgCode no está en la lista actual, cae al primero
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

  const phaseColors = ['#D4A574', '#0B2545', '#7DD3FC'];

  return (
    <div
      className="flex min-h-screen font-['Epilogue']"
      style={{ background: '#F4F1EA', color: '#0B2545' }}
    >
      <Sidebar />

      <main className="flex-1 md:ml-[260px] flex flex-col md:flex-row md:h-screen md:overflow-hidden">

        {/* ── LEFT PANEL ─────────────────────────────────────────────────── */}
        <div
          className="hidden md:flex flex-col"
          style={{
            width: 380, flexShrink: 0,
            background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(20px)',
            borderRight: '1px solid rgba(255,255,255,0.5)',
          }}
        >
          {/* Header */}
          <div style={{ padding: '32px 28px 20px', display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Title + UAC selector */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, background: '#0B2545', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ListTodo style={{ width: 20, height: 20, color: '#fff' }} />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#0B2545' }}>Contenido</div>
                  <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8' }}>MCCEMS 2025</div>
                </div>
              </div>

              <div style={{ position: 'relative' }}>
                <select
                  value={selectedUAC}
                  onChange={(e) => handleUACChange(e.target.value)}
                  style={{
                    appearance: 'none', background: '#D4A574', color: '#fff',
                    fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em',
                    padding: '8px 26px 8px 12px', borderRadius: 10, border: 'none',
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
                <div style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-60%) rotate(45deg)', width: 6, height: 6, borderRight: '2px solid #fff', borderBottom: '2px solid #fff', pointerEvents: 'none' }} />
              </div>
            </div>

            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Buscar en el currículo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  paddingLeft: 38, paddingRight: 14, paddingTop: 12, paddingBottom: 12,
                  background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.9)',
                  borderRadius: 14, fontSize: 12, fontWeight: 500, color: '#0B2545', outline: 'none',
                }}
              />
            </div>
          </div>

          {/* UAC label */}
          <div style={{ padding: '0 28px 10px', fontSize: 11, fontWeight: 700, color: 'rgba(11,37,69,0.45)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {currentUACMeta?.nombre}
          </div>

          {/* Progresion list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((prog) => {
              const isActive = activeProgresion?.code === prog.code;
              return (
                <button
                  key={prog.code}
                  onClick={() => { setSelectedProgCode(prog.code); setActiveTab('estrategia'); }}
                  style={{
                    width: '100%', textAlign: 'left', padding: '18px 20px',
                    borderRadius: 22, border: 'none', cursor: 'pointer',
                    background: isActive ? '#0B2545' : '#fff',
                    color: isActive ? '#fff' : '#0B2545',
                    transform: isActive ? 'scale(1.02) translateY(-2px)' : 'scale(1)',
                    boxShadow: isActive ? '0 16px 32px rgba(11,37,69,0.2)' : 'none',
                    transition: 'all 0.2s ease',
                    position: 'relative', overflow: 'hidden',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: isActive ? '#7DD3FC' : '#D4A574' }}>
                      {prog.code}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, opacity: 0.6 }}>
                      <Clock style={{ width: 10, height: 10 }} />
                      <span style={{ fontSize: 9, fontWeight: 700 }}>{prog.duration}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 900, lineHeight: 1.35, letterSpacing: '-0.01em', margin: 0 }}>
                    {prog.title}
                  </p>
                  <div style={{ marginTop: 12, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, opacity: isActive ? 0.4 : 0 }}>
                    Ver planeamiento completo <ArrowRight style={{ width: 10, height: 10 }} />
                  </div>
                </button>
              );
            })}

            {filtered.length === 0 && (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'rgba(11,37,69,0.4)' }}>
                <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>Sin resultados</p>
              </div>
            )}
          </div>
        </div>

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
        <div style={{ flex: 1, overflowY: 'auto', background: '#F4F1EA' }}>

          {/* Sticky nav */}
          <div style={{
            position: 'sticky', top: 0, zIndex: 30,
            background: 'rgba(244,241,234,0.85)', backdropFilter: 'blur(20px)',
            padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderBottom: '1px solid rgba(11,37,69,0.06)',
          }}>
            <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(11,37,69,0.5)' }}>
              Contenido MCCEMS
            </span>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 22px', background: '#0B2545', color: '#fff',
              borderRadius: 12, border: 'none', fontWeight: 900, fontSize: 11,
              textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer',
            }}>
              <Download style={{ width: 14, height: 14, color: '#7DD3FC' }} />
              Exportar
            </button>
          </div>

          <div style={{ padding: 'clamp(16px, 4vw, 48px)', display: 'flex', flexDirection: 'column', gap: 'clamp(24px, 3vw, 48px)' }}>

            {/* ── HERO BENTO ─────────────────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>

              {/* Main title card */}
              <div style={{ background: '#fff', borderRadius: 32, padding: '48px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: 220, height: 220, background: 'rgba(212,165,116,0.18)', borderRadius: '50%', marginRight: -80, marginTop: -80, filter: 'blur(40px)', pointerEvents: 'none' }} />
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ padding: '6px 14px', background: 'rgba(212,165,116,0.12)', color: '#D4A574', borderRadius: 999, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                      {activeProgresion?.level ?? 'MCCEMS 2025'}
                    </span>
                    <span style={{ color: '#d1d5db' }}>·</span>
                    <span style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#94a3b8' }}>
                      {activeProgresion?.code}
                    </span>
                  </div>
                  <h1 style={{ fontSize: 34, fontWeight: 900, color: '#0B2545', lineHeight: 1.15, letterSpacing: '-0.03em', margin: 0 }}>
                    {activeProgresion?.title ?? 'Selecciona una progresión'}
                  </h1>
                  {activeProgresion?.category && !isTodo(activeProgresion.category) && (
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#D4A574' }}>{activeProgresion.category}</span>
                  )}
                </div>
              </div>

              {/* Quick info stack */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ background: '#0B2545', borderRadius: 28, padding: '22px 24px', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>
                  <Clock style={{ width: 22, height: 22, color: '#7DD3FC' }} />
                  <div style={{ marginTop: 16 }}>
                    <p style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', margin: '0 0 4px' }}>Duración</p>
                    <p style={{ fontSize: 16, fontWeight: 900, margin: 0 }}>{activeProgresion?.duration ?? '—'}</p>
                  </div>
                </div>
                <div style={{ background: '#fff', borderRadius: 28, padding: '22px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>
                  <BarChart style={{ width: 22, height: 22, color: '#D4A574' }} />
                  <div style={{ marginTop: 16 }}>
                    <p style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', color: '#94a3b8', margin: '0 0 4px' }}>Dificultad</p>
                    <p style={{ fontSize: 16, fontWeight: 900, color: '#0B2545', margin: 0 }}>{activeProgresion?.difficulty ?? '—'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── TAB NAVIGATION ─────────────────────────────────────────── */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(10px)', padding: 8, borderRadius: 28, border: '1px solid rgba(255,255,255,0.85)', display: 'flex', gap: 8 }}>
                {CONTENT_TABS.map(({ id, label, Icon }) => {
                  const active = activeTab === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '14px 28px', borderRadius: 20, border: 'none', cursor: 'pointer',
                        fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em',
                        background: active ? '#0B2545' : 'transparent',
                        color: active ? '#fff' : '#64748b',
                        transform: active ? 'scale(1.04)' : 'scale(1)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Icon style={{ width: 15, height: 15, color: active ? '#7DD3FC' : '#94a3b8' }} />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── CONTENT GRID ───────────────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32, alignItems: 'start' }}>

              {/* Main content area */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                {/* Estrategia */}
                {activeTab === 'estrategia' && (
                  <>
                    {(activeProgresion?.strategy?.phases ?? []).length > 0 ? (
                      activeProgresion!.strategy.phases.map((phase, i) => (
                        <div key={i} style={{ background: '#fff', borderRadius: 28, padding: '36px 40px', position: 'relative', overflow: 'hidden' }}>
                          <div style={{ position: 'absolute', top: 0, left: 0, width: 6, height: '100%', background: phaseColors[i] ?? '#D4A574' }} />
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                              <div style={{ width: 32, height: 32, borderRadius: 10, background: phaseColors[i] ?? '#D4A574', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 13, flexShrink: 0 }}>
                                {i + 1}
                              </div>
                              <h4 style={{ fontSize: 18, fontWeight: 900, color: '#0B2545', margin: 0, flex: 1 }}>{phase.title}</h4>
                              <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', background: '#f8fafc', padding: '4px 12px', borderRadius: 8, flexShrink: 0 }}>{phase.duration}</span>
                            </div>
                            {!isTodo(phase.description) && (
                              <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.7, margin: 0 }}>{phase.description}</p>
                            )}
                            {!isTodo(phase.activity) && (
                              <div style={{ background: '#F4F1EA', padding: '18px 22px', borderRadius: 18, border: '1px solid rgba(0,0,0,0.05)' }}>
                                <p style={{ fontSize: 10, fontWeight: 900, color: '#D4A574', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 8, margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <Info style={{ width: 12, height: 12 }} /> Actividad Sugerida
                                </p>
                                <p style={{ fontSize: 13, fontWeight: 700, color: '#0B2545', lineHeight: 1.6, margin: 0 }}>{phase.activity}</p>
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

                {/* Teoría */}
                {activeTab === 'teoria' && (
                  <div style={{ background: '#fff', borderRadius: 28, padding: '52px', display: 'flex', flexDirection: 'column', gap: 40 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                      <div style={{ width: 48, height: 4, background: '#7DD3FC', borderRadius: 999 }} />
                      <h2 style={{ fontSize: 30, fontWeight: 900, color: '#0B2545', lineHeight: 1.2, margin: 0 }}>
                        Marco Teórico
                      </h2>
                      {!isTodo(activeProgresion?.theory?.introduction) ? (
                        <p style={{ fontSize: 18, color: '#64748b', fontWeight: 500, lineHeight: 1.65, fontStyle: 'italic', margin: 0 }}>
                          &ldquo;{activeProgresion?.theory?.introduction}&rdquo;
                        </p>
                      ) : (
                        <PendingPlaceholder label="Introducción teórica pendiente de generación" />
                      )}
                    </div>
                    {(activeProgresion?.theory?.sections ?? []).some((s) => !isTodo(s.content)) && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
                        {activeProgresion!.theory.sections.map((section, i) => (
                          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: '#0B2545' }}>
                              0{i + 1}
                            </div>
                            {!isTodo(section.subtitle) && (
                              <h4 style={{ fontSize: 17, fontWeight: 900, color: '#0B2545', margin: 0 }}>{section.subtitle}</h4>
                            )}
                            {!isTodo(section.content) && (
                              <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7, margin: 0 }}>{section.content}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Evaluación */}
                {activeTab === 'evaluacion' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div style={{ background: '#fff', borderRadius: 28, padding: '44px', display: 'flex', flexDirection: 'column', gap: 28 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 22 }}>
                        <h4 style={{ fontSize: 22, fontWeight: 900, color: '#0B2545', margin: 0 }}>Banco de Evaluación</h4>
                        <div style={{ padding: '5px 12px', background: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: 8, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          MCCEMS 2025
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        {(activeProgresion?.evaluation?.exam_questions ?? []).map((q, i) => {
                          const hasContent = !isTodo(q.question) && q.options.every((o) => !isTodo(o));
                          if (!hasContent) return (
                            <PendingPlaceholder key={i} label={`Pregunta ${i + 1} pendiente de generación`} />
                          );
                          return (
                            <div key={i} style={{ padding: '26px', background: '#f8fafc', borderRadius: 22, display: 'flex', flexDirection: 'column', gap: 18 }}>
                              <p style={{ fontSize: 17, fontWeight: 900, color: '#0B2545', margin: 0 }}>
                                <span style={{ color: '#D4A574', marginRight: 10 }}>Q{i + 1}.</span>
                                {q.question}
                              </p>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                {q.options.map((opt, j) => (
                                  <div key={j} style={{ padding: '14px 18px', borderRadius: 12, border: opt === q.correct ? '2px solid rgba(16,185,129,0.3)' : '2px solid transparent', background: opt === q.correct ? 'rgba(16,185,129,0.06)' : '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: opt === q.correct ? '#10b981' : '#d1d5db', flexShrink: 0 }} />
                                    <span style={{ fontSize: 13, fontWeight: 700, color: opt === q.correct ? '#065f46' : '#64748b' }}>{opt}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Rúbrica */}
                    <div style={{ background: '#0B2545', borderRadius: 28, padding: '44px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: 0, right: 0, padding: 36, opacity: 0.08, pointerEvents: 'none' }}>
                        <Target style={{ width: 90, height: 90 }} />
                      </div>
                      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <div style={{ width: 42, height: 42, background: '#7DD3FC', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Target style={{ width: 20, height: 20, color: '#0B2545' }} />
                          </div>
                          <h4 style={{ fontSize: 20, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Rúbrica de Éxito</h4>
                        </div>
                        {!isTodo(activeProgresion?.evaluation?.rubric) ? (
                          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, fontWeight: 400, margin: 0 }}>
                            {activeProgresion?.evaluation?.rubric}
                          </p>
                        ) : (
                          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', fontStyle: 'italic', margin: 0 }}>
                            Rúbrica pendiente de generación
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── SIDEBAR ──────────────────────────────────────────────── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

                {/* Ficha Técnica */}
                <div style={{ background: '#fff', borderRadius: 36, padding: '32px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', bottom: 0, right: 0, width: 80, height: 80, background: 'rgba(125,211,252,0.12)', borderRadius: '50%', marginBottom: -30, marginRight: -30, filter: 'blur(20px)', pointerEvents: 'none' }} />
                  <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, background: '#0B2545', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText style={{ width: 18, height: 18, color: '#fff' }} />
                      </div>
                      <h3 style={{ fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#0B2545', margin: 0 }}>Ficha Técnica</h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                      <div>
                        <p style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#D4A574', margin: '0 0 6px' }}>Objetivo Pedagógico</p>
                        {!isTodo(activeProgresion?.metadata?.objective) ? (
                          <p style={{ fontSize: 12, fontWeight: 700, color: '#475569', lineHeight: 1.6, margin: 0 }}>{activeProgresion?.metadata?.objective}</p>
                        ) : (
                          <p style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>Pendiente de generación</p>
                        )}
                      </div>

                      <div>
                        <p style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#D4A574', margin: '0 0 8px' }}>Competencias</p>
                        {(activeProgresion?.metadata?.competencies ?? []).some((c) => !isTodo(c)) ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {activeProgresion!.metadata.competencies.filter((c) => !isTodo(c)).map((c, i) => (
                              <span key={i} style={{ padding: '3px 9px', background: '#f8fafc', color: '#0B2545', border: '1px solid #f1f5f9', borderRadius: 7, fontSize: 10, fontWeight: 900 }}>{c}</span>
                            ))}
                          </div>
                        ) : (
                          <p style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>Pendiente de generación</p>
                        )}
                      </div>

                      <div>
                        <p style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#D4A574', margin: '0 0 8px' }}>Recursos Necesarios</p>
                        {(activeProgresion?.metadata?.materials ?? []).some((m) => !isTodo(m)) ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                            {activeProgresion!.metadata.materials.filter((m) => !isTodo(m)).map((m, i) => (
                              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: 'rgba(244,241,234,0.5)', borderRadius: 9 }}>
                                <div style={{ width: 6, height: 6, background: '#7DD3FC', borderRadius: '50%', flexShrink: 0 }} />
                                <span style={{ fontSize: 11, fontWeight: 700, color: '#0B2545' }}>{m}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>Pendiente de generación</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Consejo de Expertos */}
                <div style={{ background: '#FEF9F2', borderRadius: 36, padding: '32px', border: '1px solid #E8D5B7', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, padding: 16, opacity: 0.08, pointerEvents: 'none' }}>
                    <Lightbulb style={{ width: 56, height: 56, color: '#D4A574' }} />
                  </div>
                  <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, background: '#D4A574', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Lightbulb style={{ width: 17, height: 17, color: '#fff' }} />
                      </div>
                      <h3 style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#0B2545', margin: 0 }}>Consejo de Expertos</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {(activeProgresion?.teacher_tips ?? []).some((t) => !isTodo(t)) ? (
                        activeProgresion!.teacher_tips.filter((t) => !isTodo(t)).map((tip, i) => (
                          <p key={i} style={{ fontSize: 13, fontWeight: 700, color: 'rgba(11,37,69,0.7)', lineHeight: 1.6, fontStyle: 'italic', margin: 0 }}>
                            &ldquo;{tip}&rdquo;
                          </p>
                        ))
                      ) : (
                        <p style={{ fontSize: 12, color: 'rgba(11,37,69,0.4)', fontStyle: 'italic', margin: 0 }}>
                          Consejos pedagógicos pendientes de generación
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div style={{ background: 'linear-gradient(135deg, #0B2545 0%, #1a3a6e 100%)', borderRadius: 36, padding: '32px', color: '#fff', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 14 }}>
                    <div style={{ width: 52, height: 52, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Monitor style={{ width: 26, height: 26, color: '#7DD3FC' }} />
                    </div>
                    <h4 style={{ fontSize: 17, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 1.2, margin: 0 }}>
                      ¿Listo para proyectar esta sesión?
                    </h4>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 500, margin: 0, lineHeight: 1.6 }}>
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
    <div style={{ padding: '16px 20px', background: 'rgba(212,165,116,0.06)', borderRadius: 12, border: '1px dashed rgba(212,165,116,0.3)' }}>
      <p style={{ fontSize: 12, color: '#D4A574', fontWeight: 700, margin: 0, fontStyle: 'italic' }}>{label}</p>
    </div>
  );
}

function EmptyContent() {
  return (
    <div style={{ background: '#fff', borderRadius: 28, padding: '56px', textAlign: 'center', color: 'rgba(11,37,69,0.35)' }}>
      <GraduationCap style={{ width: 44, height: 44, margin: '0 auto 16px', opacity: 0.25 }} />
      <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Contenido pendiente de generación</p>
    </div>
  );
}
