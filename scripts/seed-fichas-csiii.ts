/**
 * Seed de fichas de biblioteca para CS-III (Ciencias Sociales III). 13 fichas temáticas alineadas al MCCEMS 2025, Semestre 4.
 *
 * Meta educativa: Analice su papel como sujeto joven en contextos de crisis y conflictividad social,
 * comprendiendo las políticas públicas, los actores sociales y las formas de participación juvenil
 * como herramientas de transformación.
 *
 * Uso: npx tsx scripts/seed-fichas-csiii.ts
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

const FICHAS_CSIII = [
  // ── 1 ──────────────────────────────────────────────────────────────────────
  {
    slug: "cs-iii-pobreza-mexico-coneval",
    titulo: "Pobreza en México: medición multidimensional y CONEVAL",
    categoria: "Desigualdad social",
    conceptos_clave: ["pobreza", "CONEVAL", "medición multidimensional", "carencias sociales", "bienestar"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El Consejo Nacional de Evaluación de la Política de Desarrollo Social (CONEVAL) es el organismo autónomo mexicano encargado de medir oficialmente la pobreza y evaluar los programas sociales. Su metodología, adoptada desde 2008, combina dos dimensiones: el ingreso del hogar y la presencia de carencias sociales. Una persona es considerada pobre multidimensional cuando su ingreso es insuficiente para cubrir sus necesidades básicas y al mismo tiempo presenta al menos una carencia social. Esta definición reconoce que la pobreza no se reduce al dinero.",
        },
        {
          tipo: "subtitulo",
          contenido: "Las 8 carencias sociales medidas por CONEVAL",
        },
        {
          tipo: "lista",
          items: [
            "Rezago educativo: no haber completado la educación básica obligatoria según la edad.",
            "Acceso a servicios de salud: no contar con afiliación a ningún sistema de salud público o privado.",
            "Acceso a seguridad social: carecer de prestaciones como IMSS, ISSSTE o sistemas equivalentes.",
            "Calidad y espacios de la vivienda: habitarla con materiales precarios en techo, piso o paredes.",
            "Acceso a servicios básicos en la vivienda: carecer de agua potable, drenaje o electricidad.",
            "Acceso a la alimentación nutritiva y de calidad: experimentar inseguridad alimentaria moderada o severa.",
            "Acceso a la seguridad social: protección ante desempleo, vejez, invalidez o riesgos laborales.",
            "Calidad del entorno: exposición a contaminación, hacinamiento o ausencia de espacios de recreación.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Según la medición CONEVAL 2022, el 36.3% de la población mexicana vive en pobreza (46.8 millones de personas) y el 7.1% en pobreza extrema (9.1 millones). Estas cifras muestran una mejora respecto a 2018 (41.9%), pero ocultan disparidades regionales severas: Chiapas (67.4%), Guerrero (65.4%) y Oaxaca (61.1%) presentan tasas muy por encima del promedio nacional. Las comunidades indígenas tienen tasas de pobreza extrema superiores al 30%.",
        },
        {
          tipo: "cita",
          contenido:
            "La pobreza no es solo falta de dinero; es la privación de las capacidades fundamentales que permiten a las personas llevar vidas que tienen razón de valorar.",
          fuente: "Amartya Sen, Desarrollo y Libertad (1999)",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama del método de medición multidimensional de CONEVAL: dos ejes —ingreso (horizontal) y carencias sociales (vertical)— dividen la población en cuatro cuadrantes: pobres multidimensionales, pobres por ingreso, pobres por carencias y vulnerables.",
          caption: "Metodología de medición de la pobreza multidimensional (CONEVAL, 2022).",
        },
      ],
    },
  },

  // ── 2 ──────────────────────────────────────────────────────────────────────
  {
    slug: "cs-iii-desigualdad-inegi-datos",
    titulo: "Desigualdad en México: qué nos dicen los datos del INEGI",
    categoria: "Desigualdad social",
    conceptos_clave: ["desigualdad", "INEGI", "ENIGH", "coeficiente GINI", "distribución del ingreso", "brechas regionales"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El Instituto Nacional de Estadística y Geografía (INEGI) produce las principales fuentes de datos sobre la distribución del ingreso y las condiciones de vida de los hogares mexicanos. La Encuesta Nacional de Ingresos y Gastos de los Hogares (ENIGH), levantada cada dos años, es el instrumento más completo para analizar la desigualdad económica. Sus datos permiten calcular el coeficiente GINI, construir deciles de ingreso y comparar las condiciones de vida entre regiones, géneros, edades y grupos étnicos.",
        },
        {
          tipo: "subtitulo",
          contenido: "Hallazgos clave de la ENIGH 2022",
        },
        {
          tipo: "lista",
          items: [
            "Coeficiente GINI de 0.428: México sigue entre los países con mayor desigualdad de América Latina.",
            "El 10% más rico concentra el 37% del ingreso total, mientras el 10% más pobre recibe solo el 1.9%.",
            "El ingreso promedio del decil más alto es 19 veces mayor que el del decil más bajo.",
            "La brecha Norte-Sur es estructural: el PIB per cápita de Nuevo León triplica al de Chiapas.",
            "Las mujeres ganan en promedio un 16% menos que los hombres con el mismo nivel educativo.",
            "Las remesas de migrantes representan más del 40% del ingreso de los hogares más pobres en estados como Michoacán, Guerrero y Oaxaca.",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "La desigualdad en México tiene una dimensión histórica que los datos actuales reflejan pero no explican por sí solos. Las desigualdades regionales entre el norte y el sur del país no son accidentales: son el resultado de siglos de diferencias en el acceso a la tierra, la educación, la infraestructura y la inversión pública. La Revolución Mexicana (1910-1917) intentó redistribuir la tierra mediante el ejido, pero la reforma agraria fue incompleta y la posterior contrarreforma neoliberal del artículo 27 constitucional en 1992 abrió la puerta a la privatización de tierras ejidales.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "México invierte menos en política social redistributiva que la mayoría de los países de la OCDE. Mientras el promedio de la OCDE destina el 20% del PIB al gasto social, México invierte cerca del 7.5%. Además, el sistema fiscal mexicano es uno de los menos progresivos de la OCDE: la recaudación tributaria como proporción del PIB (16%) es de las más bajas entre economías de tamaño comparable, limitando la capacidad redistributiva del Estado.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Gráfica de barras apiladas mostrando la distribución del ingreso por deciles en México (ENIGH 2022). El decil I apenas aparece visible frente al decil X, que ocupa más de un tercio del área total.",
          caption: "Distribución del ingreso por deciles en México (INEGI-ENIGH, 2022).",
        },
      ],
    },
  },

  // ── 3 ──────────────────────────────────────────────────────────────────────
  {
    slug: "cs-iii-brecha-digital-juventudes",
    titulo: "Brecha digital y desigualdad: el caso de las juventudes mexicanas",
    categoria: "Desigualdad social",
    conceptos_clave: ["brecha digital", "juventudes", "conectividad", "ENDUTIH", "exclusión tecnológica", "educación en línea"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La brecha digital es la desigualdad en el acceso, uso y aprovechamiento de las tecnologías de la información y la comunicación (TIC). En sociedades donde el empleo, la educación y los servicios públicos dependen cada vez más de plataformas digitales, no tener acceso a internet equivale a una forma de exclusión social. Para las juventudes mexicanas, la brecha digital se convirtió en una crisis visible durante la pandemia de COVID-19, cuando millones de estudiantes de bachillerato no pudieron continuar sus clases a distancia por carecer de dispositivos o conectividad.",
        },
        {
          tipo: "subtitulo",
          contenido: "Datos de la ENDUTIH 2023",
        },
        {
          tipo: "parrafo",
          contenido:
            "La Encuesta Nacional sobre Disponibilidad y Uso de Tecnologías de Información en los Hogares (ENDUTIH) del INEGI reporta que en 2023 el 78.6% de la población mexicana de 6 años o más utilizó internet. Sin embargo, esta cifra promedio oculta diferencias enormes: en zonas urbanas la cobertura llega al 85%, mientras en zonas rurales es del 53%. Los estados del sur presentan las tasas más bajas: Chiapas (54%), Guerrero (62%) y Oaxaca (65%). Entre jóvenes de 18 a 24 años la cobertura sube al 91%, pero la calidad de la conexión y el tipo de dispositivo usado revelan otra desigualdad.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Acceder a internet solo por celular —sin computadora ni tablet— limita severamente las posibilidades de aprendizaje digital. Según la ENDUTIH 2023, el 91% de los usuarios de internet en hogares de bajos ingresos se conecta exclusivamente por teléfono móvil, frente al 34% en hogares de ingresos altos. Usar la misma pantalla para estudiar, comunicarse y entretenerse desde un teléfono compartido con la familia no equivale funcionalmente al acceso de quien tiene computadora propia y banda ancha fija.",
        },
        {
          tipo: "lista",
          items: [
            "Pandemia y educación: durante 2020-2021, se estima que 5.2 millones de estudiantes de educación básica y media superior abandonaron sus estudios, muchos por la incapacidad de seguir clases a distancia.",
            "Género y tecnología: las niñas y mujeres jóvenes de zonas rurales tienen menor acceso a dispositivos tecnológicos por normas culturales que priorizan el uso masculino.",
            "Economía gig y brecha digital: los trabajos de plataforma (Rappi, Uber, UBER Eats) requieren smartphone y datos móviles; quienes no los tienen quedan fuera de este mercado laboral creciente.",
            "Iniciativas públicas: el programa Sembrando Vida y el Internet para Todos de la SCT han expandido conectividad en zonas rurales, pero con cobertura desigual y calidad limitada.",
          ],
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Mapa de México con intensidad de color proporcional a la cobertura de internet por estado (ENDUTIH 2023). El norte y el centro del país aparecen en azul intenso; el sur, en azul claro. Junto al mapa, una gráfica de barras compara el acceso rural vs. urbano.",
          caption: "Brecha digital rural-urbana en México (INEGI-ENDUTIH, 2023).",
        },
      ],
    },
  },

  // ── 4 ──────────────────────────────────────────────────────────────────────
  {
    slug: "cs-iii-movimientos-sociales-mexico",
    titulo: "Movimientos sociales en México contemporáneo: actores y repertorios",
    categoria: "Movimientos sociales",
    conceptos_clave: ["movimientos sociales", "acción colectiva", "repertorios de protesta", "actores sociales", "demandas", "redes sociales"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Un movimiento social es una forma de acción colectiva sostenida protagonizada por actores que comparten una identidad y una demanda frente a un poder establecido. A diferencia de los partidos políticos o los sindicatos, los movimientos sociales son organizaciones relativamente descentralizadas que se mantienen unidas por la solidaridad, el agravio compartido y la visión de una transformación social posible. México ha sido escenario de movimientos sociales de gran relevancia desde finales del siglo XX, que han redefinido la cultura política del país.",
        },
        {
          tipo: "subtitulo",
          contenido: "Principales movimientos sociales en México (1994-presente)",
        },
        {
          tipo: "lista",
          items: [
            "EZLN (1994): el Ejército Zapatista de Liberación Nacional surgió el 1 de enero de 1994 en Chiapas, el mismo día que entró en vigor el TLCAN, denunciando la exclusión histórica de los pueblos indígenas. Introdujo formas innovadoras de comunicación política y articuló el movimiento indígena con la crítica al neoliberalismo a nivel global.",
            "#YoSoy132 (2012): movimiento estudiantil surgido durante la campaña presidencial, que demandó democratización de los medios de comunicación y transparencia electoral. Surgió espontáneamente en la Universidad Iberoamericana el 11 de mayo de 2012.",
            "Movimiento de Ayotzinapa (2014-presente): la desaparición de 43 normalistas de la Escuela Normal Rural de Ayotzinapa, Guerrero, el 26 de septiembre de 2014, generó un movimiento nacional e internacional que demanda verdad, justicia y no repetición.",
            "Movimiento feminista (2016-presente): la marea verde mexicana ha articulado demandas de justicia para víctimas de feminicidio, despenalización del aborto y erradicación de la violencia de género, con marchas masivas cada 8 de marzo.",
            "Movimiento estudiantil por el clima (2019-presente): jóvenes mexicanos se sumaron a la huelga global por el clima, demandando políticas de reducción de emisiones y justicia ambiental.",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "Las redes sociales han transformado los repertorios de protesta contemporáneos. La capacidad de organización horizontal a través de Twitter, Instagram y TikTok permite que los movimientos escalen rápidamente sin necesidad de estructuras jerárquicas permanentes. Sin embargo, este modelo también tiene debilidades: la visibilidad en redes no equivale siempre a presión política sostenida, y la fragmentación de las audiencias digitales puede dificultar la construcción de coaliciones amplias.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El sociólogo Sidney Tarrow distingue entre 'ciclos de protesta' —períodos de alta movilización que se extienden por varios sectores sociales— y movimientos sectoriales aislados. México ha vivido ciclos de protesta en 1968, en 1994 y en el período 2012-2019. En estos ciclos, distintos movimientos se retroalimentan, comparten repertorios y generan un clima de cuestionamiento del orden establecido que puede —o no— desembocar en cambios estructurales.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Línea de tiempo de movimientos sociales mexicanos entre 1994 y 2024: EZLN 1994, marcha de pueblos indígenas 2001, huelga UNAM 1999-2000, Ayotzinapa 2014, #YoSoy132 2012, marea verde 2016, huelga climática 2019.",
          caption: "Ciclos de movilización social en México contemporáneo (1994-2024).",
        },
      ],
    },
  },

  // ── 5 ──────────────────────────────────────────────────────────────────────
  {
    slug: "cs-iii-yosoy132-2012-movimiento",
    titulo: "#YoSoy132: el movimiento estudiantil de 2012 y la democratización mediática",
    categoria: "Movimientos sociales",
    conceptos_clave: ["#YoSoy132", "movimiento estudiantil", "medios de comunicación", "democracia", "elecciones 2012", "Iberoamericana"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El 11 de mayo de 2012, el candidato presidencial del PRI, Enrique Peña Nieto, visitó la Universidad Iberoamericana de Ciudad de México. Fue recibido con abucheos por estudiantes que protestaban por su actuación como gobernador del Estado de México, particularmente por la represión policial en San Salvador Atenco en 2006. Ante las cámaras, Peña Nieto abandonó el auditorio. Cuando medios de comunicación afines al candidato calificaron a los manifestantes como 'acarreados', 131 estudiantes publicaron un video mostrando sus credenciales. La respuesta viral en redes sociales —miles de jóvenes que declaraban 'yo soy el 132'— dio origen al movimiento.",
        },
        {
          tipo: "subtitulo",
          contenido: "Demandas y características del movimiento",
        },
        {
          tipo: "parrafo",
          contenido:
            "A diferencia de movimientos anteriores, #YoSoy132 nació en redes sociales y se articuló sin una estructura jerárquica definida. Sus demandas centrales eran la democratización de los medios de comunicación masivos (Televisa y TV Azteca, percibidos como parciales a favor del PRI), la garantía de un proceso electoral limpio y transparente, y la apertura de espacios de participación política para los jóvenes. El movimiento organizó el primer debate entre candidatos presidenciales no mediado por los medios tradicionales y transmitido en vivo por internet.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El debate presidencial organizado por #YoSoy132 el 19 de junio de 2012 fue transmitido por YouTube y tuvo más de 100,000 espectadores simultáneos, cifra extraordinaria para la época. Los cinco candidatos presidenciales participaron. El debate fue notable porque las preguntas fueron formuladas por ciudadanos a través de internet, rompiendo el monopolio de los conductores televisivos en la moderación de estos espacios. Fue un precedente de participación ciudadana en la democracia digital mexicana.",
        },
        {
          tipo: "subtitulo",
          contenido: "Legado y límites del movimiento",
        },
        {
          tipo: "parrafo",
          contenido:
            "Peña Nieto ganó las elecciones de julio de 2012. El movimiento no logró sus objetivos inmediatos y se diluyó después de las elecciones. Sin embargo, su legado es significativo: demostró el potencial organizativo de las redes sociales en México, visibilizó la concentración mediática como problema democrático y formó políticamente a una generación de jóvenes que participarían en movimientos posteriores. La investigadora Guiomar Rovira Sancho documentó el movimiento en Activismo en red y multitudes conectadas (2017), analizando sus formas de organización horizontal como modelo emergente de política juvenil.",
        },
        {
          tipo: "cita",
          contenido:
            "Yo soy el 132. No soy acarreado, soy estudiante, y exijo que se respete mi derecho a manifestarme y a exigir medios de comunicación democráticos.",
          fuente: "Consigna del movimiento #YoSoy132, mayo de 2012",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Collage de dos imágenes: a la izquierda, captura de pantalla del video original de los 131 estudiantes iberoamericanos mostrando sus credenciales; a la derecha, manifestantes en las calles con carteles del movimiento #YoSoy132.",
          caption: "El origen viral de #YoSoy132: de la Universidad Iberoamericana a las calles (mayo-julio 2012).",
        },
      ],
    },
  },

  // ── 6 ──────────────────────────────────────────────────────────────────────
  {
    slug: "cs-iii-movimiento-feminista-mexico",
    titulo: "El movimiento feminista en México: marea verde, 8M y demandas estructurales",
    categoria: "Movimientos sociales",
    conceptos_clave: ["feminismo", "marea verde", "8M", "feminicidio", "violencia de género", "CNDH", "SCJN", "aborto"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El movimiento feminista mexicano del siglo XXI ha alcanzado una escala y una radicalidad sin precedentes en la historia del país. Desde 2016, movilizaciones anuales cada 8 de marzo (Día Internacional de la Mujer) y cada 25 de noviembre (Día Internacional de la Eliminación de la Violencia contra la Mujer) han reunido entre 80,000 y 200,000 personas en Ciudad de México, con manifestaciones simultáneas en decenas de ciudades del país. La marea verde —símbolo de la lucha por el derecho al aborto legal, adoptado del movimiento argentino— se convirtió en emblema visual del feminismo latinoamericano.",
        },
        {
          tipo: "subtitulo",
          contenido: "Contexto: violencia feminicida en México",
        },
        {
          tipo: "parrafo",
          contenido:
            "Las demandas del movimiento feminista mexicano responden a una crisis de violencia de género documentada. El Secretariado Ejecutivo del Sistema Nacional de Seguridad Pública reporta que en 2023 se registraron 859 feminicidios, aunque activistas y organizaciones de la sociedad civil argumentan que la cifra real es mayor debido al subregistro. México ocupa uno de los primeros lugares en feminicidios de América Latina. El Estado de México, Jalisco, Veracruz y Ciudad de México concentran el mayor número de casos.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "En 2021, la Suprema Corte de Justicia de la Nación (SCJN) emitió dos resoluciones históricas: declaró inconstitucional criminalizar el aborto en el Código Penal de Coahuila y anuló el artículo que penalizaba el aborto en Sinaloa. Estas resoluciones establecieron jurisprudencia: ningún tribunal del país puede condenar penalmente a una mujer por abortar. Sin embargo, el acceso real al aborto seguro sigue siendo desigual: solo la Ciudad de México, Oaxaca, Veracruz y otros pocos estados lo habían despenalizado legislativamente hasta 2024.",
        },
        {
          tipo: "lista",
          items: [
            "8M 2020: la marcha del 8 de marzo de 2020 en Ciudad de México fue la mayor en la historia del país, con estimaciones de entre 80,000 y 150,000 participantes.",
            "Un día sin nosotras (9 de marzo de 2020): al día siguiente del 8M, miles de mujeres realizaron una huelga de actividades para visibilizar su contribución económica y social.",
            "Ocupación de la CNDH (2020): un colectivo de mujeres víctimas de violencia ocupó las instalaciones de la Comisión Nacional de Derechos Humanos, criticando su inacción ante el feminicidio.",
            "Marea verde en los estados: entre 2019 y 2024, doce estados mexicanos despenalizaron el aborto en el primer trimestre, en respuesta a la presión del movimiento feminista.",
          ],
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Fotografía de una marcha del 8M en Ciudad de México, con miles de mujeres portando pañuelos verdes y morados. En el fondo, el Ángel de la Independencia. La imagen captura la escala masiva del movimiento y su diversidad generacional.",
          caption: "Marcha del 8 de marzo en Ciudad de México: el movimiento feminista en la calle.",
        },
      ],
    },
  },

  // ── 7 ──────────────────────────────────────────────────────────────────────
  {
    slug: "cs-iii-politicas-publicas-ciclo",
    titulo: "Políticas públicas: el ciclo de las políticas y su implementación",
    categoria: "Economía y desarrollo",
    conceptos_clave: ["políticas públicas", "ciclo de política", "agenda", "implementación", "evaluación", "CONEVAL", "presupuesto"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Una política pública es un conjunto de decisiones y acciones que el Estado lleva a cabo para atender un problema social o alcanzar un objetivo colectivo. No es simplemente un programa o una ley: es un proceso complejo que va desde el reconocimiento de un problema como asunto público hasta la evaluación de sus resultados, pasando por el diseño, la aprobación presupuestal y la implementación. Comprender el ciclo de las políticas públicas es esencial para analizar por qué algunas funcionan y otras fracasan, y cómo los ciudadanos pueden incidir en ellas.",
        },
        {
          tipo: "subtitulo",
          contenido: "Las etapas del ciclo de política pública",
        },
        {
          tipo: "lista",
          items: [
            "Identificación y definición del problema: no todos los problemas sociales se convierten en políticas públicas; se requiere que el problema sea reconocido como prioritario por actores con capacidad de ponerlo en la agenda gubernamental.",
            "Formación de la agenda: la agenda de gobierno es el conjunto de problemas que los funcionarios consideran prioritarios. Los movimientos sociales, los medios, los partidos y los organismos internacionales compiten por influir en esta agenda.",
            "Diseño de alternativas: los equipos técnicos proponen soluciones, evalúan su costo, viabilidad política y efectividad potencial. Aquí participan también universidades, think tanks y organismos como el CONEVAL.",
            "Decisión y aprobación: la política debe ser aprobada por el Poder Legislativo (si requiere reforma legal o presupuesto nuevo) o por el Ejecutivo mediante decreto.",
            "Implementación: la etapa en que la política se pone en práctica. Es frecuentemente la más difícil: las burocracias tienen intereses propios, los recursos llegan incompletos y los contextos locales difieren del diseño central.",
            "Evaluación: el CONEVAL evalúa los programas sociales federales. Una evaluación rigurosa puede mostrar si el programa cumplió sus metas, si tuvo efectos no previstos y si debe continuar, modificarse o cancelarse.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "En México, el Presupuesto de Egresos de la Federación es aprobado cada año por la Cámara de Diputados. Para el ejercicio fiscal 2024, el gasto programable destinado a desarrollo social fue de aproximadamente 1.5 billones de pesos, equivalente al 5.5% del PIB. Los programas de mayor escala son: Pensión para el Bienestar de Adultos Mayores (300,000 millones de pesos), Sembrando Vida y Becas Benito Juárez para estudiantes de bachillerato.",
        },
        {
          tipo: "cita",
          contenido:
            "Las políticas públicas no son neutras: reflejan la correlación de fuerzas entre actores sociales. Quien tiene más poder de incidencia consigue que sus problemas lleguen a la agenda.",
          fuente: "Harold Lasswell, Political Science and Political Theory (1956)",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama circular del ciclo de política pública con seis etapas: identificación del problema, formación de la agenda, diseño de alternativas, decisión y aprobación, implementación y evaluación, con flechas que señalan retroalimentación al inicio del ciclo.",
          caption: "El ciclo de las políticas públicas: de la agenda a la evaluación.",
        },
      ],
    },
  },

  // ── 8 ──────────────────────────────────────────────────────────────────────
  {
    slug: "cs-iii-economia-informal-mexico",
    titulo: "Economía informal y juventudes: precariedad laboral en México",
    categoria: "Economía y desarrollo",
    conceptos_clave: ["economía informal", "precariedad laboral", "juventudes", "NINI", "ENOE", "empleo formal", "plataformas digitales"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La economía informal es el conjunto de actividades económicas que se realizan al margen de la regulación estatal: sin contrato formal, sin seguridad social y sin acceso a prestaciones laborales. En México, la informalidad laboral afecta al 55.2% de la población ocupada, según la ENOE del primer trimestre de 2024. Para los jóvenes entre 15 y 29 años, la precariedad laboral es particularmente aguda: el 61% de los jóvenes ocupados trabaja en condiciones de informalidad, muchos en empleos temporales, por hora o a través de plataformas digitales que evitan la relación laboral formal.",
        },
        {
          tipo: "subtitulo",
          contenido: "Juventudes, empleo y la generación de los NINI",
        },
        {
          tipo: "parrafo",
          contenido:
            "El término 'NINI' (ni estudia ni trabaja) fue acuñado en el contexto de la crisis económica global de 2008-2009 para describir a jóvenes desconectados del sistema educativo y del mercado laboral formal. En México, el INEGI estimó en 2022 que aproximadamente 6.7 millones de jóvenes entre 15 y 29 años se encontraban en esta situación. Sin embargo, el concepto ha sido criticado por ocultar la realidad: muchos 'NINI' están realizando trabajo de cuidado no remunerado en el hogar (principalmente mujeres), buscando activamente empleo sin encontrarlo, o trabajando en la economía informal sin ser captados por las estadísticas formales.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El trabajo en plataformas digitales (Uber, Rappi, DiDi Food, Mercado Libre) ha creado una nueva forma de precariedad laboral para los jóvenes mexicanos. Estos trabajadores son clasificados como 'socios independientes' o 'contratistas autónomos', lo que legalmente los excluye del IMSS, las vacaciones pagadas y el aguinaldo. Una resolución de la SCJN en 2023 comenzó a cuestionar esta clasificación, y la reforma laboral pendiente busca garantizar derechos básicos a los trabajadores de plataforma.",
        },
        {
          tipo: "lista",
          items: [
            "Salario mínimo en México 2024: 248.93 pesos diarios en la Zona Libre de la Frontera Norte (ZLFN) y 207.44 pesos en el resto del país. Representa un avance respecto a años anteriores, pero sigue siendo insuficiente para cubrir la canasta básica en grandes ciudades.",
            "Impacto de la informalidad en la vejez: un joven que trabaja toda su vida en informalidad llega a la vejez sin pensión contributiva, dependiendo de la pensión universal no contributiva del gobierno.",
            "Bachillerato y empleabilidad: los egresados del CONALEP tienen tasas de inserción laboral formal más altas que los del CCH o el COBACH, pero el mercado valora más las credenciales universitarias.",
            "Crisis del agua en Monterrey (2022): la escasez de agua en la zona metropolitana afectó desproporcionadamente a jóvenes de colonias populares que trabajan en el sector servicios y construcción.",
          ],
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Gráfica de barras comparando la tasa de informalidad laboral por grupo de edad en México (ENOE 2024). Los jóvenes de 15-24 años presentan la barra más alta, seguidos por los adultos mayores de 65 años.",
          caption: "Informalidad laboral por grupo de edad en México (INEGI-ENOE, 2024).",
        },
      ],
    },
  },

  // ── 9 ──────────────────────────────────────────────────────────────────────
  {
    slug: "cs-iii-actores-sociales-estado-mercado",
    titulo: "Actores sociales: Estado, mercado y sociedad civil en la crisis",
    categoria: "Análisis estructural",
    conceptos_clave: ["actores sociales", "Estado", "mercado", "sociedad civil", "poder", "conflicto social", "gobernanza"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Un actor social es cualquier individuo, grupo u organización que tiene la capacidad de tomar decisiones que afectan a otros, de movilizar recursos y de intervenir en la vida colectiva. Las ciencias sociales identifican tres tipos de actores fundamentales que estructuran la vida social moderna: el Estado, el mercado y la sociedad civil. Comprender cómo interactúan estos actores es esencial para analizar por qué se producen las crisis sociales y quién tiene capacidad de responder a ellas.",
        },
        {
          tipo: "subtitulo",
          contenido: "El Estado, el mercado y la sociedad civil ante la crisis",
        },
        {
          tipo: "lista",
          items: [
            "El Estado: monopoliza el uso legítimo de la fuerza (Weber) y tiene la capacidad de crear leyes, recaudar impuestos y proveer servicios públicos. En contextos de crisis, el Estado puede intervenir ampliando el gasto social, regulando al mercado o reprimiendo la protesta. En México, el Estado federal tiene capacidad de acción limitada por la descentralización fiscal y la captura de instancias locales por grupos de interés.",
            "El mercado: asigna recursos a través de precios y genera incentivos para la producción. En situaciones de crisis (desempleo, inflación, escasez), el mercado puede profundizar la desigualdad si no hay regulación adecuada. Las empresas transnacionales tienen, en algunos sectores, más poder que los gobiernos nacionales.",
            "La sociedad civil: organizaciones no gubernamentales, movimientos sociales, colectivos, medios independientes y redes comunitarias que actúan al margen del Estado y el mercado. En contextos de crisis, la sociedad civil puede suplir servicios que el Estado no provee, articular demandas políticas y crear formas alternativas de solidaridad.",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "El politólogo Bob Jessop propone el concepto de 'fallas de Estado, fallas de mercado y fallas de gobernanza' para analizar las crisis contemporáneas. Las crisis sociales más profundas ocurren cuando los tres actores fallan simultáneamente: el Estado no puede o no quiere intervenir, el mercado agrava las desigualdades y la sociedad civil carece de los recursos para articular una respuesta efectiva. La pandemia de COVID-19 en México ilustra esta simultaneidad: el sistema de salud saturado (falla de Estado), empresas que cerraron masivamente (falla de mercado) y redes comunitarias que debieron organizarse sin apoyo institucional (resiliencia de la sociedad civil).",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "En México, la debilidad histórica del Estado en regiones de alta conflictividad (Guerrero, Michoacán, Tamaulipas) ha permitido el surgimiento de actores paraestatales como los grupos del crimen organizado, que en algunas comunidades proveen servicios de seguridad, empleo y regulación del conflicto que el Estado no ofrece. Este fenómeno —el Estado fallido parcial— es uno de los más analizados en la ciencia política mexicana contemporánea.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama triangular con Estado, Mercado y Sociedad Civil en los tres vértices, y flechas bidireccionales entre ellos mostrando relaciones de regulación, influencia y provisión de servicios. En el centro, la ciudadanía como sujeto afectado por los tres actores.",
          caption: "Triángulo de actores sociales: Estado, mercado y sociedad civil.",
        },
      ],
    },
  },

  // ── 10 ─────────────────────────────────────────────────────────────────────
  {
    slug: "cs-iii-crisis-social-multicausalidad",
    titulo: "Crisis social multicausal: cuando lo económico, lo ambiental y lo sanitario se cruzan",
    categoria: "Análisis estructural",
    conceptos_clave: ["crisis social", "multicausalidad", "vulnerabilidad", "resiliencia", "pandemia", "cambio climático", "desigualdad"],
    tiempo_lectura_minutos: 8,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Una crisis social no ocurre por una sola causa: es el resultado de la convergencia de múltiples factores que se retroalimentan. La multicausalidad es la perspectiva analítica que reconoce que los grandes problemas sociales —la pobreza persistente, la violencia, la exclusión— tienen raíces simultáneas en la economía, la política, la cultura, el medio ambiente y la historia. Entender la multicausalidad previene el error de buscar una sola explicación o un solo culpable, y abre el camino a soluciones más integrales.",
        },
        {
          tipo: "subtitulo",
          contenido: "Crisis superpuestas en México (2018-2024)",
        },
        {
          tipo: "parrafo",
          contenido:
            "Entre 2018 y 2024, México enfrentó simultáneamente crisis de diferentes dimensiones. La crisis de seguridad, con más de 30,000 homicidios anuales en el período, tiene causas que van desde el desempleo juvenil hasta la debilidad institucional, la corrupción policial y la demanda de drogas en Estados Unidos. La crisis sanitaria del COVID-19 (2020-2022) reveló la fragilidad del sistema de salud público, que durante décadas había sido subfinanciado: México registró un exceso de mortalidad estimado superior a 700,000 personas, una de las cifras más altas del mundo en términos absolutos. La crisis ambiental del agua en Monterrey (2022) evidenció cómo el modelo de desarrollo industrial del norte del país no planificó la gestión sostenible del recurso hídrico.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El exceso de mortalidad es una metodología estadística que compara las muertes ocurridas durante la pandemia con las que se esperarían en condiciones normales. Permite capturar tanto las muertes directamente causadas por COVID-19 como las indirectas: personas que murieron porque no pudieron acceder a atención médica para otras enfermedades durante la crisis sanitaria. La UNAM y el INSP estimaron que entre 2020 y 2022 México tuvo entre 600,000 y 800,000 muertes en exceso, cifra que ubica al país entre los más afectados del mundo en términos absolutos.",
        },
        {
          tipo: "subtitulo",
          contenido: "El concepto de vulnerabilidad social",
        },
        {
          tipo: "parrafo",
          contenido:
            "La vulnerabilidad social es la condición de exposición a riesgos combinada con la limitada capacidad de respuesta y recuperación. Los grupos más vulnerables ante las crisis son aquellos que acumulan múltiples desventajas: pobreza material, falta de redes de apoyo, exposición ambiental y exclusión de los sistemas de protección social. En México, las comunidades indígenas rurales, los jóvenes en situación de pobreza y las mujeres jefas de hogar en la economía informal son los grupos con mayor vulnerabilidad estructural. La resiliencia —la capacidad de adaptarse y recuperarse— no es un atributo individual sino el resultado de condiciones estructurales que el Estado y las políticas públicas pueden crear o destruir.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de Venn con cuatro esferas superpuestas que representan crisis económica, crisis sanitaria, crisis ambiental y crisis de seguridad. En el centro, donde se intersectan las cuatro, se ubican las comunidades con mayor vulnerabilidad estructural.",
          caption: "La multicausalidad de la crisis social: cuatro dimensiones que se refuerzan mutuamente.",
        },
      ],
    },
  },

  // ── 11 ─────────────────────────────────────────────────────────────────────
  {
    slug: "cs-iii-derechos-juventudes-mexico",
    titulo: "Derechos de las juventudes en México: el IMJUVE y las políticas juveniles",
    categoria: "Análisis estructural",
    conceptos_clave: ["derechos juveniles", "IMJUVE", "políticas públicas juveniles", "participación política", "CONALEP", "COBACH", "CCH"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Las juventudes mexicanas son un sujeto político con derechos específicos reconocidos en la legislación nacional e internacional. La Ley del Instituto Mexicano de la Juventud (Ley del IMJUVE), promulgada en 1999 y actualizada en diversas ocasiones, establece que el Estado mexicano tiene la obligación de garantizar a las personas jóvenes de entre 12 y 29 años el acceso a la educación, el empleo, la salud, la vivienda, la cultura y la participación política. El IMJUVE es el organismo federal encargado de coordinar las políticas públicas dirigidas a este grupo de población.",
        },
        {
          tipo: "subtitulo",
          contenido: "El contexto de las juventudes mexicanas",
        },
        {
          tipo: "parrafo",
          contenido:
            "México tiene una estructura demográfica que ha comenzado a envejecer, pero aún mantiene una proporción significativa de población joven. Según el INEGI, en 2023 había aproximadamente 38.6 millones de jóvenes entre 15 y 29 años, equivalente al 30% de la población total. Esta generación vive en un contexto radicalmente diferente al de sus padres: accede a información global a través de internet, enfrenta un mercado laboral más precario que el de décadas anteriores, y tiene mayor escolaridad formal pero menores perspectivas de empleo acorde a su formación.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Los sistemas de bachillerato en México son altamente segmentados. El CONALEP (Colegio Nacional de Educación Profesional Técnica) forma técnicos especializados para el mercado laboral. El COBACH (Colegio de Bachilleres) ofrece el bachillerato propedéutico generalista. El CCH (Colegio de Ciencias y Humanidades) de la UNAM enfatiza el pensamiento crítico y la formación humanística. Cada sistema responde a demandas distintas del mercado y la sociedad, y sus egresados tienen trayectorias educativas y laborales diferenciadas.",
        },
        {
          tipo: "lista",
          items: [
            "Derecho a la educación: la educación media superior es obligatoria en México desde la reforma constitucional de 2012, pero la tasa de cobertura es del 82.4% (SEP, 2023), lo que significa que más de 3 millones de jóvenes en edad de bachillerato están fuera del sistema.",
            "Derecho al trabajo digno: la Ley Federal del Trabajo prohíbe el trabajo de menores de 15 años y establece protecciones especiales para los trabajadores de 15 a 17 años, aunque el trabajo infantil persiste en la agricultura informal.",
            "Derecho a la participación política: los jóvenes pueden votar desde los 18 años. La reforma electoral de 2022 abrió la posibilidad de candidaturas para personas de 18 años para diputados locales y federales.",
            "Derecho a la salud mental: la pandemia evidenció la crisis de salud mental entre jóvenes mexicanos. La ENSANUT 2021 reportó un aumento significativo de síntomas de depresión y ansiedad en el grupo de 15 a 24 años, pero los servicios de salud mental pública son insuficientes.",
          ],
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Infografía con la pirámide de derechos juveniles según la Ley del IMJUVE: en la base, derechos básicos (educación, salud, alimentación); en el medio, derechos de desarrollo (empleo, vivienda, cultura); en la cima, derechos de participación (política, organización, expresión).",
          caption: "Marco de derechos juveniles en México según la Ley del IMJUVE.",
        },
      ],
    },
  },

  // ── 12 ─────────────────────────────────────────────────────────────────────
  {
    slug: "cs-iii-pandemia-covid-crisis-social",
    titulo: "Pandemia de COVID-19 en México: crisis sanitaria y crisis social",
    categoria: "Casos contemporáneos",
    conceptos_clave: ["COVID-19", "pandemia", "exceso de mortalidad", "crisis sanitaria", "desigualdad", "IMSS", "pobreza"],
    tiempo_lectura_minutos: 8,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La pandemia de COVID-19 fue la mayor crisis sanitaria global del siglo XXI. En México, llegó oficialmente en febrero de 2020 y durante más de dos años paralizó la economía, saturó los hospitales, interrumpió la educación de millones de niños y jóvenes, y dejó una huella de muertes extraordinaria. Pero la pandemia no fue solo una crisis de salud pública: fue un revelador brutal de las desigualdades estructurales de la sociedad mexicana, ampliando brechas que ya existían y produciendo consecuencias sociales que se extenderán por décadas.",
        },
        {
          tipo: "subtitulo",
          contenido: "El impacto humano: exceso de mortalidad",
        },
        {
          tipo: "parrafo",
          contenido:
            "México recurrió al concepto de exceso de mortalidad para estimar el impacto real de la pandemia más allá de los fallecimientos confirmados por COVID-19. Esta metodología compara las muertes registradas durante el período pandémico con las esperadas según tendencias históricas. Investigaciones de la UNAM, el INSP y publicaciones internacionales como The Lancet y The Economist estimaron que México tuvo entre 600,000 y 800,000 muertes en exceso entre 2020 y 2022. Esta cifra lo ubica entre los cinco países con mayor impacto absoluto en el mundo, junto a India, Estados Unidos, Rusia y Brasil.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La pandemia impactó de forma radicalmente desigual. Los trabajadores de la economía informal —que no podían 'quedarse en casa' sin perder sus ingresos— tuvieron una exposición mucho mayor al virus. Las personas sin acceso al IMSS o al ISSSTE dependieron de un sistema de salud pública (hospitales del INSABI, SSA) que fue desbordado. Las comunidades indígenas rurales, con servicios de salud históricamente precarios, sufrieron tasas de mortalidad desproporcionadas. Los datos del CONEVAL confirmaron que la pobreza aumentó en 2020, revirtiendo los avances de años anteriores.",
        },
        {
          tipo: "subtitulo",
          contenido: "Consecuencias sociales de largo plazo",
        },
        {
          tipo: "lista",
          items: [
            "Rezago educativo: la SEP estimó que entre 800,000 y 1.5 millones de estudiantes abandonaron definitivamente la escuela durante la pandemia, principalmente en bachillerato y universidad.",
            "Salud mental: la ENSANUT 2021 documentó un aumento del 60% en síntomas de depresión en adultos y del 40% en adolescentes respecto a la medición prepandémica.",
            "Violencia doméstica: durante los confinamientos, las llamadas al sistema de emergencias por violencia contra mujeres aumentaron un 60% en promedio nacional.",
            "Empleo y pobreza: el INEGI reportó que en el segundo trimestre de 2020 México perdió 12.5 millones de empleos, la mayoría informales. La recuperación fue desigual: los empleos formales se recuperaron más rápido que los informales.",
            "Estrategia de vacunación: México fue uno de los primeros países latinoamericanos en iniciar la vacunación masiva (diciembre de 2020) y alcanzó el 60% de cobertura con esquema completo para mayo de 2022.",
          ],
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Gráfica de línea temporal mostrando el exceso de mortalidad semanal en México durante 2020, 2021 y 2022, con picos en julio-agosto 2020, enero-febrero 2021 y julio-agosto 2021, comparado con la línea base de mortalidad esperada.",
          caption: "Exceso de mortalidad semanal en México durante la pandemia de COVID-19 (2020-2022).",
        },
      ],
    },
  },

  // ── 13 ─────────────────────────────────────────────────────────────────────
  {
    slug: "cs-iii-cambio-climatico-conflicto",
    titulo: "Cambio climático y conflicto social: el agua como bien común",
    categoria: "Casos contemporáneos",
    conceptos_clave: ["cambio climático", "escasez hídrica", "bien común", "conflicto ambiental", "justicia climática", "Monterrey 2022"],
    tiempo_lectura_minutos: 8,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El cambio climático no es solo un problema ambiental abstracto: tiene consecuencias concretas sobre el acceso al agua, la producción de alimentos, los desplazamientos de población y los conflictos sociales. En México, uno de los países más vulnerables al cambio climático según el IPCC, los efectos ya son visibles: sequías prolongadas en el norte, inundaciones catastróficas en el sur, pérdida de biodiversidad y presión sobre los recursos hídricos. La crisis del agua en Monterrey en 2022 fue un caso paradigmático que ilustra cómo el cambio climático se entrelaza con decisiones políticas, desigualdad social y conflicto.",
        },
        {
          tipo: "subtitulo",
          contenido: "La crisis del agua en Monterrey (2022)",
        },
        {
          tipo: "parrafo",
          contenido:
            "En el verano de 2022, la zona metropolitana de Monterrey —la segunda ciudad industrial de México, con casi 5 millones de habitantes— vivió una crisis hídrica sin precedentes en su historia moderna. Las presas La Boquilla y El Cuchillo, principales fuentes de abastecimiento, cayeron a niveles críticos de llenado (menos del 8%) por una combinación de sequía extrema, aumento de la temperatura y crecimiento urbano no planificado. Millones de hogares recibieron agua solo unas pocas horas al día o cada dos días. Las industrias de la región —que consumen una proporción desproporcionada del agua disponible— continuaron operando con relativamente pocas restricciones, generando conflicto social y debates sobre la distribución del recurso.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La crisis de Monterrey evidenció que la escasez de agua no afecta a todos por igual. Las colonias de bajos ingresos en la periferia urbana fueron las más afectadas: sin cisternas propias, sin capacidad de almacenamiento y más dependientes del suministro público. Las colonias residenciales de alto ingreso, con infraestructura de almacenamiento privada y pozos propios, sufrieron mucho menos. Esta 'geografía de la sed' refleja cómo la desigualdad social determina quién sufre primero y más intensamente las consecuencias del cambio climático.",
        },
        {
          tipo: "subtitulo",
          contenido: "El agua como bien común y la justicia climática",
        },
        {
          tipo: "parrafo",
          contenido:
            "El economista Elinor Ostrom, ganadora del Premio Nobel de Economía en 2009, demostró que los bienes comunes —recursos compartidos como el agua, los bosques o los pesqueros— no están condenados a la 'tragedia de los comunes' si las comunidades establecen reglas colectivas para su gestión. El concepto de justicia climática plantea que las comunidades y países que menos han contribuido al cambio climático son frecuentemente las más afectadas por sus consecuencias. México contribuye con menos del 1.5% de las emisiones globales de gases de efecto invernadero, pero es uno de los países con mayor vulnerabilidad climática. Los jóvenes mexicanos son la generación que vivirá la mayor parte de las consecuencias de un calentamiento global que no generaron.",
        },
        {
          tipo: "lista",
          items: [
            "México es considerado un país 'megadiverso' con el 10% de la biodiversidad global, pero enfrenta deforestación acelerada: pierde aproximadamente 175,000 hectáreas de bosque al año.",
            "El Panel Intergubernamental sobre Cambio Climático (IPCC) clasifica a México como 'altamente vulnerable': expuesto a ciclones, sequías, inundaciones costeras y estrés hídrico.",
            "El movimiento por la justicia climática en México, protagonizado en gran medida por jóvenes, demanda una transición energética justa que no sacrifique empleos en comunidades que dependen de los hidrocarburos.",
            "La Ley de Transición Energética (2015) estableció metas de generación de electricidad limpia, pero su cumplimiento ha sido irregular y objeto de debate político.",
          ],
        },
        {
          tipo: "cita",
          contenido:
            "La crisis climática no es un problema del futuro; es un problema del presente. Y quienes menos la causaron son quienes más la padecen.",
          fuente: "Greta Thunberg, discurso ante la ONU (septiembre de 2019)",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Fotografía de la presa La Boquilla en Monterrey durante la sequía de 2022, con el nivel del agua muy por debajo de la capacidad normal y el fondo visible. Al lado, imagen de colonias populares con camiones cisterna repartiendo agua.",
          caption: "La crisis del agua en Monterrey (2022): sequía y desigualdad en el acceso al recurso hídrico.",
        },
      ],
    },
  },
] as const;

// ---------------------------------------------------------------------------
// FUNCIÓN PRINCIPAL
// ---------------------------------------------------------------------------

export async function seedBibliotecaCSIII(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed Biblioteca CS-III (13 fichas)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac")
    .select("id")
    .eq("codigo", "CS-III")
    .single();

  if (uacErr || !uacRow) {
    throw new Error(
      `UAC CS-III no encontrada. Ejecuta primero seed-mccems.ts y seed-csiii.ts. Error: ${uacErr?.message}`
    );
  }

  const rows = FICHAS_CSIII.map((f, i) => ({
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

  if (error) throw new Error(`Error seeding fichas CS-III: ${error.message}`);

  console.log(`  ✓ ${rows.length} fichas de biblioteca de CS-III insertadas/actualizadas.`);
  console.log("\n✅ Seed Biblioteca CS-III completado.\n");
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
  seedBibliotecaCSIII(sb).catch((err) => {
    console.error("❌ Error:", err.message);
    process.exit(1);
  });
}
