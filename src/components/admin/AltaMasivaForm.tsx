'use client';

import { useState, useRef, useTransition } from 'react';
import Papa from 'papaparse';
import { procesarAltaMasiva } from '@/lib/actions/alta-masiva';
import type { ResultadoAlta, Credencial } from '@/lib/schemas/alta-masiva.schema';

const PLANTILLA_CONTENIDO =
  'rol,nombre,apellido_paterno,apellido_materno,semestre,grupo_nombre\n' +
  'docente,Juan,Pérez,García,,Grupo 1A\n' +
  'alumno,María,López,Hernández,1,Grupo 1A\n' +
  'alumno,Carlos,Rodríguez,Sánchez,1,Grupo 1A\n';

const MAX_FILE_SIZE_MB = 10;
const MAX_ROWS = 5000;

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
  const [csvText, setCsvText] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<Record<string, string>[]>([]);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [clientError, setClientError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ResultadoAlta | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setClientError(null);
    setResultado(null);
    setServerError(null);
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

      if (parsed.data.length > MAX_ROWS) {
        setClientError(`El archivo tiene ${parsed.data.length} filas. El máximo es ${MAX_ROWS}.`);
        return;
      }

      if (parsed.data.length === 0) {
        setClientError('El archivo no tiene filas de datos.');
        return;
      }

      setCsvText(text);
      setFileName(file.name);
      setPreviewHeaders(parsed.meta.fields ?? []);
      setPreview(parsed.data.slice(0, 5));
    };
    reader.readAsText(file, 'UTF-8');
  }

  function handleProcesar() {
    if (!csvText || disabled) return;
    setResultado(null);
    setServerError(null);

    startTransition(async () => {
      const res = await procesarAltaMasiva(csvText);
      if ('error' in res) {
        setServerError(res.error);
        return;
      }
      setResultado(res);
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
            Máximo {MAX_FILE_SIZE_MB} MB · {MAX_ROWS.toLocaleString()} filas
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

      {/* Procesar */}
      {csvText && !clientError && (
        <div style={{ ...s.card, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={s.label}>Paso 3 — Procesar</span>
          <button
            style={s.btn('primary', isPending || disabled)}
            onClick={handleProcesar}
            disabled={isPending || disabled}
          >
            {isPending ? '⏳ Procesando…' : '▶ Procesar alta masiva'}
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
              <button
                style={s.btn('primary')}
                onClick={() => descargarCSV(credencialesACsv(resultado.credenciales), 'credenciales-alta-masiva.csv')}
              >
                ⬇ Descargar credenciales ({resultado.credenciales.length} usuarios)
              </button>
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
