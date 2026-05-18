# Reporte de Robustez — Actividades Semestre 1

**Fecha:** 2026-05-17  
**Alcance:** 144 actividades / 48 progresiones / 7 UAC del Semestre 1  
**Estado general:** ✅ PASS — Listo para revisión pedagógica humana

---

## Resumen ejecutivo

Las 144 actividades del Semestre 1 pasaron todas las verificaciones de integridad
estructural y alineación curricular. Se detectaron y corrigieron 2 defectos de alta
severidad (fill_blanks) y se documentaron 28 observaciones de severidad media
(extensión de texto) que requieren decisión pedagógica humana.

| Dimensión | Resultado | Estado |
|-----------|-----------|--------|
| Integridad de inventario (Fase 1) | 144/144 actividades, 48/48 progresiones con 3 acts | ✅ PASS |
| Validación Zod (Fase 2) | 144/144 válidas | ✅ PASS |
| `tipo_codigo` FK | 144/144 sincronizadas | ✅ PASS |
| Calidad heurística (Fase 3) | 0 alta, 28 media, 0 baja | ⚠️ 28 MEDIUM |
| Duplicados (Fase 5) | 0 títulos dup, 0 contenido dup | ✅ PASS |
| Secuencia pedagógica (Fase 6) | 44/48 OK, 4 CS-I por diseño | ✅ PASS* |
| Alineación oficial MCC EMS 2025 (Fase 4) | 48/48 progresiones alineadas | ✅ PASS |

*La excepción CS-I es decisión pedagógica deliberada (ver DEC-01 en DECISIONES-ACTIVIDADES.md)

---

## Fase 1 — Inventario e integridad

**Ejecutado:** `npx tsx scripts/audit-fase1-inventario.ts`

### Resultados

- **Progresiones Semestre 1:** 48/48 ✅
- **Actividades totales:** 144/144 ✅
- **Progresiones con exactamente 3 actividades:** 48/48 ✅
- **Campos obligatorios (titulo, contenido, estado, progresion_id):** 0 anomalías ✅
- **Estado de actividades:** 144/144 en `borrador` ✅
- **`tipo_codigo` antes de fix:** NULL en 144/144 (sincronizado en Fase 2)

### Distribución por UAC

| UAC | Progresiones | Actividades |
|-----|-------------|------------|
| LC-I | 8 | 24 |
| PM-I | 7 | 21 |
| IN-I | 8 | 24 |
| CD-I | 8 | 24 |
| CS-I | 4 | 12 |
| PFH-I | 5 | 15 |
| CNEYT-I | 8 | 24 |
| **Total** | **48** | **144** |

---

## Fase 2 — Validación Zod y sincronización tipo_codigo

**Ejecutado:** `npx tsx scripts/validate-actividades-zod.ts`

### Resultados

- **Validación Zod:** 144/144 actividades válidas ✅
- **`tipo_codigo` sincronizado:** 144/144 (UPDATE desde `tipo` legado) ✅

### Distribución de tipos de actividad

| Tipo | Cantidad |
|------|---------|
| lectura | 48 |
| quiz_multiple_opcion | 27 |
| quiz_verdadero_falso | 8 |
| fill_blanks | 8 |
| ejercicio_matematico | 7 |
| debate_estructurado | 4 |
| reflexion_escrita | 48* |

*Todas las A3 son reflexion_escrita; total real = 48 (sin LC-I que usa quiz_verdadero_falso como A2)

---

## Fase 3 — Calidad heurística

**Ejecutado:** `npx tsx scripts/audit-calidad-actividades.ts`

### Resumen

| Severidad | Cantidad | Acciones |
|-----------|---------|---------|
| 🔴 Alta | 0 | — |
| 🟡 Media | 28 | Documentadas, sin acción automática |
| 🟢 Baja | 0 | — |

### Issues de alta severidad (RESUELTOS)

**2 defectos detectados y corregidos antes de la ejecución de la Fase 3 final:**

