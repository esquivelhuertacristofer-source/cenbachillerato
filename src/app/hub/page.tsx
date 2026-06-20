"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UAC_BASE, COMPONENTES_CURRICULARES, getUACPorCodigo } from "@/lib/mccems/estructura";
import {
  getCurrentProfile,
  getProgresionesCompletadasDeUAC,
  getProgresoSemestreBrowser,
  getUltimaActividadActivaBrowser,
  type HubProfile,
} from "@/lib/queries/hub-browser";
import type { ContinuarData } from "@/lib/queries/hub";
import { ContinuarCard } from "@/components/hub/ContinuarCard";
import UACGrid from "@/components/hub-v2/UACGrid";
import HubHero from "@/components/hub-v2/HubHero";
import HubRecursosStrip from "@/components/hub-v2/HubRecursosStrip";
import HubEvaluacion from "@/components/hub-v2/HubEvaluacion";
import HubV2Skeleton from "@/components/hub-v2/HubV2Skeleton";
import "./HubV5.css";

interface UACItem {
  codigo: string;
  nombre: string;
  done: number;
  total: number;
  pct: number;
}

function getDiaDelSemestre() {
  const starts: Record<number, string> = { 1: "2025-08-25", 2: "2026-02-02" };
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const startKey = month >= 8 ? 1 : 2;
  const startYear = startKey === 1 ? (month >= 8 ? year : year - 1) : year;
  const start = new Date(
    (starts[startKey] ?? starts[1] ?? "2025-08-25").replace(/^\d{4}/, String(startYear))
  );
  const diff = Math.floor((now.getTime() - start.getTime()) / 86_400_000) + 1;
  return Math.max(1, Math.min(diff, 200));
}

export default function HubPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [profile, setProfile] = useState<HubProfile | null>(null);
  const [uacs, setUACs] = useState<UACItem[]>([]);
  const [pctGlobal, setPctGlobal] = useState(0);
  const [continuar, setContinuar] = useState<ContinuarData | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const prof = await getCurrentProfile();
        if (cancelled) return;
        if (!prof) { router.replace("/log-in"); return; }

        const semestre = prof.semestre;
        const uacDelSemestre = UAC_BASE.filter((u) => u.semestre === semestre);

        // allSettled: una query que falle (RLS, red) no tumba el hub completo.
        // Las materias salen de UAC_BASE (config estática), así nunca desaparecen;
        // solo el progreso quedaría en 0 si su query falla.
        const [progresoR, continuarR, ...progresosUACR] = await Promise.allSettled([
          getProgresoSemestreBrowser(prof.userId, semestre),
          getUltimaActividadActivaBrowser(prof.userId, semestre),
          ...uacDelSemestre.map((u) =>
            getProgresionesCompletadasDeUAC(u.codigo, prof.userId)
          ),
        ]);

        if (cancelled) return;

        setPctGlobal(progresoR.status === "fulfilled" ? progresoR.value.porcentaje : 0);
        setContinuar(continuarR.status === "fulfilled" ? continuarR.value : null);
        setProfile(prof);

        const items: UACItem[] = uacDelSemestre.map((uac, i) => {
          const r = progresosUACR[i];
          const p = r && r.status === "fulfilled"
            ? r.value
            : { completadas: 0, total: uac.totalProgresionesEsperadas, ultimaActividad: null };
          const total = p.total > 0 ? p.total : uac.totalProgresionesEsperadas;
          const done = p.completadas;
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;
          return { codigo: uac.codigo, nombre: uac.nombre, done, total, pct };
        });

        setUACs(items);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [router]);

  if (loading) return <HubV2Skeleton />;

  if (error) {
    return (
      <div className="hub-v2-page" style={{ textAlign: "center", paddingTop: 80 }}>
        <h2 style={{ marginBottom: 12 }}>No pudimos cargar tu hub</h2>
        <p style={{ opacity: 0.7, marginBottom: 24 }}>
          Revisa tu conexión e inténtalo de nuevo.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "10px 24px",
            borderRadius: 10,
            border: "none",
            background: "var(--accent, #6366f1)",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  const semestre = profile?.semestre ?? 1;
  const dia = getDiaDelSemestre();
  const materiasActivas = uacs.filter((u) => u.done > 0 && u.pct < 100).length;

  // ── Agrupar materias por componente curricular (rótulo) ──
  // En sem 1-4 todo es CF; en sem 5-6 aparece CFE y se separa solo.
  const gruposComponente = COMPONENTES_CURRICULARES
    .map((comp) => ({
      comp,
      items: uacs.filter(
        (u) => getUACPorCodigo(u.codigo)?.componenteCodigo === comp.codigo
      ),
    }))
    .filter((g) => g.items.length > 0);

  const nombre = profile?.fullName?.trim().split(/\s+/)[0] ?? "Alumno";

  return (
    <div className="hub-v2-page">
      {/* ── Hero del semestre — identidad y bienvenida primero ─── */}
      <HubHero
        semestre={semestre}
        pctGlobal={pctGlobal}
        dia={dia}
        materiasActivas={materiasActivas}
        uacs={uacs}
        nombre={nombre}
      />

      {/* ── Continuar donde te quedaste — CTA primaria, bajo el hero del semestre ─── */}
      <div className="hub-v2-animate" style={{ marginBottom: 56 }}>
        <ContinuarCard data={continuar} nombre={nombre} />
      </div>

      {/* ── Materias por componente curricular ─── */}
      <div id="hub-materias" style={{ scrollMarginTop: 24 }}>
      {gruposComponente.map(({ comp, items }) => (
        <section key={comp.codigo} className="hub-v2-componente">
          <div className="hub-v2-rotulo">
            <span className="hub-v2-rotulo-tag">{comp.codigo}</span>
            <div className="hub-v2-rotulo-text">
              <h2 className="hub-v2-rotulo-title">{comp.nombre}</h2>
              <p className="hub-v2-rotulo-desc">{comp.descripcion}</p>
            </div>
            <span className="hub-v2-rotulo-badge">
              {items.length} {items.length === 1 ? "materia" : "materias"}
            </span>
          </div>

          <UACGrid items={items} />
        </section>
      ))}
      </div>

      {/* ── Material de estudio (carrusel) — al fondo, antes del examen ─── */}
      {profile && <HubRecursosStrip userId={profile.userId} semestre={semestre} />}

      {/* ── Evaluación del semestre ─── */}
      <HubEvaluacion pctGlobal={pctGlobal} />
    </div>
  );
}
