<#
.SINOPSIS
  Backup local de la base de datos de Supabase — alternativa para Windows a
  .github/workflows/backup-supabase.yml.

.DESCRIPCION
  Supabase, en el plan Free, NO tiene backups automaticos ni PITR
  (Point-in-Time Recovery) — ver docs/diagnostico/AUDITORIA-GOLD-2026-07-13.md
  y docs/diagnostico/OPTIMIZACION-ESCALA-2026-07-17.md. Este script corre
  pg_dump contra el connection string del "session pooler" de Supabase y deja
  un respaldo comprimido con nombre fechado en la carpeta destino.

  Uso principal: sacar un backup manual ANTES de una operacion riesgosa (alta
  masiva, migracion, limpieza de datos de prueba) sin esperar al cron diario
  de las 03:00 CDMX del workflow de GitHub Actions, o como respaldo local
  mientras el repo todavia no esta subido a GitHub.

.REQUISITOS
  1) pg_dump.exe en el PATH. En Windows se instala junto con el cliente de
     PostgreSQL (idealmente version 17, la misma que corren los proyectos
     nuevos de Supabase):
       - Instalador oficial: https://www.postgresql.org/download/windows/
         (basta marcar solo "Command Line Tools" en el instalador, NO hace
         falta instalar ni correr un servidor local).
       - O via Chocolatey:  choco install postgresql17
     Verificar despues de instalar (puede requerir abrir una terminal nueva
     para que el PATH se actualice):
       pg_dump --version

  2) Variable de entorno SUPABASE_DB_URL con la cadena del modo "Session" del
     connection pooler (puerto 5432 — NO el modo "Transaction" de puerto
     6543, que no sostiene la sesion persistente que pg_dump necesita):
       Dashboard de Supabase -> Project Settings -> Database ->
       "Connection string" -> pestaña "Session".
     Definirla para la sesion actual de PowerShell:
       $env:SUPABASE_DB_URL = "postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres"
     O de forma permanente a nivel usuario (persiste entre sesiones):
       [Environment]::SetEnvironmentVariable("SUPABASE_DB_URL", "postgresql://...", "User")
     Si la contraseña de la base tiene caracteres especiales (@, /, #, etc.)
     deben ir URL-encoded dentro de la cadena o pg_dump la interpreta mal.

.PARAMETRO CarpetaDestino
  Carpeta donde se guarda el backup. Se crea si no existe. Por defecto
  ".\backups" (relativa a donde se ejecute el script).

.USO
  # Backup a .\backups (carpeta por defecto)
  .\scripts\backup-supabase.ps1

  # Backup a una carpeta especifica, p.ej. un disco externo
  .\scripts\backup-supabase.ps1 -CarpetaDestino "D:\backups-cen"

.SALIDA
  <CarpetaDestino>\supabase-backup-yyyyMMdd-HHmm.zip
  (contiene un unico archivo .sql en texto plano, formato restaurable con psql)

.RESTAURAR (en caso de emergencia)
  Expand-Archive "supabase-backup-XXXXXXXX-XXXX.zip" -DestinationPath .
  psql $env:SUPABASE_DB_URL -f supabase-backup-XXXXXXXX-XXXX.sql
#>

param(
    [string]$CarpetaDestino = ".\backups"
)

$ErrorActionPreference = "Stop"

# --- 1. Validar que pg_dump esta disponible en el PATH ---
# (Get-Command con -ErrorAction SilentlyContinue no lanza si no lo encuentra;
# se comprueba el resultado a mano en vez de envolver todo en try/catch.)
$pgDump = Get-Command pg_dump -ErrorAction SilentlyContinue
if ($null -eq $pgDump) {
    Write-Error "pg_dump no se encontro en el PATH. Instala el cliente de PostgreSQL (idealmente version 17, la misma que corren los proyectos nuevos de Supabase) y abre una terminal nueva. Ver el bloque .REQUISITOS al inicio de este script."
    exit 1
}

# --- 2. Validar que la variable de entorno esta definida ---
if ([string]::IsNullOrWhiteSpace($env:SUPABASE_DB_URL)) {
    Write-Error "La variable de entorno SUPABASE_DB_URL no esta definida. Ver el bloque .REQUISITOS al inicio de este script para obtenerla del dashboard de Supabase (usar el modo 'Session' del pooler, puerto 5432)."
    exit 1
}

# --- 3. Preparar carpeta destino y nombre de archivo fechado ---
if (-not (Test-Path $CarpetaDestino)) {
    New-Item -ItemType Directory -Path $CarpetaDestino -Force | Out-Null
    Write-Host "Carpeta destino creada: $CarpetaDestino"
}

$fecha = Get-Date -Format "yyyyMMdd-HHmm"
$nombreSql = "supabase-backup-$fecha.sql"
$rutaSql = Join-Path $CarpetaDestino $nombreSql
$rutaZip = Join-Path $CarpetaDestino "supabase-backup-$fecha.zip"

Write-Host "Iniciando pg_dump contra Supabase (puede tardar segun el tamaño de la BD)..."

# --format=plain (default): se restaura con `psql -f` sin depender de
# pg_restore ni de flags adicionales — mas a prueba de balas en una
# emergencia operada por alguien que no vive en Postgres a diario.
# --no-owner / --no-privileges: el dump se piensa para restaurar en un
# proyecto de recuperacion con roles distintos a los del original; sin estas
# banderas la restauracion fallaria intentando reasignar dueños/permisos que
# no existen ahi.
& pg_dump $env:SUPABASE_DB_URL --format=plain --no-owner --no-privileges --file=$rutaSql

if ($LASTEXITCODE -ne 0) {
    Write-Error "pg_dump termino con codigo de salida $LASTEXITCODE. Revisa la cadena de conexion (SUPABASE_DB_URL) y que el proyecto de Supabase no este pausado (7 dias sin actividad API lo pausa automaticamente en el plan Free)."
    exit $LASTEXITCODE
}

# Sanity check minimo: un dump casi vacio sugiere que algo salio mal aunque
# pg_dump haya devuelto exit code 0.
$tamanoSql = (Get-Item $rutaSql).Length
if ($tamanoSql -lt 1024) {
    Write-Error "El dump generado ($rutaSql) pesa solo $tamanoSql bytes -- probablemente algo fallo a medias. Revisa la salida de pg_dump arriba antes de confiar en este backup."
    exit 1
}

# --- 4. Comprimir el dump ---
# PowerShell no trae gzip nativo; Compress-Archive (built-in desde PS 5.0,
# sin dependencias externas) genera un .zip en vez de un .gz -- equivalente
# en el objetivo (reducir peso en disco) sin depender de que gzip.exe este
# instalado en la maquina.
Compress-Archive -Path $rutaSql -DestinationPath $rutaZip -Force
Remove-Item $rutaSql -Force

Write-Host ""
Write-Host "Backup completado: $rutaZip"
Write-Host "Para restaurar en una emergencia:"
Write-Host "  Expand-Archive '$rutaZip' -DestinationPath ."
Write-Host "  psql `$env:SUPABASE_DB_URL -f $nombreSql"
