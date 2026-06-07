# Re-alineamiento al Modelo MCCEMS 2025 — Reporte de cobertura

**Fecha:** 2026-06-07
**Enfoque aplicado:** "Fidelidad sin destruir" — re-anclaje de texto sin borrar contenido. En una segunda
pasada (decisión del usuario: *"renumerar a 8 + extras al final"*) se reasignó `progresiones.numero` para que
los propósitos oficiales ocupen 1..N y los complementos pasen al final; esto **no** toca actividades ni
`practica_slug` (los enlaces de lab se regeneran desde `numero`, ningún lab quedó huérfano).
**Alcance:** las 8 áreas del Currículum Fundamental (32 UAC).

---

## 1. Resumen ejecutivo

La plataforma se construyó originalmente sobre el modelo **MCCEMS 2022 ("progresiones de aprendizaje")**.
Los programas oficiales vigentes en `public/` son el **Modelo 2025 ("propósitos formativos + contenidos
formativos", máx. 8 por semestre)**. Este trabajo re-alineó **solo el texto** (nombres de asignatura, temas,
títulos de propósito y la etiqueta de UI) al estándar 2025, **preservando el 100 % del contenido ya construido**
(1601 actividades + 77 labs 3D). En Fase 2 se construyó además contenido **nuevo verbatim** para cerrar
**los 18 huecos oficiales restantes** y dejar la cobertura en **207/207 (100 %)**. De esos cierres, 11 incluyeron
un **lab 3D nuevo** (3 de matemáticas + 8 de ciencias, según decisión del usuario de no sobrecargar la
plataforma con más labs 3D de los necesarios) y 7 se llenaron con **contenido más ligero** (7 actividades
borrador sin lab 3D): PM-IV·O7, PM-VI·O3, PM-VI·O4, PM-VI·O6, CNEYT-III·O2, CNEYT-III·O5 y CNEYT-VI·O2.
Totales finales: **1727 actividades + 88 labs 3D**, **207/207 propósitos cubiertos, 0 huecos**.

| Métrica | Valor |
|---|---|
| UAC alineadas | 32 / 32 |
| Asignaturas/temas oficiales aplicados | 32 |
| Títulos de propósito reescritos verbatim | 139 |
| Propósitos oficiales **cubiertos** | **207 de 207 (100 %)** |
| **Huecos** (propósito oficial sin contenido construido) | **0** |
| **Complementos** (contenido construido fuera de los 8 oficiales, conservado) | **33** |
| **Artefactos** del PDF (propósito duplicado, ignorado) | **1** |
| Labs 3D | **88 / 88** |

**Garantía de integridad:** la renumeración tocó únicamente `progresiones.numero`; los **códigos** de actividad
(`CNEYT-V-P05-A1`, etc.) se derivan del `codigo` inmutable de la progresión —no de su `numero`— y nunca se
tocaron ⇒ **ningún lab 3D quedó huérfano** (77/77 verificados antes y después). El re-anclaje de texto tocó
`uac.nombre`, `uac.descripcion`, `progresiones.titulo` y `progresiones.categoria`; la renumeración, solo
`progresiones.numero`. Los conteos de avance (hub, dashboard, detalle de UAC) excluyen los complementos.

**Reubicación PM-II → PM-III (Fase 2, 2026-06-07):** los complementos de ecuaciones lineales que vivían en
PM-II se movieron a su hogar oficial 2025 (PM-III, "Pensamiento algebraico"), cerrando los huecos PM-III·O1
y PM-III·O3. La operación cambió `uac_id`, `numero` y `codigo` de 3 progresiones (`PM-II-P04→PM-III-P07`,
`PM-II-P05→PM-III-P08`, `PM-II-P06→PM-III-P09`) y renombró sus 21 códigos de actividad (sufijo `-A{n}`
intacto). Los labs van por `practica_slug`+`progresion_id` ⇒ los 3 labs (`ecuacion-lineal-barras`,
`sistemas-ecuaciones-2x2`, `inecuaciones-lineales`) viajaron sin orfanarse (77/77 verificados). Script
idempotente: `scripts/relocate-pm3-ecuaciones.ts`.

**Cierre de PM-III·O2 con contenido nuevo (Fase 2, 2026-06-07):** el último hueco de PM-III ("ecuaciones
lineales con dos incógnitas / ecuación de la recta") se cerró **construyendo contenido nuevo verbatim** (no
reubicado): progresión `PM-III-P10` (`numero=2`, propósito y contenidos formativos oficiales verbatim,
`categoria` OFICIAL) con **7 actividades** (`-A1..-A7`, todas `estado='borrador'` hasta aprobación) y un
**lab 3D nuevo** — "Ecuación de la recta en el plano cartesiano" (`practica_slug = ecuacion-recta`, asociado a
`PM-III-P10-A2`). Con esto **PM-III queda 6/6 (100 %)**; totales: huecos 18→17, cubiertos 189→190, labs 77→78.
Verificado verde: tsc 0 / eslint 0 / jest 235 / next build 0 / integridad registry↔BD↔disco 78=78
(0 rotos/huérfanos/dup). Seed idempotente: `scripts/seed-pm3-o2-recta.ts`.

