/**
 * Seed de fichas de biblioteca para LC-II (Lengua y Comunicación II).
 * 22 fichas temáticas alineadas al MCCEMS 2025, Semestre 2.
 *
 * Uso: npx tsx scripts/seed-fichas-lcii.ts
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

const FICHAS_LCII = [
  // ── 1 ── Escritura creativa ────────────────────────────────────────────────
  {
    slug: "lc-ii-narracion-autobiografica",
    titulo: "La narración autobiográfica",
    categoria: "Escritura creativa",
    conceptos_clave: ["autobiografía", "narrador en primera persona", "memoria", "voz propia"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La narración autobiográfica es el relato de experiencias propias contadas en primera persona. A diferencia de la autobiografía formal —género que abarca la vida completa de una persona—, el texto autobiográfico que se trabaja en bachillerato suele centrarse en un episodio significativo: un momento que marcó un antes y un después, que dejó una enseñanza o que simplemente permanece grabado en la memoria con una nitidez especial. Escribir sobre lo que has vivido no es vanidad: es un acto de conocimiento propio.",
        },
        {
          tipo: "subtitulo",
          contenido: "Por qué escribir desde la experiencia",
        },
        {
          tipo: "parrafo",
          contenido:
            "El escritor mexicano Juan Rulfo afirmó que sus cuentos nacían de la tierra y la gente que conoció de niño en Jalisco. Elena Poniatowska, por su parte, construyó gran parte de su obra dando voz a experiencias vividas o testimoniales. Escribir desde la experiencia propia no significa que el texto sea menos literario: significa que el escritor tiene acceso privilegiado a detalles sensoriales, emociones auténticas y matices que ninguna investigación puede reproducir. Tu historia es material literario.",
        },
        {
          tipo: "subtitulo",
          contenido: "Cómo estructurar una narración autobiográfica",
        },
        {
          tipo: "lista",
          items: [
            "Elige un episodio concreto y acotado, no toda tu vida. Cuanto más específico sea el momento, más potente será el relato.",
            "Sitúa al lector: ¿dónde y cuándo sucedió? Los detalles del lugar crean presencia y veracidad.",
            "Muestra, no solo cuentes: en lugar de 'estaba asustado', describe las manos que temblaban, la voz que se quebraba.",
            "Incluye el pensamiento y la emoción del yo narrador: el lector quiere saber no solo qué pasó sino qué sentiste.",
            "Cierra con una reflexión o imagen que dé sentido al episodio sin explicarlo todo.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La narración autobiográfica trabaja con la memoria, que no es perfecta ni objetiva. Es válido reconstruir diálogos aproximados, ordenar los hechos de modo distinto al cronológico o fusionar varios recuerdos en uno si eso hace el texto más verdadero en términos emocionales. Lo que importa es la autenticidad de la experiencia, no la exactitud del reportero.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Cuaderno abierto con una pluma sobre él; al fondo, imágenes borrosas que representan recuerdos",
          caption: "Escribir desde la memoria es una forma de explorar la propia identidad.",
        },
        {
          tipo: "cita",
          contenido:
            "Escribir es una forma de liberar la voz que no siempre puede hablar en voz alta.",
          fuente: "Elena Poniatowska, periodista y escritora mexicana",
        },
      ],
    },
  },

  // ── 2 ── Escritura creativa ────────────────────────────────────────────────
  {
    slug: "lc-ii-voz-narrativa-propia",
    titulo: "Voz propia y estilo personal en la escritura",
    categoria: "Escritura creativa",
    conceptos_clave: ["voz narrativa", "estilo", "tono", "identidad del escritor"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La voz de un escritor es esa cualidad intangible que hace que, al leer un párrafo, podamos reconocer quién lo escribió aunque no veamos la firma. Es la suma de las decisiones que tomamos al escribir: la longitud de nuestras oraciones, el vocabulario que preferimos, el ritmo que le damos al texto, los temas que nos obsesionan, la distancia con la que miramos al mundo. Desarrollar una voz propia no es un privilegio de los escritores consagrados: es el resultado de escribir con honestidad y con atención.",
        },
        {
          tipo: "subtitulo",
          contenido: "Los elementos de la voz narrativa",
        },
        {
          tipo: "lista",
          items: [
            "Tono: la actitud emocional del narrador frente a lo que cuenta. Puede ser irónico, tierno, distante, urgente, melancólico.",
            "Ritmo: la velocidad y cadencia de las oraciones. Rulfo usa frases cortas y cortantes; Poniatowska tiende a párrafos más fluidos y acumulativos.",
            "Punto de vista: el ángulo desde el que se mira la historia. Un mismo hecho narrado por distintas voces produce textos radicalmente diferentes.",
            "Vocabulario: las palabras que elegimos revelan quiénes somos. El argot regional, los tecnicismos, los arcaísmos o la sencillez del habla cotidiana son marcas de identidad.",
            "Temas recurrentes: los escritores vuelven una y otra vez a los mismos territorios. Esos obsesiones son parte de su voz.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "El escritor Carlos Monsiváis desarrolló una voz inconfundible en la crónica mexicana: irónica, erudita y popular al mismo tiempo, capaz de citar a Oscar Wilde y a un cantante de cumbia en el mismo párrafo. Su estilo surgió de leer mucho y de escribir con honestidad sobre lo que le apasionaba.",
        },
        {
          tipo: "subtitulo",
          contenido: "Cómo encontrar tu voz",
        },
        {
          tipo: "parrafo",
          contenido:
            "La voz no se inventa: se descubre. Se descubre escribiendo con regularidad, leyendo con atención y preguntándote qué es lo que te distingue como observador del mundo. Un ejercicio útil es leer en voz alta lo que escribes: si el texto suena a ti, si lo reconocerías como tuyo entre diez textos anónimos, tu voz está emergiendo. Si suena a alguien más, sigue explorando. La imitación consciente de escritores que admiras es un paso válido en el proceso: todos los escritores empezaron imitando a sus maestros.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Varios cuadernos de distintos colores apilados, cada uno representando la voz de un escritor diferente",
          caption: "Cada escritor construye una voz a través de la práctica y la lectura constante.",
        },
      ],
    },
  },

  // ── 3 ── Escritura creativa ────────────────────────────────────────────────
  {
    slug: "lc-ii-escritura-descriptiva",
    titulo: "La escritura descriptiva: retratar el mundo con palabras",
    categoria: "Escritura creativa",
    conceptos_clave: ["descripción literaria", "detalles sensoriales", "figura de dicción", "ekphrasis"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Describir no es enumerar características: es construir una presencia en la imaginación del lector. Una buena descripción literaria activa los cinco sentidos, elige detalles que revelan más que lo que muestran y usa el lenguaje de manera que el lector no solo vea el objeto o el lugar, sino que lo sienta. Juan Rulfo describe el pueblo de Comala en Pedro Páramo con una economía de palabras brutal: el calor, el polvo y el silencio bastan para hacer sentir la muerte que impregna ese lugar.",
        },
        {
          tipo: "subtitulo",
          contenido: "El poder del detalle específico",
        },
        {
          tipo: "parrafo",
          contenido:
            "El error más común en la escritura descriptiva es la vaguedad: 'un árbol grande', 'una casa bonita', 'una mujer elegante'. Esas frases no crean imagen. En cambio, 'un ahuehuete de corteza resquebrajada cuyas raíces levantaban las losas del camino' sitúa al lector en un paisaje concreto. El detalle específico —el tipo de árbol, la condición de su corteza, el efecto que produce— es lo que da vida a la descripción. Pregúntate siempre: ¿qué hace exactamente especial a este objeto, persona o lugar?",
        },
        {
          tipo: "subtitulo",
          contenido: "Recursos para una descripción viva",
        },
        {
          tipo: "lista",
          items: [
            "Detalles sensoriales: no solo lo que se ve, sino lo que se escucha (el crujido del piso de madera), lo que se huele (el olor a tierra mojada), lo que se toca (la aspereza de la pared de adobe), lo que se saborea.",
            "Comparaciones e imágenes: 'el cielo era del color de una cicatriz' comunica más que 'el cielo estaba gris'.",
            "Movimiento y cambio: describir algo en movimiento o en proceso de transformación es más dinámico que describir algo estático.",
            "Punto de vista selectivo: no describas todo; elige los detalles que más revelan sobre el personaje o el estado emocional de la escena.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La descripción tiene una función narrativa: no es un adorno que interrumpe la historia, sino un elemento que construye el tono, establece el ambiente y revela el mundo interior de los personajes. Cuando describes el cuarto de alguien, estás describiendo a esa persona.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Paleta de pintor junto a un texto manuscrito, simbolizando que escribir y pintar son actos de representación del mundo",
          caption: "La descripción literaria convierte las palabras en imágenes sensoriales.",
        },
      ],
    },
  },

  // ── 4 ── Escritura creativa ────────────────────────────────────────────────
  {
    slug: "lc-ii-como-crear-personajes",
    titulo: "Cómo crear personajes memorables",
    categoria: "Escritura creativa",
    conceptos_clave: ["personaje redondo", "caracterización", "motivación", "arco del personaje"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Los grandes personajes de la literatura son tan reales en la memoria de los lectores que parecen haber existido. Pienso en la Malinche de Rosario Castellanos, en el Pedro Páramo de Juan Rulfo, en la Jesusa Palancares que Elena Poniatowska rescató del olvido en Hasta no verte Jesús mío. ¿Qué hace que un personaje trascienda la página? No es la perfección moral ni la belleza: es la complejidad, la contradicción y la coherencia interna.",
        },
        {
          tipo: "subtitulo",
          contenido: "Dimensiones de un personaje",
        },
        {
          tipo: "lista",
          items: [
            "Dimensión física: rasgos visibles, forma de vestir, manera de moverse. No se trata de describir todo, sino los detalles que lo individualizan.",
            "Dimensión psicológica: deseos, miedos, creencias, contradicciones. Un personaje sin vida interior es un maniquí.",
            "Dimensión social: de dónde viene, con quién se relaciona, qué lugar ocupa en su comunidad. El contexto social forma a las personas.",
            "Dimensión moral: qué decisiones toma cuando está bajo presión. El carácter se revela en la dificultad, no en la comodidad.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "El arco del personaje",
        },
        {
          tipo: "parrafo",
          contenido:
            "Un personaje dinámico cambia a lo largo de la historia: aprende, pierde algo, se corrompe o se redime. Este cambio se llama arco del personaje. Para que el arco sea creíble, el cambio debe surgir de las experiencias que el personaje vive en la historia, no de una decisión arbitraria del narrador. El lector debe poder trazar el camino que llevó al personaje de quien era al principio a quien es al final.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Una técnica útil para crear personajes es la 'entrevista imaginaria': antes de escribir, siéntate con tu personaje y hazle preguntas que no aparecerán en el texto: ¿cuál es tu mayor vergüenza? ¿qué harías si supieras que nadie te vería? ¿qué objeto llevas siempre contigo? Las respuestas nutren la escritura aunque nunca aparezcan de forma directa.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Boceto de personaje con flechas apuntando a diferentes dimensiones: física, psicológica, social y moral",
          caption: "Un personaje literario es la suma de sus dimensiones visibles e invisibles.",
        },
      ],
    },
  },

  // ── 5 ── Escritura creativa ────────────────────────────────────────────────
  {
    slug: "lc-ii-construccion-de-escenarios",
    titulo: "La construcción de escenarios narrativos",
    categoria: "Escritura creativa",
    conceptos_clave: ["espacio narrativo", "atmósfera", "cronotopo", "lugar literario"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El escenario de una narración no es simplemente el lugar donde ocurren los hechos: es una presencia activa que moldea a los personajes, genera atmósfera y contribuye al sentido de la historia. Comala, el pueblo fantasma de Pedro Páramo, no es solo un decorado: es la expresión espacial del vacío moral y la muerte que dominan la novela. La Ciudad de México de Carlos Monsiváis es un personaje colectivo en sus crónicas. El espacio narrativo tiene vida propia.",
        },
        {
          tipo: "subtitulo",
          contenido: "Espacio físico y espacio emocional",
        },
        {
          tipo: "parrafo",
          contenido:
            "El teórico ruso Mijaíl Bajtín acuñó el término 'cronotopo' para describir la fusión indisoluble de espacio y tiempo en la literatura. En una narración, el lugar donde ocurren los hechos y el momento en que ocurren son inseparables. Un mismo cuarto puede ser acogedor o amenazante según el momento del día, el estado del personaje y los hechos que en él suceden. Construir un escenario literario implica construir simultáneamente un estado emocional.",
        },
        {
          tipo: "subtitulo",
          contenido: "Claves para construir el escenario",
        },
        {
          tipo: "lista",
          items: [
            "Ancla en detalles concretos: un lugar sin detalles específicos no existe en la mente del lector.",
            "Usa el escenario para revelar información: el estado de una habitación nos dice algo sobre quien la habita.",
            "Conecta el espacio con la acción: los escenarios que interactúan con los personajes (una puerta que rechina, un callejón sin salida) son más poderosos que los puramente decorativos.",
            "Varía la distancia descriptiva: alterna entre panorámica (el barrio, la ciudad) y primer plano (el detalle del suelo, la mancha de humedad en la pared).",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Evita el error de interrumpir la acción con bloques de descripción. Los mejores escritores integran el escenario en el movimiento de la narración: el personaje camina y nosotros vemos el lugar a través de su mirada en movimiento. La descripción estática y detallada al inicio de una escena es la trampa del escritor principiante.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Plano de un pueblo ficticio con marcas que señalan lugares clave de la narración: la plaza, la casa del protagonista, el callejón oscuro",
          caption: "El mapa de un escenario narrativo ayuda al escritor a mantener la coherencia espacial.",
        },
      ],
    },
  },

  // ── 6 ── Escritura creativa ────────────────────────────────────────────────
  {
    slug: "lc-ii-reescritura-proceso-creativo",
    titulo: "La reescritura como proceso creativo",
    categoria: "Escritura creativa",
    conceptos_clave: ["revisión", "borrador", "edición", "proceso de escritura"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Uno de los mitos más dañinos sobre la escritura es el del genio que produce textos perfectos en un solo impulso. La realidad es otra: todos los grandes escritores reescriben, muchas veces. Octavio Paz revisaba sus poemas durante años. Gabriel García Márquez afirmó que cada página de Cien años de soledad le costaba días de trabajo. La reescritura no es señal de fracaso: es la esencia del proceso creativo.",
        },
        {
          tipo: "subtitulo",
          contenido: "Las etapas del proceso de escritura",
        },
        {
          tipo: "lista",
          items: [
            "Preescritura: exploración de ideas mediante mapas mentales, listas, escritura libre o conversación. El objetivo es generar material sin juzgarlo.",
            "Borrador: escribir sin detenerse a corregir. El borrador es la materia prima, no el producto terminado. Permítete escribir mal.",
            "Revisión de fondo: releer con distancia para evaluar la estructura, la coherencia y la claridad. ¿La historia llega a donde quería llegar? ¿Los personajes son creíbles?",
            "Revisión de detalle: trabajar frase por frase. ¿Hay palabras que sobran? ¿Hay oraciones confusas? ¿El ritmo es el adecuado?",
            "Corrección final: revisar ortografía, puntuación y formato.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "El escritor Ernest Hemingway recomendaba dejar reposar el texto al menos una noche antes de revisarlo. La distancia temporal permite leer con ojos frescos y detectar problemas que la cercanía emocional ocultaba. En proyectos más largos, algunos escritores esperan semanas o meses antes de hacer la revisión de fondo.",
        },
        {
          tipo: "parrafo",
          contenido:
            "En el modelo MCCEMS 2025, la escritura se concibe como un proceso cíclico y social: no se escribe solo para uno mismo, sino para ser leído. Por eso la reescritura incluye también la retroalimentación de los compañeros: leer el trabajo de otros y recibir comentarios sobre el propio es parte indispensable del desarrollo como escritor. Un buen taller literario no juzga: observa, pregunta y sugiere.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Ciclo circular con las cinco etapas del proceso de escritura: preescritura, borrador, revisión de fondo, revisión de detalle y corrección final",
          caption: "El proceso de escritura es cíclico: la revisión puede llevar de vuelta al borrador.",
        },
      ],
    },
  },

  // ── 7 ── Narrativa literaria ───────────────────────────────────────────────
  {
    slug: "lc-ii-la-voz-en-primera-persona",
    titulo: "La voz narrativa en primera persona",
    categoria: "Narrativa literaria",
    conceptos_clave: ["narrador protagonista", "focalización interna", "monólogo interior", "perspectiva"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Cuando una historia se cuenta en primera persona, el lector accede al mundo a través de la mente de un único personaje. Todo lo que sabemos, lo sabemos porque ese narrador-protagonista lo percibe, recuerda o interpreta. Es una perspectiva poderosa: crea intimidad, genera empatía y permite explorar el mundo interior con una profundidad que otros tipos de narrador no pueden alcanzar. Pero también impone limitaciones: el narrador en primera persona no puede saber lo que piensa otro personaje, ni estar en dos lugares a la vez.",
        },
        {
          tipo: "subtitulo",
          contenido: "Tipos de narrador en primera persona",
        },
        {
          tipo: "lista",
          items: [
            "Narrador protagonista: el 'yo' que cuenta ES el personaje central de la historia. Sus percepciones, sesgos y emociones colorean todo el relato.",
            "Narrador testigo: el 'yo' es un personaje secundario que observa la historia de otro. Este distanciamiento puede crear ironía o misterio.",
            "Narrador retrospectivo: el 'yo' del presente cuenta algo que le ocurrió en el pasado. La distancia temporal permite reflexión y perspectiva.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "El narrador no confiable",
        },
        {
          tipo: "parrafo",
          contenido:
            "Una de las estrategias más sofisticadas de la narrativa contemporánea es el narrador no confiable (unreliable narrator): un 'yo' que miente, se engaña a sí mismo o percibe la realidad de manera distorsionada. El lector atento nota las contradicciones entre lo que el narrador dice y lo que los hechos sugieren. Esta técnica genera tensión, ironía y obliga al lector a leer de manera activa y crítica.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Al escribir en primera persona es crucial mantener la coherencia de la perspectiva. No puedes saber lo que piensa otro personaje a menos que te lo diga o que lo infieran. Salirse de la perspectiva del narrador —un error llamado 'intrusión del autor'— rompe la ilusión narrativa y desorienta al lector.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Ojo humano dentro de un círculo, representando la perspectiva limitada pero intensa del narrador en primera persona",
          caption: "La primera persona ofrece profundidad interior a cambio de amplitud de visión.",
        },
      ],
    },
  },

  // ── 8 ── Narrativa literaria ───────────────────────────────────────────────
  {
    slug: "lc-ii-estructura-del-relato",
    titulo: "Estructura del relato: cómo se organiza una historia",
    categoria: "Narrativa literaria",
    conceptos_clave: ["estructura narrativa", "trama", "conflicto", "clímax"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Una historia no es una secuencia aleatoria de eventos: es una construcción deliberada en la que cada parte cumple una función. Los escritores —aunque no siempre de manera consciente— organizan sus relatos siguiendo estructuras que han sido analizadas desde Aristóteles. Comprender esas estructuras no coarta la creatividad: la potencia, porque permite tomar decisiones informadas sobre cuándo romper las reglas.",
        },
        {
          tipo: "subtitulo",
          contenido: "La estructura clásica en tres actos",
        },
        {
          tipo: "parrafo",
          contenido:
            "El primer acto (planteamiento) presenta el mundo de la historia, los personajes principales y el desequilibrio que desencadena la trama. El segundo acto (desarrollo o nudo) es el más extenso: el personaje enfrenta obstáculos, toma decisiones y las consecuencias se acumulan hasta el clímax, el momento de mayor tensión. El tercer acto (desenlace) resuelve el conflicto —o lo deja abierto con intención— y muestra el nuevo estado del mundo narrativo.",
        },
        {
          tipo: "subtitulo",
          contenido: "Estructuras alternativas",
        },
        {
          tipo: "lista",
          items: [
            "In medias res: la historia comienza en medio de la acción, sin introducción. El contexto se va revelando gradualmente.",
            "Estructura circular: el texto termina donde comenzó, creando un efecto de inevitabilidad o de eterno retorno.",
            "Estructura episódica: una serie de episodios aparentemente independientes que revelan, al final, una unidad temática.",
            "Estructura fragmentada: el orden cronológico se rompe mediante saltos temporales para crear suspenso o revelar información de manera estratégica.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Juan Rulfo en Pedro Páramo usa una estructura fragmentada y no lineal que rompe deliberadamente con la narración convencional. Los tiempos se mezclan, los muertos hablan y el lector debe reconstruir la historia a partir de los fragmentos. Esta estructura no es un defecto: es la forma que le da al contenido —la muerte, la memoria, el tiempo circular— su expresión perfecta.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama comparativo de cuatro estructuras narrativas: lineal, circular, in medias res y fragmentada, con flechas que muestran el flujo temporal en cada caso",
          caption: "La estructura narrativa es una decisión creativa con consecuencias de sentido.",
        },
      ],
    },
  },

  // ── 9 ── Narrativa literaria ───────────────────────────────────────────────
  {
    slug: "lc-ii-el-tiempo-en-la-narracion",
    titulo: "El tiempo en la narración: orden, duración y frecuencia",
    categoria: "Narrativa literaria",
    conceptos_clave: ["tiempo narrativo", "anacronía", "flashback", "elipsis narrativa"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El tiempo es uno de los materiales más maleables con los que trabaja la narrativa. A diferencia del tiempo real —que avanza siempre hacia adelante y a ritmo constante—, el tiempo narrativo puede dilatarse, comprimirse, retroceder, anticipar o detenerse. Un escritor puede narrar en diez páginas lo que ocurrió en un segundo, o saltar décadas en una sola frase. El control del tiempo narrativo es uno de los poderes más importantes del narrador.",
        },
        {
          tipo: "subtitulo",
          contenido: "Orden: ¿cuándo se cuenta lo que pasó?",
        },
        {
          tipo: "parrafo",
          contenido:
            "El narratólogo Gérard Genette identificó las analepsis (saltos al pasado, popularmente llamados flashbacks) y las prolepsis (anticipaciones al futuro, o flash-forwards) como las dos grandes alteraciones del orden cronológico. Las analepsis permiten revelar el origen de un conflicto o la historia previa de un personaje. Las prolepsis crean suspenso o ironía al adelantar un resultado que aún no conocemos.",
        },
        {
          tipo: "subtitulo",
          contenido: "Duración: ¿cuánto tiempo ocupa el relato?",
        },
        {
          tipo: "lista",
          items: [
            "Escena: el tiempo narrado y el tiempo de narración son equivalentes. Se usa para momentos clave.",
            "Resumen: el narrador comprime en pocas líneas eventos que duraron mucho tiempo ('Pasaron cinco años').",
            "Elipsis: se omite un período de tiempo sin mencionarlo. El lector infiere el salto.",
            "Pausa descriptiva: la narración se detiene para describir mientras el tiempo de la historia no avanza.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La frecuencia narrativa indica cuántas veces se narra un evento. Un evento que ocurrió una vez y se narra una vez es la norma. Pero se puede narrar varias veces un solo evento (frecuencia repetitiva) para subrayar su importancia, o narrar una sola vez algo que ocurrió muchas veces (frecuencia iterativa: 'cada tarde, el abuelo salía a ver la puesta de sol').",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Línea de tiempo narrativa con flechas indicando analepsis (hacia atrás), prolepsis (hacia adelante), elipsis (salto) y escena (pausa larga)",
          caption: "Las manipulaciones del tiempo narrativo enriquecen la forma de contar una historia.",
        },
      ],
    },
  },

  // ── 10 ── Narrativa literaria ──────────────────────────────────────────────
  {
    slug: "lc-ii-cuento-breve-economia-del-relato",
    titulo: "El cuento breve: economía del relato",
    categoria: "Narrativa literaria",
    conceptos_clave: ["cuento breve", "microrrelato", "concentración narrativa", "final sorpresa"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El cuento breve lleva al extremo la máxima de Julio Cortázar: si la novela gana por puntos, el cuento debe ganar por nocaut. En el cuento de pocas páginas —y más aún en el microrrelato de menos de una página—, cada palabra cuenta. No hay espacio para la digresión, el adorno innecesario o el personaje secundario sin función. La economía del relato es su mayor virtud y su mayor exigencia.",
        },
        {
          tipo: "subtitulo",
          contenido: "Las leyes del cuento breve",
        },
        {
          tipo: "lista",
          items: [
            "Unidad de efecto: todo el cuento apunta hacia un único impacto final en el lector. Edgar Allan Poe fue el primero en teorizarlo.",
            "Tensión sostenida: desde la primera frase, el texto debe crear una pregunta que el lector quiera ver respondida.",
            "Final contundente: el desenlace del cuento breve debe ser inevitable en retrospectiva, pero inesperado en el momento de leerse.",
            "Economía de medios: nada sobra. Si un detalle no aporta al efecto final, se elimina.",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "El microrrelato, que puede tener desde unas pocas líneas hasta una página, es el laboratorio del cuento breve. En México, Augusto Monterroso escribió 'El dinosaurio' ('Cuando despertó, el dinosaurio todavía estaba allí'), considerado el cuento más corto en español y uno de los más citados en el mundo. Ese brevísimo texto tiene personaje, tiempo, espacio, conflicto y una atmósfera perturbadora. Cada palabra es perfectamente necesaria.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "El ejercicio del cuento de seis palabras, inspirado en la frase atribuida a Hemingway ('For sale: baby shoes, never worn'), es una excelente práctica de economía narrativa. Intenta contar una historia completa —con principio, conflicto y desenlace implícito— en exactamente seis palabras.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Embudo que va de un relato largo (muchas palabras) a un microrrelato (pocas palabras), con la presión de la forma aumentando hacia el extremo estrecho",
          caption: "El cuento breve comprime al máximo la materia narrativa.",
        },
      ],
    },
  },

  // ── 11 ── Narrativa literaria ──────────────────────────────────────────────
  {
    slug: "lc-ii-intertextualidad",
    titulo: "La intertextualidad: los textos hablan entre sí",
    categoria: "Narrativa literaria",
    conceptos_clave: ["intertextualidad", "parodia", "pastiche", "alusión literaria"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Ningún texto nace en el vacío. Todo texto está en diálogo con otros textos que lo precedieron: los cita, los contradice, los imita, los transforma o los subvierte. Esta red de relaciones entre textos es lo que la teórica Julia Kristeva llamó intertextualidad en 1967. Para leer literatura con profundidad, es necesario reconocer esas voces que resuenan detrás del texto que tenemos en las manos.",
        },
        {
          tipo: "subtitulo",
          contenido: "Formas de intertextualidad",
        },
        {
          tipo: "lista",
          items: [
            "Cita: reproducción textual de un fragmento de otra obra, con atribución explícita.",
            "Alusión: referencia indirecta a otro texto, autor o personaje que el lector cultivo reconocerá.",
            "Parodia: imitación con intención cómica o crítica de un texto o estilo reconocible.",
            "Pastiche: imitación de un estilo sin intención crítica, como homenaje o ejercicio de estilo.",
            "Reescritura: tomar un texto conocido y recontarlo desde otra perspectiva, época o con otro propósito.",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "En la literatura mexicana, la intertextualidad opera de maneras fascinantes. Rosario Castellanos dialoga con los mitos fundacionales prehispánicos en su poesía; Carlos Fuentes reescribe el pasado colonial en Terra Nostra en conversación con Cervantes y Quevedo; Elena Poniatowska usa el género del testimonio en tensión con la novela. Reconocer estas conversaciones enriquece enormemente la experiencia lectora.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La intertextualidad no es plagio. El plagio es apropiarse de un texto ajeno sin reconocerlo. La intertextualidad es un diálogo consciente y creativo con la tradición literaria. La diferencia está en la intención, la transformación y —cuando corresponde— el reconocimiento explícito de la fuente.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Red de nodos conectados, donde cada nodo es un texto literario y las líneas representan relaciones intertextuales entre ellos",
          caption: "La literatura es una red de voces que se citan, responden y transforman mutuamente.",
        },
      ],
    },
  },

  // ── 12 ── Literatura mexicana ──────────────────────────────────────────────
  {
    slug: "lc-ii-el-corrido-mexicano",
    titulo: "El corrido mexicano: narración y épica popular",
    categoria: "Literatura mexicana",
    conceptos_clave: ["corrido", "narrativa popular", "épica", "Revolución Mexicana"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El corrido es uno de los géneros narrativos más importantes de la cultura popular mexicana. Surgido en el contexto de la Revolución Mexicana (1910-1920), aunque con raíces en el romance español y la tradición oral indígena, el corrido cuenta historias: hazañas de héroes, batallas, tragedias amorosas, persecuciones y muertes. Es el periódico de los que no tenían acceso a los periódicos, la memoria épica de los que la historia oficial ignoró.",
        },
        {
          tipo: "subtitulo",
          contenido: "Estructura narrativa del corrido",
        },
        {
          tipo: "lista",
          items: [
            "Llamada o saludo inicial: el corridista se presenta y pide atención ('Voy a cantarles, señores...').",
            "Presentación del héroe: nombre, origen, características.",
            "Narración de los hechos: la historia en orden cronológico, con detalle de lugar, tiempo y acción.",
            "Muerte o desenlace: en los corridos clásicos, el héroe casi siempre muere de manera violenta y valiente.",
            "Moraleja o despedida: reflexión final y cierre del corridista.",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "Corridos como 'La Valentina', 'Adelita' o 'Carabina 30-30' documentaron la Revolución con una viveza que los textos históricos formales no podían igualar. En ellos aparecen personajes reales (Pancho Villa, Emiliano Zapata) junto a figuras anónimas que encarnan los valores colectivos de una época. El corrido sigue vivo: el narco-corrido contemporáneo actualiza la estructura épica del género para narrar las realidades —y controversias— del crimen organizado.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "El lingüista y folklorista Américo Paredes estudió el corrido de la frontera norte en su obra With His Pistol in His Hand (1958), demostrando cómo este género era también una respuesta cultural de resistencia frente a la opresión angloestadounidense. El corrido no es solo entretenimiento: es política y memoria.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Ilustración estilo grabado de Guadalupe Posada mostrando músicos con guitarras durante la Revolución Mexicana",
          caption: "El corrido fue la crónica musical y narrativa de la Revolución Mexicana.",
        },
      ],
    },
  },

  // ── 13 ── Literatura mexicana ──────────────────────────────────────────────
  {
    slug: "lc-ii-la-leyenda-urbana",
    titulo: "La leyenda urbana: narrativa popular contemporánea",
    categoria: "Literatura mexicana",
    conceptos_clave: ["leyenda urbana", "narrativa oral", "creencia popular", "miedo colectivo"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La leyenda urbana es un relato breve que circula de boca en boca —y hoy también por redes sociales— presentado como verdadero, aunque generalmente no lo es o está profusamente exagerado. A diferencia de la leyenda tradicional, que habla de santos, héroes o fenómenos sobrenaturales en tiempos remotos, la leyenda urbana se sitúa en la ciudad contemporánea y protagoniza situaciones que podrían ocurrirle a cualquiera: 'A mi amigo le pasó', 'Lo escuché en las noticias'.",
        },
        {
          tipo: "subtitulo",
          contenido: "Características narrativas de la leyenda urbana",
        },
        {
          tipo: "lista",
          items: [
            "Verosimilitud: está situada en lugares reales y concretos (una colonia, una calle, un hospital específico).",
            "Cadena de transmisión: siempre le pasó a 'un amigo de un amigo', creando una distancia que da credibilidad.",
            "Final sorpresivo o perturbador: el giro inesperado es parte central de su estructura narrativa.",
            "Función social: expresa miedos colectivos, normas morales implícitas o desconfianza hacia ciertos grupos.",
            "Variantes: una misma leyenda circula en versiones distintas adaptadas a diferentes ciudades o contextos.",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "En México, leyendas urbanas como 'El asesino del asiento trasero', 'El ratón que cayó en la fritura' o versiones modernas de La Llorona revelan los miedos de cada época: la inseguridad callejera, la desconfianza en las industrias alimentarias, el terror a lo sobrenatural. Estudiar las leyendas urbanas desde la perspectiva literaria y antropológica revela mucho sobre la psicología colectiva de una sociedad.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Las leyendas urbanas son primas de las noticias falsas. Antes de compartir una historia que te llegó como 'verídica', pregúntate: ¿quién es la fuente? ¿Es verificable? ¿Tiene todas las características de una leyenda urbana (cadena de transmisión, vaguedad de la fuente, final impactante)? La alfabetización narrativa te ayuda a reconocer la diferencia.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Silueta de ciudad nocturna con figuras en sombra que se cuentan algo al oído, representando la transmisión oral de las leyendas",
          caption: "Las leyendas urbanas circulan como relatos orales en la ciudad contemporánea.",
        },
      ],
    },
  },

  // ── 14 ── Literatura mexicana ──────────────────────────────────────────────
  {
    slug: "lc-ii-narrativas-populares-indigenas",
    titulo: "Narrativas populares e indígenas en México",
    categoria: "Literatura mexicana",
    conceptos_clave: ["literatura oral", "cosmovisión indígena", "mito", "narrativa nahua"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "México es uno de los países con mayor diversidad lingüística y cultural del mundo: más de 60 lenguas indígenas se hablan hoy en su territorio, y cada una de ellas sostiene una tradición narrativa propia. Los mitos, leyendas, cuentos y relatos de los pueblos nahua, maya, zapoteca, mixteca, rarámuri, huichol y decenas más son parte viva del patrimonio literario mexicano, aunque por mucho tiempo fueron ignorados por las instituciones culturales dominantes.",
        },
        {
          tipo: "subtitulo",
          contenido: "Características de la narrativa oral indígena",
        },
        {
          tipo: "lista",
          items: [
            "Oralidad: estos relatos nacieron para ser escuchados, no leídos. La voz, el ritmo, la repetición y la audiencia son parte de su estructura.",
            "Función cosmogónica: explican el origen del mundo, los seres humanos, los astros y los fenómenos naturales desde la cosmovisión propia de cada pueblo.",
            "Personajes no humanos: dioses, animales que hablan, fuerzas de la naturaleza son protagonistas junto a los humanos.",
            "Moraleja o enseñanza comunitaria: los relatos transmiten valores, normas y conocimientos prácticos de generación en generación.",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "El Popol Vuh, libro sagrado de los mayas quichés, es uno de los textos más importantes de la literatura universal. Narra la creación del mundo, los seres humanos y el cosmos desde una perspectiva radicalmente distinta a la occidental. En el ámbito nahua, los Cantares Mexicanos y los textos de Sahagún recogen una tradición poética y narrativa de extraordinaria riqueza. Escritores contemporáneos como Natalia Toledo (zapoteca) y Juan Gregorio Regino (mazateco) continúan y renuevan esas tradiciones en español y en sus lenguas maternas.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "La escritura en lenguas indígenas mexicanas tiene una historia milenaria: los códices prehispánicos en náhuatl, mixteco y maya son sistemas de escritura pictográfica y logográfica. Hoy existen programas de escritura y publicación en lenguas indígenas, y autores que escriben simultáneamente en su lengua materna y en español.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Fragmento de un códice prehispánico con glifos coloridos junto a texto en español que muestra su traducción parcial",
          caption: "Los códices son una forma de escritura narrativa precolombina de extraordinaria complejidad.",
        },
      ],
    },
  },

  // ── 15 ── Literatura mexicana ──────────────────────────────────────────────
  {
    slug: "lc-ii-cronica-literaria-mexicana",
    titulo: "La crónica literaria mexicana",
    categoria: "Literatura mexicana",
    conceptos_clave: ["crónica", "Carlos Monsiváis", "Elena Poniatowska", "periodismo literario"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La crónica literaria mexicana es uno de los géneros más originales de la literatura latinoamericana del siglo XX. A diferencia de la crónica periodística —que informa sobre hechos en orden cronológico con estilo neutro—, la crónica literaria combina el rigor de los hechos reales con los recursos de la ficción: voz autoral marcada, descripción literaria, ironia, estructura no lineal y compromiso político y estético. Carlos Monsiváis y Elena Poniatowska son sus máximos exponentes en México.",
        },
        {
          tipo: "subtitulo",
          contenido: "Carlos Monsiváis: el cronista de la cultura masiva",
        },
        {
          tipo: "parrafo",
          contenido:
            "Carlos Monsiváis (1938-2010) documentó durante cinco décadas la vida cultural, política y popular de México con una voz inconfundible: erudita e irónica, capaz de analizar con igual seriedad a Sor Juana Inés de la Cruz y a María Félix, al movimiento del 68 y a los concursos de belleza. Sus crónicas recogidas en libros como Días de guardar (1970) y Escenas de pudor y liviandad (1988) son documentos históricos y literarios de primer orden.",
        },
        {
          tipo: "subtitulo",
          contenido: "Elena Poniatowska: la voz de los que no tienen voz",
        },
        {
          tipo: "parrafo",
          contenido:
            "Elena Poniatowska (1932) convirtió la crónica y el testimonio en un instrumento de justicia social. En La noche de Tlatelolco (1971) documentó la masacre estudiantil del 2 de octubre de 1968 mediante el montaje de testimonios de sobrevivientes, periodistas y fotógrafos. En Hasta no verte Jesús mío (1969) dio forma literaria a la voz de Josefina Bórquez, una mujer del pueblo que vivió la Revolución. Poniatowska es la gran cronista de los invisibles.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La crónica literaria es un género fronterizo: pertenece a la literatura y al periodismo sin ser completamente ninguna de las dos. Sus textos pueden leerse como novelas, pero sus hechos son verificables. Esta hibridez la hace un género especialmente poderoso para explorar la realidad social desde una perspectiva artística.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Portadas de La noche de Tlatelolco y Días de guardar junto a una libreta de notas periodística, simbolizando la fusión entre literatura y periodismo",
          caption: "La crónica literaria mexicana funde periodismo, historia y literatura.",
        },
      ],
    },
  },

  // ── 16 ── Estrategias lectoras ─────────────────────────────────────────────
  {
    slug: "lc-ii-ideas-centrales-y-secundarias",
    titulo: "Ideas centrales e ideas secundarias en la narrativa",
    categoria: "Estrategias lectoras",
    conceptos_clave: ["idea central", "idea secundaria", "jerarquía de ideas", "lectura analítica"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Todo texto narrativo organiza su contenido de manera jerárquica: hay una idea central —el núcleo temático que da sentido al conjunto— y hay ideas secundarias que la sostienen, amplían, ejemplifican o matizan. Distinguir entre estos niveles es una habilidad lectora fundamental. Sin ella, todos los elementos de un texto parecen igualmente importantes, y la comprensión se vuelve superficial.",
        },
        {
          tipo: "subtitulo",
          contenido: "La idea central en un texto narrativo",
        },
        {
          tipo: "parrafo",
          contenido:
            "En un texto narrativo, la idea central suele ser el tema profundo de la historia: no 'lo que pasa' (trama) sino 'de qué trata en el fondo' (tema). Un cuento puede narrar el viaje de un niño al pueblo de su abuela (trama) y al mismo tiempo explorar el tema de la pérdida de la infancia o la ruptura entre tradición y modernidad (idea central). Identificar el tema requiere ir más allá de los eventos superficiales y preguntarse qué pregunta fundamental hace el texto sobre la experiencia humana.",
        },
        {
          tipo: "subtitulo",
          contenido: "Cómo identificar la jerarquía de ideas",
        },
        {
          tipo: "lista",
          items: [
            "Lee el texto completo antes de intentar jerarquizar. Las ideas que parecen secundarias al principio pueden ser centrales al final.",
            "Pregúntate: si quitara este elemento, ¿el texto perdería su sentido fundamental? Si sí, es una idea central.",
            "Identifica qué es lo que más espacio ocupa, qué recibe más elaboración, qué reaparece con más frecuencia.",
            "En textos con narrador, presta atención a lo que el narrador subraya o a lo que los personajes discuten con más intensidad.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "En los cuentos de Juan Rulfo, la idea central raramente se enuncia de manera explícita. La soledad, la violencia heredada y la muerte como presencia cotidiana emergen de la acumulación de detalles, silencios y acciones de los personajes. Leer a Rulfo es un entrenamiento excelente para desarrollar la habilidad de identificar lo que un texto dice sin decirlo.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Árbol cuya raíz es la idea central y cuyas ramas son las ideas secundarias, con hojas que representan los detalles y ejemplos",
          caption: "Las ideas de un texto se organizan jerárquicamente como un árbol.",
        },
      ],
    },
  },

  // ── 17 ── Estrategias lectoras ─────────────────────────────────────────────
  {
    slug: "lc-ii-el-tema-en-la-narrativa",
    titulo: "El tema en la narrativa: cómo identificarlo",
    categoria: "Estrategias lectoras",
    conceptos_clave: ["tema literario", "motivo", "lectura temática", "interpretación"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El tema de un texto narrativo es la pregunta o afirmación fundamental sobre la experiencia humana que el texto explora. No es lo mismo que el asunto (de qué trata superficialmente) ni que la trama (qué sucede). Un texto puede tratar sobre una familia en la Ciudad de México (asunto), narrar una serie de conflictos entre sus miembros (trama) y al mismo tiempo explorar el tema de cómo los secretos destruyen los vínculos afectivos. El tema es la capa más profunda de sentido.",
        },
        {
          tipo: "subtitulo",
          contenido: "Temas universales en la narrativa mexicana",
        },
        {
          tipo: "lista",
          items: [
            "La identidad: ¿quiénes somos entre la herencia indígena, la colonial y la moderna? (Carlos Fuentes, Rosario Castellanos)",
            "La muerte: en la cultura mexicana, la muerte es una presencia cotidiana, no un tabú. (Juan Rulfo, Octavio Paz en El laberinto de la soledad)",
            "El poder y la opresión: las relaciones de dominio en la familia, el pueblo o el estado. (Elena Garro, Elena Poniatowska)",
            "La memoria y el olvido: quién tiene derecho a contar la historia y qué se pierde cuando se olvida.",
            "El género y el cuerpo: las normas que pesan sobre las mujeres y los cuerpos que no encajan. (Sor Juana, Rosario Castellanos)",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "Identificar el tema no significa reducir el texto a una fórmula. Un mismo texto puede explorar varios temas simultáneamente. La riqueza de una obra maestra radica en que su tema no se agota en una lectura ni en una interpretación. La lectura temática es una herramienta de análisis, no una jaula que encierra el texto.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Un error frecuente es confundir el tema con la moraleja. La moraleja es una lección explícita ('el que mal anda, mal acaba'). El tema es una pregunta que el texto deja abierta, no una respuesta que impone. Los mejores textos literarios no predican: interrogan.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de tres círculos concéntricos: el exterior representa el asunto, el intermedio la trama y el interior el tema profundo del texto",
          caption: "Asunto, trama y tema son tres niveles de profundidad en la lectura narrativa.",
        },
      ],
    },
  },

  // ── 18 ── Estrategias lectoras ─────────────────────────────────────────────
  {
    slug: "lc-ii-taller-literario-retroalimentacion",
    titulo: "El taller literario: cómo dar y recibir retroalimentación",
    categoria: "Estrategias lectoras",
    conceptos_clave: ["taller literario", "retroalimentación", "lectura colaborativa", "crítica constructiva"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El taller literario es un espacio de lectura y escritura colectiva donde los participantes leen los textos de los demás y ofrecen retroalimentación. Es una de las tradiciones más fértiles de la formación literaria: escritores como Juan Rulfo, Octavio Paz y Elena Poniatowska participaron en talleres que marcaron su desarrollo. En el bachillerato, el taller es también un espacio de aprendizaje colaborativo alineado con el MCCEMS 2025.",
        },
        {
          tipo: "subtitulo",
          contenido: "Principios de la retroalimentación literaria efectiva",
        },
        {
          tipo: "lista",
          items: [
            "Habla del texto, no del autor: 'el narrador pierde credibilidad aquí' en lugar de 'tú no sabes escribir esto'.",
            "Comienza por lo que funciona: identificar las fortalezas del texto antes que sus debilidades abre al escritor a escuchar los señalamientos.",
            "Sé específico: 'el párrafo tres es confuso' es más útil que 'el texto es difícil de entender'.",
            "Haz preguntas en lugar de dar órdenes: '¿por qué el personaje toma esta decisión?' invita a la reflexión; 'cámbia esto' impone una solución.",
            "Respeta la intención del autor: la retroalimentación debe ayudar al texto a ser más de lo que quiere ser, no de lo que tú querrías que fuera.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Cómo recibir retroalimentación",
        },
        {
          tipo: "parrafo",
          contenido:
            "Recibir crítica sobre algo que escribiste puede ser difícil porque la escritura personal involucra vulnerabilidad. Algunas claves: escucha sin interrumpir, toma notas, no te defiendas durante el proceso de retroalimentación (ese no es el momento). Después, cuando tengas distancia, evalúa qué comentarios resuenan como verdaderos y cuáles no aplican a lo que intentabas hacer. No tienes que aceptar todos los cambios sugeridos, pero sí reflexionar sobre ellos.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El taller literario es un espacio de confianza. Todo lo que se comparte allí es confidencial. Leer un texto de alguien es un acto de confianza; criticarlo con honestidad y respeto es un acto de cuidado. Ambos requieren madurez y generosidad.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Grupo de personas sentadas en círculo con textos impresos en la mano, intercambiando comentarios escritos",
          caption: "El taller literario convierte la escritura en un proceso social y colaborativo.",
        },
      ],
    },
  },

  // ── 19 ── Estrategias lectoras ─────────────────────────────────────────────
  {
    slug: "lc-ii-literatura-comparada",
    titulo: "Lectura comparada: relacionar textos y contextos",
    categoria: "Estrategias lectoras",
    conceptos_clave: ["literatura comparada", "contexto histórico", "intertexto", "lectura intertextual"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La lectura comparada es la práctica de leer dos o más textos en relación, buscando similitudes, diferencias, influencias y tensiones entre ellos. No se trata de determinar cuál es mejor, sino de entender cómo cada texto ilumina al otro y qué nuevas preguntas emergen de la comparación. Es una estrategia lectora sofisticada que desarrolla el pensamiento crítico y la comprensión profunda de la literatura.",
        },
        {
          tipo: "subtitulo",
          contenido: "Qué se puede comparar",
        },
        {
          tipo: "lista",
          items: [
            "Dos textos del mismo autor en distintos momentos de su obra: observar la evolución de su estilo y temas.",
            "Dos textos de autores distintos sobre el mismo tema: ver cómo el contexto y la visión personal producen respuestas diferentes.",
            "Un texto y su contexto histórico: entender cómo los eventos de la época se reflejan, distorsionan o silencian en la literatura.",
            "Un texto original y su adaptación: analizar qué se mantiene, qué se transforma y por qué en la versión adaptada.",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "Por ejemplo: leer el poema 'En paz' de Amado Nervo junto a algún poema de Octavio Paz sobre el tiempo permite explorar cómo dos poetas mexicanos de épocas muy distintas responden a la pregunta sobre el sentido de la existencia. La comparación revela no solo diferencias estéticas sino diferencias de visión del mundo condicionadas por sus contextos históricos.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "La literatura comparada como disciplina académica nació en Europa en el siglo XIX y se desarrolló como una forma de estudiar las relaciones entre literaturas de diferentes lenguas y culturas. Hoy también incluye la comparación entre la literatura y otras artes: cine, música, pintura. Comparar la novela Pedro Páramo con la película basada en ella revela mucho sobre los lenguajes específicos de cada medio.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Dos libros abiertos uno junto al otro con flechas bidireccionales que representan el diálogo entre sus textos",
          caption: "La lectura comparada pone textos en diálogo para generar nuevas comprensiones.",
        },
      ],
    },
  },

  // ── 20 ── Producción multimodal ────────────────────────────────────────────
  {
    slug: "lc-ii-texto-multimodal",
    titulo: "¿Qué es un texto multimodal?",
    categoria: "Producción multimodal",
    conceptos_clave: ["texto multimodal", "semiótica social", "modos semióticos", "diseño de textos"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Un texto multimodal es aquel que combina dos o más modos semióticos para producir significado. Los modos semióticos son los sistemas de signos que usamos para comunicar: el lenguaje verbal escrito, el lenguaje verbal oral, las imágenes estáticas, el video, el sonido, la música, el gesto, el diseño gráfico y espacial. Un cartel publicitario, una infografía, un cómic, un sitio web, un videojuego o una presentación de diapositivas son textos multimodales.",
        },
        {
          tipo: "subtitulo",
          contenido: "Por qué importa la multimodalidad",
        },
        {
          tipo: "parrafo",
          contenido:
            "Vivimos en una cultura donde la comunicación es fundamentalmente multimodal. Los jóvenes consumen y producen textos multimodales de manera cotidiana: videos para TikTok, historias de Instagram, presentaciones escolares, memes. Sin embargo, muchas veces se hace de manera intuitiva y sin reflexión. Desarrollar una competencia multimodal consciente significa entender que cada modo tiene sus propias posibilidades y limitaciones, y que la combinación de modos no es aleatoria sino que produce efectos de sentido específicos.",
        },
        {
          tipo: "subtitulo",
          contenido: "Tipos de relación entre modos",
        },
        {
          tipo: "lista",
          items: [
            "Complementariedad: la imagen y el texto dicen cosas diferentes que se enriquecen mutuamente. Una fotografía periodística con su pie de foto es un ejemplo.",
            "Refuerzo: imagen y texto dicen lo mismo para aumentar el impacto. Común en publicidad.",
            "Contradicción: imagen y texto dicen cosas opuestas, creando ironía o tensión. Recurso frecuente en el arte y la sátira política.",
            "Sustitución: la imagen reemplaza al texto o viceversa. En señales de tránsito, el icono reemplaza la palabra.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Al producir un texto multimodal, no se trata de 'ilustrar' el texto escrito con imágenes. Cada elemento visual debe ser una decisión de comunicación: el color tiene significado, la tipografía comunica valores, la composición espacial guía la mirada del lector. Un texto multimodal mal diseñado puede contradecir o debilitar el mensaje que se quiere transmitir.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Collage que muestra ejemplos de textos multimodales: infografía, cómic, sitio web y meme, con etiquetas que identifican sus modos semióticos",
          caption: "Los textos multimodales combinan imagen, texto, color y diseño para comunicar.",
        },
      ],
    },
  },

  // ── 21 ── Producción multimodal ────────────────────────────────────────────
  {
    slug: "lc-ii-imagen-y-texto-en-proyectos",
    titulo: "Integración de imagen y texto en proyectos creativos",
    categoria: "Producción multimodal",
    conceptos_clave: ["diseño editorial", "imagen y texto", "narrativa visual", "álbum ilustrado"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La integración de imagen y texto en un proyecto creativo no es simplemente poner una foto al lado de un párrafo: es diseñar una relación entre dos lenguajes que se enriquecen mutuamente. En el cómic, la imagen y el texto tienen una relación de interdependencia total: ni la imagen sin el texto ni el texto sin la imagen cuentan la historia completa. En el álbum ilustrado, la imagen puede decir lo que el texto calla, y viceversa. En la infografía, el diseño visual hace que la información compleja sea accesible.",
        },
        {
          tipo: "subtitulo",
          contenido: "Principios del diseño imagen-texto",
        },
        {
          tipo: "lista",
          items: [
            "Jerarquía visual: el ojo debe saber por dónde empezar. El elemento más importante debe tener más peso visual (tamaño, color, posición).",
            "Contraste: la diferencia entre elementos (claro/oscuro, grande/pequeño, simple/complejo) crea interés y guía la lectura.",
            "Alineación: los elementos alineados crean orden y coherencia; los desalineados crean dinamismo o tensión.",
            "Espacio blanco: el espacio vacío no es desperdicio: da respiro al ojo y hace que los elementos importantes destaquen.",
            "Coherencia cromática: los colores comunican emociones y valores. Una paleta coherente unifica el proyecto.",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "En México, artistas como José Guadalupe Posada integraron imagen y texto de manera magistral en sus grabados y hojas volantes. Sus calaveras con versos son un ejemplo temprano de diseño editorial popular. Hoy, diseñadores y artistas como Los Carteles de México o Alejandro Magallanes continúan esa tradición en el diseño gráfico contemporáneo.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "El cómic (o historieta, en México) es uno de los textos multimodales más complejos: cada página es una composición en la que el dibujante decide el número de viñetas, su tamaño, el ángulo de la cámara imaginaria y el tipo de globo de texto. Estas decisiones no son neutras: determinan el ritmo, la emoción y el significado de la historia.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Página de cómic con cuatro viñetas de distinto tamaño, mostrando cómo la composición visual dirige la lectura y el ritmo narrativo",
          caption: "En el cómic, cada decisión de diseño es también una decisión narrativa.",
        },
      ],
    },
  },

  // ── 22 ── Producción multimodal ────────────────────────────────────────────
  {
    slug: "lc-ii-escribir-para-publicar",
    titulo: "Escribir para un público: de la escritura privada a la publicación",
    categoria: "Producción multimodal",
    conceptos_clave: ["audiencia", "publicación", "propósito comunicativo", "portafolio literario"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Escribir para uno mismo es diferente a escribir para ser leído. Cuando el texto tiene un lector real —una audiencia específica, un propósito concreto, un medio de publicación determinado—, las decisiones de escritura cambian. El proyecto multimodal del MCCEMS 2025 propone que los estudiantes cierren su proceso creativo publicando su trabajo en algún formato: un libro-objeto, un blog, una presentación pública, un fanzine, un mural de texto, una cuenta en redes sociales o una antología colectiva.",
        },
        {
          tipo: "subtitulo",
          contenido: "Pensar en la audiencia",
        },
        {
          tipo: "parrafo",
          contenido:
            "Conocer a tu audiencia es fundamental para tomar decisiones de escritura: el vocabulario que usas, el nivel de detalle que ofreces, el tono que adoptas, los ejemplos que eliges. No es lo mismo escribir para niños de primaria, para tus compañeros de bachillerato, para adultos mayores o para especialistas en literatura. El mismo tema, tratado con la misma honestidad, requiere estrategias comunicativas distintas según quién va a leer.",
        },
        {
          tipo: "subtitulo",
          contenido: "Formatos de publicación en bachillerato",
        },
        {
          tipo: "lista",
          items: [
            "Antología impresa o digital: colección de textos del grupo, con prólogo, notas biográficas y diseño editorial.",
            "Blog o sitio web: permite publicar con regularidad y recibir comentarios de lectores reales.",
            "Fanzine: publicación artesanal, fotocopiada o impresa, con gran libertad de diseño y distribución.",
            "Lectura pública: compartir el texto en voz alta ante un público, en el aula o en espacios comunitarios.",
            "Redes sociales literarias: plataformas como Wattpad o blogs permiten publicar narrativa y acceder a comunidades de lectores.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Publicar implica responsabilidad. Un texto que se comparte con el mundo puede impactar a otras personas: puede dar voz a experiencias silenciadas, generar empatía, provocar reflexión o incluso causar daño si no se trabaja con cuidado. La escritura pública requiere el mismo rigor ético que la escritura académica: verificar los hechos, respetar la dignidad de las personas que aparecen en el texto y asumir la autoría con nombre propio.",
        },
        {
          tipo: "cita",
          contenido:
            "Publicar es poner tu voz en el mundo. Es un acto político y un acto de amor.",
          fuente: "Nellie Campobello, escritora y primera cronista de la Revolución Mexicana",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Mesa de diseño con un fanzine impreso, una laptop con blog abierto y una antología encuadernada a mano, representando distintos formatos de publicación",
          caption: "Publicar es el cierre del ciclo de escritura: dar el texto a sus lectores.",
        },
      ],
    },
  },
] as const;

// ---------------------------------------------------------------------------
// FUNCIÓN PRINCIPAL
// ---------------------------------------------------------------------------

export async function seedBibliotecaLCII(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed Biblioteca LC-II (22 fichas)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac")
    .select("id")
    .eq("codigo", "LC-II")
    .single();

  if (uacErr || !uacRow) {
    throw new Error(
      `UAC LC-II no encontrada. Ejecuta primero seed-mccems.ts. Error: ${uacErr?.message}`
    );
  }

  const rows = FICHAS_LCII.map((f, i) => ({
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

  if (error) throw new Error(`Error seeding fichas LC-II: ${error.message}`);

  console.log(`  ✓ ${rows.length} fichas de biblioteca de LC-II insertadas/actualizadas.`);
  console.log("\n✅ Seed Biblioteca LC-II completado.\n");
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
  seedBibliotecaLCII(sb).catch((err) => {
    console.error("❌ Error:", err.message);
    process.exit(1);
  });
}
