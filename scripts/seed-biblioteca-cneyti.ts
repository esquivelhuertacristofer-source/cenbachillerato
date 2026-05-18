/**
 * Seed script — Biblioteca Ciencias Naturales, Experimentales y Tecnología I (CNEYT-I)
 * Ejecutar: npx ts-node scripts/seed-biblioteca-cneyti.ts
 * Requiere: 05_biblioteca.sql ejecutada en Supabase
 * NO ejecutar hasta tener la migración aplicada.
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../.env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const UAC_CODIGO = "CNEYT-I";

const FICHAS = [
  {
    slug: "cneyt-i-metodo-cientifico",
    titulo: "El Método Científico: El Arte de Preguntar al Universo",
    categoria: "Naturaleza de la Ciencia",
    tiempo_lectura_minutos: 6,
    conceptos_clave: ["método científico", "hipótesis", "experimento", "variable", "conclusión", "replicabilidad"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "El método científico es el conjunto de procedimientos sistemáticos que los científicos usan para investigar fenómenos naturales, establecer hechos y construir conocimiento confiable. No es un algoritmo rígido sino una guía flexible que garantiza que las conclusiones estén basadas en evidencia y puedan ser verificadas por otros investigadores." },
        { tipo: "subtitulo", contenido: "Etapas del método científico" },
        { tipo: "lista", items: [
          "Observación: percibir un fenómeno que genera una pregunta (¿Por qué las plantas crecen más cerca de la ventana?)",
          "Planteamiento del problema: formular la pregunta con claridad",
          "Hipótesis: proponer una explicación provisional que pueda ponerse a prueba",
          "Experimentación: diseñar y realizar experimentos controlados que pongan a prueba la hipótesis",
          "Análisis de datos: interpretar los resultados obtenidos",
          "Conclusión: determinar si los datos apoyan o refutan la hipótesis",
          "Comunicación: publicar los resultados para que otros los validen o refuten",
        ] },
        { tipo: "callout", variante: "importante", contenido: "Una hipótesis científica debe ser falsable: debe ser posible en principio demostrar que está equivocada. 'Las plantas crecen más cuando reciben luz solar directa' es falsable. 'Las plantas tienen alma' no lo es. La falsabilidad, propuesta por Karl Popper, es el criterio que distingue la ciencia de la pseudociencia." },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Diagrama circular del método científico con flechas entre las etapas, mostrando que es un proceso iterativo y no lineal", caption: "El método científico es un ciclo continuo, no una escalera en un solo sentido." },
        { tipo: "callout", variante: "sabias", contenido: "La replicabilidad (que otros investigadores puedan repetir el experimento y obtener el mismo resultado) es fundamental en ciencia. En 2015, el 'Proyecto de Replicabilidad' intentó reproducir 100 estudios publicados en revistas de psicología y solo pudo replicar el 39%. Esto generó una 'crisis de replicabilidad' que llevó a reformas en cómo se publica investigación científica." },
      ],
    },
  },
  {
    slug: "cneyt-i-celula-unidad-de-vida",
    titulo: "La Célula: La Unidad Fundamental de la Vida",
    categoria: "Biología",
    tiempo_lectura_minutos: 7,
    conceptos_clave: ["célula", "teoría celular", "célula procariota", "célula eucariota", "organelos", "membrana celular"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "La célula es la unidad estructural y funcional más pequeña de todos los seres vivos. Toda la vida en la Tierra — desde las bacterias unicelulares hasta los árboles de secoya de 100 metros y los seres humanos con 37 billones de células — está construida con este mismo bloque fundamental. Esta es la esencia de la teoría celular, uno de los principios más importantes de la biología." },
        { tipo: "subtitulo", contenido: "Los tres postulados de la teoría celular" },
        { tipo: "lista", items: [
          "Todos los seres vivos están formados por una o más células",
          "La célula es la unidad básica de estructura y función de todos los seres vivos",
          "Toda célula proviene de una célula preexistente (omnis cellula e cellula)",
        ] },
        { tipo: "callout", variante: "importante", contenido: "Los virus NO son células y son el principal objeto de debate sobre qué constituye 'vida'. No tienen metabolismo propio, no pueden reproducirse sin una célula huésped y no están compuestos por células. Son considerados por muchos como entidades en el límite entre lo vivo y lo no vivo." },
        { tipo: "subtitulo", contenido: "Células procariotas vs. eucariotas" },
        { tipo: "lista", items: [
          "Procariotas: sin núcleo definido (ADN flotante en el citoplasma), sin organelos membranosos, pequeñas. Ejemplo: bacterias, arqueas",
          "Eucariotas: núcleo definido con membrana, organelos especializados, más grandes. Ejemplo: células animales, vegetales, hongos y protistas",
        ] },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Comparación visual entre una célula procariota (bacteria) y una célula eucariota animal, con sus organelos etiquetados", caption: "Diferencias estructurales entre células procariotas y eucariotas." },
        { tipo: "callout", variante: "sabias", contenido: "La mitocondria tiene su propio ADN y se reproduce independientemente dentro de la célula. Esto llevó a la teoría endosimbiótica de Lynn Margulis (1967): las mitocondrias (y también los cloroplastos en plantas) fueron bacterias independientes que fueron 'engullidas' por células ancestrales hace 1,500-2,000 millones de años y terminaron viviendo en simbiosis. Hoy son parte inseparable de la célula eucariota." },
      ],
    },
  },
  {
    slug: "cneyt-i-adn-y-genetica",
    titulo: "ADN, Genes y Herencia: El Código de la Vida",
    categoria: "Biología",
    tiempo_lectura_minutos: 7,
    conceptos_clave: ["ADN", "gen", "cromosoma", "herencia", "mutación", "CRISPR", "genoma"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "El ADN (ácido desoxirribonucleico) es la molécula que almacena la información genética de todos los seres vivos. Es una doble hélice formada por cuatro bases nitrogenadas (Adenina, Timina, Guanina, Citosina) que se combinan como letras de un alfabeto de cuatro caracteres para escribir las instrucciones de construcción y funcionamiento de cada organismo." },
        { tipo: "subtitulo", contenido: "Del ADN a la proteína: el dogma central de la biología molecular" },
        { tipo: "lista", items: [
          "ADN → (transcripción) → ARNm → (traducción) → Proteína",
          "Los genes son segmentos de ADN que codifican para una proteína específica",
          "El genoma humano tiene aproximadamente 3,000 millones de pares de bases y 20,000-25,000 genes",
          "Solo el ~2% del ADN humano codifica proteínas; el resto ('ADN no codificante') tiene funciones reguladoras u otras aún bajo investigación",
        ] },
        { tipo: "callout", variante: "importante", contenido: "Las mutaciones son cambios en la secuencia del ADN. La mayoría son neutras o dañinas, pero ocasionalmente una mutación confiere ventaja y puede ser seleccionada evolutivamente. Sin mutaciones no habría evolución, pero con demasiadas mutaciones no podría haber vida estable. La tasa de mutación está finamente calibrada." },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Diagrama de la doble hélice del ADN con las bases nitrogenadas emparejadas y la escala mostrando desde el cromosoma hasta el nucleótido individual", caption: "Estructura del ADN: de la célula al nucleótido." },
        { tipo: "parrafo", contenido: "CRISPR-Cas9 es una tecnología revolucionaria de edición genética que permite 'cortar y pegar' secuencias de ADN con una precisión sin precedentes. Fue descubierta en bacterias como sistema de defensa contra virus. Sus inventoras, Jennifer Doudna y Emmanuelle Charpentier, recibieron el Premio Nobel de Química 2020. Sus aplicaciones van desde la cura de enfermedades genéticas hasta el mejoramiento de cultivos." },
        { tipo: "callout", variante: "sabias", contenido: "El genoma humano comparte el 98.7% de sus genes con el chimpancé, el 85% con el ratón, el 31% con la mosca de la fruta y el 26% con la levadura de cerveza. La vida en la Tierra comparte un ancestro común, y la genómica ha revelado este parentesco con una precisión que Darwin nunca imaginó." },
      ],
    },
  },
  {
    slug: "cneyt-i-evolucion",
    titulo: "La Teoría de la Evolución: Cómo Surgió la Diversidad de la Vida",
    categoria: "Biología",
    tiempo_lectura_minutos: 7,
    conceptos_clave: ["evolución", "selección natural", "Darwin", "adaptación", "especiación", "árbol de la vida"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "La teoría de la evolución por selección natural es el principio unificador de toda la biología. Formulada por Charles Darwin en 'El origen de las especies' (1859) y posteriormente enriquecida por la genética, explica cómo la increíble diversidad de la vida — más de 8 millones de especies descritas — surgió de ancestros comunes a través del tiempo." },
        { tipo: "subtitulo", contenido: "Los pilares de la teoría evolutiva" },
        { tipo: "lista", items: [
          "Variación: los individuos de una misma especie son diferentes entre sí",
          "Herencia: las características se transmiten de padres a hijos",
          "Selección natural: los individuos con características más ventajosas para su entorno sobreviven y se reproducen más",
          "Tiempo: dado suficiente tiempo, la selección acumulada produce cambios tan grandes que surgen nuevas especies",
        ] },
        { tipo: "callout", variante: "importante", contenido: "La evolución NO tiene dirección ni propósito. No avanza 'hacia' algo más complejo o 'mejor'. Los humanos no somos el resultado final de un proceso teleológico: somos uno de los millones de resultados de la evolución, tan evolucionados como los pulpos o las bacterias, que llevan el mismo tiempo en la Tierra que nosotros." },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Árbol de la vida mostrando la diversidad de todos los seres vivos y su parentesco evolutivo, con el ancestro universal común en la base", caption: "El árbol de la vida: todos los seres vivos compartimos un ancestro común." },
        { tipo: "parrafo", contenido: "La evolución humana: nuestro linaje se separó del de los chimpancés hace aproximadamente 6-7 millones de años. El Homo sapiens anatómicamente moderno apareció hace unos 300,000 años en África, y llegó a América hace aproximadamente 15,000-20,000 años, cruzando por el estrecho de Bering cuando el nivel del mar era más bajo durante la última glaciación." },
        { tipo: "callout", variante: "sabias", contenido: "La resistencia a los antibióticos es evolución en tiempo real: las bacterias mutan rápidamente y las que por azar tienen resistencia a un antibiótico sobreviven y se reproducen más cuando son expuestas a él. Por eso los médicos recomiendan completar el tratamiento antibiótico aunque uno se sienta mejor: detenerlo antes elimina a las bacterias sensibles pero puede dejar sobrevivir a las resistentes." },
      ],
    },
  },
  {
    slug: "cneyt-i-ecosistemas",
    titulo: "Ecosistemas: Las Redes de la Vida",
    categoria: "Ecología",
    tiempo_lectura_minutos: 6,
    conceptos_clave: ["ecosistema", "cadena trófica", "biodiversidad", "bioma", "ciclos biogeoquímicos", "equilibrio ecológico"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "Un ecosistema es el conjunto formado por todos los seres vivos (biocenosis) y los elementos no vivos (biotopo: suelo, agua, aire, luz solar) de un territorio, y las relaciones que establecen entre sí. Los ecosistemas no son estáticos: son sistemas dinámicos en constante flujo de materia y energía." },
        { tipo: "subtitulo", contenido: "Niveles tróficos: quién come a quién" },
        { tipo: "lista", items: [
          "Productores (autótrofos): plantas, algas y bacterias fotosintéticas que convierten energía solar en materia orgánica",
          "Consumidores primarios (herbívoros): animales que comen plantas (conejos, venados, chapulines)",
          "Consumidores secundarios (carnívoros de primer orden): animales que comen herbívoros (zorros, halcones)",
          "Consumidores terciarios: depredadores que comen carnívoros (águilas reales, pumas, orcas)",
          "Descomponedores: hongos y bacterias que descomponen la materia muerta, devolviendo nutrientes al suelo",
        ] },
        { tipo: "callout", variante: "importante", contenido: "Solo el 10% de la energía se transfiere de un nivel trófico al siguiente; el 90% se pierde como calor. Por eso los ecosistemas tienen pirámides de biomasa con muchos productores en la base y pocos depredadores en la cima. También explica por qué comer plantas es ambientalmente más eficiente que comer carne." },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Pirámide trófica de un ecosistema de bosque templado mexicano con productores, herbívoros, carnívoros y descomponedores, y flechas indicando el flujo de energía", caption: "La pirámide trófica: flujo de energía en un ecosistema de bosque." },
        { tipo: "parrafo", contenido: "México es el cuarto país más megadiverso del mundo, con el 10-12% de todas las especies del planeta. Esto se debe a su posición geográfica (zona de transición entre dos regiones biogeográficas), su variada orografía (montañas, valles, costas, desiertos, selvas) y su historia geológica. Sin embargo, esta biodiversidad está amenazada por la deforestación, el cambio climático y el tráfico de especies." },
        { tipo: "callout", variante: "sabias", contenido: "El lobo es un 'ingeniero del ecosistema': su reintroducción en Yellowstone en 1995 desencadenó un fenómeno llamado 'cascada trófica'. Los lobos redujeron la población de alces que sobreexplotaban las riberas de los ríos. Al recuperarse la vegetación ribereña, los castores regresaron, sus presas cambiaron el curso de los ríos, la biodiversidad aumentó. La ausencia o presencia de un solo depredador cambia todo un ecosistema." },
      ],
    },
  },
  {
    slug: "cneyt-i-materia-y-sus-estados",
    titulo: "La Materia y sus Estados: Todo lo que Nos Rodea",
    categoria: "Química y Física",
    tiempo_lectura_minutos: 6,
    conceptos_clave: ["materia", "estados de la materia", "propiedades físicas", "propiedades químicas", "cambios de estado"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "La materia es todo lo que tiene masa y ocupa espacio. Todo lo que podemos tocar, ver, oler o medir directamente está compuesto de materia. La física y la química estudian la materia desde distintas perspectivas: sus propiedades, transformaciones y la energía involucrada en ellas." },
        { tipo: "subtitulo", contenido: "Los estados de la materia" },
        { tipo: "lista", items: [
          "Sólido: partículas muy unidas, forma y volumen definidos, poco movimiento molecular",
          "Líquido: partículas más separadas, volumen definido pero forma variable según el recipiente",
          "Gaseoso: partículas muy separadas y en movimiento rápido, sin forma ni volumen definidos",
          "Plasma: el cuarto estado más común en el universo; gas ionizado a altísima temperatura (estrellas, rayos, aurora boreal)",
          "Condensado de Bose-Einstein: quinto estado, a temperaturas cercanas al cero absoluto; experimental",
        ] },
        { tipo: "callout", variante: "importante", contenido: "El agua es la única sustancia en la Tierra que existe naturalmente en los tres estados clásicos: sólido (hielo), líquido (agua) y gaseoso (vapor). Esta característica, junto con sus propiedades térmicas y su capacidad de disolver otras sustancias, hace del agua la molécula más importante para la vida." },
        { tipo: "subtitulo", contenido: "Cambios de estado y cambios de energía" },
        { tipo: "lista", items: [
          "Fusión: sólido → líquido (requiere energía: calor de fusión)",
          "Solidificación: líquido → sólido (libera energía)",
          "Vaporización: líquido → gas (requiere mucha energía: calor de vaporización)",
          "Condensación: gas → líquido (libera energía)",
          "Sublimación: sólido → gas directamente (el hielo seco, el naftaleno)",
        ] },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Diagrama de los cambios de estado de la materia con flechas bidireccionales indicando los procesos (fusión, solidificación, etc.) y si requieren o liberan energía", caption: "Los cambios de estado de la materia y su relación con la energía." },
        { tipo: "callout", variante: "sabias", contenido: "El punto triple del agua (0.01°C y 611.7 Pa de presión) es el único estado en que el agua puede existir simultáneamente en los tres estados: sólido, líquido y gaseoso. Este punto es tan preciso y reproducible que se usaba como referencia para definir el kelvin (unidad de temperatura) hasta 2019." },
      ],
    },
  },
  {
    slug: "cneyt-i-tabla-periodica",
    titulo: "La Tabla Periódica: El Mapa del Universo de la Materia",
    categoria: "Química y Física",
    tiempo_lectura_minutos: 7,
    conceptos_clave: ["tabla periódica", "elemento químico", "grupos y períodos", "metales", "no metales", "Mendeleev"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "La tabla periódica es uno de los logros más grandes de la ciencia: un mapa ordenado de todos los elementos conocidos que revela patrones fundamentales en la estructura de la materia. Fue propuesta por Dmitri Mendeleev en 1869, quien organizó los 63 elementos conocidos entonces por su peso atómico y dejó espacios en blanco para elementos que predijo y que luego fueron descubiertos." },
        { tipo: "subtitulo", contenido: "Organización de la tabla periódica" },
        { tipo: "lista", items: [
          "Períodos (filas horizontales): los elementos de un mismo período tienen el mismo número de capas electrónicas",
          "Grupos (columnas verticales): los elementos de un mismo grupo tienen propiedades químicas similares porque tienen el mismo número de electrones en su capa exterior (electrones de valencia)",
          "Metales: buenos conductores de electricidad y calor, maleables, sólidos a temperatura ambiente (excepto el mercurio)",
          "No metales: malos conductores, más diversos en forma, incluyen los gases nobles (grupo 18)",
          "Metaloides (semimetales): propiedades intermedias; el silicio es el más importante (base de los semiconductores)",
        ] },
        { tipo: "callout", variante: "importante", contenido: "Los electrones de valencia son los electrones de la capa más externa de un átomo y determinan casi toda su química. Los elementos del grupo 18 (gases nobles: helio, neón, argón...) tienen su capa exterior completa y por eso no reaccionan con nada: son los solteros perfectos de la tabla periódica." },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Versión visual y colorida de la tabla periódica destacando los grupos principales, los metales, no metales y metaloides, con algunos elementos cotidianos marcados", caption: "La tabla periódica: el mapa de todos los elementos del universo conocido." },
        { tipo: "parrafo", contenido: "Actualmente se conocen 118 elementos, pero solo 94 se encuentran en la naturaleza; los demás son producidos artificialmente en laboratorios (elementos sintéticos como el tecnecio, el neptunio y el oganesson). Toda la materia visible del universo está formada por combinaciones de estos 118 elementos." },
        { tipo: "callout", variante: "sabias", contenido: "El carbono es el elemento más versátil del universo y la base de la vida. Puede formar más de 10 millones de compuestos diferentes (química orgánica). Esta versatilidad se debe a que puede unirse con sí mismo y con otros elementos en cuatro direcciones simultáneamente. El diamante y el grafito de un lápiz son ambos carbono puro, pero con estructuras cristalinas completamente distintas." },
      ],
    },
  },
  {
    slug: "cneyt-i-reacciones-quimicas",
    titulo: "Reacciones Químicas: La Materia se Transforma",
    categoria: "Química y Física",
    tiempo_lectura_minutos: 6,
    conceptos_clave: ["reacción química", "reactivos", "productos", "ecuación química", "conservación de la masa", "energía de activación"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "Una reacción química es un proceso en el que una o más sustancias (reactivos) se transforman en una o más sustancias nuevas (productos) con propiedades diferentes. Las reacciones químicas ocurren constantemente a tu alrededor: la digestión de los alimentos, la fotosíntesis de las plantas, la oxidación del hierro (herrumbre), la combustión de un fósforo." },
        { tipo: "subtitulo", contenido: "Ley de conservación de la masa" },
        { tipo: "parrafo", contenido: "Antoine Lavoisier (1789) formuló la ley de conservación de la masa: en una reacción química, la masa total de los reactivos es igual a la masa total de los productos. La materia no se crea ni se destruye; solo se transforma. Por eso las ecuaciones químicas deben estar balanceadas: el mismo número de átomos de cada elemento en ambos lados." },
        { tipo: "callout", variante: "importante", contenido: "La fotosíntesis es la reacción química más importante para la vida en la Tierra: las plantas usan luz solar, CO₂ y agua para producir glucosa (azúcar) y oxígeno. Sin fotosíntesis no habría oxígeno en la atmósfera, no habría alimentos y no existiría la vida tal como la conocemos. Toda la energía de los alimentos que comemos proviene originalmente del sol, capturada por la fotosíntesis." },
        { tipo: "subtitulo", contenido: "Tipos de reacciones químicas" },
        { tipo: "lista", items: [
          "Síntesis (combinación): A + B → AB (formación de compuestos)",
          "Descomposición: AB → A + B (rotura de compuestos)",
          "Sustitución simple: A + BC → AC + B (un elemento desplaza a otro)",
          "Doble sustitución: AB + CD → AD + CB (intercambio de iones)",
          "Combustión: combustible + O₂ → CO₂ + H₂O + energía",
          "Ácido-base: ácido + base → sal + agua (neutralización)",
        ] },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Animación estática de una reacción de combustión mostrando los átomos antes y después, con la ecuación balanceada y la energía liberada", caption: "Una reacción de combustión: los átomos se reorganizan, la masa se conserva." },
        { tipo: "callout", variante: "sabias", contenido: "El cuerpo humano realiza miles de reacciones bioquímicas por segundo. Las enzimas son proteínas que actúan como catalizadores biológicos: aceleran las reacciones química necesarias para la vida sin consumirse ellas mismas. Sin enzimas, la mayoría de las reacciones metabólicas ocurrirían demasiado lentamente para sostener la vida." },
      ],
    },
  },
  {
    slug: "cneyt-i-fuerzas-y-movimiento",
    titulo: "Fuerzas y Movimiento: Las Leyes de Newton",
    categoria: "Física",
    tiempo_lectura_minutos: 6,
    conceptos_clave: ["fuerza", "movimiento", "inercia", "aceleración", "gravedad", "leyes de Newton"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "Isaac Newton formuló en 1687 sus tres leyes del movimiento, que describieron con precisión matemática el comportamiento de los objetos desde una canica rodando hasta los planetas orbitando el Sol. Estas leyes dominaron la física durante más de 200 años y siguen siendo perfectamente válidas para describir el mundo cotidiano." },
        { tipo: "subtitulo", contenido: "Las tres leyes de Newton" },
        { tipo: "lista", items: [
          "Primera Ley (Inercia): un objeto en reposo permanece en reposo, y un objeto en movimiento continúa moviéndose en línea recta y velocidad constante, a menos que una fuerza externa actúe sobre él",
          "Segunda Ley (F = ma): la aceleración de un objeto es directamente proporcional a la fuerza neta que actúa sobre él e inversamente proporcional a su masa. F = m × a",
          "Tercera Ley (Acción y reacción): para cada acción hay una reacción igual y opuesta. Si empujas una pared, la pared te empuja a ti con la misma fuerza en sentido contrario",
        ] },
        { tipo: "callout", variante: "importante", contenido: "La inercia (Primera Ley) explica por qué usamos cinturón de seguridad: en una colisión, el auto se detiene bruscamente, pero tu cuerpo tiende a continuar moviéndose hacia adelante (inercia). El cinturón aplica la fuerza necesaria para detenerte con el auto, en lugar de que lo haga el parabrisas." },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Diagrama mostrando las tres leyes de Newton con ejemplos cotidianos: un auto frenando (inercia), un cohete despegando (segunda ley) y un globo desinflándose (tercera ley)", caption: "Las tres leyes de Newton con ejemplos de la vida cotidiana." },
        { tipo: "parrafo", contenido: "La Tercera Ley explica cómo vuelan los cohetes: los motores expulsan gases hacia abajo (acción) y el cohete es empujado hacia arriba (reacción). También explica cómo nadan los peces (empujan el agua hacia atrás y el agua los empuja hacia adelante) y cómo caminas (empujas el suelo hacia atrás y el suelo te empuja hacia adelante)." },
        { tipo: "callout", variante: "sabias", contenido: "Albert Einstein demostró que las leyes de Newton son aproximaciones excelentes para velocidades mucho menores que la velocidad de la luz, pero se rompen en condiciones extremas. La relatividad especial (1905) y la relatividad general (1915) de Einstein reemplazaron a Newton como la descripción más fundamental del espacio, tiempo y gravedad, con consecuencias que revolucionaron la física del siglo XX." },
      ],
    },
  },
  {
    slug: "cneyt-i-energia",
    titulo: "Energía: La Capacidad de Producir Cambios en el Universo",
    categoria: "Física",
    tiempo_lectura_minutos: 6,
    conceptos_clave: ["energía", "tipos de energía", "conservación de la energía", "transformaciones energéticas", "fuentes de energía"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "La energía es la capacidad de producir trabajo o cambio. No podemos crear ni destruir energía, solo transformarla de una forma a otra: esta es la Ley de Conservación de la Energía (Primera Ley de la Termodinámica). La energía está en el centro de toda la física, química y biología, y también de los grandes desafíos tecnológicos y ambientales del siglo XXI." },
        { tipo: "subtitulo", contenido: "Tipos de energía" },
        { tipo: "lista", items: [
          "Cinética: energía del movimiento (un auto en marcha, el viento, el agua de una catarata)",
          "Potencial gravitacional: almacenada por la posición de un objeto en un campo gravitacional (un libro en una repisa)",
          "Química: almacenada en los enlaces químicos (la gasolina, los alimentos, las baterías)",
          "Térmica: energía del movimiento de las partículas (calor)",
          "Electromagnética: energía de los campos eléctrico y magnético (luz, radio, microondas)",
          "Nuclear: almacenada en el núcleo atómico (fisión y fusión nuclear)",
        ] },
        { tipo: "callout", variante: "importante", contenido: "Toda la energía del cuerpo humano proviene de los alimentos que comemos. La energía química almacenada en los nutrientes se transforma en ATP (la 'moneda energética' de las células), que a su vez impulsa todos los procesos biológicos: movimiento muscular, síntesis de proteínas, señales nerviosas, mantenimiento de la temperatura corporal." },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Diagrama de flujo mostrando la conversión de energía solar → energía química (fotosíntesis) → energía química en alimentos → ATP celular → trabajo mecánico", caption: "La cadena de transformaciones energéticas: del sol a tus músculos." },
        { tipo: "parrafo", contenido: "La Segunda Ley de la Termodinámica establece que en cada transformación de energía, parte de ella se convierte inevitablemente en calor no utilizable (entropía). Por eso ningún motor es 100% eficiente. Esta ley también explica por qué el tiempo solo fluye en una dirección y por qué las cosas tienden naturalmente al desorden." },
        { tipo: "callout", variante: "sabias", contenido: "E = mc² es la ecuación más famosa de la ciencia, formulada por Einstein en 1905. Significa que masa y energía son equivalentes y convertibles: una pequeña cantidad de masa equivale a una cantidad enorme de energía (c es la velocidad de la luz, una constante gigantesca). Esta equivalencia es la base de la energía nuclear y de cómo brillan las estrellas." },
      ],
    },
  },
  {
    slug: "cneyt-i-cambio-climatico-ciencia",
    titulo: "Cambio Climático: La Ciencia detrás de la Crisis",
    categoria: "Ecología",
    tiempo_lectura_minutos: 7,
    conceptos_clave: ["efecto invernadero", "CO₂", "cambio climático", "calentamiento global", "gases de efecto invernadero", "evidencia científica"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "El cambio climático antropogénico (causado por la actividad humana) es el mayor desafío científico y político del siglo XXI. El consenso científico es abrumador: el 97% de los científicos del clima coinciden en que la Tierra se está calentando y que la causa principal es la emisión de gases de efecto invernadero por la actividad humana, principalmente la quema de combustibles fósiles." },
        { tipo: "subtitulo", contenido: "El efecto invernadero natural vs. el amplificado" },
        { tipo: "parrafo", contenido: "El efecto invernadero natural es necesario para la vida: ciertos gases en la atmósfera (CO₂, vapor de agua, metano, óxido nitroso) atrapan parte del calor solar y mantienen la temperatura promedio de la Tierra en ~15°C. Sin este efecto, la temperatura sería de –18°C. El problema es la amplificación: desde la Revolución Industrial, hemos aumentado el CO₂ atmosférico de 280 ppm a más de 420 ppm, intensificando el efecto invernadero." },
        { tipo: "callout", variante: "importante", contenido: "Los núcleos de hielo perforados en la Antártida contienen burbujas de aire atrapadas hace 800,000 años. Analizando la composición de ese aire, los científicos pueden reconstruir la temperatura y la concentración de CO₂ del pasado. Estos datos muestran una correlación casi perfecta entre CO₂ y temperatura, y revelan que los niveles actuales de CO₂ son los más altos en al menos 3 millones de años." },
        { tipo: "subtitulo", contenido: "Consecuencias actuales y proyectadas" },
        { tipo: "lista", items: [
          "Aumento de temperatura media global: +1.1°C desde la era preindustrial (cifra que sigue creciendo)",
          "Deshielo de glaciares y casquetes polares → aumento del nivel del mar",
          "Eventos climáticos extremos más frecuentes e intensos (huracanes, sequías, inundaciones)",
          "Acidificación de océanos (absorben CO₂ → forman ácido carbónico → daña corales y vida marina)",
          "Desplazamiento de especies y riesgo de extinción masiva",
        ] },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Gráfica de temperatura global desde 1850 hasta 2024 mostrando la curva ascendente de calentamiento, con la línea de 1.5°C del Acuerdo de París marcada", caption: "El registro de temperatura global: el calentamiento es inequívoco." },
        { tipo: "callout", variante: "sabias", contenido: "Eunice Newton Foote fue la primera científica en describir el efecto invernadero del CO₂, en 1856, ¡tres años antes que John Tyndall, a quien se le suele atribuir el descubrimiento! Sus experimentos con cilindros de vidrio y diferentes gases demostraron que el CO₂ absorbe y retiene calor más que otros gases. Fue ignorada durante décadas porque era mujer." },
      ],
    },
  },
  {
    slug: "cneyt-i-ondas-luz-y-sonido",
    titulo: "Ondas: Luz, Sonido y el Espectro Electromagnético",
    categoria: "Física",
    tiempo_lectura_minutos: 6,
    conceptos_clave: ["onda", "longitud de onda", "frecuencia", "espectro electromagnético", "luz visible", "sonido"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "Las ondas son perturbaciones que transportan energía a través de un medio (o del vacío, en el caso de las ondas electromagnéticas) sin transportar materia. Son responsables de la luz, el sonido, las comunicaciones inalámbricas, los rayos X médicos, el radar y el calor del sol que llega a la Tierra." },
        { tipo: "subtitulo", contenido: "Ondas mecánicas vs. electromagnéticas" },
        { tipo: "lista", items: [
          "Ondas mecánicas: necesitan un medio material para propagarse (sonido: vibración del aire, el agua o sólidos). No se propagan en el vacío.",
          "Ondas electromagnéticas: oscilaciones de campos eléctrico y magnético. NO necesitan medio: viajan a 300,000 km/s en el vacío (velocidad de la luz).",
        ] },
        { tipo: "callout", variante: "importante", contenido: "El sonido NO viaja en el espacio exterior, porque no hay aire ni otro medio material. Las explosiones del espacio que aparecen en las películas de ciencia ficción con sonido son físicamente incorrectas. En el espacio hay un silencio absoluto, excepto para las ondas electromagnéticas que sí se propagan en el vacío." },
        { tipo: "subtitulo", contenido: "El espectro electromagnético" },
        { tipo: "lista", items: [
          "Radio: longitudes de onda largas, energía baja (comunicaciones, radio, televisión)",
          "Microondas: cocinas de microondas, comunicaciones satelitales",
          "Infrarrojo: calor, mandos a distancia, visión nocturna",
          "Luz visible: la única parte que el ojo humano puede detectar (400-700 nm)",
          "Ultravioleta: causa quemaduras solares, esterilización, luz negra",
          "Rayos X: diagnóstico médico, aeropuertos",
          "Rayos gamma: mayor energía, emitidos por núcleos radiactivos, tratamiento del cáncer",
        ] },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Diagrama del espectro electromagnético completo con todas las regiones, sus longitudes de onda, frecuencias y aplicaciones cotidianas", caption: "El espectro electromagnético: la luz visible es solo una pequeña fracción." },
        { tipo: "callout", variante: "sabias", contenido: "Los colores que percibimos son resultado de las longitudes de onda de la luz que los objetos reflejan. Una manzana es roja porque absorbe todas las longitudes de onda de la luz visible excepto las rojas (620-750 nm), que refleja hacia nuestros ojos. Los insectos que ven en el ultravioleta 'ven' patrones en las flores invisibles para nosotros que los guían hacia el néctar." },
      ],
    },
  },
  {
    slug: "cneyt-i-cuerpo-humano-sistemas",
    titulo: "El Cuerpo Humano: Una Máquina Extraordinariamente Compleja",
    categoria: "Biología",
    tiempo_lectura_minutos: 7,
    conceptos_clave: ["sistemas del cuerpo humano", "homeostasis", "sistema nervioso", "sistema inmune", "sistema circulatorio"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "El cuerpo humano es uno de los sistemas más complejos y elegantes del universo conocido. Está compuesto por aproximadamente 37 billones de células organizadas en tejidos, órganos y sistemas que trabajan coordinadamente para mantener la homeostasis: el equilibrio dinámico de las condiciones internas necesarias para la vida." },
        { tipo: "subtitulo", contenido: "Los principales sistemas del cuerpo humano" },
        { tipo: "lista", items: [
          "Sistema nervioso: cerebro, médula espinal y nervios; coordinación y control de todas las funciones",
          "Sistema circulatorio: corazón, sangre y vasos sanguíneos; transporte de oxígeno, nutrientes y desechos",
          "Sistema respiratorio: pulmones y vías aéreas; intercambio de O₂ y CO₂",
          "Sistema digestivo: tubo digestivo y glándulas; procesamiento de alimentos y absorción de nutrientes",
          "Sistema inmune: células y proteínas defensoras contra infecciones y enfermedades",
          "Sistema endocrino: glándulas y hormonas; regulación química del organismo",
          "Sistema musculoesquelético: huesos, músculos y tendones; soporte y movimiento",
        ] },
        { tipo: "callout", variante: "importante", contenido: "La homeostasis es el mecanismo por el que el cuerpo mantiene condiciones internas estables a pesar de los cambios externos. La temperatura corporal se mantiene en ~37°C, el pH de la sangre entre 7.35 y 7.45, y el nivel de glucosa en rangos específicos, todo mediante sistemas de retroalimentación continua. La diabetes, la fiebre y la acidosis son ejemplos de fallos en la homeostasis." },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Diagrama del cuerpo humano con los principales sistemas representados en capas superpuestas: esquelético, muscular, circulatorio, nervioso y digestivo", caption: "Los sistemas del cuerpo humano: una orquesta de complejidad extraordinaria." },
        { tipo: "parrafo", contenido: "El sistema inmune es uno de los sistemas más sofisticados del cuerpo: distingue entre las propias células del cuerpo y los agentes patógenos extraños, tiene memoria (por eso las vacunas funcionan), puede generar millones de anticuerpos distintos y actuar de manera coordinada con precisión molecular." },
        { tipo: "callout", variante: "sabias", contenido: "El intestino humano alberga más de 38 billones de bacterias (el microbioma intestinal), tantas como células hay en el cuerpo humano. Estas bacterias no son enemigos: son aliadas esenciales. Participan en la digestión, producen vitaminas, entrenan al sistema inmune, y se comunican con el cerebro a través del 'eje intestino-cerebro'. Alterar el microbioma con antibióticos tiene consecuencias de largo alcance para la salud." },
      ],
    },
  },
  {
    slug: "cneyt-i-tecnologia-y-sociedad",
    titulo: "Tecnología y Ciencia: De la Invención al Cambio Social",
    categoria: "Naturaleza de la Ciencia",
    tiempo_lectura_minutos: 5,
    conceptos_clave: ["tecnología", "innovación", "revolución industrial", "ética tecnológica", "impacto social de la ciencia"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "La tecnología es la aplicación práctica del conocimiento científico para resolver problemas y satisfacer necesidades humanas. Aunque ciencia y tecnología están íntimamente relacionadas, no son lo mismo: la ciencia busca entender el mundo tal como es; la tecnología usa ese entendimiento para transformarlo. Sin ciencia no habría tecnología, pero también hay tecnologías desarrolladas empíricamente antes de tener base científica." },
        { tipo: "subtitulo", contenido: "Las revoluciones tecnológicas y sus impactos" },
        { tipo: "lista", items: [
          "Primera Revolución Industrial (1760-1840): máquina de vapor, textiles, transporte ferroviario → urbanización masiva, trabajo infantil, surgimiento del proletariado",
          "Segunda Revolución Industrial (1870-1914): electricidad, acero, química, motor de combustión → Ford, la cadena de producción, la sociedad de consumo",
          "Revolución Digital (1960-presente): computadoras, internet, telefonía → economía del conocimiento, globalización acelerada, nuevas formas de trabajo y comunicación",
          "Revolución de la Biotecnología (en curso): CRISPR, terapias génicas, medicina personalizada → dilemas éticos sobre modificación de la vida",
        ] },
        { tipo: "callout", variante: "importante", contenido: "El principio de precaución en tecnología establece que cuando una tecnología presenta riesgos potencialmente graves e irreversibles, la incertidumbre científica no justifica postergar medidas de protección. No esperar a tener certeza absoluta antes de actuar. Este principio guía regulaciones sobre OMG, nanotecnología y aplicaciones de IA." },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Línea de tiempo de las revoluciones tecnológicas desde la máquina de vapor hasta la IA, con íconos representativos y sus impactos sociales principales", caption: "Las grandes revoluciones tecnológicas y sus transformaciones sociales." },
        { tipo: "callout", variante: "sabias", contenido: "La penicilina (antibiótico) fue descubierta por accidente en 1928 cuando Alexander Fleming notó que un moho había contaminado sus cultivos bacterianos y los había matado. La vacuna contra el sarampión, la insulina para diabéticos, los trasplantes de órganos, la radioterapia contra el cáncer: la ciencia médica del siglo XX salvó más vidas que todas las guerras juntas quitaron." },
      ],
    },
  },
  {
    slug: "cneyt-i-astronomia-y-universo",
    titulo: "El Universo: Escala, Estructura y Origen",
    categoria: "Física",
    tiempo_lectura_minutos: 7,
    conceptos_clave: ["universo", "Big Bang", "galaxias", "año luz", "estrellas", "agujeros negros"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "El universo observable tiene aproximadamente 93,000 millones de años luz de diámetro y contiene entre 200,000 y 2,000,000 de millones de galaxias. Cada galaxia contiene entre 100,000 millones y varios billones de estrellas. El Sol es una estrella de tamaño medio en uno de los brazos de la Vía Láctea, una galaxia espiral con unos 200,000 millones de estrellas." },
        { tipo: "callout", variante: "importante", contenido: "Un año luz es la distancia que recorre la luz en un año viajando a 300,000 km/s: aproximadamente 9.46 billones de kilómetros. La estrella más cercana al Sol (Próxima Centauri) está a 4.24 años luz. La galaxia más cercana (Andrómeda) está a 2.5 millones de años luz. Cuando miramos las estrellas, estamos mirando el pasado: la luz tardó siglos, milenios o millones de años en llegar a nosotros." },
        { tipo: "subtitulo", contenido: "El Big Bang: el origen del universo" },
        { tipo: "parrafo", contenido: "La teoría del Big Bang es el modelo cosmológico estándar del origen y evolución del universo. Hace aproximadamente 13,800 millones de años, el universo comenzó como un estado de densidad y temperatura extremas (no 'explotó' desde un punto en el espacio: el espacio mismo se expandió). La evidencia incluye la expansión del universo, el fondo cósmico de microondas y la abundancia de hidrógeno y helio." },
        { tipo: "lista", items: [
          "0–10⁻³² segundos: inflación cósmica; el universo se expande exponencialmente",
          "3 minutos: nucleosíntesis; se forman los primeros núcleos atómicos (hidrógeno, helio, litio)",
          "380,000 años: el universo se enfría lo suficiente para que los átomos formen; la luz puede viajar libremente",
          "200 millones de años: se forman las primeras estrellas y galaxias",
          "9,100 millones de años: se forma el Sistema Solar",
          "13,800 millones de años: hoy",
        ] },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Línea de tiempo del universo desde el Big Bang hasta hoy, con hitos como la formación de estrellas, galaxias, el Sistema Solar y la aparición de la vida", caption: "13,800 millones de años de historia del universo en una línea de tiempo." },
        { tipo: "callout", variante: "sabias", contenido: "Los átomos de carbono, oxígeno, hierro y los demás elementos pesados que componen tu cuerpo fueron forjados en el interior de estrellas masivas que explotaron como supernovas hace miles de millones de años. Como dijo el astrofísico Carl Sagan: 'Somos polvo de estrellas'. No metafóricamente: literalmente. Los átomos de tu cuerpo estuvieron en el corazón de estrellas muertas antes de que el Sol naciera." },
      ],
    },
  },
  {
    slug: "cneyt-i-agua-y-ciclo-hidrologico",
    titulo: "El Agua: La Molécula de la Vida y su Ciclo en la Tierra",
    categoria: "Ecología",
    tiempo_lectura_minutos: 6,
    conceptos_clave: ["agua", "ciclo hidrológico", "propiedades del agua", "crisis del agua", "cuencas hidrológicas"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "El agua (H₂O) es la molécula más importante para la vida tal como la conocemos. Sus propiedades físicas y químicas únicas — polaridad, tensión superficial, calor específico elevado, expansión al congelarse — hacen posible la bioquímica de todos los seres vivos y regulan el clima de la Tierra." },
        { tipo: "subtitulo", contenido: "Propiedades extraordinarias del agua" },
        { tipo: "lista", items: [
          "Cohesión y tensión superficial: las moléculas de agua se atraen entre sí (puentes de hidrógeno), permitiendo que los insectos caminen sobre el agua",
          "Alto calor específico: se necesita mucha energía para calentar el agua, regulando así el clima costero",
          "Universal solvente: disuelve más sustancias que cualquier otro líquido (vital para las reacciones bioquímicas)",
          "Expansión al congelarse: el hielo es menos denso que el agua líquida, por eso flota y protege la vida acuática en invierno",
          "Transparencia: permite que la luz solar llegue a organismos fotosintéticos en cuerpos de agua",
        ] },
        { tipo: "callout", variante: "importante", contenido: "El ciclo hidrológico es el movimiento continuo del agua entre la atmósfera, la superficie terrestre y el subsuelo, impulsado por la energía solar y la gravedad. No hay agua 'nueva': el agua que bebes hoy puede haber sido lluvia hace 10,000 años, océano hace 100 millones de años, o parte de un dinosaurio. El agua es reciclada eternamente por el planeta." },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Diagrama del ciclo hidrológico mostrando evaporación de océanos y lagos, formación de nubes, precipitación, escorrentía, infiltración y recarga de acuíferos", caption: "El ciclo del agua: un sistema de reciclaje natural que lleva millones de años funcionando." },
        { tipo: "parrafo", contenido: "México enfrenta una grave crisis hídrica: el norte del país sufre escasez mientras que el sur tiene abundancia de agua. El Valle de México (Ciudad de México y área metropolitana, con 22 millones de personas) sobreexplota sus acuíferos subterráneos, extrayendo agua más rápido de lo que se recarga. El resultado es hundimiento del suelo (CDMX se hunde hasta 50 cm por año en algunas zonas) y escasez crónica." },
        { tipo: "callout", variante: "sabias", contenido: "Solo el 2.5% del agua en la Tierra es dulce, y de ese porcentaje, el 68.7% está atrapada en glaciares y casquetes polares, el 30.1% en aguas subterráneas, y solo el 0.3% en ríos y lagos accesibles. El cambio climático está derritiendo los glaciares (que alimentan ríos en verano) y alterando los patrones de lluvia, amenazando el acceso al agua de miles de millones de personas." },
      ],
    },
  },
  {
    slug: "cneyt-i-biotecnologia",
    titulo: "Biotecnología: Cuando la Ciencia Modifica la Vida",
    categoria: "Biología",
    tiempo_lectura_minutos: 6,
    conceptos_clave: ["biotecnología", "OMG", "vacunas de ARNm", "terapia génica", "bioinformática"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "La biotecnología es la aplicación de sistemas biológicos y organismos vivos para desarrollar productos y procesos con fines útiles. Aunque el término es moderno, la biotecnología es tan antigua como la fermentación del pan y la cerveza. Hoy, con la biología molecular, ha dado un salto cualitativo sin precedentes: podemos leer, escribir y editar el código genético de los seres vivos." },
        { tipo: "subtitulo", contenido: "Aplicaciones de la biotecnología moderna" },
        { tipo: "lista", items: [
          "Organismos genéticamente modificados (OMG): cultivos resistentes a plagas, sequía o con mayor valor nutricional",
          "Vacunas de ARNm: tecnología usada en las vacunas contra COVID-19 (Pfizer, Moderna); el organismo produce sus propias proteínas antigénicas",
          "Terapia génica: corrección de mutaciones causantes de enfermedades genéticas",
          "Biofármacos: producción de insulina, hormona de crecimiento y anticuerpos en bacterias o células modificadas",
          "Biocombustibles: etanol y biodiesel a partir de organismos fotosintéticos o residuos orgánicos",
          "Bioinformática: análisis de grandes conjuntos de datos genómicos con herramientas computacionales",
        ] },
        { tipo: "callout", variante: "importante", contenido: "La tecnología de vacunas de ARNm, utilizada por primera vez a gran escala durante la pandemia de COVID-19, representa un cambio de paradigma en la medicina: en lugar de introducir el patógeno o una versión debilitada, se introduce instrucciones genéticas para que las propias células produzcan la proteína del patógeno y entren al sistema inmune. Su velocidad de desarrollo (meses, no años) puede revolucionar la respuesta a futuras pandemias." },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Diagrama del proceso de producción de una vacuna de ARNm: de la secuencia genética del virus a la vacuna, la célula humana y la respuesta inmune generada", caption: "Cómo funciona una vacuna de ARNm: instrucciones genéticas para el sistema inmune." },
        { tipo: "callout", variante: "sabias", contenido: "El Proyecto Genoma Humano (1990-2003) secuenció por primera vez el genoma humano completo en un esfuerzo internacional de 13 años y 3,000 millones de dólares. Hoy, gracias a la secuenciación de nueva generación, un genoma humano completo se puede secuenciar en pocas horas por unos 200-300 dólares. Esta reducción exponencial de costos (de 3,000 millones a 300 dólares en 20 años) es uno de los avances tecnológicos más vertiginosos de la historia." },
      ],
    },
  },
  {
    slug: "cneyt-i-ciencia-en-mexico",
    titulo: "La Ciencia en México: Historia, Retos y Potencial",
    categoria: "Naturaleza de la Ciencia",
    tiempo_lectura_minutos: 5,
    conceptos_clave: ["ciencia en México", "CONAHCYT", "investigación científica", "vocaciones científicas", "Premio Nobel mexicano"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "México tiene una rica tradición científica, desde los avanzados conocimientos astronómicos y matemáticos de las culturas mesoamericanas hasta los investigadores contemporáneos que publican en las revistas científicas más prestigiosas del mundo. Sin embargo, la inversión en ciencia y tecnología en México está entre las más bajas de los países de la OCDE, lo que limita el desarrollo del sector." },
        { tipo: "subtitulo", contenido: "Hitos de la ciencia mexicana" },
        { tipo: "lista", items: [
          "Mario Molina: Premio Nobel de Química 1995 por descubrir la destrucción del ozono por los clorofluorocarbonos (CFC). Es el único mexicano que ha ganado el Nobel en ciencias.",
          "Barros Sierra y la autonomía universitaria: defensa de la UNAM como espacio de investigación libre",
          "Guillermo González Camarena: inventor del televisor a color (1940), aunque su patente fue superada comercialmente por versiones posteriores",
          "Laboratorio Nacional de Genómica para la Biodiversidad (LANGEBIO): investigación de frontera en genómica de plantas y biodiversidad",
        ] },
        { tipo: "callout", variante: "importante", contenido: "México invierte alrededor del 0.35% de su PIB en investigación y desarrollo científico (I+D), muy por debajo del promedio de la OCDE (2.7%). La OCDE recomienda invertir al menos el 1% del PIB en ciencia para lograr un desarrollo sustentable. Esta brecha de inversión limita la capacidad de México de generar conocimiento propio y de atraer talento científico." },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Retrato de Mario Molina junto con el diagrama de su descubrimiento sobre la destrucción de la capa de ozono por los CFC, con iconos representando el Premio Nobel", caption: "Mario Molina: el científico mexicano que ayudó a salvar la capa de ozono." },
        { tipo: "parrafo", contenido: "Las vocaciones científicas en México se desarrollan en escuelas como la tuya. Organismos como CONAHCYT (antes CONACYT), la Academia Mexicana de Ciencias, la UNAM, el IPN y el CINVESTAV apoyan la formación de nuevos investigadores. Los Clubes de Ciencia México, la Olimpiada Mexicana de Matemáticas y concursos como ExpoSciences son plataformas para jóvenes con talento científico." },
        { tipo: "callout", variante: "sabias", contenido: "La UNAM es la universidad latinoamericana mejor posicionada en los rankings mundiales y produce más del 50% de la investigación científica publicada en México. Sus investigadores han contribuido a avances en biología molecular, física de partículas, astronomía y ciencias de la tierra. La autonomía universitaria, conquistada en 1929, es la garantía de que la investigación pueda realizarse libre de presiones políticas." },
      ],
    },
  },
];

async function main() {
  console.log(`\n📚 Seed Biblioteca — ${UAC_CODIGO}\n`);

  const { data: uac, error: uacErr } = await supabase
    .from("uac")
    .select("id")
    .eq("codigo", UAC_CODIGO)
    .single();

  if (uacErr || !uac) {
    console.error(`❌ UAC ${UAC_CODIGO} no encontrada. Ejecuta seed-mccems.ts primero.`);
    process.exit(1);
  }

  let ok = 0;
  let fail = 0;

  for (let i = 0; i < FICHAS.length; i++) {
    const f = FICHAS[i];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("fichas_biblioteca").upsert(
      {
        uac_id: uac.id,
        slug: f.slug,
        titulo: f.titulo,
        categoria: f.categoria,
        tiempo_lectura_minutos: f.tiempo_lectura_minutos,
        conceptos_clave: f.conceptos_clave,
        contenido: f.contenido,
        fichas_relacionadas: [],
        orden: i + 1,
        es_placeholder: true,
      },
      { onConflict: "slug" }
    );

    if (error) {
      console.error(`  ✗ ${f.slug}: ${error.message}`);
      fail++;
    } else {
      console.log(`  ✓ ${f.slug}`);
      ok++;
    }
  }

  console.log(`\n✅ ${UAC_CODIGO}: ${ok} fichas insertadas, ${fail} fallidas.\n`);
}

main().catch((err) => {
  console.error("❌ Error fatal:", err.message);
  process.exit(1);
});
