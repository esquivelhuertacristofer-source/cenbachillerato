# Jornada de carga en Supabase

Herramienta para **medir la capacidad real** de la base de datos contra el objetivo
del piloto (5,000–7,000 alumnos concurrentes / 15,000–20,000 cuentas) en lugar de
seguir apoyándonos en una estimación de planeación.

> **Regla de oro:** todo corre en **SIMULACRO** por defecto. Sin
> `LOADTEST_CONFIRM=si` en el entorno, ningún script manda tráfico, crea ni borra
> nada — solo imprime el plan. Es intencional: la BD tiene datos de **menores**.

---

## Qué mide (y qué NO)

El catálogo (UAC, progresiones, actividades) se sirve desde **KV cache** y **no
toca Supabase**. Por eso la carga real de Postgres son las **lecturas personales
autenticadas** de cada alumno, que es justo lo que estos escenarios replican
verbatim contra las consultas de `src/lib/queries/*`:

| escenario        | consulta real replicada                              | frecuencia |
|------------------|------------------------------------------------------|-----------|
| `snapshot`       | `hub.ts` `getSnapshotCompletadas` (lookup por PK)    | altísima  |
| `progresoDetalle`| `progreso.ts` `getProgresoDetallePorUAC` (4 en lote) | media     |
| `resumen`        | `progreso.ts` `getResumenActividadAlumno` (3 + RPC)  | media     |
| `escritura`      | `entregar-actividad.ts` insert en `intentos`         | solo `--writes` |

Cada escenario corre con el **JWT del alumno sintético**, así que pasa por las
mismas **políticas RLS** que un alumno real. La escritura dispara además el
**trigger del snapshot** (misma ruta de la migración 25).

**Lo que NO es:** no es una prueba de 7,000 sockets vivos. Un solo proceso Node en
Windows no sostiene esa cantidad de conexiones; lo que mide es el **techo de
throughput sostenible (req/s)** y de ahí extrapola alumnos concurrentes con la ley
de Little. El reporte distingue explícitamente si el cuello fue **Postgres** o el
**propio loader** (lag del event-loop).

---

## Archivos

```
scripts/loadtest/
  config.ts                    # config + candados de seguridad (SIMULACRO por defecto)
  metricas.ts                  # reservoir sampling → p50/p95/p99 con memoria acotada
  escenarios.ts                # las consultas reales, replicadas 1:1
  provision-usuarios-carga.ts  # crea escuela sandbox + N alumnos sintéticos
  correr-carga.ts              # el driver: rampa de concurrencia + reporte
  limpiar-usuarios-carga.ts    # borra TODO lo sintético al terminar
  out/                         # reportes JSON de cada corrida (se crea solo)
```

Los scripts viven en `scripts/`, que `tsconfig.json` **excluye** — no los ve `tsc`,
ni `eslint src/`, ni `next build`. No pueden romper los gates ni inflar el bundle
del Worker. Corren con `tsx` (esbuild).

---

## Cómo se corre (orden completo)

### 0. (Recomendado) Apuntar a un clon/staging, no a PROD

Por defecto apunta al mismo Supabase de la app (`.env.local`), que es
**producción con datos de menores**. Para no golpear PROD, clona el proyecto y
exporta:

```powershell
$env:LOADTEST_SUPABASE_URL      = "https://<clon>.supabase.co"
$env:LOADTEST_SUPABASE_ANON_KEY = "<anon key del clon>"
```

El `service_role` (provisión/limpieza) sí sale de `.env.local`; para un clon,
ajusta también `NEXT_PUBLIC_SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` a ese clon
mientras dure la prueba. Si no clonas, la prueba de **solo lectura** contra PROD es
segura (no escribe); solo consume cómputo/egress un rato.

### 1. Simulacro (no manda nada)

```powershell
npx tsx scripts/loadtest/provision-usuarios-carga.ts --users 400 --seed 8
npx tsx scripts/loadtest/correr-carga.ts
```

Imprime el plan (objetivo, etapas, mezcla, pico de concurrencia) y sale. Revisa que
el host objetivo sea el correcto **antes** de confirmar.

### 2. Provisionar cuentas sintéticas (de verdad)

```powershell
$env:LOADTEST_CONFIRM = "si"
npx tsx scripts/loadtest/provision-usuarios-carga.ts --users 400 --seed 8
```

- `--users N` — cuántos alumnos sintéticos asegurar (idempotente; repetible).
- `--seed K` — siembra K intentos por alumno para que las lecturas midan payloads
  realistas y **pueblen el snapshot** vía trigger. Recomendado ≥ 5.

Todo cuelga de la escuela sandbox **`ZZZ Carga Sintética — NO ES ESCUELA REAL`**
(CCT `LOADTEST-000`), imposible de confundir con una escuela real.

### 3. Correr la carga

