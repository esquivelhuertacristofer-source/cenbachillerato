# Mapa de Laboratorios — CEN Bachillerato
## Fecha: 2026-05-20
## Propósito: Identificar oportunidades de laboratorios interactivos para futura implementación
## Total de oportunidades identificadas: 26

---

## Resumen ejecutivo

| Métrica | Valor |
|---------|-------|
| Total oportunidades | 26 |
| Por familia PM | 9 |
| Por familia CNEYT | 10 |
| Por familia CD | 2 |
| Por familia PFH | 2 |
| Otras (CH, CS) | 3 |
| Complejidad Baja | 8 |
| Complejidad Media | 13 |
| Complejidad Alta | 5 |
| Prioridad Alta | 12 |

### Top 5 candidatos para piloto

1. **Graficador de Funciones con Sliders** (PM-II, PM-II-P04/P05) — La función lineal y los sistemas de ecuaciones son el núcleo de PM-II y el concepto de "ver la recta moverse" es imposible de lograr con imagen estática; impacto inmediato en todo el semestre 2.
2. **Simulador de Estados de la Materia** (CNEYT-I, CNEYT-I-P05) — El cambio de estado sólido-líquido-gas en función de temperatura y presión es el concepto más visual de semestre 1 y actualmente no hay ninguna simulación en la plataforma.
3. **Visualizador de Derivada como Pendiente de Tangente** (PM-V, PM-V-P03) — La derivada geométrica es el mayor obstáculo cognitivo de cálculo diferencial; sin animación interactiva el concepto queda abstracto irresolublemente para la mayoría.
4. **Simulador de Cinemática 1D** (CNEYT-V, CNEYT-V-P02) — Posición, velocidad y aceleración en tiempo real con gráficas sincronizadas; cubre dos progresiones centrales y conecta directamente con CEN Labs universitario existente.
5. **Tabla de Verdad Interactiva** (PM-I, PM-I-P03) — La lógica proposicional es el único contenido formal-simbólico de semestre 1; una tabla de verdad que se construye al tipear la proposición tiene complejidad baja y altísimo impacto en la comprensión.

---

## Sección 1: Pensamiento Matemático (PM I–VI)

### Lab 1: Visualizador de Recta Numérica y Operaciones con Fracciones

| Campo | Valor |
|-------|-------|
| UAC | PM-I |
| Progresión | PM-I-P04 — Opera con fracciones, decimales y porcentajes |
| Concepto | Fracciones como posiciones en la recta numérica; suma y resta visualmente |
| Tipo de laboratorio | Visualizador interactivo de recta numérica |
| Inputs del alumno | Numerador y denominador de dos fracciones; operación (suma, resta, multiplicar, dividir) |
| Outputs visuales | Segmentos coloreados en la recta, resultado como punto, representación decimal equivalente |
| Tecnología sugerida | SVG animado + vanilla JS |
| Complejidad | Baja (5-8h) |
| Prioridad | Media |

**Descripción:** La interfaz muestra una recta numérica de –3 a 3 con marcas de fracciones clave. El alumno ingresa dos fracciones mediante sliders de numerador/denominador; ambas aparecen como flechas de colores distintos sobre la recta. Al seleccionar la operación, una animación muestra cómo se combina el resultado. Un panel lateral convierte automáticamente la fracción a decimal y porcentaje, reforzando las tres representaciones del mismo número.

---

### Lab 2: Tabla de Verdad Interactiva

| Campo | Valor |
|-------|-------|
| UAC | PM-I |
| Progresión | PM-I-P03 — Razonamiento lógico: proposiciones, conectivos, negación, tablas de verdad |
| Concepto | Evaluación de proposiciones compuestas con conectivos lógicos |
| Tipo de laboratorio | Constructor de tabla de verdad |
| Inputs del alumno | Proposición escrita con variables (p, q, r) y conectivos (~, ∧, ∨, →, ↔); número de variables |
| Outputs visuales | Tabla de verdad completa generada automáticamente, columnas intermedias destacadas, tautología/contradicción marcada |
| Tecnología sugerida | Canvas 2D o DOM dinámico con CSS |
| Complejidad | Baja (6-8h) |
| Prioridad | Alta |

**Descripción:** El alumno escribe una fórmula lógica en notación estándar (p ∧ ¬q → r) y el laboratorio construye la tabla de verdad columna por columna, resaltando en rojo o verde cada celda según el valor. Un botón "paso a paso" permite ver cómo se evalúa cada subexpresión antes del resultado final. El sistema indica si la fórmula es tautología, contradicción o contingencia, con color de fondo de la columna final.

---

### Lab 3: Graficador de Función Lineal e Inecuaciones

| Campo | Valor |
|-------|-------|
| UAC | PM-II |
| Progresión | PM-II-P04 — Ecuaciones lineales; PM-II-P06 — Inecuaciones lineales |
| Concepto | Función lineal: pendiente, ordenada al origen; región solución de inecuación |
| Tipo de laboratorio | Graficador 2D interactivo con sliders |
| Inputs del alumno | Coeficientes m y b (forma y = mx + b); selector de inecuación (≤, ≥, <, >) |
| Outputs visuales | Recta que se mueve en tiempo real, región sombreada para inecuación, etiquetas de pendiente y corte |
| Tecnología sugerida | Plotly.js o D3.js |
| Complejidad | Baja (8-10h) |
| Prioridad | Alta |

**Descripción:** Dos sliders controlan m (de –5 a 5, paso 0.1) y b (de –10 a 10, paso 0.5). La recta se redibuja en tiempo real sobre un plano cartesiano interactivo con zoom. Al activar el modo "inecuación", el alumno elige el signo y aparece la región sombreada con transparencia. Un panel muestra la ecuación en formato limpio y explica en texto qué significa cada parámetro. Modo adicional: el alumno puede ingresar dos puntos y el graficador calcula m y b.

---

### Lab 4: Simulador de Sistemas de Ecuaciones Lineales

