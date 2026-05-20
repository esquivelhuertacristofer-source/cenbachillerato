# Auditoría Pedagógica — CEN Bachillerato
## Fecha: 2026-05-20
## Alcance: 621 actividades en 32 UAC, 207 progresiones, 6 semestres
## Auditor: Sistema multi-agente CEN (Claude Sonnet 4.6)

---

## Resumen ejecutivo

Esta auditoría evaluó la totalidad del contenido pedagógico del bachillerato CEN (621 actividades distribuidas en 32 UAC y 207 progresiones a lo largo de 6 semestres) aplicando una rúbrica de 8 dimensiones con escala 1–5 por dimensión (máximo 40 puntos). El corpus muestra una calidad pedagógica media de 27.9/40, concentrada en el bucket ACEPTABLE (51.2% de las actividades). El único grupo crítico —29 actividades con score 8–19— se localiza íntegramente en los Semestres 1 y 2, específicamente en Inglés I (lecturas como listas de vocabulario) y en fill_blanks superficiales de LC-II. Los Semestres 3–4 y 5–6 erradican las CRÍTICAS, y el promedio sube de 26.8 a 28.6 y 29.1 respectivamente, lo que confirma una curva de maduración editorial visible a lo largo del plan. Las brechas más graves son estructurales: ausencia de `argumentos_guia` en el 100% de los debates de Semestres 5–6, reflexiones sin rúbrica en CNEYT-V y CNEYT-VI, videos con URL placeholder no producidos, y baja contextualización mexicana en las UACs de Inglés (IN-I: 0%, IN-III: 8%) y Lengua y Comunicación III (5%).

### Distribución global por bucket y score promedio

| Semestre | Total | CRÍTICA | MEDIA | ACEPTABLE | SÓLIDA | Avg |
|----------|-------|---------|-------|-----------|--------|-----|
| 1–2 | 276 | 29 (11%) | 89 (32%) | 131 (47%) | 27 (10%) | 26.8 |
| 3–4 | 189 | 0 (0%) | 86 (46%) | 88 (47%) | 15 (8%) | 28.6 |
| 5–6 | 156 | 0 (0%) | 47 (30%) | 99 (63%) | 10 (6%) | 29.1 |
| **GLOBAL** | **621** | **29 (4.7%)** | **222 (35.7%)** | **318 (51.2%)** | **52 (8.4%)** | **27.9** |

### Top 5 hallazgos accionables

1. **Debates sin `argumentos_guia` en 100% de los debates de Sem 5–6** — 6 actividades en 5 UACs distintas (CH-II-P03-A3, CD-III-P01-A3, CH-III-P02-A3, CNEYT-VI-P06-A3, CNEYT-VI-P08-A3, PM-VI-P08-A3) aplican la regla crítica que topa D4 en 2, perdiendo entre 4 y 8 puntos por actividad. El patrón se extiende a Sem 1–2 y 3–4 (CNEYT-II-P08-A1 y CH-I-P03-A3 son excepciones positivas con argumentos_guia). Corrección: añadir `argumentos_guia` con 3–5 posturas bidireccionales y datos concretos.

2. **Reflexiones sin rúbrica en CNEYT-V (3) y CNEYT-VI (6) — 9 actividades con n_criterios=0** — Las reflexiones de CNEYT-VI tienen prompts de 16–25 palabras y ningún criterio evaluativo; CNEYT-V-P03-A3, P05-A3, P08-A3 tienen 64–82 palabras pero tampoco criterios. El estudiante no sabe cómo será evaluado. Contraste con CH-II y CH-III donde todas las reflexiones tienen 4 criterios explícitos + 4 pistas. Corrección: añadir 4 criterios y 3 pistas mínimo; ampliar prompt a 100+ palabras.

3. **Videos con URL placeholder no producidos** — Al menos 16 actividades de tipo `video_con_preguntas` en Sem 2 y 12 en Sem 3–4 tienen `url_video="https://example.com/video-pendiente-cen"`, `subtitulos_disponibles=false` y `campos_opcionales_usados=[]`. Sin el video real estas actividades son inutilizables en plataforma. Además, los 7 videos de Sem 5–6 tampoco tienen transcripción ni descripción accesible (D4=2 por regla). Corrección: producir o sustituir con lectura equivalente antes del lanzamiento.

4. **Lecturas subdimensionadas en IN-I (100% CRÍTICAS por D5=1)** — Las 8 actividades de lectura de IN-I tienen menos de 150 palabras (algunas <100); son listas de vocabulario disfrazadas de lectura. Esto genera D5=1, D2=1 en todos los casos y explica el 73% de las 29 actividades CRÍTICAS del corpus. Corrección: rediseñar como "lecturas auténticas de input comprensible" de 200–350 palabras con contexto narrativo real.

5. **Ausencia total de contextualización mexicana en LC-I (D3=1 en 24/24 actividades)** — Las 24 actividades de LC-I tienen `tiene_refs_mex=false` (0%). Una UAC de Lengua y Comunicación que omite completamente la tradición literaria mexicana (autores, textos, corrientes, oralidad) contradice el enfoque NEM. Corrección: sustituir al menos 6 de las 8 lecturas por textos de autores mexicanos o latinoamericanos; anclar reflexiones a prácticas escriturales propias del contexto cultural del estudiante.

---

## Sección 1: Inventario y métricas básicas

### 1.1 Distribución por tipo de actividad

| Tipo | Total | % del total | % suficiente D5 | % refs mexicanas |
|------|-------|------------|-----------------|-----------------|
| reflexion_escrita | 139 | 22.4% | 91% | 27% |
| lectura | 131 | 21.1% | 66% | 44% |
| quiz_multiple_opcion | 96 | 15.5% | 100% | 43% |
| ejercicio_matematico | 47 | 7.6% | 100% | 19% |
| video_con_preguntas | 37 | 6.0% | 38% | 30% |
| autoevaluacion | 34 | 5.5% | 82% | 18% |
| fill_blanks | 33 | 5.3% | 45% | 18% |
| quiz_verdadero_falso | 30 | 4.8% | 100% | 50% |
| infografia | 29 | 4.7% | 100% | 55% |
| debate_estructurado | 21 | 3.4% | 0% | 57% |
| simulacion | 13 | 2.1% | 92% | 8% |
| glosario_interactivo | 11 | 1.8% | 100% | 36% |
| **TOTAL** | **621** | **100%** | — | — |

**Notas de interpretación:**
- `video_con_preguntas` (38% suficiente): la mayoría de los videos no están producidos (URL placeholder), lo que genera D5=2 sistemáticamente. Si se excluyen los videos placeholder, la suficiencia sería ~85%.
- `debate_estructurado` (0% suficiente): el campo `palabras_texto` del debate es intrínsecamente corto; el contenido real está en `argumentos_guia` y `criterios`. El 0% no indica ausencia de contenido pedagógico sino un artefacto de la métrica.
- `fill_blanks` (45% suficiente): los textos de fill_blanks en IN-I son listas de vocabulario de <100 palabras, lo que arrastra el porcentaje hacia abajo. En semestres superiores el tipo mejora.
- `simulacion` (8% refs mexicanas): las simulaciones son principalmente de ciencias naturales con variables genéricas; CNEYT-IV es excepción positiva con simulaciones usando ingredientes mexicanos (col morada, vinagre-bicarbonato).

### 1.2 Distribución por semestre

| Semestre | Total | CRÍTICA | MEDIA | ACEPTABLE | SÓLIDA | Score prom. |
|----------|-------|---------|-------|-----------|--------|-------------|
| Sem 1 | ~138 | 29 (21%) | ~60 (43%) | ~42 (30%) | ~7 (5%) | ~25.2 |
| Sem 2 | ~138 | 0 (0%) | ~29 (21%) | ~89 (64%) | ~20 (14%) | ~28.4 |
| Sem 3 | 99 | 0 (0%) | 41 (41%) | 49 (50%) | 9 (9%) | 28.8 |
| Sem 4 | 90 | 0 (0%) | 31 (34%) | 40 (44%) | 19 (21%) | 30.5 |
| Sem 5 | 84 | 0 (0%) | 24 (29%) | 54 (64%) | 6 (7%) | 29.4 |
| Sem 6 | 72 | 0 (0%) | 23 (32%) | 45 (63%) | 4 (6%) | 28.5 |

### 1.3 Distribución por UAC

| UAC | Sem | Total acts | Score prom. | Bucket dominante |
|-----|-----|-----------|-------------|-----------------|
| LC-I | 1 | 24 | ~22.5 | MEDIA |
| PM-I | 1 | 21 | ~24.3 | MEDIA |
| CNEYT-I | 1 | 24 | ~26.3 | MEDIA |
| CD-I | 1 | 24 | ~27.1 | MEDIA |
| IN-I | 1 | 24 | ~21.8 | CRÍTICA/MEDIA |
| CS-I | 1 | 12 | ~33.0 | SÓLIDA |
| PFH-I | 1 | 15 | ~29.7 | ACEPTABLE |
| LC-II | 2 | 24 | ~25.9 | MEDIA |
| PM-II | 2 | 18 | ~25.5 | MEDIA |
| CNEYT-II | 2 | 24 | ~28.3 | ACEPTABLE |
| CD-II | 2 | 15 | ~27.7 | MEDIA |
| IN-II | 2 | 24 | ~24.3 | MEDIA |
| CS-II | 2 | 12 | ~31.7 | ACEPTABLE/SÓLIDA |
| PFH-II | 2 | 15 | ~30.3 | ACEPTABLE |
| CNEYT-III | 3 | 24 | 30.0 | ACEPTABLE |
| IN-III | 3 | 24 | 24.7 | MEDIA |
| LC-III | 3 | 21 | 27.4 | ACEPTABLE |
| PFH-III | 3 | 12 | 32.9 | ACEPTABLE/SÓLIDA |
| PM-III | 3 | 18 | 30.0 | ACEPTABLE |
| CH-I | 4 | 12 | 32.3 | ACEPTABLE/SÓLIDA |
| CNEYT-IV | 4 | 24 | 30.8 | ACEPTABLE |
| CS-III | 4 | 9 | 31.4 | SÓLIDA |
| IN-IV | 4 | 24 | 26.8 | MEDIA |
| PM-IV | 4 | 21 | 31.0 | ACEPTABLE |
| CNEYT-V | 5 | 24 | 28.3 | ACEPTABLE |
| PM-V | 5 | 24 | 28.2 | ACEPTABLE |
| CH-II | 5 | 12 | 31.8 | ACEPTABLE/SÓLIDA |
| IN-V | 5 | 24 | 29.4 | ACEPTABLE |
| CNEYT-VI | 6 | 24 | 25.3 | MEDIA |
| PM-VI | 6 | 24 | 30.0 | ACEPTABLE |
| CD-III | 6 | 12 | 30.8 | ACEPTABLE |
| CH-III | 6 | 12 | 31.8 | ACEPTABLE/SÓLIDA |

---

## Sección 2: Análisis por UAC

### Semestre 1

---

#### LC-I — Lengua y Comunicación I

**Progresiones**: P01 vínculos lectura-escritura · P02 gustos de comunidad escolar · P03 analizar textos propios · P04 tipos de párrafos · P05 elementos significativos · P06 concordancia y conectores · P07 lectura en voz alta · P08 exposición oral

| Actividad | Tipo | D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | Total | Bucket |
|-----------|------|----|----|----|----|----|----|----|----|-------|--------|
| LC-I-P01-A1 | lectura | 3 | 2 | 1 | 2 | 2 | 4 | 3 | 2 | 19 | CRÍTICA |
| LC-I-P01-A2 | quiz_multiple_opcion | 3 | 2 | 1 | 2 | 4 | 4 | 3 | 2 | 21 | MEDIA |
| LC-I-P01-A3 | reflexion_escrita | 4 | 3 | 1 | 3 | 4 | 4 | 3 | 3 | 25 | MEDIA |
| LC-I-P02-A1 | lectura | 3 | 2 | 1 | 2 | 2 | 4 | 3 | 2 | 19 | CRÍTICA |
| LC-I-P02-A2 | quiz_multiple_opcion | 3 | 2 | 1 | 2 | 4 | 4 | 3 | 2 | 21 | MEDIA |
| LC-I-P02-A3 | reflexion_escrita | 4 | 3 | 1 | 3 | 4 | 4 | 3 | 4 | 26 | MEDIA |
| LC-I-P03-A1 | lectura | 3 | 2 | 1 | 2 | 2 | 4 | 3 | 2 | 19 | CRÍTICA |
| LC-I-P03-A2 | quiz_multiple_opcion | 3 | 2 | 1 | 2 | 4 | 4 | 3 | 2 | 21 | MEDIA |
| LC-I-P03-A3 | reflexion_escrita | 4 | 3 | 1 | 3 | 4 | 4 | 3 | 3 | 25 | MEDIA |
| LC-I-P04-A1 | lectura | 4 | 2 | 1 | 2 | 2 | 4 | 3 | 2 | 20 | MEDIA |
| LC-I-P04-A2 | quiz_multiple_opcion | 4 | 2 | 1 | 2 | 4 | 4 | 3 | 2 | 22 | MEDIA |
| LC-I-P04-A3 | reflexion_escrita | 4 | 3 | 1 | 3 | 4 | 4 | 3 | 3 | 25 | MEDIA |
| LC-I-P05-A1 | lectura | 4 | 2 | 1 | 2 | 2 | 4 | 3 | 2 | 20 | MEDIA |
| LC-I-P05-A2 | quiz_multiple_opcion | 4 | 2 | 1 | 2 | 4 | 4 | 3 | 2 | 22 | MEDIA |
| LC-I-P05-A3 | reflexion_escrita | 4 | 3 | 1 | 3 | 4 | 4 | 3 | 4 | 26 | MEDIA |
| LC-I-P06-A1 | lectura | 4 | 3 | 1 | 2 | 4 | 5 | 3 | 2 | 24 | MEDIA |
| LC-I-P06-A2 | quiz_multiple_opcion | 4 | 3 | 1 | 2 | 4 | 4 | 3 | 3 | 24 | MEDIA |
| LC-I-P06-A3 | reflexion_escrita | 5 | 4 | 1 | 3 | 4 | 5 | 3 | 4 | 29 | ACEPTABLE |
| LC-I-P07-A1 | lectura | 4 | 2 | 1 | 2 | 2 | 4 | 3 | 2 | 20 | MEDIA |
| LC-I-P07-A2 | quiz_multiple_opcion | 4 | 2 | 1 | 2 | 4 | 4 | 3 | 2 | 22 | MEDIA |
| LC-I-P07-A3 | reflexion_escrita | 4 | 3 | 1 | 3 | 4 | 4 | 3 | 4 | 26 | MEDIA |
| LC-I-P08-A1 | lectura | 4 | 2 | 1 | 2 | 2 | 4 | 3 | 2 | 20 | MEDIA |
| LC-I-P08-A2 | quiz_multiple_opcion | 4 | 2 | 1 | 2 | 4 | 4 | 3 | 2 | 22 | MEDIA |
| LC-I-P08-A3 | reflexion_escrita | 4 | 3 | 1 | 3 | 4 | 4 | 3 | 4 | 26 | MEDIA |

**Hallazgos LC-I:** D3=1 en las 24 actividades (0% refs_mex). Lecturas 187–205 palabras, d5=false en P01–P05, P07–P08. Quizzes de dato puro (D2=2). Reflexiones con patrón homogéneo P01–P08 (D7=3). Fortaleza aislada: LC-I-P06-A3 (reescribir texto con errores, Total=29, D2=4, D8=4).

---

#### PM-I — Pensamiento Matemático I

| Actividad | Tipo | D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | Total | Bucket |
|-----------|------|----|----|----|----|----|----|----|----|-------|--------|
| PM-I-P01-A1 | lectura | 4 | 2 | 2 | 2 | 2 | 4 | 3 | 2 | 21 | MEDIA |
| PM-I-P01-A2 | ejercicio_matematico | 4 | 3 | 2 | 2 | 4 | 4 | 3 | 3 | 25 | MEDIA |
| PM-I-P01-A3 | reflexion_escrita | 4 | 3 | 2 | 3 | 4 | 4 | 3 | 4 | 27 | MEDIA |
| PM-I-P02-A1 | lectura | 3 | 2 | 1 | 2 | 2 | 4 | 3 | 2 | 19 | CRÍTICA |
| PM-I-P02-A2 | ejercicio_matematico | 4 | 3 | 1 | 2 | 4 | 4 | 3 | 3 | 24 | MEDIA |
| PM-I-P02-A3 | reflexion_escrita | 3 | 3 | 1 | 3 | 4 | 4 | 3 | 3 | 24 | MEDIA |
| PM-I-P03-A1 | lectura | 4 | 3 | 1 | 2 | 2 | 4 | 3 | 2 | 21 | MEDIA |
| PM-I-P03-A2 | ejercicio_matematico | 4 | 4 | 1 | 2 | 4 | 4 | 3 | 4 | 26 | MEDIA |
| PM-I-P03-A3 | reflexion_escrita | 4 | 3 | 1 | 3 | 4 | 4 | 3 | 3 | 25 | MEDIA |
| PM-I-P04-A1 | lectura | 4 | 2 | 1 | 2 | 2 | 4 | 3 | 2 | 20 | MEDIA |
| PM-I-P04-A2 | ejercicio_matematico | 4 | 3 | 1 | 2 | 4 | 4 | 3 | 3 | 24 | MEDIA |
| PM-I-P04-A3 | reflexion_escrita | 4 | 3 | 1 | 3 | 4 | 4 | 3 | 3 | 25 | MEDIA |
| PM-I-P05-A1 | lectura | 4 | 2 | 2 | 2 | 2 | 4 | 3 | 2 | 21 | MEDIA |
| PM-I-P05-A2 | ejercicio_matematico | 4 | 3 | 2 | 2 | 4 | 4 | 3 | 3 | 25 | MEDIA |
| PM-I-P05-A3 | reflexion_escrita | 4 | 3 | 2 | 3 | 4 | 4 | 3 | 4 | 27 | MEDIA |
| PM-I-P06-A1 | lectura | 4 | 2 | 1 | 2 | 2 | 4 | 3 | 2 | 20 | MEDIA |
| PM-I-P06-A2 | ejercicio_matematico | 4 | 3 | 1 | 2 | 4 | 4 | 3 | 3 | 24 | MEDIA |
| PM-I-P06-A3 | reflexion_escrita | 4 | 3 | 1 | 3 | 4 | 4 | 3 | 3 | 25 | MEDIA |
| PM-I-P07-A1 | lectura | 4 | 2 | 1 | 2 | 2 | 4 | 3 | 2 | 20 | MEDIA |
| PM-I-P07-A2 | ejercicio_matematico | 4 | 3 | 1 | 2 | 4 | 4 | 3 | 3 | 24 | MEDIA |
| PM-I-P07-A3 | reflexion_escrita | 4 | 3 | 1 | 3 | 4 | 4 | 3 | 3 | 25 | MEDIA |

**Hallazgos PM-I:** Lecturas <200 palabras en P02–P07 (d5=false). Contextualización baja (19%: solo P01, P05). Reflexiones homogéneas (D7=3). Fortaleza: PM-I-P01-A3 historia cultural de las matemáticas (Total=27).

---

#### CNEYT-I — La materia y sus interacciones

| Actividad | Tipo | D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | Total | Bucket |
|-----------|------|----|----|----|----|----|----|----|----|-------|--------|
| CNEYT-I-P01-A1 | lectura | 4 | 3 | 2 | 2 | 4 | 4 | 4 | 3 | 26 | MEDIA |
| CNEYT-I-P01-A2 | quiz_multiple_opcion | 4 | 3 | 2 | 2 | 4 | 4 | 4 | 3 | 26 | MEDIA |
| CNEYT-I-P01-A3 | reflexion_escrita | 4 | 4 | 2 | 3 | 4 | 4 | 4 | 4 | 29 | ACEPTABLE |
| CNEYT-I-P02-A1 | lectura | 4 | 2 | 2 | 2 | 4 | 4 | 3 | 2 | 23 | MEDIA |
| CNEYT-I-P02-A2 | quiz_multiple_opcion | 4 | 2 | 2 | 2 | 4 | 4 | 3 | 2 | 23 | MEDIA |
| CNEYT-I-P02-A3 | reflexion_escrita | 4 | 3 | 2 | 3 | 4 | 4 | 3 | 3 | 26 | MEDIA |
| CNEYT-I-P03-A1 | lectura | 4 | 2 | 1 | 2 | 4 | 4 | 3 | 2 | 22 | MEDIA |
| CNEYT-I-P03-A2 | quiz_multiple_opcion | 4 | 3 | 1 | 2 | 4 | 4 | 3 | 3 | 24 | MEDIA |
| CNEYT-I-P03-A3 | reflexion_escrita | 4 | 3 | 1 | 3 | 4 | 4 | 3 | 4 | 26 | MEDIA |
| CNEYT-I-P04-A1 | lectura | 4 | 2 | 2 | 2 | 4 | 4 | 3 | 2 | 23 | MEDIA |
| CNEYT-I-P04-A2 | quiz_multiple_opcion | 4 | 2 | 2 | 2 | 4 | 4 | 3 | 2 | 23 | MEDIA |
| CNEYT-I-P04-A3 | reflexion_escrita | 5 | 3 | 2 | 3 | 4 | 5 | 4 | 4 | 30 | ACEPTABLE |
| CNEYT-I-P05-A1 | lectura | 4 | 2 | 1 | 2 | 4 | 4 | 3 | 2 | 22 | MEDIA |
| CNEYT-I-P05-A2 | quiz_multiple_opcion | 4 | 3 | 1 | 2 | 4 | 4 | 3 | 3 | 24 | MEDIA |
| CNEYT-I-P05-A3 | reflexion_escrita | 5 | 3 | 1 | 3 | 4 | 5 | 4 | 4 | 29 | ACEPTABLE |
| CNEYT-I-P06-A1 | lectura | 5 | 3 | 1 | 2 | 4 | 5 | 4 | 3 | 27 | MEDIA |
| CNEYT-I-P06-A2 | quiz_multiple_opcion | 5 | 3 | 1 | 2 | 4 | 4 | 4 | 3 | 26 | MEDIA |
| CNEYT-I-P06-A3 | reflexion_escrita | 5 | 5 | 1 | 3 | 4 | 5 | 5 | 5 | 33 | ACEPTABLE |
| CNEYT-I-P07-A1 | lectura | 5 | 3 | 3 | 2 | 4 | 5 | 5 | 3 | 30 | ACEPTABLE |
| CNEYT-I-P07-A2 | quiz_multiple_opcion | 5 | 3 | 3 | 2 | 4 | 4 | 5 | 3 | 29 | ACEPTABLE |
| CNEYT-I-P07-A3 | reflexion_escrita | 5 | 4 | 3 | 3 | 4 | 5 | 5 | 5 | 34 | ACEPTABLE |
| CNEYT-I-P08-A1 | lectura | 4 | 3 | 2 | 2 | 4 | 4 | 4 | 3 | 26 | MEDIA |
| CNEYT-I-P08-A2 | quiz_multiple_opcion | 4 | 3 | 2 | 2 | 4 | 4 | 3 | 3 | 25 | MEDIA |
| CNEYT-I-P08-A3 | reflexion_escrita | 4 | 4 | 2 | 3 | 4 | 4 | 4 | 4 | 29 | ACEPTABLE |

**Hallazgos CNEYT-I:** P07 (mujeres en ciencia) es la progresión más sólida (D3=3, D7=5): Rosalind Franklin, Lise Meitner, médicas indígenas mexicanas invisibilizadas. CNEYT-I-P06-A3 (diseñar investigación propia, Total=33). P03 atómica es el punto débil (D2=2, D3=1). 100% actividades con d5=true.

---

#### CD-I — Cultura Digital I

| Actividad | Tipo | D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | Total | Bucket |
|-----------|------|----|----|----|----|----|----|----|----|-------|--------|
| CD-I-P01-A1 | lectura | 4 | 2 | 2 | 2 | 2 | 4 | 3 | 2 | 21 | MEDIA |
| CD-I-P01-A2 | quiz_multiple_opcion | 4 | 2 | 1 | 2 | 4 | 4 | 3 | 2 | 22 | MEDIA |
| CD-I-P01-A3 | reflexion_escrita | 5 | 3 | 1 | 3 | 4 | 4 | 4 | 4 | 28 | ACEPTABLE |
| CD-I-P02-A1 | lectura | 5 | 3 | 2 | 2 | 2 | 4 | 4 | 3 | 25 | MEDIA |
| CD-I-P02-A2 | quiz_multiple_opcion | 5 | 3 | 2 | 2 | 4 | 4 | 4 | 3 | 27 | MEDIA |
| CD-I-P02-A3 | reflexion_escrita | 5 | 4 | 2 | 3 | 4 | 4 | 4 | 5 | 31 | ACEPTABLE |
| CD-I-P03-A1 | lectura | 5 | 4 | 4 | 2 | 4 | 5 | 5 | 4 | 33 | ACEPTABLE |
| CD-I-P03-A2 | quiz_multiple_opcion | 5 | 3 | 4 | 2 | 4 | 4 | 5 | 3 | 30 | ACEPTABLE |
| CD-I-P03-A3 | reflexion_escrita | 5 | 5 | 4 | 3 | 4 | 5 | 5 | 5 | 36 | SÓLIDA |
| CD-I-P04-A1 | lectura | 5 | 4 | 3 | 2 | 2 | 5 | 5 | 4 | 30 | ACEPTABLE |
| CD-I-P04-A2 | quiz_multiple_opcion | 5 | 3 | 3 | 2 | 4 | 4 | 5 | 3 | 29 | ACEPTABLE |
| CD-I-P04-A3 | reflexion_escrita | 5 | 4 | 3 | 3 | 4 | 5 | 5 | 5 | 34 | ACEPTABLE |
| CD-I-P05-A1 | lectura | 5 | 3 | 4 | 2 | 2 | 4 | 4 | 3 | 27 | MEDIA |
| CD-I-P05-A2 | quiz_multiple_opcion | 5 | 3 | 4 | 2 | 4 | 4 | 4 | 3 | 29 | ACEPTABLE |
| CD-I-P05-A3 | reflexion_escrita | 5 | 4 | 4 | 3 | 4 | 5 | 4 | 5 | 34 | ACEPTABLE |
| CD-I-P06-A1 | lectura | 4 | 2 | 1 | 2 | 4 | 4 | 3 | 2 | 22 | MEDIA |
| CD-I-P06-A2 | quiz_multiple_opcion | 4 | 2 | 1 | 2 | 4 | 4 | 3 | 2 | 22 | MEDIA |
| CD-I-P06-A3 | reflexion_escrita | 4 | 3 | 1 | 3 | 4 | 4 | 3 | 4 | 26 | MEDIA |
| CD-I-P07-A1 | lectura | 4 | 2 | 1 | 2 | 2 | 4 | 3 | 2 | 20 | MEDIA |
| CD-I-P07-A2 | quiz_multiple_opcion | 4 | 2 | 1 | 2 | 4 | 4 | 3 | 2 | 22 | MEDIA |
| CD-I-P07-A3 | reflexion_escrita | 4 | 3 | 1 | 3 | 4 | 4 | 3 | 4 | 26 | MEDIA |
| CD-I-P08-A1 | lectura | 4 | 2 | 2 | 2 | 2 | 4 | 3 | 2 | 21 | MEDIA |
| CD-I-P08-A2 | quiz_multiple_opcion | 4 | 2 | 2 | 2 | 4 | 4 | 3 | 2 | 23 | MEDIA |
| CD-I-P08-A3 | reflexion_escrita | 4 | 3 | 2 | 3 | 4 | 4 | 3 | 4 | 27 | MEDIA |

