"use client";

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
import type { ResultadoActividad } from "@/types/activities";
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
}: ActivityRunnerProps) {
  const router = useRouter();

  async function handleProgreso(resultado: ResultadoActividad) {
    if (resultado.completada) {
      await entregarActividad(actividadId, {
        puntaje: resultado.puntaje,
        respuestas: resultado.respuestas,
        tiempoSegundos: resultado.tiempoSegundos,
      });
      router.push(backHref);
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
  };

  if (tipo === "lectura") {
    return (
      <ActivityShell {...shellProps}>
        <LecturaActivity
          actividad={{ ...base, tipo: "lectura", contenido: contenido as never }}
          onProgreso={handleProgreso}
          color={color}
          estado={estado}
          respuestasIntento={respuestasIntento ?? undefined}
        />
      </ActivityShell>
    );
  }
  if (tipo === "quiz_multiple_opcion") {
    return (
      <ActivityShell {...shellProps}>
        <QuizMultipleOpcionActivity
          actividad={{ ...base, tipo: "quiz_multiple_opcion", contenido: contenido as never }}
          onProgreso={handleProgreso}
          color={color}
          estado={estado}
          respuestasIntento={respuestasIntento ?? undefined}
        />
      </ActivityShell>
    );
  }
  if (tipo === "quiz_verdadero_falso") {
    return (
      <ActivityShell {...shellProps}>
        <QuizVerdaderoFalsoActivity actividad={{ ...base, tipo: "quiz_verdadero_falso", contenido: contenido as never }} onProgreso={handleProgreso} />
      </ActivityShell>
    );
  }
  if (tipo === "fill_blanks") {
    return (
      <ActivityShell {...shellProps}>
        <FillBlanksActivity
          actividad={{ ...base, tipo: "fill_blanks", contenido: contenido as never }}
          onProgreso={handleProgreso}
          color={color}
          estado={estado}
          respuestasIntento={respuestasIntento ?? undefined}
        />
      </ActivityShell>
    );
  }
  if (tipo === "ejercicio_matematico") {
    return (
      <ActivityShell {...shellProps}>
        <EjercicioMatematicoActivity
          actividad={{ ...base, tipo: "ejercicio_matematico", contenido: contenido as never }}
          onProgreso={handleProgreso}
          color={color}
          estado={estado}
          respuestasIntento={respuestasIntento ?? undefined}
        />
      </ActivityShell>
    );
  }
  if (tipo === "reflexion_escrita") {
    return (
      <ActivityShell {...shellProps}>
        <ReflexionEscritaActivity
          actividad={{ ...base, tipo: "reflexion_escrita", contenido: contenido as never }}
          onProgreso={handleProgreso}
          color={color}
          estado={estado}
          respuestasIntento={respuestasIntento ?? undefined}
        />
      </ActivityShell>
    );
  }
  if (tipo === "video_con_preguntas") {
    return (
      <ActivityShell {...shellProps}>
        <VideoConPreguntasActivity actividad={{ ...base, tipo: "video_con_preguntas", contenido: contenido as never }} onProgreso={handleProgreso} />
      </ActivityShell>
    );
  }
  if (tipo === "infografia") {
    return (
      <ActivityShell {...shellProps}>
        <InfografiaActivity actividad={{ ...base, tipo: "infografia", contenido: contenido as never }} onProgreso={handleProgreso} />
      </ActivityShell>
    );
  }
  if (tipo === "debate_estructurado") {
    return (
      <ActivityShell {...shellProps}>
        <DebateEstructuradoActivity
          actividad={{ ...base, tipo: "debate_estructurado", contenido: contenido as never }}
          onProgreso={handleProgreso}
          color={color}
          estado={estado}
          respuestasIntento={respuestasIntento ?? undefined}
        />
      </ActivityShell>
    );
  }
  if (tipo === "simulacion") {
    return (
      <ActivityShell {...shellProps}>
        <SimulacionActivity actividad={{ ...base, tipo: "simulacion", contenido: contenido as never }} onProgreso={handleProgreso} />
      </ActivityShell>
    );
  }
  if (tipo === "glosario_interactivo") {
    return (
      <ActivityShell {...shellProps}>
        <GlosarioInteractivoActivity actividad={{ ...base, tipo: "glosario_interactivo", contenido: contenido as never }} onProgreso={handleProgreso} />
      </ActivityShell>
    );
  }
  if (tipo === "autoevaluacion") {
    return (
      <ActivityShell {...shellProps}>
        <AutoevaluacionActivity actividad={{ ...base, tipo: "autoevaluacion", contenido: contenido as never }} onProgreso={handleProgreso} />
      </ActivityShell>
    );
  }

  return (
    <ActivityShell {...shellProps}>
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
    </ActivityShell>
  );
}