| Campo | Valor |
|-------|-------|
| UAC | PM-II |
| Progresión | PM-II-P05 — Sistemas de ecuaciones lineales en dos variables |
| Concepto | Intersección de dos rectas; tipos de sistema (compatible determinado, indeterminado, incompatible) |
| Tipo de laboratorio | Graficador 2D con dos rectas simultáneas |
| Inputs del alumno | Coeficientes a₁, b₁, c₁ y a₂, b₂, c₂ (forma ax + by = c); selector de método de resolución |
| Outputs visuales | Dos rectas coloreadas, punto de intersección destacado, clasificación del sistema, solución numérica |
| Tecnología sugerida | Plotly.js |
| Complejidad | Media (12-14h) |
| Prioridad | Alta |

**Descripción:** El alumno introduce los coeficientes de dos ecuaciones lineales. Las rectas se grafican inmediatamente con colores distintos. Si se intersectan, aparece un punto rojo pulsante en la solución con las coordenadas (x, y). Si son paralelas, el panel derecho muestra "Sistema incompatible — sin solución" con explicación visual. Si son la misma recta, muestra "Infinitas soluciones". Un panel paso a paso muestra el método de sustitución o eliminación seleccionado.

---

### Lab 5: Graficador de Función Cuadrática (Parábola Interactiva)

| Campo | Valor |
|-------|-------|
| UAC | PM-III |
| Progresión | PM-III-P06 — Representación gráfica de ecuaciones cuadráticas; PM-III-P02/P03 — Ecuaciones cuadráticas y discriminante |
| Concepto | Parábola: vértice, eje de simetría, raíces reales/complejas; efecto del discriminante |
| Tipo de laboratorio | Graficador 2D interactivo con sliders |
| Inputs del alumno | Coeficientes a, b, c (forma ax² + bx + c); botón "resolver" |
| Outputs visuales | Parábola dinámica, vértice marcado, raíces (o indicación de complejas), discriminante calculado, apertura de parábola |
| Tecnología sugerida | Plotly.js o D3.js |
| Complejidad | Media (12-16h) |
| Prioridad | Alta |

**Descripción:** Tres sliders controlan a, b y c. Al mover el slider de a, el alumno observa cómo cambia la apertura y la orientación de la parábola en tiempo real. El panel lateral muestra el discriminante b²–4ac con un semáforo de color: verde (2 raíces reales), amarillo (raíz doble), rojo (raíces complejas). Las raíces reales aparecen como puntos sobre la curva con sus valores numéricos. Una línea punteada marca el eje de simetría y una estrella el vértice.

---

### Lab 6: Círculo Unitario Interactivo

| Campo | Valor |
|-------|-------|
| UAC | PM-IV |
| Progresión | PM-IV-P04 — Razones trigonométricas en el círculo unitario; PM-IV-P03 — Razones en triángulo rectángulo |
| Concepto | Seno, coseno y tangente como coordenadas y cocientes en el círculo unitario |
| Tipo de laboratorio | Simulador de círculo unitario animado |
| Inputs del alumno | Ángulo en grados o radianes (slider rotacional o input numérico); selector de función |
| Outputs visuales | Punto en el círculo con ángulo, segmentos de sen/cos/tan, valores numéricos en tiempo real, cuadrante destacado |
| Tecnología sugerida | Canvas 2D o SVG animado |
| Complejidad | Media (14-18h) |
| Prioridad | Alta |

**Descripción:** El alumno arrastra un punto sobre el círculo unitario (radio = 1) y observa en tiempo real los segmentos que representan sen(θ) en el eje vertical y cos(θ) en el eje horizontal, con sus valores numéricos. Un panel inferior muestra la tabla de ángulos notables (0°, 30°, 45°, 60°, 90°…) y resalta la celda correspondiente al ángulo actual. El modo "tangente" extiende un segmento hasta la recta tangente al círculo en x=1, mostrando visualmente por qué la tangente puede ser mayor que 1.

---

### Lab 7: Graficador de Funciones Trigonométricas con Parámetros

| Campo | Valor |
|-------|-------|
| UAC | PM-IV |
| Progresión | PM-IV-P02 — Funciones polinomiales y transformaciones; PM-IV-P04 — Círculo unitario |
| Concepto | Transformaciones de y = A·sen(Bx + C) + D: amplitud, periodo, fase, desplazamiento vertical |
| Tipo de laboratorio | Graficador 2D con sliders de parámetros |
| Inputs del alumno | A (amplitud), B (frecuencia angular), C (desfase), D (desplazamiento vertical); selector sen/cos/tan |
| Outputs visuales | Curva periódica actualizada en tiempo real, marcas de amplitud, periodo y fase, etiquetas dinámicas |
| Tecnología sugerida | Plotly.js o D3.js |
| Complejidad | Media (14-16h) |
| Prioridad | Alta |

**Descripción:** Cuatro sliders controlan los parámetros A, B, C, D. Al mover A, el alumno ve la curva "crecer" o "aplanarse" verticalmente; al mover B, el periodo se comprime o expande, con una flecha doble que indica la longitud del periodo en el eje x. Una línea punteada horizontal marca la amplitud máxima y mínima. El modo comparación permite superponer dos funciones con distintos parámetros en colores diferentes para ver la diferencia de fase.

---

### Lab 8: Visualizador de Límites y Derivada como Pendiente de la Tangente

| Campo | Valor |
|-------|-------|
| UAC | PM-V |
| Progresión | PM-V-P01 — Límite de una función; PM-V-P03 — Derivada como pendiente de la tangente |
| Concepto | Concepto geométrico de derivada: secante que se convierte en tangente cuando Δx→0 |
| Tipo de laboratorio | Simulador de derivada geométrica interactivo |
| Inputs del alumno | Función f(x) (selección de preset o expresión); punto x₀; tamaño de Δx (slider) |
| Outputs visuales | Curva de f(x), recta secante que rota hacia la tangente al reducir Δx, pendiente numérica en tiempo real, cociente diferencial |
| Tecnología sugerida | Plotly.js + math.js para parsing |
| Complejidad | Media (16-20h) |
| Prioridad | Alta |

**Descripción:** El alumno selecciona una función (x², x³, sen(x), eˣ) y ubica el punto x₀ haciendo clic sobre la gráfica. Un slider controla Δx de 2.0 hasta 0.001. A medida que reduce Δx, la recta secante (naranja) rota en tiempo real hasta coincidir con la tangente (azul) cuando Δx → 0. Un contador numérico muestra [f(x₀+Δx)–f(x₀)]/Δx acercándose al valor exacto de f'(x₀). Este lab hace visible en segundos lo que páginas de texto no logran comunicar sobre el concepto de límite.

