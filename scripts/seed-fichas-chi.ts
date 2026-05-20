/**
 * Seed de fichas de biblioteca para CH-I (Conciencia Histórica I).
 * 15 fichas temáticas alineadas al MCCEMS 2025, Semestre 4, FAMILIA NUEVA.
 *
 * Uso: npx tsx scripts/seed-fichas-chi.ts
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

const FICHAS_CHI = [
  // ── 1 ── Fuentes históricas ─────────────────────────────────────────────────
  {
    slug: "ch-i-coordenadas-espacio-temporales",
    titulo: "Coordenadas espacio-temporales: el primer paso del historiador",
    categoria: "Fuentes históricas",
    conceptos_clave: ["coordenadas históricas", "tiempo histórico", "espacio histórico", "ubicación cronológica", "metodología histórica"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Antes de analizar cualquier evento del pasado, el historiador necesita situarlo en dos ejes fundamentales: el tiempo y el espacio. Las coordenadas espacio-temporales son el sistema de referencia básico de la investigación histórica. Responden a las preguntas: ¿cuándo ocurrió? y ¿dónde ocurrió? Sin este anclaje, los eventos flotan sin contexto y resulta imposible comprender sus causas, sus consecuencias y las relaciones entre ellos. Localizar un hecho en el tiempo implica asignarle una fecha o período; localizarlo en el espacio implica identificar el territorio, la región o la comunidad donde tuvo lugar.",
        },
        {
          tipo: "subtitulo",
          contenido: "Por qué el espacio importa tanto como el tiempo",
        },
        {
          tipo: "parrafo",
          contenido:
            "Un mismo período puede tener significados muy distintos según el lugar. El siglo XVI en Europa es la era del Renacimiento y la Reforma protestante; ese mismo siglo en Mesoamérica es el de la Conquista española y la transformación radical de las sociedades indígenas. Estudiar la historia de México requiere distinguir la perspectiva desde Tenochtitlan, desde Tlaxcala, desde España y desde las comunidades del Golfo. El espacio geográfico no es un mero escenario: condiciona las relaciones económicas, los conflictos políticos y las formas culturales. Los ríos, los climas, las rutas comerciales y las fronteras son elementos activos de la historia.",
        },
        {
          tipo: "subtitulo",
          contenido: "Instrumentos para situar eventos en el tiempo",
        },
        {
          tipo: "lista",
          items: [
            "Línea del tiempo: representación gráfica que ordena eventos en orden cronológico sobre un eje.",
            "Periodización: agrupación de años en períodos significativos (colonial, independiente, posrevolucionario).",
            "Cronología absoluta: fecha exacta expresada en un sistema de calendario (d.C., a.C., calendario gregoriano).",
            "Cronología relativa: datación de eventos en relación con otros (antes de la Revolución, después de la Conquista).",
            "Sincronía y diacronía: análisis de lo que ocurre simultáneamente (sincronía) frente a lo que cambia con el tiempo (diacronía).",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Establecer las coordenadas espacio-temporales no es un mero trámite formal: es un acto interpretativo. Decidir que la historia de México comienza en el período prehispánico, en 1521 con la Conquista o en 1810 con la Independencia refleja una postura sobre qué cuenta como punto de origen de la nación. La periodización siempre es una elección metodológica, no un dato objetivo.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Mapa de Mesoamérica con una línea del tiempo superpuesta que muestra las principales culturas y períodos desde el Preclásico hasta la época colonial",
          caption: "El espacio y el tiempo son los dos ejes sobre los que se construye cualquier narración histórica.",
        },
      ],
    },
  },

  // ── 2 ── Fuentes históricas ─────────────────────────────────────────────────
  {
    slug: "ch-i-fuentes-primarias-secundarias",
    titulo: "Fuentes primarias y secundarias: ¿de dónde viene el conocimiento histórico?",
    categoria: "Fuentes históricas",
    conceptos_clave: ["fuentes primarias", "fuentes secundarias", "fuentes terciarias", "crítica de fuentes", "heurística histórica"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El conocimiento histórico no surge de la nada: se construye a partir de vestigios del pasado llamados fuentes. Una fuente histórica es cualquier documento, objeto, imagen, monumento, tradición oral o registro que nos proporcione información sobre el pasado. Los historiadores clasifican estas fuentes en dos grandes categorías: primarias y secundarias. Esta distinción es fundamental para evaluar la confiabilidad y la cercanía de la evidencia al evento estudiado.",
        },
        {
          tipo: "subtitulo",
          contenido: "Fuentes primarias: la evidencia directa",
        },
        {
          tipo: "parrafo",
          contenido:
            "Una fuente primaria es un documento o artefacto producido durante el período histórico que se estudia, o por alguien que fue testigo directo de los hechos. Su valor reside en la cercanía temporal y espacial al evento. Son fuentes primarias: los códices prehispánicos como el Códice Mendoza (elaborado alrededor de 1541, poco después de la Conquista), las cartas de relación de Hernán Cortés al rey Carlos I, los diarios de campaña de los soldados de la Independencia, las fotografías de la Revolución Mexicana tomadas por Agustín Victor Casasola, o los registros de nacimiento y defunción en archivos parroquiales. No son necesariamente más 'verdaderas' que las secundarias, pero sí son más cercanas a los hechos.",
        },
        {
          tipo: "subtitulo",
          contenido: "Diferencias clave entre tipos de fuentes",
        },
        {
          tipo: "lista",
          items: [
            "Fuente primaria: producida en la época estudiada o por testigos directos. Ejemplos: el Códice Mendoza (c. 1541), las actas del Congreso Constituyente de 1917.",
            "Fuente secundaria: elaborada por historiadores que analizan fuentes primarias a posteriori. Ejemplos: 'México Profundo' de Guillermo Bonfil Batalla (1987).",
            "Fuente terciaria: síntesis de fuentes secundarias, como enciclopedias o libros de texto.",
            "Fuente material: artefactos físicos (cerámica, utensilios, edificios) que no fueron escritos pero contienen información histórica.",
            "Fuente oral: testimonios transmitidos verbalmente, desde la tradición indígena hasta las entrevistas de historia oral.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Ninguna fuente es neutral. Toda fuente fue producida por alguien, en un contexto, con un propósito. El Códice Mendoza fue elaborado por encargo del virrey Antonio de Mendoza para informar al rey de España sobre los aztecas: refleja tanto la cultura mexica como los intereses coloniales. La crítica de fuentes — preguntar quién produjo el documento, para quién, cuándo y con qué fin — es la operación metodológica básica del historiador.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama que muestra la jerarquía de fuentes históricas: primarias (documento original), secundarias (análisis histórico) y terciarias (enciclopedia), con ejemplos mexicanos en cada nivel",
          caption: "La crítica de fuentes pregunta: ¿quién produjo este documento, para quién y con qué propósito?",
        },
      ],
    },
  },

  // ── 3 ── Fuentes históricas ─────────────────────────────────────────────────
  {
    slug: "ch-i-agn-archivo-general-nacion",
    titulo: "El AGN: el Archivo General de la Nación y la memoria documental de México",
    categoria: "Fuentes históricas",
    conceptos_clave: ["AGN", "archivo histórico", "fuentes documentales", "paleografía", "Lecumberri"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El Archivo General de la Nación (AGN), ubicado en el Palacio de Lecumberri en la Ciudad de México, es el repositorio documental más importante de México y uno de los archivos históricos más grandes de América Latina. Fundado en 1790 por el virrey Juan Vicente de Güemes Pacheco, alberga más de 43 kilómetros lineales de documentos que abarcan desde el período virreinal hasta el siglo XX. Sus fondos incluyen expedientes del Tribunal del Santo Oficio de la Inquisición, registros de tierras, padrones de población, archivos presidenciales y documentos de la Revolución Mexicana. Hoy sus acervos están parcialmente digitalizados y son accesibles en línea.",
        },
        {
          tipo: "subtitulo",
          contenido: "Tipos de documentos y lo que revelan",
        },
        {
          tipo: "parrafo",
          contenido:
            "Los fondos del AGN son una ventana a la vida cotidiana, política y social de México a lo largo de cinco siglos. Los expedientes inquisitoriales (siglos XVI-XIX) permiten estudiar las creencias, los miedos y los conflictos de la sociedad colonial. Los registros de encomiendas y mercedes de tierras documentan la distribución territorial y las relaciones entre españoles e indígenas. Los padrones y censos muestran la composición étnica y ocupacional de las ciudades y pueblos. Los archivos de la Secretaría de Gobernación contienen información sobre movimientos sociales del siglo XX, incluyendo el movimiento estudiantil de 1968. Cada tipo de fuente responde preguntas distintas y tiene limitaciones distintas.",
        },
        {
          tipo: "subtitulo",
          contenido: "Cómo trabajan los historiadores en un archivo",
        },
        {
          tipo: "lista",
          items: [
            "Heurística: localización y selección de fuentes relevantes para la pregunta de investigación.",
            "Paleografía: descifrado de escrituras antiguas, ya que los documentos coloniales usan letras y abreviaturas distintas a las actuales.",
            "Crítica externa: verificación de la autenticidad del documento (¿es original?, ¿hay falsificaciones?).",
            "Crítica interna: análisis del contenido para evaluar la confiabilidad y el punto de vista del autor.",
            "Comparación: contraste de varios documentos sobre el mismo hecho para triangular la información.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "El Palacio de Lecumberri, hoy sede del AGN, fue construido entre 1885 y 1900 durante el porfiriato como penitenciaría 'modelo' según el sistema panóptico del inglés Jeremy Bentham. En sus celdas estuvieron presos, entre otros, el revolucionario Francisco I. Madero (1910) y el muralista David Alfaro Siqueiros (1960-1964). En 1976, fue transformado en archivo. El edificio mismo es una fuente histórica: su arquitectura habla de los ideales de modernización, control social y justicia del Porfiriato.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Fotografía esquemática del Palacio de Lecumberri con su planta radial característica, junto a la imagen de un expediente colonial manuscrito del AGN",
          caption: "El AGN conserva más de 43 kilómetros de documentos que narran la historia de México desde el virreinato.",
        },
      ],
    },
  },

  // ── 4 ── Procesos históricos ────────────────────────────────────────────────
  {
    slug: "ch-i-tiempo-cronologico-ciclico",
    titulo: "Tiempo cronológico, cíclico y subjetivo: tres formas de vivir la historia",
    categoria: "Procesos históricos de México",
    conceptos_clave: ["tiempo cronológico", "tiempo cíclico", "tiempo subjetivo", "calendarios mesoamericanos", "formas de temporalidad"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "No todas las culturas conciben el tiempo de la misma manera. La historiografía occidental moderna trabaja principalmente con el tiempo cronológico o lineal: una sucesión irreversible de momentos que avanzan del pasado hacia el futuro sin repetirse. Pero otras tradiciones culturales —incluyendo las de los pueblos indígenas de México— han organizado su comprensión del tiempo de modo cíclico: el tiempo se repite en ciclos predecibles de días, años o eras. Además, existe el tiempo subjetivo o vivido, que es la experiencia personal e interna del tiempo: cómo los actores históricos experimentaron su propio presente.",
        },
        {
          tipo: "subtitulo",
          contenido: "El tiempo cíclico en Mesoamérica",
        },
        {
          tipo: "parrafo",
          contenido:
            "Para los mayas y los mexicas, el tiempo no avanzaba linealmente sino en ciclos interconectados. El calendario azteca combinaba el Tonalpohualli (ciclo ritual de 260 días, base de la astrología y los rituales) con el Xiuhpohualli (año solar de 365 días). Cada combinación única de ambos ciclos se repetía cada 52 años, formando el 'Siglo Azteca'. El fin de cada ciclo de 52 años era un momento de crisis cósmica: si los dioses no eran propiciados con el ritual del Fuego Nuevo, el sol podía dejar de salir y el mundo terminar. Esta concepción cíclica del tiempo impregnaba la política, la guerra, la agricultura y la vida cotidiana mexica.",
        },
        {
          tipo: "subtitulo",
          contenido: "Las tres formas de tiempo histórico",
        },
        {
          tipo: "lista",
          items: [
            "Tiempo cronológico: sucesión lineal e irreversible de fechas. Herramienta principal de la historiografía académica occidental.",
            "Tiempo cíclico: repetición de patrones en períodos regulares. Base de los calendarios mesoamericanos y de muchas cosmologías agrícolas.",
            "Tiempo subjetivo: cómo los actores vivieron e interpretaron su propio tiempo. Relevante para la historia de las mentalidades y la microhistoria.",
            "Larga duración (Braudel): procesos históricos que se extienden por siglos (geografía, economía, mentalidades).",
            "Tiempo de la coyuntura: procesos de décadas (ciclos económicos, guerras prolongadas).",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El historiador francés Fernand Braudel (1902-1985) propuso que la historia opera en tres ritmos temporales simultáneos: la larga duración (los cambios casi imperceptibles de la geografía y las estructuras sociales), la coyuntura (los ciclos de décadas) y el acontecimiento (el evento puntual, la historia política tradicional). Esta distinción es central en la historiografía contemporánea: para entender la Revolución Mexicana, no basta con narrar batallas; hay que analizar las estructuras agrarias que la hicieron posible.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "La Piedra del Sol azteca (llamada popularmente 'Calendario Azteca') con sus círculos concéntricos que representan los ciclos temporales mexicas, junto a una línea del tiempo occidental de comparación",
          caption: "La Piedra del Sol, esculpida en 1479, es una representación cosmológica del tiempo cíclico mexica.",
        },
      ],
    },
  },

  // ── 5 ── Procesos históricos ────────────────────────────────────────────────
  {
    slug: "ch-i-revolucion-mexicana-causas",
    titulo: "La Revolución Mexicana (1910-1920): causas estructurales y detonantes",
    categoria: "Procesos históricos de México",
    conceptos_clave: ["Revolución Mexicana", "Porfiriato", "hacienda", "Francisco I. Madero", "Plan de San Luis"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La Revolución Mexicana (1910-1920) es el proceso histórico más transformador del México contemporáneo. No fue un evento súbito ni un simple cuartelazo: fue el resultado de décadas de acumulación de tensiones sociales, económicas y políticas bajo el régimen de Porfirio Díaz (1876-1910). El Porfiriato logró modernizar la economía con ferrocarriles, minería y exportaciones, pero a un costo enorme: la concentración de la tierra en pocas manos, la represión política, el despojo de comunidades indígenas y la exclusión de las clases medias urbanas del poder. Cuando Francisco I. Madero convocó a las armas en noviembre de 1910, décadas de descontento encontraron su momento.",
        },
        {
          tipo: "subtitulo",
          contenido: "Causas estructurales del movimiento revolucionario",
        },
        {
          tipo: "lista",
          items: [
            "Concentración de la tierra: en 1910, el 1% de la población controlaba el 97% de la superficie agraria. Millones de campesinos trabajaban en haciendas sin tierra propia.",
            "Exclusión política: Díaz gobernó más de 30 años suprimiendo elecciones libres, la prensa independiente y los partidos de oposición.",
            "Desigualdad étnica y social: las comunidades indígenas sufrieron el despojo legal de sus ejidos bajo la Ley Lerdo (1856) y la Ley de Baldíos (1894).",
            "Surgimiento de clases medias: el propio desarrollo porfiriano generó profesionistas, comerciantes y empleados que exigían participación política.",
            "Dependencia del capital extranjero: la economía porfiriana favorecía a inversionistas estadounidenses y europeos sobre los empresarios nacionales.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "El detonante: el Plan de San Luis (1910)",
        },
        {
          tipo: "parrafo",
          contenido:
            "Francisco I. Madero lanzó el Plan de San Luis Potosí el 5 de octubre de 1910, convocando a un levantamiento armado para el 20 de noviembre. El plan denunciaba el fraude electoral que había llevado a Díaz a su octava reelección y prometía restituir las tierras usurpadas a los pueblos. La respuesta fue inmediata: en el norte, Pascual Orozco y Francisco Villa levantaron ejércitos populares; en el sur, Emiliano Zapata encabezó a los campesinos de Morelos bajo el lema 'Tierra y Libertad'. La multiplicidad de actores y demandas hace de la Revolución un proceso multicausal y multifacético que no puede reducirse a una sola narrativa.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "La Revolución Mexicana produjo la Constitución de 1917, la primera constitución del mundo en incluir derechos sociales: el derecho a la educación (artículo 3), los derechos laborales (artículo 123) y la propiedad originaria de la nación sobre las tierras y aguas (artículo 27). Estos artículos fueron el resultado de las demandas campesinas y obreras que habían impulsado la revolución. La Constitución de 1917 sirvió de modelo para los movimientos de derechos sociales en América Latina y Europa.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Fotografía histórica de las tropas zapatistas y villistas en la Ciudad de México en 1914, junto a un mapa de los principales frentes revolucionarios en el territorio mexicano",
          caption: "La Revolución Mexicana (1910-1920) transformó las estructuras agrarias, políticas y sociales del país.",
        },
      ],
    },
  },

  // ── 6 ── Procesos históricos ────────────────────────────────────────────────
  {
    slug: "ch-i-conquista-mexico-1521",
    titulo: "La Conquista de México (1519-1521): un proceso multicultural y violento",
    categoria: "Procesos históricos de México",
    conceptos_clave: ["Conquista de México", "Hernán Cortés", "Tenochtitlan", "alianzas indígenas", "caída del Imperio Mexica"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La Conquista de México (1519-1521) es uno de los procesos históricos más complejos, violentos y debatidos de la historia universal. La caída del Imperio Mexica ante las fuerzas de Hernán Cortés no fue simplemente la derrota de un ejército por otro: fue el resultado de alianzas políticas, epidemias devastadoras, conflictos internos del mundo indígena y la tecnología militar europea. Entender la Conquista requiere reconocer múltiples perspectivas y rechazar las narrativas simplistas tanto de la 'civilización victoriosa' como del 'choque de mundos irreconciliables'.",
        },
        {
          tipo: "subtitulo",
          contenido: "Factores que explican la caída de Tenochtitlan",
        },
        {
          tipo: "lista",
          items: [
            "Alianzas con pueblos sometidos: Tlaxcaltecos, totonacas, cholultecas y otros pueblos oprimidos por los mexicas se unieron a Cortés como aliados estratégicos.",
            "Epidemias: la viruela, desconocida en América, devastó a la población indígena antes y durante el asedio de Tenochtitlan. Cuitláhuac, sucesor de Moctezuma, murió de viruela en 1520.",
            "Ventaja tecnológica: los caballos, la artillería y las armaduras de acero daban ventaja en campo abierto, aunque no en las calzadas de Tenochtitlan.",
            "División política mexica: el asesinato de Moctezuma II (1520) y las disputas sucesorias debilitaron la cohesión del Imperio.",
            "La Noche Triste (junio 1520): los españoles fueron expulsados de Tenochtitlan con grandes pérdidas, lo que demuestra que la victoria no fue sencilla.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Perspectivas historiográficas sobre la Conquista",
        },
        {
          tipo: "parrafo",
          contenido:
            "La Conquista ha sido narrada de maneras radicalmente distintas según el período y el punto de vista. La visión providencialista colonial (fray Bartolomé de las Casas incluido) la interpretó como la expansión de la fe cristiana. La historiografía liberal del siglo XIX la vio como el origen de una sociedad mestiza. La visión indigenista del siglo XX, representada por escritores como Miguel León-Portilla en 'Visión de los vencidos' (1959), recuperó las fuentes en náhuatl para mostrar la experiencia de los conquistados. Ninguna versión captura la totalidad: la metodología histórica exige confrontar múltiples fuentes y perspectivas.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El 13 de agosto de 1521, Cuauhtémoc fue capturado en una canoa mientras intentaba escapar de Tenochtitlan destruida. Esta fecha marca la caída del Imperio Mexica, pero no el fin de la resistencia indígena: durante el siglo XVI persistieron rebeliones en todo el territorio novohispano. La periodización 'Conquista: 1521' es una simplificación que oculta décadas de conflicto, negociación y resistencia cultural.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Mapa del Valle de México en 1519 con la ubicación de Tenochtitlan, Tlaxcala y los principales pueblos aliados de Cortés, con las rutas de avance marcadas",
          caption: "La caída de Tenochtitlan fue posible gracias a alianzas indígenas, epidemias y factores políticos internos, no solo a la superioridad militar española.",
        },
      ],
    },
  },

  // ── 7 ── Multicausalidad ────────────────────────────────────────────────────
  {
    slug: "ch-i-multicausalidad-historica",
    titulo: "Multicausalidad histórica: por qué los eventos tienen muchas causas",
    categoria: "Multicausalidad",
    conceptos_clave: ["multicausalidad", "causalidad histórica", "causas estructurales", "causas coyunturales", "metodología histórica"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Uno de los errores más comunes al estudiar historia es buscar una sola causa para cada evento. La realidad histórica es multicausal: los procesos complejos —guerras, revoluciones, colapsos de civilizaciones, transformaciones culturales— son el resultado de la convergencia de múltiples factores que actúan en diferentes escalas temporales y sociales. La multicausalidad no significa que todas las causas sean igualmente importantes, sino que ninguna explicación monocausal es suficiente para dar cuenta de la complejidad del pasado.",
        },
        {
          tipo: "subtitulo",
          contenido: "Tipos de causas en la explicación histórica",
        },
        {
          tipo: "parrafo",
          contenido:
            "Los historiadores distinguen entre distintos tipos de causas según su profundidad y escala. Las causas estructurales son condiciones de largo plazo que crean el contexto en que los eventos ocurren: la desigualdad económica, los sistemas políticos autoritarios, las tensiones étnicas o religiosas. Las causas coyunturales son factores de mediano plazo que aceleran o bloquean los procesos: una crisis económica, un cambio de gobierno, una epidemia. Las causas inmediatas o detonantes son los eventos puntuales que desencadenan la acción: un asesinato político, una declaración de guerra, un discurso que convoca a la movilización. Explicar un proceso histórico requiere identificar causas en los tres niveles.",
        },
        {
          tipo: "subtitulo",
          contenido: "Herramientas para analizar la multicausalidad",
        },
        {
          tipo: "lista",
          items: [
            "Árbol de causas: diagrama que muestra las causas de distinto nivel que convergen en un evento central.",
            "Ponderación de causas: análisis de cuáles causas fueron más determinantes y por qué.",
            "Análisis contrafáctico: preguntarse ¿qué hubiera pasado si X causa no hubiera existido? Ayuda a evaluar el peso de cada factor.",
            "Perspectiva de los actores: ¿qué causas reconocían los propios protagonistas del evento?",
            "Comparación histórica: ¿se han dado procesos similares en otros contextos con causas comparables?",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La multicausalidad no implica relativismo: no todas las causas tienen el mismo peso. El historiador debe jerarquizarlas con argumentos y evidencia. Decir que la Revolución Mexicana tuvo muchas causas no es lo mismo que decir que todas son igualmente importantes. La concentración de la tierra y la exclusión política son causas estructurales de mayor peso explicativo que, por ejemplo, la personalidad de Porfirio Díaz.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Árbol de causas con la Revolución Mexicana como evento central, mostrando en sus ramas las causas estructurales (concentración de tierra, exclusión política), coyunturales (crisis económica de 1907) y detonantes (fraude electoral de 1910)",
          caption: "El árbol de causas es una herramienta visual que organiza los factores multicausales de un proceso histórico.",
        },
      ],
    },
  },

  // ── 8 ── Multicausalidad ────────────────────────────────────────────────────
  {
    slug: "ch-i-causas-estructurales-contingentes",
    titulo: "Causas estructurales y contingentes: lo inevitable y lo imprevisto en la historia",
    categoria: "Multicausalidad",
    conceptos_clave: ["causas estructurales", "causas contingentes", "determinismo histórico", "papel del azar", "sujeto histórico"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "¿Estaban los grandes eventos históricos 'destinados' a ocurrir, o pudieron haber sucedido de otra manera? Esta pregunta divide a los historiadores entre quienes enfatizan las causas estructurales —los factores de largo plazo que parecen hacer inevitable ciertos desenlaces— y quienes destacan la contingencia —el papel del azar, de las decisiones individuales y de los eventos imprevistos en el curso de la historia. La tensión entre estructura y contingencia es uno de los debates metodológicos más fértiles de la historiografía.",
        },
        {
          tipo: "subtitulo",
          contenido: "El argumento estructuralista",
        },
        {
          tipo: "parrafo",
          contenido:
            "Para los historiadores estructuralistas, los grandes eventos son el resultado de fuerzas sociales, económicas y geopolíticas de largo plazo que crean condiciones que tarde o temprano producen transformaciones inevitables. Desde esta perspectiva, si Francisco I. Madero no hubiera iniciado la Revolución en 1910, alguien más lo habría hecho en condiciones similares: las tensiones acumuladas durante el Porfiriato hacían la ruptura inevitable. Esta postura subraya la importancia de los análisis estructurales (demografía, economía, geografía) sobre la narrativa de grandes personajes.",
        },
        {
          tipo: "subtitulo",
          contenido: "El argumento contingentista",
        },
        {
          tipo: "lista",
          items: [
            "Los eventos dependen de decisiones individuales que pudieron haberse tomado de otra manera: si Moctezuma II hubiera rechazado recibir a Cortés, ¿habría ocurrido la Conquista?",
            "El azar importa: la muerte de Cuitláhuac por viruela en 1520 cambió el liderazgo mexica en un momento crítico.",
            "Las coyunturas abren y cierran posibilidades: la crisis de 1907 en Estados Unidos afectó la economía porfiriana y aceleró el descontento.",
            "Los líderes carismáticos pueden catalizar procesos que de otro modo habrían tardado décadas: Emiliano Zapata transformó la demanda agraria en movimiento revolucionario.",
            "Las ideas importan: el libro 'La sucesión presidencial en 1910' de Madero (1908) creó un espacio político nuevo.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "El historiador alemán Johann Gustav Droysen acuñó en el siglo XIX la distinción entre 'necesidad histórica' y 'libertad del actor'. Esta tensión filosófica atraviesa toda la teoría de la historia: los enfoques marxistas privilegian las fuerzas estructurales (modos de producción, clases sociales), mientras que los enfoques hermenéuticos privilegian la comprensión de las intenciones y los significados de los actores individuales. La historia académica contemporánea intenta articular ambas dimensiones.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de balanza con 'estructuras históricas' en un platillo (geografía, economía, demografía) y 'decisiones contingentes' en el otro (personajes, azar, coyunturas), equilibradas por la metodología histórica",
          caption: "La explicación histórica busca el equilibrio entre las fuerzas estructurales de largo plazo y los factores contingentes imprevistos.",
        },
      ],
    },
  },

  // ── 9 ── Multicausalidad ────────────────────────────────────────────────────
  {
    slug: "ch-i-independencia-mexico-multicausal",
    titulo: "Independencia de México (1810-1821): un análisis multicausal",
    categoria: "Multicausalidad",
    conceptos_clave: ["Independencia de México", "Hidalgo", "crisis de la monarquía española", "Ilustración", "insurgencia criolla"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El 16 de septiembre de 1810, Miguel Hidalgo y Costilla llamó a los feligreses de Dolores a levantarse contra el gobierno virreinal. Este momento —el Grito de Independencia— es frecuentemente narrado como el inicio de la lucha de liberación nacional. Pero esa narrativa heroica oculta la complejidad real del proceso: la Independencia de México (1810-1821) fue el resultado de una confluencia de causas que operaban a escala global, colonial y local, y que involucró actores con objetivos muy distintos entre sí.",
        },
        {
          tipo: "subtitulo",
          contenido: "Causas en distintos niveles de análisis",
        },
        {
          tipo: "lista",
          items: [
            "Causa global: la invasión napoleónica de España (1808) paralizó a la metrópoli y creó un vacío de poder que las colonias debieron gestionar.",
            "Causa ideológica: la Ilustración francesa y la Independencia de Estados Unidos (1776) propagaron ideas de soberanía popular y derechos naturales entre los criollos ilustrados.",
            "Causa económica: las Reformas Borbónicas del siglo XVIII aumentaron los impuestos coloniales y beneficiaron a los españoles peninsulares sobre los criollos nacidos en América.",
            "Causa social: la desigualdad entre peninsulares, criollos, mestizos, indígenas y castas creaba tensiones cotidianas que la crisis política detonó.",
            "Causa local: en Guanajuato y el Bajío, la crisis agraria de 1809-1810 generó hambre y desempleo entre las poblaciones indígenas y mestizas.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "La diversidad de actores y proyectos",
        },
        {
          tipo: "parrafo",
          contenido:
            "La insurgencia no fue un movimiento homogéneo. Hidalgo movilizó a indígenas y mestizos empobrecidos del Bajío con demandas sociales radicales. José María Morelos, en el sur, elaboró un programa político más sistemático (los 'Sentimientos de la Nación', 1813) que reclamaba abolir la esclavitud y la igualdad jurídica. Los criollos conservadores, como Agustín de Iturbide, se sumaron tardíamente cuando la amenaza liberal en España (Constitución de Cádiz, 1812) puso en peligro sus privilegios. El Plan de Iguala (1821) unificó fuerzas muy distintas bajo tres garantías: religión, unión e independencia. Analizar multicausalmente la Independencia significa reconocer esta heterogeneidad.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La Independencia de México no fue una revolución social: no transformó las estructuras de propiedad ni la jerarquía étnica. Los criollos que encabezaron el movimiento independentista tardío simplemente sustituyeron a los españoles en el control del Estado. Las demandas de los sectores indígenas y mestizos que siguieron a Hidalgo y Morelos no fueron satisfechas hasta la Revolución de 1910. Este punto es central para comprender por qué las desigualdades coloniales persistieron en el México del siglo XIX.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Mapa de Nueva España en 1810 con los focos de insurgencia marcados y un diagrama de causas multicausales: napoleónica, ilustrada, económica y social, convergiendo en el Grito de Dolores",
          caption: "La Independencia de México (1810-1821) fue el resultado de causas globales, ideológicas, económicas y sociales que se alimentaron mutuamente.",
        },
      ],
    },
  },

  // ── 10 ── Historiografía ────────────────────────────────────────────────────
  {
    slug: "ch-i-historiografia-mexicana",
    titulo: "Historiografía mexicana: cómo se ha escrito la historia de México",
    categoria: "Historiografía",
    conceptos_clave: ["historiografía", "historia patria", "historia crítica", "construcción del pasado", "revisionismo histórico"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La historiografía es el estudio de cómo se ha escrito la historia: qué métodos, qué fuentes y qué preguntas han guiado a los historiadores en distintos momentos. En México, la escritura de la historia ha estado íntimamente ligada a los proyectos de construcción nacional y a las disputas políticas e ideológicas de cada época. Desde la crónica colonial hasta la historia crítica contemporánea, la historiografía mexicana refleja las tensiones entre el discurso oficial, las voces de los grupos subalternos y las exigencias metodológicas de la investigación académica.",
        },
        {
          tipo: "subtitulo",
          contenido: "Etapas de la historiografía mexicana",
        },
        {
          tipo: "lista",
          items: [
            "Crónicas coloniales (siglos XVI-XVII): fray Bernardino de Sahagún recopiló la historia y cultura mexica en el 'Códice Florentino'. Escribían desde la perspectiva evangelizadora.",
            "Historia ilustrada y criolla (siglo XVIII): el jesuita Francisco Xavier Clavijero rehabilitó las culturas prehispánicas en 'Historia Antigua de México' (1780) para defender a los americanos frente a los ilustrados europeos.",
            "Historia liberal (siglo XIX): Lucas Alamán (conservador) e Ignacio Ramírez (liberal) construyeron narrativas opuestas sobre la Independencia y la Reforma.",
            "Historia oficial posrevolucionaria (siglo XX): el Estado mexicano posrevolucionario construyó una narrativa heroica que celebraba a Hidalgo, Morelos, Juárez y los caudillos de la Revolución.",
            "Historia crítica y académica (desde 1960s): historiadores como Enrique Florescano, Luis González y González y Arnaldo Córdova desarrollaron enfoques científicos que cuestionaron el relato oficial.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "El debate sobre los libros de texto de historia",
        },
        {
          tipo: "parrafo",
          contenido:
            "Ningún ámbito expresa mejor la tensión entre historia y política que los libros de texto gratuitos. Desde 1960, cuando la SEP los introdujo, han sido el escenario de múltiples controversias: la polémica de 1992 sobre los capítulos de la Revolución, las disputas sobre la inclusión de las culturas indígenas, el debate sobre cómo tratar la historia del PRI, la guerra sucia de los años 70 o los movimientos sociales contemporáneos. Estas controversias ilustran que el control sobre la narrativa histórica es una forma de poder político. La historiografía crítica tiene la responsabilidad de problematizar esas narrativas.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Todo texto histórico —incluyendo tu libro de texto de bachillerato— es una producción historiográfica con perspectivas y silencios. Leerlo críticamente significa preguntarse: ¿quién lo escribió?, ¿qué fuentes usa?, ¿qué voces incluye y cuáles omite?, ¿qué narrativa construye sobre la identidad mexicana? Esta actitud crítica no niega el valor del texto; lo enriquece.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Portadas de obras historiográficas clave: el Códice Florentino de Sahagún, la Historia Antigua de Clavijero, y obras contemporáneas de Florescano y Luis González, representando las distintas épocas de la escritura histórica en México",
          caption: "La historiografía mexicana refleja las transformaciones políticas, sociales e intelectuales de cada período histórico.",
        },
      ],
    },
  },

  // ── 11 ── Historiografía ────────────────────────────────────────────────────
  {
    slug: "ch-i-edmundo-ogorman-invencion-america",
    titulo: "Edmundo O'Gorman y 'La invención de América' (1958)",
    categoria: "Historiografía",
    conceptos_clave: ["Edmundo O'Gorman", "La invención de América", "descubrimiento", "invención histórica", "identidad americana"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "En 1958, el historiador mexicano Edmundo O'Gorman (1906-1995) publicó 'La invención de América', una obra que transformó radicalmente el debate sobre el origen intelectual del continente americano. O'Gorman argumentó que América no fue 'descubierta' por Colón —como sostenía la narrativa tradicional— sino 'inventada': es decir, que la idea de América como un continente nuevo y diferente fue el resultado de un proceso intelectual europeo que tardó décadas en consolidarse, no de un acto puntual de descubrimiento en 1492.",
        },
        {
          tipo: "subtitulo",
          contenido: "El argumento central de O'Gorman",
        },
        {
          tipo: "parrafo",
          contenido:
            "O'Gorman distingue entre 'hallazgo físico' e 'invención histórica'. Colón llegó a las Antillas en 1492 convencido de haber encontrado Asia; murió sin saber que había llegado a un continente desconocido para los europeos. Fue Américo Vespucio quien, en sus cartas de 1503-1504, propuso que las tierras descubiertas eran un 'Mundus Novus' (Nuevo Mundo), algo distinto de Asia. La cartografía de Waldseemüller de 1507 fue la primera en representar ese Nuevo Mundo como un continente separado y en nombrarlo 'América'. Para O'Gorman, este proceso de conceptualización —que requirió décadas y la colaboración de navegantes, humanistas y cartógrafos europeos— es la verdadera 'invención' de América.",
        },
        {
          tipo: "subtitulo",
          contenido: "Implicaciones metodológicas e historiográficas",
        },
        {
          tipo: "lista",
          items: [
            "El conocimiento histórico no se reduce a hechos brutos: implica interpretación, conceptualización y construcción de significado.",
            "El 'descubrimiento' de América es una categoría eurocéntrica que invisibiliza los millones de personas que ya habitaban el continente.",
            "Los pueblos indígenas no necesitaban ser 'descubiertos': tenían sus propias cosmologías, historias y formas de conocer su mundo.",
            "O'Gorman introduce la pregunta sobre el ser de América: ¿qué es América? ¿Una extensión de Europa? ¿Una realidad cultural propia?",
            "Esta perspectiva abrió camino para debates sobre colonialismo, decolonialidad y epistemologías no occidentales en la historiografía latinoamericana.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Edmundo O'Gorman fue uno de los primeros intelectuales latinoamericanos en hacer filosofía de la historia desde una perspectiva no eurocéntrica. Fue alumno del filósofo español José Gaos (refugiado en México tras la Guerra Civil española) y contribuyó a establecer la Filosofía de la Historia como disciplina académica en la UNAM. 'La invención de América' influyó profundamente en historiadores como Enrique Dussel, cuyo concepto de 'encubrimiento del Otro' es una continuación crítica del argumento de O'Gorman.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "La Carta Marina de Waldseemüller (1507), primera que nombra 'América' al continente, junto al retrato de Edmundo O'Gorman y la portada de 'La invención de América'",
          caption: "O'Gorman argumentó que América no fue 'descubierta' sino 'inventada' como categoría intelectual por los europeos del siglo XVI.",
        },
      ],
    },
  },

  // ── 12 ── Historiografía ────────────────────────────────────────────────────
  {
    slug: "ch-i-enrique-florescano-memoria-historica",
    titulo: "Enrique Florescano y la memoria histórica de México",
    categoria: "Historiografía",
    conceptos_clave: ["Enrique Florescano", "memoria histórica", "mito fundacional", "identidad nacional", "historia y política"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Enrique Florescano (1937-2023) fue el historiador mexicano más influyente de la segunda mitad del siglo XX. Sus obras sobre la memoria histórica, los mitos fundacionales y la construcción de la identidad nacional mexicana transformaron la manera en que los mexicanos comprenden su relación con el pasado. A diferencia de la historia política tradicional que narraba batallas y caudillos, Florescano estudió cómo los grupos sociales construyen, transmiten y usan el recuerdo colectivo del pasado para definir su identidad y legitimar su lugar en el presente.",
        },
        {
          tipo: "subtitulo",
          contenido: "La distinción entre memoria histórica e historia académica",
        },
        {
          tipo: "parrafo",
          contenido:
            "Florescano distinguía entre la 'memoria histórica' —el recuerdo colectivo que una comunidad construye sobre su pasado, frecuentemente selectivo y cargado de significado emocional y político— y la 'historia académica' —la reconstrucción crítica del pasado con base en fuentes y metodología científica. En obras como 'Memoria mexicana' (1987) y 'La función social de la historia' (2012), mostró que el Estado mexicano posrevolucionario construyó una 'memoria oficial' que destacaba ciertos héroes y ciertos eventos (Hidalgo, Juárez, la Revolución) mientras silenciaba otros (las masacres de comunidades indígenas, la represión del movimiento obrero, los errores de los caudillos).",
        },
        {
          tipo: "subtitulo",
          contenido: "Contribuciones clave al conocimiento histórico",
        },
        {
          tipo: "lista",
          items: [
            "'El origen del poder en Mesoamérica' (1994): analizó cómo los gobernantes prehispánicos usaban el mito y el ritual para legitimar su autoridad.",
            "'Etnia, Estado y nación' (1996): exploró la tensión entre las identidades étnicas indígenas y la identidad nacional mestiza construida por el Estado.",
            "Fundador de la revista 'Nexos' (1978): contribuyó a crear un espacio para el debate intelectual crítico en México.",
            "Defensor del patrimonio cultural: impulsó la creación del Instituto Nacional de Estudios Históricos de las Revoluciones de México (INEHRM).",
            "Influencia en la educación: sus análisis sobre la construcción del pasado nacional influenciaron la reforma de los planes de estudios de historia en México.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La distinción de Florescano entre memoria e historia es metodológicamente fundamental para CH-I: cuando estudies un evento histórico, pregúntate siempre quién recuerda ese evento, cómo lo recuerda y con qué propósitos. La memoria colectiva selecciona, simplifica y carga de valor moral el pasado; la historia académica debe reconocer esos procesos y problematizarlos sin negarles su importancia social y cultural.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Portada de 'Memoria mexicana' de Enrique Florescano junto a un diagrama que muestra la diferencia entre memoria histórica (selectiva, emotiva, identitaria) e historia académica (crítica, metodológica, basada en fuentes)",
          caption: "Florescano mostró que la memoria histórica oficial construye héroes y silencios según las necesidades políticas del presente.",
        },
      ],
    },
  },

  // ── 13 ── Memoria y patrimonio ──────────────────────────────────────────────
  {
    slug: "ch-i-patrimonio-cultural-intangible",
    titulo: "Patrimonio cultural intangible: la memoria viva de los pueblos",
    categoria: "Memoria y patrimonio",
    conceptos_clave: ["patrimonio cultural intangible", "UNESCO", "tradiciones orales", "artesanías", "identidad cultural"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El patrimonio cultural no se limita a monumentos, edificios o piezas de museo. La UNESCO reconoce desde 2003 la existencia de un patrimonio cultural intangible o inmaterial: el conjunto de prácticas, representaciones, expresiones, conocimientos y saberes que las comunidades transmiten de generación en generación como parte de su identidad. Este patrimonio incluye las lenguas indígenas, la música, la danza, los rituales, las fiestas comunitarias, los conocimientos sobre plantas medicinales, las técnicas artesanales y las tradiciones culinarias. México es uno de los países con mayor patrimonio cultural intangible reconocido por la UNESCO.",
        },
        {
          tipo: "subtitulo",
          contenido: "El patrimonio intangible como fuente histórica",
        },
        {
          tipo: "parrafo",
          contenido:
            "Para el historiador, el patrimonio cultural intangible es también una fuente histórica de primer orden. Las tradiciones orales —cuentos, mitos, cantos— conservan memoria de eventos y formas de vida que no quedaron en documentos escritos. Las técnicas artesanales transmiten conocimientos tecnológicos milenarios sobre materiales, pigmentos y procesos productivos. Los rituales agrícolas codifican saberes sobre calendarios, climatología y manejo de ecosistemas. El trabajo del historiador que estudia comunidades sin escritura o con escritura escasa depende crucialmente de este tipo de fuentes.",
        },
        {
          tipo: "subtitulo",
          contenido: "Patrimonio intangible de México reconocido por la UNESCO",
        },
        {
          tipo: "lista",
          items: [
            "Día de Muertos (2008): práctica cultural indígena que combina elementos prehispánicos y coloniales para comunicarse con los difuntos.",
            "Cocina tradicional mexicana (2010): sistema culinario que incluye técnicas como la nixtamalización y el uso del metate, con más de 3,000 años de historia.",
            "Charrería (2016): equitación tradicional mexicana que surgió en el siglo XVII en las haciendas ganaderas de Jalisco.",
            "Artesanía de Talavera (2019): cerámica policroma que combina tradiciones indígenas, españolas, chinas y árabes.",
            "Mariachi (2011): música originaria de los estados de Jalisco, Nayarit y Colima, símbolo de la identidad musical mexicana.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La noción de 'patrimonio intangible' tiene implicaciones políticas: al reconocer los saberes y las prácticas de las comunidades indígenas y campesinas como 'patrimonio', el Estado y los organismos internacionales pueden tanto protegerlos como apropiarse de ellos. El debate sobre quién controla el patrimonio cultural —las comunidades que lo generan o las instituciones que lo administran— es una cuestión de justicia cultural y autodeterminación de los pueblos.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Collage de expresiones del patrimonio intangible mexicano: altar de Día de Muertos, preparación del mole, bordado indígena y músico de mariachi",
          caption: "El patrimonio cultural intangible de México incluye prácticas que tienen raíces prehispánicas de más de tres milenios.",
        },
      ],
    },
  },

  // ── 14 ── Memoria y patrimonio ──────────────────────────────────────────────
  {
    slug: "ch-i-codice-mendoza-fuente-iconografica",
    titulo: "El Códice Mendoza (c. 1541): fuente iconográfica y problema historiográfico",
    categoria: "Memoria y patrimonio",
    conceptos_clave: ["Códice Mendoza", "iconografía", "fuente colonial", "cultura mexica", "escritura pictográfica"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El Códice Mendoza es uno de los documentos más extraordinarios del México colonial temprano. Elaborado alrededor de 1541 por orden del primer virrey de Nueva España, Antonio de Mendoza, para ser enviado al rey Carlos I de España, combina pinturas de tradición indígena mexica con glosas explicativas en español. El códice está dividido en tres partes: la primera registra las conquistas de los emperadores aztecas y los tributos de los pueblos sometidos; la segunda detalla los tributos que se pagaban a Tenochtitlan; la tercera describe la vida cotidiana mexica desde el nacimiento hasta la vejez. Hoy se conserva en la Biblioteca Bodleiana de la Universidad de Oxford.",
        },
        {
          tipo: "subtitulo",
          contenido: "El Códice Mendoza como fuente primaria: posibilidades y límites",
        },
        {
          tipo: "parrafo",
          contenido:
            "El Códice Mendoza es una fuente primaria de enorme riqueza, pero también de enorme complejidad historiográfica. Fue producido apenas 20 años después de la Conquista, en un contexto colonial en que los tlacuilos (pintores-escribas indígenas) que lo elaboraron debían responder a los intereses y las preguntas del virrey español. ¿Qué eligieron mostrar? ¿Qué omitieron? ¿Las glosas en español traducen fielmente el significado de los glifos o los interpretan desde categorías europeas? La comparación del Códice Mendoza con otros documentos como el Códice Florentino o el Mapa de Tepechpan revela inconsistencias que obligan al historiador a leer estas fuentes críticamente.",
        },
        {
          tipo: "subtitulo",
          contenido: "La escritura pictográfica mexica: características principales",
        },
        {
          tipo: "lista",
          items: [
            "Sistema logográfico-fonético: combina ideogramas (símbolos que representan ideas) con elementos fonéticos (glifos que representan sonidos).",
            "Glifos toponímicos: representan nombres de lugares mediante combinaciones de imágenes. 'Mexico-Tenochtitlan' se representa con un nopal sobre una piedra en medio del agua.",
            "Numeración: se usan puntos (unidades), banderas (veintenas), plumas de ave (cuatrocientas unidades) y bolsas de incienso (8,000 unidades).",
            "Registro del tiempo: el Tonalpohualli y el Xiuhpohualli se registraban con glifos específicos para cada día y mes.",
            "Colores codificados: el rojo representaba la sangre y la guerra; el azul-verde, el agua y la fertilidad; el amarillo, el oro y el maíz.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "El Códice Mendoza fue capturado en el mar por piratas franceses cuando era transportado a España, y eventualmente llegó a Francia, donde fue estudiado por el geógrafo André Thevet. En 1659, fue comprado por el anticuario inglés John Selden y donó a la Bodleiana. El hecho de que esta fuente fundamental de la historia mexicana se conserve en Oxford —y no en México— es en sí mismo un dato histórico sobre el poder colonial y los circuitos del conocimiento en el mundo atlántico del siglo XVI.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Páginas del Códice Mendoza mostrando la fundación de Tenochtitlan (el águila sobre el nopal) y la lista de tributos de los pueblos sometidos, con los glifos numerales señalados",
          caption: "El Códice Mendoza (c. 1541) combina la tradición pictográfica indígena con glosas en español, resultado de la colaboración y la tensión del primer México colonial.",
        },
      ],
    },
  },

  // ── 15 ── Memoria y patrimonio ──────────────────────────────────────────────
  {
    slug: "ch-i-dia-de-muertos-memoria-colectiva",
    titulo: "Día de Muertos: memoria colectiva, sincretismo y patrimonio vivo",
    categoria: "Memoria y patrimonio",
    conceptos_clave: ["Día de Muertos", "memoria colectiva", "sincretismo cultural", "patrimonio UNESCO", "Guillermo Bonfil Batalla"],
    tiempo_lectura_minutos: 8,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El Día de Muertos —celebrado el 1 y 2 de noviembre en México— es una de las manifestaciones más ricas y complejas de la memoria colectiva mexicana. Declarado Patrimonio Cultural Inmaterial de la Humanidad por la UNESCO en 2008, es el resultado de un proceso de sincretismo cultural que duró siglos: las celebraciones prehispánicas dedicadas a los muertos (el Miccailhuitontli y el Hueymiccailhuitl del calendario azteca, realizadas en julio-agosto) se fusionaron con las festividades católicas de Todos Santos y Fieles Difuntos (1 y 2 de noviembre), dando lugar a una práctica única que no es simplemente la suma de sus componentes.",
        },
        {
          tipo: "subtitulo",
          contenido: "El Día de Muertos como fuente histórica",
        },
        {
          tipo: "parrafo",
          contenido:
            "Para el historiador y el antropólogo, el Día de Muertos es una fuente sobre las concepciones de la muerte, el tiempo y la identidad colectiva en México. El altar de muertos (ofrenda) codifica una cosmología: los cuatro elementos (agua, viento, tierra, fuego representados por vela), el camino de flores de cempasúchil que guía a los difuntos, los alimentos que el muerto prefería en vida, su fotografía y sus objetos personales. Esta práctica transmite una noción del tiempo que no es lineal: en Día de Muertos, el pasado (los difuntos) regresa al presente, y la comunidad de los vivos y los muertos se restablece temporalmente.",
        },
        {
          tipo: "subtitulo",
          contenido: "Guillermo Bonfil Batalla y el 'México Profundo'",
        },
        {
          tipo: "lista",
          items: [
            "Bonfil Batalla (1935-1991) fue un antropólogo mexicano que en 'México Profundo' (1987) argumentó que México contiene dos civilizaciones en tensión permanente.",
            "El 'México profundo': la civilización mesoamericana que persiste en las comunidades indígenas y populares, con su cosmovisión, sus prácticas y sus formas de organización propias.",
            "El 'México imaginario': el proyecto de modernización occidental que las élites han impuesto desde la Conquista, negando la identidad mesoamericana.",
            "El Día de Muertos es para Bonfil un ejemplo paradigmático del México Profundo: una práctica que sobrevivió 500 años de presión colonial y modernizadora.",
            "Esta perspectiva abrió debates sobre indigenismo, pluralismo cultural y los derechos de los pueblos originarios que continúan hoy.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "La globalización ha transformado el Día de Muertos de maneras complejas. La influencia de la película 'Coco' (Pixar, 2017) y del desfile en la película de James Bond 'Spectre' (2015), filmado en Ciudad de México, llevó la imagen del Día de Muertos a audiencias globales. Pero también generó un proceso de turistificación y comercialización que algunas comunidades indígenas consideran una apropiación cultural. Este debate contemporáneo es una extensión del problema histórico que estudiamos: ¿quién tiene derecho a definir, interpretar y usar el patrimonio cultural?",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Ofrenda de Día de Muertos con los elementos tradicionales señalados: fotografías, flores de cempasúchil, agua, velas, alimentos, papel picado y calaveritas de azúcar, con una nota sobre su origen prehispánico y colonial",
          caption: "El Día de Muertos (Patrimonio UNESCO 2008) es un ejemplo de sincretismo cultural que fusiona tradiciones mesoamericanas y católicas en una práctica de memoria colectiva única.",
        },
      ],
    },
  },
] as const;

// ---------------------------------------------------------------------------
// FUNCIÓN PRINCIPAL
// ---------------------------------------------------------------------------

export async function seedBibliotecaCHI(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed Biblioteca CH-I (15 fichas)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac")
    .select("id")
    .eq("codigo", "CH-I")
    .single();

  if (uacErr || !uacRow) {
    throw new Error(
      `UAC CH-I no encontrada. Ejecuta primero seed-mccems.ts y seed-chi.ts. Error: ${uacErr?.message}`
    );
  }

  const rows = FICHAS_CHI.map((f, i) => ({
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

  if (error) throw new Error(`Error seeding fichas CH-I: ${error.message}`);

  console.log(`  ✓ ${rows.length} fichas de biblioteca de CH-I insertadas/actualizadas.`);
  console.log("\n✅ Seed Biblioteca CH-I completado.\n");
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
  seedBibliotecaCHI(sb).catch((err) => {
    console.error("❌ Error:", err.message);
    process.exit(1);
  });
}