**Cierre de CNEYT-V·O6 con contenido nuevo (Fase 2, 2026-06-07):** el único hueco de Física ("comportamiento
de fluidos y sus propiedades físicas") se cerró **construyendo contenido nuevo verbatim**: progresión
`CNEYT-V-P09` (`numero=6`, propósito y contenidos formativos oficiales verbatim —Pascal, Arquímedes, tensión
superficial, capilaridad, continuidad, Bernoulli, viscosidad—, `categoria` OFICIAL) con **7 actividades**
(`-A1..-A7`, todas `estado='borrador'` hasta aprobación) y un **lab 3D nuevo** — "El comportamiento de los
fluidos: Arquímedes, Pascal y Bernoulli" (`practica_slug = fluidos`, 3 modos flotación/presión/flujo, asociado
a `CNEYT-V-P09-A2`). Con esto **CNEYT-V queda 8/8 (100 %)**; totales: huecos 17→16, cubiertos 190→191,
labs 78→79. Verificado verde: tsc 0 / eslint 0 / jest 235 / next build 0 / integridad registry↔BD↔disco 79=79
(0 rotos/huérfanos/dup). Seed idempotente: `scripts/seed-cneyt5-o6-fluidos.ts`.

**Cierre de CNEYT-VI·O5 con contenido nuevo (Fase 2, 2026-06-07):** el hueco de Biología ("fases e importancia
de la mitosis y la meiosis; recombinación genética como factor de biodiversidad") se cerró **construyendo
contenido nuevo verbatim**: progresión `CNEYT-VI-P09` (`numero=5`, propósito O5 y contenidos formativos C5
oficiales verbatim, `categoria` OFICIAL "Mitosis y meiosis") con **7 actividades** (`-A1..-A7`, todas
`estado='borrador'` hasta aprobación) y un **lab 3D nuevo** — "División celular: mitosis y meiosis"
(`practica_slug = division-celular`, 3 modos mitosis/meiosis/comparar sobre 2n=4 con crossing-over y una
calculadora 2n→células/cromosomas/2ⁿ combinaciones; contexto INCan y biodiversidad de México; asociado a
`CNEYT-VI-P09-A2`). Con esto **CNEYT-VI queda 7/8** (resta O2, teoría celular); totales: huecos 16→15,
cubiertos 191→192, labs 79→80. Verificado verde: tsc 0 / eslint 0 / jest 235 / next build 0 / integridad
registry↔BD↔disco 80=80 (0 rotos/huérfanos/dup). Seed idempotente: `scripts/seed-cneyt6-o5-division-celular.ts`.

**Cierre de CNEYT-II·O4 con contenido nuevo (Fase 2, 2026-06-07):** el hueco de "El poder de la energía"
("formas de propagación del calor: conducción, convección y radiación; conductividad calorífica y capacidad
térmica específica") se cerró **construyendo contenido nuevo verbatim**: progresión `CNEYT-II-P11`
(`numero=4`, propósito O4 y contenidos formativos C4 oficiales verbatim, `categoria` OFICIAL "Termología")
con **7 actividades** (`-A1..-A7`, todas `estado='borrador'` hasta aprobación) y un **lab 3D nuevo** —
"Propagación del calor: conducción, convección y radiación" (`practica_slug = propagacion-calor`, 4 modos
conducción/convección/radiación/comparar con ley de Fourier Q/t=k·A·ΔT/L, Stefan-Boltzmann Q/t=ε·σ·A·T⁴ y
calor sensible Q=m·c·ΔT, calculadora de 8 materiales + ejemplo de ventana de vidrio 3 600 W; contexto brisa
marina/adobe/calentadores solares de México; asociado a `CNEYT-II-P11-A2`). Con esto **CNEYT-II queda 8/8
(100 %)**; totales: huecos 15→14, cubiertos 192→193, labs 80→81. Verificado verde: tsc 0 / eslint 0 /
jest 235 / next build 0 / integridad registry↔BD↔disco 81=81 (0 rotos/huérfanos/dup). Seed idempotente:
`scripts/seed-cneyt2-o4-propagacion-calor.ts`.

**Cierre de CNEYT-IV·O5 con contenido nuevo (Fase 2, 2026-06-07):** el hueco de "El poder de la química"
(reacciones de óxido-reducción y combustión) se cerró **construyendo contenido nuevo verbatim**: progresión
`CNEYT-IV-P09` (`numero=5`, propósito O5 y contenidos formativos C5 oficiales verbatim, `categoria` OFICIAL
"Química inorgánica") con **7 actividades** (`-A1..-A7`, todas `estado='borrador'` hasta aprobación) y un
**lab 3D nuevo** — "Reacciones redox y combustión" (`practica_slug = redox-combustion`, 4 modos
óxido-reducción/combustión/pila galvánica/comparar con E°pila = E°cátodo − E°ánodo, W = n·F·E° y combustión
Q = |ΔH|·n, calculadora de 13 pares redox + 8 combustibles + ejemplo de pila de Daniell +1.10 V; contexto
PEMEX Tula/Salina Cruz/Dos Bocas, CFE termoeléctricas, herrumbre/galvanizado y respiración celular; asociado a
`CNEYT-IV-P09-A2`). Con esto **CNEYT-IV pasa a 6/8** (restan O3 y O8); totales: huecos 14→13, cubiertos
193→194, labs 81→82. Verificado verde: tsc 0 / eslint 0 / jest 235 / next build 0 / integridad
registry↔BD↔disco 82=82 (0 rotos/huérfanos/dup). Seed idempotente: `scripts/seed-cneyt4-o5-redox-combustion.ts`.

**Cierre de PM-V·O3 con contenido nuevo (Fase 2, 2026-06-07):** el hueco de "Cálculo diferencial"
(funciones de variable real y simetría) se cerró **construyendo contenido nuevo verbatim**: progresión
`PM-V-P09` (`numero=3`, propósito O3 y contenidos formativos C3 oficiales verbatim, `categoria` OFICIAL
"Cálculo diferencial") con **7 actividades** (`-A1..-A7`, todas `estado='borrador'` hasta aprobación) y un
**lab 3D nuevo** — "Funciones de variable real y su simetría" (`practica_slug = funciones-variable-real`,
catálogo de 10 funciones graficadas en el plano cartesiano con reflejo de simetría —espejo en Y para pares,
giro en el origen para impares— y marcado en vivo de raíces, intersección con Y y máximos/mínimos locales;
ejercicio A2 verbatim sobre f(x)=x³−3x → impar, raíces −√3/0/√3, máx (−1,2) mín (1,−2); asociado a
`PM-V-P09-A2`). Con esto **PM-V pasa a 7/8** (resta O8); totales: huecos 13→12, cubiertos 194→195,
labs 82→83. Verificado verde: tsc 0 / eslint 0 / jest 235 / next build 0 / integridad
registry↔BD↔disco 83=83 (0 rotos/huérfanos/dup). Seed idempotente: `scripts/seed-pmv-o3-funciones.ts`.

**Cierre de PM-V·O8 con contenido nuevo (Fase 2, 2026-06-07):** el último hueco de "Cálculo diferencial"
(Teorema Fundamental del Cálculo: conexión derivada↔integral y fenómenos de acumulación) se cerró
**construyendo contenido nuevo verbatim**: progresión `PM-V-P10` (`numero=8`, propósito O8 y contenidos
formativos C8 oficiales verbatim —"Integral como función inversa de la derivada · Área bajo la curva ·
Representación gráfica"—, `categoria` OFICIAL "Cálculo diferencial") con **7 actividades** (`-A1..-A7`, todas
`estado='borrador'` hasta aprobación) y un **lab 3D nuevo** — "Teorema Fundamental del Cálculo"
(`practica_slug = teorema-fundamental-calculo`, 3 modos sobre el plano cartesiano: **Área** con sumas de
Riemann que convergen al valor exacto al subir n, **Acumulación** con la función F(x)=∫ₐˣf, y **Conexión**
con la recta tangente a F cuya pendiente es f(b); catálogo de 6 funciones; ejercicio A2 verbatim sobre
v(t)=2t → ∫₀⁴2t dt = [t²]₀⁴ = 16 m, con d(t)=t² y d′(t)=2t = v(t) (el TFC); asociado a `PM-V-P10-A2`).
Con esto **PM-V queda COMPLETA 8/8**; totales: huecos 12→11, cubiertos 195→196, labs 83→84.
Verificado verde: tsc 0 / eslint 0 / jest 235 / next build 0 / integridad registry↔BD↔disco 84=84
(0 rotos/huérfanos/dup). Seed idempotente: `scripts/seed-pmv-o8-tfc.ts`.

**Cierre de PM-VI·O8 con contenido nuevo (Fase 2, 2026-06-07):** el hueco de "Pensamiento estadístico
y probabilístico" (distribución normal para calcular la probabilidad) se cerró **construyendo contenido
nuevo verbatim**: progresión `PM-VI-P09` (`numero=8`, propósito O8 y contenidos formativos C8 oficiales
verbatim —"Distribución normal · Medidas de tendencia central · Medidas de dispersión"—, `categoria`
OFICIAL "Pensamiento estadístico y probabilístico") con **7 actividades** (`-A1..-A7`, todas
`estado='borrador'` hasta aprobación) y un **lab 3D nuevo** — "Distribución normal (campana de Gauss)"
(`practica_slug = distribucion-normal`, 3 modos sobre el plano cartesiano: **Campana** donde μ desplaza
el centro y σ ensancha/estrecha la curva, **Regla 68-95-99.7** que sombrea las regiones μ±1σ/μ±2σ/μ±3σ,
y **Probabilidad / z** que sombrea [a,b] como área = P(a≤X≤b) y estandariza con z=(x−μ)/σ; 3 fenómenos
reales: estaturas ENSANUT μ=170 σ=7, puntajes PLANEA/PISA μ=500 σ=100, CI μ=100 σ=15; ejercicio A2
verbatim sobre estaturas → a) 68 % en μ±1σ, b) z=2 ⇒ Φ(2)=97.72 %, c) μ±2σ=[156,184] cm contiene el
95 %; asociado a `PM-VI-P09-A2`). Con esto **PM-VI pasa a 5/8** (restan O3, O4, O6); totales: huecos
11→10, cubiertos 196→197, labs 84→85. Verificado verde: tsc 0 / eslint 0 / jest 235 / next build 0 /
integridad registry↔BD↔disco 85=85 (0 rotos/huérfanos/dup). Seed idempotente: `scripts/seed-pmvi-o8-normal.ts`.

