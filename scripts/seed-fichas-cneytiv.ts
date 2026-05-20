/**
 * Seed de fichas de biblioteca para CNEYT-IV (CNEyT IV — Química). 21 fichas temáticas alineadas al MCCEMS 2025, Semestre 4.
 * Uso: npx tsx scripts/seed-fichas-cneytiv.ts
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

const FICHAS_CNEYTIV = [
  // ── 1 ── Estequiometría ────────────────────────────────────────────────────
  {
    slug: "cneyt-iv-balanceo-ecuaciones-tanteo",
    titulo: "Balanceo de ecuaciones químicas: método de tanteo",
    categoria: "Estequiometría",
    conceptos_clave: ["balanceo", "ecuación química", "ley de conservación de la masa", "coeficientes", "reactivos y productos"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Una ecuación química es la representación simbólica de una reacción en la que los reactivos se transforman en productos. Para que sea válida debe cumplir la ley de conservación de la masa: el número de átomos de cada elemento debe ser igual antes y después de la reacción. El método de tanteo consiste en ajustar los coeficientes estequiométricos —los números que preceden a cada fórmula— de forma sistemática hasta lograr ese balance sin modificar las fórmulas de las sustancias.",
        },
        {
          tipo: "subtitulo",
          contenido: "Pasos del método de tanteo",
        },
        {
          tipo: "lista",
          items: [
            "Escribe la ecuación sin ajustar: H2 + O2 → H2O",
            "Cuenta átomos de cada elemento en reactivos y productos. Lado izquierdo: 2 H, 2 O. Lado derecho: 2 H, 1 O. El oxígeno no está balanceado.",
            "Ajusta el producto: H2 + O2 → 2 H2O. Ahora: izquierda 2 H, 2 O; derecha 4 H, 2 O. Ahora el hidrógeno no cuadra.",
            "Ajusta el reactivo de hidrógeno: 2 H2 + O2 → 2 H2O. Verificación: izquierda 4 H, 2 O; derecha 4 H, 2 O. Ecuación balanceada.",
            "Otro ejemplo, combustión del metano: CH4 + O2 → CO2 + H2O. Balanceado: CH4 + 2 O2 → CO2 + 2 H2O.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Reglas prácticas del tanteo",
        },
        {
          tipo: "parrafo",
          contenido:
            "Comienza balanceando los elementos que aparecen en una sola sustancia de cada lado (generalmente metales y no metales que no sean H ni O). Deja el hidrógeno y el oxígeno para el final. Si obtienes fracciones, multiplica toda la ecuación por el denominador para obtener coeficientes enteros. Los coeficientes deben ser los números más pequeños posibles: si todos son divisibles entre 2, divídelos. Nunca cambies los subíndices de las fórmulas para balancear; solo los coeficientes.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El coeficiente 1 nunca se escribe explícitamente. Si una sustancia aparece sola sin coeficiente, se entiende que es 1. El balanceo es una habilidad fundamental: en la industria química mexicana, como en las plantas de PEMEX en Tula, Hidalgo, las proporciones exactas de reactivos determinan la eficiencia y la seguridad de los procesos industriales.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama del balanceo de la combustión del metano con átomos coloreados a cada lado de la flecha de reacción",
          caption: "CH4 + 2 O2 → CO2 + 2 H2O: los átomos se conservan, solo se reorganizan.",
        },
      ],
    },
  },

  // ── 2 ── Estequiometría ────────────────────────────────────────────────────
  {
    slug: "cneyt-iv-ley-conservacion-masa",
    titulo: "Ley de conservación de la masa: Lavoisier y la química moderna",
    categoria: "Estequiometría",
    conceptos_clave: ["ley de conservación de la masa", "Lavoisier", "materia", "masa reactivos", "masa productos"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Antoine-Laurent de Lavoisier enunció en 1789 uno de los principios fundamentales de la química: en toda reacción química, la masa total de los reactivos es igual a la masa total de los productos. La materia no se crea ni se destruye, solo se transforma. Esta ley, aparentemente sencilla, revolucionó la química al reemplazar teorías como el flogisto y establecer la base cuantitativa de la disciplina. Hoy, es el fundamento de todo cálculo estequiométrico.",
        },
        {
          tipo: "subtitulo",
          contenido: "Demostración experimental clásica",
        },
        {
          tipo: "lista",
          items: [
            "Si se quema magnesio en una cápsula cerrada: 2 Mg + O2 → 2 MgO, la masa del sistema no cambia. La ganancia de masa del magnesio corresponde exactamente al oxígeno consumido del aire encerrado.",
            "Si se mezclan soluciones de nitrato de plomo y yoduro de potasio en un recipiente sellado, se forma el precipitado amarillo de yoduro de plomo. La masa antes y después de la reacción es idéntica.",
            "El CINVESTAV (Centro de Investigación y de Estudios Avanzados del IPN) utiliza balanzas analíticas de precisión de 0.0001 g para verificar este principio en experimentos de síntesis química.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Implicaciones industriales y cotidianas",
        },
        {
          tipo: "parrafo",
          contenido:
            "La ley de conservación de la masa tiene implicaciones directas en la gestión de residuos industriales. Cuando una planta química transforma reactivos en productos, todo el material debe ser contabilizado: productos principales, subproductos, residuos y emisiones gaseosas. La contaminación del Río Sonora en 2014, provocada por el derrame de sulfato de cobre de Grupo México, fue posible en parte por la falta de control de las masas de efluentes. Los átomos de cobre no desaparecen: si no se contabilizan y tratan, se transfieren al ambiente.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Lavoisier fue guillotinado durante la Revolución Francesa en 1794. Cuando pidió tiempo para terminar sus experimentos, el juez respondió: 'La República no necesita sabios.' El matemático Joseph-Louis Lagrange comentó: 'Solo un momento para cortar esa cabeza, y quizás un siglo antes de que aparezca otra igual.'",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Balanza de laboratorio con reactivos en un lado y productos en el otro, mostrando la misma masa en ambos platillos",
          caption: "La ley de Lavoisier: masa de reactivos = masa de productos.",
        },
      ],
    },
  },

  // ── 3 ── Estequiometría ────────────────────────────────────────────────────
  {
    slug: "cneyt-iv-estequiometria-calculos",
    titulo: "Estequiometría: cálculos de masa y mol",
    categoria: "Estequiometría",
    conceptos_clave: ["mol", "masa molar", "relación molar", "reactivo limitante", "rendimiento de reacción"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La estequiometría es la rama de la química que estudia las proporciones cuantitativas de reactivos y productos en una reacción. Su unidad central es el mol: la cantidad de sustancia que contiene 6.022 × 10²³ partículas (número de Avogadro). La masa molar es la masa en gramos de un mol de sustancia y es numéricamente igual a la masa atómica o molecular en unidades de masa atómica (uma). Dominar estos conceptos es indispensable para calcular cuánto reactivo se necesita y cuánto producto se obtendrá.",
        },
        {
          tipo: "subtitulo",
          contenido: "Cómo resolver un problema estequiométrico",
        },
        {
          tipo: "lista",
          items: [
            "Escribe y balancea la ecuación: CH4 + 2 O2 → CO2 + 2 H2O",
            "Identifica la relación molar de los coeficientes: 1 mol CH4 reacciona con 2 mol O2 para producir 1 mol CO2 y 2 mol H2O.",
            "Convierte la masa dada a moles: si tienes 32 g de CH4, con masa molar = 16 g/mol → 32/16 = 2 mol CH4.",
            "Aplica la relación molar: 2 mol CH4 × (2 mol O2 / 1 mol CH4) = 4 mol O2 necesarios.",
            "Convierte a gramos si se pide: 4 mol O2 × 32 g/mol = 128 g de O2.",
            "El reactivo que se agota primero determina la cantidad de producto; ese es el reactivo limitante.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Rendimiento de reacción",
        },
        {
          tipo: "parrafo",
          contenido:
            "En la práctica, las reacciones raramente producen el 100 % de lo esperado. El rendimiento porcentual se calcula como: (masa real obtenida / masa teórica calculada) × 100. En la industria farmacéutica mexicana, empresas como Laboratorios Pisa o Silanes monitorizan constantemente el rendimiento de sus síntesis para optimizar costos y reducir desperdicios. Un rendimiento del 85 % en la síntesis de un principio activo significa que el 15 % de los reactivos costosos no se transforma en producto útil, generando pérdidas económicas y residuos.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El número de Avogadro (6.022 × 10²³) es tan grande que si se pusieran 6.022 × 10²³ granos de arroz sobre México, cubriría todo el país con una capa de más de 100 metros de altura. Esta escala explica por qué los químicos necesitan el mol como unidad práctica: trabajar con cantidades individuales de átomos es operativamente imposible.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de flujo del proceso estequiométrico: ecuación balanceada → relación molar → conversión de unidades → resultado",
          caption: "El puente mol conecta el mundo de los átomos con el mundo de las gramos que pesamos en laboratorio.",
        },
      ],
    },
  },

  // ── 4 ── Estequiometría ────────────────────────────────────────────────────
  {
    slug: "cneyt-iv-tabla-periodica-grupos",
    titulo: "Tabla periódica: grupos, periodos y propiedades periódicas",
    categoria: "Estequiometría",
    conceptos_clave: ["tabla periódica", "grupos", "periodos", "electronegatividad", "radio atómico", "metales y no metales"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La tabla periódica organiza los 118 elementos conocidos por número atómico creciente, de modo que los elementos con propiedades similares quedan alineados en columnas verticales llamadas grupos (o familias). Las filas horizontales se llaman periodos y corresponden al número de capas electrónicas del átomo. La genialidad de Dmitri Mendeléiev —quien propuso la versión moderna en 1869— fue reconocer que las propiedades de los elementos se repiten periódicamente, permitiéndole incluso predecir elementos entonces desconocidos.",
        },
        {
          tipo: "subtitulo",
          contenido: "Grupos importantes para la química de preparatoria",
        },
        {
          tipo: "lista",
          items: [
            "Grupo 1 — Metales alcalinos (Li, Na, K...): muy reactivos, forman hidróxidos fuertes al reaccionar con agua. El NaOH (sosa cáustica) es esencial en la fabricación de jabón y papel.",
            "Grupo 2 — Metales alcalinotérreos (Be, Mg, Ca...): reactivos, forman compuestos iónicos. El CaCO3 (caliza) es la roca más abundante de México y base del cemento.",
            "Grupo 17 — Halógenos (F, Cl, Br, I): muy electroneg., forman ácidos y sales. El Cl2 se usa para potabilizar el agua en sistemas como SACMEX (Sistema de Aguas de la Ciudad de México).",
            "Grupo 18 — Gases nobles (He, Ne, Ar...): inertes, no forman compuestos en condiciones normales. Base de letreros luminosos y atmosferas inertes en laboratorio.",
            "Metales de transición (Fe, Cu, Zn, Au, Ag...): propiedades variables, forman compuestos coloridos. El cobre (Cu) fue el metal del derrame del Río Sonora (CuSO4).",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Tendencias periódicas clave",
        },
        {
          tipo: "parrafo",
          contenido:
            "Las propiedades periódicas varían de forma predecible. El radio atómico aumenta al bajar en un grupo (más capas electrónicas) y disminuye al avanzar de izquierda a derecha en un periodo (más protones atraen los electrones hacia el núcleo). La electronegatividad —capacidad de atraer electrones en un enlace— aumenta hacia arriba y hacia la derecha de la tabla: el flúor (F) es el elemento más electronegativo. La energía de ionización —energía para arrancar un electrón— tiene la tendencia opuesta al radio atómico. Estas tendencias explican por qué ciertos elementos forman los mismos tipos de compuestos que sus vecinos de grupo.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "El elemento 112 se llama Copernicio (Cn) y fue sintetizado artificialmente. El CINVESTAV del IPN ha realizado investigaciones con elementos pesados y radiactivos en colaboración con laboratorios internacionales. De los 118 elementos de la tabla, solo 94 se encuentran de forma natural en la Tierra; los demás son producidos en reactores nucleares o aceleradores de partículas.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Tabla periódica simplificada con grupos y periodos numerados, y flechas indicando tendencias de radio atómico y electronegatividad",
          caption: "Las tendencias periódicas se pueden leer como mapas de propiedades en la tabla.",
        },
      ],
    },
  },

  // ── 5 ── Reacciones químicas ───────────────────────────────────────────────
  {
    slug: "cneyt-iv-tipos-reacciones-quimicas",
    titulo: "Tipos de reacciones químicas: síntesis, descomposición, sustitución y doble desplazamiento",
    categoria: "Reacciones químicas",
    conceptos_clave: ["síntesis", "descomposición", "sustitución simple", "doble desplazamiento", "combustión", "precipitación"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Las reacciones químicas son procesos en los que los átomos se reorganizan para formar nuevas sustancias con propiedades distintas a las originales. Aunque existen miles de reacciones distintas, se pueden clasificar en un número reducido de tipos fundamentales según cómo se reorganizan los átomos. Reconocer el tipo de reacción facilita predecir los productos, entender el mecanismo y diseñar condiciones óptimas para que ocurra de forma eficiente y segura.",
        },
        {
          tipo: "subtitulo",
          contenido: "Los cinco tipos principales",
        },
        {
          tipo: "lista",
          items: [
            "Síntesis o combinación: A + B → AB. Dos o más reactivos forman un solo producto. Ejemplo: 2 H2 + O2 → 2 H2O. La síntesis de amoníaco (N2 + 3 H2 → 2 NH3, proceso Haber-Bosch) es la base de los fertilizantes que alimentan al mundo.",
            "Descomposición: AB → A + B. Un solo compuesto se rompe en dos o más productos simples. Ejemplo: 2 H2O2 → 2 H2O + O2 (agua oxigenada descomponiéndose). El calentamiento del CaCO3 en la industria cementera es otra descomposición: CaCO3 → CaO + CO2.",
            "Sustitución simple (o desplazamiento): A + BC → AC + B. Un elemento desplaza a otro de un compuesto. Ejemplo: Fe + CuSO4 → FeSO4 + Cu. Este tipo de reacción ocurre en la corrosión de tuberías metálicas en contacto con soluciones ácidas.",
            "Doble desplazamiento (o metátesis): AB + CD → AD + CB. Los iones de dos compuestos iónicos intercambian posiciones. Ejemplo: HCl + NaOH → NaCl + H2O (neutralización). Ocurre cuando se forma un precipitado, gas o agua.",
            "Combustión: sustancia + O2 → CO2 + H2O (+ energía). Reacción exotérmica central en la industria petrolera. La combustión del octano (C8H18 + 12.5 O2 → 8 CO2 + 9 H2O) propulsa automóviles con gasolina refinada en instalaciones como la refinería de Tula, Hidalgo.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Las reacciones de combustión incompleta producen monóxido de carbono (CO), un gas inodoro y altamente tóxico. En la Ciudad de México, las contingencias ambientales se activan parcialmente por la acumulación de CO y compuestos orgánicos volátiles derivados de combustiones incompletas en el transporte. La quema del Volcán Popocatépetl también aporta SO2 que contribuye a la lluvia ácida en la región centro del país.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Cuadro comparativo de los cinco tipos de reacciones con sus esquemas A+B→AB, AB→A+B, etc., y ejemplos moleculares",
          caption: "Clasificar una reacción permite predecir sus productos y sus condiciones óptimas.",
        },
      ],
    },
  },

  // ── 6 ── Reacciones químicas ───────────────────────────────────────────────
  {
    slug: "cneyt-iv-reacciones-acido-base",
    titulo: "Reacciones ácido-base: neutralización y sales",
    categoria: "Reacciones químicas",
    conceptos_clave: ["ácido", "base", "neutralización", "sal", "protón", "teoría de Brønsted-Lowry"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Una reacción de neutralización ocurre cuando un ácido reacciona con una base para producir agua y una sal. La ecuación modelo es: HCl + NaOH → NaCl + H2O. Desde la perspectiva de Brønsted-Lowry, el ácido dona un protón (H⁺) y la base lo acepta. Este tipo de reacción es fundamental tanto en la industria química como en los procesos biológicos: nuestro estómago usa ácido clorhídrico (HCl) para digerir alimentos, y el páncreas secreta bicarbonato (NaHCO3) para neutralizarlo en el intestino delgado.",
        },
        {
          tipo: "subtitulo",
          contenido: "Ácidos y bases comunes en la vida cotidiana",
        },
        {
          tipo: "lista",
          items: [
            "Ácido clorhídrico (HCl): ácido fuerte, presente en el jugo gástrico. En laboratorio e industria, se usa para limpiar metales y como reactivo.",
            "Ácido acético (CH3COOH): ácido débil, componente del vinagre de mesa al 5 %. Se produce industrialmente por fermentación o síntesis del metanol.",
            "Ácido sulfúrico (H2SO4): el compuesto químico más producido a nivel mundial. Usado en baterías de automóviles, fertilizantes y refinación del petróleo en PEMEX.",
            "Hidróxido de sodio o sosa cáustica (NaOH): base fuerte. Se usa en fabricación de jabón, papel y en tratamiento de aguas residuales. pH ≈ 13.",
            "Bicarbonato de sodio (NaHCO3): base débil. Antiácido de uso doméstico, levadura química en panadería. Neutraliza el exceso de HCl estomacal.",
            "Amoniaco (NH3): base débil. Presente en limpiadores del hogar. Su solución acuosa se llama agua amoniacal.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "La reacción de neutralización en detalle",
        },
        {
          tipo: "parrafo",
          contenido:
            "Cuando se mezclan cantidades estequiométricamente equivalentes (punto de equivalencia) de un ácido fuerte y una base fuerte, el pH resultante es 7 (neutro) y la solución contiene únicamente la sal y el agua formados. Si el ácido o la base es débil, el pH en el punto de equivalencia no es exactamente 7. En la industria de tratamiento de aguas residuales en México, SEMARNAT exige que los efluentes industriales se neutralicen antes de ser descargados a cuerpos de agua, regulando su pH entre 6 y 9.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "No todas las sales son neutras. La sal de mesa (NaCl) sí es neutra (pH=7), pero el acetato de sodio (CH3COONa) produce una solución básica porque el ion acetato actúa como base débil. El cloruro de amonio (NH4Cl) produce solución ácida porque el ion amonio dona protones. Este comportamiento se llama hidrólisis salina y es determinante en la formulación de medicamentos y alimentos.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de la reacción HCl + NaOH con modelo molecular mostrando la transferencia del protón H+ del ácido a la base",
          caption: "La neutralización: HCl + NaOH → NaCl + H2O, el protón H+ se transfiere del ácido a la base.",
        },
      ],
    },
  },

  // ── 7 ── Reacciones químicas ───────────────────────────────────────────────
  {
    slug: "cneyt-iv-ph-escala-indicadores",
    titulo: "pH, la escala de acidez e indicadores ácido-base",
    categoria: "Reacciones químicas",
    conceptos_clave: ["pH", "escala de pH", "ion hidronio", "indicadores", "papel tornasol", "logaritmo"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El pH es una escala numérica que mide el grado de acidez o basicidad de una solución acuosa. Se define matemáticamente como: pH = −log[H⁺], donde [H⁺] es la concentración molar de iones hidrógeno (o hidronio, H3O⁺). La escala va de 0 a 14 en condiciones normales: valores menores a 7 son ácidos, 7 es neutro y mayores a 7 son básicos o alcalinos. Cada unidad de diferencia en el pH representa un cambio de 10 veces en la concentración de H⁺.",
        },
        {
          tipo: "subtitulo",
          contenido: "pH de sustancias cotidianas",
        },
        {
          tipo: "lista",
          items: [
            "Ácido de batería (H2SO4 concentrado): pH ≈ 0 — extremadamente ácido y corrosivo.",
            "Jugo de limón: pH ≈ 2 — ácido cítrico, agriado marcado al paladar.",
            "Vinagre (CH3COOH al 5 %): pH ≈ 2.4 — ácido acético, usado como conservador.",
            "Refresco carbonatado: pH ≈ 2.5-3.5 — ácido carbónico (H2CO3) y ácido fosfórico.",
            "Café: pH ≈ 5 — ligeramente ácido; el expresso tiene menor pH que el americano.",
            "Agua pura: pH = 7 — neutra, [H⁺] = [OH⁻] = 1×10⁻⁷ M a 25 °C.",
            "Sangre humana: pH = 7.35-7.45 — ligeramente básica; variaciones de ±0.2 son mortales.",
            "Bicarbonato de sodio: pH ≈ 8.3 — ligeramente básico.",
            "Jabón de barra: pH ≈ 9-10 — básico, puede irritar pieles sensibles.",
            "Sosa cáustica (NaOH): pH ≈ 13-14 — fuertemente básica y corrosiva.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Indicadores ácido-base naturales",
        },
        {
          tipo: "parrafo",
          contenido:
            "Un indicador ácido-base es una sustancia que cambia de color según el pH de la solución. El papel tornasol se vuelve rojo con ácidos y azul con bases. La fenolftaleína es incolora en ácido y rosa en base, por lo que se usa como indicador en valoraciones ácido-base. En casa, el jugo de col morada es un indicador natural: es rojo-rosado en ácido, verde en neutro y amarillo en base. La COFEPRIS (Comisión Federal para la Protección contra Riesgos Sanitarios) regula el pH de alimentos y bebidas empacados: las conservas enlatadas deben tener pH menor a 4.6 para inhibir el crecimiento de bacterias como Clostridium botulinum.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "El pH de la sangre está regulado con precisión extraordinaria. Si baja de 7.35 (acidosis) o sube de 7.45 (alcalosis), los sistemas tampón del cuerpo actúan: el par bicarbonato-ácido carbónico (HCO3⁻/H2CO3) amortigua los cambios de pH en la sangre. La respiración también regula el pH: respirar rápido elimina CO2, subiendo el pH; retener el aliento acumula CO2, bajándolo.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Escala de pH del 0 al 14 con colores de indicador universal y ejemplos de sustancias cotidianas posicionadas en la escala",
          caption: "La escala de pH: cada unidad representa una diferencia de 10 veces en la concentración de H⁺.",
        },
      ],
    },
  },

  // ── 8 ── Reacciones químicas ───────────────────────────────────────────────
  {
    slug: "cneyt-iv-reacciones-redox-basicas",
    titulo: "Reacciones de oxidación-reducción (redox) en la vida cotidiana",
    categoria: "Reacciones químicas",
    conceptos_clave: ["oxidación", "reducción", "número de oxidación", "agente oxidante", "agente reductor", "corrosión"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Las reacciones redox (oxidación-reducción) involucran la transferencia de electrones entre reactivos. La oxidación es la pérdida de electrones y el aumento del número de oxidación; la reducción es la ganancia de electrones y la disminución del número de oxidación. Ambos procesos ocurren simultáneamente: no puede haber oxidación sin reducción. Estas reacciones son omnipresentes: desde el proceso respiratorio celular hasta la corrosión del hierro, pasando por las baterías y los procesos de refinación del petróleo.",
        },
        {
          tipo: "subtitulo",
          contenido: "Ejemplos cotidianos de reacciones redox",
        },
        {
          tipo: "lista",
          items: [
            "Corrosión del hierro: 4 Fe + 3 O2 + 6 H2O → 4 Fe(OH)3 (herrumbre). El hierro se oxida (pierde electrones) y el oxígeno se reduce. Las tuberías de acero de PEMEX en zonas costeras requieren protección catódica contra la corrosión redox.",
            "Combustión: CH4 + 2 O2 → CO2 + 2 H2O. El carbono del metano pasa de número de oxidación -4 a +4 (oxidación). El oxígeno pasa de 0 a -2 (reducción).",
            "Blanqueamiento: el hipoclorito de sodio (NaClO) del blanqueador doméstico oxida los pigmentos de las manchas, destruyendo su color. NaClO es el agente oxidante.",
            "Respiración celular: C6H12O6 + 6 O2 → 6 CO2 + 6 H2O + energía (ATP). La glucosa se oxida y el oxígeno se reduce; la energía liberada se almacena en ATP.",
            "Batería de automóvil: en la batería de plomo-ácido, el Pb metálico se oxida en el ánodo y el PbO2 se reduce en el cátodo, generando corriente eléctrica.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Reglas prácticas para asignar números de oxidación",
        },
        {
          tipo: "parrafo",
          contenido:
            "Para identificar quién se oxida y quién se reduce, se asignan números de oxidación siguiendo reglas: el oxígeno tiene número de oxidación -2 en casi todos sus compuestos (excepto peróxidos y OF2); el hidrógeno tiene +1 en compuestos con no metales y -1 con metales. En una sustancia elemental el número de oxidación es 0. La suma de números de oxidación en un compuesto neutro es cero y en un ion poliatómico es igual a la carga del ion. Estos números permiten identificar si ocurre una transferencia de electrones.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El derrame del Río Sonora en agosto de 2014 involucró una reacción redox: el sulfato de cobre (CuSO4) es una sal donde el cobre está en estado de oxidación +2. Al contacto con el agua del río, el CuSO4 afectó la química del agua, precipitando metales pesados y alterando el equilibrio redox del ecosistema acuático, con efectos documentados hasta 2020. El CINVESTAV realizó estudios de bioacumulación de metales en organismos del río.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de transferencia de electrones entre el hierro (se oxida) y el oxígeno (se reduce) durante la formación de herrumbre",
          caption: "En toda reacción redox, los electrones fluyen del agente reductor al agente oxidante.",
        },
      ],
    },
  },

  // ── 9 ── Industria y sociedad ──────────────────────────────────────────────
  {
    slug: "cneyt-iv-pemex-industria-quimica",
    titulo: "PEMEX y la industria petroquímica de México",
    categoria: "Industria y sociedad",
    conceptos_clave: ["petroquímica", "hidrocarburo", "refinación", "PEMEX", "destilación fraccionada", "productos derivados"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Petróleos Mexicanos (PEMEX) es la empresa productora de hidrocarburos más importante de México y una de las diez mayores petroleras del mundo por reservas. Su actividad abarca la exploración y extracción de petróleo crudo y gas natural —con plataformas offshore en el Golfo de México como las de la Sonda de Campeche— hasta la refinación en instalaciones terrestres y la distribución de productos terminados. La química es el núcleo de toda esta cadena de valor: cada etapa implica transformaciones químicas controladas.",
        },
        {
          tipo: "subtitulo",
          contenido: "La destilación fraccionada: separando el crudo",
        },
        {
          tipo: "lista",
          items: [
            "El petróleo crudo es una mezcla compleja de cientos de hidrocarburos con distintos puntos de ebullición. La destilación fraccionada los separa calentando el crudo y recogiendo fracciones a distintas temperaturas.",
            "Gas de petróleo licuado (GLP): butano y propano, menores a 40 °C — gas LP de uso doméstico en México.",
            "Gasolinas: C5–C12, 40-200 °C — combustible de automóviles.",
            "Turbosina (queroseno): C12–C16, 150-300 °C — combustible de aviación.",
            "Diésel: C16–C20, 200-350 °C — camiones, autobuses, maquinaria pesada.",
            "Aceites lubricantes y parafinas: C20–C50, mayores a 300 °C.",
            "Residuo asfáltico (chapopote): mayores a 500 °C — pavimentación de carreteras.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Petroquímica: más allá del combustible",
        },
        {
          tipo: "parrafo",
          contenido:
            "La petroquímica transforma fracciones del petróleo en materias primas para la industria. El complejo petroquímico de Cosoleacaque, Veracruz, es uno de los más grandes de México y produce amoniaco (fertilizantes), urea y otros compuestos nitrogenados. La refinería Miguel Hidalgo en Tula, Hidalgo, tiene capacidad de 160,000 barriles diarios. Los productos petroquímicos son precursores de plásticos (polietileno, polipropileno), fibras sintéticas (nailon, poliéster), medicamentos, pesticidas, detergentes y pinturas. La dependencia global del petróleo trasciende el combustible: el 95 % de los plásticos usados en México deriva del petróleo.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "México descubrió el gigantesco yacimiento de Cantarell en la Sonda de Campeche en 1976, convirtiéndose en uno de los más grandes del mundo. En su pico (2004), producía más de 2 millones de barriles diarios. Para 2022, producía apenas 130,000. El CINVESTAV e instituciones como el Instituto Mexicano del Petróleo (IMP) desarrollan tecnologías de recuperación mejorada para extraer el petróleo restante en yacimientos maduros.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de una torre de destilación fraccionada con las fracciones del petróleo ordenadas por temperatura de extracción: gases en la cima, asfalto en la base",
          caption: "La destilación fraccionada separa el petróleo crudo en fracciones útiles según su punto de ebullición.",
        },
      ],
    },
  },

  // ── 10 ── Industria y sociedad ─────────────────────────────────────────────
  {
    slug: "cneyt-iv-farmaceutica-mexico",
    titulo: "La industria farmacéutica en México: síntesis de medicamentos",
    categoria: "Industria y sociedad",
    conceptos_clave: ["síntesis orgánica", "principio activo", "COFEPRIS", "farmacéutica", "fármacos genéricos", "patente"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La industria farmacéutica aplica los principios de la química orgánica para sintetizar, purificar y formular los medicamentos que usamos. México es el segundo mercado farmacéutico más grande de América Latina, con una producción anual de más de 300,000 millones de pesos. La COFEPRIS (Comisión Federal para la Protección contra Riesgos Sanitarios) regula la fabricación, distribución y comercialización de medicamentos para garantizar su seguridad, calidad y eficacia, siguiendo estándares internacionales de buenas prácticas de manufactura (BPM).",
        },
        {
          tipo: "subtitulo",
          contenido: "Del laboratorio a la farmacia: el camino de un medicamento",
        },
        {
          tipo: "lista",
          items: [
            "Descubrimiento: identificación de una molécula con actividad biológica deseable. El ácido acetilsalicílico (aspirina, C9H8O4) fue sintetizado por primera vez por Félix Hoffmann en 1897 a partir del ácido salicílico.",
            "Síntesis y optimización: se desarrollan rutas de síntesis eficientes para producir el principio activo con alta pureza (generalmente >99.5 %). Los rendimientos y la selectividad son cruciales.",
            "Pruebas preclínicas y clínicas: fases I, II y III con voluntarios humanos para determinar seguridad, dosis y eficacia. Pueden tomar 10-15 años y costar más de 1,000 millones de dólares.",
            "Registro ante COFEPRIS: el fabricante solicita el Registro Sanitario presentando evidencia de calidad, seguridad y eficacia. Sin él, el medicamento no puede venderse en México.",
            "Patentes y genéricos: al vencer la patente (20 años), otros fabricantes pueden producir genéricos intercambiables. México produjo el primer genérico de paracetamol (acetaminofén) en los años 80, democratizando el acceso.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Química orgánica en los medicamentos más comunes",
        },
        {
          tipo: "parrafo",
          contenido:
            "El ibuprofeno (C13H18O2) es un antiinflamatorio no esteroideo sintetizado a partir del isobutilbenceno; su síntesis industrial requiere solo tres pasos y tiene un rendimiento del 99 %, ejemplo de química verde en la práctica. El omeprazol (C17H19N3O3S), inhibidor de la bomba de protones para tratar úlceras gástricas, es uno de los medicamentos más vendidos en México. Laboratorios nacionales como Pisa, Silanes, Liomont y Chinoin (ahora Sanofi México) fabrican tanto medicamentos de patente como genéricos, contribuyendo a la soberanía farmacéutica del país.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La adulteración de medicamentos es un problema serio en México. COFEPRIS realiza operativos permanentes contra el mercado de medicamentos falsificados o sin registro sanitario. Un medicamento adulterado puede contener menos principio activo del declarado, sustancias peligrosas o nada en absoluto. La diferencia entre un medicamento legítimo y uno falso es estrictamente química: la composición y concentración del principio activo.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de síntesis del ácido acetilsalicílico (aspirina) desde el ácido salicílico y el anhídrido acético, con estructuras moleculares",
          caption: "La síntesis de la aspirina: ácido salicílico + anhídrido acético → aspirina + ácido acético.",
        },
      ],
    },
  },

  // ── 11 ── Industria y sociedad ─────────────────────────────────────────────
  {
    slug: "cneyt-iv-polimeros-plasticos-industria",
    titulo: "Polímeros y plásticos: química de los materiales del siglo XX",
    categoria: "Industria y sociedad",
    conceptos_clave: ["polímero", "monómero", "polimerización", "plástico", "termoestable", "termoplástico", "PET", "PVC"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Un polímero es una macromolécula formada por la unión repetitiva de unidades pequeñas llamadas monómeros. La mayoría de los plásticos que usamos cotidianamente son polímeros sintéticos derivados del petróleo. Su versatilidad —ligereza, resistencia, impermeabilidad, capacidad de moldeado— los convirtió en el material dominante del siglo XX. Sin embargo, su resistencia a la degradación los convierte en uno de los mayores problemas de contaminación ambiental del presente.",
        },
        {
          tipo: "subtitulo",
          contenido: "Principales polímeros y sus aplicaciones",
        },
        {
          tipo: "lista",
          items: [
            "Polietileno tereftalato (PET): formado por la polimerización de etilenglicol y ácido tereftálico. Botellas de agua, refrescos y envases de alimentos. ECOCE (Ecología y Compromiso Empresarial) es la empresa líder en México para el reciclaje de envases PET, recuperando miles de toneladas anuales.",
            "Polietileno de alta densidad (HDPE): garrafones de agua, tuberías de gas. Reciclable, código de reciclaje #2.",
            "Cloruro de polivinilo (PVC): tuberías de agua y drenaje, cables eléctricos, pisos vinílicos. Contiene cloro; su incineración produce dioxinas.",
            "Polipropileno (PP): envases de yogurt, popotes, recipientes de alimentos calientes. Alta resistencia a temperaturas.",
            "Poliestireno (PS): vasos de unicel (poliestireno expandido), cubiertos desechables. Muy difícil de reciclar; en 2022 México prohibió su uso en la Ciudad de México.",
            "Nailon (poliamida): fibra textil, cuerdas, engranajes de maquinaria. Sintetizado por primera vez en 1938 por DuPont.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "La crisis del plástico en México",
        },
        {
          tipo: "parrafo",
          contenido:
            "México genera aproximadamente 12.5 millones de toneladas de residuos sólidos urbanos al año, de los cuales alrededor del 10-12 % son plásticos. Solo el 9 % del plástico producido globalmente se ha reciclado alguna vez; el resto termina en vertederos, incineradoras o en el ambiente. Los mares y ríos mexicanos reciben toneladas de plástico anualmente. El ECOCE trabaja con más de 1,400 centros de acopio en el país para aumentar la tasa de recuperación del PET, material que puede reciclarse hasta 10 veces para producir nuevas botellas o fibras textiles.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Los bioplásticos son polímeros fabricados a partir de recursos biológicos renovables (almidón de maíz, caña de azúcar, celulosa) en lugar de petróleo. El ácido poliláctico (PLA) se sintetiza a partir de glucosa fermentada y es biodegradable en condiciones industriales de compostaje. En México, el CINVESTAV y varias universidades públicas investigan biopolímeros a partir de agave y cactáceas, aprovechando las especies nativas del país.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de polimerización del etileno para formar polietileno, mostrando monómeros CH2=CH2 enlazándose en cadena larga",
          caption: "La polimerización: cientos de miles de monómeros de etileno forman una cadena de polietileno.",
        },
      ],
    },
  },

  // ── 12 ── Industria y sociedad ─────────────────────────────────────────────
  {
    slug: "cneyt-iv-aditivos-alimentarios",
    titulo: "Aditivos alimentarios: la química detrás de los alimentos procesados",
    categoria: "Industria y sociedad",
    conceptos_clave: ["aditivo", "conservador", "colorante", "antioxidante", "COFEPRIS", "GRAS", "E-number"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Un aditivo alimentario es cualquier sustancia que se añade intencionalmente a un alimento para modificar sus características tecnológicas (conservación, textura, color, sabor) sin ser en sí misma un alimento. México usa la Norma Oficial Mexicana NOM-051-SCFI/SSA1-2010 para regular el etiquetado de alimentos, y la COFEPRIS supervisa el uso de aditivos conforme a listas positivas de sustancias permitidas a dosis específicas. El Codex Alimentarius de la OMS establece estándares internacionales que México adopta.",
        },
        {
          tipo: "subtitulo",
          contenido: "Principales categorías de aditivos",
        },
        {
          tipo: "lista",
          items: [
            "Conservadores: inhiben el crecimiento de bacterias, hongos y levaduras. El benzoato de sodio (E-211) se usa en refrescos y jugos. El sorbato de potasio (E-202) protege quesos y productos de panadería. El nitrito de sodio (E-250) preserva embutidos y carnes frías, inhibiendo Clostridium botulinum — pero a altas temperaturas puede formar nitrosaminas cancerígenas.",
            "Antioxidantes: previenen la oxidación de grasas y aceites (enranciamiento). El BHA (E-320) y el BHT (E-321) son antioxidantes sintéticos. El ácido ascórbico (vitamina C, E-300) es un antioxidante natural.",
            "Colorantes: modifican o intensifican el color. La tartrazina (E-102, amarillo) se usa en refrescos y dulces. La cochinilla (E-120), extracto del insecto Dactylopius coccus criado en nopal, es un colorante rojo natural de origen mexicano exportado mundialmente.",
            "Emulsificantes: permiten mezclar sustancias que no se mezclan naturalmente (agua y aceite). La lecitina de soja (E-322) se usa en chocolates, mayonesas y margarinas.",
            "Edulcorantes: sustituyen al azúcar. La sacarina (E-954), el aspartamo (E-951), la stevia (E-960) — esta última extraída de una planta nativa de Paraguay y cultivada en México.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La controversia sobre los aditivos alimentarios en México se intensificó con el etiquetado frontal de advertencia (octágonos negros) implementado en 2020: 'EXCESO CALORÍAS', 'EXCESO AZÚCARES', 'EXCESO GRASAS SATURADAS', 'EXCESO GRASAS TRANS', 'EXCESO SODIO'. México fue el primer país de América Latina en adoptar este sistema, respaldado por la COFEPRIS y la Secretaría de Salud, contra la resistencia de la industria alimentaria. La base científica es la correlación entre el consumo de ultraprocesados y la epidemia de obesidad y diabetes tipo 2.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Etiqueta de alimento procesado con los octágonos de advertencia mexicanos destacados, junto a las estructuras moleculares del benzoato de sodio y el ácido ascórbico",
          caption: "El etiquetado frontal mexicano (2020) informa al consumidor sobre el exceso de nutrientes críticos.",
        },
      ],
    },
  },

  // ── 13 ── Química verde ────────────────────────────────────────────────────
  {
    slug: "cneyt-iv-quimica-verde-principios",
    titulo: "Química verde: los 12 principios para una química sostenible",
    categoria: "Química verde",
    conceptos_clave: ["química verde", "prevención de residuos", "economía atómica", "disolventes verdes", "catálisis", "diseño seguro"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La química verde —o química sostenible— es un enfoque filosófico y práctico que busca diseñar productos y procesos químicos que reduzcan o eliminen el uso y la generación de sustancias peligrosas. Propuesta por Paul Anastas y John Warner en 1998, se articula en 12 principios que guían a químicos e ingenieros en el diseño de síntesis más eficientes, seguras y respetuosas con el ambiente. No es solo una cuestión ética: una química verde también es económicamente rentable.",
        },
        {
          tipo: "subtitulo",
          contenido: "Los 12 principios de la química verde",
        },
        {
          tipo: "lista",
          items: [
            "1. Prevención: mejor no generar residuos que tratarlos después.",
            "2. Economía atómica: diseñar síntesis que incorporen al producto la mayor parte de los átomos de los reactivos. Menos desperdicios moleculares.",
            "3. Síntesis con menor peligro: usar y generar sustancias de escasa o nula toxicidad.",
            "4. Diseño de productos seguros: los productos deben ser eficaces y de toxicidad mínima.",
            "5. Disolventes y auxiliares seguros: evitar disolventes peligrosos como benceno, cloroformo o tetracloruro de carbono. El agua es el disolvente verde ideal.",
            "6. Diseño para eficiencia energética: minimizar el consumo de energía; preferir reacciones a temperatura y presión ambientes.",
            "7. Uso de materias primas renovables: biomasa, azúcares, aceites vegetales en lugar de derivados del petróleo.",
            "8. Reducción de derivatizaciones: evitar pasos de protección-desprotección que generan residuos sin incorporar al producto.",
            "9. Catálisis: usar catalizadores reutilizables en lugar de reactivos estequiométricos.",
            "10. Diseño para la degradación: los productos deben degradarse en compuestos inocuos al final de su vida útil.",
            "11. Análisis en tiempo real: monitorizar en línea para detectar y controlar la formación de sustancias peligrosas.",
            "12. Química segura para prevenir accidentes: minimizar el riesgo de explosiones, incendios y derrames.",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "En México, el CINVESTAV y la UNAM lideran investigaciones en química verde aplicada al aprovechamiento de residuos agroindustriales: la producción de biocombustibles desde bagazo de caña, la síntesis de polímeros biodegradables desde almidón de yuca y la extracción de compuestos bioactivos de plantas medicinales mexicanas usando agua como disolvente en lugar de solventes orgánicos tóxicos.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "La síntesis industrial de ibuprofeno desarrollada por la empresa BHC (hoy BASF) en los años 90 es un ejemplo clásico de química verde: redujo de 6 pasos a 3 la síntesis, aumentó la economía atómica del 40 % al 99 % y eliminó residuos peligrosos. Paul Anastas ganó el Premio Green Chemistry Challenge de la EPA por este trabajo.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Rueda con los 12 principios de la química verde, cada uno representado con un ícono y color diferente",
          caption: "Los 12 principios de la química verde guían el diseño de procesos más eficientes y seguros.",
        },
      ],
    },
  },

  // ── 14 ── Química verde ────────────────────────────────────────────────────
  {
    slug: "cneyt-iv-contaminacion-rio-sonora",
    titulo: "El derrame del Río Sonora (2014): análisis químico de un desastre ambiental",
    categoria: "Química verde",
    conceptos_clave: ["sulfato de cobre", "metales pesados", "contaminación hídrica", "bioacumulación", "remediación ambiental", "CuSO4"],
    tiempo_lectura_minutos: 8,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El 6 de agosto de 2014, la mina Buenavista del Cobre —operada por Grupo México, subsidiaria de Southern Copper— derramó aproximadamente 40,000 metros cúbicos de solución de sulfato de cobre acidulada (CuSO4 en ácido sulfúrico diluido) en el arroyo Tinajas, afluente del Río Bacanuchi y este del Río Sonora. El derrame contaminó 270 km de cauces, afectando a más de 22,000 personas en los municipios de Arizpe, Banámichi, Huépac, Aconchi, Baviácora y Ures. Fue considerado el peor desastre ambiental minero en la historia de México.",
        },
        {
          tipo: "subtitulo",
          contenido: "Química del derrame: ¿por qué fue tan dañino?",
        },
        {
          tipo: "lista",
          items: [
            "El sulfato de cobre (CuSO4 · 5H2O, el vitriol azul) es un compuesto altamente soluble en agua. Al diluirse en el río, liberó iones Cu²⁺ y SO4²⁻.",
            "El ion Cu²⁺ es tóxico para organismos acuáticos desde concentraciones de 0.1 mg/L (la norma mexicana NOM-001-SEMARNAT-1996 establece 0.2 mg/L). Concentraciones medidas en el río llegaron a 29 mg/L, 145 veces el límite.",
            "El ácido sulfúrico (H2SO4) acidificó el agua, bajando el pH de ~7.5 a valores de 3-4, lo que precipitó otros metales pesados (arsénico, plomo, cadmio) del lecho del río.",
            "La bioacumulación de cobre en tejidos de peces y macroinvertebrados acuáticos destruyó la cadena trófica del río. Los peces y cangrejos desaparecieron de tramos afectados.",
            "El Cu²⁺ compite con el Fe²⁺ y el Zn²⁺ en los sistemas enzimáticos de los organismos vivos, inhibiendo enzimas clave del metabolismo.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Remediación y situación actual",
        },
        {
          tipo: "parrafo",
          contenido:
            "Grupo México estableció el Fideicomiso Río Sonora con 2,000 millones de pesos para la remediación. Sin embargo, organismos como el CINVESTAV, la UNAM y CEMEFI documentaron irregularidades en los estudios de impacto y la lentitud de las acciones de limpieza. Estudios de 2018-2020 encontraron concentraciones de arsénico, plomo y cobre por encima de los límites en sedimentos del río y en pozos de agua potable de comunidades aledañas. La remediación de suelos y sedimentos contaminados por metales pesados es un proceso lento que puede requerir décadas, utilizando técnicas como la fitorremediación (plantas que absorben metales) y la electrocinesis (aplicación de corriente eléctrica para movilizar iones metálicos).",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La reacción de sustitución simple Fe + CuSO4 → FeSO4 + Cu explica parcialmente el mecanismo de daño: el cobre disuelto reacciona con el hierro de las partículas del suelo, desplazando iones de hierro al agua e incorporando el cobre a los sólidos del lecho. Esto distribuye la contaminación en los sedimentos, haciendo que el problema persista mucho después de que el agua superficial parezca limpia.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Mapa del Río Sonora mostrando el punto del derrame en la mina Buenavista, la extensión del tramo afectado y los municipios impactados",
          caption: "El derrame de CuSO4 en agosto de 2014 afectó 270 km del Río Sonora y a más de 22,000 personas.",
        },
      ],
    },
  },

  // ── 15 ── Química verde ────────────────────────────────────────────────────
  {
    slug: "cneyt-iv-salamanca-contaminacion",
    titulo: "Salamanca, Guanajuato: refinería PEMEX y contaminación histórica",
    categoria: "Química verde",
    conceptos_clave: ["hidrocarburos aromáticos", "benceno", "suelos contaminados", "plomo", "BTEX", "refinería"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Salamanca, Guanajuato, alberga desde 1950 la refinería Antonio M. Amor de PEMEX, una de las seis refinerías activas del país. Décadas de operación industrial acumularon en suelos y acuíferos locales altas concentraciones de hidrocarburos —especialmente benceno (C6H6), tolueno, etilbenceno y xilenos (BTEX)— así como plomo, que fue aditivo de las gasolinas mexicanas hasta su eliminación en 1998. Salamanca es uno de los sitios de mayor contaminación ambiental histórica de México y un caso de estudio de las consecuencias de la industrialización sin controles ambientales adecuados.",
        },
        {
          tipo: "subtitulo",
          contenido: "Contaminantes y su química",
        },
        {
          tipo: "lista",
          items: [
            "Benceno (C6H6): hidrocarburo aromático, cancerígeno comprobado (clase 1 IARC). Altamente volátil y soluble en agua subterránea. La OMS establece un límite de 10 µg/L en agua potable; pozos cercanos a la refinería han superado este valor.",
            "Tolueno (C7H8) y xilenos (C8H10): menos tóxicos que el benceno, pero afectan el sistema nervioso central en exposiciones crónicas. Afectan el sabor y olor del agua desde concentraciones de partes por billón.",
            "Plomo tetraetilo (Pb(C2H5)4): aditivo antidetonante de gasolinas hasta 1998. Altamente lipofílico, se acumula en suelos y tejido nervioso. Causa daño neurológico irreversible, especialmente en niños. Estudios de la UNAM y la UAM documentaron plombemias elevadas en niños de Salamanca hasta los años 2000.",
            "Sulfuro de hidrógeno (H2S): gas tóxico, inodoro en altas concentraciones (paraliza el olfato), producido en la desulfuración del petróleo. Las comunidades aledañas reportan episodios periódicos de olores intensos.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Acciones de remediación y lecciones aprendidas",
        },
        {
          tipo: "parrafo",
          contenido:
            "PEMEX ha realizado estudios de caracterización y algunos trabajos de remediación en Salamanca, pero organizaciones civiles y académicas documentan que el progreso ha sido insuficiente. La remediación de acuíferos contaminados con BTEX requiere técnicas como la atenuación natural monitoreada, bombeo y tratamiento, o biorremediación mediante bacterias que metabolizan los hidrocarburos. El caso de Salamanca es un ejemplo de la necesidad de aplicar los principios de química verde desde el diseño de los procesos industriales, para no generar pasivos ambientales costosísimos e imposibles de revertir completamente.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El benceno es cancerígeno en cualquier dosis: la IARC (Agencia Internacional para la Investigación del Cáncer) lo clasifica como carcinógeno de clase 1. Se ha asociado con leucemia y linfomas en trabajadores expuestos. La paradoja del benceno es que es un componente natural del petróleo crudo y de la gasolina, pero su uso como disolvente industrial fue prohibido en México en 1994. La normativa ambiental llega siempre después del daño.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Mapa de Salamanca, Guanajuato, con la ubicación de la refinería PEMEX y el área de influencia de la pluma de contaminación en el acuífero",
          caption: "La refinería de Salamanca y su entorno: décadas de contaminación con BTEX y plomo en suelos y acuíferos.",
        },
      ],
    },
  },

  // ── 16 ── Química verde ────────────────────────────────────────────────────
  {
    slug: "cneyt-iv-bioplasticos-alternativas",
    titulo: "Bioplásticos: alternativas sostenibles a los plásticos convencionales",
    categoria: "Química verde",
    conceptos_clave: ["bioplástico", "PLA", "almidón", "biodegradabilidad", "compostaje", "agave", "ECOCE"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Los bioplásticos son materiales poliméricos derivados total o parcialmente de fuentes biológicas renovables —almidón de maíz, caña de azúcar, celulosa, aceites vegetales— en lugar de petróleo. Representan aún menos del 1 % de la producción global de plásticos, pero su participación crece anualmente. Es importante distinguir dos características independientes: el origen biológico (bio-based) y la biodegradabilidad — un bioplástico puede ser de origen biológico pero no biodegradable (como el PET bio-based) o puede ser biodegradable pero no de origen biológico.",
        },
        {
          tipo: "subtitulo",
          contenido: "Principales bioplásticos en desarrollo y uso",
        },
        {
          tipo: "lista",
          items: [
            "Ácido poliláctico (PLA): sintetizado a partir de ácido láctico obtenido por fermentación de glucosa (maíz, caña). Transparente, rígido, similar al PET. Biodegradable en condiciones industriales de compostaje (58 °C, humedad >50 %). Se usa en envases, cubiertos desechables, suturas médicas.",
            "Polihidroxialcanoatos (PHA): producidos directamente por bacterias que los acumulan como reserva energética. 100 % biodegradables en suelo y agua. Mayor costo de producción. Aplicaciones médicas de alto valor.",
            "Plásticos de almidón termoplástico (TPS): almidón de maíz, yuca o papa plastificado con glicerol. Económicos, pero alta absorción de humedad. Adecuados para envases de corta vida útil.",
            "Biopolietileno (bio-PE): polietileno producido a partir de etanol de caña de azúcar. Químicamente idéntico al PE convencional —mismas propiedades, mismo ciclo de vida— pero con huella de carbono menor. Braskem (Brasil) es el mayor productor mundial.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "México y los bioplásticos: investigación y contexto",
        },
        {
          tipo: "parrafo",
          contenido:
            "México tiene ventajas únicas para el desarrollo de bioplásticos: es el mayor productor mundial de agave, cuyas fibras de henequén tienen potencial como refuerzo de biopolímeros. El CINVESTAV Unidad Mérida investiga compuestos bioactivos y biopolímeros a partir de fibras de agave. Universidades como la UAM Iztapalapa y la BUAP estudian la producción de PHA mediante bacterias aisladas de manglares y suelos mexicanos. Sin embargo, la infraestructura de compostaje industrial —necesaria para que el PLA se degrade correctamente— es casi inexistente en México: sin ella, el PLA termina en vertederos donde se degrada tan lento como el plástico convencional.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "ECOCE (Ecología y Compromiso Empresarial) reporta que México recupera alrededor del 57 % de los envases PET que se consumen en el país. El PET reciclado se usa para fabricar nuevas botellas (bottle-to-bottle) o fibras textiles de poliéster. La camiseta de la Selección Mexicana de Fútbol usó en una edición fibra de poliéster reciclado de botellas PET recolectadas en México, en colaboración con ECOCE.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama comparativo del ciclo de vida del PET convencional vs. PLA bioplástico, mostrando fuentes de carbono, producción y destinos al fin de vida",
          caption: "El PLA se degrada en condiciones de compostaje industrial, pero requiere infraestructura adecuada.",
        },
      ],
    },
  },

  // ── 17 ── Aplicaciones cotidianas ─────────────────────────────────────────
  {
    slug: "cneyt-iv-quimica-cocina-cotidiana",
    titulo: "Química en la cocina: lo que pasa cuando cocinamos",
    categoria: "Aplicaciones cotidianas",
    conceptos_clave: ["reacción de Maillard", "desnaturalización", "fermentación", "emulsión", "gelatinización", "caramelización"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La cocina es un laboratorio de química aplicada que opera desde hace miles de años. Hervir, freír, hornear, fermentar o marinar son transformaciones químicas que modifican la estructura molecular de los alimentos, cambiando su textura, sabor, color y valor nutricional. Comprender las reacciones que ocurren al cocinar permite mejorar técnicas culinarias, optimizar la retención de nutrientes y entender por qué ciertos alimentos se combinan bien y otros no.",
        },
        {
          tipo: "subtitulo",
          contenido: "Reacciones químicas en la cocina mexicana",
        },
        {
          tipo: "lista",
          items: [
            "Reacción de Maillard: al dorar la tortilla en el comal o tostar el café, los aminoácidos y los azúcares reducidos reaccionan a temperaturas > 140 °C produciendo cientos de compuestos aromáticos que dan el color café dorado y el sabor característico. No es caramelización — la Maillard requiere proteínas.",
            "Caramelización: calentamiento de azúcares puros por encima de su punto de fusión (160-180 °C para la sacarosa). Produce el color y sabor del cajeta, el piloncillo y el flan. La sacarosa (C12H22O11) se hidroliza y sus productos se polimerizan.",
            "Desnaturalización de proteínas: el calor o el ácido rompen los puentes de hidrógeno de las proteínas, cambiando su estructura tridimensional. El huevo se coagula al freírlo; la leche se corta con limón. El ceviche 'cocina' el pescado con el ácido cítrico del limón, desnaturalizando las proteínas aunque no haya calor.",
            "Fermentación alcohólica: levaduras convierten glucosa en etanol y CO2 (C6H12O6 → 2 C2H5OH + 2 CO2). El CO2 hace que el pan suba; el etanol da el alcohol de la cerveza y el pulque.",
            "Nixtamalización: proceso mesoamericano de tratar el maíz con solución de Ca(OH)2 (cal), hidrolizando la pericarpa y liberando niacina (vitamina B3) previamente no disponible. Sin nixtamal no hay tortilla, y sin nixtamalización habría deficiencia de niacina (pelagra).",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "La nixtamalización es uno de los aportes más importantes de Mesoamérica a la humanidad. Los pueblos mayas y aztecas la practicaban desde hace 3,500 años. Cuando el maíz llegó a Europa sin el proceso de nixtamalización, las poblaciones que lo adoptaron como alimento principal desarrollaron pelagra (deficiencia de niacina) en epidemias masivas. La UNESCO reconoció la cocina tradicional mexicana —con la nixtamalización en su núcleo— como Patrimonio Cultural Inmaterial de la Humanidad en 2010.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de la reacción de Maillard con estructuras moleculares simplificadas de aminoácido + azúcar y los productos aromáticos resultantes",
          caption: "La reacción de Maillard produce los cientos de compuestos aromáticos responsables del sabor de la tortilla tostada y el pan dorado.",
        },
      ],
    },
  },

  // ── 18 ── Aplicaciones cotidianas ─────────────────────────────────────────
  {
    slug: "cneyt-iv-acidos-bases-hogar",
    titulo: "Ácidos y bases en el hogar: reconocerlos y usarlos con seguridad",
    categoria: "Aplicaciones cotidianas",
    conceptos_clave: ["ácido acético", "ácido cítrico", "hidróxido de sodio", "bicarbonato", "pH hogar", "seguridad química"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El hogar está lleno de ácidos y bases: el vinagre, el limón, los refrescos, el blanqueador, el destapacaños, los limpiadores de baño. Conocer su naturaleza química, su pH y las precauciones de manejo permite usarlos de forma eficaz y segura, y entender qué ocurre cuando —por ignorancia o accidente— se mezclan. La regla más importante: nunca mezclar productos de limpieza sin conocer su composición química.",
        },
        {
          tipo: "subtitulo",
          contenido: "Ácidos y bases comunes en el hogar mexicano",
        },
        {
          tipo: "lista",
          items: [
            "Vinagre blanco (CH3COOH al 5 %): pH ≈ 2.4. Ácido débil. Excelente para disolver depósitos de carbonato de calcio (sarro) en llaves y regaderas, ya que reacciona: CaCO3 + 2 CH3COOH → Ca(CH3COO)2 + H2O + CO2.",
            "Jugo de limón (ácido cítrico C6H8O7): pH ≈ 2. Antioxidante natural para frutas y verduras cortadas.",
            "Refresco de cola: pH ≈ 2.5-3. Ácido fosfórico (H3PO4) y ácido carbónico. Disuelve la herrumbre del metal.",
            "Bicarbonato de sodio (NaHCO3): pH ≈ 8.3. Base débil. Antiácido, levadura química, desodorizante de refrigeradores. Al reaccionar con vinagre: NaHCO3 + CH3COOH → CH3COONa + H2O + CO2 (efervescencia).",
            "Blanqueador doméstico (NaClO al 5 %): pH ≈ 11-12. Base fuerte y oxidante. NUNCA mezclar con ácidos (genera Cl2 gaseoso, tóxico) ni con amoniaco (genera cloraminas, tóxicas).",
            "Destapacaños (NaOH al 30 %): pH ≈ 14. Base muy fuerte. Saponifica las grasas y descompone el cabello (proteínas) que obstruyen drenajes.",
            "Limpiador de baño tipo 'Viakal' o 'Tilex': pH ≈ 1-2. Ácido clorhídrico diluido o ácido fórmico para disolver el sarro.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La mezcla más peligrosa en limpieza doméstica es blanqueador + amoniaco (o productos amoniacales). Produce cloraminas gaseosas (NH2Cl, NHCl2, NCl3) que causan irritación severa de las vías respiratorias. La segunda más peligrosa es blanqueador + ácido (vinagre, limpiadores ácidos de baño), que libera cloro gas (Cl2), un gas de guerra utilizado en la Primera Guerra Mundial. El CENAVECE (Centro Nacional de Vigilancia Epidemiológica y Control de Enfermedades) reporta anualmente centenares de intoxicaciones por mezclas accidentales de productos de limpieza en México.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Tabla con productos de limpieza domésticos comunes, su pH y las combinaciones peligrosas marcadas en rojo",
          caption: "Conocer el pH de los productos de limpieza ayuda a usarlos con seguridad y eficacia.",
        },
      ],
    },
  },

  // ── 19 ── Aplicaciones cotidianas ─────────────────────────────────────────
  {
    slug: "cneyt-iv-biomoleculas-alimentacion",
    titulo: "Biomoléculas en la alimentación: carbohidratos, lípidos y proteínas",
    categoria: "Aplicaciones cotidianas",
    conceptos_clave: ["carbohidrato", "glucosa", "lípido", "proteína", "aminoácido", "digestión", "metabolismo"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Las biomoléculas son las moléculas orgánicas que construyen y alimentan los seres vivos. Los cuatro grandes grupos —carbohidratos, lípidos, proteínas y ácidos nucleicos— tienen estructuras químicas y funciones biológicas específicas. Entender su química permite interpretar las etiquetas nutricionales, comprender la digestión y el metabolismo, y tomar decisiones informadas sobre la alimentación. En México, país con alta prevalencia de diabetes tipo 2 y obesidad, esta comprensión es especialmente relevante.",
        },
        {
          tipo: "subtitulo",
          contenido: "Carbohidratos: glucosa y sus polímeros",
        },
        {
          tipo: "parrafo",
          contenido:
            "Los carbohidratos tienen la fórmula general (CH2O)n. La glucosa (C6H12O6) es el monosacárido fundamental: fuente primaria de energía celular y combustible del cerebro. La sacarosa (azúcar de mesa) es un disacárido de glucosa y fructosa. El almidón —polisacárido de miles de moléculas de glucosa— es el principal carbohidrato de reserva de las plantas y la fuente energética dominante de la dieta mexicana (tortilla, frijol, arroz). La digestión hidroliza los polisacáridos a monosacáridos: amilasa salival → amilasa pancreática → glucosidasas intestinales.",
        },
        {
          tipo: "subtitulo",
          contenido: "Lípidos y proteínas",
        },
        {
          tipo: "lista",
          items: [
            "Lípidos: triglicéridos (grasas y aceites), fosfolípidos (membranas celulares) y esteroles (colesterol, hormonas esteroides). La grasa saturada (manteca de cerdo, grasa de coco) tiene cadenas sin dobles enlaces y es sólida a temperatura ambiente. Los ácidos grasos insaturados del aceite de aguacate (oleico, C18:1) tienen un doble enlace cis que los hace líquidos y cardioprotectores.",
            "Proteínas: polímeros de aminoácidos unidos por enlaces peptídicos (–CO–NH–). Los 20 aminoácidos estándar se combinan en miles de secuencias para producir las decenas de miles de proteínas distintas de un organismo. 9 aminoácidos son esenciales: el cuerpo no puede sintetizarlos y deben obtenerse de la dieta. La tortilla + frijol es la combinación proteica ancestral de México: los cereales son deficientes en lisina pero ricos en metionina; las leguminosas lo opuesto. Juntos forman una proteína completa.",
            "Digestión de proteínas: pepsina gástrica (activa en pH ácido) → tripsina y quimotripsina pancreáticas → dipeptidasas intestinales → aminoácidos absorbidos en el intestino delgado.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "El índice glucémico (IG) mide la velocidad con que un alimento eleva la glucosa sanguínea. La tortilla de maíz nixtamalizado tiene un IG de ~52 (moderado), mientras que el pan blanco tiene ~70 (alto) y la glucosa pura es 100. La tortilla integral es más baja aún. Esto explica por qué la sustitución de la tortilla tradicional por pan de caja en la dieta mexicana moderna se asocia con mayor riesgo de diabetes tipo 2, según estudios del Instituto Nacional de Salud Pública.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de las tres biomoléculas energéticas: glucosa (anillo hexagonal), triglicérido (glicerol + 3 cadenas) y proteína (cadena de aminoácidos enrollada)",
          caption: "Carbohidratos, lípidos y proteínas: las tres biomoléculas que aportan energía en la dieta.",
        },
      ],
    },
  },

  // ── 20 ── Aplicaciones cotidianas ─────────────────────────────────────────
  {
    slug: "cneyt-iv-experimentos-caseros-seguridad",
    titulo: "Experimentos químicos caseros: ciencia con materiales accesibles y con seguridad",
    categoria: "Aplicaciones cotidianas",
    conceptos_clave: ["experimento casero", "seguridad en laboratorio", "indicador natural", "reacción efervescente", "protocolo de seguridad"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La química experimental no requiere un laboratorio equipado: muchas reacciones interesantes y educativas pueden realizarse en casa con materiales de cocina y limpieza accesibles. Sin embargo, toda actividad experimental requiere precauciones básicas de seguridad. Conocer las propiedades de los materiales, usar protección ocular (gafas o lentes de seguridad), trabajar en áreas ventiladas y nunca mezclar sustancias desconocidas son principios de seguridad que aplican igual en el laboratorio más equipado que en la cocina de casa.",
        },
        {
          tipo: "subtitulo",
          contenido: "Experimentos seguros y sus conceptos",
        },
        {
          tipo: "lista",
          items: [
            "Indicador de col morada: hervir hojas de col morada en agua, filtrar. La solución es morada (pH ~7). Agregar vinagre → rojo-rosado (ácido). Agregar bicarbonato → verde (básico). Concepto: indicadores ácido-base naturales, antocianinas como pigmentos sensibles al pH.",
            "Volcán de bicarbonato: mezclar 1 cdta. de bicarbonato con unas gotas de colorante rojo y un poco de detergente, agregar vinagre. Reacción: NaHCO3 + CH3COOH → CH3COONa + H2O + CO2↑. El CO2 libera espuma por el detergente. Conceptos: reacción ácido-base, producción de gas, estequiometría cualitativa.",
            "Densidades de líquidos: apilar en una probeta (o vaso transparente) aceite de maíz, agua coloreada, jarabe de maíz o miel y alcohol de 96°. Cada líquido flota sobre el más denso sin mezclarse. Conceptos: densidad, inmiscibilidad, polaridad.",
            "Cristalización de sal: disolver sal en agua caliente hasta saturar. Dejar enfriar lentamente con un hilo sumergido. Crecen cristales cúbicos de NaCl. Conceptos: solubilidad, cristalización, estructura cristalina.",
            "Oxidación de manzana: cortar manzana y sumergir la mitad en jugo de limón. La otra mitad se oxida (marrón); la tratada con limón permanece blanca. Conceptos: oxidación, antioxidantes (vitamina C como reductor), browning enzimático.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Reglas de oro de seguridad para experimentos caseros: (1) Nunca mezclar blanqueador con vinagre o amoniaco. (2) Usar gafas protectoras aunque sea para experimentos simples — los ojos son irreemplazables. (3) Trabajar siempre en área ventilada. (4) Lavar las manos con agua y jabón después de cualquier experimento. (5) Nunca probar sustancias desconocidas. (6) Tener a la mano el número de toxicología del CIATOX (Centro de Información sobre Intoxicaciones) de México: 800-200-8000.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Fotografía de un estudiante usando gafas de seguridad haciendo el experimento del indicador de col morada con distintas soluciones en vasos de diferentes colores",
          caption: "El indicador de col morada demuestra el pH con materiales de cocina: rojo en ácido, verde en base.",
        },
      ],
    },
  },

  // ── 21 ── Aplicaciones cotidianas ─────────────────────────────────────────
  {
    slug: "cneyt-iv-compuestos-organicos-vida",
    titulo: "Compuestos orgánicos y la vida: del etanol a las proteínas",
    categoria: "Aplicaciones cotidianas",
    conceptos_clave: ["compuesto orgánico", "grupo funcional", "etanol", "ácido acético", "glucosa", "química del carbono"],
    tiempo_lectura_minutos: 8,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La química orgánica es el estudio de los compuestos del carbono. El carbono es único entre todos los elementos: forma cuatro enlaces covalentes estables, puede enlazarse consigo mismo formando cadenas y anillos de cualquier longitud, y se combina fácilmente con hidrógeno, oxígeno, nitrógeno, azufre y fósforo. Esta versatilidad genera la inmensa diversidad de compuestos orgánicos — se conocen más de 20 millones — que son la base de todos los seres vivos, la mayoría de los medicamentos, los combustibles fósiles, los plásticos y los colorantes.",
        },
        {
          tipo: "subtitulo",
          contenido: "Grupos funcionales: el lenguaje de la química orgánica",
        },
        {
          tipo: "lista",
          items: [
            "Alcohol (–OH): el grupo hidroxilo. Etanol (C2H5OH): componente de bebidas alcohólicas, antiséptico al 70 %, combustible alternativo (gasolineras mexicanas venden E10, gasolina con 10 % de etanol). Metanol (CH3OH): tóxico, usado como combustible industrial, causa ceguera y muerte si se ingiere.",
            "Ácido carboxílico (–COOH): el grupo ácido. Ácido acético (CH3COOH): vinagre. Ácido cítrico (C6H8O7): limón, frutas. Ácido láctico (C3H6O3): yogurt, músculo fatigado.",
            "Aldehído (–CHO): vainillina (C8H8O3) da el aroma de la vainilla. México es el lugar de origen de la vainilla (Vanilla planifolia), cultivada principalmente en Papantla, Veracruz. La vainillina sintética se produce industrialmente desde guayacol o lignina.",
            "Éster (–COO–): aromas de frutas. El acetato de isoamilo (CH3COOC5H11) huele a plátano. Los ésteres se forman por reacción de un ácido con un alcohol (esterificación): CH3COOH + C2H5OH → CH3COOC2H5 + H2O.",
            "Amina (–NH2): grupo amino. Las aminas biogénicas como la histamina (alergia), la adrenalina (estrés) y la dopamina (placer) son aminas derivadas de aminoácidos.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "De los compuestos orgánicos simples a las biomoléculas",
        },
        {
          tipo: "parrafo",
          contenido:
            "Las biomoléculas son compuestos orgánicos de alta complejidad que realizan funciones biológicas específicas. La glucosa (C6H12O6) es un polialcohol-aldehído cíclico — tiene grupos –OH y un grupo –CHO que cierra el anillo. Las proteínas son polímeros de aminoácidos (compuestos que tienen simultáneamente grupo –NH2 y grupo –COOH). El ADN es un poliéster-amida del ácido fosfórico con azúcares y bases nitrogenadas. La vida es, en esencia, química orgánica funcionando en solución acuosa con catalizadores proteicos (enzimas).",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La vainilla de Papantla, Veracruz, es de Denominación de Origen: solo la vainillina extraída de las vainas de Vanilla planifolia cultivadas en la región del Totonacapan puede denominarse 'vainilla mexicana'. La diferencia química entre la vainilla natural y la sintética es la presencia de más de 200 compuestos aromáticos traza en la natural, frente al único compuesto principal de la sintética. El 95 % de la vainilla consumida en el mundo es sintética; la natural premium mexicana cotiza hasta 600 USD por kg.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Galería de estructuras orgánicas cotidianas: etanol, ácido acético, glucosa, vainillina y ácido cítrico con sus grupos funcionales destacados en color",
          caption: "Los grupos funcionales determinan las propiedades químicas y biológicas de los compuestos orgánicos.",
        },
      ],
    },
  },
] as const;

// ---------------------------------------------------------------------------
// SEED FUNCTION
// ---------------------------------------------------------------------------

export async function seedBibliotecaCNEYTIV(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed Biblioteca CNEYT-IV (21 fichas)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac")
    .select("id")
    .eq("codigo", "CNEYT-IV")
    .single();

  if (uacErr || !uacRow) {
    throw new Error(
      `UAC CNEYT-IV no encontrada. Ejecuta primero seed-mccems.ts y seed-cneytiv.ts. Error: ${uacErr?.message}`
    );
  }

  const rows = FICHAS_CNEYTIV.map((f, i) => ({
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

  if (error) throw new Error(`Error seeding fichas CNEYT-IV: ${error.message}`);

  console.log(`  ✓ ${rows.length} fichas de biblioteca de CNEYT-IV insertadas/actualizadas.`);
  console.log("\n✅ Seed Biblioteca CNEYT-IV completado.\n");
}

// ---------------------------------------------------------------------------
// ENTRY POINT
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
    console.error(
      "❌ Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY"
    );
    process.exit(1);
  }
  const sb = createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  seedBibliotecaCNEYTIV(sb).catch((err) => {
    console.error("❌ Error:", err.message);
    process.exit(1);
  });
}
