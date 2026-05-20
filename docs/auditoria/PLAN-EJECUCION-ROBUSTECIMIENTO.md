# Plan de Ejecución — Robustecimiento Pedagógico Bachillerato
## Fecha: 2026-05-20
## Basado en: Auditoría pedagógica de las 621 actividades (2026-05-20)

---

## Contexto y premisa

La auditoría completada el 2026-05-20 evaluó las 621 actividades de CEN Bachillerato en 8 dimensiones pedagógicas (escala 1-5, total 8-40). El score promedio global es **27.9/40** — nivel aceptable pero con brechas concretas y accionables.

**Distribución de base:**

| Bucket | N | % | Objetivo post-robustecimiento |
|--------|---|---|-------------------------------|
| CRÍTICA (8-19) | 29 | 4.7% | 0 CRÍTICAS |
| MEDIA (20-27) | 222 | 35.7% | < 15% MEDIAS |
| ACEPTABLE (28-34) | 318 | 51.2% | ≥ 60% ACEPTABLES |
| SÓLIDA (35-40) | 52 | 8.4% | ≥ 20% SÓLIDAS |
| **Score promedio** | | **27.9** | **≥ 32.0** |

**Regla de no regresión:** Ningún seed-activities existente se modifica sin pasar por npm test (175/175) + npm run lint (0 errores) + npm run pages:build.

---

## Trabajo total estimado

| Categoría | Actividades afectadas | Horas estimadas |
|-----------|----------------------|-----------------|
| Videos placeholder → reemplazo urgente | 37 | 6-8h |
| CRÍTICAS Sem 1 (todas IN-I, LC-I, PM-I) | 29 | 8-10h |
| Debates sin argumentos_guia | 21 | 5-6h |
| Fill_blanks insuficientes (<5 huecos) | 15 | 4-5h |
| Lecturas cortas (<200 palabras) Sem 1-2 | ~45 | 8-10h |
| D3 bajo en LC y IN (todas las entregas) | ~80 | 10-12h |
| Reflexiones homogéneas (D7 bajo) | ~60 | 6-8h |
| CNEYT-VI uplift | 24 | 6-7h |
| Autoevaluaciones insuficientes | ~18 | 3-4h |
| Quizzes solo de dato (D2=2) | ~40 | 8-10h |
| **TOTAL robustecimiento** | | **64-80h** |

**Implementación de laboratorios piloto (fase futura, no incluida aquí):**
Los 5 laboratorios piloto identificados en el mapa suman aproximadamente 62h adicionales.

---

## Sesiones propuestas

### Sesión 1: Decisión y acción sobre videos placeholder — 4-5h

**Problema:** 37 actividades de tipo `video_con_preguntas` tienen `url_video` con valor placeholder (`https://example.com/video-pendiente-cen` o similar). Sin el video real, estas actividades son completamente inutilizables en producción.

**Distribución por semestre:**
- Sem 2: ~12 videos (CD-II, CNEYT-II, IN-II, CS-II)
- Sem 3-4: 16 videos (documentado en auditoría Sem 3-4)
- Sem 5-6: 7 videos (CH-II, PM-V, CNEYT-V, CH-III)

**Opciones:**
- **Opción A (recomendada):** Reemplazar temporalmente con lecturas equivalentes que cubran el mismo contenido hasta que se produzcan los videos. Mantiene la progresión funcional.
- **Opción B:** Marcar `es_placeholder=true` en el campo contenido y mostrar al alumno "Video en producción — disponible pronto" con texto alternativo.
- **Opción C:** Producir los 37 videos (fuera del alcance de este plan).

**Entregables:**
- Decisión documentada en `docs/DECISIONES-ACTIVIDADES.md`
- Si Opción A: scripts de actualización para los 37 videos en seed-activities-*.ts correspondientes
- Commit: `fix(actividades): reemplazar video_con_preguntas placeholder con lecturas equivalentes`

**Comando de validación:**
```powershell
npm test && npm run lint && npm run pages:build
```

---

### Sesión 2: Eliminar las 29 actividades CRÍTICAS (Sem 1) — 6-8h

**Problema:** Las 29 actividades CRÍTICAS están concentradas en Sem 1, principalmente en IN-I y LC-I. Son el único caso de score < 20 en el corpus.

**Desglose por UAC:**
- **IN-I:** ~12 CRÍTICAS (lecturas con <100 palabras — algunas son listados de 4-5 frases, no lecturas auténticas)
- **LC-I:** ~8 CRÍTICAS (lecturas <150 palabras sin referencias mexicanas)
- **PM-I:** ~3 CRÍTICAS (lecturas introductorias sin contexto)
- **Otras Sem 1-2:** ~6 dispersas

