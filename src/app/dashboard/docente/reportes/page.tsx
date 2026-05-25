'use client';

import React, { useEffect, useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import {
  PieChart,
  Target,
  Download,
  Calendar,
  Sparkles,
  Zap,
  ShieldCheck,
  Activity,
} from 'lucide-react';

export default function ReportesPage() {
  const [teacherName, setTeacherName] = useState<string | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const sb = getSupabaseBrowser();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { router.push('/log-in'); return; }
      const { data: profile } = await sb.from('profiles').select('full_name').eq('id', user.id).single();
      setTeacherName(profile?.full_name ?? undefined);
    };
    void init();
  }, [router]);

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

      <Sidebar teacherName={teacherName} />

      <main className="flex-1 md:ml-[260px] relative z-10 custom-scrollbar md:overflow-y-auto md:h-screen flex flex-col">

        {/* HUD Status Bar */}
        <div className="sticky top-0 z-50 backdrop-blur-3xl border-b px-4 sm:px-8 md:px-12 py-4 flex items-center justify-between bg-[#011C40]/80 border-white/5 shadow-2xl">
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 rounded-full animate-pulse shadow-[0_0_15px_rgba(52,211,153,0.5)] bg-emerald-400" />
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white/50">ANALÍTICA ACTIVA</span>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div className="hidden xl:flex items-center gap-3">
              <Activity className="w-4 h-4 text-[#D4A574]" />
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Integridad</span>
                <span className="text-[10px] font-black leading-none text-white">100% Verified</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl border bg-white/5 border-white/10">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/50">
                CEN Bachillerato MCCEMS
              </span>
            </div>
            <button className="flex items-center gap-3 px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-[#D4A574] text-white shadow-[0_10px_30px_rgba(212,165,116,0.3)] hover:scale-105 active:scale-95 transition-all">
              <Download className="w-4 h-4" />
              Reporte MCCEMS
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="p-4 sm:p-8 md:p-12 space-y-8 lg:space-y-16 flex-1">

          {/* Header */}
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] bg-[#7DD3FC]/10 text-[#7DD3FC]">
                Centro de Inteligencia
              </span>
              <div className="h-px w-10 sm:w-20 bg-white/10" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
                Métricas MCCEMS
              </span>
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter leading-none mb-4 text-white">
                Reportes <span className="italic font-sans text-[#D4A574]">Académicos</span>
              </h1>
              <p className="text-lg font-medium max-w-xl text-white/40">
                Analiza el desempeño de tu grupo con datos verificados y genera informes para la coordinación.
              </p>
            </div>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-12 gap-10">

            {/* Main performance chart */}
            <div className="col-span-12 lg:col-span-8">
              <PerformanceChart isDark={true} />
            </div>

            {/* Side metrics */}
            <div className="col-span-12 lg:col-span-4 space-y-10">
              {/* Target card */}
              <div className="rounded-[3rem] p-10 relative overflow-hidden group shadow-2xl bg-[#011C40] border border-white/5">
                <div className="absolute bottom-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform text-[#7DD3FC]">
                  <Target className="w-32 h-32" />
                </div>
                <div className="relative z-10 space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#7DD3FC]/10 text-[#7DD3FC]">
                      <Zap className="w-6 h-6" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Meta Alcanzada</p>
                  </div>
                  <p className="text-6xl font-black tracking-tighter text-white">84<span className="text-[#7DD3FC]">%</span></p>
                  <p className="text-sm font-medium leading-relaxed text-white/40">
                    Tu grupo está superando el <span className="font-bold text-white">promedio institucional</span> por 12 puntos.
                  </p>
                </div>
              </div>

              {/* Distribución MCCEMS */}
              <div className="rounded-[3rem] p-10 border shadow-xl bg-white/5 border-white/5">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#D4A574]/10 text-[#D4A574]">
                    <PieChart className="w-6 h-6" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Distribución MCCEMS</p>
                </div>
                <div className="space-y-6">
                  {[
                    { label: 'Saberes', val: 35, color: 'bg-[#D4A574]' },
                    { label: 'Metacognición', val: 25, color: 'bg-[#1E40AF]' },
                    { label: 'Capacidades', val: 25, color: 'bg-[#7DD3FC]' },
                    { label: 'Vinculación', val: 15, color: 'bg-emerald-400' },
                  ].map(item => (
                    <div key={item.label} className="space-y-3">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-white/50">{item.label}</span>
                        <span className="text-white">{item.val}%</span>
                      </div>
                      <div className="h-2.5 w-full rounded-full overflow-hidden bg-white/5">
                        <div className={`h-full ${item.color} rounded-full transition-all duration-1000`} style={{ width: `${item.val}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom quick stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-20">
            <div className="rounded-[2.5rem] p-8 border flex items-center gap-6 bg-white/5 border-white/5 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white/5">
                <Calendar className="w-8 h-8 text-white/20" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-white/20">Próximo Reporte</p>
                <p className="text-xl font-black text-white">15 Junio, 2026</p>
              </div>
            </div>

            <div className="rounded-[2.5rem] p-8 border flex items-center gap-6 bg-white/5 border-white/5 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white/5">
                <ShieldCheck className="w-8 h-8 text-[#7DD3FC]/40" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-white/20">Estatus SEP</p>
                <p className="text-xl font-black text-emerald-400">Validado ✓</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#D4A574] to-[#b8895a] rounded-[2.5rem] p-8 text-white shadow-2xl flex items-center justify-between group cursor-pointer hover:scale-105 transition-all">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Soporte MCCEMS</p>
                <p className="text-xl font-black">Hablar con Tutor AI</p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
