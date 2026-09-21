/**
 * Ficha Teórica del laboratorio "El descubrimiento de la célula"
 * (CNEYT-VI, progresión 2; actividades CNEYT-VI-P10).
 *
 * Contenido VERBATIM de las actividades ancla:
 *   - Marco teórico: lectura A1 «El descubrimiento de la célula y el nacimiento
 *     de la teoría celular» (5 párrafos).
 *   - Glosario: glosario interactivo A5 (10 términos).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";
import { GLOSARIO, LECTURA_A1, FUENTE } from "./descubrimiento-celula-data";

export const DESCUBRIMIENTO_CELULA_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-VI · P10 · A1 — El descubrimiento de la célula y el nacimiento de la teoría celular",

  marcoTeorico: LECTURA_A1,

  objetivos: [
    "Explicar por qué la célula no pudo descubrirse sin el microscopio.",
    "Distinguir aumento de resolución y reconocer el límite de la luz (≈ 0.2 µm) frente al microscopio electrónico.",
    "Calcular el aumento total (ocular × objetivo) y el tamaño real de una célula a partir de su tamaño en la imagen.",
    "Ubicar en el tiempo los aportes de Hooke, Leeuwenhoek, Schleiden, Schwann, Remak, Virchow y Pasteur.",
    "Relacionar cada evidencia histórica con el postulado de la teoría celular que sostiene.",
    "Explicar cómo el experimento de Pasteur descartó la generación espontánea.",
  ],

  materiales: [
    { nombre: "Seis instrumentos", detalle: "Ojo, microscopio de Hooke (1665), lente de Leeuwenhoek, compuesto acromático del siglo XIX, óptico moderno y electrónico.", icono: "fa-microscope" },
    { nombre: "Cinco muestras", detalle: "Corcho, agua de estanque, epidermis de cebolla, células de mejilla y bacterias con virus.", icono: "fa-vial" },
    { nombre: "Revólver, oculares y calibrador", detalle: "Objetivos de 4×, 10×, 40× y 100× (inmersión); oculares de 10× y 15×.", icono: "fa-ruler-combined" },
    { nombre: "Matraces de Pasteur", detalle: "Uno de cuello recto y uno de cuello de cisne, con caldo hervido.", icono: "fa-flask" },
  ],

  conceptos: [
    { termino: "Aumento total", definicion: "Aumento del ocular multiplicado por el del objetivo: 10× · 40× = 400×." },
    { termino: "Tamaño real", definicion: "Tamaño en la imagen dividido entre el aumento total: 24 mm ÷ 400 = 0.06 mm = 60 µm." },
    { termino: "Resolución", definicion: "La distancia mínima a la que dos puntos se ven separados. Aumentar una imagen borrosa solo la hace más grande, no más nítida." },
    { termino: "Límite de difracción (Abbe, 1873)", definicion: "Con luz, d = λ / (2·AN). Con luz verde (550 nm) y un objetivo de inmersión (AN ≈ 1.25–1.4) el límite es ≈ 0.2 µm." },
    { termino: "Aumento vacío", definicion: "Por encima de unas 1000 veces la apertura numérica del objetivo, la imagen crece pero no aparece detalle nuevo." },
    { termino: "Microscopio electrónico", definicion: "Usa electrones, de longitud de onda mucho menor que la luz, y lentes magnéticas; en muestras biológicas distingue unos 2 nm." },
    { termino: "Generación espontánea", definicion: "Idea de que la vida surge sola de la materia inerte. Pasteur (1859–1862) mostró que un caldo hervido protegido del polvo del aire no produce microbios." },
  ],

  glosario: GLOSARIO.map((g) => ({ termino: g.termino, definicion: g.definicion })),

  aplicaciones: [
    "Los laboratorios de patología de los hospitales diagnostican enfermedades observando células de biopsias al microscopio.",
    "El conteo de glóbulos y la búsqueda de parásitos en sangre se hacen con microscopio óptico.",
    "Los virus, como el de la influenza, se estudian con microscopio electrónico porque miden unos 100 nm.",
    "La pasteurización de la leche aplica la idea de Pasteur: calentar para eliminar los microorganismos y evitar que vuelvan a entrar.",
  ],

  fuente: FUENTE,
};