**Cierre de CNEYT-IV·O3 con contenido nuevo (Fase 2, 2026-06-07):** el hueco de "El poder de la química"
(equilibrio químico y reacciones reversibles/irreversibles) se cerró **construyendo contenido nuevo verbatim**:
progresión `CNEYT-IV-P10` (`numero=3`, propósito O3 y contenidos formativos C3 oficiales verbatim —"Reacciones
reversibles e irreversibles · Constante y ecuación de equilibrio químico · Identificación de reacciones
reversibles e irreversibles en la naturaleza"—, `categoria` OFICIAL "El poder de la química") con **7 actividades**
(`-A1..-A7`, todas `estado='borrador'` hasta aprobación) y un **lab 3D nuevo** — "Equilibrio químico"
(`practica_slug = equilibrio-quimico`, 3 modos: **Constante Kc** con Q acercándose a Kc, calculadora de Q vs Kc,
y **Le Châtelier** que visualiza el desplazamiento por presión; ejercicio A2 verbatim sobre H₂ + I₂ ⇌ 2 HI con
Kc=50.5 → Q=6.25<Kc ⇒ derecha, y el proceso Haber N₂+3H₂⇌2NH₃; contexto Haber-Bosch/esmog/bicarbonato en
sangre; asociado a `CNEYT-IV-P10-A2`). Con esto **CNEYT-IV pasa a 7/8** (resta O8); totales: huecos 10→9,
cubiertos 197→198, labs 85→86. Verificado verde: tsc 0 / eslint 0 / jest 235 / next build 0 / integridad
registry↔BD↔disco 86=86 (0 rotos/huérfanos/dup). Seed idempotente: `scripts/seed-cneyt4-o3-equilibrio.ts`.

**Cierre de CNEYT-IV·O8 con contenido nuevo (Fase 2, 2026-06-07):** el último hueco de "El poder de la química"
(respiración aerobia y anaerobia) se cerró **construyendo contenido nuevo verbatim**: progresión `CNEYT-IV-P11`
(`numero=8`, propósito O8 y contenidos formativos C8 oficiales verbatim —"Aspectos químicos de la glucólisis,
ciclo de Krebs y cadena transportadora de electrones · Aspectos químicos de la fermentación · Desarrollos
tecnológicos vinculados con la respiración aerobia y anaerobia"—, `categoria` OFICIAL "El poder de la química")
con **7 actividades** (`-A1..-A7`, todas `estado='borrador'` hasta aprobación) y un **lab 3D nuevo** —
"Respiración aerobia y anaerobia" (`practica_slug = respiracion-celular`, 4 modos: **Glucólisis** (glucosa→2
piruvato, 2 ATP netos), **Aerobia** (Krebs + cadena transportadora hasta el agua, ~38 ATP, ecuación global
C₆H₁₂O₆ + 6 O₂ → 6 CO₂ + 6 H₂O), **Fermentación** (láctica→lactato / alcohólica→etanol+CO₂, 2 ATP) y
**Comparar**; calculadora de ATP/O₂/CO₂/H₂O y eficiencia por vía y moles de glucosa, con nota honesta 38 ATP
teórico vs ~30–32 reales; ejercicio A2 verbatim → a) 2 ATP, b) 38 ATP, c) 19× más, d) 5 mol glucosa ⇒ 30 mol O₂
y 30 mol CO₂; contexto tequila/mezcal/pan/yogur/biogás de Jalisco; asociado a `CNEYT-IV-P11-A2`). Con esto
**CNEYT-IV queda COMPLETA 8/8**; totales: huecos 9→8, cubiertos 198→199, labs 86→87. Verificado verde:
tsc 0 / eslint 0 / jest 235 / next build 0 / integridad registry↔BD↔disco 87=87 (0 rotos/huérfanos/dup).
Seed idempotente: `scripts/seed-cneyt4-o8-respiracion.ts`.

