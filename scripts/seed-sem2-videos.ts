/**
 * Semestre 2 — Actividades de video (tipo 'video_con_preguntas').
 * El cliente graba y sube los videos a YouTube y nos pasará las URLs; aquí
 * dejamos la ESTRUCTURA lista (título, descripción, preguntas de comprensión)
 * con url_video PLACEHOLDER para que solo reemplace el enlace.
 * Plan: 1 video de presentación por materia (anclado a numero=1 de cada UAC) +
 * básicos sobre temas clave. estado='borrador' hasta validación del cliente.
 * Uso: npx tsx scripts/seed-sem2-videos.ts
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
  // ───────────────────── VIDEOS DE PRESENTACIÓN (1 por materia, numero=1) ─────────────────────
  {
    progresion: "LC-II-P01",
    codigo: "LC-II-P01-VID01",
    titulo: "Video de presentación: Lengua y Comunicación II",
    descripcion: "Video de bienvenida a la UAC: qué aprenderás sobre narrativa, historia de vida y escritura creativa.",
    titulo_video: "Bienvenida a Lengua y Comunicación II",
    descripcion_video: "Presentación general de la UAC: propósito y temas (narración de la historia de vida, textos descriptivos y narrativos, narrativa popular).",
    preguntas: [
      { pregunta: "¿Qué tipo de textos aprenderás a escribir en esta UAC?", tipo: "abierta" },
      { pregunta: "¿Por qué narrar la propia historia de vida puede ser una herramienta de aprendizaje?", tipo: "abierta" },
      { pregunta: "En esta UAC se trabaja con narrativa popular y textos propios del estudiante.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-II-P01",
    codigo: "PM-II-P01-VID01",
    titulo: "Video de presentación: Pensamiento Matemático II",
    descripcion: "Video de bienvenida a la UAC: qué aprenderás sobre álgebra, expresiones algebraicas y ecuaciones.",
    titulo_video: "Bienvenida a Pensamiento Matemático II",
    descripcion_video: "Presentación general de la UAC: propósito y temas (lenguaje algebraico, monomios, binomios, polinomios y ecuaciones) a partir de situaciones de interés.",
    preguntas: [
      { pregunta: "¿Qué representa el lenguaje algebraico según el video?", tipo: "abierta" },
      { pregunta: "Menciona un tipo de expresión algebraica que estudiarás (monomio, binomio, etc.).", tipo: "abierta" },
      { pregunta: "El álgebra permite representar operaciones aritméticas con letras y símbolos.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-II-P02",
    codigo: "CNEYT-II-P02-VID01",
    titulo: "Video de presentación: Ciencias Naturales, Experimentales y Tecnología II",
    descripcion: "Video de bienvenida a la UAC: qué aprenderás sobre energía, movimiento, calor y termodinámica.",
    titulo_video: "Bienvenida a Ciencias Naturales, Experimentales y Tecnología II",
    descripcion_video: "Presentación general de la UAC: propósito y temas (energía, fuerza y movimiento, calor y termodinámica) a partir del análisis de fenómenos naturales cotidianos.",
    preguntas: [
      { pregunta: "Según el video, ¿qué significa que la energía se transforma y se transfiere sin destruirse?", tipo: "abierta" },
      { pregunta: "Menciona un tema de física que estudiarás en esta UAC.", tipo: "abierta" },
      { pregunta: "La energía puede crearse y destruirse libremente según esta UAC.", tipo: "verdadero_falso", respuesta_correcta: false },
    ],
  },
  {
    progresion: "CS-II-P01",
    codigo: "CS-II-P01-VID01",
    titulo: "Video de presentación: Ciencias Sociales II",
    descripcion: "Video de bienvenida a la UAC: qué aprenderás sobre necesidades, satisfactores y organización social.",
    titulo_video: "Bienvenida a Ciencias Sociales II",
    descripcion_video: "Presentación general de la UAC: propósito y temas (necesidades y satisfactores, formas de organización social, producción y distribución de bienes, relaciones de poder).",
    preguntas: [
      { pregunta: "¿Qué son los satisfactores según el video?", tipo: "abierta" },
      { pregunta: "Menciona una forma de organización social que se analizará en esta UAC.", tipo: "abierta" },
      { pregunta: "Esta UAC solo estudia la economía, sin analizar relaciones de poder.", tipo: "verdadero_falso", respuesta_correcta: false },
    ],
  },
  {
    progresion: "IN-II-P01",
    codigo: "IN-II-P01-VID01",
    titulo: "Video de presentación: Inglés II",
    descripcion: "Video de bienvenida a la UAC: qué aprenderás para describir rutinas y actividades cotidianas en inglés.",
    titulo_video: "Bienvenida a Inglés II / Welcome to English II",
    descripcion_video: "Presentación general de la UAC: propósito y temas (rutinas diarias, actividades de tiempo libre, habilidades y permisos, descripciones) para ampliar tu comunicación en inglés.",
    preguntas: [
      { pregunta: "¿Qué tipo de rutinas y actividades podrás describir en inglés al final de la UAC?", tipo: "abierta" },
      { pregunta: "Escribe una frase sencilla en inglés sobre algo que haces todos los días.", tipo: "abierta" },
      { pregunta: "En esta UAC aprenderás a hablar de acciones frecuentes y organizarlas en el tiempo.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PFH-II-P01",
    codigo: "PFH-II-P01-VID01",
    titulo: "Video de presentación: Pensamiento Filosófico y Humanidades II",
    descripcion: "Video de bienvenida a la UAC: qué aprenderás sobre el Ser, la existencia y el conocimiento desde la filosofía.",
    titulo_video: "Bienvenida a Pensamiento Filosófico y Humanidades II",
    descripcion_video: "Presentación general de la UAC: propósito y temas (fundamentos ontológicos, ética, ciencia y tecnología, género) desde el análisis filosófico.",
    preguntas: [
      { pregunta: "¿Qué pregunta filosófica sobre el Ser plantea el video?", tipo: "abierta" },
      { pregunta: "¿Por qué es importante cuestionar los fundamentos éticos en la vida cotidiana?", tipo: "abierta" },
      { pregunta: "Esta UAC busca desarrollar un pensamiento crítico sobre la Existencia, el Ser y el Conocimiento.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CD-II-P01",
    codigo: "CD-II-P01-VID01",
    titulo: "Video de presentación: Cultura Digital II",
    descripcion: "Video de bienvenida a la UAC: qué aprenderás sobre herramientas digitales, comunicación en equipos colaborativos y difusión de información.",
    titulo_video: "Bienvenida a Cultura Digital II",
    descripcion_video: "Presentación general de la UAC: propósito y temas (herramientas digitales de investigación, comunicación colaborativa, procesamiento de datos y difusión de información en la web).",
    preguntas: [
      { pregunta: "¿Qué temas de Cultura Digital II se presentan en el video?", tipo: "abierta" },
      { pregunta: "¿Por qué es importante saber discriminar y gestionar información en internet?", tipo: "abierta" },
      { pregunta: "Esta UAC solo se enfoca en el manejo de hardware, sin herramientas de comunicación.", tipo: "verdadero_falso", respuesta_correcta: false },
    ],
  },

  // ───────────────────── VIDEOS BÁSICOS (temas clave) ─────────────────────
  {
    progresion: "CNEYT-II-P09",
    codigo: "CNEYT-II-P09-VID01",
    titulo: "Video básico: Gas ideal y primera ley de la termodinámica",
    descripcion: "Video explicativo sobre las propiedades de un gas ideal y la primera ley de la termodinámica.",
    titulo_video: "El gas ideal y la primera ley de la termodinámica",
    descripcion_video: "Video que explica la relación entre presión, volumen y temperatura de un gas ideal, y cómo la primera ley de la termodinámica describe la conservación de la energía en procesos térmicos.",
    preguntas: [
      { pregunta: "¿Qué variables relacionan las leyes de los gases ideales?", tipo: "abierta" },
      { pregunta: "¿Qué establece la primera ley de la termodinámica?", tipo: "opcion_multiple", opciones: ["La energía se crea en cada proceso", "La energía se conserva: el calor se transforma en trabajo o energía interna", "El calor siempre fluye del frío al caliente"], respuesta_correcta: 1 },
      { pregunta: "Un gas ideal es un modelo que simplifica el comportamiento real de los gases.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-II-P11",
    codigo: "CNEYT-II-P11-VID01",
    titulo: "Video básico: Formas de propagación del calor",
    descripcion: "Video explicativo sobre conducción, convección y radiación como formas de propagación del calor.",
    titulo_video: "Conducción, convección y radiación: cómo se propaga el calor",
    descripcion_video: "Video que explica las tres formas en que el calor se transfiere entre cuerpos y con el entorno: conducción (contacto directo), convección (movimiento de fluidos) y radiación (ondas electromagnéticas).",
    preguntas: [
      { pregunta: "Da un ejemplo cotidiano de propagación de calor por conducción.", tipo: "abierta" },
      { pregunta: "¿Qué forma de propagación de calor no requiere un medio material (funciona incluso en el vacío)?", tipo: "opcion_multiple", opciones: ["Conducción", "Convección", "Radiación"], respuesta_correcta: 2 },
      { pregunta: "La convección ocurre principalmente en líquidos y gases, por el movimiento de sus partículas.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-II-P09",
    codigo: "PM-II-P09-VID01",
    titulo: "Video básico: ¿Qué es una ecuación?",
    descripcion: "Video explicativo sobre el concepto de ecuación, la igualdad matemática y cómo encontrar el valor de una incógnita.",
    titulo_video: "El concepto de ecuación y la incógnita",
    descripcion_video: "Video que explica qué es una ecuación como igualdad matemática, qué representa la incógnita y los pasos básicos para despejarla en situaciones de interés.",
    preguntas: [
      { pregunta: "¿Qué es una incógnita dentro de una ecuación?", tipo: "abierta" },
      { pregunta: "En la ecuación x + 5 = 12, ¿cuál es el valor de x?", tipo: "opcion_multiple", opciones: ["5", "7", "12"], respuesta_correcta: 1 },
      { pregunta: "Una ecuación es una igualdad matemática que puede contener una o más incógnitas.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
];

async function main() {
  const sb = createSB();
  log("\n🎬 Semestre 2 — Actividades de video (tipo 'video_con_preguntas')\n");
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

  log(`\n✅ Sem2 videos: ${ok} insertados, ${fail} fallidos (de ${videos.length}).\n`);
  if (fail > 0) process.exit(1);
}

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