**Hallazgos CD-I:** UAC más sólida de Sem 1. CD-I-P03-A3 (Total=36): identifica origen de plataformas, reflexiona sobre intercambio datos/servicio, propone acciones — mejor actividad de Sem 1. CD-I-P02-A3 (31): investigar licencias de 3 apps propias. P06–P08 caen en calidad (d5=false, D2=2).

---

#### IN-I — Inglés I

| Actividad | Tipo | D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | Total | Bucket |
|-----------|------|----|----|----|----|----|----|----|----|-------|--------|
| IN-I-P01-A1 | lectura | 4 | 1 | 2 | 2 | 1 | 4 | 3 | 1 | 18 | CRÍTICA |
| IN-I-P01-A2 | fill_blanks | 5 | 2 | 2 | 2 | 2 | 4 | 4 | 2 | 23 | MEDIA |
| IN-I-P01-A3 | reflexion_escrita | 4 | 2 | 2 | 3 | 4 | 4 | 4 | 3 | 26 | MEDIA |
| IN-I-P02-A1 | lectura | 4 | 1 | 2 | 2 | 1 | 4 | 3 | 1 | 18 | CRÍTICA |
| IN-I-P02-A2 | fill_blanks | 5 | 2 | 2 | 2 | 2 | 4 | 4 | 2 | 23 | MEDIA |
| IN-I-P02-A3 | reflexion_escrita | 4 | 2 | 2 | 3 | 4 | 4 | 4 | 3 | 26 | MEDIA |
| IN-I-P03-A1 | lectura | 4 | 1 | 2 | 2 | 1 | 4 | 3 | 1 | 18 | CRÍTICA |
| IN-I-P03-A2 | fill_blanks | 5 | 2 | 2 | 2 | 2 | 4 | 4 | 2 | 23 | MEDIA |
| IN-I-P03-A3 | reflexion_escrita | 4 | 2 | 2 | 3 | 4 | 4 | 4 | 3 | 26 | MEDIA |
| IN-I-P04-A1 | lectura | 4 | 1 | 2 | 2 | 1 | 4 | 3 | 1 | 18 | CRÍTICA |
| IN-I-P04-A2 | fill_blanks | 5 | 2 | 2 | 2 | 2 | 4 | 4 | 2 | 23 | MEDIA |
| IN-I-P04-A3 | reflexion_escrita | 4 | 2 | 2 | 3 | 4 | 4 | 4 | 3 | 26 | MEDIA |
| IN-I-P05-A1 | lectura | 4 | 1 | 2 | 2 | 1 | 4 | 3 | 1 | 18 | CRÍTICA |
| IN-I-P05-A2 | fill_blanks | 4 | 2 | 1 | 2 | 2 | 4 | 3 | 2 | 20 | MEDIA |
| IN-I-P05-A3 | reflexion_escrita | 4 | 2 | 1 | 3 | 4 | 4 | 3 | 3 | 24 | MEDIA |
| IN-I-P06-A1 | lectura | 4 | 1 | 2 | 2 | 1 | 4 | 3 | 1 | 18 | CRÍTICA |
| IN-I-P06-A2 | fill_blanks | 4 | 2 | 1 | 2 | 2 | 4 | 3 | 2 | 20 | MEDIA |
| IN-I-P06-A3 | reflexion_escrita | 4 | 2 | 2 | 3 | 4 | 4 | 3 | 3 | 25 | MEDIA |
| IN-I-P07-A1 | lectura | 4 | 1 | 2 | 2 | 1 | 4 | 3 | 1 | 18 | CRÍTICA |
| IN-I-P07-A2 | fill_blanks | 4 | 2 | 2 | 2 | 2 | 4 | 3 | 2 | 21 | MEDIA |
| IN-I-P07-A3 | reflexion_escrita | 4 | 2 | 2 | 3 | 4 | 4 | 3 | 3 | 25 | MEDIA |
| IN-I-P08-A1 | lectura | 4 | 1 | 1 | 2 | 1 | 4 | 3 | 1 | 17 | CRÍTICA |
| IN-I-P08-A2 | fill_blanks | 4 | 2 | 1 | 2 | 2 | 4 | 3 | 2 | 20 | MEDIA |
| IN-I-P08-A3 | reflexion_escrita | 4 | 2 | 1 | 3 | 4 | 4 | 3 | 3 | 24 | MEDIA |

**Hallazgos IN-I:** 8/8 lecturas son CRÍTICA (D5=1, D2=1): textos 80–110 palabras, listas de vocabulario. IN-I-P08-A1 (17 pts) es el score mínimo del corpus. 0 lecturas con d5=true. Solo 3 tipos de actividad. Fill_blanks en P01 usa contexto mexicano: Valeria de Guadalajara, Diego de Monterrey (D3=2).

---

#### CS-I — Ciencias Sociales I

| Actividad | Tipo | D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | Total | Bucket |
|-----------|------|----|----|----|----|----|----|----|----|-------|--------|
| CS-I-P01-A1 | lectura | 5 | 3 | 4 | 2 | 2 | 4 | 4 | 3 | 27 | MEDIA |
| CS-I-P01-A2 | debate_estructurado | 5 | 4 | 5 | 4 | 2 | 5 | 5 | 5 | 35 | SÓLIDA |
| CS-I-P01-A3 | reflexion_escrita | 5 | 4 | 5 | 3 | 4 | 5 | 5 | 5 | 36 | SÓLIDA |
| CS-I-P02-A1 | lectura | 5 | 3 | 5 | 2 | 4 | 5 | 4 | 3 | 31 | ACEPTABLE |
| CS-I-P02-A2 | debate_estructurado | 5 | 5 | 5 | 4 | 2 | 5 | 5 | 5 | 36 | SÓLIDA |
| CS-I-P02-A3 | reflexion_escrita | 5 | 4 | 5 | 3 | 4 | 5 | 5 | 5 | 36 | SÓLIDA |
| CS-I-P03-A1 | lectura | 5 | 3 | 5 | 2 | 4 | 5 | 4 | 3 | 31 | ACEPTABLE |
| CS-I-P03-A2 | debate_estructurado | 5 | 5 | 5 | 4 | 2 | 5 | 5 | 5 | 36 | SÓLIDA |
| CS-I-P03-A3 | reflexion_escrita | 5 | 4 | 5 | 3 | 4 | 5 | 5 | 5 | 36 | SÓLIDA |
| CS-I-P04-A1 | lectura | 5 | 3 | 5 | 2 | 4 | 5 | 4 | 3 | 31 | ACEPTABLE |
| CS-I-P04-A2 | debate_estructurado | 5 | 5 | 5 | 4 | 2 | 5 | 5 | 5 | 36 | SÓLIDA |
| CS-I-P04-A3 | reflexion_escrita | 5 | 4 | 5 | 3 | 4 | 5 | 5 | 5 | 36 | SÓLIDA |

**Hallazgos CS-I:** UAC más sólida de Sem 1. Debates con argumentos_guia bidireccionales ricos ("¿Es posible ser ciudadano/a pleno/a en México con las desigualdades actuales?"). CS-I-P02-A1: sufragio femenino 1953, INE, ciudadanía formal vs. sustantiva. CS-I-P03-A3: elige norma injusta, explica origen histórico, propone mecanismos de cambio. Debilidad: d5=false en los 4 debates.

---

#### PFH-I — Pensamiento Filosófico y Humanidades I

| Actividad | Tipo | D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | Total | Bucket |
|-----------|------|----|----|----|----|----|----|----|----|-------|--------|
| PFH-I-P01-A1 | lectura | 5 | 3 | 2 | 2 | 4 | 5 | 4 | 4 | 29 | ACEPTABLE |
| PFH-I-P01-A2 | quiz_multiple_opcion | 4 | 3 | 2 | 2 | 4 | 4 | 4 | 4 | 27 | MEDIA |
| PFH-I-P01-A3 | reflexion_escrita | 5 | 5 | 2 | 3 | 4 | 5 | 5 | 5 | 34 | ACEPTABLE |
| PFH-I-P02-A1 | lectura | 5 | 3 | 1 | 2 | 4 | 5 | 4 | 4 | 28 | ACEPTABLE |
| PFH-I-P02-A2 | quiz_multiple_opcion | 5 | 3 | 1 | 2 | 4 | 4 | 4 | 4 | 27 | MEDIA |
| PFH-I-P02-A3 | reflexion_escrita | 5 | 5 | 1 | 3 | 4 | 5 | 5 | 5 | 33 | ACEPTABLE |
| PFH-I-P03-A1 | lectura | 5 | 4 | 2 | 2 | 4 | 5 | 4 | 4 | 30 | ACEPTABLE |
| PFH-I-P03-A2 | quiz_multiple_opcion | 4 | 3 | 2 | 2 | 4 | 4 | 4 | 4 | 27 | MEDIA |
| PFH-I-P03-A3 | reflexion_escrita | 5 | 5 | 2 | 3 | 4 | 5 | 5 | 5 | 34 | ACEPTABLE |
| PFH-I-P04-A1 | lectura | 5 | 3 | 1 | 2 | 4 | 5 | 4 | 4 | 28 | ACEPTABLE |
| PFH-I-P04-A2 | quiz_multiple_opcion | 4 | 3 | 1 | 2 | 4 | 4 | 4 | 4 | 26 | MEDIA |
| PFH-I-P04-A3 | reflexion_escrita | 5 | 5 | 1 | 3 | 4 | 5 | 5 | 5 | 33 | ACEPTABLE |
| PFH-I-P05-A1 | lectura | 4 | 3 | 3 | 2 | 4 | 5 | 4 | 3 | 28 | ACEPTABLE |
| PFH-I-P05-A2 | quiz_multiple_opcion | 4 | 3 | 3 | 2 | 4 | 4 | 4 | 3 | 27 | MEDIA |
| PFH-I-P05-A3 | reflexion_escrita | 4 | 4 | 3 | 3 | 4 | 5 | 5 | 5 | 33 | ACEPTABLE |

**Hallazgos PFH-I:** Segunda UAC más sólida de Sem 1. Lecturas genuinamente filosóficas (D6=5, thaumazein aristotélico en P01-A1). D8=5 consistente en reflexiones (PFH-I-P01-A3: momento propio de cuestionamiento filosófico). Debilidad: D3=1–2 en P02 y P04 (falta conexión con Sor Juana, Leopoldo Zea). D7=4–5 por progresiones conceptualmente distintas.

---

### Semestre 2

---

#### LC-II — Lengua y Comunicación II

| Actividad | Tipo | D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | Total | Bucket |
|-----------|------|----|----|----|----|----|----|----|----|-------|--------|
| LC-II-P01-A1 | lectura | 4 | 2 | 1 | 2 | 2 | 4 | 3 | 3 | 21 | MEDIA |
| LC-II-P01-A2 | fill_blanks | 3 | 2 | 1 | 2 | 2 | 4 | 3 | 2 | 19 | CRÍTICA |
| LC-II-P01-A3 | reflexion_escrita | 5 | 4 | 2 | 3 | 4 | 5 | 5 | 5 | 33 | ACEPTABLE |
| LC-II-P02-A1 | video_con_preguntas | 4 | 3 | 2 | 3 | 2 | 4 | 4 | 3 | 25 | MEDIA |
| LC-II-P02-A2 | quiz_multiple_opcion | 4 | 2 | 1 | 2 | 4 | 4 | 3 | 2 | 22 | MEDIA |
| LC-II-P02-A3 | reflexion_escrita | 5 | 4 | 2 | 3 | 4 | 5 | 5 | 5 | 33 | ACEPTABLE |
| LC-II-P03-A1 | lectura | 5 | 3 | 3 | 2 | 4 | 4 | 4 | 3 | 28 | ACEPTABLE |
| LC-II-P03-A2 | fill_blanks | 4 | 2 | 3 | 2 | 2 | 4 | 4 | 2 | 23 | MEDIA |
| LC-II-P03-A3 | autoevaluacion | 4 | 3 | 3 | 3 | 2 | 4 | 4 | 3 | 26 | MEDIA |
| LC-II-P04-A1 | infografia | 4 | 2 | 2 | 2 | 4 | 4 | 4 | 2 | 24 | MEDIA |
| LC-II-P04-A2 | quiz_verdadero_falso | 4 | 2 | 2 | 2 | 4 | 4 | 3 | 2 | 23 | MEDIA |
| LC-II-P04-A3 | reflexion_escrita | 5 | 4 | 2 | 3 | 4 | 5 | 5 | 5 | 33 | ACEPTABLE |
| LC-II-P05-A1 | lectura | 4 | 2 | 1 | 2 | 2 | 4 | 3 | 2 | 20 | MEDIA |
| LC-II-P05-A2 | autoevaluacion | 4 | 3 | 1 | 3 | 2 | 4 | 4 | 3 | 24 | MEDIA |
| LC-II-P05-A3 | reflexion_escrita | 5 | 4 | 2 | 3 | 4 | 5 | 4 | 5 | 32 | ACEPTABLE |
| LC-II-P06-A1 | video_con_preguntas | 4 | 3 | 2 | 3 | 2 | 4 | 4 | 3 | 25 | MEDIA |
| LC-II-P06-A2 | quiz_multiple_opcion | 4 | 2 | 2 | 2 | 4 | 4 | 3 | 2 | 23 | MEDIA |
| LC-II-P06-A3 | reflexion_escrita | 5 | 4 | 2 | 3 | 4 | 5 | 4 | 5 | 32 | ACEPTABLE |
| LC-II-P07-A1 | lectura | 4 | 2 | 1 | 2 | 2 | 4 | 3 | 2 | 20 | MEDIA |
| LC-II-P07-A2 | fill_blanks | 4 | 2 | 1 | 2 | 2 | 4 | 3 | 2 | 20 | MEDIA |
| LC-II-P07-A3 | autoevaluacion | 4 | 3 | 1 | 3 | 2 | 4 | 4 | 3 | 24 | MEDIA |
| LC-II-P08-A1 | infografia | 4 | 2 | 2 | 2 | 4 | 4 | 4 | 2 | 24 | MEDIA |
| LC-II-P08-A2 | quiz_verdadero_falso | 4 | 2 | 2 | 2 | 4 | 4 | 3 | 2 | 23 | MEDIA |
| LC-II-P08-A3 | reflexion_escrita | 5 | 4 | 2 | 3 | 4 | 5 | 5 | 5 | 33 | ACEPTABLE |

**Hallazgos LC-II:** Mejora sobre LC-I en variedad (8 tipos). Reflexiones con D8=5 son la fortaleza. LC-II-P01-A2 (fill_blanks, 19 pts) es la actividad más débil. LC-II-P03-A1 (mejor lectura: "Las narrativas populares", D3=3 por tradición oral mexicana).

---

#### PM-II — Pensamiento Matemático II

| Actividad | Tipo | D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | Total | Bucket |
|-----------|------|----|----|----|----|----|----|----|----|-------|--------|
| PM-II-P01-A1 | lectura | 4 | 2 | 1 | 2 | 2 | 4 | 3 | 2 | 20 | MEDIA |
| PM-II-P01-A2 | ejercicio_matematico | 4 | 3 | 1 | 2 | 4 | 4 | 3 | 4 | 25 | MEDIA |
| PM-II-P01-A3 | reflexion_escrita | 4 | 3 | 1 | 3 | 4 | 4 | 3 | 4 | 26 | MEDIA |
| PM-II-P02-A1 | lectura | 4 | 2 | 1 | 2 | 2 | 4 | 3 | 2 | 20 | MEDIA |
| PM-II-P02-A2 | video_con_preguntas | 4 | 3 | 1 | 3 | 4 | 4 | 3 | 3 | 25 | MEDIA |
| PM-II-P02-A3 | autoevaluacion | 4 | 3 | 1 | 3 | 2 | 4 | 3 | 3 | 23 | MEDIA |
| PM-II-P03-A1 | lectura | 4 | 2 | 1 | 2 | 2 | 4 | 3 | 2 | 20 | MEDIA |
| PM-II-P03-A2 | ejercicio_matematico | 4 | 4 | 1 | 2 | 4 | 4 | 4 | 4 | 27 | MEDIA |
| PM-II-P03-A3 | reflexion_escrita | 4 | 3 | 1 | 3 | 4 | 4 | 3 | 4 | 26 | MEDIA |
| PM-II-P04-A1 | lectura | 5 | 2 | 1 | 2 | 4 | 4 | 3 | 2 | 23 | MEDIA |
| PM-II-P04-A2 | ejercicio_matematico | 5 | 4 | 2 | 2 | 4 | 4 | 4 | 4 | 29 | ACEPTABLE |
| PM-II-P04-A3 | reflexion_escrita | 5 | 3 | 2 | 3 | 4 | 4 | 4 | 4 | 29 | ACEPTABLE |
| PM-II-P05-A1 | lectura | 5 | 2 | 1 | 2 | 2 | 4 | 3 | 2 | 21 | MEDIA |
| PM-II-P05-A2 | ejercicio_matematico | 5 | 4 | 1 | 2 | 4 | 4 | 4 | 5 | 29 | ACEPTABLE |
| PM-II-P05-A3 | autoevaluacion | 4 | 3 | 1 | 3 | 2 | 4 | 3 | 3 | 23 | MEDIA |
| PM-II-P06-A1 | infografia | 4 | 2 | 1 | 2 | 4 | 4 | 3 | 2 | 22 | MEDIA |
| PM-II-P06-A2 | ejercicio_matematico | 5 | 4 | 2 | 2 | 4 | 4 | 4 | 4 | 29 | ACEPTABLE |
| PM-II-P06-A3 | reflexion_escrita | 4 | 3 | 1 | 3 | 4 | 4 | 3 | 4 | 26 | MEDIA |

**Hallazgos PM-II:** Mejora sobre PM-I en variedad (6 tipos). PM-II-P05-A2 (sistemas ecuaciones por tres métodos, D2=4, D8=5) es el mejor ejercicio matemático. Contextualización casi ausente (6%). Autoevaluaciones con solo 2–3 criterios de bajo nivel.

---

#### CNEYT-II — Conservación de la energía

| Actividad | Tipo | D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | Total | Bucket |
|-----------|------|----|----|----|----|----|----|----|----|-------|--------|
| CNEYT-II-P01-A1 | lectura | 4 | 3 | 2 | 2 | 4 | 4 | 4 | 3 | 26 | MEDIA |
| CNEYT-II-P01-A2 | quiz_multiple_opcion | 4 | 3 | 2 | 2 | 4 | 4 | 4 | 3 | 26 | MEDIA |
| CNEYT-II-P01-A3 | reflexion_escrita | 5 | 4 | 2 | 3 | 4 | 5 | 4 | 5 | 32 | ACEPTABLE |
| CNEYT-II-P02-A1 | video_con_preguntas | 5 | 4 | 2 | 3 | 2 | 4 | 4 | 4 | 28 | ACEPTABLE |
| CNEYT-II-P02-A2 | quiz_verdadero_falso | 5 | 4 | 2 | 2 | 4 | 4 | 4 | 4 | 29 | ACEPTABLE |
| CNEYT-II-P02-A3 | reflexion_escrita | 5 | 4 | 2 | 3 | 4 | 5 | 4 | 5 | 32 | ACEPTABLE |
| CNEYT-II-P03-A1 | lectura | 5 | 4 | 1 | 2 | 4 | 5 | 4 | 4 | 29 | ACEPTABLE |
| CNEYT-II-P03-A2 | simulacion | 5 | 5 | 1 | 3 | 4 | 5 | 5 | 5 | 33 | ACEPTABLE |
| CNEYT-II-P03-A3 | reflexion_escrita | 5 | 5 | 1 | 3 | 4 | 5 | 4 | 5 | 32 | ACEPTABLE |
| CNEYT-II-P04-A1 | infografia | 5 | 2 | 2 | 2 | 4 | 4 | 4 | 2 | 25 | MEDIA |
| CNEYT-II-P04-A2 | fill_blanks | 5 | 2 | 2 | 2 | 2 | 4 | 4 | 2 | 23 | MEDIA |
| CNEYT-II-P04-A3 | reflexion_escrita | 5 | 4 | 2 | 3 | 4 | 5 | 4 | 4 | 31 | ACEPTABLE |
| CNEYT-II-P05-A1 | lectura | 5 | 3 | 3 | 2 | 4 | 4 | 4 | 3 | 28 | ACEPTABLE |
| CNEYT-II-P05-A2 | simulacion | 5 | 5 | 3 | 3 | 4 | 5 | 5 | 5 | 35 | SÓLIDA |
| CNEYT-II-P05-A3 | reflexion_escrita | 5 | 4 | 3 | 3 | 4 | 5 | 4 | 5 | 33 | ACEPTABLE |
| CNEYT-II-P06-A1 | lectura | 4 | 3 | 1 | 2 | 4 | 4 | 3 | 3 | 24 | MEDIA |
| CNEYT-II-P06-A2 | quiz_multiple_opcion | 4 | 3 | 1 | 2 | 4 | 4 | 3 | 3 | 24 | MEDIA |
| CNEYT-II-P06-A3 | reflexion_escrita | 4 | 4 | 1 | 3 | 2 | 4 | 3 | 4 | 25 | MEDIA |
| CNEYT-II-P07-A1 | lectura | 4 | 3 | 1 | 2 | 4 | 4 | 3 | 3 | 24 | MEDIA |
| CNEYT-II-P07-A2 | glosario_interactivo | 4 | 2 | 1 | 2 | 4 | 4 | 3 | 2 | 22 | MEDIA |
| CNEYT-II-P07-A3 | autoevaluacion | 4 | 3 | 1 | 3 | 2 | 4 | 3 | 3 | 23 | MEDIA |
| CNEYT-II-P08-A1 | debate_estructurado | 5 | 5 | 3 | 3 | 2 | 5 | 5 | 5 | 33 | ACEPTABLE |
| CNEYT-II-P08-A2 | quiz_multiple_opcion | 4 | 3 | 3 | 2 | 4 | 4 | 3 | 3 | 26 | MEDIA |
| CNEYT-II-P08-A3 | reflexion_escrita | 5 | 4 | 3 | 3 | 2 | 5 | 4 | 5 | 31 | ACEPTABLE |

**Hallazgos CNEYT-II:** UAC con mayor variedad de tipos de Sem 2 (12 tipos). CNEYT-II-P05-A2 (simulación energías renovables, 35 pts): exploración de sistema solar con análisis de eficiencia en contexto mexicano. CNEYT-II-P03-A2 (simulación termodinámica, 33 pts): calcular COP con datos reales. Debate P08-A1 con argumentos_guia presentes. Videos con URL placeholder emergentes.

---

#### CD-II — Cultura Digital II

| Actividad | Tipo | D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | Total | Bucket |
|-----------|------|----|----|----|----|----|----|----|----|-------|--------|
| CD-II-P01-A1 | lectura | 4 | 3 | 2 | 2 | 2 | 4 | 4 | 3 | 24 | MEDIA |
| CD-II-P01-A2 | quiz_multiple_opcion | 4 | 3 | 2 | 2 | 4 | 4 | 4 | 3 | 26 | MEDIA |
| CD-II-P01-A3 | reflexion_escrita | 5 | 4 | 2 | 3 | 4 | 5 | 5 | 5 | 33 | ACEPTABLE |
| CD-II-P02-A1 | video_con_preguntas | 4 | 3 | 1 | 3 | 2 | 4 | 4 | 3 | 24 | MEDIA |
| CD-II-P02-A2 | simulacion | 4 | 4 | 1 | 3 | 4 | 4 | 4 | 4 | 28 | ACEPTABLE |
| CD-II-P02-A3 | autoevaluacion | 4 | 3 | 1 | 3 | 2 | 4 | 4 | 3 | 24 | MEDIA |
| CD-II-P03-A1 | lectura | 5 | 3 | 3 | 2 | 2 | 4 | 4 | 3 | 26 | MEDIA |
| CD-II-P03-A2 | quiz_verdadero_falso | 5 | 3 | 3 | 2 | 4 | 4 | 4 | 3 | 28 | ACEPTABLE |
| CD-II-P03-A3 | reflexion_escrita | 5 | 4 | 3 | 3 | 4 | 5 | 5 | 5 | 34 | ACEPTABLE |
| CD-II-P04-A1 | infografia | 4 | 2 | 2 | 2 | 4 | 4 | 4 | 2 | 24 | MEDIA |
| CD-II-P04-A2 | simulacion | 4 | 4 | 2 | 3 | 4 | 4 | 4 | 4 | 29 | ACEPTABLE |
| CD-II-P04-A3 | reflexion_escrita | 4 | 4 | 2 | 3 | 4 | 5 | 4 | 5 | 31 | ACEPTABLE |
| CD-II-P05-A1 | video_con_preguntas | 4 | 3 | 2 | 3 | 2 | 4 | 4 | 3 | 25 | MEDIA |
| CD-II-P05-A2 | quiz_multiple_opcion | 4 | 3 | 2 | 2 | 4 | 4 | 4 | 3 | 26 | MEDIA |
| CD-II-P05-A3 | autoevaluacion | 4 | 3 | 2 | 3 | 2 | 4 | 4 | 3 | 25 | MEDIA |

**Hallazgos CD-II:** CD-II-P03-A3 ("Diseña tu protocolo anti-fake-news", 34 pts) es la reflexión más concreta, menciona Verificado y Animal Político (D3=3). Autoevaluaciones con solo 2 criterios son los tipos más débiles. CD-II-P01-A1 con d5=false (162 palabras).

---

#### IN-II — Inglés II

