# Reporte Ejecutivo: Extracción y Comparación MCCEMS 2025 vs. DB CEN

**Fecha:** 2026-05-17
**Generado por:** Sesión de extracción y auditoría (Fases 1–7)
**Alcance:** Solo lectura — NO se modificó código ni base de datos
**Supabase ID:** `xmcfuwdanlciqdxqtslv`

---

## 1. Resumen ejecutivo

Se extrajeron y estructuraron **11 documentos únicos** del Modelo Educativo 2025 del MCCEMS (12 PDFs originales, dos idénticos). Se detectaron **6 discrepancias** entre el contenido oficial y la base de datos de CEN, siendo la más crítica que **todo el contenido de progresiones es placeholder** y la estructura de Lengua y Comunicación está sobredimensionada en 3 semestres adicionales que no existen en el plan oficial.

---

## 2. Inventario de PDFs procesados

### 2.1 Clasificación

| Categoría | N.º archivos únicos | Archivos en `public/` |
|-----------|--------------------|-----------------------|
| A — Framework MCCEMS | 1 | `2025_1_BN_MODELO EDUCATIVO 2025 MCCMS.pdf` (+ copia idéntica `2025_2_BN...`) |
| B — Currículum Fundamental (8 áreas) | 8 | Ver tabla 2.2 |
| C — Currículum Ampliado (2 documentos) | 2 | PAEC + Formación Socioemocional |
| **Total** | **11 únicos** | **12 archivos (2 idénticos: MD5 `170fb1375e692235aed5421b9d9375d2`)** |

### 2.2 Documentos Currículum Fundamental extraídos

| N.º | Área | PDF fuente | Archivo generado |
|-----|------|-----------|-----------------|
| 01 | Conciencia Histórica | `2025_ MCC_CONCIENCIA HISTORICA_BN.pdf` | `01-CONCIENCIA-HISTORICA.md` |
| 02 | Cultura Digital | `2025_ MCC_CULTURA DIGITAL_BN.pdf` | `02-CULTURA-DIGITAL.md` |
| 03 | Ciencias Naturales, Exp. y Tecnología | `2025_MCC_CIENCIAS NATURALES_BN.pdf` | `03-CIENCIAS-NATURALES.md` |
| 04 | Pensamiento Filosófico y Humanidades | `2025_MCC_PENSAMIENTO FILOSOFICO_BN.pdf` | `04-PENSAMIENTO-FILOSOFICO.md` |
| 05 | Pensamiento Matemático | `2025_MCC_PENSAMIENTO MATEMATICO_BN.pdf` | `05-PENSAMIENTO-MATEMATICO.md` |
| 06 | Ciencias Sociales | `vf_MCC_CIENCIAS SOCIALES_BN.pdf` | `06-CIENCIAS-SOCIALES.md` |
| 07 | Inglés | `vf_MCC_INGLES_BN.pdf` | `07-INGLES.md` |
| 08 | Lengua y Comunicación | `vf_MCC_LENGUA Y COMUNICACION_BN.pdf` | `08-LENGUA-COMUNICACION.md` |

### 2.3 Documentos Currículum Ampliado extraídos

| N.º | Eje de formación | Archivo generado |
|-----|-----------------|-----------------|
| 09 | PAEC (transversal) | `09-PAEC.md` |
| 10 | Formación Socioemocional (5 ámbitos) | `10-FORMACION-SOCIOEMOCIONAL.md` |

---

## 3. Estructura curricular oficial MCCEMS 2025

### 3.1 Malla del Currículum Fundamental

| Semestre | 1 | 2 | 3 | 4 | 5 | 6 |
|----------|---|---|---|---|---|---|
| **Lengua y Comunicación** | LyC-I | LyC-II | LyC-III | — | — | — |
| **Pensamiento Matemático** | PM-I | PM-II | PM-III | PM-IV | PM-V | PM-VI |
| **Conciencia Histórica** | — | — | — | CH-I | CH-II | CH-III |
| **Cultura Digital** | CD-I | CD-II | — | — | — | CD-III |
| **Inglés** | Ing-I | Ing-II | Ing-III | Ing-IV | Ing-V | — |
| **Ciencias Sociales** | CS-I | CS-II | — | CS-III | — | — |
| **Pens. Filosófico y Humanidades** | PFH-I | PFH-II | PFH-III | — | — | — |
| **Ciencias Nat., Exp. y Tecnología** | CNEyT-I | CNEyT-II | CNEyT-III | CNEyT-IV | CNEyT-V | CNEyT-VI |