---

### Lab 9: Explorador de Máximos, Mínimos y Análisis de Funciones

| Campo | Valor |
|-------|-------|
| UAC | PM-V |
| Progresión | PM-V-P06 — Máximos, mínimos y puntos de inflexión; PM-V-P07 — Optimización |
| Concepto | Criterio de la primera y segunda derivada; análisis completo del comportamiento de una función |
| Tipo de laboratorio | Analizador gráfico de funciones polinomiales |
| Inputs del alumno | Coeficientes de polinomio hasta grado 4; rango de visualización |
| Outputs visuales | Gráfica de f(x), gráfica de f'(x) y f''(x) superpuestas o en paneles, máximos/mínimos marcados, intervalos de crecimiento coloreados |
| Tecnología sugerida | Plotly.js con subplots |
| Complejidad | Media (16-20h) |
| Prioridad | Media |

**Descripción:** El alumno introduce un polinomio (por ejemplo 2x³–3x²–12x+5) y el laboratorio muestra tres gráficas sincronizadas: f(x) en azul, f'(x) en naranja y f''(x) en verde. Los ceros de f'(x) se marcan como puntos críticos en la gráfica de f(x) con etiquetas "máximo local" o "mínimo local". Los intervalos donde f'(x) > 0 se colorean de verde en f(x) (función creciente) y de rojo donde f'(x) < 0 (decreciente). El alumno puede arrastrar la gráfica para ver contexto mayor.

---

### Lab 10: Simulador de Histogramas y Probabilidad Experimental

| Campo | Valor |
|-------|-------|
| UAC | PM-VI |
| Progresión | PM-VI-P02 — Histogramas y polígonos de frecuencia; PM-VI-P05/P06 — Probabilidad clásica y frecuentista |
| Concepto | Distribución de frecuencias; convergencia de frecuencia relativa a probabilidad teórica con n grande |
| Tipo de laboratorio | Simulador de experimentos aleatorios con histograma en tiempo real |
| Inputs del alumno | Tipo de experimento (dados, moneda, urna, distribución normal); número de ensayos (1 a 10,000); velocidad de simulación |
| Outputs visuales | Histograma que crece con cada ensayo, línea de probabilidad teórica superpuesta, medidas de tendencia central actualizadas en tiempo real |
| Tecnología sugerida | D3.js o Plotly.js |
| Complejidad | Media (14-18h) |
| Prioridad | Alta |

**Descripción:** El alumno elige "lanzar dado" y pulsa "Simular 1000 veces". El histograma se construye barra por barra (o en lotes de 10) a velocidad controlable, mientras una línea roja marca la probabilidad teórica de 1/6 por cara. Con pocos ensayos las barras son irregulares; a medida que n crece, el histograma converge visiblemente a la distribución uniforme. Esto demuestra experimentalmente la ley de los grandes números sin necesidad de demostración matemática formal. La varianza y la media se actualizan en un panel lateral en cada paso.

---

## Sección 2: Ciencias Naturales (CNEYT I–VI)

### Lab 11: Simulador de Estados de la Materia

| Campo | Valor |
|-------|-------|
| UAC | CNEYT-I |
| Progresión | CNEYT-I-P05 — Estados de agregación de la materia y cambios de estado |
| Concepto | Transición sólido-líquido-gas en función de temperatura y presión; diagrama de fases simplificado |
| Tipo de laboratorio | Simulador de partículas en 2D |
| Inputs del alumno | Temperatura (slider 0–500 K); presión (slider 0.1–10 atm); tipo de sustancia (agua, CO₂, oxígeno) |
| Outputs visuales | Partículas animadas con movimiento representativo del estado, diagrama de fases con punto de operación, cambios de fase en tiempo real |
| Tecnología sugerida | Canvas 2D con simulación de partículas |
| Complejidad | Alta (35-45h) |
| Prioridad | Alta |

**Descripción:** Un panel izquierdo muestra decenas de partículas en movimiento cuya velocidad y patrón varía según el estado: vibrando en posición fija (sólido), moviéndose con rozamiento (líquido), o volando libremente y rebotando en las paredes (gas). El panel derecho muestra el diagrama de fases T–P con una cruz que se mueve al mover los sliders, cruzando las líneas de fusión y vaporización. Cuando la temperatura cruza el punto de ebullición, la animación de partículas cambia de estado con una transición gradual. Este lab convierte en visible lo que solo existe a escala molecular.

---

### Lab 12: Modelo Atómico Interactivo

| Campo | Valor |
|-------|-------|
| UAC | CNEYT-I |
| Progresión | CNEYT-I-P03 — Estructura básica del átomo |
| Concepto | Modelo atómico: protones, neutrones, electrones; número atómico, másico; capas electrónicas |
| Tipo de laboratorio | Constructor 3D/2D de átomos |
| Inputs del alumno | Número de protones (1–20); número de neutrones; selector de elemento de la tabla periódica |
| Outputs visuales | Núcleo con protones/neutrones, electrones orbitando en capas, nombre del elemento, número atómico y másico, estabilidad |
| Tecnología sugerida | Three.js (órbitas 3D) o Canvas 2D |
| Complejidad | Alta (30-40h) |
| Prioridad | Media |

**Descripción:** El alumno arrastra protones (bolas rojas) y neutrones (bolas grises) al núcleo central. Los electrones aparecen automáticamente en las capas K, L, M según el número de protones. Un selector de la tabla periódica (primeros 20 elementos) rellena automáticamente la configuración correcta. Al construir un átomo inestable (demasiados neutrones para el número atómico), el panel muestra "Inestable — radiactivo" con una advertencia visual. Este lab hace tangible la abstracción del modelo planetario de Bohr.

---

### Lab 13: Simulador de Transformación de Energía

| Campo | Valor |
|-------|-------|
| UAC | CNEYT-II |
| Progresión | CNEYT-II-P01/P02 — Formas de energía y transformaciones; CNEYT-II-P03 — Termodinámica |
| Concepto | Conservación de la energía: conversión entre energía potencial, cinética y térmica |
| Tipo de laboratorio | Simulador de sistemas mecánicos con balance energético |
| Inputs del alumno | Altura inicial de caída (slider); masa del objeto; coeficiente de rozamiento |
| Outputs visuales | Animación de caída libre o plano inclinado, barras de energía potencial/cinética/térmica que suman constante, gráfica tiempo-energía |
| Tecnología sugerida | Canvas 2D + física básica |
| Complejidad | Media (14-18h) |
| Prioridad | Alta |

