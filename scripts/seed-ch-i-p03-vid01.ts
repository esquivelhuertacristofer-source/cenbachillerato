/**
 * Crea la actividad CH-I-P03-VID01 (video_con_preguntas), la única de las 3
 * piloto de video generado (TTS+Remotion) que no tenía fila sembrada — sus
 * hermanas CH-I-P01/P02/P04-VID01 sí existen. Contenido tomado verbatim de
 * la entrada ya definida en seed-sem4-videos-candidatas.ts, pero con
 * url_video apuntando directo al mp4 ya renderizado (no al placeholder
 * PENDIENTE), ya que el video real ya existe en public/videos/.
 *
 * Uso: npx tsx scripts/seed-ch-i-p03-vid01.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionId, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  const progresion_id = await getProgresionId(sb, "CH-I-P03");

  const ok = await upsertActividad(sb, {
    codigo: "CH-I-P03-VID01",
    titulo: "Video básico: Las conexiones entre fenómenos históricos",
    descripcion: "Video explicativo sobre cómo establecer conexiones entre fenómenos, acontecimientos y procesos históricos.",
    tipo: "video_con_preguntas",
    progresion_id,
    xp: 15,
    estado: "borrador",
    contenido: {
      url_video: "/videos/ch-i-p03-vid01.mp4",
      titulo_video: "Las conexiones entre fenómenos históricos",
      descripcion_video: "Video que explica cómo relacionar fenómenos, acontecimientos y procesos de distintas épocas para comprender mejor el devenir histórico.",
      subtitulos_disponibles: false,
      preguntas: [
        { pregunta: "¿Por qué es importante relacionar un acontecimiento histórico con otros fenómenos y procesos, en lugar de estudiarlo de forma aislada?", tipo: "abierta" },
        { pregunta: "¿Qué palabra describe mejor el conjunto de cambios y transformaciones que ocurren a lo largo del tiempo en la historia?", tipo: "opcion_multiple", opciones: ["El devenir histórico", "El texto narrativo", "El mapa conceptual"], respuesta_correcta: 0 },
        { pregunta: "Comprender la historia implica identificar cómo se conectan distintos hechos y procesos entre sí.", tipo: "verdadero_falso", respuesta_correcta: true },
      ],
    },
  });

  log(ok ? "\n✓ CH-I-P03-VID01 creada." : "\n✗ CH-I-P03-VID01 falló — ver arriba.");
  if (!ok) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