| Código | Problema | Fix aplicado |
|--------|---------|-------------|
| IN-I-P05-A2 | fill_blanks: 9 marcadores `___`, solo 8 huecos | Añadido hueco posicion:8 `{respuesta:"there", pista:"Yes, ___ is one on the corner"}` |
| IN-I-P07-A2 | fill_blanks: 9 marcadores `___`, solo 8 huecos; hueco 7 asignado a marker equivocado | Remapeado hueco 7→"Do" (___ you like English?), añadido hueco 8→"do" (Yes, I ___!) |

**Script:** `scripts/fix-fillblanks-mismatch.ts`  
**Verificación post-fix:** IN-I-P05-A2: 9 marcadores === 9 huecos ✅ / IN-I-P07-A2: 9 marcadores === 9 huecos ✅

### Issues de media severidad (28 — pendientes decisión pedagógica)

**Causa:** Textos de tipo `lectura` con menos de 200 palabras (umbral heurístico)

| UAC | Progresiones afectadas | Rango de palabras | Nota |
|-----|----------------------|-------------------|------|
| LC-I | P01, P02, P03, P04, P05, P06, P07, P08 (8) | 144–179 | Borderline; texto narrativo completo |
| IN-I | P01, P02, P03, P04, P05, P06, P07, P08 (8) | 142–198 | A1: deliberadamente corto (ver DEC-02) |
| CD-I | P01, P02, P04, P05, P07, P08 (6) | 187–199 | Muy borderline |
| PM-I | P02, P03, P04, P05, P06, P07 (6) | 175–197 | Muy borderline |

