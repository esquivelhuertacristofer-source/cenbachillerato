'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Sidebar from '@/components/dashboard/Sidebar';
import { UAC_BASE } from '@/lib/mccems/estructura';
import {
  BookOpen,
  ChevronRight,
  ArrowLeft,
  Library,
  ArrowRight,
  Sparkles,
  Activity,
  GraduationCap,
} from 'lucide-react';

const SEMESTRES = [
  { num: 1, title: 'Primer Semestre', desc: 'Lengua y Comunicación, Pensamiento Matemático, Ciencias Naturales y Ciencias Sociales — fundamentos del bachillerato MCCEMS.', color: 'from-[#011C40] to-[#0B2545]', accent: '#D4A574', image: '/1.webp', fade: '#011C40' },
  { num: 2, title: 'Segundo Semestre', desc: 'Continuación de los recursos sociocognitivos fundamentales con nuevos saberes y progresiones de aprendizaje.', color: 'from-[#0B2545] to-[#1E40AF]', accent: '#7DD3FC', image: '/Imagenes carrusel/7.webp', fade: '#0B2545' },
  { num: 3, title: 'Tercer Semestre', desc: 'Profundización en Lengua, Matemáticas y Humanidades. Inicio de las áreas de conocimiento del Currículum Fundamental Extendido.', color: 'from-[#1E40AF] to-[#1e3a8a]', accent: '#D4A574', image: '/Imagenes carrusel/9.webp', fade: '#1E40AF' },
  { num: 4, title: 'Cuarto Semestre', desc: 'Saberes avanzados y progresiones de mayor complejidad cognitiva. Vinculación con contextos reales y socioemocionales.', color: 'from-[#7c3aed] to-[#6d28d9]', accent: '#7DD3FC', image: '/4.webp', fade: '#7c3aed' },
  { num: 5, title: 'Quinto Semestre', desc: 'UAC del Currículum Fundamental Extendido y Ampliado. Preparación para el egreso y acceso a educación superior.', color: 'from-[#0e7490] to-[#0369a1]', accent: '#D4A574', image: '/Imagenes carrusel/11.webp', fade: '#0e7490' },
  { num: 6, title: 'Sexto Semestre', desc: 'Cierre del trayecto formativo MCCEMS. Integración de saberes, metacognición y vinculación con la vida personal y social.', color: 'from-[#065f46] to-[#047857]', accent: '#7DD3FC', image: '/6.webp', fade: '#065f46' },
];

