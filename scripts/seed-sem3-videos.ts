/**
 * Semestre 3 — Actividades de video (tipo 'video_con_preguntas').
 * Mismo patrón que seed-sem1-videos.ts / seed-sem2-videos.ts: url_video PLACEHOLDER,
 * estado='borrador' hasta que el cliente entregue los enlaces reales de YouTube.
 * Uso: npx tsx scripts/seed-sem3-videos.ts
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
    progresion: "CNEYT-III-P05",
    codigo: "CNEYT-III-P05-VID01",
    titulo: "Video de presentación: Ciencias Naturales, Experimentales y Tecnología III",
    descripcion: "Video de bienvenida a la UAC: qué aprenderás sobre la Tierra como sistema, ecosistemas y ciclos biogeoquímicos.",
    titulo_video: "Bienvenida a Ciencias Naturales, Experimentales y Tecnología III",
    descripcion_video: "Presentación general de la UAC: propósito y temas (la Tierra como sistema, ecosistemas, fotosíntesis, ciclos biogeoquímicos y deterioro ambiental).",
    preguntas: [
      { pregunta: "¿Qué significa comprender a la Tierra como un sistema, según el video?", tipo: "abierta" },
      { pregunta: "Menciona un subsistema terrestre que estudiarás en esta UAC.", tipo: "abierta" },
      { pregunta: "Los subsistemas terrestres interactúan entre sí y no funcionan de forma aislada.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "IN-III-P01",
    codigo: "IN-III-P01-VID01",
    titulo: "Video de presentación: Inglés III",
    descripcion: "Video de bienvenida a la UAC: qué aprenderás para hablar de rutinas pasadas y experiencias recientes en inglés.",
    titulo_video: "Bienvenida a Inglés III / Welcome to English III",
    descripcion_video: "Presentación general: propósito y temas (rutinas pasadas, experiencias recientes, lugares y recomendaciones, hábitos y preferencias) para hablar del pasado y el presente en inglés.",
    preguntas: [
      { pregunta: "¿Qué tipo de experiencias podrás contar en inglés al terminar esta UAC?", tipo: "abierta" },
      { pregunta: "Escribe una frase sencilla en inglés sobre algo que hiciste la semana pasada.", tipo: "abierta" },
      { pregunta: "En esta UAC aprenderás a hablar sobre rutinas pasadas y experiencias recientes.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "LC-III-P01",
    codigo: "LC-III-P01-VID01",
    titulo: "Video de presentación: Lengua y Comunicación III",
    descripcion: "Video de bienvenida a la UAC: qué aprenderás sobre movimientos literarios, géneros y reseña crítica.",
    titulo_video: "Bienvenida a Lengua y Comunicación III",
    descripcion_video: "Presentación general: propósito y temas (movimientos literarios, géneros literarios, subgéneros narrativos, reseña crítica y exposición oral).",
    preguntas: [
      { pregunta: "¿Qué tomas en cuenta al leer un texto para darle sentido desde tus conocimientos previos?", tipo: "abierta" },
      { pregunta: "Menciona un movimiento o género literario que explorarás en esta UAC.", tipo: "abierta" },
      { pregunta: "Esta UAC busca que analices textos y tomes postura frente a lo que exponen.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PFH-III-P01",
    codigo: "PFH-III-P01-VID01",
    titulo: "Video de presentación: Pensamiento Filosófico y Humanidades III",
    descripcion: "Video de bienvenida a la UAC: qué aprenderás sobre argumentación, filosofía política, arte y estética.",
    titulo_video: "Bienvenida a Pensamiento Filosófico y Humanidades III",
    descripcion_video: "Presentación general: propósito y temas (construcción y evaluación de argumentos, filosofía política, arte y categorías estéticas).",
    preguntas: [
      { pregunta: "¿Qué herramientas filosóficas se mencionan para construir y evaluar argumentos?", tipo: "abierta" },
      { pregunta: "¿Por qué es importante propiciar espacios de debate según el video?", tipo: "abierta" },
      { pregunta: "Esta UAC busca fortalecer tu capacidad argumentativa.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-III-P07",
    codigo: "PM-III-P07-VID01",
    titulo: "Video de presentación: Pensamiento Matemático III",
    descripcion: "Video de bienvenida a la UAC: qué aprenderás sobre ecuaciones lineales, cuadráticas y el Teorema de Pitágoras.",
    titulo_video: "Bienvenida a Pensamiento Matemático III",
    descripcion_video: "Presentación general: propósito y temas (ecuaciones lineales, sistemas de ecuaciones, ecuaciones cuadráticas, Teorema de Pitágoras).",
    preguntas: [
      { pregunta: "¿Qué tipo de ecuaciones aprenderás a resolver en esta UAC?", tipo: "abierta" },
      { pregunta: "Menciona un tema geométrico que se aborda en esta UAC.", tipo: "abierta" },
      { pregunta: "En esta UAC solo se estudian ecuaciones cuadráticas, sin geometría.", tipo: "verdadero_falso", respuesta_correcta: false },
    ],
  },

  // ───────────────────── VIDEOS BÁSICOS (temas clave) ─────────────────────
  {
    progresion: "CNEYT-III-P03",
    codigo: "CNEYT-III-P03-VID01",
    titulo: "Video básico: La fotosíntesis y la cadena trófica",
    descripcion: "Video explicativo sobre el proceso general de la fotosíntesis y su importancia en la cadena trófica.",
    titulo_video: "La fotosíntesis y su papel en la cadena trófica",
    descripcion_video: "Video que explica el proceso general de la fotosíntesis, cómo las plantas capturan dióxido de carbono y liberan oxígeno, y su importancia para transferir energía en la cadena trófica.",
    preguntas: [
      { pregunta: "¿Qué gases intervienen en la fotosíntesis (cuál se captura y cuál se libera)?", tipo: "abierta" },
      { pregunta: "¿Qué organismos realizan la fotosíntesis?", tipo: "opcion_multiple", opciones: ["Solo los animales", "Los organismos fotosintéticos (como plantas y algas)", "Solo los hongos"], respuesta_correcta: 1 },
      { pregunta: "La fotosíntesis es la base de la transferencia de energía en la cadena trófica.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-III-P02",
    codigo: "CNEYT-III-P02-VID01",
    titulo: "Video básico: Flujo de materia y energía en los ecosistemas",
    descripcion: "Video explicativo sobre cómo la materia y la energía fluyen entre los seres vivos y el equilibrio ecológico.",
    titulo_video: "Materia, energía y equilibrio ecológico",
    descripcion_video: "Video que explica cómo la materia y la energía fluyen entre los seres vivos y las esferas terrestres, y por qué este flujo sostiene el equilibrio ecológico.",
    preguntas: [
      { pregunta: "¿Qué es una cadena trófica?", tipo: "abierta" },
      { pregunta: "¿Qué ocurre cuando se rompe el equilibrio ecológico de un ecosistema?", tipo: "opcion_multiple", opciones: ["No pasa nada, el ecosistema se mantiene igual", "Se altera el flujo de materia y energía entre sus componentes", "Solo afecta a las plantas"], respuesta_correcta: 1 },
      { pregunta: "La materia y la energía fluyen entre los organismos y las esferas terrestres de forma interconectada.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-III-P01",
    codigo: "PM-III-P01-VID01",
    titulo: "Video básico: El Teorema de Pitágoras",
    descripcion: "Video explicativo sobre el Teorema de Pitágoras y sus aplicaciones geométricas.",
    titulo_video: "El Teorema de Pitágoras",
    descripcion_video: "Video que explica el Teorema de Pitágoras, su fórmula (a² + b² = c²) y su aplicación en situaciones geométricas y de medición.",
    preguntas: [
      { pregunta: "¿En qué tipo de triángulo se aplica el Teorema de Pitágoras?", tipo: "abierta" },
      { pregunta: "Si los catetos de un triángulo rectángulo miden 3 y 4, ¿cuánto mide la hipotenusa?", tipo: "opcion_multiple", opciones: ["5", "6", "7"], respuesta_correcta: 0 },
      { pregunta: "El Teorema de Pitágoras relaciona los catetos y la hipotenusa de un triángulo rectángulo.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
];

async function main() {
  const sb = createSB();
  log("\n🎬 Semestre 3 — Actividades de video (tipo 'video_con_preguntas')\n");
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

  log(`\n✅ Sem3 videos: ${ok} insertados, ${fail} fallidos (de ${videos.length}).\n`);
  if (fail > 0) process.exit(1);
}

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
