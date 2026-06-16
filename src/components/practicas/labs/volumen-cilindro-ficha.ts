/**
 * Datos de la Ficha Teórica del laboratorio de Volumen del cilindro (PM-III-P04).
 *
 * Contenido VERBATIM de la actividad ancla A1 «Perímetros, áreas y volúmenes
 * de figuras cotidianas» (infografía). El marco teórico y las puntos clave
 * provienen de los puntos_clave y contexto_mexicano de A1 (sin inventar datos).
 * El glosario PROVIENE de A1 (campo "glosario") — 5 términos presentes: sí existe.
 * El reto evaluable vive en volumen-cilindro-data.ts (A2).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const CILINDRO_FICHA: FichaTeoricaData = {
  ancla: "PM-III · P04 · A1 — Perímetros, áreas y volúmenes de figuras cotidianas",

  // Marco teórico — VERBATIM de los puntos_clave y contexto_mexicano de A1.
  marcoTeorico: [
    "Perímetro: longitud total del contorno de una figura plana. Fórmulas: rectángulo P = 2(b + h); triángulo P = a + b + c; círculo (circunferencia) C = 2πr. El perímetro determina la cantidad de material para cercar, enmarcar o bordear una figura.",
    "Área: medida de la superficie interior. Fórmulas: rectángulo A = b × h; triángulo A = (b × h)/2; círculo A = πr². La cancha reglamentaria del Estadio Azteca (Ciudad de México) mide 105 m × 68 m: área = 7,140 m². Sede de los Mundiales de Futbol de 1970 y 1986 — único estadio con dos finales de Copa del Mundo.",
    "Pirámide del Sol en Teotihuacán (Estado de México): base cuadrada de aproximadamente 220 m × 220 m, área de base ≈ 48,400 m² (casi 5 hectáreas) y altura de 63 m. Fue la estructura más grande de Mesoamérica. El INAH la conserva y recibe alrededor de 4 millones de visitantes anuales.",
    "Volumen del prisma rectangular: V = l × w × h. Las cisternas (aljibes) de las haciendas yucatecas históricas tenían forma de prisma rectangular de ~3 m × 3 m × 2 m = 18 m³ de capacidad (18,000 litros). El almacenamiento de agua es crítico en la Península de Yucatán, donde no hay ríos superficiales.",
    "Volumen del cilindro: V = πr²h. Un tambo metálico estándar (usado en la industria de aceites en México) tiene r ≈ 29 cm y h ≈ 88 cm. V = π × (0.29)² × 0.88 ≈ 0.233 m³ ≈ 233 litros.",
    "Área superficial y volumen de la esfera: A = 4πr² y V = (4/3)πr³. Las cúpulas de iglesias barrocas mexicanas —como las de la Catedral de Puebla o la Capilla Real de Cholula— son aproximadamente hemisféricas. El área superficial determina la cantidad de azulejo talavera o pintura necesaria para decorarlas.",
    "La milpa mesoamericana: el sistema de cultivo de maíz, frijol y calabaza se mide históricamente en mecates (1 mecate ≈ 400 m² en el sistema maya) o hectáreas. Una milpa familiar típica en Chiapas o Yucatán mide entre 1 y 2 hectáreas (10,000–20,000 m²). La SAGARPA usa m² y hectárea como unidades estándar en sus padrones de agricultores.",
    "π (pi) en aplicaciones mexicanas: el CINVESTAV y la UNAM Instituto de Matemáticas usan π en cálculos de astronomía (órbitas), ingeniería (tuberías, depósitos cilíndricos) y arquitectura (cúpulas, arcos circulares) en proyectos nacionales. Para cálculos escolares, π ≈ 3.1416 es suficientemente preciso.",
    "Conversión de unidades de superficie y volumen: 1 ha = 10,000 m²; 1 km² = 100 ha = 1,000,000 m²; 1 m³ = 1,000 litros; 1 litro = 1,000 cm³. Estas conversiones son indispensables en agronomía, construcción y gestión del agua en México.",
  ],

  objetivos: [
    "Identificar y aplicar las fórmulas de perímetro y área de figuras planas (rectángulo, triángulo, círculo).",
    "Calcular el volumen de sólidos comunes: prisma rectangular, cilindro, cono y esfera.",
    "Convertir unidades de superficie y volumen (m², ha; m³, litros).",
    "Resolver el ejercicio de diseño de un tanque cilíndrico real con datos de la comunidad (A2).",
    "Relacionar la geometría de áreas y volúmenes con la arquitectura prehispánica y el contexto mexicano.",
  ],

  materiales: [
    { nombre: "Cilindro 3D interactivo", detalle: "Ajusta radio y altura y lee el volumen en m³ y litros en tiempo real", icono: "fa-fill-drip" },
    { nombre: "Escenarios reales", detalle: "Tinaco doméstico, tambo industrial, silo agrícola y más", icono: "fa-industry" },
    { nombre: "Fórmulas integradas", detalle: "V = πr²h · A_lat = 2πrh · A_bases = 2πr²", icono: "fa-square-root-variable" },
    { nombre: "Convertidor de unidades", detalle: "1 m³ = 1,000 L de forma inmediata en el marcador", icono: "fa-arrows-rotate" },
  ],

  // Conceptos centrales — VERBATIM del campo "glosario" de A1 (5 términos presentes).
  conceptos: [
    {
      termino: "Perímetro",
      definicion: "Longitud total del contorno de una figura plana. Se mide en unidades lineales (m, cm). Para polígonos es la suma de los lados; para el círculo, es la circunferencia C = 2πr.",
    },
    {
      termino: "Área",
      definicion: "Medida de la superficie encerrada dentro de una figura plana. Se mide en unidades cuadradas (m², cm², ha). Indica cuánta superficie hay que cubrir, pintar, sembrar o construir.",
    },
    {
      termino: "Volumen",
      definicion: "Medida del espacio tridimensional que ocupa un sólido. Se mide en unidades cúbicas (m³, cm³, litros). Indica la capacidad de un contenedor o la cantidad de material en un sólido.",
    },
    {
      termino: "π (pi)",
      definicion: "Constante matemática irracional que representa la razón entre la circunferencia de cualquier círculo y su diámetro. Valor: π ≈ 3.14159... Aparece en todas las fórmulas de figuras circulares, cilíndricas y esféricas.",
    },
    {
      termino: "Hectárea (ha)",
      definicion: "Unidad de medida de superficie equivalente a 10,000 m² (un cuadrado de 100 m × 100 m). Es la unidad estándar para medir terrenos agrícolas, áreas naturales protegidas y predios en México.",
    },
  ],

  // Glosario — VERBATIM del campo "terminos" de A5 (glosario_interactivo, 6 términos).
  glosario: [
    {
      termino: "Perímetro de polígonos",
      definicion: "Suma de la longitud de todos sus lados. Para un rectángulo: P = 2(a+b); para un cuadrado: P = 4l. Ejemplo: Rectángulo 5×3 cm: P = 2(5+3) = 16 cm.",
    },
    {
      termino: "Área de figuras planas",
      definicion: "Superficie encerrada. Triángulo: A=(b·h)/2; rectángulo: A=a·b; círculo: A=πr². Ejemplo: Triángulo b=6 cm, h=4 cm: A=(6·4)/2=12 cm².",
    },
    {
      termino: "Circunferencia y círculo",
      definicion: "Circunferencia (perímetro): C=2πr. Área del círculo: A=πr². Ejemplo: Radio 5 cm: C=2π(5)≈31.4 cm; A=π(25)≈78.5 cm².",
    },
    {
      termino: "Volumen de prismas y cilindros",
      definicion: "V = área de la base × altura. Prisma rectangular: V=l·a·h; cilindro: V=πr²h. Ejemplo: Cilindro r=3, h=10: V=π(9)(10)=90π≈282.7 unidades³.",
    },
    {
      termino: "Volumen de pirámide y cono",
      definicion: "V = (1/3) × área de la base × altura. Pirámide cuadrada: V=(1/3)l²h; cono: V=(1/3)πr²h. Ejemplo: Cono r=3, h=4: V=(1/3)π(9)(4)=12π≈37.7 unidades³.",
    },
    {
      termino: "Volumen de la esfera",
      definicion: "V = (4/3)πr³. La superficie de una esfera es S = 4πr². Ejemplo: Esfera r=6 cm: V=(4/3)π(216)=288π≈904.8 cm³.",
    },
  ],

  aplicaciones: [
    "Diseño de sistemas de almacenamiento de agua en comunidades rurales (tanques cilíndricos).",
    "Cálculo de materiales en construcción: metros cuadrados para pintar paredes, costales de cemento, láminas metálicas.",
    "Agricultura: estimación de hectáreas de milpa, volumen de silos de grano, capacidad de aljibes.",
    "Conservación del patrimonio: el INAH usa fórmulas de área y volumen para calcular materiales de restauración en sitios como Teotihuacán.",
    "Ingeniería civil: capacidad de cisternas, tuberías, depósitos industriales (tambos, pipas).",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Infografía A1, PM-III-P04. Fuentes: INAH 2023, FIFA 2023, UNAM Instituto de Matemáticas 2022.",
};