**Acciones concretas:**
1. `IN-I-P01-A1` a `IN-I-P08-A1` (8 lecturas): expandir a mínimo 200 palabras con input comprensible en inglés. Usar contextos mexicanos (un café en la CDMX, una conversación en un mercado de Oaxaca). Score esperado: pasar de 17-19 a 26-30.
2. `LC-I-P01-A1`, `LC-I-P02-A1`, `LC-I-P03-A1`: sustituir o ampliar con textos de autores mexicanos (Rosario Castellanos, Juan Rulfo, Elena Poniatowska) con preguntas de comprensión que van más allá del dato.
3. Revisar quizzes asociados a estas lecturas para alinear las preguntas al nuevo texto.

**Archivo a modificar:** `scripts/seed-activities-ini.ts`, `scripts/seed-activities-lci.ts`, `scripts/seed-activities-pmi.ts`

**Commit:** `feat(actividades): robustecimiento crítico Sem 1 — IN-I lecturas y LC-I textos mexicanos`

**Validación:**
```powershell
npx tsx scripts/validate-actividades-zod.ts
npm test && npm run lint
```

---

### Sesión 3: Debates estructurados — argumentos_guia en todos — 4-5h

**Problema:** Los 21 debates_estructurados representan el tipo con el score más consistentemente bajo cuando les falta `argumentos_guia`. Con el campo: 36-38 pts. Sin el campo: 23-25 pts. Brecha de 12-15 puntos por campo ausente.

**Actividades afectadas (confirmadas en auditoría):**
- Sem 5-6: CH-II-P03-A3, CD-III-P01-A3, CH-III-P02-A3, CNEYT-VI-P06-A3, CNEYT-VI-P08-A3, PM-VI-P08-A3 (6 debates)
- Sem 3-4: IN-III, LC-III, CNEYT-III (verificar en sección Sem 3-4)
- Sem 1-2: CD-II, CNEYT-II, LC-II (verificar en sección Sem 1-2)

**Modelo de argumentos_guia completo** (extraído del mejor debate del corpus, CS-I):
```typescript
argumentos_guia: [
  {
    postura: "A favor",
    argumentos: [
      "Argumento 1 con dato institucional o autor real",
      "Argumento 2 con contexto mexicano específico",
      "Argumento 3 con evidencia empírica"
    ]
  },
  {
    postura: "En contra",
    argumentos: [
      "Argumento 1 con perspectiva alternativa",
      "Argumento 2 con limitaciones del enfoque opuesto",
      "Argumento 3 con caso concreto mexicano"
    ]
  }
]
```

**Commit:** `feat(actividades): debates estructurados — argumentos_guia completos en las 21 actividades`

---

### Sesión 4: Fill_blanks insuficientes y lecturas cortas Sem 1-2 — 5-6h

**Problema A — fill_blanks:** 15 actividades tienen <5 huecos (umbral mínimo). Resultado: D5=2, score promedio 22.

**Actividades confirmadas:**
- IN-III-P02-A2, IN-III-P06-A2, LC-III-P06-A2: 3-4 huecos, texto <80 palabras
- IN-IV-P01-A2: 3 huecos en texto de gramática superficial
- CH-I-P03-A2: 4 huecos

**Acción:** Expandir el `texto_con_huecos` a mínimo 120 palabras con 5-8 huecos sobre conceptos clave — no palabras funcionales sino términos disciplinares relevantes.

**Problema B — lecturas cortas Sem 1-2:** ~45 lecturas entre 150-200 palabras que están por debajo del umbral óptimo. Las de IN-I ya se abordan en Sesión 2. Esta sesión cubre las de PM-I, CS-I, CD-I.

**Acción:** Expandir a 220-350 palabras. Priorizar añadir: (a) un ejemplo mexicano concreto, (b) una pregunta de comprensión adicional de nivel análisis.

**Commit:** `feat(actividades): fill_blanks expandidos y lecturas Sem 1-2 a rango óptimo`

---

### Sesión 5: Contextualización mexicana en LC y IN — 5-6h

**Problema:** LC tiene 0-5% de referencias mexicanas en todos sus semestres. IN tiene 8-15%. Ambas están en el rango más bajo del corpus, mientras que CNEYT, CS, CH y PFH demuestran que la contextualización es compatible con cualquier disciplina.

**Estrategia por materia:**

**Lengua y Comunicación (LC-I, LC-II, LC-III):**
- Sustituir textos genéricos por fragmentos de autores mexicanos (dominio público o de elaboración propia inspirada): Sor Juana Inés de la Cruz, Juan Rulfo, Elena Poniatowska, Rosario Castellanos, Carlos Monsiváis
- Anclar los temas de argumentación y exposición oral a debates actuales mexicanos (agua, migración, bienestar estudiantil)
- Meta: pasar de 0-5% a ≥ 40% de refs mexicanas

