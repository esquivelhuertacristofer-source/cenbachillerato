/**
 * Semestre 5 — Actividades de video (tipo 'video_con_preguntas').
 * Mismo patrón que seed-sem1-videos.ts: url_video PLACEHOLDER,
 * estado='borrador' hasta que el cliente entregue los enlaces reales de YouTube.
 * Uso: npx tsx scripts/seed-sem5-videos.ts
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
    progresion: "CH-II-P02",
    codigo: "CH-II-P02-VID01",
    titulo: "Video de presentación: Conciencia Histórica II",
    descripcion: "Video de bienvenida a la UAC: qué aprenderás sobre hipótesis históricas, identidades y explicaciones del pasado.",
    titulo_video: "Bienvenida a Conciencia Histórica II",
    descripcion_video: "Presentación general de la UAC: propósito y temas (hipótesis sobre el pasado, identidades, explicaciones históricas, sentido histórico).",
    preguntas: [
      { pregunta: "¿Para qué sirve construir hipótesis sobre el pasado según el video?", tipo: "abierta" },
      { pregunta: "¿Cómo se relaciona la interpretación del pasado con la construcción de identidades?", tipo: "abierta" },
      { pregunta: "Esta UAC busca que cuestiones las interpretaciones del pasado.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-V-P02",
    codigo: "CNEYT-V-P02-VID01",
    titulo: "Video de presentación: Ciencias Naturales, Experimentales y Tecnología V",
    descripcion: "Video de bienvenida a la UAC: qué aprenderás sobre las leyes de Newton, gravitación, ondas y electromagnetismo.",
    titulo_video: "Bienvenida a Ciencias Naturales, Experimentales y Tecnología V",
    descripcion_video: "Presentación general de la UAC: propósito y temas (leyes de Newton, gravitación universal, ondas, óptica, electromagnetismo).",
    preguntas: [
      { pregunta: "¿Qué leyes de Newton se presentan al inicio de esta UAC?", tipo: "abierta" },
      { pregunta: "Menciona un fenómeno físico que estudiarás en esta UAC.", tipo: "abierta" },
      { pregunta: "Esta UAC estudia el movimiento de los cuerpos y las fuerzas que actúan sobre ellos.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "IN-V-P01",
    codigo: "IN-V-P01-VID01",
    titulo: "Video de presentación: Inglés V",
    descripcion: "Video de bienvenida a la UAC: qué aprenderás para comunicarte en inglés sobre tu campo de estudio o interés.",
    titulo_video: "Bienvenida a Inglés V / Welcome to English V",
    descripcion_video: "Presentación general: propósito y temas (área de estudio o interés, experiencias personales o escolares, opiniones, proyecto final) vinculados a tu campo de interés.",
    preguntas: [
      { pregunta: "¿Qué campo de estudio o interés explorarás en inglés durante esta UAC?", tipo: "abierta" },
      { pregunta: "Escribe una frase sencilla en inglés sobre por qué te interesa ese campo.", tipo: "abierta" },
      { pregunta: "Esta UAC vincula el aprendizaje del inglés con un campo de estudio o interés del grupo.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-V-P01",
    codigo: "PM-V-P01-VID01",
    titulo: "Video de presentación: Pensamiento Matemático V",
    descripcion: "Video de bienvenida a la UAC: qué aprenderás sobre variación, límites, derivadas y el Teorema Fundamental del Cálculo.",
    titulo_video: "Bienvenida a Pensamiento Matemático V",
    descripcion_video: "Presentación general: propósito y temas (variación promedio e instantánea, límites, derivadas, Teorema Fundamental del Cálculo) para acercarte al cálculo diferencial.",
    preguntas: [
      { pregunta: "¿Qué diferencia hay entre variación promedio y variación instantánea?", tipo: "abierta" },
      { pregunta: "Menciona un concepto del cálculo que estudiarás en esta UAC.", tipo: "abierta" },
      { pregunta: "Esta UAC te introduce de manera intuitiva a los conceptos del cálculo diferencial.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },

  // ───────────────────── VIDEOS BÁSICOS (temas clave) ─────────────────────
  {
    progresion: "CNEYT-V-P09",
    codigo: "CNEYT-V-P09-VID01",
    titulo: "Video básico: Comportamiento de los fluidos",
    descripcion: "Video explicativo sobre las propiedades físicas de los fluidos.",
    titulo_video: "Comportamiento de los fluidos",
    descripcion_video: "Video que explica las propiedades físicas de los fluidos (densidad, presión) y cómo se comportan en reposo y en movimiento.",
    preguntas: [
      { pregunta: "¿Qué diferencia hay entre un fluido en reposo y uno en movimiento?", tipo: "abierta" },
      { pregunta: "¿Cuál de estas es una propiedad física de los fluidos?", tipo: "opcion_multiple", opciones: ["Densidad", "Voltaje", "Frecuencia"], respuesta_correcta: 0 },
      { pregunta: "Los líquidos y los gases se consideran fluidos porque pueden cambiar de forma y fluir.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-V-P07",
    codigo: "CNEYT-V-P07-VID01",
    titulo: "Video básico: Magnetismo, electricidad y sus aplicaciones",
    descripcion: "Video explicativo sobre los fundamentos del magnetismo y la electricidad, y sus aplicaciones tecnológicas.",
    titulo_video: "Magnetismo, electricidad y sus aplicaciones",
    descripcion_video: "Video que explica los fundamentos del magnetismo y la electricidad, su relación (electromagnetismo) y aplicaciones tecnológicas como generadores y motores.",
    preguntas: [
      { pregunta: "¿Qué relación existe entre la electricidad y el magnetismo?", tipo: "abierta" },
      { pregunta: "¿Qué dispositivo transforma energía mecánica en energía eléctrica aprovechando el electromagnetismo?", tipo: "opcion_multiple", opciones: ["Un generador", "Un termómetro", "Una lupa"], respuesta_correcta: 0 },
      { pregunta: "El electromagnetismo tiene aplicaciones tecnológicas en la vida cotidiana.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-V-P10",
    codigo: "PM-V-P10-VID01",
    titulo: "Video básico: El Teorema Fundamental del Cálculo",
    descripcion: "Video explicativo sobre la conexión entre la derivada y la integral.",
    titulo_video: "El Teorema Fundamental del Cálculo",
    descripcion_video: "Video que explica, de manera intuitiva, cómo el Teorema Fundamental del Cálculo conecta la derivada y la integral, y su utilidad para analizar fenómenos de acumulación.",
    preguntas: [
      { pregunta: "¿Qué dos operaciones del cálculo conecta el Teorema Fundamental del Cálculo?", tipo: "abierta" },
      { pregunta: "¿Para qué tipo de fenómenos es útil el Teorema Fundamental del Cálculo?", tipo: "opcion_multiple", opciones: ["Fenómenos de acumulación de cambios continuos", "Solo para contar objetos", "Solo para medir ángulos"], respuesta_correcta: 0 },
      { pregunta: "El Teorema Fundamental del Cálculo relaciona la derivación con la integración.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
];

async function main() {
  const sb = createSB();
  log("\n🎬 Semestre 5 — Actividades de video (tipo 'video_con_preguntas')\n");
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

  log(`\n✅ Sem5 videos: ${ok} insertados, ${fail} fallidos (de ${videos.length}).\n`);
  if (fail > 0) process.exit(1);
}

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
