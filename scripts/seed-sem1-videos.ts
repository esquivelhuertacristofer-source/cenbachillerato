/**
 * Semestre 1 — Actividades de video (tipo 'video_con_preguntas').
 * El cliente graba y sube los videos a YouTube y nos pasará las URLs; aquí
 * dejamos la ESTRUCTURA lista (título, descripción, preguntas de comprensión)
 * con url_video PLACEHOLDER para que solo reemplace el enlace.
 * Plan: 1 video de presentación por materia (anclado a P01 de cada UAC) +
 * básicos sobre temas clave. estado='borrador' hasta validación del cliente.
 * Uso: npx tsx scripts/seed-sem1-videos.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionId, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

const PLACEHOLDER = "https://www.youtube.com/embed/PENDIENTE"; // el cliente reemplaza el ID

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
  // ───────────────────── VIDEOS DE PRESENTACIÓN (1 por materia, P01) ─────────────────────
  {
    progresion: "LC-I-P01",
    codigo: "LC-I-P01-VID01",
    titulo: "Video de presentación: Lengua y Comunicación I",
    descripcion: "Video de bienvenida a la UAC: qué aprenderás, cómo se evalúa y por qué la lectura y la escritura son herramientas para la vida.",
    titulo_video: "Bienvenida a Lengua y Comunicación I",
    descripcion_video: "Presentación general de la Unidad de Aprendizaje Curricular: propósito, temas que se abordarán y la importancia de la lectura y la escritura como prácticas sociales del lenguaje.",
    preguntas: [
      { pregunta: "¿Cuál es el propósito principal de esta UAC según el video?", tipo: "abierta" },
      { pregunta: "Menciona dos habilidades de comunicación que esperas desarrollar en este curso.", tipo: "abierta" },
      { pregunta: "La lectura y la escritura se presentan como prácticas sociales del lenguaje.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-I-P01",
    codigo: "PM-I-P01-VID01",
    titulo: "Video de presentación: Pensamiento Matemático I",
    descripcion: "Video de bienvenida a la UAC: qué aprenderás y por qué las matemáticas son una construcción humana presente en la vida cotidiana.",
    titulo_video: "Bienvenida a Pensamiento Matemático I",
    descripcion_video: "Presentación general de la UAC: propósito, temas (lógica, números, fracciones, proporciones, etc.) y las matemáticas como construcción humana con historia y diversidad cultural.",
    preguntas: [
      { pregunta: "¿Por qué se afirma en el video que las matemáticas son una construcción humana?", tipo: "abierta" },
      { pregunta: "Menciona un tema de los que estudiarás en esta UAC.", tipo: "abierta" },
      { pregunta: "Las matemáticas, según el video, no tienen relación con la vida cotidiana.", tipo: "verdadero_falso", respuesta_correcta: false },
    ],
  },
  {
    progresion: "CNEYT-I-P01",
    codigo: "CNEYT-I-P01-VID01",
    titulo: "Video de presentación: Ciencias Naturales, Experimentales y Tecnología I",
    descripcion: "Video de bienvenida a la UAC: qué aprenderás y por qué la ciencia es una práctica social que busca explicar el mundo.",
    titulo_video: "Bienvenida a Ciencias Naturales, Experimentales y Tecnología I",
    descripcion_video: "Presentación general de la UAC: propósito, temas (materia, átomo, energía, etc.) y la ciencia como práctica social construida colectivamente.",
    preguntas: [
      { pregunta: "Según el video, ¿qué significa que la ciencia sea una práctica social?", tipo: "abierta" },
      { pregunta: "Menciona un tema de Ciencias que estudiarás en esta UAC.", tipo: "abierta" },
      { pregunta: "La ciencia se construye de forma individual y aislada.", tipo: "verdadero_falso", respuesta_correcta: false },
    ],
  },
  {
    progresion: "CS-I-P01",
    codigo: "CS-I-P01-VID01",
    titulo: "Video de presentación: Ciencias Sociales I",
    descripcion: "Video de bienvenida a la UAC: qué aprenderás sobre el Estado, la ciudadanía, las normas y la diversidad en la vida democrática.",
    titulo_video: "Bienvenida a Ciencias Sociales I",
    descripcion_video: "Presentación general de la UAC: propósito y temas (el Estado, la ciudadanía, las normas sociales y la diversidad en la democracia).",
    preguntas: [
      { pregunta: "¿Qué temas centrales abordarás en esta UAC según el video?", tipo: "abierta" },
      { pregunta: "¿Por qué es importante comprender qué es el Estado y la ciudadanía?", tipo: "abierta" },
      { pregunta: "Las Ciencias Sociales estudian la convivencia y la organización de las sociedades.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "IN-I-P01",
    codigo: "IN-I-P01-VID01",
    titulo: "Video de presentación: Inglés I",
    descripcion: "Video de bienvenida a la UAC: qué aprenderás para comunicarte en inglés en situaciones básicas y cotidianas.",
    titulo_video: "Bienvenida a Inglés I / Welcome to English I",
    descripcion_video: "Presentación general de la UAC: propósito y temas (presentaciones personales, interacciones en el aula, información personal, gustos, etc.) para una comunicación básica en inglés.",
    preguntas: [
      { pregunta: "¿Qué situaciones de comunicación en inglés podrás manejar al final de la UAC?", tipo: "abierta" },
      { pregunta: "Escribe una frase sencilla en inglés para presentarte (tu nombre y de dónde eres).", tipo: "abierta" },
      { pregunta: "El curso busca que te comuniques en inglés en situaciones cotidianas básicas.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PFH-I-P01",
    codigo: "PFH-I-P01-VID01",
    titulo: "Video de presentación: La Persona Humana / Filosofía I",
    descripcion: "Video de bienvenida a la UAC: qué significa filosofar y cómo el pensamiento crítico ayuda a comprender la vida humana.",
    titulo_video: "Bienvenida a la UAC: filosofar y humanismo",
    descripcion_video: "Presentación general de la UAC: propósito y temas (qué es filosofar, las preguntas filosóficas, el sentido de la vida, el diálogo y las tradiciones filosóficas).",
    preguntas: [
      { pregunta: "Según el video, ¿qué significa «filosofar»?", tipo: "abierta" },
      { pregunta: "Escribe una pregunta filosófica que te interese explorar.", tipo: "abierta" },
      { pregunta: "Filosofar implica preguntarse y reflexionar de forma crítica sobre la vida.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CD-I-P01",
    codigo: "CD-I-P01-VID01",
    titulo: "Video de presentación: Cultura Digital I",
    descripcion: "Video de bienvenida a la UAC: qué aprenderás sobre hardware, software, ciudadanía digital y pensamiento algorítmico.",
    titulo_video: "Bienvenida a Cultura Digital I",
    descripcion_video: "Presentación general de la UAC: propósito y temas (hardware y software, ciudadanía y derechos digitales, pensamiento algorítmico y herramientas digitales).",
    preguntas: [
      { pregunta: "¿Qué temas de Cultura Digital estudiarás en esta UAC según el video?", tipo: "abierta" },
      { pregunta: "Menciona la diferencia básica entre hardware y software.", tipo: "abierta" },
      { pregunta: "La UAC busca que uses la tecnología de forma crítica y responsable.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },

  // ───────────────────── VIDEOS BÁSICOS (temas clave) ─────────────────────
  {
    progresion: "CNEYT-I-P03",
    codigo: "CNEYT-I-P03-VID01",
    titulo: "Video básico: El átomo y los modelos atómicos",
    descripcion: "Video explicativo sobre la estructura del átomo y la evolución de los modelos atómicos, de Dalton a la actualidad.",
    titulo_video: "El átomo y la evolución de los modelos atómicos",
    descripcion_video: "Video que explica las partículas que forman el átomo (protones, neutrones, electrones) y cómo fueron cambiando los modelos atómicos (Dalton, Thomson, Rutherford, Bohr, Schrödinger).",
    preguntas: [
      { pregunta: "¿Cuáles son las tres partículas subatómicas principales y dónde se ubican?", tipo: "abierta" },
      { pregunta: "¿Qué modelo atómico propuso que los electrones giran en órbitas o niveles definidos?", tipo: "opcion_multiple", opciones: ["Modelo de Dalton", "Modelo de Bohr", "Modelo de Thomson"], respuesta_correcta: 1 },
      { pregunta: "El modelo atómico ha cambiado a lo largo del tiempo gracias a nuevas evidencias.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-I-P05",
    codigo: "CNEYT-I-P05-VID01",
    titulo: "Video básico: Los estados de la materia",
    descripcion: "Video explicativo sobre los estados de agregación (sólido, líquido, gaseoso) y sus cambios en función de la energía.",
    titulo_video: "Estados de la materia y cambios de estado",
    descripcion_video: "Video que explica los estados de agregación de la materia, cómo se organizan las partículas en cada uno y cómo la energía (calor) produce los cambios de estado (fusión, ebullición, etc.).",
    preguntas: [
      { pregunta: "¿Cómo están organizadas las partículas en un sólido en comparación con un gas?", tipo: "abierta" },
      { pregunta: "¿Cómo se llama el cambio de estado de líquido a gas?", tipo: "opcion_multiple", opciones: ["Fusión", "Ebullición (evaporación)", "Solidificación"], respuesta_correcta: 1 },
      { pregunta: "Al aumentar la temperatura, las partículas se mueven con mayor energía.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-I-P04",
    codigo: "PM-I-P04-VID01",
    titulo: "Video básico: Fracciones y su significado",
    descripcion: "Video explicativo sobre qué es una fracción, sus partes y cómo reconocer fracciones equivalentes.",
    titulo_video: "¿Qué es una fracción?",
    descripcion_video: "Video que explica el concepto de fracción como parte de un entero, el significado del numerador y del denominador, y cómo identificar fracciones equivalentes.",
    preguntas: [
      { pregunta: "¿Qué indican el numerador y el denominador de una fracción?", tipo: "abierta" },
      { pregunta: "¿Cuál de estas fracciones es equivalente a 1/2?", tipo: "opcion_multiple", opciones: ["2/4", "1/3", "3/5"], respuesta_correcta: 0 },
      { pregunta: "Una fracción representa una parte de un todo o unidad.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-I-P05",
    codigo: "PM-I-P05-VID01",
    titulo: "Video básico: Razón y proporción",
    descripcion: "Video explicativo sobre el concepto de razón, proporción y proporcionalidad directa con ejemplos cotidianos.",
    titulo_video: "Razón y proporción en la vida diaria",
    descripcion_video: "Video que explica qué es una razón, cuándo dos razones forman una proporción y cómo resolver situaciones de proporcionalidad directa (recetas, precios, escalas).",
    preguntas: [
      { pregunta: "¿Qué diferencia hay entre una razón y una proporción?", tipo: "abierta" },
      { pregunta: "Si 2 kg de fruta cuestan $40, ¿cuánto cuestan 3 kg (proporcionalidad directa)?", tipo: "opcion_multiple", opciones: ["$50", "$60", "$80"], respuesta_correcta: 1 },
      { pregunta: "En una proporción, dos razones son equivalentes.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "LC-I-P04",
    codigo: "LC-I-P04-VID01",
    titulo: "Video básico: Tipos de párrafo",
    descripcion: "Video explicativo sobre los principales tipos de párrafo (narrativo, descriptivo, expositivo, argumentativo) y su función en un texto.",
    titulo_video: "Los tipos de párrafo y su función",
    descripcion_video: "Video que explica qué es un párrafo, su estructura (idea principal e ideas secundarias) y los distintos tipos de párrafo según su intención comunicativa.",
    preguntas: [
      { pregunta: "¿Qué es la idea principal de un párrafo?", tipo: "abierta" },
      { pregunta: "¿Qué tipo de párrafo busca convencer al lector de una postura?", tipo: "opcion_multiple", opciones: ["Descriptivo", "Argumentativo", "Narrativo"], respuesta_correcta: 1 },
      { pregunta: "Un párrafo desarrolla una idea principal apoyada por ideas secundarias.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
];

async function main() {
  const sb = createSB();
  log("\n🎬 Semestre 1 — Actividades de video (tipo 'video_con_preguntas')\n");
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

  log(`\n✅ Sem1 videos: ${ok} insertados, ${fail} fallidos (de ${videos.length}).\n`);
  if (fail > 0) process.exit(1);
}

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
