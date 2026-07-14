import { z } from 'zod';

export const SUBSISTEMAS_ESCUELA = [
  'DGB', 'DGETI', 'DGETA', 'DGBTED', 'CONALEP', 'CECYT',
  'CCH', 'ENP', 'BGE', 'EMSAD', 'BD', 'particular', 'otro',
] as const;

// PapaParse/FormData entregan '' para campos vacíos; se normaliza a undefined
// para que .optional() aplique en vez de fallar la validación de enum/max.
const vacioAUndefined = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? undefined : v);

export const CrearEscuelaSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio').max(200, 'Máximo 200 caracteres'),
  cct: z.preprocess(vacioAUndefined, z.string().trim().max(20, 'Máximo 20 caracteres').optional()),
  subsistema: z.preprocess(vacioAUndefined, z.enum(SUBSISTEMAS_ESCUELA).optional()),
  estado: z.preprocess(vacioAUndefined, z.string().trim().max(100, 'Máximo 100 caracteres').optional()),
  municipio: z.preprocess(vacioAUndefined, z.string().trim().max(100, 'Máximo 100 caracteres').optional()),
});

export type CrearEscuelaInput = z.infer<typeof CrearEscuelaSchema>;
