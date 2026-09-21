/**
 * GENERA LA CARÁTULA PROPIA DE UN LABORATORIO.
 *
 * `generar-imagenes-faltantes.ts` sólo cubre actividades: entra por la tabla
 * `actividades` y escribe `contenido.url_imagen`. Los laboratorios no tienen
 * fila propia —su carátula vive en disco y la resuelve `lab-imagenes.ts`—, así
 * que necesitan esta variante. Comparte lo que importa: el mismo modelo, el
 * mismo grafo mínimo armado a mano, la MISMA ficha de estilo y la misma semilla
 * estable por nombre, para que las carátulas nuevas no desentonen con las 137
 * que ya están.
 *
 * La escena se escribe a mano, aquí abajo. Un prompt hecho con el título del
 * laboratorio da borrones: hay que nombrar objetos que se puedan poner sobre
 * una mesa.
 *
 * Después de generar hay que registrar el slug en el `Set` del semestre en
 * `src/lib/practicas/lab-imagenes.ts`, o el archivo queda en disco sin que
 * nadie lo pida.
 *
 * Requiere ComfyUI escuchando en 127.0.0.1:8188.
 *
 * Uso:
 *   npx tsx scripts/generar-caratula-lab.ts --dry
 *   npx tsx scripts/generar-caratula-lab.ts [--solo=slug] [--rehacer]
 */
import { resolve } from "path";
import { existsSync, mkdirSync } from "fs";
import sharp from "sharp";

const HOST = "http://127.0.0.1:8188";
const UNET = "krea2TurboOfficialComfy_krea2TurboFp8.safetensors";
const CLIP = "qwen3vl_4b_fp8_scaled.safetensors";
const VAE = "qwen_image_vae.safetensors";

const PUBLIC_DIR = resolve(process.cwd(), "public");
const ANCHO = 1216, ALTO = 832;
/** Mismo ancho final que las carátulas ya publicadas (800 px). */
const ANCHO_WEBP = 800;
const CALIDAD = 80;

/** La ficha de estilo de CEN Bachillerato — copiada tal cual, no reescribir. */
const ESTILO = [
  "Soft matte plasticine clay 3D render, handmade stop-motion diorama,",
  "rounded chunky shapes modelled in coloured modelling clay with a slightly soft matte surface,",
  "warm muted pastel palette of dusty terracotta, sage green, soft blue and cream,",
  "plain softly graded studio backdrop, gentle diffuse light with a warm glow and one soft contact shadow,",
  "calm uncluttered composition with generous empty space, the subject centred, large and fully lit,",
  "friendly educational illustration, polished like a stop-motion short film.",
  "No text, no letters, no numbers, no watermark, no logos, no signage, no UI.",
].join(" ");

interface Caratula { slug: string; semestre: number; escena: string }

/**
 * Los laboratorios que todavía comparten una foto de tema con otros. La escena
 * describe objetos concretos, no el tema en abstracto.
 */