**Descripción:** El alumno configura una bola en lo alto de un plano inclinado y pulsa "soltar". La bola baja animada con física realista mientras tres barras verticales muestran Ep (azul), Ec (naranja) y Etérmica (rojo) sumando siempre la misma cantidad total (Energía total conservada). Al aumentar el rozamiento, la barra roja crece más rápido y la bola llega más lento a la base. Una gráfica debajo registra las tres energías en función del tiempo. Esta visualización hace completamente evidente la ley de conservación de la energía.

---

### Lab 14: Simulador de Gases Ideales (Leyes de Boyle y Charles)

| Campo | Valor |
|-------|-------|
| UAC | CNEYT-II |
| Progresión | CNEYT-II-P03 — Termodinámica básica; CNEYT-II-P04 — Calor y temperatura |
| Concepto | Ley de Boyle (P·V = cte a T constante), Ley de Charles (V/T = cte a P constante), Ley General de Gases |
| Tipo de laboratorio | Simulador de gas en cilindro con émbolo |
| Inputs del alumno | Temperatura (slider, en K); presión aplicada al émbolo (slider); cantidad de gas (mol) |
| Outputs visuales | Cilindro con partículas animadas que se mueven más rápido al subir T, émbolo que sube/baja, gráfica P–V en tiempo real |
| Tecnología sugerida | Canvas 2D |
| Complejidad | Media (16-20h) |
| Prioridad | Alta |

**Descripción:** Un cilindro con émbolo transparente muestra partículas de gas coloreadas. Al subir la temperatura con el slider, las partículas se mueven más rápido (velocidad proporcional a √T) y el émbolo sube, aumentando el volumen. Al comprimir el émbolo, las partículas quedan más juntas y chocan con más frecuencia (mayor presión). La gráfica P–V a la derecha dibuja la hipérbola de Boyle en tiempo real. El modo "Ley de Charles" bloquea la presión y muestra la gráfica V–T lineal. La experiencia traduce a lo visible un fenómeno microscópico imposible de observar directamente.

---

### Lab 15: Simulador de Red Trófica Interactiva

| Campo | Valor |
|-------|-------|
| UAC | CNEYT-III |
| Progresión | CNEYT-III-P02 — Flujo de energía y redes tróficas |
| Concepto | Cadenas y redes tróficas; eficiencia energética del 10% por nivel; consecuencias de eliminar una especie |
| Tipo de laboratorio | Simulador de ecosistema con nodos interactivos |
| Inputs del alumno | Selección de ecosistema (bosque, océano, pradera); modificación de población de una especie; eliminación de eslabón |
| Outputs visuales | Grafo de la red trófica con flechas de flujo de energía, barras de población de cada especie, cascada de efectos animada |
| Tecnología sugerida | D3.js force-directed graph |
| Complejidad | Alta (35-45h) |
| Prioridad | Media |

**Descripción:** El alumno ve un grafo interactivo con nodos (especies) y flechas (relaciones de depredación). Puede hacer clic en cualquier especie para modificar su población con un slider. Al reducir drásticamente los lobos en un ecosistema boscoso, el simulador muestra cómo los ciervos aumentan, el pasto disminuye, y otras especies afectadas cambian sus barras en una cascada temporal. Este laboratorio hace tangible el concepto de cascada trófica y la interconexión de los ecosistemas, algo imposible de transmitir con un diagrama estático.

---

### Lab 16: Simulador de Ciclos Biogeoquímicos

| Campo | Valor |
|-------|-------|
| UAC | CNEYT-III |
| Progresión | CNEYT-III-P04 — Ciclos biogeoquímicos del agua, carbono, nitrógeno y fósforo |
| Concepto | Flujo de materia entre reservorios (atmósfera, suelo, agua, seres vivos); impacto humano |
| Tipo de laboratorio | Diagrama de flujo animado e interactivo |
| Inputs del alumno | Selección de ciclo (agua/carbono/nitrógeno); nivel de actividad industrial/agrícola (slider); tiempo de simulación |
| Outputs visuales | Reservorios con cantidades numéricas animadas, flechas de flujo con grosor proporcional, panel de impacto ambiental |
| Tecnología sugerida | SVG animado + D3.js |
| Complejidad | Media (14-18h) |
| Prioridad | Media |

**Descripción:** El ciclo del carbono se muestra como un diagrama con cinco reservorios (atmósfera, océano, suelo, biomasa vegetal, combustibles fósiles). Flechas con grosor proporcional indican el flujo de carbono en Gt/año. Al subir el slider de "actividad industrial", la flecha de "combustión" se engrosa y el número en el reservorio "atmósfera" crece, disparando un indicador de CO₂ atmosférico. El alumno puede comparar el ciclo preindustrial con el actual para visualizar el desequilibrio causado por el ser humano.

---

### Lab 17: Simulador de Reacciones Ácido-Base y pH

| Campo | Valor |
|-------|-------|
| UAC | CNEYT-IV |
| Progresión | CNEYT-IV-P03 — Concepto de pH, ácidos y bases |
| Concepto | Escala de pH; soluciones ácidas, neutras y básicas; indicadores de color |
| Tipo de laboratorio | Simulador de laboratorio de química virtual |
| Inputs del alumno | Sustancia a agregar (ácido fuerte, ácido débil, base, agua); cantidad (mL); concentración |
| Outputs visuales | Vaso de precipitados con color del indicador en tiempo real, valor de pH con escala cromática, gráfica de titulación si se combina ácido y base |
| Tecnología sugerida | Canvas 2D o SVG |
| Complejidad | Media (12-16h) |
| Prioridad | Alta |

**Descripción:** El alumno "vierte" sustancias en un vaso virtual usando sliders de volumen y concentración. El líquido cambia de color instantáneamente (rojo → naranja → amarillo → verde → azul → violeta) según el pH resultante, que aparece en un termómetro numérico. Al agregar una base sobre un ácido, el color cambia gradualmente y la gráfica de titulación (pH vs. volumen) se dibuja en tiempo real, mostrando el punto de equivalencia. Este lab simula un experimento que en escuela real requiere reactivos y tiempo; aquí es instantáneo y repetible.