**Cierre de CNEYT-III·O4 con lab 3D nuevo (Fase 2, 2026-06-07):** el hueco de "Nuestro hogar. El sistema
terrestre" (estructura de una reacción química) se cerró **construyendo contenido nuevo verbatim**: progresión
`CNEYT-III-P09` (`numero=4`, propósito O4 y contenidos C4 oficiales verbatim) con **7 actividades** borrador y
un **lab 3D nuevo** "Estructura de una reacción química" (`practica_slug = estructura-reaccion`; reactivos→
productos, balanceo y simbología sobre CH₄ + 2 O₂ → CO₂ + 2 H₂O; asociado a `CNEYT-III-P09-A2`). Totales:
huecos 8→7, cubiertos 199→200, labs 87→**88**. Seed: `scripts/seed-cneyt3-o4-reaccion.ts`.

**Cierre de los 7 huecos restantes con contenido ligero, sin lab 3D (Fase 2, 2026-06-07):** por decisión del
usuario ("ya hay decenas de labs 3D; llena el resto con actividades menos pesadas que un lab 3D"), los 7
propósitos oficiales que aún faltaban se cerraron con **contenido nuevo verbatim** —una progresión + **7
actividades borrador** cada uno (lectura, ejercicio, reflexión, quiz V/F, glosario, fill_blanks,
autoevaluación)— **sin** lab 3D (su A2 es `ejercicio_matematico` SIN `practica_slug`). Seed único idempotente:
`scripts/seed-huecos-ligeros.ts`. Cierres:

