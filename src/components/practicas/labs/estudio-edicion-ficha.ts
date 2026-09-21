/**
 * Datos de la Ficha Teórica del laboratorio "Estudio de edición de contenido
 * digital" (CD-III, progresión 3; actividades CD-III-P04).
 *
 * Contenido VERBATIM de las actividades ancla:
 *   - Marco teórico: lectura A1 «Participación ciudadana digital: del
 *     activismo en línea al cambio real» (6 párrafos).
 *   - Glosario: glosario interactivo A5 (6 términos).
 * Los conceptos técnicos (píxel, profundidad de color, compresión, capas,
 * contraste, tasa de bits, muestreo) son el modelo del laboratorio.
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";
import { GLOSARIO, LECTURA_A1, FUENTE } from "./estudio-edicion-data";

export const ESTUDIO_EDICION_FICHA: FichaTeoricaData = {
  ancla: "CD-III · P04 · A1 — Participación ciudadana digital: del activismo en línea al cambio real",

  marcoTeorico: LECTURA_A1,

  objetivos: [
    "Explicar qué es un píxel y calcular el peso sin comprimir de una imagen: ancho × alto × bits ÷ 8.",
    "Relacionar la profundidad de color con el número de colores posibles (2 elevado al número de bits).",
    "Distinguir la compresión sin pérdida de la compresión con pérdida y elegir la adecuada para cada contenido.",
    "Usar el orden y la opacidad de las capas para producir un cartel legible, con contraste de al menos 4.5:1.",
    "Calcular el peso de un video o un audio a partir de su tasa de bits y su duración.",
    "Adaptar resolución, cuadros por segundo, tasa de bits y formato a los recursos de la comunidad: datos limitados, un proyector o una radio comunitaria.",
  ],

  materiales: [
    { nombre: "Foto del parque y logotipo del proyecto", detalle: "Imágenes de 64 × 48 píxeles que se pueden reducir, cuantizar y comprimir.", icono: "fa-image" },
    { nombre: "Inspector de bits", detalle: "Muestra los bits de cada canal del píxel elegido.", icono: "fa-microchip" },
    { nombre: "Editor por capas", detalle: "Foto, ajuste de oscurecer, banda oscura y texto, con orden y opacidad.", icono: "fa-layer-group" },
    { nombre: "Codificador de video", detalle: "Resolución de 360p a 2160p, 24, 30 o 60 fps y tasa de 0.5 a 53 Mbps.", icono: "fa-film" },
    { nombre: "Grabadora de audio", detalle: "PCM de 8 a 48 kHz y de 8 a 24 bits, o audio comprimido de 32 a 320 kbps.", icono: "fa-microphone" },
  ],

  conceptos: [
    {
      termino: "Píxel y resolución",
      definicion: "Una imagen digital es una cuadrícula de píxeles; la resolución es cuántos hay a lo ancho y a lo alto. Una foto de 12 MP de celular mide 4000 × 3000 píxeles.",
    },
    {
      termino: "Profundidad de color",
      definicion: "Bits que se guardan por píxel. Con b bits hay 2ᵇ colores posibles: 1 bit, 2 colores; 8 bits, 256; 24 bits (8 por canal R, G y B), 16 777 216.",
    },
    {
      termino: "Peso sin comprimir",
      definicion: "Bytes = ancho × alto × bits ÷ 8. La foto de 12 MP a 24 bits ocupa 4000 × 3000 × 24 ÷ 8 = 36 000 000 bytes = 36 MB.",
    },
    {
      termino: "Compresión sin pérdida",
      definicion: "Reescribe los datos de forma más corta y permite recuperarlos idénticos (PNG, FLAC, ZIP). Aprovecha las repeticiones: rinde mucho en colores planos y poco en fotos con grano.",
    },
    {
      termino: "Compresión con pérdida",
      definicion: "Descarta la información que menos se percibe (JPEG, MP3, AAC, H.264). JPEG divide la imagen en bloques de 8 × 8, los pasa a frecuencias con la DCT y redondea; a calidad baja se ven los bloques.",
    },
    {
      termino: "Capas y opacidad",
      definicion: "Cada capa se dibuja encima de las de abajo: C = α·capa + (1 − α)·fondo. Una capa de ajuste modifica todo lo que queda debajo de ella.",
    },
    {
      termino: "Contraste legible",
      definicion: "Las pautas WCAG 2.x piden al menos 4.5:1 entre texto normal y su fondo. La razón es (L₁ + 0.05) ÷ (L₂ + 0.05), con L la luminancia relativa de cada color.",
    },
    {
      termino: "Tasa de bits",
      definicion: "Bits por segundo de un video o audio. Peso = tasa × duración ÷ 8. Sin comprimir, un video 1080p a 30 fps necesita 1920 × 1080 × 24 × 30 ≈ 1 493 Mbps.",
    },
    {
      termino: "Muestreo y Nyquist",
      definicion: "El audio digital mide la onda muchas veces por segundo. Solo se conservan las frecuencias por debajo de la mitad de la frecuencia de muestreo: a 44.1 kHz, hasta 22.05 kHz.",
    },
  ],

  glosario: GLOSARIO.map((g) => ({ termino: g.termino, definicion: g.definicion })),

  aplicaciones: [
    "Mandar al grupo de la colonia fotos en JPEG y logotipos o capturas de pantalla en PNG.",
    "Poner una banda oscura detrás del texto de un cartel para que se lea sobre cualquier foto.",
    "Exportar el video de un evento en 480p o 720p con una tasa moderada para quienes tienen datos limitados.",
    "Guardar la grabación original de una entrevista en WAV y publicar el episodio en MP3 o AAC.",
    "Revisar que el archivo quepa en la memoria USB del proyector: con FAT32 ningún archivo puede llegar a 4 GiB.",
  ],

  fuente: `${FUENTE} Modelo técnico: ITU-T T.81 (JPEG), W3C WCAG 2.1, guía de codificación recomendada de YouTube.`,
};
