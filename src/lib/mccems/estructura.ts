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

export const RECURSOS_SOCIOEMOCIONALES: RecursoSocioemocionalStatic[] = [
  {
    codigo: "RSE-RS",
    nombre: "Responsabilidad Social",
    descripcion: "Fomenta el compromiso cívico, la participación comunitaria y el sentido de responsabilidad ante los problemas sociales.",
    orden: 1,
  },
  {
    codigo: "RSE-CFC",
    nombre: "Cuidado Físico Corporal",
    descripcion: "Promueve hábitos saludables, actividad física y bienestar corporal para una vida plena.",
    orden: 2,
  },
  {
    codigo: "RSE-BEA",
    nombre: "Bienestar Emocional Afectivo",
    descripcion: "Desarrolla habilidades socioemocionales para el autoconocimiento, la autorregulación y las relaciones interpersonales.",
    orden: 3,
  },
];

export const UAC_BASE: UACStatic[] = [
  // Lengua y Comunicación (semestres 1-6)
  { codigo: "LC-I", nombre: "Lengua y Comunicación I", semestre: 1, componenteCodigo: "CF", recursoCodigo: "RSC-LC", orden: 1, totalProgresionesEsperadas: 10 },
  { codigo: "LC-II", nombre: "Lengua y Comunicación II", semestre: 2, componenteCodigo: "CF", recursoCodigo: "RSC-LC", orden: 1, totalProgresionesEsperadas: 10 },
  { codigo: "LC-III", nombre: "Lengua y Comunicación III", semestre: 3, componenteCodigo: "CF", recursoCodigo: "RSC-LC", orden: 1, totalProgresionesEsperadas: 10 },
  { codigo: "LC-IV", nombre: "Lengua y Comunicación IV", semestre: 4, componenteCodigo: "CF", recursoCodigo: "RSC-LC", orden: 1, totalProgresionesEsperadas: 10 },
  { codigo: "LC-V", nombre: "Lengua y Comunicación V", semestre: 5, componenteCodigo: "CF", recursoCodigo: "RSC-LC", orden: 1, totalProgresionesEsperadas: 10 },
  { codigo: "LC-VI", nombre: "Lengua y Comunicación VI", semestre: 6, componenteCodigo: "CF", recursoCodigo: "RSC-LC", orden: 1, totalProgresionesEsperadas: 10 },

  // Pensamiento Matemático (semestres 1-6)
  { codigo: "PM-I", nombre: "Pensamiento Matemático I", semestre: 1, componenteCodigo: "CF", recursoCodigo: "RSC-PM", orden: 2, totalProgresionesEsperadas: 10 },
  { codigo: "PM-II", nombre: "Pensamiento Matemático II", semestre: 2, componenteCodigo: "CF", recursoCodigo: "RSC-PM", orden: 2, totalProgresionesEsperadas: 10 },
  { codigo: "PM-III", nombre: "Pensamiento Matemático III", semestre: 3, componenteCodigo: "CF", recursoCodigo: "RSC-PM", orden: 2, totalProgresionesEsperadas: 10 },
  { codigo: "PM-IV", nombre: "Pensamiento Matemático IV", semestre: 4, componenteCodigo: "CF", recursoCodigo: "RSC-PM", orden: 2, totalProgresionesEsperadas: 10 },
  { codigo: "PM-V", nombre: "Pensamiento Matemático V", semestre: 5, componenteCodigo: "CF", recursoCodigo: "RSC-PM", orden: 2, totalProgresionesEsperadas: 10 },
  { codigo: "PM-VI", nombre: "Pensamiento Matemático VI", semestre: 6, componenteCodigo: "CF", recursoCodigo: "RSC-PM", orden: 2, totalProgresionesEsperadas: 10 },

  // Conciencia Histórica (semestres 1-3)
  { codigo: "CH-I", nombre: "Conciencia Histórica I", semestre: 1, componenteCodigo: "CF", recursoCodigo: "RSC-CH", orden: 3, totalProgresionesEsperadas: 10 },
  { codigo: "CH-II", nombre: "Conciencia Histórica II", semestre: 2, componenteCodigo: "CF", recursoCodigo: "RSC-CH", orden: 3, totalProgresionesEsperadas: 10 },
  { codigo: "CH-III", nombre: "Conciencia Histórica III", semestre: 3, componenteCodigo: "CF", recursoCodigo: "RSC-CH", orden: 3, totalProgresionesEsperadas: 10 },

  // Cultura Digital (semestres 1-2)
  { codigo: "CD-I", nombre: "Cultura Digital I", semestre: 1, componenteCodigo: "CF", recursoCodigo: "RSC-CD", orden: 4, totalProgresionesEsperadas: 8 },
  { codigo: "CD-II", nombre: "Cultura Digital II", semestre: 2, componenteCodigo: "CF", recursoCodigo: "RSC-CD", orden: 4, totalProgresionesEsperadas: 8 },

  // Inglés (semestres 1-4)
  { codigo: "IN-I", nombre: "Inglés I", semestre: 1, componenteCodigo: "CF", recursoCodigo: "RSC-IN", orden: 5, totalProgresionesEsperadas: 12 },
  { codigo: "IN-II", nombre: "Inglés II", semestre: 2, componenteCodigo: "CF", recursoCodigo: "RSC-IN", orden: 5, totalProgresionesEsperadas: 12 },
  { codigo: "IN-III", nombre: "Inglés III", semestre: 3, componenteCodigo: "CF", recursoCodigo: "RSC-IN", orden: 5, totalProgresionesEsperadas: 12 },
  { codigo: "IN-IV", nombre: "Inglés IV", semestre: 4, componenteCodigo: "CF", recursoCodigo: "RSC-IN", orden: 5, totalProgresionesEsperadas: 12 },

  // Ciencias Sociales (semestres 3-6)
  { codigo: "CS-HIS-I", nombre: "Historia I", semestre: 3, componenteCodigo: "CFE", areaCodigo: "AC-CS", orden: 1, totalProgresionesEsperadas: 10 },
  { codigo: "CS-HIS-II", nombre: "Historia II", semestre: 4, componenteCodigo: "CFE", areaCodigo: "AC-CS", orden: 1, totalProgresionesEsperadas: 10 },
  { codigo: "CS-ECO-I", nombre: "Economía I", semestre: 5, componenteCodigo: "CFE", areaCodigo: "AC-CS", orden: 2, totalProgresionesEsperadas: 10 },
  { codigo: "CS-ECO-II", nombre: "Economía II (Política Económica)", semestre: 6, componenteCodigo: "CFE", areaCodigo: "AC-CS", orden: 2, totalProgresionesEsperadas: 10 },
  { codigo: "CS-SOC", nombre: "Sociología", semestre: 5, componenteCodigo: "CFE", areaCodigo: "AC-CS", orden: 3, totalProgresionesEsperadas: 10 },
  { codigo: "CS-ADM", nombre: "Administración", semestre: 6, componenteCodigo: "CFE", areaCodigo: "AC-CS", orden: 4, totalProgresionesEsperadas: 10 },

  // Ciencias Naturales (semestres 3-6)
  { codigo: "CNT-BIO-I", nombre: "Biología I", semestre: 3, componenteCodigo: "CFE", areaCodigo: "AC-CNT", orden: 1, totalProgresionesEsperadas: 12 },
  { codigo: "CNT-BIO-II", nombre: "Biología II", semestre: 4, componenteCodigo: "CFE", areaCodigo: "AC-CNT", orden: 1, totalProgresionesEsperadas: 12 },
  { codigo: "CNT-QUI-I", nombre: "Química I", semestre: 3, componenteCodigo: "CFE", areaCodigo: "AC-CNT", orden: 2, totalProgresionesEsperadas: 12 },
  { codigo: "CNT-QUI-II", nombre: "Química II", semestre: 4, componenteCodigo: "CFE", areaCodigo: "AC-CNT", orden: 2, totalProgresionesEsperadas: 12 },
  { codigo: "CNT-FIS-I", nombre: "Física I", semestre: 5, componenteCodigo: "CFE", areaCodigo: "AC-CNT", orden: 3, totalProgresionesEsperadas: 12 },
  { codigo: "CNT-FIS-II", nombre: "Física II", semestre: 6, componenteCodigo: "CFE", areaCodigo: "AC-CNT", orden: 3, totalProgresionesEsperadas: 12 },
  { codigo: "CNT-MATE", nombre: "Matemáticas Aplicadas", semestre: 5, componenteCodigo: "CFE", areaCodigo: "AC-CNT", orden: 4, totalProgresionesEsperadas: 10 },
  { codigo: "CNT-TC-I", nombre: "Taller de Ciencias I", semestre: 5, componenteCodigo: "CFE", areaCodigo: "AC-CNT", orden: 5, totalProgresionesEsperadas: 8 },
  { codigo: "CNT-TC-II", nombre: "Taller de Ciencias II", semestre: 6, componenteCodigo: "CFE", areaCodigo: "AC-CNT", orden: 5, totalProgresionesEsperadas: 8 },

  // Humanidades (semestres 3-6)
  { codigo: "HUM-PLT", nombre: "Pensamiento Literario", semestre: 3, componenteCodigo: "CFE", areaCodigo: "AC-HUM", orden: 1, totalProgresionesEsperadas: 10 },
  { codigo: "HUM-FIL", nombre: "Filosofía", semestre: 4, componenteCodigo: "CFE", areaCodigo: "AC-HUM", orden: 2, totalProgresionesEsperadas: 10 },
  { codigo: "HUM-EST", nombre: "Estética", semestre: 5, componenteCodigo: "CFE", areaCodigo: "AC-HUM", orden: 3, totalProgresionesEsperadas: 10 },
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
