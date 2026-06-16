/**
 * Datos de la Ficha Teórica del laboratorio de Biomas y ecosistemas.
 *
 * Contenido VERBATIM de las actividades ancla de CNEYT-III-P01:
 *   - Marco teórico: puntos_clave y contexto_mexicano de A1 "Biomas de México:
 *     12 ecosistemas, megadiversidad y áreas naturales protegidas".
 *   - Glosario: términos verbatim del glosario_interactivo A5.
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const BIOMAS_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-III · P01 · A1 — Biomas y ecosistemas del mundo y México",

  // Marco teórico — VERBATIM de puntos_clave y contexto_mexicano de A1.
  marcoTeorico: [
    "México alberga el 10–12% de la biodiversidad mundial siendo apenas el 1.5% del territorio global. La CONABIO (2023) lo clasifica entre los cinco países megadiversos junto a Brasil, Indonesia, Colombia y China.",
    "El territorio mexicano comprende 12 de los 14 biomas terrestres reconocidos: selvas húmedas, selvas secas, manglares, pastizales, matorrales xerófilos, bosques templados, desiertos, humedales, dunas costeras, arrecifes de coral, petenes y matorral halófilo.",
    "La Selva Lacandona en Chiapas es el mayor remanente de selva tropical húmeda de Mesoamérica en México, con ~600,000 hectáreas. Alberga más de 3,000 especies de plantas vasculares y 450 especies de aves.",
    "México tiene 182 Áreas Naturales Protegidas federales que cubren ~23 millones de hectáreas —el 11.6% del territorio nacional—, incluyendo 43 Reservas de la Biosfera reconocidas por la UNESCO.",
    "Las zonas áridas y semiáridas cubren el 60% del territorio mexicano. El Desierto Chihuahuense es el más grande de Norteamérica y el más biodiverso del mundo en cactáceas, con más de 900 especies, muchas endémicas.",
    "Los arrecifes del Golfo de México y el Caribe forman el Sistema Arrecifal Mesoamericano, el segundo del mundo. La blanqueación masiva de 2023 dañó el 80% del coral de Cozumel por temperaturas marinas récord de 33 °C.",
    "Los manglares mexicanos cubren ~775,000 hectáreas. México es el cuarto país con mayor extensión de manglar. Campeche, Yucatán y Quintana Roo concentran la mayor cobertura; los manglares son criaderos de especies pesqueras y barrera contra huracanes.",
    "La pérdida neta de bosques y selvas fue de ~244,000 hectáreas por año en 2000–2020 (CONAFOR/Global Forest Watch). Las causas principales son ganadería extensiva, agricultura de roza-tumba-quema y cambio de uso de suelo urbano.",
    "México es un caso único de megadiversidad por su posición geográfica en el punto de encuentro entre dos regiones biogeográficas (Neártica y Neotropical), su topografía extrema que genera docenas de microclimas y una historia geológica que facilita la diversificación evolutiva. El Sistema Nacional de Información sobre Biodiversidad (SNIB) de la CONABIO registra más de 126,000 especies conocidas, de las cuales el 30–50% son endémicas.",
    "México encabeza también rankings de pérdida de biodiversidad. La Lista Roja de la UICN (2023) registra 2,800 especies mexicanas amenazadas. El ajolote (Ambystoma mexicanum), el quetzal en Chiapas y la vaquita marina —con menos de 10 individuos en 2024— son los emblemas de esta crisis.",
  ],

  objetivos: [
    "Distinguir el concepto de bioma del de ecosistema y dar ejemplos de ambos.",
    "Explicar por qué México es considerado un país megadiverso.",
    "Identificar los componentes bióticos y abióticos de un ecosistema.",
    "Relacionar el clima (temperatura y precipitación) con el tipo de bioma y la biodiversidad que alberga.",
    "Resolver el quiz evaluable sobre biomas y ecosistemas de la actividad A2.",
  ],

  materiales: [
    { nombre: "Diorama 3D interactivo", detalle: "Visualización de biomas según temperatura y precipitación", icono: "fa-globe" },
    { nombre: "Diagrama de Whittaker", detalle: "Malla clima→bioma: temperatura (eje X) vs precipitación (eje Y)", icono: "fa-chart-area" },
    { nombre: "Escenarios de México", detalle: "Botones de acceso directo a biomas reales mexicanos", icono: "fa-earth-americas" },
    { nombre: "Panel de datos CONABIO/CONAFOR/SEMARNAT", detalle: "Cifras de megadiversidad y conservación verbatim 2020–2023", icono: "fa-shield-halved" },
  ],

  // Conceptos centrales — formulados a partir de los puntos_clave y glosario de A1.
  conceptos: [
    { termino: "Bioma", definicion: "Gran región de la Tierra caracterizada por su vegetación dominante, clima y comunidad de seres vivos. Los biomas no tienen fronteras rígidas: se solapan en zonas de transición llamadas ecotonos." },
    { termino: "Ecosistema", definicion: "Sistema formado por la comunidad de organismos (biocenosis) y su ambiente físico-químico (biotopo) en interacción. Incluye tanto los componentes bióticos (seres vivos) como los abióticos (clima, suelo, agua, luz) a cualquier escala." },
    { termino: "Especie endémica", definicion: "Especie cuya distribución natural está limitada a una región geográfica específica y no existe en estado silvestre en ningún otro lugar del mundo. México tiene una de las tasas de endemismo más altas del planeta." },
    { termino: "ANP (Área Natural Protegida)", definicion: "Porción del territorio donde el Estado limita las actividades humanas para conservar ecosistemas, biodiversidad y procesos evolutivos. En México existen seis categorías: Reserva de la Biosfera, Parque Nacional, Monumento Natural, entre otras." },
    { termino: "Servicio ecosistémico", definicion: "Beneficio que los ecosistemas naturales brindan a las sociedades sin costo monetario directo: purificación del agua, regulación del clima, polinización de cultivos, control de inundaciones y recreación." },
  ],

  // Glosario — VERBATIM del glosario_interactivo A5 de P01.
  glosario: [
    { termino: "Bioma", definicion: "Gran unidad ecológica definida por el clima y la vegetación dominante que se extiende a escala continental." },
    { termino: "Ecosistema", definicion: "Sistema formado por la comunidad de organismos (biocenosis) y su ambiente físico-químico (biotopo) en interacción." },
    { termino: "Biodiversidad", definicion: "Variedad de seres vivos en todos sus niveles: genes, especies y ecosistemas." },
    { termino: "País megadiverso", definicion: "País que concentra un porcentaje desproporcionadamente alto de la biodiversidad mundial." },
    { termino: "Componente abiótico", definicion: "Elemento no vivo del ecosistema: luz solar, temperatura, agua, suelo, nutrientes." },
    { termino: "Componente biótico", definicion: "Todos los organismos vivos que forman parte de un ecosistema." },
    { termino: "Sucesión ecológica", definicion: "Proceso de cambio gradual y ordenado de comunidades de seres vivos en un ecosistema a lo largo del tiempo, desde una comunidad pionera hasta una comunidad clímax estable." },
  ],

  aplicaciones: [
    "Las Áreas Naturales Protegidas mexicanas sustentan el turismo de naturaleza y la investigación científica, generando empleo en comunidades rurales.",
    "Los manglares actúan como barrera contra huracanes, protegiendo infraestructura costera y reduciendo costos de desastres naturales.",
    "El Corredor Biológico Mesoamericano conecta ANP desde el sur de México hasta Panamá para mantener la conectividad de hábitats. México comprometió 300 millones de dólares para su restauración entre 2021 y 2026.",
  ],

  fuente: "CONABIO — Biodiversidad Mexicana 2023; CONAFOR — Inventario Nacional Forestal y de Suelos 2020; SEMARNAT — Informe de la Situación del Medio Ambiente en México 2022. Actividad ancla: CNEYT-III-P01-A1.",
};
