/**
 * Datos de la Ficha Teórica del laboratorio de Gravitación universal (CNEYT-V-P03).
 *
 * Contenido VERBATIM de la actividad ancla A1 «Gravitación universal: de la
 * manzana de Newton a los satélites mexicanos» (lectura).
 * Glosario VERBATIM de A5 «Glosario — Gravitación universal y sistema solar».
 * El reto evaluable vive en gravitacion-universal-data.ts (A2).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const GRAVITACION_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-V · P03 · A1 — Gravitación universal: de la manzana de Newton a los satélites mexicanos",

  // Marco teórico — VERBATIM de la lectura A1.
  marcoTeorico: [
    "En 1687, Isaac Newton propuso que la misma fuerza que hace caer una manzana al suelo es la que mantiene a la Luna en órbita alrededor de la Tierra: la gravedad universal. Su Ley de Gravitación Universal establece que dos masas se atraen con una fuerza directamente proporcional al producto de sus masas e inversamente proporcional al cuadrado de la distancia que las separa: F = G · m₁ · m₂ / r², donde G = 6.674 × 10⁻¹¹ N·m²/kg² es la constante de gravitación universal, m₁ y m₂ son las masas de los dos cuerpos y r es la distancia entre sus centros. Esta fuerza es siempre atractiva y actúa a distancia, sin contacto físico.",
    "El peso de un cuerpo es la fuerza gravitacional que ejerce la Tierra sobre él: W = mg, donde g es la aceleración gravitacional de la superficie terrestre (g_Tierra ≈ 9.8 m/s²). Sin embargo, g varía de un cuerpo celeste a otro. En la Luna, g_Luna ≈ 1.62 m/s²: una persona de 70 kg pesa 70 × 1.62 = 113.4 N ≈ 11.6 kg-fuerza (aproximadamente 1/6 de su peso en la Tierra). En Marte, g_Marte ≈ 3.71 m/s² (≈ 38% de la Tierra). En Júpiter, g_Júpiter ≈ 24.8 m/s² (≈ 2.5 veces la Tierra): esa misma persona pesaría 1,736 N ≈ 177 kg-fuerza. La masa, en cambio, siempre es la misma (70 kg en cualquier planeta), ya que es una propiedad intrínseca del cuerpo.",
    "Las Tres Leyes de Kepler (formuladas entre 1609 y 1619, antes de Newton) describen el movimiento de los planetas. 1ª Ley (de las órbitas): los planetas se mueven en órbitas elípticas con el Sol en uno de los focos. 2ª Ley (de las áreas): la línea que une un planeta con el Sol barre áreas iguales en tiempos iguales (los planetas van más rápido cuando están más cerca del Sol). 3ª Ley (de los períodos): el cuadrado del período orbital es proporcional al cubo del semieje mayor de la órbita (T² ∝ a³). Newton demostró que las leyes de Kepler son consecuencias matemáticas de su Ley de Gravitación Universal.",
    "La órbita geoestacionaria es aquella en la que un satélite tiene exactamente el mismo período orbital que la rotación de la Tierra (T = 24 h = 86,400 s). Esto ocurre a una altura de 35,786 km sobre el ecuador terrestre. Un satélite en esta órbita parece fijo en el cielo desde cualquier punto de la Tierra, lo que lo hace ideal para telecomunicaciones y televisión satelital.",
    "México tiene una larga historia satelital. En 1985 se lanzaron los satélites Morelos I (a bordo del transbordador Discovery, misión STS-51-G) y Morelos II (a bordo del transbordador Atlantis, misión STS-61-B), utilizados para telecomunicaciones nacionales. Posteriormente vinieron Satmex 5 (1998), Morelos 3 (2015) y la constelación Mexsat (Bicentenario, Morelos 3), que actualmente provee servicios de telecomunicaciones a zonas rurales y remotas de México. La Agencia Espacial Mexicana (AEM) fue fundada en 2010 bajo la Secretaría de Comunicaciones y Transportes; coordina la política espacial del país, el desarrollo de capacidades tecnológicas y la participación en proyectos internacionales. México forma parte de la Agencia Espacial Latinoamericana y del Caribe (ALCE).",
  ],

  objetivos: [
    "Enunciar la Ley de Gravitación Universal F = G·m₁·m₂/r² e identificar cada variable.",
    "Calcular la fuerza gravitacional entre la Tierra y la Luna a partir de sus masas y distancia.",
    "Distinguir masa y peso, y calcular el peso de un cuerpo en distintos cuerpos celestes (W = mg).",
    "Enunciar las tres leyes de Kepler y aplicarlas para describir el movimiento orbital de los planetas.",
    "Explicar la órbita geoestacionaria y el papel de los satélites Mexsat en las telecomunicaciones mexicanas.",
    "Resolver el reto evaluable de la actividad A2 (cálculos de gravitación).",
  ],

  materiales: [
    { nombre: "Modo Fuerza", detalle: "Atracción Tierra–Luna con F = G·M·m/r² (ley del inverso del cuadrado)", icono: "fa-down-left-and-up-right-to-center" },
    { nombre: "Modo Peso", detalle: "W = m·g en Luna, Marte, Tierra y Júpiter; la masa no cambia", icono: "fa-weight-hanging" },
    { nombre: "Modo Órbita", detalle: "Satélite Mexsat geoestacionario a 35,786 km; T = 24 h", icono: "fa-satellite" },
    { nombre: "Sliders interactivos", detalle: "Varía r, m o altura y observa cómo cambian F, W y T en tiempo real", icono: "fa-sliders" },
  ],

  // Conceptos formulados a partir de A1 (verbatim).
  conceptos: [
    { termino: "Ley de Gravitación Universal", definicion: "F = G·m₁·m₂/r², donde G ≈ 6.674×10⁻¹¹ N·m²/kg². La fuerza gravitacional es siempre atractiva, proporcional al producto de las masas e inversamente proporcional al cuadrado de la distancia." },
    { termino: "Constante de gravitación G", definicion: "G = 6.674×10⁻¹¹ N·m²/kg². Es la misma en todo el universo y fue determinada experimentalmente por Cavendish en 1798." },
    { termino: "Peso (W) y masa (m)", definicion: "W = mg. La masa es una propiedad intrínseca del cuerpo (siempre 70 kg). El peso depende de la gravedad del cuerpo celeste: W_Luna ≈ 113 N; W_Júpiter ≈ 1,736 N." },
    { termino: "Órbita geoestacionaria", definicion: "Órbita circular a 35,786 km sobre el ecuador donde T = 24 h. El satélite parece fijo en el cielo: ideal para telecomunicaciones y televisión satelital." },
    { termino: "Leyes de Kepler", definicion: "1ª: órbitas elípticas con el Sol en un foco. 2ª: áreas iguales en tiempos iguales. 3ª: T² ∝ a³. Newton demostró que son consecuencias de la Ley de Gravitación Universal." },
    { termino: "Ley del inverso del cuadrado", definicion: "F ∝ 1/r². Al duplicar la distancia, la fuerza se reduce a un cuarto; al triplicarla, a un noveno." },
  ],

  // Glosario VERBATIM de A5 «Glosario — Gravitación universal y sistema solar».
  glosario: [
    { termino: "Ley de gravitación universal (Newton)", definicion: "F = G·m₁·m₂/r², donde F es la fuerza gravitacional, G ≈ 6.674 × 10⁻¹¹ N·m²/kg², m₁ y m₂ son las masas y r es la distancia entre sus centros. La fuerza es siempre atractiva. Ejemplo: la Tierra (5.97 × 10²⁴ kg) atrae a la Luna (7.34 × 10²² kg) a 3.84 × 10⁸ m: F ≈ 1.98 × 10²⁰ N." },
    { termino: "Primera ley de Kepler (órbitas elípticas)", definicion: "Cada planeta se mueve en una órbita elíptica alrededor del Sol, con el Sol situado en uno de los dos focos de la elipse. Ejemplo: la órbita de la Tierra es casi circular (excentricidad ≈ 0.017), pero técnicamente es una elipse con el Sol en un foco." },
    { termino: "Segunda ley de Kepler (áreas iguales)", definicion: "La línea que une un planeta con el Sol barre áreas iguales en tiempos iguales. Implica que los planetas se mueven más rápido cerca del Sol (perihelio) y más lento lejos (afelio). Ejemplo: la Tierra se mueve a ~30.3 km/s en perihelio (enero) y a ~29.3 km/s en afelio (julio)." },
    { termino: "Tercera ley de Kepler (períodos y distancias)", definicion: "El cuadrado del período orbital T es proporcional al cubo del semieje mayor a de la órbita: T² ∝ a³. Para el sistema solar: T²/a³ = constante. Ejemplo: la Tierra tiene T = 1 año y a = 1 UA. Marte tiene a ≈ 1.52 UA, así T² = 1.52³ ≈ 3.51 → T ≈ 1.87 años." },
    { termino: "Velocidad de escape", definicion: "Velocidad mínima que debe tener un objeto para escapar del campo gravitacional de un cuerpo: v_esc = √(2GM/R). Para la Tierra, v_esc ≈ 11.2 km/s. Ejemplo: los cohetes deben superar 11.2 km/s para salir de la gravedad terrestre sin propulsión adicional." },
    { termino: "Gravedad en la superficie (g)", definicion: "g = GM/R², donde M es la masa del planeta y R su radio. En la Tierra g ≈ 9.8 m/s²; en la Luna g ≈ 1.62 m/s²; en Marte g ≈ 3.72 m/s². Ejemplo: un astronauta de 70 kg pesa 686 N en la Tierra, 113 N en la Luna y 260 N en Marte." },
  ],

  aplicaciones: [
    "Las mareas oceánicas (Golfo de México, Pacífico) son producidas por la atracción gravitacional de la Luna sobre los océanos terrestres.",
    "Los satélites Mexsat (Bicentenario, Morelos 3) en órbita geoestacionaria proveen internet y telefonía a comunidades rurales y remotas de México.",
    "La Agencia Espacial Mexicana (AEM), fundada en 2010, coordina la política espacial del país y participa en proyectos internacionales con la ALCE.",
    "Las leyes de Kepler permiten calcular las trayectorias de sondas espaciales y la duración de las misiones interplanetarias.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — CNEYT-V-P03. Ref: Serway & Jewett, Física (9ª ed.); AEM — Agencia Espacial Mexicana; SCT México.",
};