const PENDIENTES: Caratula[] = [
  {
    slug: "instrucciones-ingles",
    semestre: 3,
    escena:
      "A clay computer screen standing upright on a clay desk seen slightly from above: three fat clay " +
      "buttons sit in a row at its top edge, one red, one blue and one green, and a chunky clay hand " +
      "presses the red one while a small clay document tile slides off the screen and falls to the floor; " +
      "to the right, five little clay step tiles are stacked in a leaning crooked tower next to a fat clay " +
      "speech bubble holding a single clay question mark",
  },
  {
    slug: "pasado-viaje-ingles",
    semestre: 4,
    escena:
      "A clay travel scrapbook seen slightly from above: a long fat clay ribbon runs left to right across " +
      "the page like a road, a chunky clay lightning bolt stabs down through the middle of it, and a small " +
      "clay bus sits at the near end; to the right a stack of four rounded clay photo cards leans against " +
      "a fat clay suitcase, and a chunky clay hand presses a little clay tile onto the top card",
  },
  {
    slug: "experiencias-recientes-ingles",
    semestre: 3,
    escena:
      "A clay conversation bench seen slightly from above: two thumb-sized clay figures face each other " +
      "across a long horizontal clay timeline bar that ends in a fat clay dot, one figure holding a wide " +
      "clay speech bubble that stretches over the whole bar while the other pushes a chunky clay pin down " +
      "into a single point of it; a small cracked clay tile with a tiny clay calendar on it lies discarded " +
      "on the bench beside them",
  },
  {
    slug: "habitos-comparaciones-ingles",
    semestre: 3,
    escena:
      "A clay comparison bench seen slightly from above: a fat clay block sits at the bottom of a " +
      "three-step clay staircase, and a chunky clay hand presses a small clay tile onto the middle step " +
      "while a cracked clay tile lies discarded on the floor; to the right two rounded clay cards of " +
      "different heights stand side by side on a little clay balance scale, joined by a thin clay thread " +
      "to a fat clay speech bubble holding two tiny matching clay tiles",
  },
  {
    slug: "describir-personas-clima-ingles",
    semestre: 2,
    escena:
      "A clay dressing rail seen slightly from above: five small rounded clay slots run left to right " +
      "toward a fat clay jacket hanging at the end, and a chunky clay hand presses a little clay tile into " +
      "the second slot while two identical tiles wait on the rail beside it and one lies cracked on the " +
      "floor below; to the right a small clay weather dial with a fat clay sun on one half and three clay " +
      "raindrops on the other stands next to a thumb-sized clay figure holding a round clay umbrella",
  },
  {
    slug: "aula-ingles-interacciones",
    semestre: 1,
    escena:
      "A clay classroom desk seen slightly from above: a rounded clay student hand raises one fat clay " +
      "speech bubble toward a small clay teacher figure standing by a chunky clay blackboard, while two " +
      "other clay speech bubbles of the same size lie discarded and cracked on the desk beside it; a thin " +
      "clay thread links the raised bubble to a tiny clay clock on the wall, and an open clay notebook " +
      "with three blank clay slots rests under the hand",
  },
  {
    slug: "perfil-personal-ingles",
    semestre: 1,
    escena:
      "A clay enrollment counter seen slightly from above: a rounded clay hand presses a small clay name " +
      "tile into the first of eight empty rounded slots on a fat clay form board, while two nearly " +
      "identical clay tiles wait on the counter beside it, one stamped with a tiny clay flag and the other " +
      "with a small clay country outline; to the right a fat clay speech bubble stands on a little clay " +
      "stand with three thin clay threads running to three small clay answer cards, only one tied tight",
  },
  {
    slug: "tiempo-libre-ingles",
    semestre: 2,
    escena:
      "A clay park table seen slightly from above: a fat rounded clay verb block rests on a small clay " +
      "turntable ringed by seven tiny clay figures, one alone, a pair and a huddle of three, and a " +
      "thumb-sized clay tile stamped with a single letter is clipped onto the end of the verb block while " +
      "two identical loose tiles lie beside it; behind the turntable three shallow clay trays hold chunky " +
      "clay word-blocks sorted into three heaps",
  },
  {
    slug: "convivencia-digital",
    semestre: 1,
    escena:
      "A clay desk seen slightly from above: one fat rounded clay speech bubble sits on a small clay " +
      "turntable with three chunky clay dials beneath it, and three thin clay threads carry identical " +
      "copies of that bubble to three different places — a single small clay figure, a tight clay huddle " +
      "of six tiny figures, and a wide clay megaphone; beside the turntable a small clay profile card " +
      "stands upright with a half-closed clay padlock on its corner and a tiny clay lamp still glowing",
  },
  {
    slug: "lectura-critica-postura",
    semestre: 3,
    escena:
      "A clay reading desk seen slightly from above: a chunky three-step clay staircase rises out of an " +
      "open clay page, the lowest step holding a stubby clay magnifying glass over one line, the middle " +
      "step a fat translucent clay thought-bubble tied to the page by three thin clay threads, and the top " +
      "step a small clay balance scale weighing the page itself; beside the stairs two clay text lines are " +
      "lifted off the paper on thin threads and knotted to a small clay flag planted in the sheet",
  },
  {
    slug: "derechos-digitales",
    semestre: 1,
    escena:
      "A clay office counter seen slightly from above: a rounded clay hand slides a fat clay envelope " +
      "across the counter toward four plain clay letter-boxes standing in a row; on the left half of the " +
      "counter a long clay document scroll lies unrolled, with three of its clay paragraph bars lifted off " +
      "the page and glowing amber while a stubby clay magnifying glass rests over them, and beside the " +
      "scroll a small clay portrait tile sits inside a rounded clay shield",
  },
  {
    slug: "kit-herramientas-digitales",
    semestre: 1,
    escena:
      "A clay school desk seen slightly from above: a rounded clay hand lifts a fat clay file card out of " +
      "a messy heap of blank unlabeled clay cards and drops it into one of four plain clay folders standing " +
      "in a row, while on the left a small clay balance scale tips between two different chunky clay tool " +
      "blocks, a stubby clay notebook block on one pan and a round clay cloud block on the other; along the " +
      "front edge of the desk a thin clay ribbon of arrows links five small clay step tiles in order",
  },
  {
    slug: "temas-ideas-narrativa",
    semestre: 2,
    escena:
      "A clay village doorstep at dusk seen slightly from above: a rounded clay grandmother on a low stool " +
      "tells a story to two small clay listeners, and a thick clay ribbon of story unrolls from her mouth " +
      "across the ground, carrying three chunky clay figures of events — a clay pot spilling coins, an " +
      "empty clay chair, a small clay suitcase; above the ribbon a single fat translucent clay bubble " +
      "floats holding one glowing amber clay shape, tied to the ribbon by three thin clay threads",
  },
  {
    slug: "reescritura-taller",
    semestre: 2,
    escena:
      "A clay writing desk seen slightly from above: a chunky clay sheet of paper lies open with several " +
      "fat clay words lifted off the page and falling into a small clay wastebasket at the left, while a " +
      "rounded clay hand holds a stubby red clay pencil over the remaining lines; on the right side of the " +
      "desk two small clay note cards stand facing each other, one long and one short, joined by a chunky " +
      "clay arrow, and a fat clay counter tile shows a number dropping",
  },
  {
    slug: "procedimientos-narrativos",
    semestre: 2,
    escena:
      "A clay tabletop seen from above with two rows of rounded clay cards, each card carrying a small " +
      "modelled scene instead of any writing: a bicycle, a key, a lamp, a door and a cup; the top row " +
      "sits in one order and the bottom row holds the same five cards in a different order, with chunky " +
      "clay ribbons crossing between the rows, one ribbon looping backwards under an amber clay arrow " +
      "and another leaping forwards over a violet clay arrow, while a small clay hand rests on a tilted card",
  },
  {
    slug: "narrativas-populares-lengua",
    semestre: 2,
    escena:
      "A clay night scene on a village doorstep seen slightly from above: an elderly clay storyteller sits " +
      "on a low stool with a small clay listener at her feet, and a long ribbon of clay speech unrolls from " +
      "her mouth carrying chunky modelled words, four of them raised as fat coloured blocks in amber, green, " +
      "pink and blue; the ribbon falls onto a clay open notebook lying on the ground, where the same words " +
      "rest flat and grey, while a small clay owl watches from the adobe wall behind them",
  },
  {
    slug: "lectura-en-voz-alta",
    semestre: 1,
    escena:
      "A clay classroom seen slightly from above: a small clay student stands holding an open clay sheet " +
      "whose printed lines are interrupted by chunky vertical clay bars, one word modelled as a fat glowing " +
      "amber block and a curved clay arrow rising over the last line; three rounded clay listeners sit on " +
      "low stools facing them and a chunky clay metronome with its arm tilted rests on the floor",
  },
  {
    slug: "taller-descripcion-narracion",
    semestre: 2,
    escena:
      "A clay writing desk seen from above: on the left a fuzzy grey clay blob sharpens into shape as a " +
      "chunky clay magnifying glass passes over it, revealing a tiny detailed lemon tree against a white " +
      "adobe wall; below, five rounded clay tiles descend left to right from a wide landscape tile down to " +
      "a thumb-sized tile holding one small open notebook, joined by a chunky clay arrow",
  },
  {
    slug: "anatomia-exposicion-oral",
    semestre: 1,
    escena:
      "A clay classroom seen slightly from above: a small clay student stands beside a chunky clay easel " +
      "holding one big clay picture board, and on the floor in front of them seven rounded clay cards lie " +
      "in a row joined by chunky clay arrows; on the desk in the foreground sits a fat clay stopwatch whose " +
      "dial is split into four coloured wedges, one much larger than the rest",
  },
  {
    slug: "historia-de-vida-relato",
    semestre: 2,
    escena:
      "A clay tabletop seen from above with six rounded clay cards laid out left to right like a timeline, " +
      "each joined by a chunky clay arrow; the fourth card is tilted and marked with a small orange clay " +
      "spiral and the last card holds a tiny red clay heart; beside them a clay notebook lies open with a " +
      "chunky pencil resting on its blank page",
  },
  {
    slug: "ideas-clave-subrayado",
    semestre: 1,
    escena:
      "A clay open textbook lying flat on a warm wooden desk, three of its paragraph lines underlined with a " +
      "thick green clay stroke and three with a thinner amber stroke while two grey lines are crossed out; " +
      "beside the book stands a small clay tree of three stacked rounded cards joined by chunky branches, the " +
      "top card the largest, and a green clay highlighter rests across the page mid-stroke",
  },
  {
    slug: "lectura-escritura-dialogo",
    semestre: 1,
    escena:
      "A clay desk seen from above with an open book on the left and a small spiral notebook with a chunky " +
      "pencil on the right; a thick rounded clay arrow loops from the book to the notebook and another loops " +
      "back from the notebook to the book, forming a closed circle between them",
  },
  {
    slug: "encuesta-lectora-comunidad",
    semestre: 1,
    escena:
      "A clay schoolyard scene: a clay student holding a clipboard with a checklist interviews three clay " +
      "neighbours, one reading a folded newspaper, one holding a phone, one pointing at a poster taped to a " +
      "fence; behind them a small clay bar chart with three coloured bars rises out of the ground",
  },
  {
    slug: "hecho-opinion-texto",
    semestre: 1,
    escena:
      "A clay tabletop with an open newspaper page lying flat, its paragraph lines modelled in three colours " +
      "— some strips soft blue, some violet, some amber — with a chunky amber clay highlighter resting across " +
      "the page mid-stroke and a small clay magnifying glass beside it over one amber line",
  },
  {
    slug: "biomas-ecosistemas",
    semestre: 3,
    escena:
      "A round clay diorama island split into four quarters like a cake, each quarter a different biome: " +
      "dark green pine trees on snow, a yellow sand dune with a tall cactus, a dense emerald rainforest with " +
      "broad leaves, and a flat golden grassland with a small acacia tree; tiny clay animals stand on each quarter",
  },
  {
    slug: "ciclo-carbono",
    semestre: 3,
    escena:
      "A clay landscape with a leafy green tree on the left, a small factory with a chimney on the right and " +
      "a curl of grey clay smoke, a strip of blue sea in front and dark brown soil underneath showing a buried " +
      "black seam; thick rounded clay arrows loop between the tree, the smoke, the sea and the soil",
  },
  {
    // CS-III-P01, el laboratorio que estaba escrito y sin enganchar. Su
    // lectura A1 analiza la crisis de la pandemia: causas, actores y
    // consecuencias, que es lo que la escena pone sobre la mesa.
    slug: "crisis-sociales",
    semestre: 4,
    escena:
      "A clay tabletop model of a small city street: a shop with its metal shutter rolled down, a low white " +
      "hospital building with a red cross on the wall, and three tiny clay figures standing apart from each " +
      "other — a nurse in blue scrubs, a person carrying a cloth bag of groceries, and a figure behind a small " +
      "lectern; a thick red clay arrow bends downward over the rooftops",
  },
  {
    slug: "subsistemas-terrestres",
    semestre: 3,
    escena:
      "A clay model of the Earth cut open like a wedge on a table, showing four stacked layers: brown rock, " +
      "blue water, a pale translucent shell of air with small white clouds, and a green surface with tiny trees " +
      "and a deer; each layer is a distinct band of coloured clay",
  },
  {
    // PM-VI-P05 (progresión 2): probabilidad clásica frente a frecuentista.
    // El tablero de Galton es el objeto central del laboratorio; el dado y las
    // monedas son los experimentos del modo de Laplace.
    slug: "galton-probabilidad-frecuencia",
    semestre: 6,
    escena:
      "An upright wooden clay Galton board standing on a table: a triangle of small round cream pegs in rows, " +
      "a funnel at the top, and at the bottom a row of narrow slots filled with small blue clay balls whose " +
      "heights rise into a smooth bell-shaped hill, tallest in the middle slot; beside the board sit a large " +
      "white clay die and two round terracotta coins",
  },
  {
    // PM-VI-P10 (progresión 3): conjuntos y diagramas de Venn. La encuesta
    // del ejercicio A2 es de deportes, de ahí los dos balones.
    slug: "conjuntos-venn-3d",
    semestre: 6,
    escena:
      "A flat rectangular clay tray on a table with two large overlapping rings of coloured clay lying in it, " +
      "one soft blue and one soft pink, the shared middle area tinted lilac; small round cream clay counters sit " +
      "inside each ring and in the overlap, and a tiny clay soccer ball and a tiny orange clay basketball rest " +
      "beside the tray",
  },
  {
    // PM-VI-P11 (progresión 4): técnicas de conteo. El podio de tres escalones
    // es la permutación del ejercicio A2; la urna, las extracciones.
    slug: "tecnicas-conteo-3d",
    semestre: 6,
    escena:
      "A small three-step clay winners podium on a table with the tallest step in the middle, three tiny round " +
      "clay figures in pink, blue and yellow standing on the steps; beside it a clear glass jar holding small " +
      "blue clay balls and three golden ones, with one golden ball resting on a little dark pedestal in front",
  },
  {
    // PM-VI-P06 (progresión 11): probabilidad condicional y Bayes. El ejercicio
    // A2 es una prueba diagnóstica; los dos grupos de figuritas son los
    // verdaderos y los falsos positivos.
    slug: "bayes-probabilidad-condicional",
    semestre: 6,
    escena:
      "A white clay test tube rack on a table holding four small glass test tubes, one with a pink cap; in front " +
      "of it two neat groups of tiny round clay figures standing on the table, a tall block of rose pink figures on " +
      "the left and a smaller block of soft blue figures on the right, and a little clay magnifying glass leaning beside them",
  },
  {
    // PM-VI-P12 (progresión 6): independencia y correlación. El ejemplo de la
    // lectura A1 es el helado y los ahogamientos que suben con el calor.
    slug: "correlacion-variables-3d",
    semestre: 6,
    escena:
      "A small square clay board standing upright on a table with a rising diagonal line of round cream clay dots on it, " +
      "like a scatter plot; beside the board a clay ice cream cone with a pink scoop, a tiny blue clay life ring and a " +
      "clay thermometer with a red bulb",
  },
  {
    // PM-VI-P07 (progresión 7): muestreo. El ejercicio A2 reparte una muestra
    // estratificada entre los cuatro grados de una escuela.
    slug: "muestreo-estadistico-3d",
    semestre: 6,
    escena:
      "Four small rectangular groups of tiny round clay figures standing on a clay schoolyard, each group a different " +
      "color (blue, green, violet, pink); a few figures in every group are painted bright yellow and a clay magnifying " +
      "glass leans over the front group",
  },
  {
    // PM-VI-P08 (progresión 8): estadísticas engañosas. La infografía A1 abre
    // con el eje truncado que hace parecer enorme una diferencia pequeña.
    slug: "estadistica-enganosa-3d",
    semestre: 6,
    escena:
      "Two clay bar chart columns on a small clay base, one short grey and one very tall red, with a jagged zigzag break " +
      "cut into the vertical axis beside them; a clay magnifying glass leans against the tall bar and a folded clay " +
      "newspaper lies in front",
  },
  {
    // PM-VI-P01 (progresión 1): tipos de variables, población y muestra. El
    // laboratorio clasifica variables en cuatro contenedores.
    slug: "variables-poblacion-muestra-3d",
    semestre: 6,
    escena:
      "A small clay sorting machine with a branching tube that splits into four open clay boxes colored pink, violet, " +
      "blue and green, a few tiny clay cubes resting inside each box and a clay card with a question mark sliding down " +
      "the top tube",
  },
  {
    slug: "metodo-cientifico-medicion-3d",
    semestre: 1,
    escena:
      "Three small clay flower pots in a row on a dark clay table, each with a green clay seedling of increasing height " +
      "(short, medium, tall) under its own tiny clay desk lamp, and a yellow clay ruler lying in front of the pots",
  },
  {
    slug: "naturaleza-ciencia-3d",
    semestre: 1,
    escena:
      "A small clay balance scale on a dark table with a stack of yellow clay blocks on one pan and a single grey block " +
      "on the other, a white clay swan and a black clay swan standing in front of it, and a tiny clay magnifying glass",
  },
  {
    slug: "agora-ciudadania-3d",
    semestre: 1,
    escena:
      "Claymation diorama of a circular stone plaza with a low wall and an open gate: a diverse crowd of small clay figures, some walking into the plaza toward a clear ballot box while others wait outside the wall, with a row of seated representatives on a raised stand and warm columns behind.",
  },
  {
    slug: "preguntas-pasado-discursos-3d",
    semestre: 4,
    escena:
      "A clay diorama of a cutaway archaeological dig beneath a colorful Mexican street with a blue water truck: stepped brown soil layers each hold a tiny clay artifact (a water pump, a stone canal, a colonial brick arch, a green chinampa with a canoe), and a small clay archaeologist with a glowing lantern stands on the lowest step.",
  },
  {
    slug: "archivo-fuentes-historicas-3d",
    semestre: 6,
    escena:
      "A clay diorama of a historian's archive desk at night: a green banker's lamp lights a yellowed 1938 letter on a wooden reading stand with a brass magnifying glass hovering over it, while behind it a cork board holds pinned documents and a sepia photograph linked by green and red threads.",
  },
  {
    slug: "caverna-conocimiento-3d",
    semestre: 1,
    escena:
      "A small clay cave diorama with a glowing orange clay campfire behind a low clay wall, a clay cube and a clay cylinder on sticks casting two identical square shadows on the back wall, and three tiny clay prisoners sitting in a row facing the wall.",
  },
  {
    slug: "dilema-tranvia-etica-3d",
    semestre: 2,
    escena:
      "A clay diorama of a small yellow tram on curved railway tracks that split into two branches at a big red-knobbed lever, a group of tiny clay workers in orange vests and yellow helmets standing on one branch and a single worker on the other, a little footbridge arching over the tracks in the background.",
  },
  {
    slug: "gustos-opiniones-ingles-3d",
    semestre: 1,
    escena:
      "Clay diorama of a Mexican high-school courtyard fair: striped-awning booths for soccer, video games, books, painting, spicy tacos and karaoke under strings of papel picado, with small clay teenagers near the booths and floating smiley, heart-eyes and frowning emoji faces above their heads, and a little bar chart standing on a stage.",
  },
  {
    slug: "lugares-recomendaciones-ingles-3d",
    semestre: 3,
    escena:
      "A clay diorama of a small Mexican coastal town with a colonial church and a green kiosk in the main square, a crafts market with striped awnings, a waterfall pouring into a natural pool and a beach with kayaks and palm trees, while tiny clay tourists holding a guidebook walk along dirt roads between the places.",
  },
  {
    slug: "terminal-horarios-ingles-3d",
    semestre: 1,
    escena:
      "A clay diorama of a small Mexican bus terminal hall seen from above: a big black departures board with glowing amber rows hangs over rows of blue seats, a smiling clay employee stands behind a white information desk with a blue 'i' sign while a young traveler with a red rolling suitcase asks her a question, and through a glass wall two colorful clay buses wait at numbered gates.",
  },
  {
    slug: "cortesia-conversacion-ingles-3d",
    semestre: 4,
    escena:
      "A clay diorama of a school cafeteria: two teenage clay figures face each other, one smiling and waving hello while the other listens with a friendly nod, a blank white speech bubble floating above them; between their feet three colored clay discs form a little path, and behind them a counter holds trays of colorful food under a green menu board.",
  },
  {
    slug: "mercado-necesidades-ingles-3d",
    semestre: 2,
    escena:
      "A clay diorama of a Mexican street market stall with a bright pink striped awning and papel picado, a smiling vendor behind a wooden table of egg cartons, rice sacks, milk cartons, bread rolls and oranges, with a striped woven shopping bag in front and a community donation box full of blankets and books beside it.",
  },
  {
    slug: "habilidades-permisos-ingles-3d",
    semestre: 2,
    escena:
      "Clay diorama of a small Mexican community center seen from above: a teenage girl swimming in a blue pool while a boy splashes holding the ladder, a boy shooting a basketball on an orange court, and a girl politely asking a librarian for a book beside a sign reading 'No food allowed'.",
  },
  {
    slug: "planes-futuro-ingles-3d",
    semestre: 4,
    escena:
      "A clay diorama of a small Mexican neighborhood where teenagers plant young trees around a plaza kiosk next to a freshly painted basketball court and a school vegetable garden, while a winding path of little calendar pages with colorful flags climbs a hill toward a golden star in the background.",
  },
  {
    slug: "casa-escuela-objetos-ingles-3d",
    semestre: 1,
    escena:
      "A clay diorama of a cheerful classroom corner: a green chalkboard with a chalk circle, square and triangle, a big round red clock and a small square blue clock on the wall, a wooden shelf with boxes of different shapes and colors, and a school lost-and-found counter where a purple backpack and a small red ball sit next to a round teal rug.",
  },
  {
    slug: "relato-secuencia-ingles-3d",
    semestre: 3,
    escena:
      "A clay puppet-theater shelf with red velvet curtains holding six small cut-away diorama rooms like comic panels: a boy sitting up in bed beside a silent red alarm clock, the same boy running out of a yellow kitchen past an untouched breakfast, and a white-and-teal city bus driving away from an empty bus stop while he raises his arms.",
  },
  {
    slug: "ciudad-direcciones-ingles-3d",
    semestre: 2,
    escena:
      "A clay miniature Mexican neighborhood on a grid of streets with crosswalks, a green park with a gazebo in the center, a pharmacy with a green cross, a bank with columns and a church bell tower; a small clay tourist with a backpack stands at a corner with a traffic light while a local points the way down the street.",
  },
  {
    slug: "clima-vestimenta-ingles-3d",
    semestre: 1,
    escena:
      "A clay diorama of a small Mexican neighborhood plaza with a red-roofed kiosk and colorful papel picado, the sky half sunny and half rainy over a tall street thermometer; beside a bus stop, a tall woman in a yellow raincoat, an older woman in a purple sweater and a bearded young man in a wheelchair holding a red umbrella wait together.",
  },
  {
    slug: "rutina-diaria-ingles-3d",
    semestre: 2,
    escena:
      "A clay diorama of a small Mexican neighborhood at sunrise: a cut-away house with a girl sitting up in bed next to a ringing red alarm clock, a white-and-green city bus at a bus stop and a cream-colored school, with a big clay sun rising over rounded hills and a wooden timeline of tiny clock tiles in front.",
  },
  {
    slug: "fision-nuclear-etica-3d",
    semestre: 5,
    escena:
      "Clay diorama of a cutaway boiling-water nuclear reactor vessel glowing soft blue inside, with orange fuel rods and dark control blades rising from below, a small turbine beside it, and on the other side a tiny cell tower on a green hill sending ring-shaped radio waves to a little village.",
  },
  {
    slug: "restauracion-ecosistemas-mexico-3d",
    semestre: 3,
    escena:
      "A clay diorama of a Mexican watershed: a misty green mountain with a spring on one side, a dense jungle on the other, joined by a replanted riverside corridor where a small clay jaguar walks, while a fenced former cattle pasture in front sprouts young pioneer trees and a little fishing village with colourful boats rests by a turquoise lagoon.",
  },
  {
    slug: "estimacion-fermi-3d",
    semestre: 1,
    escena:
      "A cozy clay classroom corner where a clear glass cube is filled with tiny blue clay marbles beside a burlap sack of golden corn kernels on a vintage scale, with a wooden ruler marked in powers of ten lying in front; soft warm light, handcrafted claymation look.",
  },
  {
    slug: "viaje-paquete-internet-3d",
    semestre: 1,
    escena:
      "Clay diorama of a tiny smartphone on a wooden desk sending a stream of glowing cube-shaped data packets along a fiber-optic cable that dips under a sculpted blue ocean to a small server building with blinking lights, with a little recycling bin holding an old phone beside the desk.",
  },
  {
    slug: "software-libre-3d",
    semestre: 1,
    escena:
      "A clay diorama of a small dark software box on a round table, four square lids on top, two flipped open glowing green and pink with floating gem shapes, two shut with little red clay padlocks, while a tiny projector beside it beams a translucent panel of code lines, soft studio lighting.",
  },
  {
    slug: "jerarquia-operaciones-3d",
    semestre: 1,
    escena:
      "A chunky clay tower of rounded number and operator tiles arranged in descending rows on a dark grid chalkboard, where pairs of tiles fuse through translucent glowing funnels into a single tile on the row below, ending in one bright green result tile; beside it stands a small four-step clay staircase in blue, purple, yellow and pink.",
  },
  {
    slug: "alcance-publicacion-3d",
    semestre: 6,
    escena:
      "Clay diorama of a small Mexican town plaza at dusk: a tiny radio tower, a smartphone and a paper poster in the center send glowing colored threads to little clay houses, a school and a market around it, where clay people light up as the message reaches them, one holding a white cane and one with a hearing aid.",
  },
  {
    slug: "centro-datos-huella-nube-3d",
    semestre: 1,
    escena:
      "Clay diorama of a cutaway data center building on dry highland terrain: two rows of dark server racks with tiny glowing green lights, a cooling tower releasing a white plume of water vapor beside a small blue water tank, and in the foreground a giant smartphone sending colorful little cubes toward a rural village where a few clay people hold phones.",
  },
  {
    slug: "estudio-edicion-digital-3d",
    semestre: 6,
    escena:
      "Clay diorama of a high-school student's editing desk: a large 3D grid of colorful clay pixel cubes forming a sunset park picture, beside it a transparent stack of layered clay poster sheets with bold text and a small film strip curling toward a tiny projector screen.",
  },
  {
    slug: "logica-compuertas-3d",
    semestre: 1,
    escena:
      "A clay diorama of a small green circuit board on a school desk: two chunky toggle switches wired with glowing yellow cables into a rounded blue AND logic gate, which feeds a big glowing light bulb, with little V and F tiles scattered beside a paper truth table.",
  },
  {
    slug: "quimica-organica-industria-3d",
    semestre: 4,
    escena:
      "Clay-style diorama of a chunky ball-and-stick aspirin molecule on a lab bench, a clay hand pulling a glowing green bond into place, beside a tablet, a banana-flavored candy and a clear PET soda bottle made of clay.",
  },
  {
    slug: "descubrimiento-celula-3d",
    semestre: 6,
    escena:
      "Claymation diorama of a 17th-century brass-and-leather compound microscope beside an oil lamp and a water-filled glass globe focusing light onto a thin slice of cork, with a large circular eyepiece view floating nearby showing a honeycomb of tiny cork cells; warm soft studio lighting, handcrafted clay textures.",
  },
  {
    slug: "innovaciones-ambientales-3d",
    semestre: 3,
    escena:
      "Clay diorama of a Mexican coastline cross-section: a small concrete house with a rooftop rain gutter feeding a blue water tank, a gravel constructed wetland planted with cattails beside it, and a band of mangrove trees on stilt roots standing in shallow turquoise water as a rounded foamy wave breaks against them.",
  },
  {
    slug: "contaminantes-plasticos-3d",
    semestre: 4,
    escena:
      "A clay diorama cross-section of a sunny beach meeting a blue sea: a crumpled clay plastic bag on the sand crumbling into tiny colorful crumbs, a clear bottle sinking to the dark seabed, and on the right a small stepped tower of clay discs with plankton, sardines, a tuna and a seabird on top, sprinkled with glowing red dots that grow denser toward the top.",
  },
  {
    slug: "tipos-energia-aplicaciones-3d",
    semestre: 2,
    escena:
      "A clay diorama split in two: on the left a stormy hillside with a lightning bolt striking beside a tiny volcano puffing ash and a green plant under a bright sun; on the right a white wind turbine, a small solar panel and a geothermal cooling tower releasing steam, with glowing colored ribbons of energy flowing from each natural phenomenon to its matching machine.",
  },
  {
    slug: "energias-renovables-mexico-3d",
    semestre: 2,
    escena:
      "Soft matte plasticine clay diorama of a map of Mexico raised like a little island on a blue clay sea: tiny white wind turbines on the southern isthmus, a patch of blue solar panels in the northern desert, a small concrete dam with blue water in the south, two white dome reactor buildings on the Gulf coast and a grey smokestack puffing clay smoke, with a small steaming geothermal plant among green volcano cones.",
  },
  {
    slug: "hidrosfera-atmosfera-3d",
    semestre: 3,
    escena:
      "Clay-style diorama of a cutaway slice of Earth's sky and sea: a tall glass column of colored atmospheric layers with a yellow weather balloon rising past a thin green ozone band, above a cross-section of blue ocean where a small research ship lowers a sensor through warm orange surface water into deep cold blue water.",
  },
  {
    slug: "oxigenacion-atmosfera-3d",
    semestre: 3,
    escena:
      "A clay diorama cross-section of an ancient shallow sea: green-capped layered stromatolite mounds release tiny oxygen bubbles, while a dark hydrothermal vent puffs pale green iron particles that turn rust-red and settle into red and grey banded layers on the seafloor, under a hazy orange sky giving way to blue.",
  },
  {
    slug: "consumo-energetico-hogar-3d",
    semestre: 2,
    escena:
      "A clay diorama of a small Mexican house cut open like a dollhouse, with a glowing refrigerator, a TV and warm hanging light bulbs inside and a black water tank on the flat roof, connected by power lines on steel towers to a small coal power plant with a steaming cooling tower, while a big translucent CO2 bubble floats above the house.",
  },
];

