"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { entregarActividad } from "@/lib/actions/entregar-actividad";
import { ActivityShell } from "@/components/activities/ActivityShell";
import { LecturaActivity } from "@/components/activities/LecturaActivity";
import { QuizMultipleOpcionActivity } from "@/components/activities/QuizMultipleOpcionActivity";
import { QuizVerdaderoFalsoActivity } from "@/components/activities/QuizVerdaderoFalsoActivity";
import { FillBlanksActivity } from "@/components/activities/FillBlanksActivity";
import { EjercicioMatematicoActivity } from "@/components/activities/EjercicioMatematicoActivity";
import { ReflexionEscritaActivity } from "@/components/activities/ReflexionEscritaActivity";
import { VideoConPreguntasActivity } from "@/components/activities/VideoConPreguntasActivity";
import { InfografiaActivity } from "@/components/activities/InfografiaActivity";
import { DebateEstructuradoActivity } from "@/components/activities/DebateEstructuradoActivity";
import { SimulacionActivity } from "@/components/activities/SimulacionActivity";
import { GlosarioInteractivoActivity } from "@/components/activities/GlosarioInteractivoActivity";
import { AutoevaluacionActivity } from "@/components/activities/AutoevaluacionActivity";
import type { ResultadoActividad, ResultadoEntrega } from "@/types/activities";
import type { AreaColor } from "@/components/hub/hub-colors";
import type { ActividadConEstado } from "@/lib/queries/hub";

interface ActivityRunnerProps {
  actividadId: string;
  tipo: string;
  titulo: string;
  descripcion: string | null;
  xp: number;
  contenido: unknown;
  estado: "no_iniciada" | "en_progreso" | "completada";
  intentoId: string | null;
  respuestasIntento?: Record<string, string> | null;
  color: AreaColor;
  backHref: string;
  uacNombre: string;
  uacCodigo: string;
  progresionNum: number;
  ordenNum: number;
  phaseLabel: string;
  actividadesProg: ActividadConEstado[];
  nivel_revision?: string | null;
  practicaHref?: string | null;
  /** Términos del glosario de la materia presentes en la prosa (solo lectura). */
  glosario?: { t: string; d: string }[];
}