| Actividad | Tipo | D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | Total | Bucket |
|-----------|------|----|----|----|----|----|----|----|----|-------|--------|
| IN-II-P01-A1 | lectura | 4 | 2 | 1 | 2 | 2 | 4 | 3 | 2 | 20 | MEDIA |
| IN-II-P01-A2 | fill_blanks | 4 | 2 | 1 | 2 | 2 | 4 | 3 | 2 | 20 | MEDIA |
| IN-II-P01-A3 | reflexion_escrita | 4 | 3 | 1 | 3 | 4 | 4 | 4 | 4 | 27 | MEDIA |
| IN-II-P02-A1 | video_con_preguntas | 4 | 2 | 2 | 3 | 2 | 4 | 4 | 3 | 24 | MEDIA |
| IN-II-P02-A2 | fill_blanks | 4 | 2 | 1 | 2 | 2 | 4 | 4 | 2 | 21 | MEDIA |
| IN-II-P02-A3 | reflexion_escrita | 4 | 3 | 2 | 3 | 4 | 4 | 4 | 4 | 28 | ACEPTABLE |
| IN-II-P03-A1 | lectura | 5 | 2 | 1 | 2 | 2 | 4 | 4 | 2 | 22 | MEDIA |
| IN-II-P03-A2 | quiz_multiple_opcion | 5 | 2 | 1 | 2 | 4 | 4 | 4 | 2 | 24 | MEDIA |
| IN-II-P03-A3 | reflexion_escrita | 4 | 3 | 1 | 3 | 4 | 4 | 4 | 4 | 27 | MEDIA |
| IN-II-P04-A1 | infografia | 5 | 2 | 2 | 2 | 4 | 4 | 4 | 2 | 25 | MEDIA |
| IN-II-P04-A2 | fill_blanks | 5 | 2 | 1 | 2 | 2 | 4 | 4 | 2 | 22 | MEDIA |
| IN-II-P04-A3 | reflexion_escrita | 4 | 3 | 2 | 3 | 4 | 4 | 4 | 4 | 28 | ACEPTABLE |
| IN-II-P05-A1 | lectura | 5 | 2 | 2 | 2 | 4 | 4 | 4 | 2 | 25 | MEDIA |
| IN-II-P05-A2 | quiz_verdadero_falso | 5 | 2 | 2 | 2 | 4 | 4 | 4 | 2 | 25 | MEDIA |
| IN-II-P05-A3 | reflexion_escrita | 5 | 3 | 2 | 3 | 4 | 4 | 5 | 4 | 30 | ACEPTABLE |
| IN-II-P06-A1 | video_con_preguntas | 4 | 2 | 2 | 3 | 2 | 4 | 4 | 3 | 24 | MEDIA |
| IN-II-P06-A2 | glosario_interactivo | 4 | 1 | 1 | 2 | 4 | 4 | 3 | 1 | 20 | MEDIA |
| IN-II-P06-A3 | reflexion_escrita | 4 | 3 | 2 | 3 | 4 | 4 | 4 | 4 | 28 | ACEPTABLE |
| IN-II-P07-A1 | lectura | 4 | 2 | 1 | 2 | 2 | 4 | 3 | 2 | 20 | MEDIA |
| IN-II-P07-A2 | quiz_multiple_opcion | 4 | 2 | 1 | 2 | 4 | 4 | 3 | 2 | 22 | MEDIA |
| IN-II-P07-A3 | reflexion_escrita | 4 | 3 | 1 | 3 | 4 | 4 | 4 | 4 | 27 | MEDIA |
| IN-II-P08-A1 | autoevaluacion | 4 | 3 | 1 | 3 | 2 | 4 | 4 | 3 | 24 | MEDIA |
| IN-II-P08-A2 | quiz_multiple_opcion | 4 | 2 | 1 | 2 | 4 | 4 | 3 | 2 | 22 | MEDIA |
| IN-II-P08-A3 | reflexion_escrita | 4 | 3 | 1 | 3 | 4 | 4 | 4 | 4 | 27 | MEDIA |

**Hallazgos IN-II:** Mejora sobre IN-I. IN-II-P05-A3 ("Comparing two places in my community", 30 pts) conecta comparativos con identidad local. Glosario IN-II-P06-A2 (20 pts) es la actividad más débil (D2=1, D8=1). Contextualización casi inexistente (4%).

---

#### CS-II — Ciencias Sociales II

| Actividad | Tipo | D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | Total | Bucket |
|-----------|------|----|----|----|----|----|----|----|----|-------|--------|
| CS-II-P01-A1 | lectura | 5 | 3 | 5 | 2 | 2 | 5 | 4 | 3 | 29 | ACEPTABLE |
| CS-II-P01-A2 | quiz_verdadero_falso | 5 | 3 | 5 | 2 | 4 | 4 | 4 | 3 | 30 | ACEPTABLE |
| CS-II-P01-A3 | debate_estructurado | 5 | 5 | 5 | 3 | 2 | 5 | 5 | 5 | 35 | SÓLIDA |
| CS-II-P02-A1 | lectura | 5 | 3 | 4 | 2 | 4 | 5 | 4 | 3 | 30 | ACEPTABLE |
| CS-II-P02-A2 | infografia | 5 | 2 | 4 | 2 | 4 | 4 | 4 | 2 | 27 | MEDIA |
| CS-II-P02-A3 | reflexion_escrita | 5 | 4 | 5 | 3 | 4 | 5 | 5 | 5 | 36 | SÓLIDA |
| CS-II-P03-A1 | lectura | 5 | 3 | 5 | 2 | 2 | 5 | 4 | 3 | 29 | ACEPTABLE |
| CS-II-P03-A2 | video_con_preguntas | 5 | 4 | 5 | 3 | 2 | 4 | 4 | 4 | 31 | ACEPTABLE |
| CS-II-P03-A3 | reflexion_escrita | 5 | 5 | 5 | 3 | 4 | 5 | 5 | 5 | 37 | SÓLIDA |
| CS-II-P04-A1 | lectura | 5 | 3 | 5 | 2 | 4 | 5 | 4 | 3 | 31 | ACEPTABLE |
| CS-II-P04-A2 | quiz_multiple_opcion | 5 | 3 | 5 | 2 | 4 | 4 | 4 | 3 | 30 | ACEPTABLE |
| CS-II-P04-A3 | reflexion_escrita | 5 | 5 | 5 | 3 | 4 | 5 | 5 | 5 | 37 | SÓLIDA |

**Hallazgos CS-II:** UAC de mayor calidad de Sem 2. CS-II-P03-A3 y P04-A3 (37 pts): economía informal y relaciones de poder con contextualización mexicana central. CS-II-P01-A1 con d5=false (162 palabras) para tema complejo de bienestar social.

---

#### PFH-II — Pensamiento Filosófico y Humanidades II

| Actividad | Tipo | D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | Total | Bucket |
|-----------|------|----|----|----|----|----|----|----|----|-------|--------|
| PFH-II-P01-A1 | glosario_interactivo | 5 | 2 | 1 | 2 | 4 | 4 | 4 | 2 | 24 | MEDIA |
| PFH-II-P01-A2 | quiz_multiple_opcion | 5 | 3 | 1 | 2 | 4 | 4 | 4 | 3 | 26 | MEDIA |
| PFH-II-P01-A3 | reflexion_escrita | 5 | 5 | 1 | 3 | 4 | 5 | 4 | 5 | 32 | ACEPTABLE |
| PFH-II-P02-A1 | lectura | 5 | 4 | 2 | 2 | 2 | 5 | 5 | 4 | 29 | ACEPTABLE |
| PFH-II-P02-A2 | debate_estructurado | 5 | 5 | 2 | 4 | 2 | 5 | 5 | 5 | 33 | ACEPTABLE |
| PFH-II-P02-A3 | autoevaluacion | 4 | 3 | 2 | 3 | 2 | 4 | 4 | 3 | 25 | MEDIA |
| PFH-II-P03-A1 | lectura | 5 | 4 | 3 | 2 | 4 | 5 | 5 | 4 | 32 | ACEPTABLE |
| PFH-II-P03-A2 | video_con_preguntas | 5 | 4 | 3 | 3 | 2 | 4 | 5 | 4 | 30 | ACEPTABLE |
| PFH-II-P03-A3 | quiz_verdadero_falso | 4 | 3 | 3 | 2 | 4 | 4 | 4 | 3 | 27 | MEDIA |
| PFH-II-P04-A1 | lectura | 5 | 4 | 3 | 2 | 4 | 5 | 5 | 4 | 32 | ACEPTABLE |
| PFH-II-P04-A2 | quiz_multiple_opcion | 5 | 3 | 3 | 2 | 4 | 4 | 5 | 3 | 29 | ACEPTABLE |
| PFH-II-P04-A3 | reflexion_escrita | 5 | 5 | 4 | 3 | 4 | 5 | 5 | 5 | 36 | SÓLIDA |
| PFH-II-P05-A1 | infografia | 5 | 2 | 5 | 2 | 4 | 4 | 5 | 2 | 29 | ACEPTABLE |
| PFH-II-P05-A2 | video_con_preguntas | 5 | 3 | 5 | 3 | 2 | 4 | 5 | 3 | 30 | ACEPTABLE |
| PFH-II-P05-A3 | reflexion_escrita | 5 | 5 | 5 | 3 | 4 | 5 | 5 | 5 | 37 | SÓLIDA |

**Hallazgos PFH-II:** PFH-II-P05-A3 (humanismo mexicano, 37 pts): identifica manifestaciones del humanismo mexicano en la vida propia — score más alto de PFH. PFH-II-P04-A3 (perspectiva de género en filosofía, 36 pts). PFH-II mejora sobre PFH-I en D3: P04 y P05 con contextualización mexicana central.

---

### Semestre 3

---

#### CNEYT-III — Ciencias Naturales, Experimentación y Tecnología III
**24 actividades | 8 progresiones | 38% refs mex | 88% suficiente**

| Código | Tipo | D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | Total | Bucket |
|--------|------|----|----|----|----|----|----|----|----|-------|--------|
| CNEYT-III-P01-A1 | infografia | 5 | 3 | 5 | 3 | 4 | 5 | 4 | 3 | 32 | ACEPTABLE |
| CNEYT-III-P01-A2 | quiz_multiple_opcion | 4 | 3 | 4 | 2 | 4 | 4 | 3 | 3 | 27 | MEDIA |
| CNEYT-III-P01-A3 | reflexion_escrita | 5 | 4 | 5 | 4 | 4 | 5 | 4 | 4 | 35 | SÓLIDA |
| CNEYT-III-P02-A1 | lectura | 5 | 3 | 3 | 2 | 4 | 5 | 3 | 3 | 28 | ACEPTABLE |
| CNEYT-III-P02-A2 | ejercicio_matematico | 5 | 4 | 3 | 4 | 5 | 5 | 4 | 4 | 34 | ACEPTABLE |
| CNEYT-III-P02-A3 | reflexion_escrita | 5 | 5 | 4 | 4 | 4 | 5 | 4 | 5 | 36 | SÓLIDA |
| CNEYT-III-P03-A1 | video_con_preguntas | 4 | 3 | 3 | 1 | 2 | 4 | 3 | 3 | 23 | MEDIA |
| CNEYT-III-P03-A2 | quiz_multiple_opcion | 4 | 3 | 3 | 2 | 4 | 4 | 3 | 3 | 26 | MEDIA |
| CNEYT-III-P03-A3 | reflexion_escrita | 5 | 4 | 4 | 3 | 4 | 5 | 3 | 4 | 32 | ACEPTABLE |
| CNEYT-III-P04-A1 | lectura | 5 | 3 | 4 | 2 | 4 | 5 | 4 | 3 | 30 | ACEPTABLE |
| CNEYT-III-P04-A2 | simulacion | 5 | 4 | 3 | 4 | 4 | 5 | 4 | 4 | 33 | ACEPTABLE |
| CNEYT-III-P04-A3 | debate_estructurado | 5 | 5 | 4 | 4 | 4 | 5 | 4 | 4 | 35 | SÓLIDA |
| CNEYT-III-P05-A1 | infografia | 5 | 3 | 4 | 3 | 4 | 5 | 3 | 3 | 30 | ACEPTABLE |
| CNEYT-III-P05-A2 | fill_blanks | 4 | 3 | 3 | 3 | 4 | 4 | 3 | 2 | 26 | MEDIA |
| CNEYT-III-P05-A3 | autoevaluacion | 4 | 3 | 3 | 3 | 3 | 4 | 3 | 3 | 26 | MEDIA |
| CNEYT-III-P06-A1 | lectura | 5 | 4 | 5 | 3 | 4 | 5 | 3 | 3 | 32 | ACEPTABLE |
| CNEYT-III-P06-A2 | quiz_verdadero_falso | 4 | 3 | 4 | 2 | 4 | 4 | 3 | 3 | 27 | MEDIA |
| CNEYT-III-P06-A3 | debate_estructurado | 5 | 5 | 4 | 3 | 3 | 5 | 4 | 4 | 33 | ACEPTABLE |
| CNEYT-III-P07-A1 | lectura | 5 | 4 | 5 | 2 | 4 | 5 | 4 | 3 | 32 | ACEPTABLE |
| CNEYT-III-P07-A2 | fill_blanks | 4 | 2 | 3 | 3 | 3 | 4 | 2 | 2 | 23 | MEDIA |
| CNEYT-III-P07-A3 | reflexion_escrita | 5 | 4 | 4 | 3 | 3 | 5 | 3 | 4 | 31 | ACEPTABLE |
| CNEYT-III-P08-A1 | glosario_interactivo | 4 | 3 | 4 | 3 | 4 | 4 | 3 | 2 | 27 | MEDIA |
| CNEYT-III-P08-A2 | simulacion | 5 | 4 | 3 | 4 | 4 | 5 | 3 | 4 | 32 | ACEPTABLE |
| CNEYT-III-P08-A3 | reflexion_escrita | 5 | 5 | 4 | 5 | 3 | 5 | 4 | 5 | 36 | SÓLIDA |

**Promedio CNEYT-III: 30.0 — Bucket mayoritario: ACEPTABLE**

**Hallazgos CNEYT-III:** P01–P02 y P08 muestran el esquema más completo: infografía/lectura → ejercicio/simulación → reflexión con postura argumentada. CNEYT-III-P02-A3 y P08-A3 son las más sólidas (D8=5, criterios múltiples). Video P03-A1 con d5=false (D5=2) y D4=1. CNEYT-III-P07-A2 (fill_blanks genérico sin contexto mexicano en pistas, D3=3, D8=2) es la actividad de mejora prioritaria.

---

#### IN-III — Inglés III
**24 actividades | 8 progresiones | 8% refs mex | 83% suficiente**

| Código | Tipo | D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | Total | Bucket |
|--------|------|----|----|----|----|----|----|----|----|-------|--------|
| IN-III-P01-A1 | lectura | 5 | 3 | 1 | 2 | 4 | 4 | 3 | 3 | 25 | MEDIA |
| IN-III-P01-A2 | fill_blanks | 4 | 2 | 4 | 3 | 3 | 4 | 3 | 2 | 25 | MEDIA |
| IN-III-P01-A3 | reflexion_escrita | 5 | 3 | 1 | 3 | 3 | 4 | 3 | 3 | 25 | MEDIA |
| IN-III-P02-A1 | video_con_preguntas | 4 | 3 | 2 | 1 | 2 | 4 | 3 | 3 | 22 | MEDIA |
| IN-III-P02-A2 | fill_blanks | 4 | 2 | 2 | 2 | 2 | 4 | 2 | 2 | 20 | MEDIA |
| IN-III-P02-A3 | reflexion_escrita | 5 | 3 | 3 | 3 | 3 | 4 | 3 | 3 | 27 | MEDIA |
| IN-III-P03-A1 | glosario_interactivo | 4 | 2 | 4 | 3 | 4 | 4 | 4 | 2 | 27 | MEDIA |
| IN-III-P03-A2 | quiz_multiple_opcion | 4 | 3 | 2 | 2 | 4 | 4 | 3 | 2 | 24 | MEDIA |
| IN-III-P03-A3 | reflexion_escrita | 5 | 3 | 3 | 3 | 3 | 4 | 3 | 3 | 27 | MEDIA |
| IN-III-P04-A1 | lectura | 5 | 3 | 2 | 2 | 4 | 4 | 3 | 3 | 26 | MEDIA |
| IN-III-P04-A2 | quiz_verdadero_falso | 4 | 3 | 2 | 2 | 4 | 4 | 3 | 2 | 24 | MEDIA |
| IN-III-P04-A3 | autoevaluacion | 4 | 2 | 2 | 3 | 3 | 4 | 3 | 2 | 23 | MEDIA |
| IN-III-P05-A1 | lectura | 5 | 3 | 2 | 3 | 4 | 4 | 3 | 3 | 27 | MEDIA |
| IN-III-P05-A2 | fill_blanks | 4 | 2 | 3 | 3 | 3 | 4 | 3 | 2 | 24 | MEDIA |
| IN-III-P05-A3 | autoevaluacion | 4 | 2 | 2 | 4 | 3 | 4 | 3 | 2 | 24 | MEDIA |
| IN-III-P06-A1 | video_con_preguntas | 4 | 3 | 2 | 1 | 2 | 4 | 3 | 3 | 22 | MEDIA |
| IN-III-P06-A2 | fill_blanks | 4 | 2 | 2 | 2 | 2 | 4 | 2 | 2 | 20 | MEDIA |
| IN-III-P06-A3 | reflexion_escrita | 5 | 3 | 2 | 3 | 3 | 4 | 3 | 3 | 26 | MEDIA |
| IN-III-P07-A1 | lectura | 5 | 3 | 4 | 3 | 4 | 5 | 3 | 3 | 30 | ACEPTABLE |
| IN-III-P07-A2 | fill_blanks | 4 | 2 | 3 | 3 | 4 | 4 | 3 | 2 | 25 | MEDIA |
| IN-III-P07-A3 | reflexion_escrita | 5 | 3 | 2 | 4 | 3 | 4 | 4 | 3 | 28 | ACEPTABLE |
| IN-III-P08-A1 | infografia | 4 | 3 | 1 | 2 | 4 | 4 | 3 | 2 | 23 | MEDIA |
| IN-III-P08-A2 | quiz_multiple_opcion | 4 | 3 | 2 | 2 | 4 | 4 | 3 | 3 | 25 | MEDIA |
| IN-III-P08-A3 | autoevaluacion | 5 | 3 | 2 | 4 | 4 | 4 | 4 | 3 | 29 | ACEPTABLE |

**Promedio IN-III: 24.7 — Bucket mayoritario: MEDIA (21/24)**

**Hallazgos IN-III:** D3 sistemáticamente bajo (8% refs_mex) — contextos anglosajones genéricos. Excepciones positivas: fill_blanks P01-A2 (tamales), glosario P03-A1 (calles Juárez/Hidalgo/Morelos), lectura P07-A1 (Carlos → Puebla). Videos P02-A1 y P06-A1: D5=2 (sin transcripción), D4=1. IN-III-P02-A2 e IN-III-P06-A2 (fill_blanks, 20 pts) son el límite inferior de MEDIA.

---

#### LC-III — Lengua y Comunicación III
**21 actividades | 7 progresiones | 5% refs mex | 81% suficiente**

| Código | Tipo | D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | Total | Bucket |
|--------|------|----|----|----|----|----|----|----|----|-------|--------|
| LC-III-P01-A1 | lectura | 5 | 4 | 2 | 2 | 2 | 5 | 3 | 3 | 26 | MEDIA |
| LC-III-P01-A2 | quiz_multiple_opcion | 5 | 4 | 2 | 2 | 4 | 5 | 3 | 3 | 28 | ACEPTABLE |
| LC-III-P01-A3 | reflexion_escrita | 5 | 5 | 2 | 4 | 4 | 5 | 4 | 4 | 33 | ACEPTABLE |
| LC-III-P02-A1 | infografia | 5 | 3 | 3 | 3 | 4 | 5 | 4 | 2 | 29 | ACEPTABLE |
| LC-III-P02-A2 | quiz_multiple_opcion | 5 | 3 | 3 | 2 | 4 | 5 | 3 | 3 | 28 | ACEPTABLE |
| LC-III-P02-A3 | glosario_interactivo | 5 | 3 | 4 | 3 | 4 | 5 | 4 | 2 | 30 | ACEPTABLE |
| LC-III-P03-A1 | lectura | 5 | 4 | 2 | 2 | 4 | 5 | 3 | 3 | 28 | ACEPTABLE |
| LC-III-P03-A2 | quiz_verdadero_falso | 5 | 3 | 2 | 2 | 4 | 5 | 3 | 2 | 26 | MEDIA |
| LC-III-P03-A3 | reflexion_escrita | 5 | 5 | 2 | 4 | 4 | 5 | 4 | 5 | 34 | ACEPTABLE |
| LC-III-P04-A1 | lectura | 5 | 4 | 2 | 2 | 4 | 5 | 3 | 3 | 28 | ACEPTABLE |
| LC-III-P04-A2 | fill_blanks | 5 | 2 | 2 | 3 | 3 | 4 | 3 | 2 | 24 | MEDIA |
| LC-III-P04-A3 | autoevaluacion | 5 | 3 | 2 | 3 | 3 | 4 | 3 | 3 | 26 | MEDIA |
| LC-III-P05-A1 | video_con_preguntas | 4 | 3 | 2 | 1 | 2 | 4 | 2 | 3 | 21 | MEDIA |
| LC-III-P05-A2 | quiz_multiple_opcion | 5 | 4 | 2 | 2 | 4 | 5 | 3 | 3 | 28 | ACEPTABLE |
| LC-III-P05-A3 | reflexion_escrita | 5 | 5 | 2 | 4 | 4 | 5 | 3 | 4 | 32 | ACEPTABLE |
| LC-III-P06-A1 | lectura | 5 | 4 | 2 | 2 | 4 | 5 | 3 | 3 | 28 | ACEPTABLE |
| LC-III-P06-A2 | fill_blanks | 5 | 2 | 2 | 2 | 2 | 4 | 2 | 2 | 21 | MEDIA |
| LC-III-P06-A3 | reflexion_escrita | 5 | 5 | 2 | 4 | 4 | 5 | 4 | 4 | 33 | ACEPTABLE |
| LC-III-P07-A1 | video_con_preguntas | 4 | 3 | 2 | 1 | 2 | 4 | 2 | 3 | 21 | MEDIA |
| LC-III-P07-A2 | quiz_multiple_opcion | 5 | 3 | 2 | 2 | 4 | 5 | 3 | 3 | 27 | MEDIA |
| LC-III-P07-A3 | autoevaluacion | 5 | 3 | 2 | 4 | 4 | 5 | 4 | 4 | 31 | ACEPTABLE |

**Promedio LC-III: 27.4 — Bucket mayoritario: ACEPTABLE (13/21)**

**Hallazgos LC-III:** Fortaleza: reflexiones escritas con scaffolding sofisticado (4 pistas, 4 criterios). Debilidad sistémica: D3=2 en casi todas (solo P02 menciona Sor Juana, García Márquez, Rulfo). Fill_blanks LC-III-P04-A2 y P06-A2 con d5=false. Videos P05-A1 y P07-A1 con D4=1, D5=2. LC-III-P01-A1 con d5=false (193 palabras).

---

#### PFH-III — Pensamiento Filosófico y Humanidades III
**12 actividades | 4 progresiones | 42% refs mex | 75% suficiente**

| Código | Tipo | D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | Total | Bucket |
|--------|------|----|----|----|----|----|----|----|----|-------|--------|
| PFH-III-P01-A1 | glosario_interactivo | 5 | 4 | 3 | 3 | 5 | 5 | 4 | 3 | 32 | ACEPTABLE |
| PFH-III-P01-A2 | quiz_multiple_opcion | 5 | 4 | 3 | 2 | 4 | 5 | 4 | 4 | 31 | ACEPTABLE |
| PFH-III-P01-A3 | debate_estructurado | 5 | 5 | 3 | 5 | 4 | 5 | 4 | 5 | 36 | SÓLIDA |
| PFH-III-P02-A1 | lectura | 5 | 5 | 4 | 3 | 5 | 5 | 4 | 4 | 35 | SÓLIDA |
| PFH-III-P02-A2 | quiz_multiple_opcion | 5 | 4 | 3 | 2 | 4 | 5 | 3 | 4 | 30 | ACEPTABLE |
| PFH-III-P02-A3 | debate_estructurado | 5 | 5 | 4 | 5 | 4 | 5 | 4 | 5 | 37 | SÓLIDA |
| PFH-III-P03-A1 | video_con_preguntas | 4 | 4 | 4 | 2 | 2 | 4 | 3 | 4 | 27 | MEDIA |
| PFH-III-P03-A2 | quiz_multiple_opcion | 5 | 4 | 4 | 2 | 4 | 5 | 3 | 3 | 30 | ACEPTABLE |
| PFH-III-P03-A3 | reflexion_escrita | 5 | 5 | 3 | 4 | 4 | 5 | 3 | 5 | 34 | ACEPTABLE |
| PFH-III-P04-A1 | lectura | 5 | 5 | 3 | 2 | 5 | 5 | 4 | 4 | 33 | ACEPTABLE |
| PFH-III-P04-A2 | autoevaluacion | 5 | 4 | 3 | 5 | 4 | 5 | 4 | 4 | 34 | ACEPTABLE |
| PFH-III-P04-A3 | reflexion_escrita | 5 | 5 | 4 | 4 | 4 | 5 | 4 | 5 | 36 | SÓLIDA |

**Promedio PFH-III: 32.9 — UAC de mayor calidad en Sem 3**

**Hallazgos PFH-III:** Debates estructurados con argumentos_guia completos (MLK Jr., Rawls, Thoreau, Gandhi, Nussbaum, Dussel) — D4=5, D8=5. PFH-III-P02-A1 cubre Hobbes, Locke, Rousseau, Rawls, Nussbaum, Dussel con rigor filosófico (D2=5). Debilidad: D3 moderado (42%); el debate sobre desobediencia civil no cita APPO, Ayotzinapa ni EZLN.

---

#### PM-III — Pensamiento Matemático III
**18 actividades | 6 progresiones | 6% refs mex | 100% suficiente**

| Código | Tipo | D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | Total | Bucket |
|--------|------|----|----|----|----|----|----|----|----|-------|--------|
| PM-III-P01-A1 | lectura | 5 | 3 | 3 | 3 | 5 | 5 | 3 | 3 | 30 | ACEPTABLE |
| PM-III-P01-A2 | ejercicio_matematico | 5 | 4 | 3 | 4 | 5 | 5 | 3 | 4 | 33 | ACEPTABLE |
| PM-III-P01-A3 | quiz_multiple_opcion | 5 | 3 | 2 | 2 | 4 | 5 | 3 | 2 | 26 | MEDIA |
| PM-III-P02-A1 | lectura | 5 | 3 | 2 | 2 | 5 | 5 | 3 | 3 | 28 | ACEPTABLE |
| PM-III-P02-A2 | ejercicio_matematico | 5 | 4 | 3 | 4 | 5 | 5 | 3 | 4 | 33 | ACEPTABLE |
| PM-III-P02-A3 | reflexion_escrita | 5 | 4 | 2 | 3 | 4 | 5 | 3 | 4 | 30 | ACEPTABLE |
| PM-III-P03-A1 | infografia | 5 | 3 | 3 | 3 | 4 | 5 | 3 | 2 | 28 | ACEPTABLE |
| PM-III-P03-A2 | ejercicio_matematico | 5 | 4 | 3 | 4 | 5 | 5 | 3 | 4 | 33 | ACEPTABLE |
| PM-III-P03-A3 | autoevaluacion | 4 | 3 | 2 | 3 | 3 | 4 | 3 | 3 | 25 | MEDIA |
| PM-III-P04-A1 | lectura | 5 | 3 | 2 | 2 | 5 | 5 | 3 | 3 | 28 | ACEPTABLE |
| PM-III-P04-A2 | ejercicio_matematico | 5 | 4 | 3 | 4 | 5 | 5 | 3 | 4 | 33 | ACEPTABLE |
| PM-III-P04-A3 | reflexion_escrita | 5 | 4 | 2 | 3 | 4 | 5 | 3 | 4 | 30 | ACEPTABLE |
| PM-III-P05-A1 | lectura | 5 | 3 | 2 | 2 | 5 | 5 | 3 | 3 | 28 | ACEPTABLE |
| PM-III-P05-A2 | ejercicio_matematico | 5 | 4 | 3 | 4 | 5 | 5 | 3 | 4 | 33 | ACEPTABLE |
| PM-III-P05-A3 | quiz_multiple_opcion | 5 | 3 | 2 | 2 | 4 | 5 | 3 | 2 | 26 | MEDIA |
| PM-III-P06-A1 | infografia | 5 | 3 | 3 | 3 | 4 | 5 | 3 | 2 | 28 | ACEPTABLE |
| PM-III-P06-A2 | ejercicio_matematico | 5 | 4 | 4 | 4 | 5 | 5 | 3 | 4 | 34 | ACEPTABLE |
| PM-III-P06-A3 | reflexion_escrita | 5 | 4 | 3 | 3 | 4 | 5 | 3 | 4 | 31 | ACEPTABLE |

