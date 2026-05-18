# Decisiones de Diseño — Actividades Semestre 1

Documento de registro de decisiones no-obvias tomadas durante la generación y auditoría
de las 144 actividades del Semestre 1. Sirve como contexto para futuras revisiones pedagógicas.

---

## DEC-01: debate_estructurado como A2 en CS-I

**UAC afectada:** CS-I (Ciencias Sociales I) — 4 progresiones (P01–P04)  
**Tipo de actividad en A2:** `debate_estructurado`  
**Flag del auditor:** Fase 6 marca "secuencia rota" porque `debate_estructurado` no está en `TIPOS_A2`

### Decisión

`debate_estructurado` ES un tipo válido de actividad de práctica (A2) para Ciencias Sociales.
La heurística del auditor define `TIPOS_A2 = [quiz_multiple_opcion, quiz_verdadero_falso,
fill_blanks, ejercicio_matematico, simulacion]`, pero esta lista es genérica y no contempla
las particularidades disciplinares de las ciencias sociales.

### Justificación

El enfoque pedagógico oficial de CS-I (MCC EMS 2025) es **sociohistórico crítico**: los
propósitos formativos 1–4 incluyen "examinar", "analizar", "problematizar" y "discutir",
todos verbos que implican práctica discursiva y argumentativa. Un quiz de opción múltiple
como A2 sería reductivo y contrario al enfoque. El debate estructurado:

- Es coherente con los propósitos formativos de CS-I (especialmente PF4: "Discute y reconoce
  que la diversidad forma parte del espacio democrático")
- Permite la práctica argumentativa que el MCCEMS privilegia sobre la memorización
- Es la forma canónica de práctica en ciencias sociales y filosofía política

### Acción

**No se modifica.** Las 4 progresiones de CS-I mantienen `debate_estructurado` como A2.

La heurística del auditor debe actualizarse en futuras versiones para aceptar
`debate_estructurado` como tipo válido de A2 para CS-I.

---

## DEC-02: Lecturas con texto <200 palabras en IN-I

**UAC afectada:** IN-I (Inglés I, nivel A1) — 8 lecturas (P01-A1 a P08-A1)  
**Rango de palabras:** 142–198 palabras (promedio ≈163)  
**Flag del auditor:** Fase 3 marca 8 actividades como MEDIUM (texto corto <200 palabras)

### Decisión

Las lecturas bilingües de IN-I DEBEN ser más cortas que las de otras UAC. La longitud
de 142–198 palabras es deliberada y pedagógicamente correcta para nivel A1.

### Justificación

- **Nivel A1 (MCER):** El Marco Común Europeo de Referencia define A1 como el nivel más
  básico, donde los textos auténticos deben ser "cortos y simples". El MCCEMS Inglés I
  especifica explícitamente nivel A1.
- **Formato bilingüe:** Las lecturas de IN-I incluyen texto en inglés + glosas en español,
  lo que las hace didácticamente más densas de lo que el conteo de palabras sugiere.
- **Propósitos A1:** Los propósitos formativos 1–8 de IN-I trabajan vocabulario y frases
  básicas, no comprensión de textos extendidos.
- **Principio de input comprensible (Krashen):** Textos largos y complejos generan ansiedad
  y bloqueo en aprendices de nivel A1.

### Acción

**No se modifica.** Las 8 lecturas de IN-I mantienen su longitud actual.

El auditor de calidad debe incluir una excepción para IN-I: umbral de texto corto = 150
palabras (no 200) cuando `UAC = IN-I` y `tipo = lectura`.

---

## DEC-03: Lecturas con texto <200 palabras en LC-I, CD-I y PM-I

**UAC afectadas:**
- LC-I: 8 lecturas (144–179 palabras)
- CD-I: 6 lecturas (187–199 palabras)
- PM-I: 6 lecturas (175–197 palabras)

**Flag del auditor:** Fase 3 marca 20 actividades adicionales como MEDIUM

### Decisión

Estas lecturas son borderline (la mayoría entre 175–199 palabras). Se documentan como
deuda pedagógica menor, no como error crítico.

### Justificación

- Las lecturas están en el rango 144–199 palabras, cercano al umbral de 200.
- Representan el 14% de las actividades totales.
- El umbral de 200 palabras es una heurística orientativa, no un requisito oficial del MCCEMS.
- El contenido cubre los propósitos formativos pertinentes pese a la extensión.

### Acción

**Pendiente de decisión humana.** Si en revisión pedagógica se considera necesario ampliar
estas lecturas, debe hacerse con revisión de contenido por un docente especialista, no
automáticamente.

**Prioridad recomendada:** Baja. Atender después de validación funcional y piloto con
estudiantes.

---

## DEC-04: Heurísitica de secuencia pedagógica (TIPOS_A1/A2/A3)

**Contexto:** El auditor de Fase 6 usa listas fijas de tipos válidos por posición:
- A1 (contextualización): `lectura, video_con_preguntas, infografia, glosario_interactivo`
- A2 (práctica): `quiz_multiple_opcion, quiz_verdadero_falso, fill_blanks, ejercicio_matematico, simulacion`
- A3 (cierre): `reflexion_escrita, debate_estructurado, autoevaluacion`

### Decisión

Esta heurística es orientativa y no exhaustiva. Las excepciones deben documentarse (ver
DEC-01 para CS-I) pero no implican defecto si tienen justificación pedagógica.

Para futuras expansiones del auditor, considerar:
- `debate_estructurado` como A2 válido para ciencias sociales y humanidades
- `autoevaluacion` como A2 válido cuando funciona como práctica reflexiva
- `glosario_interactivo` como A3 válido cuando consolida vocabulario

---

*Última actualización: 2026-05-17*  
*Generado durante sesión de auditoría de robustez — Semestre 1*
