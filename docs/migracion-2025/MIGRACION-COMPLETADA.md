# Migración al Modelo Educativo 2025 — COMPLETADA

**Fecha:** 2026-05-17
**Responsable:** Cristofer Esquivel Huerta
**Baseline previo:** Acuerdo 09/08/23 (MCCEMS 2023)
**Modelo destino:** Modelo Educativo 2025 (MCCEMS 2025)

---

## Resultado final

| Indicador | Antes | Después |
|-----------|-------|---------|
| Total UAC en código | 34 | **32** |
| Propósitos esperados (código) | 334 | **207** |
| Tests pasando | 143 | **150** |
| UAC inválidas (LC-IV/V/VI, HUM-I/II/III) | 9 | **0** |
| IN-V presente | No | **Sí** |
| RSC-PFH (antes RSC-HUM) | No | **Sí** |
| Semestre 1 con propósitos oficiales | 0/7 | **7/7** |
| es_placeholder=false en Semestre 1 | 0 | **48** |

---

## Fases completadas

### FASE 1 — Backup y plan (2026-05-17)

Archivos creados:
- `docs/migracion-2025/backup-estructura-pre-migracion.json` — estado del código pre-migración
- `docs/migracion-2025/backup-query.sql` — SQL para backup live de Supabase
- `docs/migracion-2025/PLAN-MIGRACION.md` — mapa completo de cambios por UAC

### FASE 2 — Estructura TypeScript (2026-05-17)

Archivos modificados:
- `src/lib/mccems/estructura.ts` — 32 UAC correctas, totalProgresionesEsperadas oficiales 2025
- `src/lib/mccems/recursos-sociocognitivos.ts` — RSC-HUM→PFH; RSC-IN semestres [1,2,3,4,5]
- `scripts/__tests__/validate-mccems-structure.test.ts` — 7 tests nuevos de validación 2025
- `src/lib/queries/__tests__/uac.test.ts` — HUM-I→PFH-I

**Tests:** 150 pasando (baseline 143 + 7 nuevos de validación 2025).

### FASE 3 — Migración SQL (2026-05-17)

Archivo creado:
- `supabase/migrations/04_alineacion_modelo_2025.sql`

Ejecutado manualmente en Supabase por el usuario. Resultado: **SUCCESS. No rows returned.**

Cambios aplicados en DB:
1. LC-IV, LC-V, LC-VI eliminadas (con sus progresiones por CASCADE)
2. RSC-HUM → RSC-PFH
3. Progresiones placeholder de HUM-I/II/III eliminadas
4. HUM-I/II/III → PFH-I/II/III (codigo, nombre, recurso_id)
5. IN-V creado (semestre 5, total_progresiones=8)
6. total_progresiones ajustados en todas las UAC al conteo oficial 2025
7. Progresiones placeholder excedentes eliminadas (es_placeholder=true AND numero > conteo_oficial)
8. Verificación final: 32 UAC, 0 códigos obsoletos — PASÓ

### FASE 4 — Re-seed Semestre 1 (2026-05-17)

Seeds actualizados con propósitos formativos oficiales (`es_placeholder=false`):

| Script | UAC | Propósitos | Fuente |
|--------|-----|------------|--------|
| `seed-lci.ts` | LC-I | 8 | `08-LENGUA-COMUNICACION.md` |
| `seed-pmi.ts` | PM-I | 7 | `05-PENSAMIENTO-MATEMATICO.md` |
| `seed-ini.ts` | IN-I | 8 | `07-INGLES.md` |
| `seed-cdi.ts` | CD-I | 8 | `02-CULTURA-DIGITAL.md` |
| `seed-csi.ts` | CS-I | 4 | `06-CIENCIAS-SOCIALES.md` |
| `seed-pfhi.ts` | PFH-I | 5 | `04-PENSAMIENTO-FILOSOFICO.md` |
| `seed-cneyti.ts` | CNEYT-I | 8 | `03-CIENCIAS-NATURALES.md` |

`seed-humi.ts` eliminado (UAC HUM-I ya no existe en DB).

Commits (uno por UAC):
- `feat(contenido): LC-I alineada a propositos formativos Modelo 2025`
- `feat(contenido): PM-I alineada a propositos formativos Modelo 2025`
- `feat(contenido): IN-I alineada a propositos formativos Modelo 2025`
- `feat(contenido): CD-I alineada a propositos formativos Modelo 2025`
- `feat(contenido): CS-I alineada a propositos formativos Modelo 2025`
- `feat(contenido): PFH-I alineada a propositos formativos Modelo 2025`
- `feat(contenido): CNEYT-I alineada a propositos formativos Modelo 2025`

---

## Cómo ejecutar los seeds de Semestre 1

Para poblar la DB con el contenido oficial, ejecutar en orden (requiere `.env.local` con credenciales Supabase):

```bash
npx tsx scripts/seed-lci.ts
npx tsx scripts/seed-pmi.ts
npx tsx scripts/seed-ini.ts
npx tsx scripts/seed-cdi.ts
npx tsx scripts/seed-csi.ts
npx tsx scripts/seed-pfhi.ts
npx tsx scripts/seed-cneyti.ts
```

Todos son idempotentes (upsert por `codigo`).

---

## Pendiente para próximas fases

### Semestres 2–6 (alta prioridad)

Los seeds de Semestres 2–6 siguen con `es_placeholder=true`. Para alinearlos:

| Semestre | UAC | Propósitos | Fuente |
|----------|-----|------------|--------|
| 2 | LC-II | 8 | `08-LENGUA-COMUNICACION.md` |
| 2 | PM-II | 6 | `05-PENSAMIENTO-MATEMATICO.md` |
| 2 | IN-II | 8 | `07-INGLES.md` |
| 2 | CD-II | 5 | `02-CULTURA-DIGITAL.md` |
| 2 | CS-II | 4 | `06-CIENCIAS-SOCIALES.md` |
| 2 | PFH-II | 5 | `04-PENSAMIENTO-FILOSOFICO.md` |
| 2 | CNEYT-II | 8 | `03-CIENCIAS-NATURALES.md` |
| 3 | LC-III | 7 | `08-LENGUA-COMUNICACION.md` |
| 3 | PM-III | 6 | `05-PENSAMIENTO-MATEMATICO.md` |
| ... | ... | ... | ... |

Los seeds de Semestre 1 son la plantilla exacta de estructura a seguir.

### Otras tareas pendientes

- **D-004 (CNEYT nombres temáticos):** Decisión de área pedagógica — ¿mantener nombres temáticos internos o adoptar "CNEyT I–VI"?
- **D-006 (terminología UI):** Actualizar etiquetas de interfaz: "UAC" → "Asignatura", "Progresión" → "Propósito formativo".
- **Conciencia Histórica:** CH-I/II/III (Sems 4–6) sin seeds de contenido oficial — pendiente creación.

---

## Archivos de referencia

| Archivo | Propósito |
|---------|-----------|
| `docs/migracion-2025/PLAN-MIGRACION.md` | Mapa de cambios por UAC |
| `docs/migracion-2025/backup-estructura-pre-migracion.json` | Estado pre-migración |
| `docs/migracion-2025/backup-query.sql` | SQL para backup live |
| `supabase/migrations/04_alineacion_modelo_2025.sql` | Migración DB aplicada |
| `docs/migracion-2025/_diagnostico-migracion-2025.log` | Log detallado por fase |
| `docs/programas-oficiales/extraidos/REPORTE-EJECUTIVO.md` | Reporte de auditoría actualizado |