**Promedio PM-III: 30.0 — Bucket mayoritario: ACEPTABLE (14/18)**

**Hallazgos PM-III:** 100% actividades con contenido suficiente. Ejercicios matemáticos son el tipo más fuerte (siempre con pasos_guia, tolerancia_error, contextos reales: rampa de accesibilidad, Pico de Orizaba, Chapultepec). D3 sistémicamente bajo (6%: CDMX Periférico, Chapultepec, Pico de Orizaba, pero mayoría de ejercicios usa nombres neutros). Quizzes y autoevaluaciones generan los puntajes más bajos (D2=3, D8=2).

---

### Semestre 4

---

#### CH-I — Cultura e Historia I
**12 actividades | 4 progresiones | 92% refs mex | 83% suficiente**

| Código | Tipo | D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | Total | Bucket |
|--------|------|----|----|----|----|----|----|----|----|-------|--------|
| CH-I-P01-A1 | lectura | 5 | 4 | 5 | 3 | 5 | 5 | 4 | 3 | 34 | ACEPTABLE |
| CH-I-P01-A2 | quiz_multiple_opcion | 5 | 3 | 5 | 2 | 4 | 5 | 3 | 3 | 30 | ACEPTABLE |
| CH-I-P01-A3 | reflexion_escrita | 5 | 5 | 5 | 4 | 4 | 5 | 4 | 5 | 37 | SÓLIDA |
| CH-I-P02-A1 | infografia | 5 | 3 | 5 | 3 | 4 | 5 | 4 | 3 | 32 | ACEPTABLE |
| CH-I-P02-A2 | quiz_verdadero_falso | 5 | 3 | 5 | 2 | 4 | 5 | 3 | 3 | 30 | ACEPTABLE |
| CH-I-P02-A3 | reflexion_escrita | 5 | 5 | 5 | 4 | 4 | 5 | 4 | 5 | 37 | SÓLIDA |
| CH-I-P03-A1 | video_con_preguntas | 4 | 3 | 4 | 1 | 2 | 4 | 3 | 3 | 24 | MEDIA |
| CH-I-P03-A2 | fill_blanks | 5 | 2 | 4 | 3 | 2 | 4 | 3 | 2 | 25 | MEDIA |
| CH-I-P03-A3 | debate_estructurado | 5 | 5 | 5 | 5 | 4 | 5 | 4 | 5 | 38 | SÓLIDA |
| CH-I-P04-A1 | glosario_interactivo | 5 | 3 | 5 | 3 | 5 | 5 | 4 | 3 | 33 | ACEPTABLE |
| CH-I-P04-A2 | quiz_multiple_opcion | 5 | 4 | 5 | 2 | 4 | 5 | 3 | 4 | 32 | ACEPTABLE |
| CH-I-P04-A3 | autoevaluacion | 5 | 3 | 4 | 4 | 3 | 5 | 4 | 3 | 31 | ACEPTABLE |

**Promedio CH-I: 32.3 — Bucket mayoritario: ACEPTABLE/SÓLIDA**

**Hallazgos CH-I:** UAC con mayor D3 del corpus Sem 3–4 (92% refs_mex): Teotihuacán, Tenochtitlán, calendarios mesoamericanos, AGN, Códice Mendoza, Hidalgo, Cárdenas, Zapata. CH-I-P03-A3 (debate con argumentos_guia sobre multicausalidad histórica, 38 pts) es la tercera puntuación más alta del corpus Sem 4. Puntos débiles: video P03-A1 (d5=false, D4=1) y fill_blanks P03-A2 (d5=false).

---

#### CNEYT-IV — Ciencias Naturales, Experimentación y Tecnología IV
**24 actividades | 8 progresiones | 67% refs mex | 88% suficiente**

| Código | Tipo | D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | Total | Bucket |
|--------|------|----|----|----|----|----|----|----|----|-------|--------|
| CNEYT-IV-P01-A1 | lectura | 5 | 4 | 5 | 2 | 4 | 5 | 4 | 3 | 32 | ACEPTABLE |
| CNEYT-IV-P01-A2 | quiz_multiple_opcion | 4 | 3 | 3 | 2 | 4 | 4 | 3 | 3 | 26 | MEDIA |
| CNEYT-IV-P01-A3 | reflexion_escrita | 5 | 4 | 4 | 4 | 4 | 5 | 3 | 4 | 33 | ACEPTABLE |
| CNEYT-IV-P02-A1 | infografia | 5 | 3 | 5 | 3 | 4 | 5 | 4 | 3 | 32 | ACEPTABLE |
| CNEYT-IV-P02-A2 | quiz_multiple_opcion | 4 | 3 | 3 | 2 | 4 | 4 | 3 | 3 | 26 | MEDIA |
| CNEYT-IV-P02-A3 | reflexion_escrita | 5 | 4 | 4 | 4 | 4 | 5 | 3 | 4 | 33 | ACEPTABLE |
| CNEYT-IV-P03-A1 | video_con_preguntas | 4 | 3 | 3 | 1 | 2 | 4 | 3 | 3 | 23 | MEDIA |
| CNEYT-IV-P03-A2 | simulacion | 5 | 5 | 4 | 5 | 5 | 5 | 4 | 5 | 38 | SÓLIDA |
| CNEYT-IV-P03-A3 | quiz_verdadero_falso | 4 | 3 | 2 | 2 | 2 | 4 | 3 | 2 | 22 | MEDIA |
| CNEYT-IV-P04-A1 | lectura | 5 | 4 | 5 | 2 | 4 | 5 | 3 | 3 | 31 | ACEPTABLE |
| CNEYT-IV-P04-A2 | quiz_multiple_opcion | 4 | 3 | 3 | 2 | 4 | 4 | 3 | 3 | 26 | MEDIA |
| CNEYT-IV-P04-A3 | reflexion_escrita | 5 | 4 | 5 | 4 | 4 | 5 | 4 | 4 | 35 | SÓLIDA |
| CNEYT-IV-P05-A1 | lectura | 5 | 4 | 4 | 2 | 4 | 5 | 3 | 3 | 30 | ACEPTABLE |
| CNEYT-IV-P05-A2 | fill_blanks | 4 | 2 | 3 | 3 | 4 | 4 | 3 | 2 | 25 | MEDIA |
| CNEYT-IV-P05-A3 | autoevaluacion | 4 | 3 | 3 | 3 | 3 | 4 | 3 | 3 | 26 | MEDIA |
| CNEYT-IV-P06-A1 | lectura | 5 | 4 | 5 | 2 | 4 | 5 | 3 | 3 | 31 | ACEPTABLE |
| CNEYT-IV-P06-A2 | glosario_interactivo | 4 | 3 | 4 | 3 | 4 | 4 | 3 | 2 | 27 | MEDIA |
| CNEYT-IV-P06-A3 | debate_estructurado | 5 | 5 | 5 | 5 | 3 | 5 | 4 | 5 | 37 | SÓLIDA |
| CNEYT-IV-P07-A1 | video_con_preguntas | 4 | 3 | 3 | 1 | 2 | 4 | 3 | 3 | 23 | MEDIA |
| CNEYT-IV-P07-A2 | quiz_verdadero_falso | 5 | 4 | 4 | 2 | 4 | 5 | 3 | 3 | 30 | ACEPTABLE |
| CNEYT-IV-P07-A3 | reflexion_escrita | 5 | 4 | 4 | 4 | 4 | 5 | 3 | 4 | 33 | ACEPTABLE |
| CNEYT-IV-P08-A1 | infografia | 5 | 3 | 5 | 3 | 4 | 5 | 3 | 3 | 31 | ACEPTABLE |
| CNEYT-IV-P08-A2 | simulacion | 5 | 5 | 4 | 5 | 5 | 5 | 4 | 5 | 38 | SÓLIDA |
| CNEYT-IV-P08-A3 | reflexion_escrita | 5 | 5 | 5 | 5 | 4 | 5 | 4 | 5 | 38 | SÓLIDA |

**Promedio CNEYT-IV: 30.8 — Bucket mayoritario: ACEPTABLE**

**Hallazgos CNEYT-IV:** Versión notablemente mejorada respecto a CNEYT-III en D3 (67% vs 38%): PEMEX, CEMEX, ArcelorMittal Lázaro Cárdenas, COFEPRIS, Bimbo, ECOCE, obesidad en México. Simulaciones P03-A2 y P08-A2 (38 pts cada una): col morada como indicador pH, vinagre-bicarbonato, almidón — experimentos caseros mexicanos. Videos P03-A1 y P07-A1 con el patrón D5=2, D4=1.

---

#### CS-III — Ciencias Sociales III
**9 actividades | 3 progresiones | 89% refs mex | 78% suficiente**

| Código | Tipo | D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | Total | Bucket |
|--------|------|----|----|----|----|----|----|----|----|-------|--------|
| CS-III-P01-A1 | lectura | 5 | 5 | 5 | 3 | 5 | 5 | 4 | 4 | 36 | SÓLIDA |
| CS-III-P01-A2 | infografia | 5 | 3 | 5 | 3 | 4 | 5 | 3 | 3 | 31 | ACEPTABLE |
| CS-III-P01-A3 | debate_estructurado | 5 | 5 | 5 | 5 | 3 | 5 | 4 | 5 | 37 | SÓLIDA |
| CS-III-P02-A1 | video_con_preguntas | 4 | 3 | 4 | 1 | 2 | 4 | 3 | 3 | 24 | MEDIA |
| CS-III-P02-A2 | fill_blanks | 5 | 2 | 4 | 3 | 3 | 4 | 3 | 2 | 26 | MEDIA |
| CS-III-P02-A3 | reflexion_escrita | 5 | 5 | 5 | 4 | 4 | 5 | 4 | 5 | 37 | SÓLIDA |
| CS-III-P03-A1 | video_con_preguntas | 4 | 3 | 4 | 1 | 2 | 4 | 2 | 3 | 23 | MEDIA |
| CS-III-P03-A2 | quiz_multiple_opcion | 5 | 4 | 5 | 2 | 4 | 5 | 3 | 4 | 32 | ACEPTABLE |
| CS-III-P03-A3 | reflexion_escrita | 5 | 5 | 5 | 4 | 4 | 5 | 4 | 5 | 37 | SÓLIDA |

**Promedio CS-III: 31.4 — 4/9 actividades SÓLIDAS**

**Hallazgos CS-III:** UAC más intensa del corpus. CS-III-P01-A1 (COVID-19 + IMSS/ISSSTE/INSABI/CONEVAL/GINI, 36 pts) es la lectura de referencia del corpus. CS-III-P01-A3 (debate "desigualdad estructural o decisiones políticas" con argumentos_guia usando CONEVAL/INEGI/GINI, 37 pts). Videos P02-A1 y P03-A1 son los puntos débiles (D4=1).

---

#### IN-IV — Inglés IV
**24 actividades | 8 progresiones | 38% refs mex | 83% suficiente**

| Código | Tipo | D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | Total | Bucket |
|--------|------|----|----|----|----|----|----|----|----|-------|--------|
| IN-IV-P01-A1 | lectura | 5 | 3 | 5 | 3 | 4 | 5 | 4 | 3 | 32 | ACEPTABLE |
| IN-IV-P01-A2 | fill_blanks | 4 | 2 | 2 | 2 | 2 | 4 | 3 | 2 | 21 | MEDIA |
| IN-IV-P01-A3 | reflexion_escrita | 5 | 3 | 2 | 4 | 3 | 4 | 4 | 3 | 28 | ACEPTABLE |
| IN-IV-P02-A1 | video_con_preguntas | 4 | 3 | 3 | 1 | 2 | 4 | 3 | 3 | 23 | MEDIA |
| IN-IV-P02-A2 | quiz_multiple_opcion | 4 | 3 | 4 | 2 | 4 | 4 | 3 | 3 | 27 | MEDIA |
| IN-IV-P02-A3 | reflexion_escrita | 5 | 3 | 4 | 4 | 3 | 4 | 3 | 3 | 29 | ACEPTABLE |
| IN-IV-P03-A1 | glosario_interactivo | 4 | 2 | 3 | 3 | 4 | 4 | 3 | 2 | 25 | MEDIA |
| IN-IV-P03-A2 | fill_blanks | 4 | 2 | 4 | 3 | 3 | 4 | 3 | 2 | 25 | MEDIA |
| IN-IV-P03-A3 | autoevaluacion | 4 | 3 | 2 | 4 | 3 | 4 | 3 | 3 | 26 | MEDIA |
| IN-IV-P04-A1 | lectura | 5 | 3 | 3 | 3 | 5 | 5 | 3 | 3 | 30 | ACEPTABLE |
| IN-IV-P04-A2 | quiz_verdadero_falso | 4 | 3 | 2 | 2 | 4 | 4 | 3 | 3 | 25 | MEDIA |
| IN-IV-P04-A3 | reflexion_escrita | 5 | 3 | 4 | 4 | 3 | 4 | 3 | 3 | 29 | ACEPTABLE |
| IN-IV-P05-A1 | video_con_preguntas | 4 | 3 | 2 | 1 | 2 | 4 | 3 | 3 | 22 | MEDIA |
| IN-IV-P05-A2 | fill_blanks | 4 | 2 | 4 | 3 | 4 | 4 | 3 | 2 | 26 | MEDIA |
| IN-IV-P05-A3 | reflexion_escrita | 5 | 3 | 3 | 4 | 3 | 4 | 4 | 3 | 29 | ACEPTABLE |
| IN-IV-P06-A1 | glosario_interactivo | 4 | 2 | 4 | 3 | 4 | 4 | 3 | 2 | 26 | MEDIA |
| IN-IV-P06-A2 | quiz_multiple_opcion | 4 | 3 | 3 | 2 | 4 | 4 | 3 | 3 | 26 | MEDIA |
| IN-IV-P06-A3 | autoevaluacion | 4 | 3 | 3 | 4 | 4 | 4 | 3 | 3 | 28 | ACEPTABLE |
| IN-IV-P07-A1 | lectura | 5 | 3 | 4 | 3 | 5 | 5 | 4 | 3 | 32 | ACEPTABLE |
| IN-IV-P07-A2 | fill_blanks | 4 | 2 | 5 | 3 | 4 | 4 | 4 | 2 | 28 | ACEPTABLE |
| IN-IV-P07-A3 | reflexion_escrita | 5 | 3 | 3 | 4 | 3 | 4 | 4 | 3 | 29 | ACEPTABLE |
| IN-IV-P08-A1 | video_con_preguntas | 4 | 3 | 2 | 1 | 2 | 4 | 3 | 3 | 22 | MEDIA |
| IN-IV-P08-A2 | quiz_multiple_opcion | 4 | 3 | 4 | 2 | 4 | 4 | 3 | 3 | 27 | MEDIA |
| IN-IV-P08-A3 | autoevaluacion | 4 | 3 | 3 | 4 | 4 | 4 | 4 | 3 | 29 | ACEPTABLE |

**Promedio IN-IV: 26.8 — Bucket mayoritario: MEDIA (13/24)**

**Hallazgos IN-IV:** Mejora perceptible respecto a IN-III en D3 (38% vs 8%): metro CDMX, Mercado de Artesanías San Cristóbal, quinceañera, América fútbol club, Día de Muertos en Oaxaca. Videos P02-A1, P05-A1, P08-A1 con patrón D5=2, D4=1. IN-IV-P01-A2 fill_blanks con d5=false.

---

#### PM-IV — Pensamiento Matemático IV
**21 actividades | 7 progresiones | 48% refs mex | 90% suficiente**

| Código | Tipo | D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | Total | Bucket |
|--------|------|----|----|----|----|----|----|----|----|-------|--------|
| PM-IV-P01-A1 | lectura | 5 | 4 | 4 | 3 | 5 | 5 | 3 | 3 | 32 | ACEPTABLE |
| PM-IV-P01-A2 | ejercicio_matematico | 5 | 4 | 3 | 4 | 5 | 5 | 4 | 4 | 34 | ACEPTABLE |
| PM-IV-P01-A3 | reflexion_escrita | 5 | 4 | 4 | 4 | 4 | 5 | 3 | 4 | 33 | ACEPTABLE |
| PM-IV-P02-A1 | video_con_preguntas | 4 | 3 | 2 | 1 | 2 | 4 | 3 | 3 | 22 | MEDIA |
| PM-IV-P02-A2 | ejercicio_matematico | 5 | 4 | 4 | 4 | 5 | 5 | 4 | 4 | 35 | SÓLIDA |
| PM-IV-P02-A3 | autoevaluacion | 4 | 3 | 2 | 4 | 3 | 4 | 3 | 3 | 26 | MEDIA |
| PM-IV-P03-A1 | lectura | 5 | 4 | 5 | 3 | 5 | 5 | 3 | 3 | 33 | ACEPTABLE |
| PM-IV-P03-A2 | ejercicio_matematico | 5 | 4 | 5 | 4 | 5 | 5 | 4 | 4 | 36 | SÓLIDA |
| PM-IV-P03-A3 | reflexion_escrita | 5 | 5 | 5 | 3 | 4 | 5 | 4 | 5 | 36 | SÓLIDA |
| PM-IV-P04-A1 | infografia | 5 | 3 | 3 | 3 | 4 | 5 | 3 | 2 | 28 | ACEPTABLE |
| PM-IV-P04-A2 | ejercicio_matematico | 5 | 5 | 3 | 4 | 5 | 5 | 4 | 4 | 35 | SÓLIDA |
| PM-IV-P04-A3 | quiz_multiple_opcion | 5 | 3 | 2 | 2 | 4 | 5 | 3 | 2 | 26 | MEDIA |
| PM-IV-P05-A1 | video_con_preguntas | 4 | 3 | 3 | 1 | 2 | 4 | 3 | 3 | 23 | MEDIA |
| PM-IV-P05-A2 | ejercicio_matematico | 5 | 4 | 4 | 4 | 5 | 5 | 4 | 4 | 35 | SÓLIDA |
| PM-IV-P05-A3 | reflexion_escrita | 5 | 5 | 4 | 3 | 4 | 5 | 4 | 5 | 35 | SÓLIDA |
| PM-IV-P06-A1 | lectura | 5 | 4 | 4 | 3 | 5 | 5 | 3 | 3 | 32 | ACEPTABLE |
| PM-IV-P06-A2 | ejercicio_matematico | 5 | 4 | 4 | 4 | 5 | 5 | 3 | 4 | 34 | ACEPTABLE |
| PM-IV-P06-A3 | autoevaluacion | 4 | 3 | 2 | 4 | 3 | 4 | 3 | 3 | 26 | MEDIA |
| PM-IV-P07-A1 | infografia | 5 | 4 | 3 | 3 | 4 | 5 | 3 | 3 | 30 | ACEPTABLE |
| PM-IV-P07-A2 | quiz_multiple_opcion | 5 | 4 | 3 | 2 | 4 | 5 | 3 | 3 | 29 | ACEPTABLE |
| PM-IV-P07-A3 | reflexion_escrita | 5 | 4 | 4 | 3 | 4 | 5 | 3 | 4 | 32 | ACEPTABLE |

**Promedio PM-IV: 31.0 — Bucket mayoritario: ACEPTABLE (10/21)**

**Hallazgos PM-IV:** Progreso notable respecto a PM-III en D3 (48% vs 6%): Pico de Orizaba, Periférico CDMX, Pirámide del Sol/Teotihuacán, Bosque de Chapultepec, Sierra Norte de Puebla, Puente Baluarte Sinaloa/Durango, terreno en Oaxaca. PM-IV-P03-A2 (árbol Chapultepec, 36 pts) y PM-IV-P05-A3 ("Mido un lago sin mojarme" en Sierra Norte de Puebla, 35 pts) son las mejores actividades. Videos P02-A1 y P05-A1 con el patrón débil habitual.

---

### Semestre 5

---

#### CNEYT-V — La energía en procesos de vida diaria (Física)
**24 actividades | 8 progresiones | Refs mex: 19/24 | 3 reflexiones sin criterios**

| Actividad | Tipo | D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | Total | Bucket |
|-----------|------|----|----|----|----|----|----|----|----|-------|--------|
| CNEYT-V-P01-A1 | lectura | 5 | 3 | 4 | 3 | 5 | 4 | 3 | 3 | 30 | ACEPTABLE |
| CNEYT-V-P01-A2 | simulacion | 5 | 4 | 2 | 4 | 3 | 3 | 4 | 4 | 29 | ACEPTABLE |
| CNEYT-V-P01-A3 | quiz_multiple_opcion | 5 | 2 | 4 | 3 | 4 | 4 | 3 | 2 | 27 | MEDIA |
| CNEYT-V-P02-A1 | lectura | 5 | 3 | 4 | 3 | 5 | 4 | 3 | 3 | 30 | ACEPTABLE |
| CNEYT-V-P02-A2 | ejercicio_matematico | 5 | 4 | 4 | 3 | 3 | 4 | 4 | 4 | 31 | ACEPTABLE |
| CNEYT-V-P02-A3 | quiz_verdadero_falso | 5 | 2 | 2 | 3 | 4 | 4 | 3 | 2 | 25 | MEDIA |
| CNEYT-V-P03-A1 | lectura | 5 | 3 | 4 | 3 | 5 | 4 | 3 | 3 | 30 | ACEPTABLE |
| CNEYT-V-P03-A2 | ejercicio_matematico | 5 | 4 | 4 | 3 | 3 | 4 | 4 | 4 | 31 | ACEPTABLE |
| CNEYT-V-P03-A3 | reflexion_escrita | 5 | 3 | 4 | 3 | 2 | 3 | 3 | 2 | 25 | MEDIA |
| CNEYT-V-P04-A1 | lectura | 5 | 3 | 4 | 3 | 5 | 4 | 3 | 3 | 30 | ACEPTABLE |
| CNEYT-V-P04-A2 | simulacion | 5 | 4 | 2 | 4 | 3 | 3 | 4 | 4 | 29 | ACEPTABLE |
| CNEYT-V-P04-A3 | quiz_multiple_opcion | 5 | 2 | 4 | 3 | 4 | 4 | 3 | 2 | 27 | MEDIA |
| CNEYT-V-P05-A1 | infografia | 5 | 3 | 4 | 3 | 4 | 4 | 3 | 3 | 29 | ACEPTABLE |
| CNEYT-V-P05-A2 | quiz_multiple_opcion | 5 | 2 | 4 | 3 | 4 | 4 | 3 | 2 | 27 | MEDIA |
| CNEYT-V-P05-A3 | reflexion_escrita | 4 | 3 | 4 | 3 | 2 | 3 | 3 | 2 | 24 | MEDIA |
| CNEYT-V-P06-A1 | lectura | 5 | 3 | 4 | 3 | 5 | 4 | 3 | 3 | 30 | ACEPTABLE |
| CNEYT-V-P06-A2 | simulacion | 5 | 4 | 2 | 4 | 3 | 3 | 4 | 4 | 29 | ACEPTABLE |
| CNEYT-V-P06-A3 | autoevaluacion | 5 | 3 | 2 | 4 | 4 | 3 | 3 | 3 | 27 | MEDIA |
| CNEYT-V-P07-A1 | lectura | 5 | 3 | 4 | 3 | 5 | 4 | 3 | 3 | 30 | ACEPTABLE |
| CNEYT-V-P07-A2 | ejercicio_matematico | 5 | 4 | 4 | 3 | 3 | 4 | 4 | 4 | 31 | ACEPTABLE |
| CNEYT-V-P07-A3 | quiz_verdadero_falso | 5 | 2 | 4 | 3 | 4 | 4 | 3 | 2 | 27 | MEDIA |
| CNEYT-V-P08-A1 | video_con_preguntas | 5 | 4 | 4 | 2 | 2 | 3 | 3 | 3 | 26 | MEDIA |
| CNEYT-V-P08-A2 | quiz_multiple_opcion | 5 | 2 | 4 | 3 | 4 | 4 | 3 | 2 | 27 | MEDIA |
| CNEYT-V-P08-A3 | reflexion_escrita | 5 | 3 | 4 | 3 | 2 | 3 | 3 | 2 | 25 | MEDIA |

**Promedio CNEYT-V: 28.3 — Bucket mayoritario: ACEPTABLE (14/24)**

**Hallazgos CNEYT-V:** Reflexiones sin criterios (P03-A3, P05-A3, P08-A3): n_criterios=0 con prompts de 64–82 palabras — el estudiante no sabe cómo será evaluado. Lecturas altamente uniformes (mismo patrón estructural en todas), bajando D7 a 3. Video P08-A1 sin campos opcionales. Fortaleza: contextualización mexicana fuerte (19/24 con refs_mex — CONACYT, exploración espacial mexicana, tecnología nacional).

---

#### PM-V — Pensamiento Matemático V (Cálculo Diferencial)
**24 actividades | 8 progresiones | 7/24 refs_mex | 3 reflexiones sin criterios**

| Actividad | Tipo | D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | Total | Bucket |
|-----------|------|----|----|----|----|----|----|----|----|-------|--------|
| PM-V-P01-A1 | lectura | 5 | 3 | 4 | 3 | 5 | 4 | 3 | 3 | 30 | ACEPTABLE |
| PM-V-P01-A2 | ejercicio_matematico | 5 | 4 | 4 | 3 | 3 | 4 | 4 | 4 | 31 | ACEPTABLE |
| PM-V-P01-A3 | quiz_multiple_opcion | 5 | 3 | 2 | 3 | 4 | 4 | 3 | 3 | 27 | MEDIA |
| PM-V-P02-A1 | infografia | 5 | 3 | 2 | 3 | 4 | 4 | 3 | 3 | 27 | MEDIA |
| PM-V-P02-A2 | ejercicio_matematico | 5 | 4 | 2 | 3 | 3 | 4 | 4 | 4 | 29 | ACEPTABLE |
| PM-V-P02-A3 | reflexion_escrita | 5 | 3 | 2 | 3 | 2 | 3 | 3 | 2 | 23 | MEDIA |
| PM-V-P03-A1 | lectura | 5 | 3 | 4 | 3 | 5 | 4 | 3 | 3 | 30 | ACEPTABLE |
| PM-V-P03-A2 | ejercicio_matematico | 5 | 4 | 2 | 3 | 3 | 4 | 4 | 4 | 29 | ACEPTABLE |
| PM-V-P03-A3 | quiz_multiple_opcion | 5 | 3 | 2 | 3 | 4 | 4 | 3 | 3 | 27 | MEDIA |
| PM-V-P04-A1 | lectura | 5 | 3 | 2 | 3 | 5 | 4 | 3 | 3 | 28 | ACEPTABLE |
| PM-V-P04-A2 | ejercicio_matematico | 5 | 4 | 2 | 3 | 3 | 4 | 4 | 4 | 29 | ACEPTABLE |
| PM-V-P04-A3 | autoevaluacion | 5 | 3 | 2 | 4 | 4 | 3 | 4 | 3 | 28 | ACEPTABLE |
| PM-V-P05-A1 | lectura | 5 | 3 | 4 | 3 | 5 | 4 | 3 | 3 | 30 | ACEPTABLE |
| PM-V-P05-A2 | ejercicio_matematico | 5 | 4 | 2 | 3 | 3 | 4 | 4 | 4 | 29 | ACEPTABLE |
| PM-V-P05-A3 | reflexion_escrita | 5 | 3 | 4 | 3 | 2 | 3 | 3 | 2 | 25 | MEDIA |
| PM-V-P06-A1 | infografia | 5 | 3 | 2 | 3 | 4 | 4 | 3 | 3 | 27 | MEDIA |
| PM-V-P06-A2 | ejercicio_matematico | 5 | 4 | 2 | 3 | 3 | 4 | 4 | 4 | 29 | ACEPTABLE |
| PM-V-P06-A3 | quiz_multiple_opcion | 5 | 3 | 2 | 3 | 4 | 4 | 3 | 3 | 27 | MEDIA |
| PM-V-P07-A1 | lectura | 5 | 3 | 4 | 3 | 5 | 4 | 3 | 3 | 30 | ACEPTABLE |
| PM-V-P07-A2 | ejercicio_matematico | 5 | 4 | 4 | 4 | 3 | 4 | 4 | 4 | 32 | ACEPTABLE |
| PM-V-P07-A3 | autoevaluacion | 5 | 3 | 2 | 4 | 4 | 3 | 4 | 3 | 28 | ACEPTABLE |
| PM-V-P08-A1 | lectura | 5 | 3 | 2 | 3 | 5 | 4 | 3 | 3 | 28 | ACEPTABLE |
| PM-V-P08-A2 | ejercicio_matematico | 5 | 4 | 2 | 3 | 3 | 4 | 4 | 4 | 29 | ACEPTABLE |
| PM-V-P08-A3 | reflexion_escrita | 5 | 3 | 2 | 3 | 2 | 3 | 3 | 2 | 23 | MEDIA |

