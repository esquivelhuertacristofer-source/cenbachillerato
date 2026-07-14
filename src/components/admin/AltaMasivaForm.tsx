'use client';

import { useState, useRef, useTransition } from 'react';
import Papa from 'papaparse';
import { procesarAltaMasiva } from '@/lib/actions/alta-masiva';
import {
  FilaCSVSchema,
  MAX_FILAS_ALTA_MASIVA,
  ALTA_MASIVA_BATCH_SIZE,
  type FilaCSV,
  type ErrorAlta,
  type ResultadoAlta,
  type Credencial,
} from '@/lib/schemas/alta-masiva.schema';

const PLANTILLA_CONTENIDO =
  'rol,nombre,apellido_paterno,apellido_materno,semestre,grupo_nombre\n' +
  'docente,Juan,Pérez,García,,Grupo 1A\n' +
  'alumno,María,López,Hernández,1,Grupo 1A\n' +
  'alumno,Carlos,Rodríguez,Sánchez,1,Grupo 1A\n';

const MAX_FILE_SIZE_MB = 10;

// Columnas exactas (ya en minúsculas) que espera el server action al re-parsear
// cada lote — deben coincidir con transformHeader de alta-masiva.ts.
const CSV_COLUMNS = ['rol', 'nombre', 'apellido_paterno', 'apellido_materno', 'semestre', 'grupo_nombre'];

/** Filas validadas → texto CSV de un solo lote, listo para procesarAltaMasiva. */
function loteACsvTexto(filas: FilaCSV[]): string {
  const data = filas.map((f) => ({
    rol: f.rol,
    nombre: f.nombre,
    apellido_paterno: f.apellido_paterno,
    apellido_materno: f.apellido_materno,
    semestre: f.semestre !== undefined ? String(f.semestre) : '',
    grupo_nombre: f.grupo_nombre,
  }));
  return Papa.unparse(data, { header: true, columns: CSV_COLUMNS });
}

/**
 * Corta un grupo_nombre que por sí solo excede tamañoLote. Los alumnos van
 * primero, repartidos en piezas de tamañoLote (la primera pieza es la que
 * dispara la creación del grupo en el server action, que la infiere de una
 * fila de alumno con semestre); los docentes se anexan después —a la última
 * pieza si caben, o en piezas propias— confiando en que para entonces el
 * grupo ya existe en BD (gruposExistentes se relee en cada llamada).
 */
function dividirGrupoGrande(
  filasGrupo: Array<{ fila: number; data: FilaCSV }>,
  tamañoLote: number
): Array<Array<{ fila: number; data: FilaCSV }>> {
  const alumnos = filasGrupo.filter((f) => f.data.rol === 'alumno');
  const docentes = filasGrupo.filter((f) => f.data.rol === 'docente');

  const piezas: Array<Array<{ fila: number; data: FilaCSV }>> = [];
  for (let i = 0; i < alumnos.length; i += tamañoLote) {
    piezas.push(alumnos.slice(i, i + tamañoLote));
  }

  if (piezas.length === 0) {
    // Solo docentes, sin alumnos: nadie dispara la creación del grupo (ya
    // era así antes de este fix), pero al menos se respeta el tope de lote.
    for (let i = 0; i < docentes.length; i += tamañoLote) {
      piezas.push(docentes.slice(i, i + tamañoLote));
    }
    return piezas;
  }

  const ultima = piezas[piezas.length - 1]!;
  if (ultima.length + docentes.length <= tamañoLote) {
    ultima.push(...docentes);
  } else {
    for (let i = 0; i < docentes.length; i += tamañoLote) {
      piezas.push(docentes.slice(i, i + tamañoLote));
    }
  }
  return piezas;
}

/**
 * Empaqueta filas validadas en lotes de ~ALTA_MASIVA_BATCH_SIZE filas, sin
 * partir nunca un mismo grupo_nombre entre dos lotes salvo que el grupo por
 * sí solo exceda tamañoLote (ver dividirGrupoGrande): el server action solo
 * crea un grupo dentro de una llamada si esa llamada trae una fila de alumno
 * de ese grupo (para inferir el semestre), y un docente sin su grupo en el
 * mismo lote quedaría sin asignar silenciosamente.
 */
