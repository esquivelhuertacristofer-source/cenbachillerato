'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Target,
  Zap,
  BookOpen,
  CheckCircle2,
  Lightbulb,
  GraduationCap,
} from 'lucide-react';
import type { ProgresionPlan } from '@/lib/schemas/planteamiento.schema';

function isTodo(val?: string | null) {
  return !val || val.startsWith('_TODO');
}

// ── Slide model ──────────────────────────────────────────────────────────────

type Slide =
  | { kind: 'cover' }
  | { kind: 'phase'; idx: number; total: number; title: string; duration: string; description: string; activity: string }
  | { kind: 'theory-intro'; text: string }
  | { kind: 'theory-section'; subtitle: string; content: string }
  | { kind: 'question'; idx: number; total: number; question: string; options: string[]; correct: string }
  | { kind: 'rubric'; text: string }
  | { kind: 'tips'; tips: string[] }
  | { kind: 'end' };

function buildSlides(prog: ProgresionPlan): Slide[] {
  const slides: Slide[] = [{ kind: 'cover' }];

  const phases = (prog.strategy?.phases ?? []).filter((p) => !isTodo(p.title) || !isTodo(p.description));
  phases.forEach((p, i) =>
    slides.push({
      kind: 'phase',
      idx: i + 1,
      total: phases.length,
      title: p.title,
      duration: p.duration,
      description: p.description,
      activity: p.activity,
    }),
  );

  if (!isTodo(prog.theory?.introduction)) slides.push({ kind: 'theory-intro', text: prog.theory.introduction });
  (prog.theory?.sections ?? [])
    .filter((s) => !isTodo(s.content))
    .forEach((s) => slides.push({ kind: 'theory-section', subtitle: s.subtitle, content: s.content }));

  const questions = (prog.evaluation?.exam_questions ?? []).filter((q) => !isTodo(q.question));
  questions.forEach((q, i) =>
    slides.push({ kind: 'question', idx: i + 1, total: questions.length, question: q.question, options: q.options, correct: q.correct }),
  );
  if (!isTodo(prog.evaluation?.rubric)) slides.push({ kind: 'rubric', text: prog.evaluation.rubric });

  const tips = (prog.teacher_tips ?? []).filter((tp) => !isTodo(tp));
  if (tips.length) slides.push({ kind: 'tips', tips });

  slides.push({ kind: 'end' });
  return slides;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function PresentationMode({ prog, onClose }: { prog: ProgresionPlan; onClose: () => void }) {
  const slides = useMemo(() => buildSlides(prog), [prog]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const slide = slides[index];
  const atEnd = index >= slides.length - 1;
  const isQuestion = slide?.kind === 'question';

  const next = useCallback(() => {
    // En preguntas, el primer avance revela la respuesta; el segundo cambia de slide.
    setRevealed((r) => {
      if (isQuestion && !r) return true;
      setIndex((i) => Math.min(i + 1, slides.length - 1));
      return false;
    });
  }, [isQuestion, slides.length]);

  const prev = useCallback(() => {
    setRevealed(false);
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  // Fullscreen real del navegador al montar.
  useEffect(() => {
    const el = containerRef.current;
    el?.requestFullscreen?.().catch(() => {});
    return () => {
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    };
  }, []);

  // Salir si el usuario abandona fullscreen (Esc del navegador).
  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement) onClose();
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, [onClose]);

  // Teclado.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        prev();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev, onClose]);

  const progressPct = ((index + 1) / slides.length) * 100;

  return (
    <div
      ref={containerRef}
      onClick={next}
      className="fixed inset-0 z-[100] flex flex-col font-['Epilogue'] text-[#F4F1EA] cursor-pointer select-none overflow-hidden"
      style={{ background: 'radial-gradient(circle at 70% 20%, #12305f 0%, #0B2545 45%, #011C40 100%)' }}
    >
      {/* Glow ambiental */}
      <div className="absolute top-0 right-0 w-[900px] h-[900px] rounded-full blur-[200px] -mr-60 -mt-60 bg-[#D4A574]/10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] rounded-full blur-[180px] -ml-60 -mb-60 bg-[#7DD3FC]/10 pointer-events-none" />

      {/* Barra de progreso */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 z-20">
        <div className="h-full bg-gradient-to-r from-[#D4A574] to-[#7DD3FC] motion-safe:transition-all motion-safe:duration-300" style={{ width: `${progressPct}%` }} />
      </div>

      {/* Top bar */}
      <div className="relative z-20 flex items-center justify-between px-10 pt-8">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#D4A574]">{prog.code}</span>
          <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/40">{prog.level}</span>
        </div>
        <div className="flex items-center gap-5">
          <span className="text-[12px] font-bold tabular-nums text-white/40">
            {index + 1} / {slides.length}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            aria-label="Salir de la presentación"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center motion-safe:transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-8 sm:px-16 lg:px-28">
        <div key={index} className="w-full max-w-5xl motion-safe:animate-[fadeIn_0.4s_ease]">
          {slide && <SlideBody slide={slide} prog={prog} revealed={revealed} />}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative z-20 flex items-center justify-between px-10 pb-8">
        <button
          onClick={(e) => { e.stopPropagation(); prev(); }}
          disabled={index === 0}
          aria-label="Anterior"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-25 disabled:cursor-not-allowed text-[11px] font-black uppercase tracking-[0.1em] motion-safe:transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Atrás
        </button>

        <span className="hidden sm:block text-[10px] font-semibold uppercase tracking-[0.15em] text-white/25">
          {isQuestion && !revealed ? 'Espacio para revelar respuesta' : '← →  para navegar    ·    Esc para salir'}
        </span>

        <button
          onClick={(e) => { e.stopPropagation(); next(); }}
          disabled={atEnd && !(isQuestion && !revealed)}
          aria-label="Siguiente"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D4A574] text-[#0B2545] hover:brightness-110 disabled:opacity-25 disabled:cursor-not-allowed text-[11px] font-black uppercase tracking-[0.1em] motion-safe:transition-all"
        >
          {isQuestion && !revealed ? 'Revelar' : 'Siguiente'} <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}

// ── Slide bodies ─────────────────────────────────────────────────────────────

function SlideBody({ slide, prog, revealed }: { slide: Slide; prog: ProgresionPlan; revealed: boolean }) {
  switch (slide.kind) {
    case 'cover':
      return (
        <div className="text-center flex flex-col items-center gap-7">
          <div className="w-20 h-20 rounded-3xl bg-[#D4A574]/15 flex items-center justify-center">
            <GraduationCap className="w-10 h-10 text-[#D4A574]" />
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-[13px] font-black uppercase tracking-[0.25em] text-[#7DD3FC]">{prog.code}</span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] tracking-[-0.02em] m-0">{prog.title}</h1>
          </div>
          {!isTodo(prog.metadata?.objective) && (
            <p className="text-lg sm:text-xl text-white/55 font-medium leading-[1.5] max-w-3xl m-0">{prog.metadata.objective}</p>
          )}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
            {[
              !isTodo(prog.duration) ? prog.duration : null,
              !isTodo(prog.difficulty) ? prog.difficulty : null,
              !isTodo(prog.category) ? prog.category : null,
            ]
              .filter(Boolean)
              .map((chip, i) => (
                <span key={i} className="px-4 py-2 rounded-full bg-white/8 text-[13px] font-bold text-white/70">{chip}</span>
              ))}
          </div>
        </div>
      );

    case 'phase':
      return (
        <SlideShell icon={Zap} label={`Estrategia · Fase ${slide.idx} de ${slide.total}`}>
          <div className="flex items-baseline justify-between gap-6 flex-wrap">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-[1.1] tracking-[-0.02em] m-0">{slide.title}</h2>
            {!isTodo(slide.duration) && (
              <span className="px-4 py-2 rounded-full bg-[#D4A574]/15 text-[#D4A574] text-[14px] font-black whitespace-nowrap">{slide.duration}</span>
            )}
          </div>
          {!isTodo(slide.description) && (
            <p className="text-xl sm:text-2xl text-white/70 font-medium leading-[1.55] m-0">{slide.description}</p>
          )}
          {!isTodo(slide.activity) && (
            <div className="mt-2 px-6 py-5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[11px] font-black uppercase tracking-[0.15em] text-[#7DD3FC]">Actividad</span>
              <p className="text-lg sm:text-xl text-white/80 font-medium leading-[1.5] mt-2 mb-0">{slide.activity}</p>
            </div>
          )}
        </SlideShell>
      );

    case 'theory-intro':
      return (
        <SlideShell icon={BookOpen} label="Marco Teórico">
          <p className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-[1.4] tracking-[-0.01em] text-white/90 m-0">
            &ldquo;{slide.text}&rdquo;
          </p>
        </SlideShell>
      );

    case 'theory-section':
      return (
        <SlideShell icon={BookOpen} label="Marco Teórico">
          {!isTodo(slide.subtitle) && (
            <h2 className="text-3xl sm:text-4xl font-black leading-[1.1] tracking-[-0.02em] m-0">{slide.subtitle}</h2>
          )}
          <p className="text-xl sm:text-2xl text-white/70 font-medium leading-[1.55] m-0">{slide.content}</p>
        </SlideShell>
      );

    case 'question': {
      return (
        <SlideShell icon={CheckCircle2} label={`Evaluación · Pregunta ${slide.idx} de ${slide.total}`}>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-[1.2] tracking-[-0.01em] m-0">{slide.question}</h2>
          <div className="flex flex-col gap-3 mt-2">
            {slide.options.map((opt, oi) => {
              const correct = opt === slide.correct;
              const highlight = revealed && correct;
              return (
                <div
                  key={oi}
                  className={`flex items-center gap-4 px-6 py-4 rounded-2xl border motion-safe:transition-all motion-safe:duration-300 ${
                    highlight
                      ? 'bg-[#D4A574]/20 border-[#D4A574] scale-[1.01]'
                      : revealed
                        ? 'bg-white/5 border-white/10 opacity-45'
                        : 'bg-white/5 border-white/10'
                  }`}
                >
                  <span className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-[14px] font-black ${highlight ? 'bg-[#D4A574] text-[#0B2545]' : 'bg-white/10 text-white/70'}`}>
                    {String.fromCharCode(97 + oi)}
                  </span>
                  <span className={`text-lg sm:text-xl font-medium ${highlight ? 'text-white' : 'text-white/80'}`}>{opt}</span>
                  {highlight && <CheckCircle2 className="w-6 h-6 text-[#D4A574] ml-auto shrink-0" />}
                </div>
              );
            })}
          </div>
        </SlideShell>
      );
    }

    case 'rubric':
      return (
        <SlideShell icon={Target} label="Evaluación · Rúbrica">
          <p className="text-xl sm:text-2xl text-white/80 font-medium leading-[1.55] m-0">{slide.text}</p>
        </SlideShell>
      );

    case 'tips':
      return (
        <SlideShell icon={Lightbulb} label="Recomendaciones para el Docente">
          <ul className="flex flex-col gap-4 m-0 p-0 list-none">
            {slide.tips.map((tp, i) => (
              <li key={i} className="flex items-start gap-4">
                <span className="w-7 h-7 mt-1 shrink-0 rounded-full bg-[#7DD3FC]/15 text-[#7DD3FC] flex items-center justify-center text-[13px] font-black">{i + 1}</span>
                <span className="text-lg sm:text-xl text-white/75 font-medium leading-[1.5]">{tp}</span>
              </li>
            ))}
          </ul>
        </SlideShell>
      );

    case 'end':
      return (
        <div className="text-center flex flex-col items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-[#7DD3FC]/15 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-[#7DD3FC]" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-[-0.02em] m-0">Fin de la sesión</h1>
          <p className="text-lg text-white/50 font-medium m-0">{prog.title}</p>
          <span className="text-[12px] font-semibold uppercase tracking-[0.15em] text-white/25 mt-2">Presiona Esc para salir</span>
        </div>
      );
  }
}

function SlideShell({ icon: Icon, label, children }: { icon: typeof Zap; label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-[#D4A574]" />
        </div>
        <span className="text-[12px] font-black uppercase tracking-[0.2em] text-white/45">{label}</span>
      </div>
      {children}
    </div>
  );
}
