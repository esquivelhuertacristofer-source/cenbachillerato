/**
 * Seed de fichas de biblioteca para CNEYT-V (CNEyT V — Física Clásica, Semestre 5).
 * 21 fichas temáticas alineadas al MCCEMS 2025, Semestre 5.
 *
 * Uso: npx tsx scripts/seed-fichas-cneytv.ts
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

const FICHAS_CNEYTV = [
  // ── 1 ── Mecánica newtoniana — básico ─────────────────────────────────────
  {
    slug: "cneyt-v-primera-ley-newton-inercia",
    titulo: "Primera Ley de Newton: la inercia en el tránsito de la CDMX",
    categoria: "Mecánica newtoniana",
    conceptos_clave: ["primera ley de Newton", "inercia", "estado de reposo", "estado de movimiento", "cinturón de seguridad"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La Primera Ley de Newton, también llamada Ley de la Inercia, establece que todo cuerpo permanece en su estado de reposo o de movimiento rectilíneo uniforme a menos que una fuerza externa neta actúe sobre él. En palabras simples: los objetos 'se resisten' a cambiar lo que están haciendo. Esta resistencia al cambio de estado de movimiento se llama inercia, y su magnitud depende directamente de la masa del objeto: a mayor masa, mayor inercia.",
        },
        {
          tipo: "subtitulo",
          contenido: "La inercia en el transporte urbano",
        },
        {
          tipo: "parrafo",
          contenido:
            "En el tránsito de la Ciudad de México, la inercia se manifiesta a cada instante. Cuando el Metro CDMX frena al llegar a una estación, los pasajeros tienden a seguir moviéndose hacia adelante porque sus cuerpos conservan el estado de movimiento. El mismo fenómeno ocurre en los camiones de la Línea 1 del Mexibús sobre Insurgentes: si el vehículo arranca súbitamente, los pasajeros de pie se inclinan hacia atrás. En ambos casos, la fuerza externa (frenos o motor) actúa sobre el vehículo, pero el cuerpo humano, por inercia, intenta mantener su estado anterior.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El cinturón de seguridad existe precisamente para vencer la inercia en una colisión. Sin él, el cuerpo continuaría moviéndose a la misma velocidad que llevaba el automóvil en el instante del impacto. El sismo del 19 de septiembre de 2017 (M7.1) en la CDMX mostró que los edificios también poseen inercia: sus bases recibieron la fuerza del movimiento del suelo mientras las plantas superiores, por inercia, tardaron en responder, generando las oscilaciones que causaron daños estructurales.",
        },
        {
          tipo: "subtitulo",
          contenido: "Fuerza neta nula y equilibrio",
        },
        {
          tipo: "lista",
          items: [
            "Si la fuerza neta sobre un objeto es cero, su velocidad no cambia (puede estar en reposo o moverse con velocidad constante).",
            "Un libro sobre una mesa está en reposo: la gravedad hacia abajo y la normal de la mesa hacia arriba se equilibran; fuerza neta = 0.",
            "Un avión en crucero a velocidad constante: el empuje de los motores iguala la resistencia del aire; fuerza neta = 0.",
            "La inercia no es una fuerza en sí misma; es una propiedad de la materia que describe su resistencia a cambios en el movimiento.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Galileo Galilei fue el primero en formular la idea de inercia mediante experimentos con planos inclinados hacia 1600. Newton la formalizó en sus Principia Mathematica (1687). Antes de Galileo, la física aristotélica sostenía erróneamente que un objeto necesitaba una fuerza continua para mantenerse en movimiento.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama que muestra un pasajero en un autobús inclinándose hacia adelante al frenar, ilustrando la inercia",
          caption: "La inercia hace que el pasajero tienda a continuar moviéndose cuando el autobús frena.",
        },
      ],
    },
  },

  // ── 2 ── Mecánica newtoniana — básico ─────────────────────────────────────
  {
    slug: "cneyt-v-segunda-ley-newton-fma",
    titulo: "Segunda Ley de Newton: F = ma y los diagramas de cuerpo libre",
    categoria: "Mecánica newtoniana",
    conceptos_clave: ["segunda ley de Newton", "F = ma", "diagrama de cuerpo libre", "fuerza neta", "aceleración"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La Segunda Ley de Newton es el núcleo cuantitativo de la mecánica clásica. Establece que la aceleración de un objeto es directamente proporcional a la fuerza neta que actúa sobre él e inversamente proporcional a su masa. La ecuación que la resume es F = ma, donde F es la fuerza neta en newtons (N), m es la masa en kilogramos (kg) y a es la aceleración en metros por segundo al cuadrado (m/s²). Un newton equivale exactamente a 1 kg·m/s².",
        },
        {
          tipo: "subtitulo",
          contenido: "Cómo construir un diagrama de cuerpo libre (DCL)",
        },
        {
          tipo: "lista",
          items: [
            "Aisla el objeto de interés: dibújalo como un punto o un bloque simple.",
            "Identifica todas las fuerzas que actúan sobre él: peso (W = mg, hacia abajo), normal (N, perpendicular a la superficie), tensión (T, a lo largo de cuerdas), fricción (f, opuesta al movimiento) y cualquier fuerza aplicada (F_ap).",
            "Representa cada fuerza como un vector con flecha; la longitud indica la magnitud relativa.",
            "Establece un sistema de coordenadas (generalmente x horizontal, y vertical) y descompón las fuerzas en componentes.",
            "Aplica F_neta = ma para cada eje por separado y resuelve el sistema de ecuaciones.",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "Ejemplo práctico: un auto de 1 200 kg acelera desde el semáforo en Paseo de la Reforma a 2.5 m/s². La fuerza que ejerce el motor (ignorando fricción) es F = 1 200 kg × 2.5 m/s² = 3 000 N. Si la fricción del pavimento es 400 N, la fuerza que debe desarrollar el motor es 3 000 + 400 = 3 400 N.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "En la Segunda Ley, F es siempre la fuerza NETA (suma vectorial de todas las fuerzas). Un error común es aplicar F = ma usando solo una de las fuerzas. Siempre construye el DCL antes de escribir la ecuación.",
        },
        {
          tipo: "subtitulo",
          contenido: "Aplicaciones cotidianas de F = ma",
        },
        {
          tipo: "lista",
          items: [
            "Un cohete de la Agencia Espacial Mexicana (AEM) necesita mayor fuerza de empuje que su peso para despegar: F_empuje > mg.",
            "Una grúa en la construcción del Tren Maya levanta una carga: la tensión del cable debe superar el peso del bloque de hormigón.",
            "Los frenos de disco del Metro CDMX generan una fuerza de fricción que desacelera vagones de hasta 40 000 kg.",
          ],
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de cuerpo libre de un bloque sobre una superficie con fuerzas peso, normal, fricción y fuerza aplicada etiquetadas",
          caption: "DCL típico: las flechas muestran dirección y magnitud relativa de cada fuerza actuante.",
        },
      ],
    },
  },

  // ── 3 ── Mecánica newtoniana — intermedio ─────────────────────────────────
  {
    slug: "cneyt-v-tercera-ley-newton-accion-reaccion",
    titulo: "Tercera Ley de Newton: acción y reacción en ingeniería mexicana",
    categoria: "Mecánica newtoniana",
    conceptos_clave: ["tercera ley de Newton", "par acción-reacción", "fuerzas opuestas", "propulsión", "cohetes"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La Tercera Ley de Newton establece que cuando un cuerpo A ejerce una fuerza sobre un cuerpo B, el cuerpo B ejerce sobre A una fuerza igual en magnitud, de la misma línea de acción, pero en sentido opuesto. Esta ley a menudo se resume como 'a toda acción corresponde una reacción igual y opuesta', aunque es importante recordar que las dos fuerzas actúan sobre cuerpos diferentes, por lo que nunca se cancelan entre sí.",
        },
        {
          tipo: "subtitulo",
          contenido: "Pares acción-reacción: ejemplos concretos",
        },
        {
          tipo: "lista",
          items: [
            "Al caminar, tu pie empuja el suelo hacia atrás (acción); el suelo empuja tu pie hacia adelante (reacción). Sin fricción — como en hielo liso — no puedes avanzar.",
            "Un cohete expulsa gases hacia abajo con gran fuerza (acción); los gases empujan el cohete hacia arriba (reacción). Así funciona la propulsión en el vacío, donde no hay aire que 'empujar'.",
            "Al inflar un globo y soltarlo, el globo empuja el aire hacia atrás y el aire empuja el globo hacia adelante.",
            "La presa Chicoasén en Chiapas empuja el agua (acción); el agua empuja las turbinas de la CFE con igual fuerza (reacción), generando electricidad.",
          ],
        },
        {
          tipo: "callout",
          variante: "advertencia",
          contenido:
            "Las fuerzas de acción y reacción actúan sobre cuerpos distintos, por lo que NUNCA se pueden sumar para calcular la fuerza neta sobre un solo objeto. Si quieres estudiar el movimiento de la Tierra, usas las fuerzas que actúan sobre la Tierra, no las que ella ejerce sobre otros cuerpos.",
        },
        {
          tipo: "subtitulo",
          contenido: "Propulsión de cohetes y la Agencia Espacial Mexicana",
        },
        {
          tipo: "parrafo",
          contenido:
            "La AEM (Agencia Espacial Mexicana) fue creada en 2010 para coordinar las actividades espaciales del país. Los satélites Mexsat (Morelos III, Bicentenario y Centenario) fueron lanzados mediante cohetes cuya propulsión se basa exclusivamente en la Tercera Ley de Newton: la combustión de propelente expulsa gases a velocidades de hasta 4 000 m/s, y esa expulsión genera el empuje que eleva el cohete contra la gravedad. No hay nada en el espacio que 'empujar': el cohete se propulsa por la reacción de los propios gases que expele.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Los satélites Morelos I y II, lanzados en 1985, fueron los primeros satélites de comunicaciones de México. Aunque ya no están en operación, abrieron el camino a la red satelital que hoy da conectividad a miles de comunidades rurales mexicanas a través del programa MexSat.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de cohete mostrando gases expulsados hacia abajo y flecha de empuje hacia arriba, ilustrando la tercera ley",
          caption: "El cohete expulsa gases (acción) y los gases empujan el cohete (reacción): propulsión en el vacío.",
        },
      ],
    },
  },

  // ── 4 ── Mecánica newtoniana — intermedio ─────────────────────────────────
  {
    slug: "cneyt-v-friccion-planos-inclinados",
    titulo: "Fricción y planos inclinados: análisis de fuerzas en superficies",
    categoria: "Mecánica newtoniana",
    conceptos_clave: ["fricción estática", "fricción cinética", "plano inclinado", "coeficiente de fricción", "normal"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La fricción es la fuerza que se opone al movimiento relativo entre dos superficies en contacto. Existen dos tipos principales: fricción estática (f_s), que actúa cuando el objeto está en reposo y puede tener cualquier valor hasta un máximo f_s_max = µ_s × N; y fricción cinética (f_k), que actúa cuando el objeto ya se mueve, con magnitud constante f_k = µ_k × N. En ambos casos, N es la fuerza normal y µ es el coeficiente de fricción, que depende de los materiales en contacto.",
        },
        {
          tipo: "subtitulo",
          contenido: "Análisis en un plano inclinado",
        },
        {
          tipo: "parrafo",
          contenido:
            "En un plano inclinado a un ángulo θ, el peso W = mg se descompone en dos componentes: una paralela al plano (W_paralela = mg·sen θ, que tiende a deslizar el objeto cuesta abajo) y una perpendicular (W_perp = mg·cos θ, que genera la normal N = mg·cos θ). La fricción cinética que actúa cuesta arriba es f_k = µ_k × mg·cos θ. La aceleración del objeto deslizándose libremente es a = g·(sen θ − µ_k·cos θ).",
        },
        {
          tipo: "lista",
          items: [
            "Si θ es pequeño y µ_s es grande (superficie rugosa), el objeto permanece en reposo: la fricción estática es suficiente para contrarrestar la componente paralela del peso.",
            "Si θ supera el ángulo crítico (tan θ_c = µ_s), el objeto empieza a deslizar.",
            "El coeficiente µ no depende del área de contacto ni de la velocidad (en el modelo clásico de Coulomb).",
            "En las carreteras de montaña de Guerrero y Oaxaca, los diseñadores viales calculan la fricción mínima del pavimento para garantizar que los vehículos cargados puedan frenar en las bajadas.",
          ],
        },
        {
          tipo: "callout",
          variante: "ejemplo",
          contenido:
            "Un bloque de 5 kg reposa en un plano inclinado a 30°. µ_s = 0.4, µ_k = 0.3. ¿Se mueve? f_s_max = 0.4 × 5 × 9.8 × cos 30° = 0.4 × 5 × 9.8 × 0.866 ≈ 16.97 N. Componente paralela = 5 × 9.8 × sen 30° = 24.5 N. Como 24.5 > 16.97, el bloque se desliza. Aceleración: a = 9.8 × (sen 30° − 0.3 × cos 30°) = 9.8 × (0.5 − 0.26) ≈ 2.35 m/s².",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de cuerpo libre de un bloque en plano inclinado con vectores peso descompuesto, normal y fricción",
          caption: "Descomposición del peso en un plano inclinado: componente paralela y perpendicular a la superficie.",
        },
      ],
    },
  },

  // ── 5 ── Cinemática: MRU y MRUA — básico ──────────────────────────────────
  {
    slug: "cneyt-v-mru-velocidad-constante",
    titulo: "MRU: movimiento rectilíneo uniforme y gráficas posición-tiempo",
    categoria: "Cinemática: MRU y MRUA",
    conceptos_clave: ["movimiento rectilíneo uniforme", "velocidad constante", "gráfica posición-tiempo", "desplazamiento", "rapidez"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El Movimiento Rectilíneo Uniforme (MRU) describe a un objeto que se desplaza en línea recta con velocidad constante. 'Constante' significa que la rapidez no cambia y la dirección tampoco. La ecuación del MRU es x = x₀ + v·t, donde x es la posición final, x₀ la posición inicial, v la velocidad (en m/s) y t el tiempo (en segundos). Al ser v constante, la aceleración es cero.",
        },
        {
          tipo: "subtitulo",
          contenido: "Interpretación gráfica del MRU",
        },
        {
          tipo: "lista",
          items: [
            "Gráfica posición-tiempo (x vs. t): es una línea recta. La pendiente de esa recta es exactamente la velocidad: v = Δx / Δt.",
            "Gráfica velocidad-tiempo (v vs. t): es una línea horizontal (v = constante). El área bajo la curva (un rectángulo) representa el desplazamiento.",
            "Una pendiente positiva indica movimiento en la dirección positiva; pendiente negativa, movimiento en sentido opuesto; pendiente cero, objeto en reposo.",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "Ejemplo: el Tren Interurbano México-Toluca tiene una velocidad de diseño de 160 km/h (≈ 44.4 m/s) en tramos rectos. En un tramo de MRU, en 3 minutos (180 s) recorrería: x = 44.4 × 180 = 7 992 m ≈ 8 km. Las gráficas de posición-tiempo de este tren en tramo recto serían líneas rectas con pendiente 44.4 m/s.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Desplazamiento y distancia no son lo mismo. El desplazamiento es un vector que va del punto inicial al final (puede ser cero si regresas al origen). La distancia es el total del camino recorrido. En MRU con movimiento en una sola dirección, coinciden numéricamente.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "La unidad de velocidad en el SI es m/s, pero en México usamos comúnmente km/h. La conversión es: 1 m/s = 3.6 km/h. Así, el límite de 100 km/h en la autopista México-Querétaro equivale a ≈ 27.8 m/s.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Dos gráficas lado a lado: posición vs tiempo (línea recta con pendiente v) y velocidad vs tiempo (línea horizontal)",
          caption: "En MRU: x(t) es una recta con pendiente = velocidad; v(t) es una línea horizontal constante.",
        },
      ],
    },
  },

  // ── 6 ── Cinemática: MRU y MRUA — intermedio ──────────────────────────────
  {
    slug: "cneyt-v-mrua-ecuaciones-aceleracion",
    titulo: "MRUA: ecuaciones del movimiento uniformemente acelerado",
    categoria: "Cinemática: MRU y MRUA",
    conceptos_clave: ["MRUA", "aceleración constante", "ecuaciones cinemáticas", "x = x₀ + v₀t + ½at²", "v² = v₀² + 2aΔx"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El Movimiento Rectilíneo Uniformemente Acelerado (MRUA) describe objetos que se mueven en línea recta con aceleración constante. Las tres ecuaciones cinemáticas del MRUA son: (1) v = v₀ + at; (2) x = x₀ + v₀t + ½at²; (3) v² = v₀² + 2a(x − x₀). Estas tres ecuaciones son suficientes para resolver cualquier problema de MRUA, siempre que la aceleración sea constante. Cada una relaciona cuatro de las cinco variables: x, x₀, v, v₀, a, t.",
        },
        {
          tipo: "subtitulo",
          contenido: "Cómo elegir la ecuación correcta",
        },
        {
          tipo: "lista",
          items: [
            "Si no conoces el tiempo t y quieres relacionar velocidades y desplazamiento, usa v² = v₀² + 2aΔx.",
            "Si no conoces la velocidad final v y tienes el tiempo, usa x = x₀ + v₀t + ½at².",
            "Si tienes el tiempo y necesitas la velocidad final, usa v = v₀ + at.",
            "Siempre define un sentido positivo antes de resolver. Las cantidades en sentido contrario llevan signo negativo.",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "Ejemplo: un automóvil en la México-Puebla parte del reposo (v₀ = 0) y acelera a 3 m/s² durante 10 s. Velocidad final: v = 0 + 3 × 10 = 30 m/s (108 km/h). Distancia recorrida: x = 0 + 0 × 10 + ½ × 3 × 100 = 150 m. Verificación con ecuación 3: 30² = 0 + 2 × 3 × 150 → 900 = 900. Correcto.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La aceleración tiene signo. Si el auto acelera en la dirección positiva, a > 0. Si frena (desacelera), a < 0 (aunque en México comúnmente se dice que la 'desaceleración' es positiva; en física el signo negativo de a indica que la aceleración va en sentido contrario al movimiento). Confundir el signo es la fuente más común de errores en estos problemas.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Galileo Galilei descubrió las ecuaciones del MRUA mediante experimentos con esferas rodando en planos inclinados. Al no tener cronómetros precisos, usaba un reloj de agua para medir intervalos de tiempo y demostró que la distancia recorrida crece con el cuadrado del tiempo.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Gráficas v(t) y x(t) para MRUA: v(t) es una recta con pendiente positiva a, x(t) es una parábola cóncava hacia arriba",
          caption: "En MRUA: v(t) es una recta cuya pendiente es la aceleración; x(t) es una parábola.",
        },
      ],
    },
  },

  // ── 7 ── Cinemática: MRU y MRUA — intermedio ──────────────────────────────
  {
    slug: "cneyt-v-caida-libre-gravedad",
    titulo: "Caída libre: la gravedad como aceleración constante (g = 9.8 m/s²)",
    categoria: "Cinemática: MRU y MRUA",
    conceptos_clave: ["caída libre", "aceleración gravitacional", "g = 9.8 m/s²", "tiro vertical", "tiempo de caída"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La caída libre es un caso especial de MRUA en el que la única fuerza que actúa sobre el objeto es la gravedad (se desprecian la fricción del aire y otras fuerzas). En la Tierra, la aceleración de la gravedad vale g = 9.8 m/s² hacia abajo (a veces se aproxima a 9.81 m/s² o incluso 10 m/s² para cálculos rápidos). Las ecuaciones son las del MRUA con a = −g si tomamos el eje y positivo hacia arriba: y = y₀ + v₀t − ½gt²; v = v₀ − gt.",
        },
        {
          tipo: "subtitulo",
          contenido: "Casos típicos de caída libre",
        },
        {
          tipo: "lista",
          items: [
            "Caída desde el reposo (v₀ = 0): y = y₀ − ½gt². El objeto cae con velocidad creciente. En 1 s recorre 4.9 m; en 2 s, 19.6 m.",
            "Tiro vertical hacia arriba (v₀ > 0): el objeto sube, frena, se detiene en la altura máxima (v = 0) y regresa. Tiempo de subida = v₀/g.",
            "Altura máxima: h_max = v₀²/(2g). Para v₀ = 20 m/s, h_max = 400/19.6 ≈ 20.4 m.",
            "El tiempo de subida es igual al tiempo de bajada (en ausencia de fricción del aire).",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "El CENAPRED (Centro Nacional de Prevención de Desastres) utiliza sensores sísmicos en el Popocatépetl que miden la velocidad de fragmentos expulsados durante erupciones. Usando las ecuaciones de caída libre, los volcanólogos estiman la altura máxima alcanzada por las piedras y el radio de caída peligroso alrededor del volcán, información crucial para los planes de evacuación.",
        },
        {
          tipo: "callout",
          variante: "ejemplo",
          contenido:
            "Un bloque de concreto cae desde la cima del Ángel de la Independencia (altura ≈ 36 m sobre la calle). Tiempo de caída: 36 = ½ × 9.8 × t² → t² = 7.35 → t ≈ 2.71 s. Velocidad al impacto: v = 9.8 × 2.71 ≈ 26.6 m/s (≈ 95.6 km/h). Por eso las obras en altura requieren protecciones para peatones.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de tiro vertical: flecha hacia arriba con v₀, flecha g hacia abajo, posición de altura máxima marcada",
          caption: "En el tiro vertical, g siempre apunta hacia abajo; la velocidad cambia de signo en la cima.",
        },
      ],
    },
  },

  // ── 8 ── Gravitación universal — básico ───────────────────────────────────
  {
    slug: "cneyt-v-ley-gravitacion-universal",
    titulo: "Ley de gravitación universal de Newton: F = Gm₁m₂/r²",
    categoria: "Gravitación universal",
    conceptos_clave: ["gravitación universal", "G = 6.674×10⁻¹¹ N·m²/kg²", "fuerza gravitacional", "masa", "distancia"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La Ley de Gravitación Universal de Newton establece que dos cuerpos de masas m₁ y m₂ separados a una distancia r entre sus centros se atraen mutuamente con una fuerza F = Gm₁m₂/r², donde G = 6.674×10⁻¹¹ N·m²/kg² es la constante de gravitación universal. Esta fuerza es siempre atractiva, actúa a lo largo de la línea que une ambos cuerpos y obedece la Tercera Ley de Newton: m₁ atrae a m₂ con la misma fuerza que m₂ atrae a m₁.",
        },
        {
          tipo: "subtitulo",
          contenido: "Peso vs. masa: una distinción fundamental",
        },
        {
          tipo: "lista",
          items: [
            "La masa (m) es una propiedad intrínseca del objeto: mide cuánta materia contiene y su inercia. Se mide en kg y no cambia con la ubicación.",
            "El peso (W) es la fuerza gravitacional que ejerce la Tierra sobre el objeto: W = mg. Depende de g, que varía según la latitud y la altitud.",
            "En la Ciudad de México (altitud ~2 240 m), g ≈ 9.78 m/s², ligeramente menor que el valor estándar de 9.80 m/s². Un objeto de 10 kg pesa ~97.8 N en CDMX.",
            "En la Luna, g_Luna ≈ 1.62 m/s², por lo que ese mismo objeto pesaría solo 16.2 N, aunque su masa sigue siendo 10 kg.",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "La ley inversa del cuadrado implica que si duplicas la distancia entre dos cuerpos, la fuerza gravitacional se reduce a una cuarta parte. Esto explica por qué la influencia gravitacional del Sol alcanza miles de millones de kilómetros pero se debilita enormemente con la distancia.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "G = 6.674×10⁻¹¹ N·m²/kg² es un número extraordinariamente pequeño, lo que explica por qué solo sentimos la gravedad de objetos enormes como la Tierra. La fuerza gravitacional entre dos personas sentadas a 1 m de distancia es del orden de 10⁻⁷ N, completamente imperceptible.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de dos masas separadas por distancia r con flechas de atracción mutua indicando la fuerza gravitacional",
          caption: "La fuerza gravitacional es siempre atractiva y decrece con el cuadrado de la distancia.",
        },
      ],
    },
  },

  // ── 9 ── Gravitación universal — intermedio ───────────────────────────────
  {
    slug: "cneyt-v-satelites-mexsat-kepler",
    titulo: "Satélites Mexsat y leyes de Kepler: órbitas geoestacionarias",
    categoria: "Gravitación universal",
    conceptos_clave: ["satélites geoestacionarios", "leyes de Kepler", "Mexsat", "AEM", "órbita circular"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Johannes Kepler formuló tres leyes que describen el movimiento planetario. La primera establece que las órbitas son elipses con el Sol en un foco. La segunda dice que el vector radio del planeta barre áreas iguales en tiempos iguales (los planetas se mueven más rápido cerca del Sol). La tercera, cuantitativa: T² = k·r³, donde T es el período orbital, r es el semieje mayor y k es una constante que depende del cuerpo central. Para satélites terrestres, k = 4π²/(GM_Tierra).",
        },
        {
          tipo: "subtitulo",
          contenido: "Órbita geoestacionaria y los satélites Mexsat",
        },
        {
          tipo: "parrafo",
          contenido:
            "Una órbita geoestacionaria es aquella en que el satélite orbita exactamente con el mismo período que la rotación de la Tierra (T = 24 h = 86 400 s). Esto lo mantiene fijo sobre el mismo punto de la superficie, ideal para telecomunicaciones. La altitud de esta órbita es ≈ 35 786 km sobre el ecuador. La constelación Mexsat de México incluye los satélites Morelos III (2015), Bicentenario y Centenario, gestionados por la SCT y la CFE para brindar cobertura de banda ancha en zonas rurales y servicios de seguridad nacional.",
        },
        {
          tipo: "lista",
          items: [
            "Morelos I y II (1985): primeros satélites mexicanos, ya retirados.",
            "Morelos III (Mexsat-1): cobertura de banda ancha para zonas sin fibra óptica.",
            "Bicentenario (Mexsat-2): servicios de seguridad pública y emergencias.",
            "La AEM coordina con la UNAM y el IPN investigaciones sobre uso del espectro y aplicaciones satelitales.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Para que un satélite permanezca en órbita geoestacionaria, la fuerza gravitacional debe ser exactamente igual a la fuerza centrípeta necesaria para el movimiento circular: GMm/r² = mv²/r. De aquí se despeja r = (GM_Tierra × T²/4π²)^(1/3) ≈ 42 164 km desde el centro de la Tierra, es decir, ≈ 35 786 km sobre la superficie.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de la Tierra con órbita geoestacionaria circular a 35 786 km y un satélite Mexsat etiquetado sobre México",
          caption: "Los satélites geoestacionarios orbitan a ≈ 35 786 km y permanecen fijos sobre un punto de la superficie.",
        },
      ],
    },
  },

  // ── 10 ── Ondas y sonido — básico ─────────────────────────────────────────
  {
    slug: "cneyt-v-clasificacion-parametros-ondas",
    titulo: "Clasificación y parámetros de las ondas: amplitud, frecuencia y longitud de onda",
    categoria: "Ondas y sonido",
    conceptos_clave: ["onda", "amplitud", "frecuencia", "longitud de onda", "velocidad de onda", "v = λf"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Una onda es una perturbación que transfiere energía de un punto a otro sin trasladar materia permanentemente. Las ondas se clasifican según el medio de propagación: mecánicas (requieren un medio material, como el sonido o las olas del mar) y electromagnéticas (pueden propagarse en el vacío, como la luz o las microondas). También se clasifican según la dirección de la perturbación: transversales (la oscilación es perpendicular a la propagación, como en la luz) y longitudinales (la oscilación es paralela a la propagación, como en el sonido).",
        },
        {
          tipo: "subtitulo",
          contenido: "Parámetros fundamentales de una onda",
        },
        {
          tipo: "lista",
          items: [
            "Amplitud (A): desplazamiento máximo de la perturbación desde el equilibrio. Relacionada con la energía de la onda: mayor amplitud, mayor energía.",
            "Longitud de onda (λ, lambda): distancia entre dos puntos consecutivos en el mismo estado de oscilación (cresta a cresta, por ejemplo). Se mide en metros.",
            "Período (T): tiempo que tarda la onda en completar un ciclo completo. Se mide en segundos.",
            "Frecuencia (f): número de ciclos por segundo. f = 1/T, medida en hertz (Hz).",
            "Velocidad de onda: v = λf. Para el sonido en aire a 20°C, v ≈ 343 m/s. Para la luz en el vacío, c = 3×10⁸ m/s.",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "El oído humano percibe sonidos en el rango de 20 Hz a 20 000 Hz (20 kHz). Frecuencias por debajo de 20 Hz son infrasonido (detectado por algunos animales y por sismógrafos del CENAPRED) y por encima de 20 kHz son ultrasonido (usado en medicina para ultrasonografía).",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La relación v = λf es universal para cualquier tipo de onda. Si la frecuencia aumenta y la velocidad del medio no cambia, la longitud de onda disminuye proporcionalmente. En la antena del IFT, las señales de radio FM (88–108 MHz) tienen longitudes de onda de 2.8 a 3.4 m, mientras que las señales WiFi a 2.4 GHz tienen λ ≈ 12.5 cm.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de onda sinusoidal con amplitud, longitud de onda, cresta y valle etiquetados",
          caption: "Parámetros de una onda periódica: amplitud A, longitud de onda λ, cresta y valle.",
        },
      ],
    },
  },

  // ── 11 ── Ondas y sonido — intermedio ────────────────────────────────────
  {
    slug: "cneyt-v-sonido-efecto-doppler",
    titulo: "El sonido como onda mecánica y efecto Doppler",
    categoria: "Ondas y sonido",
    conceptos_clave: ["sonido", "onda mecánica", "efecto Doppler", "frecuencia aparente", "velocidad del sonido"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El sonido es una onda mecánica longitudinal: las moléculas del medio (aire, agua, sólido) oscilan en la misma dirección en que se propaga la onda, creando zonas de compresión y rarefacción. Necesita un medio para propagarse; en el vacío no hay sonido. La velocidad del sonido en el aire depende de la temperatura: a 0°C es ≈ 331 m/s, y aumenta ≈ 0.6 m/s por cada grado Celsius. A 20°C (temperatura ambiente típica) es ≈ 343 m/s. En agua es ≈ 1 480 m/s y en acero ≈ 5 000 m/s.",
        },
        {
          tipo: "subtitulo",
          contenido: "El efecto Doppler",
        },
        {
          tipo: "parrafo",
          contenido:
            "El efecto Doppler es el cambio en la frecuencia percibida de una onda cuando la fuente o el observador están en movimiento relativo. Si la fuente se acerca al observador, la frecuencia percibida es mayor (tono más agudo); si se aleja, la frecuencia percibida es menor (tono más grave). La ecuación general es f_obs = f_fuente × (v + v_obs)/(v − v_fuente), donde los signos dependen de si el movimiento es de acercamiento o alejamiento.",
        },
        {
          tipo: "lista",
          items: [
            "Ambulancias y patrullas: el familiar cambio de tono de una sirena al pasar es el efecto Doppler. En la CDMX, las unidades del ERUM (Escuadrón de Rescate y Urgencias Médicas) viajan a ≈ 60–80 km/h.",
            "Radar de velocidad: la Policía Federal usa radar Doppler para medir la velocidad de vehículos en la autopista.",
            "Astronomía: el corrimiento al rojo (redshift) de galaxias es el efecto Doppler relativista para la luz, y fue clave para que Hubble descubriera la expansión del universo.",
            "El CENAPRED usa sensores sísmicos que detectan ondas P (primarias, longitudinales) antes que las ondas S (secundarias, transversales). Las P viajan más rápido (~6 km/s en la corteza), por eso el SASMEX puede dar alerta temprana.",
          ],
        },
        {
          tipo: "callout",
          variante: "ejemplo",
          contenido:
            "Una ambulancia a 80 km/h (≈ 22.2 m/s) emite una sirena a 700 Hz. Velocidad del sonido: 343 m/s. Frecuencia que escuchas cuando se acerca: f = 700 × 343/(343 − 22.2) ≈ 700 × 1.069 ≈ 748 Hz. Cuando se aleja: f = 700 × 343/(343 + 22.2) ≈ 700 × 0.939 ≈ 657 Hz. Diferencia perceptible de ≈ 91 Hz.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama del efecto Doppler: fuente en movimiento, frentes de onda comprimidos al frente y expandidos atrás",
          caption: "El movimiento de la fuente comprime los frentes de onda en la dirección del movimiento, aumentando la frecuencia percibida.",
        },
      ],
    },
  },

  // ── 12 ── Ondas y sonido — avanzado ──────────────────────────────────────
  {
    slug: "cneyt-v-sasmex-ondas-sismicas",
    titulo: "SASMEX y ondas sísmicas: cómo los sensores salvan vidas en México",
    categoria: "Ondas y sonido",
    conceptos_clave: ["SASMEX", "ondas sísmicas", "ondas P y S", "sismo 2017", "CENAPRED"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El SASMEX (Sistema de Alerta Sísmica Mexicano) es uno de los sistemas de alerta temprana de terremotos más avanzados del mundo. Opera con más de 100 sensores sísmicos instalados principalmente en la costa de Guerrero y Oaxaca —zona de alta actividad sísmica— y emite una alerta pública entre 60 y 120 segundos antes de que las ondas destructivas lleguen a la CDMX, tiempo suficiente para evacuar edificios y protegerse.",
        },
        {
          tipo: "subtitulo",
          contenido: "Tipos de ondas sísmicas",
        },
        {
          tipo: "lista",
          items: [
            "Ondas P (primarias o de presión): son longitudinales; las moléculas del suelo oscilan en la misma dirección que la propagación. Velocidad ≈ 5–8 km/s en la corteza. Son las primeras en llegar y las que detecta el SASMEX para activar la alerta.",
            "Ondas S (secundarias o de cizallamiento): son transversales; las moléculas oscilan perpendicular a la propagación. Velocidad ≈ 3–5 km/s. Son más destructivas que las P.",
            "Ondas superficiales (Love y Rayleigh): se propagan en la superficie; son las más lentas pero las que más daño causan a las estructuras. Su amplitud puede aumentar en suelos blandos como los del antiguo lago de Texcoco (gran parte de la CDMX).",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "El sismo del 19 de septiembre de 2017 (M7.1, epicentro en Axochiapan, Morelos) causó 369 muertes y el colapso de más de 40 edificios en la CDMX. Irónicamente, el SASMEX no emitió alerta porque el epicentro fue interior (no costero), donde no había sensores suficientes. Este evento impulsó la modernización del sistema con sensores adicionales en el interior del país.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El tiempo de alerta del SASMEX depende de la distancia entre el epicentro y la ciudad. Para sismos en la brecha de Guerrero (a ~300 km de la CDMX), las ondas P tardan ≈ 50 s en llegar a los sensores costeros, y el SASMEX puede emitir alerta en ≈ 5 s adicionales. Las ondas S destructivas tardan otros ≈ 65 s en llegar a la CDMX: ventana total de ≈ 60 s.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "El Volcán Popocatépetl también genera ondas sísmicas. El CENAPRED monitorea su actividad con estaciones sismológicas de banda ancha. Las señales sísmicas de las explosiones volcánicas tienen patrones distintos a los sismos tectónicos, lo que permite identificar el tipo de actividad y ajustar los niveles de alerta volcánica.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Mapa esquemático de México con sensores SASMEX en la costa de Guerrero, epicentro sísmico y flechas de propagación de ondas P y S hacia la CDMX",
          caption: "El SASMEX detecta ondas P en la costa y emite alerta antes de que lleguen las ondas S a la CDMX.",
        },
      ],
    },
  },

  // ── 13 ── Espectro electromagnético — básico ──────────────────────────────
  {
    slug: "cneyt-v-espectro-electromagnetico-regiones",
    titulo: "El espectro electromagnético: de las ondas de radio a los rayos gamma",
    categoria: "Espectro electromagnético",
    conceptos_clave: ["espectro electromagnético", "radiación electromagnética", "c = 3×10⁸ m/s", "frecuencia", "longitud de onda"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El espectro electromagnético es el conjunto de todas las formas de radiación electromagnética ordenadas por frecuencia o longitud de onda. Todas viajan en el vacío a la misma velocidad: c = 3×10⁸ m/s (velocidad de la luz). La diferencia entre los distintos tipos de radiación es su frecuencia f y, por la relación c = λf, su longitud de onda λ. A mayor frecuencia, mayor energía por fotón.",
        },
        {
          tipo: "subtitulo",
          contenido: "Las regiones del espectro (de menor a mayor frecuencia)",
        },
        {
          tipo: "lista",
          items: [
            "Ondas de radio (f < 300 MHz, λ > 1 m): AM, FM, televisión, señales WiFi de baja frecuencia. El IFT administra este espectro en México.",
            "Microondas (300 MHz – 300 GHz): hornos de microondas (2.45 GHz), WiFi (2.4 / 5 GHz), radar meteorológico del SMN, comunicaciones satelitales.",
            "Infrarrojo (300 GHz – 430 THz): calor radiado por cuerpos, controles remotos, termografía médica.",
            "Luz visible (430–750 THz): la única región que percibe el ojo humano, del rojo (λ ≈ 700 nm) al violeta (λ ≈ 400 nm).",
            "Ultravioleta (750 THz – 30 PHz): bronceado, esterilización UV, flujo solar que filtra la capa de ozono.",
            "Rayos X (30 PHz – 30 EHz): diagnóstico médico por imagen, detección de grietas en estructuras.",
            "Rayos gamma (> 30 EHz): emitidos por núcleos radiactivos, usados en radioterapia oncológica; el ININ los estudia en México.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La distinción entre radiación ionizante y no ionizante es crucial para la seguridad. Los rayos gamma, X y el UV de alta frecuencia son ionizantes: tienen suficiente energía para arrancar electrones de los átomos y dañar el ADN. Las ondas de radio, microondas e infrarrojo son no ionizantes: pueden calentar tejidos pero no ionizan moléculas biológicas.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama del espectro electromagnético con regiones etiquetadas de radio a rayos gamma, mostrando frecuencia y longitud de onda",
          caption: "El espectro EM abarca más de 20 órdenes de magnitud en frecuencia; la luz visible es solo una pequeña ventana.",
        },
      ],
    },
  },

  // ── 14 ── Espectro electromagnético — intermedio ──────────────────────────
  {
    slug: "cneyt-v-ift-radiacion-ionizante-aplicaciones",
    titulo: "IFT, radiación ionizante y aplicaciones biomédicas del espectro EM",
    categoria: "Espectro electromagnético",
    conceptos_clave: ["IFT", "radiación ionizante", "rayos X", "radioterapia", "ININ", "espectro radioeléctrico"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El Instituto Federal de Telecomunicaciones (IFT) es el organismo autónomo mexicano que regula y administra el espectro radioeléctrico, recurso escaso y de valor estratégico. El IFT otorga concesiones de bandas de frecuencia para telefonía móvil (700 MHz, 1.7 GHz, 2.5 GHz para 4G/5G), televisión digital terrestre (470–698 MHz), radio FM (87.5–108 MHz) y servicios satelitales. La gestión eficiente del espectro es fundamental para la conectividad de los más de 127 millones de habitantes de México.",
        },
        {
          tipo: "subtitulo",
          contenido: "Radiación ionizante y sus aplicaciones en México",
        },
        {
          tipo: "lista",
          items: [
            "Rayos X: usados en radiografías y tomografías computarizadas (CT) en hospitales del IMSS, ISSSTE y SSA. Los rayos X tienen longitudes de onda de 0.01 a 10 nm.",
            "Radioterapia con rayos gamma: el ININ (Instituto Nacional de Investigaciones Nucleares) desarrolla tecnología de radioterapia. Las unidades de cobalto-60 emiten rayos gamma a 1.17 y 1.33 MeV para destruir tumores cancerosos.",
            "Irradiación de alimentos: el ININ opera una planta de irradiación de alimentos con rayos gamma para prolongar la vida de anaquel de frutas y verduras de exportación, aprobada por COFEPRIS.",
            "Dosimetría: el ININ capacita a personal de radioprotección en México; la dosis máxima permitida para trabajadores es 20 mSv/año según la norma NOM-019-NUCL.",
          ],
        },
        {
          tipo: "callout",
          variante: "advertencia",
          contenido:
            "La exposición a radiación ionizante debe minimizarse aplicando el principio ALARA (As Low As Reasonably Achievable). Los chalecos de plomo que se usan en radiografías dentales atenúan los rayos X dispersos. El IFT también regula la exposición a campos electromagnéticos no ionizantes de antenas de telefonía siguiendo los límites de la ICNIRP.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "México cuenta con el Centro Nuclear de México en Salazar, Estado de México, operado por el ININ. Allí funciona el reactor de investigación TRIGA Mark III, que produce radioisótopos médicos como el tecnecio-99m, usado en más del 80% de los procedimientos de medicina nuclear en el país.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Infografía del espectro EM resaltando las regiones ionizantes (UV, X, gamma) y aplicaciones médicas en México",
          caption: "La radiación ionizante tiene aplicaciones médicas esenciales cuando se usa con protocolos de seguridad adecuados.",
        },
      ],
    },
  },

  // ── 15 ── Óptica geométrica — básico ─────────────────────────────────────
  {
    slug: "cneyt-v-reflexion-refraccion-snell",
    titulo: "Reflexión y refracción: la ley de Snell y el índice de refracción",
    categoria: "Óptica geométrica",
    conceptos_clave: ["reflexión", "refracción", "ley de Snell", "índice de refracción", "ángulo de incidencia"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Cuando la luz llega a la interfaz entre dos medios transparentes, parte se refleja y parte se refracta (cambia de dirección al cambiar de medio). La ley de reflexión es simple: el ángulo de incidencia (θ₁) igual al ángulo de reflexión (θ_r), ambos medidos respecto a la normal de la superficie. La refracción sigue la ley de Snell: n₁·sen θ₁ = n₂·sen θ₂, donde n₁ y n₂ son los índices de refracción de cada medio y θ₂ es el ángulo refractado.",
        },
        {
          tipo: "subtitulo",
          contenido: "Índice de refracción y velocidad de la luz",
        },
        {
          tipo: "lista",
          items: [
            "El índice de refracción n de un medio es n = c/v, donde c = 3×10⁸ m/s es la velocidad de la luz en el vacío y v es la velocidad en ese medio.",
            "Vacío: n = 1. Aire: n ≈ 1.0003 (prácticamente 1). Agua: n ≈ 1.33. Vidrio común: n ≈ 1.5. Diamante: n ≈ 2.42.",
            "Cuando la luz pasa de un medio menos denso ópticamente a uno más denso (n₁ < n₂), el rayo se acerca a la normal (θ₂ < θ₁).",
            "Cuando pasa de más denso a menos denso y θ₁ supera el ángulo crítico θ_c = arcsen(n₂/n₁), ocurre reflexión total interna: la base de la fibra óptica.",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "La fibra óptica usa reflexión total interna para guiar pulsos de luz a lo largo de cables de vidrio o plástico con pérdidas mínimas. México tiene más de 200 000 km de fibra óptica instalada (CFE, Telmex, operadores móviles) que conectan desde la frontera norte hasta la península de Yucatán.",
        },
        {
          tipo: "callout",
          variante: "ejemplo",
          contenido:
            "Un rayo de luz pasa del aire (n₁ = 1.0) al vidrio (n₂ = 1.5) con θ₁ = 30°. Ley de Snell: 1.0 × sen 30° = 1.5 × sen θ₂ → 0.5 = 1.5 × sen θ₂ → sen θ₂ = 0.333 → θ₂ ≈ 19.5°. El rayo se acerca a la normal al entrar en el vidrio.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de reflexión y refracción con rayo incidente, reflejado y refractado en la interfaz aire-vidrio, con ángulos θ₁ y θ₂",
          caption: "Ley de Snell: n₁·sen θ₁ = n₂·sen θ₂. El rayo se dobla al cambiar de medio.",
        },
      ],
    },
  },

  // ── 16 ── Óptica geométrica — intermedio ─────────────────────────────────
  {
    slug: "cneyt-v-lentes-convergentes-divergentes",
    titulo: "Lentes convergentes y divergentes: formación de imágenes",
    categoria: "Óptica geométrica",
    conceptos_clave: ["lente convergente", "lente divergente", "foco", "distancia focal", "ecuación del fabricante de lentes"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Las lentes son piezas de material transparente con superficies curvas que refractan la luz para hacer converger o divergir los rayos. Una lente convergente (convexa) hace que los rayos paralelos al eje óptico se unan en un punto llamado foco (F), a una distancia focal f de la lente. Una lente divergente (cóncava) hace que los rayos paralelos parezcan provenir de un foco virtual al mismo lado que la fuente. La ecuación de la lente delgada relaciona distancia al objeto (d_o), distancia a la imagen (d_i) y distancia focal (f): 1/d_o + 1/d_i = 1/f.",
        },
        {
          tipo: "subtitulo",
          contenido: "Rayos principales para localizar imágenes",
        },
        {
          tipo: "lista",
          items: [
            "Rayo 1: paralelo al eje óptico → refractado pasa por el foco F (convergente) o parece provenir de F (divergente).",
            "Rayo 2: pasa por el centro óptico → no se desvía.",
            "Rayo 3: pasa por el foco → refractado emerge paralelo al eje óptico (convergente).",
            "La intersección de dos rayos cualesquiera localiza la imagen. Si los rayos se cruzan realmente, la imagen es real; si la intersección es virtual (extensiones detrás de la lente), la imagen es virtual.",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "Aplicaciones cotidianas: las gafas correctoras usan lentes convergentes para la miopía negativa (espera: las lentes divergentes corrigen la miopía, las convergentes la hipermetropía). Los microscopios del Instituto Politécnico Nacional combinan un objetivo convergente de focal corta (que produce una imagen ampliada real) y un ocular que actúa como lupa. Los telescopios del Observatorio Astronómico Nacional en San Pedro Mártir, Baja California, usan espejos y lentes para observar galaxias distantes.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Convenio de signos: d_o es positiva si el objeto está del lado de la luz incidente. d_i es positiva para imagen real (del otro lado de la lente) y negativa para imagen virtual. f es positiva para lente convergente y negativa para divergente. El aumento lateral M = −d_i/d_o (negativo indica imagen invertida).",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de formación de imagen con lente convergente: objeto, tres rayos principales, imagen real e invertida",
          caption: "Lente convergente: los tres rayos principales convergen en la imagen real e invertida.",
        },
      ],
    },
  },

  // ── 17 ── Óptica geométrica — avanzado ────────────────────────────────────
  {
    slug: "cneyt-v-fibra-optica-telecomunicaciones",
    titulo: "Fibra óptica y telecomunicaciones: reflexión total interna en México",
    categoria: "Óptica geométrica",
    conceptos_clave: ["fibra óptica", "reflexión total interna", "ángulo crítico", "telecomunicaciones", "CFE Telmex"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La fibra óptica es un cable delgado de vidrio de sílice o plástico que conduce luz mediante reflexión total interna. Consta de un núcleo (con mayor índice de refracción, n_core ≈ 1.48) rodeado por un revestimiento de cladding (n_cladding ≈ 1.46). Cuando la luz viaja por el núcleo y llega a la interfaz con el cladding a un ángulo mayor que el ángulo crítico θ_c = arcsen(n_cladding/n_core) ≈ arcsen(0.986) ≈ 80.5°, se refleja completamente sin pérdida de energía por refracción y continúa propagándose en zigzag a lo largo del cable.",
        },
        {
          tipo: "subtitulo",
          contenido: "Ventajas de la fibra óptica sobre el cobre",
        },
        {
          tipo: "lista",
          items: [
            "Ancho de banda: la fibra puede transmitir terabits por segundo (Tb/s); el cobre de par trenzado llega a gigabits. Una fibra de 125 µm de diámetro puede llevar miles de canales de voz simultáneos.",
            "Pérdida de señal: la atenuación en fibra de sílice es ≈ 0.2 dB/km a 1 550 nm (longitud de onda de telecomunicaciones). En cobre coaxial es ≈ 10–50 dB/km.",
            "Inmunidad electromagnética: la fibra no se ve afectada por campos eléctricos o magnéticos externos, ideal para tendido junto a líneas de alta tensión de la CFE.",
            "Seguridad: es muy difícil interceptar una comunicación de fibra óptica sin que el operador lo detecte.",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "CFE Telecom e-Qué tendió su red de fibra óptica aprovechando la infraestructura eléctrica de la CFE. Con más de 20 000 km de fibra oscura, conecta municipios que antes solo tenían acceso por microondas o satélite. El proyecto Telmex/Telnor tiene más de 100 000 km adicionales. El programa federal 'Internet para todos' pretende extender conectividad de fibra a localidades de menos de 5 000 habitantes en Oaxaca, Chiapas y Guerrero.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "La fibra monomodo (SMF, Single Mode Fiber, núcleo de 8–10 µm) guía un solo modo de luz y se usa en redes de larga distancia. La fibra multimodo (MMF, núcleo de 50–62.5 µm) permite varios modos y se usa en redes locales (LAN). Las primeras redes de fibra en México se instalaron en la década de 1990 para el backbone de Telmex.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Corte transversal de fibra óptica mostrando núcleo, cladding y trayectoria en zigzag de un rayo de luz con ángulo mayor al crítico",
          caption: "La reflexión total interna confina la luz al núcleo: cada reflexión es perfecta, sin pérdida por refracción.",
        },
      ],
    },
  },

  // ── 18 ── Electromagnetismo — intermedio ──────────────────────────────────
  {
    slug: "cneyt-v-campo-electrico-magnetico-induccion",
    titulo: "Campo eléctrico, magnético e inducción electromagnética (ley de Faraday)",
    categoria: "Electromagnetismo",
    conceptos_clave: ["campo eléctrico", "campo magnético", "inducción electromagnética", "ley de Faraday", "fuerza de Lorentz"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Un campo eléctrico E es una región del espacio donde una carga eléctrica experimenta una fuerza. Su magnitud es E = F/q, donde F es la fuerza que ejerce sobre una carga de prueba q. Un campo magnético B (medido en teslas, T) actúa sobre cargas en movimiento con la fuerza de Lorentz: F = q·v × B (producto vectorial). La dirección de esta fuerza es perpendicular tanto a v como a B, razón por la que los campos magnéticos curvan la trayectoria de las partículas sin realizar trabajo.",
        },
        {
          tipo: "subtitulo",
          contenido: "Ley de Faraday: de la mecánica a la electricidad",
        },
        {
          tipo: "parrafo",
          contenido:
            "Michael Faraday descubrió en 1831 que un campo magnético variable en el tiempo induce una fuerza electromotriz (fem) en un circuito conductor. La ley de Faraday establece: fem = −dΦ_B/dt, donde Φ_B = B·A·cos θ es el flujo magnético a través de la superficie del circuito. El signo negativo (ley de Lenz) indica que la corriente inducida se opone al cambio que la genera. Esta ley es el principio de funcionamiento de todos los generadores eléctricos del mundo.",
        },
        {
          tipo: "lista",
          items: [
            "Generadores de la CFE: en las plantas hidroeléctricas (Chicoasén, Malpaso, Infiernillo), el agua mueve turbinas con electroimanes giratorios dentro de bobinas estáticas; el flujo magnético variable genera fem y corriente alterna (CA).",
            "Transformadores: cambian el voltaje de la CA usando inducción mutua entre bobinas. La CFE transmite energía a 400 kV (alto voltaje, baja corriente) para minimizar pérdidas en largas distancias y luego baja a 127/220 V para uso doméstico.",
            "Motor eléctrico del Metro CDMX: convierte energía eléctrica en mecánica usando la fuerza de Lorentz sobre conductores con corriente en un campo magnético.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La ley de Faraday y la ley de Ampère-Maxwell son la base del electromagnetismo clásico. James Clerk Maxwell las unificó en sus cuatro ecuaciones (1865), prediciendo la existencia de ondas electromagnéticas y calculando su velocidad en c = 1/√(ε₀μ₀) = 3×10⁸ m/s, idéntica a la velocidad de la luz. Esto demostró que la luz es una onda electromagnética.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de generador eléctrico simple: bobina girando en campo magnético, con líneas de flujo y corriente inducida indicada",
          caption: "En un generador, la rotación de la bobina cambia el flujo magnético y, por la ley de Faraday, induce una corriente alterna.",
        },
      ],
    },
  },

  // ── 19 ── Electromagnetismo — avanzado ────────────────────────────────────
  {
    slug: "cneyt-v-motores-generadores-cfe",
    titulo: "Motores y generadores eléctricos: la red de la CFE y el Metro CDMX",
    categoria: "Electromagnetismo",
    conceptos_clave: ["motor eléctrico", "generador eléctrico", "ley de Ohm", "V = IR", "CFE", "eficiencia energética"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Un motor eléctrico convierte energía eléctrica en energía mecánica mediante la fuerza de Lorentz: la corriente que fluye por una bobina dentro de un campo magnético genera torque que hace girar el rotor. Un generador es el proceso inverso: la energía mecánica de una turbina rota la bobina, generando corriente alterna por inducción electromagnética. La ley de Ohm V = IR relaciona el voltaje V (en voltios), la corriente I (en amperios) y la resistencia R (en ohms) en circuitos de corriente continua o en la parte resistiva de circuitos AC.",
        },
        {
          tipo: "subtitulo",
          contenido: "La red eléctrica de la CFE",
        },
        {
          tipo: "lista",
          items: [
            "Generación: la CFE produce electricidad en plantas hidroeléctricas (≈ 25% de capacidad), termoeléctricas (≈ 60%), geotérmicas (Cerro Prieto, Baja California), eólicas (Oaxaca) y nucleoeléctrica (Laguna Verde, 2 reactores BWR, 1 600 MW).",
            "Transmisión: la energía viaja por líneas de alta tensión (400 kV, 230 kV) desde las plantas hasta subestaciones regionales. Alta tensión = baja corriente = menos pérdidas por efecto Joule (P = I²R).",
            "Distribución: las subestaciones reducen el voltaje a 13.8 kV para redes urbanas y finalmente a 127/220 V para hogares y negocios.",
            "Metro CDMX: opera con motores de corriente continua (líneas más antiguas) y motores de inducción trifásica (líneas modernas). La Línea 12 usa motores de 225 kW por bogíe; recupera energía al frenar (frenado regenerativo).",
          ],
        },
        {
          tipo: "callout",
          variante: "ejemplo",
          contenido:
            "Ley de Ohm en práctica: una plancha eléctrica de 1 100 W conectada a 127 V. Corriente: I = P/V = 1 100/127 ≈ 8.66 A. Resistencia del elemento: R = V/I = 127/8.66 ≈ 14.7 Ω. El cableado de la instalación debe soportar al menos 10 A de forma continua; por eso se usan calibres AWG 12 o AWG 10 en circuitos de alta demanda.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "La presa Chicoasén en Chiapas, sobre el río Grijalva, tiene una capacidad instalada de 2 400 MW, siendo la segunda planta hidroeléctrica más potente de México después de El Cajón. Sus 8 turbinas Francis generan suficiente electricidad para abastecer a una ciudad de 5 millones de habitantes.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama del sistema eléctrico CFE: planta generadora, transformador elevador, línea de alta tensión, subestación distribuidora y usuario final",
          caption: "La red CFE: generación → transmisión a 400 kV → distribución → 127/220 V en el hogar.",
        },
      ],
    },
  },

  // ── 20 ── Física y sociedad — intermedio ──────────────────────────────────
  {
    slug: "cneyt-v-energia-nuclear-laguna-verde",
    titulo: "Energía nuclear en México: la planta de Laguna Verde y el ININ",
    categoria: "Física y sociedad",
    conceptos_clave: ["energía nuclear", "reactor BWR", "fisión nuclear", "Laguna Verde", "CFE", "ININ"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La Central Nucleoeléctrica de Laguna Verde, ubicada en el municipio de Alto Lucero, Veracruz, sobre el Golfo de México, es la única planta nuclear de México y de América Latina en operación continua. Cuenta con dos reactores de agua en ebullición (BWR, Boiling Water Reactor) de diseño General Electric: la Unidad 1 entró en operación comercial en 1990 y la Unidad 2 en 1995. Juntas tienen una capacidad instalada de ≈ 1 610 MW eléctricos y abastecen aproximadamente el 3–4% de la electricidad del país.",
        },
        {
          tipo: "subtitulo",
          contenido: "Principio de funcionamiento de un reactor BWR",
        },
        {
          tipo: "lista",
          items: [
            "Combustible: el reactor usa uranio enriquecido al 3–5% en U-235 en forma de pastillas de dióxido de uranio (UO₂) encapsuladas en vainas de circonio.",
            "Fisión: los neutrones lentos (termalizados) impactan núcleos de U-235, que se dividen liberando energía (≈ 200 MeV por fisión), nuevos neutrones y calor.",
            "Moderador y refrigerante: en un BWR, el agua cumple ambas funciones. Se calienta y evapora directamente en el núcleo del reactor, generando vapor que impulsa las turbinas.",
            "Control: las barras de control de carburo de boro absorben neutrones para regular la velocidad de la reacción. Si se insertan completamente, el reactor se apaga.",
            "Contención: múltiples barreras (vainas de Zr, vasija de acero, edificio de contención de hormigón de 1.2 m) previenen liberaciones de radiactividad.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La CNSNS (Comisión Nacional de Seguridad Nuclear y Salvaguardias) regula y supervisa la seguridad de Laguna Verde. México es signatario del Tratado de No Proliferación Nuclear (TNP) y tiene acuerdos de salvaguardias con el OIEA (Organismo Internacional de Energía Atómica). El ININ realiza investigación en materiales nucleares, reactores avanzados y aplicaciones de radioisótopos médicos.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "El uranio para Laguna Verde se enriquece en Estados Unidos y Francia; México aún no cuenta con instalaciones de enriquecimiento propias. Sin embargo, el ININ investiga el uso de reactores de cuarta generación que podrían usar combustibles alternativos y producir residuos de vida media más corta.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama esquemático de un reactor BWR: núcleo, vasija, turbina de vapor, condensador y edificio de contención",
          caption: "En un BWR, el agua se evapora directamente en el núcleo; el vapor impulsa la turbina para generar electricidad.",
        },
      ],
    },
  },

  // ── 21 ── Física y sociedad — avanzado ────────────────────────────────────
  {
    slug: "cneyt-v-etica-tecnologica-basura-electronica",
    titulo: "Ética del desarrollo tecnológico: basura electrónica e impacto ambiental",
    categoria: "Física y sociedad",
    conceptos_clave: ["basura electrónica", "RAEE", "impacto ambiental", "ética tecnológica", "economía circular", "SEMARNAT"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Cada dispositivo digital —celular, laptop, televisor, batería de litio— es posible gracias a principios de física: electromagnetismo en los circuitos integrados, óptica en las pantallas OLED, mecánica cuántica en los semiconductores, termodinámica en los sistemas de enfriamiento. Sin embargo, la producción y desecho masivo de estos dispositivos genera uno de los problemas ambientales más urgentes del siglo XXI: la basura electrónica o RAEE (Residuos de Aparatos Eléctricos y Electrónicos).",
        },
        {
          tipo: "subtitulo",
          contenido: "El problema de los RAEE en México",
        },
        {
          tipo: "lista",
          items: [
            "México genera aproximadamente 1 millón de toneladas de RAEE al año, siendo el segundo mayor generador en América Latina después de Brasil.",
            "Solo el 3–10% de esta basura electrónica se gestiona formalmente. El resto termina en tiraderos a cielo abierto donde los metales pesados (plomo, mercurio, cadmio) contaminan suelos y acuíferos.",
            "Los celulares contienen oro, plata, cobre, paladio, litio y cobalto: metales valiosos que se pueden recuperar mediante reciclaje formal. Un millón de celulares contiene ≈ 24 kg de oro, más concentrado que en muchos yacimientos mineros.",
            "La NOM-161-SEMARNAT-2011 regula el manejo de RAEE en México. El programa IUSA y empresas como CICSA operan centros de reciclaje certificados.",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "La ética del desarrollo tecnológico implica reconocer que el conocimiento científico y la ingeniería tienen consecuencias sociales y ambientales. La obsolescencia programada —diseñar dispositivos con vida útil artificial limitada— es una práctica cuestionada éticamente. La economía circular propone un modelo donde los materiales de los dispositivos al final de su vida útil se recuperan y reintegran a la cadena productiva, reduciendo la extracción de materias primas y los residuos.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Las baterías de litio de autos eléctricos e híbridos son la próxima gran ola de RAEE. México tiene planes para masificar los vehículos eléctricos; esto requerirá infraestructura de reciclaje de baterías de gran capacidad. El litio mexicano, con yacimientos en Sonora (el proyecto Sonora Litio de Bacanora Minerals), es estratégico para fabricar estas baterías.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "La producción de un smartphone requiere más de 60 elementos de la tabla periódica, incluyendo tierras raras como neodimio (para los imanes de los altavoces y motores de vibración), indio (pantallas ITO), disprosio y terbio. Muchos de estos elementos solo se extraen en China y la RD del Congo, con preocupantes condiciones laborales y ambientales.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Infografía de ciclo de vida de un smartphone: extracción de materias primas, manufactura, uso y disposición final o reciclaje",
          caption: "La economía circular busca que los materiales de los dispositivos sean recuperados y reusados, no desechados.",
        },
      ],
    },
  },
] as const;

export async function seedBibliotecaCNEYTV(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed Biblioteca CNEYT-V (21 fichas)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac")
    .select("id")
    .eq("codigo", "CNEYT-V")
    .single();

  if (uacErr || !uacRow) {
    throw new Error(
      `UAC CNEYT-V no encontrada. Ejecuta primero seed-mccems.ts y seed-cneytv.ts. Error: ${uacErr?.message}`
    );
  }

  const rows = FICHAS_CNEYTV.map((f, i) => ({
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

  if (error) throw new Error(`Error seeding fichas CNEYT-V: ${error.message}`);

  console.log(`  ✓ ${rows.length} fichas de biblioteca de CNEYT-V insertadas/actualizadas.`);
  console.log("\n✅ Seed Biblioteca CNEYT-V completado.\n");
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
  seedBibliotecaCNEYTV(sb).catch((err) => {
    console.error("❌ Error:", err.message);
    process.exit(1);
  });
}
