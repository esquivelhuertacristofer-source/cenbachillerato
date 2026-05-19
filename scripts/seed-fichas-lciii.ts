/**
 * Seed de fichas de biblioteca para LC-III (Lengua y Comunicación III).
 * 21 fichas temáticas alineadas al MCCEMS 2025, Semestre 3.
 * Tema eje: "Describir culturas, apropiarse de las palabras".
 *
 * Uso: npx tsx scripts/seed-fichas-lciii.ts
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

const FICHAS_LCIII = [
  // ── 1 ── Estrategias críticas de lectura ───────────────────────────────────
  {
    slug: "lc-iii-lectura-critica-sentido-global",
    titulo: "Lectura crítica: el sentido global del texto",
    categoria: "Estrategias críticas de lectura",
    conceptos_clave: ["lectura crítica", "sentido global", "macroestructura", "comprensión profunda"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Leer críticamente no significa leer con desconfianza ni buscar errores en cada oración: significa leer con la mente activa, construyendo el sentido del texto en lugar de recibirlo pasivamente. La lectura crítica distingue entre lo que el texto dice de forma explícita, lo que sugiere de forma implícita y lo que calla de manera significativa. Esta habilidad es el fundamento del pensamiento independiente y la condición necesaria para escribir con autoridad sobre cualquier tema.",
        },
        {
          tipo: "subtitulo",
          contenido: "Qué es el sentido global del texto",
        },
        {
          tipo: "parrafo",
          contenido:
            "El sentido global —lo que los lingüistas llaman macroestructura— es el significado que emerge de la totalidad del texto, no de una oración aislada. Un texto literario puede hablar de una mujer que barre su patio en Oaxaca (nivel anecdótico) y al mismo tiempo hablar de la marginalización de las culturas indígenas (nivel simbólico). Comprender el sentido global exige ir más allá de la trama o la superficie del texto y preguntarse qué imagen del mundo construye esta obra, qué valores promueve, a quién le habla y desde qué posición habla.",
        },
        {
          tipo: "subtitulo",
          contenido: "Estrategias para construir el sentido global",
        },
        {
          tipo: "lista",
          items: [
            "Lee el texto completo antes de analizar: las primeras páginas solo tienen sentido a la luz del conjunto.",
            "Identifica los temas que reaparecen: la repetición de imágenes, personajes, situaciones o palabras señala aquello que el texto considera importante.",
            "Atiende al final: los desenlaces literarios no son accidentales. La última imagen o frase de un texto suele condensar su sentido más profundo.",
            "Relaciona el texto con su contexto: ¿cuándo fue escrito? ¿desde qué posición social o cultural habla su autor? El contexto ilumina silencios y énfasis.",
            "Pregunta por lo que falta: qué voces no están representadas, qué perspectivas quedan fuera del texto.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El sentido global no es la suma de los significados de cada oración: es una construcción que el lector realiza en diálogo con el texto. Dos lectores pueden construir sentidos globales distintos a partir del mismo texto sin que ninguno 'tenga razón' en exclusiva. Lo que importa es que cualquier interpretación esté fundamentada en evidencia del texto mismo.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Telescopio apuntando a un texto, representando la capacidad de ver el sentido global por encima del detalle inmediato",
          caption: "La lectura crítica requiere cambiar de lente: del detalle al conjunto y del conjunto al detalle.",
        },
        {
          tipo: "cita",
          contenido:
            "No leemos para entender las palabras, sino para entender el mundo que las palabras construyen.",
          fuente: "Adaptado de Octavio Paz, El arco y la lira (1956)",
        },
      ],
    },
  },

  // ── 2 ── Estrategias críticas de lectura ───────────────────────────────────
  {
    slug: "lc-iii-parafrasis-como-herramienta",
    titulo: "La paráfrasis como herramienta de comprensión",
    categoria: "Estrategias críticas de lectura",
    conceptos_clave: ["paráfrasis", "reformulación", "comprensión lectora", "análisis textual"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Parafrasear es decir con palabras propias lo que un texto dice con las suyas. Es una de las herramientas más poderosas —y más subestimadas— para verificar si realmente comprendimos lo que leímos. Cuando intentamos reformular un fragmento y no podemos, esa dificultad no es un fracaso: es información. Nos dice exactamente dónde está el nudo que necesitamos desatar. La paráfrasis es, en ese sentido, un diagnóstico de comprensión.",
        },
        {
          tipo: "subtitulo",
          contenido: "Paráfrasis y cita: la diferencia fundamental",
        },
        {
          tipo: "parrafo",
          contenido:
            "La cita reproduce textualmente las palabras del autor entre comillas, con atribución explícita. La paráfrasis reformula el contenido con las palabras del lector, sin comillas, pero también con atribución. Ninguna de las dos es plagio si se indica la fuente. El plagio ocurre cuando se reprodude o reformula el pensamiento ajeno haciéndolo pasar por propio, sin mencionar de dónde proviene. En la escritura académica y literaria, saber cuándo citar y cuándo parafrasear es una decisión de estilo y de rigor intelectual.",
        },
        {
          tipo: "subtitulo",
          contenido: "Tipos de paráfrasis",
        },
        {
          tipo: "lista",
          items: [
            "Paráfrasis mecánica: sustituye palabras por sinónimos sin reorganizar las ideas. Es el tipo más superficial y el que más riesgo de plagio conlleva.",
            "Paráfrasis estructural: reorganiza el orden de las ideas y las reformula con vocabulario propio. Demuestra comprensión real del texto.",
            "Paráfrasis expansiva: desarrolla y explica lo que el texto original dice de manera densa o elíptica. Útil para textos complejos como los de Octavio Paz.",
            "Paráfrasis reductora: resume el contenido a sus elementos esenciales. Útil para textos extensos o para construir el sentido global.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Los poetas parafrasean constantemente a sus predecesores: retoman imágenes, ideas y estructuras para reinterpretarlas. Octavio Paz parafraseó, dialogó y discutió con Sor Juana Inés de la Cruz, con T.S. Eliot y con los surrealistas a lo largo de toda su obra. La paráfrasis creativa es una de las fuerzas motrices de la tradición literaria.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Dos bocadillos de diálogo: uno con el texto original y otro con su paráfrasis, conectados por una flecha con la etiqueta 'reformulación'",
          caption: "Parafrasear es traducir el sentido del texto al propio lenguaje.",
        },
      ],
    },
  },

  // ── 3 ── Estrategias críticas de lectura ───────────────────────────────────
  {
    slug: "lc-iii-intencion-del-autor",
    titulo: "La intención del autor y el pensamiento crítico",
    categoria: "Estrategias críticas de lectura",
    conceptos_clave: ["intención autoral", "pensamiento crítico", "sesgo", "punto de vista"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Todo texto tiene un autor que toma decisiones: qué decir y qué callar, desde qué perspectiva narrar, qué palabras elegir y cuáles evitar. Esas decisiones no son neutras: revelan valores, posiciones ideológicas, intereses y visiones del mundo. Pensar críticamente sobre un texto implica preguntarse no solo qué dice sino por qué lo dice así, quién lo dice, para quién lo dice y qué efectos produce. Esta pregunta por la intención autoral es el núcleo del pensamiento crítico.",
        },
        {
          tipo: "subtitulo",
          contenido: "El autor implícito y el autor real",
        },
        {
          tipo: "parrafo",
          contenido:
            "Es importante distinguir entre el autor real (la persona histórica que escribió el texto) y el autor implícito (la imagen del autor que construye el texto mismo). Juan Rulfo, el hombre que nació en Sayula en 1917 y trabajó como agente de migración, es el autor real de El llano en llamas. El autor implícito de esos cuentos es una voz de una austeridad moral y una compasión sin sentimentalismo que emerge del estilo y las decisiones narrativas. Analizar la intención autoral significa analizar al autor implícito: la construcción textual, no la biografía.",
        },
        {
          tipo: "subtitulo",
          contenido: "Herramientas para identificar la posición del texto",
        },
        {
          tipo: "lista",
          items: [
            "Analiza el vocabulario: las palabras que un texto usa para referirse a ciertos grupos o fenómenos revelan actitudes implícitas.",
            "Identifica los silencios: lo que el texto no dice es tan significativo como lo que dice. ¿Qué voces están ausentes?",
            "Observa la focalización: ¿desde los ojos de quién vemos la historia? ¿Quién tiene acceso al pensamiento interior y quién no?",
            "Cuestiona las evidencias: ¿qué fuentes cita el texto? ¿Qué queda sin citar o sin problematizar?",
            "Sitúa el texto en su contexto de producción: ¿qué debates sociales o políticos estaban ocurriendo cuando se escribió?",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Identificar la posición ideológica de un texto no significa rechazarlo ni desvalorizarlo. Muchos de los textos más importantes de la literatura mexicana —desde los Cantares aztecas hasta Rosario Castellanos o Carlos Fuentes— están profundamente situados en perspectivas políticas concretas. Reconocer esa situación enriquece la lectura: nos permite ver el texto completo, con sus luces y sus límites.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Lupa que amplía la firma de un autor en un manuscrito, con flechas apuntando a elementos del texto que revelan su posición",
          caption: "Leer críticamente es aprender a escuchar lo que el texto dice sin decirlo.",
        },
      ],
    },
  },

  // ── 4 ── Análisis literario ────────────────────────────────────────────────
  {
    slug: "lc-iii-generos-literarios-sem3",
    titulo: "Los géneros literarios: novela, cuento, poesía y drama",
    categoria: "Análisis literario",
    conceptos_clave: ["géneros literarios", "novela", "cuento", "poesía", "drama"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La teoría de los géneros literarios es uno de los fundamentos del análisis literario. Desde Aristóteles, que distinguió la épica, la lírica y el drama, hasta los teóricos contemporáneos que hablan de géneros híbridos, fronterizos y digitales, la pregunta por cómo clasificar los textos literarios refleja también una pregunta sobre qué es la literatura y para qué sirve. En el semestre 3 del MCCEMS 2025, los géneros se estudian no como categorías rígidas sino como convenciones históricas y culturales que los escritores dominan para poder transformarlas.",
        },
        {
          tipo: "subtitulo",
          contenido: "Los cuatro géneros mayores",
        },
        {
          tipo: "lista",
          items: [
            "Narrativa (épica): incluye la novela y el cuento. Su elemento constitutivo es la historia contada por una voz narradora. La novela explora con amplitud temporal y espacial; el cuento concentra su efecto en un momento clave.",
            "Lírica: la poesía es el género donde el lenguaje se trabaja por su valor rítmico, sonoro e imaginativo, no solo por su contenido informativo. La voz poética expresa subjetividad e invita al lector a experimentar emociones e ideas con una densidad que la prosa raramente alcanza.",
            "Dramática: el texto escrito para ser representado en escena. Su elemento constitutivo es el diálogo entre personajes sin mediación de narrador. La obra de teatro vive en la tensión entre el texto escrito y la puesta en escena.",
            "Ensayo y géneros híbridos: textos que combinan argumentación, narrativa y lirismo para explorar ideas desde una perspectiva personal. La crónica, el testimonio y el ensayo literario pertenecen a este territorio fronterizo.",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "En la literatura mexicana contemporánea, los géneros se mezclan con frecuencia. Pedro Páramo de Juan Rulfo es técnicamente una novela, pero su estructura fragmentada y su lenguaje poético la acercan a la lírica. Los ensayos de Octavio Paz en El laberinto de la soledad tienen la densidad argumentativa del ensayo filosófico y la riqueza estilística de la prosa literaria. Rosario Castellanos cruzó constantemente entre la novela, el teatro, la poesía y el ensayo. Esta hibridez es una marca de la mejor literatura.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "El término 'géneros literarios' viene del griego génos (linaje, clase). Los géneros son sistemas de expectativas compartidas entre autores y lectores: cuando sabemos que vamos a leer una novela, esperamos cierta extensión, ciertos personajes, cierta progresión. Los escritores más interesantes suelen jugar con esas expectativas, cumpliéndolas, subvirtiéndolas o mezclándolas.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama con cuatro cuadrantes que representan los géneros literarios (narrativa, lírica, drama, ensayo) con ejemplos de obras mexicanas en cada uno",
          caption: "Los géneros literarios son convenciones históricas, no jaulas: los grandes escritores los transforman.",
        },
      ],
    },
  },

  // ── 5 ── Análisis literario ────────────────────────────────────────────────
  {
    slug: "lc-iii-genero-lirico-figuras-retorica",
    titulo: "El género lírico: figuras retóricas y métrica",
    categoria: "Análisis literario",
    conceptos_clave: ["género lírico", "figuras retóricas", "métrica", "versificación", "poesía"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La poesía es el género donde el lenguaje trabaja con mayor intensidad sobre sí mismo: no solo importa qué se dice, sino cómo suena, cuántas sílabas tiene, qué imagen crea, qué sensación produce en quien la lee o escucha. Este trabajo sobre la materialidad del lenguaje —el sonido, el ritmo, la imagen— es lo que distingue al texto lírico del texto informativo o narrativo. Sor Juana Inés de la Cruz, Octavio Paz y Rosario Castellanos —tres gigantes de la poesía mexicana— compartían un dominio magistral de estas herramientas.",
        },
        {
          tipo: "subtitulo",
          contenido: "Figuras retóricas fundamentales",
        },
        {
          tipo: "lista",
          items: [
            "Metáfora: identificación de dos elementos distintos ('la vida es un río que fluye hacia el mar'). La metáfora crea conexiones insospechadas entre realidades.",
            "Símil o comparación: relación de semejanza con nexo explícito ('como', 'cual'): 'sus ojos, como estrellas apagadas'.",
            "Personificación: atribución de cualidades humanas a animales, objetos o conceptos abstractos ('la muerte me miraba desde la esquina').",
            "Hipérbaton: alteración del orden sintáctico normal para lograr un efecto rítmico o enfático ('Del monte en la ladera...' en lugar de 'En la ladera del monte').",
            "Anáfora: repetición de una o varias palabras al inicio de versos o cláusulas consecutivas. Crea ritmo y énfasis.",
            "Aliteración: repetición de sonidos consonánticos similares en versos cercanos, que produce efectos musicales.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "La métrica: medir el verso",
        },
        {
          tipo: "parrafo",
          contenido:
            "La métrica es el estudio del ritmo en la poesía. En la versificación española, el verso se mide por sílabas, aplicando reglas de sinalefa (unión de vocales entre palabras), hiato, diéresis y el acento final (si el último acento recae en la última sílaba, se suma uno; si recae en la antepenúltima, se resta uno). Los endecasílabos (11 sílabas) son el metro más prestigioso de la tradición española, usado por Garcilaso, Sor Juana y muchos poetas mexicanos modernos. El verso libre, que prescinde de metro fijo, domina la poesía del siglo XX y XXI.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El verso libre no es prosa dividida en líneas. Tiene su propio ritmo, que emerge de la longitud variable de los versos, la distribución de los acentos y las pausas que los saltos de línea imponen. Octavio Paz construyó en Piedra de sol (1957) un poema de 584 endecasílabos sin punto final, que fluye circular e incesantemente. El dominio del verso libre exige tanto trabajo como el de la métrica regular.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Fragmento de un soneto de Sor Juana con marcas de escansión métrica y señalizaciones de figuras retóricas",
          caption: "Analizar métricamente un poema revela la arquitectura sonora que sostiene su sentido.",
        },
      ],
    },
  },

  // ── 6 ── Análisis literario ────────────────────────────────────────────────
  {
    slug: "lc-iii-metafora-hiperbole-ironia",
    titulo: "Metáfora, hipérbole e ironía: el poder del lenguaje figurado",
    categoria: "Análisis literario",
    conceptos_clave: ["metáfora", "hipérbole", "ironía", "lenguaje figurado", "figuras de sentido"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El lenguaje figurado es el lenguaje que dice una cosa para significar otra. No es un adorno retórico que los poetas añaden sobre el contenido 'real': es, en muchos casos, la única manera de acceder a ciertos significados. Decir que 'la muerte es un espejo que refleja la vida' no es decir lo mismo que 'la muerte nos hace reflexionar sobre la vida'. La metáfora produce un tipo de conocimiento que la paráfrasis informativa no puede reproducir sin pérdida.",
        },
        {
          tipo: "subtitulo",
          contenido: "La metáfora: pensar a través de imágenes",
        },
        {
          tipo: "parrafo",
          contenido:
            "La metáfora no es solo un recurso literario: es una estructura fundamental del pensamiento humano. Según los lingüistas cognitivos George Lakoff y Mark Johnson, pensamos en metáforas cuando decimos 'el tiempo es dinero', 'la mente es un recipiente', 'el debate es una guerra'. En la literatura, la metáfora se vuelve consciente y elaborada. Octavio Paz construyó en El laberinto de la soledad la metáfora del 'laberinto' para pensar la identidad mexicana: una trampa de historia y soledad de la que el pueblo busca salir.",
        },
        {
          tipo: "subtitulo",
          contenido: "Hipérbole e ironía: los extremos del lenguaje figurado",
        },
        {
          tipo: "lista",
          items: [
            "Hipérbole: exageración intencional para intensificar un sentido. 'Te lo he dicho mil veces' no es una mentira: es hipérbole que expresa frustración. En literatura, Quevedo y Sor Juana usaron la hipérbole con maestría barroca.",
            "Ironía verbal: se dice lo contrario de lo que se quiere decir, confiando en que el contexto permitirá al receptor reconocer el verdadero significado. 'Qué bonito quedó el trabajo' dicho ante un desastre es ironía.",
            "Ironía situacional: hay una contradicción entre lo que se espera y lo que ocurre. Los cuentos de Juan Rulfo están llenos de ironía situacional: personajes que buscan la justicia en un mundo donde la justicia es imposible.",
            "Ironía dramática: el lector sabe algo que el personaje ignora, lo que crea una tensión específica en la lectura.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Carlos Monsiváis fue el maestro de la ironía en la crónica mexicana. Su técnica consistía en describir un fenómeno cultural con aparente seriedad y luego añadir un detalle, una comparación o una frase que destruía la solemnidad y revelaba el absurdo. Leer a Monsiváis es aprender que la ironía puede ser una forma de amor y una forma de denuncia al mismo tiempo.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Tres paneles: uno con una metáfora visual (mariposa que se transforma en palabra), otro con una hipérbole (montaña de libros) y otro con ironía (señal que dice 'silencio' en un concierto ruidoso)",
          caption: "El lenguaje figurado no adorna el pensamiento: lo construye de manera diferente.",
        },
      ],
    },
  },

  // ── 7 ── Análisis literario ────────────────────────────────────────────────
  {
    slug: "lc-iii-subgeneros-narrativos",
    titulo: "Subgéneros narrativos: suspenso, terror y ciencia ficción",
    categoria: "Análisis literario",
    conceptos_clave: ["subgéneros narrativos", "suspenso", "terror", "ciencia ficción", "género literario"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Dentro del gran género narrativo conviven subgéneros que se distinguen por sus convenciones temáticas, sus efectos sobre el lector y sus reglas implícitas. El suspenso, el terror y la ciencia ficción son tres de los más populares y más estudiados. Lejos de ser géneros 'menores', han producido obras de enorme complejidad literaria y filosófica. En México, escritoras como Inés Arredondo en el terror psicológico y autores como Alberto Chimal en la ciencia ficción han demostrado que estos géneros son también vehículos de reflexión sobre la condición humana.",
        },
        {
          tipo: "subtitulo",
          contenido: "Las convenciones de cada subgénero",
        },
        {
          tipo: "lista",
          items: [
            "Suspenso: la tensión entre lo que el personaje (y el lector) sabe y lo que teme descubrir. El suspenso depende de la información dosificada, el tiempo narrativo dilatado y la identificación del lector con el protagonista en peligro.",
            "Terror: busca producir miedo, angustia o perturbación. Puede apelar a lo sobrenatural (monstruos, aparecidos) o a lo psicológico (el horror que viene de dentro). La mexicana Inés Arredondo exploró el terror de las relaciones humanas: la crueldad cotidiana, el deseo como fuerza destructiva.",
            "Ciencia ficción: explora mundos posibles derivados de la ciencia y la tecnología, generalmente en el futuro o en universos alternativos. No es solo entretenimiento especulativo: es filosofía sobre qué significa ser humano, qué consecuencias tienen el progreso y el poder.",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "Una de las características más interesantes de estos subgéneros es que se cruzan constantemente: hay ciencia ficción de terror, terror con estructura de suspenso, suspenso en ambientes de ciencia ficción. La literatura latinoamericana produjo el Realismo mágico precisamente como una forma de cruzar el mundo cotidiano con lo sobrenatural de manera que ninguno de los dos términos quedara por encima del otro.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Analizar un texto de género no significa solo identificar a qué subgénero pertenece. Significa preguntarse qué hace el autor con las convenciones del género: ¿las cumple, las subvierte, las mezcla? ¿Qué dice el uso de un subgénero específico sobre el contexto cultural y social en que fue producido? El género es un punto de partida, no una jaula.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Tres portadas estilizadas que representan el suspenso (sombra en un callejón), el terror (casa oscura bajo luna llena) y la ciencia ficción (ciudad futurista con drones)",
          caption: "Los subgéneros narrativos tienen sus propias reglas, que los escritores aprenden para transformarlas.",
        },
      ],
    },
  },

  // ── 8 ── Análisis literario ────────────────────────────────────────────────
  {
    slug: "lc-iii-narrativas-cuerpo-autoficcion",
    titulo: "Autoficción y narrativas del cuerpo",
    categoria: "Análisis literario",
    conceptos_clave: ["autoficción", "narrativas del cuerpo", "yo autobiográfico", "género y escritura"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La autoficción es un género híbrido que combina la narración autobiográfica con procedimientos de la ficción: el autor usa su nombre real, sus experiencias reales, pero las transforma, exagera, inventa o narra desde perspectivas que solo la ficción permite. No es exactamente la autobiografía —que tiene un pacto de verdad con el lector— ni exactamente la novela —que no pretende referir hechos reales—. Es un espacio de ambigüedad productiva que escritoras contemporáneas han explorado especialmente para narrar la experiencia del cuerpo, el género y la identidad.",
        },
        {
          tipo: "subtitulo",
          contenido: "El cuerpo como territorio literario",
        },
        {
          tipo: "parrafo",
          contenido:
            "Las narrativas del cuerpo son textos que ponen en el centro la experiencia corporal: la enfermedad, el placer, el dolor, el embarazo, la vejez, la sexualidad, la raza. Durante siglos, la literatura oficial privilegió la mente, el espíritu y las ideas por encima del cuerpo, considerado un tema bajo o vergonzoso. Las escritoras mexicanas del siglo XX y XXI —desde Rosario Castellanos hasta Cristina Rivera Garza— han reivindicado el cuerpo como territorio de conocimiento y resistencia. Escribir el cuerpo es escribir desde una experiencia concreta, situada, que la literatura universal con frecuencia ha silenciado.",
        },
        {
          tipo: "subtitulo",
          contenido: "Referentes mexicanos de la autoficción",
        },
        {
          tipo: "lista",
          items: [
            "Rosario Castellanos: sus novelas Balún Canán y Oficio de tinieblas mezclan memoria autobiográfica (vivió en Chiapas) con construcción ficcional.",
            "Inés Arredondo: sus cuentos exploran el deseo, el cuerpo y la culpa desde una perspectiva que se sitúa en la experiencia íntima de los personajes femeninos.",
            "Cristina Rivera Garza: novelista y teórica que trabaja la frontera entre el documento, la historia y la ficción. Sus obras disuelven los límites entre yo y otro.",
            "Nellie Campobello: su Cartucho (1931) es el primer relato de la Revolución Mexicana escrito por una mujer, narrado desde la perspectiva corporal de una niña que observa la violencia.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Al leer autoficción, el lector debe suspender la pregunta '¿esto es verdad?' y preguntar en cambio '¿qué efecto produce la ambigüedad entre verdad y ficción en este texto?' La autoficción no engaña: propone un pacto de lectura diferente, más complejo, que invita a reflexionar sobre los límites de la identidad y la representación.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Espejo partido en dos mitades: una refleja una cara real y la otra una cara de ficción, representando la tensión entre autobiografía y ficción en la autoficción",
          caption: "La autoficción vive en la frontera entre el yo real y el yo construido por la escritura.",
        },
      ],
    },
  },

  // ── 9 ── Movimientos literarios ────────────────────────────────────────────
  {
    slug: "lc-iii-barroco-vanguardias",
    titulo: "El Barroco: el arte de la paradoja y el exceso",
    categoria: "Movimientos literarios",
    conceptos_clave: ["Barroco", "Sor Juana Inés de la Cruz", "conceptismo", "culteranismo", "paradoja"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El Barroco es el movimiento cultural y literario que dominó Europa y América entre los siglos XVII y principios del XVIII. Su nombre proviene posiblemente del portugués 'barroco' (perla irregular), lo que ya revela su esencia: la preferencia por lo complejo, lo ornamental y lo asimétrico sobre la claridad y la proporción renacentistas. En la literatura barroca, nada es simple: las ideas se presentan en paradojas, los textos se densifican con imágenes acumuladas y el lenguaje se convierte en un laberinto de ingenio. Su contexto histórico es el de la Contrarreforma, la crisis del pensamiento medieval y los primeros síntomas del mundo moderno.",
        },
        {
          tipo: "subtitulo",
          contenido: "Sor Juana Inés de la Cruz: el Barroco americano",
        },
        {
          tipo: "parrafo",
          contenido:
            "Sor Juana Inés de la Cruz (1648-1695) es la figura cumbre del Barroco en América y una de las poetas más importantes en lengua española de cualquier época. Nacida en San Miguel Nepantla (hoy Estado de México), ingresó al convento para poder dedicarse a la filosofía, la ciencia y la poesía en una época que negaba sistemáticamente el acceso de las mujeres al conocimiento. Su poema 'Hombres necios que acusáis' es una de las piezas de pensamiento feminista más lúcidas del siglo XVII, envuelta en la forma impecable de una redondilla barroca.",
        },
        {
          tipo: "subtitulo",
          contenido: "Características del estilo barroco",
        },
        {
          tipo: "lista",
          items: [
            "Conceptismo (Quevedo): el ingenio en el juego de ideas. El significado se condensa, sorprende y contradice. Cada palabra tiene varios sentidos simultáneos.",
            "Culteranismo (Góngora): el ingenio en el trabajo sobre el lenguaje. Sintaxis latinizante, neologismos, metáforas encadenadas que hacen la lectura difícil pero visualmente deslumbrante.",
            "La paradoja: el enunciado aparentemente contradictorio que contiene una verdad profunda. 'Vivir sin vivir en mí' de Santa Teresa, o los contrastes de amor/muerte en los sonetos de Sor Juana.",
            "La desengañada visión del mundo: el Barroco desconfía de las apariencias. Lo que parece sólido es ilusión, lo que parece permanente es fugaz.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Octavio Paz escribió el ensayo Sor Juana Inés de la Cruz o las trampas de la fe (1982), uno de los estudios más profundos sobre la poeta novohispana. Para Paz, Sor Juana encarna una doble tensión: la del intelectual en conflicto con el poder y la de la mujer en conflicto con las restricciones de su género. Su obra es barroca no solo en la forma: es barroca en el conflicto.",
        },
        {
          tipo: "cita",
          contenido:
            "Hombres necios que acusáis / a la mujer sin razón, / sin ver que sois la ocasión / de lo mismo que culpáis.",
          fuente: "Sor Juana Inés de la Cruz, Redondillas (s. XVII)",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Retrato estilizado de Sor Juana Inés de la Cruz en su celda, rodeada de libros, con ornamentos barrocos en el marco",
          caption: "Sor Juana convirtió el convento en un laboratorio del pensamiento y la poesía barroca.",
        },
      ],
    },
  },

  // ── 10 ── Movimientos literarios ───────────────────────────────────────────
  {
    slug: "lc-iii-romanticismo-literario",
    titulo: "El Romanticismo: la primacía del sentimiento",
    categoria: "Movimientos literarios",
    conceptos_clave: ["Romanticismo", "subjetividad", "naturaleza", "héroe romántico", "siglo XIX"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El Romanticismo surgió en Europa a finales del siglo XVIII como una reacción contra el racionalismo ilustrado y la frialdad analítica de la razón. Si la Ilustración proclamaba que la razón era la guía suprema del ser humano, el Romanticismo respondió que el sentimiento, la intuición, la imaginación y la experiencia subjetiva eran igualmente válidas —o más— como formas de conocer el mundo. En literatura, el Romanticismo produjo una revolución en la que el 'yo' del poeta se convirtió en el centro del universo lírico.",
        },
        {
          tipo: "subtitulo",
          contenido: "Características del Romanticismo literario",
        },
        {
          tipo: "lista",
          items: [
            "Exaltación del yo: el poeta romántico habla desde su interior más íntimo. La experiencia personal —el amor, la pérdida, el entusiasmo, el suicidio— es materia literaria legítima.",
            "La naturaleza como espejo del alma: paisajes tormentosos reflejan estados de angustia; el mar agitado es la imagen del corazón enamorado. La naturaleza no es decorado sino protagonista emocional.",
            "El héroe romántico: personaje de pasiones extremas, en conflicto con la sociedad y el destino. Con frecuencia muere joven, víctima de sus propias emociones o de un mundo que no puede comprenderlo.",
            "Interés por el pasado y lo exótico: ruinas medievales, leyendas populares, países lejanos. El Romanticismo huye del presente industrial hacia mundos de misterio y autenticidad.",
            "Libertad formal: ruptura con las normas clásicas de género, metro y decoro. El escritor romántico reivindica su derecho a experimentar con la forma.",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "En México, el Romanticismo llegó con el movimiento de independencia y se desarrolló a lo largo del siglo XIX. Poetas como Manuel Acuña (1849-1873), quien se suicidó a los 24 años, encarnan el ideal del poeta romántico: su 'Nocturno a Rosario' es uno de los poemas de amor más conocidos en la literatura mexicana. Ignacio Manuel Altamirano, por su parte, usó el Romanticismo para construir una narrativa nacional mexicana con novelas como El Zarco (1901).",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El Romanticismo no es sinónimo de 'romántico' en el sentido coloquial (sentimental, cursi, relacionado con el amor). Es un movimiento estético e ideológico de gran profundidad filosófica que también abarcó la política (el liberalismo romántico), la música (Chopin, Beethoven) y las artes plásticas. Reducirlo al amor y la melancolía es empobrecer su enorme riqueza.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Paisaje nocturno con un poeta solitario ante el mar tormentoso, evocando la estética romántica del conflicto entre el yo y el mundo",
          caption: "El paisaje romántico es siempre un espejo del estado interior del poeta.",
        },
      ],
    },
  },

  // ── 11 ── Movimientos literarios ───────────────────────────────────────────
  {
    slug: "lc-iii-realismo-naturalismo",
    titulo: "Realismo y Naturalismo: la literatura ante la realidad social",
    categoria: "Movimientos literarios",
    conceptos_clave: ["Realismo", "Naturalismo", "novela decimonónica", "determinismo", "crítica social"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "En la segunda mitad del siglo XIX, el Romanticismo cedió terreno a una nueva actitud literaria: el Realismo. Frente a la exaltación del yo romántico, el Realismo propuso volver los ojos a la realidad objetiva y social: retratar la vida cotidiana de las clases medias y bajas con precisión documental, sin idealizarla ni romantizarla. El escritor realista observa, investiga, describe. Se parece más a un científico social que a un visionario poético.",
        },
        {
          tipo: "subtitulo",
          contenido: "Del Realismo al Naturalismo",
        },
        {
          tipo: "parrafo",
          contenido:
            "El Naturalismo, desarrollado sobre todo por el escritor francés Émile Zola, llevó el Realismo a sus conclusiones más extremas. Si el Realismo describe la realidad, el Naturalismo la explica: aplica a la literatura la lógica del determinismo científico, según el cual el ser humano es producto de su herencia biológica y su entorno social. Los personajes naturalistas están atrapados por fuerzas que no controlan. En la literatura mexicana, el Naturalismo influyó en la novela de la Revolución (Mariano Azuela, Nellie Campobello) y en la narrativa social del siglo XX.",
        },
        {
          tipo: "subtitulo",
          contenido: "Características del texto realista",
        },
        {
          tipo: "lista",
          items: [
            "Descripción minuciosa del entorno físico y social: el realismo cree que el contexto determina a los personajes.",
            "Personajes complejos y verosímiles: ni héroes ni villanos, sino seres humanos contradictorios con motivaciones comprensibles.",
            "Lenguaje que imita el habla coloquial: los personajes hablan como la gente real de su clase y región.",
            "Temas sociales: la pobreza, la corrupción, el trabajo, la vida familiar, las relaciones de clase son los grandes temas del Realismo.",
            "Crítica implícita: el escritor realista raramente predica, pero su descripción de la realidad contiene un juicio moral sobre las condiciones que describe.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Mariano Azuela escribió Los de abajo (1915), considerada la primera gran novela de la Revolución Mexicana y un texto de influencia naturalista. Sus soldados no son héroes: son seres que la guerra va deformando, que matan porque el contexto lo exige y que no comprenden del todo por qué luchan. Es una visión antirromántica de la Revolución que escandalizó a muchos contemporáneos.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Cuadro estilo realista del siglo XIX mostrando trabajadores industriales, con una portada de novela social al costado",
          caption: "El Realismo convirtió la vida cotidiana de las clases populares en materia literaria digna.",
        },
      ],
    },
  },

  // ── 12 ── Movimientos literarios ───────────────────────────────────────────
  {
    slug: "lc-iii-modernismo-hispanoamericano",
    titulo: "El Modernismo hispanoamericano: Darío y la renovación poética",
    categoria: "Movimientos literarios",
    conceptos_clave: ["Modernismo hispanoamericano", "Rubén Darío", "Amado Nervo", "renovación poética", "esteticismo"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El Modernismo hispanoamericano —que no debe confundirse con el modernismo anglosajón del siglo XX— fue el primer gran movimiento literario surgido en América Latina con influencia sobre la literatura española, y no al revés. Desarrollado entre 1880 y 1920 aproximadamente, el Modernismo buscó renovar la lengua poética española, que consideraba anquilosada y provinciana, a través del contacto con las tradiciones francesa (parnasianismo, simbolismo), anglosajona y asiática. Su figura central fue el nicaragüense Rubén Darío, cuya influencia en la poesía mexicana fue decisiva.",
        },
        {
          tipo: "subtitulo",
          contenido: "El Modernismo en México: Amado Nervo",
        },
        {
          tipo: "parrafo",
          contenido:
            "El poeta nayarita Amado Nervo (1870-1919) es el representante más importante del Modernismo en México. Su poesía combina la musicalidad y el esteticismo modernista con una profunda vena espiritual y filosófica. Su poema 'En paz' —que reflexiona serenamente sobre la vida vivida— fue un fenómeno de popularidad que trasciende los círculos literarios hasta hoy. Manuel Gutiérrez Nájera, fundador de la Revista Azul (1894), fue otro modernista mexicano que introdujo el esteticismo francés en la prosa de crónica.",
        },
        {
          tipo: "subtitulo",
          contenido: "Rasgos del estilo modernista",
        },
        {
          tipo: "lista",
          items: [
            "Musicalidad y cuidado extremo de la forma: 'Lo que no puede decirse, cántese' podría ser el lema modernista.",
            "Esteticismo: el arte por el arte. La belleza como valor supremo, independiente de utilidad moral o social.",
            "Cosmopolitismo: referencias a mitologías griega, escandinava, oriental. El mundo entero como fuente de imágenes.",
            "Renovación métrica: los modernistas rescataron metros olvidados, inventaron otros e introdujeron el verso libre en la poesía en español.",
            "El poeta como ser superior y marginado: sensible a lo que el vulgo no puede percibir, incomprendido por la sociedad burguesa.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El Modernismo hispanoamericano significó la emancipación literaria de América Latina. Por primera vez, los escritores latinoamericanos no miraban solo hacia España como modelo: miraban hacia Francia, hacia el mundo entero, y producían obras que los europeos admiraban. Fue el primer paso de una tradición que culminaría en el 'boom' latinoamericano del siglo XX.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Portada estilizada de Azul de Rubén Darío junto a un ejemplar de la Revista Azul mexicana, con ornamentos art nouveau",
          caption: "El Modernismo hispanoamericano renovó la poesía en español desde América Latina.",
        },
      ],
    },
  },

  // ── 13 ── Movimientos literarios ───────────────────────────────────────────
  {
    slug: "lc-iii-vanguardias-ruptura",
    titulo: "Las Vanguardias: ruptura, experimentación y provocación",
    categoria: "Movimientos literarios",
    conceptos_clave: ["Vanguardias", "surrealismo", "estridentismo", "ruptura", "experimentación"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Las Vanguardias son el conjunto de movimientos artísticos y literarios que, entre 1910 y 1940 aproximadamente, propusieron una ruptura radical con toda la tradición precedente. Cubismo, Futurismo, Dadaísmo, Surrealismo, Ultraísmo, Creacionismo: cada movimiento tenía su manifiesto, sus provocaciones y su receta para destruir el arte del pasado y crear uno nuevo. La metáfora bélica de 'vanguardia' (el frente de ataque de un ejército) era intencional: estos artistas se vivían como guerreros de la modernidad.",
        },
        {
          tipo: "subtitulo",
          contenido: "El Surrealismo y México",
        },
        {
          tipo: "parrafo",
          contenido:
            "El Surrealismo, fundado por André Breton en 1924, buscaba liberar el inconsciente a través de la escritura automática, los sueños y la asociación libre de imágenes. México tuvo una relación especial con el Surrealismo: Breton visitó el país en 1938, declaró que 'México es el país surrealista por excelencia' y conoció a artistas como Frida Kahlo y Leonora Carrington. El poeta Xavier Villaurrutia y los Contemporáneos —grupo de poetas mexicanos de los años 20 y 30— incorporaron influencias surrealistas y de la poesía moderna francesa en su obra.",
        },
        {
          tipo: "subtitulo",
          contenido: "El Estridentismo: la vanguardia mexicana",
        },
        {
          tipo: "lista",
          items: [
            "El Estridentismo (1921-1927) fue el primer movimiento de vanguardia auténticamente mexicano, liderado por Manuel Maples Arce.",
            "Celebraba la ciudad moderna, la máquina, el ruido y la velocidad como nuevas fuentes de belleza.",
            "Sus manifiestos eran provocaciones: 'Muera el cura Hidalgo', 'Chopin a la silla eléctrica'.",
            "Fue la respuesta mexicana a los movimientos europeos: una vanguardia con acento propio, surgida en el contexto posrevolucionario.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Octavio Paz fue el gran teórico de las vanguardias en la tradición hispanoamericana. En Los hijos del limo (1974) trazó la historia de la poesía moderna desde el Romanticismo hasta las vanguardias y más allá, argumentando que la ruptura y la tradición son los dos polos inevitables de cualquier modernidad literaria. Para Paz, cada poeta debe encontrar su propia manera de habitar ese conflicto.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Collage estilo dadaísta con fragmentos de texto, imágenes geométricas y tipografía experimental representando el espíritu de ruptura de las Vanguardias",
          caption: "Las Vanguardias convirtieron la ruptura con la tradición en un programa estético.",
        },
      ],
    },
  },

  // ── 14 ── Movimientos literarios ───────────────────────────────────────────
  {
    slug: "lc-iii-realismo-magico",
    titulo: "El Realismo mágico: entre lo real y lo maravilloso",
    categoria: "Movimientos literarios",
    conceptos_clave: ["Realismo mágico", "Juan Rulfo", "Carlos Fuentes", "lo real maravilloso", "narrativa latinoamericana"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El Realismo mágico es el movimiento narrativo más influyente de la literatura latinoamericana del siglo XX en el mundo. Su característica fundamental es la integración de elementos mágicos, sobrenaturales o fantásticos en un contexto realista, sin que los personajes los perciban como extraordinarios. Los muertos hablan, los objetos tienen memoria, el tiempo se dobla: y los personajes continúan su vida cotidiana como si eso fuera perfectamente normal. Esta integración sin asombro es lo que distingue el Realismo mágico de la literatura fantástica convencional.",
        },
        {
          tipo: "subtitulo",
          contenido: "Juan Rulfo: el precursor",
        },
        {
          tipo: "parrafo",
          contenido:
            "Juan Rulfo es considerado el precursor más importante del Realismo mágico mexicano. En Pedro Páramo (1955), los muertos de Comala narran sus historias desde sus tumbas con la misma naturalidad con que lo harían los vivos. El tiempo no avanza linealmente: el pasado, el presente y el mundo de los muertos se superponen en un espacio narrativo donde la muerte es tan cotidiana como la lluvia. Esta novela influyó decisivamente sobre Gabriel García Márquez, quien la leyó siete veces antes de escribir Cien años de soledad.",
        },
        {
          tipo: "subtitulo",
          contenido: "Características del Realismo mágico",
        },
        {
          tipo: "lista",
          items: [
            "Lo mágico como cotidiano: los elementos sobrenaturales no se presentan como excepciones sino como parte del mundo normal del texto.",
            "Fusión de cosmovisiones: el Realismo mágico integra la cosmovisión indígena y popular latinoamericana (donde los muertos conviven con los vivos) con la narrativa occidental.",
            "Tiempo no lineal: el tiempo se dobla, se detiene o se superpone. El pasado no ha pasado; el futuro ya ha ocurrido.",
            "Espacio mítico: los lugares del Realismo mágico (Comala, Macondo) son a la vez lugares concretos y espacios simbólicos universales.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El término 'Realismo mágico' ha sido criticado por reducir toda la diversidad de la narrativa latinoamericana a un solo estilo. Es importante recordar que muchos escritores latinoamericanos no escriben Realismo mágico, y que convertirlo en el 'sello' de la literatura del continente puede ser una forma de exotización. Carlos Fuentes, por ejemplo, usó el Realismo mágico en algunas obras (Aura) pero su obra es vastísima y diversa.",
        },
        {
          tipo: "cita",
          contenido:
            "Vine a Comala porque me dijeron que acá vivía mi padre, un tal Pedro Páramo.",
          fuente: "Juan Rulfo, Pedro Páramo (1955)",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Ilustración de un pueblo donde los vivos y los muertos conviven en la calle bajo una luna grande, evocando el universo de Rulfo",
          caption: "En el Realismo mágico, lo sobrenatural es tan cotidiano como el polvo del camino.",
        },
      ],
    },
  },

  // ── 15 ── Movimientos literarios ───────────────────────────────────────────
  {
    slug: "lc-iii-literaturas-disidentes-digitales",
    titulo: "Literaturas disidentes y digitales: nuevas voces",
    categoria: "Movimientos literarios",
    conceptos_clave: ["literatura digital", "escritura disidente", "nuevas voces", "literatura indígena contemporánea"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El siglo XXI ha traído dos transformaciones profundas en la literatura: la emergencia de voces históricamente marginadas (mujeres, comunidades indígenas, personas de la diversidad sexual, comunidades rurales y populares) y la irrupción de los medios digitales como espacio de escritura y circulación literaria. Estas dos transformaciones están relacionadas: la digitalización ha democratizado la publicación y ha permitido que voces antes excluidas del circuito editorial lleguen a lectores de todo el mundo sin pasar por los filtros de las grandes editoriales.",
        },
        {
          tipo: "subtitulo",
          contenido: "Literaturas disidentes en México",
        },
        {
          tipo: "parrafo",
          contenido:
            "Las literaturas disidentes son aquellas que cuestionan, desde la escritura, las normas dominantes de género, sexualidad, raza, clase o etnia. En México, la literatura escrita por mujeres indígenas en sus lenguas maternas (como Natalia Toledo en zapoteco) es un ejemplo de disidencia doble: frente a la norma masculina y frente a la norma del español como única lengua literaria legítima. La literatura LGBTQ+ mexicana ha producido obras como Las públicas de Luis González de Alba y la poesía de Claudia Posadas, que reivindican existencias y deseos silenciados.",
        },
        {
          tipo: "subtitulo",
          contenido: "La literatura digital: nuevas formas, nuevos lectores",
        },
        {
          tipo: "lista",
          items: [
            "Narrativa hipertextual: relatos que el lector construye siguiendo enlaces, sin un orden lineal fijo. El lector elige su propio camino.",
            "Poesía generativa: textos poéticos creados por algoritmos a partir de reglas escritas por el poeta. El código como herramienta poética.",
            "Fan fiction y escritura colectiva: comunidades que continúan, transforman o reinterpretan textos literarios o mediáticos existentes. Una forma de apropiación creativa y aprendizaje literario.",
            "Microficción en redes sociales: cuentos de 280 caracteres, poemas en Instagram, narrativas fragmentadas en Twitter que aprovechan los formatos digitales.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "La escritora y académica Cristina Rivera Garza es pionera en México en la reflexión sobre la escritura en la era digital. En sus ensayos reunidos en Los muertos indóciles (2013), propone el concepto de 'escritura colaborativa' y 'desapropiación' para pensar la autoría en la era de la red. Para Rivera Garza, escribir hoy es siempre escribir en comunidad, desde fragmentos y voces de otros.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Mano escribiendo en un teclado con palabras en lengua zapoteca flotando junto a emojis y fragmentos de código, representando la convergencia de lo disidente y lo digital",
          caption: "Las literaturas disidentes y digitales amplían quién puede escribir, en qué lengua y para qué públicos.",
        },
      ],
    },
  },

  // ── 16 ── Literatura mexicana ──────────────────────────────────────────────
  {
    slug: "lc-iii-juan-rulfo",
    titulo: "Juan Rulfo: el silencio que habla",
    categoria: "Literatura mexicana",
    conceptos_clave: ["Juan Rulfo", "Pedro Páramo", "El llano en llamas", "narrativa mexicana", "silencios literarios"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Juan Rulfo (Apulco, Jalisco, 1917 — Ciudad de México, 1986) es quizás el escritor mexicano con mayor proyección internacional: sus dos únicos libros de ficción —El llano en llamas (1953) y Pedro Páramo (1955)— han sido traducidos a más de cincuenta idiomas y son reconocidos universalmente como obras maestras de la literatura en español. Con solo dos libros delgados, Rulfo cambió para siempre la forma de narrar en México y en el mundo hispanoamericano. Su silencio posterior —no publicó más ficción en los 31 años que le quedaban de vida— forma parte de su leyenda.",
        },
        {
          tipo: "subtitulo",
          contenido: "El estilo de Rulfo: la economía del dolor",
        },
        {
          tipo: "parrafo",
          contenido:
            "El estilo de Rulfo se caracteriza por una austeridad radical: frases cortas, diálogos secos, descripciones mínimas que sin embargo crean paisajes con una presencia física abrumadora. El calor de El llano en llamas se siente; el silencio de Comala pesa. Rulfo nunca explica ni moraliza: muestra, y lo que muestra es suficiente. En sus cuentos —'No oyes ladrar los perros', 'Nos han dado la tierra', 'Macario'— la violencia, el abandono y la muerte son elementos cotidianos que los personajes aceptan con una resignación que es también una forma de dignidad.",
        },
        {
          tipo: "subtitulo",
          contenido: "Pedro Páramo: la novela que cambió todo",
        },
        {
          tipo: "lista",
          items: [
            "Juan Preciado llega a Comala buscando a su padre, Pedro Páramo, y descubre que el pueblo está poblado solo por muertos que siguen hablando.",
            "La estructura es radicalmente no lineal: fragmentos del presente de Juan Preciado se alternan con fragmentos del pasado de Pedro Páramo sin separación clara.",
            "Los muertos no saben que están muertos, o no les importa: continúan sus obsesiones, sus culpas y sus amores más allá de la vida.",
            "Pedro Páramo es el cacique que destruyó todo por amor a Susana San Juan, quien nunca lo amó de vuelta. El amor como fuerza destructiva es el motor de la novela.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "García Márquez relató que la primera vez que leyó Pedro Páramo —de pie en una librería de Ciudad de México, sin poder soltarla— la leyó entera de una vez y luego la leyó seis veces más. 'Ese libro me reveló lo que podía hacerse en literatura', dijo. Sin Rulfo no hay Macondo.",
        },
        {
          tipo: "cita",
          contenido:
            "—¿Y para qué quieres saber eso? —Le pregunté. / —Por nada —dijo—. Solo quería saber.",
          fuente: "Juan Rulfo, El llano en llamas (1953)",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Paisaje árido de Jalisco con un camino de tierra que se pierde en el horizonte, evocando el universo visual de Juan Rulfo fotógrafo y narrador",
          caption: "Rulfo fue también un gran fotógrafo: la aridez de su mirada visual y literaria son inseparables.",
        },
      ],
    },
  },

  // ── 17 ── Literatura mexicana ──────────────────────────────────────────────
  {
    slug: "lc-iii-octavio-paz-laberinto",
    titulo: "Octavio Paz: soledad, identidad y poesía",
    categoria: "Literatura mexicana",
    conceptos_clave: ["Octavio Paz", "El laberinto de la soledad", "poesía mexicana", "identidad", "Premio Nobel"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Octavio Paz (Ciudad de México, 1914-1998) es el escritor mexicano que recibió el Premio Nobel de Literatura (1990) y el más influyente ensayista del siglo XX en lengua española. Su obra abarca la poesía, el ensayo, la crítica literaria y la reflexión filosófica. En todos estos géneros, Paz vuelve obsesivamente a las mismas preguntas: qué es México, qué es la identidad, qué es el tiempo, qué es el amor y cómo el lenguaje puede dar cuenta de la experiencia más íntima.",
        },
        {
          tipo: "subtitulo",
          contenido: "El laberinto de la soledad (1950)",
        },
        {
          tipo: "parrafo",
          contenido:
            "El laberinto de la soledad es el ensayo más leído de Paz y uno de los textos fundamentales para entender la identidad mexicana tal como se pensó en el siglo XX. Paz analiza la psicología colectiva del mexicano: su hermetismo, su desconfianza, su culto a la muerte, su relación con las máscaras sociales, su complejo frente a lo extranjero. La figura del 'chingado' y el 'chingón', del macho y la chingada, proporciona un marco para entender la violencia simbólica de las relaciones de poder en México. El libro es brillante e imprescindible, y también ha sido criticado por generalizar y por hablar de 'el mexicano' en singular.",
        },
        {
          tipo: "subtitulo",
          contenido: "La poesía de Paz",
        },
        {
          tipo: "lista",
          items: [
            "Piedra de sol (1957): poema de 584 endecasílabos que termina donde empieza, siguiendo el ciclo del calendario azteca. Uno de los grandes poemas del siglo XX en español.",
            "Libertad bajo palabra (1960): colección que reúne su poesía de los años 40 y 50, de influencia surrealista y existencialista.",
            "Blanco (1967): poema-objeto donde el lector puede seguir múltiples rutas de lectura. Un experimento tipográfico y conceptual radical.",
            "Árbol adentro (1987): su último gran libro de poemas, más íntimo y reflexivo, escrito en la vejez.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El laberinto de la soledad debe leerse como lo que es: el ensayo brillante de un intelectual de 35 años con una perspectiva situada —masculina, urbana, mestiza— sobre la identidad mexicana. Sus intuiciones son poderosas y su prosa es extraordinaria. Pero muchas de sus generalizaciones sobre 'el mexicano' han sido cuestionadas por escritoras, intelectuales indígenas y feministas que señalan que Paz habla en realidad de un tipo muy específico de mexicano.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Retrato estilizado de Octavio Paz con fragmentos de sus poemas sobreimpresos, y al fondo la Piedra del Sol azteca que inspiró su famoso poema",
          caption: "Paz unió la reflexión sobre la identidad mexicana con la experimentación poética más radical.",
        },
      ],
    },
  },

  // ── 18 ── Literatura mexicana ──────────────────────────────────────────────
  {
    slug: "lc-iii-escritoras-mexicanas",
    titulo: "Escritoras mexicanas del siglo XX: voces disidentes",
    categoria: "Literatura mexicana",
    conceptos_clave: ["Rosario Castellanos", "Nellie Campobello", "Inés Arredondo", "escritoras mexicanas", "literatura de género"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La historia de la literatura mexicana durante mucho tiempo fue contada como una historia de hombres: Rulfo, Paz, Fuentes, Arreola, Monsiváis. Las escritoras existían —y producían obras extraordinarias— pero quedaban en los márgenes del canon oficial. Las últimas décadas han traído una revisión profunda de ese canon: hoy sabemos que Rosario Castellanos, Nellie Campobello, Inés Arredondo, Elena Garro y Elena Poniatowska no son 'escritoras notables a pesar de ser mujeres': son escritoras de primer orden cuya obra es inseparable de la literatura mexicana del siglo XX.",
        },
        {
          tipo: "subtitulo",
          contenido: "Rosario Castellanos (1925-1974)",
        },
        {
          tipo: "parrafo",
          contenido:
            "Rosario Castellanos nació en Ciudad de México pero creció en Comitán, Chiapas, donde convivió desde niña con las comunidades indígenas tzotziles y tzeltales. Esa experiencia marcó para siempre su escritura. Sus novelas Balún Canán (1957) y Oficio de tinieblas (1962) son dos de las primeras obras de la literatura mexicana en dar voz literaria plena a los personajes indígenas. Su poesía —Poesía no eres tú (1972)— y sus ensayos son una reflexión continua sobre qué significa ser mujer, ser mexicana, ser escritora. Su obra es feminista antes de que el feminismo fuera palabra cotidiana.",
        },
        {
          tipo: "subtitulo",
          contenido: "Nellie Campobello e Inés Arredondo",
        },
        {
          tipo: "lista",
          items: [
            "Nellie Campobello (1900-1986): su Cartucho (1931) es el primer relato de la Revolución Mexicana narrado por una mujer, y desde los ojos de una niña que observa la violencia sin comprenderla del todo. Una perspectiva radicalmente diferente a la épica masculina de Los de abajo.",
            "Inés Arredondo (1928-1989): sus Cuentos completos son uno de los conjuntos de narrativa breve más exigentes y perturbadores de la literatura mexicana. Arredondo escribe sobre el deseo, la culpa, el cuerpo y la familia desde una perspectiva que no concede moraleja ni consolación.",
            "Elena Garro (1916-1998): su novela Los recuerdos del porvenir (1963) anticipa técnicas del Realismo mágico con una sofisticación que fue ignorada por mucho tiempo. Su relación conflictiva con Octavio Paz (su exmarido) contribuyó a la marginación de su obra durante décadas.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "La poeta y narradora Rosario Castellanos murió electrocutada en Tel Aviv en 1974, mientras servía como embajadora de México en Israel. Tenía 49 años. Su muerte temprana privó a la literatura mexicana de lo que prometían ser sus mejores años. Su obra completa —poesía, novela, teatro, ensayo— es un monumento al pensamiento libre y al lenguaje preciso.",
        },
        {
          tipo: "cita",
          contenido:
            "Porque escribir / es siempre recordar lo que nunca ha existido.",
          fuente: "Rosario Castellanos, Poesía no eres tú (1972)",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Retratos estilizados de Rosario Castellanos, Nellie Campobello e Inés Arredondo en un tríptico, con fragmentos de sus obras al fondo",
          caption: "Las escritoras mexicanas del siglo XX construyeron una tradición literaria que el canon tardó en reconocer.",
        },
      ],
    },
  },

  // ── 19 ── Reseña crítica ───────────────────────────────────────────────────
  {
    slug: "lc-iii-resena-critica-estructura",
    titulo: "La reseña crítica: características y estructura",
    categoria: "Reseña crítica",
    conceptos_clave: ["reseña crítica", "estructura de la reseña", "opinión fundamentada", "texto argumentativo"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La reseña crítica es un texto breve que describe, analiza y evalúa una obra: puede ser un libro, una película, un disco, una exposición o cualquier producción cultural. No es un resumen —que solo describe el contenido— ni una opinión personal no argumentada —que solo expresa qué nos gustó o no—. Es un texto que combina la descripción informativa con el análisis y la evaluación fundamentada. Aprender a escribir reseñas es aprender a pensar públicamente sobre la cultura.",
        },
        {
          tipo: "subtitulo",
          contenido: "Estructura de la reseña crítica",
        },
        {
          tipo: "lista",
          items: [
            "Identificación de la obra: título, autor, género, editorial/productora, año. Esta información permite al lector localizar la obra.",
            "Contexto: situar la obra en el conjunto de la producción del autor, en su momento histórico o en el género al que pertenece. El contexto enriquece la evaluación.",
            "Resumen o descripción: síntesis del contenido o la propuesta de la obra. Debe ser breve: la reseña no sustituye la experiencia de la obra.",
            "Análisis: identificar los elementos formales y temáticos más relevantes. ¿Qué recursos usa el autor? ¿Qué preguntas plantea la obra? ¿Cómo los resuelve?",
            "Evaluación fundamentada: el juicio crítico sobre la calidad, originalidad o relevancia de la obra, apoyado en argumentos concretos del análisis.",
            "Recomendación: para qué tipo de lector o espectador es especialmente relevante la obra.",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "La reseña literaria tiene una tradición larga y honorable en México. La Revista de la Universidad de México, el suplemento cultural La Jornada Semanal y revistas como Nexos y Letras Libres han publicado durante décadas reseñas de alta calidad. Leer reseñas de escritores como Christopher Domínguez Michael o Juan Villoro es aprender no solo a leer sino a pensar sobre la lectura.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Una reseña crítica debe distinguirse claramente entre el resumen (qué dice o hace la obra) y la evaluación (qué tan bien lo hace y por qué importa). El error más común en los estudiantes es dedicar la reseña casi enteramente al resumen, sin llegar a la evaluación. La parte más valiosa de una reseña es precisamente el análisis y el juicio: es lo que no puede obtenerse leyendo la contraportada.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de flujo con las seis partes de la reseña crítica conectadas en orden, con el porcentaje de espacio que cada parte debería ocupar",
          caption: "La reseña crítica tiene una estructura reconocible que equilibra descripción, análisis y valoración.",
        },
      ],
    },
  },

  // ── 20 ── Reseña crítica ───────────────────────────────────────────────────
  {
    slug: "lc-iii-como-escribir-resena",
    titulo: "Cómo escribir una reseña literaria eficaz",
    categoria: "Reseña crítica",
    conceptos_clave: ["escritura de reseña", "argumentación", "voz crítica", "evaluación literaria"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Saber que una reseña debe tener estructura, análisis y evaluación es el punto de partida. El reto real está en escribirla: en encontrar una voz crítica que sea honesta sin ser cruel, argumentada sin ser pedante, accesible sin ser superficial. La reseña literaria es un género que tiene sus propios ritmos y exigencias. Este texto ofrece orientaciones prácticas para escribir una reseña que realmente funcione.",
        },
        {
          tipo: "subtitulo",
          contenido: "Antes de escribir: leer con atención crítica",
        },
        {
          tipo: "parrafo",
          contenido:
            "Una buena reseña comienza antes de escribir una sola palabra. Al leer el libro —o ver la película, escuchar el disco—, toma notas: marca los pasajes que te parecen especialmente logrados o problemáticos, registra tus preguntas y reacciones, identifica los temas que el texto trabaja con mayor insistencia. Esas notas son la materia prima de tu reseña. Un crítico que reseña sin haber leído con atención no puede fundamentar sus juicios, y el lector lo nota.",
        },
        {
          tipo: "subtitulo",
          contenido: "Claves para una reseña eficaz",
        },
        {
          tipo: "lista",
          items: [
            "Abre con gancho: la primera frase de una reseña debe capturar la atención. Puede ser una cita del libro, una afirmación provocadora, una pregunta o una imagen llamativa.",
            "Sitúa rápido: en los primeros dos párrafos, el lector debe saber qué obra se reseña, de qué trata y cuál es tu posición general hacia ella.",
            "Cita el texto: las citas concretas son la evidencia de tus argumentos. Sin ellas, tu análisis flota en el vacío.",
            "Distingue tus gustos de tus argumentos: 'No me gustó el final' es una reacción. 'El final resulta incongruente con el desarrollo del personaje porque...' es un argumento.",
            "Termina con resonancia: el cierre de la reseña debe dejar al lector con algo en qué pensar, no con un resumen de lo que ya dijiste.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "El escritor y crítico Juan Villoro ha publicado reseñas y ensayos sobre literatura en que demuestra que la crítica puede ser también literatura. Sus textos sobre Rulfo, Borges o los Beatles tienen la misma precisión y la misma voluntad estilística que sus cuentos y novelas. La mejor crítica literaria es también una obra literaria en sí misma.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Evita la reseña de 'me gustó mucho porque es muy bonito'. La evaluación sin argumentos no es crítica: es propaganda. Tampoco caigas en el exceso contrario: la reseña como demolición personal del autor. La reseña honesta habla del texto, no del autor; evalúa el trabajo, no la intención.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Computadora con una reseña en proceso de escritura junto a un libro abierto con notas al margen, representando el proceso de lectura crítica y escritura",
          caption: "La reseña literaria nace de la lectura atenta: las notas al margen son su primera versión.",
        },
      ],
    },
  },

  // ── 21 ── Reseña crítica ───────────────────────────────────────────────────
  {
    slug: "lc-iii-exposicion-oral-coloquio",
    titulo: "La exposición oral formal: coloquio, simposio y foro",
    categoria: "Reseña crítica",
    conceptos_clave: ["exposición oral", "coloquio", "simposio", "foro académico", "oralidad formal"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La exposición oral formal es la presentación de ideas, análisis o argumentos ante un público, en el marco de un evento académico, cultural o profesional. A diferencia de la conversación cotidiana, la exposición oral formal está preparada, tiene estructura, usa un registro lingüístico cuidado y respeta los tiempos y convenciones del evento en que se inscribe. Es una competencia fundamental del bachillerato y una habilidad que se usará a lo largo de toda la vida académica y profesional.",
        },
        {
          tipo: "subtitulo",
          contenido: "Formatos de exposición oral formal",
        },
        {
          tipo: "lista",
          items: [
            "Coloquio: reunión académica de pequeño formato donde los participantes presentan ponencias breves y luego dialogan entre sí y con el público. La participación activa de todos es parte del formato.",
            "Simposio: evento más formal donde expertos presentan sus perspectivas sobre un tema específico desde diferentes ángulos. El objetivo es ofrecer una visión panorámica del tema.",
            "Foro: espacio de debate abierto donde los participantes, con posiciones a veces divergentes, discuten un tema de interés público. El foro privilegia la diversidad de voces.",
            "Mesa redonda: grupo pequeño de expertos que discuten un tema con moderador. No hay 'ponencias' formales: es una conversación estructurada.",
            "Conferencia magistral: una sola persona presenta ante un público. La interacción suele limitarse a una sesión de preguntas y respuestas al final.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Cómo preparar una exposición oral exitosa",
        },
        {
          tipo: "parrafo",
          contenido:
            "La diferencia entre una exposición memorable y una olvidable está en la preparación. Una exposición oral bien preparada tiene un argumento claro (no es una colección de datos), una estructura que el oyente puede seguir, ejemplos concretos que ilustran las ideas abstractas y un cierre que deja algo en la memoria del público. La práctica en voz alta —solo o ante alguien de confianza— es indispensable: el cuerpo y la voz necesitan ensayar, no solo la mente.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "En una exposición oral formal, el lenguaje no verbal comunica tanto como las palabras: la postura corporal, el contacto visual con el público, el ritmo y el volumen de la voz, las pausas deliberadas. Una buena exposición no se lee de un papel: se habla desde un conocimiento sólido y unos apuntes que funcionan como guía, no como script. El público no quiere escuchar a alguien que lee: quiere escuchar a alguien que piensa en voz alta con claridad.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Octavio Paz fue célebre como orador. Sus conferencias en universidades de todo el mundo —recogidas en libros como Sor Juana Inés de la Cruz o las trampas de la fe— combinaban la precisión del ensayo escrito con la fluidez de la exposición oral. Preparaba sus conferencias como textos literarios, pero las pronunciaba con una naturalidad que hacía parecer que pensaba en tiempo real ante el público.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Persona de pie ante un atril frente a un pequeño auditorio, con un esquema de su exposición visible en una pantalla detrás de ella",
          caption: "La exposición oral formal es pensamiento compartido en voz alta ante una comunidad.",
        },
      ],
    },
  },
] as const;

// ---------------------------------------------------------------------------
// FUNCIÓN PRINCIPAL
// ---------------------------------------------------------------------------

export async function seedBibliotecaLCIII(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed Biblioteca LC-III (21 fichas)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac")
    .select("id")
    .eq("codigo", "LC-III")
    .single();

  if (uacErr || !uacRow) {
    throw new Error(
      `UAC LC-III no encontrada. Ejecuta primero seed-mccems.ts y seed-lciii.ts. Error: ${uacErr?.message}`
    );
  }

  const rows = FICHAS_LCIII.map((f, i) => ({
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

  if (error) throw new Error(`Error seeding fichas LC-III: ${error.message}`);

  console.log(`  ✓ ${rows.length} fichas de biblioteca de LC-III insertadas/actualizadas.`);
  console.log("\n✅ Seed Biblioteca LC-III completado.\n");
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
  seedBibliotecaLCIII(sb).catch((err) => {
    console.error("❌ Error:", err.message);
    process.exit(1);
  });
}
