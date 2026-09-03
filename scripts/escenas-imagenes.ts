/**
 * LA ESCENA QUE HAY QUE DIBUJAR PARA CADA ACTIVIDAD.
 *
 * POR QUÉ EXISTE ESTE ARCHIVO Y NO SE DERIVA DEL TÍTULO. Se probó primero pasarle
 * el título en español directamente al modelo, confiando en que el encoder
 * `qwen3vl` es multilingüe. Las tres imágenes de prueba salieron IDÉNTICAS entre
 * sí: seis bultos de plastilina sobre un fondo liso. El modelo aplicó la ficha de
 * estilo y descartó el sujeto, porque "Comunicación digital: alcance y medios de
 * transmisión" no nombra ningún objeto que se pueda poner en una mesa.
 *
 * Lo que el modelo sí dibuja es una escena FÍSICA: qué objetos hay, cómo están
 * puestos y qué está pasando entre ellos. Traducir cada tema a esa escena es una
 * decisión pedagógica —qué imagen explica esta idea— y por eso se escribe a mano,
 * una por una, y no se genera.
 *
 * REGLAS QUE SIGUEN TODAS:
 *   · objetos concretos y contables, nunca conceptos abstractos;
 *   · una sola idea por imagen, centrada, con espacio alrededor;
 *   · NADA de texto, letras ni cifras: el modelo las inventa ilegibles y además
 *     la app ya escribe el título con tipografía de verdad encima;
 *   · contexto mexicano cuando el tema lo permite (nopal, Metro, volcán, milpa).
 *
 * La ficha de estilo NO va aquí: la pega `generar-imagenes-faltantes.ts` al final
 * de cada escena, para que las 2 230 imágenes de la plataforma parezcan de la
 * misma serie.
 */