interface Grafo { [k: string]: { class_type: string; inputs: Record<string, unknown> } }

function grafo(texto: string, prefijo: string, seed: number): Grafo {
  return {
    "1": { class_type: "UNETLoader", inputs: { unet_name: UNET, weight_dtype: "default" } },
    "2": { class_type: "CLIPLoader", inputs: { clip_name: CLIP, type: "krea2", device: "default" } },
    "3": { class_type: "VAELoader", inputs: { vae_name: VAE } },
    "4": { class_type: "CLIPTextEncode", inputs: { clip: ["2", 0], text: texto } },
    "5": { class_type: "ConditioningZeroOut", inputs: { conditioning: ["4", 0] } },
    "6": { class_type: "EmptyLatentImage", inputs: { width: ANCHO, height: ALTO, batch_size: 1 } },
    "7": {
      class_type: "KSampler",
      inputs: {
        model: ["1", 0], positive: ["4", 0], negative: ["5", 0], latent_image: ["6", 0],
        seed, steps: 8, cfg: 1.0, sampler_name: "er_sde", scheduler: "simple", denoise: 1.0,
      },
    },
    "8": { class_type: "VAEDecode", inputs: { samples: ["7", 0], vae: ["3", 0] } },
    "15": { class_type: "SaveImage", inputs: { images: ["8", 0], filename_prefix: prefijo } },
  };
}

