# Guía de Revisión Pedagógica — CEN Bachillerato

**Versión:** 1.0 (2026-05-16)  
**Audiencia:** Coordinadores pedagógicos, expertos en RSC, área académica CEN

---

## Propósito

Este documento guía el proceso de revisión y validación del contenido pedagógico del Semestre 1. Todo el contenido actualmente tiene `es_placeholder=true` y debe ser revisado antes de mostrarse como "oficial" a los estudiantes.

---

## Criterios de revisión por progresión

Para cada progresión, el revisor debe verificar:

### 1. Alineación MCCEMS
- [ ] El título refleja fielmente el contenido del programa de estudios oficial del subsistema
- [ ] La categoría y subcategoría son precisas y útiles para la navegación
- [ ] Los ejes articuladores aplicados corresponden al Acuerdo 09/08/23
- [ ] Las transversalidades identificadas son reales (no forzadas)

### 2. Meta de aprendizaje
- [ ] Inicia con un verbo de desempeño observable (taxonomía de Bloom revisada)
- [ ] Es alcanzable en el tiempo estimado con grupos de bachillerato
- [ ] Es evaluable (se puede saber si el estudiante la logró o no)
- [ ] Es pertinente al nivel A1/A2/A3 de bachillerato (no es de licenciatura ni de secundaria)

### 3. Descripción extendida
- [ ] Describe el propósito pedagógico, no solo el contenido temático
- [ ] Menciona actividades o estrategias concretas
- [ ] Conecta lo teórico con situaciones del entorno del estudiante
- [ ] El lenguaje es claro y accessible para docentes, no solo para especialistas

### 4. Tiempo estimado
- [ ] Es realista para grupos de 30 estudiantes en sesiones de 50 min
- [ ] Incluye tiempo de actividades, no solo de explicación docente
- [ ] Considera la diversidad de ritmos de aprendizaje

---

## Proceso de validación

### Paso 1: Revisión individual (por experto en RSC)
Cada experto revisa las progresiones de su RSC usando los criterios anteriores. Puede editar directamente el script de seed correspondiente o documentar cambios en un comentario/issue.

### Paso 2: Validación cruzada
Un segundo revisor de otra UAC verifica que las transversalidades declaradas son coherentes desde ambos lados.

### Paso 3: Aprobación pedagógica
El coordinador pedagógico de CEN aprueba el contenido y autoriza cambiar `es_placeholder=false`.

### Paso 4: Actualización en base de datos
Ejecutar el script de actualización:
```sql
UPDATE progresiones 
SET es_placeholder = false 
WHERE codigo LIKE 'LC-I-%'  -- o el prefijo de la UAC validada
```

---

## Escala de prioridad de revisión

Las UAC con mayor matrícula esperada deben revisarse primero:

| Prioridad | UAC | Razón |
|-----------|-----|-------|
| 1 | LC-I | Base de todas las demás UAC |
| 2 | PM-I | Alta demanda y complejidad técnica |
| 3 | CNEYT-I | Mayor número de progresiones (10) |
| 4 | CS-I, HUM-I | Contenido contextual crítico |
| 5 | IN-I, CD-I | Competencias instrumentales |

---

## Ejemplos de correcciones comunes

### Meta de aprendizaje demasiado vaga
❌ `Conocerá los elementos de la comunicación`  
✅ `Analiza los elementos y funciones del proceso comunicativo en situaciones concretas, reconociendo la intencionalidad y el contexto como factores determinantes del significado`

### Tiempo subestimado
❌ `2 h` para una progresión que implica experimentación + análisis + producción escrita  
✅ `5 h` con desglose: 1h teoría + 2h experimentación + 1h análisis + 1h producción

### Transversalidad forzada
❌ `HUM-I` como transversalidad de `PM-I-P01` (números reales) — sin conexión real  
✅ Eliminar esa transversalidad o justificarla con una actividad concreta que la vincule

---

## Formato para reportar cambios

Al identificar un cambio necesario, documéntalo así:

```
PROGRESIÓN: [codigo]
CAMPO: [titulo|meta_aprendizaje|descripcion|descripcion_extendida|ejes_articuladores|transversalidades|tiempo_estimado_horas]
VALOR ACTUAL: [texto actual]
VALOR PROPUESTO: [texto corregido]
JUSTIFICACIÓN: [por qué se necesita el cambio]
REVISOR: [nombre del revisor]
```

---

## Tipos de actividades disponibles

Para la asignación futura de actividades a las progresiones, los 12 tipos disponibles son:

| Tipo | Mejor para... |
|------|--------------|
| `lectura` | Introducir conceptos, contextualizar |
| `quiz_multiple_opcion` | Evaluar conocimiento declarativo |
| `quiz_verdadero_falso` | Verificar comprensión de afirmaciones |
| `fill_blanks` | Consolidar vocabulario y definiciones |
| `ejercicio_matematico` | PM-I, CNEYT-I — problemas con solución |
| `reflexion_escrita` | HUM-I, CS-I, LC-I — pensamiento crítico |
| `video_con_preguntas` | CNEYT-I, IN-I — contenido audiovisual |
| `infografia` | CNEYT-I, CD-I — representación visual |
| `debate_estructurado` | CS-I, HUM-I — argumentación |
| `simulacion` | CNEYT-I — laboratorios virtuales |
| `glosario_interactivo` | Todas las UAC — vocabulario técnico |
| `autoevaluacion` | Metacognición y autorregulación |

---

## Contacto y seguimiento

Para dudas o para reportar cambios urgentes, contactar al equipo de desarrollo CEN.  
El rastreo de progresiones validadas se hará mediante el campo `es_placeholder` en la base de datos.
