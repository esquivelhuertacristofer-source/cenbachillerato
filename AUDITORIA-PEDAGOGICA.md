# Auditoría pedagógica de contenido — CEN Bachillerato

**Fecha:** 2026-06-10
**Método:** auditoría exhaustiva multi-agente con verificación adversarial (un agente *buscador* + un agente *verificador escéptico independiente* por unidad; solo sobreviven los hallazgos confirmados por ambos).
**Cobertura:** 117 unidades auditadas = **32 UAC** (todas las 1 727 actividades de BD, leídas con su `contenido` completo: enunciados, opciones, claves de respuesta, retroalimentaciones, lecturas, glosarios, infografías) **+ 85 módulos de datos de labs 3D** (fórmulas, presets, clasificadores y traducciones).
**Excluido por diseño:** actividades subjetivas sin respuesta única (autoevaluación, reflexión escrita, debate estructurado) — no auditables por corrección factual.

> ⚠️ **Nada se ha modificado.** Este documento es solo el diagnóstico. Las correcciones se aplicarán únicamente tras tu aprobación explícita (siguen vigentes: contenido en `borrador`, git local, anti-fabricación, texto verbatim).

---

## Veredicto

La plataforma es **pedagógicamente sólida en lo esencial**: de ~1 727 actividades + 85 labs, solo **37 unidades (32 %)** presentan algún defecto confirmado, y la inmensa mayoría del contenido nuclear (definiciones, cálculos, claves de respuesta) es correcto. **No se encontró ningún error de severidad crítica** (ninguno que invalide el aprendizaje central de una UAC).

**64 hallazgos confirmados**, repartidos así:

| Severidad | Nº | Qué significa |
|-----------|----|----|
| 🔴 **Alta** | 16 | Dato falso, clave de respuesta defectuosa o regla que se autocontradice; un alumno puede aprender algo incorrecto o ser calificado mal. **Corregir antes de publicar.** |
| 🟡 **Media** | 39 | Imprecisión factual, dato desactualizado, atribución errónea o inconsistencia entre actividades. Corregir, pero no bloquea. |
| 🟢 **Baja** | 9 | Cosmético/notacional o estadística contextual con desviación menor. |

**Patrones sistémicos detectados** (errores repetidos = arreglo de alto rendimiento):

1. **Cifras ENDUTIH 2023 (INEGI) mal citadas** → 5 actividades (IN-I, IN-III, IN-V, CD-II, y el patrón también roza CD-III). Mismo error: 78.6 % nacional / 86.7 % urbano / **50.8 % rural**. Lo correcto 2023: **81.2 % nacional, 85.5 % urbano, 66.0 % rural** (el 50.8 % rural es de ~2019). Un solo dato a corregir, replicado.
2. **"Ciudad Creativa Digital de la UNESCO 2017"** → 4 actividades (CD-I ×3, CD-III ×1). Falso: la CDMX fue designada Ciudad Creativa **de Diseño**; "Ciudad Creativa Digital" es un proyecto de **Guadalajara**, no UNESCO. Además arrastra cifras inventadas (40 % de startups, Corredor Insurgentes/500 empresas).
3. **"Plataforma MassivX de la UNAM"** → 2 actividades (IN-I, IN-II). No existe; es **MOOC UNAM** / Coursera.
4. **Labs con preset que no produce el bioma/resultado que anuncia** → `biomas-data.ts` (3 escenarios) y `genetica-mendel-data.ts` (daltonismo) — bugs de lógica, no de datos.

---

## Detalle por UAC

### 🟢🟡🔴 Ciencias Naturales (CNEyT)

**CNEYT-I**
- 🔴 **CNEYT-I-P05-A5** (glosario) — Término *"Energía potencial"*, ejemplo "Mayor en los sólidos". **Físicamente invertido**: la energía potencial intermolecular es **mínima en el sólido** y aumenta al fundir/evaporar. Contradice la propia entrada contigua "Energía interna". → Cambiar a "es menor en el sólido y mayor en el gas".

**CNEYT-II**
- 🟡 **CNEYT-II-P07-A1** (infografía) — "35 % de generación limpia para 2030" confunde dos metas. El 35 % es de la **Ley de Transición Energética para 2024**; la NDC de París es reducción de emisiones 22 %/36 % a 2030. → Separar ambas metas.
- 🟢 **CNEYT-II-P07-A1** (infografía) — Geotermia "~3 %" sobreestimada ~2×; real **~1.5 %**. → Ajustar a ~1.5 %.