```powershell
# solo lectura (recomendado para la primera corrida):
$env:LOADTEST_CONFIRM = "si"
npx tsx scripts/loadtest/correr-carga.ts

# incluyendo escrituras (insert en intentos, solo cuentas sintéticas):
npx tsx scripts/loadtest/correr-carga.ts --writes
```

El driver firma hasta `MAX_CLIENTES` alumnos, sube la concurrencia por etapas
(`10, 25, 50, 100, 200, 400` por defecto, `30s` cada una), mide p50/p95/p99 +
throughput + tasa de error por etapa, **corta** si una etapa se satura, detecta la
rodilla y traduce el techo a alumnos concurrentes. Guarda un JSON en `out/`.

`Ctrl-C` cierra la etapa en curso e imprime el reporte parcial.

### 4. Limpiar (borrar todo lo sintético)

```powershell
$env:LOADTEST_CONFIRM = "si"
npx tsx scripts/loadtest/limpiar-usuarios-carga.ts
```

Borra en orden seguro de FKs: intentos → snapshot → profiles → usuarios de Auth →
escuela sandbox. Solo toca lo que cuelga de `LOADTEST-000`.

---

## Parámetros (todos override por env)

| variable                    | default                      | qué controla |
|-----------------------------|------------------------------|--------------|
| `LOADTEST_CONFIRM`          | *(vacío)*                    | `si` = ejecuta de verdad; cualquier otra cosa = simulacro |
| `LOADTEST_SUPABASE_URL`     | `NEXT_PUBLIC_SUPABASE_URL`   | objetivo de la carga (usar clon/staging) |
| `LOADTEST_SUPABASE_ANON_KEY`| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key del objetivo |
| `LOADTEST_PASSWORD`         | `Carga-Sintetica-2026!`      | contraseña común de las cuentas sintéticas |
| `LOADTEST_STAGES`           | `10,25,50,100,200,400`       | etapas de concurrencia (requests en vuelo) |
| `LOADTEST_STAGE_SEC`        | `30`                         | segundos por etapa |
| `LOADTEST_MAX_CLIENTS`      | `400`                        | cuántos alumnos firmar |
| `LOADTEST_SLO_P95_MS`       | `800`                        | p95 objetivo (SLO); arriba = etapa no pasa |
| `LOADTEST_ERROR_PCT`        | `5`                          | corta la etapa si el error supera este % |
| `LOADTEST_WRITE_PCT`        | `5`                          | peso del escenario de escritura con `--writes` |

---

## Cómo leer el reporte

Al final imprime una tabla por etapa y un veredicto:

```
Techo sostenible medido: ~N req/s  (a C requests en vuelo, p95 X ms, err Y%)

Mapeo a ALUMNOS CONCURRENTES soportables (ley de Little: alumnos ≈ req/s × think-time):
  • think-time 15s → ~A alumnos
  • think-time 20s → ~B alumnos
  • think-time 30s → ~C alumnos   ✅ dentro de 5-7k
```

- **Techo (req/s):** el throughput sostenido de la **mejor etapa que aún cumple el
  SLO** (p95 ≤ 800ms y error ≤ 5%).
- **Alumnos ≈ req/s × think-time:** ley de Little. El *think-time* es el tiempo
  entre interacciones de UN alumno (navegar, leer, resolver). Es un **supuesto**:
  15–30s es razonable; ajústalo a tu telemetría real cuando la tengas.
- **Veredicto honesto:**
  - Si la etapa más alta **aún pasa**, no se alcanzó saturación: el techo real es
    **≥** lo medido — sube `LOADTEST_STAGES`.
  - Si el **lag del event-loop** fue alto, el cuello probablemente fue **este
    proceso Node** (un solo box), no Postgres — el techo real de Supabase puede ser
    **mayor**. Confírmalo corriendo en paralelo desde varias máquinas/procesos.

---

## Seguridad y costo

- **Datos de menores:** la carga usa **solo** cuentas sintéticas en una escuela
  claramente etiquetada; nunca alumnos reales. La lectura no modifica nada; la
  escritura (`--writes`) solo inserta en cuentas sintéticas.
- **Ejecución gated:** nada corre sin `LOADTEST_CONFIRM=si`. La ejecución contra la
  infraestructura real (PROD) debe **confirmarse explícitamente** antes de correr.
- **RLS real:** cada request va con el JWT del alumno, así que la prueba también
  valida que las políticas RLS aguanten la concurrencia (no solo el cómputo).
- **Costo:** la corrida consume cómputo Postgres + egress durante unos minutos.
  Contra el proyecto FREE puede rozar límites del tier a alta concurrencia — eso es
  justo lo que queremos observar. Limpia al terminar para no dejar filas ni cuentas.
- **No dejar rastro:** corre siempre `limpiar-usuarios-carga.ts` al cerrar.
