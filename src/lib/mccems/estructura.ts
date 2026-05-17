import type {
  ComponenteCurricularStatic,
  RecursoSocioemocionalStatic,
  UACStatic,
} from "./types";
import { RECURSOS_SOCIOCOGNITIVOS } from "./recursos-sociocognitivos";
import { AREAS_CONOCIMIENTO } from "./areas-conocimiento";

export { RECURSOS_SOCIOCOGNITIVOS, AREAS_CONOCIMIENTO };

export const COMPONENTES_CURRICULARES: ComponenteCurricularStatic[] = [
  {
    codigo: "CF",
    nombre: "Currículum Fundamental",
    descripcion: "Tronco común obligatorio para todos los subsistemas de bachillerato.",
    tipo: "fundamental",
  },
  {
    codigo: "CFE",
    nombre: "Currículum Fundamental Extendido",
    descripcion: "Áreas de conocimiento y asignaturas optativas según área de elección.",
    tipo: "fundamental-extendido",
  },
  {
    codigo: "CA",
    nombre: "Currículum Ampliado",
    descripcion: "Recursos socioemocionales y ámbitos de formación integral.",
    tipo: "ampliado",
  },
  {
    codigo: "CL",
    nombre: "Currículum Laboral",
    descripcion: "Formación técnica para bachilleratos tecnológicos y bivalentes.",
    tipo: "laboral",
  },
];

// Ámbitos de Formación Socioemocional — MCCEMS 2025
// Fuente: docs/programas-oficiales/extraidos/10-FORMACION-SOCIOEMOCIONAL.md
export const RECURSOS_SOCIOEMOCIONALES: RecursoSocioemocionalStatic[] = [
  {
    codigo: "RSE-AFD",
    nombre: "Actividades físicas y deportivas",
    descripcion: "Promueve el desarrollo físico, la salud y el trabajo en equipo a través del deporte y la actividad física regular.",
    orden: 1,
  },
  {
    codigo: "RSE-AAC",
    nombre: "Actividades artísticas y culturales",
    descripcion: "Fomenta la expresión creativa, la identidad cultural y la apreciación estética mediante las artes y la cultura.",
    orden: 2,
  },
  {
    codigo: "RSE-IESG",
    nombre: "Educación integral en sexualidad y género",
    descripcion: "Desarrolla una comprensión crítica y respetuosa de la sexualidad, el género y las relaciones interpersonales.",
    orden: 3,
  },
  {
    codigo: "RSE-ESP",
    nombre: "Educación para la salud y práctica ciudadana",
    descripcion: "Promueve hábitos de vida saludable y la participación responsable en la vida democrática y comunitaria.",
    orden: 4,
  },
];