---

### Lab 18: Simulador de Cinemática 1D

| Campo | Valor |
|-------|-------|
| UAC | CNEYT-V |
| Progresión | CNEYT-V-P02 — MRU y MRUA con representaciones gráficas; CNEYT-V-P01 — Leyes de Newton |
| Concepto | Posición, velocidad, aceleración en función del tiempo; gráficas x-t, v-t, a-t sincronizadas |
| Tipo de laboratorio | Simulador de cinemática con gráficas sincronizadas |
| Inputs del alumno | Posición inicial (x₀), velocidad inicial (v₀), aceleración (a); tipo de movimiento (libre, plano inclinado, fuerza aplicada) |
| Outputs visuales | Animación del objeto en movimiento, tres gráficas x-t, v-t, a-t actualizadas en tiempo real, valores instantáneos |
| Tecnología sugerida | Canvas 2D + Plotly.js |
| Complejidad | Media (16-20h) |
| Prioridad | Alta |

**Descripción:** El alumno configura x₀ = 0 m, v₀ = 10 m/s y a = –2 m/s². Al pulsar "iniciar", un auto se mueve sobre una pista y simultáneamente se dibujan las tres gráficas: la parábola de posición, la recta de velocidad (que llega a cero y se vuelve negativa) y la recta horizontal de aceleración constante. Un cursor vertical sincronizado en las tres gráficas permite al alumno "viajar en el tiempo" y ver los valores exactos de x, v y a en cualquier instante. La sincronización del movimiento con las gráficas es el aprendizaje más difícil de transmitir con papel y lápiz.

---

### Lab 19: Simulador de Ondas

| Campo | Valor |
|-------|-------|
| UAC | CNEYT-V |
| Progresión | CNEYT-V-P04 — Movimiento ondulatorio: amplitud, frecuencia, longitud de onda, velocidad |
| Concepto | Parámetros de una onda; relación v = f·λ; interferencia constructiva y destructiva |
| Tipo de laboratorio | Simulador de onda transversal animada |
| Inputs del alumno | Amplitud A (slider), frecuencia f (slider), velocidad de propagación v (slider); modo: una onda o dos ondas |
| Outputs visuales | Onda animada en tiempo real con etiquetas de λ y A, pantalla de interferencia al combinar dos ondas |
| Tecnología sugerida | Canvas 2D |
| Complejidad | Baja (8-12h) |
| Prioridad | Alta |

**Descripción:** Una onda sinusoidal se anima de izquierda a derecha. Los sliders de frecuencia y amplitud la modifican en tiempo real: al aumentar f, las crestas se juntan (λ disminuye) y la velocidad de desplazamiento aumenta; la relación v = f·λ se muestra en el panel con los valores numéricos actualizados. En el modo "dos ondas", el alumno puede superponer dos ondas con diferente fase y ver la onda resultante, observando interferencia constructiva (amplitud doble) y destructiva (cancelación). Este es uno de los conceptos más contraintuitivos que solo cobra sentido con animación.

---

### Lab 20: Simulador de Herencia Mendeliana (Cuadro de Punnett)

| Campo | Valor |
|-------|-------|
| UAC | CNEYT-VI |
| Progresión | CNEYT-VI-P05 — Herencia genética: Leyes de Mendel y herencia no mendeliana |
| Concepto | Cruzas monohíbridas y dihíbridas; probabilidad de genotipos y fenotipos; dominancia y recesividad |
| Tipo de laboratorio | Constructor de cuadro de Punnett interactivo |
| Inputs del alumno | Genotipo del padre (alelos dominante/recesivo, codominantes, o ligados al sexo); genotipo de la madre; tipo de herencia |
| Outputs visuales | Cuadro de Punnett completo, probabilidades de cada genotipo y fenotipo, representación visual del fenotipo (color, forma) |
| Tecnología sugerida | SVG animado o DOM dinámico |
| Complejidad | Media (14-18h) |
| Prioridad | Alta |

**Descripción:** El alumno selecciona los alelos de ambos progenitores usando selectores visuales (A para dominante, a para recesivo). El cuadro de Punnett se completa automáticamente con las cuatro combinaciones, y cada celda muestra el fenotipo como un color o ícono (flor morada o blanca, ojo azul o marrón). Las probabilidades se calculan al instante: "75% dominante / 25% recesivo". El modo dihíbrido despliega un cuadro de 4×4 que sería muy tedioso dibujar manualmente, pero que el alumno puede explorar en segundos para verificar la proporción 9:3:3:1.

---

## Sección 3: Cultura Digital (CD I–III)

### Lab 21: Diagrama Interactivo de Componentes de Computadora

| Campo | Valor |
|-------|-------|
| UAC | CD-I |
| Progresión | CD-I-P01 — Componentes básicos de hardware y software |
| Concepto | Arquitectura de una computadora: CPU, RAM, almacenamiento, bus, periféricos; relación entre componentes |
| Tipo de laboratorio | Diagrama interactivo de arquitectura con tooltips |
| Inputs del alumno | Clic/hover sobre cada componente; selección de "camino de datos" (qué ocurre al abrir un archivo, al ejecutar un programa) |
| Outputs visuales | Diagrama del sistema con componentes destacados, animación del flujo de datos, explicaciones emergentes, comparativa de velocidades |
| Tecnología sugerida | SVG animado con CSS transitions |
| Complejidad | Baja (6-8h) |
| Prioridad | Media |

**Descripción:** El alumno ve un diagrama esquemático de una computadora con componentes etiquetados (CPU, RAM, SSD, GPU, teclado, pantalla). Al hacer hover sobre la CPU, aparece un tooltip con explicación y una animación de "cómo procesa instrucciones". Al seleccionar el escenario "abrir un archivo", una animación con flechas y colores muestra el recorrido: SSD → RAM → CPU → pantalla, con los tiempos típicos en nanosegundos. Este lab convierte en visible la arquitectura de Von Neumann que de otro modo queda como lista de definiciones.

---

### Lab 22: Simulador de Algoritmos y Pensamiento Computacional