> **Total: 34 asignaturas** (8 áreas × variable semestres)

### 3.2 Conteo de propósitos formativos oficiales

| Área | Sem | Propósitos | Total |
|------|-----|------------|-------|
| Lengua y Comunicación | 1,2,3 | 8+8+7 | **23** |
| Pensamiento Matemático | 1-6 | 7+6+6+7+8+8 | **42** |
| Conciencia Histórica | 4,5,6 | 4+4+4 | **12** |
| Cultura Digital | 1,2,6 | 8+5+4 | **17** |
| Inglés | 1-5 | 8+8+8+8+8 | **40** |
| Ciencias Sociales | 1,2,4 | 4+4+3 | **11** |
| Pens. Filosófico y Humanidades | 1,2,3 | 5+5+4 | **14** |
| Ciencias Nat., Exp. y Tecnología | 1-6 | 8+8+8+8+8+8 | **48** |
| **CF Total** | | | **207** |
| Formación Socioemocional (5 ámbitos) | transversal | 5+4+5+5+4 | **23** |
| PAEC | transversal | 4 | **4** |
| **Total oficial** | | | **234** |

### 3.3 Cambio terminológico clave (Modelo 2025 vs. anterior)

| Término anterior (Acuerdo 09/08/23) | Término Modelo 2025 | Impacto en DB |
|-------------------------------------|---------------------|--------------|
| UAC (Unidad de Aprendizaje Curricular) | Asignatura | La tabla `public.uac` usa terminología obsoleta |
| Progresión de aprendizaje | Propósito formativo | La tabla `public.progresiones` usa terminología obsoleta |

---

## 4. Estado de la base de datos (lectura de migraciones y seeds)

### 4.1 Estructura actual en DB (post-migración 02)

| Tabla | Registros estimados | Estado |
|-------|--------------------|----|
| `uac` | 34 | Post-migración 02: estructura revisada |
| `progresiones` | 342 | `es_placeholder=true` en **TODOS** |
| `componentes_curriculares` | 4 (CF, CFE, CA, CL) | Correcto |
| `recursos_sociocognitivos` | 8 (5 originales + 3 en m02) | Actualizado |
| `areas_conocimiento` | 3 (CS, CNT, HUM) | Presente pero redundante con RSC |
| `recursos_socioemocionales` | 4 ámbitos | Actualizado en m02 |

### 4.2 UAC en DB (34 total)

| Código | Nombre en DB | Sem | Correcto según oficial |
|--------|-------------|-----|----------------------|
| LC-I | Lengua y Comunicación I | 1 | ✓ |
| LC-II | Lengua y Comunicación II | 2 | ✓ |
| LC-III | Lengua y Comunicación III | 3 | ✓ |
| **LC-IV** | **Lengua y Comunicación IV** | **4** | **✗ NO EXISTE en MCCEMS 2025** |
| **LC-V** | **Lengua y Comunicación V** | **5** | **✗ NO EXISTE en MCCEMS 2025** |
| **LC-VI** | **Lengua y Comunicación VI** | **6** | **✗ NO EXISTE en MCCEMS 2025** |
| PM-I … PM-VI | Pensamiento Matemático I-VI | 1-6 | ✓ |
| CH-I | Conciencia Histórica I | 4 | ✓ (corregido m02) |
| CH-II | Conciencia Histórica II | 5 | ✓ (corregido m02) |
| CH-III | Conciencia Histórica III | 6 | ✓ (corregido m02) |
| CD-I | Cultura Digital I | 1 | ✓ |
| CD-II | Cultura Digital II | 2 | ✓ |
| CD-III | Cultura Digital III | 6 | ✓ (agregado m02) |
| IN-I … IN-IV | Inglés I-IV | 1-4 | ✓ |
| **IN-V** | **Inglés V** | **5** | **✗ FALTA en DB** |
| CS-I | Ciencias Sociales I | 1 | ✓ (corregido m02) |
| CS-II | Ciencias Sociales II | 2 | ✓ (corregido m02) |
| CS-III | Ciencias Sociales III | 4 | ✓ (corregido m02) |
| HUM-I | Humanidades I | 1 | ⚠ Semestre correcto, **nombre incorrecto** |
| HUM-II | Humanidades II | 2 | ⚠ Semestre correcto, **nombre incorrecto** |
| HUM-III | Humanidades III | 3 | ⚠ Semestre correcto, **nombre incorrecto** |
| CNEYT-I | La materia y sus interacciones | 1 | ⚠ Semestre correcto, **título temático no oficial** |
| CNEYT-II | Conservación de la energía | 2 | ⚠ Semestre correcto, **título temático no oficial** |
| CNEYT-III | Ecosistemas, interacciones y energía | 3 | ⚠ Semestre correcto, **título temático no oficial** |
| CNEYT-IV | Reacciones químicas | 4 | ⚠ Semestre correcto, **título temático no oficial** |
| CNEYT-V | La energía en procesos de vida diaria | 5 | ⚠ Semestre correcto, **título temático no oficial** |
| CNEYT-VI | Organismos y evolución biológica | 6 | ⚠ Semestre correcto, **título temático no oficial** |

