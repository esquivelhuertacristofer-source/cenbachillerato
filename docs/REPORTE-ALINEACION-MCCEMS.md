# Reporte de Alineación MCCEMS

> Fecha: 2026-05-12 | Estado: Completado — Plataforma alineada al MCCEMS oficial (Acuerdo 09/08/23 / Gen 2023-2026 + Modelo Educativo 2025)

---

## Resumen ejecutivo

La plataforma tenía 7 discrepancias estructurales críticas respecto al MCCEMS oficial. Todas han sido corregidas. La estructura curricular ahora refleja con precisión el Marco Curricular Común de la Educación Media Superior vigente.

| Métrica | Antes | Después |
|---------|-------|---------|
| UAC Semestre 1 | 5 (incorrecto) | 7 ✅ |
| Total UAC | 39 (incorrectas) | 34 CF ✅ |
| Recursos Sociocognitivos | 5 (incompleto) | 8 ✅ |
| Ámbitos Socioemocionales | 3 (NEM 2019, nombres incorrectos) | 4 MCCEMS ✅ |
| Progresiones totales | 402 (UAC incorrectas) | 342 (UAC correctas) ✅ |
| Flag es_placeholder | No existía (BUG-006) | ✅ Implementado |
| Tests de validación | 0 | 25 ✅ |

---

## Discrepancias corregidas

| ID | Discrepancia | Severidad | Estado |
|----|-------------|-----------|--------|
| D-001 | Semestre 1 tenía 5 UAC en lugar de 7 (faltaban CS-I, HUM-I, CNEYT-I) | 🔴 Crítica | ✅ Corregido |
| D-002 | Conciencia Histórica en sems 1-3 en lugar de 4-6 | 🔴 Crítica | ✅ Corregido |
| D-003 | CNEYT completamente ausente (6 UAC temáticas, sems 1-6) | 🔴 Crítica | ✅ Corregido |
| D-004 | Humanidades en CFE sems 3-5 en lugar de CF sems 1-3 | 🔴 Crítica | ✅ Corregido |
| D-005 | Ciencias Sociales con nombres Historia/Economía/Sociología, en CFE en lugar de CF | 🔴 Crítica | ✅ Corregido |
| D-006 | Cultura Digital III (sem 6) ausente | 🟡 Importante | ✅ Corregido |
| D-007 | Ámbitos Socioemocionales: 3 nombres NEM 2019 en lugar de 4 nombres MCCEMS | 🔴 Crítica | ✅ Corregido |

---

## Estructura final implementada

### UAC por semestre (34 UAC — Currículum Fundamental)

| Semestre | UAC | Total prog. |
|----------|-----|-------------|
| 1 | LC-I, PM-I, IN-I, CD-I, CS-I, HUM-I, CNEYT-I | 70 |
| 2 | LC-II, PM-II, IN-II, CD-II, CS-II, HUM-II, CNEYT-II | 70 |
| 3 | LC-III, PM-III, IN-III, HUM-III, CNEYT-III | 52 |
| 4 | LC-IV, PM-IV, IN-IV, CH-I, CS-III, CNEYT-IV | 62 |
| 5 | LC-V, PM-V, CH-II, CNEYT-V | 40 |
| 6 | LC-VI, PM-VI, CH-III, CD-III, CNEYT-VI | 48 |
| **Total** | **34 UAC** | **342 progresiones** |

### Recursos Sociocognitivos (8)

| RSC | Semestres |
|-----|-----------|
| RSC-LC (Lengua y Comunicación) | 1-6 |
| RSC-PM (Pensamiento Matemático) | 1-6 |
| RSC-IN (Inglés) | 1-4 |
| RSC-CD (Cultura Digital) | 1, 2, 6 |
| RSC-CH (Conciencia Histórica) | 4, 5, 6 |
| RSC-CS (Ciencias Sociales) | 1, 2, 4 |
| RSC-HUM (Humanidades) | 1, 2, 3 |
| RSC-CNEYT (Ciencias Naturales, Experimentales y Tecnología) | 1-6 |

### Ámbitos de Formación Socioemocional (4)

1. Actividades físicas y deportivas
2. Actividades artísticas y culturales
3. Educación integral en sexualidad y género
4. Educación para la salud y práctica ciudadana

---

## Archivos modificados

### Datos curriculares (TypeScript)
- `src/lib/mccems/estructura.ts` — UAC_BASE reescrita, RECURSOS_SOCIOEMOCIONALES corregidos
- `src/lib/mccems/recursos-sociocognitivos.ts` — 3 RSC nuevos (RSC-CS, RSC-HUM, RSC-CNEYT); semestres de RSC-CH y RSC-CD corregidos

### Base de datos
- `supabase/migrations/02_realinear_mccems_oficial.sql` — Migración completa: es_placeholder, 3 RSC nuevos, 4 RSE correctos, borrado de 19 UAC incorrectas, inserción de 15 UAC correctas, corrección de semestres CH

### Seed
- `scripts/seed-mccems.ts` — Agrega `es_placeholder: true` explícito en todas las progresiones