| Propósito | Progresión (numero) | Tema verbatim |
|---|---|---|
| **PM-IV·O7** | `PM-IV-P08` (7) | Modelado y estimación con secciones cónicas (parábola/elipse/circunferencia/hipérbola) |
| **PM-VI·O3** | `PM-VI-P10` (3) | Teoría de conjuntos: notación, subconjuntos, Venn, leyes de De Morgan |
| **PM-VI·O4** | `PM-VI-P11` (4) | Técnicas de conteo (permutaciones/combinaciones) y probabilidad dep./indep./condicionada |
| **PM-VI·O6** | `PM-VI-P12` (6) | Relación entre variables: independencia (contingencia) y correlación |
| **CNEYT-III·O2** | `CNEYT-III-P10` (2) | Hidrósfera y atmósfera: capas, composición, densidad/presión, ciclo del agua, clima vs tiempo |
| **CNEYT-III·O5** | `CNEYT-III-P11` (5) | Oxígeno y atmósfera primitiva (Oparin-Haldane), ciclo del O₂, óxidos básicos/ácidos |
| **CNEYT-VI·O2** | `CNEYT-VI-P10` (2) | Descubrimiento de la célula y teoría celular (Hooke, Leeuwenhoek, Schleiden/Schwann/Virchow) |

Con esto **PM-VI queda 8/8, CNEYT-III 8/8 (incluye O4) y CNEYT-VI 8/8**; totales finales: huecos 7→**0**,
cubiertos 200→**207/207 (100 %)**, labs **88** (sin cambio). Verificado verde: tsc 0 / eslint 0 / jest 235/235.
`next build` sin cambios (cero archivos `src/` modificados desde el lab #88; los huecos ligeros solo añaden
filas de datos vía seed, no entran al bundle).

> 🏁 **Re-alineamiento 2025 COMPLETO:** las 32 UAC al 100 %, los 207 propósitos formativos oficiales cubiertos
> con contenido verbatim, 88 labs 3D. Todo el contenido nuevo queda en `estado='borrador'` hasta aprobación.

---

## 2. Cómo leer este reporte

- **Hueco** = un propósito formativo oficial 2025 para el cual **no existe** una progresión/contenido en la
  plataforma. NO se fabricó nada (regla anti-fake); se reporta para una eventual Fase 2.
- **Complemento** = contenido real ya construido (con sus actividades, y a veces su lab 3D) que **no
  corresponde** a uno de los 8 propósitos oficiales del semestre. Se **conserva** marcado con
  `categoria = "Complemento (no oficial 2025)"` para honestidad curricular. No se pierde nada.
- **Artefacto** = un propósito que aparece duplicado en el PDF oficial por un corte de paginación; se ignora
  en el mapeo y se documenta aquí.

---

## 3. Tabla de cobertura por UAC

`oficial` = nº de propósitos formativos 2025 · `db` = nº de progresiones en la plataforma · `compl.` = progresiones marcadas complemento.

