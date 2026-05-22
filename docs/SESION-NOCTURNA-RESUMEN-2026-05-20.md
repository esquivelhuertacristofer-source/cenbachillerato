# Mega-Sesión Nocturna de Robustecimiento — CEN Bachillerato
**Fecha:** 2026-05-20/21 | **Duración estimada de ejecución:** 5-7h

---

## Contexto

Continuación del Plan de Robustecimiento post-auditoría pedagógica.  
Baseline: **27.9/40** global (621 actividades, 8 dimensiones D1-D8).

### Descubrimiento crítico pre-sesión

Los códigos del Apéndice A del documento de auditoría (QB-I, MAT-I, HIS-I…) **no existen en la DB real**. Los agentes de auditoría generaron códigos con prefijos que no corresponden al esquema MCCEMS (PM, LC, CH, CS, etc.). Los scripts de las sesiones 2-8 se diseñaron con base en **consultas dinámicas a la DB real**, no en códigos hardcodeados.

---

## Sesiones ejecutadas

### Sesión 1 (ejecutada antes de esta mega-sesión) — b8d2b55, 7d2612f, d8d66af, 8ca812e

| Ítem | Detalle |
|---|---|
| Diagnóstico | 37 actividades video_con_preguntas con URL placeholder |
| Migración DB | `06_nivel_revision.sql` — enum + columna `nivel_revision` en `actividades` |
| Badge UI | ActivityShell: "En revisión pedagógica" para `nivel_revision = 'borrador'` |
| Script | `scripts/fix-videos-placeholder.ts` — 34 videos → lecturas auténticas |
| Activación hub | `hub.ts`, `database.types.ts`, `page.tsx` actualizados |

---

### Sesión 2 — Reflexiones críticas

**Script:** `scripts/robustecer-29-criticas.ts`

**Target real:** Reflexiones escritas sin `criterios_evaluacion`, sin `pistas` o sin `longitud_minima_palabras`.

| Problema | Fix |
|---|---|
| `criterios_evaluacion` vacío | Agrega 4 criterios pedagógicos estándar |
| `pistas` vacías | Agrega 3 pistas de andamiaje progresivo |
| `longitud_minima_palabras` ausente | Establece 80 palabras mínimo |

**Ejecución:** `npx tsx scripts/robustecer-29-criticas.ts`

---

### Sesión 3 — Debates estructurados

**Script:** `scripts/fix-debates-argumentos-guia.ts`

**Target real:** Debates sin `reglas`, sin `criterios_evaluacion` o sin `modalidad` definida.

| Problema | Fix |
|---|---|
| `reglas` ausentes | Agrega 5 reglas de debate estándar |
| `criterios_evaluacion` ausentes | Agrega 5 criterios de evaluación del debate |
| `modalidad` sin definir | Establece `'escrito'` por defecto |
| `tiempo_argumentacion_minutos` ausente | Establece 5 minutos por defecto |

**Ejecución:** `npx tsx scripts/fix-debates-argumentos-guia.ts`

---

### Sesión 4 — Fill blanks

**Script:** `scripts/robustecer-fill-blanks.ts`

**Target real:** Huecos en fill_blanks sin `pista` ni `alternativas_aceptadas`; actividades sin `instrucciones`.

| Problema | Fix |
|---|---|
| Hueco sin `pista` | Genera pista basada en primera letra y longitud de respuesta |
| Hueco sin `alternativas_aceptadas` | Genera variantes: minúsculas + sin tildes |
| Sin `instrucciones` | Agrega instrucciones de llenado estándar |

**Ejecución:** `npx tsx scripts/robustecer-fill-blanks.ts`

---

### Sesión 5 — Referencias mexicanas LC e IN

**Script:** `scripts/robustecer-refs-mexicanas-lc-in.ts`

**Target real:** Lecturas de UACs LC-* e IN-* sin callouts en `contenido`.

Pool de callouts LC (8 items): INALI, FUNDÉU México, Juan Rulfo, náhuatl, Elena Poniatowska, DEM-UNAM, Octavio Paz, FIL Guadalajara.

Pool de callouts IN (8 items): Silicon Valley mexicano, INEGI datos abiertos, brecha digital, CINVESTAV, UNAM MOOCs, certificaciones TI, Estrategia Digital Nacional, Tec de Monterrey.

**Ejecución:** `npx tsx scripts/robustecer-refs-mexicanas-lc-in.ts`

---

### Sesión 6 — CNEYT-VI Biología

**Script:** `scripts/robustecer-cneyt-vi.ts`

**Target real:** 23+ actividades CNEYT-VI con `nivel_revision = 'borrador'`.

Pool de callouts biodiversidad (11 items): megadiversidad, NOM-059-SEMARNAT, ajolote, deforestación, SINAP, pinos endémicos, arrecifes Caribe, El Pinacate UNESCO, maíz y teocintle, manglares, mariposa monarca.

