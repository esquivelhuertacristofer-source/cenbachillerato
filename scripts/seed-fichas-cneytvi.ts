/**
 * Seed de fichas de biblioteca para CNEYT-VI (CNEyT VI — Biología, Semestre 6).
 * 21 fichas temáticas alineadas al MCCEMS 2025, Semestre 6.
 *
 * Uso: npx tsx scripts/seed-fichas-cneytvi.ts
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

const FICHAS_CNEYTVI = [
  // ── 1 ── Origen de la vida — básico ──────────────────────────────────────
  {
    slug: "cneyt-vi-origen-vida-sopa-primordial-miller-urey",
    titulo: "Origen de la vida: de la sopa primordial al experimento Miller-Urey",
    categoria: "Origen de la vida",
    conceptos_clave: ["abiogénesis", "sopa primordial", "Oparin-Haldane", "experimento Miller-Urey", "moléculas orgánicas"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La pregunta sobre cómo surgió la vida en la Tierra es uno de los grandes enigmas de la ciencia. La hipótesis de la abiogénesis propone que la vida se originó a partir de moléculas inorgánicas mediante procesos químicos naturales. A principios del siglo XX, Aleksandr Oparin y J. B. S. Haldane formularon de manera independiente la idea de que la atmósfera primitiva de la Tierra —rica en metano, amoniaco, hidrógeno y vapor de agua, y sin oxígeno libre— permitió la síntesis espontánea de moléculas orgánicas complejas en los océanos primitivos, formando la llamada sopa primordial.",
        },
        {
          tipo: "subtitulo",
          contenido: "El experimento Miller-Urey (1953)",
        },
        {
          tipo: "parrafo",
          contenido:
            "En 1953, Stanley Miller y Harold Urey pusieron a prueba la hipótesis de Oparin-Haldane con un experimento revolucionario. Construyeron un aparato cerrado que simulaba la atmósfera primitiva: mezcla de CH₄, NH₃, H₂ y H₂O, sometida a descargas eléctricas continuas (que simulaban rayos). Tras una semana, encontraron que se habían sintetizado más de 20 aminoácidos distintos, incluyendo glicina, alanina y ácido aspártico. Este resultado demostró que los bloques constructivos de las proteínas podían formarse abióticamen­te a partir de moléculas simples.",
        },
        {
          tipo: "lista",
          items: [
            "Aminoácidos sintetizados: más de 20 tipos distintos, incluyendo varios de los 20 presentes en proteínas actuales.",
            "Fuente de energía: descargas eléctricas simulando rayos; también funcionan con radiación UV y calor volcánico.",
            "Limitación: la composición exacta de la atmósfera primitiva sigue en debate; versiones posteriores del experimento con atmósferas más oxidadas producen menos aminoácidos.",
            "Relevancia: en 2008 se reanalizaron las muestras originales con técnicas modernas y se encontraron aún más compuestos orgánicos de los reportados originalmente.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Las meteoritas carbonáceas, como la de Murchison (caída en Australia en 1969), contienen más de 70 aminoácidos distintos, incluyendo muchos no presentes en la vida terrestre. Esto sugiere que la química orgánica prebiótica no es exclusiva de la Tierra y que los materiales para el origen de la vida podrían haber llegado del espacio: la panspermia química.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La abiogénesis no explica el origen de la vida de manera completa. Existen preguntas abiertas sobre cómo se formaron las primeras membranas, cómo el ARN o el ADN comenzaron a replicarse y cómo surgió el metabolismo. La investigación moderna combina química, geología, biología molecular y astrofísica para abordarlas.",
        },
      ],
    },
  },

  // ── 2 ── Origen de la vida — intermedio ──────────────────────────────────
  {
    slug: "cneyt-vi-origen-vida-coacervados-protocelulas",
    titulo: "Coacervados y protocélulas: la primera membrana y Antonio Lazcano",
    categoria: "Origen de la vida",
    conceptos_clave: ["coacervados", "protocélula", "membrana lipídica", "abiogénesis", "Antonio Lazcano"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Una vez que existían moléculas orgánicas en los océanos primitivos, el siguiente paso crítico fue la formación de estructuras que pudieran concentrar esas moléculas y separarlas del entorno: las primeras membranas. Oparin propuso los coacervados como modelos de protocélulas: gotas microscópicas de moléculas orgánicas coloidales que se separan espontáneamente de la solución acuosa formando una membrana difusa. Los coacervados pueden incorporar enzimas, crecer, dividirse e intercambiar materiales con el medio, comportamientos análogos a los de las células.",
        },
        {
          tipo: "subtitulo",
          contenido: "Protocélulas de vesículas lipídicas",
        },
        {
          tipo: "parrafo",
          contenido:
            "Los experimentos modernos muestran que los ácidos grasos simples (como el ácido oleico), disponibles en la Tierra primitiva, forman espontáneamente vesículas de doble capa al dispersarse en agua. Estas vesículas lipídicas son modelos más realistas de protocélulas que los coacervados. Pueden incorporar moléculas de ARN en su interior, crecer al añadir más ácidos grasos y dividirse mecánicamente. El laboratorio de Jack Szostak en Harvard ha demostrado que estas protocélulas pueden replicar ARN dentro de sí mismas sin necesidad de enzimas proteicas.",
        },
        {
          tipo: "lista",
          items: [
            "Coacervados (Oparin): gotas de polímeros orgánicos con membrana difusa; pueden incorporar catalizadores y crecer.",
            "Microesferas proteicas (Fox): calentando aminoácidos secos se forman microesferas con propiedades similares a membranas.",
            "Vesículas lipídicas (Szostak): bicapas de ácidos grasos que pueden contener ARN y dividirse; modelo actual más aceptado.",
            "La transición coacervado-protocélula implica la aparición de un sistema capaz de replicar información: el origen del código genético.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Antonio Lazcano Araujo, biólogo de la UNAM (Facultad de Ciencias), es uno de los investigadores más reconocidos del mundo en el campo de la abiogénesis y el origen de la vida. Ha colaborado con Carl Woese y trabajado extensamente sobre la hipótesis del mundo de ARN. Es autor de más de 200 publicaciones y divulgador activo en México y América Latina. Su trabajo ha influido en cómo se enseña el origen de la vida en todo el mundo hispanohablante.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La frontera entre la química prebiótica y la biología mínima sigue siendo uno de los problemas más difíciles de la ciencia. No existe aún consenso sobre si la vida comenzó en las fumarolas hidrotermales del fondo oceánico, en charcos de agua caliente superficiales o en otro ambiente. Cada hipótesis tiene evidencia parcial a su favor.",
        },
      ],
    },
  },

  // ── 3 ── Origen de la vida — avanzado ────────────────────────────────────
  {
    slug: "cneyt-vi-origen-vida-mundo-arn-ribosomas",
    titulo: "Hipótesis del mundo de ARN: la molécula ancestral y el ARN ribosómico",
    categoria: "Origen de la vida",
    conceptos_clave: ["mundo de ARN", "ribozimas", "ARN ribosómico", "evolución molecular", "ARNr 16S"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La hipótesis del mundo de ARN propone que, antes de que existieran el ADN ni las proteínas, el ARN cumplía ambas funciones: almacenaba información genética (como el ADN actual) y catalizaba reacciones químicas (como las proteínas). Esta idea resuelve el dilema del huevo y la gallina: ¿qué surgió primero, el ADN que codifica enzimas o las enzimas que replican el ADN? Si el ARN podía hacer las dos cosas, pudo haber surgido primero.",
        },
        {
          tipo: "subtitulo",
          contenido: "Las ribozimas: evidencia del mundo de ARN",
        },
        {
          tipo: "lista",
          items: [
            "En 1982, Thomas Cech descubrió que el ARN del Tetrahymena puede catalizar su propia escisión sin proteínas: las ribozimas. Por este descubrimiento obtuvo el Premio Nobel de Química en 1989 junto con Sidney Altman.",
            "El ARN ribosómico 23S (en procariotas) y 28S (en eucariotas) del ribosoma tiene actividad catalítica: es él, y no las proteínas ribosomales, el que cataliza la formación del enlace peptídico durante la síntesis de proteínas.",
            "Las moléculas de ARN pueden plegarse en estructuras tridimensionales complejas (ribozimas, aptámeros) que realizan catálisis específica con precisión comparable a la de enzimas proteicas.",
            "El ARN puede replicarse mediante ribozimas, aunque con menor fidelidad que los sistemas modernos basados en ADN y enzimas proteicas.",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "El ARN ribosómico 16S (en procariotas) y 18S (en eucariotas) es la molécula más usada en filogenia molecular. Carl Woese la usó en la década de 1970 para descubrir que los seres vivos se dividen en tres dominios: Bacteria, Archaea y Eukarya. Esta molécula evoluciona lentamente y tiene regiones altamente conservadas (iguales en todos los organismos) entremezcladas con regiones variables que permiten distinguir especies. El ARNr 16S es evidencia directa de la ancestralidad del ARN y de la unidad evolutiva de toda la vida.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El mundo de ARN no implica que el ARN fue la primera molécula de la vida. Algunos investigadores proponen un mundo pre-ARN basado en moléculas más sencillas y estables. Sin embargo, la evidencia actual apoya al ARN como el ancestro molecular más cercano al origen de la vida que podemos rastrear mediante bioquímica comparada.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "La secuenciación del ARNr 16S ha revolucionado el conocimiento de la biodiversidad microbiana. Se estima que más del 99% de los microorganismos del suelo, el océano y el cuerpo humano no pueden cultivarse en laboratorio, pero pueden identificarse por su ARNr 16S mediante metagenómica. En suelos de Milpa Alta, CDMX, estudios de la UNAM han encontrado comunidades microbianas altamente diversas gracias a esta técnica.",
        },
      ],
    },
  },

  // ── 4 ── Biología celular — básico ───────────────────────────────────────
  {
    slug: "cneyt-vi-biologia-celular-procariota-eucariota",
    titulo: "Célula procariota vs eucariota: diferencias fundamentales",
    categoria: "Biología celular",
    conceptos_clave: ["célula procariota", "célula eucariota", "núcleo celular", "organelos", "microorganismos del suelo"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Toda la vida conocida se organiza en células, pero no todas las células son iguales. La distinción más fundamental en biología celular es entre célula procariota y célula eucariota. Las células procariotas (del griego pro, antes, y karyon, núcleo) carecen de núcleo definido por membrana: su material genético se concentra en una región llamada nucleoide, sin envoltura nuclear. Las células eucariotas (eu, verdadero) sí tienen un núcleo rodeado por doble membrana, y además poseen organelos membranosos como mitocondrias, retículo endoplásmico y aparato de Golgi.",
        },
        {
          tipo: "subtitulo",
          contenido: "Comparación de características principales",
        },
        {
          tipo: "lista",
          items: [
            "Tamaño: procariotas típicamente 1–10 µm; eucariotas 10–100 µm (hasta 1 000 veces más volumen).",
            "Núcleo: procariotas sin envoltura nuclear (nucleoide); eucariotas con núcleo delimitado por membrana doble con poros nucleares.",
            "Organelos: procariotas sin organelos membranosos (solo ribosomas 70S); eucariotas con mitocondrias, cloroplastos, lisosomas, aparato de Golgi y ribosomas 80S.",
            "ADN: procariotas con ADN circular sin histonas en el citoplasma; eucariotas con ADN lineal asociado a histonas empaquetado en cromosomas dentro del núcleo.",
            "Reproducción: procariotas por fisión binaria; eucariotas por mitosis (células somáticas) o meiosis (células sexuales).",
            "Ejemplos: procariotas son las bacterias y arqueas; eucariotas son animales, plantas, hongos y protistas.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Los suelos de Milpa Alta, en la delegación Milpa Alta, CDMX, son especialmente ricos en microorganismos procariotas. Estudios de la UNAM han identificado bacterias fijadoras de nitrógeno del género Rhizobium y Azotobacter en estos suelos, esenciales para la fertilidad de la milpa (sistema de cultivo maíz-frijol-calabaza). Un gramo de suelo saludable puede contener hasta mil millones de bacterias de miles de especies distintas.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La teoría endosimbiótica de Lynn Margulis (1967) propone que las mitocondrias y los cloroplastos de las células eucariotas son descendientes de bacterias que fueron incorporadas como endosimbiontes. La evidencia incluye: tienen su propio ADN circular (como bacterias), sus ribosomas son de tipo 70S (como bacterias) y se dividen por fisión binaria dentro de la célula hospedera.",
        },
      ],
    },
  },

  // ── 5 ── Biología celular — intermedio ───────────────────────────────────
  {
    slug: "cneyt-vi-biologia-celular-organelos-funciones",
    titulo: "Organelos celulares y sus funciones: mitocondria, ribosoma, retículo, Golgi",
    categoria: "Biología celular",
    conceptos_clave: ["mitocondria", "ribosoma", "retículo endoplásmico", "aparato de Golgi", "lisosoma"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La célula eucariota es una ciudad microscópica en la que diferentes compartimentos especializados realizan funciones específicas. Estos compartimentos —los organelos— son estructuras delimitadas por membranas que permiten que reacciones químicas incompatibles ocurran simultáneamente en la misma célula. La comprensión de los organelos fue posible gracias a la microscopía electrónica, desarrollada en los años 1950–1960, y al fraccionamiento celular mediante centrifugación diferencial.",
        },
        {
          tipo: "subtitulo",
          contenido: "Los organelos y sus funciones principales",
        },
        {
          tipo: "lista",
          items: [
            "Núcleo: contiene el ADN genómico en cromosomas; lugar de la replicación del ADN, transcripción (síntesis de ARNm) y procesamiento del ARN. Rodeado por envoltura nuclear con poros.",
            "Mitocondria: central energética de la célula; produce ATP mediante la respiración celular aeróbica (ciclo de Krebs + fosforilación oxidativa). Tiene doble membrana: la interna muy plegada (crestas) donde se encuentran los complejos de la cadena de transporte de electrones.",
            "Retículo endoplásmico rugoso (RER): cubierto de ribosomas; sintetiza y procesa proteínas destinadas a la membrana, lisosomas o secreción al exterior.",
            "Retículo endoplásmico liso (REL): sin ribosomas; sintetiza lípidos y fosfolípidos, metaboliza fármacos y tóxicos (en el hígado), y regula el calcio intracelular.",
            "Aparato de Golgi: recibe vesículas del RER; modifica, clasifica y empaqueta proteínas y lípidos en vesículas para enviarlas a su destino final (membrana plasmática, lisosomas o secreción).",
            "Lisosoma: vesícula con enzimas hidrolíticas ácidas (pH 4.8); digiere macromoléculas intracelulares, residuos y patógenos fagocitados.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La ruta secretora une al RER, el aparato de Golgi y la membrana plasmática. Una proteína recién sintetizada en el RER es transportada en vesículas al cis-Golgi, viaja hacia el trans-Golgi donde recibe modificaciones posttraduccionales (glucosilación, fosforilación) y finalmente es empaquetada en vesículas secretoras que se fusionan con la membrana plasmática. Todo este proceso tarda entre 20 y 60 minutos.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "George Palade, Albert Claude y Christian de Duve ganaron el Premio Nobel de Fisiología o Medicina en 1974 por descubrir la organización funcional de la célula mediante microscopía electrónica y fraccionamiento celular. De Duve descubrió los lisosomas al fraccionar células de hígado de rata y encontrar actividad de enzimas ácidas en una fracción inesperada.",
        },
      ],
    },
  },

  // ── 6 ── Biología celular — intermedio ───────────────────────────────────
  {
    slug: "cneyt-vi-biologia-celular-membrana-transporte",
    titulo: "Membrana plasmática y transporte celular: difusión, ósmosis y transporte activo",
    categoria: "Biología celular",
    conceptos_clave: ["membrana plasmática", "bicapa lipídica", "difusión", "ósmosis", "transporte activo"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La membrana plasmática es la frontera que separa la célula del entorno. Según el modelo del mosaico fluido (Singer y Nicolson, 1972), la membrana es una bicapa de fosfolípidos en la que las proteínas integrales están insertadas y pueden desplazarse lateralmente, como un mosaico flotando en un fluido bidimensional. Los fosfolípidos tienen cabeza hidrofílica (que se orienta hacia el agua) y cola hidrofóbica (que se oculta en el interior de la bicapa). Esta estructura es selectivamente permeable: deja pasar libremente moléculas pequeñas y no polares (O₂, CO₂) pero no iones ni moléculas polares grandes.",
        },
        {
          tipo: "subtitulo",
          contenido: "Tipos de transporte a través de la membrana",
        },
        {
          tipo: "lista",
          items: [
            "Difusión simple: movimiento de moléculas de alta a baja concentración sin consumo de energía. Ejemplo: O₂ entra y CO₂ sale de las células por difusión simple.",
            "Difusión facilitada: moléculas polares o iones cruzan la membrana a favor de su gradiente de concentración pero a través de proteínas canal o transportadoras. Ejemplo: glucosa entra a las células musculares por GLUT4.",
            "Ósmosis: difusión del agua a través de una membrana semipermeable desde donde hay menos solutos (hipotónico) hacia donde hay más (hipertónico). Fundamental en plantas: la turgencia celular se mantiene por ósmosis.",
            "Transporte activo: mueve moléculas en contra del gradiente de concentración consumiendo ATP. Ejemplo: la bomba Na+/K+ ATPasa expulsa 3 Na+ y entra 2 K+ por cada ATP, manteniendo el potencial de membrana de las neuronas.",
            "Endocitosis y exocitosis: transporte masivo de materiales por vesículas que se forman (endocitosis) o fusionan (exocitosis) con la membrana.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La diferencia entre transporte pasivo y activo es energética: el pasivo sigue el gradiente termodinámico (sin gastar ATP) y el activo va en contra de ese gradiente (requiere ATP). La bomba Na+/K+ consume aproximadamente un tercio del ATP total de una neurona en reposo para mantener los gradientes iónicos necesarios para los potenciales de acción.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "La ósmosis tiene consecuencias prácticas en la medicina y la agricultura. Los sueros intravenosos del IMSS son isotónicos (0.9% NaCl) para no causar lisis ni crenación de los glóbulos rojos. En agricultura, el riego excesivo con agua salobre puede deshidratar las raíces de los cultivos por ósmosis inversa, fenómeno frecuente en zonas áridas del norte de México.",
        },
      ],
    },
  },

  // ── 7 ── Biología celular — avanzado ─────────────────────────────────────
  {
    slug: "cneyt-vi-biologia-celular-ciclo-celular-mitosis-cancer",
    titulo: "Ciclo celular y mitosis: el control del ciclo y el cáncer como su fallo",
    categoria: "Biología celular",
    conceptos_clave: ["ciclo celular", "mitosis", "ciclinas", "CDK", "oncogenes", "genes supresores de tumor"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El ciclo celular es la secuencia ordenada de eventos que lleva a una célula desde su origen, por división de la célula madre, hasta su propia división. Se divide en dos grandes etapas: la interfase (G1, S, G2), durante la cual la célula crece y duplica su ADN, y la fase M (mitosis + citocinesis), durante la cual el ADN replicado se separa y la célula se divide en dos células hijas con el mismo número de cromosomas. El control preciso de este ciclo es esencial: errores en la regulación producen proliferación celular descontrolada, es decir, cáncer.",
        },
        {
          tipo: "subtitulo",
          contenido: "Las fases de la mitosis",
        },
        {
          tipo: "lista",
          items: [
            "Profase: la cromatina se condensa en cromosomas visibles; los centrosomas emigran a los polos; aparece el huso mitótico de microtúbulos.",
            "Prometafase: se rompe la envoltura nuclear; los microtúbulos del huso se fijan a los cinetocoros de los cromosomas.",
            "Metafase: los cromosomas se alinean en el plano ecuatorial (placa metafásica); punto de control: la célula verifica que todos los cinetocoros estén correctamente fijados.",
            "Anafase: las cromátidas hermanas se separan y migran a polos opuestos gracias a la depolimerización de los microtúbulos y la acción de proteínas motoras.",
            "Telofase y citocinesis: se forma la envoltura nuclear alrededor de cada conjunto de cromosomas; la célula se divide físicamente por un anillo contráctil de actomiosina.",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "El ciclo celular está regulado por proteínas ciclinas (cuya concentración oscila a lo largo del ciclo) y por quinasas dependientes de ciclinas (CDK). Los puntos de control (checkpoints) verifican que el ADN esté íntegro, que la replicación sea completa y que los cromosomas estén correctamente alineados antes de permitir que el ciclo avance. Las mutaciones en oncogenes (que aceleran la división) o en genes supresores de tumor como p53 (que frenan la división o inducen apoptosis) rompen este control y pueden provocar cáncer.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Según el IMSS, en 2023 el cáncer de mama, próstata, cervicouterino y de colon-recto son los más frecuentes en México. El cáncer cervicouterino, causado en la mayoría de los casos por el virus del papiloma humano (VPH), es un ejemplo donde un virus activa oncogenes (E6 y E7 del VPH inactivan p53 y Rb, supresores de tumor) provocando proliferación descontrolada del epitelio cervical. La vacunación contra el VPH, incluida en el esquema de vacunación del IMSS y la SSA, es la intervención más eficaz de prevención.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Leland Hartwell, Tim Hunt y Paul Nurse ganaron el Premio Nobel de Fisiología o Medicina en 2001 por descubrir las ciclinas y las CDK como reguladores clave del ciclo celular. Estos descubrimientos abrieron el campo de los medicamentos anticancerosos que inhiben específicamente CDK, como el palbociclib, usado en cáncer de mama avanzado.",
        },
      ],
    },
  },

  // ── 8 ── Metabolismo celular — básico ────────────────────────────────────
  {
    slug: "cneyt-vi-metabolismo-respiracion-celular-atp",
    titulo: "Respiración celular aeróbica: glucólisis, Krebs y fosforilación oxidativa",
    categoria: "Metabolismo celular",
    conceptos_clave: ["respiración celular aeróbica", "glucólisis", "ciclo de Krebs", "fosforilación oxidativa", "ATP"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La respiración celular aeróbica es el proceso por el cual las células obtienen energía química (en forma de ATP) a partir de la oxidación de glucosa en presencia de oxígeno. La ecuación resumen es: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + energía (≈ 36–38 ATP). Este proceso ocurre en tres etapas principales: glucólisis (en el citoplasma), ciclo de Krebs (en la matriz mitocondrial) y fosforilación oxidativa (en la membrana interna mitocondrial). El ATP producido es la moneda energética universal de la célula: su hidrólisis libera energía utilizable para todo trabajo celular.",
        },
        {
          tipo: "subtitulo",
          contenido: "Las tres etapas de la respiración aeróbica",
        },
        {
          tipo: "lista",
          items: [
            "Glucólisis: en el citosol; una molécula de glucosa (6C) se divide en 2 moléculas de piruvato (3C); rendimiento neto: 2 ATP y 2 NADH. No requiere O₂.",
            "Ciclo de Krebs (ciclo del ácido cítrico): en la matriz mitocondrial; el piruvato se convierte en acetil-CoA (2C) que entra al ciclo; por cada glucosa se producen 2 ATP, 8 NADH y 2 FADH₂; se liberan 4 CO₂.",
            "Fosforilación oxidativa: en la membrana interna mitocondrial; los electrones de NADH y FADH₂ recorren la cadena de transporte de electrones, bombeando H+ para crear un gradiente; la ATP sintasa usa ese gradiente para generar ≈ 32–34 ATP; el O₂ es el aceptor final de electrones, formando H₂O.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El ATP no se almacena en grandes cantidades en las células; se regenera continuamente. Un adulto en reposo produce y consume aproximadamente su peso corporal en ATP al día (≈ 40 kg de ATP). En ejercicio intenso, la demanda puede superar 500 g de ATP por minuto, lo que exige glucólisis acelerada y, si el O₂ no es suficiente, fermentación láctica.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Hans Krebs recibió el Premio Nobel de Fisiología o Medicina en 1953 por descubrir el ciclo que lleva su nombre. La elegancia del ciclo radica en que regenera el oxaloacetato necesario para recibir el siguiente acetil-CoA, funcionando de manera continua mientras haya combustible disponible. El mismo ciclo opera en bacterias, hongos, plantas y animales: evidencia de su origen ancestral.",
        },
      ],
    },
  },

  // ── 9 ── Metabolismo celular — intermedio ────────────────────────────────
  {
    slug: "cneyt-vi-metabolismo-fotosintesis-milpa-mesoamerica",
    titulo: "Fotosíntesis: reacciones de luz, ciclo de Calvin y la milpa mesoamericana",
    categoria: "Metabolismo celular",
    conceptos_clave: ["fotosíntesis", "clorofila", "reacciones de luz", "ciclo de Calvin", "milpa mesoamericana"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La fotosíntesis es el proceso mediante el cual las plantas, algas y cianobacterias capturan la energía luminosa del Sol y la convierten en energía química almacenada en glucosa. La ecuación general es: 6CO₂ + 6H₂O + energía luminosa → C₆H₁₂O₆ + 6O₂. La fotosíntesis ocurre en los cloroplastos y se divide en dos conjuntos de reacciones: las reacciones de luz (en las membranas de los tilacoides) y el ciclo de Calvin o reacciones en la oscuridad (en el estroma del cloroplasto).",
        },
        {
          tipo: "subtitulo",
          contenido: "Reacciones de luz y ciclo de Calvin",
        },
        {
          tipo: "lista",
          items: [
            "Reacciones de luz: los fotosistemas II y I absorben fotones con clorofila; el PSII disocia el agua (2H₂O → 4H+ + 4e- + O₂); los electrones fluyen por la cadena de transporte generando un gradiente de H+ que produce ATP; el PSI reduce el NADP+ a NADPH.",
            "Ciclo de Calvin (3 etapas): fijación del CO₂ por la enzima RuBisCO que une CO₂ al ribulosa-1,5-bifosfato (RuBP); reducción usando ATP y NADPH para producir gliceraldehído-3-fosfato (G3P); regeneración del RuBP para que el ciclo continúe.",
            "Por cada 3 CO₂ fijados se produce un G3P neto, que puede usarse para sintetizar glucosa, sacarosa, almidón u otros compuestos orgánicos.",
            "Las plantas C4 (como el maíz) tienen un mecanismo adicional de concentración de CO₂ que las hace más eficientes en climas cálidos y secos.",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "La milpa es el sistema de cultivo tradicional mesoamericano que combina maíz (Zea mays), frijol (Phaseolus vulgaris) y calabaza (Cucurbita sp.) en el mismo terreno. Este sistema aprovecha la complementariedad fotosintética de las tres plantas: el maíz, planta C4, es altamente eficiente en la captura de CO₂; el frijol, leguminosa, fija nitrógeno atmosférico a través de bacterias Rhizobium en sus raíces, fertilizando el suelo; la calabaza cubre el suelo con sus hojas grandes, reduciendo la evaporación y el crecimiento de maleza.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "La milpa ha sostenido a las civilizaciones mesoamericanas durante más de 7 000 años. La domesticación del maíz a partir del teocintle (Zea mays ssp. parviglumis) en el Balsas, Guerrero, hace ≈ 9 000 años, es uno de los eventos más importantes en la historia de la agricultura mundial. El maíz es hoy el cereal más producido en el planeta, base de millones de toneladas de fotosíntesis diaria que sustentan la cadena alimentaria global.",
        },
      ],
    },
  },

  // ── 10 ── Metabolismo celular — avanzado ─────────────────────────────────
  {
    slug: "cneyt-vi-metabolismo-fermentacion-pulque-mezcal",
    titulo: "Fermentación alcohólica y láctica: pulque, tepache y mezcal artesanal",
    categoria: "Metabolismo celular",
    conceptos_clave: ["fermentación alcohólica", "fermentación láctica", "levaduras", "NAD+", "biotecnología tradicional"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La fermentación es un proceso de obtención de energía que ocurre en ausencia de oxígeno (anaerobiosis). Al igual que la glucólisis, la fermentación degrada glucosa a piruvato produciendo 2 ATP netos. Sin embargo, sin oxígeno el NADH producido en la glucólisis no puede ser reoxidado por la cadena de transporte de electrones. Para regenerar el NAD+ necesario y poder continuar la glucólisis, la célula convierte el piruvato en un producto de desecho: etanol (fermentación alcohólica) o lactato (fermentación láctica).",
        },
        {
          tipo: "subtitulo",
          contenido: "Fermentación alcohólica y láctica: comparación",
        },
        {
          tipo: "lista",
          items: [
            "Fermentación alcohólica: piruvato → acetaldehído (por piruvato descarboxilasa, que libera CO₂) → etanol (por alcohol deshidrogenasa, que reoxida NADH a NAD+). Realizada por levaduras (Saccharomyces cerevisiae) y algunas bacterias.",
            "Fermentación láctica: piruvato → lactato (por lactato deshidrogenasa, que reoxida NADH a NAD+). Realizada por bacterias lácticas (Lactobacillus, Streptococcus) y por músculos humanos durante ejercicio intenso cuando el O₂ es insuficiente.",
            "En ambos casos, el objetivo metabólico principal es regenerar NAD+ para poder continuar la glucólisis y producir ATP.",
            "Rendimiento energético: fermentación = 2 ATP / glucosa (vs. 36–38 ATP en respiración aeróbica).",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "México posee una riqueza extraordinaria de bebidas fermentadas tradicionales que son biotecnología ancestral. El pulque se obtiene de la fermentación del aguamiel del maguey (Agave salmiana y otras especies) por una comunidad microbiana compleja que incluye bacterias lácticas, levaduras y otras especies. El tepache es la fermentación de la cáscara de piña con piloncillo. El mezcal artesanal de Oaxaca —Denominación de Origen protegida— usa distintas variedades de agave fermentadas con levaduras silvestres autóctonas de cada región, lo que da su perfil de sabor único; cada maestro mezcalero trabaja con microbiomas locales distintos.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El ácido láctico producido durante el ejercicio intenso en los músculos humanos es la causa del ardor muscular. El corazón puede usar lactato como combustible durante el esfuerzo, convirtiéndolo de vuelta a piruvato y entrando al ciclo de Krebs. Este intercambio entre músculo esquelético y corazón se llama ciclo de Cori (entre músculo e hígado) y es fundamental para mantener el suministro de glucosa durante el ejercicio.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "El mezcal artesanal de Oaxaca usa en muchas comunidades el método de fermentación en tinas de madera de encino abiertos al ambiente, capturando levaduras y bacterias silvestres locales. Cada región —Miahuatlán, Santiago Matatlán, San Baltazar Guelavila— tiene comunidades microbianas distintas que definen el terruño del mezcal, concepto análogo al terroir vinícola francés, pero mucho más antiguo.",
        },
      ],
    },
  },

  // ── 11 ── ADN y genética mendeliana — básico ─────────────────────────────
  {
    slug: "cneyt-vi-adn-estructura-doble-helice",
    titulo: "Estructura del ADN: doble hélice, nucleótidos y complementariedad de bases",
    categoria: "ADN y genética mendeliana",
    conceptos_clave: ["ADN", "doble hélice", "nucleótido", "complementariedad de bases", "Watson-Crick"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El ácido desoxirribonucleico (ADN) es la molécula que almacena la información genética en todos los organismos celulares. Su estructura de doble hélice fue propuesta en 1953 por James Watson y Francis Crick, basándose en los patrones de difracción de rayos X de Rosalind Franklin y en los datos de Erwin Chargaff. El ADN consiste en dos cadenas antiparalelas de nucleótidos enrolladas en hélice. Cada nucleótido se compone de: un azúcar desoxirribosa (5 carbonos), un grupo fosfato y una de las cuatro bases nitrogenadas (adenina, timina, guanina o citosina).",
        },
        {
          tipo: "subtitulo",
          contenido: "Complementariedad de bases y antiparalelismo",
        },
        {
          tipo: "lista",
          items: [
            "Reglas de Chargaff: en cualquier especie, la cantidad de adenina (A) siempre es igual a la de timina (T), y la de guanina (G) igual a la de citosina (C). Esto refleja el emparejamiento de bases complementarias.",
            "Puentes de hidrógeno: A-T forman 2 puentes de hidrógeno; G-C forman 3 puentes de hidrógeno. Por eso el ADN rico en G-C es más estable térmicamente.",
            "Antiparalelismo: las dos cadenas corren en direcciones opuestas; una va 5 a 3 y la otra 3 a 5. La numeración se refiere al carbono del azúcar al que se une el fosfato o el siguiente nucleótido.",
            "La secuencia de bases en una cadena determina completamente la secuencia de la cadena complementaria: propiedad que posibilita la replicación semiconservativa del ADN.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El genoma humano haploide contiene aproximadamente 3 000 millones de pares de bases distribuidos en 23 cromosomas. Si se estirara todo el ADN de una sola célula humana (diploide, 46 cromosomas), mediría aproximadamente 2 metros. Para caber en el núcleo de 6 µm de diámetro, el ADN se empaqueta en nucleosomas (ADN enrollado en histonas), solenoides y dominios de bucle, compactándose unas 10 000 veces.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Rosalind Franklin produjo la fotografía 51 de difracción de rayos X del ADN en 1952, que fue la clave para que Watson y Crick dedujeran la estructura de doble hélice. Franklin no fue incluida en el Premio Nobel de 1962 (que recibieron Watson, Crick y Wilkins) porque había fallecido en 1958 y el premio no se otorga póstumamente. Su contribución fue fundamental y durante décadas estuvo subvalorada.",
        },
      ],
    },
  },

  // ── 12 ── ADN y genética mendeliana — básico ─────────────────────────────
  {
    slug: "cneyt-vi-genetica-leyes-mendel-maices-mexicanos",
    titulo: "Leyes de Mendel: dominancia, segregación y la variedad de maíces mexicanos",
    categoria: "ADN y genética mendeliana",
    conceptos_clave: ["leyes de Mendel", "dominancia", "segregación", "distribución independiente", "maíces mexicanos"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Gregor Mendel, monje austriaco, descubrió los principios de la herencia entre 1856 y 1863 al cruzar variedades de chícharo (Pisum sativum) en el jardín de su monasterio. Sus resultados, publicados en 1866 y redescubiertos en 1900, son el fundamento de la genética moderna. Mendel formuló tres leyes: la ley de la dominancia (en un cruce de dos caracteres puros, uno domina sobre el otro), la ley de la segregación (los factores hereditarios se separan durante la formación de gametos) y la ley de la distribución independiente (genes en cromosomas distintos se distribuyen independientemente).",
        },
        {
          tipo: "subtitulo",
          contenido: "Los cuadros de Punnett y la herencia en el maíz mexicano",
        },
        {
          tipo: "lista",
          items: [
            "Cruce monohibrido: Aa x Aa → 1/4 AA, 2/4 Aa, 1/4 aa. Proporción fenotípica 3:1 (3 dominante : 1 recesivo).",
            "Cruce dihibrido: AaBb x AaBb → proporción fenotípica 9:3:3:1 para dos genes en cromosomas distintos.",
            "La dominancia no siempre es completa: en codominancia (ej. grupo sanguíneo AB) ambos alelos se expresan. En dominancia incompleta, el heterocigoto tiene un fenotipo intermedio.",
            "La ley de distribución independiente solo aplica para genes en cromosomas distintos o muy separados en el mismo cromosoma; genes cercanos tienden a heredarse juntos (ligamiento).",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "México es el centro de origen y diversidad del maíz, con más de 64 razas nativas reconocidas (azul, rojo, negro, blanco, amarillo, morado, cacahuazintle, olotillo, entre muchas otras). Esta diversidad de colores refleja diferencias genéticas en genes que controlan la síntesis de antocianinas (pigmentos rojos/morados), carotenoides (amarillo/naranja) y la ausencia de pigmentos (blanco). La variedad de maíces mexicanos es un patrimonio genético invaluable que ilustra los principios mendelianos operando a lo largo de milenios de selección artificial por los pueblos originarios.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "El color azul-morado del maíz azul (Zea mays L. var. azul) es resultado de la expresión de genes que codifican enzimas para la síntesis de antocianinas: pigmentos flavonoides con propiedades antioxidantes. Estos maíces son fundamentales en la cocina oaxaqueña y mixteca. La UNAM y el INIFAP mantienen bancos de germoplasma con miles de accesiones de maíces nativos para preservar esta diversidad ante la amenaza de homogeneización genética por las variedades híbridas comerciales.",
        },
      ],
    },
  },

  // ── 13 ── ADN y genética mendeliana — intermedio ─────────────────────────
  {
    slug: "cneyt-vi-genetica-transcripcion-traduccion-codigo",
    titulo: "Del ADN a la proteína: transcripción, traducción y código genético",
    categoria: "ADN y genética mendeliana",
    conceptos_clave: ["transcripción", "traducción", "código genético", "ARNm", "ribosoma"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El dogma central de la biología molecular establece el flujo de información genética: ADN → ARN → proteína. La transcripción es la síntesis de ARN mensajero (ARNm) a partir de la secuencia de ADN, catalizada por la ARN polimerasa en el núcleo celular. La traducción es la decodificación del ARNm por los ribosomas para sintetizar una cadena de aminoácidos (proteína). El código genético es el conjunto de reglas que especifica qué triplete de nucleótidos (codón) del ARNm corresponde a cada aminoácido.",
        },
        {
          tipo: "subtitulo",
          contenido: "El código genético: características clave",
        },
        {
          tipo: "lista",
          items: [
            "Tripletes: cada codón consiste en 3 bases consecutivas del ARNm. Con 4 bases posibles en cada posición, hay 4³ = 64 codones posibles.",
            "64 codones para 20 aminoácidos: el código es redundante (degenerado). La mayoría de los aminoácidos tiene más de un codón sinónimo; los 3 codones de terminación (UAA, UAG, UGA) no codifican aminoácido sino señalan el fin de la cadena.",
            "AUG: el codón de inicio; codifica metionina y señala dónde comienza la traducción.",
            "El código genético es casi universal: idéntico en bacterias, hongos, plantas y animales, con pocas excepciones. Esto es evidencia de que todos los organismos actuales descienden de un ancestro común.",
            "ARNt: moléculas de ARN de transferencia con un anticodón que reconoce el codón del ARNm y un extremo 3 que porta el aminoácido correspondiente; son el adaptador entre el lenguaje nucleotídico y el aminoacídico.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Una mutación de un solo nucleótido en el codón puede: (1) cambiar un aminoácido por otro (mutación de sentido erróneo); (2) no cambiar el aminoácido por la redundancia del código (mutación silenciosa); (3) crear un codón de terminación prematuro (mutación sin sentido), truncando la proteína. La anemia de células falciformes es causada por una mutación de sentido erróneo: GAG→GTG en el gen de la beta-globina, cambiando glutamato por valina en la posición 6.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Marshall Nirenberg y Har Gobind Khorana descifraron el código genético entre 1961 y 1966. Nirenberg sintetizó ARNm artificial de una sola base repetida (poli-U) y lo usó en sistemas de traducción in vitro para descubrir que UUU codifica fenilalanina. Este trabajo les valió el Premio Nobel de Fisiología o Medicina en 1968 junto con Robert Holley.",
        },
      ],
    },
  },

  // ── 14 ── ADN y genética mendeliana — avanzado ───────────────────────────
  {
    slug: "cneyt-vi-genetica-genomica-inmegen-mexico",
    titulo: "Genómica y diversidad genética del pueblo mexicano: el INMEGEN",
    categoria: "ADN y genética mendeliana",
    conceptos_clave: ["genómica", "Proyecto Genoma Humano", "INMEGEN", "diversidad genética", "variantes genéticas mexicanas"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El Proyecto Genoma Humano (PGH), completado en 2003, fue un esfuerzo internacional de 13 años que secuenció los ≈ 3 000 millones de pares de bases del genoma humano haploide. El PGH reveló que los humanos compartimos el 99.9% de nuestra secuencia de ADN; el 0.1% de variación incluye millones de polimorfismos de un solo nucleótido (SNP) que determinan predisposición a enfermedades, respuesta a medicamentos y diferencias fenotípicas como el color de piel o los grupos sanguíneos. La genómica es el estudio sistemático de genomas completos.",
        },
        {
          tipo: "subtitulo",
          contenido: "El INMEGEN y el genoma del pueblo mexicano",
        },
        {
          tipo: "parrafo",
          contenido:
            "El Instituto Nacional de Medicina Genómica (INMEGEN), creado en 2004 y ubicado en la Ciudad de México, fue el primer instituto de investigación genómica de América Latina. En 2009 publicó el primer mapa de diversidad genómica del pueblo mexicano mestizo, analizando más de 1 million de SNP en individuos de 7 estados. Sus hallazgos mostraron que los mexicanos tienen un genoma único: mezcla de componentes amerindios (predominante en estados del sur como Guerrero y Oaxaca), europeos (mayor en el norte, como Sonora) y en menor medida africanos (costa del Golfo). Esta diversidad genética determina que las frecuencias de variantes asociadas a enfermedades como diabetes tipo 2, obesidad y ciertas cardiopatías son distintas en la población mexicana respecto a las poblaciones europeas en que se basan la mayoría de los estudios farmacogenómicos.",
        },
        {
          tipo: "lista",
          items: [
            "Diabetes tipo 2: México tiene una de las prevalencias más altas del mundo (≈ 14% según ENSANUT 2022). El INMEGEN ha identificado variantes genéticas en genes como TCF7L2 y SLC16A11 que confieren mayor riesgo en mexicanos.",
            "Farmacogenómica: variantes en el gen CYP2C19 afectan el metabolismo de anticoagulantes como el clopidogrel; su frecuencia difiere entre poblaciones mexicanas y europeas, con implicaciones para la dosificación.",
            "Medicina de precisión: el objetivo del INMEGEN es desarrollar tratamientos médicos adaptados al perfil genómico de los pacientes mexicanos, no basados en estudios de poblaciones extranjeras.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La secuenciación masiva del ADN tiene implicaciones éticas: privacidad genética, riesgo de discriminación genética en seguros o empleos, y la propiedad de los datos genómicos. En México, el INMEGEN trabaja bajo protocolos de consentimiento informado y la Ley General de Salud regula el uso de información genética. El debate sobre quién es propietario del genoma de un individuo es una de las grandes preguntas de la bioética contemporánea.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "El costo de secuenciar un genoma humano completo ha caído de 3 000 millones de dólares en 2003 a menos de 200 dólares en 2025, siguiendo una curva de reducción de costos más rápida que la Ley de Moore. Esta democratización de la secuenciación hace que la medicina genómica personalizada esté cada vez más al alcance de los sistemas de salud públicos como el IMSS.",
        },
      ],
    },
  },

  // ── 15 ── Mutaciones y evolución — básico ────────────────────────────────
  {
    slug: "cneyt-vi-mutaciones-tipos-puntual-cromosomica",
    titulo: "Tipos de mutaciones: puntual, inserción-deleción, cromosómica y sus efectos",
    categoria: "Mutaciones y evolución",
    conceptos_clave: ["mutación puntual", "inserción", "deleción", "mutación cromosómica", "mutación neutra"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Una mutación es cualquier cambio en la secuencia de nucleótidos del ADN. Las mutaciones pueden ocurrir espontáneamente (durante la replicación del ADN) o ser inducidas por agentes mutagénicos (radiación UV, rayos X, ciertas sustancias químicas). No todas las mutaciones son perjudiciales: la mayoría son neutras (no afectan la función de la proteína), algunas son beneficiosas (aumentan la aptitud biológica) y solo una minoría son dañinas. Las mutaciones son la fuente última de toda la variación genética sobre la que actúa la selección natural.",
        },
        {
          tipo: "subtitulo",
          contenido: "Clasificación de las mutaciones",
        },
        {
          tipo: "lista",
          items: [
            "Mutación puntual (sustitución): un nucleótido es reemplazado por otro. Puede ser de transición (purina por purina, o pirimidina por pirimidina) o de transversión (purina por pirimidina o viceversa).",
            "Inserción: uno o más nucleótidos extras se insertan en la secuencia. Si el número insertado no es múltiplo de 3, provoca un cambio de marco de lectura (frameshift) que altera todos los aminoácidos subsecuentes.",
            "Deleción: uno o más nucleótidos son eliminados de la secuencia. Al igual que la inserción, si no es múltiplo de 3 causa un cambio de marco de lectura.",
            "Mutación cromosómica: cambios en la estructura o número de cromosomas. Incluyen deleciones (pérdida de fragmento), duplicaciones, inversiones y translocaciones de segmentos cromosómicos. Ejemplo: la deleción del cromosoma 5 causa el síndrome del maullido de gato.",
            "Aneuploidía: número anormal de cromosomas. El síndrome de Down (trisomía 21) resulta de tener 3 copias del cromosoma 21.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Las mutaciones somáticas (en células del cuerpo que no son gametos) solo afectan al individuo que las porta y no se transmiten a la descendencia. Las mutaciones germinales (en células germinales: espermatozoides u óvulos) pueden transmitirse a los hijos. Las enfermedades genéticas hereditarias son causadas por mutaciones germinales. El cáncer, en cambio, es generalmente causado por la acumulación de mutaciones somáticas en genes del ciclo celular.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "La tasa de mutación espontánea en el genoma humano es de aproximadamente 1–2 mutaciones nuevas por cada 100 millones de pares de bases por generación. Con 3 000 millones de pares de bases, cada persona tiene unas 30–60 mutaciones de novo (nuevas, no heredadas de sus padres) en su genoma. La mayoría caen en regiones no codificantes y no tienen efecto detectable.",
        },
      ],
    },
  },

  // ── 16 ── Mutaciones y evolución — intermedio ────────────────────────────
  {
    slug: "cneyt-vi-seleccion-natural-resistencia-antibioticos",
    titulo: "Selección natural y adaptación: resistencia a antibióticos en hospitales del IMSS",
    categoria: "Mutaciones y evolución",
    conceptos_clave: ["selección natural", "adaptación", "resistencia a antibióticos", "Darwin", "evolución observada"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Charles Darwin propuso la teoría de la evolución por selección natural en 1859 en su obra El origen de las especies. Los cuatro postulados de Darwin son: (1) existe variación heredable en las poblaciones; (2) más individuos nacen de los que pueden sobrevivir; (3) la supervivencia no es al azar, sino que depende de los rasgos del individuo; (4) los individuos mejor adaptados dejan más descendencia, por lo que sus rasgos aumentan en frecuencia en la siguiente generación. La selección natural no produce cambios en individuos, sino cambios en las frecuencias génicas de las poblaciones a lo largo de generaciones.",
        },
        {
          tipo: "subtitulo",
          contenido: "Resistencia a antibióticos: la evolución en tiempo real",
        },
        {
          tipo: "parrafo",
          contenido:
            "La resistencia bacteriana a los antibióticos es uno de los ejemplos más claros y urgentes de selección natural operando en tiempo real. Cuando se administra un antibiótico (como amoxicilina o ciprofloxacino) a una población de bacterias, la mayoría muere, pero los raros individuos que poseen mutaciones que confieren resistencia sobreviven y se reproducen. En unas pocas generaciones (las bacterias se dividen cada 20–30 minutos) la cepa resistente puede dominar la población. No es el antibiótico el que crea la mutación: la mutación ya existía a baja frecuencia antes del tratamiento, y el antibiótico simplemente seleccionó a los individuos resistentes.",
        },
        {
          tipo: "lista",
          items: [
            "Mecanismos de resistencia: producción de enzimas que inactivan el antibiótico (ej. beta-lactamasas que destruyen la penicilina); modificación del sitio blanco del antibiótico; bombas de eflujo que expulsan el antibiótico de la célula.",
            "Transferencia horizontal de genes: las bacterias pueden compartir genes de resistencia entre sí mediante plásmidos, sin necesidad de reproducirse. Esto acelera enormemente la difusión de la resistencia.",
            "Resistencia múltiple: cepas de Staphylococcus aureus resistente a meticilina (MRSA) y Klebsiella pneumoniae productora de carbapenemasas (KPC) son especialmente temibles en hospitales.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "En los hospitales del IMSS, la resistencia bacteriana es un problema creciente. Según el IMSS, las infecciones asociadas a la atención de la salud (IAAS) por bacterias multirresistentes afectan a decenas de miles de pacientes al año en México. El uso excesivo e inadecuado de antibióticos en humanos, animales y agricultura es el principal motor de la resistencia. La OMS declara la resistencia antimicrobiana como una de las 10 mayores amenazas para la salud global.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Los pinzones de Darwin en las islas Galápagos son el ejemplo clásico de selección natural y adaptación. Sus picos presentan enormes variaciones según la fuente de alimento disponible en cada isla: picos fuertes para romper semillas duras, picos delgados para extraer insectos de cortezas, picos en forma de llave para alimentarse de cactus. Todos descienden de una sola especie ancestral que llegó del continente sudamericano hace ≈ 2–3 millones de años.",
        },
      ],
    },
  },

  // ── 17 ── Mutaciones y evolución — intermedio ────────────────────────────
  {
    slug: "cneyt-vi-vaquita-marina-cuello-botella-genetico",
    titulo: "Deriva genética y la vaquita marina: el cuello de botella más extremo del mundo",
    categoria: "Mutaciones y evolución",
    conceptos_clave: ["deriva genética", "cuello de botella", "efecto fundador", "vaquita marina", "Phocoena sinus"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La deriva genética es el cambio en las frecuencias alélicas de una población causado por el azar, no por la selección natural. En poblaciones grandes, el azar tiene poco efecto porque las frecuencias se promedian. En poblaciones pequeñas, el azar puede cambiar drásticamente las frecuencias génicas en pocas generaciones, pudiendo fijar alelos dañinos o eliminar alelos beneficiosos. Dos mecanismos de deriva genética son especialmente importantes: el efecto cuello de botella y el efecto fundador.",
        },
        {
          tipo: "subtitulo",
          contenido: "El efecto cuello de botella y el efecto fundador",
        },
        {
          tipo: "lista",
          items: [
            "Efecto cuello de botella: una catástrofe reduce drásticamente el tamaño de la población. Los sobrevivientes son solo una muestra aleatoria de la variabilidad original, con menor diversidad genética. La escasa variabilidad genética del guepardo (Acinonyx jubatus) se debe a un cuello de botella severo hace ≈ 10 000 años.",
            "Efecto fundador: una subpoblación pequeña coloniza un nuevo territorio. Los fundadores llevan solo una fracción de la variabilidad genética original. Las poblaciones de humanos en islas oceánicas y los amish de Pensilvania son ejemplos con alta frecuencia de enfermedades genéticas raras debida al efecto fundador.",
            "Pérdida de heterocigosidad: en poblaciones pequeñas, la probabilidad de apareamiento entre parientes aumenta (endogamia), elevando la homocigosidad y expresando alelos recesivos dañinos.",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "La vaquita marina (Phocoena sinus) es la marsopa más pequeña del mundo y el mamífero marino más amenazado del planeta. Endémica del norte del Golfo de California, México, su población se ha desplomado de ≈ 600 individuos en 1997 a menos de 10 en 2024. La causa principal es la captura incidental en redes de enmalle usadas para pescar totoaba (Totoaba macdonaldi), pez cuya vejiga natatoria se trafica ilegalmente hacia China. La vaquita representa un caso extremo de cuello de botella genético.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Paradójicamente, estudios genómicos recientes (2022) del Instituto de Ecología de la UNAM y el Centro de Investigación Científica y de Educación Superior de Ensenada (CICESE) mostraron que la vaquita marina tiene menos variantes genéticas dañinas de lo esperado para una población tan pequeña. Los científicos atribuyen esto a que la población ha sido pequeña durante mucho tiempo, lo que permitió que la selección purificadora eliminara gradualmente los alelos más perjudiciales. Sin embargo, con menos de 10 individuos la extinción es casi inevitable sin una intervención urgente.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "El programa VaquitaCPR (Conservation, Protection and Recovery) intentó en 2017 capturar vaquitas para mantenerlas en un santuario protegido. Sin embargo, los animales sufrieron estrés severo al ser capturados y el programa se suspendió. Hoy la única estrategia es la protección absoluta de su hábitat: eliminación de redes de enmalle en la zona de refugio del Alto Golfo de California, una batalla contra el crimen organizado transnacional.",
        },
      ],
    },
  },

  // ── 18 ── Mutaciones y evolución — avanzado ──────────────────────────────
  {
    slug: "cneyt-vi-axolote-especiacion-filogenia",
    titulo: "Especiación y filogenia: el axolote de Xochimilco como especie neotónica amenazada",
    categoria: "Mutaciones y evolución",
    conceptos_clave: ["especiación", "filogenia", "neotenia", "axolote", "Ambystoma mexicanum"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La especiación es el proceso por el cual una especie ancestral da origen a dos o más especies nuevas. Existen dos modelos principales: la anagenesis, en que toda la población ancestral se transforma gradualmente en una nueva especie sin ramificarse; y la cladogénesis, en que la especie ancestral se divide en dos o más linajes que evolucionan de manera independiente. Los árboles filogenéticos (o cladogramas) representan las relaciones evolutivas entre grupos de organismos: cada nodo interior representa un ancestro común, y la longitud de las ramas puede indicar el grado de divergencia molecular.",
        },
        {
          tipo: "subtitulo",
          contenido: "Neotenia y el axolote mexicano",
        },
        {
          tipo: "parrafo",
          contenido:
            "El axolote (Ambystoma mexicanum) es un anfibio salamándrico endémico del lago de Xochimilco y el lago Chalco en la cuenca de México, CDMX. Es famoso por su neotenia: retiene características larvales (branquias externas, aleta dorsal, piel acuática) durante toda su vida adulta y puede reproducirse en estado larval sin metamorfosear. Esta es una forma de heterocronia (cambio evolutivo en el tiempo del desarrollo). Si se le administra tiroxina (hormona tiroidea), puede metamorfosear en una salamandra terrestre, lo que indica que la neotenia es resultado de una reducida sensibilidad a la tiroxina, no de la incapacidad genética de metamorfosear.",
        },
        {
          tipo: "lista",
          items: [
            "Taxonomía: Ambystoma mexicanum pertenece a la familia Ambystomatidae, nativa de América del Norte. Su ancestro más cercano no neotónico es el tigre salamandra (Ambystoma tigrinum).",
            "Investigación biomédica: el axolote tiene capacidad de regeneración extraordinaria; puede regenerar extremidades completas, partes del corazón, porciones del cerebro e incluso médula espinal. Investigado por grupos de la UNAM para entender los mecanismos moleculares de la regeneración.",
            "Amenaza: la urbanización de la cuenca de México ha reducido el hábitat de Xochimilco a chinampa fragmentadas y contaminadas. La introducción de carpas y tilapias africanas depreda huevos y larvas. Se estima que la densidad poblacional ha caído de 6 000 axolotes/km² en 1998 a menos de 100/km² en 2014.",
            "Conservación: el Instituto de Biología de la UNAM lidera programas de reproducción en cautiverio y restauración del hábitat en Xochimilco. El axolote es símbolo de la biodiversidad amenazada de la CDMX.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Los árboles filogenéticos se construyen comparando secuencias de ADN (o de aminoácidos de proteínas) entre organismos. A mayor similitud de secuencia, más cercano el parentesco evolutivo. El gen COI (citocromo c oxidasa subunidad I) mitocondrial se usa como código de barras genético (DNA barcoding) para identificar especies animales; el axolote tiene una secuencia COI única que lo distingue de todas las demás salamandras.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "La palabra axolote proviene del náhuatl: atl (agua) y xolotl (monstruo o sirviente); asociado al dios Xólotl, perro guía de los muertos al inframundo, quien adoptó la forma de axolote para cruzar el lago Mictlan. En la cosmogonía mexica, el axolote tiene un significado profundo: la transformación sin transformarse. Esta dualidad biológica y simbólica lo convierte en un emblema único de México.",
        },
      ],
    },
  },

  // ── 19 ── Biotecnología y bioética — básico ──────────────────────────────
  {
    slug: "cneyt-vi-biotecnologia-tradicional-moderna-tortilla",
    titulo: "Biotecnología tradicional y moderna: de la tortilla de maíz al CRISPR",
    categoria: "Biotecnología y bioética",
    conceptos_clave: ["biotecnología", "fermentación", "selección artificial", "transgénicos", "CRISPR"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La biotecnología es el uso de sistemas biológicos (organismos, células, moléculas) para desarrollar productos y procesos útiles para la humanidad. La biotecnología no es nueva: los seres humanos la practican desde hace milenios. La nixtamalización del maíz, proceso mesoamericano de ≈ 3 500 años de antigüedad, es biotecnología ancestral: el maíz cocido en agua con cal (hidróxido de calcio) mejora su valor nutricional al liberar la niacina (vitamina B3) de las proteínas que la atrapan, y hace más digeribles las proteínas del endospermo. Sin nixtamalización, las civilizaciones que dependían del maíz sufrían pellagra por deficiencia de niacina.",
        },
        {
          tipo: "subtitulo",
          contenido: "Biotecnología tradicional vs biotecnología moderna",
        },
        {
          tipo: "lista",
          items: [
            "Biotecnología tradicional: fermentación (pan, cerveza, queso, pulque, mezcal); selección artificial de cultivos (domesticación del maíz, trigo, arroz); cruzamiento selectivo de animales. Usa procesos biológicos naturales sin manipulación directa del ADN.",
            "Biotecnología moderna clásica: incluye la tecnología del ADN recombinante (décadas de 1970–1980); producción de insulina humana en bacterias E. coli modificadas (desde 1982); antibióticos producidos por hongos y bacterias cultivados industrialmente.",
            "Organismos genéticamente modificados (OGM): organismos con genes de otras especies introducidos en su genoma. Ejemplo: maíz Bt (con gen de la bacteria Bacillus thuringiensis que produce una proteína insecticida) o soya resistente a herbicida glifosato.",
            "Biotecnología de nueva generación: edición genómica de precisión (CRISPR-Cas9, desde 2012); terapia génica; vacunas de ARNm (COVID-19); biología sintética.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "La tortilla de maíz nixtamalizado es posiblemente la biotecnología alimentaria más antigua del hemisferio occidental. La nixtamalización no solo mejora el valor nutricional: modifica la textura de la masa (masa nixtamalizada es maleable para hacer tortillas), actúa como conservante al aumentar el pH y añade calcio (importante para los huesos). La UNESCO reconoció en 2010 la cocina tradicional mexicana como Patrimonio Cultural Inmaterial de la Humanidad, en parte por la centralidad del maíz nixtamalizado.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La distinción entre organismos genéticamente modificados (OGM, o transgénicos) y organismos editados genómicamente (por CRISPR) es un debate regulatorio y ético actual. Los OGM introducen genes de otras especies; la edición por CRISPR puede simplemente modificar un gen ya existente sin introducir ADN foráneo. Varios países regulan estos dos tipos de organismos de manera diferente.",
        },
      ],
    },
  },

  // ── 20 ── Biotecnología y bioética — intermedio ──────────────────────────
  {
    slug: "cneyt-vi-crispr-cas9-edicion-genomica",
    titulo: "CRISPR-Cas9: edición genómica de precisión e investigación en el CINVESTAV",
    categoria: "Biotecnología y bioética",
    conceptos_clave: ["CRISPR-Cas9", "edición genómica", "ARNg", "nucleasa", "CINVESTAV"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "CRISPR-Cas9 (Clustered Regularly Interspaced Short Palindromic Repeats + proteína Cas9) es un sistema de edición genómica derivado del sistema inmune adaptativo de las bacterias. Las bacterias usan fragmentos de ADN viral (almacenados en regiones CRISPR de su genoma) para reconocer y destruir ADN viral en infecciones futuras. Jennifer Doudna y Emmanuelle Charpentier adaptaron este sistema para editar ADN de cualquier organismo, trabajo que les valió el Premio Nobel de Química en 2020. CRISPR-Cas9 es la herramienta de edición genómica más precisa, versátil y económica de la historia.",
        },
        {
          tipo: "subtitulo",
          contenido: "Mecanismo de acción del sistema CRISPR-Cas9",
        },
        {
          tipo: "lista",
          items: [
            "ARN guía (ARNg): una molécula de ARN de ≈ 20 nucleótidos diseñada para ser complementaria al gen diana en el genoma del organismo objetivo.",
            "Proteína Cas9: nucleasa (enzima que corta ADN) que forma un complejo con el ARNg. El complejo escanea el genoma buscando la secuencia complementaria al ARNg.",
            "Corte de doble cadena: cuando el ARNg reconoce su secuencia diana, la Cas9 hace un corte de doble cadena en el ADN. La célula repara este corte mediante dos mecanismos: unión de extremos no homólogos (NHEJ, que introduce pequeñas inserciones/deleciones, inactivando el gen) o recombinación homóloga (HDR, que puede corregir el gen si se provee una plantilla de reparación).",
            "Especificidad: CRISPR puede editar un gen específico entre los 3 000 millones de pares de bases del genoma humano con una precisión superior al 99%, aunque existen cortes fuera del objetivo (off-target) que deben minimizarse.",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "En México, el CINVESTAV (Centro de Investigación y de Estudios Avanzados del IPN) es uno de los principales centros de investigación en edición genómica. Grupos del CINVESTAV en Irapuato investigan la aplicación de CRISPR en plantas (resistencia a enfermedades, mejoramiento de cultivos como el maíz y el frijol) y en el Departamento de Genética y Biología Molecular en la Ciudad de México trabajan en modelos de enfermedades genéticas humanas. La colaboración entre el CINVESTAV y universidades de Estados Unidos y Europa coloca a México en la frontera de la investigación en biotecnología.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Las aplicaciones médicas más prometedoras de CRISPR incluyen: corrección de la mutación causante de la drepanocitosis (anemia de células falciformes), terapia génica para hemofilia, y ensayos clínicos para ciertos tipos de cáncer. En 2023, la FDA de Estados Unidos aprobó el primer tratamiento de CRISPR (Casgevy) para la drepanocitosis, marcando un hito en la medicina. México aún no cuenta con aprobación local para terapias CRISPR, pero el IMSS y el INMEGEN observan estos desarrollos para futuras políticas de salud.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "En 2018, el científico chino He Jiankui creó polémicamente los primeros bebés editados genéticamente mediante CRISPR: gemelas con el gen CCR5 modificado para conferir resistencia al VIH. Este experimento fue ampliamente condenado por la comunidad científica internacional por violar los principios éticos de la investigación biomédica: ausencia de necesidad médica real, consentimiento informado cuestionable y riesgos desconocidos para las niñas y su posible descendencia.",
        },
      ],
    },
  },

  // ── 21 ── Biotecnología y bioética — avanzado ────────────────────────────
  {
    slug: "cneyt-vi-bioetica-ogm-maiz-transgenico-mexico",
    titulo: "Bioética y OGM: el debate del maíz transgénico y la soberanía alimentaria en México",
    categoria: "Biotecnología y bioética",
    conceptos_clave: ["bioética", "OGM", "maíz transgénico", "soberanía alimentaria", "moratoria México 2020"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "México, como centro de origen y diversidad del maíz, ocupa un lugar único en el debate global sobre los organismos genéticamente modificados (OGM). En diciembre de 2020, el gobierno mexicano publicó el Decreto por el que se establecen las acciones que deberán realizar las dependencias y entidades que integran la Administración Pública Federal, en materia de maíz transgénico, fijando una meta de sustitución del maíz transgénico importado para consumo humano antes de 2024 y prohibiendo la siembra de maíz transgénico en México. El decreto fue reafirmado y ampliado en 2023, en medio de disputas comerciales con Estados Unidos y Canadá bajo el marco del T-MEC.",
        },
        {
          tipo: "subtitulo",
          contenido: "Argumentos del debate: ciencia, economía y bioética",
        },
        {
          tipo: "lista",
          items: [
            "Argumento de bioseguridad: los críticos del maíz transgénico temen la contaminación genética de los maíces nativos mexicanos (64 razas) por flujo génico desde los cultivos transgénicos, lo que podría alterar irreversiblemente el patrimonio genético de México. La FAO reconoce a México como centro de diversidad del maíz.",
            "Argumento de soberanía alimentaria: México depende de importaciones de maíz amarillo transgénico (principalmente de Estados Unidos) para alimentación de ganado e industria. Los defensores del decreto argumentan que esto crea dependencia tecnológica y económica de corporaciones transnacionales (Monsanto/Bayer, Pioneer/Corteva).",
            "Argumento científico a favor de los OGM: las agencias regulatorias de la Unión Europea, Estados Unidos y Canadá han concluido que el maíz transgénico aprobado es seguro para consumo humano y animal. La UNAM y algunos investigadores mexicanos critican el decreto por basarse en precaución sin evidencia científica de daño.",
            "Argumento económico contra la moratoria: México importa anualmente ≈ 17 millones de toneladas de maíz amarillo, la mayoría transgénico y de Estados Unidos. La sustitución por maíz no transgénico implicaría mayores costos para la industria de alimentos balanceados y encarecimiento de la carne.",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "La bioética analiza las implicaciones morales de las biotecnologías aplicadas a seres vivos. Los principios clásicos de la bioética médica (autonomía, beneficencia, no maleficencia, justicia) se extienden a la bioética ambiental y alimentaria. En el caso del maíz transgénico en México, los principios de precaución (actuar con cautela ante riesgos inciertos) y justicia (¿quién se beneficia y quién asume los riesgos?) son centrales. La diversidad de los maíces nativos mexicanos no es solo un bien genético: es un patrimonio cultural, espiritual y económico de los pueblos originarios que los han cuidado por milenios.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El principio de precaución, adoptado en el Protocolo de Cartagena sobre Bioseguridad (2000), establece que ante amenazas de daño grave e irreversible al medio ambiente o a la salud humana, la falta de certeza científica completa no debe usarse como razón para posponer medidas de protección. México es parte del Protocolo de Cartagena y lo invoca para justificar la moratoria al maíz transgénico. Estados Unidos no ha ratificado este protocolo.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "En 2024, un panel arbitral del T-MEC falló parcialmente contra México en la disputa por la restricción al maíz transgénico importado para consumo humano, argumentando que México no presentó evidencia científica suficiente de riesgo para la salud. Sin embargo, el panel no se pronunció sobre las restricciones a la siembra de maíz transgénico en suelo mexicano. El debate continúa, y refleja la tensión entre libre comercio, soberanía nacional, ciencia y diversidad biocultural.",
        },
      ],
    },
  },
] as const;

export async function seedBibliotecaCNEYTVI(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed Biblioteca CNEYT-VI (21 fichas)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac")
    .select("id")
    .eq("codigo", "CNEYT-VI")
    .single();

  if (uacErr || !uacRow) {
    throw new Error(
      `UAC CNEYT-VI no encontrada. Ejecuta primero seed-mccems.ts y seed-cneytvi.ts. Error: ${uacErr?.message}`
    );
  }

  const rows = FICHAS_CNEYTVI.map((f, i) => ({
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

  if (error) throw new Error(`Error seeding fichas CNEYT-VI: ${error.message}`);

  console.log(`  ✓ ${rows.length} fichas de biblioteca de CNEYT-VI insertadas/actualizadas.`);
  console.log("\n✅ Seed Biblioteca CNEYT-VI completado.\n");
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
  seedBibliotecaCNEYTVI(sb).catch((err) => {
    console.error("❌ Error:", err.message);
    process.exit(1);
  });
}
