/**
 * Seed de fichas de biblioteca para PM-III (Pensamiento Matemático III).
 * 19 fichas temáticas alineadas al MCCEMS 2025, Semestre 3.
 *
 * Uso: npx tsx scripts/seed-fichas-pmiii.ts
 * Idempotente: upsert por campo "slug".
 */

import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

type SB = ReturnType<typeof createClient<Database>>;

// ---------------------------------------------------------------------------
// FICHAS
// ---------------------------------------------------------------------------

const FICHAS_PMIII = [
  // ── 1 ── Geometría ─────────────────────────────────────────────────────────
  {
    slug: "pm-iii-teorema-pitagoras",
    titulo: "El Teorema de Pitágoras: demostración y aplicaciones",
    categoria: "Geometría",
    conceptos_clave: ["Teorema de Pitágoras", "triángulo rectángulo", "hipotenusa", "catetos", "triples pitagóricos"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El Teorema de Pitágoras es uno de los resultados más famosos y útiles de toda la matemática. En su forma más conocida afirma: en todo triángulo rectángulo, el cuadrado de la hipotenusa es igual a la suma de los cuadrados de los dos catetos. Si llamamos a los catetos a y b, y a la hipotenusa c, el enunciado se escribe a² + b² = c². Esta relación tiene más de cuatro mil años de historia y sigue siendo la herramienta fundamental para calcular distancias, verificar ángulos rectos y resolver cientos de problemas en ciencia e ingeniería.",
        },
        {
          tipo: "subtitulo",
          contenido: "Una demostración visual del teorema",
        },
        {
          tipo: "parrafo",
          contenido:
            "Existen más de trescientas demostraciones conocidas del Teorema de Pitágoras. Una de las más elegantes es la demostración por reordenamiento de áreas: imagina un cuadrado grande de lado (a + b). Dentro de él, coloca cuatro triángulos rectángulos idénticos de catetos a y b. Si organizas los triángulos de una manera, el espacio sobrante forma un único cuadrado de lado c (la hipotenusa). Si los reordenas de otra forma, el espacio sobrante forma dos cuadrados: uno de lado a y otro de lado b. Como el cuadrado grande es el mismo en ambos casos, y los cuatro triángulos son idénticos, el área sobrante debe ser igual. Entonces c² = a² + b². Este argumento no requiere álgebra: es pura intuición geométrica.",
        },
        {
          tipo: "subtitulo",
          contenido: "Triples pitagóricos: números que forman triángulos perfectos",
        },
        {
          tipo: "lista",
          items: [
            "Triple 3-4-5: 3² + 4² = 9 + 16 = 25 = 5². El más conocido y usado en construcción.",
            "Triple 5-12-13: 5² + 12² = 25 + 144 = 169 = 13². Muy usado en trigonometría aplicada.",
            "Triple 8-15-17: 8² + 15² = 64 + 225 = 289 = 17². Aparece en diseño estructural.",
            "Triple 7-24-25: 7² + 24² = 49 + 576 = 625 = 25². Ejemplo de triple con hipotenusa de cuadrado perfecto.",
            "Cualquier múltiplo de un triple es también un triple: 6-8-10, 9-12-15, 15-36-39.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El triple 3-4-5 fue conocido por los constructores egipcios del Imperio Medio (hacia 2000 a.C.) y por los ingenieros mayas. Usando una cuerda de 12 nudos equidistantes, podían formar un triángulo de lados 3, 4 y 5 para verificar ángulos rectos en la construcción de pirámides y templos. El teorema existía en la práctica siglos antes de que Pitágoras lo sistematizara.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama del Teorema de Pitágoras con cuadrados construidos sobre cada lado del triángulo rectángulo, mostrando que el área del cuadrado sobre la hipotenusa iguala la suma de las otras dos",
          caption: "La demostración visual del Teorema de Pitágoras usando áreas es una de las más antiguas e intuitivas.",
        },
        {
          tipo: "cita",
          contenido:
            "La geometría es el conocimiento de lo que siempre existe.",
          fuente: "Platón, filósofo griego, República",
        },
      ],
    },
  },

  // ── 2 ── Geometría ─────────────────────────────────────────────────────────
  {
    slug: "pm-iii-triples-pitagoricos",
    titulo: "Triples pitagóricos: patrones numéricos con historia",
    categoria: "Geometría",
    conceptos_clave: ["triples pitagóricos", "números enteros", "tablilla de Plimpton", "arquitectura prehispánica", "Babilonia"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Un triple pitagórico es un conjunto de tres números enteros positivos (a, b, c) que satisfacen la ecuación a² + b² = c². Estos triples son fascinantes porque muestran que la relación del Teorema de Pitágoras no solo se cumple para lados cualesquiera de un triángulo rectángulo, sino que puede cumplirse exactamente con números enteros, sin decimales ni raíces. Encontrarlos ha sido un pasatiempo matemático desde la antigüedad —y también una herramienta de ingeniería práctica.",
        },
        {
          tipo: "subtitulo",
          contenido: "La tablilla de Plimpton 322: matemáticas babilónicas",
        },
        {
          tipo: "parrafo",
          contenido:
            "En 1945, el matemático Otto Neugebauer descubrió que la tablilla de barro conocida como Plimpton 322, tallada en Babilonia alrededor de 1800 a.C., contenía una lista sistemática de triples pitagóricos escritos en sistema sexagesimal (base 60). Los escribas babilónicos no solo conocían el triple 3-4-5: conocían combinaciones como 65-72-97 y 4601-4800-6649, que son triples exactos. Esto ocurrió más de mil años antes de que Pitágoras naciera. La tablilla es evidencia de que el conocimiento matemático práctico precede enormemente a su formalización teórica.",
        },
        {
          tipo: "subtitulo",
          contenido: "Cómo generar triples pitagóricos",
        },
        {
          tipo: "lista",
          items: [
            "Fórmula de Euclides: para dos enteros m > n > 0, el triple (m² - n², 2mn, m² + n²) es siempre pitagórico.",
            "Con m=2, n=1: (3, 4, 5). Con m=3, n=2: (5, 12, 13). Con m=4, n=1: (15, 8, 17).",
            "Triples primitivos: los que no tienen factor común. El 6-8-10 no es primitivo (es 2 × el 3-4-5).",
            "Multiplicación: si (a, b, c) es un triple, entonces (ka, kb, kc) también lo es para cualquier entero k.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "En Mesoamérica, los constructores mayas y aztecas utilizaban relaciones geométricas basadas en proporciones enteras para diseñar templos y plataformas con esquinas perfectamente cuadradas. El Templo Mayor de Tenochtitlan y la Pirámide del Sol en Teotihuacán muestran proporciones que se corresponden con triples pitagóricos. Las matemáticas no son solo europeas: fueron una creación humana universal.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Reproducción esquemática de la tablilla de Plimpton 322 con algunos de sus triples pitagóricos, junto a un mapa que la ubica en Babilonia",
          caption: "La tablilla Plimpton 322 (1800 a.C.) prueba que los triples pitagóricos eran conocidos en Babilonia mil años antes de Pitágoras.",
        },
      ],
    },
  },

  // ── 3 ── Geometría ─────────────────────────────────────────────────────────
  {
    slug: "pm-iii-areas-perimetros-poligonos",
    titulo: "Áreas y perímetros de polígonos regulares",
    categoria: "Geometría",
    conceptos_clave: ["polígono regular", "apotema", "perímetro", "área", "hexágono", "triángulo equilátero"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Un polígono regular es aquel cuyos lados tienen todos la misma longitud y cuyos ángulos interiores son todos iguales. Los polígonos regulares más comunes son el triángulo equilátero (3 lados), el cuadrado (4 lados), el pentágono regular (5 lados) y el hexágono regular (6 lados). Calcular sus áreas y perímetros es fundamental en arquitectura, diseño, carpintería, pavimentación y cualquier actividad que involucre superficies planas.",
        },
        {
          tipo: "subtitulo",
          contenido: "Fórmulas para los polígonos más comunes",
        },
        {
          tipo: "lista",
          items: [
            "Triángulo equilátero (lado l): Perímetro = 3l; Área = (√3 / 4) × l²",
            "Cuadrado (lado l): Perímetro = 4l; Área = l²",
            "Rectángulo (lados a y b): Perímetro = 2(a + b); Área = a × b",
            "Hexágono regular (lado l): Perímetro = 6l; Área = (3√3 / 2) × l²",
            "Fórmula general (n lados, lado l, apotema a): Área = (n × l × a) / 2",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "La apotema: la clave de la fórmula general",
        },
        {
          tipo: "parrafo",
          contenido:
            "La apotema de un polígono regular es el segmento que va desde el centro hasta el punto medio de cualquiera de sus lados, perpendicular a ese lado. Es la altura de los triángulos isósceles en que se puede descomponer el polígono. La fórmula general Área = (Perímetro × apotema) / 2 funciona para cualquier polígono regular, sin importar cuántos lados tenga. Para calcular la apotema a partir del lado l y el número de lados n, se usa: a = l / (2 × tan(π/n)). Por ejemplo, para un hexágono de lado 5 cm: a = 5 / (2 × tan(30°)) = 5 / (2 × 0.577) ≈ 4.33 cm, y Área = (6 × 5 × 4.33) / 2 ≈ 64.95 cm².",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El hexágono regular tiene una propiedad extraordinaria: se puede dividir en exactamente 6 triángulos equiláteros iguales, donde la apotema es la altura de cada triángulo y el lado del hexágono es igual al radio del círculo circunscrito. Esta propiedad es la razón por la que las abejas construyen panales hexagonales: el hexágono es la figura que cubre el plano de manera perfecta usando el mínimo material para el máximo espacio.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Colección de polígonos regulares desde el triángulo hasta el octágono, con sus fórmulas de área y perímetro marcadas, y la apotema señalada en el hexágono",
          caption: "La apotema conecta la fórmula de cualquier polígono regular con la fórmula del área del triángulo.",
        },
      ],
    },
  },

  // ── 4 ── Geometría ─────────────────────────────────────────────────────────
  {
    slug: "pm-iii-el-circulo-y-pi",
    titulo: "El círculo y el número π: perímetro y área",
    categoria: "Geometría",
    conceptos_clave: ["círculo", "número pi", "circunferencia", "área del círculo", "radio", "diámetro"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El círculo es la figura geométrica definida por todos los puntos que se encuentran a la misma distancia (el radio, r) de un punto central. La longitud del borde del círculo se llama circunferencia, y su fórmula es C = 2πr (o equivalentemente C = πd, donde d = 2r es el diámetro). El área encerrada por el círculo es A = πr². En el centro de ambas fórmulas está π (pi), el número más famoso de las matemáticas: una constante irracional y trascendente cuyo valor aproximado es 3.14159265...",
        },
        {
          tipo: "subtitulo",
          contenido: "La historia de π: de Arquímedes a las computadoras",
        },
        {
          tipo: "parrafo",
          contenido:
            "La búsqueda de π es una de las grandes aventuras intelectuales de la humanidad. Arquímedes de Siracusa (siglo III a.C.) encontró que π está entre 223/71 y 22/7, usando polígonos de 96 lados inscritos y circunscritos al círculo. Los matemáticos chinos Liu Hui y Zu Chongzhi obtuvieron aproximaciones de 5 y 7 decimales, respectivamente, en el siglo V d.C. El matemático indio Madhava calculó π con 11 decimales en el siglo XIV usando series infinitas. Hoy, las computadoras han calculado billones de decimales de π sin encontrar un patrón repetitivo, lo cual confirma que es irracional.",
        },
        {
          tipo: "subtitulo",
          contenido: "Aplicaciones del círculo y π",
        },
        {
          tipo: "lista",
          items: [
            "Ruedas y engranajes: el cálculo de distancias recorridas usa C = 2πr.",
            "Diseño de pistas: una pista circular de atletismo de radio r tiene longitud 2πr.",
            "Área de terrenos: parcelas circulares, depósitos, piscinas usan A = πr².",
            "Física y ondas: π aparece en fórmulas de oscilación, electromagnetismo y mecánica cuántica.",
            "Sector circular: un 'pedazo de pastel' de ángulo θ (en radianes) tiene área A = (1/2)r²θ.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Los mayas calcularon con precisión el período de Venus (583.92 días) y el año solar (365.242 días) usando aritmética entera sin conocer π de forma explícita. Sin embargo, las estructuras circulares del observatorio de Chichén Itzá (El Caracol) demuestran un dominio práctico de la geometría del círculo para fines astronómicos. La matemática maya era tan sofisticada como la de cualquier civilización contemporánea.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Círculo con radio, diámetro y circunferencia marcados, junto a los primeros 20 decimales de π y una línea de tiempo histórica de su cálculo",
          caption: "π es la constante que relaciona la circunferencia de cualquier círculo con su diámetro, sin importar el tamaño.",
        },
      ],
    },
  },

  // ── 5 ── Geometría ─────────────────────────────────────────────────────────
  {
    slug: "pm-iii-geometria-solida-prismas",
    titulo: "Geometría sólida: prismas y cilindros",
    categoria: "Geometría",
    conceptos_clave: ["prisma", "cilindro", "volumen", "área lateral", "área total", "geometría sólida"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La geometría sólida estudia las figuras tridimensionales: aquellas que tienen largo, ancho y alto. A diferencia de las figuras planas, los sólidos tienen dos medidas importantes que calcular: el volumen (la cantidad de espacio que ocupan en su interior) y el área de superficie (la cantidad de material que se necesitaría para cubrir su exterior). Los prismas y los cilindros son los sólidos más comunes en la vida cotidiana: latas, cajas, columnas, tuberías.",
        },
        {
          tipo: "subtitulo",
          contenido: "El prisma: fórmulas fundamentales",
        },
        {
          tipo: "parrafo",
          contenido:
            "Un prisma es un sólido con dos bases paralelas e iguales (que pueden ser cualquier polígono) unidas por caras rectangulares laterales. Si la base tiene área Ab y el prisma tiene altura h, entonces: Volumen = Ab × h. El área lateral (solo las caras del costado) es igual al perímetro de la base multiplicado por la altura: Al = P × h. El área total es la suma del área lateral más las dos bases: At = Al + 2Ab. Por ejemplo, una caja de cereal rectangular de base 20 cm × 8 cm y altura 30 cm tiene volumen V = 20 × 8 × 30 = 4800 cm³ y área total At = 2(20×8) + 2(20×30) + 2(8×30) = 320 + 1200 + 480 = 2000 cm².",
        },
        {
          tipo: "subtitulo",
          contenido: "El cilindro: el prisma circular",
        },
        {
          tipo: "lista",
          items: [
            "Volumen del cilindro: V = πr²h (área de la base circular × altura).",
            "Área lateral: Al = 2πrh (es como 'desenrollar' el cilindro en un rectángulo).",
            "Área total: At = 2πrh + 2πr² = 2πr(h + r).",
            "Ejemplo: una lata de refresco de radio 3.3 cm y altura 12 cm tiene V = π × (3.3)² × 12 ≈ 410 ml.",
            "Las tuberías son cilindros huecos: su volumen de material es V_externo − V_interno.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El cilindro y el prisma tienen exactamente la misma lógica de cálculo: Volumen = Área de base × altura. La diferencia está solo en la forma de la base. Si dominas esta idea, puedes calcular el volumen de cualquier sólido con bases paralelas: prisma triangular, prisma hexagonal, cilindro. La geometría sólida es más simple de lo que parece una vez que identificas el patrón.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Comparación lado a lado de un prisma rectangular y un cilindro, con sus dimensiones y fórmulas de volumen y área total marcadas",
          caption: "Prismas y cilindros siguen el mismo principio: Volumen = Área de base × altura.",
        },
      ],
    },
  },

  // ── 6 ── Geometría ─────────────────────────────────────────────────────────
  {
    slug: "pm-iii-piramides-conos-esferas",
    titulo: "Pirámides, conos y esferas: volúmenes y áreas",
    categoria: "Geometría",
    conceptos_clave: ["pirámide", "cono", "esfera", "volumen", "área de superficie", "Teotihuacán"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Las pirámides, los conos y las esferas son sólidos de enorme presencia en la naturaleza, el arte y la ingeniería. Una pirámide termina en un vértice; un cono es su versión circular; una esfera es la figura tridimensional que maximiza el volumen con el mínimo de superficie. Sus fórmulas de volumen tienen una elegancia matemática notable: el volumen de una pirámide o cono es exactamente un tercio del volumen del prisma o cilindro con la misma base y altura.",
        },
        {
          tipo: "subtitulo",
          contenido: "Fórmulas de volumen y área",
        },
        {
          tipo: "lista",
          items: [
            "Pirámide: V = (1/3) × Ab × h, donde Ab es el área de la base y h la altura.",
            "Pirámide cuadrada (lado l, altura h): V = (1/3) × l² × h.",
            "Cono (radio r, altura h): V = (1/3) × πr² × h; Área lateral = πrl, donde l = √(r² + h²) es la generatriz.",
            "Esfera (radio r): V = (4/3)πr³; Área de superficie = 4πr².",
            "Semiesfera: V = (2/3)πr³; Área total = 3πr² (área de superficie + base circular).",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Las pirámides de Teotihuacán como ejercicio de geometría",
        },
        {
          tipo: "parrafo",
          contenido:
            "La Pirámide del Sol en Teotihuacán, construida alrededor del año 100 d.C., tiene una base cuadrada de aproximadamente 225 metros por lado y una altura de 65 metros. Usando la fórmula de la pirámide: V = (1/3) × 225² × 65 = (1/3) × 50 625 × 65 ≈ 1 097 000 m³. Esto equivale a más de un millón de metros cúbicos de material. Para el área de la base: 225² = 50 625 m². Los constructores teotihuacanos lograron esta monumentalidad con herramientas de piedra y madera, sin rueda ni metal, lo que hace aún más impresionante su dominio de la geometría aplicada.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "La esfera es la figura que encierra el mayor volumen con la menor superficie posible. Esta propiedad, demostrada por Arquímedes, explica por qué las pompas de jabón son esféricas (minimizan tensión superficial), por qué los planetas son aproximadamente esféricos (la gravedad es isótropa), y por qué los tanques de gas de alta presión son esféricos (distribuyen la presión uniformemente).",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Pirámide del Sol de Teotihuacán con sus dimensiones marcadas, junto a los esquemas de cono y esfera con sus fórmulas de volumen",
          caption: "Las pirámides prehispánicas son ejemplos monumentales de geometría sólida aplicada.",
        },
      ],
    },
  },

  // ── 7 ── Geometría ─────────────────────────────────────────────────────────
  {
    slug: "pm-iii-semejanza-congruencia",
    titulo: "Semejanza y congruencia de triángulos",
    categoria: "Geometría",
    conceptos_clave: ["semejanza", "congruencia", "criterios LLL LAL ALA", "razón de semejanza", "triángulos"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Dos triángulos son congruentes cuando tienen exactamente la misma forma y el mismo tamaño: todos sus lados y ángulos correspondientes son iguales. Son semejantes cuando tienen la misma forma pero pueden diferir en tamaño: sus ángulos correspondientes son iguales y sus lados correspondientes son proporcionales. La semejanza y la congruencia son herramientas fundamentales en geometría porque permiten probar igualdades y proporciones sin medir directamente todos los elementos.",
        },
        {
          tipo: "subtitulo",
          contenido: "Criterios de congruencia (misma forma y tamaño)",
        },
        {
          tipo: "lista",
          items: [
            "LLL (Lado-Lado-Lado): si los tres lados de un triángulo son iguales a los tres lados de otro, son congruentes.",
            "LAL (Lado-Ángulo-Lado): si dos lados y el ángulo comprendido entre ellos son iguales en ambos triángulos, son congruentes.",
            "ALA (Ángulo-Lado-Ángulo): si dos ángulos y el lado entre ellos son iguales, son congruentes.",
            "AAL (Ángulo-Ángulo-Lado): si dos ángulos y un lado no comprendido son iguales, son congruentes.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Criterios de semejanza (misma forma, distinto tamaño)",
        },
        {
          tipo: "parrafo",
          contenido:
            "Para semejanza basta con menos información. El criterio AA (Ángulo-Ángulo) establece que si dos ángulos de un triángulo son iguales a dos ángulos de otro, los triángulos son semejantes (el tercer ángulo se determina automáticamente, ya que los tres suman 180°). También funciona el criterio LLL de semejanza: si los tres pares de lados son proporcionales (con la misma razón de semejanza k), los triángulos son semejantes. Si la razón de semejanza es k, los lados del triángulo mayor son k veces los del menor, y las áreas se relacionan como k². La semejanza de triángulos es la base de la trigonometría y de la medición indirecta de distancias.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Aplicación clásica: Tales de Mileto calculó la altura de la Gran Pirámide de Giza midiendo la longitud de su propia sombra y la de la pirámide al mismo tiempo. Cuando su sombra era igual a su estatura, la sombra de la pirámide era igual a su altura. Este es el criterio AA de semejanza en acción: el sol forma el mismo ángulo con ambas sombras, por lo que los triángulos formados son semejantes.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Dos triángulos semejantes con sus lados proporcionales marcados y la razón de semejanza k indicada, junto a un diagrama del método de Tales",
          caption: "Los criterios de semejanza permiten deducir medidas desconocidas a partir de proporciones.",
        },
      ],
    },
  },

  // ── 8 ── Ecuaciones cuadráticas ────────────────────────────────────────────
  {
    slug: "pm-iii-ecuaciones-cuadraticas-intro",
    titulo: "Ecuaciones cuadráticas: introducción y formas",
    categoria: "Ecuaciones cuadráticas",
    conceptos_clave: ["ecuación cuadrática", "forma estándar", "forma factorizada", "raíces", "coeficientes"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Una ecuación cuadrática (o de segundo grado) es una ecuación polinomial en la que la variable aparece elevada al cuadrado, y ese es su mayor exponente. Su forma estándar es ax² + bx + c = 0, donde a, b y c son números reales y a ≠ 0. Si a fuera cero, la ecuación dejaría de ser cuadrática y se convertiría en lineal. Las ecuaciones cuadráticas aparecen en casi todas las ramas de la ciencia y la tecnología: describen trayectorias de proyectiles, diseño de puentes, áreas de terrenos, circuitos eléctricos y crecimiento de poblaciones.",
        },
        {
          tipo: "subtitulo",
          contenido: "Formas de una ecuación cuadrática",
        },
        {
          tipo: "lista",
          items: [
            "Forma estándar: ax² + bx + c = 0. Ejemplo: 2x² − 5x + 3 = 0 (a=2, b=−5, c=3).",
            "Forma factorizada: a(x − r₁)(x − r₂) = 0, donde r₁ y r₂ son las raíces (soluciones).",
            "Forma vértice: a(x − h)² + k = 0, donde (h, k) es el vértice de la parábola correspondiente.",
            "Una ecuación cuadrática puede tener 2, 1 o 0 soluciones reales, según el discriminante.",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "Las soluciones de una ecuación cuadrática se llaman raíces o ceros de la ecuación. Geométricamente, son los valores de x donde la parábola y = ax² + bx + c cruza el eje horizontal (y = 0). Por eso resolver una ecuación cuadrática equivale a encontrar dónde la parábola toca el suelo. Hay tres métodos principales para resolver ecuaciones cuadráticas: factorización, completar el cuadrado y la fórmula general. Cada método tiene sus ventajas según la forma que tenga la ecuación.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "El matemático árabe Muhammad ibn Musa al-Juarismi (de cuyo nombre latinizado 'algoritmo' deriva la palabra) desarrolló en el siglo IX métodos sistemáticos para resolver ecuaciones cuadráticas en su obra Al-kitab al-mukhtasar fi hisab al-jabr wal-muqabala, de cuyo título viene la palabra 'álgebra'. Al-Juarismi usaba métodos geométricos, sin notación algebraica moderna, para completar cuadrados y resolver ecuaciones que hoy escribimos como ax² + bx + c = 0.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Tres parábolas mostrando los tres casos: dos raíces reales (corta el eje dos veces), una raíz (toca el eje) y ninguna raíz real (no toca el eje)",
          caption: "Las raíces de una ecuación cuadrática son los puntos donde la parábola cruza el eje x.",
        },
      ],
    },
  },

  // ── 9 ── Ecuaciones cuadráticas ────────────────────────────────────────────
  {
    slug: "pm-iii-factorizacion-cuadratica",
    titulo: "Resolver por factorización: cuadrado perfecto y diferencia",
    categoria: "Ecuaciones cuadráticas",
    conceptos_clave: ["factorización", "trinomio cuadrado perfecto", "diferencia de cuadrados", "factor común", "raíces"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Factorizar una ecuación cuadrática significa reescribirla como un producto de factores más simples. Si podemos escribir ax² + bx + c como a(x − r₁)(x − r₂), entonces las raíces son inmediatamente r₁ y r₂, porque si el producto de dos factores es cero, al menos uno de ellos debe ser cero. La factorización es el método más rápido cuando funciona, y hay patrones especiales que hacen el proceso muy directo.",
        },
        {
          tipo: "subtitulo",
          contenido: "Patrones de factorización especiales",
        },
        {
          tipo: "lista",
          items: [
            "Trinomio cuadrado perfecto: x² + 2ax + a² = (x + a)². Ejemplo: x² + 6x + 9 = (x + 3)². Raíz: x = −3 (doble).",
            "Trinomio cuadrado perfecto (resta): x² − 2ax + a² = (x − a)². Ejemplo: x² − 10x + 25 = (x − 5)². Raíz: x = 5 (doble).",
            "Diferencia de cuadrados: x² − a² = (x + a)(x − a). Ejemplo: x² − 16 = (x + 4)(x − 4). Raíces: x = 4 y x = −4.",
            "Factor común: 3x² − 6x = 3x(x − 2). Raíces: x = 0 y x = 2.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Factorización por método de tanteo (trinomio general)",
        },
        {
          tipo: "parrafo",
          contenido:
            "Para factorizar x² + bx + c, se buscan dos números r₁ y r₂ tales que r₁ + r₂ = b y r₁ × r₂ = c. Entonces x² + bx + c = (x + r₁)(x + r₂). Ejemplo: x² + 7x + 12. Necesito dos números que sumen 7 y multipliquen 12. La respuesta es 3 y 4: 3 + 4 = 7 y 3 × 4 = 12. Entonces x² + 7x + 12 = (x + 3)(x + 4). Las raíces son x = −3 y x = −4. Para ecuaciones de la forma ax² + bx + c con a ≠ 1, se usa el método de la 'ac': se multiplica a × c, se buscan factores de ese producto que sumen b, y se procede por agrupación.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La factorización no siempre funciona con números enteros. Si los coeficientes de la ecuación son 'difíciles', es mejor pasar directamente a la fórmula general. La factorización es eficiente cuando los coeficientes son enteros pequeños y la ecuación tiene raíces racionales. Reconocer cuándo factorizar y cuándo usar la fórmula general es parte de la habilidad algebraica.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama que muestra las tres formas de factorización especial: cuadrado perfecto, diferencia de cuadrados y factor común, con un ejemplo numérico de cada una",
          caption: "Los patrones de factorización especial permiten resolver muchas ecuaciones cuadráticas de manera inmediata.",
        },
      ],
    },
  },

  // ── 10 ── Ecuaciones cuadráticas ───────────────────────────────────────────
  {
    slug: "pm-iii-formula-general",
    titulo: "La fórmula general: resolución de cualquier ecuación cuadrática",
    categoria: "Ecuaciones cuadráticas",
    conceptos_clave: ["fórmula general", "completar el cuadrado", "discriminante", "raíces", "solución cuadrática"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La fórmula general para resolver ecuaciones cuadráticas es una de las fórmulas más poderosas del álgebra elemental. Para cualquier ecuación de la forma ax² + bx + c = 0 (con a ≠ 0), las soluciones son siempre: x = (-b ± √(b²-4ac)) / 2a. Esta fórmula funciona siempre, sin importar qué valores tengan a, b y c. No requiere que la ecuación sea factorizable con enteros. Es el método universal.",
        },
        {
          tipo: "subtitulo",
          contenido: "Derivación de la fórmula: completar el cuadrado",
        },
        {
          tipo: "parrafo",
          contenido:
            "La fórmula general no es mágica: se obtiene completando el cuadrado en la forma general. Partiendo de ax² + bx + c = 0, se divide todo entre a para obtener x² + (b/a)x + (c/a) = 0. Se pasa (c/a) al lado derecho: x² + (b/a)x = −(c/a). Se suma (b/2a)² a ambos lados para completar el cuadrado del lado izquierdo: x² + (b/a)x + (b/2a)² = (b/2a)² − (c/a). El lado izquierdo es ahora (x + b/2a)². El lado derecho simplifica a (b² − 4ac) / (4a²). Tomando raíz cuadrada de ambos lados y despejando x, se obtiene exactamente x = (−b ± √(b² − 4ac)) / 2a.",
        },
        {
          tipo: "subtitulo",
          contenido: "Ejemplos de aplicación",
        },
        {
          tipo: "lista",
          items: [
            "Ejemplo 1: 2x² − 4x − 6 = 0. a=2, b=−4, c=−6. Discriminante: (−4)² − 4(2)(−6) = 16 + 48 = 64. x = (4 ± 8) / 4. Raíces: x = 3 y x = −1.",
            "Ejemplo 2: x² + 4x + 4 = 0. a=1, b=4, c=4. Discriminante: 16 − 16 = 0. x = −4/2 = −2. Una raíz doble.",
            "Ejemplo 3: x² + x + 1 = 0. Discriminante: 1 − 4 = −3 < 0. No hay raíces reales.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Al aplicar la fórmula general, presta especial atención al signo de b: si b es negativo, −b será positivo. La fórmula tiene ± (más-menos), lo que da dos soluciones: una con el signo más (raíz mayor) y otra con el signo menos (raíz menor). Si el discriminante es negativo, la raíz cuadrada no existe en los reales y la ecuación no tiene soluciones reales.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "La fórmula general escrita en grande, con cada componente (a, b, c, discriminante) marcado con colores distintos y un ejemplo resuelto paso a paso",
          caption: "La fórmula general x = (-b ± √(b²-4ac)) / 2a resuelve cualquier ecuación cuadrática.",
        },
      ],
    },
  },

  // ── 11 ── Ecuaciones cuadráticas ───────────────────────────────────────────
  {
    slug: "pm-iii-discriminante",
    titulo: "El discriminante: qué nos dicen las raíces",
    categoria: "Ecuaciones cuadráticas",
    conceptos_clave: ["discriminante", "raíces reales", "raíz doble", "raíces complejas", "parábola"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El discriminante de una ecuación cuadrática ax² + bx + c = 0 es la expresión Δ = b² − 4ac. Su valor determina completamente la naturaleza de las soluciones, antes de calcularse. El discriminante actúa como un 'clasificador': con solo evaluar b² − 4ac podemos saber si la ecuación tiene dos raíces reales distintas, una raíz doble, o ninguna raíz real, sin necesidad de completar toda la fórmula general.",
        },
        {
          tipo: "subtitulo",
          contenido: "Los tres casos del discriminante",
        },
        {
          tipo: "lista",
          items: [
            "Δ > 0 (discriminante positivo): la ecuación tiene dos raíces reales y distintas. La parábola cruza el eje x en dos puntos.",
            "Δ = 0 (discriminante cero): la ecuación tiene una raíz real doble: x = −b / 2a. La parábola toca el eje x en exactamente un punto (el vértice está sobre el eje).",
            "Δ < 0 (discriminante negativo): la ecuación no tiene raíces reales. La parábola no toca el eje x (está completamente por encima o por debajo).",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Interpretación geométrica",
        },
        {
          tipo: "parrafo",
          contenido:
            "La interpretación geométrica del discriminante es inmediata cuando piensas en la parábola y = ax² + bx + c. Si a > 0, la parábola abre hacia arriba; si a < 0, abre hacia abajo. Las raíces son los puntos donde la parábola intersecta el eje x. Cuando Δ > 0, hay dos intersecciones. Cuando Δ = 0, la parábola es tangente al eje x en su vértice. Cuando Δ < 0, la parábola está completamente por encima del eje (si a > 0) o completamente por debajo (si a < 0). Esta conexión entre el álgebra y la geometría es uno de los puentes más bellos de la matemática de bachillerato.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Antes de resolver cualquier ecuación cuadrática, calcula el discriminante. Esto te ahorra trabajo: si Δ < 0, sabes inmediatamente que no hay solución real y no necesitas continuar. Si Δ = 0, la solución es simplemente x = −b / 2a, sin necesidad de la raíz cuadrada. Si Δ > 0 y además es un cuadrado perfecto (1, 4, 9, 16, 25...), las raíces serán racionales y quizás sea más fácil factorizar.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Tres parábolas en un sistema de coordenadas, etiquetadas con Δ > 0, Δ = 0 y Δ < 0, mostrando sus distintas relaciones con el eje x",
          caption: "El signo del discriminante determina cuántas veces la parábola cruza el eje x.",
        },
      ],
    },
  },

  // ── 12 ── Ecuaciones cuadráticas ───────────────────────────────────────────
  {
    slug: "pm-iii-parabola-grafica",
    titulo: "La parábola: cómo graficar una ecuación cuadrática",
    categoria: "Ecuaciones cuadráticas",
    conceptos_clave: ["parábola", "vértice", "eje de simetría", "dirección de apertura", "zeros", "graficación"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La gráfica de cualquier función cuadrática y = ax² + bx + c es una parábola. La parábola tiene una serie de elementos clave que determinan su forma y posición: el vértice (el punto más alto o más bajo), el eje de simetría (la línea vertical que la divide en dos mitades especulares), la dirección de apertura (hacia arriba o hacia abajo), y los zeros o raíces (los puntos donde cruza el eje x). Conocer estos elementos permite graficar cualquier parábola de manera sistemática.",
        },
        {
          tipo: "subtitulo",
          contenido: "Los elementos clave de la parábola",
        },
        {
          tipo: "lista",
          items: [
            "Dirección de apertura: si a > 0, la parábola abre hacia arriba (tiene mínimo); si a < 0, abre hacia abajo (tiene máximo).",
            "Vértice: el punto (h, k) donde h = −b / 2a y k = c − b² / 4a (o bien k = f(h)). Es el punto más alto o más bajo.",
            "Eje de simetría: la línea vertical x = h = −b / 2a. La parábola es perfectamente simétrica respecto a esta línea.",
            "Intersección con el eje y (ordenada al origen): el punto (0, c). Se obtiene evaluando x = 0.",
            "Zeros o raíces: los puntos donde y = 0. Se obtienen resolviendo la ecuación cuadrática.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Pasos para graficar una parábola",
        },
        {
          tipo: "parrafo",
          contenido:
            "Para graficar y = 2x² − 8x + 6: 1) Identifica a = 2 > 0, la parábola abre hacia arriba. 2) Calcula el vértice: h = −(−8) / (2×2) = 8/4 = 2; k = 2(2)² − 8(2) + 6 = 8 − 16 + 6 = −2. Vértice: (2, −2). 3) Eje de simetría: x = 2. 4) Intersección con y: (0, 6). 5) Raíces: 2x² − 8x + 6 = 0 → x² − 4x + 3 = 0 → (x−1)(x−3) = 0 → x = 1 y x = 3. 6) Grafica el vértice (2, −2), las raíces (1, 0) y (3, 0), la ordenada al origen (0, 6) y su simétrica (4, 6), luego une los puntos con una curva suave.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El vértice es el punto más informativo de la parábola. Si la parábola modela la trayectoria de un proyectil, el vértice indica la altura máxima y el instante en que se alcanza. Si modela la ganancia de un negocio, el vértice indica el precio óptimo o la cantidad óptima de producción. Identificar e interpretar el vértice es la habilidad central en el análisis de funciones cuadráticas.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Parábola graficada con todos sus elementos etiquetados: vértice, eje de simetría, zeros, ordenada al origen y dirección de apertura",
          caption: "El vértice, el eje de simetría y los zeros son los elementos que definen completamente la parábola.",
        },
      ],
    },
  },

  // ── 13 ── Historia matemática ──────────────────────────────────────────────
  {
    slug: "pm-iii-pitagoras-historia",
    titulo: "Pitágoras y la escuela pitagórica: matemáticas como filosofía",
    categoria: "Historia matemática",
    conceptos_clave: ["Pitágoras", "escuela pitagórica", "números como realidad", "armonía", "matemáticas y filosofía"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Pitágoras de Samos (c. 570-495 a.C.) fue mucho más que el matemático del teorema que lleva su nombre. Fue el fundador de una escuela filosófica que revolucionó la manera en que los griegos concebían el mundo: para los pitagóricos, los números no eran simples herramientas de cálculo, sino la esencia de toda realidad. 'Todo es número' era el principio fundamental de su pensamiento. Esta idea —que la realidad tiene estructura matemática— es el antecedente más antiguo de la física matemática moderna.",
        },
        {
          tipo: "subtitulo",
          contenido: "La hermandad pitagórica: una comunidad matemática",
        },
        {
          tipo: "parrafo",
          contenido:
            "La escuela de Pitágoras en Crotona (sur de Italia) era más que una academia: era una hermandad con rituales, secretos y reglas de vida. Los miembros se dividían en akousmatikoi (los que escuchaban las doctrinas sin cuestionar) y mathematikoi (los que estudiaban y demostraban). El conocimiento matemático era sagrado y su divulgación podía ser castigada. Cuenta la leyenda que Hipaso de Metaponto fue expulsado —o ahogado— por revelar la existencia de los números irracionales, que contradecían la creencia pitagórica de que todo podía expresarse como razón de enteros.",
        },
        {
          tipo: "subtitulo",
          contenido: "El conocimiento pre-pitagórico: Babilonia y Egipto",
        },
        {
          tipo: "lista",
          items: [
            "Los babilonios conocían la relación a² + b² = c² al menos 1200 años antes de Pitágoras.",
            "Los egipcios usaban el triple 3-4-5 para construir ángulos rectos en la edificación de pirámides.",
            "Los chinos documentaron el teorema en el libro Zhoubi Suanjing (siglo I a.C. o anterior).",
            "El nombre 'Teorema de Pitágoras' refleja la tradición griega de sistematizar y demostrar, no de descubrir.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Los pitagóricos descubrieron que la armonía musical tiene bases matemáticas: una cuerda que vibra el doble de rápido produce una nota una octava más alta. La proporción 2:1 corresponde a la octava, 3:2 a la quinta y 4:3 a la cuarta. Esta correspondencia entre números y belleza sonora convenció a los pitagóricos de que los números gobiernan el universo. Dos mil años después, Johannes Kepler buscó 'la música de las esferas' en las órbitas planetarias.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Retrato idealizado de Pitágoras con una lira, rodeado de figuras geométricas y números, simbolizando la unión de matemáticas y filosofía",
          caption: "Para los pitagóricos, los números eran la clave de comprensión del cosmos.",
        },
      ],
    },
  },

  // ── 14 ── Historia matemática ──────────────────────────────────────────────
  {
    slug: "pm-iii-euclides-geometria",
    titulo: "Euclides y los Elementos: el nacimiento de la geometría formal",
    categoria: "Historia matemática",
    conceptos_clave: ["Euclides", "Los Elementos", "método axiomático", "postulados", "geometría euclidiana"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Alrededor del año 300 a.C., el matemático griego Euclides de Alejandría compiló y sistematizó en trece libros el conocimiento geométrico de su época. La obra resultante, Los Elementos, es el texto matemático más influyente de la historia: durante más de dos mil años fue el libro de texto de geometría en todo Occidente. Pero más que su contenido, lo revolucionario de Los Elementos fue su método: Euclides demostró que toda la geometría podía construirse lógicamente a partir de un puñado de definiciones y postulados básicos.",
        },
        {
          tipo: "subtitulo",
          contenido: "Los cinco postulados de Euclides",
        },
        {
          tipo: "lista",
          items: [
            "Postulado 1: Por dos puntos distintos pasa exactamente una línea recta.",
            "Postulado 2: Una línea recta puede prolongarse indefinidamente.",
            "Postulado 3: Con cualquier centro y radio se puede trazar un círculo.",
            "Postulado 4: Todos los ángulos rectos son iguales entre sí.",
            "Postulado 5 (el famoso): Por un punto exterior a una recta pasa exactamente una paralela a esa recta (formulación de Playfair).",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "La geometría no-euclidiana: cuando se niega el quinto postulado",
        },
        {
          tipo: "parrafo",
          contenido:
            "Durante siglos, los matemáticos intentaron demostrar el quinto postulado a partir de los otros cuatro, sospechando que era redundante. En el siglo XIX, Nikolái Lobachevski y János Bolyai descubrieron algo asombroso: si se niega el quinto postulado, se obtiene una geometría igualmente consistente, simplemente diferente. En la geometría hiperbólica (Lobachevski), por un punto exterior pasan infinitas paralelas a una recta. En la geometría esférica (Riemann), no existen paralelas. Einstein usó la geometría riemanniana para describir la curvatura del espacio-tiempo en la Relatividad General.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El método axiomático de Euclides — partir de verdades básicas y derivar todo lo demás mediante lógica — se convirtió en el modelo de rigor para toda la matemática y la ciencia. Spinoza escribió su Ética more geometrico (a la manera de la geometría), presentando su filosofía como teoremas derivados de axiomas. El método euclidiano enseña que el conocimiento puede organizarse con claridad, precisión y coherencia total.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Página de una traducción medieval de Los Elementos de Euclides con diagramas geométricos, junto a un esquema que muestra la jerarquía axiomas → proposiciones → teoremas",
          caption: "Los Elementos de Euclides establecieron el método axiomático como base del razonamiento matemático.",
        },
        {
          tipo: "cita",
          contenido:
            "No hay camino real hacia la geometría.",
          fuente: "Euclides, respondiendo al rey Ptolomeo I que quería aprender geometría sin estudiarla",
        },
      ],
    },
  },

  // ── 15 ── Historia matemática ──────────────────────────────────────────────
  {
    slug: "pm-iii-matematicas-mexico-prehispanico",
    titulo: "Matemáticas en México prehispánico: maya, azteca y zapoteca",
    categoria: "Historia matemática",
    conceptos_clave: ["sistema vigesimal", "cero maya", "matemáticas aztecas", "astronomía zapoteca", "calendarios mesoamericanos"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Las civilizaciones de Mesoamérica desarrollaron sistemas matemáticos sofisticados siglos antes de la llegada de los europeos. Los mayas inventaron de forma independiente el concepto de cero, los aztecas desarrollaron sistemas de medición y contabilidad para administrar un imperio complejo, y los zapotecas construyeron observatorios astronómicos que requerían cálculos de notable precisión. El conocimiento matemático de estos pueblos no era inferior al europeo de su tiempo: era simplemente diferente, adaptado a sus propias necesidades y cosmologías.",
        },
        {
          tipo: "subtitulo",
          contenido: "El sistema vigesimal maya y la invención del cero",
        },
        {
          tipo: "parrafo",
          contenido:
            "El sistema de numeración maya era vigesimal (base 20, en lugar de la base 10 que usamos hoy), lo que probablemente refleja el conteo con los dedos de manos y pies. Usaba tres símbolos: un punto para la unidad (1), una barra para el cinco (5) y una concha para el cero (0). El cero maya —símbolo de la posición vacía— fue desarrollado alrededor del siglo IV d.C., aproximadamente al mismo tiempo que en la India, y varios siglos antes de que llegara a Europa. Con este sistema, los mayas calcularon con precisión el año solar (365.2422 días, casi exacto al valor moderno) y los ciclos de Venus.",
        },
        {
          tipo: "subtitulo",
          contenido: "Matemáticas aztecas y zapotecas",
        },
        {
          tipo: "lista",
          items: [
            "Los aztecas usaban un sistema de contabilidad con glifos numéricos para registrar tributos, áreas de terreno y transacciones comerciales.",
            "El sistema de medición azteca incluía la vara, el quahuitl y el tlalquahuitl, unidades estandarizadas para medir tierras.",
            "El Tonalpohualli (calendario ritual de 260 días) y el Xiuhpohualli (año solar de 365 días) requerían cálculos de mínimo común múltiplo.",
            "El observatorio de Monte Albán (zapoteca, siglo V a.C.) está orientado astronómicamente para observar el solsticio y el cénit del Sol.",
            "Las pirámides de Teotihuacán incorporan proporciones matemáticas que reflejan conocimiento geométrico avanzado.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "El Calendario de Venus maya es uno de los logros astronómicos más precisos de la antigüedad. Los mayas calcularon que 5 ciclos de Venus (5 × 583.92 días = 2919.6 días) equivalen casi exactamente a 8 años solares (8 × 365.25 = 2922 días). Este conocimiento requería observación sistemática durante décadas y un sistema numérico capaz de manejar números grandes, que los mayas tenían gracias a su sistema posicional y al cero.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Tabla comparativa del sistema numérico maya (con puntos, barras y concha) junto a los números arábigos equivalentes del 0 al 19, con el Calendario de Venus en el fondo",
          caption: "El sistema vigesimal maya con su cero es uno de los desarrollos matemáticos más importantes de la humanidad.",
        },
      ],
    },
  },

  // ── 16 ── Aplicaciones ─────────────────────────────────────────────────────
  {
    slug: "pm-iii-pitagoras-construccion",
    titulo: "El Teorema de Pitágoras en construcción e ingeniería",
    categoria: "Aplicaciones",
    conceptos_clave: ["construcción", "ángulo recto", "diagonal", "distancia", "ingeniería estructural"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El Teorema de Pitágoras es quizás la herramienta matemática más usada en la construcción y la ingeniería civil. Cada vez que un albañil verifica que una esquina está en ángulo recto, cada vez que un ingeniero calcula la longitud de una diagonal, cada vez que un topógrafo determina distancias inaccesibles, está aplicando el mismo principio: a² + b² = c². Su uso no requiere calculadoras sofisticadas: con una cinta métrica y los números correctos, se pueden verificar ángulos rectos con precisión de milímetros.",
        },
        {
          tipo: "subtitulo",
          contenido: "El método 3-4-5 en construcción",
        },
        {
          tipo: "parrafo",
          contenido:
            "El método más antiguo y simple para verificar un ángulo recto en obra es el método 3-4-5. Desde el vértice del ángulo que se quiere verificar, se miden 3 unidades en una dirección y 4 unidades en la dirección perpendicular. Si la distancia entre los extremos de esas dos medidas es exactamente 5 unidades, el ángulo es recto. Los albañiles mexicanos llaman a esto 'cuadrar la esquina'. Si la diagonal mide más de 5 unidades, el ángulo es obtuso; si mide menos, es agudo. Multiplicando por cualquier factor (6-8-10, 9-12-15) se adapta el método a cualquier escala de obra.",
        },
        {
          tipo: "subtitulo",
          contenido: "Aplicaciones en ingeniería y arquitectura",
        },
        {
          tipo: "lista",
          items: [
            "Cálculo de diagonales: para verificar que un rectángulo es cuadrado, sus dos diagonales deben ser iguales y medir √(largo² + ancho²).",
            "Estructuras inclinadas: la longitud de un travesaño diagonal que une dos puntos separados horizontalmente por a metros y verticalmente por b metros es c = √(a² + b²).",
            "Pendiente de techos: si un techo sube 2 metros por cada 5 metros horizontales, la longitud real de la cubierta es √(5² + 2²) ≈ 5.39 m.",
            "Escaleras: si una escalera debe alcanzar una altura de 4.5 m y se separa 1.5 m de la pared, su longitud es √(4.5² + 1.5²) ≈ 4.74 m.",
            "Túneles y geodesia: el cálculo de distancias entre puntos GPS usa variantes tridimensionales de Pitágoras: d = √(Δx² + Δy² + Δz²).",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "En construcción, un milímetro importa. Un ángulo que no está exactamente recto genera paredes que no encajan, pisos que no son planos y estructuras que acumulan tensión. El triple 3-4-5 es tan confiable precisamente porque los números enteros eliminan los errores de redondeo. Los constructores prehispánicos de Tenochtitlan y Teotihuacán usaban cuerdas anudadas a intervalos regulares para obtener el mismo resultado.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de una construcción con el método 3-4-5 marcado en la esquina, y un esquema de travesaño diagonal con la fórmula de Pitágoras aplicada",
          caption: "El triple 3-4-5 ha sido la herramienta de los constructores para verificar ángulos rectos durante cuatro milenios.",
        },
      ],
    },
  },

  // ── 17 ── Aplicaciones ─────────────────────────────────────────────────────
  {
    slug: "pm-iii-cuadraticas-fisica",
    titulo: "Ecuaciones cuadráticas en la física: caída libre y tiro vertical",
    categoria: "Aplicaciones",
    conceptos_clave: ["caída libre", "tiro vertical", "movimiento parabólico", "tiempo de vuelo", "altura máxima"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Una de las aplicaciones más directas y hermosas de las ecuaciones cuadráticas es la descripción del movimiento de objetos bajo la influencia de la gravedad. Cuando se lanza un objeto verticalmente (hacia arriba o hacia abajo), su altura en función del tiempo sigue una ecuación cuadrática. La fórmula general de la cinemática para la posición vertical es: h = h₀ + v₀t − (1/2)gt², donde h es la altura, h₀ la altura inicial, v₀ la velocidad inicial, t el tiempo y g la aceleración de la gravedad (aproximadamente 9.8 m/s² en la Tierra, o 10 m/s² para cálculos simples).",
        },
        {
          tipo: "subtitulo",
          contenido: "Qué preguntas podemos responder con esta ecuación",
        },
        {
          tipo: "lista",
          items: [
            "¿Cuándo toca el suelo? Se resuelve h = 0, lo que da una ecuación cuadrática en t.",
            "¿Cuál es la altura máxima? El vértice de la parábola: t_max = v₀/g y h_max = h₀ + v₀²/(2g).",
            "¿En qué instante pasa por una altura determinada? Se resuelve h = h_deseada, ecuación cuadrática en t.",
            "¿Con qué velocidad inicial debe lanzarse para alcanzar una altura h? Se despeja v₀.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Ejemplo resuelto: el balón de básquetbol",
        },
        {
          tipo: "parrafo",
          contenido:
            "Un jugador lanza un balón verticalmente hacia arriba con velocidad inicial v₀ = 8 m/s desde una altura h₀ = 2 m. La ecuación de posición es h = 2 + 8t − 5t². ¿Cuándo toca el suelo? Se resuelve 0 = 2 + 8t − 5t², o 5t² − 8t − 2 = 0. Usando la fórmula general: t = (8 ± √(64 + 40)) / 10 = (8 ± √104) / 10 ≈ (8 ± 10.2) / 10. La solución positiva es t ≈ 1.82 s. ¿Cuál es la altura máxima? t_max = 8/10 = 0.8 s; h_max = 2 + 8(0.8) − 5(0.8)² = 2 + 6.4 − 3.2 = 5.2 m.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Galileo Galilei (1564-1642) fue el primero en demostrar experimentalmente que la caída libre es independiente del peso del objeto (contrariamente a lo que Aristóteles había afirmado) y que la distancia recorrida en caída libre es proporcional al cuadrado del tiempo: d = (1/2)gt². Esta relación cuadrática fue uno de los primeros resultados de la física matemática moderna, y estableció que la naturaleza 'habla en lenguaje matemático'.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Trayectoria parabólica de un objeto lanzado verticalmente, con la ecuación h = h₀ + v₀t − (1/2)gt² escrita, y los puntos de altura máxima e impacto marcados",
          caption: "La trayectoria de cualquier objeto lanzado verticalmente bajo gravedad es una parábola en el plano tiempo-altura.",
        },
      ],
    },
  },

  // ── 18 ── Aplicaciones ─────────────────────────────────────────────────────
  {
    slug: "pm-iii-geometria-diseno",
    titulo: "Geometría sólida en diseño, arte y arquitectura",
    categoria: "Aplicaciones",
    conceptos_clave: ["sólidos platónicos", "cúpula geodésica", "Buckminster Fuller", "diseño de empaques", "arte geométrico"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La geometría sólida no vive solo en los libros de texto: está en la arquitectura que habitamos, en el arte que contemplamos y en los empaques que usamos a diario. Los sólidos geométricos son la materia prima del diseño tridimensional. Desde las cúpulas de las catedrales hasta los envases de productos, desde las esculturas abstractas hasta los modelos moleculares, la geometría sólida está en el corazón de la creación humana.",
        },
        {
          tipo: "subtitulo",
          contenido: "Los sólidos platónicos: las cinco figuras perfectas",
        },
        {
          tipo: "parrafo",
          contenido:
            "Los sólidos platónicos son los únicos poliedros completamente regulares que existen: el tetraedro (4 caras triangulares), el cubo o hexaedro (6 caras cuadradas), el octaedro (8 caras triangulares), el dodecaedro (12 caras pentagonales) y el icosaedro (20 caras triangulares). Platón los asoció a los elementos: fuego-tetraedro, tierra-cubo, aire-octaedro, agua-icosaedro y cosmos-dodecaedro. Hoy aparecen en cristalografía (la sal es cúbica, los cristales de pirita son cúbicos o dodecaédricos), en virus (el VIH tiene forma icosaédrica) y en el arte contemporáneo.",
        },
        {
          tipo: "subtitulo",
          contenido: "La cúpula geodésica de Buckminster Fuller",
        },
        {
          tipo: "lista",
          items: [
            "Richard Buckminster Fuller (1895-1983) diseñó las cúpulas geodésicas basándose en la subdivisión del icosaedro.",
            "Una cúpula geodésica es una estructura esférica formada por triángulos, que distribuye las fuerzas de manera óptima.",
            "Con mínimo material, encierra el máximo espacio: es la estructura más eficiente conocida.",
            "El Biosphere de Montreal (1967) y el Spaceship Earth en EPCOT (Disney World) son cúpulas geodésicas famosas.",
            "Los fullerenos (C₆₀), una forma alotrópica del carbono descubierta en 1985, tienen forma de cúpula geodésica a escala molecular.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "En México, el Palacio de los Deportes construido para las Olimpiadas de 1968 (diseñado por Félix Candela y Pedro Ramírez Vázquez) es un ejemplo extraordinario de geometría sólida aplicada a la arquitectura. Su techo de cáscaras de concreto tiene forma de paraboloide hiperbólico, una superficie curvada que, paradójicamente, se puede construir con líneas rectas. La geometría compleja puede ser también la más bella.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Cúpula geodésica basada en el icosaedro con sus triángulos marcados, junto a los cinco sólidos platónicos etiquetados con sus nombres",
          caption: "Los sólidos platónicos y las cúpulas geodésicas muestran cómo la geometría más abstracta genera las estructuras más eficientes.",
        },
      ],
    },
  },

  // ── 19 ── Aplicaciones ─────────────────────────────────────────────────────
  {
    slug: "pm-iii-parabola-naturaleza-tecnologia",
    titulo: "Parábolas en la naturaleza y la tecnología",
    categoria: "Aplicaciones",
    conceptos_clave: ["parábola", "antena parabólica", "faro", "foco", "espejo de Arquímedes", "telecomunicaciones"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La parábola tiene una propiedad óptica extraordinaria que la hace indispensable en la tecnología moderna: todo rayo paralelo al eje de la parábola que la toca en su superficie interior converge en un único punto llamado foco. Inversamente, cualquier rayo emitido desde el foco se refleja paralelamente al eje. Esta propiedad, demostrada por primera vez por Apolonio de Perga en el siglo III a.C., es el principio de funcionamiento de las antenas satelitales, los espejos de los telescopios, los faros de los automóviles y los hornos solares.",
        },
        {
          tipo: "subtitulo",
          contenido: "La parábola en la tecnología cotidiana",
        },
        {
          tipo: "lista",
          items: [
            "Antena parabólica de televisión: la señal del satélite llega en rayos paralelos, se refleja en el plato parabólico y converge en el receptor ubicado en el foco.",
            "Faro de automóvil: el foco contiene el foco de luz; los rayos se reflejan paralelos y viajan como un haz concentrado y recto.",
            "Telescopio reflector: el espejo parabólico primario concentra la luz de estrellas lejanas (rayos paralelos) en el foco, donde se coloca el detector.",
            "Horno solar: un espejo parabólico concentra la luz del sol en el foco, donde se coloca el recipiente a calentar. Puede alcanzar más de 1000°C.",
            "Micrófono parabólico: el micrófono se coloca en el foco de un reflector parabólico para captar sonidos a gran distancia.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "El espejo de Arquímedes: parábolas en la guerra antigua",
        },
        {
          tipo: "parrafo",
          contenido:
            "La leyenda cuenta que Arquímedes de Siracusa (siglo III a.C.) usó espejos parabólicos para concentrar la luz del sol en los barcos romanos que atacaban Siracusa, incendiándolos. Aunque la efectividad histórica de este 'rayo de calor' sigue siendo debatida, el principio óptico es correcto: un espejo parabólico grande, orientado hacia el sol, puede concentrar suficiente energía en el foco para iniciar la combustión. Experimentos modernos han replicado el efecto con espejos de escala suficiente. En la naturaleza, la parábola aparece en la trayectoria de los proyectiles (bajo gravedad uniforme), en la forma de los cables de los puentes colgantes (bajo carga uniforme) y en las ondas de agua producidas por una piedra.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La propiedad del foco de la parábola se expresa algebraicamente en su ecuación en forma canónica: x² = 4py, donde p es la distancia del vértice al foco (y también del vértice a la directriz). Si la parábola tiene ecuación y = (1/4p)x², su foco está en (0, p). Cuanto mayor sea p, más 'abierta' es la parábola y más dispersa será la concentración en el foco. El diseño de antenas y telescopios depende de calcular exactamente la relación entre el diámetro del plato y la posición del foco.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de una parábola con rayos paralelos al eje que convergen en el foco, junto a imágenes de una antena satelital y un telescopio reflector que usan el mismo principio",
          caption: "La propiedad del foco de la parábola está en el corazón de las antenas satelitales, los telescopios y los hornos solares.",
        },
        {
          tipo: "cita",
          contenido:
            "Dadme un punto de apoyo y moveré el mundo.",
          fuente: "Arquímedes de Siracusa, matemático e inventor griego (c. 287-212 a.C.)",
        },
      ],
    },
  },
] as const;

