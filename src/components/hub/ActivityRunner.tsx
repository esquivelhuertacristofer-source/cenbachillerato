"use client";

import { useRouter } from "next/navigation";
import { entregarActividad } from "@/lib/actions/entregar-actividad";
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

interface ActivityRunnerProps {
  actividadId: string;
  tipo: string;
  titulo: string;
  descripcion: string | null;
  xp: number;
  contenido: unknown;
  estado: "no_iniciada" | "en_progreso" | "completada";
  intentoId: string | null;
  color: AreaColor;
  backHref: string;
}

export function ActivityRunner({
  actividadId,
  tipo,
  titulo,
  descripcion,
  xp,
  contenido,
  estado,
  color,
  backHref,
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

  // Build the actividad object expected by each component
  const base = { id: actividadId, titulo, descripcion: descripcion ?? undefined, xp };

  if (tipo === "lectura") {
    return <LecturaActivity actividad={{ ...base, tipo: "lectura", contenido: contenido as never }} onProgreso={handleProgreso} />;
  }
  if (tipo === "quiz_multiple_opcion") {
    return <QuizMultipleOpcionActivity actividad={{ ...base, tipo: "quiz_multiple_opcion", contenido: contenido as never }} onProgreso={handleProgreso} />;
  }
  if (tipo === "quiz_verdadero_falso") {
    return <QuizVerdaderoFalsoActivity actividad={{ ...base, tipo: "quiz_verdadero_falso", contenido: contenido as never }} onProgreso={handleProgreso} />;
  }
  if (tipo === "fill_blanks") {
    return <FillBlanksActivity actividad={{ ...base, tipo: "fill_blanks", contenido: contenido as never }} onProgreso={handleProgreso} />;
  }
  if (tipo === "ejercicio_matematico") {
    return <EjercicioMatematicoActivity actividad={{ ...base, tipo: "ejercicio_matematico", contenido: contenido as never }} onProgreso={handleProgreso} />;
  }
  if (tipo === "reflexion_escrita") {
    return <ReflexionEscritaActivity actividad={{ ...base, tipo: "reflexion_escrita", contenido: contenido as never }} onProgreso={handleProgreso} />;
  }
  if (tipo === "video_con_preguntas") {
    return <VideoConPreguntasActivity actividad={{ ...base, tipo: "video_con_preguntas", contenido: contenido as never }} onProgreso={handleProgreso} />;
  }
  if (tipo === "infografia") {
    return <InfografiaActivity actividad={{ ...base, tipo: "infografia", contenido: contenido as never }} onProgreso={handleProgreso} />;
  }
  if (tipo === "debate_estructurado") {
    return <DebateEstructuradoActivity actividad={{ ...base, tipo: "debate_estructurado", contenido: contenido as never }} onProgreso={handleProgreso} />;
  }
  if (tipo === "simulacion") {
    return <SimulacionActivity actividad={{ ...base, tipo: "simulacion", contenido: contenido as never }} onProgreso={handleProgreso} />;
  }
  if (tipo === "glosario_interactivo") {
    return <GlosarioInteractivoActivity actividad={{ ...base, tipo: "glosario_interactivo", contenido: contenido as never }} onProgreso={handleProgreso} />;
  }
  if (tipo === "autoevaluacion") {
    return <AutoevaluacionActivity actividad={{ ...base, tipo: "autoevaluacion", contenido: contenido as never }} onProgreso={handleProgreso} />;
  }

  // Unsupported type fallback
  return (
    <div style={{
      borderRadius: 20,
      border: "2px dashed rgba(11,37,69,0.14)",
      background: "#fff",
      padding: "48px 32px",
      display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 12,
    }}>
      <i className="fa-solid fa-hammer" style={{ fontSize: 40, color: "rgba(11,37,69,0.14)" }} />
      <p style={{ fontSize: 15, fontWeight: 700, color: "#0B2545", margin: 0 }}>
        Tipo de actividad en desarrollo
      </p>
      <p style={{ fontSize: 13, color: "rgba(11,37,69,0.50)", margin: 0, maxWidth: 360 }}>
        Este tipo de actividad ({tipo}) estará disponible próximamente.
      </p>
    </div>
  );
}
