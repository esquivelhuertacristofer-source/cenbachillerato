"""gen-pm-v.py — Pensamiento Matemático V — Cálculo diferencial (Sem 5) — 8 progresiones."""
import json, pathlib

OUT = pathlib.Path(__file__).parent.parent / "src/data/planteamiento/pm-v.json"

data = {
  "PM-V-P01": {
    "code": "PM-V-P01",
    "title": "Comprende el concepto de límite de una función y lo calcula en casos sencillos.",
    "level": "Pensamiento Matemático V",
    "duration": "~3h (2 sesiones de 50 min)",
    "difficulty": "Intermedio-Avanzado",
    "category": "Cálculo diferencial",
    "metadata": {
      "objective": "Comprender intuitiva y formalmente el concepto de límite de una función cuando x tiende a un valor finito o al infinito; calcular límites algebraicos usando sustitución directa, factorización y racionalización; interpretar la notación lim_{x→a} f(x) = L.",
      "competencies": [
        "Interpreta el límite como el valor al que se aproxima f(x) cuando x→a, sin necesidad de que f(a) exista.",
        "Calcula límites por sustitución directa cuando f es continua en a.",
        "Elimina indeterminaciones 0/0 mediante factorización o racionalización.",
        "Calcula límites al infinito y los relaciona con el comportamiento asintótico de funciones."
      ],
      "materials": [
        "GeoGebra: deslizador de x→a para visualizar el límite dinámicamente.",
        "Tabla de valores numéricos (por la izquierda y por la derecha) para intuir el límite.",
        "Contexto: velocidad instantánea de un automóvil en la carretera México-Querétaro (CAPUFE datos de aforo).",
        "Hoja de trabajo con 10 límites graduados."
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "Apertura", "duration": "10 min", "label": "Velocidad media vs velocidad instantánea"},
        {"phase": "Desarrollo", "duration": "30 min", "label": "Definición intuitiva y cálculo de límites"},
        {"phase": "Cierre", "duration": "10 min", "label": "Límites en la frontera y al infinito"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA",
          "duration": "10 min",
          "description": "Un velocímetro de un auto mide la 'velocidad instantánea' — pero ¿qué significa exactamente? Si en el tramo México-Querétaro (215 km) tardas 2.5 horas, la velocidad media es 86 km/h. Pero en el kilómetro 50 el velocímetro marca 95 km/h. El límite es la herramienta matemática que formaliza esta idea de 'valor en un instante'.",
          "activity": "Tabla numérica: para f(x) = (x²−4)/(x−2), calcular f(1.9), f(1.99), f(1.999), f(2.1), f(2.01), f(2.001). ¿Hacia qué número se aproximan? [Respuesta: 4] — aunque f(2) no está definida. Intuición del límite."
        },
        {
          "title": "FASE II: DESARROLLO",
          "duration": "30 min",
          "description": "Definición intuitiva: lim_{x→a} f(x) = L significa que f(x) se aproxima arbitrariamente a L cuando x se acerca a a (sin necesariamente llegar a a). Propiedades: linealidad, producto, cociente, potencia. Cálculo: (1) Sustitución directa (cuando f es continua en a): lim_{x→3} (x²+2) = 11. (2) Eliminación de indeterminaciones 0/0: factorizar (x²−4)/(x−2) = (x+2)(x−2)/(x−2) = x+2 → límite = 4. Racionalizar: lim_{x→0} (√(x+4)−2)/x — multiplicar por conjugada. (3) Límites al infinito: lim_{x→∞} (3x²+5)/(x²−1) = 3 (cociente de coeficientes principales).",
          "activity": "Ejercicios en parejas: 10 límites de dificultad creciente. Identificar primero la estrategia (sustitución / factorización / racionalización / infinito). Verificar en GeoGebra o Desmos."
        },
        {
          "title": "FASE III: CIERRE",
          "duration": "10 min",
          "description": "Límites laterales: lim_{x→a⁻} f(x) (por la izquierda) y lim_{x→a⁺} f(x) (por la derecha). El límite existe solo si ambos son iguales. Ejemplo: función escalón (tarifa del Metro CDMX: precio sube en zona 1→2→3).",
          "activity": "Reflexión: ¿qué diferencia hay entre f(a) y lim_{x→a} f(x)? Pueden ser iguales (función continua), diferentes (discontinuidad removible), o lim no existe (discontinuidad esencial)."
        }
      ]
    },
    "theory": {
      "introduction": "El concepto de límite es la piedra angular del cálculo. Fue formalizado por Cauchy y Weierstrass en el siglo XIX, resolviendo las paradojas de Zenón y las controversias sobre los 'infinitesimales' de Newton y Leibniz. El cálculo diferencial e integral, basado en límites, es la herramienta matemática más poderosa para modelar fenómenos continuos en física, ingeniería, economía y ciencias.",
      "sections": [
        {
          "subtitle": "Definición épsilon-delta (informal)",
          "content": "lim_{x→a} f(x) = L significa: para cualquier distancia ε>0 que queramos estar cerca de L, existe una distancia δ>0 tal que si |x−a|<δ (con x≠a) entonces |f(x)−L|<ε. Informalmente: 'puedo hacer f(x) tan cerca de L como quiera, acercando x suficientemente a a.' Esta precisión evita argumentos circulares y paradojas."
        },
        {
          "subtitle": "Estrategias de cálculo",
          "content": "Si f es continua en a (polinomios, funciones trigonométricas en su dominio): usar sustitución directa. Si produce indeterminación 0/0: (1) factorizar numerador y denominador y cancelar el factor común; (2) racionalizar multiplicando por el conjugado; (3) usar regla de L'Hôpital (en PM-V se introduce opcionalmente). Si x→∞: dividir numerador y denominador por la potencia más alta de x y usar lim_{x→∞} 1/xⁿ = 0."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "¿Cuánto vale lim_{x→3} (x²−9)/(x−3)?",
          "options": ["6", "0", "No existe", "9"],
          "correct": "6"
        },
        {
          "question": "lim_{x→∞} (5x³+2x)/(2x³−1) es igual a:",
          "options": ["5/2", "0", "∞", "2/5"],
          "correct": "5/2"
        },
        {
          "question": "El límite de f(x) cuando x→a existe si y solo si:",
          "options": [
            "El límite por la izquierda es igual al límite por la derecha",
            "f(a) está definida",
            "f es un polinomio",
            "f(a) = 0"
          ],
          "correct": "El límite por la izquierda es igual al límite por la derecha"
        }
      ],
      "rubric": "4: Calcula límites en los tres casos (sustitución, factorización, infinito) con justificación de la estrategia. 3: Resuelve con una de las tres estrategias y errores menores. 2: Solo resuelve por sustitución directa. 1: No comprende la diferencia entre f(a) y el límite."
    },
    "teacher_tips": [
      "GeoGebra con deslizador en tiempo real es insustituible para construir la intuición del límite.",
      "El contexto del velocímetro es intuitivamente poderoso — la mayoría de los estudiantes ya entienden la velocidad instantánea.",
      "Para la indeterminación 0/0: hacer énfasis en que se factoriza la FUNCIÓN, no se evalúa en el punto problemático.",
      "La regla de L'Hôpital puede introducirse como extensión para estudiantes avanzados."
    ]
  },

  "PM-V-P02": {
    "code": "PM-V-P02",
    "title": "Analiza la continuidad de funciones y la distingue de la discontinuidad con ejemplos.",
    "level": "Pensamiento Matemático V",
    "duration": "~3h (2 sesiones de 50 min)",
    "difficulty": "Intermedio-Avanzado",
    "category": "Cálculo diferencial",
    "metadata": {
      "objective": "Definir formalmente la continuidad de una función en un punto y en un intervalo; identificar y clasificar los tipos de discontinuidad (removible, de salto, infinita/esencial); aplicar el Teorema del Valor Intermedio.",
      "competencies": [
        "Verifica la continuidad de una función en un punto usando las tres condiciones.",
        "Clasifica discontinuidades como removibles, de salto finito e infinitas.",
        "Determina los valores de parámetros para que una función definida a trozos sea continua.",
        "Aplica el Teorema del Valor Intermedio para garantizar la existencia de raíces."
      ],
      "materials": [
        "GeoGebra con funciones a trozos para visualizar discontinuidades.",
        "Contexto: tarifa del taxi en CDMX (función escalón — discontinuidad de salto); precio del gas natural (función continua).",
        "Hoja de trabajo con funciones a trozos para determinar continuidad.",
        "Gráficas impresas de los tres tipos de discontinuidad."
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "Apertura", "duration": "10 min", "label": "Trazar sin levantar el lápiz"},
        {"phase": "Desarrollo", "duration": "30 min", "label": "Tres condiciones de continuidad y tipos de discontinuidad"},
        {"phase": "Cierre", "duration": "10 min", "label": "Teorema del Valor Intermedio"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA",
          "duration": "10 min",
          "description": "Actividad intuitiva: ¿puedes trazar esta gráfica sin levantar el lápiz? Se muestran 4 funciones: una continua (parábola), una con hoyo (discontinuidad removible), una con salto (función escalón de la tarifa de taxi), una con asíntota (1/x). Los estudiantes responden sí/no y explican por qué.",
          "activity": "Discusión: ¿qué hace que una función sea 'continua' en un punto? Recopilar intuiciones: no tiene 'hoyos', no 'salta', no 'explota'. Formalizar las tres condiciones."
        },
        {
          "title": "FASE II: DESARROLLO",
          "duration": "30 min",
          "description": "Tres condiciones de continuidad de f en x=a: (1) f(a) está definida. (2) lim_{x→a} f(x) existe. (3) lim_{x→a} f(x) = f(a). Si falla (1): discontinuidad no removible. Si falla (2): discontinuidad de salto o esencial. Si falla (3): discontinuidad removible (se puede 'reparar' redefiniendo f(a)). Clasificación: REMOVIBLE: existe el límite pero f(a) ≠ L o no está definida (un 'hoyo'). DE SALTO: límites laterales existen pero son diferentes. INFINITA (ESENCIAL): al menos un límite lateral es ±∞ (asíntota vertical). Funciones a trozos: f(x) = { x²+1 si x<2; 5 si x=2; 3x−1 si x>2 } — verificar continuidad en x=2.",
          "activity": "En equipos: cada uno recibe una función a trozos con parámetros (p.ej., f(x)={ax+1 si x≤1; x²+b si x>1}). Determinan los valores de a y b que hacen f continua en x=1. Presentan el procedimiento."
        },
        {
          "title": "FASE III: CIERRE",
          "duration": "10 min",
          "description": "Teorema del Valor Intermedio (TVI): si f es continua en [a,b] y f(a)·f(b)<0 (signos opuestos), entonces existe al menos un c∈(a,b) tal que f(c)=0. Aplicación: garantiza que el precio del petróleo (función continua en tiempo) pasa por cualquier valor entre dos valores dados.",
          "activity": "Aplicación: f(x) = x³−x−1. f(1)=−1<0; f(2)=5>0. Por el TVI existe raíz en (1,2). Verificar en GeoGebra. ¿En qué se diferencia el TVI de simplemente encontrar la raíz?"
        }
      ]
    },
    "theory": {
      "introduction": "La continuidad es la propiedad que permite que el cálculo diferencial funcione. Una función continua 'no tiene saltos' — puede modelarse con suavidad mediante derivadas. La mayoría de los fenómenos físicos (temperatura, velocidad, presión) son continuos; los fenómenos económicos frecuentemente tienen discontinuidades (precios por escalones, impuestos por tramos).",
      "sections": [
        {
          "subtitle": "Definición formal de continuidad",
          "content": "f es continua en a si: (1) f(a) existe; (2) lim_{x→a} f(x) existe; (3) lim_{x→a} f(x) = f(a). f es continua en un intervalo abierto (a,b) si es continua en cada punto del intervalo. f es continua en [a,b] si también es continua lateral derecha en a y lateral izquierda en b."
        },
        {
          "subtitle": "Tipos de discontinuidad",
          "content": "Removible: el límite existe pero no coincide con f(a) (o f(a) no existe). Se 'repara' redefiniendo f(a)=L. Ejemplo: f(x)=(x²−1)/(x−1) tiene discontinuidad removible en x=1; si definimos f(1)=2, es continua. Salto: los límites laterales existen pero L⁻≠L⁺. El salto es |L⁺−L⁻|. Infinita: al menos un límite lateral es ±∞ (asíntota vertical). No es removible. Ejemplo: f(x)=1/(x−2) en x=2."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "Para que f sea continua en x=a, se necesita que:",
          "options": [
            "f(a) exista, el límite exista y sean iguales",
            "f(a) = 0",
            "f sea un polinomio",
            "El límite por la izquierda sea cero"
          ],
          "correct": "f(a) exista, el límite exista y sean iguales"
        },
        {
          "question": "Una función con lim_{x→a⁻} f(x) ≠ lim_{x→a⁺} f(x) tiene una discontinuidad:",
          "options": ["De salto", "Removible", "Infinita", "Ninguna"],
          "correct": "De salto"
        },
        {
          "question": "El Teorema del Valor Intermedio garantiza que f tiene una raíz en (a,b) si:",
          "options": [
            "f es continua en [a,b] y f(a)·f(b) < 0",
            "f(a) = 0 o f(b) = 0",
            "f es derivable en (a,b)",
            "f(a) + f(b) = 0"
          ],
          "correct": "f es continua en [a,b] y f(a)·f(b) < 0"
        }
      ],
      "rubric": "4: Verifica las tres condiciones, clasifica discontinuidades y aplica el TVI con argumentación. 3: Verifica condiciones con errores menores en clasificación. 2: Identifica discontinuidades visualmente pero no verifica formalmente. 1: No distingue discontinuidad de función no definida."
    },
    "teacher_tips": [
      "La actividad de 'trazar sin levantar el lápiz' es inmediata y memorable — usarla como punto de referencia durante todo el tema.",
      "Funciones a trozos con parámetros son el ejercicio más valioso para entender continuidad — incluir siempre.",
      "El TVI es poderoso pero a veces subestimado: es la base del método de bisección para encontrar raíces numéricamente.",
      "Conectar con economía: los impuestos por tramos (ISR en México, SAT) son funciones con discontinuidades de salto."
    ]
  },

  "PM-V-P03": {
    "code": "PM-V-P03",
    "title": "Define la derivada como límite del cociente diferencial y la interpreta geométricamente.",
    "level": "Pensamiento Matemático V",
    "duration": "~3h (2 sesiones de 50 min)",
    "difficulty": "Avanzado",
    "category": "Cálculo diferencial",
    "metadata": {
      "objective": "Definir la derivada de f en x=a como f'(a) = lim_{h→0} [f(a+h)−f(a)]/h; interpretar f'(a) como la pendiente de la tangente a la curva en (a,f(a)) y como la tasa de cambio instantánea; calcular derivadas por definición para funciones simples.",
      "competencies": [
        "Calcula la derivada por definición usando el límite del cociente diferencial.",
        "Interpreta geométricamente la derivada como pendiente de la recta tangente.",
        "Interpreta la derivada como tasa de cambio instantánea en contextos físicos y económicos.",
        "Distingue función derivable de función no derivable (puntos angulosos, discontinuidades)."
      ],
      "materials": [
        "GeoGebra: animación de la secante que se convierte en tangente al hacer h→0.",
        "Contexto: tasa de cambio del precio del petróleo (PEMEX/IEA) — derivada como velocidad de cambio.",
        "Hoja de derivada por definición para f(x)=x², f(x)=x³, f(x)=1/x.",
        "Recta tangente en GeoGebra con deslizador del punto."
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "Apertura", "duration": "10 min", "label": "Secante → tangente: hacer h→0"},
        {"phase": "Desarrollo", "duration": "30 min", "label": "Definición de derivada y cálculo"},
        {"phase": "Cierre", "duration": "10 min", "label": "Derivada como tasa de cambio"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA",
          "duration": "10 min",
          "description": "En GeoGebra: se grafica f(x)=x². Se traza la secante entre (1,1) y (1+h, f(1+h)). Con el deslizador h→0 la secante se convierte en la tangente. La pendiente de la secante es [f(1+h)−f(1)]/h. A medida que h→0, esta pendiente se aproxima a f'(1).",
          "activity": "Los estudiantes calculan la pendiente de la secante para h=1, 0.5, 0.1, 0.01, 0.001. Observan la convergencia hacia 2 (que es f'(1) para f(x)=x²). La derivada es el límite de estas pendientes."
        },
        {
          "title": "FASE II: DESARROLLO",
          "duration": "30 min",
          "description": "Definición: f'(a) = lim_{h→0} [f(a+h)−f(a)]/h si el límite existe. Equivalentemente: f'(x₀) = lim_{x→x₀} [f(x)−f(x₀)]/(x−x₀). Notaciones: f'(x), dy/dx, Df(x), ḟ(t). Cálculo por definición: f(x)=x² → f'(x)=2x. f(x)=x³ → f'(x)=3x². f(x)=c (constante) → f'(x)=0. f(x)=1/x → f'(x)=−1/x². Interpretación geométrica: f'(a) es la pendiente de la recta tangente a la curva y=f(x) en el punto (a,f(a)). Ecuación de la tangente: y−f(a)=f'(a)(x−a). Interpretación física: si s(t) es la posición, s'(t) es la velocidad instantánea; si v(t) es la velocidad, v'(t)=a(t) es la aceleración.",
          "activity": "Ejercicio guiado: calcular f'(x) por definición para f(x)=2x+3 (línea) y f(x)=√x (racionalización del cociente). Luego: dada la gráfica de f, estimar f'(a) para 3 puntos distintos contando la 'inclinación' de la tangente estimada."
        },
        {
          "title": "FASE III: CIERRE",
          "duration": "10 min",
          "description": "Tasa de cambio: el precio del barril de petróleo de PEMEX en 2023 varió de $65 a $95 USD. La derivada en un punto específico del tiempo indica la velocidad de cambio del precio en ese instante. Una derivada positiva: precio subiendo; negativa: bajando; cero: mínimo o máximo local.",
          "activity": "Reflexión: ¿cuándo NO existe la derivada? Puntos angulosos (|x| en x=0), discontinuidades, asíntotas. En GeoGebra: mostrar que |x| no tiene tangente en x=0 (límites laterales distintos)."
        }
      ]
    },
    "theory": {
      "introduction": "La derivada es el concepto central del cálculo diferencial, desarrollado independientemente por Newton (fluxiones, 1666) y Leibniz (diferencial, 1684). La controversia sobre la prioridad del descubrimiento es uno de los episodios más famosos de la historia de la matemática. En la actualidad, la derivada es la herramienta estándar para modelar tasas de cambio en física, ingeniería, economía y biología.",
      "sections": [
        {
          "subtitle": "Del cociente diferencial a la derivada",
          "content": "El cociente diferencial [f(a+h)−f(a)]/h es la pendiente de la secante entre los puntos (a,f(a)) y (a+h,f(a+h)). Al hacer h→0, la secante se convierte en la tangente y el cociente converge (si el límite existe) a f'(a). Este proceso de 'pasar al límite' es el que Cauchy formalizó en el siglo XIX para superar las objeciones filosóficas a los 'infinitesimales' de Newton y Leibniz."
        },
        {
          "subtitle": "Derivabilidad y continuidad",
          "content": "Si f es derivable en a, entonces f es continua en a (el recíproco no es siempre verdadero). Contraejemplo: f(x)=|x| es continua en x=0 pero no derivable (punto anguloso). Casos de no derivabilidad: punto cúspide (tangente vertical), discontinuidad, oscilación infinita. En aplicaciones, la no derivabilidad en puntos aislados es frecuente y debe considerarse (p.ej., punto de cambio de régimen fiscal)."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "La derivada de f en x=a se define como:",
          "options": [
            "lim_{h→0} [f(a+h)−f(a)]/h",
            "[f(a+h)−f(a)]/h para h=1",
            "f(a+1)−f(a)",
            "lim_{x→0} f(x)/x"
          ],
          "correct": "lim_{h→0} [f(a+h)−f(a)]/h"
        },
        {
          "question": "Si f'(3)=−2, la recta tangente a f en x=3:",
          "options": [
            "Tiene pendiente −2 y es decreciente",
            "Pasa por el origen",
            "Tiene pendiente 3",
            "Es vertical"
          ],
          "correct": "Tiene pendiente −2 y es decreciente"
        },
        {
          "question": "La derivada de f(x)=x² calculada por definición es:",
          "options": ["f'(x)=2x", "f'(x)=x", "f'(x)=2", "f'(x)=x²"],
          "correct": "f'(x)=2x"
        }
      ],
      "rubric": "4: Calcula derivada por definición para 3 funciones, interpreta geométrica y físicamente y determina ecuación de la tangente. 3: Calcula por definición con errores menores de álgebra, interpreta geométricamente. 2: Aplica la definición pero comete errores en el límite. 1: No comprende la conexión entre secante y tangente."
    },
    "teacher_tips": [
      "La animación GeoGebra de h→0 es el momento 'eureka' del cálculo — no omitirla bajo ningún concepto.",
      "El contexto del precio del petróleo PEMEX es relevante y conecta con Economía y Ciencias Sociales.",
      "Para la derivada por definición: hacer énfasis en expandir f(a+h) correctamente (error más frecuente).",
      "La notación dy/dx de Leibniz vs f'(x) de Lagrange: explicar que ambas se usan y cuándo es conveniente cada una."
    ]
  },

  "PM-V-P04": {
    "code": "PM-V-P04",
    "title": "Aplica las reglas básicas de derivación (potencia, producto, cociente, regla de la cadena).",
    "level": "Pensamiento Matemático V",
    "duration": "~3h (2 sesiones de 50 min)",
    "difficulty": "Avanzado",
    "category": "Cálculo diferencial",
    "metadata": {
      "objective": "Calcular derivadas de funciones polinomiales, racionales y compuestas usando las reglas: derivada de potencia, constante, suma/resta, producto, cociente y regla de la cadena; aplicar estas reglas en problemas de física y economía.",
      "competencies": [
        "Aplica la regla de la potencia: d/dx(xⁿ) = nxⁿ⁻¹.",
        "Calcula derivadas de sumas, productos y cocientes de funciones.",
        "Aplica la regla de la cadena para funciones compuestas f(g(x)).",
        "Calcula derivadas de funciones complejas combinando múltiples reglas."
      ],
      "materials": [
        "Tabla de reglas de derivación para referencia.",
        "Contexto: potencia eléctrica P=I²R (regla del producto); velocidad de un cohete (regla de la cadena).",
        "Ejercicios graduados: 15 derivadas de dificultad creciente.",
        "Tarjetas de 'batalla de derivadas': competencia entre equipos."
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "Apertura", "duration": "10 min", "label": "Las reglas como atajos del límite"},
        {"phase": "Desarrollo", "duration": "30 min", "label": "Cinco reglas de derivación"},
        {"phase": "Cierre", "duration": "10 min", "label": "Regla de la cadena: la más importante"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA",
          "duration": "10 min",
          "description": "Comparar: calcular la derivada de f(x)=3x⁴−2x³+5x por definición (largo y tedioso) vs por regla de la potencia (3·4x³−2·3x²+5 = 12x³−6x²+5, en segundos). Las reglas son demostrables usando el límite, pero calculativamente son atajos esenciales.",
          "activity": "Los estudiantes verifican que d/dx(x³) = 3x² tanto por definición (ya calculado antes) como por la regla de la potencia. Confirmación de que las reglas son equivalentes."
        },
        {
          "title": "FASE II: DESARROLLO",
          "duration": "30 min",
          "description": "REGLAS BÁSICAS: (1) Constante: d/dx(c)=0. (2) Potencia: d/dx(xⁿ)=nxⁿ⁻¹ (para cualquier n real). (3) Suma/resta: d/dx[f(x)±g(x)]=f'(x)±g'(x). (4) Múltiplo escalar: d/dx[cf(x)]=c·f'(x). PRODUCTO: d/dx[f·g]=f'·g+f·g'. Ejemplo: (x²)(senx) → 2x·senx+x²·cosx. COCIENTE: d/dx[f/g]=(f'·g−f·g')/g². Ejemplo: d/dx(x²/(x+1)) = (2x(x+1)−x²·1)/(x+1)² = (x²+2x)/(x+1)². REGLA DE LA CADENA: d/dx[f(g(x))]=f'(g(x))·g'(x). Ejemplo: d/dx[(3x+1)⁵]=5(3x+1)⁴·3=15(3x+1)⁴. 'Derivada del exterior × derivada del interior.'",
          "activity": "Batalla de derivadas: cada equipo recibe tarjetas con funciones. El primero en calcular la derivada correcta gana el punto. 10 rondas de dificultad creciente. Variedad: potencias fraccionarias (xⁿ con n=1/2, −1), combinaciones de reglas."
        },
        {
          "title": "FASE III: CIERRE",
          "duration": "10 min",
          "description": "Regla de la cadena extendida: d/dx[f(g(h(x)))]=f'(g(h(x)))·g'(h(x))·h'(x). Ejemplo: d/dx[(sen(x²))³]=3(sen(x²))²·cos(x²)·2x. Aplicación: CFE calcula la potencia disipada en líneas de transmisión P=I²R — si I=I₀sen(ωt), entonces dP/dt requiere regla de la cadena.",
          "activity": "Identificar en la expresión qué es la función 'exterior' y cuál la 'interior'. Estrategia: escribir la función en capas antes de derivar."
        }
      ]
    },
    "theory": {
      "introduction": "Las reglas de derivación son el 'vocabulario' del cálculo diferencial. Con ellas, se puede derivar cualquier función elemental sin recurrir al límite en cada caso. La regla de la cadena, en particular, es la más usada en aplicaciones: permite derivar funciones compuestas como √(1+x²) o sen(3x²+1), que aparecen constantemente en física e ingeniería.",
      "sections": [
        {
          "subtitle": "Resumen de las cinco reglas fundamentales",
          "content": "d/dx[c]=0; d/dx[xⁿ]=nxⁿ⁻¹; d/dx[cf]=cf'; d/dx[f±g]=f'±g'; d/dx[fg]=f'g+fg' (producto); d/dx[f/g]=(f'g−fg')/g² (cociente, g≠0); d/dx[f(g(x))]=f'(g(x))·g'(x) (cadena). Estas seis reglas, combinadas, permiten derivar cualquier función algebraica."
        },
        {
          "subtitle": "La regla de la cadena: identificar las capas",
          "content": "Estrategia: (1) identificar la función 'exterior' f y la función 'interior' g; (2) derivar la exterior evaluada en la interior: f'(g(x)); (3) multiplicar por la derivada de la interior: g'(x). Para 3 capas: añadir un factor más. Ejemplos con notación Leibniz: si y=u⁵ y u=3x+1, entonces dy/dx=(dy/du)(du/dx)=5u⁴·3=15(3x+1)⁴. La notación de Leibniz hace visible la 'cancelación' formal de du."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "La derivada de f(x)=4x³−2x+7 es:",
          "options": ["12x²−2", "4x²−2", "12x²+7", "12x³−2"],
          "correct": "12x²−2"
        },
        {
          "question": "La derivada de g(x)=(x²+1)⁶ usando la regla de la cadena es:",
          "options": [
            "12x(x²+1)⁵",
            "6(x²+1)⁵",
            "6x(x²+1)⁵",
            "12(x²+1)⁵"
          ],
          "correct": "12x(x²+1)⁵"
        },
        {
          "question": "La regla del cociente d/dx[f/g] es:",
          "options": [
            "(f'g−fg')/g²",
            "(f'g+fg')/g²",
            "f'/g'",
            "(fg'−f'g)/g²"
          ],
          "correct": "(f'g−fg')/g²"
        }
      ],
      "rubric": "4: Aplica todas las reglas correctamente, incluyendo la cadena con 3 capas, y verifica mediante factorización del resultado. 3: Aplica reglas de potencia, producto y cadena básica con errores menores. 2: Aplica regla de potencia pero comete errores en producto/cociente. 1: No distingue las reglas o no aplica la cadena."
    },
    "teacher_tips": [
      "La 'batalla de derivadas' es altamente motivante — usar puntos o puntuación visible para el equipo ganador.",
      "La regla del cociente es la más propensa a errores de signo — hacer énfasis en el orden f'g MENOS fg'.",
      "Para la regla de la cadena: subrayar u=función interior en color diferente antes de derivar.",
      "Para verificar: derivada de xⁿ funciona para CUALQUIER n real: x⁻² = −2x⁻³; x^(1/2) = (1/2)x^(−1/2)."
    ]
  },

  "PM-V-P05": {
    "code": "PM-V-P05",
    "title": "Calcula derivadas de funciones trigonométricas, exponenciales y logarítmicas.",
    "level": "Pensamiento Matemático V",
    "duration": "~3h (2 sesiones de 50 min)",
    "difficulty": "Avanzado",
    "category": "Cálculo diferencial",
    "metadata": {
      "objective": "Calcular las derivadas de las funciones seno, coseno, tangente, eˣ, aˣ, ln(x) y log_a(x); aplicar la regla de la cadena a estas funciones; usar estas derivadas en modelos de crecimiento exponencial y fenómenos oscilatorios.",
      "competencies": [
        "Memoriza y aplica d/dx(senx)=cosx; d/dx(cosx)=−senx; d/dx(tanx)=sec²x.",
        "Aplica d/dx(eˣ)=eˣ; d/dx(ln x)=1/x y sus versiones con regla de cadena.",
        "Calcula d/dx(aˣ)=aˣ·ln a; d/dx(log_a x)=1/(x·ln a).",
        "Modela y analiza crecimiento exponencial y funciones oscilatorias con derivadas."
      ],
      "materials": [
        "Tabla de derivadas de funciones trascendentes.",
        "Contexto: crecimiento de la población de CDMX (INEGI: modelo exponencial P(t)=P₀e^(rt)); onda sísmica (CENAPRED: modelo sinusoidal).",
        "GeoGebra para graficar función y su derivada simultáneamente.",
        "Ejercicios con funciones combinadas."
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "Apertura", "duration": "10 min", "label": "La función que es su propia derivada"},
        {"phase": "Desarrollo", "duration": "30 min", "label": "Derivadas de funciones trascendentes"},
        {"phase": "Cierre", "duration": "10 min", "label": "Modelos exponenciales y oscilatorios"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA",
          "duration": "10 min",
          "description": "Pregunta fascinante: '¿Existe una función cuya derivada es ella misma?' Si f(x)=eˣ, entonces f'(x)=eˣ. En GeoGebra: graficar f(x)=eˣ y su derivada — son idénticas. Esta propiedad única hace que e≈2.71828 sea el número más natural para el cálculo.",
          "activity": "Los estudiantes verifican numéricamente: para f(x)=eˣ, calcular el cociente diferencial [f(0+0.001)−f(0)]/0.001 ≈ 1 = f'(0). Confirmación de que d/dx(eˣ)=eˣ."
        },
        {
          "title": "FASE II: DESARROLLO",
          "duration": "30 min",
          "description": "DERIVADAS TRIGONOMÉTRICAS: d/dx(senx)=cosx; d/dx(cosx)=−senx; d/dx(tanx)=sec²x; d/dx(cotx)=−csc²x; d/dx(secx)=secx·tanx; d/dx(cscx)=−cscx·cotx. Con cadena: d/dx(sen(3x))=3cos(3x); d/dx(cos(x²))=−2x·sen(x²). DERIVADAS EXPONENCIALES Y LOGARÍTMICAS: d/dx(eˣ)=eˣ; d/dx(aˣ)=aˣ·ln a; d/dx(ln x)=1/x (x>0); d/dx(log_a x)=1/(x·ln a); d/dx(ln|x|)=1/x. Con cadena: d/dx(e^(3x²))=6x·e^(3x²); d/dx(ln(x²+1))=2x/(x²+1). DERIVACIÓN LOGARÍTMICA: para productos/cocientes complejos, tomar ln de ambos lados y derivar implícitamente.",
          "activity": "Ejercicios mixtos: 12 funciones que combinan trigonométricas, exponenciales y logarítmicas con regla de la cadena. Verificación cruzada con GeoGebra."
        },
        {
          "title": "FASE III: CIERRE",
          "duration": "10 min",
          "description": "Modelos: CRECIMIENTO EXPONENCIAL: P(t)=P₀e^(rt); P'(t)=r·P(t). Crecimiento de la ZMVM: en 2020, 21.6 millones de habitantes (INEGI); si r=0.005/año, ¿con qué velocidad crece la población en 2020? ONDA SÍSMICA: x(t)=A·sen(ωt+φ); velocidad v(t)=Aω·cos(ωt+φ); aceleración a(t)=−Aω²·sen(ωt+φ).",
          "activity": "Síntesis: tabla completa de derivadas del semestre (potencias + trigonométricas + exponenciales + logarítmicas). Esta tabla será la referencia para las progresiones P06 y P07."
        }
      ]
    },
    "theory": {
      "introduction": "Las funciones trascendentes (trigonométricas, exponenciales y logarítmicas) aparecen en prácticamente todas las aplicaciones del cálculo. El número e es la base natural del crecimiento continuo; las funciones trigonométricas modelan cualquier fenómeno periódico; el logaritmo natural es el inverso de la exponencial y simplifica el análisis de tasas de cambio multiplicativas.",
      "sections": [
        {
          "subtitle": "Por qué d/dx(eˣ)=eˣ",
          "content": "Por definición: d/dx(eˣ) = lim_{h→0} (e^(x+h)−eˣ)/h = eˣ·lim_{h→0}(eʰ−1)/h. El límite fundamental lim_{h→0}(eʰ−1)/h = 1 (definición del número e) → d/dx(eˣ)=eˣ. Esta propiedad es única: eˣ es la única función (salvo escalares) que es igual a su propia derivada, lo que la hace ideal para modelar fenómenos donde la tasa de cambio es proporcional al valor actual (poblaciones, capital con interés compuesto, desintegración radiactiva)."
        },
        {
          "subtitle": "Derivadas trigonométricas: el ciclo de cuatro",
          "content": "d/dx(senx)=cosx; d/dx(cosx)=−senx; d/dx(−senx)=−cosx; d/dx(−cosx)=senx → de vuelta al seno. El ciclo completo tiene período 4. Consecuencia: la cuarta derivada de senx es senx. Esta propiedad es fundamental en el análisis de sistemas oscilantes (péndulos, circuitos LC, ondas sísmicas analíticos por el CENAPRED)."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "La derivada de f(x) = e^(2x+1) es:",
          "options": ["2e^(2x+1)", "e^(2x+1)", "2e^(2x)", "(2x+1)e^(2x)"],
          "correct": "2e^(2x+1)"
        },
        {
          "question": "d/dx(ln(x³+1)) es igual a:",
          "options": ["3x²/(x³+1)", "1/(x³+1)", "3/(x³+1)", "ln(3x²)"],
          "correct": "3x²/(x³+1)"
        },
        {
          "question": "d/dx(cos(5x)) es:",
          "options": ["−5sen(5x)", "5cos(5x)", "−sen(5x)", "5sen(5x)"],
          "correct": "−5sen(5x)"
        }
      ],
      "rubric": "4: Calcula derivadas de las tres familias con regla de cadena aplicada correctamente. 3: Calcula derivadas básicas con errores menores en la cadena. 2: Memoriza derivadas elementales pero no aplica la cadena. 1: Confunde derivadas o no puede aplicar la regla de la cadena."
    },
    "teacher_tips": [
      "La propiedad d/dx(eˣ)=eˣ siempre genera asombro — usarla como gancho motivacional.",
      "La tabla completa de derivadas al final de esta progresión se convierte en el 'arma' del estudiante para P06 y P07.",
      "Para el ciclo de derivadas del seno: relacionar con la segunda ley de Newton para el oscilador armónico (mx''=−kx).",
      "El modelo de crecimiento poblacional con datos reales del INEGI es excelente para aplicación inmediata."
    ]
  },

  "PM-V-P06": {
    "code": "PM-V-P06",
    "title": "Aplica la derivada para encontrar máximos, mínimos y puntos de inflexión (análisis de comportamiento).",
    "level": "Pensamiento Matemático V",
    "duration": "~3h (2 sesiones de 50 min)",
    "difficulty": "Avanzado",
    "category": "Cálculo diferencial",
    "metadata": {
      "objective": "Usar la primera y segunda derivada para determinar intervalos de crecimiento/decrecimiento, máximos y mínimos locales y globales, concavidad y puntos de inflexión; trazar la gráfica de una función usando el análisis derivativo completo.",
      "competencies": [
        "Aplica el criterio de la primera derivada para clasificar puntos críticos.",
        "Aplica el criterio de la segunda derivada para clasificar máximos y mínimos.",
        "Determina la concavidad de la función y ubica los puntos de inflexión.",
        "Traza la gráfica completa de una función usando derivadas (sin calculadora)."
      ],
      "materials": [
        "Función modelo: beneficio económico de GRUMA (MASECA) en función del volumen de producción.",
        "GeoGebra para verificar el análisis derivativo.",
        "Plantilla de análisis completo de una función (9 pasos).",
        "Hoja de trabajo con 3 funciones para análisis completo."
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "Apertura", "duration": "10 min", "label": "¿Dónde está el máximo beneficio?"},
        {"phase": "Desarrollo", "duration": "30 min", "label": "Criterios de primera y segunda derivada"},
        {"phase": "Cierre", "duration": "10 min", "label": "Análisis completo de función"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA",
          "duration": "10 min",
          "description": "Un productor de maíz vende x toneladas con beneficio B(x) = −2x³+30x²−100x (pesos ×1000). ¿Cuántas toneladas maximizan el beneficio? Intuitivamente, ¿dónde el beneficio deja de crecer? → Donde B'(x)=0.",
          "activity": "Los estudiantes calculan B'(x) y resuelven B'(x)=0. Encuentran los puntos críticos. Discuten: ¿cuál es máximo? ¿cuál es mínimo? ¿cómo distinguir entre ellos?"
        },
        {
          "title": "FASE II: DESARROLLO",
          "duration": "30 min",
          "description": "PUNTOS CRÍTICOS: valores de x donde f'(x)=0 o f'(x) no existe. CRITERIO DE LA PRIMERA DERIVADA: si f' cambia de + a − en x=c: máximo local. Si cambia de − a +: mínimo local. Si no cambia: ni máximo ni mínimo (punto de inflexión horizontal). CRITERIO DE LA SEGUNDA DERIVADA (más rápido): si f'(c)=0 y f''(c)<0: máximo local; f''(c)>0: mínimo local; f''(c)=0: inconclusivo (usar primer criterio). CONCAVIDAD: f''(x)>0 en I → f es cóncava hacia arriba en I. f''(x)<0 → cóncava hacia abajo. PUNTO DE INFLEXIÓN: donde f'' cambia de signo (concavidad cambia). MÁXIMOS/MÍNIMOS GLOBALES en [a,b]: evaluar f en puntos críticos y en los extremos del intervalo; el mayor es el máximo global, el menor el mínimo global.",
          "activity": "Análisis completo paso a paso de f(x)=x³−6x²+9x+2: (1) dominio, (2) interceptos, (3) f'(x)=3x²−12x+9=3(x−1)(x−3), (4) puntos críticos x=1,3, (5) tabla de signo de f', (6) f''(x)=6x−12, (7) f''(1)=−6<0 → máximo en x=1; f''(3)=6>0 → mínimo en x=3, (8) punto de inflexión f''=0 → x=2, (9) gráfica."
        },
        {
          "title": "FASE III: CIERRE",
          "duration": "10 min",
          "description": "Verificación en GeoGebra: comparar el análisis manual con la gráfica. ¿Coinciden el máximo, mínimo y punto de inflexión calculados con los visibles en la gráfica?",
          "activity": "Reto: dada solo la gráfica de f', determinar dónde f tiene máximos, mínimos, inflexiones y es creciente/decreciente. Ejercicio inverso que refuerza la comprensión profunda."
        }
      ]
    },
    "theory": {
      "introduction": "El análisis de extremos es quizás la aplicación más poderosa del cálculo diferencial. Maximizar beneficios, minimizar costos, encontrar el punto de máxima eficiencia — todos estos problemas se resuelven usando derivadas. La industria alimentaria mexicana (BIMBO, GRUMA, LALA) usa este tipo de análisis para optimizar producción.",
      "sections": [
        {
          "subtitle": "Teorema de Fermat y criterios de clasificación",
          "content": "Teorema de Fermat: si f tiene un extremo local en c y f es derivable en c, entonces f'(c)=0. Atención: el recíproco NO es verdadero (f'(c)=0 no implica extremo). Criterio de la primera derivada: más general, funciona aunque f'' no exista en c. Criterio de la segunda derivada: más rápido cuando f'' es fácil de calcular, pero falla si f''(c)=0."
        },
        {
          "subtitle": "Concavidad y puntos de inflexión",
          "content": "f es cóncava hacia arriba (CAA) en I si f'' > 0 en I: la curva 'abre hacia arriba' (como taza). Cóncava hacia abajo (CAB) si f'' < 0: 'abre hacia abajo' (como sombrero). Punto de inflexión: f'' cambia de signo, y f'' = 0 en ese punto (pero f''=0 no es suficiente: x⁴ tiene f''=12x², f''(0)=0 pero x=0 no es inflexión). La concavidad de una función de costo determina si estamos en una zona de rendimientos crecientes o decrecientes."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "Si f'(c)=0 y f''(c)=−3, en x=c la función tiene un:",
          "options": ["Máximo local", "Mínimo local", "Punto de inflexión", "Ningún extremo"],
          "correct": "Máximo local"
        },
        {
          "question": "Un punto de inflexión ocurre donde:",
          "options": [
            "f'' cambia de signo",
            "f'=0",
            "f=0",
            "f'' tiene su máximo valor"
          ],
          "correct": "f'' cambia de signo"
        },
        {
          "question": "Si f'(x)>0 en (a,b), entonces f es ___ en (a,b):",
          "options": ["Creciente", "Decreciente", "Constante", "Cóncava hacia arriba"],
          "correct": "Creciente"
        }
      ],
      "rubric": "4: Completa el análisis de 9 pasos para una función de grado 3, clasificando todos los puntos críticos e inflexiones correctamente. 3: Encuentra puntos críticos y los clasifica con errores menores en concavidad. 2: Encuentra puntos críticos pero no los clasifica o no encuentra inflexiones. 1: No puede calcular f' o f''."
    },
    "teacher_tips": [
      "El ejercicio inverso (dada f', analizar f) es el más difícil y el más rico conceptualmente — dedicar tiempo extra.",
      "El contexto de beneficio económico de producción es el más accesible intuitivamente para la mayoría de los estudiantes.",
      "Para gráficas manuales: usar escala apropiada y marcar explícitamente todos los puntos clave (máximos, mínimos, inflexiones, interceptos).",
      "Conectar con PM-IV P02: las transformaciones de funciones ahora se entienden más profundamente con el análisis derivativo."
    ]
  },

  "PM-V-P07": {
    "code": "PM-V-P07",
    "title": "Resuelve problemas de optimización usando la derivada en contextos reales (ingeniería, economía, biología).",
    "level": "Pensamiento Matemático V",
    "duration": "~3h (2 sesiones de 50 min)",
    "difficulty": "Avanzado",
    "category": "Cálculo diferencial aplicado",
    "metadata": {
      "objective": "Formular problemas de optimización real como problemas de maximización/minimización de una función con restricciones; resolver el problema usando derivadas; interpretar y validar la solución en el contexto original.",
      "competencies": [
        "Traduce un problema de optimización verbal a una función objetivo con restricción.",
        "Expresa la función objetivo en términos de una sola variable usando la restricción.",
        "Encuentra el valor óptimo usando la derivada y verifica que es máximo o mínimo.",
        "Interpreta el resultado en el contexto real (unidades, significado, viabilidad)."
      ],
      "materials": [
        "Problemas contextualizados: (1) Envase de LALA con mínimo material. (2) Parcela agrícola (SAGARPA) con máxima área. (3) Minimizar el costo de producción de CEMEX (material + mano de obra).",
        "Material: cartón, tijeras y cinta para construir cajas sin tapa y medir el volumen.",
        "Plantilla de 5 pasos para resolver problemas de optimización."
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "Apertura", "duration": "10 min", "label": "El envase perfecto de leche LALA"},
        {"phase": "Desarrollo", "duration": "30 min", "label": "5 pasos para optimizar"},
        {"phase": "Cierre", "duration": "10 min", "label": "Construcción física de la caja óptima"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA",
          "duration": "10 min",
          "description": "LALA quiere diseñar un envase cilíndrico de un litro (1000 cm³) usando el mínimo material posible. ¿Cuáles deben ser el radio r y la altura h del cilindro? Intuición: si es muy plano (h pequeña, r grande) usa mucho material lateral; si es muy alto (h grande, r pequeño), mucho material también. Existe una proporción óptima.",
          "activity": "Los estudiantes proponen dimensiones a ojo. Se calculan las áreas de superficie para varias opciones y se tabula. ¿Qué patrón emerge? Motivación para encontrar el mínimo exacto."
        },
        {
          "title": "FASE II: DESARROLLO",
          "duration": "30 min",
          "description": "5 PASOS DE OPTIMIZACIÓN: (1) IDENTIFICAR la variable a optimizar (función objetivo) y las restricciones. (2) ESCRIBIR la función objetivo en términos de todas las variables. (3) USAR la restricción para expresar la función en UNA sola variable. (4) DERIVAR e igualar a cero para encontrar el candidato óptimo. (5) VERIFICAR que es máximo o mínimo (criterio de segunda derivada o tabla de signos). SOLUCIÓN DEL ENVASE: Área = 2πr² + 2πrh (2 tapas + lateral). Restricción: πr²h = 1000 → h = 1000/(πr²). Sustitución: A(r) = 2πr² + 2000/r. A'(r) = 4πr − 2000/r² = 0 → r³ = 500/π → r ≈ 5.42 cm; h = 2r ≈ 10.84 cm (h=2r: resultado elegante). Otros problemas: maximizar el área de un rectángulo inscrito en una elipse; minimizar la distancia de un punto a una recta.",
          "activity": "En equipos: cada uno resuelve uno de tres problemas contextualizados (LALA, parcela SAGARPA, CEMEX). Presentan los 5 pasos al grupo."
        },
        {
          "title": "FASE III: CIERRE",
          "duration": "10 min",
          "description": "Construcción práctica: con cartón cuadrado de 20×20 cm, recortar cuadrados iguales de las esquinas y doblar para formar una caja sin tapa. ¿Qué tamaño del recorte maximiza el volumen? V(x)=x(20−2x)². Resolver: V'(x)=0 → x=10/3≈3.33 cm.",
          "activity": "Cada equipo construye la caja con x=3, 3.33 y 4 cm y compara los volúmenes. Verifican experimentalmente que x≈3.33 da el máximo volumen."
        }
      ]
    },
    "theory": {
      "introduction": "Los problemas de optimización son la aplicación más directa del cálculo a la vida real. Minimizar costos, maximizar beneficios, usar el mínimo material — estas preguntas definen la ingeniería, la economía y el diseño industrial. Las empresas mexicanas como CEMEX, PEMEX, BIMBO y LALA usan herramientas de optimización basadas en cálculo diferencial para mejorar continuamente sus procesos.",
      "sections": [
        {
          "subtitle": "Extremos en dominios cerrados vs abiertos",
          "content": "Para un dominio cerrado [a,b]: el Teorema de Weierstrass garantiza que la función continua alcanza su máximo y mínimo absolutos. Candidatos: puntos críticos en el interior y los extremos a y b. Para un dominio abierto o ilimitado: verificar el comportamiento en las fronteras/infinito. En problemas de optimización real, el dominio suele estar restringido por condiciones físicas (r>0, 0<x<L/2)."
        },
        {
          "subtitle": "Estrategia para reducir a una variable",
          "content": "Si el problema tiene n variables y n−1 restricciones, se puede reducir a 1 variable. Técnica: despejar una variable de la restricción y sustituir en la función objetivo. La restricción puede ser: una ecuación geométrica (área, volumen, perímetro), una restricción de presupuesto (coste total = cte), o una condición de balance (balance de masas en química, PEMEX). Cuando hay 2+ restricciones, se requieren métodos de multiplicadores de Lagrange (nivel universitario)."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "Para maximizar el área de un rectángulo con perímetro fijo P=40 m, el paso 3 es:",
          "options": [
            "Usar 2l+2a=40 para expresar a=20−l y sustituir en A=l·a",
            "Derivar el perímetro directamente",
            "Igualar los lados del rectángulo sin calcular",
            "Calcular A cuando l=a=10"
          ],
          "correct": "Usar 2l+2a=40 para expresar a=20−l y sustituir en A=l·a"
        },
        {
          "question": "En el diseño del envase cilíndrico de mínima superficie con volumen fijo, el resultado es:",
          "options": [
            "h = 2r (la altura es el doble del radio)",
            "h = r (cilindro equilátero)",
            "h = 4r",
            "r = 2h"
          ],
          "correct": "h = 2r (la altura es el doble del radio)"
        },
        {
          "question": "¿Qué garantiza que el valor crítico encontrado es un MÍNIMO (no un máximo)?",
          "options": [
            "Que f''(c) > 0 en ese punto",
            "Que f'(c) = 0",
            "Que f(c) sea el valor más pequeño calculado",
            "Que la función sea positiva en c"
          ],
          "correct": "Que f''(c) > 0 en ese punto"
        }
      ],
      "rubric": "4: Resuelve 2+ problemas de optimización completos con los 5 pasos, verificación y correcta interpretación del resultado. 3: Resuelve un problema completo con errores menores en verificación. 2: Formula la función objetivo pero comete errores al sustituir la restricción. 1: No puede plantear la función objetivo."
    },
    "teacher_tips": [
      "La construcción física de la caja de cartón es el experimento más memorable del semestre — hacerlo siempre.",
      "El problema del envase LALA es elegante porque el resultado (h=2r) es sorprendentemente simple y verificable.",
      "Para estudiantes avanzados: introducir el problema del puente de mínima longitud o el camino de menor tiempo (Fermat en óptica).",
      "Conectar con CNEYT-V: el análisis de trayectorias de cohetes usa optimización de combustible y alcance."
    ]
  },

  "PM-V-P08": {
    "code": "PM-V-P08",
    "title": "Introduce la noción de diferencial y su uso en aproximaciones lineales.",
    "level": "Pensamiento Matemático V",
    "duration": "~3h (2 sesiones de 50 min)",
    "difficulty": "Avanzado",
    "category": "Cálculo diferencial",
    "metadata": {
      "objective": "Definir el diferencial df = f'(x)·dx y usarlo para aproximar el cambio en una función cuando el cambio en la variable independiente es pequeño; aplicar la aproximación lineal (linearización) a problemas de medición y propagación de error.",
      "competencies": [
        "Define dx como incremento independiente y dy=f'(x)dx como diferencial de f.",
        "Usa la aproximación f(a+Δx)≈f(a)+f'(a)·Δx para calcular valores aproximados.",
        "Aplica la linearización en el cálculo de errores de medición en física e ingeniería.",
        "Relaciona el diferencial con la interpretación geométrica de la tangente."
      ],
      "materials": [
        "Contexto: estimación de volumen de un cubo de cemento CEMEX (error en la medición del lado).",
        "Tabla de aproximaciones para función raíz cuadrada (√(1+x)≈1+x/2 para x pequeño).",
        "GeoGebra: comparar f(x) con su linealización L(x) cerca de x=a.",
        "Calculadora para verificar la precisión de la aproximación."
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "Apertura", "duration": "10 min", "label": "La tangente como 'mejor aproximación lineal'"},
        {"phase": "Desarrollo", "duration": "30 min", "label": "Diferencial y linearización"},
        {"phase": "Cierre", "duration": "10 min", "label": "Propagación de error en mediciones"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA",
          "duration": "10 min",
          "description": "Zoom en GeoGebra sobre la gráfica de f(x)=x² cerca de x=2: al hacer suficiente zoom, la curva y la tangente son indistinguibles. Esta es la idea de la linearización: cerca de un punto, una función suave 'parece' una línea recta.",
          "activity": "¿Cuánto vale √1.04 sin calculadora? Aproximación: √(1+x)≈1+x/2 para x pequeño. Con x=0.04: √1.04≈1.02. Verificar: (1.02)²=1.0404≈1.04. ¿Qué tan precisa es esta aproximación?"
        },
        {
          "title": "FASE II: DESARROLLO",
          "duration": "30 min",
          "description": "DIFERENCIAL: dx es un incremento arbitrario en x (puede ser grande o pequeño). dy = f'(x)·dx es el diferencial de y = el incremento en y a lo largo de la TANGENTE. A diferencia: Δy = f(x+dx)−f(x) es el cambio real. Para dx pequeño: Δy ≈ dy = f'(x)·dx. LINEARIZACIÓN: L(x) = f(a) + f'(a)(x−a) es la recta tangente en x=a. Para x cerca de a: f(x) ≈ L(x). Linealización de funciones comunes cerca de x=0: (1+x)ⁿ ≈ 1+nx; sen x ≈ x; cos x ≈ 1; eˣ ≈ 1+x; ln(1+x) ≈ x. PROPAGACIÓN DE ERROR: si y=f(x) y x tiene error de medición |dx|, entonces el error absoluto en y es |dy|=|f'(x)|·|dx|. Error relativo: |dy/y|=|f'(x)/f(x)|·|dx|. Ejemplo: cubo de cemento CEMEX de lado s=10 cm medido con error de ±0.5 mm. V=s³; dV=3s²·ds=3(100)(0.05)=15 cm³. Error relativo: 15/1000=1.5%.",
          "activity": "En parejas: (1) Estimar (8.05)^(2/3) usando la linearización de f(x)=x^(2/3) cerca de x=8. (2) Calcular el error en el área de un círculo si el radio se midió con error de 2%. (3) Estimar sen(31°) usando la linearización de senx en x=30°=π/6."
        },
        {
          "title": "FASE III: CIERRE",
          "duration": "10 min",
          "description": "Conexión con física e ingeniería: las aproximaciones lineales son la base de la física del primer año universitario (pequeñas oscilaciones: senθ≈θ para ángulos pequeños → péndulo simple se convierte en movimiento armónico simple). CENAPRED usa estas aproximaciones para modelos de riesgo sísmico.",
          "activity": "Metacognición del semestre: ¿cuál es la idea más poderosa del cálculo diferencial? Síntesis: límite → continuidad → derivada → reglas → optimización → diferencial. El cálculo como 'lupa matemática' que amplifica el comportamiento local de funciones."
        }
      ]
    },
    "theory": {
      "introduction": "El diferencial formaliza la idea de 'cambio infinitamente pequeño' que Newton y Leibniz utilizaron para crear el cálculo. La linearización es la base de la mayoría de los métodos numéricos usados en ingeniería: el Método de Newton para raíces, las series de Taylor, la optimización numérica. En la práctica de la ingeniería y la física, trabajar con la aproximación lineal es frecuentemente suficiente y mucho más simple.",
      "sections": [
        {
          "subtitle": "Diferencial vs incremento",
          "content": "Para y=f(x): el INCREMENTO real es Δy = f(x+Δx)−f(x). El DIFERENCIAL es dy = f'(x)·dx. La diferencia es el error de la aproximación: Δy−dy = [f(x+Δx)−f(x)−f'(x)Δx]. Este error es de 'orden superior': |Δy−dy|/|Δx|→0 cuando Δx→0. La aproximación dy≈Δy mejora conforme Δx es más pequeño. Geométricamente: Δy es el cambio en la curva; dy es el cambio en la tangente."
        },
        {
          "subtitle": "Aplicaciones prácticas del diferencial",
          "content": "Estimación de valores: f(a+Δx)≈f(a)+f'(a)Δx. Error absoluto: |Δy|≈|f'(x)||Δx|. Error relativo: |Δy/y|≈|f'(x)/f(x)||Δx|. Error porcentual: 100·|Δy/y|%. En control de calidad industrial (ISO 9001, que aplican empresas como CEMEX, BIMBO, GRUMA): la propagación de errores determina las tolerancias de fabricación. Un error del 1% en el radio de un tanque produce un error del 3% en el volumen (regla del 3)."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "Si f(x)=x³ y dx=0.1, el diferencial dy en x=2 es:",
          "options": ["1.2", "0.1", "3", "0.001"],
          "correct": "1.2"
        },
        {
          "question": "La linearización de f(x)=√x cerca de x=9 es:",
          "options": [
            "L(x) = 3 + (1/6)(x−9)",
            "L(x) = 9 + (1/3)(x−9)",
            "L(x) = 3 + 3(x−9)",
            "L(x) = 3 + (x−9)"
          ],
          "correct": "L(x) = 3 + (1/6)(x−9)"
        },
        {
          "question": "Si el radio de una esfera se mide con error de 2%, el error relativo en el volumen es aproximadamente:",
          "options": ["6%", "2%", "4%", "8%"],
          "correct": "6%"
        }
      ],
      "rubric": "4: Calcula diferenciales, aplica linearización y estima propagación de errores con correcta interpretación. 3: Calcula diferenciales y linearización con errores menores. 2: Calcula dy=f'(x)dx pero no aplica a propagación de errores. 1: Confunde diferencial con derivada o incremento."
    },
    "teacher_tips": [
      "La actividad de zoom en GeoGebra para mostrar que la curva 'parece recta' de cerca es el fundamento intuitivo de toda la progresión.",
      "Las aproximaciones √1.04≈1.02, sen(31°)≈sen(30°)+Δ son útiles en la vida real y conectan con competencia numérica.",
      "Para la propagación de errores: usar el contexto de control de calidad industrial — muchos estudiantes trabajan o tienen familiares en manufactura.",
      "La reflexión metacognitiva al final del semestre es importante — el cálculo es una de las ideas más grandes de la matemática."
    ]
  }
}

with open(OUT, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Written {len(data)} progressions to {OUT}")
