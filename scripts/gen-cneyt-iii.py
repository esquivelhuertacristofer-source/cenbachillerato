"""Generate src/data/planteamiento/cneyt-iii.json — CNEYT Semestre 3 (8 progresiones)."""
import json, pathlib

OUT = pathlib.Path(__file__).parent.parent / "src" / "data" / "planteamiento" / "cneyt-iii.json"

data = {
  "CNEYT-III-P01": {
    "code": "CNEYT-III-P01",
    "title": "Describe los componentes y caracteristicas de los principales ecosistemas de Mexico",
    "level": "Ciencias Naturales, Experimentales y Tecnologia III",
    "duration": "~3h (2 sesiones de 50 min)",
    "difficulty": "Basico",
    "category": "Ecologia",
    "metadata": {
      "objective": "Identificar y describir los componentes bioticos y abioticos de los principales ecosistemas de Mexico (selva, bosque, desierto, humedal, manglar, arrecife), reconociendo la biodiversidad mexicana como patrimonio mundial.",
      "competencies": [
        "Distingue componentes bioticos (productores, consumidores, descomponedores) de abioticos (temperatura, luz, agua, suelo)",
        "Identifica las caracteristicas climaticas y biologicas de al menos cuatro ecosistemas mexicanos",
        "Relaciona cada ecosistema con las regiones geograficas de Mexico usando el mapa de la CONABIO",
        "Reconoce que Mexico es un pais megadiverso: 12% de la biodiversidad mundial (CONABIO)",
        "Valora la importancia de los servicios ecosistemicos para las comunidades humanas"
      ],
      "materials": [
        "Mapa de ecosistemas de Mexico (CONABIO, descargable en conabio.gob.mx)",
        "Tarjetas con fotografias de 6 ecosistemas mexicanos",
        "Fichas informativas por ecosistema (selva Lacandona, Desierto Chihuahuense, Arrecife Mesoamericano)",
        "Video corto: La biodiversidad de Mexico (CONABIO, YouTube)",
        "Cuadro comparativo en blanco para completar"
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "S1", "duration": "50 min", "label": "Exploracion de ecosistemas: componentes bioticos y abioticos"},
        {"phase": "S2", "duration": "50 min", "label": "Megadiversidad mexicana y servicios ecosistemicos"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA",
          "duration": "10 min",
          "description": "Activar conocimientos previos sobre el concepto de ecosistema y la biodiversidad de Mexico.",
          "activity": "El docente muestra el mapa de ecosistemas de Mexico (CONABIO) y pregunta: cuantos tipos de ecosistemas diferentes pueden contar? En cual viven ustedes? Que animales y plantas conocen de su region?"
        },
        {
          "title": "FASE II: DESARROLLO",
          "duration": "30 min",
          "description": "Analisis sistematico de 6 ecosistemas mexicanos usando tarjetas informativas; construccion de cuadro comparativo.",
          "activity": "S1: En equipos, cada uno recibe las tarjetas de un ecosistema (selva Lacandona en Chiapas, Desierto Chihuahuense, bosque de pino-encino de la Sierra Madre, manglar de Campeche, humedales de Ramsar en Yucatan, Arrecife Mesoamericano). Identifican componentes bioticos y abioticos y completan el cuadro comparativo. S2: Presentacion por equipos + video CONABIO sobre megadiversidad. El docente introduce el concepto de servicios ecosistemicos: provision (alimentos, agua), regulacion (clima, purificacion), culturales (turismo, identidad), soporte (ciclado de nutrientes)."
        },
        {
          "title": "FASE III: CIERRE",
          "duration": "10 min",
          "description": "Reflexion sobre la responsabilidad de vivir en un pais megadiverso.",
          "activity": "Cada estudiante escribe en media pagina: cual ecosistema les parecio mas sorprendente y por que? Como afecta la perdida de ese ecosistema a las personas?"
        }
      ]
    },
    "theory": {
      "introduction": "Un ecosistema es el conjunto de organismos vivos (componente biotico) y su entorno fisico (componente abiotico) que interactuan en un territorio determinado. Mexico es reconocido como uno de los 17 paises megadiversos del mundo: alberga aproximadamente el 12% de la biodiversidad terrestre global, incluyendo mas de 23,000 especies de plantas vasculares, 1,150 especies de aves y 717 especies de reptiles, segun la CONABIO.",
      "sections": [
        {
          "subtitle": "Componentes bioticos y abioticos",
          "content": "Bioticos: organismos vivos clasificados en productores (plantas y algas que realizan fotosintesis), consumidores primarios (herbivoros), consumidores secundarios (carnivoros), consumidores terciarios (superdepredadores) y descomponedores (hongos y bacterias que reciclan materia organica). Abioticos: factores fisicos y quimicos como temperatura, luminosidad, precipitacion, pH del suelo, salinidad, tipo de roca y relieve."
        },
        {
          "subtitle": "Principales ecosistemas de Mexico",
          "content": "Selva tropical humeda (Lacandona, Chiapas y Oaxaca): >2000 mm precipitacion/anio, mayor biodiversidad por unidad de area. Bosque templado de pino-encino (Sierra Madre Occidental y Oriental): cubre aprox 16% del territorio. Desierto Chihuahuense: el mas grande de America del Norte (362,000 km2), hogar del agave, nopal y vibora de cascabel. Manglares: Mexico tiene aprox 770,000 ha de manglares (CONABIO), vitales como vivero de peces. Arrecife Mesoamericano: el segundo mas grande del mundo, en el Caribe mexicano."
        },
        {
          "subtitle": "Megadiversidad y endemismo",
          "content": "Mexico es megadiverso porque su posicion geografica lo hace zona de confluencia de dos grandes regiones biogeograficas (Neartica y Neotropical) y dos oceanos. El endemismo es muy alto: aprox 53% de las reptiles, 43% de los anfibios y 52% de las plantas con flor son endemicas (solo existen en Mexico). Las Islas del Pacifico (Guadalupe, Revillagigedo) tienen ecosistemas insulares unicos."
        },
        {
          "subtitle": "Servicios ecosistemicos",
          "content": "Los ecosistemas proporcionan servicios esenciales sin los cuales la vida humana seria imposible. Provision: alimentos (maiz, frijol, aguacate tienen su origen en ecosistemas mexicanos), agua dulce, materiales de construccion. Regulacion: los manglares protegen las costas de huracanes; los bosques regulan el ciclo del agua y el clima local. Soporte: el suelo fértil depende de los descomponedores del ecosistema. Culturales: el turismo a ecosistemas naturales genera ingresos: el arrecife de Cozumel atrae mas de 1 millon de visitantes al anio (SECTUR)."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "Cual de los siguientes es un componente ABIOTICO de un ecosistema?",
          "options": ["La temperatura del ambiente", "El aguila real", "El nopal", "Los hongos descomponedores"],
          "correct": "La temperatura del ambiente"
        },
        {
          "question": "Mexico es considerado pais megadiverso porque:",
          "options": ["Alberga aprox el 12% de la biodiversidad mundial", "Tiene el mayor numero de habitantes de America", "Produce el mayor volumen de petroleo de America Latina", "Tiene la mayor superficie forestal del mundo"],
          "correct": "Alberga aprox el 12% de la biodiversidad mundial"
        },
        {
          "question": "Los manglares son un ejemplo de servicio ecosistemico de:",
          "options": ["Regulacion (proteccion costera ante huracanes)", "Provision de petroleo", "Soporte de telecomunicaciones", "Cultural de entretenimiento urbano"],
          "correct": "Regulacion (proteccion costera ante huracanes)"
        },
        {
          "question": "El Desierto Chihuahuense se caracteriza por:",
          "options": ["Ser el mas grande de America del Norte con aprox 362,000 km2", "Tener mas de 2000 mm de precipitacion anual", "Estar ubicado en la Peninsula de Yucatan", "Ser un ecosistema marino"],
          "correct": "Ser el mas grande de America del Norte con aprox 362,000 km2"
        }
      ],
      "rubric": "Nivel 4: Describe con precision al menos 5 ecosistemas, identifica todos los componentes bioticos y abioticos, y argumenta la importancia de los servicios ecosistemicos con ejemplos mexicanos especificos; Nivel 3: Describe correctamente 4 ecosistemas e identifica la mayoria de los componentes; Nivel 2: Distingue biotico de abiotico pero confunde ecosistemas o no los ubica geograficamente; Nivel 1: No distingue biotico de abiotico o no identifica ecosistemas mexicanos."
    },
    "teacher_tips": [
      "Descargar previamente el mapa de uso de suelo y vegetacion de la CONABIO (conabio.gob.mx) para tener el recurso disponible sin depender de internet en el salon.",
      "Si el plantel esta en zona urbana, complementar con una visita virtual: los recorridos 360 de la Reserva de la Biosfera de Calakmul estan disponibles en el sitio de CONANP.",
      "Relacionar con la experiencia local: si el plantel esta en zona serrana, costera o desertica, comenzar con el ecosistema que los estudiantes habitan y que conocen por experiencia propia.",
      "Conexion con CD-III: el mapa interactivo de biodiversidad de la CONABIO es un excelente ejemplo de datos geograficos digitales que los estudiantes pueden explorar."
    ]
  },

  "CNEYT-III-P02": {
    "code": "CNEYT-III-P02",
    "title": "Explica el flujo de energia y el ciclo de materia en los ecosistemas",
    "level": "Ciencias Naturales, Experimentales y Tecnologia III",
    "duration": "~3h (2 sesiones de 50 min)",
    "difficulty": "Intermedio",
    "category": "Ecologia",
    "metadata": {
      "objective": "Representar el flujo unidireccional de energia y el ciclo de la materia en los ecosistemas mediante cadenas y redes trooficas, analizando las implicaciones de la perdida de biodiversidad en estos procesos con ejemplos de ecosistemas mexicanos.",
      "competencies": [
        "Construye cadenas troficas de al menos cuatro eslabones con organismos de ecosistemas mexicanos",
        "Distingue el flujo unidireccional de energia del ciclo ciclico de la materia",
        "Interpreta una red trofica y predice que ocurriria si desapareciera un eslabon",
        "Aplica la regla del 10% de transferencia de energia entre niveles troficos",
        "Relaciona la perdida de especies clave (lobo, jaguarundi, mariposa monarca) con la desestabilizacion de redes troficas"
      ],
      "materials": [
        "Tarjetas con organismos de la selva Lacandona (CONABIO)",
        "Hilo o estambre para conectar las tarjetas en red trofica",
        "Calculadora para la regla del 10%",
        "Imagen de la piramide ecologica (energia, biomasa, numero)",
        "Ficha: La mariposa Monarca y su red trofica en los bosques de Michoacan"
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "S1", "duration": "50 min", "label": "Cadenas y redes troficas con organismos mexicanos"},
        {"phase": "S2", "duration": "50 min", "label": "Piramide ecologica, regla del 10% y especies clave"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA",
          "duration": "10 min",
          "description": "Activar el concepto intuitivo de quien come a quien; conectar con las relaciones de depredacion en ecosistemas conocidos.",
          "activity": "El docente pregunta: si desaparece el aguila real de un ecosistema de pastizal, que le pasaria a las serpientes? y a los ratones? Los estudiantes predicen con sus conocimientos previos y el docente introduce el concepto de cascada trofica."
        },
        {
          "title": "FASE II: DESARROLLO",
          "duration": "30 min",
          "description": "Construccion de red trofica con tarjetas y estambre; calculo de transferencia de energia; analisis de especie clave.",
          "activity": "S1: En equipos, reciben tarjetas de 10 organismos de la selva Lacandona (puma, jaguar, tejon, loro, abejas, flores, arboles, hongos, mariposas, ratones). Construyen la red trofica con estambre; identifican productores, consumidores de cada nivel y descomponedores. El docente retira una tarjeta: el jaguar. Que estambres quedan sueltos? Que pasa con las presas del jaguar? S2: Piramide de energia con la regla del 10%: si los productores tienen 100,000 kcal disponibles, los herbivoros reciben 10,000 kcal, los carnivoros primarios 1,000 kcal, los carnivoros secundarios solo 100 kcal. Calculo en equipos. Caso especial: la mariposa Monarca en los bosques de oyamel de Michoacan (CONANP): transporte de nutrientes desde Canada hasta Mexico."
        },
        {
          "title": "FASE III: CIERRE",
          "duration": "10 min",
          "description": "Reflexion sobre la interdependencia de las especies y por que importa conservar cada uno.",
          "activity": "Ticket de salida: dibuja una cadena trofica de 4 eslabones de tu region y explica que pasaria si el tercer eslabon desapareciera."
        }
      ]
    },
    "theory": {
      "introduction": "En un ecosistema, la energia fluye de manera unidireccional: desde los productores hacia los consumidores y eventualmente se disipa como calor. La materia, en cambio, se recicla continuamente a traves de los ciclos biogeoquimicos. La comprension de estos flujos es fundamental para entender por que la perdida de biodiversidad tiene consecuencias sistemicas: la desaparicion de una especie puede desestabilizar toda la red trofica.",
      "sections": [
        {
          "subtitle": "Cadenas y redes troficas",
          "content": "Una cadena trofica es una secuencia lineal de quien consume a quien: hierba -> chapulin -> lagartija -> aguila. En un ecosistema real, los organismos forman una red trofica donde muchas cadenas se interconectan. Los niveles troficos son: Nivel 1 = productores (plantas, algas con fotosintesis); Nivel 2 = consumidores primarios (herbivoros); Nivel 3 = consumidores secundarios; Nivel 4 = consumidores terciarios; Descomponedores (hongos, bacterias) actuan en todos los niveles."
        },
        {
          "subtitle": "Flujo de energia y regla del 10%",
          "content": "La energia fluye en un solo sentido: del Sol a los productores, luego a los consumidores. En cada transferencia se pierde aproximadamente el 90% de la energia como calor metabolico; solo el 10% se incorpora a la biomasa del siguiente nivel. Esta regla explica por que las piramides ecologicas tienen base amplia y apex estrecho, y por que los grandes carnivoros son escasos: necesitan enormes territorios para obtener la energia que requieren."
        },
        {
          "subtitle": "Ciclo de la materia vs flujo de energia",
          "content": "A diferencia de la energia, los elementos quimicos (carbono, nitrogeno, fosforo, agua) se reciclan: pasan de los organismos al suelo/agua/aire y de regreso a los organismos. Los descomponedores son clave en este reciclaje. Sin descomposicion, la materia organica se acumularia y los nutrientes quedarian inmovilizados, haciendo imposible la vida."
        },
        {
          "subtitle": "Especies clave y cascadas troficas en Mexico",
          "content": "Una especie clave tiene un impacto en el ecosistema desproporcionado respecto a su abundancia. En Mexico, el jaguar (Panthera onca) regula las poblaciones de herbivoros grandes en la selva; sin el, la sobrexploracion de la vegetacion alteraria el ecosistema. La mariposa Monarca (Danaus plexippus) es polinizadora y transporta nutrientes entre Canada, EUA y Mexico; su ruta migratoria de mas de 4,500 km termina en los bosques de oyamel de Michoacan y Estado de Mexico (Reserva de la Biosfera Mariposa Monarca, CONANP). La CONABIO estima que el jaguar ocupa actualmente solo el 46% de su distribucion historica en Mexico."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "En una cadena trofica, cual organismo ocupa el primer nivel trofico?",
          "options": ["Los productores (plantas con fotosintesis)", "Los carnivoros secundarios", "Los descomponedores", "Los herbivoros"],
          "correct": "Los productores (plantas con fotosintesis)"
        },
        {
          "question": "Si los productores de un ecosistema tienen 10,000 kcal disponibles, cuantas kcal reciben los consumidores secundarios aplicando la regla del 10%?",
          "options": ["100 kcal", "1,000 kcal", "10 kcal", "500 kcal"],
          "correct": "100 kcal"
        },
        {
          "question": "La diferencia principal entre el flujo de energia y el ciclo de la materia es que:",
          "options": ["La energia fluye en una sola direccion y se disipa; la materia se recicla", "Ambos fluyen en una sola direccion", "La materia se pierde como calor; la energia se recicla", "No hay diferencia entre ambos"],
          "correct": "La energia fluye en una sola direccion y se disipa; la materia se recicla"
        },
        {
          "question": "La mariposa Monarca en Mexico es un ejemplo de:",
          "options": ["Especie migratoria polinizadora con ruta de mas de 4,500 km", "Especie endemica que solo vive en Oaxaca", "Depredador tope del bosque tropical", "Especie invasora que afecta los ecosistemas"],
          "correct": "Especie migratoria polinizadora con ruta de mas de 4,500 km"
        }
      ],
      "rubric": "Nivel 4: Construye redes troficas complejas, aplica correctamente la regla del 10%, explica cascadas troficas con ejemplos de Mexico y argumenta la importancia de especies clave; Nivel 3: Construye cadenas de 4 eslabones y aplica la regla del 10% sin errores; Nivel 2: Construye cadenas simples pero no aplica correctamente la regla del 10% o no distingue flujo de energia del ciclo de materia; Nivel 1: Confunde los niveles troficos o no construye una cadena coherente."
    },
    "teacher_tips": [
      "La actividad de la red con estambre es muy impactante visualmente: al retirar una tarjeta (especie) el estambre cae y los estudiantes ven fisicamente la cascada de efectos.",
      "Usar el ejemplo de la Reserva de la Biosfera Mariposa Monarca: los datos de superficie de colonias de mariposas publicados por el WWF Mexico y CONANP cada noviembre son excelentes para introducir monitoreo cientifico.",
      "Para la regla del 10%, usar ejemplos con numeros redondos primero (1,000,000 kcal -> 100,000 -> 10,000 -> 1,000) antes de pasar a calculos con el dato real.",
      "Actividad extension: investigar por que la perdida del lobo (Canis lupus baileyi, en peligro critico en Mexico) en el norte del pais genero sobrepoblacion de venados y sobrepastoreo."
    ]
  },

  "CNEYT-III-P03": {
    "code": "CNEYT-III-P03",
    "title": "Analiza la fotosintesis como proceso fundamental de transformacion de energia en los ecosistemas",
    "level": "Ciencias Naturales, Experimentales y Tecnologia III",
    "duration": "~3h (2 sesiones de 50 min)",
    "difficulty": "Intermedio",
    "category": "Biologia",
    "metadata": {
      "objective": "Describir las etapas de la fotosintesis (reacciones de la luz y ciclo de Calvin), identificar los factores que la afectan y relacionarla con la produccion primaria de los ecosistemas y la base de la cadena alimentaria.",
      "competencies": [
        "Escribe y lee la ecuacion general de la fotosintesis: 6CO2 + 6H2O + luz -> C6H12O6 + 6O2",
        "Distingue las reacciones dependientes de la luz (fotolisis, ATP, NADPH) de las independientes (ciclo de Calvin, glucosa)",
        "Identifica los factores que afectan la tasa de fotosintesis: intensidad luminosa, concentracion de CO2, temperatura",
        "Relaciona la fotosintesis con la produccion primaria bruta de los ecosistemas",
        "Diseña y realiza un experimento sencillo para observar la produccion de oxigeno en plantas acuaticas"
      ],
      "materials": [
        "Planta acuatica Elodea o espinaca cortada en trozos",
        "Lamp a de luz, vaso de precipitado, jeringa, bicarbonato de sodio",
        "Cronometro",
        "Hoja de registro de burbujas de O2 por minuto a distintas intensidades de luz",
        "Infografia: Fotosintesis vs Respiracion celular"
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "S1", "duration": "50 min", "label": "Ecuacion de la fotosintesis y experimento de Elodea"},
        {"phase": "S2", "duration": "50 min", "label": "Etapas moleculares y factores limitantes"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA",
          "duration": "10 min",
          "description": "Conectar la fotosintesis con el problema energetico: de donde viene la energia de la comida?",
          "activity": "El docente pregunta: cuando comes una tortilla de maiz, de donde vino la energia que consumiras? Traza la cadena hacia atras: tu -> tortilla -> maiz -> luz solar. La fotosintesis es el paso clave que transforma energia luminosa en energia quimica almacenada en glucosa."
        },
        {
          "title": "FASE II: DESARROLLO",
          "duration": "30 min",
          "description": "S1: experimento de produccion de O2 con Elodea/espinaca. S2: analisis de las dos etapas y factores limitantes.",
          "activity": "S1-Experimento: se coloca una ramita de Elodea (o discos de espinaca tratados con jeringa para eliminar el aire) en agua con bicarbonato de sodio (fuente de CO2). Se ilumina a distintas distancias (10 cm, 20 cm, 30 cm) y se cuenta el numero de burbujas de O2 por minuto. Los estudiantes grafican: distancia a la luz vs burbujas/min. S2: Con la infografia, el docente explica las dos etapas: Fase luminosa (en membranas tilacoidales del cloroplasto): captura de fotones -> fotolisis del agua -> produccion de ATP y NADPH + liberacion de O2. Ciclo de Calvin (en el estroma): CO2 + ATP + NADPH -> glucosa. Factores limitantes: si falta luz, CO2 o temperatura optima, la fotosintesis disminuye."
        },
        {
          "title": "FASE III: CIERRE",
          "duration": "10 min",
          "description": "Sintesis y conexion con la produccion primaria de ecosistemas.",
          "activity": "El docente pregunta: por que los fondos oceanicos sin luz no tienen plantas? Por que la selva Lacandona es el ecosistema mas productivo de Mexico? Los estudiantes conectan intensidad luminosa y temperatura con la distribucion de ecosistemas."
        }
      ]
    },
    "theory": {
      "introduction": "La fotosintesis es el proceso mediante el cual los organismos fotosinteticos (plantas, algas y algunas bacterias) convierten energia luminosa en energia quimica almacenada en glucosa, usando dioxido de carbono y agua como materias primas. Este proceso es la base de casi toda la vida en la Tierra: sin fotosintesis no habria oxigeno en la atmosfera ni materia organica en las cadenas troficas. La ecuacion global es: 6CO2 + 6H2O + energia luminosa -> C6H12O6 + 6O2.",
      "sections": [
        {
          "subtitle": "Fase luminosa: captura de energia",
          "content": "Ocurre en las membranas de los tilacoides del cloroplasto. Los fotosistemas I y II capturan fotones de luz. El agua se descompone (fotolisis): 2H2O -> 4H+ + 4e- + O2. El oxigeno liberado sale como gas (el que respiramos proviene de la fotolisis del agua). La energia de los electrones genera ATP (adenosin trifosfato) y NADPH, las monedas energeticas de la celula."
        },
        {
          "subtitle": "Ciclo de Calvin: produccion de glucosa",
          "content": "Ocurre en el estroma del cloroplasto. El CO2 atmosferico se fija en moleculas organicas usando el ATP y NADPH de la fase luminosa. El resultado final es la glucosa (C6H12O6), que la planta usa para crecer, reproducirse y almacenar energia. Este ciclo fue descrito por Melvin Calvin (Premio Nobel 1961) y por eso lleva su nombre."
        },
        {
          "subtitle": "Factores que afectan la tasa de fotosintesis",
          "content": "Intensidad luminosa: a mayor luz, mayor fotosintesis hasta un punto de saturacion. Concentracion de CO2: mas CO2 aumenta la produccion de glucosa hasta cierto limite. Temperatura: hay una temperatura optima (aprox 25-35 C para la mayoria de las plantas); por encima o por debajo la tasa disminuye. Disponibilidad de agua: la escasez de agua cierra los estomas para evitar la deshidratacion, lo que reduce la entrada de CO2 y frena la fotosintesis."
        },
        {
          "subtitle": "Fotosintesis y produccion primaria en Mexico",
          "content": "La produccion primaria bruta (PPB) es la cantidad total de carbono fijado por la fotosintesis en un ecosistema. En Mexico, la selva Lacandona en Chiapas tiene la mayor PPB por unidad de area, seguida por los manglares de la costa del Golfo. El INECC monitorea la produccion primaria de los ecosistemas mexicanos como indicador de salud ecosistemica y captura de carbono. El maiz (Zea mays), originario de Mexico (domesticado hace aprox 9,000 anios en el Balsas, Guerrero), es uno de los cultivos con mayor produccion primaria global gracias a su eficiencia fotosintetica tipo C4."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "En la ecuacion de la fotosintesis, el oxigeno liberado proviene de:",
          "options": ["La fotolisis del agua", "El ciclo de Calvin", "La descomposicion del CO2", "La respiracion celular"],
          "correct": "La fotolisis del agua"
        },
        {
          "question": "El ciclo de Calvin ocurre en:",
          "options": ["El estroma del cloroplasto", "Las membranas tilacoidales", "La mitocondria", "El nucleo celular"],
          "correct": "El estroma del cloroplasto"
        },
        {
          "question": "Cual de los siguientes factores NO afecta directamente la tasa de fotosintesis?",
          "options": ["La presion atmosferica", "La intensidad luminosa", "La temperatura", "La concentracion de CO2"],
          "correct": "La presion atmosferica"
        },
        {
          "question": "El maiz es un ejemplo de planta con fotosintesis tipo C4, lo que significa que:",
          "options": ["Es mas eficiente que las plantas C3 en condiciones de alta temperatura y luz intensa", "Solo puede crecer en condiciones de poca luz", "No realiza el ciclo de Calvin", "Produce 4 moleculas de glucosa por ciclo"],
          "correct": "Es mas eficiente que las plantas C3 en condiciones de alta temperatura y luz intensa"
        }
      ],
      "rubric": "Nivel 4: Escribe la ecuacion completa, describe las dos etapas con precision molecular, analiza correctamente los datos del experimento de Elodea y conecta la fotosintesis con la produccion primaria de ecosistemas mexicanos; Nivel 3: Describe correctamente las dos etapas e identifica los factores limitantes; Nivel 2: Conoce la ecuacion global pero confunde las etapas o no interpreta el experimento; Nivel 1: No puede escribir la ecuacion de la fotosintesis o confunde con la respiracion."
    },
    "teacher_tips": [
      "El experimento de Elodea puede hacerse con espinaca si no hay acceso a plantas acuaticas: cortar hojas en discos con popote, sumergirlos en agua con bicarbonato y usar una jeringa sin aguja para extraer el aire de los discos hasta que se hundan; luego iluminar y contar los discos que flotan (produccion de O2).",
      "Enfatizar que el O2 que respiramos proviene de la fotosintesis y que sin ella no habria vida en la Tierra.",
      "El maiz, el frijol y el aguacate tienen sus centros de origen en Mexico: usar estos cultivos para valorizar el patrimonio biologico mexicano y conectar con la asignatura de Historia.",
      "Para extension: investigar el programa de carbon azul de manglares en Mexico como captura de CO2 -- conexion con cambio climatico que se desarrollara en P06."
    ]
  },

  "CNEYT-III-P04": {
    "code": "CNEYT-III-P04",
    "title": "Examina los ciclos biogeoquimicos del agua, carbono, nitrogeno y fosforo",
    "level": "Ciencias Naturales, Experimentales y Tecnologia III",
    "duration": "~4h (3 sesiones de 50 min)",
    "difficulty": "Intermedio",
    "category": "Ecologia",
    "metadata": {
      "objective": "Describir y representar los ciclos biogeoquimicos del agua, carbono, nitrogeno y fosforo, identificando como las actividades humanas (emision de gases, deforestacion, agricultura intensiva) alteran estos ciclos en Mexico.",
      "competencies": [
        "Describe las fases del ciclo del agua (evaporacion, condensacion, precipitacion, infiltracion, escorrentia)",
        "Representa el ciclo del carbono identificando reservorios (oceanos, atmosfera, biomasa, suelo) y flujos",
        "Explica el ciclo del nitrogeno: fijacion, nitrificacion, desnitrificacion",
        "Analiza como la deforestacion y la quema de combustibles fosiles alteran el ciclo del carbono en Mexico",
        "Relaciona la eutrofizacion de cuerpos de agua (como el Lago de Chapala, Jalisco) con el exceso de fosforo y nitrogeno"
      ],
      "materials": [
        "Esquemas de los cuatro ciclos para completar (impresion)",
        "Datos: emision de CO2 de Mexico segun INECC (Inventario Nacional de Emisiones 2021)",
        "Ficha del Lago de Chapala (CONAGUA): nivel historico y eutrofizacion",
        "Muestras de suelo con y sin materia organica para comparar",
        "Video corto: El ciclo del agua en Mexico (CONAGUA)"
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "S1", "duration": "50 min", "label": "Ciclo del agua y ciclo del carbono"},
        {"phase": "S2", "duration": "50 min", "label": "Ciclo del nitrogeno y ciclo del fosforo"},
        {"phase": "S3", "duration": "50 min", "label": "Impacto humano en los ciclos: deforestacion y eutrofizacion"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA",
          "duration": "10 min",
          "description": "Conectar la idea de reciclaje fisico con el reciclaje de elementos quimicos en la naturaleza.",
          "activity": "El docente pregunta: el carbono de una tortilla que comiste ayer, donde estuvo antes? Los estudiantes rastrean: tortilla -> planta de maiz -> fotosintesis -> CO2 atmosferico -> emision de volcan/quema/respiracion. Introduccion al concepto de ciclo biogeoquimico."
        },
        {
          "title": "FASE II: DESARROLLO",
          "duration": "30 min",
          "description": "S1: ciclos del agua y carbono con esquemas. S2: ciclos del nitrogeno y fosforo. S3: analisis de alteraciones humanas con datos de Mexico.",
          "activity": "S1: Cada equipo completa el esquema del ciclo del agua (CONAGUA: Mexico tiene 457 acuiferos, 77 sobreexplotados) y del carbono (Mexico emitio 683 millones ton CO2eq en 2021, segun INECC). S2: El ciclo del nitrogeno es el mas complejo: las bacterias fijadoras (Rhizobium en raices de leguminosas como el frijol) convierten N2 del aire en amoniaco; las nitrificadoras convierten amoniaco en nitratos (usables por plantas); las desnitrificadoras regresan N2 al aire. S3: Caso del Lago de Chapala -- eutrofizacion por exceso de fertilizantes agricolas del Bajio: aumento de nitrogeno y fosforo -> floracion de algas -> consumo de oxigeno -> muerte de peces."
        },
        {
          "title": "FASE III: CIERRE",
          "duration": "10 min",
          "description": "Sintesis: los ciclos estan interconectados y son alterados por actividades humanas.",
          "activity": "Mapa mental colectivo en el pizarron: actividad humana -> ciclo alterado -> consecuencia ecosistemica. Ejemplos: deforestacion en Chiapas -> mas CO2 en atmosfera -> cambio climatico. Uso excesivo de fertilizantes -> eutrofizacion -> perdida de biodiversidad acuatica."
        }
      ]
    },
    "theory": {
      "introduction": "Los ciclos biogeoquimicos son los circuitos por los que los elementos quimicos esenciales para la vida (agua, carbono, nitrogeno, fosforo, azufre) circulan entre los seres vivos y el entorno abiotico (atmosfera, hidrosfera, litosfera). A diferencia de la energia que fluye en una sola direccion, los elementos se reciclan continuamente. Las actividades humanas han alterado drasticamente estos ciclos, especialmente desde la Revolucion Industrial.",
      "sections": [
        {
          "subtitle": "Ciclo del agua",
          "content": "El agua se mueve entre la hidrosfera, la atmosfera y los seres vivos. Etapas: evaporacion (el calor solar convierte el agua liquida en vapor); transpiracion (las plantas liberan vapor por los estomas); condensacion (el vapor forma nubes); precipitacion (lluvia, nieve); escorrentia superficial (hacia rios y mares); infiltracion (hacia acuiferos subterraneos). En Mexico, CONAGUA reporta que el 73% del agua disponible proviene de la precipitacion; los 653 acuiferos del pais abastecen el 40% del agua para uso humano."
        },
        {
          "subtitle": "Ciclo del carbono",
          "content": "El carbono circula entre cuatro grandes reservorios: atmosfera (CO2), oceanos (carbonatos disueltos), biomasa terrestre (materia organica viva) y suelo/sedimentos (materia organica muerta, combustibles fosiles). Los flujos principales: fotosintesis (atmosfera -> biomasa), respiracion y descomposicion (biomasa -> atmosfera), quema de combustibles fosiles (suelo/sedimentos -> atmosfera). Mexico emitio 683 millones de toneladas de CO2 equivalente en 2021 (INECC), siendo el sector energetico el mayor contribuyente."
        },
        {
          "subtitle": "Ciclo del nitrogeno",
          "content": "El nitrogeno es fundamental para sintetizar proteinas y ADN. El N2 gaseoso (78% de la atmosfera) no es directamente usable por plantas y animales. Pasos del ciclo: (1) Fijacion: bacterias como Rhizobium (en nodulos de raices de leguminosas como el frijol mexicano) convierten N2 -> NH3. (2) Nitrificacion: bacterias del suelo convierten NH3 -> NO2 -> NO3 (nitratos), usables por plantas. (3) Asimilacion: plantas absorben nitratos para sintetizar aminoacidos. (4) Amoniificacion: los descomponedores degradan proteinas -> NH3. (5) Desnitrificacion: bacterias anaerobias devuelven N2 a la atmosfera."
        },
        {
          "subtitle": "Ciclo del fosforo y eutrofizacion",
          "content": "El fosforo no tiene fase gaseosa; circula entre rocas fosfaticas, suelo, organismos y sedimentos acuaticos. Es el nutriente limitante en muchos ecosistemas acuaticos. Cuando hay exceso de fosforo y nitrogeno (por fertilizantes agricolas o aguas residuales) en un lago, ocurre la eutrofizacion: floracion masiva de algas -> consumo del O2 disuelto al descomponerse -> zona hipoxica -> muerte de peces. El Lago de Chapala (Jalisco), el mas grande de Mexico con aprox 1,100 km2, ha sufrido episodios graves de eutrofizacion por contaminacion del rio Lerma proveniente del Bajio industrial y agricola (CONAGUA/SEMARNAT)."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "Cual proceso del ciclo del nitrogeno convierte el N2 gaseoso en formas usables por las plantas?",
          "options": ["Fijacion de nitrogeno por bacterias Rhizobium", "Desnitrificacion", "Nitrificacion", "Amoniificacion"],
          "correct": "Fijacion de nitrogeno por bacterias Rhizobium"
        },
        {
          "question": "La eutrofizacion de un lago es causada por:",
          "options": ["Exceso de nitrogeno y fosforo que promueve floracion de algas", "Deficit de carbono en el agua", "Exceso de oxigeno disuelto", "Ausencia de bacterias descomponedoras"],
          "correct": "Exceso de nitrogeno y fosforo que promueve floracion de algas"
        },
        {
          "question": "La deforestacion afecta el ciclo del carbono principalmente porque:",
          "options": ["Reduce la cantidad de biomasa que absorbe CO2 por fotosintesis", "Aumenta la concentracion de nitrogeno en el suelo", "Disminuye la tasa de evaporacion del agua", "Elimina a los descomponedores del suelo"],
          "correct": "Reduce la cantidad de biomasa que absorbe CO2 por fotosintesis"
        },
        {
          "question": "Que porcentaje del agua disponible en Mexico proviene de la precipitacion segun CONAGUA?",
          "options": ["73%", "40%", "55%", "90%"],
          "correct": "73%"
        }
      ],
      "rubric": "Nivel 4: Describe los cuatro ciclos con precision, identifica flujos especificos, analiza el impacto humano con datos de Mexico (INECC, CONAGUA) y propone acciones de mitigacion; Nivel 3: Describe correctamente al menos 3 ciclos y relaciona la eutrofizacion con el exceso de nutrientes; Nivel 2: Conoce los ciclos del agua y carbono pero confunde los pasos del nitrogeno; Nivel 1: No puede completar los esquemas de los ciclos correctamente."
    },
    "teacher_tips": [
      "El caso del Lago de Chapala es ideal por ser el lago natural mas grande de Mexico y tener datos historicos de nivel y calidad del agua disponibles en CONAGUA (conagua.gob.mx). Si el plantel esta en Jalisco o Michoacan, puede tener relevancia personal para los estudiantes.",
      "Para el ciclo del nitrogeno, llevar una vaina de frijol o de haba y mostrar los nodulos de las raices donde viven las bacterias Rhizobium; es un ejemplo concreto y accesible.",
      "Conectar el ciclo del fosforo con la mineria: Mexico es el decimo productor mundial de fosfato segun el Servicio Geologico Mexicano (SGM).",
      "La fijacion biologica del nitrogeno por bacterias en leguminosas explica la practica ancestral mexicana de asociar maiz y frijol (milpa): el frijol enriquece el suelo de nitrogeno que el maiz necesita."
    ]
  },

  "CNEYT-III-P05": {
    "code": "CNEYT-III-P05",
    "title": "Reconoce los subsistemas terrestres y sus interacciones en el sistema Tierra",
    "level": "Ciencias Naturales, Experimentales y Tecnologia III",
    "duration": "~3h (2 sesiones de 50 min)",
    "difficulty": "Basico",
    "category": "Ciencias de la Tierra",
    "metadata": {
      "objective": "Describir los cuatro subsistemas terrestres (atmosfera, hidrosfera, litosfera, biosfera) y analizar sus interacciones bidireccionales, reconociendo que Mexico presenta condiciones geologicas, hidrologicas y atmosfericas que hacen al pais altamente diverso pero tambien vulnerable a riesgos naturales.",
      "competencies": [
        "Define y describe cada subsistema terrestre con sus caracteristicas principales",
        "Identifica interacciones entre subsistemas (atmosfera-hidrosfera: ciclo del agua; litosfera-biosfera: suelo fertil)",
        "Relaciona los riesgos geologicos (sismos, volcanes) con la posicion de Mexico en el Cinturon de Fuego del Pacifico",
        "Analiza la vulnerabilidad hidrologica de Mexico: zonas de inundacion y sequias (CENAPRED, CONAGUA)",
        "Conecta las caracteristicas de los subsistemas con la distribucion de la biodiversidad mexicana"
      ],
      "materials": [
        "Esquema del Sistema Tierra con los cuatro subsistemas",
        "Mapa de placas tectonicas y vulcanismo en Mexico (CENAPRED)",
        "Datos del Atlas de Riesgos de CENAPRED: sismos, volcanes, inundaciones",
        "Mapa de zonas sismicas de Mexico (CENAPRED: Zonas A, B, C, D)",
        "Ficha: El Popocatepetl como ejemplo de interaccion litosfera-atmosfera-biosfera"
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "S1", "duration": "50 min", "label": "Los cuatro subsistemas y sus interacciones"},
        {"phase": "S2", "duration": "50 min", "label": "Mexico: riesgos geologicos e hidrologicos"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA",
          "duration": "10 min",
          "description": "Partir del planeta Tierra como sistema: sus partes estan interconectadas.",
          "activity": "El docente pregunta: que ocurrio en la erupcion del Popocatepetl del X de Mayo de 2023? Que fue afectado? Se identifican: aire (ceniza en atmosfera), agua (lluvia acida potencial), tierra (lava, piroclastos), plantas y animales (evacuacion de fauna). Se introduce que esas cuatro categorias son los subsistemas del Sistema Tierra."
        },
        {
          "title": "FASE II: DESARROLLO",
          "duration": "30 min",
          "description": "S1: descripcion sistematica de los cuatro subsistemas y sus interacciones cruzadas. S2: vulnerabilidad de Mexico.",
          "activity": "S1: Cuadro de doble entrada: cada subsistema como fila y columna; en cada celda, los equipos identifican una interaccion real (ej. atmosfera x hidrosfera = precipitacion y evaporacion; litosfera x biosfera = suelo formado por meteorrizacion + materia organica). S2: Mexico en el Cinturon de Fuego del Pacifico: la placa de Cocos subduce bajo la placa Norteamericana generando sismos en la costa del Pacifico. CENAPRED clasifica Mexico en 4 zonas sismicas (A: bajo riesgo en Yucatan; D: alto riesgo en costas de Guerrero, Oaxaca, Chiapas). El Popocatepetl es el volcán mas activo de Mexico (mas de 5 millones de personas en su radio de influencia, CENAPRED)."
        },
        {
          "title": "FASE III: CIERRE",
          "duration": "10 min",
          "description": "Reflexion sobre la vida en un pais geologicamente activo.",
          "activity": "Los estudiantes identifican en que zona sismica vive su municipio (usando el Atlas Nacional de Riesgos de CENAPRED en linea) y que medidas de preparacion recomendaria."
        }
      ]
    },
    "theory": {
      "introduction": "La Tierra puede entenderse como un sistema compuesto por cuatro grandes subsistemas que interactuan entre si: la atmosfera (envolvente gaseosa), la hidrosfera (agua en todas sus formas), la litosfera (corteza terrestre solida) y la biosfera (todos los seres vivos). Los cambios en uno de estos subsistemas inevitablemente afectan a los demas, como lo demuestran los ciclos naturales y los fenomenos de riesgo como sismos, erupciones y huracanes.",
      "sections": [
        {
          "subtitle": "Atmosfera",
          "content": "Capa gaseosa que rodea la Tierra: 78% N2, 21% O2, 0.04% CO2, vapor de agua y gases traza. Capas: troposfera (0-12 km, donde ocurre el clima), estratosfera (capa de ozono que filtra UV), mesosfera, termosfera. La atmosfera regula la temperatura terrestre mediante el efecto invernadero natural (sin el, la temperatura promedio seria -18 C en lugar de +15 C)."
        },
        {
          "subtitle": "Hidrosfera",
          "content": "Toda el agua de la Tierra: oceanos (97.5%), hielo glacial (1.75%), agua subterranea (0.75%), agua superficial dulce (0.01%). Mexico tiene 14 regiones hidrologicas administrativas (CONAGUA); el rio Grijalva-Usumacinta es el de mayor caudal. La escasez hidrica afecta al norte arido del pais (Baja California, Sonora, Chihuahua) mientras que el sureste tiene excedentes; la desigualdad en la distribucion del agua es uno de los principales desafios de Mexico."
        },
        {
          "subtitle": "Litosfera y vulcanismo en Mexico",
          "content": "La litosfera es la capa rigida externa formada por la corteza y el manto superior. Mexico ocupa una posicion geologica compleja: en el Cinturon de Fuego del Pacifico, donde la placa de Cocos se subduce bajo la placa Norteamericana y la Caribena. Esta subduccion genera el Eje Neovolcanico Transversal (que incluye el Popocatepetl, Iztaccihuatl, Nevado de Toluca, Pico de Orizaba) y la alta sismicidad en la costa del Pacifico. El CENAPRED (Centro Nacional de Prevencion de Desastres) monitorea volcanes y sismos."
        },
        {
          "subtitle": "Biosfera e interacciones con los otros subsistemas",
          "content": "La biosfera incluye todos los seres vivos y se extiende desde las profundidades oceanicas hasta la parte baja de la estratosfera. Las interacciones son bidireccionales: los organismos modifican los otros subsistemas (las plantas producen O2 que cambia la composicion de la atmosfera; los arrecifes de coral modifican el fondo marino de la hidrosfera; los suelos fertiles son producto de la interaccion litosfera-biosfera via descomposicion de materia organica). A su vez, los cambios en los otros subsistemas afectan la distribucion de la biosfera (el clima determina los biomas)."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "La subduccion de la placa de Cocos bajo la placa Norteamericana genera en Mexico:",
          "options": ["Alta sismicidad costera y el Eje Neovolcanico Transversal", "El Desierto Chihuahuense", "La corriente del Golfo de Mexico", "La formacion de la Peninsula de Yucatan"],
          "correct": "Alta sismicidad costera y el Eje Neovolcanico Transversal"
        },
        {
          "question": "Cual subsistema terrestre incluye el agua ocenica, glacial y subterranea?",
          "options": ["Hidrosfera", "Litosfera", "Atmosfera", "Biosfera"],
          "correct": "Hidrosfera"
        },
        {
          "question": "El suelo fertil es resultado de la interaccion de:",
          "options": ["Litosfera y biosfera (meteorrizacion + materia organica)", "Atmosfera e hidrosfera", "Hidrosfera y biosfera unicamente", "Litosfera y atmosfera unicamente"],
          "correct": "Litosfera y biosfera (meteorrizacion + materia organica)"
        },
        {
          "question": "La zona sismica D en Mexico (CENAPRED) corresponde a:",
          "options": ["Las costas de Guerrero, Oaxaca y Chiapas (alto riesgo)", "La Peninsula de Yucatan (bajo riesgo)", "La Meseta Central (riesgo medio)", "El Desierto de Sonora (muy bajo riesgo)"],
          "correct": "Las costas de Guerrero, Oaxaca y Chiapas (alto riesgo)"
        }
      ],
      "rubric": "Nivel 4: Describe los cuatro subsistemas con precision, explica al menos cuatro interacciones cruzadas y conecta la posicion geologica de Mexico con sus riesgos naturales usando datos de CENAPRED; Nivel 3: Describe correctamente los cuatro subsistemas e identifica tres interacciones; Nivel 2: Describe la mayoria de los subsistemas pero no explica sus interacciones; Nivel 1: Confunde los subsistemas o no puede describir sus caracteristicas principales."
    },
    "teacher_tips": [
      "El Atlas Nacional de Riesgos de CENAPRED (atlasnacionalderiesgos.gob.mx) permite consultar el municipio especifico del plantel; usarlo en clase para hacer el aprendizaje localmente relevante.",
      "La erupcion del Popocatepetl es un evento cercano y emocionalmente significativo para muchos estudiantes del centro del pais; usarlo como hilo conductor sin generar ansiedad innecesaria.",
      "Conectar con la historia: el sismo del 19 de septiembre de 1985 y el de 2017 son eventos que marcaron a Mexico; hablar de como la geologia explica su frecuencia y magnitud.",
      "Para comunidades costeras: incluir el analisis de huracanes como interaccion atmosfera-hidrosfera con impacto en la biosfera y litosfera (erosion costera)."
    ]
  },

  "CNEYT-III-P06": {
    "code": "CNEYT-III-P06",
    "title": "Investiga el deterioro ambiental en sus escalas local, regional y global",
    "level": "Ciencias Naturales, Experimentales y Tecnologia III",
    "duration": "~4h (3 sesiones de 50 min)",
    "difficulty": "Intermedio",
    "category": "Ambiente y sustentabilidad",
    "metadata": {
      "objective": "Investigar y analizar causas y consecuencias del deterioro ambiental (deforestacion, contaminacion del agua, cambio climatico, perdida de biodiversidad) en escalas local, regional y global, vinculando datos nacionales con tendencias mundiales.",
      "competencies": [
        "Identifica los principales tipos de deterioro ambiental y sus causas (actividades humanas especificas)",
        "Busca y analiza datos cuantitativos sobre deterioro ambiental en Mexico: SEMARNAT, INECC, CONABIO",
        "Diferencia los impactos a escala local, regional y global con ejemplos concretos",
        "Relaciona el cambio climatico con la emision de gases de efecto invernadero y las actividades productivas en Mexico",
        "Evalua los compromisos de Mexico en acuerdos internacionales: Acuerdo de Paris, Agenda 2030 ODS 13, 14, 15"
      ],
      "materials": [
        "Informe de Estado del Medio Ambiente en Mexico (SEMARNAT, descargable)",
        "Datos INECC: emision nacional de GEI 2021 (683 millones ton CO2eq)",
        "Mapa de deforestacion de Mexico 1990-2020 (CONABIO/FAO)",
        "Grafica de temperatura promedio global 1880-2023 (NASA GISS)",
        "Tarjetas de los ODS relacionados con ambiente (13, 14, 15)"
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "S1", "duration": "50 min", "label": "Tipos de deterioro ambiental en Mexico: causas y datos"},
        {"phase": "S2", "duration": "50 min", "label": "Cambio climatico: evidencias, causas y efectos en Mexico"},
        {"phase": "S3", "duration": "50 min", "label": "Escalas del deterioro y compromisos internacionales de Mexico"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA",
          "duration": "10 min",
          "description": "Contextualizar el deterioro ambiental como problema multidimensional con causas en los modelos de produccion y consumo.",
          "activity": "El docente muestra el mapa de deforestacion de Mexico 1990-2020 (CONABIO): Mexico ha perdido mas de 5 millones de hectareas de bosques y selvas desde 1990. Pregunta: que areas han perdido mas? Por que creen que ocurre? Que consecuencias tiene eso para los ciclos que estudiamos?"
        },
        {
          "title": "FASE II: DESARROLLO",
          "duration": "30 min",
          "description": "S1: inventario de tipos de deterioro ambiental con datos nacionales. S2: cambio climatico. S3: escalas y acuerdos.",
          "activity": "S1: En equipos, cada uno investiga un tipo de deterioro (deforestacion, contaminacion hidrica, perdida de biodiversidad, contaminacion del aire, degradacion de suelos) y presenta datos de Mexico (fuentes: SEMARNAT, INECC, CONABIO). S2: La grafica NASA muestra +1.2 C de calentamiento global desde 1880. En Mexico: incremento de temperaturas extremas, alteracion de patrones de lluvia (INECC 2022), blanqueamiento de arrecifes en el Caribe. GEI en Mexico: sector energetico 27%, transporte 23%, agricultura 12%, residuos 6%. S3: Los ODS 13 (accion climatica), 14 (vida submarina) y 15 (vida de ecosistemas terrestres) son los compromisos de la Agenda 2030 mas directamente relacionados. El Acuerdo de Paris (2015): Mexico se comprometio a reducir 35% sus GEI al 2030 de manera condicionada."
        },
        {
          "title": "FASE III: CIERRE",
          "duration": "10 min",
          "description": "Sintesis multiniivel: del problema local al global.",
          "activity": "Cada equipo presenta una cadena causal: accion humana local -> efecto regional -> impacto global. Ejemplo: ganaderia extensiva en Tabasco (deforestacion local) -> reduccion de captura de carbono de la Selva Lacandona (regional) -> emision de CO2 (global/cambio climatico)."
        }
      ]
    },
    "theory": {
      "introduction": "El deterioro ambiental es la degradacion de los ecosistemas y sus servicios como resultado de las actividades humanas. Se manifiesta a multiple escalas: el problema de una barranca contaminada en una ciudad es local; la deforestacion de la Amazonia y la Selva Lacandona afecta el clima de toda America Latina (regional); el aumento del CO2 atmosferico altera el clima de todo el planeta (global). Mexico enfrenta desafios ambientales criticos: es el undecimo pais con mayor tasa de deforestacion del mundo (FAO, 2020) y uno de los principales emisores de GEI de America Latina.",
      "sections": [
        {
          "subtitle": "Principales formas de deterioro ambiental en Mexico",
          "content": "Deforestacion: Mexico pierde aproximadamente 350,000 hectareas de bosque al anio por expansion agropecuaria, tala clandestina y urbanizacion (SEMARNAT 2021). Contaminacion hidrica: el 74% de los rios y arroyos monitoreados por CONAGUA presentan contaminacion por residuos industriales y aguas residuales sin tratar. Perdida de biodiversidad: la CONABIO lista 2,583 especies en alguna categoria de riesgo en Mexico (2022). Contaminacion del aire: las zonas metropolitanas de CDMX, Monterrey y Guadalajara superan frecuentemente los limites de PM2.5 de la OMS."
        },
        {
          "subtitle": "Cambio climatico: causas y efectos en Mexico",
          "content": "El cambio climatico es el calentamiento progresivo de la atmosfera terrestre causado por el aumento de la concentracion de gases de efecto invernadero (CO2, CH4, N2O, HFCs) como resultado de la quema de combustibles fosiles, deforestacion y agricultura industrial. En Mexico, el INECC (2022) reporta: incremento de temperatura promedio de 0.85 C en el siglo XX; mayor frecuencia de sequias extremas en el norte (impactando la produccion agricola en Sonora, Chihuahua, Tamaulipas); aumento de la intensidad de huracanes en ambas costas; blanqueamiento de corales en el Arrecife Mesoamericano por incremento de temperatura del agua."
        },
        {
          "subtitle": "Escala local, regional y global",
          "content": "Local: un tiradero clandestino contamina el suelo y agua de un municipio. Regional: la quema de cana de azucar en Veracruz genera humo que afecta la calidad del aire de varios estados. Global: la emision de CO2 de todos los paises se acumula en la atmosfera y afecta el clima mundial. Es importante entender que los problemas locales y regionales contribuyen al problema global, y que las soluciones tambien deben ser multiniivel."
        },
        {
          "subtitle": "Compromisos internacionales de Mexico",
          "content": "Acuerdo de Paris (COP21, 2015): Mexico firmo y ratifico el acuerdo; se comprometio a reducir un 22% sus emisiones de GEI y 51% de carbono negro (hollin) al 2030 de manera no condicionada, y 36% y 70% respectivamente de manera condicionada a apoyo internacional. ODS 13 (Accion por el clima), ODS 14 (Vida submarina) y ODS 15 (Vida de ecosistemas terrestres) forman parte de la Agenda 2030 a la que Mexico se adhirio. El monitoreo del avance se realiza anualmente a traves del INEGI y la Coordinacion de la Agenda 2030 de la Presidencia."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "Segun el INECC, cuanto CO2eq emitio Mexico en 2021?",
          "options": ["683 millones de toneladas", "100 millones de toneladas", "2,000 millones de toneladas", "50 millones de toneladas"],
          "correct": "683 millones de toneladas"
        },
        {
          "question": "El blanqueamiento de los corales del Arrecife Mesoamericano en Mexico esta relacionado principalmente con:",
          "options": ["El aumento de la temperatura del agua del mar por cambio climatico", "El exceso de pesca artesanal en el Caribe mexicano", "La reduccion de la salinidad por lluvias excesivas", "La contaminacion de la atmosfera por polvo del Sahara"],
          "correct": "El aumento de la temperatura del agua del mar por cambio climatico"
        },
        {
          "question": "Cual ODS de la Agenda 2030 se refiere directamente a la accion por el clima?",
          "options": ["ODS 13", "ODS 1", "ODS 7", "ODS 16"],
          "correct": "ODS 13"
        },
        {
          "question": "La principal causa de deforestacion en Mexico es:",
          "options": ["La expansion agropecuaria y la tala clandestina", "El incremento de la temperatura atmosferica", "La construccion de presas hidroelectricas", "La migracion campo-ciudad"],
          "correct": "La expansion agropecuaria y la tala clandestina"
        }
      ],
      "rubric": "Nivel 4: Analiza el deterioro ambiental en las tres escalas con datos cuantitativos de fuentes institucionales mexicanas, relaciona las causas con los ciclos biogeoquimicos estudiados y evalua los compromisos de Mexico en acuerdos internacionales; Nivel 3: Identifica correctamente los tipos de deterioro y sus efectos, usa al menos dos fuentes de datos oficiales; Nivel 2: Identifica los principales tipos de deterioro pero no los cuantifica ni distingue claramente las escalas; Nivel 1: Identifica solo el cambio climatico como deterioro ambiental sin analizar causas o datos."
    },
    "teacher_tips": [
      "El informe de Estado del Medio Ambiente en Mexico de la SEMARNAT se actualiza cada dos anios y contiene datos accesibles por entidad federativa; descargar el capitulo relevante para la region del plantel.",
      "Si el plantel esta en una region con problemas ambientales especificos (mineria en Sonora, ganaderia en Tabasco, industria en Monterrey), partir de ese caso local para ilustrar las escalas.",
      "Invitar a un representante de una OSC ambiental local o un ingeniero de PROFEPA para dar un testimonio de 15 minutos sobre el deterioro ambiental en la region.",
      "Conexion con Historia: el Plan Nacional de Desarrollo y los Planes de Accion Climatica son instrumentos gubernamentales; analizar brevemente como la politica ambiental ha evolucionado en Mexico desde la creacion de SEDUE (1982) hasta SEMARNAT (2000)."
    ]
  },

  "CNEYT-III-P07": {
    "code": "CNEYT-III-P07",
    "title": "Analiza politicas y estrategias de conservacion y restauracion ambiental en Mexico",
    "level": "Ciencias Naturales, Experimentales y Tecnologia III",
    "duration": "~3h (2 sesiones de 50 min)",
    "difficulty": "Intermedio",
    "category": "Ambiente y sustentabilidad",
    "metadata": {
      "objective": "Identificar y evaluar las principales politicas, programas e instrumentos de conservacion ambiental en Mexico (ANPs, PSA, LGEEPA, NOM-059), analizando su efectividad y limitaciones con base en evidencia empirica.",
      "competencies": [
        "Identifica los instrumentos juridicos y de politica ambiental de Mexico: LGEEPA, NOM-059, LGDFS",
        "Describe el Sistema Nacional de Areas Naturales Protegidas (CONANP): numero, superficie y distribucion",
        "Analiza el Programa de Pago por Servicios Ambientales (PSA/CONAFOR) como incentivo economico para la conservacion",
        "Evalua la efectividad de las ANPs con base en datos de deforestacion dentro y fuera de ellas",
        "Discute el papel de las comunidades indigenas en la conservacion: territorios comunitarios y cosmovisiones"
      ],
      "materials": [
        "Mapa del Sistema Nacional de ANPs (CONANP, descargable en conanp.gob.mx)",
        "Ficha del Programa de Pago por Servicios Ambientales CONAFOR",
        "Caso de estudio: Reserva de la Biosfera Mariposa Monarca (efectividad documentada)",
        "Caso de estudio: Comunidad indigena de Cheran, Michoacan (policia comunitaria forestal)",
        "NOM-059-SEMARNAT-2010 (lista de especies en riesgo): muestra de 10 fichas de especies"
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "S1", "duration": "50 min", "label": "Sistema Nacional de ANPs y marco juridico ambiental"},
        {"phase": "S2", "duration": "50 min", "label": "Pago por Servicios Ambientales y conservacion comunitaria"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA",
          "duration": "10 min",
          "description": "Introducir el debate: proteger la naturaleza, quien es responsable? El Estado, las empresas, los individuos o las comunidades?",
          "activity": "El docente pregunta: si su comunidad descubriera un deposito de litio debajo de un bosque, que deberia hacerse? Extraer el litio para el desarrollo? Proteger el bosque? Quien deberia decidir? Esta tension es el corazon del debate sobre conservacion y desarrollo sustentable."
        },
        {
          "title": "FASE II: DESARROLLO",
          "duration": "30 min",
          "description": "S1: panorama del Sistema Nacional de ANPs y marco juridico. S2: mecanismos economicos de conservacion y papel de las comunidades.",
          "activity": "S1: El Sistema Nacional de ANPs de Mexico (CONANP) comprende 182 Areas Naturales Protegidas con una superficie de mas de 90.8 millones de hectareas (2023), equivalente al 17% del territorio nacional terrestre y marino. Se analizan categorias: Reservas de la Biosfera (mas estrictas), Parques Nacionales, Areas de Proteccion de Flora y Fauna, etc. La NOM-059 es la norma oficial que lista las especies en riesgo. S2: El Programa de Pago por Servicios Ambientales (CONAFOR) paga a comunidades forestales para que conserven sus bosques en lugar de talarlos; entre 2003 y 2022 beneficio a mas de 3,300 ejidos y comunidades. El caso de Cheran, Michoacan: comunidad p'urhepecha que detuvo la tala ilegal y recupero el control de su bosque con policia comunitaria propia; gano reconocimiento internacional como modelo de conservacion comunitaria."
        },
        {
          "title": "FASE III: CIERRE",
          "duration": "10 min",
          "description": "Evaluacion critica: las politicas son suficientes?",
          "activity": "Debate estructurado: equipo A (las ANPs son efectivas y deben expandirse), equipo B (sin apoyo a comunidades locales las ANPs son papel mojado), equipo C (los mecanismos economicos como PSA son la clave). Cada equipo tiene 3 minutos. El docente facilita la sintesis."
        }
      ]
    },
    "theory": {
      "introduction": "La conservacion ambiental en Mexico se sustenta en un marco juridico e institucional complejo: la Ley General del Equilibrio Ecologico y la Proteccion al Ambiente (LGEEPA, 1988) es la ley marco; la CONANP administra las Areas Naturales Protegidas; la CONAFOR gestiona el Programa de Pago por Servicios Ambientales; la SEMARNAT expide las Normas Oficiales Mexicanas en materia ambiental. Sin embargo, la efectividad de estas politicas depende crucialmente de la participacion de las comunidades que habitan o colindan con los ecosistemas que se busca proteger.",
      "sections": [
        {
          "subtitle": "Sistema Nacional de Areas Naturales Protegidas",
          "content": "Las ANPs son territorios delimitados legalmente donde las actividades humanas se regulan para proteger los ecosistemas. Mexico tiene 182 ANPs (datos CONANP 2023) que cubren aprox 90.8 millones de hectareas. Las categorias incluyen: Reservas de la Biosfera (zonas nucleo de uso muy restringido + zonas de amortiguamiento); Parques Nacionales (Barranca del Cobre, Nevado de Toluca, Lagunas de Chacahua); Areas de Proteccion de Recursos Naturales; Monumentos Naturales. Limitaciones: solo el 17% del territorio esta protegido; Mexico se comprometio con la meta Kunming-Montreal de proteger el 30% al 2030."
        },
        {
          "subtitle": "Marco juridico ambiental de Mexico",
          "content": "LGEEPA (1988): ley marco de la politica ambiental; regula el equilibrio ecologico y la proteccion al ambiente. Ley General de Desarrollo Forestal Sustentable (LGDFS): regula el aprovechamiento de los bosques. NOM-059-SEMARNAT-2010: lista las especies de flora y fauna en riesgo (categorias: Pr=sujeta a proteccion especial, A=amenazada, P=en peligro de extincion, E=probablemente extinta en el medio silvestre). Actualmente lista mas de 2,600 taxa. La Procuraduria Federal de Proteccion al Ambiente (PROFEPA) vigila el cumplimiento de estas leyes."
        },
        {
          "subtitle": "Pago por Servicios Ambientales (PSA)",
          "content": "El PSA es un mecanismo economico en que el gobierno (a traves de CONAFOR) paga a los duenos de bosques (ejidos, comunidades, pequenos propietarios) por mantener la cubierta forestal en pie, reconociendo el valor de los servicios que el bosque provee: captacion de agua, captura de carbono, conservacion de biodiversidad. Entre 2003 y 2022, el programa beneficio a mas de 3.3 millones de hectareas forestales. Sin embargo, evaluaciones academicas (UNAM, CIDE) cuestionan si los pagos llegan a las comunidades mas vulnerables a la deforestacion."
        },
        {
          "subtitle": "Conservacion comunitaria: el caso de Cheran",
          "content": "En 2011, la comunidad p'urhepecha de Cheran, Michoacan, se levanto en armas contra la tala ilegal sistematica que estaba devastando sus bosques de pino-encino. Expulsaron a los talamontes y crearon una policia comunitaria propia (Ronda Comunitaria). En 2012, ganaron el derecho a gobernarse bajo sus usos y costumbres (Tribunal Electoral del Poder Judicial de la Federacion). Desde entonces, Cheran ha reforestado mas de 1,000 hectareas y es reconocido internacionalmente como modelo de gobernanza forestal comunitaria. Su caso demuestra que la conservacion efectiva frecuentemente viene de abajo hacia arriba."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "Cuantas Areas Naturales Protegidas tiene Mexico segun la CONANP en 2023?",
          "options": ["182 ANPs", "50 ANPs", "500 ANPs", "20 ANPs"],
          "correct": "182 ANPs"
        },
        {
          "question": "La NOM-059-SEMARNAT-2010 es una norma que:",
          "options": ["Lista las especies de flora y fauna en riesgo de extinction en Mexico", "Establece los limites de emision de GEI para industrias", "Define las zonas de veda para la pesca en el Pacifico", "Regula el uso de plaguicidas en la agricultura"],
          "correct": "Lista las especies de flora y fauna en riesgo de extinction en Mexico"
        },
        {
          "question": "El Programa de Pago por Servicios Ambientales (CONAFOR) funciona principalmente:",
          "options": ["Pagando a comunidades forestales por mantener sus bosques en pie", "Comprando terrenos privados para convertirlos en ANPs", "Financiando la plantacion de especies exoticas en zonas degradadas", "Subvencionando la tala controlada de maderas preciosas"],
          "correct": "Pagando a comunidades forestales por mantener sus bosques en pie"
        },
        {
          "question": "El caso de Cheran, Michoacan, es un ejemplo de:",
          "options": ["Conservacion comunitaria indigena que detuvo la tala ilegal con gobernanza propia", "Un programa gubernamental de reforestacion masiva exitoso", "Una reserva de la biosfera administrada por la CONANP", "Un proyecto de ecoturismo certificado por SECTUR"],
          "correct": "Conservacion comunitaria indigena que detuvo la tala ilegal con gobernanza propia"
        }
      ],
      "rubric": "Nivel 4: Describe el sistema de ANPs con datos precisos, evalua el PSA con argumentos a favor y en contra, y analiza el caso de conservacion comunitaria de Cheran como modelo alternativo fundamentado en evidencia; Nivel 3: Identifica los principales instrumentos de conservacion y describe su funcionamiento; Nivel 2: Conoce el concepto de ANP pero no puede evaluar su efectividad ni relacionarla con el contexto comunitario; Nivel 1: No distingue los instrumentos de politica ambiental o confunde sus funciones."
    },
    "teacher_tips": [
      "El documental Cheran: A Town That Expelled Politicians, Police and Political Parties (disponible en linea) es excelente para ilustrar la conservacion comunitaria; mostrar un fragmento de 5-7 minutos.",
      "El mapa interactivo de ANPs de la CONANP (conanp.gob.mx) permite identificar si el municipio del plantel tiene alguna ANP cercana; hacer la actividad de localizacion al inicio para generar pertinencia.",
      "Organizar el debate final con carteles de posicion: cada equipo tiene una tarjeta que indica su posicion y argumentos clave; el docente actua como moderador.",
      "Conexion con PFH-III: el debate sobre conservacion vs desarrollo tiene dimensiones eticas profundas (derechos de la naturaleza, justicia intergeneracional, buen vivir indigena) que pueden explorarse en la clase de filosofia."
    ]
  },

  "CNEYT-III-P08": {
    "code": "CNEYT-III-P08",
    "title": "Propone acciones locales fundamentadas en evidencia para la sustentabilidad",
    "level": "Ciencias Naturales, Experimentales y Tecnologia III",
    "duration": "~4h (3 sesiones de 50 min)",
    "difficulty": "Intermedio",
    "category": "Proyecto cientifico",
    "metadata": {
      "objective": "Disenar y ejecutar un mini-proyecto de investigacion-accion sobre un problema ambiental local, que incluya identificacion del problema, busqueda de evidencia cientifica, propuesta de solucion fundamentada y comunicacion de resultados a la comunidad escolar.",
      "competencies": [
        "Identifica un problema ambiental local especifico y plantea una pregunta de investigacion",
        "Busca y selecciona informacion cientifica confiable de fuentes institucionales (SEMARNAT, INECC, CONABIO)",
        "Propone acciones de solucion con fundamento empirico y viabilidad local",
        "Elabora un informe de proyecto con estructura cientifica (problema, metodo, datos, propuesta, conclusiones)",
        "Comunica los resultados a la comunidad escolar con claridad y rigor"
      ],
      "materials": [
        "Formato de proyecto de investigacion-accion (una pagina)",
        "Acceso a fuentes digitales: SEMARNAT, INECC, CONABIO, INEGI",
        "Materiales para presentacion: cartulina/diapositivas",
        "Guia de evaluacion tipo rubrica (co-evaluacion entre equipos)",
        "Cuestionario de percepcion ambiental para aplicar a la comunidad escolar"
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "S1", "duration": "50 min", "label": "Identificacion del problema e investigacion documental"},
        {"phase": "S2", "duration": "50 min", "label": "Propuesta de accion y recoleccion de datos locales"},
        {"phase": "S3", "duration": "50 min", "label": "Presentacion de proyectos y evaluacion entre pares"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA",
          "duration": "10 min",
          "description": "Motivar la agencia: los estudiantes no solo aprenden sobre el deterioro ambiental, tambien pueden actuar.",
          "activity": "El docente pregunta: cual problema ambiental han observado directamente en su colonia, ciudad o region? Se listan en el pizarron: basura en barrancas, aire contaminado, rio sucio, falta de areas verdes, etc. Cada equipo elige uno para investigar."
        },
        {
          "title": "FASE II: DESARROLLO",
          "duration": "30 min",
          "description": "S1: planteamiento del problema e investigacion documental. S2: diseno de la propuesta de accion y recoleccion de datos primarios. S3: presentaciones.",
          "activity": "S1: Cada equipo completa el formato de proyecto: problema identificado, pregunta de investigacion, hipotesis, fuentes de informacion. Investigacion documental con al menos dos fuentes institucionales. S2: Los equipos aplican el cuestionario de percepcion ambiental a otros estudiantes del plantel (muestra de 10 personas); levantan datos primarios (fotos del problema, mediciones simples, observaciones). Completan la propuesta de accion: que podria hacerse, quien lo haria, cuanto costaria, que impacto tendria. S3: Presentacion de 5 min por equipo + 3 min de preguntas. La audiencia completa la rubrica de co-evaluacion."
        },
        {
          "title": "FASE III: CIERRE",
          "duration": "10 min",
          "description": "Reflexion metacognitiva: del problema al proyecto al aprendizaje.",
          "activity": "Circulo de cierre: cada integrante comparte en una oracion que aprendio en este proyecto que no sabia antes. El docente sistematiza las propuestas en un mural del salon que quedara expuesto durante el semestre."
        }
      ]
    },
    "theory": {
      "introduction": "La investigacion-accion es una metodologia que combina la produccion de conocimiento con la transformacion de la realidad: no solo se estudia el problema sino que se proponen y, en la medida de lo posible, se implementan soluciones. En el contexto de la sustentabilidad, implica identificar un problema ambiental local, buscar evidencia para comprenderlo, proponer acciones viables y comunicarlas. Esta es la forma en que trabajan los investigadores del INECC, los tecnicos de la SEMARNAT y los activistas de organizaciones como Greenpeace Mexico o el Centro Mexicano de Derecho Ambiental (CEMDA).",
      "sections": [
        {
          "subtitle": "Estructura de un proyecto de investigacion-accion ambiental",
          "content": "1. Identificacion del problema: descripcion precisa del problema ambiental, su ubicacion, magnitud y quienes son afectados. 2. Pregunta de investigacion: que quiero saber? Ejemplo: que tan contaminado esta el arroyo X de mi colonia? 3. Hipotesis o supuesto: que creo que encontrare? 4. Metodologia: como obtendre los datos? (observacion, encuesta, medicion, revision bibliografica). 5. Recoleccion de datos. 6. Analisis de resultados. 7. Propuesta de accion: que puede hacerse? 8. Comunicacion: presentacion a la comunidad."
        },
        {
          "subtitle": "Fuentes de informacion cientifica confiable en Mexico",
          "content": "SEMARNAT (semarnat.gob.mx): indicadores ambientales, informes de estado del medio ambiente. INECC (gob.mx/inecc): inventario nacional de emisiones, vulnerabilidad al cambio climatico por estado. CONABIO (conabio.gob.mx): mapas de ecosistemas, listas de especies, enciclovida. CONAGUA (gob.mx/conagua): calidad del agua por cuenca. INEGI (inegi.org.mx): datos geograficos, uso de suelo, cartografia. CENAPRED (cenapred.unam.mx): atlas de riesgos naturales. Todas estas instituciones publican datos de acceso libre y gratuito."
        },
        {
          "subtitle": "Acciones locales de sustentabilidad viables",
          "content": "Las acciones pueden ser individuales (reducir consumo de plastico, compostar), escolares (huerto escolar, campana de separacion de residuos, auditoria de consumo energetico del plantel), comunitarias (limpieza de barrancas, reforestacion con especies nativas, vigilancia de tala ilegal) o de incidencia politica (presentar propuestas al municipio, participar en consultas de ordenamiento territorial). La sustentabilidad implica equilibrar tres dimensiones: ambiental, social y economica -- las soluciones deben ser viables en las tres."
        },
        {
          "subtitle": "Comunicacion de resultados con rigor y claridad",
          "content": "Un buen informe cientifico es claro, preciso y verificable. Para comunicar a la comunidad escolar se puede usar: un poster cientifico (titulo, pregunta, datos, propuesta, conclusiones), una presentacion oral de 5 minutos, un video de 2 minutos o un inforgrama. La comunicacion efectiva es parte del trabajo cientifico: sin comunicacion, el conocimiento no transforma la realidad. Organismos como el INECC y la CONABIO publican resúmenes para tomadores de decision y publico general, ademas de sus informes tecnicos."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "En un proyecto de investigacion-accion ambiental, cual es el proposito de la hipotesis?",
          "options": ["Anticipar el resultado esperado antes de recolectar datos", "Describir la solucion definitiva al problema", "Presentar los datos recolectados", "Evaluar el trabajo de otros equipos"],
          "correct": "Anticipar el resultado esperado antes de recolectar datos"
        },
        {
          "question": "Cual de estas fuentes es adecuada para buscar datos sobre calidad del agua en Mexico?",
          "options": ["CONAGUA (gob.mx/conagua)", "Wikipedia", "Redes sociales del municipio", "Noticias de periodicos sin fuente"],
          "correct": "CONAGUA (gob.mx/conagua)"
        },
        {
          "question": "La sustentabilidad implica equilibrar tres dimensiones. Cuales son?",
          "options": ["Ambiental, social y economica", "Politica, militar y cultural", "Local, regional y global", "Cientifica, tecnologica y humanistica"],
          "correct": "Ambiental, social y economica"
        },
        {
          "question": "Una propuesta de accion local sustentable debe ser:",
          "options": ["Viable ambientalmente, socialmente y economicamente en el contexto local", "La mas costosa posible para garantizar resultados", "Propuesta solo por expertos externos a la comunidad", "Basada unicamente en datos internacionales sin considerar el contexto local"],
          "correct": "Viable ambientalmente, socialmente y economicamente en el contexto local"
        }
      ],
      "rubric": "Nivel 4: El proyecto identifica un problema real con datos locales y nacionales, formula una pregunta precisa, propone una accion viable fundamentada en evidencia y la comunica con claridad y rigor; Nivel 3: El proyecto identifica el problema, propone una accion con fundamento y la presenta de manera comprensible; Nivel 2: El proyecto identifica el problema pero la propuesta de accion es vaga o no esta sustentada en evidencia; Nivel 1: El proyecto no identifica claramente el problema o no propone ninguna accion concreta."
    },
    "teacher_tips": [
      "Permitir que los equipos elijan el problema ambiental que mas les importe: la autonomia en la seleccion del tema aumenta significativamente el compromiso y la calidad del trabajo.",
      "Sugerir problemas accionables a escala escolar si los estudiantes tienen dificultad para identificar uno: auditoría de residuos del plantel, medicion de la temperatura en distintas zonas del plantel (isla de calor urbana), inventario de especies de plantas y aves en los jardines del plantel.",
      "Gestionar el acceso a internet con anticipacion: la sesion de investigacion documental requiere acceso a las plataformas de SEMARNAT, CONABIO e INEGI.",
      "Documentar los proyectos con fotos y guardarlos en el portafolio digital del grupo: pueden ser la base de participacion en concursos de ciencia como la Feria Estatal de Ciencias e Ingenieria (SEP) o el Premio Nacional de la Juventud en la categoria de medio ambiente."
    ]
  }
}

with open(OUT, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Written {len(data)} progressions to {OUT}")