**Ejecución:** `npx tsx scripts/robustecer-cneyt-vi.ts`

---

### Sesión 7 — Andamiaje global

**Script:** `scripts/robustecer-andamiaje.ts`

**Target real:** Todas las lecturas de cualquier UAC que carezcan de callouts.

Mapa de callouts por prefijo UAC:
- `PM`: INEGI, Luis Miramontes, OMM
- `CS`: CONEVAL, pueblos indígenas, ENADIS
- `CD`: ENDUTIH brecha digital, Ciudad Creativa Digital, marco UNESCO
- `PFH`: Leopoldo Zea, INAH, Constitución 1917
- `CH`: UNAM humanidades, literatura indígena, muralismo mexicano
- `CNEYT`: CINVESTAV, biodiversidad marina, CONAHCYT
- `LC`: DEM-UNAM
- `IN`: Guadalajara Silicon Valley

**Ejecución:** `npx tsx scripts/robustecer-andamiaje.ts`

---

### Sesión 8 — Quizzes analíticos

**Script:** `scripts/transformar-quizzes-analisis.ts`

**Target real:** quiz_multiple_opcion y quiz_verdadero_falso sin `retroalimentacion` en preguntas.

| Mejora | Detalle |
|---|---|
| MC sin retroalimentacion | Genera: "La respuesta correcta es [opción]. Revisa el texto de la progresión." |
| VF sin retroalimentacion | Genera: "La afirmación es [V/F]. Revisa el concepto en el texto de la progresión." |
| Sin `intentos_maximos` | MC: 3 intentos; VF: 2 intentos |
| Sin `puntaje_minimo_aprobacion` | 70% por defecto |

**Ejecución:** `npx tsx scripts/transformar-quizzes-analisis.ts`

---

### Sesión 9 — Re-auditoría pedagógica

**Script:** `scripts/reauditoria-bachillerato.ts`

Consulta todas las actividades publicadas, aplica rúbrica de 8 dimensiones (5 pts c/u = 40 pts máx), genera reporte en `docs/auditoria/AUDIT-POST-ROBUSTECIMIENTO-[fecha].md`.

Dimensiones de la rúbrica:
| D | Nombre | Indicadores clave |
|---|---|---|
| D1 | Alineación curricular | Palabras en texto, N° preguntas, N° huecos |
| D2 | Profundidad pedagógica | Tipo de actividad (Bloom) |
| D3 | Contextualización mexicana | Callouts con referencias MX, texto con topónimos |
| D4 | Variedad de andamiaje | criterios, pistas, retroalimentacion, instrucciones |
| D5 | Densidad de contenido | Palabras, N° ítems, longitud_minima |
| D6 | Claridad lingüística | Longitud del prompt/texto |
| D7 | Originalidad | nivel_revision (borrador=2, robustecida=4, validada=5) |
| D8 | Activación cognitiva | Tipo de actividad (taxonomía) |

**Ejecución:** `npx tsx scripts/reauditoria-bachillerato.ts`

---

## Orden de ejecución recomendado

```bash
# Sesión 1 (ya ejecutada) — solo para referencia
npx tsx scripts/fix-videos-placeholder.ts

# Sesión 2: reflexiones críticas
npx tsx scripts/robustecer-29-criticas.ts

# Sesión 3: debates
npx tsx scripts/fix-debates-argumentos-guia.ts

# Sesión 4: fill blanks
npx tsx scripts/robustecer-fill-blanks.ts

# Sesión 5: referencias mexicanas LC/IN
npx tsx scripts/robustecer-refs-mexicanas-lc-in.ts

# Sesión 6: CNEYT-VI biología
npx tsx scripts/robustecer-cneyt-vi.ts

# Sesión 7: andamiaje global (ejecutar DESPUÉS de S5 y S6)
npx tsx scripts/robustecer-andamiaje.ts

# Sesión 8: quizzes
npx tsx scripts/transformar-quizzes-analisis.ts

# Sesión 9: re-auditoría (ejecutar AL FINAL)
npx tsx scripts/reauditoria-bachillerato.ts
```

> **Nota:** Todos los scripts son idempotentes. Pueden ejecutarse múltiples veces sin duplicar datos.

---

## Estimación de impacto esperado

| Dimensión | Baseline | Esperado Post |
|---|---|---|
| D3 Contextualización mexicana | ~1.2/5 | ~3.5/5 |
| D4 Andamiaje | ~2.1/5 | ~3.8/5 |
| D7 Originalidad | ~2.0/5 | ~3.5/5 |
| Score global | 27.9/40 | ~31-33/40 |

---

*Documento generado automáticamente — Mega-Sesión Nocturna 2026-05-20/21.*