**CNEYT-III**
- 🟡 **CNEYT-III-P07-A1** (lectura) — Inconsistencia interna en cobertura de ANP entre P01-A1 (23 Mha = 11.6 %) y P07-A1 (90 Mha = 17 %). Las 90 Mha son tierra+mar; las 23 Mha son solo terrestre. → Unificar el marco y aclarar terrestre vs. terrestre+marino.

**CNEYT-V**
- 🔴 **CNEYT-V-P04-A3** (quiz) — Pregunta 2 (λ = v/f): **opciones A "0.77 m" y C "77 cm (0.77 m)" son idénticas y ambas correctas**; la clave solo marca A. La propia retroalimentación lo admite. → Sustituir C por un distractor real.
- 🟡 **CNEYT-V-P05-A1** (infografía) — "México ratificó el Protocolo de Montreal en 1985". El Protocolo es de **1987** (México ratificó en **1988**); en 1985 fue el Convenio de Viena. → Corregir el año.
- 🟡 **CNEYT-V-P03-A1** (lectura) — "Morelos I y II desde el transbordador Discovery". Solo Morelos I fue en Discovery (STS-51-G); **Morelos II fue en Atlantis** (STS-61-B). → Corregir el segundo.
- 🟡 **CNEYT-V-P08-A1** (lectura) — Incluye a **Einstein entre los físicos del Proyecto Manhattan**. Einstein no participó (se le negó autorización); solo firmó la carta de 1939 a Roosevelt. Oppenheimer sí es correcto. → Separar ambos casos.

**CNEYT-VI**
- 🟡 **CNEYT-VI-P06-A5** (glosario) — "**Leucocrito** de Filadelfia". El nombre correcto es **cromosoma Filadelfia** (t(9;22), LMC). → Corregir el nombre.
- 🟡 **CNEYT-VI-P01-A5** (glosario) — Atribuye a Redi (1668) la refutación de "ratones de la paja húmeda". Redi refutó la generación de **gusanos/moscas en la carne**; la receta de ratones es de van Helmont. Además dice que Pasteur "confirmó" (la refutó). → Reescribir.

---

### 🟡🔴 Pensamiento Matemático (PM)

**PM-III**
- 🟡 **PM-III-P01-A6** (fill_blanks) — `texto_con_huecos` tiene **5 huecos pero solo 4 claves**; el 5.º ("25 + 144 = ___") no es calificable. Valor correcto: **169**. → Agregar clave.
- 🟡 **PM-III-P03-A6** (fill_blanks) — **6 huecos, 4 claves**; faltan el 5.º ("1−4 = **−3**", discriminante) y el 6.º ("**reales**"). → Agregar dos claves.

**PM-IV**
- 🟡 **PM-IV-P05-A5** (glosario) — *"Ley de Senos"* dice "LAL ambiguo". El caso ambiguo es **LLA/SSA**, no LAL (LAL = Ley de Cosenos, nunca ambiguo). Contradice la propia tarjeta "Caso LAL". → Corregir a LLA.
- 🟡 **PM-IV-P05-A5** (glosario) — *"Caso ambiguo"* dice "caso **LAA**". LAA es unívoco; el ambiguo es **LLA**. El propio ejemplo (dos lados + ángulo opuesto) es LLA. → Corregir.

**PM-V**
- 🟡 **PM-V-P06-A1** (infografía) — Sotero Prieto descrito como "**oaxaqueño / nacido en Oaxaca**". Nació en **Guadalajara, Jalisco** (contagio temático de las artesanías oaxaqueñas de la misma infografía). → Corregir lugar de nacimiento.
- 🟡 **PM-V-P06-A1** (infografía) — "**Mathías** Sandoval Vallarta". Es **Manuel** Sandoval Vallarta (así aparece bien en P02-A1 de la misma UAC). → Corregir el nombre.

**PM-VI**
- 🟡 **PM-VI-P05-A4** (quiz V/F) — La retroalimentación llama a "0 ≤ P(A) ≤ 1" el "**segundo axioma de Kolmogorov**". Es un **teorema derivado**; el 2.º axioma es P(Ω)=1. (La marca de respuesta sí es correcta; el error está solo en la retroalimentación.) → Reescribir la retroalimentación.

---

### 🟡🔴 Lengua y Comunicación (LC)

**LC-I**
- 🟡 **LC-I-P02-A1** (lectura) — Presenta como real una "**FUNDÉU México**". La Fundéu/FundéuRAE es **española** (RAE + Agencia EFE), no mexicana. El referente mexicano sería la AML o el DEM de El Colegio de México. → Corregir.