export default function ModulosPage() {
  const [selectedSemestre, setSelectedSemestre] = useState<number | null>(null);

  const uacsForSemestre = selectedSemestre
    ? UAC_BASE.filter((u) => u.semestre === selectedSemestre).sort((a, b) => a.orden - b.orden)
    : [];

  return (
    <div className="flex min-h-screen font-['Epilogue'] relative overflow-hidden bg-[#011C40] theme-dark">

      {/* Cinematic background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[1400px] h-[1400px] rounded-full blur-[200px] -mr-80 -mt-80 animate-pulse bg-[#D4A574]/5 opacity-100" />
        <div className="absolute bottom-0 left-[300px] w-[1200px] h-[1200px] rounded-full blur-[180px] -ml-80 -mb-80 bg-[#7DD3FC]/5 opacity-100" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '60px 60px' }}
        />
      </div>

      <Sidebar />

      <main className="flex-1 relative z-10 custom-scrollbar md:overflow-y-auto md:h-screen flex flex-col">

        {/* HUD Status Bar */}
        <div className="sticky top-0 z-50 backdrop-blur-3xl border-b px-4 sm:px-8 md:pr-12 md:pl-6 py-4 flex items-center justify-between bg-[#011C40]/80 border-white/5 shadow-2xl">
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 rounded-full animate-pulse shadow-[0_0_15px_rgba(212,165,116,0.5)] bg-[#D4A574]" />
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white/50">CURRÍCULUM MCCEMS</span>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div className="hidden xl:flex items-center gap-3">
              <Library className="w-4 h-4 text-[#7DD3FC]" />
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/30">UAC Cargadas</span>
                <span className="text-[10px] font-black leading-none text-white">{UAC_BASE.length} Unidades</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl border bg-white/5 border-white/10">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/50">CEN Bachillerato MCCEMS</span>
          </div>
        </div>

        {/* Main content */}
        <div className="p-4 sm:p-8 md:pt-12 md:pr-12 md:pb-12 md:pl-0 space-y-8 lg:space-y-16 flex-1">

          {!selectedSemestre ? (
            <div className="space-y-12 lg:space-y-24">

              {/* Header */}
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter leading-none text-white">
                  Módulos <span className="italic font-sans text-[#D4A574]">CEN</span>
                </h1>
                <p className="text-lg font-medium max-w-xl text-white/40">
                  Explora los semestres del Plan de Estudios 2022 MCCEMS. Selecciona un semestre para ver sus UAC.
                </p>
              </div>

              {/* Semestre grid */}
              <section className="space-y-10">
                <div className="flex items-center gap-4">
                  <h2 className="text-4xl font-black tracking-tighter text-white">
                    Trayecto <span className="text-[#D4A574]">Formativo</span>
                  </h2>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 pb-20">
                  {SEMESTRES.map((sem, i) => {
                    const uacCount = UAC_BASE.filter((u) => u.semestre === sem.num).length;
                    return (
                      <div
                        key={sem.num}
                        onClick={() => setSelectedSemestre(sem.num)}
                        className="group relative h-[400px] rounded-[3.5rem] overflow-hidden shadow-2xl transition-all duration-700 hover:-translate-y-4 cursor-pointer hover:shadow-[0_40px_90px_rgba(212,165,116,0.2)]"
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
                        {/* Fondo gradiente del card */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${sem.color}`} />

                        {/* Imagen mitad derecha */}
                        <div className="absolute right-0 top-0 bottom-0 w-[55%]">
                          <Image
                            src={sem.image}
                            alt={sem.title}
                            fill
                            className="object-cover object-center"
                            sizes="(max-width: 768px) 50vw, 25vw"
                          />
                          {/* Degradado muy fuerte — sin corte visible */}
                          <div
                            className="absolute inset-0"
                            style={{ background: `linear-gradient(to right, ${sem.fade} 0%, ${sem.fade}dd 15%, ${sem.fade}99 30%, ${sem.fade}44 50%, transparent 65%)` }}
                          />
                        </div>

                        {/* Contenido — mitad izquierda */}
                        <div className="absolute inset-0 p-10 flex flex-col justify-between z-10 text-white">
                          <div className="flex items-start justify-between">
                            <div className="px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl text-[#011C40]" style={{ background: sem.accent }}>
                              {sem.num}° Semestre
                            </div>
                            <span className="text-5xl font-black tracking-tighter opacity-20 group-hover:opacity-60 transition-opacity">{sem.num}°</span>
                          </div>
                          <div className="space-y-5 max-w-[55%]">
                            <div>
                              <h3 className="text-2xl font-black tracking-tighter leading-tight mb-3 group-hover:translate-x-1 transition-transform">{sem.title}</h3>
                              <p className="text-xs text-white/60 font-medium leading-relaxed line-clamp-3">{sem.desc}</p>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-white/10">
                              <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: sem.accent }}>{uacCount} UAC</p>
                              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" style={{ color: sem.accent }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          ) : (
            /* UAC detail view */
            <div className="space-y-12">
              <div className="flex items-center justify-between bg-white/5 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/5">
                <button
                  onClick={() => setSelectedSemestre(null)}
                  className="flex items-center gap-4 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 bg-white text-[#011C40] hover:bg-[#D4A574] hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Todos los Semestres
                </button>
                <div className="flex items-center gap-6 pr-6">
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-2 text-white/30">Semestre Seleccionado</p>
                    <p className="text-3xl font-black leading-none tracking-tighter text-white">
                      {SEMESTRES.find((s) => s.num === selectedSemestre)?.title}
                    </p>
                  </div>
                  <div className="h-12 w-2 bg-[#D4A574] rounded-full shadow-[0_0_15px_rgba(212,165,116,0.5)]" />
                </div>
              </div>

              {/* UAC header card */}
              <div className="rounded-[3.5rem] p-12 relative overflow-hidden shadow-2xl bg-gradient-to-br from-[#011C40] to-[#0B2545] border border-white/5">
                <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
                  <BookOpen className="w-48 h-48" />
                </div>
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-5">
                    <GraduationCap className="w-12 h-12 text-[#D4A574]" />
                    <div className="h-10 w-px bg-white/20" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Plan de Estudios 2022 · MCCEMS</p>
                      <h4 className="text-3xl font-black tracking-tighter text-white">{uacsForSemestre.length} Unidades de Aprendizaje Curricular</h4>
                    </div>
                  </div>
                  <p className="text-white/60 text-sm font-medium leading-relaxed max-w-2xl">
                    Las UAC están diseñadas bajo el esquema <span className="text-[#D4A574] font-black">MCCEMS</span> para garantizar la excelencia pedagógica a través de las 4 dimensiones del aprendizaje.
                  </p>
                </div>
              </div>

              {/* UAC list */}
              <div className="space-y-6 pb-20">
                {uacsForSemestre.length === 0 ? (
                  <div className="h-64 rounded-[4rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-4">
                    <Sparkles className="w-12 h-12 text-white/20" />
                    <p className="text-white/30 font-black uppercase tracking-widest text-sm">Sin UAC registradas para este semestre</p>
                  </div>
                ) : (
                  uacsForSemestre.map((uac, i) => (
                    <div
                      key={uac.codigo}
                      className="rounded-[3rem] p-10 border transition-all duration-700 group bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
                      style={{ animationDelay: `${i * 80}ms` }}
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                        <div className="space-y-6 flex-1">
                          <div className="flex items-center gap-4">
                            <span className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-[#D4A574]/10 text-[#D4A574]">
                              {uac.codigo}
                            </span>
                            <h5 className="text-2xl font-black tracking-tighter text-white group-hover:translate-x-2 transition-transform">
                              {uac.nombre}
                            </h5>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border bg-[#7DD3FC]/10 text-[#7DD3FC] border-[#7DD3FC]/20">
                              <Activity className="h-4 w-4" />
                              {uac.totalProgresionesEsperadas} Progresiones
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border bg-white/5 text-white/40 border-white/10">
                              <Library className="h-4 w-4" />
                              {uac.componenteCodigo}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-1">Semestre</p>
                            <p className="text-4xl font-black text-white leading-none">{uac.semestre}°</p>
                          </div>
                          <button className="px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 bg-white text-[#011C40] hover:bg-[#D4A574] hover:text-white">
                            Ver UAC
                            <ChevronRight className="inline w-4 h-4 ml-2" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
