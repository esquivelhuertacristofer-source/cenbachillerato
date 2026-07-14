import { z } from 'zod';

// Límite total de filas por archivo (validado en cliente y servidor).
export const MAX_FILAS_ALTA_MASIVA = 5000;

// Tamaño de lote enviado por llamada al server action, para no bloquear
// el CPU budget de una sola invocación del Worker con archivos grandes.
export const ALTA_MASIVA_BATCH_SIZE = 150;

export const FilaCSVSchema = z.object({
  rol: z.enum(['docente', 'alumno']),
  nombre: z.string().min(1).max(100).trim(),
  apellido_paterno: z.string().min(1).max(100).trim(),
  apellido_materno: z.string().min(1).max(100).trim(),
  // PapaParse entrega strings vacíos para columnas sin valor; preprocess los normaliza a undefined
  semestre: z.preprocess(
    (v) => (!v || v === '' ? undefined : Number(v)),
    z.number().int().min(1).max(6).optional()
  ),
  grupo_nombre: z.string().min(1).max(100).trim(),
}).refine(
  (data) => data.rol === 'docente' || (data.rol === 'alumno' && data.semestre !== undefined),
  { message: 'Alumnos deben tener semestre' }
);

export type FilaCSV = z.infer<typeof FilaCSVSchema>;

export const ErrorAltaSchema = z.object({
  fila: z.number(),
  columna: z.string().optional(),
  mensaje: z.string(),
});

export type ErrorAlta = z.infer<typeof ErrorAltaSchema>;

export const CredencialSchema = z.object({
  nombre_completo: z.string(),
  rol: z.string(),
  grupo: z.string(),
  email: z.string(),
  password_inicial: z.string(),
});

export type Credencial = z.infer<typeof CredencialSchema>;

export const ResultadoAltaSchema = z.object({
  total_filas: z.number(),
  docentes_creados: z.number(),
  alumnos_creados: z.number(),
  grupos_creados: z.number(),
  ya_existentes: z.number(),
  errores: z.array(ErrorAltaSchema),
  credenciales: z.array(CredencialSchema),
});

export type ResultadoAlta = z.infer<typeof ResultadoAltaSchema>;
