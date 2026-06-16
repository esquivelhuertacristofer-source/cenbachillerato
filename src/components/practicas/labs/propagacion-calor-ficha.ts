/**
 * Datos de la Ficha Teórica del laboratorio de Propagación del calor (CNEYT-II-P11).
 *
 * Contenido VERBATIM de la actividad ancla A1 «Los tres caminos del calor:
 * conducción, convección y radiación» (lectura) y del glosario A5. El reto
 * evaluable vive en propagacion-calor-data.ts (A2, ejercicio_matematico).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const PROPAGACION_CALOR_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-II · P11 · A1 — Los tres caminos del calor: conducción, convección y radiación",

  // Marco teórico — VERBATIM de la lectura A1.
  marcoTeorico: [
    "El calor es energía que se transfiere espontáneamente de un cuerpo caliente a uno frío hasta que ambos alcanzan la misma temperatura (equilibrio térmico). No hay que confundir CALOR con TEMPERATURA: la temperatura mide la energía cinética promedio de las partículas; el calor es la energía que viaja entre cuerpos a distinta temperatura. ¿Pero por qué camino viaja? Hay tres formas de propagación.",
    "CONDUCCIÓN. Es la propagación del calor a través de la materia por contacto directo, SIN que la materia se desplace. Cuando calientas un extremo de una barra metálica, sus átomos vibran con más energía y, al chocar con sus vecinos, les transmiten esa vibración: el calor avanza átomo a átomo. Los METALES conducen muy bien (tienen electrones libres); la madera, el plástico, el aire o el corcho conducen muy mal (son AISLANTES). La rapidez con que un material conduce el calor se mide con su CONDUCTIVIDAD TÉRMICA k (en W/m·K): el cobre tiene k≈401, la madera apenas k≈0.15. La ley de Fourier resume el flujo: Q/t = k·A·ΔT/L, donde A es el área, ΔT la diferencia de temperatura y L el grosor.",
    "CONVECCIÓN. Es la propagación del calor en los FLUIDOS (líquidos y gases) mediante el movimiento del propio fluido. Cuando calientas agua por abajo, el fluido del fondo se dilata, pierde densidad y SUBE; arriba se enfría, se vuelve denso y BAJA. Así nace una corriente de convección que transporta el calor CON la materia. La convección explica que el agua hierva formando burbujas que suben, que el humo ascienda, que los radiadores se pongan abajo y el aire acondicionado arriba, y que existan las brisas marinas: de día la tierra se calienta más rápido que el mar y el aire caliente sube, atrayendo aire fresco desde el océano.",
    "RADIACIÓN. Es la propagación del calor por ONDAS ELECTROMAGNÉTICAS (sobre todo infrarrojas). A diferencia de las otras dos, NO necesita un medio material: puede viajar incluso en el vacío. Así nos llega el calor del Sol cruzando 150 millones de kilómetros de espacio vacío. Todo cuerpo emite radiación según su temperatura; la ley de Stefan-Boltzmann dice que la potencia emitida crece con la CUARTA potencia de la temperatura absoluta: Q/t = ε·σ·A·T⁴ (con σ = 5.67×10⁻⁸ W/m²·K⁴). Por eso, si la temperatura de un cuerpo se duplica, irradia 16 veces más energía (2⁴ = 16). Una fogata te calienta la cara aunque el aire entre tú y ella siga frío.",
    "CONDUCTIVIDAD Y CAPACIDAD TÉRMICA. Dos propiedades de la materia son clave. La CONDUCTIVIDAD TÉRMICA k dice qué tan bien conduce el calor un material. La CAPACIDAD TÉRMICA ESPECÍFICA c dice cuánta energía se necesita para subir 1 °C la temperatura de 1 kg de sustancia (en J/kg·K), según Q = m·c·ΔT. El agua tiene un calor específico altísimo (c≈4186), mucho mayor que el de los metales: por eso tarda en calentarse y en enfriarse, y por eso el mar y los lagos MODERAN el clima de las regiones que los rodean.",
    "EN LA VIDA REAL los tres mecanismos suelen actuar a la vez: en una olla sobre la estufa, el metal conduce el calor de la flama, el agua circula por convección y las paredes calientes irradian. Comprender la propagación del calor permite diseñar casas frescas, ropa abrigadora, termos, calentadores solares y motores más eficientes.",
  ],

  objetivos: [
    "Distinguir las tres formas de propagación del calor: conducción, convección y radiación.",
    "Calcular el flujo de calor por conducción con la ley de Fourier (Q/t = k·A·ΔT/L).",
    "Usar la capacidad térmica específica para calcular energía (Q = m·c·ΔT).",
    "Explicar por qué la radiación viaja en el vacío y cómo crece con la cuarta potencia de T.",
    "Resolver el ejercicio evaluable de cálculo del flujo de calor en contexto (A2).",
  ],

  materiales: [
    { nombre: "Conducción 3D", detalle: "Barra que se calienta átomo a átomo, sin desplazar la materia", icono: "fa-fire-burner" },
    { nombre: "Convección 3D", detalle: "Corriente de fluido que sube caliente y baja frío", icono: "fa-water" },
    { nombre: "Radiación 3D", detalle: "Ondas electromagnéticas que viajan incluso en el vacío", icono: "fa-sun" },
    { nombre: "Calculadora k y c", detalle: "Flujo Q/t = k·A·ΔT/L y energía Q = m·c·ΔT", icono: "fa-calculator" },
  ],

  // Conceptos centrales — formulados a partir de la lectura A1.
  conceptos: [
    { termino: "Calor vs. temperatura", definicion: "La temperatura mide la energía cinética promedio de las partículas; el calor es la energía que viaja entre cuerpos a distinta temperatura." },
    { termino: "Conducción", definicion: "Propagación del calor por contacto directo, sin que la materia se desplace: el calor avanza átomo a átomo (típico de los metales)." },
    { termino: "Convección", definicion: "Propagación del calor en fluidos mediante corrientes: el fluido caliente sube y el frío baja, transportando el calor con la materia." },
    { termino: "Radiación", definicion: "Propagación del calor por ondas electromagnéticas; no necesita medio material y puede viajar en el vacío, como el calor del Sol." },
    { termino: "Conductividad térmica (k)", definicion: "Mide qué tan bien conduce el calor un material (W/m·K): cobre k≈401, madera k≈0.15." },
    { termino: "Capacidad térmica específica (c)", definicion: "Energía necesaria para subir 1 °C la temperatura de 1 kg de sustancia (J/kg·K); el agua tiene c≈4186." },
  ],

  // Glosario — VERBATIM de la actividad A5 (glosario_interactivo).
  glosario: [
    { termino: "Calor", definicion: "Energía en tránsito entre cuerpos a distinta temperatura; se mide en joules (J)." },
    { termino: "Temperatura", definicion: "Medida de la energía cinética promedio de las partículas; se mide en °C o K." },
    { termino: "Conducción", definicion: "Propagación del calor por contacto directo, sin desplazamiento de la materia." },
    { termino: "Convección", definicion: "Propagación del calor mediante corrientes de un fluido que se mueve." },
    { termino: "Radiación", definicion: "Propagación del calor por ondas electromagnéticas; no necesita medio material." },
    { termino: "Conductividad térmica (k)", definicion: "Propiedad que indica qué tan bien un material conduce el calor (W/m·K)." },
    { termino: "Capacidad térmica específica (c)", definicion: "Energía necesaria para elevar 1 °C la temperatura de 1 kg de sustancia (J/kg·K)." },
    { termino: "Equilibrio térmico", definicion: "Estado en que dos cuerpos en contacto llegan a la misma temperatura." },
    { termino: "Ley de Fourier", definicion: "Relación del flujo de calor por conducción: Q/t = k·A·ΔT/L." },
    { termino: "Ley de Stefan-Boltzmann", definicion: "La potencia radiada crece con la cuarta potencia de la temperatura: Q/t = ε·σ·A·T⁴." },
  ],

  aplicaciones: [
    "Diseñar casas frescas, ropa abrigadora, termos y calentadores solares aprovechando aislantes (k baja) y materiales conductores (k alta).",
    "Explicar las brisas marinas: de día la tierra se calienta más rápido que el mar y el aire caliente sube, atrayendo aire fresco desde el océano.",
    "Entender por qué el mar y los lagos moderan el clima de las costas: el agua tiene una capacidad térmica específica muy alta.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Lectura A1, CNEYT-II-P11.",
};