**Inglés (IN-I a IN-V):**
- Sustituir nombres y escenarios anglosajones genéricos (John, Mary, New York) por contextos bilingüismo mexicano-inglés (Carlos en Puebla — que ya existe en IN-III-P07 como modelo)
- Usar diálogos en lugares reales: metro CDMX, mercado de Oaxaca, aeropuerto Benito Juárez
- Meta: pasar de 8-15% a ≥ 35% de refs mexicanas

**Commit:** `feat(actividades): contextualización mexicana en LC I-III e IN I-V`

---

### Sesión 6: CNEYT-VI uplift + reflexiones homogéneas — 5-6h

**Problema A — CNEYT-VI:** Es la UAC con el peor score de todo el corpus (25.3/40), representando una regresión significativa respecto a CNEYT-V (estimado ≥30). Lecturas de solo 204-224 palabras (CNEYT-V tiene 509-642 palabras), 19 de 24 actividades en MEDIA.

**Acción:** Expandir las 8 lecturas de CNEYT-VI a 400-500 palabras. Añadir datos de instituciones mexicanas en cada tema: CONABIO (biodiversidad), INMEGEN (genómica), CINVESTAV (biotecnología), CONACYT (financiamiento científico). Diferenciar prompts de reflexión entre progresiones.

**Problema B — reflexiones homogéneas (D7 bajo):** En LC-I, IN-I, PM-I y PM-II, los prompts de reflexión_escrita siguen el mismo patrón en todas las progresiones de la UAC ("elige un texto, identifica X, explica Y"), haciendo que D7=3 por defecto y D8=2-3.

**Acción:** Para cada UAC con prompts homogéneos, diferenciar al menos 50% de los prompts por tipo de output esperado:
- P01-P03: reflexión descriptiva ("¿qué observas?")
- P04-P06: reflexión analítica ("¿por qué ocurre?", "¿qué consecuencias tiene?")
- P07-P08: reflexión evaluativa/propositiva ("¿qué cambiarías?", "¿cómo aplicarías esto en tu contexto?")

**Commit:** `feat(actividades): CNEYT-VI uplift y diferenciación de reflexiones en LC/IN/PM Sem 1-2`

---

### Sesión 7: D4 andamiaje — campos opcionales infrautilizados — 4-5h

**Problema:** Múltiples tipos de actividad tienen campos opcionales definidos en el schema que mejorarían D4 y D8 pero raramente se usan.

**Campos a activar sistemáticamente:**

| Campo | Tipo de actividad | Impacto | Actividades afectadas (aprox.) |
|-------|-------------------|---------|-------------------------------|
| `retroalimentacion` en preguntas de quiz | quiz_multiple_opcion (sin retro) | D4 +1 | ~25 quizzes en Sem 1-2 |
| `pistas` en reflexiones | reflexion_escrita (<2 pistas) | D4 +1 | ~40 reflexiones en IN, LC |
| `actividad_post` en infografías | infografia | D4 +1 | ~12 infografías en PM-II, LC-II |
| `descripcion_accesible` en infografías | infografia | D4 +1 | ~10 infografías |
| `argumentos_guia` en debates | debate_estructurado | D4 +2 | ← ya cubierto en Sesión 3 |
| `reflexion_final_prompt` en autoevaluaciones | autoevaluacion | D4 +1 | ~18 autoevaluaciones |
| `nivel_dificultad` progresivo | fill_blanks | D4 +1, D7 +1 | ~15 fill_blanks |

**Commit:** `feat(actividades): campos opcionales D4 — retroalimentacion, pistas, actividad_post en tipos clave`

---

### Sesión 8: Elevación de quizzes D2=2 a análisis — 5-6h

**Problema:** ~40 quizzes (quiz_multiple_opcion + quiz_verdadero_falso) son exclusivamente preguntas de dato ("¿Qué es X?", "¿Cuándo fue Y?"). D2=2, D8=2. Con pequeños cambios de formulación se pueden llevar a análisis (D2=3-4) y elevar el score 4-6 puntos.

**Técnica:** Reemplazar al menos 2 de las 5 preguntas por preguntas de aplicación o análisis:
- ❌ "¿Cuál es la función del ribosoma?" → ✅ "¿Por qué una célula con daño en los ribosomas no puede producir proteínas de defensa? ¿Qué consecuencia tendría esto en la respuesta inmune?"
- ❌ "¿Qué es la ley de la inercia?" → ✅ "Un pasajero va de pie en el Metro CDMX cuando el tren frena bruscamente. ¿Hacia dónde se mueve el pasajero y por qué?"

**Alcance:** Enfocarse en las UACs con mayor concentración: IN-I (todos los quizzes), LC-I, PM-I (Sem 1), LC-II, IN-II (Sem 2).

