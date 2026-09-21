export interface PracticaMeta {
  slug: string;
  titulo: string;
  descripcion?: string;
}

export const PRACTICAS_META: Record<string, PracticaMeta> = {
  "pasado-viaje-ingles": {
    slug: "pasado-viaje-ingles",
    titulo: "Laboratorio Interactivo — A trip to remember: narrar en pasado con detalle",
    descripcion: "Clasifica dieciséis verbos por la regla de escritura de su pasado (-ed, -d, -ied, consonante doble y la lista irregular), coloca sobre una línea del tiempo el fondo en past continuous y la interrupción en past simple en cinco escenas de lugares reales de México, ordena los seis momentos de una excursión con sus conectores y caza la oración que rompe el tiempo verbal. Contenido verbatim de Inglés IV; los personajes son ficticios.",
  },
  "instrucciones-ingles": {
    slug: "instrucciones-ingles",
    titulo: "Laboratorio Interactivo — Instructions that work",
    descripcion: "Da instrucciones en inglés a una máquina que obedece al pie de la letra: si la frase admite otra lectura, hace otra cosa. Di qué dato le falta a la instrucción ambigua, repara una secuencia cuyos pasos están desordenados bajo conectores correctos, y arma preguntas indirectas para pedir que te orienten. Contenido verbatim de Inglés III.",
  },
  "habitos-comparaciones-ingles": {
    slug: "habitos-comparaciones-ingles",
    titulo: "Laboratorio Interactivo — Habits and comparisons: comparar lo que hacen, eligen o prefieren",
    descripcion: "Nombra la regla que le toca a cada adjetivo y construye su comparativo y su superlativo esquivando «more easier» y «gooder», lee tablas de datos y elige la única comparación en inglés que esos datos sostienen, arma la igualdad «as … as» y su negación con el comparativo al que equivale, y completa prefer … to, would rather … than y like … better than con la forma de verbo que cada una exige. Contenido verbatim de Inglés III.",
  },
  "experiencias-recientes-ingles": {
    slug: "experiencias-recientes-ingles",
    titulo: "Laboratorio Interactivo — Have you ever...? Compartir experiencias en inglés",
    descripcion: "Arma cuatro charlas turno por turno y descubre el salto: la pregunta abre en present perfect, la respuesta corta repite el auxiliar y el seguimiento —cuándo, dónde, con quién— cambia a past simple; coloca ever, never, already, yet y just en su posición exacta, decide entre for y since, y cuenta la misma vivencia con fecha y sin fecha. Contenido verbatim de Inglés III; los personajes son ficticios.",
  },
  "describir-personas-clima-ingles": {
    slug: "describir-personas-clima-ingles",
    titulo: "Laboratorio Interactivo — Describing people: orden del adjetivo, be/have y wearing",
    descripcion: "Arma frases en inglés con el orden fijo del adjetivo (opinión → tamaño → edad → color → material) y detecta las que suenan imposibles, elige be o have para describir a alguien sin cruzarlos, viste a cuatro personas según el parte meteorológico de Xalapa, Creel, Mérida y La Ventosa justificando con la oración correcta, y escribe is wearing o wears según el marcador de tiempo. Contenido verbatim de Inglés II.",
  },
  "tiempo-libre-ingles": {
    slug: "tiempo-libre-ingles",
    titulo: "Laboratorio Interactivo — Tiempo libre y presente simple en inglés",
    descripcion: "Gira el sujeto para ver aparecer y desaparecer la -s de la tercera persona, clasifica verbos por las tres reglas (-s, -es, y→ies), arma negativas y preguntas con do/does —con el error típico tachado al lado— y coloca los adverbios de frecuencia en su posición. Contenido verbatim de Inglés II.",
  },
  "perfil-personal-ingles": {
    slug: "perfil-personal-ingles",
    titulo: "Laboratorio Interactivo — About me: información personal en inglés",
    descripcion: "Coloca cada dato en su campo de un formulario en inglés y descubre por qué el apellido no va en «First name» ni «Mexico» en «Nationality», elige la única respuesta que contesta la pregunta que te hicieron, transforma una misma frase con to be cambiando el sujeto, y pasa de «I am…» a «She is… / His name is…» al presentar a alguien más. Contenido verbatim de Inglés I; los personajes y sus datos son ficticios.",
  },
  "aula-ingles-interacciones": {
    slug: "aula-ingles-interacciones",
    titulo: "Laboratorio Interactivo — In the classroom: el turno adecuado",
    descripcion: "Elige, en ocho situaciones reales del aula, cuál de tres expresiones en inglés cumple tu intención y le habla a la maestra —el error explica qué comunica de más o de menos—, arma tres intercambios profesor↔alumno donde el orden importa, y clasifica doce expresiones en formal e informal sin tratar lo informal como incorrecto. Contenido verbatim de Inglés I.",
  },
  "lectura-critica-postura": {
    slug: "lectura-critica-postura",
    titulo: "Laboratorio Interactivo — Leer más allá de lo literal",
    descripcion: "Trabaja los tres niveles de lectura sobre un mismo texto —literal, inferencial y crítico—, descubre el supuesto que el autor no argumenta pero necesita, distingue criticar el argumento de descalificar a quien lo dice, y toma postura sosteniéndola con dos líneas del texto. Contenido verbatim de Lengua y Comunicación III; los textos que se critican son ilustrativos.",
  },
  "kit-herramientas-digitales": {
    slug: "kit-herramientas-digitales",
    titulo: "Laboratorio Interactivo — Kit de herramientas digitales para estudiar",
    descripcion: "Elige la categoría de herramienta que resuelve cada encargo escolar y descarta las que no sirven, desempata entre dos herramientas según la necesidad declarada, renombra y archiva un escritorio hecho un desastre y ordena los ocho pasos de un trabajo con la herramienta de cada paso. Contenido verbatim de Cultura Digital I.",
  },
  "convivencia-digital": {
    slug: "convivencia-digital",
    titulo: "Laboratorio Interactivo — Identidad y respeto en el ciberespacio",
    descripcion: "Manda el mismo mensaje por cuatro canales y con cuatro tonos y mide cómo cambia su efecto, cierra un perfil bajando lo que se deduce de ti sin perder presencia, decide ante cuatro casos —broma, rumor, hostigamiento y suplantación— si toca hablar, documentar, bloquear, reportar o pedir ayuda, y reescribe respuestas hostiles en firmes. Contenido verbatim de Cultura Digital I; los casos y el perfil son ilustrativos.",
  },
  "derechos-digitales": {
    slug: "derechos-digitales",
    titulo: "Laboratorio Interactivo — Mis derechos en el mundo digital",
    descripcion: "Resuelve cuatro casos decidiendo qué derecho está en juego, qué mecanismo procede y qué deber te toca del otro lado; clasifica ocho solicitudes en su letra de ARCO y audita un aviso de privacidad cláusula por cláusula. Contenido verbatim de Cultura Digital I, con el marco legal vigente (LFPDPPP, DOF 20/03/2025).",
  },
  "procedimientos-narrativos": {
    slug: "procedimientos-narrativos",
    titulo: "Laboratorio Interactivo — Procedimientos narrativos",
    descripcion: "Reconstruye el orden de los hechos de dos relatos y nombra sus analepsis y prolepsis, lee la misma escena en tres voces y reparte qué puede contar cada una, mide resumen, escena, elipsis y pausa contra el reloj de la historia, y convierte el estilo directo en indirecto e indirecto libre pieza por pieza. Contenido verbatim de Lengua y Comunicación II.",
  },
  "reescritura-taller": {
    slug: "reescritura-taller",
    titulo: "Laboratorio Interactivo — Taller de reescritura",
    descripcion: "Opera tres borradores tachando muletillas, repeticiones y relleno mientras el contador de palabras baja; decide qué operación repara cada defecto (suprimir, sustituir, reordenar, ampliar), aplica marcas de corrector tal cual y descubre que la mejor versión depende del propósito declarado, no de cuál suena mejor. Contenido verbatim de Lengua y Comunicación II.",
  },
  "temas-ideas-narrativa": {
    slug: "temas-ideas-narrativa",
    titulo: "Laboratorio Interactivo — Tema, idea central y sus hilos",
    descripcion: "Separa en tres narrativas populares lo que pasa de aquello sobre lo que hacen pensar, elige entre tres temas candidatos el único que el texto sostiene y señala los hilos que lo sostienen, mide el tema demasiado ancho y el demasiado angosto, y empareja seis relatos distintos por el tema que comparten. Contenido verbatim de Lengua y Comunicación II; los relatos son textos ilustrativos escritos para la práctica.",
  },
  "narrativas-populares-lengua": {
    slug: "narrativas-populares-lengua",
    titulo: "Laboratorio Interactivo — La lengua de las narrativas populares",
    descripcion: "Marca dentro de tres relatos los rasgos que delatan la tradición oral —fórmulas de apertura y cierre, repetición, diminutivo, voz regional, presente histórico, refrán, discurso directo, hipérbole—, traslada cinco frases del registro oral al escrito midiendo qué se pierde, y reconoce de qué lengua viene cada voz del relato. Contenido verbatim de Lengua y Comunicación II; las voces regionales y de lenguas originarias se tratan como variación legítima, nunca como error.",
  },
  "taller-descripcion-narracion": {
    slug: "taller-descripcion-narracion",
    titulo: "Laboratorio Interactivo — Taller de descripción y narración",
    descripcion: "Cambia adjetivos genéricos por detalles concretos y mira cómo cambia la imagen, elige la ruta con que se revela una escena, convierte descripciones quietas en sucesos con su conector temporal y rescata frases hundidas por un verbo comodín. Contenido verbatim de Lengua y Comunicación II.",
  },
  "historia-de-vida-relato": {
    slug: "historia-de-vida-relato",
    titulo: "Laboratorio Interactivo — Tu historia de vida como relato",
    descripcion: "Ordena los seis momentos de una anécdota, separa el suceso del detalle y de la huella, y elige narrador, tiempo verbal y distancia para reescribir la misma escena. Contenido verbatim de Lengua y Comunicación II; el laboratorio no pide ni califica experiencias personales.",
  },
  "anatomia-exposicion-oral": {
    slug: "anatomia-exposicion-oral",
    titulo: "Laboratorio Interactivo — Anatomía de una exposición oral",
    descripcion: "Monta el guion pieza por pieza y comprueba qué se rompe cuando falta cada una, reparte los segundos contra el reloj hasta ver cómo el desarrollo se come el cierre, decide el apoyo visual de cada momento y diagnostica cuatro exposiciones ajenas. Contenido verbatim de Lengua y Comunicación I.",
  },
  "lectura-en-voz-alta": {
    slug: "lectura-en-voz-alta",
    titulo: "Laboratorio Interactivo — Leer en voz alta",
    descripcion: "Marca sobre tres textos dónde va la pausa, el énfasis y el cambio de entonación y descubre por qué la puntuación lo pide ahí, ajusta la velocidad y los silencios según a quién va dirigido, y juzga seis lecturas ajenas eligiendo la opinión fundamentada. Contenido verbatim de Lengua y Comunicación I.",
  },
  "ideas-clave-subrayado": {
    slug: "ideas-clave-subrayado",
    titulo: "Laboratorio Interactivo — Ideas clave: qué subrayar y por qué",
    descripcion: "Subraya de verdad sobre tres textos con marcadores de idea principal, detalle de apoyo y relleno; arma con lo subrayado el esquema jerárquico de cada texto y diagnostica nueve resúmenes ajenos. Contenido verbatim de Lengua y Comunicación I.",
  },
  "hecho-opinion-texto": {
    slug: "hecho-opinion-texto",
    titulo: "Laboratorio Interactivo — Hecho, idea y opinión",
    descripcion: "Marca dentro de tres textos reales qué es información verificable, qué es idea del autor y qué es opinión, caza la palabra que delata el juicio y decide si el texto quiere informarte o convencerte. Contenido verbatim de Lengua y Comunicación I.",
  },
  "encuesta-lectora-comunidad": {
    slug: "encuesta-lectora-comunidad",
    titulo: "Laboratorio Interactivo — La encuesta lectora de tu comunidad",
    descripcion: "Decide qué preguntas sirven para investigar a tu comunidad, codifica nueve respuestas reales en tipo de texto y soporte, y lee la gráfica que producen tus propias decisiones. Contenido verbatim de Lengua y Comunicación I.",
  },
  "lectura-escritura-dialogo": {
    slug: "lectura-escritura-dialogo",
    titulo: "Laboratorio Interactivo — Leer y escribir: un diálogo",
    descripcion: "Reconstruye tres circuitos reales en los que leer alimenta lo que escribes y lo escrito cambia cómo vuelves a leer, clasifica doce textos por su función, escribe el glosario de memoria y redacta tu propia reflexión. Contenido verbatim de Lengua y Comunicación I.",
  },
  densidad: {
    slug: "densidad",
    titulo: "Laboratorio 3D — Densidad y Flotación",
    descripcion: "Suelta objetos en distintos líquidos y observa si flotan o se hunden; mide masa y volumen para calcular la densidad real.",
  },
  "estados-materia": {
    slug: "estados-materia",
    titulo: "Laboratorio 3D — Estados de la Materia",
    descripcion: "Calienta y enfría sustancias para observar los cambios de estado; identifica los puntos de fusión y ebullición en la gráfica.",
  },
  "modelos-atomicos": {
    slug: "modelos-atomicos",
    titulo: "Laboratorio 3D — Modelos Atómicos",
    descripcion: "Viaja en el tiempo a través de los modelos de Dalton, Thomson, Rutherford, Bohr y el modelo cuántico; compara sus aportaciones y limitaciones.",
  },
  "enlaces-quimicos": {
    slug: "enlaces-quimicos",
    titulo: "Laboratorio 3D — Enlaces Químicos",
    descripcion: "Forma moléculas y cristales manipulando átomos; observa cómo los electrones de valencia determinan el tipo de enlace (iónico, covalente, metálico).",
  },
  "conservacion-materia": {
    slug: "conservacion-materia",
    titulo: "Laboratorio 3D — Ley de Conservación de la Materia",
    descripcion: "Equilibra reacciones químicas en una balanza virtual y comprueba que los átomos se conservan; ajusta coeficientes y observa el efecto en la masa.",
  },
  "energia-electricidad": {
    slug: "energia-electricidad",
    titulo: "Laboratorio 3D — Energía y Electricidad",
    descripcion: "Arma circuitos con pilas, resistencias y focos; mide voltaje e intensidad para verificar la Ley de Ohm y calcular la potencia consumida.",
  },
  "separacion-mezclas": {
    slug: "separacion-mezclas",
    titulo: "Laboratorio 3D — Separación de Mezclas",
    descripcion: "Aplica destilación, filtración, cristalización y cromatografía para separar componentes de mezclas homogéneas y heterogéneas.",
  },
  "propiedades-materia": {
    slug: "propiedades-materia",
    titulo: "Laboratorio 3D — Propiedades de la Materia",
    descripcion: "Compara propiedades físicas (masa, volumen, densidad, punto de fusión) y propiedades químicas (reactividad, combustibilidad) de distintas sustancias.",
  },
  "fracciones-porcentajes": {
    slug: "fracciones-porcentajes",
    titulo: "Laboratorio 3D — Fracciones y Porcentajes",
    descripcion: "Parte pizzas, barras y figuras geométricas para visualizar fracciones equivalentes; convierte entre fracción, decimal y porcentaje.",
  },
  "potencias-raices": {
    slug: "potencias-raices",
    titulo: "Laboratorio 3D — Potencias y Raíces",
    descripcion: "Construye cubos y cuadrados para relacionar área y volumen con potencias; usa la raíz cuadrada y cúbica para encontrar la longitud del lado.",
  },
  "concentracion-disolucion": {
    slug: "concentracion-disolucion",
    titulo: "Laboratorio 3D — Concentración y Dilución",
    descripcion: "Disuelve soluto en solvente y ajusta la concentración; calcula molaridad y comprende el proceso de dilución con soluciones reales.",
  },
  "razon-proporcion": {
    slug: "razon-proporcion",
    titulo: "Laboratorio 3D — Razón y Proporción",
    descripcion: "Usa recetas, mapas y escalas para explorar la proporcionalidad directa e inversa; ajusta cantidades y observa el cambio en la relación.",
  },
  "recta-numerica": {
    slug: "recta-numerica",
    titulo: "Laboratorio 3D — Recta Numérica",
    descripcion: "Ubica enteros, fracciones e irracionales en la recta numérica; compara y ordena números de distintos conjuntos numéricos.",
  },
  "notacion-cientifica": {
    slug: "notacion-cientifica",
    titulo: "Laboratorio 3D — Notación Científica",
    descripcion: "Convierte números muy grandes y muy pequeños a notación científica; opera con potencias de diez y aplícalo a magnitudes reales del universo.",
  },
  "valor-posicional": {
    slug: "valor-posicional",
    titulo: "Laboratorio 3D — Valor Posicional",
    descripcion: "Descompone números en unidades, decenas, centenas y potencias de diez; convierte entre sistemas decimal, binario y hexadecimal.",
  },
  "sistemas-ecuaciones-2x2": {
    slug: "sistemas-ecuaciones-2x2",
    titulo: "Laboratorio 3D — Sistemas de Ecuaciones 2×2",
    descripcion: "Resuelve sistemas de dos ecuaciones con dos incógnitas por los métodos gráfico, sustitución y eliminación; interpreta la solución como punto de intersección.",
  },
  "ecuacion-lineal-balanza": {
    slug: "ecuacion-lineal-balanza",
    titulo: "Laboratorio 3D — Ecuación Lineal (Balanza)",
    descripcion: "Equilibra una balanza agregando y quitando pesas para resolver ecuaciones lineales; aplica las propiedades de igualdad paso a paso.",
  },
  "teorema-pitagoras": {
    slug: "teorema-pitagoras",
    titulo: "Laboratorio 3D — Teorema de Pitágoras",
    descripcion: "Construye cuadrados sobre los lados de triángulos rectángulos para verificar a²+b²=c²; aplícalo para calcular distancias reales.",
  },
  "volumen-cilindro": {
    slug: "volumen-cilindro",
    titulo: "Laboratorio 3D — Volumen del Cilindro",
    descripcion: "Ajusta el radio y la altura de cilindros para explorar V=πr²h; compara volúmenes de recipientes cotidianos y calcula capacidades.",
  },
  "factorizacion-area": {
    slug: "factorizacion-area",
    titulo: "Laboratorio 3D — Factorización y Área",
    descripcion: "Descompone rectángulos en factores para visualizar la factorización algebraica; relaciona el área con los factores de un trinomio.",
  },
  "ecuacion-lineal-barras": {
    slug: "ecuacion-lineal-barras",
    titulo: "Laboratorio 3D — Ecuaciones Lineales (Barras)",
    descripcion: "Modela situaciones con barras de colores para plantear y resolver ecuaciones lineales; traduce el lenguaje cotidiano al algebraico.",
  },
  "productos-notables-3d": {
    slug: "productos-notables-3d",
    titulo: "Laboratorio 3D — Productos Notables",
    descripcion: "Expande y factoriza binomios con bloques de álgebra en 3D; visualiza (a+b)², (a-b)² y (a+b)(a-b) como áreas y volúmenes.",
  },
  "conservacion-energia-pendulo": {
    slug: "conservacion-energia-pendulo",
    titulo: "Laboratorio 3D — Conservación de la Energía (Péndulo)",
    descripcion: "Suelta un péndulo y observa la transformación continua entre energía potencial y cinética; varía la masa y la altura inicial.",
  },
  "gas-ideal-piston": {
    slug: "gas-ideal-piston",
    titulo: "Laboratorio 3D — Gas Ideal y Pistón",
    descripcion: "Comprime y expande un gas en un pistón virtual; verifica las leyes de Boyle, Charles y Gay-Lussac ajustando presión, volumen y temperatura.",
  },
  "transferencia-calor-mecanismos": {
    slug: "transferencia-calor-mecanismos",
    titulo: "Laboratorio 3D — Transferencia de Calor",
    descripcion: "Observa conducción, convección y radiación en escenarios cotidianos; mide la temperatura en función del tiempo para cada mecanismo.",
  },
  "entropia-segunda-ley": {
    slug: "entropia-segunda-ley",
    titulo: "Laboratorio 3D — Entropía y Segunda Ley",
    descripcion: "Mezcla colores y observa cómo aumenta el desorden; relaciona la dirección espontánea de los procesos con el incremento de entropía.",
  },
  "maquina-termica-ciclos": {
    slug: "maquina-termica-ciclos",
    titulo: "Laboratorio 3D — Máquina Térmica y Ciclos",
    descripcion: "Opera una máquina de Carnot ajustando las temperaturas del foco caliente y frío; calcula la eficiencia y el trabajo obtenido por ciclo.",
  },
  "trabajo-potencia-mecanica": {
    slug: "trabajo-potencia-mecanica",
    titulo: "Laboratorio 3D — Trabajo y Potencia Mecánica",
    descripcion: "Empuja bloques por rampas y poleas para calcular el trabajo (W=Fd cosθ) y la potencia; compara máquinas simples.",
  },
  "inecuaciones-lineales": {
    slug: "inecuaciones-lineales",
    titulo: "Laboratorio 3D — Inecuaciones Lineales",
    descripcion: "Representa inecuaciones en la recta numérica y en el plano; identifica la región solución y aplícalo a problemas de restricciones.",
  },
  "formas-energia-transformacion": {
    slug: "formas-energia-transformacion",
    titulo: "Laboratorio 3D — Formas de Energía y Transformación",
    descripcion: "Transforma energía química, eléctrica, mecánica, luminosa y térmica entre sí; cuantifica la eficiencia de cada conversión.",
  },
  "parabola-trayectoria": {
    slug: "parabola-trayectoria",
    titulo: "Laboratorio 3D — Parábola y Trayectoria",
    descripcion: "Lanza proyectiles y ajusta ángulo y velocidad inicial para trazar la parábola; conecta el movimiento con la ecuación cuadrática y=ax²+bx+c.",
  },
  "ecuacion-recta": {
    slug: "ecuacion-recta",
    titulo: "Laboratorio 3D — Ecuación de la Recta",
    descripcion: "Mueve puntos en el plano cartesiano para construir la ecuación de la recta en sus formas pendiente-intersección, punto-pendiente y general.",
  },
  "funciones-variable-real": {
    slug: "funciones-variable-real",
    titulo: "Laboratorio 3D — Funciones de Variable Real",
    descripcion: "Explora funciones lineales, cuadráticas, exponenciales y logarítmicas; modifica parámetros y observa el cambio en la gráfica.",
  },
  "teorema-fundamental-calculo": {
    slug: "teorema-fundamental-calculo",
    titulo: "Laboratorio 3D — Teorema Fundamental del Cálculo",
    descripcion: "Visualiza cómo la integral acumula área bajo la curva y cómo la derivada la deshace; conecta ambas operaciones con el teorema fundamental.",
  },
  "distribucion-normal": {
    slug: "distribucion-normal",
    titulo: "Laboratorio 3D — Distribución Normal",
    descripcion: "Ajusta media y desviación estándar de una campana de Gauss; calcula probabilidades por áreas y aplícalo a datos reales de exámenes.",
  },
  "medidas-tendencia-central": {
    slug: "medidas-tendencia-central",
    titulo: "Laboratorio 3D — Medidas de Tendencia Central",
    descripcion: "Calcula media, mediana y moda de conjuntos de datos; observa cómo los valores atípicos afectan cada medida en la gráfica de barras.",
  },
  "medidas-dispersion": {
    slug: "medidas-dispersion",
    titulo: "Laboratorio 3D — Medidas de Dispersión",
    descripcion: "Calcula rango, varianza y desviación estándar; compara la dispersión de dos conjuntos de datos con la misma media pero distinta variabilidad.",
  },
  "datos-graficas-estadisticas": {
    slug: "datos-graficas-estadisticas",
    titulo: "Laboratorio 3D — Datos y Gráficas Estadísticas",
    descripcion: "Construye histogramas, polígonos de frecuencia y ojivas a partir de tablas de datos; interpreta la forma de la distribución.",
  },
  "piramide-energia": {
    slug: "piramide-energia",
    titulo: "Laboratorio 3D — Pirámide de Energía",
    descripcion: "Construye pirámides tróficas y observa cómo solo el 10% de la energía pasa de un nivel al siguiente; analiza las consecuencias para las cadenas alimentarias.",
  },
  fotosintesis: {
    slug: "fotosintesis",
    titulo: "Laboratorio 3D — Fotosíntesis",
    descripcion: "Regula la intensidad de luz y la concentración de CO₂ para maximizar la producción de glucosa; observa la reacción global 6CO₂+6H₂O→C₆H₁₂O₆+6O₂.",
  },
  "semejanza-triangulos": {
    slug: "semejanza-triangulos",
    titulo: "Laboratorio 3D — Semejanza de Triángulos",
    descripcion: "Escala triángulos y verifica los criterios AA, LAL y LLL; calcula lados desconocidos usando proporciones de triángulos semejantes.",
  },
  "ciclo-carbono": {
    slug: "ciclo-carbono",
    titulo: "Laboratorio 3D — Ciclo del Carbono",
    descripcion: "Sigue los átomos de carbono a través de la atmósfera, océanos, suelo y seres vivos; observa el impacto de la deforestación y la quema de combustibles.",
  },
  "ecuacion-cuadratica": {
    slug: "ecuacion-cuadratica",
    titulo: "Laboratorio 3D — Ecuación Cuadrática",
    descripcion: "Resuelve ecuaciones cuadráticas por factorización, completar cuadrado y la fórmula general; visualiza las raíces como intersecciones con el eje x.",
  },
  "subsistemas-terrestres": {
    slug: "subsistemas-terrestres",
    titulo: "Laboratorio 3D — Subsistemas Terrestres",
    descripcion: "Explora la interacción entre geosfera, hidrosfera, atmósfera y biosfera; modifica variables y observa el efecto en cadena sobre los demás subsistemas.",
  },
  "biomas-ecosistemas": {
    slug: "biomas-ecosistemas",
    titulo: "Laboratorio 3D — Biomas y Ecosistemas",
    descripcion: "Viaja por los principales biomas del planeta; ajusta temperatura y precipitación para ver qué bioma emerge y qué especies lo habitan.",
  },
  "redes-troficas": {
    slug: "redes-troficas",
    titulo: "Laboratorio 3D — Redes Tróficas",
    descripcion: "Construye redes alimentarias conectando productores, consumidores y descomponedores; elimina una especie y observa el efecto cascada en la red.",
  },
  deforestacion: {
    slug: "deforestacion",
    titulo: "Laboratorio 3D — Deforestación y Biodiversidad",
    descripcion: "Tala árboles virtualmente y mide el impacto en la biodiversidad, el CO₂ atmosférico y la erosión del suelo; compara escenarios de reforestación.",
  },
  discriminante: {
    slug: "discriminante",
    titulo: "Laboratorio 3D — Discriminante",
    descripcion: "Calcula el discriminante b²-4ac de ecuaciones cuadráticas y predice el número de raíces reales; observa la parábola tocar, cruzar o evitar el eje x.",
  },
  "circulo-unitario": {
    slug: "circulo-unitario",
    titulo: "Laboratorio 3D — Círculo Unitario",
    descripcion: "Rota un punto sobre el círculo unitario y lee el seno, coseno y tangente en tiempo real; conecta los valores con la gráfica de las funciones trigonométricas.",
  },
  "triangulo-rectangulo": {
    slug: "triangulo-rectangulo",
    titulo: "Laboratorio 3D — Triángulo Rectángulo",
    descripcion: "Calcula las razones trigonométricas seno, coseno y tangente en triángulos rectángulos de distintas medidas; aplícalo para medir alturas inaccesibles.",
  },
  "ley-senos-cosenos": {
    slug: "ley-senos-cosenos",
    titulo: "Laboratorio 3D — Ley de Senos y Cosenos",
    descripcion: "Resuelve triángulos oblicuángulos usando la Ley de Senos y la Ley del Coseno; aplícalo a problemas de navegación y topografía.",
  },
  "geometria-analitica": {
    slug: "geometria-analitica",
    titulo: "Laboratorio 3D — Geometría Analítica",
    descripcion: "Ubica puntos, rectas y circunferencias en el plano cartesiano; calcula distancias, pendientes y ecuaciones de figuras geométricas.",
  },
  "transformaciones-funciones": {
    slug: "transformaciones-funciones",
    titulo: "Laboratorio 3D — Transformaciones de Funciones",
    descripcion: "Aplica traslaciones, reflexiones, dilataciones y compresiones a la gráfica de funciones; relaciona cada transformación algebraica con su efecto visual.",
  },
  "balanceo-ecuaciones": {
    slug: "balanceo-ecuaciones",
    titulo: "Laboratorio 3D — Balanceo de Ecuaciones",
    descripcion: "Ajusta los coeficientes de reacciones químicas para conservar la masa; comprueba cada elemento contando átomos a ambos lados de la flecha.",
  },
  "organica-visor": {
    slug: "organica-visor",
    titulo: "Laboratorio 3D — Química Orgánica (Visor)",
    descripcion: "Explora modelos 3D de moléculas orgánicas: alcanos, alquenos, alquinos, alcoholes y ácidos carboxílicos; identifica grupos funcionales y su reactividad.",
  },
  "ph-escala": {
    slug: "ph-escala",
    titulo: "Laboratorio 3D — Escala de pH",
    descripcion: "Mide el pH de distintas soluciones con indicadores y pH-metro virtual; clasifica ácidos y bases y comprende la escala logarítmica del pH.",
  },
  "reaccion-co2": {
    slug: "reaccion-co2",
    titulo: "Laboratorio 3D — Reacción CO₂",
    descripcion: "Mezcla ácido y carbonato para producir CO₂; mide el volumen de gas generado y relaciona la cantidad de reactivo con el rendimiento de la reacción.",
  },
  "conicas-lugares-geometricos": {
    slug: "conicas-lugares-geometricos",
    titulo: "Laboratorio 3D — Cónicas: Lugares Geométricos",
    descripcion: "Corta un cono doble en distintos ángulos para obtener elipse, parábola, hipérbola y circunferencia; relaciona el corte con la ecuación canónica.",
  },
  "modelado-conicas-estimacion": {
    slug: "modelado-conicas-estimacion",
    titulo: "Laboratorio 3D — Modelado de Cónicas y Estimación",
    descripcion: "Ajusta los parámetros de cada cónica para modelar trayectorias de satélites, arcos de puentes y reflectores parabólicos; estima valores con la ecuación.",
  },
  "lenguaje-algebraico-mosaicos": {
    slug: "lenguaje-algebraico-mosaicos",
    titulo: "Laboratorio 3D — Lenguaje Algebraico (Mosaicos)",
    descripcion: "Traduce enunciados a expresiones algebraicas usando mosaicos de colores; identifica variables, coeficientes y términos independientes.",
  },
  "clasificacion-expresiones-mosaicos": {
    slug: "clasificacion-expresiones-mosaicos",
    titulo: "Laboratorio 3D — Clasificación de Expresiones (Mosaicos)",
    descripcion: "Clasifica monomios, binomios, trinomios y polinomios por su grado y número de términos; ordena y simplifica expresiones semejantes.",
  },
  "operaciones-binomios-mosaicos": {
    slug: "operaciones-binomios-mosaicos",
    titulo: "Laboratorio 3D — Operaciones con Monomios y Binomios",
    descripcion: "Suma, resta y multiplica monomios y binomios con mosaicos de álgebra; visualiza la propiedad distributiva como el área de un rectángulo.",
  },
  "tipos-reacciones-quimicas": {
    slug: "tipos-reacciones-quimicas",
    titulo: "Laboratorio 3D — Tipos de Reacciones Químicas",
    descripcion: "Clasifica reacciones de síntesis, descomposición, desplazamiento simple y doble, y combustión; identifica reactivos y productos en cada tipo.",
  },
  "biomoleculas-cuatro-clases": {
    slug: "biomoleculas-cuatro-clases",
    titulo: "Laboratorio 3D — Biomoléculas: Cuatro Clases",
    descripcion: "Explora los cuatro grandes grupos de biomoléculas (carbohidratos, lípidos, proteínas y ácidos nucleicos); relaciona su estructura con su función biológica.",
  },
  "funciones-concepto": {
    slug: "funciones-concepto",
    titulo: "Laboratorio 3D — Concepto de Función",
    descripcion: "Construye relaciones entre conjuntos y determina cuáles son funciones; utiliza la prueba de la línea vertical y evalúa funciones en valores específicos.",
  },
  "limites-acercamiento": {
    slug: "limites-acercamiento",
    titulo: "Laboratorio 3D — Límites por Acercamiento",
    descripcion: "Acerca el valor de x a un punto desde la izquierda y la derecha para encontrar el límite; identifica límites laterales y determina si el límite existe.",
  },
  "continuidad-tres-condiciones": {
    slug: "continuidad-tres-condiciones",
    titulo: "Laboratorio 3D — Continuidad: Tres Condiciones",
    descripcion: "Verifica las tres condiciones de continuidad en funciones a trozos; identifica discontinuidades removibles, de salto e infinitas.",
  },
  "derivada-secante-tangente": {
    slug: "derivada-secante-tangente",
    titulo: "Laboratorio 3D — Derivada: Secante y Tangente",
    descripcion: "Observa cómo la recta secante se convierte en tangente al acercar el segundo punto; calcula la derivada como límite del cociente diferencial.",
  },
  "reglas-derivacion": {
    slug: "reglas-derivacion",
    titulo: "Laboratorio 3D — Reglas de Derivación",
    descripcion: "Aplica la regla de la potencia, del producto, del cociente y de la cadena paso a paso; verifica el resultado comparando con la pendiente de la tangente.",
  },
  "trascendentes-derivacion": {
    slug: "trascendentes-derivacion",
    titulo: "Laboratorio 3D — Derivación de Funciones Trascendentes",
    descripcion: "Deriva funciones exponenciales, logarítmicas, trigonométricas e inversas; observa la forma de cada derivada y aplícalo a problemas de optimización.",
  },
  "extremos-inflexion": {
    slug: "extremos-inflexion",
    titulo: "Laboratorio 3D — Extremos e Inflexión",
    descripcion: "Encuentra máximos, mínimos y puntos de inflexión usando la primera y segunda derivada; interpreta la concavidad y los cambios de monotonía.",
  },
  "optimizacion-cilindro": {
    slug: "optimizacion-cilindro",
    titulo: "Laboratorio 3D — Optimización: Cilindro",
    descripcion: "Minimiza el material necesario para fabricar una lata cilíndrica con volumen fijo; aplica las condiciones de primer y segundo orden para encontrar el óptimo.",
  },
  "diferencial-linealizacion": {
    slug: "diferencial-linealizacion",
    titulo: "Laboratorio 3D — Diferencial y Linealización",
    descripcion: "Usa el diferencial para aproximar el cambio en una función; compara la aproximación lineal con el valor real y analiza el error de la linealización.",
  },
  "dcl-leyes-newton": {
    slug: "dcl-leyes-newton",
    titulo: "Laboratorio 3D — Diagrama de Cuerpo Libre y Leyes de Newton",
    descripcion: "Dibuja DCL en planos horizontal, inclinado y polea; aplica ΣF=ma para calcular aceleración y tensiones. Contenido verbatim de CNEyT V.",
  },
  "mrua-acelerar-frenar": {
    slug: "mrua-acelerar-frenar",
    titulo: "Laboratorio 3D — MRUA: Acelerar y Frenar",
    descripcion: "Simula el movimiento rectilíneo uniformemente acelerado de un automóvil en autopista; traza gráficas x-t, v-t y a-t para el problema Puebla–CDMX verbatim.",
  },
  "gravitacion-universal": {
    slug: "gravitacion-universal",
    titulo: "Laboratorio 3D — Gravitación Universal",
    descripcion: "Calcula la fuerza gravitacional Tierra–Luna F=G·M·m/r², el peso W=m·g en cuatro cuerpos celestes y la órbita geoestacionaria Mexsat T=24h.",
  },
  "ondas-amplitud-frecuencia": {
    slug: "ondas-amplitud-frecuencia",
    titulo: "Laboratorio 3D — Ondas: Amplitud y Frecuencia",
    descripcion: "Genera ondas mecánicas en tres medios (aire, agua, acero); explora interferencia constructiva/destructiva, ondas estacionarias y efecto Doppler con sirena.",
  },
  "espectro-electromagnetico": {
    slug: "espectro-electromagnetico",
    titulo: "Laboratorio 3D — Espectro Electromagnético",
    descripcion: "Recorre el espectro log-f 10⁴–10²² Hz; identifica las 7 bandas, el umbral ionizante y 11 aplicaciones de México (GTM, IFT, IMSS, ININ). Anclado a infografía A1.",
  },
  "optica-lentes-espejos": {
    slug: "optica-lentes-espejos",
    titulo: "Laboratorio 3D — Óptica: Lentes y Espejos",
    descripcion: "Aplica la ecuación de Gauss 1/f=1/dₒ+1/dᵢ en lentes convergentes/divergentes; explora espejos plano/cóncavo/convexo y la ley de Snell con reflexión total.",
  },
  "electromagnetismo-ohm-faraday": {
    slug: "electromagnetismo-ohm-faraday",
    titulo: "Laboratorio 3D — Electromagnetismo: Ohm y Faraday",
    descripcion: "Simula circuitos con ley de Ohm I=V/R, generador Faraday FEM=N·B·A·ω·sen(ωt) y motor eléctrico; presets CFE y caso Metro 150kW@92%. Anclado a ejercicio A2.",
  },
  "genetica-mendeliana-punnett": {
    slug: "genetica-mendeliana-punnett",
    titulo: "Laboratorio 3D — Genética Mendeliana y Cuadro de Punnett",
    descripcion: "Cruza organismos con distintos genotipos usando el cuadro de Punnett; calcula proporciones fenotípicas para rasgos mono y dihíbridos.",
  },
  "celula-organelos-3d": {
    slug: "celula-organelos-3d",
    titulo: "Laboratorio 3D — Célula y Organelos",
    descripcion: "Explora la célula procariota y eucariota en 3D; identifica organelos (núcleo, mitocondria, retículo, aparato de Golgi) y su función.",
  },
  "metabolismo-celular-3d": {
    slug: "metabolismo-celular-3d",
    titulo: "Laboratorio 3D — Metabolismo Celular",
    descripcion: "Sigue el flujo de energía en glucólisis, ciclo de Krebs y fosforilación oxidativa; compara la producción de ATP en cada etapa.",
  },
  "seleccion-natural-evolucion-3d": {
    slug: "seleccion-natural-evolucion-3d",
    titulo: "Laboratorio 3D — Selección Natural y Evolución",
    descripcion: "Simula presiones selectivas sobre poblaciones de distintos fenotipos; observa cómo cambia la frecuencia génica a lo largo de generaciones.",
  },
  "adn-dogma-central-3d": {
    slug: "adn-dogma-central-3d",
    titulo: "Laboratorio 3D — ADN y Dogma Central",
    descripcion: "Recorre los tres procesos del dogma central: replicación del ADN, transcripción a ARNm y traducción al ribosoma; usa el código genético exacto.",
  },
  "origen-vida-3d": {
    slug: "origen-vida-3d",
    titulo: "Laboratorio 3D — Origen de la Vida",
    descripcion: "Recrea el aparato de Miller-Urey 1953 con días 0–7; explora ambientes caldo primordial, hidrotermal y panspermia-Murchison; 5 hipótesis verbatim A1.",
  },
  "mutaciones-3d": {
    slug: "mutaciones-3d",
    titulo: "Laboratorio 3D — Mutaciones",
    descripcion: "Aplica mutaciones puntuales (sustitución/inserción/deleción) sobre β-globina real; explora cromosómicas y mutágenos (UV, ionizante, químico, biológico VPH).",
  },
  "biotecnologia-crispr-3d": {
    slug: "biotecnologia-crispr-3d",
    titulo: "Laboratorio 3D — Biotecnología y CRISPR",
    descripcion: "Opera CRISPR-Cas9 sobre protospacer+PAM (NHEJ knockout vs HDR edición precisa); explora plásmido transgénico e insulina 1982/maíz Bt/arroz dorado; SCNT Dolly.",
  },
  fluidos: {
    slug: "fluidos",
    titulo: "Laboratorio 3D — Fluidos",
    descripcion: "Explora la presión hidrostática, el principio de Arquímedes y el flujo de Bernoulli; mide la presión a distintas profundidades y simula tuberías.",
  },
  "division-celular": {
    slug: "division-celular",
    titulo: "Laboratorio 3D — División Celular",
    descripcion: "Observa las fases de la mitosis y la meiosis en animación 3D; identifica cada etapa (profase, metafase, anafase, telofase) y el número de células resultantes.",
  },
  "propagacion-calor": {
    slug: "propagacion-calor",
    titulo: "Laboratorio 3D — Propagación del Calor",
    descripcion: "Compara la conducción de calor en materiales con distinta conductividad térmica; mide la temperatura en función de la distancia y el tiempo.",
  },
  "redox-combustion": {
    slug: "redox-combustion",
    titulo: "Laboratorio 3D — Redox y Combustión",
    descripcion: "Identifica agente oxidante y reductor en reacciones de óxido-reducción; simula la combustión del metano y analiza los cambios en el número de oxidación.",
  },
  "equilibrio-quimico": {
    slug: "equilibrio-quimico",
    titulo: "Laboratorio 3D — Equilibrio Químico",
    descripcion: "Perturba un sistema en equilibrio aplicando el principio de Le Chatelier; varía concentración, temperatura y presión y observa el desplazamiento del equilibrio.",
  },
  "respiracion-celular": {
    slug: "respiracion-celular",
    titulo: "Laboratorio 3D — Respiración Celular",
    descripcion: "Sigue la glucosa desde la glucólisis hasta el ciclo de Krebs y la cadena transportadora de electrones; cuantifica el ATP producido en cada etapa.",
  },
  "estructura-reaccion": {
    slug: "estructura-reaccion",
    titulo: "Laboratorio 3D — Estructura y Reacción Química",
    descripcion: "Construye modelos de bola y varilla para comprender cómo la estructura molecular determina la reactividad; identifica los sitios de reacción.",
  },
  "hardware-software": {
    slug: "hardware-software",
    titulo: "Laboratorio Interactivo — Hardware y Software",
    descripcion: "Clasifica componentes físicos y programas de cómputo, empareja dispositivos con su función y domina el glosario de la arquitectura de computadoras. Contenido verbatim de Cultura Digital I.",
  },
  "constructor-algoritmos": {
    slug: "constructor-algoritmos",
    titulo: "Laboratorio Interactivo — Constructor de Algoritmos",
    descripcion: "Ordena los pasos de algoritmos cotidianos y de programación, clasifica instrucciones por tipo de estructura (secuencia, decisión, ciclo) y domina el glosario. Contenido verbatim de Cultura Digital I.",
  },
  "taller-parrafos": {
    slug: "taller-parrafos",
    titulo: "Laboratorio Interactivo — Taller de Párrafos",
    descripcion: "Ordena oraciones para construir párrafos coherentes, clasifica los tipos de párrafo (introductorio, de desarrollo, conclusivo) y domina el glosario. Contenido verbatim de Lengua y Comunicación I.",
  },
  "presentaciones-ingles": {
    slug: "presentaciones-ingles",
    titulo: "Laboratorio Interactivo — Presentaciones en Inglés",
    descripcion: "Ordena las partes de una presentación oral en inglés, clasifica frases de apertura y cierre, y domina el vocabulario de presentaciones. Contenido verbatim de Inglés I.",
  },
  "licencias-software": {
    slug: "licencias-software",
    titulo: "Laboratorio Interactivo — Licencias de Software",
    descripcion: "Clasifica tipos de licencias (propietaria, libre, Creative Commons), empareja cada licencia con su uso permitido y domina el glosario de derechos digitales. Contenido verbatim de Cultura Digital II.",
  },
  "estado-mexicano": {
    slug: "estado-mexicano",
    titulo: "Laboratorio Interactivo — El Estado Mexicano",
    descripcion: "Clasifica los poderes del Estado mexicano y sus funciones, empareja los órganos de gobierno con su atribución y domina el glosario constitucional. Contenido verbatim de Ciencias Sociales I.",
  },
  "concordancia-conectores": {
    slug: "concordancia-conectores",
    titulo: "Laboratorio Interactivo — Concordancia y Conectores",
    descripcion: "Completa oraciones con la concordancia correcta (género, número, persona) y elige el conector adecuado (adición, contraste, causalidad); domina el glosario. Contenido verbatim de Lengua y Comunicación I.",
  },
  "posesivos-ingles": {
    slug: "posesivos-ingles",
    titulo: "Laboratorio Interactivo — Posesivos en Inglés",
    descripcion: "Clasifica los pronombres y adjetivos posesivos, completa oraciones con la forma correcta y domina las estructuras de posesión. Contenido verbatim de Inglés I.",
  },
  "comparativos-ingles": {
    slug: "comparativos-ingles",
    titulo: "Laboratorio Interactivo — Comparativos en Inglés",
    descripcion: "Forma comparativos y superlativos de adjetivos cortos y largos, completa oraciones de comparación y domina las reglas de formación. Contenido verbatim de Inglés II.",
  },
  "pasado-simple-ingles": {
    slug: "pasado-simple-ingles",
    titulo: "Laboratorio Interactivo — Pasado Simple en Inglés",
    descripcion: "Clasifica verbos regulares e irregulares en pasado, completa oraciones afirmativas, negativas e interrogativas y domina la conjugación. Contenido verbatim de Inglés II.",
  },
  "personajes-escenarios": {
    slug: "personajes-escenarios",
    titulo: "Laboratorio Interactivo — Personajes y Escenarios",
    descripcion: "Clasifica los elementos de la narrativa (personajes, tiempo, espacio, narrador), empareja cada elemento con su ejemplo y domina el glosario. Contenido verbatim de Lengua y Comunicación II.",
  },
  "causalidad-historica": {
    slug: "causalidad-historica",
    titulo: "Laboratorio Interactivo — Causalidad Histórica",
    descripcion: "Ordena causas y consecuencias de eventos históricos, clasifica el tipo de causalidad (económica, política, social, cultural) y domina el glosario. Contenido verbatim de Conciencia Histórica I.",
  },
  "fuentes-historicas": {
    slug: "fuentes-historicas",
    titulo: "Laboratorio Interactivo — Fuentes Históricas",
    descripcion: "Clasifica fuentes primarias y secundarias, empareja cada tipo con sus ventajas y limitaciones, y domina el glosario de la heurística histórica. Contenido verbatim de Conciencia Histórica I.",
  },
  "deteccion-fake-news": {
    slug: "deteccion-fake-news",
    titulo: "Laboratorio Interactivo — Detección de Fake News",
    descripcion: "Clasifica noticias en verdaderas y falsas según indicadores de credibilidad, empareja estrategias de verificación y domina el glosario de alfabetización mediática. Contenido verbatim de Cultura Digital I.",
  },
  "factores-produccion": {
    slug: "factores-produccion",
    titulo: "Laboratorio Interactivo — Factores de Producción",
    descripcion: "Clasifica tierra, trabajo, capital y tecnología en ejemplos concretos, empareja cada factor con su retribución y domina el glosario económico. Contenido verbatim de Ciencias Sociales I.",
  },
  "necesidades-satisfactores": {
    slug: "necesidades-satisfactores",
    titulo: "Laboratorio Interactivo — Necesidades y Satisfactores",
    descripcion: "Clasifica necesidades básicas y satisfactores según Max-Neef, empareja categorías con ejemplos y domina el glosario. Contenido verbatim de Ciencias Sociales I.",
  },
  "movimientos-literarios": {
    slug: "movimientos-literarios",
    titulo: "Laboratorio Interactivo — Movimientos Literarios",
    descripcion: "Clasifica textos y características por movimiento literario (Romanticismo, Realismo, Modernismo, Vanguardia), empareja cada movimiento con su época y domina el glosario. Contenido verbatim de Lengua y Comunicación II.",
  },
  "figuras-retoricas": {
    slug: "figuras-retoricas",
    titulo: "Laboratorio Interactivo — Figuras Retóricas",
    descripcion: "Arrastra cada figura retórica a su definición y a un verso real, clasifícalas entre figura retórica y forma poética, y comprueba lo aprendido. Contenido verbatim de Lenguaje y Comunicación III.",
  },
  "hipotesis-historicas": {
    slug: "hipotesis-historicas",
    titulo: "Laboratorio Interactivo — Hipótesis Históricas",
    descripcion: "Clasifica fuentes primarias y secundarias, ordena los pasos para formular una hipótesis histórica y domina el glosario del análisis del pasado. Contenido verbatim de Conciencia Histórica II.",
  },
  "comunicacion-multimodal": {
    slug: "comunicacion-multimodal",
    titulo: "Laboratorio Interactivo — Comunicación Multimodal",
    descripcion: "Clasifica elementos digitales por su modo semiótico (texto, imagen, audio, video), empareja los conceptos de identidad digital y algoritmos con su definición y domina el glosario de la era digital. Contenido verbatim de Cultura Digital III.",
  },
  "diversidad-discriminacion": {
    slug: "diversidad-discriminacion",
    titulo: "Laboratorio Interactivo — Diversidad y Discriminación",
    descripcion: "Clasifica las formas de organización social y las manifestaciones de la discriminación, empareja los conceptos clave con su definición y domina el glosario. Contenido verbatim de Ciencias Sociales II.",
  },
  "relaciones-poder": {
    slug: "relaciones-poder",
    titulo: "Laboratorio Interactivo — Relaciones de Poder",
    descripcion: "Clasifica ejemplos por categoría de análisis (clase, género, etnia, edad), empareja los conceptos de poder e interseccionalidad con su definición y domina el glosario. Contenido verbatim de Ciencias Sociales II.",
  },
  "crisis-sociales": {
    slug: "crisis-sociales",
    titulo: "Laboratorio Interactivo — Crisis Sociales",
    descripcion: "Clasifica causas, actores y consecuencias de la crisis de la pandemia de COVID-19, empareja cada actor con su papel y domina el glosario. Contenido verbatim de Ciencias Sociales III.",
  },
  "politicas-publicas": {
    slug: "politicas-publicas",
    titulo: "Laboratorio Interactivo — Políticas Públicas",
    descripcion: "Ordena las etapas del ciclo de la política pública, empareja los conceptos con su definición y domina el glosario. Contenido verbatim de Ciencias Sociales III.",
  },
  "generos-literarios": {
    slug: "generos-literarios",
    titulo: "Laboratorio Interactivo — Géneros Literarios",
    descripcion: "Clasifica obras y características por género literario (narrativo, lírico, dramático, ensayístico), empareja cada género con su rasgo y domina el glosario. Contenido verbatim de Lengua y Comunicación III.",
  },
  "present-perfect-ingles": {
    slug: "present-perfect-ingles",
    titulo: "Laboratorio Interactivo — Present Perfect en Inglés",
    descripcion: "Construye el present perfect (have/has + past participle), completa oraciones con ever/never/already/yet/just y domina las estructuras clave. Contenido verbatim de Inglés V.",
  },
  "sentido-historico": {
    slug: "sentido-historico",
    titulo: "Laboratorio Interactivo — Sentido Histórico",
    descripcion: "Clasifica actitudes frente al pasado, empareja fenómenos del presente con su raíz histórica y domina el glosario de la memoria colectiva. Contenido verbatim de Conciencia Histórica II.",
  },
  "subgeneros-narrativos": {
    slug: "subgeneros-narrativos",
    titulo: "Laboratorio Interactivo — Subgéneros Narrativos",
    descripcion: "Clasifica obras y rasgos por subgénero narrativo (suspenso, terror, ciencia ficción, autoficción, neorrealismo urbano, literaturas del Antropoceno), empareja cada subgénero con su rasgo y domina el glosario. Contenido verbatim de Lengua y Comunicación III.",
  },
  "resena-critica": {
    slug: "resena-critica",
    titulo: "Laboratorio Interactivo — Reseña Crítica",
    descripcion: "Ordena las partes de una reseña crítica, distingue el resumen del juicio crítico y domina el glosario. Contenido verbatim de Lengua y Comunicación III.",
  },
  "exposicion-oral": {
    slug: "exposicion-oral",
    titulo: "Laboratorio Interactivo — Exposición Oral",
    descripcion: "Clasifica escenarios por formato de exposición oral (coloquio, simposio, foro), empareja los conceptos con su definición y domina el glosario. Contenido verbatim de Lengua y Comunicación III.",
  },
  "procesos-ingles": {
    slug: "procesos-ingles",
    titulo: "Laboratorio Interactivo — Procesos en Inglés",
    descripcion: "Order the steps of a process with sequencers, classify question and passive-voice structures, and master the key structures. Contenido verbatim de Inglés V.",
  },
  "juventudes-politicas": {
    slug: "juventudes-politicas",
    titulo: "Laboratorio Interactivo — Juventudes y Participación Política",
    descripcion: "Clasifica ejemplos por forma de participación (electoral, comunitaria, cultural, digital), empareja los conceptos con su definición y domina el glosario. Contenido verbatim de Ciencias Sociales III.",
  },
  "mexico-en-el-mundo": {
    slug: "mexico-en-el-mundo",
    titulo: "Laboratorio Interactivo — México en el Mundo",
    descripcion: "Ordena cronológicamente los procesos históricos, clasifícalos por siglo y domina el glosario de la historia interconectada. Contenido verbatim de Conciencia Histórica II.",
  },
  "consejos-ingles": {
    slug: "consejos-ingles",
    titulo: "Laboratorio Interactivo — Consejos en Inglés",
    descripcion: "Clasifica oraciones de consejo por su forma, completa recomendaciones y empareja estructuras. Contenido verbatim de Inglés IV.",
  },
  "busqueda-confiable": {
    slug: "busqueda-confiable",
    titulo: "Laboratorio Interactivo — Búsqueda Confiable",
    descripcion: "Distingue fuentes confiables de señales de alerta, empareja estrategias de búsqueda con su pregunta clave y domina el glosario. Contenido verbatim de Cultura Digital II.",
  },
  "tipos-graficas": {
    slug: "tipos-graficas",
    titulo: "Laboratorio Interactivo — Tipos de Gráficas",
    descripcion: "Empareja cada gráfica con su propósito, clasifica escenarios de datos por la gráfica apropiada y reconoce trampas visuales. Contenido verbatim de Cultura Digital II.",
  },
  "etica-produccion-digital": {
    slug: "etica-produccion-digital",
    titulo: "Laboratorio Interactivo — Ética y Producción Digital",
    descripcion: "Clasifica prácticas éticas y no éticas, empareja conceptos con su definición (plagio, deepfake, autoría) y domina el glosario. Contenido verbatim de Cultura Digital II.",
  },
  "carreras-digitales": {
    slug: "carreras-digitales",
    titulo: "Laboratorio Interactivo — Carreras Digitales",
    descripcion: "Clasifica perfiles profesionales por área, emparéjalos con su función en el mercado y domina el glosario. Contenido verbatim de Cultura Digital III.",
  },
  "falacias-logica": {
    slug: "falacias-logica",
    titulo: "Laboratorio Interactivo — Falacias y Lógica",
    descripcion: "Clasifica argumentos por el tipo de falacia que cometen, distingue razonamientos válidos de falacias y domina el glosario lógico. Contenido verbatim de Pensamiento Filosófico y Humanidades III.",
  },
  bioetica: {
    slug: "bioetica",
    titulo: "Laboratorio Interactivo — Bioética",
    descripcion: "Clasifica casos según el principio bioético (autonomía, beneficencia, no maleficencia, justicia), empareja conceptos y domina el glosario. Contenido verbatim de Pensamiento Filosófico y Humanidades II.",
  },
  "navegacion-segura": {
    slug: "navegacion-segura",
    titulo: "Laboratorio Interactivo — Navegación Segura",
    descripcion: "Clasifica prácticas seguras y riesgosas, empareja cada amenaza con su defensa y domina el glosario de seguridad digital. Contenido verbatim de Cultura Digital I.",
  },
  "algoritmos-deciden": {
    slug: "algoritmos-deciden",
    titulo: "Laboratorio Interactivo — ¿Qué Deciden los Algoritmos?",
    descripcion: "Clasifica qué decide cada algoritmo, relaciona causa y efecto y reconstruye cómo se arma tu feed. Contenido verbatim de Cultura Digital I.",
  },
  "tiempo-historico": {
    slug: "tiempo-historico",
    titulo: "Laboratorio Interactivo — Tiempo Histórico",
    descripcion: "Clasifica hechos por su duración (Braudel: corta, mediana, larga), ordena la línea del tiempo y domina el glosario. Contenido verbatim de Conciencia Histórica I.",
  },
  "reglas-ingles": {
    slug: "reglas-ingles",
    titulo: "Laboratorio Interactivo — Reglas y Obligaciones en Inglés",
    descripcion: "Clasifica reglas por su modal (must / mustn't / have to / don't have to), completa enunciados y domina el glosario. Contenido verbatim de Inglés III.",
  },
  "tipos-de-preguntas": {
    slug: "tipos-de-preguntas",
    titulo: "Laboratorio Interactivo — Tipos de Preguntas",
    descripcion: "Clasifica preguntas en cotidianas, científicas y filosóficas, ordénalas en las cinco ramas de la filosofía y profundiza de lo cotidiano a lo filosófico. Contenido verbatim de Pensamiento Filosófico y Humanidades I.",
  },
  "herramientas-colaborativas": {
    slug: "herramientas-colaborativas",
    titulo: "Laboratorio Interactivo — Herramientas Colaborativas",
    descripcion: "Elige la herramienta colaborativa según la tarea, empareja las funciones de la nube y distingue buenas prácticas de errores. Contenido verbatim de Ciudadanía Digital II.",
  },
  "galton-probabilidad-frecuencia": {
    slug: "galton-probabilidad-frecuencia",
    titulo: "Laboratorio 3D — Azar, frecuencia y probabilidad: el tablero de Galton",
    descripcion: "Cuenta el espacio muestral de un dado, dos monedas o una baraja para calcular P(A) y su complemento; suelta bolas en un tablero de Galton y compara la frecuencia observada con la curva binomial teórica; repite el experimento miles de veces y mira la ley de los grandes números en acción.",
  },
  "conjuntos-venn-3d": {
    slug: "conjuntos-venn-3d",
    titulo: "Laboratorio 3D — Conjuntos y diagramas de Venn",
    descripcion: "Mueve elementos entre las zonas de un diagrama de Venn y observa la unión, la intersección, el complemento y la diferencia; construye por separado los dos lados de las leyes de De Morgan y acomoda una encuesta empezando por la intersección.",
  },
  "tecnicas-conteo-3d": {
    slug: "tecnicas-conteo-3d",
    titulo: "Laboratorio 3D — Técnicas de conteo: contar para decidir",
    descripcion: "Ramifica un árbol del principio multiplicativo, sube a Ana, Beto, Carla, Diego y Eva a un podio o siéntalos en un comité para ver por qué P(n,r) = C(n,r)·r!, y extrae de una urna con y sin reemplazo para distinguir eventos independientes de dependientes.",
  },
  "bayes-probabilidad-condicional": {
    slug: "bayes-probabilidad-condicional",
    titulo: "Laboratorio 3D — Bayes: actualizar creencias con nueva información",
    descripcion: "Probabilidad condicional en 3D: el espacio muestral que se reduce, árboles con regla del producto e inversión con Bayes, y una prueba diagnóstica con 1 000 personas para calcular el Valor Predictivo Positivo del ejercicio A2.",
  },
  "correlacion-variables-3d": {
    slug: "correlacion-variables-3d",
    titulo: "Laboratorio 3D — ¿Están relacionadas? Independencia y correlación",
    descripcion: "Relación entre variables en 3D: tabla de contingencia en torres con el plano de lo esperado, diagrama de dispersión interactivo con r y rectángulos de productos, y la temperatura como variable oculta que desmonta la correlación entre helado y ahogamientos.",
  },
  "muestreo-estadistico-3d": {
    slug: "muestreo-estadistico-3d",
    titulo: "Laboratorio 3D — Muestreo: cómo elegir una muestra representativa",
    descripcion: "Una escuela de 800 estudiantes en 3D: muestreo aleatorio simple, sistemático, estratificado y por conglomerados; el sesgo de las encuestas voluntarias y de conveniencia, y 300 muestras repetidas para ver cómo el tamaño angosta el error muestral.",
  },
  "estadistica-enganosa-3d": {
    slug: "estadistica-enganosa-3d",
    titulo: "Laboratorio 3D — Estadísticas que engañan",
    descripcion: "Ocho trucos de los medios en 3D: eje truncado, íconos que crecen en volumen, escala logarítmica, puntos contra porcentaje, riesgo relativo, bases distintas, media contra mediana y margen de error.",
  },
  "variables-poblacion-muestra-3d": {
    slug: "variables-poblacion-muestra-3d",
    titulo: "Laboratorio 3D — Estadística: variables, población y muestra",
    descripcion: "Una máquina clasificadora de variables, el censo de una escuela de 1 500 estudiantes contra encuestas de 20 a 500, y la tabla de frecuencias con intervalos para distinguir la estadística descriptiva de la inferencial.",
  },
  "metodo-cientifico-medicion-3d": {
    slug: "metodo-cientifico-medicion-3d",
    titulo: "Laboratorio 3D — Método científico: el experimento controlado y la medición",
    descripcion: "Un invernadero en 3D para recorrer el método científico con plantas bajo distintas horas de luz, réplicas que muestran la variación natural y la medición con cinta, regla y calibrador vernier.",
  },
  "naturaleza-ciencia-3d": {
    slug: "naturaleza-ciencia-3d",
    titulo: "Laboratorio 3D — La ciencia como práctica humana: revisión, falsabilidad y autocorrección",
    descripcion: "Revisa estudios como un par científico y mira si cinco laboratorios los replican, pon a prueba afirmaciones en un banco 3D y sigue cómo la evidencia cambió el consenso sobre las úlceras y la deriva continental.",
  },
  "tipos-energia-aplicaciones-3d": {
    slug: "tipos-energia-aplicaciones-3d",
    titulo: "Laboratorio 3D — Tipos de energía: de los fenómenos naturales a la tecnología",
    descripcion: "Arma la cadena de energía de un rayo, la brisa marina, un volcán y la fotosíntesis, pon a trabajar un aerogenerador, una planta geotérmica y un panel frente a una hoja con un diagrama de flujo 3D de pérdidas, y diseña tu propia investigación con datos.",
  },
  "consumo-energetico-hogar-3d": {
    slug: "consumo-energetico-hogar-3d",
    titulo: "Laboratorio 3D — Consumo energético e impacto ambiental",
    descripcion: "Enciende y desconecta los aparatos de una casa mexicana y calcula kWh, recibo escalonado y CO₂; sigue la energía de la planta al foco y convierte tu huella de carbono anual en globos de CO₂ a tamaño real.",
  },
  "energias-renovables-mexico-3d": {
    slug: "energias-renovables-mexico-3d",
    titulo: "Laboratorio 3D — Energías renovables y no renovables en México",
    descripcion: "Recorre doce centrales reales en un relieve 3D de México para ver que capacidad instalada no es generación, opera una red de sol, viento, baterías y gas durante un día entero y ajusta la mezcla del país para medir sus emisiones y el agotamiento del petróleo.",
  },
  "hidrosfera-atmosfera-3d": {
    slug: "hidrosfera-atmosfera-3d",
    titulo: "Laboratorio 3D — Hidrósfera y atmósfera: capas, composición e intercambio",
    descripcion: "Sube un globo sonda por las capas de la atmósfera, baja un sensor CTD por un océano estratificado por temperatura y salinidad, y sigue una parcela de aire del Golfo de México a Perote: evaporación, nube, lluvia y calor latente.",
  },
  "oxigenacion-atmosfera-3d": {
    slug: "oxigenacion-atmosfera-3d",
    titulo: "Laboratorio 3D — La oxigenación de la atmósfera",
    descripcion: "Sigue el primer O₂ de las cianobacterias hasta el hierro bandeado y el aire, recorre 4,000 millones de años de atmósfera con su capa de ozono, y balancea, quema y clasifica óxidos básicos y ácidos.",
  },
  "innovaciones-ambientales-3d": {
    slug: "innovaciones-ambientales-3d",
    titulo: "Laboratorio 3D — Innovaciones tecnológicas para el ambiente",
    descripcion: "Instala una cosecha de lluvia, un humedal que depura aguas residuales y un manglar restaurado; mide con modelos reales cuánta agua guardas, qué tan limpia sale y cuánto frena la ola, y relaciona cada innovación con el subsistema terrestre que aprovecha.",
  },
  "quimica-organica-industria-3d": {
    slug: "quimica-organica-industria-3d",
    titulo: "Laboratorio 3D — Química orgánica en la industria",
    descripcion: "Sintetiza aspirina, paracetamol, aroma de plátano y bioetanol con moléculas 3D reales, alarga cadenas de PE, PET y nylon y relaciona cada grupo funcional con su producto e industria.",
  },
  "contaminantes-plasticos-3d": {
    slug: "contaminantes-plasticos-3d",
    titulo: "Laboratorio 3D — Contaminantes químicos y plásticos",
    descripcion: "Tira un plástico al mar y mira si flota o se hunde y cómo se rompe en microplásticos; sigue el DDT y el mercurio por la cadena alimenticia hasta tu plato, y decide si un residuo se recicla, se composta, se entierra o llega al río.",
  },
  "descubrimiento-celula-3d": {
    slug: "descubrimiento-celula-3d",
    titulo: "Laboratorio 3D — El descubrimiento de la célula: microscopios y teoría celular",
    descripcion: "Mira la misma muestra con los microscopios de Hooke, Leeuwenhoek, el siglo XIX, el óptico y el electrónico; calcula aumento total y tamaño real, y levanta los tres postulados de la teoría celular con el experimento de Pasteur.",
  },
  "fision-nuclear-etica-3d": {
    slug: "fision-nuclear-etica-3d",
    titulo: "Laboratorio 3D — Energía nuclear: fisión y ética",
    descripcion: "Controla la reacción en cadena de un reactor como el de Laguna Verde, calcula con E = mc² por qué una pastilla de uranio rinde lo que más de una tonelada de carbón, sigue los residuos durante miles de años y descubre que las antenas que conectan a un pueblo también pueden ubicar tu celular.",
  },
  "restauracion-ecosistemas-mexico-3d": {
    slug: "restauracion-ecosistemas-mexico-3d",
    titulo: "Laboratorio 3D — Conservación y restauración de ecosistemas en México",
    descripcion: "Diseña con presupuesto limitado un plan para una cuenca con ANP, pago por servicios ambientales, corredores y vedas; restaura un potrero año por año hasta volverlo selva, y diagnostica con datos reales qué funcionó con la vaquita marina, Cabo Pulmo y la mariposa monarca.",
  },
  "logica-compuertas-3d": {
    slug: "logica-compuertas-3d",
    titulo: "Laboratorio 3D — Lógica matemática y compuertas: conectivos, tablas de verdad y razonamientos",
    descripcion: "Enciende un foco con interruptores y compuertas para descubrir cuándo son verdaderos los conectivos, construye tablas de verdad para clasificar tautologías y contingencias, y separa el modus ponens y el tollens de las falacias en cuatro mundos posibles.",
  },
  "jerarquia-operaciones-3d": {
    slug: "jerarquia-operaciones-3d",
    titulo: "Laboratorio 3D — Jerarquía de operaciones",
    descripcion: "Resuelve expresiones en una torre 3D eligiendo qué operación va primero y ve el resultado equivocado de cada error, compara cómo leen distinto una calculadora, una hoja de cálculo y una persona, y usa paréntesis para llegar a una meta en la recta numérica.",
  },
  "estimacion-fermi-3d": {
    slug: "estimacion-fermi-3d",
    titulo: "Laboratorio 3D — Estimación y órdenes de magnitud",
    descripcion: "Estima cantidades enormes descomponiéndolas en factores y compáralas con datos reales en una regla logarítmica, redondea y trunca viendo a dónde rueda una canica, y caza resultados absurdos en recetas, cuentas y dosis.",
  },
  "viaje-paquete-internet-3d": {
    slug: "viaje-paquete-internet-3d",
    titulo: "Laboratorio 3D — El viaje de un paquete por Internet",
    descripcion: "Sigue un mensaje partido en paquetes por DNS, routers y el cable submarino MAREA, envía una consulta segura a una IA y verifica su respuesta, y decide la vida útil y el destino final de tu teléfono.",
  },
  "centro-datos-huella-nube-3d": {
    slug: "centro-datos-huella-nube-3d",
    titulo: "Laboratorio 3D — Centros de datos y la huella de la nube",
    descripcion: "Enfría un centro de datos en un clima como el de Querétaro y compara agua contra electricidad, decide los permisos de tus apps y mira a quién llegan tus datos, y diseña una política para que un trámite en línea no deje fuera a nadie.",
  },
  "software-libre-3d": {
    slug: "software-libre-3d",
    titulo: "Laboratorio 3D — Software libre y alternativas",
    descripcion: "Abre la caja de las cuatro libertades con seis licencias reales, rescata archivos de 2007 guardados en formatos abiertos y cerrados, y calcula cuánto cuesta equipar una sala de cómputo con licencias, suscripciones o software libre.",
  },
  "estudio-edicion-digital-3d": {
    slug: "estudio-edicion-digital-3d",
    titulo: "Laboratorio 3D — Estudio de edición de contenido digital",
    descripcion: "Abre una imagen hasta sus bits, comprímela con y sin pérdida, arma un cartel legible por capas y ajusta video y audio al peso que permiten los datos y equipos de tu comunidad.",
  },
  "alcance-publicacion-3d": {
    slug: "alcance-publicacion-3d",
    titulo: "Laboratorio 3D — Difusión digital: el alcance de una publicación",
    descripcion: "Publica en una red 3D de 150 cuentas y distingue alcance, impresiones e interacción, diseña una campaña comunitaria accesible con máximo dos canales y frena un rumor que se comparte 70 % más que el dato verificado.",
  },
  "casa-escuela-objetos-ingles-3d": {
    slug: "casa-escuela-objetos-ingles-3d",
    titulo: "Laboratorio 3D — Objects and spaces: describe el aula y la casa",
    descripcion: "Encuentra objetos en un aula 3D siguiendo instrucciones en inglés, recupera tus cosas en Lost and found describiéndolas por tamaño, forma y color, y acomoda una recámara con preposiciones de lugar y There is / There are.",
  },
  "clima-vestimenta-ingles-3d": {
    slug: "clima-vestimenta-ingles-3d",
    titulo: "Laboratorio 3D — People, clothes and weather: la plaza de la colonia",
    descripcion: "Cambia el clima de la plaza y repórtalo en inglés, viste a una persona según el pronóstico de su ciudad y describe a la gente de la parada sin juzgar su apariencia.",
  },
  "rutina-diaria-ingles-3d": {
    slug: "rutina-diaria-ingles-3d",
    titulo: "Laboratorio 3D — Daily routines: el día de Ana",
    descripcion: "Ordena y narra en inglés el día de Ana en una maqueta 3D con un sol que recorre el cielo, pon y di la hora en un reloj de manecillas, y cuenta en su calendario semanal para elegir el adverbio de frecuencia.",
  },
  "ciudad-direcciones-ingles-3d": {
    slug: "ciudad-direcciones-ingles-3d",
    titulo: "Laboratorio 3D — Directions in town: pide y da indicaciones",
    descripcion: "Sigue indicaciones en inglés para llevar a Emma por un barrio 3D, escribe rutas que Sam ejecuta al pie de la letra y ubica lugares con next to, across from, between y on the corner of.",
  },
  "relato-secuencia-ingles-3d": {
    slug: "relato-secuencia-ingles-3d",
    titulo: "Laboratorio 3D — Telling a story: secuencia, conectores y coherencia",
    descripcion: "Ordena, conecta y escribe anécdotas en inglés en un teatrino de viñetas 3D: pasado simple, conectores como first, then, suddenly, while, because y so, y coherencia temporal.",
  },
  "planes-futuro-ingles-3d": {
    slug: "planes-futuro-ingles-3d",
    titulo: "Laboratorio 3D — Plans and purposes: la colonia que planeamos",
    descripcion: "Decide si cada situación pide be going to, will o present continuous y mira la consecuencia en 3D, planea con fichas proyectos que transforman una colonia con to, so that y because, y escribe tus metas de next week a in five years.",
  },
  "habilidades-permisos-ingles-3d": {
    slug: "habilidades-permisos-ingles-3d",
    titulo: "Laboratorio 3D — Can you…? May I…? El centro comunitario",
    descripcion: "Entrevista con «Can you…?» a jóvenes que intentan nadar, cocinar o tocar la guitarra frente a ti para formar equipos, pide permiso con la cortesía adecuada a adultos y amigos, y lee los letreros del centro para escribir qué se puede y qué no.",
  },
  "cortesia-conversacion-ingles-3d": {
    slug: "cortesia-conversacion-ingles-3d",
    titulo: "Laboratorio 3D — Polite conversations: open, keep, close",
    descripcion: "Conversa en inglés en una cafetería, una fiesta, una videollamada y una clínica: abre, mantén y cierra con cortesía y empatía, ajusta tu registro a quien te escucha y reescribe las líneas descorteses mientras los personajes reaccionan.",
  },
  "mercado-necesidades-ingles-3d": {
    slug: "mercado-necesidades-ingles-3d",
    titulo: "Laboratorio 3D — Needs and wishes: el tianguis y el centro de acopio",
    descripcion: "Haz el mandado en un tianguis 3D pidiendo con I'd like y how much / how many sin pasarte del presupuesto, justifica decisiones vecinales con I'd rather… because…, y atiende con empatía a cinco vecinos en el centro de acopio.",
  },
  "terminal-horarios-ingles-3d": {
    slug: "terminal-horarios-ingles-3d",
    titulo: "Laboratorio 3D — Where and when? La terminal de autobuses",
    descripcion: "Pide información en una terminal de autobuses 3D con la palabra interrogativa correcta, responde a viajeros leyendo un tablero de salidas que cambia en vivo y atiende el módulo de información con respuestas cortas y completas.",
  },
  "lugares-recomendaciones-ingles-3d": {
    slug: "lugares-recomendaciones-ingles-3d",
    titulo: "Laboratorio 3D — Places to visit: Rincón del Colibrí",
    descripcion: "Describe con there is, there are y you can las maquetas 3D de un pueblo costero, lee una guía turística en inglés para llevar a cada visitante a su lugar y escribe recomendaciones con su razón que los turistas siguen y califican.",
  },
  "gustos-opiniones-ingles-3d": {
    slug: "gustos-opiniones-ingles-3d",
    titulo: "Laboratorio 3D — Likes and opinions: la feria de gustos",
    descripcion: "En la feria de gustos de una prepa, entrevista a tus compañeros con Do you like…?, grafica sus respuestas, forma mesas donde todos estén contentos y responde a sus opiniones con tu gusto, una razón y empatía.",
  },
  "dilema-tranvia-etica-3d": {
    slug: "dilema-tranvia-etica-3d",
    titulo: "Laboratorio 3D — Dilemas éticos: el tranvía y la balanza de argumentos",
    descripcion: "Decide y justifica en el dilema del tranvía y sus variantes, arma argumentos en dilemas cotidianos y clasifica por teoría ética o falacia las intervenciones del debate «¿Los fines justifican los medios?».",
  },
  "caverna-conocimiento-3d": {
    slug: "caverna-conocimiento-3d",
    titulo: "Laboratorio 3D — La caverna y el conocimiento: sombras, sentidos y certeza",
    descripcion: "Proyecta sombras desde el fuego de la caverna de Platón y descubre que objetos distintos dan la misma sombra, acompaña al prisionero liberado hasta el Sol, déjate engañar por una habitación de Ames y sube una creencia por la escalera de la certeza.",
  },
  "archivo-fuentes-historicas-3d": {
    slug: "archivo-fuentes-historicas-3d",
    titulo: "Laboratorio 3D — Archivo de fuentes históricas",
    descripcion: "Examina con la lupa la procedencia e intención de documentos de la expropiación petrolera de 1938, corrobora afirmaciones con hilos en un tablero de corcho, desenmascara una fuente con anacronismos y corrige una foto histórica descontextualizada antes de armar una interpretación argumentada.",
  },
  "preguntas-pasado-discursos-3d": {
    slug: "preguntas-pasado-discursos-3d",
    titulo: "Laboratorio 3D — Preguntas al pasado",
    descripcion: "Excava capas de tiempo bajo problemáticas actuales de México para formular preguntas históricas, ubica evidencias en una espiral del tiempo nombrando sus relaciones y teje una explicación con muchas voces.",
  },
  "agora-ciudadania-3d": {
    slug: "agora-ciudadania-3d",
    titulo: "Laboratorio 3D — Ágora: ciudadanía y democracia",
    descripcion: "Predice quién podía votar desde la Atenas clásica hasta la paridad de género, conduce una asamblea vecinal donde el procedimiento decide quién gana y quién queda fuera, y arma tu intervención en un debate distinguiendo hechos, valores y falacias.",
  },
};