// Currículum Fundamental — Modelo Educativo 2025 MCCEMS
// Fuente: docs/programas-oficiales/extraidos/
// Total: 32 UAC, 207 propósitos formativos
export const UAC_BASE: UACStatic[] = [
  // ── Lengua y Comunicación (sems 1-3) ──────────────────────────────────────
  // Fuente: 08-LENGUA-COMUNICACION.md | LyC I: 8, LyC II: 8, LyC III: 7
  { codigo: "LC-I",   nombre: "Lengua y Comunicación I",   semestre: 1, componenteCodigo: "CF", recursoCodigo: "RSC-LC", orden: 1, totalProgresionesEsperadas: 8 },
  { codigo: "LC-II",  nombre: "Lengua y Comunicación II",  semestre: 2, componenteCodigo: "CF", recursoCodigo: "RSC-LC", orden: 1, totalProgresionesEsperadas: 8 },
  { codigo: "LC-III", nombre: "Lengua y Comunicación III", semestre: 3, componenteCodigo: "CF", recursoCodigo: "RSC-LC", orden: 1, totalProgresionesEsperadas: 7 },

  // ── Pensamiento Matemático (sems 1-6) ──────────────────────────────────────
  // Fuente: 05-PENSAMIENTO-MATEMATICO.md | PM I-VI: 7+6+6+7+8+8 = 42
  { codigo: "PM-I",   nombre: "Pensamiento Matemático I",   semestre: 1, componenteCodigo: "CF", recursoCodigo: "RSC-PM", orden: 2, totalProgresionesEsperadas: 7 },
  { codigo: "PM-II",  nombre: "Pensamiento Matemático II",  semestre: 2, componenteCodigo: "CF", recursoCodigo: "RSC-PM", orden: 2, totalProgresionesEsperadas: 6 },
  { codigo: "PM-III", nombre: "Pensamiento Matemático III", semestre: 3, componenteCodigo: "CF", recursoCodigo: "RSC-PM", orden: 2, totalProgresionesEsperadas: 6 },
  { codigo: "PM-IV",  nombre: "Pensamiento Matemático IV",  semestre: 4, componenteCodigo: "CF", recursoCodigo: "RSC-PM", orden: 2, totalProgresionesEsperadas: 7 },
  { codigo: "PM-V",   nombre: "Pensamiento Matemático V",   semestre: 5, componenteCodigo: "CF", recursoCodigo: "RSC-PM", orden: 2, totalProgresionesEsperadas: 8 },
  { codigo: "PM-VI",  nombre: "Pensamiento Matemático VI",  semestre: 6, componenteCodigo: "CF", recursoCodigo: "RSC-PM", orden: 2, totalProgresionesEsperadas: 8 },

  // ── Inglés (sems 1-5) ──────────────────────────────────────────────────────
  // Fuente: 07-INGLES.md | IN I-V: 8×5 = 40 | secuencia obligatoria
  { codigo: "IN-I",   nombre: "Inglés I",   semestre: 1, componenteCodigo: "CF", recursoCodigo: "RSC-IN", orden: 3, totalProgresionesEsperadas: 8 },
  { codigo: "IN-II",  nombre: "Inglés II",  semestre: 2, componenteCodigo: "CF", recursoCodigo: "RSC-IN", orden: 3, totalProgresionesEsperadas: 8 },
  { codigo: "IN-III", nombre: "Inglés III", semestre: 3, componenteCodigo: "CF", recursoCodigo: "RSC-IN", orden: 3, totalProgresionesEsperadas: 8 },
  { codigo: "IN-IV",  nombre: "Inglés IV",  semestre: 4, componenteCodigo: "CF", recursoCodigo: "RSC-IN", orden: 3, totalProgresionesEsperadas: 8 },
  { codigo: "IN-V",   nombre: "Inglés V",   semestre: 5, componenteCodigo: "CF", recursoCodigo: "RSC-IN", orden: 3, totalProgresionesEsperadas: 8 },

  // ── Cultura Digital (sems 1, 2, 6) ─────────────────────────────────────────
  // Fuente: 02-CULTURA-DIGITAL.md | CD I: 8, CD II: 5, CD III: 4
  { codigo: "CD-I",   nombre: "Cultura Digital I",   semestre: 1, componenteCodigo: "CF", recursoCodigo: "RSC-CD", orden: 4, totalProgresionesEsperadas: 8 },
  { codigo: "CD-II",  nombre: "Cultura Digital II",  semestre: 2, componenteCodigo: "CF", recursoCodigo: "RSC-CD", orden: 4, totalProgresionesEsperadas: 5 },
  { codigo: "CD-III", nombre: "Cultura Digital III", semestre: 6, componenteCodigo: "CF", recursoCodigo: "RSC-CD", orden: 4, totalProgresionesEsperadas: 4 },

  // ── Conciencia Histórica (sems 4-6, NO sems 1-3) ───────────────────────────
  // Fuente: 01-CONCIENCIA-HISTORICA.md | CH I-III: 4×3 = 12
  { codigo: "CH-I",   nombre: "Conciencia Histórica I",   semestre: 4, componenteCodigo: "CF", recursoCodigo: "RSC-CH", orden: 5, totalProgresionesEsperadas: 4 },
  { codigo: "CH-II",  nombre: "Conciencia Histórica II",  semestre: 5, componenteCodigo: "CF", recursoCodigo: "RSC-CH", orden: 5, totalProgresionesEsperadas: 4 },
  { codigo: "CH-III", nombre: "Conciencia Histórica III", semestre: 6, componenteCodigo: "CF", recursoCodigo: "RSC-CH", orden: 5, totalProgresionesEsperadas: 4 },

  // ── Ciencias Sociales (sems 1, 2, 4) ───────────────────────────────────────
  // Fuente: 06-CIENCIAS-SOCIALES.md | CS I: 4, CS II: 4, CS III: 3
  { codigo: "CS-I",   nombre: "Ciencias Sociales I",   semestre: 1, componenteCodigo: "CF", recursoCodigo: "RSC-CS", orden: 6, totalProgresionesEsperadas: 4 },
  { codigo: "CS-II",  nombre: "Ciencias Sociales II",  semestre: 2, componenteCodigo: "CF", recursoCodigo: "RSC-CS", orden: 6, totalProgresionesEsperadas: 4 },
  { codigo: "CS-III", nombre: "Ciencias Sociales III", semestre: 4, componenteCodigo: "CF", recursoCodigo: "RSC-CS", orden: 6, totalProgresionesEsperadas: 3 },

  // ── Pensamiento Filosófico y Humanidades (sems 1-3) ────────────────────────
  // Fuente: 04-PENSAMIENTO-FILOSOFICO.md | PFH I: 5, PFH II: 5, PFH III: 4
  { codigo: "PFH-I",   nombre: "Pensamiento Filosófico y Humanidades I",   semestre: 1, componenteCodigo: "CF", recursoCodigo: "RSC-PFH", orden: 7, totalProgresionesEsperadas: 5 },
  { codigo: "PFH-II",  nombre: "Pensamiento Filosófico y Humanidades II",  semestre: 2, componenteCodigo: "CF", recursoCodigo: "RSC-PFH", orden: 7, totalProgresionesEsperadas: 5 },
  { codigo: "PFH-III", nombre: "Pensamiento Filosófico y Humanidades III", semestre: 3, componenteCodigo: "CF", recursoCodigo: "RSC-PFH", orden: 7, totalProgresionesEsperadas: 4 },

  // ── CNEYT — Ciencias Naturales, Experimentales y Tecnología (sems 1-6) ─────
  // Fuente: 03-CIENCIAS-NATURALES.md | CNEYT I-VI: 8×6 = 48 | secuencia obligatoria
  { codigo: "CNEYT-I",   nombre: "La materia y sus interacciones",        semestre: 1, componenteCodigo: "CF", recursoCodigo: "RSC-CNEYT", orden: 8, totalProgresionesEsperadas: 8 },
  { codigo: "CNEYT-II",  nombre: "Conservación de la energía",            semestre: 2, componenteCodigo: "CF", recursoCodigo: "RSC-CNEYT", orden: 8, totalProgresionesEsperadas: 8 },
  { codigo: "CNEYT-III", nombre: "Ecosistemas, interacciones y energía",  semestre: 3, componenteCodigo: "CF", recursoCodigo: "RSC-CNEYT", orden: 8, totalProgresionesEsperadas: 8 },
  { codigo: "CNEYT-IV",  nombre: "Reacciones químicas",                   semestre: 4, componenteCodigo: "CF", recursoCodigo: "RSC-CNEYT", orden: 8, totalProgresionesEsperadas: 8 },
  { codigo: "CNEYT-V",   nombre: "La energía en procesos de vida diaria", semestre: 5, componenteCodigo: "CF", recursoCodigo: "RSC-CNEYT", orden: 8, totalProgresionesEsperadas: 8 },
  { codigo: "CNEYT-VI",  nombre: "Organismos y evolución biológica",      semestre: 6, componenteCodigo: "CF", recursoCodigo: "RSC-CNEYT", orden: 8, totalProgresionesEsperadas: 8 },
];

export function getUACPorSemestre(semestre: number): UACStatic[] {
  return UAC_BASE.filter((uac) => uac.semestre === semestre);
}

export function getUACPorCodigo(codigo: string): UACStatic | undefined {
  return UAC_BASE.find((uac) => uac.codigo === codigo);
}

export function getUACPorArea(areaCodigo: string, semestre?: number): UACStatic[] {
  return UAC_BASE.filter(
    (uac) =>
      uac.areaCodigo === areaCodigo &&
      (semestre === undefined || uac.semestre === semestre)
  );
}

export function getRecursosSociocognitivosPorSemestre(semestre: number): UACStatic[] {
  return UAC_BASE.filter(
    (uac) => uac.recursoCodigo !== undefined && uac.semestre === semestre
  );
}