// ---------------------------------------------------------------------------
// FUNCIÓN PRINCIPAL
// ---------------------------------------------------------------------------

export async function seedBibliotecaPMIII(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed Biblioteca PM-III (19 fichas)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac")
    .select("id")
    .eq("codigo", "PM-III")
    .single();

  if (uacErr || !uacRow) {
    throw new Error(
      `UAC PM-III no encontrada. Ejecuta primero seed-mccems.ts y seed-pmiii.ts. Error: ${uacErr?.message}`
    );
  }

  const rows = FICHAS_PMIII.map((f, i) => ({
    uac_id: uacRow.id,
    slug: f.slug,
    titulo: f.titulo,
    categoria: f.categoria,
    conceptos_clave: f.conceptos_clave as unknown as string[],
    tiempo_lectura_minutos: f.tiempo_lectura_minutos,
    es_placeholder: f.es_placeholder,
    contenido: f.contenido,
    orden: i + 1,
  }));

  const { error } = await sb
    .from("fichas_biblioteca")
    .upsert(rows, { onConflict: "slug" });

  if (error) throw new Error(`Error seeding fichas PM-III: ${error.message}`);

  console.log(`  ✓ ${rows.length} fichas de biblioteca de PM-III insertadas/actualizadas.`);
  console.log("\n✅ Seed Biblioteca PM-III completado.\n");
}

// ---------------------------------------------------------------------------
// ENTRYPOINT
// ---------------------------------------------------------------------------

if (
  process.env.NODE_ENV !== "test" &&
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  config({ path: resolve(process.cwd(), ".env.local") });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("❌ Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }
  const sb = createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  seedBibliotecaPMIII(sb).catch((err) => {
    console.error("❌ Error:", err.message);
    process.exit(1);
  });
}