const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Semilla estable por slug: relanzar da la MISMA imagen. */
function semillaDe(slug: string): number {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) { h ^= slug.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0) % 2 ** 31;
}

async function unaPasada(texto: string, slug: string): Promise<Buffer> {
  const envio = await fetch(`${HOST}/prompt`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ prompt: grafo(texto, `lab-${slug}`, semillaDe(slug)) }),
  });
  if (!envio.ok) throw new Error(`ComfyUI rechazó el grafo (${envio.status}): ${(await envio.text()).slice(0, 200)}`);
  const { prompt_id } = (await envio.json()) as { prompt_id: string };

  for (let i = 0; i < 120; i++) {
    await dormir(1500);
    const h = (await (await fetch(`${HOST}/history/${prompt_id}`)).json()) as Record<string, {
      status?: { status_str?: string };
      outputs?: Record<string, { images?: Array<{ filename: string; subfolder?: string; type?: string }> }>;
    }>;
    const registro = h[prompt_id];
    if (!registro) continue;
    if (registro.status?.status_str === "error") {
      throw new Error(`ComfyUI falló: ${JSON.stringify(registro.status).slice(0, 200)}`);
    }
    const img = registro.outputs?.["15"]?.images?.[0];
    if (!img) continue;
    const url = `${HOST}/view?filename=${encodeURIComponent(img.filename)}`
      + `&subfolder=${encodeURIComponent(img.subfolder ?? "")}&type=${img.type ?? "output"}`;
    return Buffer.from(await (await fetch(url)).arrayBuffer());
  }
  throw new Error(`la carátula "${slug}" no salió en tres minutos`);
}

