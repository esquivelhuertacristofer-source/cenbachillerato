/**
 * Seed de fichas de biblioteca para CS-II (Ciencias Sociales II).
 * 14 fichas temáticas alineadas al MCCEMS 2025, Semestre 2.
 *
 * Meta educativa: Analice las formas de organización social, económica y
 * productiva de la sociedad mexicana y su relación con el bienestar,
 * la desigualdad y las relaciones de poder.
 *
 * Uso: npx tsx scripts/seed-fichas-csii.ts
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

const FICHAS_CSII = [
  // ── 1 ──────────────────────────────────────────────────────────────────────
  {
    slug: "cs-ii-idh-bienestar-humano",
    titulo: "El Índice de Desarrollo Humano y la medición del bienestar",
    categoria: "Análisis crítico",
    conceptos_clave: ["IDH", "bienestar humano", "PNUD", "esperanza de vida", "educación", "ingreso"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Durante décadas, el Producto Interno Bruto (PIB) per cápita fue la medida dominante del progreso de una nación. Sin embargo, economistas y científicos sociales señalaron que el ingreso promedio oculta desigualdades enormes y no captura dimensiones fundamentales de la vida humana: la salud, la educación y la libertad de elegir el propio proyecto de vida. En 1990, el Programa de las Naciones Unidas para el Desarrollo (PNUD) publicó el primer Informe sobre Desarrollo Humano, introduciendo el Índice de Desarrollo Humano (IDH) como alternativa.",
        },
        {
          tipo: "subtitulo",
          contenido: "¿Qué mide el IDH?",
        },
        {
          tipo: "lista",
          items: [
            "Salud: esperanza de vida al nacer, que refleja el acceso a alimentación, servicios médicos y condiciones de vida dignas.",
            "Educación: años promedio de escolaridad de adultos mayores de 25 años y años esperados de escolarización para niños en edad escolar.",
            "Nivel de vida digno: ingreso nacional bruto per cápita ajustado por paridad de poder adquisitivo (PPA), expresado en dólares internacionales de 2017.",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "Cada dimensión se normaliza en una escala de 0 a 1, y el IDH final es la media geométrica de los tres índices. En 2023, México obtuvo un IDH de 0.781, ubicándose en la categoría de desarrollo humano alto, en el puesto 77 de 193 países. Sin embargo, cuando se aplica el IDH ajustado por desigualdad (IDH-D), el valor mexicano cae significativamente, evidenciando que los logros promedio están distribuidos de forma muy inequitativa entre la población.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El IDH-D de México en 2022 fue de 0.613, una pérdida del 21.5% respecto al IDH sin ajuste. Esta brecha refleja desigualdades profundas en salud, educación e ingresos entre regiones, clases sociales, géneros y grupos étnicos. Los estados del sur como Chiapas, Guerrero y Oaxaca registran valores de IDH equivalentes a países de desarrollo humano medio, mientras que estados como Nuevo León y Ciudad de México se acercan al desarrollo alto.",
        },
        {
          tipo: "subtitulo",
          contenido: "Críticas al IDH y alternativas",
        },
        {
          tipo: "parrafo",
          contenido:
            "El IDH ha sido criticado por omitir dimensiones como la seguridad pública, la sostenibilidad ambiental, la libertad política y el bienestar subjetivo. Como respuesta, el PNUD ha desarrollado índices complementarios: el Índice de Desigualdad de Género (IDG), el Índice de Pobreza Multidimensional (IPM) y el Índice Planetario de Desarrollo Humano (IPDH), que incorpora la huella ecológica. Amartya Sen, economista ganador del Premio Nobel y arquitecto intelectual del IDH, insiste en que el desarrollo debe entenderse como la expansión de las libertades reales de las personas, no solo como crecimiento económico.",
        },
        {
          tipo: "cita",
          contenido:
            "El desarrollo puede concebirse como un proceso de expansión de las libertades reales de que disfrutan los individuos.",
          fuente: "Amartya Sen, Desarrollo y Libertad (1999)",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Mapa de México con estados coloreados según su IDH, mostrando la brecha Norte-Sur. Los estados del norte y Ciudad de México aparecen en verde oscuro, mientras Chiapas, Guerrero y Oaxaca aparecen en naranja.",
          caption: "Disparidades del IDH entre estados de México (PNUD-México, 2022).",
        },
      ],
    },
  },

  // ── 2 ──────────────────────────────────────────────────────────────────────
  {
    slug: "cs-ii-desigualdad-gini",
    titulo: "Desigualdad económica y el coeficiente GINI",
    categoria: "Análisis crítico",
    conceptos_clave: ["coeficiente GINI", "desigualdad", "distribución del ingreso", "curva de Lorenz", "ENIGH"],
    tiempo_lectura_minutos: 8,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La desigualdad económica es una de las características estructurales más persistentes de la sociedad mexicana. Para medirla, los economistas utilizan el coeficiente GINI, desarrollado por el estadístico italiano Corrado Gini en 1912. Este índice varía entre 0 (igualdad perfecta: todos tienen el mismo ingreso) y 1 (desigualdad total: una sola persona concentra todo el ingreso). En la práctica, ningún país se encuentra en los extremos, pero las diferencias entre naciones son enormes y reveladoras.",
        },
        {
          tipo: "subtitulo",
          contenido: "La curva de Lorenz y el GINI en México",
        },
        {
          tipo: "parrafo",
          contenido:
            "El coeficiente GINI se deriva de la curva de Lorenz, que representa gráficamente la distribución acumulada del ingreso. Si el 10% más pobre de la población recibe exactamente el 10% del ingreso total, la curva coincide con la línea de perfecta igualdad (diagonal de 45°). En la realidad, la curva siempre queda por debajo de esa diagonal; el GINI mide el área entre ambas curvas. Según la Encuesta Nacional de Ingresos y Gastos de los Hogares (ENIGH) 2022 del INEGI, México tiene un coeficiente GINI de 0.428, lo que lo ubica entre los países con mayor desigualdad de América Latina.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "En México, el 10% más rico de los hogares concentra el 37% del ingreso total, mientras que el 10% más pobre recibe solo el 1.9% (ENIGH 2022). Esta brecha es aún más pronunciada cuando se considera la riqueza (activos, propiedades, ahorros) en lugar del ingreso: estimaciones del World Inequality Report señalan que el 1% más rico posee cerca del 43% de la riqueza nacional.",
        },
        {
          tipo: "subtitulo",
          contenido: "Causas estructurales de la desigualdad en México",
        },
        {
          tipo: "lista",
          items: [
            "Sistema fiscal regresivo: la evasión fiscal de grandes empresas y personas de alto ingreso reduce la recaudación necesaria para la redistribución.",
            "Brecha educativa: el acceso desigual a educación de calidad reproduce las posiciones de clase entre generaciones.",
            "Herencia de la estructura colonial: la concentración de tierra y capital tiene raíces en el período virreinal y las leyes de desamortización del siglo XIX.",
            "Discriminación étnica y de género: pueblos indígenas y mujeres enfrentan barreras estructurales en el mercado laboral.",
            "Informalidad laboral: más del 55% de los trabajadores mexicanos laboran en la economía informal, sin acceso a seguridad social ni salarios mínimos garantizados.",
          ],
        },
        {
          tipo: "cita",
          contenido:
            "La desigualdad no es el precio inevitable del progreso; es el resultado de decisiones políticas que pueden tomarse de otra manera.",
          fuente: "Joseph Stiglitz, economista, El precio de la desigualdad (2012)",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Gráfica de la curva de Lorenz para México comparada con la línea de igualdad perfecta y la curva de un país más igualitario (Dinamarca). El área entre la diagonal y la curva de México está sombreada, representando el coeficiente GINI.",
          caption: "Curva de Lorenz y coeficiente GINI: México vs. países con menor desigualdad.",
        },
      ],
    },
  },

  // ── 3 ──────────────────────────────────────────────────────────────────────
  {
    slug: "cs-ii-pobreza-multidimensional",
    titulo: "Pobreza multidimensional: más allá del ingreso",
    categoria: "Análisis crítico",
    conceptos_clave: ["pobreza multidimensional", "CONEVAL", "carencias sociales", "línea de bienestar", "índice de privación"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La pobreza no se reduce a no tener dinero. Esta es la premisa central del enfoque de pobreza multidimensional adoptado por México desde 2008, cuando el Consejo Nacional de Evaluación de la Política de Desarrollo Social (CONEVAL) comenzó a medir la pobreza considerando simultáneamente el ingreso y seis carencias sociales. Este enfoque, influido por el marco teórico de Amartya Sen sobre capacidades y funcionamientos, es reconocido internacionalmente como uno de los más rigurosos de América Latina.",
        },
        {
          tipo: "subtitulo",
          contenido: "Las seis carencias sociales que mide CONEVAL",
        },
        {
          tipo: "lista",
          items: [
            "Rezago educativo: no haber concluido la educación básica obligatoria según la edad.",
            "Acceso a servicios de salud: no contar con afiliación a ningún sistema de salud público o privado.",
            "Acceso a seguridad social: carecer de prestaciones laborales como IMSS, ISSSTE o sistemas equivalentes.",
            "Calidad y espacios de la vivienda: habitar en vivienda con materiales precarios en techo, piso o paredes.",
            "Acceso a servicios básicos en la vivienda: carecer de agua potable, drenaje o electricidad.",
            "Acceso a la alimentación nutritiva y de calidad: experimentar inseguridad alimentaria moderada o severa.",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "Según la medición 2022 de CONEVAL, el 36.3% de la población mexicana vive en pobreza (46.8 millones de personas) y el 7.1% en pobreza extrema (9.1 millones). Estas cifras representan una mejora respecto a 2018, pero ocultan disparidades regionales severas: en Chiapas, el 67.4% de la población es pobre; en Guerrero, el 65.4%. Las comunidades indígenas presentan tasas de pobreza extrema superiores al 30% en muchas regiones.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "México es pionero mundial en la medición oficial de la pobreza multidimensional. El Índice de Pobreza Multidimensional global del PNUD y la Oxford Poverty & Human Development Initiative (OPHI) toma elementos del enfoque mexicano. Sin embargo, CONEVAL sigue siendo más exigente que el índice global al incluir la seguridad social como dimensión propia.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La Reforma Constitucional de 2023 elevó al CONEVAL a rango constitucional, garantizando su autonomía técnica. Esto es relevante porque la medición de la pobreza tiene consecuencias políticas directas: determina dónde se focalizan los programas sociales, qué presupuesto reciben y cómo se evalúa al gobierno.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de Venn con dos esferas superpuestas: una representa la dimensión de ingreso (línea de bienestar mínimo y línea de bienestar) y otra las seis carencias sociales. Las personas en la intersección son pobres multidimensionales.",
          caption: "Metodología de medición de la pobreza multidimensional del CONEVAL.",
        },
      ],
    },
  },

  // ── 4 ──────────────────────────────────────────────────────────────────────
  {
    slug: "cs-ii-organizacion-social-familia",
    titulo: "Organización social: familia y comunidad en México",
    categoria: "Sociología",
    conceptos_clave: ["familia", "comunidad", "organización social", "tequio", "redes de solidaridad", "parentesco"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La organización social es el conjunto de formas en que los seres humanos estructuran sus relaciones colectivas para satisfacer necesidades comunes, distribuir recursos, transmitir cultura y mantener la cohesión del grupo. La familia y la comunidad son las unidades básicas de organización social en todas las sociedades conocidas, aunque sus formas varían enormemente según el contexto histórico, cultural y económico.",
        },
        {
          tipo: "subtitulo",
          contenido: "La familia mexicana: diversidad de formas",
        },
        {
          tipo: "parrafo",
          contenido:
            "En México coexisten múltiples formas familiares. La familia nuclear (padres e hijos) es la más común en zonas urbanas, pero la familia extensa (con abuelos, tíos, primos conviviendo) sigue siendo prevalente en comunidades rurales e indígenas, donde cumple funciones económicas vitales: distribución del trabajo agrícola, cuidado colectivo de niños y ancianos, y acceso a tierra mediante herencia. Según el Censo de Población 2020 del INEGI, el 66% de los hogares mexicanos son nucleares, el 24.5% son extensos y el 8.7% son unipersonales; este último tipo ha crecido notablemente en las grandes ciudades.",
        },
        {
          tipo: "subtitulo",
          contenido: "El tequio y las formas comunitarias de organización",
        },
        {
          tipo: "parrafo",
          contenido:
            "En muchas comunidades indígenas y campesinas de México persisten formas de organización colectiva precoloniales. El tequio es el trabajo comunitario no remunerado que cada integrante de una comunidad aporta para obras de beneficio colectivo (construcción de caminos, escuelas, sistemas de agua). En Oaxaca, el tequio tiene reconocimiento legal en la Constitución del estado desde 1998. La gozona o mano vuelta es otro mecanismo: intercambio recíproco de trabajo entre familias durante momentos de mayor demanda agrícola.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "El antropólogo mexicano Guillermo Bonfil Batalla describió en México Profundo (1987) cómo las formas de organización comunitaria indígena representan una civilización alternativa al modelo occidental. Para Bonfil Batalla, el 'México profundo' —compuesto por comunidades indígenas y campesinas que practican formas de vida mesoamericanas— coexiste en tensión con el 'México imaginario' de las élites occidentalizadas.",
        },
        {
          tipo: "cita",
          contenido:
            "La comunidad es el espacio donde la vida social adquiere sentido, donde se reproduce la cultura y se construyen las identidades colectivas.",
          fuente: "Guillermo Bonfil Batalla, México Profundo (1987)",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Fotografía ilustrativa de una faena comunitaria en un pueblo oaxaqueño, donde vecinos de todas las edades trabajan juntos en la construcción de un camino. Al lado, diagrama de los vínculos de parentesco en una familia extensa.",
          caption: "El tequio como expresión de la solidaridad comunitaria en México.",
        },
      ],
    },
  },

  // ── 5 ──────────────────────────────────────────────────────────────────────
  {
    slug: "cs-ii-movimientos-sociales-teoria",
    titulo: "Movimientos sociales: teoría y acción colectiva",
    categoria: "Sociología",
    conceptos_clave: ["movimiento social", "acción colectiva", "repertorio de contención", "estructura de oportunidades", "identidad colectiva"],
    tiempo_lectura_minutos: 8,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Un movimiento social es una forma de acción colectiva sostenida, protagonizada por actores que comparten una identidad y una demanda frente a un adversario, generalmente el Estado o una institución de poder. A diferencia de las organizaciones formales (partidos, sindicatos), los movimientos sociales son relativamente informales, fluidos y se mantienen unificados por la solidaridad y un proyecto de transformación social. Estudiar los movimientos sociales es comprender cómo las sociedades se transforman desde abajo.",
        },
        {
          tipo: "subtitulo",
          contenido: "Principales teorías",
        },
        {
          tipo: "lista",
          items: [
            "Teoría de la movilización de recursos (McCarthy y Zald, 1977): los movimientos emergen cuando los actores tienen suficientes recursos materiales y organizativos para actuar. La indignación sola no basta; se requieren líderes, financiamiento y redes.",
            "Teoría del proceso político (McAdam, 1982): la emergencia de los movimientos depende de la 'estructura de oportunidades políticas': grietas en el sistema político, aliados influyentes y desalineación de las élites.",
            "Teoría de los nuevos movimientos sociales (Touraine, Melucci): los movimientos posmodernos luchan menos por recursos materiales que por reconocimiento identitario (movimiento feminista, LGBTQ+, indígena, ecologista).",
            "Repertorios de contención (Tilly): cada época histórica tiene formas específicas de protesta: huelgas, marchas, tomas, peticiones. Estos repertorios se aprenden y se transmiten culturalmente.",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "En México, los movimientos sociales han sido protagonistas centrales de la historia reciente. El movimiento estudiantil del 68, el Ejército Zapatista de Liberación Nacional (EZLN) en 1994, el movimiento por los 43 normalistas de Ayotzinapa en 2014 y la marea verde del movimiento feminista a partir de 2016 ilustran la diversidad de formas de acción colectiva y las transformaciones que pueden provocar.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El sociólogo francés Alain Touraine argumenta que el conflicto central de las sociedades contemporáneas ya no es solo el conflicto de clase (burguesía vs. proletariado), sino la lucha por el control de la historicidad: la capacidad de definir los modelos culturales que orientan la vida social. Los nuevos movimientos sociales —feminismo, ecologismo, pueblos indígenas— luchan precisamente por este control cultural.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Línea de tiempo horizontal con los principales movimientos sociales mexicanos del siglo XX y XXI: huelga general de 1916, movimiento ferrocarrilero 1958, Tlatelolco 1968, EZLN 1994, Ayotzinapa 2014, marea verde feminista 2016-presente.",
          caption: "Principales movimientos sociales en la historia reciente de México.",
        },
      ],
    },
  },

  // ── 6 ──────────────────────────────────────────────────────────────────────
  {
    slug: "cs-ii-sociedad-civil-ong",
    titulo: "Sociedad civil y organizaciones no gubernamentales",
    categoria: "Sociología",
    conceptos_clave: ["sociedad civil", "ONG", "tercer sector", "participación ciudadana", "gobernanza"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La sociedad civil es el conjunto de organizaciones, asociaciones y redes que los ciudadanos forman voluntariamente, al margen del Estado y del mercado, para atender necesidades colectivas, defender derechos o influir en las políticas públicas. Incluye organizaciones no gubernamentales (ONG), asociaciones civiles, colectivos culturales, cooperativas, centros de investigación independientes y grupos comunitarios. El politólogo italiano Antonio Gramsci fue uno de los primeros en teorizar la importancia de la sociedad civil como arena de disputa cultural y política.",
        },
        {
          tipo: "subtitulo",
          contenido: "Las ONG en México",
        },
        {
          tipo: "parrafo",
          contenido:
            "México tiene un sector de organizaciones de la sociedad civil relativamente desarrollado. Según datos del INEGI, en 2020 existían aproximadamente 40,000 organizaciones formalmente registradas, aunque el número real (incluyendo organizaciones informales) es mucho mayor. Sus ámbitos de acción son amplísimos: derechos humanos, medio ambiente, salud comunitaria, educación popular, atención a víctimas de violencia, defensa de pueblos indígenas, transparencia y anticorrupción.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La relación entre sociedad civil y Estado en México ha sido históricamente tensa. El sistema político priísta (1929-2000) cooptó a muchas organizaciones a través del corporativismo: las incorporó al partido hegemónico a cambio de recursos y representación. Con la transición democrática, esta relación se transformó, aunque persisten tensiones sobre la autonomía de las OSC y su financiamiento externo.",
        },
        {
          tipo: "subtitulo",
          contenido: "Debates actuales",
        },
        {
          tipo: "lista",
          items: [
            "¿Quién financia a las ONG y cómo afecta eso su autonomía? Las organizaciones que dependen de financiamiento gubernamental o de fundaciones corporativas pueden perder independencia crítica.",
            "¿Representan realmente a los sectores vulnerables o son intermediarias que los sustituyen sin rendirles cuentas?",
            "En contextos de violencia como el mexicano, los defensores de derechos humanos son frecuentemente amenazados: México es uno de los países más peligrosos para activistas sociales según Global Witness.",
            "Las redes sociales han creado nuevas formas de organización civil horizontal (#MeToo, #FueElEstado) que cuestionan los modelos tradicionales de las ONG.",
          ],
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de tres esferas: Estado (azul), Mercado (amarillo) y Sociedad Civil (verde), con la zona de intersección entre sociedad civil y Estado donde se ubican las políticas públicas participativas, y la zona entre sociedad civil y mercado donde aparecen las empresas sociales.",
          caption: "La sociedad civil como tercer sector entre Estado y mercado.",
        },
      ],
    },
  },

  // ── 7 ──────────────────────────────────────────────────────────────────────
  {
    slug: "cs-ii-democracia-ciudadania",
    titulo: "Democracia y ciudadanía activa",
    categoria: "Sociología",
    conceptos_clave: ["democracia", "ciudadanía", "derechos políticos", "participación", "deliberación", "republicanismo"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La democracia es el sistema político en el que el poder emana del pueblo y se ejerce a través de representantes elegidos libremente o mediante mecanismos de participación directa. La palabra viene del griego demos (pueblo) y kratos (poder). Sin embargo, la democracia no es solo un sistema de gobierno: es también una cultura política y una forma de vida que requiere ciudadanos activos, informados y comprometidos con el bien común.",
        },
        {
          tipo: "subtitulo",
          contenido: "Tipos de democracia",
        },
        {
          tipo: "lista",
          items: [
            "Democracia representativa o indirecta: los ciudadanos eligen representantes que toman las decisiones en su nombre. Es el modelo dominante en el mundo moderno.",
            "Democracia directa: los ciudadanos deciden directamente sobre las leyes y políticas. Es rara a gran escala, aunque existen mecanismos como el referéndum y la consulta popular.",
            "Democracia participativa: combina la representación con mecanismos de participación ciudadana como presupuestos participativos, asambleas ciudadanas y audiencias públicas.",
            "Democracia deliberativa (Habermas): el énfasis está en la calidad del debate público: las decisiones colectivas deben surgir de un diálogo racional, informado e incluyente.",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "En México, la transición democrática formal se consolidó con la alternancia en la presidencia en el año 2000, cuando el PAN ganó las elecciones por primera vez en más de 70 años de hegemonía del PRI. Sin embargo, la democracia electoral no garantiza automáticamente la democracia social: persisten desigualdades en el acceso a la representación política, la captura de instituciones por grupos de poder, la violencia contra candidatos y la compra de votos.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Según el Índice de Democracia 2023 de The Economist Intelligence Unit, México es clasificado como 'democracia deficiente' con un puntaje de 5.12 sobre 10. Los principales déficits identificados son: debilidad del Estado de derecho, violencia política, bajo funcionamiento del gobierno y cultura política poco democrática. El país ocupa el puesto 86 de 167 evaluados.",
        },
        {
          tipo: "cita",
          contenido:
            "La democracia no es solo el gobierno de la mayoría: es también la protección de las minorías. Sin Estado de derecho, la democracia se convierte en tiranía de las mayorías.",
          fuente: "Alexis de Tocqueville, La democracia en América (1835)",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Infografía con los mecanismos de participación ciudadana en México garantizados por la Constitución: voto activo y pasivo, referéndum, consulta popular, iniciativa ciudadana, revocación de mandato y presupuesto participativo.",
          caption: "Mecanismos de participación ciudadana en el sistema democrático mexicano.",
        },
      ],
    },
  },

  // ── 8 ──────────────────────────────────────────────────────────────────────
  {
    slug: "cs-ii-sistema-economico-capitalista",
    titulo: "El sistema económico capitalista: fundamentos y críticas",
    categoria: "Economía",
    conceptos_clave: ["capitalismo", "mercado", "plusvalía", "propiedad privada", "acumulación", "contradicciones"],
    tiempo_lectura_minutos: 8,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El capitalismo es el sistema económico dominante en el mundo contemporáneo. Se basa en la propiedad privada de los medios de producción (fábricas, tierras, capital financiero), la organización de la producción mediante el trabajo asalariado, la coordinación de la economía a través del mercado y la búsqueda de ganancia como motor de la actividad económica. Surgió históricamente entre los siglos XVI y XIX en Europa occidental, se expandió globalmente a través del colonialismo y hoy no tiene un competidor sistémico de escala comparable.",
        },
        {
          tipo: "subtitulo",
          contenido: "Elementos básicos del sistema capitalista",
        },
        {
          tipo: "lista",
          items: [
            "Propiedad privada: individuos y corporaciones pueden poseer medios de producción y obtener renta, interés y ganancia.",
            "Mercado: mecanismo de coordinación basado en la oferta y la demanda que determina precios, asignación de recursos y distribución del ingreso.",
            "Trabajo asalariado: quienes no poseen medios de producción venden su fuerza de trabajo a cambio de un salario.",
            "Acumulación de capital: la ganancia se reinvierte para generar más ganancia, expandiendo continuamente la producción.",
            "Competencia: las empresas compiten por cuotas de mercado, lo que teóricamente incentiva la innovación y la eficiencia.",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "Para Karl Marx, el capitalismo produce riqueza de manera extraordinaria pero también genera inevitablemente explotación y contradicciones. La teoría del valor-trabajo sostiene que el valor de las mercancías proviene del trabajo humano incorporado en ellas. La plusvalía es el trabajo no pagado que el capitalista se apropia: el obrero trabaja más horas de las que necesita para reproducir su propio salario, y ese excedente es la fuente de la ganancia. Max Weber, desde otra perspectiva, vinculó el capitalismo moderno con la ética protestante: la idea calvinista de que el éxito material es signo de predestinación divina habría creado la actitud psicológica necesaria para la acumulación racional.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "En México, el capitalismo tiene características propias: fuerte presencia del Estado como propietario (PEMEX, CFE), economía informal extensa, mercado laboral segmentado, élites empresariales con poder político directo y dependencia histórica del capital extranjero. Los economistas heterodoxos hablan de 'capitalismo dependiente' o 'capitalismo periférico' para describir la inserción subordinada de México en la economía global.",
        },
        {
          tipo: "cita",
          contenido:
            "El capital es trabajo muerto, que como un vampiro, solo se vivifica chupando trabajo vivo, y se vivifica más cuanto más trabajo vivo chupa.",
          fuente: "Karl Marx, El Capital, Tomo I (1867)",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama circular del flujo económico capitalista: capitalistas invierten capital → contratan trabajadores → trabajadores producen mercancías → mercancías se venden en el mercado → ganancias regresan a los capitalistas como nuevo capital para reinvertir. Los trabajadores solo reciben salario.",
          caption: "Flujo circular de la economía capitalista según la economía política clásica.",
        },
      ],
    },
  },

  // ── 9 ──────────────────────────────────────────────────────────────────────
  {
    slug: "cs-ii-economia-informal-mexico",
    titulo: "Economía informal en México: causas, magnitud y consecuencias",
    categoria: "Economía",
    conceptos_clave: ["informalidad laboral", "sector informal", "ETOE", "seguridad social", "precariedad", "ENOE"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La economía informal es el conjunto de actividades económicas que se realizan al margen de la regulación estatal: sin registro fiscal, sin contratos laborales formales y sin acceso a la seguridad social. En México es un fenómeno estructural de enorme magnitud: según la Encuesta Nacional de Ocupación y Empleo (ENOE) del INEGI para el primer trimestre de 2024, el 55.2% de la población ocupada trabaja en condiciones de informalidad laboral, lo que equivale a más de 32 millones de personas.",
        },
        {
          tipo: "subtitulo",
          contenido: "¿Qué es la informalidad? Distintas perspectivas",
        },
        {
          tipo: "parrafo",
          contenido:
            "El enfoque neoclásico ve la informalidad como resultado de regulaciones laborales excesivas que encarecen la formalización: si el costo de cumplir con las leyes es muy alto, los empleadores prefieren operar en la informalidad. El enfoque estructuralista, más común en México y América Latina, plantea que la informalidad es consecuencia del modelo de desarrollo: cuando la economía formal no genera suficientes empleos bien remunerados, millones de personas crean sus propias formas de subsistencia, desde el comercio ambulante hasta los servicios domésticos no registrados.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La informalidad tiene consecuencias graves. Los trabajadores informales no cotizan al IMSS ni al ISSSTE, por lo que no tienen acceso a atención médica, guarderías, pensión de retiro, crédito para vivienda (INFONAVIT) ni indemnización por despido. Esto los hace extremadamente vulnerables ante enfermedades, accidentes o vejez. La CEPAL estima que la informalidad es uno de los principales mecanismos de reproducción intergeneracional de la pobreza en América Latina.",
        },
        {
          tipo: "lista",
          items: [
            "Sectores con mayor informalidad en México: agricultura (95%), construcción (74%), comercio al por menor (69%), servicios domésticos (98%).",
            "Grupos más afectados: mujeres, jóvenes, adultos mayores, personas sin estudios completos y comunidades indígenas.",
            "Impacto fiscal: la informalidad reduce la base tributaria, limitando la capacidad del Estado para financiar servicios públicos.",
            "Paradoja de la informalidad: muchas empresas formales subcontratan informalmente para reducir costos laborales, creando una zona gris entre los sectores.",
          ],
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Mapa de México con los estados coloreados según su tasa de informalidad laboral (ENOE 2023). Los estados del sur como Chiapas (80%), Oaxaca (79%) y Guerrero (76%) aparecen en rojo oscuro; los estados del norte como Nuevo León (31%) y Baja California (35%) aparecen en verde claro.",
          caption: "Distribución geográfica de la informalidad laboral por estado (INEGI-ENOE, 2023).",
        },
      ],
    },
  },

  // ── 10 ─────────────────────────────────────────────────────────────────────
  {
    slug: "cs-ii-globalizacion-comercio",
    titulo: "Globalización y comercio internacional: México en el mundo",
    categoria: "Economía",
    conceptos_clave: ["globalización", "TLCAN", "T-MEC", "maquiladoras", "cadenas globales de valor", "dependencia"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La globalización es el proceso histórico de intensificación de las interconexiones económicas, culturales, políticas y tecnológicas entre distintas regiones del mundo. En su dimensión económica, implica la expansión del comercio internacional, la movilidad del capital financiero, la deslocalización de la producción y la integración de mercados laborales a escala global. México es un actor relevante en este proceso: es la decimocuarta economía del mundo por PIB nominal y uno de los países con mayor apertura comercial.",
        },
        {
          tipo: "subtitulo",
          contenido: "El TLCAN y el T-MEC: México en América del Norte",
        },
        {
          tipo: "parrafo",
          contenido:
            "El Tratado de Libre Comercio de América del Norte (TLCAN), vigente desde 1994, fue la apuesta de México por insertarse en la economía global a través de la integración con Estados Unidos y Canadá. Eliminó aranceles, abrió mercados agrícolas e industriales y atrajo inversión extranjera directa, especialmente en el sector manufacturero. En 2020 entró en vigor el T-MEC (Tratado entre México, Estados Unidos y Canadá), con reglas más estrictas en materia laboral, propiedad intelectual y contenido regional en la industria automotriz.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El TLCAN tuvo efectos ambivalentes para México. Por un lado, las exportaciones manufactureras crecieron enormemente: México pasó de exportar 60 mil millones de dólares en 1993 a más de 600 mil millones en 2023. Por otro lado, el campo mexicano fue devastado por la competencia del maíz subsidiado de Estados Unidos, expulsando millones de campesinos hacia las ciudades o hacia la migración. El sociólogo Alejandro Portes habla de 'integración asimétrica': México se integró al mercado norteamericano pero desde una posición subordinada.",
        },
        {
          tipo: "lista",
          items: [
            "México es el principal socio comercial de Estados Unidos desde 2023, superando a China y Canadá.",
            "El 80% de las exportaciones mexicanas van a Estados Unidos, lo que crea una dependencia estructural.",
            "El fenómeno del nearshoring (relocalización de empresas de Asia a México para estar cerca de EE.UU.) ha acelerado la inversión extranjera directa desde 2022.",
            "Las remesas enviadas por migrantes mexicanos en EE.UU. superaron en 2023 los 63 mil millones de dólares, siendo la segunda fuente de divisas después de las exportaciones manufactureras.",
          ],
        },
        {
          tipo: "cita",
          contenido:
            "La globalización tal como se ha dado no es neutral: beneficia a quienes tienen capital y perjudica a quienes solo tienen su fuerza de trabajo.",
          fuente: "Enrique Dussel Peters, economista mexicano, especialista en comercio internacional",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de flujos comerciales: flechas de distintos grosores muestran el volumen de exportaciones e importaciones de México hacia EE.UU., Europa y Asia. El flujo hacia EE.UU. es claramente dominante.",
          caption: "Estructura del comercio exterior mexicano y su concentración con EE.UU.",
        },
      ],
    },
  },

  // ── 11 ─────────────────────────────────────────────────────────────────────
  {
    slug: "cs-ii-interseccionalidad",
    titulo: "Interseccionalidad: clase, género y etnia como ejes de desigualdad",
    categoria: "Análisis crítico",
    conceptos_clave: ["interseccionalidad", "clase social", "género", "etnia", "discriminación múltiple", "Kimberlé Crenshaw"],
    tiempo_lectura_minutos: 8,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La interseccionalidad es un concepto desarrollado por la jurista y teórica afroamericana Kimberlé Crenshaw en 1989 para describir cómo las distintas formas de opresión social (racismo, sexismo, clasismo, discriminación por edad o capacidades) no operan de forma independiente sino que se superponen y se refuerzan mutuamente, creando experiencias específicas de discriminación que no pueden reducirse a una sola dimensión. Una mujer indígena pobre en México, por ejemplo, enfrenta una vulnerabilidad que no es simplemente la suma del sexismo, el racismo y la pobreza, sino algo cualitativamente diferente.",
        },
        {
          tipo: "subtitulo",
          contenido: "Clase, género y etnia en México",
        },
        {
          tipo: "parrafo",
          contenido:
            "En México, la clase social, el género y la pertenencia étnica son los tres ejes de desigualdad más estudiados. La clase social determina el acceso a recursos materiales, educación y redes de poder. El género estructura las oportunidades diferenciadas entre hombres y mujeres en el mercado laboral, la política y el hogar. La etnia —y en particular la pertenencia a comunidades indígenas o afromexicanas— se asocia con discriminación, exclusión del sistema educativo de calidad y sobrerepresentación en situaciones de pobreza extrema.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Datos del INEGI (ENIF 2023): las mujeres indígenas tienen una tasa de desempleo 40% más alta que la media nacional. El 71.9% de la población indígena en México vive en pobreza, frente al 36.3% de la población general (CONEVAL 2022). Las mujeres indígenas tienen mayor prevalencia de violencia doméstica, menor acceso a servicios de salud reproductiva y una participación política casi inexistente en ámbitos federales, pese a las reformas de paridad de género.",
        },
        {
          tipo: "parrafo",
          contenido:
            "El sociólogo francés Pierre Bourdieu aporta otro elemento al análisis interseccional: el capital social, cultural y simbólico. Más allá de la clase económica, las personas ocupan posiciones en campos sociales según el capital cultural que poseen (títulos, conocimientos, disposiciones) y el capital social (redes de relaciones). La combinación de una posición de clase baja, identidad de género femenina, pertenencia étnica indígena y escaso capital cultural crea las condiciones para las formas más profundas de exclusión social.",
        },
        {
          tipo: "cita",
          contenido:
            "Cuando los sistemas de raza, género y clase se intersectan, los efectos sobre las personas ubicadas en múltiples categorías de opresión son cualitativamente distintos y no simplemente aditivos.",
          fuente: "Kimberlé Crenshaw, Mapping the Margins (1991)",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de tres esferas que se superponen representando clase social (azul), género (rojo) y etnia (verde). En las intersecciones se indican las formas específicas de discriminación: en el centro, donde se superponen las tres, se indica la máxima vulnerabilidad.",
          caption: "El modelo interseccional: cómo se superponen clase, género y etnia.",
        },
      ],
    },
  },

  // ── 12 ─────────────────────────────────────────────────────────────────────
  {
    slug: "cs-ii-racismo-estructural-indigenas",
    titulo: "Racismo estructural y pueblos indígenas en México",
    categoria: "Análisis crítico",
    conceptos_clave: ["racismo estructural", "pueblos indígenas", "discriminación racial", "colonialidad", "autonomía indígena", "CNDH"],
    tiempo_lectura_minutos: 8,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El racismo estructural es una forma de discriminación que no reside solo en las actitudes individuales de personas racistas, sino en las instituciones, las leyes, las normas culturales y los procesos históricos que sistemáticamente colocan a ciertos grupos racializados en posiciones de desventaja. En México, el racismo estructural tiene raíces directas en el sistema colonial español, que estableció una jerarquía racial explícita (el sistema de castas) que fue abolida formalmente en la independencia pero persistió y persiste en las estructuras sociales, económicas y culturales.",
        },
        {
          tipo: "subtitulo",
          contenido: "Los pueblos indígenas de México hoy",
        },
        {
          tipo: "parrafo",
          contenido:
            "México reconoce constitucionalmente su composición pluricultural, sustentada originalmente en sus pueblos indígenas. El Censo 2020 del INEGI reporta que el 19.4% de la población mexicana (23.2 millones de personas) se identifica como indígena, y que 7.4 millones hablan alguna lengua indígena. Existen 68 grupos etnolingüísticos reconocidos, siendo el náhuatl, el maya y el mixteco los de mayor número de hablantes. Sin embargo, este reconocimiento constitucional convive con una realidad de exclusión sistemática.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La Encuesta Nacional sobre Discriminación (ENADIS 2022) del INEGI revela que el 22.5% de los indígenas declaró haber sido discriminado por su origen étnico en los últimos doce meses. Las principales esferas de discriminación son: servicios de salud, educación, trabajo y espacios públicos. Según la misma encuesta, las personas indígenas son el grupo más discriminado de México, por encima de personas LGBTQ+, mujeres y personas con discapacidad.",
        },
        {
          tipo: "parrafo",
          contenido:
            "El filósofo peruano Aníbal Quijano desarrolló el concepto de 'colonialidad del poder' para describir cómo las estructuras de dominio colonial no desaparecieron con la independencia política, sino que se reprodujeron en las repúblicas latinoamericanas bajo nuevas formas. El 'patrón colonial del poder' implica la clasificación racial de la población, la articulación de todas las formas de trabajo en torno al capital y el control eurocentrado del conocimiento. Enrique Dussel complementa este análisis con su 'filosofía de la liberación', que propone pensar América Latina desde su propio horizonte, no desde los marcos europeos.",
        },
        {
          tipo: "lista",
          items: [
            "Los municipios de mayoría indígena tienen, en promedio, el doble de índice de marginación que los municipios mestizos.",
            "Solo el 3% de los senadores y diputados federales pertenecen a pueblos indígenas, pese a que representan casi el 20% de la población.",
            "Las lenguas indígenas se extinguen a un ritmo acelerado: el INALI estima que 64 de las 68 familias lingüísticas están en riesgo.",
            "El Convenio 169 de la OIT y la Declaración de Naciones Unidas sobre Derechos de los Pueblos Indígenas, ratificados por México, establecen el derecho a la consulta libre, previa e informada para proyectos en territorios indígenas, pero su cumplimiento es deficiente.",
          ],
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Mapa de México con las regiones de alta concentración de población indígena (Oaxaca, Chiapas, Veracruz, Yucatán, Guerrero, Puebla) superpuesto con el mapa de pobreza extrema del CONEVAL, mostrando la coincidencia geográfica entre indigeneidad y pobreza extrema.",
          caption: "Coincidencia geográfica entre alta población indígena y pobreza extrema (CONEVAL-INEGI, 2022).",
        },
      ],
    },
  },

  // ── 13 ─────────────────────────────────────────────────────────────────────
  {
    slug: "cs-ii-movimiento-obrero-mexico",
    titulo: "Historia del movimiento obrero en México",
    categoria: "Historia",
    conceptos_clave: ["movimiento obrero", "sindicato", "huelga", "CTM", "charrismo sindical", "derechos laborales"],
    tiempo_lectura_minutos: 8,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El movimiento obrero es el conjunto de organizaciones, luchas y tradiciones políticas protagonizadas por trabajadores asalariados para mejorar sus condiciones de trabajo, salarios y derechos frente al poder del capital y del Estado. En México, el movimiento obrero tiene una historia rica y contradictoria que va desde las primeras huelgas del siglo XIX hasta las reformas laborales del siglo XXI, pasando por décadas de corporativismo estatal que convirtieron a los sindicatos en instrumentos de control político antes que de defensa de los trabajadores.",
        },
        {
          tipo: "subtitulo",
          contenido: "Hitos del movimiento obrero mexicano",
        },
        {
          tipo: "lista",
          items: [
            "Huelga de Cananea (1906): trabajadores mineros en Sonora se levantaron contra condiciones de trabajo discriminatorias impuestas por la empresa estadounidense, que pagaba más a los trabajadores americanos. Fue uno de los precursores de la Revolución Mexicana.",
            "Huelga de Río Blanco (1907): trabajadores textiles de Veracruz protestaron contra condiciones de explotación severas. La represión del ejército porfirista dejó decenas de muertos.",
            "Artículo 123 constitucional (1917): la Constitución de 1917 fue pionera mundial al incluir derechos laborales: jornada de 8 horas, salario mínimo, derecho a huelga, protección a la maternidad y prohibición del trabajo infantil.",
            "Fundación de la CTM (1936): la Confederación de Trabajadores de México, liderada por Vicente Lombardo Toledano, se convirtió en el principal sindicato del país, aliado al PRI hasta el año 2000.",
            "Huelga ferrocarrilera (1958-1959): el movimiento independiente de Demetrio Vallejo fue aplastado militarmente; Vallejo fue encarcelado durante 11 años.",
            "Reforma Laboral (2019): la reforma laboral de AMLO reestructuró el sistema de representación sindical, implementó la democracia sindical (elección de dirigentes por voto secreto y universal) y ratificó el Convenio 98 de la OIT.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El 'charrismo sindical' es el término con que se denomina al control corporativo de los sindicatos mexicanos por líderes corruptos aliados al Estado priísta. El nombre viene del caso de Jesús Díaz de León 'El Charro', líder ferrocarrilero impuesto por el gobierno en 1948. Los sindicatos charros negociaban la paz laboral a cambio de privilegios personales para sus dirigentes, traicionando los intereses de los trabajadores.",
        },
        {
          tipo: "cita",
          contenido:
            "La emancipación de los trabajadores debe ser obra de los propios trabajadores.",
          fuente: "Karl Marx, Estatutos de la Primera Internacional (1864)",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Línea de tiempo del movimiento obrero mexicano: Cananea 1906, Río Blanco 1907, Constitución 1917, fundación CROM 1918, fundación CTM 1936, huelga ferrocarrilera 1958, huelga UNAM 1999, reforma laboral 2019.",
          caption: "Cronología del movimiento obrero mexicano (1906-2019).",
        },
      ],
    },
  },

  // ── 14 ─────────────────────────────────────────────────────────────────────
  {
    slug: "cs-ii-tlatelolco-1968",
    titulo: "Movimientos estudiantiles: 1968 y la Masacre de Tlatelolco",
    categoria: "Historia",
    conceptos_clave: ["1968", "Tlatelolco", "movimiento estudiantil", "2 de octubre", "autoritarismo", "memoria histórica"],
    tiempo_lectura_minutos: 8,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El año 1968 fue extraordinario en la historia mundial: en Francia, Alemania, Estados Unidos, Checoslovaquia y México, millones de jóvenes se levantaron contra el autoritarismo, la guerra de Vietnam, el conservadurismo cultural y la desigualdad social. En México, el movimiento estudiantil de 1968 alcanzó su punto culminante y más trágico el 2 de octubre, cuando el ejército y el cuerpo paramilitar conocido como Batallón Olimpia masacraron a estudiantes reunidos en la Plaza de las Tres Culturas de Tlatelolco, Ciudad de México, días antes de la inauguración de los Juegos Olímpicos.",
        },
        {
          tipo: "subtitulo",
          contenido: "El movimiento estudiantil: contexto y demandas",
        },
        {
          tipo: "parrafo",
          contenido:
            "El movimiento de 1968 en México no fue espontáneo: respondía a tensiones acumuladas durante décadas de régimen priísta. El Consejo Nacional de Huelga (CNH), integrado por estudiantes de la UNAM, el IPN y otras instituciones, articuló demandas concretas: liberación de presos políticos, derogación del delito de disolución social, diálogo público con el gobierno, desaparición del cuerpo de granaderos y destitución del jefe de la policía. Estas demandas reflejaban la aspiración de apertura democrática de una generación que creció bajo un partido hegemónico que no toleraba la disidencia.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El número exacto de muertos en Tlatelolco el 2 de octubre de 1968 sigue siendo disputado. El gobierno de Díaz Ordaz reconoció 20 muertos; investigaciones posteriores del periodista Julio Scherer y del historiador Sergio Aguayo, con documentos desclasificados de la CIA y el Departamento de Estado de EE.UU., apuntan a entre 30 y 300 muertos. La masacre fue encubierta: los cuerpos fueron trasladados de madrugada y la prensa fue censurada. Elena Poniatowska documentó el movimiento en La noche de Tlatelolco (1971), obra fundamental de la crónica mexicana.",
        },
        {
          tipo: "subtitulo",
          contenido: "Legado e impacto histórico",
        },
        {
          tipo: "parrafo",
          contenido:
            "La masacre de Tlatelolco marcó a toda una generación y sembró las semillas de la democratización mexicana. Muchos de los integrantes del movimiento del 68 se convirtieron en las décadas siguientes en periodistas críticos, académicos, activistas de derechos humanos y políticos de oposición que construyeron la sociedad civil mexicana moderna. El 2 de octubre se convirtió en fecha simbólica: cada año, miles de personas marchan desde Tlatelolco hasta el Zócalo para exigir que los crímenes de Estado no se olviden y para demandar justicia para las víctimas, cuyos casos siguen sin resolución judicial plena.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "La escritora mexicana Elena Poniatowska reconstruyó el movimiento del 68 con una técnica innovadora: La noche de Tlatelolco (1971) es una obra de periodismo narrativo que yuxtapone testimonios directos de estudiantes, madres de familia, soldados y funcionarios para crear un mosaico polifónico de voces. El libro fue prohibido durante años y hoy es considerado una obra maestra de la literatura de no ficción en lengua española.",
        },
        {
          tipo: "cita",
          contenido:
            "2 de octubre no se olvida. El movimiento estudiantil de 1968 mostró que la sociedad mexicana era capaz de decirle no al autoritarismo, aunque el costo fuera la muerte.",
          fuente: "Consigna del movimiento estudiantil mexicano, vigente desde 1968",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Fotografía en blanco y negro de la Plaza de las Tres Culturas el 2 de octubre de 1968, con cientos de estudiantes reunidos. Junto a la imagen, mapa de Ciudad de México señalando el barrio de Tlatelolco y la línea de la marcha conmemorativa anual hasta el Zócalo.",
          caption: "La Plaza de las Tres Culturas, sitio de la masacre del 2 de octubre de 1968.",
        },
      ],
    },
  },
] as const;

// ---------------------------------------------------------------------------
// FUNCIÓN PRINCIPAL
// ---------------------------------------------------------------------------

export async function seedBibliotecaCSII(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed Biblioteca CS-II (14 fichas)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac")
    .select("id")
    .eq("codigo", "CS-II")
    .single();

  if (uacErr || !uacRow) {
    throw new Error(
      `UAC CS-II no encontrada. Ejecuta primero seed-mccems.ts. Error: ${uacErr?.message}`
    );
  }

  const rows = FICHAS_CSII.map((f, i) => ({
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

  if (error) throw new Error(`Error seeding fichas CS-II: ${error.message}`);

  console.log(`  ✓ ${rows.length} fichas de biblioteca de CS-II insertadas/actualizadas.`);
  console.log("\n✅ Seed Biblioteca CS-II completado.\n");
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
  seedBibliotecaCSII(sb).catch((err) => {
    console.error("❌ Error:", err.message);
    process.exit(1);
  });
}