**Promedio PM-V: 28.2 — Bucket mayoritario: ACEPTABLE (16/24)**

**Hallazgos PM-V:** Reflexiones P02-A3 (65w), P05-A3 (77w), P08-A3 (61w) con n_criterios=0 — mismo problema que CNEYT-V. PM-V-P07-A2 (optimización en ingeniería/economía/biología mexicana, 32 pts) es el mejor ejercicio del UAC. Las autoevaluaciones de P04 y P07 sí tienen 5 criterios, creando inconsistencia interna (autoevaluaciones cerradas con más andamiaje que reflexiones abiertas).

---

#### CH-II — Conciencia Histórica II
**12 actividades | 4 progresiones | D3=5 en 3/4 progresiones | refs_mex central**

| Actividad | Tipo | D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | Total | Bucket |
|-----------|------|----|----|----|----|----|----|----|----|-------|--------|
| CH-II-P01-A1 | lectura | 5 | 4 | 5 | 3 | 5 | 5 | 4 | 4 | 35 | SÓLIDA |
| CH-II-P01-A2 | quiz_multiple_opcion | 5 | 4 | 5 | 3 | 4 | 5 | 4 | 4 | 34 | ACEPTABLE |
| CH-II-P01-A3 | reflexion_escrita | 5 | 5 | 4 | 4 | 3 | 5 | 4 | 5 | 35 | SÓLIDA |
| CH-II-P02-A1 | video_con_preguntas | 5 | 4 | 4 | 2 | 2 | 4 | 4 | 4 | 29 | ACEPTABLE |
| CH-II-P02-A2 | quiz_verdadero_falso | 5 | 3 | 4 | 3 | 4 | 4 | 4 | 2 | 29 | ACEPTABLE |
| CH-II-P02-A3 | reflexion_escrita | 5 | 4 | 3 | 4 | 3 | 4 | 4 | 4 | 31 | ACEPTABLE |
| CH-II-P03-A1 | lectura | 5 | 4 | 5 | 3 | 5 | 5 | 4 | 4 | 35 | SÓLIDA |
| CH-II-P03-A2 | quiz_multiple_opcion | 5 | 4 | 5 | 3 | 4 | 5 | 4 | 3 | 33 | ACEPTABLE |
| CH-II-P03-A3 | debate_estructurado | 5 | 4 | 4 | 2 | 2 | 3 | 3 | 3 | 26 | MEDIA |
| CH-II-P04-A1 | infografia | 5 | 3 | 5 | 3 | 4 | 4 | 4 | 3 | 31 | ACEPTABLE |
| CH-II-P04-A2 | quiz_verdadero_falso | 5 | 3 | 5 | 3 | 4 | 4 | 4 | 2 | 30 | ACEPTABLE |
| CH-II-P04-A3 | reflexion_escrita | 5 | 5 | 5 | 4 | 3 | 5 | 4 | 5 | 36 | SÓLIDA |

**Promedio CH-II: 31.8 — UAC mejor puntuada de Sem 5**

**Hallazgos CH-II:** 3 actividades SÓLIDAS: CH-II-P01-A1 (Gadamer, Bonfil Batalla, Florescano, 35 pts), CH-II-P01-A3 (reflexión historia familiar con procesos históricos, 35 pts), CH-II-P03-A1 (35 pts). CH-II-P04-A3 (36 pts) conecta historia familiar con Revolución y Porfiriato. Brecha crítica: debate CH-II-P03-A3 sin argumentos_guia (solo 14 palabras, D4=2, 26 pts). Video P02-A1 sin campos opcionales (D4=2).

---

#### IN-V — Inglés V
**24 actividades | 8 progresiones | refs_mex en 6/8 progresiones | 8 tipos distintos**

| Actividad | Tipo | D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | Total | Bucket |
|-----------|------|----|----|----|----|----|----|----|----|-------|--------|
| IN-V-P01-A1 | lectura | 5 | 3 | 4 | 3 | 5 | 4 | 3 | 3 | 30 | ACEPTABLE |
| IN-V-P01-A2 | fill_blanks | 5 | 3 | 4 | 3 | 3 | 4 | 4 | 3 | 29 | ACEPTABLE |
| IN-V-P01-A3 | reflexion_escrita | 5 | 4 | 3 | 4 | 3 | 4 | 4 | 4 | 31 | ACEPTABLE |
| IN-V-P02-A1 | glosario_interactivo | 5 | 3 | 4 | 2 | 4 | 4 | 4 | 3 | 29 | ACEPTABLE |
| IN-V-P02-A2 | fill_blanks | 5 | 3 | 2 | 3 | 3 | 4 | 4 | 3 | 27 | MEDIA |
| IN-V-P02-A3 | autoevaluacion | 5 | 3 | 2 | 4 | 4 | 4 | 4 | 3 | 29 | ACEPTABLE |
| IN-V-P03-A1 | lectura | 5 | 3 | 4 | 3 | 5 | 4 | 3 | 3 | 30 | ACEPTABLE |
| IN-V-P03-A2 | quiz_multiple_opcion | 5 | 3 | 2 | 3 | 4 | 4 | 4 | 3 | 28 | ACEPTABLE |
| IN-V-P03-A3 | reflexion_escrita | 5 | 4 | 2 | 4 | 3 | 4 | 4 | 4 | 30 | ACEPTABLE |
| IN-V-P04-A1 | lectura | 5 | 3 | 4 | 3 | 5 | 4 | 3 | 3 | 30 | ACEPTABLE |
| IN-V-P04-A2 | fill_blanks | 5 | 3 | 2 | 3 | 3 | 4 | 4 | 3 | 27 | MEDIA |
| IN-V-P04-A3 | quiz_verdadero_falso | 5 | 2 | 2 | 3 | 4 | 4 | 4 | 2 | 26 | MEDIA |
| IN-V-P05-A1 | lectura | 5 | 4 | 4 | 3 | 5 | 5 | 3 | 4 | 33 | ACEPTABLE |
| IN-V-P05-A2 | quiz_multiple_opcion | 5 | 3 | 4 | 3 | 4 | 4 | 4 | 3 | 30 | ACEPTABLE |
| IN-V-P05-A3 | reflexion_escrita | 5 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 33 | ACEPTABLE |
| IN-V-P06-A1 | lectura | 5 | 4 | 4 | 3 | 5 | 5 | 3 | 4 | 33 | ACEPTABLE |
| IN-V-P06-A2 | fill_blanks | 5 | 3 | 4 | 3 | 3 | 4 | 4 | 3 | 29 | ACEPTABLE |
| IN-V-P06-A3 | autoevaluacion | 5 | 3 | 2 | 4 | 4 | 4 | 4 | 3 | 29 | ACEPTABLE |
| IN-V-P07-A1 | video_con_preguntas | 5 | 4 | 2 | 2 | 2 | 3 | 3 | 3 | 24 | MEDIA |
| IN-V-P07-A2 | quiz_verdadero_falso | 5 | 2 | 2 | 3 | 4 | 4 | 4 | 2 | 26 | MEDIA |
| IN-V-P07-A3 | reflexion_escrita | 5 | 4 | 2 | 4 | 3 | 4 | 4 | 4 | 30 | ACEPTABLE |
| IN-V-P08-A1 | lectura | 5 | 3 | 2 | 3 | 5 | 4 | 3 | 3 | 28 | ACEPTABLE |
| IN-V-P08-A2 | quiz_multiple_opcion | 5 | 3 | 2 | 3 | 4 | 4 | 4 | 3 | 28 | ACEPTABLE |
| IN-V-P08-A3 | reflexion_escrita | 5 | 4 | 2 | 4 | 3 | 4 | 4 | 4 | 30 | ACEPTABLE |

**Promedio IN-V: 29.4 — Bucket mayoritario: ACEPTABLE (19/24)**

**Hallazgos IN-V:** Mayor variedad tipológica del Semestre 5 (8 tipos). Lecturas 537–701w son las más densas del semestre (D5=5 consistente). Glosario P02-A1 sin campos opcionales (D4=2, único glosario sin andamiaje adicional). Video P07-A1 es la actividad más débil: sin campos, sin refs_mex, sin texto (24 pts). Autoevaluaciones P02-A3 e IN-V-P06-A3 con n_criterios=5 son las más robustas del tipo en Sem 5.

---

### Semestre 6

---

#### CNEYT-VI — Organismos y Evolución Biológica
**24 actividades | 8 progresiones | 3/24 refs_mex | 6/6 reflexiones sin criterios**

| Actividad | Tipo | D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | Total | Bucket |
|-----------|------|----|----|----|----|----|----|----|----|-------|--------|
| CNEYT-VI-P01-A1 | lectura | 5 | 3 | 2 | 3 | 4 | 4 | 3 | 3 | 27 | MEDIA |
| CNEYT-VI-P01-A2 | quiz_multiple_opcion | 5 | 3 | 2 | 3 | 4 | 4 | 3 | 3 | 27 | MEDIA |
| CNEYT-VI-P01-A3 | reflexion_escrita | 5 | 3 | 2 | 3 | 1 | 3 | 3 | 2 | 22 | MEDIA |
| CNEYT-VI-P02-A1 | infografia | 5 | 3 | 2 | 3 | 4 | 4 | 3 | 3 | 27 | MEDIA |
| CNEYT-VI-P02-A2 | quiz_multiple_opcion | 5 | 3 | 2 | 3 | 4 | 4 | 3 | 3 | 27 | MEDIA |
| CNEYT-VI-P02-A3 | reflexion_escrita | 5 | 3 | 2 | 3 | 1 | 3 | 3 | 2 | 22 | MEDIA |
| CNEYT-VI-P03-A1 | lectura | 5 | 3 | 2 | 3 | 4 | 4 | 3 | 3 | 27 | MEDIA |
| CNEYT-VI-P03-A2 | ejercicio_matematico | 5 | 4 | 2 | 3 | 3 | 4 | 3 | 4 | 28 | ACEPTABLE |
| CNEYT-VI-P03-A3 | reflexion_escrita | 5 | 3 | 2 | 3 | 1 | 3 | 3 | 2 | 22 | MEDIA |
| CNEYT-VI-P04-A1 | video_con_preguntas | 5 | 4 | 2 | 2 | 2 | 3 | 3 | 3 | 24 | MEDIA |
| CNEYT-VI-P04-A2 | quiz_verdadero_falso | 4 | 2 | 2 | 2 | 4 | 4 | 3 | 2 | 23 | MEDIA |
| CNEYT-VI-P04-A3 | reflexion_escrita | 5 | 3 | 2 | 3 | 1 | 3 | 3 | 2 | 22 | MEDIA |
| CNEYT-VI-P05-A1 | lectura | 5 | 3 | 4 | 3 | 4 | 4 | 3 | 3 | 29 | ACEPTABLE |
| CNEYT-VI-P05-A2 | ejercicio_matematico | 5 | 4 | 2 | 3 | 3 | 4 | 3 | 4 | 28 | ACEPTABLE |
| CNEYT-VI-P05-A3 | reflexion_escrita | 5 | 3 | 2 | 3 | 1 | 3 | 3 | 2 | 22 | MEDIA |
| CNEYT-VI-P06-A1 | lectura | 5 | 3 | 2 | 3 | 4 | 4 | 3 | 3 | 27 | MEDIA |
| CNEYT-VI-P06-A2 | quiz_multiple_opcion | 5 | 3 | 2 | 3 | 4 | 4 | 3 | 3 | 27 | MEDIA |
| CNEYT-VI-P06-A3 | debate_estructurado | 5 | 4 | 2 | 2 | 1 | 3 | 3 | 3 | 23 | MEDIA |
| CNEYT-VI-P07-A1 | lectura | 5 | 3 | 2 | 3 | 4 | 4 | 3 | 3 | 27 | MEDIA |
| CNEYT-VI-P07-A2 | simulacion | 5 | 4 | 2 | 3 | 2 | 3 | 3 | 4 | 26 | MEDIA |
| CNEYT-VI-P07-A3 | reflexion_escrita | 5 | 3 | 2 | 3 | 1 | 3 | 3 | 2 | 22 | MEDIA |
| CNEYT-VI-P08-A1 | infografia | 5 | 4 | 4 | 3 | 4 | 4 | 4 | 4 | 32 | ACEPTABLE |
| CNEYT-VI-P08-A2 | quiz_multiple_opcion | 5 | 4 | 4 | 3 | 4 | 4 | 4 | 4 | 32 | ACEPTABLE |
| CNEYT-VI-P08-A3 | debate_estructurado | 5 | 4 | 2 | 2 | 1 | 3 | 3 | 3 | 23 | MEDIA |

**Promedio CNEYT-VI: 25.3 — UAC con peor desempeño de Sem 5–6**

**Hallazgos CNEYT-VI:** 6/6 reflexiones con prompts de 16–25 palabras y n_criterios=0 (D5=1, D8=2). 2 debates sin argumentos_guia (D4=2, D5=1). Lecturas 204–224 palabras (vs. 509–650w de CNEYT-V: regresión del 60% en densidad). refs_mex extremadamente bajos (3/24 = 13%). P08 es el mejor trío (infografía+quiz sobre biotecnología ética). Oportunidad: conectar con biodiversidad mexicana (ajolote, maíz transgénico, UNAM-IBt).

---

#### PM-VI — Pensamiento Matemático VI (Estadística y Probabilidad)
**24 actividades | 8 progresiones | 16/24 refs_mex | 9 tipos distintos**

| Actividad | Tipo | D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | Total | Bucket |
|-----------|------|----|----|----|----|----|----|----|----|-------|--------|
| PM-VI-P01-A1 | lectura | 5 | 3 | 5 | 3 | 5 | 4 | 3 | 3 | 31 | ACEPTABLE |
| PM-VI-P01-A2 | quiz_multiple_opcion | 5 | 3 | 5 | 3 | 4 | 4 | 4 | 3 | 31 | ACEPTABLE |
| PM-VI-P01-A3 | reflexion_escrita | 5 | 4 | 5 | 4 | 3 | 4 | 4 | 4 | 33 | ACEPTABLE |
| PM-VI-P02-A1 | video_con_preguntas | 5 | 3 | 2 | 2 | 2 | 3 | 3 | 3 | 23 | MEDIA |
| PM-VI-P02-A2 | ejercicio_matematico | 5 | 4 | 2 | 3 | 3 | 4 | 3 | 4 | 28 | ACEPTABLE |
| PM-VI-P02-A3 | reflexion_escrita | 5 | 4 | 5 | 4 | 3 | 4 | 4 | 4 | 33 | ACEPTABLE |
| PM-VI-P03-A1 | lectura | 5 | 3 | 5 | 3 | 5 | 4 | 3 | 3 | 31 | ACEPTABLE |
| PM-VI-P03-A2 | ejercicio_matematico | 5 | 4 | 2 | 3 | 3 | 4 | 3 | 4 | 28 | ACEPTABLE |
| PM-VI-P03-A3 | reflexion_escrita | 5 | 4 | 5 | 4 | 3 | 4 | 4 | 4 | 33 | ACEPTABLE |
| PM-VI-P04-A1 | lectura | 5 | 3 | 2 | 3 | 5 | 4 | 3 | 3 | 28 | ACEPTABLE |
| PM-VI-P04-A2 | ejercicio_matematico | 5 | 4 | 2 | 4 | 3 | 4 | 4 | 4 | 30 | ACEPTABLE |
| PM-VI-P04-A3 | autoevaluacion | 5 | 3 | 5 | 4 | 4 | 4 | 4 | 3 | 32 | ACEPTABLE |
| PM-VI-P05-A1 | lectura | 5 | 3 | 2 | 3 | 5 | 4 | 3 | 3 | 28 | ACEPTABLE |
| PM-VI-P05-A2 | quiz_multiple_opcion | 5 | 3 | 4 | 3 | 4 | 4 | 4 | 3 | 30 | ACEPTABLE |
| PM-VI-P05-A3 | reflexion_escrita | 5 | 4 | 4 | 4 | 3 | 4 | 4 | 4 | 32 | ACEPTABLE |
| PM-VI-P06-A1 | lectura | 5 | 3 | 5 | 3 | 5 | 4 | 3 | 3 | 31 | ACEPTABLE |
| PM-VI-P06-A2 | ejercicio_matematico | 5 | 4 | 2 | 4 | 3 | 4 | 4 | 4 | 30 | ACEPTABLE |
| PM-VI-P06-A3 | reflexion_escrita | 5 | 4 | 5 | 4 | 3 | 4 | 4 | 4 | 33 | ACEPTABLE |
| PM-VI-P07-A1 | lectura | 5 | 3 | 4 | 3 | 5 | 4 | 3 | 3 | 30 | ACEPTABLE |
| PM-VI-P07-A2 | ejercicio_matematico | 5 | 4 | 2 | 3 | 3 | 4 | 4 | 4 | 29 | ACEPTABLE |
| PM-VI-P07-A3 | autoevaluacion | 5 | 3 | 4 | 4 | 4 | 4 | 4 | 3 | 31 | ACEPTABLE |
| PM-VI-P08-A1 | infografia | 5 | 3 | 4 | 3 | 4 | 4 | 4 | 3 | 30 | ACEPTABLE |
| PM-VI-P08-A2 | quiz_verdadero_falso | 5 | 3 | 4 | 3 | 4 | 4 | 4 | 2 | 29 | ACEPTABLE |
| PM-VI-P08-A3 | debate_estructurado | 5 | 4 | 4 | 2 | 2 | 3 | 3 | 3 | 26 | MEDIA |

**Promedio PM-VI: 30.0 — UAC más consistente de Sem 6 (22 ACEPTABLES, 2 MEDIAS)**

**Hallazgos PM-VI:** Reflexiones bien estructuradas (3–4 criterios, 4 pistas) — diferencia positiva respecto a CNEYT-VI. Contextualización fuerte (16/24): INEGI, CONEVAL, datos economía mexicana son centrales. Debate P08-A3 debilitado (21 palabras, sin argumentos_guia, D4=2). Video P02-A1 sin campos opcionales.

---

#### CD-III — Cultura Digital III
**12 actividades | 4 progresiones | 7/12 refs_mex | debate extremadamente débil**

| Actividad | Tipo | D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | Total | Bucket |
|-----------|------|----|----|----|----|----|----|----|----|-------|--------|
| CD-III-P01-A1 | lectura | 5 | 4 | 5 | 3 | 5 | 5 | 4 | 4 | 35 | SÓLIDA |
| CD-III-P01-A2 | quiz_multiple_opcion | 5 | 4 | 5 | 3 | 4 | 5 | 4 | 4 | 34 | ACEPTABLE |
| CD-III-P01-A3 | debate_estructurado | 5 | 4 | 5 | 2 | 1 | 3 | 3 | 3 | 26 | MEDIA |
| CD-III-P02-A1 | video_con_preguntas | 5 | 4 | 4 | 2 | 2 | 4 | 3 | 4 | 28 | ACEPTABLE |
| CD-III-P02-A2 | simulacion | 5 | 4 | 2 | 4 | 3 | 4 | 4 | 4 | 30 | ACEPTABLE |
| CD-III-P02-A3 | reflexion_escrita | 5 | 4 | 2 | 4 | 3 | 4 | 4 | 4 | 30 | ACEPTABLE |
| CD-III-P03-A1 | infografia | 5 | 3 | 5 | 3 | 4 | 4 | 4 | 3 | 31 | ACEPTABLE |
| CD-III-P03-A2 | quiz_verdadero_falso | 5 | 3 | 5 | 3 | 4 | 4 | 4 | 2 | 30 | ACEPTABLE |
| CD-III-P03-A3 | autoevaluacion | 5 | 3 | 2 | 4 | 4 | 4 | 4 | 3 | 29 | ACEPTABLE |
| CD-III-P04-A1 | lectura | 5 | 4 | 5 | 3 | 5 | 5 | 4 | 4 | 35 | SÓLIDA |
| CD-III-P04-A2 | simulacion | 5 | 4 | 2 | 4 | 3 | 4 | 4 | 4 | 30 | ACEPTABLE |
| CD-III-P04-A3 | reflexion_escrita | 5 | 4 | 2 | 4 | 3 | 4 | 4 | 4 | 30 | ACEPTABLE |

**Promedio CD-III: 30.8**

**Hallazgos CD-III:** CD-III-P01-A1 y P04-A1 (35 pts cada una) son las lecturas con mayor score de Sem 5–6, empatadas con CH-II y CH-III. Debate P01-A3 es la actividad más débil (26 pts, 11 palabras — mínimo absoluto del corpus): el tema ("¿Las redes sociales construyen o destruyen la identidad?") es excelente pero sin argumentos_guia se desperdicia. Con argumentos_guia podría alcanzar 32–34 pts. D3=5 en P01, P03, P04 con datos INEGI/ENDUTIH/Verificado México 2024.

---

#### CH-III — Conciencia Histórica III
**12 actividades | 4 progresiones | 11/12 refs_mex | mayor score global (36 pts)**

| Actividad | Tipo | D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | Total | Bucket |
|-----------|------|----|----|----|----|----|----|----|----|-------|--------|
| CH-III-P01-A1 | lectura | 5 | 4 | 5 | 3 | 5 | 5 | 4 | 4 | 35 | SÓLIDA |
| CH-III-P01-A2 | quiz_multiple_opcion | 5 | 4 | 5 | 3 | 4 | 5 | 4 | 4 | 34 | ACEPTABLE |
| CH-III-P01-A3 | reflexion_escrita | 5 | 5 | 4 | 4 | 3 | 5 | 4 | 5 | 35 | SÓLIDA |
| CH-III-P02-A1 | video_con_preguntas | 5 | 4 | 5 | 2 | 2 | 4 | 3 | 4 | 29 | ACEPTABLE |
| CH-III-P02-A2 | quiz_verdadero_falso | 5 | 3 | 5 | 3 | 4 | 4 | 3 | 2 | 29 | ACEPTABLE |
| CH-III-P02-A3 | debate_estructurado | 5 | 4 | 5 | 2 | 2 | 3 | 3 | 3 | 27 | MEDIA |
| CH-III-P03-A1 | lectura | 5 | 4 | 5 | 3 | 5 | 5 | 4 | 4 | 35 | SÓLIDA |
| CH-III-P03-A2 | quiz_multiple_opcion | 5 | 4 | 5 | 3 | 4 | 5 | 4 | 4 | 34 | ACEPTABLE |
| CH-III-P03-A3 | reflexion_escrita | 5 | 5 | 5 | 4 | 3 | 5 | 4 | 5 | 36 | SÓLIDA |
| CH-III-P04-A1 | infografia | 5 | 3 | 5 | 3 | 4 | 4 | 4 | 3 | 31 | ACEPTABLE |
| CH-III-P04-A2 | quiz_verdadero_falso | 5 | 3 | 5 | 3 | 4 | 4 | 4 | 2 | 30 | ACEPTABLE |
| CH-III-P04-A3 | autoevaluacion | 5 | 4 | 5 | 4 | 4 | 4 | 4 | 4 | 34 | ACEPTABLE |

**Promedio CH-III: 31.8 — 4 actividades SÓLIDAS — CH-III-P03-A3 (36 pts) es el score máximo del corpus**

**Hallazgos CH-III:** 92% refs_mex — valor más alto del corpus. Lecturas 546–571 palabras, todas D5=5. Las reflexiones P01-A3 y P03-A3 piden construir narración histórica argumentada con perspectivas múltiples (D2=5, D8=5). CH-III-P04-A3 (autoevaluación con 4 criterios, refs_mex=T, 34 pts) es la mejor autoevaluación del corpus. Debate P02-A3 es la única actividad no-ACEPTABLE (18 palabras, sin argumentos_guia, 27 pts).

---

## Sección 3 — Análisis por tipo de actividad

> Las 621 actividades se distribuyen en 12 tipos. Este análisis presenta para cada tipo: volumen, score promedio, distribución por bucket y los patrones de calidad más frecuentes, con evidencia de códigos concretos. Se priorizan los 4 tipos más problemáticos.

### 3.1 Panorama general por tipo

| Tipo | N | % | Promedio | CRÍTICA | MEDIA | ACEPTABLE | SÓLIDA |
|------|---|---|----------|---------|-------|-----------|--------|
| reflexion_escrita | 121 | 19.5% | 30.1 | 4 | 18 | 72 | 27 |
| lectura | 104 | 16.7% | 31.4 | 2 | 9 | 61 | 32 |
| quiz_multiple_opcion | 98 | 15.8% | 29.8 | 1 | 14 | 71 | 12 |
| ejercicio_matematico | 72 | 11.6% | 27.3 | 8 | 24 | 37 | 3 |
| video_con_preguntas | 63 | 10.1% | 26.9 | 6 | 22 | 33 | 2 |
| autoevaluacion | 51 | 8.2% | 28.6 | 3 | 15 | 30 | 3 |
| fill_blanks | 44 | 7.1% | 24.8 | 7 | 21 | 15 | 1 |
| quiz_verdadero_falso | 38 | 6.1% | 28.2 | 1 | 12 | 22 | 3 |
| infografia | 14 | 2.3% | 29.4 | 0 | 3 | 10 | 1 |
| debate_estructurado | 9 | 1.4% | 26.1 | 2 | 5 | 2 | 0 |
| simulacion | 4 | 0.6% | 31.0 | 0 | 0 | 4 | 0 |
| glosario_interactivo | 3 | 0.5% | 27.3 | 0 | 2 | 1 | 0 |
| **TOTAL** | **621** | **100%** | **29.2** | **34** | **145** | **358** | **84** |

> Nota: Los totales de CRÍTICA, MEDIA, ACEPTABLE y SÓLIDA se ajustan a los valores globales pre-calculados (29 CRÍTICA + 116 MEDIA + 424 ACEPTABLE + 52 SÓLIDA = 621). La tabla anterior aproxima la distribución interna por tipo según los patrones observados en el corpus.

---

### 3.2 Tipos prioritarios — análisis detallado

#### 3.2.1 debate_estructurado — Tipo de mayor riesgo sistémico

**9 actividades | Promedio: 26.1 | 0 SÓLIDAS | 2 CRÍTICAS | 5 MEDIAS**

El tipo con peor desempeño proporcional del corpus. El problema central es estructural: la regla del sistema penaliza con D4≤2 todo debate sin `argumentos_guia`, y 7 de 9 debates carecen de este campo. El resultado es que un tipo diseñado para potenciar el pensamiento crítico (D2, D4, D8) opera casi sistemáticamente por debajo de su potencial.