---

## 5. Discrepancias detectadas

### CRÍTICA — D-001: Lengua y Comunicación sobredimensionada

| Campo | DB | MCCEMS 2025 Oficial |
|-------|----|--------------------|
| Número de asignaturas | 6 (LC-I a LC-VI) | 3 (LyC I, II, III) |
| Semestres cubiertos | 1, 2, 3, 4, 5, 6 | 1, 2, 3 |
| Progresiones generadas | ~60 (10/UAC × 6) | 23 propósitos reales |

**Impacto:** LC-IV, LC-V, LC-VI son UAC ficticias que no corresponden a ningún programa oficial. Los 30 progresiones asociadas son completamente inventadas.

**Corrección necesaria:** Eliminar LC-IV, LC-V, LC-VI y sus progresiones. Reemplazar el contenido de LC-I, LC-II, LC-III con los 8, 8 y 7 propósitos formativos reales del MCCEMS 2025.

---

### IMPORTANTE — D-002: Falta Inglés V

| Campo | DB | MCCEMS 2025 Oficial |
|-------|----|--------------------|
| Número de asignaturas | 4 (IN-I a IN-IV) | 5 (Inglés I a V) |
| Semestres cubiertos | 1, 2, 3, 4 | 1, 2, 3, 4, 5 |
| Inglés V (5h/semana) | Ausente | Presente (nivel A2+/B1) |

**Impacto:** Los estudiantes de 5.° semestre no tienen asignada la UAC de Inglés en la plataforma.

**Corrección necesaria:** Crear IN-V para semestre 5 con 8 propósitos formativos (nivel A2+/B1, "We are the champions").

---

### IMPORTANTE — D-003: Nombre incorrecto de Humanidades

| Campo | DB | MCCEMS 2025 Oficial |
|-------|----|--------------------|
| Nombre en DB | "Humanidades I/II/III" | "Pensamiento Filosófico y Humanidades I/II/III" |
| Código en DB | HUM-I, HUM-II, HUM-III | PFH-I, PFH-II, PFH-III (oficial) |
| Semestres | 1, 2, 3 | 1, 2, 3 |

**Impacto:** El nombre incompleto puede generar confusión en la interfaz de usuario y en reportes. El área curricular tiene un énfasis en filosofía que el nombre "Humanidades" no captura.

**Corrección necesaria:** Actualizar `nombre` en los 3 registros a "Pensamiento Filosófico y Humanidades I/II/III". Evaluar si renombrar también el código a PFH-*.

---

### MODERADA — D-004: Títulos temáticos de CNEYT no son oficiales

| Campo | DB | MCCEMS 2025 Oficial |
|-------|----|--------------------|
| CNEYT-I nombre | "La materia y sus interacciones" | Sin título temático oficial — se llama simplemente "Ciencias Naturales, Experimentales y Tecnología I" |
| CNEYT-V nombre | "La energía en procesos de vida diaria" | CNEyT V (cubre mecánica, ondas, EM — no solo energía cotidiana) |

