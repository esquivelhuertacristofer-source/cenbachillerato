export interface PracticaMeta {
  slug: string;
  titulo: string;
  descripcion?: string;
}

export const PRACTICAS_META: Record<string, PracticaMeta> = {
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
};