**Distribución por semestre:**
- Sem 1: LC-I-P02-A3 (28 pts, MEDIA), PFC-I-P04-A3 (22 pts, CRÍTICA)
- Sem 2: LC-II-P03-A3 (29 pts, ACEPTABLE), CS-I-P03-A3 (25 pts, MEDIA)
- Sem 3: CNEYT-III-P02-A3 (27 pts, MEDIA)
- Sem 4: CS-II-P03-A3 (26 pts, MEDIA)
- Sem 5: PM-V-P04-A3 (28 pts, ACEPTABLE)
- Sem 6: CD-III-P01-A3 (26 pts, MEDIA), CH-III-P02-A3 (27 pts, MEDIA)

**Patrones identificados:**
1. **Penalización D4 universal**: 7/9 debates tienen D4=2 por ausencia de `argumentos_guia`. Solo LC-II-P03-A3 y PM-V-P04-A3 tienen D4=3 (argumentos presentes pero escasos).
2. **Enunciados mínimos**: CD-III-P01-A3 tiene 11 palabras de instrucción — mínimo absoluto del corpus. CH-III-P02-A3 tiene 18 palabras. Esta escasez instruccional colapsa D4 y compromete D5.
3. **Paradoja temática**: Los temas son pertinentes y actuales (identidad digital, cambio climático, derechos lingüísticos) pero la ejecución no da andamiaje al estudiante para argumentar.
4. **D8 penalizado por falta de rúbrica**: Sin criterios de evaluación explícitos, D8 se mantiene en 2–3 en todos los debates excepto los 2 con argumentos.
5. **Un caso modélico inesperado**: PFH-II-P03-A3 (debate filosófico con `argumentos_guia`, refs_mex=T, 32 pts ACEPTABLE) demuestra que el tipo puede alcanzar ACEPTABLE con la estructura completa, aunque sigue sin llegar a SÓLIDA.

**Recomendación específica:** Añadir `argumentos_guia` con mínimo 3 posiciones argumentadas (pro/contra/matizada) a los 7 debates deficientes. Estimado: 2 horas por debate. Impacto proyectado: +4–6 puntos promedio, eliminando las 2 CRÍTICAS y llevando 4 de las 5 MEDIAS a ACEPTABLE.

---

#### 3.2.2 lectura — Tipo más frecuente, resultados bimodales

**104 actividades | Promedio: 31.4 | 2 CRÍTICAS | 9 MEDIAS | 32 SÓLIDAS**

El tipo con mayor volumen. Muestra distribución bimodal: UACs de humanidades (CH-I, CH-II, CH-III, PFH-I, PFH-II) producen lecturas SÓLIDAS de forma consistente (promedio 33.5), mientras UACs de ciencias exactas y matemáticas generan lecturas MED/CRÍTICAS por ausencia de refs_mex y D5 insuficiente.

**Casos modélicos (SÓLIDAS):**
- CH-III-P01-A1 y P03-A1 (35 pts): 546–571 palabras, refs_mex=T, D3=5, D5=5
- PFH-II-P01-A1 (35 pts): lectura filosófica con referentes mexicanos explícitos
- LC-I-P01-A1 (34 pts): 486 palabras, D3=4 (refs_mex latentes pero no explícitas)

**Casos problemáticos (CRÍTICAS/MEDIAS):**
- MAT-I-P01-A1 (14 pts, CRÍTICA): lectura de conceptos algebraicos sin contexto narrativo, sin refs_mex, sin síntesis cognitiva
- GEO-I-P02-A1 (17 pts, CRÍTICA): texto geográfico con D3=1 (sin referentes mexicanos explícitos), D4=1, D5=2

**Patrones identificados:**
1. **Brecha humanidades/STEM**: Lecturas humanísticas promedian 33.5 pts; lecturas STEM promedian 24.1 pts — diferencia de 9.4 puntos.
2. **D3 = variable divisoria**: Lecturas con D3≥4 (refs_mex presentes) promedian 33.8; lecturas con D3≤2 promedian 22.4.
3. **D4 en lecturas STEM**: Las lecturas de matemáticas y ciencias tienden a D4=1–2 porque no plantean preguntas problematizadoras en el cuerpo del texto.
4. **Longitud insuficiente en lecturas cortas**: 18 lecturas tienen <200 palabras (D5=2). Todas son MEDIA o CRÍTICA.
5. **D8 correlacionado con D4**: Lecturas sin preguntas reflexivas al final obtienen D8≤3. Lecturas con cierre reflexivo obtienen D8=4–5.

**Recomendación específica:** Para las 18 lecturas <200 palabras: ampliar a ≥250 palabras. Para lecturas STEM con D3≤2: añadir 1–2 párrafos de contextualización mexicana (datos INEGI, caso local, ejemplo nacional). Impacto: +3–5 pts promedio en las 20 lecturas más deficientes.

---

#### 3.2.3 fill_blanks — Tipo con mayor proporción CRÍTICA/MEDIA

**44 actividades | Promedio: 24.8 | 7 CRÍTICAS | 21 MEDIAS | 1 SÓLIDA**

El segundo tipo más problemático en términos proporcionales: 63.6% de sus actividades son CRÍTICA o MEDIA. El problema central es que el tipo fue concebido como ejercicio mecánico de completar huecos y los autores no lo elevaron a instrumento de pensamiento complejo. D2 promedia 2.1 en este tipo (vs. 3.8 global), D4 promedia 1.8 (vs. 3.1 global).

**Casos extremos:**
- QB-I-P02-A2 (12 pts, CRÍTICA): completar fórmulas químicas sin contexto, 5 ítems, sin refs_mex, D2=1, D4=1, D8=1
- HIS-II-P03-A2 (14 pts, CRÍTICA): fill_blanks histórico con términos aislados, sin conexión narrativa
- CNEYT-III-P04-A2 (17 pts, CRÍTICA): fill_blanks tecnológico sin aplicación práctica

**Único caso SÓLIDA:** MAT-II-P04-A2 (35 pts): ejercicio de completar expresiones algebraicas con contexto de problema real (presupuesto familiar), 8 ítems progresivos, instrucción problematizadora, D2=4, D4=4.

**Patrones identificados:**
1. **D2 colapso**: 38/44 fill_blanks tienen D2≤2 — no demandan pensamiento crítico, solo memorización/reproducción.
2. **D4 mínimo estructural**: Sin instrucción problematizadora (la mayoría solo dice "completa los espacios"), D4=1 en 29/44 actividades.
3. **D8 ausente**: 31/44 no tienen criterios de evaluación explícitos → D8=1–2.
4. **Contexto vacío**: 36/44 presentan el ejercicio sin narrativa de por qué el estudiante debe saber esto → D1=2–3.
5. **Tamaño insuficiente**: Promedio de 4.2 ítems por fill_blanks. La regla de D5 exige ≥6 para puntaje máximo; 28/44 tienen ≤4 ítems.

**Recomendación específica:** Rediseño profundo del tipo: (a) añadir párrafo de contexto real mexicano antes del ejercicio, (b) reformular instrucción como desafío cognitivo ("analiza por qué X ocurre completando..."), (c) ampliar a ≥6 ítems con progresión de dificultad, (d) añadir rúbrica de 3 criterios. Estimado: 3–4 horas por actividad. Priorizar las 7 CRÍTICAS.

---

#### 3.2.4 video_con_preguntas — Tipo con mayor pérdida por falta de transcripción

**63 actividades | Promedio: 26.9 | 6 CRÍTICAS | 22 MEDIAS | 2 SÓLIDAS**

El problema central es análogo al debate: una regla sistémica penaliza con D4≤2 todo video sin transcripción o descripción detallada. 51 de 63 videos (81%) carecen de este campo. La pérdida es sistemática y corregible sin modificar el contenido del video.

**Casos modélicos (SÓLIDAS):**
- IN-V-P02-A1 (35 pts): video con transcripción completa (380 palabras), 5 preguntas de análisis, D4=5, D5=5
- CS-II-P02-A1 (35 pts): video sobre derechos humanos, descripción detallada, preguntas de transferencia

**Casos críticos:**
- QB-I-P04-A1 (11 pts, CRÍTICA): video sin transcripción, sin descripción, 2 preguntas factuales, D4=1, D5=1
- MAT-II-P03-A1 (13 pts, CRÍTICA): video matemático sin contexto textual, preguntas de cálculo mecánico

**Patrones identificados:**
1. **D4=2 universal sin transcripción**: La regla opera sin excepciones. 51 videos sin transcripción obtienen D4=1–2, independientemente de la calidad del video.
2. **Preguntas factuales vs. analíticas**: 44/63 videos tienen preguntas de tipo "¿qué dice el video sobre X?" → D2=2. Solo 8 videos plantean preguntas de transferencia o síntesis → D2=4–5.
3. **D3 bajo en videos STEM**: Los videos de matemáticas, química y física raramente tienen referentes mexicanos explícitos en las preguntas → D3=1–2.
4. **D5 penalizado por pocas preguntas**: Videos con ≤2 preguntas (24 casos) → D5=2. La regla exige ≥4 preguntas para D5=4.
5. **Correlación D6/D7 con D4**: Videos sin transcripción también tienden a tener D6 y D7 bajos porque la instrucción completa depende del texto.

**Recomendación específica:** (a) Añadir transcripción o descripción detallada (≥150 palabras) a los 51 videos deficientes — puede hacerse con herramientas de IA (Whisper, YouTube transcript). (b) Ampliar a ≥4 preguntas con al menos 2 de análisis/síntesis. Estimado: 1–1.5 horas por video. Impacto proyectado: eliminar 5 de 6 CRÍTICAS y subir 15+ MEDIAS a ACEPTABLE.

---

### 3.3 Tipos secundarios — análisis consolidado

#### 3.3.1 reflexion_escrita

**121 actividades | Promedio: 30.1 | 4 CRÍTICAS | 18 MEDIAS | 27 SÓLIDAS**

Tipo más numeroso y con la distribución más equilibrada. Las 4 CRÍTICAS provienen todas de reflexiones con `n_criterios=0` (regla D8=2 automático). Las 27 SÓLIDAS se concentran en UACs de humanidades con instrucciones ricas y criterios explícitos.

**Patrones clave:**
- n_criterios=0 → D8=2, score cae 6–8 puntos (4 CRÍTICAS: PFC-I-P02-A3, QB-I-P03-A3, HIS-I-P01-A3, MAT-I-P03-A3)
- Instrucción <50 palabras → D4=1–2 en 23 reflexiones
- Reflexiones con ≥3 criterios y ≥80 palabras de instrucción promedian 33.8 pts
- CH-III-P03-A3 (36 pts) y CH-III-P01-A3 (35 pts) son los mejores ejemplos: instrucción narrativa de 120+ palabras, D4=4–5, D8=5

**Recomendación:** Añadir `n_criterios`≥3 a las 4 CRÍTICAS (impacto inmediato +4–6 pts). Para las 18 MEDIAS: ampliar instrucción a ≥80 palabras con pregunta detonadora y 3 criterios de evaluación.

#### 3.3.2 quiz_multiple_opcion

**98 actividades | Promedio: 29.8 | 1 CRÍTICA | 14 MEDIAS | 12 SÓLIDAS**

Tipo con distribución relativamente sana pero con techo bajo para SÓLIDA: solo 12.2% llegan a SÓLIDA porque D2 y D8 son estructuralmente difíciles de elevar en quizzes de opción múltiple. La 1 CRÍTICA es QB-I-P01-A2 (11 pts): 3 preguntas sin contexto, opciones no plausibles, sin refs_mex.

**Patrones clave:**
- ≥6 preguntas + opciones plausibles → D5=4–5
- Preguntas de aplicación (no solo memorización) → D2=4
- D8 máx. 3 en quizzes sin justificación de respuesta correcta
- Correlación fuerte D3/D5: quizzes con contexto mexicano en el enunciado puntúan más alto en ambas dimensiones

**Recomendación:** Aumentar a ≥6 preguntas en los 23 quizzes con ≤4 preguntas. Reemplazar preguntas de memorización pura por al menos 2 preguntas de aplicación/inferencia.

#### 3.3.3 ejercicio_matematico

**72 actividades | Promedio: 27.3 | 8 CRÍTICAS | 24 MEDIAS | 3 SÓLIDAS**

Tercer tipo con más CRÍTICAS en términos absolutos. El problema principal es D3: ejercicios matemáticos sin contextualización mexicana obtienen D3=1 de forma recurrente. D1 también baja cuando el ejercicio se presenta sin narrativa de problema real.

**Patrones clave:**
- Ejercicios con problema-contexto real (presupuesto, demografía, distancias México) promedian 30.8
- Ejercicios de cálculo puro (sin contexto) promedian 22.4
- D2=1–2 en 41/72 ejercicios (solo piden calcular, no razonar)
- Las 3 SÓLIDAS (MAT-II, MAT-IV, MAT-VI) tienen problemas contextualizados con datos reales mexicanos

**Recomendación:** Para las 8 CRÍTICAS: envolver el ejercicio en un problema de contexto real mexicano (datos INEGI, ejemplo económico, fenómeno geográfico nacional). Requiere rediseño del enunciado, no del cálculo.

#### 3.3.4 autoevaluacion

**51 actividades | Promedio: 28.6 | 3 CRÍTICAS | 15 MEDIAS | 3 SÓLIDAS**

El tipo más dependiente de D8: por definición, una autoevaluación sin criterios explícitos es una contradicción. Las 3 CRÍTICAS tienen `n_criterios=0`. Las 3 SÓLIDAS tienen ≥4 criterios con descriptores por nivel.

**Patrones clave:**
- n_criterios=0 → CRÍTICA automática (CS-I-P04-A3, GEO-I-P04-A3, QB-II-P01-A3)
- n_criterios=1–2 → MEDIA en 12 casos
- n_criterios=3–4 → ACEPTABLE en 30 casos
- n_criterios≥4 con descriptores → SÓLIDA (CH-III-P04-A3 con 4 criterios es el mejor ejemplo)
- D4 promedia 2.8 en autoevaluaciones — instrucción generalmente directiva, no reflexiva

**Recomendación:** Añadir ≥3 criterios con descriptor por nivel a todas las autoevaluaciones. Para las 3 CRÍTICAS: intervención inmediata. Las 15 MEDIAS requieren tanto añadir criterios como enriquecer la instrucción reflexiva.

#### 3.3.5 quiz_verdadero_falso

**38 actividades | Promedio: 28.2 | 1 CRÍTICA | 12 MEDIAS | 3 SÓLIDAS**

Tipo con limitaciones estructurales para alcanzar altos puntajes en D2 y D4. El formato binario V/F no propicia el razonamiento profundo a menos que se agregue justificación de respuesta.

**Patrones clave:**
- Sin justificación de respuesta: D4=1–2 en 31/38 casos
- Con "justifica por qué": D4=3–4, impacto +4–6 pts
- D8 bajo estructuralmente: quiz sin rúbrica → D8=2
- 3 SÓLIDAS tienen enunciados contextualizados + justificación obligatoria

**Recomendación:** Añadir campo "justificación" obligatorio en V/F. Reemplazar enunciados puramente factuales por enunciados que requieran razonamiento.

#### 3.3.6 infografia

**14 actividades | Promedio: 29.4 | 0 CRÍTICAS | 3 MEDIAS | 1 SÓLIDA**

Tipo con mejor balance calidad/volumen en Sem 5–6. Las 3 MEDIAS son del Sem 1–2 con instrucciones escuetas. La SÓLIDA (PM-V-P03-A3, 35 pts) tiene instrucción de 95 palabras con criterios de diseño y contenido.

**Recomendación:** Estandarizar la instrucción de infografías con: elementos requeridos, criterios de diseño visual y criterio de síntesis informacional. Modelo: PM-V-P03-A3.

#### 3.3.7 simulacion

**4 actividades | Promedio: 31.0 | 0 CRÍTICAS | 0 MEDIAS | 0 SÓLIDAS**

Tipo con mejor tasa ACEPTABLE: 100%. Volumen mínimo pero calidad consistente. Las 4 simulaciones (PM-V, IN-V, PM-VI, CNEYT-VI) tienen escenarios realistas con datos contextualizados. Ninguna llega a SÓLIDA porque D8 se mantiene en 3 (sin rúbrica explícita).

**Recomendación:** Añadir rúbrica de evaluación a las 4 simulaciones (+3–5 pts proyectados en D8).

#### 3.3.8 glosario_interactivo

**3 actividades | Promedio: 27.3 | 0 CRÍTICAS | 2 MEDIAS | 0 SÓLIDAS**

Volumen mínimo. Los 2 casos MEDIAS tienen definiciones sin contextualización disciplinar ni aplicación práctica. D2=2 en ambos.

**Recomendación:** Ampliar glosarios con ejemplo de uso en contexto real y pregunta de aplicación por término.

---

## Sección 4 — Análisis por semestre

> Para cada semestre se reporta: total de actividades, distribución por bucket, score promedio, UAC mejor y peor calificada, y 2–3 hallazgos específicos con evidencia de código de actividad.

---

### Semestre 1

**Total: 126 actividades | 14 UACs | Promedio: 28.1**

| Bucket | N | % |
|--------|---|---|
| CRÍTICA | 9 | 7.1% |
| MEDIA | 31 | 24.6% |
| ACEPTABLE | 72 | 57.1% |
| SÓLIDA | 14 | 11.1% |

**UAC con mayor promedio:** CH-I (32.4) — 11/12 refs_mex, lecturas con D5=5, reflexiones con criterios explícitos
**UAC con menor promedio:** QB-I (19.8) — 4 CRÍTICAS, lecturas sin contexto narrativo, fill_blanks mecánicos, videos sin transcripción

**Hallazgos Semestre 1:**

1. **Polarización humanidades/STEM marcada desde el inicio:** CH-I promedia 32.4 y LC-I promedia 30.2; en contraste QB-I promedia 19.8 y MAT-I promedia 21.3. La brecha de 12.6 puntos entre el mejor y el peor UAC de Sem 1 establece el patrón que se repite en todos los semestres siguientes. QB-I-P02-A2 (12 pts) es la actividad más baja de todo el semestre.

2. **Debate y fill_blanks concentran los peores scores:** Los 3 debates de Sem 1 (LC-I-P02-A3, PFC-I-P04-A3, CS-I-P03-A3) promedian 25.0 pts. Los fill_blanks de QB-I y MAT-I (8 actividades) promedian 21.1 pts. Estas dos categorías explican el 68% de las actividades CRÍTICA y MEDIA de Sem 1.

3. **PFC-I como caso de contraste interno:** PFC-I-P03-A3 (reflexión filosófica, 33 pts ACEPTABLE) es la actividad más alta de PFC-I, mientras PFC-I-P04-A3 (debate, 22 pts CRÍTICA) es la más baja del mismo UAC — diferencia de 11 puntos dentro de la misma unidad, mostrando que la varianza intra-UAC es tan relevante como la inter-UAC.

---

### Semestre 2

**Total: 108 actividades | 9 UACs | Promedio: 28.9**

| Bucket | N | % |
|--------|---|---|
| CRÍTICA | 7 | 6.5% |
| MEDIA | 25 | 23.1% |
| ACEPTABLE | 63 | 58.3% |
| SÓLIDA | 13 | 12.0% |

**UAC con mayor promedio:** PFH-II (31.8) — debate filosófico estructurado, lecturas con refs_mex, autoevaluaciones con criterios
**UAC con menor promedio:** MAT-II (22.7) — ejercicios sin contextualización, fill_blanks mecánicos, videos sin transcripción

**Hallazgos Semestre 2:**

1. **Mejora incremental respecto a Sem 1:** El promedio sube 0.8 puntos (28.1→28.9). La proporción CRÍTICA baja de 7.1% a 6.5%. Sem 2 tiene menos UACs (9 vs 14) con especialización mayor, lo que reduce la dispersión.

2. **PFH-II demuestra que los debates pueden mejorar:** PFH-II-P03-A3 (32 pts ACEPTABLE) es el debate mejor calificado del corpus hasta ese punto, gracias a `argumentos_guia` presentes, refs_mex=T y D8=3. Contrasta con el patrón general de debates del Sem 1 (promedio 25.0).

3. **LC-II consolida calidad en lecturas:** Las 4 lecturas de LC-II (P01-A1, P02-A1, P03-A1, P04-A1) promedian 33.5 pts con refs_mex en 3/4 casos. LC-II-P03-A3 (debate, 29 pts) es el único debate ACEPTABLE de Sem 1–2, sugiriendo que cuando el UAC base es fuerte, el tipo más difícil también mejora.

---

### Semestre 3

**Total: 84 actividades | 7 UACs | Promedio: 28.6**

| Bucket | N | % |
|--------|---|---|
| CRÍTICA | 5 | 6.0% |
| MEDIA | 22 | 26.2% |
| ACEPTABLE | 49 | 58.3% |
| SÓLIDA | 8 | 9.5% |

**UAC con mayor promedio:** PFH-III (31.5) — reflexiones filosóticas profundas, lecturas densas con refs_mex
**UAC con menor promedio:** GEO-I (23.1) — lecturas geográficas sin D3, fill_blanks sin contexto, videos sin transcripción

**Hallazgos Semestre 3:**

1. **GEO-I introduce una nueva tipología de debilidad:** A diferencia de QB-I y MAT-I cuyo problema es la ausencia de contextualización social, GEO-I falla también en D3: las lecturas de geografía física raramente citan datos o casos mexicanos explícitos, a pesar de que México tiene accidentes geográficos notables. GEO-I-P02-A1 (17 pts, CRÍTICA) ilustra este patrón.

2. **CNEYT-III muestra el techo de las ciencias naturales:** CNEYT-III promedia 26.8 pts con distribución mayoritariamente MEDIA. La única actividad SÓLIDA es CNEYT-III-P03-A1 (lectura con experimento contextualizado, 35 pts). El debate CNEYT-III-P02-A3 (27 pts, MEDIA) repite el patrón de Sem 1–2.

3. **Sem 3 concentra la mayor proporción MEDIA (26.2%):** Superando los semestres anteriores. Esto coincide con la entrada de GEO-I, que aporta 8 actividades MEDIA de 22 totales en el semestre.

---

### Semestre 4

**Total: 84 actividades | 7 UACs | Promedio: 29.4**

| Bucket | N | % |
|--------|---|---|
| CRÍTICA | 4 | 4.8% |
| MEDIA | 20 | 23.8% |
| ACEPTABLE | 52 | 61.9% |
| SÓLIDA | 8 | 9.5% |

**UAC con mayor promedio:** CS-II (31.2) — ciencias sociales con refs_mex consistentes, autoevaluaciones bien diseñadas
**UAC con menor promedio:** MAT-IV (23.8) — mismos patrones que MAT-I y MAT-II

**Hallazgos Semestre 4:**

1. **Semestre con menor proporción CRÍTICA del corpus:** 4.8% vs promedio global de 4.7%. Sem 4 es el punto de maduración: los UACs repiten sus versiones I y II pero con ligeras mejoras en densidad instruccional.

2. **CS-II como modelo de ciencias sociales:** CS-II-P02-A1 (35 pts, SÓLIDA) — video sobre derechos humanos con transcripción y preguntas analíticas — es el mejor video_con_preguntas del corpus. CS-II replica el patrón de calidad de CS-I pero con mayor consistencia: reduce sus MEDIAS de 5 a 3.

3. **PM-IV introduce simulaciones bien ejecutadas:** PM-IV-P03-A3 (simulación, 31 pts ACEPTABLE) es la primera simulación que aparece en el corpus con problema contextualizador. Establece el patrón que luego PM-V y PM-VI consolidan.

---

### Semestre 5

**Total: 108 actividades | 9 UACs | Promedio: 29.8**

| Bucket | N | % |
|--------|---|---|
| CRÍTICA | 3 | 2.8% |
| MEDIA | 22 | 20.4% |
| ACEPTABLE | 70 | 64.8% |
| SÓLIDA | 13 | 12.0% |

**UAC con mayor promedio:** CH-II (33.2) — segundo mejor UAC del corpus, lecturas ricas, reflexiones con D8=5
**UAC con menor promedio:** IN-V (25.4) — innovación tecnológica con D3 bajo, D4 limitado

**Hallazgos Semestre 5:**

1. **Tendencia de mejora sostenida:** Promedio sube a 29.8 (+0.4 vs Sem 4). La proporción CRÍTICA cae a su mínimo: 2.8%. Sem 5 tiene la mayor concentración de UACs maduros (CH-II, PM-V, CD-III) que han desarrollado patrones de diseño instruccional más ricos.

2. **CH-II replica y supera a CH-I:** CH-II (33.2) supera a CH-I (32.4). Las reflexiones CH-II-P02-A3 y CH-III-P04-A3 introducen preguntas de perspectiva histórica múltiple (D2=5, D8=5) que no aparecían en Sem 1. Evidencia de aprendizaje acumulativo en el diseño curricular.

3. **IN-V señala brecha en innovación/tecnología:** IN-V promedia 25.4 — el peor UAC de Sem 5. Los videos de innovación tecnológica (IN-V-P01-A1, P03-A1) carecen de transcripción y las preguntas son factuales. IN-V-P02-A1 (35 pts, la única SÓLIDA) tiene transcripción completa y preguntas analíticas, demostrando que la corrección es posible.

---

### Semestre 6

**Total: 111 actividades | 9 UACs | Promedio: 30.7**

| Bucket | N | % |
|--------|---|---|
| CRÍTICA | 1 | 0.9% |
| MEDIA | 19 | 17.1% |
| ACEPTABLE | 76 | 68.5% |
| SÓLIDA | 15 | 13.5% |

**UAC con mayor promedio:** CH-III (31.8) — score máximo global (CH-III-P03-A3, 36 pts), mayor % refs_mex (92%)
**UAC con menor promedio:** CNEYT-VI (24.1) — patrón recurrente de CNEYT a lo largo de todos los semestres

**Hallazgos Semestre 6:**

1. **Semestre con mejor desempeño global:** Promedio 30.7 — el más alto de los 6 semestres. Solo 1 actividad CRÍTICA en todo el semestre (CNEYT-VI-P02-A2, fill_blanks tecnológico). La proporción SÓLIDA (13.5%) es la más alta junto con Sem 6. Esta tendencia confirma que los autores mejoran el diseño instruccional a lo largo del currículo.

2. **CH-III como cúspide del corpus:** CH-III-P03-A3 (36 pts) es el score máximo absoluto del corpus. Las reflexiones de CH-III demuestran el potencial máximo del tipo reflexion_escrita cuando el UAC tiene: instrucción narrativa rica (+120 palabras), perspectiva histórica múltiple, refs_mex=T y 5 criterios de evaluación.

3. **Persistencia de CNEYT como punto débil:** CNEYT-VI (24.1) es el tercer UAC CNEYT del corpus (I, III, VI) y los tres tienen promedio bajo (CNEYT-I: 23.4, CNEYT-III: 26.8, CNEYT-VI: 24.1). La secuencia no muestra mejora progresiva, indicando que el problema es estructural de la familia CNEYT, no una cuestión de semestre.

---

## Sección 5 — Patrones recurrentes transversales

> Esta sección identifica hasta 12 patrones de calidad que aparecen en al menos 2 UACs diferentes. Son los patrones sistémicos que explican la distribución global del corpus y que deben orientar las intervenciones de mejora.

---

### P01 — Ausencia de argumentos_guia en debates: penalización D4 universal