export function ActivityRunner({
  actividadId,
  tipo,
  titulo,
  descripcion,
  xp,
  contenido,
  estado,
  respuestasIntento,
  color,
  backHref,
  uacNombre,
  uacCodigo,
  progresionNum,
  ordenNum,
  phaseLabel,
  actividadesProg,
  nivel_revision,
  practicaHref,
  glosario,
}: ActivityRunnerProps) {
  const router = useRouter();
  // Si la entrega falla (red, sesión, RLS), guardamos el resultado para que el
  // alumno pueda reintentar sin volver a resolver la actividad, y mostramos un
  // banner. NO navegamos hasta que la entrega tenga éxito (evita perder trabajo).
  const [errorEntrega, setErrorEntrega] = useState<string | null>(null);
  const [reintentando, setReintentando] = useState(false);
  const ultimoResultado = useRef<ResultadoActividad | null>(null);

  async function handleProgreso(resultado: ResultadoActividad): Promise<ResultadoEntrega> {
    if (!resultado.completada) return { ok: true };

    ultimoResultado.current = resultado;
    const res = await entregarActividad(actividadId, {
      puntaje: resultado.puntaje,
      respuestas: resultado.respuestas,
      tiempoSegundos: resultado.tiempoSegundos,
    });

    if ("error" in res) {
      setErrorEntrega(res.error);
      return { ok: false, error: res.error };
    }

    setErrorEntrega(null);
    // Avanzar a la siguiente actividad de la progresión. Si es la última,
    // volver a la progresión (ahí vive la celebración de "completada").
    const idx = actividadesProg.findIndex((a) => a.orden === ordenNum);
    const next =
      idx >= 0 && idx < actividadesProg.length - 1 ? actividadesProg[idx + 1] : null;
    router.push(
      next
        ? `/hub/uac/${uacCodigo}/progresion/${progresionNum}/actividad/${next.orden}`
        : backHref
    );
    return { ok: true };
  }

  async function reintentarEntrega() {
    const resultado = ultimoResultado.current;
    if (!resultado || reintentando) return;
    setReintentando(true);
    try {
      await handleProgreso(resultado);
    } finally {
      setReintentando(false);
    }
  }

  const base = { id: actividadId, titulo, descripcion: descripcion ?? undefined, xp };

  const shellProps = {
    titulo,
    tipo,
    xp,
    color,
    estado,
    backHref,
    uacNombre,
    uacCodigo,
    progresionNum,
    ordenNum,
    phaseLabel,
    actividadesProg,
    nivel_revision,
    practicaHref,
  };

  // Cada rama difiere solo en el hijo; `shellProps` es idéntico. Calculamos el
  // hijo una vez para poder renderizar el banner de error de entrega en todas.
  let activity: React.ReactNode;
  if (tipo === "lectura") {
    activity = (
      <LecturaActivity
        actividad={{ ...base, tipo: "lectura", contenido: contenido as never }}
        onProgreso={handleProgreso}
        color={color}
        estado={estado}
        respuestasIntento={respuestasIntento ?? undefined}
        glosario={glosario}
        materia={uacNombre}
        uacCodigo={uacCodigo}
      />
    );
  } else if (tipo === "quiz_multiple_opcion") {
    activity = (
      <QuizMultipleOpcionActivity
        actividad={{ ...base, tipo: "quiz_multiple_opcion", contenido: contenido as never }}
        onProgreso={handleProgreso}
        color={color}
        estado={estado}
        respuestasIntento={respuestasIntento ?? undefined}
      />
    );
  } else if (tipo === "quiz_verdadero_falso") {
    activity = (
      <QuizVerdaderoFalsoActivity actividad={{ ...base, tipo: "quiz_verdadero_falso", contenido: contenido as never }} onProgreso={handleProgreso} color={color} />
    );
  } else if (tipo === "fill_blanks") {
    activity = (
      <FillBlanksActivity
        actividad={{ ...base, tipo: "fill_blanks", contenido: contenido as never }}
        onProgreso={handleProgreso}
        color={color}
        estado={estado}
        respuestasIntento={respuestasIntento ?? undefined}
      />
    );
  } else if (tipo === "ejercicio_matematico") {
    activity = (
      <EjercicioMatematicoActivity
        actividad={{ ...base, tipo: "ejercicio_matematico", contenido: contenido as never }}
        onProgreso={handleProgreso}
        color={color}
        estado={estado}
        respuestasIntento={respuestasIntento ?? undefined}
      />
    );
  } else if (tipo === "reflexion_escrita") {
    activity = (
      <ReflexionEscritaActivity
        actividad={{ ...base, tipo: "reflexion_escrita", contenido: contenido as never }}
        onProgreso={handleProgreso}
        color={color}
        estado={estado}
        respuestasIntento={respuestasIntento ?? undefined}
      />
    );
  } else if (tipo === "video_con_preguntas") {
    activity = (
      <VideoConPreguntasActivity actividad={{ ...base, tipo: "video_con_preguntas", contenido: contenido as never }} onProgreso={handleProgreso} color={color} />
    );
  } else if (tipo === "infografia") {
    activity = (
      <InfografiaActivity actividad={{ ...base, tipo: "infografia", contenido: contenido as never }} onProgreso={handleProgreso} uacCodigo={uacCodigo} color={color} />
    );
  } else if (tipo === "debate_estructurado") {
    activity = (
      <DebateEstructuradoActivity
        actividad={{ ...base, tipo: "debate_estructurado", contenido: contenido as never }}
        onProgreso={handleProgreso}
        color={color}
        estado={estado}
        respuestasIntento={respuestasIntento ?? undefined}
      />
    );
  } else if (tipo === "simulacion") {
    activity = (
      <SimulacionActivity actividad={{ ...base, tipo: "simulacion", contenido: contenido as never }} onProgreso={handleProgreso} color={color} />
    );
  } else if (tipo === "glosario_interactivo") {
    activity = (
      <GlosarioInteractivoActivity actividad={{ ...base, tipo: "glosario_interactivo", contenido: contenido as never }} onProgreso={handleProgreso} color={color} />
    );
  } else if (tipo === "autoevaluacion") {
    activity = (
      <AutoevaluacionActivity actividad={{ ...base, tipo: "autoevaluacion", contenido: contenido as never }} onProgreso={handleProgreso} color={color} />
    );
  } else {
    activity = (
      <div style={{
        borderRadius: 20,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.04)",
        padding: "48px 32px",
        display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 12,
      }}>
        <i className="fa-solid fa-hammer" style={{ fontSize: 40, color: "rgba(255,255,255,0.18)" }} />
        <p style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: 0 }}>
          Tipo de actividad en desarrollo
        </p>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.50)", margin: 0, maxWidth: 360 }}>
          Este tipo de actividad ({tipo}) estará disponible próximamente.
        </p>
      </div>
    );
  }

  return (
    <ActivityShell {...shellProps}>
      {errorEntrega && (
        <div
          role="alert"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            borderRadius: 14,
            border: "1px solid rgba(248,113,113,0.45)",
            background: "rgba(248,113,113,0.10)",
            padding: "14px 16px",
            marginBottom: 16,
          }}
        >
          <i className="fa-solid fa-triangle-exclamation" style={{ color: "#fca5a5", fontSize: 18 }} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#fecaca", margin: 0 }}>
              No se pudo guardar tu avance
            </p>
            <p style={{ fontSize: 13, color: "rgba(254,202,202,0.85)", margin: "2px 0 0" }}>
              {errorEntrega} Tu respuesta sigue aquí; vuelve a intentarlo.
            </p>
          </div>
          <button
            type="button"
            onClick={reintentarEntrega}
            disabled={reintentando}
            style={{
              borderRadius: 10,
              border: "1px solid rgba(248,113,113,0.55)",
              background: "rgba(248,113,113,0.18)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              padding: "8px 16px",
              cursor: reintentando ? "wait" : "pointer",
              opacity: reintentando ? 0.6 : 1,
            }}
          >
            {reintentando ? "Reintentando…" : "Reintentar"}
          </button>
        </div>
      )}
      {activity}
    </ActivityShell>
  );
}
