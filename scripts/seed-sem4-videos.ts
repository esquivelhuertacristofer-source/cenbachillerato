/**
 * Semestre 4 — Actividades de video (tipo 'video_con_preguntas').
 * Mismo patrón que seed-sem1-videos.ts: url_video PLACEHOLDER,
 * estado='borrador' hasta que el cliente entregue los enlaces reales de YouTube.
 * Uso: npx tsx scripts/seed-sem4-videos.ts
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
    progresion: "CH-I-P02",
    codigo: "CH-I-P02-VID01",
    titulo: "Video de presentación: Conciencia Histórica I",
    descripcion: "Video de bienvenida a la UAC: qué aprenderás sobre el pasado, el presente y el futuro como procesos históricos.",
    titulo_video: "Bienvenida a Conciencia Histórica I",
    descripcion_video: "Presentación general de la UAC: propósito y temas (problematización del pasado, presente y futuro, conexiones entre procesos históricos, diversidad de discursos).",
    preguntas: [
      { pregunta: "¿Por qué es importante problematizar el pasado, el presente y el futuro según el video?", tipo: "abierta" },
      { pregunta: "Menciona un proceso histórico que te gustaría analizar en esta UAC.", tipo: "abierta" },
      { pregunta: "Esta UAC busca comprender críticamente la continuidad y el cambio histórico.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-IV-P02",
    codigo: "CNEYT-IV-P02-VID01",
    titulo: "Video de presentación: Ciencias Naturales, Experimentales y Tecnología IV",
    descripcion: "Video de bienvenida a la UAC: qué aprenderás sobre reacciones químicas, ácidos y bases, y biomoléculas.",
    titulo_video: "Bienvenida a Ciencias Naturales, Experimentales y Tecnología IV",
    descripcion_video: "Presentación general de la UAC: propósito y temas (reacciones químicas, ácidos y bases, compuestos orgánicos, biomoléculas).",
    preguntas: [
      { pregunta: "¿Qué son las reacciones químicas según el video?", tipo: "abierta" },
      { pregunta: "Menciona un tema de química que estudiarás en esta UAC.", tipo: "abierta" },
      { pregunta: "En esta UAC solo se estudian compuestos inorgánicos.", tipo: "verdadero_falso", respuesta_correcta: false },
    ],
  },
  {
    progresion: "CS-III-P02",
    codigo: "CS-III-P02-VID01",
    titulo: "Video de presentación: Ciencias Sociales III",
    descripcion: "Video de bienvenida a la UAC: qué aprenderás sobre políticas públicas, desigualdades y actores sociales.",
    titulo_video: "Bienvenida a Ciencias Sociales III",
    descripcion_video: "Presentación general de la UAC: propósito y temas (políticas públicas, desigualdades, actores sociales, juventudes).",
    preguntas: [
      { pregunta: "¿Qué son las políticas públicas según el video?", tipo: "abierta" },
      { pregunta: "¿Por qué es importante analizar el papel de distintos actores sociales?", tipo: "abierta" },
      { pregunta: "Esta UAC busca que te reconozcas como agente crítico y de transformación social.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "IN-IV-P01",
    codigo: "IN-IV-P01-VID01",
    titulo: "Video de presentación: Inglés IV",
    descripcion: "Video de bienvenida a la UAC: qué aprenderás para narrar experiencias pasadas con mayor detalle en inglés.",
    titulo_video: "Bienvenida a Inglés IV / Welcome to English IV",
    descripcion_video: "Presentación general: propósito y temas (experiencias pasadas, preferencias, rutinas y hábitos, consejos) para comunicarte con mayor detalle en inglés.",
    preguntas: [
      { pregunta: "¿Qué tipo de experiencias pasadas podrás narrar con más detalle en inglés?", tipo: "abierta" },
      { pregunta: "Escribe una frase sencilla en inglés expresando una preferencia.", tipo: "abierta" },
      { pregunta: "En esta UAC aprenderás a narrar experiencias pasadas con mayor conexión y detalle.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-IV-P06",
    codigo: "PM-IV-P06-VID01",
    titulo: "Video de presentación: Pensamiento Matemático IV",
    descripcion: "Video de bienvenida a la UAC: qué aprenderás sobre geometría analítica, trigonometría y funciones.",
    titulo_video: "Bienvenida a Pensamiento Matemático IV",
    descripcion_video: "Presentación general: propósito y temas (recta y punto, razones trigonométricas, funciones cuadráticas, ecuación de la circunferencia).",
    preguntas: [
      { pregunta: "¿Qué elementos geométricos básicos se presentan al inicio de esta UAC?", tipo: "abierta" },
      { pregunta: "Menciona un tema de geometría analítica que estudiarás.", tipo: "abierta" },
      { pregunta: "Esta UAC conecta la geometría con el álgebra mediante el plano cartesiano.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },

  // ───────────────────── VIDEOS BÁSICOS (temas clave) ─────────────────────
  {
    progresion: "CNEYT-IV-P09",
    codigo: "CNEYT-IV-P09-VID01",
    titulo: "Video básico: Reacciones de óxido-reducción y combustión",
    descripcion: "Video explicativo sobre las reacciones redox y su relación con la combustión.",
    titulo_video: "Óxido-reducción y combustión",
    descripcion_video: "Video que explica qué es una reacción de óxido-reducción (redox), cómo ocurre la transferencia de electrones y su relación con la combustión.",
    preguntas: [
      { pregunta: "¿Qué ocurre con los electrones en una reacción de óxido-reducción?", tipo: "abierta" },
      { pregunta: "¿Qué tipo de reacción es la combustión?", tipo: "opcion_multiple", opciones: ["Una reacción de óxido-reducción", "Una reacción ácido-base", "Un cambio de estado físico"], respuesta_correcta: 0 },
      { pregunta: "En toda reacción redox, una sustancia se oxida mientras otra se reduce.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-IV-P05",
    codigo: "CNEYT-IV-P05-VID01",
    titulo: "Video básico: Las biomoléculas y su función",
    descripcion: "Video explicativo sobre las principales biomoléculas y su importancia para los seres vivos.",
    titulo_video: "Las biomoléculas y su función",
    descripcion_video: "Video que explica las principales biomoléculas (carbohidratos, lípidos, proteínas y ácidos nucleicos) y su importancia para los seres vivos.",
    preguntas: [
      { pregunta: "Menciona dos tipos de biomoléculas y su función principal.", tipo: "abierta" },
      { pregunta: "¿Qué biomolécula es la principal fuente de energía inmediata para las células?", tipo: "opcion_multiple", opciones: ["Proteínas", "Carbohidratos", "Ácidos nucleicos"], respuesta_correcta: 1 },
      { pregunta: "Las biomoléculas son compuestos orgánicos esenciales para el funcionamiento de los seres vivos.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-IV-P01",
    codigo: "PM-IV-P01-VID01",
    titulo: "Video básico: La ecuación de la recta",
    descripcion: "Video explicativo sobre cómo se obtiene la ecuación de la recta.",
    titulo_video: "La ecuación de la recta",
    descripcion_video: "Video que explica cómo se obtiene la ecuación de la recta a partir de la relación de proporcionalidad directa entre dos variables.",
    preguntas: [
      { pregunta: "¿Qué representa la pendiente de una recta?", tipo: "abierta" },
      { pregunta: "¿Cuál es la forma general de la ecuación de la recta (pendiente-ordenada al origen)?", tipo: "opcion_multiple", opciones: ["y = mx + b", "a² + b² = c²", "y = x²"], respuesta_correcta: 0 },
      { pregunta: "La ecuación de la recta describe una relación de proporcionalidad directa entre dos variables cuando pasa por el origen.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-IV-P03",
    codigo: "PM-IV-P03-VID01",
    titulo: "Video básico: Razones trigonométricas en el triángulo rectángulo",
    descripcion: "Video explicativo sobre las razones trigonométricas y su relación con los triángulos rectángulos.",
    titulo_video: "Razones trigonométricas en el triángulo rectángulo",
    descripcion_video: "Video que explica las razones trigonométricas (seno, coseno y tangente) a partir de la relación entre los lados y los ángulos de un triángulo rectángulo.",
    preguntas: [
      { pregunta: "¿Qué lados de un triángulo rectángulo se relacionan en el seno de un ángulo?", tipo: "abierta" },
      { pregunta: "¿Cuál de estas es una razón trigonométrica?", tipo: "opcion_multiple", opciones: ["Perímetro", "Tangente", "Discriminante"], respuesta_correcta: 1 },
      { pregunta: "Las razones trigonométricas relacionan los ángulos y los lados de un triángulo rectángulo.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
];

async function main() {
  const sb = createSB();
  log("\n🎬 Semestre 4 — Actividades de video (tipo 'video_con_preguntas')\n");
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

  log(`\n✅ Sem4 videos: ${ok} insertados, ${fail} fallidos (de ${videos.length}).\n`);
  if (fail > 0) process.exit(1);
}

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
