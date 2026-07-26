/**
 * Semestre 6 — Actividades de video (tipo 'video_con_preguntas').
 * Mismo patrón que seed-sem1-videos.ts: url_video PLACEHOLDER,
 * estado='borrador' hasta que el cliente entregue los enlaces reales de YouTube.
 * Uso: npx tsx scripts/seed-sem6-videos.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionId, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

const PLACEHOLDER = "https://www.youtube.com/embed/PENDIENTE";

interface PregV {
  pregunta: string;
  tipo: "abierta" | "opcion_multiple" | "verdadero_falso";
  opciones?: string[];
  respuesta_correcta?: number | boolean | string;
}

interface VideoDef {
  progresion: string;
  codigo: string;
  titulo: string;
  descripcion: string;
  titulo_video: string;
  descripcion_video: string;
  preguntas: PregV[];
}

const videos: VideoDef[] = [
  // ───────────────────── VIDEOS DE PRESENTACIÓN (1 por materia, numero=1) ─────────────────────
  {
    progresion: "CD-III-P01",
    codigo: "CD-III-P01-VID01",
    titulo: "Video de presentación: Cultura Digital III",
    descripcion: "Video de bienvenida a la UAC: qué aprenderás sobre comunicación digital y creación de contenido.",
    titulo_video: "Bienvenida a Cultura Digital III",
    descripcion_video: "Presentación general de la UAC: propósito y temas (comunicación digital, conexión de dispositivos, creación y edición de contenido digital).",
    preguntas: [
      { pregunta: "¿Qué es la comunicación digital según el video?", tipo: "abierta" },
      { pregunta: "Menciona un medio o herramienta de comunicación digital que usarás en esta UAC.", tipo: "abierta" },
      { pregunta: "Esta UAC busca que conectes dispositivos tecnológicos conforme a tu contexto.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CH-III-P01",
    codigo: "CH-III-P01-VID01",
    titulo: "Video de presentación: Conciencia Histórica III",
    descripcion: "Video de bienvenida a la UAC: qué aprenderás sobre fuentes históricas y argumentación.",
    titulo_video: "Bienvenida a Conciencia Histórica III",
    descripcion_video: "Presentación general de la UAC: propósito y temas (diversidad de fuentes históricas, validez de evidencias, argumentación histórica).",
    preguntas: [
      { pregunta: "¿Por qué es importante identificar la diversidad de fuentes históricas según el video?", tipo: "abierta" },
      { pregunta: "¿Qué criterios se usan para evaluar la validez de una evidencia histórica?", tipo: "abierta" },
      { pregunta: "Esta UAC busca que construyas explicaciones del pasado a partir de fuentes diversas.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-VI-P01",
    codigo: "CNEYT-VI-P01-VID01",
    titulo: "Video de presentación: Ciencias Naturales, Experimentales y Tecnología VI",
    descripcion: "Video de bienvenida a la UAC: qué aprenderás sobre el origen de la vida, la herencia y la evolución.",
    titulo_video: "Bienvenida a Ciencias Naturales, Experimentales y Tecnología VI",
    descripcion_video: "Presentación general de la UAC: propósito y temas (origen de la vida, teoría celular, ADN y herencia, mitosis y meiosis, evolución, mutaciones).",
    preguntas: [
      { pregunta: "¿Qué teoría sobre el origen de la vida se presenta al inicio de esta UAC?", tipo: "abierta" },
      { pregunta: "Menciona un tema de biología que estudiarás en esta UAC.", tipo: "abierta" },
      { pregunta: "Esta UAC analiza la interacción entre materia y energía de la Tierra primitiva para comprender el origen de la vida.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-VI-P01",
    codigo: "PM-VI-P01-VID01",
    titulo: "Video de presentación: Pensamiento Matemático VI",
    descripcion: "Video de bienvenida a la UAC: qué aprenderás sobre estadística, probabilidad y distribución normal.",
    titulo_video: "Bienvenida a Pensamiento Matemático VI",
    descripcion_video: "Presentación general: propósito y temas (recolección de datos, probabilidad, técnicas de conteo, medidas de tendencia central y dispersión, distribución normal).",
    preguntas: [
      { pregunta: "¿Por qué es importante recolectar y organizar datos mediante una muestra aleatoria?", tipo: "abierta" },
      { pregunta: "Menciona un tema de estadística o probabilidad que estudiarás en esta UAC.", tipo: "abierta" },
      { pregunta: "Esta UAC introduce el uso de muestras aleatorias para explicar fenómenos naturales y sociales.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },

  // ───────────────────── VIDEOS BÁSICOS (temas clave) ─────────────────────
  {
    progresion: "CNEYT-VI-P05",
    codigo: "CNEYT-VI-P05-VID01",
    titulo: "Video básico: Mecanismos de la herencia biológica",
    descripcion: "Video explicativo sobre los mecanismos básicos de la herencia biológica.",
    titulo_video: "Mecanismos de la herencia biológica",
    descripcion_video: "Video que explica los mecanismos básicos de la herencia biológica (genes, alelos dominantes y recesivos) y cómo se manifiestan en situaciones reales.",
    preguntas: [
      { pregunta: "¿Qué es un alelo dominante y qué es un alelo recesivo?", tipo: "abierta" },
      { pregunta: "¿Qué herramienta se usa para predecir la probabilidad de herencia de un rasgo entre dos progenitores?", tipo: "opcion_multiple", opciones: ["El cuadro de Punnett", "La tabla periódica", "El plano cartesiano"], respuesta_correcta: 0 },
      { pregunta: "La genética estudia cómo se transmiten las características de padres a hijos.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-VI-P07",
    codigo: "CNEYT-VI-P07-VID01",
    titulo: "Video básico: La evolución por selección natural",
    descripcion: "Video explicativo sobre el proceso de evolución por selección natural.",
    titulo_video: "La evolución por selección natural",
    descripcion_video: "Video que explica el proceso de evolución por selección natural y cómo explica la diversidad biológica y las adaptaciones de las especies.",
    preguntas: [
      { pregunta: "¿Qué es una adaptación en el contexto de la selección natural?", tipo: "abierta" },
      { pregunta: "Según la selección natural, ¿qué individuos tienen mayor probabilidad de sobrevivir y reproducirse?", tipo: "opcion_multiple", opciones: ["Los que mejor se adaptan a su ambiente", "Los de mayor tamaño siempre", "Los que nacen primero"], respuesta_correcta: 0 },
      { pregunta: "La selección natural es uno de los mecanismos que explican la evolución de las especies.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-VI-P09",
    codigo: "PM-VI-P09-VID01",
    titulo: "Video básico: La distribución normal",
    descripcion: "Video explicativo sobre la distribución normal y su uso en probabilidad.",
    titulo_video: "La distribución normal",
    descripcion_video: "Video que explica qué es la distribución normal, su forma de campana y cómo se utiliza para calcular la probabilidad de un evento aleatorio.",
    preguntas: [
      { pregunta: "¿Qué forma tiene la gráfica de una distribución normal?", tipo: "abierta" },
      { pregunta: "¿Qué medidas describen una distribución normal?", tipo: "opcion_multiple", opciones: ["La media y la desviación estándar", "El perímetro y el área", "La pendiente y la ordenada al origen"], respuesta_correcta: 0 },
      { pregunta: "La distribución normal se utiliza para describir el comportamiento de muchos eventos aleatorios.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
];

async function main() {
  const sb = createSB();
  log("\n🎬 Semestre 6 — Actividades de video (tipo 'video_con_preguntas')\n");
  log("   ⚠️  url_video = PLACEHOLDER; el cliente reemplazará con su enlace de YouTube.\n");

  let ok = 0;
  let fail = 0;

  for (const v of videos) {
    const progresion_id = await getProgresionId(sb, v.progresion);
    const res = await upsertActividad(sb, {
      codigo: v.codigo,
      titulo: v.titulo,
      descripcion: v.descripcion,
      tipo: "video_con_preguntas",
      progresion_id,
      xp: 15,
      estado: "borrador",
      contenido: {
        url_video: PLACEHOLDER,
        titulo_video: v.titulo_video,
        descripcion_video: v.descripcion_video,
        subtitulos_disponibles: false,
        preguntas: v.preguntas,
      },
    });
    res ? ok++ : fail++;
  }

  log(`\n✅ Sem6 videos: ${ok} insertados, ${fail} fallidos (de ${videos.length}).\n`);
  if (fail > 0) process.exit(1);
}

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