export const ESCENAS: Record<string, string> = {
  // ── Conciencia Histórica ──────────────────────────────────────────────────
  "CH-I-P02-A5": "A long clay ribbon winding across a table like a river of time, with three small milestone stones standing on it at different points, each stone a different colour, and a tiny magnifying glass resting beside the middle one",
  "CH-I-P03-A4": "A row of falling dominoes made of clay, the first one tipped by a small hand, with one domino in the middle painted a different colour to mark the turning point",
  "CH-II-P02-A1": "An old wooden desk with a rolled parchment, a quill, a wax seal and a magnifying glass lying over a folded map, all modelled in clay",
  "CH-II-P03-A1": "A clay hourglass standing between two small scenes: on one side an old adobe house, on the other a modern city block, connected by a thin path",
  "CH-III-P01-A4": "A balance scale made of clay with a stack of old documents on one pan and a single photograph on the other, a magnifying glass leaning against the base",
  "CD-III-P01-A2": "A clay smartphone, a satellite dish and a radio tower standing together on a small round base, with soft concentric rings of clay spreading outward from the tower",
  "CD-III-P03-A4": "A clay workbench with a laptop, a small robot arm and a hard hat, and two figures of different heights standing side by side behind it",

  // ── CNEyT II — energía y termodinámica ────────────────────────────────────
  "CNEYT-II-P01-A1": "A small clay diorama with a lit light bulb, a spinning windmill, a campfire and a stretched spring arranged in a semicircle on a round base",
  "CNEYT-II-P02-A1": "A clay chain of three linked objects: a waterfall pouring onto a wheel, the wheel turning a belt, the belt lighting a bulb",
  "CNEYT-II-P03-A1": "A clay cylinder with a piston, a small flame underneath and a puff of steam escaping from the top",
  "CNEYT-II-P05-A1": "A clay figure pulling a heavy crate up a ramp with a rope, a thick arrow of clay along the ramp showing the direction of the pull",
  "CNEYT-II-P09-A1": "A transparent-looking clay box filled with small round beads bouncing, a piston pressing from above and a thermometer standing beside it",
  "CNEYT-II-P10-A1": "Two clay containers side by side: one with beads neatly stacked in rows, the other with the same beads scattered loose, an arrow of clay pointing from the tidy one to the messy one",
  "CNEYT-II-P11-A2": "A clay metal bar with one end glowing warm orange and the other cool blue, small clay arrows travelling along the bar from the warm end to the cold one",

  // ── CNEyT III — Tierra y ecosistemas ──────────────────────────────────────
  "CNEYT-III-P02-A1": "A clay pyramid built of four stacked layers, with a small plant on the bottom layer, a rabbit above it, a fox above that and an eagle at the top",
  "CNEYT-III-P02-A2": "A clay stepped pyramid of three levels with a thick arrow of clay entering the base and progressively thinner arrows leaving each higher level",
  "CNEYT-III-P03-A1": "A single large clay leaf on a stem, with a small sun above it, a drop of water below and soft bubbles rising from the leaf surface",
  "CNEYT-III-P06-A1": "A clay diorama split down the middle: on one side a small green forest with trees, on the other bare tree stumps and a smoking chimney",
  "CNEYT-III-P09-A2": "A clay balance scale with small ball-and-stick molecule models on both pans, perfectly level",

  // ── CNEyT IV — química ────────────────────────────────────────────────────
  "CNEYT-IV-P01-A2": "A clay laboratory bench with two flasks connected by a bent tube, coloured liquid in each, and a balance scale behind them holding equal clay spheres",
  "CNEYT-IV-P04-A1": "A cluster of clay ball-and-stick molecule models of different chain lengths standing upright on a wooden lab tray",
  "CNEYT-IV-P09-A2": "A clay battery cell with two metal strips dipped in a beaker of liquid, connected by wires to a small glowing bulb",
  "CNEYT-IV-P10-A2": "A clay seesaw perfectly balanced, with two small groups of molecule models sitting on each end and tiny arrows curving in both directions between them",
  "CNEYT-IV-P11-A2": "A clay cell cross-section with a bean-shaped mitochondrion inside it, small round sugar beads entering on one side and tiny energy tokens leaving on the other",

  // ── CNEyT V — física ──────────────────────────────────────────────────────
  "CNEYT-V-P02-A2": "A small clay car on a straight road, with three ghost copies of the car spaced increasingly far apart behind it to show it speeding up",
  "CNEYT-V-P03-A2": "A clay planet with a smaller moon orbiting it on a thin curved clay track, and an apple falling beside them",
  "CNEYT-V-P07-A2": "A clay circuit board with a coil of wire, a horseshoe magnet and a small electric motor with a spinning shaft",
  "CNEYT-V-P09-A2": "A clay U-shaped tube half filled with coloured liquid, a small boat floating in a clay basin beside it and a syringe pressing on the tube",

  // ── CNEyT VI — biología ───────────────────────────────────────────────────
  "CNEYT-VI-P01-A1": "A clay glass flask with a spark of lightning inside it, standing in a shallow pool of primordial water with volcanic rocks around it",
  "CNEYT-VI-P03-A2": "A clay bean-shaped mitochondrion cut open to show folded inner walls, with tiny round tokens streaming out of it",
  "CNEYT-VI-P04-A1": "A clay double helix ladder standing upright, with a small ribbon strand unwinding from it and a tiny bead chain forming beside it",
  "CNEYT-VI-P05-A2": "A clay square divided into four smaller squares by raised ridges, with a small round seed of a different colour sitting in each quarter",
  "CNEYT-VI-P06-A1": "A clay double helix with one single rung painted a bright contrasting colour, and a small magnifying glass hovering over that rung",
  "CNEYT-VI-P09-A2": "A round clay cell in the middle of splitting into two, with thread-like fibres pulling small paired rods toward opposite ends",

  // ── Ciencias Sociales ─────────────────────────────────────────────────────
  "CS-II-P01-A4": "A clay market stall with a basket of bread, a jug of water, a small house and a book arranged neatly on the counter",
  "CS-II-P02-A4": "A ring of clay figures of different heights and colours holding hands, with one figure standing apart outside the ring",
  "CS-II-P03-A4": "A clay factory building with a conveyor belt carrying identical boxes, and three stacks of boxes of very different heights beside it",
  "CS-II-P04-A4": "A clay staircase of three steps with a figure standing on each step at a different height, the highest one holding a small flag",
  "CS-III-P02-A4": "A clay town square with a public building, a ballot box and several small figures forming a line in front of it",
  "CS-III-P03-A4": "A group of young clay figures sitting in a circle on the floor with a megaphone and a rolled banner in the middle",

  // ── Inglés ────────────────────────────────────────────────────────────────
  "IN-II-P05-A4": "Two clay pencils of clearly different lengths standing side by side on a desk, next to two clay cups of different sizes",
  "IN-III-P01-A4": "A clay wall calendar with one page torn off and floating away, a small clock beside it with hands pointing backwards",
  "IN-III-P05-A1": "A clay traffic sign post with three small round signs on it, one showing an open hand, one a crossed circle and one an exclamation shape",
  "IN-IV-P04-A1": "Two clay figures sitting at a small table, one leaning forward with a hand raised in a gesture of advice, a steaming cup between them",
  "IN-V-P02-A4": "Two clay figures on a bench, one gesturing while telling a story, a small photo album open on their laps",
  "IN-V-P03-A4": "Two clay figures facing each other with a large clay question mark shape standing on the table between them",

  // ── Lengua y Comunicación ────────────────────────────────────────────────
  "LC-II-P04-A4": "A clay open book lying flat with a tiny village of small houses and two small figures rising out of its pages like a pop-up",
  "LC-III-P02-A2": "Three clay books of different colours and styles standing in a row on a shelf, each with a distinct decorative spine",
  "LC-III-P03-A1": "Three clay objects arranged in a triangle on a table: an open book, a lyre and a theatre mask",
  "LC-III-P04-A1": "A clay open book with a small magnifying glass, a tiny rocket and a withered leaf resting on its pages",
  "LC-III-P05-A1": "A clay lyre with strings, a quill pen and a small cloud shaped like a bird floating just above them",
  "LC-III-P06-A1": "A clay open book on a desk with a pair of reading glasses, a red pencil and a small stack of sticky notes beside it",
  "LC-III-P07-A1": "A clay lectern with a microphone facing three rows of small empty chairs, a glass of water on the lectern shelf",

  // ── Pensamiento Filosófico y Humanidades ─────────────────────────────────
  "PFH-II-P03-A1": "A clay balance scale with a small DNA helix on one pan and a heart shape on the other, a stethoscope curled around the base",
  "PFH-III-P01-A1": "Three clay building blocks stacked into an arch, with a fourth block lying broken on the ground beside the arch",

  // ── Pensamiento Matemático II — álgebra ──────────────────────────────────
  "PM-II-P01-A2": "A row of clay tile patterns growing in size step by step, each arrangement made of small square tiles, on a light table",
  "PM-II-P02-A2": "Clay algebra tiles of three sizes — a large square, a long rectangle and a small square — grouped into two neat piles on a desk",
  "PM-II-P03-A2": "A large clay rectangle split into four coloured pieces that fit together like a puzzle, one piece lifted slightly out of place",
  "PM-II-P07-A8": "A clay balance scale with grouped algebra tiles on each pan, one tile being moved by a small hand",
  "PM-II-P08-A8": "A clay square divided into four rectangles of different sizes by two crossing ridges, each region a different colour",
  "PM-II-P09-A8": "A clay balance scale perfectly level, with an identical stack of three cubes on each pan",

  // ── Pensamiento Matemático III ────────────────────────────────────────────
  "PM-III-P01-A2": "A clay right triangle standing on a table with a small square block sitting on each of its three sides, the largest square on the longest side",
  "PM-III-P02-A2": "A clay ball at the top of a smooth curved arc track, the arc dipping down and rising again, with two small markers where it touches the base",
  "PM-III-P03-A2": "Three clay parabola arcs standing side by side on a base line: one crossing the line twice, one just touching it, one floating above it",
  "PM-III-P04-A2": "A clay cylindrical water tank on a small stand, with a measuring tape wrapped around it and a bucket beneath the tap",
  "PM-III-P05-A2": "A tall clay tree casting a long shadow next to a short stick casting a short shadow, both on flat ground with the sun low",
  "PM-III-P06-A2": "A clay figure throwing a ball, with the ball's arc traced by small evenly spaced clay spheres rising and falling",
  "PM-III-P07-A2": "A clay balance scale with a wrapped mystery box on one pan and several small weights on the other",
  "PM-III-P08-A2": "Two long clay rods crossing each other at a single point above a flat grid board",
  "PM-III-P09-A2": "A clay balance scale tipped clearly to one side, with a shaded clay region marked on the table beneath the lower pan",
  "PM-III-P10-A2": "A straight clay rod resting on a flat grid board at a slope, with two small marker beads on it and a right-angle wedge beneath showing the rise and run",

  // ── Pensamiento Matemático IV ─────────────────────────────────────────────
  "PM-IV-P01-A2": "A clay machine box with a funnel on top and a spout below, small numbered beads dropping in and different beads coming out",
  "PM-IV-P02-A2": "A clay football in mid air above a small pitch, its flight traced by a smooth arc of tiny clay spheres",
  "PM-IV-P03-A2": "A tall clay tree with a small figure at its base holding a measuring instrument, a thin clay line running from the instrument to the treetop",
  "PM-IV-P04-A2": "A clay ring lying flat on a table with a thin rod from its centre to the rim, and a small bead where the rod meets the ring",
  "PM-IV-P05-A2": "A clay triangular plot of land marked with small boundary stones at each corner and a measuring tape along two of its sides",
  "PM-IV-P06-A2": "Two small clay markers on a flat grid board joined by a straight taut string, with a third marker exactly halfway along it",
  "PM-IV-P08-A2": "A clay parabolic satellite dish on a stand, with a small receiver at its focus and soft concentric rings of clay approaching from the sky",
  "PM-V-P01-A2": "A clay path leading to a small gap, with a figure stepping ever closer to the edge in three ghost positions but never crossing",
  "PM-V-P02-A2": "Three clay ribbons laid side by side on a table: one continuous, one with a small hole punched out, one broken into two offset pieces",
  "PM-V-P03-A2": "A clay curve arc with a straight rod resting on it touching at exactly one point, and a small triangle wedge beneath the rod",
  "PM-V-P04-A2": "A clay toolbox open on a workbench with several differently shaped clay tools laid out in a row beside a curved rail",
  "PM-V-P05-A2": "A clay wave ribbon and a steeply rising clay ramp standing side by side on a base board",
  "PM-V-P06-A2": "A clay hill-and-valley landscape strip with small flags planted at the highest peak, the lowest dip and the point where the slope changes",
  "PM-V-P07-A2": "A clay sheet of material with a rectangular pen being marked out beside an existing wall, a roll of fencing lying next to it",
  "PM-V-P08-A2": "A clay measuring caliper holding a small sphere, with a tiny sliver of a different colour marking a small error margin",
  "PM-V-P09-A2": "A clay S-shaped curve ribbon standing upright on a base, with three small beads marking where it crosses the base line",
  "PM-V-P10-A2": "A clay ramp with the triangular area beneath it filled in with a solid coloured wedge, and a small car at the top of the ramp",

  // ── Pensamiento Matemático VI — estadística ───────────────────────────────
  "PM-VI-P02-A2": "A clay tally board with small beads sorted into five labelled bins of different heights on a wooden tray",
  "PM-VI-P03-A2": "A row of clay blocks of different heights on a table, with a small flag on the tallest one and a level bar laid across the whole row",
  "PM-VI-P04-A2": "A row of clay beads spread widely on one side of a table and clustered tightly on the other, with a measuring stick between the two groups",
  "PM-VI-P09-A2": "A smooth clay bell-shaped mound on a flat base, with a thin marker rod at its peak and two shorter rods symmetrically on each slope",
};
