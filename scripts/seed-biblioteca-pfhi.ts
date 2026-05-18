/**
 * Seed script — Biblioteca Pensamiento Filosófico y Humanístico I (PFH-I)
 * Ejecutar: npx ts-node scripts/seed-biblioteca-pfhi.ts
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

const UAC_CODIGO = "PFH-I";

const FICHAS = [
  {
    slug: "pfh-i-que-es-la-filosofia",
    titulo: "¿Qué es la Filosofía y por qué Filosofar?",
    categoria: "Introducción a la Filosofía",
    tiempo_lectura_minutos: 5,
    conceptos_clave: ["filosofía", "asombro", "pregunta filosófica", "amor a la sabiduría", "Sócrates"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "La filosofía (del griego philos = amor, sophia = sabiduría) es el amor a la sabiduría: la búsqueda reflexiva y crítica de respuestas a las preguntas más profundas sobre la realidad, el conocimiento, la moral y la existencia humana. No es una colección de respuestas, sino una disciplina de preguntas: filosofar es atreverse a preguntarse lo que otros dan por sentado." },
        { tipo: "subtitulo", contenido: "Las grandes preguntas filosóficas" },
        { tipo: "lista", items: [
          "¿Qué es la realidad? (Metafísica / Ontología)",
          "¿Qué podemos conocer? ¿Cómo lo sabemos? (Epistemología)",
          "¿Qué está bien y qué está mal? ¿Cómo debo vivir? (Ética)",
          "¿Qué es la belleza? ¿Qué es el arte? (Estética)",
          "¿Cómo debería organizarse la sociedad? (Filosofía política)",
        ] },
        { tipo: "callout", variante: "importante", contenido: "Aristóteles dijo que la filosofía comienza en el asombro (thaumazein). Cuando algo nos sorprende o nos parece extraño, cuando nos preguntamos '¿por qué es así y no de otra manera?', estamos en el umbral del filosofar. La capacidad de asombrarse con lo cotidiano es el primer paso hacia la reflexión filosófica." },
        { tipo: "parrafo", contenido: "Sócrates, el filósofo ateniense del siglo V a.C., no escribió nada: toda su filosofía la realizó dialogando en las calles de Atenas. Su método consistía en hacer preguntas para llevar a su interlocutor a examinar sus propias creencias. 'Solo sé que no sé nada' es su frase más famosa, aunque no hay evidencia de que la haya dicho exactamente así: más bien refleja su actitud de humildad epistémica." },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Retrato de Sócrates en el ágora de Atenas dialogando con ciudadanos, con el texto de sus preguntas filosóficas fundamentales alrededor", caption: "Sócrates dialogando en el ágora: la filosofía como conversación pública." },
        { tipo: "callout", variante: "sabias", contenido: "Sócrates fue condenado a muerte en 399 a.C. por 'corromper a la juventud' y 'no reconocer a los dioses de la ciudad'. En realidad, su crimen fue cuestionar las certezas de los poderosos y enseñar a los jóvenes a pensar críticamente. La filosofía puede ser peligrosa para quienes no quieren que se hagan preguntas." },
      ],
    },
  },
  {
    slug: "pfh-i-los-presocraticos",
    titulo: "Los Presocráticos: El Nacimiento del Pensamiento Racional",
    categoria: "Historia de la Filosofía",
    tiempo_lectura_minutos: 6,
    conceptos_clave: ["presocráticos", "Tales de Mileto", "Heráclito", "Parménides", "arché", "logos"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "Los filósofos presocráticos (siglos VII-V a.C.) fueron los primeros en intentar explicar el mundo usando la razón en lugar del mito. Antes de ellos, los griegos explicaban los fenómenos naturales mediante historias sobre dioses: las tormentas eran enojo de Zeus, los terremotos sacudidas de Poseidón. Los presocráticos preguntaron: ¿qué es el principio fundamental (arché) de todo lo que existe?" },
        { tipo: "subtitulo", contenido: "Los principales presocráticos y su arché" },
        { tipo: "lista", items: [
          "Tales de Mileto: el principio de todo es el agua (observó que la humedad es fundamental para la vida)",
          "Anaximandro: el principio es lo indeterminado (ápeiron), sin límites ni cualidades específicas",
          "Pitágoras: el principio son los números; la realidad tiene estructura matemática",
          "Heráclito: el principio es el fuego y el cambio constante ('no puedes bañarte dos veces en el mismo río')",
          "Parménides: la realidad verdadera es el Ser, uno, eterno e inmutable; el cambio es ilusión",
          "Demócrito: todo está compuesto de partículas indivisibles (átomos) y vacío",
        ] },
        { tipo: "callout", variante: "importante", contenido: "El debate entre Heráclito y Parménides es uno de los más fecundos de la filosofía: ¿el mundo es cambio constante o ser inmutable? Esta tensión atraviesa toda la historia del pensamiento occidental y encontrará su primera síntesis en la filosofía de Platón y Aristóteles." },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Mapa conceptual de los filósofos presocráticos con sus propuestas sobre el arché, ubicados en el mapa de la Grecia antigua", caption: "Los presocráticos y sus propuestas sobre el principio del universo." },
        { tipo: "callout", variante: "sabias", contenido: "Demócrito propuso en el siglo V a.C. que todo está formado por átomos (ἄτομος: 'lo que no puede dividirse'). Esta idea fue completamente ignorada durante casi dos milenios, hasta que la química moderna del siglo XIX la redescubrió. Es uno de los ejemplos más asombrosos de anticipación científica en la historia del pensamiento." },
      ],
    },
  },
  {
    slug: "pfh-i-platon-y-el-mundo-de-las-ideas",
    titulo: "Platón y el Mundo de las Ideas: ¿Qué es Real?",
    categoria: "Historia de la Filosofía",
    tiempo_lectura_minutos: 7,
    conceptos_clave: ["Platón", "mundo de las ideas", "alegoría de la caverna", "dualismo", "conocimiento"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "Platón (427–347 a.C.), discípulo de Sócrates, desarrolló una de las filosofías más influyentes de la historia: el dualismo ontológico. Para Platón, existen dos mundos: el mundo sensible (lo que percibimos con los sentidos: cambiante, imperfecto, ilusorio) y el mundo de las Ideas o Formas (eterno, inmutable, perfecto). Lo verdaderamente real son las Ideas, no las cosas que vemos." },
        { tipo: "subtitulo", contenido: "La Alegoría de la Caverna" },
        { tipo: "parrafo", contenido: "En 'La República', Platón presenta su famosa alegoría: imagina prisioneros encadenados en el fondo de una cueva desde su nacimiento, solo pueden ver las sombras que proyectan objetos detrás de ellos en la pared. Creen que esas sombras son la realidad. Si un prisionero es liberado y sale al sol, al principio queda cegado; pero eventualmente ve el mundo real. Cuando regresa a contar a los otros lo que vio, no le creen y quieren matarlo." },
        { tipo: "callout", variante: "importante", contenido: "La alegoría de la caverna es una metáfora del proceso educativo y filosófico: la filosofía saca al alma de la caverna de las apariencias hacia la luz del conocimiento verdadero. Las 'sombras' de la caverna representan el mundo sensible que creemos real; el 'sol' representa la Idea del Bien, principio supremo de la realidad." },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Ilustración de la alegoría de la caverna de Platón: prisioneros mirando sombras en la pared, con el camino hacia la salida donde brilla el sol", caption: "La alegoría de la caverna: de las sombras al conocimiento verdadero." },
        { tipo: "parrafo", contenido: "La filosofía de Platón influyó profundamente en el pensamiento cristiano medieval (la idea de un mundo espiritual superior al material es platónica), en la política (su 'República' propone que la sociedad ideal debe ser gobernada por filósofos-reyes), y en la epistemología (el conocimiento verdadero es racional, no sensorial)." },
        { tipo: "callout", variante: "sabias", contenido: "Alfred North Whitehead, filósofo del siglo XX, dijo que 'toda la historia de la filosofía occidental no es más que una serie de notas al pie de Platón'. Aunque es una exageración, refleja el peso inmenso que el pensamiento platónico ha tenido en la cultura occidental durante 2,400 años." },
      ],
    },
  },
  {
    slug: "pfh-i-aristoteles",
    titulo: "Aristóteles: La Filosofía como Ciencia del Ser",
    categoria: "Historia de la Filosofía",
    tiempo_lectura_minutos: 7,
    conceptos_clave: ["Aristóteles", "sustancia", "categorías", "causa final", "felicidad", "virtud"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "Aristóteles (384–322 a.C.), discípulo de Platón, representa una de las inteligencias más vastas y sistematizadoras de la historia. Fundó la lógica, la biología, la física, la metafísica, la ética, la retórica, la poética y la ciencia política como disciplinas diferenciadas. A diferencia de su maestro, Aristóteles creía que la realidad verdadera está EN las cosas, no en un mundo separado de Ideas." },
        { tipo: "subtitulo", contenido: "Las cuatro causas de Aristóteles" },
        { tipo: "lista", items: [
          "Causa material: de qué está hecho algo (la madera de la silla)",
          "Causa formal: cuál es su forma o estructura (la forma de silla)",
          "Causa eficiente: quién o qué lo produjo (el carpintero)",
          "Causa final: para qué sirve, cuál es su propósito (sentarse)",
        ] },
        { tipo: "callout", variante: "importante", contenido: "La causa final (telos) es central en la filosofía aristotélica: todo en la naturaleza tiene un propósito. Para Aristóteles, el ser humano tiene una función específica que lo distingue de los animales: el uso de la razón. La felicidad (eudaimonía) consiste en desarrollar y ejercitar plenamente nuestra capacidad racional." },
        { tipo: "parrafo", contenido: "En ética, Aristóteles desarrolló la teoría de la virtud como término medio: la virtud es el punto equidistante entre dos extremos viciosos. La valentía, por ejemplo, es el término medio entre la cobardía (defecto) y la temeridad (exceso). Las virtudes no son reglas fijas sino hábitos que se desarrollan con la práctica." },
        { tipo: "callout", variante: "sabias", contenido: "Aristóteles fue tutor de Alejandro Magno desde los 13 años del príncipe macedonio hasta que este comenzó sus conquistas. La influencia de Aristóteles en uno de los mayores conquistadores de la historia es fascinante: se dice que Alejandro llevaba siempre una copia de la Ilíada (anotada por Aristóteles) bajo su almohada junto con una daga." },
      ],
    },
  },
  {
    slug: "pfh-i-etica-y-moral",
    titulo: "Ética y Moral: ¿Cómo Debemos Vivir?",
    categoria: "Ética",
    tiempo_lectura_minutos: 6,
    conceptos_clave: ["ética", "moral", "valores", "metaética", "teorías éticas"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "La ética es la disciplina filosófica que estudia la moral: se ocupa de fundamentar, analizar y sistematizar los principios que guían el comportamiento humano. La moral, por su parte, es el conjunto de normas, valores y prácticas concretas que una persona o comunidad reconoce como correctas. La ética reflexiona sobre la moral; la moral se vive." },
        { tipo: "subtitulo", contenido: "Principales teorías éticas" },
        { tipo: "lista", items: [
          "Ética de virtudes (Aristóteles): la buena vida consiste en desarrollar virtudes (valentía, prudencia, justicia, moderación)",
          "Ética del deber o deontológica (Kant): una acción es correcta si sigue un principio universalizable (imperativo categórico)",
          "Utilitarismo (Mill, Bentham): la acción correcta maximiza el bienestar del mayor número de personas",
          "Ética del cuidado (Carol Gilligan): la moral se basa en la responsabilidad hacia los vínculos y relaciones concretas",
          "Ética existencialista (Sartre): somos radicalmente libres y responsables de nuestras elecciones",
        ] },
        { tipo: "callout", variante: "importante", contenido: "El imperativo categórico de Kant tiene varias formulaciones. Una de las más famosas: 'Actúa solo según aquella máxima que puedas querer que se convierta en ley universal'. Es decir, antes de actuar, pregúntate: ¿qué pasaría si TODOS hicieran lo mismo? Si el resultado es contradictorio o caótico, la acción está moralmente prohibida." },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Diagrama comparativo de las principales teorías éticas con sus principios, filósofos representativos y ejemplos de aplicación", caption: "Las principales teorías éticas y sus principios fundamentales." },
        { tipo: "parrafo", contenido: "Ejemplo del dilema del tranvía (trolley problem): un tranvía descontrolado va a atropellar a cinco personas. Puedes desviar el tranvía a una vía secundaria donde solo hay una persona. ¿Lo haces? La mayoría dice que sí. ¿Pero empujarías a alguien desde un puente para detener el tranvía con su cuerpo? La mayoría dice que no. ¿Por qué? El resultado es el mismo (uno muere, cinco viven), pero nuestras intuiciones morales son diferentes." },
        { tipo: "callout", variante: "sabias", contenido: "La psicóloga Carol Gilligan propuso en 1982 que las teorías éticas clásicas estaban sesgadas hacia perspectivas masculinas. Frente a la ética de la justicia (basada en reglas y derechos abstractos), propuso una ética del cuidado basada en la responsabilidad hacia relaciones concretas. Su investigación mostró que las mujeres tenden a razonar moralmente de manera diferente a los hombres, no de manera inferior." },
      ],
    },
  },
  {
    slug: "pfh-i-logica-y-argumentacion",
    titulo: "Lógica y Argumentación: El Arte de Razonar Bien",
    categoria: "Lógica y Razonamiento",
    tiempo_lectura_minutos: 7,
    conceptos_clave: ["lógica", "argumento", "premisa", "conclusión", "falacia", "razonamiento deductivo"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "La lógica es la disciplina filosófica que estudia las formas correctas de razonamiento y argumentación. Un argumento válido no es simplemente 'tener razón' o expresar una opinión con fuerza: es presentar premisas que soporten necesariamente una conclusión. La lógica es la gramática del pensamiento racional." },
        { tipo: "subtitulo", contenido: "Tipos de razonamiento" },
        { tipo: "lista", items: [
          "Deductivo: parte de principios generales para llegar a conclusiones particulares (si las premisas son verdaderas, la conclusión NECESARIAMENTE es verdadera)",
          "Inductivo: parte de casos particulares para llegar a conclusiones generales (la conclusión es PROBABLE, no necesaria)",
          "Analógico: basado en la semejanza entre dos casos (si A es similar a B en varios aspectos y B tiene la propiedad P, probablemente A también la tenga)",
          "Abductivo: infiere la mejor explicación posible para un conjunto de hechos (el método del detective)",
        ] },
        { tipo: "callout", variante: "importante", contenido: "El ejemplo más famoso de silogismo deductivo: 'Todos los hombres son mortales. Sócrates es hombre. Por lo tanto, Sócrates es mortal.' Si las dos premisas son verdaderas, la conclusión es NECESARIAMENTE verdadera. La fuerza del razonamiento deductivo está en que la conclusión ya estaba 'contenida' en las premisas." },
        { tipo: "subtitulo", contenido: "Falacias comunes: errores de razonamiento" },
        { tipo: "lista", items: [
          "Ad hominem: atacar a la persona en vez de al argumento ('¿Cómo vas a hablar de honestidad si tú mismo has mentido?')",
          "Hombre de paja: distorsionar el argumento del otro para atacar una versión más débil",
          "Pendiente resbaladiza: afirmar que A llevará inevitablemente a Z sin demostrar los pasos intermedios",
          "Apelación a la autoridad: algo es cierto porque lo dijo una persona famosa o con autoridad",
          "Falsa dicotomía: presentar solo dos opciones cuando hay más ('o estás conmigo o estás contra mí')",
          "Post hoc ergo propter hoc: confundir correlación con causalidad",
        ] },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Tarjetas visuales con ejemplos cotidianos de las falacias más comunes y cómo identificarlas en debates y redes sociales", caption: "Las falacias más comunes: aprende a identificarlas en la vida real." },
        { tipo: "callout", variante: "sabias", contenido: "Aristóteles sistematizó la lógica por primera vez en el siglo IV a.C. en sus 'Analíticos'. Su sistema de silogismos dominó la lógica occidental durante más de 2,000 años. Fue hasta el siglo XIX, con los trabajos de Frege y Russell, que la lógica se reformuló matemáticamente y se convirtió en la base de la computación moderna." },
      ],
    },
  },
  {
    slug: "pfh-i-teoria-del-conocimiento",
    titulo: "Epistemología: ¿Qué Podemos Conocer y Cómo?",
    categoria: "Teoría del Conocimiento",
    tiempo_lectura_minutos: 6,
    conceptos_clave: ["epistemología", "racionalismo", "empirismo", "escepticismo", "Descartes", "Hume"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "La epistemología (del griego episteme = conocimiento, logos = estudio) es la rama de la filosofía que investiga la naturaleza, el origen y los límites del conocimiento humano. Sus preguntas fundamentales: ¿qué podemos conocer?, ¿cómo llegamos al conocimiento?, ¿cuándo estamos justificados en decir que 'sabemos' algo?" },
        { tipo: "subtitulo", contenido: "Los grandes debates epistemológicos" },
        { tipo: "lista", items: [
          "Racionalismo: el conocimiento verdadero proviene de la razón, no de los sentidos (Descartes, Leibniz, Spinoza)",
          "Empirismo: el conocimiento tiene su origen en la experiencia sensorial (Locke, Berkeley, Hume)",
          "Kantismo: síntesis: el conocimiento resulta de la combinación de datos sensibles y estructuras racionales a priori (Kant)",
          "Escepticismo: es imposible o muy difícil tener conocimiento cierto sobre cualquier cosa",
        ] },
        { tipo: "callout", variante: "importante", contenido: "Descartes, en su 'Meditaciones' (1641), buscó un fundamento absolutamente cierto para el conocimiento. Dudó de todo lo que podía dudar — los sentidos, la matemática, el mundo exterior — hasta llegar a algo de lo que no podía dudar: el hecho de que estaba dudando. 'Cogito ergo sum': pienso, luego existo. El pensamiento es el fundamento indudable." },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Diagrama comparativo de racionalismo y empirismo con filósofos representativos, sus fuentes de conocimiento y sus fortalezas y debilidades", caption: "Racionalismo vs. Empirismo: dos tradiciones filosóficas sobre el origen del conocimiento." },
        { tipo: "parrafo", contenido: "David Hume, empirista escocés del siglo XVIII, cuestionó uno de los pilares del conocimiento científico: la causalidad. ¿Cómo sabemos que el sol saldrá mañana? Solo porque ha salido todos los días que conocemos. Pero eso no garantiza que lo hará mañana. El problema de la inducción que planteó Hume no ha sido completamente resuelto hasta hoy." },
        { tipo: "callout", variante: "sabias", contenido: "El filósofo Edmund Gettier publicó en 1963 un artículo de apenas 3 páginas que revolucionó la epistemología. Durante siglos, se había definido el conocimiento como 'creencia verdadera justificada'. Gettier presentó contraejemplos que mostraban que alguien podía tener una creencia verdadera y justificada sin que eso constituyera conocimiento. El llamado 'problema de Gettier' sigue sin resolución definitiva." },
      ],
    },
  },
  {
    slug: "pfh-i-filosofia-de-la-mente",
    titulo: "Filosofía de la Mente: ¿Qué es la Conciencia?",
    categoria: "Metafísica",
    tiempo_lectura_minutos: 6,
    conceptos_clave: ["conciencia", "problema mente-cuerpo", "dualismo", "materialismo", "inteligencia artificial"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "La filosofía de la mente estudia la naturaleza de la mente, la conciencia y su relación con el cuerpo y el cerebro. Es una de las áreas más vivas de la filosofía actual, especialmente por su intersección con la neurociencia y la inteligencia artificial. Su pregunta central: ¿qué es la conciencia y cómo emerge de la materia física?" },
        { tipo: "subtitulo", contenido: "El problema mente-cuerpo" },
        { tipo: "lista", items: [
          "Dualismo (Descartes): mente y cuerpo son dos sustancias distintas (res cogitans y res extensa). Problema: ¿cómo interactúan?",
          "Materialismo/Fisicalismo: solo existe la materia; la mente es un fenómeno del cerebro. Problema: ¿cómo explica la experiencia subjetiva?",
          "Funcionalismo: lo que importa es la función, no el sustrato. La mente es un programa que puede correr en distintos 'hardware'.",
          "Panpsiquismo: la conciencia es una propiedad fundamental de la realidad, presente en distintos grados en toda la materia.",
        ] },
        { tipo: "callout", variante: "importante", contenido: "El 'problema difícil de la conciencia' (David Chalmers): podemos explicar cómo el cerebro procesa información, pero no podemos explicar por qué ese procesamiento produce EXPERIENCIA subjetiva (el rojo se ve rojo, el dolor duele). Esta brecha entre la descripción física y la experiencia vivida es el mayor misterio de la ciencia y la filosofía." },
        { tipo: "parrafo", contenido: "El cuarto de Mary, experimento mental de Frank Jackson: Mary es una científica que sabe TODO sobre la física del color pero ha vivido toda su vida en un cuarto en blanco y negro. Cuando sale y ve el rojo por primera vez, ¿aprende algo nuevo? Si la respuesta es sí, entonces hay aspectos de la mente que no se reducen a la física." },
        { tipo: "callout", variante: "sabias", contenido: "Alan Turing, padre de la computación, propuso en 1950 el 'Test de Turing': si una máquina puede conversar con un humano de manera indistinguible a la de otro humano, puede considerarse 'inteligente'. Hoy, modelos de IA como GPT-4 pueden pasar versiones del test. Pero ¿implica eso que son conscientes? La mayoría de los filósofos dicen que no." },
      ],
    },
  },
  {
    slug: "pfh-i-estetica-y-arte",
    titulo: "Estética: ¿Qué es la Belleza y qué es el Arte?",
    categoria: "Estética",
    tiempo_lectura_minutos: 6,
    conceptos_clave: ["estética", "belleza", "arte", "juicio de gusto", "Kant", "sublime"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "La estética es la rama de la filosofía que estudia la belleza, el arte y la experiencia estética. Sus preguntas: ¿es la belleza objetiva (está en el objeto) o subjetiva (está en el observador)? ¿Qué hace que algo sea arte? ¿Puede cualquier cosa ser arte? ¿Tiene el arte una función social?" },
        { tipo: "subtitulo", contenido: "¿Es la belleza objetiva o subjetiva?" },
        { tipo: "lista", items: [
          "Objetivismo: la belleza es una propiedad real de los objetos, independiente de quien los contempla (Platón: la belleza es una Idea perfecta)",
          "Subjetivismo extremo: 'de gustos no hay nada escrito', la belleza solo existe en el ojo del espectador",
          "Kant: los juicios de gusto tienen pretensión de universalidad ('esto es bello') aunque no pueden demostrarse como verdades científicas",
        ] },
        { tipo: "callout", variante: "importante", contenido: "Para Kant, el juicio estético genuino ('esto es bello') no es simplemente decir 'me gusta' (que es puramente subjetivo) ni demostrar una propiedad objetiva (como 'esto es rojo'). Es una experiencia que pretende ser universal y necesaria, pero que no puede demostrarse: solo puede invitarse a los demás a contemplar y esperar que compartan el juicio." },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Collage de obras de arte de distintas épocas y culturas (arte rupestre, arte griego, impresionismo, arte contemporáneo) preguntando qué tienen en común que les hace arte", caption: "¿Qué tienen en común el arte rupestre, Monet y una instalación contemporánea?" },
        { tipo: "parrafo", contenido: "La pregunta '¿esto es arte?' se volvió urgente en el siglo XX cuando Marcel Duchamp exhibió en 1917 un urinario (al que llamó 'Fountain') como obra de arte. Esto planteó el problema de la 'definición del arte': si cualquier objeto puede ser arte con solo nombrarlo así, ¿qué distingue al arte de lo que no lo es? Las teorías institucionales del arte (Danto, Dickie) proponen que es arte lo que el 'mundo del arte' (museos, críticos, artistas) reconoce como tal." },
        { tipo: "callout", variante: "sabias", contenido: "En la arquitectura prehispánica mexicana, la belleza no era separada de la función ritual y cosmológica. El Templo Mayor de Tenochtitlan era bello y también era un mapa del cosmos, un instrumento de poder político y un lugar de comunicación con los dioses. Esta integración de lo estético con lo sagrado y lo político es muy diferente a la noción occidental moderna de 'arte por el arte'." },
      ],
    },
  },
  {
    slug: "pfh-i-filosofia-politica",
    titulo: "Filosofía Política: ¿Por qué Obedecemos al Estado?",
    categoria: "Filosofía Política",
    tiempo_lectura_minutos: 6,
    conceptos_clave: ["estado", "contrato social", "legitimidad", "Hobbes", "Locke", "Rousseau"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "La filosofía política estudia las preguntas fundamentales sobre el poder, el gobierno y la justicia: ¿por qué debe existir el Estado? ¿Cuándo tenemos la obligación de obedecer sus leyes? ¿Qué es una sociedad justa? ¿Qué legitima el poder político? Estas preguntas no son abstractas: tienen consecuencias concretas en cómo vivimos." },
        { tipo: "subtitulo", contenido: "La teoría del contrato social" },
        { tipo: "parrafo", contenido: "Los filósofos modernos Hobbes, Locke y Rousseau desarrollaron, con variaciones importantes, la idea del contrato social: las personas acuerdan voluntariamente (real o hipotéticamente) ceder parte de su libertad natural al Estado, a cambio de la protección y el orden que este ofrece." },
        { tipo: "lista", items: [
          "Hobbes (Leviatán, 1651): el estado de naturaleza es guerra de todos contra todos. Necesitamos un soberano absoluto para evitar el caos.",
          "Locke (Segundo tratado de gobierno, 1689): el estado de naturaleza tiene leyes morales naturales. El Estado protege la vida, libertad y propiedad; si las viola, podemos rebelarnos.",
          "Rousseau (El contrato social, 1762): el estado de naturaleza es de bondad natural. Es la sociedad la que corrompe. La voluntad general (el bien común) debe guiar al Estado.",
        ] },
        { tipo: "callout", variante: "importante", contenido: "La Declaración de Independencia de Estados Unidos (1776) y la Declaración de los Derechos del Hombre de la Revolución Francesa (1789) están directamente influidas por la filosofía política de Locke y Rousseau. Las ideas filosóficas no son juegos abstractos: han cambiado la historia del mundo." },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Línea de tiempo de los contractualistas (Hobbes 1651, Locke 1689, Rousseau 1762) con sus concepciones del estado de naturaleza y las consecuencias políticas de cada una", caption: "Los tres grandes teóricos del contrato social y sus diferencias." },
        { tipo: "callout", variante: "sabias", contenido: "John Rawls, en 'Teoría de la justicia' (1971), actualizó la idea del contrato social con el experimento mental del 'velo de ignorancia': ¿qué tipo de sociedad elegiría si no supieras en qué posición social ibas a nacer (rico/pobre, hombre/mujer, mayoría/minoría)? Rawls argumenta que elegiríamos principios de justicia que protejan especialmente a los más vulnerables, porque podría tocarnos serlo." },
      ],
    },
  },
  {
    slug: "pfh-i-filosofia-latinoamericana",
    titulo: "Filosofía Latinoamericana: Pensar desde Aquí",
    categoria: "Historia de la Filosofía",
    tiempo_lectura_minutos: 6,
    conceptos_clave: ["filosofía latinoamericana", "Leopoldo Zea", "José Vasconcelos", "raza cósmica", "filosofía de la liberación"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "¿Puede haber filosofía latinoamericana genuina, o la filosofía es siempre universal? ¿Debemos adoptar los esquemas del pensamiento europeo o existen otras tradiciones de saber desde las cuales pensar nuestra realidad? Estas preguntas han articulado el debate filosófico en América Latina desde el siglo XIX hasta hoy." },
        { tipo: "subtitulo", contenido: "Grandes corrientes de la filosofía latinoamericana" },
        { tipo: "lista", items: [
          "Positivismo latinoamericano (siglo XIX): adaptación del positivismo de Comte para modernizar las nacientes repúblicas; en México, el grupo de 'los científicos' durante el porfiriato",
          "Filosofía de lo mexicano (siglo XX): Samuel Ramos, Leopoldo Zea, Emilio Uranga; pregunta por la identidad y el ser específicamente mexicano",
          "Filosofía de la liberación: Enrique Dussel, Arturo Roig; crítica al eurocentrismo y filosofía desde la perspectiva del 'Otro', el excluido",
          "Pensamiento indígena contemporáneo: recuperación y revalorización de cosmovisiones mesoamericanas como formas alternativas de filosofía",
        ] },
        { tipo: "callout", variante: "importante", contenido: "José Vasconcelos, filósofo y rector de la UNAM en los años 20, propuso en 'La raza cósmica' (1925) que la mezcla de razas en América Latina produciría una nueva raza universal, superior a las anteriores por su síntesis de todas las culturas. Aunque el concepto de 'raza' ha sido criticado, la idea de una identidad mestiza mestiza latinoamericana ha tenido enorme influencia cultural y política." },
        { tipo: "parrafo", contenido: "Enrique Dussel, argentino-mexicano, desarrolló desde los años 70 una 'filosofía de la liberación' que parte del reconocimiento del 'Otro' excluido: el pobre, el indígena, la mujer, el migrante. Critica el eurocentrismo de la filosofía occidental que se presenta como universal pero en realidad parte de una perspectiva particular de dominación." },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Mapa de América Latina con retratos de sus principales filósofos y sus corrientes de pensamiento, destacando la diversidad geográfica e intelectual del continente", caption: "La rica tradición filosófica de América Latina." },
        { tipo: "callout", variante: "sabias", contenido: "Las cosmovisiones indígenas de Mesoamérica contienen filosofías sobre el tiempo (la concepción cíclica del tiempo, no lineal), la naturaleza (el ser humano como parte integral de la naturaleza, no su dueño), y la comunidad (el bien colectivo por encima del individual). Estos sistemas de pensamiento son formas legítimas de filosofía que la academia occidental ha tardado en reconocer." },
      ],
    },
  },
  {
    slug: "pfh-i-existencialismo",
    titulo: "Existencialismo: La Libertad como Condena y como Promesa",
    categoria: "Historia de la Filosofía",
    tiempo_lectura_minutos: 6,
    conceptos_clave: ["existencialismo", "Sartre", "Camus", "libertad", "angustia", "autenticidad", "absurdo"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "El existencialismo es la corriente filosófica del siglo XX que coloca la existencia humana concreta y la libertad radical en el centro del pensamiento. Su frase más famosa, de Jean-Paul Sartre: 'la existencia precede a la esencia'. Esto significa que no tenemos una naturaleza fija o un propósito predeterminado: primero existimos, y luego nos definimos a través de nuestras elecciones." },
        { tipo: "subtitulo", contenido: "Conceptos centrales del existencialismo" },
        { tipo: "lista", items: [
          "Libertad radical: somos absolutamente libres de elegir, incluso en situaciones extremas. 'El hombre está condenado a ser libre' (Sartre)",
          "Responsabilidad: al elegir, elegimos también una imagen de lo que debe ser el ser humano. Somos responsables de todo lo que hacemos",
          "Angustia existencial: la conciencia de nuestra libertad y responsabilidad genera angustia",
          "Autenticidad: vivir auténticamente es asumir nuestra libertad y responsabilidad, en vez de culpar a otros o a las circunstancias",
          "Absurdo (Camus): la vida no tiene sentido inherente; la condición humana es el absurdo de buscar sentido en un universo silencioso",
        ] },
        { tipo: "callout", variante: "importante", contenido: "El existencialismo surgió en Europa en el período entre las dos guerras mundiales (1918–1945), cuando la humanidad había experimentado el horror de la Primera Guerra y se asomaba al de la Segunda. En ese contexto de colapso de las certezas, la pregunta por el sentido de la existencia individual adquirió urgencia absoluta." },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Retrato de Simone de Beauvoir y Jean-Paul Sartre en el Café de Flore de París, símbolo del existencialismo literario y filosófico francés del siglo XX", caption: "De Beauvoir y Sartre: el existencialismo como filosofía y forma de vida." },
        { tipo: "callout", variante: "sabias", contenido: "Simone de Beauvoir, compañera y colega de Sartre, aplicó el existencialismo al análisis de la condición femenina en 'El segundo sexo' (1949): 'No se nace mujer, se llega a serlo'. Esta frase fundacional del feminismo existencialista argumenta que la feminidad es una construcción cultural, no una esencia biológica. De Beauvoir es tan importante como Sartre en la historia del existencialismo, aunque su obra fue durante décadas subvalorada." },
      ],
    },
  },
  {
    slug: "pfh-i-filosofia-y-ciencia",
    titulo: "Filosofía y Ciencia: ¿Cómo Sabemos lo que Sabemos?",
    categoria: "Teoría del Conocimiento",
    tiempo_lectura_minutos: 6,
    conceptos_clave: ["filosofía de la ciencia", "método científico", "falsacionismo", "Popper", "paradigma", "Kuhn"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "La filosofía de la ciencia estudia los fundamentos, métodos y alcances del conocimiento científico. ¿Qué hace que una teoría sea científica? ¿Cómo avanza la ciencia? ¿Pueden las teorías científicas ser verdaderas o solo útiles? Estas preguntas tienen consecuencias prácticas: determinan qué conocimiento aceptamos como legítimo y cuál rechazamos como pseudociencia." },
        { tipo: "subtitulo", contenido: "El problema de la demarcación" },
        { tipo: "parrafo", contenido: "¿Cómo distinguimos ciencia de no-ciencia? Karl Popper propuso el criterio de falsabilidad: una teoría científica debe poder ser refutada en principio. 'Todos los cuervos son negros' es científica porque podría refutarse encontrando un cuervo no negro. 'Dios existe' no es científica (ni falsa ni verdadera desde la ciencia) porque no puede refutarse experimentalmente." },
        { tipo: "callout", variante: "importante", contenido: "El criterio de Popper explica por qué el psicoanálisis de Freud y la astrología son cuestionables como ciencias: pueden 'explicar' cualquier resultado después del hecho, pero no hacen predicciones falsables. Una teoría que puede explicar todo no explica nada, porque no se puede probar que está equivocada." },
        { tipo: "parrafo", contenido: "Thomas Kuhn en 'La estructura de las revoluciones científicas' (1962) mostró que la ciencia no avanza linealmente acumulando hechos, sino mediante 'revoluciones' en las que un paradigma (marco conceptual dominante) es reemplazado por otro. El cambio de la astronomía ptolemaica (Tierra en el centro) a la copernicana (Sol en el centro) es un ejemplo de revolución científica." },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Diagrama de la evolución del pensamiento científico según Kuhn: ciencia normal, crisis, revolución científica, nuevo paradigma normal", caption: "El modelo de Kuhn sobre cómo cambia la ciencia." },
        { tipo: "callout", variante: "sabias", contenido: "La diferencia entre correlación y causalidad es uno de los errores más comunes en el pensamiento cotidiano y en el periodismo. Que dos variables varíen juntas (correlación) no significa que una cause la otra. Famoso ejemplo: el consumo de helado correlaciona con el número de ahogamientos. La causa real: el calor hace que la gente coma helado Y vaya a nadar. No el helado causa ahogamientos." },
      ],
    },
  },
  {
    slug: "pfh-i-filosofia-del-lenguaje",
    titulo: "Filosofía del Lenguaje: Las Palabras y el Mundo",
    categoria: "Lógica y Razonamiento",
    tiempo_lectura_minutos: 5,
    conceptos_clave: ["filosofía del lenguaje", "significado", "Wittgenstein", "juegos del lenguaje", "actos de habla"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "La filosofía del lenguaje estudia cómo las palabras y oraciones se relacionan con el mundo y cómo producen significado. En el siglo XX, muchos filósofos consideraron que los principales problemas filosóficos son en realidad problemas de lenguaje: confusiones que surgen del mal uso de las palabras." },
        { tipo: "subtitulo", contenido: "Ludwig Wittgenstein: dos filosofías" },
        { tipo: "lista", items: [
          "Wittgenstein temprano (Tractatus Logico-Philosophicus, 1921): el lenguaje es imagen lógica del mundo; los límites de mi lenguaje son los límites de mi mundo; de lo que no se puede hablar, se debe callar.",
          "Wittgenstein tardío (Investigaciones filosóficas, 1953): el significado de una palabra es su uso en el lenguaje. Los 'juegos del lenguaje' son prácticas sociales en las que las palabras adquieren sentido.",
        ] },
        { tipo: "callout", variante: "importante", contenido: "Para Wittgenstein tardío, no existe un solo 'lenguaje' sino muchos juegos del lenguaje distintos: el del científico, el del poeta, el del sacerdote, el del abogado. Cada uno tiene sus propias reglas. Los errores filosóficos surgen cuando se mezclan las reglas de un juego con las de otro." },
        { tipo: "parrafo", contenido: "La teoría de los actos de habla (Austin, Searle) muestra que el lenguaje no solo describe la realidad sino que la crea: cuando el juez dice 'te declaro culpable', cuando el sacerdote dice 'los declaro marido y mujer', cuando el presidente declara la guerra, el lenguaje no describe un estado de cosas: lo produce. Estas son 'enunciaciones performativas'." },
        { tipo: "callout", variante: "sabias", contenido: "La idea de que el lenguaje moldea nuestra percepción del mundo (hipótesis Sapir-Whorf) ha sido tanto sobreestimada como subestimada. La versión fuerte (el lenguaje determina completamente lo que podemos pensar) está desacreditada. La versión débil (el lenguaje influye en cómo percibimos y categorizamos el mundo) tiene apoyo empírico. Los hablantes de idiomas con más términos para colores perciben más matices." },
      ],
    },
  },
  {
    slug: "pfh-i-filosofia-en-la-vida-cotidiana",
    titulo: "Filosofía en la Vida Cotidiana: Filosofar para Vivir Mejor",
    categoria: "Ética",
    tiempo_lectura_minutos: 5,
    conceptos_clave: ["filosofía práctica", "estoicismo", "mindfulness", "dilemas éticos", "toma de decisiones"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "La filosofía no es solo teoría académica: es también una forma de vida. Los filósofos estoicos de la Antigüedad (Epicteto, Marco Aurelio, Séneca) desarrollaron prácticas filosóficas concretas para vivir con serenidad y sabiduría. Estas prácticas tienen sorprendente relevancia en el mundo contemporáneo." },
        { tipo: "subtitulo", contenido: "Herramientas filosóficas para la vida" },
        { tipo: "lista", items: [
          "La dicotomía estoica: distinguir lo que está en tu poder (tus juicios, deseos, acciones) de lo que no lo está (el cuerpo, la fama, la riqueza). Preocúpate solo por lo primero.",
          "El memento mori: recordar nuestra mortalidad para valorar el presente y no posponer lo importante",
          "La visión desde arriba: imaginar tu problema desde la perspectiva del cosmos para relativizarlo",
          "El journaling filosófico: escribir sobre tus experiencias, pensamientos y decisiones para examinar tu vida",
          "El diálogo socrático: aplicar la pregunta filosófica a tus propias creencias para examinar si son realmente justificadas",
        ] },
        { tipo: "callout", variante: "importante", contenido: "Marco Aurelio fue uno de los hombres más poderosos del mundo (Emperador de Roma, 161-180 d.C.) y aun así llevó un diario filosófico personal ('Meditaciones') en el que se recordaba constantemente sus deberes estoicos, luchaba contra la soberbia del poder y reflexionaba sobre la fugacidad de la vida. La filosofía era para él una disciplina diaria, no un sistema abstracto." },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Persona reflexionando con un diario abierto, rodeada de citas de filósofos estoicos sobre el control del pensamiento y la ecuanimidad ante las adversidades", caption: "El estoicismo como filosofía práctica para la vida contemporánea." },
        { tipo: "callout", variante: "sabias", contenido: "La terapia cognitivo-conductual (TCC), la psicoterapia más ampliamente respaldada por evidencia científica, tiene raíces directas en la filosofía estoica. El principio central de la TCC —que no son las situaciones sino nuestros pensamientos sobre ellas los que determinan nuestras emociones— es exactamente la enseñanza central de Epicteto en el siglo I d.C." },
      ],
    },
  },
  {
    slug: "pfh-i-bioetica",
    titulo: "Bioética: Filosofía ante los Dilemas de la Ciencia y la Medicina",
    categoria: "Ética",
    tiempo_lectura_minutos: 6,
    conceptos_clave: ["bioética", "eutanasia", "clonación", "genética", "consentimiento informado", "principios bioéticos"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "La bioética es la disciplina que aplica el razonamiento filosófico y ético a los dilemas que plantean las ciencias de la vida y la medicina. Los avances tecnológicos han creado situaciones que requieren reflexión moral profunda: ¿cuándo es ético terminar con la vida de un paciente terminal? ¿Es correcto modificar genéticamente embriones humanos? ¿Tienen derechos los animales?" },
        { tipo: "subtitulo", contenido: "Los cuatro principios de la bioética (Beauchamp y Childress)" },
        { tipo: "lista", items: [
          "Autonomía: respetar el derecho del paciente a decidir sobre su propio cuerpo y tratamiento",
          "Beneficencia: actuar en beneficio del paciente (hacer el bien)",
          "No maleficencia: no causar daño (primum non nocere)",
          "Justicia: distribución equitativa de los recursos y beneficios de la medicina",
        ] },
        { tipo: "callout", variante: "importante", contenido: "El consentimiento informado es la aplicación práctica del principio de autonomía: antes de cualquier procedimiento médico, el paciente debe recibir información clara sobre el diagnóstico, las opciones de tratamiento, los riesgos y beneficios, y debe poder elegir libremente. Sin consentimiento informado, incluso un tratamiento que salva vidas puede ser éticamente cuestionable." },
        { tipo: "parrafo", contenido: "La eutanasia (buena muerte) es uno de los debates bioéticos más intensos: ¿tiene una persona el derecho de elegir cuándo y cómo morir? ¿Puede el Estado o la medicina negarle esa elección? En México, la eutanasia activa es ilegal, pero la 'ortotanasia' (suspender tratamientos fútiles en enfermos terminales) fue despenalizada en varias entidades. Países como Países Bajos, Bélgica y Canadá la han legalizado bajo estrictas condiciones." },
        { tipo: "callout", variante: "sabias", contenido: "En 2018, el científico chino He Jiankui anunció que había editado genéticamente embriones humanos con CRISPR para hacerlos resistentes al VIH, naciendo dos bebés con genomas modificados. Fue condenado internacionalmente por la comunidad científica y encarcelado en China. El caso mostró que los avances biotecnológicos avanzan más rápido que los consensos éticos y las regulaciones." },
      ],
    },
  },
  {
    slug: "pfh-i-filosofia-de-la-religion",
    titulo: "Filosofía de la Religión: Razón y Fe",
    categoria: "Metafísica",
    tiempo_lectura_minutos: 5,
    conceptos_clave: ["filosofía de la religión", "argumentos para la existencia de Dios", "ateísmo", "agnosticismo", "secularismo"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "La filosofía de la religión no estudia qué religión es verdadera, sino las preguntas filosóficas que surgen de la creencia religiosa: ¿puede demostrarse la existencia de Dios? ¿Son compatibles la fe y la razón? ¿Puede haber moral sin religión? ¿Qué significa la experiencia religiosa? Es un campo de reflexión que respeta tanto la fe como el escepticismo." },
        { tipo: "subtitulo", contenido: "Argumentos filosóficos sobre la existencia de Dios" },
        { tipo: "lista", items: [
          "Argumento cosmológico: todo lo que existe tiene una causa; debe haber una causa primera (un ser no causado) que es Dios (Tomás de Aquino)",
          "Argumento ontológico: Dios se define como el ser más perfecto concebible; existir es más perfecto que no existir; por lo tanto Dios existe (Anselmo)",
          "Argumento del diseño: la complejidad del universo sugiere un diseñador inteligente (análogo al reloj y el relojero)",
          "Problema del mal: si Dios es omnipotente, omnisciente y bueno, ¿por qué existe el sufrimiento? (Argumento contra la existencia de Dios)",
        ] },
        { tipo: "callout", variante: "importante", contenido: "El problema del mal (teodicea) es considerado el mayor argumento filosófico contra la existencia de un Dios omnipotente y bueno: si Dios puede evitar el sufrimiento de los inocentes y no lo hace, o no puede o no quiere. Las respuestas teísticas (el libre albedrío, el mal como oportunidad de crecimiento) satisfacen a algunos, pero no a todos." },
        { tipo: "parrafo", contenido: "La distinción entre ateísmo (no creer en la existencia de dioses), agnosticismo (no saber si Dios existe) y teísmo (creer en la existencia de Dios) es más compleja de lo que parece. Bertrand Russell señaló que el agnosticismo y el ateísmo no son posiciones simétricas: el ateísta no afirma que Dios no existe, solo suspende la creencia ante la falta de evidencia suficiente." },
        { tipo: "callout", variante: "sabias", contenido: "Baruch Spinoza, filósofo judío holandés del siglo XVII, propuso que Dios y la Naturaleza son la misma cosa (panteísmo). Esta idea le valió ser excomulgado de su comunidad judía. Su filosofía influyó en Einstein, quien dijo creer 'en el Dios de Spinoza, que se revela en la armonía de todo lo que existe, no en un Dios que se ocupa de los destinos y acciones de los seres humanos'." },
      ],
    },
  },
  {
    slug: "pfh-i-pensamiento-critico",
    titulo: "Pensamiento Crítico: La Herramienta Filosófica para el Siglo XXI",
    categoria: "Lógica y Razonamiento",
    tiempo_lectura_minutos: 6,
    conceptos_clave: ["pensamiento crítico", "sesgos cognitivos", "análisis", "evaluación de argumentos", "metacognición"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "El pensamiento crítico es la capacidad de analizar, evaluar y cuestionar ideas, argumentos e información de manera rigurosa y reflexiva, en lugar de aceptarlos acríticamente. No es escepticismo absoluto ni negatividad: es la disposición a examinar las razones que sustentan las creencias, incluyendo las propias." },
        { tipo: "subtitulo", contenido: "Habilidades del pensador crítico" },
        { tipo: "lista", items: [
          "Identificar y evaluar argumentos: distinguir premisas de conclusiones, detectar falacias",
          "Reconocer sesgos propios: somos todos vulnerables a la confirmación de nuestras creencias previas",
          "Tolerar la ambigüedad: resistir la presión de adoptar una posición antes de tener evidencia suficiente",
          "Perspectiva múltiple: considerar una cuestión desde distintos puntos de vista antes de concluir",
          "Metacognición: pensar sobre el propio proceso de pensar; ¿cómo llegué a esta conclusión?",
        ] },
        { tipo: "callout", variante: "importante", contenido: "El sesgo de confirmación es uno de los más perniciosos: la tendencia a buscar, interpretar y recordar información de manera que confirme nuestras creencias previas. Las redes sociales amplifican este sesgo al crear cámaras de eco donde solo escuchamos a quienes ya piensan como nosotros. El antídoto: buscar activamente las mejores versiones de los argumentos contrarios." },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Diagrama del proceso de pensamiento crítico: observar, analizar, inferir, evaluar, actuar; con ejemplos de preguntas en cada etapa", caption: "El proceso del pensamiento crítico: de la observación a la acción fundamentada." },
        { tipo: "parrafo", contenido: "El pensamiento crítico no significa que todas las opiniones sean igualmente válidas (relativismo). Significa que las ideas deben evaluarse según criterios de coherencia lógica, consistencia con la evidencia disponible y claridad conceptual. Algunas ideas están mejor fundamentadas que otras, y podemos identificar cuáles con las herramientas filosóficas adecuadas." },
        { tipo: "callout", variante: "sabias", contenido: "El estudio de Filosofía mejora el rendimiento en exámenes estandarizados como el SAT y el GRE más que cualquier otra disciplina, según investigaciones de universidades estadounidenses. Esto se debe a que la filosofía entrena específicamente las habilidades de lectura crítica, análisis lógico y argumentación escrita que estos exámenes miden." },
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
