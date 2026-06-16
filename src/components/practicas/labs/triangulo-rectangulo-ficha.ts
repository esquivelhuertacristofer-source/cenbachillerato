/**
 * Datos de la Ficha Teórica del laboratorio de Triángulo Rectángulo (PM-IV-P03).
 *
 * Contenido VERBATIM de la actividad ancla A1 «Trigonometría: cómo medir lo
 * que no podemos alcanzar» (lectura). El glosario es VERBATIM de la actividad
 * ancla A5 (glosario_interactivo). El reto evaluable vive en
 * triangulo-rectangulo-data.ts (RETO_A2, fuente PM-IV-P03-A2).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const TRIANGULO_FICHA: FichaTeoricaData = {
  ancla: "PM-IV · P03 · A1 — Trigonometría: cómo medir lo que no podemos alcanzar",

  // Marco teórico — VERBATIM de la lectura A1 (PM-IV-P03-A1).
  marcoTeorico: [
    "Imagina que eres un ingeniero en el siglo XVI y debes calcular la altura de la Pirámide del Sol en Teotihuacán sin escalarla. O que eres un topógrafo moderno midiendo la distancia entre dos puntos separados por un barranco. La trigonometría nació precisamente para resolver este tipo de problemas: medir lo que no se puede medir directamente.",
    "La trigonometría de triángulos rectángulos se basa en tres razones fundamentales que relacionan los lados de un triángulo con sus ángulos:\n\nSeno (sen θ): cateto opuesto al ángulo θ dividido entre la hipotenusa. sen θ = opuesto / hipotenusa.\nCoseno (cos θ): cateto adyacente al ángulo θ dividido entre la hipotenusa. cos θ = adyacente / hipotenusa.\nTangente (tan θ): cateto opuesto dividido entre el cateto adyacente. tan θ = opuesto / adyacente = sen θ / cos θ.\n\nEl acrónimo SOHCAHTOA (Seno = Opuesto / Hipotenusa; Coseno = Adyacente / Hipotenusa; Tangente = Opuesto / Adyacente) es una ayuda mnemotécnica universalmente usada.",
    "En la práctica, un topógrafo que quiere medir la altura de la Pirámide del Sol se coloca a una distancia horizontal conocida de la base, mide el ángulo de elevación hasta la cima con un teodolito, y aplica la tangente: altura = distancia × tan(ángulo). Este mismo principio se usa en GPS satelital, en astronomía para calcular distancias a estrellas cercanas (paralaje), en construcción de puentes y represas, en topografía de montañas y en la navegación marítima y aérea.",
    "La identidad fundamental de la trigonometría —sin²θ + cos²θ = 1— se deriva directamente del Teorema de Pitágoras aplicado al círculo unitario y es la base de innumerables simplificaciones. En arquitectura colonial mexicana, los constructores usaban cuerdas con nudos en proporciones 3-4-5 para verificar ángulos rectos; hoy sus equivalentes digitales usan trigonometría computacional.",
    "Dominar estas tres razones abre la puerta a resolver cualquier triángulo rectángulo: conociendo dos elementos (un lado y un ángulo, o dos lados), podemos calcular todos los demás sin medirlos físicamente.",
  ],

  objetivos: [
    "Identificar los lados de un triángulo rectángulo: cateto opuesto, cateto adyacente e hipotenusa respecto al ángulo θ.",
    "Calcular sen(θ), cos(θ) y tan(θ) a partir de los lados del triángulo rectángulo (SOH-CAH-TOA).",
    "Aplicar la razón tangente para determinar alturas inaccesibles mediante medición indirecta.",
    "Calcular la hipotenusa (línea de visión) usando la razón coseno.",
    "Resolver el reto evaluable de la actividad A2",
  ],

  materiales: [
    { nombre: "Escena 3D interactiva", detalle: "Triángulo rectángulo con distancia d y ángulo θ ajustables en tiempo real", icono: "fa-ruler-triangle" },
    { nombre: "SOH-CAH-TOA", detalle: "Tabla con las tres razones y sus valores en vivo según d y θ", icono: "fa-table" },
    { nombre: "Escenarios guiados", detalle: "Árbol, poste, edificio, asta bandera, torre y pirámide con parámetros reales", icono: "fa-tree" },
    { nombre: "Cálculo paso a paso", detalle: "Panel que muestra cómo se despeja la altura y la línea de visión", icono: "fa-calculator" },
  ],

  // Conceptos centrales — formulados a partir de la lectura A1.
  conceptos: [
    { termino: "Triángulo rectángulo", definicion: "Triángulo que contiene un ángulo de 90°. Sus lados son: dos catetos y la hipotenusa (el lado más largo, opuesto al ángulo recto)." },
    { termino: "Cateto opuesto", definicion: "El lado del triángulo rectángulo que está enfrente del ángulo agudo θ." },
    { termino: "Cateto adyacente", definicion: "El lado del triángulo rectángulo que está pegado al ángulo agudo θ (forma el ángulo junto con la hipotenusa)." },
    { termino: "Hipotenusa", definicion: "El lado más largo del triángulo rectángulo; siempre está opuesto al ángulo de 90°. En medición indirecta es la línea de visión." },
    { termino: "SOHCAHTOA", definicion: "Acrónimo mnemotécnico: Seno = Opuesto / Hipotenusa; Coseno = Adyacente / Hipotenusa; Tangente = Opuesto / Adyacente." },
    { termino: "Ángulo de elevación", definicion: "El ángulo formado entre la horizontal (el piso) y la línea de visión hacia un punto elevado. Se mide con un clinómetro o teodolito." },
    { termino: "Medición indirecta", definicion: "Técnica que usa razones trigonométricas para calcular distancias o alturas inaccesibles sin medirlas físicamente, solo con un ángulo y una distancia accesible." },
    { termino: "Identidad fundamental", definicion: "sin²θ + cos²θ = 1 para todo ángulo θ. Se deriva directamente del Teorema de Pitágoras aplicado al triángulo rectángulo." },
  ],

  // Glosario — VERBATIM de A5 (glosario_interactivo, PM-IV-P03-A5).
  glosario: [
    {
      termino: "Seno (sen θ)",
      definicion: "Razón entre el cateto opuesto al ángulo θ y la hipotenusa del triángulo rectángulo: sen(θ) = opuesto/hipotenusa. Ejemplo: en un △ rectángulo con θ = 30°, cateto opuesto = 5 e hipotenusa = 10: sen(30°) = 5/10 = 0.5.",
    },
    {
      termino: "Coseno (cos θ)",
      definicion: "Razón entre el cateto adyacente al ángulo θ y la hipotenusa: cos(θ) = adyacente/hipotenusa. Ejemplo: en el mismo △ con θ = 30°, cateto adyacente = 5√3: cos(30°) = 5√3/10 = √3/2 ≈ 0.866.",
    },
    {
      termino: "Tangente (tan θ)",
      definicion: "Razón entre el cateto opuesto y el cateto adyacente: tan(θ) = opuesto/adyacente = sen(θ)/cos(θ). Ejemplo: tan(45°) = 1 porque el cateto opuesto y el adyacente son iguales en un triángulo isósceles rectángulo.",
    },
    {
      termino: "Ángulos notables: 30°, 45°, 60°",
      definicion: "Valores exactos: sen(30°)=1/2, cos(30°)=√3/2, tan(30°)=1/√3; sen(45°)=cos(45°)=√2/2, tan(45°)=1; sen(60°)=√3/2, cos(60°)=1/2, tan(60°)=√3. Ejemplo: para calcular la altura de un árbol con ángulo de elevación 60° a 10 m: altura = 10·tan(60°) = 10√3 ≈ 17.3 m.",
    },
    {
      termino: "Identidad pitagórica trigonométrica",
      definicion: "sen²(θ) + cos²(θ) = 1 para todo ángulo θ. Se deriva directamente del Teorema de Pitágoras aplicado al triángulo rectángulo unitario. Ejemplo: sen(30°) = 1/2, cos(30°) = √3/2: (1/2)² + (√3/2)² = 1/4 + 3/4 = 1. ✓",
    },
    {
      termino: "Medición indirecta",
      definicion: "Técnica que usa razones trigonométricas para calcular distancias o alturas inaccesibles mediante ángulos de elevación o depresión. Ejemplo: ángulo de elevación 45° a distancia horizontal 50 m → altura = 50·tan(45°) = 50·1 = 50 m.",
    },
  ],

  aplicaciones: [
    "Topografía: calcular la altura de la Pirámide del Sol o de montañas sin escalarlas, midiendo solo la distancia horizontal y el ángulo de elevación.",
    "GPS satelital y astronomía: determinar distancias a estrellas cercanas mediante el paralaje trigonométrico.",
    "Ingeniería civil: diseño de puentes atirantados (como el Puente Baluarte en Sinaloa/Durango), represas y torres de comunicación en México.",
    "Navegación marítima y aérea: calcular posiciones y distancias a partir de ángulos medidos con sextantes o instrumentos electrónicos.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Lectura A1 y Glosario A5, PM-IV-P03.",
};