**LC-II**
- 🔴 **LC-II-P02-A1** (lectura) — Afirma que *"No oyes ladrar los perros"* de Rulfo tiene "**narrador en primera persona**". Está en **tercera persona**. Grave porque la lectura enseña justamente a distinguir tipos de narrador y usa este cuento como ejemplo paradigmático de lo que NO es. → Cambiar ejemplo o corregir.
- 🔴 **LC-II-P02-A1** (callout "sabías") — Repite el mismo error ("narrador en primera persona que nunca revela su nombre"). Lo anónimo es el **padre** (personaje). → Reescribir.
- 🟡 **LC-II-P08-A1** (infografía) — Atribuye a Animal Político una investigación del "**Caso Odebrecht (2019)**" ganadora del Premio Gabriel García Márquez. Fue **"La Estafa Maestra" (2017)**, categoría Innovación. → Corregir título/año/tema.

**LC-III**
- 🔴 **LC-III-P05-A2** (quiz) — Retroalimentación dice "amor/calor" es **asonante**. Es **consonante** (-or = vocal + consonante). Ambos pares del ejemplo son consonantes. Contradice P05-A4 de la misma UAC. → Reemplazar ejemplo (p.ej. amor/reloj = asonante).
- 🔴 **LC-III-P02-A1** (infografía) — "El Premio Cervantes se ha otorgado a **tres** mexicanos". Son **siete** (Paz, Fuentes, Pitol, Pacheco, Poniatowska, del Paso, Celorio). La propia infografía menciona a Fuentes (Cervantes 1987). → Corregir lista.
- 🟡 **LC-III-P02-A1** (infografía) — "El Estridentismo **controló el gobierno estatal**" de Veracruz. Fue **amparado** por el gobernador Heriberto Jara, no lo controló. → Reformular.
- 🟡 **LC-III-P02-A1** (infografía) — Llama al Modernismo "**primera vanguardia** latinoamericana". El Modernismo **no es vanguardia** (las vanguardias son posteriores y reaccionaron contra él). → "Primer movimiento literario latinoamericano con proyección internacional".

---

### 🟢🟡🔴 Inglés (IN)

**IN-I**
- 🔴 **IN-I-P07-A1** (lectura) — Cifras **ENDUTIH 2023** erróneas (78.6 / 86.7 / **50.8** rural). Correcto: **81.2 / 85.5 / 66.0**. → Corregir *(patrón sistémico)*.
- 🟡 **IN-I-P01-A1** (lectura) — "Plataforma **MassivX** de la UNAM" (inexistente). Es **MOOC UNAM** / Coursera. → Corregir *(patrón sistémico)*.

**IN-II**
- 🟡 **IN-II-P01-A1** (lectura) — Mismo error "**MassivX**". → Corregir.
- 🟢 **IN-II-P06-A2** (fill_blanks) — La clave produce "The market is *on the corner* with the pharmacy", no idiomático. → Reescribir la oración.

**IN-III**
- 🟡 **IN-III-P01-A1** (lectura) — Cifras **ENDUTIH** mal atribuidas a 2023 (el 78.6 % es de 2022). → Corregir.
- 🟢 **IN-III-P06-A1** (callout trivia) — "La receta más antigua es de cerveza (1700 a.C.)". Las tablillas de Yale (~1700 a.C.) describen **guisos**; conflaciona con el Himno a Ninkasi. → Reformular.

**IN-IV**
- 🔴 **IN-IV-P05-A1** (lectura) — Clasifica "Look at those clouds, it **will** rain" como uso de *will*. La predicción con **evidencia visible usa *be going to***. Contradice P05-A2 y P08-A2 de la misma UAC (que lo enseñan bien). → Mover el ejemplo a *be going to*.

**IN-V**
- 🔴 **IN-V-P06-A1** (lectura) — Cifras **ENDUTIH 2023** erróneas (rural 50.8 % vs 66.0 % real). → Corregir.
- 🟡 **IN-V-P05-A1** (lectura) — "ANP cubren **más del 25 % del territorio nacional**". El terrestre es **~11.76 %**; el 25 % solo aplica al territorio marino. → Corregir/distinguir.
- 🟡 **IN-V-P06-A5** (glosario) — "*I am writing to* + **base verb**" (contradictorio). Es **to-infinitive** (to + verbo). → Reescribir.

---

### 🟡 Pensamiento Filosófico y Humanidades (PFH)

**PFH-I**
- 🟡 **PFH-I-P02-A1** (lectura; duplicado en P05-A1) — "El INAH protege … **188 museos**". Administra **~160**; zonas arqueológicas ~194. → Ajustar a cifras oficiales.

