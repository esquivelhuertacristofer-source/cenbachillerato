/**
 * Seed de fichas de biblioteca para CNEYT-II (Ciencias Naturales, Experimentales y Tecnología II).
 * 20 fichas temáticas alineadas al MCCEMS 2025, Semestre 2.
 *
 * Uso: npx tsx scripts/seed-fichas-cneytii.ts
 * Idempotente: upsert por campo "slug".
 *
 * Meta educativa: Comprenda la importancia de la energía en los procesos naturales y
 * tecnológicos, analizando sus formas, transformaciones y la relación entre calor, trabajo
 * y temperatura en sistemas cotidianos.
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

const FICHAS_CNEYTII = [
  // ── 1 ──────────────────────────────────────────────────────────────────────
  {
    slug: "cneyt-ii-que-es-la-energia",
    titulo: "¿Qué es la energía?",
    categoria: "Física",
    conceptos_clave: ["energía", "sistema", "unidades de energía", "joule", "capacidad de trabajo"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La energía es una de las ideas más fundamentales y al mismo tiempo más escurridizas de la física. En términos sencillos, la energía es la capacidad de realizar trabajo o de producir cambios en un sistema. Cuando una pelota rueda, una bombilla alumbra o una planta crece, en todos esos casos hay energía involucrada. La energía no es una 'cosa' que se puede ver o tocar directamente: se reconoce por sus efectos.",
        },
        {
          tipo: "subtitulo",
          contenido: "Definición formal y unidades",
        },
        {
          tipo: "parrafo",
          contenido:
            "En el Sistema Internacional de Unidades (SI), la energía se mide en joules (J). Un joule equivale al trabajo necesario para levantar un objeto de 102 gramos a 1 metro de altura contra la gravedad terrestre. Para contextualizarlo: la energía que libera una caloría dietética es aproximadamente 4 186 J; la energía consumida por un foco de 100 W encendido durante un segundo es exactamente 100 J. En la industria eléctrica se usa con frecuencia el kilovatio-hora (kWh): 1 kWh = 3 600 000 J = 3.6 MJ.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama comparativo de escalas de energía: desde la energía de un fotón de luz visible (~3 × 10⁻¹⁹ J) hasta la energía de un huracán (~10¹⁸ J), pasando por una manzana al caer (~1 J) y la energía diaria de un adulto (~8 × 10⁶ J)",
          caption: "Escala de órdenes de magnitud de la energía en distintos contextos.",
        },
        {
          tipo: "subtitulo",
          contenido: "Formas de energía",
        },
        {
          tipo: "lista",
          items: [
            "Mecánica: asociada al movimiento (cinética) o a la posición (potencial gravitatoria o elástica).",
            "Térmica: energía de los movimientos aleatorios de los átomos y moléculas de un cuerpo.",
            "Química: almacenada en los enlaces químicos de las moléculas (combustibles, alimentos).",
            "Eléctrica: asociada al movimiento de cargas eléctricas.",
            "Radiante (electromagnética): transportada por ondas electromagnéticas, incluyendo la luz visible.",
            "Nuclear: almacenada en el núcleo del átomo; liberada en fisión y fusión nuclear.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La energía nunca desaparece: siempre se convierte de una forma en otra. Esta afirmación, que veremos con detalle en el principio de conservación, tiene una consecuencia práctica decisiva: cuando decimos que 'gastamos' energía, en realidad la transformamos en formas menos útiles, principalmente calor que se dispersa en el ambiente y ya no puede ser recuperado fácilmente.",
        },
      ],
    },
  },

  // ── 2 ──────────────────────────────────────────────────────────────────────
  {
    slug: "cneyt-ii-energia-cinetica",
    titulo: "Energía cinética: Ec = ½mv²",
    categoria: "Física",
    conceptos_clave: ["energía cinética", "masa", "velocidad", "Ec = ½mv²", "movimiento"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La energía cinética es la energía que posee un objeto debido a su movimiento. Un automóvil en marcha, una pelota de béisbol lanzada a 150 km/h, el viento que mueve las aspas de un aerogenerador: todos tienen energía cinética. Esta forma de energía depende de dos factores: la masa del objeto (m) y su velocidad (v).",
        },
        {
          tipo: "subtitulo",
          contenido: "La fórmula: Ec = ½mv²",
        },
        {
          tipo: "parrafo",
          contenido:
            "La energía cinética se calcula con la expresión: Ec = ½mv², donde m es la masa en kilogramos y v es la velocidad en metros por segundo. El resultado se obtiene en joules. Por ejemplo, un automóvil de 1 200 kg viajando a 90 km/h (25 m/s) tiene: Ec = ½ × 1 200 × (25)² = ½ × 1 200 × 625 = 375 000 J = 375 kJ. Al frenar, toda esa energía debe disiparse —en los frenos, como calor— para que el auto se detenga.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Observa que la velocidad entra al cuadrado en la fórmula. Esto significa que si un vehículo duplica su velocidad, su energía cinética se cuadruplica (no se duplica). Un automóvil a 100 km/h tiene cuatro veces más energía cinética que a 50 km/h. Esto explica por qué los accidentes a mayor velocidad son exponencialmente más peligrosos y por qué los límites de velocidad importan tanto.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Gráfica de Ec vs velocidad mostrando la relación cuadrática: a 10 m/s, 50 m/s y 100 m/s para un objeto de 1 kg, evidenciando el crecimiento rápido de la energía cinética",
          caption: "La energía cinética crece con el cuadrado de la velocidad.",
        },
        {
          tipo: "subtitulo",
          contenido: "Aplicaciones: energía eólica en México",
        },
        {
          tipo: "parrafo",
          contenido:
            "Los aerogeneradores aprovechan la energía cinética del viento. La potencia disponible en el viento es proporcional a v³ (velocidad al cubo), lo que explica por qué México busca sitios con vientos constantes y veloces. El Corredor Eólico del Istmo de Tehuantepec en Oaxaca, con vientos de 8-10 m/s, es uno de los mejores recursos eólicos del mundo: en 2024, la capacidad instalada en esa región superó los 2 500 MW, suficiente para abastecer a más de 1.5 millones de hogares.",
        },
      ],
    },
  },

  // ── 3 ──────────────────────────────────────────────────────────────────────
  {
    slug: "cneyt-ii-energia-potencial",
    titulo: "Energía potencial: Ep = mgh",
    categoria: "Física",
    conceptos_clave: ["energía potencial gravitatoria", "altura", "gravedad", "Ep = mgh", "almacenamiento de energía"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La energía potencial es la energía almacenada en un sistema debido a su posición o configuración. El tipo más familiar es la energía potencial gravitatoria: la energía que un objeto tiene por estar elevado sobre el suelo. Un libro en un estante, el agua represada en una presa o una piedra al borde de un acantilado poseen energía potencial gravitatoria que puede convertirse en movimiento cuando el objeto desciende.",
        },
        {
          tipo: "subtitulo",
          contenido: "La fórmula: Ep = mgh",
        },
        {
          tipo: "parrafo",
          contenido:
            "La energía potencial gravitatoria se calcula con: Ep = mgh, donde m es la masa en kg, g es la aceleración gravitacional (9.8 m/s² en la superficie terrestre) y h es la altura en metros respecto a un nivel de referencia elegido. Por ejemplo, un tanque de agua de 500 kg elevado 10 m tiene: Ep = 500 × 9.8 × 10 = 49 000 J = 49 kJ. Al abrirse la válvula, esa energía se convierte en energía cinética del agua.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de una presa hidroeléctrica mostrando cómo el agua almacenada a gran altura tiene energía potencial que se convierte en energía cinética al caer y luego en energía eléctrica en la turbina",
          caption: "Conversión de energía potencial a eléctrica en una central hidroeléctrica.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Las presas hidroeléctricas son literalmente 'baterías gravitacionales'. La CFE (Comisión Federal de Electricidad) opera la presa Manuel Moreno Torres 'Chicoasén' en Chiapas, con una capacidad instalada de 2 400 MW. Al almacenar agua a mayor altura, almacena energía potencial que puede despacharse en minutos cuando la red lo necesita, a diferencia de las plantas de ciclo combinado que tardan horas en arrancar.",
        },
        {
          tipo: "subtitulo",
          contenido: "Energía potencial elástica",
        },
        {
          tipo: "parrafo",
          contenido:
            "Existe también la energía potencial elástica, almacenada en objetos deformados (resortes, arcos, bandas elásticas). Se calcula con Ee = ½kx², donde k es la constante del resorte en N/m y x es la deformación en metros. Este principio es fundamental en los sistemas de suspensión de vehículos, en los relojes mecánicos y en los mecanismos de las raquetas deportivas.",
        },
      ],
    },
  },

  // ── 4 ──────────────────────────────────────────────────────────────────────
  {
    slug: "cneyt-ii-conservacion-energia",
    titulo: "Principio de conservación de la energía",
    categoria: "Física",
    conceptos_clave: ["conservación de la energía", "energía mecánica total", "sistema aislado", "transformación"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El principio de conservación de la energía es uno de los pilares de toda la física: en un sistema aislado, la energía total se conserva. No se crea ni se destruye; solo se transforma de una forma en otra. Este principio fue consolidado a mediados del siglo XIX gracias a los trabajos de Julius Robert von Mayer, James Prescott Joule y Hermann von Helmholtz, quienes de manera independiente establecieron la equivalencia entre calor y trabajo mecánico.",
        },
        {
          tipo: "subtitulo",
          contenido: "Energía mecánica total",
        },
        {
          tipo: "parrafo",
          contenido:
            "En ausencia de fricción y otras fuerzas disipativas, la energía mecánica total (Em = Ec + Ep) se conserva. Ejemplo clásico: una montaña rusa. En la cima (máxima altura, mínima velocidad): Em ≈ Ep máxima + Ec mínima. En el fondo del descenso (mínima altura, máxima velocidad): Em ≈ Ep mínima + Ec máxima. En ambos puntos, la suma es la misma (descontando la fricción). La fórmula es: ½mv₁² + mgh₁ = ½mv₂² + mgh₂.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "En la realidad siempre existe fricción. Cada transformación convierte parte de la energía útil en calor que se dispersa en el entorno y ya no puede usarse para hacer trabajo. Esto no viola la conservación: la energía total incluyendo ese calor se conserva. Pero la energía 'aprovechable' disminuye. Esta tendencia irreversible es estudiada por la segunda ley de la termodinámica.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de una montaña rusa con barras de energía en distintos puntos mostrando cómo la energía potencial se convierte en cinética y viceversa, con la barra total constante",
          caption: "Intercambio entre energía cinética y potencial en una montaña rusa.",
        },
        {
          tipo: "parrafo",
          contenido:
            "La conservación de la energía tiene implicaciones tecnológicas profundas. Los ingenieros que diseñan sistemas de frenado regenerativo para vehículos eléctricos (como los modelos de NIO, Tesla o los trenes del Metro de la CDMX) aprovechan este principio: al frenar, la energía cinética que de otro modo se perdería como calor se convierte en electricidad y se almacena en la batería, aumentando la eficiencia del vehículo.",
        },
      ],
    },
  },

  // ── 5 ──────────────────────────────────────────────────────────────────────
  {
    slug: "cneyt-ii-transformaciones-energeticas",
    titulo: "Transformaciones energéticas: cadenas de conversión",
    categoria: "Física",
    conceptos_clave: ["transformación de energía", "eficiencia", "pérdidas energéticas", "cadena de conversión"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "En la naturaleza y en la tecnología rara vez la energía existe en una sola forma pura: casi siempre está en tránsito, transformándose de una forma en otra. Una planta solar convierte radiación electromagnética en electricidad; un músculo convierte energía química (glucosa) en trabajo mecánico; una pila convierte energía química en eléctrica. Estas cadenas de conversión son el corazón de la tecnología moderna.",
        },
        {
          tipo: "subtitulo",
          contenido: "Eficiencia de conversión",
        },
        {
          tipo: "parrafo",
          contenido:
            "Ninguna conversión energética es perfecta: siempre hay pérdidas, principalmente en forma de calor. La eficiencia (η) mide qué fracción de la energía de entrada se convierte en energía útil de salida: η = (Energía útil de salida / Energía total de entrada) × 100%. Un motor de gasolina típico tiene una eficiencia de solo 25-30%: el 70-75% se pierde como calor en los gases de escape y en la refrigeración del motor. Un motor eléctrico, en contraste, puede alcanzar eficiencias del 90-95%.",
        },
        {
          tipo: "lista",
          items: [
            "Foco incandescente: ~5% de eficiencia (95% del calor se desperdicia como calor infrarrojo).",
            "LED: ~40-50% de eficiencia (de ahí su popularidad y ahorro).",
            "Panel solar fotovoltaico comercial: ~18-22% de eficiencia.",
            "Turbina de gas de ciclo combinado: ~55-60% de eficiencia.",
            "Célula de combustible de hidrógeno: hasta 60-70% de eficiencia.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "México consumió en 2023 aproximadamente 1 840 PJ (petajoules) de energía primaria según datos de la SENER (Secretaría de Energía). De esa cifra, solo una fracción llega como 'trabajo útil' al usuario final después de las pérdidas en generación, transmisión y uso. Mejorar la eficiencia energética es tan importante como aumentar la generación de energía renovable.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de flujo de energía desde un depósito de petróleo hasta una bombilla eléctrica, mostrando las pérdidas porcentuales en cada etapa: extracción, refinado, transporte, generación, transmisión y uso final",
          caption: "Cadena de conversión energética del petróleo a la luz artificial.",
        },
      ],
    },
  },

  // ── 6 ──────────────────────────────────────────────────────────────────────
  {
    slug: "cneyt-ii-trabajo-mecanico",
    titulo: "Trabajo mecánico: W = F·d",
    categoria: "Física",
    conceptos_clave: ["trabajo mecánico", "fuerza", "desplazamiento", "W = Fd", "newton"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "En física, el término 'trabajo' tiene un significado preciso y diferente al uso cotidiano. Un estudiante que sostiene un libro pesado durante horas sin moverse no realiza trabajo mecánico, porque no hay desplazamiento. El trabajo mecánico se define como el producto de la fuerza aplicada sobre un objeto por el desplazamiento producido en la dirección de esa fuerza.",
        },
        {
          tipo: "subtitulo",
          contenido: "La fórmula: W = F·d",
        },
        {
          tipo: "parrafo",
          contenido:
            "La expresión matemática del trabajo es: W = F × d × cos(θ), donde F es la fuerza en newtons (N), d es el desplazamiento en metros (m) y θ es el ángulo entre la dirección de la fuerza y la dirección del desplazamiento. Cuando la fuerza y el desplazamiento son paralelos (θ = 0°), cos(θ) = 1 y W = F·d. Por ejemplo, empujar una caja con 50 N a lo largo de 3 m: W = 50 × 3 = 150 J.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El trabajo puede ser positivo o negativo. El trabajo es positivo cuando la fuerza y el desplazamiento tienen la misma dirección (empujar una caja hacia adelante). Es negativo cuando la fuerza se opone al desplazamiento (fricción). Y es cero cuando la fuerza es perpendicular al desplazamiento (un satélite en órbita circular: la gravedad apunta al centro pero el satélite se mueve en dirección perpendicular).",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Tres casos del trabajo mecánico: fuerza paralela al desplazamiento (W > 0), fuerza perpendicular (W = 0) y fuerza opuesta (W < 0), con vectores indicando cada situación",
          caption: "El trabajo mecánico depende del ángulo entre la fuerza y el desplazamiento.",
        },
        {
          tipo: "parrafo",
          contenido:
            "El teorema trabajo-energía establece que el trabajo neto realizado sobre un objeto es igual al cambio en su energía cinética: W_neto = ΔEc = ½mv₂² − ½mv₁². Este teorema conecta los conceptos de fuerza, movimiento y energía en una sola expresión poderosa que es la base del diseño de motores, frenos y sistemas de transporte.",
        },
      ],
    },
  },

  // ── 7 ──────────────────────────────────────────────────────────────────────
  {
    slug: "cneyt-ii-potencia-mecanica",
    titulo: "Potencia mecánica: P = W/t",
    categoria: "Física",
    conceptos_clave: ["potencia", "watt", "caballo de vapor", "P = W/t", "velocidad de trabajo"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La potencia es la rapidez con que se realiza trabajo o se transforma energía. Dos máquinas que hacen el mismo trabajo no son igualmente potentes si una lo hace en 10 segundos y la otra en 10 horas. La potencia mide cuánto trabajo se hace por unidad de tiempo.",
        },
        {
          tipo: "subtitulo",
          contenido: "La fórmula: P = W/t",
        },
        {
          tipo: "parrafo",
          contenido:
            "La potencia se calcula como P = W/t, donde W es el trabajo en joules y t es el tiempo en segundos. La unidad de potencia en el SI es el watt (W): 1 W = 1 J/s. Por ejemplo, una persona que sube escaleras haciendo 3 000 J de trabajo en 30 s tiene una potencia de 100 W. Una motocicleta de 50 kW puede hacer ese mismo trabajo en apenas 0.06 s. La unidad anglosajona 'caballo de vapor' (hp) equivale a 745.7 W.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "James Watt, el ingeniero escocés que perfeccionó la máquina de vapor en el siglo XVIII, definió el 'caballo de vapor' para comparar sus máquinas con el trabajo que podía hacer un caballo. Midió experimentalmente que un caballo podía hacer girar un molino levantando 33 000 libras-pie por minuto. La unidad SI de potencia se bautizó 'watt' en su honor. Su motor de vapor fue clave en la Revolución Industrial.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Comparativa de potencia de distintas fuentes: una persona en bicicleta (~150 W), un auto compacto (~100 kW), un avión comercial (~100 MW) y la planta solar fotovoltaica más grande de México (~1 GW)",
          caption: "Escala de potencias: del cuerpo humano a las grandes centrales eléctricas.",
        },
        {
          tipo: "parrafo",
          contenido:
            "En el contexto eléctrico, la potencia consumida por un dispositivo es P = V × I, donde V es el voltaje en volts y I es la corriente en amperes. La energía consumida a lo largo del tiempo es el producto de la potencia por el tiempo: E = P × t. Por eso, en tu recibo de luz de CFE, el consumo se mide en kilovatio-horas (kWh): 1 kWh = 1 000 W × 3 600 s = 3.6 MJ.",
        },
      ],
    },
  },

  // ── 8 ──────────────────────────────────────────────────────────────────────
  {
    slug: "cneyt-ii-primera-ley-termodinamica",
    titulo: "Primera ley de la termodinámica",
    categoria: "Termodinámica",
    conceptos_clave: ["primera ley", "energía interna", "calor", "trabajo termodinámico", "ΔU = Q − W"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La primera ley de la termodinámica es la expresión matemática del principio de conservación de la energía aplicado a sistemas termodinámicos. Establece que el cambio en la energía interna de un sistema (ΔU) es igual al calor transferido al sistema (Q) menos el trabajo que el sistema realiza sobre el entorno (W): ΔU = Q − W.",
        },
        {
          tipo: "subtitulo",
          contenido: "Energía interna, calor y trabajo",
        },
        {
          tipo: "parrafo",
          contenido:
            "La energía interna (U) es la suma de todas las energías cinéticas y potenciales de las partículas que componen un sistema. El calor (Q) es la energía que fluye entre un sistema y su entorno debido a una diferencia de temperatura: es energía en tránsito. El trabajo termodinámico (W) es la energía transferida cuando el sistema cambia de volumen empujando contra una presión externa, como cuando un gas se expande en un pistón. La primera ley dice que la única forma de cambiar la energía interna de un sistema es añadiéndole calor o extrayendo trabajo de él (o viceversa).",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La primera ley prohíbe la máquina de movimiento perpetuo de primer tipo: un dispositivo que produzca trabajo sin ninguna fuente de energía. Toda la energía producida debe provenir de alguna parte. Los inventores que han prometido 'motores de agua' o 'generadores de energía libre' violan este principio y sus dispositivos, invariablemente, no funcionan.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de un sistema termodinámico en una caja: flechas de calor Q entrando desde el entorno caliente, trabajo W saliendo por el pistón, y la energía interna U representada como vibraciones de partículas en el interior",
          caption: "La primera ley: el balance energético de un sistema.",
        },
        {
          tipo: "parrafo",
          contenido:
            "Aplicación cotidiana: un motor de combustión interna. El combustible aporta calor Q al gas en el cilindro; parte de ese calor realiza trabajo W sobre el pistón que mueve el automóvil; y el resto calienta el motor o se expulsa con los gases de escape (ΔU ≈ 0 en régimen estacionario). Por la primera ley, W = Q_entrada − Q_disipado, lo que fija un límite superior a la eficiencia que exploramos con la segunda ley.",
        },
      ],
    },
  },

  // ── 9 ──────────────────────────────────────────────────────────────────────
  {
    slug: "cneyt-ii-segunda-ley-entropia",
    titulo: "Segunda ley de la termodinámica y entropía",
    categoria: "Termodinámica",
    conceptos_clave: ["segunda ley", "entropía", "irreversibilidad", "flecha del tiempo", "eficiencia máxima"],
    tiempo_lectura_minutos: 8,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Si la primera ley dice que la energía se conserva, la segunda ley dice que no toda esa energía puede aprovecharse para hacer trabajo útil. La segunda ley de la termodinámica establece que el calor fluye espontáneamente de los cuerpos calientes a los fríos —nunca al revés— y que cualquier proceso natural tiende a aumentar el desorden total del universo. Este desorden se cuantifica con una magnitud llamada entropía (S).",
        },
        {
          tipo: "subtitulo",
          contenido: "Entropía: el desorden del universo",
        },
        {
          tipo: "parrafo",
          contenido:
            "La entropía es una medida del grado de desorden o aleatoriedad de un sistema. A nivel molecular, un gas caliente y expandido tiene más entropía que uno frío y comprimido, porque sus moléculas están más dispersas y en mayor número de configuraciones posibles. La segunda ley establece que en un sistema aislado, la entropía total siempre aumenta o se mantiene constante: ΔS_universo ≥ 0. Nunca disminuye espontáneamente.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La entropía es la razón por la que el tiempo solo fluye hacia adelante. Una taza de café mezclada con leche nunca se 'desmezclará' espontáneamente. Los seres vivos creamos orden local (organismos complejos) a costa de aumentar aún más el desorden en el entorno: para sobrevivir, disipamos calor y producimos desechos, aumentando la entropía del universo. La vida no viola la segunda ley: la obedece pagando el costo termodinámico.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Secuencia de tres imágenes: un cubo de hielo ordenado, el proceso de fusión y el agua líquida desordenada, con el símbolo de entropía S aumentando de izquierda a derecha",
          caption: "Al fundirse el hielo, la entropía del sistema aumenta.",
        },
        {
          tipo: "parrafo",
          contenido:
            "La eficiencia máxima teórica de cualquier motor de calor está limitada por la eficiencia del ciclo de Carnot: η_Carnot = 1 − T_fría/T_caliente, donde las temperaturas se miden en kelvin. Un motor entre una fuente caliente a 500 K y un sumidero frío a 300 K no puede ser más eficiente que 1 − 300/500 = 40%, independientemente de cómo se construya. Ningún ingenio humano puede superar este límite: lo dicta la segunda ley.",
        },
      ],
    },
  },

  // ── 10 ─────────────────────────────────────────────────────────────────────
  {
    slug: "cneyt-ii-calor-vs-temperatura",
    titulo: "Calor vs. temperatura: diferencias fundamentales",
    categoria: "Termodinámica",
    conceptos_clave: ["calor", "temperatura", "capacidad calorífica", "equilibrio térmico", "escala Kelvin"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Uno de los errores conceptuales más frecuentes en física es confundir calor con temperatura. Son conceptos distintos aunque relacionados. La temperatura mide la energía cinética promedio de las partículas de un cuerpo —qué tan rápido vibran o se mueven—. El calor, en cambio, es la energía que fluye entre dos sistemas por diferencia de temperatura. Dicho de otro modo: la temperatura es un estado; el calor es un proceso.",
        },
        {
          tipo: "subtitulo",
          contenido: "Escalas de temperatura",
        },
        {
          tipo: "lista",
          items: [
            "Celsius (°C): 0 °C es el punto de fusión del agua; 100 °C es el punto de ebullición al nivel del mar. De uso cotidiano en México y la mayor parte del mundo.",
            "Fahrenheit (°F): usa Estados Unidos. Conversión: T(°F) = T(°C) × 9/5 + 32.",
            "Kelvin (K): escala absoluta. 0 K (−273.15 °C) es el cero absoluto, donde en teoría cesa todo movimiento térmico. Conversión: T(K) = T(°C) + 273.15. Es la escala científica universal.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El metal de una silla al sol y el cojín del asiento pueden estar a la misma temperatura, pero el metal se siente más caliente al tacto. ¿Por qué? Porque el metal tiene mayor conductividad térmica y transfiere calor más rápidamente desde sus átomos hasta los receptores de temperatura de tu piel. Esto muestra que la sensación de 'caliente' depende también de la velocidad de transferencia de calor, no solo de la temperatura.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Termómetro de tres escalas paralelas (Celsius, Fahrenheit, Kelvin) con los puntos de referencia marcados: fusión del agua, ebullición del agua y temperatura corporal",
          caption: "Comparativa de las tres escalas de temperatura más usadas.",
        },
        {
          tipo: "parrafo",
          contenido:
            "La capacidad calorífica específica (c) de una sustancia indica cuánto calor Q es necesario para elevar 1 kg de esa sustancia en 1 °C: Q = mcΔT. El agua tiene c = 4 186 J/(kg·°C), uno de los valores más altos de los líquidos comunes, lo que la convierte en un excelente refrigerante y moderador climático. México, con costas en el Pacífico y el Golfo, se beneficia de este efecto: las ciudades costeras tienen menores variaciones térmicas que las del altiplano.",
        },
      ],
    },
  },

  // ── 11 ─────────────────────────────────────────────────────────────────────
  {
    slug: "cneyt-ii-mecanismos-transferencia-calor",
    titulo: "Mecanismos de transferencia de calor",
    categoria: "Termodinámica",
    conceptos_clave: ["conducción", "convección", "radiación", "aislante térmico", "transferencia de calor"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El calor no viaja de la misma manera en todos los contextos. Existen tres mecanismos de transferencia de calor: conducción, convección y radiación. Comprender cada uno es esencial para el diseño de edificios eficientes, sistemas de calefacción, electrodomésticos y hasta ropa de alto rendimiento.",
        },
        {
          tipo: "subtitulo",
          contenido: "Conducción",
        },
        {
          tipo: "parrafo",
          contenido:
            "La conducción es la transferencia de calor a través de un material sólido (o fluido en reposo) por contacto directo entre partículas. Los metales son excelentes conductores: sus electrones libres transportan energía con rapidez. La madera, el aire y los plásticos son malos conductores (aislantes). La ley de Fourier describe la conducción: Q/t = k × A × ΔT / d, donde k es la conductividad térmica del material, A el área de contacto, ΔT la diferencia de temperatura y d el espesor.",
        },
        {
          tipo: "subtitulo",
          contenido: "Convección",
        },
        {
          tipo: "parrafo",
          contenido:
            "La convección transfiere calor a través del movimiento de un fluido (líquido o gas). Cuando el fluido se calienta, se expande, su densidad disminuye y asciende; el fluido más frío y denso desciende para ocupar su lugar. Esto crea corrientes de convección. El viento, las corrientes oceánicas y el funcionamiento de los calentadores de agua son ejemplos de convección. Las brisas marinas en Veracruz o Acapulco son causadas por diferencias en cómo el mar y la tierra absorben y liberan calor.",
        },
        {
          tipo: "subtitulo",
          contenido: "Radiación",
        },
        {
          tipo: "parrafo",
          contenido:
            "La radiación es la transferencia de calor mediante ondas electromagnéticas —principalmente infrarrojas— sin necesidad de materia. Es el único mecanismo que opera en el vacío. Así llega el calor del Sol a la Tierra (150 millones de km de vacío). Todo cuerpo con temperatura mayor al cero absoluto irradia energía. La ley de Stefan-Boltzmann establece que la potencia irradiada es proporcional a T⁴ (temperatura en kelvin a la cuarta potencia).",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "La cubierta plateada de los termos y los cobertores de emergencia de los corredores de maratón funcionan por el mismo principio: la superficie reflectante reduce la pérdida de calor por radiación. Los edificios con ventanas de doble vidrio y cámara de aire entre los paneles aprovechan que el aire quieto es mal conductor y hay poca convección en el espacio cerrado, reduciendo la pérdida de calor en invierno.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Ilustración de los tres mecanismos: barra metálica calentada en un extremo (conducción), olla con agua hirviendo mostrando corrientes de convección, y el Sol enviando radiación al planeta Tierra a través del vacío",
          caption: "Conducción, convección y radiación: los tres mecanismos de transferencia de calor.",
        },
      ],
    },
  },

  // ── 12 ─────────────────────────────────────────────────────────────────────
  {
    slug: "cneyt-ii-huella-de-carbono",
    titulo: "Huella de carbono: energía y cambio climático",
    categoria: "Energía y sociedad",
    conceptos_clave: ["huella de carbono", "CO₂ equivalente", "gases de efecto invernadero", "cambio climático", "ciclo del carbono"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La huella de carbono es la cantidad total de gases de efecto invernadero (GEI) emitidos directa o indirectamente por una persona, organización, evento o producto, expresada en toneladas de CO₂ equivalente (tCO₂e). La quema de combustibles fósiles para producir energía es la principal fuente de estos gases: el CO₂, el metano (CH₄) y el óxido nitroso (N₂O) atrapan el calor infrarrojo en la atmósfera, intensificando el efecto invernadero natural y elevando la temperatura global.",
        },
        {
          tipo: "subtitulo",
          contenido: "México y las emisiones de GEI",
        },
        {
          tipo: "parrafo",
          contenido:
            "Según el Inventario Nacional de Emisiones publicado por el INECC (Instituto Nacional de Ecología y Cambio Climático), México emitió en 2021 aproximadamente 683 millones de toneladas de CO₂e, representando cerca del 1.2% de las emisiones globales. El sector energético (generación eléctrica y transporte) concentra alrededor del 68% de las emisiones nacionales. La huella de carbono per cápita en México es de unos 5.4 tCO₂e al año, frente a los 15-16 tCO₂e promedio de Estados Unidos.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El Acuerdo de París (2015) establece como meta limitar el calentamiento global a menos de 2 °C por encima de los niveles preindustriales, y esforzarse por no superar 1.5 °C. Para lograrlo, el mundo debe alcanzar emisiones netas cero alrededor de 2050. México se comprometió en su NDC (Contribución Determinada a Nivel Nacional) a reducir sus emisiones en un 22% incondicionalmente para 2030 respecto a un escenario tendencial.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Gráfica de barras de la huella de carbono promedio de distintos países en tCO₂e per cápita, destacando México (~5.4), EUA (~15), Alemania (~9), India (~2) y la meta necesaria para 2050 (~2 tCO₂e)",
          caption: "Huella de carbono per cápita comparada: México en el contexto global.",
        },
        {
          tipo: "parrafo",
          contenido:
            "Calcular tu propia huella de carbono permite identificar las fuentes más significativas de tus emisiones personales y tomar decisiones informadas para reducirlas. A nivel individual, los mayores contribuyentes suelen ser el transporte (especialmente viajes en avión y uso de automóvil), la alimentación (las dietas con alto consumo de carne de res producen 3-4 veces más GEI que las dietas vegetarianas) y el consumo de energía en el hogar.",
        },
      ],
    },
  },

  // ── 13 ─────────────────────────────────────────────────────────────────────
  {
    slug: "cneyt-ii-energias-renovables-mexico",
    titulo: "Fuentes renovables en México: solar, eólica y geotérmica",
    categoria: "Energía y sociedad",
    conceptos_clave: ["energía solar fotovoltaica", "energía eólica", "energía geotérmica", "SENER", "CFE", "capacidad instalada"],
    tiempo_lectura_minutos: 8,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "México posee una dotación extraordinaria de recursos energéticos renovables. Su ubicación geográfica le otorga una de las mayores irradiaciones solares del mundo, especialmente en el norte del país; el Istmo de Tehuantepec alberga uno de los mejores recursos eólicos terrestres del planeta; y el Cinturón Volcánico Transmexicano provee calor geotérmico explotable en varios estados. Sin embargo, el aprovechamiento de estos recursos sigue siendo inferior a su potencial.",
        },
        {
          tipo: "subtitulo",
          contenido: "Energía solar",
        },
        {
          tipo: "parrafo",
          contenido:
            "El estado de Sonora recibe una irradiación solar horizontal global (GHI) de hasta 6.5 kWh/m²/día, una de las más altas del mundo. El Parque Solar Puerto Peñasco, inaugurado en 2019, tiene 145 000 paneles fotovoltaicos y una capacidad de 46 MW. El parque solar más grande en operación en México a 2024 fue Aguascalientes (Villanueva), con 1 700 MW de capacidad instalada. La energía solar fotovoltaica convierte directamente la radiación solar en electricidad mediante el efecto fotoeléctrico: los fotones liberan electrones en el semiconductor (silicio) generando corriente continua.",
        },
        {
          tipo: "subtitulo",
          contenido: "Energía eólica",
        },
        {
          tipo: "parrafo",
          contenido:
            "El Corredor Eólico del Istmo de Tehuantepec en Oaxaca concentra la mayor parte de la capacidad eólica instalada de México: vientos constantes de 8-12 m/s durante más de 3 000 horas al año. En 2024 México tenía instalados más de 7 000 MW de capacidad eólica, con proyectos adicionales en Tamaulipas, Jalisco y Baja California. Un aerogenerador moderno de 3 MW puede abastecer a unos 1 000 hogares mexicanos.",
        },
        {
          tipo: "subtitulo",
          contenido: "Energía geotérmica",
        },
        {
          tipo: "parrafo",
          contenido:
            "México es el quinto productor mundial de energía geotérmica. El campo geotérmico de Cerro Prieto, en Baja California, tiene una capacidad instalada de 570 MW y genera electricidad desde 1973. La energía geotérmica aprovecha el calor del interior de la Tierra —que proviene principalmente de la desintegración de elementos radiactivos en el manto y del calor residual de la formación del planeta hace 4 500 millones de años.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "A pesar de estos recursos, en 2023 solo el 28% de la electricidad generada en México provenía de fuentes renovables, frente a un promedio de 37% en la OCDE. La Ley de la Industria Eléctrica de 2021 y los debates sobre el papel de la CFE han creado incertidumbre regulatoria que ha frenado inversiones en renovables. La transición energética de México requiere marcos legales estables y certidumbre para los inversionistas.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Mapa de México con íconos de sol en Sonora y el Bajío, íconos de aerogeneradores en el Istmo de Tehuantepec y Tamaulipas, e íconos geotérmicos en Baja California y el Eje Volcánico",
          caption: "Distribución de los principales recursos renovables en México.",
        },
      ],
    },
  },

  // ── 14 ─────────────────────────────────────────────────────────────────────
  {
    slug: "cneyt-ii-transicion-energetica",
    titulo: "Transición energética: del carbono a las renovables",
    categoria: "Energía y sociedad",
    conceptos_clave: ["transición energética", "descarbonización", "mix energético", "almacenamiento de energía", "red eléctrica"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La transición energética es el proceso histórico de transformar los sistemas de producción y consumo de energía, pasando de depender mayoritariamente de los combustibles fósiles (carbón, petróleo, gas natural) hacia fuentes renovables y de bajas emisiones. Es el mayor desafío tecnológico, económico y social del siglo XXI, y México ocupa en él una posición peculiar: es simultáneamente productor de petróleo y país vulnerable al cambio climático.",
        },
        {
          tipo: "subtitulo",
          contenido: "Los retos técnicos de la transición",
        },
        {
          tipo: "parrafo",
          contenido:
            "La principal limitación de las energías renovables es su intermitencia: el sol no brilla de noche y el viento no sopla siempre. Para que una red eléctrica moderna basada en renovables sea confiable, necesita soluciones de almacenamiento —baterías de gran escala, bombeo hidráulico, hidrógeno verde— o fuentes de respaldo (gas natural, geotérmica, nuclear) que sean despachables en cualquier momento. El costo de las baterías de iones de litio ha caído más del 90% entre 2010 y 2024, pero el almacenamiento a escala de días o semanas sigue siendo un desafío sin resolver.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "La Agencia Internacional de Energías Renovables (IRENA) proyecta que para 2050 el 90% de la electricidad mundial podría provenir de fuentes renovables. El costo nivelado de la electricidad solar (LCOE) ya es el más bajo de la historia en regiones con alta irradiación: en 2024, algunos proyectos en Chile y Arabia Saudita contrataron energía solar a menos de 0.015 USD/kWh, más barato que cualquier combustible fósil.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Gráfica de la evolución del mix eléctrico global 2000-2050 (proyectado), mostrando la disminución de carbón y gas, y el aumento de solar y eólica hasta dominar la generación hacia 2040-2050",
          caption: "Trayectoria proyectada de la transición eléctrica global hasta 2050.",
        },
        {
          tipo: "parrafo",
          contenido:
            "Para México, la transición energética implica decisiones complejas sobre el futuro de Pemex y sus ingresos petroleros (que representan una fracción significativa del presupuesto federal), el empleo en regiones productoras de combustibles fósiles como Tabasco y Campeche, y la seguridad energética. La electrificación del transporte —con más de 5 millones de vehículos eléctricos proyectados para México en 2030— añadirá presión adicional sobre la red eléctrica.",
        },
      ],
    },
  },

  // ── 15 ─────────────────────────────────────────────────────────────────────
  {
    slug: "cneyt-ii-consumo-energetico-hogar",
    titulo: "Consumo energético en el hogar",
    categoria: "Energía y sociedad",
    conceptos_clave: ["eficiencia energética", "kWh", "tarifa eléctrica", "CFE", "doméstico", "ahorro energético"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El sector residencial representa alrededor del 18% del consumo eléctrico total de México, según datos de la SENER. Entender cómo se distribuye ese consumo dentro de un hogar y qué decisiones tienen mayor impacto es clave tanto para reducir el gasto familiar como para disminuir la presión sobre la red eléctrica y las emisiones de CO₂.",
        },
        {
          tipo: "subtitulo",
          contenido: "¿Qué consume más en un hogar mexicano?",
        },
        {
          tipo: "lista",
          items: [
            "Climatización (aire acondicionado y calefacción): 30-50% del consumo eléctrico en climas extremos como Sonora, Baja California o Chihuahua.",
            "Refrigerador: 15-25% del consumo total; funciona las 24 horas del día.",
            "Calentador de agua: 10-20%; en hogares con gas LP/natural, pero eléctrico en zonas sin gas.",
            "Iluminación: 10-15%; se reduce significativamente con el cambio a LED.",
            "Televisión y electrónica: 5-10%.",
            "Lavadora y otros electrodomésticos: el resto.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La CFE en México aplica tarifas domésticas subsidiadas con límites de consumo. La tarifa DAC (doméstica de alto consumo) aplica a usuarios que consumen más del doble del límite básico durante 6 de 12 meses: el precio puede ser 10 veces mayor que la tarifa 1. Un refrigerador antiguo de los años 90 puede consumir 3-4 veces más energía que uno actual con certificación FIDE (Fideicomiso para el Ahorro de Energía Eléctrica). Reemplazarlo puede evitar el cambio a tarifa DAC.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Gráfico de pastel del consumo eléctrico promedio de un hogar mexicano, con segmentos para climatización, refrigerador, calentador, iluminación y electrónica",
          caption: "Distribución típica del consumo eléctrico en un hogar mexicano.",
        },
        {
          tipo: "parrafo",
          contenido:
            "Medidas prácticas para reducir el consumo: sustituir focos incandescentes por LED (ahorro de 80% en iluminación), usar el aire acondicionado a 24-25 °C en lugar de 18-20 °C (cada grado adicional reduce el consumo un 6-8%), desconectar aparatos en modo standby (el 'vampiro energético' puede representar el 5-10% del consumo), y lavar ropa con agua fría. Instalar un panel solar de 1-2 kW puede cubrir el 60-80% del consumo mensual promedio en ciudades del norte de México.",
        },
      ],
    },
  },

  // ── 16 ─────────────────────────────────────────────────────────────────────
  {
    slug: "cneyt-ii-debate-energetico-mexico",
    titulo: "El debate energético en México: dilemas y perspectivas",
    categoria: "Energía y sociedad",
    conceptos_clave: ["política energética", "soberanía energética", "CFE", "Pemex", "inversión privada", "renovables vs fósiles"],
    tiempo_lectura_minutos: 8,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La energía no es solo un tema técnico: es un campo de debate político, económico y social profundamente cargado de valores e intereses. En México, las discusiones sobre si privatizar o fortalecer la CFE, si priorizar el petróleo de Pemex o acelerar las renovables, si construir plantas de gas natural o apostar por el almacenamiento con baterías, no tienen respuestas únicas. Comprender los argumentos de cada postura es ejercicio de ciudadanía crítica.",
        },
        {
          tipo: "subtitulo",
          contenido: "Las posturas en debate",
        },
        {
          tipo: "parrafo",
          contenido:
            "Quienes defienden la 'soberanía energética' del Estado argumentan que la energía es un bien estratégico que no debe quedar en manos privadas, que la CFE y Pemex garantizan el acceso universal al servicio y que sus ganancias benefician a todos los mexicanos. Quienes favorecen la apertura a la inversión privada señalan que la CFE y Pemex no tienen el capital suficiente para modernizarse a la velocidad que el país necesita, que la competencia baja tarifas y que los proyectos renovables privados han sido más eficientes en costo.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Este debate tiene consecuencias concretas. La Ley de la Industria Eléctrica de 2021, que otorgó prioridad de despacho a las plantas de CFE (principalmente termoeléctricas de combustibles fósiles) sobre plantas renovables privadas, fue impugnada ante la Suprema Corte y ante mecanismos arbitrales del T-MEC. Los inversionistas internacionales la señalaron como una señal de inseguridad jurídica. Mientras tanto, el costo promedio de generación de la red eléctrica nacional aumentó, afectando la competitividad industrial de México.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Balanza con dos platos: en un lado, un pozo petrolero y una termoeléctrica con la etiqueta 'soberanía energética'; en el otro, aerogeneradores y paneles solares con la etiqueta 'transición renovable'. Debajo, la silueta del mapa de México",
          caption: "El dilema energético mexicano: soberanía vs. transición verde.",
        },
        {
          tipo: "parrafo",
          contenido:
            "Para reflexionar: ¿Puede un país al mismo tiempo ampliar la producción de petróleo (Pemex extrajo en 2023 cerca de 1.8 millones de barriles diarios) y comprometerse con la reducción de emisiones de GEI? ¿Qué responsabilidades tienen los países en desarrollo que históricamente emitieron poco pero sufren más los efectos del cambio climático? ¿Cómo se equilibra el desarrollo económico con la sustentabilidad ambiental? Estas preguntas no tienen respuesta fácil, pero formularlas correctamente es el primer paso para participar en la democracia energética del siglo XXI.",
        },
      ],
    },
  },

  // ── 17 ─────────────────────────────────────────────────────────────────────
  {
    slug: "cneyt-ii-metodo-cientifico-energia",
    titulo: "Método científico aplicado a fenómenos energéticos",
    categoria: "Metodología científica",
    conceptos_clave: ["método científico", "observación", "hipótesis", "fenómeno energético", "investigación experimental"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El método científico es el procedimiento sistemático que nos permite investigar fenómenos naturales con rigor y objetividad. Cuando lo aplicamos al estudio de la energía —sus transformaciones, flujos y efectos— podemos responder preguntas que de otro modo quedarían en el terreno de la intuición o la suposición. Todo el conocimiento sobre la energía que vemos en los libros de texto fue construido mediante este proceso.",
        },
        {
          tipo: "subtitulo",
          contenido: "Etapas del método científico en investigaciones energéticas",
        },
        {
          tipo: "lista",
          items: [
            "Observación: identifica un fenómeno energético concreto y medible. Ejemplo: 'Un cubo de hielo en un vaso de agua se derrite más rápido cuando el vaso está al sol que cuando está en la sombra'.",
            "Pregunta de investigación: formula una pregunta específica y respondible. '¿Cómo afecta la radiación solar directa a la tasa de fusión de hielo?'",
            "Hipótesis: una predicción falsable. 'A mayor intensidad de radiación solar, mayor tasa de fusión del hielo (gramos por minuto)'.",
            "Diseño experimental: planifica cómo medir, qué variables controlar y qué instrumentos usar.",
            "Recolección de datos: realiza el experimento y registra las mediciones con precisión.",
            "Análisis: busca patrones, calcula promedios, grafica los datos.",
            "Conclusión: ¿los datos apoyan o refutan la hipótesis? ¿Qué limitaciones tuvo el experimento?",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "En ciencias físicas, la unidad y la precisión de la medición son cruciales. Reportar 'el agua subió algunos grados' no es aceptable: hay que especificar '(12.4 ± 0.1) °C a los 5 minutos' y justificar la incertidumbre del instrumento usado. La incertidumbre de medición no es un error: es honestidad sobre los límites de nuestro conocimiento.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama circular del método científico con flechas que muestran el ciclo: observación → pregunta → hipótesis → experimento → análisis → conclusión → nueva observación",
          caption: "El método científico como ciclo iterativo de construcción de conocimiento.",
        },
        {
          tipo: "parrafo",
          contenido:
            "Investigaciones reales en energía siguen este mismo proceso. Los ingenieros del IMTA (Instituto Mexicano de Tecnología del Agua) que estudian el potencial de las corrientes del Río Bravo para microhidráulica, los físicos del IER-UNAM que miden la eficiencia de nuevos materiales fotovoltaicos, y los estudiantes que miden la temperatura del agua en un calentador solar casero: todos aplican el mismo método científico adaptado a su escala y recursos.",
        },
      ],
    },
  },

  // ── 18 ─────────────────────────────────────────────────────────────────────
  {
    slug: "cneyt-ii-diseno-experimental",
    titulo: "Diseño experimental en física: planear una investigación",
    categoria: "Metodología científica",
    conceptos_clave: ["diseño experimental", "variable independiente", "variable dependiente", "grupo control", "repetición"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Un buen diseño experimental es el corazón de cualquier investigación científica. Sin él, los datos que obtengamos serán ininterpretables o ambiguos. Diseñar un experimento significa decidir exactamente qué medir, cómo medir, qué mantener constante y cuántas veces repetir el proceso para que los resultados sean confiables.",
        },
        {
          tipo: "subtitulo",
          contenido: "Componentes del diseño experimental",
        },
        {
          tipo: "lista",
          items: [
            "Variable independiente (VI): la que el investigador manipula deliberadamente. Ejemplo: el número de capas de aislante alrededor de un recipiente de agua caliente.",
            "Variable dependiente (VD): la que se mide como respuesta a la VI. Ejemplo: la temperatura del agua después de 10 minutos.",
            "Variables controladas: todas las demás que podrían afectar la VD y se mantienen constantes. Ejemplo: volumen de agua, temperatura inicial, material del aislante, temperatura ambiente.",
            "Grupo control: el caso sin manipulación de la VI, que sirve como referencia de comparación.",
            "Repeticiones: cada condición se repite al menos 3 veces para detectar si los resultados son reproducibles o si hubo errores aleatorios.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El principio de 'una sola variable': en un experimento bien diseñado, solo se cambia una variable a la vez (la independiente) mientras todas las demás se controlan. Si cambias el tipo de aislante Y el volumen de agua AL MISMO TIEMPO, no podrás saber cuál de los dos cambios causó la diferencia que observes. Este principio es sencillo pero sorprendentemente fácil de violar sin darse cuenta.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Tabla de diseño experimental con columnas para: número de prueba, valor de la variable independiente, valor de la variable dependiente medido, y variables controladas listadas en la parte superior",
          caption: "Tabla guía para registrar un diseño experimental básico.",
        },
        {
          tipo: "parrafo",
          contenido:
            "Ejemplo de diseño experimental en energía: investiga si el color de la superficie de un recipiente afecta la velocidad de calentamiento por radiación solar. VI: color de la superficie (negro, blanco, plateado). VD: temperatura del agua después de 20 min de exposición solar. Variables controladas: volumen de agua (200 mL), material del recipiente (aluminio), orientación respecto al sol, tiempo de exposición. Grupo control: recipiente sin pintar (aluminio brillante). Repeticiones: 3 mediciones por cada color, en el mismo día y misma hora.",
        },
      ],
    },
  },

  // ── 19 ─────────────────────────────────────────────────────────────────────
  {
    slug: "cneyt-ii-hipotesis-y-variables",
    titulo: "Hipótesis y variables en investigaciones de energía",
    categoria: "Metodología científica",
    conceptos_clave: ["hipótesis", "hipótesis nula", "variable", "predicción", "operacionalización"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Una hipótesis científica es una explicación tentativa y comprobable de un fenómeno observado. No es una suposición arbitraria: es una predicción basada en conocimientos previos y en la observación del fenómeno, que se formula de manera que pueda ser refutada por evidencia experimental. En investigaciones sobre energía, las hipótesis conectan una causa propuesta (la variable independiente) con un efecto esperado (la variable dependiente).",
        },
        {
          tipo: "subtitulo",
          contenido: "Características de una buena hipótesis",
        },
        {
          tipo: "lista",
          items: [
            "Falsable: debe ser posible en principio encontrar evidencia que la contradiga.",
            "Específica y medible: no 'el aislante reduce la pérdida de calor' sino 'el aislante de lana disminuirá la tasa de enfriamiento del agua en al menos un 30% comparado con un recipiente sin aislante'.",
            "Conectada con la teoría: debe fundarse en conocimientos existentes (en este caso, la conducción térmica).",
            "En formato 'Si… entonces…' o 'A mayor X, mayor/menor Y': hace explícita la relación de causa-efecto.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "En estadística experimental se usa también la 'hipótesis nula' (H₀): la afirmación de que no hay efecto o relación entre las variables. El objetivo del análisis estadístico es decidir si los datos permiten rechazar la hipótesis nula con cierto nivel de confianza (generalmente 95%). Si se rechaza H₀, la hipótesis alternativa (que sí existe el efecto) queda apoyada. Este esquema es el estándar en investigación científica publicada.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama con tres ejemplos de hipótesis energéticas: una mal formulada ('el sol calienta el agua'), una mejor ('la exposición solar aumenta la temperatura del agua') y una bien formulada ('por cada 10 minutos adicionales de exposición solar directa, la temperatura del agua aumentará 3 ± 0.5 °C')",
          caption: "Gradación de la calidad en la formulación de hipótesis.",
        },
        {
          tipo: "parrafo",
          contenido:
            "Operacionalizar una variable significa definir exactamente cómo se va a medir. 'Calor' no es directamente medible; pero 'cambio de temperatura en °C de 200 mL de agua en 10 minutos' sí lo es. 'Cantidad de luz solar' puede operacionalizarse como 'irradiancia en W/m² medida con un piranómetro' o, de forma más sencilla, como 'número de horas de exposición directa al sol al mediodía'. La operacionalización convierte conceptos abstractos en mediciones concretas.",
        },
      ],
    },
  },

  // ── 20 ─────────────────────────────────────────────────────────────────────
  {
    slug: "cneyt-ii-historia-termodinamica",
    titulo: "Historia de la termodinámica",
    categoria: "Física",
    conceptos_clave: ["Carnot", "Joule", "Kelvin", "Clausius", "máquina de vapor", "historia de la ciencia"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La termodinámica no nació en los laboratorios universitarios sino en las fábricas y talleres de la Revolución Industrial. La necesidad urgente de mejorar las máquinas de vapor, que consumían enormes cantidades de carbón para producir trabajo mecánico, impulsó a los ingenieros y físicos del siglo XIX a entender la relación fundamental entre calor y trabajo. Este esfuerzo colectivo produjo algunas de las leyes más poderosas y universales de la física.",
        },
        {
          tipo: "subtitulo",
          contenido: "Los pioneros",
        },
        {
          tipo: "parrafo",
          contenido:
            "Nicolas Léonard Sadi Carnot (1796-1832), ingeniero militar francés, publicó en 1824 'Reflexiones sobre la potencia motriz del fuego', donde analizó el ciclo termodinámico ideal que lleva su nombre. Aunque murió a los 36 años, sus ideas sobre el límite de eficiencia de los motores de calor fueron fundamentales. James Prescott Joule (1818-1889), cervecero y físico autodidacta inglés, demostró experimentalmente la equivalencia entre trabajo mecánico y calor: 4 186 J de trabajo = 1 kcal de calor. William Thomson (Lord Kelvin, 1824-1907) desarrolló la escala de temperatura absoluta y formuló la segunda ley de manera moderna.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Línea de tiempo de la termodinámica desde 1824 (Carnot) hasta 1865 (Clausius formula la entropía), con los hitos clave y los retratos de los científicos involucrados",
          caption: "Cronología de los hitos fundacionales de la termodinámica.",
        },
        {
          tipo: "parrafo",
          contenido:
            "Rudolf Clausius (1822-1888), físico alemán, fue quien introdujo formalmente el concepto de entropía en 1865 y reformuló las dos primeras leyes de la termodinámica en su forma matemática moderna: 'La energía del universo es constante; la entropía del universo tiende a un máximo.' Esta frase, simple y devastadora, resume las consecuencias físicas más profundas de la dirección del tiempo y de los límites del aprovechamiento de la energía.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La termodinámica fue desarrollada antes de que se comprendiera la estructura atómica de la materia. Los fundadores del siglo XIX trabajaron solo con mediciones macroscópicas (presión, volumen, temperatura). Ludwig Boltzmann (1844-1906) fue quien conectó la termodinámica con la mecánica estadística, demostrando que la entropía es una medida del número de microestados microscópicos compatibles con un macroestado dado: S = k_B × ln(W), donde k_B es la constante de Boltzmann y W es el número de microestados. Esta ecuación está grabada en su lápida.",
        },
        {
          tipo: "cita",
          contenido:
            "La energía del universo es constante. La entropía del universo tiende a un máximo.",
          fuente: "Rudolf Clausius, físico alemán, formulación de las leyes de la termodinámica (1865)",
        },
      ],
    },
  },
] as const;

// ---------------------------------------------------------------------------
// FUNCIÓN PRINCIPAL
// ---------------------------------------------------------------------------

export async function seedBibliotecaCNEYTII(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed Biblioteca CNEYT-II (20 fichas)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac")
    .select("id")
    .eq("codigo", "CNEYT-II")
    .single();

  if (uacErr || !uacRow) {
    throw new Error(
      `UAC CNEYT-II no encontrada. Ejecuta primero seed-mccems.ts. Error: ${uacErr?.message}`
    );
  }

  const rows = FICHAS_CNEYTII.map((f, i) => ({
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

  if (error) throw new Error(`Error seeding fichas CNEYT-II: ${error.message}`);

  console.log(`  ✓ ${rows.length} fichas de biblioteca de CNEYT-II insertadas/actualizadas.`);
  console.log("\n✅ Seed Biblioteca CNEYT-II completado.\n");
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
  seedBibliotecaCNEYTII(sb).catch((err) => {
    console.error("❌ Error:", err.message);
    process.exit(1);
  });
}
