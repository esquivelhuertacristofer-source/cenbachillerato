/**
 * Datos de la Ficha Teórica del laboratorio de Deforestación.
 *
 * Contenido VERBATIM de las actividades ancla de CNEYT-III-P06:
 *   - Marco teórico: lectura A1 «Deterioro ambiental: contaminación,
 *     deforestación y cambio climático» (párrafos verbatim).
 *   - Glosario: glosario interactivo A5 «Deterioro ambiental» (6 términos
 *     verbatim).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const DEFORESTACION_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-III · P06 · A1 — Deterioro ambiental: contaminación, deforestación y cambio climático",

  // Marco teórico — VERBATIM de la lectura A1.
  marcoTeorico: [
    "El deterioro ambiental no es un problema del futuro: es una realidad presente que afecta la calidad de vida, la salud y la seguridad alimentaria de millones de personas hoy. En México, las tres dimensiones del deterioro ambiental —contaminación, deforestación y cambio climático— se interconectan y se amplifican mutuamente.",
    "La contaminación del aire es quizás la más visible. La Ciudad de México y Guadalajara superan regularmente las normas de la OMS para partículas finas (PM2.5), cuya inhalación prolongada se asocia con enfermedades respiratorias, cardiovasculares y cáncer de pulmón. La contaminación del agua afecta cuencas enteras: el río Atoyac, que atraviesa Puebla y Tlaxcala, es uno de los más contaminados de América Latina por descargas industriales y aguas residuales sin tratar, pese a años de litigios ambientales. La contaminación del suelo por minería a cielo abierto —especialmente en Sonora y Zacatecas— deja pasivos ambientales que tardan décadas en recuperarse y contaminan los acuíferos subterráneos.",
    "La deforestación reduce la capacidad del territorio para regular el ciclo hídrico, fijar carbono y albergar biodiversidad. México pierde aproximadamente 92,000 hectáreas de bosque y selva al año, según el CONAFOR (2023). Las causas principales son la ganadería extensiva (55%), la agricultura de roza-tumba-quema (28%) y la tala ilegal (17%). Las regiones más afectadas son la Selva Lacandona en Chiapas, la Sierra Madre Occidental y la Huasteca.",
    "El cambio climático amplifica todos los demás problemas ambientales y, a su vez, es amplificado por ellos. México es altamente vulnerable a sus efectos (INECC 2023): el norte del país enfrenta sequías cada vez más severas que afectan la agricultura y el suministro de agua; las costas del Pacífico y el Golfo son golpeadas por huracanes de mayor intensidad; y los glaciares del Iztaccíhuatl y el Citlaltépetl (Pico de Orizaba) han perdido más del 70% de su masa en el último siglo.",
    "La trampa de las sinergias es particularmente grave: la deforestación reduce la absorción de CO2 y amplifica el calentamiento global, que a su vez aumenta la frecuencia e intensidad de los incendios forestales, que amplifican la deforestación. Este ciclo vicioso solo puede romperse con intervenciones simultáneas en múltiples frentes.",
    "Las soluciones locales son efectivas cuando están articuladas con políticas públicas: programas de reforestación comunitaria como las brigadas del CONAFOR, el diseño de corredores biológicos que reconectan ecosistemas fragmentados, la agricultura agroecológica que evita el desmonte, y la participación de comunidades indígenas en el manejo de sus territorios.",
  ],

  objetivos: [
    "Identificar las tres dimensiones del deterioro ambiental en México: contaminación, deforestación y cambio climático.",
    "Explicar cómo la deforestación altera los servicios ecosistémicos: fijación de carbono, biodiversidad, ciclo hídrico y suelo.",
    "Describir la trampa de sinergias entre deforestación, cambio climático e incendios forestales.",
    "Reconocer las causas principales de la deforestación en México según el CONAFOR (2023): ganadería 55%, roza-tumba-quema 28%, tala ilegal 17%.",
    "Proponer soluciones articuladas: reforestación, corredores biológicos, agroecología y manejo comunitario.",
    "Resolver el quiz evaluable sobre deterioro ambiental de la actividad A2.",
  ],

  materiales: [
    { nombre: "Visor 3D del predio forestal", detalle: "Muestra la pérdida de cobertura y sus efectos en 3D", icono: "fa-tree" },
    { nombre: "Control de cobertura y restauración", detalle: "Ajusta el % de bosque y el % de área restaurada", icono: "fa-sliders" },
    { nombre: "Selector de causa", detalle: "Ganadería extensiva, roza-tumba-quema, tala ilegal (CONAFOR 2023)", icono: "fa-fire" },
    { nombre: "Escenarios guiados", detalle: "Bosque intacto, ganadería, roza-tumba-quema, tala ilegal, restauración", icono: "fa-map" },
    { nombre: "Barras de servicios ecosistémicos", detalle: "Carbono, biodiversidad, agua, erosión — respuesta en tiempo real", icono: "fa-chart-simple" },
  ],

  // Conceptos centrales formulados a partir de la lectura A1.
  conceptos: [
    { termino: "Deterioro ambiental", definicion: "Degradación de los ecosistemas por actividades humanas. En México se manifiesta en tres dimensiones interconectadas: contaminación, deforestación y cambio climático, que se amplifican mutuamente." },
    { termino: "Servicios ecosistémicos", definicion: "Beneficios que un ecosistema (como un bosque) presta a la sociedad: fijación de carbono, regulación del ciclo hídrico, albergue de biodiversidad y sujeción del suelo. Al deforestar, todos caen simultáneamente." },
    { termino: "Trampa de sinergias", definicion: "Ciclo vicioso donde la deforestación reduce la absorción de CO₂ → el calentamiento aumenta → las sequías e incendios crecen → la deforestación se amplifica. Solo puede romperse con intervenciones simultáneas en múltiples frentes." },
    { termino: "Ganadería extensiva", definicion: "Principal causa de deforestación en México (55%, CONAFOR 2023): se tala el bosque para abrir potreros. El suelo sin raíces se compacta y empobrece." },
    { termino: "Bioacumulación y biomagnificación", definicion: "La bioacumulación es la acumulación de contaminantes en un organismo. La biomagnificación es el aumento progresivo de su concentración al ascender en la cadena trófica." },
  ],

  // Glosario — VERBATIM del glosario interactivo A5 de P06.
  glosario: [
    { termino: "Cambio climático antropogénico", definicion: "Modificación del clima global causada por actividades humanas que aumentan los gases de efecto invernadero." },
    { termino: "Deforestación", definicion: "Eliminación de la cubierta forestal por tala, incendios o conversión de tierras para agricultura o ganadería." },
    { termino: "Lluvia ácida", definicion: "Precipitación con pH bajo causada por la disolución de SO₂ y NOₓ en la atmósfera; daña bosques, suelos y cuerpos de agua." },
    { termino: "Biomagnificación", definicion: "Aumento progresivo de la concentración de un contaminante al ascender en la cadena trófica." },
    { termino: "Eutrofización", definicion: "Exceso de nutrientes (N y P) en cuerpos de agua que provoca crecimiento masivo de algas y depleción de oxígeno." },
    { termino: "Huella de carbono", definicion: "Cantidad total de gases de efecto invernadero emitidos directa o indirectamente por una persona, organización o producto." },
  ],

  aplicaciones: [
    "El artículo 4° de la Constitución Política de los Estados Unidos Mexicanos reconoce el derecho a un medio ambiente sano desde 2012.",
    "Las brigadas del CONAFOR realizan reforestación comunitaria para revertir la pérdida de 92,000 ha de bosque al año.",
    "El diseño de corredores biológicos reconecta ecosistemas fragmentados y permite la migración de especies.",
    "La participación de comunidades indígenas en el manejo territorial ha demostrado ser una de las estrategias más efectivas de conservación.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Lectura A1 y glosario A5, CNEYT-III-P06.",
};