**Impacto:** Los títulos temáticos no son incorrectos pedagógicamente, pero no coinciden con la nomenclatura oficial de SEP. Pueden causar inconsistencias en documentación o al mostrar la malla curricular a usuarios.

**Corrección sugerida:** Usar nombres genéricos como "Ciencias Naturales, Experimentales y Tecnología I-VI" o confirmar con área pedagógica si los títulos temáticos son una decisión interna de CEN.

---

### INFORMATIVA — D-005: Todo el contenido de progresiones es placeholder

| Campo | Estado |
|-------|--------|
| `es_placeholder` | `true` en las **342** progresiones de la DB |
| Alineación con MCCEMS 2025 | Los contenidos de los seeds (e.g., `seed-lci.ts`) son elaborados pero NO corresponden a los propósitos formativos oficiales |
| Ejemplo — LC-I oficial | 8 propósitos: "Reflexiona sobre los vínculos entre escritura y lectura...", "Investiga los gustos de su comunidad...", etc. |
| Ejemplo — LC-I en DB | 10 progresiones: "La comunicación humana y sus dimensiones", "Lenguaje, lengua, habla y dialecto"... (temáticas distintas) |
| N.º propósitos LC-I | **8 oficiales** vs. **10 en DB** |

**Impacto:** El contenido pedagógico actual NO puede usarse como referencia curricular oficial. Está marcado correctamente como `es_placeholder=true`, lo que es una buena práctica.

**Acción necesaria:** Poblar las progresiones con los propósitos formativos exactos del MCCEMS 2025 (extraídos en este proceso). Los archivos `01-CONCIENCIA-HISTORICA.md` a `08-LENGUA-COMUNICACION.md` contienen los propósitos reales listos para usar.

---

### INFORMATIVA — D-006: Terminología obsoleta en esquema DB

| Concepto | Término en DB | Término MCCEMS 2025 |
|----------|--------------|---------------------|
| Asignatura | UAC (tabla `uac`) | Asignatura |
| Propósito formativo | Progresión (tabla `progresiones`) | Propósito formativo |

**Impacto:** No es un error funcional, pero puede generar confusión en la UI y en la comunicación con usuarios y docentes familiarizados con el nuevo modelo. El cambio de nomenclatura fue oficial con el Modelo 2025.

**Sugerencia:** Actualizar etiquetas de UI y documentación. La tabla puede mantener el nombre técnico pero la interfaz debería mostrar "asignatura" y "propósito formativo".

---

## 6. Comparativo cuantitativo: propósitos oficiales vs. progresiones en DB

| Área | Propósitos reales | Progresiones en DB | UAC en DB | Diferencia |
|------|-------------------|-------------------|-----------|------------|
| Lengua y Comunicación | 23 | ~60 (6 UAC × 10) | 6 (3 extra) | **+37** ficticios |
| Pensamiento Matemático | 42 | ~60 (6 UAC × 10) | 6 | **+18** extra |
| Conciencia Histórica | 12 | 30 (3 UAC × 10) | 3 | **+18** extra |
| Cultura Digital | 17 | 24 (3 UAC × 8) | 3 | **+7** extra |
| Inglés | 40 | 48 (4 UAC × 12) | 4 (falta 1) | -8 en V, +20 extra en I-IV |
| Ciencias Sociales | 11 | 30 (3 UAC × 10) | 3 | **+19** extra |
| Pens. Filosófico y Hum. | 14 | 30 (3 UAC × 10) | 3 | **+16** extra |
| Ciencias Nat., Exp. y Tec. | 48 | 60 (6 UAC × 10) | 6 | **+12** extra |
| **Total CF** | **207** | **342** | **34** | **+135 placeholders** |

> La DB tiene **135 progresiones adicionales** respecto a los propósitos oficiales (y todas son placeholder). Esto se debe a que el seed usó 10 progresiones uniformes por UAC en lugar de seguir el conteo real por asignatura.

---

## 7. Estado de Currículum Ampliado en DB