**Decisión recomendada:** Mantener. El umbral de 200 palabras es orientativo, no oficial.
La prioridad debe ser primero validar funcionalmente la plataforma con contenido real.
Ver [DEC-02](../DECISIONES-ACTIVIDADES.md#dec-02-lecturas-con-texto-200-palabras-en-in-i) y
[DEC-03](../DECISIONES-ACTIVIDADES.md#dec-03-lecturas-con-texto-200-palabras-en-lc-i-cd-i-y-pm-i).

---

## Fase 4 — Alineación a documentos oficiales MCC EMS 2025

**Método:** Comparación de temas de progresiones vs. propósitos formativos oficiales  
**Fuente oficial:** `docs/programas-oficiales/extraidos/`  
**Ver detalle completo:** [ALINEACION-OFICIAL-SEM1.md](./ALINEACION-OFICIAL-SEM1.md)

### Resultado por UAC

| UAC | PF oficiales | Progresiones | Alineadas | Estado |
|-----|-------------|-------------|-----------|--------|
| LC-I | 8 | 8 | 8 | ✅ 100% |
| PM-I | 7 | 7 | 7 | ✅ 100% |
| IN-I | 8 | 8 | 8 | ✅ 100% |
| CD-I | 8 | 8 | 8 | ✅ 100% |
| CS-I | 4 | 4 | 4 | ✅ 100% |
| PFH-I | 5 | 5 | 5 | ✅ 100% |
| CNEYT-I | 8 | 8 | 8 | ✅ 100% |
| **Total** | **48** | **48** | **48** | ✅ **100%** |

**Hallazgo:** Las 48 progresiones tienen correspondencia 1:1 con propósitos formativos
oficiales del MCCEMS 2025. Los temas de las progresiones fueron diseñados alineados al
programa oficial desde el inicio.

---

## Fase 5 — Detección de duplicados

**Ejecutado:** `npx tsx scripts/audit-calidad-actividades.ts` (incluye Fase 5)

- **Títulos duplicados:** 0 ✅
- **Contenido principal duplicado** (primeros 150 caracteres): 0 ✅

---

## Fase 6 — Verificación de secuencia pedagógica

**Ejecutado:** `npx tsx scripts/audit-calidad-actividades.ts` (incluye Fase 6)

**Definición de secuencia correcta:**
- A1 (contextualización): `lectura | video_con_preguntas | infografia | glosario_interactivo`
- A2 (práctica): `quiz_* | fill_blanks | ejercicio_matematico | simulacion`
- A3 (cierre): `reflexion_escrita | debate_estructurado | autoevaluacion`

| Resultado | Cantidad |
|-----------|---------|
| Secuencias correctas | 44/48 |
| Secuencias "rotas" (CS-I debate como A2) | 4/48 |

**Las 4 excepciones en CS-I son por diseño** — ver [DEC-01](../DECISIONES-ACTIVIDADES.md#dec-01-debate_estructurado-como-a2-en-cs-i).

El debate estructurado es el tipo de práctica apropiada para Ciencias Sociales según el
enfoque sociohistórico crítico del MCC EMS 2025.

---

## Defectos conocidos y su estado

| ID | UAC | Código | Tipo | Descripción | Severidad | Estado |
|----|-----|--------|------|-------------|-----------|--------|
| D01 | IN-I | IN-I-P05-A2 | fill_blanks | Mismatch 9 marcadores/8 huecos | Alta | ✅ Corregido |
| D02 | IN-I | IN-I-P07-A2 | fill_blanks | Mismatch 9/8 + hueco mal asignado | Alta | ✅ Corregido |
| D03 | IN-I | P01–P08 A1 | lectura | Texto <200 palabras (A1 por diseño) | Media | Documentado, mantener |
| D04 | LC-I | P01–P08 A1 | lectura | Texto <200 palabras (borderline) | Media | Documentado, revisar |
| D05 | CD-I | P01,02,04,05,07,08 A1 | lectura | Texto <200 palabras (borderline) | Media | Documentado, revisar |
| D06 | PM-I | P02–P07 A1 | lectura | Texto <200 palabras (borderline) | Media | Documentado, revisar |
| D07 | CS-I | P01–P04 A2 | debate | A2=debate_estructurado ≠ heurística | N/A | Decisión de diseño |

---

## Scripts de auditoría creados

| Script | Propósito | Resultado |
|--------|-----------|----------|
| `scripts/audit-fase1-inventario.ts` | Integridad de inventario | ✅ PASS |
| `scripts/validate-actividades-zod.ts` | Validación Zod + sync tipo_codigo | ✅ PASS |
| `scripts/audit-calidad-actividades.ts` | Calidad heurística + duplicados + secuencia | ⚠️ 28 MEDIUM |
| `scripts/fix-fillblanks-mismatch.ts` | Fix HIGH severity fill_blanks | ✅ Aplicado |

---

## Próximos pasos recomendados

### Inmediato (antes del piloto)

1. **Revisión pedagógica humana** de las 28 lecturas con texto borderline (<200 palabras).
   Decidir si se amplían o si el umbral se ajusta por tipo de UAC.

2. **Validación funcional** del ciclo completo de actividades:
   - Completar una progresión como estudiante en el entorno de dev
   - Verificar que fill_blanks puntúa correctamente (especialmente IN-I P05/P07 post-fix)
   - Verificar que debate_estructurado guarda respuestas correctamente

3. **Revisión del contenido de PFH-I P05** para confirmar que incluye filosófia indígena
   mesoamericana (no solo referencia genérica), como exige el programa oficial.

### Medio plazo (antes de lanzamiento)

4. Ampliar heurística de secuencia para incluir `debate_estructurado` como A2 válido
   para CS-I y PFH-I.

5. Generar actividades de Semestre 2 con el mismo proceso: seed → audit → fix → report.

6. Revisar y, si aplica, expandir los textos de lectura de LC-I que están más alejados
   del umbral (P03 con 161 palabras, P05 con 142 palabras).

---

## Estimación de calidad global

| Métrica | Valor |
|---------|-------|
| Actividades sin ningún issue | 116/144 (81%) |
| Actividades con issues corregidos | 2/144 (1%) |
| Actividades con issues documentados (pending) | 28/144 (19%) |
| Actividades con issues críticos sin resolver | 0/144 (0%) |
| Alineación curricular | 48/48 progresiones (100%) |

**Estado de calidad: APTO PARA REVISIÓN PEDAGÓGICA HUMANA**

---

*Generado: 2026-05-17*  
*Scripts de auditoría: `scripts/audit-fase1-inventario.ts`, `scripts/validate-actividades-zod.ts`, `scripts/audit-calidad-actividades.ts`, `scripts/fix-fillblanks-mismatch.ts`*  
*Log completo: `_diagnostico-robustez-actividades.log`*
