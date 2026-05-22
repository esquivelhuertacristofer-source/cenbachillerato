/**
 * fix-videos-placeholder.ts
 * Convierte 34 actividades video_con_preguntas con URL placeholder a tipo lectura.
 * Estrategia: Opción B para todas — lecturas auténticas con contexto pedagógico.
 *
 * Idempotente: verifica tipo antes de actualizar.
 * NO ejecutar en producción sin revisar cada entrada.
 *
 * Uso: npx tsx scripts/fix-videos-placeholder.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

config({ path: resolve(process.cwd(), ".env.local") });
type SB = ReturnType<typeof createClient<Database>>;

// ── Tipos ───────────────────────────────────────────────────────────────────
interface PreguntaComprension {
  pregunta: string;
  respuesta_guia?: string;
}
interface Callout {
  tipo: 'info' | 'importante' | 'sabias';
  contenido: string;
}
interface ContenidoLectura {
  texto: string;
  fuente?: string;
  nivel_lectura?: 'basico' | 'intermedio' | 'avanzado';
  preguntas_comprension?: PreguntaComprension[];
  tiempo_estimado_minutos?: number;
  callouts?: Callout[];
}
interface Fix {
  codigo: string;
  nuevo_titulo: string;
  nuevo_contenido: ContenidoLectura;
}

// ── Mapa de correcciones ────────────────────────────────────────────────────
// Cada entrada: codigo de actividad → nuevo contenido de lectura
// tipo cambia a 'lectura', nivel_revision se marca 'robustecida'
const FIXES: Fix[] = [
  // ── 1 ───────────────────────────────────────────────────────────────────
  {
    codigo: 'LC-II-P02-A1',
    nuevo_titulo: '¿Cómo se construye un texto narrativo?',
    nuevo_contenido: {
      nivel_lectura: 'basico',
      tiempo_estimado_minutos: 15,
      fuente: 'CEN Bachillerato — UAC Lengua y Comunicación II',
      texto: `El texto narrativo es una de las formas más antiguas y universales de comunicación humana. Desde los relatos orales de comunidades indígenas hasta las novelas contemporáneas, narrar es organizar experiencias en el tiempo para que otro pueda comprenderlas y sentirlas.

Toda narración se sostiene sobre una estructura básica compuesta por tres momentos: la situación inicial, el nudo y el desenlace. En la situación inicial se presentan los personajes, el tiempo y el espacio donde ocurrirá la historia. El nudo es el corazón de la narración: el conflicto o problema que pone en movimiento a los personajes y que genera tensión. El desenlace es la resolución de ese conflicto, ya sea de manera feliz, trágica o abierta, dejando al lector con una sensación de cierre o de reflexión.

El narrador es la voz que cuenta la historia y su elección cambia radicalmente la forma en que el lector percibe los hechos. El narrador omnisciente lo sabe todo: conoce los pensamientos y sentimientos de todos los personajes y puede moverse libremente entre distintos momentos y lugares. El narrador en primera persona es un personaje dentro de la historia que cuenta desde su propia experiencia, lo que genera cercanía e intimidad pero limita la perspectiva. El narrador testigo observa los hechos desde fuera sin participar en ellos y sin acceso a los pensamientos ajenos, solo describe lo que ve.

En el cuento 'No oyes ladrar los perros' de Juan Rulfo, el narrador en primera persona —un padre que carga a su hijo herido— transmite el agotamiento físico y el dolor emocional de manera directa y sin adornos. El paisaje árido de Jalisco se convierte en reflejo del estado interno del personaje, lo que ilustra una técnica fundamental: la descripción del ambiente como proyección de los sentimientos.

Para construir personajes creíbles es necesario combinar descripción física con rasgos psicológicos y motivaciones claras. Un personaje que quiere algo, que enfrenta obstáculos y que actúa de acuerdo con su historia personal resulta verosímil aunque viva en un mundo fantástico.

Los conectores temporales son las bisagras del texto narrativo: organizan la secuencia de eventos y marcan la relación entre ellos. Expresiones como 'después', 'mientras tanto', 'al cabo de', 'en ese momento' y 'al día siguiente' guían al lector a través del tiempo de la historia y evitan que la narración se vuelva confusa o fragmentada.

Escribir un texto narrativo propio implica tomar decisiones sobre todos estos elementos antes de empezar: ¿Quién narra? ¿Dónde y cuándo ocurre? ¿Cuál es el conflicto central? ¿Cómo se resolverá? Esas decisiones forman el plan narrativo, una brújula que guía la escritura y evita que el texto se pierda.`,
      preguntas_comprension: [
        {
          pregunta: '¿Cuáles son los tres momentos de la estructura narrativa y qué función cumple cada uno?',
          respuesta_guia: 'Situación inicial (presenta personajes, tiempo y espacio), nudo (conflicto que genera tensión) y desenlace (resolución del conflicto).',
        },
        {
          pregunta: '¿Qué diferencia hay entre un narrador omnisciente y un narrador en primera persona?',
          respuesta_guia: 'El omnisciente conoce los pensamientos de todos los personajes y no tiene límites de perspectiva; el de primera persona solo conoce su propia experiencia y la cuenta desde adentro.',
        },
        {
          pregunta: '¿Para qué sirven los conectores temporales en un texto narrativo?',
          respuesta_guia: 'Organizan la secuencia de eventos, marcan relaciones temporales entre ellos y guían al lector a través del tiempo de la historia.',
        },
      ],
      callouts: [
        {
          tipo: 'sabias',
          contenido: 'Juan Rulfo escribió su cuento con un narrador en primera persona que nunca revela su nombre. Esa ausencia de nombre refuerza la universalidad del dolor que describe: podría ser cualquier padre en cualquier lugar de México.',
        },
      ],
    },
  },

  // ── 2 ───────────────────────────────────────────────────────────────────
  {
    codigo: 'LC-II-P06-A1',
    nuevo_titulo: 'El arte de reescribir: transformar un texto',
    nuevo_contenido: {
      nivel_lectura: 'intermedio',
      tiempo_estimado_minutos: 18,
      fuente: 'CEN Bachillerato — UAC Lengua y Comunicación II',
      texto: `Reescribir no es corregir errores de ortografía ni cambiar algunas palabras al azar. Reescribir es someter un texto a una transformación profunda que lo hace más claro, más rico o más adecuado a su propósito comunicativo. Es, según muchos escritores profesionales, la etapa más importante del proceso de escritura.

La reescritura opera mediante cuatro grandes estrategias que el escritor elige según lo que el texto necesita. La primera es la amplificación: añadir detalles sensoriales, ejemplos, datos o contexto que enriquecen la comprensión del lector. Un texto que dice 'hacía calor' puede amplificarse a 'el pavimento de la avenida irradiaba el calor acumulado del mediodía y el aire olía a asfalto quemado y tortillas de maíz'. La segunda es la condensación: eliminar lo redundante, lo que ya fue dicho, las frases de relleno que no aportan significado. Un texto conciso respeta el tiempo del lector y hace que cada palabra cuente.

La tercera estrategia es el cambio de voz narrativa. Si el texto original está escrito en tercera persona y se reescribe en primera, el efecto emocional cambia radicalmente: lo que era un reporte se convierte en testimonio. Cambiar de pasado a presente aumenta la sensación de inmediatez. La cuarta estrategia es la sustitución léxica: reemplazar palabras por sinónimos de registro más adecuado. 'Comer' puede convertirse en 'devorar', 'saborear', 'ingerir' o 'picotear' según el tono que se busca.

En México, el proceso editorial muestra estas estrategias en acción. Editoriales como Almadía, con sede en Oaxaca, son conocidas por su cuidado minucioso de los manuscritos: los editores trabajan con los autores en múltiples rondas de revisión antes de que un libro llegue a la imprenta. Editorial Planeta México, de mayor escala comercial, también documenta procesos de reescritura que a veces implican cambios profundos de estructura y voz.

Reconocer cuándo un texto necesita amplificación y cuándo necesita condensación es una habilidad que se desarrolla con la práctica y con la lectura atenta. Un buen ejercicio es tomar un párrafo propio, leerlo en voz alta y preguntar: ¿qué palabra podría eliminarse sin que se pierda significado? ¿Qué imagen podría añadirse para que el lector vea lo que yo vi?

La reescritura también implica distancia temporal: revisar un texto con horas o días de diferencia permite leerlo con ojos más frescos, detectar inconsistencias y encontrar oportunidades de mejora que eran invisibles en el momento de la escritura inicial. Escribir es reescribir, y reescribir es pensar con mayor profundidad.`,
      preguntas_comprension: [
        {
          pregunta: '¿Cuál es la diferencia entre amplificación y condensación como estrategias de reescritura?',
          respuesta_guia: 'La amplificación añade detalles, ejemplos y contexto para enriquecer el texto; la condensación elimina lo redundante para que cada palabra sea significativa.',
        },
        {
          pregunta: '¿Por qué el cambio de voz narrativa transforma la experiencia del lector?',
          respuesta_guia: 'Porque cambia la perspectiva y la distancia emocional: pasar de tercera a primera persona convierte un reporte en testimonio, generando mayor cercanía e implicación.',
        },
        {
          pregunta: '¿Por qué es útil dejar pasar tiempo antes de revisar un texto propio?',
          respuesta_guia: 'Porque la distancia temporal permite leer con ojos más frescos, detectar inconsistencias y encontrar oportunidades de mejora que no se veían al escribirlo.',
        },
      ],
      callouts: [
        {
          tipo: 'importante',
          contenido: 'La sustitución léxica no consiste en usar sinónimos del diccionario sin criterio. Cada sinónimo tiene matices distintos: no es lo mismo "caminar" que "deambular", "avanzar" o "marchar". Elegir bien requiere entender el registro y el tono del texto.',
        },
      ],
    },
  },

  // ── 3 ───────────────────────────────────────────────────────────────────
  {
    codigo: 'CH-I-P03-A1',
    nuevo_titulo: 'Nada ocurre por una sola razón: multicausalidad en la historia',
    nuevo_contenido: {
      nivel_lectura: 'basico',
      tiempo_estimado_minutos: 15,
      fuente: 'CEN Bachillerato — UAC Ciencias Históricas I',
      texto: `Cuando preguntamos por qué ocurrió un evento histórico, la respuesta rara vez es simple. Los fenómenos históricos son el resultado de múltiples causas que actúan al mismo tiempo, en distintos niveles y con diferente peso. A esta característica fundamental del proceso histórico la llamamos multicausalidad.

Comprender la multicausalidad implica distinguir entre dos grandes tipos de causas. Las causas inmediatas son aquellas que detonan el evento directamente, que ocurren justo antes del hecho histórico y parecen su causa obvia. Las causas estructurales son aquellas de largo plazo: condiciones económicas, sociales, culturales o políticas que se acumularon durante años o décadas y que crearon el terreno fértil para que el evento ocurriera.

La Revolución Mexicana de 1910 es un ejemplo poderoso de multicausalidad. Si solo miramos las causas inmediatas, podríamos señalar el Plan de San Luis Potosí proclamado por Francisco I. Madero en octubre de 1910, que llamó a levantarse en armas el 20 de noviembre. Pero esa proclama no habría tenido ningún efecto si no hubieran existido causas estructurales profundas acumuladas durante el porfiriato (1876-1910): la dictadura de Porfirio Díaz, que concentró el poder político y eliminó la competencia electoral; la concentración de la tierra en enormes haciendas mientras millones de campesinos vivían en condiciones de servidumbre; la influencia del anarquismo y el sindicalismo provenientes de Europa, que comenzaban a organizar a los trabajadores; la exclusión de clases medias urbanas de la vida política; y el empobrecimiento de comunidades indígenas despojadas de sus tierras comunales.

El monocausalismo —la tendencia a explicar un evento histórico con una sola causa— es un error frecuente porque simplifica la realidad y hace invisible la complejidad de los procesos sociales. Cuando alguien dice 'la Revolución estalló porque Madero lo convocó', está cometiendo un error monocausal: ignora décadas de acumulación de desigualdad y represión.

Para identificar causas en fuentes históricas es necesario preguntar: ¿a quién beneficiaba la situación existente antes del evento? ¿Quiénes tenían motivos para querer un cambio? ¿Qué condiciones materiales y políticas lo hicieron posible? ¿Qué ideas o valores legitimaban la acción colectiva? Estas preguntas abren una comprensión más rica y honesta del pasado.`,
      preguntas_comprension: [
        {
          pregunta: '¿Qué diferencia hay entre causas inmediatas y causas estructurales? Da un ejemplo de cada una en la Revolución Mexicana.',
          respuesta_guia: 'Causas inmediatas: el Plan de San Luis Potosí. Causas estructurales: la dictadura porfirista, la concentración de tierras, la influencia anarquista. Las inmediatas detonan el evento; las estructurales crean las condiciones de fondo.',
        },
        {
          pregunta: '¿Por qué es un error explicar un evento histórico con una sola causa?',
          respuesta_guia: 'Porque simplifica la realidad, hace invisible la complejidad de los procesos sociales y oculta las condiciones de largo plazo que hicieron posible el evento.',
        },
        {
          pregunta: '¿Qué preguntas puedes hacerle a una fuente histórica para identificar sus causas?',
          respuesta_guia: '¿A quién beneficiaba la situación anterior? ¿Quiénes tenían motivos para querer un cambio? ¿Qué condiciones lo hicieron posible? ¿Qué ideas legitimaban la acción?',
        },
      ],
      callouts: [
        {
          tipo: 'info',
          contenido: 'El historiador mexicano Enrique Krauze distingue entre la "Revolución de los caudillos" (Madero, Zapata, Villa, Carranza) y la "Revolución institucional" posterior. Cada fase tuvo sus propias causas y actores: la multicausalidad opera no solo al inicio de los procesos sino a lo largo de todo su desarrollo.',
        },
      ],
    },
  },

  // ── 4 ───────────────────────────────────────────────────────────────────
  {
    codigo: 'PM-II-P02-A1',
    nuevo_titulo: 'Del número a la letra: expresiones algebraicas',
    nuevo_contenido: {
      nivel_lectura: 'basico',
      tiempo_estimado_minutos: 16,
      fuente: 'CEN Bachillerato — UAC Pensamiento Matemático II',
      texto: `El álgebra es el puente entre el pensamiento aritmético concreto y el pensamiento matemático abstracto. Cuando pasamos de decir 'el doble de cinco más tres' a escribir '2x + 3', estamos usando el lenguaje algebraico: un sistema de símbolos que nos permite hablar de cantidades sin conocer su valor específico.

Una expresión algebraica es cualquier combinación de números, variables y operaciones matemáticas. La unidad básica es el monomio: una expresión con un solo término. En el monomio '5x²', el número 5 es el coeficiente (indica cuántas veces tenemos la variable), la letra x es la variable (representa una cantidad desconocida o variable), y el número 2 es el exponente (indica cuántas veces se multiplica la variable por sí misma). Cuando el coeficiente es 1, no se escribe: 'x²' significa lo mismo que '1x²'.

Un polinomio es una suma de monomios. Si tiene dos términos, como '3x + 7', se llama binomio. Si tiene tres, como 'x² + 4x - 2', se llama trinomio. Para sumar y restar polinomios, solo podemos combinar términos semejantes: aquellos que tienen la misma variable elevada al mismo exponente. Por ejemplo, '3x² + 2x + 5x² - x = 8x² + x', porque 3x² y 5x² son semejantes (ambos tienen x²), y 2x y -x también lo son.

La multiplicación de un monomio por un polinomio utiliza la propiedad distributiva: cada término del polinomio se multiplica por el monomio. Si queremos calcular '3x(2x² + x - 4)', distribuimos: '3x · 2x² + 3x · x - 3x · 4 = 6x³ + 3x² - 12x'.

Las expresiones algebraicas tienen aplicaciones directas en situaciones reales. Imaginemos que INFONAVIT aprueba la construcción de casas con lotes rectangulares cuyo largo es (2x + 5) metros y cuyo ancho es x metros. El área de cada lote se expresa como 'x(2x + 5) = 2x² + 5x' metros cuadrados. Si x = 6 metros, el área sería '2(36) + 5(6) = 72 + 30 = 102 m²'. Esta es exactamente la forma en que arquitectos e ingenieros civiles trabajan con medidas variables en los planos de diseño.

En arquitectura de vivienda social, las normas del INFONAVIT establecen dimensiones mínimas que se expresan como desigualdades algebraicas: el área del lote debe ser mayor o igual a cierto valor, lo que crea sistemas de restricciones que los diseñadores deben satisfacer al elegir las dimensiones.

Aprender a leer y escribir expresiones algebraicas es aprender el idioma con el que las matemáticas describen el mundo general, más allá de los casos particulares.`,
      preguntas_comprension: [
        {
          pregunta: '¿Qué elementos forman un monomio y qué representa cada uno?',
          respuesta_guia: 'Coeficiente (cuántas veces se tiene la variable), variable (cantidad desconocida) y exponente (cuántas veces se multiplica la variable por sí misma).',
        },
        {
          pregunta: '¿Qué son los términos semejantes y por qué solo se pueden combinar entre ellos?',
          respuesta_guia: 'Son términos con la misma variable elevada al mismo exponente. Solo se pueden combinar porque representan la misma "clase" de cantidad; sumar x² con x sería como sumar metros cuadrados con metros.',
        },
        {
          pregunta: '¿Cómo se aplica la propiedad distributiva al multiplicar un monomio por un polinomio?',
          respuesta_guia: 'Se multiplica el monomio por cada término del polinomio por separado y luego se suman los resultados.',
        },
      ],
      callouts: [
        {
          tipo: 'sabias',
          contenido: 'Las normas del INFONAVIT para vivienda social en México establecen que el área habitable mínima de una casa es de 42 m². Los arquitectos que diseñan estas casas usan expresiones algebraicas para ajustar dimensiones y cumplir con esa restricción en distintos tipos de lotes.',
        },
      ],
    },
  },

  // ── 5 ───────────────────────────────────────────────────────────────────
  {
    codigo: 'PM-II-P04-A1',
    nuevo_titulo: 'Ecuaciones lineales en situaciones reales',
    nuevo_contenido: {
      nivel_lectura: 'intermedio',
      tiempo_estimado_minutos: 17,
      fuente: 'CEN Bachillerato — UAC Pensamiento Matemático II',
      texto: `Una ecuación lineal es una igualdad matemática que involucra una variable elevada a la primera potencia. Su forma general es ax + b = c, donde a, b y c son números conocidos y x es la incógnita que buscamos. Resolver una ecuación lineal significa encontrar el valor de x que hace verdadera la igualdad.

El procedimiento para resolver una ecuación lineal sigue pasos lógicos y reversibles. Primero, se agrupan los términos con la variable en un lado de la igualdad y los términos numéricos en el otro, usando operaciones inversas: si hay una suma, se resta; si hay una multiplicación, se divide. Segundo, se simplifica cada lado. Tercero, se despeja la incógnita dividiéndola por su coeficiente. Cuarto, y fundamental, se verifica la solución sustituyendo el valor obtenido en la ecuación original: si ambos lados son iguales, la respuesta es correcta.

Plantear un problema en forma de ecuación lineal requiere traducir el lenguaje cotidiano al lenguaje matemático. Consideremos un ejemplo con planes de datos móviles en México. Telcel ofrece un plan con cargo fijo de 200 pesos al mes más 15 pesos por cada GB adicional consumido. Si al final del mes la factura fue de 425 pesos, ¿cuántos GB adicionales se consumieron? Traducimos: 200 + 15x = 425. Restamos 200 a ambos lados: 15x = 225. Dividimos entre 15: x = 15 GB adicionales. Verificamos: 200 + 15(15) = 200 + 225 = 425. Correcto.

Otro tipo de problema frecuente en ciencias involucra mezclas. Si en un laboratorio se mezclan dos soluciones y se necesita saber cuántos mililitros de una solución al 30% de concentración deben añadirse a 100 mL de agua para obtener una concentración del 10%, la ecuación lineal 0.30x = 0.10(x + 100) permite encontrar la respuesta.

El ahorro personal también genera ecuaciones lineales. Si una estudiante tiene 350 pesos ahorrados y ahorra 80 pesos cada semana, ¿en cuántas semanas tendrá 1,150 pesos para comprarse sus materiales de bachillerato? La ecuación es 350 + 80x = 1150, que da x = 10 semanas.

Las ecuaciones lineales son modelos matemáticos de relaciones proporcionales: describen situaciones donde una cantidad crece o decrece de forma constante respecto a otra. Reconocer esa estructura en situaciones reales es la habilidad central que este tema desarrolla.`,
      preguntas_comprension: [
        {
          pregunta: '¿Cuáles son los pasos para resolver una ecuación lineal? ¿Por qué es importante el paso de verificación?',
          respuesta_guia: 'Agrupar términos, simplificar, despejar la incógnita y verificar. La verificación es importante porque confirma que la solución es correcta y detecta posibles errores de cálculo.',
        },
        {
          pregunta: 'Plantea la ecuación lineal para el siguiente problema: una taquería vende tacos a 20 pesos cada uno. Al final del día la taquera tiene 1,400 pesos pero ya había gastado 200 en insumos. ¿Cuántos tacos vendió?',
          respuesta_guia: '20x - 200 = 1400, entonces 20x = 1600, x = 80 tacos.',
        },
        {
          pregunta: '¿En qué tipos de situaciones reales aparecen las ecuaciones lineales?',
          respuesta_guia: 'En situaciones con cargo fijo más costo variable (planes de datos, luz, gas), en mezclas de soluciones, en cálculos de ahorro con aportación constante, en velocidad y distancia con movimiento uniforme.',
        },
      ],
      callouts: [
        {
          tipo: 'importante',
          contenido: 'Antes de resolver una ecuación, verifica que hayas traducido bien el problema. El error más común no es matemático sino de lectura: confundir "el doble de la suma" con "la suma del doble", por ejemplo. Lee el enunciado dos veces antes de escribir la ecuación.',
        },
      ],
    },
  },

  // ── 6 ───────────────────────────────────────────────────────────────────
  {
    codigo: 'CNEYT-IV-P03-A1',
    nuevo_titulo: 'El pH: ácidos, bases y la química de lo cotidiano',
    nuevo_contenido: {
      nivel_lectura: 'basico',
      tiempo_estimado_minutos: 15,
      fuente: 'CEN Bachillerato — UAC Ciencias Naturales, Experimentales y Tecnología IV',
      texto: `Cada vez que exprimimos un limón, tomamos agua o aplicamos jabón en las manos, estamos interactuando con sustancias que tienen un grado de acidez o basicidad diferente. La escala que mide esta propiedad se llama pH, y va de 0 a 14: un número que sintetiza la concentración de iones hidrógeno en una solución.

Los ácidos tienen un pH menor a 7. Cuanto más bajo el número, más ácida y potencialmente corrosiva es la sustancia. El jugo de limón tiene un pH de aproximadamente 2, el vinagre de 3 y el café negro de 5. El ácido clorhídrico que produce el estómago humano tiene un pH entre 1.5 y 2, lo que lo hace suficientemente ácido para descomponer las proteínas de los alimentos. Cuando hay demasiado ácido gástrico se produce la acidez o gastritis.

Las bases, también llamadas álcalis, tienen un pH mayor a 7. El bicarbonato de sodio tiene un pH de 8.4, razón por la que se usa como antiácido: neutraliza el exceso de ácido en el estómago. El jabón de barra tiene un pH entre 9 y 10. La lejía (hipoclorito de sodio), usada para limpiar y desinfectar, tiene un pH de 12 a 13 y puede irritar la piel.

El pH neutro es exactamente 7 y corresponde al agua pura a 25°C. El agua potable puede tener un pH ligeramente diferente dependiendo de los minerales disueltos y el tratamiento al que fue sometida.

Para medir el pH sin instrumentos electrónicos podemos usar indicadores naturales. La col morada contiene antocianinas, pigmentos que cambian de color según el pH del medio: en soluciones ácidas se vuelven rojas o rosas, en neutras permanecen moradas y en básicas se tornan azules o verdes. Este es un experimento clásico y de bajo costo que se puede realizar en el laboratorio escolar o incluso en casa.

El control del pH es vital para la salud humana. La sangre debe mantenerse en un rango de pH muy estrecho: entre 7.35 y 7.45. Si el pH sanguíneo sale de ese rango, se producen condiciones médicas graves como acidosis o alcalosis. Los riñones y los pulmones trabajan constantemente para mantener ese equilibrio.

En México, la norma NOM-127-SSA1-2021 establece que el agua potable debe tener un pH entre 6.5 y 8.5 para ser segura para el consumo humano. La CONAGUA monitorea el pH de los cuerpos de agua del país para garantizar la calidad del recurso.`,
      preguntas_comprension: [
        {
          pregunta: '¿Qué indica el número pH y cuál es la diferencia entre un ácido y una base?',
          respuesta_guia: 'El pH mide la concentración de iones hidrógeno en una solución. Los ácidos tienen pH menor a 7 y los bases mayor a 7. Cuanto más alejado de 7, más intensa la propiedad.',
        },
        {
          pregunta: '¿Por qué es importante que la sangre humana mantenga un pH entre 7.35 y 7.45?',
          respuesta_guia: 'Porque ese rango es necesario para el funcionamiento correcto de las enzimas y procesos metabólicos. Fuera de ese rango se producen acidosis o alcalosis, condiciones médicas graves.',
        },
        {
          pregunta: '¿Cómo funciona la col morada como indicador natural de pH?',
          respuesta_guia: 'Sus antocianinas cambian de color según el pH: rojo en ácido, morado en neutro, azul-verde en básico.',
        },
      ],
      callouts: [
        {
          tipo: 'sabias',
          contenido: 'La lluvia ácida tiene un pH menor a 5.6. En zonas cercanas a la Ciudad de México, las lluvias pueden alcanzar pH de 4 o menos por la contaminación industrial y vehicular. Esto daña los bosques, los suelos y los monumentos históricos de piedra caliza.',
        },
      ],
    },
  },

  // ── 7 ───────────────────────────────────────────────────────────────────
  {
    codigo: 'CNEYT-IV-P07-A1',
    nuevo_titulo: 'Contaminantes químicos y plásticos: la crisis silenciosa',
    nuevo_contenido: {
      nivel_lectura: 'avanzado',
      tiempo_estimado_minutos: 20,
      fuente: 'CEN Bachillerato — UAC Ciencias Naturales, Experimentales y Tecnología IV',
      texto: `La contaminación química es uno de los problemas ambientales más complejos porque muchos de sus efectos son invisibles a simple vista, se acumulan lentamente en los ecosistemas y tienen consecuencias que no se manifiestan hasta décadas después de la exposición.

Los contaminantes pueden clasificarse en tres grandes grupos. Los metales pesados —plomo, mercurio, cadmio, arsénico— son elementos naturales que en altas concentraciones son altamente tóxicos. El plomo afecta el desarrollo neurológico en niños, y aunque México eliminó la gasolina con plomo en 1998, los suelos de ciudades antiguas todavía presentan concentraciones elevadas. El mercurio se concentra en peces de aguas profundas y puede causar daños al sistema nervioso central.

Los contaminantes orgánicos persistentes (COPs) son compuestos sintéticos que no se degradan fácilmente en la naturaleza: DDT, PCBs, dioxinas. Fueron ampliamente usados en agricultura e industria y ahora se encuentran en todos los rincones del planeta, incluyendo la grasa de osos polares en el Ártico, aunque nunca se usaron ahí.

Los microplásticos son fragmentos de plástico menores a 5 mm que provienen de la degradación de plásticos mayores o que se fabrican directamente como microesferas en cosméticos. Se han encontrado en el agua potable, en la sal de mesa, en el aire y en la sangre humana. Sus efectos a largo plazo en la salud son todavía objeto de investigación activa.

La bioacumulación y la biomagnificación explican por qué los contaminantes son especialmente peligrosos en los seres vivos. La bioacumulación ocurre cuando un organismo absorbe un contaminante más rápido de lo que puede eliminarlo, concentrándolo en sus tejidos. La biomagnificación ocurre cuando ese organismo es comido por otro, que a su vez es comido por otro: cada nivel de la cadena alimenticia concentra más el contaminante. Los depredadores tope —orcas, atunes, águilas— son los más afectados.

México genera aproximadamente 12.4 millones de toneladas de residuos sólidos urbanos al año, según datos de SEMARNAT 2022. Solo alrededor del 9.6% se recicla formalmente. La Ley General para la Prevención y Gestión Integral de los Residuos (LGPGIR) establece el marco jurídico, pero su aplicación es heterogénea entre estados.

El PET (tereftalato de polietileno) tarda aproximadamente 450 años en degradarse. Alternativas en desarrollo incluyen los bioplásticos derivados de almidón de maíz o caña de azúcar, y los polímeros biodegradables como el PLA. La economía circular propone rediseñar los productos para que sus materiales puedan recuperarse y reutilizarse indefinidamente, evitando que se conviertan en residuos.`,
      preguntas_comprension: [
        {
          pregunta: '¿Qué diferencia hay entre bioacumulación y biomagnificación? ¿Por qué los depredadores tope son los más vulnerables?',
          respuesta_guia: 'La bioacumulación es la concentración de un contaminante en un organismo; la biomagnificación es el aumento de esa concentración a lo largo de la cadena alimenticia. Los depredadores tope acumulan la suma de todos los niveles inferiores.',
        },
        {
          pregunta: '¿Qué hace persistentes a los COPs y por qué eso es un problema aunque se hayan dejado de usar?',
          respuesta_guia: 'No se degradan fácilmente, por lo que permanecen en el ambiente durante décadas. Aunque se prohiban, los ya emitidos siguen circulando en ecosistemas y organismos vivos.',
        },
        {
          pregunta: '¿Qué propone la economía circular como alternativa al modelo actual de residuos?',
          respuesta_guia: 'Rediseñar productos para que sus materiales puedan recuperarse y reutilizarse indefinidamente, evitando la generación de residuos desde el diseño mismo del producto.',
        },
      ],
      callouts: [
        {
          tipo: 'importante',
          contenido: 'En 2023 se detectaron microplásticos en muestras de sangre humana por primera vez en estudios clínicos. Aunque todavía se investiga su impacto en la salud, el hallazgo muestra que la contaminación plástica ya no es solo un problema ambiental externo: es parte de nuestra biología.',
        },
      ],
    },
  },

  // ── 8 ───────────────────────────────────────────────────────────────────
  {
    codigo: 'CS-III-P03-A1',
    nuevo_titulo: 'Las juventudes como sujetos políticos',
    nuevo_contenido: {
      nivel_lectura: 'basico',
      tiempo_estimado_minutos: 15,
      fuente: 'CEN Bachillerato — UAC Ciencias Sociales III',
      texto: `La juventud no es simplemente una etapa biológica determinada por la edad. Es también una construcción social: lo que significa ser joven, qué se espera de las personas jóvenes y qué derechos y responsabilidades tienen varía según la cultura, la clase social, el género, la época histórica y el contexto geográfico.

En México, la definición institucional de juventud abarca a las personas entre 12 y 29 años. El INJUVE (Instituto Nacional de la Juventud), creado en 1999, tiene la misión de diseñar políticas públicas dirigidas a este sector de la población. Sin embargo, las y los jóvenes no son solo destinatarios de políticas: son también actores que producen transformaciones sociales y políticas.

El movimiento #YoSoy132, surgido en mayo de 2012, es un ejemplo paradigmático de agencia política juvenil en México. Estudiantes universitarios de instituciones privadas y públicas se movilizaron para exigir una cobertura mediática más democrática durante las elecciones presidenciales de ese año. El movimiento mostró que los jóvenes podían organizarse horizontalmente, comunicarse a través de las redes sociales y plantear demandas políticas concretas sin necesitar de estructuras partidistas.

El derecho al voto es uno de los mecanismos formales de participación política. En México se puede votar a partir de los 18 años. Las elecciones de 2018 y 2024 registraron una participación juvenil significativa, y el voto joven fue considerado un factor relevante en los resultados. Pero la participación política no se agota en el voto: también incluye las organizaciones estudiantiles, los colectivos comunitarios, las cooperativas juveniles, las brigadas de reforestación, los grupos de activismo digital y las asambleas barriales.

La Constitución Política de los Estados Unidos Mexicanos (CPEUM) garantiza derechos para todas las personas, incluyendo las jóvenes: educación, salud, trabajo digno, libertad de expresión, asociación y participación política. Pero el reconocimiento formal no siempre se traduce en ejercicio efectivo de esos derechos.

Reconocer a las juventudes como sujetos históricos y políticos implica escuchar sus demandas, incluirlas en los espacios de decisión y entender que el presente —no solo el futuro— les pertenece. Las y los jóvenes no son los ciudadanos del mañana: son los ciudadanos de hoy.`,
      preguntas_comprension: [
        {
          pregunta: '¿Por qué decimos que la juventud es una construcción social y no solo una etapa biológica?',
          respuesta_guia: 'Porque lo que significa ser joven varía según la cultura, la clase social, el género, la época y el contexto. No hay una sola forma de ser joven: la sociedad define expectativas, derechos y roles distintos para personas de la misma edad según su contexto.',
        },
        {
          pregunta: '¿Qué mostró el movimiento #YoSoy132 sobre la capacidad política de los jóvenes en México?',
          respuesta_guia: 'Que pueden organizarse horizontalmente, comunicarse por redes sociales y plantear demandas políticas concretas sin depender de estructuras partidistas, ejerciendo agencia política real.',
        },
        {
          pregunta: '¿Cuáles son formas de participación política más allá del voto?',
          respuesta_guia: 'Organizaciones estudiantiles, colectivos comunitarios, cooperativas, brigadas de reforestación, activismo digital, asambleas barriales, movimientos sociales.',
        },
      ],
      callouts: [
        {
          tipo: 'info',
          contenido: 'En México, el 26% de la población tiene entre 15 y 29 años (INEGI 2020). Eso significa que aproximadamente uno de cada cuatro mexicanos es joven. Sus decisiones, demandas y formas de organizarse tienen un peso demográfico y político enorme.',
        },
      ],
    },
  },

  // ── 9 ───────────────────────────────────────────────────────────────────
  {
    codigo: 'CD-II-P05-A1',
    nuevo_titulo: 'Creatividad y ética en la producción digital',
    nuevo_contenido: {
      nivel_lectura: 'intermedio',
      tiempo_estimado_minutos: 17,
      fuente: 'CEN Bachillerato — UAC Ciudadanía Digital II',
      texto: `Producir contenido digital no es solo una actividad técnica o creativa: es también un acto con consecuencias sociales, legales y éticas. Cada vez que publicamos un video, escribimos una publicación o compartimos una imagen, tomamos decisiones que afectan a otras personas y al ambiente informativo en que vivimos.

Un contenido digital éticamente responsable cumple con varios principios fundamentales. La veracidad implica que la información que compartimos es verificada y verdadera, o que si es opinión, se presenta claramente como tal. El respeto a la privacidad significa no publicar datos personales, imágenes o información de otras personas sin su consentimiento. La no discriminación exige que el contenido no ataque, estereotipe o denigre a personas o grupos por su género, etnia, orientación sexual, discapacidad o cualquier otra condición. La transparencia implica declarar quiénes somos, qué intereses tenemos y de dónde proviene la información que presentamos.

Las licencias Creative Commons son herramientas legales que permiten a los creadores decidir cómo se puede usar su trabajo sin renunciar a sus derechos de autor. CC-BY permite usar el contenido siempre que se dé crédito al autor. CC-SA (Share Alike) exige que las obras derivadas mantengan la misma licencia. CC-NC (Non-Commercial) prohíbe el uso comercial sin autorización. Conocer estas licencias es esencial para crear y difundir contenido sin violar derechos de propiedad intelectual.

Los deepfakes son videos o audios manipulados con inteligencia artificial para hacer parecer que una persona dijo o hizo algo que nunca ocurrió. Identificar un deepfake requiere mirar con atención los parpadeos irregulares, las inconsistencias en la iluminación, los movimientos faciales poco naturales y, sobre todo, verificar la fuente original del contenido. La desinformación no siempre es obvia: a veces se presenta con el formato y el tono del periodismo serio.

En México, la Ley Olimpia (una serie de reformas al Código Penal adoptadas por los estados a partir de 2018) penaliza la difusión de contenido sexual íntimo sin consentimiento, también llamada violencia digital de género. Esta ley reconoce que la violencia puede ejercerse a través de medios digitales y tiene consecuencias reales en la vida de las víctimas.

El proceso creativo responsable sigue una ruta: idea inicial, investigación y verificación, boceto o borrador, producción, revisión ética (¿viola la privacidad de alguien? ¿Podría interpretarse como discriminatorio?) y difusión. Integrar la ética en cada etapa del proceso, no solo al final, es lo que distingue a un creador digital responsable.`,
      preguntas_comprension: [
        {
          pregunta: '¿Cuáles son los cuatro principios éticos de la producción de contenido digital? Explica brevemente cada uno.',
          respuesta_guia: 'Veracidad (información verificada), respeto a la privacidad (no publicar datos de otros sin consentimiento), no discriminación (no atacar a personas por sus características) y transparencia (declarar intereses y fuentes).',
        },
        {
          pregunta: '¿Qué diferencia hay entre una licencia CC-BY y una CC-NC?',
          respuesta_guia: 'CC-BY permite cualquier uso incluyendo comercial, siempre que se cite al autor. CC-NC prohíbe el uso comercial sin autorización del creador.',
        },
        {
          pregunta: '¿Qué señales pueden indicar que un video es un deepfake?',
          respuesta_guia: 'Parpadeos irregulares, inconsistencias en la iluminación o sombras, movimientos faciales poco naturales, falta de fuente original verificable.',
        },
      ],
      callouts: [
        {
          tipo: 'importante',
          contenido: 'La Ley Olimpia protege específicamente a las personas de la violencia digital de género, pero la responsabilidad ética va más allá de lo que la ley prohíbe. Antes de compartir cualquier contenido que involucre a otras personas, pregúntate: ¿lo compartiría si ellas pudieran verlo?',
        },
      ],
    },
  },

  // ── 10 ──────────────────────────────────────────────────────────────────
  {
    codigo: 'CS-II-P04-A1',
    nuevo_titulo: 'Poder, desigualdad y sus estructuras en la sociedad',
    nuevo_contenido: {
      nivel_lectura: 'intermedio',
      tiempo_estimado_minutos: 18,
      fuente: 'CEN Bachillerato — UAC Ciencias Sociales II',
      texto: `El poder es uno de los conceptos centrales de la sociología y la ciencia política. El sociólogo alemán Max Weber lo definió como la probabilidad de imponer la propia voluntad dentro de una relación social, incluso contra la resistencia de otros. Esta definición subraya que el poder no es solo la capacidad de ordenar, sino también la de ser obedecido.

Weber identificó tres tipos de dominación legítima, es decir, tres formas en que el poder es aceptado por quienes lo obedecen. La dominación tradicional se basa en la costumbre y el pasado: se obedece porque 'siempre ha sido así' (monarquías hereditarias, jerarquías familiares). La dominación carismática se basa en las cualidades extraordinarias percibidas en una persona: se obedece porque el líder inspira admiración y devoción (líderes religiosos, caudillos políticos). La dominación legal-racional se basa en reglas formales e impersonales: se obedece la ley, no a la persona (estados modernos, instituciones democráticas).

Las sociedades contemporáneas no son solo sistemas de poder político: son también estructuras de desigualdad que distribuyen de manera desigual los recursos, las oportunidades y el reconocimiento social. La interseccionalidad, concepto desarrollado por la jurista Kimberlé Crenshaw, muestra que la posición de una persona en la estructura social no está determinada por una sola característica sino por la combinación de clase social, género, etnia, edad, orientación sexual y otras variables que se potencian mutuamente.

En México, el coeficiente de Gini —medida de desigualdad donde 0 es perfecta igualdad y 1 es desigualdad absoluta— fue de 0.41 en 2022 según CONEVAL. Esto ubica a México entre los países de mayor desigualdad económica en América Latina. La estructura de clases en México muestra un contraste marcado: aproximadamente el 1.7% de la población puede clasificarse como clase alta; el 38% como clase media; el 38% como población vulnerable por ingresos o carencias sociales; y el 22% como población en pobreza (CONEVAL 2022).

El sociólogo francés Pierre Bourdieu añadió dos conceptos clave para entender cómo se reproduce la desigualdad. El capital cultural es el conjunto de conocimientos, habilidades, títulos educativos y disposiciones que facilitan el acceso a posiciones sociales privilegiadas. El capital social son las redes de relaciones y contactos que permiten acceder a recursos e información. Ambos se heredan y acumulan de manera desigual, perpetuando la desigualdad de generación en generación, incluso en sistemas formalmente igualitarios.`,
      preguntas_comprension: [
        {
          pregunta: '¿Cuáles son los tres tipos de dominación que identificó Weber y en qué se basa cada uno?',
          respuesta_guia: 'Tradicional (la costumbre y el pasado), carismática (cualidades extraordinarias del líder) y legal-racional (reglas formales e impersonales).',
        },
        {
          pregunta: '¿Qué es la interseccionalidad y por qué es importante para analizar la desigualdad?',
          respuesta_guia: 'Es el enfoque que muestra cómo clase, género, etnia y otras características se combinan para estructurar la posición social. Es importante porque la desigualdad no depende de una sola variable sino de cómo varias se potencian mutuamente.',
        },
        {
          pregunta: '¿Cómo contribuye el capital cultural y el capital social a reproducir la desigualdad?',
          respuesta_guia: 'Se heredan de manera desigual: quienes nacen en familias con más educación y redes de contacto tienen ventajas acumulativas que perpetúan la desigualdad incluso en sistemas formalmente igualitarios.',
        },
      ],
      callouts: [
        {
          tipo: 'info',
          contenido: 'El coeficiente de Gini de México (0.41) es mayor al promedio de los países de la OCDE (0.32). Países como Dinamarca o Finlandia tienen coeficientes de Gini de alrededor de 0.28, lo que muestra que la desigualdad económica no es inevitable sino el resultado de políticas redistributivas específicas.',
        },
      ],
    },
  },

  // ── 11 ──────────────────────────────────────────────────────────────────
  {
    codigo: 'PFH-II-P03-A1',
    nuevo_titulo: 'Bioética: cuando la ciencia y la moral se encuentran',
    nuevo_contenido: {
      nivel_lectura: 'intermedio',
      tiempo_estimado_minutos: 18,
      fuente: 'CEN Bachillerato — UAC Pensamiento Filosófico e Histórico II',
      texto: `La bioética es la disciplina que estudia las implicaciones morales de los avances en biología y medicina. El término fue acuñado por el oncólogo Van Rensselaer Potter en 1971, quien lo concibió como un puente entre las ciencias de la vida y los valores humanos. Desde entonces, la bioética ha crecido hasta convertirse en un campo interdisciplinario que involucra a médicos, filósofos, juristas, pacientes y ciudadanos.

Los cuatro principios fundamentales de la bioética fueron sistematizados por Tom Beauchamp y James Childress en su obra 'Principios de ética biomédica' (1979). El principio de autonomía reconoce el derecho de las personas a tomar decisiones informadas sobre su propia salud y cuerpo, sin coacción. El principio de beneficencia exige que los profesionales de la salud actúen siempre en beneficio del paciente. El principio de no maleficencia —'primero no dañar'— establece que ninguna intervención médica debe causar más daño que beneficio. El principio de justicia exige que los recursos y tratamientos médicos se distribuyan de manera equitativa.

Estos principios entran en tensión en numerosos dilemas bioéticos contemporáneos. En México, el aborto fue despenalizado en la Ciudad de México desde 2007 y hacia 2024 en doce estados de la república. El debate bioético sobre el aborto involucra tensiones entre la autonomía de las mujeres y diferentes concepciones del inicio de la vida. La eutanasia —la acción u omisión que provoca la muerte de un paciente con enfermedad terminal para aliviar su sufrimiento— no está legalizada en México, aunque el debate legislativo continúa.

La edición genética mediante la técnica CRISPR-Cas9 abre posibilidades de eliminar enfermedades hereditarias, pero también plantea preguntas sobre los límites de la intervención en el genoma humano: ¿se puede modificar a un embrión para prevenir una enfermedad? ¿Y para elegir características? Los comités de bioética del IMSS y el ISSSTE analizan estas preguntas en el contexto de la práctica médica mexicana.

La diferencia entre lo legal y lo ético es fundamental: algo puede ser legal sin ser ético, y algo puede ser éticamente cuestionable sin ser ilegal. El Caso Tuskegee, donde médicos estadounidenses observaron el progreso de la sífilis en hombres afroamericanos sin darles tratamiento entre 1932 y 1972, era legal pero profundamente antiético. La Declaración de Helsinki (1964, revisada múltiples veces) establece los principios éticos para la investigación médica en seres humanos y es el referente internacional más importante en este campo.`,
      preguntas_comprension: [
        {
          pregunta: '¿Cuáles son los cuatro principios de Beauchamp y Childress y qué significa cada uno?',
          respuesta_guia: 'Autonomía (derecho a decidir sobre la propia salud), beneficencia (actuar en beneficio del paciente), no maleficencia (no causar más daño que beneficio) y justicia (distribución equitativa de recursos).',
        },
        {
          pregunta: '¿Por qué el Caso Tuskegee es considerado un ejemplo de falta de ética aunque era legal?',
          respuesta_guia: 'Porque los médicos privaron a los pacientes de un tratamiento existente sin su consentimiento informado, violando los principios de beneficencia, no maleficencia y autonomía, aunque no había una ley que lo prohibiera explícitamente en ese momento.',
        },
        {
          pregunta: '¿Qué dilemas bioéticos están actualmente en debate en México y qué principios entran en tensión?',
          respuesta_guia: 'El aborto (autonomía vs. diferentes concepciones del inicio de la vida), la eutanasia (autonomía y no maleficencia vs. principios religiosos y legales) y la edición genética (beneficencia vs. límites de la intervención en el genoma).',
        },
      ],
      callouts: [
        {
          tipo: 'importante',
          contenido: 'La bioética no busca dar respuestas definitivas a preguntas imposibles, sino garantizar que las decisiones que afectan la vida y la salud de las personas se tomen con rigor ético, respeto a los derechos humanos y transparencia. Los comités de bioética hospitalaria existen precisamente para este fin.',
        },
      ],
    },
  },

  // ── 12 ──────────────────────────────────────────────────────────────────
  {
    codigo: 'IN-IV-P02-A1',
    nuevo_titulo: 'Better, Best, or Different? Comparatives and Superlatives',
    nuevo_contenido: {
      nivel_lectura: 'basico',
      tiempo_estimado_minutos: 15,
      fuente: 'CEN Bachillerato — UAC Inglés IV',
      texto: `Comparatives and superlatives are two of the most useful grammatical tools in English for expressing preferences, making choices, and evaluating options. Once you understand how they work, you can use them in almost every conversation.

Comparative adjectives are used to compare two things. For short adjectives (one syllable), we add -er and then the word 'than': fast becomes faster than, big becomes bigger than, old becomes older than. For longer adjectives (two or more syllables), we use 'more' before the adjective: interesting becomes more interesting than, expensive becomes more expensive than, comfortable becomes more comfortable than.

Superlative adjectives are used to compare one thing with all others in a group. For short adjectives, we add 'the' + '-est': the fastest, the biggest, the oldest. For longer adjectives, we use 'the most': the most interesting, the most expensive, the most comfortable.

Some adjectives are irregular and must be memorized. 'Good' becomes 'better' in the comparative and 'the best' in the superlative. 'Bad' becomes 'worse' and 'the worst'. 'Far' becomes 'further' (or 'farther') and 'the furthest'. These three are the most common irregular forms and they appear in everyday English constantly.

There are two common mistakes to avoid. The first is the double comparative: saying 'more faster' or 'more bigger'. Since 'faster' already is the comparative of 'fast', adding 'more' creates a redundant double comparison. The second is the double superlative: saying 'the most best'. Since 'best' is already the superlative of 'good', 'the most' is unnecessary.

In a Mexican context, we can practice comparatives with things we know: Mexico City is bigger than Guadalajara, but Monterrey is more industrial than Oaxaca. Tacos are more popular than tortas in many parts of the country, but tamales are the most traditional food for Christmas and Dia de Reyes. The Metro in Mexico City is cheaper than the Metrobus, but the Metrobus is faster than the pesero on many routes.

To express preferences politely with comparatives, use structures like: I think tacos are more practical than tamales because you can eat them on the go. I prefer the metro because it is faster than the pesero and more affordable than a taxi. In my opinion, Oaxaca is more beautiful than any other city I have visited because of its architecture and food.

Practice: write three sentences comparing two Mexican cities, foods, or means of transport using comparatives and superlatives.`,
      preguntas_comprension: [
        {
          pregunta: 'What is the difference between a comparative and a superlative adjective? Give one example of each.',
          respuesta_guia: 'A comparative compares two things (faster than, more interesting than); a superlative compares one thing with all others in a group (the fastest, the most interesting).',
        },
        {
          pregunta: 'What are the two common mistakes with comparatives and superlatives? How can you avoid them?',
          respuesta_guia: 'Double comparative (more faster) and double superlative (the most best). Avoid them by never adding more/most to an already comparative or superlative form.',
        },
        {
          pregunta: 'What are the irregular comparative and superlative forms of good, bad, and far?',
          respuesta_guia: 'Good: better, the best. Bad: worse, the worst. Far: further/farther, the furthest/farthest.',
        },
      ],
      callouts: [
        {
          tipo: 'sabias',
          contenido: 'In everyday English, comparatives are used not just to compare things but also to describe changes over time: English is getting easier every day. The city is becoming more polluted. Prices are higher than last year. This use of comparatives with verbs like get, become, and grow is very common in conversation.',
        },
      ],
    },
  },

  // ── 13 ──────────────────────────────────────────────────────────────────
  {
    codigo: 'IN-II-P06-A1',
    nuevo_titulo: 'How to Ask for and Give Directions in English',
    nuevo_contenido: {
      nivel_lectura: 'basico',
      tiempo_estimado_minutos: 14,
      fuente: 'CEN Bachillerato — UAC Inglés II',
      texto: `Knowing how to ask for and give directions in English is one of the most practical communication skills you can develop. Whether you are helping a foreign tourist navigate your city or asking for help in an English-speaking country, these phrases are immediately useful.

To ask for directions politely, start with an excuse: Excuse me, could you help me? Then ask your question: How do I get to the nearest pharmacy? Where is the bus station? Is there a bank near here? Is it far from here? Can I walk there or should I take a bus?

To give directions clearly, use these key phrases. Turn left at the traffic light. Turn right at the corner. Go straight ahead for two blocks. Take the first street on the left. Take the second street on the right. It is on your left. It is on your right. You will see it on the corner.

Prepositions of place are essential for giving precise directions. The pharmacy is next to the supermarket. The school is opposite the park. The bakery is between the bank and the butcher shop. The clinic is on the corner of Reforma and Juarez. The market is in front of the municipal palace. The bus stop is behind the church. Across from the plaza, you will find the post office.

In Mexican cities and towns, people often give directions using local landmarks rather than street names or numbers, because in practice street addresses are rarely memorized. A Mexican might say: go past the OXXO, turn left at the taqueria, and the secondary school is right next to the pharmacy, you cannot miss it. This landmark-based navigation is very common in smaller towns where everyone knows the local reference points.

Transport vocabulary is also useful in this context. You can take the camion (bus), the metro, the pesero (minibus), or a taxi. Many cities now also have bicicletas publicas (public bicycles) available. If the destination is close, you can go on foot: it is only a five-minute walk from here.

Practice dialogue: A tourist stops you on the street. She says: Excuse me, I am looking for the health center. Is it far? You look at the map in your head and give her clear directions using at least four of the phrases above.`,
      preguntas_comprension: [
        {
          pregunta: 'What are three phrases you can use to ask for directions politely in English?',
          respuesta_guia: 'Excuse me, how do I get to...? / Where is the nearest...? / Is it far from here? / Can I walk there?',
        },
        {
          pregunta: 'What is the difference between "next to", "opposite", and "between" as prepositions of place?',
          respuesta_guia: '"Next to" means right beside something; "opposite" means facing it across a street or space; "between" means in the middle of two things.',
        },
        {
          pregunta: 'Why do Mexicans often use landmarks instead of street names when giving directions?',
          respuesta_guia: 'Because street addresses are rarely memorized in practice, and local landmarks like OXXO stores, churches, or markets are known by everyone in the community and are easier to use as reference points.',
        },
      ],
      callouts: [
        {
          tipo: 'info',
          contenido: 'When you are not sure of directions in an English-speaking context, it is perfectly acceptable to say: I am sorry, I am not from here. I think it is that way but I am not completely sure. You might want to ask someone else to be certain. Being honest about uncertainty is more helpful than giving wrong directions.',
        },
      ],
    },
  },

  // ── 14 ──────────────────────────────────────────────────────────────────
  {
    codigo: 'CNEYT-II-P02-A1',
    nuevo_titulo: 'Transformación y conservación de la energía',
    nuevo_contenido: {
      nivel_lectura: 'basico',
      tiempo_estimado_minutos: 15,
      fuente: 'CEN Bachillerato — UAC Ciencias Naturales, Experimentales y Tecnología II',
      texto: `Uno de los principios más fundamentales de la física es la ley de conservación de la energía, también llamada primer principio de la termodinámica: la energía no se crea ni se destruye, solo se transforma de una forma a otra. La cantidad total de energía en un sistema cerrado permanece constante.

Existen varios tipos de energía. La energía cinética es la energía del movimiento: cualquier objeto que se mueve la posee. La energía potencial gravitatoria es la energía almacenada en la posición de un objeto respecto al suelo: una roca en lo alto de una montaña tiene más energía potencial que la misma roca al pie de ella. La energía potencial elástica es la almacenada en objetos deformados que pueden recuperar su forma, como un resorte comprimido. La energía térmica es la energía asociada al movimiento de las partículas que forman una sustancia: a mayor temperatura, mayor energía térmica. La energía química está almacenada en los enlaces entre átomos de las moléculas: los alimentos, el combustible y las baterías son reservas de energía química. La energía eléctrica es la asociada al movimiento de cargas eléctricas.

Las transformaciones de energía ocurren constantemente en nuestra vida cotidiana. Cuando una pila química alimenta un foco LED, la energía química de la pila se convierte en energía eléctrica que fluye por el circuito y luego en energía luminosa (luz) y una pequeña cantidad de energía térmica (calor). Cuando una plancha eléctrica funciona, convierte energía eléctrica en energía térmica. Cuando un motor eléctrico mueve un ventilador, convierte energía eléctrica en energía cinética del movimiento del aire.

La eficiencia energética es el porcentaje de energía de entrada que se convierte en energía útil. Un foco incandescente tiene una eficiencia de solo 5%: el 95% de la energía eléctrica se convierte en calor, no en luz. Un foco LED tiene una eficiencia de 25-30%, razón por la que consume mucha menos electricidad para producir la misma cantidad de luz.

México generó aproximadamente 324 TWh de energía eléctrica en 2023 (CFE). Para producir esa energía de manera más limpia, el país ha desarrollado proyectos de energías renovables: parques eólicos en el Istmo de Tehuantepec en Oaxaca, plantas solares en el desierto de Sonora y aprovechamiento de la energía geotérmica en Michoacán, donde el calor interno de la tierra se convierte en electricidad.`,
      preguntas_comprension: [
        {
          pregunta: '¿Qué establece la ley de conservación de la energía?',
          respuesta_guia: 'Que la energía no se crea ni se destruye, solo se transforma de una forma a otra, y la cantidad total en un sistema cerrado permanece constante.',
        },
        {
          pregunta: 'Describe la cadena de transformaciones de energía que ocurre cuando cargas tu teléfono con un cargador eléctrico.',
          respuesta_guia: 'Energía eléctrica de la red → energía química almacenada en la batería del teléfono. Al usar el teléfono: energía química → eléctrica → luminosa (pantalla) + cinética (vibración) + térmica (calor del procesador).',
        },
        {
          pregunta: '¿Por qué los focos LED son más eficientes que los incandescentes?',
          respuesta_guia: 'Porque convierten un mayor porcentaje de la energía eléctrica en luz y una menor proporción en calor: 25-30% de eficiencia vs. 5% de los incandescentes.',
        },
      ],
      callouts: [
        {
          tipo: 'sabias',
          contenido: 'La geotermia en México aprovecha el calor del interior de la Tierra. La planta geotérmica de Cerro Prieto en Baja California es la más grande de América Latina y produce electricidad aprovechando el vapor de agua que emerge naturalmente del subsuelo. Esta es energía que literalmente viene del núcleo de la Tierra.',
        },
      ],
    },
  },

  // ── 15 ──────────────────────────────────────────────────────────────────
  {
    codigo: 'CNEYT-II-P06-A1',
    nuevo_titulo: 'Consumo energético e impacto ambiental',
    nuevo_contenido: {
      nivel_lectura: 'avanzado',
      tiempo_estimado_minutos: 20,
      fuente: 'CEN Bachillerato — UAC Ciencias Naturales, Experimentales y Tecnología II',
      texto: `Cada vez que usamos energía —encendemos una luz, usamos el transporte, cocinamos o compramos un producto manufacturado— generamos una emisión de gases de efecto invernadero que contribuye al cambio climático. La huella de carbono es la medida de esa emisión: se expresa en kilogramos o toneladas de CO2 equivalente (CO2e) y permite comparar el impacto climático de actividades muy distintas.

México emitió aproximadamente 748 millones de toneladas de CO2 equivalente en 2022 (INECC), lo que lo ubica en el puesto 12 de los países con mayores emisiones absolutas a nivel global. Sin embargo, las emisiones per cápita mexicanas son significativamente menores que las de países como Estados Unidos o Canadá, lo que introduce una dimensión de justicia climática: los países que más han emitido históricamente no son necesariamente los más vulnerables a sus consecuencias.

El mix energético de México sigue siendo mayoritariamente fósil: según la SENER, en 2023 aproximadamente el 76% de la energía primaria provenía de combustibles fósiles (gas natural, petróleo y carbón). La transición hacia energías renovables está contemplada en el PRODESEN 2024-2038 (Programa de Desarrollo del Sistema Eléctrico Nacional), que proyecta aumentar la participación de fuentes limpias, aunque los ritmos de implementación han sido objeto de debate político y técnico.

Las energías renovables —solar, eólica, hidroeléctrica, geotérmica— tienen la ventaja de no emitir CO2 durante la generación, pero presentan el desafío de la intermitencia: el sol no brilla de noche y el viento no sopla siempre. El almacenamiento de energía mediante baterías de gran escala es la solución técnica en desarrollo, pero todavía es costosa y su producción misma tiene una huella ambiental considerable.

A escala personal, la huella de carbono se distribuye aproximadamente así: el transporte representa cerca del 50% de las emisiones individuales (especialmente si se usa automóvil particular con combustión interna), la alimentación el 25% (la producción de carne de res es particularmente intensiva en emisiones), el hogar el 20% (climatización, electrodomésticos, calentadores de agua) y el consumo de bienes manufacturados el 5% restante. Conocer esta distribución permite identificar dónde pequeños cambios de comportamiento tienen mayor impacto.

El INECC pone a disposición del público calculadoras de huella de carbono en línea que permiten estimar las emisiones personales y comparar alternativas. Reducir la huella de carbono no requiere sacrificar bienestar, sino hacer elecciones informadas: transporte público vs. auto, dieta con menos carne roja, electrodomésticos eficientes y energía renovable cuando se tiene la opción.`,
      preguntas_comprension: [
        {
          pregunta: '¿Qué es la huella de carbono y por qué se mide en CO2 equivalente y no solo en CO2?',
          respuesta_guia: 'Es la medida de las emisiones de gases de efecto invernadero asociadas a una actividad. Se mide en CO2 equivalente porque existen otros gases (metano, óxido nitroso) que tienen distinto potencial de calentamiento y se convierten a una unidad común para poder compararlos.',
        },
        {
          pregunta: '¿Cuál es el principal desafío de las energías renovables y cómo se busca resolverlo?',
          respuesta_guia: 'La intermitencia: el sol y el viento no están disponibles siempre. Se busca resolver con sistemas de almacenamiento de energía como baterías de gran escala y con redes inteligentes que equilibren oferta y demanda.',
        },
        {
          pregunta: '¿En qué área de la vida cotidiana se concentra la mayor parte de la huella de carbono personal y qué cambio tendría más impacto?',
          respuesta_guia: 'En el transporte (50%). El cambio de mayor impacto sería reducir el uso del automóvil particular de combustión interna y sustituirlo por transporte público, bicicleta o vehículo eléctrico.',
        },
      ],
      callouts: [
        {
          tipo: 'importante',
          contenido: 'La justicia climática es un concepto central en los debates sobre cambio climático: los países más pobres, que han emitido históricamente menos gases de efecto invernadero, son frecuentemente los más vulnerables a sus efectos (sequías, inundaciones, pérdida de cosechas). México se considera un país de alta vulnerabilidad climática a pesar de no ser un gran emisor per cápita.',
        },
      ],
    },
  },

  // ── 16 ──────────────────────────────────────────────────────────────────
  {
    codigo: 'IN-IV-P05-A1',
    nuevo_titulo: 'Plans and Goals: Be Going To and Will',
    nuevo_contenido: {
      nivel_lectura: 'intermedio',
      tiempo_estimado_minutos: 16,
      fuente: 'CEN Bachillerato — UAC Inglés IV',
      texto: `In English, we use two main structures to talk about the future: be going to and will. Although both refer to future events, they are used in different situations and their choice changes the meaning of what we say.

We use 'be going to' for plans and intentions that were already decided before the moment of speaking. This means the person thought about it, made a decision, and now announces it. For example: I am going to study nursing at the university next year — this means the person already applied or made that decision. She is going to visit her grandparents this weekend — she already called and arranged the visit. They are going to start a community garden in their neighborhood — they already talked about it and made plans.

We use 'will' for two main situations. First, for spontaneous decisions made at the moment of speaking: Oh, you are carrying a lot of bags, I will help you. It is very hot in here, I will open the window. Second, for predictions about the future, especially when we have evidence or make a logical guess: Look at those clouds, I think it will rain this afternoon. According to the report, prices will increase next year. Technology will change education in the next decade.

Common time expressions that go with future tenses include: next week, next month, next year, in the future, tomorrow, soon, in five years, by the end of the semester. These expressions help make the future reference clear.

Contrasting the two structures is important. 'I am going to visit my grandparents in Veracruz next holiday' tells us this is a plan already in place. 'I will visit my grandparents if I have time' tells us it is a conditional prediction, not yet decided. The difference matters in real communication.

In the context of bachillerato in Mexico, students talk about future plans constantly: plans to graduate, to take the university entrance exam (examen de admision), to learn a trade, to help in their community. Practice by interviewing a classmate: What are you going to do after bachillerato? Do you think you will continue studying? What skills will be most important for your future?

Write at least five sentences about your own plans and predictions using both be going to and will.`,
      preguntas_comprension: [
        {
          pregunta: 'What is the main difference between be going to and will when talking about the future?',
          respuesta_guia: 'Be going to is used for plans already decided before speaking; will is used for spontaneous decisions made at the moment of speaking or for predictions.',
        },
        {
          pregunta: 'Which structure would you use in each situation: (a) You see your friend struggling with heavy books and you decide to help. (b) You bought a bus ticket to Oaxaca next Friday.',
          respuesta_guia: '(a) Will: I will help you — spontaneous decision. (b) Be going to: I am going to travel to Oaxaca next Friday — already planned.',
        },
        {
          pregunta: 'Write two sentences about your life goals: one with be going to and one with will.',
          respuesta_guia: 'Open answer. Example: I am going to study graphic design at the university. / I think technology will change the way artists work in the next ten years.',
        },
      ],
      callouts: [
        {
          tipo: 'info',
          contenido: 'In informal spoken English, "going to" is very often contracted to "gonna": I am gonna study. He is gonna be late. While this is common in speech and informal writing, in academic and formal English you should write the full form: going to.',
        },
      ],
    },
  },

  // ── 17 ──────────────────────────────────────────────────────────────────
  {
    codigo: 'IN-IV-P08-A1',
    nuevo_titulo: 'A2+ English: Putting It All Together',
    nuevo_contenido: {
      nivel_lectura: 'avanzado',
      tiempo_estimado_minutos: 20,
      fuente: 'CEN Bachillerato — UAC Inglés IV',
      texto: `Reaching the A2+ level in English means you can communicate in familiar situations, understand basic texts, and express yourself on everyday topics. This final review consolidates the key grammar and skills of the level and points the way toward B1.

The core grammar of A2+ English includes several tenses and structures. The simple present describes habits, routines, and facts: I study every day. Water boils at 100 degrees Celsius. The simple past narrates completed actions: She visited Teotihuacan last summer. We finished the project yesterday. The present perfect, formed with have or has plus the past participle, talks about experiences without specifying when they happened: I have eaten mole negro. Have you ever visited a cenote? It also describes situations that started in the past and continue now: I have lived in Puebla for three years. We have not seen each other since January.

Comparative and superlative adjectives allow you to evaluate and express preferences. Future structures — be going to for plans and will for predictions and spontaneous decisions — let you discuss what comes next. These grammar tools work together in real communication.

At A2+, you can produce four main text types. A narrative tells a story with a beginning, middle, and end: What happened last weekend? A description paints a picture of a person, place, or object: What does your town look like? An instruction explains how to do something step by step: How do you make tamales? An opinion expresses your view with reasons: Do you think social media is good for young people?

Reading strategies at this level include skimming, which means reading quickly to get the general topic without reading every word, and scanning, which means looking for specific information like a name or a number. Both are essential for managing real texts efficiently.

Writing at A2+ follows a simple but effective structure: a topic sentence that states the main idea, supporting details or examples, and a conclusion that summarizes or gives your opinion. This three-part structure works for paragraphs, emails, and short essays.

The Common European Framework of Reference (CEFR) describes A2 learners as people who can understand sentences and frequently used expressions related to areas of most immediate relevance. Moving from A2 to B1 means reading longer, more complex texts, writing more detailed compositions, listening to natural-speed conversations, and expanding vocabulary to around 2,000 word families.`,
      preguntas_comprension: [
        {
          pregunta: 'What is the difference between using the simple past and the present perfect? Give an example of each.',
          respuesta_guia: 'Simple past: specific completed action with a time reference (I visited Oaxaca last year). Present perfect: experience without a specific time or a situation continuing to the present (I have visited Oaxaca / I have studied English for two years).',
        },
        {
          pregunta: 'What are the four text types you should be able to produce at A2+ level?',
          respuesta_guia: 'Narrative (telling a story), description (describing a person, place or object), instruction (explaining how to do something), and opinion (expressing your view with reasons).',
        },
        {
          pregunta: 'What is the difference between skimming and scanning as reading strategies?',
          respuesta_guia: 'Skimming is reading quickly to get the general topic or main idea. Scanning is looking for specific information like a name, date, or number without reading everything.',
        },
      ],
      callouts: [
        {
          tipo: 'importante',
          contenido: 'The CEFR is the international standard used to describe and measure language skills. A2 is called Elementary, B1 is called Intermediate. Most university entrance requirements in Mexico ask for at least B1 English. The good news is that A2 to B1 is a gradual progression: every text you read and every conversation you have in English moves you closer to B1.',
        },
      ],
    },
  },

  // ── 18 ──────────────────────────────────────────────────────────────────
  {
    codigo: 'IN-III-P06-A1',
    nuevo_titulo: 'How to Give Instructions in English',
    nuevo_contenido: {
      nivel_lectura: 'intermedio',
      tiempo_estimado_minutos: 16,
      fuente: 'CEN Bachillerato — UAC Inglés III',
      texto: `Giving clear instructions is one of the most practical uses of English in everyday life. Whether you are explaining a recipe, describing how to use an app, or guiding someone through a task at school or work, the ability to give step-by-step instructions clearly and in the right order is an essential skill.

In English, instructions are given using the imperative form of the verb: the base form without a subject. This makes instructions direct and unambiguous. Open the document. Click on the menu. Select the file. Press enter. Type your name. The subject (you) is understood and does not need to be stated.

Sequence connectors organize instructions so the listener or reader can follow them in order. First introduces the initial step. Then and next introduce the following steps. After that signals a step that depends on the one before it. Finally introduces the last step. For example: First, wash and peel the avocados. Then, mash them in a bowl with a fork. Next, add lime juice, salt, and chopped onion. After that, stir everything together. Finally, taste and adjust the seasoning.

Instructions can be made more precise and helpful with modifiers. Use 'always' to indicate a step that must never be skipped: Always save your document before closing the program. Use 'make sure to' to emphasize a critical step: Make sure to stir the mixture slowly so it does not burn. Use 'be careful not to' for warnings: Be careful not to add too much chili, especially if you are cooking for children.

Negative imperatives prevent mistakes: Do not press the red button before the system is ready. Never share your password with anyone, not even your friends. Do not open the oven before the timer goes off.

In a Mexican school context, you might write instructions for a classmate on how to complete a digital assignment: how to upload a file to the school platform, how to format a document, or how to send an email to a teacher. In a kitchen context, you might translate a Mexican recipe into English instructions. Guacamole, agua de jamaica, and arroz con leche are classic recipes with clear, sequential steps that make excellent practice for writing instructions.

Practice: choose one Mexican recipe or one digital task and write clear instructions in English using at least six steps with appropriate sequence connectors.`,
      preguntas_comprension: [
        {
          pregunta: 'Why do we use the imperative form to give instructions? Give three examples.',
          respuesta_guia: 'Because instructions are direct commands where the subject (you) is understood. Examples: Open the file. Click the button. Press enter.',
        },
        {
          pregunta: 'What is the function of sequence connectors in instructions? List five in order.',
          respuesta_guia: 'They organize steps so the listener can follow them correctly. First, then, next, after that, finally.',
        },
        {
          pregunta: 'What is the difference between a negative imperative and a warning with "be careful not to"?',
          respuesta_guia: 'A negative imperative (Do not..., Never...) prohibits an action directly. "Be careful not to" is softer and warns of an undesirable consequence if the action is done incorrectly.',
        },
      ],
      callouts: [
        {
          tipo: 'sabias',
          contenido: 'The recipe format is one of the oldest types of written instruction in human history. The oldest known recipe is a Mesopotamian clay tablet from 1700 BCE describing how to make beer. Today, food recipe videos are among the most watched content on the internet globally, proving that the instruction format is timeless and universally useful.',
        },
      ],
    },
  },

  // ── 19 ──────────────────────────────────────────────────────────────────
  {
    codigo: 'PM-III-P06-A1',
    nuevo_titulo: 'Parábolas: vértice, ceros y eje de simetría',
    nuevo_contenido: {
      nivel_lectura: 'intermedio',
      tiempo_estimado_minutos: 18,
      fuente: 'CEN Bachillerato — UAC Pensamiento Matemático III',
      texto: `La parábola es la curva que describe la gráfica de toda función cuadrática de la forma f(x) = ax² + bx + c, donde a, b y c son constantes y a es distinto de cero. Es una de las curvas más frecuentes en la naturaleza y en la tecnología: la trayectoria de un proyectil, la forma de los espejos telescópicos y los reflectores de luz siguen esta forma.

El parámetro 'a' determina la apertura de la parábola. Si a es positivo, la parábola abre hacia arriba y tiene un punto mínimo: es como un cuenco que puede contener agua. Si a es negativo, la parábola abre hacia abajo y tiene un punto máximo: como una colina. Cuanto mayor sea el valor absoluto de 'a', más estrecha y pronunciada será la parábola; cuanto más cercano a cero, más ancha.

El vértice es el punto más importante de la parábola: es el mínimo si a > 0 o el máximo si a < 0. Para encontrar su coordenada horizontal (xv), usamos la fórmula xv = -b / (2a). Luego, para encontrar la coordenada vertical (yv), sustituimos xv en la función: yv = f(xv). El eje de simetría es la línea vertical que pasa por el vértice, con ecuación x = xv: la parábola es perfectamente simétrica respecto a esta línea.

Los ceros o raíces de la función cuadrática son los valores de x donde la parábola cruza el eje horizontal, es decir, donde f(x) = 0. Se obtienen resolviendo la ecuación cuadrática, ya sea por factorización, completando el cuadrado o usando la fórmula general. Una parábola puede tener dos ceros (cruza el eje x en dos puntos), uno (es tangente al eje x en el vértice) o ninguno (no toca el eje x).

Para graficar una parábola, sigue estos pasos: encuentra el vértice con la fórmula; calcula el eje de simetría; determina si abre hacia arriba o hacia abajo; calcula los ceros si existen; elige dos o tres valores adicionales de x a cada lado del vértice y calcula sus imágenes; traza la curva pasando por todos los puntos.

En la Liga MX, la trayectoria de un balón pateado desde el suelo con ángulo y velocidad definidos sigue una parábola. Si la función que modela la altura en metros es h(t) = -4.9t² + 15t, el vértice nos dice cuándo el balón alcanza su altura máxima (t = 15/9.8 ≈ 1.53 s) y cuál es esa altura máxima. Los ceros indican los momentos en que el balón está a nivel del suelo.`,
      preguntas_comprension: [
        {
          pregunta: '¿Cómo determinas si una parábola abre hacia arriba o hacia abajo, y qué implicación tiene para el vértice?',
          respuesta_guia: 'Si el coeficiente a es positivo, abre hacia arriba y el vértice es un mínimo. Si a es negativo, abre hacia abajo y el vértice es un máximo.',
        },
        {
          pregunta: '¿Cuál es la fórmula para encontrar la coordenada horizontal del vértice y cómo se calcula la vertical?',
          respuesta_guia: 'xv = -b/(2a). Luego se sustituye xv en la función para obtener yv = f(xv).',
        },
        {
          pregunta: '¿Qué información nos dan los ceros de una función cuadrática y cuántos puede tener una parábola?',
          respuesta_guia: 'Los ceros indican dónde la parábola cruza el eje x (donde f(x) = 0). Una parábola puede tener dos ceros, uno (tangente al eje) o ninguno.',
        },
      ],
      callouts: [
        {
          tipo: 'sabias',
          contenido: 'Los espejos de los telescopios más grandes del mundo tienen forma parabólica porque una parábola tiene la propiedad de concentrar todos los rayos paralelos que llegan a ella en un único punto llamado foco. El Gran Telescopio Milimétrico, ubicado en la Sierra Negra de Puebla, México, es uno de los radiotelescopios de plato único más grandes del mundo y utiliza esta propiedad parabólica.',
        },
      ],
    },
  },

  // ── 20 ──────────────────────────────────────────────────────────────────
  {
    codigo: 'PM-IV-P02-A1',
    nuevo_titulo: 'Funciones lineales y cuadráticas: gráficas y transformaciones',
    nuevo_contenido: {
      nivel_lectura: 'basico',
      tiempo_estimado_minutos: 16,
      fuente: 'CEN Bachillerato — UAC Pensamiento Matemático IV',
      texto: `Una función matemática es una regla que asigna a cada valor de entrada (x) exactamente un valor de salida (f(x)). Las funciones lineales y cuadráticas son las dos formas más fundamentales y se encuentran en prácticamente todas las aplicaciones matemáticas.

La función lineal tiene la forma f(x) = mx + b, donde m es la pendiente y b es la ordenada al origen. La pendiente m indica cuánto crece o decrece la función por cada unidad que avanza x. Si m es positivo, la función es creciente: su gráfica sube de izquierda a derecha. Si m es negativo, es decreciente: baja de izquierda a derecha. Si m es cero, la función es constante: su gráfica es una línea horizontal. La ordenada al origen b indica dónde la gráfica cruza el eje vertical.

La función cuadrática tiene la forma f(x) = ax² + bx + c. Su gráfica es una parábola con todas las propiedades ya estudiadas: vértice, eje de simetría, ceros y apertura determinada por el signo de a.

Las transformaciones son operaciones que modifican la gráfica de una función sin cambiar su forma fundamental. El desplazamiento vertical suma o resta una constante k a la función: f(x) + k mueve la gráfica k unidades hacia arriba; f(x) - k la mueve hacia abajo. El desplazamiento horizontal reemplaza x por (x - h): f(x - h) mueve la gráfica h unidades a la derecha; f(x + h) la mueve h unidades a la izquierda (¡ojo con el signo!). La reflexión respecto al eje x cambia el signo de toda la función: -f(x) voltea la gráfica. El escalamiento vertical multiplica la función por una constante: 2f(x) la estira verticalmente; (1/2)f(x) la comprime.

La tarifa doméstica de electricidad de la CFE (Comisión Federal de Electricidad) en México es un ejemplo real de función por tramos: para consumo entre 0 y 150 kWh se aplica una tarifa, para el tramo entre 151 y 280 kWh se aplica otra mayor, y para el excedente se aplica una tarifa aún más alta. Cada tramo es una función lineal, y la función completa es una función por tramos o escalón. La trayectoria de los cohetes Soyuz y los lanzamientos del puerto espacial de la Agencia Espacial Mexicana sigue modelos cuadráticos en su fase inicial.`,
      preguntas_comprension: [
        {
          pregunta: '¿Qué indica la pendiente m de una función lineal y qué diferencia hay entre pendiente positiva y negativa?',
          respuesta_guia: 'La pendiente indica cuánto cambia f(x) por cada unidad de x. Pendiente positiva: la función crece (gráfica sube). Pendiente negativa: la función decrece (gráfica baja).',
        },
        {
          pregunta: '¿Qué hace un desplazamiento vertical a la gráfica de una función? ¿Y un desplazamiento horizontal?',
          respuesta_guia: 'El desplazamiento vertical (f(x) + k) mueve la gráfica k unidades arriba o abajo. El horizontal (f(x - h)) la mueve h unidades a la derecha o izquierda.',
        },
        {
          pregunta: '¿Por qué la tarifa de electricidad de la CFE es un ejemplo de función por tramos y no de una sola función lineal?',
          respuesta_guia: 'Porque se aplican diferentes tasas según el rango de consumo: cada rango (tramo) tiene su propia función lineal, y la tarifa total es la combinación de esas funciones parciales.',
        },
      ],
      callouts: [
        {
          tipo: 'info',
          contenido: 'La pendiente de una función lineal tiene el mismo valor que la "velocidad de cambio" en física: describe cuánto cambia la variable dependiente por cada unidad de la variable independiente. En una función de distancia-tiempo, la pendiente es la velocidad. En una función de costo-producción, la pendiente es el costo marginal por unidad producida.',
        },
      ],
    },
  },

  // ── 21 ──────────────────────────────────────────────────────────────────
  {
    codigo: 'PM-IV-P05-A1',
    nuevo_titulo: 'Ley de Senos y Ley de Cosenos',
    nuevo_contenido: {
      nivel_lectura: 'avanzado',
      tiempo_estimado_minutos: 20,
      fuente: 'CEN Bachillerato — UAC Pensamiento Matemático IV',
      texto: `La trigonometría en triángulo rectángulo —con seno, coseno y tangente de los ángulos agudos— solo funciona cuando uno de los ángulos del triángulo es exactamente 90°. Pero en la mayoría de situaciones reales, los triángulos no tienen un ángulo recto. Para estos casos, existen dos herramientas fundamentales: la Ley de Senos y la Ley de Cosenos.

Un triángulo oblicuángulo es aquel en el que ningún ángulo es de 90°. Puede ser acutángulo (todos sus ángulos son agudos, menores de 90°) u obtusángulo (uno de sus ángulos es obtuso, mayor de 90°). Para resolver estos triángulos necesitamos al menos tres elementos conocidos, incluyendo al menos un lado.

La Ley de Senos establece que en todo triángulo, el cociente entre la longitud de cada lado y el seno del ángulo opuesto a ese lado es constante: a / sen(A) = b / sen(B) = c / sen(C). Esta ley se usa en dos casos principales. El caso ALA (Ángulo-Lado-Ángulo): se conocen dos ángulos y el lado comprendido entre ellos. El caso LAA (Lado-Ángulo-Ángulo): se conoce un lado y dos ángulos. En ambos casos, la Ley de Senos permite calcular los elementos desconocidos.

La Ley de Cosenos generaliza el teorema de Pitágoras para triángulos oblicuángulos: c² = a² + b² - 2ab·cos(C). Se usa en dos casos. El caso LLL (Lado-Lado-Lado): se conocen los tres lados y se busca algún ángulo. El caso LAL (Lado-Ángulo-Lado): se conocen dos lados y el ángulo comprendido entre ellos y se busca el tercer lado. Nótese que cuando el ángulo C es de 90°, cos(90°) = 0 y la fórmula se reduce al teorema de Pitágoras: c² = a² + b².

La topografía es una aplicación directa y cotidiana de estas leyes. El INEGI (Instituto Nacional de Estadística y Geografía) utiliza redes de triangulación para elaborar los mapas del territorio mexicano. Cuando dos puntos son inaccesibles directamente —porque hay un barranco, un lago o una zona privada de por medio— se mide la distancia a dos puntos accesibles y los ángulos entre ellos, y la Ley de Senos permite calcular la distancia al punto inaccesible. Este método fue la base de la cartografía antes de la era GPS y sigue siendo importante para verificar mediciones satelitales.`,
      preguntas_comprension: [
        {
          pregunta: '¿En qué casos se aplica la Ley de Senos y en qué casos la Ley de Cosenos?',
          respuesta_guia: 'Ley de Senos: cuando se conocen dos ángulos y un lado (ALA o LAA). Ley de Cosenos: cuando se conocen tres lados (LLL) o dos lados y el ángulo comprendido (LAL).',
        },
        {
          pregunta: '¿Cómo se relaciona la Ley de Cosenos con el teorema de Pitágoras?',
          respuesta_guia: 'La Ley de Cosenos es c² = a² + b² - 2ab·cos(C). Cuando C = 90°, cos(90°) = 0, y la fórmula se reduce a c² = a² + b², que es el teorema de Pitágoras.',
        },
        {
          pregunta: '¿Cómo usan los topógrafos la Ley de Senos para medir distancias inaccesibles?',
          respuesta_guia: 'Miden la distancia entre dos puntos accesibles y los ángulos que forman con el punto inaccesible; luego aplican la Ley de Senos para calcular la distancia al punto inalcanzable sin necesidad de llegar a él.',
        },
      ],
      callouts: [
        {
          tipo: 'importante',
          contenido: 'Al usar la Ley de Cosenos para encontrar un ángulo a partir de los tres lados, el resultado del coseno puede ser negativo. Eso no es un error: significa que el ángulo es obtuso (mayor de 90°). Usa la función arcocoseno (cos⁻¹) en tu calculadora para obtener el ángulo y verifica que la suma de los tres ángulos del triángulo sea 180°.',
        },
      ],
    },
  },

  // ── 22 ──────────────────────────────────────────────────────────────────
  {
    codigo: 'LC-III-P05-A1',
    nuevo_titulo: 'El género lírico: figuras retóricas y musicalidad del verso',
    nuevo_contenido: {
      nivel_lectura: 'intermedio',
      tiempo_estimado_minutos: 17,
      fuente: 'CEN Bachillerato — UAC Lengua y Comunicación III',
      texto: `La poesía es la forma literaria que más explícitamente trabaja con el lenguaje como material sonoro y rítmico, además de semántico. A diferencia de la narrativa, que organiza el tiempo de los hechos, o del ensayo, que organiza argumentos, el poema organiza la experiencia subjetiva: las emociones, las percepciones, la relación del hablante lírico con el mundo y consigo mismo.

Los elementos formales del poema son el verso (cada línea del poema), la estrofa (grupo de versos), la rima (repetición de sonidos al final de cada verso: consonante cuando coinciden todos los sonidos desde la última vocal acentuada; asonante cuando solo coinciden las vocales), el ritmo (distribución regular de los acentos en el verso) y la métrica (número de sílabas en cada verso, que en español se cuenta con reglas específicas de sinalefa y acento final).

Las figuras retóricas son recursos del lenguaje que amplían o transforman el significado ordinario de las palabras para producir efectos estéticos, emocionales o cognitivos. La metáfora identifica una cosa con otra de naturaleza diferente: 'El tiempo es oro' convierte el tiempo abstracto en un material valioso y escaso. El símil compara dos cosas mediante un conector explícito ('como', 'parece'): 'Sus ojos brillaban como estrellas'. La personificación atribuye características humanas a objetos, animales o ideas abstractas: 'El viento susurra secretos entre los árboles'. La hipérbole exagera para intensificar: 'Te lo he dicho mil veces'. La anáfora repite la misma palabra o grupo de palabras al inicio de versos consecutivos, creando un efecto de insistencia y musicalidad.

La poesía mexicana ofrece ejemplos magistrales de cada recurso. Los sonetos de Sor Juana Inés de la Cruz (siglo XVII) combinan métrica perfecta con metáforas filosóficas sobre el amor y el conocimiento. Ramón López Velarde (modernismo, principios del siglo XX) usa el símbolo y la sinestesia para evocar la provincia mexicana. Rosario Castellanos (siglo XX) emplea la ironía y la personificación para explorar la condición femenina. Efraín Huerta canta la Ciudad de México con imágenes urbanas y ritmo popular.

La lectura en voz alta es fundamental para experimentar la dimensión física del poema: el ritmo se percibe con el cuerpo, la rima se escucha, las pausas del verso crean silencios significativos. Leer poesía en voz alta, con atención al ritmo y la entonación, transforma el texto en un evento sonoro y emocional único.`,
      preguntas_comprension: [
        {
          pregunta: '¿Cuál es la diferencia entre rima consonante y rima asonante?',
          respuesta_guia: 'La rima consonante repite todos los sonidos desde la última vocal acentuada (amor/dolor). La asonante solo repite las vocales desde la última vocal acentuada (casa/alma).',
        },
        {
          pregunta: '¿Cuál es la diferencia entre metáfora y símil? Da un ejemplo de cada una.',
          respuesta_guia: 'La metáfora identifica directamente dos cosas (Tu voz es miel). El símil compara usando un conector explícito como "como" o "parece" (Tu voz es dulce como la miel).',
        },
        {
          pregunta: '¿Por qué es importante leer poesía en voz alta?',
          respuesta_guia: 'Porque la poesía tiene una dimensión sonora y rítmica que solo se percibe completamente al escucharla: el ritmo se experimenta con el cuerpo, la rima se vuelve audible y las pausas adquieren significado.',
        },
      ],
      callouts: [
        {
          tipo: 'sabias',
          contenido: 'Sor Juana Inés de la Cruz (1648-1695) es considerada la primera gran poeta del continente americano en lengua española. Vivió en la Nueva España (hoy México) y fue una mujer que desafió las convenciones de su época para acceder al conocimiento y la escritura. Su soneto "Hombres necios que acusáis" sigue siendo vigente como crítica a la hipocresía de género.',
        },
      ],
    },
  },

  // ── 23 ──────────────────────────────────────────────────────────────────
  {
    codigo: 'LC-III-P07-A1',
    nuevo_titulo: 'La exposición oral formal: coloquio, simposio y foro',
    nuevo_contenido: {
      nivel_lectura: 'avanzado',
      tiempo_estimado_minutos: 18,
      fuente: 'CEN Bachillerato — UAC Lengua y Comunicación III',
      texto: `La comunicación oral formal es una habilidad que distingue a las personas capaces de participar activamente en espacios académicos, profesionales y cívicos. Tres formatos destacan en el ámbito académico: el coloquio, el simposio y el foro, cada uno con características, propósitos y reglas de participación distintos.

El coloquio es un diálogo académico entre un grupo reducido de participantes —generalmente entre tres y ocho— que tienen conocimiento sobre el tema. Se caracteriza por la interacción directa entre los participantes, la posibilidad de preguntas y respuestas cruzadas, y el objetivo de llegar a una comprensión más profunda mediante el intercambio de perspectivas. No necesariamente produce conclusiones unánimes: la pluralidad de opiniones fundamentadas es parte de su valor.

El simposio reúne a varias personas expertas en diferentes aspectos de un mismo tema para que cada una haga una exposición breve y estructurada. Al final, un moderador o coordinador sintetiza las conclusiones e invita a la audiencia a formular preguntas. A diferencia del coloquio, las intervenciones en el simposio son menos interactivas durante la exposición misma: cada expositor presenta su análisis de manera independiente.

El foro es el formato más abierto y participativo: permite que la audiencia intervenga directamente para hacer preguntas, plantear posiciones o compartir experiencias. En el foro, la distinción entre expertos y audiencia es más difusa. La UNAM y el ITAM organizan regularmente foros estudiantiles donde los bachilleres pueden participar.

La estructura de toda exposición oral formal sigue una lógica argumentativa: introducción (presentación del tema, contexto y tesis o posición central), desarrollo (argumentos con evidencia: datos, citas, ejemplos) y conclusión (síntesis de lo argumentado y propuesta o llamado a la reflexión).

El lenguaje académico oral se distingue del conversacional por el uso de conectores discursivos (por lo tanto, en consecuencia, no obstante, cabe destacar que), la referencia explícita a fuentes, el uso de nominalizaciones (la transformación de verbos en sustantivos: investigar → la investigación) y la precisión léxica.

La gestión del cuerpo y la voz son tan importantes como el contenido. La postura erguida y el contacto visual con la audiencia transmiten seguridad y autoridad. La dicción clara, el volumen adecuado al espacio y las pausas estratégicas dan tiempo al oyente de procesar la información. Los gestos deben reforzar el mensaje, no distraer de él.`,
      preguntas_comprension: [
        {
          pregunta: '¿Cuáles son las diferencias principales entre un coloquio, un simposio y un foro?',
          respuesta_guia: 'Coloquio: diálogo entre pocos participantes con conocimiento, interactivo y sin conclusión única. Simposio: exposiciones de expertos sobre distintos aspectos de un tema, moderadas y con síntesis final. Foro: formato abierto donde la audiencia participa directamente.',
        },
        {
          pregunta: '¿Qué elementos distinguen el lenguaje académico oral del lenguaje conversacional?',
          respuesta_guia: 'Uso de conectores discursivos formales, referencia explícita a fuentes, nominalizaciones, precisión léxica y estructura argumentativa explícita.',
        },
        {
          pregunta: '¿Por qué la gestión de la voz y el cuerpo son tan importantes como el contenido en una exposición formal?',
          respuesta_guia: 'Porque la comunicación oral no es solo verbal: la postura, el contacto visual, la dicción y las pausas transmiten seguridad, ayudan al oyente a seguir el argumento y refuerzan la credibilidad del expositor.',
        },
      ],
      callouts: [
        {
          tipo: 'importante',
          contenido: 'Preparar una exposición oral no significa memorizar un texto para recitar. Significa conocer el tema tan bien que puedas explicarlo con tus propias palabras ante cualquier pregunta. Los apoyos visuales (diapositivas, infografías) deben complementar lo que dices, no repetirlo ni sustituirlo.',
        },
      ],
    },
  },

  // ── 24 ──────────────────────────────────────────────────────────────────
  {
    codigo: 'IN-III-P02-A1',
    nuevo_titulo: 'Have You Ever...? Sharing Recent Experiences',
    nuevo_contenido: {
      nivel_lectura: 'basico',
      tiempo_estimado_minutos: 15,
      fuente: 'CEN Bachillerato — UAC Inglés III',
      texto: `The present perfect tense in English is one of the most useful and, at first, one of the most confusing. Once you understand what it does, you will use it constantly. Its main function is to talk about life experiences without saying when exactly they happened.

The structure of the present perfect is: subject + have/has + past participle. With I, you, we, and they: I have visited Mexico City. We have eaten tamales. With he, she, and it: She has traveled to Oaxaca. He has never tried mole negro.

To form the past participle, regular verbs add -ed (visit → visited, travel → traveled, live → lived). Irregular verbs must be memorized because they change in unpredictable ways: go → gone, eat → eaten, see → seen, be → been, have → had, do → done, write → written, speak → spoken, take → taken, give → given.

The word 'ever' is used in questions to ask about any point in a person's life up to now: Have you ever visited a cenote? Have you ever tried chapulines (grasshoppers)? Have you ever seen a volcano up close? The answer is: Yes, I have. or No, I have not. (or No, I never have.)

The word 'never' is used in negative statements to emphasize that an experience has never happened at any point in life: I have never eaten huitlacoche. She has never been to Chiapas. We have never seen the monarch butterflies in Michoacan.

We use 'for' and 'since' with the present perfect to describe situations that started in the past and continue now. 'For' is followed by a duration: I have lived in Guadalajara for three years. 'Since' is followed by a starting point: I have studied English since 2021. We have been classmates since primary school.

It is important to contrast the present perfect with the simple past. Use the present perfect for experiences with no specific time given: I have eaten tacos at a taqueria. Use the simple past when you mention a specific time: I ate tacos last Friday at the taqueria on the corner of Insurgentes. The same experience can be talked about with both tenses, but for different communicative purposes.

Practice: conduct a class survey. Ask five classmates three questions with Have you ever...? related to Mexican food, travel, and cultural experiences. Record their answers and report back using the present perfect.`,
      preguntas_comprension: [
        {
          pregunta: 'What is the difference between the present perfect and the simple past? When do you use each?',
          respuesta_guia: 'Present perfect: experiences without a specific time (I have visited Oaxaca). Simple past: completed actions at a specific time (I visited Oaxaca last summer). The present perfect focuses on the experience; the simple past focuses on the time.',
        },
        {
          pregunta: 'How do you use "for" and "since" with the present perfect? Give an example of each.',
          respuesta_guia: '"For" + duration: I have studied English for five years. "Since" + starting point: I have studied English since I was twelve.',
        },
        {
          pregunta: 'Give the past participle of these five irregular verbs: go, eat, see, take, write.',
          respuesta_guia: 'Go → gone. Eat → eaten. See → seen. Take → taken. Write → written.',
        },
      ],
      callouts: [
        {
          tipo: 'info',
          contenido: 'In British English, the present perfect is used much more than in American English. Americans often use the simple past where British speakers use the present perfect: American: Did you eat already? British: Have you eaten already? Both are correct; the difference is regional. In academic and formal English worldwide, the present perfect remains the standard for talking about experiences.',
        },
      ],
    },
  },

  // ── 25 ──────────────────────────────────────────────────────────────────
  {
    codigo: 'PFH-III-P03-A1',
    nuevo_titulo: 'Estética filosófica: lo bello, lo sublime y lo grotesco',
    nuevo_contenido: {
      nivel_lectura: 'avanzado',
      tiempo_estimado_minutos: 20,
      fuente: 'CEN Bachillerato — UAC Pensamiento Filosófico e Histórico III',
      texto: `La estética es la rama de la filosofía que estudia la experiencia sensible y el juicio de gusto. El nombre fue acuñado por el filósofo alemán Alexander Gottlieb Baumgarten en 1750, quien la definió como la ciencia del conocimiento sensible. Desde entonces, la estética se ha ocupado de preguntas fundamentales: ¿Qué es lo bello? ¿Existe el gusto universal? ¿El arte tiene valor en sí mismo o solo en relación con quien lo contempla?

Immanuel Kant, en su 'Crítica del juicio' (1790), propuso que el juicio de lo bello tiene una paradoja: es subjetivo (depende de la experiencia de quien lo contempla, no de propiedades objetivas del objeto) pero pretende universalidad (cuando decimos que algo es bello, no decimos simplemente que nos gusta a nosotros, sino que esperamos que otros también lo encuentren bello). Para Kant, la experiencia de lo bello produce un placer desinteresado: no buscamos poseerlo ni usarlo, simplemente lo contemplamos.

Lo sublime, también analizado por Edmund Burke antes que Kant, es la experiencia estética que provoca una mezcla de terror y admiración: lo que nos sobrepasa, lo que desborda nuestra capacidad de comprensión. La naturaleza en su vastedad —el océano en tempestad, una montaña imponente, un volcán en erupción— es el paradigma de lo sublime. En México, el Popocatépetl activo y la inmensidad de la Sierra Madre Occidental pueden vivirse como experiencias de lo sublime.

Lo grotesco, estudiado por el teórico ruso Mikhail Bajtin, subvierte el orden estético establecido. Es lo que perturba, lo que mezcla lo alto y lo bajo, lo serio y lo ridículo, lo humano y lo animal. El carnaval es su espacio privilegiado. En el arte mexicano, las catrinas de José Guadalupe Posada y las figuras de la muerte en el Día de Muertos combinan lo macabro con lo festivo, creando una estética de lo grotesco típicamente mexicana.

El muralismo mexicano —Diego Rivera, José Clemente Orozco, David Alfaro Siqueiros— constituye una propuesta estética explícitamente política: el arte como herramienta de educación popular y transformación social. Frida Kahlo exploró el autorretrato como forma de representar el dolor físico, la identidad cultural y el género, convirtiendo la experiencia subjetiva en imagen pictórica de resonancia universal.

La pregunta central sigue abierta: ¿existe el gusto universal o toda experiencia estética es cultural e históricamente situada? La filosofía del arte contemporánea tiende a responder que ambas dimensiones —la subjetividad universal y la determinación cultural— son reales y coexisten de manera compleja.`,
      preguntas_comprension: [
        {
          pregunta: '¿En qué consiste la paradoja del juicio de lo bello según Kant?',
          respuesta_guia: 'Es subjetivo (depende de quien lo contempla, no de propiedades del objeto) pero pretende universalidad (esperamos que otros también lo encuentren bello). Esa tensión es la paradoja central.',
        },
        {
          pregunta: '¿Qué diferencia hay entre la experiencia estética de lo bello y la de lo sublime?',
          respuesta_guia: 'Lo bello produce placer desinteresado y armonía. Lo sublime produce una mezcla de terror y admiración, una sensación de ser sobrepasado por algo que supera nuestra capacidad de comprensión.',
        },
        {
          pregunta: '¿Cómo se manifiesta lo grotesco en la cultura y el arte mexicano? Da un ejemplo.',
          respuesta_guia: 'En las catrinas de Posada y la festividad del Día de Muertos, que mezclan lo macabro con lo festivo, la muerte con la celebración, subvirtiendo el orden estético que separa lo serio de lo ridículo y lo terrorífico de lo alegre.',
        },
      ],
      callouts: [
        {
          tipo: 'sabias',
          contenido: 'El concepto de lo sublime influyó directamente en el arte del Romanticismo europeo del siglo XIX: pintores como Caspar David Friedrich representaban figuras humanas diminutas ante paisajes naturales inmensos, subrayando la pequeñez del individuo ante la naturaleza. Esta tradición estética llegó a México a través de los paisajistas del siglo XIX como José María Velasco, cuyas pinturas del Valle de México exploran esa misma tensión.',
        },
      ],
    },
  },

  // ── 26 ──────────────────────────────────────────────────────────────────
  {
    codigo: 'CNEYT-III-P03-A1',
    nuevo_titulo: 'Fotosíntesis: la fábrica de vida del planeta',
    nuevo_contenido: {
      nivel_lectura: 'basico',
      tiempo_estimado_minutos: 15,
      fuente: 'CEN Bachillerato — UAC Ciencias Naturales, Experimentales y Tecnología III',
      texto: `La fotosíntesis es el proceso mediante el cual las plantas, las algas y algunas bacterias convierten la energía luminosa del sol en energía química almacenada en moléculas de glucosa. Es el fundamento de casi toda la vida en la Tierra: los seres que realizan fotosíntesis son los productores primarios de los que dependen directa o indirectamente todos los demás organismos.

La ecuación general de la fotosíntesis resume el proceso de manera simplificada: 6CO2 + 6H2O + energía lumínica → C6H12O6 + 6O2. Es decir, seis moléculas de dióxido de carbono y seis de agua, en presencia de luz, producen una molécula de glucosa y seis de oxígeno. El oxígeno que respiramos es un subproducto de la fotosíntesis.

El proceso ocurre en los cloroplastos, organelos presentes en las células vegetales. Se divide en dos grandes fases. Las reacciones de luz o reacciones luminosas ocurren en los tilacoides, membranas internas del cloroplasto, y requieren luz solar directa: capturan la energía lumínica para producir ATP y NADPH (moléculas energéticas) y liberan oxígeno al descomponer el agua. El ciclo de Calvin o reacciones oscuras ocurre en el estroma, el fluido del cloroplasto: usa el ATP y el NADPH producidos en la fase anterior para fijar el CO2 del aire y sintetizar glucosa.

La clorofila es el pigmento responsable de capturar la luz. Absorbe principalmente la luz roja y la azul-violeta, y refleja la luz verde, razón por la que las plantas se ven verdes. Existen varios tipos de clorofila (a, b, c) y otros pigmentos accesorios como los carotenoides que capturan otras longitudes de onda y transfieren la energía a la clorofila.

La tasa fotosintética —la velocidad a la que ocurre la fotosíntesis— depende de varios factores: la intensidad luminosa (mayor luz, mayor tasa hasta cierto límite), la concentración de CO2 en el aire, la temperatura (hay temperaturas óptimas para las enzimas del ciclo de Calvin) y la disponibilidad de agua.

La milpa es el sistema agrícola tradicional mexicano que combina maíz, frijol y calabaza en el mismo espacio. Investigaciones de la UNAM (2022) han mostrado que la milpa maximiza el aprovechamiento de la luz solar por unidad de área: el maíz es alto y capta la luz del sol directa, el frijol trepador ocupa niveles intermedios, y la calabaza cubre el suelo y aprovecha la luz difusa. Es biodiversidad agrícola al servicio de la fotosíntesis eficiente.`,
      preguntas_comprension: [
        {
          pregunta: '¿Cuáles son las dos fases de la fotosíntesis y qué ocurre en cada una?',
          respuesta_guia: 'Reacciones de luz (en los tilacoides): capturan energía solar, producen ATP y NADPH, liberan oxígeno. Ciclo de Calvin (en el estroma): usa ATP y NADPH para fijar CO2 y producir glucosa.',
        },
        {
          pregunta: '¿Por qué las plantas se ven verdes? ¿Qué relación tiene esto con la clorofila?',
          respuesta_guia: 'Porque la clorofila absorbe la luz roja y azul-violeta para la fotosíntesis, pero refleja la luz verde, que es la que llega a nuestros ojos y percibimos como el color de la planta.',
        },
        {
          pregunta: '¿Qué es la milpa y por qué es un sistema agrícola eficiente desde el punto de vista de la fotosíntesis?',
          respuesta_guia: 'Es el sistema tradicional mexicano con maíz, frijol y calabaza. Es eficiente porque cada planta ocupa un nivel de luz diferente (el maíz la directa, el frijol la intermedia, la calabaza la difusa), maximizando el aprovechamiento de la energía solar por unidad de área.',
        },
      ],
      callouts: [
        {
          tipo: 'sabias',
          contenido: 'La deforestación en México tiene un impacto directo en el ciclo del carbono global: cada árbol talado deja de absorber CO2 del aire y, si se quema o descompone, libera el carbono que había almacenado durante décadas. México pierde aproximadamente 92,000 hectáreas de bosque al año (CONAFOR 2023), lo que equivale a una superficie mayor que la ciudad de Guadalajara desapareciendo cada año.',
        },
      ],
    },
  },

  // ── 27 ──────────────────────────────────────────────────────────────────
  {
    codigo: 'CNEYT-III-P06-A1',
    nuevo_titulo: 'Deterioro ambiental: contaminación, deforestación y cambio climático',
    nuevo_contenido: {
      nivel_lectura: 'avanzado',
      tiempo_estimado_minutos: 20,
      fuente: 'CEN Bachillerato — UAC Ciencias Naturales, Experimentales y Tecnología III',
      texto: `El deterioro ambiental no es un problema del futuro: es una realidad presente que afecta la calidad de vida, la salud y la seguridad alimentaria de millones de personas hoy. En México, las tres dimensiones del deterioro ambiental —contaminación, deforestación y cambio climático— se interconectan y se amplifican mutuamente.

La contaminación del aire es quizás la más visible. La Ciudad de México y Guadalajara superan regularmente las normas de la OMS para partículas finas (PM2.5), cuya inhalación prolongada se asocia con enfermedades respiratorias, cardiovasculares y cáncer de pulmón. La contaminación del agua afecta cuencas enteras: el río Atoyac, que atraviesa Puebla y Tlaxcala, es uno de los más contaminados de América Latina por descargas industriales y aguas residuales sin tratar, pese a años de litigios ambientales. La contaminación del suelo por minería a cielo abierto —especialmente en Sonora y Zacatecas— deja pasivos ambientales que tardan décadas en recuperarse y contaminan los acuíferos subterráneos.

La deforestación reduce la capacidad del territorio para regular el ciclo hídrico, fijar carbono y albergar biodiversidad. México pierde aproximadamente 92,000 hectáreas de bosque y selva al año, según el CONAFOR (2023). Las causas principales son la ganadería extensiva (55%), la agricultura de roza-tumba-quema (28%) y la tala ilegal (17%). Las regiones más afectadas son la Selva Lacandona en Chiapas, la Sierra Madre Occidental y la Huasteca.

El cambio climático amplifica todos los demás problemas ambientales y, a su vez, es amplificado por ellos. México es altamente vulnerable a sus efectos (INECC 2023): el norte del país enfrenta sequías cada vez más severas que afectan la agricultura y el suministro de agua; las costas del Pacífico y el Golfo son golpeadas por huracanes de mayor intensidad; y los glaciares del Iztaccíhuatl y el Citlaltépetl (Pico de Orizaba) han perdido más del 70% de su masa en el último siglo.

La trampa de las sinergias es particularmente grave: la deforestación reduce la absorción de CO2 y amplifica el calentamiento global, que a su vez aumenta la frecuencia e intensidad de los incendios forestales, que amplifican la deforestación. Este ciclo vicioso solo puede romperse con intervenciones simultáneas en múltiples frentes.

Las soluciones locales son efectivas cuando están articuladas con políticas públicas: programas de reforestación comunitaria como las brigadas del CONAFOR, el diseño de corredores biológicos que reconectan ecosistemas fragmentados, la agricultura agroecológica que evita el desmonte, y la participación de comunidades indígenas en el manejo de sus territorios.`,
      preguntas_comprension: [
        {
          pregunta: '¿Cuáles son las tres dimensiones del deterioro ambiental en México y cómo se interrelacionan?',
          respuesta_guia: 'Contaminación (aire, agua, suelo), deforestación y cambio climático. Se amplifican mutuamente: la deforestación aumenta el CO2, que intensifica el cambio climático, que provoca sequías e incendios que agravan la deforestación.',
        },
        {
          pregunta: '¿Cuáles son las causas principales de la deforestación en México según el CONAFOR?',
          respuesta_guia: 'Ganadería extensiva (55%), agricultura de roza-tumba-quema (28%) y tala ilegal (17%).',
        },
        {
          pregunta: '¿Por qué se habla de una "trampa de sinergias" en el deterioro ambiental? ¿Qué implica esto para las soluciones?',
          respuesta_guia: 'Porque los problemas se potencian entre sí formando ciclos viciosos. Implica que no basta con atacar un solo problema: se necesitan intervenciones simultáneas en múltiples frentes —contaminación, deforestación y emisiones— para romper el ciclo.',
        },
      ],
      callouts: [
        {
          tipo: 'importante',
          contenido: 'El derecho a un medio ambiente sano está reconocido en el artículo 4° de la Constitución Política de los Estados Unidos Mexicanos desde 2012. Sin embargo, el reconocimiento constitucional no garantiza su ejercicio efectivo: se requiere vigilancia ciudadana, aplicación de la ley y participación activa de las comunidades en la defensa de sus territorios.',
        },
      ],
    },
  },

  // ── 28 ──────────────────────────────────────────────────────────────────
  {
    codigo: 'IN-II-P02-A1',
    nuevo_titulo: 'Free Time Activities: What Do People Do?',
    nuevo_contenido: {
      nivel_lectura: 'basico',
      tiempo_estimado_minutos: 14,
      fuente: 'CEN Bachillerato — UAC Inglés II',
      texto: `Talking about what people do in their free time is one of the most common topics in everyday English conversation. It helps you connect with others, share interests, and practice one of the most important verb tenses in English: the simple present.

The simple present is used to talk about routines, habits, and facts. For I, you, we, and they, the verb stays in its base form: I play football. We watch movies on weekends. They listen to music. For he, she, and it (third person singular), the verb changes: she plays, he watches, it runs. Most verbs simply add -s (play → plays, read → reads). Verbs ending in -sh, -ch, -x, -o, or -ss add -es (watch → watches, go → goes). Verbs ending in a consonant + y change the y to i and add -es (study → studies).

To make questions in the simple present with he or she, use does: Does he play basketball? Does she cook at home? Does your brother study English? Short answers use does or does not: Yes, he does. No, she does not.

Common vocabulary for leisure activities includes: play sports, watch TV series, listen to music, hang out with friends, go to the park, cook, read books or comics, dance, take photos, play video games, go swimming, do yoga, paint or draw.

In Mexico, free time activities often involve the community and the family. Many young people spend Sunday afternoons in the zocalo or plaza of their town, meeting friends or watching local events. Playing football (futbol) is the most popular sport across all social groups. Going to the tianguis on weekends — the open-air market — is a family and social activity in many Mexican communities. Dancing salsa, cumbia, or regional music is a form of social connection, and family meals on Sundays are a cherished tradition for many Mexican households.

Frequency adverbs tell us how often someone does an activity. From most to least frequent: always (100%), usually (about 80%), often (about 60%), sometimes (about 40%), rarely or seldom (about 20%), never (0%). In a sentence, frequency adverbs go before the main verb: She always dances at parties. He never misses a football game. They sometimes go to the cinema.

Practice: write a short paragraph (six to eight sentences) describing what a family member or friend does in their free time. Use the simple present correctly and include at least three frequency adverbs.`,
      preguntas_comprension: [
        {
          pregunta: 'How does the simple present change for third person singular (he/she/it)? Give three examples.',
          respuesta_guia: 'It adds -s or -es to the verb: she plays, he watches, it goes. Verbs ending in consonant + y change to -ies: she studies.',
        },
        {
          pregunta: 'What are frequency adverbs and where do they go in a sentence? List five in order from most to least frequent.',
          respuesta_guia: 'Frequency adverbs say how often something happens and go before the main verb. From most to least frequent: always, usually, often, sometimes, never.',
        },
        {
          pregunta: 'Write three sentences about what people do in their free time in a Mexican town, using the simple present with third person singular.',
          respuesta_guia: 'Open answer. Example: My neighbor always goes to the tianguis on Sunday. My sister often dances at family parties. My grandfather usually watches football on Saturday afternoons.',
        },
      ],
      callouts: [
        {
          tipo: 'info',
          contenido: 'The verb "go" is often followed by a gerund (-ing form) for activities: go swimming, go dancing, go shopping, go hiking. This is a fixed structure in English: you cannot say "go to swim" in the same way. Note also "play" (for sports and games with rules: play football, play chess) vs "go" (for activities: go swimming, go running).',
        },
      ],
    },
  },

  // ── 29 ──────────────────────────────────────────────────────────────────
  {
    codigo: 'CD-II-P02-A1',
    nuevo_titulo: 'Trabajar juntos en la nube: herramientas colaborativas',
    nuevo_contenido: {
      nivel_lectura: 'basico',
      tiempo_estimado_minutos: 15,
      fuente: 'CEN Bachillerato — UAC Ciudadanía Digital II',
      texto: `El trabajo colaborativo en la nube ha transformado la forma en que los equipos producen, revisan y comparten documentos, proyectos y presentaciones. La nube (cloud) es simplemente un conjunto de servidores remotos a los que se accede a través de internet y que almacenan archivos, ejecutan programas y sincronizan datos entre dispositivos. Trabajar en la nube significa que varias personas pueden acceder y editar los mismos archivos desde distintos lugares y dispositivos al mismo tiempo.

Google Workspace —que incluye Google Docs (documentos de texto), Google Slides (presentaciones) y Google Sheets (hojas de cálculo)— es la suite de colaboración más usada en contextos educativos en México y América Latina. Su ventaja central es la edición simultánea en tiempo real: varios usuarios pueden trabajar en el mismo documento al mismo tiempo y ver los cambios de los demás instantáneamente. El historial de versiones permite recuperar cualquier versión anterior del documento si alguien comete un error. Los comentarios permiten hacer sugerencias sin modificar el texto directamente.

Microsoft 365 ofrece herramientas equivalentes: Word, PowerPoint y Excel en línea, con Teams como plataforma de comunicación y OneDrive como almacenamiento. Muchas instituciones educativas y empresas en México utilizan esta suite.

Herramientas especializadas amplían las posibilidades de colaboración. Miro es un pizarrón digital colaborativo ideal para lluvias de ideas, mapas mentales y diseño de procesos. Padlet crea tableros digitales compartidos donde cada participante puede pegar notas, imágenes o enlaces. Notion combina notas, bases de datos y gestión de proyectos en un solo espacio. Trello organiza tareas en tableros kanban con columnas que representan etapas del trabajo (por hacer, en proceso, terminado).

Las buenas prácticas de colaboración digital evitan confusiones y conflictos. Definir roles claros desde el inicio (¿quién redacta, quién revisa, quién presenta?) es fundamental. Establecer convenciones de nomenclatura para los archivos (por ejemplo: Proyecto_Final_v3_Equipo2) evita tener docenas de archivos con nombres como 'último definitivo real') confundiendo al equipo. Usar los comentarios para sugerir cambios en lugar de editar directamente el texto de otro respeta el trabajo de los compañeros.

Según la ENOE del INEGI (2023), el 18% de los trabajadores en México se encuentra en modalidad remota o híbrida. Las competencias digitales colaborativas son cada vez más demandadas en el mercado laboral. Dominarlas durante el bachillerato es una inversión directa en el futuro profesional.`,
      preguntas_comprension: [
        {
          pregunta: '¿Qué ventajas ofrece Google Workspace para el trabajo colaborativo en equipos escolares?',
          respuesta_guia: 'Edición simultánea en tiempo real, historial de versiones para recuperar cambios anteriores, sistema de comentarios para sugerir sin modificar directamente, y acceso desde cualquier dispositivo con internet.',
        },
        {
          pregunta: '¿Para qué sirve cada herramienta: Miro, Padlet y Trello?',
          respuesta_guia: 'Miro: pizarrón digital para lluvias de ideas y mapas mentales. Padlet: tablero compartido con notas, imágenes y enlaces. Trello: organización de tareas por etapas en tablero kanban.',
        },
        {
          pregunta: '¿Cuáles son tres buenas prácticas de colaboración digital que evitan conflictos en el equipo?',
          respuesta_guia: 'Definir roles claros, establecer convenciones de nomenclatura para archivos y usar comentarios para sugerir cambios en lugar de editar directamente el trabajo ajeno.',
        },
      ],
      callouts: [
        {
          tipo: 'sabias',
          contenido: 'Antes de los procesadores de texto en la nube, los equipos compartían documentos por correo electrónico en versiones sucesivas. Era común terminar con archivos llamados "final", "final2", "final_ESTE", "final_definitivo_real". El control de versiones automático de Google Docs y similares eliminó ese problema: toda la historia del documento queda registrada automáticamente.',
        },
      ],
    },
  },

  // ── 30 ──────────────────────────────────────────────────────────────────
  {
    codigo: 'PM-III-P03-A1',
    nuevo_titulo: 'El discriminante: ¿cuántas soluciones tiene una ecuación?',
    nuevo_contenido: {
      nivel_lectura: 'basico',
      tiempo_estimado_minutos: 16,
      fuente: 'CEN Bachillerato — UAC Pensamiento Matemático III',
      texto: `Para resolver cualquier ecuación cuadrática de la forma ax² + bx + c = 0, existe una fórmula que siempre funciona, independientemente de los valores de los coeficientes. Se llama fórmula general o fórmula cuadrática: x = (-b ± √(b² - 4ac)) / (2a). Esta fórmula produce hasta dos soluciones porque el símbolo ± genera dos cálculos distintos: uno con suma y otro con resta.

El discriminante es la expresión que aparece bajo el radical: Δ = b² - 4ac. Antes de calcular toda la fórmula, podemos calcular solo el discriminante para saber cuántas soluciones reales tiene la ecuación, e incluso cuál será su naturaleza.

Si Δ > 0, la ecuación tiene dos raíces reales distintas. La raíz cuadrada de un número positivo existe en los números reales, y el signo ± da dos valores diferentes. Geométricamente, esto significa que la parábola correspondiente cruza el eje horizontal en dos puntos.

Si Δ = 0, la ecuación tiene exactamente una raíz real (o una raíz doble, porque los dos valores de la fórmula coinciden: (-b + 0) / 2a = (-b - 0) / 2a = -b/2a). Geométricamente, la parábola es tangente al eje horizontal en un único punto, el vértice.

Si Δ < 0, la ecuación no tiene raíces reales. La raíz cuadrada de un número negativo no existe en el conjunto de los números reales (es un número imaginario). Geométricamente, la parábola no toca en ningún punto el eje horizontal: está completamente por encima o por debajo de él.

Esta información es poderosa porque nos permite conocer el tipo de solución sin hacer el cálculo completo. Por ejemplo, para saber si una empresa familiar mexicana tiene un punto de equilibrio económico (el momento en que los ingresos igualan los costos), podemos modelar la situación con una ecuación cuadrática y calcular el discriminante. Si Δ > 0, hay dos puntos de equilibrio. Si Δ = 0, hay exactamente un punto de equilibrio. Si Δ < 0, los costos nunca igualan a los ingresos en el rango analizado, lo que indica que el modelo necesita revisarse.

Calcular el discriminante es rápido y evita el trabajo de resolver toda la ecuación cuando solo necesitamos saber cuántas soluciones existen.`,
      preguntas_comprension: [
        {
          pregunta: '¿Qué es el discriminante y cómo se calcula?',
          respuesta_guia: 'El discriminante es Δ = b² - 4ac, la expresión bajo el radical en la fórmula general. Se calcula elevando b al cuadrado y restando cuatro veces el producto de a y c.',
        },
        {
          pregunta: '¿Qué indica el discriminante sobre el número y tipo de soluciones de una ecuación cuadrática?',
          respuesta_guia: 'Δ > 0: dos raíces reales distintas. Δ = 0: una raíz real doble. Δ < 0: no hay raíces reales (las raíces son números complejos).',
        },
        {
          pregunta: '¿Cuál es la interpretación gráfica de los tres casos del discriminante?',
          respuesta_guia: 'Δ > 0: la parábola cruza el eje x en dos puntos. Δ = 0: la parábola es tangente al eje x en el vértice. Δ < 0: la parábola no toca el eje x.',
        },
      ],
      callouts: [
        {
          tipo: 'importante',
          contenido: 'Cuando el discriminante es negativo, las soluciones son números complejos de la forma a ± bi, donde i es la unidad imaginaria (√-1). Aunque parezcan abstractos, los números complejos tienen aplicaciones reales fundamentales en ingeniería eléctrica, física cuántica y procesamiento de señales digitales. El audio de tu celular existe gracias a cálculos con números complejos.',
        },
      ],
    },
  },

  // ── 31 ──────────────────────────────────────────────────────────────────
  {
    codigo: 'CNEYT-VI-P04-A1',
    nuevo_titulo: 'El dogma central de la biología molecular',
    nuevo_contenido: {
      nivel_lectura: 'intermedio',
      tiempo_estimado_minutos: 18,
      fuente: 'CEN Bachillerato — UAC Ciencias Naturales, Experimentales y Tecnología VI',
      texto: `En 1958, el biólogo Francis Crick propuso lo que llamó el dogma central de la biología molecular: la información genética fluye en una dirección, del ADN al ARN a la proteína. Este principio describe cómo la información almacenada en el ADN se usa para construir las proteínas que realizan prácticamente todas las funciones de la célula.

El primer proceso es la replicación: el ADN produce una copia exacta de sí mismo antes de que la célula se divida. La enzima helicasa separa las dos hebras de la doble hélice como si abriera un cierre. La ADN polimerasa lee cada hebra molde y sintetiza una hebra nueva complementaria, siguiendo las reglas de apareamiento de bases: A con T, C con G. La ligasa une los fragmentos del ADN recién sintetizado. El resultado son dos moléculas de ADN idénticas a la original.

El segundo proceso es la transcripción: el ADN sirve como molde para producir ARN mensajero (ARNm) en el núcleo de la célula. La ARN polimerasa lee la hebra molde del ADN y sintetiza una cadena de ARN complementaria. En los organismos eucariontes (como las células humanas), el ARN recién producido (pre-ARNm) contiene secuencias no codificantes llamadas intrones, que son eliminadas en un proceso llamado splicing. El ARN mensajero maduro resultante sale del núcleo hacia el citoplasma.

El tercer proceso es la traducción: el ARNm se lee en el ribosoma para construir una proteína. El ARNm está escrito en codones, tripletes de tres nucleótidos que corresponden a un aminoácido específico. El codón AUG (metionina) es universalmente el codon de inicio. Los codones UAA, UAG y UGA son señales de parada que indican al ribosoma que la cadena polipeptídica está completa. El ARN de transferencia (ARNt) actúa como adaptador: cada molécula de ARNt reconoce un codón específico en el ARNm con su anticodón y transporta el aminoácido correspondiente al ribosoma.

Las proteínas resultantes son de dos grandes tipos: estructurales (como el colágeno, que da resistencia a la piel y los tendones) y funcionales o enzimáticas (como la amilasa salival, que digiere el almidón). La variedad de proteínas que una célula puede producir es inmensa: el genoma humano contiene aproximadamente 20,000 genes que codifican proteínas.

El INMEGEN (Instituto Nacional de Medicina Genómica) en México investiga las variantes genéticas específicas de la población mexicana para desarrollar medicamentos y diagnósticos más precisos, aplicando directamente el conocimiento del dogma central.`,
      preguntas_comprension: [
        {
          pregunta: '¿Cuáles son los tres procesos del dogma central de la biología molecular y en qué orden ocurren?',
          respuesta_guia: 'Replicación (ADN → ADN), transcripción (ADN → ARNm) y traducción (ARNm → proteína). Ocurren en ese orden en la expresión génica.',
        },
        {
          pregunta: '¿Qué es un codón y cuál es la función del ARNt en la traducción?',
          respuesta_guia: 'Un codón es un triplete de tres nucleótidos en el ARNm que corresponde a un aminoácido específico. El ARNt actúa como adaptador: reconoce el codón con su anticodón y lleva el aminoácido correspondiente al ribosoma.',
        },
        {
          pregunta: '¿Qué es el splicing y por qué es necesario en células eucariontes?',
          respuesta_guia: 'Es el proceso de corte y empalme que elimina los intrones (secuencias no codificantes) del pre-ARNm para producir el ARNm maduro que será traducido. Es necesario porque el ADN eucarionte contiene secuencias no codificantes intercaladas en los genes.',
        },
      ],
      callouts: [
        {
          tipo: 'info',
          contenido: 'El descubrimiento de los virus ARN, como el VIH y el SARS-CoV-2, demostró que el dogma central tiene excepciones. Estos virus usan una enzima llamada transcriptasa inversa para copiar su ARN en ADN, lo que invierte temporalmente la dirección del flujo de información. Esta excepción no niega el dogma central, pero lo amplía.',
        },
      ],
    },
  },

  // ── 32 ──────────────────────────────────────────────────────────────────
  {
    codigo: 'IN-V-P07-A1',
    nuevo_titulo: 'Participating in Academic Debates and Panels',
    nuevo_contenido: {
      nivel_lectura: 'avanzado',
      tiempo_estimado_minutos: 20,
      fuente: 'CEN Bachillerato — UAC Inglés V',
      texto: `Academic debates and panel discussions are structured conversations where participants express, defend, and challenge ideas using evidence and reasoning. In English, these formats are used in universities, international conferences, and organizations like the United Nations. Developing the language and strategies for these conversations is a key B1-level skill.

In a formal academic debate, participants are divided into two sides: the proposition (which argues in favor of a statement) and the opposition (which argues against it). Each side presents its arguments, then rebuttals — responses to the other side's points — and finally summaries. The moderator manages the time, gives the floor to each speaker, and ensures the debate stays on topic.

In a panel discussion, several speakers each present their perspective on a topic, and a moderator coordinates the conversation and invites questions from the audience. Unlike a debate, a panel does not require participants to take opposing positions; it encourages multiple viewpoints on the same issue.

Knowing the right language for different moments in these conversations is essential. To ask for the floor politely, say: May I add something? If I could just finish my point... Could I respond to that? To agree with a point, say: I agree with what [name] said because... That is a valid point, and I would add that... To disagree respectfully, use: I see your point; however, I would argue that... On the contrary, the evidence shows... I understand that perspective, but there is another way to look at it. To elaborate on your own idea: In other words... To be more specific... As an example of what I mean... This shows that...

Active listening is just as important as speaking. When you paraphrase, you show you understood: So what you are saying is that... What I hear is that you believe... Clarifying questions show engagement: Could you clarify what you mean by...? Are you saying that...?

At a B1 level, you should be comfortable discussing topics like the environment, technology, education, and social equality. Practice expanding your vocabulary in these areas: sustainability, inequality, access to education, digital rights, renewable energy, social justice. In Mexico, UNAM student forums and Model United Nations (MUN) conferences provide real opportunities to practice these skills in a formal English environment.`,
      preguntas_comprension: [
        {
          pregunta: 'What is the difference between a formal debate and a panel discussion?',
          respuesta_guia: 'In a debate, participants take opposing sides (proposition vs. opposition) and rebut each other. In a panel, multiple speakers share different perspectives on the same topic without necessarily opposing each other, and a moderator coordinates.',
        },
        {
          pregunta: 'How do you disagree respectfully in English? Give two phrases and explain why tone matters.',
          respuesta_guia: 'I see your point; however, I would argue that... / On the contrary, the evidence shows... Tone matters because respectful disagreement maintains the collaborative spirit of academic conversation and ensures others will continue to listen to your arguments.',
        },
        {
          pregunta: 'What is the purpose of paraphrasing in a debate or panel and how do you do it?',
          respuesta_guia: 'Paraphrasing shows you listened and understood. Use: So what you are saying is... / What I hear is that you believe... It also gives the other person a chance to correct any misunderstanding before you respond.',
        },
      ],
      callouts: [
        {
          tipo: 'importante',
          contenido: 'In academic English, the strength of your argument depends not just on what you say but on how you support it. Saying I think social media is bad is an opinion. Saying Studies from the Oxford Internet Institute show that heavy social media use correlates with lower wellbeing in teenagers is an argument supported by evidence. Always link your opinions to data, examples, or expert sources.',
        },
      ],
    },
  },

  // ── 33 ──────────────────────────────────────────────────────────────────
  {
    codigo: 'CH-II-P02-A1',
    nuevo_titulo: '¿Cómo formular hipótesis históricas? Análisis de fuentes del siglo XIX mexicano',
    nuevo_contenido: {
      nivel_lectura: 'intermedio',
      tiempo_estimado_minutos: 18,
      fuente: 'CEN Bachillerato — UAC Ciencias Históricas II',
      texto: `El historiador no observa el pasado directamente: lo reconstruye a partir de rastros que el tiempo ha dejado en documentos, objetos, imágenes, edificios y testimonios. Para dar sentido a esos rastros, el historiador formula hipótesis: afirmaciones provisionales sobre el pasado que pueden ser sustentadas o refutadas con evidencia.

Una hipótesis histórica bien formulada sigue una estructura lógica: dado que existen las condiciones X, se propone que ocurrió Y por las razones Z. La hipótesis no es una certeza definitiva sino una interpretación provisional, sujeta a revisión cuando aparecen nuevas fuentes o cuando las existentes se releen con nuevas preguntas. En ese sentido, la historia es siempre una conversación abierta con el pasado, no un relato cerrado y terminado.

Las fuentes históricas del México del siglo XIX son ricas y variadas. Los periódicos de la época —como El Monitor Republicano, fundado en 1844 y defensor del liberalismo— permiten conocer los debates políticos, las noticias del día y las opiniones de las élites ilustradas. Las fotografías del Archivo Casasola, aunque de finales del siglo XIX y principios del XX, documentan la vida cotidiana, los personajes políticos y los eventos históricos con una inmediatez que los documentos escritos no tienen. Las memorias de viajeros extranjeros, como el relato de Frances Calderón de la Barca —esposa del primer embajador español en México independiente— ofrecen una mirada externa sobre la sociedad mexicana de la época. El Archivo General de la Nación (AGN) conserva miles de documentos oficiales: decretos, juicios, correspondencia gubernamental, padrones de población.

El proceso de formulación de hipótesis a partir de fuentes sigue cuatro pasos. Primero: observar la fuente con atención, identificar qué tipo de documento es, quién lo produjo, cuándo y en qué contexto. Segundo: contextualizar, es decir, situar la fuente en el marco histórico más amplio para entender qué significaba ese documento en su época. Tercero: formular la hipótesis a partir de lo observado, usando la estructura lógica descrita arriba. Cuarto: buscar otras fuentes que confirmen, maticen o contradigan la hipótesis, para fortalecer o revisar la interpretación.

La Guerra de Reforma (1857-1861) es un ejemplo rico para la práctica. El Plan de Ayutla (1854) y los Tratados de la Mesilla (1853) son documentos que permiten formular hipótesis sobre las causas del conflicto entre liberales y conservadores, la influencia de los intereses estadounidenses en el territorio mexicano y el papel de la Iglesia Católica en la política del siglo XIX.`,
      preguntas_comprension: [
        {
          pregunta: '¿Qué es una hipótesis histórica y en qué se diferencia de una afirmación definitiva?',
          respuesta_guia: 'Una hipótesis histórica es una afirmación provisional sobre el pasado que puede ser sustentada o refutada con evidencia. Se diferencia de una afirmación definitiva en que es revisable: si aparecen nuevas fuentes o se releen las existentes con nuevas preguntas, la hipótesis puede modificarse.',
        },
        {
          pregunta: '¿Cuáles son los cuatro pasos para formular una hipótesis a partir de una fuente histórica?',
          respuesta_guia: 'Observar la fuente (tipo, autor, contexto), contextualizar (situarla en el marco histórico), formular la hipótesis (afirmación provisional estructurada) y buscar otras fuentes que la confirmen o contradigan.',
        },
        {
          pregunta: '¿Por qué son útiles las memorias de viajeros extranjeros como fuente histórica? ¿Qué limitaciones tienen?',
          respuesta_guia: 'Son útiles porque ofrecen una mirada externa que puede ver lo que los locales dan por sentado. Sus limitaciones: el viajero puede tener sesgos culturales, puede no entender el contexto local y puede seleccionar lo que confirma sus prejuicios previos.',
        },
      ],
      callouts: [
        {
          tipo: 'info',
          contenido: 'El Archivo General de la Nación (AGN) de México, ubicado en el Palacio Negro de Lecumberri en la Ciudad de México, custodia más de 45 kilómetros lineales de documentos que van desde el periodo colonial hasta el siglo XX. Desde 2013, el AGN ha digitalizado parte de su acervo para que investigadores de todo el mundo puedan consultarlo en línea.',
        },
      ],
    },
  },

  // ── 34 ──────────────────────────────────────────────────────────────────
  {
    codigo: 'CNEYT-V-P08-A1',
    nuevo_titulo: 'Física y ética: energía nuclear, telecomunicaciones y sociedad',
    nuevo_contenido: {
      nivel_lectura: 'avanzado',
      tiempo_estimado_minutos: 20,
      fuente: 'CEN Bachillerato — UAC Ciencias Naturales, Experimentales y Tecnología V',
      texto: `La física no produce tecnología en el vacío: produce tecnología en un contexto social, político y económico que determina para qué y para quién se usa. La pregunta de si la ciencia puede ser neutral —si el conocimiento científico existe independientemente de sus usos y consecuencias— es una de las más profundas de la filosofía de la ciencia y la ética.

La fisión nuclear es el proceso por el cual núcleos de átomos pesados (como el uranio-235 o el plutonio-239) se dividen al ser bombardeados con neutrones, liberando enormes cantidades de energía y más neutrones que perpetúan la reacción en cadena. Este mismo proceso físico es el que alimenta las bombas atómicas —cuyo primer uso militar en Hiroshima y Nagasaki en 1945 mató a más de 200,000 personas— y el que genera electricidad en las plantas nucleares, donde la reacción se controla cuidadosamente para producir calor y mover turbinas.

En México, la planta nucleoeléctrica de Laguna Verde, ubicada en el municipio de Alto Lucero en Veracruz, cuenta con dos reactores de agua en ebullición y produce aproximadamente el 3.5% de la electricidad nacional (CFE 2023). No emite CO2 durante la generación, lo que la hace relevante en el contexto de la transición energética. Sin embargo, el problema de los residuos radiactivos de alta actividad sigue sin resolverse globalmente: estos materiales mantienen su peligrosidad durante miles de años y no existe todavía un repositorio geológico permanente y operativo en ningún país del mundo.

Las telecomunicaciones plantean un dilema diferente. Las ondas electromagnéticas que hacen posible el WiFi, el 4G y el 5G son la misma física que permite la comunicación global, el acceso al conocimiento y la medicina telemática en zonas rurales de México. Pero también son la infraestructura sobre la que operan sistemas de vigilancia masiva: cámaras de reconocimiento facial, seguimiento de dispositivos móviles, recopilación de datos sin consentimiento informado. La Ley Federal de Telecomunicaciones y Radiodifusión en México establece algunos límites, pero la vigilancia digital es un campo en constante expansión regulatoria.

El principio de precaución, adoptado en el ámbito ambiental y tecnológico, propone que cuando existe incertidumbre científica sobre los riesgos de una tecnología, la carga de la prueba recae sobre quienes la desarrollan: deben demostrar que es segura antes de ser adoptada masivamente, no al revés.

El caso de los físicos del Proyecto Manhattan es paradigmático: muchos de ellos —incluyendo a Robert Oppenheimer y a Albert Einstein— expresaron públicamente su arrepentimiento por haber contribuido al desarrollo de la bomba atómica una vez que vieron sus consecuencias. La responsabilidad del científico ante las aplicaciones de su conocimiento es una pregunta que la física del siglo XXI no puede eludir.`,
      preguntas_comprension: [
        {
          pregunta: '¿Cómo puede el mismo proceso físico —la fisión nuclear— dar lugar a tecnologías con consecuencias tan opuestas?',
          respuesta_guia: 'Porque el proceso físico en sí es neutro: libera energía. Lo que determina las consecuencias es el contexto social y político en que se aplica: en una bomba, la energía se libera de manera explosiva e incontrolada; en una planta nuclear, se controla para generar electricidad de forma sostenida.',
        },
        {
          pregunta: '¿Qué es el principio de precaución y por qué es relevante para las nuevas tecnologías?',
          respuesta_guia: 'Es el principio que establece que ante incertidumbre científica sobre los riesgos de una tecnología, quienes la desarrollan deben demostrar que es segura antes de su adopción masiva. Es relevante porque muchas tecnologías (5G, IA, edición genética) se adoptan antes de que se comprendan completamente sus riesgos.',
        },
        {
          pregunta: '¿Qué dilema ético plantea la vigilancia digital habilitada por las telecomunicaciones?',
          respuesta_guia: 'La misma infraestructura que permite la comunicación y el acceso al conocimiento también permite la vigilancia masiva, el seguimiento de personas y la recopilación de datos sin consentimiento. El dilema es cómo aprovechar los beneficios sin sacrificar la privacidad y las libertades individuales.',
        },
      ],
      callouts: [
        {
          tipo: 'importante',
          contenido: 'El dilema del científico ante las aplicaciones de su trabajo no es solo histórico. Hoy, ingenieros de inteligencia artificial enfrentan preguntas similares: ¿debo trabajar en sistemas de reconocimiento facial que pueden usarse para vigilar a manifestantes? ¿Debo desarrollar algoritmos de recomendación que amplifican la desinformación? La ética profesional en ciencia y tecnología es una disciplina viva y urgente.',
        },
      ],
    },
  },
];

// ── Función principal ───────────────────────────────────────────────────────
async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) { console.error('Faltan variables de entorno'); process.exit(1); }

  const sb = createClient<Database>(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  console.log(`\n🔧 CEN Bachillerato — Fix videos placeholder (${FIXES.length} actividades)\n`);

  let actualizadas = 0;
  let omitidas = 0;

  for (const fix of FIXES) {
    // Check current type (idempotency)
    const { data: current } = await sb
      .from('actividades')
      .select('tipo')
      .eq('codigo', fix.codigo)
      .single();

    if (!current) { console.log(`  ⚠  ${fix.codigo}: no encontrada — omitiendo`); omitidas++; continue; }
    if (current.tipo === 'lectura') { console.log(`  ↩  ${fix.codigo}: ya convertida — omitiendo`); omitidas++; continue; }

    const { error } = await sb
      .from('actividades')
      .update({
        tipo: 'lectura',
        titulo: fix.nuevo_titulo,
        contenido: fix.nuevo_contenido as never,
        // nivel_revision: 'robustecida',  // Uncomment after migration 06 runs
      })
      .eq('codigo', fix.codigo);

    if (error) { console.error(`  ❌ ${fix.codigo}: ${error.message}`); continue; }
    console.log(`  ✓  ${fix.codigo}: video → lectura`);
    actualizadas++;
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ LISTO — ${actualizadas} convertidas, ${omitidas} omitidas`);
  console.log(`${'='.repeat(60)}\n`);
  console.log('NOTA: Para marcar nivel_revision=\'robustecida\' después de correr la migración SQL,');
  console.log('      descomentá la línea // nivel_revision: \'robustecida\' en el script.');
}

// ── CLI guard ───────────────────────────────────────────────────────────────
if (
  process.env.NODE_ENV !== 'test' &&
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch((err) => {
    console.error('ERROR FATAL:', err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