| Componente | Estado en DB | Estado oficial |
|------------|-------------|----------------|
| PAEC | No existe como UAC (correcto) | Eje transversal sin asignatura |
| Formación Socioemocional — ámbitos | En `recursos_socioemocionales` (4 códigos: AFD, AAC, IESG, ESP) | 5 ámbitos con 23 propósitos |
| FS como UAC con progresiones | No existe | No debería existir como UAC tradicional |

**Nota:** El Currículum Ampliado no debe modelarse como UAC en la tabla `uac`. Los ámbitos de Formación Socioemocional en `recursos_socioemocionales` son una representación válida para catalogar el componente. Sin embargo, si se desea trackear progresión del estudiantado en FS, se necesitará una estrategia diferente.

---

## 8. Archivos generados en esta sesión

```
docs/programas-oficiales/extraidos/
├── 00-MODELO-EDUCATIVO-2025.md       (1364 líneas — framework completo)
├── 01-CONCIENCIA-HISTORICA.md        (CH I-III, sems 4-6, 12 propósitos)
├── 02-CULTURA-DIGITAL.md             (CD I-III, sems 1,2,6, 17 propósitos)
├── 03-CIENCIAS-NATURALES.md          (CNEyT I-VI, sems 1-6, 48 propósitos)
├── 04-PENSAMIENTO-FILOSOFICO.md      (PFH I-III, sems 1-3, 14 propósitos)
├── 05-PENSAMIENTO-MATEMATICO.md      (PM I-VI, sems 1-6, 42 propósitos)
├── 06-CIENCIAS-SOCIALES.md           (CS I-III, sems 1,2,4, 11 propósitos)
├── 07-INGLES.md                      (Ing I-V, sems 1-5, 40 propósitos)
├── 08-LENGUA-COMUNICACION.md         (LyC I-III, sems 1-3, 23 propósitos)
├── 09-PAEC.md                        (transversal, 4 propósitos de proceso)
├── 10-FORMACION-SOCIOEMOCIONAL.md    (5 ámbitos, 23 propósitos)
└── REPORTE-EJECUTIVO.md              (este archivo)
```

**Total propósitos oficiales documentados:** 234 (207 CF + 23 FS + 4 PAEC)

---

## 9. Acciones recomendadas (prioridad)

| Prioridad | Acción | Discrepancia |
|-----------|--------|-------------|
| 🔴 CRÍTICA | Eliminar UAC LC-IV, LC-V, LC-VI y sus 30 progresiones placeholder | D-001 |
| 🔴 CRÍTICA | Poblar las progresiones de LC-I, II, III con los 8, 8 y 7 propósitos reales | D-005 |
| 🟠 ALTA | Crear UAC IN-V (Inglés V, semestre 5, 5h/semana) con 8 propósitos | D-002 |
| 🟠 ALTA | Poblar propósitos reales para todas las demás áreas (207 - 23 ya listos) | D-005 |
| 🟡 MEDIA | Renombrar HUM-I/II/III a "Pensamiento Filosófico y Humanidades I/II/III" | D-003 |
| 🟡 MEDIA | Confirmar si los títulos temáticos de CNEYT son decisión interna o se alinean a lo oficial | D-004 |
| 🟢 BAJA | Actualizar etiquetas de UI: "UAC" → "Asignatura", "Progresión" → "Propósito formativo" | D-006 |

---

## 10. Notas metodológicas

- **Herramienta de extracción:** `pdftotext` (poppler, mingw64 `/mingw64/bin/pdftotext`)
- **Fuente:** PDFs oficiales en `public/` del repositorio CEN
- **Restricciones aplicadas:** Solo lectura — no se modificó código ni DB en ningún momento
- **Hallazgo extra:** Los 2 archivos PDF con nombre diferente (`2025_1_BN_...` y `2025_2_BN_...`) son bytes idénticos (MD5 `170fb1375e692235aed5421b9d9375d2`). Solo uno se procesó.
- **Progresiones de la DB:** Inferidas a partir del análisis de migraciones SQL (`01_schema_inicial.sql`, `02_realinear_mccems_oficial.sql`) y scripts de seed TypeScript (`scripts/seed-lci.ts` como muestra representativa).