| Campo | Valor |
|-------|-------|
| UAC | CD-I |
| Progresión | CD-I-P04 — Funcionamiento básico de algoritmos |
| Concepto | Algoritmo como secuencia de instrucciones; estructuras de control: secuencia, condicional, ciclo |
| Tipo de laboratorio | Constructor visual de flowchart (diagrama de flujo) |
| Inputs del alumno | Bloques de instrucción (inicio, proceso, decisión, ciclo, fin) arrastrables; conexión entre bloques; valores de entrada |
| Outputs visuales | Diagrama de flujo visual, ejecución animada paso a paso, resultado de la ejecución |
| Tecnología sugerida | Canvas 2D con drag-and-drop o librería de diagramas (Blockly-inspired) |
| Complejidad | Alta (40-50h) |
| Prioridad | Media |

**Descripción:** El alumno construye un algoritmo arrastrando bloques de colores: amarillo para proceso ("calcula x + 2"), azul para decisión ("¿x > 10?"), naranja para ciclo (repetir N veces), verde para inicio/fin. Al pulsar "ejecutar", el algoritmo se anima: una bolita recorre el camino entre bloques iluminando cada nodo activo. Al ingresar valores de prueba distintos, la bolita toma caminos diferentes en los condicionales. Este lab hace completamente concreto el concepto de "algoritmo" antes de que el alumno vea código de programación.

---

## Sección 4: Pensamiento Filosófico y Humanidades (PFH I–III)

### Lab 23: Constructor de Mapa de Argumentos

| Campo | Valor |
|-------|-------|
| UAC | PFH-III |
| Progresión | PFH-III-P01 — Lógica y argumentación: deducción, inducción, falacias |
| Concepto | Estructura de un argumento: tesis, premisas, conclusión; identificación de falacias |
| Tipo de laboratorio | Constructor de mapa argumental interactivo (árbol de razones) |
| Inputs del alumno | Texto de tesis; premisas añadidas como nodos; tipo de relación (apoya, refuta, matiza); marcado de falacias |
| Outputs visuales | Grafo interactivo del argumento, score de solidez lógica, panel de falacias detectadas, exportación del mapa |
| Tecnología sugerida | D3.js force-directed o Cytoscape.js |
| Complejidad | Media (16-20h) |
| Prioridad | Media |

**Descripción:** El alumno escribe una tesis central que aparece como nodo raíz. Luego añade premisas como nodos secundarios y conecta cada una con una flecha etiquetada ("apoya", "contradice", "es ejemplo de"). Las premisas a su vez pueden tener sub-premisas, formando un árbol. Un panel analiza la estructura: si hay falacias ad hominem o circulares, aparecen marcadas en rojo. El alumno puede cargar argumentos de ejemplo (discursos políticos, textos filosóficos) y mapearlos. Esta herramienta convierte el análisis argumentativo de actividad puramente verbal a visual-estructural.

---

### Lab 24: Simulador de Dilemas Éticos con Árbol de Consecuencias

| Campo | Valor |
|-------|-------|
| UAC | PFH-II |
| Progresión | PFH-II-P02 — Fundamentos éticos; PFH-II-P03 — Dilemas bioéticos contemporáneos |
| Concepto | Marcos éticos (consecuencialista, deontológico, de la virtud) aplicados a dilemas reales; análisis de consecuencias |
| Tipo de laboratorio | Árbol de decisión ética interactivo |
| Inputs del alumno | Selección de dilema ético (tranvía, dilema del médico, uso de IA, CRISPR); marco ético seleccionado; decisión del alumno |
| Outputs visuales | Árbol de consecuencias que se despliega con cada decisión, análisis desde cada marco ético, posiciones de distintos filósofos |
| Tecnología sugerida | D3.js tree layout o SVG animado |
| Complejidad | Media (16-20h) |
| Prioridad | Media |

**Descripción:** El alumno selecciona el "problema del tranvía" y toma una decisión (desviar el tranvía / no hacer nada). Un árbol de consecuencias se despliega mostrando las implicaciones de cada opción. A la derecha, tres paneles analizan la misma decisión desde el utilitarismo (maximizar bienestar), la ética kantiana (actuar por deber) y la ética de la virtud (¿qué haría una persona virtuosa?). El alumno puede navegar distintos dilemas y comparar cómo los marcos filosóficos llevan a conclusiones diferentes. Convierte un debate abstracto en una experiencia de navegación estructurada.

---

## Sección 5: Otras materias (CH, CS)

### Lab 25: Línea de Tiempo Histórica Interactiva con Mapa

| Campo | Valor |
|-------|-------|
| UAC | CH-I |
| Progresión | CH-I-P01 — Coordenadas espacio-temporales; CH-I-P03 — Causalidad histórica multicausal |
| Concepto | Ubicación de eventos históricos en tiempo y espacio; visualización de relaciones causales |
| Tipo de laboratorio | Línea de tiempo sincronizada con mapa geográfico |
| Inputs del alumno | Filtro de periodo histórico; filtro de región (México, América, Europa, mundo); selección de proceso histórico |
| Outputs visuales | Línea de tiempo scrollable, mapa con eventos marcados geolocalizados, panel de causas y consecuencias al hacer clic en un evento |
| Tecnología sugerida | Leaflet.js (mapa) + D3.js (línea de tiempo) |
| Complejidad | Alta (35-45h) |
| Prioridad | Media |

**Descripción:** Una línea de tiempo horizontal (eje x: años) se sincroniza con un mapa geográfico. Al hacer clic en el evento "Revolución Industrial (1760–1840)", el mapa resalta Inglaterra con un polígono naranja y aparece un panel lateral con causas (izquierda, flechas entrantes) y consecuencias (derecha, flechas salientes). Al hacer clic en una consecuencia ("Urbanización masiva"), aparece como nuevo evento en la línea de tiempo, permitiendo navegar las cadenas causales. El laboratorio hace tangible la multicausalidad histórica y la dimensión espacial de los procesos.

---

### Lab 26: Mapa Interactivo de Indicadores Sociales de México

