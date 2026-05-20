/**
 * Seed de fichas de biblioteca para CH-III (Conciencia Historica III, Semestre 6).
 * 15 fichas tematicas alineadas al MCCEMS 2025, Semestre 6.
 *
 * Uso: npx tsx scripts/seed-fichas-chiii.ts
 * Idempotente: upsert por campo "slug".
 */

import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

type SB = ReturnType<typeof createClient<Database>>;

const FICHAS_CHIII = [
  // ─── CATEGORIA 1: Evaluacion de fuentes historicas ───────────────────────

  {
    slug: "ch-iii-tipos-fuentes-historicas-primarias-secundarias",
    titulo: "Tipos de fuentes históricas: primarias, secundarias y terciarias",
    categoria: "Evaluacion de fuentes historicas",
    conceptos_clave: [
      "fuente primaria",
      "fuente secundaria",
      "fuente terciaria",
      "documento historico",
      "archivo",
    ],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Las fuentes historicas se clasifican en tres tipos segun su relacion con los eventos que documentan. Comprender esta clasificacion es el primer paso para trabajar con ellas de forma critica. Cada tipo tiene caracteristicas propias que determinan como puede usarse como evidencia historica.",
        },
        {
          tipo: "parrafo",
          contenido:
            "Las fuentes primarias son aquellas producidas durante el periodo historico estudiado o por actores directos de los eventos: fotografias del Archivo Casasola, manifiestos zapatistas de Emiliano Zapata, correspondencia de Porfirio Diaz, codices aztecas. Las fuentes secundarias son interpretaciones producidas despues de los hechos por historiadores: libros de historia, articulos academicos, documentales. Las fuentes terciarias son compilaciones de fuentes secundarias: enciclopedias, libros de texto.",
        },
        {
          tipo: "subtitulo",
          contenido: "Fuentes primarias en Mexico",
        },
        {
          tipo: "parrafo",
          contenido:
            "Mexico cuenta con repositorios fundamentales de fuentes primarias. El Archivo General de la Nacion (AGN) conserva documentos desde la Inquisicion colonial hasta el siglo XX. El INAH administra archivos arqueologicos y etnograficos. La Hemeroteca Nacional Digital de Mexico (HNDM) pone en linea periodicos mexicanos desde el siglo XIX, accesibles gratuitamente para cualquier investigador.",
        },
        {
          tipo: "lista",
          items: [
            "Documentos oficiales: leyes, decretos, actas notariales, certificados de nacimiento y defuncion",
            "Correspondencia personal: cartas, telegramas, diarios intimos de actores historicos",
            "Fotografias y material iconografico: imagenes tomadas durante o inmediatamente despues de los eventos",
            "Testimonios orales: grabaciones o transcripciones de personas que vivieron los hechos",
            "Objetos materiales y artefactos: herramientas, vestimenta, monedas, edificaciones del periodo",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Ser primaria no significa ser confiable. Una fuente primaria refleja la perspectiva de quien la produjo y debe evaluarse criticamente antes de usarse como evidencia. El testimonio de un hacendado porfiriano sobre las condiciones de los peones es primario, pero no es neutral.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Tres estantes con documentos, libros y archivos digitales que representan los tres tipos de fuentes historicas",
          caption:
            "No todas las fuentes historicas son iguales: su naturaleza condiciona como pueden usarse como evidencia historica.",
        },
      ],
    },
  },

  {
    slug: "ch-iii-criterios-evaluacion-fuentes-aspac",
    titulo:
      "Cinco criterios para evaluar una fuente historica: autoria, sesgo, proposito, audiencia y contexto",
    categoria: "Evaluacion de fuentes historicas",
    conceptos_clave: [
      "evaluacion de fuentes",
      "autoria",
      "sesgo",
      "proposito",
      "contexto historico",
    ],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Evaluar fuentes es una operacion metodologica, no una intuicion. No basta con preguntarse si una fuente nos parece confiable: es necesario aplicar criterios sistematicos que permitan determinar que tipo de informacion puede extraerse de ella y cuales son sus limitaciones como evidencia historica.",
        },
        {
          tipo: "parrafo",
          contenido:
            "Cinco criterios clave: (1) Autoria: quien produjo la fuente y desde que posicion social, politica o economica lo hizo. (2) Fecha y temporalidad: fue producida simultaneamente con los eventos o despues? La distancia en el tiempo cambia cuanto podia saber el autor sobre lo que ocurria. (3) Proposito e intencion: fue producida para informar, persuadir, entretener, denunciar, justificar? (4) Audiencia: a quien iba dirigida? La correspondencia privada difiere del manifiesto publico. (5) Contexto: que ocurria politica, social y culturalmente cuando fue producida?",
        },
        {
          tipo: "subtitulo",
          contenido: "Aplicando los criterios al Archivo Casasola",
        },
        {
          tipo: "parrafo",
          contenido:
            "Aplicar los cinco criterios a las fotografias de Casasola sobre la Revolucion Mexicana revela su complejidad como fuente. Los fotografos profesionales solian tener clientes concretos: periodicos, gobierno, agencias. Enmarcaban ciertas escenas y excluian otras. Algunas fotografias fueron escenificadas. Esto no las invalida como fuentes, pero establece con precision que tipo de informacion contienen y cuales son sus limites como evidencia.",
        },
        {
          tipo: "lista",
          items: [
            "Quien produjo esta fuente y que posicion ocupaba en la sociedad de su tiempo?",
            "Con que proposito fue producida: para informar, persuadir, registrar o legitimar?",
            "A quien iba dirigida y que esperaba el autor que su audiencia hiciera o creyera?",
            "Que informacion tenia disponible el autor y que podia desconocer por su posicion o por el momento?",
            "Que eventos o contextos del periodo pueden haber condicionado lo que se dice, se omite o se enfatiza?",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Aplicar estos criterios no descalifica la fuente: establece que tipo de informacion puede extraerse de ella y cuales son sus limitaciones. Una fuente sesgada sigue siendo una fuente valida para estudiar la perspectiva de quien la produjo.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Historiador examinando documentos con marcadores de diferentes colores que representan los cinco criterios de evaluacion",
          caption:
            "La evaluacion rigurosa de fuentes es el fundamento de la argumentacion historica creible.",
        },
      ],
    },
  },

  {
    slug: "ch-iii-sesgo-supervivencia-voces-silenciadas",
    titulo:
      "El sesgo de supervivencia en las fuentes historicas: que voces se pierden",
    categoria: "Evaluacion de fuentes historicas",
    conceptos_clave: [
      "sesgo de supervivencia",
      "fuentes silenciadas",
      "historia desde abajo",
      "codices mesoamericanos",
      "historia oral",
    ],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El sesgo de supervivencia es uno de los problemas mas profundos del trabajo historico: las fuentes que llegaron hasta el presente NO son representativas de todo lo que existio en el pasado. Tienden a conservarse los documentos de elites, del Estado y de instituciones con recursos para archivar y proteger sus registros. Las voces de grupos populares, mujeres, pueblos indigenas y comunidades sin escritura alfabetica estan sistematicamente subrepresentadas en los archivos.",
        },
        {
          tipo: "parrafo",
          contenido:
            "El ejemplo mas extremo en la historia de Mexico: la quema de codices mesoamericanos durante la Conquista. El obispo Juan de Zumarraga quemo miles de codices en Texcoco en 1531, destruyendo una porcion enorme de la historia prehispanica. De aproximadamente 1,500 codices mesoamericanos originales que existian, sobreviven menos de 20. Lo que sabemos de las civilizaciones precolombinas esta construido sobre fragmentos sobrevivientes de un archivo masivamente destruido.",
        },
        {
          tipo: "subtitulo",
          contenido: "Estrategias para recuperar voces perdidas",
        },
        {
          tipo: "parrafo",
          contenido:
            "Los historiadores han desarrollado enfoques alternativos para compensar el sesgo de supervivencia: la historia social estudia grupos subalternos (campesinos, trabajadores) usando registros fiscales, parroquiales y judiciales que los mencionan aunque no los hayan producido; la historia de genero recupera la experiencia de las mujeres; la historia oral recopila testimonios de personas sin registro escrito. El proyecto de historia oral del INAH ha recolectado miles de testimonios que no existirian en ningun archivo convencional.",
        },
        {
          tipo: "lista",
          items: [
            "Fuentes orales: testimonios recopilados sistematicamente de personas que vivieron los eventos o pertenecen a las comunidades estudiadas",
            "Arqueologia: el registro material (ceramica, arquitectura, herramientas) complementa y a veces contradice las fuentes escritas",
            "Analisis demografico cuantitativo: registros parroquiales, censos y registros fiscales permiten reconstruir condiciones de vida de grupos que no dejaron documentos propios",
            "Lectura a contrapelo de documentos oficiales: los documentos del Estado o la Iglesia mencionan a grupos subalternos aunque sea para controlarlos o sancionarlos",
            "Historia comunitaria: colaboracion con comunidades para recuperar su memoria colectiva, tradiciones orales y archivos locales",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "El historiador Enrique Florescano ha argumentado que las comunidades indigenas de Mexico preservaron memoria historica a traves de la tradicion oral, los codices y el ritual incluso cuando los documentos coloniales intentaban borrarlos. Esta contramemoria es en si misma una fuente historica de gran valor que debe leerse con los mismos criterios criticos que cualquier otra.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Mosaico incompleto donde la mayoria de las piezas faltan, simbolizando como las fuentes historicas son restos incompletos del pasado",
          caption:
            "Lo que sabemos del pasado es solo una fraccion de lo que existio: saber esto transforma la manera en que interpretamos la evidencia disponible.",
        },
      ],
    },
  },

  // ─── CATEGORIA 2: Triangulacion y corroboracion ──────────────────────────

  {
    slug: "ch-iii-triangulacion-fuentes-corroboracion",
    titulo:
      "Triangulacion de fuentes: por que un solo documento no es suficiente",
    categoria: "Triangulacion y corroboracion",
    conceptos_clave: [
      "triangulacion",
      "corroboracion",
      "multiples fuentes",
      "convergencia de evidencia",
      "metodo historico",
    ],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La triangulacion consiste en contrastar fuentes de diferentes tipos (documentos escritos, iconograficos, testimonios orales) procedentes de diferentes actores o perspectivas para obtener una imagen mas completa y confiable de un proceso historico. El termino viene de la navegacion y la topografia: con un solo punto de referencia no puedes determinar tu ubicacion exacta; necesitas al menos tres.",
        },
        {
          tipo: "parrafo",
          contenido:
            "En historia, una sola fuente, por buena que sea, siempre tiene limitaciones: refleja una perspectiva particular, el autor tenia acceso limitado a la informacion, fue producida con una intencion especifica. Cuando multiples fuentes independientes convergen sobre el mismo hecho o proceso, la evidencia es mas solida. Para estudiar la masacre de Tlatelolco del 2 de octubre de 1968 necesitamos: testimonios de sobrevivientes, fotografias de prensa, telegramas diplomaticos de embajadas extranjeras, archivos de la policia politica y documentos desclasificados de agencias de inteligencia estadounidenses.",
        },
        {
          tipo: "subtitulo",
          contenido: "Convergencias y divergencias",
        },
        {
          tipo: "parrafo",
          contenido:
            "Cuando las fuentes convergen: la evidencia es solida y el argumento historico gana peso. Cuando divergen: no es un problema metodologico sino una oportunidad analitica. Las divergencias revelan diferentes perspectivas del mismo proceso, contradicciones en la memoria de los actores, o esfuerzos activos por ocultar o distorsionar los hechos. La divergencia entre la version oficial del gobierno de Diaz Ordaz y los testimonios de sobrevivientes de Tlatelolco no es un defecto de las fuentes: es en si misma informacion historica crucial.",
        },
        {
          tipo: "lista",
          items: [
            "Documentos oficiales: decretos, actas, informes gubernamentales que reflejan la perspectiva del Estado",
            "Prensa contemporanea: periodicos y revistas producidos durante los eventos, con sus propios sesgos editoriales",
            "Testimonios de participantes y testigos: orales o escritos, recopilados cerca o lejos de los eventos",
            "Material fotografico y audiovisual: imagenes y grabaciones producidas durante o despues de los hechos",
            "Cables diplomaticos extranjeros: reportes de embajadas y agencias de inteligencia extranjeras, producidos desde afuera del conflicto",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La triangulacion no significa usar solo fuentes que esten de acuerdo entre si. Incluir fuentes contradictorias obliga a un analisis mas riguroso de por que los relatos difieren. Una investigacion que solo cita fuentes que confirman su tesis es metodologicamente debil, aunque cada fuente individual sea valida.",
        },
      ],
    },
  },

  {
    slug: "ch-iii-analisis-iconografico-fotografia-historica",
    titulo:
      "Analisis iconografico: como leer fotografias historicas del Archivo Casasola",
    categoria: "Triangulacion y corroboracion",
    conceptos_clave: [
      "analisis iconografico",
      "archivo Casasola",
      "fotografia historica",
      "lectura de imagen",
      "evidencia visual",
    ],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Las fotografias son fuentes primarias que requieren su propia metodologia de lectura critica. No basta con mirarlas: hay que analizarlas como documentos que fueron producidos con intenciones especificas, desde posiciones particulares, con elecciones deliberadas sobre que incluir y que excluir del encuadre.",
        },
        {
          tipo: "parrafo",
          contenido:
            "El archivo de Agustin Victor Casasola es la coleccion fotografica mas importante de la Revolucion Mexicana (1910-1940): miles de imagenes que han construido la memoria visual de Mexico. El analisis iconografico pregunta: quienes fueron fotografiados y quienes fueron excluidos del encuadre? Desde que angulo y distancia? Quien encargo la fotografia (prensa, gobierno, archivo personal)? Que sugiere el encuadre y que omite? Un ejemplo paradigmatico: las celebres fotografias de Emiliano Zapata y Pancho Villa en el Palacio Nacional (diciembre de 1914) son una escena escenificada que construyo una imagen revolucionaria para la posteridad.",
        },
        {
          tipo: "subtitulo",
          contenido: "Fotografia como construccion, no como reflejo",
        },
        {
          tipo: "parrafo",
          contenido:
            "La fotografia no es una ventana neutra hacia el pasado: es una construccion. El fotografo decide que incluir y que excluir, desde que angulo, con que iluminacion, en que momento disparar el obturador. La seleccion de lo que se archiva y lo que se descarta es una segunda capa de construccion. La edicion y el pie de foto son una tercera. Lo que vemos en una fotografia historica es el resultado de multiples decisiones humanas, no un registro transparente de la realidad.",
        },
        {
          tipo: "lista",
          items: [
            "Identificar: quien aparece, que ocurre, cuando y donde fue tomada (con evidencia, no suposicion)",
            "Analizar el encuadre: que queda dentro y que queda fuera del marco, desde que angulo, con que proximidad",
            "Identificar la autoria y el proposito: quien tomo la fotografia, para quien, con que intencion (prensa, propaganda, archivo personal)",
            "Contrastar con otras fuentes: documentos escritos, otros testimonios, otras fotografias del mismo evento o periodo",
            "Interpretar: que revela la fotografia sobre el evento y su contexto, y que silencia o construye",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Muchas fotografias iconicas de la Revolucion Mexicana fueron reconstruidas o escenificadas. Casasola a veces poso a sus sujetos para lograr el impacto visual deseado. Esto no invalida las fotografias como fuentes historicas, pero requiere tratarlas como construcciones con intencion, no como registros transparentes de la realidad. El analfabetismo fotografico consiste en olvidar esta distincion.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Historiador analizando una fotografia historica en blanco y negro con anotaciones que senalan elementos de composicion y contexto",
          caption:
            "Cada fotografia historica es un encuadre deliberado: lo que esta fuera del marco es historicamente tan relevante como lo que esta dentro.",
        },
      ],
    },
  },

  {
    slug: "ch-iii-fuentes-orales-historia-oral-mexico",
    titulo: "Fuentes orales en Mexico: el proyecto de historia oral del INAH",
    categoria: "Triangulacion y corroboracion",
    conceptos_clave: [
      "historia oral",
      "testimonio",
      "memoria colectiva",
      "INAH",
      "metodologia de historia oral",
    ],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La historia oral es una metodologia historica que recopila, archiva y analiza sistematicamente testimonios orales como fuentes historicas. Es especialmente valiosa para recuperar experiencias de grupos que dejaron pocos registros escritos: campesinos, mujeres indigenas, trabajadores, migrantes. Su premisa es que la experiencia vivida es en si misma una forma de conocimiento historico que los archivos convencionales no pueden capturar.",
        },
        {
          tipo: "parrafo",
          contenido:
            "En Mexico el INAH ha recopilado testimonios orales desde los anos 1960, con colecciones sobre la Revolucion (de veteranos y familias), comunidades indigenas, migracion urbana y movimientos sociales. Elena Poniatowska utilizo testimonios orales para La noche de Tlatelolco (1971), un documento fundamental de historia oral sobre el 2 de octubre de 1968. La obra combina testimonios de estudiantes, soldados, madres y periodistas para construir una narrativa plural del evento que ningun documento oficial podria contener.",
        },
        {
          tipo: "subtitulo",
          contenido: "Metodologia de la entrevista historica",
        },
        {
          tipo: "parrafo",
          contenido:
            "Como se hace historia oral: entrevistas semiestructuradas con preguntas guia (no cuestionarios cerrados), grabacion de audio o video con consentimiento informado del entrevistado, transcripcion literal, analisis critico que considera la distancia temporal del entrevistado respecto a los eventos, su posicion social y perspectiva, y como su memoria puede haber sido transformada por eventos posteriores. La memoria es reconstructiva, no fotografica: selecciona, transforma y a veces crea recuerdos. Los testimonios orales deben triangularse con otras fuentes.",
        },
        {
          tipo: "lista",
          items: [
            "Quien testimonia: cual es su posicion social, su relacion con los eventos, su perspectiva particular?",
            "Cuando, en relacion a los eventos: cuanto tiempo paso entre lo ocurrido y el momento del testimonio?",
            "Con que precision recuerda: que detalles son nitidos y cuales son vagos o contradictorios?",
            "Como ha sido conformada su memoria por eventos posteriores o por narrativas dominantes sobre el mismo periodo?",
            "Que dimensiones de la experiencia vivida revela el testimonio que ningun documento escrito podria capturar?",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La subjetividad del testimonio oral no es un defecto: es informacion. Como una persona recuerda un evento revela el significado que esa experiencia tuvo para ella y como fue procesada dentro de su comunidad y momento historico. La historia oral no busca testimonios objetivos: busca testimonios autenticos y los analiza critica y comparativamente.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Investigadora con dispositivo de grabacion en entrevista con persona mayor de comunidad indigena, con transcripcion visible en primer plano",
          caption:
            "La historia oral recupera voces que los documentos escritos excluyen, y trata la memoria misma como evidencia historica.",
        },
      ],
    },
  },

  // ─── CATEGORIA 3: Narrativa historica argumentada ────────────────────────

  {
    slug: "ch-iii-estructura-narrativa-historica-tesis-argumentos",
    titulo:
      "Como construir una narrativa historica argumentada: tesis, argumentos y evidencias",
    categoria: "Narrativa historica argumentada",
    conceptos_clave: [
      "narrativa historica",
      "tesis historica",
      "argumento",
      "evidencia",
      "interpretacion",
    ],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Una narrativa historica no es una simple cronologia de eventos. Es una interpretacion: explica POR QUE ocurrieron las cosas, que factores las explican y que consecuencias tuvieron. La diferencia entre una lista de fechas y una narrativa historica argumentada es la diferencia entre la cronica y la historia como disciplina critica.",
        },
        {
          tipo: "parrafo",
          contenido:
            "Cuatro componentes de una narrativa historica argumentada: (1) Tesis: una afirmacion interpretativa debatible sobre el pasado, no un hecho, sino una interpretacion. Ejemplo: no La Revolucion comenzo en 1910 (hecho) sino La exclusion politica de las elites regionales bajo el Porfiriato fue el factor estructural que hizo posible la insurreccion armada. (2) Argumentos: las razones que sostienen la tesis. (3) Evidencia: datos especificos, fuentes y ejemplos que respaldan cada argumento. (4) Conclusion: retoma la tesis, evalua el peso de los argumentos, abre nuevas preguntas.",
        },
        {
          tipo: "subtitulo",
          contenido: "Diferencia entre tesis e hipotesis",
        },
        {
          tipo: "parrafo",
          contenido:
            "Una tesis es una afirmacion interpretativa ya respaldada por evidencia; una hipotesis es una proposicion preliminar comprobable. Las tesis historicas deben ser especificas (no genericas), debatibles (no obvias), argumentables (con evidencia disponible) y no anacronicas (formuladas en terminos del periodo estudiado, no del presente).",
        },
        {
          tipo: "lista",
          items: [
            "Debatible: alguien podria sostener razonablemente la posicion contraria con otras evidencias",
            "Especifica: delimitada en tiempo, espacio y alcance interpretativo, no una generalizacion vaga",
            "Bien evidenciada: respaldada por fuentes concretas, no solo por intuicion o conocimiento general",
            "No anacronica: formulada con conceptos y marcos de comprension compatibles con el periodo estudiado",
            "Contextualizada: reconoce las condiciones estructurales e historicas que enmarcan el fenomeno interpretado",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El contraargumento es parte de la buena argumentacion historica. Abordar la objecion a tu propia tesis y explicar por que tu interpretacion es mas solida demuestra rigor metodologico, no debilidad. Una tesis que no puede responder a sus propias objeciones no esta lista para sostenerse como argumento historico.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama que muestra la estructura de cuatro componentes de una narrativa historica: tesis arriba, tres columnas de argumentos, evidencia en la base, conclusion abajo",
          caption:
            "La narrativa historica es un edificio donde la tesis es el techo, los argumentos son columnas y la evidencia es la cimentacion: retirar cualquier elemento derrumba la estructura.",
        },
      ],
    },
  },

  {
    slug: "ch-iii-multiperspectividad-revolucion-mexicana",
    titulo:
      "La multiperspectividad: ver la Revolucion Mexicana desde multiples ojos",
    categoria: "Narrativa historica argumentada",
    conceptos_clave: [
      "multiperspectividad",
      "perspectiva historica",
      "Revolucion Mexicana",
      "actores multiples",
      "historia social",
    ],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La multiperspectividad es el principio metodologico de que un proceso historico se comprende en su complejidad real solo cuando se considera como fue experimentado y percibido por diferentes grupos sociales. No existe una sola experiencia de un evento historico: hay tantas experiencias como posiciones sociales desde las cuales se vivio.",
        },
        {
          tipo: "parrafo",
          contenido:
            "La Revolucion Mexicana (1910-1920) se ve radicalmente diferente segun por quien la observamos: un hacendado porfiriano ve desorden, perdida de propiedad y estabilidad social; un campesino zapatista de Morelos ve la posibilidad de recuperar tierras comunales y justicia para los pobres; una soldadera ve en la Revolucion la tension entre sostener a su familia y participar en un conflicto historico; un inversionista extranjero ve riesgo de expropiacion e inestabilidad politica; un artesano urbano de la Ciudad de Mexico ve disrupcion economica y cambio politico incierto.",
        },
        {
          tipo: "subtitulo",
          contenido: "Multiperspectividad no es relativismo",
        },
        {
          tipo: "parrafo",
          contenido:
            "Incluir multiples perspectivas no significa que todas las interpretaciones sean igualmente validas como evidencia. Algunas fuentes son mas confiables que otras; algunas interpretaciones estan mejor respaldadas. La multiperspectividad significa que el proceso historico tiene dimensiones visibles solo desde ciertas posiciones sociales. Ignorar la perspectiva campesina de la Revolucion no produce una historia mas objetiva: produce una historia parcial que confunde la perspectiva de las elites con la totalidad del proceso.",
        },
        {
          tipo: "lista",
          items: [
            "El Estado y el gobierno: documentos oficiales, leyes, discursos, telegramas diplomaticos",
            "Grupos populares y subalternos: testimonios, corridos, peticiones, archivos judiciales",
            "Las mujeres: correspondencia, memorias, registros de organizaciones femeninas, testimonios orales",
            "Actores internacionales: diplomaticos, empresas, periodistas extranjeros, gobiernos extranjeros",
            "Grupos etnicos marginalizados: comunidades indigenas, afromexicanos, comunidades regionales especificas",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Los corridos de la Revolucion Mexicana son fuentes primarias orales que reflejan como la base (soldados, campesinos, soldaderas) vivio el conflicto, muy diferente a los telegramas diplomaticos del gobierno constitucionalista. Contrastarlos produce una imagen mucho mas rica y honesta del proceso que cualquiera de los dos tipos de fuentes por separado.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Cinco figuras de distintos origenes sociales mirando el mismo evento historico, cada una percibiendo e interpretando una dimension diferente",
          caption:
            "La multiperspectividad no produce relativismo: produce una historia mas rica, completa y honesta de la complejidad humana.",
        },
      ],
    },
  },

  {
    slug: "ch-iii-anacronismo-error-narrativa-historica",
    titulo: "El anacronismo: el error mas comun en la narrativa historica",
    categoria: "Narrativa historica argumentada",
    conceptos_clave: [
      "anacronismo",
      "presentismo",
      "horizonte historico",
      "contextualizacion",
      "juicio historico",
    ],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El anacronismo es atribuir a actores del pasado ideas, valores, conceptos o practicas que no podian existir en su tiempo. Es el error mas comun en el pensamiento historico aficionado y en los usos politicos de la historia. Consiste en proyectar el presente sobre el pasado en lugar de comprender el pasado desde sus propios terminos.",
        },
        {
          tipo: "parrafo",
          contenido:
            "Ejemplos concretos: decir que los aztecas violaron los derechos humanos usa un concepto juridico del siglo XX que no existia en el siglo XV. Decir que Miguel Hidalgo tenia una vision socialista es anacronico: el socialismo como corriente politica surgio decadas despues. Decir que Porfirio Diaz traiciono la democracia asume un concepto de democracia universal que no era la norma en el pensamiento politico del siglo XIX. Cada uno de estos errores impide comprender a los actores historicos en sus propios terminos y contextos.",
        },
        {
          tipo: "subtitulo",
          contenido: "El presentismo como forma de anacronismo",
        },
        {
          tipo: "parrafo",
          contenido:
            "Una forma mas sutil: juzgar a los actores del pasado con los valores y el conocimiento de nuestro presente (presentismo). La tarea del historiador no es juzgar a Cortes con estandares del siglo XXI, sino comprender su accion dentro del sistema de valores, el conocimiento disponible y las opciones reales de su momento historico, para luego analizar las consecuencias de sus acciones, incluyendo para los grupos que excluyeron o perjudicaron. Contextualizar no es lo mismo que justificar.",
        },
        {
          tipo: "lista",
          items: [
            "Atribuir conciencia de clase marxista a actores del siglo XIX anterior a la difusion del marxismo en sus contextos",
            "Llamar democraticas o autoritarias a formas de gobierno del mundo antiguo usando definiciones contemporaneas",
            "Juzgar practicas medicas del pasado como barbaras sin considerar el conocimiento medico disponible en cada epoca",
            "Atribuir a los Padres de la Independencia objetivos de soberania popular que no formaban parte de su horizonte politico",
            "Aplicar categorias de genero del feminismo contemporaneo a mujeres del siglo XIX sin considerar sus propios marcos de autocomprension",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Evitar el anacronismo no significa exculpar a los actores historicos. Significa primero comprenderlos en su contexto, luego evaluar las consecuencias de sus acciones, incluyendo para los grupos que excluyeron o daniaron. La distincion entre contextualizar y justificar es fundamental: se puede explicar sin aprobar, y comprender sin absolver.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Ilustracion de persona del presente juzgando a figura historica en un programa de television, con globo de pensamiento que muestra conceptos anacronicos",
          caption:
            "La historia no puede juzgarse con el retrovisor del presente: contextualizar a los actores historicos en su propio tiempo es el primer requisito metodologico del analisis historico riguroso.",
        },
      ],
    },
  },

  // ─── CATEGORIA 4: Divulgacion e historiografia ───────────────────────────

  {
    slug: "ch-iii-historiografia-corrientes-historia-siglo-xx",
    titulo:
      "Historiografia: las corrientes que transformaron como hacemos historia",
    categoria: "Divulgacion e historiografia",
    conceptos_clave: [
      "historiografia",
      "Escuela de los Annales",
      "historia social",
      "microhistoria",
      "corriente historica",
    ],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La historiografia es el estudio de como se produce el conocimiento historico: que preguntas hacen los historiadores, que metodos utilizan, que fuentes privilegian, desde que posiciones teoricas operan. En el siglo XX varias corrientes revolucionaron la disciplina y expandieron radicalmente lo que puede estudiarse como historia.",
        },
        {
          tipo: "parrafo",
          contenido:
            "Cuatro corrientes fundamentales: (1) Escuela de los Annales (Francia, 1929, Bloch, Febvre, Braudel): amplio el objeto de la historia al clima, la demografia, la economia, las mentalidades, no solo los grandes eventos politicos. (2) Historia social (desde los anos 1960, E.P. Thompson en Reino Unido, Enrique Semo en Mexico): estudio grupos subalternos (trabajadores, campesinos, mujeres) como sujetos historicos. (3) Historia de genero (desde los 1970s, Joan Scott): analizo como el genero es una construccion historica y social que organiza relaciones de poder. (4) Microhistoria (Italia y Mexico, Ginzburg, Luis Gonzalez y Gonzalez): redujo la escala de observacion a comunidades locales para revelar dinamicas estructurales invisibles desde las grandes narrativas.",
        },
        {
          tipo: "subtitulo",
          contenido: "Historiografia mexicana",
        },
        {
          tipo: "parrafo",
          contenido:
            "Mexico tiene una tradicion historiografica propia: desde los cronistas coloniales hasta la historiografia posrevolucionaria nacionalista, pasando por la generacion de El Colegio de Mexico (Cosio Villegas, Luis Gonzalez y Gonzalez, Enrique Florescano) que profesionalizo la disciplina en Mexico durante el siglo XX y la conectó con las corrientes internacionales.",
        },
        {
          tipo: "lista",
          items: [
            "Annales: Que estructuras de larga duracion (clima, economia, mentalidades) condicionaron los eventos politicos?",
            "Historia social: Como vivieron y actuaron los grupos subalternos (campesinos, trabajadores, mujeres)?",
            "Historia de genero: Como se construyo y opero el genero como categoria de poder en cada periodo?",
            "Microhistoria: Que revela la observacion de una comunidad local sobre los grandes procesos nacionales?",
            "Historia cultural: Que significados, representaciones y practicas culturales organizaron la experiencia de una epoca?",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Las escuelas historiograficas no se reemplazan entre si: se acumulan y complementan. Hoy un historiador puede combinar metodos de los Annales, la historia social y la historia de genero en la misma investigacion. La riqueza de la historiografia contemporanea reside precisamente en esta pluralidad metodologica.",
        },
      ],
    },
  },

  {
    slug: "ch-iii-escuela-annales-historia-total-braudel",
    titulo:
      "La Escuela de los Annales y la historia total: Braudel y la longue duree",
    categoria: "Divulgacion e historiografia",
    conceptos_clave: [
      "Escuela de Annales",
      "Fernand Braudel",
      "longue duree",
      "historia total",
      "historia estructural",
    ],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La revista Annales d'histoire economique et sociale (1929), fundada por Marc Bloch y Lucien Febvre en Francia, revoluciono la historiografia al proponer estudiar la totalidad de la experiencia humana, no solo los grandes eventos politicos y militares. Sus preguntas: como vivio la gente? Como comia, creia, sentia, moria? Que estructuras economicas y mentalidades condicionaron los eventos politicos de superficie?",
        },
        {
          tipo: "parrafo",
          contenido:
            "Fernand Braudel (segunda generacion, obra maestra de 1949: El Mediterraneo y el mundo mediterraneo en la epoca de Felipe II) aporto el concepto de la longue duree: el tiempo historico no es uniforme. Existen tres velocidades: el tiempo geografico y estructural (siglos: clima, geografia, estructuras economicas profundas), el tiempo social (decadas: ciclos economicos, estructuras sociales) y el tiempo individual y de los eventos (anos, dias: eventos politicos, batallas, decisiones de actores).",
        },
        {
          tipo: "subtitulo",
          contenido: "La longue duree aplicada a Mexico",
        },
        {
          tipo: "parrafo",
          contenido:
            "Aplicado a Mexico: las profundas estructuras coloniales de desigualdad (tiempo estructural, siglos) condicionaron el modelo economico porfiriano (tiempo social, decadas), que produjo las circunstancias que hicieron posible la Revolucion de 1910 (tiempo de los eventos, anos). Sin entender la longue duree colonial no se puede explicar por que la Revolucion ocurrio cuando y como ocurrio.",
        },
        {
          tipo: "lista",
          items: [
            "Que estructuras geograficas y ambientales condicionaron el desarrollo economico de las regiones de Mexico durante el Porfiriato?",
            "Que ciclos economicos de larga duracion explican la concentracion de la tierra en manos de hacendados y companias extranjeras?",
            "Que mentalidades colectivas (sobre la autoridad, la tierra, la religión) organizaron la resistencia campesina?",
            "Que estructuras demograficas (distribucion de la poblacion, movilidad, tasas de mortalidad) condicionaron el estallido revolucionario?",
            "Que continuidades estructurales coloniales sobrevivieron al proceso de independencia y al liberalismo del siglo XIX?",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Luis Gonzalez y Gonzalez (1925-2003) aplico el espiritu de los Annales a Mexico con su obra maestra Pueblo en vilo (1968), microhistoria de San Jose de Gracia (Michoacan) que mostro como un pueblo pequeno reflejo todos los grandes procesos de la historia nacional mexicana. Es la obra mas importante de la microhistoria regional mexicana y fue traducida a varios idiomas.",
        },
      ],
    },
  },

  {
    slug: "ch-iii-divulgacion-historica-digital-mexico",
    titulo:
      "Divulgacion historica en Mexico: de la academia al podcast y las redes",
    categoria: "Divulgacion e historiografia",
    conceptos_clave: [
      "divulgacion historica",
      "historia publica",
      "podcasts de historia",
      "historiadores mexicanos",
      "acceso al conocimiento",
    ],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La historia es demasiado importante para quedar confinada en revistas academicas de acceso restringido. La divulgacion historica de calidad hace el conocimiento historico riguroso accesible a audiencias no especialistas sin sacrificar la precision ni la complejidad. En Mexico existen canales tradicionales y digitales de divulgacion con distintos alcances y formatos.",
        },
        {
          tipo: "parrafo",
          contenido:
            "Canales tradicionales: las revistas Nexos y Letras Libres publican ensayos historicos de alto nivel para publicos educados no especialistas. La revista Relatos e Historias en Mexico esta dedicada exclusivamente a divulgacion historica para publico general. Los suplementos culturales de Reforma y La Jornada mantienen tradicion de divulgacion humanistica. Canales digitales: historiadores con presencia en redes sociales, canales de YouTube universitarios (UNAM, Colmex), podcasts de Radio UNAM y universidades estatales.",
        },
        {
          tipo: "subtitulo",
          contenido: "La historia publica como practica",
        },
        {
          tipo: "parrafo",
          contenido:
            "La historia publica aplica metodos historicos fuera de la academia para servir a comunidades especificas: museos (el INAH administra mas de 160 museos en Mexico), sitios arqueologicos, archivos comunitarios, exposiciones, murales publicos. El muralismo mexicano (Rivera, Orozco, Siqueiros) fue historia publica avant la lettre: narrativa historica para las masas en las paredes de los edificios publicos, en un pais con alto analfabetismo en los anos 1920-1940.",
        },
        {
          tipo: "lista",
          items: [
            "El ensayo historico academico usa jerga especializada y asume conocimiento disciplinar previo del lector",
            "La divulgacion de calidad traduce conceptos especializados a lenguaje accesible sin falsificarlos ni oversimplificarlos",
            "La divulgacion puede elegir formatos narrativos mas dinamicos (historia-relato, biografia, cronologia dramatizada) sin por eso renunciar a la precision",
            "La buena divulgacion siempre indica sus fuentes aunque sea de forma adaptada (notas al pie, bibliografias comentadas, citas integradas al texto)",
            "El mejor divulgador es un historiador formado que adapta su lenguaje sin comprometer la precision: la accesibilidad no es enemiga del rigor",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La divulgacion de calidad no sacrifica el rigor por la accesibilidad: los mejores divulgadores son historiadores formados que adaptan su lenguaje sin falsificar ni oversimplificar. El reto de la divulgacion es precisamente ese equilibrio: accesible pero riguroso. El lector atento puede distinguir la divulgacion honesta de la historia espectaculo que sacrifica la precision por el entretenimiento.",
        },
      ],
    },
  },

  // ─── CATEGORIA 5: Historia del presente: Mexico contemporaneo ────────────

  {
    slug: "ch-iii-historia-presente-pasado-no-termina",
    titulo: "La historia del presente: el pasado que no termina",
    categoria: "Historia del presente: Mexico contemporaneo",
    conceptos_clave: [
      "historia del presente",
      "memoria historica",
      "continuidad historica",
      "historiografia contemporanea",
      "tiempo historico",
    ],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La historia del presente es un concepto historiografico que senala la continuidad entre pasado y presente: los procesos historicos no se cierran en una fecha, producen estructuras, conflictos y memorias que siguen operando. Este concepto desafia las nociones ingenuas de la historia como una sucesion de periodos neatamente cerrados donde el pasado ya termino y no tiene implicaciones para el presente.",
        },
        {
          tipo: "parrafo",
          contenido:
            "Ejemplos desde Mexico: las desigualdades agrarias indigenas que la Reforma Agraria cardenista intento resolver (1934-1940) se reconstituyeron con el modelo neoliberal y el TLCAN. El Ejercito Zapatista de Liberacion Nacional (EZLN, 1994) retomo explicitamente la memoria de Zapata para articular demandas que conectaban con el conflicto irresuelto del siglo XX. El movimiento estudiantil de 1968 (Tlatelolco) sigue condicionando la manera en que los mexicanos se relacionan con la autoridad politica y la memoria de la violencia de Estado.",
        },
        {
          tipo: "subtitulo",
          contenido: "Memoria e historia",
        },
        {
          tipo: "parrafo",
          contenido:
            "La distincion entre historia y memoria: la historia es un analisis critico del pasado usando metodos y evidencias; la memoria es la experiencia vivida del pasado, cargada de significados afectivos e identidades. Ambas son importantes; ninguna puede reducirse a la otra. La historia puede contradecir la memoria; la memoria puede revelar dimensiones del pasado que los documentos no capturan. Trabajar con ambas, sin confundirlas, es una de las habilidades centrales del historiador contemporaneo.",
        },
        {
          tipo: "lista",
          items: [
            "La desigualdad indigena: sus raices coloniales y como sobrevivio a la Independencia, la Reforma y la Revolucion",
            "El narcotrafico y la violencia: como las estructuras del crimen organizado tienen raices en debilidades historicas del Estado mexicano",
            "Los feminicidios: como el sistema de genero que los produce tiene raices en estructuras patriarcales de larga duracion",
            "Las desigualdades economicas regionales: como el modelo de desarrollo concentrado en ciertas regiones tiene raices en el Porfiriato y el modelo sustitutivo de importaciones",
            "La migracion a Estados Unidos: como el sistema migratorio tiene raices en el Programa Bracero (1942-1964) y en las transformaciones economicas del campo mexicano desde los anos 1980",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Comprender la historia del presente no produce determinismo (la idea de que la historia se repite inevitablemente). Produce conciencia historica: la comprension de que las condiciones actuales tienen causas historicas y que la agencia humana, informada por este conocimiento, puede transformarlas. La historia del presente es un recurso para la accion, no para la resignacion.",
        },
      ],
    },
  },

  {
    slug: "ch-iii-tlatelolco-1968-memoria-historica-mexico",
    titulo:
      "Tlatelolco 1968: la masacre que Mexico tardara decadas en reconocer",
    categoria: "Historia del presente: Mexico contemporaneo",
    conceptos_clave: [
      "Tlatelolco 1968",
      "movimiento estudiantil",
      "memoria historica",
      "violencia de Estado",
      "Elena Poniatowska",
    ],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El 2 de octubre de 1968, diez dias antes de la inauguracion de los Juegos Olimpicos de la Ciudad de Mexico, una manifestacion estudiantil en la Plaza de las Tres Culturas en Tlatelolco fue violentamente reprimida por el Ejercito y el Batallon Olimpia (paramilitares de civil). El movimiento estudiantil habia comenzado meses antes, articulando demandas democraticas en un contexto de autoritarismo del PRI y efervescencia estudiantil internacional (Paris, Praga, Berkeley).",
        },
        {
          tipo: "parrafo",
          contenido:
            "La version oficial del gobierno de Gustavo Diaz Ordaz minimizo los hechos: hablo de una provocacion y pocos muertos. Las estimaciones de victimas oscilan entre decenas (30-40 segun fuentes conservadoras) y varios cientos: el numero real nunca fue establecido oficialmente. Elena Poniatowska publico La noche de Tlatelolco (1971), construida con testimonios orales de sobrevivientes, la primera gran contranarrativa al relato oficial. La obra cambio la forma en que una generacion de mexicanos entendio el evento.",
        },
        {
          tipo: "subtitulo",
          contenido: "La lenta conquista de la verdad",
        },
        {
          tipo: "parrafo",
          contenido:
            "En los anos 1990-2000, documentos de la CIA, el FBI y el Departamento de Estado (EEUU) y de la policia politica mexicana (el Directorado Federal de Seguridad, DFS) fueron desclasificados o filtrados. El Fiscal Especial para los Movimientos Sociales y Politicos del Pasado, creado en 2002, compilo evidencia que sena o al presidente Diaz Ordaz y al secretario de Gobernacion Luis Echeverria como responsables. Echeverria fue sometido a proceso judicial, aunque nunca condenado.",
        },
        {
          tipo: "lista",
          items: [
            "Testimonios orales de sobrevivientes: recopilados por Poniatowska y el INAH, base de la contranarrativa al relato oficial",
            "Cables diplomaticos desclasificados de EEUU: la CIA y el Departamento de Estado documentaron los hechos con mas detalle que la prensa mexicana censurada",
            "Fotografias de prensa: algunas publicadas en Mexico, muchas circularon solo en el extranjero durante anos",
            "Archivos de la policia politica (DFS): documentos internos que revelaron la organizacion del operativo de represion",
            "Testimonios juridicos de sobrevivientes: depositados ante el Fiscal Especial en los anos 2000 como parte del proceso de verdad y justicia",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Tlatelolco 1968 es un caso paradigmatico de como los Estados usan la negacion, la censura y la narrativa oficial para silenciar eventos historicos, y como ciudadanos, historiadores y periodistas usan multiples fuentes y rigor metodologico para recuperar la verdad suprimida. La leccion metodologica: cuando las fuentes oficiales son sospechosas, las fuentes orales, internacionales y documentales alternativas se vuelven vitales para reconstruir lo ocurrido.",
        },
      ],
    },
  },

  {
    slug: "ch-iii-ezln-zapatismo-historia-presente-chiapas",
    titulo: "El EZLN y el zapatismo: historia del presente desde Chiapas",
    categoria: "Historia del presente: Mexico contemporaneo",
    conceptos_clave: [
      "EZLN",
      "zapatismo",
      "Subcomandante Marcos",
      "autonomia indigena",
      "historia del presente",
    ],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El 1 de enero de 1994, el mismo dia en que entro en vigor el TLCAN (Tratado de Libre Comercio de America del Norte), el EZLN (Ejercito Zapatista de Liberacion Nacional) tomo varios municipios de Chiapas y declaro la guerra al Estado mexicano. Su aparicion fue simultaneamente una insurreccion armada, una declaracion politica y una operacion mediatica: los comunicados del Subcomandante Marcos, redactados con precision literaria, se publicaron en internet y llegaron a audiencias globales en horas.",
        },
        {
          tipo: "parrafo",
          contenido:
            "Sus raices historicas eran profundas: Chiapas era (y es) uno de los estados mas pobres y desiguales de Mexico, con una poblacion mayoritariamente indigena (Tzotzil, Tzeltal, Tojolabal, Chol) sistematicamente excluida del poder politico, la tierra y los servicios basicos desde la era colonial. La reforma al articulo 27 constitucional impulsada por Salinas de Gortari en 1991, que ponia fin al reparto agrario y permitia la privatizacion de ejidos, fue la gota que derramo el vaso.",
        },
        {
          tipo: "subtitulo",
          contenido: "La autonomia zapatista como practica",
        },
        {
          tipo: "parrafo",
          contenido:
            "Los Municipios Autonomos Rebeldes Zapatistas (MAREZ) constituyen un modelo alternativo de autogobierno, salud y educacion sin dependencia del Estado mexicano. Los Caracoles son centros de autogobierno local. Las Juntas de Buen Gobierno (JBG) coordinan decisiones de manera comunal. Este modelo ha sido estudiado internacionalmente como alternativa de autonomia indigena y ha influido en movimientos sociales de America Latina, Europa y Asia. El EZLN tomo el nombre y la imagen de Emiliano Zapata, conectando explicitamente 1994 con 1910.",
        },
        {
          tipo: "lista",
          items: [
            "Despojo colonial de tierras: la privatizacion de tierras comunales indigenas desde la Colonia y su continuacion bajo las Leyes de Reforma del siglo XIX",
            "Fracaso de la Reforma Agraria posrevolucionaria en Chiapas: el reparto agrario llego tarde, de manera insuficiente y con mucha violencia paramilitary en las regiones con mayoria indigena",
            "Impacto del TLCAN sobre la agricultura indigena de subsistencia: la apertura al maiz barato de EEUU destruyo la economia campesina chiapaneca",
            "Exclusion politica de las comunidades indigenas: decadas de gobierno priista caciquil que excluia a los pueblos indigenas de toda decision politica real",
            "Decadas de represion militar y paramilitary en Chiapas: el Estado uso la violencia selectiva para suprimir la organizacion politica indigena desde los anos 1970",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El EZLN combina elementos de la tradicion revolucionaria mexicana (Zapata, la tierra, la soberania) con dimensiones nuevas: discurso feminista (la Ley Revolucionaria de Mujeres), ambiental (defensa del territorio selvático), digital (uso de internet para la comunicacion global) y de derechos indigenas (autonomia, Estado plurinacional). Esta combinacion lo convierte en uno de los movimientos sociales mas estudiados de finales del siglo XX a nivel global, y en un caso paradigmatico de historia del presente: un movimiento que reformula el pasado para interpelar el futuro.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Mural que representa figuras de comunidades indigenas zapatistas de Chiapas junto a simbolos de autonomia, selva y comunicacion digital",
          caption:
            "El zapatismo articulo en 1994 una demanda de siglos de historia indigena con los instrumentos politicos y comunicativos del siglo XXI.",
        },
      ],
    },
  },
] as const;

export async function seedBibliotecaCHIII(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed Biblioteca CH-III (15 fichas)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac")
    .select("id")
    .eq("codigo", "CH-III")
    .single();

  if (uacErr || !uacRow) {
    throw new Error(
      `UAC CH-III no encontrada. Ejecuta primero seed-mccems.ts y seed-chiii.ts. Error: ${uacErr?.message}`
    );
  }

  const rows = FICHAS_CHIII.map((f, i) => ({
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

  if (error) throw new Error(`Error seeding fichas CH-III: ${error.message}`);

  console.log(`  ✓ ${rows.length} fichas de biblioteca de CH-III insertadas/actualizadas.`);
  console.log("\n✅ Seed Biblioteca CH-III completado.\n");
}

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
  seedBibliotecaCHIII(sb).catch((err) => {
    console.error("❌ Error:", err.message);
    process.exit(1);
  });
}
