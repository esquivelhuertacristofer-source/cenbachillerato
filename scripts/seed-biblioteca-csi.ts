/**
 * Seed script — Biblioteca Ciencias Sociales I (CS-I)
 * Ejecutar: npx ts-node scripts/seed-biblioteca-csi.ts
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

const UAC_CODIGO = "CS-I";

const FICHAS = [
  {
    slug: "cs-i-que-son-las-ciencias-sociales",
    titulo: "¿Qué son las Ciencias Sociales y por qué importan?",
    categoria: "Fundamentos",
    tiempo_lectura_minutos: 5,
    conceptos_clave: ["ciencias sociales", "sociología", "antropología", "ciencia política", "economía", "geografía"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "Las ciencias sociales son el conjunto de disciplinas académicas que estudian el comportamiento humano, las sociedades y las instituciones. A diferencia de las ciencias naturales, que estudian fenómenos físicos, las ciencias sociales estudian fenómenos culturales, históricos, políticos y económicos que son resultado de la acción humana." },
        { tipo: "subtitulo", contenido: "Principales disciplinas de las ciencias sociales" },
        { tipo: "lista", items: [
          "Sociología: estudia las estructuras sociales, grupos y relaciones humanas",
          "Antropología: estudia la diversidad cultural y las formas de vida humanas",
          "Ciencia política: estudia el poder, el gobierno y los sistemas políticos",
          "Economía: estudia la producción, distribución y consumo de bienes y servicios",
          "Geografía humana: estudia la relación entre las personas y el espacio",
          "Historia: estudia el pasado humano y cómo moldea el presente",
        ] },
        { tipo: "callout", variante: "importante", contenido: "Las ciencias sociales no son opinión disfrazada de ciencia: utilizan métodos rigurosos de investigación (encuestas, etnografías, análisis estadístico, documentos históricos) para llegar a conclusiones fundamentadas. Sin embargo, reconocen que el investigador social siempre es parte de la sociedad que estudia." },
        { tipo: "parrafo", contenido: "Comprender las ciencias sociales es esencial para entender el mundo en que vivimos: por qué hay desigualdad, cómo funciona la democracia, qué causa las guerras, cómo se forman las identidades culturales. Son la base del pensamiento crítico ciudadano." },
        { tipo: "callout", variante: "sabias", contenido: "Auguste Comte, filósofo francés del siglo XIX, acuñó el término 'sociología' y propuso que el estudio de la sociedad debía hacerse con los mismos métodos rigurosos que las ciencias naturales. Esta idea fundó las ciencias sociales modernas, aunque hoy reconocemos que los fenómenos sociales son más complejos y no siempre siguen leyes universales." },
      ],
    },
  },
  {
    slug: "cs-i-mexico-prehispanico",
    titulo: "México Prehispánico: Civilizaciones que Transformaron el Mundo",
    categoria: "Historia de México",
    tiempo_lectura_minutos: 8,
    conceptos_clave: ["olmecas", "mayas", "aztecas", "teotihuacán", "mesoamérica", "civilizaciones prehispánicas"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "Antes de la llegada de los españoles en 1519, el territorio que hoy conocemos como México estaba habitado por numerosas civilizaciones con desarrollos culturales, científicos y artísticos extraordinarios. Mesoamérica — la región que va desde el norte de México hasta Costa Rica — fue cuna de algunas de las civilizaciones más complejas de la humanidad." },
        { tipo: "subtitulo", contenido: "Las grandes civilizaciones mesoamericanas" },
        { tipo: "lista", items: [
          "Olmecas (1500–400 a.C.): 'cultura madre' de Mesoamérica, inventaron el juego de pelota y el sistema de escritura prehispánico",
          "Teotihuacán (100 a.C.–650 d.C.): ciudad más grande del continente americano en su época, con 125,000 habitantes; nadie sabe quiénes la construyeron",
          "Mayas (2000 a.C.–1500 d.C.): desarrollaron el calendario más preciso del mundo antiguo, la escritura jeroglífica y avanzadas matemáticas (incluyendo el concepto del cero)",
          "Zapotecas (700 a.C.–700 d.C.): en Oaxaca, primera civilización mesoamericana en desarrollar sistema de escritura",
          "Mexicas o Aztecas (1300–1521 d.C.): fundaron Tenochtitlan en 1325, capital de un poderoso imperio que dominó gran parte de Mesoamérica al momento de la conquista",
        ] },
        { tipo: "callout", variante: "importante", contenido: "El término 'azteca' fue inventado por el naturalista alemán Alexander von Humboldt en el siglo XIX. Los propios mexicas se llamaban a sí mismos 'mexica' (de donde viene el nombre México). Sus cronistas y documentos usan 'mexica', no 'azteca'." },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Mapa de Mesoamérica mostrando la ubicación geográfica de las principales civilizaciones prehispánicas con sus periodos de apogeo", caption: "La diversidad civilizatoria del México prehispánico." },
        { tipo: "parrafo", contenido: "Tenochtitlan, capital azteca fundada en un islote del Lago de Texcoco, tenía al momento de la conquista entre 200,000 y 300,000 habitantes, siendo una de las cinco ciudades más grandes del mundo. Hernán Cortés quedó asombrado por su organización urbana, sus acueductos y sus mercados, que superaban a los europeos de la época." },
        { tipo: "callout", variante: "sabias", contenido: "Los mayas desarrollaron de forma independiente el concepto matemático del cero, uno de los avances más importantes de la historia humana. Lo hicieron siglos antes de que llegara a Europa desde la India a través de los árabes. Su sistema numérico posicional era tan sofisticado que les permitió crear calendarios extraordinariamente precisos." },
      ],
    },
  },
  {
    slug: "cs-i-conquista-y-colonizacion",
    titulo: "La Conquista y la Colonización: Una Historia Compleja",
    categoria: "Historia de México",
    tiempo_lectura_minutos: 7,
    conceptos_clave: ["conquista española", "Hernán Cortés", "Malinche", "colonialismo", "sincretismo cultural"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "La conquista española del México prehispánico (1519–1521) fue un proceso violento y complejo que transformó radicalmente la vida de millones de personas. No fue simplemente la derrota de los mexicas por los españoles: fue un conflicto en el que participaron decenas de pueblos indígenas que tenían sus propias alianzas, rivalidades y agendas políticas." },
        { tipo: "subtitulo", contenido: "Factores que facilitaron la conquista" },
        { tipo: "lista", items: [
          "Alianzas con pueblos enemigos del Imperio Mexica (tlaxcaltecas, cholultecas, totonacas)",
          "Epidemias de enfermedades europeas (viruela, sarampión) ante las que los indígenas no tenían inmunidad",
          "Armamento superior: armas de acero, caballos, perros de guerra y pólvora",
          "El papel de intérpretes como La Malinche (Malintzin), quien facilitó la comunicación y diplomacia",
          "La creencia de algunos indígenas de que Cortés podría ser la reencarnación del dios Quetzalcóatl",
        ] },
        { tipo: "callout", variante: "importante", contenido: "La figura de La Malinche (Malintzin o Doña Marina) es una de las más debatidas de la historia mexicana. Para algunos fue traidora, para otros fue una mujer que usó inteligentemente sus habilidades lingüísticas para sobrevivir. El término 'malinchismo' (preferir lo extranjero sobre lo propio) aún se usa hoy, lo que muestra cuánto peso histórico lleva su figura." },
        { tipo: "subtitulo", contenido: "El período colonial (1521–1821)" },
        { tipo: "parrafo", contenido: "Durante 300 años, el territorio que hoy es México fue la Nueva España, la joya de la Corona española. En este período se formó la sociedad mestiza: una mezcla de culturas española, indígena y africana (miles de personas esclavizadas fueron traídas de África). Esta mezcla cultural, dolorosa y forzada, es la base de la identidad mexicana contemporánea." },
        { tipo: "callout", variante: "sabias", contenido: "En la época colonial, la sociedad novohispana estaba estrictamente jerarquizada por castas: españoles nacidos en España (peninsulares) tenían más privilegios que los nacidos en América (criollos), quienes tenían más que los mestizos, que a su vez tenían más que los indígenas y los africanos esclavizados. Esta jerarquía racial justificó siglos de explotación." },
      ],
    },
  },
  {
    slug: "cs-i-independencia-de-mexico",
    titulo: "La Independencia de México: La Primera Nación",
    categoria: "Historia de México",
    tiempo_lectura_minutos: 7,
    conceptos_clave: ["independencia", "Hidalgo", "Morelos", "Iturbide", "grito de independencia", "criollos"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "El proceso de independencia de México (1810–1821) fue un movimiento social complejo que involucró a múltiples grupos con diferentes intereses: criollos que querían el poder político, mestizos e indígenas que querían justicia social y tierra, y sectores conservadores que solo querían liberarse de España sin cambiar el orden social." },
        { tipo: "subtitulo", contenido: "Las etapas del movimiento independentista" },
        { tipo: "lista", items: [
          "1810: El cura Miguel Hidalgo da el 'Grito de Dolores' el 16 de septiembre, iniciando la insurrección popular",
          "1811: Hidalgo es capturado y ejecutado; José María Morelos toma el liderazgo",
          "1813: Morelos convoca el Congreso de Chilpancingo, que redacta el primer acto declarativo de independencia",
          "1815: Morelos es capturado y ejecutado; el movimiento se fragmenta",
          "1820-1821: Agustín de Iturbide, oficial realista, pacta con los insurgentes (Plan de Iguala) y consuma la independencia el 27 de septiembre de 1821",
        ] },
        { tipo: "callout", variante: "importante", contenido: "La independencia fue consumada por Agustín de Iturbide, un criollo conservador que inicialmente combatió a los insurgentes. Su Plan de Iguala unió a grupos antagónicos bajo tres garantías: independencia, unión (entre europeos y americanos) y religión (catolicismo como única fe). Por eso el ejército trigarante usaba los colores verde, blanco y rojo." },
        { tipo: "parrafo", contenido: "Un dato frecuentemente ignorado: el movimiento independentista mexicano fue protagonizado principalmente por criollos, indígenas y mestizos pobres, NO por los descendientes directos de los conquistadores españoles. Hidalgo era cura ilustrado, Morelos era hijo de un carpintero mestizo. La independencia fue una revolución social, no solo política." },
        { tipo: "callout", variante: "sabias", contenido: "El Grito de Independencia que se celebra el 15 de septiembre por la noche no coincide exactamente con el grito histórico de Hidalgo, que ocurrió la madrugada del 16 de septiembre de 1810. La fecha se adelantó al siglo XX para que el presidente Porfirio Díaz pudiera celebrarlo el día de su cumpleaños (15 de septiembre). ¡Y así quedó la tradición!" },
      ],
    },
  },
  {
    slug: "cs-i-democracia-y-ciudadania",
    titulo: "Democracia y Ciudadanía: Más Allá del Voto",
    categoria: "Civismo y Participación",
    tiempo_lectura_minutos: 6,
    conceptos_clave: ["democracia", "ciudadanía", "participación política", "sufragio", "derechos políticos"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "La democracia (del griego demos = pueblo, kratos = gobierno) es el sistema político en el que el poder reside en el pueblo, que lo ejerce directamente o mediante representantes elegidos. Pero la democracia va mucho más allá del simple acto de votar: implica una cultura de participación, respeto a los derechos humanos y rendición de cuentas." },
        { tipo: "subtitulo", contenido: "Tipos de democracia" },
        { tipo: "lista", items: [
          "Democracia directa: los ciudadanos deciden directamente las leyes y políticas (referéndum, consulta popular)",
          "Democracia representativa: los ciudadanos eligen representantes que deciden en su nombre (diputados, senadores, presidente)",
          "Democracia participativa: combina representación con mecanismos de participación ciudadana directa",
          "Democracia constitucional: la democracia limitada por una constitución que protege derechos fundamentales",
        ] },
        { tipo: "callout", variante: "importante", contenido: "El voto no garantiza la democracia. Un país puede tener elecciones y aun así ser autoritario si el gobierno controla los medios de comunicación, persigue a la oposición, no respeta el Estado de Derecho o manipula los resultados electorales. La democracia requiere instituciones sólidas, no solo urnas." },
        { tipo: "subtitulo", contenido: "La ciudadanía activa" },
        { tipo: "lista", items: [
          "Informarte sobre los asuntos públicos y los candidatos antes de votar",
          "Participar en consultas públicas y cabildos ciudadanos",
          "Organizarte con tu comunidad para resolver problemas locales",
          "Exigir rendición de cuentas a tus representantes",
          "Usar mecanismos legales: amparos, peticiones, recursos de transparencia (INAI)",
        ] },
        { tipo: "callout", variante: "sabias", contenido: "En México, las mujeres obtuvieron el derecho al voto federal en 1953, casi un siglo después de que se proclamara el sufragio universal masculino en 1857. Fue gracias a la lucha organizada de mujeres como Amalia González Caballero y Esperanza Balmaceda. Hoy México tiene paridad de género en el Congreso: 50% de los escaños deben ser ocupados por mujeres." },
      ],
    },
  },
  {
    slug: "cs-i-derechos-humanos",
    titulo: "Derechos Humanos: El Mínimo Ético de la Civilización",
    categoria: "Derechos y Justicia",
    tiempo_lectura_minutos: 6,
    conceptos_clave: ["derechos humanos", "DUDH", "ONU", "indivisibilidad", "mecanismos de defensa"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "Los derechos humanos son los derechos fundamentales que corresponden a todas las personas por el simple hecho de ser humanas, sin distinción de nacionalidad, sexo, raza, religión o cualquier otra condición. Son universales, inalienables e indivisibles: no se pueden comprar, vender, perder ni fragmentar." },
        { tipo: "subtitulo", contenido: "Las generaciones de derechos humanos" },
        { tipo: "lista", items: [
          "Primera generación (civiles y políticos): derecho a la vida, libertad de expresión, libertad religiosa, voto. Garantizan al individuo frente al Estado.",
          "Segunda generación (económicos, sociales y culturales): derecho a la educación, salud, trabajo, vivienda. Obligan al Estado a actuar.",
          "Tercera generación (colectivos y de solidaridad): derecho al medio ambiente sano, al desarrollo, a la paz. Son de los pueblos, no solo de los individuos.",
        ] },
        { tipo: "callout", variante: "importante", contenido: "En 2011, México reformó el Artículo 1° de su Constitución para establecer que los derechos humanos son el principio rector de todo el sistema jurídico mexicano. Esto significa que cualquier ley, decreto o acto de autoridad que viole derechos humanos puede ser impugnado, incluso si está 'en la ley'." },
        { tipo: "parrafo", contenido: "La Declaración Universal de los Derechos Humanos (DUDH) fue adoptada por la ONU el 10 de diciembre de 1948, apenas tres años después del fin de la Segunda Guerra Mundial. Es el documento de derechos más traducido de la historia (más de 500 idiomas) y el marco internacional que vincula a todos los Estados." },
        { tipo: "lista", items: [
          "CNDH: Comisión Nacional de los Derechos Humanos (México)",
          "CIDH: Comisión Interamericana de Derechos Humanos (OEA)",
          "Corte IDH: Corte Interamericana de Derechos Humanos (San José, Costa Rica)",
          "Alto Comisionado de la ONU para los DDHH (Ginebra)",
        ] },
        { tipo: "callout", variante: "sabias", contenido: "Eleanor Roosevelt, quien presidió la comisión que redactó la DUDH en 1948, decía que los derechos humanos comienzan 'en lugares pequeños, cercanos al hogar... el barrio donde vive el niño, la escuela a la que va, la fábrica donde trabaja'. Los derechos humanos son cotidianos, no son solo asuntos de grandes tribunales internacionales." },
      ],
    },
  },
  {
    slug: "cs-i-desigualdad-social",
    titulo: "Desigualdad Social en México: Causas, Consecuencias y Alternativas",
    categoria: "Sociedad y Economía",
    tiempo_lectura_minutos: 7,
    conceptos_clave: ["desigualdad", "coeficiente Gini", "pobreza", "movilidad social", "política pública"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "La desigualdad social es la distribución desigual de recursos, oportunidades y poder en una sociedad. México es uno de los países más desiguales del mundo: los 10 hombres más ricos del país concentran tanta riqueza como los 100 millones de mexicanos más pobres. Esta desigualdad extrema no es natural: es resultado de decisiones políticas, históricas y económicas." },
        { tipo: "subtitulo", contenido: "Midiendo la desigualdad: el coeficiente Gini" },
        { tipo: "parrafo", contenido: "El coeficiente Gini mide la desigualdad en una escala de 0 (perfecta igualdad: todos tienen lo mismo) a 1 (perfecta desigualdad: una persona tiene todo). México tiene un Gini de 0.42, uno de los más altos de América Latina. Países como Dinamarca y Finlandia tienen Gini de 0.28, mientras que los más desiguales del mundo superan 0.60." },
        { tipo: "callout", variante: "importante", contenido: "La pobreza y la desigualdad son cosas distintas. Es posible reducir la pobreza sin reducir la desigualdad (si todos mejoran, pero los ricos mejoran más). La desigualdad extrema es dañina por sí misma: reduce la movilidad social, deteriora la salud pública, debilita la democracia y genera violencia." },
        { tipo: "subtitulo", contenido: "¿Puede cambiarse la desigualdad?" },
        { tipo: "lista", items: [
          "Sistemas tributarios progresivos (los que más tienen, más pagan)",
          "Acceso universal a educación y salud de calidad",
          "Políticas de salario mínimo y derechos laborales",
          "Transferencias directas a poblaciones vulnerables",
          "Combate a la corrupción (que concentra riqueza en manos de pocos)",
        ] },
        { tipo: "callout", variante: "sabias", contenido: "El economista francés Thomas Piketty demostró en su libro 'El capital en el siglo XXI' (2013) que, históricamente, el retorno del capital (rendimientos de inversiones) supera el crecimiento económico general, lo que significa que la riqueza tiende a concentrarse en menos manos con el tiempo, a menos que haya políticas redistributivas activas." },
      ],
    },
  },
  {
    slug: "cs-i-genero-y-diversidad",
    titulo: "Género, Diversidad e Igualdad en la Sociedad Mexicana",
    categoria: "Derechos y Justicia",
    tiempo_lectura_minutos: 6,
    conceptos_clave: ["género", "sexo", "feminismo", "diversidad sexual", "violencia de género"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "El género es la construcción social y cultural de lo que significa ser hombre o mujer en una sociedad determinada. A diferencia del sexo biológico (características físicas), el género varía entre culturas e historias: lo que se considera 'masculino' en México podría ser distinto en Japón o en una comunidad indígena zapoteca del siglo pasado." },
        { tipo: "subtitulo", contenido: "Conceptos clave" },
        { tipo: "lista", items: [
          "Sexo: características biológicas (cromosomas, gónadas, hormonas)",
          "Género: construcción social de roles, identidades y expectativas",
          "Identidad de género: cómo una persona se identifica a sí misma (puede no coincidir con el sexo asignado al nacer)",
          "Orientación sexual: atracción emocional y/o sexual hacia otras personas (hetero, homo, bi, etc.)",
          "Expresión de género: cómo una persona exterioriza su género (ropa, comportamiento)",
        ] },
        { tipo: "callout", variante: "importante", contenido: "El machismo no afecta solo a las mujeres: también daña a los hombres al imponerles modelos de 'masculinidad tóxica' que los obligan a suprimir emociones, evitar pedir ayuda y ejercer violencia como forma de demostrar poder. La igualdad de género beneficia a toda la sociedad." },
        { tipo: "parrafo", contenido: "En México, la violencia de género es una crisis de derechos humanos: aproximadamente 10 mujeres son asesinadas cada día (feminicidio). El movimiento feminista mexicano, especialmente el colectivo 'Las Tesis' con su performance viral 'El violador eres tú', ha colocado este problema en el centro del debate nacional e internacional." },
        { tipo: "callout", variante: "sabias", contenido: "Los pueblos zapotecos de Oaxaca reconocen desde hace siglos a las 'muxes', personas asignadas como hombres al nacer que asumen roles femeninos. Son valoradas y respetadas en su comunidad como 'un tercer género'. Este ejemplo muestra que la diversidad de identidades de género es parte de la historia humana, no un fenómeno moderno occidental." },
      ],
    },
  },
  {
    slug: "cs-i-globalizacion",
    titulo: "Globalización: Un Mundo Interconectado",
    categoria: "Sociedad y Economía",
    tiempo_lectura_minutos: 6,
    conceptos_clave: ["globalización", "libre comercio", "soberanía", "identidad cultural", "TLC"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "La globalización es el proceso de interconexión creciente entre países en los ámbitos económico, político, cultural y tecnológico. Ha acelerado el intercambio de bienes, servicios, ideas y personas a nivel mundial, generando tanto oportunidades como desafíos para las sociedades." },
        { tipo: "subtitulo", contenido: "Dimensiones de la globalización" },
        { tipo: "lista", items: [
          "Económica: libre comercio internacional, cadenas globales de producción, corporaciones multinacionales",
          "Cultural: difusión de música, cine, moda y valores a nivel mundial; riesgo de homogeneización cultural",
          "Política: organismos internacionales (ONU, FMI, OMC), tratados multilaterales, pérdida de soberanía estatal",
          "Tecnológica: internet como infraestructura global, transferencia instantánea de información",
        ] },
        { tipo: "callout", variante: "importante", contenido: "El TMEC (antes TLCAN/NAFTA), firmado entre México, Estados Unidos y Canadá en 1994, integró la economía mexicana a la norteamericana. Ha generado crecimiento en sectores exportadores, pero también desigualdad regional: el norte exportador prospera mientras el sur agrícola sufre competencia desleal con productos subsidiados de EE.UU." },
        { tipo: "parrafo", contenido: "La globalización no es un fenómeno neutral: tiene ganadores y perdedores. Las empresas transnacionales se benefician del libre mercado, pero los trabajadores pueden ver reducidos sus derechos cuando las empresas amenazan con trasladarse a países con menores regulaciones. La competencia entre países por atraer inversión puede derivar en una 'carrera hacia el fondo' de derechos laborales y ambientales." },
        { tipo: "callout", variante: "sabias", contenido: "La pandemia de COVID-19 evidenció la vulnerabilidad de las cadenas globales de suministro: cuando las fábricas en China cerraron, el mundo entero sufrió escasez de desde microchips hasta cubrebocas. Esto ha llevado a muchos países a repensar su dependencia del comercio global y a buscar mayor autosuficiencia en sectores estratégicos." },
      ],
    },
  },
  {
    slug: "cs-i-medio-ambiente-y-sociedad",
    titulo: "Crisis Climática: Una Problemática Social, no solo Ambiental",
    categoria: "Sociedad y Economía",
    tiempo_lectura_minutos: 6,
    conceptos_clave: ["cambio climático", "justicia climática", "Acuerdo de París", "huella de carbono", "vulnerabilidad"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "El cambio climático no es solo un problema ambiental: es una crisis social que afecta desproporcionadamente a los más vulnerables. Los países y comunidades que menos han contribuido al calentamiento global son los que más sufren sus consecuencias: inundaciones, sequías, pérdida de cosechas y desplazamiento forzado." },
        { tipo: "subtitulo", contenido: "El cambio climático y la desigualdad" },
        { tipo: "lista", items: [
          "El 10% más rico de la humanidad genera el 50% de las emisiones de carbono",
          "El 50% más pobre genera solo el 10% de las emisiones",
          "Las comunidades indígenas y rurales son las más afectadas por sequías, inundaciones y pérdida de biodiversidad",
          "Los refugiados climáticos (personas desplazadas por el cambio climático) podrían superar los 200 millones para 2050",
        ] },
        { tipo: "callout", variante: "importante", contenido: "La justicia climática es el principio de que los países y grupos sociales que más han contribuido al cambio climático (países industrializados ricos) tienen mayor responsabilidad en pagarlo y solucionarlo, en lugar de cargar la responsabilidad sobre los más pobres que menos lo causaron." },
        { tipo: "parrafo", contenido: "México es particularmente vulnerable al cambio climático: el sur del país sufre sequías más intensas, las costas enfrentan ciclones más frecuentes y poderosos, y los glaciares del Citlaltépetl (Pico de Orizaba) y el Popocatépetl están desapareciendo. Al mismo tiempo, México es también responsable: es el décimo emisor mundial de gases de efecto invernadero." },
        { tipo: "callout", variante: "sabias", contenido: "El Acuerdo de París (2015) comprometió a casi todos los países del mundo a limitar el calentamiento global a menos de 2°C. Sin embargo, los compromisos actuales llevan a un calentamiento de 2.7°C. Greta Thunberg y el movimiento Fridays for Future surgieron precisamente de la frustración ante la brecha entre los compromisos climáticos y las acciones reales de los gobiernos." },
      ],
    },
  },
  {
    slug: "cs-i-organizacion-social",
    titulo: "Formas de Organización Social: De la Familia al Estado",
    categoria: "Fundamentos",
    tiempo_lectura_minutos: 5,
    conceptos_clave: ["familia", "comunidad", "Estado", "sociedad civil", "organización social"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "Los seres humanos somos animales sociales: necesitamos vivir en grupos para sobrevivir y desarrollarnos. A lo largo de la historia, hemos creado distintas formas de organización social, desde las pequeñas bandas de cazadores-recolectores hasta las modernas naciones-Estado con millones de ciudadanos." },
        { tipo: "subtitulo", contenido: "Escalas de organización social" },
        { tipo: "lista", items: [
          "Familia: unidad básica de socialización y reproducción (muy diversa en su forma)",
          "Comunidad: personas que comparten un espacio, valores o intereses",
          "Asociaciones civiles: organizaciones voluntarias para fines específicos (clubes, ONG, sindicatos)",
          "Municipio: unidad administrativa local con gobierno propio",
          "Estado-nación: forma moderna de organización política con territorio, población y soberanía",
          "Organizaciones internacionales: ONU, OEA, Unión Europea (por encima de los estados nacionales)",
        ] },
        { tipo: "callout", variante: "importante", contenido: "La familia no tiene una forma 'natural' o universal: existe en formatos muy diversos según la cultura e historia. Familias nucleares (padre-madre-hijos), extensas (varias generaciones), monoparentales, homoparentales, comunitarias. Lo común es la función: cuidado, socialización y afecto." },
        { tipo: "parrafo", contenido: "La sociedad civil son todas las organizaciones e iniciativas de ciudadanos que actúan fuera del Estado y del mercado: sindicatos, iglesias, organizaciones no gubernamentales, medios de comunicación, universidades, movimientos sociales. Es el espacio donde los ciudadanos ejercen su voz colectiva y controlan al poder político." },
        { tipo: "callout", variante: "sabias", contenido: "Los ejidos son una forma de organización agraria comunitaria creada por la Revolución Mexicana (1917): la tierra pertenece colectivamente a la comunidad, no a individuos. Hoy existen cerca de 31,000 ejidos en México, que cubren el 52% del territorio nacional. Son una forma única de organización social que mezcla tradición indígena comunitaria con política posrevolucionaria." },
      ],
    },
  },
  {
    slug: "cs-i-poder-y-politica",
    titulo: "El Poder y la Política: ¿Quién Decide y Cómo?",
    categoria: "Civismo y Participación",
    tiempo_lectura_minutos: 6,
    conceptos_clave: ["poder", "política", "Estado", "gobierno", "division de poderes", "legitimidad"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "La política es el conjunto de actividades relacionadas con la toma de decisiones colectivas en una sociedad. Implica el ejercicio del poder: la capacidad de influir en el comportamiento de otros. El sociólogo Max Weber definió el Estado como la institución que tiene el monopolio legítimo de la violencia dentro de un territorio." },
        { tipo: "subtitulo", contenido: "División de poderes en México" },
        { tipo: "lista", items: [
          "Poder Ejecutivo: Presidente de la República, gobierna y administra",
          "Poder Legislativo: Congreso (Cámara de Diputados + Senado), hace las leyes",
          "Poder Judicial: Suprema Corte, Tribunales; interpreta y aplica la ley",
        ] },
        { tipo: "callout", variante: "importante", contenido: "La separación de poderes fue diseñada por el filósofo Montesquieu (siglo XVIII) para evitar la tiranía: si el mismo órgano hace las leyes, las aplica y juzga si se cumplen, tiene poder absoluto. Los tres poderes se controlan mutuamente (sistema de pesos y contrapesos) para proteger los derechos ciudadanos." },
        { tipo: "parrafo", contenido: "La legitimidad del poder es la aceptación social de que quien gobierna tiene derecho a hacerlo. Un gobierno puede tener legalidad (fue electo conforme a la ley) pero perder legitimidad (si actúa de manera corrupta o alejada de los intereses ciudadanos). La legitimidad democrática se renueva periódicamente mediante elecciones." },
        { tipo: "callout", variante: "sabias", contenido: "México tuvo un sistema de partido único durante 71 años (1929–2000), cuando el PRI dominó todas las instituciones del país. La transición a la democracia multipartidista fue gradual: el PAN ganó su primera gubernatura en 1989 (Baja California) y la presidencia en el año 2000 con Vicente Fox. Este período cambia la forma en que los mexicanos entienden la política." },
      ],
    },
  },
  {
    slug: "cs-i-sociedad-y-medios-de-comunicacion",
    titulo: "Medios de Comunicación y Opinión Pública",
    categoria: "Civismo y Participación",
    tiempo_lectura_minutos: 6,
    conceptos_clave: ["medios de comunicación", "libertad de prensa", "opinión pública", "agenda setting", "desinformación"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "Los medios de comunicación son actores políticos fundamentales: seleccionan qué hechos se convierten en noticias, cómo se encuadran y qué perspectiva se privilegia. Esta capacidad de definir qué temas están en la agenda pública se llama 'agenda setting' (establecimiento de agenda)." },
        { tipo: "subtitulo", contenido: "Tipos de medios y sus características" },
        { tipo: "lista", items: [
          "Medios tradicionales: televisión, radio, periódicos (alta credibilidad histórica, control corporativo)",
          "Medios digitales nativos: portales de noticias, blogs especializados (mayor diversidad, pero también menor regulación)",
          "Redes sociales: cualquiera puede publicar, democratiza la información pero también amplifica la desinformación",
          "Medios alternativos e independientes: buscan informar sin presión gubernamental o publicitaria",
        ] },
        { tipo: "callout", variante: "importante", contenido: "La libertad de prensa es un indicador clave de la salud democrática de un país. México ocupa el lugar 121 de 180 países en el Índice de Libertad de Prensa 2024 de Reporteros Sin Fronteras, entre los 'difíciles'. El país es uno de los más peligrosos del mundo para ejercer el periodismo." },
        { tipo: "parrafo", contenido: "En la era digital, la desinformación se propaga más rápido que los desmentidos. Los bulos (fake news), los datos fuera de contexto y las narrativas manipuladas pueden moldear la opinión pública de millones de personas antes de que se les pueda corregir. El pensamiento crítico mediático es hoy una competencia ciudadana indispensable." },
        { tipo: "callout", variante: "sabias", contenido: "El periodismo de datos es una especialidad que utiliza bases de datos y visualizaciones para contar historias complejas de manera comprensible. En México, medios como Animal Político, Nexos, Proceso y El Universal tienen equipos de datos que han revelado casos de corrupción y violaciones de derechos humanos que de otra manera habrían permanecido ocultos." },
      ],
    },
  },
  {
    slug: "cs-i-movimientos-sociales",
    titulo: "Movimientos Sociales: La Acción Colectiva que Cambia la Historia",
    categoria: "Civismo y Participación",
    tiempo_lectura_minutos: 6,
    conceptos_clave: ["movimientos sociales", "acción colectiva", "protesta", "cambio social", "movimiento estudiantil"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "Los movimientos sociales son acciones colectivas organizadas que buscan promover o resistir cambios en la sociedad. Han sido protagonistas de las transformaciones más importantes de la historia: la abolición de la esclavitud, el sufragio femenino, los derechos civiles, la independencia de colonias y la protección del medio ambiente." },
        { tipo: "subtitulo", contenido: "Características de los movimientos sociales" },
        { tipo: "lista", items: [
          "Son colectivos: involucran a muchas personas con un objetivo común",
          "Son sostenidos: no son actos aislados sino acciones prolongadas en el tiempo",
          "Desafían estructuras de poder: cuestionan normas, leyes o autoridades establecidas",
          "Tienen identidad: generan un sentido de 'nosotros' compartido",
          "Usan distintas estrategias: marchas, huelgas, boicots, medios digitales, arte, desobediencia civil",
        ] },
        { tipo: "callout", variante: "importante", contenido: "El movimiento estudiantil de 1968 en México terminó con la masacre de Tlatelolco el 2 de octubre, cuando el ejército disparó contra estudiantes que protestaban en la Plaza de las Tres Culturas, días antes de los Juegos Olímpicos de México. El número de muertos nunca fue reconocido oficialmente, pero estimaciones hablan de 30 a más de 300 personas." },
        { tipo: "parrafo", contenido: "En México, movimientos sociales como el Ejército Zapatista de Liberación Nacional (EZLN, 1994), el Movimiento por la Paz con Justicia y Dignidad (2011), el #YoSoy132 (2012) y el movimiento feminista (2020) han marcado la agenda política nacional y evidenciado demandas que los partidos políticos no respondían." },
        { tipo: "callout", variante: "sabias", contenido: "Rosa Parks no fue la primera en negarse a ceder su asiento en un autobús segregado en Montgomery, Alabama: otras mujeres lo hicieron antes que ella. Pero el movimiento de derechos civiles eligió estratégicamente a Parks porque era costurera respetada y su caso era legalmente más sólido. Los movimientos sociales también hacen estrategia de comunicación." },
      ],
    },
  },
  {
    slug: "cs-i-economia-basica",
    titulo: "Economía Básica: Cómo Funciona el Sistema que Nos Rodea",
    categoria: "Sociedad y Economía",
    tiempo_lectura_minutos: 5,
    conceptos_clave: ["oferta y demanda", "mercado", "PIB", "inflación", "sistema económico"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "La economía estudia cómo las sociedades toman decisiones sobre qué producir, cómo producirlo y para quién distribuirlo, en un contexto de recursos escasos. No es solo un asunto de dinero y empresas: la economía afecta directamente tu vida: el precio del transporte, las oportunidades de empleo, el costo de los alimentos." },
        { tipo: "subtitulo", contenido: "Conceptos económicos básicos" },
        { tipo: "lista", items: [
          "Oferta y demanda: el precio de un bien sube cuando hay mucha demanda y poca oferta, y baja cuando hay mucha oferta y poca demanda",
          "PIB (Producto Interno Bruto): el valor total de todos los bienes y servicios producidos en un país en un año",
          "Inflación: aumento generalizado y sostenido de los precios (tu dinero compra menos)",
          "Desempleo: porcentaje de personas que buscan trabajo y no lo encuentran",
          "Salario mínimo: el pago mínimo que un empleador puede pagar legalmente",
        ] },
        { tipo: "callout", variante: "importante", contenido: "La inflación afecta más a los pobres que a los ricos. Cuando el precio de los alimentos básicos sube 10%, una familia que gasta el 60% de su ingreso en comida pierde proporcionalmente mucho más que una familia rica que solo gasta el 10% en alimentos. La inflación es también una forma de desigualdad." },
        { tipo: "parrafo", contenido: "Existen distintos modelos de sistema económico: capitalismo (propiedad privada, mercado libre), socialismo (propiedad estatal, planificación central) y economías mixtas (la mayoría de los países modernos: mercado libre con regulación estatal y programas sociales). México tiene una economía mixta." },
        { tipo: "callout", variante: "sabias", contenido: "El salario mínimo en México pasó de $88.36 pesos diarios en 2018 a $248.93 en 2024, un aumento del 181% en términos nominales. Sin embargo, la inflación acumulada en ese período fue de aproximadamente 40%. El aumento real del poder adquisitivo del salario mínimo fue significativo, pero México sigue siendo uno de los países de la OCDE con salario mínimo más bajo en términos de paridad de poder adquisitivo." },
      ],
    },
  },
  {
    slug: "cs-i-identidad-nacional",
    titulo: "Identidad Nacional Mexicana: ¿Qué nos hace Mexicanos?",
    categoria: "Cultura e Identidad",
    tiempo_lectura_minutos: 5,
    conceptos_clave: ["identidad nacional", "mestizaje", "pluriculturalidad", "símbolos patrios", "diversidad"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "La identidad nacional es el conjunto de elementos culturales, históricos, simbólicos y afectivos que generan un sentido de pertenencia a una nación. La identidad mexicana es resultado de un proceso histórico complejo: la fusión (muchas veces violenta) de culturas indígenas, española y africana, más influencias árabes, asiáticas y de otras partes del mundo." },
        { tipo: "subtitulo", contenido: "Componentes de la identidad mexicana" },
        { tipo: "lista", items: [
          "El mestizaje cultural: gastronomía, música, arte, lenguaje que fusionan tradiciones diversas",
          "Los 68 pueblos indígenas reconocidos con sus propias lenguas y culturas",
          "La narrativa histórica compartida: conquista, independencia, Revolución como hitos identitarios",
          "Los símbolos patrios: bandera, escudo, himno nacional",
          "La gastronomía mexicana declarada Patrimonio Cultural Inmaterial por la UNESCO en 2010",
        ] },
        { tipo: "callout", variante: "importante", contenido: "El Artículo 2° de la Constitución Mexicana reconoce a México como una nación pluricultural, sustentada en sus pueblos indígenas. Sin embargo, reconocimiento legal y realidad social son cosas distintas: los pueblos indígenas siguen siendo los grupos más marginados económicamente y los que menos acceso tienen a servicios de salud, educación y justicia." },
        { tipo: "parrafo", contenido: "La pregunta '¿qué es ser mexicano?' ha sido tema de reflexión de filósofos, escritores y artistas. Octavio Paz en 'El laberinto de la soledad' (1950) propuso que la identidad mexicana está marcada por la soledad, el disimulo y la herida de la conquista. Samuel Ramos y Jorge Portilla también exploraron este tema desde la filosofía." },
        { tipo: "callout", variante: "sabias", contenido: "México tiene 35 sitios declarados Patrimonio de la Humanidad por la UNESCO: 27 culturales, 6 naturales y 2 mixtos. Entre ellos: la Ciudad Histórica de México y Xochimilco, Monte Albán, Chichén Itzá, Teotihuacán, la Reserva de la Biósfera de Mariposa Monarca y la cocina tradicional mexicana. Somos custodios de un patrimonio inmenso." },
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