| Campo | Valor |
|-------|-------|
| UAC | CS-I / CS-II |
| Progresión | CS-I-P02 — Ciudadanía y brechas reales; CS-II-P01 — Bienestar social y desigualdades |
| Concepto | Desigualdad social en México: distribución geográfica de indicadores de bienestar, pobreza, educación, salud |
| Tipo de laboratorio | Mapa coroplético interactivo de México |
| Inputs del alumno | Selección de indicador (IDH, pobreza %, años de escolaridad, mortalidad infantil); año de referencia; escala de color |
| Outputs visuales | Mapa de México por estados/municipios con color según indicador, gráfica comparativa, ranking de estados |
| Tecnología sugerida | Leaflet.js con datos GeoJSON de INEGI |
| Complejidad | Media (12-16h) |
| Prioridad | Media |

**Descripción:** El alumno selecciona "Porcentaje de pobreza por estado" y el mapa de México se colorea instantáneamente: Chiapas y Guerrero en rojo oscuro (alta pobreza), CDMX y Nuevo León en verde claro (menor pobreza). Al cambiar a "años de escolaridad promedio", el patrón cambia pero la desigualdad Norte-Sur se mantiene visible. Un panel lateral muestra el ranking de los 32 estados para el indicador seleccionado, y una barra deslizante de años (2000–2023) anima el cambio temporal. El mapa hace tangible la dimensión espacial de la desigualdad social, núcleo de las progresiones CS.

---

## Sección 6: Comparativa con CEN Labs existente