### UI
- `src/components/hub/Sidebar.tsx` — Elimina sección "Área de Conocimiento" (ya no aplica en CF)
- `src/app/hub/page.tsx` — Grid RSE 3→4 columnas, título actualizado
- `src/app/hub/uac/[codigo]/page.tsx` — Badge muestra nombre del RSC, elimina badge de "Área"
- `src/app/hub/semestre/[num]/page.tsx` — Elimina sección CFE, grid 4 columnas, elimina doble auth query
- `src/components/landing-bachillerato/EstructuraMCCEMS.tsx` — Grid RSC 5→4 columnas, RSE 3→4 columnas, CFE label actualizado a sem 5-6

### Documentación
- `docs/MCCEMS-OFICIAL.md` — Estructura oficial documentada (fuente DGB)
- `docs/AUDITORIA-CURRICULAR.md` — 8 discrepancias identificadas con plan de corrección
- `docs/REPORTE-ALINEACION-MCCEMS.md` — Este documento

### Tests
- `scripts/__tests__/validate-mccems-structure.test.ts` — 25 tests, todos passing

---

## Procedimiento de aplicación en producción

```bash
# 1. Ejecutar la migración en Supabase (una sola vez)
#    Ir a: supabase.com → proyecto xmcfuwdanlciqdxqtslv → SQL Editor
#    Pegar y ejecutar: supabase/migrations/02_realinear_mccems_oficial.sql

# 2. Re-sembrar los datos curriculares
npx tsx scripts/seed-mccems.ts

# 3. Verificar (ejecutar en Supabase SQL Editor)
# SELECT semestre, COUNT(*) FROM uac GROUP BY semestre ORDER BY semestre;
# -- Esperado: 1→7, 2→7, 3→5, 4→6, 5→4, 6→5
#
# SELECT COUNT(*) FROM progresiones;
# -- Esperado: 342
#
# SELECT COUNT(*) FROM progresiones WHERE es_placeholder = true;
# -- Esperado: 342 (todas placeholder hasta recibir contenido real del cliente)
```

---

## Pendiente — Decisiones del cliente

### 1. Generación activa
La estructura implementada corresponde a Gen 2023-2026 (Acuerdo 09/08/23). Para Gen 2025-2028 (Modelo Educativo 2025), el Acuerdo 21/08/25 está pendiente de descarga manual del DOF. El cliente debe confirmar qué generación(es) atiende su institución.

### 2. CFE Electives (sems 5-6)
No se han implementado las ~20 UAC electivas del CFE para semestres 5-6. El cliente debe confirmar:
- ¿Qué opciones del catálogo ofrece su institución?
- ¿Cómo gestiona la elección del alumno?

### 3. Contenido real de progresiones
Las 342 progresiones tienen `es_placeholder = true`. Para avanzar a contenido real:
- El cliente debe proveer los programas de estudio por UAC (PDF o documento interno)
- Prioridad sugerida: LC-I y PM-I (más urgentes para demo Semana 2)
- Script de carga disponible para implementar: `scripts/import-progresiones.ts` (pendiente de crear)

### 4. CL (Currículum Laboral)
No implementado. Si la institución es bivalente/tecnológica, requiere UAC adicionales del CL.

---

## Tests

```
PASS scripts/__tests__/validate-mccems-structure.test.ts
  MCCEMS Structure Validation — UAC por semestre
    ✓ Semestre 1 tiene exactamente 7 UAC oficiales
    ✓ Semestre 1 contiene todos los códigos obligatorios
    ✓ Semestre 2 tiene exactamente 7 UAC oficiales
    ✓ Semestre 2 contiene todos los códigos obligatorios
    ✓ Semestre 3 contiene los códigos confirmados por DGB
    ✓ Semestre 4 contiene CH-I (Conciencia Histórica inicia en sem 4)
    ✓ Semestre 5 contiene CH-II y CNEYT-V
    ✓ Semestre 6 contiene CH-III, CD-III y CNEYT-VI
  MCCEMS Structure Validation — Códigos inválidos eliminados
    ✓ No existen UAC con códigos del seed incorrecto anterior
    ✓ Conciencia Histórica NO está en semestres 1, 2, 3
  MCCEMS Structure Validation — Componente correcto
    ✓ Todas las UAC en UAC_BASE son del Currículum Fundamental (CF)
    ✓ Todas las UAC tienen recursoCodigo (no areaCodigo)
    ✓ Ninguna UAC tiene areaCodigo
  MCCEMS Structure Validation — Recursos Sociocognitivos
    ✓ Hay 8 Recursos Sociocognitivos (Modelo Educativo 2025)
    ✓ Los 8 RSC tienen los códigos correctos
    ✓ RSC-CH tiene semestres [4, 5, 6] (no [1, 2, 3])
    ✓ RSC-CD aparece en semestre 6 (Cultura Digital III)
  MCCEMS Structure Validation — Ámbitos Socioemocionales
    ✓ Hay 4 Ámbitos de Formación Socioemocional (no 3)
    ✓ Los ámbitos tienen los nombres oficiales MCCEMS (no NEM 2019)
    ✓ No existen los nombres incorrectos del NEM 2019
  MCCEMS Structure Validation — Componentes curriculares
    ✓ Existen los 4 componentes curriculares
    ✓ CF, CFE, CA, CL están presentes
  MCCEMS Structure Validation — Totales y conteo
    ✓ Total de UAC es 34 (CF únicamente)
    ✓ Total de progresiones esperadas es 342
    ✓ Cada recursoCodigo existe en RECURSOS_SOCIOCOGNITIVOS

Tests: 25 passed, 25 total
```