**Commit:** `feat(actividades): quizzes elevados a análisis — D2 de 2 a 3-4 en LC/IN/PM Sem 1-2`

---

### Sesión 9 (opcional): Actividades MEDIA en Sem 3-6 — 5-6h

**Problema:** 133 actividades en MEDIA distribuidas en Sem 3-6 (86 en Sem 3-4, 47 en Sem 5-6). Dado que ya no hay CRÍTICAS en estos semestres, el objetivo es llevar la mayor cantidad posible a ACEPTABLE con mejoras puntuales.

**Estrategia:** Identificar las actividades con score 25-27 (las más cercanas al umbral de ACEPTABLE) y aplicar la mejora de menor esfuerzo:
- Si D3=2 y hay tema mexicano disponible: añadir 1-2 datos o referencias (D3+1)
- Si D4=2 y falta retroalimentación o pistas: añadir (D4+1)
- Suma de ambos: +2 puntos, suficiente para pasar 25→27 a 27→29 (ACEPTABLE)

**Enfoque prioritario:** IN-III (24.7 promedio, 88% en MEDIA) y IN-IV (26.8 promedio, 54% en MEDIA).

**Commit:** `feat(actividades): mejoras puntuales Sem 3-6 — IN-III e IN-IV de MEDIA a ACEPTABLE`

---

## Criterios de éxito por sesión

| Sesión | Criterio de éxito | Validación |
|--------|-------------------|------------|
| 1 | 0 videos con URL placeholder activos | `grep -r "example.com" scripts/seed-activities-*.ts` → 0 resultados |
| 2 | 0 actividades CRÍTICAS en IN-I y LC-I | Re-ejecutar `compute-audit-metrics.ts` → 0 en bucket CRÍTICA |
| 3 | Todos los debates tienen `argumentos_guia` con ≥2 argumentos por postura | Script de verificación |
| 4 | Todos los fill_blanks tienen ≥5 huecos | `compute-audit-metrics.ts` → fill_blanks 100% suficiente |
| 5 | LC ≥ 40% refs_mex, IN ≥ 35% refs_mex | `compute-audit-metrics.ts` → ver pct_refs_mex por UAC |
| 6 | CNEYT-VI lecturas ≥350 palabras, score promedio ≥29 | Re-auditoría de CNEYT-VI |
| 7 | D4 promedio en reflexion_escrita ≥ 3.5 | `compute-audit-metrics.ts` |
| 8 | ≥ 30% de quizzes con preguntas de análisis | Revisión manual de muestra |

**Criterio de éxito global (post todas las sesiones):**
```
Score promedio global ≥ 32.0/40
Bucket CRÍTICA = 0%
Bucket SÓLIDA ≥ 20%
Refs mexicanas globales ≥ 45%
```

---

## Riesgos y mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Ruptura de Zod en schema al añadir campos opcionales | Media | Alto | `npx tsx scripts/validate-actividades-zod.ts` antes de cada commit |
| Regresión de tests al modificar seed-activities | Media | Alto | `npm test` (175/175) obligatorio antes de cada commit |
| Conflictos de encoding en textos con acentos | Baja | Medio | Preferir UTF-8 y no usar comillas dobles dentro de strings TypeScript |
| Pérdida de alineación curricular al reescribir contenido | Baja | Alto | Verificar `progresion_titulo` antes de modificar cada actividad; mantener D1≥4 |
| Videos nunca producidos → Opción A genera contenido duplicado | Alta | Medio | Marcar claramente con `// VIDEO_PENDIENTE` en el seed y en el campo `descripcion_video` |

---

## Secuencia de sesiones recomendada

```
Sesión 1 (urgente)  → Videos placeholder        → 4-5h
Sesión 2            → 29 CRÍTICAS Sem 1          → 6-8h
Sesión 3            → Debates sin argumentos     → 4-5h
Sesión 4            → Fill_blanks + lecturas S1  → 5-6h
Sesión 5            → D3 en LC e IN              → 5-6h
Sesión 6            → CNEYT-VI + reflexiones     → 5-6h
Sesión 7            → D4 andamiaje global        → 4-5h
Sesión 8            → Quizzes D2 análisis        → 5-6h
Sesión 9 (opc.)     → MEDIA Sem 3-6              → 5-6h
─────────────────────────────────────────────────
TOTAL                                             44-58h
```

**Nota sobre laboratorios:** El mapa `docs/labs/MAPA-LABORATORIOS-BACHILLERATO.md` identifica 26 oportunidades de laboratorio interactivo (62h para los 5 pilotos). Esta fase es independiente del robustecimiento y puede ejecutarse en paralelo a partir de la Sesión 4, una vez que los problemas urgentes estén resueltos.

---

*Plan generado el 2026-05-20 a partir de la auditoría de 621 actividades.*
*Actualizar con fechas reales al inicio de cada sesión.*