| UAC | Asignatura oficial 2025 | Tema oficial | oficial | db | compl. |
|---|---|---|:--:|:--:|:--:|
| LC-I | Lengua y Comunicación I | Leer y escribir para pensarnos juntos | 8 | 8 | 0 |
| LC-II | Lengua y Comunicación II | Libertad para imaginar, poder para comunicar | 8 | 8 | 0 |
| LC-III | Lengua y Comunicación III | Describir culturas, apropiarse de las palabras | 7 | 7 | 0 |
| PM-I | Pensamiento Matemático I | Pensamiento aritmético | 7 | 10 | 3 |
| PM-II | Pensamiento Matemático II | Introducción al álgebra | 6 | 6 | 0 |
| PM-III | Pensamiento Matemático III | Pensamiento algebraico e introducción a geometría plana | 6 | 10 | 4 |
| PM-IV | Pensamiento Matemático IV | Trigonometría y geometría analítica | 7 | 7 | 1 |
| PM-V | Pensamiento Matemático V | Cálculo diferencial | 8 | 10 | 0 |
| PM-VI | Pensamiento Matemático VI | Pensamiento estadístico y probabilístico | 8 | 9 | 4 |
| IN-I | Inglés I | To be, or not to be, that is the question | 8 | 8 | 0 |
| IN-II | Inglés II | These are a few of my favorite things | 8 | 8 | 0 |
| IN-III | Inglés III | What we were, we share | 8 | 8 | 0 |
| IN-IV | Inglés IV | Should I stay or should I go? | 8 | 8 | 0 |
| IN-V | Inglés V | We are the champions | 8 | 8 | 0 |
| CD-I | Cultura Digital I | Ciudadanía digital | 8 | 11 | 3 |
| CD-II | Cultura Digital II | Aprendizaje individual y colaborativo | 5 | 5 | 0 |
| CD-III | Cultura Digital III | Uso y difusión del conocimiento | 4 | 4 | 0 |
| CH-I | Conciencia Histórica I | Coordenadas de la Historia | 4 | 4 | 0 |
| CH-II | Conciencia Histórica II | La experiencia histórica | 4 | 4 | 0 |
| CH-III | Conciencia Histórica III | Navegar en el tiempo: investigaciones históricas | 4 | 4 | 0 |
| CS-I | Ciencias Sociales I | Estado, ciudadanía y relaciones de poder | 4 | 4 | 0 |
| CS-II | Ciencias Sociales II | Organización, relaciones sociales y económicas | 4 | 4 | 0 |
| CS-III | Ciencias Sociales III | Las dinámicas de la realidad actual: la condición estudiantil al centro | 3 | 3 | 0 |
| PFH-I | Pensamiento Filosófico y Humanidades I | El ejercicio de filosofar y la perspectiva humanista | 5 | 6 | 1 |
| PFH-II | Pensamiento Filosófico y Humanidades II | Las reflexiones filosóficas sobre el Conocer | 5 | 5 | 0 |
| PFH-III | Pensamiento Filosófico y Humanidades III | Las reflexiones filosóficas sobre el Hacer | 4 | 4 | 0 |
| CNEYT-I | Ciencias Naturales, Experimentales y Tecnología I | Invitación a la ciencia. Naturaleza de la materia | 8 | 11 | 3 |
| CNEYT-II | Ciencias Naturales, Experimentales y Tecnología II | El poder de la energía | 8 | 11 | 3 |
| CNEYT-III | Ciencias Naturales, Experimentales y Tecnología III | Nuestro hogar. El sistema terrestre | 8 | 8 | 3 |
| CNEYT-IV | Ciencias Naturales, Experimentales y Tecnología IV | El poder de la química | 8 | 11 | 3 |
| CNEYT-V | Ciencias Naturales, Experimentales y Tecnología V | Del átomo al universo. Fuerza y energía | 8 | 9 | 1 |
| CNEYT-VI | Ciencias Naturales, Experimentales y Tecnología VI | ¿Qué es la vida? Evolución y diversidad biológica | 8 | 9 | 2 |

> Nota: 26 de 32 UAC están al 100 % (huecos = 0). Los huecos se concentran en Matemáticas
> (PM-IV/VI) y Ciencias (CNEYT-III/VI), donde el modelo 2025 introduce o reordena temas
> respecto al desglose 2022. (PM-III cerró su último hueco —O2—, PM-V quedó 8/8, CNEYT-V el suyo —O6—, CNEYT-VI el O5 —mitosis/meiosis—, CNEYT-II el O4 —propagación del calor— y CNEYT-IV sus O5 —redox y combustión—, O3 —equilibrio químico— y O8 —respiración aerobia/anaerobia— en Fase 2, 2026-06-07.)

---

## 4. Huecos — propósitos oficiales 2025 sin contenido construido (8)

Estos temas oficiales **no tienen** progresión/actividad en la plataforma. Son candidatos a Fase 2.
NO se fabricaron (anti-fake).

### Pensamiento Matemático (4 huecos)
> **PM-III · O1, O2 y O3 quedaron CERRADOS** (Fase 2, 2026-06-07): O1 y O3 por reubicación desde PM-II
> (labs `ecuacion-lineal-barras` →O1, `sistemas-ecuaciones-2x2` →O3); **O2 por contenido nuevo verbatim**
> (progresión `PM-III-P10` + 7 actividades borrador + lab 3D `ecuacion-recta`). **PM-III ya no tiene huecos.**
> **PM-V · O3 y O8 quedaron CERRADOS** (Fase 2, 2026-06-07): por contenido nuevo verbatim — O3 (progresión
> `PM-V-P09`, numero=3, + 7 actividades borrador + lab 3D `funciones-variable-real`) y O8 (progresión
> `PM-V-P10`, numero=8, + 7 actividades borrador + lab 3D `teorema-fundamental-calculo`). **PM-V queda COMPLETA 8/8.**
> **PM-VI · O8 quedó CERRADO** (Fase 2, 2026-06-07): por contenido nuevo verbatim (progresión `PM-VI-P09`,
> numero=8, + 7 actividades borrador + lab 3D `distribucion-normal`). **PM-VI pasa a 5/8** (restan O3, O4, O6).
- **PM-IV · O7** — Estimaciones sencillas con ecuaciones de dos variables (consolidación).
- **PM-VI · O3** — Conceptos básicos de teoría de conjuntos.
- **PM-VI · O4** — Técnicas de conteo (permutaciones, combinaciones) para calcular probabilidad.
- **PM-VI · O6** — Relación entre dos o más variables categóricas/cuantitativas.

