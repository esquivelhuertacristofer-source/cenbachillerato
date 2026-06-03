"""gen-cneyt-iv.py — CNEYT IV Química (Sem 4) — 8 progresiones completas."""
import json, pathlib

OUT = pathlib.Path(__file__).parent.parent / "src/data/planteamiento/cneyt-iv.json"

data = {
  "CNEYT-IV-P01": {
    "code": "CNEYT-IV-P01",
    "title": "Interpreta y balancea ecuaciones químicas aplicando la ley de conservación de la masa.",
    "level": "CNEYT IV",
    "duration": "~3h (2 sesiones de 50 min)",
    "difficulty": "Intermedio",
    "category": "Química general",
    "metadata": {
      "objective": "Identificar reactivos, productos y coeficientes estequiométricos en una ecuación química; balancear ecuaciones por tanteo y por el método algebraico; aplicar la Ley de Conservación de la Masa de Lavoisier en contextos cotidianos y de impacto ambiental.",
      "competencies": [
        "Distingue entre fórmula química y ecuación química, y entre coeficiente y subíndice.",
        "Balancea ecuaciones de 3-6 sustancias por el método de tanteo.",
        "Verifica que el número de átomos de cada elemento es igual en ambos lados de la ecuación.",
        "Relaciona el balanceo con la conservación de masa en contextos industriales mexicanos (PEMEX, producción de fertilizantes)."
      ],
      "materials": [
        "Modelos moleculares de plástico o esfera de unicel + palillos.",
        "Tabla periódica (versión IUPAC en español).",
        "Fichas de tarjetas con ecuaciones sin balancear (15 ecuaciones graduadas).",
        "Balanza de laboratorio y materiales de cocina para demostración de conservación de masa (bicarbonato + vinagre en sistema cerrado)."
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "Apertura", "duration": "10 min", "label": "Demostración: bicarbonato + vinagre"},
        {"phase": "Desarrollo", "duration": "30 min", "label": "Balanceo y estequiometría básica"},
        {"phase": "Cierre", "duration": "10 min", "label": "Contexto PEMEX y fertilizantes"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA",
          "duration": "10 min",
          "description": "Experimento: mezclar bicarbonato de sodio (NaHCO₃) con vinagre (CH₃COOH) en una bolsa hermética sellada sobre una balanza. La bolsa se infla (CO₂), pero la masa total no cambia. '¿Qué pasó con los átomos?' → Lavoisier: nada se crea, nada se destruye, todo se transforma.",
          "activity": "Los estudiantes registran la masa antes y después. Discuten: ¿dónde 'fue' el gas? Si el sistema está cerrado, la masa es igual. Se introduce la ecuación no balanceada: NaHCO₃ + CH₃COOH → CH₃COONa + H₂O + CO₂."
        },
        {
          "title": "FASE II: DESARROLLO",
          "duration": "30 min",
          "description": "Vocabulario: ecuación química, reactivos (izquierda), productos (derecha), coeficiente estequiométrico (número que multiplica la fórmula completa), subíndice (dentro de la fórmula, no se cambia). Balanceo por tanteo: (1) identificar el elemento menos frecuente, (2) balancear ese elemento primero, (3) continuar con los demás, (4) verificar átomo por átomo. Ejemplo completo: Fe + O₂ → Fe₂O₃. Balanceo: 4Fe + 3O₂ → 2Fe₂O₃. Verificación: Fe: 4=4; O: 6=6. Caso PEMEX: síntesis de amoniaco (Proceso Haber-Bosch) N₂ + 3H₂ → 2NH₃ — base de los fertilizantes nitrogenados que produce PEMEX Fertilizantes en Cosoleacaque, Veracruz.",
          "activity": "Competencia de balanceo: cada equipo recibe 5 ecuaciones de dificultad creciente. El primero en balancear correctamente todas gana. Revisión colectiva en el pizarrón."
        },
        {
          "title": "FASE III: CIERRE",
          "duration": "10 min",
          "description": "Contexto ambiental: la combustión incompleta del petróleo en CDMX produce CO (monóxido) en lugar de CO₂. 2C + O₂ → 2CO (incompleta) vs C + O₂ → CO₂ (completa). ¿Por qué es peligroso el CO?",
          "activity": "Reflexión: la ecuación química como 'receta atómica' — si cambias los coeficientes cambian las proporciones pero nunca los subíndices (cambiarían las sustancias)."
        }
      ]
    },
    "theory": {
      "introduction": "La ley de conservación de la masa, formulada por Antoine Lavoisier (1789), establece que en una reacción química la masa total de los reactivos iguala la masa total de los productos. Esta ley es la base de la estequiometría y de toda la industria química, incluyendo PEMEX, BIMBO y la industria farmacéutica.",
      "sections": [
        {
          "subtitle": "Ecuación química: simbología",
          "content": "Forma general: aA + bB → cC + dD, donde a, b, c, d son coeficientes estequiométricos (siempre enteros positivos en su mínima expresión) y A, B, C, D son fórmulas de sustancias. El símbolo → indica la dirección de la reacción; ⇌ indica equilibrio reversible. Los estados se indican como (s) sólido, (l) líquido, (g) gas, (ac) solución acuosa."
        },
        {
          "subtitle": "Balanceo por tanteo: estrategia",
          "content": "1. Escribir la ecuación sin balancear con todas las fórmulas correctas. 2. Contar átomos de cada elemento en ambos lados. 3. Ajustar coeficientes (NUNCA subíndices) comenzando por los metales o elementos que aparecen menos veces. 4. Dejar el hidrógeno y el oxígeno para el final (aparecen en agua frecuentemente). 5. Verificar: misma cantidad de átomos de cada elemento en ambos lados."
        },
        {
          "subtitle": "Importancia industrial y ambiental",
          "content": "Proceso Haber-Bosch: N₂ + 3H₂ ⇌ 2NH₃ (Fe catalizador, 400-500°C, 150-300 atm). Produce el 80% de los fertilizantes nitrogenados mundiales. PEMEX Fertilizantes opera la planta de Cosoleacaque, Veracruz. Combustión del gas natural: CH₄ + 2O₂ → CO₂ + 2H₂O. La combustión incompleta genera CO y hollín (partículas PM2.5), problema grave en la Zona Metropolitana del Valle de México (ZMVM)."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "¿Cuál es la ecuación correctamente balanceada para la síntesis del agua?",
          "options": [
            "2H₂ + O₂ → 2H₂O",
            "H₂ + O₂ → H₂O",
            "H₂ + 2O → H₂O",
            "2H + O → H₂O"
          ],
          "correct": "2H₂ + O₂ → 2H₂O"
        },
        {
          "question": "En la ecuación Fe₂O₃ + 3CO → 2Fe + 3CO₂, ¿cuántos átomos de oxígeno hay en los reactivos?",
          "options": ["6", "9", "3", "12"],
          "correct": "9"
        },
        {
          "question": "La ley de Lavoisier establece que en una reacción química:",
          "options": [
            "La masa de los productos es igual a la masa de los reactivos",
            "Se crean nuevos átomos en los productos",
            "Los subíndices deben cambiarse para balancear",
            "La energía siempre se conserva pero no la masa"
          ],
          "correct": "La masa de los productos es igual a la masa de los reactivos"
        }
      ],
      "rubric": "4: Balancea ecuaciones de hasta 5 sustancias correctamente y verifica la conservación de cada elemento. 3: Balancea correctamente con errores menores en ecuaciones complejas. 2: Balancea ecuaciones simples (2-3 sustancias) pero comete errores con más elementos. 1: Cambia subíndices para balancear o no distingue coeficiente de subíndice."
    },
    "teacher_tips": [
      "La demostración del bicarbonato en bolsa cerrada es simple, económica y visualmente impactante — hacerla siempre.",
      "Enfatizar repetidamente: NUNCA cambiar subíndices. Este es el error más frecuente.",
      "El contexto de PEMEX y fertilizantes puede generar debate sobre soberanía alimentaria — aprovechar para conexión con CS.",
      "Para estudiantes avanzados: introducir el método algebraico (sistema de ecuaciones lineales para coeficientes)."
    ]
  },

  "CNEYT-IV-P02": {
    "code": "CNEYT-IV-P02",
    "title": "Clasifica los tipos de reacciones químicas y predice sus productos.",
    "level": "CNEYT IV",
    "duration": "~3h (2 sesiones de 50 min)",
    "difficulty": "Intermedio",
    "category": "Química general",
    "metadata": {
      "objective": "Identificar y clasificar los cinco tipos principales de reacciones químicas (síntesis, descomposición, sustitución simple, doble sustitución y combustión) a partir de la estructura de la ecuación y las sustancias involucradas, y predecir los productos generales de cada tipo.",
      "competencies": [
        "Distingue los cinco tipos de reacciones por su patrón de fórmulas.",
        "Predice los productos de reacciones de síntesis y descomposición simples.",
        "Identifica reacciones de combustión completa e incompleta y sus implicaciones ambientales.",
        "Relaciona los tipos de reacciones con procesos industriales y cotidianos mexicanos."
      ],
      "materials": [
        "Tabla de tipos de reacciones con ejemplos cotidianos.",
        "Materiales para demostración: cinta de magnesio, vela, bicarbonato, ácido clorhídrico diluido (o vinagre).",
        "Tarjetas de clasificación: ecuaciones para clasificar en equipos.",
        "Noticias de accidentes industriales relacionados con reacciones descontroladas (PEMEX, ej. Cadereyta)."
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "Apertura", "duration": "10 min", "label": "Quema de magnesio: síntesis espectacular"},
        {"phase": "Desarrollo", "duration": "30 min", "label": "Los cinco tipos de reacciones"},
        {"phase": "Cierre", "duration": "10 min", "label": "Predicción de productos"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA",
          "duration": "10 min",
          "description": "Demostración (con precaución): quemar un trozo pequeño de cinta de magnesio con un encendedor. Luz blanca intensa. 2Mg + O₂ → 2MgO. Un elemento + otro elemento → un compuesto. Tipo: síntesis. Preguntar: ¿conocen otras reacciones cotidianas? (digestión, combustión de gasolina, rusting del hierro, explosivos).",
          "activity": "Lluvia de ideas: los estudiantes listan 10 reacciones que conocen de su vida diaria. El docente las va clasificando intuitivamente en el pizarrón."
        },
        {
          "title": "FASE II: DESARROLLO",
          "duration": "30 min",
          "description": "Los cinco tipos: (1) SÍNTESIS: A + B → AB. Patrón: más de una sustancia produce una. Ej: N₂ + 3H₂ → 2NH₃. (2) DESCOMPOSICIÓN: AB → A + B. Patrón: una sustancia produce varias. Ej: 2H₂O₂ → 2H₂O + O₂ (agua oxigenada). (3) SUSTITUCIÓN SIMPLE (desplazamiento): A + BC → AC + B. Metal más activo desplaza al menos activo. Ej: Zn + H₂SO₄ → ZnSO₄ + H₂↑. (4) DOBLE SUSTITUCIÓN (metátesis): AB + CD → AD + CB. Ej: NaCl + AgNO₃ → AgCl↓ + NaNO₃ (precipitado). (5) COMBUSTIÓN: combustible + O₂ → CO₂ + H₂O (completa) o CO + H₂O (incompleta). Ej: CH₄ + 2O₂ → CO₂ + 2H₂O.",
          "activity": "Cada equipo recibe 10 tarjetas con ecuaciones. Deben clasificarlas, justificando el tipo. Presentan sus resultados. Se discuten los casos ambiguos."
        },
        {
          "title": "FASE III: CIERRE",
          "duration": "10 min",
          "description": "Contexto ambiental: la combustión incompleta de combustibles en la ZMVM genera ozono troposférico y PM2.5 (fuente: SEDEMA-CDMX). La NORMA Oficial Mexicana NOM-041-SEMARNAT-2015 limita las emisiones de CO de vehículos.",
          "activity": "Reto de predicción: dados los reactivos, predecir los productos. 3 ejercicios por parejas. Metacognición: ¿cómo el tipo de reacción ayuda a predecir qué obtendrás sin hacer el experimento?"
        }
      ]
    },
    "theory": {
      "introduction": "Clasificar las reacciones químicas permite predecir productos antes de realizarlas, lo que es fundamental en la industria, la medicina y la protección ambiental. La industria química mexicana (PEMEX, Grupo Alfa, Cydsa) usa esta clasificación para diseñar procesos seguros y eficientes.",
      "sections": [
        {
          "subtitle": "Síntesis y descomposición",
          "content": "Síntesis (combinación): A + B → AB. Dos o más sustancias forman una más compleja. Muy exotérmica generalmente. Descomposición: AB → A + B. Una sustancia se divide en sus componentes. Puede requerir calor (termólisis), electricidad (electrólisis) o luz (fotólisis). Ejemplo de fotólisis: 2AgBr → 2Ag + Br₂ (ennegrecimiento de fotografías antiguas, proceso que usaban en el INAH para documentar monumentos)."
        },
        {
          "subtitle": "Sustitución simple y doble",
          "content": "Sustitución simple: elemento libre + compuesto → nuevo compuesto + nuevo elemento libre. La reactividad determina quién desplaza a quién (serie de actividad de los metales: K>Ca>Na>Mg>Al>Zn>Fe>Cu>Ag>Au). Doble sustitución (intercambio de iones): ocurre cuando se forma un precipitado (sólido insoluble), gas o agua (reacción ácido-base). Los iones 'intercambian parejas'."
        },
        {
          "subtitle": "Combustión: completa e incompleta",
          "content": "Combustión completa: suficiente O₂ → CO₂ + H₂O. Combustión incompleta: O₂ limitado → CO + H₂O (y/o hollín=C). El CO es inodoro, incoloro y mortal a 200 ppm (STPS, NOM-010-STPS-2014). En México, la SEDEMA-CDMX mide diariamente CO y O₃ en la ZMVM; los programas Hoy No Circula y el Doble Hoy No Circula responden a niveles de contaminación."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "La reacción CaCO₃ → CaO + CO₂ es de tipo:",
          "options": ["Síntesis", "Descomposición", "Sustitución simple", "Combustión"],
          "correct": "Descomposición"
        },
        {
          "question": "¿Cuál es el patrón de una reacción de sustitución simple?",
          "options": [
            "A + BC → AC + B",
            "A + B → AB",
            "AB + CD → AD + CB",
            "AB → A + B"
          ],
          "correct": "A + BC → AC + B"
        },
        {
          "question": "La combustión completa del propano (C₃H₈) produce principalmente:",
          "options": [
            "CO₂ y H₂O",
            "CO y H₂O",
            "C y H₂",
            "CO₂ y CO"
          ],
          "correct": "CO₂ y H₂O"
        }
      ],
      "rubric": "4: Clasifica correctamente todos los tipos, predice productos y relaciona con contexto ambiental. 3: Clasifica los 5 tipos con errores menores en predicción de productos. 2: Clasifica síntesis, descomposición y combustión pero confunde sustituciones. 1: No distingue los tipos de reacciones."
    },
    "teacher_tips": [
      "La quema de magnesio requiere gafas oscuras — NUNCA mirar directamente. Usar pinzas largas. Si no hay cinta de Mg, mostrar video en su lugar.",
      "El contexto de contaminación en CDMX (SEDEMA) es relevante para la mayoría de los estudiantes urbanos.",
      "Para el contexto de doble sustitución: la precipitación de AgCl es la base de la prueba de cloruros en agua potable (CONAGUA)."
    ]
  },

  "CNEYT-IV-P03": {
    "code": "CNEYT-IV-P03",
    "title": "Analiza el concepto de pH y la importancia de los ácidos y bases en contextos cotidianos y biológicos.",
    "level": "CNEYT IV",
    "duration": "~3h (2 sesiones de 50 min)",
    "difficulty": "Intermedio",
    "category": "Química general",
    "metadata": {
      "objective": "Comprender la escala de pH (0-14), distinguir ácidos de bases por sus propiedades y fórmulas, calcular el pH de soluciones simples y relacionar el pH con fenómenos biológicos (sangre, digestión) y ambientales (lluvia ácida, acidificación de océanos).",
      "competencies": [
        "Define ácido y base según las teorías de Arrhenius y Brønsted-Lowry.",
        "Usa la escala de pH para clasificar soluciones como ácidas, neutras o básicas.",
        "Calcula pH = −log[H⁺] para concentraciones simples (10⁻ⁿ M).",
        "Relaciona el pH con procesos biológicos (pH sanguíneo, gástrico) y problemas ambientales mexicanos (lluvia ácida en ZMVM)."
      ],
      "materials": [
        "Papel indicador de pH o tiras de pH universal.",
        "Soluciones: jugo de limón, vinagre, agua destilada, agua de cal, bicarbonato diluido, leche, café.",
        "Repollo morado como indicador natural (jugo cambia de rojo a verde según pH).",
        "Tabla de pH de sustancias comunes.",
        "Datos de lluvia ácida en México: INECC, Informe de Calidad del Aire ZMVM."
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "Apertura", "duration": "10 min", "label": "Jugo de repollo morado como indicador"},
        {"phase": "Desarrollo", "duration": "30 min", "label": "Escala de pH, cálculos y aplicaciones"},
        {"phase": "Cierre", "duration": "10 min", "label": "Lluvia ácida en México"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA",
          "duration": "10 min",
          "description": "Se prepara jugo de repollo morado (hervir 5 min). Se agregan gotas a vasos con: vinagre (rojo), agua (morado), bicarbonato (verde-amarillo). Los estudiantes observan que el color indica acidez o basicidad. ¿Qué es lo que hace que algo sea ácido?",
          "activity": "Los estudiantes predicen qué color dará el limón, la leche, el café, el agua de cal. Verifican. Ordenan los vasos de más ácido a más básico intuitivamente."
        },
        {
          "title": "FASE II: DESARROLLO",
          "duration": "30 min",
          "description": "Teoría de Arrhenius: ácido = libera H⁺ (HCl → H⁺ + Cl⁻); base = libera OH⁻ (NaOH → Na⁺ + OH⁻). Brønsted-Lowry: ácido = donador de H⁺; base = aceptor de H⁺. Escala de pH: pH = −log[H⁺]; rango 0-14. pH < 7: ácido; pH = 7: neutro (agua pura a 25°C); pH > 7: básico. Neutro no significa inocuo. Cálculos: [H⁺]=10⁻³ M → pH=3 (ácido estomacal). Neutralización: HCl + NaOH → NaCl + H₂O. Contextos biológicos: sangre pH 7.35-7.45 (tampón bicarbonato); acidosis (<7.35) y alcalosis (>7.45) son emergencias médicas. Saliva pH 6.5-7.5; jugos gástricos pH 1.5-2.",
          "activity": "Medición con papel pH: medir el pH de 8 sustancias provistas. Construir la escala de pH del grupo. Calcular: si el pH del Lago Chapala cayó de 8.3 a 7.1 por contaminación (CONAGUA), ¿cuánto aumentó [H⁺]? (10 veces más)."
        },
        {
          "title": "FASE III: CIERRE",
          "duration": "10 min",
          "description": "Lluvia ácida en México: el dióxido de azufre (SO₂) de las refinerías de PEMEX y el NOₓ del tráfico reaccionan con agua → H₂SO₄ y HNO₃. La lluvia normal tiene pH ≈ 5.6 (CO₂+H₂O); lluvia ácida: pH < 5. INECC reporta episodios de pH ≈ 4.1 en la ZMVM.",
          "activity": "Debate: ¿cómo afecta la lluvia ácida a los edificios históricos de centro histórico de CDMX (cantera, mármol = CaCO₃)? CaCO₃ + H₂SO₄ → CaSO₄ + H₂O + CO₂. Los estudiantes proponen soluciones de política pública."
        }
      ]
    },
    "theory": {
      "introduction": "El pH es uno de los parámetros más importantes en química, biología, medicina y ciencias ambientales. En México, la CONAGUA monitorea el pH del agua superficial; el INECC vigila la lluvia ácida; el IMSS usa el pH sanguíneo en emergencias médicas.",
      "sections": [
        {
          "subtitle": "Definiciones de ácido y base",
          "content": "Arrhenius (1887): ácido produce H⁺(ac); base produce OH⁻(ac) en agua. Brønsted-Lowry (1923): ácido = donador de protón (H⁺); base = aceptor de protón. Pares ácido-base conjugados: el ácido pierde H⁺ y se convierte en su base conjugada (HCl → Cl⁻). Fuerza: ácidos fuertes se disocian completamente (HCl, H₂SO₄, HNO₃); débiles se disocian parcialmente (CH₃COOH, ácido carbónico)."
        },
        {
          "subtitle": "La escala de pH",
          "content": "El pH se define como pH = −log₁₀[H⁺] donde [H⁺] es la concentración molar de iones hidrógeno. A 25°C, el agua pura: [H⁺]=[OH⁻]=10⁻⁷ M → pH=7. Relación inversa: pH 3 es 10,000 veces más ácido que pH 7. El pOH = −log[OH⁻]; pH + pOH = 14. La escala es logarítmica: cada unidad representa un factor de 10 en concentración."
        },
        {
          "subtitle": "pH en contextos biológicos y ambientales",
          "content": "Sangre: pH 7.35-7.45 (tampón bicarbonato HCO₃⁻/CO₂); variaciones de ±0.4 son incompatibles con la vida. Estómago: pH 1.5-2 (HCl, enzima pepsina activa). Océanos: pH actual ≈ 8.1 (básico), cayó 0.1 unidades desde era preindustrial (acidificación oceánica afecta arrecifes de coral mexicanos en Quintana Roo: CONANP). Suelos agrícolas: pH 6-7 es óptimo para la mayoría de cultivos; la SAGARPA asesora a productores sobre encalamiento (CaO) para corregir suelos ácidos."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "Una solución con [H⁺] = 10⁻⁴ M tiene un pH de:",
          "options": ["4", "−4", "0.0001", "10"],
          "correct": "4"
        },
        {
          "question": "El pH de la sangre humana saludable es aproximadamente:",
          "options": ["7.4", "6.0", "8.5", "5.5"],
          "correct": "7.4"
        },
        {
          "question": "La lluvia ácida se forma principalmente cuando ___ se disuelve en agua:",
          "options": [
            "SO₂ y NOₓ",
            "CO₂ solamente",
            "O₃ y N₂",
            "NaCl y KCl"
          ],
          "correct": "SO₂ y NOₓ"
        }
      ],
      "rubric": "4: Calcula pH correctamente, relaciona con fenómenos biológicos y ambientales y argumenta propuestas de solución. 3: Calcula pH y clasifica ácidos/bases con errores menores. 2: Usa la escala cualitativamente pero no puede calcular pH. 1: Confunde ácido con básico o no comprende la escala logarítmica."
    },
    "teacher_tips": [
      "El jugo de repollo morado es barato, fácil de preparar y muy visual — no omitir esta actividad.",
      "La acidificación de los arrecifes del Caribe mexicano es un tema de alto impacto para conectar con turismo y economía (SECTUR).",
      "Para el cálculo de pH: solo trabajar con potencias exactas de 10 a nivel bachillerato; logaritmos intermedios son para nivel universitario.",
      "Conectar con ENSANUT: el reflujo gástrico (ERGE) afecta al ~15% de adultos mexicanos — el pH gástrico bajo es relevante."
    ]
  },

  "CNEYT-IV-P04": {
    "code": "CNEYT-IV-P04",
    "title": "Describe las propiedades y reactividad de los compuestos orgánicos básicos (alcanos, alquenos, alcoholes, ácidos carboxílicos).",
    "level": "CNEYT IV",
    "duration": "~3h (2 sesiones de 50 min)",
    "difficulty": "Intermedio-Avanzado",
    "category": "Química orgánica",
    "metadata": {
      "objective": "Reconocer la estructura de alcanos, alquenos, alcoholes y ácidos carboxílicos; nombrar compuestos simples usando la nomenclatura IUPAC; relacionar el grupo funcional con las propiedades físicas y químicas características de cada familia.",
      "competencies": [
        "Identifica el esqueleto carbonado y los grupos funcionales de compuestos orgánicos simples.",
        "Aplica la nomenclatura IUPAC para nombrar alcanos (1-10 carbonos) y sus derivados.",
        "Relaciona el tipo de enlace (simple, doble) con la reactividad del compuesto.",
        "Conecta compuestos orgánicos con productos de uso cotidiano en México (gasolina, etanol, ácido acético, plásticos)."
      ],
      "materials": [
        "Modelos moleculares (esferas y palillos) o impresión 3D.",
        "Muestras de laboratorio (o frascos cerrados): hexano, etanol, ácido acético.",
        "Tabla de nomenclatura IUPAC de alcanos (metano → decano).",
        "Etiquetas de productos comunes: gasolina PEMEX (alcanos C₄-C₁₂), mezcal (etanol), vinagre (ácido acético 5%)."
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "Apertura", "duration": "10 min", "label": "El carbono: base de la vida y de la industria"},
        {"phase": "Desarrollo", "duration": "30 min", "label": "Las cuatro familias orgánicas"},
        {"phase": "Cierre", "duration": "10 min", "label": "De la caña de azúcar al mezcal"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA",
          "duration": "10 min",
          "description": "¿Qué tienen en común la gasolina, el mezcal y el vinagre? Todos son compuestos orgánicos con carbono como elemento central. El carbono puede formar 4 enlaces covalentes y encadenarse indefinidamente → diversidad de compuestos orgánicos. Más de 10 millones de compuestos orgánicos conocidos vs ~500 000 inorgánicos.",
          "activity": "Los estudiantes identifican el carbono en las fórmulas: metano CH₄, etanol C₂H₅OH, ácido acético CH₃COOH. ¿Cuántos carbonos tiene cada uno? ¿Qué diferencia estructural hay?"
        },
        {
          "title": "FASE II: DESARROLLO",
          "duration": "30 min",
          "description": "Alcanos: CₙH₂ₙ₊₂, solo enlaces simples C-C y C-H (saturados). Nombres IUPAC: metano, etano, propano, butano, pentano, hexano, heptano, octano, nonano, decano. Gasolina PEMEX: mezcla de alcanos C₄-C₁₂. Gas doméstico: propano y butano. Alquenos: CₙH₂ₙ, tienen un doble enlace C=C (insaturados). Más reactivos por el π-enlace. Etileno CH₂=CH₂ → base del polietileno (bolsas, tuberías). Alcoholes: grupo funcional −OH. Metanol CH₃OH (tóxico); Etanol C₂H₅OH (bebidas alcohólicas, biocombustible — México es productor de mezcal: DO desde 1994). Ácidos carboxílicos: grupo −COOH. Ácido acético CH₃COOH (vinagre, 5% ac); ácido cítrico (limones, México: 1er productor mundial); ácido láctico (yogur, fermentación).",
          "activity": "Con modelos moleculares: construir metano, etano, propano, etileno y etanol. Observar la geometría. En parejas: nombrar 5 compuestos dados su fórmula molecular y viceversa."
        },
        {
          "title": "FASE III: CIERRE",
          "duration": "10 min",
          "description": "Del agave al mezcal: la fermentación alcohólica convierte glucosa en etanol. C₆H₁₂O₆ → 2C₂H₅OH + 2CO₂. México tiene la Denominación de Origen del mezcal (COMERCAM). El mezcal artesanal es una industria de 40 000 familias en Oaxaca.",
          "activity": "Reflexión: ¿por qué el metanol (alcohol de madera) es mortal y el etanol (de bebidas) no? Diferencia de estructura: un carbono vs dos carbonos. El metanol se metaboliza a formaldehído (tóxico). Conexión con seguridad sanitaria: adulteración de bebidas (COFEPRIS)."
        }
      ]
    },
    "theory": {
      "introduction": "La química orgánica estudia los compuestos del carbono. El carbono es único por su capacidad de formar 4 enlaces covalentes y encadenarse con sí mismo (catenación), generando millones de compuestos. Prácticamente toda la industria petroquímica, farmacéutica y alimentaria mexicana se basa en compuestos orgánicos.",
      "sections": [
        {
          "subtitle": "Alcanos y alquenos: hidrocarburos",
          "content": "Hidrocarburos: solo C y H. Alcanos (parafinas): saturados, CₙH₂ₙ₊₂, links simples, poco reactivos, usados como combustibles. Alquenos (olefinas): insaturados, CₙH₂ₙ, un doble enlace C=C, más reactivos. El doble enlace participa en reacciones de adición (H₂, Br₂, HX). El etileno es la materia prima más producida en el mundo petroquímico: PEMEX lo produce en Morelos, Veracruz."
        },
        {
          "subtitle": "Grupos funcionales: alcoholes y ácidos carboxílicos",
          "content": "El grupo funcional determina las propiedades químicas de la molécula. Alcoholes (−OH): polares, miscibles en agua en cadenas cortas, punto de ebullición mayor que el alcano equivalente (puentes de hidrógeno). Ácidos carboxílicos (−COOH): ácidos débiles, olor fuerte, se disocian parcialmente en agua. Su reacción con alcoholes produce ésteres (R−COOH + R'−OH → R−COOR' + H₂O): reacción de esterificación, responsable de los aromas de frutas."
        },
        {
          "subtitle": "Nomenclatura IUPAC básica",
          "content": "Prefijos de cadena: met(1)−et(2)−prop(3)−but(4)−pent(5)−hex(6)−hept(7)−oct(8)−non(9)−dec(10). Sufijos: −ano (alcano), −eno (alqueno, indicando posición del doble enlace), −ol (alcohol, indicando posición del −OH), −oico (ácido carboxílico). Ejemplo: CH₃CH₂CH₂OH = propan-1-ol; CH₃CHOHCH₃ = propan-2-ol (alcohol isopropílico, antiséptico)."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "¿Cuál es el nombre IUPAC del compuesto CH₃CH₂OH?",
          "options": ["Etanol", "Metanol", "Propanol", "Etano"],
          "correct": "Etanol"
        },
        {
          "question": "El grupo funcional −COOH es característico de:",
          "options": [
            "Los ácidos carboxílicos",
            "Los alcoholes",
            "Los alcanos",
            "Los alquenos"
          ],
          "correct": "Los ácidos carboxílicos"
        },
        {
          "question": "¿Por qué los alquenos son más reactivos que los alcanos?",
          "options": [
            "Tienen un doble enlace C=C que puede participar en reacciones de adición",
            "Tienen más átomos de hidrógeno",
            "No tienen oxígeno en su estructura",
            "Son más pesados molecularmente"
          ],
          "correct": "Tienen un doble enlace C=C que puede participar en reacciones de adición"
        }
      ],
      "rubric": "4: Nombra y clasifica correctamente todos los compuestos, relaciona grupo funcional con propiedades y contextualiza en industria mexicana. 3: Nombra y clasifica con errores menores en posición de grupos. 2: Identifica familias pero comete errores en nomenclatura. 1: No distingue entre las cuatro familias."
    },
    "teacher_tips": [
      "Las muestras físicas (etanol, vinagre, gasolina en frasco cerrado) hacen la clase mucho más concreta.",
      "El contexto mezcal/tequila-agave conecta con identidad cultural oaxaqueña y jalisciense — muy motivante para muchos estudiantes.",
      "Para estudiantes avanzados: introducir la isomería estructural (butano vs isobutano) como extensión.",
      "COFEPRIS publica alertas sobre adulteración de alcohol etílico con metanol — dato relevante de salud pública."
    ]
  },

  "CNEYT-IV-P05": {
    "code": "CNEYT-IV-P05",
    "title": "Identifica las biomoléculas (carbohidratos, lípidos, proteínas, ácidos nucleicos) y sus funciones biológicas.",
    "level": "CNEYT IV",
    "duration": "~3h (2 sesiones de 50 min)",
    "difficulty": "Intermedio",
    "category": "Bioquímica",
    "metadata": {
      "objective": "Describir la estructura general, los monómeros y las funciones biológicas de los cuatro grupos de biomoléculas; relacionarlos con la nutrición, la herencia y el metabolismo en el contexto de la salud en México.",
      "competencies": [
        "Clasifica las biomoléculas según su composición elemental y función.",
        "Identifica monómeros y polímeros de carbohidratos y proteínas.",
        "Explica el papel de los ácidos nucleicos en la transmisión de la información genética.",
        "Relaciona el consumo de biomoléculas con datos de salud pública mexicana (ENSANUT, INSP)."
      ],
      "materials": [
        "Modelos o imágenes de estructuras moleculares (glucosa, aminoácidos, ácidos grasos, ADN).",
        "Alimentos para clasificar: tortilla, aceite de oliva, huevo, papa, yogur, cacahuate.",
        "Resultados de la ENSANUT 2022 (INSP): prevalencia de diabetes tipo 2 (12.4%) y sobrepeso/obesidad (75% adultos).",
        "Tiras reactivas de glucosa para demostración opcional.",
        "Infografía de la doble hélice del ADN."
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "Apertura", "duration": "10 min", "label": "¿Qué hay en una tortilla?"},
        {"phase": "Desarrollo", "duration": "30 min", "label": "Las cuatro biomoléculas y sus funciones"},
        {"phase": "Cierre", "duration": "10 min", "label": "ENSANUT y la epidemia de diabetes en México"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA",
          "duration": "10 min",
          "description": "Se muestra la etiqueta nutricional de una tortilla de maíz: carbohidratos, proteínas, grasas. '¿Para qué sirve cada uno en el cuerpo?' Se introduce la idea de que el cuerpo no usa los alimentos tal como los comemos — los degrada en monómeros y los reensambla en moléculas propias.",
          "activity": "Clasificación de alimentos: cada equipo recibe 6 alimentos y debe categorizarlos por su biomoléculas predominante. Discusión: ¿todos los alimentos tienen las mismas biomoléculas?"
        },
        {
          "title": "FASE II: DESARROLLO",
          "duration": "30 min",
          "description": "CARBOHIDRATOS (C, H, O): monosacáridos (glucosa, fructosa, galactosa) → disacáridos (sacarosa=glucosa+fructosa; lactosa) → polisacáridos (almidón: energía en plantas; glucógeno: reserva en humanos; celulosa: estructura en plantas). Función: energía (4 kcal/g). El maíz mexicano (ancestral, C4) tiene almidón de alta digestibilidad. LÍPIDOS (C, H, O, pocos; alta relación C:O): triglicéridos (3 ácidos grasos + glicerol), fosfolípidos (membranas celulares), colesterol. Función: reserva energética (9 kcal/g), membrana, hormonas. Ácidos grasos saturados (sólidos, origen animal) vs insaturados (líquidos, aceites vegetales). PROTEÍNAS (C, H, O, N, S): monómero = aminoácido (20 tipos); polímero = polipéptido/proteína. Función: enzimas (catálisis), estructural (colágeno, queratina), transporte (hemoglobina), inmune (anticuerpos). ÁCIDOS NUCLEICOS (C, H, O, N, P): ADN (desoxirribosa, bases ATCG, doble hélice, Watson-Crick 1953); ARN (ribosa, uracilo en lugar de timina, monocatenario). Función: almacenar (ADN) y expresar (ARN→proteína) la información genética.",
          "activity": "Juego de roles: cada estudiante es un 'monómero'. Los carbohidratos forman una cadena de mano; las proteínas forman la misma cadena pero en diferente orden cambia la función. Dibujado de la doble hélice del ADN con bases complementarias."
        },
        {
          "title": "FASE III: CIERRE",
          "duration": "10 min",
          "description": "ENSANUT 2022 (Instituto Nacional de Salud Pública): diabetes tipo 2 afecta al 12.4% de adultos mexicanos (≈10 millones); 75.2% tiene sobrepeso u obesidad; el 35% de adolescentes consume refrescos azucarados diariamente. La diabetes tipo 2 se relaciona con el exceso de carbohidratos simples y grasas saturadas.",
          "activity": "Análisis crítico: ¿por qué México tiene tasas tan altas de diabetes si el maíz es un alimento ancestral? (procesamiento industrial, azúcares añadidos, sedentarismo). Propuesta grupal de una campaña de concientización nutricional usando los datos de ENSANUT."
        }
      ]
    },
    "theory": {
      "introduction": "Las biomoléculas son las moléculas orgánicas que forman y regulan los seres vivos. Su conocimiento es fundamental para entender la nutrición, la medicina y la biotecnología. México enfrenta una epidemia de enfermedades crónicas no transmisibles (ECNT) donde el desbalance en el consumo de biomoléculas juega un papel central (ENSANUT, INSP).",
      "sections": [
        {
          "subtitle": "Carbohidratos y lípidos: energía y estructura",
          "content": "Carbohidratos: fórmula general (CH₂O)ₙ. Glucosa (C₆H₁₂O₆) es el combustible celular principal; el almidón del maíz y la papa son glucosa polimerizada. La celulosa (también glucosa polimerizada) no es digerible por humanos (fibra dietética). Lípidos: son hidrófobos (no se mezclan con agua). Los fosfolípidos forman la bicapa lipídica de todas las membranas celulares: cabeza polar (hidrófila) + dos colas apolares (hidrófobas)."
        },
        {
          "subtitle": "Proteínas: diversidad funcional",
          "content": "Los 20 aminoácidos se unen por enlaces peptídicos (−CO−NH−) formando polipéptidos. La secuencia de aminoácidos (estructura primaria) determina la forma tridimensional (secundaria: hélice α o hoja β; terciaria: plegamiento completo; cuaternaria: varias cadenas). La forma determina la función. La desnaturalización (calor, pH extremo) rompe la estructura pero no la secuencia. El huevo cocido es un ejemplo de desnaturalización irreversible."
        },
        {
          "subtitle": "Ácidos nucleicos y el dogma central",
          "content": "Dogma central de la biología molecular (Crick, 1958): ADN → ARNm → Proteína. La transcripción copia la información del ADN al ARN mensajero; la traducción (en ribosomas) convierte la secuencia de codones (tripletes de bases) en aminoácidos. Los codones son universales (el código genético es el mismo en bacteria, maíz y humano — evidencia de origen común). En biotecnología, la PCR (reacción en cadena de la polimerasa) amplifica fragmentos de ADN; el IMSS la usa para diagnóstico de enfermedades genéticas."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "¿Cuál es el monómero de las proteínas?",
          "options": ["Aminoácido", "Glucosa", "Ácido graso", "Nucleótido"],
          "correct": "Aminoácido"
        },
        {
          "question": "¿Qué biomolécula almacena la información genética?",
          "options": ["ADN", "Proteína", "Lípido", "Glucógeno"],
          "correct": "ADN"
        },
        {
          "question": "El almidón es un polisacárido formado por la polimerización de:",
          "options": ["Glucosa", "Fructosa", "Aminoácidos", "Ácidos grasos"],
          "correct": "Glucosa"
        }
      ],
      "rubric": "4: Identifica correctamente las cuatro biomoléculas con sus monómeros, funciones y conecta con datos de salud pública. 3: Identifica las cuatro familias con errores menores en funciones específicas. 2: Identifica carbohidratos y proteínas pero confunde lípidos y ácidos nucleicos. 1: No distingue entre las cuatro familias."
    },
    "teacher_tips": [
      "La etiqueta nutricional de una tortilla industrial vs tortilla artesanal genera discusión muy rica sobre procesamiento de alimentos.",
      "Los datos de ENSANUT 2022 son actuales y perturbadores — usarlos para motivar la relevancia del tema.",
      "El juego de roles con cadenas de aminoácidos funciona muy bien físicamente en el aula.",
      "Conectar con la progresión P06 siguiente (industria farmacéutica y alimentaria)."
    ]
  },

  "CNEYT-IV-P06": {
    "code": "CNEYT-IV-P06",
    "title": "Relaciona la química orgánica con la industria farmacéutica, alimentaria y de materiales.",
    "level": "CNEYT IV",
    "duration": "~3h (2 sesiones de 50 min)",
    "difficulty": "Intermedio",
    "category": "Química aplicada",
    "metadata": {
      "objective": "Analizar cómo los principios de la química orgánica se aplican en la producción industrial de medicamentos, alimentos procesados y materiales sintéticos (plásticos, fibras), identificando empresas mexicanas e implicaciones sociales y ambientales.",
      "competencies": [
        "Describe el proceso general de síntesis de un medicamento (principio activo, excipientes, proceso farmacéutico).",
        "Explica la función de los aditivos alimentarios (conservadores, colorantes, emulsionantes) en términos químicos.",
        "Identifica los principales tipos de plásticos y sus monómeros de origen.",
        "Evalúa el ciclo de vida de los materiales sintéticos desde su producción hasta su disposición final."
      ],
      "materials": [
        "Envases de medicamentos genéricos (BIRMEX, Laboratorios Pisa) y de marca.",
        "Etiquetas de alimentos industrializados con lista de ingredientes.",
        "Muestras de diferentes plásticos identificados por código de reciclaje (1-7).",
        "Tabla de aditivos alimentarios con sus funciones.",
        "Informe de la industria farmacéutica mexicana (CANIFARMA)."
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "Apertura", "duration": "10 min", "label": "¿Qué hay en una pastilla de paracetamol?"},
        {"phase": "Desarrollo", "duration": "30 min", "label": "Farmacéutica, alimentaria y plásticos"},
        {"phase": "Cierre", "duration": "10 min", "label": "Debate: medicamentos genéricos vs patente"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA",
          "duration": "10 min",
          "description": "Se muestra una tableta de paracetamol 500 mg (BIRMEX, la farmacéutica del Estado mexicano). ¿Qué contiene además del principio activo? Excipientes: almidón de maíz (aglutinante), estearato de magnesio (lubricante), celulosa microcristalina (relleno). Todo es química orgánica.",
          "activity": "Los estudiantes leen la composición de 3 medicamentos (paracetamol, ibuprofeno, amoxicilina) y distinguen principio activo de excipientes. Buscan en el empaque qué indica la empresa fabricante."
        },
        {
          "title": "FASE II: DESARROLLO",
          "duration": "30 min",
          "description": "INDUSTRIA FARMACÉUTICA: México es el 13° productor mundial de medicamentos (CANIFARMA). BIRMEX fabrica vacunas (COVID, influenza) para el gobierno. El 80% de la IFA (ingrediente farmacéutico activo) se importa de China e India. Síntesis del ácido acetilsalicílico (aspirina): CH₃CO₂H + C₆H₄(OH)CO₂H → C₆H₄(OCOCH₃)CO₂H + H₂O (esterificación). INDUSTRIA ALIMENTARIA: aditivos por función: conservadores (benzoato de sodio, E211, inhibe hongos), antioxidantes (ácido ascórbico=Vitamina C, E300), emulsionantes (lecitina de soya, E322, estabiliza aceite+agua), colorantes (tartrazina E102 — amarillo). BIMBO, LALA, GRUMA son empresas mexicanas líderes. MATERIALES SINTÉTICOS: polietileno (PE, bolsas, código 2/4), PET (botellas, código 1, politereftalato de etileno), PVC (tuberías, código 3), poliestireno (vasos desechables, código 6). Monómero del PET: etilenglicol + ácido tereftálico (petroquímica).",
          "activity": "Análisis de etiqueta: cada equipo analiza la lista de ingredientes de 2 alimentos industrializados, identifica al menos 3 aditivos químicos y explica su función. Presentan en 2 minutos."
        },
        {
          "title": "FASE III: CIERRE",
          "duration": "10 min",
          "description": "Debate regulado: medicamentos genéricos (misma molécula, más baratos) vs de patente (protección 20 años, mayor precio). La Comisión Federal para la Protección contra Riesgos Sanitarios (COFEPRIS) certifica la bioequivalencia de los genéricos en México.",
          "activity": "Reflexión ética: ¿tiene derecho una empresa a patentar una molécula que salva vidas? ¿Qué papel tiene el Estado mexicano (BIRMEX, IMSS) en garantizar acceso a medicamentos? Conexión con Ciencias Sociales."
        }
      ]
    },
    "theory": {
      "introduction": "La industria química es uno de los pilares de la economía mexicana. México tiene una industria farmacéutica valorada en más de 15,000 millones USD anuales (CANIFARMA, 2023) y una industria alimentaria que exporta al mundo bajo marcas como BIMBO y GRUMA. La química orgánica aplicada también genera materiales que, sin una gestión adecuada, contaminan el ambiente.",
      "sections": [
        {
          "subtitle": "Química farmacéutica: del laboratorio a la farmacia",
          "content": "Un medicamento moderno pasa por: (1) descubrimiento del principio activo, (2) síntesis y purificación, (3) ensayos clínicos (fases I-IV), (4) registro ante COFEPRIS, (5) producción a escala industrial. El principio activo es la molécula con efecto terapéutico; los excipientes son inactivos pero necesarios para estabilidad, palatabilidad o liberación controlada. La industria mexicana exporta medicamentos a 40 países (ProMéxico)."
        },
        {
          "subtitle": "Aditivos alimentarios: función y regulación",
          "content": "Los aditivos alimentarios están regulados por la NOM-051-SCFI/SSA1-2010 (etiquetado de alimentos). Se clasifican por función: conservadores (inhiben microbios), antioxidantes (evitan oxidación/enranciamiento), emulsionantes (estabilizan emulsiones), colorantes (aspecto visual), saborizantes, edulcorantes. Todos deben aprobarse por COFEPRIS/SSA con dosis máximas establecidas. Los aditivos con código E son la numeración europea, ampliamente usada en México."
        },
        {
          "subtitle": "Polímeros sintéticos: de la petroquímica a la gestión de residuos",
          "content": "Los plásticos se producen por polimerización de monómeros derivados del petróleo. El PET (código 1) se recicla en México en empresas como ALPLA y Coca-Cola FEMSA. El PEAD (código 2) en tuberías y envases. El PVC (código 3) en construcción. El poliestireno expandido (unicel, código 6) es el menos reciclado. México generó 50.9 millones de toneladas de residuos sólidos urbanos en 2021 (INECC); solo el 13% se recicla. La norma NOM-161-SEMARNAT-2011 regula el manejo especial de residuos."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "En una tableta de medicamento, el principio activo es:",
          "options": [
            "La molécula con efecto terapéutico",
            "El excipiente que le da forma a la tableta",
            "El conservador que evita su deterioro",
            "El código que identifica al fabricante"
          ],
          "correct": "La molécula con efecto terapéutico"
        },
        {
          "question": "¿Cuál es la función del benzoato de sodio en los alimentos?",
          "options": [
            "Conservador: inhibe el crecimiento de hongos y bacterias",
            "Colorante: da color amarillo al producto",
            "Emulsionante: mezcla agua y aceite",
            "Edulcorante: reduce las calorías"
          ],
          "correct": "Conservador: inhibe el crecimiento de hongos y bacterias"
        },
        {
          "question": "El código de reciclaje 1 en los envases corresponde al plástico:",
          "options": ["PET", "PEAD", "PVC", "Poliestireno"],
          "correct": "PET"
        }
      ],
      "rubric": "4: Relaciona química orgánica con las tres industrias, analiza etiquetas y argumenta posiciones en el debate ético. 3: Identifica las aplicaciones con errores menores en nomenclatura de aditivos. 2: Reconoce las aplicaciones generales pero no puede analizar etiquetas. 1: No conecta la química orgánica con aplicaciones industriales."
    },
    "teacher_tips": [
      "Traer etiquetas de medicamentos reales (especialmente BIRMEX) hace el tema concreto y con identidad mexicana.",
      "El debate genérico vs patente es políticamente rico — establecer reglas de respeto antes de iniciar.",
      "COFEPRIS y CANIFARMA tienen recursos en línea sobre medicamentos aprobados en México.",
      "Para la conexión ambiental: mostrar el mapa de ríos contaminados por plásticos del INECC."
    ]
  },

  "CNEYT-IV-P07": {
    "code": "CNEYT-IV-P07",
    "title": "Evalúa el impacto de los contaminantes químicos y los plásticos en el ambiente.",
    "level": "CNEYT IV",
    "duration": "~3h (2 sesiones de 50 min)",
    "difficulty": "Intermedio",
    "category": "Química ambiental",
    "metadata": {
      "objective": "Analizar los principales contaminantes químicos (metales pesados, COPs, microplásticos, agroquímicos) y su impacto en ecosistemas y salud humana en México; evaluar políticas públicas y alternativas tecnológicas para su reducción.",
      "competencies": [
        "Identifica los principales contaminantes químicos por tipo y fuente de emisión.",
        "Explica el fenómeno de biomagnificación de contaminantes en cadenas tróficas.",
        "Analiza el ciclo de vida y la fragmentación de los plásticos en microplásticos.",
        "Evalúa la efectividad de políticas mexicanas de reducción de plásticos de un solo uso (Ley General de Residuos)."
      ],
      "materials": [
        "Mapa de sitios contaminados en México: Laguna de Chapala (mercurio), Valle del Mezquital (aguas residuales), Sonora (derrame minero Buenavista 2014).",
        "Artículo del INECC sobre microplásticos en el Golfo de México.",
        "Muestra de plástico deteriorado al sol (fotodegradación).",
        "Infografía de biomagnificación en la cadena trófica del Golfo de California.",
        "Noticias sobre la prohibición de plásticos de un solo uso en CDMX (2021) y estados."
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "Apertura", "duration": "10 min", "label": "El derrame de Sonora: 40,000 m³ de sulfato de cobre"},
        {"phase": "Desarrollo", "duration": "30 min", "label": "Contaminantes, biomagnificación y microplásticos"},
        {"phase": "Cierre", "duration": "10 min", "label": "Evaluación de políticas de reducción"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA",
          "duration": "10 min",
          "description": "Caso real: derrame minero Buenavista del Cobre (Grupo México, agosto 2014). Río Sonora: 40,000 m³ de solución de sulfato de cobre y sulfato de hierro. 7 municipios afectados; agua no potable por meses. Pregunta: '¿Qué ocurre con el cobre y el arsénico en el río una vez que entran al ecosistema?'",
          "activity": "Los estudiantes trazan el recorrido del contaminante: agua → algas → peces pequeños → peces grandes → aves pescadoras → humanos. Intuición del concepto de biomagnificación antes de definirlo."
        },
        {
          "title": "FASE II: DESARROLLO",
          "duration": "30 min",
          "description": "METALES PESADOS: plomo (Pb), mercurio (Hg), arsénico (As), cadmio (Cd). No biodegradables, se acumulan en tejidos. Caso Hg: planta cloro-sosa de Pemex en Coatzacoalcos → Laguna del Carpintero (INECC). Biomagnificación: el contaminante aumenta su concentración en cada nivel trófico. DDT en pelícanos del Golfo de California: niveles 10 millones de veces superiores al agua. COPs (Contaminantes Orgánicos Persistentes): PCBs (transformadores eléctricos viejos), DDT (plaguicida hoy prohibido NOM-232-SSA1-2009). MICROPLÁSTICOS: fragmentos < 5 mm generados por fotodegradación UV de plásticos. Se detectan en la Corriente del Golfo, Golfo de México (INECC, 2022), agua de grifo, sal de mar, peces comerciales y sangre humana. Tiempo de degradación: bolsa plástica 20 años; botella PET 450 años. AGROQUÍMICOS: herbicidas (glifosato) y pesticidas organofosforados. México importa 120,000 ton/año de plaguicidas (SEMARNAT). Riesgo para polinizadores (abejas) y suelos agrícolas.",
          "activity": "Análisis de caso: el Valle del Mezquital (Hidalgo) riega con aguas residuales de CDMX desde hace 100 años. INECC reporta acumulación de metales pesados en suelo y hortaliza. ¿Es seguro el alimento? Debate basado en evidencia."
        },
        {
          "title": "FASE III: CIERRE",
          "duration": "10 min",
          "description": "Políticas en México: CDMX prohibió bolsas plásticas de un solo uso (2020); 19 estados tienen leyes similares. Ley General para la Prevención y Gestión Integral de los Residuos (LGPGIR). Límites: falta de infraestructura de reciclaje, falta de alternativas accesibles para población de bajos ingresos.",
          "activity": "Propuesta de política local: en equipos, los estudiantes diseñan una política escolar para reducir plásticos de un solo uso en su plantel, con metas SMART, costo y beneficio estimado."
        }
      ]
    },
    "theory": {
      "introduction": "México es uno de los países con mayor biodiversidad del mundo (CONABIO), pero también uno de los más afectados por contaminación química industrial y agropecuaria. El INECC y la SEMARNAT monitorean más de 200 sustancias prioritarias. La comprensión química de los contaminantes es la base para diseñar soluciones efectivas.",
      "sections": [
        {
          "subtitle": "Metales pesados y biomagnificación",
          "content": "Los metales pesados (Pb, Hg, Cd, As, Cr) son tóxicos a bajas concentraciones porque interfieren con enzimas metálicas (reemplazan el ion metálico funcional). La bioacumulación es la acumulación en un organismo individual; la biomagnificación es el aumento de concentración a lo largo de la cadena trófica. Ejemplo clásico: mercurio en el atún (CH₃Hg⁺, metilmercurio) — la FDA de EE.UU. y la COFEPRIS limitan el consumo semanal para embarazadas."
        },
        {
          "subtitle": "Microplásticos: el contaminante ubicuo",
          "content": "Los plásticos no se biodegradan: se fragmentan por acción UV (fotodegradación) en partículas cada vez menores. Microplásticos (1 µm - 5 mm) y nanoplásticos (<1 µm). Se detectan en: sedimentos del Golfo de México, agua de lluvia en zonas remotas, sal de mesa, cerveza, sangre humana (estudio The Lancet, 2022). Su impacto biológico: inflamación, disrupción endocrina (sustancias plastificantes como ftalatos y BPA). La SEMARNAT no tiene aún regulación específica sobre microplásticos."
        },
        {
          "subtitle": "Soluciones: química verde y economía circular",
          "content": "La química verde (Green Chemistry, Anastas-Warner, 12 principios) busca diseñar procesos que prevengan contaminación en lugar de remediarla. Bioplásticos (PLA a partir de maíz): biodegradables en condiciones industriales. Economía circular: reducir → reutilizar → reciclar → recuperar energía → disposición final. En México: Recología, Quimica Delta y ALPLA desarrollan reciclaje de PET a fibra textil. La CONAHCYT financia investigación sobre materiales biodegradables derivados del nopal (empresa GreenMind en Guadalajara)."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "La biomagnificación se refiere a:",
          "options": [
            "El aumento de concentración de un contaminante en los niveles superiores de la cadena trófica",
            "La degradación de contaminantes por bacterias del suelo",
            "La dilución de contaminantes en cuerpos de agua grandes",
            "La acumulación de contaminantes en un solo organismo"
          ],
          "correct": "El aumento de concentración de un contaminante en los niveles superiores de la cadena trófica"
        },
        {
          "question": "¿Qué son los microplásticos?",
          "options": [
            "Fragmentos de plástico menores a 5 mm generados por la degradación UV",
            "Plásticos biodegradables de origen vegetal",
            "Aditivos plásticos usados en medicamentos",
            "Plásticos reciclados de alta densidad"
          ],
          "correct": "Fragmentos de plástico menores a 5 mm generados por la degradación UV"
        },
        {
          "question": "¿Cuál fue el principal contaminante del derrame en el Río Sonora (2014)?",
          "options": [
            "Sulfato de cobre y arsénico de la minería",
            "Petróleo crudo de un oleoducto de PEMEX",
            "Aguas residuales domésticas de Hermosillo",
            "Plaguicidas de cultivos de trigo"
          ],
          "correct": "Sulfato de cobre y arsénico de la minería"
        }
      ],
      "rubric": "4: Analiza casos reales de contaminación, explica biomagnificación y microplásticos y evalúa políticas con evidencia. 3: Describe correctamente los tipos de contaminantes y sus efectos con errores menores. 2: Identifica los contaminantes pero no explica biomagnificación ni microplásticos. 1: Confunde tipos de contaminantes o no identifica fuentes."
    },
    "teacher_tips": [
      "El caso del derrame de Río Sonora (2014) es un escándalo bien documentado — usar el reporte del INECC disponible en línea.",
      "La detección de microplásticos en sangre humana (publicada en 2022) impacta mucho a los estudiantes — traer el dato.",
      "Para la propuesta SMART de política escolar: dar formato estructurado para evitar propuestas vagas.",
      "Conectar con el movimiento de ecologistas comunitarios de Sonora — caso de la defensora ambiental Yolanda Aguilar y la comunidad yaqui."
    ]
  },

  "CNEYT-IV-P08": {
    "code": "CNEYT-IV-P08",
    "title": "Diseña y realiza experimentos sencillos de química con materiales accesibles.",
    "level": "CNEYT IV",
    "duration": "~4h (3 sesiones de ~80 min total)",
    "difficulty": "Intermedio",
    "category": "Metodología científica experimental",
    "metadata": {
      "objective": "Aplicar el método científico para diseñar, realizar, registrar y comunicar un experimento de química usando materiales cotidianos; desarrollar habilidades de seguridad en el laboratorio, observación sistemática y análisis de resultados con referencia a las progresiones anteriores del semestre.",
      "competencies": [
        "Formula una hipótesis verificable y diseña el procedimiento experimental para probarla.",
        "Aplica normas de seguridad en el laboratorio (NOM-018-STPS-2015 sobre sustancias químicas peligrosas).",
        "Registra observaciones cuantitativas y cualitativas en una bitácora de laboratorio.",
        "Analiza resultados, identifica fuentes de error y comunica conclusiones con vocabulario químico preciso."
      ],
      "materials": [
        "Por equipo: vinagre (ácido acético 5%), bicarbonato de sodio, agua destilada, sal de mesa, leche, aceite vegetal.",
        "Utensilios: vasos de precipitados (o vasos de vidrio), cucharas, jeringas de 10 mL, balanza de cocina.",
        "Papel indicador de pH o jugo de repollo morado como indicador.",
        "Bitácora de laboratorio (formato estructurado: hipótesis, procedimiento, observaciones, análisis, conclusiones).",
        "Normas de seguridad básicas impresas."
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "Apertura", "duration": "15 min", "label": "Seguridad y diseño experimental"},
        {"phase": "Desarrollo", "duration": "50 min", "label": "Realización del experimento elegido"},
        {"phase": "Cierre", "duration": "15 min", "label": "Socialización y comunicación de resultados"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA",
          "duration": "15 min",
          "description": "Revisión de normas de seguridad: nunca probar sustancias, usar bata y gafas cuando sea necesario, identificar los pictogramas de peligro (NOM-018-STPS-2015: explosivo, inflamable, corrosivo, tóxico). El método científico como guía: observación → pregunta → hipótesis → experimento → análisis → conclusión → comunicación.",
          "activity": "Cada equipo elige uno de tres proyectos: (A) ¿El tipo de ácido afecta la velocidad de reacción con bicarbonato? (vinagre vs jugo de limón vs refresco). (B) ¿La temperatura del agua afecta la velocidad de disolución de sal? (fría, ambiente, caliente). (C) ¿Cómo varía el pH de mezclas ácido-base en proporciones diferentes? Formulan hipótesis y diseñan el procedimiento."
        },
        {
          "title": "FASE II: DESARROLLO",
          "duration": "50 min",
          "description": "Realización del experimento seleccionado. El docente circula por los equipos verificando seguridad, precisión de mediciones y registro sistemático. Los estudiantes documentan cada paso en la bitácora con tiempos, cantidades y observaciones (cambios de color, efervescencia, temperatura, precipitados).",
          "activity": "Durante el experimento: registrar al menos 5 observaciones cuantitativas (con unidades) y 5 cualitativas. Identificar variables: independiente (la que el equipo controla), dependiente (la que miden), controladas (las que mantienen constante). Al terminar: limpiar el área y disponer los residuos correctamente."
        },
        {
          "title": "FASE III: CIERRE",
          "duration": "15 min",
          "description": "Cada equipo presenta en 3 minutos: hipótesis, procedimiento resumido, resultados clave y conclusión. El grupo hace preguntas. Se discute si la hipótesis fue confirmada, rechazada o parcialmente apoyada.",
          "activity": "Metacognición: ¿qué salió diferente de lo esperado? ¿Cuáles fueron las fuentes de error? ¿Cómo mejorarías el diseño? Conexión: ¿cuál de las progresiones del semestre se aplica en tu experimento? (balanceo: P01, tipos de reacción: P02, pH: P03)"
        }
      ]
    },
    "theory": {
      "introduction": "El experimento es el corazón de las ciencias naturales. Cada descubrimiento químico que hoy usamos — desde el ácido acetilsalicílico hasta la vacuna COVID — comenzó con un experimento cuidadosamente diseñado. Las normas de seguridad en laboratorio (STPS, SEP) protegen a estudiantes y docentes mientras desarrollan competencias científicas esenciales.",
      "sections": [
        {
          "subtitle": "El método científico en química",
          "content": "El ciclo científico: (1) Observación de un fenómeno. (2) Pregunta de investigación (¿cómo afecta X a Y?). (3) Hipótesis: predicción fundamentada ('Si X aumenta, entonces Y disminuirá porque...'). (4) Diseño experimental: definir variables, controles, número de repeticiones. (5) Recolección de datos: cuantitativos (masa, volumen, temperatura, tiempo) y cualitativos (color, olor, textura). (6) Análisis: tablas, gráficas, cálculo de promedios. (7) Conclusión: ¿la evidencia apoya la hipótesis? (8) Comunicación: informe de laboratorio."
        },
        {
          "subtitle": "Seguridad en el laboratorio",
          "content": "Pictogramas GHS (Sistema Globalmente Armonizado, NOM-018-STPS-2015): llama (inflamable), calavera (tóxico agudo), signo de exclamación (irritante), corrosión (corrosivo), peligro para la salud (sensibilizante). Reglas básicas: (1) No comer ni beber en el laboratorio. (2) Conocer la ubicación de la regadera de emergencia, lavaojos y extintor. (3) Pipetear con pera, nunca con la boca. (4) Agregar ácido al agua, nunca al revés. (5) Etiquetar todos los recipientes."
        },
        {
          "subtitle": "Variables y control experimental",
          "content": "Variable independiente: la que el investigador manipula deliberadamente (p.ej., tipo de ácido). Variable dependiente: la que se mide como resultado (p.ej., volumen de CO₂ producido). Variables controladas: todas las demás que se mantienen constantes (p.ej., cantidad de bicarbonato, temperatura, volumen de ácido). El grupo control: condición sin la variable independiente que sirve como referencia. La repetición (mínimo 3 veces) reduce el error aleatorio."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "En un experimento donde se prueba si la temperatura afecta la velocidad de disolución del azúcar, la variable independiente es:",
          "options": [
            "La temperatura del agua",
            "El tiempo que tarda en disolverse el azúcar",
            "La cantidad de azúcar usada",
            "El tipo de recipiente"
          ],
          "correct": "La temperatura del agua"
        },
        {
          "question": "Según la norma NOM-018-STPS-2015, el pictograma de una calavera con dos huesos cruzados indica:",
          "options": [
            "Toxicidad aguda",
            "Inflamabilidad",
            "Corrosividad",
            "Riesgo para el medio ambiente"
          ],
          "correct": "Toxicidad aguda"
        },
        {
          "question": "Una hipótesis científica correctamente formulada debe ser:",
          "options": [
            "Verificable mediante observación o experimento",
            "Una certeza absoluta basada en opinión",
            "Una pregunta sobre el fenómeno",
            "Una conclusión ya demostrada"
          ],
          "correct": "Verificable mediante observación o experimento"
        }
      ],
      "rubric": "4: Diseña un experimento completo con variables bien identificadas, registra datos sistemáticamente, analiza resultados y comunica conclusiones con evidencia. 3: Diseña y realiza el experimento con apoyo; registro y análisis con errores menores. 2: Sigue el procedimiento pero no identifica claramente las variables ni fuentes de error. 1: No distingue hipótesis de conclusión o no registra datos."
    },
    "teacher_tips": [
      "Los tres proyectos propuestos (A, B, C) son flexibles — el docente puede adaptarlos a los materiales disponibles en el plantel.",
      "La bitácora de laboratorio puede usarse como portafolio de evidencias del semestre completo.",
      "Para escuelas sin laboratorio: todos los experimentos son realizables en el aula con materiales de cocina.",
      "Conectar con el proyecto integrador de P08 del semestre anterior: los estudiantes con experiencia previa en investigación pueden ser mentores del equipo."
    ]
  }
}

with open(OUT, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Written {len(data)} progressions to {OUT}")
