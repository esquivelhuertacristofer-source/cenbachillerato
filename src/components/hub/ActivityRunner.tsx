"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { entregarActividad } from "@/lib/actions/entregar-actividad";
import { syncQueue, EVENTO_SYNC_RESUELTO } from "@/lib/sync-queue";
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

  // Si un flush de fondo de la sync-queue (evento 'online' o el intervalo)
  // resuelve esta entrega mientras seguimos montados en la actividad, el
  // banner de error quedaría obsoleto (el alumno ya no tiene nada pendiente
  // pero seguiría viendo "se sincronizará..."). Nos suscribimos al evento
  // que dispara flush() para limpiarlo sin sondear.
  useEffect(() => {
    function onSyncResuelto(e: Event) {
      const detail = (e as CustomEvent<{ actividadId: string }>).detail;
      if (detail?.actividadId === actividadId) setErrorEntrega(null);
    }
    window.addEventListener(EVENTO_SYNC_RESUELTO, onSyncResuelto);
    return () => window.removeEventListener(EVENTO_SYNC_RESUELTO, onSyncResuelto);
  }, [actividadId]);

  async function handleProgreso(resultado: ResultadoActividad): Promise<ResultadoEntrega> {
    if (!resultado.completada) return { ok: true };

    ultimoResultado.current = resultado;
    const payload = {
      puntaje: resultado.puntaje,
      respuestas: resultado.respuestas,
      tiempoSegundos: resultado.tiempoSegundos,
    };

    // entregarActividad normalmente resuelve { ok } | { error }, pero un
    // corte de red real (offline/DNS/TLS) hace que el fetch interno de
    // Supabase RECHACE la promesa en vez de resolver { error }. Sin este
    // try/catch esa excepción quedaría como unhandled rejection y el
    // alumno vería un fallo silencioso (ni banner ni cola). Lo normalizamos
    // a la misma forma { error } para que caiga en la rama de abajo.
    let res: Awaited<ReturnType<typeof entregarActividad>>;
    try {
      res = await entregarActividad(actividadId, payload);
    } catch (e) {
      res = { error: e instanceof Error ? e.message : "Sin conexión con el servidor" };
    }

    if ("error" in res) {
      setErrorEntrega(res.error);
      // No se pierde el trabajo del alumno: se encola para reenviarse solo
      // en cuanto vuelva la conexión (evento 'online' o el intervalo de
      // sync-queue), o cuando el alumno pulse "Reintentar".
      syncQueue.enqueue(actividadId, payload);
      return { ok: false, error: res.error };
    }

    setErrorEntrega(null);
    // Limpia cualquier copia que haya quedado encolada de un intento previo
    // fallido de esta misma actividad (p.ej. el alumno reintentó manualmente
    // y esta vez entregarActividad tuvo éxito directamente, sin pasar por
    // reintentarEntrega, que es el único lugar que ya hacía este dequeue).
    syncQueue.dequeue(actividadId);
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
      const r = await handleProgreso(resultado);
      if (r.ok) syncQueue.dequeue(actividadId); // limpia la cola si quedó una copia pendiente
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
  if (contenido == null) {
    activity = (
      <div style={{
        borderRadius: 20,
        border: "1px solid rgba(255,200,80,0.18)",
        background: "rgba(255,200,80,0.06)",
        padding: "48px 32px",
        display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 12,
      }}>
        <i className="fa-solid fa-circle-exclamation" style={{ fontSize: 40, color: "rgba(255,200,80,0.55)" }} />
        <p style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: 0 }}>
          Contenido no disponible
        </p>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.50)", margin: 0, maxWidth: 360 }}>
          No se pudo cargar el contenido de esta actividad. Intenta recargar la página.
        </p>
      </div>
    );
  } else if (tipo === "lectura") {
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
          role="status"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            borderRadius: 14,
            border: "1px solid rgba(255,200,80,0.35)",
            background: "rgba(255,200,80,0.08)",
            padding: "14px 16px",
            marginBottom: 16,
          }}
        >
          <i className="fa-solid fa-cloud-arrow-up" style={{ color: "rgba(255,200,80,0.85)", fontSize: 18 }} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#FFE0A3", margin: 0 }}>
              Guardado. Se sincronizará cuando haya conexión
            </p>
            <p style={{ fontSize: 13, color: "rgba(255,224,163,0.85)", margin: "2px 0 0" }}>
              {errorEntrega}. Tu respuesta no se perdió: se enviará sola en cuanto haya conexión, o puedes reintentar ahora.
            </p>
          </div>
          <button
            type="button"
            onClick={reintentarEntrega}
            disabled={reintentando}
            style={{
              borderRadius: 10,
              border: "1px solid rgba(255,200,80,0.55)",
              background: "rgba(255,200,80,0.18)",
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
