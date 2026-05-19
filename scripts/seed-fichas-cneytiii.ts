/**
 * Seed de fichas de biblioteca para CNEYT-III (Ciencias Naturales, Experimentales y Tecnología III).
 * 21 fichas temáticas alineadas al MCCEMS 2025, Semestre 3.
 *
 * Uso: npx tsx scripts/seed-fichas-cneytiii.ts
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

const FICHAS_CNEYTIII = [
  // ── 1 ── Ecosistemas ───────────────────────────────────────────────────────
  {
    slug: "cneyt-iii-biomas-planeta",
    titulo: "Los biomas del planeta: diversidad de ecosistemas",
    categoria: "Ecosistemas",
    conceptos_clave: ["bioma", "clima", "vegetación", "adaptación", "biodiversidad"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Un bioma es una gran región de la Tierra caracterizada por un tipo de clima predominante, una vegetación característica y comunidades de animales y microorganismos adaptados a esas condiciones. A diferencia del ecosistema, que puede ser tan pequeño como un charco, el bioma abarca extensiones continentales. El clima —temperatura y precipitación principalmente— es el factor determinante que define los límites de cada bioma.",
        },
        {
          tipo: "subtitulo",
          contenido: "Los grandes biomas terrestres",
        },
        {
          tipo: "lista",
          items: [
            "Selva tropical húmeda: ubicada en la franja ecuatorial (Amazonía, Congo, Sudeste Asiático). Precipitaciones superiores a 2,000 mm anuales, temperatura media de 25-28 °C, mayor biodiversidad del planeta. Representa solo el 7 % de la superficie terrestre pero alberga más del 50 % de las especies conocidas.",
            "Desierto: cubre el 33 % de la superficie terrestre. Precipitaciones menores a 250 mm anuales. Las plantas y animales desarrollan estrategias de almacenamiento de agua (cactáceas, reptiles). El Desierto de Sonora, compartido entre México y Estados Unidos, es uno de los más biodiversos del mundo.",
            "Pradera y sabana: extensas llanuras con vegetación herbácea y pocas precipitaciones para sostener bosque. La sabana africana con sus grandes mamíferos y las praderas templadas de Norteamérica son sus ejemplos más conocidos.",
            "Bosque templado: cuatro estaciones marcadas, precipitaciones moderadas (600-1,500 mm). Árboles caducifolios (roble, arce, haya). En México, los bosques de encino y pino forman el equivalente templado.",
            "Taiga o bosque boreal: el bioma terrestre más grande del mundo, extendiéndose por Siberia, Canadá y Escandinavia. Coníferas dominantes (pino, abeto, alerce), inviernos extremos de hasta -50 °C.",
            "Tundra: sin árboles, permafrost (suelo permanentemente congelado), veranos brevísimos. Musgo, líquenes y arbustos rastreros. Hogar del caribú, lemming y oso polar.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "México: país de múltiples biomas",
        },
        {
          tipo: "parrafo",
          contenido:
            "La posición geográfica de México —entre los trópicos y la zona templada, con dos costas oceánicas y complejos sistemas montañosos— le confiere una extraordinaria diversidad de biomas en un mismo territorio: selvas húmedas en Chiapas y Tabasco, selvas secas en la costa del Pacífico, matorrales xerófilos en el altiplano central y norte, bosques templados de pino-encino en las sierras, manglares en ambos litorales y pastizales en el norte. Esta diversidad de ambientes es la base de la megadiversidad biológica de México.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El clima es el factor principal que define un bioma, pero la topografía puede crear microbiomas dentro de un mismo clima regional. En México, la Sierra Madre Occidental produce un gradiente altitudinal que va del desierto al bosque de pino-abeto en pocos kilómetros horizontales, pasando por matorrales, pastizales y bosques de encino.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Mapa mundial con los biomas terrestres coloreados: selva tropical en verde oscuro, desierto en amarillo, taiga en verde claro, tundra en blanco-azul",
          caption: "La distribución de los biomas terrestres sigue los patrones de temperatura y precipitación.",
        },
        {
          tipo: "cita",
          contenido:
            "La biodiversidad de México es el resultado de millones de años de evolución en un territorio que concentra casi todos los biomas del planeta.",
          fuente: "CONABIO, Biodiversidad Mexicana (2020)",
        },
      ],
    },
  },

  // ── 2 ── Ecosistemas ───────────────────────────────────────────────────────
  {
    slug: "cneyt-iii-mexico-megadiverso",
    titulo: "México: país megadiverso",
    categoria: "Ecosistemas",
    conceptos_clave: ["megadiversidad", "endemismo", "CONABIO", "especies amenazadas", "biodiversidad"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "México es reconocido internacionalmente como uno de los países megadiversos del mundo: aquellos que concentran en su territorio más del 70 % de la biodiversidad global. Según datos de la Comisión Nacional para el Conocimiento y Uso de la Biodiversidad (CONABIO), México ocupa el quinto lugar mundial en diversidad biológica, con más de 200,000 especies conocidas. En reptiles ocupa el primer lugar mundial, en mamíferos el segundo y en anfibios el cuarto.",
        },
        {
          tipo: "subtitulo",
          contenido: "Endemismo: especies que solo existen en México",
        },
        {
          tipo: "parrafo",
          contenido:
            "Una especie endémica es aquella cuya área de distribución natural está restringida a una región geográfica específica. México tiene índices de endemismo excepcionalmente altos: el 52 % de los reptiles, el 65 % de los anfibios y el 23 % de los mamíferos son endémicos. Algunas de las especies endémicas más emblemáticas son: la vaquita marina (Phocoena sinus), el cetáceo más pequeño y en peligro crítico de extinción del planeta, con menos de 20 individuos en el Alto Golfo de California; el ajolote o axolotl (Ambystoma mexicanum), anfibio que mantiene características larvales toda su vida (neotenia), endémico de los canales de Xochimilco; el quetzal resplandeciente (Pharomachrus mocinno), ave sagrada de las culturas mesoamericanas, presente en los bosques de niebla de Chiapas y Oaxaca; y el jaguar (Panthera onca), el felino más grande de América, cuya población se estima en menos de 4,000 individuos en México.",
        },
        {
          tipo: "subtitulo",
          contenido: "Hotspots de biodiversidad en México",
        },
        {
          tipo: "lista",
          items: [
            "Selva Lacandona (Chiapas): uno de los últimos grandes fragmentos de selva tropical en Mesoamérica, con más de 3,000 especies de plantas, 600 de aves y 100 de mamíferos.",
            "Sierra de Juárez (Oaxaca): concentra la mayor diversidad de pinos del mundo y es refugio de más de 700 especies de aves.",
            "Cuenca del Balsas: centro de diversificación del maíz silvestre (teocintle) y de numerosas especies de cactus.",
            "Golfo de México y Caribe mexicano: arrecifes de coral, pastos marinos y manglares con extraordinaria diversidad marina.",
            "Islas del Pacífico (Guadalupe, Revillagigedo): hotspot de fauna marina endémica, incluyendo tiburones martillo y manta rayas gigantes.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "La vaquita marina es la especie de mamífero marino más amenazada del mundo. CONANP y organizaciones internacionales trabajan en su protección en el Alto Golfo de California, donde las redes de enmalle ilegales para capturar la totoaba (otro pez endémico) son su principal amenaza. La totoaba es apreciada en el mercado negro chino por su vejiga natatoria.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Mosaico con fotografías de especies emblemáticas de México: vaquita marina, ajolote, quetzal y jaguar sobre fondo de mapa mexicano",
          caption: "Las especies endémicas de México son un patrimonio natural irremplazable.",
        },
      ],
    },
  },

  // ── 3 ── Ecosistemas ───────────────────────────────────────────────────────
  {
    slug: "cneyt-iii-redes-troficas",
    titulo: "Redes tróficas: quién come a quién",
    categoria: "Ecosistemas",
    conceptos_clave: ["cadena trófica", "red alimentaria", "productores", "consumidores", "descomponedores", "especie clave"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Las relaciones de alimentación entre los organismos de un ecosistema forman redes complejas de interdependencia. Una cadena trófica representa la secuencia lineal de 'quién come a quién': planta → conejo → zorra → águila. Pero en la naturaleza, los organismos rara vez tienen una sola presa y un solo depredador. La red trófica es la representación real de todas las cadenas alimentarias entrelazadas en un ecosistema.",
        },
        {
          tipo: "subtitulo",
          contenido: "Niveles tróficos",
        },
        {
          tipo: "lista",
          items: [
            "Productores (nivel 1): organismos autótrofos que fabrican materia orgánica a partir de energía solar o química. En ecosistemas terrestres, son las plantas; en acuáticos, el fitoplancton y las algas.",
            "Consumidores primarios (nivel 2): herbívoros que se alimentan directamente de los productores. Iguanas, conejos, chapulines, mariposas.",
            "Consumidores secundarios (nivel 3): carnívoros que comen herbívoros. Serpientes, ranas, aves insectívoras.",
            "Consumidores terciarios (nivel 4): carnívoros que comen a otros carnívoros. Águilas, jaguares, tiburones.",
            "Descomponedores: hongos, bacterias y algunos invertebrados que degradan la materia orgánica muerta y devuelven los nutrientes al suelo. Sin ellos, el ciclo de la materia se detendría.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Especies clave en ecosistemas mexicanos",
        },
        {
          tipo: "parrafo",
          contenido:
            "Una especie clave o especie keystone es aquella cuya presencia o ausencia tiene un impacto desproporcionado en la estructura del ecosistema, independientemente de su abundancia. En el manglar del Golfo de México, el pez mangle regula las poblaciones de cangrejos e invertebrados que controlan las algas; si desaparece, la red se desequilibra. En la Selva Lacandona, el jaguar controla las poblaciones de herbívoros grandes como el tapir y el pecarí, cuya sobrepoblación daña la regeneración vegetal. La pérdida de una especie clave puede provocar el colapso en cascada de toda la red trófica.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La diferencia entre cadena trófica y red trófica es crucial: la cadena es una simplificación didáctica útil, pero la red refleja la complejidad real del ecosistema. Un ecosistema con mayor diversidad de especies tiene redes tróficas más complejas y, por lo tanto, mayor resiliencia frente a perturbaciones: si una especie desaparece, otras pueden compensar su función.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de una red trófica de manglar mexicano, con flechas que conectan productores (manglares, algas), invertebrados, peces, aves y mamíferos",
          caption: "La red trófica de un manglar muestra la interdependencia de docenas de especies.",
        },
      ],
    },
  },

  // ── 4 ── Ecosistemas ───────────────────────────────────────────────────────
  {
    slug: "cneyt-iii-flujo-de-energia",
    titulo: "Flujo de energía en los ecosistemas",
    categoria: "Ecosistemas",
    conceptos_clave: ["flujo de energía", "regla del 10 %", "pirámide trófica", "eficiencia ecológica", "productividad"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "A diferencia de la materia, que se recicla en los ciclos biogeoquímicos, la energía fluye en una sola dirección a través del ecosistema: entra como energía solar, es capturada por los productores en la fotosíntesis, pasa a los consumidores al ser ingerida y finalmente se disipa como calor. Nunca regresa. Este flujo unidireccional es la base de la estructura trófica de cualquier ecosistema.",
        },
        {
          tipo: "subtitulo",
          contenido: "La regla del 10 %",
        },
        {
          tipo: "parrafo",
          contenido:
            "En cada transferencia de un nivel trófico al siguiente, aproximadamente el 90 % de la energía se pierde como calor metabólico, movimiento, respiración celular y estructuras que no son consumidas (huesos, pelo, raíces). Solo el 10 % queda disponible para el siguiente nivel. Si un campo de maíz captura 10,000 kcal/m²/año mediante fotosíntesis, solo 1,000 kcal estarán disponibles para los herbívoros, 100 kcal para los carnívoros primarios y apenas 10 kcal para los carnívoros secundarios.",
        },
        {
          tipo: "subtitulo",
          contenido: "Pirámides tróficas",
        },
        {
          tipo: "lista",
          items: [
            "Pirámide de energía: siempre tiene forma de pirámide verdadera, con mayor energía en los productores y menos en cada nivel superior. Nunca se invierte.",
            "Pirámide de biomasa: representa la masa de materia orgánica en cada nivel. Generalmente tiene forma piramidal, aunque en ecosistemas acuáticos puede invertirse (el fitoplancton se reproduce tan rápido que menos biomasa sostiene más biomasa de zooplancton).",
            "Pirámide de números: indica cuántos individuos hay en cada nivel. Puede invertirse (un árbol sostiene miles de insectos).",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "La regla del 10 % explica por qué hay menos grandes depredadores que herbívoros, y por qué comer plantas es energéticamente más eficiente que comer carne. Para producir 1 kg de carne de res se necesitan aproximadamente 8-10 kg de maíz o soya. Este dato tiene implicaciones directas para el análisis del impacto ambiental de los sistemas alimentarios.",
        },
        {
          tipo: "parrafo",
          contenido:
            "En México, la eficiencia ecológica de los ecosistemas varía enormemente. La Selva Lacandona tiene una productividad primaria neta de hasta 20 toneladas de materia orgánica por hectárea por año, mientras que los matorrales xerófilos del norte producen menos de 2 toneladas. Esto explica por qué las selvas tropicales pueden sostener mayor diversidad y densidad de consumidores que los desiertos.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Pirámide trófica de cuatro niveles con valores de energía en cada nivel: 10,000 kcal (productores), 1,000 kcal (herbívoros), 100 kcal (carnívoros I), 10 kcal (carnívoros II)",
          caption: "Cada nivel trófico retiene solo el 10 % de la energía del nivel anterior.",
        },
      ],
    },
  },

  // ── 5 ── Ecosistemas ───────────────────────────────────────────────────────
  {
    slug: "cneyt-iii-sistema-terrestre-subsistemas",
    titulo: "El sistema terrestre: atmósfera, hidrosfera, litosfera y biosfera",
    categoria: "Ecosistemas",
    conceptos_clave: ["sistema terrestre", "atmósfera", "hidrosfera", "litosfera", "biosfera", "interacciones"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La Tierra funciona como un sistema complejo en el que cuatro grandes subsistemas interactúan de manera continua: la atmósfera (capa de gases que envuelve el planeta), la hidrosfera (toda el agua en sus tres estados), la litosfera (corteza y manto superior sólido) y la biosfera (la totalidad de los seres vivos y sus ambientes). Ninguno de estos subsistemas funciona de manera aislada: están constantemente intercambiando materia y energía.",
        },
        {
          tipo: "subtitulo",
          contenido: "Los cuatro subsistemas terrestres",
        },
        {
          tipo: "lista",
          items: [
            "Atmósfera: mezcla de gases (78 % nitrógeno, 21 % oxígeno, 0.04 % CO₂, más gases traza) que regula la temperatura, distribuye el agua y protege de la radiación ultravioleta. Se extiende hasta aproximadamente 700 km de altitud.",
            "Hidrosfera: incluye océanos (96.5 % del agua del planeta), glaciares, ríos, lagos, aguas subterráneas y vapor atmosférico. Los océanos cubren el 71 % de la superficie terrestre y son el principal regulador climático del planeta.",
            "Litosfera: la corteza terrestre (de 5 a 70 km de grosor) y el manto superior. El suelo —la delgada capa superficial formada por roca meteorizada, materia orgánica, agua, aire y microorganismos— es el soporte de la vida terrestre.",
            "Biosfera: la zona de la Tierra donde existe vida, desde varios kilómetros bajo el suelo hasta varios kilómetros en la atmósfera. Los organismos no son pasivos: transforman activamente los otros tres subsistemas.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Fenómenos que cruzan los cuatro subsistemas",
        },
        {
          tipo: "parrafo",
          contenido:
            "La erupción del volcán Popocatépetl (litosfera) libera SO₂ a la atmósfera, que se combina con agua para formar lluvia ácida (hidrosfera), dañando la vegetación de los bosques circundantes (biosfera). Los huracanes del Caribe (atmósfera + hidrosfera) depositan sedimentos y nutrientes en los arrecifes de coral (biosfera + litosfera). La deforestación (biosfera) reduce la transpiración vegetal, disminuyendo las precipitaciones locales (atmósfera e hidrosfera) y acelerando la erosión del suelo (litosfera). Todo está conectado.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El concepto de sistema terrestre reemplaza la visión fragmentada donde la geología, la biología y la meteorología son disciplinas separadas. La ciencia del sistema terrestre estudia las interacciones entre los cuatro subsistemas para entender los cambios globales, incluyendo el cambio climático, que no puede comprenderse sin considerar todos los subsistemas simultáneamente.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama circular con los cuatro subsistemas terrestres (atmósfera, hidrosfera, litosfera, biosfera) y flechas bidireccionales mostrando sus interacciones",
          caption: "Los cuatro subsistemas terrestres intercambian materia y energía de manera continua.",
        },
      ],
    },
  },

  // ── 6 ── Ecosistemas ───────────────────────────────────────────────────────
  {
    slug: "cneyt-iii-selva-tropical-biodiversidad",
    titulo: "La selva tropical: el ecosistema más biodiverso del planeta",
    categoria: "Ecosistemas",
    conceptos_clave: ["selva tropical", "Selva Lacandona", "estructura vertical", "biodiversidad", "deforestación"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Las selvas tropicales húmedas son los ecosistemas más biodiversos del planeta. Aunque cubren apenas el 7 % de la superficie terrestre, albergan entre el 50 y el 80 % de todas las especies conocidas. En México, la Selva Lacandona en Chiapas es el remanente más importante de selva tropical del país y uno de los más significativos de Mesoamérica. Según SEMARNAT, la Selva Lacandona cubre aproximadamente 500,000 hectáreas —una fracción de su extensión original— y alberga más de 3,000 especies de plantas vasculares, 600 de aves, 100 de mamíferos y centenares de reptiles y anfibios.",
        },
        {
          tipo: "subtitulo",
          contenido: "Estructura vertical de la selva",
        },
        {
          tipo: "lista",
          items: [
            "Estrato emergente: los árboles más altos (30-50 m) que sobresalen del dosel. Ceibas, amates y chicozapotes son ejemplos en la selva chiapaneca. Las águilas harpías anidan aquí.",
            "Dosel o bóveda: capa continua de copas de árboles (20-30 m) que intercpta el 95 % de la luz solar. Monos araña, tucanes y muchas epífitas (orquídeas, bromelias) viven en esta capa.",
            "Sotobosque o understory: espacio sombreado por debajo del dosel (5-20 m). Arbustos, helechos arborescentes y plantas tolerantes a la sombra. Jaguares, tapires y serpientes se mueven aquí.",
            "Piso forestal: recibe menos del 1 % de la luz solar. Hongos descomponedores, raíces superficiales, hojarasca. La descomposición aquí es tan rápida que el suelo de la selva es sorprendentemente pobre en nutrientes.",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "La principal amenaza para la Selva Lacandona es la deforestación, impulsada por la expansión agrícola y ganadera, la extracción maderera ilegal y los asentamientos humanos. Según SEMARNAT, México perdió en las últimas décadas más del 60 % de su cobertura original de selva. La Reserva de la Biosfera Montes Azules, dentro de la Selva Lacandona, es una de las áreas naturales protegidas más importantes del país para frenar este proceso.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Las selvas tropicales funcionan como 'bombas bióticas': la transpiración de sus árboles genera masas de aire húmedo que se desplazan hacia el interior del continente, produciendo lluvias en regiones alejadas. La deforestación masiva no solo destruye biodiversidad local: puede reducir las precipitaciones en zonas agrícolas a cientos de kilómetros de distancia.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Corte transversal de una selva tropical mostrando los cuatro estratos: emergente, dosel, sotobosque y piso forestal con las especies características de cada nivel",
          caption: "La estructura vertical de la selva tropical crea hábitats diferenciados para miles de especies.",
        },
      ],
    },
  },

  // ── 7 ── Fotosíntesis ──────────────────────────────────────────────────────
  {
    slug: "cneyt-iii-fotosintesis-ecuacion",
    titulo: "La fotosíntesis: la ecuación de la vida",
    categoria: "Fotosíntesis",
    conceptos_clave: ["fotosíntesis", "clorofila", "glucosa", "reacciones de luz", "ciclo de Calvin"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La fotosíntesis es el proceso mediante el cual los organismos autótrofos —plantas, algas y ciertas bacterias— convierten la energía luminosa en energía química almacenada en moléculas orgánicas. Es el proceso más importante de la biosfera: sin fotosíntesis no existiría el oxígeno en la atmósfera, no habría alimento para los heterótrofos y la vida tal como la conocemos sería imposible. La ecuación general de la fotosíntesis es:",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Ecuación global de la fotosíntesis: 6CO₂ + 6H₂O + energía luminosa → C₆H₁₂O₆ + 6O₂. Seis moléculas de dióxido de carbono y seis de agua, usando energía solar, producen una molécula de glucosa y seis de oxígeno.",
        },
        {
          tipo: "subtitulo",
          contenido: "Las dos fases de la fotosíntesis",
        },
        {
          tipo: "lista",
          items: [
            "Reacciones dependientes de la luz (fase luminosa): ocurren en las membranas de los tilacoides del cloroplasto. La clorofila absorbe la energía solar y la usa para dividir moléculas de agua (fotólisis), liberando oxígeno como subproducto y produciendo ATP y NADPH (moléculas portadoras de energía).",
            "Ciclo de Calvin (fase oscura o de fijación del carbono): ocurre en el estroma del cloroplasto. El CO₂ atmosférico es incorporado a moléculas orgánicas usando la energía del ATP y NADPH producidos en la fase luminosa. El producto final es el gliceraldehído-3-fosfato (G3P), que puede convertirse en glucosa.",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "La clorofila es el pigmento fotosintético principal. Absorbe preferentemente la luz roja y azul, y refleja la luz verde, razón por la que las plantas se ven verdes. Existen otros pigmentos accesorios (carotenoides, ficobilinas) que amplían el espectro de luz capturado y protegen a la planta del exceso de radiación solar. En otoño, cuando la clorofila se degrada, los pigmentos accesorios (carotenoides amarillos y naranjas, antocianinas rojas) son los que dan los colores típicos de los bosques caducifolios.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "La fotosíntesis produce el oxígeno que respiramos. El O₂ que libera proviene del agua, no del CO₂. Esto fue demostrado en la década de 1940 usando oxígeno marcado con el isótopo ¹⁸O: cuando se marcaba el agua con ¹⁸O, el oxígeno liberado estaba marcado; cuando se marcaba el CO₂, el oxígeno producido no lo estaba.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama del cloroplasto mostrando los tilacoides (fase luminosa) y el estroma (ciclo de Calvin) con las moléculas que entran y salen de cada fase",
          caption: "El cloroplasto es la organela donde ocurren las dos fases de la fotosíntesis.",
        },
      ],
    },
  },

  // ── 8 ── Fotosíntesis ──────────────────────────────────────────────────────
  {
    slug: "cneyt-iii-tipos-fotosintesis",
    titulo: "Tipos de fotosíntesis: C3, C4 y CAM",
    categoria: "Fotosíntesis",
    conceptos_clave: ["fotosíntesis C3", "fotosíntesis C4", "metabolismo CAM", "maíz", "cactus", "adaptación"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Aunque la ecuación general de la fotosíntesis es la misma para todas las plantas, la forma en que fijan el carbono difiere según las condiciones del ambiente en que evolucionaron. Se reconocen tres tipos principales de fotosíntesis: C3, C4 y CAM. Cada uno representa una adaptación evolutiva a diferentes condiciones de temperatura, luz y disponibilidad de agua.",
        },
        {
          tipo: "subtitulo",
          contenido: "Fotosíntesis C3: el tipo original",
        },
        {
          tipo: "parrafo",
          contenido:
            "La gran mayoría de las plantas —aproximadamente el 85 % de las especies— realizan fotosíntesis C3. El nombre proviene del primer producto estable de la fijación del carbono: un compuesto de 3 carbonos (ácido 3-fosfoglicérico). Ejemplos importantes: trigo, arroz, papa, soya y la mayoría de los árboles. El problema de las plantas C3 en climas cálidos y secos es la fotorrespiración: cuando los estomas se cierran para conservar agua, el CO₂ interno disminuye y el O₂ aumenta, causando que la Rubisco (enzima clave) 'cometa errores' y oxide moléculas orgánicas en lugar de fijar carbono, reduciendo la eficiencia fotosintética hasta un 25 %.",
        },
        {
          tipo: "subtitulo",
          contenido: "Fotosíntesis C4: la solución tropical",
        },
        {
          tipo: "parrafo",
          contenido:
            "Las plantas C4 —como el maíz (Zea mays), la caña de azúcar, el sorgo y muchos pastos tropicales— evolucionaron una solución elegante al problema de la fotorrespiración: concentran el CO₂ cerca de la Rubisco antes de que entre al ciclo de Calvin. El primer producto de fijación tiene 4 carbonos (ácido oxalacético, de ahí el nombre C4). Esto les permite fotosintentizar con mayor eficiencia en climas cálidos y soleados, y usan menos agua por gramo de CO₂ fijado. El maíz es especialmente importante para México: es un cultivo originario de México (domesticado a partir del teocintle hace unos 9,000 años en la cuenca del Balsas) y sustenta la dieta y la economía del país.",
        },
        {
          tipo: "subtitulo",
          contenido: "Metabolismo CAM: la estrategia del desierto",
        },
        {
          tipo: "lista",
          items: [
            "CAM significa Crassulacean Acid Metabolism (Metabolismo Ácido de las Crasuláceas). Las plantas CAM abren sus estomas de noche —cuando la temperatura es menor y la pérdida de agua mínima— para capturar CO₂, que almacenan en forma de ácido málico.",
            "Durante el día, con los estomas cerrados para evitar la deshidratación, liberan el CO₂ almacenado y realizan el ciclo de Calvin.",
            "Ejemplos emblemáticos en México: todas las cactáceas (nopal, saguaro, cardon), el maguey (Agave spp.), la pitaya y las orquídeas suculentas.",
            "Las plantas CAM son las más eficientes en uso del agua, pero las menos productivas en términos de crecimiento, ya que tienen acceso limitado al CO₂.",
            "México es uno de los centros de diversificación más importantes del mundo para cactáceas y agaves, plantas CAM que han evolucionado durante millones de años en los desiertos y semidesiertos mexicanos.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La diferencia entre C3, C4 y CAM no es solo botánica: tiene implicaciones para la agricultura y el cambio climático. Las plantas C4 como el maíz serán potencialmente más productivas en un mundo más cálido, mientras que las plantas C3 de zonas templadas como el trigo podrían sufrir reducciones de rendimiento. Los investigadores trabajan en 'convertir' cultivos C3 al metabolismo C4 mediante ingeniería genética.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Comparación de tres hojas transversales: C3 (anatomía simple), C4 (célula de la vaina del haz diferenciada), CAM (grandes vacuolas para almacenar ácido málico)",
          caption: "Los tres tipos de fotosíntesis reflejan adaptaciones a diferentes ambientes.",
        },
      ],
    },
  },

  // ── 9 ── Fotosíntesis ──────────────────────────────────────────────────────
  {
    slug: "cneyt-iii-fotosintesis-clima",
    titulo: "Fotosíntesis y cambio climático: el rol de las plantas",
    categoria: "Fotosíntesis",
    conceptos_clave: ["sumidero de carbono", "deforestación", "ciclo del carbono", "bosques", "concentración de CO₂"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Los ecosistemas terrestres —principalmente bosques y selvas— actúan como sumideros de carbono: absorben más CO₂ del que liberan, almacenando carbono en la madera, las hojas, las raíces y el suelo. Según el IPCC (Grupo Intergubernamental de Expertos sobre el Cambio Climático), los ecosistemas terrestres absorben aproximadamente 2.6 gigatoneladas de carbono por año, lo que equivale a casi la cuarta parte de las emisiones humanas anuales de CO₂.",
        },
        {
          tipo: "subtitulo",
          contenido: "La fotosíntesis como regulador del CO₂ atmosférico",
        },
        {
          tipo: "parrafo",
          contenido:
            "Antes de la Revolución Industrial (1850), la concentración de CO₂ en la atmósfera era de aproximadamente 280 partes por millón (ppm). En 2024 superó las 425 ppm, el nivel más alto en 3 millones de años. La fotosíntesis global absorbe cada año entre 100 y 120 gigatoneladas de carbono, pero la respiración de plantas y microorganismos libera casi la misma cantidad. La diferencia neta —el sumidero— depende de la cantidad y salud de los ecosistemas forestales.",
        },
        {
          tipo: "subtitulo",
          contenido: "Deforestación: de sumidero a fuente",
        },
        {
          tipo: "lista",
          items: [
            "Cuando un bosque es talado y quemado, el carbono almacenado durante décadas o siglos se libera en días como CO₂ a la atmósfera.",
            "La deforestación tropical representa entre el 10 y el 15 % de las emisiones globales de gases de efecto invernadero.",
            "México es uno de los países con mayores tasas de deforestación en América Latina. Según SEMARNAT, se perdían hasta 300,000 hectáreas anuales de bosques y selvas a principios del siglo XXI.",
            "Al eliminar la cobertura forestal, se reducen las lluvias locales (menos transpiración), se favorece la erosión del suelo y se pierde el hábitat de miles de especies.",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "Preservar y restaurar los bosques de México es una de las estrategias más costo-efectivas para mitigar el cambio climático. El programa REDD+ (Reducción de Emisiones por Deforestación y Degradación Forestal), al que México se ha comprometido, busca compensar económicamente a las comunidades que conservan sus bosques, reconociendo el valor del servicio ambiental que prestan al capturar carbono.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Un aumento en la concentración de CO₂ atmosférico puede acelerar la fotosíntesis en algunas plantas (efecto fertilización por CO₂), pero este beneficio es limitado: también aumenta la temperatura, el estrés hídrico y la competencia con malezas C4 más agresivas. La idea de que 'más CO₂ es bueno para las plantas' es una simplificación peligrosa que ignora los efectos sistémicos del cambio climático.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Gráfica de la concentración de CO₂ atmosférico desde 1850 hasta 2024, mostrando la curva de Keeling con el ascenso de 280 ppm a más de 420 ppm",
          caption: "La concentración de CO₂ atmosférico ha aumentado un 50 % desde la Revolución Industrial.",
        },
      ],
    },
  },

  // ── 10 ── Ciclos biogeoquímicos ────────────────────────────────────────────
  {
    slug: "cneyt-iii-ciclo-del-agua",
    titulo: "El ciclo del agua: de la lluvia a los mares",
    categoria: "Ciclos biogeoquímicos",
    conceptos_clave: ["ciclo hidrológico", "evaporación", "precipitación", "acuíferos", "CONAGUA", "estrés hídrico"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El ciclo del agua o ciclo hidrológico es el movimiento continuo del agua entre la atmósfera, la superficie terrestre y las aguas subterráneas. Es el ciclo biogeoquímico más importante desde el punto de vista humano, pues regula la disponibilidad de agua dulce —un recurso esencial y escaso: solo el 2.5 % del agua del planeta es dulce, y la mayor parte está atrapada en glaciares o aguas subterráneas profundas.",
        },
        {
          tipo: "subtitulo",
          contenido: "Los procesos del ciclo hidrológico",
        },
        {
          tipo: "lista",
          items: [
            "Evaporación: el agua de océanos, lagos y ríos se convierte en vapor por acción de la energía solar. Los océanos aportan el 86 % del vapor atmosférico.",
            "Transpiración: las plantas liberan vapor de agua a través de sus estomas. En una selva tropical, hasta el 75 % de la precipitación regresa a la atmósfera por transpiración vegetal.",
            "Condensación: el vapor se enfría al ascender y se convierte en gotitas de agua que forman nubes.",
            "Precipitación: el agua cae en forma de lluvia, granizo, nieve o niebla según la temperatura.",
            "Escorrentía superficial: el agua que no se infiltra en el suelo corre por la superficie formando ríos y arroyos.",
            "Infiltración y recarga de acuíferos: una parte del agua penetra el suelo y llega a las zonas saturadas subterráneas (acuíferos), donde puede permanecer durante siglos.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "México y el estrés hídrico",
        },
        {
          tipo: "parrafo",
          contenido:
            "México es un país con una distribución muy desigual del agua: el 68 % del territorio es árido o semiárido, y en el norte —donde se concentra buena parte de la industria y la agricultura de exportación— la precipitación media es menor a 500 mm anuales. Según CONAGUA (Comisión Nacional del Agua), más del 80 % de los acuíferos del norte del país están sobreexplotados, extrayendo agua más rápido de lo que la lluvia puede recargarlos. La Ciudad de México, ubicada en una cuenca cerrada, importa el 30 % de su agua desde otras cuencas mediante el Sistema Cutzamala.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El cambio climático está alterando el ciclo del agua en México: las lluvias se vuelven más intensas pero menos frecuentes (más inundaciones y más sequías), los glaciares de los volcanes (Popocatépetl, Iztaccíhuatl, Pico de Orizaba) se están derritiendo aceleradamente, y las temporadas de huracán son más intensas. La gestión sostenible del agua es uno de los mayores retos ambientales del país.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama del ciclo del agua con flechas que muestran evaporación, transpiración, condensación, precipitación, escorrentía e infiltración en un paisaje mexicano",
          caption: "El ciclo del agua conecta océanos, atmósfera, ríos, suelos y seres vivos.",
        },
      ],
    },
  },

  // ── 11 ── Ciclos biogeoquímicos ────────────────────────────────────────────
  {
    slug: "cneyt-iii-ciclo-carbono",
    titulo: "El ciclo del carbono y el efecto invernadero",
    categoria: "Ciclos biogeoquímicos",
    conceptos_clave: ["ciclo del carbono", "CO₂", "efecto invernadero", "combustibles fósiles", "sumideros"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El carbono es el elemento fundamental de la vida: todas las moléculas orgánicas (proteínas, lípidos, hidratos de carbono, ácidos nucleicos) están construidas sobre esqueletos de carbono. El ciclo del carbono describe cómo este elemento fluye entre los cuatro subsistemas del sistema terrestre: la atmósfera (CO₂, CH₄), la hidrosfera (CO₂ disuelto, carbonatos), la litosfera (carbón, petróleo, caliza) y la biosfera (materia orgánica viva y muerta).",
        },
        {
          tipo: "subtitulo",
          contenido: "El ciclo natural del carbono",
        },
        {
          tipo: "lista",
          items: [
            "Fotosíntesis: las plantas y el fitoplancton capturan CO₂ atmosférico y lo convierten en materia orgánica (~120 Gt C/año).",
            "Respiración: plantas, animales y microorganismos liberan CO₂ al metabolizar la materia orgánica (~119 Gt C/año).",
            "Descomposición: los descomponedores mineralizan la materia orgánica muerta, liberando CO₂ y CH₄.",
            "Intercambio oceánico: los océanos absorben CO₂ atmosférico, que se disuelve y reacciona con el agua formando ácido carbónico, bicarbonato y carbonato.",
            "Carbonatación geológica: a lo largo de millones de años, el carbono se deposita en el fondo marino como carbonato de calcio (calizas) o se acumula como carbono orgánico (que eventualmente forma carbón o petróleo).",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "La perturbación humana: los combustibles fósiles",
        },
        {
          tipo: "parrafo",
          contenido:
            "Al quemar carbón, petróleo y gas natural, liberamos en décadas el carbono que tardó millones de años en acumularse en la litosfera. Las emisiones humanas de CO₂ son de aproximadamente 36 Gt CO₂ anuales (2023), de las cuales los océanos y la biosfera absorben alrededor del 55 %; el 45 % restante se acumula en la atmósfera, incrementando el efecto invernadero. El efecto invernadero natural es indispensable para la vida (sin él, la temperatura media de la Tierra sería de -18 °C en lugar de los actuales +15 °C), pero el intensificado por la actividad humana está elevando las temperaturas a un ritmo sin precedentes.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El CO₂ no es el único gas de efecto invernadero. El metano (CH₄) tiene un potencial de calentamiento 80 veces mayor que el CO₂ en un período de 20 años, aunque permanece menos tiempo en la atmósfera. Proviene del ganado (fermentación entérica), los arrozales, los rellenos sanitarios y las fugas de la industria del gas. El óxido nitroso (N₂O), emitido principalmente por fertilizantes agrícolas, tiene un potencial de calentamiento 273 veces mayor que el CO₂.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama del ciclo del carbono mostrando los flujos naturales (fotosíntesis, respiración, intercambio oceánico) y la perturbación humana (combustibles fósiles, deforestación) en Gt C/año",
          caption: "La quema de combustibles fósiles introduce en el ciclo del carbono un flujo sin precedentes históricos.",
        },
      ],
    },
  },

  // ── 12 ── Ciclos biogeoquímicos ────────────────────────────────────────────
  {
    slug: "cneyt-iii-ciclo-nitrogeno",
    titulo: "El ciclo del nitrógeno: de la bacteria a la planta",
    categoria: "Ciclos biogeoquímicos",
    conceptos_clave: ["ciclo del nitrógeno", "fijación de nitrógeno", "nitrificación", "Rhizobium", "zonas muertas"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El nitrógeno (N) es esencial para la vida: forma parte de los aminoácidos, las proteínas y los ácidos nucleicos (ADN, ARN). La atmósfera es 78 % nitrógeno molecular (N₂), pero este gas es inerte y no puede ser usado directamente por la mayoría de los organismos. El ciclo del nitrógeno transforma el N₂ atmosférico en formas biológicamente disponibles y, eventualmente, lo devuelve a la atmósfera.",
        },
        {
          tipo: "subtitulo",
          contenido: "Las etapas del ciclo del nitrógeno",
        },
        {
          tipo: "lista",
          items: [
            "Fijación biológica del nitrógeno: bacterias especializadas (Rhizobium en simbiosis con leguminosas; cianobacterias en vida libre) convierten el N₂ en amoniaco (NH₃) usando la enzima nitrogenasa. Este es el único proceso natural que 'rompe' el triple enlace del N₂.",
            "Amonificación: los descomponedores degradan la materia orgánica nitrogenada (proteínas, ácidos nucleicos) y liberan amoniaco (NH₄⁺) al suelo.",
            "Nitrificación: bacterias nitrificantes (Nitrosomonas, Nitrobacter) oxidan el amoniaco a nitrito (NO₂⁻) y luego a nitrato (NO₃⁻), la forma que las plantas absorben principalmente.",
            "Asimilación: las plantas absorben nitrato o amoniaco del suelo e incorporan el nitrógeno a sus moléculas orgánicas. Los animales obtienen nitrógeno al consumir plantas u otros animales.",
            "Desnitrificación: bacterias anaerobias (Pseudomonas, Thiobacillus) convierten el nitrato de vuelta a N₂ y N₂O, cerrando el ciclo y devolviendo nitrógeno a la atmósfera.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "La perturbación humana: fertilizantes y zonas muertas",
        },
        {
          tipo: "parrafo",
          contenido:
            "El proceso Haber-Bosch, desarrollado en 1909, permite sintetizar amoniaco industrialmente a partir de N₂ y H₂. Es la base de los fertilizantes sintéticos de nitrógeno que sustentaron la Revolución Verde y multiplican la producción agrícola mundial. Sin embargo, gran parte del nitrógeno aplicado como fertilizante no es absorbido por los cultivos: se lixivia a ríos, lagos y finalmente al mar. En el Golfo de México, el exceso de nitrógeno proveniente de los campos agrícolas del Mississippi y de los ríos mexicanos alimenta proliferaciones masivas de algas (eutrofización), cuya descomposición consume todo el oxígeno disuelto, creando zonas hipóxicas o 'zonas muertas' donde la vida marina es imposible.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "La simbiosis entre las leguminosas (frijol, soya, alfalfa, cacahuate) y las bacterias Rhizobium es una de las más importantes del planeta: las plantas proveen carbono a las bacterias, y éstas fijan nitrógeno para la planta. El frijol negro (Phaseolus vulgaris), cultivo fundamental de la dieta mexicana, es una leguminosa que enriquece los suelos con nitrógeno sin necesidad de fertilizantes sintéticos.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama circular del ciclo del nitrógeno mostrando N₂ atmosférico, fijación bacteriana, nitrificación, asimilación por plantas, descomposición y desnitrificación",
          caption: "El ciclo del nitrógeno depende crucialmente de bacterias que realizan transformaciones químicas que ningún otro organismo puede hacer.",
        },
      ],
    },
  },

  // ── 13 ── Ciclos biogeoquímicos ────────────────────────────────────────────
  {
    slug: "cneyt-iii-ciclo-fosforo",
    titulo: "El ciclo del fósforo: el límite del crecimiento",
    categoria: "Ciclos biogeoquímicos",
    conceptos_clave: ["ciclo del fósforo", "nutriente limitante", "eutrofización", "roca fosfórica", "sedimentario"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El fósforo (P) es un macronutriente esencial para todos los seres vivos: componente fundamental del ADN, ARN, ATP (la moneda energética de la célula), fosfolípidos de las membranas celulares y del tejido óseo. A diferencia del carbono, el nitrógeno o el agua, el fósforo no tiene una fase gaseosa significativa en su ciclo. Es un ciclo sedimentario: el fósforo se libera lentamente de las rocas por meteorización y viaja disuelto hacia los océanos, donde se deposita en sedimentos que tardan millones de años en volver a la superficie.",
        },
        {
          tipo: "subtitulo",
          contenido: "El ciclo sedimentario del fósforo",
        },
        {
          tipo: "lista",
          items: [
            "Meteorización de rocas: la roca fosfórica (apatita) se desintegra lentamente por la acción del agua y los ácidos liberados por las raíces y los microorganismos del suelo, liberando fosfatos (PO₄³⁻).",
            "Absorción por plantas: las plantas y microorganismos del suelo absorben los fosfatos disueltos. Los animales obtienen fósforo al consumir plantas u otros organismos.",
            "Descomposición: cuando los organismos mueren, los descomponedores liberan el fósforo orgánico de vuelta al suelo como fosfato inorgánico.",
            "Lixiviación: el fósforo que no es retenido por el suelo se lava hacia ríos y océanos, donde queda incorporado en sedimentos marinos.",
            "Roca fosfórica nueva: los sedimentos marinos, bajo millones de años de presión geológica y procesos de elevación cortical, forman nuevas rocas fosfóricas. Este proceso puede tardar entre 10 y 100 millones de años.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "El fósforo como factor limitante y la eutrofización",
        },
        {
          tipo: "parrafo",
          contenido:
            "En la mayoría de los ecosistemas terrestres, el nitrógeno es el nutriente limitante del crecimiento vegetal. Pero en los ecosistemas de agua dulce —lagos, ríos, estanques— el fósforo suele ser el factor limitante. Cuando el fósforo llega en exceso a un lago (por descarga de aguas residuales domésticas, fertilizantes o detergentes), se produce eutrofización: proliferación masiva de algas que bloquea la luz solar, reduce el oxígeno disuelto y mata peces y otros organismos acuáticos. La eutrofización de ríos y lagos en México —como el lago de Pátzcuaro y los cuerpos de agua del Valle de México— es un grave problema ambiental.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Las reservas mundiales de roca fosfórica son finitas y no renovables en escala humana. Las estimaciones sugieren que las reservas económicamente explotables se agotarán en los próximos 50-300 años. Dado que el fósforo es insustituible en la agricultura (no existe equivalente sintético como para el nitrógeno con el proceso Haber-Bosch), su agotamiento es considerado una amenaza seria para la seguridad alimentaria global.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama del ciclo del fósforo mostrando meteorización de rocas, absorción por plantas, descomposición, lixiviación a ríos y sedimentación en el fondo marino",
          caption: "El ciclo del fósforo es un ciclo sedimentario sin fase gaseosa, lo que lo hace especialmente vulnerable a interrupciones.",
        },
      ],
    },
  },

  // ── 14 ── Cambio climático ─────────────────────────────────────────────────
  {
    slug: "cneyt-iii-cambio-climatico-causas",
    titulo: "El cambio climático: causas científicas y evidencias",
    categoria: "Cambio climático",
    conceptos_clave: ["cambio climático", "gases de efecto invernadero", "IPCC", "temperatura global", "INECC"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El cambio climático se refiere a los cambios estadísticamente significativos en el estado medio del clima de la Tierra atribuibles directa o indirectamente a la actividad humana. Hay que distinguirlo de la variabilidad climática natural (glaciaciones, ciclos de Milankovitch, variaciones solares): el actual calentamiento global es atribuido con más del 95 % de certeza al aumento de las concentraciones de gases de efecto invernadero (GEI) de origen antropogénico, según el Sexto Informe de Evaluación del IPCC (2021-2022).",
        },
        {
          tipo: "subtitulo",
          contenido: "La evidencia científica del cambio climático",
        },
        {
          tipo: "lista",
          items: [
            "Temperatura: la temperatura media global ha aumentado aproximadamente 1.1 °C desde la era preindustrial (1850-1900). Los últimos 10 años (2014-2023) son los más cálidos registrados.",
            "CO₂ atmosférico: superó las 425 ppm en 2024, el nivel más alto en más de 3 millones de años. Núcleos de hielo en Antártida muestran que en ningún período interglacial anterior se superaron las 300 ppm.",
            "Nivel del mar: ha subido aproximadamente 20 cm desde 1900 y el ritmo de ascenso se acelera (actualmente 3.7 mm/año) debido al derretimiento de hielo y la expansión térmica del agua.",
            "Retroceso de glaciares: los glaciares de montaña en todo el mundo, incluidos los de los volcanes mexicanos, están retrocediendo a tasas sin precedentes históricos.",
            "Acidificación oceánica: los océanos han absorbido el 30 % del CO₂ emitido por el ser humano, reduciendo su pH de 8.2 a 8.1, un cambio que amenaza a organismos con conchas de carbonato (corales, moluscos, algunos plancton).",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "México ante el cambio climático",
        },
        {
          tipo: "parrafo",
          contenido:
            "Según el Instituto Nacional de Ecología y Cambio Climático (INECC), México emite aproximadamente 683 Mt CO₂eq por año (datos 2019), lo que representa el 1.4 % de las emisiones globales —una proporción modesta pero no insignificante. La mayor parte proviene del sector energético (transporte y generación eléctrica) y la agricultura y ganadería. México es al mismo tiempo uno de los países más vulnerables al cambio climático: su diversidad de ecosistemas costeros, su agricultura dependiente de lluvias y su alta densidad de población en zonas de riesgo lo hacen especialmente expuesto.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El IPCC (Grupo Intergubernamental de Expertos sobre el Cambio Climático) es el organismo científico de la ONU que evalúa la evidencia sobre el cambio climático. Sus informes, elaborados por miles de científicos de todo el mundo, son la base para las negociaciones climáticas internacionales como el Acuerdo de París (2015), al que México se adhirió comprometiéndose a reducir sus emisiones un 22 % para 2030.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Gráfica de barras mostrando la temperatura global anual desde 1880 hasta 2023 con colores que van del azul (años fríos) al rojo intenso (años más cálidos)",
          caption: "La tendencia de calentamiento global es inequívoca en los registros instrumentales.",
        },
      ],
    },
  },

  // ── 15 ── Cambio climático ─────────────────────────────────────────────────
  {
    slug: "cneyt-iii-impactos-mexico",
    titulo: "Impactos del cambio climático en México",
    categoria: "Cambio climático",
    conceptos_clave: ["sequía", "huracanes", "nivel del mar", "arrecifes de coral", "INECC", "vulnerabilidad"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "México es uno de los países más vulnerables al cambio climático debido a la combinación de su diversidad de ecosistemas, la extensión de sus costas (más de 11,000 km), la dependencia agrícola de las lluvias y la concentración de millones de personas en zonas de riesgo. Según proyecciones del INECC (Instituto Nacional de Ecología y Cambio Climático), sin medidas de mitigación, la temperatura media en México podría aumentar entre 2 y 4 °C para 2050, con impactos profundos en todos los sectores.",
        },
        {
          tipo: "subtitulo",
          contenido: "Principales impactos observados y proyectados",
        },
        {
          tipo: "lista",
          items: [
            "Sequías en el norte: el norte y centro de México —ya áridos— experimentan sequías más frecuentes, extensas e intensas. La región que abarca Chihuahua, Sonora, Coahuila y Durango ha sufrido sequías severas que afectan la ganadería, la agricultura y el abastecimiento de agua de ciudades como Monterrey.",
            "Intensificación de huracanes: el Golfo de México y el Caribe mexicano son fuentes de energía para los huracanes, cuya intensidad máxima aumenta con la temperatura del mar. Huracanes de categoría 4 y 5 que antes eran raros son cada vez más frecuentes, afectando Quintana Roo, Tabasco y Veracruz.",
            "Ascenso del nivel del mar en Yucatán: la Península de Yucatán, con terreno extremadamente plano y baja elevación, es vulnerable al ascenso del nivel del mar. Ciudades costeras como Campeche y Mérida, así como comunidades mayas, enfrentan riesgo de inundación y salinización de acuíferos.",
            "Blanqueamiento de arrecifes de coral: el Sistema Arrecifal Mesoamericano, el segundo más grande del mundo, ha sufrido episodios severos de blanqueamiento (pérdida de algas simbióticas por el calentamiento del agua) en 2005, 2010 y 2015-2016, con mortandades masivas de coral.",
            "Desplazamiento de especies: el calentamiento desplaza las zonas de distribución de muchas especies hacia altitudes y latitudes más altas. Especies endémicas en montañas —como el pez tiro montano en Jalisco— no tienen a dónde ir cuando el clima cambia.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Los impactos del cambio climático no son igualitarios: los pueblos indígenas, las comunidades rurales y las personas en situación de pobreza —que menos han contribuido al problema— son los más vulnerables. Las comunidades pesqueras del Golfo de California dependen de recursos marinos que el calentamiento y la acidificación del océano están degradando. La justicia climática reconoce que la responsabilidad de actuar recae sobre quienes más han emitido.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Mapa de México con íconos que señalan los impactos del cambio climático por región: sequías en el norte, huracanes en el sur-sureste, ascenso del nivel del mar en Yucatán y blanqueamiento de coral en el Caribe",
          caption: "Los impactos del cambio climático afectan de manera diferenciada las regiones de México.",
        },
      ],
    },
  },

  // ── 16 ── Cambio climático ─────────────────────────────────────────────────
  {
    slug: "cneyt-iii-deforestacion-datos",
    titulo: "Deforestación en México: datos, causas y consecuencias",
    categoria: "Cambio climático",
    conceptos_clave: ["deforestación", "SEMARNAT", "servicios ecosistémicos", "cobertura forestal", "Chiapas"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La deforestación —la conversión permanente de tierras forestales a otros usos— es uno de los principales problemas ambientales de México y del mundo. Según SEMARNAT, México perdió aproximadamente el 50 % de su cobertura forestal original en el siglo XX. Aunque las tasas de deforestación han disminuido en los últimos años gracias a programas de conservación y vigilancia satelital, el país aún pierde decenas de miles de hectáreas anuales de bosques y selvas.",
        },
        {
          tipo: "subtitulo",
          contenido: "Causas principales de la deforestación en México",
        },
        {
          tipo: "lista",
          items: [
            "Expansión agropecuaria: la apertura de tierras para cultivo y pastoreo es la causa número uno. En Chiapas, Oaxaca, Veracruz y Tabasco, las selvas y bosques de niebla son reemplazados por potreros para ganado y plantaciones de palma de aceite.",
            "Tala ilegal: la extracción ilegal de madera preciosa (caoba, cedro) en la Selva Lacandona y otras regiones es una amenaza persistente.",
            "Incendios forestales: a menudo asociados con la preparación de tierras para agricultura mediante roza-tumba-quema. El cambio climático aumenta la frecuencia e intensidad de los incendios.",
            "Expansión urbana: el crecimiento de ciudades y la construcción de infraestructura (carreteras, proyectos turísticos) fragmentan los ecosistemas forestales.",
            "Plantaciones forestales comerciales: la sustitución de bosques nativos por monocultivos de pino o eucalipto reduce la biodiversidad aunque mantenga cobertura arbórea.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Consecuencias ambientales y servicios perdidos",
        },
        {
          tipo: "parrafo",
          contenido:
            "Los bosques y selvas proporcionan servicios ecosistémicos vitales: regulación del ciclo del agua (recarga de acuíferos, reducción de inundaciones), captura de carbono, control de la erosión, conservación de la biodiversidad, regulación del microclima y provisión de recursos forestales no maderables. Al deforestarse, estos servicios se pierden: los suelos se erosionan, los ríos se azolvan, las lluvias disminuyen y las comunidades rurales que dependían del bosque quedan en mayor vulnerabilidad.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "El programa PAGO POR SERVICIOS AMBIENTALES de la CONAFOR (Comisión Nacional Forestal) compensa económicamente a ejidos y comunidades indígenas que conservan sus bosques. El reconocimiento económico del valor de los servicios ecosistémicos —como la captura de carbono— es una herramienta clave para hacer que conservar el bosque sea más rentable que talarlo.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Imagen comparativa de satélite de la Selva Lacandona en 1990 y 2020, mostrando la fragmentación de la cobertura forestal por deforestación",
          caption: "Las imágenes satelitales documentan la pérdida de cobertura forestal en México a lo largo de las décadas.",
        },
      ],
    },
  },

  // ── 17 ── Cambio climático ─────────────────────────────────────────────────
  {
    slug: "cneyt-iii-contaminacion-ambiental",
    titulo: "Contaminación ambiental: agua, aire y suelo",
    categoria: "Cambio climático",
    conceptos_clave: ["contaminación", "calidad del aire", "SIMAT", "contaminación del agua", "plástico"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La contaminación ambiental es la introducción de sustancias o energía en el ambiente —agua, aire, suelo— en concentraciones que causan efectos adversos sobre los seres vivos, los ecosistemas o los bienes materiales. Es una consecuencia directa de los patrones de producción y consumo de las sociedades industriales. México enfrenta serios problemas de contaminación en sus tres dimensiones: aire, agua y suelo.",
        },
        {
          tipo: "subtitulo",
          contenido: "Contaminación del aire: el caso de la Ciudad de México",
        },
        {
          tipo: "parrafo",
          contenido:
            "La Ciudad de México fue durante décadas una de las ciudades con peor calidad del aire del mundo. La combinación de su ubicación en una cuenca rodeada de montañas (que dificulta la dispersión de contaminantes), su altitud (1,800 msnm, donde el combustible no se quema completamente), su enorme parque vehicular y la actividad industrial generan altas concentraciones de ozono (O₃), partículas finas (PM2.5), óxidos de nitrógeno (NOₓ) y compuestos orgánicos volátiles. El Sistema de Monitoreo Atmosférico (SIMAT) opera una red de más de 30 estaciones de monitoreo en la ZMCDMX. Las precontingencias y contingencias ambientales se declaran cuando los niveles superan las normas oficiales.",
        },
        {
          tipo: "subtitulo",
          contenido: "Contaminación del agua",
        },
        {
          tipo: "lista",
          items: [
            "Aguas residuales domésticas: México todavía no trata el 100 % de sus aguas residuales. Los ríos Lerma, Santiago, Atoyac y Tula reciben descargas sin tratar de ciudades e industrias.",
            "Contaminación agrícola: plaguicidas y fertilizantes lixiviados contaminan acuíferos y cuerpos de agua superficiales.",
            "Metales pesados industriales: mercurio, plomo, cadmio y arsénico son descargados por la industria minera y manufacturera, acumulándose en sedimentos y organismos acuáticos.",
            "Plásticos y microplásticos: se han detectado microplásticos en ríos, lagunas costeras y en ambas costas mexicanas. El Golfo de México recibe millones de toneladas de residuos plásticos anuales.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La contaminación por plásticos es un problema emergente de dimensiones globales. Los plásticos no se biodegradan: se fragmentan en partículas cada vez más pequeñas (microplásticos y nanoplásticos) que ingresan a las cadenas alimentarias. Se han encontrado microplásticos en peces comerciales mexicanos del Golfo de México y del Pacífico, en la sal de mar y en el agua de lluvia. Los efectos crónicos sobre la salud humana están siendo investigados activamente.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Tríptico que muestra tres tipos de contaminación: humo industrial sobre una ciudad (aire), residuos plásticos en una playa mexicana (agua) y suelo erosionado con residuos (suelo)",
          caption: "La contaminación ambiental afecta simultáneamente el aire, el agua y el suelo.",
        },
      ],
    },
  },

  // ── 18 ── Sustentabilidad y conservación ───────────────────────────────────
  {
    slug: "cneyt-iii-areas-naturales-protegidas",
    titulo: "Áreas Naturales Protegidas en México",
    categoria: "Sustentabilidad y conservación",
    conceptos_clave: ["ANP", "CONANP", "Reserva de la Biosfera", "Sian Ka'an", "Mariposa Monarca", "conservación"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Las Áreas Naturales Protegidas (ANP) son zonas del territorio nacional —terrestre o marino— en las que el ambiente original no ha sido esencialmente alterado por la actividad humana, o que por sus características requieren ser preservadas. En México, el Sistema Nacional de Áreas Naturales Protegidas (SINAP) es administrado por la Comisión Nacional de Áreas Naturales Protegidas (CONANP) y comprende más de 182 ANP que cubren aproximadamente el 12.5 % del territorio terrestre y el 22 % de los mares mexicanos.",
        },
        {
          tipo: "subtitulo",
          contenido: "Categorías de ANP en México",
        },
        {
          tipo: "lista",
          items: [
            "Reservas de la Biosfera: las de mayor superficie y complejidad. Tienen una zona núcleo (protección estricta), zona de amortiguamiento y zona de transición donde se permiten actividades humanas compatibles. México tiene 44 reservas de la biosfera reconocidas por la UNESCO.",
            "Parques Nacionales: protegen ecosistemas representativos con alto valor escénico, científico y educativo. Se permiten actividades de recreación no extractiva.",
            "Monumentos Naturales: áreas que protegen elementos naturales específicos por su valor histórico, científico o estético (una formación geológica, un árbol de gran edad).",
            "Áreas de Protección de Flora y Fauna: protegen una o varias especies de flora o fauna silvestres amenazadas.",
            "Santuarios: protegen ecosistemas frágiles o hábitats críticos de una especie.",
            "Áreas de Protección de Recursos Naturales: enfocadas en la conservación del suelo, el agua y la biodiversidad en zonas con aprovechamiento regulado.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Áreas emblemáticas",
        },
        {
          tipo: "parrafo",
          contenido:
            "La Reserva de la Biosfera de la Mariposa Monarca en los estados de México y Michoacán protege los bosques de oyamel donde millones de mariposas monarca (Danaus plexippus) hibernan cada año tras migrar más de 4,000 km desde Canadá y Estados Unidos. Es Patrimonio Mundial de la UNESCO. La Reserva de la Biosfera Sian Ka'an en Quintana Roo (también Patrimonio Mundial) protege un sistema costero con selvas tropicales, manglares, arrecifes de coral y lagunas. La Reserva de la Biosfera El Vizcaíno en Baja California Sur es el ANP más grande de México y alberga la laguna Ojo de Liebre, donde la ballena gris se reproduce.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Las ANP no son solo para la biodiversidad: también protegen los servicios ecosistémicos de los que dependen millones de personas. La cuenca del Nevado de Toluca —área protegida— provee agua a la Ciudad de México y a Toluca. El manejo efectivo de las ANP requiere la participación activa de las comunidades locales que conviven con ellas.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Mapa de México con las principales Áreas Naturales Protegidas resaltadas, con íconos representando Mariposa Monarca (Michoacán), Sian Ka'an (Quintana Roo) y El Vizcaíno (Baja California Sur)",
          caption: "El SINAP cubre más del 12 % del territorio terrestre de México.",
        },
      ],
    },
  },

  // ── 19 ── Sustentabilidad y conservación ───────────────────────────────────
  {
    slug: "cneyt-iii-conabio-conservacion",
    titulo: "La CONABIO: conocer la biodiversidad para conservarla",
    categoria: "Sustentabilidad y conservación",
    conceptos_clave: ["CONABIO", "SNIB", "NaturaLista", "ciencia ciudadana", "política ambiental", "biodiversidad"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La Comisión Nacional para el Conocimiento y Uso de la Biodiversidad (CONABIO) fue creada en 1992 —el mismo año de la Cumbre de la Tierra de Río de Janeiro— con un mandato único en el mundo: ser el organismo del Estado mexicano encargado de generar, integrar y difundir el conocimiento sobre la biodiversidad de México para apoyar su conservación y uso sustentable. No es una dependencia ejecutiva que gestiona territorios, sino un organismo de información científica y política al servicio de las instituciones y la sociedad.",
        },
        {
          tipo: "subtitulo",
          contenido: "El Sistema Nacional de Información sobre Biodiversidad (SNIB)",
        },
        {
          tipo: "parrafo",
          contenido:
            "El SNIB es la mayor base de datos sobre biodiversidad de México: concentra más de 14 millones de registros de la distribución de especies en el territorio nacional, provenientes de colecciones científicas, literatura, expediciones y ciencia ciudadana. Esta información es pública y accesible en línea, y es fundamental para la toma de decisiones en materia de ordenamiento territorial, evaluación de impacto ambiental y diseño de áreas protegidas. México es uno de los países con mayor disponibilidad pública de datos sobre biodiversidad en el mundo.",
        },
        {
          tipo: "subtitulo",
          contenido: "NaturaLista: ciencia ciudadana para la biodiversidad",
        },
        {
          tipo: "lista",
          items: [
            "NaturaLista es la plataforma mexicana de ciencia ciudadana para el registro de la biodiversidad, equivalente a iNaturalist a nivel global (con la que está integrada).",
            "Cualquier persona puede descargar la app, fotografiar una planta, animal o hongo, y la plataforma usa inteligencia artificial y la revisión de expertos para identificar la especie.",
            "Los registros generados por miles de ciudadanos enriquecen el SNIB con datos de distribución que las expediciones científicas no pueden cubrir.",
            "En México, NaturaLista ha generado millones de observaciones que han documentado la presencia de especies en lugares donde no se conocían, e incluso ayudado a descubrir nuevas especies para la ciencia.",
            "Participar en NaturaLista es una forma concreta de contribuir a la conservación de la biodiversidad desde cualquier lugar.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El principio fundamental de la CONABIO puede resumirse en una frase: no se puede conservar lo que no se conoce. La generación de datos sobre biodiversidad —quién vive dónde, en qué cantidades, en qué condiciones— es el fundamento de cualquier política ambiental efectiva. México es un modelo mundial en este sentido, con una infraestructura de información sobre biodiversidad que muchos países desarrollados envidian.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Captura de pantalla de la app NaturaLista mostrando el mapa de observaciones en México con puntos de colores representando registros de diferentes grupos taxonómicos",
          caption: "NaturaLista democratiza la ciencia al permitir que cualquier persona contribuya al conocimiento de la biodiversidad.",
        },
      ],
    },
  },

  // ── 20 ── Sustentabilidad y conservación ───────────────────────────────────
  {
    slug: "cneyt-iii-desarrollo-sustentable",
    titulo: "Desarrollo sustentable: tres pilares en equilibrio",
    categoria: "Sustentabilidad y conservación",
    conceptos_clave: ["desarrollo sustentable", "Brundtland", "ODS", "pilares de la sustentabilidad", "México"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El concepto de desarrollo sustentable fue definido en 1987 por la Comisión Mundial sobre el Medio Ambiente y el Desarrollo de la ONU (conocida como Comisión Brundtland, presidida por la noruega Gro Harlem Brundtland) como: 'el desarrollo que satisface las necesidades del presente sin comprometer la capacidad de las futuras generaciones para satisfacer sus propias necesidades.' Esta definición, aparentemente simple, esconde una tensión fundamental entre el desarrollo económico, la equidad social y la protección ambiental.",
        },
        {
          tipo: "subtitulo",
          contenido: "Los tres pilares de la sustentabilidad",
        },
        {
          tipo: "lista",
          items: [
            "Pilar económico: la sustentabilidad requiere sistemas económicos que generen riqueza y bienestar sin agotar los recursos naturales. Implica transitar de economías basadas en combustibles fósiles a energías renovables, y de patrones lineales de producción-consumo-desecho a economías circulares.",
            "Pilar social: el desarrollo sustentable debe ser justo y equitativo. No puede haber sustentabilidad ambiental si amplios sectores de la población viven en pobreza y son forzados a sobrexplotar los recursos para sobrevivir. La justicia social y la equidad de género son condiciones necesarias para la sustentabilidad.",
            "Pilar ambiental: los sistemas económicos y sociales dependen de los ecosistemas que proveen servicios: agua, aire limpio, alimentos, materias primas, regulación del clima. La sustentabilidad exige no superar los límites planetarios que garantizan la estabilidad de estos sistemas.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Los Objetivos de Desarrollo Sostenible (ODS)",
        },
        {
          tipo: "parrafo",
          contenido:
            "En 2015, los 193 países miembros de la ONU adoptaron la Agenda 2030, que incluye 17 Objetivos de Desarrollo Sostenible (ODS) y 169 metas específicas. Los ODS integran las tres dimensiones de la sustentabilidad: desde erradicar la pobreza (ODS 1) y el hambre (ODS 2), hasta garantizar agua limpia (ODS 6), energía asequible (ODS 7), acción por el clima (ODS 13) y vida submarina (ODS 14) y terrestre (ODS 15). México tiene avances desiguales en los ODS: ha reducido la pobreza extrema pero enfrenta grandes brechas en igualdad de género, calidad educativa y gestión ambiental.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La tensión entre desarrollo y conservación no es abstracta en México: el Tren Maya (proyecto de infraestructura turística en la Península de Yucatán) generó un debate intenso entre quienes veían en él una oportunidad de desarrollo regional y quienes alertaban sobre sus impactos en los ecosistemas kársticos, los cenotes, la selva y los pueblos mayas. No hay respuestas fáciles: la sustentabilidad exige evaluar estos casos con rigor científico, participación social y visión de largo plazo.",
        },
        {
          tipo: "cita",
          contenido:
            "El desarrollo sustentable no es un estado fijo de armonía, sino más bien un proceso de cambio en el cual la explotación de los recursos, la dirección de las inversiones, la orientación del desarrollo tecnológico y el cambio institucional están todos en armonía y refuerzan el potencial actual y futuro para satisfacer las necesidades y aspiraciones humanas.",
          fuente: "Comisión Brundtland, Nuestro Futuro Común, 1987",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de Venn con tres círculos entrelazados que representan los pilares económico, social y ambiental de la sustentabilidad, con 'sustentabilidad' en la intersección central",
          caption: "El desarrollo sustentable requiere el equilibrio simultáneo de los pilares económico, social y ambiental.",
        },
      ],
    },
  },

  // ── 21 ── Sustentabilidad y conservación ───────────────────────────────────
  {
    slug: "cneyt-iii-restauracion-ecosistemas",
    titulo: "Restauración de ecosistemas en México: experiencias y retos",
    categoria: "Sustentabilidad y conservación",
    conceptos_clave: ["restauración ecológica", "reforestación", "Mariposa Monarca", "manglares", "arrecifes de coral", "ONU"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La restauración ecológica es el proceso de asistir la recuperación de un ecosistema que ha sido degradado, dañado o destruido. A diferencia de la conservación —que protege lo que queda intacto— la restauración actúa sobre sistemas ya alterados, intentando recuperar su estructura, composición de especies y funciones ecológicas. En 2021, la ONU declaró la Década para la Restauración de Ecosistemas 2021-2030, reconociendo que la restauración es tan urgente como la mitigación del cambio climático.",
        },
        {
          tipo: "subtitulo",
          contenido: "Principios de la restauración ecológica",
        },
        {
          tipo: "lista",
          items: [
            "Usar especies nativas de la región, preferentemente de procedencia local, para respetar los genotipos adaptados a las condiciones ambientales del lugar.",
            "Eliminar o reducir las causas del deterioro antes de restaurar: si la presión persiste (sobrepastoreo, incendios recurrentes, extracción ilegal), la restauración será ineficiente.",
            "Facilitar la regeneración natural donde sea posible: a veces la mejor restauración es proteger el sitio y permitir que los procesos naturales actúen.",
            "Involucrar a las comunidades locales: los pobladores que viven cerca de los ecosistemas son aliados imprescindibles. Sin su participación, los proyectos de restauración fracasan a largo plazo.",
            "Monitorear el proceso: la restauración es un proceso dinámico que requiere seguimiento y ajustes continuos.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Experiencias de restauración en México",
        },
        {
          tipo: "parrafo",
          contenido:
            "El corredor biológico de la Mariposa Monarca en Michoacán y Estado de México ha sido objeto de uno de los mayores esfuerzos de reforestación del país: comunidades indígenas mazahua y purépecha han reforestado con oyamel (Abies religiosa) miles de hectáreas degradadas por la tala ilegal. Los resultados son visibles: la superficie de bosque de hibernación ha aumentado y las colonias de mariposas son más grandes. En el Caribe mexicano, proyectos como Coral Restoration Foundation México realizan trasplante de coral en viveros submarinos y siembran fragmentos en los arrecifes degradados del Sistema Arrecifal Mesoamericano. En Tabasco y Campeche, proyectos de restauración de manglares han recuperado miles de hectáreas de costas degradadas por la ganadería y la acuicultura, restaurando hábitats de pesca y protección costera.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "La restauración ecológica no significa volver el ecosistema a su estado original exacto —eso suele ser imposible— sino recuperar suficiente estructura y función para que el ecosistema se vuelva autosuficiente y resiliente. En un contexto de cambio climático, la restauración debe además considerar qué especies y configuraciones serán las más adaptadas al clima futuro, no solo al pasado.",
        },
        {
          tipo: "cita",
          contenido:
            "La restauración de ecosistemas puede proporcionar hasta un tercio de la mitigación del clima necesaria para mantenerse por debajo de los 2 °C de calentamiento global, además de detener la pérdida de biodiversidad y generar múltiples beneficios para las personas.",
          fuente: "PNUMA y FAO, Decade on Ecosystem Restoration 2021-2030",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Secuencia de tres imágenes mostrando la restauración de un manglar en Tabasco: sitio degradado, plantación de propágulos, y manglar joven en recuperación",
          caption: "La restauración de manglares en México combina conocimiento científico y participación comunitaria.",
        },
      ],
    },
  },
] as const;

// ---------------------------------------------------------------------------
// FUNCIÓN PRINCIPAL
// ---------------------------------------------------------------------------

export async function seedBibliotecaCNEYTIII(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed Biblioteca CNEYT-III (21 fichas)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac")
    .select("id")
    .eq("codigo", "CNEYT-III")
    .single();

  if (uacErr || !uacRow) {
    throw new Error(
      `UAC CNEYT-III no encontrada. Ejecuta primero seed-mccems.ts y seed-cneytiii.ts. Error: ${uacErr?.message}`
    );
  }

  const rows = FICHAS_CNEYTIII.map((f, i) => ({
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

  if (error) throw new Error(`Error seeding fichas CNEYT-III: ${error.message}`);

  console.log(`  ✓ ${rows.length} fichas de biblioteca de CNEYT-III insertadas/actualizadas.`);
  console.log("\n✅ Seed Biblioteca CNEYT-III completado.\n");
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
  seedBibliotecaCNEYTIII(sb).catch((err) => {
    console.error("❌ Error:", err.message);
    process.exit(1);
  });
}