function empaquetarLotes(
  filas: Array<{ fila: number; data: FilaCSV }>,
  tamañoLote: number
): Array<Array<{ fila: number; data: FilaCSV }>> {
  const porGrupo = new Map<string, Array<{ fila: number; data: FilaCSV }>>();
  for (const f of filas) {
    const key = f.data.grupo_nombre;
    if (!porGrupo.has(key)) porGrupo.set(key, []);
    porGrupo.get(key)!.push(f);
  }

  const lotes: Array<Array<{ fila: number; data: FilaCSV }>> = [];
  let actual: Array<{ fila: number; data: FilaCSV }> = [];

  for (const filasGrupo of porGrupo.values()) {
    if (filasGrupo.length > tamañoLote) {
      if (actual.length > 0) {
        lotes.push(actual);
        actual = [];
      }
      lotes.push(...dividirGrupoGrande(filasGrupo, tamañoLote));
      continue;
    }
    if (actual.length > 0 && actual.length + filasGrupo.length > tamañoLote) {
      lotes.push(actual);
      actual = [];
    }
    actual.push(...filasGrupo);
  }
  if (actual.length > 0) lotes.push(actual);

  return lotes;
}

/** Suma dos ResultadoAlta (acumulador de lotes procesados secuencialmente). */
function combinarResultados(a: ResultadoAlta, b: ResultadoAlta): ResultadoAlta {
  return {
    total_filas: a.total_filas + b.total_filas,
    docentes_creados: a.docentes_creados + b.docentes_creados,
    alumnos_creados: a.alumnos_creados + b.alumnos_creados,
    grupos_creados: a.grupos_creados + b.grupos_creados,
    ya_existentes: a.ya_existentes + b.ya_existentes,
    errores: [...a.errores, ...b.errores],
    credenciales: [...a.credenciales, ...b.credenciales],
  };
}