CEN Labs (https://cenlaboratorios.com.mx) tiene 40 simuladores Three.js para nivel universitario. Basado en el nombre del proyecto y el contexto de CEN Bachillerato, las siguientes categorías son adaptables:

| Área CEN Labs | Adaptable a bachillerato? | UAC destino | Ajuste requerido |
|---------------|---------------------------|-------------|-----------------|
| Física mecánica (cinemática, dinámica) | Sí — alta prioridad | CNEYT-V (P01, P02) | Reducir complejidad matemática; eliminar vectores en 3D; usar 1D primero |
| Termodinámica (gases ideales, ciclos) | Sí — alta prioridad | CNEYT-II (P03, P04) | Simplificar a nivel cualitativo; usar diagramas P-V sin cálculo de trabajo |
| Física ondulatoria (ondas, sonido) | Sí | CNEYT-V (P04) | Reducir a ondas transversales simples; eliminar interferencia compleja |
| Electromagnetismo | Sí — parcial | CNEYT-V (P07) | Solo principios cualitativos; eliminar ley de Faraday con cálculo integral |
| Óptica (reflexión, refracción, lentes) | Sí | CNEYT-V (P06) | Simplificar a rayos; usar geometría de triángulos en lugar de óptica de Fourier |
| Química cuántica / espectroscopía | No — demasiado avanzado | — | Requiere conocimiento de MQ que no está en curriculum de bachillerato |
| Relatividad especial | No | — | Fuera del alcance del MCCEMS 2025 para bachillerato |
| Cálculo diferencial / análisis | Sí — con simplificación | PM-V (P03, P06) | Reutilizar la lógica de graficadores; simplificar funciones de preset |
| Estadística y probabilidad | Sí — directamente | PM-VI (P02–P06) | Adaptar histogramas universitarios a contextos de bachillerato |
| Biología molecular / genética | Sí — nueva área | CNEYT-VI (P04, P05) | Esta área no está cubierta en CEN Labs; es oportunidad de expansión |

---

## Sección 7: Priorización

### Matriz impacto × esfuerzo

| Laboratorio | Impacto pedagógico (1-5) | Esfuerzo (h) | Ratio (impacto/esfuerzo×10) |
|-------------|--------------------------|--------------|----------------------------|
| Lab 2 — Tabla de Verdad Interactiva | 5 | 7h | 0.71 |
| Lab 19 — Simulador de Ondas | 5 | 10h | 0.50 |
| Lab 8 — Derivada como Pendiente de Tangente | 5 | 18h | 0.28 |
| Lab 3 — Graficador Función Lineal/Inecuaciones | 4 | 9h | 0.44 |
| Lab 13 — Transformación de Energía | 5 | 16h | 0.31 |
| Lab 18 — Simulador de Cinemática 1D | 5 | 18h | 0.28 |
| Lab 10 — Histogramas y Probabilidad Experimental | 4 | 16h | 0.25 |
| Lab 1 — Visualizador de Recta Numérica | 3 | 6h | 0.50 |
| Lab 17 — Simulador pH Ácido-Base | 4 | 14h | 0.29 |
| Lab 5 — Graficador Función Cuadrática | 4 | 14h | 0.29 |
| Lab 6 — Círculo Unitario Interactivo | 5 | 16h | 0.31 |
| Lab 20 — Cuadro de Punnett Interactivo | 4 | 16h | 0.25 |
| Lab 4 — Sistemas de Ecuaciones Lineales | 4 | 13h | 0.31 |
| Lab 14 — Gases Ideales (Boyle-Charles) | 4 | 18h | 0.22 |
| Lab 11 — Estados de la Materia | 5 | 40h | 0.13 |
| Lab 26 — Mapa Indicadores Sociales México | 3 | 14h | 0.21 |
| Lab 7 — Graficador Funciones Trigonométricas | 4 | 15h | 0.27 |
| Lab 12 — Modelo Atómico | 3 | 35h | 0.09 |
| Lab 9 — Máximos, Mínimos y Análisis | 3 | 18h | 0.17 |
| Lab 23 — Mapa de Argumentos | 3 | 18h | 0.17 |
| Lab 16 — Ciclos Biogeoquímicos | 3 | 16h | 0.19 |
| Lab 21 — Diagrama Componentes Computadora | 3 | 7h | 0.43 |
| Lab 24 — Dilemas Éticos | 3 | 18h | 0.17 |
| Lab 13 ya listado; Lab 25 — Línea de Tiempo Histórica | 3 | 40h | 0.08 |
| Lab 15 — Red Trófica Interactiva | 3 | 40h | 0.08 |
| Lab 22 — Constructor de Flowchart | 4 | 45h | 0.09 |

### Recomendación de 5 laboratorios piloto

**Piloto 1 — Lab 2: Tabla de Verdad Interactiva (PM-I-P03)**
Ratio más alto del catálogo (0.71). Complejidad baja (7h de desarrollo), impacto pedagógico máximo. La lógica proposicional es el único contenido formal-simbólico de semestre 1; los estudiantes batallan con la evaluación manual fila por fila. El laboratorio elimina el error procedimental y permite explorar la estructura de los conectivos, lo que es el verdadero objetivo de aprendizaje. Puede usarse desde la primera semana del semestre 1 con todos los grupos.

**Piloto 2 — Lab 19: Simulador de Ondas (CNEYT-V-P04)**
Segunda ratio más alta para labs de complejidad baja. Las ondas son notoriamente difíciles de enseñar porque son un fenómeno dinámico inherentemente: una imagen de una onda no transmite ni el movimiento ni la relación v = f·λ. Con 10h de desarrollo se obtiene un recurso que también sirve para CNEYT-IV (sonido), CNEYT-V (espectro electromagnético) y hasta como prerequisito al Lab 6 de trigonometría.

**Piloto 3 — Lab 3: Graficador Función Lineal e Inecuaciones (PM-II-P04/P06)**
PM-II es el semestre de álgebra y funciones: sin poder ver la recta, los estudiantes trabajan algebraicamente sin intuición geométrica. Este laboratorio de 9h de desarrollo cubre dos progresiones simultáneamente y es prerequisito conceptual para el Lab 4 (sistemas de ecuaciones) y el Lab 5 (función cuadrática). Establece la infraestructura de graficación que puede reutilizarse en Labs 5, 7, 8 y 9.

**Piloto 4 — Lab 8: Visualizador de Derivada como Pendiente de Tangente (PM-V-P01/P03)**
El concepto de límite y derivada es la mayor barrera cognitiva del bachillerato. Ninguna imagen estática comunica que la recta secante "se convierte en" la tangente cuando Δx → 0; es un proceso dinámico que requiere animación. Con 18h de desarrollo se resuelve el obstáculo central del semestre 5 de matemáticas. La lógica del parser de funciones puede reutilizarse en el Lab 9.

**Piloto 5 — Lab 18: Simulador de Cinemática 1D (CNEYT-V-P01/P02)**
La sincronización entre el movimiento del objeto y las gráficas x-t, v-t, a-t es el reto central de la física cinemática. Los estudiantes pueden hacer los cálculos correctamente sin entender qué significan las gráficas. Este laboratorio conecta directamente con la experiencia de CEN Labs universitario, permite adaptar simuladores existentes y cubre dos progresiones centrales de CNEYT-V que van de la mano.

---

## Apéndice A: Estimación de tiempo total

| Complejidad | Cantidad | Tiempo promedio | Total |
|-------------|----------|-----------------|-------|
| Baja (UI simple: 2-3 sliders, 1-2 outputs) | 8 | 8h | 64h |
| Media (múltiples inputs, gráficas dinámicas, lógica no trivial) | 13 | 16h | 208h |
| Alta (3D, física realista, múltiples vistas, grafos complejos) | 5 | 40h | 200h |
| **TOTAL** | **26** | | **472h** |

Solo los 5 laboratorios piloto: ~62h de desarrollo (Lab 2: 7h + Lab 19: 10h + Lab 3: 9h + Lab 8: 18h + Lab 18: 18h).

---

## Apéndice B: Stack técnico recomendado

### Para graficadores matemáticos (Labs 3, 4, 5, 7, 8, 9, 10)
**Plotly.js** — Biblioteca de gráficas de alto nivel con soporte nativo para subplots, zoom, pan y tooltips. Ideal para graficadores 2D donde la calidad visual importa y el tiempo de desarrollo es acotado. Alternativa: **D3.js** cuando se necesita control total sobre la animación (Labs 10, 16). Para el parser de funciones matemáticas, usar **math.js** (permite evaluar expresiones como "2*x^3 + sin(x)" introducidas por el usuario).

### Para simulaciones de partículas y física (Labs 11, 13, 14, 18, 19)
**Canvas 2D nativo** — Más ligero que Three.js para simulaciones en 2D. Para Labs de física cinemática sencilla (cinemática 1D, gases ideales), Canvas 2D es suficiente y permite ~60fps sin overhead de WebGL. Si en el futuro se quiere expandir los Labs de física a 3D (versión universitaria), migrarlo a **Three.js** es directo. Para física con colisiones realistas usar **Matter.js** (motor de física 2D).

### Para visualizaciones de datos y grafos (Labs 10, 15, 16, 23, 24, 26)
**D3.js** — Estándar de facto para histogramas, árboles, grafos de fuerza y mapas coropléticos. Curva de aprendizaje pronunciada pero reutilizable entre Labs. Para mapas geográficos (Lab 25, 26) combinar con **Leaflet.js** y datos GeoJSON del INEGI/CONABIO.

### Para diagramas interactivos (Labs 1, 6, 12, 21)
**SVG animado** con CSS transitions — Para diagramas estáticos que necesitan animación de entrada (componentes de computadora, círculo unitario, modelo atómico). Más semántico que Canvas y accesible. Para el círculo unitario y el modelo atómico se puede usar **Canvas 2D** si se necesitan animaciones frame-by-frame.

### Para constructores drag-and-drop (Lab 22)
**Blockly (Google)** — Biblioteca open source para constructores de código visual con bloques. Ya tiene el paradigma de flujo de control implementado. Si se quiere algo más ligero, implementar drag-and-drop con **interact.js** + SVG.

### Integración en CEN Bachillerato
Todos los laboratorios deben implementarse como componentes Next.js (`.tsx`) ubicados en `src/app/hub/uac/[codigo]/progresion/[numero]/laboratorio/`. Cada lab recibe las props del alumno (id de sesión) para registrar el tiempo de uso y las interacciones en la base de datos existente. El estado del laboratorio (última configuración usada) se persiste en localStorage para que el alumno retome donde lo dejó.

### Nota sobre Three.js vs Canvas 2D
CEN Labs universitario usa Three.js para simulaciones 3D de física. Para bachillerato, la mayoría de los Labs identificados son 2D. Se recomienda no introducir Three.js hasta que haya un caso concreto donde la tercera dimensión aporte comprensión pedagógica real (candidatos: Lab 12 modelo atómico, eventuales labs de geometría 3D en PM-III/PM-IV). Usar Three.js por defecto añadiría complejidad de desarrollo innecesaria para Labs 2D.
