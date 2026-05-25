/**
 * Schemas Zod para el módulo de Planteamiento Académico — CEN Bachillerato MCCEMS.
 * Estructura ESPEJO de pedagogiaData de CEN Financiera.
 * Campos: mismos nombres que Financiera, datos MCCEMS adaptados.
 */

import { z } from 'zod';

// ── Sub-schemas ───────────────────────────────────────────────────────────────

export const CurriculumPhaseSchema = z.object({
  title: z.string(),
  duration: z.string(),
  description: z.string(),
  activity: z.string(),
});

export const CurriculumTimelineItemSchema = z.object({
  phase: z.string(),
  duration: z.string(),
  label: z.string(),
});

export const CurriculumSectionSchema = z.object({
  subtitle: z.string(),
  content: z.string(),
});

export const CurriculumQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()).min(2).max(4),
  correct: z.string(),
});

export const MetadataSchema = z.object({
  objective: z.string(),
  competencies: z.array(z.string()),
  materials: z.array(z.string()),
});

export const StrategySchema = z.object({
  timeline: z.array(CurriculumTimelineItemSchema).optional(),
  phases: z.array(CurriculumPhaseSchema),
});

export const TheorySchema = z.object({
  introduction: z.string(),
  sections: z.array(CurriculumSectionSchema),
});

export const EvaluationSchema = z.object({
  exam_questions: z.array(CurriculumQuestionSchema),
  rubric: z.string(),
});

// ── Unidad principal (equivalente a una entrada en el JSON de Financiera) ─────

export const ProgresionPlanSchema = z.object({
  code: z.string(),                    // Código MCCEMS (e.g., "PM-I-P01")
  title: z.string(),                   // Título del propósito formativo
  level: z.string(),                   // Nombre del UAC (e.g., "Pensamiento Matemático I")
  duration: z.string(),                // Duración estimada (e.g., "~3h (2 sesiones de 50 min)")
  difficulty: z.string(),              // "Fundamental" | "Intermedio" | "Avanzado"
  category: z.string(),                // Categoría temática (e.g., "Aritmética")
  metadata: MetadataSchema,
  strategy: StrategySchema,
  theory: TheorySchema,
  evaluation: EvaluationSchema,
  teacher_tips: z.array(z.string()),
});

// ── Record de UAC (equivalente a un archivo JSON por grado en Financiera) ────

export const UACPlanRecordSchema = z.record(z.string(), ProgresionPlanSchema);

// ── Planteamiento completo (equivalente a pedagogiaData en Financiera) ────────

export const PlanteamientoDatabaseSchema = z.record(
  z.string(), // clave UAC, e.g., "PM-I"
  UACPlanRecordSchema
);

// ── Tipos TypeScript inferidos ────────────────────────────────────────────────

export type CurriculumPhase = z.infer<typeof CurriculumPhaseSchema>;
export type CurriculumSection = z.infer<typeof CurriculumSectionSchema>;
export type CurriculumQuestion = z.infer<typeof CurriculumQuestionSchema>;
export type ProgresionPlan = z.infer<typeof ProgresionPlanSchema>;
export type UACPlanRecord = z.infer<typeof UACPlanRecordSchema>;
export type PlanteamientoDatabase = z.infer<typeof PlanteamientoDatabaseSchema>;

// ── Schema para la tabla planteamiento_progresiones (contenido JSONB) ─────────

export const PlanteamientoProgresionContenidoSchema = ProgresionPlanSchema;
export type PlanteamientoProgresionContenido = ProgresionPlan;