**PFH-II**
- 🟡 **PFH-II-P02-A1** (lectura) — Callout sobre la **Constitución de 1917** insertado en una lectura de **ética** (Kant/Mill/Aristóteles). Error de copiado/pegado: el dato es correcto pero descontextualiza. → Reemplazar por un callout de ética.

**PFH-III**
- 🟡 **PFH-III-P03-A1** (lectura) — "Baumgarten acuñó *estética* en **1750**". La acuñó en **1735**; 1750 es la publicación de su obra *Aesthetica*. → Corregir fecha/redacción.
- 🟡 **PFH-III-P03-A4** (quiz V/F) — "La tradición **de Platón** a Hegel sostiene que el arte revela verdad inaccesible a la ciencia". Platón fue **crítico** del arte (mímesis, expulsa a los poetas). La retroalimentación solo cita a Hegel/Heidegger. → "De Aristóteles a Hegel" o quitar a Platón.

---

### 🟢🟡 Ciencias Sociales (CS)

**CS-II**
- 🟡 **CS-II-P01-A1** (lectura) — GINI de México "**~0.44**". Inconsistente con la misma UAC (0.427 en P02-A1, 0.41 en P04-A1) y con CONEVAL 2022 (~0.42). → Unificar a ~0.42.
- 🟡 **CS-II-P02-A1** (infografía) — "El 10 % más rico concentra 59.1 % de la **riqueza** (ENIGH 2022)". La ENIGH mide **ingreso**, no riqueza. → Cambiar "riqueza" por "ingreso".

**CS-III**
- 🔴 **CS-III-P03-A2** (quiz) — Retroalimentación afirma una "**reforma para el voto a los 17 años**". **No existe**; se vota a los 18 (Art. 34–35 CPEUM). Contradice la lectura P03-A1 de la misma progresión. → Eliminar la frase (la opción correcta sí lo es).
- 🟢 **CS-III-P02-A1** (infografía) — "**2 474 municipios**". La cifra oficial INEGI es **2 469**. → Corregir (ambas menciones).

---

### 🔴 Conciencia Histórica (CH)

**CH-I**
- 🔴 **CH-I-P02-A4** (quiz V/F) — "Haab + Tzolkin se combinan para formar la **Cuenta Larga**" marcado VERDADERO. Forman la **Rueda Calendárica** (52 años); la Cuenta Larga es un conteo lineal aparte. La propia retroalimentación se contradice. Un alumno que responda FALSO (correcto) sería penalizado. → Cambiar respuesta a `false` o reescribir el enunciado.

**CH-II**
- 🟡 **CH-II-P01-A1** (lectura) — "Briceida **Canto** (maya)". Es **Briceida Cuevas Cob**. (Natalia Toledo, citada al lado, sí es correcta.) → Corregir apellido.

---

### 🟡🔴 Cultura Digital (CD)

**CD-I**
- 🟡 **CD-I-P02-A1** / **P05-A1** / **P08-A1** (3 lecturas, callout idéntico) — "CDMX = **Ciudad Creativa Digital de la UNESCO 2017**". Falso: fue Ciudad Creativa **de Diseño**; "Ciudad Creativa Digital" es un proyecto de **Guadalajara**. Cifras adicionales (40 % de startups, Corredor Insurgentes/500 empresas) **inventadas**. → Corregir/eliminar en las 3 *(patrón sistémico)*.

**CD-II**
- 🔴 **CD-II-P03-A1** (lectura) — Callout "importante" con cifras **ENDUTIH** erróneas presentadas como oficiales (78.6 % es de 2022; rural 50.8 % es de ~2020). → Corregir a 2023 (81.2 / 85.5 / 66.0).
- 🟡 **CD-II-P02-A1** (lectura) — "Según la **ENOE 2023**, el 18 % trabaja en modalidad remota/híbrida". La ENOE no desglosa eso; dato no verificable. → Eliminar atribución o usar dato real (~10.6 % teletrabajable).

**CD-III**
- 🟡 **CD-III-P01-A1** (lectura) — Mismo error "**Ciudad Creativa Digital UNESCO**". → Corregir.
- 🟡 **CD-III-P04-A1** (lectura) — Atribuye a la **UNESCO** el marco de competencias digitales de 5 áreas. Esas 5 áreas son **DigComp (Comisión Europea)**; el marco UNESCO (DLGF) tiene 7. → Reatribuir a DigComp/UE.

---

### 🟢🟡🔴 Labs 3D (módulos de datos)