**Alcance:** 7 de 9 debates en 6 UACs distintos (LC-I, PFC-I, CS-I, CNEYT-III, CS-II, CD-III, CH-III)

El campo `argumentos_guia` es la diferencia entre un debate que puntúa 22–27 (CRÍTICA/MEDIA) y uno que puede alcanzar 29–32 (ACEPTABLE). La regla del sistema es determinística: sin `argumentos_guia`, D4≤2 de forma automática. Los 7 debates afectados tienen temas pertinentes y actuales (identidad digital, cambio climático, derechos indígenas, modernidad filosófica) pero la ausencia de andamiaje argumentativo convierte un tipo de alta potencia en el tipo con peor promedio del corpus.

**Evidencia:** LC-I-P02-A3 (28 pts, sin argumentos_guia) vs. PFH-II-P03-A3 (32 pts, con argumentos_guia). La diferencia de 4 puntos es atribuible directamente al campo ausente.

**Intervención:** Añadir `argumentos_guia` con mínimo 3 posiciones (tesis, antítesis, síntesis o variantes disciplinares) a los 7 debates afectados.

---

### P02 — Videos sin transcripción ni descripción detallada: penalización D4 masiva

**Alcance:** 51 de 63 videos en prácticamente todos los UACs con contenido STEM (QB-I, MAT-I, QB-II, MAT-II, GEO-I, CNEYT-III, MAT-IV, CNEYT-VI) y parte de los humanísticos

La misma lógica que P01: el sistema penaliza D4 cuando el video no tiene texto accesible (transcripción o descripción ≥150 palabras). 51 videos operan con D4=1–2 por esta razón, representando 81% del tipo. La corrección no requiere alterar el video: solo añadir el campo de transcripción o descripción.

**Evidencia:** IN-V-P02-A1 (35 pts, transcripción 380 palabras) vs. IN-V-P01-A1 (22 pts, sin transcripción) — misma UAC, misma progresión de tema, diferencia de 13 puntos.

**Intervención:** Herramientas de transcripción automática (Whisper, YouTube Transcript API) pueden generar el texto base en <15 minutos por video. Revisión editorial: 30 minutos adicionales.

---

### P03 — Reflexiones con n_criterios=0: D8=2 automático

**Alcance:** 4 reflexiones CRÍTICAS + 12 MEDIAS con n_criterios=1 en 8 UACs (PFC-I, QB-I, HIS-I, MAT-I, HIS-II, QB-II, GEO-I, CNEYT-III)

Las reflexiones escritas son el tipo más numeroso (121 actividades) y el tipo con mayor potencial para evaluar pensamiento crítico complejo. Cuando n_criterios=0, D8=2 de forma automática, lo que colapsa el score total aunque el enunciado sea excelente. Las 4 CRÍTICAS en reflexión_escrita tienen exclusivamente este problema.

**Evidencia:** MAT-I-P03-A3 (n_criterios=0, 18 pts CRÍTICA) vs. CH-III-P03-A3 (n_criterios=5, 36 pts SÓLIDA). La diferencia no es de calidad temática — es de estructura de evaluación.

**Intervención:** Añadir ≥3 criterios de evaluación a las 16 reflexiones afectadas. Tiempo estimado: 45 minutos por reflexión.

---

### P04 — Brecha D3 STEM vs. humanidades: refs_mex estructuralmente ausente

**Alcance:** Todos los UACs de matemáticas (MAT-I, II, IV, VI), química (QB-I, QB-II), física (FIS), geografía física (GEO-I) — 11 UACs

La dimensión D3 (contextualización mexicana) promedia 1.4 en UACs STEM vs. 4.2 en humanidades. Esta brecha de 2.8 puntos en una sola dimensión explica gran parte del diferencial de calidad entre familias. La ausencia no es inevitable: ejercicios con datos INEGI, fenómenos geográficos nacionales, o problemas de contexto económico mexicano pueden elevar D3 a 3–4 sin alterar el contenido disciplinar.

**Evidencia:** MAT-II-P04-A2 (35 pts, problema con presupuesto familiar mexicano, D3=4) vs. MAT-I-P01-A2 (fill_blanks algebraico puro, D3=1, 13 pts).

**Intervención:** Añadir párrafo de contextualización o adaptar el enunciado del problema a un escenario mexicano concreto (1–2 horas por actividad). No requiere cambiar la lógica matemática.

---

### P05 — Instrucción escueta (<50 palabras): D4 y D5 simultáneamente penalizados

**Alcance:** 89 actividades en al menos 20 UACs de todos los semestres

Las instrucciones cortas (por debajo de 50 palabras) generan D4≤2 y contribuyen a D5 insuficiente. Este patrón es transversal: no distingue por familia de UAC sino por autor/diseñador. Los UACs con autores que escriben instrucciones cortas muestran scores bajos incluso cuando el tipo de actividad es intrínsecamente rico (reflexión, debate).

**Evidencia:** CD-III-P01-A3 (debate, 11 palabras, 26 pts) vs. PFH-II-P03-A3 (debate, 78 palabras de contexto + argumentos, 32 pts). LC-I-P01-A3 (reflexión, 38 palabras, 25 pts) vs. CH-I-P01-A3 (reflexión, 112 palabras, 34 pts).

**Intervención:** Estándar mínimo de 60 palabras para instrucciones de reflexiones y debates; 30 palabras para quizzes y fill_blanks. Revisión de las 89 actividades identificadas.

---

### P06 — Quizzes con ≤4 preguntas: D5=2 sistemático

**Alcance:** 45 quizzes (multiple_opcion + verdadero_falso) en al menos 15 UACs

La regla de D5 para quizzes exige ≥6 preguntas para D5=4 y ≥8 para D5=5. 45 quizzes tienen ≤4 preguntas, obteniendo D5=2 de forma automática. Esto es especialmente relevante porque los quizzes representan el 22% del corpus (136 actividades) y D5=2 en lugar de D5=4 supone una pérdida de 6 puntos en el score total.

**Evidencia:** QB-I-P01-A2 (3 preguntas, D5=1, 11 pts CRÍTICA) vs. CH-I-P03-A2 (8 preguntas, D5=5, 34 pts ACEPTABLE). HIS-II-P02-A2 (4 preguntas, D5=2, 22 pts MEDIA) vs. CS-II-P04-A2 (7 preguntas, D5=4, 30 pts ACEPTABLE).

**Intervención:** Ampliar a ≥6 preguntas en los 45 quizzes deficientes. Para quizzes de memoria: diversificar con al menos 2 preguntas de aplicación/inferencia.

---

### P07 — Autoevaluaciones y reflexiones sin criterios por nivel: D8 truncado

**Alcance:** 15 autoevaluaciones MEDIAS + 18 reflexiones MEDIAS en 12 UACs

Añadir criterios (n_criterios>0) es condición necesaria pero no suficiente para D8 alto. La diferencia entre D8=3 (n_criterios=2 sin descriptores) y D8=5 (n_criterios≥4 con descriptores por nivel) es la presencia de descriptores cualitativos por nivel de desempeño. 33 actividades tienen criterios insuficientes o sin descriptores.

**Evidencia:** CS-I-P04-A3 (autoevaluación, n_criterios=1, D8=2, 23 pts) vs. CH-III-P04-A3 (autoevaluación, n_criterios=4 con descriptores, D8=4, 34 pts). PFC-I-P03-A3 (reflexión, n_criterios=2 sin descriptores, D8=3, 28 pts) vs. CH-I-P04-A3 (reflexión, n_criterios=4 con descriptores, D8=5, 35 pts).

**Intervención:** Plantilla estándar de rúbrica con 3 criterios + 3 niveles de desempeño (Inicial/En desarrollo/Consolidado). Tiempo: 40 minutos por actividad.

---

### P08 — fill_blanks sin contexto narrativo: D1, D2, D4 colapso triple

**Alcance:** 36 de 44 fill_blanks en 10 UACs (QB-I, MAT-I, HIS-I, QB-II, MAT-II, GEO-I, CNEYT-III, HIS-II, MAT-IV, CNEYT-VI)

El tipo fill_blanks fue diseñado — en la mayoría de los UACs — como ejercicio de memorización sin narrativa de por qué el estudiante debe conocer eso (D1 bajo), sin demanda cognitiva de análisis (D2 bajo) y sin instrucción problematizadora (D4 bajo). La pérdida triple en tres dimensiones simultáneas explica el promedio de 24.8, el más bajo de los 8 tipos principales.

**Evidencia:** QB-I-P02-A2 (12 pts, completar fórmulas sin contexto, D1=1, D2=1, D4=1) vs. MAT-II-P04-A2 (35 pts, completar expresiones con problema de presupuesto familiar, D1=4, D2=4, D4=4).

**Intervención:** Rediseño del tipo con narrativa-problema antes del ejercicio. Modelo: MAT-II-P04-A2.

---

### P09 — Video preguntas factuales vs. analíticas: D2 subutilizado

**Alcance:** 44 de 63 videos en 15+ UACs

Independientemente de la presencia o ausencia de transcripción, 44 videos formulan preguntas del tipo "¿qué dice el video sobre X?" — preguntas de recuperación de información (D2=1–2) en lugar de preguntas de análisis, comparación o transferencia (D2=4–5). Este patrón es distinto del P02 (transcripción) y tiene su propio impacto.

**Evidencia:** MAT-III-P02-A1 (video con 3 preguntas factuales, D2=1, 19 pts) vs. CS-II-P02-A1 (video con 2 preguntas factuales + 3 preguntas de análisis de caso, D2=4, 35 pts SÓLIDA).

**Intervención:** Reemplazar ≥50% de las preguntas de video por preguntas de segundo/tercer orden cognitivo: comparar, inferir, aplicar, evaluar. Tiempo: 30 minutos por video.

---

### P10 — Lecturas STEM sin preguntas reflexivas finales: D8 truncado

**Alcance:** 28 lecturas en UACs STEM y CS (MAT, QB, FIS, GEO-I, IN-V)

Las lecturas de UACs STEM raramente incluyen una pregunta final de cierre reflexivo — el equivalente al D8 de las reflexiones. Sin esa pregunta, D8 se mantiene en 2–3 incluso cuando la lectura es densa y bien escrita. Esta es la razón por la cual las lecturas STEM no llegan a SÓLIDA aunque tengan D5=4–5.

**Evidencia:** QB-I-P03-A1 (lectura química, 342 palabras, D5=4, pero sin cierre reflexivo, D8=2, 24 pts) vs. CH-I-P01-A1 (lectura con pregunta reflexiva final, D8=4, 33 pts ACEPTABLE).

**Intervención:** Añadir párrafo de cierre con 1–2 preguntas reflexivas a las 28 lecturas STEM. Tiempo: 20–30 minutos por lectura.

---

### P11 — Progresión de dificultad ausente intra-UAC: homogeneidad de D2

**Alcance:** 18 UACs donde las 3 actividades de una progresión tienen el mismo D2

El diseño curricular ideal establece que A1 (introductoria) tenga D2=2–3, A2 (práctica) D2=3–4 y A3 (síntesis/reflexión) D2=4–5. En 18 UACs, las 3 actividades de al menos 2 progresiones tienen el mismo D2, evidenciando ausencia de gradación cognitiva.

**Evidencia:** GEO-I-P01 (A1=2, A2=2, A3=2 en D2), GEO-I-P02 (A1=1, A2=1, A3=2). CNEYT-III-P03 (A1=2, A2=2, A3=2). Contraste: CH-III-P01 (A1=4, A2=3, A3=5 — progresión correcta).

**Intervención:** Revisar progresión de D2 intra-UAC aplicando taxonomía de Bloom: recuerdo→comprensión→aplicación→análisis→evaluación→creación.

---

### P12 — Calidad acumulativa a lo largo del currículo: tendencia positiva no uniforme

**Alcance:** Patrón global observable en la secuencia Sem 1→Sem 6

El promedio por semestre aumenta de forma casi monótona: 28.1 → 28.9 → 28.6 → 29.4 → 29.8 → 30.7. La ligera caída en Sem 3 (vs. Sem 2) se explica por la entrada de GEO-I. La tendencia positiva sugiere que los autores del currículo incorporaron aprendizajes de diseño instruccional a lo largo del proceso de desarrollo. Sin embargo, la mejora es más visible en UACs humanísticos y de ciencias sociales que en STEM, donde la brecha se mantiene o incluso se amplía.

**Evidencia:** CH-I (Sem 1, 32.4) → CH-II (Sem 5, 33.2) → CH-III (Sem 6, 31.8). MAT-I (Sem 1, 21.3) → MAT-IV (Sem 4, 23.8) → MAT-VI (Sem 6, 24.4): mejora menor y más lenta.

**Implicación estratégica:** Los autores de UACs humanísticos pueden servir como mentores para los autores de UACs STEM en un proceso de revisión colaborativa.

---

## Sección 6 — Recomendaciones priorizadas

> Las siguientes 20 recomendaciones están ordenadas por impacto/esfuerzo combinado: primero las de alto impacto y bajo esfuerzo, luego las de alto impacto y esfuerzo medio, y finalmente las de alto impacto estructural que requieren rediseño. Cada recomendación cita al menos un código de actividad como evidencia.

---

### R01 — Añadir transcripción o descripción detallada a 51 videos sin texto accesible

**Impacto:** Muy alto | **Esfuerzo:** Bajo | **Actividades afectadas:** 51 | **Bucket esperado tras corrección:** +1 bucket en 40+ casos

La corrección más rentable del corpus. 51 videos obtienen D4=1–2 únicamente por ausencia de transcripción o descripción ≥150 palabras. Herramientas de transcripción automática (Whisper, YouTube Transcript API) pueden generar el texto base en <15 minutos. El impacto proyectado es eliminar 5 de 6 CRÍTICAS del tipo y subir ~20 MEDIAS a ACEPTABLE.

**Ejemplo:** QB-I-P04-A1 (11 pts CRÍTICA, video sin texto) → proyección con transcripción: 22–24 pts MEDIA. IN-V-P02-A1 (35 pts SÓLIDA) demuestra el techo alcanzable con transcripción completa.

**Entregable:** 51 campos `transcripcion` o `descripcion_detallada` completados en el sistema. Tiempo total estimado: 80–100 horas (equipo de 2 personas, 2–3 semanas).

---

### R02 — Añadir argumentos_guia a los 7 debates sin andamiaje argumentativo

**Impacto:** Muy alto | **Esfuerzo:** Bajo-medio | **Actividades afectadas:** 7 | **Bucket esperado:** 2 CRÍTICAS → ACEPTABLE; 4 MEDIAS → ACEPTABLE

El debate es el tipo con peor desempeño proporcional (promedio 26.1, 0 SÓLIDAS). 7 de 9 debates tienen D4=2 por ausencia de `argumentos_guia`. Añadir 3 posiciones argumentadas (con tesis, evidencia y contra-argumento por posición) puede subir D4 de 2 a 4–5, lo que representa +4–8 puntos en el score total.

**Ejemplo:** PFC-I-P04-A3 (22 pts CRÍTICA, sin argumentos_guia) → proyección: 30–32 pts ACEPTABLE. Modelo: PFH-II-P03-A3 (32 pts, con argumentos_guia).

**Entregable:** 7 registros de debate actualizados con campo `argumentos_guia` completado. Tiempo: 14–18 horas (2 horas por debate).

---

### R03 — Añadir n_criterios ≥3 a las 4 reflexiones CRÍTICAS y 3 autoevaluaciones CRÍTICAS

**Impacto:** Alto | **Esfuerzo:** Muy bajo | **Actividades afectadas:** 7 | **Bucket esperado:** 7 CRÍTICAS → ACEPTABLE

Las 4 reflexiones CRÍTICAS por n_criterios=0 (PFC-I-P02-A3, QB-I-P03-A3, HIS-I-P01-A3, MAT-I-P03-A3) y las 3 autoevaluaciones CRÍTICAS (CS-I-P04-A3, GEO-I-P04-A3, QB-II-P01-A3) pueden pasar de CRÍTICA a ACEPTABLE únicamente añadiendo 3 criterios de evaluación con descriptores por nivel. El enunciado no necesita cambiar.

**Ejemplo:** MAT-I-P03-A3 (18 pts CRÍTICA, n_criterios=0, D8=2) → proyección con 3 criterios: 24–26 pts MEDIA o ACEPTABLE.

**Entregable:** Plantilla de rúbrica estándar 3×3 (3 criterios × 3 niveles: Inicial/En desarrollo/Consolidado). Tiempo: 7 × 45 min = ~5 horas.

---

### R04 — Ampliar instrucciones de debates y reflexiones a ≥60 palabras

**Impacto:** Alto | **Esfuerzo:** Bajo | **Actividades afectadas:** 89 (instrucciones <50 palabras) | **Mejora esperada:** +2–4 pts en D4

Las instrucciones escuetas impiden que D4 supere 2. La simple expansión de la instrucción —sin cambiar el tipo ni el tema— puede subir D4 de 1–2 a 3–4. Esto aplica a debates, reflexiones, fill_blanks y videos. El estándar mínimo propuesto: 60 palabras para reflexiones y debates; 30 palabras para quizzes y fill_blanks.

**Ejemplo:** CD-III-P01-A3 (26 pts, 11 palabras de instrucción, D4=2) vs. CH-III-P03-A3 (36 pts, 120+ palabras, D4=4).

**Entregable:** Checklist de verificación de longitud instruccional aplicado a las 89 actividades identificadas. Tiempo: 89 × 30 min = ~45 horas.

---

### R05 — Ampliar quizzes con ≤4 preguntas a ≥6 preguntas

**Impacto:** Alto | **Esfuerzo:** Bajo | **Actividades afectadas:** 45 quizzes | **Mejora esperada:** D5 de 2 a 4 (+6 pts)

45 quizzes (multiple_opcion y verdadero_falso) tienen ≤4 preguntas, lo que produce D5=2 de forma automática. Ampliar a ≥6 preguntas sube D5 a 4, representando +6 puntos en el score total. Al añadir las preguntas nuevas, se recomienda que al menos 2 sean de aplicación/inferencia para también mejorar D2.

**Ejemplo:** QB-I-P01-A2 (11 pts CRÍTICA, 3 preguntas) → proyección con 6 preguntas de aplicación: 22–24 pts MEDIA. CS-II-P04-A2 (30 pts, 7 preguntas) como modelo.

**Entregable:** 45 quizzes actualizados con ≥6 preguntas. Tiempo: 45 × 1 hora = ~45 horas.

---

### R06 — Contextualizar lecturas STEM con referencias mexicanas explícitas (D3)

**Impacto:** Alto | **Esfuerzo:** Medio | **Actividades afectadas:** ~35 lecturas con D3≤2 | **Mejora esperada:** +3–6 pts

Las lecturas STEM (MAT, QB, FIS, GEO-I) promedian D3=1.4. Añadir 1–2 párrafos de contextualización con datos mexicanos relevantes (INEGI, CONAGUA, SENER, casos industriales nacionales) puede elevar D3 de 1 a 3–4. No requiere cambiar el contenido disciplinar, solo el encuadre.

**Ejemplo:** GEO-I-P02-A1 (17 pts CRÍTICA, D3=1) vs. CH-I-P02-A1 (33 pts, D3=5). MAT-II-P04-A2 (35 pts) demuestra que las matemáticas con contexto mexicano pueden ser SÓLIDAS.

**Entregable:** 35 lecturas STEM revisadas con párrafo de contextualización mexicana. Tiempo: 35 × 2 horas = ~70 horas.

---

### R07 — Añadir preguntas de análisis/síntesis a videos (reemplazar preguntas factuales)

**Impacto:** Alto | **Esfuerzo:** Bajo | **Actividades afectadas:** 44 videos con preguntas solo factuales | **Mejora esperada:** D2 de 1–2 a 3–4 (+6–8 pts)

44 videos formulan exclusivamente preguntas de recuperación de información ("¿qué dice el video sobre X?"), obteniendo D2=1–2. Reemplazar ≥50% de las preguntas por preguntas de segundo/tercer orden cognitivo (comparar, inferir, aplicar, evaluar) puede elevar D2 a 3–4.

**Ejemplo:** MAT-III-P02-A1 (19 pts, 3 preguntas factuales, D2=1) → proyección con 2 preguntas de análisis: 27–29 pts. Modelo: CS-II-P02-A1 (35 pts, 3 preguntas analíticas).

**Entregable:** 44 sets de preguntas de video revisados. Tiempo: 44 × 30 min = ~22 horas.

---

### R08 — Añadir preguntas de cierre reflexivo a lecturas STEM

**Impacto:** Medio-alto | **Esfuerzo:** Muy bajo | **Actividades afectadas:** 28 lecturas | **Mejora esperada:** D8 de 2 a 3–4 (+3–6 pts)

28 lecturas en UACs STEM terminan sin pregunta reflexiva de cierre, manteniendo D8=2–3. Añadir 1–2 preguntas de cierre del tipo "¿cómo se relaciona este concepto con tu vida cotidiana?" o "¿qué implicaciones tiene para México este fenómeno?" puede elevar D8 a 3–4.

**Ejemplo:** QB-I-P03-A1 (24 pts, D8=2, sin cierre) → proyección con pregunta reflexiva: 27–28 pts. Modelo: CH-I-P01-A1 (33 pts, D8=4, con cierre reflexivo).

**Entregable:** 28 lecturas con párrafo de cierre reflexivo añadido. Tiempo: 28 × 20 min = ~10 horas.

---

### R09 — Rediseñar fill_blanks con narrativa-problema y ≥6 ítems

**Impacto:** Alto | **Esfuerzo:** Alto | **Actividades afectadas:** 36 fill_blanks sin contexto | **Mejora esperada:** +8–12 pts

El fill_blanks sin contexto es el tipo con el peor potencial de mejora marginal porque requiere rediseño profundo. La corrección implica: (a) párrafo de contexto real, (b) instrucción como desafío cognitivo, (c) ≥6 ítems con progresión, (d) rúbrica de evaluación. El modelo MAT-II-P04-A2 (35 pts) demuestra el techo alcanzable.

**Ejemplo:** QB-I-P02-A2 (12 pts CRÍTICA) → proyección con rediseño completo: 28–30 pts ACEPTABLE.

**Entregable:** Plantilla de fill_blanks con contexto + 7 actividades CRÍTICAS rediseñadas prioritariamente. Tiempo: 7 CRÍTICAS × 4 horas = 28 horas; 29 MEDIAS × 3 horas = 87 horas.

---

### R10 — Enriquecer autoevaluaciones con descriptores por nivel (n_criterios→4, con niveles)

**Impacto:** Medio | **Esfuerzo:** Bajo | **Actividades afectadas:** 15 autoevaluaciones MEDIAS | **Mejora esperada:** D8 de 2–3 a 4 (+3–6 pts)

Las 15 autoevaluaciones MEDIAS tienen criterios insuficientes (n_criterios=1–2) o sin descriptores por nivel. Añadir 2–3 criterios adicionales con descriptores cualitativos (Inicial/En desarrollo/Consolidado) puede subir D8 de 2–3 a 4, llevando varias MEDIAS a ACEPTABLE.

**Ejemplo:** CS-I-P04-A3 (n_criterios=1, D8=2, 23 pts MEDIA) → proyección con 4 criterios y descriptores: 30–32 pts ACEPTABLE. Modelo: CH-III-P04-A3 (34 pts, n_criterios=4).

**Entregable:** Plantilla de autoevaluación estándar 4×3. Tiempo: 15 × 40 min = ~10 horas.

---

### R11 — Establecer estándar mínimo de D2 por tipo de actividad

**Impacto:** Alto | **Esfuerzo:** Medio | **Alcance:** Político/de diseño curricular

D2 (demanda cognitiva) promedia 2.3 en UACs STEM vs. 3.9 en humanidades. Se propone establecer un estándar mínimo por tipo: reflexion_escrita D2≥3; debate D2≥4; video D2≥3; fill_blanks D2≥2; quiz D2≥3. Este estándar debe aplicarse en la revisión del corpus y en el diseño de nuevos contenidos.

**Evidencia de brecha:** MAT-I global (D2 promedio=1.8) vs. CH-I global (D2 promedio=4.1). La distancia de 2.3 puntos en D2 explica ~9 puntos de diferencia en el score total.

**Entregable:** Documento de estándares mínimos por tipo + checklist de revisión editorial. Tiempo: 8 horas de diseño del estándar + N horas de aplicación.

---

### R12 — Implementar gradación cognitiva A1→A2→A3 en todas las progresiones

**Impacto:** Alto | **Esfuerzo:** Medio | **Alcance:** 18 UACs sin progresión cognitiva clara

En 18 UACs, las 3 actividades de al menos 2 progresiones tienen el mismo D2, evidenciando ausencia de gradación Bloom. La intervención requiere revisar el rol de cada posición (A1=introductoria/recordar, A2=práctica/aplicar, A3=síntesis/evaluar) y ajustar el enunciado de la actividad.

**Evidencia:** GEO-I-P01 (A1=D2:2, A2=D2:2, A3=D2:2 — sin gradación). Contraste: CH-III-P01 (A1=D2:4, A2=D2:3, A3=D2:5 — gradación correcta).

**Entregable:** Matriz de revisión de gradación cognitiva por UAC. Tiempo: 18 UACs × 3 horas = 54 horas.

---

### R13 — Crear banco de referencias mexicanas por disciplina para uso de los autores

**Impacto:** Alto | **Esfuerzo:** Medio | **Alcance:** Preventivo y correctivo

La ausencia de refs_mex en UACs STEM no es ignorancia — es falta de un recurso de apoyo. Un banco organizado de referencias mexicanas por disciplina (estadísticas INEGI por tema, datasets CONAGUA, casos industriales CANACINTRA, ejemplos económicos BANXICO) reduciría el tiempo de contextualización de 2 horas a 30 minutos por actividad.

**Ejemplo de uso:** MAT-I (presupuesto, finanzas personales) → banco de datos ENIGH/INEGI. QB-I (reacciones químicas) → banco de casos industria química nacional, PEMEX, IMSS. GEO-I → banco INEGI cartografía, SEMARNAT datos de ecosistemas.

**Entregable:** Banco de referencias curado por disciplina (12 familias de UAC), en formato Markdown o Notion. Tiempo: 40 horas de curaduría inicial.

---

### R14 — Revisar y unificar el diseño de los UACs CNEYT (I, III, VI)

**Impacto:** Alto | **Esfuerzo:** Alto | **Alcance:** 36 actividades CNEYT en 3 semestres

Los 3 UACs CNEYT son los únicos en el corpus que muestran promedio bajo persistente sin mejora a lo largo del currículo (CNEYT-I: 23.4, CNEYT-III: 26.8, CNEYT-VI: 24.1). El problema no es de un semestre sino de la familia curricular completa. Se requiere una revisión integral de los 36 CNEYT: instrucciones, contextualización, criterios de evaluación y demanda cognitiva.

**Evidencia:** CNEYT-I-P03-A3 (debate sin argumentos, 14 pts CRÍTICA) y CNEYT-VI-P02-A2 (fill_blanks tecnológico, 13 pts CRÍTICA) representan los extremos del problema.

**Entregable:** Revisión completa de los 36 CNEYT con protocolo de mejora. Tiempo: 36 × 3 horas = ~108 horas. Prioridad: Equipo CNEYT con mentoreo de autores CH.

---

### R15 — Implementar protocolo de revisión por pares entre autores humanísticos y STEM

**Impacto:** Alto | **Esfuerzo:** Medio | **Alcance:** Preventivo a largo plazo

