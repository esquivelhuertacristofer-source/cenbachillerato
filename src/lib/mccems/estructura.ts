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

// Ámbitos de Formación Socioemocional — MCCEMS vigente (4 ámbitos, no 3)
// Fuente: dgb.sep.gob.mx/marco-curricular
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

// UAC del Currículum Fundamental — Acuerdo 09/08/23 (Gen 2023-2026 / 2024-2027)
// Compatible con Modelo Educativo 2025 (Gen 2025-2028) donde todos los RSC son CF
// Fuente: dgb.sep.gob.mx/programas-de-estudio | Validado 2026-05-12
export const UAC_BASE: UACStatic[] = [
  // ── Lengua y Comunicación (sems 1-6) ───────────────────────────────────────
  { codigo: "LC-I",   nombre: "Lengua y Comunicación I",   semestre: 1, componenteCodigo: "CF", recursoCodigo: "RSC-LC", orden: 1, totalProgresionesEsperadas: 10 },
  { codigo: "LC-II",  nombre: "Lengua y Comunicación II",  semestre: 2, componenteCodigo: "CF", recursoCodigo: "RSC-LC", orden: 1, totalProgresionesEsperadas: 10 },
  { codigo: "LC-III", nombre: "Lengua y Comunicación III", semestre: 3, componenteCodigo: "CF", recursoCodigo: "RSC-LC", orden: 1, totalProgresionesEsperadas: 10 },
  { codigo: "LC-IV",  nombre: "Lengua y Comunicación IV",  semestre: 4, componenteCodigo: "CF", recursoCodigo: "RSC-LC", orden: 1, totalProgresionesEsperadas: 10 },
  { codigo: "LC-V",   nombre: "Lengua y Comunicación V",   semestre: 5, componenteCodigo: "CF", recursoCodigo: "RSC-LC", orden: 1, totalProgresionesEsperadas: 10 },
  { codigo: "LC-VI",  nombre: "Lengua y Comunicación VI",  semestre: 6, componenteCodigo: "CF", recursoCodigo: "RSC-LC", orden: 1, totalProgresionesEsperadas: 10 },

  // ── Pensamiento Matemático (sems 1-6) ──────────────────────────────────────
  { codigo: "PM-I",   nombre: "Pensamiento Matemático I",   semestre: 1, componenteCodigo: "CF", recursoCodigo: "RSC-PM", orden: 2, totalProgresionesEsperadas: 10 },
  { codigo: "PM-II",  nombre: "Pensamiento Matemático II",  semestre: 2, componenteCodigo: "CF", recursoCodigo: "RSC-PM", orden: 2, totalProgresionesEsperadas: 10 },
  { codigo: "PM-III", nombre: "Pensamiento Matemático III", semestre: 3, componenteCodigo: "CF", recursoCodigo: "RSC-PM", orden: 2, totalProgresionesEsperadas: 10 },
  { codigo: "PM-IV",  nombre: "Pensamiento Matemático IV",  semestre: 4, componenteCodigo: "CF", recursoCodigo: "RSC-PM", orden: 2, totalProgresionesEsperadas: 10 },
  { codigo: "PM-V",   nombre: "Pensamiento Matemático V",   semestre: 5, componenteCodigo: "CF", recursoCodigo: "RSC-PM", orden: 2, totalProgresionesEsperadas: 10 },
  { codigo: "PM-VI",  nombre: "Pensamiento Matemático VI",  semestre: 6, componenteCodigo: "CF", recursoCodigo: "RSC-PM", orden: 2, totalProgresionesEsperadas: 10 },

  // ── Inglés (sems 1-4) ──────────────────────────────────────────────────────
  { codigo: "IN-I",   nombre: "Inglés I",   semestre: 1, componenteCodigo: "CF", recursoCodigo: "RSC-IN", orden: 3, totalProgresionesEsperadas: 8 },
  { codigo: "IN-II",  nombre: "Inglés II",  semestre: 2, componenteCodigo: "CF", recursoCodigo: "RSC-IN", orden: 3, totalProgresionesEsperadas: 12 },
  { codigo: "IN-III", nombre: "Inglés III", semestre: 3, componenteCodigo: "CF", recursoCodigo: "RSC-IN", orden: 3, totalProgresionesEsperadas: 12 },
  { codigo: "IN-IV",  nombre: "Inglés IV",  semestre: 4, componenteCodigo: "CF", recursoCodigo: "RSC-IN", orden: 3, totalProgresionesEsperadas: 12 },

  // ── Cultura Digital (sems 1, 2, 6) ─────────────────────────────────────────
  { codigo: "CD-I",   nombre: "Cultura Digital I",   semestre: 1, componenteCodigo: "CF", recursoCodigo: "RSC-CD", orden: 4, totalProgresionesEsperadas: 8 },
  { codigo: "CD-II",  nombre: "Cultura Digital II",  semestre: 2, componenteCodigo: "CF", recursoCodigo: "RSC-CD", orden: 4, totalProgresionesEsperadas: 8 },
  { codigo: "CD-III", nombre: "Cultura Digital III", semestre: 6, componenteCodigo: "CF", recursoCodigo: "RSC-CD", orden: 4, totalProgresionesEsperadas: 8 },

  // ── Conciencia Histórica (sems 4-6, NO sems 1-3) ───────────────────────────
  { codigo: "CH-I",   nombre: "Conciencia Histórica I",   semestre: 4, componenteCodigo: "CF", recursoCodigo: "RSC-CH", orden: 5, totalProgresionesEsperadas: 10 },
  { codigo: "CH-II",  nombre: "Conciencia Histórica II",  semestre: 5, componenteCodigo: "CF", recursoCodigo: "RSC-CH", orden: 5, totalProgresionesEsperadas: 10 },
  { codigo: "CH-III", nombre: "Conciencia Histórica III", semestre: 6, componenteCodigo: "CF", recursoCodigo: "RSC-CH", orden: 5, totalProgresionesEsperadas: 10 },

  // ── Ciencias Sociales (sems 1, 2, 4) ───────────────────────────────────────
  { codigo: "CS-I",   nombre: "Ciencias Sociales I",   semestre: 1, componenteCodigo: "CF", recursoCodigo: "RSC-CS", orden: 6, totalProgresionesEsperadas: 8 },
  { codigo: "CS-II",  nombre: "Ciencias Sociales II",  semestre: 2, componenteCodigo: "CF", recursoCodigo: "RSC-CS", orden: 6, totalProgresionesEsperadas: 10 },
  { codigo: "CS-III", nombre: "Ciencias Sociales III", semestre: 4, componenteCodigo: "CF", recursoCodigo: "RSC-CS", orden: 6, totalProgresionesEsperadas: 10 },

  // ── Humanidades (sems 1-3) ──────────────────────────────────────────────────
  { codigo: "HUM-I",   nombre: "Humanidades I",   semestre: 1, componenteCodigo: "CF", recursoCodigo: "RSC-HUM", orden: 7, totalProgresionesEsperadas: 8 },
  { codigo: "HUM-II",  nombre: "Humanidades II",  semestre: 2, componenteCodigo: "CF", recursoCodigo: "RSC-HUM", orden: 7, totalProgresionesEsperadas: 10 },
  { codigo: "HUM-III", nombre: "Humanidades III", semestre: 3, componenteCodigo: "CF", recursoCodigo: "RSC-HUM", orden: 7, totalProgresionesEsperadas: 10 },

  // ── CNEYT — títulos temáticos por semestre (sems 1-6) ──────────────────────
  { codigo: "CNEYT-I",   nombre: "La materia y sus interacciones",        semestre: 1, componenteCodigo: "CF", recursoCodigo: "RSC-CNEYT", orden: 8, totalProgresionesEsperadas: 10 },
  { codigo: "CNEYT-II",  nombre: "Conservación de la energía",            semestre: 2, componenteCodigo: "CF", recursoCodigo: "RSC-CNEYT", orden: 8, totalProgresionesEsperadas: 10 },
  { codigo: "CNEYT-III", nombre: "Ecosistemas, interacciones y energía",  semestre: 3, componenteCodigo: "CF", recursoCodigo: "RSC-CNEYT", orden: 8, totalProgresionesEsperadas: 10 },
  { codigo: "CNEYT-IV",  nombre: "Reacciones químicas",                  semestre: 4, componenteCodigo: "CF", recursoCodigo: "RSC-CNEYT", orden: 8, totalProgresionesEsperadas: 10 },
  { codigo: "CNEYT-V",   nombre: "La energía en procesos de vida diaria", semestre: 5, componenteCodigo: "CF", recursoCodigo: "RSC-CNEYT", orden: 8, totalProgresionesEsperadas: 10 },
  { codigo: "CNEYT-VI",  nombre: "Organismos y evolución biológica",      semestre: 6, componenteCodigo: "CF", recursoCodigo: "RSC-CNEYT", orden: 8, totalProgresionesEsperadas: 10 },
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