### Ciencias Naturales, Experimentales y Tecnología (4 huecos)
> **CNEYT-V · O6 quedó CERRADO** (Fase 2, 2026-06-07): por contenido nuevo verbatim (progresión
> `CNEYT-V-P09` + 7 actividades borrador + lab 3D `fluidos`). **CNEYT-V ya no tiene huecos (8/8).**
> **CNEYT-VI · O5 quedó CERRADO** (Fase 2, 2026-06-07): por contenido nuevo verbatim (progresión
> `CNEYT-VI-P09` + 7 actividades borrador + lab 3D `division-celular`). **CNEYT-VI pasa a 7/8** (resta O2).
> **CNEYT-II · O4 quedó CERRADO** (Fase 2, 2026-06-07): por contenido nuevo verbatim (progresión
> `CNEYT-II-P11` + 7 actividades borrador + lab 3D `propagacion-calor`). **CNEYT-II ya no tiene huecos (8/8).**
> **CNEYT-IV · O5 quedó CERRADO** (Fase 2, 2026-06-07): por contenido nuevo verbatim (progresión
> `CNEYT-IV-P09` + 7 actividades borrador + lab 3D `redox-combustion`).
> **CNEYT-IV · O3 quedó CERRADO** (Fase 2, 2026-06-07): por contenido nuevo verbatim (progresión
> `CNEYT-IV-P10`, numero=3, + 7 actividades borrador + lab 3D `equilibrio-quimico`).
> **CNEYT-IV · O8 quedó CERRADO** (Fase 2, 2026-06-07): por contenido nuevo verbatim (progresión
> `CNEYT-IV-P11`, numero=8, + 7 actividades borrador + lab 3D `respiracion-celular`). **CNEYT-IV ya no tiene huecos (8/8).**
- **CNEYT-III · O2** — Hidrósfera y atmósfera (estados de agregación, propiedades, temperatura).
- **CNEYT-III · O4** — Estructura de una reacción química como proceso de transformación de la materia.
- **CNEYT-III · O5** — Oxigenación de la atmósfera primitiva y organismos fotosintéticos.
- **CNEYT-VI · O2** — Historia del descubrimiento de la célula y **teoría celular**.

---

## 5. Complementos — contenido construido conservado fuera de los 8 oficiales (33)

Contenido real, **no eliminado**, marcado `categoria="Complemento (no oficial 2025)"`. Sigue accesible para
los estudiantes; simplemente no cuenta entre los 8 propósitos oficiales del semestre.

### ⭐ Labs 3D que quedaron como complemento (callout)

Tres labs 3D ya construidos **no caen** bajo un propósito oficial 2025 y se conservan como enriquecimiento:

- **CNEYT-V · P08** *(ética en física)* — no tiene lab; el propósito oficial es de reflexión ética, queda como complemento.
- **CNEYT-VI · P03 — Metabolismo celular** *(lab `metabolismo-celular-3d`)* — su hogar oficial 2025 es **CNEYT-IV (química)**; aquí queda como complemento de Biología.
- **CNEYT-VI · P06 — Mutaciones** *(lab `mutaciones-3d`)* — el propósito oficial CNEYT-VI habla de "causas de las mutaciones y variabilidad"; el lab construido es más amplio, queda como complemento.

> Los demás 74 labs caen limpiamente bajo un propósito oficial. Ningún lab se perdió ni se desvinculó.

### Pensamiento Matemático (14)
- PM-I-P05 (n=8) — Razón y proporción (proporcionalidad directa e inversa).
- PM-I-P01 (n=9) — Las matemáticas como construcción humana e histórica.
- PM-I-P07 (n=10) — Estimación, aproximación y razonabilidad de resultados.
- PM-III-P07 (n=1) — **Ecuaciones lineales en una variable** → ahora OFICIAL (PM-III·O1). *(reubicado desde PM-II-P04)*
- PM-III-P08 (n=3) — **Sistemas de ecuaciones lineales 2×2** → ahora OFICIAL (PM-III·O3). *(reubicado desde PM-II-P05)*
- PM-III-P09 (n=10) — Inecuaciones lineales *(complemento; reubicado desde PM-II-P06, lab `inecuaciones-lineales`)*.
- PM-III-P01 (n=7) — Teorema de Pitágoras.
- PM-III-P03 (n=8) — Naturaleza de las raíces de una cuadrática (discriminante).
- PM-III-P04 (n=9) — Perímetros, áreas y volúmenes.

> Nota: PM-III-P07 y PM-III-P08 ya **no** son complementos (pasaron a oficiales O1/O3); se listan aquí solo
> para trazar la reubicación. Complementos reales de PM-III: P01, P03, P04 y P09 (4). PM-II ya no tiene complementos.
- PM-IV-P05 (n=5) — Ley de Senos y Ley de Cosenos (triángulos oblicuángulos).
- PM-V-P06 (n=6) — Derivada para máximos, mínimos y puntos de inflexión.
- PM-V-P08 (n=8) — Noción de diferencial y aproximaciones lineales.
- PM-VI-P03 (n=3) — Medidas de tendencia central.
- PM-VI-P04 (n=4) — Medidas de dispersión.
- PM-VI-P06 (n=6) — Probabilidad de eventos simples/compuestos/condicionales.
- PM-VI-P08 (n=8) — Interpretación crítica de estadística en medios.