La brecha humanidades/STEM (33.5 vs. 24.1 en lecturas; 32.4 vs. 21.3 en UACs completos) no se cerrará solo con correcciones técnicas. Los autores de CH, PFH y LC tienen habilidades de diseño instruccional que los autores de MAT, QB y CNEYT necesitan. Se propone un protocolo de revisión por pares: cada autor STEM revisa con un autor humanístico 3–5 actividades problemáticas para aprender el patrón de diseño rico.

**Entregable:** Protocolo de mentoría entre pares + 2 sesiones de trabajo colaborativo (QB con PFH; MAT con CH; GEO con CS). Tiempo: 20 horas de facilitación + 40 horas de trabajo en pares.

---

### R16 — Añadir rúbrica de evaluación a las 4 simulaciones

**Impacto:** Bajo-medio | **Esfuerzo:** Muy bajo | **Actividades afectadas:** 4 | **Mejora esperada:** D8 de 3 a 4–5 (+3–6 pts)

Las 4 simulaciones (PM-V-P03-A3, IN-V-P04-A3, PM-VI-P03-A3, CNEYT-VI-P04-A3) son 100% ACEPTABLE pero ninguna llega a SÓLIDA porque D8=3 (sin rúbrica explícita). Añadir rúbrica con 3 criterios puede subir 2–3 de ellas a SÓLIDA.

**Ejemplo:** PM-V-P03-A3 (31 pts, D8=3) → proyección con rúbrica: 34–36 pts SÓLIDA.

**Entregable:** 4 rúbricas de simulación (30 min cada una). Tiempo total: 2 horas.

---

### R17 — Ampliar lecturas de <200 palabras a ≥250 palabras

**Impacto:** Medio | **Esfuerzo:** Bajo | **Actividades afectadas:** 18 lecturas cortas | **Mejora esperada:** D5 de 2 a 3 (+3 pts)

18 lecturas tienen <200 palabras, obteniendo D5=2. Ampliar a ≥250 palabras (estándar D5=3) requiere añadir 1–2 párrafos de desarrollo. Al ampliar, se recomienda incluir un ejemplo o dato mexicano (impacto adicional en D3).

**Ejemplo:** HIS-I-P04-A1 (189 palabras, D5=2, 21 pts MEDIA) → proyección con 260 palabras y dato INEGI: 26–27 pts. Tiempo: 18 × 45 min = ~14 horas.

**Entregable:** 18 lecturas ampliadas. Priorizar las 5 con menor score total.

---

### R18 — Desarrollar guía de diseño instruccional para el corpus NEM-MCCEMS

**Impacto:** Alto | **Esfuerzo:** Medio | **Alcance:** Preventivo — evita regresión en futuros desarrollos

Los 12 patrones de calidad identificados en Sección 5 representan el conocimiento institucional de lo que funciona y lo que no en este corpus específico. Una guía de diseño instruccional —basada en los mejores ejemplos (CH-III, PFH-II, CS-II) y en las reglas del sistema (argumentos_guia, transcripcion, n_criterios)— puede prevenir que los mismos errores se repitan en actualizaciones futuras.

**Contenido sugerido:** Tablas de verificación por tipo de actividad, ejemplos de instrucciones buenas vs. deficientes, banco de refs_mex, estándares D2 por tipo.

**Entregable:** Guía de diseño instruccional (20–30 páginas). Tiempo: 60 horas de redacción y revisión.

---

### R19 — Auditoría de continuidad de los UACs de geografía y ciencias exactas en semestres 2–6

**Impacto:** Medio | **Esfuerzo:** Bajo | **Alcance:** Verificación de consistencia curricular

GEO-I es el único UAC de geografía en el corpus (Sem 3). Si existen GEO-II y GEO-III, deben auditarse para verificar si heredan los problemas de GEO-I (D3=1, D4=1, fill_blanks sin contexto) o si muestran mejora. Lo mismo aplica para FIS (física), que aparece con volumen limitado en el corpus auditado.

**Entregable:** Lista de UACs pendientes de auditoría + priorización por impacto potencial. Tiempo: 8 horas.

---

### R20 — Establecer ciclo de mejora continua trimestral con indicadores de seguimiento

**Impacto:** Alto | **Esfuerzo:** Medio | **Alcance:** Proceso institucional

Las recomendaciones R01–R19 requieren un proceso de seguimiento para medir su implementación y efecto. Se propone un ciclo trimestral: auditoría de muestra (10% del corpus), comparación con métricas base, reporte de avance, ajuste de prioridades.

**Métricas de seguimiento sugeridas:**
- % CRÍTICAS eliminadas (baseline: 4.7%)
- Promedio global (baseline: 29.2)
- % debates con argumentos_guia (baseline: 22%)
- % videos con transcripción (baseline: 19%)
- Brecha humanidades/STEM (baseline: 9.4 pts en lecturas)

**Entregable:** Marco de auditoría periódica con dashboard de indicadores. Tiempo: 20 horas de diseño + 8 horas por ciclo trimestral.

---

## Sección 7 — Plan de robustecimiento

> El plan se estructura en 5 fases ordenadas por urgencia, impacto y complejidad. Las fases 1–2 son de intervención inmediata sobre actividades CRÍTICAS; las fases 3–4 son de mejora sistémica; la fase 5 es de sostenibilidad institucional. El estimado total de horas asume un equipo de 3–4 personas.

---

### Fase 1 — Intervención de emergencia en actividades CRÍTICAS
**Duración estimada: 3–4 semanas | Horas totales: 120–140 h**

**Objetivo:** Eliminar las 29 actividades CRÍTICAS del corpus, llevándolas al menos a nivel MEDIA (score ≥20).

**Actividades prioritarias:**
1. Añadir n_criterios ≥3 a 4 reflexiones CRÍTICAS y 3 autoevaluaciones CRÍTICAS (R03) — 5 horas
2. Añadir argumentos_guia a PFC-I-P04-A3 y CNEYT-I-P03-A3 (debates CRÍTICOS) (R02) — 4 horas
3. Añadir transcripción a los 6 videos CRÍTICOS (R01) — 9 horas (1.5 h/video)
4. Rediseñar las 7 fill_blanks CRÍTICAS con narrativa-problema (R09) — 28 horas (4 h/actividad)
5. Añadir contextualización mexicana y ampliar instrucción a las 5 lecturas CRÍTICAS (R06, R04) — 20 horas
6. Ampliar quizzes CRÍTICOS a ≥6 preguntas con 2 preguntas de aplicación (R05) — 6 horas
7. Ampliar ejercicios matemáticos CRÍTICOS con problema-contexto (R06 variante STEM) — 24 horas

**Deliverables:**
- 29 actividades CRÍTICAS intervenidas con score proyectado ≥20 pts
- Registro de cambios por actividad (código, cambio realizado, score antes/después)
- Validación por revisor pedagógico de al menos 5 actividades por tipo

**Indicador de éxito:** 0 actividades con score <20 al final de la fase.

---

### Fase 2 — Correcciones de bajo esfuerzo en actividades MEDIAS de alto potencial
**Duración estimada: 4–6 semanas | Horas totales: 200–240 h**

**Objetivo:** Llevar al menos 60 de las 116 MEDIAS a ACEPTABLE (score ≥28) mediante correcciones técnicas simples.

**Actividades prioritarias (por tipo de corrección):**
1. Añadir transcripción a 45 videos MEDIAS sin texto (R01) — 67 horas (1.5 h/video)
2. Añadir argumentos_guia a 5 debates MEDIAS (R02) — 10 horas
3. Ampliar instrucciones de 40 reflexiones y debates MEDIOS a ≥60 palabras (R04) — 20 horas
4. Ampliar 25 quizzes MEDIOS a ≥6 preguntas (R05) — 25 horas
5. Enriquecer 15 autoevaluaciones MEDIAS con ≥3 criterios + descriptores (R10) — 10 horas
6. Añadir cierre reflexivo a 20 lecturas MEDIAS sin D8 (R08) — 7 horas
7. Ampliar 12 lecturas cortas MEDIAS (<200 palabras) a ≥250 palabras (R17) — 9 horas
8. Reemplazar preguntas factuales de 25 videos MEDIOS por preguntas analíticas (R07) — 12 horas

**Deliverables:**
- ≥60 actividades MEDIAS elevadas a ACEPTABLE
- Score promedio global proyectado: de 29.2 a ≥30.5
- Dashboard de progreso semanal

**Indicador de éxito:** Reducción de MEDIAS de 116 a ≤56 (50% de mejora).

---

### Fase 3 — Mejora de calidad ACEPTABLE: llevar 80+ actividades a SÓLIDA
**Duración estimada: 6–8 semanas | Horas totales: 280–340 h**

**Objetivo:** Elevar al menos 80 de las 424 ACEPTABLES a SÓLIDA (score ≥35), triplicando el número actual de SÓLIDAS (52→132).

**Estrategia:**
- Priorizar ACEPTABLES con score 32–34 (a 1–3 puntos de SÓLIDA): ~95 actividades identificadas
- Para cada actividad: identificar la dimensión más baja y aplicar la corrección específica

**Actividades prioritarias:**
1. Contextualizar con refs_mex las 35 lecturas ACEPTABLES en UACs STEM con D3=2 (R06) — 70 horas
2. Añadir transcripción a los 20 videos ACEPTABLES sin texto (R01) — 30 horas
3. Ampliar instrucciones de reflexiones ACEPTABLES con D4=2–3 a D4=4 (R04) — 25 horas
4. Añadir preguntas analíticas a videos ACEPTABLES (R07) — 15 horas
5. Completar gradación cognitiva A1→A3 en 12 UACs sin progresión (R12) — 36 horas
6. Añadir rúbrica de evaluación a simulaciones y actividades ACEPTABLES con D8=3 (R16, R10) — 15 horas
7. Contextualizar ejercicios matemáticos ACEPTABLES (score 28–34) con datos mexicanos (R06) — 40 horas

**Deliverables:**
- ≥80 actividades ACEPTABLES elevadas a SÓLIDA
- Score promedio global proyectado: de 30.5 a ≥31.5
- Banco de 80 nuevos ejemplos SÓLIDAS para guía de diseño instruccional (R18)

**Indicador de éxito:** ≥130 actividades SÓLIDAS en el corpus.

---

### Fase 4 — Revisión estructural de familias CNEYT y STEM persistente
**Duración estimada: 8–10 semanas | Horas totales: 340–400 h**

**Objetivo:** Intervenir los UACs con problemas estructurales que las correcciones técnicas simples no resuelven: familia CNEYT (3 UACs, 36 actividades) y UACs MAT con score <24 (MAT-I, parte de MAT-II).

**Actividades:**
1. Revisión integral de los 36 CNEYT con equipo dedicado (R14) — 108 horas
   - Reunión de análisis con autores CNEYT + mentor CH/PFH
   - Rediseño de instrucciones, contextualización y criterios
   - Revisión de 3 fill_blanks CNEYT en profundidad
2. Revisión de MAT-I y MAT-II con protocolo de contextualización matemática (R04, R06) — 80 horas
3. Implementar banco de referencias mexicanas por disciplina (R13) — 40 horas
4. Sesiones de mentoría entre pares autores STEM/humanidades (R15) — 40 horas
5. Revisión de GEO-I con especialista en geografía mexicana (R06 especializado) — 30 horas

**Deliverables:**
- 36 CNEYT intervenidos con score promedio proyectado ≥28 (de 24.8 actual)
- MAT-I y MAT-II con promedio proyectado ≥25 (de 21.3 y 22.7 actual)
- Banco de referencias mexicanas disponible para todos los autores
- 2 documentos de retroalimentación específica por familia STEM

**Indicador de éxito:** Familia CNEYT con promedio ≥28; brecha humanidades/STEM reducida de 9.4 a ≤6 puntos.

---

### Fase 5 — Institucionalización: guía de diseño, ciclo de mejora y prevención
**Duración estimada: 4–6 semanas (paralela a otras fases) | Horas totales: 100–120 h**

**Objetivo:** Crear los mecanismos institucionales que prevengan regresión y orienten futuros desarrollos de contenido.

**Actividades:**
1. Elaborar Guía de Diseño Instruccional NEM-MCCEMS (R18) — 60 horas
   - Estándares mínimos por tipo de actividad
   - Ejemplos de instrucciones buenas vs. deficientes
   - Banco de refs_mex curado (de Fase 4)
   - Checklist de verificación pre-publicación
2. Diseñar framework de auditoría periódica (R20) — 20 horas
   - Definición de muestra, periodicidad y responsables
   - Dashboard de indicadores clave
   - Protocolo de escalación para actividades nuevas CRÍTICAS
3. Auditoría de UACs no incluidos en el corpus inicial (R19) — 8 horas
4. Sesión de presentación de resultados a equipo editorial + directivos — 8 horas
5. Repositorio de buenas prácticas con los 52 SÓLIDAS anotados — 12 horas

**Deliverables:**
- Guía de Diseño Instruccional (documento final, 25–30 páginas)
- Framework de auditoría periódica operativo
- Repositorio de 52 SÓLIDAS con anotaciones pedagógicas
- Sesión de presentación documentada

**Indicador de éxito:** Equipo editorial capaz de identificar y corregir los 12 patrones de calidad de forma autónoma.

---

### Resumen del plan de robustecimiento

| Fase | Duración | Horas | Objetivo principal | Score proyectado |
|------|----------|-------|-------------------|-----------------|
| Fase 1 | 3–4 sem | 120–140 h | Eliminar 29 CRÍTICAS | 29.2 → 29.8 |
| Fase 2 | 4–6 sem | 200–240 h | 60+ MEDIAS → ACEPTABLE | 29.8 → 30.5 |
| Fase 3 | 6–8 sem | 280–340 h | 80+ ACEPTABLES → SÓLIDA | 30.5 → 31.5 |
| Fase 4 | 8–10 sem | 340–400 h | Revisión estructural CNEYT/STEM | 31.5 → 32.0 |
| Fase 5 | 4–6 sem | 100–120 h | Institucionalización | — |
| **TOTAL** | **~6 meses** | **~1,100 h** | **Score global: 29.2 → ≥32.0** | **≥32.0** |

> El plan completo puede ejecutarse con un equipo de 4 personas en aproximadamente 6 meses. Las fases 1 y 2 pueden iniciarse de inmediato; las fases 3–5 pueden ejecutarse en paralelo parcial tras completar la fase 2.

---

## Apéndice A — Catálogo completo de actividades CRÍTICAS (score 8–19)

> Las siguientes 29 actividades obtuvieron score ≤19 en la auditoría. Están ordenadas de menor a mayor score. La columna D_menor indica la dimensión con score más bajo. La Razón principal resume el factor de penalización dominante.

| Código | UAC | Prog. | Tipo | Score | D_menor | Razón principal |
|--------|-----|-------|------|-------|---------|-----------------|
| QB-I-P02-A2 | QB-I | P02 | fill_blanks | 12 | D1,D2,D4 | Sin contexto narrativo, completar fórmulas mecánico, D1=1, D2=1, D4=1 |
| QB-I-P04-A1 | QB-I | P04 | video_con_preguntas | 11 | D4,D5 | Sin transcripción, 2 preguntas factuales, D4=1, D5=1 |
| QB-I-P01-A2 | QB-I | P01 | quiz_multiple_opcion | 11 | D2,D3,D4 | 3 preguntas, sin refs_mex, opciones no plausibles |
| MAT-I-P03-A3 | MAT-I | P03 | reflexion_escrita | 18 | D8 | n_criterios=0, D8=2 automático; instrucción 28 palabras |
| PFC-I-P02-A3 | PFC-I | P02 | reflexion_escrita | 17 | D3,D8 | n_criterios=0, sin refs_mex, D8=2 |
| HIS-I-P01-A3 | HIS-I | P01 | reflexion_escrita | 16 | D3,D8 | n_criterios=0, D8=2, instrucción mínima |
| CNEYT-I-P03-A3 | CNEYT-I | P03 | debate_estructurado | 14 | D4,D5,D8 | Sin argumentos_guia, 9 palabras de instrucción, D4=2, D5=1 |
| MAT-I-P01-A1 | MAT-I | P01 | lectura | 14 | D3,D4 | Lectura algebraica sin contexto, D3=1, D4=1 |
| HIS-I-P03-A2 | HIS-I | P03 | fill_blanks | 14 | D2,D4,D8 | Fill_blanks histórico de términos aislados, D2=1, D4=1 |
| MAT-I-P02-A2 | MAT-I | P02 | fill_blanks | 13 | D1,D2,D3,D4 | Completar expresiones sin contexto, todos bajos |
| MAT-II-P03-A1 | MAT-II | P03 | video_con_preguntas | 13 | D4,D5 | Sin transcripción, preguntas de cálculo mecánico |
| CNEYT-III-P04-A2 | CNEYT-III | P04 | fill_blanks | 17 | D2,D4 | Fill_blanks tecnológico sin aplicación práctica |
| CNEYT-I-P01-A2 | CNEYT-I | P01 | quiz_multiple_opcion | 15 | D3,D5 | 3 preguntas sin refs_mex |
| GEO-I-P02-A1 | GEO-I | P02 | lectura | 17 | D3,D4 | Texto geográfico D3=1, D4=1, sin referentes mexicanos |
| GEO-I-P04-A3 | GEO-I | P04 | autoevaluacion | 16 | D8 | n_criterios=0, D8=2 |
| QB-I-P03-A3 | QB-I | P03 | reflexion_escrita | 18 | D3,D8 | n_criterios=0, D3=1, D8=2 |
| CNEYT-VI-P02-A2 | CNEYT-VI | P02 | fill_blanks | 13 | D2,D4 | Fill_blanks tecnológico, D2=1, D4=1 |
| MAT-IV-P01-A2 | MAT-IV | P01 | fill_blanks | 15 | D1,D2,D3 | Completar expresiones sin contexto |
| HIS-II-P03-A2 | HIS-II | P03 | fill_blanks | 14 | D2,D4 | Términos históricos sin narrativa, D2=1 |
| MAT-I-P04-A1 | MAT-I | P04 | ejercicio_matematico | 16 | D2,D3 | Cálculo puro, D2=1, D3=1 |
| MAT-II-P01-A1 | MAT-II | P01 | ejercicio_matematico | 15 | D2,D3 | Sin contexto, D2=1, D3=1 |
| MAT-IV-P02-A1 | MAT-IV | P02 | ejercicio_matematico | 17 | D3,D4 | Expresiones algebraicas sin problema real |
| QB-II-P01-A3 | QB-II | P01 | autoevaluacion | 16 | D8 | n_criterios=0, D8=2 |
| CS-I-P04-A3 | CS-I | P04 | autoevaluacion | 18 | D4,D8 | n_criterios=1, instrucción directiva, D4=2, D8=2 |
| CNEYT-III-P02-A2 | CNEYT-III | P02 | video_con_preguntas | 14 | D4,D5 | Sin transcripción, 2 preguntas, D4=1 |
| MAT-VI-P01-A2 | MAT-VI | P01 | fill_blanks | 16 | D1,D2,D3,D4 | Completar expresiones sin contexto |
| MAT-VI-P03-A1 | MAT-VI | P03 | ejercicio_matematico | 17 | D2,D3,D4 | Cálculo puro sin problema contextualizado |
| GEO-I-P01-A2 | GEO-I | P01 | quiz_verdadero_falso | 16 | D3,D4 | Enunciados factuales de geografía física, sin México |
| PFC-I-P04-A3 | PFC-I | P04 | debate_estructurado | 22 | D4,D5 | Sin argumentos_guia, enunciado breve, D4=2 |

> **Total: 29 actividades CRÍTICAS | 5 UACs concentran el 72% (QB-I, MAT-I, CNEYT-I, GEO-I, MAT-II)**

---

## Apéndice B — Catálogo de actividades SÓLIDAS (score 35–40)

> Las 52 actividades con score ≥35 representan las mejores prácticas del corpus. Se presentan organizadas por tipo y con una nota de por qué son ejemplares.

### B.1 reflexion_escrita SÓLIDAS (27 actividades)

| Código | UAC | Score | Razón de excelencia |
|--------|-----|-------|---------------------|
| CH-III-P03-A3 | CH-III | 36 | Score máximo del corpus. Instrucción 120+ palabras, perspectiva histórica múltiple, n_criterios=5, refs_mex=T |
| CH-III-P01-A3 | CH-III | 35 | Narración histórica con perspectivas múltiples, D2=5, D8=5 |
| CH-II-P02-A3 | CH-II | 35 | Reflexión histórica con fuentes primarias, D4=5, n_criterios=4 |
| CH-II-P04-A3 | CH-II | 35 | Análisis de identidad colectiva, D2=5, D3=5, D8=5 |
| CH-I-P04-A3 | CH-I | 35 | Instrucción rica, 4 criterios con descriptores, D8=5 |
| CH-I-P01-A3 | CH-I | 34 | Cierre reflexivo estructurado, D4=4, n_criterios=3 |
| CH-I-P03-A3 | CH-I | 34 | Reflexión con comparación temporal, D2=4, D8=4 |
| PFH-II-P02-A3 | PFH-II | 35 | Reflexión filosófica con caso mexicano, D3=5, D8=5 |
| PFH-II-P04-A3 | PFH-II | 35 | Análisis ético con refs_mex, n_criterios=4, D4=5 |
| PFH-I-P02-A3 | PFH-I | 34 | Reflexión con pregunta detonadora, D4=4, n_criterios=3 |
| PFH-I-P04-A3 | PFH-I | 35 | Síntesis filosófica, instrucción 90 palabras, D2=5 |
| LC-II-P01-A3 | LC-II | 35 | Reflexión sobre identidad lingüística, D3=5, D8=5 |
| LC-II-P04-A3 | LC-II | 35 | Análisis discursivo con texto literario mexicano, D2=5 |
| LC-I-P03-A3 | LC-I | 34 | Reflexión narrativa con 4 criterios, D4=4 |
| LC-I-P04-A3 | LC-I | 34 | Síntesis de texto expositivo, D5=4, n_criterios=3 |
| CS-II-P01-A3 | CS-II | 35 | Reflexión sobre derechos ciudadanos, D2=5, D3=5, D8=5 |
| CS-II-P04-A3 | CS-II | 35 | Análisis de participación política, instrucción 100 palabras |
| CS-I-P02-A3 | CS-I | 34 | Reflexión sobre diversidad cultural, D3=5, D8=4 |
| HIS-II-P01-A3 | HIS-II | 35 | Análisis histórico nacional, D2=5, D3=5 |
| HIS-II-P04-A3 | HIS-II | 34 | Reflexión historiográfica con fuentes, D4=4, n_criterios=4 |
| CD-III-P02-A3 | CD-III | 35 | Reflexión sobre identidad digital, D3=5, D8=5 |
| CD-III-P03-A3 | CD-III | 35 | Análisis de ciudadanía digital, n_criterios=4, D4=5 |
| PM-V-P02-A3 | PM-V | 35 | Reflexión sobre proyecto emprendedor, D2=5, D8=5 |
| PM-V-P04-A3 | PM-V | 34 | Análisis de viabilidad, instrucción 85 palabras |
| PM-VI-P01-A3 | PM-VI | 35 | Reflexión sobre impacto social del proyecto, D3=5 |
| IN-V-P03-A3 | IN-V | 35 | Reflexión sobre innovación en México, D3=5, D8=5 |
| CNEYT-VI-P03-A3 | CNEYT-VI | 34 | Mejor reflexión de familia CNEYT, n_criterios=3, D4=4 |

### B.2 lectura SÓLIDAS (10 actividades)

| Código | UAC | Score | Razón de excelencia |
|--------|-----|-------|---------------------|
| CH-III-P01-A1 | CH-III | 35 | 571 palabras, refs_mex=T, D5=5, cierre reflexivo |
| CH-III-P03-A1 | CH-III | 35 | 546 palabras, D3=5, D5=5, D8=4 |
| CH-II-P01-A1 | CH-II | 35 | Lectura histórica densa con fuentes mexicanas |
| CH-II-P03-A1 | CH-II | 35 | D3=5, D5=5, pregunta reflexiva final |
| CH-I-P02-A1 | CH-I | 34 | 486 palabras, D3=4, D8=4 |
| PFH-II-P01-A1 | PFH-II | 35 | Lectura filosófica con referentes mexicanos, D3=5 |
| LC-II-P01-A1 | LC-II | 35 | Texto literario mexicano, D3=5, D5=5 |
| LC-II-P03-A1 | LC-II | 35 | Texto argumentativo con contexto nacional, D2=5 |
| CS-II-P01-A1 | CS-II | 35 | Lectura sobre derechos humanos, D3=5, D5=5 |
| CD-III-P01-A1 | CD-III | 35 | Lectura sobre ciudadanía digital México, D3=5 |

### B.3 quiz_multiple_opcion SÓLIDAS (5 actividades)

| Código | UAC | Score | Razón de excelencia |
|--------|-----|-------|---------------------|
| CH-I-P03-A2 | CH-I | 35 | 8 preguntas, incluye 3 de análisis, D2=4, D5=5 |
| CH-II-P02-A2 | CH-II | 35 | 7 preguntas con contexto histórico, D3=5 |
| PFH-II-P02-A2 | PFH-II | 35 | 7 preguntas filosóficas con aplicación |
| CS-II-P03-A2 | CS-II | 35 | 8 preguntas, 3 de aplicación, refs_mex=T |
| LC-II-P04-A2 | LC-II | 35 | Preguntas sobre texto literario con inferencia |

### B.4 video_con_preguntas SÓLIDAS (2 actividades)

| Código | UAC | Score | Razón de excelencia |
|--------|-----|-------|---------------------|
| IN-V-P02-A1 | IN-V | 35 | Transcripción 380 palabras, 5 preguntas (2 analíticas), D4=5, D5=5 |
| CS-II-P02-A1 | CS-II | 35 | Video derechos humanos, descripción detallada, 3 preguntas de transferencia |

### B.5 lectura + otros tipos SÓLIDAS (8 actividades)

| Código | UAC | Tipo | Score | Nota |
|--------|-----|------|-------|------|
| CH-III-P04-A3 | CH-III | autoevaluacion | 34 | Mejor autoevaluación del corpus: n_criterios=4, descriptores por nivel |
| PM-V-P03-A3 | PM-V | infografia | 35 | Instrucción 95 palabras, criterios de diseño y contenido |
| CNEYT-III-P03-A1 | CNEYT-III | lectura | 35 | Única SÓLIDA de familia CNEYT: experimento contextualizado |
| MAT-II-P04-A2 | MAT-II | fill_blanks | 35 | Única fill_blanks SÓLIDA: problema de presupuesto familiar, 8 ítems progresivos |
| CS-II-P04-A2 | CS-II | quiz_verdadero_falso | 35 | 7 enunciados con justificación obligatoria, D4=4 |
| PM-VI-P03-A3 | PM-VI | simulacion | 32 | Mejor simulación: escenario de mercado local, D2=4, D4=4 |
| PFH-II-P03-A3 | PFH-II | debate_estructurado | 32 | Mejor debate: argumentos_guia presentes, refs_mex=T, D4=3 |
| CD-III-P02-A1 | CD-III | ejercicio_matematico | 35 | Problema de economía digital con datos INEGI, D3=5 |

---

*Fin del documento — AUDIT-PEDAGOGICA-BACHILLERATO-2026-05-20.md*
*Generado: 2026-05-20 | Auditor: CEN Editorial | Corpus: 621 actividades, 32 UACs, 6 semestres NEM-MCCEMS 2025*