/** ComfyUI tira la conexión al cargar el modelo o liberar VRAM; se reintenta. */
async function generar(texto: string, slug: string, intentos = 3): Promise<Buffer> {
  for (let i = 1; ; i++) {
    try { return await unaPasada(texto, slug); }
    catch (e) {
      if (i >= intentos) throw e;
      console.log(`    intento ${i} falló (${(e as Error).message.slice(0, 80)}); reintentando…`);
      await dormir(4000);
    }
  }
}

async function main() {
  const dry = process.argv.includes("--dry");
  const rehacer = process.argv.includes("--rehacer");
  const solo = process.argv.find((a) => a.startsWith("--solo="))?.slice(7);
  const lista = PENDIENTES.filter((c) => !solo || c.slug === solo);

  if (dry) {
    for (const c of lista) console.log(`${c.slug} (sem${c.semestre})\n   ${c.escena}\n`);
    console.log(`${lista.length} carátulas. Nada escrito.`);
    return;
  }

  let hechas = 0;
  const fallos: string[] = [];
  for (const c of lista) {
    const dirRel = `media/sem${c.semestre}/labs`;
    const destino = resolve(PUBLIC_DIR, dirRel, `${c.slug}.webp`);
    if (existsSync(destino) && !rehacer) { console.log(`  = ${c.slug}: ya existe`); continue; }
    try {
      const png = await generar(`${c.escena}. ${ESTILO}`, c.slug);
      mkdirSync(resolve(PUBLIC_DIR, dirRel), { recursive: true });
      await sharp(png).resize({ width: ANCHO_WEBP, withoutEnlargement: true })
        .webp({ quality: CALIDAD }).toFile(destino);
      hechas++;
      console.log(`  ✓ ${c.slug} → /${dirRel}/${c.slug}.webp`);
    } catch (e) {
      fallos.push(`${c.slug}: ${(e as Error).message.slice(0, 100)}`);
    }
  }

  console.log(`\ngeneradas ${hechas}  fallos ${fallos.length}`);
  for (const f of fallos) console.log(`  FALLO ${f}`);
  if (hechas > 0) {
    console.log("\nFalta registrarlas en src/lib/practicas/lab-imagenes.ts:");
    for (const c of lista) console.log(`  LABS_CON_IMAGEN_ESPECIFICA_SEM${c.semestre} ← "${c.slug}"`);
  }
  if (fallos.length) process.exit(1);
}

main().catch((err) => { console.error("ERROR:", err.message); process.exit(1); });