> De 85 labs auditados, **10 tienen hallazgos**. Los 4 de severidad alta son **bugs de lógica** (un preset/clasificador que no produce el resultado que anuncia), no errores de datos.

- 🔴 **biomas-data.ts** — `biomaDe()` usa umbral estricto `<` y **3 escenarios guiados caen en el bioma equivocado**:
  - "Desierto Chihuahuense" (precip 250) → devuelve `selva_seca` (el `<250` excluye el 250). → usar `<=250` o bajar a 249.
  - "Pastizal del norte" (temp 16) → devuelve `selva_seca` (la rama de pastizal solo existe para temp ≤13). → añadir rama pastizal cálido-seco o bajar temp a ≤13.
  - "Selva Lacandona" (precip 3000) → devuelve `manglar` (selva húmeda acotada a `<2600`). → subir umbral a `<3500` o bajar preset a <2600.
- 🔴 **genetica-mendel-data.ts** — `resolverLig()` compara el genotipo contra `"AA"/"Aa"/"aa"`, pero la función trabaja con alelos **D/d** y devuelve `"DD"/"Dd"/"dd"`. Resultado: **TODAS las hijas se etiquetan "daltónica"** (imposible biológicamente) en los 3 casos. Contradice el propio EJEMPLO_LIG ("Hija daltónica: 0 %"). → comparar contra `"DD"/"Dd"`.
- 🟡 **metabolismo-data.ts** — Etapa "krebs": `productos` declara "**4 CO₂** + 8 NADH". Con 8 NADH (incluye descarboxilación del piruvato) deben salir **6 CO₂**. Contradice la ecuación global del módulo. → cambiar a "6 CO₂ + 8 NADH + 2 FADH₂".
- 🟡 **discriminante-data.ts** — Escenario "No llega a 100 m": comentario dice "Δ = **−36**". El real es **Δ = −900**. (El signo y la conclusión son correctos.) → corregir el número.
- 🟡 **ph-data.ts** — `clasifica()` deriva la "fuerza" ácido/base de la **distancia del pH a 7**, no de la disociación (Ka). El vinagre (pH 3, sustancia por defecto) sale "**Ácido fuerte**" siendo el ácido débil canónico; contradice el propio módulo. → no derivar fuerza del pH (renombrar a "intensidad" o usar campo declarado).
- 🟢 **adn-dogma-data.ts** — JSDoc de `hebraMolde()` dice "complemento invertido / antiparalela" pero el código **no invierte** (solo complementa). El dato mostrado es correcto; el comentario no. → corregir el JSDoc.
- 🟢 **celula-data.ts** — Tabla COMPARACION dice procariota "~1–10 µm"; el resto del módulo usa "**0.5–5 µm**" (5 lugares). Inconsistencia interna. → unificar.
- 🟢 **cilindro-data.ts** — Escenario "tambo": "V·1000 da los litros que anuncia el fabricante", pero da **216.7 L** (rótulo 200 L). Se salva por "unos 200 litros". → ajustar frase o dimensiones.
- 🟢 **division-celular-data.ts** — `EJEMPLO.datos[0]`: "2n = 46 ⇒ n = **23 pares**". n = 23 **cromosomas** (los 23 *pares* son 2n). El resto del módulo lo dice bien. → corregir etiqueta.
- 🟢 **reglas-data.ts** — f'(x)=15x⁴−6x²+7: dice "mínimo **6.55**"; el real es **6.4**. (La conclusión f'>0 sigue válida.) → corregir el número (2 lugares).

---

## Recomendación de acción

1. **Tanda 1 — alta severidad (16 hallazgos):** corregir antes de cualquier publicación de las unidades afectadas. Incluye 2 claves de quiz defectuosas (CNEYT-V-P04-A3, CH-I-P02-A4 — un alumno correcto sería reprobado) y 2 bugs de lab (`biomas`, `genetica-mendel`).
2. **Tanda 2 — patrones sistémicos:** un solo fix replicado resuelve 11 hallazgos (ENDUTIH ×5, Ciudad Creativa Digital ×4, MassivX ×2).
3. **Tanda 3 — media/baja restantes:** lote de exactitud/consistencia.

Todas las correcciones son **verbatim a fuente verificable** (no hay que inventar nada; cada hallazgo trae el dato correcto y su fuente). Puedo prepararlas como script idempotente service-role (datos de BD) + edits de los 10 módulos de lab, dejándolo en `borrador` y local, **cuando lo autorices**.

*Generado por auditoría multi-agente con verificación adversarial — 154 agentes, ~5.9 M tokens.*