function descargarCSV(contenido: string, nombre: string) {
  const blob = new Blob(['﻿' + contenido], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}

function credencialesACsv(credenciales: Credencial[]): string {
  const header = 'nombre_completo,rol,grupo,email,password_inicial\n';
  const rows = credenciales
    .map((c) =>
      [c.nombre_completo, c.rol, c.grupo, c.email, c.password_inicial]
        .map((v) => `"${v.replace(/"/g, '""')}"`)
        .join(',')
    )
    .join('\n');
  return header + rows;
}

interface Props {
  disabled?: boolean;
}

export default function AltaMasivaForm({ disabled = false }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [filasValidas, setFilasValidas] = useState<Array<{ fila: number; data: FilaCSV }>>([]);
  const [erroresValidacion, setErroresValidacion] = useState<ErrorAlta[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<Record<string, string>[]>([]);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [clientError, setClientError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ResultadoAlta | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ actual: number; total: number } | null>(null);
  // Progreso de lotes persistido entre clicks: si un lote falla a mitad de
  // camino, un segundo click en "Procesar" reanuda desde ahí en vez de
  // reprocesar desde cero los lotes que ya tuvieron éxito.
  const lotesRef = useRef<Array<Array<{ fila: number; data: FilaCSV }>>>([]);
  const loteIndexRef = useRef(0);
  const acumuladoRef = useRef<ResultadoAlta | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setClientError(null);
    setResultado(null);
    setServerError(null);
    setErroresValidacion([]);
    setFilasValidas([]);
    setProgress(null);
    lotesRef.current = [];
    loteIndexRef.current = 0;
    acumuladoRef.current = null;
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setClientError(`El archivo supera el límite de ${MAX_FILE_SIZE_MB} MB`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = Papa.parse<Record<string, string>>(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h) => h.trim().toLowerCase(),
      });

      if (parsed.data.length > MAX_FILAS_ALTA_MASIVA) {
        setClientError(`El archivo tiene ${parsed.data.length} filas. El máximo es ${MAX_FILAS_ALTA_MASIVA}.`);
        return;
      }

      if (parsed.data.length === 0) {
        setClientError('El archivo no tiene filas de datos.');
        return;
      }

      // Misma validación Zod que aplica el servidor (defensa en profundidad:
      // el servidor la vuelve a correr en cada lote). Si hay CUALQUIER fila
      // inválida en todo el archivo, no se envía ningún lote — se preserva el
      // "todo o nada" que ya tenían los admins con la carga de un solo CSV.
      const errores: ErrorAlta[] = [];
      const validas: Array<{ fila: number; data: FilaCSV }> = [];
      parsed.data.forEach((row, idx) => {
        const result = FilaCSVSchema.safeParse(row);
        if (!result.success) {
          result.error.issues.forEach((issue) => {
            errores.push({
              fila: idx + 2, // +2: header + 1-based
              columna: issue.path.join('.') || undefined,
              mensaje: issue.message,
            });
          });
        } else {
          validas.push({ fila: idx + 2, data: result.data });
        }
      });

      setFileName(file.name);
      setPreviewHeaders(parsed.meta.fields ?? []);
      setPreview(parsed.data.slice(0, 5));
      setErroresValidacion(errores);
      setFilasValidas(validas);
    };
    reader.readAsText(file, 'UTF-8');
  }

  function handleProcesar() {
    if (filasValidas.length === 0 || erroresValidacion.length > 0 || disabled) return;
    setServerError(null);

    // Reanuda solo si quedó un intento previo a medias (falló un lote antes
    // de terminar). Si no hay progreso previo o ya se completó todo, se
    // recalculan los lotes desde cero.
    const reanudando =
      lotesRef.current.length > 0 && loteIndexRef.current < lotesRef.current.length;
    if (!reanudando) {
      lotesRef.current = empaquetarLotes(filasValidas, ALTA_MASIVA_BATCH_SIZE);
      loteIndexRef.current = 0;
      acumuladoRef.current = null;
      setResultado(null);
    }

    const lotes = lotesRef.current;

    startTransition(async () => {
      setProgress({ actual: loteIndexRef.current, total: lotes.length });

      for (let i = loteIndexRef.current; i < lotes.length; i++) {
        const csvLote = loteACsvTexto(lotes[i]!.map((f) => f.data));

        // procesarAltaMasiva normalmente resuelve { ...} | { error }, pero un
        // corte de red real hace que el fetch del server action RECHACE la
        // promesa en vez de resolver. Sin este try/catch esa excepción
        // quedaría como unhandled rejection dentro de startTransition (que en
        // Next.js 16 la escalaría al error boundary de la ruta, tumbando toda
        // la pantalla de alta masiva) en vez de mostrarse como un error
        // recuperable con progreso preservado.
        let res: Awaited<ReturnType<typeof procesarAltaMasiva>>;
        try {
          res = await procesarAltaMasiva(csvLote);
        } catch (e) {
          loteIndexRef.current = i; // este lote no avanzó: se reintenta en el próximo click
          setServerError(
            (e instanceof Error ? e.message : 'Error de conexión con el servidor') +
              (acumuladoRef.current
                ? ` (se alcanzaron a procesar ${acumuladoRef.current.total_filas} de ${filasValidas.length} filas antes del error; puedes reintentar)`
                : ' (puedes reintentar)')
          );
          if (acumuladoRef.current) setResultado(acumuladoRef.current);
          return;
        }

        if ('error' in res) {
          loteIndexRef.current = i;
          setServerError(
            acumuladoRef.current
              ? `${res.error} (se alcanzaron a procesar ${acumuladoRef.current.total_filas} de ${filasValidas.length} filas antes del error; puedes reintentar)`
              : `${res.error} (puedes reintentar)`
          );
          if (acumuladoRef.current) setResultado(acumuladoRef.current);
          return;
        }

        acumuladoRef.current = acumuladoRef.current ? combinarResultados(acumuladoRef.current, res) : res;
        loteIndexRef.current = i + 1;
        setProgress({ actual: i + 1, total: lotes.length });
        setResultado(acumuladoRef.current);
      }
    });
  }

  const s = {
    card: {
      background: '#FFFFFF',
      border: '1px solid #E2E8F0',
      borderRadius: 16,
      padding: '1.5rem',
      marginBottom: '1rem',
    } as React.CSSProperties,
    label: {
      fontSize: 11,
      fontWeight: 900,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.12em',
      color: '#64748B',
      marginBottom: 8,
      display: 'block',
    },
    btn: (variant: 'primary' | 'secondary' | 'danger', disabled?: boolean) => ({
      padding: '10px 20px',
      borderRadius: 10,
      border: 'none',
      fontSize: 13,
      fontWeight: 800,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'opacity 0.15s',
      background: variant === 'primary' ? '#0B2545' : variant === 'secondary' ? '#F1F5F9' : '#FEF2F2',
      color: variant === 'primary' ? '#FFFFFF' : variant === 'secondary' ? '#0B2545' : '#991B1B',
    } as React.CSSProperties),
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Descargar plantilla */}
      <div style={s.card}>
        <span style={s.label}>Paso 1 — Plantilla</span>
        <p style={{ fontSize: 13, color: '#64748B', marginBottom: 12 }}>
          Descarga la plantilla CSV con el formato correcto y llénala con los datos de tu escuela.
        </p>
        <button
          style={s.btn('secondary')}
          onClick={() => descargarCSV(PLANTILLA_CONTENIDO, 'plantilla-alta-masiva.csv')}
        >
          ⬇ Descargar plantilla CSV
        </button>
      </div>

      {/* Cargar archivo */}
      <div style={s.card}>
        <span style={s.label}>Paso 2 — Cargar archivo</span>
        <div
          style={{
            border: '2px dashed #CBD5E1',
            borderRadius: 12,
            padding: '2rem',
            textAlign: 'center',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
          }}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            disabled={disabled}
          />
          <p style={{ fontSize: 14, fontWeight: 700, color: '#0B2545', marginBottom: 4 }}>
            {fileName ?? 'Haz clic para seleccionar un archivo CSV'}
          </p>
          <p style={{ fontSize: 12, color: '#94A3B8' }}>
            Máximo {MAX_FILE_SIZE_MB} MB · {MAX_FILAS_ALTA_MASIVA.toLocaleString()} filas
          </p>
        </div>

        {clientError && (
          <p style={{ marginTop: 8, fontSize: 13, color: '#DC2626', fontWeight: 600 }}>
            ⚠ {clientError}
          </p>
        )}
      </div>

      {/* Preview */}
      {preview.length > 0 && (
        <div style={s.card}>
          <span style={s.label}>Vista previa (primeras {preview.length} filas)</span>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr>
                  {previewHeaders.map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '6px 12px', background: '#F8FAFC', fontWeight: 800, color: '#475569', borderBottom: '1px solid #E2E8F0' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    {previewHeaders.map((h) => (
                      <td key={h} style={{ padding: '6px 12px', color: '#334155' }}>
                        {row[h] ?? ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Errores de validación (cliente) — nada se envía al servidor hasta corregir */}
      {erroresValidacion.length > 0 && !clientError && (
        <div style={{ ...s.card, background: '#FEF2F2', border: '1px solid #FECACA' }}>
          <span style={{ ...s.label, color: '#991B1B' }}>
            Filas con error ({erroresValidacion.length}) — corrige el archivo y vuelve a cargarlo
          </span>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr>
                  {['Fila', 'Columna', 'Error'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '6px 12px', background: '#FEE2E2', fontWeight: 800, color: '#991B1B', borderBottom: '1px solid #FECACA' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {erroresValidacion.map((e, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #FEE2E2' }}>
                    <td style={{ padding: '6px 12px', color: '#7F1D1D', fontWeight: 700 }}>{e.fila}</td>
                    <td style={{ padding: '6px 12px', color: '#7F1D1D' }}>{e.columna ?? '—'}</td>
                    <td style={{ padding: '6px 12px', color: '#7F1D1D' }}>{e.mensaje}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Procesar */}
      {filasValidas.length > 0 && erroresValidacion.length === 0 && !clientError && (
        <div style={{ ...s.card, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={s.label}>Paso 3 — Procesar</span>
          <button
            style={s.btn('primary', isPending || disabled)}
            onClick={handleProcesar}
            disabled={isPending || disabled}
          >
            {isPending
              ? progress
                ? `⏳ Procesando lote ${progress.actual} de ${progress.total}…`
                : '⏳ Procesando…'
              : '▶ Procesar alta masiva'}
          </button>
          {isPending && (
            <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>
              Esto puede tardar unos segundos según el número de usuarios…
            </p>
          )}
        </div>
      )}

      {/* Error de servidor */}
      {serverError && (
        <div style={{ ...s.card, background: '#FEF2F2', border: '1px solid #FECACA' }}>
          <p style={{ fontSize: 14, color: '#991B1B', fontWeight: 700, margin: 0 }}>
            ✕ {serverError}
          </p>
        </div>
      )}

      {/* Resultado */}
      {resultado && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Resumen */}
          <div style={s.card}>
            <span style={s.label}>Resultado</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'Filas procesadas', value: resultado.total_filas },
                { label: 'Docentes creados', value: resultado.docentes_creados },
                { label: 'Alumnos creados', value: resultado.alumnos_creados },
                { label: 'Grupos creados', value: resultado.grupos_creados },
                { label: 'Ya existentes', value: resultado.ya_existentes },
                { label: 'Con errores', value: resultado.errores.length, isError: resultado.errores.length > 0 },
              ].map(({ label, value, isError }) => (
                <div key={label} style={{ padding: '12px 16px', background: isError && value > 0 ? '#FEF2F2' : '#F8FAFC', borderRadius: 10, border: `1px solid ${isError && value > 0 ? '#FECACA' : '#E2E8F0'}` }}>
                  <p style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>{label}</p>
                  <p style={{ fontSize: 24, fontWeight: 900, color: isError && value > 0 ? '#DC2626' : '#0B2545', margin: 0 }}>{value}</p>
                </div>
              ))}
            </div>

            {resultado.credenciales.length > 0 && (
              <>
                <div
                  role="alert"
                  style={{
                    marginTop: 8,
                    padding: '12px 16px',
                    background: '#FEFCE8',
                    border: '1px solid #FDE68A',
                    borderRadius: 10,
                    fontSize: 13,
                    color: '#854D0E',
                    lineHeight: 1.5,
                  }}
                >
                  <strong>⚠ Datos personales de menores.</strong> Este archivo contiene
                  contraseñas temporales. Distribúyelo solo por un canal seguro a cada
                  usuario y <strong>elimínalo en cuanto entregues las credenciales</strong>.
                  Cada usuario deberá cambiar su contraseña en el primer inicio de sesión
                  (se aplica automáticamente).
                </div>
                <button
                  style={s.btn('primary')}
                  onClick={() => descargarCSV(credencialesACsv(resultado.credenciales), 'credenciales-alta-masiva.csv')}
                >
                  ⬇ Descargar credenciales ({resultado.credenciales.length} usuarios)
                </button>
              </>
            )}
          </div>

          {/* Errores */}
          {resultado.errores.length > 0 && (
            <div style={{ ...s.card, background: '#FEF2F2', border: '1px solid #FECACA' }}>
              <span style={{ ...s.label, color: '#991B1B' }}>
                Filas con error ({resultado.errores.length})
              </span>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr>
                      {['Fila', 'Columna', 'Error'].map((h) => (
                        <th key={h} style={{ textAlign: 'left', padding: '6px 12px', background: '#FEE2E2', fontWeight: 800, color: '#991B1B', borderBottom: '1px solid #FECACA' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.errores.map((e, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #FEE2E2' }}>
                        <td style={{ padding: '6px 12px', color: '#7F1D1D', fontWeight: 700 }}>{e.fila}</td>
                        <td style={{ padding: '6px 12px', color: '#7F1D1D' }}>{e.columna ?? '—'}</td>
                        <td style={{ padding: '6px 12px', color: '#7F1D1D' }}>{e.mensaje}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