### Cultura Digital (3)
- CD-I-P05 (n=9) — Derechos digitales y mecanismos para ejercerlos.
- CD-I-P07 (n=10) — Diversidad de identidades y comunicación digital inclusiva.
- CD-I-P08 (n=11) — Herramientas digitales para organización de información.

### Pensamiento Filosófico y Humanidades (1)
- PFH-I-P05 (n=6) — Diversidad de tradiciones filosóficas.

### Ciencias Naturales, Experimentales y Tecnología (15)
- CNEYT-I-P06 (n=2) — Método científico y medición.
- CNEYT-I-P07 (n=10) — Mujeres y grupos marginados en el desarrollo científico.
- CNEYT-I-P08 (n=11) — Materia y transformaciones ligadas a problemas ambientales.
- CNEYT-II-P01 (n=1) — Energía: definición, formas y unidades.
- CNEYT-II-P06 (n=101) — Consumo energético e impacto ambiental.
- CNEYT-II-P07 (n=102) — Energías renovables y no renovables en México.
- CNEYT-III-P01 (n=1) — Biomas y ecosistemas del planeta.
- CNEYT-III-P04 (n=4) — Ciclos biogeoquímicos (agua, carbono, nitrógeno, fósforo).
- CNEYT-III-P07 (n=7) — Políticas de conservación y restauración en México.
- CNEYT-IV-P06 (n=9) — Química orgánica e industria.
- CNEYT-IV-P07 (n=10) — Contaminantes químicos y plásticos.
- CNEYT-IV-P08 (n=11) — Experimentos de química con materiales accesibles.
- **CNEYT-V-P08 (n=8) — Ética del desarrollo tecnológico en física** *(ver callout)*.
- **CNEYT-VI-P03 (n=3) — Metabolismo celular** *(lab 3D, ver callout)*.
- **CNEYT-VI-P06 (n=6) — Mutaciones** *(lab 3D, ver callout)*.

---

## 6. Artefactos del PDF (1)

- **IN-V · O8** es un **duplicado verbatim del O1** por un corte de paginación del PDF oficial
  ("We are the champions"). No es un propósito real adicional. La progresión **IN-V-P08** (proyecto final
  integrador) es contenido legítimo y **se conserva tal cual** (no se marcó complemento ni se sobrescribió).
  Por eso IN-V figura 8/8 sin huecos ni complementos.

---

## 7. Impacto en los labs 3D (87 / 87 intactos)

- **CNEYT-V (Física), 8 labs** — todos caen bajo un propósito oficial:
  MRUA→O1, DCL/Newton→O2, gravitación→O3, ondas→O4, óptica→O5, **fluidos→O6** (nuevo, Fase 2),
  electromagnetismo→O7, espectro EM (c=λf, E=hf)→O8 (física moderna divulgativa). **CNEYT-V 8/8 sin huecos.**
- **CNEYT-VI (Biología), 9 labs** — 7 caen bajo propósito oficial (origen de la vida→O1, organelos→O3,
  ADN→O4, **división celular→O5** (nuevo, Fase 2), Mendel→O6, evolución→O7, CRISPR→O8). Metabolismo (P03) y
  Mutaciones (P06) quedan como complemento (ver §5). Solo el hueco O2 (teoría celular) sigue sin lab.
- **CNEYT-IV (Química), 3 labs nuevos (Fase 2)** — **equilibrio químico→O3**, **redox y combustión→O5** y
  **respiración aerobia/anaerobia→O8**, todos bajo propósito oficial. **CNEYT-IV queda 8/8 sin huecos.**
- Resto de áreas: sin cambios de vinculación.

---

## 8. Recomendaciones para una eventual Fase 2 (decisión del usuario)

1. ~~**Reubicar conceptualmente** los complementos de ecuaciones lineales de PM-II a PM-III·O1–O3.~~
   ✅ **HECHO (2026-06-07):** se reubicaron físicamente los datos (no solo conceptualmente). O1 y O3 cerrados
   con sus labs. **PM-III·O2** (dos incógnitas / ecuación de la recta) también ✅ **CERRADO** con contenido
   nuevo verbatim (progresión `PM-III-P10` + 7 actividades borrador + lab 3D `ecuacion-recta`). **PM-III 6/6.**
2. **Construir contenido para los huecos restantes** prioritizando los de Ciencias con potencial de lab 3D:
   respiración aerobia/anaerobia (CNEYT-IV·O8), estructura de una reacción química (CNEYT-III·O4).
   *(CNEYT-V·O6 fluidos, CNEYT-VI·O5 mitosis/meiosis, CNEYT-II·O4 propagación del calor, CNEYT-IV·O5
   redox/combustión, CNEYT-IV·O3 equilibrio químico, PM-V·O3 funciones de variable real, PM-V·O8 TFC
   y PM-VI·O8 distribución normal ✅ cerrados en Fase 2.)*
3. **PM-VI (Estadística)** queda con 3 huecos: conjuntos (O3), conteo (O4) y correlación (O6).
4. Mantener los 35 complementos como **rutas de enriquecimiento** visibles (ya etiquetadas).

---

*Generado tras aplicar `scripts/align-2025.ts --apply` (idempotente). Fuente verbatim:
`src/lib/mccems/contenido-2025.ts`. Sin commit — contenido en local hasta autorización explícita.*
